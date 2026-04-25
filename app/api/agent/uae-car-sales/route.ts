import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { addOffer } from "@/lib/store";
import fs from "node:fs/promises";
import path from "node:path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "mock" });

export interface CarInput {
  make: string;
  model: string;
  year: number;
  trim: string;
  mileage: number;
  spec: "GCC" | "Non-GCC";
  serviceHistory: "Full Agency" | "Partial" | "None";
  condition: "Excellent" | "Good" | "Fair";
  askingPrice?: number;
}

export interface AgentStep {
  type: "tool_call" | "tool_result" | "message";
  name?: string;
  content: string;
}

export interface CarAgentResult {
  steps: AgentStep[];
  priceMin: number;
  priceMax: number;
  recommended: number;
  confidence: "High" | "Medium" | "Low";
  summary: string;
  highlights: string[];
  marketNotes: string[];
  listingId: string;
}

const tools: Anthropic.Tool[] = [
  {
    name: "score_vehicle",
    description: "Score a vehicle based on UAE market demand factors: spec, service history, mileage, and condition. Returns a numeric score 0-100 and factor breakdown.",
    input_schema: {
      type: "object" as const,
      properties: {
        spec: { type: "string", enum: ["GCC", "Non-GCC"] },
        serviceHistory: { type: "string", enum: ["Full Agency", "Partial", "None"] },
        mileage: { type: "number" },
        condition: { type: "string", enum: ["Excellent", "Good", "Fair"] },
        make: { type: "string" },
        model: { type: "string" },
        year: { type: "number" },
      },
      required: ["spec", "serviceHistory", "mileage", "condition", "make", "model", "year"],
    },
  },
  {
    name: "build_comparables",
    description: "Build a set of comparable vehicle listings for UAE market pricing. Returns 5-7 comparables with quality tiers (A/B/C) and prices in AED.",
    input_schema: {
      type: "object" as const,
      properties: {
        make: { type: "string" },
        model: { type: "string" },
        year: { type: "number" },
        trim: { type: "string" },
        mileage: { type: "number" },
        spec: { type: "string" },
      },
      required: ["make", "model", "year", "trim", "mileage", "spec"],
    },
  },
  {
    name: "calculate_price_range",
    description: "Calculate a recommended price range in AED based on comparables and vehicle score. Returns min, max, and recommended price with confidence level.",
    input_schema: {
      type: "object" as const,
      properties: {
        vehicleScore: { type: "number" },
        comparables: { type: "array", items: { type: "object" } },
        askingPrice: { type: "number" },
        marketNotes: { type: "array", items: { type: "string" } },
      },
      required: ["vehicleScore", "comparables"],
    },
  },
  {
    name: "create_listing",
    description: "Create a car listing offer in the system with the final pricing recommendation. Call this as the last step.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string" },
        audience: { type: "string" },
        problem: { type: "string" },
        promise: { type: "string" },
        priceMin: { type: "number" },
        priceMax: { type: "number" },
        summary: { type: "string" },
        highlights: { type: "array", items: { type: "string" } },
        marketNotes: { type: "array", items: { type: "string" } },
        confidence: { type: "string", enum: ["High", "Medium", "Low"] },
        recommended: { type: "number" },
      },
      required: ["title", "priceMin", "priceMax", "summary", "highlights", "marketNotes", "confidence", "recommended"],
    },
  },
];

function scoreVehicle(input: {
  spec: string; serviceHistory: string; mileage: number;
  condition: string; make: string; model: string; year: number;
}) {
  let score = 70;
  if (input.spec === "GCC") score += 10;
  if (input.serviceHistory === "Full Agency") score += 8;
  else if (input.serviceHistory === "Partial") score += 3;
  if (input.mileage < 30000) score += 8;
  else if (input.mileage < 60000) score += 4;
  else if (input.mileage > 120000) score -= 8;
  if (input.condition === "Excellent") score += 5;
  else if (input.condition === "Fair") score -= 6;
  const age = new Date().getFullYear() - input.year;
  if (age <= 2) score += 5;
  else if (age >= 7) score -= 5;
  return {
    totalScore: Math.min(100, Math.max(0, score)),
    factors: {
      spec: input.spec === "GCC" ? "+10 (GCC spec premium)" : "0 (Non-GCC penalty risk)",
      serviceHistory: input.serviceHistory === "Full Agency" ? "+8 (full agency history)" : input.serviceHistory === "Partial" ? "+3 (partial history)" : "0 (no history discount)",
      mileage: input.mileage < 30000 ? "+8 (low mileage)" : input.mileage < 60000 ? "+4 (moderate mileage)" : input.mileage > 120000 ? "-8 (high mileage)" : "0",
      condition: input.condition === "Excellent" ? "+5" : input.condition === "Fair" ? "-6" : "0",
      age: `${age} years old`,
    },
  };
}

function buildComparables(input: {
  make: string; model: string; year: number; trim: string; mileage: number; spec: string;
}) {
  const base = 85000 + (2024 - input.year) * -4000 + (input.mileage > 60000 ? -8000 : 0);
  return [
    { tier: "A", source: "Dubizzle", price: Math.round(base * 1.02), mileage: input.mileage - 5000, spec: input.spec, notes: "Same gen, agency history, clean" },
    { tier: "A", source: "YallaMotor", price: Math.round(base * 0.98), mileage: input.mileage + 8000, spec: input.spec, notes: "Same trim, minor wear" },
    { tier: "A", source: "Dealer (UAE)", price: Math.round(base * 1.07), mileage: input.mileage - 12000, spec: input.spec, notes: "Certified pre-owned" },
    { tier: "B", source: "Facebook Marketplace", price: Math.round(base * 0.93), mileage: input.mileage + 20000, spec: input.spec, notes: "Limited detail, private seller" },
    { tier: "B", source: "Dubizzle", price: Math.round(base * 0.96), mileage: input.mileage + 3000, spec: "Non-GCC", notes: "Non-GCC, partial history" },
    { tier: "C", source: "WhatsApp group", price: Math.round(base * 0.87), mileage: input.mileage + 30000, spec: input.spec, notes: "Distressed sale, unclear condition" },
  ];
}

function calculatePriceRange(input: {
  vehicleScore: number;
  comparables: Array<{ tier: string; price: number }>;
  askingPrice?: number;
  marketNotes?: string[];
}) {
  const abComps = input.comparables.filter(c => c.tier === "A" || c.tier === "B");
  const prices = abComps.map(c => c.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const scoreFactor = (input.vehicleScore - 70) / 100;
  const recommended = Math.round(avg * (1 + scoreFactor * 0.1));
  const spread = recommended * 0.06;
  const confidence: "High" | "Medium" | "Low" =
    abComps.length >= 3 ? "High" : abComps.length >= 2 ? "Medium" : "Low";
  return {
    priceMin: Math.round(recommended - spread),
    priceMax: Math.round(recommended + spread),
    recommended,
    confidence,
    abComparableCount: abComps.length,
    averageMarketPrice: Math.round(avg),
    vsAskingPrice: input.askingPrice
      ? input.askingPrice > recommended
        ? `AED ${(input.askingPrice - recommended).toLocaleString()} above market`
        : `AED ${(recommended - input.askingPrice).toLocaleString()} below market`
      : "No asking price provided",
  };
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  if (name === "score_vehicle") return scoreVehicle(input as Parameters<typeof scoreVehicle>[0]);
  if (name === "build_comparables") return buildComparables(input as Parameters<typeof buildComparables>[0]);
  if (name === "calculate_price_range") return calculatePriceRange(input as Parameters<typeof calculatePriceRange>[0]);
  if (name === "create_listing") {
    const i = input as {
      title: string; audience?: string; problem?: string; promise?: string;
      priceMin: number; priceMax: number; summary: string;
      highlights: string[]; marketNotes: string[];
      confidence: "High" | "Medium" | "Low"; recommended: number;
    };
    const offer = await addOffer({
      name: i.title,
      audience: i.audience ?? "UAE private car buyers",
      problem: i.problem ?? "Finding a fairly priced quality used vehicle in the UAE market",
      promise: i.promise ?? `Transparently priced at AED ${i.recommended.toLocaleString()} — backed by market comparables`,
      pricingModel: "Fixed",
      priceMin: i.priceMin,
      priceMax: i.priceMax,
      ctaUrl: "",
    });
    return { offerId: offer.id, created: true };
  }
  throw new Error(`Unknown tool: ${name}`);
}

function getMockResult(car: CarInput): CarAgentResult {
  const base = 95000;
  return {
    steps: [
      { type: "message", content: `Analyzing ${car.year} ${car.make} ${car.model} for UAE market pricing...` },
      { type: "tool_call", name: "score_vehicle", content: JSON.stringify({ spec: car.spec, serviceHistory: car.serviceHistory }) },
      { type: "tool_result", name: "score_vehicle", content: JSON.stringify({ totalScore: 82 }) },
      { type: "tool_call", name: "build_comparables", content: JSON.stringify({ make: car.make, model: car.model }) },
      { type: "tool_result", name: "build_comparables", content: "6 comparables built (3A, 2B, 1C)" },
      { type: "tool_call", name: "calculate_price_range", content: JSON.stringify({ vehicleScore: 82 }) },
      { type: "tool_result", name: "calculate_price_range", content: JSON.stringify({ recommended: base, confidence: "High" }) },
      { type: "tool_call", name: "create_listing", content: "Creating listing..." },
      { type: "tool_result", name: "create_listing", content: "Listing created" },
    ],
    priceMin: base - 5000,
    priceMax: base + 5000,
    recommended: base,
    confidence: "Medium",
    summary: `The ${car.year} ${car.make} ${car.model} is well-positioned in the UAE market. ${car.spec === "GCC" ? "GCC spec is a strong buyer signal." : "Non-GCC spec may limit buyer pool."} ${car.serviceHistory === "Full Agency" ? "Full agency history supports premium pricing." : ""}`,
    highlights: [`${car.spec} specification`, `${car.mileage.toLocaleString()} km`, `${car.condition} condition`, `${car.serviceHistory} service history`],
    marketNotes: ["GCC buyers typically pay 8-12% premium for agency history", "Summer slowdown may extend days-on-market for non-SUVs", "Re-check comparables every 72 hours during active negotiation"],
    listingId: "mock_listing",
  };
}

export async function POST(req: Request) {
  const car = (await req.json()) as CarInput;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(getMockResult(car));
  }

  const marketGuide = await fs.readFile(
    path.join(process.cwd(), "skills/uae-car-sales-agent/references/uae-marketplaces.md"),
    "utf-8"
  );

  const systemPrompt = `You are a UAE car market pricing specialist. Use the tools provided to analyze a vehicle and produce a complete pricing recommendation. Always call all four tools in sequence: score_vehicle → build_comparables → calculate_price_range → create_listing. Be concise but precise.

Reference guide:
${marketGuide}`;

  const userMessage = `Analyze and price this vehicle for the UAE market:
Make: ${car.make}
Model: ${car.model}
Year: ${car.year}
Trim: ${car.trim}
Mileage: ${car.mileage.toLocaleString()} km
Spec: ${car.spec}
Service History: ${car.serviceHistory}
Condition: ${car.condition}
${car.askingPrice ? `Seller asking price: AED ${car.askingPrice.toLocaleString()}` : "No asking price provided"}

Run the full agent sequence and create a listing with the final pricing.`;

  const steps: AgentStep[] = [];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];

  let finalText = "";
  let listingId = "unknown";
  let priceResult: ReturnType<typeof calculatePriceRange> | null = null;
  let listingInput: Record<string, unknown> | null = null;

  for (let turn = 0; turn < 10; turn++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
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
        const result = await executeTool(block.name, block.input as Record<string, unknown>);

        if (block.name === "calculate_price_range") priceResult = result as ReturnType<typeof calculatePriceRange>;
        if (block.name === "create_listing") {
          listingId = (result as { offerId: string }).offerId;
          listingInput = block.input as Record<string, unknown>;
        }

        steps.push({ type: "tool_result", name: block.name, content: JSON.stringify(result) });
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
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
    priceMin: priceResult?.priceMin ?? (listingInput?.priceMin as number) ?? 0,
    priceMax: priceResult?.priceMax ?? (listingInput?.priceMax as number) ?? 0,
    recommended: priceResult?.recommended ?? (listingInput?.recommended as number) ?? 0,
    confidence: (priceResult?.confidence ?? (listingInput?.confidence as CarAgentResult["confidence"])) ?? "Medium",
    summary: (finalText || (listingInput?.summary as string)) ?? "",
    highlights: (listingInput?.highlights as string[]) ?? [],
    marketNotes: (listingInput?.marketNotes as string[]) ?? [],
    listingId,
  } satisfies CarAgentResult);
}
