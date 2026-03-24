import { currency, shortDate } from "@/lib/utils";
import { StatusCycleButton } from "@/components/status-cycle-button";
import { Opportunity } from "@/lib/types";

export function OpportunitiesTable({ items }: { items: Opportunity[] }) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-border bg-surface">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 border-b border-border px-5 py-4 text-xs uppercase tracking-wide text-muted">
        <div>Title</div><div>Type</div><div>Revenue</div><div>Score</div><div>Status</div><div>Due</div>
      </div>
      {items.map(item => (
        <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 border-b border-border/70 px-5 py-4 last:border-b-0 items-start">
          <div>
            <div className="font-medium text-primary">{item.title}</div>
            <div className="mt-1 text-sm text-secondary">{item.nextAction}</div>
          </div>
          <div className="text-sm text-secondary">{item.type}</div>
          <div className="text-sm text-primary">{currency(item.expectedRevenue)}</div>
          <div className="text-sm text-primary font-medium">{item.totalScore}</div>
          <div>
            <StatusCycleButton entityType="opportunity" entityId={item.id} current={item.status} />
          </div>
          <div className="text-sm text-secondary">{shortDate(item.dueDate)}</div>
        </div>
      ))}
    </div>
  );
}
