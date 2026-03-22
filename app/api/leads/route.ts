import { NextRequest, NextResponse } from "next/server";
import { addLead } from "@/lib/store";
import { createLeadSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createLeadSchema.parse(body);
    const lead = await addLead(input);
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
