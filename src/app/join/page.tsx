"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PublicClass } from "@/lib/types";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code")?.toUpperCase() ?? "");
  const [session, setSession] = useState<PublicClass | null>(null);
  const [raterId, setRaterId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial = searchParams.get("code");
    if (initial && initial.length >= 4) {
      void lookup(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup(nextCode: string) {
    setError(null);
    setLoading(true);
    setSession(null);
    try {
      const res = await fetch(`/api/classes/${encodeURIComponent(nextCode.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Class not found.");
        return;
      }
      setSession(data);
      setCode(data.code);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    void lookup(code);
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !raterId) return;
    router.push(`/rank/${session.code}?student=${raterId}`);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-teal-950">
        Join your class
      </h1>
      <p className="mt-2 text-teal-900/65">
        Enter the class code from your teacher, then select your name.
      </p>

      {!session ? (
        <form onSubmit={handleLookup} className="mt-8 flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Class code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AB12CD"
              className="font-mono uppercase tracking-widest"
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={loading} className="h-11 bg-teal-800 hover:bg-teal-700">
            {loading ? "Looking up…" : "Find class"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleContinue} className="mt-8 flex flex-col gap-5">
          <div className="rounded-xl border border-teal-900/10 bg-white/80 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-teal-700">Class</p>
            <p className="font-medium text-teal-950">{session.name}</p>
            <p className="font-mono text-sm text-teal-900/50">{session.code}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student">Who are you?</Label>
            <select
              id="student"
              value={raterId}
              onChange={(e) => setRaterId(e.target.value)}
              required
              className="flex h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select your name</option>
              {session.students.map((s) => {
                const submitted = session.submittedRaterIds.includes(s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {submitted ? " (already submitted — can update)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="h-11 bg-teal-800 hover:bg-teal-700">
              Continue to ranking
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSession(null);
                setRaterId("");
              }}
            >
              Different code
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}

export default function JoinPage() {
  return (
    <div className="atmosphere min-h-full flex-1">
      <SiteHeader />
      <Suspense
        fallback={
          <main className="mx-auto w-full max-w-xl px-4 py-10 text-teal-900/60">Loading…</main>
        }
      >
        <JoinForm />
      </Suspense>
    </div>
  );
}
