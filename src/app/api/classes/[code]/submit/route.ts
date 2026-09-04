import { NextResponse } from "next/server";
import { saveSubmission } from "@/lib/store";

type Params = { params: Promise<{ code: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const body = await request.json();
    const raterId = typeof body.raterId === "string" ? body.raterId : "";
    const rankings = Array.isArray(body.rankings) ? body.rankings : null;

    if (!raterId || !rankings) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    const result = await saveSubmission({
      code,
      raterId,
      rankings: rankings.map(
        (r: { studentId?: string; rank?: number; comment?: string }) => ({
          studentId: String(r.studentId ?? ""),
          rank: Number(r.rank),
          comment: String(r.comment ?? ""),
        })
      ),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save ranking." }, { status: 500 });
  }
}
