import { NextResponse } from "next/server";
import { getAgentRuns } from "@/lib/store";

export async function GET() {
  try {
    const runs = await getAgentRuns();
    return NextResponse.json({ ok: true, runs });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to load runs" }, { status: 500 });
  }
}
