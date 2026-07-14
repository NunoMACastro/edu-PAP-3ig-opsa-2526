/**
 * @file Fluxos browser reais para routing, autenticação, responsividade e acessibilidade.
 */

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";

const authenticatedUser = {
  user: {
    id: "user-e2e",
    email: "auditora@example.test",
    name: "Auditora E2E",
  },
  activeCompanyId: "company-e2e",
  role: "AUDITOR",
  permissions: ["company.read", "dashboard.read"],
  company: { id: "company-e2e", name: "Empresa E2E" },
};

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

/**
 * Falha o cenário quando axe encontra uma violação serious ou critical.
 *
 * @param page - Página real já estabilizada no estado funcional a auditar.
 */
async function expectNoBlockingAxeViolations(page: Page) {
  const analysis = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blockingViolations = analysis.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );
  expect(blockingViolations).toEqual([]);
}

/**
 * Instala respostas determinísticas no limite HTTP, mantendo o browser e a app reais.
 *
 * @param page - Página Playwright onde os pedidos `/api` serão intercetados.
 * @param authenticated - Indica se a sessão simulada está autenticada.
 * @param options - Cenários adicionais exercitados pelo teste atual.
 */
async function mockApi(
  page: Page,
  authenticated: boolean,
  options: {
    paginatedCustomers?: boolean;
    aiChat?: boolean;
    terminalPeriod?: boolean;
    onClosePeriod?: () => void;
  } = {},
) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const session = options.paginatedCustomers || options.aiChat || options.terminalPeriod
      ? {
          ...authenticatedUser,
          role: "ADMIN",
          permissions: [
            ...authenticatedUser.permissions,
            ...(options.paginatedCustomers ? ["customers.read", "customers.write"] : []),
            ...(options.aiChat ? ["ai.chat.use", "ai.insights.read"] : []),
            ...(options.terminalPeriod ? ["fiscal-periods.read", "fiscal-periods.manage"] : []),
          ],
        }
      : authenticatedUser;

    if (url.pathname === "/api/auth/me") {
      if (authenticated) {
        await json(route, 200, session);
      } else {
        await json(route, 401, { error: "UNAUTHORIZED", message: "Sessão expirada" });
      }
      return;
    }

    if (url.pathname === "/api/permissions/me" && authenticated) {
      await json(route, 200, {
        userId: session.user.id,
        companyId: session.activeCompanyId,
        role: session.role,
        permissions: session.permissions,
      });
      return;
    }

    if (url.pathname === "/api/dashboard/summary" && authenticated) {
      await json(route, 200, {
        summary: {
          asOf: "2026-07-12",
          company: { id: "company-e2e", name: "Empresa E2E" },
          activeFiscalPeriod: {
            id: "period-e2e",
            name: "Exercício 2026",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            status: "OPEN",
          },
          sales: { draft: 1, submitted: 2, approved: 3 },
          purchases: { draft: 4, approved: 5 },
          receivables: { openCount: 6, overdueCount: 2, overdueCents: 12345 },
          stockAlerts: { total: 7, lowStock: 4, highStock: 2, stoppedItems: 1 },
          notifications: { unread: 8 },
        },
      });
      return;
    }

    if (
      url.pathname === "/api/customers" &&
      authenticated &&
      options.paginatedCustomers
    ) {
      if (url.searchParams.get("cursor") === "customers-page-2") {
        await json(route, 200, {
          items: [{ id: "customer-51", name: "Cliente página dois" }],
          pageInfo: { nextCursor: null, hasNextPage: false },
        });
      } else {
        await json(route, 200, {
          items: [{ id: "customer-01", name: "Cliente página um" }],
          pageInfo: { nextCursor: "customers-page-2", hasNextPage: true },
        });
      }
      return;
    }

    if (url.pathname === "/api/companies" && authenticated) {
      await json(route, 200, {
        items: [{ id: "company-e2e", name: "Empresa E2E" }],
        pageInfo: { nextCursor: null, hasNextPage: false },
      });
      return;
    }

    if (options.terminalPeriod && url.pathname === "/api/fiscal-periods" && route.request().method() === "GET") {
      await json(route, 200, {
        periods: [{
          id: "period-e2e",
          name: "Exercício 2026",
          fiscalYear: 2026,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          status: "OPEN",
        }],
      });
      return;
    }
    if (options.terminalPeriod && url.pathname === "/api/fiscal-periods/period-e2e/close") {
      options.onClosePeriod?.();
      await json(route, 200, { period: { id: "period-e2e", status: "CLOSED" } });
      return;
    }

    if (options.aiChat && url.pathname === "/api/ai/chat/sessions" && route.request().method() === "GET") {
      await json(route, 200, { sessions: [{ id: "session-e2e", title: "Conversa demo", createdAt: "2026-07-11T10:00:00Z", updatedAt: "2026-07-11T10:00:00Z", expiresAt: "2026-10-09T10:00:00Z" }], pageInfo: { nextCursor: null, hasNextPage: false } });
      return;
    }
    if (options.aiChat && url.pathname === "/api/ai/capabilities") {
      await json(route, 200, { capabilities: { chatAvailable: true, effectiveMode: "deterministic", providerConfigured: false, companyOptIn: false, consentAccepted: true, policyVersion: "2026-01", limits: {} } });
      return;
    }
    if (options.aiChat && url.pathname === "/api/ai/consent") {
      await json(route, 200, { consent: { policyVersion: "2026-01", accepted: true, acceptedAt: "2026-07-11T10:00:00Z" } });
      return;
    }
    if (options.aiChat && url.pathname === "/api/ai/chat/sessions/session-e2e/messages" && route.request().method() === "GET") {
      await json(route, 200, { messages: [], pageInfo: { nextCursor: null, hasNextPage: false } });
      return;
    }
    if (options.aiChat && url.pathname === "/api/ai/chat/sessions/session-e2e/messages" && route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream; charset=utf-8",
        body: [
          'event: message.started\ndata: {"status":"started"}\n\n',
          'event: tool.started\ndata: {"tool":"get_margin_summary"}\n\n',
          'event: tool.completed\ndata: {"tool":"get_margin_summary","status":"completed"}\n\n',
          'event: message.completed\ndata: {"id":"message-e2e","payloadVersion":2,"role":"assistant","status":"ANSWERED","answer":"A margem operacional requer acompanhamento. Factos validados: operatingMarginBps: 12%.","facts":[{"id":"fact_1","metric":"operatingMarginBps","value":1200,"formattedValue":"12%","unit":"percent","sourceRef":"get_margin_summary"}],"claims":[{"metric":"operatingMarginBps","value":1200,"sourceRef":"get_margin_summary"}],"sourceRefs":["JOURNAL_ENTRY_LINES"],"sources":[{"ref":"JOURNAL_ENTRY_LINES","label":"Lançamentos contabilísticos"}],"limitations":[],"followUpSuggestions":["Comparar com o mês anterior?"],"mode":"deterministic","quality":"COMPLETE","period":{"from":"2026-07-01","to":"2026-07-11","asOf":"2026-07-11T10:00:00Z","timezone":"Europe/Lisbon"}}\n\n',
        ].join(""),
      });
      return;
    }

    await json(route, 404, { error: "NOT_FOUND", message: url.pathname });
  });
}

test("a rota pública de autenticação é utilizável e não tem violações axe graves", async ({
  page,
}) => {
  await mockApi(page, false);
  await page.goto("/auth");

  await expect(page.getByRole("heading", { level: 2, name: "Iniciar sessão" })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar para o conteúdo" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#conteudo-principal")).toBeFocused();

  const menuToggle = page.locator(".menuToggle");
  if (await menuToggle.isVisible()) {
    await menuToggle.click();
  }
  await expect(page.locator("#primary-navigation").getByRole("link", { name: "Iniciar sessão" }))
    .toHaveAttribute("aria-current", "page");
  if (await menuToggle.isVisible()) {
    await menuToggle.click();
  }

  await expectNoBlockingAxeViolations(page);
});

test("uma rota protegida preserva o deep link e redireciona uma sessão anónima", async ({
  page,
}) => {
  await mockApi(page, false);
  await page.goto("/sales/documents");

  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByRole("heading", { level: 2, name: "Iniciar sessão" })).toBeVisible();
});

test("o dashboard e o header apresentam contexto real e autorizado", async ({ page }) => {
  await mockApi(page, true);
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Empresa E2E", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Exercício 2026", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/123,45/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Mudar empresa" })).toBeVisible();
  await expectNoBlockingAxeViolations(page);
});

test("uma operação terminal pode ser cancelada e exige confirmação reforçada", async ({ page }) => {
  let closeRequests = 0;
  await mockApi(page, true, {
    terminalPeriod: true,
    onClosePeriod: () => { closeRequests += 1; },
  });
  await page.goto("/accounting/fiscal-periods");

  await page.locator("summary:visible", { hasText: "Mais ações" }).click();
  await page.getByRole("button", { name: "Fechar período" }).click();
  const dialog = page.getByRole("dialog", { name: "Fechar período" });
  const confirmClose = dialog.getByRole("button", { name: "Fechar", exact: true });
  await expect(confirmClose).toBeDisabled();
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  expect(closeRequests).toBe(0);

  await page.getByRole("button", { name: "Fechar período" }).click();
  await dialog.getByRole("checkbox").check();
  await confirmClose.click();
  await expect.poll(() => closeRequests).toBe(1);
});

test("um deep link autenticado sobrevive ao reload e mantém o histórico", async ({ page }) => {
  await mockApi(page, true);
  await page.goto("/auth");
  await page.goto("/companies");

  await expect(page.getByRole("heading", { name: "Empresas e contexto" })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/companies$/);
  await expect(page.getByRole("heading", { name: "Empresas e contexto" })).toBeVisible();
  await expectNoBlockingAxeViolations(page);

  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/companies$/);
});

test("a paginação por cursor preserva a primeira página e torna a segunda acessível", async ({
  page,
}) => {
  await mockApi(page, true, { paginatedCustomers: true });
  await page.goto("/sales/customers");

  const visibleRecords = page.locator(".responsiveTable:visible, .mobileList:visible");
  await expect(visibleRecords).toContainText("Cliente página um");
  const loadMore = page.getByRole("button", { name: "Carregar mais" });
  await expect(loadMore).toBeVisible();
  await loadMore.click();

  await expect(visibleRecords).toContainText("Cliente página um");
  await expect(visibleRecords).toContainText("Cliente página dois");
  await expect(loadMore).toHaveCount(0);
  await expectNoBlockingAxeViolations(page);
});

test("o layout não cria overflow horizontal e expõe menu móvel apenas quando necessário", async ({
  page,
}, testInfo) => {
  await mockApi(page, false);
  await page.goto("/auth");

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await page.evaluate(() => { document.body.style.zoom = "2"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

  const menu = page.locator(".menuToggle");
  if ((viewport?.width ?? 0) <= 860) {
    await expect(menu, `${testInfo.project.name} deve apresentar o drawer móvel`).toBeVisible();
    await menu.click();
    await expect(menu).toHaveAccessibleName("Fechar menu");
    await expect(page.locator(".sidebar")).toHaveClass(/sidebar--open/);
  } else {
    await expect(menu, `${testInfo.project.name} deve manter a sidebar desktop`).toBeHidden();
    await expect(page.locator(".sidebar")).toBeVisible();
  }
});

test("o chat fake preserva redirect legado, contexto, SSE, fontes e drawer responsivo", async ({ page }) => {
  await mockApi(page, true, { aiChat: true });
  await page.goto("/ai/questions");

  await expect(page).toHaveURL(/\/ai\/chat$/);
  await expect(page.getByRole("heading", { name: "Assistente OPSA" }).first()).toBeVisible();
  await page.getByLabel("Pergunta").fill("Qual é a margem operacional deste mês?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText(/A margem operacional requer acompanhamento/)).toBeVisible();
  await page.getByText("Fontes", { exact: true }).click();
  await expect(page.getByText("Lançamentos contabilísticos", { exact: true })).toBeVisible();

  const launcher = page.getByRole("button", { name: "Assistente OPSA" });
  await launcher.click();
  await expect(page.getByRole("dialog", { name: "Assistente OPSA" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
});
