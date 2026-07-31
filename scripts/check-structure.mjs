import { access } from "node:fs/promises";

const required = [
  "README.md",
  "AGENTS.md",
  "package.json",
  ".gitignore",
  ".env.example",
  "docs",
  "research",
  "references",
  "prototypes",
  "public",
  "src",
  "tests",
  "scripts",
  "skills",
];

const missing = [];

for (const entry of required) {
  try {
    await access(new URL(`../${entry}`, import.meta.url));
  } catch {
    missing.push(entry);
  }
}

if (missing.length > 0) {
  console.error(`Missing required repository entries: ${missing.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`Repository foundation present (${required.length} entries).`);
}
