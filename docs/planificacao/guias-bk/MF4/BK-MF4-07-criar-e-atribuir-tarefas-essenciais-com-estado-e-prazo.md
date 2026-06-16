# BK-MF4-07 - Criar e atribuir tarefas essenciais com estado e prazo.

## Header
- `doc_id`: `GUIA-BK-MF4-07`
- `bk_id`: `BK-MF4-07`
- `macro`: `MF4`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF45`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-08`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-07-criar-e-atribuir-tarefas-essenciais-com-estado-e-prazo.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais implementar tarefas operacionais com responsável, estado e prazo, mantendo validação e autorização no backend.

#### Importância

RF45 transforma decisões humanas em trabalho rastreável. Complementa os lembretes e prepara notificações internas.

#### Scope-in

- Criar modelo `OperationalTask`.
- Criar endpoints de listar/criar/atualizar estado.
- Validar responsável dentro da empresa ativa.
- Restringir criação a `GESTOR`, `CONTABILISTA` e `OPERACIONAL`.
- Criar página simples de tarefas.

#### Scope-out

- Não criar Kanban completo.
- Não criar comentários ou anexos.
- Não enviar notificações ainda.
- Não atribuir tarefas a utilizadores fora da empresa.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF45.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF45 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `-`.
- Rever `real_dev/api/src/modules/auth`, `real_dev/api/src/modules/companies/companyContext.js` e `real_dev/api/src/modules/permissions`.

#### Glossário

- **Tarefa:** trabalho atribuído a alguém, com prazo e estado.
- **Responsável:** membro ativo da empresa que deve executar a tarefa.
- **Estado:** `OPEN`, `IN_PROGRESS`, `DONE` ou `CANCELLED`.

#### Conceitos teóricos essenciais

- Uma tarefa tem ownership humano; a IA não a executa.
- Validar membership evita atribuir trabalho a pessoas fora da empresa.
- Estados simples ensinam workflow sem exagerar escopo.
- O frontend mostra estado, mas o backend decide validade.

#### Arquitetura do BK

- Endpoints: `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id/status`.
- Modelo novo: `OperationalTask`.
- Service valida membership com `CompanyMembership`.
- Roles: `ADMIN`, `GESTOR`, `CONTABILISTA`, `OPERACIONAL`.
- Frontend: `TasksPage`.

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/api/prisma/schema.prisma`
- CRIAR: `real_dev/api/src/modules/tasks/taskValidators.js`
- CRIAR: `real_dev/api/src/modules/tasks/taskService.js`
- CRIAR: `real_dev/api/src/modules/tasks/taskRoutes.js`
- EDITAR: `real_dev/api/src/server.js`
- EDITAR: `real_dev/web/src/lib/mf4Api.ts`
- CRIAR: `real_dev/web/src/pages/TasksPage.tsx`
- REVER: BK-MF4-08.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato funcional

1. Objetivo funcional do passo no contexto da app.

Definir campos mínimos e limites.

2. Ficheiros envolvidos:
    - REVER: `RF45`
    - REVER: matriz/backlog

3. Instruções do que fazer.

Confirma que este BK cria gestão simples de tarefas, sem regras legais inventadas. Valida que `assignedToId` pertence a uma membership ativa da mesma empresa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evidence deve listar campos obrigatórios e roles.

6. Validação do passo.

Não usar este BK para automatizar decisões contabilísticas.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Modelar tarefa

1. Objetivo funcional do passo no contexto da app.

Persistir dados por empresa ativa.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/api/prisma/schema.prisma`

3. Instruções do que fazer.

Cria modelo `OperationalTask` com relações reais para o autor e para o responsável. Acrescenta os campos inversos em `Company` e `User`.

4. Código completo, correto e integrado com a app final.

```prisma
// campos a acrescentar em modelos existentes
model Company {
  operationalTasks OperationalTask[]
}

model User {
  createdOperationalTasks  OperationalTask[] @relation("UserCreatedOperationalTasks")
  assignedOperationalTasks OperationalTask[] @relation("UserAssignedOperationalTasks")
}

/// Registo operacional da MF4 ligado à empresa ativa.
model OperationalTask {
  id            String   @id @default(uuid())
  companyId     String
  title         String
  description   String?
  dueDate       DateTime
  status        String   @default("OPEN")
  assignedToId  String
  createdById   String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  company    Company @relation(fields: [companyId], references: [id])
  createdBy  User    @relation("UserCreatedOperationalTasks", fields: [createdById], references: [id])
  assignedTo User    @relation("UserAssignedOperationalTasks", fields: [assignedToId], references: [id])

  @@index([companyId, status])
  @@index([companyId, assignedToId])
  @@index([companyId, createdAt])
}
```

5. Explicação do código.

O modelo inclui `companyId`, autor, responsável e estado. A empresa vem do backend. A relação com `assignedTo` obriga o responsável a ser um `User` existente; o service ainda valida se esse utilizador pertence à empresa ativa.

6. Validação do passo.

Prisma valida modelo e relações.

7. Cenário negativo/erro esperado.

Sem índice por empresa, listagens podem misturar dados ou ficar lentas.

### Passo 3 - Validar payload

1. Objetivo funcional do passo no contexto da app.

Bloquear dados incompletos.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/tasks/taskValidators.js`

3. Instruções do que fazer.

Cria validator explícito.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/tasks/taskValidators.js
import { httpError } from "../../lib/httpErrors.js";

const allowedTaskStatuses = new Set(["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"]);

/** Valida texto obrigatório. */
function requiredText(value, field) {
    // A API só aceita strings reais; números, objetos ou null não passam como texto válido.
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) throw httpError(400, "INVALID_OPERATIONALTASK", field + " é obrigatório");
    return text;
}

/** Valida data obrigatória de uma tarefa. */
function requiredDate(value, field) {
    const raw = requiredText(value, field);
    // A conversão para Date transforma a string recebida num valor que pode ser persistido.
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, "INVALID_OPERATIONALTASK", field + " deve ser uma data válida");
    }
    return date;
}

/** Valida status dentro da lista permitida. */
function allowedStatus(value) {
    const status = requiredText(value, "status");
    // Estados fechados evitam que o workflow fique com valores impossíveis na base de dados.
    if (!allowedTaskStatuses.has(status)) {
        throw httpError(400, "INVALID_OPERATIONALTASK", "status tem um valor inválido");
    }
    return status;
}

/** Valida payload de tarefa. */
export function validateOperationalTaskBody(body) {
    return {
        title: requiredText(body.title, "title"),
        // A descrição é opcional; se não for string, guardamos null em vez de aceitar ruído.
        description: typeof body.description === "string" ? body.description.trim() : null,
        dueDate: requiredDate(body.dueDate, "dueDate"),
        // Uma tarefa nova fica OPEN se a UI não indicar outro estado permitido.
        status: body.status === undefined ? "OPEN" : allowedStatus(body.status),
        // O responsável é obrigatório porque RF45 exige ownership humano da tarefa.
        assignedToId: requiredText(body.assignedToId, "assignedToId"),
    };
}

/** Valida payload de mudança de estado. */
export function validateOperationalTaskStatusBody(body) {
    return {
        status: allowedStatus(body.status),
    };
}
```

5. Explicação do código.

O validator transforma um body livre, potencialmente manipulado pelo cliente, num objeto controlado que o service pode usar com confiança. Para os alunos, a ideia principal é esta: TypeScript no frontend ajuda durante o desenvolvimento, mas não protege a API quando alguém envia pedidos diretamente.

`title`, `dueDate` e `assignedToId` são obrigatórios porque uma tarefa sem nome, sem prazo ou sem responsável deixa de ser trabalho rastreável. A descrição é opcional, por isso o código aceita string e guarda `null` nos restantes casos. O `status` usa uma lista fechada para impedir valores inventados como `"WAITING"` ou `"URGENT"`, que quebrariam filtros e relatórios.

Este passo também separa responsabilidades: o validator confirma forma e domínio básico dos campos; o service, no passo seguinte, confirma se o responsável pertence mesmo à empresa ativa. Não se deve misturar tudo num único bloco porque fica mais difícil testar e explicar.

6. Validação do passo.

Body sem `title` devolve `400`.

7. Cenário negativo/erro esperado.

Data inválida ou `status: "QUALQUER"` deve devolver `400 INVALID_OPERATIONALTASK`.

### Passo 4 - Criar service

1. Objetivo funcional do passo no contexto da app.

Listar, criar e atualizar estado.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/tasks/taskService.js`

3. Instruções do que fazer.

Usa sempre `companyId` do contexto.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/tasks/taskService.js
import { httpError } from "../../lib/httpErrors.js";

/** Lista tarefas da empresa ativa. */
export function listOperationalTasks(prisma, input) {
    // A empresa vem do middleware de contexto, não de filtros escolhidos pelo utilizador.
    return prisma.operationalTask.findMany({ where: { companyId: input.companyId }, orderBy: { createdAt: "desc" } });
}

/** Garante que o responsável é membro ativo da empresa. */
async function assertAssignableUser(prisma, input) {
    // A tarefa só pode ser atribuída a alguém que pertence à mesma empresa ativa.
    const membership = await prisma.companyMembership.findFirst({
        where: {
            companyId: input.companyId,
            userId: input.assignedToId,
            // isActive evita atribuir trabalho a utilizadores removidos ou suspensos.
            isActive: true,
        },
    });
    if (!membership) {
        throw httpError(400, "TASK_ASSIGNEE_NOT_IN_COMPANY", "Só podes atribuir tarefas a utilizadores da empresa ativa");
    }
}

/** Cria tarefa para a empresa ativa. */
export async function createOperationalTask(prisma, input) {
    // Antes de escrever a tarefa, validamos a relação entre empresa e responsável.
    await assertAssignableUser(prisma, { companyId: input.companyId, assignedToId: input.data.assignedToId });
    // createdById guarda quem criou; assignedToId guarda quem deve executar.
    return prisma.operationalTask.create({ data: { companyId: input.companyId, createdById: input.userId, ...input.data } });
}

/** Atualiza estado depois de confirmar ownership por empresa. */
export async function updateOperationalTaskStatus(prisma, input) {
    // O filtro id + companyId impede atualizar tarefas que pertencem a outra empresa.
    const existing = await prisma.operationalTask.findFirst({ where: { id: input.id, companyId: input.companyId } });
    if (!existing) throw httpError(404, "OPERATIONALTASK_NOT_FOUND", "Tarefa não encontrada");
    // A mudança é intencionalmente limitada ao status.
    return prisma.operationalTask.update({ where: { id: input.id }, data: { status: input.status } });
}
```

5. Explicação do código.

O service aplica as regras que dependem da base de dados. A mais importante é a validação do responsável: não basta receber um `assignedToId` bem formatado, é preciso confirmar que esse utilizador tem uma `CompanyMembership` ativa na mesma empresa.

`assertAssignableUser` ensina uma validação de autorização muito comum: verificar relações antes de criar dados. Sem esta consulta, um utilizador poderia tentar atribuir tarefas a contas de outra empresa ou a membros desativados. O erro `TASK_ASSIGNEE_NOT_IN_COMPANY` é explícito para o aluno testar o cenário negativo.

Na criação, `createdById` e `assignedToId` têm significados diferentes. Quem cria a tarefa pode não ser quem a executa. Na atualização, o service consulta primeiro por `id` e `companyId`; se não encontrar, devolve `404`, evitando expor dados de outras empresas. O update altera apenas o estado para manter o endpoint focado.

6. Validação do passo.

Criar com responsável válido devolve entidade com `companyId` correto.

7. Cenário negativo/erro esperado.

Criar com `assignedToId` fora da empresa devolve `400 TASK_ASSIGNEE_NOT_IN_COMPANY`.

### Passo 5 - Criar rotas

1. Objetivo funcional do passo no contexto da app.

Expor CRUD mínimo protegido.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/tasks/taskRoutes.js`
    - EDITAR: `real_dev/api/src/server.js`

3. Instruções do que fazer.

Monta router REST simples.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/tasks/taskRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { validateOperationalTaskBody, validateOperationalTaskStatusBody } from "./taskValidators.js";
import { createOperationalTask, listOperationalTasks, updateOperationalTaskStatus } from "./taskService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Normaliza erros de validação, autorização e not found no mesmo formato JSON.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de OperationalTask. */
export function buildOperationalTaskRoutes({ prisma }) {
    const router = Router();
    // Todas as rotas exigem sessão, empresa ativa e um papel autorizado para RF45.
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requireRole("ADMIN", "GESTOR", "CONTABILISTA", "OPERACIONAL"),
    ];

    router.get("/", guards, async (req, res) => {
        // A listagem fica automaticamente limitada à empresa ativa.
        const items = await listOperationalTasks(prisma, { companyId: req.companyId });
        return res.status(200).json({ items });
    });

    router.post("/", guards, async (req, res) => {
        try {
            // Primeiro validamos forma dos dados; depois o service valida membership.
            const data = validateOperationalTaskBody(req.body);
            const item = await createOperationalTask(prisma, { companyId: req.companyId, userId: req.user.id, data });
            return res.status(201).json({ item });
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.patch("/:id/status", guards, async (req, res) => {
        try {
            // Endpoint estreito: só aceita transição de estado, não edição geral da tarefa.
            const data = validateOperationalTaskStatusBody(req.body);
            const item = await updateOperationalTaskStatus(prisma, { companyId: req.companyId, id: req.params.id, status: data.status });
            return res.status(200).json({ item });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

```js
// real_dev/api/src/server.js
import { buildOperationalTaskRoutes } from "./modules/tasks/taskRoutes.js";

app.use("/api/tasks", buildOperationalTaskRoutes({ prisma }));
```

5. Explicação do código.

As rotas são a camada que protege o acesso HTTP. O array `guards` deixa claro que não há tarefa sem utilizador autenticado, empresa ativa e papel autorizado. Este detalhe é importante para alunos porque a autorização deve acontecer antes de qualquer leitura ou escrita.

O `POST` mostra a cadeia completa: valida o body, chama o service, o service valida membership e só depois cria a tarefa. O `PATCH` limita a alteração ao `status`, o que torna mais fácil testar permissões e cenários negativos. Se no futuro for preciso editar título ou prazo, deve existir outro endpoint ou um validator próprio.

A montagem em `server.js` expõe `/api/tasks`. O frontend não precisa saber como a empresa é resolvida, nem deve enviar `companyId`; isso mantém a separação entre interface e segurança.

6. Validação do passo.

GET devolve lista; POST cria; PATCH atualiza estado.

7. Cenário negativo/erro esperado.

Role fora da lista recebe `403`.

### Passo 6 - Criar página frontend

1. Objetivo funcional do passo no contexto da app.

Permitir smoke visual.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/lib/mf4Api.ts`
    - CRIAR: `real_dev/web/src/pages/TasksPage.tsx`

3. Instruções do que fazer.

Cria página com formulário de criação, campo de responsável e ações de estado.

4. Código completo, correto e integrado com a app final.

```tsx
// função a adicionar em real_dev/web/src/lib/mf4Api.ts
export type OperationalTaskStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface OperationalTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: OperationalTaskStatus;
  assignedToId: string;
}

export interface OperationalTaskInput {
  title: string;
  description?: string;
  dueDate: string;
  assignedToId: string;
}

/** Lista tarefas operacionais. */
export function loadOperationalTasks() {
  return client.request<{ items: OperationalTask[] }>("GET", "/tasks");
}

/** Cria tarefa atribuída a um membro ativo da empresa. */
export function createOperationalTask(body: OperationalTaskInput) {
  return client.request<{ item: OperationalTask }>("POST", "/tasks", { body });
}

/** Atualiza estado de uma tarefa operacional. */
export function updateOperationalTaskStatus(id: string, status: OperationalTaskStatus) {
  return client.request<{ item: OperationalTask }>("PATCH", "/tasks/" + encodeURIComponent(id) + "/status", {
    body: { status },
  });
}

// real_dev/web/src/pages/TasksPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { OperationalTask, OperationalTaskStatus, createOperationalTask, loadOperationalTasks, updateOperationalTaskStatus } from "../lib/mf4Api";

/** Página MF4 para Tarefas. */
export function TasksPage() {
  const [items, setItems] = useState<OperationalTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      // O backend filtra pela empresa ativa, por isso a página não constrói filtros sensíveis.
      const result = await loadOperationalTasks();
      setItems(result.items);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // FormData recolhe os campos no momento do submit.
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await createOperationalTask({
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        dueDate: String(form.get("dueDate") ?? ""),
        assignedToId: String(form.get("assignedToId") ?? ""),
      });
      // Recarregar a lista depois de criar evita divergência entre UI e base de dados.
      event.currentTarget.reset();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(id: string, status: OperationalTaskStatus) {
    // A UI só pede a transição; o backend decide se a tarefa pertence à empresa.
    await updateOperationalTaskStatus(id, status);
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="panel">
      <h2>Tarefas</h2>
      <form onSubmit={submit}>
        <input name="title" required />
        <textarea name="description" />
        <input name="dueDate" type="date" required />
        <input name="assignedToId" required />
        <button disabled={busy}>{busy ? "A guardar..." : "Criar"}</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <span>{item.status} · responsável {item.assignedToId}</span>
            <button type="button" onClick={() => changeStatus(item.id, "IN_PROGRESS")}>Iniciar</button>
            <button type="button" onClick={() => changeStatus(item.id, "DONE")}>Concluir</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicação do código.

A página é simples de propósito: permite criar uma tarefa, indicar responsável e mudar o estado sem introduzir um quadro Kanban completo. Para um aluno, isto torna o fluxo RF45 observável sem distrair com funcionalidades fora do escopo.

O campo `assignedToId` é enviado para a API, mas a página não tenta decidir se o utilizador é válido. Essa decisão pertence ao backend, porque só o backend tem acesso confiável à membership da empresa. Se o ID não pertencer à empresa ativa, o service devolve `400 TASK_ASSIGNEE_NOT_IN_COMPANY`.

Depois de cada criação ou mudança de estado, a página recarrega a lista. Isto reforça a ideia de que a UI mostra o estado atual guardado no servidor, em vez de assumir que a operação correu bem apenas porque o botão foi clicado.

6. Validação do passo.

Smoke: criar e listar tarefa.

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

- Entrega para `BK-MF4-08`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF45 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `real_dev/api/src/modules/*` e `real_dev/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: reforçadas explicações pedagógicas e comentários nos exemplos de validação, membership, rotas e página.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
