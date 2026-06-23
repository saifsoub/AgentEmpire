export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function currency(value: number) {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(amount);
}

function parseValidDate(value: string | number | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function shortDate(value: string | number | null | undefined) {
  const parsed = parseValidDate(value);
  if (!parsed) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(parsed);
}

export function fullDate(value: string | number | null | undefined) {
  const parsed = parseValidDate(value);
  if (!parsed) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((s, n) => s + n, 0) / values.length);
}
