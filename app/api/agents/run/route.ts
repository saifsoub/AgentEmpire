import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { routeAgentExecution } from "@/lib/tools/router";
import { resolveExecutionMode } from "@/lib/tools/execution-policy";

function approvalTokenMatches(request: Request) {
  const expected = process.env.CONTROL_PLANE_APPROVAL_TOKEN;
  const provided = request.headers.get("x-control-plane-approval-token");
  if (!expected || !provided) return false;

  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agentId = body.agentId || "general-operator";
    const inputs = body.inputs || {};
    const executionMode = resolveExecutionMode(body.executionMode);

    if (executionMode === "external" && !approvalTokenMatches(request)) {
      return NextResponse.json({
        ok: false,
        error: "External execution requires a valid owner approval token.",
        executionMode
      }, { status: 403 });
    }

    const result = await routeAgentExecution(agentId, inputs, { executionMode });

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
