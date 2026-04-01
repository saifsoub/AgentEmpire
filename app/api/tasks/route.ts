import { NextRequest, NextResponse } from "next/server";
import { getTasks, addTask, updateTaskStatus } from "@/lib/store";
import { createTaskSchema } from "@/lib/validators";

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const task = await addTask(parsed.data);
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body as { id: string; status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED" };
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
    const task = await updateTaskStatus(id, status);
    return NextResponse.json(task);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
