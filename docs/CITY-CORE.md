# S/ City — City Core

City Core is the canonical **lifecycle + schema + governance** foundation that
every City institution builds on. Per the *Agentic City workflows* plan, the
core is established **before** workflow implementation, so no future City entity
can exist outside this model.

It is a pure domain layer (no React, no I/O): `lib/city-core.ts`, validated in
`lib/validators.ts`, covered by `__tests__/city-core.test.ts`. The narrative
layer (`lib/city-world.ts`) and the institution map (`lib/city-institutions.ts`)
say *where* things live; City Core defines the *rules* they all obey.

## Lifecycle (state machines)

Forward-only transitions with explicit reinstatement and terminal end states.
Illegal moves are rejected (`canTransition*`) or thrown (`assertTransition*`).

- **Agent:** `DRAFT → PROVISIONED → ACTIVE ⇄ SUSPENDED → RETIRED` (RETIRED is terminal). Only `ACTIVE` agents are operable.
- **Institution:** `PROPOSED → CHARTERED → OPERATIONAL ⇄ DORMANT → DECOMMISSIONED`. Only `OPERATIONAL` institutions host work.

## Permissions (inheritance, delegation, escalation)

An ordered ladder where higher tiers inherit every capability below them:

`OBSERVE < OPERATE < APPROVE < GOVERN`

- `permissionSatisfies(held, required)` — rank comparison, not enumeration.
- `canDelegate(grantorTier, delegatedTier)` — authority flows down only, never above the grantor's tier.
- `requiresCouncilApproval(targetTier)` — `APPROVE` and `GOVERN` are sensitive and route through the Council Chamber (decisions) rather than being self-granted.

## Canonical schemas

`Institution`, `AgentProfile`, `SkillProfile`, `Permission`,
`PermissionUpgradeRequest`, and `EvidenceRecord`. Permissions and evidence are
kept distinct: one evidence record can attach to many institution flows
(training, certification, treasury, showcase) without collapsing into a grant.
Identifiers are prefixed and slugified via `makeId` (e.g. `inst_s-banking`).

## Governance gate

Completion is refused unless verified evidence exists, and — for sensitive work
— a Council approval has been granted (`canRecordCompletion`). This enforces the
city-wide path (kept in sync with `cityGovernanceFlow`):

`Claim captured → Evidence attached → Verification passed → Approval granted → Completion recorded`

## Build sequence

`cityCoreBuildSequence` enumerates the schema-first order handed to
implementation agents: shared primitives, then the models that reference them,
then governance, then the institution and workflow layers. The test suite
asserts the sequence is strictly ordered and every step depends only on
earlier models.

## Coverage maps to

- **SAG-53** — agent/institution lifecycle, permission inheritance, delegation, escalation
- **SAG-55** — `Institution` / `AgentProfile` / `SkillProfile` + shared enums and IDs
- **SAG-57** — `Permission` / `PermissionUpgradeRequest` / `EvidenceRecord` + council routing + governance gate
- **SAG-54** — canonical build sequence for downstream implementation
