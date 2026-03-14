import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { QuickCreate } from "@/components/quick-create";
import { Badge } from "@/components/ui";
import { getDb } from "@/lib/store";

export default async function ContentPage() {
  const db = await getDb();
  return (
    <AppShell pathname="/content" title="Content Engine" subtitle="Turn expertise into authority signals and lead magnets.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {db.contentItems.map((item) => (
            <SectionCard key={item.id} title={item.topic} description={`${item.pillar} • ${item.platform}`}>
              <p className="mt-1 text-sm italic text-secondary">&ldquo;{item.hook}&rdquo;</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge>{item.status}</Badge>
                {item.views > 0 && (
                  <span className="text-xs text-muted">{item.views.toLocaleString()} views</span>
                )}
              </div>
            </SectionCard>
          ))}
        </div>
        <QuickCreate
          endpoint="/api/content"
          title="Add content"
          description="Plan and log a content piece tied to your authority pillars."
          fields={[
            { name: "topic", label: "Topic", placeholder: "Why AI roadmaps fail in execution" },
            { name: "pillar", label: "Pillar", placeholder: "AI in Government / Zero Bureaucracy" },
            { name: "hook", label: "Hook", placeholder: "Most AI roadmaps are performance theatre." },
            { name: "angle", label: "Angle", placeholder: "The problem is not ambition. It's translation." },
            { name: "platform", label: "Platform", placeholder: "LinkedIn" },
          ]}
        />
      </div>
    </AppShell>
  );
}
