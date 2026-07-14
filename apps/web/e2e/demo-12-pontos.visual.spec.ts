/**
 * @file Smoke estrutural, responsive e a11y dos ecrãs críticos da demonstração PAP.
 */

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const demoPassword = process.env.OPSA_DEMO_PASSWORD ?? "OpsaDemo2026!";
const rawRunId = process.env.OPSA_DEMO_RUN_ID?.trim();
if (!rawRunId) throw new Error("Define OPSA_DEMO_RUN_ID para localizar a empresa criada pelo workflow.");
const runId = rawRunId.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 24);
const companyName = `OPSA PAP ${runId}`;

async function loginAndActivateCompany(page: Page) {
  await page.goto("/auth");
  const login = page.getByRole("heading", { name: "Iniciar sessão" }).last().locator("..");
  await login.getByLabel("Email").fill("admin@opsa.demo");
  await login.getByLabel("Palavra-passe").fill(demoPassword);
  await login.getByRole("button", { name: "Iniciar sessão" }).click();
  await expect(page).toHaveURL(/\/(companies|dashboard)$/);

  if (await page.getByRole("banner").getByText(companyName, { exact: true }).isVisible().catch(() => false)) return;
  await page.goto("/companies");
  const records = page.locator(".responsiveTable:visible, .mobileList:visible");
  await expect(records).toContainText(companyName);
  const record = records.locator("tr, article").filter({ hasText: companyName }).first();
  await record.locator("summary", { hasText: "Mais ações" }).click();
  await record.getByRole("button", { name: "Selecionar empresa" }).click();
  const dialog = page.getByRole("dialog", { name: "Selecionar empresa" });
  await dialog.getByRole("button", { name: "Selecionar", exact: true }).click();
  await expect(page.getByRole("banner").getByText(companyName, { exact: true })).toBeVisible();
}

function rectanglesIntersect(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

async function expectNoFixedLauncherIntersection(page: Page, target: Locator) {
  const launcher = page.locator(".aiLauncher:visible");
  if (await launcher.count() === 0) return;
  const [launcherBox, targetBox] = await Promise.all([launcher.boundingBox(), target.boundingBox()]);
  expect(launcherBox).not.toBeNull();
  expect(targetBox).not.toBeNull();
  expect(rectanglesIntersect(launcherBox!, targetBox!)).toBe(false);
}

async function expectNoBlockingA11yViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(result.violations.filter(({ impact }) => impact === "serious" || impact === "critical"))
    .toEqual([]);
}

const criticalScreens = [
  { route: "/dashboard", heading: "Dashboard", cta: "Atualizar" },
  { route: "/sales/documents", heading: "Documentos de venda", cta: "Nova venda", responsiveRecords: true },
  { route: "/purchases/documents", heading: "Documentos de compra", cta: "Nova compra", responsiveRecords: true },
  { route: "/inventory/stock", heading: "Stock atual", cta: "Atualizar", responsiveRecords: true },
  { route: "/audit/logs", heading: "Auditoria", cta: "Atualizar" },
  { route: "/ai/alerts", heading: "Alertas inteligentes", cta: "Analisar dados da empresa" },
] as const;

test("ecrãs críticos não escondem ações em 1280x720 nem 390x844", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await loginAndActivateCompany(page);
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  for (const screen of criticalScreens) {
    await test.step(screen.heading, async () => {
      await page.goto(screen.route);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("heading", { name: screen.heading }).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
        .toBe(true);

      const cta = page.getByRole("button", { name: screen.cta, exact: true }).first();
      await expect(cta).toBeVisible();
      await expect(cta).toBeEnabled();
      await cta.scrollIntoViewIfNeeded();
      const ctaBox = await cta.boundingBox();
      expect(ctaBox).not.toBeNull();
      expect(ctaBox!.x).toBeGreaterThanOrEqual(0);
      expect(ctaBox!.x + ctaBox!.width).toBeLessThanOrEqual(viewport!.width);
      expect(ctaBox!.y).toBeGreaterThanOrEqual(0);
      expect(ctaBox!.y + ctaBox!.height).toBeLessThanOrEqual(viewport!.height);
      await expectNoFixedLauncherIntersection(page, cta);

      const pagination = page.getByRole("button", { name: "Carregar mais" });
      if (await pagination.count() > 0 && await pagination.first().isVisible()) {
        await pagination.first().scrollIntoViewIfNeeded();
        await expectNoFixedLauncherIntersection(page, pagination.first());
      }

      if ("responsiveRecords" in screen && screen.responsiveRecords) {
        if (viewport!.width <= 640) {
          await expect(page.locator(".responsiveTable").first()).toBeHidden();
          await expect(page.locator(".mobileList").first()).toBeVisible();
        } else {
          await expect(page.locator(".responsiveTable").first()).toBeVisible();
        }
      }

      await expectNoBlockingA11yViolations(page);
    });
  }

  expect(testInfo.project.name).toMatch(/1280x720|390x844/);
});
