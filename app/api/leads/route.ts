import { NextRequest, NextResponse } from "next/server";
import { createLeadSchema } from "@/lib/validators";
import { storeWaitlistSubmission } from "@/lib/supabase-waitlist";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createLeadSchema.parse(body);
    const receipt = await storeWaitlistSubmission(input);
    return NextResponse.json(receipt, { status: receipt.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }
    console.error("Waitlist submission failed", error);
    return NextResponse.json({ error: "Unable to accept submission" }, { status: 503 });
  }
}
