import { describe, it, expect } from "vitest";
import { safeMeetingUrl } from "./safe-url";

describe("safeMeetingUrl", () => {
  it("accepts http and https links", () => {
    expect(safeMeetingUrl("https://zoom.us/j/123")).toBe("https://zoom.us/j/123");
    expect(safeMeetingUrl("HTTP://example.com/room")).toBe("HTTP://example.com/room");
  });

  it("trims surrounding whitespace", () => {
    expect(safeMeetingUrl("  https://meet.example/abc ")).toBe("https://meet.example/abc");
  });

  it("rejects script and data schemes", () => {
    expect(safeMeetingUrl("javascript:alert(1)")).toBeNull();
    expect(safeMeetingUrl("JaVaScRiPt:alert(1)")).toBeNull();
    expect(safeMeetingUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeMeetingUrl("vbscript:msgbox")).toBeNull();
    expect(safeMeetingUrl("file:///etc/passwd")).toBeNull();
  });

  it("rejects protocol-relative and bare values", () => {
    expect(safeMeetingUrl("//evil.example")).toBeNull();
    expect(safeMeetingUrl("zoom.us/j/123")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(safeMeetingUrl(null)).toBeNull();
    expect(safeMeetingUrl(undefined)).toBeNull();
    expect(safeMeetingUrl("")).toBeNull();
  });
});
