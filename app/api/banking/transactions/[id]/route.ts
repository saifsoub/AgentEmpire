import { NextResponse } from "next/server";
import { resolveWalletTransaction } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { decision?: "APPROVED" | "REJECTED" };
    if (body.decision !== "APPROVED" && body.decision !== "REJECTED") {
      return NextResponse.json({ ok: false, error: "decision must be APPROVED or REJECTED" }, { status: 400 });
    }
    const result = await resolveWalletTransaction(id, body.decision);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to resolve transaction" }, { status: 500 });
  }
}
