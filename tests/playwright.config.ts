import { defineConfig, devices } from "@playwright/test";

/**
 * E2E configuration: few high-value flows (Vademecum §6). Traces, screenshots
 * and videos are kept ONLY on failure. Interactions prefer the keyboard.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: process.env["CI"] !== undefined,
  retries: process.env["CI"] !== undefined ? 1 : 0,
  reporter: process.env["CI"] !== undefined ? [["github"], ["html"]] : [["list"]],
  use: {
    baseURL: "http://localhost:5100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter @project/api dev",
      port: 3100,
      reuseExistingServer: process.env["CI"] === undefined,
      env: { LOG_LEVEL: "error", NODE_ENV: "test" },
    },
    {
      command: "pnpm --filter @project/web dev",
      port: 5100,
      reuseExistingServer: process.env["CI"] === undefined,
    },
  ],
});
