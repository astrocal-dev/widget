import { describe, expect, it } from "vitest";
import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  it("formats USD cents correctly", () => {
    expect(formatPrice(5000, "usd")).toContain("50.00");
  });

  it("formats zero amount", () => {
    expect(formatPrice(0, "usd")).toContain("0.00");
  });

  it("formats small amounts below $1", () => {
    expect(formatPrice(50, "usd")).toContain("0.50");
  });

  it("formats large amounts", () => {
    const result = formatPrice(1000000, "usd");
    expect(result).toContain("10,000.00");
  });

  it("handles lowercase currency codes", () => {
    expect(formatPrice(5000, "usd")).toContain("50.00");
  });

  it("handles uppercase currency codes", () => {
    expect(formatPrice(5000, "USD")).toContain("50.00");
  });

  it("formats GBP", () => {
    expect(formatPrice(2500, "gbp")).toContain("25.00");
  });

  it("formats EUR", () => {
    expect(formatPrice(3000, "eur")).toContain("30.00");
  });
});
