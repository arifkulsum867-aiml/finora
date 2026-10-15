"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteBudget, saveBudget } from "@/app/actions";
import { budgetStatus, sumTransactions } from "@/lib/analytics";
import { formatMoney } from "@/lib/analytics/money";
import { CATEGORIES, type Budget, type Category, type Transaction } from "@/types/finance";

export function BudgetManager({ budgets, transactions, month }: { budgets: Budget[]; transactions: Transaction[]; month: string }) {
  const [feedback, setFeedback] = useState("");
  const [pending, startTransition] = useTransition();
  function add(formData: FormData) {
    startTransition(async () => {
      const result = await saveBudget(formData);
      setFeedback(result.message);
    });
  }
  function remove(id: string) {
    if (!window.confirm("Delete this budget? Your transactions will not be affected.")) return;
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result = await deleteBudget(formData);
      setFeedback(result.message);
    });
  }

  const overallSpent = sumTransactions(transactions);
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4">
        {feedback && <p role="status" className="rounded-xl bg-mint/45 px-4 py-3 text-sm text-navy">{feedback}</p>}
        {budgets.length === 0 ? (
          <div className="card py-12 text-center">
            <p className="font-semibold text-navy">No budgets for this month</p>
            <p className="mt-2 text-sm text-muted">Create an overall budget or a category limit to get started.</p>
          </div>
        ) : budgets.map((budget) => {
          const spent = budget.category
            ? sumTransactions(transactions.filter((transaction) => transaction.category === budget.category))
            : overallSpent;
          const status = budgetStatus(spent, budget.amount);
          const progress = Math.min(100, Math.max(0, status.utilization ?? 0));
          const warning = status.warning === "exceeded" ? "Over budget" : status.warning === "reached" ? "Budget reached" : status.warning === "approaching" ? "80% or more used" : "Within budget";
          return (
            <article key={budget.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="muted-label">{budget.category ?? "Overall monthly budget"}</p>
                  <p className="mt-2 text-2xl font-bold text-navy">{formatMoney(spent)} <span className="text-sm font-medium text-muted">of {formatMoney(budget.amount)}</span></p>
                </div>
                <button disabled={pending} onClick={() => remove(budget.id)} className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700" aria-label={`Delete ${budget.category ?? "overall"} budget`}><Trash2 size={16} /></button>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-canvas">
                <div className={`h-full rounded-full transition-all ${status.warning === "exceeded" ? "bg-rose-500" : status.warning === "approaching" ? "bg-amber-500" : "bg-emerald"}`} style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className={status.warning === "exceeded" ? "font-semibold text-rose-700" : status.warning === "approaching" ? "font-semibold text-amber-700" : "text-muted"}>
                  {warning}{status.utilization === null ? "" : ` · ${Math.round(status.utilization)}%`}
                </span>
                <span className={`font-semibold ${status.overspent ? "text-rose-700" : "text-ink"}`}>
                  {status.overspent ? `${formatMoney(Math.abs(Number(status.remaining)))} over` : `${formatMoney(status.remaining)} remaining`}
                </span>
              </div>
              {status.warning === "approaching" && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">You have used at least 80% of this budget this month.</p>}
              {status.warning === "reached" && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">You have used the full budget. Further spending will exceed it.</p>}
              {status.warning === "exceeded" && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-900">This budget has been exceeded. Review your spending if helpful.</p>}
            </article>
          );
        })}
      </section>

      <aside className="card xl:sticky xl:top-8">
        <p className="muted-label">Plan your month</p>
        <h2 className="mt-2 text-lg font-bold text-navy">Set a budget</h2>
        <p className="mt-2 text-sm leading-6 text-muted">One overall budget and optional category limits. Saving the same month and category updates the existing amount.</p>
        <form action={add} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-ink">Month
            <input type="month" name="month" required defaultValue={month} className="field mt-1.5" />
          </label>
          <label className="block text-sm font-semibold text-ink">Budget type
            <select name="category" className="field mt-1.5">
              <option value="">Overall budget</option>
              {CATEGORIES.map((category: Category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink">Limit (INR)
            <input type="number" name="amount" min="0.01" max="9999999999.99" step="0.01" required className="field mt-1.5" placeholder="e.g. 25000.00" />
          </label>
          <button disabled={pending} className="focus-ring min-h-11 w-full rounded-xl bg-navy px-4 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Save budget"}</button>
        </form>
        <p className="mt-4 text-xs leading-5 text-muted">Warnings are displayed here in the app at 80% and 100%. Finora does not send push, SMS, or email alerts.</p>
      </aside>
    </div>
  );
}
