import type { AgentRunLog, ApprovalItem, DemoDb, StoredAgent, Task } from "@/lib/types";

export type ControlState = "healthy" | "warning" | "error" | "stale" | "unavailable";
export type AgentControlState = "healthy" | "stale" | "unavailable" | "disabled";

export type ControlSource = {
  id: "registry" | "runs" | "approvals" | "tasks" | "runtime";
  label: string;
  state: ControlState;
  observedAt: string | null;
  detail: string;
};

export type ControlException = {
  id: string;
  kind: "failed-run" | "attention-run" | "blocked-task" | "pending-approval" | "overdue-task" | "stale-agent" | "source-error" | "unavailable-source";
  severity: "critical" | "attention" | "information";
  title: string;
  detail: string;
  href: string;
  observedAt: string | null;
  entityId?: string;
};

export type ControlAgent = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  state: AgentControlState;
  observedAt: string | null;
  tools: number;
};

export type ControlPlaneSnapshot = {
  snapshotAt: string;
  overallState: "healthy" | "warning" | "error" | "unavailable";
  metrics: {
    enabledAgents: number;
    pendingApprovals: number;
    failedRuns: number;
    openTasks: number;
  };
  sources: ControlSource[];
  exceptions: ControlException[];
  agents: ControlAgent[];
  recentRuns: NonNullable<DemoDb["agentRuns"]>;
  pendingApprovals: ApprovalItem[];
  activeTasks: Task[];
};

type SnapshotOptions = {
  now?: string;
  runtimeConnected?: boolean;
  sourceErrors?: Partial<Record<ControlSource["id"], string>>;
};

const AGENT_STALE_AFTER_MS = 15 * 60 * 1000;
const ACTIVITY_STALE_AFTER_MS = 60 * 60 * 1000;

function timestamp(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mostRecent(values: Array<string | undefined>): string | null {
  const valid = values
    .map((value) => ({ value, time: timestamp(value) }))
    .filter((item): item is { value: string; time: number } => item.value !== undefined && item.time !== null)
    .sort((a, b) => b.time - a.time);
  return valid[0]?.value ?? null;
}

function isStale(value: string | null, nowMs: number, thresholdMs: number): boolean {
  const observed = value ? timestamp(value) : null;
  return observed !== null && nowMs - observed > thresholdMs;
}

function agentState(agent: StoredAgent, nowMs: number, runtimeConnected: boolean): AgentControlState {
  if (!agent.enabled) return "disabled";
  // Stored agent records are operator-editable in the current application.
  // Treat their heartbeat fields as trusted only after the governed runtime is connected.
  if (!runtimeConnected) return "unavailable";
  if (!agent.heartbeatAt) return "unavailable";
  return isStale(agent.heartbeatAt, nowMs, AGENT_STALE_AFTER_MS) ? "stale" : "healthy";
}

function currentOperationRuns(runs: AgentRunLog[]): AgentRunLog[] {
  const byOperation = new Map<string, AgentRunLog>();
  for (const run of [...runs].sort((a, b) => (timestamp(b.createdAt) ?? 0) - (timestamp(a.createdAt) ?? 0))) {
    const objective = run.objective.trim().toLowerCase().replace(/\s+/g, " ");
    const key = `${run.agentId}:${run.capability}:${objective}`;
    if (!byOperation.has(key)) byOperation.set(key, run);
  }
  return [...byOperation.values()];
}

function source(
  id: ControlSource["id"],
  label: string,
  observedAt: string | null,
  state: ControlSource["state"],
  detail: string,
  errors: SnapshotOptions["sourceErrors"],
): ControlSource {
  if (errors?.[id]) return { id, label, observedAt, state: "error", detail: errors[id]! };
  return { id, label, observedAt, state, detail };
}

export function buildControlPlaneSnapshot(input: DemoDb, options: SnapshotOptions = {}): ControlPlaneSnapshot {
  const snapshotAt = options.now ?? new Date().toISOString();
  const nowMs = timestamp(snapshotAt) ?? Date.now();
  const agents = input.agents ?? [];
  const runs = input.agentRuns ?? [];
  const operationRuns = currentOperationRuns(runs);
  const approvals = input.approvals ?? [];
  const tasks = input.tasks ?? [];
  const hasRepositoryEvidence = agents.length + runs.length + approvals.length + tasks.length > 0;

  const controlAgents: ControlAgent[] = agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    enabled: agent.enabled,
    state: agentState(agent, nowMs, options.runtimeConnected === true),
    observedAt: options.runtimeConnected ? agent.heartbeatAt ?? null : null,
    tools: agent.selectedTools.length,
  }));
  const failedRuns = operationRuns.filter((run) => run.status.toLowerCase() === "failed");
  const attentionRuns = operationRuns.filter((run) => ["missing_connector", "queued_manual", "needs_approval"].includes(run.status.toLowerCase()));
  const pendingApprovals = approvals.filter((approval) => approval.status === "PENDING");
  const activeTasks = tasks.filter((task) => !["DONE", "CANCELED"].includes(task.status));
  const blockedTasks = activeTasks.filter((task) => task.status === "BLOCKED");

  const registryObservedAt = mostRecent(agents.map((agent) => options.runtimeConnected ? agent.heartbeatAt ?? agent.updatedAt : agent.updatedAt));
  const runsObservedAt = mostRecent(runs.map((run) => run.createdAt));
  const approvalsObservedAt = mostRecent(approvals.map((approval) => approval.updatedAt ?? approval.createdAt));
  const tasksObservedAt = mostRecent(tasks.map((task) => task.updatedAt));

  const enabledAgentStates = controlAgents.filter((agent) => agent.enabled).map((agent) => agent.state);
  const registryState: ControlSource["state"] = agents.length === 0
    ? "unavailable"
    : enabledAgentStates.includes("unavailable")
      ? "unavailable"
      : enabledAgentStates.includes("stale")
        ? "stale"
        : "healthy";
  const runState: ControlSource["state"] = failedRuns.length > 0
    ? "error"
    : attentionRuns.length > 0
      ? "warning"
    : !hasRepositoryEvidence
      ? "unavailable"
      : runsObservedAt && isStale(runsObservedAt, nowMs, ACTIVITY_STALE_AFTER_MS)
        ? "stale"
        : "healthy";
  const approvalState: ControlSource["state"] = hasRepositoryEvidence ? "healthy" : "unavailable";
  const taskState: ControlSource["state"] = blockedTasks.length > 0
    ? "error"
    : !hasRepositoryEvidence
      ? "unavailable"
      : tasksObservedAt && isStale(tasksObservedAt, nowMs, ACTIVITY_STALE_AFTER_MS)
        ? "stale"
        : "healthy";

  const sources: ControlSource[] = [
    source("registry", "Agent registry", registryObservedAt, registryState, agents.length ? `${agents.length} registry entries observed.` : "No registry evidence is available.", options.sourceErrors),
    source("runs", "Run ledger", runsObservedAt, runState, runs.length ? `${runs.length} run receipts observed.` : hasRepositoryEvidence ? "No runs have been recorded yet." : "No run-ledger evidence is available.", options.sourceErrors),
    source("approvals", "Approval queue", approvalsObservedAt, approvalState, approvals.length ? `${pendingApprovals.length} approvals are pending.` : hasRepositoryEvidence ? "The approval queue is empty." : "No approval-queue evidence is available.", options.sourceErrors),
    source("tasks", "Task ledger", tasksObservedAt, taskState, tasks.length ? `${activeTasks.length} tasks remain open.` : hasRepositoryEvidence ? "The task ledger is empty." : "No task-ledger evidence is available.", options.sourceErrors),
    source("runtime", "S-OS runtime", null, options.runtimeConnected ? "healthy" : "unavailable", options.runtimeConnected ? "The governed runtime adapter is connected." : "Runtime connectivity is not wired in CP-02; production actions remain unavailable.", options.sourceErrors),
  ];

  const exceptions: ControlException[] = [];
  for (const run of failedRuns) {
    exceptions.push({
      id: `failed-run:${run.id}`,
      kind: "failed-run",
      severity: "critical",
      title: `Run failed: ${run.capability}`,
      detail: run.message || run.objective,
      href: "/agents",
      observedAt: run.createdAt,
      entityId: run.id,
    });
  }
  for (const run of attentionRuns) {
    const status = run.status.toLowerCase();
    const title = status === "missing_connector"
      ? `Connector missing: ${run.capability}`
      : status === "queued_manual"
        ? `Manual follow-up queued: ${run.capability}`
        : `Run needs approval: ${run.capability}`;
    exceptions.push({
      id: `attention-run:${run.id}`,
      kind: "attention-run",
      severity: "attention",
      title,
      detail: run.message || run.objective,
      href: "/agents",
      observedAt: run.createdAt,
      entityId: run.id,
    });
  }
  for (const task of blockedTasks) {
    exceptions.push({
      id: `blocked-task:${task.id}`,
      kind: "blocked-task",
      severity: "critical",
      title: `Blocked work: ${task.title}`,
      detail: task.blockedReason || "The task ledger reports this item as blocked.",
      href: "/tasks",
      observedAt: task.updatedAt,
      entityId: task.id,
    });
  }
  for (const approval of pendingApprovals) {
    exceptions.push({
      id: `pending-approval:${approval.id}`,
      kind: "pending-approval",
      severity: "attention",
      title: `Approval pending: ${approval.action}`,
      detail: `${approval.riskLevel ?? "MEDIUM"} risk · ${approval.provider ?? approval.source}`,
      href: "/agents",
      observedAt: approval.updatedAt ?? approval.createdAt,
      entityId: approval.id,
    });
  }
  for (const task of activeTasks) {
    const dueAt = timestamp(task.dueAt);
    if (task.status !== "BLOCKED" && dueAt !== null && dueAt < nowMs) {
      exceptions.push({
        id: `overdue-task:${task.id}`,
        kind: "overdue-task",
        severity: "attention",
        title: `Overdue work: ${task.title}`,
        detail: `Due ${task.dueAt}`,
        href: "/tasks",
        observedAt: task.updatedAt,
        entityId: task.id,
      });
    }
  }
  for (const agent of controlAgents.filter((item) => item.state === "stale")) {
    exceptions.push({
      id: `stale-agent:${agent.id}`,
      kind: "stale-agent",
      severity: "attention",
      title: `Stale heartbeat: ${agent.name}`,
      detail: agent.observedAt ? `Last heartbeat ${agent.observedAt}` : "No heartbeat has been recorded.",
      href: "/agents",
      observedAt: agent.observedAt,
      entityId: agent.id,
    });
  }
  for (const item of sources.filter((item) => item.state === "error" && options.sourceErrors?.[item.id])) {
    exceptions.push({
      id: `source-error:${item.id}`,
      kind: "source-error",
      severity: "critical",
      title: `${item.label} error`,
      detail: item.detail,
      href: item.id === "runtime" ? "/settings" : "/control",
      observedAt: item.observedAt,
      entityId: item.id,
    });
  }
  for (const item of sources.filter((item) => item.state === "unavailable")) {
    exceptions.push({
      id: `unavailable-source:${item.id}`,
      kind: "unavailable-source",
      severity: "information",
      title: `${item.label} unavailable`,
      detail: item.detail,
      href: item.id === "runtime" ? "/settings" : "/control",
      observedAt: item.observedAt,
      entityId: item.id,
    });
  }

  const severityRank = { critical: 0, attention: 1, information: 2 } as const;
  const kindRank: Record<ControlException["kind"], number> = {
    "failed-run": 0,
    "source-error": 1,
    "blocked-task": 2,
    "attention-run": 3,
    "pending-approval": 4,
    "overdue-task": 5,
    "stale-agent": 6,
    "unavailable-source": 7,
  };
  exceptions.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]
    || kindRank[a.kind] - kindRank[b.kind]
    || (timestamp(b.observedAt ?? undefined) ?? 0) - (timestamp(a.observedAt ?? undefined) ?? 0));

  const hasError = sources.some((item) => item.state === "error") || exceptions.some((item) => item.severity === "critical");
  const allUnavailable = sources.every((item) => item.state === "unavailable");
  const hasWarning = sources.some((item) => item.state === "stale" || item.state === "unavailable") || exceptions.length > 0;

  return {
    snapshotAt,
    overallState: hasError ? "error" : allUnavailable ? "unavailable" : hasWarning ? "warning" : "healthy",
    metrics: {
      enabledAgents: agents.filter((agent) => agent.enabled).length,
      pendingApprovals: pendingApprovals.length,
      failedRuns: failedRuns.length,
      openTasks: activeTasks.length,
    },
    sources,
    exceptions,
    agents: controlAgents,
    recentRuns: [...runs].sort((a, b) => (timestamp(b.createdAt) ?? 0) - (timestamp(a.createdAt) ?? 0)).slice(0, 8),
    pendingApprovals,
    activeTasks,
  };
}
