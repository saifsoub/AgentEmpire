import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getPersona } from "@/lib/agents/personas";
import { runAgent, postLinearComment } from "@/lib/agents/runner";

const BOOKING_PATTERN = /\b(book|barber|haircut|appointment|corner barber|rukan|grooming)\b/i;
const COMPOSIO_API = "https://backend.composio.dev/api/v2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data, type } = body;

    if (type !== "Issue") return NextResponse.json({ ok: true });
    if (!["create", "update"].includes(action)) return NextResponse.json({ ok: true });

    const assigneeEmail: string = data?.assignee?.email ?? "";
    const persona = getPersona(assigneeEmail);
    if (!persona) return NextResponse.json({ ok: true, skipped: "not a managed agent" });

    const title: string = data?.title || "";
    const description: string = data?.description || "";
    const issueId: string = data?.id;

    // Route to the right execution path
    const isBooking = persona.useBrowserForBooking && BOOKING_PATTERN.test(title + " " + description);

    if (isBooking) {
      runClaudeBookingAgent(issueId, title, description).catch(console.error);
    } else {
      runGroqAgent(issueId, title, description, persona).catch(console.error);
    }

    return NextResponse.json({ ok: true, agent: persona.name, mode: isBooking ? "claude-browser" : "groq" });
  } catch (error) {
    console.error("Linear webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function runGroqAgent(
  issueId: string,
  title: string,
  description: string,
  persona: ReturnType<typeof getPersona>
) {
  if (!persona) return;
  try {
    const result = await runAgent(persona, issueId, title, description);
    await postLinearComment(issueId, `🤖 **${persona.name}:** ${result}`);
  } catch (e) {
    await postLinearComment(issueId, `❌ **${persona.name}:** Failed — ${e instanceof Error ? e.message : e}`);
  }
}

// Claude handles browser-heavy tasks (booking) since it supports vision
async function runClaudeBookingAgent(issueId: string, title: string, description: string) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let tools: Anthropic.Tool[] = [];
  try {
    const res = await fetch(`${COMPOSIO_API}/actions?apps=BROWSER_TOOL&limit=50`, {
      headers: { "x-api-key": process.env.COMPOSIO_API_KEY! }
    });
    const data = await res.json();
    tools = (data.items || []).map((action: { name: string; description: string; parameters: Anthropic.Tool["input_schema"] }) => ({
      name: action.name,
      description: action.description,
      input_schema: action.parameters
    }));
  } catch (e) {
    await postLinearComment(issueId, `❌ **Sally:** Could not load browser tools — ${e instanceof Error ? e.message : e}`);
    return;
  }

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `You are Sally, personal assistant for Seif Alsoub (saifssss@gmail.com).

Task: "${title}"
Details: "${description}"

Book a haircut at The Corner Barber - Rukan branch, Dubai.
1. Go to https://www.fresha.com and search "The Corner Barber Rukan Dubai"
2. If not found, try https://www.thecornerbarberuae.com
3. Book at the date/time in the task title
4. Report exactly what happened (booked, needs login, slot unavailable, etc.)`
    }
  ];

  let iterations = 0;
  while (iterations < 15) {
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
        const res = await fetch(`${COMPOSIO_API}/actions/${block.name}/execute`, {
          method: "POST",
          headers: { "x-api-key": process.env.COMPOSIO_API_KEY!, "Content-Type": "application/json" },
          body: JSON.stringify({ entityId: "default", input: block.input })
        });
        const result = await res.json();
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
      } catch (e) {
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: `Error: ${e}`, is_error: true });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }

  await postLinearComment(issueId, "⚠️ **Sally:** Booking agent hit iteration limit. Manual follow-up needed.");
}
