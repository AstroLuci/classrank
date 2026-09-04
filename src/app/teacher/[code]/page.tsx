"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatStat } from "@/lib/stats";
import { downloadResultsCsv } from "@/lib/export-results";
import type { ResultsPayload } from "@/lib/types";
import { Download } from "lucide-react";

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[4.5rem]">
      <p className="font-mono text-sm font-semibold tabular-nums text-teal-950 sm:text-base">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-teal-900/45">{label}</p>
    </div>
  );
}

export default function TeacherResultsPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const [pin, setPin] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(`classrank-pin-${code.toUpperCase()}`) ?? "";
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultsPayload | null>(null);
  const autoLoaded = useRef(false);

  async function loadResults(e?: React.FormEvent, pinOverride?: string) {
    e?.preventDefault();
    const nextPin = pinOverride ?? pin;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${encodeURIComponent(code)}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherPin: nextPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResults(null);
        setError(data.error ?? "Could not load results.");
        return;
      }
      setResults(data);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`classrank-pin-${data.code}`, nextPin);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoLoaded.current || !pin) return;
    autoLoaded.current = true;
    void loadResults(undefined, pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="atmosphere min-h-full flex-1">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-teal-950">
          Teacher results
        </h1>
        <p className="mt-2 text-teal-900/65">
          Class code <span className="font-mono font-medium text-teal-900">{code.toUpperCase()}</span>
          {" · "}
          <Link href="/teacher" className="text-teal-800 underline-offset-2 hover:underline">
            Switch class
          </Link>
        </p>

        {!results ? (
          <form onSubmit={loadResults} className="mt-8 max-w-sm space-y-4">
            {loading && !error ? (
              <p className="text-sm text-teal-900/60">Opening results…</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pin">Teacher PIN</Label>
                  <Input
                    id="pin"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="••••"
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={loading} className="bg-teal-800 hover:bg-teal-700">
                  {loading ? "Opening…" : "View results"}
                </Button>
              </>
            )}
          </form>
        ) : (
          <div className="mt-8 space-y-10">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-medium text-teal-950">{results.name}</h2>
              <Badge variant="secondary" className="bg-teal-100 text-teal-900">
                {results.submissions.length} / {results.students.length} submitted
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadResults()}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-teal-800 hover:bg-teal-700"
                onClick={() => downloadResultsCsv(results)}
              >
                <Download className="size-3.5" />
                Download results
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setResults(null)}>
                Lock
              </Button>
            </div>

            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800/70">
                Rank statistics
              </h3>
              <p className="mt-1 text-sm text-teal-900/55">
                Lower mean is closer to rank 1. SD is sample standard deviation (n−1) — higher SD
                means classmates disagreed more about this student.
              </p>

              <div className="mt-4 overflow-x-auto rounded-xl border border-teal-900/10 bg-white/85 backdrop-blur-sm">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-teal-900/10 text-[11px] uppercase tracking-wide text-teal-900/50">
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-3 py-3 font-medium">n</th>
                      <th className="px-3 py-3 font-medium">Mean</th>
                      <th className="px-3 py-3 font-medium">SD</th>
                      <th className="px-3 py-3 font-medium">Median</th>
                      <th className="px-3 py-3 font-medium">Min</th>
                      <th className="px-3 py-3 font-medium">Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-900/10">
                    {results.summaries.map((summary, index) => (
                      <tr key={summary.studentId} className="align-middle">
                        <td className="px-4 py-3">
                          <span className="flex size-7 items-center justify-center rounded-full bg-teal-800 text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-teal-950">{summary.name}</td>
                        <td className="px-3 py-3 font-mono tabular-nums text-teal-900">
                          {summary.stats.count}
                        </td>
                        <td className="px-3 py-3 font-mono tabular-nums font-semibold text-teal-950">
                          {formatStat(summary.stats.mean)}
                        </td>
                        <td className="px-3 py-3 font-mono tabular-nums text-teal-900">
                          {formatStat(summary.stats.sd)}
                        </td>
                        <td className="px-3 py-3 font-mono tabular-nums text-teal-900">
                          {formatStat(summary.stats.median)}
                        </td>
                        <td className="px-3 py-3 font-mono tabular-nums text-teal-900">
                          {summary.stats.min ?? "—"}
                        </td>
                        <td className="px-3 py-3 font-mono tabular-nums text-teal-900">
                          {summary.stats.max ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800/70">
                Who said what
              </h3>
              <p className="mt-1 text-sm text-teal-900/55">
                For each student, every classmate who ranked them — their rank and any comment.
              </p>

              <div className="mt-4 space-y-4">
                {results.summaries.map((summary) => (
                  <article
                    key={`who-${summary.studentId}`}
                    className="rounded-xl border border-teal-900/10 bg-white/85 p-4 backdrop-blur-sm sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-teal-900/10 pb-3">
                      <div>
                        <h4 className="text-lg font-medium text-teal-950">{summary.name}</h4>
                        <p className="mt-0.5 text-xs text-teal-900/50">
                          What peers said about this student
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <StatCell label="Mean" value={formatStat(summary.stats.mean)} />
                        <StatCell label="SD" value={formatStat(summary.stats.sd)} />
                        <StatCell label="n" value={String(summary.stats.count)} />
                      </div>
                    </div>

                    {summary.feedback.length === 0 ? (
                      <p className="mt-4 text-sm text-teal-900/45">No peer rankings yet.</p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {summary.feedback.map((item) => (
                          <li
                            key={`${summary.studentId}-${item.fromId}`}
                            className="rounded-lg bg-teal-50/70 px-3 py-3 sm:px-4"
                          >
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              <span className="inline-flex size-6 items-center justify-center rounded-full bg-teal-800 text-[11px] font-semibold text-white">
                                {item.rank}
                              </span>
                              <span className="font-medium text-teal-950">{item.from}</span>
                              <span className="text-xs text-teal-900/45">
                                ranked {summary.name.split(" ")[0]} #{item.rank}
                              </span>
                            </div>
                            {item.comment ? (
                              <p className="mt-2 pl-8 text-sm leading-relaxed text-teal-950/90">
                                &ldquo;{item.comment}&rdquo;
                              </p>
                            ) : (
                              <p className="mt-2 pl-8 text-sm italic text-teal-900/40">
                                No comment left
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800/70">
                Individual submissions
              </h3>
              <p className="mt-1 text-sm text-teal-900/55">
                Full ranking list from each student, including comments they wrote about others.
              </p>
              {results.submissions.length === 0 ? (
                <p className="mt-3 text-sm text-teal-900/55">No submissions yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {results.submissions.map((sub) => (
                    <div
                      key={sub.raterId}
                      className="rounded-xl border border-teal-900/10 bg-white/80 p-4 backdrop-blur-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-medium text-teal-950">
                          {sub.raterName}
                          <span className="ml-2 text-xs font-normal text-teal-900/45">
                            ranked everyone else
                          </span>
                        </p>
                        <p className="text-xs text-teal-900/45">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <ol className="mt-3 space-y-3">
                        {[...sub.rankings]
                          .sort((a, b) => a.rank - b.rank)
                          .map((r) => {
                            const name =
                              results.students.find((s) => s.id === r.studentId)?.name ??
                              "Unknown";
                            return (
                              <li key={r.studentId} className="flex gap-3 text-sm">
                                <span className="w-6 shrink-0 font-mono text-teal-700">
                                  {r.rank}.
                                </span>
                                <div className="min-w-0">
                                  <span className="font-medium text-teal-950">{name}</span>
                                  {r.comment ? (
                                    <p className="mt-0.5 text-teal-900/70">
                                      {sub.raterName.split(" ")[0]} on {name.split(" ")[0]}: &ldquo;
                                      {r.comment}&rdquo;
                                    </p>
                                  ) : (
                                    <p className="mt-0.5 text-xs italic text-teal-900/40">
                                      No comment
                                    </p>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
