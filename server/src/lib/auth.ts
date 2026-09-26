import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { prisma } from "../prisma.js";
import { ac, Role, roles } from "./permissions.js";

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const MIN_PASSWORD_LENGTH = 8;

export const auth = betterAuth({
  appName: "Helpdesk",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [clientOrigin],
  emailAndPassword: {
    enabled: true,
    // Accounts are created by admins only.
    disableSignUp: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
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
  hooks: {
    // The admin plugin's create-user endpoint does not enforce minPasswordLength.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/admin/create-user") return;
      const password = (ctx.body as { password?: unknown } | undefined)?.password;
      if (typeof password === "string" && password.length < MIN_PASSWORD_LENGTH) {
        throw new APIError("BAD_REQUEST", {
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        });
      }
    }),
  },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: Role.Agent,
      adminRoles: [Role.Admin],
      bannedUserMessage: "Your account has been deactivated. Contact an administrator.",
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
