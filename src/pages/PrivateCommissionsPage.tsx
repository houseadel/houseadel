import { lazy, Suspense } from "react";
import { PageIntro } from "../components/layout/PageIntro";
import { Link } from "../lib/router";

const PrivateCommissionsContent = lazy(() =>
  import("../features/commissions/PrivateCommissionsContent").then((module) => ({
    default: module.PrivateCommissionsContent,
  })),
);

export function PrivateCommissionsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Private Commissions"
        title="Created once. Never repeated."
        lede="A one-of-one digital invitation and guest experience, art-directed from the source material of a particular celebration."
      >
        <div className="intro-actions">
          <Link className="button-link button-link--garnet" to="/apply">
            Apply for a commission
          </Link>
          <a className="text-link" href="#commissioning">
            How commissioning works
          </a>
        </div>
      </PageIntro>

      <Suspense
        fallback={
          <p className="route-section-loading page-frame" role="status">
            Preparing the atelier
          </p>
        }
      >
        <PrivateCommissionsContent />
      </Suspense>
    </>
  );
}
