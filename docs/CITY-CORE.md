# City Core

City Core is the canonical foundation of S/ City: the schemas, lifecycles,
governance, and registries that every institution (University, Banking,
Treasury, Academy, …) depends on. Institutions are represented **through**
City Core — they never redefine it, and new institutions can be added without
changing the core.

Source: [`lib/city-core.ts`](../lib/city-core.ts) · Tests:
[`__tests__/city-core.test.ts`](../__tests__/city-core.test.ts)

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

## Phase D — Registries & repository

`CITY_REPOSITORY` maps the `city/*` folder layout to ontology kinds. Each kind
is backed by a `Registry` (single source of truth):

- `institutionRegistry` — every `cityInstitution` mapped via
  `toCanonicalInstitution`.
- `roleRegistry` — a role for every authority referenced by an institution.
- `permissionRegistry` — baseline permissions (sensitive ones gate approval).
- `workflowRegistry` — workflows, each referencing the permissions it needs.

## Self-inspection (for the hourly inspector)

`inspectCityCore()` returns one pass/fail result per item in
`CITY_ACCEPTANCE_CRITERIA`; `cityCoreHealthy()` is the boolean rollup. The test
suite asserts all eight criteria pass, so the foundation is verified on every
run.
