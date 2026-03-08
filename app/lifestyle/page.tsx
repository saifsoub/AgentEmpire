import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { QuickCreate } from "@/components/quick-create";
import { BarMeter } from "@/components/bar-meter";
import { EmptyState } from "@/components/empty-state";
import { getDb } from "@/lib/store";

export default async function LifestylePage() {
  const db = await getDb();

  return (
    <AppShell
      pathname="/lifestyle"
      title="Lifestyle OS"
      subtitle="Track and optimise lifestyle ROI across key categories"
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          {db.lifestyle.length === 0 ? (
            <EmptyState
              title="No lifestyle items yet"
              description="Start tracking what matters most to your wellbeing and performance."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {db.lifestyle.map((item) => (
                <SectionCard key={item.id} title={item.title} description={item.category}>
                  {item.note && <p className="mb-3 text-sm text-secondary">{item.note}</p>}
                  <div className="flex items-center justify-between text-xs text-muted mb-1">
                    <span>ROI Score</span>
                    <span>{item.roi} / 100</span>
                  </div>
                  <BarMeter value={item.roi} />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted">{item.status}</span>
                  </div>
                </SectionCard>
              ))}
            </div>
          )}
        </div>

        <QuickCreate
          endpoint="/api/lifestyle"
          title="Add lifestyle item"
          description="Track an element of your lifestyle and its ROI to your empire."
          fields={[
            { name: "title", label: "Title", placeholder: "Daily deep work sessions", required: true },
            { name: "category", label: "Category", placeholder: "Health / Focus / Energy / Social" },
            { name: "roi", label: "ROI score (0–100)", type: "number", placeholder: "80" },
            { name: "note", label: "Note", type: "textarea", placeholder: "Why does this matter to your empire?" },
          ]}
        />
      </div>
    </AppShell>
  );
}
