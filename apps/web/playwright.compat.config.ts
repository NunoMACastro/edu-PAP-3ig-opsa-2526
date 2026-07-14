/**
 * @file Matriz opcional de compatibilidade com browsers instalados no sistema.
 *
 * Não pertence ao gate académico normal. Cada channel falha claramente quando
 * o browser correspondente não está instalado, sem bloquear o Chromium bundled.
 */

import { defineConfig, devices, type Project } from "@playwright/test";
import baseConfig from "./playwright.config";

const viewports = [
  { name: "mobile-375x667", viewport: { width: 375, height: 667 } },
  { name: "tablet-768x1024", viewport: { width: 768, height: 1024 } },
  { name: "desktop-1440x900", viewport: { width: 1440, height: 900 } },
] as const;

const browsers = [
  { name: "chrome", device: devices["Desktop Chrome"], channel: "chrome" },
  { name: "edge", device: devices["Desktop Edge"], channel: "msedge" },
  { name: "firefox", device: devices["Desktop Firefox"], channel: undefined },
] as const;

const projects: Project[] = browsers.flatMap((browser) =>
  viewports.map(({ name, viewport }) => ({
    name: `${browser.name}-${name}`,
    testMatch: "app.spec.ts",
    use: {
      ...browser.device,
      channel: browser.channel,
      viewport,
    },
  })),
);

export default defineConfig(baseConfig, { projects });
