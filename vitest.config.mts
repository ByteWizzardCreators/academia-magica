// Vitest configuration — unit tests only, over pure logic in src/lib and src/types.
// Node environment on purpose: no jsdom/happy-dom dependency, because the only
// browser API the tested modules touch is `localStorage` (see vitest.setup.ts).
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirror the `@/*` path alias declared in tsconfig.json.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts"],
    // Tests share a process per file, so a leak in one test could hide a bug in
    // the next one. Forcing isolation keeps every file honest.
    isolate: true,
  },
});
