import { NextResponse } from "next/server";
import { setWalletStatus } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { status?: "ACTIVE" | "FROZEN" };
    if (body.status !== "ACTIVE" && body.status !== "FROZEN") {
      return NextResponse.json({ ok: false, error: "status must be ACTIVE or FROZEN" }, { status: 400 });
    }
    const wallet = await setWalletStatus(id, body.status);
    return NextResponse.json({ ok: true, wallet });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to update wallet" }, { status: 500 });
  }
}
