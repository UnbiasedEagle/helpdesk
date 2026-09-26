import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// Enum-like const (the client's tsconfig uses erasableSyntaxOnly, which disallows `enum`).
export const Role = {
  Admin: "admin",
  Agent: "agent",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

// Keep in sync with server/src/lib/permissions.ts
export const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  user: ["create", "list", "get", "update", "set-role", "ban", "set-password"],
  session: ["list", "revoke"],
});

export const agentRole = ac.newRole({
  user: [],
  session: [],
});

export const roles = { [Role.Admin]: adminRole, [Role.Agent]: agentRole };
