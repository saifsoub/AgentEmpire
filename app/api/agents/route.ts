import { NextResponse } from "next/server";
import { getAgents, addAgent } from "@/lib/store";

export async function GET() {
  const agents = await getAgents();
  return NextResponse.json(agents);
}

export async function POST(req: Request) {
  const body = await req.json();
  const agent = await addAgent(body);
  return NextResponse.json(agent, { status: 201 });
}
