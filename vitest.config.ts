import { defineConfig } from "vitest/config";

import thresholds from "./coverage-thresholds.json" with { type: "json" };

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: [
        "packages/*/src/**/*.ts",
        "apps/cli/src/**/*.ts",
        "apps/api/src/**/*.ts",
        "apps/mcp/src/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        // Composition roots are exercised by spawned-process integration
        // tests, which V8 coverage cannot track. Documented exclusion.
        "apps/api/src/main.ts",
        "apps/mcp/src/server.ts",
        "apps/cli/src/cli.ts",
        // apps/web is covered by Playwright E2E (DOM code cannot run under
        // Node V8 coverage).
        "apps/web/**",
        // Test doubles: exercised by definition whenever tests run.
        "packages/testkit/**",
        // Thin I/O adapter over pino: its observable behavior (stream
        // separation, levels) is asserted by the spawned CLI contract suite.
        "packages/adapter-pino/**",
      ],
      reporter: ["text", "json-summary"],
      // Ratchet: thresholds may only go UP. Raise them with
      // `just coverage-raise`, never lower them. Baseline set at bootstrap.
      thresholds,
    },
  },
});
