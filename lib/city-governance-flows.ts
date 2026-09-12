// Cross-City governance flows that sit on top of the canonical City Core.
//
// These rules are intentionally institution-neutral. Domain systems may add
// stricter policy, but they must not weaken inheritance, delegation,
// escalation, approval, evidence, or runtime-verification boundaries here.

import {
  type ApprovalState,
  type Permission,
  type Role,
  permissionRegistry,
} from '@/lib/city-core';
import { type AgentProfile } from '@/lib/city-agent-profiles';

export type RoleDefinition = Role & {
  inheritsRoleIds?: string[];
};

export type PermissionResolution =
  | { ok: true; permissionIds: string[] }
  | { ok: false; reason: string };

/** Resolve direct + inherited permissions. Missing parents and cycles fail closed. */
export function resolveEffectivePermissions(
  roleId: string,
  roles: readonly RoleDefinition[],
): PermissionResolution {
  const byId = new Map(roles.map((role) => [role.id, role]));
  const effective = new Set<string>();
  const visited = new Set<string>();
  const visiting = new Set<string>();
  let failure: string | undefined;

  const visit = (id: string): void => {
    if (failure || visited.has(id)) return;
    if (visiting.has(id)) {
      failure = `Role inheritance cycle detected at ${id}.`;
      return;
    }

    const role = byId.get(id);
    if (!role) {
      failure = `Unknown inherited role: ${id}.`;
      return;
    }

    visiting.add(id);
    for (const parentId of role.inheritsRoleIds ?? []) visit(parentId);
    if (failure) return;
    for (const permissionId of role.permissionIds) effective.add(permissionId);
    visiting.delete(id);
    visited.add(id);
  };

  visit(roleId);
  if (failure) return { ok: false, reason: failure };
  return { ok: true, permissionIds: [...effective].sort() };
}

export type DelegationState = 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export type DelegationRecord = {
  id: string;
  delegatorId: string;
  delegateeId: string;
  delegatorRoleId: string;
  delegateeRoleId: string;
  permissionIds: string[];
  scope: string;
  startsAt: string;
  expiresAt?: string;
  state: DelegationState;
  approval?: ApprovalState | null;
  evidenceIds: string[];
  allowRedelegation?: boolean;
};

export const delegationRegistry = new Map<string, DelegationRecord>();

export type DelegationActivationResult =
  | { ok: true; delegation: DelegationRecord }
  | { ok: false; reason: string };

export function activateDelegation(args: {
  delegation: DelegationRecord;
  delegatorEffectivePermissionIds: readonly string[];
  permissionLookup?: (permissionId: string) => Permission | undefined;
}): DelegationActivationResult {
  const { delegation, delegatorEffectivePermissionIds } = args;
  const permissionLookup = args.permissionLookup ?? ((id: string) => permissionRegistry.get(id));

  if (delegation.state !== 'PENDING') {
    return { ok: false, reason: `Delegation ${delegation.id} is not pending.` };
  }
  if (delegation.permissionIds.length === 0) {
    return { ok: false, reason: 'Delegation must contain at least one permission.' };
  }
  if (delegation.evidenceIds.length === 0) {
    return { ok: false, reason: 'Delegation requires supporting evidence.' };
  }

  for (const permissionId of delegation.permissionIds) {
    if (!delegatorEffectivePermissionIds.includes(permissionId)) {
      return {
        ok: false,
        reason: `Delegator does not hold permission ${permissionId}.`,
      };
    }
    const permission = permissionLookup(permissionId);
    if (!permission) {
      return { ok: false, reason: `Unknown permission ${permissionId}.` };
    }
    if (permission.sensitive && delegation.approval !== 'APPROVED') {
      return {
        ok: false,
        reason: `Sensitive delegated permission ${permissionId} requires approved human decision.`,
      };
    }
  }

  const start = Date.parse(delegation.startsAt);
  const end = delegation.expiresAt ? Date.parse(delegation.expiresAt) : undefined;
  if (Number.isNaN(start) || (end !== undefined && Number.isNaN(end))) {
    return { ok: false, reason: 'Delegation timestamps must be valid ISO timestamps.' };
  }
  if (end !== undefined && end <= start) {
    return { ok: false, reason: 'Delegation expiry must be after its start.' };
  }

  const active = { ...delegation, state: 'ACTIVE' as const };
  delegationRegistry.set(active.id, active);
  return { ok: true, delegation: active };
}

export function revokeDelegation(id: string): DelegationActivationResult {
  const current = delegationRegistry.get(id);
  if (!current) return { ok: false, reason: `Unknown delegation ${id}.` };
  if (current.state !== 'ACTIVE') {
    return { ok: false, reason: `Delegation ${id} is not active.` };
  }
  const revoked = { ...current, state: 'REVOKED' as const };
  delegationRegistry.set(id, revoked);
  return { ok: true, delegation: revoked };
}

export function canUseDelegation(args: {
  delegation: DelegationRecord;
  permissionId: string;
  scope: string;
  at: string;
  forRedelegation?: boolean;
}): boolean {
  const { delegation, permissionId, scope, at, forRedelegation } = args;
  if (delegation.state !== 'ACTIVE') return false;
  if (!delegation.permissionIds.includes(permissionId)) return false;
  if (delegation.scope !== '*' && delegation.scope !== scope) return false;
  if (forRedelegation && !delegation.allowRedelegation) return false;

  const now = Date.parse(at);
  const start = Date.parse(delegation.startsAt);
  const end = delegation.expiresAt ? Date.parse(delegation.expiresAt) : undefined;
  if (Number.isNaN(now) || Number.isNaN(start)) return false;
  if (now < start) return false;
  if (end !== undefined && now >= end) return false;
  return true;
}

export type EscalationTrigger =
  | 'MISSING_PERMISSION'
  | 'MISSING_APPROVAL'
  | 'EVIDENCE_GAP'
  | 'POLICY_CONFLICT'
  | 'DELEGATION_SCOPE_EXCEEDED'
  | 'RUNTIME_UNAVAILABLE'
  | 'OWNER_GATE'
  | 'IDENTITY_RUNTIME_MISMATCH'
  | 'SECURITY_OR_PRIVACY_RISK';

export type EscalationState = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CLOSED';

export type EscalationRecord = {
  id: string;
  subjectId: string;
  trigger: EscalationTrigger;
  requestedAction: string;
  currentAuthority: string;
  missingAuthorityOrEvidence: string;
  risk: string;
  owner: string;
  createdAt: string;
  evidenceIds: string[];
  state: EscalationState;
  resolution?: string;
  resolvedAt?: string;
};

export const escalationRegistry = new Map<string, EscalationRecord>();

export function openEscalation(
  record: Omit<EscalationRecord, 'state' | 'resolution' | 'resolvedAt'>,
): EscalationRecord {
  const opened: EscalationRecord = { ...record, state: 'OPEN' };
  escalationRegistry.set(opened.id, opened);
  return opened;
}

const ESCALATION_TRANSITIONS: Record<EscalationState, EscalationState[]> = {
  OPEN: ['ACKNOWLEDGED', 'CLOSED'],
  ACKNOWLEDGED: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

export type EscalationTransitionResult =
  | { ok: true; escalation: EscalationRecord }
  | { ok: false; reason: string };

export function transitionEscalation(args: {
  id: string;
  to: EscalationState;
  at: string;
  resolution?: string;
}): EscalationTransitionResult {
  const current = escalationRegistry.get(args.id);
  if (!current) return { ok: false, reason: `Unknown escalation ${args.id}.` };
  if (!ESCALATION_TRANSITIONS[current.state].includes(args.to)) {
    return {
      ok: false,
      reason: `Illegal escalation transition: ${current.state} → ${args.to}.`,
    };
  }
  if ((args.to === 'RESOLVED' || args.to === 'CLOSED') && !args.resolution) {
    return { ok: false, reason: `${args.to} escalation requires a resolution.` };
  }

  const next: EscalationRecord = {
    ...current,
    state: args.to,
    resolution: args.resolution ?? current.resolution,
    resolvedAt:
      args.to === 'RESOLVED' || args.to === 'CLOSED'
        ? args.at
        : current.resolvedAt,
  };
  escalationRegistry.set(next.id, next);
  return { ok: true, escalation: next };
}

export type ActivationEvaluation =
  | { allowed: true }
  | { allowed: false; reason: string; escalationTrigger: EscalationTrigger };

/**
 * Evaluate whether a proposed agent can be activated for a governed runtime.
 * This does not mutate lifecycle state; callers still use City Core transition()
 * after this guard passes.
 */
export function evaluateAgentActivation(args: {
  profile: AgentProfile;
  effectivePermissionIds: readonly string[];
  requiredPermissionIds: readonly string[];
  approvalByPermissionId?: Readonly<Record<string, ApprovalState | undefined>>;
  evidenceIds: readonly string[];
  runtimeVerified: boolean;
}): ActivationEvaluation {
  const {
    profile,
    effectivePermissionIds,
    requiredPermissionIds,
    approvalByPermissionId = {},
    evidenceIds,
    runtimeVerified,
  } = args;

  if (profile.state !== 'PROPOSED') {
    return {
      allowed: false,
      reason: `Agent must be PROPOSED before activation; current state is ${profile.state}.`,
      escalationTrigger: 'POLICY_CONFLICT',
    };
  }
  if (!runtimeVerified) {
    return {
      allowed: false,
      reason: 'Target runtime is not independently verified.',
      escalationTrigger: 'RUNTIME_UNAVAILABLE',
    };
  }
  if (evidenceIds.length === 0) {
    return {
      allowed: false,
      reason: 'Activation requires supporting evidence.',
      escalationTrigger: 'EVIDENCE_GAP',
    };
  }

  for (const permissionId of requiredPermissionIds) {
    if (!effectivePermissionIds.includes(permissionId)) {
      return {
        allowed: false,
        reason: `Missing required permission ${permissionId}.`,
        escalationTrigger: 'MISSING_PERMISSION',
      };
    }
    const permission = permissionRegistry.get(permissionId);
    if (!permission) {
      return {
        allowed: false,
        reason: `Unknown required permission ${permissionId}.`,
        escalationTrigger: 'MISSING_PERMISSION',
      };
    }
    if (
      permission.sensitive &&
      approvalByPermissionId[permissionId] !== 'APPROVED'
    ) {
      return {
        allowed: false,
        reason: `Sensitive permission ${permissionId} lacks approved human decision.`,
        escalationTrigger: 'MISSING_APPROVAL',
      };
    }
  }

  return { allowed: true };
}
