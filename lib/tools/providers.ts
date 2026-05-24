import { addAsset, addContent, addLead, addTask, analyzeDecision, generateWeeklyBrief } from "@/lib/store";
import type { AgentCapability, ToolProviderName } from "@/lib/agents/definitions";

export type ToolStatus = "executed" | "needs_approval" | "missing_connector" | "queued_manual" | "failed";

export interface ToolRequest {
  capability: AgentCapability;
  agentId: string;
  inputs: Record<string, string>;
  summary: string;
  sensitiveAction?: string;
}

export interface ToolResult {
  status: ToolStatus;
  provider: ToolProviderName;
  capability: AgentCapability;
  message: string;
  result?: unknown;
  approvalRequired?: boolean;
}

export interface ToolProvider {
  name: ToolProviderName;
  isConfigured(): boolean;
  capabilities(): AgentCapability[];
  execute(request: ToolRequest): Promise<ToolResult>;
}

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export class NativeProvider implements ToolProvider {
  name: ToolProviderName = "native";
  isConfigured() { return true; }
  capabilities(): AgentCapability[] {
    return ["content.strategy", "opportunity.score", "decision.advise", "lead.qualify", "asset.build", "market.pulse", "task.create", "briefing.create"];
  }
  async execute(request: ToolRequest): Promise<ToolResult> {
    const input = request.inputs;
    if (request.capability === "content.strategy") {
      const item = await addContent({ pillar: input.pillar || "Executive Presence", topic: input.topic || request.summary, angle: `Platform: ${input.platform || "LinkedIn"}. Tone: ${input.tone || "Executive"}.`, hook: request.summary.slice(0, 140), body: request.summary, platform: input.platform || "LinkedIn" });
      return { status: "executed", provider: this.name, capability: request.capability, message: "Content draft saved through native store.", result: item };
    }
    if (request.capability === "lead.qualify") {
      const lead = await addLead({ name: input.name || "Unnamed lead", email: input.email || "", message: input.message || request.summary, sourceType: "offer", sourceId: "agent", sourceName: input.sourceName || "Agent qualification" });
      const task = await addTask({ title: `Follow up with ${lead.name}`, category: "Revenue", priority: "HIGH", linkedEntityType: "lead", linkedEntityId: lead.id, dueAt: new Date().toISOString() });
      return { status: "executed", provider: this.name, capability: request.capability, message: "Lead saved and follow-up task created.", result: { lead, task } };
    }
    if (request.capability === "asset.build") {
      const asset = await addAsset({ title: input.title || "Agent-built asset", type: input.type || "Toolkit", summary: input.summary || request.summary, price: asNumber(input.price, 1500), format: "Digital kit" });
      return { status: "executed", provider: this.name, capability: request.capability, message: "Asset draft saved through native store.", result: asset };
    }
    if (request.capability === "decision.advise") {
      const decision = await analyzeDecision({ title: input.title || "Agent decision", context: input.context || request.summary, options: (input.options || "Proceed,Pause,Refine").split(",").map(v => v.trim()).filter(Boolean) });
      return { status: "executed", provider: this.name, capability: request.capability, message: "Decision analysis saved through native store.", result: decision };
    }
    if (request.capability === "briefing.create" || request.capability === "market.pulse") {
      const brief = await generateWeeklyBrief();
      return { status: "executed", provider: this.name, capability: request.capability, message: "Briefing generated through native store.", result: brief };
    }
    const task = await addTask({ title: request.summary || `Agent action: ${request.capability}`, category: "Agent", priority: "MEDIUM", linkedEntityType: "agent", linkedEntityId: request.agentId, dueAt: new Date().toISOString() });
    return { status: "executed", provider: this.name, capability: request.capability, message: "Task created through native store.", result: task };
  }
}

export class ComposioProvider implements ToolProvider {
  name: ToolProviderName = "composio";
  isConfigured() { return Boolean(process.env.COMPOSIO_API_KEY); }
  capabilities(): AgentCapability[] { return ["email.draft", "calendar.create", "github.issue.create", "market.pulse", "task.create"]; }
  async execute(request: ToolRequest): Promise<ToolResult> {
    if (!this.isConfigured()) return { status: "missing_connector", provider: this.name, capability: request.capability, message: "Composio is not configured. Add COMPOSIO_API_KEY in Netlify environment variables." };
    return { status: "needs_approval", provider: this.name, capability: request.capability, approvalRequired: true, message: "Composio provider is configured. External connector execution is held for approval-safe routing.", result: { userId: process.env.COMPOSIO_USER_ID || "seif", plannedAction: request.capability, inputs: request.inputs } };
  }
}

export class WebhookProvider implements ToolProvider {
  name: ToolProviderName = "webhook";
  isConfigured() { return Boolean(process.env.WEBHOOK_ROUTER_URL); }
  capabilities(): AgentCapability[] { return ["market.pulse", "task.create", "email.draft"]; }
  async execute(request: ToolRequest): Promise<ToolResult> {
    if (!this.isConfigured()) return { status: "missing_connector", provider: this.name, capability: request.capability, message: "Webhook router is not configured." };
    const response = await fetch(process.env.WEBHOOK_ROUTER_URL!, { method: "POST", headers: { "content-type": "application/json", ...(process.env.WEBHOOK_ROUTER_TOKEN ? { authorization: `Bearer ${process.env.WEBHOOK_ROUTER_TOKEN}` } : {}) }, body: JSON.stringify(request) });
    const payload = await response.json().catch(() => ({}));
    return { status: response.ok ? "executed" : "failed", provider: this.name, capability: request.capability, message: response.ok ? "Webhook executed." : "Webhook failed.", result: payload };
  }
}

export class McpProvider implements ToolProvider {
  name: ToolProviderName = "mcp";
  isConfigured() { return Boolean(process.env.MCP_SERVER_URL); }
  capabilities(): AgentCapability[] { return ["market.pulse", "task.create", "github.issue.create"]; }
  async execute(request: ToolRequest): Promise<ToolResult> {
    if (!this.isConfigured()) return { status: "missing_connector", provider: this.name, capability: request.capability, message: "MCP server is not configured." };
    const response = await fetch(process.env.MCP_SERVER_URL!, { method: "POST", headers: { "content-type": "application/json", ...(process.env.MCP_AUTH_TOKEN ? { authorization: `Bearer ${process.env.MCP_AUTH_TOKEN}` } : {}) }, body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: request }) });
    const payload = await response.json().catch(() => ({}));
    return { status: response.ok ? "executed" : "failed", provider: this.name, capability: request.capability, message: response.ok ? "MCP call executed." : "MCP call failed.", result: payload };
  }
}

export class ManualProvider implements ToolProvider {
  name: ToolProviderName = "manual";
  isConfigured() { return true; }
  capabilities(): AgentCapability[] { return ["content.strategy", "opportunity.score", "decision.advise", "lead.qualify", "asset.build", "market.pulse", "task.create", "briefing.create", "email.draft", "calendar.create", "github.issue.create"]; }
  async execute(request: ToolRequest): Promise<ToolResult> {
    const task = await addTask({ title: `Manual connector action: ${request.capability}`, category: "Connector", priority: "MEDIUM", linkedEntityType: "agent", linkedEntityId: request.agentId, dueAt: new Date().toISOString() });
    return { status: "queued_manual", provider: this.name, capability: request.capability, message: "No configured connector executed this action. A manual follow-up task was created.", result: task };
  }
}

export function getProviders(): ToolProvider[] {
  return [new NativeProvider(), new ComposioProvider(), new WebhookProvider(), new McpProvider(), new ManualProvider()];
}
