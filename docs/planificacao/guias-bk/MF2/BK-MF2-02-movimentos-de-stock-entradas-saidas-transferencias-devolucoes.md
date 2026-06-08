# BK-MF2-02 - Movimentos de stock: entradas, saídas, transferências, devoluções.

## Header

- `doc_id`: `GUIA-BK-MF2-02`
- `bk_id`: `BK-MF2-02`
- `macro`: `MF2`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-03, BK-MF0-11, BK-MF0-12`
- `rf_rnf`: `RF24`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-03`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-02-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md`
- `last_updated`: `2026-06-08`

## Objetivo

Neste BK vais criar o motor operacional de inventário para registar entradas, saídas, transferências e devoluções por empresa, artigo e armazém.

## Importância funcional e pedagógica

RF24 é a base de inventário para FIFO, contagens, alertas e relatórios. Pedagogicamente, mostra que alterar stock exige transação, validação e auditoria.

## Scope-in

- Entradas, saídas, transferências e devoluções.
- Saldo atual por artigo/armazém.
- Bloqueio de saldo negativo.
- Auditoria de movimentos.

## Scope-out

- Cálculo FIFO detalhado.
- Contagem física.
- Alertas automáticos.
- Integração automática com documentos fiscais.

## Estado antes

Artigos e armazéns existem, mas ainda não há movimentos transacionais que alterem saldos.

## Estado depois

O backend cria movimentos, atualiza saldos na mesma transação e expõe API/UI para uso operacional.

## Pré-requisitos

- Ler RF24.
- Confirmar BK-MF0-03, BK-MF0-11 e BK-MF0-12.
- Confirmar roles de inventário.

## Fundamentação documental

- `CANONICO`: RF24 cobre entradas, saídas, transferências e devoluções.
- `CANONICO`: RF11/RF12 fornecem artigos e armazéns.
- `DERIVADO`: `StockBalance` evita recalcular histórico para cada consulta.
- `DERIVADO`: `ADJUSTMENT` prepara BK-MF2-04 e só é válido se indicar exatamente um armazém: destino para ajuste positivo ou origem para ajuste negativo.

## Glossário

- **Movimento:** evento que altera quantidade.
- **Saldo:** quantidade atual por artigo/armazém.
- **Transferência:** saída de um armazém e entrada noutro.
- **Ajuste:** movimento auditado que corrige uma diferença física sem editar `StockBalance` diretamente.

## Conceitos teóricos essenciais

- **Movimento de stock no domínio de inventário:** é o facto operacional que explica porque o saldo mudou. Vem de uma entrada, saída, transferência, devolução ou ajuste, é guardado em `StockMovement`, atualiza `StockBalance`, serve para reconstruir o histórico por artigo e armazém, e evita saldos alterados diretamente sem origem auditável.
- **Saldo por artigo e armazém:** é a quantidade atual de um artigo num armazém específico. Vem da soma controlada dos movimentos, é persistido para leitura rápida, alimenta alertas e contagens, serve para decisões de compra e venda, e evita confundir stock total da empresa com stock disponível num local.
- **Transação de inventário:** movimento e saldo são gravados juntos. O pedido vem da rota protegida, o service valida tipo, quantidade e armazéns, atualiza saldo em transação, serve para impedir escritas parciais, e evita movimentos registados sem impacto no saldo ou saldos alterados sem movimento.
- **Regras negativas de stock:** saídas não podem ultrapassar saldo e transferências não podem usar o mesmo armazém como origem e destino. A informação vem do formulário, é validada no backend, devolve erro controlado, serve para manter consistência física, e evita stock negativo ou movimentos sem significado.
- **Segurança multiempresa no frontend e backend:** a UI envia apenas dados operacionais; empresa e utilizador vêm da sessão. O backend filtra artigos, armazéns e movimentos por `companyId`, serve para separar dados de clientes, e evita que um pedido manipulado mova stock de outra empresa.

## Arquitetura do BK

- Endpoints: `POST/GET /api/inventory/stock-movements`.
- Backend: `apps/api/src/modules/inventory/`.
- Frontend: `apps/web/src/lib/stockMovementsApi.ts` e `apps/web/src/pages/StockMovementsPage.tsx`.

## Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`.
- CRIAR: `apps/api/src/modules/inventory/stockMovementValidators.js`.
- CRIAR: `apps/api/src/modules/inventory/stockMovementService.js`.
- CRIAR: `apps/api/src/modules/inventory/stockMovementRoutes.js`.
- EDITAR: `apps/api/src/server.js`.
- CRIAR: `apps/web/src/lib/stockMovementsApi.ts`.
- CRIAR: `apps/web/src/pages/StockMovementsPage.tsx`.
- REVER: modelos `Item` e `Warehouse` em `apps/api/prisma/schema.prisma`.

## Erros comuns

- Editar saldo sem histórico.
- Permitir saldo negativo.
- Transferir para o mesmo armazém.
- Misturar empresas.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403`.
- Recurso de outra empresa deve devolver `404` ou `403`, sem expor dados.
- Saída acima do saldo devolve `409`.
- Transferência para o mesmo armazém devolve `400`.
- Ajuste sem armazém, ou com origem e destino ao mesmo tempo, devolve `400`.
- Quantidade zero devolve `400`.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que BK-MF2-02 cobre apenas RF24 e mantém owner, prioridade, esforço, sprint, macrofase e próximo BK alinhados com os documentos canónicos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `README.md`, `docs/RF.md`, `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `CONTRATO-STACK-IMPLEMENTACAO.md`.
    - LOCALIZAÇÃO: `docs/planificacao/guias-bk/MF2/BK-MF2-02-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md`, header deste guia e linha canónica de `BK-MF2-02`.

3. Instruções do que fazer.

Comparar o header com matriz, backlog e contrato de campos antes de escrever código. Se a estrutura real de pastas divergir, preservar o contrato funcional e registar a adaptação na evidence.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF2-02
macro=MF2
rf=RF24
dependencias=BK-MF0-03, BK-MF0-11, BK-MF0-12
proximo=BK-MF2-03
```

5. Explicação do código.

Este bloco é um contrato de execução. Ele evita que o aluno comece por criar entidades, endpoints ou roles desalinhados da planificação. Num ERP, uma alteração errada propaga-se para inventário, contabilidade, auditoria e relatórios.

6. Validação do passo.

A evidence deve indicar que `RF24` foi confirmado e que as dependências `BK-MF0-03, BK-MF0-11, BK-MF0-12` existem ou estão preparadas.

7. Cenário negativo/erro esperado.

Se aparecer uma regra sem fonte documental, não a implementar como requisito. Registar a dúvida e pedir decisão ao responsável.
### Passo 2 - Modelar dados persistentes

1. Objetivo funcional do passo no ERP.

Criar ou ajustar os modelos necessários para Movimentos de stock: entradas, saídas, transferências, devoluções.

2. Ficheiros envolvidos:
    - CRIAR: migration Prisma gerada a partir de `apps/api/prisma/schema.prisma`.
    - EDITAR: `apps/api/prisma/schema.prisma`.
    - REVER: modelos `Item`, `Warehouse`, `Company` e `User` em `apps/api/prisma/schema.prisma`.
    - LOCALIZAÇÃO: blocos `StockBalance`, `StockMovement` e `StockMovementType`.

3. Instruções do que fazer.

Aplicar os modelos sem duplicar entidades já criadas em MF0/MF1. Se um enum já existir, editar o enum existente.

4. Código completo, correto e integrado com a app final.

```prisma
enum StockMovementType { ENTRY EXIT TRANSFER RETURN ADJUSTMENT }

model StockBalance {
  id          String    @id @default(uuid())
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id])
  itemId      String
  item        Item      @relation(fields: [itemId], references: [id])
  warehouseId String
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id])
  quantity    Decimal   @default(0) @db.Decimal(18, 3)
  updatedAt   DateTime  @updatedAt

  @@unique([companyId, itemId, warehouseId])
  @@index([companyId, warehouseId])
}

model StockMovement {
  id              String            @id @default(uuid())
  companyId       String
  company         Company           @relation(fields: [companyId], references: [id])
  itemId          String
  item            Item              @relation(fields: [itemId], references: [id])
  type            StockMovementType
  quantity        Decimal           @db.Decimal(18, 3)
  fromWarehouseId String?
  fromWarehouse   Warehouse?        @relation("StockMovementFromWarehouse", fields: [fromWarehouseId], references: [id])
  toWarehouseId   String?
  toWarehouse     Warehouse?        @relation("StockMovementToWarehouse", fields: [toWarehouseId], references: [id])
  reason          String
  sourceType      String?
  sourceId        String?
  createdById     String
  createdBy       User              @relation(fields: [createdById], references: [id])
  createdAt       DateTime          @default(now())

  @@index([companyId, itemId, createdAt])
  @@index([companyId, fromWarehouseId])
  @@index([companyId, toWarehouseId])
}

// Acrescentar no modelo Company:
// stockBalances StockBalance[]
// stockMovements StockMovement[]

// Acrescentar no modelo Item:
// stockBalances StockBalance[]
// stockMovements StockMovement[]

// Acrescentar no modelo Warehouse:
// stockBalances StockBalance[]
// outgoingStockMovements StockMovement[] @relation("StockMovementFromWarehouse")
// incomingStockMovements StockMovement[] @relation("StockMovementToWarehouse")

// Acrescentar no modelo User:
// stockMovements StockMovement[]
```

5. Explicação do código.

A persistência é a camada de integridade mais baixa. Os modelos incluem `companyId` para permitir filtro por empresa e índices para consultas previsíveis. A relação inversa em `User` completa a ligação entre o operador autenticado e os movimentos que criou.

6. Validação do passo.

Gerar migration e confirmar que não há modelos, enums ou relações Prisma duplicadas.

7. Cenário negativo/erro esperado.

Se a migration quebrar por relação inexistente, corrigir a relação no schema antes de avançar.
### Passo 3 - Implementar validadores e service

1. Objetivo funcional do passo no ERP.

Colocar a regra de negócio de Movimentos de stock: entradas, saídas, transferências, devoluções. no backend, não no browser.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/stockMovementValidators.js`.
    - CRIAR: `apps/api/src/modules/inventory/stockMovementService.js`.
    - EDITAR: nenhum ficheiro externo ao módulo neste passo.
    - REVER: `apps/api/src/lib/httpErrors.js`.
    - LOCALIZAÇÃO: `apps/api/src/modules/inventory/stockMovementService.js`.

3. Instruções do que fazer.

Criar validadores antes do service e fazer a escrita principal numa transação sempre que houver alteração de dados.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/inventory/stockMovementService.js
import { httpError } from "../../lib/httpErrors.js";

const MOVEMENT_TYPES = new Set(["ENTRY", "EXIT", "TRANSFER", "RETURN", "ADJUSTMENT"]);

export function parseStockMovement(input) {
  const type = String(input?.type ?? "").trim().toUpperCase();
  const quantity = Number(input?.quantity);
  const itemId = String(input?.itemId ?? "").trim();
  const reason = String(input?.reason ?? "").trim();
  const fromWarehouseId = input?.fromWarehouseId ? String(input.fromWarehouseId).trim() : null;
  const toWarehouseId = input?.toWarehouseId ? String(input.toWarehouseId).trim() : null;

  if (!MOVEMENT_TYPES.has(type)) {
    throw httpError(400, "INVALID_STOCK_MOVEMENT_TYPE", "Tipo de movimento inválido.");
  }

  if (!itemId) throw httpError(400, "ITEM_REQUIRED", "Indica o artigo.");
  if (!Number.isFinite(quantity) || quantity <= 0) throw httpError(400, "INVALID_STOCK_QUANTITY", "Quantidade inválida.");
  if (reason.length < 4) throw httpError(400, "STOCK_REASON_REQUIRED", "Indica o motivo.");

  if (["ENTRY", "RETURN"].includes(type) && !toWarehouseId) {
    throw httpError(400, "DESTINATION_WAREHOUSE_REQUIRED", "Indica o armazém de destino.");
  }

  if (type === "EXIT" && !fromWarehouseId) {
    throw httpError(400, "SOURCE_WAREHOUSE_REQUIRED", "Indica o armazém de origem.");
  }

  if (type === "TRANSFER" && (!fromWarehouseId || !toWarehouseId)) {
    throw httpError(400, "TRANSFER_WAREHOUSES_REQUIRED", "Indica a origem e o destino da transferência.");
  }

  if (type === "TRANSFER" && fromWarehouseId === toWarehouseId) throw httpError(400, "TRANSFER_SAME_WAREHOUSE", "Origem e destino têm de ser diferentes.");

  if (type === "ADJUSTMENT" && Boolean(fromWarehouseId) === Boolean(toWarehouseId)) {
    throw httpError(
      400,
      "ADJUSTMENT_WAREHOUSE_REQUIRED",
      "Um ajuste deve indicar apenas origem ou apenas destino."
    );
  }

  return { type, quantity, itemId, reason, fromWarehouseId, toWarehouseId };
}

async function assertItemAndWarehousesBelongToCompany(tx, { companyId, itemId, fromWarehouseId, toWarehouseId }) {
  const item = await tx.item.findFirst({ where: { id: itemId, companyId, isActive: true }, select: { id: true } });
  if (!item) throw httpError(404, "ITEM_NOT_FOUND", "Artigo não encontrado nesta empresa.");

  const warehouseIds = [fromWarehouseId, toWarehouseId].filter(Boolean);
  const warehouses = await tx.warehouse.findMany({
    where: { id: { in: warehouseIds }, companyId, isActive: true },
    select: { id: true },
  });

  if (warehouses.length !== warehouseIds.length) {
    throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado nesta empresa.");
  }
}

async function changeBalance(tx, { companyId, itemId, warehouseId, delta }) {
  const current = await tx.stockBalance.upsert({
    where: { companyId_itemId_warehouseId: { companyId, itemId, warehouseId } },
    update: {},
    create: { companyId, itemId, warehouseId, quantity: 0 },
  });

  const nextQuantity = Number(current.quantity) + delta;
  if (nextQuantity < 0) throw httpError(409, "INSUFFICIENT_STOCK", "Saldo insuficiente.");

  return tx.stockBalance.update({
    where: { id: current.id },
    data: { quantity: nextQuantity },
  });
}

export async function createStockMovementInTransaction(tx, { companyId, userId, input }) {
  const data = parseStockMovement(input);
  await assertItemAndWarehousesBelongToCompany(tx, { companyId, ...data });

  if (data.fromWarehouseId) {
    await changeBalance(tx, {
      companyId,
      itemId: data.itemId,
      warehouseId: data.fromWarehouseId,
      delta: -data.quantity,
    });
  }

  if (data.toWarehouseId) {
    await changeBalance(tx, {
      companyId,
      itemId: data.itemId,
      warehouseId: data.toWarehouseId,
      delta: data.quantity,
    });
  }

  const movement = await tx.stockMovement.create({
    data: { ...data, companyId, createdById: userId },
  });

  // A auditoria permite explicar quem alterou stock, em que empresa e por que motivo.
  await tx.auditLog.create({
    data: {
      companyId,
      userId,
      action: "STOCK_MOVEMENT_CREATED",
      entity: "StockMovement",
      entityId: movement.id,
      details: {
        type: data.type,
        quantity: data.quantity,
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
      },
    },
  });

  return movement;
}

export async function createStockMovement(prisma, context) {
  return prisma.$transaction((tx) => createStockMovementInTransaction(tx, context));
}
```

5. Explicação do código.

O validador rejeita entrada inválida cedo. Para `ADJUSTMENT`, a regra evita movimentos sem efeito: se existir `fromWarehouseId`, o saldo diminui; se existir `toWarehouseId`, o saldo aumenta. O service aplica empresa, auditoria com `AuditLog.details` e transação. Isto evita dados parciais e impede que o frontend escolha regras de negócio.

6. Validação do passo.

Testar o service diretamente com dados válidos e inválidos.

7. Cenário negativo/erro esperado.

Entrada inválida deve devolver erro controlado e não criar registos.
### Passo 4 - Expor rotas protegidas

1. Objetivo funcional do passo no ERP.

Disponibilizar Movimentos de stock: entradas, saídas, transferências, devoluções. através de HTTP com autenticação, empresa e role.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/stockMovementRoutes.js`.
    - EDITAR: `apps/api/src/server.js`.
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions/permissionMiddleware.js`.
    - LOCALIZAÇÃO: `/api/inventory/stock-movements` em `apps/api/src/server.js`.

3. Instruções do que fazer.

Montar o router sob o prefixo indicado e usar `toHttpError` para normalizar falhas.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/inventory/stockMovementRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { createStockMovement } from "./stockMovementService.js";

export function createStockMovementRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "OPERACIONAL")];

  router.post("/", guards, async (req, res) => {
    try {
      const movement = await createStockMovement(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        input: req.body,
      });
      return res.status(201).json({ movement });
    } catch (error) {
      const response = toHttpError(error);
      return res.status(response.status).json(response.body);
    }
  });

  router.get("/", guards, async (req, res) => {
    const items = await prisma.stockMovement.findMany({
      where: { companyId: req.companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.json({ items });
  });

  return router;
}

// apps/api/src/server.js
import { createStockMovementRouter } from "./modules/inventory/stockMovementRoutes.js";

app.use("/api/inventory/stock-movements", createStockMovementRouter(prisma));
```

5. Explicação do código.

A rota é fina: valida sessão, empresa e role, chama o service e devolve resposta controlada. O service continua a ser a fonte de verdade da regra.

6. Validação do passo.

Executar teste de contrato com sessão válida, sem sessão e com role sem permissão.

7. Cenário negativo/erro esperado.

Sem sessão deve devolver `401`; role sem permissão deve devolver `403`.
### Passo 5 - Criar cliente API frontend

1. Objetivo funcional do passo no ERP.

Ligar o frontend ao endpoint real de Movimentos de stock: entradas, saídas, transferências, devoluções..

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/stockMovementsApi.ts`.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `apps/web/src/lib/apiClient.ts`.
    - LOCALIZAÇÃO: `apps/web/src/lib/stockMovementsApi.ts`.

3. Instruções do que fazer.

Criar função tipada, enviar JSON e usar `credentials: "include"` para manter sessão por cookie HttpOnly.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/stockMovementsApi.ts
export type StockMovementType = "ENTRY" | "EXIT" | "TRANSFER" | "RETURN" | "ADJUSTMENT";
export type StockMovementInput = { type: StockMovementType; itemId: string; quantity: number; reason: string; fromWarehouseId?: string; toWarehouseId?: string };

export async function createStockMovement(data: StockMovementInput) {
  const response = await fetch("/api/inventory/stock-movements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error((await response.json()).message ?? "Não foi possível criar o movimento.");
  return response.json() as Promise<{ movement: { id: string; type: StockMovementType } }>;
}
```

5. Explicação do código.

`credentials: "include"` envia a sessão sem expor tokens ao JavaScript. O tipo do cliente deixa claro que dados entram e que resposta sai.

6. Validação do passo.

Testar chamada com sessão ativa e confirmar que a resposta chega à UI.

7. Cenário negativo/erro esperado.

Se a API devolver erro, a função deve lançar `Error` com mensagem clara.
### Passo 6 - Criar página ou componente de trabalho

1. Objetivo funcional do passo no ERP.

Dar ao aluno uma superfície visual mínima para usar e testar Movimentos de stock: entradas, saídas, transferências, devoluções..

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/StockMovementsPage.tsx`.
    - EDITAR: `apps/web/src/App.tsx`.
    - REVER: `apps/web/src/pages/mf1Pages.tsx`.
    - LOCALIZAÇÃO: `apps/web/src/pages/StockMovementsPage.tsx`.

3. Instruções do que fazer.

Criar UI com formulário, loading, erro, sucesso e estado vazio sempre que existir listagem.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/StockMovementsPage.tsx
import { FormEvent, useState } from "react";
import { createStockMovement, StockMovementType } from "../lib/stockMovementsApi";

export function StockMovementsPage() {
  const [type, setType] = useState<StockMovementType>("ENTRY");
  const [itemId, setItemId] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
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

A UI ajuda a testar o fluxo, mas não decide segurança nem regras de negócio. O backend continua a validar empresa, role e estados.

6. Validação do passo.

Fazer smoke manual no browser com dados válidos e inválidos.

7. Cenário negativo/erro esperado.

Se o backend rejeitar, a página mostra erro e não assume sucesso local.
### Passo 7 - Validar smoke, negativos e segurança

1. Objetivo funcional do passo no ERP.

Provar que BK-MF2-02 funciona no caso principal e falha de forma controlada nos casos negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/stockMovementService.test.js`.
    - CRIAR: `apps/api/src/modules/inventory/stockMovementRoutes.test.js`.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-02-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md` e ficheiros criados nos passos anteriores.
    - LOCALIZAÇÃO: `apps/api/src/modules/inventory/` e smoke manual em `apps/web/src/pages/StockMovementsPage.tsx`.

3. Instruções do que fazer.

Criar pelo menos um teste do fluxo principal, testes negativos indicados neste guia e um smoke manual com sessão real. Validar também que a UI mostra loading, erro, vazio e sucesso, se o BK tiver frontend.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:unit -- stockMovement
npm run test:integration -- stockMovement
```

5. Explicação do código.

Os testes devem provar comportamento, não apenas executar funções. Para um aluno do 12.º ano, isto ajuda a explicar na defesa o que foi verificado e porque a solução é segura.

6. Validação do passo.

Confirmar HTTP status, mensagem controlada, ausência de escrita parcial e ausência de dados de outra empresa.

7. Cenário negativo/erro esperado.

Se o smoke passa mas um negativo falha, corrigir o service ou a rota antes de pedir revisão.
### Passo 8 - Preparar evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar BK-MF2-02 com provas objetivas e deixar o próximo BK pronto para reutilizar os contratos criados.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF2/BK-MF2-02.md`.
    - EDITAR: nenhum ficheiro de aplicação neste passo.
    - REVER: outputs de testes, screenshots e resumo do PR.
    - LOCALIZAÇÃO: `docs/evidence/MF2/BK-MF2-02.md`.

3. Instruções do que fazer.

Registar ficheiros alterados, endpoints criados, comandos executados, resultados dos negativos e riscos que ficam para o próximo BK.

4. Código completo, correto e integrado com a app final.

```md
# BK-MF2-02

- Requisito validado: RF24
- Endpoints: POST /api/inventory/stock-movements, GET /api/inventory/stock-movements
- Negativos: saldo insuficiente, armazém de outra empresa, transferência para o mesmo armazém, role sem permissão
- Resultado: preencher com comandos, resposta HTTP e imagem da página
```

5. Explicação do código.

A evidence liga requisito, código e validação. Sem esta prova, o BK pode estar tecnicamente correto mas continua fraco para revisão técnica e defesa PAP.

6. Validação do passo.

Confirmar que o handoff para `BK-MF2-03` indica que exports, endpoints, modelos e limitações ficaram disponíveis.

7. Cenário negativo/erro esperado.

Se existir bloqueio real, marcar explicitamente na evidence e no relatório de auditoria, com erro observado e impacto.

## Expected results

- Entrada aumenta saldo.
- Saída diminui saldo se houver stock.
- Transferência altera origem e destino.
- Devolução aumenta saldo com motivo.
- Cada movimento cria auditoria com `details`.

## Critérios de aceite

- Todos os passos seguem a estrutura obrigatória 1 a 7.
- O backend aplica autenticação, autorização e contexto multiempresa.
- A UI usa `credentials: "include"` e não guarda tokens em `localStorage`.
- Os erros são controlados e em português de Portugal.
- A evidence inclui smoke, negativos e ficheiros alterados.

## Validação final

- Teste de entrada.
- Teste de saída com saldo insuficiente.
- Teste de transferência.
- Smoke UI.

## Evidence para PR/defesa

- Output de testes.
- Screenshot da página.
- Negativo de saldo insuficiente.
- Resumo do PR.

## Handoff

BK-MF2-03 reutiliza `StockMovement` e `StockBalance` para custo FIFO.

## Changelog

- `2026-06-08`: adicionada relação inversa em `User` para `StockMovement` e alinhada a auditoria com `AuditLog.details`.
- `2026-06-07`: guia reescrito como tutorial técnico linear, autocontido e alinhado com RF/RNF, MF0, MF1 e contrato de stack.
