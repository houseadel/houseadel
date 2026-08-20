// Direct document requests know their first route before React starts. The
// chapters of the continuous document are synchronous; every other route warms
// only its own chunk.
import { stripAppBasePath } from "./lib/basePath";
import { isChapterPath } from "./lib/chapters";

const pathname = stripAppBasePath(window.location.pathname.replace(/\/+$/, "")) || "/";

if (isChapterPath(pathname)) {
  // Every chapter is the same document, and it is in the initial chunk.
} else if (pathname === "/marvell-20") {
  void import("./pages/MarvellTwentyPage");
} else if (pathname === "/studies") {
  void import("./pages/StudiesPage");
} else if (pathname === "/contact") {
  void import("./pages/ContactPage");
} else if (pathname === "/begin-a-project") {
  void import("./pages/ContactPage");
} else if (pathname === "/enquiry-received") {
  void import("./pages/EnquiryReceivedPage");
} else if (pathname === "/privacy") {
  void import("./pages/PrivacyPage");
} else if (pathname === "/terms") {
  void import("./pages/TermsPage");
} else if (pathname !== "/") {
  void import("./pages/NotFoundPage");
}
