import { NextResponse } from "next/server";
import { generateWeeklyBrief } from "@/lib/store";

export async function POST() {
  try {
    const briefing = await generateWeeklyBrief();
    return NextResponse.json(briefing, { status: 201 });
  } catch (err) {
    console.error("POST /api/briefings/generate", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
