"use client";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart3, BriefcaseBusiness, FileChartColumn, FileStack,
  LayoutDashboard, Menu, Settings, ShieldCheck, Sparkles, Wallet, X, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role-context";
import { RoleBadge } from "@/components/role-badge";
import { UserRole } from "@/lib/roles";

const sections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Revenue Engine",
    items: [
      { href: "/opportunities", label: "Opportunities", icon: Wallet },
      { href: "/offers", label: "Offers", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Brand & IP",
    items: [
      { href: "/content", label: "Content", icon: Sparkles },
      { href: "/assets", label: "Assets", icon: FileStack },
    ],
  },
  {
    label: "Strategy",
    items: [
      { href: "/decisions", label: "Decisions", icon: ShieldCheck },
      { href: "/briefings", label: "Briefings", icon: FileChartColumn },
      { href: "/lifestyle", label: "Lifestyle", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavItems({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto" aria-label="Main navigation">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted/60">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-150",
                    active
                      ? "bg-surface2 text-primary font-medium"
                      : "text-secondary hover:bg-surface2/60 hover:text-primary"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {/* Left accent bar for active item */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active ? "text-accent" : "text-muted group-hover:text-secondary"
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="mb-6 px-1">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 border border-accent/25">
          <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-primary leading-none">Empire OS</h1>
          <p className="mt-0.5 text-[10px] text-muted">Personal Command Centre</p>
        </div>
      </div>
    </div>
  );
}

function RoleSwitcher({ role, onRoleChange }: { role: UserRole; onRoleChange: (r: UserRole) => void }) {
  return (
    <div className="mt-4 border-t border-border/60 pt-4">
      <div className="mb-2 flex items-center gap-2">
        <RoleBadge role={role} />
      </div>
      <div className="flex gap-1">
        {(["admin", "analyst", "guest"] as UserRole[]).map((r) => (
          <button
            key={r}
            onClick={() => onRoleChange(r)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150",
              role === r
                ? "bg-accent/20 text-accent"
                : "text-muted hover:text-secondary hover:bg-surface2"
            )}
            aria-pressed={role === r}
            title={`Switch to ${r} role`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ pathname }: { pathname: string }) {
  const { role, setRole } = useRole();

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col border-r border-border bg-[#0b1019] p-4 lg:flex"
      aria-label="Sidebar"
    >
      <SidebarBrand />
      <NavItems pathname={pathname} />
      <RoleSwitcher role={role} onRoleChange={setRole} />
    </aside>
  );
}

export function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const { role, setRole } = useRole();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-border bg-surface p-2 text-secondary hover:text-primary transition lg:hidden"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-[#0b1019] p-4 shadow-xl animate-slide-in-left">
            <div className="mb-4 flex items-center justify-between">
              <SidebarBrand />
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-secondary hover:text-primary hover:bg-surface2 transition"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <NavItems pathname={pathname} onClose={() => setOpen(false)} />
            <RoleSwitcher role={role} onRoleChange={setRole} />
          </aside>
        </div>
      )}
    </>
  );
}

