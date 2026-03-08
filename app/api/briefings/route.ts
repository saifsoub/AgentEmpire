import { NextResponse } from "next/server";
import { getDb } from "@/lib/store";

export async function GET() {
  try {
    const db = await getDb();
    return NextResponse.json(db.briefings);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
