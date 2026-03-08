import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import Link from "next/link";

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
          <header className="sticky top-0 z-20 border-b border-border bg-app/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <MobileNav pathname={pathname} />
                <div>
                  <div className="text-xl font-semibold text-primary md:text-2xl">{title}</div>
                  <div className="text-xs text-secondary md:text-sm">{subtitle}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="hidden rounded-xl border border-border bg-surface px-4 py-2 text-sm text-secondary hover:text-primary md:inline-flex"
                >
                  Overview
                </Link>
                {actions}
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
