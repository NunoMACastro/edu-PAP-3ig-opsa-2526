# BK-MF3-08 - KPIs executivos (receita, custos, EBITDA, PMR, PMP).

## Header
- `doc_id`: `GUIA-BK-MF3-08`
- `bk_id`: `BK-MF3-08`
- `macro`: `MF3`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-07`
- `rf_rnf`: `RF38`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-01`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-08-kpis-executivos-receita-custos-ebitda-pmr-pmp.md`
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais calcular KPIs executivos: receita, custos, EBITDA operacional, PMR e PMP.

#### Importância

RF38 transforma dados operacionais em indicadores de gestão. Estes KPIs alimentam a MF4, onde a IA deve explicar tendências com fontes reais.

#### Scope-in

- Calcular receita e custos do período.
- Calcular EBITDA operacional MVP.
- Calcular PMR com vendas e recebimentos.
- Calcular PMP com compras e pagamentos.
- Guardar execução em `ExecutiveKpiRun`.

#### Scope-out

- EBITDA legal/fiscal completo.
- Indicadores não documentados.
- Decisões automáticas pela IA.

#### Estado antes e depois

- Estado antes: existem relatórios operacionais.
- Estado depois: `GET /api/reports/executive-kpis` devolve indicadores calculados.

#### Pre-requisitos

- Rever BK-MF3-07, RF38 e RNF31.
- Rever BK-MF1-02, BK-MF1-03, BK-MF1-07 e BK-MF1-08.

#### Glossário

- **Receita:** vendas emitidas no período.
- **Custos:** compras/custos operacionais do período.
- **EBITDA MVP:** receita menos custos operacionais conhecidos.
- **PMR:** prazo médio de recebimento.
- **PMP:** prazo médio de pagamento.

#### Conceitos teóricos essenciais

- KPI resume dados, mas deve manter origem explicável.
- Divisão por zero deve devolver `null`, não erro técnico.
- PMR/PMP usam diferença entre data de documento e data de recebimento/pagamento.
- IA futura pode recomendar, mas não altera dados contabilísticos.

#### Arquitetura do BK

- Endpoint: `GET /api/reports/executive-kpis`.
- Role: `GESTOR`.
- Modelos: `SaleDocument`, `PurchaseDocument`, `Receipt`, `Payment`, `ExecutiveKpiRun`.
- Frontend: `ExecutiveKpisPage`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/reports/executiveKpiFilters.js`
- CRIAR: `apps/api/src/modules/reports/executiveKpiService.js`
- CRIAR: `apps/api/src/modules/reports/executiveKpiRoutes.js`
- CRIAR: `apps/web/src/lib/kpiApi.ts`
- CRIAR: `apps/web/src/pages/ExecutiveKpisPage.tsx`
- EDITAR: `apps/api/prisma/schema.prisma`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/App.tsx`
- REVER: BK-MF3-07, BK-MF1-02, BK-MF1-03, BK-MF1-07, BK-MF1-08.

#### Tutorial técnico linear

### Passo 1 - Confirmar fórmulas MVP

1. Objetivo funcional do passo no ERP.

Definir fórmulas sem inventar indicadores fora do RF38.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: RF38, BK-MF3-07.
    - LOCALIZAÇÃO: documentos canónicos.

3. Instruções do que fazer.

Regista fórmulas: receita, custos, EBITDA, PMR e PMP.

- `CANONICO`: RF38 pede KPIs executivos de receita, custos, EBITDA, PMR e PMP.
- `DERIVADO`: EBITDA neste BK é `receita - custos` como indicador operacional MVP, não EBITDA fiscal/legal completo.
- `DERIVADO`: PMR/PMP usam média simples entre data do documento e data de recebimento/pagamento; sem dados suficientes devolvem `null`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A decisão evita apresentar EBITDA MVP como resultado contabilístico oficial.

6. Validação do passo.

Evidence deve listar fórmulas.

7. Cenário negativo/erro esperado.

Não criar KPI novo sem documento canónico.

### Passo 2 - Modelar execução KPI

1. Objetivo funcional do passo no ERP.

Guardar KPIs calculados.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: `SaleDocument`, `PurchaseDocument`, `Receipt`, `Payment`.
    - LOCALIZAÇÃO: modelos de reporting.

3. Instruções do que fazer.

Adiciona `ExecutiveKpiRun`. Este modelo grava a execução dos KPIs; os dados de origem continuam nos documentos, recebimentos e pagamentos.

4. Código completo, correto e integrado com a app final.

```prisma
/// Execução de KPIs executivos por empresa.
/// Guarda indicadores calculados para evidence e para consumo explicável pela MF4.
model ExecutiveKpiRun {
  id            String   @id @default(uuid())
  companyId     String
  fromDate      DateTime
  toDate        DateTime
  revenueCents  Int
  costCents     Int
  ebitdaCents   Int
  pmrDays       Float?
  pmpDays       Float?
  generatedById String
  generatedAt   DateTime @default(now())

  @@index([companyId, fromDate, toDate])
}
```

5. Explicação do código.

`pmrDays` e `pmpDays` podem ser nulos quando não há recebimentos ou pagamentos suficientes. A relação com `BK-MF3-07` é funcional: ambos são relatórios, mas este BK calcula os indicadores a partir das fontes transacionais.

6. Validação do passo.

Migration cria modelo.

7. Cenário negativo/erro esperado.

Forcar zero em PMR sem dados enganaria o gestor.

### Passo 3 - Validar query

1. Objetivo funcional do passo no ERP.

Validar período de KPI.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reports/executiveKpiFilters.js`
    - EDITAR: nenhum.
    - REVER: `httpErrors.js`.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Reutiliza padrão de relatórios.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reports/executiveKpiFilters.js
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
    if (typeof value !== "string" || Number.isNaN(date.getTime())) throw httpError(400, "INVALID_KPI_RANGE", `${field} deve ser uma data válida`);
    return date;
}

/**
 * Valida período dos KPIs executivos.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Período validado.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo é inválido.
 */
export function validateExecutiveKpiQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) throw httpError(400, "INVALID_KPI_RANGE", "Data inicial posterior a data final");
    return { fromDate, toDate };
}
```

5. Explicação do código.

O validator isola erros de KPIs dos restantes relatórios. O JSDoc mostra a responsabilidade exata: converter query HTTP em DTO de datas para o service.

6. Validação do passo.

Testa período invertido.

7. Cenário negativo/erro esperado.

Período invertido devolve `400 INVALID_KPI_RANGE`.

### Passo 4 - Implementar service de KPIs

1. Objetivo funcional do passo no ERP.

Calcular KPIs com dados reais e fontes.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reports/executiveKpiService.js`
    - EDITAR: nenhum.
    - REVER: vendas, compras, recebimentos e pagamentos.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Trata divisão por zero.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reports/executiveKpiService.js
import { httpError } from "../../lib/httpErrors.js";

const dayMs = 86400000;

/**
 * Soma um campo monetario em cêntimos.
 *
 * @param {Array<Record<string, unknown>>} rows Linhas vindas do Prisma.
 * @param {string} field Campo a somar.
 * @returns {number} Soma em cêntimos.
 */
function sum(rows, field) {
    return rows.reduce((total, row) => total + (Number.isFinite(row[field]) ? row[field] : 0), 0);
}

/**
 * Calcula média de dias entre duas datas.
 *
 * @param {Array<Record<string, Date>>} rows Linhas com datas de início e fim.
 * @param {string} startField Campo da data inicial.
 * @param {string} endField Campo da data final.
 * @returns {number | null} Média arredondada a uma casa, ou null sem dados.
 */
function averageDays(rows, startField, endField) {
    if (rows.length === 0) return null;
    const total = rows.reduce((acc, row) => acc + Math.max(0, (row[endField].getTime() - row[startField].getTime()) / dayMs), 0);
    return Number((total / rows.length).toFixed(1));
}

/**
 * Calcula KPIs executivos a partir de documentos e liquidações reais.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e período.
 * @returns {Promise<{ runId: string, revenueCents: number, costCents: number, ebitdaCents: number, pmrDays: number | null, pmpDays: number | null, sources: string[] }>} KPIs prontos para UI e MF4.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function buildExecutiveKpis(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const [sales, purchases, receipts, payments] = await Promise.all([
        prisma.saleDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["ISSUED", "SETTLED"] } }, select: { id: true, issuedAt: true, totalCents: true } }),
        prisma.purchaseDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate }, status: { in: ["APPROVED", "POSTED", "PAID"] } }, select: { id: true, issuedAt: true, totalCents: true } }),
        prisma.receipt.findMany({ where: { companyId, receivedAt: { gte: fromDate, lte: toDate } }, select: { saleDocument: { select: { issuedAt: true } }, receivedAt: true } }),
        prisma.payment.findMany({ where: { companyId, paidAt: { gte: fromDate, lte: toDate } }, select: { purchaseDocument: { select: { issuedAt: true } }, paidAt: true } }),
    ]);

    const revenueCents = sum(sales, "totalCents");
    const costCents = sum(purchases, "totalCents");
    // EBITDA MVP: indicador operacional simples, não demonstracao financeira oficial.
    const ebitdaCents = revenueCents - costCents;
    const pmrDays = averageDays(receipts.map((row) => ({ issuedAt: row.saleDocument.issuedAt, receivedAt: row.receivedAt })), "issuedAt", "receivedAt");
    const pmpDays = averageDays(payments.map((row) => ({ issuedAt: row.purchaseDocument.issuedAt, paidAt: row.paidAt })), "issuedAt", "paidAt");

    const run = await prisma.executiveKpiRun.create({ data: { companyId, fromDate, toDate, revenueCents, costCents, ebitdaCents, pmrDays, pmpDays, generatedById: userId } });
    return { runId: run.id, revenueCents, costCents, ebitdaCents, pmrDays, pmpDays, sources: ["SaleDocument", "PurchaseDocument", "Receipt", "Payment"] };
}
```

5. Explicação do código.

O service calcula receita e custos por soma. A receita usa os estados reais de venda `ISSUED` e `SETTLED`, definidos na MF1. EBITDA MVP é a diferença operacional. PMR/PMP usam média de dias entre documento e liquidação. Sem dados, devolvem `null`, evitando inventar zero. O JSDoc documenta fórmulas, retorno e a regra multiempresa.

6. Validação do passo.

Venda emitida dia 1 e recebida dia 11 gera PMR de 10 dias.

7. Cenário negativo/erro esperado.

Sem recebimentos, `pmrDays` deve ser `null`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Publicar KPIs apenas para gestor.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reports/executiveKpiRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares.
    - LOCALIZAÇÃO: ficheiro completo e montagem.

3. Instruções do que fazer.

Cria `GET /api/reports/executive-kpis`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reports/executiveKpiRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateExecutiveKpiQuery } from "./executiveKpiFilters.js";
import { buildExecutiveKpis } from "./executiveKpiService.js";

/**
 * Constrói a route de KPIs executivos.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/reports/executive-kpis`.
 */
export function buildExecutiveKpiRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("GESTOR")];
    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateExecutiveKpiQuery(req.query);
            // companyId fica no backend para impedir que um gestor consulte outra empresa por URL.
            return res.status(200).json(await buildExecutiveKpis(prisma, { companyId: req.companyId, userId: req.user.id, ...filters }));
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
import { buildExecutiveKpiRoutes } from "./modules/reports/executiveKpiRoutes.js";

app.use("/api/reports/executive-kpis", buildExecutiveKpiRoutes({ prisma }));
```

5. Explicação do código.

A route aplica role de gestão e usa query validada. O `companyId` continua na sessão, como reforça o comentário no handler.

6. Validação do passo.

Gestor recebe `200`.

7. Cenário negativo/erro esperado.

Auditor sem role de gestor recebe `403`.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Tipar indicadores executivos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/kpiApi.ts`
    - EDITAR: nenhum.
    - REVER: cliente comum.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria tipo com `number | null` para PMR/PMP.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/kpiApi.ts
import { apiClient } from "./apiClient";

/**
 * KPIs executivos devolvidos pela API.
 */
export type ExecutiveKpis = {
    runId: string;
    revenueCents: number;
    costCents: number;
    ebitdaCents: number;
    pmrDays: number | null;
    pmpDays: number | null;
    sources: string[];
};

/**
 * Consulta KPIs executivos no backend.
 *
 * @param {string} from Data inicial `YYYY-MM-DD`.
 * @param {string} to Data final `YYYY-MM-DD`.
 * @returns {Promise<ExecutiveKpis>} Indicadores com fontes.
 */
export async function fetchExecutiveKpis(from: string, to: string): Promise<ExecutiveKpis> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<ExecutiveKpis>(`/api/reports/executive-kpis?${params.toString()}`);
}
```

5. Explicação do código.

PMR/PMP aceitam `null`, porque sem dados suficientes não se inventa indicador. O cliente usa `apiClient`, por isso o cookie seguro acompanha a chamada sem duplicar `fetch`.

6. Validação do passo.

Confirma resposta com `pmrDays: null` quando não há recebimentos.

7. Cenário negativo/erro esperado.

Role errada gera erro apresentado na página.

### Passo 7 - Criar página de KPIs

1. Objetivo funcional do passo no ERP.

Mostrar indicadores executivos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/ExecutiveKpisPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `kpiApi.ts`.
    - LOCALIZAÇÃO: ficheiro completo e menu.

3. Instruções do que fazer.

Mostra cards simples com fonte.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/ExecutiveKpisPage.tsx
import { FormEvent, useState } from "react";
import { fetchExecutiveKpis, type ExecutiveKpis } from "../lib/kpiApi";

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
 * Página de KPIs executivos.
 *
 * Mostra indicadores e fontes sem executar qualquer decisão automática. PMR/PMP usam texto "Sem dados"
 * quando o backend devolve `null`.
 *
 * @returns {JSX.Element} Interface de KPIs.
 */
export function ExecutiveKpisPage() {
    const [result, setResult] = useState<ExecutiveKpis | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // A UI pede o período; permissões e empresa são sempre decididas no backend.
            setResult(await fetchExecutiveKpis(String(form.get("from")), String(form.get("to"))));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>KPIs executivos</h1>
            <form onSubmit={handleSubmit}><input name="from" type="date" required /><input name="to" type="date" required /><button disabled={loading}>{loading ? "A calcular..." : "Calcular KPIs"}</button></form>
            {error && <p role="alert">{error}</p>}
            {result && <section><p>Receita: {euros(result.revenueCents)}</p><p>Custos: {euros(result.costCents)}</p><p>EBITDA MVP: {euros(result.ebitdaCents)}</p><p>PMR: {result.pmrDays ?? "Sem dados"} dias</p><p>PMP: {result.pmpDays ?? "Sem dados"} dias</p><p>Fontes: {result.sources.join(", ")}</p></section>}
        </main>
    );
}
```

5. Explicação do código.

A página mostra `Sem dados` quando o backend devolve `null`, em vez de inventar zero. As fontes ficam visíveis para apoiar defesa e IA. O JSDoc reforça que a página apresenta indicadores, não toma decisões.

6. Validação do passo.

Calcular período com vendas e compras.

7. Cenário negativo/erro esperado.

Período sem liquidações mostra PMR/PMP sem dados.

### Passo 8 - Validar entrega e preparar MF4

1. Objetivo funcional do passo no ERP.

Garantir que a IA da MF4 recebe KPIs explicáveis.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence.
    - REVER: resultado e fontes.
    - LOCALIZAÇÃO: checklist final.

3. Instruções do que fazer.

Regista output JSON e fontes.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo.

5. Explicação do código.

O BK termina com dados prontos para insights, sem ação automática.

6. Validação do passo.

Confirmar `ExecutiveKpiRun`.

7. Cenário negativo/erro esperado.

Sem dados suficientes, PMR/PMP ficam `null`.

## Expected results

- `200` com receita, custos, EBITDA MVP, PMR e PMP.
- `400 INVALID_KPI_RANGE` para período inválido.
- `403` sem role `GESTOR`.
- PMR/PMP `null` sem dados suficientes.

## Critérios de aceite

- KPIs calculados com dados reais.
- Fontes incluidas.
- Sem divisão por zero.
- Sem IA a alterar dados.
- Cliente frontend usa `apiClient`.

## Validação final

- Confirmar fórmulas.
- Confirmar route.
- Confirmar UI.
- Confirmar handoff para BK-MF4-01.

## Evidence para PR/defesa

- JSON dos KPIs.
- Screenshot da página.
- Prova de PMR/PMP sem dados.
- Prova de `403`.

## Handoff

BK-MF4-01 usa estes KPIs e relatórios como fonte para insights automáticos explicáveis.

## Changelog

- `2026-06-13`: corrigido para calcular KPIs reais, tratar falta de dados, usar `apiClient`, adicionar JSDoc e preparar fontes para IA explicável.
- `2026-06-13`: alinhado com MF1, usando estados reais de venda em vez de estados de compra.
