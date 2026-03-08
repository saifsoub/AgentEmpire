import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function AppShell({
  pathname,
  title,
  subtitle,
  actions,
  children,
}: {
  pathname: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-app text-primary">
      <div className="flex min-h-screen">
        <Sidebar pathname={pathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-border/60 bg-app/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
              <div className="flex items-center gap-3">
                <MobileNav pathname={pathname} />
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-primary leading-tight md:text-xl">
                    {title}
                  </h1>
                  <p className="truncate text-xs text-muted md:text-sm">{subtitle}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/dashboard"
                  className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-secondary transition hover:border-accent/30 hover:text-primary md:flex"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                  Overview
                </Link>
                {actions}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

