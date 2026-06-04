import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/stat-card";
import { BarMeter } from "@/components/bar-meter";
import { AcademyAgentCard } from "@/components/academy-agent-card";
import { getAcademyAgents } from "@/lib/store";
import { getScoreTier } from "@/lib/scoring";
import type { AcademySchool } from "@/lib/types";

const SCHOOL_LABELS: Record<AcademySchool, string> = {
  executive_operations: "Executive Operations",
  social_media_performance: "Social Media Performance",
  business_development: "Business Development",
  creative_production: "Creative Production",
  technical_integrations: "Technical Integrations",
  strategy_performance: "Strategy & Performance",
};

const ALL_SCHOOLS = Object.keys(SCHOOL_LABELS) as AcademySchool[];

export default async function AcademyPage() {
  const agents = await getAcademyAgents();

  const active = agents.filter(a => ["performing", "featured"].includes(a.status)).length;
  const hireable = agents.filter(a => a.status === "hireable").length;
  const avgScore = agents.length
    ? Math.round(agents.reduce((s, a) => s + a.total_score, 0) / agents.length)
    : 0;
  const featured = [...agents].sort((a, b) => b.total_score - a.total_score)[0];

  const schoolCounts = ALL_SCHOOLS.map(school => ({
    school,
    label: SCHOOL_LABELS[school],
    count: agents.filter(a => a.school === school).length,
  }));

  return (
    <AppShell pathname="/academy" title="S/ Star Academy" subtitle="Train the agents. Hear the result. Reward the stars.">
      <div className="grid gap-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Stars" value={agents.length} footnote="Registered in the academy" />
          <StatCard label="Performing / Featured" value={active} footnote="Currently on stage" />
          <StatCard label="Hireable Stars" value={hireable} footnote="Ready for business deployment" />
          <StatCard label="Average Score" value={avgScore} footnote="Across all academy agents" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Featured Star */}
          {featured && (
            <div className="card p-6">
              <div className="mb-2 inline-flex rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                ★ Featured Star
              </div>
              <h2 className="mt-3 text-2xl font-bold text-primary">{featured.stage_name}</h2>
              <p className="mt-1 text-sm text-secondary">{featured.name} · {featured.real_role}</p>
              <p className="mt-3 text-sm text-secondary italic">&ldquo;{featured.motto}&rdquo;</p>
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-muted">Score</span>
                  <span className="font-semibold text-primary">
                    {featured.total_score} · {getScoreTier(featured.total_score).toUpperCase()}
                  </span>
                </div>
                <BarMeter value={featured.total_score} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {featured.skills.slice(0, 4).map(s => (
                  <span key={s} className="rounded-lg border border-border bg-[#182133] px-2 py-0.5 text-xs text-secondary">
                    {s}
                  </span>
                ))}
              </div>
              <Link
                href={`/academy/cast/${featured.id}`}
                className="mt-5 inline-flex rounded-2xl border border-border px-4 py-2 text-sm text-secondary hover:text-primary transition"
              >
                View full profile →
              </Link>
            </div>
          )}

          {/* School Breakdown */}
          <div className="card p-5">
            <h3 className="mb-4 text-lg font-semibold text-primary">Academy Schools</h3>
            <div className="space-y-3">
              {schoolCounts.map(({ school, label, count }) => (
                <div key={school}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-secondary">{label}</span>
                    <span className="text-primary">{count}</span>
                  </div>
                  <BarMeter value={count * 25} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission block */}
        <div className="card p-6">
          <div className="mb-2 inline-flex rounded-full border border-[#EB5815]/40 bg-[#EB5815]/10 px-3 py-1 text-xs font-semibold text-[#EB5815]">
            S/ AI Empowered · by Seif Alsoub
          </div>
          <h3 className="mt-3 text-xl font-bold text-primary">
            A university, talent show, marketplace, and AI employee training system for the agent economy.
          </h3>
          <p className="mt-3 text-sm text-secondary max-w-2xl">
            Agents do not just exist. They train, perform, improve, and earn their place.
            Each agent has a role, personality, skill set, memory, tools, performance score, and audience feedback loop.
          </p>
          <Link
            href="/academy/cast"
            className="mt-5 inline-flex rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            Meet the Cast →
          </Link>
        </div>

        {/* Top performers preview */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">Top Performers</h3>
            <Link href="/academy/cast" className="text-sm text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[...agents]
              .sort((a, b) => b.total_score - a.total_score)
              .slice(0, 3)
              .map(agent => (
                <AcademyAgentCard key={agent.id} agent={agent} />
              ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
