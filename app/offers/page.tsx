import { AppShell } from "@/components/layout/app-shell";
import { QuickCreate } from "@/components/quick-create";
import { StatusCycleButton } from "@/components/status-cycle-button";
import { currency } from "@/lib/utils";
import { getDb } from "@/lib/store";
import { ExternalLink } from "lucide-react";

export default async function OffersPage() {
  const db = await getDb();
  return (
    <AppShell pathname="/offers" title="Offers" subtitle="Package your expertise into compelling commercial offerings.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {db.offers.map(offer => (
            <div key={offer.id} className="card flex flex-col gap-3 p-5">
              <div>
                <div className="mb-1 text-xs text-muted">{offer.audience}</div>
                <h3 className="font-semibold text-primary leading-snug">{offer.name}</h3>
              </div>
              <p className="text-sm text-secondary flex-1">{offer.problem}</p>
              <div className="flex items-center justify-between pt-1">
                <StatusCycleButton entityType="offer" entityId={offer.id} current={offer.status} />
                <div className="text-sm font-semibold text-primary">{currency(offer.priceMin)} – {currency(offer.priceMax)}</div>
              </div>
              <a
                href={`/o/${offer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted hover:text-secondary"
              >
                <ExternalLink className="h-3 w-3" />
                /o/{offer.id}
                {offer.calUrl && <span className="ml-auto text-accent">· Cal ✓</span>}
              </a>
            </div>
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
            { name: "ctaUrl", label: "CTA link (optional)", placeholder: "https://..." },
            { name: "calUrl", label: "Cal.com booking link (optional)", placeholder: "https://cal.com/you/intro" },
          ]}
        />
      </div>
    </AppShell>
  );
}
