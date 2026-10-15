import type { Transaction } from "@/types/finance";

export function transactionsToCsv(transactions: Transaction[]): string {
  const headers = ["Description", "Amount (INR)", "Category", "Date", "Payment method", "Notes", "Record type"];
  const rows = transactions.map((item) => [
    item.description,
    item.amount,
    item.category,
    item.transaction_date,
    item.payment_method,
    item.notes ?? "",
    item.is_demo ? "Demo" : "Personal",
  ]);
  return [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}

function csvCell(value: string): string {
  const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}
