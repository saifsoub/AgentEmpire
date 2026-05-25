"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Task } from "@/lib/types";
import { Check, Circle, Clock, XCircle, ChevronRight } from "lucide-react";

const PRIORITY_STYLE: Record<Task["priority"], string> = {
  LOW: "border-border bg-surface2 text-muted",
  MEDIUM: "border-blue-400/30 bg-blue-400/10 text-blue-400",
  HIGH: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  CRITICAL: "border-red-400/30 bg-red-400/10 text-red-400",
};

const STATUS_ICON: Record<Task["status"], React.ReactNode> = {
  TODO: <Circle className="h-4 w-4 text-muted" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-400" />,
  WAITING_APPROVAL: <Clock className="h-4 w-4 text-yellow-400" />,
  BLOCKED: <XCircle className="h-4 w-4 text-red-400" />,
  DONE: <Check className="h-4 w-4 text-green-400" />,
  CANCELED: <XCircle className="h-4 w-4 text-muted" />,
};

const STATUS_CYCLE: Record<Task["status"], Task["status"]> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  WAITING_APPROVAL: "DONE",
  BLOCKED: "TODO",
  DONE: "CANCELED",
  CANCELED: "TODO",
};

export function TaskRow({ task, subtasks = [] }: { task: Task; subtasks?: Task[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const progress = useMemo(() => {
    if (!subtasks.length) return null;
    const done = subtasks.filter(subtask => subtask.status === "DONE").length;
    return Math.round((done / subtasks.length) * 100);
  }, [subtasks]);

  async function cycleStatus() {
    setLoading(true);
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: STATUS_CYCLE[task.status] }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <div className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-5 py-4 ${task.status === "DONE" || task.status === "CANCELED" ? "opacity-50" : ""}`}>
        <button onClick={cycleStatus} disabled={loading} className="flex items-center justify-center rounded-lg hover:bg-surface2 p-1 transition" title={`Mark as ${STATUS_CYCLE[task.status]}`}>
          {STATUS_ICON[task.status]}
        </button>
        <div>
          <div className={`flex items-center gap-2 text-sm font-medium ${task.status === "DONE" ? "line-through text-muted" : "text-primary"}`}>
            {task.parentTaskId && <ChevronRight className="h-3 w-3 text-muted" />}
            {task.title}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            {task.category && <span>{task.category}</span>}
            {task.approvalRequired && <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 text-yellow-300">Approval</span>}
            {task.blockedReason && <span className="rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-red-300">Blocked</span>}
            {progress !== null && <span>{progress}% subtasks complete</span>}
          </div>
        </div>
        <div><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span></div>
        <div className="text-xs text-muted hidden md:block">{task.dueAt ? task.dueAt : "–"}</div>
        <div className="text-xs text-muted hidden lg:block capitalize">{task.status.replace("_", " ")}</div>
      </div>
      {subtasks.length > 0 && (
        <div className="border-t border-border/20 bg-[#0d1420] px-6 py-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Subtasks</div>
          <div className="space-y-2">{subtasks.map(subtask => <div key={subtask.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm"><div className="flex items-center gap-2"><span>{STATUS_ICON[subtask.status]}</span><span className={subtask.status === "DONE" ? "line-through text-muted" : "text-primary"}>{subtask.title}</span></div><span className="text-xs text-muted">{subtask.status.replace("_", " ")}</span></div>)}</div>
        </div>
      )}
    </div>
  );
}
