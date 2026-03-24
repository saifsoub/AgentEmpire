import { NextRequest, NextResponse } from "next/server";
import { updateLead } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const patch = await req.json();
    const updated = await updateLead(id, patch);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
