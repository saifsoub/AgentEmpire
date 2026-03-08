import { ROLES, UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

const colorMap: Record<UserRole, string> = {
  admin: "border-accent/40 bg-accent/10 text-accent",
  analyst: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  guest: "border-border bg-surface2 text-secondary",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        colorMap[role]
      )}
      title={ROLES[role].description}
    >
      {ROLES[role].label}
    </span>
  );
}
