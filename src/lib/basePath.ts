const rawBaseUrl = import.meta.env.BASE_URL ?? "/";

function normalizeBaseUrl(value: string) {
  if (value === "" || value === "./") return "./";
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeBasePath(baseUrl: string) {
  if (!baseUrl.startsWith("/")) return "";
  return baseUrl.replace(/\/+$|^\/+/g, "");
}

const knownRouteSuffixes = [
  "/labs/loader",
  "/application-received",
  "/private-commissions",
  "/begin-a-project",
  "/commissions",
  "/privacy",
  "/terms",
  "/work",
  "/apply",
  "/",
];

export const appBaseUrl = normalizeBaseUrl(rawBaseUrl);
export const appBasePath = normalizeBasePath(appBaseUrl);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAppRootPath(pathname: string) {
  if (appBasePath) {
    return `/${appBasePath}`;
  }

  const normalized = pathname.replace(/\/+$|^\/+/g, "");
  if (!normalized) return "/";
  const path = `/${normalized}`;

  for (const suffix of knownRouteSuffixes) {
    if (suffix === "/") continue;
    if (path === suffix) return "/";
    if (path.endsWith(suffix) && path.length > suffix.length) {
      const prefix = path.slice(0, -suffix.length);
      return prefix === "" ? "/" : prefix;
    }
  }

  const segments = normalized.split("/");
  if (segments.length === 1) {
    return `/${segments[0]}`;
  }

  return "/";
}

export function stripAppBasePath(pathname: string) {
  const rootPath = getAppRootPath(pathname);
  if (rootPath === "/") return pathname || "/";
  return pathname.replace(new RegExp(`^${escapeRegExp(rootPath)}`), "") || "/";
}

function isExternal(to: string) {
  return /^(?:https?:|mailto:|tel:)/i.test(to);
}

export function resolveAppUrl(to: string) {
  if (isExternal(to) || to.startsWith("#") || !to.startsWith("/")) {
    return to;
  }

  if (appBaseUrl === "./") {
    return to === "/" ? "./" : `.${to}`;
  }

  return to === "/" ? appBaseUrl : `${appBaseUrl.replace(/\/$/, "")}${to}`;
}
