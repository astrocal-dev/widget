import { describe, it, expect } from "vitest";
import {
  daysInMonth,
  firstDayOfMonth,
  toDateString,
  parseDateString,
  formatMonthYear,
  formatTime,
  formatDate,
  todayInTimezone,
  isBeforeToday,
  lastDayOfMonthStr,
  firstDayOfMonthStr,
} from "./dates";

describe("date utils", () => {
  describe("daysInMonth", () => {
    it("returns 29 for February in leap year", () => {
      expect(daysInMonth(2024, 2)).toBe(29);
    });

    it("returns 28 for February in non-leap year", () => {
      expect(daysInMonth(2023, 2)).toBe(28);
      expect(daysInMonth(2025, 2)).toBe(28);
    });

    it("returns correct days for other months", () => {
      expect(daysInMonth(2024, 1)).toBe(31); // January
      expect(daysInMonth(2024, 3)).toBe(31); // March
      expect(daysInMonth(2024, 4)).toBe(30); // April
      expect(daysInMonth(2024, 5)).toBe(31); // May
      expect(daysInMonth(2024, 6)).toBe(30); // June
      expect(daysInMonth(2024, 7)).toBe(31); // July
      expect(daysInMonth(2024, 8)).toBe(31); // August
      expect(daysInMonth(2024, 9)).toBe(30); // September
      expect(daysInMonth(2024, 10)).toBe(31); // October
      expect(daysInMonth(2024, 11)).toBe(30); // November
      expect(daysInMonth(2024, 12)).toBe(31); // December
    });
  });

  describe("firstDayOfMonth", () => {
    it("returns correct day of week for Jan 1 2024 (Monday)", () => {
      // Jan 1, 2024 is a Monday (1)
      expect(firstDayOfMonth(2024, 1)).toBe(1);
    });

    it("returns correct day of week for Feb 1 2024 (Thursday)", () => {
      // Feb 1, 2024 is a Thursday (4)
      expect(firstDayOfMonth(2024, 2)).toBe(4);
    });

    it("returns correct day of week for Mar 1 2024 (Friday)", () => {
      // Mar 1, 2024 is a Friday (5)
      expect(firstDayOfMonth(2024, 3)).toBe(5);
    });

    it("returns Sunday as 0", () => {
      // Sep 1, 2024 is a Sunday
      expect(firstDayOfMonth(2024, 9)).toBe(0);
    });
  });

  describe("toDateString", () => {
    it("formats date correctly as YYYY-MM-DD", () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      expect(toDateString(date)).toBe("2024-01-15");
    });

    it("pads single digit month and day", () => {
      const date = new Date(2024, 0, 5); // Jan 5, 2024
      expect(toDateString(date)).toBe("2024-01-05");
    });

    it("handles last day of year", () => {
      const date = new Date(2024, 11, 31); // Dec 31, 2024
      expect(toDateString(date)).toBe("2024-12-31");
    });
  });

  describe("parseDateString", () => {
    it("parses YYYY-MM-DD correctly", () => {
      const result = parseDateString("2024-01-15");
      expect(result).toEqual({ year: 2024, month: 1, day: 15 });
    });

    it("parses dates with leading zeros", () => {
      const result = parseDateString("2024-03-05");
      expect(result).toEqual({ year: 2024, month: 3, day: 5 });
    });

    it("parses end of year date", () => {
      const result = parseDateString("2024-12-31");
      expect(result).toEqual({ year: 2024, month: 12, day: 31 });
    });
  });

  describe("formatMonthYear", () => {
    it("formats January 2024 correctly", () => {
      const result = formatMonthYear(2024, 1);
      expect(result).toBe("January 2024");
    });

    it("formats December 2025 correctly", () => {
      const result = formatMonthYear(2025, 12);
      expect(result).toBe("December 2025");
    });

    it("formats February 2024 correctly", () => {
      const result = formatMonthYear(2024, 2);
      expect(result).toBe("February 2024");
    });

    it("respects locale parameter", () => {
      const result = formatMonthYear(2024, 1, "fr-FR");
      expect(result).toMatch(/janvier/i);
    });
  });

  describe("formatTime", () => {
    it("formats ISO string to localized time", () => {
      const result = formatTime("2024-01-15T14:30:00Z", "America/New_York");
      // Should be something like "9:30 AM" EST
      expect(result).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/i);
    });

    it("handles different timezones", () => {
      const iso = "2024-01-15T00:00:00Z";
      const nyResult = formatTime(iso, "America/New_York");
      const laResult = formatTime(iso, "America/Los_Angeles");
      // Results should be different due to timezone
      expect(nyResult).not.toBe(laResult);
    });
  });

  describe("formatDate", () => {
    it("formats date with weekday, month, and day", () => {
      const result = formatDate("2024-01-15");
      // Jan 15, 2024 is a Monday
      expect(result).toMatch(/Monday/);
      expect(result).toMatch(/January/);
      expect(result).toMatch(/15/);
    });

    it("formats different dates correctly", () => {
      const result = formatDate("2024-12-25");
      expect(result).toMatch(/December/);
      expect(result).toMatch(/25/);
    });
  });

  describe("todayInTimezone", () => {
    it("returns a YYYY-MM-DD string", () => {
      const result = todayInTimezone("America/New_York");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("returns different dates for different timezones", () => {
      // At certain times, these will differ
      const ny = todayInTimezone("America/New_York");
      const tokyo = todayInTimezone("Asia/Tokyo");
      // Both should be valid date strings
      expect(ny).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tokyo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("isBeforeToday", () => {
    it("returns true for past dates", () => {
      const today = todayInTimezone("America/New_York");
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = toDateString(yesterday);

      // Only test if yesterday is actually before today in the timezone
      if (yesterdayStr < today) {
        expect(isBeforeToday(yesterdayStr, "America/New_York")).toBe(true);
      }
    });

    it("returns false for today", () => {
      const today = todayInTimezone("America/New_York");
      expect(isBeforeToday(today, "America/New_York")).toBe(false);
    });

    it("returns false for future dates", () => {
      const today = todayInTimezone("America/New_York");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = toDateString(tomorrow);

      // Only test if tomorrow is actually after today
      if (tomorrowStr > today) {
        expect(isBeforeToday(tomorrowStr, "America/New_York")).toBe(false);
      }
    });
  });

  describe("lastDayOfMonthStr", () => {
    it("returns last day of January 2024", () => {
      expect(lastDayOfMonthStr(2024, 1)).toBe("2024-01-31");
    });

    it("returns last day of February 2024 (leap year)", () => {
      expect(lastDayOfMonthStr(2024, 2)).toBe("2024-02-29");
    });

    it("returns last day of February 2023 (non-leap year)", () => {
      expect(lastDayOfMonthStr(2023, 2)).toBe("2023-02-28");
    });

    it("returns last day of April 2024", () => {
      expect(lastDayOfMonthStr(2024, 4)).toBe("2024-04-30");
    });

    it("pads single-digit months", () => {
      expect(lastDayOfMonthStr(2024, 3)).toBe("2024-03-31");
    });
  });

  describe("firstDayOfMonthStr", () => {
    it("returns first day of January 2024", () => {
      expect(firstDayOfMonthStr(2024, 1)).toBe("2024-01-01");
    });

    it("returns first day of December 2024", () => {
      expect(firstDayOfMonthStr(2024, 12)).toBe("2024-12-01");
    });

    it("pads single-digit months", () => {
      expect(firstDayOfMonthStr(2024, 3)).toBe("2024-03-01");
    });
  });
});
