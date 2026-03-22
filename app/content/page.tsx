import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui";
import { QuickCreate } from "@/components/quick-create";
import { getDb } from "@/lib/store";

export default async function ContentPage() {
  const db = await getDb();
  return (
    <AppShell title="Content" subtitle="Build authority by publishing ideas that compound over time.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {db.contentItems.map(item => (
            <SectionCard key={item.id} title={item.topic} description={`${item.pillar} • ${item.platform}`}>
              <p className="text-sm text-secondary">{item.hook}</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge>{item.status}</Badge>
                {item.views > 0 && <div className="text-sm text-muted">{item.views.toLocaleString()} views</div>}
              </div>
            </SectionCard>
          ))}
        </div>
        <QuickCreate
          endpoint="/api/content"
          title="New content"
          description="Create a new authority piece to publish and track."
          fields={[
            { name: "topic", label: "Topic", placeholder: "Why AI strategies fail in execution" },
            { name: "pillar", label: "Pillar", placeholder: "AI in Government" },
            { name: "angle", label: "Angle", placeholder: "The hidden execution gap" },
            { name: "hook", label: "Hook", type: "textarea", placeholder: "The opening line that stops the scroll" },
            { name: "platform", label: "Platform", placeholder: "LinkedIn" },
          ]}
        />
      </div>
    </AppShell>
  );
}
