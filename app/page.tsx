import Link from "next/link";
import {
  ArrowRight, BarChart3, BriefcaseBusiness, FileChartColumn,
  FileStack, LayoutDashboard, ShieldCheck, Sparkles, Wallet, Zap,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    desc: "Empire score, live KPIs, and weekly priorities at a glance.",
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
  },
  {
    icon: Wallet,
    label: "Opportunities",
    href: "/opportunities",
    desc: "Log, score, and prioritise every high-leverage revenue opportunity.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    icon: BriefcaseBusiness,
    label: "Offers",
    href: "/offers",
    desc: "Define and track every commercial offer in your pipeline.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Sparkles,
    label: "Content",
    href: "/content",
    desc: "Build authority with a systematic publishing engine.",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: FileStack,
    label: "Asset Factory",
    href: "/assets",
    desc: "Turn expertise into productised, monetizable IP.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: ShieldCheck,
    label: "Decisions",
    href: "/decisions",
    desc: "Log strategic decisions and get AI-powered recommendations.",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: FileChartColumn,
    label: "Briefings",
    href: "/briefings",
    desc: "Auto-generate your weekly strategic brief from empire data.",
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
  },
  {
    icon: BarChart3,
    label: "Lifestyle OS",
    href: "/lifestyle",
    desc: "Track lifestyle ROI and keep high-performance habits accountable.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-app text-primary">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-20 border-b border-border/50 bg-app/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 border border-accent/25">
              <Zap className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            </div>
            <span className="text-sm font-bold text-primary">Empire OS</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-1.5 text-sm font-semibold text-white shadow-glow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            Enter your Empire
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center animate-fade-in">
        {/* Label chip */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
          <Zap className="h-3 w-3" aria-hidden="true" />
          Personal Empire OS
        </div>

        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-primary md:text-6xl">
          Monetize, publish,<br />
          <span className="text-accent">decide, and compound.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-secondary">
          A full-stack personal command centre — built to score your empire,
          prioritise your highest-leverage moves, and turn your expertise into
          recurring revenue.
        </p>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5 rounded-2xl bg-accent px-7 py-3.5 text-base font-bold text-white shadow-glow transition hover:opacity-90 active:scale-[0.98]"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Open Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href="/briefings"
            className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-secondary transition hover:border-accent/30 hover:text-primary"
          >
            <FileChartColumn className="h-4 w-4" aria-hidden="true" />
            View weekly brief
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-surface">
          {[
            { value: "8", label: "Modules" },
            { value: "100", label: "Empire score" },
            { value: "∞", label: "Leverage" },
          ].map((s) => (
            <div key={s.label} className="py-4 text-center">
              <div className="text-2xl font-bold text-accent">{s.value}</div>
              <div className="mt-0.5 text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-muted">
          Everything you need
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group card-interactive flex flex-col gap-3 p-5"
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${f.bg}`}>
                <f.icon className={`h-4 w-4 ${f.color}`} aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{f.label}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="border-t border-border/50 py-16">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-6 text-base text-secondary">
            Ready to take command?
          </p>
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-accent px-8 py-4 text-base font-bold text-white shadow-glow transition hover:opacity-90 active:scale-[0.98]"
          >
            Enter your Empire
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <p className="mt-4 text-xs text-muted">
            Powered by Next.js 15 · React 19 · Tailwind CSS
          </p>
        </div>
      </section>
    </div>
  );
}

