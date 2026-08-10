# Ghost AI

Ghost AI is a real-time collaborative system design workspace. A user
describes a system in plain English, an AI agent maps that system onto a
shared canvas as nodes and edges, collaborators refine the architecture
together in real time, and the app converts the resulting graph into a
Markdown technical specification.

## Core flow

1. Sign in and create (or open) a project.
2. Optionally import a prebuilt starter design (monolith, microservices,
   event-driven, serverless, ...) into the canvas.
3. Prompt the AI to generate or extend the architecture — it runs as a
   background job and writes nodes/edges directly into the shared canvas.
4. Collaborators edit the canvas together, live — cursors, presence, and
   node/edge changes are all synced in real time.
5. Trigger spec generation to turn the current graph into a persisted
   Markdown technical spec, viewable and downloadable from the project.

## Stack

| Layer             | Technology              | Role                                                          |
| ------------------ | ------------------------ | -------------------------------------------------------------- |
| Framework         | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                  |
| UI                | Tailwind + shadcn/ui    | Component composition and styling                             |
| Auth              | Clerk                   | User identity and route protection                            |
| Database          | Prisma + PostgreSQL     | Relational metadata: projects, collaborators, specs, task runs |
| Canvas            | Liveblocks + React Flow | Real-time collaborative canvas, presence, and cursors          |
| Background tasks  | Trigger.dev             | Durable AI generation workflows                                |
| Artifact storage  | Vercel Blob             | Canvas snapshots and generated Markdown specs                  |

### How the collaborative canvas works

Nodes and edges are stored via `@liveblocks/react-flow`'s `useLiveblocksFlow`,
which backs the canvas with Liveblocks Storage — a CRDT (conflict-free
replicated data type), not a single shared JSON blob. Each node/edge is its
own addressable object, so concurrent edits to different objects never
collide. Concurrent edits to the *same* object merge per-property, and only a
genuine same-property race resolves via last-write-wins at the server, with
both clients converging automatically — no merge UI, no corruption. Live
cursors and presence make it obvious who's editing what in practice.

## Project layout

- `app/api` — Authenticated request handlers: input validation, ownership
  checks, task triggering, and persistence.
- `trigger` / `src/trigger` — Long-running background jobs: AI design
  generation and spec generation, run via Trigger.dev.
- `lib` — Shared infrastructure: Prisma client, access control helpers, and
  utilities.
- `components` — UI composition: canvas surfaces, sidebars, dialogs, and
  interactive elements.
- `prisma` — Database schema and generated client output.
- `context/` — Living product/architecture/workflow docs. **Read these
  before making architectural changes** — see `AGENTS.md`.

## Storage model

- **PostgreSQL (via Prisma)**: project metadata, ownership, collaborators,
  and task run records.
- **Vercel Blob**: generated artifacts — canvas snapshots
  (`canvas/{projectId}.json`) and specs (`specs/{projectId}/{specId}.md`).
  The database stores only the blob URL/path as a reference.

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy these into `.env.local` (ask a teammate for real values — do not commit
this file):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
DATABASE_URL=
LIVEBLOCKS_SECRET_KEY=
LIVEBLOCKS_PUBLIC_KEY=
BLOB_READ_WRITE_TOKEN=
TRIGGER_SECRET_KEY=
TRIGGER_PROJECT_REF=
GOOGLE_AI_API_KEY=
```

### Other useful commands

```bash
npm run lint          # ESLint
npx prisma studio     # Browse the database
npx prisma migrate dev  # Apply schema changes locally
```

## Before you write code

This repo's `AGENTS.md` points to a set of living context docs — read them in
order before implementing or making architectural decisions:

1. `context/project-overview.md` — product definition, goals, features, scope
2. `context/architecture-context.md` — system structure, boundaries, storage
   model, and invariants
3. `context/ui-context.md` — theme, colors, typography, canvas design, and
   component conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow and scoping rules
6. `context/progress-tracker.md` — current phase, completed work, and next
   steps

If your change affects architecture, scope, or standards, update the
relevant context file as part of the same change.

## Deployment

Deployed on [Vercel](https://vercel.com). See the
[Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying)
for details.
