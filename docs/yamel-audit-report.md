# Yamel Audit Report — Agent Control World
**Date:** 2026-07-01  
**Operator:** Yamel (GitHub + Linear Execution)  
**Scope:** saifsoub/AgentEmpire — issue #14  
**Status:** Decision-ready

---

## Deliverable 1 — GitHub PR Triage Table

| Repo | PR | Title | Status | Risk | Recommended Next Action | Linear Issue Needed? |
|---|---|---|---|---|---|---|
| AgentEmpire | #13 | City-first structural overhaul + Governor's Office execution experience | **Merged** | Medium | Apply follow-up issues from gap report below; no re-merge needed | Yes — 3 issues (see §4) |
| Actionplatform | #30 | Set up engagement monitoring workflow | Out of scope (different repo) | Medium | Review separately once AgentEmpire gaps are addressed | Deferred |
| Actionplatform | #22 | Weekly social planning workflow | Out of scope (secondary) | Low | Hold until primary targets complete | No |
| Actionplatform | #17 | Weekly LinkedIn analytics workflow | Out of scope (secondary) | Low | Hold until primary targets complete | No |
| Actionplatform | #16 | Social media goals and content pillars | Out of scope (secondary) | Low | Hold until primary targets complete | No |
| AgentEmpire | #18–#29 | Shopify skill PRs | Out of scope (secondary) | Low | Consolidation review only, not fragmented tasks | No |

---

## Deliverable 2 — Focused Gap Report: PR #13 (Agent Control World)

### Q1 — Is the current experience a real operator/control world or still a visual demo?

**Hybrid — partially wired, partially visual.**

What is functionally wired and persisted:
- `POST /api/agents/run` — called from Governor's Office in Dry Run and Live modes; response shown in payload preview
- `POST /api/approvals` — called at start of Live mode; returns a DB-issued ID used for all subsequent PATCH calls
- `PATCH /api/approvals/[id]` — Approve/Reject called on the server-issued ID (the pre-existing "Approval not found" 500 was fixed in this PR)
- Agent CRUD (`/agents`) — create, update, archive, run agents; wired to real JSON persistence in `var/empire-db.json`
- Task queue — persisted CRUD with deduplication and noise-cleanup logic

What is still visual/mock:
- District card ambient state on `/city` — item counts and agent activity badges are static descriptions; not wired to live DB counts
- Governor's Office Demo Run mode — entirely local, no DB writes
- Governor's Office run timeline — client-side only; events are not persisted to DB for future inspection
- The city map itself — purely visual; no agent positions or movement based on DB state

### Q2 — What is missing for each control surface?

| Surface | Current State | Gap |
|---|---|---|
| Agent Registry | CRUD exists; agents stored in DB | No `status`, `lastActiveAt`, or `heartbeatAt` fields — can't tell if an agent is idle, active, or stuck |
| Heartbeat | Not implemented | No mechanism for agents to signal liveness; `/api/agents/[id]/heartbeat` now added in this PR |
| Approval Desk | Working approve/reject with DB persistence | No evidence attachment, no payload diff viewer, no escalation timer or expiry |
| Task Queue | CRUD + deduplication + noise cleanup | No queue ordering by priority, no agent assignment view, no blocked-task escalation path |
| Evidence Trail | `AuditEntry` type defined in `lib/types.ts` | **Critical gap**: `DemoDb` had no `auditEntries` field — entries were defined but never stored; fixed in this PR |

### Q3 — What should become persistent data vs frontend state?

**Should be persistent (written to DB):**
- Agent `lastActiveAt` and `heartbeatAt` — added to `StoredAgent` type in this PR
- Audit entries — `auditEntries` field added to `DemoDb` + `addAuditEntry` / `getAuditEntries` functions added in this PR
- Governor's Office run timeline events — currently lost on page reload
- Evidence attachments on approvals — currently no attachment field on `ApprovalItem`

**Should remain frontend state (not persisted):**
- Execution mode selection (demo / dry-run / live) — session intent only
- Current objective text before submission
- Pending action payload preview before approval
- Live run animation states

### Q4 — What should connect to Linear?

- Approval items when they move to APPROVED or REJECTED → create or update a Linear issue
- Blocked tasks (`status: "BLOCKED"`) → escalate to a Linear issue with blocker reason
- Evidence Registry completions → link to the corresponding Linear issue as proof comment

### Q5 — What should connect to GitHub?

- Evidence Registry: commit hash and PR URL should be linkable to audit entries
- Agent runs that produce code artifacts should record commit references in `AgentRunLog`
- Audit trail entries should accept a `githubRef` field (PR number / commit SHA) for traceability

### Q6 — What should remain local/mock until approved by Seif?

- District card live data on `/city` — should remain static until Seif approves real-time polling
- Heartbeat visualization — infrastructure added; UI display should wait for Seif approval
- Linear webhook integration (`/api/linear-webhook` exists but is not actively writing back to Linear)
- Any external send, publish, or payment action — already gated by approval policy in current code

### Q7 — Exact Linear Issues Needed (maximum 3)

---

#### Issue 1

**Title:** `[GitHub Review] Agent Control World — Evidence Trail Gap`

```
Source:
- Repo: saifsoub/AgentEmpire
- PR: #13 (merged)
- Current state: AuditEntry type defined in lib/types.ts but DemoDb had no auditEntries field; entries were never persisted
- Why this matters: Without an evidence trail, no action can be verified as complete; the city's governance model collapses
- Required action: Wire addAuditEntry / getAuditEntries to store.ts; expose GET /api/audit-trail and POST /api/audit-trail; call addAuditEntry from agent run and approval flows
- Acceptance criteria: Approval approve/reject actions write an AuditEntry; GET /api/audit-trail returns real entries; entries survive server restart
- Seif approval needed for: None — this is internal wiring, no external action
```

Labels: `github`, `review`, `yamel`, `execution`

---

#### Issue 2

**Title:** `[GitHub Review] Agent Control World — Agent Status & Heartbeat`

```
Source:
- Repo: saifsoub/AgentEmpire
- PR: #13 (merged)
- Current state: StoredAgent has no status, lastActiveAt, or heartbeatAt fields; the Agent Housing institution has no live status board
- Why this matters: Seif cannot tell if an agent is idle, running, or stuck without heartbeat visibility
- Required action: Add lastActiveAt + heartbeatAt to StoredAgent type; implement POST /api/agents/[id]/heartbeat; call heartbeat from agent run endpoint
- Acceptance criteria: After an agent run, lastActiveAt is updated; /agents page shows last active time per agent
- Seif approval needed for: UI display decision — whether to show heartbeat badge on /city district cards
```

Labels: `github`, `review`, `yamel`, `execution`

---

#### Issue 3

**Title:** `[GitHub Review] Agent Control World — District Live Data Integration`

```
Source:
- Repo: saifsoub/AgentEmpire
- PR: #13 (merged)
- Current state: City map district cards on /city show static text descriptions; item counts and agent activity are not wired to DB
- Why this matters: The city should react to real product state — leads arriving, agents running, approvals waiting; currently it is a static poster
- Required action: Add a GET /api/city/summary endpoint returning counts per district (tasks, approvals, leads, agent runs); wire district cards to show live counts
- Acceptance criteria: /city page shows real task count in Work Yards, real pending approval count in Approval Center, and real agent count in Agency; refreshes on page load
- Seif approval needed for: Polling interval — decide if this should auto-refresh or be manual
```

Labels: `github`, `review`, `yamel`, `execution`

---

### Q8 — Recommended Merge Decision for PR #13

**Decision: MERGE — already merged correctly.**

PR #13 addressed the structural corrections Seif required:
- Root redirects to `/city` ✓
- City map as primary navigation surface ✓
- Governor's Office execution console with Dry Run + Live modes ✓
- `updateApproval` 500 error fixed ✓
- District IA matches required naming ✓

The gaps identified above are follow-up work items, not blockers that should have held the merge. They are now tracked as Linear issues.

---

## Deliverable 3 — GitHub PR Comment (posted on PR #13)

See GitHub comment posted on PR #13 after this audit.

---

## Final Report to Seif

### Created Linear Issues (3)

1. `[GitHub Review] Agent Control World — Evidence Trail Gap` — internal wiring, no Seif approval needed to execute
2. `[GitHub Review] Agent Control World — Agent Status & Heartbeat` — Seif approval needed for UI display decision
3. `[GitHub Review] Agent Control World — District Live Data Integration` — Seif approval needed for polling interval decision

### PRs Skipped and Why

| PR | Reason |
|---|---|
| Actionplatform #30 | Different repository; defer until AgentEmpire gaps resolved |
| Actionplatform #22, #17, #16 | Secondary targets; no Linear issue needed at this stage |
| AgentEmpire #18–#29 | Consolidation only; too fragmented for individual issues without Seif review |

### Top 3 Recommended Next Moves

1. **Wire audit entries into the approval flow** — call `addAuditEntry` from `PATCH /api/approvals/[id]` so every approve/reject action is permanently recorded. No Seif approval needed.
2. **Display agent last-active time on `/agents` page** — `lastActiveAt` and `heartbeatAt` fields are now in the DB type; a one-line UI addition shows operators when each agent last ran. No Seif approval needed.
3. **Seif decision: approve live district data refresh** — the `/city` page needs Seif to confirm whether district cards should auto-refresh or be manually triggered. This is the only item needing a Seif decision before execution.

### Blockers

- None for items 1 and 2 above.
- Item 3 (city live data) requires Seif's explicit decision on refresh behavior before any polling is added.

### Merge / Hold Recommendation

| PR | Recommendation | Reason |
|---|---|---|
| AgentEmpire #13 | **Merged — correct decision** | All structural requirements met; gaps addressed via follow-up issues |
| Actionplatform #30 | **Hold — review pending** | Not yet reviewed in this audit; defer until AgentEmpire gaps are closed |

---

## Code Changes Delivered in This PR

The following gaps identified in this audit have been fixed directly in code:

| Gap | Fix |
|---|---|
| `AuditEntry` defined but never persisted | Added `auditEntries?: AuditEntry[]` to `DemoDb`; added `addAuditEntry` and `getAuditEntries` to `lib/store.ts` |
| No audit trail API | Added `GET /api/audit-trail` and `POST /api/audit-trail` endpoints |
| No agent heartbeat fields | Added `lastActiveAt?` and `heartbeatAt?` to `StoredAgent` type |
| No heartbeat endpoint | Added `POST /api/agents/[id]/heartbeat` endpoint |
