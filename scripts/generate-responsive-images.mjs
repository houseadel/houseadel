#!/usr/bin/env node

import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
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

const HELP = `
Generate measured responsive AVIF and WebP variants without changing the master.

Usage:
  node scripts/generate-responsive-images.mjs <input> --output-dir <directory> [options]

Options:
  --output-dir <dir>       Required destination for generated variants.
  --widths <list>          Comma-separated pixel widths (default: 480,960,1440,1920).
  --formats <list>         avif, webp, or both (default: avif,webp).
  --name <base-name>       Lowercase hyphenated output base; derived from input by default.
  --avif-quality <1-100>   AVIF quality (default: 55).
  --webp-quality <1-100>   WebP quality (default: 78).
  --effort <0-9>           AVIF encoding effort (default: 4).
  --allow-upscale          Permit requested widths larger than the master.
  --force                  Explicitly replace existing generated variants.
  --dry-run, -n            Inspect the master and print the planned variants only.
  --json                   Print machine-readable results.
  --help, -h               Show this help.

Output names follow <base-name>-<actual-width>.<format>. Widths larger than the
master are skipped unless --allow-upscale is present. Animated or multi-page
inputs are rejected so a motion asset cannot accidentally become a still.

Example:
  node scripts/generate-responsive-images.mjs references/masters/hero.png --output-dir public/assets/hero --widths 640,960,1440
`;

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const { options, positionals } = parseArgs(process.argv.slice(2), {
    help: { type: "boolean", alias: "h" },
    outputDir: { long: "output-dir" },
    widths: { default: "480,960,1440,1920" },
    formats: { default: "avif,webp" },
    name: {},
    avifQuality: { long: "avif-quality", default: "55" },
    webpQuality: { long: "webp-quality", default: "78" },
    effort: { default: "4" },
    allowUpscale: { long: "allow-upscale", type: "boolean", default: false },
    force: { type: "boolean", default: false },
    dryRun: { long: "dry-run", type: "boolean", alias: "n", default: false },
    json: { type: "boolean", default: false },
  });

  if (options.help) {
    printHelp(HELP);
    return;
  }
  if (positionals.length !== 1) {
    throw new CliError("Provide exactly one input image. Use --help for usage.");
  }
  if (!options.outputDir) {
    throw new CliError("--output-dir is required.");
  }

  const inputPath = await requireFile(positionals[0], "Input image");
  const metadata = await sharp(inputPath, { failOn: "error" }).metadata();
  if (!metadata.width || !metadata.height) {
    throw new CliError(`Could not determine image dimensions: ${inputPath}`);
  }
  if ((metadata.pages ?? 1) > 1) {
    throw new CliError(
      "Animated or multi-page images are not supported by this still-image pipeline.",
    );
  }
  const orientedWidth = metadata.autoOrient?.width ?? metadata.width;
  const orientedHeight = metadata.autoOrient?.height ?? metadata.height;

  const requestedWidths = parseCsv(options.widths, "--widths")
    .map((width) => parseInteger(width, "--widths", { min: 1, max: 16384 }))
    .sort((a, b) => a - b);
  const formats = [
    ...new Set(
      parseCsv(options.formats, "--formats").map((format) =>
        parseChoice(format.toLowerCase(), "--formats", ["avif", "webp"]),
      ),
    ),
  ];
  const widths = [
    ...new Set(
      requestedWidths.filter(
        (width) => options.allowUpscale || width <= orientedWidth,
      ),
    ),
  ];
  if (widths.length === 0) {
    throw new CliError(
      `All requested widths exceed the ${orientedWidth}px master. ` +
        "Choose a smaller width or pass --allow-upscale explicitly.",
    );
  }

  const avifQuality = parseInteger(options.avifQuality, "--avif-quality", {
    min: 1,
    max: 100,
  });
  const webpQuality = parseInteger(options.webpQuality, "--webp-quality", {
    min: 1,
    max: 100,
  });
  const effort = parseInteger(options.effort, "--effort", { min: 0, max: 9 });
  const sourceBase = path.basename(inputPath, path.extname(inputPath));
  const outputBase = options.name ?? slugify(sourceBase);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(outputBase)) {
    throw new CliError(
      "--name must contain only lowercase ASCII letters, numbers, and single hyphens.",
    );
  }

  const outputDirectory = path.resolve(options.outputDir);
  const plans = widths.flatMap((width) =>
    formats.map((format) => {
      const height = Math.round((orientedHeight * width) / orientedWidth);
      return {
        width,
        height,
        format,
        outputPath: path.join(outputDirectory, `${outputBase}-${width}.${format}`),
      };
    }),
  );
  const outputPaths = plans.map((plan) => plan.outputPath);
  await assertDifferentPaths(inputPath, outputPaths);
  await assertOutputsAvailable(outputPaths, options.force);

  const skippedWidths = requestedWidths.filter(
    (width) => !options.allowUpscale && width > orientedWidth,
  );
  const baseResult = {
    input: relativeToRepo(inputPath),
    source: {
      mediaType: metadata.format ? `image/${metadata.format}` : mediaTypeFor(inputPath),
      width: orientedWidth,
      height: orientedHeight,
      hasAlpha: Boolean(metadata.hasAlpha),
    },
    skippedWidths,
    dryRun: options.dryRun,
  };

  if (options.dryRun) {
    const result = {
      ...baseResult,
      variants: plans.map((plan) => ({
        ...plan,
        path: relativeToRepo(plan.outputPath),
        outputPath: undefined,
      })),
    };
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(
        `Dry run: ${orientedWidth}x${orientedHeight} ${path.basename(inputPath)}`,
      );
      for (const plan of plans) {
        console.log(
          `  ${plan.format.toUpperCase()} ${plan.width}x${plan.height} -> ${relativeToRepo(plan.outputPath)}`,
        );
      }
      if (skippedWidths.length > 0) {
        console.log(`  Skipped widths above the master: ${skippedWidths.join(", ")}`);
      }
    }
    return;
  }

  await mkdir(outputDirectory, { recursive: true });
  const jobs = plans.map((plan) => ({
    ...plan,
    tempPath: makeTempSibling(plan.outputPath),
    writeResult: null,
  }));
  try {
    for (const job of jobs) {
      let pipeline = sharp(inputPath, { failOn: "error" })
        .rotate()
        .resize({
          width: job.width,
          withoutEnlargement: !options.allowUpscale,
          fit: "inside",
        })
        .toColorspace("srgb");

      pipeline =
        job.format === "avif"
          ? pipeline.avif({
              quality: avifQuality,
              effort,
              chromaSubsampling: metadata.hasAlpha ? "4:4:4" : "4:2:0",
            })
          : pipeline.webp({
              quality: webpQuality,
              smartSubsample: true,
              effort: Math.min(effort, 6),
            });

      job.writeResult = await pipeline.toFile(job.tempPath);
    }
    for (const job of jobs) {
      await commitTempFile(job.tempPath, job.outputPath, options.force);
    }
  } catch (error) {
    await Promise.all(jobs.map((job) => removeIfPresent(job.tempPath)));
    throw error;
  }

  const variants = [];
  for (const job of jobs) {
    const details = await stat(job.outputPath);
    variants.push({
      path: relativeToRepo(job.outputPath),
      mediaType: mediaTypeFor(job.outputPath),
      width: job.writeResult.width,
      height: job.writeResult.height,
      bytes: details.size,
      sha256: await hashFile(job.outputPath),
    });
  }

  const result = { ...baseResult, variants };
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `Generated ${variants.length} responsive variants from ${relativeToRepo(inputPath)}:`,
    );
    for (const variant of variants) {
      console.log(
        `  ${variant.width}x${variant.height} ${variant.mediaType} ${variant.bytes} B  ${variant.path}`,
      );
    }
    if (skippedWidths.length > 0) {
      console.log(`Skipped widths above the master: ${skippedWidths.join(", ")}`);
    }
  }
}

await runCli(main);
