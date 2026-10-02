// S/ City — City Core foundation.
//
// This is the canonical lifecycle + schema + governance layer that every City
// institution (University, Banking, Treasury, and the operational workflow
// lanes) is required to build on. Per the "Agentic City workflows" plan, the
// core is established *before* workflow implementation so no future City entity
// can exist outside this model.
//
// It is deliberately pure (no React, no I/O): lifecycle is a set of state
// machines, permissions are an ordered inheritance ladder, and governance is a
// gate that refuses completion without verified evidence and approval. The
// existing narrative layer (`city-world.ts`) and the institution map
// (`city-institutions.ts`) describe *where* things live; this file defines the
// *rules* they all obey.

// ---------------------------------------------------------------------------
// Shared primitives (SAG-55)
// ---------------------------------------------------------------------------

export type EntityId = string;

// Stable, prefixed identifiers so downstream models can tell primitives apart
// at a glance (e.g. `inst_s-banking`, `agent_dima`, `perm_…`).
export type IdPrefix = 'inst' | 'agent' | 'skill' | 'perm' | 'upreq' | 'evi';

export function makeId(prefix: IdPrefix, slug: string): EntityId {
  const clean = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${prefix}_${clean}`;
}

// ---------------------------------------------------------------------------
// Lifecycle state machines (SAG-53)
// ---------------------------------------------------------------------------

// An agent moves forward through provisioning and activation, can be suspended
// and reinstated, and ends in retirement. RETIRED is terminal.
export type AgentLifecycleState =
  | 'DRAFT'
  | 'PROVISIONED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'RETIRED';

// An institution is proposed, chartered (governance-approved), then becomes
// operational. It can go dormant and be reactivated, and ends decommissioned.
export type InstitutionLifecycleState =
  | 'PROPOSED'
  | 'CHARTERED'
  | 'OPERATIONAL'
  | 'DORMANT'
  | 'DECOMMISSIONED';

const AGENT_TRANSITIONS: Record<AgentLifecycleState, AgentLifecycleState[]> = {
  DRAFT: ['PROVISIONED', 'RETIRED'],
  PROVISIONED: ['ACTIVE', 'RETIRED'],
  ACTIVE: ['SUSPENDED', 'RETIRED'],
  SUSPENDED: ['ACTIVE', 'RETIRED'],
  RETIRED: [],
};

const INSTITUTION_TRANSITIONS: Record<InstitutionLifecycleState, InstitutionLifecycleState[]> = {
  PROPOSED: ['CHARTERED', 'DECOMMISSIONED'],
  CHARTERED: ['OPERATIONAL', 'DECOMMISSIONED'],
  OPERATIONAL: ['DORMANT', 'DECOMMISSIONED'],
  DORMANT: ['OPERATIONAL', 'DECOMMISSIONED'],
  DECOMMISSIONED: [],
};

export function canTransitionAgent(from: AgentLifecycleState, to: AgentLifecycleState): boolean {
  return AGENT_TRANSITIONS[from].includes(to);
}

export function canTransitionInstitution(
  from: InstitutionLifecycleState,
  to: InstitutionLifecycleState,
): boolean {
  return INSTITUTION_TRANSITIONS[from].includes(to);
}

// Throwing variants for service code that must not silently ignore an illegal
// move. The pure `canTransition*` predicates are for UI/decision logic.
export function assertAgentTransition(from: AgentLifecycleState, to: AgentLifecycleState): void {
  if (!canTransitionAgent(from, to)) {
    throw new Error(`Illegal agent lifecycle transition: ${from} → ${to}`);
  }
}

export function assertInstitutionTransition(
  from: InstitutionLifecycleState,
  to: InstitutionLifecycleState,
): void {
  if (!canTransitionInstitution(from, to)) {
    throw new Error(`Illegal institution lifecycle transition: ${from} → ${to}`);
  }
}

// An agent can act only while ACTIVE; an institution can host work only while
// OPERATIONAL. Every workflow lane gates on these before doing anything.
export function isAgentOperable(state: AgentLifecycleState): boolean {
  return state === 'ACTIVE';
}

export function isInstitutionOperable(state: InstitutionLifecycleState): boolean {
  return state === 'OPERATIONAL';
}

// ---------------------------------------------------------------------------
// Permission inheritance, delegation, escalation (SAG-53 / SAG-57)
// ---------------------------------------------------------------------------

// Ordered ladder. A holder of a higher tier inherits every capability of the
// tiers below it, so checks compare rank rather than enumerate grants.
export type PermissionTier = 'OBSERVE' | 'OPERATE' | 'APPROVE' | 'GOVERN';

const PERMISSION_RANK: Record<PermissionTier, number> = {
  OBSERVE: 0,
  OPERATE: 1,
  APPROVE: 2,
  GOVERN: 3,
};

export function permissionRank(tier: PermissionTier): number {
  return PERMISSION_RANK[tier];
}

// Does a held tier satisfy a required one? (inheritance: GOVERN satisfies all)
export function permissionSatisfies(held: PermissionTier, required: PermissionTier): boolean {
  return PERMISSION_RANK[held] >= PERMISSION_RANK[required];
}

// Delegation rule: an agent may delegate authority at or below its own tier,
// never above it. This is the only legal way trust flows downward.
export function canDelegate(grantorTier: PermissionTier, delegatedTier: PermissionTier): boolean {
  return PERMISSION_RANK[grantorTier] >= PERMISSION_RANK[delegatedTier];
}

// Tiers at or above APPROVE move sensitive authority and must be routed through
// the Council Chamber (decisions) rather than self-granted.
export function requiresCouncilApproval(targetTier: PermissionTier): boolean {
  return PERMISSION_RANK[targetTier] >= PERMISSION_RANK['APPROVE'];
}

// ---------------------------------------------------------------------------
// Canonical schemas (SAG-55 / SAG-57)
// ---------------------------------------------------------------------------

export interface Institution {
  id: EntityId;
  name: string;
  district: string;
  purpose: string;
  lifecycle: InstitutionLifecycleState;
  charteredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillProfile {
  id: EntityId;
  name: string;
  level: number; // 0..100, demonstrated proficiency
  certified: boolean;
  certificationId?: string;
}

export interface AgentProfile {
  id: EntityId;
  name: string;
  homeInstitutionId: EntityId;
  lifecycle: AgentLifecycleState;
  permissionTier: PermissionTier;
  skills: SkillProfile[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: EntityId;
  agentId: EntityId;
  tier: PermissionTier;
  scope: string; // institution id, "*" for city-wide, or a capability key
  grantedBy: EntityId; // agent or owner that issued the grant
  delegated: boolean;
  createdAt: string;
}

export type PermissionUpgradeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PermissionUpgradeRequest {
  id: EntityId;
  agentId: EntityId;
  currentTier: PermissionTier;
  requestedTier: PermissionTier;
  justification: string;
  routedToCouncil: boolean;
  status: PermissionUpgradeStatus;
  decidedBy?: EntityId;
  decidedAt?: string;
  createdAt: string;
}

export type EvidenceKind =
  | 'commit'
  | 'pull_request'
  | 'file'
  | 'screenshot'
  | 'decision_note'
  | 'test_run'
  | 'deployment';

// Proof attached before anything is marked complete. Evidence is kept distinct
// from permissions: a record can attach to many institution flows (training,
// certification, treasury, showcase) without collapsing into a grant object.
export interface EvidenceRecord {
  id: EntityId;
  kind: EvidenceKind;
  uri: string; // commit sha, PR url, file path, screenshot link, …
  summary: string;
  verified: boolean;
  // Flows this evidence supports, e.g. ["training:design-elevation", "task:abc"].
  linkedFlowIds: string[];
  recordedBy: EntityId;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Governance gate (SAG-57) — mirrors `cityGovernanceFlow` in city-institutions.
// ---------------------------------------------------------------------------

// Completion is refused unless verified evidence exists and (for sensitive
// work) a council approval has been granted. This is the city-wide rule the
// Evidence Registry and Approval Center enforce: claim → evidence → verify →
// approve → complete.
export function canRecordCompletion(args: {
  evidence: Pick<EvidenceRecord, 'verified'>[];
  approvalGranted: boolean;
  sensitive: boolean;
}): { allowed: boolean; reason?: string } {
  const hasVerifiedEvidence = args.evidence.some((e) => e.verified);
  if (!hasVerifiedEvidence) {
    return { allowed: false, reason: 'No verified evidence attached.' };
  }
  if (args.sensitive && !args.approvalGranted) {
    return { allowed: false, reason: 'Sensitive work requires Council Chamber approval.' };
  }
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Build sequence (SAG-54) — canonical order for implementation agents.
// ---------------------------------------------------------------------------

export type CoreModel =
  | 'Institution'
  | 'AgentProfile'
  | 'SkillProfile'
  | 'Permission'
  | 'PermissionUpgradeRequest'
  | 'EvidenceRecord';

export type CityCoreBuildPhase = 'Core' | 'Governance' | 'Treasury' | 'Workflows';

export type CityCoreBuildStep = {
  order: number;
  model: CoreModel | string;
  phase: CityCoreBuildPhase;
  dependsOn: (CoreModel | string)[];
  note: string;
};

// Schema-first sequence: shared primitives, then the models that reference
// them, then governance, then the institution-specific and workflow layers
// that consume the core. Downstream tooling reads this to know what to build
// next and what each step requires.
export const cityCoreBuildSequence: CityCoreBuildStep[] = [
  { order: 1, model: 'Institution', phase: 'Core', dependsOn: [], note: 'Districts, lifecycle, and charter state for every city institution.' },
  { order: 2, model: 'SkillProfile', phase: 'Core', dependsOn: [], note: 'Demonstrated proficiency primitive referenced by agents and certification.' },
  { order: 3, model: 'AgentProfile', phase: 'Core', dependsOn: ['Institution', 'SkillProfile'], note: 'Agent identity, home institution, lifecycle, and held permission tier.' },
  { order: 4, model: 'Permission', phase: 'Governance', dependsOn: ['AgentProfile'], note: 'Tiered, inheritable grants scoped to institutions or capabilities.' },
  { order: 5, model: 'PermissionUpgradeRequest', phase: 'Governance', dependsOn: ['Permission'], note: 'Upgrade routing; APPROVE+ tiers go through the Council Chamber.' },
  { order: 6, model: 'EvidenceRecord', phase: 'Governance', dependsOn: ['AgentProfile'], note: 'Proof attached to flows before completion; enforced by the governance gate.' },
];

// The five-stage governance path the gate enforces. Kept in sync with
// `cityGovernanceFlow` in city-institutions.ts.
export const cityCoreGovernancePath = [
  'Claim captured',
  'Evidence attached',
  'Verification passed',
  'Approval granted',
  'Completion recorded',
] as const;
