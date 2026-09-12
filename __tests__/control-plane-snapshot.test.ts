import { describe, expect, it } from "vitest";
import type { DemoDb } from "@/lib/types";
import { buildControlPlaneSnapshot } from "@/lib/control-plane/snapshot";

const NOW = "2026-08-31T10:00:00.000Z";

function db(overrides: Partial<DemoDb> = {}): DemoDb {
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

describe("buildControlPlaneSnapshot", () => {
  it("derives healthy counts from recent repository-owned data without scores", () => {
    const snapshot = buildControlPlaneSnapshot(db({
      agents: [{
        id: "agent-1", name: "Operator", description: "Ops", instructions: "",
        selectedTools: [], preferredProviders: [], approvalPolicy: [], enabled: true,
        heartbeatAt: "2026-08-31T09:58:00.000Z", createdAt: NOW, updatedAt: NOW,
      }],
      agentRuns: [{
        id: "run-1", agentId: "agent-1", objective: "Inspect", provider: "native",
        capability: "agent.execute", status: "executed", message: "ok", createdAt: "2026-08-31T09:57:00.000Z",
      }],
      tasks: [{
        id: "task-1", title: "Review", category: "Ops", priority: "HIGH", status: "IN_PROGRESS",
        linkedEntityType: "project", linkedEntityId: "p-1", dueAt: "2026-09-01T10:00:00.000Z",
        createdAt: NOW, updatedAt: "2026-08-31T09:55:00.000Z",
      }],
    }), { now: NOW, runtimeConnected: true });

    expect(snapshot.metrics).toEqual({ enabledAgents: 1, pendingApprovals: 0, failedRuns: 0, openTasks: 1 });
    expect(snapshot.overallState).toBe("healthy");
    expect(snapshot).not.toHaveProperty("score");
  });

  it("surfaces stale heartbeats distinctly from disabled agents", () => {
    const snapshot = buildControlPlaneSnapshot(db({
      agents: [
        {
          id: "stale", name: "Stale", description: "", instructions: "", selectedTools: [], preferredProviders: [], approvalPolicy: [], enabled: true,
          heartbeatAt: "2026-08-31T08:00:00.000Z", createdAt: NOW, updatedAt: "2026-08-31T08:00:00.000Z",
        },
        {
          id: "disabled", name: "Disabled", description: "", instructions: "", selectedTools: [], preferredProviders: [], approvalPolicy: [], enabled: false,
          createdAt: NOW, updatedAt: NOW,
        },
      ],
    }), { now: NOW, runtimeConnected: true });

    expect(snapshot.agents.map((agent) => [agent.id, agent.state])).toEqual([
      ["stale", "stale"],
      ["disabled", "disabled"],
    ]);
    expect(snapshot.exceptions.some((item) => item.kind === "stale-agent" && item.entityId === "stale")).toBe(true);
  });

  it("makes failed runs and blocked work error-visible ahead of informational gaps", () => {
    const snapshot = buildControlPlaneSnapshot(db({
      agentRuns: [{
        id: "run-fail", agentId: "agent-1", objective: "Deploy", provider: "native",
        capability: "agent.execute", status: "failed", message: "timeout", createdAt: "2026-08-31T09:59:00.000Z",
      }],
      tasks: [{
        id: "task-blocked", title: "Cutover", category: "Ops", priority: "CRITICAL", status: "BLOCKED",
        linkedEntityType: "project", linkedEntityId: "p-1", dueAt: "2026-08-31T09:00:00.000Z",
        createdAt: NOW, updatedAt: "2026-08-31T09:59:00.000Z",
      }],
    }), { now: NOW, runtimeConnected: false });

    expect(snapshot.overallState).toBe("error");
    expect(snapshot.exceptions.slice(0, 2).map((item) => item.kind)).toEqual(["failed-run", "blocked-task"]);
    expect(snapshot.sources.find((source) => source.id === "runtime")?.state).toBe("unavailable");
  });

  it("uses explicit unavailable states when no operational evidence exists", () => {
    const snapshot = buildControlPlaneSnapshot(db(), { now: NOW, runtimeConnected: false });

    expect(snapshot.overallState).toBe("unavailable");
    expect(snapshot.sources.map((source) => source.state)).toEqual([
      "unavailable", "unavailable", "unavailable", "unavailable", "unavailable",
    ]);
    expect(snapshot.metrics).toEqual({ enabledAgents: 0, pendingApprovals: 0, failedRuns: 0, openTasks: 0 });
  });

  it("surfaces actual connector and manual ToolStatus receipts as attention", () => {
    const snapshot = buildControlPlaneSnapshot(db({
      agentRuns: [
        {
          id: "run-missing", agentId: "agent-1", objective: "Publish", provider: "composio",
          capability: "content.publish", status: "missing_connector", message: "Connector missing", createdAt: "2026-08-31T09:59:00.000Z",
        },
        {
          id: "run-manual", agentId: "agent-2", objective: "Send", provider: "manual",
          capability: "message.send", status: "queued_manual", message: "Queued for follow-up", createdAt: "2026-08-31T09:58:00.000Z",
        },
      ],
    }), { now: NOW, runtimeConnected: false });

    expect(snapshot.sources.find((source) => source.id === "runs")?.state).toBe("warning");
    expect(snapshot.exceptions.filter((item) => item.kind === "attention-run")).toHaveLength(2);
    expect(snapshot.overallState).toBe("warning");
  });

  it("lets a newer successful retry supersede an older failure for the same operation", () => {
    const snapshot = buildControlPlaneSnapshot(db({
      agentRuns: [
        {
          id: "run-success", agentId: "agent-1", objective: "Inspect", provider: "native",
          capability: "agent.execute", status: "executed", message: "Recovered", createdAt: "2026-08-31T09:59:00.000Z",
        },
        {
          id: "run-fail", agentId: "agent-1", objective: "Inspect", provider: "native",
          capability: "agent.execute", status: "failed", message: "Timeout", createdAt: "2026-08-31T09:50:00.000Z",
        },
      ],
    }), { now: NOW, runtimeConnected: true });

    expect(snapshot.metrics.failedRuns).toBe(0);
    expect(snapshot.exceptions.some((item) => item.entityId === "run-fail")).toBe(false);
    expect(snapshot.sources.find((source) => source.id === "runs")?.state).toBe("healthy");
  });

  it("does not trust stored heartbeat fields while the governed runtime is disconnected", () => {
    const snapshot = buildControlPlaneSnapshot(db({
      agents: [{
        id: "agent-1", name: "Operator", description: "Ops", instructions: "",
        selectedTools: [], preferredProviders: [], approvalPolicy: [], enabled: true,
        heartbeatAt: "2026-08-31T09:59:00.000Z", createdAt: NOW, updatedAt: NOW,
      }],
    }), { now: NOW, runtimeConnected: false });

    expect(snapshot.agents[0]?.state).toBe("unavailable");
    expect(snapshot.agents[0]?.observedAt).toBeNull();
    expect(snapshot.sources.find((source) => source.id === "registry")?.state).toBe("unavailable");
  });

  it("turns repository read failures into explicit critical source evidence", () => {
    const snapshot = buildControlPlaneSnapshot(db(), {
      now: NOW,
      runtimeConnected: false,
      sourceErrors: { registry: "Repository store could not be read." },
    });

    expect(snapshot.sources.find((source) => source.id === "registry")?.state).toBe("error");
    expect(snapshot.exceptions.some((item) => item.kind === "source-error" && item.entityId === "registry")).toBe(true);
    expect(snapshot.overallState).toBe("error");
  });
});
