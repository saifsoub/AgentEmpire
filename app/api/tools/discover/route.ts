import { NextResponse } from "next/server";
import { TOOL_OPTIONS } from "@/lib/agents/definitions";

async function discoverMcpTools() {
  if (!process.env.MCP_SERVER_URL) return [];
  try {
    const response = await fetch(process.env.MCP_SERVER_URL, {
      method: "POST",
      headers: { "content-type": "application/json", ...(process.env.MCP_AUTH_TOKEN ? { authorization: `Bearer ${process.env.MCP_AUTH_TOKEN}` } : {}) },
      body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/list", params: {} })
    });
    const payload = await response.json().catch(() => ({}));
    const tools = payload?.result?.tools || payload?.tools || [];
    return tools.map((tool: any) => ({ id: tool.name || tool.id, label: tool.name || tool.id, provider: "mcp", description: tool.description || "MCP connected tool", ready: response.ok, sensitive: false }));
  } catch {
    return [];
  }
}

async function discoverComposioTools() {
  if (!process.env.COMPOSIO_API_KEY) return [];
  return [
    { id: "email.draft", label: "Email Draft", provider: "composio", description: "Connected through Composio when available. External send requires approval.", ready: true, sensitive: true },
    { id: "calendar.create", label: "Calendar", provider: "composio", description: "Connected through Composio when available. External invites may require approval.", ready: true, sensitive: true },
    { id: "github.issue.create", label: "GitHub Issue", provider: "composio", description: "Connected through Composio when available.", ready: true, sensitive: false }
  ];
}

export async function POST() {
  const native = TOOL_OPTIONS.filter(tool => tool.provider === "native" || tool.provider === "auto").map(tool => ({ ...tool, ready: true }));
  const webhook = [{ id: "webhook.agent.execute", label: "Webhook Router", provider: "webhook", description: "External automation router endpoint.", ready: Boolean(process.env.WEBHOOK_ROUTER_URL), sensitive: false }];
  const [composio, mcp] = await Promise.all([discoverComposioTools(), discoverMcpTools()]);
  return NextResponse.json({ ok: true, groups: { native, composio, mcp, webhook } });
}
