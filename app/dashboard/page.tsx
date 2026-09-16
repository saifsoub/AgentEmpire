import { AppShell } from "@/components/layout/app-shell";
import { ArrowUpRight, Bot, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import Link from "next/link";

const statCards = [
  { label: "Active agents", value: "14", trend: "+2 this week" },
  { label: "Approvals pending", value: "3", trend: "Requires operator review" },
  { label: "Tasks auto-routed", value: "48", trend: "92% success rate" },
  { label: "Runtime health", value: "99.94%", trend: "Last 24h availability" },
];

const workstreams = [
  { title: "Decision queue", detail: "7 items waiting for strategic resolution", href: "/decisions", Icon: ShieldCheck },
  { title: "Agent execution", detail: "3 runs in progress across composio + native tools", href: "/agents", Icon: Bot },
  { title: "Opportunity flow", detail: "12 qualified opportunities in active movement", href: "/opportunities", Icon: ArrowUpRight },
  { title: "Task control", detail: "5 overdue items need reassignment", href: "/tasks", Icon: Clock3 },
];

export default function DashboardPage() {
  return (
    <AppShell pathname="/dashboard" title="S/ Agency Control Panel" subtitle="Operator surface for priorities, approvals, and execution velocity.">
      <section className="agency-template rounded-[1.5rem] border border-border p-6 md:p-8">
        <div className="agency-grid-bg pointer-events-none absolute inset-0 rounded-[1.5rem]" />
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <p className="agency-kicker">Control Layer</p>
            <h2 className="agency-heading text-3xl md:text-4xl">Agency Command Surface</h2>
            <p className="max-w-2xl text-sm text-secondary md:text-base">
              This template applies tokenized surfaces, tighter hierarchy, and action-first cards so the operator can scan status and move into critical workflows in one click.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.label} className="agency-panel rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-primary">{card.value}</p>
                <p className="mt-1 text-sm text-secondary">{card.trend}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {workstreams.map(({ title, detail, href, Icon }) => (
              <Link key={title} href={href} className="agency-panel group rounded-2xl p-5 transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="agency-heading text-lg">{title}</h3>
                    <p className="mt-2 text-sm text-secondary">{detail}</p>
                  </div>
                  <Icon className="mt-0.5 h-5 w-5 text-accent" />
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
                  Open module
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>

          <div className="agency-panel rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="agency-heading text-lg">Template Readiness</h3>
                <p className="mt-1 text-sm text-secondary">Environment and runtime checks completed for Node 22 + npm 10 contract.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Ready to deploy
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
