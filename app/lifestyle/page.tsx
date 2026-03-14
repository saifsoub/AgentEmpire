import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/stat-card";
import { SectionCard } from "@/components/section-card";
import { BarMeter } from "@/components/bar-meter";
import { getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LifestylePage() {
  const db = await getDb();
  return (
    <AppShell title="Lifestyle OS" subtitle="Design a life that compounds value and freedom.">
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {db.lifestyle.map((item) => (
            <StatCard key={item.id} label={item.category} value={`${item.roi}%`} footnote={item.title} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {db.lifestyle.map((item) => (
            <SectionCard key={item.id} title={item.title} description={item.category}>
              <p className="text-sm text-secondary">{item.note}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted">ROI Score</span>
                  <span className="text-primary">{item.roi}</span>
                </div>
                <BarMeter value={item.roi} />
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
