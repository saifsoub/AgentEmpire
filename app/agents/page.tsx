import { AppShell } from "@/components/layout/app-shell";
import { AgentsClient } from "@/components/agents-client";
import { getAgents } from "@/lib/store";

export default async function AgentsPage() {
  const agents = await getAgents();
  return (
    <AppShell
      pathname="/agents"
      title="Agents"
      subtitle="AI-powered agents that automate your empire workflows."
    >
      <AgentsClient agents={agents} />
    </AppShell>
  );
}
