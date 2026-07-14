/**
 * @file Configuração dedicada ao smoke E2E que usa API, PostgreSQL e seed reais.
 */

import { defineConfig, devices } from "@playwright/test";

const apiPort = process.env.OPSA_E2E_API_PORT ?? "43200";
const webPort = process.env.OPSA_E2E_WEB_PORT ?? "4173";
const apiBaseURL = `http://127.0.0.1:${apiPort}`;
const baseURL = process.env.OPSA_E2E_BASE_URL ?? `http://127.0.0.1:${webPort}`;

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
          command: "npm --prefix ../api run db:seed:demo && npm --prefix ../api run worker:ai:drain && npm --prefix ../api run dev",
          url: `${apiBaseURL}/api/health/live`,
          env: {
            PORT: apiPort,
            APP_BASE_URL: baseURL,
          },
          reuseExistingServer: false,
          timeout: 180_000,
        },
        {
          command: `npm run dev -- --host 127.0.0.1 --port ${webPort} --strictPort`,
          url: baseURL,
          env: {
            VITE_API_PROXY_TARGET: apiBaseURL,
          },
          reuseExistingServer: false,
          timeout: 60_000,
        },
      ],
});
