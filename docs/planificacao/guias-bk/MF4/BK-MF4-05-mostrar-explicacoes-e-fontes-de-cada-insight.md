# BK-MF4-05 - Mostrar explicações e fontes de cada insight.

## Header
- `doc_id`: `GUIA-BK-MF4-05`
- `bk_id`: `BK-MF4-05`
- `macro`: `MF4`
- `owner`: `Oleksii`
- `apoio`: `Sofia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF4-01`
- `rf_rnf`: `RF43`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-06`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-05-mostrar-explicacoes-e-fontes-de-cada-insight.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais tornar cada insight auditável para o utilizador final, mostrando explicação, origem dos dados e limites da recomendação.

#### Importância

RF43 é a regra de confiança da IA no OPSA. Sem explicação e fonte, a IA fica opaca e pedagogicamente perigosa.

#### Scope-in

- Criar endpoint `GET /api/ai/insights/:id/explanation`.
- Validar ownership por empresa ativa.
- Devolver explicação, fontes, período e aviso de não execução automática.
- Mostrar detalhe no frontend.
- Criar negativos para insight inexistente e insight de outra empresa.

#### Scope-out

- Não recalcular insights.
- Não criar novas sugestões.
- Não esconder fontes por conveniência.
- Não transformar explicação em parecer legal ou contabilístico oficial.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF43.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF43 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `BK-MF4-01`.
- Rever `apps/api/src/modules/auth`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions`.

#### Glossário

- **Explicação:** texto que diz como o insight foi calculado.
- **Origem dos dados:** modelo, relatório ou entidade concreta usada.
- **Limite da IA:** fronteira entre apoio à decisão e execução automática.

#### Conceitos teóricos essenciais

- Explicabilidade é requisito funcional em RF43 e RNF31.
- A fonte deve ser específica, não apenas “base de dados”.
- O backend verifica empresa e role antes de devolver detalhe.
- O texto deve avisar que a recomendação precisa de validação humana.

#### Arquitetura do BK

- Endpoint: `GET /api/ai/insights/:id/explanation`.
- Modelo consumido: `AiInsight` do BK-MF4-01.
- Service: `getInsightExplanation`.
- Frontend: detalhe do insight.
- Guards: iguais aos insights.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ai/aiExplanationService.js`
- EDITAR: `apps/api/src/modules/ai/aiInsightRoutes.js`
- EDITAR: `apps/web/src/lib/mf4Api.ts`
- CRIAR: `apps/web/src/pages/AiInsightExplanationPage.tsx`
- REVER: BK-MF4-01 e RNF31.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato de explicabilidade

1. Objetivo funcional do passo no contexto da app.

Ligar RF43 a RF39 e RNF31.

2. Ficheiros envolvidos:
    - REVER: RF43
    - REVER: RNF31
    - REVER: BK-MF4-01

3. Instruções do que fazer.

Define que cada insight visível precisa de explicação e fonte específica.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evidence deve citar RF43 e RNF31.

6. Validação do passo.

Explicação genérica sem fonte não é aceite.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Criar service de explicação

1. Objetivo funcional do passo no contexto da app.

Obter detalhe seguro de um insight.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/aiExplanationService.js`

3. Instruções do que fazer.

Procura por `id` e `companyId`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiExplanationService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Obtém explicação e fonte de um insight da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, insightId: string }} input Contexto.
 * @returns {Promise<object>} Detalhe explicável do insight.
 */
export async function getInsightExplanation(prisma, input) {
    // O filtro por id + companyId transforma "não existe" e "não pertence à empresa"
    // na mesma resposta 404, evitando fuga de informação entre empresas.
    const insight = await prisma.aiInsight.findFirst({ where: { id: input.insightId, companyId: input.companyId } });
    if (!insight) throw httpError(404, "INSIGHT_NOT_FOUND", "Insight não encontrado na empresa ativa");
    return {
        // A resposta separa conteúdo, fonte e guardrail para a UI conseguir
        // mostrar cada parte de forma clara ao utilizador.
        id: insight.id, title: insight.title, summary: insight.summary, explanation: insight.explanation,
        source: { type: insight.sourceType, id: insight.sourceId, label: insight.sourceLabel },
        suggestedAction: insight.suggestedAction,
        guardrail: "A IA recomenda e explica; a decisão e a execução pertencem a utilizadores autorizados.",
    };
}
```

5. Explicação do código.

Este service faz uma coisa pequena, mas muito importante: transforma um insight guardado numa resposta explicável. O filtro `id + companyId` garante que o utilizador só consegue consultar insights da empresa ativa. Se o ID existir noutra empresa, a resposta continua a ser `404`, para não revelar que esse registo existe.

A resposta separa `summary`, `explanation`, `source`, `suggestedAction` e `guardrail`. Isto ensina ao aluno que explicar IA não é apenas escrever uma frase simpática; é mostrar o raciocínio, a origem dos dados e o limite da ação permitida. O `source` tem tipo, id e label para permitir rastreabilidade real.

O `guardrail` repete a regra essencial da PAP: a IA recomenda e explica, mas não executa decisões. Esta frase deve aparecer no payload porque a UI e a defesa precisam de demonstrar que a limitação não está escondida num comentário do programador.

6. Validação do passo.

Insight existente devolve fonte estruturada.

7. Cenário negativo/erro esperado.

Insight de outra empresa deve devolver `404`.

### Passo 3 - Adicionar rota de explicação

1. Objetivo funcional do passo no contexto da app.

Expor detalhe por ID.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/ai/aiInsightRoutes.js`

3. Instruções do que fazer.

Adiciona `GET /insights/:id/explanation` ao router do BK-MF4-01.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiInsightRoutes.js
import { getInsightExplanation } from "./aiExplanationService.js";

// adicionar dentro de buildAiInsightRoutes, antes de `return router`
router.get("/insights/:id/explanation", guards, async (req, res) => {
    try {
        // `req.params.id` identifica o insight; `req.companyId` confirma ownership.
        // O aluno deve evitar endpoints que procuram apenas por id global.
        const explanation = await getInsightExplanation(prisma, { companyId: req.companyId, insightId: req.params.id });
        return res.status(200).json({ explanation });
    } catch (error) {
        return sendError(res, error);
    }
});
```

5. Explicação do código.

Esta rota mostra reutilização correta dentro da mesma macrofase. Como o BK-MF4-01 já criou e montou `buildAiInsightRoutes`, este BK não cria outro router nem outro `app.use`; acrescenta apenas uma rota ao módulo existente. Isto evita duplicação de endpoints e mantém o domínio de insights num único ficheiro.

Os `guards` continuam iguais aos da listagem de insights. Isso é importante porque o detalhe pode revelar explicações e fontes com valor de negócio. Um utilizador sem permissão para ver insights também não deve conseguir consultar a explicação por ID.

O service recebe `req.params.id` e `req.companyId` juntos. Esta combinação evita o erro comum de procurar por ID global e devolver dados de outra empresa. Para o aluno, esta é uma regra prática: sempre que um registo pertence a uma empresa, a query deve incluir a empresa ativa.

6. Validação do passo.

GET com ID válido devolve `200`.

7. Cenário negativo/erro esperado.

ID inexistente devolve `404 INSIGHT_NOT_FOUND`.

### Passo 4 - Criar detalhe no frontend

1. Objetivo funcional do passo no contexto da app.

Mostrar explicação e fonte ao aluno/utilizador.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/mf4Api.ts`
    - CRIAR: `apps/web/src/pages/AiInsightExplanationPage.tsx`

3. Instruções do que fazer.

Adiciona função e componente de consulta por ID ao `mf4Api.ts` cumulativo, sem repetir o cliente HTTP.

4. Código completo, correto e integrado com a app final.

```tsx
// função a adicionar em apps/web/src/lib/mf4Api.ts
export interface InsightExplanation {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  source: AiSourceReference;
  suggestedAction: string | null;
  guardrail: string;
}

/** Consulta explicação e fonte de um insight. */
export function getInsightExplanation(id: string) {
  // O id entra no caminho da URL, por isso é codificado para evitar caracteres
  // problemáticos e manter o pedido HTTP previsível.
  return client.request<{ explanation: InsightExplanation }>(
    "GET",
    "/ai/insights/" + encodeURIComponent(id) + "/explanation",
  );
}

// apps/web/src/pages/AiInsightExplanationPage.tsx
import { FormEvent, useState } from "react";
import { InsightExplanation, getInsightExplanation } from "../lib/mf4Api";

/** Mostra explicação e fonte de um insight RF43. */
export function AiInsightExplanationPage() {
  const [explanation, setExplanation] = useState<InsightExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = String(new FormData(event.currentTarget).get("id") ?? "");
    try {
      // A página apenas pede o detalhe; validação de ownership e permissões fica no backend.
      const result = await getInsightExplanation(id);
      setExplanation(result.explanation);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Explicação do insight</h2>
      <form onSubmit={submit}>
        <input name="id" required />
        <button>Consultar</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {explanation ? (
        <article>
          <h3>{explanation.title}</h3>
          <p>{explanation.summary}</p>
          <p>{explanation.explanation}</p>
          <p>{explanation.guardrail}</p>
          <small>{explanation.source.type}: {explanation.source.label}</small>
        </article>
      ) : null}
    </section>
  );
}
```

5. Explicação do código.

O tipo `InsightExplanation` obriga a página a tratar todos os elementos necessários para RF43: texto do insight, explicação, fonte, sugestão e guardrail. Isto torna o contrato visível no TypeScript e evita páginas que apenas imprimem uma resposta genérica.

A função `getInsightExplanation` usa `encodeURIComponent` porque o ID entra no URL. Mesmo que os IDs normais sejam UUIDs, este cuidado ensina o aluno a não concatenar input diretamente em caminhos HTTP sem codificação.

No componente, o utilizador escreve o ID e a UI pede o detalhe à API. A página não decide se o insight pertence à empresa; essa decisão continua no backend. Ao renderizar `guardrail` e `source`, o ecrã mostra que o insight é uma recomendação rastreável, não uma ação automática nem uma opinião sem prova.

6. Validação do passo.

Smoke: ID válido mostra `explanation.source`.

7. Cenário negativo/erro esperado.

ID inválido mostra erro claro.

### Passo 5 - Validar fontes obrigatórias

1. Objetivo funcional do passo no contexto da app.

Garantir que nenhum insight fica opaco.

2. Ficheiros envolvidos:
    - REVER: dados criados pelo BK-MF4-01

3. Instruções do que fazer.

Testa pelo menos um insight de margem e um insight de stock.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Todos devem ter `source.type`, `source.label` e `guardrail`.

6. Validação do passo.

Se a fonte vier vazia, corrige BK-MF4-01 antes de fechar RF43.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 6 - Preparar handoff para lembretes

1. Objetivo funcional do passo no contexto da app.

Fechar a parte de IA antes de RF44.

2. Ficheiros envolvidos:
    - REVER: BK-MF4-06

3. Instruções do que fazer.

Regista que RF44 começa fluxo operacional humano independente dos insights.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Handoff deve dizer que IA não cria lembretes automaticamente.

6. Validação do passo.

Criar lembrete automático a partir de insight fica fora deste BK.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 7 - Reforçar negativos de segurança

1. Objetivo funcional do passo no contexto da app.

Cobrir P0 com três negativos.

2. Ficheiros envolvidos:
    - REVER: evidence

3. Instruções do que fazer.

Executa negativos: sem sessão, role sem acesso, insight de outra empresa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Expected: `401`, `403`, `404` conforme cenário.

6. Validação do passo.

Não aceitar `200` para insight fora da empresa ativa.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 8 - Rever linguagem visível

1. Objetivo funcional do passo no contexto da app.

Garantir PT-PT e clareza.

2. Ficheiros envolvidos:
    - REVER: mensagens de erro e textos da página

3. Instruções do que fazer.

Mensagens devem explicar como resolver: iniciar sessão, escolher empresa, consultar ID válido.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evidence com screenshot/JSON de erro.

6. Validação do passo.

Mensagem técnica crua não cumpre RF43/RNF06.

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

- Entrega para `BK-MF4-06`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF43 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `apps/api/src/modules/*` e `apps/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: explicações do código e comentários didáticos reforçados para clarificar ownership, fonte, guardrail e reutilização do router de insights.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
