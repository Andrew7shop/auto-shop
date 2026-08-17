const SHOP_TIMEZONE = "America/Chicago";

export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleDateString("en-US", { timeZone: SHOP_TIMEZONE, ...options });
}

export function formatTime(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: SHOP_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    ...options,
  });
}

export function formatDateTime(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleString("en-US", { timeZone: SHOP_TIMEZONE, ...options });
}

function zonedParts(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/** Formats a UTC instant as a "YYYY-MM-DDTHH:mm" string for a datetime-local input, in shop-local time. */
export function toShopInputValue(date: Date): string {
  const p = zonedParts(date, SHOP_TIMEZONE);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Parses a "YYYY-MM-DDTHH:mm" datetime-local value (interpreted as shop-local time) into a UTC Date. */
export function fromShopInputValue(dateTimeLocal: string): Date {
  const [datePart, timePart] = dateTimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  const guessUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const zoned = zonedParts(new Date(guessUtcMs), SHOP_TIMEZONE);
  const zonedAsUtcMs = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);

  const offsetMs = guessUtcMs - zonedAsUtcMs;
  return new Date(guessUtcMs + offsetMs);
}

/** Returns the shop-local calendar date as a "YYYY-MM-DD" key. */
export function shopDateKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: SHOP_TIMEZONE });
}

/** Returns the number of minutes past midnight, in shop-local time. */
export function shopMinutesSinceMidnight(date: Date): number {
  const p = zonedParts(date, SHOP_TIMEZONE);
  return p.hour * 60 + p.minute;
}

/** Shifts a "YYYY-MM-DD" date key by N calendar days. */
export function addDaysToKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

/** Returns the "YYYY-MM-DD" key of the Monday on or before the given date key. */
export function mondayOfWeek(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=Sun..6=Sat
  const diff = weekday === 0 ? -6 : 1 - weekday;
  return addDaysToKey(dateKey, diff);
}
