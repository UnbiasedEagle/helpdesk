import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

// Same origin: requests go through the Vite /api proxy, so cookies stay first-party.
export const authClient = createAuthClient({
  baseURL: window.location.origin,
  plugins: [adminClient({ ac, roles })],
});

export const { useSession, signIn, signOut } = authClient;

// Better Auth stores multiple roles as a comma-separated string.
export function isAdmin(role: string | null | undefined) {
  return (role ?? "").split(",").map((r) => r.trim()).includes("admin");
}
