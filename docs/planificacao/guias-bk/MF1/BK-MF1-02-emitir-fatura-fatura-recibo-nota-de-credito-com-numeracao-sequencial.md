# BK-MF1-02 - Emitir Fatura, Fatura-Recibo, Nota de Crédito, com numeração sequencial.

## Header

- `doc_id`: `GUIA-BK-MF1-02`
- `bk_id`: `BK-MF1-02`
- `macro`: `MF1`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-09, BK-MF0-11, BK-MF1-01`
- `rf_rnf`: `RF14`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-03`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-02-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md`
- `last_updated`: `2026-05-31`

## Objetivo

Executar RF14 para vendas, seguindo os documentos canónicos e a stack contratada: React + Vite + TypeScript no frontend, Node.js + Express em ES Modules no backend, PostgreSQL e Prisma/equivalente na persistência.

## Importância funcional e pedagógica

Este BK transforma o requisito RF14 num caminho de implementação rastreável. Funcionalmente, fecha uma operação essencial da MF1; pedagogicamente, mostra como ligar requisito, modelo de dados, service, rota HTTP, UI, testes e evidência sem inventar regras fora dos documentos canónicos.

## Scope-in

- Fatura, fatura-recibo e nota de crédito.
- Sequência por empresa, ano e tipo de documento.
- Cálculo backend de subtotal, IVA e total.
- Ligação a cliente, artigo e taxa de IVA.
- Endpoint protegido para criação e listagem.

## Scope-out

- Envio por email.
- SAF-T definitivo.
- Contabilização automática, que pertence a `BK-MF1-04`.

## Estado antes

Existem clientes, artigos e IVA, mas ainda não existe documento fiscal de venda com linhas, totais e numeração.

## Estado depois

A aplicação emite documentos de venda por empresa, com sequência atómica, linhas validadas, totais calculados no backend e estado controlado.

## Pré-requisitos

- Ler `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` e `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
- Confirmar que autenticação, contexto de empresa, roles/permissões e erros HTTP da MF0 estão disponíveis.
- Confirmar dependências canónicas: `BK-MF0-09, BK-MF0-11, BK-MF1-01`.
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

- Fluxo: `FLOW-MF1-SALE-DOCUMENTS`
- Endpoint principal: `/api/sales/documents`
- Módulo backend: `apps/api/src/modules/sales/`
- Cliente frontend: `apps/web/src/lib/salesApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.

## Ficheiros a criar/editar/rever

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/sales/`
- `apps/api/src/server.js`
- `apps/web/src/lib/salesApi.ts`
- `apps/web/src/pages/SaleDocumentsPage.tsx`
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

Garantir que BK-MF1-02 implementa apenas RF14, com dependências, owner, prioridade e próximo BK iguais aos documentos canónicos.

2. Ficheiros envolvidos:
- CRIAR: nenhum ficheiro neste passo.
- EDITAR: nenhum ficheiro neste passo.
- REVER: documentos canónicos listados nos pré-requisitos.
- LOCALIZAÇÃO: topo deste guia e matriz/backlog.

3. Instruções do que fazer.

Confirmar que o BK é `BK-MF1-02`, requisito `RF14`, dependências `BK-MF0-09, BK-MF0-11, BK-MF1-01`, sprint `S03-S04` e próximo BK `BK-MF1-03`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-02
macro=MF1
rf=RF14
endpoint=/api/sales/documents
deps=BK-MF0-09, BK-MF0-11, BK-MF1-01
```

5. Explicação do código.

As chaves acima formalizam o contrato mínimo do BK e devem bater certo com a matriz antes de qualquer alteração de código.

6. Validação do passo.

Comparar header do guia com `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`. Qualquer divergência bloqueia a implementação.

7. Cenário negativo/erro esperado.

Se surgir uma regra sem fonte documental, não a transformar em requisito; registar a incerteza na evidência e pedir decisão ao responsável.

### Passo 2 - Implementar dados e backend

1. Objetivo funcional do passo no ERP.

Criar a persistência e as regras backend para vendas, com validação, transações e isolamento por empresa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/sales/` com service e routes.
- EDITAR: `apps/api/prisma/schema.prisma` e `apps/api/src/server.js`.
- REVER: BKs dependentes da MF0/MF1 indicados no header.
- LOCALIZAÇÃO: modelos Prisma no domínio correspondente e rota montada em `/api/sales/documents`.

3. Instruções do que fazer.

Aplicar o schema, criar migration, implementar service antes da rota, usar `companyId` do contexto e devolver erros HTTP normalizados. Montar a rota em `server.js` junto das restantes rotas da app.

4. Código completo, correto e integrado com a app final.

Localização: `apps/api/prisma/schema.prisma`.

```prisma
enum SaleDocumentKind {
  INVOICE
  INVOICE_RECEIPT
  CREDIT_NOTE
}

enum SaleDocumentStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  ISSUED
  SETTLED
}

model NumberSequence {
  id        String   @id @default(uuid())
  companyId String
  scope     String
  year      Int
  prefix    String
  nextValue Int      @default(1)
  updatedAt DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, scope, year])
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
  issuedById      String?
  issuedDefinitiveAt DateTime?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  company  Company  @relation(fields: [companyId], references: [id])
  customer Customer @relation(fields: [customerId], references: [id])
  lines    SaleDocumentLine[]

  @@unique([companyId, number])
  @@index([companyId, customerId, issuedAt])
}

model SaleDocumentLine {
  id             String @id @default(uuid())
  saleDocumentId String
  itemId         String
  vatRateId      String
  description    String
  quantity       Int
  unitPriceCents Int
  subtotalCents  Int
  vatCents       Int
  totalCents     Int

  saleDocument SaleDocument @relation(fields: [saleDocumentId], references: [id])
  item         Item         @relation(fields: [itemId], references: [id])
  vatRate      VatRate      @relation(fields: [vatRateId], references: [id])
}
```

Localização: `apps/api/src/modules/sales/saleDocumentService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const saleKinds = new Set(["INVOICE", "INVOICE_RECEIPT", "CREDIT_NOTE"]);

function toDate(value, field) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw httpError(400, "INVALID_DATE", field + " invalida");
    return date;
}

function parseLine(line) {
    const quantity = Number(line.quantity);
    const unitPriceCents = Number(line.unitPriceCents);
    if (!line.itemId) throw httpError(400, "INVALID_ITEM", "Artigo obrigatorio");
    if (!line.vatRateId) throw httpError(400, "INVALID_VAT", "Taxa de IVA obrigatoria");
    if (!Number.isInteger(quantity) || quantity <= 0) throw httpError(400, "INVALID_QUANTITY", "Quantidade invalida");
    if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) throw httpError(400, "INVALID_PRICE", "Preco invalido");
    return { itemId: line.itemId, vatRateId: line.vatRateId, description: String(line.description ?? "").trim(), quantity, unitPriceCents };
}

async function nextSaleNumber(tx, companyId, kind, issuedAt) {
    const year = issuedAt.getUTCFullYear();
    const scope = "SALE_" + kind;
    const prefix = kind + "-" + year + "-";
    const sequence = await tx.numberSequence.findUnique({ where: { companyId_scope_year: { companyId, scope, year } } });

    // A sequência só avança dentro da transação que emite o documento definitivo.
    if (!sequence) {
        await tx.numberSequence.create({ data: { companyId, scope, year, prefix, nextValue: 2 } });
        return prefix + "000001";
    }

    await tx.numberSequence.update({ where: { id: sequence.id }, data: { nextValue: { increment: 1 } } });
    return sequence.prefix + String(sequence.nextValue).padStart(6, "0");
}

export async function createSaleDocument(prisma, companyId, userId, input) {
    if (!input || typeof input !== "object") throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    const kind = String(input.kind ?? "").toUpperCase();
    if (!saleKinds.has(kind)) throw httpError(400, "INVALID_KIND", "Tipo de documento invalido");
    if (!input.customerId) throw httpError(400, "INVALID_CUSTOMER", "Cliente obrigatorio");
    const issuedAt = toDate(input.issuedAt, "issuedAt");
    const dueDate = input.dueDate ? toDate(input.dueDate, "dueDate") : null;
    const lines = Array.isArray(input.lines) ? input.lines.map(parseLine) : [];
    if (lines.length === 0) throw httpError(400, "EMPTY_LINES", "Documento sem linhas");

    await assertOpenFiscalPeriod(prisma, companyId, issuedAt);

    return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findFirst({ where: { id: input.customerId, companyId, isActive: true } });
        if (!customer) throw httpError(404, "CUSTOMER_NOT_FOUND", "Cliente nao encontrado");

        const vatRates = await tx.vatRate.findMany({ where: { id: { in: lines.map((line) => line.vatRateId) }, companyId, isActive: true } });
        const vatById = new Map(vatRates.map((rate) => [rate.id, rate]));
        const computedLines = lines.map((line) => {
            const vatRate = vatById.get(line.vatRateId);
            if (!vatRate) throw httpError(400, "VAT_RATE_NOT_FOUND", "Taxa de IVA invalida");
            const subtotalCents = line.quantity * line.unitPriceCents;
            const vatCents = Math.round(subtotalCents * vatRate.rateBps / 10000);
            return { ...line, subtotalCents, vatCents, totalCents: subtotalCents + vatCents };
        });
        const subtotalCents = computedLines.reduce((sum, line) => sum + line.subtotalCents, 0);
        const vatCents = computedLines.reduce((sum, line) => sum + line.vatCents, 0);
        const totalCents = subtotalCents + vatCents;
        return tx.saleDocument.create({
            data: { companyId, customerId: customer.id, kind, status: "DRAFT", number: null, issuedAt, dueDate, subtotalCents, vatCents, totalCents, amountPaidCents: 0, createdById: userId, lines: { create: computedLines } },
            include: { lines: true, customer: true },
        });
    });
}

export async function issueSaleDocument(prisma, companyId, userId, id) {
    return prisma.$transaction(async (tx) => {
        const document = await tx.saleDocument.findFirst({ where: { id, companyId }, include: { lines: true } });
        if (!document) throw httpError(404, "SALE_DOCUMENT_NOT_FOUND", "Documento de venda nao encontrado");
        if (document.status !== "APPROVED") throw httpError(409, "INVALID_STATUS", "Apenas documentos aprovados podem ser emitidos");
        if (document.number) throw httpError(409, "DOCUMENT_ALREADY_ISSUED", "Documento ja emitido");

        const number = await nextSaleNumber(tx, companyId, document.kind, document.issuedAt);
        const settled = document.kind === "INVOICE_RECEIPT";

        return tx.saleDocument.update({
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
    });
}
```

Localização: `apps/api/src/modules/sales/saleDocumentRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { createSaleDocument } from "./saleDocumentService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildSaleDocumentRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL")];

    router.post("/", guards, async (req, res) => {
        try { return res.status(201).json({ data: await createSaleDocument(prisma, req.companyId, req.user.id, req.body) }); }
        catch (error) { return sendError(res, error); }
    });

    router.get("/", guards, async (req, res) => {
        try {
            const data = await prisma.saleDocument.findMany({ where: { companyId: req.companyId }, include: { customer: true, lines: true }, orderBy: { issuedAt: "desc" } });
            return res.status(200).json({ data });
        } catch (error) { return sendError(res, error); }
    });

    return router;
}
```

Localização: editar `apps/api/src/server.js`.

```js
import { buildSaleDocumentRoutes } from "./modules/sales/saleDocumentRoutes.js";

app.use("/api/sales/documents", buildSaleDocumentRoutes({ prisma }));
```

5. Explicação do código.

O schema define as invariantes persistentes. O service concentra validação, cálculo, transações e regras de estado. A route só trata transporte HTTP, autenticação, contexto de empresa e resposta. Esta separação facilita testes e reduz regressões entre MF1 e MF3.

6. Validação do passo.

Executar teste unitário do service, teste de contrato do endpoint `/api/sales/documents` e confirmar que todos os registos criados pertencem a `req.companyId`.

7. Cenário negativo/erro esperado.

Entrada inválida deve falhar antes do Prisma; estado inválido deve devolver `409`; ausência de recurso dentro da empresa ativa deve devolver `404`.

### Passo 3 - Implementar frontend, testes e handoff

1. Objetivo funcional do passo no ERP.

Disponibilizar a operação ao utilizador, com cliente API tipado, estados de carregamento/erro/sucesso e evidência que permita revisão técnica.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/lib/salesApi.ts` e página/componente do domínio.
- EDITAR: rotas frontend existentes, se a app já tiver router.
- REVER: `apps/web/src/lib/apiClient.ts` e componentes de formulário/listagem já usados na MF0.
- LOCALIZAÇÃO: módulo visual correspondente à operação da MF1.

3. Instruções do que fazer.

Criar funções de API tipadas, consumir erros normalizados do backend e mostrar mensagens claras. Não recalcular no frontend valores que o backend já calcula como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Localização: `apps/web/src/lib/salesApi.ts`.

```ts
import { apiClient } from "./apiClient";

export type SaleDocumentInput = { kind: "INVOICE" | "INVOICE_RECEIPT" | "CREDIT_NOTE"; customerId: string; issuedAt: string; dueDate?: string; lines: Array<{ itemId: string; vatRateId: string; description: string; quantity: number; unitPriceCents: number }> };

export async function createSaleDocument(input: SaleDocumentInput) {
    return apiClient.post("/api/sales/documents", input);
}

export async function fetchSaleDocuments() {
    return apiClient.get("/api/sales/documents");
}
```

Localização: teste unitário ou de contrato do service.

```js
it("gera numeros diferentes em duas faturas da mesma empresa", async () => {
    const first = await createSaleDocument(prisma, companyId, userId, validInvoiceInput);
    const second = await createSaleDocument(prisma, companyId, userId, validInvoiceInput);
    expect(first.number).not.toBe(second.number);
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

### Passo 4 - Validar schema e regras de negócio

1. Objetivo funcional do passo no ERP.

Confirmar que a camada de dados e o service respeitam o contrato do BK atual.

2. Ficheiros envolvidos:
- CRIAR: testes unitários do módulo alterado.
- EDITAR: nenhum ficheiro fora do domínio do BK.
- REVER: schema, service e validações.
- LOCALIZAÇÃO: pasta de testes do backend.

3. Instruções do que fazer.

Criar ou atualizar testes unitários para o caso feliz, entradas inválidas, empresa errada e estado inválido. Os testes devem chamar a camada de service, porque é aí que vivem as regras de negócio.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:unit
```

5. Explicação do código.

O comando executa a bateria unitária do backend e confirma que o domínio do BK não depende da UI para validar regras críticas.

6. Validação do passo.

O teste passa sem regressões e cobre pelo menos um caso feliz e três cenários negativos relevantes.

7. Cenário negativo/erro esperado.

Se o teste falhar por ausência de validação, corrigir o service antes de avançar para a rota ou frontend.

### Passo 5 - Validar contratos HTTP

1. Objetivo funcional do passo no ERP.

Garantir que a API protegida responde com códigos HTTP previsíveis.

2. Ficheiros envolvidos:
- CRIAR: testes de contrato do endpoint principal.
- EDITAR: rota e serialização de erro, se necessário.
- REVER: autenticação, contexto de empresa e permissões.
- LOCALIZAÇÃO: testes de contrato do backend.

3. Instruções do que fazer.

Cobrir `401`, `403`, `400`, `404` e `409` sempre que o fluxo do BK tiver esses cenários.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:contracts
```

5. Explicação do código.

O comando valida que o contrato externo da API se mantém estável para o frontend e para BKs seguintes.

6. Validação do passo.

As respostas não expõem stack traces e mantêm `{ error, message }` ou o formato já usado pela app.

7. Cenário negativo/erro esperado.

Um pedido sem sessão deve falhar antes de qualquer leitura ou escrita de dados.

### Passo 6 - Validar fluxo integrado

1. Objetivo funcional do passo no ERP.

Confirmar que backend, frontend e persistência funcionam em conjunto no fluxo principal.

2. Ficheiros envolvidos:
- CRIAR: teste de integração ou cenário smoke.
- EDITAR: cliente API ou página, caso o fluxo quebre.
- REVER: mensagens de erro e estados de carregamento.
- LOCALIZAÇÃO: testes de integração da app.

3. Instruções do que fazer.

Executar o cenário principal com utilizador autenticado, empresa ativa e permissões adequadas.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:integration
```

5. Explicação do código.

O comando valida o comportamento final visto pelo utilizador e protege a integração entre camadas.

6. Validação do passo.

O fluxo termina com dados persistidos na empresa correta e UI em estado de sucesso.

7. Cenário negativo/erro esperado.

Com empresa ausente ou permissões insuficientes, a operação deve ser bloqueada sem gravar dados.

### Passo 7 - Rever diff técnico

1. Objetivo funcional do passo no ERP.

Garantir que a implementação não introduz alterações fora do âmbito.

2. Ficheiros envolvidos:
- CRIAR: nenhum.
- EDITAR: nenhum.
- REVER: todos os ficheiros alterados no BK.
- LOCALIZAÇÃO: raiz do repositório.

3. Instruções do que fazer.

Rever nomes, responsabilidades, validações, mensagens, transações, roles e filtros por `companyId`.

4. Código completo, correto e integrado com a app final.

```bash
git diff --check
```

5. Explicação do código.

O comando deteta whitespace problemático e ajuda a manter o diff limpo antes da revisão.

6. Validação do passo.

O comando termina sem erros.

7. Cenário negativo/erro esperado.

Se houver erro de whitespace, corrigir apenas as linhas afetadas.

### Passo 8 - Preparar evidência de entrega

1. Objetivo funcional do passo no ERP.

Fechar o BK com prova técnica clara para revisão e defesa.

2. Ficheiros envolvidos:
- CRIAR: nota de evidência no PR ou documento de entrega.
- EDITAR: changelog do BK, se a implementação real o justificar.
- REVER: expected results, critérios de aceite e handoff.
- LOCALIZAÇÃO: guia do BK e descrição do PR.

3. Instruções do que fazer.

Registar ficheiros alterados, comandos executados, resultado dos testes, decisão de integração e próximos BKs afetados.

4. Código completo, correto e integrado com a app final.

```bash
git diff -- docs/planificacao/guias-bk/MF1
```

5. Explicação do código.

O comando limita a revisão documental à MF1 e facilita confirmar que o guia mantém o contrato do BK.

6. Validação do passo.

A evidência identifica o que foi alterado, porquê e como foi validado.

7. Cenário negativo/erro esperado.

Se a evidência não explicar uma decisão técnica, completar a nota antes de pedir revisão.

## Expected results

- A aplicação emite documentos de venda por empresa, com sequência atómica, linhas validadas, totais calculados no backend e estado controlado.
- Endpoint `/api/sales/documents` protegido e filtrado por empresa.
- Testes cobrem pelo menos um caso feliz e três cenários negativos relevantes.
- Evidência lista schema, services, rotas, UI e comandos executados.

## Critérios de aceite

- RF14 fica coberto sem alterar o contrato canónico do BK.
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

O `BK-MF1-03` usa `SaleDocument.totalCents`, `amountPaidCents` e `status` para receber parcial ou totalmente.

## Changelog

- `2026-05-31`: Guia consolidado com contrato técnico completo, código por camada, validações e handoff MF1.
