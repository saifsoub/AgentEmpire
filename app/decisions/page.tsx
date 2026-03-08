import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { QuickCreate } from "@/components/quick-create";
import { Badge } from "@/components/ui";
import { BarMeter } from "@/components/bar-meter";
import { EmptyState } from "@/components/empty-state";
import { getDb } from "@/lib/store";

const riskColor: Record<string, string> = {
  Low: "border-green-500/30 bg-green-500/10 text-green-400",
  Medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  High: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default async function DecisionsPage() {
  const db = await getDb();

  return (
    <AppShell
      pathname="/decisions"
      title="Decisions"
      subtitle="Strategic decision analysis and recommendations"
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          {db.decisions.length === 0 ? (
            <EmptyState
              title="No decisions yet"
              description="Log a strategic decision to get an AI-powered recommendation."
            />
          ) : (
            <div className="space-y-4">
              {db.decisions.map((decision) => (
                <SectionCard key={decision.id} title={decision.title}>
                  <p className="text-sm text-secondary">{decision.context}</p>
                  <div className="mt-4 rounded-xl bg-surface2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Recommended Option
                    </p>
                    <p className="mt-1 text-sm font-medium text-primary">{decision.recommendedOption}</p>
                    <p className="mt-2 text-sm text-secondary">{decision.reasoningSummary}</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 text-xs text-muted">Impact Score</p>
                      <BarMeter value={decision.impactScore} />
                      <p className="mt-1 text-xs text-secondary">{decision.impactScore} / 100</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-muted">Reversibility</p>
                      <BarMeter value={decision.reversibilityScore} />
                      <p className="mt-1 text-xs text-secondary">{decision.reversibilityScore} / 100</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Badge className={riskColor[decision.riskLevel] ?? ""}>{decision.riskLevel} Risk</Badge>
                    <Badge>{decision.status}</Badge>
                  </div>
                  {decision.options.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted">All options considered:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {decision.options.map((opt, i) => (
                          <span key={i} className="rounded-lg border border-border bg-surface2 px-2 py-1 text-xs text-secondary">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>
              ))}
            </div>
          )}
        </div>

        <QuickCreate
          endpoint="/api/decisions"
          title="Analyse decision"
          description="Submit a strategic decision for AI-powered analysis."
          fields={[
            { name: "title", label: "Decision title", placeholder: "Should I launch the AI toolkit now?", required: true },
            { name: "context", label: "Context", type: "textarea", placeholder: "Describe the situation and constraints (min 10 chars)", required: true },
            { name: "options", label: "Options (comma-separated)", placeholder: "Launch now, Wait 2 weeks, Partner first", required: true },
          ]}
        />
      </div>
    </AppShell>
  );
}
