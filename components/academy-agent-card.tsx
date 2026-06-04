import Link from "next/link";
import { BarMeter } from "@/components/bar-meter";
import { getScoreTier } from "@/lib/scoring";
import type { StarAcademyAgent, AcademySchool, AcademyStatus } from "@/lib/types";

const SCHOOL_LABELS: Record<AcademySchool, string> = {
  executive_operations: "Executive Operations",
  social_media_performance: "Social Media",
  business_development: "Business Dev",
  creative_production: "Creative Production",
  technical_integrations: "Technical",
  strategy_performance: "Strategy",
};

const SCHOOL_COLORS: Record<AcademySchool, string> = {
  executive_operations: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  social_media_performance: "border-pink-400/40 bg-pink-400/10 text-pink-300",
  business_development: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  creative_production: "border-purple-400/40 bg-purple-400/10 text-purple-300",
  technical_integrations: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  strategy_performance: "border-orange-400/40 bg-orange-400/10 text-orange-300",
};

const STATUS_COLORS: Record<AcademyStatus, string> = {
  auditioning: "border-zinc-400/40 bg-zinc-400/10 text-zinc-300",
  training: "border-blue-400/40 bg-blue-400/10 text-blue-300",
  performing: "border-[#EB5815]/40 bg-[#EB5815]/10 text-[#EB5815]",
  featured: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
  hireable: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  graduated: "border-violet-400/40 bg-violet-400/10 text-violet-300",
};

const TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  star: "Star",
};

const TIER_COLORS: Record<string, string> = {
  bronze: "text-orange-400",
  silver: "text-slate-300",
  gold: "text-yellow-300",
  platinum: "text-cyan-300",
  star: "text-pink-300",
};

const SCORE_CRITERIA = [
  { key: "usefulness" as const, label: "Usefulness", weight: 25 },
  { key: "clarity" as const, label: "Clarity", weight: 15 },
  { key: "accuracy" as const, label: "Accuracy", weight: 20 },
  { key: "personality_fit" as const, label: "Personality", weight: 10 },
  { key: "execution_speed" as const, label: "Speed", weight: 10 },
  { key: "business_value" as const, label: "Biz Value", weight: 15 },
  { key: "delight_factor" as const, label: "Delight", weight: 5 },
];

export function AcademyAgentCard({ agent }: { agent: StarAcademyAgent }) {
  const tier = getScoreTier(agent.total_score);

  return (
    <div className="card flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-primary leading-tight">{agent.stage_name}</div>
          <div className="mt-0.5 text-sm text-muted">{agent.name}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[agent.status]}`}>
            {agent.status}
          </span>
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${SCHOOL_COLORS[agent.school]}`}>
            {SCHOOL_LABELS[agent.school]}
          </span>
        </div>
      </div>

      {/* Role + personality */}
      <div>
        <div className="text-sm font-medium text-primary">{agent.real_role}</div>
        <p className="mt-1 text-xs text-secondary line-clamp-2">{agent.personality}</p>
      </div>

      {/* Score */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-muted">Performance Score</span>
          <span className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${TIER_COLORS[tier]}`}>{TIER_LABELS[tier]}</span>
            <span className="text-sm font-semibold text-primary">{agent.total_score}</span>
          </span>
        </div>
        <BarMeter value={agent.total_score} />
      </div>

      {/* Score breakdown */}
      <div className="space-y-1.5">
        {SCORE_CRITERIA.map(c => (
          <div key={c.key} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-[10px] text-muted">{c.label}</span>
            <div className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-[#1b2538]">
                <div
                  className="h-1.5 rounded-full bg-accent/70"
                  style={{ width: `${Math.min(100, agent.scores[c.key])}%` }}
                />
              </div>
            </div>
            <span className="w-7 text-right text-[10px] text-secondary">{agent.scores[c.key]}</span>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {agent.skills.slice(0, 3).map(s => (
          <span key={s} className="rounded-lg border border-border bg-[#182133] px-2 py-0.5 text-[10px] text-secondary">
            {s}
          </span>
        ))}
        {agent.skills.length > 3 && (
          <span className="rounded-lg border border-border bg-[#182133] px-2 py-0.5 text-[10px] text-muted">
            +{agent.skills.length - 3}
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="space-y-1">
        {agent.kpis.slice(0, 2).map(kpi => (
          <div key={kpi} className="flex items-start gap-2 text-xs text-secondary">
            <span className="mt-0.5 text-accent shrink-0">→</span>
            <span>{kpi}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <div className="text-xs text-muted">
          ★ {agent.ratings.user.toFixed(1)} user · {agent.ratings.evaluator.toFixed(1)} jury
        </div>
        <Link
          href={`/academy/cast/${agent.id}`}
          className="rounded-xl border border-border px-3 py-1 text-xs text-secondary hover:text-primary transition"
        >
          Profile →
        </Link>
      </div>
    </div>
  );
}
