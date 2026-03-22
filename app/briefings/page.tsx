import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { RefreshBriefButton } from "@/components/refresh-brief";
import { getDb } from "@/lib/store";

export default async function BriefingsPage() {
  const db = await getDb();
  const latest = db.briefings[0];
  return (
    <AppShell title="Briefings" subtitle="Your weekly strategic brief — focus, moves, and risks." actions={<RefreshBriefButton />}>
      <div className="grid gap-6">
        {latest && (
          <>
            <SectionCard title={`Week of ${latest.weekStart}`} description={latest.weekObjective}>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wide text-muted">Top Moves</div>
                  <ul className="space-y-2">
                    {latest.topMoves.map((move, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                        <span className="text-accent">→</span>{move}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wide text-muted">Risks</div>
                  <ul className="space-y-2">
                    {latest.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                        <span className="text-red-400">!</span>{risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wide text-muted">Focus Areas</div>
                  <div className="flex flex-wrap gap-2">
                    {latest.focusAreas.map((area, i) => (
                      <span key={i} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">{area}</span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted italic">{latest.reviewNotes}</p>
                </div>
              </div>
            </SectionCard>
          </>
        )}
        {db.briefings.slice(1).map(brief => (
          <SectionCard key={brief.id} title={`Week of ${brief.weekStart}`} description={brief.weekObjective}>
            <p className="text-sm text-muted">{brief.reviewNotes}</p>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}
