import { NextResponse } from "next/server";
import { archiveAgent, updateAgent } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const agent = await updateAgent(id, body);
    return NextResponse.json({ ok: true, agent });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to update agent" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agent = await archiveAgent(id);
    return NextResponse.json({ ok: true, agent });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to archive agent" }, { status: 500 });
  }
}
