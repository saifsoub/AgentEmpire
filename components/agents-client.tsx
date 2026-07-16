"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Plus, Play, Pencil, Trash2, FileText, Target, Scale, UserCheck, Package, Zap, Car, Loader2 } from "lucide-react";
import type { AgentConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Target, Scale, UserCheck, Package, Zap, Car, Bot,
};

const STATUS_STYLES: Record<string, string> = {
  active: "text-green-400 border-green-400/30 bg-green-400/10",
  draft: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  archived: "text-muted border-border bg-surface2",
};

export function AgentsClient({ agents: initial }: { agents: AgentConfig[] }) {
  const [agents, setAgents] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this agent?")) return;
    setDeleting(id);
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    setAgents(prev => prev.filter(a => a.id !== id));
    setDeleting(null);
  }

  const builtIn = agents.filter(a => a.builtIn);
  const custom = agents.filter(a => !a.builtIn);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
            <Bot className="h-4 w-4" />
            {agents.length} Agent{agents.length !== 1 ? "s" : ""}
          </div>
        </div>
        <Link
          href="/agents/create"
          className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Create Agent
        </Link>
      </div>

      {builtIn.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-secondary">Built-in Agents</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {builtIn.map(agent => <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} deleting={deleting} onRun={() => router.push(`/agents/${agent.id}`)} />)}
          </div>
        </div>
      )}

      {custom.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-secondary">Custom Agents</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {custom.map(agent => <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} deleting={deleting} onRun={() => router.push(`/agents/${agent.id}`)} />)}
          </div>
        </div>
      )}

      {agents.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <Bot className="h-12 w-12 text-muted" />
          <div className="text-lg font-semibold text-secondary">No agents yet</div>
          <p className="text-sm text-muted">Create your first AI agent to automate your empire workflows.</p>
          <Link href="/agents/create" className="mt-2 flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Create Agent
          </Link>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent, onDelete, deleting, onRun }: { agent: AgentConfig; onDelete: (id: string) => void; deleting: string | null; onRun: () => void }) {
  const Icon = ICON_MAP[agent.icon] ?? Bot;
  return (
    <div className="card group relative flex flex-col gap-4 p-5 transition hover:border-accent/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-primary">{agent.name}</div>
            <div className="text-xs text-muted">{agent.category}</div>
          </div>
        </div>
        <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase", STATUS_STYLES[agent.status] ?? STATUS_STYLES.draft)}>
          {agent.status}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-secondary line-clamp-2">{agent.description}</p>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>{agent.tools.length} tool{agent.tools.length !== 1 ? "s" : ""}</span>
        <span className="text-border">•</span>
        <span>{agent.inputFields.length} input{agent.inputFields.length !== 1 ? "s" : ""}</span>
        {agent.builtIn && (
          <>
            <span className="text-border">•</span>
            <span className="text-accent">built-in</span>
          </>
        )}
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
        <button
          onClick={onRun}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20"
        >
          <Play className="h-3.5 w-3.5" /> Run
        </button>
        {!agent.builtIn && (
          <>
            <Link
              href={`/agents/create?edit=${agent.id}`}
              className="flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm text-secondary transition hover:border-accent/40 hover:text-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => onDelete(agent.id)}
              disabled={deleting === agent.id}
              className="flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm text-secondary transition hover:border-red-400/40 hover:text-red-400 disabled:opacity-50"
            >
              {deleting === agent.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
