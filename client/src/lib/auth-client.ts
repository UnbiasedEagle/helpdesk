import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

// Same origin: requests go through the Vite /api proxy, so cookies stay first-party.
export const authClient = createAuthClient({
  baseURL: window.location.origin,
  plugins: [adminClient({ ac, roles })],
});

export const { useSession, signIn, signOut } = authClient;
