# BK-MF6-01 - Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo.

## Header

- `doc_id`: `GUIA-BK-MF6-01`
- `bk_id`: `BK-MF6-01`
- `macro`: `MF6`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF08`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-02`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais transformar o `RNF08` numa regra observável: a inserção de uma fatura de venda, fatura de compra ou lançamento manual deve terminar em até 1 segundo quando a API recebe dados válidos.

O objetivo não é acelerar a aplicação com truques invisíveis. Vais criar um orçamento de performance, medir operações críticas no backend, devolver evidence controlada e manter as regras de domínio intactas: empresa ativa no contexto autenticado, validação no backend, período fiscal aberto e auditoria quando a operação for sensível.

#### Importância

OPSA é um ERP financeiro. Se registar documentos for lento, o utilizador perde confiança e pode repetir submissões, criando risco de duplicação. Uma regra de 1 segundo obriga a medir o fluxo principal e a separar atrasos reais de erros de validação.

Este BK prepara a MF6 para tratar performance como contrato técnico. O próximo BK usa a mesma disciplina para vários utilizadores em simultâneo.

#### Scope-in

- Criar orçamento de 1000 ms para criação de documentos críticos.
- Medir tempos nas routes de criação de venda, compra e lançamento manual, envolvendo os services reais sem alterar a sua regra de negócio.
- Acrescentar cabeçalho de duração controlado na resposta HTTP.
- Criar script de smoke para confirmar que o orçamento está documentado e aplicado.
- Definir cenários negativos para payload inválido, período fiscal fechado e operação lenta.
- Preservar os endpoints e regras criados em MF1 e MF2.

#### Scope-out

- Criar novos tipos de documento financeiro.
- Alterar regras de IVA, SNC, numeração sequencial ou período fiscal.
- Criar filas externas, Redis, observabilidade SaaS ou infraestrutura de produção.
- Trocar Express, Prisma ou React.
- Relaxar validação, autenticação, autorização ou auditoria para ganhar velocidade.

#### Estado antes e depois

- Antes: os BKs anteriores explicam como criar documentos, recebimentos, pagamentos, lançamentos e UI; a performance de inserção não tem orçamento próprio.
- Depois: os alunos têm um contrato mensurável para inserções críticas, com medição backend, smoke textual e handoff para carga concorrente.

#### Pre-requisitos

- Ler `RNF08` em `docs/RNF.md`.
- Rever `BK-MF1-02`, `BK-MF1-07`, `BK-MF2-06` e `BK-MF5-07`.
- Confirmar `apps/api/src/modules/sales`, `apps/api/src/modules/purchases` e `apps/api/src/modules/accounting`.
- Confirmar que `apps/api/src/modules/companies/companyContext.js` resolve a empresa ativa no backend.
- Confirmar que o frontend usa `credentials: "include"` no cliente HTTP.

#### Glossário

- Inserção de documento: criação persistente de fatura, compra ou lançamento manual.
- Orçamento de performance: limite máximo aceite para uma operação observável.
- Duração: tempo entre entrada no service e conclusão controlada.
- Período fiscal fechado: estado que impede lançamentos contabilísticos.
- Idempotência: proteção contra submissões repetidas quando o utilizador tenta novamente.
- Evidence: prova objetiva do comportamento observado.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF08` exige inserção de documentos em até 1 segundo.
- `CANONICO`: documentos financeiros continuam dependentes de validação, empresa ativa e período fiscal.
- `DERIVADO`: o orçamento deve ser medido no backend, porque só aí a aplicação conhece persistência, transações e regras fiscais.
- `DERIVADO`: a UI pode mostrar feedback, mas não decide se a operação é válida.

Performance não substitui segurança. Um fluxo rápido que aceita empresa errada, período fiscal fechado ou dados monetários inválidos está errado. A medição deste BK deve provar rapidez apenas para pedidos válidos; pedidos inválidos devem falhar depressa, com mensagem clara e sem persistir dados.

#### Arquitetura do BK

- Endpoint(s): rotas já existentes de vendas, compras e lançamentos manuais.
- Modelo/schema Prisma: modelos já criados por MF0-MF2.
- Service(s): services de documento continuam responsáveis por validação, transação, período fiscal e auditoria.
- Controller/route: envolve a chamada ao service com medição e adiciona cabeçalhos controlados de duração.
- Guard/middleware: autenticação, empresa ativa e permissões já existentes.
- Cliente API: mantém cookies HttpOnly com `credentials: "include"`.
- Página/componente: mantém feedback MF5.
- Testes: smoke textual e cenários negativos.
- Handoff para o próximo BK: orçamento reutilizável por carga concorrente.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/performance/documentPerformance.js`
- EDITAR: `apps/api/src/modules/sales/saleDocumentRoutes.js`
- EDITAR: `apps/api/src/modules/purchases/purchaseDocumentRoutes.js`
- EDITAR: `apps/api/src/modules/accounting/manualJournalRoutes.js`
- REVER: `apps/api/src/modules/sales/saleDocumentService.js`
- REVER: `apps/api/src/modules/purchases/purchaseDocumentService.js`
- REVER: `apps/api/src/modules/accounting/manualJournalService.js`
- CRIAR: `apps/api/scripts/check-mf6-document-performance.mjs`
- EDITAR: `apps/api/package.json`
- REVER: `apps/web/src/lib/apiClient.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar as operações críticas

1. Objetivo funcional do passo no contexto da app.

Mapear quais inserções contam para o `RNF08`.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `apps/api/src/modules/sales/saleDocumentService.js`
    - REVER: `apps/api/src/modules/purchases/purchaseDocumentService.js`
    - REVER: `apps/api/src/modules/accounting/manualJournalService.js`
    - LOCALIZAÇÃO: funções de criação de documento.

3. Instruções do que fazer.

Identifica a função que cria cada documento e confirma que recebe empresa ativa a partir do contexto autenticado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A decisão é analítica e evita medir uma rota errada.

5. Explicação do código.

Não há código novo. A validação importante é saber que a medição será colocada no ponto onde a regra de negócio realmente termina.

6. Validação do passo.

Deves ter uma lista com venda, compra e lançamento manual.

7. Cenário negativo/erro esperado.

Se medires apenas o clique no frontend, a API pode continuar lenta sem ser detetada.

### Passo 2 - Criar o orçamento de performance

1. Objetivo funcional do passo no contexto da app.

Criar um helper backend reutilizável para medir inserções críticas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/performance/documentPerformance.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo e exporta uma função de medição.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Medição de performance para inserções críticas do RNF08.
 */

// O orçamento fica centralizado para vendas, compras e lançamentos manuais usarem o mesmo limite.
export const DOCUMENT_INSERT_BUDGET_MS = 1000;

/**
 * Mede uma operação de criação de documento sem alterar a regra de negócio.
 *
 * @template TResult
 * @param {string} operationName - Nome funcional da operação medida.
 * @param {() => Promise<TResult>} operation - Operação real já validada pelo service.
 * @returns {Promise<{ result: TResult, metric: { operationName: string, durationMs: number, withinBudget: boolean } }>}
 */
export async function measureDocumentInsert(operationName, operation) {
    const startedAt = performance.now();
    const result = await operation();
    const durationMs = Math.round(performance.now() - startedAt);

    const metric = {
        operationName,
        durationMs,
        withinBudget: durationMs <= DOCUMENT_INSERT_BUDGET_MS,
    };

    // A medição envolve a operação real para não esconder validações, transações ou auditoria.
    return { result, metric };
}

/**
 * Formata a métrica para logs ou evidence sem expor dados financeiros.
 *
 * @param {{ operationName: string, durationMs: number, withinBudget: boolean }} metric - Resultado da medição.
 * @returns {{ event: string, operationName: string, durationMs: number, withinBudget: boolean }}
 */
export function toDocumentInsertLog(metric) {
    return {
        event: "document_insert_measured",
        operationName: metric.operationName,
        durationMs: metric.durationMs,
        withinBudget: metric.withinBudget,
    };
}
```

5. Explicação do código.

O helper mede a operação real, devolve o resultado original e acrescenta uma métrica simples. O log não inclui valores monetários, NIF, IBAN, linhas de documento nem dados pessoais. Isto cumpre o `RNF08` sem quebrar privacidade.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/performance/documentPerformance.js`.

7. Cenário negativo/erro esperado.

Se a função medida lançar erro por validação, o erro deve continuar a subir para o controller e não deve ser transformado em sucesso.

### Passo 3 - Medir a criação de vendas na route

1. Objetivo funcional do passo no contexto da app.

Aplicar a medição à criação de faturas ou documentos de venda sem alterar o contrato do service.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/sales/saleDocumentRoutes.js`
    - REVER: `apps/api/src/modules/sales/saleDocumentService.js`
    - LOCALIZAÇÃO: imports do ficheiro e handler `router.post("/")`.

3. Instruções do que fazer.

Importa `measureDocumentInsert` e `toDocumentInsertLog`. Depois substitui o handler `POST /api/sales/documents` pela versão abaixo, mantendo os guards existentes.

4. Código completo, correto e integrado com a app final.

```js
import {
    measureDocumentInsert,
    toDocumentInsertLog,
} from "../performance/documentPerformance.js";

/**
 * Cria um documento de venda e mede se a operação cumpre o orçamento de 1 segundo.
 *
 * @param {import("express").Request} req - Pedido autenticado com `req.companyId`, `req.user.id` e payload de venda validado pelo service.
 * @param {import("express").Response} res - Resposta HTTP que mantém o contrato `{ saleDocument }` e acrescenta cabeçalhos de performance.
 * @returns {Promise<import("express").Response>} Resposta `201` com o documento criado ou erro normalizado por `sendError`.
 */
router.post("/", writeGuards, async (req, res) => {
    try {
        const { result: saleDocument, metric } = await measureDocumentInsert(
            "sales.document.create",
            async () =>
                // A empresa ativa vem de `req.companyId`; o frontend nunca escolhe ownership.
                createSaleDocument(prisma, req.companyId, req.user.id, req.body),
        );

        console.info(toDocumentInsertLog(metric));
        // Os cabeçalhos dão evidence sem alterar o JSON que o frontend já consome.
        res.set("X-OPSA-Duration-Ms", String(metric.durationMs));
        res.set("X-OPSA-Within-Budget", String(metric.withinBudget));

        return res.status(201).json({ saleDocument });
    } catch (error) {
        return sendError(res, error);
    }
});
```

5. Explicação do código.

O handler mede a chamada real a `createSaleDocument`, que já valida cliente, linhas, IVA, período fiscal, empresa ativa e auditoria. A resposta mantém `{ saleDocument }`, por isso o frontend não precisa de mudar. Os cabeçalhos só expõem duração e estado do orçamento; não mostram NIF, valores, linhas ou dados pessoais.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/sales/saleDocumentRoutes.js` e cria uma venda válida. A resposta deve devolver `201`, `{ saleDocument }`, `X-OPSA-Duration-Ms` e `X-OPSA-Within-Budget`.

7. Cenário negativo/erro esperado.

Uma venda sem cliente válido deve falhar por validação e não deve produzir documento persistido.

### Passo 4 - Medir compras e lançamentos manuais nas routes

1. Objetivo funcional do passo no contexto da app.

Garantir que o orçamento não fica limitado a vendas.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/purchases/purchaseDocumentRoutes.js`
    - EDITAR: `apps/api/src/modules/accounting/manualJournalRoutes.js`
    - REVER: `apps/api/src/modules/purchases/purchaseDocumentService.js`
    - REVER: `apps/api/src/modules/accounting/manualJournalService.js`
    - LOCALIZAÇÃO: imports dos ficheiros e handlers `router.post("/")`.

3. Instruções do que fazer.

Aplica o mesmo padrão às routes de compras e lançamentos manuais, usando os services reais `createPurchaseDocument` e `createManualJournal`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/purchases/purchaseDocumentRoutes.js
import {
    measureDocumentInsert,
    toDocumentInsertLog,
} from "../performance/documentPerformance.js";

/**
 * Cria um documento de compra e mede a duração sem expor linhas ou valores nos logs.
 *
 * @param {import("express").Request} req - Pedido autenticado com empresa ativa resolvida no backend e payload de compra validado pelo service.
 * @param {import("express").Response} res - Resposta HTTP que mantém o contrato `{ purchaseDocument }` e acrescenta cabeçalhos de performance.
 * @returns {Promise<import("express").Response>} Resposta `201` com o documento criado ou erro normalizado por `sendError`.
 */
router.post("/", writeGuards, async (req, res) => {
    try {
        const { result: purchaseDocument, metric } = await measureDocumentInsert(
            "purchases.document.create",
            async () =>
                // O fornecedor e as linhas continuam validados dentro do service de compras.
                createPurchaseDocument(prisma, req.companyId, req.user.id, req.body),
        );

        console.info(toDocumentInsertLog(metric));
        // A route mantém o contrato `{ purchaseDocument }` e expõe a duração só por cabeçalho.
        res.set("X-OPSA-Duration-Ms", String(metric.durationMs));
        res.set("X-OPSA-Within-Budget", String(metric.withinBudget));

        return res.status(201).json({ purchaseDocument });
    } catch (error) {
        return sendError(res, error);
    }
});
```

```js
// apps/api/src/modules/accounting/manualJournalRoutes.js
import {
    measureDocumentInsert,
    toDocumentInsertLog,
} from "../performance/documentPerformance.js";

/**
 * Cria um lançamento manual e mede a duração preservando validações contabilísticas.
 *
 * @param {import("express").Request} req - Pedido autenticado com empresa ativa, utilizador e payload do lançamento.
 * @param {import("express").Response} res - Resposta HTTP que mantém o contrato `{ journalEntry }` e acrescenta cabeçalhos de performance.
 * @returns {Promise<import("express").Response>} Resposta `201` ou erro normalizado sem expor dados contabilísticos sensíveis.
 */
router.post("/", writeGuards, async (req, res) => {
    try {
        const { result: journalEntry, metric } = await measureDocumentInsert(
            "accounting.manualJournal.create",
            async () =>
                // O lançamento manual continua a validar contas SNC, equilíbrio e período fiscal no backend.
                createManualJournal(prisma, req.companyId, req.user.id, req.body),
        );

        console.info(toDocumentInsertLog(metric));
        // A métrica mede a criação, mas não substitui a auditoria contabilística do service.
        res.set("X-OPSA-Duration-Ms", String(metric.durationMs));
        res.set("X-OPSA-Within-Budget", String(metric.withinBudget));

        return res.status(201).json({ journalEntry });
    } catch (error) {
        return sendError(res, error);
    }
});
```

5. Explicação do código.

As routes medem a operação completa, mas os services continuam a fazer o trabalho crítico. Em compras, o service valida fornecedor, número do fornecedor, linhas, IVA e auditoria. Em lançamentos manuais, o service valida data, contas SNC, equilíbrio débito/crédito, período fiscal e auditoria. Isto evita acelerar a API à custa de regras contabilísticas.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/purchases/purchaseDocumentRoutes.js src/modules/accounting/manualJournalRoutes.js`. Depois confirma uma compra válida e um lançamento manual válido.

7. Cenário negativo/erro esperado.

Um lançamento em período fiscal fechado deve devolver erro de domínio e não deve ser contado como sucesso rápido.

### Passo 5 - Confirmar resposta e privacidade da métrica

1. Objetivo funcional do passo no contexto da app.

Permitir evidence sem expor dados sensíveis.

2. Ficheiros envolvidos:
    - REVER: routes das operações medidas.
    - LOCALIZAÇÃO: resposta HTTP de criação.

3. Instruções do que fazer.

Confirma que as três routes devolvem os cabeçalhos de performance e mantêm o corpo JSON original.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O código dos passos 3 e 4 já mostra a resposta completa de cada route.

5. Explicação do código.

O cabeçalho mostra a duração, mas não mostra dados financeiros. O corpo continua a devolver `saleDocument`, `purchaseDocument` ou `journalEntry`, preservando o contrato que o frontend já consome.

6. Validação do passo.

O `POST` válido deve devolver `201` e o cabeçalho de duração.

7. Cenário negativo/erro esperado.

Pedidos inválidos devem devolver `400` ou `422` e não devem fingir criação bem-sucedida.

### Passo 6 - Criar smoke textual do RNF08

1. Objetivo funcional do passo no contexto da app.

Automatizar a verificação mínima do contrato.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-document-performance.mjs`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: script completo e entrada `test:mf6:documents`.

3. Instruções do que fazer.

Cria um script que verifica orçamento, routes e cabeçalhos.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual do BK-MF6-01.
 */

import { readFileSync } from "node:fs";

const files = [
    "src/modules/performance/documentPerformance.js",
    "src/modules/sales/saleDocumentRoutes.js",
    "src/modules/purchases/purchaseDocumentRoutes.js",
    "src/modules/accounting/manualJournalRoutes.js",
];

// A lista cobre as três superfícies do RNF08 para evitar validar só vendas.
for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (!content.includes("measureDocumentInsert")) {
        throw new Error(`Falta medição RNF08 em ${file}`);
    }
}

for (const file of files.slice(1)) {
    const content = readFileSync(file, "utf8");
    // Os cabeçalhos dão evidence sem registar o payload financeiro completo.
    if (!content.includes("X-OPSA-Duration-Ms")) {
        throw new Error(`Falta cabeçalho de duração controlada em ${file}`);
    }
    if (!content.includes("X-OPSA-Within-Budget")) {
        throw new Error(`Falta cabeçalho de orçamento em ${file}`);
    }
}
```

5. Explicação do código.

O script não substitui testes de integração. Ele garante que o contrato textual não desaparece numa refatoração e que a evidence de duração existe nas três routes críticas.

6. Validação do passo.

Executa `cd apps/api && node scripts/check-mf6-document-performance.mjs`.

7. Cenário negativo/erro esperado.

Se um service não importar o medidor, o script deve falhar com o caminho concreto.

### Passo 7 - Validar negativos de domínio

1. Objetivo funcional do passo no contexto da app.

Provar que velocidade não remove validações.

2. Ficheiros envolvidos:
    - REVER: testes de vendas, compras e lançamentos.
    - LOCALIZAÇÃO: suites de contracts ou integration.

3. Instruções do que fazer.

Executa cenários de cliente inválido, fornecedor inválido e período fiscal fechado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Usa os testes existentes ou cria casos equivalentes no mesmo padrão.

5. Explicação do código.

A regra central é: erro correto é melhor do que sucesso rápido e errado.

6. Validação do passo.

Os negativos devem devolver erro controlado e zero criação persistida.

7. Cenário negativo/erro esperado.

Uma operação sem sessão deve devolver `401`.

### Passo 8 - Recolher evidence e preparar carga

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com prova e handoff para simultaneidade.

2. Ficheiros envolvidos:
    - REVER: outputs de comandos.
    - REVER: PR ou relatório de execução.
    - LOCALIZAÇÃO: evidence final.

3. Instruções do que fazer.

Regista duração de venda, compra e lançamento manual válidos. Guarda também os negativos executados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É um passo de validação e defesa.

5. Explicação do código.

Sem evidence, a equipa só tem intenção. Com evidence, consegue defender que o `RNF08` foi tratado sem comprometer domínio financeiro.

6. Validação do passo.

Todos os fluxos válidos ficam abaixo ou iguais a 1000 ms no ambiente de teste local.

7. Cenário negativo/erro esperado.

Se o ambiente local estiver lento por causa externa, regista `CORRIGIDO_SEM_VALIDACAO_TOTAL` no relatório da tarefa e explica a limitação.

#### Critérios de aceite

- A criação válida de venda, compra e lançamento manual tem medição backend nas routes.
- O orçamento é `1000 ms`.
- Os cabeçalhos `X-OPSA-Duration-Ms` e `X-OPSA-Within-Budget` não expõem dados financeiros.
- A validação backend continua obrigatória.
- Negativos: minimo `3`: sessão ausente, período fiscal fechado e dados inválidos.

#### Validação final

- `cd apps/api && node --check src/modules/performance/documentPerformance.js`
- `cd apps/api && node --check src/modules/sales/saleDocumentRoutes.js src/modules/purchases/purchaseDocumentRoutes.js src/modules/accounting/manualJournalRoutes.js`
- `cd apps/api && node scripts/check-mf6-document-performance.mjs`
- `cd apps/api && npm run test:contracts`
- `cd apps/api && npm run test:integration`
- Confirmar que os pedidos válidos devolvem `201` e duração até 1000 ms.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: três respostas válidas com cabeçalho `X-OPSA-Duration-Ms`.
- `neg`: sessão ausente, período fechado e payload inválido.
- `fonte`: `RNF08`, `BK-MF1-02`, `BK-MF1-07`, `BK-MF2-06`.
- `multiempresa`: prova de que a empresa ativa vem do contexto autenticado.

#### Handoff

- Entrega um helper de medição, integração nas routes críticas e um smoke de performance.
- O próximo BK pode reutilizar a métrica para avaliar 25 utilizadores por empresa.
- Proximo BK recomendado: `BK-MF6-02`

#### Changelog

- `2026-06-22`: guia revisto com estrutura completa, medição backend, smoke textual, negativos e handoff para carga concorrente.
