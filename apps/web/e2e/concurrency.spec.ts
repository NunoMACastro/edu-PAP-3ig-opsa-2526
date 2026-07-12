/**
 * @file Prova browser concorrente de 25 sessões autenticadas independentes no frontend.
 */

import { expect, test, type Page, type Route } from "@playwright/test";

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

async function mockAuthenticatedApi(page: Page, userNumber: number) {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") {
      await json(route, 200, {
        user: {
          id: `user-${userNumber}`,
          email: `user-${userNumber}@example.test`,
          name: `Utilizador ${userNumber}`,
        },
        activeCompanyId: "company-load",
        role: "AUDITOR",
        permissions: ["company.read"],
        company: { id: "company-load", name: "Empresa Load Test" },
      });
      return;
    }
    if (path === "/api/permissions/me") {
      await json(route, 200, {
        userId: `user-${userNumber}`,
        companyId: "company-load",
        role: "AUDITOR",
        permissions: ["company.read"],
      });
      return;
    }
    if (path === "/api/companies") {
      await json(route, 200, {
        items: [{ companyId: "company-load", companyName: "Empresa Load Test" }],
        pageInfo: { nextCursor: null, hasNextPage: false },
      });
      return;
    }
    await json(route, 404, { error: "NOT_FOUND" });
  });
}

test("25 sessões autenticadas carregam o deep link em simultâneo", async ({ browser }) => {
  const contexts = await Promise.all(
    Array.from({ length: 25 }, () => browser.newContext()),
  );

  try {
    const pages = await Promise.all(contexts.map((context) => context.newPage()));
    await Promise.all(pages.map((page, index) => mockAuthenticatedApi(page, index + 1)));
    await Promise.all(pages.map((page) => page.goto("/companies")));
    await Promise.all(
      pages.map((page) =>
        expect(page.getByRole("heading", { name: "Empresas e contexto" })).toBeVisible(),
      ),
    );
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});
