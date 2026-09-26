import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// Keep in sync with client/src/lib/permissions.ts
export const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

// Admins manage agents. No delete (keeps ticket history) and no impersonation.
export const adminRole = ac.newRole({
  user: ["create", "list", "get", "update", "set-role", "ban", "set-password"],
  session: ["list", "revoke"],
});

// Agents have no user-management permissions.
export const agentRole = ac.newRole({
  user: [],
  session: [],
});

export const roles = { admin: adminRole, agent: agentRole };
