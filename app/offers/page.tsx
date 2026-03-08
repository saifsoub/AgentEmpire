import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { QuickCreate } from "@/components/quick-create";
import { Badge } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import { currency } from "@/lib/utils";
import { getDb } from "@/lib/store";

const statusColor: Record<string, string> = {
  LIVE: "border-green-500/30 bg-green-500/10 text-green-400",
  READY: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  DRAFT: "border-border bg-surface2 text-secondary",
  ARCHIVED: "border-border bg-surface2 text-muted",
};

export default async function OffersPage() {
  const db = await getDb();

  return (
    <AppShell
      pathname="/offers"
      title="Offers"
      subtitle="Commercial offers and product packages"
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          {db.offers.length === 0 ? (
            <EmptyState
              title="No offers yet"
              description="Create your first commercial offer to start tracking pipeline."
            />
          ) : (
            <div className="space-y-4">
              {db.offers.map((offer) => (
                <SectionCard key={offer.id} title={offer.name} description={offer.audience}>
                  <p className="text-sm text-secondary">{offer.promise}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Badge className={statusColor[offer.status] ?? ""}>{offer.status}</Badge>
                    <span className="text-sm text-primary">
                      {currency(offer.priceMin)}
                      {offer.priceMax !== offer.priceMin && ` – ${currency(offer.priceMax)}`}
                    </span>
                    <span className="text-xs text-muted">{offer.pricingModel}</span>
                  </div>
                  {offer.deliverables.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {offer.deliverables.map((d, i) => (
                        <li key={i} className="text-xs text-muted">• {d}</li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              ))}
            </div>
          )}
        </div>

        <QuickCreate
          endpoint="/api/offers"
          title="Create offer"
          description="Define a new commercial offer or product package."
          fields={[
            { name: "name", label: "Offer name", placeholder: "AI Strategy Diagnostic", required: true },
            { name: "audience", label: "Target audience", placeholder: "Government entities" },
            { name: "problem", label: "Problem solved", type: "textarea", placeholder: "What pain does this solve?" },
            { name: "promise", label: "Promise / outcome", type: "textarea", placeholder: "What transformation do you deliver?" },
            { name: "pricingModel", label: "Pricing model", placeholder: "Fixed / Retainer / Revenue share" },
            { name: "priceMin", label: "Min price (AED)", type: "number", placeholder: "25000" },
            { name: "priceMax", label: "Max price (AED)", type: "number", placeholder: "65000" },
          ]}
        />
      </div>
    </AppShell>
  );
}
