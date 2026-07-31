#!/usr/bin/env node

import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  CliError,
  parseArgs,
  parseChoice,
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
Extract a deterministic static poster from a video master using FFmpeg.

Usage:
  node scripts/extract-poster.mjs <input> --output <poster> [options]

Options:
  --output, -o <path>       Required .jpg, .png, or .webp destination.
  --time <timestamp>        Seek time in seconds or HH:MM:SS.mmm (default: 0).
  --max-width <pixels>      Downscale wider frames without upscaling.
  --quality <1-100>         JPEG/WebP quality (default: 88).
  --ffmpeg <path>           Explicit FFmpeg executable; HOUSE_ADEL_FFMPEG also works.
  --force                   Explicitly replace an existing poster.
  --dry-run, -n             Resolve FFmpeg and print the command only.
  --json                    Print machine-readable results.
  --help, -h                Show this help.

The output is rendered to a temporary sibling and moved into place only after
FFmpeg succeeds. Use the resulting hash and dimensions when updating a manifest.
`;

function validateTimestamp(value) {
  if (/^\d+(?:\.\d+)?$/.test(value)) {
    return value;
  }
  if (/^(?:\d{1,3}:)?[0-5]?\d:[0-5]\d(?:\.\d+)?$/.test(value)) {
    return value;
  }
  throw new CliError(
    '--time must be non-negative seconds or a timestamp such as "00:00:02.500".',
  );
}

async function main() {
  const { options, positionals } = parseArgs(process.argv.slice(2), {
    help: { type: "boolean", alias: "h" },
    output: { alias: "o" },
    time: { default: "0" },
    maxWidth: { long: "max-width" },
    quality: { default: "88" },
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
  if (!options.output) {
    throw new CliError("--output is required.");
  }

  const inputPath = await requireFile(positionals[0], "Input video");
  const outputPath = path.resolve(options.output);
  const extension = path.extname(outputPath).toLowerCase();
  parseChoice(extension, "--output extension", [".jpg", ".jpeg", ".png", ".webp"]);
  const timestamp = validateTimestamp(options.time);
  const maxWidth = options.maxWidth
    ? parseInteger(options.maxWidth, "--max-width", { min: 2, max: 16384 })
    : null;
  const quality = parseInteger(options.quality, "--quality", { min: 1, max: 100 });

  await assertDifferentPaths(inputPath, [outputPath]);
  await assertOutputsAvailable([outputPath], options.force);

  const ffmpegPath = await findFfmpeg(options.ffmpeg);
  if (!ffmpegPath) {
    throw new CliError(
      "FFmpeg was not found. Install it separately, set HOUSE_ADEL_FFMPEG, " +
        "or pass --ffmpeg with the executable path.",
      1,
    );
  }
  const runnable = await toRunnable(ffmpegPath);
  const tempPath = makeTempSibling(outputPath);
  const args = [
    options.force ? "-y" : "-n",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-ss",
    timestamp,
    "-i",
    inputPath,
    "-map",
    "0:v:0",
    "-frames:v",
    "1",
  ];
  if (maxWidth) {
    args.push("-vf", `scale=min(${maxWidth}\\,iw):-2`);
  }
  if ([".jpg", ".jpeg"].includes(extension)) {
    const qscale = Math.max(2, Math.round(31 - (quality / 100) * 29));
    args.push("-q:v", String(qscale));
  } else if (extension === ".webp") {
    args.push("-c:v", "libwebp", "-quality", String(quality));
  }
  args.push("-update", "1", tempPath);

  if (options.dryRun) {
    const result = {
      input: relativeToRepo(inputPath),
      output: relativeToRepo(outputPath),
      ffmpeg: ffmpegPath,
      command: formatCommand(runnable, args),
      dryRun: true,
    };
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Dry run with FFmpeg: ${ffmpegPath}`);
      console.log(`  ${result.command}`);
      console.log(`  final -> ${result.output}`);
    }
    return;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  try {
    await runExternal(runnable, args);
    await commitTempFile(tempPath, outputPath, options.force);
  } catch (error) {
    await removeIfPresent(tempPath);
    throw error;
  }

  const details = await stat(outputPath);
  const metadata = await sharp(outputPath, { failOn: "error" }).metadata();
  const result = {
    path: relativeToRepo(outputPath),
    mediaType: mediaTypeFor(outputPath),
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    bytes: details.size,
    sha256: await hashFile(outputPath),
    timestamp,
  };
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Extracted poster: ${result.path} (${result.bytes} B)`);
  }
}

await runCli(main);
