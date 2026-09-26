import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { prisma } from "../prisma.js";
import { ac, roles } from "./permissions.js";

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

export const auth = betterAuth({
  appName: "Helpdesk",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [clientOrigin],
  emailAndPassword: {
    enabled: true,
    // Accounts are created by admins only.
    disableSignUp: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // extend expiry at most once a day
    // No cookieCache: every request is validated against the session table,
    // so logout and deactivation take effect immediately.
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "agent",
      adminRoles: ["admin"],
      bannedUserMessage: "Your account has been deactivated. Contact an administrator.",
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
