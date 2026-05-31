# BK-MF1-07 - Registar Fatura de Fornecedor e Nota de Crédito.

## Header

- `doc_id`: `GUIA-BK-MF1-07`
- `bk_id`: `BK-MF1-07`
- `macro`: `MF1`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-10, BK-MF0-11, BK-MF1-01`
- `rf_rnf`: `RF19`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-08`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-07-registar-fatura-de-fornecedor-e-nota-de-credito.md`
- `last_updated`: `2026-05-31`

## Objetivo

Executar RF19 para compras, seguindo os documentos canónicos e a stack contratada: React + Vite + TypeScript no frontend, Node.js + Express em ES Modules no backend, PostgreSQL e Prisma/equivalente na persistência.

## Importância funcional e pedagógica

Este BK transforma o requisito RF19 num caminho de implementação rastreável. Funcionalmente, fecha uma operação essencial da MF1; pedagogicamente, mostra como ligar requisito, modelo de dados, service, rota HTTP, UI, testes e evidência sem inventar regras fora dos documentos canónicos.

## Scope-in

- Fatura de fornecedor e nota de crédito.
- Validação de fornecedor, artigos e IVA.
- Número do fornecedor único por fornecedor e empresa.
- Estado inicial registado.

## Scope-out

- Pagamento, que pertence a `BK-MF1-08`.
- Contabilização, que pertence a `BK-MF1-09`.

## Estado antes

Existem fornecedores, artigos e IVA, mas ainda não há documento de compra com linhas e totais.

## Estado depois

A aplicação regista faturas e notas de crédito de fornecedor por empresa, com número do fornecedor único e totais calculados no backend.

## Pré-requisitos

- Ler `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` e `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
- Confirmar que autenticação, contexto de empresa, roles/permissões e erros HTTP da MF0 estão disponíveis.
- Confirmar dependências canónicas: `BK-MF0-10, BK-MF0-11, BK-MF1-01`.
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

- Fluxo: `FLOW-MF1-PURCHASE-DOCUMENTS`
- Endpoint principal: `/api/purchases/documents`
- Módulo backend: `apps/api/src/modules/purchases/`
- Cliente frontend: `apps/web/src/lib/purchasesApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.

## Ficheiros a criar/editar/rever

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/purchases/`
- `apps/api/src/server.js`
- `apps/web/src/lib/purchasesApi.ts`
- `apps/web/src/pages/PurchaseDocumentsPage.tsx`
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

Garantir que BK-MF1-07 implementa apenas RF19, com dependências, owner, prioridade e próximo BK iguais aos documentos canónicos.

2. Ficheiros envolvidos:
- CRIAR: nenhum ficheiro neste passo.
- EDITAR: nenhum ficheiro neste passo.
- REVER: documentos canónicos listados nos pré-requisitos.
- LOCALIZAÇÃO: topo deste guia e matriz/backlog.

3. Instruções do que fazer.

Confirmar que o BK é `BK-MF1-07`, requisito `RF19`, dependências `BK-MF0-10, BK-MF0-11, BK-MF1-01`, sprint `S03-S04` e próximo BK `BK-MF1-08`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-07
macro=MF1
rf=RF19
endpoint=/api/purchases/documents
deps=BK-MF0-10, BK-MF0-11, BK-MF1-01
```

5. Explicação do código.

Este bloco não é executado pela app; é o contrato mínimo que impede drift antes de editar código. A execução real começa no passo seguinte.

6. Validação do passo.

Comparar header do guia com `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`. Qualquer divergência bloqueia a implementação.

7. Cenário negativo/erro esperado.

Se surgir uma regra sem fonte documental, não a transformar em requisito; registar a incerteza na evidência e pedir decisão ao responsável.

### Passo 2 - Implementar dados e backend

1. Objetivo funcional do passo no ERP.

Criar a persistência e as regras backend para compras, com validação, transações e isolamento por empresa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/purchases/` com service e routes.
- EDITAR: `apps/api/prisma/schema.prisma` e `apps/api/src/server.js`.
- REVER: BKs dependentes da MF0/MF1 indicados no header.
- LOCALIZAÇÃO: modelos Prisma no domínio correspondente e rota montada em `/api/purchases/documents`.

3. Instruções do que fazer.

Aplicar o schema, criar migration, implementar service antes da rota, usar `companyId` do contexto e devolver erros HTTP normalizados. Montar a rota em `server.js` junto das restantes rotas da app.

4. Código completo, correto e integrado com a app final.

Localização: `apps/api/prisma/schema.prisma`.

```prisma
enum PurchaseDocumentKind {
  SUPPLIER_INVOICE
  SUPPLIER_CREDIT_NOTE
}

enum PurchaseDocumentStatus {
  DRAFT
  REGISTERED
  APPROVED
  POSTED
  PAID
}

model PurchaseDocument {
  id              String                 @id @default(uuid())
  companyId       String
  supplierId      String
  kind            PurchaseDocumentKind
  status          PurchaseDocumentStatus @default(REGISTERED)
  supplierNumber  String
  issuedAt        DateTime
  dueDate         DateTime?
  subtotalCents   Int
  vatCents        Int
  totalCents      Int
  amountPaidCents Int                    @default(0)
  createdById     String
  createdAt       DateTime               @default(now())
  updatedAt       DateTime               @updatedAt

  company  Company  @relation(fields: [companyId], references: [id])
  supplier Supplier @relation(fields: [supplierId], references: [id])
  lines    PurchaseDocumentLine[]

  @@unique([companyId, supplierId, supplierNumber])
  @@index([companyId, supplierId, issuedAt])
}

model PurchaseDocumentLine {
  id                 String @id @default(uuid())
  purchaseDocumentId String
  itemId             String
  vatRateId          String
  description        String
  quantity           Int
  unitCostCents      Int
  subtotalCents      Int
  vatCents           Int
  totalCents         Int

  purchaseDocument PurchaseDocument @relation(fields: [purchaseDocumentId], references: [id])
  item             Item             @relation(fields: [itemId], references: [id])
  vatRate          VatRate          @relation(fields: [vatRateId], references: [id])
}
```

Localização: `apps/api/src/modules/purchases/purchaseDocumentService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const kinds = new Set(["SUPPLIER_INVOICE", "SUPPLIER_CREDIT_NOTE"]);

function parseLine(line) {
    const quantity = Number(line.quantity);
    const unitCostCents = Number(line.unitCostCents);
    if (!line.itemId) throw httpError(400, "INVALID_ITEM", "Artigo obrigatorio");
    if (!line.vatRateId) throw httpError(400, "INVALID_VAT", "Taxa de IVA obrigatoria");
    if (!Number.isInteger(quantity) || quantity <= 0) throw httpError(400, "INVALID_QUANTITY", "Quantidade invalida");
    if (!Number.isInteger(unitCostCents) || unitCostCents < 0) throw httpError(400, "INVALID_COST", "Custo invalido");
    return { itemId: line.itemId, vatRateId: line.vatRateId, description: String(line.description ?? "").trim(), quantity, unitCostCents };
}

export async function createPurchaseDocument(prisma, companyId, userId, input) {
    if (!input || typeof input !== "object") throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    const kind = String(input.kind ?? "").toUpperCase();
    if (!kinds.has(kind)) throw httpError(400, "INVALID_KIND", "Tipo de compra invalido");
    const supplierNumber = String(input.supplierNumber ?? "").trim();
    if (!supplierNumber) throw httpError(400, "INVALID_SUPPLIER_NUMBER", "Numero do fornecedor obrigatorio");
    const issuedAt = new Date(input.issuedAt);
    if (Number.isNaN(issuedAt.getTime())) throw httpError(400, "INVALID_DATE", "Data invalida");
    const lines = Array.isArray(input.lines) ? input.lines.map(parseLine) : [];
    if (lines.length === 0) throw httpError(400, "EMPTY_LINES", "Documento sem linhas");
    await assertOpenFiscalPeriod(prisma, companyId, issuedAt);

    return prisma.$transaction(async (tx) => {
        const supplier = await tx.supplier.findFirst({ where: { id: input.supplierId, companyId, isActive: true } });
        if (!supplier) throw httpError(404, "SUPPLIER_NOT_FOUND", "Fornecedor nao encontrado");
        const vatRates = await tx.vatRate.findMany({ where: { id: { in: lines.map((line) => line.vatRateId) }, companyId, isActive: true } });
        const vatById = new Map(vatRates.map((rate) => [rate.id, rate]));
        const computedLines = lines.map((line) => {
            const vatRate = vatById.get(line.vatRateId);
            if (!vatRate) throw httpError(400, "VAT_RATE_NOT_FOUND", "Taxa de IVA invalida");
            const subtotalCents = line.quantity * line.unitCostCents;
            const vatCents = Math.round(subtotalCents * vatRate.rateBps / 10000);
            return { ...line, subtotalCents, vatCents, totalCents: subtotalCents + vatCents };
        });
        const subtotalCents = computedLines.reduce((sum, line) => sum + line.subtotalCents, 0);
        const vatCents = computedLines.reduce((sum, line) => sum + line.vatCents, 0);
        return tx.purchaseDocument.create({ data: { companyId, supplierId: supplier.id, kind, status: "REGISTERED", supplierNumber, issuedAt, dueDate: input.dueDate ? new Date(input.dueDate) : null, subtotalCents, vatCents, totalCents: subtotalCents + vatCents, createdById: userId, lines: { create: computedLines } }, include: { supplier: true, lines: true } });
    });
}
```

Localização: `apps/api/src/modules/purchases/purchaseDocumentRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { createPurchaseDocument } from "./purchaseDocumentService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildPurchaseDocumentRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL")];
    router.post("/", guards, async (req, res) => {
        try { return res.status(201).json({ data: await createPurchaseDocument(prisma, req.companyId, req.user.id, req.body) }); } catch (error) { return sendError(res, error); }
    });
    router.get("/", guards, async (req, res) => {
        try { return res.status(200).json({ data: await prisma.purchaseDocument.findMany({ where: { companyId: req.companyId }, include: { supplier: true, lines: true }, orderBy: { issuedAt: "desc" } }) }); } catch (error) { return sendError(res, error); }
    });
    return router;
}
```

Localização: editar `apps/api/src/server.js`.

```js
import { buildPurchaseDocumentRoutes } from "./modules/purchases/purchaseDocumentRoutes.js";

app.use("/api/purchases/documents", buildPurchaseDocumentRoutes({ prisma }));
```

5. Explicação do código.

O schema define as invariantes persistentes. O service concentra validação, cálculo, transações e regras de estado. A route só trata transporte HTTP, autenticação, contexto de empresa e resposta. Esta separação facilita testes e reduz regressões entre MF1 e MF3.

6. Validação do passo.

Executar teste unitário do service, teste de contrato do endpoint `/api/purchases/documents` e confirmar que todos os registos criados pertencem a `req.companyId`.

7. Cenário negativo/erro esperado.

Entrada inválida deve falhar antes do Prisma; estado inválido deve devolver `409`; ausência de recurso dentro da empresa ativa deve devolver `404`.

### Passo 3 - Implementar frontend, testes e handoff

1. Objetivo funcional do passo no ERP.

Disponibilizar a operação ao utilizador, com cliente API tipado, estados de carregamento/erro/sucesso e evidência que permita revisão técnica.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/lib/purchasesApi.ts` e página/componente do domínio.
- EDITAR: rotas frontend existentes, se a app já tiver router.
- REVER: `apps/web/src/lib/apiClient.ts` e componentes de formulário/listagem já usados na MF0.
- LOCALIZAÇÃO: módulo visual correspondente à operação da MF1.

3. Instruções do que fazer.

Criar funções de API tipadas, consumir erros normalizados do backend e mostrar mensagens claras. Não recalcular no frontend valores que o backend já calcula como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Localização: `apps/web/src/lib/purchasesApi.ts`.

```ts
import { apiClient } from "./apiClient";

export type PurchaseDocumentInput = { kind: "SUPPLIER_INVOICE" | "SUPPLIER_CREDIT_NOTE"; supplierId: string; supplierNumber: string; issuedAt: string; dueDate?: string; lines: Array<{ itemId: string; vatRateId: string; description: string; quantity: number; unitCostCents: number }> };

export async function createPurchaseDocument(input: PurchaseDocumentInput) {
    return apiClient.post("/api/purchases/documents", input);
}
```

Localização: teste unitário ou de contrato do service.

```js
it("rejeita numero duplicado para o mesmo fornecedor", async () => {
    await createPurchaseDocument(prisma, companyId, userId, validPurchaseInput);
    await expect(createPurchaseDocument(prisma, companyId, userId, validPurchaseInput))
        .rejects.toMatchObject({ status: 409 });
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

- A aplicação regista faturas e notas de crédito de fornecedor por empresa, com número do fornecedor único e totais calculados no backend.
- Endpoint `/api/purchases/documents` protegido e filtrado por empresa.
- Testes cobrem pelo menos um caso feliz e três cenários negativos relevantes.
- Evidência lista schema, services, rotas, UI e comandos executados.

## Critérios de aceite

- RF19 fica coberto sem alterar o contrato canónico do BK.
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

O `BK-MF1-08` usa `PurchaseDocument.totalCents`, `amountPaidCents` e `status` para registar pagamentos.

## Changelog

- `2026-05-31`: Guia corrigido no modo `corrigir_apenas`, com contrato técnico completo, código por camada, validações e handoff MF1.
