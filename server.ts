
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json());

  // Request logging
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API 404 Handler
  app.use("/api", (req, res) => {
    console.warn(`API 404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`ERROR at ${req.method} ${req.url}:`, err);
    
    // If it's an API request, return JSON
    if (req.url.startsWith('/api')) {
      return res.status(err.status || 500).json({ 
        error: err.message || "Internal Server Error",
        path: req.url
      });
    }
    
    // Otherwise, let it fall through or handle as needed
    next(err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);

  console.log(`Attempting to start server on port ${PORT}...`);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`SUCCESS: Server running on http://0.0.0.0:${PORT}`);
  });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch(err => {
    console.error("FATAL: Server failed to start!");
    console.error(err);
});
