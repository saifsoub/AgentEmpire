"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AcademyAgentCard } from "@/components/academy-agent-card";
import type { StarAcademyAgent, AcademySchool, AcademyStatus } from "@/lib/types";

const SCHOOL_OPTIONS: { value: AcademySchool | "all"; label: string }[] = [
  { value: "all", label: "All Schools" },
  { value: "executive_operations", label: "Executive Ops" },
  { value: "social_media_performance", label: "Social Media" },
  { value: "business_development", label: "Business Dev" },
  { value: "creative_production", label: "Creative" },
  { value: "technical_integrations", label: "Technical" },
  { value: "strategy_performance", label: "Strategy" },
];

const STATUS_OPTIONS: { value: AcademyStatus | "all"; label: string }[] = [
  { value: "all", label: "All Stages" },
  { value: "auditioning", label: "Auditioning" },
  { value: "training", label: "Training" },
  { value: "performing", label: "Performing" },
  { value: "featured", label: "Featured" },
  { value: "hireable", label: "Hireable" },
  { value: "graduated", label: "Graduated" },
];

export default function CastPage() {
  const [agents, setAgents] = useState<StarAcademyAgent[]>([]);
  const [school, setSchool] = useState<AcademySchool | "all">("all");
  const [status, setStatus] = useState<AcademyStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/agents")
      .then(r => r.json())
      .then(d => { if (d.ok) setAgents(d.agents); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = agents.filter(a => {
    if (school !== "all" && a.school !== school) return false;
    if (status !== "all" && a.status !== status) return false;
    return true;
  });

  return (
    <AppShell pathname="/academy/cast" title="Agent Cast" subtitle="The founding stars of S/ Star Academy.">
      <div className="grid gap-6">
        {/* Filters */}
        <div className="card p-4">
          <div className="mb-3 text-xs font-semibold uppercase text-muted">Filter by School</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {SCHOOL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSchool(opt.value as AcademySchool | "all")}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  school === opt.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-secondary hover:text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mb-3 text-xs font-semibold uppercase text-muted">Filter by Stage</div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value as AcademyStatus | "all")}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  status === opt.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-secondary hover:text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">
            {loading ? "Loading..." : `${filtered.length} agent${filtered.length !== 1 ? "s" : ""}`}
          </div>
          {(school !== "all" || status !== "all") && (
            <button
              onClick={() => { setSchool("all"); setStatus("all"); }}
              className="text-xs text-muted hover:text-secondary transition"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Agent grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-96 animate-pulse bg-[#182133]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-secondary">No agents match your filters.</p>
            <button
              onClick={() => { setSchool("all"); setStatus("all"); }}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(agent => (
              <AcademyAgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
