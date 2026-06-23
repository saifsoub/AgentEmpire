import { NextResponse } from "next/server";
import { getUniversityEnrollments, enrollAgentInProgram } from "@/lib/store";
import { universityPrograms, universityFaculty } from "@/lib/city-university";
import { enrollAgentSchema } from "@/lib/validators";

export async function GET() {
  try {
    const enrollments = await getUniversityEnrollments();
    return NextResponse.json({ ok: true, enrollments, programs: universityPrograms, faculty: universityFaculty });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to load university" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = enrollAgentSchema.parse(await request.json());
    const enrollment = await enrollAgentInProgram(body);
    return NextResponse.json({ ok: true, enrollment });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to enroll agent" }, { status: 400 });
  }
}
