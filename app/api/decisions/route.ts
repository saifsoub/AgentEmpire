import { NextRequest, NextResponse } from "next/server";
import { analyzeDecision } from "@/lib/store";
import { analyzeDecisionSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const raw = analyzeDecisionSchema.parse(body);
    const input = { ...raw, options: typeof raw.options === "string" ? (raw.options as string).split(",").map((s: string) => s.trim()) : raw.options };
    const item = await analyzeDecision(input);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
