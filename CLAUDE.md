# CLAUDE.md

Project context for Claude Code when working in this repo.

## Project

AI-powered ticket management system (helpdesk). See:
- `project-scope.md` — problem, MVP scope, workflow, roles
- `tech-stack.md` — stack decisions
- `implementation-plan.md` — phased task breakdown

## Documentation lookups

Use context7 (`resolve-library-id` then `query-docs`) to fetch current documentation before writing code against any library or framework, rather than relying on trained knowledge. Package registries here have shown `latest` tags pointing to pre-release versions (e.g. Prisma briefly resolved to an 8.0.0 RC), and library APIs change between versions.

## Stack

- **Client**: React + TypeScript + Tailwind CSS v4 + React Router v7, built with Vite
- **Server**: Express 5 + TypeScript + Prisma 7 + PostgreSQL
- **Auth**: Better Auth (`better-auth@1.7.6`, pinned) with email/password and Postgres-backed sessions via the Prisma adapter. Admin plugin provides `admin`/`agent` roles. Public sign-up is disabled; admins create agents. See `auth-plan.md`.
- **AI**: Google Gemini API (free tier)
- **Local dev**: Docker Compose (`postgres`, `server`, `client` services)

## Environment notes

- Prisma is pinned to `7.10.0` — npm's `latest` tag currently points to an `8.0.0` release candidate. Don't blindly run `npm i prisma@latest` / `@prisma/client@latest`.
- TypeScript `7.0.2` (the native Go-based compiler) is installed and is genuinely the stable release, but `ts-node` / `ts-node-dev` aren't compatible with it yet. The server's dev script uses `tsx` instead.
- Prisma's config file in this version is `server/prisma7.config.ts` (not `prisma.config.ts`).
- Install npm dependencies with `--legacy-peer-deps` in this environment — plain `npm install` has hit an npm/arborist resolver bug here.
- The server is ESM (`"type": "module"`). Relative imports need `.js` extensions (e.g. `./lib/auth.js`). Better Auth does not support CommonJS.
- Better Auth config: `server/src/lib/auth.ts`. Role permissions live in `server/src/lib/permissions.ts` and are duplicated in `client/src/lib/permissions.ts`; keep them in sync.
- The Better Auth handler is mounted at `/api/auth/*splat` **before** `express.json()`. Protect app routes with `requireAuth` / `requireAdmin` from `server/src/middleware/auth.ts` (they set `req.user` / `req.session`).
- No session cookie cache: every request hits the `session` table, so sign-out and deactivation (`banUser`) take effect immediately.
- After changing Better Auth config or plugins, regenerate the schema: `npx auth@1.7.6 generate --config src/lib/auth.ts --output prisma/schema.prisma`, then `npx prisma migrate dev`.
- Better Auth rate-limits sign-in to 3 attempts per 10s per IP. The server passes Express's resolved `req.ip` to Better Auth via `X-Forwarded-For`; the Vite proxy sets `xfwd: true`.
- Non-Docker local Postgres (Homebrew) runs on port `5432`. The Dockerized Postgres runs on host port `5433` to avoid colliding with it.
- TypeScript 7 removed `moduleResolution: "node"` (errors as `TS5108`, "node10 has been removed"). Server `tsconfig.json` uses `"module": "nodenext"` + `"moduleResolution": "nodenext"` instead.
- Prisma 7's generated client (`provider = "prisma-client"`) requires an explicit driver adapter — plain `new PrismaClient()` fails. Import `PrismaClient` from `./generated/prisma/client` (not the bare directory) and construct it with `new PrismaClient({ adapter })`, where `adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })` from `@prisma/adapter-pg`. See `server/src/prisma.ts`.
- If Docker build/prune fails with `read-only file system` errors, the host disk likely ran out of space and the Docker Desktop VM's internal disk got remounted read-only. Freeing host space alone won't fix it — run `docker desktop restart` first, then retry.

## Commands

- `docker compose up -d --build` — full local dev stack (Postgres + server + client)
- `docker compose down` — stop the stack (data persists in the `postgres_data` volume)
- `cd server && npm run dev` — server only (`tsx watch`)
- `cd client && npm run dev` — client only (`vite`)
- `cd server && npx prisma migrate dev` — create and apply a migration
- `cd server && npm run db:seed` — create the initial admin from `SEED_ADMIN_*` env vars (idempotent)
- `cd server && npx prisma studio` — browse the database
