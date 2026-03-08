import { NextRequest, NextResponse } from "next/server";
import { addOffer } from "@/lib/store";
import { createOfferSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = createOfferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const item = await addOffer(parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
