import { NextResponse } from "next/server";
import { getApprovals } from "@/lib/store";

export async function GET() {
  try {
    const approvals = await getApprovals();
    return NextResponse.json({ ok: true, approvals });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to load approvals" }, { status: 500 });
  }
}
