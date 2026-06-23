"use client";
import { useState } from "react";
import Link from "next/link";
import { Bot, Play, Loader2, CheckCircle2, ChevronRight, ArrowLeft, Wrench, AlertCircle } from "lucide-react";
import type { AgentConfig, AgentRunResult, AgentRunStep } from "@/lib/types";

const inputCls = "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/40";
const selectCls = inputCls;
const textareaCls = `${inputCls} min-h-[80px] resize-y`;

function StepLog({ steps }: { steps: AgentRunStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
          s.type === "tool_call" ? "bg-accent/10 border border-accent/20" :
          s.type === "tool_result" ? "bg-surface2 border border-border" :
          "bg-surface border border-border/50"
        }`}>
          {s.type === "tool_call" && <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
          {s.type === "tool_result" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />}
          {s.type === "message" && <Bot className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />}
          <div className="min-w-0 flex-1">
            {s.name && (
              <span className={`mr-2 text-xs font-semibold uppercase tracking-wider ${s.type === "tool_call" ? "text-accent" : "text-green-400"}`}>
                {s.type === "tool_call" ? `Calling ${s.name}` : `${s.name} done`}
              </span>
            )}
            {s.type === "message" && <span className="text-secondary whitespace-pre-wrap">{s.content}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentRunnerClient({ agent }: { agent: AgentConfig }) {
  const [form, setForm] = useState<Record<string, string | number>>(() => {
    const init: Record<string, string | number> = {};
    for (const f of agent.inputFields) {
      init[f.key] = f.type === "number" ? 0 : (f.options?.[0] ?? "");
    }
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(key: string, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function runAgent() {
    for (const f of agent.inputFields) {
      if (f.required && !form[f.key]) {
        setError(`${f.label} is required`);
        return;
      }
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, input: form }),
      });
      if (!res.ok) throw new Error("Agent run failed");
      setResult(await res.json() as AgentRunResult);
    } catch {
      setError("Agent run failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link href="/agents" className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition">
        <ArrowLeft className="h-4 w-4" /> Back to Agents
      </Link>

      {/* Agent info */}
      <div className="card border-accent/20 bg-gradient-to-br from-surface to-[#1a2035] p-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">{agent.name}</div>
            <div className="text-xs text-muted">{agent.category} • {agent.tools.length} tool{agent.tools.length !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <p className="text-sm text-secondary">{agent.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {agent.tools.map((t, i) => (
            <span key={i} className="flex items-center gap-1 rounded-lg border border-border bg-surface2 px-2.5 py-1 text-xs text-secondary">
              <Wrench className="h-3 w-3 text-muted" /> {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Input form */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Input</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {agent.inputFields.map(field => (
            <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
              <label className="mb-1 block text-xs font-medium text-secondary">
                {field.label} {field.required && <span className="text-accent">*</span>}
              </label>
              {field.type === "text" && (
                <input className={inputCls} placeholder={field.placeholder} value={form[field.key] ?? ""} onChange={e => set(field.key, e.target.value)} />
              )}
              {field.type === "number" && (
                <input type="number" className={inputCls} placeholder={field.placeholder} value={form[field.key] ?? 0} onChange={e => set(field.key, parseInt(e.target.value) || 0)} />
              )}
              {field.type === "textarea" && (
                <textarea className={textareaCls} placeholder={field.placeholder} value={form[field.key] ?? ""} onChange={e => set(field.key, e.target.value)} />
              )}
              {field.type === "select" && (
                <select className={selectCls} value={form[field.key] ?? ""} onChange={e => set(field.key, e.target.value)}>
                  {(field.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div className="ml-auto">
            <button onClick={runAgent} disabled={loading} className="flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {loading ? "Running..." : "Run Agent"}
            </button>
          </div>
        </div>
      </div>

      {/* Agent trace */}
      {(loading || (result && result.steps.length > 0)) && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">Agent Trace</span>
            {loading && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
          </div>
          {result && <StepLog steps={result.steps} />}
          {loading && (
            <div className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" /> Running {agent.name}...
            </div>
          )}
        </div>
      )}

      {/* Output */}
      {result && result.output && (
        <div className="card border-accent/30 bg-gradient-to-br from-accent/5 to-surface p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-green-400">Agent Output</span>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-secondary">{result.output}</div>
        </div>
      )}

      {result && (
        <div className="flex justify-end">
          <button onClick={runAgent} disabled={loading} className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm text-secondary transition hover:border-accent/40 hover:text-primary">
            <Play className="h-3.5 w-3.5" /> Re-run agent
          </button>
        </div>
      )}
    </div>
  );
}
