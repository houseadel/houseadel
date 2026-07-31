export class CliError extends Error {
  constructor(message, exitCode = 2) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
  }
}

function optionLabel(definition, key) {
  return `--${definition.long ?? key}`;
}

function parseBoolean(value, label) {
  if (value === undefined) {
    return true;
  }

  if (["true", "1", "yes", "on"].includes(value.toLowerCase())) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(value.toLowerCase())) {
    return false;
  }

  throw new CliError(`${label} expects true or false, received "${value}".`);
}

export function parseArgs(argv, definitions = {}) {
  const byLong = new Map();
  const byAlias = new Map();
  const values = {};
  const positionals = [];

  for (const [key, definition] of Object.entries(definitions)) {
    const normalized = {
      type: "string",
      multiple: false,
      ...definition,
    };
    const long = normalized.long ?? key;
    byLong.set(long, [key, normalized]);

    const aliases = Array.isArray(normalized.alias)
      ? normalized.alias
      : normalized.alias
        ? [normalized.alias]
        : [];

    for (const alias of aliases) {
      byAlias.set(alias, [key, normalized]);
    }

    if (normalized.default !== undefined) {
      values[key] = normalized.default;
    } else if (normalized.multiple) {
      values[key] = [];
    }
  }

  const setValue = (key, definition, rawValue, label) => {
    let value;
    if (definition.type === "boolean") {
      value = parseBoolean(rawValue, label);
    } else {
      if (rawValue === undefined || rawValue === "") {
        throw new CliError(`${label} requires a value.`);
      }
      value = rawValue;
    }

    if (definition.multiple) {
      values[key] ??= [];
      values[key].push(value);
    } else {
      values[key] = value;
    }
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--") {
      positionals.push(...argv.slice(index + 1));
      break;
    }

    if (token.startsWith("--")) {
      const equalsIndex = token.indexOf("=");
      const rawName = token.slice(2, equalsIndex === -1 ? undefined : equalsIndex);
      const inlineValue = equalsIndex === -1 ? undefined : token.slice(equalsIndex + 1);
      const negated = rawName.startsWith("no-");
      const name = negated ? rawName.slice(3) : rawName;
      const entry = byLong.get(name);

      if (!entry) {
        throw new CliError(`Unknown option --${rawName}. Use --help for usage.`);
      }

      const [key, definition] = entry;
      if (negated) {
        if (definition.type !== "boolean") {
          throw new CliError(`--no-${name} is only valid for boolean options.`);
        }
        if (inlineValue !== undefined) {
          throw new CliError(`--no-${name} does not accept a value.`);
        }
        setValue(key, definition, "false", `--no-${name}`);
        continue;
      }

      if (definition.type === "boolean") {
        setValue(key, definition, inlineValue, optionLabel(definition, key));
      } else {
        const rawValue = inlineValue ?? argv[index + 1];
        if (
          inlineValue === undefined &&
          typeof rawValue === "string" &&
          rawValue.startsWith("-") &&
          !definition.allowOptionValue
        ) {
          throw new CliError(`${optionLabel(definition, key)} requires a value.`);
        }
        if (inlineValue === undefined) {
          index += 1;
        }
        setValue(key, definition, rawValue, optionLabel(definition, key));
      }
      continue;
    }

    if (token.startsWith("-") && token !== "-") {
      const alias = token.slice(1);
      const entry = byAlias.get(alias);
      if (!entry) {
        throw new CliError(`Unknown option -${alias}. Use --help for usage.`);
      }

      const [key, definition] = entry;
      if (definition.type === "boolean") {
        setValue(key, definition, undefined, `-${alias}`);
      } else {
        const rawValue = argv[index + 1];
        if (
          typeof rawValue === "string" &&
          rawValue.startsWith("-") &&
          !definition.allowOptionValue
        ) {
          throw new CliError(`-${alias} requires a value.`);
        }
        index += 1;
        setValue(key, definition, rawValue, `-${alias}`);
      }
      continue;
    }

    positionals.push(token);
  }

  return { options: values, positionals };
}

export function parseInteger(value, label, { min, max } = {}) {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) {
    throw new CliError(`${label} must be an integer, received "${value}".`);
  }
  if (min !== undefined && number < min) {
    throw new CliError(`${label} must be at least ${min}.`);
  }
  if (max !== undefined && number > max) {
    throw new CliError(`${label} must be at most ${max}.`);
  }
  return number;
}

export function parseNumber(value, label, { min, max } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new CliError(`${label} must be a finite number, received "${value}".`);
  }
  if (min !== undefined && number < min) {
    throw new CliError(`${label} must be at least ${min}.`);
  }
  if (max !== undefined && number > max) {
    throw new CliError(`${label} must be at most ${max}.`);
  }
  return number;
}

export function parseCsv(value, label) {
  const items = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    throw new CliError(`${label} must contain at least one value.`);
  }

  return [...new Set(items)];
}

export function parseChoice(value, label, choices) {
  if (!choices.includes(value)) {
    throw new CliError(
      `${label} must be one of ${choices.join(", ")}; received "${value}".`,
    );
  }
  return value;
}

export function parseByteSize(value, label) {
  const match = String(value)
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*(b|kb|kib|mb|mib|gb|gib)?$/i);
  if (!match) {
    throw new CliError(
      `${label} must be a byte size such as 500KB, 2MiB, or 1200000.`,
    );
  }

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) {
    throw new CliError(`${label} is too large.`);
  }
  const unit = (match[2] ?? "b").toLowerCase();
  const multipliers = {
    b: 1,
    kb: 1_000,
    kib: 1_024,
    mb: 1_000_000,
    mib: 1_048_576,
    gb: 1_000_000_000,
    gib: 1_073_741_824,
  };
  return Math.round(amount * multipliers[unit]);
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "unknown";
  }

  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = unitIndex === 0 ? 0 : value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

export function printHelp(text) {
  process.stdout.write(`${text.trim()}\n`);
}

export async function runCli(main) {
  try {
    await main();
  } catch (error) {
    if (error instanceof CliError) {
      console.error(`Error: ${error.message}`);
      process.exitCode = error.exitCode;
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`Unexpected error: ${message}`);
    if (process.env.HOUSE_ADEL_DEBUG === "1" && error instanceof Error) {
      console.error(error.stack);
    }
    process.exitCode = 1;
  }
}
