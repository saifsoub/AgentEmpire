# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
Personal Empire OS — a Next.js 15 (App Router) dark-mode dashboard for solopreneurs. Uses file-based persistence via `data/demo-db.json` (no database required). See `README.md` for the one-liner setup.

### Dev commands (all from repo root)
| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 7483) |
| Typecheck | `npm run typecheck` |
| Tests | `npm test` (vitest, 70 unit tests) |
| Build | `npm run build` |

### Key caveats
- The dev server runs on **port 7483** (not the default 3000).
- Data persistence is pure JSON file I/O (`lib/store.ts` → `data/demo-db.json`). No database, no migrations. Changes are written synchronously and picked up on next read.
- Many external services in `.env.example` (Supabase, Stripe, Mailgun, Twilio, etc.) are **not used** in source code; only `ANTHROPIC_API_KEY` is consumed. Without it, AI-powered agents and Superpowers fall back to mock results.
- The `/agents` framework supports a generic agent runner (`/api/agent/run`) that maps user-defined tools to predefined store actions in `lib/agent-actions.ts`. Built-in agents are seeded in `data/demo-db.json`.
- `lib/agent-action-defs.ts` is the client-safe action list; `lib/agent-actions.ts` contains server-side execution logic importing Node.js modules. Client components must import from the defs file only.
