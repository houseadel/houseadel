import { type ReactNode, useEffect, useRef } from "react";
import { Link } from "../lib/router";
import { ModeToolbar } from "./ModeToolbar";

export function PrototypeShell({
  label,
  title,
  children,
  note,
  className = "",
}: {
  label: string;
  title: string;
  children: ReactNode;
  note: string;
  className?: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className={`prototype-page ${className}`.trim()}>
      <a className="skip-link" href="#prototype-stage">
        Skip to prototype
      </a>
      <header className="prototype-header">
        <Link className="prototype-back" to="/#prototypes">
          <span aria-hidden="true">←</span> Direction lab
        </Link>
        <div>
          <p>{label}</p>
          <h1 ref={headingRef} tabIndex={-1} data-route-heading>
            {title}
          </h1>
        </div>
        <ModeToolbar compact />
      </header>
      <div className="prototype-status" role="note">
        {note}
      </div>
      <section id="prototype-stage" className="prototype-stage" aria-label={`${title} interaction`}>
        {children}
      </section>
    </main>
  );
}
