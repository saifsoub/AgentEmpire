import { NextResponse } from "next/server";
import { updateApproval } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const approval = await updateApproval(id, body.status, body.payload);
    return NextResponse.json({ ok: true, approval });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to update approval" }, { status: 500 });
  }
}
