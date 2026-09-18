import { defineConfig } from "vitest/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// tsup injects this at build time; tests import the same entry, so it has to be
// defined here too or importing index.ts throws a ReferenceError.
const { version } = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };

export default defineConfig({
  define: { __ASTROCAL_WIDGET_VERSION__: JSON.stringify(version) },
  // scripts/verify-widget-cdn.mjs lives at the repo root and is tested here,
  // because this is the package it verifies. Vite refuses to serve files above
  // the project root without this.
  server: { fs: { allow: [resolve(__dirname, "../../..")] } },
  test: {
    globals: true,
    environment: "jsdom",
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/__tests__/**/*.ts",
      "src/**/__tests__/**/*.tsx",
    ],
    setupFiles: ["src/test-setup.ts"],
    passWithNoTests: true,
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "preact",
  },
});
