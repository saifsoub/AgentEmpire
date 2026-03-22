import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { getDb } from "@/lib/store";
import { currency } from "@/lib/utils";
import { LeadForm } from "@/components/lead-form";

export default async function OfferLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const offer = db.offers.find(o => o.id === id);
  if (!offer || offer.status === "ARCHIVED") notFound();

  return (
    <div className="min-h-screen bg-app text-primary">
      {/* Top bar */}
      <div className="border-b border-border bg-[#0d1420] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">S/ Empire OS</div>
          {offer.ctaUrl && (
            <a href={offer.ctaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary">
              Learn more <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Left: Offer details */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">{offer.pricingModel}</div>
            <h1 className="text-4xl font-bold leading-tight text-primary lg:text-5xl">{offer.name}</h1>

            <div className="mt-6 flex items-center gap-3">
              <div className="text-2xl font-semibold text-primary">
                {currency(offer.priceMin)}
                {offer.priceMax !== offer.priceMin && <> – {currency(offer.priceMax)}</>}
              </div>
              <div className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-secondary">{offer.status}</div>
            </div>

            <p className="mt-8 text-lg leading-relaxed text-secondary">{offer.promise}</p>

            <div className="mt-10">
              <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">The problem we solve</div>
              <p className="text-base text-secondary">{offer.problem}</p>
            </div>

            {offer.deliverables.length > 0 && (
              <div className="mt-10">
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">What you get</div>
                <ul className="space-y-3">
                  {offer.deliverables.map((d, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                      <span className="text-base text-secondary">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10">
              <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">Who this is for</div>
              <p className="text-base text-secondary">{offer.audience}</p>
            </div>
          </div>

          {/* Right: Lead capture */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary">Book your diagnostic</h2>
              <p className="mt-1 mb-6 text-sm text-secondary">Leave your details and we'll reach out within 24 hours to schedule.</p>
              <LeadForm
                sourceType="offer"
                sourceId={offer.id}
                sourceName={offer.name}
                ctaLabel="Request your diagnostic →"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
