#!/usr/bin/env node

import { realpath, stat } from "node:fs/promises";
import path from "node:path";
import {
  CliError,
  parseArgs,
  printHelp,
  runCli,
} from "./lib/cli.mjs";
import {
  collectFiles,
  isPathInside,
  readJson,
  relativeToRepo,
  repoRoot,
  resolveRepoReference,
} from "./lib/files.mjs";
import { collectManifestReferences } from "./lib/manifest.mjs";

const HELP = `
Detect missing manifest references and orphaned media files.

Usage:
  node scripts/audit-asset-files.mjs [manifest.json ...] [options]

Options:
  --asset-root <path>      Media root to inspect for orphans; repeat as needed.
  --allow-orphans          Report orphans without failing the command.
  --json                   Print machine-readable results.
  --help, -h               Show this help.

With no manifest paths, manifests under references/ and public/ are discovered.
With no --asset-root, each manifest directory and public/assets are inspected.
Only recognized media/model/texture/audio/font files participate in orphan checks.
No files are modified.
`;

async function discoverManifests(positionals) {
  return collectFiles(
    positionals.length > 0
      ? positionals
      : ["references/**/manifest.json", "public/**/manifest.json"],
    { extensions: new Set([".json"]), allowMissing: positionals.length === 0 },
  );
}

async function main() {
  const { options, positionals } = parseArgs(process.argv.slice(2), {
    help: { type: "boolean", alias: "h" },
    assetRoot: { long: "asset-root", multiple: true },
    allowOrphans: { long: "allow-orphans", type: "boolean", default: false },
    json: { type: "boolean", default: false },
  });
  if (options.help) {
    printHelp(HELP);
    return;
  }

  const manifestPaths = await discoverManifests(positionals);
  if (manifestPaths.length === 0) {
    throw new CliError("No asset manifests were found.");
  }

  const referencedFiles = new Set();
  const missing = [];
  const invalid = [];
  const realRepoRoot = await realpath(repoRoot);
  for (const manifestPath of manifestPaths) {
    const manifest = await readJson(manifestPath, "Asset manifest");
    for (const reference of collectManifestReferences(manifest)) {
      let resolved;
      try {
        resolved = resolveRepoReference(reference.reference);
      } catch (error) {
        invalid.push({
          manifest: relativeToRepo(manifestPath),
          pointer: reference.pointer,
          path: reference.reference,
          reason: error.message,
        });
        continue;
      }
      try {
        const details = await stat(resolved);
        if (!details.isFile()) {
          missing.push({
            manifest: relativeToRepo(manifestPath),
            pointer: reference.pointer,
            path: reference.reference,
            reason: "not a file",
          });
          continue;
        }
        const canonicalPath = await realpath(resolved);
        if (!isPathInside(realRepoRoot, canonicalPath)) {
          invalid.push({
            manifest: relativeToRepo(manifestPath),
            pointer: reference.pointer,
            path: reference.reference,
            reason: "path resolves outside the repository",
          });
          continue;
        }
        referencedFiles.add(
          process.platform === "win32" ? resolved.toLowerCase() : resolved,
        );
      } catch (error) {
        if (error?.code === "ENOENT") {
          missing.push({
            manifest: relativeToRepo(manifestPath),
            pointer: reference.pointer,
            path: reference.reference,
            reason: "missing",
          });
        } else {
          throw error;
        }
      }
    }
  }

  const rootInputs =
    options.assetRoot.length > 0
      ? options.assetRoot
      : [
          ...new Set(manifestPaths.map((manifestPath) => path.dirname(manifestPath))),
          "public/assets",
        ];
  const assetFiles = await collectFiles(rootInputs, {
    allowMissing: options.assetRoot.length === 0,
  });
  const orphaned = assetFiles
    .filter((filePath) => {
      const normalized =
        process.platform === "win32" ? filePath.toLowerCase() : filePath;
      return !referencedFiles.has(normalized);
    })
    .map(relativeToRepo)
    .sort();

  const result = {
    manifests: manifestPaths.map(relativeToRepo),
    assetRoots: rootInputs.map((root) => relativeToRepo(path.resolve(root))),
    referencedFiles: referencedFiles.size,
    missing,
    invalid,
    orphaned,
    ok:
      missing.length === 0 &&
      invalid.length === 0 &&
      (options.allowOrphans || orphaned.length === 0),
  };

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `Audited ${manifestPaths.length} manifest(s), ${referencedFiles.size} reference(s), ` +
        `${assetFiles.length} asset file(s).`,
    );
    for (const issue of invalid) {
      console.log(
        `INVALID ${issue.manifest}:${issue.pointer} ${issue.path} (${issue.reason})`,
      );
    }
    for (const issue of missing) {
      console.log(
        `MISSING ${issue.manifest}:${issue.pointer} ${issue.path} (${issue.reason})`,
      );
    }
    for (const file of orphaned) {
      console.log(`ORPHAN ${file}`);
    }
    if (result.ok) {
      console.log(
        orphaned.length > 0
          ? `PASS with ${orphaned.length} allowed orphan(s).`
          : "PASS: no missing or orphaned asset files.",
      );
    } else {
      console.log(
        `FAIL: ${missing.length} missing, ${invalid.length} invalid, ` +
          `${orphaned.length} orphaned file(s).`,
      );
    }
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

await runCli(main);
