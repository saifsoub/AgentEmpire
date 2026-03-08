import Link from "next/link";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-border px-8 py-16 text-center">
      <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface2 text-muted", !icon && "text-2xl")}>
        {icon ?? "📭"}
      </div>
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      {description && <p className="mt-1.5 max-w-xs text-sm text-muted">{description}</p>}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

