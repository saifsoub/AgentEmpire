import { NextResponse } from "next/server";
import { createWallet } from "@/lib/store";
import { createWalletSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = createWalletSchema.parse(await request.json());
    const wallet = await createWallet(body);
    return NextResponse.json({ ok: true, wallet });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to create wallet" }, { status: 400 });
  }
}
