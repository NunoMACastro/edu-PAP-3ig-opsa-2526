# BK-MF2-03 - Cálculo de custo (FIFO).

## Header

- `doc_id`: `GUIA-BK-MF2-03`
- `bk_id`: `BK-MF2-03`
- `macro`: `MF2`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-02`
- `rf_rnf`: `RF25`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-04`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-03-calculo-de-custo-fifo.md`
- `last_updated`: `2026-07-10`

## Objetivo

Neste BK vais implementar custo FIFO por camadas: entradas criam camadas de custo e saídas consomem primeiro as camadas mais antigas.

## Importância funcional e pedagógica

RF25 liga inventário a margem e contabilidade. Pedagogicamente, mostra que FIFO não é média ponderada nem cálculo no browser; é uma regra de backend baseada no histórico real.

## Scope-in

- Camadas de custo para entradas/devoluções.
- Consumo FIFO em saídas.
- Custo unitário obrigatório para movimentos que criam camada.
- Transferências preservam o custo das camadas entre armazéns.
- Ajustes positivos criam camada e ajustes negativos consomem camada.
- Pré-visualização de custo sem escrita.
- Bloqueio de camadas insuficientes.

## Scope-out

- Média ponderada.
- Lançamento contabilístico automático do custo.
- Otimização avançada de performance RNF11.

## Estado antes

BK-MF2-02 regista quantidades e saldos, mas ainda não calcula custo por camada.

## Estado depois

Cada saída pode explicar que camadas consumiu e qual foi o custo total em cêntimos.

## Pré-requisitos

- Ler RF25.
- Confirmar BK-MF2-02.
- Confirmar que BK-MF2-04 vai publicar ajustes através do service de movimentos.
- Confirmar valores monetários em cêntimos.
- Confirmar que o cálculo corre no backend.

## Fundamentação documental

- `CANONICO`: RF25 exige FIFO.
- `CANONICO`: BK-MF2-02 fornece movimentos.
- `DERIVADO`: `StockCostLayer` representa entrada com custo.
- `DERIVADO`: `StockCostConsumption` explica a saída.
- `DERIVADO`: `unitCostCents` é obrigatório quando o movimento cria stock valorizado.
- `DERIVADO`: transferências não criam custo novo; movem camadas da origem para o destino.

## Glossário

- **FIFO:** First In, First Out.
- **Camada:** lote de quantidade com custo unitário.
- **Consumo:** parte da saída ligada a uma camada.
- **Custo unitário:** valor em cêntimos usado para valorizar cada unidade que entra no stock.

## Conceitos teóricos essenciais

- **FIFO no domínio de inventário:** First In, First Out significa que a saída consome primeiro as entradas mais antigas disponíveis. As camadas vêm de movimentos de entrada com custo unitário, os consumos são associados a saídas, o resultado alimenta valorização de stock e margem, e evita escolher custos arbitrários para produtos vendidos.
- **Camada de custo:** é um lote de quantidade e custo unitário em cêntimos. Vem de uma entrada de stock, fica em `StockCostLayer`, é reduzida por consumos FIFO, serve para saber quanto valor ainda existe em stock, e evita perder a relação entre quantidade física e valor contabilístico.
- **Consumo de camada:** é o registo que liga uma saída à camada usada. Vem do service de saída em transação, fica em `StockCostConsumption`, serve para explicar o custo aplicado a cada saída, e evita consumir a mesma quantidade duas vezes.
- **Transação de custo e movimento:** movimento, saldo, camada e consumo têm de ser coerentes. O pedido entra pelo service de movimentos, chama `consumeFifoLayers` dentro da mesma transação, grava tudo ou nada, serve para preservar inventário e custo, e evita movimentos físicos sem custo ou custo sem movimento.
- **Preview sem escrita:** a página de preview mostra o custo previsto sem alterar dados. O pedido vem da UI, consulta camadas filtradas por empresa, devolve uma simulação, serve para o utilizador antecipar impacto, e evita alterações acidentais durante análise.
- **Segurança e governação de custos:** custos são dados sensíveis. A empresa e a role vêm da sessão, o backend filtra por `companyId`, serve para limitar visibilidade, e evita expor margens ou custos de outra empresa.

## Contrato de paridade obrigatório (2026-07-10)

O consumo bloqueia as camadas elegíveis com `SELECT ... FOR UPDATE` em ordem `createdAt, id`, dentro da mesma transação serializável que bloqueia o saldo e grava movimento/consumos/auditoria. O preview é estritamente read-only e não reserva camadas. Retries são limitados a três e apenas para conflitos serializáveis; uma insuficiência real devolve `409` sem retry automático.

## Arquitetura do BK

- Endpoint: `GET /api/inventory/fifo-cost/preview`.
- Service: `consumeFifoLayers(tx, params)`.
- Wrapper: `createStockMovementWithCostInTransaction(tx, context)`.
- Modelos: `StockCostLayer` e `StockCostConsumption`.

## Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`.
- CRIAR: `apps/api/src/modules/inventory/fifoCostService.js`.
- EDITAR: `apps/api/src/modules/inventory/stockMovementService.js`.
- CRIAR: `apps/api/src/modules/inventory/fifoCostRoutes.js`.
- EDITAR: `apps/api/src/server.js`.
- CRIAR: `apps/web/src/lib/fifoCostApi.ts`.
- CRIAR: `apps/web/src/pages/FifoCostPage.tsx`.
- EDITAR: `apps/web/src/pages/StockMovementsPage.tsx`.

## Erros comuns

- Usar média ponderada.
- Consumir camadas sem transação.
- Guardar dinheiro em decimal binário.
- Misturar armazéns.
- Criar camada FIFO com custo `0` por omissão.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403`.
- Recurso de outra empresa deve devolver `404` ou `403`, sem expor dados.
- Camadas insuficientes devolvem `409`.
- Custo unitário em falta, zero ou negativo devolve `400`.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que BK-MF2-03 cobre apenas RF25 e mantém metadados alinhados com matriz, backlog e contrato de campos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `README.md`, `docs/RF.md`, `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `CONTRATO-STACK-IMPLEMENTACAO.md`.
    - LOCALIZAÇÃO: `docs/planificacao/guias-bk/MF2/BK-MF2-03-calculo-de-custo-fifo.md`, header deste guia e linha canónica de `BK-MF2-03`.

3. Instruções do que fazer.

Comparar header, dependências e próximo BK. Se os caminhos reais da app divergirem, preservar o contrato funcional e registar a adaptação na evidence.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF2-03
macro=MF2
rf=RF25
dependencias=BK-MF2-02
proximo=BK-MF2-04
```

5. Explicação do código.

Este contrato impede drift antes da implementação. Num ERP, uma alteração errada em stock ou contabilidade propaga-se para relatórios, auditoria e defesa PAP.

6. Validação do passo.

A evidence deve indicar que `RF25` e `BK-MF2-02` foram confirmados.

7. Cenário negativo/erro esperado.

Se aparecer regra sem fonte documental, registar dúvida e não a transformar em requisito.

### Passo 2 - Modelar camadas FIFO

1. Objetivo funcional do passo no ERP.

Guardar entradas e consumos para explicar o custo de cada saída.

2. Ficheiros envolvidos:
    - CRIAR: migration Prisma gerada a partir de `apps/api/prisma/schema.prisma`.
    - EDITAR: `apps/api/prisma/schema.prisma`.
    - REVER: modelo `StockMovement` em `apps/api/prisma/schema.prisma`.
    - LOCALIZAÇÃO: blocos `StockCostLayer` e `StockCostConsumption`.

3. Instruções do que fazer.

Adicionar modelos sem duplicar `StockMovement`.

4. Código completo, correto e integrado com a app final.

```prisma
model StockCostLayer {
  id                String        @id @default(uuid())
  companyId         String
  company           Company       @relation(fields: [companyId], references: [id])
  itemId            String
  item              Item          @relation(fields: [itemId], references: [id])
  warehouseId       String
  warehouse         Warehouse     @relation(fields: [warehouseId], references: [id])
  sourceMovementId  String
  sourceMovement    StockMovement @relation(fields: [sourceMovementId], references: [id])
  quantity          Decimal       @db.Decimal(18, 3)
  remainingQuantity Decimal       @db.Decimal(18, 3)
  unitCostCents     Int
  createdAt         DateTime      @default(now())

  @@index([companyId, itemId, warehouseId, createdAt])
}

model StockCostConsumption {
  id             String         @id @default(uuid())
  companyId      String
  company        Company        @relation(fields: [companyId], references: [id])
  movementId     String
  movement       StockMovement  @relation(fields: [movementId], references: [id])
  layerId        String
  layer          StockCostLayer @relation(fields: [layerId], references: [id])
  quantity       Decimal        @db.Decimal(18, 3)
  unitCostCents  Int
  totalCostCents Int
  createdAt      DateTime       @default(now())

  @@index([companyId, movementId])
}

// Acrescentar no modelo Company:
// stockCostLayers StockCostLayer[]
// stockCostConsumptions StockCostConsumption[]

// Acrescentar no modelo Item:
// stockCostLayers StockCostLayer[]

// Acrescentar no modelo Warehouse:
// stockCostLayers StockCostLayer[]

// Acrescentar no modelo StockMovement:
// costLayers StockCostLayer[]
// costConsumptions StockCostConsumption[]
```

5. Explicação do código.

A camada guarda quantidade e custo unitário; o consumo liga uma saída às camadas usadas. Isto torna o custo explicável e auditável.

6. Validação do passo.

Migration sem duplicar relações.

7. Cenário negativo/erro esperado.

Custo negativo deve ser bloqueado pelo service.

### Passo 3 - Implementar service FIFO

1. Objetivo funcional do passo no ERP.

Consumir camadas por ordem de entrada dentro de transação.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/fifoCostService.js`.
    - EDITAR: `apps/api/src/modules/inventory/stockMovementService.js`, `apps/web/src/lib/stockMovementsApi.ts` e `apps/web/src/pages/StockMovementsPage.tsx`.
    - REVER: `apps/api/src/modules/inventory/stockMovementService.js` criado no BK-MF2-02.
    - LOCALIZAÇÃO: `apps/api/src/modules/inventory/fifoCostService.js`.

3. Instruções do que fazer.

Criar funções reutilizáveis para entradas, saídas, transferências, ajustes e preview. O wrapper `createStockMovementWithCostInTransaction` deve ser usado por BKs seguintes que criem movimentos dentro de uma transação maior.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/inventory/fifoCostService.js
import { httpError } from "../../lib/httpErrors.js";

function parseRequiredUnitCostCents(input) {
  const unitCostCents = Number(input?.unitCostCents);

  // FIFO sem custo unitário cria camadas inúteis para margem e relatórios.
  if (!Number.isInteger(unitCostCents) || unitCostCents <= 0) {
    throw httpError(
      400,
      "UNIT_COST_REQUIRED",
      "Indica um custo unitário positivo em cêntimos."
    );
  }

  return unitCostCents;
}

export async function createFifoLayer(tx, { companyId, itemId, warehouseId, sourceMovementId, quantity, unitCostCents }) {
  if (!Number.isInteger(unitCostCents) || unitCostCents <= 0) {
    throw httpError(400, "INVALID_UNIT_COST", "Custo unitário inválido.");
  }

  return tx.stockCostLayer.create({
    data: {
      companyId,
      itemId,
      warehouseId,
      sourceMovementId,
      quantity,
      remainingQuantity: quantity,
      unitCostCents,
    },
  });
}

export async function consumeFifoLayers(tx, { companyId, itemId, warehouseId, movementId, quantity }) {
  let remaining = Number(quantity);
  const layers = await tx.$queryRaw`
    SELECT *
    FROM "StockCostLayer"
    WHERE "companyId" = ${companyId}
      AND "itemId" = ${itemId}
      AND "warehouseId" = ${warehouseId}
      AND "remainingQuantity" > 0
    ORDER BY "createdAt" ASC, id ASC
    FOR UPDATE
  `;
  const consumptions = [];

  for (const layer of layers) {
    if (remaining <= 0) break;
    const used = Math.min(Number(layer.remainingQuantity), remaining);

    // A camada mais antiga é reduzida antes de passar à seguinte: esta é a regra FIFO.
    await tx.stockCostLayer.update({
      where: { id: layer.id },
      data: { remainingQuantity: Number(layer.remainingQuantity) - used },
    });

    consumptions.push(await tx.stockCostConsumption.create({
      data: {
        companyId,
        movementId,
        layerId: layer.id,
        quantity: used,
        unitCostCents: layer.unitCostCents,
        totalCostCents: Math.round(used * layer.unitCostCents),
      },
    }));

    remaining -= used;
  }

  if (remaining > 0) throw httpError(409, "FIFO_LAYERS_INSUFFICIENT", "Não existem camadas FIFO suficientes.");
  return { consumptions, totalCostCents: consumptions.reduce((sum, item) => sum + item.totalCostCents, 0) };
}

export async function previewFifoCost(prisma, { companyId, itemId, warehouseId, quantity }) {
  let remaining = Number(quantity);
  if (!Number.isFinite(remaining) || remaining <= 0) throw httpError(400, "INVALID_STOCK_QUANTITY", "Quantidade inválida.");
  const layers = await prisma.stockCostLayer.findMany({
    where: { companyId, itemId, warehouseId, remainingQuantity: { gt: 0 } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const items = [];

  for (const layer of layers) {
    if (remaining <= 0) break;
    const used = Math.min(Number(layer.remainingQuantity), remaining);
    items.push({
      layerId: layer.id,
      quantity: used,
      unitCostCents: layer.unitCostCents,
      totalCostCents: Math.round(used * layer.unitCostCents),
    });
    remaining -= used;
  }

  if (remaining > 0) throw httpError(409, "FIFO_LAYERS_INSUFFICIENT", "Não existem camadas FIFO suficientes.");
  return { items, totalCostCents: items.reduce((sum, item) => sum + item.totalCostCents, 0) };
}

export async function applyFifoToMovementInTransaction(tx, { companyId, movement, input }) {
  const createsLayer =
    ["ENTRY", "RETURN"].includes(movement.type) ||
    (movement.type === "ADJUSTMENT" && movement.toWarehouseId);

  if (createsLayer) {
    // Entradas, devoluções e ajustes positivos aumentam stock e precisam de custo.
    await createFifoLayer(tx, {
      companyId,
      itemId: movement.itemId,
      warehouseId: movement.toWarehouseId,
      sourceMovementId: movement.id,
      quantity: movement.quantity,
      unitCostCents: parseRequiredUnitCostCents(input),
    });
  }

  const consumesLayer =
    ["EXIT", "TRANSFER"].includes(movement.type) ||
    (movement.type === "ADJUSTMENT" && movement.fromWarehouseId);

  if (consumesLayer) {
    // Saídas, transferências e ajustes negativos retiram quantidade das camadas mais antigas.
    const result = await consumeFifoLayers(tx, {
      companyId,
      itemId: movement.itemId,
      warehouseId: movement.fromWarehouseId,
      movementId: movement.id,
      quantity: movement.quantity,
    });

    if (movement.type === "TRANSFER") {
      // A transferência não cria custo novo: move o custo consumido para o armazém de destino.
      for (const consumption of result.consumptions) {
        await createFifoLayer(tx, {
          companyId,
          itemId: movement.itemId,
          warehouseId: movement.toWarehouseId,
          sourceMovementId: movement.id,
          quantity: consumption.quantity,
          unitCostCents: consumption.unitCostCents,
        });
      }
    }
  }
}
```

```js
// apps/api/src/modules/inventory/stockMovementService.js
import { applyFifoToMovementInTransaction } from "./fifoCostService.js";

export async function createStockMovementWithCostInTransaction(tx, context) {
  // Esta função reutiliza a criação de movimento do BK-MF2-02 e acrescenta a valorização FIFO.
  const movement = await createStockMovementInTransaction(tx, context);
  await applyFifoToMovementInTransaction(tx, {
    companyId: context.companyId,
    movement,
    input: context.input,
  });

  return movement;
}

export async function createStockMovement(prisma, context) {
  return prisma.$transaction((tx) => createStockMovementWithCostInTransaction(tx, context));
}
```

```ts
// apps/web/src/lib/stockMovementsApi.ts
export type StockMovementType = "ENTRY" | "EXIT" | "TRANSFER" | "RETURN" | "ADJUSTMENT";

export type StockMovementInput = {
  type: StockMovementType;
  itemId: string;
  quantity: number;
  reason: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  unitCostCents?: number;
};

export async function createStockMovement(data: StockMovementInput) {
  const response = await fetch("/api/inventory/stock-movements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Não foi possível criar o movimento." }));
    throw new Error(body.message ?? "Não foi possível criar o movimento.");
  }

  return response.json() as Promise<{ movement: { id: string; type: StockMovementType } }>;
}
```

```tsx
// apps/web/src/pages/StockMovementsPage.tsx
import { FormEvent, useState } from "react";
import { createStockMovement, StockMovementType } from "../lib/stockMovementsApi";

function movementNeedsUnitCost(type: StockMovementType) {
  return type === "ENTRY" || type === "RETURN";
}

export function StockMovementsPage() {
  const [type, setType] = useState<StockMovementType>("ENTRY");
  const [itemId, setItemId] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCostCents, setUnitCostCents] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await createStockMovement({
        type,
        itemId,
        quantity,
        reason,
        fromWarehouseId: fromWarehouseId || undefined,
        toWarehouseId: toWarehouseId || undefined,
        unitCostCents: movementNeedsUnitCost(type) ? unitCostCents : undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar movimento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Movimentos de stock</h1>
      <form onSubmit={onSubmit}>
        <select value={type} onChange={(event) => setType(event.target.value as StockMovementType)}>
          <option value="ENTRY">Entrada</option>
          <option value="EXIT">Saída</option>
          <option value="TRANSFER">Transferência</option>
          <option value="RETURN">Devolução</option>
        </select>
        <input value={itemId} onChange={(event) => setItemId(event.target.value)} placeholder="Artigo" />
        <input value={fromWarehouseId} onChange={(event) => setFromWarehouseId(event.target.value)} placeholder="Armazém de origem" />
        <input value={toWarehouseId} onChange={(event) => setToWarehouseId(event.target.value)} placeholder="Armazém de destino" />
        <input type="number" min="0.001" step="0.001" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
        {movementNeedsUnitCost(type) ? (
          <input
            type="number"
            min="1"
            step="1"
            value={unitCostCents}
            onChange={(event) => setUnitCostCents(Number(event.target.value))}
            placeholder="Custo unitário em cêntimos"
          />
        ) : null}
        <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo" />
        <button type="submit" disabled={loading}>{loading ? "A guardar..." : "Criar"}</button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      {success ? <p>Movimento criado.</p> : null}
    </section>
  );
}
```

5. Explicação do código.

O consumo recebe `tx` para participar na mesma transação do movimento de stock. Entradas, devoluções e ajustes positivos criam camadas com custo obrigatório; saídas e ajustes negativos consomem camadas; transferências consomem no armazém de origem e recriam no destino com o mesmo custo. O cliente e a página de movimentos passam a enviar `unitCostCents` quando o tipo cria camada FIFO. O preview usa só leitura e não altera camadas. Isto evita custo zero por omissão e mantém `StockBalance` coerente com `StockCostLayer`.

6. Validação do passo.

Testar entrada com `unitCostCents`, saída de 12 unidades com camadas 10+10 e transferência que preserva o custo no armazém de destino.

7. Cenário negativo/erro esperado.

Pedir mais quantidade do que existe devolve `409`. Criar entrada ou devolução sem `unitCostCents` positivo devolve `400`.

### Passo 4 - Expor rota de preview FIFO

1. Objetivo funcional do passo no ERP.

Permitir ao contabilista consultar custo esperado sem escrita.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/fifoCostRoutes.js`.
    - EDITAR: `apps/api/src/server.js`.
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions/permissionMiddleware.js`.
    - LOCALIZAÇÃO: `/api/inventory/fifo-cost` em `apps/api/src/server.js`.

3. Instruções do que fazer.

Criar rota GET protegida.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/inventory/fifoCostRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { previewFifoCost } from "./fifoCostService.js";

export function createFifoCostRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA")];

  router.get("/preview", guards, async (req, res) => {
    try {
      const result = await previewFifoCost(prisma, {
        companyId: req.companyId,
        itemId: String(req.query.itemId ?? ""),
        warehouseId: String(req.query.warehouseId ?? ""),
        quantity: Number(req.query.quantity),
      });
      return res.json(result);
    } catch (error) {
      const response = toHttpError(error);
      return res.status(response.status).json(response.body);
    }
  });
  return router;
}

// apps/api/src/server.js
import { createFifoCostRouter } from "./modules/inventory/fifoCostRoutes.js";

app.use("/api/inventory/fifo-cost", createFifoCostRouter(prisma));
```

5. Explicação do código.

A rota é de leitura e mostra custo apenas a roles autorizadas.

6. Validação do passo.

Teste com contabilista e operacional.

7. Cenário negativo/erro esperado.

Operacional sem permissão deve receber `403`.

### Passo 5 - Criar cliente frontend FIFO

1. Objetivo funcional do passo no ERP.

Chamar preview com tipos explícitos e cookie de sessão.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/fifoCostApi.ts`.
    - EDITAR: nenhum ficheiro adicional neste passo.
    - REVER: `apps/web/src/lib/apiClient.ts`.
    - LOCALIZAÇÃO: `apps/web/src/lib/fifoCostApi.ts`.

3. Instruções do que fazer.

Criar função GET tipada.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/fifoCostApi.ts
export type FifoPreviewLine = { layerId: string; quantity: number; unitCostCents: number; totalCostCents: number };

export async function previewFifoCost(params: { itemId: string; warehouseId: string; quantity: number }) {
  const search = new URLSearchParams({ itemId: params.itemId, warehouseId: params.warehouseId, quantity: String(params.quantity) });
  const response = await fetch(`/api/inventory/fifo-cost/preview?${search.toString()}`, { credentials: "include" });
  if (!response.ok) throw new Error((await response.json()).message ?? "Não foi possível calcular FIFO.");
  return response.json() as Promise<{ items: FifoPreviewLine[]; totalCostCents: number }>;
}
```

5. Explicação do código.

O frontend não calcula FIFO. Apenas pede ao backend e mostra as camadas usadas.

6. Validação do passo.

Smoke com artigo, armazém e quantidade válidos.

7. Cenário negativo/erro esperado.

Erro `409` deve aparecer como mensagem clara.

### Passo 6 - Criar página de preview

1. Objetivo funcional do passo no ERP.

Mostrar camadas e total ao utilizador.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/FifoCostPage.tsx`.
    - EDITAR: `apps/web/src/App.tsx`.
    - REVER: `apps/web/src/pages/StockMovementsPage.tsx`.
    - LOCALIZAÇÃO: `apps/web/src/pages/FifoCostPage.tsx`.

3. Instruções do que fazer.

Criar UI com formulário, loading, erro, vazio e resultado.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/FifoCostPage.tsx
import { FormEvent, useState } from "react";
import { previewFifoCost, type FifoPreviewLine } from "../lib/fifoCostApi";

export function FifoCostPage() {
  const [itemId, setItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<FifoPreviewLine[]>([]);
  const [totalCostCents, setTotalCostCents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await previewFifoCost({ itemId, warehouseId, quantity });
      setItems(result.items);
      setTotalCostCents(result.totalCostCents);
    } catch (err) {
      setItems([]);
      setTotalCostCents(0);
      setError(err instanceof Error ? err.message : "Não foi possível calcular FIFO.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Custo FIFO</h1>
      <form onSubmit={onSubmit}>
        <input value={itemId} onChange={(event) => setItemId(event.target.value)} placeholder="Artigo" />
        <input value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} placeholder="Armazém" />
        <input type="number" min="0.001" step="0.001" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
        <button type="submit" disabled={loading}>{loading ? "A calcular..." : "Calcular"}</button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      {!error && items.length === 0 ? <p>Sem camadas FIFO para mostrar.</p> : null}
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.layerId}>{item.quantity} unidades a {item.unitCostCents / 100} EUR</li>
          ))}
        </ul>
      ) : null}
      {items.length > 0 ? <p>Total: {totalCostCents / 100} EUR</p> : null}
    </section>
  );
}
```

5. Explicação do código.

A página é uma superfície de teste. As regras continuam no backend.

6. Validação do passo.

Testar lista vazia, erro e sucesso.

7. Cenário negativo/erro esperado.

Se não houver camadas, mostrar erro controlado.

### Passo 7 - Validar smoke, negativos e segurança

1. Objetivo funcional do passo no ERP.

Provar que BK-MF2-03 funciona no caso principal e falha de forma controlada nos casos negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/fifoCostService.test.js`.
    - CRIAR: `apps/api/src/modules/inventory/fifoCostRoutes.test.js`.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-03-calculo-de-custo-fifo.md` e ficheiros criados nos passos anteriores.
    - LOCALIZAÇÃO: `apps/api/src/modules/inventory/` e smoke manual em `apps/web/src/pages/FifoCostPage.tsx`.

3. Instruções do que fazer.

Criar teste do fluxo principal, negativos indicados neste guia e smoke manual com sessão real.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:unit -- fifoCost
npm run test:integration -- fifoCost
```

5. Explicação do código.

Os testes provam comportamento, não apenas execução. O aluno consegue defender o que foi verificado e que risco foi bloqueado.

6. Validação do passo.

Confirmar HTTP status, mensagem controlada, ausência de escrita parcial e ausência de dados de outra empresa.

7. Cenário negativo/erro esperado.

Se o smoke passa mas um negativo falha, corrigir service ou rota antes de pedir revisão.

### Passo 8 - Preparar evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar BK-MF2-03 com provas objetivas e deixar o próximo BK pronto para reutilizar os contratos criados.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF2/BK-MF2-03.md`.
    - EDITAR: nenhum ficheiro de aplicação neste passo.
    - REVER: outputs de testes, screenshots e resumo do PR.
    - LOCALIZAÇÃO: `docs/evidence/MF2/BK-MF2-03.md`.

3. Instruções do que fazer.

Registar ficheiros alterados, endpoints criados, comandos executados, resultados dos negativos e riscos que ficam para o próximo BK.

4. Código completo, correto e integrado com a app final.

```md
# BK-MF2-03

- Requisito validado: RF25
- Endpoints: GET /api/inventory/fifo-cost/preview
- Negativos: quantidade inválida, camadas insuficientes, role sem permissão
- Resultado: preencher com comandos, custo esperado e imagem da página
```

5. Explicação do código.

A evidence liga requisito, código e validação. Sem esta prova, o BK continua fraco para revisão e defesa PAP.

6. Validação do passo.

Confirmar handoff para `BK-MF2-04` com exports, endpoints, modelos e limitações.

7. Cenário negativo/erro esperado.

Se existir bloqueio real, marcar no relatório e evidence com erro observado e impacto.

## Expected results

- Entrada com custo cria camada.
- Saída consome camada mais antiga.
- Preview não altera `remainingQuantity`.
- Consumo regista custo total.

## Critérios de aceite

- Todos os passos seguem a estrutura obrigatória 1 a 7.
- Backend aplica autenticação, autorização e contexto multiempresa.
- Frontend usa `credentials: "include"` e não guarda tokens em `localStorage`.
- Erros são controlados e em português de Portugal.
- Evidence inclui smoke, negativos e ficheiros alterados.

## Validação final

- Duas entradas com custos diferentes e uma saída parcial.
- Preview sem escrita.
- Saída sem camadas suficientes.

## Evidence para PR/defesa

- Output de teste FIFO.
- Tabela com camadas e custo.
- Negativo de camadas insuficientes.

## Handoff

BK-MF2-04 deve reutilizar movimentos e saldos; ajustes positivos podem criar camadas e ajustes negativos podem consumir camadas.

## Changelog

- `2026-06-07`: guia reescrito como tutorial técnico linear, autocontido e alinhado com RF/RNF, MF0, MF1 e contrato de stack.
