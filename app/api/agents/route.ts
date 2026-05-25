import { NextResponse } from "next/server";
import { createAgent, getAgents } from "@/lib/store";

export async function GET() {
  try {
    const agents = await getAgents();
    return NextResponse.json({ ok: true, agents });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to load agents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agent = await createAgent(body);
    return NextResponse.json({ ok: true, agent });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to create agent" }, { status: 500 });
  }
}
