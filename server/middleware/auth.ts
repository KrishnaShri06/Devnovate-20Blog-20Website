import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  sub: string;
  role: "user" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret) as AuthPayload & {
      type?: string;
    };
    if (payload.type && payload.type !== "access")
      throw new Error("Invalid token type");
    req.auth = { sub: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.auth) return res.status(401).json({ error: "Unauthorized" });
  if (req.auth.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  next();
};

export function signAccessToken(payload: AuthPayload) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || "15m";
  return jwt.sign({ ...payload, type: "access" }, secret, { expiresIn });
}

export function signRefreshToken(payload: AuthPayload) {
  const secret =
    process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_SECRET ||
    "dev_secret_change_me";
  const expiresIn = process.env.JWT_REFRESH_EXPIRES || "7d";
  return jwt.sign({ ...payload, type: "refresh" }, secret, { expiresIn });
}

export function verifyRefresh(token: string): AuthPayload | null {
  try {
    const secret =
      process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET ||
      "dev_secret_change_me";
    const payload = jwt.verify(token, secret) as AuthPayload & {
      type?: string;
    };
    if (payload.type !== "refresh") return null;
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
