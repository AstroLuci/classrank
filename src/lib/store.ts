import { nanoid } from "nanoid";
import type { ClassSession, PublicClass, ResultsPayload, StudentSummary } from "./types";
import { computeRankStats } from "./stats";
import { ensureSchema, getDb } from "./db";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateClassCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function createStudentList(names: string[]) {
  return names.map((name) => ({
    id: nanoid(10),
    name: name.trim(),
  }));
}

async function getSession(code: string): Promise<ClassSession | null> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT data FROM classes WHERE code = ?",
    args: [code.toUpperCase()],
  });
  const row = result.rows[0];
  if (!row || typeof row.data !== "string") return null;
  return JSON.parse(row.data) as ClassSession;
}

async function saveSession(session: ClassSession): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `
      INSERT INTO classes (code, data, created_at)
      VALUES (?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET data = excluded.data
    `,
    args: [session.code.toUpperCase(), JSON.stringify(session), session.createdAt],
  });
}

async function codeExists(code: string): Promise<boolean> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT 1 AS ok FROM classes WHERE code = ? LIMIT 1",
    args: [code.toUpperCase()],
  });
  return result.rows.length > 0;
}

export async function createClass(input: {
  name: string;
  teacherPin: string;
  studentNames: string[];
}): Promise<{ code: string; teacherPin: string; name: string; studentCount: number }> {
  let code = generateClassCode();
  while (await codeExists(code)) {
    code = generateClassCode();
  }

  const session: ClassSession = {
    id: nanoid(),
    code,
    name: input.name.trim(),
    teacherPin: input.teacherPin,
    students: createStudentList(input.studentNames),
    submissions: [],
    createdAt: new Date().toISOString(),
  };

  await saveSession(session);

  return {
    code: session.code,
    teacherPin: session.teacherPin,
    name: session.name,
    studentCount: session.students.length,
  };
}

export async function getClassByCode(code: string): Promise<ClassSession | null> {
  return getSession(code);
}

export function toPublicClass(session: ClassSession): PublicClass {
  return {
    code: session.code,
    name: session.name,
    students: session.students,
    submittedRaterIds: session.submissions.map((s) => s.raterId),
  };
}

export async function saveSubmission(input: {
  code: string;
  raterId: string;
  rankings: { studentId: string; rank: number; comment: string }[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession(input.code);
  if (!session) return { ok: false, error: "Class not found." };

  const rater = session.students.find((s) => s.id === input.raterId);
  if (!rater) return { ok: false, error: "Student not found in this class." };

  const classmates = session.students.filter((s) => s.id !== input.raterId);
  if (input.rankings.length !== classmates.length) {
    return { ok: false, error: "You must rank every classmate." };
  }

  const rankedIds = new Set(input.rankings.map((r) => r.studentId));
  if (rankedIds.has(input.raterId)) {
    return { ok: false, error: "You cannot rank yourself." };
  }
  for (const classmate of classmates) {
    if (!rankedIds.has(classmate.id)) {
      return { ok: false, error: "Every classmate must appear in your ranking." };
    }
  }

  const ranks = input.rankings.map((r) => r.rank).sort((a, b) => a - b);
  for (let i = 0; i < ranks.length; i++) {
    if (ranks[i] !== i + 1) {
      return { ok: false, error: "Ranks must be a unique sequence from 1 to n." };
    }
  }

  const now = new Date().toISOString();
  const existing = session.submissions.find((s) => s.raterId === input.raterId);
  if (existing) {
    existing.rankings = input.rankings.map((r) => ({
      studentId: r.studentId,
      rank: r.rank,
      comment: r.comment.trim(),
    }));
    existing.updatedAt = now;
  } else {
    session.submissions.push({
      id: nanoid(),
      raterId: input.raterId,
      rankings: input.rankings.map((r) => ({
        studentId: r.studentId,
        rank: r.rank,
        comment: r.comment.trim(),
      })),
      submittedAt: now,
      updatedAt: now,
    });
  }

  await saveSession(session);
  return { ok: true };
}

function buildSummaries(session: ClassSession): StudentSummary[] {
  return session.students.map((student) => {
    const feedback: StudentSummary["feedback"] = [];

    for (const submission of session.submissions) {
      if (submission.raterId === student.id) continue;
      const entry = submission.rankings.find((r) => r.studentId === student.id);
      if (!entry) continue;
      const rater = session.students.find((s) => s.id === submission.raterId);
      feedback.push({
        fromId: submission.raterId,
        from: rater?.name ?? "Unknown",
        rank: entry.rank,
        comment: entry.comment,
      });
    }

    feedback.sort((a, b) => a.rank - b.rank || a.from.localeCompare(b.from));

    const ranks = feedback.map((f) => f.rank);
    const stats = computeRankStats(ranks);

    return {
      studentId: student.id,
      name: student.name,
      averageRank: stats.mean,
      rankCount: stats.count,
      stats,
      feedback,
      comments: feedback.filter((f) => f.comment.length > 0),
    };
  });
}

export async function getResults(
  code: string,
  teacherPin: string
): Promise<{ ok: true; data: ResultsPayload } | { ok: false; error: string }> {
  const session = await getClassByCode(code);
  if (!session) return { ok: false, error: "Class not found." };
  if (session.teacherPin !== teacherPin) {
    return { ok: false, error: "Incorrect teacher PIN." };
  }

  const summaries = buildSummaries(session).sort((a, b) => {
    if (a.averageRank === null && b.averageRank === null) return a.name.localeCompare(b.name);
    if (a.averageRank === null) return 1;
    if (b.averageRank === null) return -1;
    return a.averageRank - b.averageRank;
  });

  return {
    ok: true,
    data: {
      code: session.code,
      name: session.name,
      students: session.students,
      submissions: session.submissions.map((s) => ({
        raterId: s.raterId,
        raterName: session.students.find((st) => st.id === s.raterId)?.name ?? "Unknown",
        submittedAt: s.submittedAt,
        rankings: s.rankings,
      })),
      summaries,
    },
  };
}
