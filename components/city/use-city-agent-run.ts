"use client";

import { useCallback, useRef, useState } from "react";

export type ExecutionMode = "demo" | "dry-run" | "live";
export type RunStatus = "idle" | "running" | "awaiting-approval" | "completed" | "rejected";
export type RoomId = "command" | "revenue" | "approval";
export type EventStatus = "running" | "completed" | "rejected" | "pending" | "awaiting";

export interface TimelineEvent {
  id: string;
  ts: string;
  label: string;
  status: EventStatus;
  room?: RoomId;
  detail?: string;
}

export interface PendingAction {
  id: string;
  type: string;
  summary: string;
  payload: Record<string, unknown>;
}

export const SAMPLE_OBJECTIVES = [
  "Launch weekly revenue report → email stakeholders → log to Airtable",
  "Analyze top 3 Shopify products → create content brief → queue for publishing",
  "Review pending leads → score priority → assign follow-up tasks",
];

function stamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function useCityAgentRun() {
  const [mode, setMode] = useState<ExecutionMode>("demo");
  const [status, setStatus] = useState<RunStatus>("idle");
  const [activeRoom, setActiveRoom] = useState<RoomId | null>(null);
  const [objective, setObjective] = useState("");
  const [thought, setThought] = useState("Your Sim is relaxing at home.");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [editPayload, setEditPayload] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [apiResult, setApiResult] = useState<Record<string, unknown> | null>(null);
  const tlRef = useRef<HTMLDivElement>(null);

  const addEvent = useCallback((label: string, s: EventStatus, room?: RoomId, detail?: string) => {
    const evt: TimelineEvent = { id: uid(), ts: stamp(), label, status: s, room, detail };
    setTimeline((prev) => [evt, ...prev]);
    return evt.id;
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setActiveRoom(null);
    setThought("Your Sim is relaxing at home.");
    setTimeline([]);
    setPending(null);
    setIsEditing(false);
    setApiResult(null);
  }, []);

  const isLive = status === "running" || status === "awaiting-approval";
  const canRun = objective.trim().length > 0 && !isLive;

  const runObjective = useCallback(async () => {
    if (!objective.trim() || isLive) return;
    reset();
    setStatus("running");
    setActiveRoom("command");
    addEvent("Objective queued at Command Room", "running", "command");
    setThought("Reading the day's goals...");

    await delay(900);
    setThought("Breaking work into tasks...");
    addEvent("Tasks planned — 3 actions ready", "completed", "command");

    await delay(1100);
    setActiveRoom("revenue");
    setThought("Heading to Revenue Room...");
    addEvent("Walking to Revenue Room", "running", "revenue");

    if (mode === "dry-run" || mode === "live") {
      try {
        const res = await fetch("/api/agents/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: "general-operator", inputs: { objective: objective.trim(), mode } }),
        });
        const data = (await res.json()) as Record<string, unknown>;
        setApiResult(data);
        addEvent(
          (data.ok as boolean) ? "Agent checked in — preview ready" : "Agent run hiccup (non-blocking)",
          (data.ok as boolean) ? "completed" : "rejected",
          "revenue",
          (data.ok as boolean) ? JSON.stringify(data).slice(0, 100) + "…" : String(data.error),
        );
      } catch {
        addEvent("Could not reach agent API", "rejected", "revenue");
      }
    } else {
      await delay(400);
      addEvent("Practice run complete (no external calls)", "completed", "revenue");
    }

    await delay(900);
    setThought("Needs your OK at Approval Desk...");
    addEvent("Sensitive action — waiting for approval", "awaiting", "approval");
    setActiveRoom("approval");

    const actionPayload = {
      objective: objective.trim(),
      mode,
      subtasks: ["Analyze data", "Prepare output", "Deliver to stakeholders"],
      estimatedImpact: "medium",
      reversible: mode !== "live",
      requiresExternalCommit: mode === "live",
      timestamp: new Date().toISOString(),
    };
    const actionType = mode === "live" ? "LIVE_ACTION" : mode === "dry-run" ? "DRY_RUN_PREVIEW" : "DEMO_ACTION";

    let actionId = uid();
    if (mode === "live") {
      try {
        const preRes = await fetch("/api/approvals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "governor-office",
            action: actionType,
            payload: actionPayload,
            riskLevel: "HIGH",
          }),
        });
        if (preRes.ok) {
          const preData = (await preRes.json()) as { ok: boolean; approval?: { id: string } };
          if (preData.ok && preData.approval?.id) {
            actionId = preData.approval.id;
            addEvent("Approval ticket filed", "completed", "approval");
          }
        }
      } catch {
        addEvent("Approval filing failed (non-blocking)", "rejected", "approval");
      }
    }

    const action: PendingAction = {
      id: actionId,
      type: actionType,
      summary: objective.trim().slice(0, 100),
      payload: actionPayload,
    };
    setPending(action);
    setEditPayload(JSON.stringify(action.payload, null, 2));
    setStatus("awaiting-approval");
    setThought("Waiting at Approval Desk for you.");
  }, [objective, isLive, mode, reset, addEvent]);

  const handleApprove = useCallback(async () => {
    if (!pending) return;
    addEvent("You approved the action", "completed", "approval", pending.summary);
    if (mode === "live") {
      try {
        const res = await fetch(`/api/approvals/${pending.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved", payload: pending.payload }),
        });
        if (!res.ok) throw new Error("Failed");
        addEvent("Approval saved", "completed", "approval");
      } catch {
        addEvent("Approval save failed (non-blocking)", "rejected", "approval");
      }
    }
    await delay(500);
    addEvent("Shift complete — great work!", "completed", "revenue");
    setThought("Task done. Time to unwind.");
    setStatus("completed");
    setActiveRoom(null);
    setPending(null);
  }, [pending, mode, addEvent]);

  const handleReject = useCallback(async () => {
    if (!pending) return;
    addEvent("You declined the action", "rejected", "approval", pending.summary);
    if (mode === "live") {
      try {
        await fetch(`/api/approvals/${pending.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        });
      } catch {
        /* non-blocking */
      }
    }
    setThought("Action cancelled. Pick a new goal anytime.");
    setStatus("rejected");
    setActiveRoom(null);
    setPending(null);
  }, [pending, mode, addEvent]);

  const handleEditSave = useCallback(() => {
    if (!pending) return;
    try {
      const parsed = JSON.parse(editPayload) as Record<string, unknown>;
      setPending((prev) => (prev ? { ...prev, payload: parsed } : prev));
      addEvent("You edited the plan", "awaiting", "approval");
      setIsEditing(false);
    } catch {
      alert("That JSON needs a quick fix before saving.");
    }
  }, [pending, editPayload, addEvent]);

  return {
    mode,
    setMode,
    status,
    activeRoom,
    objective,
    setObjective,
    thought,
    timeline,
    pending,
    editPayload,
    setEditPayload,
    isEditing,
    setIsEditing,
    apiResult,
    tlRef,
    isLive,
    canRun,
    reset,
    runObjective,
    handleApprove,
    handleReject,
    handleEditSave,
    SAMPLE_OBJECTIVES,
  };
}
