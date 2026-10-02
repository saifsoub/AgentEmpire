import { describe, it, expect } from "vitest";
import {
  makeId,
  canTransitionAgent,
  assertAgentTransition,
  canTransitionInstitution,
  isAgentOperable,
  isInstitutionOperable,
  permissionSatisfies,
  canDelegate,
  requiresCouncilApproval,
  canRecordCompletion,
  cityCoreBuildSequence,
} from "@/lib/city-core";
import { permissionUpgradeRequestSchema, evidenceRecordSchema } from "@/lib/validators";

describe("City Core — identifiers", () => {
  it("slugifies and prefixes ids", () => {
    expect(makeId("agent", "Dima Reyes")).toBe("agent_dima-reyes");
    expect(makeId("inst", "  S/ Banking!! ")).toBe("inst_s-banking");
  });
});

describe("City Core — agent lifecycle (SAG-53)", () => {
  it("allows forward and suspension transitions", () => {
    expect(canTransitionAgent("DRAFT", "PROVISIONED")).toBe(true);
    expect(canTransitionAgent("PROVISIONED", "ACTIVE")).toBe(true);
    expect(canTransitionAgent("ACTIVE", "SUSPENDED")).toBe(true);
    expect(canTransitionAgent("SUSPENDED", "ACTIVE")).toBe(true);
  });

  it("forbids skipping states and reviving the retired", () => {
    expect(canTransitionAgent("DRAFT", "ACTIVE")).toBe(false);
    expect(canTransitionAgent("RETIRED", "ACTIVE")).toBe(false);
  });

  it("asserts illegal transitions loudly", () => {
    expect(() => assertAgentTransition("RETIRED", "ACTIVE")).toThrow(/Illegal/);
    expect(() => assertAgentTransition("PROVISIONED", "ACTIVE")).not.toThrow();
  });

  it("only ACTIVE agents are operable", () => {
    expect(isAgentOperable("ACTIVE")).toBe(true);
    expect(isAgentOperable("SUSPENDED")).toBe(false);
  });
});

describe("City Core — institution lifecycle (SAG-53)", () => {
  it("charters before operating and can hibernate", () => {
    expect(canTransitionInstitution("PROPOSED", "CHARTERED")).toBe(true);
    expect(canTransitionInstitution("CHARTERED", "OPERATIONAL")).toBe(true);
    expect(canTransitionInstitution("OPERATIONAL", "DORMANT")).toBe(true);
    expect(canTransitionInstitution("DORMANT", "OPERATIONAL")).toBe(true);
  });

  it("cannot operate straight from proposed, nor revive after decommission", () => {
    expect(canTransitionInstitution("PROPOSED", "OPERATIONAL")).toBe(false);
    expect(canTransitionInstitution("DECOMMISSIONED", "OPERATIONAL")).toBe(false);
  });

  it("only OPERATIONAL institutions host work", () => {
    expect(isInstitutionOperable("OPERATIONAL")).toBe(true);
    expect(isInstitutionOperable("DORMANT")).toBe(false);
  });
});

describe("City Core — permission inheritance and delegation (SAG-53/57)", () => {
  it("higher tiers inherit lower-tier capability", () => {
    expect(permissionSatisfies("GOVERN", "OBSERVE")).toBe(true);
    expect(permissionSatisfies("APPROVE", "OPERATE")).toBe(true);
    expect(permissionSatisfies("OBSERVE", "OPERATE")).toBe(false);
  });

  it("delegation flows only at or below the grantor's tier", () => {
    expect(canDelegate("GOVERN", "APPROVE")).toBe(true);
    expect(canDelegate("OPERATE", "OBSERVE")).toBe(true);
    expect(canDelegate("OPERATE", "APPROVE")).toBe(false);
  });

  it("sensitive tiers route through the Council Chamber", () => {
    expect(requiresCouncilApproval("APPROVE")).toBe(true);
    expect(requiresCouncilApproval("GOVERN")).toBe(true);
    expect(requiresCouncilApproval("OPERATE")).toBe(false);
  });
});

describe("City Core — governance gate (SAG-57)", () => {
  const verified = [{ verified: true }];
  const unverified = [{ verified: false }];

  it("refuses completion without verified evidence", () => {
    const v = canRecordCompletion({ evidence: unverified, approvalGranted: true, sensitive: false });
    expect(v.allowed).toBe(false);
    expect(v.reason).toMatch(/evidence/i);
  });

  it("allows non-sensitive completion once evidence is verified", () => {
    expect(canRecordCompletion({ evidence: verified, approvalGranted: false, sensitive: false }).allowed).toBe(true);
  });

  it("requires approval for sensitive work even with evidence", () => {
    const v = canRecordCompletion({ evidence: verified, approvalGranted: false, sensitive: true });
    expect(v.allowed).toBe(false);
    expect(v.reason).toMatch(/approval/i);
    expect(canRecordCompletion({ evidence: verified, approvalGranted: true, sensitive: true }).allowed).toBe(true);
  });
});

describe("City Core — build sequence (SAG-54)", () => {
  it("is strictly ordered and only depends on earlier models", () => {
    const orders = cityCoreBuildSequence.map((s) => s.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    const seen = new Set<string>();
    for (const step of cityCoreBuildSequence) {
      for (const dep of step.dependsOn) expect(seen.has(dep)).toBe(true);
      seen.add(String(step.model));
    }
  });
});

describe("City Core — validators", () => {
  it("accepts a valid permission upgrade request", () => {
    expect(
      permissionUpgradeRequestSchema.safeParse({ agentId: "agent_dima", currentTier: "OPERATE", requestedTier: "APPROVE", justification: "Lead reviewer role" }).success,
    ).toBe(true);
  });

  it("rejects an upgrade request with an unknown tier", () => {
    expect(
      permissionUpgradeRequestSchema.safeParse({ agentId: "agent_dima", currentTier: "OPERATE", requestedTier: "ROOT", justification: "x" }).success,
    ).toBe(false);
  });

  it("defaults evidence to unverified with no linked flows", () => {
    const parsed = evidenceRecordSchema.parse({ kind: "commit", uri: "abc123" });
    expect(parsed.verified).toBe(false);
    expect(parsed.linkedFlowIds).toEqual([]);
  });
});
