# BK-MF4-04 - Emitir alertas inteligentes (cashflow, desvios, ruturas).

## Header

- `doc_id`: `GUIA-BK-MF4-04`
- `bk_id`: `BK-MF4-04`
- `macro`: `MF4`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-04, BK-MF2-05`
- `rf_rnf`: `RF42`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-05`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-04-emitir-alertas-inteligentes-cashflow-desvios-ruturas.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais criar alertas inteligentes para riscos de tesouraria, desvios operacionais e ruturas de stock, usando fontes já implementadas.

#### Importância

RF42 transforma forecast e alertas de stock em sinais acionáveis. Ensina a separar alerta de ação automática.

#### Scope-in

- Criar modelo `SmartAlert`.
- Gerar alertas a partir de `CashflowForecastRun` e `StockAlertSetting`.
- Criar endpoint `GET /api/ai/alerts`.
- Guardar severidade, fonte e mensagem.
- Preparar notificações do BK-MF4-08.

#### Scope-out

- Não enviar notificações ainda.
- Não alterar forecast, stock ou documentos.
- Não criar thresholds configuráveis avançados; RNF33 fica em MF8.
- Não fazer previsão estatística complexa.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF42.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF42 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `BK-MF3-04, BK-MF2-05`.
- Rever `real_dev/api/src/modules/auth`, `real_dev/api/src/modules/companies/companyContext.js` e `real_dev/api/src/modules/permissions`.

#### Glossário

- **Alerta inteligente:** sinal calculado que chama atenção para risco concreto.
- **Rutura:** risco de stock insuficiente para operação.
- **Cashflow:** fluxo previsto de entradas e saídas de dinheiro.

#### Conceitos teóricos essenciais

- Um alerta é mais urgente que um insight, mas continua a ser leitura sobre dados.
- Fontes obrigatórias protegem contra alertas sem prova.
- A severidade deve ser simples para alunos validarem facilmente.
- O próximo BK usa explicações destes alertas.

#### Arquitetura do BK

- Endpoint: `GET /api/ai/alerts?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- Modelo novo: `SmartAlert`.
- Service: `generateSmartAlerts`.
- Fontes: `CashflowForecastRun`, `StockBalance`, `StockAlertSetting`.
- Roles: `ADMIN`, `GESTOR`.

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/api/prisma/schema.prisma`
- CRIAR: `real_dev/api/src/modules/ai/smartAlertService.js`
- CRIAR: `real_dev/api/src/modules/ai/smartAlertRoutes.js`
- EDITAR: `real_dev/api/src/server.js`
- EDITAR: `real_dev/web/src/lib/mf4Api.ts`
- CRIAR: `real_dev/web/src/pages/SmartAlertsPage.tsx`
- REVER: BK-MF3-04 e BK-MF2-05.

#### Tutorial técnico linear

### Passo 1 - Confirmar fontes de alerta

1. Objetivo funcional do passo no contexto da app.

Separar cashflow, desvios e ruturas.

2. Ficheiros envolvidos:
    - REVER: BK-MF3-04
    - REVER: BK-MF2-05
    - REVER: RF42

3. Instruções do que fazer.

RF42 depende de forecast e alertas de stock. Não cries fonte nova sem contrato.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evidence deve indicar `CashflowForecastRun` e `StockAlertSetting` como fontes.

6. Validação do passo.

Alerta sem fonte deve ser recusado.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Modelar alertas

1. Objetivo funcional do passo no contexto da app.

Persistir alertas gerados.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/api/prisma/schema.prisma`

3. Instruções do que fazer.

Cria `SmartAlert`, acrescenta relações inversas e usa uma chave única por origem para impedir alertas duplicados.

4. Código completo, correto e integrado com a app final.

```prisma
// campos a acrescentar em modelos existentes
model Company {
  smartAlerts SmartAlert[]
}

model User {
  smartAlerts SmartAlert[] @relation("UserSmartAlerts")
}

/// Alerta inteligente derivado de cashflow, desvios ou stock.
model SmartAlert {
  id            String   @id @default(uuid())
  companyId     String
  type          String
  severity      String
  title         String
  message       String
  sourceType    String
  sourceId      String
  status        String   @default("OPEN")
  generatedById String
  generatedAt   DateTime @default(now())

  company     Company @relation(fields: [companyId], references: [id])
  generatedBy User    @relation("UserSmartAlerts", fields: [generatedById], references: [id])

  @@index([companyId, type, severity])
  @@index([companyId, status])
  @@unique([companyId, type, sourceType, sourceId])
}
```

5. Explicação do código.

O modelo prepara notificações do BK-MF4-08 e mantém fonte por alerta. A chave única evita criar o mesmo alerta cada vez que o utilizador consulta a página.

6. Validação do passo.

Prisma valida modelo e relações.

7. Cenário negativo/erro esperado.

Sem severidade, a UI não sabe priorizar.

### Passo 3 - Gerar alertas no service

1. Objetivo funcional do passo no contexto da app.

Criar alertas determinísticos.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/ai/smartAlertService.js`

3. Instruções do que fazer.

Gera alerta de saldo projetado negativo e stock abaixo do mínimo.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/ai/smartAlertService.js
/** Gera alertas inteligentes com fontes reais. */
export async function generateSmartAlerts(prisma, input) {
    // As fontes vêm de módulos anteriores: tesouraria, stock e regras de alerta.
    // Ler tudo em paralelo mantém o endpoint responsivo e não altera nenhum dado.
    const [forecast, balances, settings] = await Promise.all([
        prisma.cashflowForecastRun.findFirst({
            where: { companyId: input.companyId },
            orderBy: { generatedAt: "desc" },
        }),
        prisma.stockBalance.findMany({
            where: { companyId: input.companyId },
            include: { item: true },
        }),
        prisma.stockAlertSetting.findMany({
            where: { companyId: input.companyId },
        }),
    ]);
    const candidates = [];
    if (forecast && forecast.closingBalanceCents < 0) {
        // O alerta aponta risco de cashflow, mas não cria pagamento, financiamento
        // nem lançamento contabilístico. É apenas informação para decisão humana.
        candidates.push({
            type: "CASHFLOW_RISK",
            severity: "HIGH",
            title: "Saldo projetado negativo",
            message: "A previsão de tesouraria termina abaixo de zero.",
            sourceType: "CashflowForecastRun",
            sourceId: forecast.id,
        });
    }
    const settingsByItem = new Map(
        settings.map((item) => [item.itemId + ":" + item.warehouseId, item]),
    );
    for (const balance of balances) {
        const setting = settingsByItem.get(
            balance.itemId + ":" + balance.warehouseId,
        );
        if (
            setting?.minQuantity &&
            Number(balance.quantity) < Number(setting.minQuantity)
        ) {
            // A comparação usa o mínimo configurado no OPSA; não inventa limiares.
            // Isto mantém a regra auditável para alunos e orientador.
            candidates.push({
                type: "STOCK_RUPTURE",
                severity: "MEDIUM",
                title: "Risco de rutura",
                message: balance.item.name + " está abaixo do mínimo definido.",
                sourceType: "StockBalance",
                sourceId: balance.id,
            });
        }
    }
    const alerts = [];
    for (const candidate of candidates) {
        alerts.push(
            // A chave única impede que cada consulta crie novo alerta para a mesma fonte.
            await prisma.smartAlert.upsert({
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
                    title: candidate.title,
                    message: candidate.message,
                    status: "OPEN",
                    generatedById: input.userId,
                    generatedAt: new Date(),
                },
                create: {
                    ...candidate,
                    companyId: input.companyId,
                    generatedById: input.userId,
                },
            }),
        );
    }
    return alerts;
}
```

5. Explicação do código.

Este service junta duas famílias de risco: tesouraria e inventário. A previsão de tesouraria vem de `CashflowForecastRun`; o risco de rutura vem de `StockBalance` comparado com `StockAlertSetting`. Isto mostra aos alunos como a MF4 constrói valor sobre contratos anteriores, em vez de criar dados paralelos.

O alerta de cashflow só nasce quando `closingBalanceCents` é negativo. O alerta de stock só nasce quando a quantidade real fica abaixo do mínimo configurado. Estas regras são simples, mas são transparentes: qualquer pessoa consegue verificar a origem do alerta.

O `upsert` mantém o alerta idempotente. Se o utilizador consultar a página várias vezes, o sistema atualiza o alerta existente em vez de encher a base de dados com duplicados. Mais importante ainda: o service não altera saldo bancário, stock ou contabilidade. Ele cria um sinal de apoio à decisão, respeitando a regra de que IA recomenda e explica, mas não executa.

6. Validação do passo.

Forecast negativo gera `CASHFLOW_RISK`.

7. Cenário negativo/erro esperado.

Sem forecast, não inventa alerta de cashflow.

### Passo 4 - Expor rota de alertas

1. Objetivo funcional do passo no contexto da app.

Permitir consulta protegida.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/ai/smartAlertRoutes.js`
    - EDITAR: `real_dev/api/src/server.js`

3. Instruções do que fazer.

Monta `/api/ai/alerts`.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/ai/smartAlertRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import {
    requirePermission,
    requireRole,
} from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { generateSmartAlerts } from "./smartAlertService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Formato comum de erro para a UI conseguir mostrar uma mensagem em PT-PT.
    return res
        .status(response.status)
        .json({ error: response.code, message: response.message });
}

/** Constrói router de alerts. */
export function buildSmartAlertRoutes({ prisma }) {
    const router = Router();
    const guards = [
        // Alertas inteligentes podem influenciar decisões de gestão,
        // por isso exigem autenticação, empresa ativa, permissão e role.
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REPORTS_READ),
        requireRole("ADMIN", "GESTOR"),
    ];

    router.get("/alerts", guards, async (req, res) => {
        try {
            // A rota não recebe companyId; usa o contexto multiempresa resolvido no backend.
            const alerts = await generateSmartAlerts(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
            });
            return res.status(200).json({ alerts });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

```js
// real_dev/api/src/server.js
import { buildSmartAlertRoutes } from "./modules/ai/smartAlertRoutes.js";

app.use("/api/ai", buildSmartAlertRoutes({ prisma }));
```

5. Explicação do código.

A rota segue o mesmo padrão de segurança dos outros endpoints de IA. O aluno deve reparar que os alertas são dados de apoio à decisão e, por isso, não ficam expostos a qualquer utilizador autenticado. A role `OPERACIONAL`, por exemplo, é bloqueada no backend.

O handler é curto de propósito: validação de sessão e permissões fica nos guards, regra de negócio fica no service e serialização da resposta fica na rota. Esta separação facilita testes e evita que o ficheiro de rotas se transforme num local com cálculos financeiros escondidos.

A montagem em `server.js` fecha o circuito. Sem esse `app.use`, a página poderia chamar `/api/ai/alerts`, mas o Express nunca encontraria o router.

6. Validação do passo.

GET devolve `{ alerts: [...] }`.

7. Cenário negativo/erro esperado.

Role `OPERACIONAL` deve receber `403`.

### Passo 5 - Mostrar alertas no frontend

1. Objetivo funcional do passo no contexto da app.

Dar feedback visual simples.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/lib/mf4Api.ts`
    - CRIAR: `real_dev/web/src/pages/SmartAlertsPage.tsx`

3. Instruções do que fazer.

Adiciona consulta e página ao frontend, reutilizando o `client` já criado em `mf4Api.ts`.

4. Código completo, correto e integrado com a app final.

```tsx
// adicionar em real_dev/web/src/lib/mf4Api.ts
export interface SmartAlert {
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    sourceType: string;
    sourceId: string;
    status: string;
}

/** Consulta alertas inteligentes da empresa ativa. */
export function getSmartAlerts() {
    // O backend decide a empresa ativa. O frontend só pede a lista de alertas
    // que o utilizador autenticado tem autorização para ver.
    return client.request<{ alerts: SmartAlert[] }>("GET", "/ai/alerts");
}

// real_dev/web/src/pages/SmartAlertsPage.tsx
import { useState } from "react";
import { SmartAlert, getSmartAlerts } from "../lib/mf4Api";

/** Página MF4 para Alertas inteligentes. */
export function SmartAlertsPage() {
    const [alerts, setAlerts] = useState<SmartAlert[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            const result = await getSmartAlerts();
            // Guardamos o array tipado para renderizar título, severidade e fonte
            // sem depender de JSON bruto.
            setAlerts(result.alerts);
            setError(null);
        } catch (caught) {
            setError(
                caught instanceof Error ? caught.message : "Erro inesperado",
            );
        }
    }

    return (
        <section className="panel">
            <h2>Alertas inteligentes</h2>
            <button type="button" onClick={load}>
                Consultar
            </button>
            {error ? <p className="error">{error}</p> : null}
            {alerts.length === 0 ? <p>Sem alertas abertos.</p> : null}
            <ul>
                {alerts.map((alert) => (
                    <li key={alert.id}>
                        <strong>{alert.title}</strong>
                        <p>{alert.message}</p>
                        <small>
                            {alert.severity} · {alert.sourceType}
                        </small>
                    </li>
                ))}
            </ul>
        </section>
    );
}
```

5. Explicação do código.

A página foi desenhada como uma vista de decisão rápida: título para perceber o problema, mensagem para contextualizar, severidade para priorizar e fonte para justificar. Isto é muito diferente de mostrar JSON bruto; cada campo tem uma função no fluxo de trabalho do gestor.

O `getSmartAlerts` não aceita parâmetros de empresa ou utilizador. Tal como nos BKs anteriores, a UI confia no cookie de sessão e o backend aplica o contexto multiempresa. Esta regra deve ficar interiorizada pelos alunos: frontend pede, backend decide o acesso.

O estado `alerts.length === 0` também é pedagógico. Uma lista vazia não significa erro; pode significar que não existem riscos no momento ou que ainda não há dados suficientes. A UI deve dizer isso de forma limpa em vez de parecer avariada.

6. Validação do passo.

Smoke deve mostrar alerta de cashflow ou lista vazia honesta.

7. Cenário negativo/erro esperado.

Sem sessão deve mostrar erro.

### Passo 6 - Validar handoff para notificações

1. Objetivo funcional do passo no contexto da app.

Preparar BK-MF4-08.

2. Ficheiros envolvidos:
    - REVER: BK-MF4-08

3. Instruções do que fazer.

Confirma que cada alerta aberto tem `id`, `type`, `severity`, `title`, `message` e `sourceType`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

BK-MF4-08 deve conseguir criar notificação a partir de `SmartAlert`.

6. Validação do passo.

Sem `status`, notificações podem repetir alertas fechados.

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

- Executar `npm run prisma:validate` em `real_dev/api` depois de editar o schema.
- Executar `npm run syntax:check` em `real_dev/api` depois de criar routes/services.
- Executar `npm run typecheck` em `real_dev/web` depois de criar páginas TypeScript.
- Executar smoke HTTP autenticado para o endpoint principal deste BK.
- Executar negativos de sessão ausente, role sem acesso e dados de outra empresa.

#### Evidence para PR/defesa

- `pr`: link ou referência do commit/PR com o BK.
- `proof`: request/response ou screenshot do fluxo principal.
- `neg`: pelo menos dois cenários negativos com código HTTP, mensagem e comportamento observado.
- `fonte`: prova de que o resultado usa dados reais da empresa ativa.

#### Handoff

- Entrega para `BK-MF4-05`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF42 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `real_dev/api/src/modules/*` e `real_dev/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: explicações do código e comentários didáticos reforçados para clarificar fontes, limiares, idempotência, autorização e diferença entre alerta e ação automática.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
