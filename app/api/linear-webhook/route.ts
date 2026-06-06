import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SALLY_EMAIL = "sally@s-crafted.me";
const BOOKING_PATTERN = /\b(book|barber|haircut|appointment|corner barber|rukan|grooming)\b/i;
const COMPOSIO_API = "https://backend.composio.dev/api/v2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data, type } = body;

    if (type !== "Issue") return NextResponse.json({ ok: true });
    if (!["create", "update"].includes(action)) return NextResponse.json({ ok: true });

    const assigneeEmail = data?.assignee?.email;
    if (assigneeEmail !== SALLY_EMAIL) return NextResponse.json({ ok: true });

    const title: string = data?.title || "";
    const description: string = data?.description || "";
    const issueId: string = data?.id;

    if (!BOOKING_PATTERN.test(title + " " + description)) {
      return NextResponse.json({ ok: true, skipped: "not a booking request" });
    }

    // Respond to Linear immediately, run agent async
    runBookingAgent(issueId, title, description).catch(console.error);

    return NextResponse.json({ ok: true, accepted: true });
  } catch (error) {
    console.error("Linear webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function getComposioTools(): Promise<Anthropic.Tool[]> {
  const key = process.env.COMPOSIO_API_KEY;
  const res = await fetch(`${COMPOSIO_API}/actions?apps=BROWSER_TOOL&limit=50`, {
    headers: { "x-api-key": key! }
  });
  const data = await res.json();
  return (data.items || []).map((action: { name: string; description: string; parameters: Anthropic.Tool["input_schema"] }) => ({
    name: action.name,
    description: action.description,
    input_schema: action.parameters
  }));
}

async function executeComposioTool(toolName: string, input: Record<string, unknown>): Promise<string> {
  const key = process.env.COMPOSIO_API_KEY;
  const res = await fetch(`${COMPOSIO_API}/actions/${toolName}/execute`, {
    method: "POST",
    headers: { "x-api-key": key!, "Content-Type": "application/json" },
    body: JSON.stringify({ entityId: "default", input })
  });
  const result = await res.json();
  return typeof result === "string" ? result : JSON.stringify(result);
}

async function runBookingAgent(issueId: string, title: string, description: string) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let tools: Anthropic.Tool[] = [];
  try {
    tools = await getComposioTools();
  } catch (e) {
    await postLinearComment(issueId, `❌ Sally: Could not load browser tools — ${e instanceof Error ? e.message : e}`);
    return;
  }

  if (tools.length === 0) {
    await postLinearComment(issueId, "❌ Sally: Browser Tool returned no actions. Check Composio connection.");
    return;
  }

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `You are Sally, a personal assistant for Seif Alsoub (saifssss@gmail.com, phone: +971 for UAE).

Task from Linear issue:
Title: "${title}"
Description: "${description}"

Your job: Book a haircut at The Corner Barber - Rukan branch, Dubai.

Steps:
1. Navigate to https://www.fresha.com
2. Search for "The Corner Barber Rukan" — if not found try "The Corner Barber Dubai"
3. Find the Rukan branch listing and open it
4. Select a service (standard haircut), pick the date and time mentioned in the title/description
5. Proceed through booking — if it asks for login/account, use email saifssss@gmail.com
6. Complete and confirm the booking
7. Report what happened clearly (booked, needs login, slot unavailable, etc.)

If Fresha doesn't have the Rukan branch, go to https://www.thecornerbarberuae.com and find their booking link there.`
    }
  ];

  let iterations = 0;
  const MAX = 15;

  while (iterations < MAX) {
    iterations++;

    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      tools,
      messages
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const text = response.content.find(b => b.type === "text");
      await postLinearComment(issueId, `🤖 **Sally:** ${text?.text ?? "Task completed."}`);
      return;
    }

    if (response.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      try {
        const result = await executeComposioTool(block.name, block.input as Record<string, unknown>);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      } catch (e) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `Error: ${e instanceof Error ? e.message : e}`,
          is_error: true
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  await postLinearComment(issueId, "⚠️ **Sally:** Booking agent hit the iteration limit. Manual follow-up needed.");
}

async function postLinearComment(issueId: string, body: string) {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey || !issueId) return;

  await fetch("https://api.linear.app/graphql", {
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
