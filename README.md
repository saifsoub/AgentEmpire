# AgentEmpire — Personal Empire OS

[![Stack](https://img.shields.io/badge/part%20of-S%2F%20Operator%20Stack-0f766e)](docs/ECOSYSTEM.md)
[![Kernel](https://img.shields.io/badge/spine-S--OS-blue)](https://github.com/saifsoub/S-OS)
[![Runtime](https://img.shields.io/badge/runtime-n8n-0f766e)](https://github.com/saifsoub/n8n)

Dark-mode **operator cockpit** for running multiple businesses from one surface — opportunities, offers, decisions, content, agents, and weekly briefings. Built for **Seif / DoneAi / S/** workflows; pairs with [S-OS](https://github.com/saifsoub/S-OS) (control plane) and [n8n](https://github.com/saifsoub/n8n) (automation runtime).

See [docs/ECOSYSTEM.md](docs/ECOSYSTEM.md) for the full stack diagram.

---

## Modules

| Area | Route | Purpose |
|------|-------|---------|
| Dashboard | `/dashboard` | KPIs, priorities, operating snapshot |
| Opportunities | `/opportunities` | Pipeline-style deal/opportunity work |
| Offers | `/offers` | Packaging and offer management |
| Decisions | `/decisions` | Decision records + recommended paths |
| Tasks | `/tasks` | Executable work with audit fields |
| Content | `/content` | Content engine workspace |
| Assets | `/assets` | Asset factory / prep |
| Briefings | `/briefings` | Weekly operator briefings |
| Lifestyle | `/lifestyle` | Lifestyle OS slice |
| Agents | `/agents`, `/superpowers` | Agent definitions + tool routing |
| Settings | `/settings` | Operator preferences |
| UAE Car Sales | `/uae-car-sales` | Domain-specific agent demo |

---

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:7483** (default port in `package.json`).

Other scripts:

```bash
npm run build      # production build
npm run typecheck  # TypeScript
npm run test       # vitest
```

Data persists to `data/demo-db.json` (file-backed demo store). Production path: Supabase via S-OS or direct client.

---

## Agent model

Agents are defined in `lib/agents/definitions.ts` with:

- **Capabilities** — tasks, content, opportunities, email drafts, calendar, GitHub issues
- **Providers** — `native`, `composio`, `mcp`, `webhook`, `manual`
- **Approval policy** — sensitive actions (`external_send`, `publish`, `payment`, …) require human gate

Tool routing: `lib/tools/router.ts` + `lib/tools/providers.ts`.

Architecture: [ARCHITECTURE.md](ARCHITECTURE.md) · S-OS wiring (when ready): [docs/INTEGRATION-S-OS.md](docs/INTEGRATION-S-OS.md)

---

## Stack position

```
You (operator)
    → AgentEmpire UI  ← this repo
    → S-OS gateway    ← commands, registry, approvals
    → n8n workflows   ← Telegram, Monday, Gmail, schedules
    → External APIs
```

**Today:** Empire runs standalone with demo DB and Composio-ready tools.  
**Next:** POST agent objectives to S-OS `s-agentos-command` webhook with `run_mode: dry_run`, then graduate to approved `live` execution.

---

## Tech

- **Next.js 15** (App Router) + React 19
- **Tailwind CSS** — dark operator UI
- **Zod** — validation
- **Vitest** — tests
- **@composio/core** — integration tools (Gmail, calendar, GitHub, …)
- **@anthropic-ai/sdk** — agent reasoning paths

---

## Project layout

```txt
app/              # routes (dashboard, opportunities, …)
components/       # UI + layout (sidebar, app-shell)
lib/              # store, agents, tools, scoring, validators
data/demo-db.json # demo persistence
skills/           # domain skill packs (e.g. uae-car-sales)
```

---

## Safety

- Email **draft** only through tools marked sensitive; sending is human-only.
- Calendar external invites may require approval.
- No secrets in repo — use `.env.local` (see `.env.example` if present).

Aligns with S-OS `draft` / `dry_run` / `live` + `approval_status` model.

---

## Related repos

| Repo | Link |
|------|------|
| S-OS (kernel) | https://github.com/saifsoub/S-OS |
| n8n (runtime) | https://github.com/saifsoub/n8n |

---

## License

MIT — [LICENSE](LICENSE)
