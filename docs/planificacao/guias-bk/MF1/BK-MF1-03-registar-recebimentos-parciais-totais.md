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
- `dependencias`: `BK-MF0-03, BK-MF0-08, BK-MF1-02`
- `rf_rnf`: `RF15`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-04`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-03-registar-recebimentos-parciais-totais.md`
- `last_updated`: `2026-06-01`

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
- Confirmar dependências canónicas: `BK-MF0-03, BK-MF0-08, BK-MF1-02`.
- Confirmar reutilização técnica do `BK-MF1-02`: o documento de venda deve estar emitido por `/api/sales/documents/:id/issue` antes de receber valores.
- Nunca receber `companyId` do corpo do pedido; usar sempre o contexto autenticado.

## Fundamentação documental

- `CANONICO`: `RF15` distingue recebimentos de clientes de pagamentos a fornecedores e exige suporte a recebimentos parciais/totais.
- `CANONICO`: `RF47` e `RNF17` tornam o registo de auditoria obrigatório porque o recebimento altera saldos financeiros.
- `DERIVADO`: `Receipt` guarda método, referência e notas para explicar o movimento sem substituir reconciliação bancária futura.
- `DERIVADO`: `AuditLog`, criado no `BK-MF1-02`, é reutilizado para provar quem registou o recebimento e que saldo resultou da operação.

## Glossário

- **Documento canónico:** fonte documental que define RF/RNF, BK, owner, dependências e prioridade.
- **Service:** camada backend onde ficam regras de negócio e transações.
- **Validator:** função que rejeita entrada inválida antes de persistir dados.
- **Evidência:** registo objetivo de ficheiros alterados, comandos executados e resultado obtido.

## Conceitos teóricos essenciais

- **Recebimento:** é o valor recebido de um cliente para liquidar uma venda; vem do RF15 e alimenta saldos e previsão de tesouraria.
- **Parcial e total:** um recebimento parcial reduz o saldo em aberto; um recebimento total muda o documento para liquidado.
- **Saldo em aberto:** e `totalCents - amountPaidCents`; evita receber mais do que o cliente deve.
- **Período fiscal:** deve estar aberto na data do recebimento para impedir alterações financeiras em período fechado.
- **Transação:** cria o recibo e atualiza o documento de venda no mesmo bloco para evitar saldos incoerentes.
- **Formulário React:** pede documento, valor, data, método e referência; valida o mínimo antes de chamar o backend.
- **Segurança:** o backend filtra por empresa e rejeita documento de outra empresa como `404` ou `403`.
- **Handoff:** BK-MF1-05 e BK-MF3-04 usam estes saldos para títulos em aberto e previsão de tesouraria.

## Arquitetura do BK

- Fluxo: `FLOW-MF1-RECEIPTS`
- Endpoint principal: `/api/sales/documents/:id/receipts`
- Módulo backend: `apps/api/src/modules/receipts/`
- Cliente frontend: `apps/web/src/lib/receiptApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.
- Entrada funcional esperada: `SaleDocument.status` em `ISSUED` ou `SETTLED`, produzido pelo `BK-MF1-02`.

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

Confirmar que o BK é `BK-MF1-03`, requisito `RF15`, dependências `BK-MF0-03, BK-MF0-08, BK-MF1-02`, sprint `S03-S04` e próximo BK `BK-MF1-04`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-03
macro=MF1
rf=RF15
endpoint=/api/sales/documents/:id/receipts
deps=BK-MF0-03, BK-MF0-08, BK-MF1-02
```

5. Explicação do código.

As chaves acima formalizam o contrato mínimo do BK e devem bater certo com a matriz antes de qualquer alteração de código.

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

O modelo `AuditLog` já foi criado no `BK-MF1-02`. Neste BK reutilizas esse modelo e não o duplicas no schema.

Localização: no mesmo ficheiro, substituir estes modelos existentes pelas versões acumuladas até este BK.

```prisma
model Company {
  id              String              @id @default(uuid())
  name            String
  nif             String?             @unique
  memberships     CompanyMembership[]
  invitations     CompanyInvitation[]
  profile         CompanyProfile?
  accounts        Account[]
  fiscalPeriods   FiscalPeriod[]
  customers       Customer[]
  suppliers       Supplier[]
  items           Item[]
  warehouses      Warehouse[]
  vatRates        VatRate[]
  numberSequences NumberSequence[]
  saleDocuments   SaleDocument[]
  receipts        Receipt[]
  auditLogs       AuditLog[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

model SaleDocument {
  id                 String             @id @default(uuid())
  companyId          String
  customerId         String
  kind               SaleDocumentKind
  status             SaleDocumentStatus @default(DRAFT)
  number             String?
  issuedAt           DateTime
  dueDate            DateTime?
  subtotalCents      Int
  vatCents           Int
  totalCents         Int
  amountPaidCents    Int                @default(0)
  createdById        String
  issuedById         String?
  issuedDefinitiveAt DateTime?
  receipts           Receipt[]
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  company  Company            @relation(fields: [companyId], references: [id])
  customer Customer           @relation(fields: [customerId], references: [id])
  lines    SaleDocumentLine[]

  @@unique([companyId, number])
  @@index([companyId, customerId, issuedAt])
}

model User {
  id                  String               @id @default(uuid())
  email               String               @unique
  name                String?
  passwordHash        String
  isActive            Boolean              @default(true)
  sessions            Session[]
  memberships         CompanyMembership[]
  passwordResetTokens PasswordResetToken[]
  auditLogs           AuditLog[]
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
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
    if (!Number.isInteger(amountCents) || amountCents <= 0) throw httpError(400, "INVALID_AMOUNT", "Valor recebido inválido");
    if (Number.isNaN(receivedAt.getTime())) throw httpError(400, "INVALID_DATE", "Data de recebimento inválida");
    if (!methods.has(method)) throw httpError(400, "INVALID_METHOD", "Método de recebimento inválido");
    return { amountCents, receivedAt, method, reference: String(input.reference ?? "").trim() || null, notes: String(input.notes ?? "").trim() || null };
}

export async function registerReceipt(prisma, companyId, userId, saleDocumentId, input) {
    const data = parseReceiptInput(input);
    await assertOpenFiscalPeriod(prisma, { companyId, documentDate: data.receivedAt });

    return prisma.$transaction(async (tx) => {
        const document = await tx.saleDocument.findFirst({ where: { id: saleDocumentId, companyId } });
        if (!document) throw httpError(404, "SALE_DOCUMENT_NOT_FOUND", "Documento de venda não encontrado");
        if (document.kind === "CREDIT_NOTE") throw httpError(409, "CREDIT_NOTE_NOT_RECEIVABLE", "Notas de crédito não recebem recebimentos");
        if (document.status !== "ISSUED" && document.status !== "SETTLED") throw httpError(409, "INVALID_STATUS", "Apenas documentos emitidos podem receber valores");
        const openAmount = document.totalCents - document.amountPaidCents;
        if (openAmount <= 0) throw httpError(409, "DOCUMENT_ALREADY_SETTLED", "Documento já liquidado");
        if (data.amountCents > openAmount) throw httpError(400, "AMOUNT_EXCEEDS_OPEN", "Valor excede o montante em aberto");

        const receipt = await tx.receipt.create({ data: { ...data, companyId, saleDocumentId, createdById: userId } });
        const nextPaid = document.amountPaidCents + data.amountCents;
        await tx.saleDocument.update({ where: { id: document.id }, data: { amountPaidCents: nextPaid, status: nextPaid === document.totalCents ? "SETTLED" : document.status } });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "RECEIPT_REGISTERED",
                entity: "Receipt",
                entityId: receipt.id,
                details: { saleDocumentId, amountCents: data.amountCents, resultingAmountPaidCents: nextPaid },
            },
        });
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
        try {
            const data = await registerReceipt(prisma, req.companyId, req.user.id, req.params.id, req.body);
            return res.status(201).json({ data });
        } catch (error) {
            return sendError(res, error);
        }
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

Localização: `apps/web/src/pages/ReceiptsPage.tsx`.

```tsx
// apps/web/src/pages/ReceiptsPage.tsx
import { FormEvent, useState } from "react";
import { registerReceipt, type ReceiptInput } from "../lib/receiptApi";

const emptyForm: ReceiptInput & { saleDocumentId: string } = {
    saleDocumentId: "",
    amountCents: 0,
    receivedAt: new Date().toISOString().slice(0, 10),
    method: "BANK_TRANSFER",
    reference: "",
    notes: "",
};

export function ReceiptsPage() {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        if (!form.saleDocumentId || form.amountCents <= 0 || !form.receivedAt) {
            setError("Preenche documento, valor e data do recebimento.");
            return;
        }
        setSaving(true);
        try {
            await registerReceipt(form.saleDocumentId, form);
            setForm(emptyForm);
            setSuccess("Recebimento registado com sucesso.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível registar o recebimento.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main>
            <h1>Recebimentos</h1>
            <form onSubmit={handleSubmit} aria-label="Registar recebimento">
                <input value={form.saleDocumentId} onChange={(event) => setForm({ ...form, saleDocumentId: event.target.value })} placeholder="ID do documento de venda" />
                <input type="number" value={form.amountCents} onChange={(event) => setForm({ ...form, amountCents: Number(event.target.value) })} />
                <input type="date" value={form.receivedAt} onChange={(event) => setForm({ ...form, receivedAt: event.target.value })} />
                <select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value as ReceiptInput["method"] })}>
                    <option value="CASH">Numerário</option>
                    <option value="BANK_TRANSFER">Transferência bancária</option>
                    <option value="CARD">Cartão</option>
                    <option value="OTHER">Outro</option>
                </select>
                <input value={form.reference ?? ""} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="Referência" />
                <button type="submit" disabled={saving}>{saving ? "A guardar..." : "Registar recebimento"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}
```

Localização: `apps/api/src/modules/receipts/receiptService.test.js`.

```js
import test from "node:test";
import assert from "node:assert/strict";
import { registerReceipt } from "./receiptService.js";

test("bloqueia recebimento superior ao valor em aberto", async () => {
    const prisma = {
        fiscalPeriod: { findFirst: async () => ({ id: "period-1", isClosed: false }) },
        $transaction: async (callback) => callback({
            saleDocument: {
                findFirst: async () => ({ id: "sale-1", companyId: "company-1", status: "ISSUED", totalCents: 10000, amountPaidCents: 2500 }),
                update: async () => assert.fail("Não deve atualizar documento quando o valor excede o aberto"),
            },
            receipt: { create: async () => assert.fail("Não deve criar recebimento inválido") },
            auditLog: { create: async () => assert.fail("Não deve auditar recebimento recusado") },
        }),
    };

    await assert.rejects(
        () => registerReceipt(prisma, "company-1", "user-1", "sale-1", { amountCents: 999999, receivedAt: "2026-05-31", method: "BANK_TRANSFER" }),
        (error) => error.status === 400 && error.code === "AMOUNT_EXCEEDS_OPEN",
    );
});
```

5. Explicação do código.

A página `ReceiptsPage.tsx` fecha a parte visual deste BK: tem estado local, validação mínima, mensagens de erro/sucesso e chama endpoints reais através do cliente API. A UI ajuda o utilizador, mas as regras de segurança, multiempresa e fiscalidade continuam no backend.

O cliente API mantém o contrato entre UI e backend num ponto único. Os testes focam o comportamento que protege a contabilidade: validação, transação, estado e isolamento por empresa.

6. Validação do passo.

- Correr testes unitários do módulo.
- Fazer smoke via UI ou chamada HTTP autenticada.
- Confirmar que mensagens de erro são compreensíveis e não expõem detalhes internos.

7. Cenário negativo/erro esperado.

Se o backend devolver `400`, `401`, `403`, `404` ou `409`, a UI deve mostrar erro controlado e manter o formulário/listagem num estado recuperável.

### Passo 4 - Validar regras unitárias

1. Objetivo funcional do passo no ERP.
Confirmar que o service rejeita valores inválidos, documento inexistente, empresa errada e estado não emitido.
2. Ficheiros envolvidos:
- CRIAR: testes unitários do módulo.
- EDITAR: service apenas se o teste revelar falha.
- REVER: validações de montante, data, método e estado.
- LOCALIZAÇÃO: testes do backend.
3. Instruções do que fazer.
Executar os testes unitários antes de testar a UI.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:unit
```
5. Explicação do código.
O comando valida a regra de negócio no ponto onde a escrita é autorizada.
6. Validação do passo.
Os cenários negativos falham com `400`, `404` ou `409`.
7. Cenário negativo/erro esperado.
Um recebimento superior ao saldo em aberto deve devolver `AMOUNT_EXCEEDS_OPEN`.

### Passo 5 - Validar contrato HTTP

1. Objetivo funcional do passo no ERP.
Garantir respostas previsíveis para o endpoint de recebimentos.
2. Ficheiros envolvidos:
- CRIAR: testes de contrato.
- EDITAR: route se o contrato HTTP não estiver normalizado.
- REVER: autenticação e permissões.
- LOCALIZAÇÃO: testes de contrato do backend.
3. Instruções do que fazer.
Cobrir sessão ausente, empresa ausente, payload inválido e documento de outra empresa.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:contracts
```
5. Explicação do código.
O comando confirma que o frontend recebe erros consistentes e seguros.
6. Validação do passo.
Nenhum erro devolve stack trace.
7. Cenário negativo/erro esperado.
Sem sessão autenticada, a API deve devolver `401`.

### Passo 6 - Validar fluxo integrado

1. Objetivo funcional do passo no ERP.
Confirmar que o recebimento atualiza `amountPaidCents` e `status`.
2. Ficheiros envolvidos:
- CRIAR: teste de integração.
- EDITAR: cliente API ou página se a ligação falhar.
- REVER: estado visual de sucesso e erro.
- LOCALIZAÇÃO: testes de integração.
3. Instruções do que fazer.
Executar o fluxo com fatura emitida e saldo em aberto.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:integration
```
5. Explicação do código.
O comando valida a ligação entre API, persistência e UI.
6. Validação do passo.
Recebimento parcial mantém o documento aberto; recebimento total muda para `SETTLED`.
7. Cenário negativo/erro esperado.
Documento em `DRAFT`, `SUBMITTED`, `APPROVED` ou `REJECTED` deve devolver `409`.

### Passo 7 - Rever diff técnico

1. Objetivo funcional do passo no ERP.
Impedir alterações fora do domínio do BK.
2. Ficheiros envolvidos:
- CRIAR: nenhum.
- EDITAR: nenhum.
- REVER: diff completo.
- LOCALIZAÇÃO: raiz do repositório.
3. Instruções do que fazer.
Confirmar que todos os acessos usam `companyId` do contexto autenticado.
4. Código completo, correto e integrado com a app final.
```bash
git diff --check
```
5. Explicação do código.
O comando deteta problemas de whitespace antes da revisão.
6. Validação do passo.
O comando termina sem erros.
7. Cenário negativo/erro esperado.
Se falhar, corrigir as linhas indicadas.

### Passo 8 - Preparar evidência

1. Objetivo funcional do passo no ERP.
Fechar o BK com prova de implementação e validação.
2. Ficheiros envolvidos:
- CRIAR: nota de evidência.
- EDITAR: changelog se houver alteração real.
- REVER: critérios de aceite.
- LOCALIZAÇÃO: guia e PR.
3. Instruções do que fazer.
Registar comandos, resultados, decisão de estado e handoff para BKs financeiros seguintes.
4. Código completo, correto e integrado com a app final.
```bash
git diff -- docs/planificacao/guias-bk/MF1
```
5. Explicação do código.
O comando foca a revisão documental na MF1.
6. Validação do passo.
A evidência permite perceber o que mudou sem reler todo o código.
7. Cenário negativo/erro esperado.
Sem evidência de testes, não pedir revisão final.

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

O `BK-MF1-04` pode contabilizar vendas já emitidas; `BK-MF3-04` deve usar recebimentos para entradas futuras e realizadas.

## Changelog

- `2026-06-01`: Dependências técnicas canónicas alinhadas com a matriz, backlog e risco de PR da MF1.
- `2026-05-31`: Corrigida fundamentação documental, reutilização de `AuditLog`, auditoria do recebimento e teste autocontido.
- `2026-05-31`: Guia consolidado com contrato técnico completo, código por camada, validações e handoff MF1.
