import { notFound } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";
import { getDb } from "@/lib/store";
import { currency } from "@/lib/utils";
import { LeadForm } from "@/components/lead-form";

export default async function AssetBuyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const asset = db.assets.find(a => a.id === id);
  if (!asset || asset.status === "ARCHIVED") notFound();

  const hasBuyUrl = Boolean(asset.buyUrl);

  return (
    <div className="min-h-screen bg-app text-primary">
      {/* Top bar */}
      <div className="border-b border-border bg-[#0d1420] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">S/ Empire OS</div>
          <div className="text-sm text-muted">{asset.type} · {asset.format}</div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* Left: Asset details */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">{asset.type}</div>
            <h1 className="text-4xl font-bold leading-tight text-primary lg:text-5xl">{asset.title}</h1>

            <div className="mt-6 flex items-center gap-3">
              <div className="text-3xl font-bold text-accent">{currency(asset.price)}</div>
              <div className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-secondary">{asset.format}</div>
            </div>

            <p className="mt-8 text-lg leading-relaxed text-secondary">{asset.summary}</p>

            <p className="mt-6 text-base text-secondary italic">{asset.salesCopy}</p>

            <div className="mt-10 rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">What you get</div>
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-accent shrink-0" />
                <span className="text-secondary">{asset.format} — instant download after purchase</span>
              </div>
            </div>
          </div>

          {/* Right: Buy or Inquire */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="card p-6">
              {hasBuyUrl ? (
                <>
                  <div className="mb-2 text-2xl font-bold text-accent">{currency(asset.price)}</div>
                  <p className="mb-6 text-sm text-secondary">Instant access after payment. {asset.format}.</p>
                  <a
                    href={asset.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90"
                  >
                    Buy now — {currency(asset.price)}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <div className="mt-6 border-t border-border pt-6">
                    <div className="mb-3 text-sm font-medium text-secondary">Or get notified about updates</div>
                    <LeadForm
                      sourceType="asset"
                      sourceId={asset.id}
                      sourceName={asset.title}
                      ctaLabel="Notify me of updates"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-primary">Get early access</h2>
                  <p className="mt-1 mb-6 text-sm text-secondary">
                    This asset is available at <span className="font-semibold text-accent">{currency(asset.price)}</span>. Leave your details and we'll send you access within 24 hours.
                  </p>
                  <LeadForm
                    sourceType="asset"
                    sourceId={asset.id}
                    sourceName={asset.title}
                    ctaLabel={`Get access — ${currency(asset.price)}`}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
