import { Link } from "../lib/router";

export function NotFound() {
  return (
    <main className="not-found">
      <p>404 / A route outside the current edition</p>
      <h1 tabIndex={-1} data-route-heading>
        This reality is not in the index.
      </h1>
      <p>The Phase 1 lab keeps recovery conventional even when the concept is spatial.</p>
      <div>
        <Link to="/">Return to direction lab</Link>
        <Link to="/prototypes/fracture">Open Prototype A</Link>
      </div>
    </main>
  );
}
