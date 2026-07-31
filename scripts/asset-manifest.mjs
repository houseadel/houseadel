#!/usr/bin/env node

import path from "node:path";
import {
  CliError,
  parseArgs,
  printHelp,
  runCli,
} from "./lib/cli.mjs";
import {
  collectFiles,
  readJson,
  relativeToRepo,
  writeFileAtomic,
} from "./lib/files.mjs";
import {
  createManifestTemplate,
  refreshManifestMetadata,
  validateManifest,
} from "./lib/manifest.mjs";

const HELP = `
Generate, validate, or deliberately refresh House Adel asset manifests.

Usage:
  node scripts/asset-manifest.mjs generate --universe-id <id> --output <path> [options]
  node scripts/asset-manifest.mjs validate [manifest.json ...] [options]
  node scripts/asset-manifest.mjs update <manifest.json ...> [--write] [options]

Generate options:
  --universe-id <id>       Required lowercase hyphenated ID.
  --output, -o <path>      Destination (default: manifest.json).
  --world-brief <path>     Repository-relative world brief.
  --visual-bible <path>    Repository-relative visual bible.
  --master-frame <path>    Repository-relative approved master frame.
  --force                  Explicitly replace an existing generated manifest.

Validate options:
  --production             Apply approval and rights publication gates.
  --no-verify-files        Validate structure without checking referenced files.
  --no-verify-hashes       Check files and sizes but skip SHA-256 comparison.

Update options:
  --write                  Explicitly replace manifests with refreshed metadata.
                           Without this flag, update is a read-only preview.

Shared options:
  --json                   Print machine-readable results.
  --help, -h               Show this help.

With no validate paths, manifests under references/ and public/ are discovered.
Update refreshes bytes, SHA-256, media type, and raster dimensions; it never
changes provenance, rights, approval, fallback, purpose, or quality fields.
`;

function parseShared(argv) {
  return parseArgs(argv, {
    help: { type: "boolean", alias: "h" },
    universeId: { long: "universe-id" },
    output: { alias: "o", default: "manifest.json" },
    worldBrief: { long: "world-brief" },
    visualBible: { long: "visual-bible" },
    masterFrame: { long: "master-frame" },
    force: { type: "boolean", default: false },
    production: { type: "boolean", default: false },
    verifyFiles: { long: "verify-files", type: "boolean", default: true },
    verifyHashes: { long: "verify-hashes", type: "boolean", default: true },
    write: { type: "boolean", default: false },
    json: { type: "boolean", default: false },
  });
}

async function discoverManifests(paths) {
  if (paths.length > 0) {
    return collectFiles(paths, { extensions: new Set([".json"]) });
  }
  return collectFiles(
    ["references/**/manifest.json", "public/**/manifest.json"],
    { extensions: new Set([".json"]), allowMissing: true },
  );
}

function printIssues(result) {
  if (result.issues.length === 0) {
    console.log(`PASS ${result.manifest}`);
    return;
  }
  for (const issue of result.issues) {
    console.log(
      `${issue.level.toUpperCase()} ${result.manifest}:${issue.pointer} ` +
        `[${issue.code}] ${issue.message}`,
    );
  }
}

async function generateCommand(options, positionals) {
  if (positionals.length > 0) {
    throw new CliError("generate does not accept positional paths.");
  }
  if (!options.universeId) {
    throw new CliError("generate requires --universe-id.");
  }
  const outputPath = path.resolve(options.output);
  const manifest = createManifestTemplate({
    universeId: options.universeId,
    worldBrief: options.worldBrief ?? null,
    visualBible: options.visualBible ?? null,
    masterFrame: options.masterFrame ?? null,
  });
  await writeFileAtomic(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, {
    force: options.force,
  });
  if (options.json) {
    console.log(
      JSON.stringify({ created: relativeToRepo(outputPath), manifest }, null, 2),
    );
  } else {
    console.log(`Created manifest: ${relativeToRepo(outputPath)}`);
  }
}

async function validateCommand(options, positionals) {
  const paths = await discoverManifests(positionals);
  if (paths.length === 0) {
    throw new CliError("No asset manifests were found.");
  }
  const results = [];

  for (const manifestPath of paths) {
    const manifest = await readJson(manifestPath, "Asset manifest");
    const issues = await validateManifest(manifest, {
      production: options.production,
      verifyFiles: options.verifyFiles,
      verifyHashes: options.verifyHashes,
    });
    results.push({ manifest: relativeToRepo(manifestPath), issues });
  }

  const summary = {
    manifests: results.length,
    errors: results.reduce(
      (sum, result) =>
        sum + result.issues.filter((issue) => issue.level === "error").length,
      0,
    ),
    warnings: results.reduce(
      (sum, result) =>
        sum + result.issues.filter((issue) => issue.level === "warning").length,
      0,
    ),
  };
  if (options.json) {
    console.log(JSON.stringify({ summary, results }, null, 2));
  } else {
    results.forEach(printIssues);
    console.log(
      `${summary.manifests} manifest(s): ${summary.errors} error(s), ` +
        `${summary.warnings} warning(s).`,
    );
  }
  if (summary.errors > 0) {
    process.exitCode = 1;
  }
}

async function updateCommand(options, positionals) {
  if (positionals.length === 0) {
    throw new CliError("update requires at least one manifest path.");
  }
  const paths = await discoverManifests(positionals);
  const results = [];

  for (const manifestPath of paths) {
    const source = await readJson(manifestPath, "Asset manifest");
    const refreshed = await refreshManifestMetadata(source);
    if (refreshed.changes.length > 0 && options.write) {
      refreshed.manifest.updatedAt = new Date().toISOString();
      await writeFileAtomic(
        manifestPath,
        `${JSON.stringify(refreshed.manifest, null, 2)}\n`,
        { force: true },
      );
    }
    results.push({
      manifest: relativeToRepo(manifestPath),
      changes: refreshed.changes,
      written: options.write && refreshed.changes.length > 0,
    });
  }

  if (options.json) {
    console.log(JSON.stringify({ write: options.write, results }, null, 2));
  } else {
    for (const result of results) {
      const mode = result.written ? "updated" : options.write ? "unchanged" : "preview";
      console.log(
        `${mode.toUpperCase()} ${result.manifest}: ${result.changes.length} change(s)`,
      );
      for (const change of result.changes) {
        console.log(`  ${change.pointer}: ${change.from} -> ${change.to}`);
      }
    }
    if (!options.write && results.some((result) => result.changes.length > 0)) {
      console.log("No files changed. Re-run with --write after reviewing the preview.");
    }
  }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || ["--help", "-h"].includes(argv[0])) {
    printHelp(HELP);
    return;
  }

  const command = argv[0];
  if (!["generate", "validate", "update"].includes(command)) {
    throw new CliError(
      `Unknown command "${command}". Expected generate, validate, or update.`,
    );
  }
  const { options, positionals } = parseShared(argv.slice(1));
  if (options.help) {
    printHelp(HELP);
    return;
  }

  if (command === "generate") {
    await generateCommand(options, positionals);
  } else if (command === "validate") {
    await validateCommand(options, positionals);
  } else {
    await updateCommand(options, positionals);
  }
}

await runCli(main);
