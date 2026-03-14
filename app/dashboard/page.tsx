import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/stat-card";
import { getDashboardSummary } from "@/lib/store";
import { BarMeter } from "@/components/bar-meter";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const pillars = [
    { label: "Revenue", value: summary.revenueScore },
    { label: "Brand", value: summary.brandScore },
    { label: "Assets", value: summary.assetScore },
    { label: "Decisions", value: summary.decisionScore },
    { label: "Execution", value: summary.executionScore },
    { label: "Lifestyle", value: summary.lifestyleAlignmentScore },
  ];
  return (
    <AppShell title="Dashboard" subtitle="Empire health at a glance.">
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Empire Score" value={`${summary.empireScore}/100`} footnote="Weighted composite score" />
          <StatCard label="Live Offers" value={summary.liveOffers} footnote="Active products in market" />
          <StatCard label="Monetized Assets" value={summary.monetizedAssets} footnote="Revenue-generating IP" />
        </div>
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-semibold text-primary">Pillar Breakdown</h3>
          <div className="space-y-4">
            {pillars.map((p) => (
              <div key={p.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-secondary">{p.label}</span>
                  <span className="text-primary">{p.value}</span>
                </div>
                <BarMeter value={p.value} />
              </div>
            ))}
          </div>
        </div>
        {summary.weeklyFocus.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-4 text-lg font-semibold text-primary">This Week&apos;s Focus</h3>
            <ul className="space-y-2">
              {summary.weeklyFocus.map((move, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
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
