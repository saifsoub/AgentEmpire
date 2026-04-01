import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/store";
import { updateSettingsSchema } from "@/lib/validators";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const settings = await updateSettings(parsed.data);
    return NextResponse.json(settings);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
