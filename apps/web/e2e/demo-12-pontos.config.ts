/**
 * @file Configuração final da demonstração PAP sobre serviços e PostgreSQL já preparados pelo master.
 *
 * Este runner não inicia serviços, não executa migrations e não faz seed. Assim,
 * o reset/seed único continua fora do Playwright e sob controlo do master.
 */

import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.OPSA_E2E_BASE_URL ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  reporter: "line",
  outputDir: "test-results/demo-12-pontos",
  use: {
    baseURL,
    locale: "pt-PT",
    timezoneId: "Europe/Lisbon",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "workflow-desktop-1280x720",
      testMatch: "demo-12-pontos.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "visual-desktop-1280x720",
      testMatch: "demo-12-pontos.visual.spec.ts",
      dependencies: ["workflow-desktop-1280x720"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "visual-mobile-390x844",
      testMatch: "demo-12-pontos.visual.spec.ts",
      dependencies: ["workflow-desktop-1280x720"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
