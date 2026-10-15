import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MonthPicker } from "@/components/month-picker";
import { CategoryChart, SpendingBarChart } from "@/components/finance-charts";
import { Notice } from "@/components/notice";
import { budgetStatus, compareMonths, dailyAverage, summarizeMonth, sumBudget } from "@/lib/analytics";
import { formatMoney, fromCents, toCents } from "@/lib/analytics/money";
import { monthBounds, monthName, selectedMonth } from "@/lib/page-month";
import { getFinanceData } from "@/lib/finance-data";

type SearchParams = Promise<{ month?: string }>;

function StatCard({ label, value, detail, icon, progress }: { label: string; value: string; detail: string; icon?: React.ReactNode; progress?: number | null }) {
  return <article className="card min-w-0"><div className="flex items-center justify-between gap-3"><p className="muted-label">{label}</p>{icon}</div><p className="mt-3 truncate text-2xl font-bold tracking-tight text-navy">{value}</p><p className="mt-2 text-xs leading-5 text-muted">{detail}</p>{progress !== undefined && progress !== null && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas" aria-label={`${Math.round(progress)} percent of monthly budget used`}><div className={`h-full rounded-full ${progress >= 100 ? "bg-rose-500" : progress >= 80 ? "bg-amber-500" : "bg-emerald"}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div>}</article>;
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const month = selectedMonth((await searchParams).month);
  const data = await getFinanceData(month);
  if (!data) return null;
  const summary = summarizeMonth(data.current);
  const previousSummary = summarizeMonth(data.previous);
  const comparison = compareMonths(summary.total, previousSummary.total);
  const overallBudget = sumBudget(data.budgets);
  const budget = budgetStatus(summary.total, overallBudget);
  const { days } = monthBounds(month);
  const today = new Date();
  const isCurrentMonth = month === selectedMonth();
  const elapsed = isCurrentMonth ? Math.min(days, today.getDate()) : month < selectedMonth() ? days : 1;
  const dailyData = Array.from({ length: isCurrentMonth ? elapsed : Math.min(days, Math.max(1, elapsed)) }, (_, index) => {
    const date = String(index + 1).padStart(2, "0");
    const total = data.current.filter((item) => item.transaction_date.endsWith(`-${date}`)).reduce((sum, item) => sum + toCents(item.amount), 0);
    return { label: date, amount: total / 100 };
  });
  const topCategory = summary.byCategory[0];
  const categoryTrend = topCategory
    ? data.previous.filter((item) => item.category === topCategory.category).reduce((sum, item) => sum + toCents(item.amount), 0) / 100
    : 0;
  const changeText = previousSummary.total === "0.00"
    ? "No previous-month spending to compare"
    : `${summary.total === "0.00" ? "No spending recorded" : `${formatMoney(fromCents(Math.abs(toCents(comparison.amount))))} ${toCents(summary.total) > toCents(previousSummary.total) ? "more" : "less"} than last month`}`;

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Your overview" description={`A clear view of spending and budgets for ${monthName(month)}.`} action={{ href: "/transactions", label: "Manage expenses" }} />
        <div className="sm:mb-7"><MonthPicker month={month} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total spent" value={formatMoney(summary.total)} detail={changeText} icon={comparison.percentage !== null && comparison.percentage > 0 ? <ArrowUpRight size={18} className="text-rose-600" /> : <ArrowDownRight size={18} className="text-emerald" />} />
        <StatCard label="Monthly budget" value={overallBudget === "0.00" ? "Not set" : formatMoney(overallBudget)} detail={overallBudget === "0.00" ? "Add an overall budget to track progress." : `${budget.utilization === null ? "—" : `${Math.round(budget.utilization)}% used`} · ${budget.overspent ? `${formatMoney(fromCents(Math.abs(toCents(budget.remaining))))} over budget` : `${formatMoney(budget.remaining)} remaining`}`} progress={budget.utilization} />
        <StatCard label="Daily average" value={formatMoney(dailyAverage(data.current, elapsed))} detail={`${data.current.length} expense${data.current.length === 1 ? "" : "s"} recorded · ${elapsed} day${elapsed === 1 ? "" : "s"} counted`} />
        <StatCard label="Top category" value={topCategory?.category ?? "—"} detail={topCategory ? `${formatMoney(topCategory.amount)} this month · ${formatMoney(categoryTrend)} last month` : "Add expenses to see your highest category."} />
      </div>

      {overallBudget !== "0.00" && budget.warning !== "none" && <div className="mt-5"><Notice tone={budget.warning === "exceeded" ? "error" : "info"}>{budget.warning === "exceeded" ? `Your spending is ${formatMoney(fromCents(Math.abs(toCents(budget.remaining))))} over budget for ${monthName(month)}.` : budget.warning === "reached" ? `You have reached your monthly budget for ${monthName(month)}.` : `You have used ${Math.round(budget.utilization ?? 0)}% of your monthly budget.`}</Notice></div>}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="card min-w-0">
          <div className="mb-4 flex items-start justify-between gap-3"><div><p className="muted-label">Spending rhythm</p><h2 className="mt-1 text-lg font-bold text-navy">Daily spending</h2></div><span className="text-xs text-muted">INR</span></div>
          <SpendingBarChart data={dailyData} />
        </section>
        <section className="card min-w-0">
          <div className="mb-2"><p className="muted-label">Where it goes</p><h2 className="mt-1 text-lg font-bold text-navy">Categories</h2></div>
          <CategoryChart data={summary.byCategory} />
        </section>
      </div>

      <section className="card mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="muted-label">Recent activity</p><h2 className="mt-1 text-lg font-bold text-navy">Latest transactions</h2></div>
          <Link href="/transactions" className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-emerald hover:underline">View all <ArrowRight size={15} /></Link>
        </div>
        {data.current.length === 0 ? (
          <div className="mt-5 rounded-xl bg-canvas px-5 py-9 text-center">
            <p className="font-semibold text-navy">Your month starts here</p>
            <p className="mt-2 text-sm text-muted">Add an expense to see it in your dashboard and analytics.</p>
            <Link href="/transactions" className="focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white"><Plus size={16} /> Add your first expense</Link>
          </div>
        ) : <div className="mt-4 divide-y divide-line">
          {data.current.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-3.5">
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-navy">{item.description}{item.is_demo && <span className="ml-2 rounded bg-mint px-1.5 py-0.5 text-[10px] font-semibold text-emerald">DEMO</span>}</p><p className="mt-1 text-xs text-muted">{item.category} · {item.transaction_date}</p></div>
              <p className="shrink-0 text-sm font-bold text-navy">{formatMoney(item.amount)}</p>
            </div>
          ))}
        </div>}
      </section>
      <p className="mt-5 text-xs leading-5 text-muted">Finora’s summaries use your recorded transactions for the selected month. They are budgeting information, not financial advice.</p>
    </>
  );
}
