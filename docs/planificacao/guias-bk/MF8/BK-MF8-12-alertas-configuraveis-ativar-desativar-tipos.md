# BK-MF8-12 - Alertas configuráveis (ativar/desativar tipos)

## Header

- `doc_id`: `GUIA-BK-MF8-12`
- `bk_id`: `BK-MF8-12`
- `macro`: `MF8`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF33`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-13`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-12-alertas-configuraveis-ativar-desativar-tipos.md`
- `last_updated`: `2026-07-02`

Fonte de verdade: `docs/RNF.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`, `docs/planificacao/backlogs/MF-VIEWS.md`.

#### Objetivo

Neste BK vais implementar preferências persistentes para tipos de alertas in-app. O utilizador autenticado vai conseguir listar os tipos de alertas disponíveis na empresa ativa e ativar ou desativar apenas os tipos que podem ser configurados.

O requisito canónico é `RNF33 - Alertas configuráveis (ativar/desativar tipos)`. A configuração pertence sempre à combinação de empresa ativa, utilizador autenticado e tipo de alerta. O frontend nunca escolhe a empresa final: essa decisão vem do contexto multiempresa resolvido no backend.

No fim, a API terá dois endpoints protegidos: `GET /api/notifications/preferences` para listar preferências efetivas e `PATCH /api/notifications/preferences/:type` para alterar uma preferência. O tipo `security` continua visível, ativo e obrigatório, para que avisos de segurança e integridade não sejam silenciados.

#### Importância

Alertas configuráveis reduzem ruído operacional sem desligar avisos críticos. Num ERP financeiro, o utilizador pode querer receber alertas de stock, prazos, caixa ou sugestões assistidas por IA, mas não deve conseguir desligar mensagens ligadas a segurança, auditoria ou integridade.

Este BK também reforça uma regra transversal do OPSA: dados por empresa são filtrados no backend através da empresa ativa. O pedido HTTP só envia o tipo de alerta e o booleano `enabled`; não envia `companyId` para decidir ownership.

O handoff para `BK-MF8-13` fica limpo: a categoria `ai` é apenas uma preferência de receção de alertas. Ela não altera a regra de que a IA recomenda, explica e usa fontes, mas não executa ações contabilísticas automaticamente.

#### Scope-in

- Criar o modelo Prisma `AlertPreference`.
- Relacionar `AlertPreference` com `Company` e `User`.
- Criar o service `apps/api/src/modules/notifications/alertPreferenceService.js`.
- Validar o body `{ enabled: boolean }`.
- Centralizar os tipos `stock`, `deadline`, `cashflow`, `ai` e `security`.
- Criar rotas protegidas em `apps/api/src/modules/notifications/notificationRoutes.js`.
- Reutilizar `requireAuth`, `requireCompanyContext`, `requirePermission` e `Permission.NOTIFICATIONS_READ`.
- Bloquear a desativação do tipo obrigatório `security`.
- Criar testes de contrato e domínio.
- Registar evidence em `docs/evidence/MF8/BK-MF8-12.md`.

#### Scope-out

- Criar UI frontend para gerir preferências.
- Enviar notificações por email, SMS ou serviços externos.
- Alterar o motor que gera notificações existentes.
- Criar novas permissões na matriz de permissões.
- Desativar alertas críticos de segurança, auditoria ou integridade.
- Executar ações financeiras ou contabilísticas a partir de alertas.
- Criar integrações externas de tesouraria.
- Implementar exportação fiscal integral.
- Criar pesquisa documental automática.

#### Estado antes e depois

- Estado antes: o módulo `apps/api/src/modules/notifications` já lista notificações, sincroniza notificações e permite marcar notificações como lidas. As rotas existentes usam autenticação, contexto de empresa e a permissão `Permission.NOTIFICATIONS_READ`.
- Estado depois: existe contrato persistente para preferências de alertas por empresa ativa, utilizador e tipo. A API lista defaults, guarda alterações por `upsert`, bloqueia tipos obrigatórios e expõe endpoints protegidos.

#### Pre-requisitos

- Confirmar `RNF33` em `docs/RNF.md`.
- Rever a linha de `BK-MF8-12` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-12` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever a sequência em `docs/planificacao/backlogs/MF-VIEWS.md`.
- Confirmar que o backend dos alunos usa `apps/api`.
- Confirmar que o schema Prisma dos alunos usa `apps/api/prisma/schema.prisma`.
- Confirmar que `apps/api/src/modules/notifications/notificationRoutes.js` já importa `requireCompanyContext` a partir de `../companies/companyContext.js`.
- Confirmar que a permissão disponível para notificações é `Permission.NOTIFICATIONS_READ`.
- Negativos: mínimo `2`.

#### Glossário

- Tipo de alerta: categoria funcional de notificação, como `stock`, `deadline`, `cashflow`, `ai` ou `security`.
- Preferência de alerta: configuração persistida que indica se um tipo de alerta está ativo para um utilizador numa empresa.
- Empresa ativa: empresa resolvida pelo backend através da sessão autenticada.
- Alerta configurável: alerta que o utilizador pode ativar ou desativar.
- Alerta obrigatório: alerta que aparece na lista, mas não pode ser desligado.
- Default efetivo: valor usado quando ainda não existe linha persistida para um tipo de alerta.
- Upsert: operação que atualiza um registo se ele existir ou cria um novo se ainda não existir.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF33` define alertas configuráveis como requisito não funcional de UX.
- `CANONICO`: `BK-MF8-12` pertence à MF8, sprint `S12`, owner `Andre`, apoio `Oleksii`, prioridade `P1`, esforço `S` e próximo BK `BK-MF8-13`.
- `CANONICO`: os caminhos públicos dos alunos são `apps/api`, `apps/web` e `apps/api/prisma/schema.prisma`.
- `DERIVADO`: o modelo `AlertPreference` é a decisão técnica mínima para persistir a preferência por empresa ativa, utilizador e tipo, sem inventar domínio financeiro novo.

Uma preferência de alerta pertence a três dimensões: empresa, utilizador e tipo. A empresa evita mistura de dados entre empresas; o utilizador evita que uma decisão pessoal afete outra pessoa; o tipo separa categorias como stock, prazos, caixa, IA e segurança.

O backend decide a empresa ativa. O frontend pode pedir para desativar `stock`, mas não pode escolher a empresa onde isso acontece. Esta regra protege multiempresa, ownership e autorização.

Defaults reduzem dados desnecessários. A API pode devolver `stock` ativo sem criar uma linha para todos os utilizadores. Só quando o utilizador muda uma preferência é que a linha persistida passa a existir.

Alertas de segurança são obrigatórios. O utilizador deve ver que `security` existe, mas a API devolve erro `403` se alguém tentar desativar esse tipo.

A categoria `ai` não dá poder de execução à IA. Ela controla apenas se o utilizador recebe alertas desse tipo; a IA continua limitada a análise, explicação e recomendação.

#### Arquitetura do BK

- Requisito: `RNF33`.
- Domínio principal: preferências de notificações in-app.
- Modelo Prisma: `AlertPreference`.
- Service novo: `apps/api/src/modules/notifications/alertPreferenceService.js`.
- Route editada: `apps/api/src/modules/notifications/notificationRoutes.js`.
- Guards: `requireAuth(prisma)`, `requireCompanyContext(prisma)` e `requirePermission(Permission.NOTIFICATIONS_READ)`.
- Endpoints:
  - `GET /api/notifications/preferences`
  - `PATCH /api/notifications/preferences/:type`
- Payload aceite no `PATCH`: `{ "enabled": true | false }`.
- Evidence: `docs/evidence/MF8/BK-MF8-12.md`.
- Handoff: `BK-MF8-13`.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`
- CRIAR: `apps/api/src/modules/notifications/alertPreferenceService.js`
- EDITAR: `apps/api/src/modules/notifications/notificationRoutes.js`
- CRIAR: `apps/api/tests/contracts/mf8-alert-preferences.contract.test.js`
- CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-12.md`
- REVER: `apps/api/src/modules/notifications/notificationService.js`
- REVER: `apps/api/src/modules/auth/authMiddleware.js`
- REVER: `apps/api/src/modules/companies/companyContext.js`
- REVER: `apps/api/src/modules/permissions/permissionMiddleware.js`
- REVER: `apps/api/src/modules/permissions/permissions.js`
- REVER: `apps/api/src/lib/httpErrors.js`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico e integração real

1. Objetivo funcional do passo no contexto da app.

Confirmar que o BK continua ligado a `RNF33` e que a implementação vai reutilizar os módulos reais de autenticação, empresa ativa, permissões e notificações.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - REVER: `docs/planificacao/backlogs/MF-VIEWS.md`
    - REVER: `apps/api/src/modules/notifications/notificationRoutes.js`
    - LOCALIZAÇÃO: linhas que referem `BK-MF8-12`, `RNF33`, `requireCompanyContext` e `Permission.NOTIFICATIONS_READ`.

3. Instruções do que fazer.

Confirma que `BK-MF8-12` continua associado a `RNF33`, sprint `S12`, owner `Andre`, apoio `Oleksii`, dependências `-` e próximo BK `BK-MF8-13`.

Depois confirma que `notificationRoutes.js` importa:

- `requireAuth` de `../auth/authMiddleware.js`;
- `requireCompanyContext` de `../companies/companyContext.js`;
- `requirePermission` de `../permissions/permissionMiddleware.js`;
- `Permission` de `../permissions/permissions.js`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e técnico: serve para impedir drift entre RNF, matriz, backlog e imports reais.

5. Explicação do código.

Não existe código novo neste passo. A validação inicial evita dois erros comuns: resolver outro requisito com o nome de `BK-MF8-12` e copiar imports que não existem na árvore `apps/api`.

6. Validação do passo.

Executa:

```bash
rg -n "BK-MF8-12|RNF33|Alertas configuráveis" docs/RNF.md docs/planificacao/backlogs
cd apps/api
rg -n "requireCompanyContext|Permission.NOTIFICATIONS_READ|buildNotificationRoutes" src/modules/notifications src/modules/companies src/modules/permissions
```

Resultado esperado:

- `RNF33` aparece como "Alertas configuráveis (ativar/desativar tipos)".
- `BK-MF8-12` aponta para `BK-MF8-13`.
- O middleware correto é `../companies/companyContext.js`.
- A permissão existente é `Permission.NOTIFICATIONS_READ`.

7. Cenário negativo/erro esperado.

Se encontrares imports para ficheiros inexistentes de permissões ou para um ficheiro de middleware de empresa que não existe, para e corrige o guia antes de implementar. Esses caminhos não pertencem ao contrato público atual da app.

### Passo 2 - Criar o modelo Prisma de preferências

1. Objetivo funcional do passo no contexto da app.

Adicionar persistência para guardar uma preferência por empresa ativa, utilizador autenticado e tipo de alerta.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`
    - LOCALIZAÇÃO: modelos `User`, `Company` e novo modelo `AlertPreference`.

3. Instruções do que fazer.

No modelo `User`, adiciona a relação com preferências. No modelo `Company`, adiciona a relação equivalente. No fim do schema, junto dos modelos de notificações, adiciona o modelo `AlertPreference`.

4. Código completo, correto e integrado com a app final.

```prisma
// apps/api/prisma/schema.prisma
// Adiciona esta linha dentro de model User.
alertPreferences AlertPreference[] @relation("UserAlertPreferences")
```

```prisma
// apps/api/prisma/schema.prisma
// Adiciona esta linha dentro de model Company.
alertPreferences AlertPreference[]
```

```prisma
// apps/api/prisma/schema.prisma
model AlertPreference {
  id        String   @id @default(uuid())
  companyId String
  userId    String
  type      String
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  user    User    @relation("UserAlertPreferences", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([companyId, userId, type])
  @@index([companyId, userId])
  @@index([type])
}
```

5. Explicação do código.

O modelo novo cria a tabela que guarda a decisão do utilizador. A chave única `companyId`, `userId` e `type` impede duplicados e permite usar `upsert` no service. O `companyId` é campo de persistência, mas o valor virá do backend através de `req.companyId`, não do body recebido do frontend.

A relação com `Company` garante isolamento multiempresa. A relação com `User` garante que cada utilizador tem a sua própria preferência. O `onDelete: Cascade` mantém a base consistente quando uma empresa ou utilizador é removido no contexto do projeto.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run prisma:validate
npm run prisma:generate
```

Resultado esperado:

- O schema Prisma valida sem erros.
- O Prisma Client é gerado com o modelo `alertPreference`.

7. Cenário negativo/erro esperado.

Se removeres `@@unique([companyId, userId, type])`, o mesmo utilizador pode criar várias linhas para o mesmo tipo de alerta na mesma empresa. O service deixaria de ser idempotente e os testes de `upsert` deixariam de representar o comportamento pretendido.

### Passo 3 - Criar o service de preferências

1. Objetivo funcional do passo no contexto da app.

Criar a lógica de domínio que lista defaults, valida o body, normaliza o tipo de alerta, bloqueia alertas obrigatórios e persiste alterações com `upsert`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/notifications/alertPreferenceService.js`
    - REVER: `apps/api/src/lib/httpErrors.js`
    - LOCALIZAÇÃO: novo service dentro do módulo de notificações.

3. Instruções do que fazer.

Cria o ficheiro `alertPreferenceService.js` com código completo. Não recebas empresa pelo body. O service recebe `companyId` e `userId` apenas a partir da route, depois de os guards terem validado sessão e empresa ativa.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/notifications/alertPreferenceService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Tipos de alertas suportados pela API de preferências.
 *
 * @type {Array<{
 *   type: string,
 *   label: string,
 *   enabledByDefault: boolean,
 *   canDisable: boolean
 * }>}
 */
export const ALERT_TYPE_DEFINITIONS = [
    {
        type: "stock",
        label: "Stock",
        enabledByDefault: true,
        canDisable: true,
    },
    {
        type: "deadline",
        label: "Prazos",
        enabledByDefault: true,
        canDisable: true,
    },
    {
        type: "cashflow",
        label: "Caixa",
        enabledByDefault: true,
        canDisable: true,
    },
    {
        type: "ai",
        label: "Sugestões assistidas",
        enabledByDefault: true,
        canDisable: true,
    },
    {
        type: "security",
        label: "Segurança",
        enabledByDefault: true,
        canDisable: false,
    },
];

const alertTypesByCode = new Map(
    ALERT_TYPE_DEFINITIONS.map((definition) => [definition.type, definition]),
);

/**
 * Devolve a lista pública de tipos suportados.
 *
 * @returns {Array<object>} Cópia defensiva dos tipos configuráveis.
 */
export function listSupportedAlertTypes() {
    return ALERT_TYPE_DEFINITIONS.map((definition) => ({ ...definition }));
}

/**
 * Valida o body recebido por `PATCH /notifications/preferences/:type`.
 *
 * @param {unknown} body - Body JSON recebido da route.
 * @returns {{ enabled: boolean }} Payload normalizado.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o body não cumpre o contrato.
 */
export function parseAlertPreferenceBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "ALERT_PREFERENCE_BODY_INVALID", "O body deve ser um objeto JSON.");
    }

    if (typeof body.enabled !== "boolean") {
        throw httpError(
            400,
            "ALERT_PREFERENCE_ENABLED_REQUIRED",
            "O campo enabled deve ser booleano.",
        );
    }

    // Só devolvemos o campo permitido para impedir alterações escondidas no body.
    return { enabled: body.enabled };
}

/**
 * Resolve a definição de um tipo de alerta.
 *
 * @param {string} type - Tipo recebido na rota.
 * @returns {object} Definição interna do tipo.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o tipo é vazio ou inválido.
 */
function getAlertDefinition(type) {
    if (typeof type !== "string" || type.trim() === "") {
        throw httpError(400, "ALERT_TYPE_REQUIRED", "O tipo de alerta é obrigatório.");
    }

    const normalizedType = type.trim().toLowerCase();
    const definition = alertTypesByCode.get(normalizedType);

    if (!definition) {
        throw httpError(400, "ALERT_TYPE_INVALID", "Tipo de alerta inválido.", {
            type: normalizedType,
        });
    }

    return definition;
}

/**
 * Confirma que a route entregou contexto autenticado suficiente.
 *
 * @param {{ companyId?: string, userId?: string }} input - Contexto vindo dos guards.
 * @returns {void}
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando falta sessão ou empresa ativa.
 */
function assertCompanyUserContext({ companyId, userId }) {
    if (!companyId || !userId) {
        throw httpError(
            403,
            "ALERT_PREFERENCE_CONTEXT_REQUIRED",
            "É necessário existir empresa ativa e utilizador autenticado.",
        );
    }
}

/**
 * Impede a desativação de tipos obrigatórios.
 *
 * @param {{ type: string, canDisable: boolean }} definition - Definição do alerta.
 * @param {boolean} enabled - Estado pedido pelo utilizador.
 * @returns {void}
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o tipo obrigatório é desligado.
 */
function assertCanPersistPreference(definition, enabled) {
    if (!definition.canDisable && enabled === false) {
        throw httpError(
            403,
            "ALERT_TYPE_MANDATORY",
            "Este tipo de alerta é obrigatório e não pode ser desativado.",
            { type: definition.type },
        );
    }
}

/**
 * Converte definição e linha persistida na resposta pública da API.
 *
 * @param {object} definition - Definição do tipo de alerta.
 * @param {object | null | undefined} storedPreference - Preferência guardada, se existir.
 * @returns {object} DTO devolvido ao frontend.
 */
function toPreferenceResponse(definition, storedPreference) {
    const hasStoredValue = Boolean(storedPreference);

    return {
        type: definition.type,
        label: definition.label,
        enabled: hasStoredValue ? storedPreference.enabled : definition.enabledByDefault,
        defaultEnabled: definition.enabledByDefault,
        canDisable: definition.canDisable,
        source: hasStoredValue ? "stored" : "default",
        updatedAt: storedPreference?.updatedAt?.toISOString?.() ?? null,
    };
}

/**
 * Lista as preferências efetivas do utilizador autenticado na empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string }} input - Contexto autenticado.
 * @returns {Promise<Array<object>>} Lista de tipos com estado efetivo.
 */
export async function listAlertPreferences(prisma, input) {
    assertCompanyUserContext(input);

    const storedPreferences = await prisma.alertPreference.findMany({
        where: {
            companyId: input.companyId,
            userId: input.userId,
        },
    });

    // Os defaults são combinados em memória para não criar linhas desnecessárias.
    const storedPreferencesByType = new Map(
        storedPreferences.map((preference) => [preference.type, preference]),
    );

    return ALERT_TYPE_DEFINITIONS.map((definition) =>
        toPreferenceResponse(definition, storedPreferencesByType.get(definition.type)),
    );
}

/**
 * Cria ou atualiza uma preferência do utilizador autenticado na empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, type: string, enabled: boolean }} input - Pedido normalizado.
 * @returns {Promise<object>} Preferência atualizada em formato público.
 */
export async function setAlertPreference(prisma, input) {
    assertCompanyUserContext(input);

    const definition = getAlertDefinition(input.type);
    assertCanPersistPreference(definition, input.enabled);

    const storedPreference = await prisma.alertPreference.upsert({
        where: {
            companyId_userId_type: {
                companyId: input.companyId,
                userId: input.userId,
                type: definition.type,
            },
        },
        update: {
            enabled: input.enabled,
        },
        create: {
            companyId: input.companyId,
            userId: input.userId,
            type: definition.type,
            enabled: input.enabled,
        },
    });

    return toPreferenceResponse(definition, storedPreference);
}
```

5. Explicação do código.

`ALERT_TYPE_DEFINITIONS` centraliza os tipos suportados. O tipo `security` tem `canDisable: false`, por isso aparece na resposta mas não pode ser desligado. Esta decisão cumpre o requisito de alertas configuráveis sem comprometer segurança.

`parseAlertPreferenceBody` aceita apenas um objeto com `enabled` booleano. Isto evita que o frontend envie campos adicionais para influenciar empresa, utilizador, permissão ou tipo fora da rota.

`listAlertPreferences` combina defaults com preferências persistidas. Assim, um utilizador novo recebe uma lista completa sem a base de dados precisar de linhas iniciais para todos os tipos.

`setAlertPreference` usa `upsert` com a chave única definida no Prisma. A operação é idempotente: repetir a mesma chamada atualiza a mesma linha e não cria duplicados.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run syntax:check
```

Resultado esperado:

- O ficheiro novo passa na validação de sintaxe.
- Não existem imports partidos.

7. Cenário negativo/erro esperado.

Chamar `parseAlertPreferenceBody({ enabled: "false" })` deve lançar erro `400` com código `ALERT_PREFERENCE_ENABLED_REQUIRED`. Chamar `setAlertPreference` com `type: "security"` e `enabled: false` deve lançar erro `403` com código `ALERT_TYPE_MANDATORY`.

### Passo 4 - Ligar o service às rotas de notificações

1. Objetivo funcional do passo no contexto da app.

Expor as preferências através do router existente de notificações, preservando as rotas antigas e os guards reais da app.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/notifications/notificationRoutes.js`
    - REVER: `apps/api/src/modules/auth/authMiddleware.js`
    - REVER: `apps/api/src/modules/companies/companyContext.js`
    - REVER: `apps/api/src/modules/permissions/permissionMiddleware.js`
    - REVER: `apps/api/src/modules/permissions/permissions.js`
    - LOCALIZAÇÃO: função `buildNotificationRoutes`.

3. Instruções do que fazer.

Substitui o conteúdo de `notificationRoutes.js` pela versão abaixo ou aplica as mesmas alterações com cuidado: adicionar os imports do service, criar as rotas `/preferences` e `/preferences/:type`, manter `sendError` e preservar `GET /`, `POST /sync` e `PATCH /:id/read`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/notifications/notificationRoutes.js
/**
 * @file Rotas de notificações in-app e preferências de alertas.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import {
    listAlertPreferences,
    parseAlertPreferenceBody,
    setAlertPreference,
} from "./alertPreferenceService.js";
import {
    listNotifications,
    markNotificationRead,
    syncNotifications,
} from "./notificationService.js";

/**
 * Envia erro HTTP normalizado.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {unknown} error - Erro capturado.
 * @returns {import("express").Response} Resposta enviada.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({
        error: response.code,
        message: response.message,
        details: response.details,
    });
}

/**
 * Monta endpoints de notificações e preferências de alertas.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {Router} Router Express.
 */
export function buildNotificationRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.NOTIFICATIONS_READ),
    ];

    router.get("/", guards, async (req, res) => {
        try {
            const notifications = await listNotifications(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
            });
            return res.status(200).json({ notifications });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post("/sync", guards, async (req, res) => {
        try {
            const notifications = await syncNotifications(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
            });
            return res.status(200).json({ notifications });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.get("/preferences", guards, async (req, res) => {
        try {
            const preferences = await listAlertPreferences(prisma, {
                // O companyId vem do middleware de empresa ativa, não do frontend.
                companyId: req.companyId,
                userId: req.user.id,
            });
            return res.status(200).json({ preferences });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/preferences/:type", guards, async (req, res) => {
        try {
            const body = parseAlertPreferenceBody(req.body);
            const preference = await setAlertPreference(prisma, {
                // A route só aceita o tipo na URL e o enabled no body.
                companyId: req.companyId,
                userId: req.user.id,
                type: req.params.type,
                enabled: body.enabled,
            });
            return res.status(200).json({ preference });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/read", guards, async (req, res) => {
        try {
            const notification = await markNotificationRead(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                notificationId: req.params.id,
            });
            return res.status(200).json({ notification });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

5. Explicação do código.

Os imports usam apenas ficheiros reais em `apps/api`: `companyContext.js`, `permissionMiddleware.js` e `permissions.js`. Isto evita o erro de importar módulos inexistentes.

As rotas de preferências reutilizam o mesmo array `guards` das notificações. O pedido só chega ao service depois de haver sessão, empresa ativa e permissão. A empresa é lida de `req.companyId`, preenchido por `requireCompanyContext`.

`sendError` mantém o padrão atual do ficheiro: erros de domínio lançados pelo service são convertidos para JSON com `error`, `message` e `details`. Isto preserva comportamento existente e evita misturar `next(error)` com um router que já normaliza erros localmente.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run syntax:check
rg -n "from .*permissions|from .*companyContext" src/modules/notifications/notificationRoutes.js
```

Resultado esperado:

- `npm run syntax:check` passa.
- O `rg` mostra apenas imports para `../permissions/permissionMiddleware.js`, `../permissions/permissions.js` e `../companies/companyContext.js`.

7. Cenário negativo/erro esperado.

Se a route usar `companyId` vindo de `req.body`, a implementação fica insegura e deve ser recusada. O body permitido é apenas `{ "enabled": boolean }`.

### Passo 5 - Criar testes de contrato e domínio

1. Objetivo funcional do passo no contexto da app.

Provar que o service devolve defaults, grava alterações por `upsert`, rejeita bodies inválidos, bloqueia alertas obrigatórios e expõe as rotas novas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf8-alert-preferences.contract.test.js`
    - REVER: `apps/api/package.json`
    - LOCALIZAÇÃO: pasta `tests/contracts`.

3. Instruções do que fazer.

Cria um teste de contrato focado no comportamento deste BK. Usa um mock pequeno do Prisma para evitar apagar dados reais ou depender de uma base de dados local durante a validação de domínio.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/contracts/mf8-alert-preferences.contract.test.js
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildNotificationRoutes } from "../../src/modules/notifications/notificationRoutes.js";
import {
    listAlertPreferences,
    parseAlertPreferenceBody,
    setAlertPreference,
} from "../../src/modules/notifications/alertPreferenceService.js";

/**
 * Cria um mock mínimo do Prisma para testar o contrato do BK.
 *
 * @param {{ storedPreferences?: Array<object> }} options - Preferências já existentes.
 * @returns {object} Mock com os métodos usados pelo service.
 */
function createPreferencePrismaMock({ storedPreferences = [] } = {}) {
    return {
        alertPreference: {
            findMany: async () => storedPreferences,
            upsert: async ({ create, update }) => ({
                id: "pref-1",
                ...create,
                ...update,
                updatedAt: new Date("2026-07-02T10:00:00.000Z"),
            }),
        },
    };
}

/**
 * Verifica se uma route existe no router Express.
 *
 * @param {import("express").Router} router - Router montado pelo módulo.
 * @param {string} method - Método HTTP esperado.
 * @param {string} path - Caminho esperado.
 * @returns {boolean} `true` quando o router expõe a route.
 */
function routeExists(router, method, path) {
    return router.stack.some(
        (layer) =>
            layer.route?.path === path &&
            Boolean(layer.route.methods?.[method.toLowerCase()]),
    );
}

describe("MF8 alert preferences contract", () => {
    it("lista defaults e preferências guardadas para o utilizador da empresa ativa", async () => {
        const prisma = createPreferencePrismaMock({
            storedPreferences: [
                {
                    type: "ai",
                    enabled: false,
                    updatedAt: new Date("2026-07-02T09:00:00.000Z"),
                },
            ],
        });

        const preferences = await listAlertPreferences(prisma, {
            companyId: "company-1",
            userId: "user-1",
        });

        // A API devolve todos os tipos conhecidos, mesmo quando a maioria vem de defaults.
        assert.equal(preferences.some((preference) => preference.type === "stock"), true);
        assert.deepEqual(
            preferences.find((preference) => preference.type === "ai"),
            {
                type: "ai",
                label: "Sugestões assistidas",
                enabled: false,
                defaultEnabled: true,
                canDisable: true,
                source: "stored",
                updatedAt: "2026-07-02T09:00:00.000Z",
            },
        );
    });

    it("guarda preferências configuráveis por empresa, utilizador e tipo", async () => {
        const prisma = createPreferencePrismaMock();

        const preference = await setAlertPreference(prisma, {
            companyId: "company-1",
            userId: "user-1",
            type: "stock",
            enabled: false,
        });

        assert.equal(preference.type, "stock");
        assert.equal(preference.enabled, false);
        assert.equal(preference.source, "stored");
    });

    it("rejeita bodies inválidos e desativação de alertas obrigatórios", async () => {
        const prisma = createPreferencePrismaMock();

        // O body inválido falha antes da persistência, protegendo o contrato público.
        assert.throws(
            () => parseAlertPreferenceBody({ enabled: "false" }),
            /enabled deve ser booleano/,
        );

        // Alertas obrigatórios continuam ativos mesmo que um cliente tente silenciá-los.
        await assert.rejects(
            () =>
                setAlertPreference(prisma, {
                    companyId: "company-1",
                    userId: "user-1",
                    type: "security",
                    enabled: false,
                }),
            /não pode ser desativado/,
        );
    });

    it("expõe as routes protegidas de preferências no router de notificações", () => {
        const prisma = createPreferencePrismaMock();
        const router = buildNotificationRoutes({ prisma });

        assert.equal(routeExists(router, "GET", "/preferences"), true);
        assert.equal(routeExists(router, "PATCH", "/preferences/:type"), true);
    });
});
```

5. Explicação do código.

O mock só implementa `alertPreference.findMany` e `alertPreference.upsert`, porque o objetivo é testar o contrato do service e a presença das routes. Os guards são construídos quando o router é montado, mas não são executados neste teste.

O primeiro teste prova que a API devolve tipos por default e mistura a preferência persistida de `ai`. O segundo prova a escrita idempotente. O terceiro cobre dois negativos: body inválido e tentativa de desligar `security`. O quarto garante que o router expõe os endpoints do BK.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --test tests/contracts/mf8-alert-preferences.contract.test.js
npm run test:contracts
```

Resultado esperado:

- O teste isolado do BK passa.
- A suíte de contratos continua verde.

7. Cenário negativo/erro esperado.

Se o teste aceitar `{ enabled: "false" }`, o contrato fica fraco porque uma string pode ser confundida com booleano. Se `security` puder ficar `enabled: false`, o BK viola a regra de alertas obrigatórios.

### Passo 6 - Criar evidence do BK

1. Objetivo funcional do passo no contexto da app.

Registar a prova de que o BK foi implementado e validado com comandos reais.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-12.md`
    - LOCALIZAÇÃO: pasta `docs/evidence/MF8`.

3. Instruções do que fazer.

Cria a pasta de evidence se ainda não existir e preenche o ficheiro com comandos executados, resultado observado e negativos cobertos. Não declares comandos que não foram executados.

4. Código completo, correto e integrado com a app final.

```bash
mkdir -p docs/evidence/MF8
```

```md
# Evidence - BK-MF8-12

## Contexto

- Macro-fase: MF8
- BK: BK-MF8-12
- Requisito: RNF33 - Alertas configuráveis (ativar/desativar tipos)
- Owner: Andre
- Apoio: Oleksii

## Ficheiros alterados

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/notifications/alertPreferenceService.js`
- `apps/api/src/modules/notifications/notificationRoutes.js`
- `apps/api/tests/contracts/mf8-alert-preferences.contract.test.js`

## Comandos executados

| Comando | Resultado observado | Data |
| --- | --- | --- |
| `cd apps/api && npm run prisma:validate` | Preencher com o resultado real. | Preencher |
| `cd apps/api && npm run syntax:check` | Preencher com o resultado real. | Preencher |
| `cd apps/api && node --test tests/contracts/mf8-alert-preferences.contract.test.js` | Preencher com o resultado real. | Preencher |
| `cd apps/api && npm run test:contracts` | Preencher com o resultado real. | Preencher |

## Prova funcional

- `GET /api/notifications/preferences` devolve todos os tipos suportados.
- `PATCH /api/notifications/preferences/:type` persiste a preferência do utilizador autenticado na empresa ativa.
- O tipo `security` não pode ser desativado.
- O body não aceita `companyId` para decidir contexto de empresa.

## Negativos

- Body com `enabled` não booleano devolve erro controlado.
- Tentativa de desativar `security` devolve erro controlado.
- Pedido sem sessão ou sem empresa ativa é bloqueado pelos guards existentes.
```

5. Explicação do código.

O comando cria apenas a pasta de evidence. O ficheiro Markdown guarda a prova usada em PR ou defesa: contexto, ficheiros, comandos, resultados e negativos. A evidence separa resultado esperado de resultado observado para impedir que o aluno declare validações que não executou.

6. Validação do passo.

Executa:

```bash
test -f docs/evidence/MF8/BK-MF8-12.md
rg -n "npm run prisma:validate|npm run syntax:check|node --test|npm run test:contracts" docs/evidence/MF8/BK-MF8-12.md
```

Resultado esperado:

- O ficheiro existe.
- Os comandos executados estão registados com resultado observado.

7. Cenário negativo/erro esperado.

Se o ficheiro de evidence ficar só com "resultado esperado", a defesa não tem prova técnica. O aluno deve preencher resultado observado, data e notas reais.

### Passo 7 - Executar validação final e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Validar o BK completo e deixar claro o contrato entregue ao próximo BK.

2. Ficheiros envolvidos:
    - REVER: `apps/api/prisma/schema.prisma`
    - REVER: `apps/api/src/modules/notifications/alertPreferenceService.js`
    - REVER: `apps/api/src/modules/notifications/notificationRoutes.js`
    - REVER: `apps/api/tests/contracts/mf8-alert-preferences.contract.test.js`
    - EDITAR: `docs/evidence/MF8/BK-MF8-12.md`
    - LOCALIZAÇÃO: validação final do BK.

3. Instruções do que fazer.

Executa as validações técnicas e documentais. Depois atualiza a evidence com os resultados observados.

4. Código completo, correto e integrado com a app final.

```bash
cd apps/api
npm run prisma:validate
npm run syntax:check
node --test tests/contracts/mf8-alert-preferences.contract.test.js
npm run test:contracts
```

```bash
bash scripts/validate-planificacao.sh
git diff --check
```

5. Explicação do código.

Os comandos em `apps/api` validam schema, sintaxe e testes do contrato de preferências. O `validate-planificacao.sh` confirma que a documentação continua coerente com matriz, backlog e guias. O `git diff --check` apanha espaços finais e quebras de formatação que podem sujar o PR.

6. Validação do passo.

Resultado esperado:

- `npm run prisma:validate`: sem erros.
- `npm run syntax:check`: sem erros de sintaxe.
- `node --test tests/contracts/mf8-alert-preferences.contract.test.js`: testes do BK a passar.
- `npm run test:contracts`: contratos existentes a passar.
- `bash scripts/validate-planificacao.sh`: `overall_pass=true`.
- `git diff --check`: sem erros.

7. Cenário negativo/erro esperado.

Se `bash scripts/validate-planificacao.sh` falhar por caminho de guia partido, corrige o caminho antes de fechar. Se os testes falharem por import inexistente, volta ao Passo 4 e confirma todos os imports públicos.

#### Critérios de aceite

- O guia mantém `BK-MF8-12`, `RNF33`, sprint `S12`, owner `Andre`, apoio `Oleksii`, prioridade `P1`, esforço `S`, dependências `-` e próximo BK `BK-MF8-13`.
- `AlertPreference` é único por `companyId`, `userId` e `type`.
- A API lista todos os tipos suportados, incluindo defaults.
- A API altera preferências com `upsert`.
- A empresa vem de `req.companyId`, preenchido por `requireCompanyContext`.
- O body da alteração só aceita `enabled` booleano.
- Tipos inválidos devolvem erro controlado.
- `security` não pode ser desativado.
- As rotas usam `requireAuth`, `requireCompanyContext` e `requirePermission(Permission.NOTIFICATIONS_READ)`.
- Os imports da route apontam para ficheiros existentes.
- Existem testes para defaults, escrita, body inválido, alerta obrigatório e exposição das rotas.
- A evidence inclui comandos realmente executados.

#### Validação final

Executa:

```bash
cd apps/api
npm run prisma:validate
npm run syntax:check
node --test tests/contracts/mf8-alert-preferences.contract.test.js
npm run test:contracts
```

Depois, na raiz do projeto:

```bash
bash scripts/validate-planificacao.sh
git diff --check
```

Resultado esperado:

- Prisma schema válido.
- Sintaxe JavaScript válida.
- Testes de contrato do BK a passar.
- Suíte de contratos existente a passar.
- Planificação com `overall_pass=true`.
- Diff sem erros de whitespace.

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega onde este BK foi implementado.
- `proof`: resposta de `GET /api/notifications/preferences` e resposta de `PATCH /api/notifications/preferences/stock`.
- `neg`: body inválido, tentativa de desativar `security` e pedido sem sessão.
- `fonte`: `RNF33`, matriz canónica, backlog e contrato de campos.
- `multiempresa`: prova de que `companyId` vem de `req.companyId` e não do body.
- Ficheiro principal: `docs/evidence/MF8/BK-MF8-12.md`.

#### Handoff

Este BK entrega ao próximo trabalho:

- modelo `AlertPreference`;
- service `alertPreferenceService.js`;
- endpoints `GET /api/notifications/preferences` e `PATCH /api/notifications/preferences/:type`;
- contrato de payload `{ enabled: boolean }`;
- tipos suportados `stock`, `deadline`, `cashflow`, `ai` e `security`;
- regra de que `security` é obrigatório;
- prova de que a empresa ativa vem do backend.

Próximo BK recomendado: `BK-MF8-13 - IA deve evitar enviesamentos e sugerir ações baseadas em dados reais`.

#### Changelog

- `2026-07-02`: tutorial consolidado com estrutura canónica, imports reais de `apps/api`, textos didáticos em português de Portugal, caminhos canónicos de backlogs e evidence em `docs/evidence/MF8/BK-MF8-12.md`.
