import { NextResponse } from "next/server";
import { advanceEnrollment, submitEnrollmentExam } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { action?: "advance" | "exam" };
    if (body.action === "advance") {
      const enrollment = await advanceEnrollment(id);
      return NextResponse.json({ ok: true, enrollment });
    }
    if (body.action === "exam") {
      const enrollment = await submitEnrollmentExam(id);
      return NextResponse.json({ ok: true, enrollment });
    }
    return NextResponse.json({ ok: false, error: "action must be 'advance' or 'exam'" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to update enrollment" }, { status: 500 });
  }
}
