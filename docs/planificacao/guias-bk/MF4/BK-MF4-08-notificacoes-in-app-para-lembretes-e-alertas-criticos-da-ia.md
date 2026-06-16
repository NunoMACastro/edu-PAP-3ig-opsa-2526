# BK-MF4-08 - Notificações in-app para lembretes e alertas críticos da IA.

## Header
- `doc_id`: `GUIA-BK-MF4-08`
- `bk_id`: `BK-MF4-08`
- `macro`: `MF4`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF4-06, BK-MF4-04`
- `rf_rnf`: `RF46`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-09`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-08-notificacoes-in-app-para-lembretes-e-alertas-criticos-da-ia.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais criar notificações internas a partir de lembretes abertos e alertas críticos da IA, sem email e sem automações externas.

#### Importância

RF46 fecha o ciclo operacional da MF4: alertas e lembretes tornam-se visíveis no produto sem depender de canais externos.

#### Scope-in

- Criar modelo `InAppNotification`.
- Gerar notificações a partir de `Reminder` e `SmartAlert`.
- Criar endpoints para listar e marcar como lida.
- Filtrar por empresa ativa e utilizador.
- Mostrar contador/lista no frontend.

#### Scope-out

- Não enviar email; integração de email fica em RNF21/MF7.
- Não criar push notifications.
- Não executar ações ao clicar na notificação.
- Não notificar dados de outra empresa.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF46.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF46 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `BK-MF4-06, BK-MF4-04`.
- Rever `apps/api/src/modules/auth`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions`.

#### Glossário

- **Notificação in-app:** mensagem visível dentro da aplicação.
- **Lida:** estado que indica que o utilizador já viu a notificação.
- **Origem:** lembrete ou alerta que criou a notificação.

#### Conceitos teóricos essenciais

- Notificações são UX, mas a segurança continua no backend.
- A origem deve ficar guardada para auditoria e explicação.
- A notificação não substitui a tarefa nem o alerta.
- Email é fora deste BK.

#### Arquitetura do BK

- Endpoints: `GET /api/notifications`, `POST /api/notifications/sync`, `PATCH /api/notifications/:id/read`.
- Modelo novo: `InAppNotification`.
- Fontes: `Reminder`, `SmartAlert`.
- Roles: todos os utilizadores autenticados com empresa ativa.
- Frontend: `NotificationsPage`.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`
- CRIAR: `apps/api/src/modules/notifications/notificationService.js`
- CRIAR: `apps/api/src/modules/notifications/notificationRoutes.js`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/lib/mf4Api.ts`
- CRIAR: `apps/web/src/pages/NotificationsPage.tsx`
- REVER: BK-MF4-06 e BK-MF4-04.

#### Tutorial técnico linear

### Passo 1 - Confirmar fontes

1. Objetivo funcional do passo no contexto da app.

Usar apenas lembretes e alertas já criados.

2. Ficheiros envolvidos:
    - REVER: BK-MF4-06
    - REVER: BK-MF4-04

3. Instruções do que fazer.

Notificações nascem de `Reminder` ou `SmartAlert`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evidence deve mostrar uma origem de cada tipo.

6. Validação do passo.

Notificação sem origem deve ser recusada.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Modelar notificação

1. Objetivo funcional do passo no contexto da app.

Guardar mensagens por utilizador.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`

3. Instruções do que fazer.

Cria `InAppNotification` e acrescenta relações inversas em `Company` e `User`.

4. Código completo, correto e integrado com a app final.

```prisma
// campos a acrescentar em modelos existentes
model Company {
  inAppNotifications InAppNotification[]
}

model User {
  inAppNotifications InAppNotification[]
}

/// Notificação interna mostrada na aplicação.
model InAppNotification {
  id          String    @id @default(uuid())
  companyId   String
  userId      String
  sourceType  String
  sourceId    String
  title       String
  message     String
  readAt      DateTime?
  createdAt   DateTime  @default(now())

  company Company @relation(fields: [companyId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@index([companyId, userId, readAt])
  @@unique([companyId, userId, sourceType, sourceId])
}
```

5. Explicação do código.

A constraint evita duplicar a mesma notificação para o mesmo utilizador.

6. Validação do passo.

Prisma valida índice único.

7. Cenário negativo/erro esperado.

Sem `userId`, todos veriam notificações que não lhes pertencem.

### Passo 3 - Criar service de sincronização

1. Objetivo funcional do passo no contexto da app.

Gerar notificações a partir das fontes.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/notifications/notificationService.js`

3. Instruções do que fazer.

Cria notificações para lembretes abertos e alertas de severidade alta.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/notifications/notificationService.js
/** Sincroniza notificações internas da empresa ativa. */
export async function syncNotifications(prisma, input) {
    // Lemos as duas fontes em paralelo porque uma não depende da outra.
    const [reminders, alerts] = await Promise.all([
        prisma.reminder.findMany({ where: { companyId: input.companyId, status: "OPEN" } }),
        prisma.smartAlert.findMany({ where: { companyId: input.companyId, severity: "HIGH", status: "OPEN" } }),
    ]);
    for (const reminder of reminders) {
        // upsert torna a sincronização idempotente: repetir o botão não duplica notificações.
        await prisma.inAppNotification.upsert({
            where: { companyId_userId_sourceType_sourceId: { companyId: input.companyId, userId: input.userId, sourceType: "Reminder", sourceId: reminder.id } },
            update: {},
            create: {
                companyId: input.companyId,
                userId: input.userId,
                sourceType: "Reminder",
                sourceId: reminder.id,
                title: reminder.title,
                message: "Lembrete aberto com prazo definido.",
            },
        });
    }
    for (const alert of alerts) {
        // A origem fica guardada para a UI explicar de onde nasceu a notificação.
        await prisma.inAppNotification.upsert({
            where: { companyId_userId_sourceType_sourceId: { companyId: input.companyId, userId: input.userId, sourceType: "SmartAlert", sourceId: alert.id } },
            update: {},
            create: {
                companyId: input.companyId,
                userId: input.userId,
                sourceType: "SmartAlert",
                sourceId: alert.id,
                title: alert.title,
                message: alert.message,
            },
        });
    }
    // A função devolve a lista final já ordenada para a página atualizar imediatamente.
    return prisma.inAppNotification.findMany({ where: { companyId: input.companyId, userId: input.userId }, orderBy: { createdAt: "desc" } });
}
```

5. Explicação do código.

O service transforma duas fontes da MF4 em notificações internas: lembretes abertos e alertas inteligentes de severidade alta. Isto não envia emails, não executa ações e não muda o estado dos lembretes ou alertas; apenas cria mensagens visíveis dentro da aplicação.

`Promise.all` é usado porque as duas consultas são independentes. Depois, cada origem é processada com `upsert`. Este é um conceito importante para alunos: sincronização deve ser idempotente. Se o utilizador clicar várias vezes em "Sincronizar", a mesma combinação `companyId + userId + sourceType + sourceId` não deve criar notificações duplicadas.

Cada notificação fica presa ao utilizador autenticado e à empresa ativa. Isto significa que dois utilizadores da mesma empresa podem ter notificações próprias e estados de leitura separados. No fim, o service devolve a lista ordenada para que o frontend possa atualizar a página sem fazer uma segunda chamada.

6. Validação do passo.

Após sincronizar, GET deve devolver notificações.

7. Cenário negativo/erro esperado.

Repetir sync não duplica a mesma origem.

### Passo 4 - Criar rotas

1. Objetivo funcional do passo no contexto da app.

Listar, sincronizar e marcar como lida.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/notifications/notificationRoutes.js`
    - EDITAR: `apps/api/src/server.js`

3. Instruções do que fazer.

Usa autenticação e contexto multiempresa.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/notifications/notificationRoutes.js
import { Router } from "express";
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { syncNotifications } from "./notificationService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Mantém resposta de erro uniforme para a página de notificações.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de notificações internas RF46. */
export function buildNotificationRoutes({ prisma }) {
    const router = Router();
    // Notificações são pessoais, mas continuam dependentes da empresa ativa.
    const guards = [requireAuth(prisma), requireCompanyContext(prisma)];

    router.get("/", guards, async (req, res) => {
        // A lista é filtrada por empresa e pelo utilizador autenticado.
        const notifications = await prisma.inAppNotification.findMany({ where: { companyId: req.companyId, userId: req.user.id }, orderBy: { createdAt: "desc" } });
        return res.status(200).json({ notifications });
    });

    router.post("/sync", guards, async (req, res) => {
        try {
            // A sincronização cria apenas notificações em falta para este utilizador.
            const notifications = await syncNotifications(prisma, { companyId: req.companyId, userId: req.user.id });
            return res.status(200).json({ notifications });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/read", guards, async (req, res) => {
        try {
            // Antes de marcar como lida, confirmamos que a notificação pertence ao utilizador.
            const existing = await prisma.inAppNotification.findFirst({
                where: {
                    id: req.params.id,
                    companyId: req.companyId,
                    userId: req.user.id,
                },
            });
            if (!existing) {
                // 404 evita revelar se o id existe noutra empresa ou conta.
                throw httpError(404, "NOTIFICATION_NOT_FOUND", "Notificação não encontrada");
            }
            const notification = await prisma.inAppNotification.update({
                where: { id: existing.id },
                data: { readAt: new Date() },
            });
            return res.status(200).json({ notification });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

```js
// apps/api/src/server.js
import { buildNotificationRoutes } from "./modules/notifications/notificationRoutes.js";

app.use("/api/notifications", buildNotificationRoutes({ prisma }));
```

5. Explicação do código.

As rotas mostram uma diferença útil entre dados da empresa e dados pessoais dentro da empresa. Uma notificação pertence à empresa ativa, mas também pertence a um utilizador específico, porque cada pessoa pode lê-la em momentos diferentes.

O `GET` e o `PATCH` filtram sempre por `companyId` e `userId`. Isto evita dois problemas: ver notificações de outra empresa e marcar como lida uma notificação de outra pessoa. O `PATCH` consulta primeiro com os três campos (`id`, `companyId`, `userId`) e só depois atualiza `readAt`.

O endpoint `/sync` chama o service idempotente. Como a criação usa `upsert`, a rota pode ser chamada várias vezes durante testes sem encher a base de dados com duplicados. Para defesa, o aluno deve demonstrar precisamente esse cenário negativo: repetir sync mantém uma notificação por origem.

6. Validação do passo.

PATCH marca `readAt` quando a notificação pertence ao utilizador autenticado.

7. Cenário negativo/erro esperado.

Utilizador não pode marcar notificação de outra empresa; esse caso devolve `404 NOTIFICATION_NOT_FOUND`.

### Passo 5 - Criar página

1. Objetivo funcional do passo no contexto da app.

Mostrar lista e botão de sincronização.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/mf4Api.ts`
    - CRIAR: `apps/web/src/pages/NotificationsPage.tsx`

3. Instruções do que fazer.

Adiciona chamadas e página ao `mf4Api.ts` cumulativo, sem repetir o cliente HTTP.

4. Código completo, correto e integrado com a app final.

```tsx
// função a adicionar em apps/web/src/lib/mf4Api.ts
export interface InAppNotification {
  id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

/** Lista notificações do utilizador autenticado. */
export function loadNotifications() {
  return client.request<{ notifications: InAppNotification[] }>("GET", "/notifications");
}

/** Sincroniza notificações a partir de lembretes e alertas. */
export function syncNotifications() {
  return client.request<{ notifications: InAppNotification[] }>("POST", "/notifications/sync");
}

/** Marca uma notificação como lida. */
export function markNotificationAsRead(id: string) {
  return client.request<{ notification: InAppNotification }>(
    "PATCH",
    "/notifications/" + encodeURIComponent(id) + "/read",
  );
}

// apps/web/src/pages/NotificationsPage.tsx
import { useEffect, useState } from "react";
import { InAppNotification, loadNotifications, markNotificationAsRead, syncNotifications } from "../lib/mf4Api";

/** Página MF4 para Notificações. */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // A listagem devolve apenas notificações da sessão atual.
      const result = await loadNotifications();
      setNotifications(result.notifications);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  async function sync() {
    // Sincroniza fontes existentes e substitui a lista local pelo resultado do backend.
    const result = await syncNotifications();
    setNotifications(result.notifications);
  }

  async function markRead(id: string) {
    // O backend valida se este id pertence ao utilizador antes de escrever readAt.
    await markNotificationAsRead(id);
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="panel">
      <h2>Notificações</h2>
      <button type="button" onClick={sync}>Sincronizar</button>
      {error ? <p className="error">{error}</p> : null}
      {notifications.length === 0 ? <p>Sem notificações.</p> : null}
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
            <small>{notification.sourceType} · {notification.readAt ? "lida" : "por ler"}</small>
            {!notification.readAt ? (
              <button type="button" onClick={() => markRead(notification.id)}>Marcar como lida</button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicação do código.

A página demonstra as três ações principais do BK: consultar notificações, sincronizar fontes e marcar uma notificação como lida. Ela não executa a ação referida pela notificação; clicar em "Marcar como lida" apenas escreve `readAt`.

O botão "Sincronizar" é manual para facilitar o smoke test dos alunos. Quando é carregado, o backend procura lembretes e alertas elegíveis e devolve a lista final. Se não existirem fontes, a página mostra "Sem notificações."; se existir erro de sessão, mostra a mensagem devolvida pelo `apiClient`.

Tal como nos BK anteriores, o frontend não envia `companyId` nem decide permissões. A UI só envia o identificador da notificação, e o backend confirma se esse ID pertence ao utilizador autenticado e à empresa ativa antes de alterar qualquer coisa.

6. Validação do passo.

Botão devolve lista atualizada.

7. Cenário negativo/erro esperado.

Sem sessão, mostra erro.

### Passo 6 - Validar handoff para auditoria

1. Objetivo funcional do passo no contexto da app.

Fechar RF46 antes de RF47.

2. Ficheiros envolvidos:
    - REVER: BK-MF4-09

3. Instruções do que fazer.

Notificações são UX; operações sensíveis continuam a exigir auditoria.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo existe para evitar uma confusão comum: notificação não é automação. Uma notificação pode avisar sobre um lembrete ou alerta, mas não deve pagar uma fatura, fechar um alerta, alterar stock ou executar qualquer operação sensível por si só.

Na evidence, o aluno deve mostrar que a ação da página é apenas marcar como lida. Se a notificação apontar para um alerta de IA, o clique não deve alterar o alerta original. Esta separação prepara o BK seguinte, onde operações sensíveis passam a ter auditoria própria.

6. Validação do passo.

Clique numa notificação não pode alterar dados.

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
- `neg`: pelo menos dois cenários negativos com código HTTP, mensagem e comportamento observado.
- `fonte`: prova de que o resultado usa dados reais da empresa ativa.

#### Handoff

- Entrega para `BK-MF4-09`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF46 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `apps/api/src/modules/*` e `apps/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: reforçadas explicações pedagógicas e comentários sobre sincronização idempotente, ownership por utilizador e limites de UX.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
