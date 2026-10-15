"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Finora encountered an unexpected application error.", error.digest ?? "No error reference available.");
  }, [error]);
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5 py-12">
      <section className="card max-w-lg text-center">
        <p className="muted-label">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-bold text-navy">Finora could not load this page.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Your data has not been changed by this screen. Try again, or return to the home page.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="focus-ring min-h-11 rounded-xl bg-navy px-4 text-sm font-semibold text-white">Try again</button>
          <Link href="/" className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-semibold text-navy">Home</Link>
        </div>
      </section>
    </main>
  );
}
