import { NextRequest, NextResponse } from "next/server";
import { addOffer } from "@/lib/store";
import { createOfferSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createOfferSchema.parse(body);
    const item = await addOffer(input);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
