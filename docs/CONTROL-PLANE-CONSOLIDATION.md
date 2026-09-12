# S/ Control Plane consolidation (AO-010 / OUTS-80)

**Decision date:** 2026-08-31  
**Status:** implementation-ready architecture decision; production cutover remains owner-gated  
**Canonical base:** AgentEmpire

## Decision

Evolve **AgentEmpire** into the single S/ Control Plane operator surface. Do not ship the supplied S/Agency HTML as a second application. AgentEmpire already has the broadest executable domain surface, a typed Next.js application, API routes, validation, tests, and an explicit future S-OS integration boundary. The template is a valuable visual/component donor, while S-OS and n8n remain backend services behind the control plane rather than operator-facing destinations.

The acceptance boundary is stricter than a dashboard: an operator must be able to manage projects, agents, schedules, registry entries, files, builder runs, and decisions without opening another platform. External services may execute work, but their routine controls, state, errors, approvals, and audit evidence must be available in AgentEmpire.

## Evidence inventory

This inventory separates inspectable evidence from references that were named but were not present in the checkout. It avoids treating an issue title as proof of an implementation.

| Candidate / reference | Evidence available | Useful assets | Disposition |
|---|---|---|---|
| **AgentEmpire** | Runnable Next.js 15 / React 19 application; domain routes and APIs; file-backed demo store; agent/tool routing; responsive Tailwind shell; tests and deployment files | Opportunities, offers, tasks, decisions, content, assets, briefings, agents, approvals, S/ City, typed API boundary | **Canonical base** |
| **OUTS-80 S/Agency template** | Complete single-file HTML/CSS/JS prototype embedded in the issue | Navy/glass visual language, team/agent cards, status vocabulary, mention switcher, command dock, tool/skill affordances | Port selected components into AgentEmpire; do not deploy independently |
| **S-OS / `s_agency_os`** | Repository documentation describes governed command gateway, registry, approval envelope, Supabase persistence, and n8n execution | Command envelope, agent registry contract, approval policy, durable audit and execution semantics | Integrate behind AgentEmpire APIs; keep runtime ownership separate from UI ownership |
| **SEI-238 — S/ Control v1** | Identifier/title only in this evidence set | Potential navigation/control-surface patterns require source verification | Component intake only; no unverified claims |
| **DONEAI-66 — HTML executive control surface** | Identifier/title only in this evidence set | Potential executive summary/KPI composition requires source verification | Component intake only; no separate shell |
| **SAG-2 — team operating system** | Identifier/title only in this evidence set | Potential team topology, ownership, capacity, handoff, or operating-state model | Data-model intake only; no separate shell |
| Existing S/ City experience | Existing city map, institutions, university, banking, sidebar, and tests | Spatial model and institution registry | Preserve as an overview inside the canonical shell |
| Existing legacy/root UI components | Duplicate root and `components/` UI/layout files are present | Reusable cards, tables, briefings, creation flows | Consolidate after route-by-route import/use audit |

### Traceability rule

Before importing from SEI-238, DONEAI-66, SAG-2, or a separately supplied `s_agency_os`, attach a permalink, screenshot, or export to the implementation task and record the exact component/data contract selected. If evidence remains unavailable, proceed from the canonical requirements below rather than blocking or creating another framework.

## Candidate scorecard

Scores use a 1–5 scale. **Reuse value** means value to the chosen consolidated surface, not a recommendation to preserve the candidate as an application. Scores marked `*` are deliberately low-confidence because only the named issue reference is available.

| Candidate | Visual | Functional | Architecture | Cross-device | Reuse | Weighted / 5 | Confidence |
|---|---:|---:|---:|---:|---:|---:|---|
| AgentEmpire | 3.5 | 4.0 | 4.0 | 3.5 | 5.0 | **4.00** | High |
| OUTS-80 HTML template | 4.5 | 2.0 | 1.5 | 1.5 | 4.0 | **2.48** | High |
| S-OS / `s_agency_os` | 2.0 | 3.5 | 4.5 | 2.0 | 4.5 | **3.45** | Medium |
| Existing S/ City experience | 4.0 | 3.0 | 3.5 | 3.0 | 4.0 | **3.43** | High |
| SEI-238 | 2.5* | 2.0* | 2.0* | 2.0* | 2.5* | **2.15*** | Reference only |
| DONEAI-66 | 3.0* | 2.0* | 1.5* | 1.5* | 2.5* | **2.03*** | Reference only |
| SAG-2 | 2.0* | 2.5* | 2.0* | 2.0* | 3.0* | **2.30*** | Reference only |

Weighting: visual 15%, functional completeness 30%, architecture 25%, cross-device usability 15%, reuse value 15%. Reference-only scores must be replaced after evidence intake; they cannot overturn the canonical-base decision unless verified functionality closes a material gap at lower migration cost.

## Merge map

| Destination in AgentEmpire | Donor | Move / adapt | Do not carry forward |
|---|---|---|---|
| Global application shell | OUTS-80 | S/Agency brand treatment, compact live-state control, dark glass tokens, restrained status colors | Nested document markup, CDN Tailwind, inline handlers, perpetual motion by default |
| Responsive navigation | AgentEmpire + S/ City | Existing route inventory and city overview; add mobile drawer and command palette | Desktop-only hidden sidebar as sole navigation |
| Command center (`/control`) | OUTS-80 + current domain APIs | KPI strip, team/agent health grid, active incident/run summaries, global command composer | Hard-coded totals, synthetic scores, and fake action buttons |
| Agent registry (`/agents`) | OUTS-80 + S-OS contract | Team cards, agent status, capability/tool chips, trust tier, version, last heartbeat, owner, run/disable actions | Status inferred from a global toggle; unsafe interpolation |
| Universal command palette | OUTS-80 mention bar | Keyboard-accessible agent/team/project search and target switcher backed by registry APIs | Click-only selection |
| Persistent action composer | OUTS-80 dock + S-OS envelope | Target, objective, dry-run/live mode, skills/tools, attachments, approval preview, run receipt | Fixed dock that consumes mobile viewport; fake sends |
| Executive overview | DONEAI-66 pending evidence | Only verified superior KPI, exception, or briefing modules | Separate executive shell |
| Team operations | SAG-2 pending evidence | Only verified topology, ownership, capacity, handoff, or ritual models | Parallel team database/navigation shell |
| Control v1 | SEI-238 pending evidence | Only verified workflows that outperform mapped destination | Wholesale import without contract/accessibility review |
| Runtime and governance | S-OS / n8n / `s_agency_os` | Typed server-side adapter, registry sync, schedules, approvals, run/event stream, audit receipts | Secrets in browser or routine reliance on external admin UIs |
| Evidence and files | AgentEmpire assets + Evidence Registry concept | Upload/index/version/preview, entity links, generated artifacts, commit/PR/deploy evidence | Placeholder-only attachment controls |
| Builder | Agent definitions/tool router + S-OS | Draft/version/test/publish/rollback agent configs and tool permissions | Editing production definitions without versioning or approval |

## Product and engineering requirements

- Replace ornamental status with operational truth: every score/state needs a source, timestamp, stale state, and evidence drill-down.
- Design exception-first: failed runs, pending approvals, breached schedules, and disconnected tools outrank vanity totals.
- Use one command model: project, agent, schedule, and builder actions return a common command/run receipt with status, actor, target, mode, timestamps, logs, artifacts, and approval state.
- Default to dry run; show impact/diff preview; reserve owner approval for production cutover and sensitive permissions.
- Provide keyboard and mobile parity; all critical controls work at 320px without hover dependence.
- Meet accessibility baselines: semantic controls, focus management, reduced motion, contrast, live-region announcements, and non-color status labels.
- Treat loading, empty, stale, partial, offline, and error states as first-class.
- Add observability context: correlation IDs, durations, retries, cost/token use, tool calls, and redacted logs.
- Eliminate unsafe prototype patterns such as `unsafe-eval`, remote framework CDNs, string-built interactive HTML, and inline event handlers.
- Consolidate duplicate components into canonical `components/` and `lib/` locations after import/use audit.

## Implementation-ready backlog

### CP-01 — Evidence intake and route/component audit
**Deliverable:** attach exports/permalinks for SEI-238, DONEAI-66, SAG-2, and any `s_agency_os` UI; inventory every current route, API, duplicate component, and data owner; replace low-confidence scorecard rows; record accepted/rejected donor components.  
**Acceptance:** every donor claim has traceable evidence; each current route has keep/merge/retire disposition; no new shell repository is proposed.

### CP-02 — Canonical responsive shell and `/control` route
**Deliverable:** responsive AgentEmpire shell with desktop rail, mobile drawer, skip link, command palette, health header, and exception-first `/control` overview; port the best OUTS-80 tokens without remote CSS/JS dependencies.  
**Acceptance:** 320/768/1024/1440 layouts avoid inaccessible controls and horizontal overflow; keyboard and reduced-motion paths work; current routes remain reachable; cards use API-derived data or explicit unavailable states.

### CP-03 — Control-plane contracts and S-OS adapter
**Deliverable:** typed `Command`, `Run`, `Approval`, `AgentRegistryEntry`, `Schedule`, `Artifact`, and event contracts; server-only S-OS client and mock adapter; normalized AgentEmpire APIs with timeouts, retries, redacted errors, correlation IDs, and freshness metadata.  
**Acceptance:** adapter tests cover success, partial, stale, timeout, unauthorized, and malformed responses; credentials never reach clients; dry-run is default.

### CP-04 — Projects and decision orchestration
**Deliverable:** consolidate opportunities/offers/tasks into project workspaces with owners, objectives, milestones, dependencies, linked agents/files/decisions, and activity stream; enhance decision records with options, evidence, recommendation, approver, deadline, outcome, and linked command receipts.  
**Acceptance:** operator can create, inspect, decide, and dispatch project work without another platform; sensitive actions enter approval.

### CP-05 — Live agent registry and operations
**Deliverable:** registry-backed list/detail views, health/heartbeat, versions, capabilities, tools, trust tier, permissions, run history, enable/disable, and team filters.  
**Acceptance:** stale/disconnected states are distinct; mutations produce audit receipts; bulk actions preview/confirm and handle partial failure.

### CP-06 — Schedule operations
**Deliverable:** list/calendar views, timezone-aware next runs, history, pause/resume, run-now, edit, retry policy, collision/missed-run warnings.  
**Acceptance:** routine schedule work does not require n8n UI; sensitive changes follow policy; DST/timezone tests pass.

### CP-07 — File and evidence workspace
**Deliverable:** searchable artifact registry with upload, generated-output capture, preview/download, versions, provenance, entity links, access labels, and retention state.  
**Acceptance:** project/run/decision pages attach and retrieve evidence; size/type/scan/pending/unauthorized/failure states are handled.

### CP-08 — Agent builder lifecycle
**Deliverable:** schema-driven draft editor for persona, model, tools, skills, permissions, triggers, and evaluation suite; validate, dry-run, compare, publish, rollback, and version history.  
**Acceptance:** published version immutable; sensitive permission expansion requires owner approval; test evidence is attached to version.

### CP-09 — Unified approvals, inbox, and audit
**Deliverable:** global inbox for approvals, failures, mentions, and schedule exceptions; approval detail shows proposed effects/evidence; append-only audit links actor → command → run → artifacts → decision.  
**Acceptance:** normal merge/architecture choices do not request owner approval; production cutover and sensitive scopes do; denial/expiry paths are tested.

### CP-10 — Production readiness and cutover
**Deliverable:** authentication/authorization, tenant boundary if needed, CSP, rate limits, telemetry, backups, recovery drill, performance/accessibility/security checks, runbooks, staged deployment, rollback.  
**Acceptance:** all acceptance journeys below pass; owner signs only final production cutover/sensitive-scope gate; rollback rehearsed.

## Acceptance journey matrix

| Domain | Required routine journey in AgentEmpire | Completion evidence |
|---|---|---|
| Project | Create → plan milestones → assign → inspect activity → close | Project and audit records |
| Agent | Discover → inspect health/config → dry-run → approve if sensitive → inspect result | Registry version and run receipt |
| Schedule | Create/edit → preview next runs → pause/run/retry → inspect history | Schedule and execution events |
| Registry | Search/filter → inspect ownership/capabilities/access → version/update | Registry revision and actor receipt |
| File | Upload/generate → scan → link → preview/version/download | Artifact provenance and access log |
| Builder | Draft → validate → evaluate → compare → publish/rollback | Immutable version and evaluation evidence |
| Decision | Frame → attach evidence/options → recommend → decide → dispatch/follow up | Decision record linked to command/run |

If any routine journey redirects the operator to Supabase, n8n, a separate control shell, or an issue tracker to complete it, consolidation is not done. Deep links to those systems may remain for diagnostics/admin.

## Environment and deployment baseline

Use the repository-supported Node workflow; do not deploy the supplied HTML file.

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

Deploy first to preview with mock/dry-run integrations, then staging with S-OS read access, and only then request the owner gate for production cutover or sensitive write scopes. Each promotion must retain commit SHA, build/test results, migration status, configuration checksum, smoke-test receipt, and rollback target.

## Architecture boundary

**AgentEmpire is the canonical operator application. `s_agency_os`, S-OS, and n8n remain governed kernel/runtime/automation donors integrated behind AgentEmpire APIs—not competing operator interfaces.**
