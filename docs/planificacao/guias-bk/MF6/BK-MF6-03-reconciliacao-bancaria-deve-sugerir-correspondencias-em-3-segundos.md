# BK-MF6-03 - Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.

## Header

- `doc_id`: `GUIA-BK-MF6-03`
- `bk_id`: `BK-MF6-03`
- `macro`: `MF6`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF10`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-04`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais medir e proteger a sugestão automática de correspondências da reconciliação bancária. O `RNF10` pede que essa sugestão aconteça em até 3 segundos.

O resultado final é um orçamento de reconciliação com fallback honesto: se houver demasiados movimentos para analisar localmente, a API devolve resultado parcial controlado em vez de bloquear a operação ou inventar correspondências.

#### Importância

A reconciliação bancária liga extratos a recebimentos, pagamentos e documentos. Se for lenta, o utilizador perde o fluxo de trabalho. Se for demasiado agressiva, pode sugerir matches errados e comprometer a confiança nos saldos.

Este BK reforça a fronteira entre sugestão e decisão: a aplicação sugere, mas o utilizador continua a confirmar. Nenhuma sugestão altera contabilidade automaticamente.

#### Scope-in

- Criar orçamento de 3000 ms para sugestão de correspondências.
- Limitar lote analisado por pedido.
- Devolver métrica de duração e estado `complete` ou `partial`.
- Validar cenários sem dados, lote grande e sessão ausente.
- Preservar origem dos dados de MF3.

#### Scope-out

- Implementar integração bancária real.
- Criar leitura automática avançada, aprendizagem automática externa ou execução contabilística automática.
- Confirmar matches automaticamente.
- Alterar regras de recebimento, pagamento ou lançamento contabilístico.
- Reescrever importação CSV/OFX.

#### Estado antes e depois

- Antes: `BK-MF3-03` define importação de extratos e reconciliação automática; não há orçamento de 3 segundos.
- Depois: a sugestão passa a ter limite mensurável, lote seguro e resposta parcial controlada.

#### Pre-requisitos

- Ler `RNF10`.
- Rever `BK-MF3-02` e `BK-MF3-03`.
- Rever recebimentos em `BK-MF1-03` e pagamentos em `BK-MF1-08`.
- Confirmar rotas em `apps/api/src/modules/treasury`.
- Confirmar que logs de integração de MF4 registam uploads e reconciliações.

#### Glossário

- Reconciliação bancária: comparação entre linhas de extrato e movimentos internos.
- Correspondência sugerida: relação provável, ainda não confirmada pelo utilizador.
- Score: valor calculado para ordenar sugestões.
- Lote: conjunto limitado de movimentos analisados numa chamada.
- Resultado parcial: resposta honesta quando o limite impede analisar tudo.
- Log de integração: registo técnico de importação ou reconciliação.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF10` fixa o limite de 3 segundos.
- `CANONICO`: reconciliação vem do domínio de tesouraria e liga dados de banco, recebimentos e pagamentos.
- `DERIVADO`: limitar lote é uma proteção mínima para cumprir tempo sem bloquear a API.
- `DERIVADO`: resposta parcial é melhor do que prometer precisão total quando o volume ultrapassa o orçamento.

Sugestão não é confirmação. A API pode devolver uma lista ordenada de matches prováveis, mas não deve lançar movimentos contabilísticos, aprovar documentos ou alterar saldos sem ação explícita do utilizador.

#### Arquitetura do BK

- Endpoint(s): `POST /api/treasury/reconciliations/suggestions`.
- Modelo/schema Prisma: usa contas bancárias, extratos, recebimentos e pagamentos existentes.
- Service(s): `statementImportService` com `suggestReconciliations`.
- Controller/route: rota de sugestão com autenticação, empresa ativa e permissão de tesouraria.
- Guard/middleware: sessão, empresa ativa e permissão de tesouraria.
- Cliente API: chamada com cookies HttpOnly.
- Testes: smoke textual e negativos.
- Handoff para o próximo BK: FIFO também usa orçamento sem bloquear operações críticas.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/treasury/reconciliationPerformance.js`
- EDITAR: `apps/api/src/modules/treasury/statementRoutes.js`
- EDITAR: `apps/api/src/modules/treasury/statementImportService.js`
- CRIAR: `apps/api/scripts/check-mf6-reconciliation-performance.mjs`
- EDITAR: `apps/api/package.json`

#### Tutorial técnico linear

### Passo 1 - Confirmar dados de origem

1. Objetivo funcional do passo no contexto da app.

Confirmar que a reconciliação usa dados bancários e movimentos internos corretos.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/treasury/statementImportService.js`
    - REVER: `apps/api/src/modules/receipts/receiptService.js`
    - REVER: `apps/api/src/modules/payments/paymentService.js`
    - LOCALIZAÇÃO: importação de extratos e movimentos financeiros.

3. Instruções do que fazer.

Lista os campos usados para comparar data, valor, descrição e entidade.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A leitura evita misturar recebimentos de clientes com pagamentos a fornecedores.

5. Explicação do código.

Não há código novo. A decisão crítica é separar fluxos: recebimento não é pagamento, e linha bancária não é lançamento contabilístico.

6. Validação do passo.

O inventário deve indicar origem de extrato, recebimentos e pagamentos.

7. Cenário negativo/erro esperado.

Se o aluno usar apenas descrição textual, pode sugerir matches errados com o mesmo valor.

### Passo 2 - Criar orçamento de reconciliação

1. Objetivo funcional do passo no contexto da app.

Criar o limite de 3000 ms e a forma de responder quando o lote é grande.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/reconciliationPerformance.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o módulo abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Orçamento de performance para sugestões de reconciliação bancária.
 */

export const RECONCILIATION_BUDGET_MS = 3000;
export const RECONCILIATION_MAX_CANDIDATES = 250;

/**
 * Limita candidatos para proteger a API de lotes demasiado grandes.
 *
 * @template T
 * @param {T[]} candidates - Movimentos candidatos a correspondência.
 * @returns {{ selected: T[], partial: boolean }}
 */
export function limitReconciliationCandidates(candidates) {
    const selected = candidates.slice(0, RECONCILIATION_MAX_CANDIDATES);

    return {
        selected,
        partial: candidates.length > selected.length,
    };
}

/**
 * Mede a geração de sugestões de reconciliação.
 *
 * @template TResult
 * @param {() => Promise<TResult>} operation - Operação real de sugestão.
 * @returns {Promise<{ result: TResult, durationMs: number, withinBudget: boolean }>}
 */
export async function measureReconciliation(operation) {
    const startedAt = performance.now();
    const result = await operation();
    const durationMs = Math.round(performance.now() - startedAt);

    // O limite protege a experiência sem confirmar automaticamente qualquer movimento.
    return {
        result,
        durationMs,
        withinBudget: durationMs <= RECONCILIATION_BUDGET_MS,
    };
}
```

5. Explicação do código.

O módulo limita candidatos e mede a operação. A resposta parcial não é falha: é um aviso honesto de que a API analisou um subconjunto seguro dentro do orçamento.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/treasury/reconciliationPerformance.js`.

7. Cenário negativo/erro esperado.

Com 1000 candidatos, `partial` deve ser `true`.

### Passo 3 - Integrar no service de reconciliação

1. Objetivo funcional do passo no contexto da app.

Aplicar limite e medição antes de devolver sugestões.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/treasury/statementImportService.js`
    - LOCALIZAÇÃO: função que calcula sugestões.

3. Instruções do que fazer.

Acrescenta o import de performance ao topo de `statementImportService.js` e cria a função completa abaixo no mesmo ficheiro. Reutiliza os helpers já existentes de tolerância de data e comparação de referência.

4. Código completo, correto e integrado com a app final.

```js
import {
    RECONCILIATION_BUDGET_MS,
    limitReconciliationCandidates,
    measureReconciliation,
} from "./reconciliationPerformance.js";

/**
 * Normaliza o limite opcional de candidatos indicado pelo cliente.
 *
 * @param {string | number | null | undefined} value - Valor recebido no body.
 * @returns {number | undefined} Limite normalizado ou undefined quando não existe.
 */
function normalizeCandidateLimit(value) {
    if (value === undefined || value === null || value === "") return undefined;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 250) {
        throw httpError(400, "INVALID_RECONCILIATION_LIMIT", "O limite deve estar entre 1 e 250");
    }

    return parsed;
}

/**
 * Calcula a pontuação de um recebimento candidato.
 *
 * @param {object} line - Linha de extrato usada como origem da sugestão.
 * @param {object} receipt - Recebimento interno candidato.
 * @returns {object} Sugestão pronta a devolver pela API.
 */
function scoreReceiptCandidate(line, receipt) {
    const referenceMatched = referenceMatches(line.reference, receipt.reference);

    return {
        targetType: "RECEIPT",
        targetId: receipt.id,
        amountCents: receipt.amountCents,
        confidenceBps: referenceMatched ? 9500 : 8000,
        reason: referenceMatched
            ? "Valor, data e referência coincidem com um recebimento."
            : "Valor e data coincidem com um recebimento dentro da tolerância.",
    };
}

/**
 * Calcula a pontuação de um pagamento candidato.
 *
 * @param {object} line - Linha de extrato usada como origem da sugestão.
 * @param {object} payment - Pagamento interno candidato.
 * @returns {object} Sugestão pronta a devolver pela API.
 */
function scorePaymentCandidate(line, payment) {
    const referenceMatched = referenceMatches(line.reference, payment.reference);

    return {
        targetType: "PAYMENT",
        targetId: payment.id,
        amountCents: payment.amountCents,
        confidenceBps: referenceMatched ? 9500 : 8000,
        reason: referenceMatched
            ? "Valor, data e referência coincidem com um pagamento."
            : "Valor e data coincidem com um pagamento dentro da tolerância.",
    };
}

/**
 * Procura candidatos financeiros compatíveis com uma linha de extrato.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, line: object, candidateLimit?: number }} input - Pedido interno.
 * @returns {Promise<object[]>} Candidatos ordenáveis por score.
 */
async function findReconciliationCandidates(prisma, input) {
    const take = input.candidateLimit ?? 250;
    const dateWindow = {
        gte: startOfTolerance(input.line.entryDate),
        lte: endOfTolerance(input.line.entryDate),
    };

    // Valores positivos representam entrada bancária; negativos representam saída bancária.
    if (input.line.amountCents > 0) {
        const receipts = await prisma.receipt.findMany({
            where: {
                companyId: input.companyId,
                amountCents: input.line.amountCents,
                receivedAt: dateWindow,
            },
            orderBy: { receivedAt: "asc" },
            take,
        });

        return receipts.map((receipt) => scoreReceiptCandidate(input.line, receipt));
    }

    const payments = await prisma.payment.findMany({
        where: {
            companyId: input.companyId,
            amountCents: Math.abs(input.line.amountCents),
            paidAt: dateWindow,
        },
        orderBy: { paidAt: "asc" },
        take,
    });

    return payments.map((payment) => scorePaymentCandidate(input.line, payment));
}

/**
 * Sugere correspondências para uma linha de extrato sem confirmar reconciliação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, input: { statementLineId?: string, candidateLimit?: number } }} context - Contexto autenticado.
 * @returns {Promise<{ statementLineId: string, suggestions: object[], status: string, durationMs: number, withinBudget: boolean, budgetMs: number }>}
 */
export async function suggestReconciliations(prisma, context) {
    const statementLineId = String(context.input?.statementLineId ?? "").trim();
    if (!statementLineId) {
        throw httpError(400, "STATEMENT_LINE_REQUIRED", "Indica a linha de extrato a reconciliar");
    }

    const line = await prisma.bankStatementLine.findFirst({
        where: {
            id: statementLineId,
            companyId: context.companyId,
        },
    });

    if (!line) {
        throw httpError(404, "BANK_STATEMENT_LINE_NOT_FOUND", "Linha de extrato não encontrada");
    }

    const candidates = await findReconciliationCandidates(prisma, {
        companyId: context.companyId,
        line,
        candidateLimit: normalizeCandidateLimit(context.input?.candidateLimit),
    });
    const { selected, partial } = limitReconciliationCandidates(candidates);
    const measured = await measureReconciliation(async () => {
        // A sugestão apenas ordena candidatos; confirmar continua a ser ação do utilizador.
        return selected
            .sort((left, right) => right.confidenceBps - left.confidenceBps)
            .map((candidate) => ({
                statementLineId: line.id,
                ...candidate,
            }));
    });

    return {
        statementLineId: line.id,
        suggestions: measured.result,
        status: partial ? "partial" : "complete",
        durationMs: measured.durationMs,
        withinBudget: measured.withinBudget,
        budgetMs: RECONCILIATION_BUDGET_MS,
    };
}
```

5. Explicação do código.

O service mantém a responsabilidade de sugerir. Ele valida a linha de extrato pela empresa ativa, procura apenas recebimentos ou pagamentos compatíveis com o sinal do valor, mede a duração e devolve `complete` ou `partial`. Não cria lançamento, não marca extrato como reconciliado e não decide pelo utilizador. O erro `STATEMENT_LINE_REQUIRED` evita pedidos ambíguos; o `404` evita fuga de dados entre empresas.

6. Validação do passo.

Um pedido normal deve devolver `status: "complete"`, `suggestions`, `durationMs`, `withinBudget` e `budgetMs: 3000`.

7. Cenário negativo/erro esperado.

Sem `statementLineId`, a resposta deve ser `400`. Com uma linha inexistente ou de outra empresa, a resposta deve ser `404`.

### Passo 4 - Expor endpoint de sugestão

1. Objetivo funcional do passo no contexto da app.

Permitir que o frontend peça sugestões mensuráveis.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/treasury/statementRoutes.js`
    - LOCALIZAÇÃO: router de tesouraria.

3. Instruções do que fazer.

Cria rota `POST /reconciliations/suggestions` protegida pelos mesmos guards usados na importação de extratos.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Rotas de importação de extratos e sugestões de reconciliação.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { importBankStatement, suggestReconciliations } from "./statementImportService.js";

/**
 * Envia erros HTTP no formato comum da API.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {Error | { code?: string, message?: string }} error - Erro apanhado na rota.
 * @returns {import("express").Response} Resposta HTTP formatada.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/**
 * Constrói as rotas de extratos bancários e reconciliação.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências da rota.
 * @returns {import("express").Router} Router Express.
 */
export function buildStatementRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.TREASURY_WRITE),
        requireRole("ADMIN", "CONTABILISTA", "OPERACIONAL"),
    ];

    router.post("/statements/import", guards, async (req, res) => {
        try {
            const result = await importBankStatement(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                input: req.body,
            });
            return res.status(201).json(result);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/reconciliations/suggestions", guards, async (req, res) => {
        try {
            // A empresa vem do contexto autenticado; o body nunca decide ownership.
            const result = await suggestReconciliations(prisma, {
                companyId: req.companyId,
                input: req.body,
            });

            res.set("X-OPSA-Reconciliation-Duration-Ms", String(result.durationMs));
            return res.status(200).json(result);
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

5. Explicação do código.

A rota lê a empresa do contexto autenticado (`req.companyId`) e aplica sessão, empresa ativa, permissão de tesouraria e role operacional antes de chamar o service. O corpo contém apenas dados do pedido de sugestão, não ownership final. O cabeçalho ajuda a recolher evidence de performance sem expor dados sensíveis.

6. Validação do passo.

Pedido válido devolve `200`, `suggestions`, `status` e cabeçalho de duração. Pedido sem sessão devolve `401`; pedido sem empresa ativa ou sem permissão deve ser bloqueado pelos guards.

7. Cenário negativo/erro esperado.

Sem sessão, devolve `401`. Com `companyId` enviado no body, a rota ignora esse valor e mantém a empresa da sessão.

### Passo 5 - Criar smoke textual

1. Objetivo funcional do passo no contexto da app.

Evitar regressão documental e técnica do orçamento.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-reconciliation-performance.mjs`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: script e entrada `test:mf6:reconciliation`.

3. Instruções do que fazer.

Cria um script que verifica orçamento, limite e rota.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual do BK-MF6-03.
 */

import { readFileSync } from "node:fs";

const performanceModule = readFileSync(
    "src/modules/treasury/reconciliationPerformance.js",
    "utf8",
);
const routes = readFileSync("src/modules/treasury/statementRoutes.js", "utf8");
const service = readFileSync("src/modules/treasury/statementImportService.js", "utf8");

if (!performanceModule.includes("RECONCILIATION_BUDGET_MS = 3000")) {
    throw new Error("Falta orçamento de 3 segundos.");
}

if (!performanceModule.includes("RECONCILIATION_MAX_CANDIDATES")) {
    throw new Error("Falta limite de candidatos.");
}

if (!service.includes("export async function suggestReconciliations")) {
    throw new Error("Falta service completo de sugestão de reconciliação.");
}

// A rota deve expor duração para evidence sem confirmar matches automaticamente.
if (!routes.includes("X-OPSA-Reconciliation-Duration-Ms")) {
    throw new Error("Falta cabeçalho de duração da reconciliação.");
}

if (!routes.includes("requireCompanyContext(prisma)")) {
    throw new Error("A rota deve exigir empresa ativa.");
}

if (!routes.includes('import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";')) {
    throw new Error("A rota deve importar roles e permissões do middleware real de permissões.");
}

if (routes.includes("../users/roleMiddleware.js")) {
    throw new Error("A rota não deve importar roleMiddleware inexistente.");
}
```

5. Explicação do código.

O smoke confirma a presença do contrato técnico, do service completo, do guard de empresa ativa e da origem correta de `requireRole`. Ele não prova precisão dos scores, mas impede remover o limite, a evidence ou a autorização backend sem notar.

6. Validação do passo.

Executa `cd apps/api && node scripts/check-mf6-reconciliation-performance.mjs`.

7. Cenário negativo/erro esperado.

Sem orçamento de 3000 ms ou com import de role para módulo inexistente, o script falha.

### Passo 6 - Fechar evidence

1. Objetivo funcional do passo no contexto da app.

Recolher prova do fluxo principal e dos negativos.

2. Ficheiros envolvidos:
    - REVER: outputs de comando e resposta HTTP.
    - LOCALIZAÇÃO: PR ou relatório.

3. Instruções do que fazer.

Regista uma resposta `complete`, uma resposta `partial` e uma resposta sem sessão.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A implementação ficou nos passos anteriores.

5. Explicação do código.

A evidence mostra que a API responde depressa, mas também mostra que não promete precisão total em lote grande.

6. Validação do passo.

Os três cenários devem estar registados com resultado esperado.

7. Cenário negativo/erro esperado.

Se a API confirmar matches sem ação do utilizador, o BK falha por domínio.

#### Critérios de aceite

- Orçamento de reconciliação é `3000 ms`.
- Lote grande devolve `status: "partial"`.
- Sugestões não confirmam movimentos automaticamente.
- Cabeçalho de duração está presente.
- Negativos: minimo `2`: sessão ausente e lote grande parcial.

#### Validação final

- `cd apps/api && node --check src/modules/treasury/reconciliationPerformance.js`
- `cd apps/api && node scripts/check-mf6-reconciliation-performance.mjs`
- `cd apps/api && npm run test:contracts`
- Teste manual do endpoint com resposta `complete` e `partial`.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: resposta com sugestões e duração até 3000 ms.
- `neg`: sessão ausente e lote grande parcial.
- `fonte`: `RNF10`, `BK-MF3-03`, `BK-MF4-10`.
- `multiempresa`: dados de banco filtrados pela empresa ativa.

#### Handoff

- Entrega orçamento de 3 segundos e padrão de resposta parcial.
- O próximo BK aplica a mesma ideia a FIFO sem bloquear operações críticas.
- Proximo BK recomendado: `BK-MF6-04`

#### Changelog

- `2026-06-22`: guia revisto com medição de reconciliação, limite de candidatos, resposta parcial, negativos e evidence.
