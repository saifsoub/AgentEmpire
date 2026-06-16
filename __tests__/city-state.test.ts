import { describe, expect, it } from "vitest";
import { buildCityState } from "@/lib/city-state";
import type { DemoDb } from "@/lib/types";

function createDb(overrides: Partial<DemoDb> = {}): DemoDb {
  return {
    opportunities: [],
    offers: [],
    contentItems: [],
    assets: [],
    decisions: [],
    briefings: [],
    lifestyle: [],
    tasks: [],
    leads: [],
    agents: [],
    agentRuns: [],
    approvals: [],
    ...overrides,
  };
}

describe("buildCityState", () => {
  it("activates Arrivals Hall for new leads", () => {
    const state = buildCityState(createDb({
      leads: [{ id: "lead_1", name: "A", email: "a@example.com", message: "", sourceType: "offer", sourceId: "offer_1", sourceName: "Offer", status: "NEW", createdAt: "2026-01-01" }],
    }));

    expect(state.activeDistrictIds).toContain("arrivals-hall");
    expect(state.districts.find((district) => district.id === "arrivals-hall")?.status).toBe("active");
  });

  it("activates exchange, broadcast tower, and council chamber from live operating state", () => {
    const state = buildCityState(createDb({
      opportunities: [{ id: "opp_1", title: "Deal", description: "", type: "", source: "", status: "SELLING", expectedRevenue: 1, confidenceScore: 0, fitScore: 0, urgencyScore: 0, prestigeScore: 0, effortScore: 0, reusabilityScore: 0, speedToLaunchScore: 0, compoundingScore: 0, totalScore: 0, nextAction: "Close", dueDate: "", createdAt: "", updatedAt: "" }],
      contentItems: [{ id: "content_1", pillar: "", topic: "", angle: "", hook: "Hook", body: "", platform: "", status: "PUBLISHED", scheduledFor: "", publishedAt: "", views: 0, engagements: 0, clicks: 0, leads: 0, createdAt: "", updatedAt: "" }],
      approvals: [{ id: "approval_1", source: "agent", action: "publish", status: "PENDING", createdAt: "", updatedAt: "" }],
    }));

    expect(state.activeDistrictIds).toEqual(expect.arrayContaining(["exchange", "broadcast-tower", "council-chamber"]));
  });

  it("routes agent movement through governor, approval, and archive when work produces evidence", () => {
    const state = buildCityState(createDb({
      agents: [{ id: "agent_1", name: "Agent", description: "Ops", instructions: "", selectedTools: [], preferredProviders: [], approvalPolicy: [], enabled: true, createdAt: "", updatedAt: "" }],
      tasks: [{ id: "task_1", title: "Ship content", category: "Brand", priority: "HIGH", status: "WAITING_APPROVAL", linkedEntityType: "content", linkedEntityId: "content_1", dueAt: "", completedAt: "2026-01-02", createdAt: "", updatedAt: "" }],
      contentItems: [{ id: "content_1", pillar: "", topic: "", angle: "", hook: "Hook", body: "", platform: "", status: "SCHEDULED", scheduledFor: "", publishedAt: "", views: 0, engagements: 0, clicks: 0, leads: 0, createdAt: "", updatedAt: "" }],
      agentRuns: [{ id: "run_1", agentId: "agent_1", objective: "Ship", provider: "native", capability: "content", status: "executed", message: "ok", createdAt: "" }],
      approvals: [{ id: "approval_1", source: "agent", action: "publish", status: "APPROVED", createdAt: "", updatedAt: "" }],
    }), 1);

    expect(state.presences[0]?.steps.map((step) => `${step.from}->${step.to}`)).toEqual([
      "agency->governors-office",
      "governors-office->broadcast-tower",
      "broadcast-tower->council-chamber",
      "council-chamber->archive",
    ]);
  });

  it("updates work yards and archive from active and completed work", () => {
    const state = buildCityState(createDb({
      tasks: [
        { id: "task_1", title: "Run", category: "Ops", priority: "MEDIUM", status: "IN_PROGRESS", linkedEntityType: "task", linkedEntityId: "1", dueAt: "", createdAt: "", updatedAt: "" },
        { id: "task_2", title: "Done", category: "Ops", priority: "MEDIUM", status: "DONE", linkedEntityType: "task", linkedEntityId: "2", dueAt: "", completedAt: "2026-01-02", createdAt: "", updatedAt: "" },
      ],
    }));

    expect(state.districts.find((district) => district.id === "work-yards")?.status).toBe("active");
    expect(state.districts.find((district) => district.id === "archive")?.status).toBe("active");
  });
});
