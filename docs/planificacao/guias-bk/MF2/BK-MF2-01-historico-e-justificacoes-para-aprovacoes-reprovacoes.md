# BK-MF2-01 - Histórico e justificações para aprovações/reprovações.

## Header

- `doc_id`: `GUIA-BK-MF2-01`
- `bk_id`: `BK-MF2-01`
- `macro`: `MF2`
- `owner`: `Sofia`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-10`
- `rf_rnf`: `RF23`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-02`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-01-historico-e-justificacoes-para-aprovacoes-reprovacoes.md`
- `last_updated`: `2026-06-08`

## Objetivo

Neste BK vais acrescentar histórico auditável às decisões de aprovação e reprovação de compras. O sistema passa a guardar quem decidiu, quando decidiu, que justificação foi dada e em que estado ficou o documento de compra.

## Importância funcional e pedagógica

RF23 fecha a rastreabilidade do workflow de compras iniciado em BK-MF1-10. Pedagogicamente, mostra a diferença entre mudar um estado e guardar uma explicação verificável dessa decisão.

## Scope-in

- Histórico de aprovações e reprovações de compras.
- Justificação obrigatória para reprovação e registável para aprovação.
- Extensão do endpoint de aprovação já criado em `BK-MF1-10`.
- Novo endpoint específico para reprovação.
- Endpoint para consultar histórico por documento de compra.
- Registo em `AuditLog` para cada decisão sensível.

## Scope-out

- Notificações por email.
- Workflow avançado com vários aprovadores.
- Alteração de compras já lançadas.
- Relatórios globais de auditoria.

## Estado antes

BK-MF1-10 já controla estados de compra com `/approve` e `/post-state`, mas ainda não grava uma tabela consultável com a justificação funcional de cada aprovação ou reprovação.

## Estado depois

O endpoint `/approve` existente passa a gravar histórico, a reprovação fica disponível em `/reject`, a consulta usa `/approval-history` e nenhuma aprovação fica duplicada em endpoint paralelo.

## Pré-requisitos

- Ler RF23 em `docs/RF.md`.
- Confirmar BK-MF1-10 e o módulo `apps/api/src/modules/purchase-approval/`.
- Confirmar que `/api/purchases/documents/:id/approve` e `/api/purchases/documents/:id/post-state` já existem e não devem ser duplicados.
- Confirmar autenticação, contexto multiempresa e roles da MF0.
- Confirmar `AuditLog` introduzido nos BKs de MF1.

## Fundamentação documental

- `CANONICO`: RF23 pede histórico e justificações mínimas para aprovações/reprovações de compras.
- `CANONICO`: BK-MF1-10 fornece o documento de compra com estados.
- `CANONICO`: BK-MF1-10 já define `/approve` como ação de aprovação e `/post-state` como ação de lançamento contabilístico.
- `DERIVADO`: o estado `REJECTED` representa reprovação sem apagar o rascunho.
- `DERIVADO`: reprovação exige texto mínimo para impedir decisões vazias.
- `DERIVADO`: a reprovação recebe endpoint próprio `/reject`, para não transformar `/approve` num endpoint ambíguo.

## Glossário

- **Aprovação:** decisão que permite a compra avançar.
- **Reprovação:** decisão que bloqueia a compra por motivo funcional.
- **Histórico:** lista imutável de decisões.
- **Justificação:** texto que explica a decisão.

## Conceitos teóricos essenciais

- **Histórico de decisão no domínio de compras:** é a sequência imutável de aprovações e reprovações de uma compra. Vem da ação de um gestor ou administrador sobre um documento de compra, é guardado em histórico persistente ligado ao documento, serve para explicar porque a compra avançou ou foi bloqueada, e evita estados alterados sem rasto para auditoria interna.
- **Justificação obrigatória na reprovação:** é o motivo funcional que acompanha uma decisão negativa. Vem do formulário de reprovação, passa pelo validador do backend, fica associada ao histórico, serve para o requisitante perceber o bloqueio, e evita reprovações opacas ou impossíveis de defender.
- **Transação de estado e histórico:** a alteração do estado da compra e a criação do histórico pertencem à mesma operação. O pedido entra pelas rotas existentes de aprovação/reprovação, segue para o service, grava estado e histórico de forma atómica, serve para manter coerência entre UI e base de dados, e evita compras reprovadas sem histórico ou histórico criado sem alteração de estado.
- **Contexto multiempresa:** `companyId` vem da sessão e nunca do corpo do pedido. A rota recebe o pedido autenticado, o service filtra por empresa ativa, a resposta só inclui dados dessa empresa, serve para separar tenants, e evita exposição ou alteração de compras de outra empresa.
- **Autorização por role:** só perfis autorizados podem decidir. A role vem da sessão, é validada no middleware e no fluxo protegido, serve para aplicar governação operacional, e evita que utilizadores sem responsabilidade aprovem compras.

## Arquitetura do BK

- Fluxo: `FLOW-MF2-PURCHASE-DECISION-HISTORY`.
- Endpoints: `POST /api/purchases/documents/:id/approve`, `POST /api/purchases/documents/:id/reject` e `GET /api/purchases/documents/:id/approval-history`.
- Backend: `apps/api/src/modules/purchase-approval/`, o mesmo módulo criado em `BK-MF1-10`.
- Frontend: editar `apps/web/src/lib/purchaseApprovalApi.ts` e `apps/web/src/pages/PurchaseApprovalPage.tsx`.

## Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/purchase-approval/purchaseApprovalHistoryValidators.js`.
- EDITAR: `apps/api/src/modules/purchase-approval/purchaseApprovalService.js`.
- EDITAR: `apps/api/src/modules/purchase-approval/purchaseApprovalRoutes.js`.
- EDITAR: `apps/web/src/lib/purchaseApprovalApi.ts`.
- EDITAR: `apps/web/src/pages/PurchaseApprovalPage.tsx`.
- EDITAR: `apps/api/prisma/schema.prisma`.
- REVER: `apps/api/src/server.js`, apenas para confirmar que o router de `BK-MF1-10` já está montado.

## Erros comuns

- Guardar justificação só no frontend.
- Criar um segundo endpoint de aprovação em vez de atualizar `/approve`.
- Criar histórico sem atualizar estado ou sem o associar ao endpoint real usado pela UI.
- Permitir reprovar compra já lançada.
- Receber `companyId` no corpo do pedido.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403`.
- Recurso de outra empresa deve devolver `404` ou `403`, sem expor dados.
- Reprovação sem justificação devolve `400`.
- Compra já lançada devolve `409`.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que BK-MF2-01 cobre apenas RF23 e mantém owner, prioridade, esforço, sprint, macrofase e próximo BK alinhados com os documentos canónicos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `README.md`, `docs/RF.md`, `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `CONTRATO-STACK-IMPLEMENTACAO.md`.
    - LOCALIZAÇÃO: `docs/planificacao/guias-bk/MF2/BK-MF2-01-historico-e-justificacoes-para-aprovacoes-reprovacoes.md`, header deste guia e linha canónica de `BK-MF2-01`.

3. Instruções do que fazer.

Comparar o header com matriz, backlog e contrato de campos antes de escrever código. Se a estrutura real de pastas divergir, preservar o contrato funcional e registar a adaptação na evidence.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF2-01
macro=MF2
rf=RF23
dependencias=BK-MF1-10
proximo=BK-MF2-02
```

5. Explicação do código.

Este bloco é um contrato de execução. Ele evita que o aluno comece por criar entidades, endpoints ou roles desalinhados da planificação. Num ERP, uma alteração errada propaga-se para inventário, contabilidade, auditoria e relatórios.

6. Validação do passo.

A evidence deve indicar que `RF23` foi confirmado e que as dependências `BK-MF1-10` existem ou estão preparadas.

7. Cenário negativo/erro esperado.

Se aparecer uma regra sem fonte documental, não a implementar como requisito. Registar a dúvida e pedir decisão ao responsável.
### Passo 2 - Modelar dados persistentes

1. Objetivo funcional do passo no ERP.

Criar ou ajustar os modelos necessários para Histórico e justificações para aprovações/reprovações.

2. Ficheiros envolvidos:
    - CRIAR: migration Prisma gerada a partir de `apps/api/prisma/schema.prisma`.
    - EDITAR: `apps/api/prisma/schema.prisma`.
    - REVER: `apps/api/prisma/schema.prisma`, modelos já usados por `BK-MF1-10`.
    - LOCALIZAÇÃO: bloco `PurchaseApprovalHistory` e relações inversas em `Company`, `User` e `PurchaseDocument`.

3. Instruções do que fazer.

Aplicar os modelos sem duplicar entidades já criadas em MF0/MF1. Se um enum já existir, editar o enum existente.

4. Código completo, correto e integrado com a app final.

```prisma
enum PurchaseDecisionAction {
  APPROVED
  REJECTED
}

model PurchaseApprovalHistory {
  id                 String                 @id @default(uuid())
  companyId          String
  company            Company                @relation(fields: [companyId], references: [id])
  purchaseDocumentId String
  purchaseDocument   PurchaseDocument       @relation(fields: [purchaseDocumentId], references: [id])
  action             PurchaseDecisionAction
  reason             String
  decidedById        String
  decidedBy          User                   @relation(fields: [decidedById], references: [id])
  decidedAt          DateTime               @default(now())

  @@index([companyId, purchaseDocumentId, decidedAt])
}

// Editar o enum existente, sem criar outro enum com o mesmo nome.
enum PurchaseDocumentStatus {
  DRAFT
  APPROVED
  REJECTED
  POSTED
  PAID
}

// Acrescentar no modelo Company:
// purchaseApprovalHistories PurchaseApprovalHistory[]

// Acrescentar no modelo PurchaseDocument:
// approvalHistory PurchaseApprovalHistory[]

// Acrescentar no modelo User:
// purchaseApprovalDecisions PurchaseApprovalHistory[]
```

5. Explicação do código.

A persistência é a camada de integridade mais baixa. Os modelos incluem `companyId` para permitir filtro por empresa e índices para consultas previsíveis. As relações inversas em `Company`, `PurchaseDocument` e `User` completam o contrato Prisma e deixam o histórico navegável a partir das entidades principais.

6. Validação do passo.

Gerar migration e confirmar que não há modelos, enums ou relações Prisma duplicadas.

7. Cenário negativo/erro esperado.

Se a migration quebrar por relação inexistente, corrigir a relação no schema antes de avançar.
### Passo 3 - Implementar validadores e service

1. Objetivo funcional do passo no ERP.

Colocar a regra de negócio de histórico e justificações para aprovações/reprovações no backend, não no browser.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/purchase-approval/purchaseApprovalHistoryValidators.js`.
    - EDITAR: `apps/api/src/modules/purchase-approval/purchaseApprovalService.js`.
    - REVER: `apps/api/src/lib/httpErrors.js` e modelo `AuditLog` em `apps/api/prisma/schema.prisma`.
    - LOCALIZAÇÃO: módulo `purchase-approval` criado em `BK-MF1-10`.

3. Instruções do que fazer.

Criar validadores antes de editar o service. Depois, substituir a função `approvePurchaseDocument` existente por uma versão que também grava histórico, adicionar `rejectPurchaseDocument` e acrescentar `listPurchaseApprovalHistory`. Não criar um segundo service de aprovação noutro módulo.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/purchase-approval/purchaseApprovalHistoryValidators.js
import { httpError } from "../../lib/httpErrors.js";

export function parseApprovalReason(input) {
  const reason = String(input?.reason ?? "").trim();

  return reason || "Aprovação registada sem observações adicionais.";
}

export function parseRejectionReason(input) {
  const reason = String(input?.reason ?? "").trim();

  if (reason.length < 8) {
    throw httpError(
      400,
      "PURCHASE_REJECTION_REASON_REQUIRED",
      "Indica uma justificação de reprovação."
    );
  }

  return reason;
}
```

```js
// apps/api/src/modules/purchase-approval/purchaseApprovalService.js
import { httpError } from "../../lib/httpErrors.js";
import { postPurchaseDocumentInTransaction } from "../accounting/purchasePostingService.js";
import { parseApprovalReason, parseRejectionReason } from "./purchaseApprovalHistoryValidators.js";

async function findPurchaseDocument(prisma, companyId, id) {
  const document = await prisma.purchaseDocument.findFirst({ where: { id, companyId } });

  if (!document) {
    throw httpError(404, "PURCHASE_DOCUMENT_NOT_FOUND", "Documento de compra não encontrado.");
  }

  return document;
}

async function recordPurchaseApprovalHistory(tx, { companyId, purchaseDocumentId, action, reason, userId }) {
  return tx.purchaseApprovalHistory.create({
    data: {
      companyId,
      purchaseDocumentId,
      action,
      reason,
      decidedById: userId,
    },
  });
}

async function recordPurchaseApprovalAudit(tx, { companyId, userId, purchaseDocumentId, action, details }) {
  await tx.auditLog.create({
    data: {
      companyId,
      userId,
      action,
      entity: "PurchaseDocument",
      entityId: purchaseDocumentId,
      details,
    },
  });
}

export async function approvePurchaseDocument(prisma, companyId, userId, id, input = {}) {
  const reason = parseApprovalReason(input);

  return prisma.$transaction(async (tx) => {
    const document = await findPurchaseDocument(tx, companyId, id);

    if (document.status !== "DRAFT") {
      throw httpError(
        409,
        "PURCHASE_DECISION_INVALID_STATE",
        "Só compras em rascunho podem ser decididas."
      );
    }

    const updated = await tx.purchaseDocument.update({
      where: { id: document.id },
      data: { status: "APPROVED", approvedAt: new Date(), approvedById: userId },
    });

    const history = await recordPurchaseApprovalHistory(tx, {
      companyId,
      purchaseDocumentId: document.id,
      action: "APPROVED",
      reason,
      userId,
    });

    await recordPurchaseApprovalAudit(tx, {
      companyId,
      userId,
      purchaseDocumentId: document.id,
      action: "PURCHASE_DOCUMENT_APPROVED",
      details: {
        previousStatus: document.status,
        nextStatus: "APPROVED",
        reason,
        historyId: history.id,
      },
    });

    return { document: updated, history };
  });
}

export async function rejectPurchaseDocument(prisma, companyId, userId, id, input = {}) {
  const reason = parseRejectionReason(input);

  return prisma.$transaction(async (tx) => {
    const document = await findPurchaseDocument(tx, companyId, id);

    if (document.status !== "DRAFT") {
      throw httpError(
        409,
        "PURCHASE_DECISION_INVALID_STATE",
        "Só compras em rascunho podem ser decididas."
      );
    }

    const updated = await tx.purchaseDocument.update({
      where: { id: document.id },
      data: { status: "REJECTED" },
    });

    const history = await recordPurchaseApprovalHistory(tx, {
      companyId,
      purchaseDocumentId: document.id,
      action: "REJECTED",
      reason,
      userId,
    });

    await recordPurchaseApprovalAudit(tx, {
      companyId,
      userId,
      purchaseDocumentId: document.id,
      action: "PURCHASE_DOCUMENT_REJECTED",
      details: {
        previousStatus: document.status,
        nextStatus: "REJECTED",
        reason,
        historyId: history.id,
      },
    });

    return { document: updated, history };
  });
}

export async function markPurchaseDocumentPosted(prisma, companyId, userId, id) {
  return prisma.$transaction(async (tx) => {
    const document = await findPurchaseDocument(tx, companyId, id);

    if (document.status !== "APPROVED") {
      throw httpError(409, "INVALID_STATUS", "Apenas compras aprovadas podem ser lançadas.");
    }

    const entry = await postPurchaseDocumentInTransaction(tx, companyId, userId, id);

    await tx.purchaseDocument.update({
      where: { id },
      data: { postedAt: new Date(), postedById: userId },
    });

    await recordPurchaseApprovalAudit(tx, {
      companyId,
      userId,
      purchaseDocumentId: id,
      action: "PURCHASE_DOCUMENT_POSTED",
      details: {
        previousStatus: document.status,
        nextStatus: "POSTED",
        journalEntryId: entry.id,
      },
    });

    return entry;
  });
}

export async function listPurchaseApprovalHistory(prisma, { companyId, purchaseDocumentId }) {
  await findPurchaseDocument(prisma, companyId, purchaseDocumentId);

  return prisma.purchaseApprovalHistory.findMany({
    where: { companyId, purchaseDocumentId },
    orderBy: { decidedAt: "asc" },
    include: {
      decidedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
```

5. Explicação do código.

O validador rejeita entrada inválida cedo. O service reutiliza o módulo de `BK-MF1-10`: `/approve` continua a aprovar, `/post-state` continua a lançar e a nova função `rejectPurchaseDocument` cobre a reprovação. Todas as decisões escrevem `PurchaseApprovalHistory` e `AuditLog.details` dentro da mesma transação, evitando estados sem rasto auditável.

6. Validação do passo.

Testar o service diretamente com dados válidos e inválidos.

7. Cenário negativo/erro esperado.

Entrada inválida deve devolver erro controlado e não criar registos.
### Passo 4 - Expor rotas protegidas

1. Objetivo funcional do passo no ERP.

Disponibilizar histórico e justificações para aprovações/reprovações através de HTTP com autenticação, empresa e role.

2. Ficheiros envolvidos:
    - CRIAR: nenhuma rota fora do router existente.
    - EDITAR: `apps/api/src/modules/purchase-approval/purchaseApprovalRoutes.js`.
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions/permissionMiddleware.js`.
    - LOCALIZAÇÃO: `apps/api/src/modules/purchase-approval/purchaseApprovalRoutes.js`, router já montado por `BK-MF1-10` em `/api/purchases/documents`.

3. Instruções do que fazer.

Editar o router existente. Não montar um segundo router em `server.js`, porque isso faria a aplicação ter duas responsabilidades concorrentes para aprovar compras.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/purchase-approval/purchaseApprovalRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import {
  approvePurchaseDocument,
  listPurchaseApprovalHistory,
  markPurchaseDocumentPosted,
  rejectPurchaseDocument,
} from "./purchaseApprovalService.js";

function sendError(res, error) {
  const response = toHttpError(error);
  return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildPurchaseApprovalRoutes({ prisma }) {
  const router = Router();
  const decisionGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR")];
  const accountingGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "CONTABILISTA")];
  const historyGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "AUDITOR")];

  router.post("/:id/approve", decisionGuards, async (req, res) => {
    try {
      const data = await approvePurchaseDocument(prisma, req.companyId, req.user.id, req.params.id, req.body);

      return res.status(200).json({ data });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post("/:id/reject", decisionGuards, async (req, res) => {
    try {
      const data = await rejectPurchaseDocument(prisma, req.companyId, req.user.id, req.params.id, req.body);

      return res.status(200).json({ data });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post("/:id/post-state", accountingGuards, async (req, res) => {
    try {
      const data = await markPurchaseDocumentPosted(prisma, req.companyId, req.user.id, req.params.id);

      return res.status(200).json({ data });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/:id/approval-history", historyGuards, async (req, res) => {
    try {
      const items = await listPurchaseApprovalHistory(prisma, {
        companyId: req.companyId,
        purchaseDocumentId: req.params.id,
      });

      return res.json({ items });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}
```

5. Explicação do código.

A rota é fina: valida sessão, empresa e role, chama o service e devolve resposta controlada. A aprovação usa o endpoint `/approve` herdado, a reprovação usa `/reject`, e a consulta usa `/approval-history`. O `server.js` não muda porque o router já foi montado em `BK-MF1-10`.

6. Validação do passo.

Executar teste de contrato com sessão válida, sem sessão, com role sem permissão e confirmar que não existe endpoint adicional de aprovação concorrente.

7. Cenário negativo/erro esperado.

Sem sessão deve devolver `401`; role sem permissão deve devolver `403`.
### Passo 5 - Criar cliente API frontend

1. Objetivo funcional do passo no ERP.

Ligar o frontend aos endpoints reais de aprovação, reprovação, lançamento e histórico.

2. Ficheiros envolvidos:
    - CRIAR: sem ficheiro novo; usar `apps/web/src/lib/purchaseApprovalApi.ts` existente.
    - EDITAR: `apps/web/src/lib/purchaseApprovalApi.ts`.
    - REVER: clientes em `apps/web/src/lib/`.
    - LOCALIZAÇÃO: `apps/web/src/lib/purchaseApprovalApi.ts`, cliente API criado em `BK-MF1-10`.

3. Instruções do que fazer.

Editar o cliente existente para manter `/approve` e `/post-state`, acrescentar `/reject` e `/approval-history`, e enviar cookies com `credentials: "include"`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/purchaseApprovalApi.ts
export type PurchaseDecisionAction = "APPROVED" | "REJECTED";

export type PurchaseApprovalHistoryItem = {
  id: string;
  action: PurchaseDecisionAction;
  reason: string;
  decidedAt: string;
  decidedBy: {
    id: string;
    name: string | null;
    email: string;
  };
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(body.message ?? "Erro inesperado.");
  }
  return response.json() as Promise<T>;
}

export async function approvePurchaseDocument(id: string, data: { reason?: string } = {}) {
  const response = await fetch(`/api/purchases/documents/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return readJson<{ data: { document: { id: string; status: string }; history: PurchaseApprovalHistoryItem } }>(response);
}

export async function rejectPurchaseDocument(id: string, data: { reason: string }) {
  const response = await fetch(`/api/purchases/documents/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return readJson<{ data: { document: { id: string; status: string }; history: PurchaseApprovalHistoryItem } }>(response);
}

export async function markPurchaseDocumentPosted(id: string) {
  const response = await fetch(`/api/purchases/documents/${id}/post-state`, {
    method: "POST",
    credentials: "include",
  });

  return readJson<{ data: { id: string } }>(response);
}

export async function fetchPurchaseApprovalHistory(documentId: string) {
  const response = await fetch(`/api/purchases/documents/${documentId}/approval-history`, {
    credentials: "include",
  });

  return readJson<{ items: PurchaseApprovalHistoryItem[] }>(response);
}
```

5. Explicação do código.

`credentials: "include"` envia a sessão sem expor tokens ao JavaScript. O cliente mantém os endpoints de `BK-MF1-10` e acrescenta apenas o que faltava para `RF23`: reprovação com justificação e leitura do histórico.

6. Validação do passo.

Testar aprovar, reprovar, lançar e consultar histórico com sessão ativa.

7. Cenário negativo/erro esperado.

Se a API devolver erro, a função deve lançar `Error` com mensagem clara.
### Passo 6 - Criar página ou componente de trabalho

1. Objetivo funcional do passo no ERP.

Dar ao aluno uma superfície visual mínima para aprovar, reprovar, lançar e consultar o histórico no fluxo real de compras.

2. Ficheiros envolvidos:
    - CRIAR: sem ficheiro novo; usar `apps/web/src/pages/PurchaseApprovalPage.tsx` existente.
    - EDITAR: `apps/web/src/pages/PurchaseApprovalPage.tsx`.
    - REVER: `apps/web/src/App.tsx`.
    - LOCALIZAÇÃO: `apps/web/src/pages/PurchaseApprovalPage.tsx`, página criada em `BK-MF1-10`.

3. Instruções do que fazer.

Editar a página existente, mantendo os botões de aprovação e lançamento, acrescentando reprovação com motivo e listagem do histórico.

4. Código completo, correto e integrado com a app final.

```tsx
import { FormEvent, useEffect, useState } from "react";
import {
  approvePurchaseDocument,
  fetchPurchaseApprovalHistory,
  markPurchaseDocumentPosted,
  rejectPurchaseDocument,
} from "../lib/purchaseApprovalApi";
import type { PurchaseApprovalHistoryItem } from "../lib/purchaseApprovalApi";

export function PurchaseApprovalPage() {
  const [purchaseDocumentId, setPurchaseDocumentId] = useState("");
  const [items, setItems] = useState<PurchaseApprovalHistoryItem[]>([]);
  const [reason, setReason] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | "post" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadHistory(id = purchaseDocumentId.trim()) {
    if (!id) {
      setItems([]);
      return;
    }

    setLoadingHistory(true);
    setError(null);

    try {
      const result = await fetchPurchaseApprovalHistory(id);
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o histórico.");
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, [purchaseDocumentId]);

  function handleApproveSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runAction("approve");
  }

  async function runAction(action: "approve" | "reject" | "post") {
    const id = purchaseDocumentId.trim();

    setError(null);
    setSuccess(null);

    if (!id) {
      setError("Indica o documento de compra.");
      return;
    }

    if (action === "reject" && reason.trim().length < 8) {
      setError("Indica uma justificação de reprovação com pelo menos 8 caracteres.");
      return;
    }

    setLoadingAction(action);
    try {
      if (action === "approve") {
        await approvePurchaseDocument(id, { reason });
        setSuccess("Compra aprovada com histórico registado.");
      }

      if (action === "reject") {
        await rejectPurchaseDocument(id, { reason });
        setSuccess("Compra reprovada com justificação registada.");
      }

      if (action === "post") {
        await markPurchaseDocumentPosted(id);
        setSuccess("Compra lançada com diário contabilístico.");
      }

      if (action !== "post") setReason("");
      await loadHistory(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a compra.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <main>
      <h1>Aprovação de compras</h1>

      <form onSubmit={handleApproveSubmit}>
        <label>
          Documento de compra
          <input
            value={purchaseDocumentId}
            onChange={(event) => setPurchaseDocumentId(event.target.value)}
            placeholder="ID do documento de compra"
          />
        </label>
        <label>
          Justificação
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>

        <button type="submit" disabled={loadingAction !== null}>
          Aprovar
        </button>
        <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("reject")}>
          Reprovar
        </button>
        <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("post")}>
          Marcar como lançada
        </button>
      </form>

      {error ? <p role="alert">{error}</p> : null}
      {success ? <p role="status">{success}</p> : null}
      {loadingAction ? <p>A processar...</p> : null}
      {loadingHistory ? <p>A carregar histórico...</p> : null}

      {!loadingHistory && items.length === 0 ? <p>Ainda não existem decisões.</p> : null}
      {!loadingHistory && items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.action}</strong> - {item.reason} - {item.decidedBy.email}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
```

5. Explicação do código.

A UI ajuda a testar o fluxo, mas não decide segurança nem regras de negócio. O backend continua a validar empresa, role, estado do documento e motivo de reprovação. A página editada é a mesma criada em `BK-MF1-10`, por isso o utilizador não fica dividido entre duas interfaces de aprovação.

6. Validação do passo.

Fazer smoke manual no browser com aprovar, reprovar, lançar e consultar histórico.

7. Cenário negativo/erro esperado.

Se o backend rejeitar, a página mostra erro e não assume sucesso local.
### Passo 7 - Validar smoke, negativos e segurança

1. Objetivo funcional do passo no ERP.

Provar que BK-MF2-01 funciona no caso principal e falha de forma controlada nos casos negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/purchase-approval/purchaseApprovalService.test.js`.
    - CRIAR: `apps/api/src/modules/purchase-approval/purchaseApprovalRoutes.test.js`.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-01-historico-e-justificacoes-para-aprovacoes-reprovacoes.md` e ficheiros criados nos passos anteriores.
    - LOCALIZAÇÃO: `apps/api/src/modules/purchase-approval/` e smoke manual em `apps/web/src/pages/PurchaseApprovalPage.tsx`.

3. Instruções do que fazer.

Criar pelo menos um teste do fluxo principal, testes negativos indicados neste guia e um smoke manual com sessão real. Validar também que a UI mostra loading, erro, vazio e sucesso, se o BK tiver frontend.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:unit -- purchaseApprovalService
npm run test:integration -- purchaseApprovalRoutes
```

5. Explicação do código.

Os testes devem provar comportamento, não apenas executar funções. Para um aluno do 12.º ano, isto ajuda a explicar na defesa o que foi verificado e porque a solução é segura.

6. Validação do passo.

Confirmar HTTP status, mensagem controlada, ausência de escrita parcial e ausência de dados de outra empresa.

7. Cenário negativo/erro esperado.

Se o smoke passa mas um negativo falha, corrigir o service ou a rota antes de pedir revisão.
### Passo 8 - Preparar evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar BK-MF2-01 com provas objetivas e deixar o próximo BK pronto para reutilizar os contratos criados.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF2/BK-MF2-01.md`.
    - EDITAR: nenhum ficheiro de aplicação neste passo.
    - REVER: outputs de testes, screenshots e resumo do PR.
    - LOCALIZAÇÃO: `docs/evidence/MF2/BK-MF2-01.md`.

3. Instruções do que fazer.

Registar ficheiros alterados, endpoints criados, comandos executados, resultados dos negativos e riscos que ficam para o próximo BK.

4. Código completo, correto e integrado com a app final.

```md
# BK-MF2-01

- Requisito validado: RF23
- Endpoints: POST /api/purchases/documents/:id/approve, POST /api/purchases/documents/:id/reject, GET /api/purchases/documents/:id/approval-history
- Endpoint preservado de BK-MF1-10: POST /api/purchases/documents/:id/post-state
- Negativos: sem sessão, role sem permissão, documento inexistente, reprovação sem motivo, decisão em estado inválido
- Resultado: preencher com os comandos executados e prints da UI
```

5. Explicação do código.

A evidence liga requisito, código e validação. Sem esta prova, o BK pode estar tecnicamente correto mas continua fraco para revisão técnica e defesa PAP.

6. Validação do passo.

Confirmar que o handoff para `BK-MF2-02` indica que exports, endpoints, modelos e limitações ficaram disponíveis.

7. Cenário negativo/erro esperado.

Se existir bloqueio real, marcar explicitamente na evidence e no relatório de auditoria, com erro observado e impacto.

## Expected results

- Aprovação muda `DRAFT` para `APPROVED` e cria histórico.
- Reprovação exige justificação e muda `DRAFT` para `REJECTED`.
- Consulta devolve histórico ordenado.
- Todas as decisões criam `AuditLog` com `details`.
- O endpoint `/approve` existente em BK-MF1-10 é o único endpoint de aprovação.

## Critérios de aceite

- Todos os passos seguem a estrutura obrigatória 1 a 7.
- O backend aplica autenticação, autorização e contexto multiempresa.
- A UI usa `credentials: "include"` e não guarda tokens em `localStorage`.
- Os erros são controlados e em português de Portugal.
- A evidence inclui smoke, negativos e ficheiros alterados.

## Validação final

- Teste de aprovar.
- Teste de reprovar.
- Teste de reprovação sem motivo.
- Teste de compra de outra empresa.
- Teste que confirma inexistência de `/approval-decisions` como caminho de aprovação concorrente.

## Evidence para PR/defesa

- Output dos testes.
- Screenshot ou pedido HTTP do histórico.
- Negativo de reprovação sem motivo.
- Prova de que a UI chama `/approve` e `/reject`.
- Resumo do PR.

## Handoff

BK-MF2-02 recebe a mesma disciplina de operações sensíveis: transação, contexto de empresa e auditoria. O fluxo de compras fica com aprovação única em `/approve`, reprovação em `/reject`, lançamento em `/post-state` e consulta de histórico em `/approval-history`.

## Changelog

- `2026-06-08`: integrado o histórico no módulo `purchase-approval` existente, preservando `/approve` e removendo o endpoint paralelo de decisão.
- `2026-06-08`: corrigido o contrato Prisma com relações inversas e alinhada a auditoria com `AuditLog.details`.
- `2026-06-07`: guia reescrito como tutorial técnico linear, autocontido e alinhado com RF/RNF, MF0, MF1 e contrato de stack.
