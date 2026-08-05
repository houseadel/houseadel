import { lazy, Suspense, useEffect, useState, type ReactElement } from "react";
import { SiteLayout } from "./components/layout/SiteLayout";
import { AudioProvider } from "./context/AudioContext";
import { LanguageProvider } from "./context/LanguageContext";
import { stripAppBasePath } from "./lib/basePath";
import { useLocation, useRouteEffects } from "./lib/router";
import { CommissionsPage } from "./pages/CommissionsPage";
import { HomePage } from "./pages/HomePage";
import { WorkPage } from "./pages/WorkPage";

const ApplicationReceivedPage = lazy(() =>
  import("./pages/ApplicationReceivedPage").then((module) => ({
    default: module.ApplicationReceivedPage,
  })),
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
  if (pathname === "/") {
    return {
      title: "House Adel — Wedding Websites as Private Worlds",
      element: <HomePage />,
    };
  }

  if (pathname === "/work") {
    return { title: "Work — House Adel", element: <WorkPage /> };
  }

  if (
    pathname === "/commissions" ||
    pathname === "/private-commissions" ||
    pathname === "/apply" ||
    pathname === "/begin-a-project"
  ) {
    return { title: "Commissions — House Adel", element: <CommissionsPage /> };
  }

  if (pathname === "/application-received") {
    return {
      title: "Application Status — House Adel",
      element: <ApplicationReceivedPage search={search} />,
    };
  }

  if (pathname === "/privacy") {
    return { title: "Privacy — House Adel", element: <PrivacyPage /> };
  }

  if (pathname === "/terms") {
    return { title: "Terms — House Adel", element: <TermsPage /> };
  }

  if (pathname === "/labs/loader") {
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
