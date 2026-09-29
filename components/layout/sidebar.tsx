import Link from "next/link";
import { BarChart3, Bot, BriefcaseBusiness, Car, CheckSquare, FileChartColumn, FileStack, FileText, LayoutDashboard, Settings, ShieldCheck, Users, Wallet, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const districts = [
  { href: "/city",            label: "S/ City",          icon: Map,           city: true  },
  { href: "/city/university", label: "S/ University",    icon: GraduationCap              },
  { href: "/city/banking",    label: "S/ Banking",       icon: Landmark                   },
  { href: "/opportunities", label: "The Exchange",      icon: ArrowLeftRight             },
  { href: "/offers",        label: "The Marketplace",   icon: ShoppingBag                },
  { href: "/content",       label: "Broadcast Tower",   icon: Radio                      },
  { href: "/decisions",     label: "Council Chamber",   icon: Scale                      },
  { href: "/leads",         label: "Arrivals Hall",     icon: DoorOpen                   },
  { href: "/agents",        label: "The Agency",        icon: Bot                        },
  { href: "/tasks",         label: "Work Yards",        icon: Hammer                     },
  { href: "/lifestyle",     label: "The Quarters",      icon: Home                       },
  { href: "/settings",      label: "The Archive",       icon: Archive                    },
] as const;

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-[#0d1420] p-5 lg:block">
      <div className="mb-6">
        <div className="text-xs font-semibold text-accent tracking-widest uppercase mb-0.5">S/</div>
        <p className="text-xs text-muted">Agent City</p>
      </div>
      <nav className="space-y-0.5">
        {districts.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
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
    </aside>
  );
}
