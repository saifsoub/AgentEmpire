import Link from "next/link";
import { ArrowLeftRight, ShoppingBag, Radio, Scale, DoorOpen, Bot, Hammer, Home, Archive, Map, GraduationCap, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const districts = [
  { href: "/city", label: "City Surface", icon: Map, city: true },
  { href: "/city#governor-office", label: "Governor’s Office", icon: Landmark },
  { href: "/opportunities", label: "The Exchange", icon: ArrowLeftRight },
  { href: "/offers", label: "The Marketplace", icon: ShoppingBag },
  { href: "/content", label: "Broadcast Tower", icon: Radio },
  { href: "/decisions", label: "Council Chamber", icon: Scale },
  { href: "/leads", label: "Arrivals Hall", icon: DoorOpen },
  { href: "/agents", label: "The Agency", icon: Bot },
  { href: "/tasks", label: "Work Yards", icon: Hammer },
  { href: "/settings", label: "The Archive", icon: Archive },
  { href: "/lifestyle", label: "The Quarters", icon: Home },
] as const;

const services = [
  { href: "/briefings", label: "Council Briefings", icon: Scale },
  { href: "/city/university", label: "City University", icon: GraduationCap },
  { href: "/city/banking", label: "City Banking", icon: Landmark },
] as const;

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-52 shrink-0 border-r border-border bg-[#0d1420] p-4 lg:block">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">AgentEmpire</div>
        <p className="mt-1 text-xs text-muted">District directory</p>
      </div>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Districts</div>
      <nav className="space-y-0.5">
        {districts.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href.includes("#") && pathname === item.href.split("#")[0]);
          const isCity = 'city' in item && item.city;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-surface text-primary border border-border"
                  : isCity
                    ? "text-accent font-semibold hover:bg-accent/10"
                    : "text-secondary hover:bg-surface/60 hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Services</div>
      <nav className="space-y-0.5">
        {services.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", active ? "bg-surface text-primary border border-border" : "text-secondary hover:bg-surface/60 hover:text-primary")}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
