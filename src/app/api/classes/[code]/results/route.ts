import { NextResponse } from "next/server";
import { getResults } from "@/lib/store";

type Params = { params: Promise<{ code: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const body = await request.json();
    const teacherPin = typeof body.teacherPin === "string" ? body.teacherPin : "";

    const result = await getResults(code, teacherPin);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: "Could not load results." }, { status: 500 });
  }
}
