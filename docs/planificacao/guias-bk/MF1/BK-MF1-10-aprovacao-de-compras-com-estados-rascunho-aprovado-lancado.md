# BK-MF1-10 - Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.

## Header

- `doc_id`: `GUIA-BK-MF1-10`
- `bk_id`: `BK-MF1-10`
- `macro`: `MF1`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF22`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-01`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-10-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md`
- `last_updated`: `2026-05-31`

## Objetivo

Executar RF22 para aprovação de compras, seguindo os documentos canónicos e a stack contratada: React + Vite + TypeScript no frontend, Node.js + Express em ES Modules no backend, PostgreSQL e Prisma/equivalente na persistência.

## Importância funcional e pedagógica

Este BK transforma o requisito RF22 num caminho de implementação rastreável. Funcionalmente, fecha uma operação essencial da MF1; pedagogicamente, mostra como ligar requisito, modelo de dados, service, rota HTTP, UI, testes e evidência sem inventar regras fora dos documentos canónicos.

## Scope-in

- Estado rascunho, aprovado e lançado.
- Aprovação por gestor/administrador.
- Marcação de lançado por contabilista/administrador.
- Bloqueio de transições inválidas.

## Scope-out

- Histórico detalhado de aprovações, que pertence a `BK-MF2-01`.
- Notificações.

## Estado antes

As compras podem ser registadas e contabilizadas, mas o requisito pede estados claros de rascunho, aprovado e lançado.

## Estado depois

A compra tem transições controladas: DRAFT para APPROVED e APPROVED para POSTED, com utilizador e data.

## Pré-requisitos

- Ler `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` e `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
- Confirmar que autenticação, contexto de empresa, roles/permissões e erros HTTP da MF0 estão disponíveis.
- Confirmar dependências canónicas: `-`.
- Nunca receber `companyId` do corpo do pedido; usar sempre o contexto autenticado.

## Fundamentação documental

- `CANONICO`: `RF22` exige estados base `Rascunho -> Aprovado -> Lançado` nas compras.
- `CANONICO`: `RF47` e `RNF17` exigem auditoria em aprovações e lançamentos.
- `DERIVADO`: os endpoints específicos `/approve` e `/post-state` tornam a intenção explícita e evitam um endpoint genérico com ações ambíguas.
- `DERIVADO`: `markPurchaseDocumentPosted` reutiliza `postPurchaseDocumentInTransaction` do `BK-MF1-09` para manter diário, estado e auditoria na mesma transação.

## Glossário

- **Documento canónico:** fonte documental que define RF/RNF, BK, owner, dependências e prioridade.
- **Service:** camada backend onde ficam regras de negócio e transações.
- **Validator:** função que rejeita entrada inválida antes de persistir dados.
- **Evidência:** registo objetivo de ficheiros alterados, comandos executados e resultado obtido.

## Conceitos teóricos essenciais

- **Workflow de compra:** controla `DRAFT -> APPROVED -> POSTED`; vem do RF22 e separa registo, aprovacao e lancamento.
- **Rascunho:** permite preparar a compra sem impacto final ate ser revista.
- **Aprovado:** significa que gestor/administrador validou a compra para seguir para pagamento ou contabilizacao.
- **Lancado:** significa que existe `JournalEntry`; nao e apenas uma etiqueta de UI.
- **Transicao com BK-MF1-07:** a partir deste BK, novas compras devem nascer `DRAFT` para respeitar o workflow formal.
- **Auditoria:** cada aprovacao/lancamento regista utilizador e acao em `AuditLog`.
- **Segregacao de funcoes:** gestor aprova e contabilista lanca; o backend aplica roles.
- **Handoff:** BK-MF2-01 pode acrescentar historico detalhado e justificacoes.

## Arquitetura do BK

- Fluxo: `FLOW-MF1-PURCHASE-APPROVAL`
- Endpoints principais: `/api/purchases/documents/:id/approve` e `/api/purchases/documents/:id/post-state`
- Módulo backend: `apps/api/src/modules/purchase-approval/`
- Cliente frontend: `apps/web/src/lib/purchaseApprovalApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.

## Ficheiros a criar/editar/rever

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/purchase-approval/`
- `apps/api/src/server.js`
- `apps/web/src/lib/purchaseApprovalApi.ts`
- `apps/web/src/pages/PurchaseApprovalPage.tsx`
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

Garantir que BK-MF1-10 implementa apenas RF22, com dependências, owner, prioridade e próximo BK iguais aos documentos canónicos.

2. Ficheiros envolvidos:
- CRIAR: nenhum ficheiro neste passo.
- EDITAR: nenhum ficheiro neste passo.
- REVER: documentos canónicos listados nos pré-requisitos.
- LOCALIZAÇÃO: topo deste guia e matriz/backlog.

3. Instruções do que fazer.

Confirmar que o BK é `BK-MF1-10`, requisito `RF22`, dependências `-`, sprint `S03-S04` e próximo BK `BK-MF2-01`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-10
macro=MF1
rf=RF22
endpoints=/api/purchases/documents/:id/approve,/api/purchases/documents/:id/post-state
deps=-
```

5. Explicação do código.

As chaves acima formalizam o contrato mínimo do BK e devem bater certo com a matriz antes de qualquer alteração de código.

6. Validação do passo.

Comparar header do guia com `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`. Qualquer divergência bloqueia a implementação.

7. Cenário negativo/erro esperado.

Se surgir uma regra sem fonte documental, não a transformar em requisito; registar a incerteza na evidência e pedir decisão ao responsável.

### Passo 2 - Implementar dados e backend

1. Objetivo funcional do passo no ERP.

Criar a persistência e as regras backend para aprovação de compras, com validação, transações e isolamento por empresa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/purchase-approval/` com service e routes.
- EDITAR: `apps/api/prisma/schema.prisma`, `apps/api/src/modules/purchases/purchaseDocumentService.js` e `apps/api/src/server.js`.
- REVER: `AuditLog` criado no `BK-MF1-02` e `postPurchaseDocumentInTransaction` criado no `BK-MF1-09`.
- LOCALIZAÇÃO: modelos Prisma no domínio correspondente e rotas montadas em `/api/purchases/documents/:id/approve` e `/api/purchases/documents/:id/post-state`.

3. Instruções do que fazer.

Aplicar o schema, criar migration, implementar service antes da rota, usar `companyId` do contexto e devolver erros HTTP normalizados. Montar a rota em `server.js` junto das restantes rotas da app.

4. Código completo, correto e integrado com a app final.

Localização: `apps/api/prisma/schema.prisma`.

```prisma
enum PurchaseDocumentStatus {
  DRAFT
  APPROVED
  POSTED
  PAID
}

model PurchaseDocument {
  id              String                 @id @default(uuid())
  companyId       String
  supplierId      String
  kind            PurchaseDocumentKind
  status          PurchaseDocumentStatus @default(DRAFT)
  supplierNumber  String
  issuedAt        DateTime
  dueDate         DateTime?
  subtotalCents   Int
  vatCents        Int
  totalCents      Int
  amountPaidCents Int                    @default(0)
  createdById     String
  approvedAt      DateTime?
  approvedById    String?
  postedAt        DateTime?
  postedById      String?
  payments        Payment[]
  createdAt       DateTime               @default(now())
  updatedAt       DateTime               @updatedAt

  company  Company  @relation(fields: [companyId], references: [id])
  supplier Supplier @relation(fields: [supplierId], references: [id])
  lines    PurchaseDocumentLine[]

  @@unique([companyId, supplierId, supplierNumber])
  @@index([companyId, status, issuedAt])
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
    const dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (dueDate && Number.isNaN(dueDate.getTime())) throw httpError(400, "INVALID_DUE_DATE", "Data de vencimento invalida");
    const lines = Array.isArray(input.lines) ? input.lines.map(parseLine) : [];
    if (lines.length === 0) throw httpError(400, "EMPTY_LINES", "Documento sem linhas");
    await assertOpenFiscalPeriod(prisma, { companyId, documentDate: issuedAt });

    return prisma.$transaction(async (tx) => {
        const supplier = await tx.supplier.findFirst({ where: { id: input.supplierId, companyId, isActive: true } });
        if (!supplier) throw httpError(404, "SUPPLIER_NOT_FOUND", "Fornecedor nao encontrado");
        const itemIds = [...new Set(lines.map((line) => line.itemId))];
        const vatRateIds = [...new Set(lines.map((line) => line.vatRateId))];
        const items = await tx.item.findMany({ where: { id: { in: itemIds }, companyId, isActive: true } });
        const vatRates = await tx.vatRate.findMany({ where: { id: { in: vatRateIds }, companyId, isActive: true } });
        const itemById = new Map(items.map((item) => [item.id, item]));
        const vatById = new Map(vatRates.map((rate) => [rate.id, rate]));
        const computedLines = lines.map((line) => {
            const item = itemById.get(line.itemId);
            const vatRate = vatById.get(line.vatRateId);
            if (!item) throw httpError(400, "ITEM_NOT_FOUND", "Artigo invalido para esta empresa");
            if (!vatRate) throw httpError(400, "VAT_RATE_NOT_FOUND", "Taxa de IVA invalida");
            const subtotalCents = line.quantity * line.unitCostCents;
            const vatCents = Math.round(subtotalCents * vatRate.rateBps / 10000);
            return { ...line, subtotalCents, vatCents, totalCents: subtotalCents + vatCents };
        });
        const subtotalCents = computedLines.reduce((sum, line) => sum + line.subtotalCents, 0);
        const vatCents = computedLines.reduce((sum, line) => sum + line.vatCents, 0);

        try {
            const document = await tx.purchaseDocument.create({
                data: {
                    companyId,
                    supplierId: supplier.id,
                    kind,
                    status: "DRAFT",
                    supplierNumber,
                    issuedAt,
                    dueDate,
                    subtotalCents,
                    vatCents,
                    totalCents: subtotalCents + vatCents,
                    createdById: userId,
                    lines: { create: computedLines },
                },
                include: { supplier: true, lines: true },
            });
            await tx.auditLog.create({
                data: {
                    companyId,
                    userId,
                    action: "PURCHASE_DOCUMENT_CREATED",
                    entity: "PurchaseDocument",
                    entityId: document.id,
                    details: { supplierId: supplier.id, supplierNumber, status: "DRAFT", totalCents: document.totalCents },
                },
            });
            return document;
        } catch (error) {
            if (error.code === "P2002") throw httpError(409, "PURCHASE_DOCUMENT_EXISTS", "Numero de fornecedor ja existe nesta empresa");
            throw error;
        }
    });
}
```

Localização: `apps/api/src/modules/purchase-approval/purchaseApprovalService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { postPurchaseDocumentInTransaction } from "../accounting/purchasePostingService.js";

async function findPurchaseDocument(prisma, companyId, id) {
    const document = await prisma.purchaseDocument.findFirst({ where: { id, companyId } });
    if (!document) throw httpError(404, "PURCHASE_DOCUMENT_NOT_FOUND", "Documento de compra nao encontrado");
    return document;
}

async function recordPurchaseApprovalAudit(tx, companyId, userId, purchaseDocumentId, action) {
    await tx.auditLog.create({
        data: { companyId, userId, action, entity: "PurchaseDocument", entityId: purchaseDocumentId },
    });
}

export async function approvePurchaseDocument(prisma, companyId, userId, id) {
    const document = await findPurchaseDocument(prisma, companyId, id);
    if (document.status !== "DRAFT") throw httpError(409, "INVALID_STATUS", "Apenas rascunhos podem ser aprovados");
    return prisma.$transaction(async (tx) => {
        const updated = await tx.purchaseDocument.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date(), approvedById: userId } });
        await recordPurchaseApprovalAudit(tx, companyId, userId, id, "PURCHASE_DOCUMENT_APPROVED");
        return updated;
    });
}

export async function markPurchaseDocumentPosted(prisma, companyId, userId, id) {
    return prisma.$transaction(async (tx) => {
        const document = await findPurchaseDocument(tx, companyId, id);
        if (document.status !== "APPROVED") throw httpError(409, "INVALID_STATUS", "Apenas compras aprovadas podem ser lancadas");
        const entry = await postPurchaseDocumentInTransaction(tx, companyId, userId, id);
        // O estado POSTED só fica registado depois de existir diário contabilístico.
        await tx.purchaseDocument.update({ where: { id }, data: { postedAt: new Date(), postedById: userId } });
        await recordPurchaseApprovalAudit(tx, companyId, userId, id, "PURCHASE_DOCUMENT_POSTED");
        return entry;
    });
}
```

Localização: `apps/api/src/modules/purchase-approval/purchaseApprovalRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { approvePurchaseDocument, markPurchaseDocumentPosted } from "./purchaseApprovalService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildPurchaseApprovalRoutes({ prisma }) {
    const router = Router();
    router.post("/:id/approve", requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR"), async (req, res) => {
        try {
            const data = await approvePurchaseDocument(prisma, req.companyId, req.user.id, req.params.id);
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    router.post("/:id/post-state", requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "CONTABILISTA"), async (req, res) => {
        try {
            const data = await markPurchaseDocumentPosted(prisma, req.companyId, req.user.id, req.params.id);
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    return router;
}
```

Localização: editar `apps/api/src/server.js`.

```js
import { buildPurchaseApprovalRoutes } from "./modules/purchase-approval/purchaseApprovalRoutes.js";

app.use("/api/purchases/documents", buildPurchaseApprovalRoutes({ prisma }));
```

5. Explicação do código.

O schema define as invariantes persistentes. A partir deste BK, o service de compras criado no `BK-MF1-07` deve passar a criar compras em `DRAFT`, porque a aprovação formal já existe. O service de aprovação só muda `DRAFT` para `APPROVED`. Para lançar, reutiliza `postPurchaseDocumentInTransaction` do `BK-MF1-09` dentro da mesma transação que grava `postedAt`, `postedById` e auditoria de workflow; assim `POSTED` nunca aparece sem diário contabilístico nem diário fica separado da auditoria. A route só trata transporte HTTP, autenticação, contexto de empresa e resposta.

6. Validação do passo.

Executar teste unitário do service, teste de contrato dos endpoints `/approve` e `/post-state`, e confirmar que `/post-state` cria `JournalEntry` antes de marcar metadados de lançamento.

7. Cenário negativo/erro esperado.

Entrada inválida deve falhar antes do Prisma; estado inválido deve devolver `409`; ausência de recurso dentro da empresa ativa deve devolver `404`.

### Passo 3 - Implementar frontend, testes e handoff

1. Objetivo funcional do passo no ERP.

Disponibilizar a operação ao utilizador, com cliente API tipado, estados de carregamento/erro/sucesso e evidência que permita revisão técnica.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/lib/purchaseApprovalApi.ts` e página/componente do domínio.
- EDITAR: rotas frontend existentes, se a app já tiver router.
- REVER: `apps/web/src/lib/apiClient.ts` e componentes de formulário/listagem já usados na MF0.
- LOCALIZAÇÃO: módulo visual correspondente à operação da MF1.

3. Instruções do que fazer.

Criar funções de API tipadas, consumir erros normalizados do backend e mostrar mensagens claras. Não recalcular no frontend valores que o backend já calcula como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Localização: `apps/web/src/lib/purchaseApprovalApi.ts`.

```ts
import { apiClient } from "./apiClient";

export async function approvePurchaseDocument(id: string) {
    return apiClient.post("/api/purchases/documents/" + id + "/approve", {});
}
export async function markPurchaseDocumentPosted(id: string) {
    return apiClient.post("/api/purchases/documents/" + id + "/post-state", {});
}
```

Localização: `apps/web/src/pages/PurchaseApprovalPage.tsx`.

```tsx
// apps/web/src/pages/PurchaseApprovalPage.tsx
import { useState } from "react";
import { approvePurchaseDocument, markPurchaseDocumentPosted } from "../lib/purchaseApprovalApi";

export function PurchaseApprovalPage() {
    const [purchaseDocumentId, setPurchaseDocumentId] = useState("");
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function runAction(action: "approve" | "post") {
        setError(null);
        setSuccess(null);
        if (!purchaseDocumentId.trim()) {
            setError("Indica o documento de compra.");
            return;
        }
        setLoadingAction(action);
        try {
            if (action === "approve") await approvePurchaseDocument(purchaseDocumentId.trim());
            if (action === "post") await markPurchaseDocumentPosted(purchaseDocumentId.trim());
            setSuccess(action === "approve" ? "Compra aprovada com sucesso." : "Compra lancada com diario contabilistico.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nao foi possivel atualizar a compra.");
        } finally {
            setLoadingAction(null);
        }
    }

    return (
        <main>
            <h1>Aprovacao de compras</h1>
            <input value={purchaseDocumentId} onChange={(event) => setPurchaseDocumentId(event.target.value)} placeholder="ID do documento de compra" />
            <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("approve")}>Aprovar</button>
            <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("post")}>Marcar como lancada</button>
            {loadingAction && <p>A processar...</p>}
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}
```

Localização: `apps/api/src/modules/purchase-approval/purchaseApprovalService.test.js`.

```js
import test from "node:test";
import assert from "node:assert/strict";
import { markPurchaseDocumentPosted } from "./purchaseApprovalService.js";

test("impede lancar compra antes de aprovar", async () => {
    const prisma = {
        $transaction: async (callback) => callback({
            purchaseDocument: {
                findFirst: async () => ({ id: "purchase-1", companyId: "company-1", status: "DRAFT" }),
                update: async () => assert.fail("Nao deve atualizar compra sem aprovacao"),
            },
            journalEntry: { create: async () => assert.fail("Nao deve criar diario sem aprovacao") },
            auditLog: { create: async () => assert.fail("Nao deve auditar lancamento recusado") },
        }),
    };

    await assert.rejects(
        () => markPurchaseDocumentPosted(prisma, "company-1", "user-1", "purchase-1"),
        (error) => error.status === 409 && error.code === "INVALID_STATUS",
    );
});
```

5. Explicação do código.

A pagina `PurchaseApprovalPage.tsx` fecha a parte visual deste BK: tem estado local, validacao minima, mensagens de erro/sucesso e chama endpoints reais atraves do cliente API. A UI ajuda o utilizador, mas as regras de seguranca, multiempresa e fiscalidade continuam no backend.

O cliente API mantém o contrato entre UI e backend num ponto único. Os testes focam o comportamento que protege a contabilidade: validação, transação, estado e isolamento por empresa.

6. Validação do passo.

- Correr testes unitários do módulo.
- Fazer smoke via UI ou chamada HTTP autenticada.
- Confirmar que mensagens de erro são compreensíveis e não expõem detalhes internos.

7. Cenário negativo/erro esperado.

Se o backend devolver `400`, `401`, `403`, `404` ou `409`, a UI deve mostrar erro controlado e manter o formulário/listagem num estado recuperável.

### Passo 4 - Validar regras unitárias

1. Objetivo funcional do passo no ERP.
Confirmar as transições `DRAFT -> APPROVED -> POSTED` e o bloqueio dos restantes estados.
2. Ficheiros envolvidos:
- CRIAR: testes unitários do módulo.
- EDITAR: service apenas se o teste revelar falha.
- REVER: transições, auditoria e roles.
- LOCALIZAÇÃO: testes do backend.
3. Instruções do que fazer.
Testar aprovação, lançamento e tentativa de lançar compra não aprovada.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:unit
```
5. Explicação do código.
O comando valida o ciclo de estado da compra antes do transporte HTTP.
6. Validação do passo.
Cada transição sensível cria registo de auditoria.
7. Cenário negativo/erro esperado.
Compra em `DRAFT` não pode ser lançada.

### Passo 5 - Validar contrato HTTP

1. Objetivo funcional do passo no ERP.
Garantir que os endpoints de aprovação e lançamento devolvem códigos previsíveis.
2. Ficheiros envolvidos:
- CRIAR: testes de contrato.
- EDITAR: route se o contrato HTTP não estiver normalizado.
- REVER: autenticação, empresa e permissões.
- LOCALIZAÇÃO: testes de contrato do backend.
3. Instruções do que fazer.
Cobrir sessão ausente, empresa ausente, role insuficiente e compra de outra empresa.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:contracts
```
5. Explicação do código.
O comando protege a API de compras contra regressões de segurança.
6. Validação do passo.
Erros usam o formato normalizado da app.
7. Cenário negativo/erro esperado.
Utilizador sem role autorizada deve receber `403`.

### Passo 6 - Preparar evidência

1. Objetivo funcional do passo no ERP.
Fechar o BK com prova técnica e handoff para pagamentos e relatórios.
2. Ficheiros envolvidos:
- CRIAR: nota de evidência.
- EDITAR: changelog se houver alteração real.
- REVER: critérios de aceite.
- LOCALIZAÇÃO: guia e PR.
3. Instruções do que fazer.
Registar comandos, resultados, matriz de estados e impacto em BK-MF1-08/BK-MF1-09.
4. Código completo, correto e integrado com a app final.
```bash
git diff -- docs/planificacao/guias-bk/MF1
```
5. Explicação do código.
O comando foca a revisão documental na MF1.
6. Validação do passo.
A evidência mostra que compras só são pagas e contabilizadas após o estado correto.
7. Cenário negativo/erro esperado.
Sem evidência de transições, não pedir revisão final.

## Expected results

- A compra tem transições controladas: DRAFT para APPROVED e APPROVED para POSTED, com utilizador e data.
- Endpoints `/api/purchases/documents/:id/approve` e `/api/purchases/documents/:id/post-state` protegidos e filtrados por empresa.
- Testes cobrem pelo menos um caso feliz e três cenários negativos relevantes.
- Evidência lista schema, services, rotas, UI e comandos executados.

## Critérios de aceite

- RF22 fica coberto sem alterar o contrato canónico do BK.
- Nenhum dado de outra empresa aparece na resposta.
- Entradas inválidas falham com erro previsível.
- Escritas compostas são transacionais.
- O próximo BK consegue usar os modelos e endpoints aqui definidos.

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

O `BK-MF2-01` deve acrescentar histórico e justificações às decisões de aprovação/rejeição sem alterar os estados canónicos deste BK.

## Changelog

- `2026-05-31`: Corrigida fundamentação documental, endpoints reais, atomicidade de lançamento e teste autocontido.
- `2026-05-31`: Guia consolidado com contrato técnico completo, código por camada, validações e handoff MF1.
