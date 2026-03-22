import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

Analyze this empire and respond with ONLY valid JSON matching this exact structure:
{
  "pulse": "2-3 sentence assessment of the empire's current health, momentum, and most critical leverage point",
  "topMoves": [
    { "title": "Move title", "reasoning": "Why this is the highest-leverage move right now", "impact": "HIGH" },
    { "title": "Move title", "reasoning": "Why this matters", "impact": "HIGH" },
    { "title": "Move title", "reasoning": "Why this matters", "impact": "MEDIUM" }
  ],
  "risks": [
    { "title": "Risk title", "description": "What could go wrong and why", "severity": "HIGH" },
    { "title": "Risk title", "description": "What could go wrong and why", "severity": "MEDIUM" },
    { "title": "Risk title", "description": "What could go wrong and why", "severity": "LOW" }
  ],
  "powerActions": [
    "Specific executable action 1",
    "Specific executable action 2",
    "Specific executable action 3",
    "Specific executable action 4",
    "Specific executable action 5"
  ]
}

Be direct, specific, and ruthlessly prioritized. Reference actual data points. No fluff.`;
}

function getMockResult(): SuperpowersResult {
  return {
    pulse: "Your empire has strong strategic positioning with 3 high-scoring opportunities (avg score 85) and a live premium offer. The critical bottleneck is execution velocity — the diagnostic needs a finalized CTA to start converting. Revenue engine is primed but not yet firing.",
    topMoves: [
      { title: "Finalize & launch the Executive Diagnostic offer", reasoning: "Score 89, already in PACKAGING — one push gets it to SELLING. Highest ROI per hour spent right now.", impact: "HIGH" },
      { title: "Publish 2 LinkedIn posts linked to a real offer CTA", reasoning: "Content machine is proven (6.4K views, 8 leads from one post). Replicate immediately to build compounding authority.", impact: "HIGH" },
      { title: "Productize the AI Readiness Toolkit into a landing page", reasoning: "Score 84, 94% reusability score — this is passive revenue waiting to be activated.", impact: "MEDIUM" },
    ],
    risks: [
      { title: "Revenue gap between pipeline and conversion", description: "You have 3 strong opportunities but only 1 live offer. The gap between packaging and selling is where empires stall.", severity: "HIGH" },
      { title: "Content publishing cadence dropping", description: "Only 1 published piece with 1 still in DRAFT. Authority compounds only when published consistently.", severity: "MEDIUM" },
      { title: "Single task backlog bottleneck", description: "Critical task (diagnostic CTA) is still TODO — this single blocker prevents revenue flow.", severity: "LOW" },
    ],
    powerActions: [
      "Write the offer page copy for the Executive Diagnostic in the next 2 hours",
      "Set a price and CTA URL for the diagnostic — commit to a number today",
      "Publish the Zero Bureaucracy draft post with a link to your live offer",
      "Build a simple landing page for the AI Readiness Toolkit this week",
      "Block 90 minutes on Friday to review empire scores and update statuses",
    ],
  };
}

export async function POST() {
  try {
    const db = await getDb();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(getMockResult());
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: buildPrompt(db) }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const result = JSON.parse(jsonMatch[0]) as SuperpowersResult;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(getMockResult());
  }
}
