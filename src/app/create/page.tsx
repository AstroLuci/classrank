"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Created = {
  code: string;
  teacherPin: string;
  name: string;
  studentCount: number;
};

export default function CreateClassPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [teacherPin, setTeacherPin] = useState("");
  const [rosterText, setRosterText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, teacherPin, rosterText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create class.");
        return;
      }
      setCreated(data);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`classrank-pin-${data.code}`, data.teacherPin);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="atmosphere min-h-full flex-1">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
        {!created ? (
          <>
            <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-teal-950">
              Create a class
            </h1>
            <p className="mt-2 text-teal-900/65">
              Add your roster, set a teacher PIN, and share the class code with students.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="space-y-2">
                <Label htmlFor="name">Class name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Period 3 Biology"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">Teacher PIN (4–8 digits)</Label>
                <Input
                  id="pin"
                  inputMode="numeric"
                  pattern="\d{4,8}"
                  value={teacherPin}
                  onChange={(e) => setTeacherPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="4829"
                  required
                />
                <p className="text-xs text-teal-900/50">
                  You will need this PIN to view rankings and comments.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roster">Student roster</Label>
                <Textarea
                  id="roster"
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                  placeholder={"Alex Rivera\nJordan Lee\nSam Patel\nTaylor Brooks"}
                  rows={8}
                  required
                  className="font-mono text-sm"
                />
                <p className="text-xs text-teal-900/50">One full name per line. At least two students.</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 bg-teal-800 hover:bg-teal-700"
              >
                {loading ? "Creating…" : "Create class"}
              </Button>
            </form>
          </>
        ) : (
          <div className="animate-rise rounded-2xl border border-teal-900/10 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-wide text-teal-700">Ready</p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-teal-950">
              {created.name}
            </h1>
            <p className="mt-2 text-teal-900/65">
              {created.studentCount} students on the roster. Share the code below.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-teal-900 px-4 py-5 text-center text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Class code</p>
                <p className="mt-1 font-mono text-4xl font-semibold tracking-[0.25em]">
                  {created.code}
                </p>
              </div>
              <div className="rounded-xl border border-teal-900/10 bg-teal-50/80 px-4 py-3 text-sm">
                <span className="text-teal-900/60">Teacher PIN: </span>
                <span className="font-mono font-semibold text-teal-950">{created.teacherPin}</span>
                <p className="mt-1 text-xs text-teal-900/50">
                  Save this PIN. Students do not need it.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                className="bg-teal-800 hover:bg-teal-700"
                onClick={() => router.push(`/teacher/${created.code}`)}
              >
                Open teacher results
              </Button>
              <Link
                href={`/join?code=${created.code}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "inline-flex h-9 items-center justify-center"
                )}
              >
                Student join link
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
