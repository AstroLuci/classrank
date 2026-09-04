import Link from "next/link";
import { ArrowRight, MessageSquareText, ShieldCheck, ListOrdered } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="atmosphere relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="atmosphere-blob pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-teal-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="atmosphere-blob pointer-events-none absolute -right-16 top-40 size-80 rounded-full bg-teal-700/15 blur-3xl"
        style={{ animationDelay: "-4s" }}
      />

      <SiteHeader />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <div className="max-w-2xl">
          <p className="animate-rise font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-teal-950 sm:text-7xl">
            ClassRank
          </p>
          <h1 className="animate-rise-delay-1 mt-5 max-w-xl text-2xl font-medium leading-snug text-teal-900/85 sm:text-3xl">
            Students privately rank classmates from 1 to n and leave a comment on each one.
          </h1>
          <p className="animate-rise-delay-2 mt-4 max-w-lg text-base leading-relaxed text-teal-900/65 sm:text-lg">
            Create a class roster, share the code, and collect ordered rankings with optional notes.
            Only teachers with the PIN can see results.
          </p>

          <div className="animate-rise-delay-2 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/create"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 bg-teal-800 px-6 text-base text-white hover:bg-teal-700"
              )}
            >
              Create a class
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/join"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 border-teal-800/20 bg-white/60 px-6 text-base text-teal-950 backdrop-blur-sm hover:bg-white/90"
              )}
            >
              Student join
            </Link>
            <Link
              href="/teacher"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 border-teal-800/20 bg-white/60 px-6 text-base text-teal-950 backdrop-blur-sm hover:bg-white/90"
              )}
            >
              Teacher login
            </Link>
          </div>
        </div>

        <section className="mt-16 grid gap-8 border-t border-teal-900/10 pt-10 sm:mt-20 sm:grid-cols-3 sm:gap-6">
          <div>
            <ListOrdered className="mb-3 size-5 text-teal-700" />
            <h2 className="font-medium text-teal-950">Rank 1 to n</h2>
            <p className="mt-1 text-sm leading-relaxed text-teal-900/60">
              Drag classmates into order. Position 1 is the top rank; n is the last.
            </p>
          </div>
          <div>
            <MessageSquareText className="mb-3 size-5 text-teal-700" />
            <h2 className="font-medium text-teal-950">Comment per person</h2>
            <p className="mt-1 text-sm leading-relaxed text-teal-900/60">
              Add an optional note beside every classmate before submitting.
            </p>
          </div>
          <div>
            <ShieldCheck className="mb-3 size-5 text-teal-700" />
            <h2 className="font-medium text-teal-950">Teacher-only results</h2>
            <p className="mt-1 text-sm leading-relaxed text-teal-900/60">
              Average ranks and comments stay behind your PIN until you open them.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
