import { defineConfig } from "tsup";

export default defineConfig([
  // IIFE build for CDN (existing, unchanged)
  {
    entry: { astrocal: "src/index.ts" },
    format: ["iife"],
    globalName: "Astrocal",
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
