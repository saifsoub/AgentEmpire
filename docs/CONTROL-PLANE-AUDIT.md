# Control-plane evidence and inventory audit (OUTS-80 / CP-01)

**Audit date:** 2026-08-31

**Repository:** [`saifsoub/AgentEmpire`](https://github.com/saifsoub/AgentEmpire)

**Canonical operator route:** `/control`
**Decision:** AgentEmpire is the only operator-facing application. Donors supply bounded components, contracts, or information architecture; they do not become additional shells.

The typed source of truth is [`lib/control-plane/inventory.ts`](../lib/control-plane/inventory.ts). Its focused test discovers every `app/**/page.tsx` and `app/api/**/route.ts`, so a new route without a keep/merge/retire decision fails CI. `/control` is an implemented route, not a planned exemption; deleting it makes the coverage contract fail.

## Cutover boundary

CP-01 records evidence and CP-02 adds a read-only operator surface. Neither task authorizes production cutover, live connector scopes, payments, publication, external sends, identity changes, or other consequential writes. Those remain owner-gated.

The current city command simulation is not evidence that this gate is implemented: `components/city/city-map.tsx` invokes `POST /api/agents/run` before it creates an approval, and `lib/tools/router.ts` does not enforce the submitted `inputs.mode`. CP-02 must not reuse that path as a production/live control. A later governed adapter must prove preview, approval, execution ordering, audit receipt, and denial paths before any live enablement.

## Inspection baseline

At inspection, draft [PR #39](https://github.com/saifsoub/AgentEmpire/pull/39) still pointed to `adae680f7db2da5e846d12226c9c2ced12471af0` and changed only `README.md` plus `docs/CONTROL-PLANE-CONSOLIDATION.md`. CP-01 therefore started from a documentation-only head and adds repository-executable audit evidence without claiming a deployment.

The active persistence owner is `lib/store.ts`, backed by `${DATA_DIR ?? "<repo>/var"}/empire-db.json`. Legacy store callers still suppress file and parse failures; `/control` instead uses the non-mutating `getDbEvidence()` read so missing data stays unavailable and actual read failures become explicit source errors. Root `store.ts` is an unused legacy mirror that still targets `data/demo-db.json`. Prisma is not an active data owner in this checkout.

## Donor decisions

The following GitHub evidence was inspected at exact draft heads. “Accept” means port or reimplement only the named bounded idea in AgentEmpire; it does not mean merge the donor branch.

| Evidence | Verified state | Accepted | Rejected |
|---|---|---|---|
| [PR #38](https://github.com/saifsoub/AgentEmpire/pull/38) | Draft head `eef2a144c4613c486965d769f6ab9136cba25318`; 5 changed files; no test file | API-derived `StatTile`, `AgentCard`, pending-approval queue, responsive grids, local token concept | Root duplicate `layout.tsx`/`globals.css` edits, remote Google font, lockfile churn, wholesale merge |
| [PR #34](https://github.com/saifsoub/AgentEmpire/pull/34) | Draft head `57d3c60586281aa4d75281a5ec91219a7fee041b`; 7 changed files; no test file | Approval-to-audit linkage, agent heartbeat/readiness, task-filtered audit query concepts | Unauthenticated audit writes, silent/non-transactional file persistence, destructive 500-entry cap, wholesale merge |
| [PR #30](https://github.com/saifsoub/AgentEmpire/pull/30) | Draft head `1795a0a3ec298845a6ed1e2d16046982d68c1788`; 19 changed files; includes `__tests__/city-state.test.ts` | Typed city-state adapter boundary, district information architecture, state-derived signals | City as primary shell, wholesale route reframing, wholesale merge |
| [OUTS-80 prototype](https://linear.app/seifs88/issue/OUTS-80/sagency-control-panel-front-end-suggested-design-template) | Inspectable single-file HTML/CSS/JS in the issue | Status vocabulary, team/agent card hierarchy, mention-target switcher, command composer structure | Standalone shell, CDN Tailwind, inline handlers, `unsafe-eval`, synthetic metrics/actions, fixed viewport dock |
| [S-OS](https://github.com/saifsoub/S-OS) | Repository contract evidence | Command envelope, registry, approval policy, audit/run semantics behind server-side adapters | Any second operator-facing destination |

These named references have traceable issue metadata but no bounded source export, screenshot, or implementation permalink available for component intake. Their absence is explicitly non-blocking for CP-02.

| Reference | Evidence URL | CP-02 impact |
|---|---|---|
| SEI-238 | [Shape S/ Control v1 front and settings copy](https://linear.app/seifs88/issue/SEI-238/shape-s-control-v1-front-and-settings-copy) | Unavailable; proceed without importing or making claims |
| DONEAI-66 | [Create HTML executive control surface artifact](https://linear.app/seifs88/issue/DONEAI-66/create-html-executive-control-surface-artifact) | Unavailable; proceed without importing or making claims |
| SAG-2 | [Team operating system](https://linear.app/seifs88/issue/SAG-2/team-operating-system) | Unavailable; proceed without importing or making claims |

No donor listed in the typed inventory has `operatorFacing: true`.

## Application route inventory

There are 21 App Router pages, including implemented `/control`. “Merge” and “retire” describe a migration decision, not permission to break the current journey before its replacement is tested.

| Route | Source | Disposition | Data owner / destination |
|---|---|---|---|
| `/control` | `app/control/page.tsx` | **Keep** | Read-only `lib/store.ts` evidence projected by `lib/control-plane/snapshot.ts` |
| `/` | `app/page.tsx` | **Keep** | Next.js entry redirect; eventual target `/control` |
| `/a/[id]` | `app/a/[id]/page.tsx` | **Keep** | `lib/store.ts` assets/leads; public route |
| `/agents` | `app/agents/page.tsx` | **Keep** | Store agents/runs/approvals plus agent definitions |
| `/assets` | `app/assets/page.tsx` | **Merge** | Store assets → CP-07 evidence/files workspace |
| `/briefings` | `app/briefings/page.tsx` | **Keep** | Store briefings |
| `/city` | `app/city/page.tsx` | **Keep** | City components/static world plus domain APIs |
| `/city/banking` | `app/city/banking/page.tsx` | **Keep** | Store wallets/transactions plus `lib/city-banking.ts` |
| `/city/university` | `app/city/university/page.tsx` | **Keep** | Store enrollments plus `lib/city-university.ts` |
| `/content` | `app/content/page.tsx` | **Keep** | Store content items |
| `/dashboard` | `app/dashboard/page.tsx` | **Merge** | Existing legacy redirect → `/city`; changing the default journey is outside CP-02 |
| `/decisions` | `app/decisions/page.tsx` | **Keep** | Store decisions |
| `/leads` | `app/leads/page.tsx` | **Keep** | Store leads/offers/assets |
| `/lifestyle` | `app/lifestyle/page.tsx` | **Keep** | Store lifestyle goals |
| `/o/[id]` | `app/o/[id]/page.tsx` | **Keep** | Store offers/leads; public route |
| `/offers` | `app/offers/page.tsx` | **Merge** | Store offers → CP-04 projects |
| `/opportunities` | `app/opportunities/page.tsx` | **Merge** | Store opportunities → CP-04 projects |
| `/settings` | `app/settings/page.tsx` | **Keep** | Store settings |
| `/superpowers` | `app/superpowers/page.tsx` | **Retire** | Existing redirect; capabilities → `/agents` |
| `/tasks` | `app/tasks/page.tsx` | **Merge** | Store tasks → CP-04 projects |
| `/uae-car-sales` | `app/uae-car-sales/page.tsx` | **Retire** | Existing redirect; reusable journey → `/offers` |

## API route inventory

There are 28 App Router API routes. Unless otherwise named, “store” means `lib/store.ts` and its `var/empire-db.json` persistence boundary.

| Route | Methods | Disposition | Data owner / destination |
|---|---|---|---|
| `/api/admin/cleanup-tasks` | POST | **Keep** | Store task maintenance; authorize before production exposure |
| `/api/agent-runs` | GET | **Keep** | Store run log |
| `/api/agent/uae-car-sales` | POST | **Merge** | Anthropic/mock + skill + store offers → `/api/agents/run` |
| `/api/agents/[id]` | PATCH, DELETE | **Keep** | Store agents |
| `/api/agents` | GET, POST | **Keep** | Store agents and default definitions |
| `/api/agents/run` | POST | **Keep** | Tool router, providers, store run/approval records; live use remains gated |
| `/api/approvals/[id]` | PATCH | **Keep** | Store approvals |
| `/api/approvals` | GET, POST | **Keep** | Store approvals |
| `/api/assets` | POST | **Merge** | Store assets → CP-07 artifact API |
| `/api/banking` | GET | **Keep** | Store wallets/transactions + static gateway metadata |
| `/api/banking/transactions/[id]` | PATCH | **Keep** | Store transaction decision and balance mutation |
| `/api/banking/transactions` | POST | **Keep** | Store transaction request and high-risk approval |
| `/api/banking/wallets/[id]` | PATCH | **Keep** | Store wallet state |
| `/api/banking/wallets` | POST | **Keep** | Store wallets |
| `/api/briefings/generate` | POST | **Keep** | Store briefings |
| `/api/content` | POST | **Keep** | Store content |
| `/api/decisions` | POST | **Keep** | Store decision analysis |
| `/api/leads` | POST | **Keep** | Store leads |
| `/api/linear-webhook` | POST | **Merge** | Linear/Anthropic/Composio runner → CP-03 governed adapter |
| `/api/offers` | POST | **Merge** | Store offers → CP-04 projects |
| `/api/opportunities` | POST | **Merge** | Store opportunities → CP-04 projects |
| `/api/settings` | GET, POST | **Keep** | Store settings |
| `/api/superpowers` | POST | **Merge** | Store + Groq/synthetic fallback → `/api/agents/run` |
| `/api/tasks` | GET, POST, PATCH | **Merge** | Store tasks → CP-04 project work items |
| `/api/tools/discover` | POST | **Keep** | Agent definitions, environment state, optional MCP/Composio discovery |
| `/api/tools/status` | GET | **Keep** | Tool providers and environment configuration |
| `/api/university/[id]` | PATCH | **Keep** | Store enrollment progress/exam |
| `/api/university` | GET, POST | **Keep** | Store enrollments + static curriculum/faculty |

## Duplicate component decisions

Every active application import already resolves through `components/`; no source imports the root copies. Retirement should happen in a dedicated cleanup change after a clean build, because deletion is not required to start CP-01 or CP-02.

| Component | Canonical path | Retire path | Evidence |
|---|---|---|---|
| `AppShell` | `components/layout/app-shell.tsx` | `app-shell.tsx` | Feature-scoped shell is used by App Router pages |
| `Sidebar` | `components/layout/sidebar.tsx` | `sidebar.tsx` | Root copy has diverged; nested path is active |
| `BarMeter` | `components/bar-meter.tsx` | `bar-meter.tsx` | Byte-identical; nested path is active |
| `QuickCreate` | `components/quick-create.tsx` | `quick-create.tsx` | Byte-identical; nested path is active |
| `RefreshBriefButton` | `components/refresh-brief.tsx` | `refresh-brief.tsx` | Byte-identical; nested path is active |
| `SectionCard` | `components/section-card.tsx` | `section-card.tsx` | Byte-identical; nested path is active |
| `StatCard` | `components/stat-card.tsx` | `stat-card.tsx` | Byte-identical; retain one canonical copy |
| `OpportunitiesTable` | `components/table.tsx` | `table.tsx` | Byte-identical; nested path is active |
| UI primitives | `components/ui.tsx` | `ui.tsx` | Byte-identical; nested path is active |

Adjacent root mirrors (`layout.tsx`, `page.tsx`, `globals.css`, `store.ts`, `types.ts`, `validators.ts`, `utils.ts`, `scoring.ts`, and demo data) are also inactive, but they are app/lib/data cleanup rather than root-vs-`components/` pairs. They should not be imported into CP-02.

## Test evidence

Focused contract:

```bash
npm test -- __tests__/control-plane-inventory.test.ts
```

The contract verifies page/API coverage, the implemented canonical route, the single operator app, traceable/non-blocking donor evidence, and one canonical path for every duplicate component.

The CP-02 browser contract is committed in `e2e/control-shell.spec.ts` and runs in `.github/workflows/control-plane-evidence.yml`. It exercises real rendered CSS and keyboard behavior at 320, 768, 1024, and 1440 pixels; checks horizontal overflow, active navigation mode, mobile focus containment/restoration, the command palette, skip navigation, visible health evidence, and reduced motion.

```bash
npm run test:e2e
```

Before production cutover, the repository baseline remains broader and owner-gated: run typecheck, all tests, production build, accessibility/security checks, staging smoke tests, live-policy tests, and a rehearsed rollback; then request the owner’s explicit cutover decision.
