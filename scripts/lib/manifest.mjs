import { realpath, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { CliError } from "./cli.mjs";
import {
  hashFile,
  isPathInside,
  mediaTypeFor,
  repoRoot,
  resolveRepoReference,
  toPosix,
} from "./files.mjs";

export const MANIFEST_SCHEMA_VERSION = "0.1.0";

const ROLES = [
  "master-frame",
  "background",
  "midground",
  "foreground",
  "portal",
  "mask",
  "depth-map",
  "texture",
  "model",
  "motion-loop",
  "sound",
  "poster",
  "fallback",
  "type-treatment",
  "other",
];
const STATUSES = ["exploration", "candidate", "approved", "rejected", "retired"];
const SOURCE_KINDS = [
  "original",
  "commissioned",
  "licensed",
  "generated",
  "procedural",
  "public-domain",
  "client-supplied",
];
const RIGHTS_CHECKS = ["verified", "restricted", "unknown", "not-applicable"];
const APPROVAL_CHECKS = ["pending", "approved", "rejected"];
const PURPOSES = [
  "desktop",
  "tablet",
  "mobile",
  "reduced-motion",
  "no-webgl",
  "slow-network",
  "poster",
  "social",
  "archive",
];
const QUALITY_TIERS = ["fallback", "low", "medium", "high"];
const STABLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256 = /^[a-f0-9]{64}$/;
const SHARP_RASTER_EXTENSIONS = new Set([
  ".avif",
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".tif",
  ".tiff",
]);

function addIssue(issues, level, code, pointer, message) {
  issues.push({ level, code, pointer, message });
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, pointer, issues) {
  if (!isObject(value)) {
    addIssue(issues, "error", "shape", pointer, "Expected an object.");
    return false;
  }
  return true;
}

function requireArray(value, pointer, issues) {
  if (!Array.isArray(value)) {
    addIssue(issues, "error", "shape", pointer, "Expected an array.");
    return false;
  }
  return true;
}

function requireString(
  value,
  pointer,
  issues,
  { nullable = false, allowEmpty = false } = {},
) {
  if (nullable && value === null) {
    return true;
  }
  if (
    typeof value !== "string" ||
    (!allowEmpty && value.trim() === "")
  ) {
    addIssue(
      issues,
      "error",
      "shape",
      pointer,
      allowEmpty ? "Expected a string." : "Expected a non-empty string.",
    );
    return false;
  }
  return true;
}

function requireDateOnly(value, pointer, issues, { nullable = false } = {}) {
  if (nullable && value === null) {
    return true;
  }
  const valid =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
  if (!valid) {
    addIssue(
      issues,
      "error",
      "date-format",
      pointer,
      nullable
        ? "Expected a YYYY-MM-DD date or null."
        : "Expected a YYYY-MM-DD date.",
    );
  }
  return valid;
}

function requireIsoTimestamp(value, pointer, issues) {
  const match =
    typeof value === "string"
      ? value.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-](\d{2}):(\d{2}))$/,
        )
      : null;
  let valid = false;
  if (match) {
    const [, year, month, day, hour, minute, second, offsetHour, offsetMinute] =
      match;
    const calendarDate = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day)),
    );
    valid =
      calendarDate.getUTCFullYear() === Number(year) &&
      calendarDate.getUTCMonth() === Number(month) - 1 &&
      calendarDate.getUTCDate() === Number(day) &&
      Number(hour) <= 23 &&
      Number(minute) <= 59 &&
      Number(second) <= 59 &&
      (offsetHour === undefined ||
        (Number(offsetHour) <= 23 && Number(offsetMinute) <= 59)) &&
      !Number.isNaN(Date.parse(value));
  }
  if (!valid) {
    addIssue(
      issues,
      "error",
      "date-format",
      pointer,
      "Expected an ISO-8601 timestamp with timezone.",
    );
  }
  return valid;
}

function requireWebUrl(value, pointer, issues, { nullable = false } = {}) {
  if (nullable && value === null) {
    return true;
  }
  let valid = false;
  if (typeof value === "string") {
    try {
      const parsed = new URL(value);
      valid = ["http:", "https:"].includes(parsed.protocol);
    } catch {
      valid = false;
    }
  }
  if (!valid) {
    addIssue(
      issues,
      "error",
      "url-format",
      pointer,
      nullable ? "Expected an HTTP(S) URL or null." : "Expected an HTTP(S) URL.",
    );
  }
  return valid;
}

function requireEnum(value, choices, pointer, issues) {
  if (!choices.includes(value)) {
    addIssue(
      issues,
      "error",
      "enum",
      pointer,
      `Expected one of ${choices.join(", ")}.`,
    );
    return false;
  }
  return true;
}

function validateMediaRecord(record, pointer, issues) {
  if (!requireObject(record, pointer, issues)) {
    return;
  }
  requireString(record.path, `${pointer}.path`, issues);
  requireString(record.mediaType, `${pointer}.mediaType`, issues);

  for (const dimension of ["width", "height"]) {
    const value = record[dimension];
    if (value !== null && (!Number.isSafeInteger(value) || value <= 0)) {
      addIssue(
        issues,
        "error",
        "metadata",
        `${pointer}.${dimension}`,
        "Expected a positive integer or null.",
      );
    }
  }
  if (
    record.durationSeconds !== null &&
    (!Number.isFinite(record.durationSeconds) || record.durationSeconds < 0)
  ) {
    addIssue(
      issues,
      "error",
      "metadata",
      `${pointer}.durationSeconds`,
      "Expected a non-negative number or null.",
    );
  }
  if (!Number.isSafeInteger(record.bytes) || record.bytes < 0) {
    addIssue(
      issues,
      "error",
      "metadata",
      `${pointer}.bytes`,
      "Expected a non-negative integer.",
    );
  }
  if (record.sha256 !== "" && !SHA256.test(record.sha256)) {
    addIssue(
      issues,
      "error",
      "hash-format",
      `${pointer}.sha256`,
      "Expected an empty value or 64 lowercase hexadecimal characters.",
    );
  }
}

function addFileReference(references, reference, pointer, record = null) {
  if (typeof reference === "string" && reference.trim() !== "") {
    references.push({ reference, pointer, record });
  }
}

export function collectManifestReferences(manifest) {
  const references = [];
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  const assetIds = new Set(
    assets.map((asset) => asset?.id).filter((id) => typeof id === "string"),
  );

  addFileReference(references, manifest?.worldBrief, "worldBrief");
  addFileReference(references, manifest?.visualBible, "visualBible");
  addFileReference(references, manifest?.masterFrame, "masterFrame");

  for (const [assetIndex, asset] of assets.entries()) {
    const base = `assets[${assetIndex}]`;
    addFileReference(
      references,
      asset?.source?.promptRecord,
      `${base}.source.promptRecord`,
    );
    const inputAssets = Array.isArray(asset?.source?.inputAssets)
      ? asset.source.inputAssets
      : [];
    for (const [inputIndex, inputAsset] of inputAssets.entries()) {
      if (!assetIds.has(inputAsset)) {
        addFileReference(
          references,
          inputAsset,
          `${base}.source.inputAssets[${inputIndex}]`,
        );
      }
    }
    addFileReference(references, asset?.master?.path, `${base}.master.path`, asset?.master);
    const transforms = Array.isArray(asset?.transforms) ? asset.transforms : [];
    for (const [transformIndex, transform] of transforms.entries()) {
      addFileReference(
        references,
        transform?.settingsRecord,
        `${base}.transforms[${transformIndex}].settingsRecord`,
      );
    }
    const variants = Array.isArray(asset?.variants) ? asset.variants : [];
    for (const [variantIndex, variant] of variants.entries()) {
      const variantBase = `${base}.variants[${variantIndex}]`;
      addFileReference(references, variant?.path, `${variantBase}.path`, variant);
      if (typeof variant?.poster === "string" && !assetIds.has(variant.poster)) {
        addFileReference(references, variant.poster, `${variantBase}.poster`);
      }
    }
  }

  return references;
}

function validatePathReference(reference, issues) {
  if (reference.reference.includes("\\")) {
    addIssue(
      issues,
      "error",
      "path-separator",
      reference.pointer,
      "Manifest paths must use forward slashes on every platform.",
    );
    return null;
  }
  if (
    path.posix.isAbsolute(reference.reference) ||
    path.win32.isAbsolute(reference.reference)
  ) {
    addIssue(
      issues,
      "error",
      "absolute-path",
      reference.pointer,
      "Manifest file paths must be repository-relative.",
    );
    return null;
  }

  const resolved = path.resolve(repoRoot, ...reference.reference.split("/"));
  if (!isPathInside(repoRoot, resolved)) {
    addIssue(
      issues,
      "error",
      "path-escape",
      reference.pointer,
      "Manifest path escapes the repository.",
    );
    return null;
  }
  return resolved;
}

function validateAssetShape(asset, index, issues, assetById) {
  const base = `assets[${index}]`;
  if (!requireObject(asset, base, issues)) {
    return;
  }
  const assetIds = new Set(assetById.keys());

  if (requireString(asset.id, `${base}.id`, issues) && !STABLE_ID.test(asset.id)) {
    addIssue(
      issues,
      "error",
      "id-format",
      `${base}.id`,
      "Use a stable lowercase hyphenated ID.",
    );
  }
  requireEnum(asset.role, ROLES, `${base}.role`, issues);
  requireEnum(asset.status, STATUSES, `${base}.status`, issues);

  if (requireObject(asset.source, `${base}.source`, issues)) {
    requireEnum(asset.source.kind, SOURCE_KINDS, `${base}.source.kind`, issues);
    requireString(asset.source.provider, `${base}.source.provider`, issues);
    requireString(
      asset.source.modelOrCollection,
      `${base}.source.modelOrCollection`,
      issues,
      { nullable: true },
    );
    requireWebUrl(asset.source.sourceUrl, `${base}.source.sourceUrl`, issues, {
      nullable: true,
    });
    requireString(asset.source.creator, `${base}.source.creator`, issues);
    requireDateOnly(asset.source.createdAt, `${base}.source.createdAt`, issues);
    requireString(asset.source.promptRecord, `${base}.source.promptRecord`, issues, {
      nullable: true,
    });
    if (
      !Array.isArray(asset.source.inputAssets) ||
      asset.source.inputAssets.some((entry) => typeof entry !== "string")
    ) {
      addIssue(
        issues,
        "error",
        "shape",
        `${base}.source.inputAssets`,
        "Expected an array of asset IDs or repository-relative paths.",
      );
    }
    requireString(asset.source.seedOrJobId, `${base}.source.seedOrJobId`, issues, {
      nullable: true,
    });
    if (asset.source.kind === "generated") {
      if (asset.source.modelOrCollection === null) {
        addIssue(
          issues,
          "error",
          "provenance",
          `${base}.source.modelOrCollection`,
          "Generated assets require the model or tool collection.",
        );
      }
      if (asset.source.promptRecord === null) {
        addIssue(
          issues,
          "error",
          "provenance",
          `${base}.source.promptRecord`,
          "Generated assets require a prompt record.",
        );
      }
    }
    if (
      ["licensed", "public-domain"].includes(asset.source.kind) &&
      asset.source.sourceUrl === null
    ) {
      addIssue(
        issues,
        "error",
        "provenance",
        `${base}.source.sourceUrl`,
        "Licensed and public-domain assets require an exact source URL.",
      );
    }
  }

  if (requireObject(asset.rights, `${base}.rights`, issues)) {
    requireString(asset.rights.license, `${base}.rights.license`, issues);
    requireWebUrl(asset.rights.licenseUrl, `${base}.rights.licenseUrl`, issues, {
      nullable: true,
    });
    requireEnum(
      asset.rights.commercialUse,
      RIGHTS_CHECKS,
      `${base}.rights.commercialUse`,
      issues,
    );
    requireEnum(
      asset.rights.clientTransferAllowed,
      RIGHTS_CHECKS,
      `${base}.rights.clientTransferAllowed`,
      issues,
    );
    requireString(asset.rights.attribution, `${base}.rights.attribution`, issues);
    requireString(
      asset.rights.territoryOrTermLimits,
      `${base}.rights.territoryOrTermLimits`,
      issues,
      { nullable: true },
    );
    if (typeof asset.rights.sensitiveContentReviewed !== "boolean") {
      addIssue(
        issues,
        "error",
        "shape",
        `${base}.rights.sensitiveContentReviewed`,
        "Expected a boolean.",
      );
    }
    requireString(asset.rights.verifiedBy, `${base}.rights.verifiedBy`, issues, {
      nullable: true,
    });
    requireDateOnly(asset.rights.verifiedAt, `${base}.rights.verifiedAt`, issues, {
      nullable: true,
    });
    requireString(asset.rights.notes, `${base}.rights.notes`, issues, {
      allowEmpty: true,
    });
  }

  validateMediaRecord(asset.master, `${base}.master`, issues);
  if (requireArray(asset.transforms, `${base}.transforms`, issues)) {
    for (const [transformIndex, transform] of asset.transforms.entries()) {
      const transformBase = `${base}.transforms[${transformIndex}]`;
      if (!requireObject(transform, transformBase, issues)) {
        continue;
      }
      requireString(transform.tool, `${transformBase}.tool`, issues);
      requireString(transform.version, `${transformBase}.version`, issues);
      requireString(transform.operation, `${transformBase}.operation`, issues);
      requireString(
        transform.settingsRecord,
        `${transformBase}.settingsRecord`,
        issues,
      );
      requireDateOnly(transform.createdAt, `${transformBase}.createdAt`, issues);
    }
  }
  if (requireArray(asset.variants, `${base}.variants`, issues)) {
    const variantIds = new Set();
    for (const [variantIndex, variant] of asset.variants.entries()) {
      const variantBase = `${base}.variants[${variantIndex}]`;
      validateMediaRecord(variant, variantBase, issues);
      if (!isObject(variant)) {
        continue;
      }
      if (
        requireString(variant.id, `${variantBase}.id`, issues) &&
        !STABLE_ID.test(variant.id)
      ) {
        addIssue(
          issues,
          "error",
          "id-format",
          `${variantBase}.id`,
          "Use a stable lowercase hyphenated ID.",
        );
      }
      if (typeof variant.id === "string" && variantIds.has(variant.id)) {
        addIssue(
          issues,
          "error",
          "duplicate-id",
          `${variantBase}.id`,
          `Duplicate variant ID "${variant.id}".`,
        );
      }
      if (typeof variant.id === "string") {
        variantIds.add(variant.id);
      }
      requireEnum(variant.purpose, PURPOSES, `${variantBase}.purpose`, issues);
      requireEnum(
        variant.qualityTier,
        QUALITY_TIERS,
        `${variantBase}.qualityTier`,
        issues,
      );
      requireString(variant.mediaQuery, `${variantBase}.mediaQuery`, issues, {
        nullable: true,
      });
      requireString(variant.poster, `${variantBase}.poster`, issues, {
        nullable: true,
      });
    }
  }

  if (requireObject(asset.fallback, `${base}.fallback`, issues)) {
    requireString(asset.fallback.alt, `${base}.fallback.alt`, issues, {
      allowEmpty: true,
    });
    if (typeof asset.fallback.decorative !== "boolean") {
      addIssue(
        issues,
        "error",
        "shape",
        `${base}.fallback.decorative`,
        "Expected a boolean.",
      );
    }
    if (
      asset.fallback.decorative === false &&
      (typeof asset.fallback.alt !== "string" || asset.fallback.alt.trim() === "")
    ) {
      addIssue(
        issues,
        "error",
        "missing-alt",
        `${base}.fallback.alt`,
        "A non-decorative asset requires default alternative text.",
      );
    }
    requireString(
      asset.fallback.failureBehavior,
      `${base}.fallback.failureBehavior`,
      issues,
    );
    if (
      asset.fallback.staticAssetId !== null &&
      typeof asset.fallback.staticAssetId !== "string"
    ) {
      addIssue(
        issues,
        "error",
        "shape",
        `${base}.fallback.staticAssetId`,
        "Expected an asset ID or null.",
      );
    } else if (
      typeof asset.fallback.staticAssetId === "string" &&
      !assetIds.has(asset.fallback.staticAssetId)
    ) {
      addIssue(
        issues,
        "error",
        "broken-reference",
        `${base}.fallback.staticAssetId`,
        `Unknown asset ID "${asset.fallback.staticAssetId}".`,
      );
    }
  }

    if (requireObject(asset.approval, `${base}.approval`, issues)) {
    for (const approval of ["creative", "rights", "technical"]) {
      requireEnum(
        asset.approval[approval],
        APPROVAL_CHECKS,
        `${base}.approval.${approval}`,
        issues,
      );
    }
    if (
      asset.status === "approved" &&
      ["creative", "rights", "technical"].some(
        (approval) => asset.approval[approval] !== "approved",
      )
    ) {
      addIssue(
        issues,
        "error",
        "approval-gate",
        `${base}.approval`,
        "An approved asset requires creative, rights, and technical approval.",
      );
    }
    requireString(asset.approval.approvedBy, `${base}.approval.approvedBy`, issues, {
      nullable: true,
    });
    requireDateOnly(
      asset.approval.approvedAt,
      `${base}.approval.approvedAt`,
      issues,
      { nullable: true },
    );
    requireString(asset.approval.notes, `${base}.approval.notes`, issues, {
      allowEmpty: true,
    });
  }

  const variants = Array.isArray(asset.variants) ? asset.variants : [];
  const mediaRecords = [asset.master, ...variants].filter(isObject);
  const recordHasType = (record, prefix) =>
    (typeof record?.mediaType === "string" &&
      record.mediaType.startsWith(prefix)) ||
    (typeof record?.path === "string" &&
      mediaTypeFor(record.path).startsWith(prefix));
  const assetHasStaticImage = (target) => {
    if (!isObject(target)) {
      return false;
    }
    const targetVariants = Array.isArray(target.variants) ? target.variants : [];
    return [target.master, ...targetVariants].some((record) =>
      recordHasType(record, "image/"),
    );
  };
  const hasVideo = mediaRecords.some((record) => recordHasType(record, "video/"));
  const hasModel =
    asset.role === "model" ||
    mediaRecords.some((record) => recordHasType(record, "model/"));
  const hasPosterRelationship = variants.some(
    (variant) => {
      if (variant?.purpose === "poster" && recordHasType(variant, "image/")) {
        return true;
      }
      if (typeof variant?.poster !== "string" || variant.poster.trim() === "") {
        return false;
      }
      const posterAsset = assetById.get(variant.poster);
      return posterAsset
        ? posterAsset.role === "poster" && assetHasStaticImage(posterAsset)
        : mediaTypeFor(variant.poster).startsWith("image/");
    },
  );
  const hasSeparateStaticFallback =
    typeof asset.fallback?.staticAssetId === "string" &&
    asset.fallback.staticAssetId !== asset.id;
  const fallbackAsset = assetById.get(asset.fallback?.staticAssetId);
  const hasPosterFallback =
    hasSeparateStaticFallback &&
    fallbackAsset?.role === "poster" &&
    assetHasStaticImage(fallbackAsset);
  if (hasVideo && !hasPosterRelationship && !hasPosterFallback) {
    addIssue(
      issues,
      "error",
      "missing-poster",
      `${base}.variants`,
      "Every video requires a poster relationship or separate static fallback asset.",
    );
  }
  if (
    hasModel &&
    (!hasSeparateStaticFallback || !assetHasStaticImage(fallbackAsset))
  ) {
    addIssue(
      issues,
      "error",
      "missing-fallback",
      `${base}.fallback.staticAssetId`,
      "A model requires a separate static no-WebGL fallback asset.",
    );
  }
}

async function verifyReferencedFiles(references, issues, verifyHashes) {
  const statCache = new Map();
  const hashCache = new Map();
  const metadataCache = new Map();
  const realPathCache = new Map();
  const realRepoRoot = await realpath(repoRoot);

  for (const reference of references) {
    const resolved = validatePathReference(reference, issues);
    if (!resolved) {
      continue;
    }

    let details;
    if (statCache.has(resolved)) {
      details = statCache.get(resolved);
    } else {
      try {
        details = await stat(resolved);
        statCache.set(resolved, details);
      } catch (error) {
        if (error?.code === "ENOENT") {
          addIssue(
            issues,
            "error",
            "missing-file",
            reference.pointer,
            `Referenced file does not exist: ${reference.reference}`,
          );
          continue;
        }
        throw error;
      }
    }

    if (!details.isFile()) {
      addIssue(
        issues,
        "error",
        "not-a-file",
        reference.pointer,
        `Reference is not a file: ${reference.reference}`,
      );
      continue;
    }
    let canonicalPath = realPathCache.get(resolved);
    if (!canonicalPath) {
      canonicalPath = await realpath(resolved);
      realPathCache.set(resolved, canonicalPath);
    }
    if (!isPathInside(realRepoRoot, canonicalPath)) {
      addIssue(
        issues,
        "error",
        "path-escape",
        reference.pointer,
        `Referenced file resolves outside the repository: ${reference.reference}`,
      );
      continue;
    }

    const record = reference.record;
    if (!record) {
      continue;
    }
    if (record.bytes === 0) {
      addIssue(
        issues,
        "warning",
        "metadata-empty",
        reference.pointer.replace(/\.path$/, ".bytes"),
        `Recorded byte size is empty; actual size is ${details.size}.`,
      );
    } else if (Number.isSafeInteger(record.bytes) && record.bytes !== details.size) {
      addIssue(
        issues,
        "error",
        "size-mismatch",
        reference.pointer.replace(/\.path$/, ".bytes"),
        `Recorded ${record.bytes} bytes, found ${details.size}.`,
      );
    }

    const actualMediaType = mediaTypeFor(resolved);
    if (
      typeof record.mediaType === "string" &&
      actualMediaType !== "application/octet-stream" &&
      record.mediaType !== actualMediaType
    ) {
      addIssue(
        issues,
        "error",
        "media-type-mismatch",
        reference.pointer.replace(/\.path$/, ".mediaType"),
        `Recorded ${record.mediaType}, extension implies ${actualMediaType}.`,
      );
    }

    if (record.sha256 === "") {
      addIssue(
        issues,
        "warning",
        "hash-empty",
        reference.pointer.replace(/\.path$/, ".sha256"),
        "SHA-256 has not been recorded.",
      );
    } else if (verifyHashes && SHA256.test(record.sha256)) {
      let actualHash = hashCache.get(resolved);
      if (!actualHash) {
        actualHash = await hashFile(resolved);
        hashCache.set(resolved, actualHash);
      }
      if (actualHash !== record.sha256) {
        addIssue(
          issues,
          "error",
          "hash-mismatch",
          reference.pointer.replace(/\.path$/, ".sha256"),
          `Recorded hash does not match ${reference.reference}.`,
        );
      }
    }

    if (SHARP_RASTER_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
      let metadata = metadataCache.get(resolved);
      if (!metadata) {
        try {
          metadata = await sharp(resolved, { failOn: "error" }).metadata();
          metadataCache.set(resolved, metadata);
        } catch (error) {
          addIssue(
            issues,
            "error",
            "decode-failed",
            reference.pointer,
            `Image could not be decoded: ${error.message}`,
          );
          continue;
        }
      }
      if (
        Number.isSafeInteger(record.width) &&
        Number.isSafeInteger(record.height) &&
        (metadata.width !== record.width || metadata.height !== record.height)
      ) {
        addIssue(
          issues,
          "error",
          "dimension-mismatch",
          reference.pointer,
          `Recorded ${record.width}x${record.height}, found ${metadata.width}x${metadata.height}.`,
        );
      }
    }
  }
}

function validateProductionGates(manifest, issues) {
  const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
  const isPublicDeliveryPath = (recordPath) => {
    if (
      typeof recordPath !== "string" ||
      recordPath.includes("\\") ||
      path.posix.isAbsolute(recordPath) ||
      path.win32.isAbsolute(recordPath)
    ) {
      return false;
    }
    const resolved = path.resolve(repoRoot, ...recordPath.split("/"));
    if (!isPathInside(repoRoot, resolved)) {
      return false;
    }
    const relative = toPosix(path.relative(repoRoot, resolved));
    const comparable = process.platform === "win32" ? relative.toLowerCase() : relative;
    return comparable === "public" || comparable.startsWith("public/");
  };

  for (const [index, asset] of assets.entries()) {
    if (!isObject(asset)) {
      continue;
    }
    const base = `assets[${index}]`;
    const variants = Array.isArray(asset.variants) ? asset.variants : [];
    const deliveryRecords = [asset.master, ...variants].filter(
      (record) => isPublicDeliveryPath(record?.path),
    );
    if (deliveryRecords.length > 0 && asset.status !== "approved") {
      addIssue(
        issues,
        "error",
        "approval-gate",
        `${base}.status`,
        "A public delivery file must belong to an approved asset.",
      );
    }
    if (asset.status !== "approved") {
      continue;
    }
    const mediaRecords = [asset.master, ...variants].filter(isObject);
    for (const [recordIndex, record] of mediaRecords.entries()) {
      const pointer =
        recordIndex === 0
          ? `${base}.master`
          : `${base}.variants[${recordIndex - 1}]`;
      if (record.bytes === 0) {
        addIssue(
          issues,
          "error",
          "metadata-gate",
          `${pointer}.bytes`,
          "An approved production file requires a recorded byte size.",
        );
      }
      if (!SHA256.test(record.sha256 ?? "")) {
        addIssue(
          issues,
          "error",
          "metadata-gate",
          `${pointer}.sha256`,
          "An approved production file requires a recorded SHA-256.",
        );
      }
    }
    if (!["verified", "not-applicable"].includes(asset.rights?.commercialUse)) {
      addIssue(
        issues,
        "error",
        "rights-gate",
        `${base}.rights.commercialUse`,
        "An approved production asset requires verified commercial-use rights.",
      );
    }
    if (!["verified", "not-applicable"].includes(asset.rights?.clientTransferAllowed)) {
      addIssue(
        issues,
        "error",
        "rights-gate",
        `${base}.rights.clientTransferAllowed`,
        "An approved production asset requires a verified client-transfer position.",
      );
    }
    if (!asset.rights?.verifiedBy || !asset.rights?.verifiedAt) {
      addIssue(
        issues,
        "error",
        "rights-gate",
        `${base}.rights`,
        "An approved production asset requires human rights verification and date.",
      );
    }
    if (asset.rights?.sensitiveContentReviewed !== true) {
      addIssue(
        issues,
        "error",
        "rights-gate",
        `${base}.rights.sensitiveContentReviewed`,
        "An approved production asset requires a completed sensitive-content review.",
      );
    }
    if (
      ["generated", "licensed", "public-domain"].includes(asset.source?.kind) &&
      !asset.rights?.licenseUrl
    ) {
      addIssue(
        issues,
        "error",
        "rights-gate",
        `${base}.rights.licenseUrl`,
        "This production source type requires a recorded license or terms URL.",
      );
    }
    if (
      typeof asset.rights?.attribution !== "string" ||
      ["", "unknown"].includes(asset.rights.attribution.trim().toLowerCase())
    ) {
      addIssue(
        issues,
        "error",
        "rights-gate",
        `${base}.rights.attribution`,
        "An approved production asset requires a resolved attribution requirement.",
      );
    }
    if (
      asset.source?.kind === "generated" &&
      (!asset.source.promptRecord || !asset.source.modelOrCollection)
    ) {
      addIssue(
        issues,
        "error",
        "provenance-gate",
        `${base}.source`,
        "An approved generated asset requires a prompt record and model/tool record.",
      );
    }
    if (
      ["licensed", "public-domain"].includes(asset.source?.kind) &&
      !asset.source?.sourceUrl
    ) {
      addIssue(
        issues,
        "error",
        "provenance-gate",
        `${base}.source.sourceUrl`,
        "An approved sourced asset requires its exact source URL.",
      );
    }
    if (!asset.approval?.approvedBy || !asset.approval?.approvedAt) {
      addIssue(
        issues,
        "error",
        "approval-gate",
        `${base}.approval`,
        "An approved production asset requires an approver and approval date.",
      );
    }
  }
}

export async function validateManifest(
  manifest,
  { verifyFiles = true, verifyHashes = true, production = false } = {},
) {
  const issues = [];
  if (!requireObject(manifest, "$", issues)) {
    return issues;
  }

  if (manifest.schemaVersion !== MANIFEST_SCHEMA_VERSION) {
    addIssue(
      issues,
      "error",
      "schema-version",
      "schemaVersion",
      `Expected schema version ${MANIFEST_SCHEMA_VERSION}.`,
    );
  }
  if (
    requireString(manifest.universeId, "universeId", issues) &&
    !STABLE_ID.test(manifest.universeId)
  ) {
    addIssue(
      issues,
      "error",
      "id-format",
      "universeId",
      "Use a stable lowercase hyphenated universe ID.",
    );
  }
  requireString(manifest.worldBrief, "worldBrief", issues, { nullable: true });
  requireString(manifest.visualBible, "visualBible", issues, { nullable: true });
  requireString(manifest.masterFrame, "masterFrame", issues, { nullable: true });
  requireIsoTimestamp(manifest.updatedAt, "updatedAt", issues);

  if (requireArray(manifest.assets, "assets", issues)) {
    const assetById = new Map(
      manifest.assets
        .filter((asset) => typeof asset?.id === "string")
        .map((asset) => [asset.id, asset]),
    );
    const seenIds = new Set();
    for (const [index, asset] of manifest.assets.entries()) {
      const assetId =
        isObject(asset) && typeof asset.id === "string" ? asset.id : null;
      if (assetId && seenIds.has(assetId)) {
        addIssue(
          issues,
          "error",
          "duplicate-id",
          `assets[${index}].id`,
          `Duplicate asset ID "${assetId}".`,
        );
      }
      if (assetId) {
        seenIds.add(assetId);
      }
      validateAssetShape(asset, index, issues, assetById);
    }
  }

  if (production) {
    validateProductionGates(manifest, issues);
  }
  const references = collectManifestReferences(manifest);
  if (verifyFiles) {
    await verifyReferencedFiles(
      references,
      issues,
      verifyHashes,
    );
  } else {
    for (const reference of references) {
      validatePathReference(reference, issues);
    }
  }
  return issues;
}

async function imageMetadata(filePath, mediaType) {
  if (
    !mediaType.startsWith("image/") ||
    !SHARP_RASTER_EXTENSIONS.has(path.extname(filePath).toLowerCase())
  ) {
    return null;
  }
  const metadata = await sharp(filePath, { failOn: "error" }).metadata();
  return {
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  };
}

export async function refreshManifestMetadata(manifest) {
  const updated = structuredClone(manifest);
  const changes = [];
  const realRepoRoot = await realpath(repoRoot);

  const assets = Array.isArray(updated.assets) ? updated.assets : [];
  for (const [assetIndex, asset] of assets.entries()) {
    const variants = Array.isArray(asset?.variants) ? asset.variants : [];
    const records = [
      { record: asset?.master, pointer: `assets[${assetIndex}].master` },
      ...variants.map((variant, variantIndex) => ({
        record: variant,
        pointer: `assets[${assetIndex}].variants[${variantIndex}]`,
      })),
    ];

    for (const { record, pointer } of records) {
      if (!isObject(record) || typeof record.path !== "string") {
        continue;
      }
      const resolved = resolveRepoReference(record.path);
      let details;
      try {
        details = await stat(resolved);
      } catch (error) {
        if (error?.code === "ENOENT") {
          throw new CliError(`Cannot update missing file: ${record.path}`);
        }
        throw error;
      }
      if (!details.isFile()) {
        throw new CliError(`Cannot update non-file reference: ${record.path}`);
      }
      const canonicalPath = await realpath(resolved);
      if (!isPathInside(realRepoRoot, canonicalPath)) {
        throw new CliError(
          `Cannot update a file that resolves outside the repository: ${record.path}`,
        );
      }

      const nextValues = {
        bytes: details.size,
        sha256: await hashFile(resolved),
        mediaType: mediaTypeFor(resolved),
      };
      const dimensions = await imageMetadata(resolved, nextValues.mediaType);
      if (dimensions) {
        nextValues.width = dimensions.width;
        nextValues.height = dimensions.height;
      }

      for (const [field, nextValue] of Object.entries(nextValues)) {
        if (record[field] !== nextValue) {
          changes.push({
            pointer: `${pointer}.${field}`,
            from: record[field] ?? null,
            to: nextValue,
          });
          record[field] = nextValue;
        }
      }
    }
  }

  return { manifest: updated, changes };
}

export function createManifestTemplate({
  universeId,
  worldBrief = null,
  visualBible = null,
  masterFrame = null,
}) {
  if (!STABLE_ID.test(universeId)) {
    throw new CliError(
      "--universe-id must contain lowercase ASCII letters, numbers, and single hyphens.",
    );
  }
  const normalizeReference = (reference, label) => {
    if (reference === null) {
      return null;
    }
    if (typeof reference !== "string" || reference.trim() === "") {
      throw new CliError(`${label} must be a repository-relative path or null.`);
    }
    if (path.posix.isAbsolute(reference) || path.win32.isAbsolute(reference)) {
      throw new CliError(`${label} must be repository-relative.`);
    }
    if (process.platform !== "win32" && reference.includes("\\")) {
      throw new CliError(
        `${label} must use forward slashes on this platform.`,
      );
    }
    const resolved = path.resolve(repoRoot, reference);
    if (!isPathInside(repoRoot, resolved)) {
      throw new CliError(`${label} escapes the repository.`);
    }
    return toPosix(path.relative(repoRoot, resolved));
  };
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    universeId,
    worldBrief: normalizeReference(worldBrief, "--world-brief"),
    visualBible: normalizeReference(visualBible, "--visual-bible"),
    masterFrame: normalizeReference(masterFrame, "--master-frame"),
    updatedAt: new Date().toISOString(),
    assets: [],
  };
}
