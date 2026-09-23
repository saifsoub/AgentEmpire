import { NextResponse } from "next/server";
import { getDb } from "@/lib/store";

export interface SuperpowersResult {
  pulse: string;
  topMoves: Array<{ title: string; reasoning: string; impact: "HIGH" | "MEDIUM" }>;
  risks: Array<{ title: string; description: string; severity: "HIGH" | "MEDIUM" | "LOW" }>;
  powerActions: string[];
}

function buildPrompt(db: Awaited<ReturnType<typeof getDb>>): string {
  const opps = db.opportunities.map(o => `- ${o.title} (Score: ${o.totalScore}, Status: ${o.status}, Revenue: AED ${o.expectedRevenue.toLocaleString()}, Next: ${o.nextAction})`).join("\n");
  const offers = db.offers.map(o => `- ${o.name} (${o.status}, AED ${o.priceMin.toLocaleString()}–${o.priceMax.toLocaleString()})`).join("\n");
  const content = db.contentItems.map(c => `- ${c.topic} (${c.status}, Views: ${c.views}, Leads: ${c.leads})`).join("\n");
  const assets = db.assets.map(a => `- ${a.title} (${a.status}, AED ${a.price})`).join("\n");
  const tasks = db.tasks.map(t => `- [${t.status}] ${t.title} (${t.priority})`).join("\n");
  const brief = db.briefings[0] ? `Objective: ${db.briefings[0].weekObjective}\nTop moves: ${db.briefings[0].topMoves.join(", ")}` : "No briefing yet.";

  return `You are an elite business strategist analyzing a personal empire. Provide sharp, actionable intelligence.

EMPIRE DATA:

OPPORTUNITIES (${db.opportunities.length}):
${opps}

OFFERS (${db.offers.length}):
${offers}

CONTENT (${db.contentItems.length}):
${content}

ASSETS (${db.assets.length}):
${assets}

TASKS (${db.tasks.length}):
${tasks}

CURRENT WEEKLY BRIEF:
${brief}

Respond with ONLY valid JSON matching this exact structure:
{
  "pulse": "2-3 sentence assessment",
  "topMoves": [
    { "title": "Move title", "reasoning": "Why this is high leverage", "impact": "HIGH" },
    { "title": "Move title", "reasoning": "Why this matters", "impact": "HIGH" },
    { "title": "Move title", "reasoning": "Why this matters", "impact": "MEDIUM" }
  ],
  "risks": [
    { "title": "Risk title", "description": "What could go wrong and why", "severity": "HIGH" },
    { "title": "Risk title", "description": "What could go wrong and why", "severity": "MEDIUM" },
    { "title": "Risk title", "description": "What could go wrong and why", "severity": "LOW" }
  ],
  "powerActions": ["Specific executable action 1", "Specific executable action 2", "Specific executable action 3", "Specific executable action 4", "Specific executable action 5"]
}

Be direct, specific, and prioritized. Reference actual data points. No fluff.`;
}

async function callGroq(prompt: string): Promise<SuperpowersResult> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) throw new Error(`Groq request failed: ${response.status}`);
  const payload = await response.json();
  const text = payload.choices?.[0]?.message?.content || "";
  return JSON.parse(text) as SuperpowersResult;
}

export async function POST() {
  try {
    const db = await getDb();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured; real execution is unavailable." },
        { status: 503 }
      );
    }

    const result = await callGroq(buildPrompt(db));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Superpowers execution failed." },
      { status: 502 }
    );
  }
}
