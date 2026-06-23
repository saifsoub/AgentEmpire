import { NextResponse } from "next/server";
import { requestWalletTransaction } from "@/lib/store";
import { requestWalletTransactionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = requestWalletTransactionSchema.parse(await request.json());
    const transaction = await requestWalletTransaction(body);
    return NextResponse.json({ ok: true, transaction });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to request transaction" }, { status: 400 });
  }
}
