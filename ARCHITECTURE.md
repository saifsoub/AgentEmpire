# AgentEmpire — Architecture

## Purpose

AgentEmpire is the **human-facing control surface** in the S/ Operator Stack. Operators use it to see state, create work, run agents, and review briefings — without opening n8n or curl for every action.

It does **not** replace [S-OS](https://github.com/saifsoub/S-OS) (governed command plane) or [n8n](https://github.com/saifsoub/n8n) (workflow runtime). It **consumes** them when integrated.

---

## Layers

```
┌─────────────────────────────────────────────────────────┐
│  Presentation (Next.js App Router, React, Tailwind)    │
│  app/* pages · components/* · layout/sidebar           │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  Application logic (lib/)                                │
│  store · scoring · validators · agents · tools/router    │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  Persistence (demo)                                      │
│  data/demo-db.json — opportunities, tasks, settings      │
└─────────────────────────┬───────────────────────────────┘
                          │ future
┌─────────────────────────▼───────────────────────────────┐
│  S-OS gateway (HTTPS webhook)                            │
│  X-AgentOS-Key · command envelope · run_mode             │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│  n8n + Supabase (S-OS repo)                              │
└─────────────────────────────────────────────────────────┘
```

---

## Agent execution flow (current)

1. Operator submits objective in UI (agent page or superpowers).
2. `lib/tools/router.ts` selects provider per capability.
3. Sensitive capabilities check `APPROVAL_SENSITIVE_ACTIONS` before external side effects.
4. Results written to demo store via `lib/store.ts`.
5. Tasks may include audit notification fields for operator review.

---

## Agent execution flow (target, with S-OS)

1. UI builds command envelope (`action`, `objective`, `run_mode`, `context`).
2. `POST /webhook/s-agentos-command` with `X-AgentOS-Key`.
3. S-OS gateway validates, logs to Supabase, routes to registry/executor workflows.
4. n8n runs downstream integrations (Telegram approval, Monday, etc.).
5. Response envelope returned to UI; Empire updates local state.

Default integration path: `run_mode: dry_run` until operator approves `live`.

See [docs/INTEGRATION-S-OS.md](docs/INTEGRATION-S-OS.md).

---

## Data model (demo)

File-backed JSON includes entities for opportunities, offers, tasks, decisions, content, assets, briefings, leads, and agent settings. Typed in `lib/types.ts`, validated with Zod in `lib/validators.ts`.

**Production upgrade:** mirror critical entities to Supabase tables defined in S-OS (`os_commands`, `agent_registry`, …) or keep Empire as read-mostly UI over kernel APIs.

---

## Tool providers

| Provider | Use |
|----------|-----|
| `native` | Internal store mutations, briefings, tasks |
| `composio` | Gmail draft, calendar, GitHub issue |
| `mcp` | Cursor MCP connectors when configured |
| `webhook` | Custom HTTP automations |
| `manual` | Operator-only steps |

---

## Cross-cutting concerns

- **Scoring** — `lib/scoring.ts` for opportunity prioritization
- **Auth** — single-operator demo; add auth boundary before multi-tenant
- **Theming** — dark operator UI (`app/globals.css`, Tailwind)

---

## Boundaries

| In scope | Out of scope |
|----------|----------------|
| Cockpit UX, demo persistence | Kernel command routing (S-OS) |
| Agent definitions & tool selection | n8n workflow editing (n8n repo) |
| Approval UX for sensitive tools | Sending email / signing contracts (human) |

---

## Ecosystem

Full stack doc: [docs/ECOSYSTEM.md](docs/ECOSYSTEM.md)
