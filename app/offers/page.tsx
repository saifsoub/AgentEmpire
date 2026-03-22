import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui";
import { QuickCreate } from "@/components/quick-create";
import { currency } from "@/lib/utils";
import { getDb } from "@/lib/store";

export default async function OffersPage() {
  const db = await getDb();
  return (
    <AppShell title="Offers" subtitle="Package your expertise into compelling commercial offerings.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {db.offers.map(offer => (
            <SectionCard key={offer.id} title={offer.name} description={offer.audience}>
              <p className="text-sm text-secondary">{offer.problem}</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge>{offer.status}</Badge>
                <div className="text-sm text-primary">{currency(offer.priceMin)} – {currency(offer.priceMax)}</div>
              </div>
            </SectionCard>
          ))}
        </div>
        <QuickCreate
          endpoint="/api/offers"
          title="New offer"
          description="Build a new commercial offering from your expertise."
          fields={[
            { name: "name", label: "Offer name", placeholder: "AI Strategy Diagnostic" },
            { name: "audience", label: "Audience", placeholder: "Government executives" },
            { name: "problem", label: "Problem", type: "textarea", placeholder: "What challenge does this solve?" },
            { name: "promise", label: "Promise", type: "textarea", placeholder: "What outcome do you deliver?" },
            { name: "priceMin", label: "Price min (AED)", type: "number", placeholder: "15000" },
            { name: "priceMax", label: "Price max (AED)", type: "number", placeholder: "45000" },
          ]}
        />
      </div>
    </AppShell>
  );
}
