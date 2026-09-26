# Implementation Plan

Based on `project-scope.md` and `tech-stack.md`. Tasks are grouped into phases, roughly in build order — later phases depend on earlier ones.

Two decisions from `tech-stack.md` are still open and block specific tasks below: **email provider** (SendGrid vs. Mailgun) and **background job strategy** (sync vs. BullMQ+Redis). Flagged inline where they matter.

---

## Phase 0 — Project Setup & Foundations

- [x] Set up monorepo structure (`/client`, `/server`)
- [x] Init `/server`: Express + TypeScript, base config (tsconfig, tsx for dev)
- [x] Init `/client`: React + TypeScript (Vite), Tailwind, React Router
- [x] Set up Postgres (Docker) + Prisma, connect from server
- [x] Env/config management (`.env` for server, `.env.example` committed)
- [x] Docker Compose for local dev (Postgres, server, client)
- [x] Basic health-check route (`GET /api/health`) and confirm client can call server

## Phase 1 — Auth & User Management

Implemented with Better Auth instead of express-session + bcrypt. Details in `auth-plan.md`.

- [x] Prisma schema: Better Auth `User`, `Session`, `Account`, `Verification`, `RateLimit` (+ admin plugin fields)
- [x] Postgres-backed sessions (Better Auth, no cookie cache)
- [x] Password hashing (Better Auth, scrypt)
- [x] Auth endpoints: login, logout, current-user (`/api/auth/*`, `/api/me`)
- [x] Auth middleware: `requireAuth`, `requireAdmin`
- [x] Seed script: create initial admin account
- [x] Admin endpoints: create agent, list agents, deactivate agent (Better Auth admin plugin)
- [x] Frontend: login page, auth hook, protected route wrapper
- [x] Frontend: admin user-management page (create/list/deactivate agents, reset password)

## Phase 2 — Ticket Data Model & Core CRUD

- [ ] Prisma schema: `Ticket` (id, subject, status, category, studentEmail, assignedAgentId, aiSummary, suggestedReply, createdAt, updatedAt)
- [ ] Prisma schema: `Message` (id, ticketId, direction [inbound/outbound], sender, body, createdAt) — the thread
- [ ] API: list tickets with filter (status, category) + sort
- [ ] API: get ticket detail (with message thread)
- [ ] API: update ticket status (Resolved/Closed, manual agent action)
- [ ] API: claim ticket (assign current agent, reject if already claimed)
- [ ] Frontend: ticket list/dashboard with filter + sort controls
- [ ] Frontend: ticket detail page (thread view, status control, claim button)

## Phase 3 — Email Ingestion (Inbound)

- [ ] **Decide: SendGrid vs. Mailgun** (blocks this phase)
- [ ] Inbound parse webhook endpoint (`POST /api/webhooks/email`)
- [ ] Parse inbound payload → create new ticket + initial message, status Open
- [ ] **Decide: email threading logic** — how an inbound reply is matched to an existing ticket (open question in scope doc)
- [ ] **Decide: reply-to-Resolved/Closed behavior** — reopen vs. new ticket (open question in scope doc)
- [ ] Handle malformed/unparseable inbound payloads gracefully (don't drop silently)

## Phase 4 — AI Pipeline (Classification, Summary, Draft)

- [ ] Gemini API client/service wrapper (isolated behind one module so provider can be swapped later)
- [ ] Classification prompt + structured JSON output (category → General/Technical/Refund, mapped to simple/complex)
- [ ] Error handling: classification failure or timeout → ticket treated as complex, placed in agent queue (per scope doc)
- [ ] Seed placeholder FAQ/knowledge base content
- [ ] Summary generation (complex tickets only)
- [ ] Reply draft generation, grounded in placeholder FAQ content
- [ ] **Decide: background job strategy** — run pipeline synchronously in the webhook handler for MVP, or introduce BullMQ+Redis now
- [ ] Wire pipeline into ticket creation flow: webhook → classify → summarize/draft → route

## Phase 5 — Auto-Resolve & Agent Review Flow

- [ ] Outbound email sending service (via chosen provider)
- [ ] Simple-ticket flow: AI reply generated → sent automatically → ticket set to Resolved by system
- [ ] Complex-ticket flow: AI summary + suggested reply stored, ticket stays Open in shared queue
- [ ] Frontend: complex ticket detail — show AI summary, editable suggested-reply textarea, agent send action
- [ ] Frontend: reopen action for Resolved/Closed tickets (manual, agent-triggered)
- [ ] Frontend: visually distinguish auto-resolved tickets in the list (for spot-checking)

## Phase 6 — Dashboard & Polish

- [ ] Shared-queue dashboard: all tickets, filter by status/category, show assigned agent (or unclaimed)
- [ ] Manual "Closed" action (agent-only, explicit — never automatic)
- [ ] Loading/empty/error states across list and detail views
- [ ] Basic responsive pass (Tailwind)
- [ ] End-to-end manual test of both ticket paths (simple auto-send, complex agent-review)

## Phase 7 — Deployment

- [ ] Finalize Dockerfiles for client and server
- [ ] Provision Postgres + (Redis, if Phase 4 chose the queue) on chosen cloud provider
- [ ] Configure production env vars/secrets
- [ ] Deploy client + server
- [ ] Point email provider's inbound webhook at the deployed server URL
- [ ] Smoke test full flow in production: inbound email → ticket → AI pipeline → resolved/queued → outbound send
