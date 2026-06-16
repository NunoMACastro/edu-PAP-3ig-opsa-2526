# BK-MF4-03 - Permitir perguntas em linguagem natural e responder com dados e fonte.

## Header
- `doc_id`: `GUIA-BK-MF4-03`
- `bk_id`: `BK-MF4-03`
- `macro`: `MF4`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-07`
- `rf_rnf`: `RF41`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-04`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-03-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais criar um endpoint de perguntas em linguagem natural controlada, respondendo apenas com dados que a aplicação consegue justificar com fontes.

#### Importância

RF41 aproxima os relatórios dos utilizadores não técnicos. O ponto central é ensinar que linguagem natural não elimina validação, fontes ou limites de segurança.

#### Scope-in

- Criar `AiQuestionRun` para guardar pergunta, resposta, fontes e utilizador.
- Aceitar perguntas de leitura sobre vendas, compras, margem e stock.
- Bloquear pedidos de alteração, aprovação, emissão ou lançamento.
- Responder com fontes reais, sem inventar dados.
- Criar formulário simples no frontend.

#### Scope-out

- Não integrar provider externo de IA.
- Não implementar conversas multi-turno.
- Não executar mutações pedidas pelo utilizador.
- Não responder a perguntas fora das fontes documentadas.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF41.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF41 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `BK-MF3-07`.
- Rever `real_dev/api/src/modules/auth`, `real_dev/api/src/modules/companies/companyContext.js` e `real_dev/api/src/modules/permissions`.

#### Glossário

- **Intenção:** categoria técnica detectada na pergunta.
- **Pergunta mutável:** pedido que tenta alterar dados, aprovar ou lançar documentos.
- **Fonte de resposta:** modelo/relatório usado para justificar a resposta.

#### Conceitos teóricos essenciais

- Linguagem natural neste MVP é uma interface de leitura, não um agente autónomo.
- O service deve mapear intenções conhecidas e rejeitar pedidos perigosos.
- Toda a resposta precisa de fonte para cumprir RF41 e preparar RF43.
- A privacidade vem do filtro por empresa ativa.

#### Arquitetura do BK

- Endpoint: `POST /api/ai/questions`.
- Modelo novo: `AiQuestionRun`.
- Validator: pergunta obrigatória e bloqueio de verbos de mutação.
- Service: respostas determinísticas sobre relatórios operacionais.
- Frontend: formulário com loading/error/success.

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/api/prisma/schema.prisma`
- CRIAR: `real_dev/api/src/modules/ai/aiQuestionValidators.js`
- CRIAR: `real_dev/api/src/modules/ai/aiQuestionService.js`
- CRIAR: `real_dev/api/src/modules/ai/aiQuestionRoutes.js`
- EDITAR: `real_dev/api/src/server.js`
- EDITAR: `real_dev/web/src/lib/mf4Api.ts`
- CRIAR: `real_dev/web/src/pages/AiQuestionsPage.tsx`
- REVER: BK-MF3-07.

#### Tutorial técnico linear

### Passo 1 - Definir intenções permitidas

1. Objetivo funcional do passo no contexto da app.

Limitar a linguagem natural a consultas seguras.

2. Ficheiros envolvidos:
    - REVER: RF41
    - REVER: BK-MF3-07

3. Instruções do que fazer.

Permite apenas perguntas de leitura sobre vendas, compras, margem e stock.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evidence deve listar intenções aceites e recusadas.

6. Validação do passo.

Pedido para “aprovar”, “emitir”, “pagar” ou “lançar” deve ser bloqueado.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Modelar perguntas respondidas

1. Objetivo funcional do passo no contexto da app.

Guardar pergunta, resposta e fontes.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/api/prisma/schema.prisma`

3. Instruções do que fazer.

Cria `AiQuestionRun` e acrescenta os campos inversos em `Company` e `User`.

4. Código completo, correto e integrado com a app final.

```prisma
// campos a acrescentar em modelos existentes
model Company {
  aiQuestionRuns AiQuestionRun[]
}

model User {
  aiQuestionRuns AiQuestionRun[] @relation("UserAiQuestionRuns")
}

/// Pergunta em linguagem natural respondida com fontes rastreáveis.
model AiQuestionRun {
  id            String   @id @default(uuid())
  companyId     String
  question      String
  answer        String
  intent        String
  sources       Json
  askedById     String
  askedAt       DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id])
  askedBy User    @relation("UserAiQuestionRuns", fields: [askedById], references: [id])

  @@index([companyId, intent, askedAt])
}
```

5. Explicação do código.

O modelo mantém prova da pergunta e da fonte usada na resposta. As relações inversas deixam claro onde o Prisma deve ligar as perguntas à empresa e ao utilizador autenticado.

6. Validação do passo.

Prisma deve aceitar o modelo e índices.

7. Cenário negativo/erro esperado.

Sem `sources`, a resposta não cumpre RF41.

### Passo 3 - Validar pergunta

1. Objetivo funcional do passo no contexto da app.

Rejeitar pedidos vazios e mutáveis.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/ai/aiQuestionValidators.js`

3. Instruções do que fazer.

Cria validator de payload.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/ai/aiQuestionValidators.js
import { httpError } from "../../lib/httpErrors.js";

const blockedVerbs = ["aprovar", "emitir", "pagar", "lançar", "apagar", "alterar", "criar fatura"];

/**
 * Valida pergunta de leitura para RF41.
 *
 * @param {Record<string, unknown>} body Body JSON recebido.
 * @returns {{ question: string }} Pergunta normalizada.
 */
export function validateAiQuestionBody(body) {
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (question.length < 8) throw httpError(400, "QUESTION_TOO_SHORT", "A pergunta deve ter pelo menos 8 caracteres");
    const lowered = question.toLowerCase();
    // Estes verbos indicam intenção de alterar dados. O endpoint RF41 é só leitura,
    // por isso bloqueamos cedo antes de chegar ao service.
    if (blockedVerbs.some((verb) => lowered.includes(verb))) {
        throw httpError(400, "QUESTION_MUTATION_BLOCKED", "A IA só responde a perguntas de leitura");
    }
    // Devolvemos a pergunta já normalizada para o service não repetir validações básicas.
    return { question };
}
```

5. Explicação do código.

Este validator mostra aos alunos que linguagem natural também é input de utilizador e, por isso, precisa de validação. Uma pergunta como “aprovar compra X” parece texto livre, mas na prática tenta executar uma ação sensível. Se o sistema aceitasse isso, a IA poderia contornar fluxos de aprovação, permissões e auditoria.

O `trim()` remove espaços que não fazem parte da pergunta real, e o tamanho mínimo evita pedidos vazios ou demasiado vagos. O array `blockedVerbs` é uma lista simples, mas pedagogicamente útil: deixa claro que este BK só responde a perguntas de leitura. Não é um agente que aprova, emite, paga, apaga ou altera dados.

O erro `QUESTION_MUTATION_BLOCKED` é explícito para a UI conseguir explicar ao utilizador o que aconteceu. Isto também ajuda na defesa: o aluno consegue mostrar um negativo concreto e justificar que a IA do OPSA não executa operações.

6. Validação do passo.

Pergunta “aprovar compra X” deve devolver `400 QUESTION_MUTATION_BLOCKED`.

7. Cenário negativo/erro esperado.

Pergunta vazia não pode chegar ao service.

### Passo 4 - Responder com dados e fonte

1. Objetivo funcional do passo no contexto da app.

Consultar relatórios operacionais para responder.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/ai/aiQuestionService.js`

3. Instruções do que fazer.

Usa intenção simples por palavras-chave.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/ai/aiQuestionService.js
/**
 * Responde a pergunta de leitura com fontes reais.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, userId: string, question: string }} input Contexto.
 * @returns {Promise<object>} Resposta guardada.
 */
export async function answerAiQuestion(prisma, input) {
    // A resposta nasce do último relatório operacional da empresa ativa.
    // Se não existir relatório, o sistema deve admitir falta de fonte.
    const report = await prisma.operationalReportRun.findFirst({ where: { companyId: input.companyId }, orderBy: { generatedAt: "desc" } });
    const lowered = input.question.toLowerCase();
    // A intenção é deliberadamente simples para o MVP: palavras-chave conhecidas
    // escolhem que métrica do relatório será explicada.
    const intent = lowered.includes("stock") ? "STOCK" : lowered.includes("compra") ? "PURCHASES" : lowered.includes("margem") ? "MARGIN" : "SALES";
    if (!report) {
        return { answer: "Ainda não existe relatório operacional para responder com fonte.", intent, sources: [] };
    }
    // Os valores continuam em cêntimos, como no resto da app financeira,
    // para evitar erros de arredondamento.
    const values = { SALES: report.revenueCents, PURCHASES: report.purchaseCents, MARGIN: report.marginCents, STOCK: report.stockValueCents };
    const answer = "Valor consultado para " + intent + ": " + values[intent] + " cêntimos.";
    const sources = [{ type: "OperationalReportRun", id: report.id, label: "Último relatório operacional" }];
    // Guardar a pergunta ajuda a auditar o que foi perguntado e que fonte sustentou a resposta.
    const run = await prisma.aiQuestionRun.create({ data: { companyId: input.companyId, question: input.question, answer, intent, sources, askedById: input.userId } });
    return { queryId: run.id, answer, intent, sources };
}
```

5. Explicação do código.

Este service é uma versão controlada de perguntas em linguagem natural. Ele não tenta “saber tudo”; limita-se a responder com base no último `OperationalReportRun` da empresa ativa. Esta limitação é saudável para um projeto PAP, porque torna a resposta previsível, testável e explicável.

A variável `intent` transforma texto humano numa categoria técnica. O aluno deve perceber que isto é uma decisão de design: em vez de mandar a pergunta inteira para um modelo externo, o MVP identifica palavras-chave e escolhe uma métrica conhecida. Assim evita alucinação e mantém a resposta dentro das fontes que a app realmente tem.

Quando não existe relatório, o service devolve uma mensagem honesta e `sources: []`. Isto é melhor do que inventar valores. Quando existe relatório, o service guarda a pergunta em `AiQuestionRun`, incluindo `companyId`, `askedById`, resposta, intenção e fontes. Esse registo ajuda a demonstrar rastreabilidade e prepara auditoria futura.

6. Validação do passo.

Com relatório existente, deve devolver `queryId`, `answer` e `sources`.

7. Cenário negativo/erro esperado.

Sem relatório, a resposta deve explicar falta de dados.

### Passo 5 - Criar rota de perguntas

1. Objetivo funcional do passo no contexto da app.

Receber pergunta e devolver JSON.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/ai/aiQuestionRoutes.js`
    - EDITAR: `real_dev/api/src/server.js`

3. Instruções do que fazer.

Monta `POST /api/ai/questions`.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/ai/aiQuestionRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { validateAiQuestionBody } from "./aiQuestionValidators.js";
import { answerAiQuestion } from "./aiQuestionService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // O mesmo formato de erro é usado em todos os routers MF4 para a UI
    // conseguir apresentar mensagens consistentes.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de perguntas IA RF41. */
export function buildAiQuestionRoutes({ prisma }) {
    const router = Router();
    const guards = [
        // Perguntas em linguagem natural continuam a ser leitura de dados reais,
        // por isso passam pelas mesmas regras de autenticação e autorização.
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REPORTS_READ),
        requireRole("ADMIN", "GESTOR", "CONTABILISTA"),
    ];

    router.post("/questions", guards, async (req, res) => {
        try {
            const body = validateAiQuestionBody(req.body);
            // A rota envia ao service uma pergunta já validada e o contexto seguro
            // resolvido pelos middlewares.
            const answer = await answerAiQuestion(prisma, { companyId: req.companyId, userId: req.user.id, question: body.question });
            return res.status(201).json({ answer });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

```js
// real_dev/api/src/server.js
import { buildAiQuestionRoutes } from "./modules/ai/aiQuestionRoutes.js";

app.use("/api/ai", buildAiQuestionRoutes({ prisma }));
```

5. Explicação do código.

A rota ensina a separar três responsabilidades. Primeiro, os middlewares confirmam quem é o utilizador, qual é a empresa ativa e se a role pode consultar relatórios. Depois, o validator confirma que a pergunta é de leitura. Só no fim o service consulta dados e guarda a resposta.

Esta ordem é importante. Se o service fosse chamado antes da autorização, uma pergunta maliciosa poderia gastar recursos ou tocar dados antes de ser bloqueada. Se o validator ficasse no frontend, um pedido feito por curl poderia passar por cima da regra. Por isso, a validação crítica fica no backend.

O `201` indica que a pergunta foi registada como um novo `AiQuestionRun`. A resposta inclui a resposta textual e as fontes, permitindo ao frontend mostrar não apenas “o que o sistema disse”, mas também “com base em que dados”.

6. Validação do passo.

Pergunta válida deve devolver `201` com fonte.

7. Cenário negativo/erro esperado.

Pedido mutável deve devolver `400`.

### Passo 6 - Criar formulário no frontend

1. Objetivo funcional do passo no contexto da app.

Permitir pergunta com feedback.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/lib/mf4Api.ts`
    - CRIAR: `real_dev/web/src/pages/AiQuestionsPage.tsx`

3. Instruções do que fazer.

Cria função POST e formulário.

4. Código completo, correto e integrado com a app final.

```tsx
// função a adicionar em real_dev/web/src/lib/mf4Api.ts
export interface AiSourceReference {
  type: string;
  id: string;
  label: string;
}

export interface AiQuestionAnswer {
  queryId?: string;
  answer: string;
  intent: string;
  sources: AiSourceReference[];
}

/** Envia uma pergunta de leitura e recebe resposta com fontes. */
export function askAiQuestion(question: string) {
  // A UI envia apenas o texto. O backend decide se a pergunta é permitida
  // e resolve empresa/utilizador a partir da sessão.
  return client.request<{ answer: AiQuestionAnswer }>("POST", "/ai/questions", { body: { question } });
}

// real_dev/web/src/pages/AiQuestionsPage.tsx
import { FormEvent, useState } from "react";
import { AiQuestionAnswer, askAiQuestion } from "../lib/mf4Api";

/** Formulário de pergunta em linguagem natural controlada. */
export function AiQuestionsPage() {
  const [answer, setAnswer] = useState<AiQuestionAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = String(new FormData(event.currentTarget).get("question") ?? "");
    try {
      // O estado anterior é substituído pela resposta nova para o aluno ver
      // claramente o resultado de cada submissão.
      const result = await askAiQuestion(question);
      setAnswer(result.answer);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Perguntas com fonte</h2>
      <form onSubmit={submit}>
        <textarea name="question" required />
        <button>Perguntar</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {answer ? (
        <article>
          <strong>{answer.intent}</strong>
          <p>{answer.answer}</p>
          <ul>
            {answer.sources.map((source) => (
              <li key={source.id}>{source.type}: {source.label}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
```

5. Explicação do código.

A função `askAiQuestion` mantém o contrato frontend simples: recebe uma string e devolve uma resposta tipada. Isto evita que a página construa URLs ou trate detalhes HTTP diretamente. Para os alunos, esta separação ajuda a perceber a diferença entre “cliente API” e “componente React”.

No componente, o formulário envia apenas `question`. Não envia `companyId`, role ou utilizador, porque esses dados são decididos pelo backend. Quando a resposta chega, a página mostra `intent`, `answer` e a lista de `sources`. Estes três campos correspondem à defesa do requisito: intenção reconhecida, resposta gerada e fonte usada.

O estado `error` mostra falhas como pergunta mutável ou sessão ausente. Isto transforma cenários negativos em comportamento visível no ecrã, em vez de deixar o aluno dependente da consola do browser.

6. Validação do passo.

Smoke: pergunta “qual foi a margem?” devolve resposta e fonte.

7. Cenário negativo/erro esperado.

Erro `QUESTION_MUTATION_BLOCKED` aparece no ecrã.

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

- Entrega para `BK-MF4-04`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF41 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `real_dev/api/src/modules/*` e `real_dev/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: explicações do código e comentários didáticos reforçados para clarificar validação de linguagem natural, fontes, guardrails e contrato frontend/backend.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
