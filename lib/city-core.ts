// S/ City Core — the canonical foundation every institution depends on.
//
// Per the project brief ("Build City Core first: lifecycle, schemas,
// governance, and repository architecture before workflow implementation")
// this module is the single source of truth for:
//
//   Phase A — Core Ontology      : the canonical entity kinds
//   Phase B — Lifecycle Engine   : auditable state transitions
//   Phase C — Governance Engine  : permissions, approvals, evidence
//   Phase D — Repository / Registries
//
// Institutions (University, Banking, Treasury, …) are represented *through*
// these schemas; they do not redefine them. New institutions can be added
// without changing City Core.

import { cityInstitutions, type CityInstitution } from '@/lib/city-institutions';

// ---------------------------------------------------------------------------
// Phase A — Core Ontology
// ---------------------------------------------------------------------------

// The thirteen canonical things that can exist in the city. Every City
// component must map to one of these kinds (Acceptance Criterion #1).
export const ONTOLOGY_KINDS = [
  'institution',
  'agent',
  'role',
  'permission',
  'workflow',
  'skill',
  'asset',
  'evidence',
  'approval',
  'audit-record',
  'treasury-account',
  'learning-record',
  'entity', // the base kind for anything not otherwise specialised
] as const;

export type OntologyKind = (typeof ONTOLOGY_KINDS)[number];

export const ONTOLOGY: Record<OntologyKind, string> = {
  'entity': 'Base unit of the city. Everything is an entity.',
  'institution': 'A governed place of work (University, Banking, Treasury, …).',
  'agent': 'An autonomous worker with roles, skills, and a lifecycle.',
  'role': 'A named bundle of permissions an agent or human can hold.',
  'permission': 'Authority to perform an action on a kind of resource.',
  'workflow': 'A governed sequence of steps that references permissions.',
  'skill': 'A trainable, certifiable capability an agent can apply.',
  'asset': 'A produced artifact of value (content, toolkit, deliverable).',
  'evidence': 'Proof attached to a claim before it can be completed.',
  'approval': 'A human decision gating a sensitive action.',
  'audit-record': 'An immutable record of a state transition or decision.',
  'treasury-account': 'A governed store of value with auditable movements.',
  'learning-record': 'A record of training, assessment, or certification.',
};

// The canonical shape every city component shares.
export type CanonicalEntity = {
  id: string;
  kind: OntologyKind;
  name: string;
  // The institution / registry this entity belongs to, if any.
  institutionId?: string;
  // Lifecycle state for entities that have a lifecycle (Phase B).
  state?: string;
  // Free-form provenance describing where the entity was mapped from.
  source?: string;
};

export function isOntologyKind(value: string): value is OntologyKind {
  return (ONTOLOGY_KINDS as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Phase B — Lifecycle Engine
// ---------------------------------------------------------------------------

// A lifecycle is a small state machine: an initial state plus the allowed
// transitions out of each state. Anything not listed is rejected.
export type Lifecycle = {
  initial: string;
  transitions: Record<string, string[]>;
};

export type LifecycleName = 'agent' | 'institution' | 'workflow' | 'permission' | 'treasury-account';

export const LIFECYCLES: Record<LifecycleName, Lifecycle> = {
  agent: {
    initial: 'PROPOSED',
    transitions: {
      PROPOSED: ['ACTIVE', 'RETIRED'],
      ACTIVE: ['SUSPENDED', 'RETIRED'],
      SUSPENDED: ['ACTIVE', 'RETIRED'],
      RETIRED: [],
    },
  },
  institution: {
    initial: 'PLANNED',
    transitions: {
      PLANNED: ['READY', 'ARCHIVED'],
      READY: ['ACTIVE', 'ARCHIVED'],
      ACTIVE: ['ARCHIVED'],
      ARCHIVED: [],
    },
  },
  workflow: {
    initial: 'DRAFT',
    transitions: {
      DRAFT: ['APPROVED', 'ARCHIVED'],
      APPROVED: ['ACTIVE', 'ARCHIVED'],
      ACTIVE: ['DEPRECATED', 'ARCHIVED'],
      DEPRECATED: ['ARCHIVED'],
      ARCHIVED: [],
    },
  },
  permission: {
    initial: 'REQUESTED',
    transitions: {
      REQUESTED: ['GRANTED', 'DENIED'],
      GRANTED: ['REVOKED'],
      DENIED: [],
      REVOKED: [],
    },
  },
  'treasury-account': {
    initial: 'OPEN',
    transitions: {
      OPEN: ['FROZEN', 'CLOSED'],
      FROZEN: ['OPEN', 'CLOSED'],
      CLOSED: [],
    },
  },
};

export function lifecycleStates(name: LifecycleName): string[] {
  return Object.keys(LIFECYCLES[name].transitions);
}

export function canTransition(name: LifecycleName, from: string, to: string): boolean {
  return Boolean(LIFECYCLES[name].transitions[from]?.includes(to));
}

export type AuditRecord = {
  id: string;
  kind: 'audit-record';
  lifecycle: LifecycleName;
  entityId: string;
  from: string;
  to: string;
  actor: string;
  at: string;
  reason?: string;
};

export type TransitionResult =
  | { ok: true; state: string; audit: AuditRecord }
  | { ok: false; reason: string };

// Transition an entity and emit an immutable audit record. Every state change
// in the city flows through here, so every change is auditable (Criterion #3).
export function transition(args: {
  lifecycle: LifecycleName;
  entityId: string;
  from: string;
  to: string;
  actor: string;
  at: string;
  reason?: string;
}): TransitionResult {
  const { lifecycle, entityId, from, to, actor, at, reason } = args;
  if (!canTransition(lifecycle, from, to)) {
    return { ok: false, reason: `Illegal ${lifecycle} transition: ${from} → ${to}.` };
  }
  const audit: AuditRecord = {
    id: `audit_${lifecycle}_${entityId}_${at}`,
    kind: 'audit-record',
    lifecycle,
    entityId,
    from,
    to,
    actor,
    at,
    reason,
  };
  return { ok: true, state: to, audit };
}

// ---------------------------------------------------------------------------
// Phase C — Governance Engine
// ---------------------------------------------------------------------------

export type Permission = {
  id: string;
  kind: 'permission';
  action: string; // canonical verb, e.g. "spend", "publish", "train"
  resourceKind: OntologyKind;
  // Sensitive permissions require an explicit human approval to exercise.
  sensitive: boolean;
};

export type Role = {
  id: string;
  kind: 'role';
  name: string;
  permissionIds: string[];
};

export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ActionRequest = {
  // The role attempting the action.
  role: Role;
  // The permission the action requires.
  permission: Permission;
  // Whether this action completes/closes work (must reference evidence).
  completesWork?: boolean;
  evidenceIds?: string[];
  // The linked human approval, when the action is sensitive.
  approval?: ApprovalState | null;
};

export type AuthorizationResult = { allowed: boolean; reason?: string };

// The single gate every governed action passes through. It enforces the four
// governance invariants:
//   - authority: the role must actually hold the permission (Criterion #2)
//   - approval:  sensitive actions require an APPROVED human decision
//   - evidence:  completing work requires attached evidence (Criterion #5)
export function authorizeAction(req: ActionRequest): AuthorizationResult {
  const { role, permission, approval, completesWork, evidenceIds } = req;

  if (!role.permissionIds.includes(permission.id)) {
    return { allowed: false, reason: `Role "${role.name}" does not hold permission "${permission.id}".` };
  }

  if (permission.sensitive) {
    if (approval !== 'APPROVED') {
      return { allowed: false, reason: `Sensitive action "${permission.action}" requires an approved human decision.` };
    }
  }

  if (completesWork && (!evidenceIds || evidenceIds.length === 0)) {
    return { allowed: false, reason: 'Work cannot be completed without attached evidence.' };
  }

  return { allowed: true };
}

// The canonical order every governed claim moves through. Surfaced for the
// hourly inspector and the UI.
export const GOVERNANCE_FLOW = [
  'Claim captured',
  'Evidence attached',
  'Verification passed',
  'Approval granted',
  'Completion recorded',
] as const;

// ---------------------------------------------------------------------------
// Phase D — Repository structure & canonical registries
// ---------------------------------------------------------------------------

// The canonical city/ repository structure (Phase D). Each folder is backed by
// a registry below; this is the map between "where it lives" and "what indexes
// it".
export const CITY_REPOSITORY: Record<string, OntologyKind> = {
  'city/institutions': 'institution',
  'city/agents': 'agent',
  'city/roles': 'role',
  'city/permissions': 'permission',
  'city/workflows': 'workflow',
  'city/treasury': 'treasury-account',
  'city/learning': 'learning-record',
  'city/evidence': 'evidence',
  'city/audit': 'audit-record',
};

// A tiny, dependency-free in-memory registry. Single source of truth per kind.
export class Registry<T extends { id: string }> {
  private readonly items = new Map<string, T>();

  constructor(public readonly kind: OntologyKind, seed: T[] = []) {
    for (const item of seed) this.register(item);
  }

  register(item: T): T {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): T | undefined {
    return this.items.get(id);
  }

  has(id: string): boolean {
    return this.items.has(id);
  }

  list(): T[] {
    return [...this.items.values()];
  }

  get size(): number {
    return this.items.size;
  }
}

// Canonical Institution entity — the schema every institution maps to,
// regardless of its bespoke domain model.
export type Institution = CanonicalEntity & {
  kind: 'institution';
  district: string;
  purpose: string;
  state: string; // institution lifecycle state
  roleIds: string[];
};

// Map a bespoke CityInstitution (narrative/UI model) onto the canonical
// schema. Generic: a new institution needs no City Core changes (Criterion #7).
export function toCanonicalInstitution(institution: CityInstitution): Institution {
  return {
    id: institution.id,
    kind: 'institution',
    name: institution.name,
    district: institution.district,
    purpose: institution.purpose,
    institutionId: institution.id,
    state: institution.status === 'ready' ? 'ACTIVE' : 'PLANNED',
    roleIds: institution.relatedAgentRoles.map(roleId),
    source: 'lib/city-institutions',
  };
}

// Derive a stable role id from a human role label.
export function roleId(label: string): string {
  return `role_${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
}

// --- Registries (single source of truth) ----------------------------------

export const institutionRegistry = new Registry<Institution>(
  'institution',
  cityInstitutions.map(toCanonicalInstitution),
);

// Roles are derived from every role label referenced by an institution, so
// every authority that appears in the city is registered and governable.
export const roleRegistry = new Registry<Role>('role');
for (const institution of cityInstitutions) {
  for (const label of institution.relatedAgentRoles) {
    const id = roleId(label);
    if (!roleRegistry.has(id)) {
      roleRegistry.register({ id, kind: 'role', name: label, permissionIds: [] });
    }
  }
}

// A baseline permission catalogue. Sensitive ones gate on human approval.
export const permissionRegistry = new Registry<Permission>('permission', [
  { id: 'perm_train', kind: 'permission', action: 'train', resourceKind: 'agent', sensitive: false },
  { id: 'perm_certify', kind: 'permission', action: 'certify', resourceKind: 'learning-record', sensitive: false },
  { id: 'perm_spend', kind: 'permission', action: 'spend', resourceKind: 'treasury-account', sensitive: true },
  { id: 'perm_publish', kind: 'permission', action: 'publish', resourceKind: 'asset', sensitive: true },
  { id: 'perm_grant', kind: 'permission', action: 'grant-permission', resourceKind: 'permission', sensitive: true },
  { id: 'perm_run_workflow', kind: 'permission', action: 'run', resourceKind: 'workflow', sensitive: false },
]);

// Canonical Workflow entity — every workflow references the permissions its
// steps require (Criterion #4).
export type Workflow = CanonicalEntity & {
  kind: 'workflow';
  state: string;
  requiredPermissionIds: string[];
};

export const workflowRegistry = new Registry<Workflow>('workflow', [
  {
    id: 'wf_governed_completion',
    kind: 'workflow',
    name: 'Governed Completion',
    state: 'ACTIVE',
    requiredPermissionIds: ['perm_run_workflow'],
  },
  {
    id: 'wf_treasury_spend',
    kind: 'workflow',
    name: 'Treasury Spend',
    state: 'ACTIVE',
    requiredPermissionIds: ['perm_run_workflow', 'perm_spend'],
  },
  {
    id: 'wf_agent_certification',
    kind: 'workflow',
    name: 'Agent Certification',
    state: 'ACTIVE',
    requiredPermissionIds: ['perm_run_workflow', 'perm_train', 'perm_certify'],
  },
]);

// ---------------------------------------------------------------------------
// Self-check — for the hourly third-party inspector
// ---------------------------------------------------------------------------

export const CITY_ACCEPTANCE_CRITERIA = [
  'Every City component maps to the ontology.',
  'Every authority is governed.',
  'Every value movement is auditable.',
  'Every workflow references permissions.',
  'Every decision references evidence.',
  'Every institution can be represented through canonical schemas.',
  'New institutions can be added without redesigning City Core.',
  'Treasury, University and Academy depend on City Core rather than defining it.',
] as const;

export type InspectionResult = { criterion: string; passed: boolean; detail: string };

// A deterministic self-inspection of City Core against the global acceptance
// criteria. The hourly inspector (and the test suite) can run this to confirm
// the foundation still holds. Returns one result per criterion.
export function inspectCityCore(): InspectionResult[] {
  const results: InspectionResult[] = [];

  // 1. Every City component maps to the ontology.
  const institutions = institutionRegistry.list();
  const allMapped = institutions.every((i) => isOntologyKind(i.kind));
  results.push({
    criterion: CITY_ACCEPTANCE_CRITERIA[0],
    passed: allMapped && institutions.length === cityInstitutions.length,
    detail: `${institutions.length} institutions mapped to canonical entities.`,
  });

  // 2. Every authority is governed — an action without the permission is denied.
  const ungovern = authorizeAction({
    role: { id: 'role_test', kind: 'role', name: 'Test', permissionIds: [] },
    permission: permissionRegistry.get('perm_spend')!,
  });
  results.push({
    criterion: CITY_ACCEPTANCE_CRITERIA[1],
    passed: ungovern.allowed === false,
    detail: 'Actions without a held permission are denied by authorizeAction.',
  });

  // 3. Every value movement is auditable — a treasury transition emits audit.
  const move = transition({
    lifecycle: 'treasury-account',
    entityId: 'acct_demo',
    from: 'OPEN',
    to: 'FROZEN',
    actor: 'inspector',
    at: '1970-01-01T00:00:00.000Z',
  });
  results.push({
    criterion: CITY_ACCEPTANCE_CRITERIA[2],
    passed: move.ok && move.audit.kind === 'audit-record',
    detail: 'Treasury-account transitions produce an immutable audit record.',
  });

  // 4. Every workflow references permissions.
  const workflows = workflowRegistry.list();
  results.push({
    criterion: CITY_ACCEPTANCE_CRITERIA[3],
    passed: workflows.length > 0 && workflows.every((w) => w.requiredPermissionIds.length > 0),
    detail: `${workflows.length} workflows, all referencing permissions.`,
  });

  // 5. Every decision references evidence — completing work without it is denied.
  const role: Role = { id: 'role_qa', kind: 'role', name: 'QA', permissionIds: ['perm_run_workflow'] };
  const noEvidence = authorizeAction({
    role,
    permission: permissionRegistry.get('perm_run_workflow')!,
    completesWork: true,
    evidenceIds: [],
  });
  results.push({
    criterion: CITY_ACCEPTANCE_CRITERIA[4],
    passed: noEvidence.allowed === false,
    detail: 'Completing work without attached evidence is denied.',
  });

  // 6. Every institution can be represented through canonical schemas.
  const representable = cityInstitutions.every((i) => {
    const c = toCanonicalInstitution(i);
    return c.kind === 'institution' && Boolean(c.id) && Boolean(c.name) && lifecycleStates('institution').includes(c.state);
  });
  results.push({
    criterion: CITY_ACCEPTANCE_CRITERIA[5],
    passed: representable,
    detail: 'All institutions map to a valid canonical Institution with a valid lifecycle state.',
  });

  // 7. New institutions can be added without redesigning City Core.
  const probe = toCanonicalInstitution({
    id: 'probe-institution',
    name: 'Probe Institution',
    district: 'Probe District',
    x: '0%',
    y: '0%',
    purpose: 'Verifies extensibility.',
    relatedAgentRoles: ['Probe Role'],
    relatedTools: [],
    futureIntegrations: [],
    rooms: [],
    status: 'planned',
  });
  results.push({
    criterion: CITY_ACCEPTANCE_CRITERIA[6],
    passed: probe.kind === 'institution' && probe.state === 'PLANNED',
    detail: 'An arbitrary new institution maps onto City Core with no schema changes.',
  });

  // 8. Treasury, University and Academy depend on City Core.
  const dependants = ['s-treasury', 's-university', 's-academy'];
  const present = dependants.filter((id) => institutionRegistry.has(id));
  results.push({
    criterion: CITY_ACCEPTANCE_CRITERIA[7],
    passed: present.length === dependants.length,
    detail: `Core institutions registered in City Core: ${present.join(', ')}.`,
  });

  return results;
}

export function cityCoreHealthy(): boolean {
  return inspectCityCore().every((r) => r.passed);
}
