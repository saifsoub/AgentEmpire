import { Badge } from "@/components/ui";
import { ScoreBadge } from "@/components/score-ring";
import { currency, shortDate } from "@/lib/utils";
import { Opportunity } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";

const statusStyle: Record<string, string> = {
  IDEA: "border-muted/30 bg-muted/10 text-muted",
  VALIDATING: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  PACKAGING: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  SELLING: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  LIVE: "border-green-500/30 bg-green-500/10 text-green-400",
  ARCHIVED: "border-border bg-surface2 text-muted",
};

export function OpportunitiesTable({ items }: { items: Opportunity[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No opportunities yet"
        description="Log your first opportunity to start building your empire pipeline."
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-border bg-surface">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto_auto] items-center gap-3 border-b border-border bg-surface2/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
        <div>Opportunity</div>
        <div>Revenue</div>
        <div>Type</div>
        <div className="text-center">Score</div>
        <div className="text-center">Status</div>
        <div>Due</div>
      </div>

      {/* Rows */}
      {items.map((item) => (
        <div
          key={item.id}
          className="group grid grid-cols-[2fr_1fr_1fr_auto_auto_auto] items-center gap-3 border-b border-border/50 px-5 py-3.5 last:border-b-0 transition-colors hover:bg-surface2/40"
        >
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-primary">{item.title}</div>
            <div className="mt-0.5 truncate text-xs text-muted">{item.nextAction}</div>
          </div>
          <div className="text-sm font-medium text-primary tabular-nums">
            {currency(item.expectedRevenue)}
          </div>
          <div className="text-xs text-secondary">{item.type}</div>
          <div className="flex justify-center">
            <ScoreBadge value={item.totalScore} />
          </div>
          <div className="flex justify-center">
            <Badge className={statusStyle[item.status] ?? ""}>{item.status}</Badge>
          </div>
          <div className="text-xs text-muted tabular-nums">{shortDate(item.dueDate)}</div>
        </div>
      ))}
    </div>
  );
}

