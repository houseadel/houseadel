#!/usr/bin/env node

import { stat } from "node:fs/promises";
import {
  formatBytes,
  parseArgs,
  parseByteSize,
  printHelp,
  runCli,
} from "./lib/cli.mjs";
import { collectFiles, hashFile, relativeToRepo } from "./lib/files.mjs";

const HELP = `
Find byte-identical assets with SHA-256, avoiding unnecessary hashing by first
grouping candidates by byte size.

Usage:
  node scripts/find-duplicate-assets.mjs [path-or-glob ...] [options]

Options:
  --min-bytes <size>       Ignore smaller files (default: 1B).
  --all-hashes             Include every file hash in JSON output.
  --fail                   Exit nonzero when duplicate groups are found.
  --json                   Print machine-readable results.
  --help, -h               Show this help.

Defaults scan public/assets and references/masters. No files are modified.
`;

async function hashSequentially(files) {
  const results = [];
  for (const file of files) {
    results.push({ ...file, sha256: await hashFile(file.absolutePath) });
  }
  return results;
}

async function main() {
  const { options, positionals } = parseArgs(process.argv.slice(2), {
    help: { type: "boolean", alias: "h" },
    minBytes: { long: "min-bytes", default: "1B" },
    allHashes: { long: "all-hashes", type: "boolean", default: false },
    fail: { type: "boolean", default: false },
    json: { type: "boolean", default: false },
  });
  if (options.help) {
    printHelp(HELP);
    return;
  }

  const minBytes = parseByteSize(options.minBytes, "--min-bytes");
  const inputs =
    positionals.length > 0
      ? positionals
      : ["public/assets", "references/masters"];
  const paths = await collectFiles(inputs, {
    allowMissing: positionals.length === 0,
  });
  const files = [];
  for (const absolutePath of paths) {
    const details = await stat(absolutePath);
    if (details.size >= minBytes) {
      files.push({
        absolutePath,
        path: relativeToRepo(absolutePath),
        bytes: details.size,
      });
    }
  }

  const bySize = new Map();
  for (const file of files) {
    bySize.set(file.bytes, [...(bySize.get(file.bytes) ?? []), file]);
  }
  const hashCandidates = options.allHashes
    ? files
    : [...bySize.values()].filter((group) => group.length > 1).flat();
  const hashed = await hashSequentially(hashCandidates);
  const byHash = new Map();
  for (const file of hashed) {
    byHash.set(file.sha256, [...(byHash.get(file.sha256) ?? []), file]);
  }
  const duplicates = [...byHash.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([sha256, group]) => ({
      sha256,
      bytes: group[0].bytes,
      wastedBytes: group[0].bytes * (group.length - 1),
      files: group.map((file) => file.path).sort(),
    }))
    .sort((left, right) => right.wastedBytes - left.wastedBytes);
  const result = {
    scannedFiles: files.length,
    hashedFiles: hashed.length,
    duplicateGroups: duplicates.length,
    duplicateFiles: duplicates.reduce((sum, group) => sum + group.files.length, 0),
    potentiallyWastedBytes: duplicates.reduce(
      (sum, group) => sum + group.wastedBytes,
      0,
    ),
    duplicates,
  };
  if (options.allHashes) {
    result.hashes = hashed
      .map(({ path: filePath, bytes, sha256 }) => ({ path: filePath, bytes, sha256 }))
      .sort((left, right) => left.path.localeCompare(right.path));
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (duplicates.length === 0) {
    console.log(
      `No duplicate assets found (${files.length} scanned, ${hashed.length} hashed).`,
    );
  } else {
    console.log(`Found ${duplicates.length} duplicate group(s):`);
    for (const group of duplicates) {
      console.log(
        `  ${formatBytes(group.bytes)} each, ${formatBytes(group.wastedBytes)} potentially duplicated`,
      );
      console.log(`  SHA-256 ${group.sha256}`);
      for (const file of group.files) {
        console.log(`    ${file}`);
      }
    }
    console.log(
      `Potential duplicate bytes: ${formatBytes(result.potentiallyWastedBytes)}.`,
    );
  }

  if (options.fail && duplicates.length > 0) {
    process.exitCode = 1;
  }
}

await runCli(main);
