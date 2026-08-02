#!/usr/bin/env node

import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, '..', '..', '..');
const imageExtensions = new Set([
  '.avif',
  '.bmp',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.tif',
  '.tiff',
  '.webp',
]);
const defaultAssetRoots = ['public', 'src/assets', 'app/assets'];
const excludedSegments = new Set([
  '.git',
  '.next',
  '__snapshots__',
  'archive',
  'archived',
  'archives',
  'audit',
  'audits',
  'build',
  'coverage',
  'dist',
  'legacy',
  'node_modules',
  'output',
  'playwright-report',
  'reference',
  'references',
  'review-captures',
  'screenshots',
  'test',
  'test-results',
  'tests',
]);

function usage() {
  console.log(`Usage: node report_images_without_provenance.mjs [options]

Options:
  --repo-root <path>  Repository root (defaults to the skill's repository)
  --manifest <path>   Manifest path relative to the repository (default: data/assets.json)
  --root <path>       Production asset root; repeat to replace the default roots
  --help              Show this help`);
}

function parseArguments(argv) {
  const options = {
    repositoryRoot: defaultRepositoryRoot,
    manifest: 'data/assets.json',
    roots: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      usage();
      process.exit(0);
    }

    if (argument === '--repo-root' || argument === '--manifest' || argument === '--root') {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} requires a path.`);
      index += 1;
      if (argument === '--repo-root') options.repositoryRoot = path.resolve(value);
      if (argument === '--manifest') options.manifest = value;
      if (argument === '--root') options.roots.push(value);
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (options.roots.length === 0) options.roots = defaultAssetRoots;
  return options;
}

function toRepositoryPath(repositoryRoot, candidate) {
  const absolutePath = path.resolve(repositoryRoot, candidate);
  const relativePath = path.relative(repositoryRoot, absolutePath);
  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    throw new Error(`Path is outside the repository: ${candidate}`);
  }
  return { absolutePath, relativePath: normalizePath(relativePath) };
}

function normalizePath(value) {
  return value.replaceAll('\\', '/').replace(/^\.\//, '').replace(/^\/+/, '');
}

function isImagePath(value) {
  const cleanValue = value.split(/[?#]/, 1)[0];
  return imageExtensions.has(path.extname(cleanValue).toLowerCase());
}

function isExcluded(relativePath) {
  return normalizePath(relativePath)
    .toLowerCase()
    .split('/')
    .some(
      (segment) =>
        excludedSegments.has(segment) ||
        segment.startsWith('archive-') ||
        segment.startsWith('audit-') ||
        segment.startsWith('test-'),
    );
}

async function pathExists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function collectRasterFiles(repositoryRoot, rootPath) {
  const root = toRepositoryPath(repositoryRoot, rootPath);
  if (!(await pathExists(root.absolutePath))) return [];

  const files = [];
  const pendingDirectories = [root.absolutePath];

  while (pendingDirectories.length > 0) {
    const directory = pendingDirectories.pop();
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const absoluteEntryPath = path.join(directory, entry.name);
      const relativeEntryPath = normalizePath(path.relative(repositoryRoot, absoluteEntryPath));
      if (isExcluded(relativeEntryPath)) continue;
      if (entry.isDirectory()) pendingDirectories.push(absoluteEntryPath);
      if (entry.isFile() && isImagePath(relativeEntryPath)) files.push(relativeEntryPath);
    }
  }

  return files;
}

function collectManifestPaths(value, recordedPaths = new Set()) {
  if (typeof value === 'string') {
    if (/^(?:https?:|data:)/i.test(value) || !isImagePath(value)) return recordedPaths;
    const normalizedValue = normalizePath(value.split(/[?#]/, 1)[0]);
    recordedPaths.add(normalizedValue);
    if (!normalizedValue.startsWith('public/')) recordedPaths.add(`public/${normalizedValue}`);
    return recordedPaths;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectManifestPaths(item, recordedPaths);
    return recordedPaths;
  }

  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectManifestPaths(item, recordedPaths);
  }

  return recordedPaths;
}

async function readManifest(repositoryRoot, manifestPath) {
  const manifest = toRepositoryPath(repositoryRoot, manifestPath);
  if (!(await pathExists(manifest.absolutePath))) {
    return { exists: false, relativePath: manifest.relativePath, recordedPaths: new Set() };
  }

  let parsedManifest;
  try {
    parsedManifest = JSON.parse(await readFile(manifest.absolutePath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot parse ${manifest.relativePath}: ${error.message}`);
  }

  return {
    exists: true,
    relativePath: manifest.relativePath,
    recordedPaths: collectManifestPaths(parsedManifest),
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const repositoryRoot = path.resolve(options.repositoryRoot);
  const manifest = await readManifest(repositoryRoot, options.manifest);
  const rootDetails = options.roots.map((rootPath) => toRepositoryPath(repositoryRoot, rootPath));
  const scannedRootDetails = [];
  const rasterFiles = [];

  for (const root of rootDetails) {
    if (!(await pathExists(root.absolutePath))) continue;
    scannedRootDetails.push(root);
    rasterFiles.push(...(await collectRasterFiles(repositoryRoot, root.relativePath)));
  }

  const uniqueRasterFiles = [...new Set(rasterFiles)].sort((first, second) =>
    first.localeCompare(second),
  );
  const missingFiles = uniqueRasterFiles.filter((filePath) => !manifest.recordedPaths.has(filePath));

  console.log('House Adel asset provenance audit');
  console.log(`Repository: ${repositoryRoot}`);
  console.log(`Manifest: ${manifest.relativePath}${manifest.exists ? '' : ' (not found)'}`);
  console.log(
    `Scanned roots: ${
      scannedRootDetails.length > 0
        ? scannedRootDetails.map((root) => root.relativePath).join(', ')
        : '(none found)'
    }`,
  );
  console.log(`Production image files: ${uniqueRasterFiles.length}`);

  if (missingFiles.length === 0) {
    console.log('All production image files have provenance records.');
    return;
  }

  console.error(`Missing provenance records (${missingFiles.length}):`);
  for (const filePath of missingFiles) console.error(`- ${filePath}`);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Asset provenance audit failed: ${error.message}`);
  process.exitCode = 2;
});
