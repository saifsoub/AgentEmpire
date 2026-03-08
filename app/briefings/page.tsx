import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { RefreshBriefButton } from "@/components/refresh-brief";
import { Badge } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import { fullDate } from "@/lib/utils";
import { getDb } from "@/lib/store";

export default async function BriefingsPage() {
  const db = await getDb();
  const [latest, ...archived] = db.briefings;

  return (
    <AppShell
      pathname="/briefings"
      title="Weekly Briefings"
      subtitle="Strategic weekly focus generated from your empire data"
      actions={<RefreshBriefButton />}
    >
      {!latest ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <EmptyState
            title="No briefings yet"
            description="Generate your first weekly brief to get strategic priorities."
          />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* Latest Briefing */}
          <div className="space-y-4">
            <SectionCard
              title={`Week of ${fullDate(latest.weekStart)}`}
              description={latest.weekObjective}
            >
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-primary">Top Moves</h4>
                  <ol className="list-decimal space-y-2 pl-4">
                    {latest.topMoves.map((move, i) => (
                      <li key={i} className="text-sm text-secondary">{move}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-primary">Risks to Manage</h4>
                  <ul className="space-y-2">
                    {latest.risks.map((risk, i) => (
                      <li key={i} className="text-sm text-secondary">⚠ {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-semibold text-primary">Focus Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {latest.focusAreas.map((area) => (
                    <Badge key={area}>{area}</Badge>
                  ))}
                </div>
              </div>
              {latest.reviewNotes && (
                <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <p className="text-sm text-secondary italic">&ldquo;{latest.reviewNotes}&rdquo;</p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Archived briefings */}
          {archived.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted">Previous Briefings</h3>
              <div className="space-y-3">
                {archived.map((brief) => (
                  <div key={brief.id} className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm font-medium text-primary">Week of {fullDate(brief.weekStart)}</p>
                    <p className="mt-1 text-xs text-secondary line-clamp-2">{brief.weekObjective}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
