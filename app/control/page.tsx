import { ControlOverview } from '@/components/control/control-overview';
import { AppShell } from '@/components/layout/app-shell';
import { buildControlPlaneSnapshot } from '@/lib/control-plane/snapshot';
import { getDbEvidence } from '@/lib/store';
export const dynamic = 'force-dynamic';
export default async function ControlPage() {
  const evidence = await getDbEvidence();
  const sourceErrors = evidence.error ? { registry: evidence.error, runs: evidence.error, approvals: evidence.error, tasks: evidence.error } : undefined;
  const snapshot = buildControlPlaneSnapshot(evidence.db, { runtimeConnected: false, sourceErrors });
  return <AppShell pathname="/control" title="S/ Control Plane" subtitle="One coordination surface; evidence stays with its source.">
    <section className="card mb-6 space-y-4 p-5" aria-labelledby="coordination-heading">
      <h2 id="coordination-heading" className="text-xl font-semibold">Lucas coordinates the workforce</h2>
      <p className="text-secondary">Requests share one identifier across assignments, handoffs and receipts. Live worker execution is awaiting a verified runtime connection.</p>
      <div className="flex flex-wrap gap-4">
        <a className="text-accent underline" href="https://docs.google.com/spreadsheets/d/1B48qf27Liuc445zAKz_W0Q9rKbKu_C95FCnmbcG2Jvk/edit">Portfolio and workforce registry</a>
        <a className="text-accent underline" href="https://monday.com/boards/5103012225/pulses/3198777766">Lucas execution log</a>
      </div>
      <p className="text-sm text-muted">monday permissions verified October 10, 2026. These links identify sources; they do not establish automatic synchronization. ClickUp is awaiting a verified adapter.</p>
    </section>
    <ControlOverview snapshot={snapshot} />
  </AppShell>;
}
