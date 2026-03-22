"use client";
import { useState } from "react";
import { Zap, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { SuperpowersResult } from "@/app/api/superpowers/route";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-surface2 ${className ?? ""}`} />;
}

function LoadingState() {
  return (
    <div className="grid gap-6">
      <div className="card border-accent/20 p-6">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0,1,2].map(i => <div key={i} className="card p-5"><Skeleton className="mb-3 h-4 w-24" /><Skeleton className="h-3 w-full" /><Skeleton className="mt-2 h-3 w-4/5" /></div>)}
      </div>
      <div className="card p-5">
        <Skeleton className="mb-4 h-4 w-28" />
        {[0,1,2].map(i => <Skeleton key={i} className="mb-3 h-3 w-full" />)}
      </div>
      <div className="card p-5">
        <Skeleton className="mb-4 h-4 w-28" />
        {[0,1,2,3,4].map(i => <Skeleton key={i} className="mb-3 h-3 w-full" />)}
      </div>
    </div>
  );
}

export function SuperpowersClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuperpowersResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    setChecked(new Set());
    try {
      const res = await fetch("/api/superpowers", { method: "POST" });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json() as SuperpowersResult;
      setResult(data);
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleCheck(i: number) {
    setChecked(prev => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
  }

  const severityColor = { HIGH: "text-red-400 border-red-400/30 bg-red-400/10", MEDIUM: "text-amber-400 border-amber-400/30 bg-amber-400/10", LOW: "text-blue-400 border-blue-400/30 bg-blue-400/10" };
  const impactColor = { HIGH: "text-accent border-accent/30 bg-accent/10", MEDIUM: "text-blue-400 border-blue-400/30 bg-blue-400/10" };

  return (
    <div className="space-y-8">
      {/* Hero CTA */}
      <div className="card border-accent/20 bg-gradient-to-br from-surface to-[#1a2035] p-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">AI Intelligence Engine</span>
            </div>
            <h2 className="text-2xl font-semibold text-primary">Activate Superpowers</h2>
            <p className="mt-1 max-w-lg text-sm text-secondary">
              Claude analyzes every dimension of your empire — opportunities, offers, content, assets, and tasks — then delivers precision-targeted strategic intelligence.
            </p>
          </div>
          <button
            onClick={analyze}
            disabled={loading}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? "Analyzing empire..." : "Run analysis"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">{error}</div>
      )}

      {loading && <LoadingState />}

      {result && (
        <div className="grid gap-6">
          {/* Empire Pulse */}
          <div className="card border-accent/30 bg-gradient-to-br from-accent/5 to-surface p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">Empire Pulse</span>
            </div>
            <p className="text-base leading-relaxed text-primary">{result.pulse}</p>
          </div>

          {/* Top Strategic Moves */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted">Top Strategic Moves</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {result.topMoves.map((move, i) => (
                <div key={i} className="card p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-primary leading-tight">{move.title}</div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${impactColor[move.impact]}`}>{move.impact}</span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">{move.reasoning}</p>
                  <div className="mt-3 text-xs text-muted">#{i + 1} priority</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Radar */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-secondary" />
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted">Risk Radar</h3>
            </div>
            <div className="space-y-3">
              {result.risks.map((risk, i) => (
                <div key={i} className={`rounded-2xl border p-4 ${severityColor[risk.severity]}`}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-xs font-bold uppercase">{risk.severity}</span>
                    <div>
                      <div className="font-semibold text-sm">{risk.title}</div>
                      <div className="mt-0.5 text-sm opacity-80">{risk.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Power Actions */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted">Power Actions This Week</h3>
            </div>
            <div className="card divide-y divide-border/50">
              {result.powerActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-surface2/50"
                >
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${checked.has(i) ? "border-accent bg-accent" : "border-border"}`}>
                    {checked.has(i) && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-sm transition ${checked.has(i) ? "text-muted line-through" : "text-primary"}`}>{action}</span>
                </button>
              ))}
            </div>
            {checked.size > 0 && (
              <p className="mt-2 text-right text-xs text-muted">{checked.size} of {result.powerActions.length} actions done</p>
            )}
          </div>

          {/* Re-analyze */}
          <div className="flex justify-center">
            <button
              onClick={analyze}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm text-secondary transition hover:border-accent/40 hover:text-primary"
            >
              <Zap className="h-3.5 w-3.5" />
              Re-analyze empire
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
