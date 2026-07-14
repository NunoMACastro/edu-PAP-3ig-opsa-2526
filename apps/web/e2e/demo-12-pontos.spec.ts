/**
 * @file Percurso E2E final dos 12 pontos da demonstração PAP, sem mocks nem acesso direto à DB.
 */

import { expect, test, type Page } from "@playwright/test";

const demoPassword = process.env.OPSA_DEMO_PASSWORD ?? "OpsaDemo2026!";
const rawRunId = process.env.OPSA_DEMO_RUN_ID?.trim();
if (!rawRunId) {
  throw new Error("Define OPSA_DEMO_RUN_ID com um valor único antes de executar a demonstração.");
}
const runId = rawRunId.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 24);
const companyName = `OPSA PAP ${runId}`;
const companyLegalName = `${companyName}, Lda.`;
const customerName = `Cliente PAP ${runId}`;
const supplierName = `Fornecedor PAP ${runId}`;
const saleLineDescription = `Venda PAP ${runId}`;
const purchaseLineDescription = `Compra PAP ${runId}`;
const supplierNumber = `FC-PAP-${runId}`.slice(0, 40);
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Lisbon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

interface DocumentLine {
  id: string;
  description?: string | null;
  quantity: string | number;
}

interface BusinessDocument {
  id: string;
  number?: string | null;
  supplierNumber?: string | null;
  status: string;
  totalCents: number;
  postedAt?: string | null;
  lines: DocumentLine[];
}

interface JournalEntry {
  id: string;
  source: string;
  sourceId: string;
  lines: Array<{ debitCents: number; creditCents: number }>;
}

interface StockMovement {
  id: string;
  type: string;
  quantity: string;
  source?: { type: string; id: string; label: string } | null;
}

interface DemoEmailPreview {
  recipient: string;
  subject: string;
  actionUrl: string;
}

/** Produz um NIF de teste matematicamente válido, determinístico por execução. */
function validPortugueseNif(seed: string) {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const base = `5${String(hash % 10_000_000).padStart(7, "0")}`;
  const sum = [...base].reduce((total, digit, index) => total + Number(digit) * (9 - index), 0);
  const candidate = 11 - (sum % 11);
  return `${base}${candidate >= 10 ? 0 : candidate}`;
}

const companyNif = validPortugueseNif(`${runId}-company`);
const customerNif = validPortugueseNif(`${runId}-customer`);
const supplierNif = validPortugueseNif(`${runId}-supplier`);

/** Faz uma leitura autenticada pela API pública e falha com contexto funcional. */
async function apiJson<T>(page: Page, path: string, init?: Parameters<Page["request"]["fetch"]>[1]) {
  const response = await page.request.fetch(`/api${path}`, init);
  const text = await response.text();
  if (!response.ok()) throw new Error(`${path}: ${response.status()} ${text}`);
  return JSON.parse(text) as T;
}

/** Submete credenciais demo no formulário atualmente visível. */
async function submitCredentials(page: Page, email: string) {
  const loginForm = page.getByRole("heading", { name: "Iniciar sessão" }).last().locator("..");
  await loginForm.getByLabel("Email").fill(email);
  await loginForm.getByLabel("Palavra-passe").fill(demoPassword);
  await loginForm.getByRole("button", { name: "Iniciar sessão" }).click();
}

/** Autentica uma conta demo e seleciona um contexto empresarial quando necessário. */
async function login(page: Page, email = "admin@opsa.demo") {
  await page.goto("/auth");
  await submitCredentials(page, email);
  await expect(page).toHaveURL(/\/(companies|dashboard)$/);
  if (new URL(page.url()).pathname === "/companies") {
    await page.locator("summary:visible", { hasText: "Mais ações" }).first().click();
    await page.getByRole("button", { name: "Selecionar empresa" }).first().click();
    await page.getByRole("dialog", { name: "Selecionar empresa" })
      .getByRole("button", { name: "Selecionar", exact: true })
      .click();
    await expect(page.getByRole("banner")).toBeVisible();
  }
}

/** Termina a sessão através da UI e confirma a fronteira pública. */
async function logout(page: Page) {
  await page.getByRole("button", { name: "Terminar sessão" }).click();
  await expect(page).toHaveURL(/\/auth$/);
}

/** Seleciona pelo UI a empresa criada por esta execução, quando ainda não está ativa. */
async function activateDemoCompany(page: Page) {
  const currentCompany = page.getByRole("banner").getByText(companyName, { exact: true });
  if (await currentCompany.isVisible().catch(() => false)) return;

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

/**
 * Adiciona a persona GESTOR pelo fluxo real de convite e regressa ao ADMIN.
 * A alternância prova a segregação de funções sem relaxar o backend.
 */
async function prepareApprover(page: Page) {
  const accessKey = process.env.DEMO_EMAIL_INBOX_ACCESS_KEY?.trim();
  if (!accessKey) {
    throw new Error("DEMO_EMAIL_INBOX_ACCESS_KEY é obrigatória para aceitar o convite demo.");
  }

  await page.goto("/company/users");
  const invitationForm = page.getByRole("heading", { name: "Convidar utilizador" }).locator("..");
  await invitationForm.getByLabel("Email").fill("gestor@opsa.demo");
  await invitationForm.getByLabel("Papel").selectOption("GESTOR");
  await invitationForm.getByRole("button", { name: "Convidar", exact: true }).click();
  await expect(page.getByText("Convite criado e enviado.")).toBeVisible();

  let actionUrl = "";
  await expect.poll(async () => {
    const inbox = await apiJson<{ messages: DemoEmailPreview[] }>(page, "/demo/email-inbox/unlock", {
      method: "POST",
      data: { accessKey },
    });
    actionUrl = inbox.messages.find((message) =>
      message.recipient === "gestor@opsa.demo" && message.subject.includes(companyName)
    )?.actionUrl ?? "";
    return Boolean(actionUrl);
  }, { timeout: 20_000, intervals: [2_000, 5_000] }).toBe(true);

  await logout(page);
  await page.goto(actionUrl);
  await expect(page.getByRole("heading", { name: "Detalhes do convite" })).toBeVisible();
  await submitCredentials(page, "gestor@opsa.demo");
  await page.getByRole("button", { name: "Aceitar convite" }).click();
  await expect(page).toHaveURL(/\/companies$/);
  await expect(page.getByRole("banner").getByText(companyName, { exact: true })).toBeVisible();

  await logout(page);
  await login(page);
  await activateDemoCompany(page);
}

/** Seleciona uma opção por label humana parcial e nunca por UUID conhecido pelo teste. */
async function selectOptionContaining(select: ReturnType<Page["getByLabel"]>, text: string) {
  const option = select.locator("option").filter({ hasText: text }).first();
  await expect(option).toHaveCount(1);
  const value = await option.getAttribute("value");
  if (!value) throw new Error(`A opção ${text} não tem valor selecionável.`);
  await select.selectOption(value);
}

/** Cria cliente/fornecedor pelos modais reais e preenche o contrato fiscal mínimo. */
async function createPerson(
  page: Page,
  route: "/sales/customers" | "/purchases/suppliers",
  kind: "cliente" | "fornecedor",
  name: string,
  nif: string,
) {
  await page.goto(route);
  await expect(page.getByRole("heading", { name: kind === "cliente" ? "Clientes" : "Fornecedores" }))
    .toBeVisible();
  await page.locator(".pageFrame__actions").getByRole("button", { name: "Criar", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: `Criar ${kind}` });
  await dialog.getByLabel("Nome").fill(name);
  await dialog.getByLabel("NIF").fill(nif);
  await dialog.getByLabel("Email").fill(`${kind}-${runId}@example.test`);
  await dialog.getByLabel("Morada").fill("Rua da Escola, 12");
  await dialog.getByLabel("Código postal").fill("1000-001");
  await dialog.getByLabel("Cidade").fill("Lisboa");
  await dialog.getByLabel("País (ISO)").fill("PT");
  await dialog.getByLabel("Conta SAF-T").fill(kind === "cliente" ? "211" : "221");
  await dialog.getByLabel("Indicador de autofaturação").fill("0");
  await dialog.getByRole("button", { name: "Criar", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator(".responsiveTable:visible, .mobileList:visible")).toContainText(name);
}

/** Obtém o documento criado pela descrição única da sua linha. */
async function findDocument(page: Page, type: "SALE" | "PURCHASE", description: string) {
  let document: BusinessDocument | undefined;
  await expect.poll(async () => {
    const path = type === "SALE" ? "/sales/documents?limit=100" : "/purchases/documents?limit=100";
    const result = await apiJson<{ items: BusinessDocument[] }>(page, path);
    document = result.items.find((item) => item.lines.some((line) => line.description === description));
    return Boolean(document);
  }).toBe(true);
  return document!;
}

/** Confirma uma transição modal e, opcionalmente, recolhe a resposta HTTP real. */
async function confirmDocumentAction(page: Page, label: string, responsePath?: RegExp) {
  const listing = page.locator(".responsiveTable:visible, .mobileList:visible");
  await listing.getByRole("button", { name: label, exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: `Confirmar ${label.toLocaleLowerCase("pt-PT")}` });
  const checkbox = dialog.getByRole("checkbox");
  if (await checkbox.count()) await checkbox.check();
  const responsePromise = responsePath
    ? page.waitForResponse((response) => responsePath.test(new URL(response.url()).pathname) && response.request().method() === "POST")
    : null;
  await dialog.getByRole("button", { name: label, exact: true }).click();
  const response = responsePromise ? await responsePromise : null;
  if (response && !response.ok()) throw new Error(`${label}: ${response.status()} ${await response.text()}`);
  await expect(dialog).toBeHidden();
  return response ? response.json() as Promise<{ journalEntry: JournalEntry }> : null;
}

async function currentStock(page: Page, itemId: string, warehouseId: string) {
  const result = await apiJson<{ items: Array<{ quantity: string }> }>(
    page,
    `/inventory/stock-balances?itemId=${encodeURIComponent(itemId)}&warehouseId=${encodeURIComponent(warehouseId)}&limit=10`,
  );
  return Number(result.items[0]?.quantity ?? Number.NaN);
}

async function documentMovements(page: Page, lineId: string, sourceType: string) {
  const result = await apiJson<{ items: StockMovement[] }>(page, "/inventory/stock-movements?limit=100");
  return result.items.filter((movement) => movement.source?.type === sourceType && movement.source.id === lineId);
}

function expectBalancedJournal(journal: JournalEntry, source: string, sourceId: string) {
  expect(journal.source).toBe(source);
  expect(journal.sourceId).toBe(sourceId);
  const debit = journal.lines.reduce((sum, line) => sum + line.debitCents, 0);
  const credit = journal.lines.reduce((sum, line) => sum + line.creditCents, 0);
  expect(debit).toBeGreaterThan(0);
  expect(debit).toBe(credit);
}

/** Abre o assistente contextual e aguarda a análise determinística do documento. */
async function analyzeDocument(page: Page, documentNumber: string, question: string) {
  const listing = page.locator(".responsiveTable:visible, .mobileList:visible");
  await listing.getByRole("button", { name: "Analisar com IA" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Assistente OPSA" });
  await expect(dialog.getByLabel("Documento em análise")).toContainText(documentNumber);
  await dialog.getByLabel("Pergunta").fill(question);
  await dialog.getByRole("button", { name: "Enviar" }).click();
  const analysis = dialog.getByLabel(`Análise de risco de ${documentNumber}`).last();
  const answer = analysis.locator("xpath=ancestor::article[1]");
  await expect(analysis).toBeVisible({ timeout: 60_000 });
  await expect(analysis).toContainText("Risco:");
  await expect(analysis).toContainText("Recomendação:");
  await expect(analysis.getByText("Riscos identificados", { exact: true })).toBeVisible();
  await expect(analysis.getByText("Ações futuras para revisão humana", { exact: true })).toBeVisible();
  await expect(analysis).toContainText("Recomendação informativa; nenhuma ação foi executada automaticamente.");
  await expect(answer.getByText("Factos validados", { exact: true })).toBeVisible();
  await expect(answer.getByText("Fontes", { exact: true })).toBeVisible();
  await expect(answer).toContainText("Existem menos de três vendas na janela de noventa dias");
  await dialog.getByRole("button", { name: "Fechar diálogo" }).click();
  await expect(dialog).toBeHidden();
}

test("demonstra os 12 pontos com dados reais, posting, stock, IA, SAF-T e auditoria", async ({ page }) => {
  test.setTimeout(240_000);
  let product!: { id: string; sku: string; name: string };
  let warehouse!: { id: string; code: string; name: string };
  let sale!: BusinessDocument;

  await test.step("Ponto 1 — Entrar na aplicação", async () => {
    await login(page);
  });

  await test.step("Ponto 2 — Criar uma empresa preparada para a demonstração", async () => {
    await page.goto("/companies/new");
    await page.getByLabel("Nome da empresa").fill(companyName);
    await page.getByLabel("Denominação legal").fill(companyLegalName);
    await page.getByLabel("NIF português").fill(companyNif);
    await page.getByLabel("Morada", { exact: true }).fill("Rua da Escola, 1");
    await page.getByLabel("Código postal").fill("1000-001");
    await page.getByLabel("Localidade").fill("Lisboa");
    await page.getByLabel(/Preparar um produto de exemplo/).check();
    await page.getByRole("button", { name: "Criar e ativar empresa" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("banner").getByText(companyName, { exact: true })).toBeVisible();

    const [itemResult, warehouseResult] = await Promise.all([
      apiJson<{ items: Array<{ id: string; sku: string; name: string }> }>(page, "/items?limit=100"),
      apiJson<{ warehouses: Array<{ id: string; code: string; name: string }> }>(page, "/warehouses"),
    ]);
    const preparedProduct = itemResult.items.find((item) => item.sku === "PAP-DEMO-001");
    const preparedWarehouse = warehouseResult.warehouses[0];
    expect(preparedProduct).toBeTruthy();
    expect(preparedWarehouse).toBeTruthy();
    product = preparedProduct!;
    warehouse = preparedWarehouse;
    expect(await currentStock(page, product.id, warehouse.id)).toBe(20);
    await prepareApprover(page);
  });

  await test.step("Ponto 3 — Adicionar cliente e fornecedor", async () => {
    await createPerson(page, "/sales/customers", "cliente", customerName, customerNif);
    await createPerson(page, "/purchases/suppliers", "fornecedor", supplierName, supplierNif);
  });

  await test.step("Ponto 9 — Exportar o SAF-T académico a partir de uma compra contabilizada", async () => {
    await page.goto("/purchases/documents");
    await page.getByRole("button", { name: "Nova compra" }).click();
    const purchaseDialog = page.getByRole("dialog", { name: "Nova compra" });
    const supplierSelect = purchaseDialog.getByRole("combobox", { name: "Fornecedor", exact: true });
    await expect(supplierSelect).toBeVisible();
    const supplierValue = await supplierSelect.evaluate((element, expectedName) =>
      [...(element as HTMLSelectElement).options]
        .find((option) => option.textContent?.includes(String(expectedName)))?.value ?? "", supplierName);
    expect(supplierValue).not.toBe("");
    await supplierSelect.selectOption(supplierValue);
    await selectOptionContaining(purchaseDialog.getByLabel("Artigo"), "PAP-DEMO-001");
    await selectOptionContaining(purchaseDialog.getByLabel(/Armazém/), warehouse.name);
    await selectOptionContaining(purchaseDialog.getByLabel("Taxa de IVA"), "IVA23");
    await purchaseDialog.getByLabel("Número do fornecedor").fill(supplierNumber);
    await purchaseDialog.getByLabel("Descrição").fill(purchaseLineDescription);
    await purchaseDialog.getByLabel("Quantidade").fill("3");
    await purchaseDialog.getByLabel("Custo em cêntimos").fill("1000");
    await purchaseDialog.getByRole("button", { name: "Criar rascunho" }).click();
    await expect(purchaseDialog).toBeHidden();

    let purchase = await findDocument(page, "PURCHASE", purchaseLineDescription);
    expect(purchase.totalCents).toBe(3690);
    await confirmDocumentAction(page, "Aprovar");
    const purchasePosting = await confirmDocumentAction(
      page,
      "Contabilizar",
      new RegExp(`/api/accounting/purchase-postings/${purchase.id}$`),
    );
    expectBalancedJournal((await purchasePosting!).journalEntry, "PURCHASE", purchase.id);
    purchase = await findDocument(page, "PURCHASE", purchaseLineDescription);
    expect(purchase.postedAt).toBeTruthy();
    const purchaseMovements = await documentMovements(page, purchase.lines[0].id, "PURCHASE_DOCUMENT_LINE");
    expect(purchaseMovements).toHaveLength(1);
    expect(purchaseMovements[0].type).toBe("ENTRY");
    expect(Number(purchaseMovements[0].quantity)).toBe(3);
    expect(await currentStock(page, product.id, warehouse.id)).toBe(23);

    await page.goto("/compliance/saft");
    await expect(page.getByText("Demonstração académica — não certificado")).toBeVisible();
    const generateSaft = page.getByRole("button", { name: "Gerar XML académico" });
    await expect(generateSaft).toBeEnabled();
    await generateSaft.click();
    const downloadButton = page.getByRole("button", { name: "Descarregar XML" });
    await expect(downloadButton).toBeEnabled({ timeout: 60_000 });
    const [download] = await Promise.all([page.waitForEvent("download"), downloadButton.click()]);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const xmlBytes = Buffer.concat(chunks);
    const xml = xmlBytes.toString("latin1");
    expect(download.suggestedFilename()).toMatch(/\.xml$/i);
    expect(xmlBytes.byteLength).toBeGreaterThan(100);
    expect(xml).toContain(supplierNumber);
    expect(xml).toContain(companyNif);
    expect(xml).toContain("DEMONSTRACAO ACADEMICA - NAO CERTIFICADO");
  });

  await test.step("Ponto 4 — Vender um produto com total calculado no backend", async () => {
    await page.goto("/sales/documents");
    await page.getByRole("button", { name: "Nova venda" }).click();
    const saleDialog = page.getByRole("dialog", { name: "Nova venda" });
    await selectOptionContaining(saleDialog.getByLabel("Cliente"), customerName);
    await selectOptionContaining(saleDialog.getByLabel("Artigo"), "PAP-DEMO-001");
    await selectOptionContaining(saleDialog.getByLabel(/Armazém/), warehouse.name);
    await selectOptionContaining(saleDialog.getByLabel("Taxa de IVA"), "IVA23");
    await saleDialog.getByLabel("Descrição").fill(saleLineDescription);
    await saleDialog.getByLabel("Quantidade").fill("2");
    await saleDialog.getByLabel("Preço em cêntimos").fill("2500");
    await saleDialog.getByRole("button", { name: "Criar rascunho" }).click();
    await expect(saleDialog).toBeHidden();

    sale = await findDocument(page, "SALE", saleLineDescription);
    expect(sale.status).toBe("DRAFT");
    expect(sale.totalCents).toBe(6150);
    expect(await currentStock(page, product.id, warehouse.id)).toBe(23);
    await page.locator(".responsiveTable:visible").getByRole("button", { name: "Submeter" }).click();
    await expect(page.getByText("Venda submetida.")).toBeVisible();

    await logout(page);
    await login(page, "gestor@opsa.demo");
    await activateDemoCompany(page);
    await page.goto("/sales/documents");
    await confirmDocumentAction(
      page,
      "Aprovar",
      new RegExp(`/api/sales/documents/${sale.id}/approve$`),
    );

    await logout(page);
    await login(page);
    await activateDemoCompany(page);
    await page.goto("/sales/documents");
    await confirmDocumentAction(
      page,
      "Emitir",
      new RegExp(`/api/sales/documents/${sale.id}/issue$`),
    );
    sale = await findDocument(page, "SALE", saleLineDescription);
    expect(sale.status).toBe("ISSUED");
    expect(sale.number).toBeTruthy();
  });

  await test.step("Ponto 5 — Perguntar à IA antes da contabilização", async () => {
    await analyzeDocument(page, sale.number!, "Que riscos existem antes de contabilizar esta venda?");
    expect(await documentMovements(page, sale.lines[0].id, "SALE_DOCUMENT_LINE")).toHaveLength(0);
  });

  await test.step("Ponto 6 e Ponto 8 — Contabilizar automaticamente e confirmar o stock", async () => {
    const salePosting = await confirmDocumentAction(
      page,
      "Contabilizar",
      new RegExp(`/api/accounting/sale-postings/${sale.id}$`),
    );
    expectBalancedJournal((await salePosting!).journalEntry, "SALE", sale.id);
    sale = await findDocument(page, "SALE", saleLineDescription);
    expect(sale.postedAt).toBeTruthy();
    expect(await currentStock(page, product.id, warehouse.id)).toBe(21);
    const saleMovements = await documentMovements(page, sale.lines[0].id, "SALE_DOCUMENT_LINE");
    expect(saleMovements).toHaveLength(1);
    expect(saleMovements[0].type).toBe("EXIT");
    expect(Number(saleMovements[0].quantity)).toBe(2);
  });

  await test.step("Ponto 7 — Ver a venda no Dashboard", async () => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: sale.number! })).toBeVisible();
    await expect(page.getByText(/61,50/)).toBeVisible();
    await expect(page.getByText("Stock atualizado").first()).toBeVisible();
  });

  await test.step("Ponto 11 — Avaliar os riscos sem alterar a transação", async () => {
    await page.goto("/sales/documents");
    await analyzeDocument(page, sale.number!, "O que mudou depois da contabilização desta venda?");
    expect(await documentMovements(page, sale.lines[0].id, "SALE_DOCUMENT_LINE")).toHaveLength(1);
    expect(await currentStock(page, product.id, warehouse.id)).toBe(21);
  });

  await test.step("Ponto 10 — Confirmar na auditoria quem efetuou a operação", async () => {
    await page.goto("/audit/logs");
    await expect(page.getByRole("heading", { name: "Auditoria" })).toBeVisible();
    await expect(page.getByText("admin@opsa.demo").first()).toBeVisible();
    await expect(page.getByText(sale.number!, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(supplierNumber, { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Contabilizou o documento/ }).first()).toBeVisible();
  });

  await test.step("Ponto 12 — Consultar alertas inteligentes derivados dos padrões", async () => {
    await page.goto("/ai/alerts");
    await page.getByRole("button", { name: "Analisar dados da empresa" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Estado da análise" }),
      "Ponto 12: a análise real tem de terminar em COMPLETED; FAILED/TIMEOUT não satisfaz a demonstração",
    ).toContainText("Concluída", { timeout: 90_000 });
    const hasAlert = await page.locator(".operationGrid article").count();
    if (hasAlert === 0) {
      await expect(page.getByText("Sem riscos detetados")).toBeVisible();
      await expect(page.getByText(/amostra suficiente/)).toBeVisible();
    } else {
      await expect(page.getByText("Decisão humana obrigatória").first()).toBeVisible();
    }
  });

  await test.step("Ponto 7 e Ponto 8 — Confirmar persistência do Dashboard e do stock", async () => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: sale.number! })).toBeVisible();
    await expect(page.getByRole("heading", { name: supplierNumber })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: sale.number! })).toBeVisible();
    await page.getByRole("button", { name: "Terminar sessão" }).click();
    await expect(page).toHaveURL(/\/auth$/);
    await login(page);
    await activateDemoCompany(page);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: sale.number! })).toBeVisible();
    expect(await currentStock(page, product.id, warehouse.id)).toBe(21);
  });
});
