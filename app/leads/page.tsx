import { AppShell } from "@/components/layout/app-shell";
import { getLeads, getDb } from "@/lib/store";
import { fullDate } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { StatusCycleButton } from "@/components/status-cycle-button";
import { Mail, User, ExternalLink, LinkIcon } from "lucide-react";

export default async function LeadsPage() {
  const [leads, db] = await Promise.all([getLeads(), getDb()]);

  const newCount = leads.filter(l => l.status === "NEW").length;
  const convertedCount = leads.filter(l => l.status === "CONVERTED").length;

  const liveOffers = db.offers.filter(o => o.status === "LIVE" || o.status === "READY");
  const liveAssets = db.assets.filter(a => ["PRODUCTIZED", "PUBLISHED", "MONETIZED"].includes(a.status));

  // Build content lookup for attribution
  const contentMap = Object.fromEntries(db.contentItems.map(c => [c.id, c.topic]));

  return (
    <AppShell pathname="/leads" title="Leads" subtitle="Every inquiry that came through your offer and asset pages.">
      <div className="grid gap-6">
        {/* Stats row */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-5">
            <div className="text-sm text-secondary">Total leads</div>
            <div className="mt-2 text-3xl font-semibold text-primary">{leads.length}</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-secondary">New (uncontacted)</div>
            <div className="mt-2 text-3xl font-semibold text-accent">{newCount}</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-secondary">Converted</div>
            <div className="mt-2 text-3xl font-semibold text-primary">{convertedCount}</div>
          </div>
        </div>

        {/* Share links */}
        {(liveOffers.length > 0 || liveAssets.length > 0) && (
          <div className="card p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Your shareable links</div>
            <div className="space-y-2">
              {liveOffers.map(offer => (
                <div key={offer.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface2 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-primary">{offer.name}</div>
                    <div className="text-xs text-muted">Offer · {offer.status}</div>
                  </div>
                  <a href={`/o/${offer.id}`} target="_blank" rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-secondary hover:text-primary">
                    /o/{offer.id} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
              {liveAssets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface2 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-primary">{asset.title}</div>
                    <div className="text-xs text-muted">Asset · {asset.status}</div>
                  </div>
                  <a href={`/a/${asset.id}`} target="_blank" rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-secondary hover:text-primary">
                    /a/{asset.id} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads list */}
        {leads.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">📬</div>
            <div className="text-lg font-semibold text-primary">No leads yet</div>
            <p className="mt-2 text-sm text-secondary max-w-sm mx-auto">
              Share your offer and asset links on LinkedIn. Every form submission appears here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.25rem] border border-border bg-surface">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-3 border-b border-border px-5 py-4 text-xs uppercase tracking-wide text-muted">
              <div>Lead</div>
              <div>Source</div>
              <div>Via</div>
              <div>Status</div>
              <div>Date</div>
            </div>
            {leads.map(lead => (
              <div key={lead.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-3 border-b border-border/70 px-5 py-4 last:border-b-0 items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted shrink-0" />
                    <span className="font-medium text-primary text-sm">{lead.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted shrink-0" />
                    <a href={`mailto:${lead.email}`} className="text-xs text-accent hover:underline">{lead.email}</a>
                  </div>
                  {lead.message && (
                    <p className="mt-1.5 text-xs text-muted italic line-clamp-2">{lead.message}</p>
                  )}
                </div>
                <div>
                  <div className="text-sm text-secondary">{lead.sourceName}</div>
                  <Badge>{lead.sourceType}</Badge>
                </div>
                <div>
                  {lead.refContentId && contentMap[lead.refContentId] ? (
                    <div className="flex items-center gap-1.5 text-xs text-secondary" title={`From: ${contentMap[lead.refContentId]}`}>
                      <LinkIcon className="h-3 w-3 text-muted shrink-0" />
                      <span className="line-clamp-1">{contentMap[lead.refContentId]}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">Direct</span>
                  )}
                </div>
                <div>
                  <StatusCycleButton entityType="lead" entityId={lead.id} current={lead.status} />
                </div>
                <div className="text-sm text-secondary">{fullDate(lead.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
