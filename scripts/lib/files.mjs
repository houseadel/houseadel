import { createHash, randomBytes } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  access,
  link,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import { CliError } from "./cli.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(scriptDirectory, "..", "..");

export const ASSET_EXTENSIONS = new Set([
  ".avif",
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".mkv",
  ".glb",
  ".gltf",
  ".usdz",
  ".fbx",
  ".obj",
  ".bin",
  ".ktx2",
  ".basis",
  ".dds",
  ".hdr",
  ".exr",
  ".mp3",
  ".m4a",
  ".aac",
  ".ogg",
  ".opus",
  ".wav",
  ".flac",
  ".aif",
  ".aiff",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
]);

const MIME_TYPES = new Map([
  [".avif", "image/avif"],
  [".webp", "image/webp"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".tif", "image/tiff"],
  [".tiff", "image/tiff"],
  [".heic", "image/heic"],
  [".heif", "image/heif"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mov", "video/quicktime"],
  [".m4v", "video/x-m4v"],
  [".mkv", "video/x-matroska"],
  [".glb", "model/gltf-binary"],
  [".gltf", "model/gltf+json"],
  [".usdz", "model/vnd.usdz+zip"],
  [".fbx", "application/octet-stream"],
  [".obj", "model/obj"],
  [".bin", "application/octet-stream"],
  [".ktx2", "image/ktx2"],
  [".basis", "image/x-basis"],
  [".dds", "image/vnd-ms.dds"],
  [".hdr", "image/vnd.radiance"],
  [".exr", "image/x-exr"],
  [".mp3", "audio/mpeg"],
  [".m4a", "audio/mp4"],
  [".aac", "audio/aac"],
  [".ogg", "audio/ogg"],
  [".opus", "audio/opus"],
  [".wav", "audio/wav"],
  [".flac", "audio/flac"],
  [".aif", "audio/aiff"],
  [".aiff", "audio/aiff"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
  [".otf", "font/otf"],
]);

export function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

export function relativeToRepo(filePath) {
  const relative = path.relative(repoRoot, path.resolve(filePath));
  return toPosix(relative || ".");
}

export function isPathInside(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

export function resolveRepoReference(reference) {
  if (typeof reference !== "string" || reference.trim() === "") {
    throw new CliError("Asset references must be non-empty strings.");
  }
  if (reference.includes("\\")) {
    throw new CliError(
      `Manifest paths must use forward slashes on every platform: ${reference}`,
    );
  }
  if (path.posix.isAbsolute(reference) || path.win32.isAbsolute(reference)) {
    throw new CliError(`Manifest path must be repository-relative: ${reference}`);
  }

  const resolved = path.resolve(repoRoot, ...reference.split("/"));
  if (!isPathInside(repoRoot, resolved)) {
    throw new CliError(`Manifest path escapes the repository: ${reference}`);
  }
  return resolved;
}

export async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function requireFile(filePath, label = "Input") {
  const resolved = path.resolve(filePath);
  let details;
  try {
    details = await stat(resolved);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new CliError(`${label} does not exist: ${filePath}`);
    }
    throw error;
  }

  if (!details.isFile()) {
    throw new CliError(`${label} is not a file: ${filePath}`);
  }
  return resolved;
}

function normalizedForComparison(filePath) {
  const resolved = path.resolve(filePath);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

export async function assertDifferentPaths(inputPath, outputPaths) {
  const input = normalizedForComparison(inputPath);
  const inputRealPath = await realpath(inputPath);
  const inputStats = await stat(inputPath);
  for (const outputPath of outputPaths) {
    if (normalizedForComparison(outputPath) === input) {
      throw new CliError(
        `Refusing to replace the source file: ${path.resolve(outputPath)}`,
      );
    }
    try {
      const [outputRealPath, outputStats] = await Promise.all([
        realpath(outputPath),
        stat(outputPath),
      ]);
      const sameCanonicalPath =
        normalizedForComparison(outputRealPath) ===
        normalizedForComparison(inputRealPath);
      const sameFileIdentity =
        inputStats.dev === outputStats.dev && inputStats.ino === outputStats.ino;
      if (sameCanonicalPath || sameFileIdentity) {
        throw new CliError(
          `Refusing to replace the source file through an alias or hard link: ${path.resolve(outputPath)}`,
        );
      }
    } catch (error) {
      if (error instanceof CliError) {
        throw error;
      }
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }
}

export async function assertOutputsAvailable(outputPaths, force = false) {
  if (force) {
    return;
  }

  const existing = [];
  for (const outputPath of outputPaths) {
    if (await pathExists(outputPath)) {
      existing.push(path.resolve(outputPath));
    }
  }

  if (existing.length > 0) {
    throw new CliError(
      `Output already exists. Use --force to replace it:\n${existing
        .map((entry) => `  ${entry}`)
        .join("\n")}`,
    );
  }
}

export function makeTempSibling(outputPath) {
  const parsed = path.parse(path.resolve(outputPath));
  const nonce = `${process.pid}-${Date.now()}-${randomBytes(4).toString("hex")}`;
  return path.join(parsed.dir, `.${parsed.name}.${nonce}.tmp${parsed.ext}`);
}

export async function commitTempFile(tempPath, outputPath, force = false) {
  const destination = path.resolve(outputPath);
  if (force) {
    // rename() replaces an existing file without a delete-then-move gap.
    await rename(tempPath, destination);
    return;
  }

  try {
    // A hard-link create is atomic and fails with EEXIST if a concurrent
    // process wins the destination. The temp file is always a same-directory
    // sibling, so it is on the same filesystem.
    await link(tempPath, destination);
  } catch (error) {
    if (error?.code === "EEXIST") {
      throw new CliError(
        `Output appeared while processing; refusing to replace it: ${destination}`,
      );
    }
    throw error;
  }
  await rm(tempPath, { force: true });
}

export async function removeIfPresent(filePath) {
  try {
    await rm(filePath, { force: true });
  } catch {
    // Cleanup must not hide the original processing error.
  }
}

export async function writeFileAtomic(
  outputPath,
  contents,
  { force = false } = {},
) {
  const destination = path.resolve(outputPath);
  await assertOutputsAvailable([destination], force);
  await mkdir(path.dirname(destination), { recursive: true });
  const tempPath = makeTempSibling(destination);

  try {
    await writeFile(tempPath, contents, { flag: "wx" });
    await commitTempFile(tempPath, destination, force);
  } catch (error) {
    await removeIfPresent(tempPath);
    throw error;
  }
}

export async function readJson(filePath, label = "JSON file") {
  let source;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new CliError(`${label} does not exist: ${filePath}`);
    }
    throw error;
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new CliError(`${label} is not valid JSON: ${filePath} (${error.message})`);
  }
}

function hasGlobSyntax(value) {
  return /[*?[\]{}()!]/.test(value);
}

export async function collectFiles(
  inputs,
  {
    extensions = ASSET_EXTENSIONS,
    allowMissing = false,
    ignore = ["**/node_modules/**", "**/.git/**"],
  } = {},
) {
  const found = new Set();
  const accepted =
    extensions === null
      ? null
      : new Set([...extensions].map((extension) => extension.toLowerCase()));
  const add = (filePath) => {
    const resolved = path.resolve(filePath);
    if (!accepted || accepted.has(path.extname(resolved).toLowerCase())) {
      found.add(resolved);
    }
  };

  for (const input of inputs) {
    const resolved = path.resolve(input);
    let details;
    try {
      details = await stat(resolved);
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }

      if (hasGlobSyntax(input)) {
        const globPattern = process.platform === "win32" ? toPosix(input) : input;
        const matches = await fg(globPattern, {
          cwd: process.cwd(),
          absolute: true,
          onlyFiles: true,
          unique: true,
          ignore,
          followSymbolicLinks: false,
        });
        if (matches.length === 0 && !allowMissing) {
          throw new CliError(`Pattern matched no files: ${input}`);
        }
        matches.forEach(add);
        continue;
      }

      if (allowMissing) {
        continue;
      }
      throw new CliError(`Path does not exist: ${input}`);
    }

    if (details.isFile()) {
      add(resolved);
      continue;
    }

    if (!details.isDirectory()) {
      continue;
    }

    const matches = await fg("**/*", {
      cwd: resolved,
      absolute: true,
      onlyFiles: true,
      unique: true,
      ignore,
      followSymbolicLinks: false,
    });
    matches.forEach(add);
  }

  return [...found].sort((a, b) => a.localeCompare(b));
}

export function mediaTypeFor(filePath) {
  return MIME_TYPES.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

export function assetCategoryFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if ([".ktx2", ".basis", ".dds", ".hdr", ".exr"].includes(extension)) {
    return "texture";
  }
  if ([".glb", ".gltf", ".usdz", ".fbx", ".obj", ".bin"].includes(extension)) {
    return "model";
  }
  const mediaType = mediaTypeFor(filePath);
  if (mediaType.startsWith("image/")) return "image";
  if (mediaType.startsWith("video/")) return "video";
  if (mediaType.startsWith("audio/")) return "audio";
  if (mediaType.startsWith("font/")) return "font";
  if (mediaType.startsWith("model/")) {
    return "model";
  }
  return "other";
}

export function hashFile(filePath, algorithm = "sha256") {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm);
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}
