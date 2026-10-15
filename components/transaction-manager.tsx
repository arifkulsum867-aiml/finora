"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { deleteTransaction, saveTransaction } from "@/app/actions";
import { formatMoney } from "@/lib/analytics/money";
import { suggestCategory } from "@/lib/analytics/category-suggestion";
import { transactionsToCsv } from "@/lib/csv";
import { CATEGORIES, PAYMENT_METHODS, type Category, type PaymentMethod, type Transaction } from "@/types/finance";

type Draft = {
  id?: string;
  description: string;
  amount: string;
  category: Category;
  transaction_date: string;
  payment_method: PaymentMethod;
  notes: string;
};
const today = () => new Date().toISOString().slice(0, 10);
const emptyDraft = (): Draft => ({ description: "", amount: "", category: "Other", transaction_date: today(), payment_method: "UPI", notes: "" });

export function TransactionManager({ transactions }: { transactions: Transaction[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const visible = useMemo(() => transactions
    .filter((item) => item.description.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
    .filter((item) => category === "All" || item.category === category)
    .sort((a, b) => sort === "oldest"
      ? a.transaction_date.localeCompare(b.transaction_date)
      : sort === "amount"
        ? Number(b.amount) - Number(a.amount)
        : b.transaction_date.localeCompare(a.transaction_date)), [transactions, query, category, sort]);
  const pageCount = Math.max(1, Math.ceil(visible.length / 20));
  const activePage = Math.min(page, pageCount - 1);
  const pageVisible = visible.slice(activePage * 20, activePage * 20 + 20);

  function exportCsv() {
    const csv = transactionsToCsv(visible);
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `finora-transactions-${today()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setFeedback(`${visible.length} transactions exported.`);
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await saveTransaction(formData);
      setFeedback(result.message);
      if (result.ok) setEditing(null);
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this transaction? This action cannot be undone.")) return;
    const data = new FormData();
    data.set("id", id);
    startTransition(async () => {
      const result = await deleteTransaction(data);
      setFeedback(result.message);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setEditing(emptyDraft()); setFeedback(""); }} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white hover:bg-navy/90"><Plus size={16} /> Add expense</button>
          <button onClick={exportCsv} disabled={!visible.length} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-40"><Download size={16} /> Export CSV</button>
        </div>
        <span className="text-xs text-muted">{visible.length} of {transactions.length} transactions</span>
      </div>
      {feedback && <p role="status" className="rounded-xl bg-mint/45 px-4 py-3 text-sm text-navy">{feedback}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="relative sm:col-span-1">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
          <input className="field pl-10" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="Search description" aria-label="Search transactions" />
        </label>
        <select className="field" value={category} onChange={(event) => { setCategory(event.target.value); setPage(0); }} aria-label="Filter by category">
          <option>All</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="field" value={sort} onChange={(event) => { setSort(event.target.value); setPage(0); }} aria-label="Sort transactions">
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="amount">Largest amount</option>
        </select>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/45 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="transaction-form-title">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-soft sm:max-w-xl sm:rounded-3xl sm:p-7">
            <div className="flex items-start justify-between">
              <div><p className="muted-label">{editing.id ? "Update entry" : "New entry"}</p><h2 id="transaction-form-title" className="mt-1 text-xl font-bold text-navy">{editing.id ? "Edit transaction" : "Add an expense"}</h2></div>
              <button onClick={() => setEditing(null)} className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-canvas" aria-label="Close form"><X size={18} /></button>
            </div>
            <form action={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={editing.id ?? ""} />
              <label className="text-sm font-semibold text-ink sm:col-span-2">Description
                <input required maxLength={100} className="field mt-1.5" name="description" value={editing.description} onChange={(event) => {
                  const description = event.target.value;
                  const suggestion = suggestCategory(description);
                  setEditing((current) => current ? { ...current, description, ...(suggestion ? { category: suggestion } : {}) } : current);
                }} placeholder="e.g. Coffee and breakfast" />
              </label>
              <label className="text-sm font-semibold text-ink">Amount (INR)
                <input required type="number" min="0.01" max="9999999999.99" step="0.01" className="field mt-1.5" name="amount" value={editing.amount} onChange={(event) => setEditing({ ...editing, amount: event.target.value })} placeholder="0.00" />
              </label>
              <label className="text-sm font-semibold text-ink">Category
                <select className="field mt-1.5" name="category" value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value as Category })}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              {suggestCategory(editing.description) && <p className="text-xs font-normal text-emerald sm:col-span-2">Category suggestion: {suggestCategory(editing.description)} (you can change it).</p>}
              <label className="text-sm font-semibold text-ink">Date
                <input required type="date" max={today()} className="field mt-1.5" name="transaction_date" value={editing.transaction_date} onChange={(event) => setEditing({ ...editing, transaction_date: event.target.value })} />
              </label>
              <label className="text-sm font-semibold text-ink">Payment method
                <select className="field mt-1.5" name="payment_method" value={editing.payment_method} onChange={(event) => setEditing({ ...editing, payment_method: event.target.value as PaymentMethod })}>{PAYMENT_METHODS.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="text-sm font-semibold text-ink sm:col-span-2">Notes <span className="font-normal text-muted">(optional)</span>
                <textarea maxLength={500} className="field mt-1.5 min-h-20 resize-y" name="notes" value={editing.notes} onChange={(event) => setEditing({ ...editing, notes: event.target.value })} />
              </label>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <button type="button" onClick={() => setEditing(null)} className="focus-ring min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink">Cancel</button>
                <button disabled={isPending} className="focus-ring min-h-11 rounded-xl bg-navy px-5 text-sm font-semibold text-white disabled:opacity-60">{isPending ? "Saving…" : "Save expense"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {visible.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-semibold text-navy">{transactions.length ? "No matching transactions" : "No transactions yet"}</p>
            <p className="mt-2 text-sm text-muted">{transactions.length ? "Try another search or filter." : "Add your first expense to start seeing your spending clearly."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-canvas text-xs uppercase tracking-wide text-muted"><tr><th className="px-5 py-3 font-semibold">Description</th><th className="px-5 py-3 font-semibold">Category</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 font-semibold">Payment</th><th className="px-5 py-3 text-right font-semibold">Amount</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead>
              <tbody className="divide-y divide-line">
                {pageVisible.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas/70">
                    <td className="px-5 py-4"><p className="font-semibold text-navy">{item.description}</p><p className="mt-1 text-xs text-muted">{item.is_demo ? "Demo data" : item.notes || "Personal transaction"}</p></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-ink">{item.category}</span></td>
                    <td className="px-5 py-4 text-muted">{new Date(`${item.transaction_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-5 py-4 text-muted">{item.payment_method}</td>
                    <td className="px-5 py-4 text-right font-bold text-navy">{formatMoney(item.amount)}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing({ id: item.id, description: item.description, amount: item.amount, category: item.category, transaction_date: item.transaction_date, payment_method: item.payment_method, notes: item.notes ?? "" }); setFeedback(""); }} className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-mint/50 hover:text-navy" aria-label={`Edit ${item.description}`}><Pencil size={16} /></button>
                      <button disabled={isPending} onClick={() => remove(item.id)} className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700" aria-label={`Delete ${item.description}`}><Trash2 size={16} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {visible.length > 20 && <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <p className="text-xs text-muted">Showing {activePage * 20 + 1}–{Math.min(activePage * 20 + 20, visible.length)} of {visible.length}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(0, activePage - 1))} disabled={activePage === 0} className="focus-ring min-h-9 rounded-lg border border-line px-3 text-xs font-semibold text-navy disabled:opacity-40">Previous</button>
            <button onClick={() => setPage(Math.min(pageCount - 1, activePage + 1))} disabled={activePage >= pageCount - 1} className="focus-ring min-h-9 rounded-lg border border-line px-3 text-xs font-semibold text-navy disabled:opacity-40">Next</button>
          </div>
        </div>}
      </div>
    </div>
  );
}
