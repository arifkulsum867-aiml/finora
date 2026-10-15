import { shiftMonth, toMonthKey } from "@/lib/date-utils";

export function selectedMonth(value?: string): string {
  if (value && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(value)) return value;
  return toMonthKey(new Date());
}

export function monthBounds(month: string): { start: string; end: string; previous: string; days: number } {
  const [year, monthNumber] = month.split("-").map(Number);
  const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return {
    start: `${month}-01`,
    end: `${shiftMonth(month, 1)}-01`,
    previous: shiftMonth(month, -1),
    days,
  };
}

export function monthName(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}
