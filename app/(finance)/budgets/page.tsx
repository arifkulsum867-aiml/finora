import { PageHeader } from "@/components/page-header";
import { MonthPicker } from "@/components/month-picker";
import { BudgetManager } from "@/components/budget-manager";
import { getFinanceData } from "@/lib/finance-data";
import { monthName, selectedMonth } from "@/lib/page-month";

type SearchParams = Promise<{ month?: string }>;

export default async function BudgetsPage({ searchParams }: { searchParams: SearchParams }) {
  const month = selectedMonth((await searchParams).month);
  const data = await getFinanceData(month);
  if (!data) return null;
  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Budgets" description={`Plan a total monthly limit and optional category budgets for ${monthName(month)}.`} />
        <div className="sm:mb-7"><MonthPicker month={month} /></div>
      </div>
      <BudgetManager budgets={data.budgets} transactions={data.current} month={month} />
    </>
  );
}
