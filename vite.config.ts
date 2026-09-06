import { resolve } from "node:path";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

/**
 * The dev server's own stylesheets, let through the page's CSP.
 *
 * `index.html` carries a real Content-Security-Policy for the hosts that never
 * see `public/_headers` — `vite preview`, the Playwright suite, any static host
 * that ignores it. Its `style-src 'self'` is correct for every one of those,
 * because a production build emits CSS as a linked stylesheet from this origin.
 *
 * The dev server does not. It delivers every CSS module as an inline `<style>`
 * element, which `'self'` refuses without `'unsafe-inline'` — so `npm run dev`
 * rendered the whole site unstyled: seventeen style tags in the document,
 * `document.styleSheets.length` of zero, body falling back to Times on a
 * transparent ground. Nothing in the verification suite caught it, because
 * `scripts/serve-tests.mjs` builds and previews rather than serving dev.
 *
 * So the one directive dev structurally cannot satisfy is relaxed, and only
 * while serving. The rest of the policy stays live in development on purpose:
 * a `script-src` or `connect-src` mistake should still surface in the console
 * while the work is being done, rather than at preview time. `apply: "serve"`
 * keeps this plugin out of the build entirely, so what ships is byte-for-byte
 * the policy written in `index.html`.
 */
function devCspAllowsInlineStyles(): PluginOption {
  const directive = "style-src 'self'";
  return {
    name: "house-adel:dev-csp-inline-styles",
    apply: "serve",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (!html.includes(directive)) {
          // The policy has been rewritten and this no longer knows where to aim.
          // Failing loudly beats silently serving an unstyled dev server again.
          throw new Error(
            `Expected "${directive}" in index.html's Content-Security-Policy. ` +
              "Update house-adel:dev-csp-inline-styles in vite.config.ts to match the new policy.",
          );
        }
        return html.replace(directive, `${directive} 'unsafe-inline'`);
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const loadedEnvironment = loadEnv(mode, process.cwd(), "");
  const environment = { ...process.env, ...loadedEnvironment };

  return {
    // Absolute, because the production target is a root-domain deployment
    // (houseadel.com via Cloudflare Pages), not a project subdirectory. This
    // also removes the "every route must stay flat, one segment deep" constraint
    // a relative base required — see src/lib/basePath.ts, whose suffix-matching
    // already resolves an absolute base to the root path for every real route
    // without any change needed there.
    base: "/",
    // Pre-declare every dependency the app and the labs import. Vite's dependency
    // optimizer otherwise discovers `three`, `gsap/*` and the lab-only entry points
    // lazily, re-runs mid-session and issues a fresh `?v=` browser hash. A page that
    // already holds modules from the previous hash then fails with errors such as
    // "does not provide an export named 't'" from the CJS interop wrapper. Declaring
    // them here makes the optimizer run once, deterministically, at server start.
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-hook-form",
        "zod",
        "gsap",
        "gsap/ScrollTrigger",
        "gsap/SplitText",
        "three",
        "@react-three/fiber",
      ],
    },
    plugins: [
      react(),
      devCspAllowsInlineStyles(),
      visualizer({
        filename: resolve(process.cwd(), "output", "bundle-report.html"),
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
    ],
    build: {
      target: "es2022",
      sourcemap: environment.HOUSE_ADEL_BUILD_SOURCEMAPS === "true",
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (id.includes("@react-three/fiber") || id.includes("/three/")) return "webgl";
            if (id.includes("/gsap/")) return "motion";
            if (id.includes("/react/") || id.includes("/react-dom/")) return "react";
            return undefined;
          },
        },
      },
    },
  };
});
