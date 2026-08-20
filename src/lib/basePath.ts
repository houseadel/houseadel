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
  // Flat, deliberately. A subdirectory preview build still uses a relative base,
  // where a route nested more than one level deep would resolve its own asset
  // URLs against its own directory and 404 on a static host — keeping every
  // route at depth one is what makes that base work. The production build now
  // uses an absolute base and does not have this constraint, but this list is
  // still what lets getAppRootPath below recognise a real route and tell it
  // apart from an actual 404 either way.
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

/**
 * Keeps `<link rel="canonical">` pointed at the page actually being read.
 *
 * `index.html` ships with it fixed to the root, which is only ever right for
 * "/": every other route was silently telling crawlers that its content's
 * canonical home was the homepage, which is the kind of signal that gets a
 * page left out of search results entirely rather than merely ranked lower.
 * Called from the same route-change effects that already own the document
 * title, so the two stay in step.
 */
export function updateCanonicalLink(pathname: string) {
  const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) return;
  link.href = pathname === "/" ? "https://houseadel.com/" : `https://houseadel.com${pathname}`;
}
