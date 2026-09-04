import { NextResponse } from "next/server";
import { getClassByCode, toPublicClass } from "@/lib/store";

type Params = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { code } = await params;
  const session = await getClassByCode(code);
  if (!session) {
    return NextResponse.json({ error: "Class not found." }, { status: 404 });
  }
  return NextResponse.json(toPublicClass(session));
}
