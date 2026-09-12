# City Core

City Core is the canonical foundation of S/ City: the schemas, lifecycles,
governance, and registries that every institution (University, Banking,
Treasury, Academy, …) depends on. Institutions are represented **through**
City Core — they never redefine it, and new institutions can be added without
changing the core.

Core source: [`lib/city-core.ts`](../lib/city-core.ts) · Agent/skill profiles:
[`lib/city-agent-profiles.ts`](../lib/city-agent-profiles.ts) · Governance flows:
[`lib/city-governance-flows.ts`](../lib/city-governance-flows.ts).

Tests: [`__tests__/city-core.test.ts`](../__tests__/city-core.test.ts),
[`__tests__/city-agent-profiles.test.ts`](../__tests__/city-agent-profiles.test.ts),
and [`__tests__/city-governance-flows.test.ts`](../__tests__/city-governance-flows.test.ts).

The City Core change is validated by the non-deploying AgentEmpire CI gate:
TypeScript typecheck plus the full Vitest suite must pass before merge review.
A fresh branch-push CI run is required after rebasing or verification changes;
local test counts alone are supporting evidence, not merge acceptance.

## Phase A — Ontology

Thirteen canonical entity kinds (`ONTOLOGY_KINDS`), each documented in
`ONTOLOGY`: `entity`, `institution`, `agent`, `role`, `permission`,
`workflow`, `skill`, `asset`, `evidence`, `approval`, `audit-record`,
`treasury-account`, `learning-record`. Every city component maps to one kind;
`CanonicalEntity` is the shared shape.

## Phase B — Lifecycle engine

`LIFECYCLES` defines small state machines for `agent`, `institution`,
`workflow`, `permission`, and `treasury-account`. State changes go through
`transition(...)`, which rejects undeclared transitions and emits an immutable
`AuditRecord` for every legal one — so every change in the city is auditable.

```ts
const res = transition({ lifecycle: "agent", entityId: "a1",
  from: "PROPOSED", to: "ACTIVE", actor: "manager", at: now });
// res.ok ? { state, audit } : { reason }
```

## Phase C — Governance engine

`authorizeAction(...)` is the single gate every governed action passes
through. It enforces three invariants:

- **Authority** — the role must hold the permission.
- **Approval** — sensitive permissions require an `APPROVED` human decision.
- **Evidence** — completing work requires attached evidence.

The canonical claim order is `GOVERNANCE_FLOW` (capture → evidence →
verification → approval → completion).

`city-governance-flows.ts` adds the institution-neutral governance flows needed
around that core gate:

- role inheritance resolves direct + parent permissions and fails closed on
  missing parents or cycles;
- delegation is permission-subset, scope and time bounded, evidence-backed,
  revocable and approval-gated for sensitive authority;
- delegation does not transfer identity and re-delegation is denied by default;
- escalation records have explicit triggers and legal state transitions;
- activation guards keep identity, authority, evidence, human approval and
  runtime verification as separate required facts.

## Phase D — Registries, profiles & repository

`CITY_REPOSITORY` maps the `city/*` folder layout to ontology kinds. Each kind
is backed by a `Registry` (single source of truth):

- `institutionRegistry` — every `cityInstitution` mapped via
  `toCanonicalInstitution`.
- `roleRegistry` — a role for every authority referenced by an institution.
- `permissionRegistry` — baseline permissions (sensitive ones gate approval).
- `workflowRegistry` — workflows, each referencing the permissions it needs.
- `agentRegistry` — canonical `AgentProfile` records with explicit district,
  optional institution, roles, optional passport ID, and agent lifecycle state.
- `skillProfileRegistry` — evidence-bearing `SkillProfile` records linked to a
  registered agent. Skill proficiency never grants authority by itself.
- `delegationRegistry` — active/revoked delegated-authority records.
- `escalationRegistry` — governed escalation records and resolutions.

`registerAgentProfile(...)` prevents orphaned institution references and
institution/district mismatches. `registerSkillProfile(...)` prevents orphaned
skill profiles and mismatched agent-to-skill-profile links. These are shared
relationship rules only; institution-specific admissions, curriculum,
treasury, publishing, or other policies stay outside the shared core.

## Self-inspection (for the hourly inspector)

`inspectCityCore()` returns one pass/fail result per item in
`CITY_ACCEPTANCE_CRITERIA`; `cityCoreHealthy()` is the boolean rollup. The test
suite asserts all eight criteria pass, so the foundation is verified on every
run.
