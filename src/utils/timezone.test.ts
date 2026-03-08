import { describe, it, expect } from "vitest";
import { detectTimezone, isValidTimezone } from "./timezone";

describe("timezone utils", () => {
  describe("detectTimezone", () => {
    it("returns a string", () => {
      const result = detectTimezone();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns a valid IANA timezone", () => {
      const result = detectTimezone();
      expect(isValidTimezone(result)).toBe(true);
    });
  });

  describe("isValidTimezone", () => {
    it("returns true for valid IANA zones", () => {
      expect(isValidTimezone("America/New_York")).toBe(true);
      expect(isValidTimezone("Europe/London")).toBe(true);
      expect(isValidTimezone("Asia/Tokyo")).toBe(true);
      expect(isValidTimezone("UTC")).toBe(true);
      expect(isValidTimezone("Pacific/Auckland")).toBe(true);
    });

    it("returns false for invalid zones", () => {
      expect(isValidTimezone("Not/A/Zone")).toBe(false);
      expect(isValidTimezone("Invalid")).toBe(false);
      expect(isValidTimezone("")).toBe(false);
      expect(isValidTimezone("America/NonExistent")).toBe(false);
    });

    it("returns false for garbage input", () => {
      expect(isValidTimezone("!@#$%^&*()")).toBe(false);
      expect(isValidTimezone("123456")).toBe(false);
      expect(isValidTimezone("   ")).toBe(false);
    });
  });
});
