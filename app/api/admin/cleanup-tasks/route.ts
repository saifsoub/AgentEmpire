import { NextResponse } from "next/server";
import { cleanupAgentTaskNoise } from "@/lib/store";

export async function POST() {
  try {
    const result = await cleanupAgentTaskNoise();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Cleanup failed" }, { status: 500 });
  }
}
