import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { QuickCreate } from "@/components/quick-create";
import { getDb } from "@/lib/store";

export default async function DecisionsPage() {
  const db = await getDb();
  return (
    <AppShell pathname="/decisions" title="Decision Engine" subtitle="Analyze options and commit with clarity.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {db.decisions.map((d) => (
            <SectionCard key={d.id} title={d.title} description={`Risk: ${d.riskLevel} • Impact: ${d.impactScore}`}>
              <p className="text-sm text-secondary">{d.reasoningSummary}</p>
              <div className="mt-3 text-sm text-accent">✓ {d.recommendedOption}</div>
            </SectionCard>
          ))}
        </div>
        <QuickCreate
          endpoint="/api/decisions"
          title="Analyze decision"
          description="Define a decision and get a strategic recommendation."
          fields={[
            { name: "title", label: "Decision title", placeholder: "What should be monetized first?" },
            { name: "context", label: "Context", type: "textarea", placeholder: "Describe the situation and constraints." },
            { name: "options", label: "Options (comma-separated)", placeholder: "Executive diagnostic, Digital toolkit, SaaS waitlist" },
          ]}
        />
      </div>
    </AppShell>
  );
}
