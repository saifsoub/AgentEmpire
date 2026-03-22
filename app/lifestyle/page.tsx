import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { BarMeter } from "@/components/bar-meter";
import { getDb } from "@/lib/store";

export default async function LifestylePage() {
  const db = await getDb();
  return (
    <AppShell pathname="/lifestyle" title="Lifestyle" subtitle="Design your environment for peak output and compounding returns.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {db.lifestyle.map(item => (
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
    </AppShell>
  );
}
