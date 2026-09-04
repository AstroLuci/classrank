import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={cn("relative z-10", className)}>
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-teal-950 transition-colors group-hover:text-teal-800 sm:text-3xl">
            ClassRank
          </span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm sm:gap-2">
          <Link
            href="/join"
            className="rounded-lg px-2.5 py-1.5 text-teal-900/70 transition-colors hover:bg-teal-900/5 hover:text-teal-950 sm:px-3"
          >
            Student join
          </Link>
          <Link
            href="/teacher"
            className="rounded-lg px-2.5 py-1.5 text-teal-900/70 transition-colors hover:bg-teal-900/5 hover:text-teal-950 sm:px-3"
          >
            Teacher login
          </Link>
          <Link
            href="/create"
            className="rounded-lg bg-teal-800 px-2.5 py-1.5 font-medium text-white transition-colors hover:bg-teal-700 sm:px-3"
          >
            Create class
          </Link>
        </nav>
      </div>
    </header>
  );
}
