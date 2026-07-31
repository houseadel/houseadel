#!/usr/bin/env node

import { mkdir, open, stat } from "node:fs/promises";
import path from "node:path";
import {
  CliError,
  formatBytes,
  parseArgs,
  parseChoice,
  printHelp,
  runCli,
} from "./lib/cli.mjs";
import {
  assertDifferentPaths,
  assertOutputsAvailable,
  commitTempFile,
  hashFile,
  makeTempSibling,
  relativeToRepo,
  removeIfPresent,
  requireFile,
} from "./lib/files.mjs";
import {
  findGltfTransform,
  formatCommand,
  runExternal,
} from "./lib/external-tools.mjs";

const HELP = `
Safely wrap the optional official glTF Transform CLI for GLB optimization.

Usage:
  node scripts/optimize-glb.mjs <input.glb> <output.glb> [options]
  node scripts/optimize-glb.mjs --check [--tool <path>]

Options:
  --compress <method>          meshopt, draco, or none (default: none).
  --texture-compress <format>  webp, avif, or none (default: none).
  --tool-arg <argument>        Append an advanced CLI argument; repeat as needed.
  --tool <path>                gltf-transform executable or JavaScript entry.
  --check                      Report whether the optional CLI is available.
  --force                      Explicitly replace an existing optimized GLB.
  --dry-run, -n                Print the resolved command without running it.
  --json                       Print machine-readable results.
  --help, -h                   Show this help.

This repository does not add a GLB optimizer dependency. Install and audit the
official @gltf-transform/cli separately, expose "gltf-transform" on PATH, set
HOUSE_ADEL_GLTF_TRANSFORM, or pass --tool. The wrapper never downloads packages.
`;

async function assertGlb(filePath) {
  if (path.extname(filePath).toLowerCase() !== ".glb") {
    throw new CliError(`Expected a .glb input: ${filePath}`);
  }
  const handle = await open(filePath, "r");
  const buffer = Buffer.alloc(4);
  try {
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead !== 4) {
      throw new CliError(`Input is too small to be a GLB: ${filePath}`);
    }
  } finally {
    await handle.close();
  }
  const header = buffer.toString("ascii");
  if (header !== "glTF") {
    throw new CliError(`Input does not have a valid GLB magic header: ${filePath}`);
  }
}

function missingToolError() {
  return new CliError(
    "The optional gltf-transform CLI is not available. No package was installed. " +
      "Install and audit @gltf-transform/cli separately, set " +
      "HOUSE_ADEL_GLTF_TRANSFORM, or pass --tool with its executable/JS entry.",
    1,
  );
}

async function main() {
  const { options, positionals } = parseArgs(process.argv.slice(2), {
    help: { type: "boolean", alias: "h" },
    compress: { default: "none" },
    textureCompress: { long: "texture-compress", default: "none" },
    toolArg: { long: "tool-arg", multiple: true, allowOptionValue: true },
    tool: {},
    check: { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    dryRun: { long: "dry-run", type: "boolean", alias: "n", default: false },
    json: { type: "boolean", default: false },
  });

  if (options.help) {
    printHelp(HELP);
    return;
  }

  const runnable = await findGltfTransform(options.tool);
  if (options.check) {
    if (!runnable) {
      throw missingToolError();
    }
    const version = await runExternal(runnable, ["--version"], { capture: true });
    const result = {
      available: true,
      tool: runnable.displayName,
      version: (version.stdout || version.stderr).trim(),
    };
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`glTF Transform available: ${result.tool}`);
      if (result.version) console.log(result.version);
    }
    return;
  }

  if (positionals.length !== 2) {
    throw new CliError(
      "Provide input.glb and output.glb, or use --check. Use --help for usage.",
    );
  }
  if (!runnable) {
    throw missingToolError();
  }

  const inputPath = await requireFile(positionals[0], "Input GLB");
  await assertGlb(inputPath);
  const outputPath = path.resolve(positionals[1]);
  if (path.extname(outputPath).toLowerCase() !== ".glb") {
    throw new CliError("--output must use the .glb extension.");
  }
  await assertDifferentPaths(inputPath, [outputPath]);
  await assertOutputsAvailable([outputPath], options.force);

  const compression = parseChoice(options.compress.toLowerCase(), "--compress", [
    "meshopt",
    "draco",
    "none",
  ]);
  const textureCompression = parseChoice(
    options.textureCompress.toLowerCase(),
    "--texture-compress",
    ["webp", "avif", "none"],
  );
  const tempPath = makeTempSibling(outputPath);
  const args = ["optimize", inputPath, tempPath];
  if (compression === "none") {
    args.push("--no-compress");
  } else {
    args.push("--compress", compression);
  }
  if (textureCompression === "none") {
    args.push("--no-texture-compress");
  } else {
    args.push("--texture-compress", textureCompression);
  }
  args.push(...options.toolArg);

  if (options.dryRun) {
    const result = {
      input: relativeToRepo(inputPath),
      output: relativeToRepo(outputPath),
      tool: runnable.displayName,
      command: formatCommand(runnable, args),
      dryRun: true,
    };
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Dry run: ${result.command}`);
      console.log(`Final output -> ${result.output}`);
    }
    return;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  try {
    await runExternal(runnable, args);
    await assertGlb(tempPath);
    await commitTempFile(tempPath, outputPath, options.force);
  } catch (error) {
    await removeIfPresent(tempPath);
    throw error;
  }

  const [inputStats, outputStats] = await Promise.all([
    stat(inputPath),
    stat(outputPath),
  ]);
  const reduction =
    inputStats.size > 0
      ? ((inputStats.size - outputStats.size) / inputStats.size) * 100
      : 0;
  const result = {
    input: { path: relativeToRepo(inputPath), bytes: inputStats.size },
    output: {
      path: relativeToRepo(outputPath),
      bytes: outputStats.size,
      sha256: await hashFile(outputPath),
    },
    reductionPercent: Number(reduction.toFixed(2)),
    compression,
    textureCompression,
  };
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `Optimized ${result.input.path}: ${formatBytes(inputStats.size)} -> ` +
        `${formatBytes(outputStats.size)} (${result.reductionPercent}% reduction).`,
    );
    console.log(`Output: ${result.output.path}`);
  }
}

await runCli(main);
