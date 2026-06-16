# BK-MF4-06 - Criar/editar lembretes essenciais (prazos, pagamentos e impostos).

## Header
- `doc_id`: `GUIA-BK-MF4-06`
- `bk_id`: `BK-MF4-06`
- `macro`: `MF4`
- `owner`: `Sofia`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF44`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-07`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-06-criar-editar-lembretes-essenciais-prazos-pagamentos-e-impostos.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais criar lembretes simples para prazos, pagamentos e impostos, sempre ligados à empresa ativa e ao utilizador responsável.

#### Importância

RF44 ajuda a equipa a não perder datas importantes. Também fornece uma das fontes de notificações do BK-MF4-08.

#### Scope-in

- Criar modelo `Reminder`.
- Criar endpoints `GET`, `POST` e `PATCH` para lembretes.
- Validar título, tipo, data e estado.
- Filtrar por empresa ativa.
- Mostrar lista/formulário no frontend.

#### Scope-out

- Não enviar emails.
- Não calcular obrigações fiscais oficiais.
- Não criar recorrências avançadas.
- Não criar notificações; isso fica para BK-MF4-08.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF44.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF44 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `-`.
- Rever `apps/api/src/modules/auth`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions`.

#### Glossário

- **Lembrete:** registo simples com data, tipo e estado.
- **Prazo:** data de atenção operacional, não regra fiscal inventada.
- **Estado:** `OPEN`, `DONE` ou `CANCELLED`.

#### Conceitos teóricos essenciais

- Lembretes são dados operacionais, não lançamentos contabilísticos.
- Prazos fiscais só podem usar datas inseridas pelo utilizador ou documentadas no sistema.
- O backend valida campos mesmo que a UI também valide.
- A empresa ativa vem da sessão.

#### Arquitetura do BK

- Endpoints: `GET /api/reminders`, `POST /api/reminders`, `PATCH /api/reminders/:id`.
- Modelo novo: `Reminder`.
- Roles: todos os papéis autenticados com empresa ativa.
- Frontend: `RemindersPage`.
- Handoff: BK-MF4-08 consome lembretes abertos.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`
- CRIAR: `apps/api/src/modules/reminders/reminderValidators.js`
- CRIAR: `apps/api/src/modules/reminders/reminderService.js`
- CRIAR: `apps/api/src/modules/reminders/reminderRoutes.js`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/lib/mf4Api.ts`
- CRIAR: `apps/web/src/pages/RemindersPage.tsx`
- REVER: BK-MF4-08.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato funcional

1. Objetivo funcional do passo no contexto da app.

Definir campos mínimos e limites.

2. Ficheiros envolvidos:
    - REVER: `RF44`
    - REVER: matriz/backlog

3. Instruções do que fazer.

Confirma que este BK cria gestão simples de lembretes, sem regras legais inventadas.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evidence deve listar campos obrigatórios e roles.

6. Validação do passo.

Não usar este BK para automatizar decisões contabilísticas.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Modelar lembrete

1. Objetivo funcional do passo no contexto da app.

Persistir dados por empresa ativa.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`

3. Instruções do que fazer.

Cria modelo `Reminder` e acrescenta relações inversas explícitas em `Company` e `User`.

4. Código completo, correto e integrado com a app final.

```prisma
// campos a acrescentar em modelos existentes
model Company {
  reminders Reminder[]
}

model User {
  remindersCreated Reminder[] @relation("UserCreatedReminders")
}

/// Registo operacional da MF4 ligado à empresa ativa.
model Reminder {
  id            String   @id @default(uuid())
  companyId     String
  type          String
  title         String
  dueDate       DateTime
  status        String   @default("OPEN")
  notes         String?
  createdById   String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  company   Company @relation(fields: [companyId], references: [id])
  createdBy User    @relation("UserCreatedReminders", fields: [createdById], references: [id])

  @@index([companyId, status])
  @@index([companyId, createdAt])
}
```

5. Explicação do código.

O modelo inclui `companyId`, autor e estado. A empresa vem do backend. A relação inversa em `User` identifica quem criou o lembrete sem permitir que o frontend escolha outro utilizador.

6. Validação do passo.

Prisma valida modelo e relações.

7. Cenário negativo/erro esperado.

Sem índice por empresa, listagens podem misturar dados ou ficar lentas.

### Passo 3 - Validar payload

1. Objetivo funcional do passo no contexto da app.

Bloquear dados incompletos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reminders/reminderValidators.js`

3. Instruções do que fazer.

Cria validator explícito.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reminders/reminderValidators.js
import { httpError } from "../../lib/httpErrors.js";

const allowedReminderTypes = new Set(["DEADLINE", "PAYMENT", "TAX"]);
const allowedReminderStatuses = new Set(["OPEN", "DONE", "CANCELLED"]);

/** Valida texto obrigatório. */
function requiredText(value, field) {
    // O backend não confia que o frontend enviou strings bem formadas.
    // Por isso converte apenas strings reais e remove espaços acidentais.
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) throw httpError(400, "INVALID_REMINDER", field + " é obrigatório");
    return text;
}

/** Valida data obrigatória recebida pelo body. */
function requiredDate(value, field) {
    const raw = requiredText(value, field);
    // A conversão para Date permite detetar valores impossíveis antes de chegar ao Prisma.
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_REMINDER", field + " deve ser uma data válida");
    }
    return date;
}

/** Valida valor pertencente a uma lista fechada. */
function allowedText(value, field, allowedValues) {
    const text = requiredText(value, field);
    // Set.has torna claro que só aceitamos os valores de domínio previstos no BK.
    if (!allowedValues.has(text)) {
        throw httpError(400, "INVALID_REMINDER", field + " tem um valor inválido");
    }
    return text;
}

/** Valida payload de lembrete. */
export function validateReminderBody(body) {
    return {
        // O tipo continua simples: prazo, pagamento ou imposto, sem inventar cálculo fiscal.
        type: allowedText(body.type, "type", allowedReminderTypes),
        title: requiredText(body.title, "title"),
        dueDate: requiredDate(body.dueDate, "dueDate"),
        // Se a UI não enviar status, o lembrete nasce aberto por defeito.
        status: body.status === undefined ? "OPEN" : allowedText(body.status, "status", allowedReminderStatuses),
        // Notes é opcional; quando não vem como string, guardamos null em vez de lixo do body.
        notes: typeof body.notes === "string" ? body.notes.trim() : null,
    };
}

/** Valida payload de atualização de estado. */
export function validateReminderStatusBody(body) {
    return {
        status: allowedText(body.status, "status", allowedReminderStatuses),
    };
}
```

5. Explicação do código.

Este validator é a primeira barreira de qualidade do endpoint. Mesmo que a página tenha campos `required`, o aluno deve perceber que a UI pode ser contornada com Postman, curl ou DevTools, por isso a validação real fica no backend.

`requiredText` resolve dois problemas comuns: campos ausentes e campos só com espaços. `requiredDate` reaproveita essa validação e só depois tenta construir uma `Date`, para que datas inválidas sejam rejeitadas com erro controlado. `allowedText` mostra uma técnica importante para alunos: quando um campo tem valores fechados, usa-se uma whitelist, não uma comparação solta espalhada pelo código.

No payload final, `status` nasce como `OPEN` quando não é enviado, porque criar um lembrete já concluído por omissão seria confuso para o utilizador. `notes` é opcional e fica `null` quando não há texto válido. Assim, o Prisma recebe dados previsíveis, e os erros de domínio falham com `400 INVALID_REMINDER` antes de haver qualquer escrita na base de dados.

6. Validação do passo.

Body sem `title` devolve `400`.

7. Cenário negativo/erro esperado.

Data inválida ou `status: "QUALQUER"` deve devolver `400 INVALID_REMINDER`.

### Passo 4 - Criar service

1. Objetivo funcional do passo no contexto da app.

Listar, criar e atualizar estado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reminders/reminderService.js`

3. Instruções do que fazer.

Usa sempre `companyId` do contexto.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reminders/reminderService.js
import { httpError } from "../../lib/httpErrors.js";

/** Lista lembretes da empresa ativa. */
export function listReminders(prisma, input) {
    // A listagem nunca recebe companyId do query string; usa o contexto autenticado.
    return prisma.reminder.findMany({ where: { companyId: input.companyId }, orderBy: { createdAt: "desc" } });
}

/** Cria lembrete para a empresa ativa. */
export function createReminder(prisma, input) {
    // companyId e createdById vêm da sessão/contexto, não do body enviado pelo browser.
    return prisma.reminder.create({ data: { companyId: input.companyId, createdById: input.userId, ...input.data } });
}

/** Atualiza estado depois de confirmar ownership por empresa. */
export async function updateReminderStatus(prisma, input) {
    // Primeiro procuramos por id + companyId para impedir alterações entre empresas.
    const existing = await prisma.reminder.findFirst({ where: { id: input.id, companyId: input.companyId } });
    if (!existing) throw httpError(404, "REMINDER_NOT_FOUND", "Lembrete não encontrado");
    // Só depois da confirmação de ownership é que usamos update por id.
    return prisma.reminder.update({ where: { id: input.id }, data: { status: input.status } });
}
```

5. Explicação do código.

O service concentra a regra mais importante deste BK: todos os lembretes pertencem à empresa ativa. Isto é diferente de receber `companyId` no body, porque o body é controlado pelo cliente e poderia ser manipulado.

Na criação, `companyId` e `createdById` são adicionados pelo backend a partir do contexto autenticado. Na atualização, o service faz uma consulta inicial com `id` e `companyId`; esta etapa ensina um padrão essencial de aplicações multiempresa: antes de alterar uma linha, confirma-se que ela pertence ao tenant atual. Se não existir, devolvemos `404`, que é mais seguro do que revelar se aquele ID existe noutra empresa.

O update final altera apenas o `status`, preservando título, data, notas e ownership. Isto mantém o endpoint pequeno, previsível e alinhado com o objetivo do BK: criar lembretes e gerir o seu estado.

6. Validação do passo.

Criar devolve entidade com `companyId` correto.

7. Cenário negativo/erro esperado.

Atualizar ID inexistente devolve `404`.

### Passo 5 - Criar rotas

1. Objetivo funcional do passo no contexto da app.

Expor CRUD mínimo protegido.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/reminders/reminderRoutes.js`
    - EDITAR: `apps/api/src/server.js`

3. Instruções do que fazer.

Monta router REST simples.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/reminders/reminderRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { validateReminderBody, validateReminderStatusBody } from "./reminderValidators.js";
import { createReminder, listReminders, updateReminderStatus } from "./reminderService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Todos os erros saem no mesmo formato para a UI conseguir mostrá-los de forma consistente.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de Reminder. */
export function buildReminderRoutes({ prisma }) {
    const router = Router();
    // Guards comuns: primeiro sessão, depois empresa ativa, depois autorização por papel.
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL", "AUDITOR"),
    ];

    router.get("/", guards, async (req, res) => {
        // req.companyId foi calculado pelo middleware; não vem do browser.
        const items = await listReminders(prisma, { companyId: req.companyId });
        return res.status(200).json({ items });
    });

    router.post("/", guards, async (req, res) => {
        try {
            // Validamos antes de chamar o service para evitar writes com dados incompletos.
            const data = validateReminderBody(req.body);
            const item = await createReminder(prisma, { companyId: req.companyId, userId: req.user.id, data });
            return res.status(201).json({ item });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/status", guards, async (req, res) => {
        try {
            // Este endpoint só muda estado; o validator impede alterações escondidas no body.
            const data = validateReminderStatusBody(req.body);
            const item = await updateReminderStatus(prisma, { companyId: req.companyId, id: req.params.id, status: data.status });
            return res.status(200).json({ item });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

```js
// apps/api/src/server.js
import { buildReminderRoutes } from "./modules/reminders/reminderRoutes.js";

app.use("/api/reminders", buildReminderRoutes({ prisma }));
```

5. Explicação do código.

As rotas ligam a validação e o service ao Express. A ordem dos guards é pedagógica e importante: primeiro garante-se que há utilizador autenticado, depois que existe empresa ativa, e só depois se confirma se o papel do utilizador pode usar o recurso.

O `GET` apenas lê lembretes da empresa ativa. O `POST` valida o body e passa ao service apenas dados já normalizados. O `PATCH` foi desenhado de propósito para ser estreito: muda apenas o estado, em vez de aceitar um objeto grande com várias alterações. Para alunos, este é um bom exemplo de endpoint pequeno, fácil de testar e com menor superfície de erro.

`sendError` transforma exceções da app em respostas JSON consistentes. Isto evita espalhar `res.status(...).json(...)` por todos os `catch` e ajuda o frontend a mostrar mensagens previsíveis. A montagem em `server.js` torna o router disponível em `/api/reminders`.

6. Validação do passo.

GET devolve lista; POST cria; PATCH atualiza estado.

7. Cenário negativo/erro esperado.

Role fora da lista recebe `403`.

### Passo 6 - Criar página frontend

1. Objetivo funcional do passo no contexto da app.

Permitir smoke visual.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/mf4Api.ts`
    - CRIAR: `apps/web/src/pages/RemindersPage.tsx`

3. Instruções do que fazer.

Cria página com formulário de criação, lista e botões de atualização de estado.

4. Código completo, correto e integrado com a app final.

```tsx
// função a adicionar em apps/web/src/lib/mf4Api.ts
export type ReminderType = "DEADLINE" | "PAYMENT" | "TAX";
export type ReminderStatus = "OPEN" | "DONE" | "CANCELLED";

export interface ReminderItem {
  id: string;
  type: ReminderType;
  title: string;
  dueDate: string;
  status: ReminderStatus;
  notes: string | null;
}

export interface ReminderInput {
  type: ReminderType;
  title: string;
  dueDate: string;
  notes?: string;
}

/** Lista lembretes da empresa ativa. */
export function loadReminders() {
  return client.request<{ items: ReminderItem[] }>("GET", "/reminders");
}

/** Cria lembrete operacional. */
export function createReminder(body: ReminderInput) {
  return client.request<{ item: ReminderItem }>("POST", "/reminders", { body });
}

/** Atualiza estado de um lembrete existente. */
export function updateReminderStatus(id: string, status: ReminderStatus) {
  return client.request<{ item: ReminderItem }>("PATCH", "/reminders/" + encodeURIComponent(id) + "/status", {
    body: { status },
  });
}

// apps/web/src/pages/RemindersPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { ReminderItem, ReminderStatus, createReminder, loadReminders, updateReminderStatus } from "../lib/mf4Api";

/** Página MF4 para Lembretes. */
export function RemindersPage() {
  const [items, setItems] = useState<ReminderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      // A API já sabe a empresa através da sessão; a página só pede os dados.
      const result = await loadReminders();
      setItems(result.items);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // FormData lê os campos reais do formulário sem manter estado duplicado para cada input.
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await createReminder({
        type: String(form.get("type")) as "DEADLINE" | "PAYMENT" | "TAX",
        title: String(form.get("title") ?? ""),
        dueDate: String(form.get("dueDate") ?? ""),
        notes: String(form.get("notes") ?? ""),
      });
      // Depois de criar, limpamos o formulário e recarregamos para mostrar a fonte de verdade.
      event.currentTarget.reset();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: string, status: ReminderStatus) {
    // A UI envia só o novo estado; o backend confirma ownership e permissões.
    await updateReminderStatus(id, status);
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="panel">
      <h2>Lembretes</h2>
      <form onSubmit={submit}>
        <select name="type" defaultValue="DEADLINE">
          <option value="DEADLINE">Prazo</option>
          <option value="PAYMENT">Pagamento</option>
          <option value="TAX">Imposto</option>
        </select>
        <input name="title" required />
        <input name="dueDate" type="date" required />
        <textarea name="notes" />
        <button disabled={busy}>{busy ? "A guardar..." : "Criar"}</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <span>{item.type} · {item.status}</span>
            <button type="button" onClick={() => changeStatus(item.id, "DONE")}>Concluir</button>
            <button type="button" onClick={() => changeStatus(item.id, "CANCELLED")}>Cancelar</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicação do código.

A página é um smoke visual simples, mas já demonstra o fluxo real: listar, criar e mudar estado. O aluno deve reparar que nenhum pedido envia `companyId`, token manual ou credenciais. O `apiClient` reutiliza a sessão HttpOnly e o backend decide a empresa ativa.

`load` é a função que mantém a página sincronizada com a API. Depois de criar ou alterar estado, a página volta a chamar `load`, porque a base de dados é a fonte de verdade. Esta escolha é mais fácil de ensinar do que tentar atualizar a lista local manualmente e evita estados visuais desatualizados.

O formulário usa `FormData` para recolher os valores no momento do submit. Os casts TypeScript ajudam a UI, mas não substituem o validator do backend. Se alguém enviar `"QUALQUER"` como tipo ou status usando outra ferramenta, o backend continua a devolver `400`.

6. Validação do passo.

Smoke: criar e listar lembrete.

7. Cenário negativo/erro esperado.

Sem sessão, a API devolve `401` e a página mostra erro.

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

- Entrega para `BK-MF4-07`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF44 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `apps/api/src/modules/*` e `apps/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: reforçadas explicações pedagógicas e comentários nos exemplos de validação, service, rotas e página.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
