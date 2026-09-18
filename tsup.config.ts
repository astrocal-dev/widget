import { defineConfig } from "tsup";
import { readFileSync } from "node:fs";

// Injected into both builds so a deployed bundle can name itself. The CDN
// verification in PRD-173 reads it back to prove the bytes on the edge are the
// bytes we built, and support can ask a customer what they are running.
const { version } = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };
const define = { __ASTROCAL_WIDGET_VERSION__: JSON.stringify(version) };

export default defineConfig([
  // IIFE build for CDN (existing, unchanged)
  {
    entry: { astrocal: "src/index.ts" },
    format: ["iife"],
    globalName: "Astrocal",
    define,
    outDir: "dist",
    minify: true,
    sourcemap: true,
    clean: true,
    target: "es2020",
    esbuildOptions(options) {
      options.jsx = "automatic";
      options.jsxImportSource = "preact";
    },
    loader: { ".css": "text" },
    // Rename IIFE output from astrocal.global.js -> astrocal.js for cleaner CDN URL
    onSuccess:
      "mv dist/astrocal.global.js dist/astrocal.js && mv dist/astrocal.global.js.map dist/astrocal.js.map",
  },
  // ESM build for npm
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    define,
    outDir: "dist",
    minify: true,
    sourcemap: true,
    dts: true,
    target: "es2020",
    esbuildOptions(options) {
      options.jsx = "automatic";
      options.jsxImportSource = "preact";
    },
    loader: { ".css": "text" },
    noExternal: ["preact"],
  },
]);
