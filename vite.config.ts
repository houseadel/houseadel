import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { applicationApiPlugin } from "./server/applications/vitePlugin";

export default defineConfig(({ mode }) => {
  const loadedEnvironment = loadEnv(mode, process.cwd(), "");
  const environment = { ...process.env, ...loadedEnvironment };

  return {
    plugins: [
      applicationApiPlugin(environment),
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
