/**
 * @file Gate E2E real do frontend OPSA, sem skips nem downloads automáticos de browsers.
 */

import { constants } from "node:fs";
import { access } from "node:fs/promises";
import {
  defineConfig,
  devices,
  firefox,
  type Project,
} from "@playwright/test";

const baseURL = process.env.OPSA_E2E_BASE_URL ?? "http://127.0.0.1:4173";

async function isExecutable(path: string) {
  if (!path) return false;
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Localiza o Edge instalado pela organização sem o descarregar durante o gate.
 *
 * @returns Caminho executável ou `null`.
 */
async function findEdgeExecutable(): Promise<string | null> {
  const candidates =
    process.platform === "darwin"
      ? [
          "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          `${process.env.HOME ?? ""}/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`,
        ]
      : process.platform === "win32"
        ? [
            `${process.env.PROGRAMFILES ?? ""}\\Microsoft\\Edge\\Application\\msedge.exe`,
            `${process.env["PROGRAMFILES(X86)"] ?? ""}\\Microsoft\\Edge\\Application\\msedge.exe`,
          ]
        : ["/usr/bin/microsoft-edge", "/usr/bin/microsoft-edge-stable"];

  for (const candidate of candidates) {
    if (await isExecutable(candidate)) return candidate;
  }
  return null;
}

/**
 * Localiza Google Chrome estável; Chromium bundled não satisfaz este gate.
 *
 * @returns Caminho executável ou `null`.
 */
async function findChromeExecutable(): Promise<string | null> {
  const candidates =
    process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          `${process.env.HOME ?? ""}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
        ]
      : process.platform === "win32"
        ? [
            `${process.env.PROGRAMFILES ?? ""}\\Google\\Chrome\\Application\\chrome.exe`,
            `${process.env["PROGRAMFILES(X86)"] ?? ""}\\Google\\Chrome\\Application\\chrome.exe`,
            `${process.env.LOCALAPPDATA ?? ""}\\Google\\Chrome\\Application\\chrome.exe`,
          ]
        : ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"];

  for (const candidate of candidates) {
    if (await isExecutable(candidate)) return candidate;
  }
  return null;
}

const edgeExecutable = await findEdgeExecutable();
const chromeExecutable = await findChromeExecutable();
const requiredBinaries = [
  { name: "Google Chrome", path: chromeExecutable },
  { name: "Firefox", path: firefox.executablePath() },
  { name: "Microsoft Edge", path: edgeExecutable },
];
const missingBinaries: string[] = [];
for (const binary of requiredBinaries) {
  if (!binary.path || !(await isExecutable(binary.path))) missingBinaries.push(binary.name);
}

if (missingBinaries.length > 0) {
  throw new Error(
    `E2E_BROWSER_MISSING: ${missingBinaries.join(", ")}. ` +
      "O gate não aceita skips e não descarrega browsers automaticamente; instala os binários antes de repetir.",
  );
}

const viewports = [
  { name: "mobile-375x667", viewport: { width: 375, height: 667 } },
  { name: "tablet-768x1024", viewport: { width: 768, height: 1024 } },
  { name: "desktop-1440x900", viewport: { width: 1440, height: 900 } },
] as const;

const browserMatrix = [
  { name: "chrome", device: devices["Desktop Chrome"], channel: "chrome" },
  { name: "edge", device: devices["Desktop Edge"], channel: "msedge" },
  { name: "firefox", device: devices["Desktop Firefox"], channel: undefined },
] as const;

const projects: Project[] = browserMatrix.flatMap((browser) =>
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

projects.push({
  name: "chrome-concurrency-25",
  testMatch: "concurrency.spec.ts",
  use: {
    ...devices["Desktop Chrome"],
    channel: "chrome",
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
