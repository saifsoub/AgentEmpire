import { Badge } from "@/components/ui";
import { currency, shortDate } from "@/lib/utils";
import { Opportunity } from "@/lib/types";

export function OpportunitiesTable({ items }: { items: Opportunity[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-border bg-surface px-5 py-12 text-center text-sm text-secondary">
        No opportunities yet. Create your first one.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-border bg-surface">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 border-b border-border px-5 py-4 text-xs uppercase tracking-wide text-muted">
        <div>Title</div>
        <div>Type</div>
        <div>Revenue</div>
        <div>Score</div>
        <div>Status</div>
        <div>Due</div>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 border-b border-border/70 px-5 py-4 last:border-b-0"
        >
          <div>
            <div className="font-medium text-primary">{item.title}</div>
            <div className="mt-1 text-sm text-secondary">{item.nextAction}</div>
          </div>
          <div className="text-sm text-secondary">{item.type}</div>
          <div className="text-sm text-primary">{currency(item.expectedRevenue)}</div>
          <div className="text-sm text-primary">{item.totalScore}</div>
          <div><Badge>{item.status}</Badge></div>
          <div className="text-sm text-secondary">{shortDate(item.dueDate)}</div>
        </div>
      ))}
    </div>
  );
}
