import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { QuickCreate } from "@/components/quick-create";
import { Badge } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import { currency } from "@/lib/utils";
import { getDb } from "@/lib/store";

const statusColor: Record<string, string> = {
  MONETIZED: "border-green-500/30 bg-green-500/10 text-green-400",
  PUBLISHED: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  PRODUCTIZED: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  DRAFT: "border-border bg-surface2 text-secondary",
  IDEA: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  ARCHIVED: "border-border bg-surface2 text-muted",
};

export default async function AssetsPage() {
  const db = await getDb();

  return (
    <AppShell
      pathname="/assets"
      title="Asset Factory"
      subtitle="Turn insights, frameworks, and prompts into monetizable IP."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          {db.assets.length === 0 ? (
            <EmptyState
              title="No assets yet"
              description="Start building your IP library by creating your first asset."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {db.assets.map((asset) => (
                <SectionCard
                  key={asset.id}
                  title={asset.title}
                  description={`${asset.type} • ${asset.format}`}
                >
                  <p className="text-sm text-secondary">{asset.summary}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge className={statusColor[asset.status] ?? ""}>{asset.status}</Badge>
                    <div className="text-sm text-primary">{currency(asset.price)}</div>
                  </div>
                </SectionCard>
              ))}
            </div>
          )}
        </div>

        <QuickCreate
          endpoint="/api/assets"
          title="Create asset"
          description="Spin raw expertise into a premium reusable product."
          fields={[
            { name: "title", label: "Asset title", placeholder: "Government AI Readiness Index Toolkit", required: true },
            { name: "type", label: "Type", placeholder: "Toolkit / Template / Report" },
            { name: "summary", label: "Summary", type: "textarea", placeholder: "What does this asset help users achieve?" },
            { name: "price", label: "Price (AED)", type: "number", placeholder: "499" },
            { name: "format", label: "Format", placeholder: "PDF / Slides / Prompt pack" },
          ]}
        />
      </div>
    </AppShell>
  );
}
