# BK-MF6-04 - Cálculo de custo (FIFO) deve manter correção e não bloquear operações críticas.

## Header

- `doc_id`: `GUIA-BK-MF6-04`
- `bk_id`: `BK-MF6-04`
- `macro`: `MF6`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF11`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-05`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais reforçar o cálculo FIFO para cumprir o `RNF11`: manter correção e evitar bloquear operações críticas de inventário.

O aluno vai separar cálculo consultivo de gravação crítica, medir duração, proteger casos sem stock suficiente e preparar evidence de que FIFO continua correto.

#### Importância

FIFO afeta custo de stock e margens. Um cálculo errado distorce relatórios; um cálculo lento pode bloquear entradas, saídas ou devoluções. O equilíbrio certo é preservar correção e controlar tempo de execução.

Este BK usa contratos da MF2 e prepara a fase seguinte de segurança operacional.

#### Scope-in

- Criar orçamento de cálculo FIFO.
- Validar stock suficiente antes de calcular.
- Medir duração do cálculo.
- Distinguir cálculo consultivo de movimento definitivo.
- Criar smoke textual.
- Registar negativos de stock insuficiente e período fiscal fechado quando houver impacto contabilístico.

#### Scope-out

- Alterar método FIFO para média ponderada.
- Criar novo módulo de inventário.
- Alterar regras de movimentos de stock.
- Lançar contabilidade automaticamente sem contrato anterior.
- Criar fila externa obrigatória.

#### Estado antes e depois

- Antes: `BK-MF2-03` define FIFO funcional.
- Depois: FIFO fica medido, protegido contra bloqueios e com critérios de evidence.

#### Pre-requisitos

- Ler `RNF11`.
- Rever `BK-MF2-02` e `BK-MF2-03`.
- Rever relatórios de stock em `BK-MF3-07`.
- Confirmar `apps/api/src/modules/inventory/fifoCostService.js`.
- Confirmar que movimentos continuam filtrados por empresa ativa.

#### Glossário

- FIFO: método em que as primeiras unidades a entrar são as primeiras a sair.
- Camada de stock: lote de entrada com quantidade e custo.
- Movimento crítico: operação que altera stock ou custo.
- Cálculo consultivo: simulação que não grava alterações.
- Bloqueio: atraso ou espera que impede operação principal.
- Stock insuficiente: ausência de camadas suficientes para a quantidade pedida.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF11` exige correção FIFO sem bloquear operações críticas.
- `CANONICO`: `RF25` já introduz cálculo FIFO na MF2.
- `DERIVADO`: o cálculo pode ser medido e limitado sem mudar o método.
- `DERIVADO`: operações críticas devem validar antes de calcular para falhar de forma rápida.

FIFO depende de ordem temporal e quantidade disponível. Não é aceitável escolher a camada mais barata só para melhorar margem. A regra de negócio vem do método FIFO, não da conveniência do resultado.

#### Arquitetura do BK

- Endpoint(s): rotas existentes de inventário e custo FIFO.
- Modelo/schema Prisma: movimentos e artigos existentes.
- Service(s): `fifoCostService`.
- Controller/route: mantém rotas existentes.
- Guard/middleware: sessão, empresa ativa e permissões de inventário.
- Cliente API: sem alteração obrigatória.
- Testes: smoke textual e negativos.
- Handoff para o próximo BK: segurança HTTPS.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/inventory/fifoPerformance.js`
- EDITAR: `apps/api/src/modules/inventory/fifoCostService.js`
- CRIAR: `apps/api/scripts/check-mf6-fifo-performance.mjs`
- EDITAR: `apps/api/package.json`
- REVER: `apps/api/src/modules/inventory/stockMovementService.js`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato FIFO existente

1. Objetivo funcional do passo no contexto da app.

Reutilizar o FIFO da MF2 sem inventar método novo.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-03-calculo-de-custo-fifo.md`
    - REVER: `apps/api/src/modules/inventory/fifoCostService.js`
    - LOCALIZAÇÃO: função de cálculo FIFO.

3. Instruções do que fazer.

Confirma campos usados para quantidade, custo, data e artigo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É revisão de contrato.

5. Explicação do código.

O risco principal é criar uma segunda interpretação de FIFO. Este BK reforça, não substitui.

6. Validação do passo.

O inventário deve mencionar camadas por ordem de entrada.

7. Cenário negativo/erro esperado.

Se o cálculo ordenar por custo em vez de data, o resultado não é FIFO.

### Passo 2 - Criar orçamento de FIFO

1. Objetivo funcional do passo no contexto da app.

Medir cálculo sem alterar regras de stock.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/inventory/fifoPerformance.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o módulo abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Orçamento de performance para cálculo FIFO.
 */

import { httpError } from "../../lib/httpErrors.js";

export const FIFO_COST_BUDGET_MS = 1000;

/**
 * Mede um cálculo FIFO e mantém o resultado original.
 *
 * @template TResult
 * @param {() => Promise<TResult>} operation - Cálculo FIFO real.
 * @returns {Promise<{ result: TResult, durationMs: number, withinBudget: boolean }>}
 */
export async function measureFifoCost(operation) {
    const startedAt = performance.now();
    const result = await operation();
    const durationMs = Math.round(performance.now() - startedAt);

    // A métrica não escolhe camadas; apenas observa o cálculo canónico.
    return {
        result,
        durationMs,
        withinBudget: durationMs <= FIFO_COST_BUDGET_MS,
    };
}

/**
 * Valida se há stock suficiente antes de executar cálculo pesado.
 *
 * @param {number} requestedQuantity - Quantidade pedida pelo movimento.
 * @param {number} availableQuantity - Quantidade disponível nas camadas FIFO.
 * @returns {void}
 */
export function assertEnoughFifoStock(requestedQuantity, availableQuantity) {
    if (requestedQuantity > availableQuantity) {
        // O erro HTTP mantém o contrato da API e evita gravar um movimento impossível.
        throw httpError(
            409,
            "INSUFFICIENT_FIFO_LAYERS",
            "Não existem camadas FIFO suficientes para este movimento",
        );
    }
}
```

5. Explicação do código.

O módulo mede a duração e valida stock suficiente com erro HTTP controlado. A validação evita gastar tempo com cálculo que nunca poderia ser aceite e mantém o mesmo código de erro usado pelo service FIFO.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/inventory/fifoPerformance.js`.

7. Cenário negativo/erro esperado.

Quantidade pedida maior do que a disponível lança `409 INSUFFICIENT_FIFO_LAYERS`.

### Passo 3 - Integrar no service FIFO

1. Objetivo funcional do passo no contexto da app.

Aplicar validação e medição ao cálculo.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/inventory/fifoCostService.js`
    - LOCALIZAÇÃO: função principal de cálculo.

3. Instruções do que fazer.

Acrescenta o import de performance ao topo de `fifoCostService.js` e substitui a função principal pela versão completa abaixo. Mantém `createCostLayer` como está.

4. Código completo, correto e integrado com a app final.

```js
import { assertEnoughFifoStock, measureFifoCost } from "./fifoPerformance.js";

/**
 * Consome camadas FIFO sem permitir custo insuficiente.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Cliente Prisma/transação.
 * @param {{ companyId: string, itemId: string, warehouseId: string, quantity: number, movementId?: string, write?: boolean }} input - Pedido FIFO.
 * @returns {Promise<{ totalCostCents: number, consumptions: object[], durationMs: number, withinBudget: boolean }>} Consumos.
 */
export async function consumeFifoLayers(tx, input) {
    const requestedQuantity = Math.abs(Number(input.quantity));
    const layers = await tx.stockCostLayer.findMany({
        where: {
            companyId: input.companyId,
            itemId: input.itemId,
            warehouseId: input.warehouseId,
            remainingQuantity: { gt: 0 },
        },
        orderBy: { createdAt: "asc" },
    });
    const availableQuantity = layers.reduce(
        (total, layer) => Number((total + Number(layer.remainingQuantity)).toFixed(3)),
        0,
    );

    // Valida antes de atualizar camadas para evitar escritas parciais em stock insuficiente.
    assertEnoughFifoStock(requestedQuantity, availableQuantity);

    const measured = await measureFifoCost(async () => {
        let remaining = requestedQuantity;
        const consumptions = [];
        let totalCostCents = 0;

        for (const layer of layers) {
            if (remaining <= 0) break;

            const available = Number(layer.remainingQuantity);
            const taken = Math.min(available, remaining);
            const lineCost = Math.round(taken * layer.unitCostCents);
            remaining = Number((remaining - taken).toFixed(3));
            totalCostCents += lineCost;
            consumptions.push({
                layerId: layer.id,
                quantity: taken,
                unitCostCents: layer.unitCostCents,
                totalCostCents: lineCost,
            });

            if (input.write !== false) {
                // Só o movimento definitivo consome camadas; o preview passa write: false.
                await tx.stockCostLayer.update({
                    where: { id: layer.id },
                    data: {
                        remainingQuantity: Number((available - taken).toFixed(3)),
                    },
                });
                await tx.stockCostConsumption.create({
                    data: {
                        companyId: input.companyId,
                        movementId: input.movementId,
                        layerId: layer.id,
                        quantity: taken,
                        unitCostCents: layer.unitCostCents,
                        totalCostCents: lineCost,
                    },
                });
            }
        }

        return { totalCostCents, consumptions };
    });

    return {
        ...measured.result,
        durationMs: measured.durationMs,
        withinBudget: measured.withinBudget,
    };
}

/**
 * Simula custo FIFO sem escrever dados.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, itemId: string, warehouseId: string, quantity: number }} input - Pedido de preview.
 * @returns {Promise<object>} Resultado simulado.
 */
export async function previewFifoCost(prisma, input) {
    if (!input.itemId || !input.warehouseId || !Number.isFinite(Number(input.quantity)) || Number(input.quantity) <= 0) {
        throw httpError(400, "INVALID_FIFO_PREVIEW", "Indica artigo, armazém e quantidade positiva");
    }

    return consumeFifoLayers(prisma, {
        companyId: input.companyId,
        itemId: input.itemId,
        warehouseId: input.warehouseId,
        quantity: Number(input.quantity),
        write: false,
    });
}
```

5. Explicação do código.

O cálculo continua a usar as camadas existentes por ordem de entrada. Primeiro soma a quantidade disponível, falha cedo com `409` quando não há stock suficiente e só depois mede o cálculo. A métrica é adicional e não altera custo unitário, quantidade consumida ou ordem FIFO. O `previewFifoCost` chama o mesmo motor com `write: false`, por isso não grava consumos.

6. Validação do passo.

Um cálculo válido devolve custo, consumos, `durationMs` e `withinBudget`.

7. Cenário negativo/erro esperado.

Sem stock suficiente, não há cálculo nem movimento persistido.

### Passo 4 - Separar cálculo consultivo de gravação

1. Objetivo funcional do passo no contexto da app.

Evitar que uma simulação bloqueie ou altere operações críticas.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/inventory/fifoCostRoutes.js`
    - REVER: `apps/api/src/modules/inventory/stockMovementService.js`
    - LOCALIZAÇÃO: endpoint de consulta e criação de movimento.

3. Instruções do que fazer.

Confirma que o endpoint consultivo não grava camadas consumidas e devolve a métrica gerada pelo service.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Rotas de preview FIFO da MF2 com métrica de performance da MF6.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { previewFifoCost } from "./fifoCostService.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param {import("express").Response} res - Resposta Express usada para enviar o erro ao cliente.
 * @param {Error | { code?: string, message?: string }} error - Erro capturado durante a operação.
 * @returns {import("express").Response} Resposta HTTP de erro enviada no formato JSON contratado.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/**
 * Constrói router de custo FIFO.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildFifoCostRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.INVENTORY_READ),
    ];

    router.get("/fifo-cost/preview", guards, async (req, res) => {
        try {
            // O preview usa a empresa autenticada e nunca consome camadas FIFO.
            const preview = await previewFifoCost(prisma, {
                companyId: req.companyId,
                itemId: String(req.query.itemId ?? ""),
                warehouseId: String(req.query.warehouseId ?? ""),
                quantity: Number(req.query.quantity),
            });

            return res.status(200).json({ preview });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

5. Explicação do código.

Consultar custo provável não é o mesmo que dar baixa de stock. A rota recebe dados de query, mas a empresa vem do contexto autenticado. A separação real fica no `previewFifoCost`, que chama `consumeFifoLayers` com `write: false` e por isso não cria `StockCostConsumption` nem reduz `remainingQuantity`.

6. Validação do passo.

Após consulta, o saldo de stock mantém-se igual e a resposta inclui `preview.durationMs`.

7. Cenário negativo/erro esperado.

Se consulta alterar stock, o BK falha por domínio.

### Passo 5 - Criar smoke textual

1. Objetivo funcional do passo no contexto da app.

Validar que orçamento e proteção foram integrados.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-fifo-performance.mjs`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: script e entrada `test:mf6:fifo`.

3. Instruções do que fazer.

Cria o script abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual do BK-MF6-04.
 */

import { readFileSync } from "node:fs";

const perf = readFileSync("src/modules/inventory/fifoPerformance.js", "utf8");
const service = readFileSync("src/modules/inventory/fifoCostService.js", "utf8");
const routes = readFileSync("src/modules/inventory/fifoCostRoutes.js", "utf8");

if (!perf.includes("FIFO_COST_BUDGET_MS")) {
    throw new Error("Falta orçamento FIFO.");
}

if (!service.includes("measureFifoCost")) {
    throw new Error("O service FIFO não mede duração.");
}

// Stock insuficiente deve falhar antes de qualquer alteração crítica.
if (!service.includes("assertEnoughFifoStock")) {
    throw new Error("Falta validação de stock suficiente.");
}

if (!service.includes("write: false")) {
    throw new Error("O preview FIFO deve ser consultivo e não gravar consumos.");
}

if (!routes.includes("requireCompanyContext(prisma)")) {
    throw new Error("A rota FIFO deve exigir empresa ativa.");
}
```

5. Explicação do código.

O smoke é textual e simples. Ele confirma que o reforço MF6 está ligado ao service correto, que o preview não grava consumos e que a rota mantém empresa ativa.

6. Validação do passo.

Executa `cd apps/api && node scripts/check-mf6-fifo-performance.mjs`.

7. Cenário negativo/erro esperado.

Se a validação for removida, o smoke falha.

### Passo 6 - Recolher evidence

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com prova de correção e não bloqueio.

2. Ficheiros envolvidos:
    - REVER: outputs de testes e resposta HTTP.
    - LOCALIZAÇÃO: PR ou relatório.

3. Instruções do que fazer.

Regista um cálculo válido, um stock insuficiente e uma consulta que não altera stock.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É validação e defesa.

5. Explicação do código.

Evidence deve mostrar custo correto e duração aceitável, mas também provar que a consulta não fez baixa de stock.

6. Validação do passo.

Os três cenários ficam registados.

7. Cenário negativo/erro esperado.

Se a consulta alterar saldo, corrige antes de fechar.

#### Critérios de aceite

- FIFO preserva ordem de camadas.
- O cálculo válido tem duração registada.
- Stock insuficiente falha com erro claro.
- Consulta FIFO não altera saldo.
- Negativos: mínimo `2`: stock insuficiente e consulta sem gravação.

#### Validação final

- `cd apps/api && node --check src/modules/inventory/fifoPerformance.js`
- `cd apps/api && node scripts/check-mf6-fifo-performance.mjs`
- `cd apps/api && npm run test:unit`
- Teste manual de cálculo válido e stock insuficiente.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: cálculo FIFO válido com duração.
- `neg`: stock insuficiente e consulta sem alteração de saldo.
- `fonte`: `RNF11`, `RF25`, `BK-MF2-03`.
- `multiempresa`: camadas filtradas pela empresa ativa.

#### Handoff

- Entrega medição FIFO e validação antes de cálculo pesado.
- O próximo BK inicia a parte de segurança de transporte.
- Próximo BK recomendado: `BK-MF6-05`

#### Changelog

- `2026-06-22`: guia revisto com orçamento FIFO, validação de stock, separação consulta/gravação, smoke e evidence.
