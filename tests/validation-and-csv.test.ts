import { describe, expect, it } from "vitest";
import { transactionsToCsv } from "@/lib/csv";
import { transactionSchema } from "@/lib/validation/finance";
import { suggestCategory } from "@/lib/analytics/category-suggestion";
import type { Transaction } from "@/types/finance";

const base = {
  description: "Coffee",
  amount: "12.50",
  category: "Food",
  transaction_date: "2026-10-10",
  payment_method: "UPI",
  notes: "",
};

function transaction(description: string, notes: string | null = null): Transaction {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    user_id: "00000000-0000-4000-8000-000000000002",
    description,
    amount: "12.50",
    category: "Food",
    transaction_date: "2026-10-10",
    payment_method: "UPI",
    notes,
    is_demo: false,
    created_at: "2026-10-10T00:00:00.000Z",
    updated_at: "2026-10-10T00:00:00.000Z",
  };
}

describe("transaction validation", () => {
  it("accepts a valid transaction", () => {
    expect(transactionSchema.safeParse(base).success).toBe(true);
  });

  it.each(["-2.00", "0", "0.00", "1.234", "1e3", "10000000000.00"])("rejects invalid amount %s", (amount) => {
    expect(transactionSchema.safeParse({ ...base, amount }).success).toBe(false);
  });

  it("rejects invalid and future dates", () => {
    expect(transactionSchema.safeParse({ ...base, transaction_date: "2026-02-30" }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...base, transaction_date: "2999-01-01" }).success).toBe(false);
  });

  it("rejects an unlisted category and an overlong description", () => {
    expect(transactionSchema.safeParse({ ...base, category: "Crypto" }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...base, description: "x".repeat(101) }).success).toBe(false);
  });
});

describe("CSV export", () => {
  it("escapes embedded quotes and prevents spreadsheet formulas", () => {
    const csv = transactionsToCsv([transaction('=SUM(1,2) "test"', "+notes")]);
    expect(csv).toContain(`"'=SUM(1,2) ""test"""`);
    expect(csv).toContain(`"'+notes"`);
    expect(csv.split("\r\n")).toHaveLength(2);
  });
});

describe("rule-based category suggestions", () => {
  it.each([
    ["Restaurant dinner", "Food"],
    ["Coffee beans", "Food"],
    ["Supermarket shop", "Groceries"],
    ["Metro card", "Transport"],
    ["Tuition books", "Education"],
    ["Electricity bill", "Bills and Utilities"],
  ])("suggests %s category from a matching description", (description, category) => {
    expect(suggestCategory(description)).toBe(category);
  });

  it("returns no suggestion when no keyword rule matches", () => {
    expect(suggestCategory("something")).toBeNull();
  });
});
