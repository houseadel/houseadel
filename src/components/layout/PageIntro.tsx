import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  lede: ReactNode;
  children?: ReactNode;
};

export function PageIntro({ eyebrow, title, lede, children }: PageIntroProps) {
  return (
    <header className="page-intro page-frame">
      <p className="page-intro__eyebrow">{eyebrow}</p>
      <h1 className="page-intro__title" data-route-heading tabIndex={-1}>
        {title}
      </h1>
      <div className="page-intro__lede">{lede}</div>
      {children}
    </header>
  );
}
