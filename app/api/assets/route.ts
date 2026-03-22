import { NextRequest, NextResponse } from "next/server";
import { addAsset } from "@/lib/store";
import { createAssetSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createAssetSchema.parse(body);
    const asset = await addAsset(input);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
