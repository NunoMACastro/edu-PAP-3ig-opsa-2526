# BK-MF3-01 - Gerar Mapas de IVA (liquidado/dedutível).

## Header
- `doc_id`: `GUIA-BK-MF3-01`
- `bk_id`: `BK-MF3-01`
- `macro`: `MF3`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-01, BK-MF1-02, BK-MF1-04, BK-MF1-07, BK-MF1-09`
- `rf_rnf`: `RF31`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-02`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-01-gerar-mapas-de-iva-liquidado-dedutivel.md`
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais implementar o mapa de IVA do OPSA. O mapa junta IVA liquidado de vendas e IVA dedutível de compras, sempre dentro da empresa ativa e dentro de um intervalo de datas validado.

#### Importância

Este BK fecha RF31 e prepara relatórios fiscais internos. O mapa não submete dados a Autoridade Tributária; ele calcula uma visão auditável para o contabilista confirmar valores.

#### Scope-in

- Ler lançamentos contabilísticos `JournalEntry` de vendas já contabilizadas por `BK-MF1-04`.
- Ler lançamentos contabilísticos `JournalEntry` de compras já contabilizadas por `BK-MF1-09`.
- Usar as linhas dos documentos ligados por `sourceId` apenas para obter código e taxa de IVA, porque o diário contabilístico guarda a conta SNC mas não guarda a taxa fiscal detalhada.
- Agregar IVA por código e taxa.
- Persistir a execução em `VatMapRun`.
- Expor endpoint e página React com loading, erro, vazio e sucesso.

#### Scope-out

- Submissão oficial de declarações.
- Regimes especiais de IVA que não estejam documentados.
- Alteração de faturas, compras ou lançamentos.

#### Estado antes e depois

- Estado antes: existem vendas e compras contabilizadas, mas não existe mapa fiscal consolidado.
- Estado depois: o aluno consegue consultar `GET /api/tax/vat-maps` e obter totais reais de IVA por empresa.

#### Pre-requisitos

- Rever RF31, RF16 e RF21.
- Rever `BK-MF1-01`, `BK-MF1-02`, `BK-MF1-04`, `BK-MF1-07` e `BK-MF1-09`.
- Confirmar que `requireAuth`, `requireCompanyContext` e `requireRole` existem desde MF0.

#### Glossário

- **IVA liquidado:** IVA cobrado em vendas.
- **IVA dedutível:** IVA suportado em compras.
- **Saldo de IVA:** diferença entre liquidado e dedutível.
- **Mapa de IVA:** relatório interno por período, taxa e empresa.

#### Conceitos teóricos essenciais

- Um mapa fiscal não deve alterar documentos; apenas lê dados já registados.
- O `companyId` vem da sessão para impedir mistura de empresas.
- O validator transforma query string em datas seguras antes do service.
- O service concentra cálculo financeiro e grava uma execução auditável.
- A route aplica sessão, empresa ativa e role no backend.
- O frontend usa `credentials: 'include'` para enviar o cookie HttpOnly.

#### Arquitetura do BK

- Backend: `apps/api/src/modules/tax`.
- Endpoint: `GET /api/tax/vat-maps`.
- Roles: `CONTABILISTA`, `AUDITOR`.
- Frontend: `apps/web/src/lib/taxApi.ts` e `apps/web/src/pages/VatMapPage.tsx`.
- Modelos: `VatMapRun`, `Company`, `User`, `JournalEntry`, `JournalEntryLine`, `VatRate`, `SaleDocument`, `SaleDocumentLine`, `PurchaseDocument`, `PurchaseDocumentLine`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/tax/vatMapFilters.js`
- CRIAR: `apps/api/src/modules/tax/vatMapService.js`
- CRIAR: `apps/api/src/modules/tax/vatMapRoutes.js`
- CRIAR: `apps/web/src/lib/taxApi.ts`
- CRIAR: `apps/web/src/pages/VatMapPage.tsx`
- EDITAR: `apps/api/prisma/schema.prisma`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/App.tsx`
- REVER: `BK-MF1-01`, `BK-MF1-02`, `BK-MF1-04`, `BK-MF1-07`, `BK-MF1-09`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que este BK implementa apenas RF31 e não altera documentos de venda, compra ou contabilidade.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: `docs/RF.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`.
    - LOCALIZAÇÃO: linhas de `BK-MF3-01` e `RF31`.

3. Instruções do que fazer.

Regista na evidence que RF31 depende de RF16 e RF21. Confirma que o mapa de IVA é leitura agregada, não escrita contabilística.

- `CANONICO`: o mapa só considera documentos que já tenham `JournalEntry` criado por `BK-MF1-04` ou `BK-MF1-09`.
- `DERIVADO`: a decomposição por código/taxa de IVA usa `SaleDocumentLine` e `PurchaseDocumentLine` ligadas pelo `sourceId` do lançamento, porque `JournalEntryLine` identifica a conta SNC de IVA, mas não guarda `vatRateId`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque este passo protege o escopo. A decisão importante é separar cálculo fiscal interno de emissão oficial.

6. Validação do passo.

A evidence deve listar RF31, BK-MF1-04, BK-MF1-09 e o endpoint escolhido.

7. Cenário negativo/erro esperado.

Se alguém tentar alterar uma fatura a partir do mapa de IVA, a decisão deve ser recusada porque esse comportamento pertence aos BKs de vendas ou compras.

### Passo 2 - Criar persistência da execução do mapa

1. Objetivo funcional do passo no ERP.

Guardar cada execução do mapa com empresa, utilizador, período e totais calculados.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: modelos `Company`, `User`, `SaleDocument`, `PurchaseDocument`.
    - LOCALIZAÇÃO: zona dos modelos fiscais/financeiros.

3. Instruções do que fazer.

Adiciona o modelo se ainda não existir com estes campos e índices. No mesmo ficheiro, adiciona também os campos inversos nos modelos `Company` e `User` existentes.

4. Código completo, correto e integrado com a app final.

No `model Company` existente, acrescenta este campo:

```prisma
vatMapRuns VatMapRun[] @relation("CompanyVatMapRuns")
```

No `model User` existente, acrescenta este campo:

```prisma
vatMapRunsGenerated VatMapRun[] @relation("UserVatMapRuns")
```

Depois adiciona o modelo da execução:

```prisma
/// Execução histórica de um mapa de IVA interno por empresa.
/// Guarda apenas totais calculados; as linhas detalhadas continuam a vir das fontes contabilísticas/documentais.
model VatMapRun {
  id                 String   @id @default(uuid())
  companyId          String
  fromDate           DateTime
  toDate             DateTime
  liquidatedVatCents Int
  deductibleVatCents Int
  vatBalanceCents    Int
  generatedById      String
  generatedAt        DateTime @default(now())

  company     Company @relation("CompanyVatMapRuns", fields: [companyId], references: [id])
  generatedBy User    @relation("UserVatMapRuns", fields: [generatedById], references: [id])

  @@index([companyId, fromDate, toDate])
  @@index([generatedById, generatedAt])
}
```

5. Explicação do código.

`VatMapRun` guarda uma fotografia do cálculo. O `companyId` aplica multiempresa; `generatedById` permite defesa e auditoria; os totais em cêntimos evitam erros de arredondamento. As relações nomeadas mantêm o schema Prisma válido porque `Company` e `User` passam a ter o lado inverso da relação.

6. Validação do passo.

Executa a migration e confirma que o schema Prisma valida e que o modelo não duplica outro conceito fiscal.

7. Cenário negativo/erro esperado.

Sem campos inversos em `Company` e `User`, o Prisma rejeita a relação durante a validação do schema.

### Passo 3 - Validar filtros de datas

1. Objetivo funcional do passo no ERP.

Impedir intervalos vazios, inválidos ou demasiado grandes antes de consultar dados financeiros.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/tax/vatMapFilters.js`
    - EDITAR: nenhum.
    - REVER: `apps/api/src/lib/httpErrors.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria um validator que recebe `req.query` e devolve `fromDate` e `toDate`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/tax/vatMapFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte uma query string de data num objeto Date seguro para o backend.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} fieldName Nome do campo usado na mensagem de erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o campo falta ou não é uma data válida.
 */
function parseDate(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw httpError(400, "INVALID_DATE_RANGE", `${fieldName} é obrigatório`);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_DATE_RANGE", `${fieldName} deve ser uma data válida`);
    }

    return date;
}

/**
 * Valida o período pedido para o mapa de IVA.
 *
 * O DTO devolvido é pequeno de propósito: o service recebe datas já normalizadas e nunca recebe `companyId`
 * vindo do frontend, preservando a regra multiempresa da MF0.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Período validado para consulta fiscal.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo é inválido ou demasiado largo.
 */
export function validateVatMapQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");

    if (fromDate > toDate) {
        throw httpError(400, "INVALID_DATE_RANGE", "A data inicial não pode ser posterior a data final");
    }

    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
    if (days > 366) {
        throw httpError(400, "INVALID_DATE_RANGE", "O intervalo máximo do mapa de IVA é de 366 dias");
    }

    return { fromDate, toDate };
}
```

5. Explicação do código.

`parseDate` transforma texto em `Date` e falha cedo com `400`. `validateVatMapQuery` protege a base de dados contra consultas abertas e devolve um DTO pequeno para o service. O JSDoc documenta parâmetros, retorno e erros esperados para o aluno perceber que a validação pertence ao backend e acontece antes de qualquer query financeira.

6. Validação do passo.

Testa `from=2026-01-01&to=2026-01-31` e depois `from=abc`.

7. Cenário negativo/erro esperado.

`from=2026-02-01&to=2026-01-01` devolve `400 INVALID_DATE_RANGE`.

### Passo 4 - Implementar service com cálculo real

1. Objetivo funcional do passo no ERP.

Calcular IVA liquidado, IVA dedutível e saldo por taxa, sempre filtrando pela empresa ativa.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/tax/vatMapService.js`
    - EDITAR: nenhum.
    - REVER: services de contabilização criados em `BK-MF1-04` e `BK-MF1-09`.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Implementa queries reais sobre `JournalEntry` de vendas e compras. Depois usa os `sourceId` desses lançamentos para ir buscar as linhas operacionais que contêm `vatRateId`, `vatRate.code`, `rateBps` e `vatCents`. Usa a persistência `VatMapRun` para gravar a execução depois do cálculo.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/tax/vatMapService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Normaliza valores monetários em cêntimos antes de os somar.
 *
 * @param {number | null | undefined} value Valor monetario vindo da base de dados.
 * @returns {number} Valor seguro para agregação.
 */
function cents(value) {
    return Number.isFinite(value) ? value : 0;
}

/**
 * Agrega IVA por código e taxa.
 *
 * @param {Map<string, { vatCode: string, vatRateBps: number, liquidatedVatCents: number, deductibleVatCents: number }>} map Buckets acumulados.
 * @param {string} key Chave composta por código e taxa.
 * @param {{ vatCode: string, vatRateBps: number, liquidatedVatCents?: number, deductibleVatCents?: number }} patch Valores a somar ao bucket.
 * @returns {void}
 */
function addToBucket(map, key, patch) {
    const current = map.get(key) ?? {
        vatCode: patch.vatCode,
        vatRateBps: patch.vatRateBps,
        liquidatedVatCents: 0,
        deductibleVatCents: 0,
    };

    current.liquidatedVatCents += cents(patch.liquidatedVatCents);
    current.deductibleVatCents += cents(patch.deductibleVatCents);
    map.set(key, current);
}

/**
 * Gera o mapa de IVA interno da empresa ativa.
 *
 * A fonte canónica de inclusão é `JournalEntry`: só entram documentos contabilizados pelos BKs MF1-04 e MF1-09.
 * As linhas de venda/compra são usadas de forma derivada para obter código/taxa de IVA, porque o diário guarda
 * a conta SNC de IVA mas não guarda a taxa fiscal original da linha.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e período validado.
 * @returns {Promise<{ runId: string, from: string, to: string, totals: { liquidatedVatCents: number, deductibleVatCents: number, vatBalanceCents: number }, rows: Array<{ vatCode: string, vatRateBps: number, liquidatedVatCents: number, deductibleVatCents: number, balanceCents: number }>, sources: string[] }>} Resultado fiscal pronto para frontend e evidence.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function buildVatMap(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) {
        throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");
    }

    const [saleEntries, purchaseEntries] = await Promise.all([
        prisma.journalEntry.findMany({
            where: {
                companyId,
                source: "SALE",
                entryDate: { gte: fromDate, lte: toDate },
            },
            select: { sourceId: true },
        }),
        prisma.journalEntry.findMany({
            where: {
                companyId,
                source: "PURCHASE",
                entryDate: { gte: fromDate, lte: toDate },
            },
            select: { sourceId: true },
        }),
    ]);

    const saleDocumentIds = saleEntries.map((entry) => entry.sourceId);
    const purchaseDocumentIds = purchaseEntries.map((entry) => entry.sourceId);

    // O diário contabilístico decide que documentos entram; as linhas operacionais dao a taxa fiscal detalhada.
    const [sales, purchases] = await Promise.all([
        prisma.saleDocumentLine.findMany({
            where: {
                saleDocumentId: { in: saleDocumentIds },
                saleDocument: {
                    companyId,
                },
            },
            select: {
                vatCents: true,
                vatRate: { select: { code: true, rateBps: true } },
            },
        }),
        prisma.purchaseDocumentLine.findMany({
            where: {
                purchaseDocumentId: { in: purchaseDocumentIds },
                purchaseDocument: {
                    companyId,
                },
            },
            select: {
                vatCents: true,
                vatRate: { select: { code: true, rateBps: true } },
            },
        }),
    ]);

    const rowsByRate = new Map();

    for (const line of sales) {
        const key = `${line.vatRate.code}-${line.vatRate.rateBps}`;
        addToBucket(rowsByRate, key, {
            vatCode: line.vatRate.code,
            vatRateBps: line.vatRate.rateBps,
            liquidatedVatCents: line.vatCents,
        });
    }

    for (const line of purchases) {
        const key = `${line.vatRate.code}-${line.vatRate.rateBps}`;
        addToBucket(rowsByRate, key, {
            vatCode: line.vatRate.code,
            vatRateBps: line.vatRate.rateBps,
            deductibleVatCents: line.vatCents,
        });
    }

    const rows = [...rowsByRate.values()].map((row) => ({
        ...row,
        balanceCents: row.liquidatedVatCents - row.deductibleVatCents,
    }));

    const totals = rows.reduce(
        (acc, row) => ({
            liquidatedVatCents: acc.liquidatedVatCents + row.liquidatedVatCents,
            deductibleVatCents: acc.deductibleVatCents + row.deductibleVatCents,
            vatBalanceCents: acc.vatBalanceCents + row.balanceCents,
        }),
        { liquidatedVatCents: 0, deductibleVatCents: 0, vatBalanceCents: 0 },
    );

    const run = await prisma.vatMapRun.create({
        data: {
            companyId,
            generatedById: userId,
            fromDate,
            toDate,
            ...totals,
        },
    });

    return {
        runId: run.id,
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
        totals,
        rows,
        sources: ["JournalEntry", "SaleDocumentLine", "PurchaseDocumentLine"],
    };
}
```

5. Explicação do código.

O service lê primeiro `JournalEntry` dentro da empresa e do período, usando `source=SALE` e `source=PURCHASE`. Esta é a fonte canónica que prova que a venda ou compra já foi contabilizada. Depois usa `sourceId` para consultar as linhas dos documentos e obter `vatRate.code`, `vatRate.rateBps` e `vatCents`. `addToBucket` agrega por código/taxa, separa liquidado e dedutível, calcula saldo e grava `VatMapRun`. A regra evita usar valores enviados pelo frontend para escolher empresa e evita incluir documentos ainda não contabilizados.

6. Validação do passo.

Com uma venda com IVA de 23 EUR e uma compra com IVA de 10 EUR, o saldo deve ser 13 EUR a entregar.

7. Cenário negativo/erro esperado.

Sem empresa ativa, o service devolve `401 COMPANY_CONTEXT_REQUIRED`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Publicar o mapa de IVA apenas para roles financeiras.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/tax/vatMapRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares de autenticação, empresa e permissões.
    - LOCALIZAÇÃO: ficheiro completo e montagem em `server.js`.

3. Instruções do que fazer.

Liga validator e service numa route `GET /`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/tax/vatMapRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateVatMapQuery } from "./vatMapFilters.js";
import { buildVatMap } from "./vatMapService.js";

/**
 * Constrói as routes HTTP do mapa de IVA.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências injetadas pelo servidor.
 * @returns {import("express").Router} Router montado em `/api/tax/vat-maps`.
 */
export function buildVatMapRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "AUDITOR")];

    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateVatMapQuery(req.query);
            const result = await buildVatMap(prisma, {
                // O companyId vem da sessão ativa; o browser nunca escolhe a empresa por query string.
                companyId: req.companyId,
                userId: req.user.id,
                ...filters,
            });
            return res.status(200).json(result);
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
import { buildVatMapRoutes } from "./modules/tax/vatMapRoutes.js";

app.use("/api/tax/vat-maps", buildVatMapRoutes({ prisma }));
```

5. Explicação do código.

A route aplica autenticação, empresa e role antes do cálculo. O controller não recebe `companyId` do browser; usa `req.companyId`. O JSDoc documenta onde a route é montada e o comentário dentro do handler reforça a regra de segurança que evita fuga de dados entre empresas.

6. Validação do passo.

Um `CONTABILISTA` autenticado recebe `200`; um `OPERACIONAL` recebe `403`.

7. Cenário negativo/erro esperado.

Sem cookie de sessão, a route devolve `401 SESSION_REQUIRED`.

### Passo 6 - Criar cliente API frontend

1. Objetivo funcional do passo no ERP.

Permitir que a página chame o endpoint real com tipos claros.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/taxApi.ts`
    - EDITAR: nenhum.
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria tipos de resposta com nomes fiscais, não nomes genericos.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/taxApi.ts
import { apiClient } from "./apiClient";

/**
 * Linha agregada do mapa de IVA por código/taxa.
 */
export type VatMapRow = {
    vatCode: string;
    vatRateBps: number;
    liquidatedVatCents: number;
    deductibleVatCents: number;
    balanceCents: number;
};

/**
 * Resultado completo devolvido por `GET /api/tax/vat-maps`.
 */
export type VatMapResult = {
    runId: string;
    from: string;
    to: string;
    totals: {
        liquidatedVatCents: number;
        deductibleVatCents: number;
        vatBalanceCents: number;
    };
    rows: VatMapRow[];
    sources: string[];
};

/**
 * Chama o endpoint real do mapa de IVA usando o cliente comum da MF1.
 *
 * @param {string} from Data inicial no formato ISO `YYYY-MM-DD`.
 * @param {string} to Data final no formato ISO `YYYY-MM-DD`.
 * @returns {Promise<VatMapResult>} Resultado tipado do mapa.
 * @throws {Error} Quando o backend devolve erro HTTP.
 */
export async function fetchVatMap(from: string, to: string): Promise<VatMapResult> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<VatMapResult>(`/api/tax/vat-maps?${params.toString()}`);
}
```

5. Explicação do código.

O cliente define a forma da resposta e reutiliza `apiClient`, criado em `BK-MF1-01`, que já envia `credentials: "include"` para o cookie HttpOnly. Os nomes `liquidatedVatCents` e `deductibleVatCents` ensinam o domínio certo, e o JSDoc explica a entrada, a saída e a origem dos erros.

6. Validação do passo.

Confirma no browser que o pedido inclui cookie de sessão.

7. Cenário negativo/erro esperado.

Se o backend devolver `403`, a função lança erro com mensagem controlada.

### Passo 7 - Criar página React do mapa

1. Objetivo funcional do passo no ERP.

Mostrar o mapa de IVA com formulario, estados e tabela por taxa.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/VatMapPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: cliente `taxApi.ts`.
    - LOCALIZAÇÃO: ficheiro completo e registo da rota/menu.

3. Instruções do que fazer.

Cria página com datas obrigatórias e mensagens em português de Portugal.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/VatMapPage.tsx
import { FormEvent, useState } from "react";
import { fetchVatMap, type VatMapResult } from "../lib/taxApi";

/**
 * Formata cêntimos para euros apenas para apresentacao.
 *
 * @param {number} cents Valor em cêntimos vindo da API.
 * @returns {string} Valor monetario legível.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Página React que permite gerar e consultar o mapa de IVA.
 *
 * Mantém estados de formulario, carregamento, erro, resultado e vazio. A empresa continua a vir da sessão
 * no backend, por isso a página nunca pede `companyId` ao utilizador.
 *
 * @returns {JSX.Element} Interface do mapa de IVA.
 */
export function VatMapPage() {
    const [from, setFrom] = useState("2026-01-01");
    const [to, setTo] = useState("2026-01-31");
    const [result, setResult] = useState<VatMapResult | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            // A chamada usa cookies HttpOnly via apiClient; não há tokens em localStorage.
            setResult(await fetchVatMap(from, to));
        } catch (caughtError) {
            setResult(null);
            setError(caughtError instanceof Error ? caughtError.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Mapa de IVA</h1>
            <form onSubmit={handleSubmit}>
                <label>Data inicial<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} required /></label>
                <label>Data final<input type="date" value={to} onChange={(event) => setTo(event.target.value)} required /></label>
                <button type="submit" disabled={loading}>{loading ? "A calcular..." : "Gerar mapa"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {result && result.rows.length === 0 && <p>Sem movimentos de IVA no período selecionado.</p>}
            {result && (
                <section aria-label="Resumo de IVA">
                    <p>IVA liquidado: {euros(result.totals.liquidatedVatCents)}</p>
                    <p>IVA dedutível: {euros(result.totals.deductibleVatCents)}</p>
                    <p>Saldo de IVA: {euros(result.totals.vatBalanceCents)}</p>
                    <table>
                        <thead><tr><th>Código</th><th>Taxa</th><th>Liquidado</th><th>Dedutível</th><th>Saldo</th></tr></thead>
                        <tbody>
                            {result.rows.map((row) => (
                                <tr key={`${row.vatCode}-${row.vatRateBps}`}>
                                    <td>{row.vatCode}</td>
                                    <td>{row.vatRateBps / 100}%</td>
                                    <td>{euros(row.liquidatedVatCents)}</td>
                                    <td>{euros(row.deductibleVatCents)}</td>
                                    <td>{euros(row.balanceCents)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}
        </main>
    );
}
```

5. Explicação do código.

A página mantém estado de datas, resultado, erro e carregamento. A tabela usa chaves por código/taxa e mostra o domínio fiscal real. O utilizador nunca escolhe empresa por input; essa escolha vem da sessão. O JSDoc e o comentário no submit tornam explícito que a segurança depende do cookie HttpOnly e da verificação backend, não de estado local.

6. Validação do passo.

Gera um mapa com dados e confirma a tabela. Depois gera um período vazio e confirma mensagem de vazio.

7. Cenário negativo/erro esperado.

Com sessão expirada, a página deve apresentar erro sem mostrar stack trace.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Confirmar que o BK deixa a fiscalidade pronta para a tesouraria e reporting seguintes.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence do BK.
    - REVER: todos os ficheiros criados neste BK.
    - LOCALIZAÇÃO: checklist final da PR/defesa.

3. Instruções do que fazer.

Executa smoke com dados reais e três negativos: datas inválidas, sem sessão e role errada.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo.

5. Explicação do código.

A validação garante que o código anterior calcula valores reais e não apenas resposta vazia.

6. Validação do passo.

`GET /api/tax/vat-maps?from=2026-01-01&to=2026-01-31` deve devolver totais coerentes com vendas e compras.

7. Cenário negativo/erro esperado.

Um utilizador sem role financeira recebe `403 ROLE_FORBIDDEN`.

## Expected results

- `200` com `liquidatedVatCents`, `deductibleVatCents`, `vatBalanceCents` e linhas por taxa.
- `400 INVALID_DATE_RANGE` para datas inválidas.
- `401 SESSION_REQUIRED` sem sessão.
- `403 ROLE_FORBIDDEN` sem role permitida.
- Período sem dados devolve totais a zero e lista vazia.

## Critérios de aceite

- O service consulta `JournalEntry` real e usa linhas dos documentos apenas para decompor taxa/código de IVA.
- Todas as queries usam `companyId`.
- O frontend apresenta nomes fiscais corretos.
- A execução fica registada em `VatMapRun`.
- A evidence inclui caso principal e três negativos.

## Validação final

- Confirmar imports.
- Confirmar route montada.
- Confirmar sem dados cross-company.
- Confirmar que o próximo BK não precisa reescrever o mapa.

## Evidence para PR/defesa

- Output JSON do mapa.
- Screenshot da página.
- Provas de `400`, `401` e `403`.
- Período e empresa usados no teste.

## Handoff

BK-MF3-02 usa a mesma disciplina de multiempresa para criar contas bancárias e caixa, que depois alimentam extratos e previsões.

## Changelog

- `2026-06-13`: corrigido para implementar cálculo real de IVA liquidado/dedutível, fonte contabilística por `JournalEntry`, nomes fiscais, route protegida, página React, JSDoc, `apiClient` e evidence.
