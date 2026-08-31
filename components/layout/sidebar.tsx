import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Bot,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileStack,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Radio,
  Scale,
  Settings,
  Sparkles,
} from "lucide-react";
import { NAVIGATION_GROUPS } from "@/lib/control-plane/navigation";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  control: LayoutDashboard,
  city: Building2,
  opportunities: BriefcaseBusiness,
  offers: Boxes,
  decisions: Scale,
  tasks: ListChecks,
  agents: Bot,
  briefings: ClipboardCheck,
  content: Radio,
  assets: FileStack,
  leads: Megaphone,
  lifestyle: Sparkles,
  university: GraduationCap,
  banking: Landmark,
  settings: Settings,
};

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (["/city", "/control"].includes(href)) return false;
  return pathname.startsWith(`${href}/`);
}

export function NavigationList({ pathname, onNavigate, idPrefix = "nav" }: { pathname: string; onNavigate?: () => void; idPrefix?: string }) {
  return (
    <nav aria-label="Primary navigation" className="space-y-5">
      {NAVIGATION_GROUPS.map((group) => (
        <section key={group.label} aria-labelledby={`${idPrefix}-${group.label.toLowerCase()}`}>
          <h2 id={`${idPrefix}-${group.label.toLowerCase()}`} className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{group.label}</h2>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = icons[item.id] ?? Archive;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-xl border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none",
                    active
                      ? "border-accent/25 bg-accent/10 text-primary"
                      : "border-transparent text-secondary hover:border-border hover:bg-surface/70 hover:text-primary",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-accent" : "text-muted")} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-[#050812]/85 px-4 py-5 backdrop-blur-xl lg:block">
      <div className="mb-7 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 font-serif text-lg font-bold text-accent">S/</div>
        <div>
          <div className="text-sm font-semibold text-primary">AgentEmpire</div>
          <p className="text-xs text-muted">Canonical control plane</p>
        </div>
      </div>
      <NavigationList pathname={pathname} idPrefix="desktop-nav" />
      <div className="mt-7 rounded-xl border border-border bg-surface/60 p-3 text-xs text-muted">
        <div className="mb-1 font-medium text-secondary">Governance boundary</div>
        Production cutover owner-gated
      </div>
    </aside>
  );
}
