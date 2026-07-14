/**
 * @file Gate E2E académico executável com o Chromium incluído no Playwright.
 */

import {
  defineConfig,
  devices,
  type Project,
} from "@playwright/test";

const baseURL = process.env.OPSA_E2E_BASE_URL ?? "http://127.0.0.1:4173";

const viewports = [
  { name: "mobile-375x667", viewport: { width: 375, height: 667 } },
  { name: "tablet-768x1024", viewport: { width: 768, height: 1024 } },
  { name: "desktop-1440x900", viewport: { width: 1440, height: 900 } },
] as const;

const projects: Project[] = viewports.map(({ name, viewport }) => ({
    name: `chromium-${name}`,
    testMatch: "app.spec.ts",
    use: {
      ...devices["Desktop Chrome"],
      viewport,
    },
  }));

projects.push({
  name: "chromium-concurrency-25",
  testMatch: "concurrency.spec.ts",
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
  },
});

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  reporter: "line",
  outputDir: "test-results/e2e",
  use: {
    baseURL,
    locale: "pt-PT",
    timezoneId: "Europe/Lisbon",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects,
  webServer: process.env.OPSA_E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 4173 --strictPort",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
