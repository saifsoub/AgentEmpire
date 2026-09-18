import { describe, expect, it } from 'vitest';
import {
  activateDelegation,
  canUseDelegation,
  delegationRegistry,
  evaluateAgentActivation,
  openEscalation,
  resolveEffectivePermissions,
  transitionEscalation,
  type DelegationRecord,
  type RoleDefinition,
} from '@/lib/city-governance-flows';
import { institutionRegistry } from '@/lib/city-core';
import { type AgentProfile } from '@/lib/city-agent-profiles';

describe('City governance — role inheritance', () => {
  it('resolves direct and inherited permissions', () => {
    const roles: RoleDefinition[] = [
      { id: 'role_base', kind: 'role', name: 'Base', permissionIds: ['perm_run_workflow'] },
      {
        id: 'role_child',
        kind: 'role',
        name: 'Child',
        permissionIds: ['perm_publish'],
        inheritsRoleIds: ['role_base'],
      },
    ];

    expect(resolveEffectivePermissions('role_child', roles)).toEqual({
      ok: true,
      permissionIds: ['perm_publish', 'perm_run_workflow'],
    });
  });

  it('fails closed on an inheritance cycle', () => {
    const roles: RoleDefinition[] = [
      {
        id: 'role_a',
        kind: 'role',
        name: 'A',
        permissionIds: [],
        inheritsRoleIds: ['role_b'],
      },
      {
        id: 'role_b',
        kind: 'role',
        name: 'B',
        permissionIds: [],
        inheritsRoleIds: ['role_a'],
      },
    ];

    const result = resolveEffectivePermissions('role_a', roles);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/cycle/i);
  });

  it('fails closed on a missing parent role', () => {
    const result = resolveEffectivePermissions('role_child', [
      {
        id: 'role_child',
        kind: 'role',
        name: 'Child',
        permissionIds: [],
        inheritsRoleIds: ['role_missing'],
      },
    ]);
    expect(result.ok).toBe(false);
  });
});

describe('City governance — delegation', () => {
  const baseDelegation = (id: string): DelegationRecord => ({
    id,
    delegatorId: 'agent_owner',
    delegateeId: 'agent_worker',
    delegatorRoleId: 'role_owner',
    delegateeRoleId: 'role_worker',
    permissionIds: ['perm_run_workflow'],
    scope: 'institution:s-university',
    startsAt: '2026-09-12T00:00:00.000Z',
    expiresAt: '2026-09-13T00:00:00.000Z',
    state: 'PENDING',
    evidenceIds: ['evidence_delegate_1'],
  });

  it('activates a bounded delegation when the delegator holds the authority', () => {
    const result = activateDelegation({
      delegation: baseDelegation('delegation_ok'),
      delegatorEffectivePermissionIds: ['perm_run_workflow'],
    });
    expect(result.ok).toBe(true);
    expect(delegationRegistry.get('delegation_ok')?.state).toBe('ACTIVE');
    if (result.ok) {
      expect(
        canUseDelegation({
          delegation: result.delegation,
          permissionId: 'perm_run_workflow',
          scope: 'institution:s-university',
          at: '2026-09-12T12:00:00.000Z',
        }),
      ).toBe(true);
      expect(
        canUseDelegation({
          delegation: result.delegation,
          permissionId: 'perm_run_workflow',
          scope: 'institution:s-treasury',
          at: '2026-09-12T12:00:00.000Z',
        }),
      ).toBe(false);
      expect(
        canUseDelegation({
          delegation: result.delegation,
          permissionId: 'perm_run_workflow',
          scope: 'institution:s-university',
          at: '2026-09-12T12:00:00.000Z',
          forRedelegation: true,
        }),
      ).toBe(false);
    }
  });

  it('rejects delegation of authority the delegator does not hold', () => {
    const result = activateDelegation({
      delegation: baseDelegation('delegation_missing_authority'),
      delegatorEffectivePermissionIds: [],
    });
    expect(result.ok).toBe(false);
  });

  it('requires human approval when a sensitive permission is delegated', () => {
    const delegation: DelegationRecord = {
      ...baseDelegation('delegation_sensitive'),
      permissionIds: ['perm_publish'],
      approval: 'PENDING',
    };
    const denied = activateDelegation({
      delegation,
      delegatorEffectivePermissionIds: ['perm_publish'],
    });
    expect(denied.ok).toBe(false);

    const approved = activateDelegation({
      delegation: { ...delegation, id: 'delegation_sensitive_approved', approval: 'APPROVED' },
      delegatorEffectivePermissionIds: ['perm_publish'],
    });
    expect(approved.ok).toBe(true);
  });
});

describe('City governance — escalation', () => {
  it('records and advances a bounded escalation with resolution evidence', () => {
    const escalation = openEscalation({
      id: 'escalation_runtime_test',
      subjectId: 'agent_worker',
      trigger: 'RUNTIME_UNAVAILABLE',
      requestedAction: 'execute workflow',
      currentAuthority: 'perm_run_workflow',
      missingAuthorityOrEvidence: 'verified runtime',
      risk: 'execution claim would be false without runtime proof',
      owner: 'operations',
      createdAt: '2026-09-12T00:00:00.000Z',
      evidenceIds: ['evidence_runtime_probe'],
    });
    expect(escalation.state).toBe('OPEN');

    expect(
      transitionEscalation({
        id: escalation.id,
        to: 'ACKNOWLEDGED',
        at: '2026-09-12T00:05:00.000Z',
      }).ok,
    ).toBe(true);

    const resolved = transitionEscalation({
      id: escalation.id,
      to: 'RESOLVED',
      at: '2026-09-12T00:10:00.000Z',
      resolution: 'runtime independently verified',
    });
    expect(resolved.ok).toBe(true);
  });

  it('fails closed on an illegal escalation transition', () => {
    openEscalation({
      id: 'escalation_illegal_test',
      subjectId: 'agent_worker',
      trigger: 'POLICY_CONFLICT',
      requestedAction: 'bypass policy',
      currentAuthority: 'none',
      missingAuthorityOrEvidence: 'approval',
      risk: 'policy bypass',
      owner: 'governance',
      createdAt: '2026-09-12T00:00:00.000Z',
      evidenceIds: ['evidence_policy'],
    });
    expect(
      transitionEscalation({
        id: 'escalation_illegal_test',
        to: 'RESOLVED',
        at: '2026-09-12T00:01:00.000Z',
        resolution: 'invalid direct transition attempt',
      }).ok,
    ).toBe(false);
  });
});

describe('City governance — activation guard', () => {
  function proposedAgent(): AgentProfile {
    const institution = institutionRegistry.list()[0];
    if (!institution) throw new Error('Expected a seeded institution.');
    return {
      id: 'agent_activation_test',
      kind: 'agent',
      name: 'Activation Test Agent',
      state: 'PROPOSED',
      district: institution.district,
      institutionId: institution.id,
      roleIds: ['role_test'],
    };
  }

  it('blocks an unverified runtime', () => {
    const result = evaluateAgentActivation({
      profile: proposedAgent(),
      effectivePermissionIds: ['perm_run_workflow'],
      requiredPermissionIds: ['perm_run_workflow'],
      evidenceIds: ['evidence_activation'],
      runtimeVerified: false,
    });
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.escalationTrigger).toBe('RUNTIME_UNAVAILABLE');
  });

  it('requires approved human decision for sensitive activation authority', () => {
    const denied = evaluateAgentActivation({
      profile: proposedAgent(),
      effectivePermissionIds: ['perm_publish'],
      requiredPermissionIds: ['perm_publish'],
      approvalByPermissionId: { perm_publish: 'PENDING' },
      evidenceIds: ['evidence_activation'],
      runtimeVerified: true,
    });
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) expect(denied.escalationTrigger).toBe('MISSING_APPROVAL');

    const approved = evaluateAgentActivation({
      profile: proposedAgent(),
      effectivePermissionIds: ['perm_publish'],
      requiredPermissionIds: ['perm_publish'],
      approvalByPermissionId: { perm_publish: 'APPROVED' },
      evidenceIds: ['evidence_activation'],
      runtimeVerified: true,
    });
    expect(approved).toEqual({ allowed: true });
  });
});
