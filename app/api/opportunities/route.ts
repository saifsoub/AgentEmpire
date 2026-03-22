import { NextRequest, NextResponse } from "next/server";
import { addOpportunity } from "@/lib/store";
import { createOpportunitySchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createOpportunitySchema.parse(body);
    const item = await addOpportunity(input);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
