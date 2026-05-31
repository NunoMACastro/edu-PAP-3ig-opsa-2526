# BK-MF1-08 - Registar pagamentos (parciais/totais).

## Header

- `doc_id`: `GUIA-BK-MF1-08`
- `bk_id`: `BK-MF1-08`
- `macro`: `MF1`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF20`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-09`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-08-registar-pagamentos-parciais-totais.md`
- `last_updated`: `2026-05-31`

## Objetivo

Executar RF20 para contas a pagar, seguindo os documentos canónicos e a stack contratada: React + Vite + TypeScript no frontend, Node.js + Express em ES Modules no backend, PostgreSQL e Prisma/equivalente na persistência.

## Importância funcional e pedagógica

Este BK transforma o requisito RF20 num caminho de implementação rastreável. Funcionalmente, fecha uma operação essencial da MF1; pedagogicamente, mostra como ligar requisito, modelo de dados, service, rota HTTP, UI, testes e evidência sem inventar regras fora dos documentos canónicos.

## Scope-in

- Pagamentos parciais e totais.
- Método, data e referência.
- Bloqueio por período fiscal fechado.
- Atualização transacional do documento de compra.

## Scope-out

- Reconciliação bancária.
- Gestão avançada de bancos e caixa.

## Estado antes

As compras têm totais e saldo pago, mas não há movimentos de pagamento registados.

## Estado depois

Cada pagamento a fornecedor fica registado, atualiza saldo pago e fecha a compra quando fica totalmente paga.

## Pré-requisitos

- Ler `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` e `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
- Confirmar que autenticação, contexto de empresa, roles/permissões e erros HTTP da MF0 estão disponíveis.
- Confirmar dependências canónicas: `BK-MF1-07`.
- Nunca receber `companyId` do corpo do pedido; usar sempre o contexto autenticado.

## Fundamentação documental

- `CANONICO`: `RF20` cobre pagamentos parciais/totais a fornecedores.
- `CANONICO`: `RF47` e `RNF17` exigem auditoria porque o pagamento altera dívida financeira.
- `DERIVADO`: `Payment` separa tesouraria de contabilização; o diário contabilístico continua no `BK-MF1-09`.
- `DERIVADO`: notas de crédito de fornecedor não recebem pagamentos neste fluxo porque reduzem dívida.

## Glossário

- **Documento canónico:** fonte documental que define RF/RNF, BK, owner, dependências e prioridade.
- **Service:** camada backend onde ficam regras de negócio e transações.
- **Validator:** função que rejeita entrada inválida antes de persistir dados.
- **Evidência:** registo objetivo de ficheiros alterados, comandos executados e resultado obtido.

## Conceitos teóricos essenciais

- **Pagamento:** e o valor pago a fornecedor para liquidar uma compra; vem do RF20 e e diferente de recebimento de cliente.
- **Saldo a pagar:** e `totalCents - amountPaidCents`; evita pagar acima do valor em aberto.
- **Pagamento parcial:** reduz a divida sem fechar totalmente o documento.
- **Pagamento total:** fecha a compra quando o valor pago iguala o total.
- **Nota de credito:** nao deve receber pagamento neste fluxo porque reduz divida em vez de criar uma saida normal.
- **Periodo fiscal:** bloqueia pagamentos em datas fechadas para manter rastreabilidade contabilistica.
- **Formulario React:** pede compra, valor, data, metodo e referencia; mostra erro recuperavel.
- **Handoff:** a previsao de tesouraria usa pagamentos como saidas futuras/realizadas.

## Arquitetura do BK

- Fluxo: `FLOW-MF1-PAYMENTS`
- Endpoint principal: `/api/purchases/documents/:id/payments`
- Módulo backend: `apps/api/src/modules/payments/`
- Cliente frontend: `apps/web/src/lib/paymentApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.

## Ficheiros a criar/editar/rever

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/payments/`
- `apps/api/src/server.js`
- `apps/web/src/lib/paymentApi.ts`
- `apps/web/src/pages/PaymentsPage.tsx`
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

Garantir que BK-MF1-08 implementa apenas RF20, com dependências, owner, prioridade e próximo BK iguais aos documentos canónicos.

2. Ficheiros envolvidos:
- CRIAR: nenhum ficheiro neste passo.
- EDITAR: nenhum ficheiro neste passo.
- REVER: documentos canónicos listados nos pré-requisitos.
- LOCALIZAÇÃO: topo deste guia e matriz/backlog.

3. Instruções do que fazer.

Confirmar que o BK é `BK-MF1-08`, requisito `RF20`, dependências `BK-MF1-07`, sprint `S03-S04` e próximo BK `BK-MF1-09`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-08
macro=MF1
rf=RF20
endpoint=/api/purchases/documents/:id/payments
deps=BK-MF1-07
```

5. Explicação do código.

As chaves acima formalizam o contrato mínimo do BK e devem bater certo com a matriz antes de qualquer alteração de código.

6. Validação do passo.

Comparar header do guia com `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`. Qualquer divergência bloqueia a implementação.

7. Cenário negativo/erro esperado.

Se surgir uma regra sem fonte documental, não a transformar em requisito; registar a incerteza na evidência e pedir decisão ao responsável.

### Passo 2 - Implementar dados e backend

1. Objetivo funcional do passo no ERP.

Criar a persistência e as regras backend para contas a pagar, com validação, transações e isolamento por empresa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/payments/` com service e routes.
- EDITAR: `apps/api/prisma/schema.prisma` e `apps/api/src/server.js`.
- REVER: BKs dependentes da MF0/MF1 indicados no header.
- LOCALIZAÇÃO: modelos Prisma no domínio correspondente e rota montada em `/api/purchases/documents/:id/payments`.

3. Instruções do que fazer.

Aplicar o schema, criar migration, implementar service antes da rota, usar `companyId` do contexto e devolver erros HTTP normalizados. Montar a rota em `server.js` junto das restantes rotas da app.

4. Código completo, correto e integrado com a app final.

Localização: `apps/api/prisma/schema.prisma`.

```prisma
enum PaymentMethod {
  CASH
  BANK_TRANSFER
  CARD
  OTHER
}

model Payment {
  id                 String        @id @default(uuid())
  companyId          String
  purchaseDocumentId String
  amountCents        Int
  paidAt             DateTime
  method             PaymentMethod
  reference          String?
  notes              String?
  createdById        String
  createdAt          DateTime      @default(now())

  company          Company          @relation(fields: [companyId], references: [id])
  purchaseDocument PurchaseDocument @relation(fields: [purchaseDocumentId], references: [id])

  @@index([companyId, paidAt])
  @@index([purchaseDocumentId])
}
```

Localização: no mesmo ficheiro, substituir estes modelos existentes pelas versões acumuladas até este BK.

```prisma
model Company {
  id                String              @id @default(uuid())
  name              String
  nif               String?             @unique
  memberships       CompanyMembership[]
  invitations       CompanyInvitation[]
  profile           CompanyProfile?
  accounts          Account[]
  fiscalPeriods     FiscalPeriod[]
  customers         Customer[]
  suppliers         Supplier[]
  items             Item[]
  warehouses        Warehouse[]
  vatRates          VatRate[]
  numberSequences   NumberSequence[]
  saleDocuments     SaleDocument[]
  receipts          Receipt[]
  journalEntries    JournalEntry[]
  purchaseDocuments PurchaseDocument[]
  payments          Payment[]
  auditLogs         AuditLog[]
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
}

model PurchaseDocument {
  id              String                 @id @default(uuid())
  companyId       String
  supplierId      String
  kind            PurchaseDocumentKind
  status          PurchaseDocumentStatus @default(APPROVED)
  supplierNumber  String
  issuedAt        DateTime
  dueDate         DateTime?
  subtotalCents   Int
  vatCents        Int
  totalCents      Int
  amountPaidCents Int                    @default(0)
  createdById     String
  payments        Payment[]
  createdAt       DateTime               @default(now())
  updatedAt       DateTime               @updatedAt

  company  Company                @relation(fields: [companyId], references: [id])
  supplier Supplier               @relation(fields: [supplierId], references: [id])
  lines    PurchaseDocumentLine[]

  @@unique([companyId, supplierId, supplierNumber])
  @@index([companyId, supplierId, issuedAt])
}
```

Localização: `apps/api/src/modules/payments/paymentService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const methods = new Set(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]);

function parsePaymentInput(input) {
    if (!input || typeof input !== "object") throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    const amountCents = Number(input.amountCents);
    const paidAt = new Date(input.paidAt);
    const method = String(input.method ?? "").toUpperCase();
    if (!Number.isInteger(amountCents) || amountCents <= 0) throw httpError(400, "INVALID_AMOUNT", "Valor pago invalido");
    if (Number.isNaN(paidAt.getTime())) throw httpError(400, "INVALID_DATE", "Data de pagamento invalida");
    if (!methods.has(method)) throw httpError(400, "INVALID_METHOD", "Metodo de pagamento invalido");
    return { amountCents, paidAt, method, reference: String(input.reference ?? "").trim() || null, notes: String(input.notes ?? "").trim() || null };
}

export async function registerPayment(prisma, companyId, userId, purchaseDocumentId, input) {
    const data = parsePaymentInput(input);
    await assertOpenFiscalPeriod(prisma, { companyId, documentDate: data.paidAt });

    return prisma.$transaction(async (tx) => {
        const document = await tx.purchaseDocument.findFirst({ where: { id: purchaseDocumentId, companyId } });
        if (!document) throw httpError(404, "PURCHASE_DOCUMENT_NOT_FOUND", "Documento de compra nao encontrado");
        if (document.kind === "SUPPLIER_CREDIT_NOTE") throw httpError(409, "CREDIT_NOTE_NOT_PAYABLE", "Notas de credito nao recebem pagamentos");
        if (!["APPROVED", "POSTED", "PAID"].includes(document.status)) throw httpError(409, "INVALID_STATUS", "Apenas compras aprovadas ou lancadas podem receber pagamentos");
        const openAmount = document.totalCents - document.amountPaidCents;
        if (openAmount <= 0) throw httpError(409, "DOCUMENT_ALREADY_PAID", "Documento ja pago");
        if (data.amountCents > openAmount) throw httpError(400, "AMOUNT_EXCEEDS_OPEN", "Valor excede o montante em aberto");

        const payment = await tx.payment.create({ data: { ...data, companyId, purchaseDocumentId, createdById: userId } });
        const nextPaid = document.amountPaidCents + data.amountCents;
        await tx.purchaseDocument.update({ where: { id: document.id }, data: { amountPaidCents: nextPaid, status: nextPaid === document.totalCents ? "PAID" : document.status } });
        await tx.auditLog.create({
            data: {
                companyId,
                userId,
                action: "PAYMENT_REGISTERED",
                entity: "Payment",
                entityId: payment.id,
                details: { purchaseDocumentId, amountCents: data.amountCents, resultingAmountPaidCents: nextPaid },
            },
        });
        return payment;
    });
}
```

Localização: `apps/api/src/modules/payments/paymentRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { registerPayment } from "./paymentService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildPaymentRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL")];
    router.post("/:id/payments", guards, async (req, res) => {
        try {
            const data = await registerPayment(prisma, req.companyId, req.user.id, req.params.id, req.body);
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
import { buildPaymentRoutes } from "./modules/payments/paymentRoutes.js";

app.use("/api/purchases/documents", buildPaymentRoutes({ prisma }));
```

5. Explicação do código.

O schema define as invariantes persistentes. O service concentra validação, cálculo, transações e regras de estado. A route só trata transporte HTTP, autenticação, contexto de empresa e resposta. Esta separação facilita testes e reduz regressões entre MF1 e MF3.

6. Validação do passo.

Executar teste unitário do service, teste de contrato do endpoint `/api/purchases/documents/:id/payments` e confirmar que todos os registos criados pertencem a `req.companyId`.

7. Cenário negativo/erro esperado.

Entrada inválida deve falhar antes do Prisma; estado inválido deve devolver `409`; ausência de recurso dentro da empresa ativa deve devolver `404`.

### Passo 3 - Implementar frontend, testes e handoff

1. Objetivo funcional do passo no ERP.

Disponibilizar a operação ao utilizador, com cliente API tipado, estados de carregamento/erro/sucesso e evidência que permita revisão técnica.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/lib/paymentApi.ts` e página/componente do domínio.
- EDITAR: rotas frontend existentes, se a app já tiver router.
- REVER: `apps/web/src/lib/apiClient.ts` e componentes de formulário/listagem já usados na MF0.
- LOCALIZAÇÃO: módulo visual correspondente à operação da MF1.

3. Instruções do que fazer.

Criar funções de API tipadas, consumir erros normalizados do backend e mostrar mensagens claras. Não recalcular no frontend valores que o backend já calcula como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Localização: `apps/web/src/lib/paymentApi.ts`.

```ts
import { apiClient } from "./apiClient";

export type PaymentInput = { amountCents: number; paidAt: string; method: "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER"; reference?: string; notes?: string };

export async function registerPayment(purchaseDocumentId: string, input: PaymentInput) {
    return apiClient.post("/api/purchases/documents/" + purchaseDocumentId + "/payments", input);
}
```

Localização: `apps/web/src/pages/PaymentsPage.tsx`.

```tsx
// apps/web/src/pages/PaymentsPage.tsx
import { FormEvent, useState } from "react";
import { registerPayment, type PaymentInput } from "../lib/paymentApi";

const emptyForm: PaymentInput & { purchaseDocumentId: string } = {
    purchaseDocumentId: "",
    amountCents: 0,
    paidAt: new Date().toISOString().slice(0, 10),
    method: "BANK_TRANSFER",
    reference: "",
    notes: "",
};

export function PaymentsPage() {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        if (!form.purchaseDocumentId || form.amountCents <= 0 || !form.paidAt) {
            setError("Preenche compra, valor e data do pagamento.");
            return;
        }
        setSaving(true);
        try {
            await registerPayment(form.purchaseDocumentId, form);
            setForm(emptyForm);
            setSuccess("Pagamento registado com sucesso.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nao foi possivel registar o pagamento.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main>
            <h1>Pagamentos</h1>
            <form onSubmit={handleSubmit} aria-label="Registar pagamento">
                <input value={form.purchaseDocumentId} onChange={(event) => setForm({ ...form, purchaseDocumentId: event.target.value })} placeholder="ID do documento de compra" />
                <input type="number" value={form.amountCents} onChange={(event) => setForm({ ...form, amountCents: Number(event.target.value) })} />
                <input type="date" value={form.paidAt} onChange={(event) => setForm({ ...form, paidAt: event.target.value })} />
                <select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value as PaymentInput["method"] })}>
                    <option value="CASH">Numerario</option>
                    <option value="BANK_TRANSFER">Transferencia bancaria</option>
                    <option value="CARD">Cartao</option>
                    <option value="OTHER">Outro</option>
                </select>
                <input value={form.reference ?? ""} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="Referencia" />
                <button type="submit" disabled={saving}>{saving ? "A guardar..." : "Registar pagamento"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}
```

Localização: `apps/api/src/modules/payments/paymentService.test.js`.

```js
import test from "node:test";
import assert from "node:assert/strict";
import { registerPayment } from "./paymentService.js";

test("bloqueia pagamento superior ao valor em aberto", async () => {
    const prisma = {
        fiscalPeriod: { findFirst: async () => ({ id: "period-1", isClosed: false }) },
        $transaction: async (callback) => callback({
            purchaseDocument: {
                findFirst: async () => ({ id: "purchase-1", companyId: "company-1", kind: "SUPPLIER_INVOICE", status: "APPROVED", totalCents: 10000, amountPaidCents: 2500 }),
                update: async () => assert.fail("Nao deve atualizar compra quando o valor excede o aberto"),
            },
            payment: { create: async () => assert.fail("Nao deve criar pagamento invalido") },
            auditLog: { create: async () => assert.fail("Nao deve auditar pagamento recusado") },
        }),
    };

    await assert.rejects(
        () => registerPayment(prisma, "company-1", "user-1", "purchase-1", { amountCents: 999999, paidAt: "2026-05-31", method: "BANK_TRANSFER" }),
        (error) => error.status === 400 && error.code === "AMOUNT_EXCEEDS_OPEN",
    );
});
```

5. Explicação do código.

A pagina `PaymentsPage.tsx` fecha a parte visual deste BK: tem estado local, validacao minima, mensagens de erro/sucesso e chama endpoints reais atraves do cliente API. A UI ajuda o utilizador, mas as regras de seguranca, multiempresa e fiscalidade continuam no backend.

O cliente API mantém o contrato entre UI e backend num ponto único. Os testes focam o comportamento que protege a contabilidade: validação, transação, estado e isolamento por empresa.

6. Validação do passo.

- Correr testes unitários do módulo.
- Fazer smoke via UI ou chamada HTTP autenticada.
- Confirmar que mensagens de erro são compreensíveis e não expõem detalhes internos.

7. Cenário negativo/erro esperado.

Se o backend devolver `400`, `401`, `403`, `404` ou `409`, a UI deve mostrar erro controlado e manter o formulário/listagem num estado recuperável.

### Passo 4 - Validar regras unitárias

1. Objetivo funcional do passo no ERP.
Confirmar que o service só paga compras aprovadas ou lançadas, rejeita notas de crédito e bloqueia valores acima do saldo.
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
O comando valida a regra de negócio no ponto onde o pagamento é gravado.
6. Validação do passo.
Pagamento parcial mantém saldo em aberto; pagamento total muda para `PAID`.
7. Cenário negativo/erro esperado.
Pagamento superior ao saldo deve devolver `AMOUNT_EXCEEDS_OPEN`.

### Passo 5 - Validar contrato HTTP

1. Objetivo funcional do passo no ERP.
Garantir respostas previsíveis para o endpoint de pagamentos.
2. Ficheiros envolvidos:
- CRIAR: testes de contrato.
- EDITAR: route se o contrato HTTP não estiver normalizado.
- REVER: autenticação e permissões.
- LOCALIZAÇÃO: testes de contrato do backend.
3. Instruções do que fazer.
Cobrir sessão ausente, empresa ausente, payload inválido e compra de outra empresa.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:contracts
```
5. Explicação do código.
O comando confirma que o frontend recebe erros consistentes e seguros.
6. Validação do passo.
Nenhum erro devolve stack trace.
7. Cenário negativo/erro esperado.
Compra em `DRAFT` deve devolver `INVALID_STATUS`; nota de crédito deve devolver `CREDIT_NOTE_NOT_PAYABLE`.

### Passo 6 - Validar fluxo integrado

1. Objetivo funcional do passo no ERP.
Confirmar que o pagamento atualiza `amountPaidCents` e `status`.
2. Ficheiros envolvidos:
- CRIAR: teste de integração.
- EDITAR: cliente API ou página se a ligação falhar.
- REVER: estado visual de sucesso e erro.
- LOCALIZAÇÃO: testes de integração.
3. Instruções do que fazer.
Executar o fluxo com compra `APPROVED` ou `POSTED` e saldo em aberto.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:integration
```
5. Explicação do código.
O comando valida a ligação entre API, persistência e UI.
6. Validação do passo.
O valor pago fica refletido no documento de compra.
7. Cenário negativo/erro esperado.
Compra já paga deve devolver `DOCUMENT_ALREADY_PAID`.

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
Registar comandos, resultados, decisão de estado e impacto no forecast financeiro.
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

- Cada pagamento a fornecedor fica registado, atualiza saldo pago e fecha a compra quando fica totalmente paga.
- Endpoint `/api/purchases/documents/:id/payments` protegido e filtrado por empresa.
- Testes cobrem pelo menos um caso feliz e três cenários negativos relevantes.
- Evidência lista schema, services, rotas, UI e comandos executados.

## Critérios de aceite

- RF20 fica coberto sem alterar o contrato canónico do BK.
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

O `BK-MF1-09` contabiliza a compra; `BK-MF3-04` usa pagamentos para saídas realizadas e futuras.

## Changelog

- `2026-05-31`: Corrigida fundamentação documental, relações inversas de pagamentos, auditoria do pagamento e teste autocontido.
- `2026-05-31`: Guia consolidado com contrato técnico completo, código por camada, validações e handoff MF1.
