"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const LEAD_STATUSES = ["NEW", "CONTACTED", "CONVERTED", "ARCHIVED"] as const;
const OPP_STATUSES = ["IDEA", "VALIDATING", "PACKAGING", "SELLING", "LIVE", "ARCHIVED"] as const;
const OFFER_STATUSES = ["DRAFT", "READY", "LIVE", "ARCHIVED"] as const;
const ASSET_STATUSES = ["IDEA", "DRAFT", "PRODUCTIZED", "PUBLISHED", "MONETIZED", "ARCHIVED"] as const;

type StatusMap = {
  lead: typeof LEAD_STATUSES[number];
  opportunity: typeof OPP_STATUSES[number];
  offer: typeof OFFER_STATUSES[number];
  asset: typeof ASSET_STATUSES[number];
};
type EntityType = keyof StatusMap;

function nextStatus(type: EntityType, current: string): string {
  const map: Record<EntityType, readonly string[]> = {
    lead: LEAD_STATUSES, opportunity: OPP_STATUSES, offer: OFFER_STATUSES, asset: ASSET_STATUSES,
  };
  const arr = map[type];
  const idx = arr.indexOf(current);
  return arr[(idx + 1) % arr.length];
}

const colors: Record<string, string> = {
  // Lead
  NEW: "border-accent/30 bg-accent/10 text-accent",
  CONTACTED: "border-blue-400/30 bg-blue-400/10 text-blue-400",
  CONVERTED: "border-green-400/30 bg-green-400/10 text-green-400",
  // Opportunity
  IDEA: "border-purple-400/30 bg-purple-400/10 text-purple-400",
  VALIDATING: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  PACKAGING: "border-orange-400/30 bg-orange-400/10 text-orange-400",
  SELLING: "border-blue-400/30 bg-blue-400/10 text-blue-400",
  LIVE: "border-green-400/30 bg-green-400/10 text-green-400",
  // Offer / Asset
  DRAFT: "border-border bg-surface2 text-muted",
  READY: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  PRODUCTIZED: "border-blue-400/30 bg-blue-400/10 text-blue-400",
  PUBLISHED: "border-orange-400/30 bg-orange-400/10 text-orange-400",
  MONETIZED: "border-green-400/30 bg-green-400/10 text-green-400",
  ARCHIVED: "border-border bg-surface2 text-muted",
};

interface Props {
  entityType: EntityType;
  entityId: string;
  current: string;
}

export function StatusCycleButton({ entityType, entityId, current }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);

  const endpointMap: Record<EntityType, string> = {
    lead: `/api/leads/${entityId}`,
    opportunity: `/api/opportunities/${entityId}`,
    offer: `/api/offers/${entityId}`,
    asset: `/api/assets/${entityId}`,
  };

  async function advance() {
    const next = nextStatus(entityType, status);
    setLoading(true);
    try {
      await fetch(endpointMap[entityType], {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setStatus(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={advance}
      disabled={loading}
      title="Click to advance status"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition hover:opacity-80 active:scale-95 cursor-pointer ${colors[status] ?? "border-border bg-surface2 text-muted"}`}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      {status}
    </button>
  );
}
