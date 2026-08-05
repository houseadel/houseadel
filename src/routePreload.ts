// Direct document requests know their first route before React starts. The three
// primary routes are synchronous; utility routes warm only their own chunk.
import { stripAppBasePath } from "./lib/basePath";

const pathname = stripAppBasePath(window.location.pathname.replace(/\/+$/, "")) || "/";

if (
  pathname === "/" ||
  pathname === "/work" ||
  pathname === "/commissions" ||
  pathname === "/private-commissions" ||
  pathname === "/apply" ||
  pathname === "/begin-a-project"
) {
  // Business-critical shells are part of the initial application chunk.
} else if (pathname === "/application-received") {
  void import("./pages/ApplicationReceivedPage");
} else if (pathname === "/privacy") {
  void import("./pages/PrivacyPage");
} else if (pathname === "/terms") {
  void import("./pages/TermsPage");
} else if (pathname !== "/") {
  void import("./pages/NotFoundPage");
}
