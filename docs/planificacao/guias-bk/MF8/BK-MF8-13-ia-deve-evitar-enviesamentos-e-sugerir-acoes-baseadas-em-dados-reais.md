# BK-MF8-13 - IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.

> **Atualização IA v2:** o catálogo fechado e os `facts` criados pelo backend impõem grounding. Perguntas fora do domínio são recusadas; narrativa externa com números, referências ou schema inválido aciona fallback determinístico. O corpus PT-PT cobre mais de 100 pedidos. Ver [`../SINCRONIZACAO-IA-V2.md`](../SINCRONIZACAO-IA-V2.md).

## Header

- `doc_id`: `GUIA-BK-MF8-13`
- `bk_id`: `BK-MF8-13`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF34`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-14`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-13-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md`
- `last_updated`: `2026-07-02`

#### Objetivo

Neste BK vais implementar um guardrail de qualidade para sugestões de IA. A aplicação só deve apresentar uma sugestão quando ela nascer de uma fonte real, rastreável, filtrada pela empresa ativa e acompanhada de uma limitação honesta.

#### Importância

Uma sugestão de IA sem fonte real pode parecer convincente, mas levar a uma decisão errada. No OPSA, a IA ajuda a analisar dados; não aprova documentos, não cria lançamentos contabilísticos, não altera preços e não executa pagamentos. Este BK reforça essa fronteira com código e testes.

#### Scope-in

- Criar `apps/api/src/modules/ai/aiSourceGuardrails.js`.
- Validar `sourceType`, `sourceId`, `sourceLabel`, `companyId`, `explanation` e `actionType`.
- Integrar o guardrail em `generateAiSuggestions` antes de gravar ou devolver sugestões.
- Reutilizar os contratos de explicabilidade e recomendação segura dos BKs anteriores.
- Criar teste de contrato com positivo e negativos de fonte ausente, fonte incompleta e contexto multiempresa ausente.
- Registar evidence objetiva para PR ou defesa.

#### Scope-out

- Criar métricas estatísticas avançadas de enviesamento.
- Prometer modelo externo de IA.
- Criar nova persistência Prisma para score ético.
- Criar provider de IA.
- Alterar dados contabilísticos, aprovar documentos ou executar ações automaticamente.
- Reescrever a UI do próximo BK.

#### Estado antes e depois

- Antes: `BK-MF8-10` já ensinou explicabilidade com fonte e filtro por empresa ativa; `BK-MF8-11` já ensinou que a IA só recomenda e não executa ações financeiras ou contabilísticas.
- Depois: `BK-MF8-13` acrescenta uma fronteira verificável de qualidade das fontes antes da sugestão ser apresentada, mantendo a empresa ativa no backend e deixando evidence para a defesa.

#### Pre-requisitos

- Ler `RNF34` em `docs/RNF.md`.
- Rever `BK-MF8-10`, porque ele entrega explicação e origem dos insights.
- Rever `BK-MF8-11`, porque ele entrega a regra de recomendação sem execução automática.
- Rever a linha de `BK-MF8-13` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-13` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Confirmar que todos os caminhos publicados usam `apps/api`, `apps/web` ou `docs/evidence`.
- Negativos mínimos: `3`.

#### Glossário

- Enviesamento: tendência que pode distorcer uma recomendação por usar poucos dados, dados desatualizados ou apenas uma família de fontes.
- Fonte real: registo OPSA identificável por `sourceType`, `sourceId` e `sourceLabel`, filtrado pela empresa ativa no backend.
- Empresa ativa: empresa resolvida pela sessão e pelos middlewares do backend. O browser não escolhe esta empresa.
- Limitação: aviso honesto sobre fragilidade dos dados usados.
- Confiança qualitativa: classificação simples (`low`, `medium` ou `high`) para ajudar a defesa e a UI a mostrar prudência.
- Guardrail: regra de segurança ou governança que impede a IA de ultrapassar o seu papel.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF34` pede que a IA evite enviesamentos e sugira ações baseadas em dados reais.
- `CANONICO`: `BK-MF8-13` pertence à MF8, sprint `S12`, owner `Oleksii`, apoio `Pedro`, prioridade `P1`, esforço `S`, dependências `-` e próximo BK `BK-MF8-14`.
- `CANONICO`: a app dos alunos usa Node.js, Express, ES Modules, Prisma, React, Vite e TypeScript nos caminhos públicos `apps/api` e `apps/web`.
- `DERIVADO`: a qualidade de fontes fica num ficheiro próprio, `aiSourceGuardrails.js`, para não duplicar a regra entre geração de insights, sugestões e testes.

**IA explicável.** Um insight ou sugestão só é defensável se disser de onde veio. No OPSA, a origem pode ser um relatório operacional, KPI executivo, documento de venda em aberto, previsão de tesouraria ou alerta de stock. Sem origem, a IA não deve falar com confiança.

**Dados reais e empresa ativa.** O `companyId` usado no service vem da rota protegida e do contexto autenticado. O frontend nunca envia `companyId` para decidir ownership. Esta regra evita que uma empresa veja ou use dados de outra.

**Enviesamento operacional.** Este BK não cria matemática avançada. O objetivo é reduzir riscos simples e frequentes: fonte vazia, fonte sem identificador, explicação demasiado curta, sugestão baseada numa única família de dados ou sugestão sem ação explícita.

**Recomendação, não execução.** A IA pode sugerir "rever stock" ou "rever tesouraria". A decisão humana continua fora da IA: não há aprovação automática, lançamento contabilístico, pagamento ou alteração financeira.

**Testes e evidence.** O teste prova que o guardrail bloqueia entradas fracas e aceita uma sugestão com origem rastreável. A evidence mostra o comando executado, os negativos e o resultado esperado.

#### Arquitetura do BK

- Requisito: `RNF34`.
- Domínio principal: ética, qualidade de fontes e governança de IA.
- Backend público dos alunos: `apps/api`.
- Ficheiro novo: `apps/api/src/modules/ai/aiSourceGuardrails.js`.
- Ficheiro integrado: `apps/api/src/modules/ai/aiService.js`.
- Teste: `apps/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js`.
- Evidence: `docs/evidence/MF8/BK-MF8-13.md`.
- Handoff: `BK-MF8-14`.

O fluxo fica assim:

1. A rota protegida de IA resolve sessão, empresa ativa e permissões no backend.
2. `generateAiSuggestions` lê insights `OPEN` da empresa ativa.
3. O service calcula `actionType`.
4. `assertAiRecommendationOnly` confirma que a IA continua a recomendar e não executa.
5. `assertAiSourceQuality` confirma que a sugestão tem fonte rastreável e limitação honesta.
6. O service grava ou atualiza a sugestão e devolve `sourceQuality` para a UI/evidence.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai/aiSourceGuardrails.js`
- CRIAR: `apps/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js`
- EDITAR: `apps/api/src/modules/ai/aiService.js`
- REVER: `apps/api/src/modules/ai/aiGovernancePolicy.js`
- REVER: `apps/api/src/modules/ai/aiRoutes.js`
- REVER: `apps/api/package.json`
- CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-13.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar que vais corrigir o requisito certo e que não vais alterar owner, prioridade, dependências ou sequência da MF8.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linha de `RNF34` e linhas de `BK-MF8-13`.

3. Instruções do que fazer.

Confirma que `RNF34` continua a dizer que a IA deve evitar enviesamentos e sugerir ações baseadas em dados reais. Confirma também que `BK-MF8-13` continua em `MF8`, sprint `S12`, owner `Oleksii`, apoio `Pedro`, prioridade `P1`, esforço `S`, sem dependências formais e com próximo BK `BK-MF8-14`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e evita corrigir outro requisito por engano.

5. Explicação do código.

Não há código porque a decisão importante é canónica. O aluno deve aprender que um BK não começa por escrever ficheiros; começa por confirmar o contrato funcional e pedagógico que vai cumprir.

6. Validação do passo.

O resultado esperado é conseguir apontar `RNF34` e a linha de `BK-MF8-13` na matriz/backlog sem alterar nenhum documento canónico.

7. Cenário negativo/erro esperado.

Se o header do guia divergir da matriz ou do backlog, para a implementação e regista drift antes de continuar.

### Passo 2 - Mapear os contratos de IA já entregues

1. Objetivo funcional do passo no contexto da app.

Identificar o que este BK consome dos BKs anteriores para não duplicar serviços nem criar uma fronteira paralela de IA.

2. Ficheiros envolvidos:
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-10-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-11-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md`
    - REVER: `apps/api/src/modules/ai/aiService.js`
    - REVER: `apps/api/src/modules/ai/aiRoutes.js`
    - LOCALIZAÇÃO: função `generateAiSuggestions` e imports do módulo de IA.

3. Instruções do que fazer.

Confirma estes contratos:

- `BK-MF8-10` entrega fonte, explicação e filtro por empresa ativa para insights.
- `BK-MF8-11` entrega `assertAiRecommendationOnly` para bloquear ações automáticas.
- `generateAiSuggestions` é o ponto correto para aplicar `RNF34`, porque é aí que a aplicação transforma insights em sugestões.
- A rota `GET /api/ai/suggestions` já deve receber `companyId` de `req.companyId`, não do frontend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de inventário técnico e prepara a integração segura no passo seguinte.

5. Explicação do código.

Não há código porque o objetivo é não inventar uma segunda arquitetura. O guardrail de fontes deve entrar no service que já gera sugestões, logo depois da validação de "recomendação apenas" e antes da persistência.

6. Validação do passo.

O resultado esperado é uma lista curta dos contratos consumidos: `assertAiRecommendationOnly`, `generateAiSuggestions`, `sourceType`, `sourceId`, `sourceLabel`, `explanation`, `suggestedAction` e `companyId` vindo do backend.

7. Cenário negativo/erro esperado.

Se criares uma rota nova só para cumprir este BK, vais duplicar responsabilidades. O correto é reforçar a fronteira já usada pelo módulo de IA.

### Passo 3 - Criar o guardrail de qualidade das fontes

1. Objetivo funcional do passo no contexto da app.

Criar uma função reutilizável que classifica a qualidade da fonte e bloqueia sugestões sem dados reais rastreáveis.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/aiSourceGuardrails.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `aiSourceGuardrails.js` com o código completo abaixo. Este ficheiro não consulta a base de dados; ele valida o objeto já produzido a partir de insights filtrados por empresa ativa no service.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiSourceGuardrails.js
const MIN_EXPLANATION_LENGTH = 40;

const TRUSTED_SOURCE_TYPES = new Set([
    "OperationalReportRun",
    "ExecutiveKpiRun",
    "SaleDocument",
    "StockAlertSetting",
    "CashflowForecastRun",
]);

/**
 * Normaliza texto técnico recebido de uma fonte de IA.
 *
 * @param {unknown} value - Valor vindo do insight ou da sugestão.
 * @returns {string} Texto aparado, ou string vazia quando o valor não é texto.
 */
function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Classifica a qualidade das fontes usadas por uma sugestão de IA.
 *
 * @param {{ companyId?: string, sourceType?: string, sourceId?: string, sourceLabel?: string, explanation?: string, actionType?: string }} input - Dados já filtrados pelo backend.
 * @returns {{ confidence: "low" | "medium" | "high", limitation: string, source: { type: string, id: string, label: string } }} Metadados de qualidade para a UI/evidence.
 * @throws {Error} Quando a sugestão não tem fonte real suficiente.
 */
export function classifyAiSourceQuality(input) {
    const companyId = cleanText(input?.companyId);
    const sourceType = cleanText(input?.sourceType);
    const sourceId = cleanText(input?.sourceId);
    const sourceLabel = cleanText(input?.sourceLabel);
    const explanation = cleanText(input?.explanation);
    const actionType = cleanText(input?.actionType);

    if (!companyId) {
        throw new Error("A empresa ativa é obrigatória para avaliar uma sugestão de IA.");
    }

    if (!sourceType || !sourceId || !sourceLabel) {
        throw new Error("A IA não deve sugerir ações sem fonte real rastreável.");
    }

    if (!actionType) {
        throw new Error("A sugestão da IA precisa de indicar a ação recomendada.");
    }

    if (explanation.length < MIN_EXPLANATION_LENGTH) {
        throw new Error("A explicação da sugestão é demasiado curta para defesa.");
    }

    const limitations = [];
    if (!TRUSTED_SOURCE_TYPES.has(sourceType)) {
        limitations.push("Fonte não está na lista de famílias OPSA revistas; requer validação humana.");
    }

    // Uma só fonte pode ser válida, mas deve ser apresentada com prudência para reduzir enviesamento.
    limitations.push("Sugestão baseada numa família de dados; confirma o contexto antes de decidir.");

    return {
        confidence: TRUSTED_SOURCE_TYPES.has(sourceType) ? "medium" : "low",
        limitation: limitations.join(" "),
        source: {
            type: sourceType,
            id: sourceId,
            label: sourceLabel,
        },
    };
}

/**
 * Bloqueia sugestões sem fonte real e devolve metadados para a resposta pública.
 *
 * @param {{ companyId?: string, sourceType?: string, sourceId?: string, sourceLabel?: string, explanation?: string, actionType?: string }} input - Dados da sugestão candidata.
 * @returns {{ confidence: "low" | "medium" | "high", limitation: string, source: { type: string, id: string, label: string } }} Resultado de qualidade.
 */
export function assertAiSourceQuality(input) {
    return classifyAiSourceQuality(input);
}
```

5. Explicação do código.

Este ficheiro transforma `RNF34` numa regra executável. A entrada é a sugestão candidata já construída pelo backend: empresa ativa, fonte, explicação e ação sugerida. A saída é `confidence`, `limitation` e `source`, que a API pode devolver à UI ou guardar na evidence.

O `companyId` é obrigatório porque a regra de qualidade só faz sentido depois de a rota ter resolvido a empresa ativa. `sourceType`, `sourceId` e `sourceLabel` impedem sugestões sem origem defendível. `actionType` liga este BK ao `BK-MF8-11`, onde a IA foi limitada a recomendação. A explicação mínima liga este BK ao `BK-MF8-10`, onde cada insight passou a precisar de explicação e fonte.

A lista `TRUSTED_SOURCE_TYPES` não inventa uma fonte externa; apenas enumera famílias já usadas no OPSA. Mesmo quando a fonte é conhecida, a confiança fica `medium`, porque uma única família de dados não deve ser apresentada como verdade absoluta.

6. Validação do passo.

Confirma que o ficheiro exporta `classifyAiSourceQuality` e `assertAiSourceQuality`, que não importa código de frontend e que todas as mensagens visíveis estão em português de Portugal.

7. Cenário negativo/erro esperado.

Chamar `assertAiSourceQuality({ companyId: "c1", sourceType: "", sourceId: "1", sourceLabel: "Relatório", explanation: "Texto suficiente para defesa.", actionType: "REVIEW_CASHFLOW" })` deve lançar erro sobre fonte real rastreável.

### Passo 4 - Integrar o guardrail no service de sugestões

1. Objetivo funcional do passo no contexto da app.

Aplicar o guardrail no ponto em que o OPSA transforma insights em sugestões, antes de devolver a resposta à UI.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/ai/aiService.js`
    - REVER: `apps/api/src/modules/ai/aiGovernancePolicy.js`
    - LOCALIZAÇÃO: imports do módulo de IA e função completa `generateAiSuggestions`.

3. Instruções do que fazer.

Adiciona o import de `assertAiSourceQuality` junto dos imports do módulo de IA. Depois substitui a função `generateAiSuggestions` pela versão completa abaixo. Mantém a chamada a `assertAiRecommendationOnly` criada no `BK-MF8-11`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiService.js
import { assertAiRecommendationOnly } from "./aiGovernancePolicy.js";
import { assertAiSourceQuality } from "./aiSourceGuardrails.js";

/**
 * Cria sugestões de ação a partir de insights persistidos e filtrados por empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string }} input - Contexto autenticado vindo da rota protegida.
 * @returns {Promise<object[]>} Sugestões abertas para revisão humana, com qualidade de fonte.
 */
export async function generateAiSuggestions(prisma, input) {
    const insights = await prisma.aiInsight.findMany({
        // O companyId vem dos guards do backend; o frontend não escolhe a empresa consultada.
        where: { companyId: input.companyId, status: "OPEN" },
        orderBy: { generatedAt: "desc" },
        take: 50,
    });

    const suggestions = [];
    for (const insight of insights) {
        const actionType = suggestionActionType(insight);
        assertAiRecommendationOnly({ actionType });

        // A qualidade da fonte é validada antes de gravar a sugestão para evitar código morto no guardrail.
        const sourceQuality = assertAiSourceQuality({
            companyId: input.companyId,
            sourceType: insight.sourceType,
            sourceId: insight.sourceId,
            sourceLabel: insight.sourceLabel,
            explanation: insight.explanation,
            actionType,
        });

        // O upsert continua a guardar apenas a recomendação humana; a IA não executa a ação sugerida.
        const suggestion = await prisma.aiActionSuggestion.upsert({
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
        });

        suggestions.push({
            ...suggestion,
            sourceQuality,
            guardrail: "A IA recomenda com fonte rastreável; a decisão continua humana.",
        });
    }

    return suggestions;
}
```

5. Explicação do código.

Esta função é o ponto certo para cumprir `RNF34`, porque trabalha sobre insights já persistidos e filtrados por empresa. Primeiro lê apenas insights `OPEN` da empresa ativa. Depois calcula `actionType`, chama `assertAiRecommendationOnly` para preservar `BK-MF8-11` e chama `assertAiSourceQuality` antes do `upsert`.

Os dados que entram são `companyId` e `userId` vindos da rota protegida. Os dados que saem são sugestões abertas com `sourceQuality` e `guardrail`. A validação impede fonte vazia, explicação curta, ação ausente e contexto de empresa ausente. O erro evitado é ter um ficheiro de guardrail que passa nos testes mas nunca é usado pela aplicação.

O aluno pode adaptar a lista de famílias de fonte no ficheiro do passo anterior se novas fontes forem criadas por BKs futuros. Não deve aceitar `companyId` vindo do body, não deve remover `assertAiRecommendationOnly` e não deve gravar ações automáticas.

6. Validação do passo.

Confirma que `generateAiSuggestions` importa `assertAiSourceQuality`, chama esse guardrail antes do `upsert` e devolve `sourceQuality` em cada sugestão. O expected result de `GET /api/ai/suggestions` continua a ser `200`, mas cada item deve incluir metadados de qualidade da fonte.

7. Cenário negativo/erro esperado.

Se um insight `OPEN` não tiver `sourceId`, a chamada a `generateAiSuggestions` deve falhar com erro sobre fonte real rastreável e não deve criar uma sugestão nova.

### Passo 5 - Criar teste de contrato para RNF34

1. Objetivo funcional do passo no contexto da app.

Provar que o guardrail aceita uma sugestão com fonte rastreável e bloqueia casos fracos antes da defesa.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js`
    - REVER: `apps/api/package.json`
    - LOCALIZAÇÃO: ficheiro completo de teste.

3. Instruções do que fazer.

Cria o teste abaixo. Não alteres `apps/api/package.json` se ele já tiver `test:contracts` a executar `tests/contracts/*.test.js`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertAiSourceQuality } from "../../src/modules/ai/aiSourceGuardrails.js";

const validSuggestionSource = {
    companyId: "company-1",
    sourceType: "OperationalReportRun",
    sourceId: "report-1",
    sourceLabel: "Relatório operacional MF3",
    explanation: "A regra compara margem operacional com receita do relatório financeiro da empresa ativa.",
    actionType: "REVIEW_CASHFLOW",
};

test("RNF34 aceita sugestão baseada em fonte real da empresa ativa", () => {
    const quality = assertAiSourceQuality(validSuggestionSource);

    assert.equal(quality.confidence, "medium");
    assert.equal(quality.source.type, "OperationalReportRun");
    assert.match(quality.limitation, /família de dados/);
});

test("RNF34 bloqueia sugestão sem fonte rastreável", () => {
    // Sem identificador de fonte, a defesa não consegue provar de onde veio a recomendação.
    assert.throws(
        () => assertAiSourceQuality({ ...validSuggestionSource, sourceId: "" }),
        /fonte real rastreável/,
    );
});

test("RNF34 bloqueia sugestão sem empresa ativa", () => {
    // A empresa ativa deve vir dos guards do backend para impedir mistura de dados entre empresas.
    assert.throws(
        () => assertAiSourceQuality({ ...validSuggestionSource, companyId: "" }),
        /empresa ativa/,
    );
});

test("RNF34 bloqueia sugestão com explicação fraca", () => {
    // Uma explicação curta pode esconder enviesamento ou falta de dados reais.
    assert.throws(
        () => assertAiSourceQuality({ ...validSuggestionSource, explanation: "Margem baixa." }),
        /demasiado curta/,
    );
});
```

5. Explicação do código.

O primeiro teste prova o cenário positivo: existe empresa ativa, fonte real, identificador, nome legível, explicação e ação recomendada. A confiança fica `medium` porque a sugestão continua baseada numa família de dados e deve ser revista por uma pessoa.

Os três negativos cobrem as falhas mais importantes de `RNF34`: fonte sem identificador, ausência de empresa ativa e explicação fraca. Os comentários dentro do código explicam a razão pedagógica de cada bloqueio.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js
npm run test:contracts
```

O expected result é todos os testes verdes. O comando `npm run test:contracts` deve incluir este ficheiro porque a suite cobre `tests/contracts/*.test.js`.

7. Cenário negativo/erro esperado.

Se removeres `sourceId` do caso positivo e o teste continuar verde, o guardrail não está a cumprir `RNF34`.

### Passo 6 - Validar segurança, domínio e mensagens

1. Objetivo funcional do passo no contexto da app.

Garantir que a correção não mistura empresas, não permite ações automáticas e não promete capacidades de IA fora do contrato da PAP.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/ai/aiSourceGuardrails.js`
    - REVER: `apps/api/src/modules/ai/aiService.js`
    - REVER: `apps/api/src/modules/ai/aiRoutes.js`
    - LOCALIZAÇÃO: imports, query por empresa ativa e resposta pública de sugestões.

3. Instruções do que fazer.

Revê estes pontos:

- `generateAiSuggestions` filtra insights por `companyId` vindo da rota protegida.
- O body ou query string não escolhem empresa ativa.
- `assertAiRecommendationOnly` continua antes da persistência.
- `assertAiSourceQuality` corre antes do `upsert`.
- As mensagens de erro estão em português de Portugal.
- A resposta pública mostra limitação e fonte, não uma ordem automática.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é uma revisão dirigida do código criado nos passos 3 a 5.

5. Explicação do código.

A revisão é necessária porque este BK toca IA, segurança e multiempresa. Um código que compila mas aceite fontes inventadas ou empresa enviada pelo frontend continua inseguro.

6. Validação do passo.

O resultado esperado é conseguir explicar: que dados entram, que dados saem, onde a empresa ativa é aplicada, onde a sugestão é bloqueada e que negativos provam o bloqueio.

7. Cenário negativo/erro esperado.

Se encontrares `companyId` lido do body ou query para escolher empresa ativa, a solução falha. A empresa ativa deve vir do backend.

### Passo 7 - Registar evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Documentar a prova técnica e deixar claro o que o próximo BK pode assumir.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-13.md`
    - REVER: `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md`
    - LOCALIZAÇÃO: evidence e secção `Handoff` deste guia.

3. Instruções do que fazer.

Cria ou atualiza a evidence com este conteúdo mínimo:

- `bk`: `BK-MF8-13`
- `requisito`: `RNF34`
- `comando`: `cd apps/api && node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js`
- `resultado_esperado`: testes positivos e negativos verdes
- `negativos`: sem fonte rastreável, sem empresa ativa, explicação fraca
- `decisao`: IA recomenda com fonte e limitação; decisão humana mantém-se obrigatória
- `handoff`: próximo BK pode tratar UI sabendo que sugestões devem expor `sourceQuality`

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A evidence é documental e deve conter outputs reais quando a equipa executar os comandos.

5. Explicação do código.

Não há código porque o objetivo é rastreabilidade. A evidence ajuda a defesa a mostrar que a regra de ética da IA foi validada com negativos, não apenas descrita em texto.

6. Validação do passo.

A evidence deve indicar comando, resultado esperado, resultado observado, negativos executados e ficheiros criados/editados. Se o comando ainda não tiver sido executado na máquina do aluno, o campo `resultado_observado` deve ficar explícito para preenchimento no PR.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas "funciona", está incompleta. Deve mostrar que a sugestão sem fonte, sem empresa ativa e com explicação fraca falha de forma controlada.

#### Critérios de aceite

- O header preserva `BK-MF8-13`, `RNF34`, owner, apoio, prioridade, esforço, sprint, dependências e próximo BK.
- O guia usa apenas caminhos públicos `apps/api`, `apps/web` e `docs/evidence`.
- `apps/api/src/modules/ai/aiSourceGuardrails.js` existe e exporta `classifyAiSourceQuality` e `assertAiSourceQuality`.
- `generateAiSuggestions` chama `assertAiRecommendationOnly` e `assertAiSourceQuality` antes de devolver a sugestão.
- A empresa ativa vem do backend, através de `companyId` resolvido pela rota protegida.
- O teste de contrato tem um positivo e pelo menos três negativos.
- Não há ação financeira, contabilística ou operacional automática executada pela IA.
- A resposta pública de sugestões inclui limitação ou qualidade da fonte.
- A evidence contém comando, expected result, resultado observado e negativos.

#### Validação final

Executa os comandos relevantes para este BK:

```bash
cd apps/api
node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js
npm run test:contracts
```

Depois executa a validação global de documentação a partir da raiz do projeto:

```bash
bash scripts/validate-planificacao.sh
```

Expected results:

- O teste `mf8-ai-source-guardrails.contract.test.js` fica verde.
- `npm run test:contracts` inclui o novo ficheiro.
- O validador de planificação não deve reportar novo link partido causado por este BK.
- Não existem caminhos privados no guia.
- Os negativos sem fonte, sem empresa ativa e com explicação fraca falham de forma controlada.

#### Evidence para PR/defesa

- `pr`: referência do PR ou entrega onde o BK foi implementado.
- `proof`: output de `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js`.
- `neg`: sem fonte rastreável, sem empresa ativa, explicação fraca.
- `fonte`: `RNF34`, matriz canónica, backlog e contrato de campos.
- `multiempresa`: prova de que `companyId` vem do backend e não do frontend.
- `decisao`: `DERIVADO` criar `aiSourceGuardrails.js` como fronteira pequena e reutilizável.
- Ficheiro principal: `docs/evidence/MF8/BK-MF8-13.md`.

#### Handoff

Este BK entrega ao próximo trabalho:

- ficheiro `apps/api/src/modules/ai/aiSourceGuardrails.js`;
- export `assertAiSourceQuality`;
- integração em `generateAiSuggestions`;
- resposta pública com `sourceQuality`;
- teste `apps/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js`;
- regra de que a IA recomenda com fonte e limitação, mas a decisão continua humana;
- prova de que a empresa ativa vem do backend.

Próximo BK recomendado: `BK-MF8-14 - Aproximação da UI à UI do mockup`.

#### Changelog

- `2026-07-02`: guia consolidado para integrar qualidade de fontes no service real de IA, consumir os contratos de BK10/BK11, acrescentar negativos suficientes e corrigir acentuação PT-PT.
