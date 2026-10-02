import { describe, expect, it } from 'vitest';
import { institutionRegistry } from '@/lib/city-core';
import {
  agentRegistry,
  skillProfileRegistry,
  registerAgentProfile,
  registerSkillProfile,
  type AgentProfile,
  type SkillProfile,
} from '@/lib/city-agent-profiles';

function firstInstitution() {
  const institution = institutionRegistry.list()[0];
  if (!institution) throw new Error('City Core must seed at least one institution.');
  return institution;
}

describe('City Core — AgentProfile', () => {
  it('registers an agent with explicit institution and district relationships', () => {
    const institution = firstInstitution();
    const profile: AgentProfile = {
      id: 'agent_profile_relationship_test',
      kind: 'agent',
      name: 'Relationship Test Agent',
      state: 'ACTIVE',
      district: institution.district,
      institutionId: institution.id,
      roleIds: institution.roleIds.slice(0, 1),
      passportId: 'S-PASS-TEST-001',
      source: 'city-agent-profiles.test',
    };

    const result = registerAgentProfile(profile);
    expect(result.ok).toBe(true);
    expect(agentRegistry.get(profile.id)?.institutionId).toBe(institution.id);
    expect(agentRegistry.get(profile.id)?.district).toBe(institution.district);
  });

  it('rejects an unknown institution instead of creating an orphaned relationship', () => {
    const result = registerAgentProfile({
      id: 'agent_profile_unknown_institution',
      kind: 'agent',
      name: 'Unknown Institution Agent',
      state: 'PROPOSED',
      district: 'Unknown District',
      institutionId: 'institution_does_not_exist',
      roleIds: [],
    });

    expect(result.ok).toBe(false);
    expect(agentRegistry.has('agent_profile_unknown_institution')).toBe(false);
  });

  it('rejects a district that conflicts with the linked institution', () => {
    const institution = firstInstitution();
    const result = registerAgentProfile({
      id: 'agent_profile_wrong_district',
      kind: 'agent',
      name: 'Wrong District Agent',
      state: 'PROPOSED',
      district: `${institution.district}-wrong`,
      institutionId: institution.id,
      roleIds: [],
    });

    expect(result.ok).toBe(false);
    expect(agentRegistry.has('agent_profile_wrong_district')).toBe(false);
  });
});

describe('City Core — SkillProfile', () => {
  it('links evidence-bearing skills to a registered agent without granting authority', () => {
    const institution = firstInstitution();
    const agent: AgentProfile = {
      id: 'agent_skill_profile_test',
      kind: 'agent',
      name: 'Skill Profile Test Agent',
      state: 'ACTIVE',
      district: institution.district,
      institutionId: institution.id,
      roleIds: [],
      skillProfileId: 'skill_profile_test',
    };
    expect(registerAgentProfile(agent).ok).toBe(true);

    const skills: SkillProfile = {
      id: 'skill_profile_test',
      kind: 'skill',
      name: 'Skill Profile Test',
      agentId: agent.id,
      skills: [
        {
          skillId: 'skill_research',
          name: 'Research',
          proficiency: 'ADVANCED',
          evidenceIds: ['evidence_research_1'],
        },
      ],
    };

    const result = registerSkillProfile(skills);
    expect(result.ok).toBe(true);
    expect(skillProfileRegistry.get(skills.id)?.agentId).toBe(agent.id);
    expect(skillProfileRegistry.get(skills.id)?.skills[0].evidenceIds).toEqual(['evidence_research_1']);
    expect(agentRegistry.get(agent.id)?.roleIds).toEqual([]);
  });

  it('rejects a skill profile for an unregistered agent', () => {
    const result = registerSkillProfile({
      id: 'skill_profile_orphan',
      kind: 'skill',
      name: 'Orphan Skill Profile',
      agentId: 'agent_missing',
      skills: [],
    });

    expect(result.ok).toBe(false);
    expect(skillProfileRegistry.has('skill_profile_orphan')).toBe(false);
  });
});
