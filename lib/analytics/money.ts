export function toCents(value: string | number): number {
  const normalized = typeof value === "number" ? value.toFixed(2) : value;
  const match = normalized.match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) throw new Error(`Invalid monetary value: ${normalized}`);
  const cents = Number(match[2]) * 100 + Number((match[3] ?? "").padEnd(2, "0"));
  return match[1] === "-" ? -cents : cents;
}

export function fromCents(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new Error("Currency total exceeded the safe integer range.");
  const absolute = Math.abs(cents);
  const sign = cents < 0 ? "-" : "";
  return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}

export function formatMoney(value: string | number, currency = "INR"): string {
  const amount = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
