# BK-MF1-03 - Registar recebimentos (parciais/totais).

## Header

- `doc_id`: `GUIA-BK-MF1-03`
- `bk_id`: `BK-MF1-03`
- `macro`: `MF1`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF15`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-04`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-03-registar-recebimentos-parciais-totais.md`
- `last_updated`: `2026-05-31`

## Objetivo

Executar RF15 para tesouraria de vendas, seguindo os documentos canónicos e a stack contratada: React + Vite + TypeScript no frontend, Node.js + Express em ES Modules no backend, PostgreSQL e Prisma/equivalente na persistência.

## Importância funcional e pedagógica

Este BK transforma o requisito RF15 num caminho de implementação rastreável. Funcionalmente, fecha uma operação essencial da MF1; pedagogicamente, mostra como ligar requisito, modelo de dados, service, rota HTTP, UI, testes e evidência sem inventar regras fora dos documentos canónicos.

## Scope-in

- Recebimentos parciais e totais.
- Validação contra excesso de pagamento.
- Método, data e referência externa.
- Atualização transacional do estado do documento.

## Scope-out

- Reconciliação bancária, que pertence a `BK-MF3-03`.
- Previsão de tesouraria, que pertence a `BK-MF3-04`.

## Estado antes

Existem documentos de venda com total e montante recebido, mas ainda não há registo auditável de recebimentos.

## Estado depois

Cada recebimento fica ligado ao documento de venda, atualiza o montante recebido e fecha o documento apenas quando o total fica liquidado.

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

- Fluxo: `FLOW-MF1-RECEIPTS`
- Endpoint principal: `/api/sales/documents/:id/receipts`
- Módulo backend: `apps/api/src/modules/receipts/`
- Cliente frontend: `apps/web/src/lib/receiptApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.

## Ficheiros a criar/editar/rever

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/receipts/`
- `apps/api/src/server.js`
- `apps/web/src/lib/receiptApi.ts`
- `apps/web/src/pages/ReceiptsPage.tsx`
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

Garantir que BK-MF1-03 implementa apenas RF15, com dependências, owner, prioridade e próximo BK iguais aos documentos canónicos.

2. Ficheiros envolvidos:
- CRIAR: nenhum ficheiro neste passo.
- EDITAR: nenhum ficheiro neste passo.
- REVER: documentos canónicos listados nos pré-requisitos.
- LOCALIZAÇÃO: topo deste guia e matriz/backlog.

3. Instruções do que fazer.

Confirmar que o BK é `BK-MF1-03`, requisito `RF15`, dependências `-`, sprint `S03-S04` e próximo BK `BK-MF1-04`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-03
macro=MF1
rf=RF15
endpoint=/api/sales/documents/:id/receipts
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

Criar a persistência e as regras backend para tesouraria de vendas, com validação, transações e isolamento por empresa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/receipts/` com service e routes.
- EDITAR: `apps/api/prisma/schema.prisma` e `apps/api/src/server.js`.
- REVER: BKs dependentes da MF0/MF1 indicados no header.
- LOCALIZAÇÃO: modelos Prisma no domínio correspondente e rota montada em `/api/sales/documents/:id/receipts`.

3. Instruções do que fazer.

Aplicar o schema, criar migration, implementar service antes da rota, usar `companyId` do contexto e devolver erros HTTP normalizados. Montar a rota em `server.js` junto das restantes rotas da app.

4. Código completo, correto e integrado com a app final.

Localização: `apps/api/prisma/schema.prisma`.

```prisma
enum ReceiptMethod {
  CASH
  BANK_TRANSFER
  CARD
  OTHER
}

model Receipt {
  id             String        @id @default(uuid())
  companyId      String
  saleDocumentId String
  amountCents    Int
  receivedAt     DateTime
  method         ReceiptMethod
  reference      String?
  notes          String?
  createdById    String
  createdAt      DateTime      @default(now())

  company      Company      @relation(fields: [companyId], references: [id])
  saleDocument SaleDocument @relation(fields: [saleDocumentId], references: [id])

  @@index([companyId, receivedAt])
  @@index([saleDocumentId])
}
```

Localização: `apps/api/src/modules/receipts/receiptService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const methods = new Set(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]);

function parseReceiptInput(input) {
    if (!input || typeof input !== "object") throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    const amountCents = Number(input.amountCents);
    const receivedAt = new Date(input.receivedAt);
    const method = String(input.method ?? "").toUpperCase();
    if (!Number.isInteger(amountCents) || amountCents <= 0) throw httpError(400, "INVALID_AMOUNT", "Valor recebido invalido");
    if (Number.isNaN(receivedAt.getTime())) throw httpError(400, "INVALID_DATE", "Data de recebimento invalida");
    if (!methods.has(method)) throw httpError(400, "INVALID_METHOD", "Metodo de recebimento invalido");
    return { amountCents, receivedAt, method, reference: String(input.reference ?? "").trim() || null, notes: String(input.notes ?? "").trim() || null };
}

export async function registerReceipt(prisma, companyId, userId, saleDocumentId, input) {
    const data = parseReceiptInput(input);
    await assertOpenFiscalPeriod(prisma, companyId, data.receivedAt);

    return prisma.$transaction(async (tx) => {
        const document = await tx.saleDocument.findFirst({ where: { id: saleDocumentId, companyId } });
        if (!document) throw httpError(404, "SALE_DOCUMENT_NOT_FOUND", "Documento de venda nao encontrado");
        const openAmount = document.totalCents - document.amountPaidCents;
        if (openAmount <= 0) throw httpError(409, "DOCUMENT_ALREADY_SETTLED", "Documento ja liquidado");
        if (data.amountCents > openAmount) throw httpError(400, "AMOUNT_EXCEEDS_OPEN", "Valor excede o montante em aberto");

        const receipt = await tx.receipt.create({ data: { ...data, companyId, saleDocumentId, createdById: userId } });
        const nextPaid = document.amountPaidCents + data.amountCents;
        await tx.saleDocument.update({ where: { id: document.id }, data: { amountPaidCents: nextPaid, status: nextPaid === document.totalCents ? "SETTLED" : document.status } });
        return receipt;
    });
}
```

Localização: `apps/api/src/modules/receipts/receiptRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { registerReceipt } from "./receiptService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildReceiptRoutes({ prisma }) {
    const router = Router({ mergeParams: true });
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL")];

    router.post("/:id/receipts", guards, async (req, res) => {
        try { return res.status(201).json({ data: await registerReceipt(prisma, req.companyId, req.user.id, req.params.id, req.body) }); }
        catch (error) { return sendError(res, error); }
    });

    return router;
}
```

Localização: editar `apps/api/src/server.js`.

```js
import { buildReceiptRoutes } from "./modules/receipts/receiptRoutes.js";

app.use("/api/sales/documents", buildReceiptRoutes({ prisma }));
```

5. Explicação do código.

O schema define as invariantes persistentes. O service concentra validação, cálculo, transações e regras de estado. A route só trata transporte HTTP, autenticação, contexto de empresa e resposta. Esta separação facilita testes e reduz regressões entre MF1 e MF3.

6. Validação do passo.

Executar teste unitário do service, teste de contrato do endpoint `/api/sales/documents/:id/receipts` e confirmar que todos os registos criados pertencem a `req.companyId`.

7. Cenário negativo/erro esperado.

Entrada inválida deve falhar antes do Prisma; estado inválido deve devolver `409`; ausência de recurso dentro da empresa ativa deve devolver `404`.

### Passo 3 - Implementar frontend, testes e handoff

1. Objetivo funcional do passo no ERP.

Disponibilizar a operação ao utilizador, com cliente API tipado, estados de carregamento/erro/sucesso e evidência que permita revisão técnica.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/lib/receiptApi.ts` e página/componente do domínio.
- EDITAR: rotas frontend existentes, se a app já tiver router.
- REVER: `apps/web/src/lib/apiClient.ts` e componentes de formulário/listagem já usados na MF0.
- LOCALIZAÇÃO: módulo visual correspondente à operação da MF1.

3. Instruções do que fazer.

Criar funções de API tipadas, consumir erros normalizados do backend e mostrar mensagens claras. Não recalcular no frontend valores que o backend já calcula como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Localização: `apps/web/src/lib/receiptApi.ts`.

```ts
import { apiClient } from "./apiClient";

export type ReceiptInput = { amountCents: number; receivedAt: string; method: "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER"; reference?: string; notes?: string };

export async function registerReceipt(saleDocumentId: string, input: ReceiptInput) {
    return apiClient.post("/api/sales/documents/" + saleDocumentId + "/receipts", input);
}
```

Localização: teste unitário ou de contrato do service.

```js
it("bloqueia recebimento superior ao valor em aberto", async () => {
    await expect(registerReceipt(prisma, companyId, userId, saleDocumentId, { amountCents: 999999, receivedAt: "2026-05-31", method: "BANK_TRANSFER" }))
        .rejects.toMatchObject({ status: 400, code: "AMOUNT_EXCEEDS_OPEN" });
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

- Cada recebimento fica ligado ao documento de venda, atualiza o montante recebido e fecha o documento apenas quando o total fica liquidado.
- Endpoint `/api/sales/documents/:id/receipts` protegido e filtrado por empresa.
- Testes cobrem pelo menos um caso feliz e três cenários negativos relevantes.
- Evidência lista schema, services, rotas, UI e comandos executados.

## Critérios de aceite

- RF15 fica coberto sem alterar o contrato canónico do BK.
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

O `BK-MF1-04` pode contabilizar vendas já emitidas; `BK-MF3-04` deve reutilizar recebimentos para entradas futuras e realizadas.

## Changelog

- `2026-05-31`: Guia corrigido no modo `corrigir_apenas`, com contrato técnico completo, código por camada, validações e handoff MF1.
