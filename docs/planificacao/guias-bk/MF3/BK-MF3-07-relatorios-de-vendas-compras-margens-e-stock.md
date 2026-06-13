# BK-MF3-07 - Relatórios de vendas, compras, margens e stock.

## Header
- `doc_id`: `GUIA-BK-MF3-07`
- `bk_id`: `BK-MF3-07`
- `macro`: `MF3`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-11, BK-MF1-02, BK-MF1-07, BK-MF2-02`
- `rf_rnf`: `RF37`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-08`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-07-relatorios-de-vendas-compras-margens-e-stock.md`
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais implementar relatórios operacionais de vendas, compras, margem e stock com fontes reais e filtragem por empresa.

#### Importância

RF37 é a base de reporting para gestores e operacionais. Também prepara BK-MF3-08 e os insights da MF4, que precisam de dados explicáveis.

#### Scope-in

- Agregar vendas por período.
- Agregar compras por período.
- Calcular margem operacional simples.
- Listar stock atual por artigo.
- Guardar execução em `OperationalReportRun`.

#### Scope-out

- Demonstrações financeiras oficiais.
- Dashboard executivo completo.
- IA e previsões.

#### Estado antes e depois

- Estado antes: havia dados transacionais, mas não relatório consolidado.
- Estado depois: `GET /api/reports/operational` devolve valores reais por empresa.

#### Pre-requisitos

- Rever BK-MF1-02, BK-MF1-07 e BK-MF2-02.
- Rever RF37, RF39 e RF41.

#### Glossário

- **Receita:** total de vendas emitidas.
- **Custo:** total de compras ou custo de stock associado.
- **Margem:** receita menos custo.
- **Fonte:** modelo usado no cálculo.

#### Conceitos teóricos essenciais

- Reporting operacional agrega dados; não cria transações.
- Margem do MVP é simples e deve ser explicada como indicador operacional.
- Stock vem de movimentos e saldos de inventário.
- A IA posterior só deve responder com fontes rastreáveis.

#### Arquitetura do BK

- Endpoint: `GET /api/reports/operational`.
- Roles: `GESTOR`, `OPERACIONAL`.
- Modelos: `SaleDocument`, `PurchaseDocument`, `StockBalance`, `Item`, `OperationalReportRun`.
- Frontend: `OperationalReportsPage`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/reports/operationalReportFilters.js`
- CRIAR: `apps/api/src/modules/reports/operationalReportService.js`
- CRIAR: `apps/api/src/modules/reports/operationalReportRoutes.js`
- CRIAR: `apps/web/src/lib/reportApi.ts`
- CRIAR: `apps/web/src/pages/OperationalReportsPage.tsx`
- EDITAR: `apps/api/prisma/schema.prisma`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/App.tsx`
- REVER: BK-MF1-02, BK-MF1-07, BK-MF2-02.

#### Tutorial técnico linear

### Passo 1 - Confirmar fronteira do relatório

1. Objetivo funcional do passo no ERP.

Confirmar que este BK lê e agrega dados, sem alterar documentos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: RF37.
    - LOCALIZAÇÃO: documentos canónicos.

3. Instruções do que fazer.

Regista que margem é operacional e não substitui demonstrações oficiais.

- `CANONICO`: RF37 pede relatórios de vendas, compras, margens e stock.
- `DERIVADO`: a margem deste BK é `vendas - compras` como indicador operacional MVP; não substitui margem bruta calculada por custo de stock/FIFO nem demonstrações financeiras.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Separar relatório operacional de contabilidade evita conclusoes legais erradas.

6. Validação do passo.

Evidence deve indicar fontes: vendas, compras e stock.

7. Cenário negativo/erro esperado.

Não usar balanço como relatório operacional.

### Passo 2 - Modelar execução

1. Objetivo funcional do passo no ERP.

Guardar resumo do relatório.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: modelos transacionais.
    - LOCALIZAÇÃO: modelos de reporting.

3. Instruções do que fazer.

Adiciona `OperationalReportRun`.

4. Código completo, correto e integrado com a app final.

```prisma
/// Execução de relatório operacional.
/// Guarda totais para evidence e para KPIs derivados no BK-MF3-08.
model OperationalReportRun {
  id             String   @id @default(uuid())
  companyId      String
  fromDate       DateTime
  toDate         DateTime
  salesCents     Int
  purchasesCents Int
  marginCents    Int
  stockUnits     Int
  generatedById  String
  generatedAt    DateTime @default(now())

  @@index([companyId, fromDate, toDate])
}
```

5. Explicação do código.

O modelo guarda totais principais e prova de execução. As linhas detalhadas são devolvidas pela API.

6. Validação do passo.

Migration cria o modelo.

7. Cenário negativo/erro esperado.

Sem run, BK-MF3-08 não tem ponto de apoio para KPIs.

### Passo 3 - Validar query

1. Objetivo funcional do passo no ERP.

Validar período do relatório.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reports/operationalReportFilters.js`
    - EDITAR: nenhum.
    - REVER: `httpErrors.js`.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Usa validator de datas simples.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reports/operationalReportFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte data textual da query para Date.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} field Nome do campo para erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando a data é inválida.
 */
function parseDate(value, field) {
    const date = new Date(value);
    if (typeof value !== "string" || Number.isNaN(date.getTime())) throw httpError(400, "INVALID_REPORT_RANGE", `${field} deve ser uma data válida`);
    return date;
}

/**
 * Valida período de relatório operacional.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Período seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo é inválido.
 */
export function validateOperationalReportQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) throw httpError(400, "INVALID_REPORT_RANGE", "Data inicial posterior a data final");
    return { fromDate, toDate };
}
```

5. Explicação do código.

O validator evita consultas sem período e devolve erro específico do módulo de relatórios. O JSDoc ensina a separar input HTTP textual do DTO usado pelo service.

6. Validação do passo.

Testa data inválida.

7. Cenário negativo/erro esperado.

Período invertido devolve `400`.

### Passo 4 - Implementar service de agregação

1. Objetivo funcional do passo no ERP.

Somar vendas, compras, margem e stock com dados reais.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reports/operationalReportService.js`
    - EDITAR: nenhum.
    - REVER: modelos de dependências.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Filtra sempre por `companyId`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reports/operationalReportService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Soma um campo monetario em cêntimos numa lista de registos.
 *
 * @param {Array<Record<string, unknown>>} rows Linhas vindas do Prisma.
 * @param {string} field Campo a somar.
 * @returns {number} Soma em cêntimos.
 */
function sumCents(rows, field) {
    return rows.reduce((sum, row) => sum + (Number.isFinite(row[field]) ? row[field] : 0), 0);
}

/**
 * Gera relatório operacional de vendas, compras, margem simples e stock.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e período.
 * @returns {Promise<{ runId: string, totals: { salesCents: number, purchasesCents: number, marginCents: number, stockUnits: number }, sales: Array<object>, purchases: Array<object>, stock: Array<object>, sources: string[] }>} Relatório pronto para UI e KPIs.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function buildOperationalReport(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const [sales, purchases, stockBalances] = await Promise.all([
        prisma.saleDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["ISSUED", "SETTLED"] } }, select: { id: true, number: true, totalCents: true } }),
        prisma.purchaseDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["APPROVED", "POSTED", "PAID"] } }, select: { id: true, supplierNumber: true, totalCents: true } }),
        prisma.stockBalance.findMany({ where: { companyId }, select: { itemId: true, quantity: true, item: { select: { sku: true, name: true } } } }),
    ]);

    const salesCents = sumCents(sales, "totalCents");
    const purchasesCents = sumCents(purchases, "totalCents");
    // Margem MVP: indicador operacional simples, não margem contabilística por custo de stock.
    const marginCents = salesCents - purchasesCents;
    const stockUnits = stockBalances.reduce((sum, row) => sum + Number(row.quantity), 0);
    const purchaseRows = purchases.map((document) => ({ id: document.id, number: document.supplierNumber, totalCents: document.totalCents }));

    const run = await prisma.operationalReportRun.create({ data: { companyId, fromDate, toDate, salesCents, purchasesCents, marginCents, stockUnits, generatedById: userId } });

    return {
        runId: run.id,
        totals: { salesCents, purchasesCents, marginCents, stockUnits },
        sales,
        purchases: purchaseRows,
        stock: stockBalances.map((row) => ({ itemId: row.itemId, sku: row.item.sku, name: row.item.name, quantity: Number(row.quantity) })),
        sources: ["SaleDocument", "PurchaseDocument", "StockBalance"],
    };
}
```

5. Explicação do código.

O service soma totais de vendas e compras e calcula margem simples. Vendas usam estados reais `ISSUED` e `SETTLED`; compras usam `supplierNumber` e expõem esse valor como `number` na resposta para manter o contrato simples do frontend. Stock vem de `StockBalance`, criado na MF2, e a quantidade é convertida para número antes de somar. O resultado inclui fontes para IA posterior. O comentário no cálculo da margem evita que o aluno confunda este indicador MVP com margem contabilística por custo de vendas.

6. Validação do passo.

Com venda 1000 EUR e compra 600 EUR, margem deve ser 400 EUR.

7. Cenário negativo/erro esperado.

Sem empresa ativa devolve `401`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Publicar relatório para gestor e operacional.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reports/operationalReportRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares.
    - LOCALIZAÇÃO: ficheiro completo e montagem.

3. Instruções do que fazer.

Cria `GET /api/reports/operational`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reports/operationalReportRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateOperationalReportQuery } from "./operationalReportFilters.js";
import { buildOperationalReport } from "./operationalReportService.js";

/**
 * Constrói a route de relatórios operacionais.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/reports/operational`.
 */
export function buildOperationalReportRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("GESTOR", "OPERACIONAL")];
    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateOperationalReportQuery(req.query);
            // A empresa vem do contexto autenticado para impedir reporting cross-company.
            return res.status(200).json(await buildOperationalReport(prisma, { companyId: req.companyId, userId: req.user.id, ...filters }));
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });
    return router;
}
```

```js
// apps/api/src/server.js
import { buildOperationalReportRoutes } from "./modules/reports/operationalReportRoutes.js";

app.use("/api/reports/operational", buildOperationalReportRoutes({ prisma }));
```

5. Explicação do código.

A route aplica permissão no backend. O controller transforma erros em JSON, e o comentário deixa explícita a proteção multiempresa.

6. Validação do passo.

`GESTOR` recebe `200`.

7. Cenário negativo/erro esperado.

Sem sessão devolve `401`.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Tipar relatório operacional no frontend.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/reportApi.ts`
    - EDITAR: nenhum.
    - REVER: cliente comum.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria tipos de totais e listas.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/reportApi.ts
import { apiClient } from "./apiClient";

/**
 * Relatório operacional usado por gestores e operacionais.
 */
export type OperationalReport = {
    runId: string;
    totals: { salesCents: number; purchasesCents: number; marginCents: number; stockUnits: number };
    sales: Array<{ id: string; number: string; totalCents: number }>;
    purchases: Array<{ id: string; number: string; totalCents: number }>;
    stock: Array<{ itemId: string; sku: string; name: string; quantity: number }>;
    sources: string[];
};

/**
 * Consulta relatório operacional no backend.
 *
 * @param {string} from Data inicial `YYYY-MM-DD`.
 * @param {string} to Data final `YYYY-MM-DD`.
 * @returns {Promise<OperationalReport>} Relatório tipado com fontes.
 */
export async function fetchOperationalReport(from: string, to: string): Promise<OperationalReport> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<OperationalReport>(`/api/reports/operational?${params.toString()}`);
}
```

5. Explicação do código.

O cliente usa nomes de domínio e reutiliza `apiClient` para manter cookies HttpOnly. `sources` permite mostrar origem dos dados na UI.

6. Validação do passo.

Confirma chamada com datas.

7. Cenário negativo/erro esperado.

Erro `403` aparece como mensagem.

### Passo 7 - Criar página de relatórios

1. Objetivo funcional do passo no ERP.

Mostrar totais e listas principais.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/OperationalReportsPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `reportApi.ts`.
    - LOCALIZAÇÃO: ficheiro completo e menu.

3. Instruções do que fazer.

Cria formulario e resumo.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/OperationalReportsPage.tsx
import { FormEvent, useState } from "react";
import { fetchOperationalReport, type OperationalReport } from "../lib/reportApi";

/**
 * Formata cêntimos em EUR para apresentacao.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor legível.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Página de relatórios operacionais.
 *
 * Gere datas, loading, erro, resultado e estado vazio. A página apresenta um indicador de margem MVP,
 * sem o transformar em demonstracao financeira oficial.
 *
 * @returns {JSX.Element} Interface de reporting operacional.
 */
export function OperationalReportsPage() {
    const [result, setResult] = useState<OperationalReport | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // A UI recolhe período; roles e empresa são validados pela route.
            setResult(await fetchOperationalReport(String(form.get("from")), String(form.get("to"))));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Relatórios operacionais</h1>
            <form onSubmit={handleSubmit}><input name="from" type="date" required /><input name="to" type="date" required /><button disabled={loading}>{loading ? "A carregar..." : "Consultar"}</button></form>
            {error && <p role="alert">{error}</p>}
            {result && <section><p>Vendas: {euros(result.totals.salesCents)}</p><p>Compras: {euros(result.totals.purchasesCents)}</p><p>Margem: {euros(result.totals.marginCents)}</p><p>Stock: {result.totals.stockUnits} unidades</p></section>}
            {result && result.sales.length === 0 && result.purchases.length === 0 && <p>Sem vendas ou compras no período.</p>}
        </main>
    );
}
```

5. Explicação do código.

A página mostra totais principais e estado vazio. Os detalhes de vendas, compras e stock ficam disponíveis em `result` para tabela na mesma página. O JSDoc reforça que a margem apresentada é operacional MVP.

6. Validação do passo.

Consulta período com vendas.

7. Cenário negativo/erro esperado.

Sessão expirada mostra erro.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Preparar KPIs e IA com fontes reais.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence.
    - REVER: service e resultado.
    - LOCALIZAÇÃO: checklist final.

3. Instruções do que fazer.

Regista valores e fontes.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo.

5. Explicação do código.

O handoff garante que BK-MF3-08 usa estes totais para KPIs.

6. Validação do passo.

Confirmar `OperationalReportRun`.

7. Cenário negativo/erro esperado.

Empresa sem dados devolve totais a zero e listas vazias.

## Expected results

- `200` com vendas, compras, margem e stock.
- `400 INVALID_REPORT_RANGE` para período inválido.
- `401` sem sessão.
- `403` sem role.

## Critérios de aceite

- Agregacao usa dados reais.
- Fontes incluidas.
- Run gravado.
- Multiempresa aplicada.
- Cliente frontend usa `apiClient`.

## Validação final

- Confirmar imports.
- Confirmar sources.
- Confirmar UI.

## Evidence para PR/defesa

- JSON do relatório.
- Screenshot.
- Provas de negativos.

## Handoff

BK-MF3-08 usa `OperationalReportRun` e os mesmos modelos para KPIs executivos.

## Changelog

- `2026-06-13`: corrigido para agregar vendas, compras, margem MVP e stock com fontes reais, JSDoc e `apiClient`.
- `2026-06-13`: alinhado com MF1/MF2, usando estados reais de venda, `supplierNumber` em compras e conversão numérica de `StockBalance.quantity`.
