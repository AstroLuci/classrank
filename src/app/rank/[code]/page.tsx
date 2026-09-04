"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { RankingList, type RankableStudent } from "@/components/ranking-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { PublicClass } from "@/lib/types";

function RankForm() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const code = params.code;
  const studentId = searchParams.get("student") ?? "";

  const [session, setSession] = useState<PublicClass | null>(null);
  const [ordered, setOrdered] = useState<RankableStudent[]>([]);
  const [error, setError] = useState<string | null>(
    code && studentId ? null : "Missing class or student. Join from the class code page."
  );
  const [loading, setLoading] = useState(Boolean(code && studentId));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const rater = useMemo(
    () => session?.students.find((s) => s.id === studentId) ?? null,
    [session, studentId]
  );

  useEffect(() => {
    if (!code || !studentId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/classes/${encodeURIComponent(code)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Class not found.");
          return;
        }
        setSession(data);
        const classmates = (data as PublicClass).students
          .filter((s) => s.id !== studentId)
          .map((s) => ({ id: s.id, name: s.name, comment: "" }));
        setOrdered(classmates);
      } catch {
        if (!cancelled) setError("Network error. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [code, studentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !rater) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const rankings = ordered.map((s, index) => ({
        studentId: s.id,
        rank: index + 1,
        comment: s.comment,
      }));
      const res = await fetch(`/api/classes/${encodeURIComponent(session.code)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raterId: rater.id, rankings }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save ranking.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <p className="text-teal-900/60">Loading roster…</p>
      ) : error && !session ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Link
            href="/join"
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
          >
            Back to join
          </Link>
        </div>
      ) : session && rater ? (
        <>
          <div className="mb-6">
            <p className="text-sm text-teal-700">{session.name}</p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-teal-950 sm:text-4xl">
              Rank your classmates
            </h1>
            <p className="mt-2 text-teal-900/65">
              Hi {rater.name}. Drag to reorder — <strong>1</strong> is highest,{" "}
              <strong>{ordered.length || "n"}</strong> is lowest. Add an optional comment for each
              person, then submit.
            </p>
          </div>

          {saved ? (
            <div className="animate-rise rounded-2xl border border-teal-900/10 bg-white/85 p-6 text-center shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="mx-auto size-10 text-teal-700" />
              <h2 className="mt-3 text-xl font-medium text-teal-950">Ranking submitted</h2>
              <p className="mt-2 text-sm text-teal-900/60">
                Your teacher can view results with their PIN. You can update your ranking anytime
                by joining again.
              </p>
              <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setSaved(false)}
                  className="border-teal-800/20"
                >
                  Edit ranking
                </Button>
                <Link
                  href="/"
                  className={cn(
                    buttonVariants(),
                    "inline-flex bg-teal-800 text-white hover:bg-teal-700"
                  )}
                >
                  Done
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-teal-800/60">
                <span>Highest</span>
                <span>Drag to reorder</span>
              </div>
              <RankingList students={ordered} onChange={setOrdered} />
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-teal-800/60">
                <span>Lowest</span>
                <span>
                  {ordered.length} classmate{ordered.length === 1 ? "" : "s"}
                </span>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={saving || ordered.length === 0}
                className="h-12 w-full bg-teal-800 text-base hover:bg-teal-700 sm:w-auto sm:px-8"
              >
                {saving ? "Submitting…" : "Submit ranking"}
              </Button>
            </form>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>Student not found in this class.</AlertDescription>
          </Alert>
          <Link
            href={`/join?code=${code}`}
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
          >
            Pick your name
          </Link>
        </div>
      )}
    </main>
  );
}

export default function RankPage() {
  return (
    <div className="atmosphere min-h-full flex-1">
      <SiteHeader />
      <Suspense
        fallback={
          <main className="mx-auto w-full max-w-2xl px-4 py-10 text-teal-900/60">Loading…</main>
        }
      >
        <RankForm />
      </Suspense>
    </div>
  );
}
