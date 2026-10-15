import { PageHeader } from "@/components/page-header";
import { MonthPicker } from "@/components/month-picker";
import { CategoryChart, SpendingBarChart } from "@/components/finance-charts";
import { getFinanceData } from "@/lib/finance-data";
import { compareMonths, summarizeMonth, sumBudget } from "@/lib/analytics";
import { formatMoney, toCents } from "@/lib/analytics/money";
import { monthName, selectedMonth } from "@/lib/page-month";
import { shiftMonth } from "@/lib/date-utils";

type SearchParams = Promise<{ month?: string }>;

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const month = selectedMonth((await searchParams).month);
  const data = await getFinanceData(month);
  if (!data) return null;
  const summary = summarizeMonth(data.current);
  const previous = summarizeMonth(data.previous);
  const comparison = compareMonths(summary.total, previous.total);
  const monthTotals = new Map<string, number>();
  for (const transaction of data.allTransactions) {
    const key = transaction.transaction_date.slice(0, 7);
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + toCents(transaction.amount));
  }
  const monthly = Array.from({ length: 6 }, (_, index) => shiftMonth(month, index - 5)).map((key) => ({
    label: new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" }).format(new Date(`${key}-01T00:00:00Z`)),
    amount: (monthTotals.get(key) ?? 0) / 100,
  }));
  const budget = sumBudget(data.budgets);
  const actualVsBudget = budget === "0.00"
    ? []
    : [{ label: "This month", amount: Number(summary.total) }, { label: "Budget", amount: Number(budget) }];
  const monthComparison = [
    { label: "Previous", amount: Number(previous.total) },
    { label: "Selected", amount: Number(summary.total) },
  ];

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Analytics" description={`Explore your real transaction patterns and budget status for ${monthName(month)}.`} />
        <div className="sm:mb-7"><MonthPicker month={month} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card"><p className="muted-label">Spent this month</p><p className="mt-3 text-2xl font-bold text-navy">{formatMoney(summary.total)}</p></article>
        <article className="card"><p className="muted-label">Transactions</p><p className="mt-3 text-2xl font-bold text-navy">{summary.transactionCount}</p></article>
        <article className="card"><p className="muted-label">Average expense</p><p className="mt-3 text-2xl font-bold text-navy">{formatMoney(summary.average)}</p></article>
        <article className="card"><p className="muted-label">Month-on-month</p><p className="mt-3 text-2xl font-bold text-navy">{comparison.percentage === null ? "—" : `${comparison.percentage > 0 ? "+" : ""}${comparison.percentage.toFixed(1)}%`}</p><p className="mt-1 text-xs text-muted">{formatMoney(comparison.amount)} compared with {monthName(shiftMonth(month, -1))}</p></article>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="card min-w-0"><p className="muted-label">Six-month view</p><h2 className="mb-3 mt-1 text-lg font-bold text-navy">Monthly spending</h2><SpendingBarChart data={monthly} label="Monthly spending trend" /></section>
        <section className="card min-w-0"><p className="muted-label">Selected month</p><h2 className="mb-3 mt-1 text-lg font-bold text-navy">Category breakdown</h2><CategoryChart data={summary.byCategory} /></section>
        <section className="card min-w-0"><p className="muted-label">Month-on-month</p><h2 className="mb-3 mt-1 text-lg font-bold text-navy">Selected versus previous</h2><SpendingBarChart data={monthComparison} label="Selected month versus previous month" /></section>
        {budget !== "0.00" ? (
          <section className="card min-w-0 xl:col-span-2"><p className="muted-label">Plan versus actual</p><h2 className="mb-3 mt-1 text-lg font-bold text-navy">Budget versus spending</h2><SpendingBarChart data={actualVsBudget} label="Budget versus actual spending" /></section>
        ) : <section className="card xl:col-span-2"><p className="font-semibold text-navy">Budget comparison is not available yet</p><p className="mt-2 text-sm text-muted">Set an overall monthly budget to compare your plan with actual spending.</p></section>}
      </div>
      <p className="mt-5 text-xs leading-5 text-muted">Charts use only the transactions available for your account. An empty chart means there are no matching records in that period.</p>
    </>
  );
}
