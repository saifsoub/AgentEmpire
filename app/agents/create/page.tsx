import { AppShell } from "@/components/layout/app-shell";
import { AgentCreatorClient } from "@/components/agent-creator-client";
import { getAgent } from "@/lib/store";

export default async function AgentCreatePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const editAgent = params.edit ? (await getAgent(params.edit)) ?? null : null;
  return (
    <AppShell
      pathname="/agents"
      title={editAgent ? "Edit Agent" : "Create Agent"}
      subtitle={editAgent ? `Editing ${editAgent.name}` : "Build a custom AI agent for your empire."}
    >
      <AgentCreatorClient editAgent={editAgent} />
    </AppShell>
  );
}
