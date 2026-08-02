#!/usr/bin/env node

/**
 * Fail-closed open-access image acquisition for House Adel.
 *
 * Run with Node's built-in TypeScript stripping:
 *   node --experimental-strip-types scripts/fetch-open-access-assets.ts --help
 *
 * The script only accepts records carrying an explicit Public Domain or CC0
 * signal from the institution. New records remain pending until a human has
 * reviewed subject matter, context, credit, and intended page use.
 */

import { createHash } from "node:crypto";
import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

type SourceName = "met" | "rijksmuseum" | "smithsonian";
type QueryField = "title" | "description" | "creator" | "type" | "material";

type CliOptions = {
  source: SourceName | null;
  ids: string[];
  query: string | null;
  queryField: QueryField;
  limit: number;
  pages: string[];
  intendedUse: string;
  notes: string;
  dryRun: boolean;
  help: boolean;
};

type NormalizedCandidate = {
  source: SourceName;
  institution: string;
  objectId: string;
  title: string;
  artist: string | null;
  date: string | null;
  canonicalUrl: string;
  imageUrl: string;
  rightsStatus: "public-domain" | "cc0";
  rightsStatement: string;
  rightsUrl: string;
  rightsEvidence: string;
  creditLine: string;
};

type DerivativeRecord = {
  path: string;
  format: "avif" | "webp";
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  transformation: string;
};

type AssetRecord = {
  id: string;
  assetType: "open-access-image";
  intendedUse: string;
  source: {
    institution: string;
    provider: SourceName;
    objectId: string;
    title: string;
    artist: string | null;
    date: string | null;
    canonicalUrl: string;
    imageUrl: string;
  };
  rights: {
    status: "public-domain" | "cc0";
    statement: string;
    url: string;
    commercialUse: true;
    verifiedAt: string;
    evidence: string;
  };
  retrievalDate: string;
  files: {
    original: {
      path: string;
      mimeType: string;
      width: number;
      height: number;
      bytes: number;
      sha256: string;
    };
    derivatives: DerivativeRecord[];
  };
  transformations: string[];
  pages: string[];
  approval: {
    status: "pending";
    approvedBy: null;
    approvedAt: null;
  };
  creditLine: string;
  notes: string;
};

type AssetManifest = {
  schemaVersion: number;
  updatedAt: string;
  policy: {
    eligibleRights: string[];
    approvalRequired: boolean;
    productionUseRequiresApproval: boolean;
  };
  assets: AssetRecord[];
};

type SmithsonianRecord = {
  id?: string;
  title?: string;
  url?: string;
  content?: {
    descriptiveNonRepeating?: {
      data_source?: string;
      record_link?: string;
      online_media?: {
        media?: Array<{
          type?: string;
          usageAccess?: string;
          content?: string;
          thumbnail?: string;
          resources?: Array<{
            url?: string;
            width?: number | string;
            height?: number | string;
            label?: string;
          }>;
        }>;
      };
    };
    freetext?: Record<string, Array<{ label?: string; content?: string }>>;
  };
};

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const manifestPath = path.join(repositoryRoot, "data", "assets.json");
const originalRoot = path.join(repositoryRoot, "assets", "originals", "open-access");
const derivativeRoot = path.join(repositoryRoot, "public", "assets", "open-access");
const maximumSourceBytes = 80 * 1024 * 1024;
const derivativeWidths = [960, 1600, 2400] as const;

const allowedRightsUrls = new Map<string, { status: "public-domain" | "cc0"; label: string }>([
  [
    "creativecommons.org/publicdomain/mark/1.0",
    { status: "public-domain", label: "Public Domain Mark 1.0" },
  ],
  ["creativecommons.org/publicdomain/zero/1.0", { status: "cc0", label: "CC0 1.0" }],
]);

const allowedImageHosts: Record<SourceName, string[]> = {
  met: ["metmuseum.org"],
  rijksmuseum: ["rijksmuseum.nl", "iiif.micr.io"],
  smithsonian: ["si.edu", "smithsonian.org"],
};

class IneligibleAssetError extends Error {}

function printHelp(): void {
  console.log(`House Adel open-access asset acquisition

Usage:
  node --experimental-strip-types scripts/fetch-open-access-assets.ts \\
    --source <met|rijksmuseum|smithsonian> (--id <id>... | --query <text>) [options]

Selection:
  --source <name>          Required institution adapter.
  --id <id>                Explicit object ID; repeat for multiple objects.
  --query <text>           Curated search query. Cannot be combined with --id.
  --query-field <field>    Rijksmuseum field: title, description, creator, type,
                           or material. Default: title.
  --limit <1-12>           Maximum eligible query results to acquire. Default: 1.

Record details:
  --page <route>           Intended page; repeat as needed (for example /stories).
  --use <description>      Intended editorial use recorded in the manifest.
  --notes <text>           Restrictions, context, or replacement notes.

Safety:
  --dry-run                Fetch and validate metadata, but download/write nothing.
  --help                   Show this help.

Environment:
  SMITHSONIAN_API_KEY      Required for Smithsonian API requests.

Examples:
  node --experimental-strip-types scripts/fetch-open-access-assets.ts --source met --id 12068 --dry-run
  node --experimental-strip-types scripts/fetch-open-access-assets.ts --source rijksmuseum --id SK-C-5 --dry-run
  node --experimental-strip-types scripts/fetch-open-access-assets.ts --source smithsonian --query "architectural drawing" --limit 2 --dry-run

Every acquired record remains approval.status = "pending". A human must approve
subject matter and page use in data/assets.json before production use.`);
}

function parseInteger(value: string, argument: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) throw new Error(`${argument} requires an integer.`);
  return parsed;
}

function requireValue(argv: string[], index: number, argument: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value.`);
  return value;
}

function parseArguments(argv: string[]): CliOptions {
  const options: CliOptions = {
    source: null,
    ids: [],
    query: null,
    queryField: "title",
    limit: 1,
    pages: [],
    intendedUse: "Candidate editorial archival material; final placement pending human approval.",
    notes: "Do not present this collection object as wedding photography or client work.",
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }
    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (argument === "--source") {
      const value = requireValue(argv, index, argument);
      if (!(["met", "rijksmuseum", "smithsonian"] as string[]).includes(value)) {
        throw new Error(`Unsupported source "${value}".`);
      }
      options.source = value as SourceName;
      index += 1;
      continue;
    }
    if (argument === "--id") {
      options.ids.push(requireValue(argv, index, argument));
      index += 1;
      continue;
    }
    if (argument === "--query") {
      options.query = requireValue(argv, index, argument);
      index += 1;
      continue;
    }
    if (argument === "--query-field") {
      const value = requireValue(argv, index, argument);
      if (!(["title", "description", "creator", "type", "material"] as string[]).includes(value)) {
        throw new Error(`Unsupported Rijksmuseum query field "${value}".`);
      }
      options.queryField = value as QueryField;
      index += 1;
      continue;
    }
    if (argument === "--limit") {
      options.limit = parseInteger(requireValue(argv, index, argument), argument);
      index += 1;
      continue;
    }
    if (argument === "--page") {
      options.pages.push(requireValue(argv, index, argument));
      index += 1;
      continue;
    }
    if (argument === "--use") {
      options.intendedUse = requireValue(argv, index, argument);
      index += 1;
      continue;
    }
    if (argument === "--notes") {
      options.notes = requireValue(argv, index, argument);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }

  if (options.help) return options;
  if (!options.source) throw new Error("--source is required.");
  if (options.ids.length === 0 && !options.query) {
    throw new Error("Provide at least one --id or one --query.");
  }
  if (options.ids.length > 0 && options.query) {
    throw new Error("--id and --query cannot be combined.");
  }
  if (options.limit < 1 || options.limit > 12) throw new Error("--limit must be between 1 and 12.");
  for (const page of options.pages) {
    if (!page.startsWith("/") || page.includes("..")) {
      throw new Error(`--page must be a safe root-relative route: ${page}`);
    }
  }
  return options;
}

function normalizedRightsUrl(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

function recognizedRights(value: string): { status: "public-domain" | "cc0"; label: string } | null {
  return allowedRightsUrls.get(normalizedRightsUrl(value)) ?? null;
}

function assertAllowedImageUrl(source: SourceName, value: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new IneligibleAssetError(`${source} returned an invalid image URL.`);
  }
  if (parsed.protocol !== "https:") {
    throw new IneligibleAssetError(`${source} image URL is not HTTPS.`);
  }
  const allowed = allowedImageHosts[source].some(
    (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
  );
  if (!allowed) {
    throw new IneligibleAssetError(`${source} returned an image from an unapproved host: ${parsed.hostname}`);
  }
  return parsed;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function decodeXml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .trim();
}

function stripXml(value: string): string {
  return decodeXml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json, application/xml;q=0.9, text/xml;q=0.8",
      "User-Agent": "House-Adel-Asset-Acquisition/1.0",
      ...init.headers,
    },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Request failed (${response.status}) for ${url}`);
  return response;
}

async function fetchJson<T>(url: string): Promise<T> {
  return (await (await fetchWithTimeout(url)).json()) as T;
}

async function fetchText(url: string): Promise<string> {
  return await (await fetchWithTimeout(url)).text();
}

async function fetchMetCandidate(objectId: string): Promise<NormalizedCandidate> {
  const record = await fetchJson<Record<string, unknown>>(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${encodeURIComponent(objectId)}`,
  );
  if (record.isPublicDomain !== true) {
    throw new IneligibleAssetError(`Met object ${objectId} is not marked isPublicDomain=true.`);
  }
  const imageUrl = asNonEmptyString(record.primaryImage);
  if (!imageUrl) throw new IneligibleAssetError(`Met object ${objectId} has no open primary image.`);
  assertAllowedImageUrl("met", imageUrl);

  const canonicalId = String(record.objectID ?? objectId);
  const title = asNonEmptyString(record.title) ?? `Met object ${canonicalId}`;
  const artist = asNonEmptyString(record.artistDisplayName);
  return {
    source: "met",
    institution: "The Metropolitan Museum of Art",
    objectId: canonicalId,
    title,
    artist,
    date: asNonEmptyString(record.objectDate),
    canonicalUrl:
      asNonEmptyString(record.objectURL) ?? `https://www.metmuseum.org/art/collection/search/${canonicalId}`,
    imageUrl,
    rightsStatus: "public-domain",
    rightsStatement: "Public Domain; The Met Collection API reports isPublicDomain=true.",
    rightsUrl: "https://www.metmuseum.org/policies/image-resources",
    rightsEvidence: `Met Collection API object ${canonicalId}: isPublicDomain=true and primaryImage supplied.`,
    creditLine:
      asNonEmptyString(record.creditLine) ??
      `${title}${artist ? `, ${artist}` : ""}. The Metropolitan Museum of Art. Public Domain.`,
  };
}

async function discoverMetIds(query: string, count: number): Promise<string[]> {
  const endpoint = new URL("https://collectionapi.metmuseum.org/public/collection/v1/search");
  endpoint.searchParams.set("hasImages", "true");
  endpoint.searchParams.set("q", query);
  const response = await fetchJson<{ objectIDs?: number[] | null }>(endpoint.toString());
  return (response.objectIDs ?? []).slice(0, count).map(String);
}

function xmlValues(xml: string, tag: string): string[] {
  const expression = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "gi");
  return [...xml.matchAll(expression)].map((match) => stripXml(match[1])).filter(Boolean);
}

function xmlValuesByLanguage(xml: string, tag: string, language: string): string[] {
  const expression = new RegExp(
    `<${tag}[^>]*xml:lang=["']${language}["'][^>]*>([\\s\\S]*?)<\\/${tag}>`,
    "gi",
  );
  return [...xml.matchAll(expression)].map((match) => stripXml(match[1])).filter(Boolean);
}

function xmlResources(xml: string, tag: string): string[] {
  const expression = new RegExp(`<${tag}[^>]*rdf:(?:resource|about)=["']([^"']+)["'][^>]*>`, "gi");
  return [...xml.matchAll(expression)].map((match) => decodeXml(match[1]));
}

function resolveRijksCreator(xml: string): string | null {
  const textCreator = xmlValues(xml, "dc:creator")[0];
  if (textCreator) return textCreator;
  const creatorId = xmlResources(xml, "dc:creator")[0];
  if (!creatorId) return null;
  const escaped = creatorId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const agent = xml.match(
    new RegExp(`<(?:edm|foaf):Agent[^>]*rdf:about=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/(?:edm|foaf):Agent>`, "i"),
  );
  return agent ? xmlValues(agent[1], "skos:prefLabel")[0] ?? null : null;
}

function selectRijksImage(xml: string): string | null {
  const directCandidates = [
    ...xmlResources(xml, "edm:isShownBy"),
    ...xmlResources(xml, "edm:object"),
    ...xmlResources(xml, "edm:preview"),
  ];

  const webResourceExpression = /<edm:WebResource[^>]*rdf:about=["']([^"']+)["'][^>]*>([\s\S]*?)<\/edm:WebResource>/gi;
  for (const match of xml.matchAll(webResourceExpression)) {
    if (xmlValues(match[2], "dc:format").some((format) => format.toLowerCase().startsWith("image/"))) {
      directCandidates.push(decodeXml(match[1]));
    }
  }

  for (const value of directCandidates) {
    try {
      const candidate = assertAllowedImageUrl("rijksmuseum", value);
      if (candidate.hostname === "iiif.micr.io") {
        if (candidate.pathname.endsWith("/info.json")) {
          candidate.pathname = candidate.pathname.replace(/\/info\.json$/, "/full/max/0/default.jpg");
        } else if (candidate.pathname.split("/").filter(Boolean).length === 1) {
          candidate.pathname = `${candidate.pathname.replace(/\/$/, "")}/full/max/0/default.jpg`;
        }
      }
      return candidate.toString();
    } catch (error) {
      if (!(error instanceof IneligibleAssetError)) throw error;
    }
  }
  return null;
}

async function resolveRijksIdentifier(value: string): Promise<string> {
  if (/^(?:https:\/\/id\.rijksmuseum\.nl\/)?\d+$/.test(value)) {
    const identifier = value.replace(/^https:\/\/id\.rijksmuseum\.nl\//, "");
    return `https://id.rijksmuseum.nl/${identifier}`;
  }
  const endpoint = new URL("https://data.rijksmuseum.nl/search/collection");
  endpoint.searchParams.set("objectNumber", value);
  endpoint.searchParams.set("imageAvailable", "true");
  const search = await fetchJson<{ orderedItems?: Array<{ id?: string }> }>(endpoint.toString());
  const identifier = search.orderedItems?.[0]?.id;
  if (!identifier) throw new IneligibleAssetError(`Rijksmuseum object number ${value} was not found with an image.`);
  return identifier;
}

async function fetchRijksCandidate(identifierOrObjectNumber: string): Promise<NormalizedCandidate> {
  const identifier = await resolveRijksIdentifier(identifierOrObjectNumber);
  const endpoint = new URL("https://data.rijksmuseum.nl/oai");
  endpoint.searchParams.set("verb", "GetRecord");
  endpoint.searchParams.set("metadataPrefix", "edm");
  endpoint.searchParams.set("identifier", identifier);
  const xml = await fetchText(endpoint.toString());
  if (/<header[^>]*status=["']deleted["']/i.test(xml)) {
    throw new IneligibleAssetError(`Rijksmuseum record ${identifier} is deleted.`);
  }
  if (/<error\b/i.test(xml)) throw new IneligibleAssetError(`Rijksmuseum did not return record ${identifier}.`);

  const rightsUrls = [...xmlResources(xml, "dc:rights"), ...xmlResources(xml, "edm:rights")];
  const rightsMatch = rightsUrls.map((value) => ({ value, rights: recognizedRights(value) })).find(
    (entry) => entry.rights !== null,
  );
  if (!rightsMatch?.rights) {
    throw new IneligibleAssetError(`Rijksmuseum record ${identifier} has no explicit PDM/CC0 rights resource.`);
  }

  const imageUrl = selectRijksImage(xml);
  if (!imageUrl) {
    throw new IneligibleAssetError(`Rijksmuseum record ${identifier} has no reusable image resource in its EDM record.`);
  }
  const objectId =
    xmlValues(xml, "dc:identifier").find((value) => /[A-Za-z]/.test(value)) ??
    identifier.split("/").at(-1) ??
    identifier;
  const title = xmlValuesByLanguage(xml, "dc:title", "en")[0] ?? xmlValues(xml, "dc:title")[0];
  if (!title) throw new IneligibleAssetError(`Rijksmuseum record ${identifier} has no title.`);
  const artist = resolveRijksCreator(xml);
  const canonicalUrl =
    xmlResources(xml, "edm:isShownAt")[0] ?? `https://www.rijksmuseum.nl/en/collection/${encodeURIComponent(objectId)}`;

  return {
    source: "rijksmuseum",
    institution: "Rijksmuseum",
    objectId,
    title,
    artist,
    date:
      xmlValuesByLanguage(xml, "dcterms:created", "en")[0] ??
      xmlValues(xml, "dcterms:created")[0] ??
      null,
    canonicalUrl,
    imageUrl,
    rightsStatus: rightsMatch.rights.status,
    rightsStatement: `${rightsMatch.rights.label}; explicit rights resource in the Rijksmuseum EDM record.`,
    rightsUrl: rightsMatch.value,
    rightsEvidence: `Rijksmuseum OAI-PMH EDM record ${identifier} includes ${rightsMatch.value}.`,
    creditLine: `${title}${artist ? `, ${artist}` : ""}. Rijksmuseum. ${rightsMatch.rights.label}.`,
  };
}

async function discoverRijksIds(query: string, field: QueryField, count: number): Promise<string[]> {
  const endpoint = new URL("https://data.rijksmuseum.nl/search/collection");
  endpoint.searchParams.set(field, query);
  endpoint.searchParams.set("imageAvailable", "true");
  const response = await fetchJson<{ orderedItems?: Array<{ id?: string }> }>(endpoint.toString());
  return (response.orderedItems ?? [])
    .map((item) => item.id)
    .filter((value): value is string => Boolean(value))
    .slice(0, count);
}

function smithsonianField(
  freetext: Record<string, Array<{ label?: string; content?: string }>> | undefined,
  group: string,
  labelPattern?: RegExp,
): string | null {
  const entries = freetext?.[group] ?? [];
  const match = labelPattern ? entries.find((entry) => labelPattern.test(entry.label ?? "")) : entries[0];
  return asNonEmptyString(match?.content);
}

function numericDimension(value: number | string | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return Number.parseInt(value, 10) || 0;
  return 0;
}

function selectSmithsonianImage(record: SmithsonianRecord): { url: string; usage: string } | null {
  const media = record.content?.descriptiveNonRepeating?.online_media?.media ?? [];
  const eligible = media.filter((item) => /(^|\b)cc0(\b|$)/i.test(item.usageAccess ?? ""));

  const candidates = eligible.flatMap((item) => {
    const resources = (item.resources ?? []).map((resource) => ({
      url: resource.url,
      usage: item.usageAccess ?? "CC0",
      score:
        numericDimension(resource.width) * numericDimension(resource.height) +
        (/high|original|full/i.test(resource.label ?? "") ? 1_000_000_000 : 0),
    }));
    if (item.content) resources.push({ url: item.content, usage: item.usageAccess ?? "CC0", score: 500_000_000 });
    return resources;
  });

  candidates.sort((first, second) => second.score - first.score);
  for (const candidate of candidates) {
    if (!candidate.url) continue;
    try {
      assertAllowedImageUrl("smithsonian", candidate.url);
      return { url: candidate.url, usage: candidate.usage };
    } catch (error) {
      if (!(error instanceof IneligibleAssetError)) throw error;
    }
  }
  return null;
}

async function smithsonianApi<T>(pathname: string, parameters: Record<string, string>): Promise<T> {
  const apiKey = process.env.SMITHSONIAN_API_KEY;
  if (!apiKey) throw new Error("SMITHSONIAN_API_KEY is required for Smithsonian requests.");
  const endpoint = new URL(`https://api.si.edu/openaccess/api/v1.0/${pathname}`);
  endpoint.searchParams.set("api_key", apiKey);
  for (const [name, value] of Object.entries(parameters)) endpoint.searchParams.set(name, value);
  return await fetchJson<T>(endpoint.toString());
}

async function fetchSmithsonianCandidate(objectId: string): Promise<NormalizedCandidate> {
  const response = await smithsonianApi<{ response?: SmithsonianRecord }>(
    `content/${encodeURIComponent(objectId)}`,
    {},
  );
  const record = response.response;
  if (!record) throw new IneligibleAssetError(`Smithsonian record ${objectId} was not found.`);
  const image = selectSmithsonianImage(record);
  if (!image) {
    throw new IneligibleAssetError(`Smithsonian record ${objectId} has no image explicitly marked CC0.`);
  }
  const title = asNonEmptyString(record.title) ?? `Smithsonian object ${objectId}`;
  const freetext = record.content?.freetext;
  const institution =
    asNonEmptyString(record.content?.descriptiveNonRepeating?.data_source) ?? "Smithsonian Institution";
  const canonicalId = asNonEmptyString(record.id) ?? objectId;
  const artist = smithsonianField(freetext, "name", /artist|maker|creator|designer|architect/i);
  const credit = smithsonianField(freetext, "creditLine");

  return {
    source: "smithsonian",
    institution,
    objectId: canonicalId,
    title,
    artist,
    date: smithsonianField(freetext, "date"),
    canonicalUrl:
      asNonEmptyString(record.url) ??
      asNonEmptyString(record.content?.descriptiveNonRepeating?.record_link) ??
      `https://www.si.edu/object/${encodeURIComponent(canonicalId)}`,
    imageUrl: image.url,
    rightsStatus: "cc0",
    rightsStatement: "CC0 1.0; the selected Smithsonian media item reports usageAccess=CC0.",
    rightsUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    rightsEvidence: `Smithsonian Open Access record ${canonicalId}: selected media usageAccess=${image.usage}.`,
    creditLine: credit ?? `${title}${artist ? `, ${artist}` : ""}. ${institution}. CC0.`,
  };
}

async function discoverSmithsonianIds(query: string, count: number): Promise<string[]> {
  const response = await smithsonianApi<{
    response?: { rows?: SmithsonianRecord[] };
  }>("search", {
    q: `online_media_type:"Images" AND (${query})`,
    rows: String(count),
  });
  return (response.response?.rows ?? [])
    .map((record) => record.id)
    .filter((value): value is string => Boolean(value));
}

async function discoverIds(options: CliOptions): Promise<string[]> {
  if (options.ids.length > 0) return options.ids;
  const query = options.query;
  if (!query || !options.source) return [];
  const searchPool = Math.min(options.limit * 8, 64);
  if (options.source === "met") return await discoverMetIds(query, searchPool);
  if (options.source === "rijksmuseum") {
    return await discoverRijksIds(query, options.queryField, searchPool);
  }
  return await discoverSmithsonianIds(query, searchPool);
}

async function fetchCandidate(source: SourceName, objectId: string): Promise<NormalizedCandidate> {
  if (source === "met") return await fetchMetCandidate(objectId);
  if (source === "rijksmuseum") return await fetchRijksCandidate(objectId);
  return await fetchSmithsonianCandidate(objectId);
}

function slug(value: string): string {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  if (!cleaned) throw new Error(`Cannot create a stable file ID from "${value}".`);
  return cleaned;
}

function recordId(candidate: NormalizedCandidate): string {
  return `${candidate.source}-${slug(candidate.objectId)}`;
}

function repositoryPath(absolutePath: string): string {
  const relative = path.relative(repositoryRoot, absolutePath);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Asset path left the repository: ${absolutePath}`);
  }
  return relative.replaceAll("\\", "/");
}

async function pathExists(candidate: string): Promise<boolean> {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function sourceExtension(format: string | undefined): { extension: string; mimeType: string } {
  if (format === "jpeg" || format === "jpg") return { extension: "jpg", mimeType: "image/jpeg" };
  if (format === "png") return { extension: "png", mimeType: "image/png" };
  if (format === "tiff") return { extension: "tif", mimeType: "image/tiff" };
  if (format === "webp") return { extension: "webp", mimeType: "image/webp" };
  if (format === "avif" || format === "heif") return { extension: "avif", mimeType: "image/avif" };
  throw new IneligibleAssetError(`Unsupported source image format: ${format ?? "unknown"}.`);
}

async function downloadSource(candidate: NormalizedCandidate): Promise<Buffer> {
  assertAllowedImageUrl(candidate.source, candidate.imageUrl);
  const response = await fetchWithTimeout(candidate.imageUrl, { headers: { Accept: "image/*" } });
  assertAllowedImageUrl(candidate.source, response.url);
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > maximumSourceBytes) {
    throw new IneligibleAssetError(`Source image exceeds ${maximumSourceBytes} bytes.`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new IneligibleAssetError(`Source returned ${contentType || "an unknown content type"}, not an image.`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > maximumSourceBytes) {
    throw new IneligibleAssetError(`Downloaded image exceeds ${maximumSourceBytes} bytes.`);
  }
  return buffer;
}

async function createDerivativeBuffers(
  source: Buffer,
  assetId: string,
  sourceWidth: number,
): Promise<Array<{ absolutePath: string; record: DerivativeRecord; buffer: Buffer }>> {
  const widths = [...new Set(derivativeWidths.map((width) => Math.min(width, sourceWidth)))].sort(
    (first, second) => first - second,
  );
  const outputs: Array<{ absolutePath: string; record: DerivativeRecord; buffer: Buffer }> = [];

  for (const width of widths) {
    for (const format of ["avif", "webp"] as const) {
      let pipeline = sharp(source).rotate().resize({ width, withoutEnlargement: true, fit: "inside" });
      pipeline = format === "avif" ? pipeline.avif({ quality: 55, effort: 5 }) : pipeline.webp({ quality: 82, effort: 5 });
      const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
      const absolutePath = path.join(derivativeRoot, `${assetId}-${info.width}w.${format}`);
      outputs.push({
        absolutePath,
        buffer: data,
        record: {
          path: repositoryPath(absolutePath),
          format,
          width: info.width,
          height: info.height,
          bytes: data.byteLength,
          sha256: sha256(data),
          transformation: `Auto-oriented; resized to fit within ${width}px width without enlargement; encoded as ${format.toUpperCase()}.`,
        },
      });
    }
  }
  return outputs;
}

async function readManifest(): Promise<AssetManifest> {
  const parsed = JSON.parse(await readFile(manifestPath, "utf8")) as Partial<AssetManifest>;
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.assets) || !parsed.policy) {
    throw new Error("data/assets.json does not match the expected schemaVersion 1 structure.");
  }
  return parsed as AssetManifest;
}

async function writeExclusiveFiles(files: Array<{ path: string; buffer: Buffer }>): Promise<void> {
  const created: string[] = [];
  try {
    for (const file of files) {
      await mkdir(path.dirname(file.path), { recursive: true });
      await writeFile(file.path, file.buffer, { flag: "wx" });
      created.push(file.path);
    }
  } catch (error) {
    await Promise.all(created.map(async (file) => await unlink(file).catch(() => undefined)));
    throw error;
  }
}

async function acquireCandidate(
  candidate: NormalizedCandidate,
  options: CliOptions,
  manifest: AssetManifest,
): Promise<AssetRecord | null> {
  const id = recordId(candidate);
  if (manifest.assets.some((asset) => asset.id === id)) {
    throw new Error(`Manifest already contains ${id}; existing records are never replaced automatically.`);
  }

  console.log(`${options.dryRun ? "ELIGIBLE" : "ACQUIRE"} ${id}: ${candidate.title}`);
  console.log(`  Rights: ${candidate.rightsStatement}`);
  console.log(`  Source: ${candidate.canonicalUrl}`);
  if (options.dryRun) return null;

  const source = await downloadSource(candidate);
  const metadata = await sharp(source).metadata();
  if (!metadata.width || !metadata.height) throw new IneligibleAssetError(`${id} has no readable dimensions.`);
  const sourceFile = sourceExtension(metadata.format);
  const originalPath = path.join(originalRoot, `${id}.${sourceFile.extension}`);
  const derivatives = await createDerivativeBuffers(source, id, metadata.width);
  const allPaths = [originalPath, ...derivatives.map((entry) => entry.absolutePath)];
  const collisions = [];
  for (const candidatePath of allPaths) {
    if (await pathExists(candidatePath)) collisions.push(repositoryPath(candidatePath));
  }
  if (collisions.length > 0) {
    throw new Error(`Refusing to overwrite existing asset files:\n${collisions.map((value) => `- ${value}`).join("\n")}`);
  }

  await writeExclusiveFiles([
    { path: originalPath, buffer: source },
    ...derivatives.map((entry) => ({ path: entry.absolutePath, buffer: entry.buffer })),
  ]);

  const retrievalDate = new Date().toISOString();
  return {
    id,
    assetType: "open-access-image",
    intendedUse: options.intendedUse,
    source: {
      institution: candidate.institution,
      provider: candidate.source,
      objectId: candidate.objectId,
      title: candidate.title,
      artist: candidate.artist,
      date: candidate.date,
      canonicalUrl: candidate.canonicalUrl,
      imageUrl: candidate.imageUrl,
    },
    rights: {
      status: candidate.rightsStatus,
      statement: candidate.rightsStatement,
      url: candidate.rightsUrl,
      commercialUse: true,
      verifiedAt: retrievalDate,
      evidence: candidate.rightsEvidence,
    },
    retrievalDate,
    files: {
      original: {
        path: repositoryPath(originalPath),
        mimeType: sourceFile.mimeType,
        width: metadata.width,
        height: metadata.height,
        bytes: source.byteLength,
        sha256: sha256(source),
      },
      derivatives: derivatives.map((entry) => entry.record),
    },
    transformations: [
      "Original institution-supplied file preserved byte-for-byte outside the public directory.",
      "Derivative exports auto-orient metadata and resize without cropping or enlargement.",
      "WebP quality 82 and AVIF quality 55; no generative fill, retouching, or content alteration.",
    ],
    pages: [...new Set(options.pages)],
    approval: { status: "pending", approvedBy: null, approvedAt: null },
    creditLine: candidate.creditLine,
    notes: options.notes,
  };
}

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const source = options.source;
  if (!source) throw new Error("--source is required.");
  const manifest = await readManifest();
  const identifiers = await discoverIds(options);
  if (identifiers.length === 0) throw new Error("The source returned no matching records.");

  const desired = options.query ? options.limit : identifiers.length;
  const acquired: AssetRecord[] = [];
  let eligible = 0;
  const rejected: string[] = [];

  for (const identifier of identifiers) {
    if (eligible >= desired) break;
    try {
      const candidate = await fetchCandidate(source, identifier);
      const record = await acquireCandidate(candidate, options, manifest);
      eligible += 1;
      if (record) {
        acquired.push(record);
        manifest.assets.push(record);
        manifest.updatedAt = new Date().toISOString();
        await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      }
    } catch (error) {
      if (!options.query || !(error instanceof IneligibleAssetError)) throw error;
      rejected.push(`${identifier}: ${error.message}`);
    }
  }

  if (eligible < desired) {
    const detail = rejected.length ? `\nRejected candidates:\n${rejected.map((value) => `- ${value}`).join("\n")}` : "";
    throw new Error(`Only ${eligible} of ${desired} requested eligible records were found.${detail}`);
  }

  console.log(
    options.dryRun
      ? `Dry run complete: ${eligible} eligible record(s); no media or files were written.`
      : `Acquisition complete: ${acquired.length} record(s) written with approval pending.`,
  );
}

main().catch((error: unknown) => {
  console.error(`Open-access acquisition failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
