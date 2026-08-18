import { lazy, Suspense, useEffect, useState, type ReactElement } from "react";
import { SiteLayout } from "./components/layout/SiteLayout";
import { AudioProvider } from "./context/AudioContext";
import { LanguageProvider } from "./context/LanguageContext";
import { stripAppBasePath } from "./lib/basePath";
import { useLocation, useRouteEffects } from "./lib/router";
import { chapterForPath, isChapterPath } from "./lib/chapters";
import { HomePage } from "./pages/HomePage";

const MarvellTwentyPage = lazy(() =>
  import("./pages/MarvellTwentyPage").then((module) => ({ default: module.MarvellTwentyPage })),
);
const StudiesPage = lazy(() =>
  import("./pages/StudiesPage").then((module) => ({ default: module.StudiesPage })),
);
const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((module) => ({ default: module.ContactPage })),
);
const EnquiryReceivedPage = lazy(() =>
  import("./pages/EnquiryReceivedPage").then((module) => ({ default: module.EnquiryReceivedPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/PrivacyPage").then((module) => ({ default: module.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import("./pages/TermsPage").then((module) => ({ default: module.TermsPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);
const LoaderLabPage = lazy(() =>
  import("./labs/loader/LoaderLabPage").then((module) => ({ default: module.LoaderLabPage })),
);

type RouteMatch = {
  title: string;
  element: ReactElement;
};

function matchRoute(pathname: string, search: string): RouteMatch {
  // Chapters of the continuous document all render it; which one the reader
  // lands in is decided by scrolling, not by mounting a different tree.
  if (isChapterPath(pathname)) {
    return { title: chapterForPath(pathname)?.title ?? "House Adel", element: <HomePage /> };
  }

  if (pathname === "/marvell-20") {
    return { title: "MARVELL 20 — House Adel", element: <MarvellTwentyPage /> };
  }

  if (pathname === "/studies") {
    return { title: "Studies — House Adel", element: <StudiesPage /> };
  }

  if (pathname === "/contact") {
    return { title: "Contact — House Adel", element: <ContactPage /> };
  }

  if (pathname === "/begin-a-project") {
    return { title: "Contact — House Adel", element: <ContactPage /> };
  }

  if (pathname === "/enquiry-received") {
    return {
      title: "Enquiry Received — House Adel",
      element: <EnquiryReceivedPage search={search} />,
    };
  }

  if (pathname === "/privacy") {
    return { title: "Privacy — House Adel", element: <PrivacyPage /> };
  }

  if (pathname === "/terms") {
    return { title: "Terms — House Adel", element: <TermsPage /> };
  }

  if (pathname === "/labs-loader") {
    return { title: "Loader Lab — House Adel", element: <LoaderLabPage /> };
  }





  return { title: "Page not found — House Adel", element: <NotFoundPage /> };
}

function RouteAnnouncer({ location, title }: { location: string; title: string }) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncement(title), 80);
    return () => window.clearTimeout(timer);
  }, [location, title]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}

function HouseAdelApplication() {
  const location = useLocation();
  const url = new URL(location, window.location.origin);
  const pathname = stripAppBasePath(url.pathname.replace(/\/+$/, "")) || "/";
  const route = matchRoute(pathname, url.search);
  useRouteEffects(location, route.title);

  return (
    <SiteLayout pathname={pathname}>
      <RouteAnnouncer location={location} title={route.title} />
      <Suspense
        fallback={
          <div className="route-loading" role="status">
            Preparing the page
          </div>
        }
      >
        {route.element}
      </Suspense>
    </SiteLayout>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AudioProvider>
        <HouseAdelApplication />
      </AudioProvider>
    </LanguageProvider>
  );
}
