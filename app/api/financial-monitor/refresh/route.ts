import { NextRequest, NextResponse } from "next/server";
import { buildFinancialBrief } from "@/lib/financial/monitor";
import type { RiskMode } from "@/lib/financial/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { riskMode?: RiskMode };
    const riskMode: RiskMode = body.riskMode ?? "moderate";
    const payload = await buildFinancialBrief(riskMode);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
