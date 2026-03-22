import { NextRequest, NextResponse } from "next/server";
import { addContent } from "@/lib/store";
import { createContentSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createContentSchema.parse(body);
    const item = await addContent(input);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
