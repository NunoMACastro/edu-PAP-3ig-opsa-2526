# BK-MF4-01 - Gerar insights automáticos (tendências, riscos, clientes, artigos parados).

## Header
- `doc_id`: `GUIA-BK-MF4-01`
- `bk_id`: `BK-MF4-01`
- `macro`: `MF4`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF3-07`
- `rf_rnf`: `RF39`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-02`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-01-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais implementar a primeira camada de IA assistiva da OPSA: geração de insights automáticos sobre tendências, riscos, clientes relevantes e artigos parados, sempre com fontes rastreáveis.

#### Importância

RF39 transforma os relatórios da MF3 em apoio à decisão. Este BK é também a base de BK-MF4-02 e BK-MF4-05: primeiro surgem insights calculados a partir de dados reais; depois surgem sugestões e explicações.

#### Scope-in

- Criar modelo `AiInsight` com empresa, tipo, severidade, resumo, explicação, fonte e estado.
- Criar endpoint `GET /api/ai/insights` para gerar/listar insights por período.
- Usar dados de `OperationalReportRun`, `SaleDocument`, `PurchaseDocument`, `StockBalance` e `StockAlertSetting`.
- Filtrar todos os dados por `req.companyId` e limitar acesso a `ADMIN`, `GESTOR` e `CONTABILISTA`.
- Criar cliente/página simples para consultar insights no frontend.

#### Scope-out

- Não usar modelos externos de IA.
- Não executar alterações contabilísticas ou operacionais.
- Não criar ações automáticas; isso fica para BK-MF4-02.
- Não substituir relatórios oficiais, SAF-T ou demonstrações financeiras.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF39.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF39 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `BK-MF3-07`.
- Rever `apps/api/src/modules/auth`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions`.

#### Glossário

- **Insight:** observação calculada a partir de dados reais da empresa, com explicação e fonte.
- **Fonte:** modelo, relatório ou entidade que originou o insight.
- **Severidade:** nível de atenção do insight: baixa, média ou alta.
- **IA assistiva:** camada que recomenda e explica, mas não executa decisões.

#### Conceitos teóricos essenciais

- Um insight OPSA é uma leitura sobre dados existentes, não uma transação nova.
- A fonte é obrigatória para evitar respostas opacas e para preparar RF43.
- A empresa ativa vem da sessão, por isso o frontend nunca envia `companyId` para decidir ownership.
- O backend valida período, role e permissões antes de consultar dados empresariais.
- A IA deste BK é determinística: regras transparentes sobre dados reais, sem prometer RAG, OCR ou integrações externas.

#### Arquitetura do BK

- Endpoint: `GET /api/ai/insights?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- Modelo novo: `AiInsight`.
- Service: `generateAiInsights`.
- Guards: `requireAuth`, `requireCompanyContext`, `requirePermission(Permission.REPORTS_READ)`, `requireRole("ADMIN", "GESTOR", "CONTABILISTA")`.
- Frontend: função `getAiInsights` e página `AiInsightsPage`.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`
- CRIAR: `apps/api/src/modules/ai/aiInsightFilters.js`
- CRIAR: `apps/api/src/modules/ai/aiInsightService.js`
- CRIAR: `apps/api/src/modules/ai/aiInsightRoutes.js`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/lib/mf4Api.ts`
- CRIAR: `apps/web/src/pages/AiInsightsPage.tsx`
- REVER: BK-MF3-07 e BK-MF4-02.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e fontes

1. Objetivo funcional do passo no contexto da app.

Definir a fronteira do insight antes de escrever código.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/guias-bk/MF3/BK-MF3-07-relatorios-de-vendas-compras-margens-e-stock.md`

3. Instruções do que fazer.

Regista que RF39 depende de RF37 e que os insights usam apenas dados já existentes. Marca como `CANONICO` a dependência de BK-MF3-07 e como `DERIVADO` o uso de regras determinísticas para o MVP.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A validação é documental: evidence deve mostrar RF39, BK-MF3-07 e a lista de fontes escolhida.

6. Validação do passo.

Não aceitar um insight sem fonte documentada.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Modelar `AiInsight`

1. Objetivo funcional do passo no contexto da app.

Persistir insights para consulta, defesa e handoff.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`
    - LOCALIZAÇÃO: bloco de modelos de IA, após `ExecutiveKpiRun`.

3. Instruções do que fazer.

Adiciona o modelo abaixo e os campos inversos indicados em `Company` e `User`. A chave única torna a geração idempotente: repetir o pedido para a mesma fonte não duplica o mesmo insight.

4. Código completo, correto e integrado com a app final.

```prisma
// campos a acrescentar em modelos existentes
model Company {
  aiInsights AiInsight[]
}

model User {
  aiInsights AiInsight[] @relation("UserAiInsights")
}

/// Insight automático gerado por regras transparentes sobre dados reais da empresa.
/// A IA da MF4 recomenda e explica; não executa alterações contabilísticas.
model AiInsight {
  id              String   @id @default(uuid())
  companyId       String
  type            String
  severity        String
  title           String
  summary         String
  explanation     String
  sourceType      String
  sourceId        String
  sourceLabel     String
  suggestedAction String?
  status          String   @default("OPEN")
  generatedById   String
  generatedAt     DateTime @default(now())

  company     Company @relation(fields: [companyId], references: [id])
  generatedBy User    @relation("UserAiInsights", fields: [generatedById], references: [id])

  @@index([companyId, type, severity])
  @@index([companyId, generatedAt])
  @@unique([companyId, type, sourceType, sourceId])
}
```

5. Explicação do código.

O modelo guarda cada insight com tipo, severidade e fonte. `companyId` é persistido no backend a partir da sessão ativa, nunca recebido do frontend para escolher a empresa. A relação inversa em `Company` e `User` deixa o schema Prisma validável sem o aluno ter de adivinhar nomes.

6. Validação do passo.

Executa `npm run prisma:validate` em `apps/api` depois de editar o schema.

7. Cenário negativo/erro esperado.

Se faltares a relação em `Company` ou `User`, o Prisma deve falhar a validação.

### Passo 3 - Validar período da consulta

1. Objetivo funcional do passo no contexto da app.

Impedir consultas sem datas ou com intervalo excessivo.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/aiInsightFilters.js`
    - REVER: `apps/api/src/lib/httpErrors.js`

3. Instruções do que fazer.

Cria um validator próprio para RF39.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiInsightFilters.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte um valor da query string numa data válida.
 *
 * @param {unknown} value Valor recebido de req.query.
 * @param {string} field Nome do campo usado na mensagem de erro.
 * @returns {Date} Data validada para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando a data é inválida.
 */
function parseDate(value, field) {
    const date = new Date(value);
    if (typeof value !== "string" || Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_INSIGHT_RANGE", field + " deve ser uma data válida");
    }
    return date;
}

/**
 * Valida o período usado para gerar insights.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Intervalo seguro para consulta.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo é inválido.
 */
export function validateInsightQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) {
        throw httpError(400, "INVALID_INSIGHT_RANGE", "Data inicial posterior à data final");
    }
    return { fromDate, toDate };
}
```

5. Explicação do código.

O validator transforma texto HTTP em datas controladas. Isto evita passar query strings diretamente para o Prisma.

6. Validação do passo.

Testa `from=2026-06-30&to=2026-06-01` e espera `400 INVALID_INSIGHT_RANGE`.

7. Cenário negativo/erro esperado.

Data inválida deve falhar antes do service consultar dados.

### Passo 4 - Gerar insights no service

1. Objetivo funcional do passo no contexto da app.

Calcular insights com regras explicáveis.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/aiInsightService.js`
    - REVER: `OperationalReportRun`, `StockBalance`, `StockAlertSetting`.

3. Instruções do que fazer.

Implementa regras simples: margem negativa e artigos parados/abaixo do mínimo.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiInsightService.js
/**
 * Cria um título curto para o insight.
 *
 * @param {string} type Tipo funcional do insight.
 * @returns {string} Título em PT-PT.
 */
function insightTitle(type) {
    const titles = {
        NEGATIVE_MARGIN: "Margem operacional negativa",
        LOW_STOCK: "Artigo abaixo do stock mínimo",
        STOPPED_ITEM: "Artigo sem movimento recente",
    };
    return titles[type] ?? "Insight operacional";
}

/**
 * Gera insights determinísticos com fontes reais da OPSA.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto autenticado.
 * @returns {Promise<object[]>} Insights criados para a empresa ativa.
 */
export async function generateAiInsights(prisma, input) {
    // Lemos as três fontes em paralelo porque são consultas independentes.
    // Isto ensina uma regra prática: quando os dados não dependem uns dos outros,
    // `Promise.all` reduz tempo de espera sem misturar responsabilidades.
    const [lastReport, stockBalances, alertSettings] = await Promise.all([
        prisma.operationalReportRun.findFirst({
            where: { companyId: input.companyId, fromDate: { gte: input.fromDate }, toDate: { lte: input.toDate } },
            orderBy: { generatedAt: "desc" },
        }),
        prisma.stockBalance.findMany({
            where: { companyId: input.companyId },
            include: { item: true, warehouse: true },
        }),
        prisma.stockAlertSetting.findMany({ where: { companyId: input.companyId } }),
    ]);

    // A chave composta item:armazem permite encontrar rapidamente a regra de alerta
    // que corresponde a cada saldo de stock, sem fazer nova query dentro do ciclo.
    const settingsByKey = new Map(alertSettings.map((setting) => [setting.itemId + ":" + setting.warehouseId, setting]));
    const candidates = [];

    // Cada candidato guarda a origem concreta do dado. Isto é obrigatório em IA explicável:
    // o aluno deve conseguir dizer "este insight veio deste relatório".
    if (lastReport && lastReport.marginCents < 0) {
        candidates.push({
            type: "NEGATIVE_MARGIN",
            severity: "HIGH",
            summary: "A margem operacional do período está negativa.",
            explanation: "O cálculo vem de OperationalReportRun.marginCents e indica que compras superaram vendas no relatório operacional.",
            sourceType: "OperationalReportRun",
            sourceId: lastReport.id,
            sourceLabel: "Relatório operacional " + lastReport.id,
            suggestedAction: "Rever preços, compras e artigos com menor rotação antes de decidir alterações.",
        });
    }

    for (const balance of stockBalances) {
        const setting = settingsByKey.get(balance.itemId + ":" + balance.warehouseId);
        const quantity = Number(balance.quantity);
        if (setting?.minQuantity && quantity < Number(setting.minQuantity)) {
            // A regra não decide repor stock automaticamente; só cria um sinal explicável.
            // A ação final continua a pertencer a uma pessoa com contexto de negócio.
            candidates.push({
                type: "LOW_STOCK", severity: "MEDIUM",
                summary: balance.item.name + " está abaixo do stock mínimo.",
                explanation: "O cálculo compara StockBalance.quantity com StockAlertSetting.minQuantity.",
                sourceType: "StockBalance", sourceId: balance.id,
                sourceLabel: balance.item.sku + " em " + balance.warehouse.name,
                suggestedAction: "Avaliar reposição de stock com base em vendas recentes.",
            });
        }
    }

    const insights = [];
    for (const candidate of candidates) {
        insights.push(
            // O upsert torna a geração idempotente: repetir o pedido atualiza o mesmo insight
            // em vez de criar várias cópias iguais para a mesma empresa/fonte.
            await prisma.aiInsight.upsert({
                where: {
                    companyId_type_sourceType_sourceId: {
                        companyId: input.companyId,
                        type: candidate.type,
                        sourceType: candidate.sourceType,
                        sourceId: candidate.sourceId,
                    },
                },
                update: {
                    severity: candidate.severity,
                    summary: candidate.summary,
                    explanation: candidate.explanation,
                    sourceLabel: candidate.sourceLabel,
                    suggestedAction: candidate.suggestedAction,
                    status: "OPEN",
                    generatedById: input.userId,
                    generatedAt: new Date(),
                },
                create: {
                    ...candidate,
                    title: insightTitle(candidate.type),
                    companyId: input.companyId,
                    generatedById: input.userId,
                },
            }),
        );
    }
    return insights;
}
```

5. Explicação do código.

Este service é o primeiro ponto em que a MF4 transforma dados operacionais em “inteligência” dentro da aplicação. Repara que ele não começa por chamar uma API externa: começa por ler fontes já produzidas pela própria OPSA (`OperationalReportRun`, `StockBalance` e `StockAlertSetting`). Isto é importante para alunos perceberem que uma recomendação só é confiável quando nasce de dados identificáveis.

O `companyId` vem do contexto autenticado recebido pelo backend e aparece em todas as queries. Esta repetição não é ruído: é uma barreira de segurança para impedir que um insight de uma empresa seja calculado com dados de outra. O `sourceType`, o `sourceId` e o `sourceLabel` também não são acessórios; são o rasto que permite explicar ao utilizador de onde veio o insight.

O `upsert` evita um erro muito comum em dashboards: cada refresh criar uma nova linha com o mesmo aviso. A chave única por empresa, tipo e fonte faz com que o mesmo facto de negócio seja atualizado, não duplicado. A `suggestedAction` fica escrita como recomendação textual porque a IA do OPSA não altera preços, não mexe em stock e não lança movimentos contabilísticos.

6. Validação do passo.

Com dados de margem negativa, o resultado deve incluir `NEGATIVE_MARGIN` com `sourceType: "OperationalReportRun"`.

7. Cenário negativo/erro esperado.

Se não existirem fontes, o service deve devolver lista vazia em vez de inventar insights.

### Passo 5 - Expor rota protegida

1. Objetivo funcional do passo no contexto da app.

Disponibilizar os insights à UI com autenticação e autorização.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/aiInsightRoutes.js`
    - EDITAR: `apps/api/src/server.js`

3. Instruções do que fazer.

Monta a rota em `/api/ai/insights` e liga o router ao servidor Express.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiInsightRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { validateInsightQuery } from "./aiInsightFilters.js";
import { generateAiInsights } from "./aiInsightService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // A API devolve sempre o mesmo formato de erro para a UI conseguir mostrar
    // mensagens claras sem conhecer detalhes internos do Express ou do Prisma.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/**
 * Constrói router de insights automáticos.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildAiInsightRoutes({ prisma }) {
    const router = Router();
    const guards = [
        // A ordem dos guards é pedagógica e funcional:
        // primeiro confirma sessão, depois empresa ativa, depois permissão e role.
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REPORTS_READ),
        requireRole("ADMIN", "GESTOR", "CONTABILISTA"),
    ];

    router.get("/insights", guards, async (req, res) => {
        try {
            const range = validateInsightQuery(req.query);
            // O frontend só envia datas; empresa e utilizador vêm da sessão.
            // Isto protege ownership e mantém a UI fora das decisões de autorização.
            const insights = await generateAiInsights(prisma, { companyId: req.companyId, userId: req.user.id, ...range });
            return res.status(200).json({ insights });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

```js
// apps/api/src/server.js
import { buildAiInsightRoutes } from "./modules/ai/aiInsightRoutes.js";

app.use("/api/ai", buildAiInsightRoutes({ prisma }));
```

5. Explicação do código.

A rota é a fronteira HTTP do BK. Antes de chamar o service, passa por quatro guardas: sessão, empresa ativa, permissão de leitura de relatórios e role autorizada. Isto ensina uma regra central do OPSA: esconder botões no frontend não chega; a proteção real tem de estar no backend.

O `validateInsightQuery(req.query)` transforma a query string em datas validadas antes de tocar em dados financeiros. Só depois disso a rota chama `generateAiInsights` com `req.companyId` e `req.user.id`. Estes dois valores são confiáveis porque foram resolvidos pela autenticação e pelo contexto multiempresa, não escritos manualmente pelo utilizador no browser.

A montagem em `server.js` é tão importante como o ficheiro da rota. Sem `app.use("/api/ai", buildAiInsightRoutes({ prisma }))`, o aluno teria código correto mas endpoint inacessível. Por isso este BK mostra também onde ligar o router ao servidor Express.

6. Validação do passo.

Pedido autenticado como `GESTOR` deve devolver `200` com `{ insights: [...] }`.

7. Cenário negativo/erro esperado.

Utilizador sem empresa ativa deve receber erro controlado do middleware de contexto.

### Passo 6 - Ligar frontend mínimo

1. Objetivo funcional do passo no contexto da app.

Permitir consulta visual dos insights.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/mf4Api.ts`
    - CRIAR: `apps/web/src/pages/AiInsightsPage.tsx`

3. Instruções do que fazer.

Cria cliente tipado e página com estados de loading, erro e sucesso.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/lib/mf4Api.ts
import { createApiClient } from "./apiClient";

const client = createApiClient();

export interface AiInsight {
  id: string;
  type: string;
  severity: string;
  title: string;
  summary: string;
  explanation: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  suggestedAction: string | null;
  status: string;
}

/** Consulta insights automáticos da empresa ativa. */
export function getAiInsights(from: string, to: string) {
  // A query string leva apenas filtros de período.
  // A empresa ativa continua protegida no cookie de sessão e no backend.
  const query = "?from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to);
  return client.request<{ insights: AiInsight[] }>("GET", "/ai/insights" + query);
}

// apps/web/src/pages/AiInsightsPage.tsx
import { FormEvent, useState } from "react";
import { AiInsight, getAiInsights } from "../lib/mf4Api";

/** Página de consulta de insights automáticos RF39. */
export function AiInsightsPage() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const from = String(form.get("from") ?? "");
      const to = String(form.get("to") ?? "");
      // A UI não calcula insights: pede ao backend para aplicar as regras
      // com autenticação, permissões e dados reais da empresa ativa.
      const result = await getAiInsights(from, to);
      setInsights(result.insights);
    } catch (caught) {
      // A mensagem vem do ApiError criado no apiClient, por isso fica alinhada
      // com os erros controlados do backend.
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>Insights automáticos</h2>
      <form onSubmit={submit}>
        <input name="from" type="date" required />
        <input name="to" type="date" required />
        <button disabled={busy}>{busy ? "A gerar..." : "Gerar"}</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {insights.length === 0 ? <p>Sem insights para o período.</p> : null}
      <ul>
        {insights.map((insight) => (
          <li key={insight.id}>
            <strong>{insight.title}</strong>
            <p>{insight.summary}</p>
            <small>{insight.sourceType}: {insight.sourceLabel}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicação do código.

O cliente `mf4Api.ts` cria um contrato tipado entre frontend e backend. A interface `AiInsight` diz ao TypeScript que campos a página pode usar, evitando `unknown`, JSON bruto e erros silenciosos de grafia. Quando a API muda, o erro aparece durante desenvolvimento em vez de aparecer durante a defesa.

A função `getAiInsights` só recebe datas. Ela não recebe `companyId`, role ou utilizador, porque esses elementos pertencem à sessão e ao backend. Esta separação é uma regra de segurança que os alunos devem repetir nos BKs seguintes.

Na página React, `busy`, `error` e `insights` representam três estados diferentes do ecrã: carregamento, falha e dados. Isto torna a UI previsível para o utilizador e prepara a MF5, onde a consistência de interface passa a ser avaliada. A lista mostra `sourceType` e `sourceLabel` porque um insight sem fonte não cumpre a promessa pedagógica de IA explicável.

6. Validação do passo.

No browser, a resposta deve mostrar insights com `sourceType` e `explanation`.

7. Cenário negativo/erro esperado.

Sem sessão, a página deve mostrar a mensagem devolvida pela API.

### Passo 7 - Validar smoke e negativos

1. Objetivo funcional do passo no contexto da app.

Fechar a prova técnica do BK.

2. Ficheiros envolvidos:
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`

3. Instruções do que fazer.

Executa validação de schema, syntax check e um pedido manual ao endpoint. Guarda evidence com pedido, resposta e cenário negativo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Resultados esperados: `200` com lista de insights; `400` para datas inválidas; `403` para role sem acesso.

6. Validação do passo.

Não aceitar evidence sem resposta JSON real.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 8 - Preparar handoff para sugestões

1. Objetivo funcional do passo no contexto da app.

Garantir que BK-MF4-02 consegue usar os insights.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF4/BK-MF4-02-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock.md`

3. Instruções do que fazer.

Confirma que cada insight tem `suggestedAction` e fonte. BK-MF4-02 deve consumir estes campos sem recalcular tudo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O handoff deve listar `AiInsight.type`, `severity`, `sourceType`, `sourceId` e `suggestedAction`.

6. Validação do passo.

Se `suggestedAction` estiver vazio em todos os insights, BK-MF4-02 fica sem contrato útil.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

#### Critérios de aceite

- O guia preserva header, owner, prioridade, dependências, RF e próximo BK canónicos.
- O backend filtra sempre por empresa ativa resolvida na sessão.
- Roles e permissões são aplicadas no backend antes de ler ou alterar dados.
- O frontend usa o cliente HTTP existente com cookies HttpOnly e não guarda credenciais no browser.
- Cada resposta relevante inclui fonte, explicação ou erro controlado.
- Os cenários negativos definidos nos passos foram executados e registados em evidence.

#### Validação final

- Executar `npm run prisma:validate` em `apps/api` depois de editar o schema.
- Executar `npm run syntax:check` em `apps/api` depois de criar routes/services.
- Executar `npm run typecheck` em `apps/web` depois de criar páginas TypeScript.
- Executar smoke HTTP autenticado para o endpoint principal deste BK.
- Executar negativos de sessão ausente, role sem acesso e dados de outra empresa.

#### Evidence para PR/defesa

- `pr`: link ou referência do commit/PR com o BK.
- `proof`: request/response ou screenshot do fluxo principal.
- `neg`: pelo menos três cenários negativos com código HTTP, mensagem e comportamento observado.
- `fonte`: prova de que o resultado usa dados reais da empresa ativa.

#### Handoff

- Entrega para `BK-MF4-02`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF39 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `apps/api/src/modules/*` e `apps/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: explicações do código e comentários didáticos reforçados para clarificar fontes, contexto multiempresa, idempotência e fronteira backend/frontend.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
