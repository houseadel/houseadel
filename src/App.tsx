import { lazy, Suspense, useEffect, useState } from "react";
import { NotFound } from "./components/NotFound";
import { ReviewHome } from "./components/ReviewHome";
import { StudyPage } from "./components/StudyPage";
import { PreferencesProvider } from "./lib/preferences";
import { useLocation, useRouteEffects } from "./lib/router";

const FracturePrototype = lazy(() =>
  import("./components/prototypes/FracturePrototype").then((module) => ({
    default: module.FracturePrototype,
  })),
);
const HybridPrototype = lazy(() =>
  import("./components/prototypes/HybridPrototype").then((module) => ({
    default: module.HybridPrototype,
  })),
);
const CinematicPrototype = lazy(() =>
  import("./components/prototypes/CinematicPrototype").then((module) => ({
    default: module.CinematicPrototype,
  })),
);

function RouteAnnouncer({ location }: { location: string }) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncement(document.title), 30);
    return () => window.clearTimeout(timer);
  }, [location]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}

function RouterView() {
  const location = useLocation();
  useRouteEffects(location);
  const url = new URL(location, window.location.origin);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  let page;
  if (path === "/") {
    page = <ReviewHome />;
  } else if (path === "/prototypes/fracture") {
    page = <FracturePrototype />;
  } else if (path === "/prototypes/hybrid") {
    page = <HybridPrototype />;
  } else if (path === "/prototypes/cinematic") {
    page = <CinematicPrototype />;
  } else if (path.startsWith("/studies/")) {
    const slug = path.split("/")[2] || "";
    page = <StudyPage slug={slug} search={url.search} />;
  } else {
    page = <NotFound />;
  }

  return (
    <>
      <RouteAnnouncer location={location} />
      <Suspense
        fallback={
          <main className="route-loading" aria-live="polite">
            <span>Preparing isolated prototype…</span>
          </main>
        }
      >
        {page}
      </Suspense>
    </>
  );
}

export function App() {
  return (
    <PreferencesProvider>
      <RouterView />
    </PreferencesProvider>
  );
}
