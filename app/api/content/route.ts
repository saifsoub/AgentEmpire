import { NextRequest, NextResponse } from "next/server";
import { addContent } from "@/lib/store";
import { createContentSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = createContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const item = await addContent(parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
