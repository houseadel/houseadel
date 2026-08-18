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
  // Flat, deliberately. The build uses base "./", so a route nested more than
  // one level deep resolves its own asset URLs against its directory and 404s on
  // a static host. Keeping every route at depth one is what makes that base work.
  "/labs-loader",
  "/enquiry-received",
  "/begin-a-project",
  "/marvell-20",
  "/contact",
  "/privacy",
  "/terms",
  "/studies",
  "/work",
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

  // Anything left is not a known route. It used to be assumed to be a deploy
  // sub-directory and stripped, which silently rendered the homepage for every
  // unrecognised address — the 404 page was unreachable. A path only counts as a
  // base when removing it leaves a route we actually have, which the loop above
  // already tested, so by here there is no base to strip.
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
