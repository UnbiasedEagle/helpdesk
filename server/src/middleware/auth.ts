import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { Role } from "../lib/permissions.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  let session;
  try {
    session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
  } catch (err) {
    next(err);
    return;
  }

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = session.user;
  req.session = session.session;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, (err?: unknown) => {
    if (err) {
      next(err);
      return;
    }
    // Better Auth stores multiple roles as a comma-separated string.
    const roles = (req.user?.role ?? "").split(",").map((r) => r.trim());
    if (!roles.includes(Role.Admin)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}
