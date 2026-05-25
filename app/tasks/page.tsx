import { AppShell } from "@/components/layout/app-shell";
import { QuickCreate } from "@/components/quick-create";
import { TaskRow } from "@/components/task-row";
import { getTasks } from "@/lib/store";
import { Task } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_GROUPS: { status: Task["status"]; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "WAITING_APPROVAL", label: "Waiting Approval" },
  { status: "BLOCKED", label: "Blocked" },
  { status: "DONE", label: "Done" },
  { status: "CANCELED", label: "Canceled" },
];

export default async function TasksPage() {
  const tasks = await getTasks();

  const rootTasks = tasks.filter(task => !task.parentTaskId);
  const subtasksByParent = tasks.filter(task => task.parentTaskId).reduce<Record<string, Task[]>>((acc, task) => {
    acc[task.parentTaskId!] = [...(acc[task.parentTaskId!] || []), task];
    return acc;
  }, {});

  const todoCount = tasks.filter(t => t.status === "TODO").length;
  const inProgressCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const doneCount = tasks.filter(t => t.status === "DONE").length;

  return (
    <AppShell pathname="/tasks" title="Tasks" subtitle="Track execution across every pillar of your empire.">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5"><div className="text-sm text-secondary">To Do</div><div className="mt-2 text-3xl font-semibold text-primary">{todoCount}</div></div>
            <div className="card p-5"><div className="text-sm text-secondary">In Progress</div><div className="mt-2 text-3xl font-semibold text-accent">{inProgressCount}</div></div>
            <div className="card p-5"><div className="text-sm text-secondary">Done</div><div className="mt-2 text-3xl font-semibold text-primary">{doneCount}</div></div>
          </div>

          {STATUS_GROUPS.filter(g => rootTasks.some(t => t.status === g.status)).map(({ status, label }) => {
            const group = rootTasks.filter(t => t.status === status);
            return (
              <div key={status} className="overflow-hidden rounded-[1.25rem] border border-border bg-surface">
                <div className="border-b border-border px-5 py-3"><span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span><span className="ml-2 rounded-full bg-surface2 px-2 py-0.5 text-xs text-secondary">{group.length}</span></div>
                <div className="divide-y divide-border/40">{group.map(task => <TaskRow key={task.id} task={task} subtasks={subtasksByParent[task.id] || []} />)}</div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="card p-10 text-center"><div className="text-4xl mb-3">✅</div><div className="text-lg font-semibold text-primary">No tasks yet</div><p className="mt-2 text-sm text-secondary max-w-sm mx-auto">Create your first task to start tracking execution across your empire.</p></div>
          )}
        </div>

        <QuickCreate endpoint="/api/tasks" title="New task" description="Add an execution item to track." fields={[{ name: "title", label: "Task title", placeholder: "Finalize pricing and CTA" },{ name: "category", label: "Category", placeholder: "Revenue / Brand / Assets" },{ name: "priority", label: "Priority", placeholder: "MEDIUM" },{ name: "dueAt", label: "Due date", placeholder: "2026-04-15" },{ name: "parentTaskId", label: "Parent task ID (optional)", placeholder: "task_123" }]} />
      </div>
    </AppShell>
  );
}
