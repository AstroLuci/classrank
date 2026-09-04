import { NextResponse } from "next/server";
import { createClass } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const teacherPin = typeof body.teacherPin === "string" ? body.teacherPin.trim() : "";
    const rosterText = typeof body.rosterText === "string" ? body.rosterText : "";

    const studentNames = rosterText
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    if (!name) {
      return NextResponse.json({ error: "Class name is required." }, { status: 400 });
    }
    if (!/^\d{4,8}$/.test(teacherPin)) {
      return NextResponse.json(
        { error: "Teacher PIN must be 4–8 digits." },
        { status: 400 }
      );
    }
    if (studentNames.length < 2) {
      return NextResponse.json(
        { error: "Add at least two students (one name per line)." },
        { status: 400 }
      );
    }
    if (new Set(studentNames.map((n: string) => n.toLowerCase())).size !== studentNames.length) {
      return NextResponse.json(
        { error: "Student names must be unique." },
        { status: 400 }
      );
    }

    const created = await createClass({ name, teacherPin, studentNames });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create class." }, { status: 500 });
  }
}
