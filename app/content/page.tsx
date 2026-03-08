import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { QuickCreate } from "@/components/quick-create";
import { Badge } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import { getDb } from "@/lib/store";

const statusColor: Record<string, string> = {
  PUBLISHED: "border-green-500/30 bg-green-500/10 text-green-400",
  SCHEDULED: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  DRAFT: "border-border bg-surface2 text-secondary",
  IDEA: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  ARCHIVED: "border-border bg-surface2 text-muted",
};

export default async function ContentPage() {
  const db = await getDb();

  return (
    <AppShell
      pathname="/content"
      title="Content"
      subtitle="Authority signals and lead-generation content"
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          {db.contentItems.length === 0 ? (
            <EmptyState
              title="No content yet"
              description="Start building your authority by creating your first piece of content."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {db.contentItems.map((item) => (
                <SectionCard key={item.id} title={item.topic} description={item.pillar}>
                  <p className="line-clamp-2 text-sm text-secondary">{item.hook}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge className={statusColor[item.status] ?? ""}>{item.status}</Badge>
                    <span className="text-xs text-muted">{item.platform}</span>
                    {item.status === "PUBLISHED" && (
                      <span className="text-xs text-muted">
                        {item.views.toLocaleString()} views · {item.engagements} eng
                      </span>
                    )}
                  </div>
                </SectionCard>
              ))}
            </div>
          )}
        </div>

        <QuickCreate
          endpoint="/api/content"
          title="Create content"
          description="Draft a new authority post or lead-generation piece."
          fields={[
            { name: "topic", label: "Topic", placeholder: "AI governance in government", required: true },
            { name: "pillar", label: "Content pillar", placeholder: "Authority / Value / Story" },
            { name: "hook", label: "Opening hook", type: "textarea", placeholder: "Start with a bold claim or question..." },
            { name: "platform", label: "Platform", placeholder: "LinkedIn / Twitter / Blog" },
            { name: "angle", label: "Angle", placeholder: "How this helps the reader" },
          ]}
        />
      </div>
    </AppShell>
  );
}
