import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Cartoon, User } from "./models.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;

if (!process.env.MONGODB_URI || !jwtSecret || jwtSecret.length < 32) {
  throw new Error("Set MONGODB_URI and a JWT_SECRET of at least 32 characters in backend/.env");
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:4200" }));
app.use(express.json({ limit: "100kb" }));
app.use("/image", express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../image")));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }));

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function issueToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" });
}

const requireAuth = asyncRoute(async (req, res, next) => {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Sign in to continue." });
  try {
    const { sub } = jwt.verify(token, jwtSecret);
    req.user = await User.findById(sub);
    if (!req.user) return res.status(401).json({ error: "Account not found." });
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Your session has expired. Please sign in again." });
    }
    throw error;
  }
});

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Administrator access required." });
  next();
}

function validateCartoon(body, partial = false) {
  const fields = ["title", "description", "genre", "year", "image", "episodes", "views", "rating", "featured"];
  if (!body || typeof body !== "object" || Array.isArray(body)) return "A JSON object is required.";
  if (partial && Object.keys(body).some((key) => !fields.includes(key))) return "Unknown cartoon field.";
  for (const key of fields) {
    if (partial && !(key in body)) continue;
    const value = body[key];
    if (["title", "description", "genre", "image"].includes(key) && (typeof value !== "string" || !value.trim())) return `${key} must be a non-empty string.`;
    if (["year", "episodes", "views", "rating"].includes(key) && (!Number.isFinite(value) || value < 0)) return `${key} must be a non-negative number.`;
    if (key === "featured" && typeof value !== "boolean") return "featured must be a boolean.";
  }
  if ("rating" in body && body.rating > 10) return "rating must be at most 10.";
  return null;
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/cartoons", asyncRoute(async (req, res) => {
  const { q, genre, sort } = req.query;
  const filter = {};
  if (typeof q === "string" && q.trim()) {
    const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ title: new RegExp(escaped, "i") }, { description: new RegExp(escaped, "i") }, { genre: new RegExp(escaped, "i") }];
  }
  if (typeof genre === "string" && genre && genre !== "All") filter.genre = genre;
  const ordering = sort === "trending" ? { views: -1 } : sort === "rating" ? { rating: -1 } : { featured: -1, title: 1 };
  res.json(await Cartoon.find(filter).sort(ordering).lean());
}));

app.get("/api/genres", asyncRoute(async (_req, res) => {
  res.json(await Cartoon.distinct("genre").then((genres) => genres.sort()));
}));

app.get("/api/cartoons/:id", asyncRoute(async (req, res) => {
  const cartoon = await Cartoon.findById(req.params.id);
  if (!cartoon) return res.status(404).json({ error: "Cartoon not found." });
  res.json(cartoon);
}));

app.post("/api/auth/register", asyncRoute(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (typeof name !== "string" || !name.trim() || name.trim().length > 60 ||
      typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: "Enter a name, valid email, and password (8–72 characters)." });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ error: "An account with that email already exists." });
  const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: issueToken(user), user: { id: user.id, name: user.name, email: user.email } });
}));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ error: "Email and password are required." });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Email or password is incorrect." });
  res.json({ token: issueToken(user), user: { id: user.id, name: user.name, email: user.email } });
}));

app.get("/api/auth/me", requireAuth, (req, res) => res.json({ id: req.user.id, name: req.user.name, email: req.user.email }));

app.get("/api/favorites", requireAuth, asyncRoute(async (req, res) => {
  await req.user.populate("favorites");
  res.json(req.user.favorites);
}));
app.put("/api/favorites/:cartoonId", requireAuth, asyncRoute(async (req, res) => {
  if (!(await Cartoon.exists({ _id: req.params.cartoonId }))) return res.status(404).json({ error: "Cartoon not found." });
  await User.updateOne({ _id: req.user.id }, { $addToSet: { favorites: req.params.cartoonId } });
  res.status(204).end();
}));
app.delete("/api/favorites/:cartoonId", requireAuth, asyncRoute(async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $pull: { favorites: req.params.cartoonId } });
  res.status(204).end();
}));

app.get("/api/watch-history", requireAuth, asyncRoute(async (req, res) => {
  await req.user.populate("watchHistory.cartoon");
  res.json(req.user.watchHistory.filter((entry) => entry.cartoon).sort((a, b) => b.watchedAt - a.watchedAt));
}));
app.put("/api/watch-history/:cartoonId", requireAuth, asyncRoute(async (req, res) => {
  const cartoon = await Cartoon.findByIdAndUpdate(req.params.cartoonId, { $inc: { views: 1 } });
  if (!cartoon) return res.status(404).json({ error: "Cartoon not found." });
  await User.updateOne(
    { _id: req.user.id },
    { $pull: { watchHistory: { cartoon: cartoon.id } } }
  );
  await User.updateOne(
    { _id: req.user.id },
    { $push: { watchHistory: { $each: [{ cartoon: cartoon.id, watchedAt: new Date() }], $position: 0, $slice: 20 } } }
  );
  res.status(204).end();
}));

app.use("/api/admin", requireAuth, requireAdmin);
app.post("/api/admin/cartoons", asyncRoute(async (req, res) => {
  const error = validateCartoon(req.body);
  if (error) return res.status(400).json({ error });
  res.status(201).json(await Cartoon.create(req.body));
}));
app.patch("/api/admin/cartoons/:id", asyncRoute(async (req, res) => {
  const error = validateCartoon(req.body, true);
  if (error) return res.status(400).json({ error });
  const cartoon = await Cartoon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!cartoon) return res.status(404).json({ error: "Cartoon not found." });
  res.json(cartoon);
}));
app.delete("/api/admin/cartoons/:id", asyncRoute(async (req, res) => {
  const cartoon = await Cartoon.findByIdAndDelete(req.params.id);
  if (!cartoon) return res.status(404).json({ error: "Cartoon not found." });
  await User.updateMany({}, { $pull: { favorites: cartoon.id, watchHistory: { cartoon: cartoon.id } } });
  res.status(204).end();
}));

app.use((error, _req, res, _next) => {
  if (error instanceof mongoose.Error.CastError) return res.status(400).json({ error: "Invalid resource id." });
  if (error instanceof mongoose.Error.ValidationError) return res.status(400).json({ error: error.message });
  if (error?.code === 11000) return res.status(409).json({ error: "That value is already in use." });
  console.error(error);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

await mongoose.connect(process.env.MONGODB_URI);
app.listen(port, () => console.log(`Cartoon Lifestyle API listening on http://localhost:${port}`));
