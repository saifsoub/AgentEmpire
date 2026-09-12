import type { ToolProviderName } from "@/lib/agents/definitions";

export type ExecutionMode = "inspect" | "internal" | "external";

export function resolveExecutionMode(value: unknown): ExecutionMode {
  return value === "internal" || value === "external" || value === "inspect" ? value : "inspect";
}

export function providerAllowed(provider: ToolProviderName, mode: ExecutionMode) {
  if (mode === "inspect") return false;
  if (mode === "internal") return provider === "native" || provider === "manual";
  return true;
}

export function executionModeDescription(mode: ExecutionMode) {
  if (mode === "inspect") return "Read-only preview. No provider execution, run logging, task mutation, or approval creation.";
  if (mode === "internal") return "Repository-owned internal mutations only. Remote MCP, webhook, and Composio providers are blocked.";
  return "External-capable execution. The API route must verify the owner approval token before dispatch.";
}
