import { describe, it, expect } from "vitest";
import {
  ONTOLOGY_KINDS,
  ONTOLOGY,
  isOntologyKind,
  LIFECYCLES,
  lifecycleStates,
  canTransition,
  transition,
  authorizeAction,
  permissionRegistry,
  roleRegistry,
  institutionRegistry,
  workflowRegistry,
  toCanonicalInstitution,
  roleId,
  CITY_REPOSITORY,
  inspectCityCore,
  cityCoreHealthy,
  CITY_ACCEPTANCE_CRITERIA,
  type Role,
} from "@/lib/city-core";
import { cityInstitutions } from "@/lib/city-institutions";

describe("City Core — ontology", () => {
  it("documents every ontology kind", () => {
    for (const kind of ONTOLOGY_KINDS) {
      expect(ONTOLOGY[kind]).toBeTruthy();
    }
  });

  it("recognises canonical kinds and rejects others", () => {
    expect(isOntologyKind("institution")).toBe(true);
    expect(isOntologyKind("treasury-account")).toBe(true);
    expect(isOntologyKind("spaceship")).toBe(false);
  });

  it("maps every repository folder to a known ontology kind", () => {
    for (const kind of Object.values(CITY_REPOSITORY)) {
      expect(isOntologyKind(kind)).toBe(true);
    }
  });
});

describe("City Core — lifecycle engine", () => {
  it("starts every lifecycle in a declared state", () => {
    for (const [name, lc] of Object.entries(LIFECYCLES)) {
      expect(lifecycleStates(name as keyof typeof LIFECYCLES)).toContain(lc.initial);
    }
  });

  it("allows declared transitions and rejects undeclared ones", () => {
    expect(canTransition("institution", "PLANNED", "READY")).toBe(true);
    expect(canTransition("institution", "ACTIVE", "PLANNED")).toBe(false);
    expect(canTransition("agent", "RETIRED", "ACTIVE")).toBe(false);
  });

  it("emits an audit record on a legal transition", () => {
    const res = transition({
      lifecycle: "agent",
      entityId: "agent_1",
      from: "PROPOSED",
      to: "ACTIVE",
      actor: "manager",
      at: "2026-06-15T00:00:00.000Z",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.state).toBe("ACTIVE");
      expect(res.audit.kind).toBe("audit-record");
      expect(res.audit.from).toBe("PROPOSED");
      expect(res.audit.to).toBe("ACTIVE");
    }
  });

  it("refuses an illegal transition with a reason", () => {
    const res = transition({
      lifecycle: "agent",
      entityId: "agent_1",
      from: "RETIRED",
      to: "ACTIVE",
      actor: "manager",
      at: "2026-06-15T00:00:00.000Z",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/illegal/i);
  });
});

describe("City Core — governance engine", () => {
  const qa: Role = { id: "role_qa", kind: "role", name: "QA", permissionIds: ["perm_run_workflow", "perm_spend"] };

  it("denies an action the role does not hold", () => {
    const stranger: Role = { id: "role_x", kind: "role", name: "X", permissionIds: [] };
    const res = authorizeAction({ role: stranger, permission: permissionRegistry.get("perm_spend")! });
    expect(res.allowed).toBe(false);
  });

  it("requires human approval for a sensitive action", () => {
    const pending = authorizeAction({ role: qa, permission: permissionRegistry.get("perm_spend")!, approval: "PENDING" });
    expect(pending.allowed).toBe(false);
    const approved = authorizeAction({ role: qa, permission: permissionRegistry.get("perm_spend")!, approval: "APPROVED" });
    expect(approved.allowed).toBe(true);
  });

  it("allows a non-sensitive action without approval", () => {
    const res = authorizeAction({ role: qa, permission: permissionRegistry.get("perm_run_workflow")! });
    expect(res.allowed).toBe(true);
  });

  it("requires evidence to complete work", () => {
    const noEvidence = authorizeAction({
      role: qa,
      permission: permissionRegistry.get("perm_run_workflow")!,
      completesWork: true,
      evidenceIds: [],
    });
    expect(noEvidence.allowed).toBe(false);
    const withEvidence = authorizeAction({
      role: qa,
      permission: permissionRegistry.get("perm_run_workflow")!,
      completesWork: true,
      evidenceIds: ["evidence_1"],
    });
    expect(withEvidence.allowed).toBe(true);
  });
});

describe("City Core — registries", () => {
  it("maps every city institution into the institution registry", () => {
    expect(institutionRegistry.size).toBe(cityInstitutions.length);
    for (const institution of cityInstitutions) {
      expect(institutionRegistry.has(institution.id)).toBe(true);
    }
  });

  it("derives stable role ids", () => {
    expect(roleId("@Sally")).toBe(roleId("@Sally"));
    expect(roleId("QA Agent")).toBe("role_qa-agent");
  });

  it("registers a role for every authority referenced by institutions", () => {
    for (const institution of cityInstitutions) {
      for (const label of institution.relatedAgentRoles) {
        expect(roleRegistry.has(roleId(label))).toBe(true);
      }
    }
  });

  it("maps a bespoke institution onto the canonical schema", () => {
    const ready = toCanonicalInstitution(cityInstitutions.find((i) => i.status === "ready")!);
    expect(ready.kind).toBe("institution");
    expect(ready.state).toBe("ACTIVE");
  });

  it("keeps every workflow referencing at least one permission", () => {
    for (const wf of workflowRegistry.list()) {
      expect(wf.requiredPermissionIds.length).toBeGreaterThan(0);
      for (const pid of wf.requiredPermissionIds) {
        expect(permissionRegistry.has(pid)).toBe(true);
      }
    }
  });
});

describe("City Core — acceptance criteria self-inspection", () => {
  it("reports one result per global acceptance criterion", () => {
    const results = inspectCityCore();
    expect(results.length).toBe(CITY_ACCEPTANCE_CRITERIA.length);
  });

  it("passes every global acceptance criterion", () => {
    const results = inspectCityCore();
    const failing = results.filter((r) => !r.passed);
    expect(failing, JSON.stringify(failing, null, 2)).toEqual([]);
    expect(cityCoreHealthy()).toBe(true);
  });
});
