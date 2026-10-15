"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import type { SpendingInsight } from "@/lib/analytics";

const tone = {
  notice: "border-amber-100 bg-amber-50 text-amber-950",
  positive: "border-emerald/15 bg-mint/35 text-navy",
  suggestion: "border-blue-100 bg-blue-50 text-blue-950",
};

export function InsightCards({ insights }: { insights: SpendingInsight[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = insights.filter((item) => !dismissed.includes(item.title));
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-live="polite">
      {visible.map((insight) => (
        <article key={insight.title} className={`rounded-2xl border p-5 sm:p-6 ${tone[insight.kind]}`}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/70"><Lightbulb size={17} /></span>
            <div className="min-w-0 flex-1"><p className="font-bold">{insight.title}</p><p className="mt-2 text-sm leading-6 opacity-85">{insight.message}</p></div>
            {insight.kind === "notice" && <button onClick={() => setDismissed((previous) => [...previous, insight.title])} className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-current/70 hover:bg-white/70" aria-label={`Dismiss ${insight.title}`} title="Dismiss insight"><X size={16} /></button>}
          </div>
        </article>
      ))}
      {visible.length === 0 && <p className="rounded-xl border border-line bg-white p-5 text-sm text-muted">You dismissed the insights for this view. They can appear again when you reload.</p>}
    </div>
  );
}
