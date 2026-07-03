# BK-MF8-11 - IA não altera dados contabilísticos; apenas analisa e recomenda.

## Header

- `doc_id`: `GUIA-BK-MF8-11`
- `bk_id`: `BK-MF8-11`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF32`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-12`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-11-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais criar um gate que garante que a IA analisa e recomenda, mas não grava lançamentos, não aprova documentos e não executa ações financeiras.

#### Importância

A IA no OPSA é apoio à decisão. Esta fronteira é crítica para segurança, ética e defesa: o utilizador decide; o backend financeiro aplica regras; a IA nunca altera contabilidade.

#### Scope-in

- Criar política `apps/api/src/modules/ai/aiGovernancePolicy.js`.
- Bloquear action types que impliquem escrita financeira.
- Criar teste negativo contra aprovação, lançamento, alteração contabilística, pagamento e sugestão sem ação explícita.
- Documentar a diferença entre recomendação e execução.
- Integrar a política antes de persistir sugestões.

#### Scope-out

- Criar motor autónomo de decisão.
- Aprovar documentos por IA.
- Criar lançamentos contabilísticos por IA.
- Alterar permissões de utilizador.

#### Estado antes e depois

- Antes: MF0..MF7 já entregaram autenticação com cookies HttpOnly, empresa ativa no backend, permissões, dados mestre, vendas, compras, inventário, tesouraria, contabilidade, IA explicável, auditoria, hardening e gates de qualidade.
- Depois: `BK-MF8-11` deixa um contrato verificável para governança da IA, com evidence e negativos suficientes para continuar a MF8 sem adivinhação técnica.

#### Pre-requisitos

- Ler `RNF32` em `docs/RF.md` ou `docs/RNF.md`.
- Rever a linha de `BK-MF8-11` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-11` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever os BKs declarados em dependências: `-`.
- Confirmar que todos os caminhos do aluno usam `apps/api` ou `apps/web`.
- Negativos: mínimo `3`.

#### Glossário

- Recomendação: sugestão que o utilizador avalia.
- Ação automática: operação executada sem decisão humana.
- Governança: regra que limita o que a IA pode fazer.
- Escrita financeira: alteração em documentos, lançamentos, saldos ou períodos.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF32` é o requisito associado a `BK-MF8-11`.
- `CANONICO`: `BK-MF8-11` pertence à MF8, sprint `S12`, owner `Oleksii`, apoio `Pedro`, prioridade `P0` e próximo BK `BK-MF8-12`.
- `CANONICO`: a app dos alunos usa Node.js, Express, ES Modules, Prisma, React, Vite e TypeScript nos caminhos públicos `apps/api` e `apps/web`.
- `DERIVADO`: este guia transforma o requisito em ficheiros e testes pequenos, porque a MF8 é fase de hardening, qualidade final e fecho da PAP.

O domínio de governança da IA deve respeitar a regra transversal do OPSA: a empresa ativa vem do contexto autenticado no backend; permissões e roles são aplicadas no backend; a UI mostra estado e recolhe intenção, mas não decide ownership nem autorização final.

Quando este BK tocar IA, a IA explica, recomenda e mostra fonte; não altera dados contabilísticos, não aprova documentos e não executa ações automaticamente. Quando tocar contabilidade ou documentos financeiros, o guia distingue documento operacional, pagamento/recebimento e lançamento contabilístico.

#### Arquitetura do BK

- Requisito: `RNF32`.
- Domínio principal: governança da IA.
- Backend público dos alunos: `apps/api`.
- Frontend público dos alunos: `apps/web`.
- Prisma público dos alunos: `apps/api/prisma/schema.prisma`.
- Evidence: `docs/evidence/MF8/BK-MF8-11.md`.
- Handoff: `BK-MF8-12`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai/aiGovernancePolicy.js`
- CRIAR: `apps/api/tests/contracts/mf8-ai-governance.contract.test.js`
- EDITAR: `apps/api/src/modules/ai/aiService.js`
- REVER: `apps/api/src/modules/accounting`
- REVER: `apps/api/src/modules/sales-approval`
- REVER: `apps/api/src/modules/purchase-approval`

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

Confirma que `BK-MF8-11` continua associado a `RNF32`, prioridade `P0`, owner `Oleksii`, dependências `-` e próximo BK `BK-MF8-12`. Não alteres o header se a matriz e o backlog não mudaram.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e impede que a implementação avance com requisito, owner ou dependência trocados.

5. Explicação do código.

O contrato canónico vem de RF/RNF, matriz e backlog. A leitura inicial protege o aluno de resolver outro problema com o nome de `BK-MF8-11`.

6. Validação do passo.

O aluno consegue apontar a linha de `RNF32` e a linha de `BK-MF8-11` antes de editar qualquer ficheiro.

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
    - CRIAR/EDITAR: `apps/api/src/modules/ai/aiGovernancePolicy.js`
    - LOCALIZAÇÃO: ficheiro completo ou função completa indicada no passo

3. Instruções do que fazer.

Cria ou edita o contrato principal de governança da IA. Mantém JSDoc, comentários didáticos junto das decisões importantes e validação no backend sempre que houver input ou persistência.

4. Código completo, correto e integrado com a app final.

```js
const BLOCKED_AI_ACTIONS = new Set([
    "APPROVE_DOCUMENT",
    "POST_JOURNAL_ENTRY",
    "CHANGE_ACCOUNTING_DATA",
    "EXECUTE_PAYMENT",
]);

/**
 * Confirma que uma sugestão de IA é apenas recomendação segura.
 *
 * @param {{ actionType?: string }} suggestion - Sugestão calculada pela IA.
 * @throws {Error} Quando a sugestão tenta executar uma ação financeira/contabilística ou não declara actionType.
 * @returns {void}
 */
export function assertAiRecommendationOnly(suggestion) {
    // Validamos no backend para impedir que UI/scripts contornem a fronteira ética da IA.
    if (!suggestion || typeof suggestion.actionType !== "string" || suggestion.actionType.trim().length === 0) {
        throw new Error("A sugestão da IA precisa de indicar uma ação de recomendação.");
    }

    const actionType = suggestion.actionType.trim();

    // Estes tipos representam execução financeira; a IA só pode recomendar revisão humana.
    if (BLOCKED_AI_ACTIONS.has(actionType)) {
        throw new Error("A IA não pode executar ações financeiras ou contabilísticas.");
    }
}
```

5. Explicação do código.

Este código entrega o núcleo de `BK-MF8-11`: transforma o requisito `RNF32` em contrato executável, com nomes estáveis para os BKs seguintes. A entrada é uma sugestão de IA com `actionType`; a saída é silenciosa quando a sugestão continua a ser apenas recomendação. Se a sugestão não declarar ação ou tentar aprovar documentos, lançar contabilidade, alterar dados contabilísticos ou executar pagamentos, o backend falha cedo com erro claro. Esta fronteira reaproveita a explicabilidade preparada no `BK-MF8-10` e prepara o `BK-MF8-12` para criar alertas sem permitir execução automática.

6. Validação do passo.

Executa a verificação local do ficheiro ou revê imports. O resultado esperado é código formatado, sem dependências inexistentes e com comentários didáticos nos pontos de risco.

7. Cenário negativo/erro esperado.

Remove ou corrige qualquer chamada a função que não esteja criada neste BK ou em BK anterior.

### Passo 4 - Ligar o contrato à fronteira certa

1. Objetivo funcional do passo no contexto da app.

Ligar o contrato à fronteira certa.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/ai/aiService.js`
    - REVER: guards, permissões e persistência de sugestões de IA

3. Instruções do que fazer.

Liga o contrato ao ponto onde a app transforma insights em sugestões persistidas. Adiciona o import da política junto dos imports existentes e chama `assertAiRecommendationOnly` imediatamente depois de calcular `actionType`, antes do `upsert` de `AiActionSuggestion`.

4. Código completo, correto e integrado com a app final.

```js
import { assertAiRecommendationOnly } from "./aiGovernancePolicy.js";

/**
 * Cria sugestões de ação a partir de insights persistidos sem executar ações automaticamente.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string }} input - Contexto autenticado.
 * @returns {Promise<object[]>} Sugestões abertas para revisão humana.
 */
export async function generateAiSuggestions(prisma, input) {
    const insights = await prisma.aiInsight.findMany({
        where: { companyId: input.companyId, status: "OPEN" },
        orderBy: { generatedAt: "desc" },
        take: 50,
    });

    const suggestions = [];
    for (const insight of insights) {
        // Calculamos a intenção antes de escrever para bloquear ações automáticas no primeiro ponto seguro.
        const actionType = suggestionActionType(insight);
        assertAiRecommendationOnly({ actionType });

        // O upsert só grava uma sugestão para revisão humana; não aprova documentos nem cria lançamentos.
        suggestions.push(
            await prisma.aiActionSuggestion.upsert({
                where: {
                    companyId_insightId_actionType: {
                        companyId: input.companyId,
                        insightId: insight.id,
                        actionType,
                    },
                },
                update: {
                    title: insight.suggestedAction ?? "Rever indicador antes de agir",
                    rationale: insight.explanation,
                    sourceLabel: insight.sourceLabel,
                    status: "OPEN",
                    createdById: input.userId,
                },
                create: {
                    companyId: input.companyId,
                    insightId: insight.id,
                    actionType,
                    title: insight.suggestedAction ?? "Rever indicador antes de agir",
                    rationale: insight.explanation,
                    sourceLabel: insight.sourceLabel,
                    status: "OPEN",
                    createdById: input.userId,
                },
            }),
        );
    }

    return suggestions;
}
```

5. Explicação do código.

A separação entre contrato principal e service reduz duplicação. A função `suggestionActionType` continua responsável por escolher uma ação sugerida a partir do insight; `assertAiRecommendationOnly` valida essa escolha antes de existir escrita em `AiActionSuggestion`. Assim, a app pode guardar recomendações abertas para revisão humana, mas não cria pagamentos, lançamentos, aprovações ou alterações contabilísticas.

6. Validação do passo.

Confirma que `generateAiSuggestions` importa `assertAiRecommendationOnly`, chama a política antes do `upsert` e não recria a lista de bloqueio noutro ficheiro.

7. Cenário negativo/erro esperado.

Se a UI tentar decidir permissão final, ownership, empresa ativa ou se o service persistir uma sugestão proibida antes de validar `actionType`, o passo falha por quebra de segurança multiempresa e de governança da IA.

### Passo 5 - Criar teste ou gate mínimo

1. Objetivo funcional do passo no contexto da app.

Criar teste ou gate mínimo.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `apps/api/tests/contracts/mf8-ai-governance.contract.test.js`
    - EDITAR: `apps/api/package.json` ou `apps/web/package.json`

3. Instruções do que fazer.

Cria um teste ou gate pequeno, focado no contrato deste BK. Inclui positivo principal e negativos coerentes com prioridade `P0`.

4. Código completo, correto e integrado com a app final.

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertAiRecommendationOnly } from "../../src/modules/ai/aiGovernancePolicy.js";

test("RNF32 permite recomendações que não executam operações financeiras", () => {
    // Este positivo prova que uma recomendação de revisão continua permitida quando não executa finanças.
    assert.doesNotThrow(() => assertAiRecommendationOnly({ actionType: "REVIEW_CASHFLOW" }));
});

test("RNF32 bloqueia ações automáticas da IA", () => {
    const blockedActionTypes = [
        "APPROVE_DOCUMENT",
        "POST_JOURNAL_ENTRY",
        "CHANGE_ACCOUNTING_DATA",
        "EXECUTE_PAYMENT",
    ];

    // Cada ação proibida representa uma fronteira que a IA não pode atravessar sem decisão humana.
    for (const actionType of blockedActionTypes) {
        assert.throws(
            () => assertAiRecommendationOnly({ actionType }),
            /A IA não pode executar ações financeiras ou contabilísticas\./,
        );
    }
});

test("RNF32 rejeita sugestão sem tipo de ação explícito", () => {
    assert.throws(
        () => assertAiRecommendationOnly({}),
        /A sugestão da IA precisa de indicar uma ação de recomendação\./,
    );
});
```

5. Explicação do código.

O teste não substitui revisão manual, mas dá prova repetível. O primeiro caso confirma que a IA pode recomendar revisão de tesouraria. O segundo caso cobre quatro negativos de execução automática: aprovar documento, criar lançamento, alterar dados contabilísticos e executar pagamento. O terceiro caso impede sugestões ambíguas sem tipo de ação. O comentário didático dentro do código mostra que o teste protege uma regra de produto, não apenas uma linha de implementação.

6. Validação do passo.

Comando recomendado: `cd apps/api && node --test tests/contracts/mf8-ai-governance.contract.test.js` e depois `npm run test:contracts`. Negativos: mínimo `3`.

7. Cenário negativo/erro esperado.

Se o teste só verifica que um ficheiro existe, acrescenta pelo menos um assert sobre comportamento, entrada inválida ou bloqueio esperado.

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
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-11.md`
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

Resume o que ficou entregue, que ficheiros o próximo BK deve consumir e que riscos não foram fechados. O próximo BK declarado é `BK-MF8-12`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O handoff é a ponte entre entregas incrementais da app.

5. Explicação do código.

O OPSA é construído por BKs encadeados. Um bom handoff evita que o aluno seguinte reinvente contratos ou quebre decisões já tomadas.

6. Validação do passo.

A secção final confirma o próximo BK recomendado como `BK-MF8-12` e lista evidence mínima.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de ficheiro que este BK prometeu mas não criou, volta ao passo onde esse contrato deveria ter sido entregue.

#### Critérios de aceite

- O guia preserva header, owner, prioridade, dependências, requisito e próximo BK definidos pela matriz e pelo backlog.
- Os caminhos publicados para alunos usam apenas `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` ou `docs/evidence`.
- O contrato principal de governança da IA tem JSDoc, comentários didáticos e validação explícita.
- Existem positivos e pelo menos 3 negativos coerentes com `RNF32`.
- A evidence mostra comando, resultado esperado, resultado observado e decisão tomada.
- Não há pagamentos reais, fornecedores externos não documentados, ações automáticas da IA ou dados de outra empresa.

#### Validação final

Executa os comandos relevantes para este BK:

```bash
cd apps/api
npm run syntax:check
node --test tests/contracts/mf8-ai-governance.contract.test.js
npm run test:contracts
```

Se o BK tocar frontend, executa também:

```bash
cd apps/web
npm run typecheck
```

Expected results:

- Código sem erro de sintaxe.
- Testes ou gates do BK verdes.
- Negativos controlados e documentados.
- Sem caminhos privados nos ficheiros entregues aos alunos.

#### Evidence para PR/defesa

- Comando positivo executado.
- Output do teste ou gate.
- Negativos executados.
- Ficheiros criados/editados.
- Screenshot ou payload API se existir UI.
- Decisão `CANONICO` ou `DERIVADO` mais importante do BK.

#### Handoff

- Próximo BK recomendado: `BK-MF8-12`
- Contrato entregue: governança da IA ligado a `RNF32` e aplicado antes de persistir sugestões.
- Ficheiro principal: `apps/api/src/modules/ai/aiGovernancePolicy.js`.
- Integração principal: `apps/api/src/modules/ai/aiService.js`.
- Teste/evidence principal: `apps/api/tests/contracts/mf8-ai-governance.contract.test.js`.
- Risco a vigiar: não alargar o BK para requisitos fora da MF8 nem prometer integrações externas não documentadas.

#### Changelog

- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
- `2026-07-02`: guia corrigido com integração concreta no service, validação explícita de `actionType`, negativos suficientes e acentuação PT-PT.
- `2026-07-02`: comentários didáticos reforçados nos blocos longos de service e teste contratual.
