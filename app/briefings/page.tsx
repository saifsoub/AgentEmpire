import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { RefreshBriefButton } from "@/components/refresh-brief";
import { getDb } from "@/lib/store";
import { shortDate } from "@/lib/utils";

export default async function BriefingsPage() {
  const db = await getDb();
  const latest = db.briefings[0];
  return (
    <AppShell
      pathname="/briefings"
      title="Weekly Briefings"
      subtitle="Strategic focus and direction for the week ahead."
      actions={<RefreshBriefButton />}
    >
      <div className="grid gap-6">
        {latest && (
          <SectionCard title={`Week of ${shortDate(latest.weekStart)}`} description={latest.weekObjective}>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-muted">Top Moves</div>
                <ul className="space-y-1">
                  {latest.topMoves.map((m, i) => (
                    <li key={i} className="text-sm text-secondary">{m}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-muted">Risks</div>
                <ul className="space-y-1">
                  {latest.risks.map((r, i) => (
                    <li key={i} className="text-sm text-secondary">{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-muted">Focus Areas</div>
                <ul className="space-y-1">
                  {latest.focusAreas.map((f, i) => (
                    <li key={i} className="text-sm text-accent">{f}</li>
                  ))}
                </ul>
              </div>
            </div>
            {latest.reviewNotes && (
              <p className="mt-4 text-sm italic text-muted">{latest.reviewNotes}</p>
            )}
          </SectionCard>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {db.briefings.slice(1).map((b) => (
            <SectionCard key={b.id} title={`Week of ${shortDate(b.weekStart)}`} description={b.weekObjective}>
              <ul className="mt-2 space-y-1">
                {b.topMoves.slice(0, 2).map((m, i) => (
                  <li key={i} className="text-sm text-secondary">{m}</li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
