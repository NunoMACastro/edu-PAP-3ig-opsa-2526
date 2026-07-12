# BK-MF2-05 - Alertas de stock (mínimos, máximos, artigos parados).

## Header

- `doc_id`: `GUIA-BK-MF2-05`
- `bk_id`: `BK-MF2-05`
- `macro`: `MF2`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF2-02`
- `rf_rnf`: `RF27`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF2-06`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-05-alertas-de-stock-minimos-maximos-artigos-parados.md`
- `last_updated`: `2026-07-10`

## Objetivo

Neste BK vais criar alertas de stock mínimo, máximo e artigos parados, sempre explicando a origem dos dados.

## Importância funcional e pedagógica

RF27 transforma saldos em decisão operacional. Pedagogicamente, mostra diferença entre alerta explicável e ação automática.

## Scope-in

- Configurar limites por artigo/armazém.
- Listar alertas `LOW_STOCK`, `HIGH_STOCK`, `STOPPED_ITEM`.
- Mostrar origem dos dados.

## Scope-out

- IA preditiva.
- Notificações.
- Compras automáticas.

## Estado antes

Há saldos, mas o utilizador procura problemas manualmente.

## Estado depois

A app lista alertas explicáveis sem alterar stock.

## Pré-requisitos

- Ler RF27.
- Confirmar BK-MF2-02.
- Confirmar que alertas não executam ações.

## Fundamentação documental

- `CANONICO`: RF27 cobre mínimos, máximos e artigos parados.
- `DERIVADO`: configuração separada por armazém permite limites diferentes.
- `CANONICO`: MF4 pode consumir fonte explicável.

## Glossário

- **Stock mínimo:** risco de rutura.
- **Stock máximo:** excesso.
- **Artigo parado:** sem movimento há muitos dias.

## Conceitos teóricos essenciais

- **Alerta de stock no domínio de inventário:** é uma indicação de risco ou excesso, não um movimento. Vem da comparação entre saldo, configuração e último movimento, é devolvido pela API para leitura, serve para apoiar reposição ou análise, e evita alterar inventário apenas por existir uma recomendação.
- **Stock mínimo e máximo:** são limites operacionais por artigo e armazém. Vêm da configuração do utilizador autorizado, ficam em `StockAlertSetting`, alimentam o cálculo de alertas, servem para identificar rutura ou excesso, e evitam decisões baseadas só em perceção visual.
- **Artigo parado:** é um artigo sem movimentos durante um número definido de dias. A informação vem de `StockMovement`, é comparada com a configuração, aparece na UI como alerta, serve para libertar capital e espaço, e evita manter inventário sem rotação sem visibilidade.
- **Backend de leitura agregada:** o service cruza saldos, regras e movimentos. O pedido vem da rota protegida, o backend filtra por empresa e armazém, devolve origem do alerta, serve para explicar o resultado ao utilizador, e evita alertas sem justificação.
- **Frontend operacional:** a página mostra alertas, configurações e estado vazio. Os dados vêm da API autenticada, são apresentados sem alterar stock, servem para ação humana posterior, e evitam confundir aviso com ajuste automático.
- **Segurança multiempresa:** empresa e role vêm da sessão. A API nunca aceita `companyId` do corpo, serve para separar tenants, e evita que configurações de alerta afetem outra empresa.

## Arquitetura do BK

- Endpoints: `GET /api/inventory/stock-alerts`, `PUT /api/inventory/stock-alerts/settings`.
- Modelo: `StockAlertSetting`.

## Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`.
- CRIAR: `apps/api/src/modules/inventory/stockAlertService.js`.
- CRIAR: `apps/api/src/modules/inventory/stockAlertRoutes.js`.
- EDITAR: `apps/api/src/server.js`.
- CRIAR: `apps/web/src/lib/stockAlertsApi.ts`.
- CRIAR: `apps/web/src/pages/StockAlertsPage.tsx`.
- REVER: `apps/api/src/modules/inventory/stockMovementService.js`.

## Erros comuns

- Gerar alerta sem origem.
- Mover stock por alerta.
- Ignorar armazém.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403`.
- Recurso de outra empresa deve devolver `404` ou `403`, sem expor dados.
- Mínimo maior que máximo devolve `400`.
- Dias negativos devolvem `400`.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que BK-MF2-05 cobre apenas RF27 e mantém metadados alinhados com matriz, backlog e contrato de campos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `README.md`, `docs/RF.md`, `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `CONTRATO-STACK-IMPLEMENTACAO.md`.
    - LOCALIZAÇÃO: `docs/planificacao/guias-bk/MF2/BK-MF2-05-alertas-de-stock-minimos-maximos-artigos-parados.md`, header deste guia e linha canónica de `BK-MF2-05`.

3. Instruções do que fazer.

Comparar header, dependências e próximo BK. Se os caminhos reais da app divergirem, preservar o contrato funcional e registar a adaptação na evidence.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF2-05
macro=MF2
rf=RF27
dependencias=BK-MF2-02
proximo=BK-MF2-06
```

5. Explicação do código.

Este contrato impede drift antes da implementação. Num ERP, uma alteração errada em stock ou contabilidade propaga-se para relatórios, auditoria e defesa PAP.

6. Validação do passo.

A evidence deve indicar que `RF27` e `BK-MF2-02` foram confirmados.

7. Cenário negativo/erro esperado.

Se aparecer regra sem fonte documental, registar dúvida e não a transformar em requisito.

### Passo 2 - Modelar configuração

1. Objetivo funcional do passo no ERP.

Guardar limites por artigo e armazém.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`.
    - REVER: modelo `StockBalance` em `apps/api/prisma/schema.prisma`.
    - LOCALIZAÇÃO: bloco `StockAlertSetting` e relações inversas em `Company`, `Item` e `Warehouse`.

3. Instruções do que fazer.

Adicionar modelo e relações inversas nos modelos existentes `Company`, `Item` e `Warehouse`.

4. Código completo, correto e integrado com a app final.

```prisma
model StockAlertSetting {
  id               String    @id @default(uuid())
  companyId        String
  company          Company   @relation(fields: [companyId], references: [id])
  itemId           String
  item             Item      @relation(fields: [itemId], references: [id])
  warehouseId      String
  warehouse        Warehouse @relation(fields: [warehouseId], references: [id])
  minQuantity      Decimal?  @db.Decimal(18, 3)
  maxQuantity      Decimal?  @db.Decimal(18, 3)
  stoppedAfterDays Int?      @default(90)
  updatedAt        DateTime  @updatedAt

  @@unique([companyId, itemId, warehouseId])
  @@index([companyId, warehouseId])
  @@index([itemId])
}
```

No mesmo ficheiro, acrescentar estas relações aos modelos existentes:

```prisma
model Company {
  stockAlertSettings StockAlertSetting[]
}

model Item {
  stockAlertSettings StockAlertSetting[]
}

model Warehouse {
  stockAlertSettings StockAlertSetting[]
}
```

5. Explicação do código.

A regra fica separada do artigo porque limites podem variar por armazém. As relações permitem que o service devolva artigo e armazém no mesmo resultado sem depender de campos inexistentes no schema.

6. Validação do passo.

Criar e atualizar configuração.

7. Cenário negativo/erro esperado.

Duplicado deve falhar pela constraint.

### Passo 3 - Implementar service de alertas

1. Objetivo funcional do passo no ERP.

Calcular alertas com origem dos dados.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/stockAlertService.js`.
    - REVER: `apps/api/src/modules/inventory/stockMovementService.js`.
    - LOCALIZAÇÃO: `apps/api/src/modules/inventory/stockAlertService.js`.

3. Instruções do que fazer.

Validar configuração e listar alertas.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/inventory/stockAlertService.js
import {
  buildCursorPage,
  decodePageCursor,
  parsePageLimit,
} from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";

export function parseStockAlertSetting(input) {
  const itemId = String(input?.itemId ?? "").trim();
  const warehouseId = String(input?.warehouseId ?? "").trim();
  const minQuantity = input?.minQuantity == null ? null : Number(input.minQuantity);
  const maxQuantity = input?.maxQuantity == null ? null : Number(input.maxQuantity);
  const stoppedAfterDays = Number(input?.stoppedAfterDays ?? 90);

  if (!itemId) throw httpError(400, "ITEM_REQUIRED", "Indica o artigo.");
  if (!warehouseId) throw httpError(400, "WAREHOUSE_REQUIRED", "Indica o armazém.");
  if (minQuantity !== null && (!Number.isFinite(minQuantity) || minQuantity < 0)) {
    throw httpError(400, "INVALID_MIN_QUANTITY", "O mínimo não pode ser negativo.");
  }
  if (maxQuantity !== null && (!Number.isFinite(maxQuantity) || maxQuantity < 0)) {
    throw httpError(400, "INVALID_MAX_QUANTITY", "O máximo não pode ser negativo.");
  }
  if (minQuantity !== null && maxQuantity !== null && minQuantity > maxQuantity) {
    throw httpError(400, "MIN_GREATER_THAN_MAX", "O mínimo não pode ser maior do que o máximo.");
  }
  if (!Number.isInteger(stoppedAfterDays) || stoppedAfterDays < 1) {
    throw httpError(400, "INVALID_STOPPED_DAYS", "Os dias sem movimento têm de ser positivos.");
  }

  return { itemId, warehouseId, minQuantity, maxQuantity, stoppedAfterDays };
}

export async function saveStockAlertSetting(prisma, { companyId, input }) {
  const data = parseStockAlertSetting(input);

  const [item, warehouse] = await Promise.all([
    prisma.item.findFirst({ where: { id: data.itemId, companyId, isActive: true }, select: { id: true } }),
    prisma.warehouse.findFirst({ where: { id: data.warehouseId, companyId, isActive: true }, select: { id: true } }),
  ]);

  if (!item) throw httpError(404, "ITEM_NOT_FOUND", "Artigo não encontrado.");
  if (!warehouse) throw httpError(404, "WAREHOUSE_NOT_FOUND", "Armazém não encontrado.");

  return prisma.stockAlertSetting.upsert({
    where: {
      companyId_itemId_warehouseId: {
        companyId,
        itemId: data.itemId,
        warehouseId: data.warehouseId,
      },
    },
    update: data,
    create: { companyId, ...data },
  });
}

export async function listStockAlerts(prisma, { companyId, now = new Date(), cursor: opaqueCursor, limit: rawLimit }) {
  const settings = await prisma.stockAlertSetting.findMany({
    where: { companyId },
    include: {
      item: { select: { id: true, name: true, sku: true } },
      warehouse: { select: { id: true, name: true } },
    },
  });
  const alerts = [];

  for (const setting of settings) {
    const balance = await prisma.stockBalance.findUnique({
      where: {
        companyId_itemId_warehouseId: {
          companyId,
          itemId: setting.itemId,
          warehouseId: setting.warehouseId,
        },
      },
    });
    const quantity = Number(balance?.quantity ?? 0);

    if (setting.minQuantity !== null && quantity < Number(setting.minQuantity)) {
      alerts.push({
        type: "LOW_STOCK",
        item: setting.item,
        warehouse: setting.warehouse,
        quantity,
        threshold: Number(setting.minQuantity),
        source: "StockBalance.quantity",
      });
    }

    if (setting.maxQuantity !== null && quantity > Number(setting.maxQuantity)) {
      alerts.push({
        type: "HIGH_STOCK",
        item: setting.item,
        warehouse: setting.warehouse,
        quantity,
        threshold: Number(setting.maxQuantity),
        source: "StockBalance.quantity",
      });
    }

    const lastMovement = await prisma.stockMovement.findFirst({
      where: {
        companyId,
        itemId: setting.itemId,
        OR: [{ fromWarehouseId: setting.warehouseId }, { toWarehouseId: setting.warehouseId }],
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    const stoppedLimit = new Date(now.getTime() - Number(setting.stoppedAfterDays) * 24 * 60 * 60 * 1000);
    if (quantity > 0 && (!lastMovement || lastMovement.createdAt < stoppedLimit)) {
      alerts.push({
        type: "STOPPED_ITEM",
        item: setting.item,
        warehouse: setting.warehouse,
        quantity,
        threshold: Number(setting.stoppedAfterDays),
        lastMovementAt: lastMovement?.createdAt ?? null,
        source: "StockMovement.createdAt",
      });
    }
  }

  const limit = parsePageLimit(rawLimit);
  const cursor = decodePageCursor(opaqueCursor, "string");
  const records = alerts
    .map((alert) => ({
      ...alert,
      id: `${alert.type}:${alert.item.id}:${alert.warehouse.id}`,
      sortKey: `${alert.type}:${alert.item.id}:${alert.warehouse.id}`,
    }))
    .sort((left, right) => left.sortKey.localeCompare(right.sortKey));
  const afterCursor = cursor
    ? records.filter((record) => record.sortKey > cursor.sortValue)
    : records;

  return buildCursorPage(afterCursor.slice(0, limit + 1), {
    limit,
    sortField: "sortKey",
    sortType: "string",
    serialize: ({ sortKey, ...alert }) => alert,
  });
}
```

5. Explicação do código.

O alerta traz `source`, permitindo explicar a origem. O service não altera movimentos.

6. Validação do passo.

Criar saldo abaixo do mínimo.

7. Cenário negativo/erro esperado.

Sem configuração devolve lista vazia.

### Passo 4 - Expor rotas

1. Objetivo funcional do passo no ERP.

Consultar alertas e gerir configurações.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/stockAlertRoutes.js`.
    - EDITAR: `apps/api/src/server.js`.
    - REVER: `apps/api/src/modules/permissions/permissionMiddleware.js`.
    - LOCALIZAÇÃO: `/api/inventory/stock-alerts` e `/api/inventory/stock-alerts/settings` em `apps/api/src/server.js`.

3. Instruções do que fazer.

GET para consulta; PUT para configuração.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/inventory/stockAlertRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { listStockAlerts, saveStockAlertSetting } from "./stockAlertService.js";

export function createStockAlertRouter(prisma) {
  const router = Router();
  const readGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "OPERACIONAL")];
  const writeGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR")];
  const sendError = (res, error) => {
    const response = toHttpError(error);
    return res.status(response.status).json(response.body);
  };

  router.get("/", readGuards, async (req, res) => {
    try {
      const page = await listStockAlerts(prisma, {
        companyId: req.companyId,
        cursor: req.query.cursor,
        limit: req.query.limit,
      });
      return res.json(page);
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.put("/settings", writeGuards, async (req, res) => {
    try {
      const setting = await saveStockAlertSetting(prisma, {
        companyId: req.companyId,
        input: req.body,
      });

      return res.json({ setting });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

// apps/api/src/server.js
import { createStockAlertRouter } from "./modules/inventory/stockAlertRoutes.js";

app.use("/api/inventory/stock-alerts", createStockAlertRouter(prisma));
```

5. Explicação do código.

Consulta pode ser operacional; configuração deve ser gestor/admin.

6. Validação do passo.

Testar role operacional em PUT.

7. Cenário negativo/erro esperado.

Operacional em configuração devolve `403`.

### Passo 5 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Chamar alertas com sessão.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/stockAlertsApi.ts`.
    - REVER: `apps/web/src/lib/apiClient.ts`.
    - LOCALIZAÇÃO: `apps/web/src/lib/stockAlertsApi.ts`.

3. Instruções do que fazer.

Implementar `fetchStockAlerts` e `saveStockAlertSetting`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/stockAlertsApi.ts
export type StockAlert = {
  type: "LOW_STOCK" | "HIGH_STOCK" | "STOPPED_ITEM";
  item: { id: string; name: string; sku: string | null };
  warehouse: { id: string; name: string };
  quantity: number;
  threshold: number;
  source: string;
  lastMovementAt?: string | null;
};

export type StockAlertSettingInput = {
  itemId: string;
  warehouseId: string;
  minQuantity: number | null;
  maxQuantity: number | null;
  stoppedAfterDays: number;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(body.message ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

export async function fetchStockAlerts(cursor?: string) {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const response = await fetch(`/api/inventory/stock-alerts${query}`, {
    credentials: "include",
  });

  return readJson<{
    items: StockAlert[];
    pageInfo: { nextCursor: string | null; hasNextPage: boolean };
  }>(response);
}

export async function saveStockAlertSetting(data: StockAlertSettingInput) {
  const response = await fetch("/api/inventory/stock-alerts/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return readJson<{ setting: { id: string } }>(response);
}
```

5. Explicação do código.

O cliente apenas lê e configura regras; não cria movimentos.

6. Validação do passo.

Smoke de lista e configuração.

7. Cenário negativo/erro esperado.

Erro de limites deve aparecer.

### Passo 6 - Criar página

1. Objetivo funcional do passo no ERP.

Mostrar alertas explicáveis.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/StockAlertsPage.tsx`.
    - EDITAR: `apps/web/src/App.tsx`.
    - LOCALIZAÇÃO: `apps/web/src/pages/StockAlertsPage.tsx`.

3. Instruções do que fazer.

Mostrar tipo, saldo, limite e fonte.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/StockAlertsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { fetchStockAlerts, saveStockAlertSetting } from "../lib/stockAlertsApi";
import type { StockAlert } from "../lib/stockAlertsApi";

export function StockAlertsPage() {
  const [items, setItems] = useState<StockAlert[]>([]);
  const [form, setForm] = useState({
    itemId: "",
    warehouseId: "",
    minQuantity: "",
    maxQuantity: "",
    stoppedAfterDays: "90",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchStockAlerts();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar alertas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await saveStockAlertSetting({
        itemId: form.itemId,
        warehouseId: form.warehouseId,
        minQuantity: form.minQuantity ? Number(form.minQuantity) : null,
        maxQuantity: form.maxQuantity ? Number(form.maxQuantity) : null,
        stoppedAfterDays: Number(form.stoppedAfterDays),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível guardar a configuração.");
    }
  }

  return (
    <section>
      <h1>Alertas de stock</h1>

      <form onSubmit={onSubmit}>
        <input placeholder="Artigo" value={form.itemId} onChange={(event) => setForm({ ...form, itemId: event.target.value })} />
        <input placeholder="Armazém" value={form.warehouseId} onChange={(event) => setForm({ ...form, warehouseId: event.target.value })} />
        <input placeholder="Mínimo" value={form.minQuantity} onChange={(event) => setForm({ ...form, minQuantity: event.target.value })} />
        <input placeholder="Máximo" value={form.maxQuantity} onChange={(event) => setForm({ ...form, maxQuantity: event.target.value })} />
        <input value={form.stoppedAfterDays} onChange={(event) => setForm({ ...form, stoppedAfterDays: event.target.value })} />
        <button type="submit">Guardar configuração</button>
      </form>

      {error ? <p role="alert">{error}</p> : null}
      {loading ? <p>A carregar...</p> : null}
      {!loading && items.length === 0 ? <p>Sem alertas ativos.</p> : null}

      {!loading && items.length > 0 ? (
        <ul>
          {items.map((item, index) => (
            <li key={`${item.type}-${item.item.id}-${item.warehouse.id}-${index}`}>
              <strong>{item.type}</strong> - {item.item.name} em {item.warehouse.name}: {item.quantity}
              {" / "}limite {item.threshold} ({item.source})
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
```

5. Explicação do código.

A UI deve deixar claro por que existe o alerta.

6. Validação do passo.

Testar lista e estado vazio.

7. Cenário negativo/erro esperado.

Sem alertas mostra estado vazio.

### Passo 7 - Validar smoke, negativos e segurança

1. Objetivo funcional do passo no ERP.

Provar que BK-MF2-05 funciona no caso principal e falha de forma controlada nos casos negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/stockAlertService.test.js`.
    - CRIAR: `apps/api/src/modules/inventory/stockAlertRoutes.test.js`.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-05-alertas-de-stock-minimos-maximos-artigos-parados.md` e ficheiros criados nos passos anteriores.
    - LOCALIZAÇÃO: `apps/api/src/modules/inventory/` e smoke manual em `apps/web/src/pages/StockAlertsPage.tsx`.

3. Instruções do que fazer.

Criar teste do fluxo principal, negativos indicados neste guia e smoke manual com sessão real.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:unit -- stockAlert
npm run test:integration -- stockAlert
```

5. Explicação do código.

Os testes provam comportamento, não apenas execução. O aluno consegue defender o que foi verificado e que risco foi bloqueado.

6. Validação do passo.

Confirmar HTTP status, mensagem controlada, ausência de escrita parcial e ausência de dados de outra empresa.

7. Cenário negativo/erro esperado.

Se o smoke passa mas um negativo falha, corrigir service ou rota antes de pedir revisão.

### Passo 8 - Preparar evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar BK-MF2-05 com provas objetivas e deixar o próximo BK pronto para reutilizar os contratos criados.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF2/BK-MF2-05.md`.
    - EDITAR: nenhum ficheiro de aplicação neste passo.
    - REVER: outputs de testes, screenshots e resumo do PR.
    - LOCALIZAÇÃO: `docs/evidence/MF2/BK-MF2-05.md`.

3. Instruções do que fazer.

Registar ficheiros alterados, endpoints criados, comandos executados, resultados dos negativos e riscos que ficam para o próximo BK.

4. Código completo, correto e integrado com a app final.

```md
# BK-MF2-05

- Requisito validado: RF27
- Endpoints: GET /api/inventory/stock-alerts, PUT /api/inventory/stock-alerts/settings
- Negativos: mínimo maior que máximo, artigo inexistente, armazém de outra empresa, role sem permissão no PUT
- Resultado: preencher com comandos, resposta HTTP e imagem da lista
```

5. Explicação do código.

A evidence liga requisito, código e validação. Sem esta prova, o BK continua fraco para revisão e defesa PAP.

6. Validação do passo.

Confirmar handoff para `BK-MF2-06` com exports, endpoints, modelos e limitações.

7. Cenário negativo/erro esperado.

Se existir bloqueio real, marcar no relatório e evidence com erro observado e impacto.

## Expected results

- Alertas incluem tipo, saldo, limite e origem.
- Configuração é por empresa/artigo/armazém.
- Nenhum alerta altera stock.

## Critérios de aceite

- Todos os passos seguem a estrutura obrigatória 1 a 7.
- Backend aplica autenticação, autorização e contexto multiempresa.
- Frontend usa `credentials: "include"` e não guarda tokens em `localStorage`.
- Erros são controlados e em português de Portugal.
- Evidence inclui smoke, negativos e ficheiros alterados.

## Validação final

- Stock abaixo do mínimo.
- Stock acima do máximo.
- Artigo parado.

## Evidence para PR/defesa

- Output dos três tipos.
- Negativo de limite inválido.
- Screenshot de alertas.

## Handoff

MF4-04 pode consumir estes alertas como fonte explicável.

- Próximo BK recomendado: `BK-MF2-06`.

## Changelog

- `2026-07-10`: handoff imediato sincronizado com o próximo BK canónico, preservando o consumidor futuro MF4.
- `2026-06-07`: guia reescrito como tutorial técnico linear, autocontido e alinhado com RF/RNF, MF0, MF1 e contrato de stack.
