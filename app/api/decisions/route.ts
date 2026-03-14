import { NextRequest, NextResponse } from "next/server";
import { analyzeDecision } from "@/lib/store";
import { analyzeDecisionSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    // The QuickCreate form sends options as a comma-separated string;
    // normalise to string[] before validation.
    if (typeof body.options === "string") {
      body.options = (body.options as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const parsed = analyzeDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const item = await analyzeDecision(parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("POST /api/decisions", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
