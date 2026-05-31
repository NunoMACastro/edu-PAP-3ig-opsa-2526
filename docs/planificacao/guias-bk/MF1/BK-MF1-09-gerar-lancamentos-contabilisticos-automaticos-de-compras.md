# BK-MF1-09 - Gerar lançamentos contabilísticos automáticos de compras.

## Header

- `doc_id`: `GUIA-BK-MF1-09`
- `bk_id`: `BK-MF1-09`
- `macro`: `MF1`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-07`
- `rf_rnf`: `RF21`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-10`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-09-gerar-lancamentos-contabilisticos-automaticos-de-compras.md`
- `last_updated`: `2026-05-31`

## Objetivo

Executar RF21 para contabilidade de compras, seguindo os documentos canónicos e a stack contratada: React + Vite + TypeScript no frontend, Node.js + Express em ES Modules no backend, PostgreSQL e Prisma/equivalente na persistência.

## Importância funcional e pedagógica

Este BK transforma o requisito RF21 num caminho de implementação rastreável. Funcionalmente, fecha uma operação essencial da MF1; pedagogicamente, mostra como ligar requisito, modelo de dados, service, rota HTTP, UI, testes e evidência sem inventar regras fora dos documentos canónicos.

## Scope-in

- Diário automático de compra.
- Débitos de gasto e IVA dedutível.
- Crédito de fornecedor.
- Idempotência por documento.

## Scope-out

- Lançamentos manuais.
- Mapa de IVA, que pertence a `BK-MF3-01`.

## Estado antes

A compra existe como documento operacional, mas ainda não gera diário contabilístico.

## Estado depois

Uma compra registada/aprovada gera lançamento equilibrado com gastos, IVA dedutível e fornecedor.

## Pré-requisitos

- Ler `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` e `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
- Confirmar que autenticação, contexto de empresa, roles/permissões e erros HTTP da MF0 estão disponíveis.
- Confirmar dependências canónicas: `BK-MF1-07`.
- Nunca receber `companyId` do corpo do pedido; usar sempre o contexto autenticado.

## Glossário

- **Documento canónico:** fonte documental que define RF/RNF, BK, owner, dependências e prioridade.
- **Service:** camada backend onde ficam regras de negócio e transações.
- **Validator:** função que rejeita entrada inválida antes de persistir dados.
- **Evidência:** registo objetivo de ficheiros alterados, comandos executados e resultado obtido.

## Conceitos teóricos essenciais

- **Lancamento de compra:** transforma a compra operacional em diario contabilistico; vem do RF21 e prepara mapas de IVA.
- **Conta 62:** representa gastos ou compras; recebe debito em fatura normal.
- **Conta 2432:** representa IVA dedutivel; recebe debito quando a empresa pode deduzir IVA.
- **Conta 221:** representa fornecedores; recebe credito pelo valor a pagar.
- **Nota de credito de fornecedor:** inverte fornecedor, gasto e IVA dedutivel para reduzir a divida.
- **Idempotencia:** impede contabilizar a mesma compra duas vezes.
- **Periodo fiscal aberto:** bloqueia lancamento quando o periodo esta fechado.
- **Frontend:** dispara contabilizacao e mostra feedback; os valores contabilisticos ficam sempre no backend.

## Arquitetura do BK

- Fluxo: `FLOW-MF1-PURCHASE-POSTING`
- Endpoint principal: `/api/accounting/purchase-postings/:purchaseDocumentId`
- Módulo backend: `apps/api/src/modules/accounting/`
- Cliente frontend: `apps/web/src/lib/accountingApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.

## Ficheiros a criar/editar/rever

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/accounting/`
- `apps/api/src/server.js`
- `apps/web/src/lib/accountingApi.ts`
- `apps/web/src/pages/PurchasePostingsPage.tsx`
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

Garantir que BK-MF1-09 implementa apenas RF21, com dependências, owner, prioridade e próximo BK iguais aos documentos canónicos.

2. Ficheiros envolvidos:
- CRIAR: nenhum ficheiro neste passo.
- EDITAR: nenhum ficheiro neste passo.
- REVER: documentos canónicos listados nos pré-requisitos.
- LOCALIZAÇÃO: topo deste guia e matriz/backlog.

3. Instruções do que fazer.

Confirmar que o BK é `BK-MF1-09`, requisito `RF21`, dependências `BK-MF1-07`, sprint `S03-S04` e próximo BK `BK-MF1-10`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-09
macro=MF1
rf=RF21
endpoint=/api/accounting/purchase-postings/:purchaseDocumentId
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

Criar a persistência e as regras backend para contabilidade de compras, com validação, transações e isolamento por empresa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/accounting/` com service e routes.
- EDITAR: `apps/api/prisma/schema.prisma` e `apps/api/src/server.js`.
- REVER: BKs dependentes da MF0/MF1 indicados no header.
- LOCALIZAÇÃO: modelos Prisma no domínio correspondente e rota montada em `/api/accounting/purchase-postings/:purchaseDocumentId`.

3. Instruções do que fazer.

Aplicar o schema, criar migration, implementar service antes da rota, usar `companyId` do contexto e devolver erros HTTP normalizados. Montar a rota em `server.js` junto das restantes rotas da app.

4. Código completo, correto e integrado com a app final.

Localização: `apps/api/prisma/schema.prisma`.

```prisma
enum JournalSource {
  SALE
  PURCHASE
  MANUAL
}
```

Localização: `apps/api/src/modules/accounting/purchasePostingService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

function assertBalanced(lines) {
    const debit = lines.reduce((sum, line) => sum + line.debitCents, 0);
    const credit = lines.reduce((sum, line) => sum + line.creditCents, 0);
    if (debit !== credit) throw httpError(500, "UNBALANCED_ENTRY", "Lancamento desequilibrado");
}

async function accountByCode(tx, companyId, code) {
    const account = await tx.account.findFirst({ where: { companyId, code, isActive: true } });
    if (!account) throw httpError(409, "ACCOUNT_NOT_FOUND", "Conta SNC em falta: " + code);
    return account;
}

export async function postPurchaseDocument(prisma, companyId, userId, purchaseDocumentId) {
    return prisma.$transaction(async (tx) => {
        const document = await tx.purchaseDocument.findFirst({ where: { id: purchaseDocumentId, companyId }, include: { lines: true } });
        if (!document) throw httpError(404, "PURCHASE_DOCUMENT_NOT_FOUND", "Documento de compra nao encontrado");
        if (document.status !== "APPROVED" && document.status !== "PAID") throw httpError(409, "INVALID_STATUS", "Apenas compras aprovadas ou pagas podem ser contabilizadas");
        await assertOpenFiscalPeriod(tx, companyId, document.issuedAt);

        const expenseAccount = await accountByCode(tx, companyId, "62");
        const vatAccount = await accountByCode(tx, companyId, "2432");
        const supplierAccount = await accountByCode(tx, companyId, "221");
        const isCreditNote = document.kind === "SUPPLIER_CREDIT_NOTE";
        const lines = isCreditNote
            ? [
                // A nota de crédito reduz a dívida ao fornecedor e reverte gasto e IVA dedutível.
                { accountId: supplierAccount.id, debitCents: document.totalCents, creditCents: 0, memo: "Credito de fornecedor" },
                { accountId: expenseAccount.id, debitCents: 0, creditCents: document.subtotalCents, memo: "Reversao de gasto" },
                { accountId: vatAccount.id, debitCents: 0, creditCents: document.vatCents, memo: "Reversao de IVA dedutivel" },
            ]
            : [
                { accountId: expenseAccount.id, debitCents: document.subtotalCents, creditCents: 0, memo: "Compra" },
                { accountId: vatAccount.id, debitCents: document.vatCents, creditCents: 0, memo: "IVA dedutivel" },
                { accountId: supplierAccount.id, debitCents: 0, creditCents: document.totalCents, memo: "Fornecedor" },
            ];
        const nonZeroLines = lines.filter((line) => line.debitCents > 0 || line.creditCents > 0);
        assertBalanced(nonZeroLines);

        try {
            const entry = await tx.journalEntry.create({ data: { companyId, source: "PURCHASE", sourceId: document.id, entryDate: document.issuedAt, description: "Compra " + document.supplierNumber, createdById: userId, lines: { create: nonZeroLines } }, include: { lines: true } });
            await tx.purchaseDocument.update({ where: { id: document.id }, data: { status: document.status === "PAID" ? "PAID" : "POSTED" } });
            return entry;
        } catch (error) {
            if (error.code === "P2002") throw httpError(409, "PURCHASE_ALREADY_POSTED", "Compra ja contabilizada");
            throw error;
        }
    });
}
```

Localização: `apps/api/src/modules/accounting/purchasePostingRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { postPurchaseDocument } from "./purchasePostingService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildPurchasePostingRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA")];
    router.post("/:purchaseDocumentId", guards, async (req, res) => {
        try {
            const data = await postPurchaseDocument(prisma, req.companyId, req.user.id, req.params.purchaseDocumentId);
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
import { buildPurchasePostingRoutes } from "./modules/accounting/purchasePostingRoutes.js";

app.use("/api/accounting/purchase-postings", buildPurchasePostingRoutes({ prisma }));
```

5. Explicação do código.

O schema define as invariantes persistentes. O service concentra validação, cálculo, transações e regras de estado. Para faturas de fornecedor, o lançamento debita gasto e IVA dedutível e credita fornecedor. Para notas de crédito, faz o inverso para reduzir a dívida e reverter gasto/IVA. A compra já paga também pode ser contabilizada porque o pagamento e o lançamento são responsabilidades diferentes. A route só trata transporte HTTP, autenticação, contexto de empresa e resposta.

6. Validação do passo.

Executar teste unitário do service, teste de contrato do endpoint `/api/accounting/purchase-postings/:purchaseDocumentId` e confirmar que todos os registos criados pertencem a `req.companyId`.

7. Cenário negativo/erro esperado.

Entrada inválida deve falhar antes do Prisma; estado inválido deve devolver `409`; ausência de recurso dentro da empresa ativa deve devolver `404`.

### Passo 3 - Implementar frontend, testes e handoff

1. Objetivo funcional do passo no ERP.

Disponibilizar a operação ao utilizador, com cliente API tipado, estados de carregamento/erro/sucesso e evidência que permita revisão técnica.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/lib/accountingApi.ts` e página/componente do domínio.
- EDITAR: rotas frontend existentes, se a app já tiver router.
- REVER: `apps/web/src/lib/apiClient.ts` e componentes de formulário/listagem já usados na MF0.
- LOCALIZAÇÃO: módulo visual correspondente à operação da MF1.

3. Instruções do que fazer.

Criar funções de API tipadas, consumir erros normalizados do backend e mostrar mensagens claras. Não recalcular no frontend valores que o backend já calcula como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Localização: `apps/web/src/lib/accountingApi.ts`.

```ts
import { apiClient } from "./apiClient";

export async function postPurchaseDocument(purchaseDocumentId: string) {
    return apiClient.post("/api/accounting/purchase-postings/" + purchaseDocumentId, {});
}
```

Localização: `apps/web/src/pages/PurchasePostingsPage.tsx`.

```tsx
// apps/web/src/pages/PurchasePostingsPage.tsx
import { FormEvent, useState } from "react";
import { postPurchaseDocument } from "../lib/accountingApi";

export function PurchasePostingsPage() {
    const [purchaseDocumentId, setPurchaseDocumentId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        if (!purchaseDocumentId.trim()) {
            setError("Indica o documento de compra a contabilizar.");
            return;
        }
        setLoading(true);
        try {
            await postPurchaseDocument(purchaseDocumentId.trim());
            setSuccess("Lancamento contabilistico da compra criado com sucesso.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nao foi possivel contabilizar a compra.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Contabilizar compra</h1>
            <form onSubmit={handleSubmit} aria-label="Contabilizar compra">
                <input value={purchaseDocumentId} onChange={(event) => setPurchaseDocumentId(event.target.value)} placeholder="ID do documento de compra" />
                <button type="submit" disabled={loading}>{loading ? "A contabilizar..." : "Criar lancamento"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
        </main>
    );
}
```

Localização: teste unitário ou de contrato do service.

```js
it("nao duplica diario da mesma compra", async () => {
    await postPurchaseDocument(prisma, companyId, userId, purchaseDocumentId);
    await expect(postPurchaseDocument(prisma, companyId, userId, purchaseDocumentId))
        .rejects.toMatchObject({ status: 409, code: "PURCHASE_ALREADY_POSTED" });
});
```

5. Explicação do código.

A pagina `PurchasePostingsPage.tsx` fecha a parte visual deste BK: tem estado local, validacao minima, mensagens de erro/sucesso e chama endpoints reais atraves do cliente API. A UI ajuda o utilizador, mas as regras de seguranca, multiempresa e fiscalidade continuam no backend.

O cliente API mantém o contrato entre UI e backend num ponto único. Os testes focam o comportamento que protege a contabilidade: validação, transação, estado e isolamento por empresa.

6. Validação do passo.

- Correr testes unitários do módulo.
- Fazer smoke via UI ou chamada HTTP autenticada.
- Confirmar que mensagens de erro são compreensíveis e não expõem detalhes internos.

7. Cenário negativo/erro esperado.

Se o backend devolver `400`, `401`, `403`, `404` ou `409`, a UI deve mostrar erro controlado e manter o formulário/listagem num estado recuperável.

### Passo 4 - Validar regras unitárias

1. Objetivo funcional do passo no ERP.
Confirmar que o service só contabiliza compras aprovadas ou pagas, e que o lançamento fica equilibrado.
2. Ficheiros envolvidos:
- CRIAR: testes unitários do módulo.
- EDITAR: service apenas se o teste revelar falha.
- REVER: contas SNC, totais e estado da compra.
- LOCALIZAÇÃO: testes do backend.
3. Instruções do que fazer.
Executar os testes unitários antes de testar a UI.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:unit
```
5. Explicação do código.
O comando valida a regra de negócio no ponto onde o lançamento é criado.
6. Validação do passo.
O débito total é igual ao crédito total.
7. Cenário negativo/erro esperado.
Compra em `DRAFT` deve devolver `INVALID_STATUS`.

### Passo 5 - Validar contrato HTTP

1. Objetivo funcional do passo no ERP.
Garantir respostas previsíveis para o endpoint de contabilização de compras.
2. Ficheiros envolvidos:
- CRIAR: testes de contrato.
- EDITAR: route se o contrato HTTP não estiver normalizado.
- REVER: autenticação e permissões.
- LOCALIZAÇÃO: testes de contrato do backend.
3. Instruções do que fazer.
Cobrir sessão ausente, empresa ausente, contas em falta e compra já contabilizada.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:contracts
```
5. Explicação do código.
O comando confirma que o frontend recebe erros consistentes e seguros.
6. Validação do passo.
Nenhum erro devolve stack trace.
7. Cenário negativo/erro esperado.
Compra já contabilizada deve devolver `PURCHASE_ALREADY_POSTED`.

### Passo 6 - Validar fluxo integrado

1. Objetivo funcional do passo no ERP.
Confirmar que a compra aprovada gera lançamento contabilístico automático.
2. Ficheiros envolvidos:
- CRIAR: teste de integração.
- EDITAR: cliente API ou página se a ligação falhar.
- REVER: estado visual de sucesso e erro.
- LOCALIZAÇÃO: testes de integração.
3. Instruções do que fazer.
Executar o fluxo com compra `APPROVED` ou `PAID`, contas ativas e período fiscal aberto.
4. Código completo, correto e integrado com a app final.
```bash
npm run test:integration
```
5. Explicação do código.
O comando valida a ligação entre API, persistência e UI.
6. Validação do passo.
O lançamento fica associado a `source=PURCHASE` e `sourceId` do documento.
7. Cenário negativo/erro esperado.
Período fiscal fechado deve bloquear a contabilização.

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
Registar comandos, resultados, decisão contabilística e impacto em mapas de IVA.
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

- Uma compra registada/aprovada gera lançamento equilibrado com gastos, IVA dedutível e fornecedor.
- Endpoint `/api/accounting/purchase-postings/:purchaseDocumentId` protegido e filtrado por empresa.
- Testes cobrem pelo menos um caso feliz e três cenários negativos relevantes.
- Evidência lista schema, services, rotas, UI e comandos executados.

## Critérios de aceite

- RF21 fica coberto sem alterar o contrato canónico do BK.
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

O `BK-MF3-01` deve ler `JournalEntry` com `source=PURCHASE` e contas de IVA para apurar IVA dedutível.

## Changelog

- `2026-05-31`: Guia consolidado com contrato técnico completo, código por camada, validações e handoff MF1.
