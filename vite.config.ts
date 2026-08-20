import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

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
