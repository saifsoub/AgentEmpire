// Shared City Core profiles for agents and their trainable capabilities.
//
// This module deliberately contains only cross-institution primitives and
// relationship validation. Institution-specific admission, treasury,
// curriculum, publishing, or other policy belongs in the relevant institution.

import {
  type CanonicalEntity,
  Registry,
  institutionRegistry,
  lifecycleStates,
} from '@/lib/city-core';

export const SKILL_PROFICIENCIES = [
  'FOUNDATIONAL',
  'WORKING',
  'ADVANCED',
  'EXPERT',
] as const;

export type SkillProficiency = (typeof SKILL_PROFICIENCIES)[number];

export type SkillRecord = {
  skillId: string;
  name: string;
  proficiency: SkillProficiency;
  evidenceIds: string[];
};

/**
 * Canonical agent identity inside S/ City.
 *
 * `district` is explicit so an agent can be placed in the City even when it is
 * not yet assigned to an institution. When `institutionId` is present,
 * registration verifies that the institution exists and that its district
 * matches the profile.
 */
export type AgentProfile = CanonicalEntity & {
  kind: 'agent';
  state: string;
  district: string;
  institutionId?: string;
  roleIds: string[];
  skillProfileId?: string;
  passportId?: string;
};

/**
 * Evidence-bearing capability profile for one canonical agent.
 * A skill entry records proficiency separately from evidence; callers must not
 * infer certification, authority, or permission from proficiency alone.
 */
export type SkillProfile = CanonicalEntity & {
  kind: 'skill';
  agentId: string;
  skills: SkillRecord[];
};

export type RegistrationResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

export const agentRegistry = new Registry<AgentProfile>('agent');
export const skillProfileRegistry = new Registry<SkillProfile>('skill');

export function registerAgentProfile(profile: AgentProfile): RegistrationResult<AgentProfile> {
  if (!lifecycleStates('agent').includes(profile.state)) {
    return { ok: false, reason: `Unknown agent lifecycle state: ${profile.state}.` };
  }

  if (profile.institutionId) {
    const institution = institutionRegistry.get(profile.institutionId);
    if (!institution) {
      return { ok: false, reason: `Unknown institution: ${profile.institutionId}.` };
    }
    if (institution.district !== profile.district) {
      return {
        ok: false,
        reason: `District mismatch: agent is in ${profile.district} but institution is in ${institution.district}.`,
      };
    }
  }

  return { ok: true, value: agentRegistry.register(profile) };
}

export function registerSkillProfile(profile: SkillProfile): RegistrationResult<SkillProfile> {
  const agent = agentRegistry.get(profile.agentId);
  if (!agent) {
    return { ok: false, reason: `Unknown agent: ${profile.agentId}.` };
  }

  if (agent.skillProfileId && agent.skillProfileId !== profile.id) {
    return {
      ok: false,
      reason: `Agent ${profile.agentId} is linked to skill profile ${agent.skillProfileId}, not ${profile.id}.`,
    };
  }

  const invalidProficiency = profile.skills.find(
    (skill) => !SKILL_PROFICIENCIES.includes(skill.proficiency),
  );
  if (invalidProficiency) {
    return {
      ok: false,
      reason: `Unknown proficiency for skill ${invalidProficiency.skillId}: ${invalidProficiency.proficiency}.`,
    };
  }

  return { ok: true, value: skillProfileRegistry.register(profile) };
}
