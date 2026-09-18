import { describe, it, expect, vi } from "vitest";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * PRD-173 — the CDN checker is the only thing standing between a bad R2 upload
 * and every embed on the internet, so its failure modes are tested rather than
 * assumed. It lives at the repo root (it is run from CI and by hand against
 * production), and rides along in the widget's suite because that is the
 * package it verifies.
 */

// Resolved from the package directory, not from `import.meta.url`: under Vite
// that is an http:// module URL, which the ESM loader refuses. `@vite-ignore`
// keeps the script out of the module graph — it lives above this package's root.
const scriptPath = resolve(process.cwd(), "../../../scripts/verify-widget-cdn.mjs");

const { verifyBundle, verifySourceMap, fetchWithRetry, urlsFor } = await import(
  /* @vite-ignore */ pathToFileURL(scriptPath).href
);

const VERSION = "1.2.3";
const BUNDLE_URL = "https://cdn.astrocal.dev/widget/v1/astrocal.js";

/** A body that is big enough, parses, and names the version. */
const goodBundle = `var Astrocal=(()=>{var version="${VERSION}";return{version}})();${"//padding\n".repeat(1200)}`;

/** Builds a fetch stub returning one canned response. */
function stubFetch({ status = 200, body = goodBundle, contentType = "application/javascript" }) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
    headers: { get: () => contentType },
  }));
}

/** No real waiting: retry timing is asserted by call count, not the clock. */
const noSleep = { retries: 3, delayMs: 0, sleep: async () => {} };

describe("verifyBundle", () => {
  it("accepts a healthy bundle", async () => {
    await expect(
      verifyBundle(BUNDLE_URL, VERSION, { ...noSleep, fetchImpl: stubFetch({}) }),
    ).resolves.toBeUndefined();
  });

  it("rejects a 404", async () => {
    await expect(
      verifyBundle(BUNDLE_URL, VERSION, { ...noSleep, fetchImpl: stubFetch({ status: 404 }) }),
    ).rejects.toThrow(/HTTP 404/);
  });

  // R2 defaults to octet-stream when the upload omits the type, and browsers
  // refuse to execute the script.
  it("rejects a wrong content type", async () => {
    await expect(
      verifyBundle(BUNDLE_URL, VERSION, {
        ...noSleep,
        fetchImpl: stubFetch({ contentType: "application/octet-stream" }),
      }),
    ).rejects.toThrow(/content-type/);
  });

  it("rejects a truncated bundle", async () => {
    await expect(
      verifyBundle(BUNDLE_URL, VERSION, {
        ...noSleep,
        fetchImpl: stubFetch({ body: `var version="${VERSION}"` }),
      }),
    ).rejects.toThrow(/bytes, expected at least/);
  });

  it("rejects a body that is not JavaScript", async () => {
    const html = `<!doctype html><html><body>${"x".repeat(20_000)}${VERSION}</body></html>`;
    await expect(
      verifyBundle(BUNDLE_URL, VERSION, { ...noSleep, fetchImpl: stubFetch({ body: html }) }),
    ).rejects.toThrow(/does not parse as JavaScript/);
  });

  // A stale rolling object is served with a 200 and the right type, so the
  // version string is the only thing that catches it.
  it("rejects a bundle built from another version", async () => {
    await expect(
      verifyBundle(BUNDLE_URL, "9.9.9", { ...noSleep, fetchImpl: stubFetch({}) }),
    ).rejects.toThrow(/does not contain version 9\.9\.9/);
  });
});

describe("verifySourceMap", () => {
  it("accepts valid JSON", async () => {
    await expect(
      verifySourceMap(BUNDLE_URL, { ...noSleep, fetchImpl: stubFetch({ body: '{"version":3}' }) }),
    ).resolves.toBeUndefined();
  });

  it("rejects a map that is not JSON", async () => {
    await expect(
      verifySourceMap(BUNDLE_URL, { ...noSleep, fetchImpl: stubFetch({ body: "not json" }) }),
    ).rejects.toThrow(/not valid JSON/);
  });
});

describe("fetchWithRetry", () => {
  it("recovers from a transient failure within the retry budget", async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls++;
      if (calls < 3) throw new Error("ECONNRESET");
      return { ok: true, status: 200, text: async () => "ok", headers: { get: () => "" } };
    });

    const result = await fetchWithRetry(BUNDLE_URL, { ...noSleep, fetchImpl });

    expect(result.body).toBe("ok");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("gives up after the budget and names the URL", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("ECONNRESET");
    });

    await expect(fetchWithRetry(BUNDLE_URL, { ...noSleep, fetchImpl })).rejects.toThrow(
      /astrocal\.js — ECONNRESET/,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
});

describe("urlsFor", () => {
  it("checks the rolling and versioned paths by default", () => {
    const { bundles, maps } = urlsFor(VERSION);

    expect(bundles).toEqual([
      "https://cdn.astrocal.dev/widget/v1/astrocal.js",
      `https://cdn.astrocal.dev/widget/v1/${VERSION}/astrocal.js`,
    ]);
    expect(maps).toHaveLength(2);
  });

  // A skipped deploy still has to verify the live bundle, but the versioned
  // path may not exist yet.
  it("checks only the rolling path when the versioned one is skipped", () => {
    const { bundles, maps } = urlsFor(VERSION, { skipVersioned: true });

    expect(bundles).toEqual(["https://cdn.astrocal.dev/widget/v1/astrocal.js"]);
    expect(maps).toEqual(["https://cdn.astrocal.dev/widget/v1/astrocal.js.map"]);
  });
});
