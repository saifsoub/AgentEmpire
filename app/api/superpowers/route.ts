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

function getMockResult(): SuperpowersResult {
  return {
    pulse: "Your empire has strong strategic positioning with high-scoring opportunities and a live premium offer. The critical bottleneck is execution velocity: one clear conversion action needs to move from plan to shipped.",
    topMoves: [
      { title: "Finalize and launch the Executive Diagnostic offer", reasoning: "A packaged offer can convert faster than a new idea. This is the shortest path from positioning to revenue.", impact: "HIGH" },
      { title: "Publish two offer-linked authority posts", reasoning: "Content should route attention into a real next action rather than remain visibility-only.", impact: "HIGH" },
      { title: "Productize the strongest toolkit into a landing page", reasoning: "Reusable IP becomes useful only when it has a buyer path and a clear promise.", impact: "MEDIUM" }
    ],
    risks: [
      { title: "Pipeline-to-conversion gap", description: "Strong opportunities can stall if they are not routed into offers, tasks, or approvals.", severity: "HIGH" },
      { title: "Publishing without CTA", description: "Authority signals lose commercial value when not connected to a clear buyer action.", severity: "MEDIUM" },
      { title: "Single task bottleneck", description: "One unfinished action can keep the whole revenue flow waiting.", severity: "LOW" }
    ],
    powerActions: [
      "Write the offer page copy for the Executive Diagnostic",
      "Set a price and CTA URL for the diagnostic",
      "Publish one LinkedIn post linked to the live offer",
      "Build a simple landing page for the top toolkit",
      "Review agent outputs and route them into tasks or approvals"
    ]
  };
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
      return NextResponse.json(getMockResult());
    }

    const result = await callGroq(buildPrompt(db));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(getMockResult());
  }
}
