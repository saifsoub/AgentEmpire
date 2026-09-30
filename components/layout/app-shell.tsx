import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function AppShell({
  pathname,
  title,
  subtitle,
  actions,
  children,
  showSidebar = true,
  mainClassName,
}: {
  pathname: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  showSidebar?: boolean;
  mainClassName?: string;
}) {
  return (
    <div className="min-h-screen bg-app text-primary">
      <div className="flex min-h-screen">
        {showSidebar ? <Sidebar pathname={pathname} /> : null}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border bg-app/90 backdrop-blur">
            <div className={cn("mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6", showSidebar ? "max-w-7xl" : "max-w-[96rem]")}>
              <div>
                <div className="text-2xl font-semibold text-primary">{title}</div>
                <div className="text-sm text-secondary">{subtitle}</div>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/city" className="rounded-xl border border-border bg-surface px-4 py-2 text-sm text-secondary hover:text-primary">
                  City
                </Link>
                {actions}
              </div>
            </div>
          </header>
          <main className={cn("mx-auto px-4 py-6 md:px-6", showSidebar ? "max-w-7xl" : "max-w-[96rem]", mainClassName)}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
