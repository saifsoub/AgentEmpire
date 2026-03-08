import { NextRequest, NextResponse } from "next/server";
import { analyzeDecision } from "@/lib/store";
import { analyzeDecisionSchema } from "@/lib/validators";
import { z } from "zod";

const rawSchema = z.object({
  title: z.string().min(3),
  context: z.string().min(10),
  options: z.union([
    z.array(z.string()).min(2),
    z.string().min(3),
  ]),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const raw = rawSchema.safeParse(body);
    if (!raw.success) {
      return NextResponse.json({ error: raw.error.flatten().fieldErrors }, { status: 400 });
    }
    // Normalise options: accept comma-separated string or array
    const options: string[] = Array.isArray(raw.data.options)
      ? raw.data.options
      : raw.data.options.split(",").map((s) => s.trim()).filter(Boolean);

    const parsed = analyzeDecisionSchema.safeParse({ ...raw.data, options });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const item = await analyzeDecision(parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
