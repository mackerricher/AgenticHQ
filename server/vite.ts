// server/vite.ts   (or wherever this lived)

import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import rawViteConfig from "../vite.config";      // may be an object *or* a factory
import { nanoid } from "nanoid";

const viteLogger = createLogger();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* -------------------------------------------------------------------------- */
/* utils                                                                      */
/* -------------------------------------------------------------------------- */
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

/* -------------------------------------------------------------------------- */
/* development: run Vite in middleware mode                                   */
/* -------------------------------------------------------------------------- */
export async function setupVite(app: Express, server: Server) {
  /** Resolve the (possibly async) config that vite.config.ts exports */
  const viteConfig =
    typeof rawViteConfig === "function"
      ? await rawViteConfig({ mode: "development" })
      : rawViteConfig;

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,              // we already passed the resolved config
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true,
    },
    appType: "custom",
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
  });

  /** Attach Vite’s connect middlewares first */
  app.use(vite.middlewares);

  /** Render index.html on every unmatched route so Vite’s HMR works */
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const templatePath = path.resolve(__dirname, "..", "client", "index.html");
      let template = await fs.promises.readFile(templatePath, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

/* -------------------------------------------------------------------------- */
/* production: serve the pre-built static bundle                              */
/* -------------------------------------------------------------------------- */
export function serveStatic(app: Express) {
  // hard-code where the front-end build lands after `vite build`
  const staticDir = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(staticDir)) {
    throw new Error(
      `Static assets not found at ${staticDir}. Did you run “npm run build”?`
    );
  }

  app.use(express.static(staticDir));

  // Single-page-app fallback: return index.html for any unknown route
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}
