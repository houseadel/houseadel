#!/usr/bin/env node

import { spawn } from "node:child_process";

const port = process.argv[2] ?? "4173";
if (!/^\d{2,5}$/.test(port) || Number(port) > 65_535) {
  throw new Error(`Invalid preview port: ${port}`);
}

const npmCommand =
  process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npm";
const npmPrefix =
  process.platform === "win32" ? ["/d", "/s", "/c", "npm.cmd"] : [];

function run(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, [...npmPrefix, ...args], {
      cwd: process.cwd(),
      stdio: "inherit",
      ...options,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`npm ${args.join(" ")} exited from signal ${signal}.`));
      } else {
        resolve(code ?? 1);
      }
    });
  });
}

const buildExit = await run(["run", "build"]);
if (buildExit !== 0) process.exit(buildExit);

const preview = spawn(
  npmCommand,
  [...npmPrefix, "run", "preview", "--", "--port", port, "--strictPort"],
  {
    cwd: process.cwd(),
    stdio: "inherit",
  },
);

const stop = (signal) => {
  if (!preview.killed) preview.kill(signal);
};

process.once("SIGINT", () => stop("SIGINT"));
process.once("SIGTERM", () => stop("SIGTERM"));
preview.once("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
preview.once("exit", (code, signal) => {
  if (signal && signal !== "SIGTERM" && signal !== "SIGINT") {
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 0;
  }
});
