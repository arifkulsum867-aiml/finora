import { describe, expect, it } from "vitest";
import {
  aggregateByCategory,
  budgetStatus,
  compareMonths,
  dailyAverage,
  forecastMonthEnd,
  spendingInsights,
  sumTransactions,
  summarizeMonth,
} from "@/lib/analytics";
import { fromCents, toCents } from "@/lib/analytics/money";
import { monthBounds, selectedMonth } from "@/lib/page-month";
import type { Budget, Transaction } from "@/types/finance";

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    user_id: "00000000-0000-4000-8000-000000000002",
    description: "Market",
    amount: "10.10",
    category: "Groceries",
    transaction_date: "2026-10-10",
    payment_method: "UPI",
    notes: null,
    is_demo: false,
    created_at: "2026-10-10T12:00:00.000Z",
    updated_at: "2026-10-10T12:00:00.000Z",
    ...overrides,
  };
}

function budget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: "00000000-0000-4000-8000-000000000003",
    user_id: "00000000-0000-4000-8000-000000000002",
    month: "2026-10-01",
    category: null,
    amount: "100.00",
    created_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("exact currency and monthly calculations", () => {
  it("sums currency without binary floating-point drift", () => {
    const expenses = [transaction({ amount: "0.10" }), transaction({ id: "two", amount: "0.20" })];
    expect(sumTransactions(expenses)).toBe("0.30");
    expect(toCents("9999999999.99")).toBe(999999999999);
    expect(fromCents(toCents("100.09"))).toBe("100.09");
  });

  it("aggregates category totals and transaction counts", () => {
    const result = aggregateByCategory([
      transaction({ amount: "10.25" }),
      transaction({ id: "two", amount: "4.75" }),
      transaction({ id: "three", category: "Food", amount: "7.00" }),
    ]);
    expect(result).toEqual([
      { category: "Groceries", amount: "15.00", count: 2 },
      { category: "Food", amount: "7.00", count: 1 },
    ]);
  });

  it("calculates comparisons, averages, and zero-prior-month behavior", () => {
    expect(compareMonths("150.00", "100.00")).toEqual({ amount: "50.00", percentage: 50 });
    expect(compareMonths("50.00", "0.00").percentage).toBeNull();
    expect(summarizeMonth([])).toMatchObject({ total: "0.00", transactionCount: 0, average: "0.00", byCategory: [] });
    expect(dailyAverage([transaction({ amount: "100.00" })], 4)).toBe("25.00");
  });

  it("handles a zero budget, threshold warnings, and overspending", () => {
    expect(budgetStatus("0.00", "0.00")).toMatchObject({ remaining: "0.00", utilization: null, warning: "none" });
    expect(budgetStatus("80.00", "100.00").warning).toBe("approaching");
    expect(budgetStatus("100.00", "100.00").warning).toBe("reached");
    expect(budgetStatus("120.50", "100.00")).toMatchObject({ remaining: "-20.50", overspent: true });
  });

  it("forecasts using elapsed days and validates day boundaries", () => {
    expect(forecastMonthEnd([transaction({ amount: "310.00" })], 10, 31)).toBe("961.00");
    expect(() => forecastMonthEnd([], 0, 31)).toThrow("Invalid month-day values.");
    expect(monthBounds("2024-02")).toEqual({ start: "2024-02-01", end: "2024-03-01", previous: "2024-01", days: 29 });
    expect(monthBounds("2026-12").end).toBe("2027-01-01");
    expect(selectedMonth("2026-13")).not.toBe("2026-13");
  });

  it("explains when month-end forecasting has too little elapsed time", () => {
    const insights = spendingInsights([transaction()], [], [], 2, 31);
    expect(insights.find((item) => item.title === "Month-end spending estimate")?.message).toContain("one or two days");
  });

  it("does not call a single previous-category transaction unusual", () => {
    const insights = spendingInsights(
      [transaction({ amount: "3000.00", transaction_date: "2026-10-10" })],
      [transaction({ amount: "500.00", transaction_date: "2026-09-10" })],
      [],
      10,
      31,
    );
    expect(insights.find((item) => item.title.includes("unusual"))?.title).toBe("No unusual-spending alert");
    expect(insights).toHaveLength(4);
  });

  it("requires at least three previous transactions for the unusual-spending rule", () => {
    const current = [transaction({ amount: "2000.00" })];
    const previous = [1, 2, 3].map((n) => transaction({ id: `prev-${n}`, amount: "400.00", transaction_date: "2026-09-10" }));
    expect(spendingInsights(current, previous, [budget()], 10, 31)[0].title).toContain("Potentially unusual");
  });
});
