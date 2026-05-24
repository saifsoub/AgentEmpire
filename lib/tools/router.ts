import { getAgentDefinition } from "@/lib/agents/definitions";
import { getProviders, type ToolResult } from "@/lib/tools/providers";

export async function routeAgentExecution(agentId: string, inputs: Record<string, string>) {
  const agent = getAgentDefinition(agentId);
  const providers = getProviders();
  const executions: ToolResult[] = [];

  for (const capability of agent.capabilities) {
    let executed = false;

    for (const providerName of agent.preferredProviders) {
      const provider = providers.find(p => p.name === providerName);
      if (!provider) continue;
      if (!provider.capabilities().includes(capability)) continue;

      const result = await provider.execute({
        capability,
        agentId,
        inputs,
        summary: `${agent.name} execution for ${capability}`,
        sensitiveAction: capability.includes("email") ? "external_send" : undefined
      });

      executions.push(result);

      if (["executed", "needs_approval", "queued_manual"].includes(result.status)) {
        executed = true;
        break;
      }
    }

    if (!executed) {
      executions.push({
        status: "failed",
        provider: "manual",
        capability,
        message: `No provider could execute ${capability}.`
      });
    }
  }

  return {
    agent,
    executedAt: new Date().toISOString(),
    providersChecked: providers.map(p => ({
      name: p.name,
      configured: p.isConfigured(),
      capabilities: p.capabilities()
    })),
    executions,
    summary: {
      executed: executions.filter(r => r.status === "executed").length,
      approvals: executions.filter(r => r.status === "needs_approval").length,
      manual: executions.filter(r => r.status === "queued_manual").length,
      failed: executions.filter(r => r.status === "failed").length
    }
  };
}
