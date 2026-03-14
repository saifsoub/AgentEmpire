import { AppShell } from "@/components/layout/app-shell";
import { QuickCreate } from "@/components/quick-create";
import { SectionCard } from "@/components/section-card";
import { currency } from "@/lib/utils";
import { getDb } from "@/lib/store";

export default async function AssetsPage() {
  const db = await getDb();
  return (
    <AppShell pathname="/assets" title="Asset Factory" subtitle="Turn insights, frameworks, and prompts into monetizable IP.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {db.assets.map((asset) => (
            <SectionCard key={asset.id} title={asset.title} description={`${asset.type} • ${asset.format}`}>
              <p className="text-sm text-secondary">{asset.summary}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-accent">{asset.status}</div>
                <div className="text-sm text-primary">{currency(asset.price)}</div>
              </div>
            </SectionCard>
          ))}
        </div>
        <QuickCreate
          endpoint="/api/assets"
          title="Create asset"
          description="Spin raw expertise into a premium reusable product."
          fields={[
            { name: "title", label: "Asset title", placeholder: "Government AI Readiness Index Toolkit" },
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
