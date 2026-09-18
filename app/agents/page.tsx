"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { APPROVAL_SENSITIVE_ACTIONS } from "@/lib/agents/definitions";
import { cn } from "@/lib/utils";
import {
  Bot, Play, CheckCircle, Clock, AlertCircle, Plus, Archive,
  Zap, Settings, ChevronRight, X, Trash2,
} from "lucide-react";

type Agent = {
  id: string; name: string; description: string; instructions: string;
  selectedTools: string[]; preferredProviders: string[]; approvalPolicy: string[]; enabled: boolean;
};
type Tool = { id: string; label: string; provider: string; description: string; ready?: boolean; sensitive?: boolean };
type ToolGroups = Record<string, Tool[]>;
type RunLog = { id: string; agentId: string; objective: string; provider: string; capability: string; status: string; message: string; createdAt: string };
type Approval = { id: string; action: string; provider?: string; status: string; createdAt: string };
type RunResult = {
  executedAt: string;
  executions: { capability: string; provider: string; status: string; message: string }[];
  summary: { executed: number; approvals: number; manual: number; failed: number };
};

const PROVIDERS = ["native", "composio", "mcp", "webhook", "manual"];
const DEFAULT_FORM = {
  name: "", description: "", instructions: "",
  selectedTools: ["agent.execute", "task.create", "task.subtask.create"],
  preferredProviders: PROVIDERS,
  approvalPolicy: APPROVAL_SENSITIVE_ACTIONS,
};

// ── Stat tile ──────────────────────────────────────────────────────────────
function StatTile({
  label, value, icon: Icon, variant = "default",
}: {
  label: string; value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "warning" | "success";
}) {
  const iconColor = variant === "warning" ? "text-yellow-400" : variant === "success" ? "text-emerald-400" : "text-cp-primary";
  const valueColor = variant === "warning" ? "text-yellow-400" : variant === "success" ? "text-emerald-400" : "text-cp-foreground";
  return (
    <div className="rounded-xl border border-cp-border bg-cp-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-cp-muted-fg">{label}</span>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <div className={cn("text-2xl font-semibold", valueColor)}>{value}</div>
    </div>
  );
}

// ── Agent card ────────────────────────────────────────────────────────────
function AgentCard({ agent, active, onClick }: { agent: Agent; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all",
        active
          ? "border-cp-primary bg-cp-primary/10"
          : "border-cp-border bg-cp-card hover:border-cp-primary/40",
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
          agent.enabled
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-cp-border bg-cp-secondary",
        )}>
          <Bot className={cn("h-4 w-4", agent.enabled ? "text-emerald-400" : "text-cp-muted-fg")} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-cp-foreground">{agent.name}</div>
          <div className="truncate text-xs text-cp-muted-fg">{agent.description}</div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-cp-muted-fg/40" />
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-cp-muted-fg">
        <span className={cn("inline-flex items-center gap-1", agent.enabled ? "text-emerald-400" : "text-cp-muted-fg")}>
          <span className={cn("h-1.5 w-1.5 rounded-full", agent.enabled ? "bg-emerald-400" : "bg-cp-muted-fg")} />
          {agent.enabled ? "Active" : "Archived"}
        </span>
        <span>·</span>
        <span>{agent.selectedTools.length} tools</span>
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
type PanelView = "editor" | "run" | "history";

export default function AgentsPage() {
  const [agents, setAgents]       = useState<Agent[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const selected = useMemo(() => agents.find(a => a.id === selectedId), [agents, selectedId]);

  const [form, setForm]       = useState(DEFAULT_FORM);
  const [tools, setTools]     = useState<ToolGroups>({});
  const [runs, setRuns]       = useState<RunLog[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [objective, setObjective] = useState("");
  const [result, setResult]   = useState<RunResult | null>(null);
  const [busy, setBusy]       = useState("");
  const [error, setError]     = useState("");
  const [view, setView]       = useState<PanelView>("editor");

  const refresh = useCallback(async () => {
    const [a, d, r, q] = await Promise.all([
      fetch("/api/agents").then(x => x.json()),
      fetch("/api/tools/discover", { method: "POST" }).then(x => x.json()).catch(() => ({ groups: {} })),
      fetch("/api/agent-runs").then(x => x.json()).catch(() => ({ runs: [] })),
      fetch("/api/approvals").then(x => x.json()).catch(() => ({ approvals: [] })),
    ]);
    if (a.ok) {
      setAgents(a.agents);
      if (!selectedId && a.agents[0]) setSelectedId(a.agents[0].id);
    }
    setTools(d.groups || {});
    setRuns(r.runs || []);
    setApprovals(q.approvals || []);
  }, [selectedId]);

  useEffect(() => { refresh().catch(() => setError("Failed to load agents.")); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selected) setForm({
      name: selected.name, description: selected.description,
      instructions: selected.instructions, selectedTools: selected.selectedTools,
      preferredProviders: selected.preferredProviders, approvalPolicy: selected.approvalPolicy,
    });
  }, [selected]);

  function toggle(key: "selectedTools" | "preferredProviders" | "approvalPolicy", value: string) {
    setForm(v => ({ ...v, [key]: v[key].includes(value) ? v[key].filter(x => x !== value) : [...v[key], value] }));
  }

  async function save() {
    setBusy("save"); setError("");
    try {
      const url = selected ? `/api/agents/${selected.id}` : "/api/agents";
      const res = await fetch(url, { method: selected ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const p = await res.json();
      if (!p.ok) throw new Error(p.error);
      await refresh(); setSelectedId(p.agent.id);
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setBusy(""); }
  }

  async function archive() {
    if (!selected) return;
    setBusy("archive");
    await fetch(`/api/agents/${selected.id}`, { method: "DELETE" });
    await refresh(); setBusy("");
  }

  async function run() {
    if (!selected) return;
    setBusy("run"); setResult(null);
    try {
      const res = await fetch("/api/agents/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ agentId: selected.id, inputs: { objective } }) });
      const p = await res.json();
      if (!p.ok) throw new Error(p.error);
      setResult(p); setView("history");
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Run failed"); }
    finally { setBusy(""); }
  }

  async function cleanup() {
    setBusy("cleanup");
    const res = await fetch("/api/admin/cleanup-tasks", { method: "POST" });
    const p = await res.json();
    setResult({
      executedAt: new Date().toISOString(),
      executions: [{ capability: "cleanup", provider: "native", status: p.ok ? "executed" : "failed", message: p.ok ? `Removed ${p.removed}. Remaining ${p.remaining}.` : p.error }],
      summary: { executed: p.ok ? 1 : 0, approvals: 0, manual: 0, failed: p.ok ? 0 : 1 },
    });
    setBusy("");
  }

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    await fetch(`/api/approvals/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    await refresh();
  }

  const pending = approvals.filter(a => a.status === "PENDING");

  return (
    <AppShell pathname="/agents" title="S/ Agency" subtitle="Command and configure your AI agent workforce.">
      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Agents"      value={agents.length}                               icon={Bot}          />
        <StatTile label="Active"            value={agents.filter(a => a.enabled).length}        icon={CheckCircle}  variant="success"  />
        <StatTile label="Pending Approvals" value={pending.length}                              icon={AlertCircle}  variant={pending.length > 0 ? "warning" : "default"} />
        <StatTile label="Runs Logged"       value={runs.length}                                 icon={Zap}          />
      </div>

      {/* ── Main grid ─────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

        {/* Left — roster + quick approvals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cp-muted-fg">Agents</span>
            <button
              onClick={() => { setSelectedId(""); setForm(DEFAULT_FORM); setView("editor"); }}
              className="flex items-center gap-1 rounded-lg border border-cp-border bg-cp-card px-2 py-1 text-xs text-cp-muted-fg hover:text-cp-foreground"
            >
              <Plus className="h-3 w-3" /> New
            </button>
          </div>

          <div className="space-y-2">
            {agents.map(a => (
              <AgentCard key={a.id} agent={a} active={selectedId === a.id}
                onClick={() => { setSelectedId(a.id); setView("editor"); }} />
            ))}
            {agents.length === 0 && (
              <p className="py-6 text-center text-sm text-cp-muted-fg">No agents yet — create your first one.</p>
            )}
          </div>

          <button
            onClick={cleanup} disabled={busy === "cleanup"}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-cp-border bg-cp-card px-4 py-2 text-sm text-cp-muted-fg hover:text-cp-foreground disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {busy === "cleanup" ? "Cleaning…" : "Clean task noise"}
          </button>

          {/* Urgent approvals */}
          {pending.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Needs approval</span>
              </div>
              {pending.slice(0, 3).map(a => (
                <div key={a.id} className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3">
                  <div className="mb-2 truncate text-xs font-medium text-cp-foreground">{a.action}</div>
                  <div className="flex gap-2">
                    <button onClick={() => decide(a.id, "APPROVED")}
                      className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/20 py-1 text-xs text-emerald-300 hover:bg-emerald-500/30">
                      Approve
                    </button>
                    <button onClick={() => decide(a.id, "REJECTED")}
                      className="flex-1 rounded-lg border border-red-500/30 bg-red-500/20 py-1 text-xs text-red-300 hover:bg-red-500/30">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — detail panel */}
        <div className="space-y-4">
          {/* Agent header + view switcher */}
          <div className="rounded-xl border border-cp-border bg-cp-card p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-cp-foreground">{selected?.name || "New Agent"}</h2>
                <p className="mt-1 text-sm text-cp-muted-fg">{selected?.description || "Configure and deploy an AI agent."}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selected && (
                  <button onClick={() => setView(view === "run" ? "editor" : "run")}
                    className={cn("flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                      view === "run"
                        ? "bg-cp-primary text-cp-primary-fg"
                        : "border border-cp-border text-cp-muted-fg hover:text-cp-foreground")}>
                    <Play className="h-4 w-4" /> Run
                  </button>
                )}
                <button onClick={() => setView(view === "history" ? "editor" : "history")}
                  className={cn("flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                    view === "history"
                      ? "bg-cp-secondary text-cp-foreground"
                      : "border border-cp-border text-cp-muted-fg hover:text-cp-foreground")}>
                  <Clock className="h-4 w-4" /> History
                </button>
                <button onClick={() => setView("editor")}
                  className={cn("flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                    view === "editor"
                      ? "bg-cp-secondary text-cp-foreground"
                      : "border border-cp-border text-cp-muted-fg hover:text-cp-foreground")}>
                  <Settings className="h-4 w-4" /> Config
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                <span className="flex-1">{error}</span>
                <button onClick={() => setError("")}><X className="h-4 w-4" /></button>
              </div>
            )}

            {/* Run panel */}
            {view === "run" && selected && (
              <div className="space-y-3">
                <label className="block text-xs font-medium uppercase tracking-wider text-cp-muted-fg">Objective</label>
                <textarea
                  className="min-h-28 w-full resize-none rounded-xl border border-cp-border bg-cp-background p-3 text-sm text-cp-foreground placeholder-cp-muted-fg focus:border-cp-primary focus:outline-none"
                  placeholder="Describe what this agent should accomplish…"
                  value={objective} onChange={e => setObjective(e.target.value)}
                />
                <button onClick={run} disabled={busy === "run" || !objective.trim()}
                  className="w-full rounded-xl bg-cp-primary py-2.5 text-sm font-semibold text-cp-primary-fg disabled:opacity-50 hover:opacity-90">
                  {busy === "run" ? "Running…" : "Execute Agent"}
                </button>
              </div>
            )}
          </div>

          {/* Run result (shown after execution) */}
          {result && view === "history" && (
            <div className="rounded-xl border border-cp-border bg-cp-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-cp-foreground">Latest Run Result</h3>
              <div className="mb-4 grid grid-cols-4 gap-3 text-center">
                {([ ["Executed", result.summary.executed, "text-emerald-400"], ["Approvals", result.summary.approvals, "text-yellow-400"], ["Manual", result.summary.manual, "text-blue-400"], ["Failed", result.summary.failed, "text-red-400"] ] as const).map(([l, v, c]) => (
                  <div key={l}>
                    <div className={`text-xl font-semibold ${c}`}>{v}</div>
                    <div className="text-xs text-cp-muted-fg">{l}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {result.executions.map((x, i) => (
                  <div key={i} className="rounded-lg border border-cp-border bg-cp-background p-3 text-xs">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={cn("font-medium", x.status === "executed" ? "text-emerald-400" : x.status === "failed" ? "text-red-400" : "text-yellow-400")}>{x.status}</span>
                      <span className="text-cp-muted-fg/40">·</span>
                      <span className="text-cp-muted-fg">{x.capability}</span>
                      <span className="text-cp-muted-fg/40">·</span>
                      <span className="text-cp-muted-fg/70">{x.provider}</span>
                    </div>
                    <p className="text-cp-muted-fg">{x.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Config / Editor */}
          {view === "editor" && (
            <div className="rounded-xl border border-cp-border bg-cp-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-cp-foreground">Agent Configuration</h3>
                {selected && (
                  <button onClick={archive} disabled={busy === "archive"}
                    className="flex items-center gap-1 rounded-lg border border-red-400/20 px-2 py-1 text-xs text-red-400 hover:bg-red-400/10 disabled:opacity-50">
                    <Archive className="h-3 w-3" /> Archive
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <input
                  className="w-full rounded-xl border border-cp-border bg-cp-background px-3 py-2.5 text-sm text-cp-foreground placeholder-cp-muted-fg focus:border-cp-primary focus:outline-none"
                  placeholder="Agent name" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} />
                <input
                  className="w-full rounded-xl border border-cp-border bg-cp-background px-3 py-2.5 text-sm text-cp-foreground placeholder-cp-muted-fg focus:border-cp-primary focus:outline-none"
                  placeholder="Short description" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} />
                <textarea
                  className="min-h-20 w-full resize-none rounded-xl border border-cp-border bg-cp-background px-3 py-2.5 text-sm text-cp-foreground placeholder-cp-muted-fg focus:border-cp-primary focus:outline-none"
                  placeholder="Instructions — role, goals, and constraints." value={form.instructions} onChange={e => setForm(v => ({ ...v, instructions: e.target.value }))} />

                {/* Tool capabilities */}
                {Object.entries(tools).length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-cp-muted-fg">Capabilities</div>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {Object.entries(tools).flatMap(([, list]) => list).map(t => (
                        <label key={t.id} className="flex cursor-pointer items-start gap-2 rounded-lg border border-cp-border bg-cp-background p-2.5 text-xs hover:border-cp-primary/40">
                          <input type="checkbox" className="mt-0.5 accent-cp-primary" checked={form.selectedTools.includes(t.id)} onChange={() => toggle("selectedTools", t.id)} />
                          <span>
                            <span className="font-medium text-cp-foreground">{t.label}</span>
                            {t.sensitive && <span className="ml-1 text-yellow-400">⚠</span>}
                            <span className={cn("ml-1 text-xs", t.ready ? "text-emerald-400" : "text-cp-muted-fg")}>({t.ready ? "ready" : "missing"})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Providers */}
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-cp-muted-fg">Preferred Providers</div>
                  <div className="flex flex-wrap gap-2">
                    {PROVIDERS.map(p => (
                      <button key={p} onClick={() => toggle("preferredProviders", p)}
                        className={cn("rounded-lg border px-3 py-1 text-xs transition-all",
                          form.preferredProviders.includes(p)
                            ? "border-cp-primary bg-cp-primary/10 text-cp-primary"
                            : "border-cp-border text-cp-muted-fg hover:border-cp-primary/40")}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={save} disabled={busy === "save"}
                  className="w-full rounded-xl bg-cp-primary py-2.5 text-sm font-semibold text-cp-primary-fg disabled:opacity-50 hover:opacity-90">
                  {busy === "save" ? "Saving…" : selected ? "Save Changes" : "Create Agent"}
                </button>
              </div>
            </div>
          )}

          {/* All Approvals (visible when editor is open) */}
          {view === "editor" && approvals.length > 0 && (
            <div className="rounded-xl border border-cp-border bg-cp-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-cp-foreground">All Approvals</h3>
              <div className="space-y-2">
                {approvals.slice(0, 8).map(a => (
                  <div key={a.id} className="rounded-xl border border-cp-border bg-cp-background p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-cp-foreground">{a.action}</span>
                      <span className={cn("shrink-0 text-xs", a.status === "PENDING" ? "text-yellow-400" : a.status === "APPROVED" ? "text-emerald-400" : "text-red-400")}>{a.status}</span>
                    </div>
                    <div className="text-xs text-cp-muted-fg">{a.provider || "provider"}</div>
                    {a.status === "PENDING" && (
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => decide(a.id, "APPROVED")} className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/20 py-1 text-xs text-emerald-300">Approve</button>
                        <button onClick={() => decide(a.id, "REJECTED")} className="flex-1 rounded-lg border border-red-500/30 bg-red-500/20 py-1 text-xs text-red-300">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Run history */}
          {view === "history" && (
            <div className="rounded-xl border border-cp-border bg-cp-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-cp-foreground">Run History</h3>
              {runs.length === 0 ? (
                <p className="py-4 text-center text-sm text-cp-muted-fg">No runs yet.</p>
              ) : (
                <div className="space-y-2">
                  {runs.slice(0, 10).map(r => (
                    <details key={r.id} className="rounded-xl border border-cp-border bg-cp-background p-3">
                      <summary className="flex cursor-pointer items-center justify-between">
                        <span className="text-sm text-cp-foreground">{r.capability}</span>
                        <span className={cn("text-xs", r.status === "executed" ? "text-emerald-400" : r.status === "failed" ? "text-red-400" : "text-yellow-400")}>
                          {r.status}
                        </span>
                      </summary>
                      <div className="mt-2 space-y-1 text-xs text-cp-muted-fg">
                        <div>{r.provider} · {new Date(r.createdAt).toLocaleString()}</div>
                        {r.objective && <div>{r.objective}</div>}
                        {r.message  && <div>{r.message}</div>}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
