# BK-MF4-09 - Registar auditoria: quem, quando, o quê, em operações sensíveis.

## Header
- `doc_id`: `GUIA-BK-MF4-09`
- `bk_id`: `BK-MF4-09`
- `macro`: `MF4`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF47`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-10`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-09-registar-auditoria-quem-quando-o-que-em-operacoes-sensiveis.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais criar uma camada reutilizável para registar e consultar auditoria de operações sensíveis: quem fez, quando fez, que entidade afetou e que alteração relevante ocorreu.

#### Importância

RF47 e RNF17 tornam a auditoria requisito de segurança. Sem trilho de auditoria, a aplicação perde rastreabilidade em ações críticas.

#### Scope-in

- Reutilizar o modelo real `AuditLog` já existente no schema.
- Criar `auditLogService.js` para registos padronizados.
- Criar rota `GET /api/audit/logs` para Admin/Auditor consultarem.
- Garantir que logs não guardam palavras-passe, cookies, headers ou payloads financeiros completos.
- Explicar como outros BKs chamam o service.

#### Scope-out

- Não alterar autenticação.
- Não criar SIEM externo.
- Não registar dados pessoais ou financeiros sem necessidade.
- Não substituir logs estruturados operacionais de MF8.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF47.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF47 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `-`.
- Rever `real_dev/api/src/modules/auth`, `real_dev/api/src/modules/companies/companyContext.js` e `real_dev/api/src/modules/permissions`.

#### Glossário

- **Auditoria:** registo de ação sensível com utilizador, entidade e data.
- **Operação sensível:** ação que altera dados críticos, permissões, documentos ou configurações.
- **Minimização:** guardar só o necessário para prova e segurança.

#### Conceitos teóricos essenciais

- Auditoria é diferente de log técnico comum.
- O service deve ser chamado depois de a operação principal confirmar sucesso.
- A consulta de logs é restrita a Admin e Auditor.
- Dados sensíveis não devem aparecer em `details`.

#### Arquitetura do BK

- Modelo existente: `AuditLog`.
- Service novo: `recordAuditLog`.
- Endpoint: `GET /api/audit/logs`.
- Roles de leitura: `ADMIN`, `AUDITOR`.
- Handoff: BK-MF4-10 usa padrão semelhante para logs de integração.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/api/src/modules/audit/auditLogService.js`
- CRIAR: `real_dev/api/src/modules/audit/auditLogRoutes.js`
- EDITAR: `real_dev/api/src/server.js`
- EDITAR: services sensíveis futuros para chamar `recordAuditLog`
- EDITAR: `real_dev/web/src/lib/mf4Api.ts`
- CRIAR: `real_dev/web/src/pages/AuditLogsPage.tsx`
- REVER: `real_dev/api/prisma/schema.prisma`.

#### Tutorial técnico linear

### Passo 1 - Distinguir auditoria de log técnico

1. Objetivo funcional do passo no contexto da app.

Definir o que entra no trilho de auditoria.

2. Ficheiros envolvidos:
    - REVER: RF47
    - REVER: RNF17
    - REVER: `AuditLog`

3. Instruções do que fazer.

Auditoria regista ação sensível concluída com sucesso ou tentativa bloqueada relevante.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo não tem código porque primeiro é preciso definir a fronteira do que vai ser auditado. Para os alunos, a distinção é importante: auditoria não é "imprimir coisas na consola", nem é um histórico completo de todos os dados da aplicação. Auditoria é um trilho controlado para responder a perguntas como "quem fez isto?", "quando fez?", "em que entidade?" e "qual foi a alteração relevante?".

A lista de operações sensíveis deve aparecer na evidence antes da implementação. Exemplos típicos: criar ou cancelar lembretes críticos, alterar permissões, importar dados, gerar ficheiros oficiais ou mudar configurações relevantes. Esta lista ajuda a equipa a não auditar de menos, mas também evita auditar tudo sem critério.

Também é aqui que se aplica o princípio da minimização. Um audit log deve conter prova suficiente para investigação, mas não deve copiar passwords, cookies, headers, ficheiros completos, IBANs completos ou payloads financeiros integrais. Guardar dados sensíveis "para o caso de dar jeito" é uma má prática de segurança.

6. Validação do passo.

Não usar `console.log` como auditoria.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Criar service reutilizável

1. Objetivo funcional do passo no contexto da app.

Padronizar criação de `AuditLog`.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/audit/auditLogService.js`

3. Instruções do que fazer.

O service recebe contexto autenticado e detalhes mínimos.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/audit/auditLogService.js
/**
 * Regista operação sensível no trilho de auditoria.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, userId: string, action: string, entity: string, entityId: string, details?: Record<string, unknown> }} input Dados mínimos.
 * @returns {Promise<object>} Log criado.
 */
export function recordAuditLog(prisma, input) {
    // O caller deve enviar detalhes mínimos e já sanitizados.
    // Este service padroniza a escrita, mas não deve receber payloads completos.
    const details = input.details ?? {};
    return prisma.auditLog.create({
        data: {
            // companyId e userId vêm do contexto autenticado da operação sensível.
            companyId: input.companyId,
            userId: input.userId,
            // action deve ser um nome estável, útil para filtros e evidence.
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            details,
        },
    });
}
```

5. Explicação do código.

`recordAuditLog` é um service pequeno, mas cria um contrato comum para todos os BKs que precisarem de auditoria. Em vez de cada módulo escrever diretamente em `prisma.auditLog.create`, todos passam pelos mesmos campos: empresa, utilizador, ação, entidade, identificador e detalhes mínimos.

O aluno deve reparar que `companyId` e `userId` não vêm do body do pedido. Eles vêm do contexto autenticado da operação que acabou de acontecer. Isto impede que um cliente malicioso tente criar um log em nome de outra empresa ou outro utilizador.

`details` existe para guardar contexto útil, mas deve ser curto e sanitizado. Por exemplo, `details: { title, dueDate }` é aceitável para um lembrete; já `details: req.body` é perigoso porque pode copiar dados pessoais, financeiros ou técnicos. Este service padroniza a escrita, mas a responsabilidade de escolher detalhes mínimos continua no ponto onde a operação sensível é conhecida.

6. Validação do passo.

Chamar após uma operação sensível deve criar linha em `AuditLog`.

7. Cenário negativo/erro esperado.

Não passar palavras-passe, cookies, headers ou bodies completos para `details`.

### Passo 3 - Criar consulta de auditoria

1. Objetivo funcional do passo no contexto da app.

Permitir leitura a Admin/Auditor.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/audit/auditLogRoutes.js`
    - EDITAR: `real_dev/api/src/server.js`

3. Instruções do que fazer.

Cria rota `GET /api/audit/logs`.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/audit/auditLogRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // A API devolve erros controlados em vez de expor exceções internas.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de auditoria RF47. */
export function buildAuditLogRoutes({ prisma }) {
    const router = Router();
    // Só Admin e Auditor podem consultar o trilho de auditoria.
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "AUDITOR")];

    router.get("/logs", guards, async (req, res) => {
        try {
            // A consulta usa sempre a empresa ativa e limita o volume devolvido.
            const logs = await prisma.auditLog.findMany({ where: { companyId: req.companyId }, orderBy: { createdAt: "desc" }, take: 100 });
            return res.status(200).json({ logs });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

```js
// real_dev/api/src/server.js
import { buildAuditLogRoutes } from "./modules/audit/auditLogRoutes.js";

app.use("/api/audit", buildAuditLogRoutes({ prisma }));
```

5. Explicação do código.

A consulta de auditoria é restrita porque estes registos podem revelar ações internas importantes. O middleware `requireRole("ADMIN", "AUDITOR")` garante que utilizadores operacionais ou gestores sem esse papel não conseguem consultar o trilho.

Repara que a rota não lê `companyId` da query string. Mesmo que alguém tente chamar `/api/audit/logs?companyId=outra`, esse valor não é usado. A empresa vem de `req.companyId`, que foi resolvido pelo middleware de contexto com base na sessão.

O `take: 100` limita o volume inicial da resposta. Isto é uma escolha pragmática para o MVP: evita respostas enormes e dá evidence suficiente. Se no futuro for preciso paginação, ela deve manter o mesmo princípio de segurança: filtrar sempre por empresa ativa antes de devolver logs.

6. Validação do passo.

Admin/Auditor recebe `200`.

7. Cenário negativo/erro esperado.

Operacional recebe `403`.

### Passo 4 - Integrar num service sensível

1. Objetivo funcional do passo no contexto da app.

Mostrar padrão de chamada sem refatorar tudo.

2. Ficheiros envolvidos:
    - REVER: services de criação/edição sensível

3. Instruções do que fazer.

Depois de criar ou alterar dados críticos, chama `recordAuditLog`.

4. Código completo, correto e integrado com a app final.

```js
// exemplo dentro de um service sensível, após a operação principal
await recordAuditLog(prisma, {
    companyId: input.companyId,
    userId: input.userId,
    // Nome estável da ação: facilita pesquisa, filtros e auditoria manual.
    action: "REMINDER_CREATED",
    entity: "Reminder",
    entityId: reminder.id,
    // Guardar só campos úteis para prova, não o body completo do pedido.
    details: { title: reminder.title, dueDate: reminder.dueDate },
});
```

5. Explicação do código.

Este exemplo mostra onde a auditoria deve acontecer: depois da operação principal ter sucesso. Primeiro cria-se o lembrete; só quando existe `reminder.id` é que se regista `REMINDER_CREATED`. Assim evitamos logs que afirmam que algo foi criado quando a criação falhou.

`action` deve ser um identificador estável e fácil de filtrar. `entity` e `entityId` dizem que objeto foi afetado. `details` complementa a prova com campos mínimos, como título e data. Não se deve copiar `req.body`, headers, cookies ou objetos completos do Prisma, porque isso pode arrastar dados sensíveis desnecessários para o audit log.

Esta integração também ensina um padrão reutilizável: cada service sensível faz a sua operação, confirma sucesso e regista auditoria com contexto mínimo. O BK não exige refatorar toda a aplicação de uma vez; exige deixar o padrão correto para os próximos módulos.

6. Validação do passo.

Ao criar lembrete, deve aparecer log com ação e entidade.

7. Cenário negativo/erro esperado.

Se a operação principal falhar, não registar sucesso falso.

### Passo 5 - Criar página de consulta

1. Objetivo funcional do passo no contexto da app.

Dar evidence visual ao Auditor.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/lib/mf4Api.ts`
    - CRIAR: `real_dev/web/src/pages/AuditLogsPage.tsx`

3. Instruções do que fazer.

Adiciona consulta simples ao `mf4Api.ts` cumulativo, sem repetir o cliente HTTP.

4. Código completo, correto e integrado com a app final.

```tsx
// função a adicionar em real_dev/web/src/lib/mf4Api.ts
export interface AuditLogItem {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, string | number | boolean | null>;
  createdAt: string;
}

/** Consulta logs de auditoria da empresa ativa. */
export function getAuditLogs() {
  return client.request<{ logs: AuditLogItem[] }>("GET", "/audit/logs");
}

// real_dev/web/src/pages/AuditLogsPage.tsx
import { useState } from "react";
import { AuditLogItem, getAuditLogs } from "../lib/mf4Api";

/** Página MF4 para Auditoria. */
export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // A API só responde se a sessão tiver papel ADMIN ou AUDITOR.
      const result = await getAuditLogs();
      setLogs(result.logs);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Auditoria</h2>
      <button type="button" onClick={load}>Consultar</button>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <strong>{log.action}</strong>
            <span>{log.entity} · {log.entityId}</span>
            <small>{log.createdAt}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicação do código.

A página é intencionalmente simples: serve para o Auditor ou Admin confirmar que há trilho de auditoria consultável. Ela mostra a ação, a entidade, o identificador e a data, que são os campos essenciais para uma primeira inspeção.

O frontend não filtra por empresa nem por utilizador porque isso seria uma decisão de segurança no lado errado. A API já restringe a empresa ativa e o papel autorizado. Se um Gestor tentar abrir a página, o pedido deve falhar com `403`, e esse é um negativo obrigatório.

Também é importante notar o que a página não mostra: payloads completos, credenciais ou dados financeiros extensos. A UI deve ajudar a provar a ação sem transformar a auditoria num novo ponto de exposição de dados sensíveis.

6. Validação do passo.

Auditor vê logs da empresa ativa.

7. Cenário negativo/erro esperado.

Gestor sem role Auditor/Admin deve ver erro.

### Passo 6 - Definir negativos de privacidade

1. Objetivo funcional do passo no contexto da app.

Evitar exposição indevida.

2. Ficheiros envolvidos:
    - REVER: evidence

3. Instruções do que fazer.

Confirma que `details` não contém palavras-passe, cookies, headers, IBAN completo ou payload financeiro integral.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo obriga o aluno a provar que a auditoria foi construída com minimização. Não basta o código "parecer seguro"; a evidence deve mostrar um exemplo real de `details` sem dados sensíveis.

Um bom teste é procurar no log por campos proibidos ou perigosos, como `password`, `cookie`, `authorization`, `headers`, `iban` completo ou conteúdo integral de ficheiros. Se algum destes aparecer, a integração que chamou `recordAuditLog` deve ser corrigida antes de fechar o BK.

O objetivo não é remover todo o contexto, mas escolher contexto seguro. Um título, uma data, um estado antigo/novo ou uma contagem são exemplos aceitáveis. Um body completo de uma operação financeira não é aceitável.

6. Validação do passo.

Log com dados sensíveis completos deve ser rejeitado.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 7 - Validar consistência cross-MF

1. Objetivo funcional do passo no contexto da app.

Garantir que MF6/MF8 conseguem reforçar auditoria.

2. Ficheiros envolvidos:
    - REVER: BK-MF6-10
    - REVER: BK-MF8-01

3. Instruções do que fazer.

Regista que este BK cria trilho funcional e MF8 tratará logs estruturados operacionais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O handoff existe para evitar que MF6 ou MF8 misturem conceitos. `AuditLog` responde a perguntas de responsabilidade humana sobre operações sensíveis. Logs técnicos estruturados respondem a perguntas operacionais, como performance, falhas de integração ou eventos de infraestrutura.

Esta separação ajuda a manter cada modelo com uma finalidade clara. Se um upload SAF-T falhar, isso pode gerar log de integração; se um Admin executar uma ação sensível relacionada com esse processo, isso pode gerar auditoria. São camadas complementares, não substitutas.

6. Validação do passo.

Misturar auditoria financeira com log técnico comum é erro.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 8 - Fechar evidence P0

1. Objetivo funcional do passo no contexto da app.

Cumprir negativos mínimos de P0.

2. Ficheiros envolvidos:
    - REVER: package scripts

3. Instruções do que fazer.

Executa smoke de listagem e três negativos: sem sessão, role proibida, dados sensíveis bloqueados por revisão.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O fecho P0 deve demonstrar três tipos de proteção. Primeiro, sem sessão, a rota deve devolver `401`. Segundo, com sessão mas sem papel `ADMIN` ou `AUDITOR`, deve devolver `403`. Terceiro, a evidence deve mostrar que os detalhes guardados estão minimizados.

Estes negativos são tão importantes como o cenário feliz. O cenário feliz prova que o recurso funciona; os negativos provam que funciona dentro dos limites de segurança exigidos por RF47 e RNF17.

6. Validação do passo.

Não fechar P0 sem três negativos.

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
- `neg`: pelo menos três cenários negativos com código HTTP, mensagem e comportamento observado.
- `fonte`: prova de que o resultado usa dados reais da empresa ativa.

#### Handoff

- Entrega para `BK-MF4-10`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF47 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `real_dev/api/src/modules/*` e `real_dev/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: reforçadas explicações pedagógicas e comentários sobre minimização, contexto autenticado, consulta restrita e evidence negativa.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
