"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const normalized = code.trim().toUpperCase();
    try {
      const res = await fetch(`/api/classes/${encodeURIComponent(normalized)}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherPin: pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not open results.");
        return;
      }
      sessionStorage.setItem(`classrank-pin-${data.code}`, pin);
      router.push(`/teacher/${data.code}`);
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
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-teal-950">
          Teacher login
        </h1>
        <p className="mt-2 text-teal-900/65">
          Enter your class code and teacher PIN to view rankings and comments.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="code">Class code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AB12CD"
              className="font-mono uppercase tracking-widest"
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">Teacher PIN</Label>
            <Input
              id="pin"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="h-11 bg-teal-800 hover:bg-teal-700">
            {loading ? "Opening…" : "View results"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-teal-900/55">
          Don&apos;t have a class yet?{" "}
          <Link
            href="/create"
            className={cn(buttonVariants({ variant: "link" }), "h-auto px-0 text-teal-800")}
          >
            Create a class
          </Link>
        </p>
      </main>
    </div>
  );
}
