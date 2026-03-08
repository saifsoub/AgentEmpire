"use client";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart3, BriefcaseBusiness, FileChartColumn, FileStack,
  LayoutDashboard, Menu, Settings, ShieldCheck, Sparkles, Wallet, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role-context";
import { RoleBadge } from "@/components/role-badge";
import { UserRole } from "@/lib/roles";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/opportunities", label: "Opportunities", icon: Wallet },
  { href: "/offers", label: "Offers", icon: BriefcaseBusiness },
  { href: "/content", label: "Content", icon: Sparkles },
  { href: "/assets", label: "Assets", icon: FileStack },
  { href: "/decisions", label: "Decisions", icon: ShieldCheck },
  { href: "/briefings", label: "Briefings", icon: FileChartColumn },
  { href: "/lifestyle", label: "Lifestyle", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavItems({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="space-y-1" aria-label="Main navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
              active
                ? "bg-surface text-primary border border-border"
                : "text-secondary hover:bg-surface/60 hover:text-primary"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand({ role, onRoleChange }: { role: UserRole; onRoleChange: (r: UserRole) => void }) {
  return (
    <div className="mb-8">
      <div className="mb-2 inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
        S/ Empire OS
      </div>
      <h1 className="text-2xl font-semibold text-primary">Personal Empire</h1>
      <p className="mt-2 text-sm text-secondary">Monetize, publish, decide, and compound.</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-muted">Role:</span>
        <RoleBadge role={role} />
      </div>
      {/* Role switcher – demo only */}
      <div className="mt-2 flex gap-1">
        {(["admin", "analyst", "guest"] as UserRole[]).map((r) => (
          <button
            key={r}
            onClick={() => onRoleChange(r)}
            className={cn(
              "rounded-lg px-2 py-1 text-xs transition",
              role === r
                ? "bg-accent/20 text-accent"
                : "text-muted hover:text-secondary"
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
      className="hidden w-72 shrink-0 flex-col border-r border-border bg-[#0d1420] p-5 lg:flex"
      aria-label="Sidebar"
    >
      <SidebarBrand role={role} onRoleChange={setRole} />
      <NavItems pathname={pathname} />
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
        className="rounded-xl border border-border bg-surface p-2 text-secondary hover:text-primary lg:hidden"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[#0d1420] p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">Navigation</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-secondary hover:text-primary"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarBrand role={role} onRoleChange={setRole} />
            <NavItems pathname={pathname} onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
