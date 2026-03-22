import { NextResponse } from "next/server";
import { generateWeeklyBrief } from "@/lib/store";

export async function POST() {
  try {
    const brief = await generateWeeklyBrief();
    return NextResponse.json(brief, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
