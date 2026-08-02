import type { Connect, Plugin } from "vite";
import { createApplicationRequestHandler } from "./handler";
import type { ApplicationServerEnvironment } from "./types";

export function applicationApiPlugin(environment: ApplicationServerEnvironment): Plugin {
  const handler = createApplicationRequestHandler({ environment });
  const middleware: Connect.NextHandleFunction = (request, response, next) => {
    void handler(request, response)
      .then((handled) => {
        if (!handled) next();
      })
      .catch(() => {
        if (!response.headersSent) {
          response.statusCode = 500;
          response.setHeader("Cache-Control", "no-store");
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(
            JSON.stringify({
              accepted: false,
              message: "The application endpoint encountered an error. Nothing was submitted.",
            }),
          );
        }
      });
  };

  return {
    name: "house-adel-application-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
