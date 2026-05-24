import { NextResponse } from "next/server";
import { getAgent, updateAgent, deleteAgent } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    const agent = await updateAgent(id, body);
    return NextResponse.json(agent);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteAgent(id);
  return NextResponse.json({ ok: true });
}
