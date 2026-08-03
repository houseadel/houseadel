// Direct document requests know their first route before React starts. Warming only
// that route removes a second network round trip while preserving route-level chunks.
const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

if (pathname === "/" || pathname === "/private-commissions" || pathname === "/apply") {
  // These business-critical entry points are part of the initial application chunk.
} else if (pathname === "/editions") {
  void import("./pages/EditionsPage");
} else if (pathname.startsWith("/editions/")) {
  void import("./pages/EditionPage");
} else if (pathname === "/stories") {
  void import("./pages/StoriesPage");
} else if (pathname.startsWith("/stories/")) {
  void import("./pages/StoryPage");
} else if (pathname === "/the-house") {
  void import("./pages/TheHousePage");
} else if (pathname === "/application-received") {
  void import("./pages/ApplicationReceivedPage");
} else if (pathname === "/privacy") {
  void import("./pages/PrivacyPage");
} else if (pathname === "/terms") {
  void import("./pages/TermsPage");
} else if (pathname !== "/") {
  void import("./pages/NotFoundPage");
}
