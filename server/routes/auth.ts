import { RequestHandler, Router } from "express";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { User } from "../models/User";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../middleware/auth";

export const authRouter = Router();

// Ensure cookie parser for this router
authRouter.use(cookieParser());

const signup: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const payload = { sub: user._id.toString(), role: user.role } as const;
    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);
    setRefreshCookie(res, refresh);
    res.json({
      accessToken: access,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Signup failed" });
  }
};

const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const payload = { sub: user._id.toString(), role: user.role } as const;
    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);
    setRefreshCookie(res, refresh);
    res.json({
      accessToken: access,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
};

const me: RequestHandler = async (req, res) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) return res.status(200).json({ user: null });
    // We don't verify role here; simply decode via refresh verification not required
    const jwt = await import("jsonwebtoken");
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const decoded = jwt.verify(token, secret) as any;
    const user = await User.findById(decoded.sub).lean();
    if (!user) return res.json({ user: null });
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    return res.json({ user: null });
  }
};

const refresh: RequestHandler = async (req, res) => {
  const token = req.cookies?.refresh_token as string | undefined;
  if (!token) return res.status(401).json({ error: "No refresh token" });
  const payload = verifyRefresh(token);
  if (!payload) return res.status(401).json({ error: "Invalid refresh token" });
  const access = signAccessToken(payload);
  return res.json({ accessToken: access });
};

const logout: RequestHandler = async (_req, res) => {
  res.clearCookie("refresh_token", cookieOptions());
  res.json({ ok: true });
};

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  } as const;
}

function setRefreshCookie(res: any, token: string) {
  res.cookie("refresh_token", token, cookieOptions());
}

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", me);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
