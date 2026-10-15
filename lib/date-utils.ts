export function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function startOfMonth(monthKey: string): string {
  return `${monthKey}-01`;
}

export function shiftMonth(monthKey: string, amount: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return toMonthKey(date);
}
