import { NextResponse } from "next/server";
import { getWallets, getWalletTransactions } from "@/lib/store";
import { paymentGateways, bankingSecurityLayers } from "@/lib/city-banking";

export async function GET() {
  try {
    const [wallets, transactions] = await Promise.all([getWallets(), getWalletTransactions()]);
    return NextResponse.json({ ok: true, wallets, transactions, gateways: paymentGateways, securityLayers: bankingSecurityLayers });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to load banking" }, { status: 500 });
  }
}
