import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { connectDB } from "./db";
import { handleDemo } from "./routes/demo";
import { authRouter } from "./routes/auth";
import { blogsRouter } from "./routes/blogs";
import { adminRouter } from "./routes/admin";

export function createServer() {
  const app = express();
  // Trust proxy for proper rate limit and X-Forwarded-For in hosted envs
  app.set("trust proxy", 1);

  // DB
  connectDB().catch(() => {});

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("tiny"));
  // Static uploads
  const uploadsPath = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // Health
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // API rate limiting
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", apiLimiter);

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.get("/api/demo", handleDemo);
  app.use("/api/auth", authRouter);
  app.use("/api/blogs", blogsRouter);
  app.use("/api/admin", adminRouter);

  return app;
}
