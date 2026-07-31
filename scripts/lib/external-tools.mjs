import { constants } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import fg from "fast-glob";
import { CliError } from "./cli.mjs";
import { pathExists, repoRoot, toPosix } from "./files.mjs";

async function isUsableFile(filePath) {
  try {
    await access(
      filePath,
      process.platform === "win32" ? constants.F_OK : constants.X_OK,
    );
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function executableExtensions(name) {
  if (process.platform !== "win32") {
    return [""];
  }
  if (path.extname(name)) {
    return [""];
  }

  const extensions = (process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD")
    .split(";")
    .filter(Boolean)
    .map((extension) => extension.toLowerCase());
  return ["", ...new Set(extensions)];
}

async function findOnPath(name) {
  const pathEntries = (process.env.PATH ?? "")
    .split(path.delimiter)
    .map((entry) => entry.replace(/^"(.*)"$/, "$1"))
    .filter(Boolean);

  for (const directory of pathEntries) {
    for (const extension of executableExtensions(name)) {
      const candidate = path.join(directory, `${name}${extension}`);
      if (await isUsableFile(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

function looksLikePath(value) {
  return (
    path.isAbsolute(value) ||
    value.includes("/") ||
    value.includes("\\") ||
    value.startsWith(".")
  );
}

export async function findExecutable({
  explicit,
  environmentVariable,
  names,
  fallbackPaths = [],
}) {
  const requested = explicit ?? process.env[environmentVariable];
  if (requested) {
    if (looksLikePath(requested)) {
      const resolved = path.resolve(requested);
      if (!(await isUsableFile(resolved))) {
        throw new CliError(`Executable is not accessible: ${resolved}`);
      }
      return resolved;
    }

    const found = await findOnPath(requested);
    if (!found) {
      throw new CliError(`Executable "${requested}" was not found on PATH.`);
    }
    return found;
  }

  for (const name of names) {
    const found = await findOnPath(name);
    if (found) {
      return found;
    }
  }

  for (const candidate of fallbackPaths) {
    if (candidate && (await isUsableFile(candidate))) {
      return candidate;
    }
  }

  return null;
}

export async function findFfmpeg(explicit) {
  const fallbackPaths = [];

  if (process.platform === "win32") {
    fallbackPaths.push(
      process.env.ProgramFiles &&
        path.join(process.env.ProgramFiles, "ffmpeg", "bin", "ffmpeg.exe"),
      process.env.ProgramData &&
        path.join(process.env.ProgramData, "chocolatey", "bin", "ffmpeg.exe"),
      process.env.USERPROFILE &&
        path.join(
          process.env.USERPROFILE,
          "scoop",
          "apps",
          "ffmpeg",
          "current",
          "bin",
          "ffmpeg.exe",
        ),
    );

    const wingetRoot =
      process.env.LOCALAPPDATA &&
      path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages");
    if (wingetRoot && (await pathExists(wingetRoot))) {
      const matches = await fg(
        toPosix(path.join(wingetRoot, "*FFmpeg*", "ffmpeg-*", "bin", "ffmpeg.exe")),
        {
          absolute: true,
          onlyFiles: true,
          unique: true,
          followSymbolicLinks: false,
        },
      );
      fallbackPaths.unshift(...matches.sort().reverse());
    }
  } else {
    fallbackPaths.push("/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg");
  }

  return findExecutable({
    explicit,
    environmentVariable: "HOUSE_ADEL_FFMPEG",
    names: ["ffmpeg"],
    fallbackPaths: fallbackPaths.filter(Boolean),
  });
}

async function readPackageBin(packageRoot, commandName) {
  const packagePath = path.join(packageRoot, "package.json");
  if (!(await pathExists(packagePath))) {
    return null;
  }

  try {
    const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
    let binPath;
    if (typeof packageJson.bin === "string") {
      binPath = packageJson.bin;
    } else if (packageJson.bin && typeof packageJson.bin === "object") {
      binPath =
        packageJson.bin[commandName] ??
        packageJson.bin[path.basename(commandName)] ??
        Object.values(packageJson.bin)[0];
    }

    if (typeof binPath !== "string") {
      return null;
    }
    const resolved = path.resolve(packageRoot, binPath);
    return (await pathExists(resolved)) ? resolved : null;
  } catch {
    return null;
  }
}

async function resolveNpmShim(shimPath, packageName, commandName) {
  const shimDirectory = path.dirname(shimPath);
  const packageRoots = [
    path.join(shimDirectory, "node_modules", ...packageName.split("/")),
    path.join(shimDirectory, "..", ...packageName.split("/")),
  ];

  for (const packageRoot of packageRoots) {
    const binPath = await readPackageBin(packageRoot, commandName);
    if (binPath) {
      return {
        command: process.execPath,
        argsPrefix: [binPath],
        displayName: `${commandName} (${binPath})`,
      };
    }
  }

  throw new CliError(
    `Found ${shimPath}, but could not resolve its JavaScript entry point safely. ` +
      `Pass --tool with the CLI's .js entry file.`,
  );
}

export async function toRunnable(
  executable,
  { npmPackage, commandName = path.basename(executable, path.extname(executable)) } = {},
) {
  const extension = path.extname(executable).toLowerCase();
  if ([".js", ".mjs", ".cjs"].includes(extension)) {
    return {
      command: process.execPath,
      argsPrefix: [executable],
      displayName: executable,
    };
  }

  if (process.platform === "win32" && [".cmd", ".bat"].includes(extension)) {
    if (!npmPackage) {
      throw new CliError(
        `Refusing to invoke shell shim ${executable} without a known package entry point.`,
      );
    }
    return resolveNpmShim(executable, npmPackage, commandName);
  }

  return { command: executable, argsPrefix: [], displayName: executable };
}

export async function findGltfTransform(explicit) {
  const executable = await findExecutable({
    explicit,
    environmentVariable: "HOUSE_ADEL_GLTF_TRANSFORM",
    names: ["gltf-transform"],
    fallbackPaths:
      process.platform === "win32"
        ? [
            path.join(repoRoot, "node_modules", ".bin", "gltf-transform.cmd"),
            process.env.APPDATA &&
              path.join(process.env.APPDATA, "npm", "gltf-transform.cmd"),
          ].filter(Boolean)
        : [path.join(repoRoot, "node_modules", ".bin", "gltf-transform")],
  });

  if (!executable) {
    return null;
  }

  return toRunnable(executable, {
    npmPackage: "@gltf-transform/cli",
    commandName: "gltf-transform",
  });
}

export function formatCommand(runnable, args) {
  const parts = [runnable.command, ...(runnable.argsPrefix ?? []), ...args];
  return parts
    .map((part) =>
      /^[A-Za-z0-9_./:\\=,+-]+$/.test(part) ? part : JSON.stringify(part),
    )
    .join(" ");
}

export function runExternal(
  runnable,
  args,
  { cwd = process.cwd(), capture = false, quiet = false } = {},
) {
  return new Promise((resolve, reject) => {
    const child = spawn(runnable.command, [...(runnable.argsPrefix ?? []), ...args], {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: capture ? ["ignore", "pipe", "pipe"] : quiet ? "ignore" : "inherit",
    });
    let stdout = "";
    let stderr = "";

    if (capture) {
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
    }

    child.on("error", (error) => {
      reject(
        new CliError(
          `Could not start ${runnable.displayName ?? runnable.command}: ${error.message}`,
          1,
        ),
      );
    });
    child.on("close", (code, signal) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
        return;
      }

      const reason = signal ? `signal ${signal}` : `exit code ${code}`;
      const detail = capture && stderr.trim() ? `\n${stderr.trim()}` : "";
      reject(
        new CliError(
          `${runnable.displayName ?? runnable.command} failed with ${reason}.${detail}`,
          1,
        ),
      );
    });
  });
}
