import { AppShell } from "@/components/layout/app-shell";
import { OpportunitiesTable } from "@/components/table";
import { QuickCreate } from "@/components/quick-create";
import { getDb } from "@/lib/store";

export default async function OpportunitiesPage() {
  const db = await getDb();
  return (
    <AppShell pathname="/opportunities" title="Opportunities" subtitle="Identify, score, and prioritize your highest-leverage plays.">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <OpportunitiesTable items={db.opportunities} />
        <QuickCreate
          endpoint="/api/opportunities"
          title="New opportunity"
          description="Capture a new revenue opportunity to score and track."
          fields={[
            { name: "title", label: "Title", placeholder: "Executive AI Diagnostic" },
            { name: "description", label: "Description", type: "textarea", placeholder: "What is this and why does it matter?" },
            { name: "type", label: "Type", placeholder: "Advisory / Product / System" },
            { name: "expectedRevenue", label: "Expected revenue (AED)", type: "number", placeholder: "25000" },
            { name: "nextAction", label: "Next action", placeholder: "Validate and package" },
            { name: "dueDate", label: "Due date", placeholder: "2026-04-01" },
          ]}
        />
      </div>
    </AppShell>
  );
}
