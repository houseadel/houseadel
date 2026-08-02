#!/usr/bin/env node

import { stat } from "node:fs/promises";
import {
  formatBytes,
  parseArgs,
  parseByteSize,
  parseChoice,
  parseInteger,
  printHelp,
  runCli,
} from "./lib/cli.mjs";
import {
  assetCategoryFor,
  collectFiles,
  relativeToRepo,
} from "./lib/files.mjs";

const HELP = `
Report individual and category-level asset bytes for delivery-budget review.

Usage:
  node scripts/report-asset-sizes.mjs [path-or-glob ...] [options]

Options:
  --sort <mode>           size or path (default: size).
  --top <count>           Show only the largest N files; 0 shows all (default: 0).
  --warn-over <size>      Mark files above a threshold, e.g. 500KB or 2MiB.
  --fail-over <size>      Exit nonzero when any file exceeds the threshold.
  --json                  Print machine-readable results.
  --help, -h              Show this help.

The default input is public/assets. Recognized image, video, model, texture,
audio, and font extensions are included; source code and manifests are ignored.
`;

async function main() {
  const { options, positionals } = parseArgs(process.argv.slice(2), {
    help: { type: "boolean", alias: "h" },
    sort: { default: "size" },
    top: { default: "0" },
    warnOver: { long: "warn-over" },
    failOver: { long: "fail-over" },
    json: { type: "boolean", default: false },
  });
  if (options.help) {
    printHelp(HELP);
    return;
  }

  const sortMode = parseChoice(options.sort, "--sort", ["size", "path"]);
  const top = parseInteger(options.top, "--top", { min: 0 });
  const warnOver = options.warnOver
    ? parseByteSize(options.warnOver, "--warn-over")
    : null;
  const failOver = options.failOver
    ? parseByteSize(options.failOver, "--fail-over")
    : null;
  const inputs = positionals.length > 0 ? positionals : ["public/assets"];
  const files = await collectFiles(inputs, { allowMissing: positionals.length === 0 });
  const entries = [];

  for (const filePath of files) {
    const details = await stat(filePath);
    entries.push({
      path: relativeToRepo(filePath),
      bytes: details.size,
      category: assetCategoryFor(filePath),
      warning: warnOver !== null && details.size > warnOver,
      failure: failOver !== null && details.size > failOver,
    });
  }

  entries.sort((left, right) =>
    sortMode === "size"
      ? right.bytes - left.bytes || left.path.localeCompare(right.path)
      : left.path.localeCompare(right.path),
  );
  const categoryTotals = {};
  for (const entry of entries) {
    categoryTotals[entry.category] ??= { files: 0, bytes: 0 };
    categoryTotals[entry.category].files += 1;
    categoryTotals[entry.category].bytes += entry.bytes;
  }
  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  const visibleEntries = top === 0 ? entries : entries.slice(0, top);
  const result = {
    inputs,
    summary: {
      files: entries.length,
      bytes: totalBytes,
      categories: categoryTotals,
      warnings: entries.filter((entry) => entry.warning).length,
      failures: entries.filter((entry) => entry.failure).length,
    },
    files: visibleEntries,
    truncated: visibleEntries.length !== entries.length,
  };

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (entries.length === 0) {
      console.log(`No recognized assets found in ${inputs.join(", ")}.`);
    } else {
      const pathWidth = Math.min(
        80,
        Math.max(20, ...visibleEntries.map((entry) => entry.path.length)),
      );
      for (const entry of visibleEntries) {
        const label =
          entry.path.length > pathWidth
            ? `…${entry.path.slice(-(pathWidth - 1))}`
            : entry.path.padEnd(pathWidth);
        const marker = entry.failure ? "FAIL" : entry.warning ? "WARN" : "    ";
        console.log(
          `${marker}  ${formatBytes(entry.bytes).padStart(10)}  ${entry.category.padEnd(5)}  ${label}`,
        );
      }
      if (result.truncated) {
        console.log(`Showing ${visibleEntries.length} of ${entries.length} files.`);
      }
      console.log("Category totals:");
      for (const [category, total] of Object.entries(categoryTotals).sort()) {
        console.log(
          `  ${category.padEnd(5)}  ${String(total.files).padStart(4)} file(s)  ${formatBytes(total.bytes)}`,
        );
      }
      console.log(`Total: ${entries.length} file(s), ${formatBytes(totalBytes)}.`);
    }
  }

  if (result.summary.failures > 0) {
    process.exitCode = 1;
  }
}

await runCli(main);
