# BK-MF4-10 - Registar logs de integração (uploads, SAF-T, reconciliações).

## Header
- `doc_id`: `GUIA-BK-MF4-10`
- `bk_id`: `BK-MF4-10`
- `macro`: `MF4`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF48`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-01`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-10-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md`
- `last_updated`: `2026-07-10`

#### Contrato de integração atualizado

Logs de upload, SAF-T e reconciliação guardam apenas metadata/hash/estado redigidos e são gravados atomicamente com a alteração relevante. A consulta usa cursor pagination `{ items, pageInfo }`. Ficheiros ficam no S3 privado; conteúdo, tokens, cookies e URLs credenciadas nunca entram no log.

#### Objetivo

Neste BK vais implementar logs de integração para uploads, exportações SAF-T e reconciliações, com estado, fonte, contagens e erro controlado.

#### Importância

RF48 dá rastreabilidade a processos que falham por ficheiros, formatos ou dados externos. É uma camada operacional distinta da auditoria de ações sensíveis.

#### Scope-in

- Criar modelo `IntegrationLog`.
- Criar service `recordIntegrationLog`.
- Criar endpoint `GET /api/integrations/logs` para Admin.
- Registar tipo, estado, origem, contagens e mensagem sanitizada.
- Referenciar importações, SAF-T e reconciliação como fontes existentes.

#### Scope-out

- Não implementar nova importação.
- Não alterar geração SAF-T.
- Não criar integração bancária real.
- Não guardar conteúdo completo de ficheiros, headers, cookies ou credenciais.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF48.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF48 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `-`.
- Rever `apps/api/src/modules/auth`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions`.

#### Glossário

- **Log de integração:** registo técnico-funcional de uma troca com ficheiro ou processo externo.
- **Estado:** `SUCCESS`, `FAILED` ou `PARTIAL`.
- **Mensagem sanitizada:** erro sem segredos nem dados financeiros completos.

#### Conceitos teóricos essenciais

- Logs de integração explicam uploads e exportações; auditoria explica ações humanas sensíveis.
- Contagens ajudam a defender importações parciais.
- A mensagem de erro deve ajudar sem expor dados privados.
- RF48 cobre uploads, SAF-T e reconciliações; não promete integrações externas reais.

#### Arquitetura do BK

- Modelo novo: `IntegrationLog`.
- Service: `recordIntegrationLog`.
- Endpoint: `GET /api/integrations/logs`.
- Roles: `ADMIN`.
- Handoff: MF5 usa estes logs para feedback claro na UI.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`
- CRIAR: `apps/api/src/modules/integrations/integrationLogService.js`
- CRIAR: `apps/api/src/modules/integrations/integrationLogRoutes.js`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/lib/mf4Api.ts`
- CRIAR: `apps/web/src/pages/IntegrationLogsPage.tsx`
- REVER: BK-MF3-03, BK-MF3-05 e BK-MF3-06.

#### Tutorial técnico linear

### Passo 1 - Separar logs de integração de auditoria

1. Objetivo funcional do passo no contexto da app.

Definir fronteira de RF48.

2. Ficheiros envolvidos:
    - REVER: RF48
    - REVER: BK-MF3-03
    - REVER: BK-MF3-05
    - REVER: BK-MF3-06

3. Instruções do que fazer.

Logs de integração registam execução de uploads/exportações/reconciliações e respetivos resultados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo define a fronteira de RF48 antes de criar tabelas ou endpoints. Logs de integração existem para explicar processos que lidam com ficheiros, exportações ou dados externos: importações, SAF-T e reconciliações. Eles respondem a perguntas como "correu bem?", "quantas linhas entraram?", "quantas falharam?" e "qual foi o erro controlado?".

Isto é diferente de auditoria. Auditoria foca-se em responsabilidade humana sobre operações sensíveis; logs de integração focam-se no resultado técnico-funcional de um processo. Um mesmo fluxo pode gerar ambos, mas cada modelo tem um objetivo diferente.

A evidence deve listar as fontes cobertas e provar que o log guarda apenas resumo. O aluno não deve guardar o ficheiro completo, conteúdo integral do CSV, headers, cookies, tokens, credenciais ou dados financeiros extensos dentro do log.

6. Validação do passo.

Não guardar ficheiro completo no log.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Modelar `IntegrationLog`

1. Objetivo funcional do passo no contexto da app.

Persistir resultado de processos de integração.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`

3. Instruções do que fazer.

Cria modelo com contagens, mensagem sanitizada e relações inversas explícitas.

4. Código completo, correto e integrado com a app final.

```prisma
// campos a acrescentar em modelos existentes
model Company {
  integrationLogs IntegrationLog[]
}

model User {
  integrationLogsCreated IntegrationLog[] @relation("UserIntegrationLogs")
}

/// Log funcional de processos de integração: uploads, SAF-T e reconciliações.
model IntegrationLog {
  id              String   @id @default(uuid())
  // companyId garante isolamento multiempresa em todas as consultas.
  companyId       String
  // Tipo de integração: BUSINESS_IMPORT, SAFT_EXPORT, BANK_RECONCILIATION, etc.
  integrationType String
  // Origem interna que produziu o log, por exemplo BusinessImportRun.
  sourceType      String
  sourceId        String?
  // Resultado resumido do processo.
  status          String
  // Contagens dão contexto sem guardar o ficheiro completo.
  totalCount      Int      @default(0)
  successCount    Int      @default(0)
  errorCount      Int      @default(0)
  // Mensagem curta e sanitizada, própria para UI e evidence.
  message         String?
  createdById     String
  createdAt       DateTime @default(now())

  company   Company @relation(fields: [companyId], references: [id])
  createdBy User    @relation("UserIntegrationLogs", fields: [createdById], references: [id])

  @@index([companyId, integrationType, createdAt])
  @@index([companyId, status])
}
```

5. Explicação do código.

O modelo guarda um resumo da execução, não o conteúdo da execução. `integrationType` identifica o tipo de processo, `sourceType` e `sourceId` permitem voltar à origem interna, e `status` resume o resultado.

As contagens são centrais para ensinar importações parciais. Um `PARTIAL` com `totalCount: 100`, `successCount: 92` e `errorCount: 8` explica muito melhor o que aconteceu do que uma mensagem genérica de erro. Ao mesmo tempo, mantém a privacidade porque não copia as 100 linhas do ficheiro.

As relações com `Company` e `User` tornam claro quem iniciou o processo e a que empresa pertence. Os índices ajudam consultas frequentes por empresa, tipo, data e estado. O aluno deve perceber que o isolamento multiempresa começa no modelo e continua nas rotas.

6. Validação do passo.

Prisma valida modelo e índices.

7. Cenário negativo/erro esperado.

Sem contagens, importações parciais não ficam explicáveis.

### Passo 3 - Criar service de registo

1. Objetivo funcional do passo no contexto da app.

Centralizar criação e sanitização.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/integrations/integrationLogService.js`

3. Instruções do que fazer.

Normaliza status e encurta mensagem.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/integrations/integrationLogService.js
const allowedStatus = new Set(["SUCCESS", "FAILED", "PARTIAL"]);

/** Regista log de integração com mensagem sanitizada. */
export function recordIntegrationLog(prisma, input) {
    // Se chegar um status desconhecido, registamos FAILED para não criar estados soltos.
    const status = allowedStatus.has(input.status) ? input.status : "FAILED";
    // A mensagem é curta de propósito: serve para UI/evidence, não para guardar ficheiros.
    const message = typeof input.message === "string" ? input.message.slice(0, 300) : null;
    return prisma.integrationLog.create({
        data: {
            // Contexto autenticado e classificação do processo.
            companyId: input.companyId,
            integrationType: input.integrationType,
            sourceType: input.sourceType,
            sourceId: input.sourceId ?? null,
            status,
            // Defaults a zero evitam nulls em relatórios e simplificam a UI.
            totalCount: input.totalCount ?? 0,
            successCount: input.successCount ?? 0,
            errorCount: input.errorCount ?? 0,
            message,
            createdById: input.userId,
        },
    });
}
```

5. Explicação do código.

`recordIntegrationLog` centraliza a forma como os processos externos registam resultados. O caller envia contexto autenticado, classificação da integração, estado e contagens. A função não recebe ficheiros, linhas CSV, XML SAF-T completo, headers ou credenciais.

O `allowedStatus` impede estados soltos na base de dados. Se por erro de programação chegar um status desconhecido, o service guarda `FAILED`, que é mais seguro do que criar um valor impossível de filtrar. A mensagem é truncada para 300 caracteres porque deve ajudar o utilizador a perceber o problema sem expor conteúdo sensível.

As contagens têm `0` por defeito para simplificar relatórios e UI. Isto também torna o modelo mais previsível para alunos: quando uma integração não tem contagem aplicável, continua a haver números consistentes em vez de vários `null`.

6. Validação do passo.

Criar log `PARTIAL` com contagens deve persistir.

7. Cenário negativo/erro esperado.

Mensagem muito longa deve ser truncada.

### Passo 4 - Criar rota de consulta

1. Objetivo funcional do passo no contexto da app.

Permitir Admin consultar logs.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/integrations/integrationLogRoutes.js`
    - EDITAR: `apps/api/src/server.js`

3. Instruções do que fazer.

Cria `GET /api/integrations/logs`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/integrations/integrationLogRoutes.js
import { Router } from "express";
import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Mantém o mesmo contrato de erro usado no resto da API.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de logs de integração RF48. */
export function buildIntegrationLogRoutes({ prisma }) {
    const router = Router();
    // RF48 restringe consulta a Admin.
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN")];

    router.get("/logs", guards, async (req, res) => {
        try {
            // A empresa vem do contexto autenticado; não é aceite como query param.
            const pageSize = parsePageLimit(req.query.limit);
            const cursor = decodePageCursor(req.query.cursor, "date");
            const keyset = buildKeysetCondition(cursor, {
                sortField: "createdAt",
                direction: "desc",
            });
            const baseWhere = { companyId: req.companyId };
            const rows = await prisma.integrationLog.findMany({
                where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                take: pageSize + 1,
            });
            const page = buildCursorPage(rows, {
                limit: pageSize,
                sortField: "createdAt",
                sortType: "date",
            });
            return res.status(200).json({
                items: page.items,
                pageInfo: page.pageInfo,
            });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

```js
// apps/api/src/server.js
import { buildIntegrationLogRoutes } from "./modules/integrations/integrationLogRoutes.js";

app.use("/api/integrations", buildIntegrationLogRoutes({ prisma }));
```

5. Explicação do código.

A rota é deliberadamente só de consulta. Este BK não cria upload, SAF-T ou reconciliação; ele cria a visibilidade operacional desses processos. Por isso o endpoint principal é `GET /api/integrations/logs`.

O array `guards` aplica sessão, empresa ativa e role `ADMIN`. A rota não aceita `companyId` vindo da query string, porque a empresa tem de ser resolvida pelo contexto autenticado. Este padrão é igual aos restantes BKs multiempresa e deve ser reconhecido pelos alunos como uma regra transversal da aplicação.

O service pede `pageSize + 1`, calcula `hasNextPage` e mantém filtro por `companyId` antes de devolver dados.

6. Validação do passo.

Admin recebe logs da empresa ativa.

7. Cenário negativo/erro esperado.

Outro papel recebe `403`.

### Passo 5 - Integrar com processos existentes

1. Objetivo funcional do passo no contexto da app.

Mostrar onde chamar o service.

2. Ficheiros envolvidos:
    - REVER: `businessImportService.js`
    - REVER: `saftService.js`
    - REVER: `statementImportService.js`

3. Instruções do que fazer.

Chama `recordIntegrationLog` no fim de uploads/exportações/reconciliações.

4. Código completo, correto e integrado com a app final.

```js
// exemplo após uma importação CSV/Excel
await recordIntegrationLog(prisma, {
    companyId: input.companyId,
    userId: input.userId,
    // Nome estável do tipo de integração, útil para filtros na UI.
    integrationType: "BUSINESS_IMPORT",
    // Origem interna que permite voltar à execução concreta.
    sourceType: "BusinessImportRun",
    sourceId: run.id,
    // Importações com linhas rejeitadas são parciais, não sucessos totais.
    status: run.rejectedRows > 0 ? "PARTIAL" : "SUCCESS",
    totalCount: run.totalRows,
    successCount: run.acceptedRows,
    errorCount: run.rejectedRows,
    // Mensagem curta, sem conteúdo do ficheiro importado.
    message: "Importação concluída com resumo de linhas.",
});
```

5. Explicação do código.

Este exemplo mostra o ponto certo de integração: depois de uma importação terminar e já existirem contagens. O log aponta para a execução (`sourceType` e `sourceId`) e guarda o resumo necessário para explicar o resultado.

O estado `PARTIAL` é importante. Uma importação com 92 linhas aceites e 8 rejeitadas não é igual a uma falha total, mas também não é sucesso completo. As contagens tornam essa diferença objetiva para a UI, para suporte e para a defesa do projeto.

A mensagem deve ser curta e segura. Não se deve colocar conteúdo do CSV, XML SAF-T, extrato bancário, stack trace completo, token ou credencial. Se for preciso investigar detalhes técnicos profundos, isso pertence a logs operacionais controlados, não a este resumo funcional.

6. Validação do passo.

Importação parcial deve gerar `PARTIAL`.

7. Cenário negativo/erro esperado.

Não incluir conteúdo do CSV em `message`.

### Passo 6 - Criar página de consulta

1. Objetivo funcional do passo no contexto da app.

Dar visibility operacional ao Admin.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/mf4Api.ts`
    - CRIAR: `apps/web/src/pages/IntegrationLogsPage.tsx`

3. Instruções do que fazer.

Adiciona chamada GET e página ao `mf4Api.ts` cumulativo, sem repetir o cliente HTTP.

4. Código completo, correto e integrado com a app final.

```tsx
// função a adicionar em apps/web/src/lib/mf4Api.ts
export interface IntegrationLogItem {
  id: string;
  integrationType: string;
  sourceType: string;
  sourceId: string | null;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  totalCount: number;
  successCount: number;
  errorCount: number;
  message: string | null;
  createdAt: string;
}

/** Consulta logs de integração da empresa ativa. */
export function getIntegrationLogs(cursor?: string) {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return client.request<{
    items: IntegrationLogItem[];
    pageInfo: { nextCursor: string | null; hasNextPage: boolean };
  }>("GET", `/integrations/logs${query}`);
}

// apps/web/src/pages/IntegrationLogsPage.tsx
import { useState } from "react";
import { IntegrationLogItem, getIntegrationLogs } from "../lib/mf4Api";

/** Página MF4 para Logs de integração. */
export function IntegrationLogsPage() {
  const [logs, setLogs] = useState<IntegrationLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // A API só devolve logs se a sessão for Admin da empresa ativa.
      const result = await getIntegrationLogs();
      setLogs(result.items);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Logs de integração</h2>
      <button type="button" onClick={load}>Consultar</button>
      {error ? <p className="error">{error}</p> : null}
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <strong>{log.integrationType}</strong>
            <span>{log.status} · {log.successCount}/{log.totalCount}</span>
            <small>{log.message ?? "Sem mensagem"}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicação do código.

A página dá visibilidade operacional ao Admin sem expor dados brutos. Cada item mostra tipo de integração, estado, contagens e mensagem sanitizada. Isto é suficiente para perceber se o processo correu bem, falhou ou ficou parcial.

O frontend não recebe ficheiros, linhas rejeitadas completas nem dados financeiros extensos. Ele apenas apresenta o resumo devolvido pelo endpoint protegido. Se um utilizador sem role `ADMIN` tentar consultar, o backend deve devolver `403`, e esse cenário deve entrar na evidence.

Este ecrã também prepara MF5: a macro seguinte pode reaproveitar estes campos para mostrar feedback mais rico ao utilizador, sem precisar de conhecer detalhes internos de cada processo de integração.

6. Validação do passo.

Smoke: Admin consulta lista.

7. Cenário negativo/erro esperado.

Operacional recebe erro.

### Passo 7 - Validar segurança dos logs

1. Objetivo funcional do passo no contexto da app.

Evitar exposição de dados sensíveis.

2. Ficheiros envolvidos:
    - REVER: logs criados

3. Instruções do que fazer.

Confirma que não há ficheiros completos, credenciais, cookies, headers ou dados financeiros extensos.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A validação de segurança confirma que os logs são úteis sem se tornarem perigosos. A evidence deve mostrar contagens, status e mensagem curta, mas não deve mostrar ficheiros completos, headers, cookies, credenciais, XML SAF-T integral ou dados financeiros extensos.

Uma boa forma de testar é criar uma mensagem excessivamente longa e confirmar que foi truncada. Outra é rever exemplos reais de logs e procurar termos proibidos como `password`, `authorization`, `cookie`, `token` ou conteúdo bruto de ficheiros. Se aparecerem, o processo que chama `recordIntegrationLog` tem de ser corrigido.

6. Validação do passo.

Log com conteúdo completo do ficheiro falha.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 8 - Preparar handoff para MF5

1. Objetivo funcional do passo no contexto da app.

Fechar MF4 com outputs visíveis.

2. Ficheiros envolvidos:
    - REVER: BK-MF5-01

3. Instruções do que fazer.

MF5 deve conseguir apresentar estes logs com interface consistente.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

O handoff para MF5 deve ser concreto: endpoint `/api/integrations/logs`, role `ADMIN`, campos devolvidos e limites de segurança. Assim, quem construir a UI na macro seguinte sabe exatamente que dados pode apresentar e que dados não existem por desenho.

Este passo também fecha a MF4 com uma separação saudável: notificações avisam, auditoria responsabiliza, logs de integração explicam processos externos. Cada peça tem uma função própria e isso facilita manutenção.

6. Validação do passo.

Sem endpoint de consulta, MF5 não consegue criar UI real.

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

- Entrega para `BK-MF5-01`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF48 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `apps/api/src/modules/*` e `apps/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: reforçadas explicações pedagógicas e comentários sobre contagens, mensagens sanitizadas, roles e separação entre auditoria e logs de integração.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
