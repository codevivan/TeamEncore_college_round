import { createServer } from "http";
import { app } from "./app";

export { app };

async function startServer() {
  const { serveStatic, setupVite } = await import("./vite");
  const server = createServer(app);
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

// Only start standalone listener when not running inside Vercel Serverless
if (!process.env.VERCEL) {
  startServer().catch(error => { console.error(error); process.exit(1); });
}
