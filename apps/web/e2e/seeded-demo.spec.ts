/**
 * @file Smoke E2E sem mocks sobre a base demonstrativa real da OPSA.
 */

import { expect, test } from "@playwright/test";

const demoPassword = process.env.OPSA_DEMO_PASSWORD ?? "OpsaDemo2026!";
const demoAnchorDate = process.env.OPSA_DEMO_ANCHOR_DATE ?? new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Lisbon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

/**
 * Autentica uma persona demo e fixa a empresa principal para os fluxos RBAC.
 *
 * @param page - Página isolada da persona.
 * @param email - Conta demo canónica.
 * @returns Promise resolvida com o contexto empresarial ativo.
 */
async function loginDemoPersona(page: import("@playwright/test").Page, email: string) {
  await page.goto("/auth");
  const login = page.getByRole("heading", { level: 3, name: "Iniciar sessão" }).locator("..");
  await login.getByLabel("Email").fill(email);
  await login.getByLabel("Palavra-passe").fill(demoPassword);
  await login.getByRole("button", { name: "Iniciar sessão" }).click();
  await expect(page).toHaveURL(/\/companies$/);
  await page.getByRole("button", { name: "Mais ações" }).first().click();
  await page.getByRole("button", { name: "Selecionar empresa" }).click();
  await page.getByRole("dialog", { name: "Selecionar empresa" })
    .getByRole("button", { name: "Selecionar" }).click();
  await expect(page.getByText("OPSA Demo Comercio, Lda", { exact: true }).first()).toBeVisible();
}

test("seed demo suporta login, contexto, paginação e workflows críticos reais", async ({ page }) => {
  await page.goto("/auth");
  const login = page.getByRole("heading", { level: 3, name: "Iniciar sessão" }).locator("..");
  await login.getByLabel("Email").fill("admin@opsa.demo");
  await login.getByLabel("Palavra-passe").fill(demoPassword);
  await login.getByRole("button", { name: "Iniciar sessão" }).click();

  await expect(page).toHaveURL(/\/companies$/);
  await expect(page.getByRole("heading", { name: "Empresas e contexto" })).toBeVisible();
  await page.getByRole("button", { name: "Mais ações" }).first().click();
  await page.getByRole("button", { name: "Selecionar empresa" }).click();
  await page.getByRole("dialog", { name: "Selecionar empresa" })
    .getByRole("button", { name: "Selecionar" }).click();
  await expect(page.getByText("OPSA Demo Comercio, Lda", { exact: true }).first()).toBeVisible();

  await page.getByRole("link", { name: "Clientes" }).click();
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
  const loadMore = page.getByRole("navigation", { name: "Paginação de Clientes" })
    .getByRole("button", { name: "Carregar mais" });
  await expect(loadMore).toBeVisible();
  await loadMore.click();
  await expect(page.getByText("Cliente Demo 075", { exact: true })).toBeVisible();

  const workflow = await page.evaluate(async ({ anchorDate }) => {
    const request = async (path: string, init?: RequestInit) => {
      const response = await fetch(`/api${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        ...init,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(body)}`);
      return body;
    };
    const sales = await request("/sales/documents?limit=100");
    const saleItems = sales.items ?? sales.saleDocuments ?? [];
    const approved = saleItems.find((document: { status?: string; lines?: Array<{ description?: string }> }) =>
      document.status === "APPROVED" && document.lines?.some((line) => line.description?.includes("ACAO 3")),
    );
    if (!approved) throw new Error("Venda APPROVED de ação não encontrada.");
    const issued = await request(`/sales/documents/${approved.id}/issue`, { method: "POST" });
    await request(`/accounting/sale-postings/${issued.id}`, { method: "POST" });

    const purchases = await request("/purchases/documents?limit=100");
    const purchaseItems = purchases.items ?? purchases.purchaseDocuments ?? [];
    const ready = purchaseItems.find((document: { status?: string; supplierNumber?: string }) =>
      document.status === "APPROVED" && document.supplierNumber === "ACAO-FC-002",
    );
    if (!ready) throw new Error("Compra APPROVED de ação não encontrada.");
    await request(`/accounting/purchase-postings/${ready.id}`, { method: "POST" });
    const payment = await request(`/purchases/documents/${ready.id}/payments`, {
      method: "POST",
      body: JSON.stringify({
        amountCents: 100,
        paidAt: anchorDate,
        method: "BANK_TRANSFER",
        reference: "E2E-SEED-PAYMENT",
      }),
    });

    const [itemsPage, warehouseResult] = await Promise.all([
      request("/items?limit=100"),
      request("/warehouses"),
    ]);
    const product = itemsPage.items.find((item: { type?: string }) => item.type === "PRODUCT");
    const warehouse = warehouseResult.warehouses.find(
      (candidate: { code?: string }) => candidate.code === "WH-MAIN",
    );
    if (!product || !warehouse) throw new Error("Artigo/armazém de ação não encontrado.");
    const stock = await request("/inventory/stock-movements", {
      method: "POST",
      body: JSON.stringify({
        type: "ENTRY",
        itemId: product.id,
        quantity: 1,
        unitCostCents: Math.max(1, product.costCents),
        toWarehouseId: warehouse.id,
        reason: "Entrada E2E sobre seed demo",
        sourceType: "SEEDED_E2E",
        sourceId: "SEEDED-E2E-STOCK-1",
      }),
    });

    const imports = await request("/treasury/statement-imports?limit=50");
    const validImport = imports.items.find(
      (candidate: { fileName?: string }) => candidate.fileName === "demo-extrato-valido.csv",
    );
    if (!validImport) throw new Error("Extrato válido da seed não encontrado.");
    const importDetail = await request(`/treasury/statement-imports/${validImport.id}`);
    const exactLine = importDetail.statementImport.lines.find(
      (line: { description?: string }) => line.description === "Recebimento demonstrativo",
    );
    if (!exactLine) throw new Error("Linha bancária reconciliável não encontrada.");
    const reconciliation = await request("/treasury/reconciliations/suggestions", {
      method: "POST",
      body: JSON.stringify({ statementLineId: exactLine.id, candidateLimit: 5 }),
    });
    if (reconciliation.suggestions.length === 0) {
      throw new Error("Reconciliação exata não devolveu candidatos.");
    }

    const fromDate = `${anchorDate.slice(0, 7)}-01`;
    const [report, insights] = await Promise.all([
      request(`/reports/operational?from=${fromDate}&to=${anchorDate}`),
      request(`/ai/insights?from=${fromDate}&to=${anchorDate}`),
    ]);
    if (!report.report || insights.insights.length === 0) {
      throw new Error("Relatório ou insights da seed sem dados.");
    }

    const manualPage = await request("/accounting/manual-journals?limit=100");
    const manual = manualPage.items.find(
      (entry: { description?: string }) => entry.description?.includes("demonstrativo revisto"),
    );
    if (!manual) throw new Error("Lançamento com PDF não encontrado.");
    const manualDetail = await request(`/accounting/manual-journals/${manual.id}`);
    const attachment = manualDetail.journalEntry.attachments[0];
    if (!attachment) throw new Error("Attachment PDF não encontrado.");
    const download = await fetch(
      `/api/accounting/manual-journals/${manual.id}/attachments/${attachment.id}/download`,
      { credentials: "include" },
    );
    if (!download.ok) throw new Error(`Download PDF falhou: ${download.status}`);
    const pdfBytes = new Uint8Array(await download.arrayBuffer());
    const signature = String.fromCharCode(...pdfBytes.slice(0, 4));
    if (download.headers.get("content-type") !== "application/pdf" || signature !== "%PDF") {
      throw new Error("Download não devolveu um PDF íntegro.");
    }

    return {
      saleId: issued.id,
      purchaseId: ready.id,
      paymentId: payment.payment.id,
      movementId: stock.movement.id,
      reconciliationCount: reconciliation.suggestions.length,
      insightCount: insights.insights.length,
      pdfSize: pdfBytes.byteLength,
    };
  }, { anchorDate: demoAnchorDate });
  expect(workflow.saleId).toBeTruthy();
  expect(workflow.purchaseId).toBeTruthy();
  expect(workflow.paymentId).toBeTruthy();
  expect(workflow.movementId).toBeTruthy();
  expect(workflow.reconciliationCount).toBeGreaterThan(0);
  expect(workflow.insightCount).toBeGreaterThan(0);
  expect(workflow.pdfSize).toBeGreaterThan(100);

  for (const [link, heading] of [
    ["Mapa de IVA", "Mapa de IVA"],
    ["KPIs executivos", "KPIs executivos"],
    ["Insights IA", "Insights IA"],
    ["Alertas inteligentes", "Alertas inteligentes"],
    ["Lançamentos manuais", "Lançamentos manuais"],
  ] as const) {
    await page.getByRole("link", { name: link }).click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});

test("as cinco contas demo concluem os fluxos permitidos e recebem 403 apenas em comandos ocultos", async ({ browser }) => {
  const personas = [
    { role: "ADMIN", email: "admin@opsa.demo" },
    { role: "GESTOR", email: "gestor@opsa.demo" },
    { role: "CONTABILISTA", email: "contabilista@opsa.demo" },
    { role: "OPERACIONAL", email: "operacional@opsa.demo" },
    { role: "AUDITOR", email: "auditor@opsa.demo" },
  ] as const;

  for (const persona of personas) {
    await test.step(persona.role, async () => {
      const context = await browser.newContext({
        baseURL: test.info().project.use.baseURL as string,
        locale: "pt-PT",
        timezoneId: "Europe/Lisbon",
      });
      const page = await context.newPage();
      await loginDemoPersona(page, persona.email);

      const result = await page.evaluate(async ({ role, anchorDate }) => {
        async function request(path: string, init?: RequestInit) {
          const response = await fetch(`/api${path}`, {
            credentials: "include",
            headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
            ...init,
          });
          let body: Record<string, any> = {};
          try {
            body = await response.json();
          } catch {
            body = {};
          }
          return { status: response.status, body };
        }

        const permissions = await request("/permissions/me");
        if (permissions.status !== 200 || permissions.body.role !== role) {
          throw new Error(`Permissões incoerentes para ${role}`);
        }

        if (role === "ADMIN") {
          const [users, plans] = await Promise.all([
            request("/company/users"),
            request("/subscriptions/plans"),
          ]);
          return { users: users.status, plans: plans.status };
        }

        if (role === "GESTOR") {
          const [suppliers, items, vatRates] = await Promise.all([
            request("/suppliers?limit=1"),
            request("/items?limit=1"),
            request("/vat-rates"),
          ]);
          const supplier = (suppliers.body.items ?? suppliers.body.suppliers ?? [])[0];
          const item = (items.body.items ?? [])[0];
          const vatRate = (vatRates.body.vatRates ?? vatRates.body.items ?? [])[0];
          if (!supplier || !item || !vatRate) throw new Error("Referências de compra indisponíveis");
          const purchase = await request("/purchases/documents", {
            method: "POST",
            body: JSON.stringify({
              kind: "SUPPLIER_INVOICE",
              supplierId: supplier.id,
              supplierNumber: `E2E-RBAC-${Date.now()}`,
              issuedAt: anchorDate,
              lines: [{
                itemId: item.id,
                vatRateId: vatRate.id,
                description: "Compra E2E RBAC",
                quantity: 1,
                unitCostCents: 100,
              }],
            }),
          });
          const [listed, forecast, vatMap, treasuryWrite] = await Promise.all([
            request("/purchases/documents?limit=1"),
            request(`/treasury/forecast?from=${anchorDate.slice(0, 7)}-01&to=${anchorDate}`),
            request(`/tax/vat-maps?from=${anchorDate.slice(0, 7)}-01&to=${anchorDate}`),
            request("/treasury/accounts", {
              method: "POST",
              body: JSON.stringify({ type: "CASH", name: "Bloqueada", currency: "EUR", initialBalanceCents: 0 }),
            }),
          ]);
          return {
            purchase: purchase.status,
            listed: listed.status,
            forecast: forecast.status,
            vatMap: vatMap.status,
            treasuryWrite: treasuryWrite.status,
          };
        }

        if (role === "CONTABILISTA") {
          const [customers, items, vatRates, warehouses] = await Promise.all([
            request("/customers?limit=1"),
            request("/items?limit=100"),
            request("/vat-rates"),
            request("/warehouses"),
          ]);
          const customer = (customers.body.items ?? customers.body.customers ?? [])[0];
          const product = (items.body.items ?? []).find((item: { type?: string }) => item.type === "PRODUCT");
          const vatRate = (vatRates.body.vatRates ?? vatRates.body.items ?? [])[0];
          const warehouse = (warehouses.body.warehouses ?? warehouses.body.items ?? [])[0];
          if (!customer || !product || !vatRate || !warehouse) {
            throw new Error("Referências de venda/FIFO indisponíveis");
          }
          const sale = await request("/sales/documents", {
            method: "POST",
            body: JSON.stringify({
              kind: "INVOICE",
              customerId: customer.id,
              issuedAt: anchorDate,
              lines: [{
                itemId: product.id,
                vatRateId: vatRate.id,
                description: "Venda E2E RBAC",
                quantity: 1,
                unitPriceCents: 200,
              }],
            }),
          });
          const fifo = await request(
            `/inventory/fifo-cost/preview?itemId=${product.id}&warehouseId=${warehouse.id}&quantity=1`,
          );
          return { sale: sale.status, fifo: fifo.status };
        }

        if (role === "OPERACIONAL") {
          const [operational, forecast, kpis] = await Promise.all([
            request(`/reports/operational?from=${anchorDate.slice(0, 7)}-01&to=${anchorDate}`),
            request(`/treasury/forecast?from=${anchorDate.slice(0, 7)}-01&to=${anchorDate}`),
            request(`/reports/executive-kpis?from=${anchorDate.slice(0, 7)}-01&to=${anchorDate}`),
          ]);
          return {
            operational: operational.status,
            forecast: forecast.status,
            kpis: kpis.status,
          };
        }

        const purchases = await request("/purchases/documents?limit=100");
        const purchase = (purchases.body.items ?? purchases.body.purchaseDocuments ?? [])[0];
        if (!purchase) throw new Error("Compra para auditoria indisponível");
        const [history, reminders, notifications, treasuryWrite] = await Promise.all([
          request(`/purchases/documents/${purchase.id}/approval-history`),
          request("/reminders"),
          request("/notifications"),
          request("/treasury/accounts", {
            method: "POST",
            body: JSON.stringify({ type: "CASH", name: "Bloqueada", currency: "EUR", initialBalanceCents: 0 }),
          }),
        ]);
        return {
          history: history.status,
          reminders: reminders.status,
          notifications: notifications.status,
          treasuryWrite: treasuryWrite.status,
        };
      }, { role: persona.role, anchorDate: demoAnchorDate });

      const expected = {
        ADMIN: { users: 200, plans: 200 },
        GESTOR: { purchase: 201, listed: 200, forecast: 200, vatMap: 403, treasuryWrite: 403 },
        CONTABILISTA: { sale: 201, fifo: 200 },
        OPERACIONAL: { operational: 200, forecast: 403, kpis: 403 },
        AUDITOR: { history: 200, reminders: 200, notifications: 200, treasuryWrite: 403 },
      } as const;
      expect(result).toEqual(expected[persona.role]);
      await context.close();
    });
  }
});
