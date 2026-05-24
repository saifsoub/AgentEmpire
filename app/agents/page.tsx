"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DEFAULT_AGENTS, TOOL_OPTIONS } from "@/lib/agents/definitions";

type ProviderStatus = { name: string; configured: boolean; capabilities: string[] };
type ToolsStatus = { ok: boolean; defaultProvider: string; enabledProviders: string[]; providers: ProviderStatus[] };
type RunResult = { ok: boolean; agent: { id: string; name: string }; executedAt: string; executions: Array<{ status: string; provider: string; capability: string; message: string; approvalRequired?: boolean; result?: unknown }>; summary: { executed: number; approvals: number; manual: number; failed: number } };

function Field({ field, value, onChange }: { field: any; value: string; onChange: (value: string) => void }) {
  if (field.type === "textarea") return <label className="grid gap-2 text-sm text-secondary"><span>{field.label}</span><textarea className="min-h-28 rounded-2xl border border-border bg-surface p-3 text-primary outline-none focus:border-accent" placeholder={field.placeholder || ""} value={value} onChange={e => onChange(e.target.value)} /></label>;
  return <label className="grid gap-2 text-sm text-secondary"><span>{field.label}</span><input className="rounded-2xl border border-border bg-surface p-3 text-primary outline-none focus:border-accent" placeholder={field.placeholder || ""} value={value} onChange={e => onChange(e.target.value)} /></label>;
}

export default function AgentsPage() {
  const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENTS[0].id);
  const selectedAgent = useMemo(() => DEFAULT_AGENTS.find(a => a.id === selectedAgentId) || DEFAULT_AGENTS[0], [selectedAgentId]);
  const [inputs, setInputs] = useState<Record<string, string>>({ objective: "" });
  const [status, setStatus] = useState<ToolsStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/tools/status").then(r => r.json()).then(setStatus).catch(() => setStatus(null)); }, []);
  useEffect(() => { const defaults: Record<string, string> = {}; selectedAgent.inputFields.forEach(field => { defaults[field.key] = ""; }); setInputs(defaults); setResult(null); setError(""); }, [selectedAgent]);

  async function runAgent() {
    setRunning(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/agents/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ agentId: selectedAgent.id, inputs }) });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Agent run failed");
      setResult(payload);
    } catch (err) { setError(err instanceof Error ? err.message : "Agent run failed"); } finally { setRunning(false); }
  }

  return <AppShell pathname="/agents" title="Agents" subtitle="Create GPT-like agents, assign connected tools, and let them operate internally with final approval gates.">
    <div className="grid gap-6">
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-primary">Connected Tool Layer</h2><p className="text-sm text-secondary">Agents can use selected tools through Composio, MCP, webhook, native actions, or manual fallback. Internal work does not need step-by-step approval.</p></div>
          <div className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Default: {status?.defaultProvider || "native"}</div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">{(status?.providers || []).map(provider => <div key={provider.name} className="rounded-2xl border border-border bg-surface p-3"><div className="mb-1 flex items-center justify-between gap-2"><span className="font-medium text-primary capitalize">{provider.name}</span><span className={provider.configured ? "text-xs text-emerald-300" : "text-xs text-secondary"}>{provider.configured ? "Ready" : "Needs env"}</span></div><div className="text-xs text-secondary">{provider.capabilities.length} capabilities</div></div>)}</div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-primary">Agent Studio</h2><span className="rounded-full border border-border px-3 py-1 text-xs text-secondary">Custom GPT style</span></div>
          <div className="space-y-3">{DEFAULT_AGENTS.map(agent => <button key={agent.id} onClick={() => setSelectedAgentId(agent.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedAgentId === agent.id ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-accent/50"}`}><div className="mb-1 flex items-center justify-between gap-2"><span className="font-semibold text-primary">{agent.name}</span><span className="rounded-full border border-border px-2 py-0.5 text-xs text-secondary">{agent.enabled ? "Enabled" : "Off"}</span></div><p className="text-sm text-secondary">{agent.description}</p><div className="mt-3 text-xs text-accent">{agent.selectedTools.length} selected tools · {agent.preferredProviders.join(" → ")}</div></button>)}</div>
          <div className="mt-5 rounded-2xl border border-border bg-[#0d1420] p-4"><div className="font-semibold text-primary">Create Agent</div><p className="mt-1 text-sm text-secondary">Next: name, description, instructions, selected tools, approval preferences, save.</p></div>
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-primary">{selectedAgent.name}</h2><p className="mt-1 text-sm text-secondary">{selectedAgent.instructions}</p></div><button onClick={runAgent} disabled={running} className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-black disabled:opacity-60">{running ? "Running..." : "Run Agent"}</button></div>
          <div className="grid gap-4">{selectedAgent.inputFields.map(field => <Field key={field.key} field={field} value={inputs[field.key] || ""} onChange={value => setInputs(prev => ({ ...prev, [field.key]: value }))} />)}</div>
          <div className="mt-6 rounded-2xl border border-border bg-[#0d1420] p-4"><div className="mb-3 text-sm font-semibold text-primary">Selected Tools</div><div className="grid gap-2 md:grid-cols-2">{TOOL_OPTIONS.filter(tool => selectedAgent.selectedTools.includes(tool.id)).map(tool => <div key={tool.id} className="rounded-xl border border-border bg-surface p-3"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-primary">{tool.label}</span><span className="text-xs text-accent">{tool.provider}</span></div><p className="mt-1 text-xs text-secondary">{tool.description}</p></div>)}</div></div>
          {error && <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
          {result && <div className="mt-5 rounded-2xl border border-border bg-surface p-4"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-primary">Run Result</h3><span className="text-xs text-secondary">{new Date(result.executedAt).toLocaleString()}</span></div><div className="mb-4 grid gap-3 md:grid-cols-4"><div className="rounded-xl border border-border p-3"><div className="text-xs text-secondary">Executed</div><div className="text-xl text-primary">{result.summary.executed}</div></div><div className="rounded-xl border border-border p-3"><div className="text-xs text-secondary">Approvals</div><div className="text-xl text-primary">{result.summary.approvals}</div></div><div className="rounded-xl border border-border p-3"><div className="text-xs text-secondary">Manual</div><div className="text-xl text-primary">{result.summary.manual}</div></div><div className="rounded-xl border border-border p-3"><div className="text-xs text-secondary">Failed</div><div className="text-xl text-primary">{result.summary.failed}</div></div></div><div className="space-y-3">{result.executions.map((item, index) => <div key={index} className="rounded-xl border border-border bg-[#0d1420] p-3"><div className="mb-1 flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold text-primary">{item.capability}</span><span className="rounded-full border border-border px-2 py-0.5 text-xs text-secondary">{item.provider}</span><span className="rounded-full border border-accent/30 px-2 py-0.5 text-xs text-accent">{item.status}</span></div><p className="text-sm text-secondary">{item.message}</p></div>)}</div></div>}
        </section>
      </div>
    </div>
  </AppShell>;
}
