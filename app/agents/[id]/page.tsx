import { AppShell } from "@/components/layout/app-shell";
import { AgentRunnerClient } from "@/components/agent-runner-client";
import { getAgent } from "@/lib/store";
import { notFound } from "next/navigation";

export default async function AgentRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) notFound();
  return (
    <AppShell
      pathname="/agents"
      title={agent.name}
      subtitle={agent.description}
    >
      <AgentRunnerClient agent={agent} />
    </AppShell>
  );
}
