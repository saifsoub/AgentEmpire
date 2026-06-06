import type { AgentPersona } from "./personas";

const COMPOSIO_API = "https://backend.composio.dev/api/v2";
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const LINEAR_GRAPHQL = "https://api.linear.app/graphql";
const MAX_ITERATIONS = 12;

interface GroqMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: GroqToolCall[];
  tool_call_id?: string;
  name?: string;
}

interface GroqToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface GroqTool {
  type: "function";
  function: { name: string; description: string; parameters: unknown };
}

async function getComposioTools(apps: string[]): Promise<GroqTool[]> {
  const key = process.env.COMPOSIO_API_KEY;
  if (!key) return [];

  const appsParam = apps.join(",");
  const res = await fetch(`${COMPOSIO_API}/actions?apps=${appsParam}&limit=30`, {
    headers: { "x-api-key": key }
  });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.items || []).map((action: {
    name: string;
    description: string;
    parameters: unknown;
  }) => ({
    type: "function" as const,
    function: {
      name: action.name,
      description: action.description || action.name,
      parameters: action.parameters || { type: "object", properties: {} }
    }
  }));
}

async function executeComposioTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  const key = process.env.COMPOSIO_API_KEY;
  const res = await fetch(`${COMPOSIO_API}/actions/${toolName}/execute`, {
    method: "POST",
    headers: { "x-api-key": key!, "Content-Type": "application/json" },
    body: JSON.stringify({ entityId: "default", input: args })
  });
  const result = await res.json();
  return typeof result === "string" ? result : JSON.stringify(result);
}

async function callGroq(messages: GroqMessage[], tools: GroqTool[]): Promise<{
  content: string | null;
  tool_calls: GroqToolCall[] | null;
  stop_reason: string;
}> {
  const body: Record<string, unknown> = {
    model: GROQ_MODEL,
    messages,
    max_tokens: 4096,
    temperature: 0.3
  };

  if (tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content ?? null,
    tool_calls: choice?.message?.tool_calls ?? null,
    stop_reason: choice?.finish_reason ?? "stop"
  };
}

export async function runAgent(
  persona: AgentPersona,
  issueId: string,
  title: string,
  description: string
) {
  let tools: GroqTool[] = [];
  try {
    tools = await getComposioTools(persona.composioApps);
  } catch {
    // proceed without tools — agent will reason only
  }

  const messages: GroqMessage[] = [
    { role: "system", content: persona.systemPrompt },
    {
      role: "user",
      content: `New task assigned to you in Linear.

**Title:** ${title}
**Details:** ${description || "(no description provided)"}

Complete this task using your available tools. When done, summarize what you did.`
    }
  ];

  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await callGroq(messages, tools);

    const assistantMsg: GroqMessage = {
      role: "assistant",
      content: response.content,
      tool_calls: response.tool_calls ?? undefined
    };
    messages.push(assistantMsg);

    if (response.stop_reason === "stop" || !response.tool_calls?.length) {
      return response.content ?? "Task completed.";
    }

    // Execute tool calls
    for (const toolCall of response.tool_calls) {
      let result: string;
      try {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        result = await executeComposioTool(toolCall.function.name, args);
      } catch (e) {
        result = `Error: ${e instanceof Error ? e.message : String(e)}`;
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: result
      });
    }
  }

  return "Agent reached iteration limit — partial work may have been completed.";
}

export async function postLinearComment(issueId: string, body: string) {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey || !issueId) return;

  await fetch(LINEAR_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify({
      query: `mutation($issueId: String!, $body: String!) {
        commentCreate(input: { issueId: $issueId, body: $body }) { success }
      }`,
      variables: { issueId, body }
    })
  }).catch(console.error);
}
