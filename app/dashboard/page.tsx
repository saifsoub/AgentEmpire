import { AppShell } from "@/components/layout/app-shell";
import { BarMeter } from "@/components/bar-meter";
import { SectionCard } from "@/components/section-card";
import { ScoreRing, ScoreBadge } from "@/components/score-ring";
import { getDashboardSummary } from "@/lib/store";
import { cn, currency } from "@/lib/utils";
import Link from "next/link";
import {
  Wallet, BriefcaseBusiness, FileStack, TrendingUp,
  ArrowRight, FileChartColumn, Sparkles,
} from "lucide-react";

const quickLinks = [
  { href: "/opportunities", label: "Opportunities", icon: Wallet, color: "text-yellow-400" },
  { href: "/offers", label: "Offers", icon: BriefcaseBusiness, color: "text-blue-400" },
  { href: "/assets", label: "Asset Factory", icon: FileStack, color: "text-purple-400" },
  { href: "/content", label: "Content", icon: Sparkles, color: "text-green-400" },
  { href: "/briefings", label: "Briefings", icon: FileChartColumn, color: "text-accent" },
];

const scoreBreakdownMeta = [
  { key: "revenueScore" as const, label: "Revenue", href: "/opportunities" },
  { key: "brandScore" as const, label: "Brand", href: "/content" },
  { key: "assetScore" as const, label: "Assets", href: "/assets" },
  { key: "decisionScore" as const, label: "Decisions", href: "/decisions" },
  { key: "executionScore" as const, label: "Execution", href: "/lifestyle" },
  { key: "lifestyleAlignmentScore" as const, label: "Lifestyle", href: "/lifestyle" },
];

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <AppShell
      pathname="/dashboard"
      title="Dashboard"
      subtitle="Your empire at a glance"
    >
      {/* ── Top Row: Score Ring + Quick Stats ── */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[auto_1fr]">
        {/* Empire Score Card */}
        <div className="flex flex-col items-center justify-center rounded-[1.25rem] border border-border bg-gradient-to-br from-surface via-surface to-surface2 p-6 lg:min-w-[220px]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
            Empire Score
          </p>
          <ScoreRing value={summary.empireScore} size={148} strokeWidth={11} showLabel />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {/* KPI pills */}
          {[
            { label: "Live Offers", value: summary.liveOffers, icon: BriefcaseBusiness, href: "/offers", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Monetized Assets", value: summary.monetizedAssets, icon: FileStack, href: "/assets", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            { label: "Top Opps", value: summary.topOpportunities.length, icon: Wallet, href: "/opportunities", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          ].map((kpi) => (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="group card-interactive flex flex-col gap-2 p-4"
            >
              <div className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl border", kpi.bg)}>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} aria-hidden="true" />
              </div>
              <div className={cn("text-2xl font-bold tabular-nums", kpi.color)}>{kpi.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">{kpi.label}</span>
                <ArrowRight className="h-3 w-3 text-muted opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
              </div>
            </Link>
          ))}

          {/* Score breakdown mini-tiles */}
          {scoreBreakdownMeta.slice(0, 3).map((item) => {
            const val = summary[item.key];
            return (
              <Link key={item.key} href={item.href} className="group card-interactive p-4">
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted">{item.label}</span>
                  <ScoreBadge value={val} />
                </div>
                <div className="mt-3">
                  <BarMeter value={val} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Score Breakdown Full Row ── */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-primary">Score Breakdown</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {scoreBreakdownMeta.map((item) => {
            const val = summary[item.key];
            return (
              <Link
                key={item.key}
                href={item.href}
                className="group card-interactive flex flex-col gap-2 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-secondary">{item.label}</span>
                  <ScoreBadge value={val} />
                </div>
                <BarMeter value={val} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Row: Opportunities + Focus ── */}
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        {/* Top Opportunities */}
        <SectionCard title="Top Opportunities" description="Ranked by total score">
          {summary.topOpportunities.length === 0 ? (
            <p className="text-sm text-muted">No opportunities yet.</p>
          ) : (
            <div className="space-y-2">
              {summary.topOpportunities.map((opp, i) => (
                <div
                  key={opp.id}
                  className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-surface2/60"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface2 text-xs font-bold text-muted">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary">{opp.title}</p>
                    <p className="text-xs text-muted">{opp.type} · {currency(opp.expectedRevenue)}</p>
                  </div>
                  <ScoreBadge value={opp.totalScore} />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 border-t border-border/50 pt-4">
            <Link
              href="/opportunities"
              className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              View all opportunities <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </SectionCard>

        <div className="flex flex-col gap-5">
          {/* Weekly Focus */}
          <SectionCard title="This Week" description="Strategic priorities">
            {summary.weeklyFocus.length === 0 ? (
              <p className="text-sm text-muted">
                No briefing yet.{" "}
                <Link href="/briefings" className="text-accent hover:underline">
                  Generate one →
                </Link>
              </p>
            ) : (
              <ol className="space-y-2">
                {summary.weeklyFocus.map((move, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                      {i + 1}
                    </span>
                    <span className="text-sm text-secondary leading-snug">{move}</span>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>

          {/* Quick Links */}
          <SectionCard title="Quick Access">
            <div className="space-y-1">
              {quickLinks.map((ql) => (
                <Link
                  key={ql.href}
                  href={ql.href}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface2/60"
                >
                  <ql.icon className={`h-4 w-4 shrink-0 ${ql.color}`} aria-hidden="true" />
                  <span className="flex-1 text-sm text-secondary group-hover:text-primary">{ql.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}

