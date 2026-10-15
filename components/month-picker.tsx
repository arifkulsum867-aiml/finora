"use client";

import { useRouter } from "next/navigation";

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  function change(value: string) {
    router.push(`?month=${encodeURIComponent(value)}`);
  }
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-muted">
      <span className="sr-only">Select month</span>
      <input aria-label="Select month" type="month" value={month} onChange={(event) => change(event.target.value)} className="field w-auto min-w-[150px] py-2 text-sm" />
    </label>
  );
}
