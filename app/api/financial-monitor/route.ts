import { NextRequest, NextResponse } from "next/server";
import { buildFinancialBrief } from "@/lib/financial/monitor";
import type { RiskMode } from "@/lib/financial/types";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(req: NextRequest) {
  const riskMode = (req.nextUrl.searchParams.get("risk") ?? "moderate") as RiskMode;
  const payload = await buildFinancialBrief(riskMode);
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}
