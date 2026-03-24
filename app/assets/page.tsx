import { AppShell } from "@/components/layout/app-shell";
import { QuickCreate } from "@/components/quick-create";
import { StatusCycleButton } from "@/components/status-cycle-button";
import { currency } from "@/lib/utils";
import { getDb } from "@/lib/store";
import { ExternalLink } from "lucide-react";

export default async function AssetsPage() {
  const db = await getDb();
  return (
    <AppShell pathname="/assets" title="Asset Factory" subtitle="Turn insights, frameworks, and prompts into monetizable IP.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {db.assets.map(asset => (
            <div key={asset.id} className="card flex flex-col gap-3 p-5">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{asset.type} · {asset.format}</div>
                <h3 className="font-semibold text-primary leading-snug">{asset.title}</h3>
              </div>
              <p className="text-sm text-secondary flex-1">{asset.summary}</p>
              <div className="flex items-center justify-between pt-1">
                <StatusCycleButton entityType="asset" entityId={asset.id} current={asset.status} />
                <div className="text-sm font-semibold text-accent">{currency(asset.price)}</div>
              </div>
              {asset.buyUrl ? (
                <a
                  href={asset.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent hover:opacity-80"
                >
                  <ExternalLink className="h-3 w-3" />
                  Buy link active
                </a>
              ) : (
                <a
                  href={`/a/${asset.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted hover:text-secondary"
                >
                  <ExternalLink className="h-3 w-3" />
                  /a/{asset.id}
                </a>
              )}
            </div>
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
            { name: "buyUrl", label: "Buy link (Gumroad / Stripe)", placeholder: "https://gumroad.com/l/..." },
          ]}
        />
      </div>
    </AppShell>
  );
}
