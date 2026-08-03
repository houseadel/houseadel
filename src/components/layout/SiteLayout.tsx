import type { MouseEvent, ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type SiteLayoutProps = {
  children: ReactNode;
  pathname: string;
};

export function SiteLayout({ children, pathname }: SiteLayoutProps) {
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
      <div className="route-transition" key={pathname}>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
