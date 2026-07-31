#!/usr/bin/env node

import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import {
  CliError,
  parseArgs,
  parseChoice,
  parseCsv,
  parseInteger,
  printHelp,
  runCli,
} from "./lib/cli.mjs";
import {
  assertDifferentPaths,
  assertOutputsAvailable,
  commitTempFile,
  hashFile,
  makeTempSibling,
  mediaTypeFor,
  relativeToRepo,
  removeIfPresent,
  requireFile,
} from "./lib/files.mjs";
import {
  findFfmpeg,
  formatCommand,
  runExternal,
  toRunnable,
} from "./lib/external-tools.mjs";

const HELP = `
Transcode a motion master into web-compatible MP4/H.264 and WebM/VP9 files.

Usage:
  node scripts/transcode-video.mjs <input> --output-dir <directory> [options]

Options:
  --output-dir <dir>       Required destination for generated files.
  --formats <list>         mp4, webm, or both (default: mp4,webm).
  --name <base-name>       Output base; derived from the input by default.
  --max-width <pixels>     Downscale wider sources without upscaling.
  --fps <rate>             Set output frame rate (1-120).
  --mp4-crf <0-51>         H.264 constant-rate factor (default: 22).
  --webm-crf <0-63>        VP9 constant-rate factor (default: 32).
  --audio                  Preserve audio (default output is intentionally silent).
  --ffmpeg <path>          Explicit FFmpeg executable; HOUSE_ADEL_FFMPEG also works.
  --force                  Explicitly replace existing generated files.
  --dry-run, -n            Resolve FFmpeg and print commands without transcoding.
  --json                   Print machine-readable results.
  --help, -h               Show this help.

FFmpeg is searched on PATH and in common WinGet, Chocolatey, Scoop, Homebrew,
and system locations. Each encode is written to a temporary sibling and moved
into place only after FFmpeg succeeds.
`;

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function outputArguments({
  format,
  inputPath,
  tempPath,
  force,
  maxWidth,
  fps,
  mp4Crf,
  webmCrf,
  audio,
}) {
  const filters = [];
  if (maxWidth) {
    filters.push(`scale=trunc(min(${maxWidth}\\,iw)/2)*2:-2`);
  }
  if (fps) {
    filters.push(`fps=${fps}`);
  }

  const args = [
    force ? "-y" : "-n",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-i",
    inputPath,
    "-map",
    "0:v:0",
  ];
  if (audio) {
    args.push("-map", "0:a?");
  } else {
    args.push("-an");
  }
  if (filters.length > 0) {
    args.push("-vf", filters.join(","));
  }
  args.push("-map_metadata", "-1", "-map_chapters", "-1");

  if (format === "mp4") {
    args.push(
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      String(mp4Crf),
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
    );
    if (audio) {
      args.push("-c:a", "aac", "-b:a", "128k");
    }
  } else {
    args.push(
      "-c:v",
      "libvpx-vp9",
      "-crf",
      String(webmCrf),
      "-b:v",
      "0",
      "-row-mt",
      "1",
      "-deadline",
      "good",
      "-cpu-used",
      "2",
    );
    if (audio) {
      args.push("-c:a", "libopus", "-b:a", "96k");
    }
  }

  args.push(tempPath);
  return args;
}

async function main() {
  const { options, positionals } = parseArgs(process.argv.slice(2), {
    help: { type: "boolean", alias: "h" },
    outputDir: { long: "output-dir" },
    formats: { default: "mp4,webm" },
    name: {},
    maxWidth: { long: "max-width" },
    fps: {},
    mp4Crf: { long: "mp4-crf", default: "22" },
    webmCrf: { long: "webm-crf", default: "32" },
    audio: { type: "boolean", default: false },
    ffmpeg: {},
    force: { type: "boolean", default: false },
    dryRun: { long: "dry-run", type: "boolean", alias: "n", default: false },
    json: { type: "boolean", default: false },
  });

  if (options.help) {
    printHelp(HELP);
    return;
  }
  if (positionals.length !== 1) {
    throw new CliError("Provide exactly one input video. Use --help for usage.");
  }
  if (!options.outputDir) {
    throw new CliError("--output-dir is required.");
  }

  const inputPath = await requireFile(positionals[0], "Input video");
  const formats = [
    ...new Set(
      parseCsv(options.formats, "--formats").map((format) =>
        parseChoice(format.toLowerCase(), "--formats", ["mp4", "webm"]),
      ),
    ),
  ];
  const maxWidth = options.maxWidth
    ? parseInteger(options.maxWidth, "--max-width", { min: 2, max: 16384 })
    : null;
  const fps = options.fps
    ? parseInteger(options.fps, "--fps", { min: 1, max: 120 })
    : null;
  const mp4Crf = parseInteger(options.mp4Crf, "--mp4-crf", { min: 0, max: 51 });
  const webmCrf = parseInteger(options.webmCrf, "--webm-crf", {
    min: 0,
    max: 63,
  });
  const baseName =
    options.name ?? slugify(path.basename(inputPath, path.extname(inputPath)));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(baseName)) {
    throw new CliError(
      "--name must contain only lowercase ASCII letters, numbers, and single hyphens.",
    );
  }

  const outputDirectory = path.resolve(options.outputDir);
  const plans = formats.map((format) => {
    const outputPath = path.join(outputDirectory, `${baseName}.${format}`);
    return {
      format,
      outputPath,
      tempPath: makeTempSibling(outputPath),
    };
  });
  await assertDifferentPaths(
    inputPath,
    plans.map((plan) => plan.outputPath),
  );
  await assertOutputsAvailable(
    plans.map((plan) => plan.outputPath),
    options.force,
  );

  const ffmpegPath = await findFfmpeg(options.ffmpeg);
  if (!ffmpegPath) {
    throw new CliError(
      "FFmpeg was not found. Install it separately, set HOUSE_ADEL_FFMPEG, " +
        "or pass --ffmpeg with the executable path.",
      1,
    );
  }
  const runnable = await toRunnable(ffmpegPath);
  const commands = plans.map((plan) => ({
    ...plan,
    args: outputArguments({
      ...plan,
      inputPath,
      force: options.force,
      maxWidth,
      fps,
      mp4Crf,
      webmCrf,
      audio: options.audio,
    }),
  }));

  if (options.dryRun) {
    const result = {
      input: relativeToRepo(inputPath),
      ffmpeg: ffmpegPath,
      audio: options.audio,
      outputs: commands.map((command) => ({
        path: relativeToRepo(command.outputPath),
        command: formatCommand(runnable, command.args),
      })),
      dryRun: true,
    };
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Dry run with FFmpeg: ${ffmpegPath}`);
      for (const command of commands) {
        console.log(`  ${formatCommand(runnable, command.args)}`);
        console.log(`  final -> ${relativeToRepo(command.outputPath)}`);
      }
    }
    return;
  }

  await mkdir(outputDirectory, { recursive: true });
  try {
    for (const command of commands) {
      await runExternal(runnable, command.args);
    }
    for (const command of commands) {
      await commitTempFile(command.tempPath, command.outputPath, options.force);
    }
  } catch (error) {
    await Promise.all(commands.map((command) => removeIfPresent(command.tempPath)));
    throw error;
  }

  const outputs = [];
  for (const command of commands) {
    const details = await stat(command.outputPath);
    outputs.push({
      path: relativeToRepo(command.outputPath),
      mediaType: mediaTypeFor(command.outputPath),
      bytes: details.size,
      sha256: await hashFile(command.outputPath),
    });
  }
  const result = {
    input: relativeToRepo(inputPath),
    ffmpeg: ffmpegPath,
    audio: options.audio,
    outputs,
  };
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Generated ${outputs.length} video variant(s):`);
    for (const output of outputs) {
      console.log(`  ${output.bytes} B  ${output.path}`);
    }
  }
}

await runCli(main);
