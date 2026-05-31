# BK-MF1-05 - Consultar títulos em aberto e antiguidade de saldos.

## Header

- `doc_id`: `GUIA-BK-MF1-05`
- `bk_id`: `BK-MF1-05`
- `macro`: `MF1`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF17`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-06`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md`
- `last_updated`: `2026-05-31`

## Objetivo

Executar RF17 para contas a receber, seguindo os documentos canónicos e a stack contratada: React + Vite + TypeScript no frontend, Node.js + Express em ES Modules no backend, PostgreSQL e Prisma/equivalente na persistência.

## Importância funcional e pedagógica

Este BK transforma o requisito RF17 num caminho de implementação rastreável. Funcionalmente, fecha uma operação essencial da MF1; pedagogicamente, mostra como ligar requisito, modelo de dados, service, rota HTTP, UI, testes e evidência sem inventar regras fora dos documentos canónicos.

## Scope-in

- Consulta de documentos não liquidados.
- Cálculo de saldo em aberto.
- Buckets de antiguidade.
- Filtro por data de referência.

## Scope-out

- Cobranças automáticas.
- Previsão de tesouraria detalhada, que pertence a `BK-MF3-04`.

## Estado antes

Existem vendas e recebimentos, mas a equipa não vê rapidamente valores vencidos e por vencer.

## Estado depois

A API devolve documentos de venda com saldo em aberto, dias de atraso e bucket de antiguidade por empresa.

## Pré-requisitos

- Ler `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` e `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
- Confirmar que autenticação, contexto de empresa, roles/permissões e erros HTTP da MF0 estão disponíveis.
- Confirmar dependências canónicas: `-`.
- Nunca receber `companyId` do corpo do pedido; usar sempre o contexto autenticado.

## Glossário

- **Documento canónico:** fonte documental que define RF/RNF, BK, owner, dependências e prioridade.
- **Service:** camada backend onde ficam regras de negócio e transações.
- **Validator:** função que rejeita entrada inválida antes de persistir dados.
- **Evidência:** registo objetivo de ficheiros alterados, comandos executados e resultado obtido.

## Conceitos teóricos essenciais

- O backend é a autoridade para regras contabilísticas, valores monetários, datas e estados.
- Valores monetários devem ser guardados em cêntimos para evitar erros de arredondamento.
- Operações por empresa exigem filtro por `companyId` em todas as queries.
- Estados devem bloquear transições inválidas e devolver erros previsíveis.
- Escritas compostas devem usar transação para evitar dados parciais.

## Arquitetura do BK

- Fluxo: `FLOW-MF1-SALES-AGING`
- Endpoint principal: `/api/sales/open-items`
- Módulo backend: `apps/api/src/modules/open-items/`
- Cliente frontend: `apps/web/src/lib/salesOpenItemsApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.

## Ficheiros a criar/editar/rever

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/open-items/`
- `apps/api/src/server.js`
- `apps/web/src/lib/salesOpenItemsApi.ts`
- `apps/web/src/pages/SalesOpenItemsPage.tsx`
- Testes unitários e de contrato do domínio alterado.

## Erros comuns

- Calcular totais no browser e confiar neles no backend.
- Esquecer filtros por `companyId`.
- Guardar dinheiro como decimal binário.
- Permitir estados impossíveis por falta de validação.
- Devolver stack traces ou mensagens técnicas cruas ao utilizador.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403` ou o erro já definido na MF0.
- Entrada mal formada deve devolver `400` sem escrita parcial.
- Recurso de outra empresa deve devolver `404` ou `403`, nunca dados cruzados.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Garantir que BK-MF1-05 implementa apenas RF17, com dependências, owner, prioridade e próximo BK iguais aos documentos canónicos.

2. Ficheiros envolvidos:
- CRIAR: nenhum ficheiro neste passo.
- EDITAR: nenhum ficheiro neste passo.
- REVER: documentos canónicos listados nos pré-requisitos.
- LOCALIZAÇÃO: topo deste guia e matriz/backlog.

3. Instruções do que fazer.

Confirmar que o BK é `BK-MF1-05`, requisito `RF17`, dependências `-`, sprint `S03-S04` e próximo BK `BK-MF1-06`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-05
macro=MF1
rf=RF17
endpoint=/api/sales/open-items
deps=-
```

5. Explicação do código.

Este bloco não é executado pela app; é o contrato mínimo que impede drift antes de editar código. A execução real começa no passo seguinte.

6. Validação do passo.

Comparar header do guia com `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`. Qualquer divergência bloqueia a implementação.

7. Cenário negativo/erro esperado.

Se surgir uma regra sem fonte documental, não a transformar em requisito; registar a incerteza na evidência e pedir decisão ao responsável.

### Passo 2 - Implementar dados e backend

1. Objetivo funcional do passo no ERP.

Criar a persistência e as regras backend para contas a receber, com validação, transações e isolamento por empresa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/open-items/` com service e routes.
- EDITAR: `apps/api/prisma/schema.prisma` e `apps/api/src/server.js`.
- REVER: BKs dependentes da MF0/MF1 indicados no header.
- LOCALIZAÇÃO: modelos Prisma no domínio correspondente e rota montada em `/api/sales/open-items`.

3. Instruções do que fazer.

Aplicar o schema, criar migration, implementar service antes da rota, usar `companyId` do contexto e devolver erros HTTP normalizados. Montar a rota em `server.js` junto das restantes rotas da app.

4. Código completo, correto e integrado com a app final.

Localização: `apps/api/prisma/schema.prisma`.

```prisma
Sem alteração de schema. Este BK reutiliza `SaleDocument`, `Customer` e `Receipt`.
```

Localização: `apps/api/src/modules/open-items/salesOpenItemsService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

function parseAsOfDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) throw httpError(400, "INVALID_DATE", "Data de referencia invalida");
    return date;
}

function bucketFor(daysOverdue) {
    if (daysOverdue <= 0) return "NOT_DUE";
    if (daysOverdue <= 30) return "DAYS_1_30";
    if (daysOverdue <= 60) return "DAYS_31_60";
    if (daysOverdue <= 90) return "DAYS_61_90";
    return "DAYS_90_PLUS";
}

export async function listSalesOpenItems(prisma, companyId, query) {
    const asOfDate = parseAsOfDate(query.asOfDate);
    const documents = await prisma.saleDocument.findMany({
        where: { companyId, totalCents: { gt: 0 }, NOT: { status: "SETTLED" } },
        include: { customer: true },
        orderBy: [{ dueDate: "asc" }, { issuedAt: "asc" }],
    });

    return documents
        .map((document) => {
            const openAmountCents = document.totalCents - document.amountPaidCents;
            const dueDate = document.dueDate ?? document.issuedAt;
            const daysOverdue = Math.floor((asOfDate.getTime() - dueDate.getTime()) / 86400000);
            return { id: document.id, number: document.number, customerName: document.customer.name, issuedAt: document.issuedAt, dueDate, totalCents: document.totalCents, amountPaidCents: document.amountPaidCents, openAmountCents, daysOverdue, bucket: bucketFor(daysOverdue) };
        })
        .filter((item) => item.openAmountCents > 0);
}
```

Localização: `apps/api/src/modules/open-items/salesOpenItemsRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { listSalesOpenItems } from "./salesOpenItemsService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildSalesOpenItemsRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "AUDITOR")];
    router.get("/", guards, async (req, res) => {
        try { return res.status(200).json({ data: await listSalesOpenItems(prisma, req.companyId, req.query) }); }
        catch (error) { return sendError(res, error); }
    });
    return router;
}
```

Localização: editar `apps/api/src/server.js`.

```js
import { buildSalesOpenItemsRoutes } from "./modules/open-items/salesOpenItemsRoutes.js";

app.use("/api/sales/open-items", buildSalesOpenItemsRoutes({ prisma }));
```

5. Explicação do código.

O schema define as invariantes persistentes. O service concentra validação, cálculo, transações e regras de estado. A route só trata transporte HTTP, autenticação, contexto de empresa e resposta. Esta separação facilita testes e reduz regressões entre MF1 e MF3.

6. Validação do passo.

Executar teste unitário do service, teste de contrato do endpoint `/api/sales/open-items` e confirmar que todos os registos criados pertencem a `req.companyId`.

7. Cenário negativo/erro esperado.

Entrada inválida deve falhar antes do Prisma; estado inválido deve devolver `409`; ausência de recurso dentro da empresa ativa deve devolver `404`.

### Passo 3 - Implementar frontend, testes e handoff

1. Objetivo funcional do passo no ERP.

Disponibilizar a operação ao utilizador, com cliente API tipado, estados de carregamento/erro/sucesso e evidência que permita revisão técnica.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/lib/salesOpenItemsApi.ts` e página/componente do domínio.
- EDITAR: rotas frontend existentes, se a app já tiver router.
- REVER: `apps/web/src/lib/apiClient.ts` e componentes de formulário/listagem já usados na MF0.
- LOCALIZAÇÃO: módulo visual correspondente à operação da MF1.

3. Instruções do que fazer.

Criar funções de API tipadas, consumir erros normalizados do backend e mostrar mensagens claras. Não recalcular no frontend valores que o backend já calcula como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Localização: `apps/web/src/lib/salesOpenItemsApi.ts`.

```ts
import { apiClient } from "./apiClient";

export type SalesOpenItem = { id: string; number: string; customerName: string; openAmountCents: number; daysOverdue: number; bucket: string };

export async function fetchSalesOpenItems(asOfDate: string) {
    return apiClient.get<{ data: SalesOpenItem[] }>("/api/sales/open-items?asOfDate=" + encodeURIComponent(asOfDate));
}
```

Localização: teste unitário ou de contrato do service.

```js
it("coloca documento vencido ha 45 dias no bucket correto", async () => {
    const rows = await listSalesOpenItems(prisma, companyId, { asOfDate: "2026-05-31" });
    expect(rows.find((row) => row.id === saleDocumentId)?.bucket).toBe("DAYS_31_60");
});
```

5. Explicação do código.

O cliente API mantém o contrato entre UI e backend num ponto único. Os testes focam o comportamento que protege a contabilidade: validação, transação, estado e isolamento por empresa.

6. Validação do passo.

- Correr testes unitários do módulo.
- Fazer smoke via UI ou chamada HTTP autenticada.
- Confirmar que mensagens de erro são compreensíveis e não expõem detalhes internos.

7. Cenário negativo/erro esperado.

Se o backend devolver `400`, `401`, `403`, `404` ou `409`, a UI deve mostrar erro controlado e manter o formulário/listagem num estado recuperável.

## Expected results

- A API devolve documentos de venda com saldo em aberto, dias de atraso e bucket de antiguidade por empresa.
- Endpoint `/api/sales/open-items` protegido e filtrado por empresa.
- Testes cobrem pelo menos um caso feliz e três cenários negativos relevantes.
- Evidência lista schema, services, rotas, UI e comandos executados.

## Critérios de aceite

- RF17 fica coberto sem alterar o contrato canónico do BK.
- Nenhum dado de outra empresa aparece na resposta.
- Entradas inválidas falham com erro previsível.
- Escritas compostas são transacionais.
- O próximo BK consegue reutilizar os modelos e endpoints aqui definidos.

## Validação final

- `npm run test:unit`
- `npm run test:contracts`
- Smoke autenticado do endpoint principal.
- Revisão manual do diff para confirmar ausência de alteração de RF/RNF.

## Evidence para PR/defesa

- Ficheiros alterados e motivo.
- Prints ou logs do caso feliz.
- Resultado dos testes e dos cenários negativos.
- Nota explícita sobre dependências cumpridas e handoff.

## Handoff

O `BK-MF1-06` não altera a leitura de saldos; apenas impede emissão final antes da aprovação nos documentos que exigem esse fluxo.

## Changelog

- `2026-05-31`: Guia corrigido no modo `corrigir_apenas`, com contrato técnico completo, código por camada, validações e handoff MF1.
