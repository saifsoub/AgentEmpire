import { NextResponse } from "next/server";
import { getApprovals, createApproval } from "@/lib/store";

export async function GET() {
  try {
    const approvals = await getApprovals();
    return NextResponse.json({ ok: true, approvals });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to load approvals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { source?: string; action?: string; provider?: string; payload?: unknown; riskLevel?: "LOW" | "MEDIUM" | "HIGH" };
    if (!body.source || !body.action) {
      return NextResponse.json({ ok: false, error: "source and action are required" }, { status: 400 });
    }
    const approval = await createApproval({
      source: body.source,
      action: body.action,
      provider: body.provider,
      payload: body.payload,
      riskLevel: body.riskLevel ?? "HIGH",
    });
    return NextResponse.json({ ok: true, approval });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to create approval" }, { status: 500 });
  }
}
