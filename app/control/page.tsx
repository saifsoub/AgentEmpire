import { ControlOverview } from "@/components/control/control-overview";
import { AppShell } from "@/components/layout/app-shell";
import { buildControlPlaneSnapshot } from "@/lib/control-plane/snapshot";
import { getDbEvidence } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ControlPage() {
  const evidence = await getDbEvidence();
  const sourceErrors = evidence.error
    ? {
        registry: evidence.error,
        runs: evidence.error,
        approvals: evidence.error,
        tasks: evidence.error,
      } as const
    : undefined;
  const snapshot = buildControlPlaneSnapshot(evidence.db, { runtimeConnected: false, sourceErrors });
  const criticalExceptions = snapshot.exceptions.filter((item) => item.severity === "critical").length;
  const attentionExceptions = snapshot.exceptions.filter((item) => item.severity === "attention").length;

  return (
    <AppShell
      pathname="/control"
      title="Control"
      subtitle="Observed health, exceptions, approvals, and work across the operator repository."
      health={{
        state: snapshot.overallState,
        label: `Control ${snapshot.overallState}`,
        detail: `${criticalExceptions} critical · ${attentionExceptions} attention`,
      }}
    >
      <ControlOverview snapshot={snapshot} />
    </AppShell>
  );
}
