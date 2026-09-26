import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();

// Trust X-Forwarded-For only from local/private proxies (Vite dev proxy, Docker network).
app.set("trust proxy", "loopback, uniquelocal");

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);

// Better Auth reads the client IP (for rate limiting and session metadata) from
// X-Forwarded-For only. Replace it with the IP Express resolved using the trust
// proxy rules above, so it is always set and cannot be spoofed by clients.
app.use("/api/auth", (req, _res, next) => {
  if (req.ip) req.headers["x-forwarded-for"] = req.ip;
  next();
});

// Better Auth must be mounted before express.json(), which would consume the body.
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
