import { AppShell } from "@/components/layout/app-shell";
import { OpportunitiesTable } from "@/components/table";
import { QuickCreate } from "@/components/quick-create";
import { getDb } from "@/lib/store";

export default async function OpportunitiesPage() {
  const db = await getDb();

  return (
    <AppShell
      pathname="/opportunities"
      title="Opportunities"
      subtitle="Evaluate and prioritise high-leverage opportunities"
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <OpportunitiesTable items={db.opportunities} />
        <QuickCreate
          endpoint="/api/opportunities"
          title="Log opportunity"
          description="Capture a new revenue or leverage opportunity."
          fields={[
            { name: "title", label: "Title", placeholder: "Executive AI Strategy Diagnostic", required: true },
            { name: "type", label: "Type", placeholder: "Advisory / Digital Product / System", required: true },
            { name: "description", label: "Description", type: "textarea", placeholder: "Briefly describe this opportunity" },
            { name: "expectedRevenue", label: "Expected revenue (AED)", type: "number", placeholder: "50000" },
            { name: "nextAction", label: "Next action", placeholder: "Finalize pricing and send proposal" },
            { name: "dueDate", label: "Due date", type: "text", placeholder: "2026-04-01" },
          ]}
        />
      </div>
    </AppShell>
  );
}
