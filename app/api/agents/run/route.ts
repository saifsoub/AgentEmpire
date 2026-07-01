import { NextResponse } from "next/server";
import { routeAgentExecution } from "@/lib/tools/router";
import { touchAgentHeartbeat } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agentId = body.agentId || "content-strategist";
    const inputs = body.inputs || {};

    await touchAgentHeartbeat(agentId).catch(() => null);
    const result = await routeAgentExecution(agentId, inputs);

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown agent execution error"
    }, { status: 500 });
  }
}
