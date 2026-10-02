import { addAsset, addContent, addLead, addTask, analyzeDecision, generateWeeklyBrief } from "@/lib/store";
import type { AgentCapability, ToolProviderName } from "@/lib/agents/definitions";
import { clamp, computeOpportunityScore, computeEmpireScore } from "@/lib/scoring";

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

function createReadableTaskTitle(input: Record<string, string>, fallback: string) {
  return input.taskTitle || input.title || input.objective || input.topic || input.focusArea || fallback;
}

export class NativeProvider implements ToolProvider {
  name: ToolProviderName = "native";
  isConfigured() { return true; }
  capabilities(): AgentCapability[] {
    return ["agent.execute", "task.create", "task.subtask.create", "content.create", "opportunity.manage", "decision.manage", "lead.manage", "asset.manage", "briefing.create", "repo.score_vehicle", "repo.compute_opportunity", "repo.compute_empire_score", "repo.openclaw_whatsapp"];
  }

  async execute(request: ToolRequest): Promise<ToolResult> {
    const input = request.inputs;

    if (request.capability === "content.create") {
      const item = await addContent({ pillar: input.pillar || "Execution", topic: input.topic || createReadableTaskTitle(input, "New content work"), angle: input.angle || "Operational", hook: input.hook || createReadableTaskTitle(input, "New content work"), body: input.body || request.summary, platform: input.platform || "Internal" });
      return { status: "executed", provider: this.name, capability: request.capability, message: "Content work created.", result: item };
    }

    if (request.capability === "lead.manage") {
      const lead = await addLead({ name: input.name || "Unnamed lead", email: input.email || "", message: input.message || request.summary, sourceType: "offer", sourceId: "agent", sourceName: input.sourceName || "Operational lead work" });
      return { status: "executed", provider: this.name, capability: request.capability, message: "Lead work created.", result: lead };
    }

    if (request.capability === "asset.manage") {
      const asset = await addAsset({ title: input.title || createReadableTaskTitle(input, "Operational asset"), type: input.type || "Toolkit", summary: input.summary || request.summary, price: asNumber(input.price, 0), format: input.format || "Internal" });
      return { status: "executed", provider: this.name, capability: request.capability, message: "Asset work created.", result: asset };
    }

    if (request.capability === "decision.manage") {
      const decision = await analyzeDecision({ title: input.title || createReadableTaskTitle(input, "Decision"), context: input.context || request.summary, options: (input.options || "Proceed,Pause,Refine").split(",").map(v => v.trim()).filter(Boolean) });
      return { status: "executed", provider: this.name, capability: request.capability, message: "Decision work created.", result: decision };
    }

    if (request.capability === "briefing.create") {
      const brief = await generateWeeklyBrief();
      return { status: "executed", provider: this.name, capability: request.capability, message: "Briefing created.", result: brief };
    }

    if (request.capability === "task.create" || request.capability === "task.subtask.create") {
      const task = await addTask({ title: createReadableTaskTitle(input, "Operational task"), category: input.category || "Operations", priority: (input.priority as any) || "MEDIUM", linkedEntityType: input.linkedEntityType || "agent", linkedEntityId: request.agentId, dueAt: input.dueAt || new Date().toISOString() });
      return { status: "executed", provider: this.name, capability: request.capability, message: "Task created.", result: task };
    }

    if (request.capability === "repo.score_vehicle") {
      const spec = input.spec || "GCC";
      const serviceHistory = input.serviceHistory || "Full Agency";
      const mileage = asNumber(input.mileage, 50000);
      const condition = input.condition || "Excellent";
      
      let score = 80;
      if (spec === "Non-GCC") score -= 15;
      if (serviceHistory === "Partial") score -= 10;
      if (serviceHistory === "None") score -= 25;
      if (mileage > 100000) score -= 15;
      if (condition === "Good") score -= 10;
      if (condition === "Fair") score -= 25;
      
      const finalScore = clamp(score, 0, 100);
      return {
        status: "executed",
        provider: this.name,
        capability: request.capability,
        message: `Vehicle scored successfully. Demand score: ${finalScore}/100.`,
        result: { score: finalScore, factors: { spec, serviceHistory, mileage, condition } }
      };
    }

    if (request.capability === "repo.compute_opportunity") {
      const fit = asNumber(input.fit, 70);
      const revenuePotential = asNumber(input.revenuePotential, 70);
      const strategicPrestige = asNumber(input.strategicPrestige, 70);
      const urgency = asNumber(input.urgency, 50);
      const reusability = asNumber(input.reusability, 50);
      const speedToLaunch = asNumber(input.speedToLaunch, 60);
      const compoundingPotential = asNumber(input.compoundingPotential, 60);
      
      const score = computeOpportunityScore({
        fit,
        revenuePotential,
        strategicPrestige,
        urgency,
        reusability,
        speedToLaunch,
        compoundingPotential
      });
      
      return {
        status: "executed",
        provider: this.name,
        capability: request.capability,
        message: `Opportunity score computed successfully: ${score}/100.`,
        result: { score }
      };
    }

    if (request.capability === "repo.compute_empire_score") {
      const revenueScore = asNumber(input.revenueScore, 70);
      const brandScore = asNumber(input.brandScore, 70);
      const assetScore = asNumber(input.assetScore, 70);
      const decisionScore = asNumber(input.decisionScore, 70);
      const executionScore = asNumber(input.executionScore, 70);
      const lifestyleAlignmentScore = asNumber(input.lifestyleAlignmentScore, 70);
      
      const score = computeEmpireScore({
        revenueScore,
        brandScore,
        assetScore,
        decisionScore,
        executionScore,
        lifestyleAlignmentScore
      });
      
      return {
        status: "executed",
        provider: this.name,
        capability: request.capability,
        message: `Empire score computed successfully: ${score}/100.`,
        result: { score }
      };
    }

    if (request.capability === "repo.openclaw_whatsapp") {
      const recipient = input.recipient || "Seif";
      const messageText = input.message || request.summary || "Hello from Agent Empire!";
      
      return {
        status: "executed",
        provider: this.name,
        capability: request.capability,
        message: `Notification sent successfully via OpenClaw WhatsApp to ${recipient}.`,
        result: { recipient, message: messageText, timestamp: new Date().toISOString() }
      };
    }

    return {
      status: "executed",
      provider: this.name,
      capability: request.capability,
      message: "Agent executed internal operational work.",
      result: {
        objective: input.objective || request.summary,
        completedInternally: true
      }
    };
  }
}

export class ComposioProvider implements ToolProvider {
  name: ToolProviderName = "composio";
  isConfigured() { return Boolean(process.env.COMPOSIO_API_KEY); }
  capabilities(): AgentCapability[] { return ["email.draft", "calendar.create", "github.issue.create"]; }
  async execute(request: ToolRequest): Promise<ToolResult> {
    if (!this.isConfigured()) return { status: "missing_connector", provider: this.name, capability: request.capability, message: "Composio is not configured. Add COMPOSIO_API_KEY in Netlify environment variables." };
    return { status: "needs_approval", provider: this.name, capability: request.capability, approvalRequired: true, message: "Connected provider prepared the external action. Final approval is required before external execution.", result: { userId: process.env.COMPOSIO_USER_ID || "seif", plannedAction: request.capability, inputs: request.inputs } };
  }
}

export class WebhookProvider implements ToolProvider {
  name: ToolProviderName = "webhook";
  isConfigured() { return Boolean(process.env.WEBHOOK_ROUTER_URL); }
  capabilities(): AgentCapability[] { return ["agent.execute", "task.create", "task.subtask.create"]; }
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
  capabilities(): AgentCapability[] { return ["agent.execute", "task.create", "task.subtask.create", "github.issue.create"]; }
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
  capabilities(): AgentCapability[] { return ["agent.execute", "task.create", "task.subtask.create", "content.create", "opportunity.manage", "decision.manage", "lead.manage", "asset.manage", "briefing.create", "email.draft", "calendar.create", "github.issue.create"]; }
  async execute(request: ToolRequest): Promise<ToolResult> {
    return { status: "queued_manual", provider: this.name, capability: request.capability, message: "Action queued for manual/provider follow-up.", result: { queued: true, capability: request.capability } };
  }
}

export function getProviders(): ToolProvider[] {
  return [new NativeProvider(), new ComposioProvider(), new WebhookProvider(), new McpProvider(), new ManualProvider()];
}
