import { AppShell } from "@/components/layout/app-shell";
import { OpportunitiesTable } from "@/components/table";
import { QuickCreate } from "@/components/quick-create";
import { getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const db = await getDb();
  const sorted = [...db.opportunities].sort((a, b) => b.totalScore - a.totalScore);
  return (
    <AppShell title="Opportunities" subtitle="Rank and track your highest-leverage income streams.">
      <div className="grid gap-6">
        <OpportunitiesTable items={sorted} />
        <QuickCreate
          endpoint="/api/opportunities"
          title="Add opportunity"
          description="Log a new revenue opportunity and get an instant score."
          fields={[
            { name: "title", label: "Title", placeholder: "Government AI Readiness Workshop" },
            { name: "type", label: "Type", placeholder: "Advisory / Digital Product / System" },
            { name: "description", label: "Description", type: "textarea", placeholder: "What is this opportunity?" },
            { name: "expectedRevenue", label: "Expected Revenue (AED)", type: "number", placeholder: "25000" },
            { name: "nextAction", label: "Next action", placeholder: "Validate and pitch" },
            { name: "dueDate", label: "Due date", placeholder: "2026-04-01" },
          ]}
        />
      </div>
    </AppShell>
  );
}
