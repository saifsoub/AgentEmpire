import { NextRequest, NextResponse } from "next/server";
import { addAsset } from "@/lib/store";
import { createAssetSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = createAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const item = await addAsset(parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("POST /api/assets", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
