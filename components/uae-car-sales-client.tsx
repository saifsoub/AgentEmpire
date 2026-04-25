"use client";
import { useState } from "react";
import { Car, Loader2, CheckCircle2, ChevronRight, TrendingUp, AlertCircle, Tag } from "lucide-react";
import type { CarInput, CarAgentResult, AgentStep } from "@/app/api/agent/uae-car-sales/route";

const inputCls = "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/40";
const selectCls = inputCls;

const STEP_LABELS: Record<string, string> = {
  score_vehicle: "Scoring vehicle",
  build_comparables: "Building comparables",
  calculate_price_range: "Calculating price range",
  create_listing: "Creating listing",
};

function StepLog({ steps }: { steps: AgentStep[] }) {
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
          {s.type === "message" && <Car className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />}
          <div>
            {s.name && (
              <span className={`mr-2 text-xs font-semibold uppercase tracking-wider ${s.type === "tool_call" ? "text-accent" : "text-green-400"}`}>
                {s.type === "tool_call" ? STEP_LABELS[s.name] ?? s.name : `${STEP_LABELS[s.name] ?? s.name} done`}
              </span>
            )}
            <span className="text-secondary break-all">{s.type === "tool_call" || s.type === "tool_result" ? "" : s.content}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const confColor = { High: "text-green-400 border-green-400/30 bg-green-400/10", Medium: "text-amber-400 border-amber-400/30 bg-amber-400/10", Low: "text-red-400 border-red-400/30 bg-red-400/10" };

export function UaeCarSalesClient() {
  const [form, setForm] = useState<CarInput>({
    make: "", model: "", year: 2022, trim: "", mileage: 50000,
    spec: "GCC", serviceHistory: "Full Agency", condition: "Good", askingPrice: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CarAgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CarInput>(k: K, v: CarInput[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function runAgent() {
    if (!form.make || !form.model || !form.trim) { setError("Please fill in make, model, and trim."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/agent/uae-car-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Agent failed");
      setResult(await res.json() as CarAgentResult);
    } catch {
      setError("Agent run failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Input form */}
      <div className="card border-accent/20 bg-gradient-to-br from-surface to-[#1a2035] p-8">
        <div className="mb-6 flex items-center gap-2">
          <Car className="h-5 w-5 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Vehicle Details</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Make</label>
            <input className={inputCls} placeholder="Toyota" value={form.make} onChange={e => set("make", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Model</label>
            <input className={inputCls} placeholder="Land Cruiser" value={form.model} onChange={e => set("model", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Trim</label>
            <input className={inputCls} placeholder="VXR" value={form.trim} onChange={e => set("trim", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Year</label>
            <input type="number" className={inputCls} value={form.year} onChange={e => set("year", parseInt(e.target.value))} min={2005} max={2025} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Mileage (km)</label>
            <input type="number" className={inputCls} value={form.mileage} onChange={e => set("mileage", parseInt(e.target.value))} step={1000} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Asking Price (AED, optional)</label>
            <input type="number" className={inputCls} placeholder="Leave blank if unknown" value={form.askingPrice ?? ""} onChange={e => set("askingPrice", e.target.value ? parseInt(e.target.value) : undefined)} step={1000} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Spec</label>
            <select className={selectCls} value={form.spec} onChange={e => set("spec", e.target.value as CarInput["spec"])}>
              <option>GCC</option>
              <option>Non-GCC</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Service History</label>
            <select className={selectCls} value={form.serviceHistory} onChange={e => set("serviceHistory", e.target.value as CarInput["serviceHistory"])}>
              <option>Full Agency</option>
              <option>Partial</option>
              <option>None</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">Condition</label>
            <select className={selectCls} value={form.condition} onChange={e => set("condition", e.target.value as CarInput["condition"])}>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div className="ml-auto">
            <button
              onClick={runAgent}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Car className="h-4 w-4" />}
              {loading ? "Agent running..." : "Run pricing agent"}
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
              <Loader2 className="h-4 w-4 animate-spin" /> Running UAE market analysis...
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="grid gap-6">
          {/* Price recommendation */}
          <div className="card border-accent/30 bg-gradient-to-br from-accent/5 to-surface p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-accent" />
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">Price Recommendation</span>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${confColor[result.confidence as keyof typeof confColor]}`}>
                {result.confidence} confidence
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface2 p-4 text-center">
                <div className="text-xs text-muted mb-1">Floor</div>
                <div className="text-2xl font-bold text-primary">AED {result.priceMin.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-center">
                <div className="text-xs text-accent mb-1">Recommended</div>
                <div className="text-3xl font-bold text-accent">AED {result.recommended.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface2 p-4 text-center">
                <div className="text-xs text-muted mb-1">Ceiling</div>
                <div className="text-2xl font-bold text-primary">AED {result.priceMax.toLocaleString()}</div>
              </div>
            </div>
            {result.summary && (
              <p className="mt-4 text-sm leading-relaxed text-secondary">{result.summary}</p>
            )}
          </div>

          {/* Highlights & market notes */}
          <div className="grid gap-4 md:grid-cols-2">
            {result.highlights.length > 0 && (
              <div className="card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted">Vehicle Highlights</span>
                </div>
                <ul className="space-y-2">
                  {result.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-secondary">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />{h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.marketNotes.length > 0 && (
              <div className="card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-secondary" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted">UAE Market Notes</span>
                </div>
                <ul className="space-y-2">
                  {result.marketNotes.map((n, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />{n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Listing created */}
          {result.listingId && result.listingId !== "unknown" && result.listingId !== "mock_listing" && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-400/30 bg-green-400/10 px-5 py-4 text-sm text-green-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Listing created in your offers — <span className="font-mono text-xs">{result.listingId}</span></span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={runAgent}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm text-secondary transition hover:border-accent/40 hover:text-primary"
            >
              <Car className="h-3.5 w-3.5" /> Re-run agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
