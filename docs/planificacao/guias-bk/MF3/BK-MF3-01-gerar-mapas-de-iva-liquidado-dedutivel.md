# BK-MF3-01 - Gerar Mapas de IVA (liquidado/dedutivel).

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

Neste BK vais implementar o mapa de IVA do OPSA. O mapa junta IVA liquidado de vendas e IVA dedutivel de compras, sempre dentro da empresa ativa e dentro de um intervalo de datas validado.

#### Importancia

Este BK fecha RF31 e prepara relatórios fiscais internos. O mapa nao submete dados a Autoridade Tributaria; ele calcula uma visao auditavel para o contabilista confirmar valores.

#### Scope-in

- Ler lancamentos contabilisticos `JournalEntry` de vendas ja contabilizadas por `BK-MF1-04`.
- Ler lancamentos contabilisticos `JournalEntry` de compras ja contabilizadas por `BK-MF1-09`.
- Usar as linhas dos documentos ligados por `sourceId` apenas para obter codigo e taxa de IVA, porque o diario contabilistico guarda a conta SNC mas nao guarda a taxa fiscal detalhada.
- Agregar IVA por codigo e taxa.
- Persistir a execucao em `VatMapRun`.
- Expor endpoint e pagina React com loading, erro, vazio e sucesso.

#### Scope-out

- Submissao oficial de declaracoes.
- Regimes especiais de IVA que nao estejam documentados.
- Alteracao de faturas, compras ou lancamentos.

#### Estado antes e depois

- Estado antes: existem vendas e compras contabilizadas, mas nao existe mapa fiscal consolidado.
- Estado depois: o aluno consegue consultar `GET /api/tax/vat-maps` e obter totais reais de IVA por empresa.

#### Pre-requisitos

- Rever RF31, RF16 e RF21.
- Rever `BK-MF1-01`, `BK-MF1-02`, `BK-MF1-04`, `BK-MF1-07` e `BK-MF1-09`.
- Confirmar que `requireAuth`, `requireCompanyContext` e `requireRole` existem desde MF0.

#### Glossario

- **IVA liquidado:** IVA cobrado em vendas.
- **IVA dedutivel:** IVA suportado em compras.
- **Saldo de IVA:** diferenca entre liquidado e dedutivel.
- **Mapa de IVA:** relatorio interno por periodo, taxa e empresa.

#### Conceitos teoricos essenciais

- Um mapa fiscal nao deve alterar documentos; apenas le dados ja registados.
- O `companyId` vem da sessao para impedir mistura de empresas.
- O validator transforma query string em datas seguras antes do service.
- O service concentra calculo financeiro e grava uma execucao auditavel.
- A route aplica sessao, empresa ativa e role no backend.
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

#### Tutorial tecnico linear

### Passo 1 - Confirmar contrato canonico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que este BK implementa apenas RF31 e nao altera documentos de venda, compra ou contabilidade.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: `docs/RF.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`.
    - LOCALIZACAO: linhas de `BK-MF3-01` e `RF31`.

3. Instrucoes do que fazer.

Regista na evidence que RF31 depende de RF16 e RF21. Confirma que o mapa de IVA e leitura agregada, nao escrita contabilistica.

- `CANONICO`: o mapa so considera documentos que ja tenham `JournalEntry` criado por `BK-MF1-04` ou `BK-MF1-09`.
- `DERIVADO`: a decomposicao por codigo/taxa de IVA usa `SaleDocumentLine` e `PurchaseDocumentLine` ligadas pelo `sourceId` do lancamento, porque `JournalEntryLine` identifica a conta SNC de IVA, mas nao guarda `vatRateId`.

4. Codigo completo, correto e integrado com a app final.

Sem codigo neste passo.

5. Explicacao do codigo.

Nao ha codigo porque este passo protege o escopo. A decisao importante e separar calculo fiscal interno de emissao oficial.

6. Validacao do passo.

A evidence deve listar RF31, BK-MF1-04, BK-MF1-09 e o endpoint escolhido.

7. Cenario negativo/erro esperado.

Se alguem tentar alterar uma fatura a partir do mapa de IVA, a decisao deve ser recusada porque esse comportamento pertence aos BKs de vendas ou compras.

### Passo 2 - Criar persistencia da execucao do mapa

1. Objetivo funcional do passo no ERP.

Guardar cada execucao do mapa com empresa, utilizador, periodo e totais calculados.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: modelos `Company`, `User`, `SaleDocument`, `PurchaseDocument`.
    - LOCALIZACAO: zona dos modelos fiscais/financeiros.

3. Instrucoes do que fazer.

Adiciona o modelo se ainda nao existir com estes campos e indices. No mesmo ficheiro, adiciona tambem os campos inversos nos modelos `Company` e `User` existentes.

4. Codigo completo, correto e integrado com a app final.

No `model Company` existente, acrescenta este campo:

```prisma
vatMapRuns VatMapRun[] @relation("CompanyVatMapRuns")
```

No `model User` existente, acrescenta este campo:

```prisma
vatMapRunsGenerated VatMapRun[] @relation("UserVatMapRuns")
```

Depois adiciona o modelo da execucao:

```prisma
/// Execucao historica de um mapa de IVA interno por empresa.
/// Guarda apenas totais calculados; as linhas detalhadas continuam a vir das fontes contabilisticas/documentais.
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

5. Explicacao do codigo.

`VatMapRun` guarda uma fotografia do calculo. O `companyId` aplica multiempresa; `generatedById` permite defesa e auditoria; os totais em centimos evitam erros de arredondamento. As relacoes nomeadas mantem o schema Prisma valido porque `Company` e `User` passam a ter o lado inverso da relacao.

6. Validacao do passo.

Executa a migration e confirma que o schema Prisma valida e que o modelo nao duplica outro conceito fiscal.

7. Cenario negativo/erro esperado.

Sem campos inversos em `Company` e `User`, o Prisma rejeita a relacao durante a validacao do schema.

### Passo 3 - Validar filtros de datas

1. Objetivo funcional do passo no ERP.

Impedir intervalos vazios, invalidos ou demasiado grandes antes de consultar dados financeiros.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/tax/vatMapFilters.js`
    - EDITAR: nenhum.
    - REVER: `apps/api/src/lib/httpErrors.js`
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Cria um validator que recebe `req.query` e devolve `fromDate` e `toDate`.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/tax/vatMapFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte uma query string de data num objeto Date seguro para o backend.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} fieldName Nome do campo usado na mensagem de erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o campo falta ou nao e uma data valida.
 */
function parseDate(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw httpError(400, "INVALID_DATE_RANGE", `${fieldName} e obrigatorio`);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_DATE_RANGE", `${fieldName} deve ser uma data valida`);
    }

    return date;
}

/**
 * Valida o periodo pedido para o mapa de IVA.
 *
 * O DTO devolvido e pequeno de proposito: o service recebe datas ja normalizadas e nunca recebe `companyId`
 * vindo do frontend, preservando a regra multiempresa da MF0.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Periodo validado para consulta fiscal.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo e invalido ou demasiado largo.
 */
export function validateVatMapQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");

    if (fromDate > toDate) {
        throw httpError(400, "INVALID_DATE_RANGE", "A data inicial nao pode ser posterior a data final");
    }

    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
    if (days > 366) {
        throw httpError(400, "INVALID_DATE_RANGE", "O intervalo maximo do mapa de IVA e de 366 dias");
    }

    return { fromDate, toDate };
}
```

5. Explicacao do codigo.

`parseDate` transforma texto em `Date` e falha cedo com `400`. `validateVatMapQuery` protege a base de dados contra consultas abertas e devolve um DTO pequeno para o service. O JSDoc documenta parametros, retorno e erros esperados para o aluno perceber que a validacao pertence ao backend e acontece antes de qualquer query financeira.

6. Validacao do passo.

Testa `from=2026-01-01&to=2026-01-31` e depois `from=abc`.

7. Cenario negativo/erro esperado.

`from=2026-02-01&to=2026-01-01` devolve `400 INVALID_DATE_RANGE`.

### Passo 4 - Implementar service com calculo real

1. Objetivo funcional do passo no ERP.

Calcular IVA liquidado, IVA dedutivel e saldo por taxa, sempre filtrando pela empresa ativa.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/tax/vatMapService.js`
    - EDITAR: nenhum.
    - REVER: services de contabilizacao criados em `BK-MF1-04` e `BK-MF1-09`.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Implementa queries reais sobre `JournalEntry` de vendas e compras. Depois usa os `sourceId` desses lancamentos para ir buscar as linhas operacionais que contem `vatRateId`, `vatRate.code`, `rateBps` e `vatCents`. Usa a persistencia `VatMapRun` para gravar a execucao depois do calculo.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/tax/vatMapService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Normaliza valores monetarios em centimos antes de os somar.
 *
 * @param {number | null | undefined} value Valor monetario vindo da base de dados.
 * @returns {number} Valor seguro para agregacao.
 */
function cents(value) {
    return Number.isFinite(value) ? value : 0;
}

/**
 * Agrega IVA por codigo e taxa.
 *
 * @param {Map<string, { vatCode: string, vatRateBps: number, liquidatedVatCents: number, deductibleVatCents: number }>} map Buckets acumulados.
 * @param {string} key Chave composta por codigo e taxa.
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
 * A fonte canonica de inclusao e `JournalEntry`: so entram documentos contabilizados pelos BKs MF1-04 e MF1-09.
 * As linhas de venda/compra sao usadas de forma derivada para obter codigo/taxa de IVA, porque o diario guarda
 * a conta SNC de IVA mas nao guarda a taxa fiscal original da linha.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e periodo validado.
 * @returns {Promise<{ runId: string, from: string, to: string, totals: { liquidatedVatCents: number, deductibleVatCents: number, vatBalanceCents: number }, rows: Array<{ vatCode: string, vatRateBps: number, liquidatedVatCents: number, deductibleVatCents: number, balanceCents: number }>, sources: string[] }>} Resultado fiscal pronto para frontend e evidence.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando nao ha empresa ativa.
 */
export async function buildVatMap(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) {
        throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatoria");
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

    // O diario contabilistico decide que documentos entram; as linhas operacionais dao a taxa fiscal detalhada.
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

5. Explicacao do codigo.

O service le primeiro `JournalEntry` dentro da empresa e do periodo, usando `source=SALE` e `source=PURCHASE`. Esta e a fonte canonica que prova que a venda ou compra ja foi contabilizada. Depois usa `sourceId` para consultar as linhas dos documentos e obter `vatRate.code`, `vatRate.rateBps` e `vatCents`. `addToBucket` agrega por codigo/taxa, separa liquidado e dedutivel, calcula saldo e grava `VatMapRun`. A regra evita usar valores enviados pelo frontend para escolher empresa e evita incluir documentos ainda nao contabilizados.

6. Validacao do passo.

Com uma venda com IVA de 23 EUR e uma compra com IVA de 10 EUR, o saldo deve ser 13 EUR a entregar.

7. Cenario negativo/erro esperado.

Sem empresa ativa, o service devolve `401 COMPANY_CONTEXT_REQUIRED`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Publicar o mapa de IVA apenas para roles financeiras.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/tax/vatMapRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares de autenticação, empresa e permissões.
    - LOCALIZACAO: ficheiro completo e montagem em `server.js`.

3. Instrucoes do que fazer.

Liga validator e service numa route `GET /`.

4. Codigo completo, correto e integrado com a app final.

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
 * Constroi as routes HTTP do mapa de IVA.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependencias injetadas pelo servidor.
 * @returns {import("express").Router} Router montado em `/api/tax/vat-maps`.
 */
export function buildVatMapRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "AUDITOR")];

    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateVatMapQuery(req.query);
            const result = await buildVatMap(prisma, {
                // O companyId vem da sessao ativa; o browser nunca escolhe a empresa por query string.
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

5. Explicacao do codigo.

A route aplica autenticação, empresa e role antes do calculo. O controller nao recebe `companyId` do browser; usa `req.companyId`. O JSDoc documenta onde a route e montada e o comentario dentro do handler reforca a regra de seguranca que evita fuga de dados entre empresas.

6. Validacao do passo.

Um `CONTABILISTA` autenticado recebe `200`; um `OPERACIONAL` recebe `403`.

7. Cenario negativo/erro esperado.

Sem cookie de sessão, a route devolve `401 SESSION_REQUIRED`.

### Passo 6 - Criar cliente API frontend

1. Objetivo funcional do passo no ERP.

Permitir que a pagina chame o endpoint real com tipos claros.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/taxApi.ts`
    - EDITAR: nenhum.
    - REVER: `apps/web/src/lib/apiClient.ts`
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Cria tipos de resposta com nomes fiscais, nao nomes genericos.

4. Codigo completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/taxApi.ts
import { apiClient } from "./apiClient";

/**
 * Linha agregada do mapa de IVA por codigo/taxa.
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

5. Explicacao do codigo.

O cliente define a forma da resposta e reutiliza `apiClient`, criado em `BK-MF1-01`, que ja envia `credentials: "include"` para o cookie HttpOnly. Os nomes `liquidatedVatCents` e `deductibleVatCents` ensinam o dominio certo, e o JSDoc explica a entrada, a saida e a origem dos erros.

6. Validacao do passo.

Confirma no browser que o pedido inclui cookie de sessão.

7. Cenario negativo/erro esperado.

Se o backend devolver `403`, a função lança erro com mensagem controlada.

### Passo 7 - Criar pagina React do mapa

1. Objetivo funcional do passo no ERP.

Mostrar o mapa de IVA com formulario, estados e tabela por taxa.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/VatMapPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: cliente `taxApi.ts`.
    - LOCALIZACAO: ficheiro completo e registo da rota/menu.

3. Instrucoes do que fazer.

Cria pagina com datas obrigatorias e mensagens em portugues de Portugal.

4. Codigo completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/VatMapPage.tsx
import { FormEvent, useState } from "react";
import { fetchVatMap, type VatMapResult } from "../lib/taxApi";

/**
 * Formata centimos para euros apenas para apresentacao.
 *
 * @param {number} cents Valor em centimos vindo da API.
 * @returns {string} Valor monetario legivel.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Pagina React que permite gerar e consultar o mapa de IVA.
 *
 * Mantem estados de formulario, carregamento, erro, resultado e vazio. A empresa continua a vir da sessao
 * no backend, por isso a pagina nunca pede `companyId` ao utilizador.
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
            // A chamada usa cookies HttpOnly via apiClient; nao ha tokens em localStorage.
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
            {result && result.rows.length === 0 && <p>Sem movimentos de IVA no periodo selecionado.</p>}
            {result && (
                <section aria-label="Resumo de IVA">
                    <p>IVA liquidado: {euros(result.totals.liquidatedVatCents)}</p>
                    <p>IVA dedutivel: {euros(result.totals.deductibleVatCents)}</p>
                    <p>Saldo de IVA: {euros(result.totals.vatBalanceCents)}</p>
                    <table>
                        <thead><tr><th>Codigo</th><th>Taxa</th><th>Liquidado</th><th>Dedutivel</th><th>Saldo</th></tr></thead>
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

5. Explicacao do codigo.

A pagina mantem estado de datas, resultado, erro e carregamento. A tabela usa chaves por codigo/taxa e mostra o dominio fiscal real. O utilizador nunca escolhe empresa por input; essa escolha vem da sessao. O JSDoc e o comentario no submit tornam explicito que a seguranca depende do cookie HttpOnly e da verificacao backend, nao de estado local.

6. Validacao do passo.

Gera um mapa com dados e confirma a tabela. Depois gera um periodo vazio e confirma mensagem de vazio.

7. Cenario negativo/erro esperado.

Com sessão expirada, a pagina deve apresentar erro sem mostrar stack trace.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Confirmar que o BK deixa a fiscalidade pronta para a tesouraria e reporting seguintes.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence do BK.
    - REVER: todos os ficheiros criados neste BK.
    - LOCALIZACAO: checklist final da PR/defesa.

3. Instrucoes do que fazer.

Executa smoke com dados reais e tres negativos: datas invalidas, sem sessão e role errada.

4. Codigo completo, correto e integrado com a app final.

Sem codigo novo neste passo.

5. Explicacao do codigo.

A validacao garante que o codigo anterior calcula valores reais e nao apenas resposta vazia.

6. Validacao do passo.

`GET /api/tax/vat-maps?from=2026-01-01&to=2026-01-31` deve devolver totais coerentes com vendas e compras.

7. Cenario negativo/erro esperado.

Um utilizador sem role financeira recebe `403 ROLE_FORBIDDEN`.

## Expected results

- `200` com `liquidatedVatCents`, `deductibleVatCents`, `vatBalanceCents` e linhas por taxa.
- `400 INVALID_DATE_RANGE` para datas invalidas.
- `401 SESSION_REQUIRED` sem sessão.
- `403 ROLE_FORBIDDEN` sem role permitida.
- Periodo sem dados devolve totais a zero e lista vazia.

## Critérios de aceite

- O service consulta `JournalEntry` real e usa linhas dos documentos apenas para decompor taxa/codigo de IVA.
- Todas as queries usam `companyId`.
- O frontend apresenta nomes fiscais corretos.
- A execução fica registada em `VatMapRun`.
- A evidence inclui caso principal e tres negativos.

## Validação final

- Confirmar imports.
- Confirmar route montada.
- Confirmar sem dados cross-company.
- Confirmar que o proximo BK nao precisa reescrever o mapa.

## Evidence para PR/defesa

- Output JSON do mapa.
- Screenshot da pagina.
- Provas de `400`, `401` e `403`.
- Periodo e empresa usados no teste.

## Handoff

BK-MF3-02 usa a mesma disciplina de multiempresa para criar contas bancarias e caixa, que depois alimentam extratos e previsoes.

## Changelog

- `2026-06-13`: corrigido para implementar calculo real de IVA liquidado/dedutivel, fonte contabilistica por `JournalEntry`, nomes fiscais, route protegida, pagina React, JSDoc, `apiClient` e evidence.
