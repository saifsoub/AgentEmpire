import { NextResponse } from "next/server";
import { getAcademyAgents } from "@/lib/store";

export async function GET() {
  try {
    const agents = await getAcademyAgents();
    return NextResponse.json({ ok: true, agents });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
