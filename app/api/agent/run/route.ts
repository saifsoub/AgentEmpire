import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAgent } from "@/lib/store";
import { executeAction } from "@/lib/agent-actions";
import type { AgentRunStep, AgentRunResult, AgentToolDef } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "mock" });

function buildAnthropicTools(toolDefs: AgentToolDef[]): Anthropic.Tool[] {
  return toolDefs.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: {
      type: "object" as const,
      properties: Object.fromEntries(
        Object.entries(t.parameters).map(([k, v]) => [k, {
          type: v.type,
          description: v.description,
          ...(v.enum ? { enum: v.enum } : {}),
        }])
      ),
      required: Object.entries(t.parameters).filter(([, v]) => v.required).map(([k]) => k),
    },
  }));
}

function buildUserMessage(template: string, input: Record<string, unknown>): string {
  let msg = template;
  for (const [key, value] of Object.entries(input)) {
    msg = msg.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
  }
  return msg;
}

function getMockResult(agentId: string, agentName: string, toolDefs: AgentToolDef[], input: Record<string, unknown>): AgentRunResult {
  const steps: AgentRunStep[] = [
    { type: "message", content: `Analyzing input for ${agentName}...` },
  ];
  for (const tool of toolDefs) {
    steps.push({ type: "tool_call", name: tool.name, content: JSON.stringify(input) });
    steps.push({ type: "tool_result", name: tool.name, content: JSON.stringify({ status: "completed", mock: true }) });
  }
  steps.push({ type: "message", content: `Analysis complete. This is a mock result because no ANTHROPIC_API_KEY is configured. The agent "${agentName}" would use ${toolDefs.length} tool(s) to process your request with real AI-powered analysis.` });
  return { steps, output: `Mock analysis complete for ${agentName}. Configure ANTHROPIC_API_KEY for live AI results.`, agentId, agentName };
}

export async function POST(req: Request) {
  const body = await req.json();
  const { agentId, input } = body as { agentId: string; input: Record<string, unknown> };

  const agent = await getAgent(agentId);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(getMockResult(agent.id, agent.name, agent.tools, input));
  }

  const tools = buildAnthropicTools(agent.tools);
  const userMessage = buildUserMessage(agent.userMessageTemplate, input);
  const toolActionMap = new Map(agent.tools.map(t => [t.name, t.action]));

  const steps: AgentRunStep[] = [];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];
  let finalText = "";

  for (let turn = 0; turn < 10; turn++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: agent.systemPrompt,
      tools,
      messages,
    });

    const assistantContent: Anthropic.ContentBlock[] = [];
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      assistantContent.push(block);
      if (block.type === "text") {
        finalText = block.text;
        steps.push({ type: "message", content: block.text });
      } else if (block.type === "tool_use") {
        steps.push({ type: "tool_call", name: block.name, content: JSON.stringify(block.input) });
        const action = toolActionMap.get(block.name) ?? "respond_text";
        try {
          const result = await executeAction(action, block.input as Record<string, unknown>);
          steps.push({ type: "tool_result", name: block.name, content: JSON.stringify(result) });
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Unknown error";
          steps.push({ type: "tool_result", name: block.name, content: `Error: ${errMsg}` });
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: `Error: ${errMsg}`, is_error: true });
        }
      }
    }

    messages.push({ role: "assistant", content: assistantContent });
    if (response.stop_reason === "end_turn") break;
    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }

  return NextResponse.json({
    steps,
    output: finalText,
    agentId: agent.id,
    agentName: agent.name,
  } satisfies AgentRunResult);
}
