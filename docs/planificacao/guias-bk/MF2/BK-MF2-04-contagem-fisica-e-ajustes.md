# BK-MF2-04 - Contagem física e ajustes.

## Header

- `doc_id`: `GUIA-BK-MF2-04`
- `bk_id`: `BK-MF2-04`
- `macro`: `MF2`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-02, BK-MF2-03`
- `rf_rnf`: `RF26`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-05`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-04-contagem-fisica-e-ajustes.md`
- `last_updated`: `2026-07-10`

## Objetivo

Neste BK vais criar contagens físicas por armazém e publicar diferenças como movimentos de ajuste auditados.

## Importância funcional e pedagógica

RF26 aproxima o ERP da realidade física. Pedagogicamente, mostra que corrigir stock não é editar saldo à mão, mas criar um evento rastreável.

## Scope-in

- Criar contagem por armazém.
- Registar linhas contadas.
- Comparar esperado vs contado.
- Publicar ajustes via service de movimentos com FIFO.
- Exigir custo unitário quando a contagem encontra excedente físico.

## Scope-out

- Leitores de código de barras.
- Aprovação multi-etapa.
- Lançamento contabilístico automático.

## Estado antes

Há saldos e movimentos, mas não há processo de conferência física.

## Estado depois

A equipa consegue publicar diferenças físicas com auditoria e sem alterar saldos diretamente.

## Pré-requisitos

- Ler RF26.
- Confirmar BK-MF2-02 e BK-MF2-03.
- Rever BK-MF2-03 porque os ajustes devem manter camadas FIFO coerentes.
- Confirmar que ajustes usam `ADJUSTMENT`.

## Fundamentação documental

- `CANONICO`: RF26 cobre contagem física e ajustes.
- `CANONICO`: BK-MF2-02 fornece movimentos.
- `CANONICO`: BK-MF2-03 fornece custo FIFO para valorizar ajustes.
- `DERIVADO`: contagem `DRAFT` não altera stock; `POSTED` cria ajustes.
- `DERIVADO`: ajuste positivo cria camada FIFO com custo unitário; ajuste negativo consome camadas FIFO.

## Glossário

- **Contagem física:** conferência real do stock.
- **Saldo esperado:** valor no sistema.
- **Ajuste:** movimento que corrige diferença.
- **Excedente físico:** quantidade contada acima do esperado; precisa de custo para valorizar stock.

## Conceitos teóricos essenciais

- **Contagem física no domínio de inventário:** é a verificação manual da quantidade real num armazém. Vem da observação física feita por operador autorizado, é registada em `InventoryCount` e `InventoryCountLine`, serve para comparar realidade com `StockBalance`, e evita tomar decisões com saldos desatualizados.
- **Ajuste de inventário:** é o movimento que corrige a diferença entre saldo esperado e quantidade contada. Vem da publicação da contagem, segue para o service de movimentos, atualiza saldo e histórico, serve para alinhar sistema e realidade, e evita editar `StockBalance` diretamente.
- **Publicação transacional:** uma contagem publicada não pode ficar a meio. O pedido vem da rota de publicação, o backend valida linhas, cria movimentos de ajuste e marca a contagem como publicada na mesma transação, serve para manter rasto completo, e evita contagens fechadas sem movimentos ou movimentos repetidos.
- **Integração com FIFO:** excedentes físicos precisam de custo unitário e faltas consomem custo pelo mecanismo FIFO. A informação vem da contagem e das camadas do BK-MF2-03, segue para `createStockMovementWithCostInTransaction`, serve para valorizar o ajuste, e evita quantidades sem custo contabilístico.
- **Segurança e governação:** só a empresa ativa é alterada e a publicação fica auditável. Empresa e utilizador vêm da sessão, o backend filtra recursos por `companyId`, serve para separar inventários, e evita que uma contagem de outra empresa seja publicada por engano.

## Contrato de paridade obrigatório (2026-07-10)

`countedAt` é uma data civil estrita `YYYY-MM-DD`. Publicar faz primeiro o claim `DRAFT -> POSTED`; quem perde recebe `409 STALE_STATE`. Dentro da mesma transação serializável, os saldos e camadas FIFO são bloqueados em ordem estável, os ajustes são criados e a auditoria é gravada. A transação inteira faz rollback se qualquer linha falhar.

## Arquitetura do BK

- Endpoints: `/api/inventory/counts`.
- Modelos: `InventoryCount`, `InventoryCountLine`.
- Integração: `createStockMovementWithCostInTransaction`.

## Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`.
- CRIAR: `apps/api/src/modules/inventory/inventoryCountService.js`.
- CRIAR: `apps/api/src/modules/inventory/inventoryCountRoutes.js`.
- EDITAR: `apps/api/src/server.js`.
- CRIAR: `apps/web/src/lib/inventoryCountsApi.ts`.
- CRIAR: `apps/web/src/pages/InventoryCountPage.tsx`.
- REVER: `apps/api/src/modules/inventory/stockMovementService.js`.
- REVER: `apps/api/src/modules/inventory/fifoCostService.js`.

## Erros comuns

- Editar `StockBalance` diretamente.
- Publicar duas vezes.
- Permitir quantidade negativa.
- Publicar excedente físico sem custo unitário.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403`.
- Recurso de outra empresa deve devolver `404` ou `403`, sem expor dados.
- Publicação duplicada devolve `409`.
- Quantidade contada negativa devolve `400`.
- Excedente físico sem custo unitário devolve `400`.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que BK-MF2-04 cobre apenas RF26 e mantém metadados alinhados com matriz, backlog e contrato de campos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `README.md`, `docs/RF.md`, `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `CONTRATO-STACK-IMPLEMENTACAO.md`.
    - LOCALIZAÇÃO: `docs/planificacao/guias-bk/MF2/BK-MF2-04-contagem-fisica-e-ajustes.md`, header deste guia e linha canónica de `BK-MF2-04`.

3. Instruções do que fazer.

Comparar header, dependências e próximo BK. Se os caminhos reais da app divergirem, preservar o contrato funcional e registar a adaptação na evidence.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF2-04
macro=MF2
rf=RF26
dependencias=BK-MF2-02, BK-MF2-03
proximo=BK-MF2-05
```

5. Explicação do código.

Este contrato impede drift antes da implementação. Num ERP, uma alteração errada em stock ou contabilidade propaga-se para relatórios, auditoria e defesa PAP.

6. Validação do passo.

A evidence deve indicar que `RF26`, `BK-MF2-02` e `BK-MF2-03` foram confirmados.

7. Cenário negativo/erro esperado.

Se aparecer regra sem fonte documental, registar dúvida e não a transformar em requisito.

### Passo 2 - Modelar contagens

1. Objetivo funcional do passo no ERP.

Guardar cabeçalho, linhas e estado.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`.
    - REVER: modelo `StockBalance` em `apps/api/prisma/schema.prisma`.
    - LOCALIZAÇÃO: blocos `InventoryCount`, `InventoryCountLine` e `InventoryCountStatus`.

3. Instruções do que fazer.

Adicionar modelos de contagem.

4. Código completo, correto e integrado com a app final.

```prisma
enum InventoryCountStatus { DRAFT POSTED CANCELLED }

model InventoryCount {
  id          String               @id @default(uuid())
  companyId   String
  company     Company              @relation(fields: [companyId], references: [id])
  warehouseId String
  warehouse   Warehouse            @relation(fields: [warehouseId], references: [id])
  status      InventoryCountStatus @default(DRAFT)
  reason      String
  countedAt   DateTime
  createdById String
  createdBy   User                 @relation(fields: [createdById], references: [id])
  postedAt    DateTime?
  createdAt   DateTime             @default(now())
  lines       InventoryCountLine[]
  @@index([companyId, warehouseId, status])
}

model InventoryCountLine {
  id               String @id @default(uuid())
  inventoryCountId String
  inventoryCount   InventoryCount @relation(fields: [inventoryCountId], references: [id])
  itemId           String
  item             Item @relation(fields: [itemId], references: [id])
  expectedQuantity Decimal @db.Decimal(18, 3)
  countedQuantity  Decimal @db.Decimal(18, 3)
  unitCostCents    Int?
  @@unique([inventoryCountId, itemId])
  @@index([itemId])
}

// Acrescentar no modelo Company:
// inventoryCounts InventoryCount[]

// Acrescentar no modelo Warehouse:
// inventoryCounts InventoryCount[]

// Acrescentar no modelo User:
// inventoryCountsCreated InventoryCount[]

// Acrescentar no modelo Item:
// inventoryCountLines InventoryCountLine[]
```

5. Explicação do código.

O estado impede publicação duplicada; as linhas preservam o esperado no momento da contagem. `unitCostCents` fica opcional porque só é necessário quando a contagem encontra mais unidades físicas do que o ERP esperava e precisa de criar uma nova camada FIFO. As relações inversas completam o schema Prisma acumulado e permitem consultar contagens a partir de empresa, armazém, utilizador e artigo.

6. Validação do passo.

Migration, criação de contagem e confirmação de que as relações inversas não entram em conflito com modelos anteriores.

7. Cenário negativo/erro esperado.

Linha repetida deve falhar.

### Passo 3 - Implementar service de contagem

1. Objetivo funcional do passo no ERP.

Guardar linhas e publicar ajustes sem editar saldo diretamente.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/inventoryCountService.js`.
    - REVER: `apps/api/src/modules/inventory/stockMovementService.js`.
    - REVER: `apps/api/src/modules/inventory/fifoCostService.js`.
    - LOCALIZAÇÃO: `apps/api/src/modules/inventory/inventoryCountService.js`.

3. Instruções do que fazer.

Usar transação e service de movimentos.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/inventory/inventoryCountService.js
import { httpError } from "../../lib/httpErrors.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";
import { createStockMovementWithCostInTransaction } from "./stockMovementService.js";

function parseInventoryCount(input) {
  const warehouseId = String(input?.warehouseId ?? "").trim();
  const reason = String(input?.reason ?? "").trim();
  const countedAt = parseStrictDateOnly(input?.countedAt, { code: "INVALID_COUNT_DATE", field: "countedAt" });

  if (!warehouseId) throw httpError(400, "WAREHOUSE_REQUIRED", "Indica o armazém da contagem.");
  if (reason.length < 4) throw httpError(400, "COUNT_REASON_REQUIRED", "Indica o motivo da contagem.");

  return { warehouseId, reason, countedAt };
}

function parseInventoryCountLines(input) {
  const lines = Array.isArray(input?.lines) ? input.lines : [];
  if (lines.length === 0) throw httpError(400, "INVENTORY_COUNT_LINES_REQUIRED", "Indica pelo menos uma linha.");

  const parsedLines = lines.map((line) => {
    const itemId = String(line.itemId ?? "").trim();
    const countedQuantity = Number(line.countedQuantity);
    // O custo só é usado quando um excedente físico cria stock novo no FIFO.
    const unitCostCents =
      line.unitCostCents === undefined || line.unitCostCents === null
        ? null
        : Number(line.unitCostCents);

    if (!itemId) throw httpError(400, "ITEM_REQUIRED", "Indica o artigo.");
    if (!Number.isFinite(countedQuantity) || countedQuantity < 0) {
      throw httpError(400, "INVALID_COUNTED_QUANTITY", "A quantidade contada não pode ser negativa.");
    }
    if (unitCostCents !== null && (!Number.isInteger(unitCostCents) || unitCostCents <= 0)) {
      throw httpError(400, "INVALID_UNIT_COST", "O custo unitário deve ser positivo.");
    }

    return { itemId, countedQuantity, unitCostCents };
  });

  const uniqueItemIds = new Set(parsedLines.map((line) => line.itemId));
  if (uniqueItemIds.size !== parsedLines.length) {
    throw httpError(400, "DUPLICATE_COUNT_LINE", "Cada artigo só pode aparecer uma vez na contagem.");
  }

  return parsedLines;
}

export async function createInventoryCount(prisma, { companyId, userId, input }) {
  const data = parseInventoryCount(input);

  return prisma.$transaction(async (tx) => {
    const warehouse = await tx.warehouse.findFirst({
      where: { id: data.warehouseId, companyId, isActive: true },
      select: { id: true },
    });

    if (!warehouse) throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado.");

    const count = await tx.inventoryCount.create({
      data: {
        companyId,
        warehouseId: data.warehouseId,
        reason: data.reason,
        countedAt: data.countedAt,
        status: "DRAFT",
        createdById: userId,
      },
    });

    await tx.auditLog.create({
      data: {
        companyId,
        userId,
        action: "INVENTORY_COUNT_CREATED",
        entity: "InventoryCount",
        entityId: count.id,
        details: { warehouseId: data.warehouseId },
      },
    });

    return count;
  });
}

export async function saveInventoryCountLines(prisma, { companyId, countId, input }) {
  const lines = parseInventoryCountLines(input);

  return prisma.$transaction(async (tx) => {
    const count = await tx.inventoryCount.findFirst({
      where: { id: countId, companyId },
    });

    if (!count) throw httpError(404, "INVENTORY_COUNT_NOT_FOUND", "Contagem não encontrada.");
    if (count.status !== "DRAFT") throw httpError(409, "INVENTORY_COUNT_NOT_EDITABLE", "Só contagens em rascunho podem ser editadas.");

    const itemIds = lines.map((line) => line.itemId);
    const items = await tx.item.findMany({
      where: { id: { in: itemIds }, companyId, isActive: true },
      select: { id: true },
    });

    if (items.length !== new Set(itemIds).size) throw httpError(404, "ITEM_NOT_FOUND", "Artigo não encontrado.");

    await tx.inventoryCountLine.deleteMany({ where: { inventoryCountId: count.id } });

    const createdLines = [];
    for (const line of lines) {
      const balance = await tx.stockBalance.findUnique({
        where: {
          companyId_itemId_warehouseId: {
            companyId,
            itemId: line.itemId,
            warehouseId: count.warehouseId,
          },
        },
      });

      createdLines.push(
        await tx.inventoryCountLine.create({
          data: {
            inventoryCountId: count.id,
            itemId: line.itemId,
            expectedQuantity: Number(balance?.quantity ?? 0),
            countedQuantity: line.countedQuantity,
            unitCostCents: line.unitCostCents,
          },
        })
      );
    }

    return createdLines;
  });
}

export async function postInventoryCount(prisma, { companyId, userId, countId }) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.inventoryCount.findFirst({
      where: { id: countId, companyId },
      include: { lines: true },
    });

    if (!count) throw httpError(404, "INVENTORY_COUNT_NOT_FOUND", "Contagem não encontrada.");
    if (count.lines.length === 0) throw httpError(400, "INVENTORY_COUNT_LINES_REQUIRED", "A contagem não tem linhas.");

    const claim = await tx.inventoryCount.updateMany({
      where: { id: count.id, companyId, status: "DRAFT" },
      data: { status: "POSTED", postedAt: new Date() },
    });
    if (claim.count !== 1) {
      throw httpError(409, "STALE_STATE", "A contagem foi publicada por outra operação");
    }

    for (const line of count.lines) {
      const difference = Number(line.countedQuantity) - Number(line.expectedQuantity);
      if (difference === 0) continue;

      if (difference > 0 && !line.unitCostCents) {
        throw httpError(
          400,
          "COUNT_ADJUSTMENT_UNIT_COST_REQUIRED",
          "Indica o custo unitário para excedentes de stock."
        );
      }

      await createStockMovementWithCostInTransaction(tx, {
        companyId,
        userId,
        input:
          difference > 0
            ? {
                // Ajuste positivo: entra stock e cria camada FIFO valorizada.
                type: "ADJUSTMENT",
                itemId: line.itemId,
                quantity: difference,
                toWarehouseId: count.warehouseId,
                unitCostCents: line.unitCostCents,
                reason: `Ajuste de contagem ${count.id}`,
              }
            : {
                // Ajuste negativo: sai stock e consome camadas FIFO existentes.
                type: "ADJUSTMENT",
                itemId: line.itemId,
                quantity: Math.abs(difference),
                fromWarehouseId: count.warehouseId,
                reason: `Ajuste de contagem ${count.id}`,
              },
      });
    }

    const posted = await tx.inventoryCount.findUnique({
      where: { id: count.id },
      include: { lines: true },
    });

    await tx.auditLog.create({
      data: {
        companyId,
        userId,
        action: "INVENTORY_COUNT_POSTED",
        entity: "InventoryCount",
        entityId: count.id,
        details: {
          warehouseId: count.warehouseId,
          lines: count.lines.length,
          postedAt: posted.postedAt?.toISOString() ?? null,
        },
      },
    });

    return posted;
  });
}
```

5. Explicação do código.

A diferença positiva entra com `unitCostCents` e cria uma camada FIFO; a diferença negativa sai e consome camadas FIFO existentes. O saldo muda apenas através de movimento auditado, usando o wrapper com custo criado no BK-MF2-03. O evento `INVENTORY_COUNT_POSTED` separa a decisão de publicar a contagem dos movimentos de ajuste que resultam dessa decisão.

6. Validação do passo.

Publicar contagem com uma diferença positiva com custo unitário, uma diferença negativa com camadas FIFO suficientes e auditoria `INVENTORY_COUNT_POSTED`.

7. Cenário negativo/erro esperado.

Publicar de novo devolve `409`. Publicar excedente físico sem custo unitário devolve `400`.

### Passo 4 - Expor rotas

1. Objetivo funcional do passo no ERP.

Criar, gravar linhas e publicar contagens.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/inventoryCountRoutes.js`.
    - EDITAR: `apps/api/src/server.js`.
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions/permissionMiddleware.js`.
    - LOCALIZAÇÃO: `/api/inventory/counts` em `apps/api/src/server.js`.

3. Instruções do que fazer.

Criar endpoints separados por ação.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/inventory/inventoryCountRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import {
  createInventoryCount,
  postInventoryCount,
  saveInventoryCountLines,
} from "./inventoryCountService.js";

export function createInventoryCountRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "OPERACIONAL")];
  const sendError = (res, error) => {
    const response = toHttpError(error);
    return res.status(response.status).json(response.body);
  };

  router.post("/", guards, async (req, res) => {
    try {
      const count = await createInventoryCount(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        input: req.body,
      });

      return res.status(201).json({ count });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.patch("/:id/lines", guards, async (req, res) => {
    try {
      const lines = await saveInventoryCountLines(prisma, {
        companyId: req.companyId,
        countId: req.params.id,
        input: req.body,
      });

      return res.json({ lines });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post("/:id/post", guards, async (req, res) => {
    try {
      const count = await postInventoryCount(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        countId: req.params.id,
      });

      return res.json({ count });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

// apps/api/src/server.js
import { createInventoryCountRouter } from "./modules/inventory/inventoryCountRoutes.js";

app.use("/api/inventory/counts", createInventoryCountRouter(prisma));
```

5. Explicação do código.

Separar ações ajuda o aluno a perceber o ciclo de vida.

6. Validação do passo.

Testar `POST`, `PATCH /lines` e `POST /post`.

7. Cenário negativo/erro esperado.

Contagem sem linhas devolve `400`.

### Passo 5 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Chamar endpoints de contagem com cookie.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/inventoryCountsApi.ts`.
    - REVER: `apps/web/src/lib/apiClient.ts`.
    - LOCALIZAÇÃO: `apps/web/src/lib/inventoryCountsApi.ts`.

3. Instruções do que fazer.

Criar funções `createInventoryCount`, `saveInventoryCountLines`, `postInventoryCount`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/inventoryCountsApi.ts
export type InventoryCountLineInput = {
  itemId: string;
  countedQuantity: number;
  unitCostCents?: number | null;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(body.message ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

export async function createInventoryCount(data: { warehouseId: string; reason: string; countedAt?: string }) {
  const response = await fetch("/api/inventory/counts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return readJson<{ count: { id: string; status: string } }>(response);
}

export async function saveInventoryCountLines(countId: string, lines: InventoryCountLineInput[]) {
  const response = await fetch(`/api/inventory/counts/${countId}/lines`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ lines }),
  });

  return readJson<{
    lines: Array<{ id: string; itemId: string; countedQuantity: number; unitCostCents: number | null }>;
  }>(response);
}

export async function postInventoryCount(countId: string) {
  const response = await fetch(`/api/inventory/counts/${countId}/post`, {
    method: "POST",
    credentials: "include",
  });

  return readJson<{ count: { id: string; status: string } }>(response);
}
```

5. Explicação do código.

O cliente não calcula diferenças finais; o backend publica.

6. Validação do passo.

Smoke no browser.

7. Cenário negativo/erro esperado.

Erro backend deve aparecer na UI.

### Passo 6 - Criar página

1. Objetivo funcional do passo no ERP.

Permitir criar contagem e publicar diferenças.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/InventoryCountPage.tsx`.
    - EDITAR: `apps/web/src/App.tsx`.
    - LOCALIZAÇÃO: `apps/web/src/pages/InventoryCountPage.tsx`.

3. Instruções do que fazer.

Criar UI com tabela de linhas e botões de guardar/publicar.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/InventoryCountPage.tsx
import { FormEvent, useState } from "react";
import {
  createInventoryCount,
  postInventoryCount,
  saveInventoryCountLines,
} from "../lib/inventoryCountsApi";
import type { InventoryCountLineInput } from "../lib/inventoryCountsApi";

const emptyLine: InventoryCountLineInput = { itemId: "", countedQuantity: 0, unitCostCents: null };

export function InventoryCountPage() {
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [countId, setCountId] = useState<string | null>(null);
  const [lines, setLines] = useState<InventoryCountLineInput[]>([{ ...emptyLine }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createInventoryCount({ warehouseId, reason });
      setCountId(result.count.id);
      setMessage("Contagem criada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a contagem.");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveLines() {
    if (!countId) return;
    setLoading(true);
    setError(null);

    try {
      await saveInventoryCountLines(countId, lines);
      setMessage("Linhas guardadas.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível guardar linhas.");
    } finally {
      setLoading(false);
    }
  }

  async function onPost() {
    if (!countId) return;
    setLoading(true);
    setError(null);

    try {
      await postInventoryCount(countId);
      setMessage("Contagem publicada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível publicar a contagem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Contagem física</h1>

      <form onSubmit={onCreate}>
        <label>
          Armazém
          <input value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} />
        </label>
        <label>
          Motivo
          <input value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
        <button type="submit" disabled={loading}>Criar contagem</button>
      </form>

      {countId ? <p>Contagem: {countId}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {message ? <p>{message}</p> : null}

      <table>
        <thead>
          <tr>
            <th>Artigo</th>
            <th>Quantidade contada</th>
            <th>Custo unitário</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={index}>
              <td>
                <input
                  value={line.itemId}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, itemId: event.target.value } : item
                      )
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={line.countedQuantity}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, countedQuantity: Number(event.target.value) } : item
                      )
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={line.unitCostCents ?? ""}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              unitCostCents:
                                event.target.value === "" ? null : Number(event.target.value),
                            }
                          : item
                      )
                    )
                  }
                  placeholder="Cêntimos"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" onClick={() => setLines((current) => [...current, { ...emptyLine }])}>
        Adicionar linha
      </button>
      <button type="button" disabled={!countId || loading} onClick={onSaveLines}>
        Guardar linhas
      </button>
      <button type="button" disabled={!countId || loading} onClick={onPost}>
        Publicar ajustes
      </button>
    </section>
  );
}
```

5. Explicação do código.

A UI guia o aluno sem substituir validações do backend. O campo de custo unitário é enviado por linha para permitir que excedentes físicos criem uma camada FIFO valorizada; se não for necessário, pode ficar vazio.

6. Validação do passo.

Testar estados loading, erro, vazio e sucesso.

7. Cenário negativo/erro esperado.

Quantidade negativa deve ser rejeitada. Excedente físico sem custo unitário deve ser rejeitado na publicação.

### Passo 7 - Validar smoke, negativos e segurança

1. Objetivo funcional do passo no ERP.

Provar que BK-MF2-04 funciona no caso principal e falha de forma controlada nos casos negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/inventoryCountService.test.js`.
    - CRIAR: `apps/api/src/modules/inventory/inventoryCountRoutes.test.js`.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-04-contagem-fisica-e-ajustes.md` e ficheiros criados nos passos anteriores.
    - LOCALIZAÇÃO: `apps/api/src/modules/inventory/` e smoke manual em `apps/web/src/pages/InventoryCountPage.tsx`.

3. Instruções do que fazer.

Criar teste do fluxo principal, negativos indicados neste guia e smoke manual com sessão real.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:unit -- inventoryCount
npm run test:integration -- inventoryCount
```

5. Explicação do código.

Os testes provam comportamento, não apenas execução. O aluno consegue defender o que foi verificado e que risco foi bloqueado.

6. Validação do passo.

Confirmar HTTP status, mensagem controlada, ausência de escrita parcial e ausência de dados de outra empresa.

7. Cenário negativo/erro esperado.

Se o smoke passa mas um negativo falha, corrigir service ou rota antes de pedir revisão.

### Passo 8 - Preparar evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar BK-MF2-04 com provas objetivas e deixar o próximo BK pronto para reutilizar os contratos criados.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF2/BK-MF2-04.md`.
    - EDITAR: nenhum ficheiro de aplicação neste passo.
    - REVER: outputs de testes, screenshots e resumo do PR.
    - LOCALIZAÇÃO: `docs/evidence/MF2/BK-MF2-04.md`.

3. Instruções do que fazer.

Registar ficheiros alterados, endpoints criados, comandos executados, resultados dos negativos e riscos que ficam para o próximo BK.

4. Código completo, correto e integrado com a app final.

```md
# BK-MF2-04

- Requisito validado: RF26
- Endpoints: POST /api/inventory/counts, PATCH /api/inventory/counts/:id/lines, POST /api/inventory/counts/:id/post
- Negativos: contagem inexistente, publicação duplicada, linha vazia, quantidade negativa
- Resultado: preencher com comandos, resposta HTTP e imagem da página
```

5. Explicação do código.

A evidence liga requisito, código e validação. Sem esta prova, o BK continua fraco para revisão e defesa PAP.

6. Validação do passo.

Confirmar handoff para `BK-MF2-05` com exports, endpoints, modelos e limitações.

7. Cenário negativo/erro esperado.

Se existir bloqueio real, marcar no relatório e evidence com erro observado e impacto.

## Expected results

- Contagem nasce `DRAFT`.
- Linhas guardam esperado e contado.
- Publicação cria movimentos `ADJUSTMENT`.
- Publicação cria auditoria própria com `details`.

## Critérios de aceite

- Todos os passos seguem a estrutura obrigatória 1 a 7.
- Backend aplica autenticação, autorização e contexto multiempresa.
- Frontend usa `credentials: "include"` e não guarda tokens em `localStorage`.
- Erros são controlados e em português de Portugal.
- Evidence inclui smoke, negativos e ficheiros alterados.

## Validação final

- Contagem com diferença positiva e negativa.
- Publicação duplicada.
- Diferença zero sem movimento.

## Evidence para PR/defesa

- Teste de publicação.
- Negativo de duplicação.
- Screenshot da contagem.

## Handoff

BK-MF2-05 lê saldos já ajustados.

## Changelog

- `2026-06-08`: corrigidas relações inversas Prisma, alinhada auditoria com `AuditLog.details` e acrescentado evento de publicação da contagem.
- `2026-06-07`: guia reescrito como tutorial técnico linear, autocontido e alinhado com RF/RNF, MF0, MF1 e contrato de stack.
