import type { Budget, Category, Transaction } from "@/types/finance";
import { fromCents, toCents } from "./money";

export type CategoryTotal = { category: Category; amount: string; count: number };
export type MonthSummary = {
  total: string;
  transactionCount: number;
  average: string;
  byCategory: CategoryTotal[];
};

export function sumTransactions(transactions: Transaction[]): string {
  return fromCents(transactions.reduce((sum, item) => sum + toCents(item.amount), 0));
}

export function aggregateByCategory(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<Category, { cents: number; count: number }>();
  for (const transaction of transactions) {
    const current = totals.get(transaction.category) ?? { cents: 0, count: 0 };
    current.cents += toCents(transaction.amount);
    current.count += 1;
    totals.set(transaction.category, current);
  }
  return [...totals.entries()]
    .map(([category, result]) => ({ category, amount: fromCents(result.cents), count: result.count }))
    .sort((a, b) => toCents(b.amount) - toCents(a.amount));
}

export function summarizeMonth(transactions: Transaction[]): MonthSummary {
  const totalCents = transactions.reduce((sum, item) => sum + toCents(item.amount), 0);
  return {
    total: fromCents(totalCents),
    transactionCount: transactions.length,
    average: fromCents(transactions.length ? Math.round(totalCents / transactions.length) : 0),
    byCategory: aggregateByCategory(transactions),
  };
}

export function compareMonths(current: string, previous: string): { amount: string; percentage: number | null } {
  const currentCents = toCents(current);
  const previousCents = toCents(previous);
  return {
    amount: fromCents(currentCents - previousCents),
    percentage: previousCents === 0 ? null : ((currentCents - previousCents) / previousCents) * 100,
  };
}

export function budgetStatus(spent: string, budget: string): {
  remaining: string;
  utilization: number | null;
  overspent: boolean;
  warning: "none" | "approaching" | "reached" | "exceeded";
} {
  const spentCents = toCents(spent);
  const budgetCents = toCents(budget);
  const utilization = budgetCents === 0 ? null : (spentCents / budgetCents) * 100;
  return {
    remaining: fromCents(budgetCents - spentCents),
    utilization,
    overspent: spentCents > budgetCents,
    warning: utilization === null || utilization < 80 ? "none" : utilization < 100 ? "approaching" : utilization === 100 ? "reached" : "exceeded",
  };
}

export function sumBudget(budgets: Budget[]): string {
  return fromCents(budgets.filter((budget) => budget.category === null).reduce((sum, budget) => sum + toCents(budget.amount), 0));
}

export function dailyAverage(transactions: Transaction[], dayOfMonth: number): string {
  const elapsedDays = Math.max(1, dayOfMonth);
  const total = toCents(sumTransactions(transactions));
  return fromCents(Math.round(total / elapsedDays));
}

export function forecastMonthEnd(transactions: Transaction[], dayOfMonth: number, daysInMonth: number): string {
  if (dayOfMonth < 1 || daysInMonth < dayOfMonth) throw new Error("Invalid month-day values.");
  const total = toCents(sumTransactions(transactions));
  return fromCents(Math.round((total / dayOfMonth) * daysInMonth));
}

export type SpendingInsight = { title: string; message: string; kind: "notice" | "positive" | "suggestion" };

export function spendingInsights(
  current: Transaction[],
  previous: Transaction[],
  budgets: Budget[],
  dayOfMonth: number,
  daysInMonth: number,
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const currentByCategory = aggregateByCategory(current);
  const previousByCategory = new Map(aggregateByCategory(previous).map((entry) => [entry.category, entry]));

  for (const entry of currentByCategory) {
    const past = previousByCategory.get(entry.category);
    if (past && past.count >= 3 && toCents(past.amount) > 0 && toCents(entry.amount) >= toCents(past.amount) * 1.5 && toCents(entry.amount) >= 100000) {
      insights.push({
        title: `Potentially unusual ${entry.category} spending`,
        message: `${entry.category} spending is at least 50% above last month, which had ${past.count} transactions, and exceeds ₹1,000. This rule flags a pattern for review; it does not indicate fraud.`,
        kind: "notice",
      });
      break;
    }
  }
  if (!insights.length) {
    insights.push({
      title: "No unusual-spending alert",
      message: "No category met the documented comparison rule: at least three previous-month transactions, current spending at least 50% higher, and at least ₹1,000. With less history, the comparison is inconclusive.",
      kind: "positive",
    });
  }

  if (current.length > 0 && dayOfMonth <= daysInMonth && dayOfMonth > 2) {
    const forecast = forecastMonthEnd(current, dayOfMonth, daysInMonth);
    insights.push({
      title: "Month-end spending estimate",
      message: `${fromCents(toCents(sumTransactions(current)))} spent so far. Formula: recorded spending ÷ ${dayOfMonth} elapsed days × ${daysInMonth} days = ${forecast}. This simple daily-pace estimate is uncertain and is not a trained forecast.`,
      kind: "positive",
    });
  } else {
    insights.push({
      title: "Month-end spending estimate",
      message: current.length === 0
        ? "No expenses are recorded for this month, so there is not enough data for a daily-pace estimate."
        : "Only one or two days of this month have elapsed, so a daily-pace estimate would be too sensitive to early purchases to be useful.",
      kind: "positive",
    });
  }

  const candidate = currentByCategory.find((entry) => {
    const past = previousByCategory.get(entry.category);
    return past && entry.count >= 2 && past.count >= 2 && toCents(entry.amount) > toCents(past.amount);
  });
  insights.push(candidate
    ? {
        title: "A place to review",
        message: `${candidate.category} is higher than the previous month (${formatCurrency(candidate.amount)} versus ${formatCurrency(previousByCategory.get(candidate.category)?.amount ?? "0.00")}). Review the individual transactions and decide whether a category limit could help.`,
        kind: "suggestion",
      }
    : {
        title: "Saving suggestion",
        message: currentByCategory.length
          ? `Your largest category is ${currentByCategory[0].category}. Reviewing the transactions in this category can help you decide whether a budget limit is useful. No investment advice is provided.`
          : "Start by recording expenses; then compare categories across periods to decide where a budget limit could be useful.",
        kind: "suggestion",
      });

  const currentTotal = toCents(sumTransactions(current));
  const previousTotal = toCents(sumTransactions(previous));
  const top = currentByCategory[0];
  const overall = budgets.find((budget) => budget.category === null);
  const status = overall ? budgetStatus(sumTransactions(current), overall.amount) : null;
  const budgetNote = !status
    ? "No overall budget is set."
    : status.overspent
      ? `The overall budget is exceeded by ${formatCurrency(fromCents(Math.abs(toCents(status.remaining))))}.`
      : `${formatCurrency(status.remaining)} remains in the overall budget (${Math.round(status.utilization ?? 0)}% used).`;
  const summaryMessage = `${current.length} transaction${current.length === 1 ? "" : "s"} total ${formatCurrency(fromCents(currentTotal))}${top ? `. Highest category: ${top.category} (${formatCurrency(top.amount)})` : ""}. ${budgetNote} ${previousTotal === 0 ? "No previous-month total is available for comparison." : `Compared with last month: ${currentTotal > previousTotal ? "up" : currentTotal < previousTotal ? "down" : "unchanged"} by ${formatCurrency(fromCents(Math.abs(currentTotal - previousTotal)))}.`}`;
  insights.push({ title: "Monthly spending summary", message: summaryMessage, kind: "positive" });
  return insights;
}

function formatCurrency(value: string): string {
  return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
