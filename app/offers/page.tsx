import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { QuickCreate } from "@/components/quick-create";
import { Badge } from "@/components/ui";
import { currency } from "@/lib/utils";
import { getDb } from "@/lib/store";

export default async function OffersPage() {
  const db = await getDb();
  return (
    <AppShell pathname="/offers" title="Offers" subtitle="Your live and draft commercial offers.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {db.offers.map((offer) => (
            <SectionCard key={offer.id} title={offer.name} description={offer.audience}>
              <p className="text-sm text-secondary">{offer.promise}</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge>{offer.status}</Badge>
                <div className="text-sm text-primary">
                  {currency(offer.priceMin)}–{currency(offer.priceMax)}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
        <QuickCreate
          endpoint="/api/offers"
          title="Create offer"
          description="Define a new commercial offer and bring it to market."
          fields={[
            { name: "name", label: "Offer name", placeholder: "Executive AI Diagnostic" },
            { name: "audience", label: "Target audience", placeholder: "Government entities" },
            { name: "problem", label: "Problem solved", type: "textarea", placeholder: "What painful problem does this solve?" },
            { name: "promise", label: "Promise / outcome", placeholder: "A premium rapid diagnostic revealing gaps and opportunities" },
            { name: "priceMin", label: "Price min (AED)", type: "number", placeholder: "15000" },
            { name: "priceMax", label: "Price max (AED)", type: "number", placeholder: "45000" },
          ]}
        />
      </div>
    </AppShell>
  );
}
