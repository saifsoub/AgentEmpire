"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TOOL_OPTIONS, APPROVAL_SENSITIVE_ACTIONS } from "@/lib/agents/definitions";

type Agent = { id: string; name: string; description: string; instructions: string; selectedTools: string[]; preferredProviders: string[]; approvalPolicy: string[]; enabled: boolean };
type ProviderStatus = { name: string; configured: boolean; capabilities: string[] };
type ToolsStatus = { ok: boolean; defaultProvider: string; enabledProviders: string[]; providers: ProviderStatus[] };
type RunResult = { ok: boolean; agent: { id: string; name: string }; executedAt: string; executions: Array<{ status: string; provider: string; capability: string; message: string; approvalRequired?: boolean; result?: unknown }>; summary: { executed: number; approvals: number; manual: number; failed: number } };
type RunLog = { id: string; agentId: string; objective: string; provider: string; capability: string; status: string; message: string; createdAt: string };
type Approval = { id: string; source: string; action: string; provider?: string; status: string; createdAt: string };

const providerOptions = ["native", "composio", "mcp", "webhook", "manual"];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const selectedAgent = useMemo(() => agents.find(a => a.id === selectedAgentId) || agents[0], [agents, selectedAgentId]);
  const [objective, setObjective] = useState("");
  const [status, setStatus] = useState<ToolsStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [runs, setRuns] = useState<RunLog[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", instructions: "", selectedTools: ["agent.execute", "task.create", "task.subtask.create"], preferredProviders: ["native", "composio", "mcp", "webhook", "manual"], approvalPolicy: APPROVAL_SENSITIVE_ACTIONS });

  async function refreshAll() {
    const [agentPayload, toolPayload, runPayload, approvalPayload] = await Promise.all([
      fetch("/api/agents").then(r => r.json()),
      fetch("/api/tools/status").then(r => r.json()).catch(() => null),
      fetch("/api/agent-runs").then(r => r.json()).catch(() => ({ runs: [] })),
      fetch("/api/approvals").then(r => r.json()).catch(() => ({ approvals: [] }))
    ]);
    if (agentPayload.ok) {
      setAgents(agentPayload.agents);
      if (!selectedAgentId && agentPayload.agents[0]) setSelectedAgentId(agentPayload.agents[0].id);
    }
    setStatus(toolPayload);
    setRuns(runPayload.runs || []);
    setApprovals(approvalPayload.approvals || []);
  }

  useEffect(() => { refreshAll().catch(() => setError("Failed to load agent studio.")); }, []);

  function toggleArray(key: "selectedTools" | "preferredProviders" | "approvalPolicy", value: string) {
    setForm(prev => ({ ...prev, [key]: (prev[key] as string[]).includes(value) ? (prev[key] as string[]).filter(v => v !== value) : [...(prev[key] as string[]), value] }));
  }

  async function createCustomAgent() {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/agents", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Create agent failed");
      setForm({ name: "", description: "", instructions: "", selectedTools: ["agent.execute", "task.create", "task.subtask.create"], preferredProviders: ["native", "composio", "mcp", "webhook", "manual"], approvalPolicy: APPROVAL_SENSITIVE_ACTIONS });
      await refreshAll();
      setSelectedAgentId(payload.agent.id);
    } catch (err) { setError(err instanceof Error ? err.message : "Create agent failed"); } finally { setSaving(false); }
  }

  async function runAgent() {
    if (!selectedAgent) return;
    setRunning(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/agents/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ agentId: selectedAgent.id, inputs: { objective } }) });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Agent run failed");
      setResult(payload);
      await refreshAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Agent run failed"); } finally { setRunning(false); }
  }

  async function cleanupTasks() {
    setCleaning(true); setError("");
    try {
      const response = await fetch("/api/admin/cleanup-tasks", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Cleanup failed");
      await refreshAll();
      setResult({ ok: true, agent: { id: "admin", name: "Cleanup" }, executedAt: new Date().toISOString(), executions: [{ status: "executed", provider: "native", capability: "task.create", message: `Cleaned tasks. Removed ${payload.removed}, remaining ${payload.remaining}.` }], summary: { executed: 1, approvals: 0, manual: 0, failed: 0 } });
    } catch (err) { setError(err instanceof Error ? err.message : "Cleanup failed"); } finally { setCleaning(false); }
  }

  return <AppShell pathname="/agents" title="Agents" subtitle="Create GPT-like agents, assign tools, run internally, and approve only sensitive final actions.">
    <div className="grid gap-6">
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-primary">Connected Tool Layer</h2><p className="text-sm text-secondary">Dynamic providers, internal autonomy, task/subtask creation, run history, cleanup, and approval queue foundation.</p></div>
          <button onClick={cleanupTasks} disabled={cleaning} className="rounded-2xl border border-border bg-surface px-4 py-2 text-sm text-primary hover:border-accent disabled:opacity-60">{cleaning ? "Cleaning..." : "Clean task noise"}</button>
        </div>
        <div className="grid gap-3 md:grid-cols-5">{(status?.providers || []).map(provider => <div key={provider.name} className="rounded-2xl border border-border bg-surface p-3"><div className="mb-1 flex items-center justify-between gap-2"><span className="font-medium text-primary capitalize">{provider.name}</span><span className={provider.configured ? "text-xs text-emerald-300" : "text-xs text-secondary"}>{provider.configured ? "Ready" : "Needs env"}</span></div><div className="text-xs text-secondary">{provider.capabilities.length} capabilities</div></div>)}</div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr_360px]">
        <section className="card p-5">
          <h2 className="mb-4 text-lg font-semibold text-primary">Agent Registry</h2>
          <div className="space-y-3">{agents.map(agent => <button key={agent.id} onClick={() => setSelectedAgentId(agent.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedAgent?.id === agent.id ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-accent/50"}`}><div className="mb-1 flex items-center justify-between gap-2"><span className="font-semibold text-primary">{agent.name}</span><span className="rounded-full border border-border px-2 py-0.5 text-xs text-secondary">{agent.enabled ? "Enabled" : "Off"}</span></div><p className="text-sm text-secondary">{agent.description}</p><div className="mt-3 text-xs text-accent">{agent.selectedTools.length} tools · {agent.preferredProviders.join(" → ")}</div></button>)}</div>
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-primary">{selectedAgent?.name || "No agent"}</h2><p className="mt-1 text-sm text-secondary">{selectedAgent?.instructions}</p></div><button onClick={runAgent} disabled={running || !selectedAgent} className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-black disabled:opacity-60">{running ? "Running..." : "Run Agent"}</button></div>
          <label className="grid gap-2 text-sm text-secondary"><span>Objective</span><textarea className="min-h-32 rounded-2xl border border-border bg-surface p-3 text-primary outline-none focus:border-accent" placeholder="Tell the selected agent what to do." value={objective} onChange={e => setObjective(e.target.value)} /></label>
          <div className="mt-6 rounded-2xl border border-border bg-[#0d1420] p-4"><div className="mb-3 text-sm font-semibold text-primary">Selected Tools</div><div className="grid gap-2 md:grid-cols-2">{TOOL_OPTIONS.filter(tool => selectedAgent?.selectedTools.includes(tool.id)).map(tool => <div key={tool.id} className="rounded-xl border border-border bg-surface p-3"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-primary">{tool.label}</span><span className="text-xs text-accent">{tool.provider}</span></div><p className="mt-1 text-xs text-secondary">{tool.description}</p></div>)}</div></div>
          {error && <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
          {result && <div className="mt-5 rounded-2xl border border-border bg-surface p-4"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-primary">Run Result</h3><span className="text-xs text-secondary">{new Date(result.executedAt).toLocaleString()}</span></div><div className="mb-4 grid gap-3 md:grid-cols-4"><div className="rounded-xl border border-border p-3"><div className="text-xs text-secondary">Executed</div><div className="text-xl text-primary">{result.summary.executed}</div></div><div className="rounded-xl border border-border p-3"><div className="text-xs text-secondary">Approvals</div><div className="text-xl text-primary">{result.summary.approvals}</div></div><div className="rounded-xl border border-border p-3"><div className="text-xs text-secondary">Manual</div><div className="text-xl text-primary">{result.summary.manual}</div></div><div className="rounded-xl border border-border p-3"><div className="text-xs text-secondary">Failed</div><div className="text-xl text-primary">{result.summary.failed}</div></div></div><div className="space-y-3">{result.executions.map((item, index) => <div key={index} className="rounded-xl border border-border bg-[#0d1420] p-3"><div className="mb-1 flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold text-primary">{item.capability}</span><span className="rounded-full border border-border px-2 py-0.5 text-xs text-secondary">{item.provider}</span><span className="rounded-full border border-accent/30 px-2 py-0.5 text-xs text-accent">{item.status}</span></div><p className="text-sm text-secondary">{item.message}</p></div>)}</div></div>}
        </section>

        <section className="grid gap-6">
          <div className="card p-5"><h2 className="mb-4 text-lg font-semibold text-primary">Create Agent</h2><div className="grid gap-3"><input className="rounded-2xl border border-border bg-surface p-3 text-primary" placeholder="Agent name" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} /><input className="rounded-2xl border border-border bg-surface p-3 text-primary" placeholder="Description" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} /><textarea className="min-h-24 rounded-2xl border border-border bg-surface p-3 text-primary" placeholder="Instructions" value={form.instructions} onChange={e => setForm(v => ({ ...v, instructions: e.target.value }))} /></div><div className="mt-4 grid gap-2">{TOOL_OPTIONS.map(tool => <label key={tool.id} className="flex items-start gap-2 rounded-xl border border-border bg-surface p-2 text-sm text-secondary"><input type="checkbox" checked={form.selectedTools.includes(tool.id)} onChange={() => setForm(v => ({ ...v, selectedTools: v.selectedTools.includes(tool.id) ? v.selectedTools.filter(x => x !== tool.id) : [...v.selectedTools, tool.id] }))} /><span><b className="text-primary">{tool.label}</b><br />{tool.description}</span></label>)}</div><button onClick={createCustomAgent} disabled={saving} className="mt-4 w-full rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-black disabled:opacity-60">{saving ? "Saving..." : "Save Agent"}</button></div>
          <div className="card p-5"><h2 className="mb-3 text-lg font-semibold text-primary">Approval Queue</h2><div className="space-y-2">{approvals.slice(0, 5).map(item => <div key={item.id} className="rounded-xl border border-border bg-surface p-3 text-sm"><div className="text-primary">{item.action}</div><div className="text-xs text-secondary">{item.status} · {item.provider || "provider"}</div></div>)}{approvals.length === 0 && <p className="text-sm text-secondary">No pending approvals.</p>}</div></div>
          <div className="card p-5"><h2 className="mb-3 text-lg font-semibold text-primary">Run History</h2><div className="space-y-2">{runs.slice(0, 6).map(run => <div key={run.id} className="rounded-xl border border-border bg-surface p-3 text-sm"><div className="text-primary">{run.capability}</div><div className="text-xs text-secondary">{run.status} · {run.provider}</div></div>)}{runs.length === 0 && <p className="text-sm text-secondary">No runs yet.</p>}</div></div>
        </section>
      </div>
    </div>
  </AppShell>;
}
