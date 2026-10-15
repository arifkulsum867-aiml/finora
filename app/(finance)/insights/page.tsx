import { TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MonthPicker } from "@/components/month-picker";
import { budgetStatus, compareMonths, spendingInsights, summarizeMonth, sumBudget } from "@/lib/analytics";
import { formatMoney } from "@/lib/analytics/money";
import { fromCents, toCents } from "@/lib/analytics/money";
import { monthBounds, monthName, selectedMonth } from "@/lib/page-month";
import { getFinanceData } from "@/lib/finance-data";
import { InsightCards } from "@/components/insight-cards";

type SearchParams = Promise<{ month?: string }>;

export default async function InsightsPage({ searchParams }: { searchParams: SearchParams }) {
  const month = selectedMonth((await searchParams).month);
  const data = await getFinanceData(month);
  if (!data) return null;
  const { days } = monthBounds(month);
  const current = new Date();
  const elapsed = month === selectedMonth() ? Math.min(days, current.getDate()) : month < selectedMonth() ? days : 1;
  const insights = spendingInsights(data.current, data.previous, data.budgets, elapsed, days);
  const summary = summarizeMonth(data.current);
  const budget = sumBudget(data.budgets);
  const status = budgetStatus(summary.total, budget);
  const previousTotal = summarizeMonth(data.previous).total;
  const comparison = compareMonths(summary.total, previousTotal);
  const Icon = comparison.percentage !== null && comparison.percentage > 0 ? TrendingUp : TrendingDown;
  const mostNotable = [...data.current].sort((left, right) => Number(right.amount) - Number(left.amount))[0];

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Spending insights" description={`Understand what your own transaction data says about ${monthName(month)}.`} />
        <div className="sm:mb-7"><MonthPicker month={month} /></div>
      </div>
      <section className="card mb-5">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint text-emerald"><Icon size={21} /></span>
          <div><p className="muted-label">Monthly spending summary</p><h2 className="mt-1 text-lg font-bold text-navy">{formatMoney(summary.total)} recorded across {summary.transactionCount} transaction{summary.transactionCount === 1 ? "" : "s"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{summary.byCategory.length ? `Highest category: ${summary.byCategory[0].category} at ${formatMoney(summary.byCategory[0].amount)}.` : "There are no transactions for this month yet."} {budget === "0.00" ? "No overall budget is set." : status.overspent ? `The overall budget is exceeded by ${formatMoney(fromCents(Math.abs(toCents(status.remaining))))}.` : `${formatMoney(status.remaining)} remains in the overall budget (${Math.round(status.utilization ?? 0)}% used).`} {previousTotal !== "0.00" ? `Compared with last month: ${comparison.amount === "0.00" ? "unchanged" : toCents(summary.total) > toCents(previousTotal) ? "up" : "down"} by ${formatMoney(fromCents(Math.abs(toCents(comparison.amount))))}.` : "There is not enough previous-month data for a total comparison."} {mostNotable ? `Largest recorded expense: ${mostNotable.description} at ${formatMoney(mostNotable.amount)}.` : ""} These figures are calculated from records saved in Finora.</p>
          </div>
        </div>
      </section>
      <InsightCards insights={insights} />
      <div className="mt-5 rounded-xl border border-line bg-white px-4 py-3 text-xs leading-5 text-muted">
        Insights are deterministic rules-based summaries, not machine learning, fraud detection, or professional financial advice. Estimates assume spending continues at the recorded daily pace and may differ from actual results.
      </div>
    </>
  );
}
