# BK-MF1-06 - Submeter documentos de venda para aprovação antes de emissão definitiva.

## Header

- `doc_id`: `GUIA-BK-MF1-06`
- `bk_id`: `BK-MF1-06`
- `macro`: `MF1`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-03, BK-MF1-02`
- `rf_rnf`: `RF18`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-07`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-06-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiva.md`
- `last_updated`: `2026-06-01`

## Objetivo

Executar RF18 para aprovação de vendas, seguindo os documentos canónicos e a stack contratada: React + Vite + TypeScript no frontend, Node.js + Express em ES Modules no backend, PostgreSQL e Prisma/equivalente na persistência.

## Importância funcional e pedagógica

Este BK transforma o requisito RF18 num caminho de implementação rastreável. Funcionalmente, fecha uma operação essencial da MF1; pedagogicamente, mostra como ligar requisito, modelo de dados, service, rota HTTP, UI, testes e evidência sem inventar regras fora dos documentos canónicos.

## Scope-in

- Estados de aprovação para vendas.
- Submissão por operacional.
- Aprovação e rejeição por gestor/administrador.
- Motivo obrigatório na rejeição.

## Scope-out

- Histórico detalhado de decisões, que pertence a `BK-MF2-01`.
- Notificações, que pertencem a MF4.

## Estado antes

O documento de venda pode ser criado e emitido, mas não há workflow de aprovação para casos que exigem validação.

## Estado depois

O documento pode circular entre rascunho, submetido, aprovado e rejeitado, com utilizador e data de decisão.

## Pré-requisitos

- Ler `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` e `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
- Confirmar que autenticação, contexto de empresa, roles/permissões e erros HTTP da MF0 estão disponíveis.
- Confirmar dependências canónicas: `BK-MF0-03, BK-MF1-02`.
- Nunca receber `companyId` do corpo do pedido; usar sempre o contexto autenticado.

## Fundamentação documental

- `CANONICO`: `RF18` exige fluxo simples de documentos de venda com submissão, aprovação e rejeição.
- `CANONICO`: `RF47` e `RNF17` exigem auditoria para aprovações e rejeições.
- `DERIVADO`: `submittedById` permite aplicar segregação mínima entre quem submete e quem aprova ou rejeita.
- `DERIVADO`: a emissão definitiva continua no endpoint criado no `BK-MF1-02`, mas passa a aceitar apenas documentos `APPROVED`.

## Glossário

- **Documento canónico:** fonte documental que define RF/RNF, BK, owner, dependências e prioridade.
- **Service:** camada backend onde ficam regras de negócio e transações.
- **Validator:** função que rejeita entrada inválida antes de persistir dados.
- **Evidência:** registo objetivo de ficheiros alterados, comandos executados e resultado obtido.

## Conceitos teóricos essenciais

- **Workflow de aprovação:** controla o caminho `DRAFT -> SUBMITTED -> APPROVED/REJECTED`; vem do RF18 e evita emissão sem revisão.
- **Segregação de funções:** separa quem prepara o documento de quem aprova; reduz risco de erro ou abuso.
- **Auditoria:** regista utilizador, ação, entidade e data em `AuditLog`; prepara RF47/RNF17.
- **Motivo de rejeição:** explica porque o documento voltou ao estado anterior; ajuda defesa e rastreabilidade.
- **Emissão após aprovação:** a função `issueSaleDocument` passa a exigir `APPROVED`; isto aperta a regra criada no BK-MF1-02.
- **Routes protegidas:** roles diferentes submetem e aprovam; o backend bloqueia mesmo que a UI mostre botão por engano.
- **Frontend:** exibe ações de submeter, aprovar e rejeitar com motivo e feedback claro.
- **Handoff:** BK-MF2-01 pode expandir histórico e justificações com base no audit log.

## Arquitetura do BK

- Fluxo: `FLOW-MF1-SALE-APPROVAL`
- Endpoint principal: `/api/sales/documents/:id/approval`
- Módulo backend: `apps/api/src/modules/sales-approval/`
- Cliente frontend: `apps/web/src/lib/saleApprovalApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.

## Ficheiros a criar/editar/rever

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/sales-approval/`
- `apps/api/src/server.js`
- `apps/web/src/lib/saleApprovalApi.ts`
- `apps/web/src/pages/SaleApprovalPage.tsx`
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

Garantir que BK-MF1-06 implementa apenas RF18, com dependências, owner, prioridade e próximo BK iguais aos documentos canónicos.

2. Ficheiros envolvidos:
- CRIAR: nenhum ficheiro neste passo.
- EDITAR: nenhum ficheiro neste passo.
- REVER: documentos canónicos listados nos pré-requisitos.
- LOCALIZAÇÃO: topo deste guia e matriz/backlog.

3. Instruções do que fazer.

Confirmar que o BK é `BK-MF1-06`, requisito `RF18`, dependências `BK-MF0-03, BK-MF1-02`, sprint `S03-S04` e próximo BK `BK-MF1-07`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-06
macro=MF1
rf=RF18
endpoint=/api/sales/documents/:id/approval
deps=BK-MF0-03, BK-MF1-02
```

5. Explicação do código.

As chaves acima formalizam o contrato mínimo do BK e devem bater certo com a matriz antes de qualquer alteração de código.

6. Validação do passo.

Comparar header do guia com `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`. Qualquer divergência bloqueia a implementação.

7. Cenário negativo/erro esperado.

Se surgir uma regra sem fonte documental, não a transformar em requisito; registar a incerteza na evidência e pedir decisão ao responsável.

### Passo 2 - Implementar dados e backend

1. Objetivo funcional do passo no ERP.

Criar a persistência e as regras backend para aprovação de vendas, com validação, transações e isolamento por empresa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/sales-approval/` com service e routes.
- EDITAR: `apps/api/prisma/schema.prisma`, `apps/api/src/modules/sales/saleDocumentService.js` e `apps/api/src/server.js`.
- REVER: `BK-MF1-02` porque criou `issueSaleDocument` e a rota `/api/sales/documents/:id/issue`.
- LOCALIZAÇÃO: modelos Prisma no domínio correspondente e rota montada em `/api/sales/documents/:id/approval`.

3. Instruções do que fazer.

Aplicar o schema, criar migration, implementar service antes da rota, usar `companyId` do contexto e devolver erros HTTP normalizados. Montar a rota em `server.js` junto das restantes rotas da app.

4. Código completo, correto e integrado com a app final.

Localização: `apps/api/prisma/schema.prisma`.

```prisma
enum SaleDocumentStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  ISSUED
  SETTLED
}

model SaleDocument {
  id              String             @id @default(uuid())
  companyId       String
  customerId      String
  kind            SaleDocumentKind
  status          SaleDocumentStatus @default(DRAFT)
  number          String?
  issuedAt        DateTime
  dueDate         DateTime?
  subtotalCents   Int
  vatCents        Int
  totalCents      Int
  amountPaidCents Int                @default(0)
  createdById     String
  submittedAt     DateTime?
  submittedById   String?
  approvedAt      DateTime?
  approvedById    String?
  rejectedAt      DateTime?
  rejectedById    String?
  rejectionReason String?
  issuedById      String?
  issuedDefinitiveAt DateTime?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  company  Company  @relation(fields: [companyId], references: [id])
  customer Customer @relation(fields: [customerId], references: [id])
  lines    SaleDocumentLine[]
  receipts Receipt[]

  @@unique([companyId, number])
  @@index([companyId, status, issuedAt])
}
```

O modelo `AuditLog` já foi criado no `BK-MF1-02`. Neste BK reutilizas esse modelo e não o duplicas no schema.

Localização: `apps/api/src/modules/sales/saleDocumentService.js`.

```js
export async function issueSaleDocument(prisma, companyId, userId, id) {
    return prisma.$transaction(async (tx) => {
        const document = await tx.saleDocument.findFirst({ where: { id, companyId }, include: { lines: true } });
        if (!document) throw httpError(404, "SALE_DOCUMENT_NOT_FOUND", "Documento de venda não encontrado");
        // A partir deste BK, a emissão definitiva exige aprovação para garantir segregação de funções.
        if (document.status !== "APPROVED") throw httpError(409, "INVALID_STATUS", "Apenas documentos aprovados podem ser emitidos");
        if (document.number) throw httpError(409, "DOCUMENT_ALREADY_ISSUED", "Documento já emitido");
        await assertOpenFiscalPeriod(tx, { companyId, documentDate: document.issuedAt });

        const number = await nextSaleNumber(tx, companyId, document.kind, document.issuedAt);
        const settled = document.kind === "INVOICE_RECEIPT";

        const issued = await tx.saleDocument.update({
            where: { id: document.id },
            data: {
                number,
                status: settled ? "SETTLED" : "ISSUED",
                amountPaidCents: settled ? document.totalCents : document.amountPaidCents,
                issuedById: userId,
                issuedDefinitiveAt: new Date(),
            },
            include: { lines: true, customer: true },
        });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "SALE_DOCUMENT_ISSUED",
                entity: "SaleDocument",
                entityId: issued.id,
                details: { number, status: issued.status, totalCents: issued.totalCents },
            },
        });
        return issued;
    });
}
```

Localização: `apps/api/src/modules/sales-approval/saleApprovalService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

async function findSaleDocument(prisma, companyId, id) {
    const document = await prisma.saleDocument.findFirst({ where: { id, companyId } });
    if (!document) throw httpError(404, "SALE_DOCUMENT_NOT_FOUND", "Documento de venda não encontrado");
    return document;
}

async function recordSaleApprovalAudit(tx, companyId, userId, saleDocumentId, action, details = {}) {
    await tx.auditLog.create({
        data: { companyId, userId, action, entity: "SaleDocument", entityId: saleDocumentId, details },
    });
}

export async function submitSaleDocument(prisma, companyId, userId, id) {
    const document = await findSaleDocument(prisma, companyId, id);
    if (document.status !== "DRAFT") throw httpError(409, "INVALID_STATUS", "Apenas rascunhos podem ser submetidos");
    return prisma.$transaction(async (tx) => {
        const updated = await tx.saleDocument.update({ where: { id }, data: { status: "SUBMITTED", submittedAt: new Date(), submittedById: userId, rejectionReason: null } });
        await recordSaleApprovalAudit(tx, companyId, userId, id, "SALE_DOCUMENT_SUBMITTED");
        return updated;
    });
}

export async function approveSaleDocument(prisma, companyId, userId, id) {
    const document = await findSaleDocument(prisma, companyId, id);
    if (document.status !== "SUBMITTED") throw httpError(409, "INVALID_STATUS", "Apenas documentos submetidos podem ser aprovados");
    if (document.submittedById === userId) throw httpError(403, "SEGREGATION_REQUIRED", "Outro utilizador deve aprovar o documento");
    return prisma.$transaction(async (tx) => {
        const updated = await tx.saleDocument.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date(), approvedById: userId } });
        await recordSaleApprovalAudit(tx, companyId, userId, id, "SALE_DOCUMENT_APPROVED");
        return updated;
    });
}

export async function rejectSaleDocument(prisma, companyId, userId, id, input) {
    const reason = String(input?.reason ?? "").trim();
    if (reason.length < 3) throw httpError(400, "INVALID_REASON", "Motivo de rejeição obrigatório");
    const document = await findSaleDocument(prisma, companyId, id);
    if (document.status !== "SUBMITTED") throw httpError(409, "INVALID_STATUS", "Apenas documentos submetidos podem ser rejeitados");
    if (document.submittedById === userId) throw httpError(403, "SEGREGATION_REQUIRED", "Outro utilizador deve rejeitar o documento");
    return prisma.$transaction(async (tx) => {
        const updated = await tx.saleDocument.update({ where: { id }, data: { status: "REJECTED", rejectedAt: new Date(), rejectedById: userId, rejectionReason: reason } });
        await recordSaleApprovalAudit(tx, companyId, userId, id, "SALE_DOCUMENT_REJECTED", { reason });
        return updated;
    });
}
```

Localização: `apps/api/src/modules/sales-approval/saleApprovalRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { approveSaleDocument, rejectSaleDocument, submitSaleDocument } from "./saleApprovalService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildSaleApprovalRoutes({ prisma }) {
    const router = Router();
    router.post("/:id/submit", requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "OPERACIONAL"), async (req, res) => {
        try {
            const data = await submitSaleDocument(prisma, req.companyId, req.user.id, req.params.id);
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    router.post("/:id/approve", requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR"), async (req, res) => {
        try {
            const data = await approveSaleDocument(prisma, req.companyId, req.user.id, req.params.id);
            return res.status(200).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
    });
    router.post("/:id/reject", requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR"), async (req, res) => {
        try {
            const data = await rejectSaleDocument(prisma, req.companyId, req.user.id, req.params.id, req.body);
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
import { buildSaleApprovalRoutes } from "./modules/sales-approval/saleApprovalRoutes.js";

app.use("/api/sales/documents", buildSaleApprovalRoutes({ prisma }));
```

5. Explicação do código.

O schema acrescenta campos de decisão e reutiliza o `AuditLog`, que regista quem submeteu, aprovou ou rejeitou. O campo `submittedById` permite impedir que o mesmo utilizador aprove ou rejeite o documento que submeteu. O service concentra validação, transações, regras de estado, segregação e auditoria. A rota de emissão criada no `BK-MF1-02` continua a existir, mas a função `issueSaleDocument` passa a exigir `APPROVED`. Assim não existem dois endpoints para emitir; existe uma regra mais restritiva no service partilhado.

6. Validação do passo.

Executar teste unitário do service, teste de contrato dos endpoints `/submit`, `/approve` e `/reject`, teste de emissão por `/api/sales/documents/:id/issue` com documento aprovado, e confirmar que todos os registos criados pertencem a `req.companyId`.

7. Cenário negativo/erro esperado.

Entrada inválida deve falhar antes do Prisma; estado inválido deve devolver `409`; ausência de recurso dentro da empresa ativa deve devolver `404`.

### Passo 3 - Implementar frontend, testes e handoff

1. Objetivo funcional do passo no ERP.

Disponibilizar a operação ao utilizador, com cliente API tipado, estados de carregamento/erro/sucesso e evidência que permita revisão técnica.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/lib/saleApprovalApi.ts` e página/componente do domínio.
- EDITAR: rotas frontend existentes, se a app já tiver router.
- REVER: `apps/web/src/lib/apiClient.ts` e componentes de formulário/listagem já usados na MF0.
- LOCALIZAÇÃO: módulo visual correspondente à operação da MF1.

3. Instruções do que fazer.

Criar funções de API tipadas, consumir erros normalizados do backend e mostrar mensagens claras. Não recalcular no frontend valores que o backend já calcula como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Localização: `apps/web/src/lib/saleApprovalApi.ts`.

```ts
import { apiClient } from "./apiClient";

export async function submitSaleDocument(id: string) {
    return apiClient.post("/api/sales/documents/" + id + "/submit", {});
}
export async function approveSaleDocument(id: string) {
    return apiClient.post("/api/sales/documents/" + id + "/approve", {});
}
export async function rejectSaleDocument(id: string, reason: string) {
    return apiClient.post("/api/sales/documents/" + id + "/reject", { reason });
}
```

Localização: `apps/web/src/pages/SaleApprovalPage.tsx`.

```tsx
// apps/web/src/pages/SaleApprovalPage.tsx
import { FormEvent, useState } from "react";
import { approveSaleDocument, rejectSaleDocument, submitSaleDocument } from "../lib/saleApprovalApi";

export function SaleApprovalPage() {
    const [saleDocumentId, setSaleDocumentId] = useState("");
    const [reason, setReason] = useState("");
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function runAction(action: "submit" | "approve" | "reject") {
        setError(null);
        setSuccess(null);
        if (!saleDocumentId.trim()) {
            setError("Indica o documento de venda.");
            return;
        }
        if (action === "reject" && !reason.trim()) {
            setError("Indica o motivo da rejeição.");
            return;
        }
        setLoadingAction(action);
        try {
            if (action === "submit") await submitSaleDocument(saleDocumentId.trim());
            if (action === "approve") await approveSaleDocument(saleDocumentId.trim());
            if (action === "reject") await rejectSaleDocument(saleDocumentId.trim(), reason.trim());
            setSuccess("Estado do documento atualizado com sucesso.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível atualizar o documento.");
        } finally {
            setLoadingAction(null);
        }
    }

    function handleReject(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void runAction("reject");
    }

    return (
        <main>
            <h1>Aprovação de vendas</h1>
            <input value={saleDocumentId} onChange={(event) => setSaleDocumentId(event.target.value)} placeholder="ID do documento de venda" />
            <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("submit")}>Submeter</button>
            <button type="button" disabled={loadingAction !== null} onClick={() => void runAction("approve")}>Aprovar</button>
            <form onSubmit={handleReject} aria-label="Rejeitar documento de venda">
                <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo de rejeição" />
                <button type="submit" disabled={loadingAction !== null}>Rejeitar</button>
            </form>
            {loadingAction && <p>A processar...</p>}
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}
```

Localização: `apps/api/src/modules/sales-approval/saleApprovalService.test.js`.

```js
import test from "node:test";
import assert from "node:assert/strict";
import { approveSaleDocument, rejectSaleDocument } from "./saleApprovalService.js";

test("obriga motivo ao rejeitar venda", async () => {
    await assert.rejects(
        () => rejectSaleDocument({}, "company-1", "user-2", "sale-1", { reason: "" }),
        (error) => error.status === 400 && error.code === "INVALID_REASON",
    );
});

test("impede que o mesmo utilizador aprove o documento que submeteu", async () => {
    const prisma = {
        saleDocument: { findFirst: async () => ({ id: "sale-1", companyId: "company-1", status: "SUBMITTED", submittedById: "user-1" }) },
        $transaction: async () => assert.fail("Não deve abrir transação quando a segregação falha"),
    };

    await assert.rejects(
        () => approveSaleDocument(prisma, "company-1", "user-1", "sale-1"),
        (error) => error.status === 403 && error.code === "SEGREGATION_REQUIRED",
    );
});
```

5. Explicação do código.

A página `SaleApprovalPage.tsx` fecha a parte visual deste BK: tem estado local, validação mínima, mensagens de erro/sucesso e chama endpoints reais através do cliente API. A UI ajuda o utilizador, mas as regras de segurança, multiempresa e fiscalidade continuam no backend.

O cliente API mantém o contrato entre UI e backend num ponto único. Os testes focam o comportamento que protege a contabilidade: validação, transação, estado e isolamento por empresa.

6. Validação do passo.

- Correr testes unitários do módulo.
- Fazer smoke via UI ou chamada HTTP autenticada.
- Confirmar que mensagens de erro são compreensíveis e não expõem detalhes internos.

7. Cenário negativo/erro esperado.

Se o backend devolver `400`, `401`, `403`, `404` ou `409`, a UI deve mostrar erro controlado e manter o formulário/listagem num estado recuperável.

### Passo 4 - Validar regras unitárias

1. Objetivo funcional do passo no ERP.
Confirmar que apenas transições válidas alteram o estado do documento.
2. Ficheiros envolvidos:
- CRIAR: testes unitários do módulo.
- EDITAR: service apenas se o teste revelar falha.
- REVER: transições, auditoria e motivo de rejeição.
- LOCALIZAÇÃO: testes do backend.
3. Instruções do que fazer.
Testar `DRAFT -> SUBMITTED`, `SUBMITTED -> APPROVED`, `SUBMITTED -> REJECTED` e emissão apenas após aprovação.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:unit
```
5. Explicação do código.
O comando valida as regras sensíveis antes do transporte HTTP.
6. Validação do passo.
Cada alteração cria registo de auditoria.
7. Cenário negativo/erro esperado.
Rejeição sem motivo deve devolver `INVALID_REASON`.

### Passo 5 - Validar contrato HTTP

1. Objetivo funcional do passo no ERP.
Garantir que os endpoints de aprovação devolvem códigos previsíveis.
2. Ficheiros envolvidos:
- CRIAR: testes de contrato.
- EDITAR: route se o contrato HTTP não estiver normalizado.
- REVER: roles de submissão, aprovação, rejeição e emissão.
- LOCALIZAÇÃO: testes de contrato do backend.
3. Instruções do que fazer.
Cobrir sessão ausente, empresa ausente, role insuficiente e estado inválido.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:contracts
```
5. Explicação do código.
O comando protege a API de aprovação contra regressões de segurança.
6. Validação do passo.
Erros usam o formato normalizado da app.
7. Cenário negativo/erro esperado.
Documento já emitido não pode voltar a aprovação.

### Passo 6 - Preparar evidência

1. Objetivo funcional do passo no ERP.
Fechar o BK com prova técnica e handoff para recebimentos e contabilização.
2. Ficheiros envolvidos:
- CRIAR: nota de evidência.
- EDITAR: changelog se houver alteração real.
- REVER: critérios de aceite.
- LOCALIZAÇÃO: guia e PR.
3. Instruções do que fazer.
Registar comandos, resultados, matriz de estados e impacto em BK-MF1-03/BK-MF1-04.
4. Código completo, correto e integrado com a app final.
```bash
git diff -- docs/planificacao/guias-bk/MF1
```
5. Explicação do código.
O comando foca a revisão documental na MF1.
6. Validação do passo.
A evidência permite perceber a sequência antes da emissão definitiva.
7. Cenário negativo/erro esperado.
Sem evidência de auditoria, não pedir revisão final.

## Expected results

- O documento pode circular entre rascunho, submetido, aprovado e rejeitado, com utilizador e data de decisão.
- Endpoint `/api/sales/documents/:id/approval` protegido e filtrado por empresa.
- Testes cobrem pelo menos um caso feliz e três cenários negativos relevantes.
- Evidência lista schema, services, rotas, UI e comandos executados.

## Critérios de aceite

- RF18 fica coberto sem alterar o contrato canónico do BK.
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

O `BK-MF1-07` inicia o fluxo de compras; o histórico comum de aprovações fica reservado para `BK-MF2-01`.

## Changelog

- `2026-06-01`: Dependências técnicas canónicas alinhadas com a matriz, backlog e risco de PR da MF1.
- `2026-05-31`: Corrigida fundamentação documental, segregação de submissão/aprovação, schema acumulado e testes autocontidos.
- `2026-05-31`: Guia consolidado com contrato técnico completo, código por camada, validações e handoff MF1.
