import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { patchworkApiRouter } from "../patchworkApi";
import { createContext } from "./context";

export function createServerApp() {
  const app = express();

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // URL normalization middleware for Vercel Serverless Rewrites
  app.use((req, _res, next) => {
    // If Vercel rewrote the path to /api/index, normalize back
    const matched = (req.headers['x-matched-path'] as string) || '';
    if (matched && matched.startsWith('/api')) {
      req.url = matched;
    } else if (req.url.startsWith('/api/index')) {
      req.url = req.url.replace('/api/index', '/api') || '/api';
    }
    next();
  });

  // Global CORS Middleware for extension, localhost, and cross-origin clients
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-id, x-user-email, x-axon-client, x-requested-with");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check routes
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });

  registerOAuthRoutes(app);

  // PATCHWORK REST & Extension APIs - mounted under both /api and root for maximum routing resilience
  app.use("/api", patchworkApiRouter);
  app.use(patchworkApiRouter);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Global API JSON Error Handler to ensure API routes never return HTML error pages
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[API Error]", err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "An unexpected server error occurred",
    });
  });

  return app;
}

export const app = createServerApp();
export default app;
