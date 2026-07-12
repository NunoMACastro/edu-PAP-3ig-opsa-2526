# BK-MF8-10 - Insights devem incluir explicação e origem dos dados usados.

> **Atualização IA v2:** explicações incluem evidência estruturada, fórmula, período, `asOf`, contagens, qualidade, limitações e `sourceRefs`. A OpenAI não produz claims; todos os factos e fontes são compostos pelo backend. Ver [`../SINCRONIZACAO-IA-V2.md`](../SINCRONIZACAO-IA-V2.md).

## Header

- `doc_id`: `GUIA-BK-MF8-10`
- `bk_id`: `BK-MF8-10`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF31`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-11`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-10-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais reforçar os insights da IA para que cada resultado tenha explicação clara e origem dos dados usados.

#### Importância

Num ERP financeiro, uma recomendação sem fonte não é defendível. O aluno deve conseguir mostrar de onde veio o insight e que regra simples o gerou.

#### Scope-in

- Rever `apps/api/src/modules/ai/aiService.js`.
- Garantir `explanation`, `sourceType`, `sourceId` e `sourceLabel` em todos os insights.
- Criar validação para bloquear insight sem fonte.
- Confirmar o endpoint protegido `GET /api/ai/insights/:id/explanation` montado em `/api/ai`.
- Criar teste de contrato com positivo, rota e negativos mínimos de explicabilidade.

#### Scope-out

- Criar IA generativa nova.
- Alterar dados contabilísticos automaticamente.
- Inventar fonte sem registo real.
- Usar dados de outra empresa.

#### Estado antes e depois

- Antes: MF0..MF7 já entregaram autenticação com cookies HttpOnly, empresa ativa no backend, permissões, dados mestre, vendas, compras, inventário, tesouraria, contabilidade, IA explicável, auditoria, hardening e gates de qualidade.
- Depois: `BK-MF8-10` deixa um contrato verificável para explicabilidade da IA, com evidence e negativos suficientes para continuar a MF8 sem adivinhação técnica.

#### Pre-requisitos

- Ler `RNF31` em `docs/RF.md` ou `docs/RNF.md`.
- Rever a linha de `BK-MF8-10` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-10` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever os BKs declarados em dependências: `-`.
- Confirmar que todos os caminhos do aluno usam `apps/api` ou `apps/web`.
- Negativos: mínimo `3`.

#### Glossário

- Insight: análise calculada a partir de dados OPSA.
- Explicação: texto que diz por que o insight existe.
- Origem: entidade ou cálculo que sustentou o insight.
- Fonte rastreável: identificador que permite rever o dado base.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF31` é o requisito associado a `BK-MF8-10`.
- `CANONICO`: `BK-MF8-10` pertence à MF8, sprint `S12`, owner `Oleksii`, apoio `Andre`, prioridade `P0` e próximo BK `BK-MF8-11`.
- `CANONICO`: a app dos alunos usa Node.js, Express, ES Modules, Prisma, React, Vite e TypeScript nos caminhos públicos `apps/api` e `apps/web`.
- `DERIVADO`: este guia transforma o requisito em ficheiros e testes pequenos, porque a MF8 é fase de hardening, qualidade final e fecho da PAP.

O domínio de explicabilidade da IA deve respeitar a regra transversal do OPSA: a empresa ativa vem do contexto autenticado no backend; permissões e roles são aplicadas no backend; a UI mostra estado e recolhe intenção, mas não decide ownership nem autorização final.

Quando este BK tocar IA, a IA explica, recomenda e mostra fonte; não altera dados contabilísticos, não aprova documentos e não executa ações automaticamente. Quando tocar contabilidade ou documentos financeiros, o guia distingue documento operacional, pagamento/recebimento e lançamento contabilístico.

#### Arquitetura do BK

- Requisito: `RNF31`.
- Domínio principal: explicabilidade da IA.
- Backend público dos alunos: `apps/api`.
- Frontend público dos alunos: `apps/web`.
- Prisma público dos alunos: `apps/api/prisma/schema.prisma`.
- Endpoint reforçado: `GET /api/ai/insights/:id/explanation`.
- Guardas esperados: sessão autenticada, empresa ativa resolvida no backend e permissão de leitura de IA.
- Evidence: `docs/evidence/MF8/BK-MF8-10.md`.
- Handoff: `BK-MF8-11`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/tests/contracts/mf8-ai-explainability.contract.test.js`
- EDITAR: `apps/api/src/modules/ai/aiService.js`
- REVER/EDITAR: `apps/api/src/modules/ai/aiRoutes.js`
- REVER: `apps/api/src/server.js`
- REVER: `apps/api/prisma/schema.prisma`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar contrato canónico.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

Confirma que `BK-MF8-10` continua associado a `RNF31`, prioridade `P0`, owner `Oleksii`, dependências `-` e próximo BK `BK-MF8-11`. Não alteres o header se a matriz e o backlog não mudaram.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e impede que a implementação avance com requisito, owner ou dependência trocados.

5. Explicação do código.

O contrato canónico vem de RF/RNF, matriz e backlog. A leitura inicial protege o aluno de resolver outro problema com o nome de `BK-MF8-10`.

6. Validação do passo.

O aluno consegue apontar a linha de `RNF31` e a linha de `BK-MF8-10` antes de editar qualquer ficheiro.

7. Cenário negativo/erro esperado.

Se o header do guia divergir da matriz ou do backlog, a implementação deve parar até o drift ser resolvido.

### Passo 2 - Mapear integração com a app existente

1. Objetivo funcional do passo no contexto da app.

Mapear integração com a app existente.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - REVER: `apps/api/src/modules`
    - REVER: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: módulos e páginas que o BK consome ou prepara

3. Instruções do que fazer.

Identifica os contratos já entregues pelas MFs anteriores que este BK deve respeitar: sessão por cookie HttpOnly, empresa ativa no backend, permissões, auditoria, módulos financeiros e cliente API central.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de inventário técnico e evita criar endpoints duplicados ou nomes que não encaixam com a app.

5. Explicação do código.

Não há código porque a decisão principal é reutilizar fronteiras existentes. A MF8 fecha a app; não deve reabrir arquitetura sem necessidade.

6. Validação do passo.

A lista de ficheiros a criar, editar e rever fica coerente com os caminhos públicos `apps/api` e `apps/web`.

7. Cenário negativo/erro esperado.

Se o plano tentar usar caminho privado ou aceitar empresa ativa a partir do browser, corrige a arquitetura antes de avançar.

### Passo 3 - Implementar o contrato principal

1. Objetivo funcional do passo no contexto da app.

Implementar o contrato principal.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `apps/api/src/modules/ai/aiService.js`
    - LOCALIZAÇÃO: ficheiro completo ou função completa indicada no passo

3. Instruções do que fazer.

Cria ou edita o contrato principal de explicabilidade da IA. Mantém JSDoc, comentários didáticos junto das decisões importantes e validação no backend sempre que houver input ou persistência.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida que um insight pode ser defendido com explicação e fonte.
 *
 * @param {{ title?: string, explanation?: string, sourceType?: string, sourceId?: string, sourceLabel?: string }} insight - Insight candidato ou persistido.
 * @returns {void}
 * @throws {Error} Quando o insight não tem campos mínimos de explicabilidade.
 */
export function assertExplainableInsight(insight) {
    const missing = ["title", "explanation", "sourceType", "sourceId", "sourceLabel"].filter((key) => !insight[key]?.trim?.());
    if (missing.length > 0) {
        throw new Error(`Insight sem explicabilidade mínima: ${missing.join(", ")}`);
    }

    // A explicação deve ser suficientemente concreta para defesa e não apenas uma frase genérica.
    if (insight.explanation.trim().length < 40) {
        throw new Error("Explicação do insight demasiado curta.");
    }
}

/**
 * Devolve uma explicação segura de um insight da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, insightId: string }} input - Empresa autenticada e identificador do insight.
 * @returns {Promise<object>} Explicação, fonte e limite de atuação da IA.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando o insight não existe na empresa ativa.
 */
export async function explainAiInsight(prisma, input) {
    const insight = await prisma.aiInsight.findFirst({
        // O companyId vem da sessão/contexto backend e impede leitura de insights de outra empresa.
        where: { id: input.insightId, companyId: input.companyId },
    });

    if (!insight) {
        throw httpError(404, "AI_INSIGHT_NOT_FOUND", "Insight não encontrado");
    }

    assertExplainableInsight(insight);

    return {
        id: insight.id,
        title: insight.title,
        explanation: insight.explanation,
        source: {
            type: insight.sourceType,
            id: insight.sourceId,
            label: insight.sourceLabel,
        },
        // O guardrail aparece no payload para a UI e a defesa mostrarem que a IA recomenda, mas não executa.
        guardrail: "A IA explica e recomenda; não executa alterações automaticamente.",
    };
}
```

5. Explicação do código.

Este código entrega o núcleo de `BK-MF8-10`: transforma o requisito `RNF31` em contrato executável, com nomes estáveis para os BKs seguintes. `assertExplainableInsight` falha cedo quando falta título, explicação ou fonte; `explainAiInsight` liga essa regra ao dado persistido e filtra sempre por empresa ativa.

O filtro `id + companyId` evita fuga de informação entre empresas: se um insight existir noutra empresa, a resposta continua a ser `404`. O `guardrail` reforça a decisão de domínio: a IA explica e recomenda, mas não altera contabilidade, não aprova documentos e não executa ações automáticas.

6. Validação do passo.

Executa a verificação local do ficheiro ou revê imports. O resultado esperado é código formatado, sem dependências inexistentes, com `httpError` importado uma única vez e com comentários didáticos nos pontos de risco.

7. Cenário negativo/erro esperado.

Remove ou corrige qualquer chamada a função que não esteja criada neste BK ou em BK anterior.

### Passo 4 - Ligar o contrato à fronteira certa

1. Objetivo funcional do passo no contexto da app.

Ligar o contrato à fronteira certa.

2. Ficheiros envolvidos:
    - REVER/EDITAR: `apps/api/src/modules/ai/aiRoutes.js`
    - REVER: `apps/api/src/server.js`
    - REVER: guards, permissões e cliente API

3. Instruções do que fazer.

Liga o contrato ao ponto de entrada correto. Neste BK não cries um endpoint paralelo: confirma ou ajusta a rota canónica `GET /api/ai/insights/:id/explanation`, dentro do router de IA montado em `/api/ai`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiRoutes.js
router.get("/insights/:id/explanation", baseGuards, async (req, res) => {
    try {
        const explanation = await explainAiInsight(prisma, {
            // A empresa ativa é resolvida pelos guards no backend; nunca vem do body ou query string.
            companyId: req.companyId,
            insightId: req.params.id,
        });

        return res.status(200).json({ explanation });
    } catch (error) {
        return sendError(res, error);
    }
});
```

5. Explicação do código.

A rota fica dentro do domínio de IA e herda `baseGuards`, que devem incluir autenticação, contexto de empresa ativa e permissão de leitura de IA. O caminho público completo fica `GET /api/ai/insights/:id/explanation`, porque `apps/api/src/server.js` monta o router em `/api/ai`.

A separação entre service e route reduz duplicação: o service valida explicabilidade e ownership; a route transforma o pedido HTTP numa chamada segura ao service. Assim o aluno sabe onde vive a regra e onde a aplicação apenas a invoca.

6. Validação do passo.

Confirma que `apps/api/src/server.js` contém `app.use("/api/ai", buildAiRoutes({ prisma }))` e que a rota interna é `"/insights/:id/explanation"`. O expected result é `200` com `{ explanation: { id, title, explanation, source, guardrail } }` para insight da empresa ativa e `404 AI_INSIGHT_NOT_FOUND` para insight inexistente ou de outra empresa.

7. Cenário negativo/erro esperado.

Se a UI tentar decidir permissão final, ownership ou empresa ativa, o passo falha por quebra de segurança multiempresa.

### Passo 5 - Criar teste ou gate mínimo

1. Objetivo funcional do passo no contexto da app.

Criar teste ou gate mínimo.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `apps/api/tests/contracts/mf8-ai-explainability.contract.test.js`
    - REVER: `apps/api/package.json`

3. Instruções do que fazer.

Cria um teste pequeno, focado no contrato deste BK. Inclui positivo principal, confirmação da rota e negativos coerentes com prioridade `P0`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/contracts/mf8-ai-explainability.contract.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAiRoutes } from "../../src/modules/ai/aiRoutes.js";
import {
    assertExplainableInsight,
} from "../../src/modules/ai/aiService.js";

function hasRoute(router, method, path) {
    return router.stack.some(
        (layer) => layer.route?.path === path && layer.route.methods[method],
    );
}

const validInsight = {
    title: "Risco de margem",
    explanation: "A regra compara margem operacional com receita do relatório financeiro da empresa ativa.",
    sourceType: "OperationalReportRun",
    sourceId: "run-1",
    sourceLabel: "Relatório operacional",
};

test("RNF31 aceita insight com explicação e origem rastreável", () => {
    assert.doesNotThrow(() => assertExplainableInsight(validInsight));
});

test("RNF31 bloqueia explicabilidade incompleta", () => {
    // Estes negativos protegem a defesa: um insight sem fonte ou explicação concreta não é auditável.
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, explanation: "" }),
        /explanation/,
    );
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, explanation: "Curta." }),
        /demasiado curta/,
    );
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, sourceId: "" }),
        /sourceId/,
    );
    assert.throws(
        () => assertExplainableInsight({ ...validInsight, sourceLabel: "" }),
        /sourceLabel/,
    );
});

test("RNF31 expõe a rota canónica de explicação de insight", () => {
    const router = buildAiRoutes({ prisma: {} });

    // A rota interna fica sem /api/ai porque o server.js é quem monta esse prefixo público.
    assert.equal(hasRoute(router, "get", "/insights/:id/explanation"), true);
});
```

5. Explicação do código.

O teste não substitui revisão manual, mas dá prova repetível. O primeiro caso prova que um insight completo passa. O segundo caso contém quatro negativos: falta de explicação, explicação curta, falta de identificador de fonte e falta de nome legível da fonte. O terceiro caso confirma que o router expõe a rota interna que, montada em `/api/ai`, produz o endpoint público `GET /api/ai/insights/:id/explanation`.

6. Validação do passo.

Comando recomendado: `cd apps/api && node --test tests/contracts/mf8-ai-explainability.contract.test.js`. Depois executa `npm run test:contracts`, que cobre `tests/contracts/*.test.js` e inclui este ficheiro. Negativos: mínimo `3`.

7. Cenário negativo/erro esperado.

Se o teste só verifica que um ficheiro existe, acrescenta pelo menos um assert sobre comportamento, payload ou bloqueio esperado.

### Passo 6 - Validar segurança, domínio e mensagens

1. Objetivo funcional do passo no contexto da app.

Validar segurança, domínio e mensagens.

2. Ficheiros envolvidos:
    - REVER: ficheiros editados neste BK
    - REVER: `docs/RF.md` e `docs/RNF.md`
    - LOCALIZAÇÃO: regras de validação e mensagens visíveis

3. Instruções do que fazer.

Revê validação backend, autorização, auditoria, textos PT-PT e separação de domínios. Em fluxos de IA, confirma explicação e fonte. Em fluxos financeiros, não confundas documento, pagamento, recebimento e lançamento.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A validação é uma revisão dirigida sobre o código criado nos passos anteriores.

5. Explicação do código.

Este passo evita que uma solução tecnicamente compilável introduza risco de segurança, privacidade ou domínio financeiro.

6. Validação do passo.

O guia deve conseguir explicar que dados entram, que dados saem, quem autoriza, que erro é devolvido e que evidence prova o fluxo.

7. Cenário negativo/erro esperado.

Se houver log com dados sensíveis, ação financeira automática da IA ou promessa de integração externa não documentada, o BK não pode fechar.

### Passo 7 - Registar evidence para PR ou defesa

1. Objetivo funcional do passo no contexto da app.

Registar evidence para PR ou defesa.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-10.md`
    - REVER: output dos comandos executados

3. Instruções do que fazer.

Regista comando, resultado esperado, resultado observado, negativo executado e decisão tomada. Não inventes outputs: escreve apenas o que foi executado ou deixa campo explícito para preencher no PR.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A evidence é documental e deve conter outputs reais quando a equipa executar o BK.

5. Explicação do código.

Evidence liga implementação a avaliação. Também ajuda o próximo BK a perceber que contratos ficaram prontos e que riscos ainda existem.

6. Validação do passo.

A evidence identifica o BK, requisito, comando, resultado positivo, negativo e handoff.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas 'funciona', está incompleta; falta prova objetiva.

### Passo 8 - Preparar handoff para o próximo BK

1. Objetivo funcional do passo no contexto da app.

Preparar handoff para o próximo BK.

2. Ficheiros envolvidos:
    - REVER: secção `Handoff` deste guia
    - REVER: guia do próximo BK
    - LOCALIZAÇÃO: contratos exportados e riscos abertos

3. Instruções do que fazer.

Resume o que ficou entregue, que ficheiros o próximo BK deve consumir e que riscos não foram fechados. O próximo BK declarado é `BK-MF8-11`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O handoff é a ponte entre entregas incrementais da app.

5. Explicação do código.

O OPSA é construído por BKs encadeados. Um bom handoff evita que o aluno seguinte reinvente contratos ou quebre decisões já tomadas.

6. Validação do passo.

A secção final confirma o próximo BK recomendado como `BK-MF8-11` e lista evidence mínima.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de ficheiro que este BK prometeu mas não criou, volta ao passo onde esse contrato deveria ter sido entregue.

#### Critérios de aceite

- O guia preserva header, owner, prioridade, dependências, requisito e próximo BK definidos pela matriz e pelo backlog.
- Os caminhos publicados para alunos usam apenas `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` ou `docs/evidence`.
- O contrato principal de explicabilidade da IA tem JSDoc, comentários didáticos e validação explícita.
- Existem positivos e pelo menos 3 negativos coerentes com `RNF31`.
- O endpoint público esperado é `GET /api/ai/insights/:id/explanation`, com empresa ativa resolvida no backend e sem empresa aceite do browser.
- A evidence mostra comando, resultado esperado, resultado observado e decisão tomada.
- Não há pagamentos reais, fornecedores externos não documentados, ações automáticas da IA ou dados de outra empresa.

#### Validação final

Executa os comandos relevantes para este BK:

```bash
cd apps/api
npm run syntax:check
node --test tests/contracts/mf8-ai-explainability.contract.test.js
npm run test:contracts
```

Se o BK tocar frontend, executa também:

```bash
cd apps/web
npm run typecheck
```

Expected results:

- Código sem erro de sintaxe.
- Teste específico `mf8-ai-explainability.contract.test.js` verde.
- Suite `test:contracts` verde, confirmando que o ficheiro novo entra na glob `tests/contracts/*.test.js`.
- Pelo menos três negativos controlados e documentados.
- Sem caminhos privados nos ficheiros entregues aos alunos.

#### Evidence para PR/defesa

- Comando positivo executado.
- Output do teste ou gate.
- Pelo menos três negativos executados.
- Ficheiros criados/editados.
- Screenshot ou payload API se existir UI.
- Decisão `CANONICO` ou `DERIVADO` mais importante do BK.

#### Handoff

- Próximo BK recomendado: `BK-MF8-11`
- Contrato entregue: explicabilidade da IA ligada a `RNF31`, com endpoint, service e teste de contrato verificáveis.
- Ficheiro principal: `apps/api/src/modules/ai/aiService.js`.
- Teste/evidence principal: `apps/api/tests/contracts/mf8-ai-explainability.contract.test.js`.
- Risco a vigiar: não alargar o BK para requisitos fora da MF8 nem prometer integrações externas não documentadas.

#### Changelog

- `2026-07-02`: corrigida a ronda `corrigir_apenas` para explicitar endpoint, guards, payload esperado, negativos mínimos, comentário didático no teste e acentuação PT-PT.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
