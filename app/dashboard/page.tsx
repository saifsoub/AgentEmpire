import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/stat-card";
import { BarMeter } from "@/components/bar-meter";
import { getDashboardSummary } from "@/lib/store";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  return (
    <AppShell title="Dashboard" subtitle="Your empire at a glance.">
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Empire Score" value={summary.empireScore} footnote="Overall health across 6 dimensions" />
          <StatCard label="Live Offers" value={summary.liveOffers} footnote="Active revenue vehicles" />
          <StatCard label="Monetized Assets" value={summary.monetizedAssets} footnote="IP generating returns" />
        </div>
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-semibold text-primary">Score Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: "Revenue", value: summary.revenueScore },
              { label: "Brand", value: summary.brandScore },
              { label: "Assets", value: summary.assetScore },
              { label: "Decisions", value: summary.decisionScore },
              { label: "Execution", value: summary.executionScore },
              { label: "Lifestyle", value: summary.lifestyleAlignmentScore },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-secondary">{label}</span>
                  <span className="text-primary">{value}</span>
                </div>
                <BarMeter value={value} />
              </div>
            ))}
          </div>
        </div>
        {summary.weeklyFocus.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-4 text-lg font-semibold text-primary">Weekly Focus</h3>
            <ul className="space-y-2">
              {summary.weeklyFocus.map((move, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-secondary">
                  <span className="mt-0.5 text-accent">→</span>
                  {move}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
