import { NextRequest, NextResponse } from "next/server";
import { addAuditEntry, getAuditEntries } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get("taskId") ?? undefined;
    const entries = await getAuditEntries(taskId);
    return NextResponse.json({ ok: true, entries });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to load audit trail" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = await addAuditEntry({
      taskId: body.taskId ?? "",
      action: body.action ?? "",
      status: body.status ?? "INITIATED",
      agent: body.agent,
      result: body.result,
      error: body.error,
    });
    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to add audit entry" }, { status: 500 });
  }
}
