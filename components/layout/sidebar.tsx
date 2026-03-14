import Link from "next/link";
import { BarChart3, BriefcaseBusiness, FileChartColumn, FileStack, LayoutDashboard, Settings, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/opportunities", label: "Opportunities", icon: Wallet },
  { href: "/offers", label: "Offers", icon: BriefcaseBusiness },
  { href: "/content", label: "Content", icon: Sparkles },
  { href: "/assets", label: "Assets", icon: FileStack },
  { href: "/decisions", label: "Decisions", icon: ShieldCheck },
  { href: "/briefings", label: "Briefings", icon: FileChartColumn },
  { href: "/lifestyle", label: "Lifestyle", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];
export function Sidebar({ pathname }: { pathname: string }) {
  return <aside className="hidden w-72 shrink-0 border-r border-border bg-[#0d1420] p-5 lg:block"><div className="mb-8"><div className="mb-2 inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">S/ Empire OS</div><h1 className="text-2xl font-semibold text-primary">Personal Empire</h1><p className="mt-2 text-sm text-secondary">Monetize, publish, decide, and compound.</p></div><nav className="space-y-1">{items.map(item=>{ const Icon=item.icon; const active=pathname===item.href; return <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition", active ? "bg-surface text-primary border border-border" : "text-secondary hover:bg-surface/60 hover:text-primary")}><Icon className="h-4 w-4" />{item.label}</Link>; })}</nav></aside>;
}
