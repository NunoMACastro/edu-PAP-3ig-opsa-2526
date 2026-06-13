# BK-MF3-07 - Relatorios de vendas, compras, margens e stock.

## Header
- `doc_id`: `GUIA-BK-MF3-07`
- `bk_id`: `BK-MF3-07`
- `macro`: `MF3`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-02, BK-MF1-07, BK-MF2-02`
- `rf_rnf`: `RF37`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-08`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-07-relatorios-de-vendas-compras-margens-e-stock.md`
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais implementar relatórios operacionais de vendas, compras, margem e stock com fontes reais e filtragem por empresa.

#### Importancia

RF37 e a base de reporting para gestores e operacionais. Tambem prepara BK-MF3-08 e os insights da MF4, que precisam de dados explicaveis.

#### Scope-in

- Agregar vendas por periodo.
- Agregar compras por periodo.
- Calcular margem operacional simples.
- Listar stock atual por artigo.
- Guardar execucao em `OperationalReportRun`.

#### Scope-out

- Demonstrações financeiras oficiais.
- Dashboard executivo completo.
- IA e previsões.

#### Estado antes e depois

- Estado antes: havia dados transacionais, mas nao relatorio consolidado.
- Estado depois: `GET /api/reports/operational` devolve valores reais por empresa.

#### Pre-requisitos

- Rever BK-MF1-02, BK-MF1-07 e BK-MF2-02.
- Rever RF37, RF39 e RF41.

#### Glossario

- **Receita:** total de vendas emitidas.
- **Custo:** total de compras ou custo de stock associado.
- **Margem:** receita menos custo.
- **Fonte:** modelo usado no calculo.

#### Conceitos teoricos essenciais

- Reporting operacional agrega dados; nao cria transacoes.
- Margem do MVP e simples e deve ser explicada como indicador operacional.
- Stock vem de movimentos e saldos de inventario.
- A IA posterior so deve responder com fontes rastreaveis.

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

#### Tutorial tecnico linear

### Passo 1 - Confirmar fronteira do relatorio

1. Objetivo funcional do passo no ERP.

Confirmar que este BK le e agrega dados, sem alterar documentos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: RF37.
    - LOCALIZACAO: documentos canonicos.

3. Instrucoes do que fazer.

Regista que margem e operacional e nao substitui demonstrações oficiais.

- `CANONICO`: RF37 pede relatorios de vendas, compras, margens e stock.
- `DERIVADO`: a margem deste BK e `vendas - compras` como indicador operacional MVP; nao substitui margem bruta calculada por custo de stock/FIFO nem demonstracoes financeiras.

4. Codigo completo, correto e integrado com a app final.

Sem codigo neste passo.

5. Explicacao do codigo.

Separar relatorio operacional de contabilidade evita conclusoes legais erradas.

6. Validacao do passo.

Evidence deve indicar fontes: vendas, compras e stock.

7. Cenario negativo/erro esperado.

Nao usar balanco como relatorio operacional.

### Passo 2 - Modelar execucao

1. Objetivo funcional do passo no ERP.

Guardar resumo do relatorio.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: modelos transacionais.
    - LOCALIZACAO: modelos de reporting.

3. Instrucoes do que fazer.

Adiciona `OperationalReportRun`.

4. Codigo completo, correto e integrado com a app final.

```prisma
/// Execucao de relatorio operacional.
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

5. Explicacao do codigo.

O modelo guarda totais principais e prova de execucao. As linhas detalhadas sao devolvidas pela API.

6. Validacao do passo.

Migration cria o modelo.

7. Cenario negativo/erro esperado.

Sem run, BK-MF3-08 nao tem ponto de apoio para KPIs.

### Passo 3 - Validar query

1. Objetivo funcional do passo no ERP.

Validar periodo do relatorio.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reports/operationalReportFilters.js`
    - EDITAR: nenhum.
    - REVER: `httpErrors.js`.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Usa validator de datas simples.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reports/operationalReportFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte data textual da query para Date.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} field Nome do campo para erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando a data e invalida.
 */
function parseDate(value, field) {
    const date = new Date(value);
    if (typeof value !== "string" || Number.isNaN(date.getTime())) throw httpError(400, "INVALID_REPORT_RANGE", `${field} deve ser uma data valida`);
    return date;
}

/**
 * Valida periodo de relatorio operacional.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Periodo seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo e invalido.
 */
export function validateOperationalReportQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) throw httpError(400, "INVALID_REPORT_RANGE", "Data inicial posterior a data final");
    return { fromDate, toDate };
}
```

5. Explicacao do codigo.

O validator evita consultas sem periodo e devolve erro especifico do modulo de relatorios. O JSDoc ensina a separar input HTTP textual do DTO usado pelo service.

6. Validacao do passo.

Testa data invalida.

7. Cenario negativo/erro esperado.

Periodo invertido devolve `400`.

### Passo 4 - Implementar service de agregacao

1. Objetivo funcional do passo no ERP.

Somar vendas, compras, margem e stock com dados reais.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reports/operationalReportService.js`
    - EDITAR: nenhum.
    - REVER: modelos de dependencias.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Filtra sempre por `companyId`.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reports/operationalReportService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Soma um campo monetario em centimos numa lista de registos.
 *
 * @param {Array<Record<string, unknown>>} rows Linhas vindas do Prisma.
 * @param {string} field Campo a somar.
 * @returns {number} Soma em centimos.
 */
function sumCents(rows, field) {
    return rows.reduce((sum, row) => sum + (Number.isFinite(row[field]) ? row[field] : 0), 0);
}

/**
 * Gera relatorio operacional de vendas, compras, margem simples e stock.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e periodo.
 * @returns {Promise<{ runId: string, totals: { salesCents: number, purchasesCents: number, marginCents: number, stockUnits: number }, sales: Array<object>, purchases: Array<object>, stock: Array<object>, sources: string[] }>} Relatorio pronto para UI e KPIs.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando nao ha empresa ativa.
 */
export async function buildOperationalReport(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatoria");

    const [sales, purchases, stockBalances] = await Promise.all([
        prisma.saleDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["ISSUED", "SETTLED"] } }, select: { id: true, number: true, totalCents: true } }),
        prisma.purchaseDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["APPROVED", "POSTED", "PAID"] } }, select: { id: true, supplierNumber: true, totalCents: true } }),
        prisma.stockBalance.findMany({ where: { companyId }, select: { itemId: true, quantity: true, item: { select: { sku: true, name: true } } } }),
    ]);

    const salesCents = sumCents(sales, "totalCents");
    const purchasesCents = sumCents(purchases, "totalCents");
    // Margem MVP: indicador operacional simples, nao margem contabilistica por custo de stock.
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

5. Explicacao do codigo.

O service soma totais de vendas e compras e calcula margem simples. Vendas usam estados reais `ISSUED` e `SETTLED`; compras usam `supplierNumber` e expoem esse valor como `number` na resposta para manter o contrato simples do frontend. Stock vem de `StockBalance`, criado na MF2, e a quantidade e convertida para numero antes de somar. O resultado inclui fontes para IA posterior. O comentario no calculo da margem evita que o aluno confunda este indicador MVP com margem contabilistica por custo de vendas.

6. Validacao do passo.

Com venda 1000 EUR e compra 600 EUR, margem deve ser 400 EUR.

7. Cenario negativo/erro esperado.

Sem empresa ativa devolve `401`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Publicar relatorio para gestor e operacional.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reports/operationalReportRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares.
    - LOCALIZACAO: ficheiro completo e montagem.

3. Instrucoes do que fazer.

Cria `GET /api/reports/operational`.

4. Codigo completo, correto e integrado com a app final.

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
 * Constroi a route de relatorios operacionais.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependencias da route.
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

5. Explicacao do codigo.

A route aplica permissao no backend. O controller transforma erros em JSON, e o comentario deixa explicita a protecao multiempresa.

6. Validacao do passo.

`GESTOR` recebe `200`.

7. Cenario negativo/erro esperado.

Sem sessão devolve `401`.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Tipar relatorio operacional no frontend.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/reportApi.ts`
    - EDITAR: nenhum.
    - REVER: cliente comum.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Cria tipos de totais e listas.

4. Codigo completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/reportApi.ts
import { apiClient } from "./apiClient";

/**
 * Relatorio operacional usado por gestores e operacionais.
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
 * Consulta relatorio operacional no backend.
 *
 * @param {string} from Data inicial `YYYY-MM-DD`.
 * @param {string} to Data final `YYYY-MM-DD`.
 * @returns {Promise<OperationalReport>} Relatorio tipado com fontes.
 */
export async function fetchOperationalReport(from: string, to: string): Promise<OperationalReport> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<OperationalReport>(`/api/reports/operational?${params.toString()}`);
}
```

5. Explicacao do codigo.

O cliente usa nomes de dominio e reutiliza `apiClient` para manter cookies HttpOnly. `sources` permite mostrar origem dos dados na UI.

6. Validacao do passo.

Confirma chamada com datas.

7. Cenario negativo/erro esperado.

Erro `403` aparece como mensagem.

### Passo 7 - Criar pagina de relatorios

1. Objetivo funcional do passo no ERP.

Mostrar totais e listas principais.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/OperationalReportsPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `reportApi.ts`.
    - LOCALIZACAO: ficheiro completo e menu.

3. Instrucoes do que fazer.

Cria formulario e resumo.

4. Codigo completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/OperationalReportsPage.tsx
import { FormEvent, useState } from "react";
import { fetchOperationalReport, type OperationalReport } from "../lib/reportApi";

/**
 * Formata centimos em EUR para apresentacao.
 *
 * @param {number} cents Valor em centimos.
 * @returns {string} Valor legivel.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Pagina de relatorios operacionais.
 *
 * Gere datas, loading, erro, resultado e estado vazio. A pagina apresenta um indicador de margem MVP,
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
            // A UI recolhe periodo; roles e empresa sao validados pela route.
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
            <h1>Relatorios operacionais</h1>
            <form onSubmit={handleSubmit}><input name="from" type="date" required /><input name="to" type="date" required /><button disabled={loading}>{loading ? "A carregar..." : "Consultar"}</button></form>
            {error && <p role="alert">{error}</p>}
            {result && <section><p>Vendas: {euros(result.totals.salesCents)}</p><p>Compras: {euros(result.totals.purchasesCents)}</p><p>Margem: {euros(result.totals.marginCents)}</p><p>Stock: {result.totals.stockUnits} unidades</p></section>}
            {result && result.sales.length === 0 && result.purchases.length === 0 && <p>Sem vendas ou compras no periodo.</p>}
        </main>
    );
}
```

5. Explicacao do codigo.

A pagina mostra totais principais e estado vazio. Os detalhes de vendas, compras e stock ficam disponiveis em `result` para tabela na mesma pagina. O JSDoc reforca que a margem apresentada e operacional MVP.

6. Validacao do passo.

Consulta periodo com vendas.

7. Cenario negativo/erro esperado.

Sessao expirada mostra erro.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Preparar KPIs e IA com fontes reais.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence.
    - REVER: service e resultado.
    - LOCALIZACAO: checklist final.

3. Instrucoes do que fazer.

Regista valores e fontes.

4. Codigo completo, correto e integrado com a app final.

Sem codigo novo neste passo.

5. Explicacao do codigo.

O handoff garante que BK-MF3-08 usa estes totais para KPIs.

6. Validacao do passo.

Confirmar `OperationalReportRun`.

7. Cenario negativo/erro esperado.

Empresa sem dados devolve totais a zero e listas vazias.

## Expected results

- `200` com vendas, compras, margem e stock.
- `400 INVALID_REPORT_RANGE` para periodo invalido.
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

- JSON do relatorio.
- Screenshot.
- Provas de negativos.

## Handoff

BK-MF3-08 usa `OperationalReportRun` e os mesmos modelos para KPIs executivos.

## Changelog

- `2026-06-13`: corrigido para agregar vendas, compras, margem MVP e stock com fontes reais, JSDoc e `apiClient`.
- `2026-06-13`: alinhado com MF1/MF2, usando estados reais de venda, `supplierNumber` em compras e conversao numerica de `StockBalance.quantity`.
