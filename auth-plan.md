# Auth Plan: Better Auth (email/password, database sessions)

- [x] Switch server to ESM (`"type": "module"`, `.js` import extensions, Prisma ESM output)
- [x] Install `better-auth@1.7.6` and add env vars (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CLIENT_ORIGIN`)
- [ ] Create `auth.ts`: Prisma adapter, email/password on, public sign-up off, DB sessions (no cookie cache), admin plugin with `admin`/`agent` roles
- [ ] Remove old `User` model/table and `Role` enum, generate Better Auth schema, run Prisma migration
- [ ] Mount `/api/auth/*splat` handler in Express (before `express.json()`)
- [ ] Add `requireAuth` / `requireAdmin` middleware and `GET /api/me`
- [ ] Seed script for initial admin account
- [ ] Client: auth client, login page, protected/admin routes, logout
- [ ] Client: admin page to create, list, and deactivate agents
- [ ] Verify: login/logout, sign-up blocked, agent gets 403 on admin routes, banned agent's session revoked immediately
- [ ] Update `CLAUDE.md` and `implementation-plan.md`
