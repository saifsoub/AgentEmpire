import { NextResponse } from "next/server";
import { touchAgentHeartbeat } from "@/lib/store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agent = await touchAgentHeartbeat(id);
    if (!agent) return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 });
    return NextResponse.json({ ok: true, agent });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to record heartbeat" }, { status: 500 });
  }
}
