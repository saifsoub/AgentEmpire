import Link from "next/link";
import type {
  AgentControlState,
  ControlException,
  ControlPlaneSnapshot,
  ControlSource,
} from "@/lib/control-plane/snapshot";

type StatusValue =
  | ControlPlaneSnapshot["overallState"]
  | ControlSource["state"]
  | AgentControlState
  | ControlException["severity"]
  | "owner-gated";

const statusStyles: Record<StatusValue, string> = {
  healthy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  error: "border-red-400/30 bg-red-400/10 text-red-200",
  stale: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  unavailable: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  disabled: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  critical: "border-red-400/30 bg-red-400/10 text-red-200",
  attention: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  information: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  "owner-gated": "border-orange-400/30 bg-orange-400/10 text-orange-200",
};

const severityCopy: Array<{
  value: ControlException["severity"];
  label: string;
  empty: string;
}> = [
  { value: "critical", label: "Critical", empty: "No failed runs or blocked work are recorded." },
  { value: "attention", label: "Attention", empty: "No pending, overdue, or stale items are recorded." },
  { value: "information", label: "Information", empty: "No source availability gaps are recorded." },
];

const routeLabels: Record<string, string> = {
  "/agents": "Open agents",
  "/tasks": "Open tasks",
  "/settings": "Open settings",
  "/control": "Review control",
};

function StatusBadge({ value, label }: { value: StatusValue; label?: string }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusStyles[value]}`}>
      {label ?? value.replace("-", " ")}
    </span>
  );
}

function Timestamp({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted">Not observed</span>;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return <span className="text-muted">Timestamp unavailable</span>;

  const formatted = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(parsed);

  return <time dateTime={value}>{formatted} UTC</time>;
}

function RunStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const className = normalized === "failed"
    ? statusStyles.critical
    : ["success", "succeeded", "executed", "done", "completed"].includes(normalized)
      ? statusStyles.healthy
      : statusStyles.information;

  return (
    <span className={`inline-flex max-w-full self-start break-all rounded-full border px-2.5 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] ${className}`}>
      {status}
    </span>
  );
}

export function ControlOverview({ snapshot }: { snapshot: ControlPlaneSnapshot }) {
  const agentNames = new Map(snapshot.agents.map((agent) => [agent.id, agent.name]));
  const metrics = [
    { label: "Enabled agents", value: snapshot.metrics.enabledAgents, href: "/agents", detail: "Registry enabled" },
    { label: "Pending approvals", value: snapshot.metrics.pendingApprovals, href: "/agents", detail: "Awaiting owner review" },
    { label: "Failed runs", value: snapshot.metrics.failedRuns, href: "/agents", detail: "Recorded in run ledger" },
    { label: "Open tasks", value: snapshot.metrics.openTasks, href: "/tasks", detail: "Excludes done and canceled" },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <section
        aria-labelledby="cutover-boundary"
        className="overflow-hidden rounded-[1.25rem] border border-orange-400/30 bg-orange-400/[0.07]"
      >
        <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">Operating boundary</p>
              <StatusBadge value="owner-gated" />
            </div>
            <h2 id="cutover-boundary" className="text-xl font-semibold tracking-tight text-primary">
              Production cutover owner-gated
            </h2>
            <p className="mt-2 max-w-[70ch] text-sm leading-6 text-secondary">
              This page is a read-only evidence surface. It does not deploy, publish, approve, spend, or connect the
              production runtime. Those actions require an explicit owner decision outside this overview.
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex w-fit items-center rounded-xl border border-orange-400/30 px-3 py-2 text-sm font-medium text-orange-100 outline-none transition-colors hover:bg-orange-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
          >
            Review operator settings
          </Link>
        </div>
      </section>

      <section aria-labelledby="exceptions-heading" className="card overflow-hidden">
        <header className="border-b border-border p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Exceptions first</p>
              <h2 id="exceptions-heading" className="mt-1 text-2xl font-semibold tracking-tight text-primary">
                What needs operator attention
              </h2>
              <p className="mt-2 text-sm leading-6 text-secondary">
                Derived from the same repository-backed records served by the run, approval, task, and agent APIs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <StatusBadge value={snapshot.overallState} label={`Overall ${snapshot.overallState}`} />
              <span className="text-xs text-muted">
                Snapshot <Timestamp value={snapshot.snapshotAt} />
              </span>
            </div>
          </div>
        </header>

        <div className="divide-y divide-border">
          {severityCopy.map((severity) => {
            const exceptions = snapshot.exceptions.filter((item) => item.severity === severity.value);
            return (
              <section key={severity.value} aria-labelledby={`${severity.value}-exceptions`} className="p-5 md:p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <h3 id={`${severity.value}-exceptions`} className="font-semibold text-primary">{severity.label}</h3>
                  <StatusBadge value={severity.value} label={`${exceptions.length} recorded`} />
                </div>
                {exceptions.length > 0 ? (
                  <ul className="space-y-3">
                    {exceptions.map((exception) => (
                      <li key={exception.id} className="min-w-0 rounded-2xl border border-border bg-surface2/60 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="break-words font-medium text-primary">{exception.title}</p>
                            <p className="mt-1 break-words text-sm leading-6 text-secondary">{exception.detail}</p>
                            <p className="mt-2 text-xs text-muted">
                              Observed <Timestamp value={exception.observedAt} />
                            </p>
                          </div>
                          <Link
                            href={exception.href}
                            className="inline-flex w-fit shrink-0 items-center rounded-lg border border-border px-3 py-2 text-xs font-medium text-secondary outline-none transition-colors hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            {routeLabels[exception.href] ?? "Open record"}
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-secondary">
                    {severity.empty}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="metrics-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Repository state</p>
            <h2 id="metrics-heading" className="mt-1 text-xl font-semibold tracking-tight text-primary">Observed metrics</h2>
          </div>
          <p className="text-xs text-muted">Counts only; no synthetic health score.</p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="card min-w-0 p-5">
              <dt className="text-sm text-secondary">{metric.label}</dt>
              <dd>
                <span className="mt-3 block text-3xl font-semibold tabular-nums text-primary">{metric.value}</span>
                <Link
                  href={metric.href}
                  className="mt-3 inline-flex text-xs font-medium text-accent outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {metric.detail}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <section aria-labelledby="sources-heading" className="card min-w-0 overflow-hidden">
          <header className="border-b border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Evidence freshness</p>
            <h2 id="sources-heading" className="mt-1 text-xl font-semibold tracking-tight text-primary">Source state</h2>
          </header>
          <dl className="divide-y divide-border">
            {snapshot.sources.map((source) => (
              <div key={source.id} className="grid min-w-0 gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <dt className="font-medium text-primary">{source.label}</dt>
                  <dd className="mt-1 break-words text-sm leading-6 text-secondary">{source.detail}</dd>
                  <dd className="mt-2 text-xs text-muted">
                    Last observed <Timestamp value={source.observedAt} />
                  </dd>
                </div>
                <div>
                  <StatusBadge value={source.state} />
                </div>
              </div>
            ))}
          </dl>
        </section>

        <aside aria-labelledby="cp01-heading" className="card min-w-0 overflow-hidden">
          <header className="border-b border-border p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">CP-01 evidence</p>
                <h2 id="cp01-heading" className="mt-1 text-xl font-semibold tracking-tight text-primary">Consolidation audit</h2>
              </div>
              <span className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">
                Repository visible
              </span>
            </div>
          </header>
          <div className="space-y-4 p-5">
            <p className="text-sm leading-6 text-secondary">
              CP-01 records the canonical operator surface, route and API dispositions, duplicate-component decisions,
              and donor evidence. Missing donor access is documented as non-blocking evidence, not inferred status.
            </p>
            <dl className="divide-y divide-border rounded-2xl border border-border bg-surface2/50 px-4">
              <div className="py-3">
                <dt className="text-xs uppercase tracking-[0.12em] text-muted">Canonical operator app</dt>
                <dd className="mt-1 break-words text-sm font-medium text-primary">saifsoub/AgentEmpire · /control</dd>
              </div>
              <div className="py-3">
                <dt className="text-xs uppercase tracking-[0.12em] text-muted">Audit manifest</dt>
                <dd className="mt-1 break-all font-mono text-xs text-secondary">docs/CONTROL-PLANE-AUDIT.md</dd>
              </div>
              <div className="py-3">
                <dt className="text-xs uppercase tracking-[0.12em] text-muted">Executable evidence</dt>
                <dd className="mt-1 break-all font-mono text-xs text-secondary">__tests__/control-plane-inventory.test.ts</dd>
              </div>
            </dl>
            <p className="text-xs leading-5 text-muted">
              Exact audit counts are intentionally sourced from the CP-01 inventory rather than duplicated here.
            </p>
          </div>
        </aside>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <section aria-labelledby="agents-heading" className="card min-w-0 overflow-hidden">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Registry evidence</p>
              <h2 id="agents-heading" className="mt-1 text-xl font-semibold tracking-tight text-primary">Agent heartbeat state</h2>
            </div>
            <Link
              href="/agents"
              className="text-sm font-medium text-accent outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Open agents
            </Link>
          </header>
          {snapshot.agents.length > 0 ? (
            <ul className="divide-y divide-border">
              {snapshot.agents.map((agent) => (
                <li key={agent.id} className="min-w-0 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-primary">{agent.name}</p>
                      <p className="mt-1 break-words text-sm leading-6 text-secondary">{agent.description}</p>
                      <p className="mt-2 text-xs text-muted">
                        Heartbeat <Timestamp value={agent.observedAt} /> · {agent.tools} configured {agent.tools === 1 ? "tool" : "tools"}
                      </p>
                    </div>
                    <StatusBadge value={agent.state} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-secondary">No agent registry evidence is available.</p>
          )}
        </section>

        <section aria-labelledby="runs-heading" className="card min-w-0 overflow-hidden">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Run ledger</p>
              <h2 id="runs-heading" className="mt-1 text-xl font-semibold tracking-tight text-primary">Recent runs</h2>
            </div>
            <Link
              href="/agents"
              className="text-sm font-medium text-accent outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Open run history
            </Link>
          </header>
          {snapshot.recentRuns.length > 0 ? (
            <ol className="divide-y divide-border">
              {snapshot.recentRuns.map((run) => (
                <li key={run.id} className="min-w-0 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-primary">{run.capability}</p>
                      <p className="mt-1 break-words text-sm leading-6 text-secondary">{run.message || run.objective}</p>
                      <p className="mt-2 break-words text-xs text-muted">
                        {agentNames.get(run.agentId) ?? run.agentId} · {run.provider} · <Timestamp value={run.createdAt} />
                      </p>
                    </div>
                    <RunStatus status={run.status} />
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="p-5 text-sm text-secondary">No run receipts have been recorded yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
