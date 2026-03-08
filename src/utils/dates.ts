/** Returns the number of days in a given month (1-indexed). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Returns the day of week (0=Sun, 6=Sat) for the first day of the month. */
export function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/** Formats a date as YYYY-MM-DD. */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses a YYYY-MM-DD string into year, month (1-indexed), day. */
export function parseDateString(date: string): { year: number; month: number; day: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { year: y!, month: m!, day: d! };
}

/** Formats a month name using Intl (e.g., "January 2025"). */
export function formatMonthYear(year: number, month: number, locale = "en-US"): string {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

/** Formats an ISO time string to a localized time (e.g., "2:30 PM"). */
export function formatTime(isoString: string, timezone: string, locale = "en-US"): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

/** Formats an ISO date string to a localized date (e.g., "Friday, January 15"). */
export function formatDate(isoString: string, locale = "en-US"): string {
  const date = new Date(isoString + "T00:00:00");
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Returns today's date as YYYY-MM-DD in the given timezone. */
export function todayInTimezone(timezone: string): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

/** Checks if a date string is before today in a timezone. */
export function isBeforeToday(dateStr: string, timezone: string): boolean {
  return dateStr < todayInTimezone(timezone);
}

/** Returns the last day of a month as YYYY-MM-DD. */
export function lastDayOfMonthStr(year: number, month: number): string {
  const d = daysInMonth(year, month);
  const m = String(month).padStart(2, "0");
  return `${year}-${m}-${String(d).padStart(2, "0")}`;
}

/** Returns the first day of a month as YYYY-MM-DD. */
export function firstDayOfMonthStr(year: number, month: number): string {
  const m = String(month).padStart(2, "0");
  return `${year}-${m}-01`;
}
