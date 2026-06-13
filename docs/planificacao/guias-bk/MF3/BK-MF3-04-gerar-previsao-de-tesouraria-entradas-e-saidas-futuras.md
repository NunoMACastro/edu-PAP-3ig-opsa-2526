# BK-MF3-04 - Gerar previsão de tesouraria (entradas e saídas futuras).

## Header
- `doc_id`: `GUIA-BK-MF3-04`
- `bk_id`: `BK-MF3-04`
- `macro`: `MF3`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-02, BK-MF1-02, BK-MF1-03, BK-MF1-07, BK-MF1-08`
- `rf_rnf`: `RF34`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-05`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-04-gerar-previsao-de-tesouraria-entradas-e-saidas-futuras.md`
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais calcular uma previsão de tesouraria com entradas previstas, saídas previstas e saldo projetado.

#### Importância

RF34 ajuda o gestor a antecipar falta ou excesso de caixa. A previsão é uma análise operacional, não altera recebimentos, pagamentos ou contabilidade.

#### Scope-in

- Consultar documentos de venda e compra em aberto.
- Usar saldo mais recente das contas de tesouraria.
- Agregar por dia.
- Expor resultado a gestores.

#### Scope-out

- IA preditiva avançada.
- Simulacoes de crédito.
- Alteração automática de datas de pagamento.

#### Estado antes e depois

- Estado antes: documentos de venda e compra existem, mas não há visão futura agregada.
- Estado depois: `GET /api/treasury/forecast` devolve entradas, saídas e saldo projetado.

#### Pre-requisitos

- Rever BK-MF3-02 para saldos.
- Rever BK-MF1-02, BK-MF1-03, BK-MF1-07 e BK-MF1-08 para documentos com valor em aberto e `amountPaidCents`.
- Rever RF34 e RF42.

#### Glossário

- **Entrada prevista:** valor a receber.
- **Saída prevista:** valor a pagar.
- **Saldo projetado:** saldo inicial mais entradas menos saídas.
- **Fonte:** origem do dado usado no cálculo.

#### Conceitos teóricos essenciais

- Tesouraria olha para dinheiro esperado, não para lucro contabilístico.
- O período máximo deve ser curto para manter previsão legível.
- O gestor vê previsão; o sistema não altera documentos.
- Fonte explicável prepara BK-MF4-04.

#### Arquitetura do BK

- Endpoint: `GET /api/treasury/forecast`.
- Role: `GESTOR`.
- Service: agrega `SaleDocument`, `PurchaseDocument` e o snapshot mais recente de cada `TreasuryAccount`.
- Frontend: `CashflowForecastPage`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/treasury/cashflowForecastFilters.js`
- CRIAR: `apps/api/src/modules/treasury/cashflowForecastService.js`
- CRIAR: `apps/api/src/modules/treasury/cashflowForecastRoutes.js`
- CRIAR: `apps/web/src/lib/forecastApi.ts`
- CRIAR: `apps/web/src/pages/CashflowForecastPage.tsx`
- EDITAR: `apps/api/prisma/schema.prisma`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/App.tsx`
- REVER: BK-MF3-02, BK-MF1-02, BK-MF1-03, BK-MF1-07, BK-MF1-08.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e horizonte

1. Objetivo funcional do passo no ERP.

Definir que a previsão usa dados existentes e não cria movimentos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: RF34, RF42.
    - LOCALIZAÇÃO: documentos canónicos.

3. Instruções do que fazer.

Define horizonte máximo de 180 dias como decisão técnica mínima.

- `CANONICO`: RF34 pede previsão de entradas e saídas futuras de tesouraria.
- `DERIVADO`: o horizonte de 180 dias é um limite técnico MVP para manter resposta rápida e legível.
- `DERIVADO`: entradas/saídas usam `totalCents - amountPaidCents`, campo mantido pelos BKs de recebimentos (`BK-MF1-03`) e pagamentos (`BK-MF1-08`).

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O limite reduz consultas lentas e previsões pouco fiaveis.

6. Validação do passo.

Evidence deve indicar horizonte escolhido.

7. Cenário negativo/erro esperado.

Pedido com mais de 180 dias deve falhar.

### Passo 2 - Criar modelo da execução

1. Objetivo funcional do passo no ERP.

Guardar previsões geradas para evidence.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: `Company`, `User`.
    - LOCALIZAÇÃO: modelos de tesouraria.

3. Instruções do que fazer.

Adiciona modelo pequeno com totais.

4. Código completo, correto e integrado com a app final.

```prisma
/// Execução resumida de uma previsão de tesouraria.
/// Guarda evidence da consulta sem alterar documentos, recebimentos ou pagamentos.
model CashflowForecastRun {
  id                 String   @id @default(uuid())
  companyId          String
  fromDate           DateTime
  toDate             DateTime
  openingBalanceCents Int
  expectedInCents    Int
  expectedOutCents   Int
  closingBalanceCents Int
  generatedById      String
  generatedAt        DateTime @default(now())

  @@index([companyId, fromDate, toDate])
}
```

5. Explicação do código.

O modelo grava apenas resumo e período. As linhas detalhadas podem ser recalculadas a partir das fontes.

6. Validação do passo.

Migration cria o modelo.

7. Cenário negativo/erro esperado.

Sem execução gravada, a defesa depende apenas do ecrã.

### Passo 3 - Validar query

1. Objetivo funcional do passo no ERP.

Normalizar datas e bloquear horizonte excessivo.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/cashflowForecastFilters.js`
    - EDITAR: nenhum.
    - REVER: `httpErrors.js`.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria validator próprio para previsão.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/cashflowForecastFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte uma data da query string para Date.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} field Nome do campo para mensagem de erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando a data é inválida.
 */
function parseDate(value, field) {
    const date = new Date(value);
    if (typeof value !== "string" || Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_FORECAST_RANGE", `${field} deve ser uma data válida`);
    }
    return date;
}

/**
 * Valida o período da previsão de tesouraria.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Período seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 para intervalo inválido ou superior a 180 dias.
 */
export function validateForecastQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) throw httpError(400, "INVALID_FORECAST_RANGE", "Data inicial posterior a data final");
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
    if (days > 180) throw httpError(400, "FORECAST_RANGE_TOO_LONG", "A previsão não deve exceder 180 dias");
    return { fromDate, toDate };
}
```

5. Explicação do código.

O validator separa erros de forecast dos erros fiscais do BK anterior. `FORECAST_RANGE_TOO_LONG` fica implementado, não apenas prometido. O JSDoc explica que a route recebe texto, mas o service trabalha com datas já validadas.

6. Validação do passo.

Testa 181 dias.

7. Cenário negativo/erro esperado.

Intervalo superior a 180 dias devolve `400 FORECAST_RANGE_TOO_LONG`.

### Passo 4 - Implementar service de previsão

1. Objetivo funcional do passo no ERP.

Calcular entradas, saídas e saldo projetado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/cashflowForecastService.js`
    - EDITAR: nenhum.
    - REVER: `SaleDocument`, `PurchaseDocument`, `TreasuryBalanceSnapshot`.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Agrega por data e grava execução.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/cashflowForecastService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte uma data para chave diária ISO.
 *
 * @param {Date} date Data a agregar.
 * @returns {string} Chave `YYYY-MM-DD`.
 */
function dayKey(date) {
    return date.toISOString().slice(0, 10);
}

/**
 * Soma entrada ou saída prevista ao dia correto.
 *
 * @param {Map<string, { date: string, expectedInCents: number, expectedOutCents: number, sources: string[] }>} map Linhas diárias.
 * @param {Date} date Data de vencimento.
 * @param {{ expectedInCents?: number, expectedOutCents?: number, source: string }} patch Valor e fonte.
 * @returns {void}
 */
function addLine(map, date, patch) {
    const key = dayKey(date);
    const current = map.get(key) ?? { date: key, expectedInCents: 0, expectedOutCents: 0, sources: [] };
    current.expectedInCents += patch.expectedInCents ?? 0;
    current.expectedOutCents += patch.expectedOutCents ?? 0;
    current.sources.push(patch.source);
    map.set(key, current);
}

/**
 * Soma apenas o snapshot mais recente de cada conta de tesouraria.
 *
 * @param {Array<{ treasuryAccountId: string, balanceCents: number, capturedAt: Date }>} snapshots Snapshots ordenados por conta e data descendente.
 * @returns {number} Saldo inicial agregado em cêntimos.
 */
function sumLatestBalancesByAccount(snapshots) {
    const latestByAccount = new Map();
    for (const snapshot of snapshots) {
        if (!latestByAccount.has(snapshot.treasuryAccountId)) {
            latestByAccount.set(snapshot.treasuryAccountId, snapshot);
        }
    }
    return [...latestByAccount.values()].reduce((sum, snapshot) => sum + snapshot.balanceCents, 0);
}

/**
 * Calcula previsão de tesouraria por dia para a empresa ativa.
 *
 * A função é apenas analítica: não altera documentos, recebimentos, pagamentos nem contabilidade.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e período validado.
 * @returns {Promise<{ runId: string, from: string, to: string, openingBalanceCents: number, expectedInCents: number, expectedOutCents: number, closingBalanceCents: number, rows: Array<{ date: string, expectedInCents: number, expectedOutCents: number, projectedBalanceCents: number, sources: string[] }> }>} Forecast pronto para UI e IA explicável futura.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function buildCashflowForecast(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const [snapshots, salesOpen, purchasesOpen] = await Promise.all([
        prisma.treasuryBalanceSnapshot.findMany({
            where: { companyId },
            orderBy: [{ treasuryAccountId: "asc" }, { capturedAt: "desc" }],
            select: { treasuryAccountId: true, balanceCents: true, capturedAt: true },
        }),
        prisma.saleDocument.findMany({
            where: { companyId, status: { in: ["ISSUED", "SETTLED"] }, dueDate: { not: null, gte: fromDate, lte: toDate } },
            select: { id: true, dueDate: true, totalCents: true, amountPaidCents: true },
        }),
        prisma.purchaseDocument.findMany({
            where: { companyId, status: { in: ["APPROVED", "POSTED", "PAID"] }, dueDate: { not: null, gte: fromDate, lte: toDate } },
            select: { id: true, dueDate: true, totalCents: true, amountPaidCents: true },
        }),
    ]);

    const openingBalanceCents = sumLatestBalancesByAccount(snapshots);
    const days = new Map();

    // Para prever futuro usamos valores em aberto; recebimentos/pagamentos já realizados reduzem amountPaidCents.
    for (const document of salesOpen) {
        const openAmountCents = Math.max(0, document.totalCents - document.amountPaidCents);
        if (openAmountCents > 0) addLine(days, document.dueDate, { expectedInCents: openAmountCents, source: `SaleDocument:${document.id}` });
    }

    for (const document of purchasesOpen) {
        const openAmountCents = Math.max(0, document.totalCents - document.amountPaidCents);
        if (openAmountCents > 0) addLine(days, document.dueDate, { expectedOutCents: openAmountCents, source: `PurchaseDocument:${document.id}` });
    }

    let runningBalanceCents = openingBalanceCents;
    const rows = [...days.values()].sort((a, b) => a.date.localeCompare(b.date)).map((row) => {
        runningBalanceCents += row.expectedInCents - row.expectedOutCents;
        return { ...row, projectedBalanceCents: runningBalanceCents };
    });

    const expectedInCents = [...days.values()].reduce((sum, item) => sum + item.expectedInCents, 0);
    const expectedOutCents = [...days.values()].reduce((sum, item) => sum + item.expectedOutCents, 0);
    const closingBalanceCents = openingBalanceCents + expectedInCents - expectedOutCents;

    const run = await prisma.cashflowForecastRun.create({ data: { companyId, fromDate, toDate, openingBalanceCents, expectedInCents, expectedOutCents, closingBalanceCents, generatedById: userId } });
    return { runId: run.id, from: dayKey(fromDate), to: dayKey(toDate), openingBalanceCents, expectedInCents, expectedOutCents, closingBalanceCents, rows };
}
```

5. Explicação do código.

O service soma apenas o snapshot mais recente por conta de tesouraria e valores ainda em aberto de documentos com data de vencimento no intervalo. A previsão usa `SaleDocument` e `PurchaseDocument`, calcula `totalCents - amountPaidCents` e ignora documentos sem valor em aberto. `amountPaidCents` é mantido pelos BKs MF1-03 e MF1-08, por isso estes BKs passam a estar declarados como dependências técnicas. Cada linha tem fontes para futura explicabilidade. O sistema calcula, mas não altera documentos, recebimentos ou pagamentos.

6. Validação do passo.

Com uma conta que tenha snapshots de 900 EUR e 1000 EUR, abertura deve usar 1000 EUR. Com venda em aberto de 300 EUR e compra em aberto de 200 EUR, saldo final previsto e 1100 EUR.

7. Cenário negativo/erro esperado.

Sem empresa ativa devolve `401`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Permitir ao gestor consultar previsão.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/cashflowForecastRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares.
    - LOCALIZAÇÃO: ficheiro completo e montagem.

3. Instruções do que fazer.

Cria `GET /api/treasury/forecast`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/cashflowForecastRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateForecastQuery } from "./cashflowForecastFilters.js";
import { buildCashflowForecast } from "./cashflowForecastService.js";

/**
 * Constrói a route de previsão de tesouraria.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/treasury/forecast`.
 */
export function buildCashflowForecastRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("GESTOR")];
    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateForecastQuery(req.query);
            // A empresa vem do contexto autenticado; a previsão nunca aceita companyId por query.
            return res.status(200).json(await buildCashflowForecast(prisma, { companyId: req.companyId, userId: req.user.id, ...filters }));
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
import { buildCashflowForecastRoutes } from "./modules/treasury/cashflowForecastRoutes.js";

app.use("/api/treasury/forecast", buildCashflowForecastRoutes({ prisma }));
```

5. Explicação do código.

A route limita acesso a `GESTOR`, porque RF34 é uma funcionalidade de decisão. O erro é devolvido em JSON previsível, e o comentário assinala a regra multiempresa aplicada no backend.

6. Validação do passo.

Gestor recebe `200`.

7. Cenário negativo/erro esperado.

Operacional recebe `403`.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Tipar chamada de forecast.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/forecastApi.ts`
    - EDITAR: nenhum.
    - REVER: cliente comum.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Usa nomes de tesouraria claros.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/forecastApi.ts
import { apiClient } from "./apiClient";

/**
 * Resultado da previsão de tesouraria devolvido pela API.
 */
export type CashflowForecast = {
    runId: string;
    from: string;
    to: string;
    openingBalanceCents: number;
    expectedInCents: number;
    expectedOutCents: number;
    closingBalanceCents: number;
    rows: Array<{ date: string; expectedInCents: number; expectedOutCents: number; projectedBalanceCents: number; sources: string[] }>;
};

/**
 * Consulta a previsão de tesouraria no período indicado.
 *
 * @param {string} from Data inicial `YYYY-MM-DD`.
 * @param {string} to Data final `YYYY-MM-DD`.
 * @returns {Promise<CashflowForecast>} Forecast tipado.
 */
export async function fetchCashflowForecast(from: string, to: string): Promise<CashflowForecast> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<CashflowForecast>(`/api/treasury/forecast?${params.toString()}`);
}
```

5. Explicação do código.

Os campos indicam claramente entradas, saídas e saldo. O cliente reutiliza `apiClient`, por isso o cookie HttpOnly e enviado com `credentials: "include"` sem duplicar `fetch`.

6. Validação do passo.

Confirma URL com `from` e `to`.

7. Cenário negativo/erro esperado.

Erro `FORECAST_RANGE_TOO_LONG` aparece na UI.

### Passo 7 - Criar página de previsão

1. Objetivo funcional do passo no ERP.

Mostrar forecast com resumo e linhas por dia.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/CashflowForecastPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `forecastApi.ts`.
    - LOCALIZAÇÃO: ficheiro completo e menu.

3. Instruções do que fazer.

Cria formulario de datas e tabela.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/CashflowForecastPage.tsx
import { FormEvent, useState } from "react";
import { fetchCashflowForecast, type CashflowForecast } from "../lib/forecastApi";

/**
 * Formata cêntimos em euros para apresentacao.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor legível.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Página de previsão de tesouraria.
 *
 * Controla formulario de datas, loading, erro, resultado e estado vazio. A página mostra análise;
 * nenhuma ação automática e executada sobre documentos.
 *
 * @returns {JSX.Element} Interface do forecast.
 */
export function CashflowForecastPage() {
    const [result, setResult] = useState<CashflowForecast | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // O endpoint valida o horizonte; a UI apenas recolhe datas.
            setResult(await fetchCashflowForecast(String(form.get("from")), String(form.get("to"))));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Previsão de tesouraria</h1>
            <form onSubmit={handleSubmit}>
                <input name="from" type="date" required />
                <input name="to" type="date" required />
                <button disabled={loading}>{loading ? "A calcular..." : "Gerar previsão"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {result && <section><p>Saldo inicial: {euros(result.openingBalanceCents)}</p><p>Entradas: {euros(result.expectedInCents)}</p><p>Saídas: {euros(result.expectedOutCents)}</p><p>Saldo previsto: {euros(result.closingBalanceCents)}</p></section>}
            {result && result.rows.length === 0 && <p>Sem entradas ou saídas previstas no período.</p>}
        </main>
    );
}
```

5. Explicação do código.

A página apresenta resumo e estado vazio. O array `result.rows` fica tipado para a mesma página mostrar detalhe diário sem mudar o contrato da API. O JSDoc documenta os estados e o comentário reforça que a validação de horizonte é regra de backend.

6. Validação do passo.

Gera previsão de 30 dias com dados pendentes.

7. Cenário negativo/erro esperado.

Intervalo superior a 180 dias mostra erro.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Preparar alertas inteligentes de cashflow em BK-MF4-04.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence do BK.
    - REVER: service, route e página.
    - LOCALIZAÇÃO: checklist final.

3. Instruções do que fazer.

Regista fontes usadas no resultado.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo.

5. Explicação do código.

As fontes tornam a previsão explicável para a futura camada de IA.

6. Validação do passo.

Confirmar `sources` nas linhas.

7. Cenário negativo/erro esperado.

Sem role `GESTOR`, pedido falha.

## Expected results

- `200` com saldo inicial, entradas, saídas e saldo final.
- `400 FORECAST_RANGE_TOO_LONG` para mais de 180 dias.
- `403` para role sem permissão.

## Critérios de aceite

- Forecast usa dados reais.
- Não altera documentos.
- Guarda execução.
- Inclui fontes por linha.
- Cliente frontend usa `apiClient`.

## Validação final

- Confirmar query multiempresa.
- Confirmar route.
- Confirmar UI.

## Evidence para PR/defesa

- JSON do forecast.
- Screenshot.
- Provas de range longo e role errada.

## Handoff

BK-MF3-05 deve manter dados mestres limpos para melhorar importações e relatórios seguintes.

## Changelog

- `2026-06-13`: corrigido para calcular previsão real com entradas, saídas, saldo projetado, fontes, JSDoc, `apiClient` e comentários didáticos.
- `2026-06-13`: alinhado com MF1, declarando dependências `BK-MF1-03` e `BK-MF1-08` para `amountPaidCents`.
