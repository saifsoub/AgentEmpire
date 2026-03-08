import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/stat-card";
import { BarMeter } from "@/components/bar-meter";
import { SectionCard } from "@/components/section-card";
import { getDashboardSummary } from "@/lib/store";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  const scoreBreakdown = [
    { label: "Revenue", value: summary.revenueScore },
    { label: "Brand", value: summary.brandScore },
    { label: "Assets", value: summary.assetScore },
    { label: "Decisions", value: summary.decisionScore },
    { label: "Execution", value: summary.executionScore },
    { label: "Lifestyle", value: summary.lifestyleAlignmentScore },
  ];

  return (
    <AppShell
      pathname="/dashboard"
      title="Dashboard"
      subtitle="Your empire at a glance"
    >
      {/* Empire Score Hero */}
      <div className="mb-6 rounded-[1.25rem] border border-border bg-gradient-to-br from-surface to-surface2 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-secondary">Overall Empire Score</p>
            <p className="mt-1 text-6xl font-bold text-primary">{summary.empireScore}</p>
            <p className="mt-2 text-sm text-muted">/ 100 — updated in real time</p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-semibold text-primary">{summary.liveOffers}</p>
              <p className="text-xs text-secondary">Live Offers</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">{summary.monetizedAssets}</p>
              <p className="text-xs text-secondary">Monetized Assets</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">{summary.topOpportunities.length}</p>
              <p className="text-xs text-secondary">Top Opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {scoreBreakdown.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            footnote={
              <div className="mt-2">
                <BarMeter value={item.value} />
              </div>
            }
          />
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Top Opportunities */}
        <SectionCard title="Top Opportunities" description="Ranked by total score">
          {summary.topOpportunities.length === 0 ? (
            <p className="text-sm text-secondary">No opportunities yet.</p>
          ) : (
            <ul className="space-y-3">
              {summary.topOpportunities.map((opp) => (
                <li key={opp.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">{opp.title}</p>
                    <p className="text-xs text-muted">{opp.type}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                    {opp.totalScore}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Weekly Focus */}
        <SectionCard title="Weekly Focus" description="This week's strategic priorities">
          {summary.weeklyFocus.length === 0 ? (
            <p className="text-sm text-secondary">
              No briefing yet.{" "}
              <a href="/briefings" className="text-accent underline underline-offset-2">
                Generate one →
              </a>
            </p>
          ) : (
            <ol className="list-decimal space-y-2 pl-5">
              {summary.weeklyFocus.map((move, i) => (
                <li key={i} className="text-sm text-secondary">
                  {move}
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
