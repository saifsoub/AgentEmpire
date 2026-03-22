import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui";
import { QuickCreate } from "@/components/quick-create";
import { getDb } from "@/lib/store";

export default async function DecisionsPage() {
  const db = await getDb();
  return (
    <AppShell title="Decisions" subtitle="Make high-stakes choices with clarity and documented reasoning.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {db.decisions.map(decision => (
            <SectionCard key={decision.id} title={decision.title} description={decision.context}>
              <div className="mt-2 text-sm font-medium text-accent">→ {decision.recommendedOption}</div>
              <p className="mt-2 text-sm text-secondary">{decision.reasoningSummary}</p>
              <div className="mt-4 flex items-center gap-3">
                <Badge>{decision.riskLevel} Risk</Badge>
                <span className="text-sm text-muted">Impact: {decision.impactScore}</span>
              </div>
            </SectionCard>
          ))}
        </div>
        <QuickCreate
          endpoint="/api/decisions"
          title="New decision"
          description="Document a strategic decision and get a recommendation."
          fields={[
            { name: "title", label: "Decision title", placeholder: "What should we launch first?" },
            { name: "context", label: "Context", type: "textarea", placeholder: "Describe the situation and constraints..." },
            { name: "options", label: "Options (comma-separated)", placeholder: "Option A, Option B, Option C" },
          ]}
        />
      </div>
    </AppShell>
  );
}
