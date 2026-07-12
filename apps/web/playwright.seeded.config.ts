/**
 * @file Configuração dedicada ao smoke E2E que usa API, PostgreSQL e seed reais.
 */

import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.OPSA_E2E_BASE_URL ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "seeded-demo.spec.ts",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  timeout: 120_000,
  reporter: "line",
  outputDir: "test-results/seeded-e2e",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    locale: "pt-PT",
    timezoneId: "Europe/Lisbon",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.OPSA_E2E_BASE_URL
    ? undefined
    : [
        {
          command: "npm --prefix ../api run db:seed:demo && npm --prefix ../api run dev",
          url: "http://127.0.0.1:3000/api/health/live",
          reuseExistingServer: false,
          timeout: 180_000,
        },
        {
          command: "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
          url: baseURL,
          reuseExistingServer: false,
          timeout: 60_000,
        },
      ],
});
