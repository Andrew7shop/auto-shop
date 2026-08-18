import { shopDateKey, fromShopInputValue, addDaysToKey } from "./datetime";

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && DATE_KEY_RE.test(value);
}

export function resolveReportDay(searchParams: { date?: string | string[] }) {
  const dateKey = isDateKey(searchParams.date) ? searchParams.date : shopDateKey(new Date());
  const start = fromShopInputValue(`${dateKey}T00:00`);
  const end = fromShopInputValue(`${addDaysToKey(dateKey, 1)}T00:00`);
  return { dateKey, start, end };
}

export function resolveReportRange(searchParams: { from?: string | string[]; to?: string | string[] }) {
  const today = shopDateKey(new Date());
  const from = isDateKey(searchParams.from) ? searchParams.from : `${today.slice(0, 7)}-01`;
  const to = isDateKey(searchParams.to) ? searchParams.to : today;
  const start = fromShopInputValue(`${from}T00:00`);
  const end = fromShopInputValue(`${addDaysToKey(to, 1)}T00:00`);
  return { from, to, start, end };
}
