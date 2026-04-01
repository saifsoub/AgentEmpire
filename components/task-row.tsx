"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Task } from "@/lib/types";
import { Check, Circle, Clock, XCircle } from "lucide-react";

const PRIORITY_STYLE: Record<Task["priority"], string> = {
  LOW: "border-border bg-surface2 text-muted",
  MEDIUM: "border-blue-400/30 bg-blue-400/10 text-blue-400",
  HIGH: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  CRITICAL: "border-red-400/30 bg-red-400/10 text-red-400",
};

const STATUS_ICON: Record<Task["status"], React.ReactNode> = {
  TODO: <Circle className="h-4 w-4 text-muted" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-400" />,
  DONE: <Check className="h-4 w-4 text-green-400" />,
  CANCELED: <XCircle className="h-4 w-4 text-muted" />,
};

const STATUS_CYCLE: Record<Task["status"], Task["status"]> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "CANCELED",
  CANCELED: "TODO",
};

export function TaskRow({ task }: { task: Task }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    <div className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center border-b border-border/70 px-5 py-4 last:border-b-0 ${task.status === "DONE" || task.status === "CANCELED" ? "opacity-50" : ""}`}>
      <button
        onClick={cycleStatus}
        disabled={loading}
        className="flex items-center justify-center rounded-lg hover:bg-surface2 p-1 transition"
        title={`Mark as ${STATUS_CYCLE[task.status]}`}
      >
        {STATUS_ICON[task.status]}
      </button>
      <div>
        <div className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-muted" : "text-primary"}`}>
          {task.title}
        </div>
        {task.category && (
          <div className="mt-0.5 text-xs text-muted">{task.category}</div>
        )}
      </div>
      <div>
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <div className="text-xs text-muted hidden md:block">
        {task.dueAt ? task.dueAt : "–"}
      </div>
      <div className="text-xs text-muted hidden lg:block capitalize">
        {task.status.replace("_", " ")}
      </div>
    </div>
  );
}
