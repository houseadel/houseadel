import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { RealLoaderLab } from "../../labs/loader/RealLoaderLab";
import { PageTransition } from "../motion/PageTransition";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type SiteLayoutProps = {
  children: ReactNode;
  pathname: string;
};

export function SiteLayout({ children, pathname }: SiteLayoutProps) {
  const contentRoot = useRef<HTMLDivElement>(null);
  const criticalPoster = useRef<HTMLImageElement>(null);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const focusMainContent = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById("main-content");
    if (!main) return;
    event.preventDefault();
    main.focus({ preventScroll: false });
  };

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={focusMainContent}>
        Skip to main content
      </a>
      <SiteHeader pathname={pathname} />
      <div ref={contentRoot} className="route-transition" key={pathname}>
        <main id="main-content" tabIndex={-1}>{children}</main>
      </div>
      <SiteFooter />
      <PageTransition />
      <img
        ref={criticalPoster}
        className="loader-preload-image"
        src="/assets/open-access/met-390163-1600w.webp"
        alt=""
        aria-hidden="true"
      />
      {loaderVisible && pathname !== "/labs/loader" && import.meta.env.MODE !== "test" ? (
        <RealLoaderLab
          criticalPoster={criticalPoster}
          contentRoot={contentRoot}
          graphicsMode="auto"
          preview={false}
          visitMode="auto"
          variant="production"
          onComplete={() => setLoaderVisible(false)}
          onReport={() => undefined}
        />
      ) : null}
    </>
  );
}
