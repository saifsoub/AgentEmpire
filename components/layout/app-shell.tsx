"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Menu, ShieldCheck, WifiOff, X } from "lucide-react";
import { CommandPalette } from "@/components/layout/command-palette";
import { NavigationList, Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export type ShellHealth = {
  state: "healthy" | "warning" | "error" | "stale" | "unavailable";
  label: string;
  detail: string;
};

const defaultHealth: ShellHealth = {
  state: "unavailable",
  label: "Control data unavailable",
  detail: "Open Control for current source evidence.",
};

const healthStyles: Record<ShellHealth["state"], string> = {
  healthy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  error: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  stale: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  unavailable: "border-slate-400/25 bg-slate-400/10 text-slate-300",
};

function HealthIcon({ state }: { state: ShellHealth["state"] }) {
  if (state === "healthy") return <CheckCircle2 className="h-4 w-4" aria-hidden="true" />;
  if (state === "unavailable") return <WifiOff className="h-4 w-4" aria-hidden="true" />;
  return <AlertTriangle className="h-4 w-4" aria-hidden="true" />;
}

export function AppShell({
  pathname,
  title,
  subtitle,
  actions,
  children,
  health = defaultHealth,
  mainClassName,
}: {
  pathname: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  health?: ShellHealth;
  mainClassName?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);

  function closeMobile(restoreFocus = true) {
    setMobileOpen(false);
    if (restoreFocus) window.setTimeout(() => menuTriggerRef.current?.focus(), 0);
  }

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => mobileCloseRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobile();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(mobilePanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [])];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen overflow-x-clip bg-app text-primary">
      <div data-app-shell-content aria-hidden={mobileOpen || undefined} inert={mobileOpen || undefined}>
        <a href="#main-content" className="fixed left-3 top-3 z-[90] -translate-y-24 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#070910] transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white motion-reduce:transition-none">
          Skip to content
        </a>
        <div className="flex min-h-screen min-w-0">
          <Sidebar pathname={pathname} />

          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-40 border-b border-border bg-app/90 backdrop-blur-xl">
              <div className="flex min-h-16 min-w-0 items-center gap-3 px-3 sm:px-4 lg:px-6">
                <button
                  ref={menuTriggerRef}
                  type="button"
                  aria-label="Open navigation"
                  aria-controls="mobile-navigation"
                  aria-expanded={mobileOpen}
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-border bg-surface text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>

                <Link href="/control" aria-label={`Health: ${health.label}. ${health.detail}`} className={cn("flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-2 py-2 sm:flex-none sm:px-3", healthStyles[health.state])} title={health.detail}>
                  <HealthIcon state={health.state} />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">{health.label}</span>
                    <span className="hidden truncate text-[10px] opacity-75 xl:block">{health.detail}</span>
                  </span>
                </Link>

                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <div className="hidden items-center gap-1.5 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-[11px] text-secondary xl:flex">
                    <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                    Production cutover owner-gated
                  </div>
                  <CommandPalette />
                </div>
              </div>

              <div className="border-t border-border/70 px-3 py-3 sm:px-4 lg:px-6">
                <div className="mx-auto flex max-w-[96rem] flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="truncate text-xl font-semibold text-primary sm:text-2xl">{title}</h1>
                    <p className="mt-0.5 max-w-3xl text-xs text-secondary sm:text-sm">{subtitle}</p>
                  </div>
                  {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
                </div>
              </div>
            </header>

            <main id="main-content" tabIndex={-1} className={cn("mx-auto min-w-0 max-w-[96rem] px-3 py-5 outline-none sm:px-4 lg:px-6 lg:py-7", mainClassName)}>
              {children}
            </main>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div aria-hidden="true" onMouseDown={() => closeMobile()} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside ref={mobilePanelRef} id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Mobile navigation" className="relative h-full w-[min(88vw,22rem)] overflow-y-auto border-r border-border bg-[#050812] p-4 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-primary">S/ AgentEmpire</div>
                <p className="text-xs text-muted">Canonical control plane</p>
              </div>
              <button ref={mobileCloseRef} type="button" aria-label="Close navigation" onClick={() => closeMobile()} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-border text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <NavigationList pathname={pathname} onNavigate={() => closeMobile(false)} idPrefix="mobile-nav" />
            <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-secondary">Production cutover owner-gated</div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
