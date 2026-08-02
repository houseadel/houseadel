import { lazy, Suspense, useEffect, useState, type ReactElement } from "react";
import { SiteLayout } from "./components/layout/SiteLayout";
import { getEdition } from "./data/editions";
import { getStory } from "./data/stories";
import { useLocation, useRouteEffects } from "./lib/router";
import { HomePage } from "./pages/HomePage";

const EditionsPage = lazy(() =>
  import("./pages/EditionsPage").then((module) => ({ default: module.EditionsPage })),
);
const EditionPage = lazy(() =>
  import("./pages/EditionPage").then((module) => ({ default: module.EditionPage })),
);
const PrivateCommissionsPage = lazy(() =>
  import("./pages/PrivateCommissionsPage").then((module) => ({
    default: module.PrivateCommissionsPage,
  })),
);
const StoriesPage = lazy(() =>
  import("./pages/StoriesPage").then((module) => ({ default: module.StoriesPage })),
);
const StoryPage = lazy(() =>
  import("./pages/StoryPage").then((module) => ({ default: module.StoryPage })),
);
const TheHousePage = lazy(() =>
  import("./pages/TheHousePage").then((module) => ({ default: module.TheHousePage })),
);
const ApplyPage = lazy(() =>
  import("./pages/ApplyPage").then((module) => ({ default: module.ApplyPage })),
);
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

type RouteMatch = {
  title: string;
  element: ReactElement;
};

function safeSlug(value: string | undefined) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

function matchRoute(pathname: string, search: string): RouteMatch {
  if (pathname === "/") {
    return {
      title: "House Adel — Digital Invitations and Private Commissions",
      element: <HomePage />,
    };
  }

  if (pathname === "/editions") {
    return { title: "House Editions — House Adel", element: <EditionsPage /> };
  }

  const editionMatch = pathname.match(/^\/editions\/([^/]+)$/);
  if (editionMatch) {
    const slug = safeSlug(editionMatch[1]);
    const edition = getEdition(slug);
    return edition
      ? { title: `${edition.title} — House Adel Edition`, element: <EditionPage slug={slug} /> }
      : { title: "Edition not found — House Adel", element: <NotFoundPage /> };
  }

  if (pathname === "/private-commissions") {
    return {
      title: "Private Commissions — House Adel",
      element: <PrivateCommissionsPage />,
    };
  }

  if (pathname === "/stories") {
    return { title: "Stories — House Adel", element: <StoriesPage /> };
  }

  const storyMatch = pathname.match(/^\/stories\/([^/]+)$/);
  if (storyMatch) {
    const slug = safeSlug(storyMatch[1]);
    const story = getStory(slug);
    return story
      ? { title: `${story.title} — House Adel Story`, element: <StoryPage slug={slug} /> }
      : { title: "Story not found — House Adel", element: <NotFoundPage /> };
  }

  if (pathname === "/the-house") {
    return { title: "The House — House Adel", element: <TheHousePage /> };
  }

  if (pathname === "/apply") {
    return { title: "Apply for a Project — House Adel", element: <ApplyPage /> };
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

export function App() {
  const location = useLocation();
  const url = new URL(location, window.location.origin);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
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
