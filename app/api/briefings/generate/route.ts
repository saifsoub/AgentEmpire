import { NextResponse } from "next/server";
import { generateWeeklyBrief } from "@/lib/store";

export async function POST() {
  try {
    const item = await generateWeeklyBrief();
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
