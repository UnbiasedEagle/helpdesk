# AI-Powered Ticket Management System

## Problem

We receive hundreds of support emails daily. Our agents manually read, classify, and respond to each ticket — which is slow and leads to impersonal, canned responses.

## Solution

Build a ticket management system that uses AI to classify and draft responses to support tickets — delivering faster, more personalized responses to students while freeing up agents to focus on complex issues instead of manual triage.

## MVP Scope

### Core Workflow

1. A support email arrives and a ticket is automatically created (via inbound email webhook).
2. AI classifies the ticket into a category.
3. Every new ticket starts with status Open. Based on category, the ticket is then handled one of two ways:
   - **Simple (General Question)**: AI generates a reply from the knowledge base and sends it automatically, setting the ticket to Resolved. No agent involved in sending, but the ticket remains visible in the ticket list/dashboard afterward so agents can spot-check it and reopen if the AI got it wrong.
   - **Complex (Technical Question, Refund Request)**: AI generates a summary and a suggested reply, and the ticket lands in the shared queue for an agent to review, edit, and send. Sending a reply — auto or agent-approved — means the system delivers it to the student by email; the agent never sends it manually through their own inbox.
4. For complex tickets, the agent sets status to Resolved or Closed as work progresses; Closed is always a manual action, never automatic. Auto-sent tickets are set to Resolved by the system as described above, and can be manually reopened or closed by an agent afterward.

Complex tickets are not auto-assigned to a specific agent — they land in one shared queue on the dashboard, and any agent may claim it, which marks them as the assigned agent (visible to other agents, so tickets aren't worked twice).

If AI classification fails (e.g. API error or timeout), the ticket is treated as complex and placed in the agent queue rather than blocking ticket creation.

### Features

- Email-to-ticket ingestion (inbound email webhook)
- AI-powered ticket classification, including a simple-vs-complex routing decision by category
- AI-generated ticket summaries (for complex tickets routed to an agent)
- AI-generated replies from a knowledge base — sent automatically for simple tickets; drafted as a suggestion for an agent to review on complex tickets
- Ticket list with filtering and sorting (by status, category)
- Agents can claim a ticket from the shared queue to work it
- Ticket detail view (message thread, AI summary, suggested reply, status control)
- Dashboard showing all tickets in a shared queue, including auto-resolved ones, so agents can spot-check AI-sent replies
- Admin user management (create and manage agent accounts)

### Ticket Statuses

- Open
- Resolved
- Closed

### Ticket Categories

- General Question — simple; AI auto-sends a reply
- Technical Question — complex; routed to an agent
- Refund Request — complex; routed to an agent. Tracked and flagged like any other category; the MVP does not integrate with a payment processor or take any financial action

### User Roles

- **Admin**: Deployed with the system. Can create and manage agents, and has all the same ticket capabilities as an Agent.
- **Agent**: Created by admin. Can view tickets in the shared queue, claim tickets, and manage them through to resolution.

## Explicitly Out of Scope for MVP

- Automatic routing/assignment of complex tickets to a specific agent (shared queue only)
- Confidence-based auto-send overrides (routing is by category only in the MVP — no per-ticket confidence threshold)
- Refund processing or payment system integration
- Priority levels, SLAs, and escalation timers
- Notifications (email or in-app) to students or agents
- Knowledge base authoring/management UI
- Internal agent notes or multi-agent collaboration on a single ticket
- Attachments, inbound or outbound
- Audit trail / activity history on tickets
- Analytics and reporting on the dashboard
- Student authentication (students are identified by email address only)
- Data retention and compliance policy (e.g., FERPA)

## Open Questions

- Tech stack
- AI provider
- Email provider for both inbound ingestion and outbound sending (e.g., Postmark, Resend, SendGrid)
- Agent/Admin authentication mechanism (e.g., email + password, magic link)
- Behavior when a student replies to a Resolved or Closed ticket (reopen vs. new ticket)
- Email threading logic for matching an incoming reply to an existing ticket
- Knowledge base content and sourcing — not yet decided. For MVP, build against a small set of placeholder FAQ entries so the classification/summary/draft pipeline works end-to-end; swap in real content once it exists.
