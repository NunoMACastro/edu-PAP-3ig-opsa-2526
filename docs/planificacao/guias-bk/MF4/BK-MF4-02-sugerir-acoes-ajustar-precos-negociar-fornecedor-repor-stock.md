# BK-MF4-02 - Sugerir ações (ajustar preços, negociar fornecedor, repor stock).

## Header
- `doc_id`: `GUIA-BK-MF4-02`
- `bk_id`: `BK-MF4-02`
- `macro`: `MF4`
- `owner`: `Sofia`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF4-01`
- `rf_rnf`: `RF40`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-03`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-02-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais transformar insights já gerados em sugestões de ação claras, sempre como recomendação explicável e nunca como alteração automática.

#### Importância

RF40 ajuda o gestor a decidir se deve rever preços, falar com fornecedores ou repor stock. O valor pedagógico está em distinguir recomendação de execução.

#### Scope-in

- Criar modelo `AiActionSuggestion` ligado a `AiInsight`.
- Criar endpoint `GET /api/ai/suggestions` para listar sugestões abertas.
- Classificar ações em `PRICE_REVIEW`, `SUPPLIER_NEGOTIATION` e `STOCK_REPLENISHMENT`.
- Manter fonte e justificação herdadas do insight.
- Mostrar sugestões no frontend.

#### Scope-out

- Não alterar preços de artigos.
- Não criar encomendas ou compras automáticas.
- Não enviar emails a fornecedores.
- Não aprovar documentos.

#### Estado antes e depois

- Estado antes: a MF3 já fornece relatórios, tesouraria, stock, importações e SAF-T, mas este BK ainda não entrega o fluxo específico de RF40.
- Estado depois: o aluno implementa o contrato deste BK com backend protegido, dados por empresa, validação e evidence objetiva.

#### Pre-requisitos

- Ler RF40 em `docs/RF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar dependências canónicas: `BK-MF4-01`.
- Rever `apps/api/src/modules/auth`, `apps/api/src/modules/companies/companyContext.js` e `apps/api/src/modules/permissions`.

#### Glossário

- **Sugestão:** recomendação que ajuda a decidir, sem executar a ação.
- **Ação operacional:** passo humano posterior, como rever preço ou contactar fornecedor.
- **Guardrail:** regra que impede a IA de passar de recomendação para execução.

#### Conceitos teóricos essenciais

- Sugestões usam insights persistidos no BK-MF4-01.
- O backend mantém autorização e empresa ativa.
- O aluno deve perceber que uma recomendação não é uma ordem automática.
- Cada sugestão precisa de motivo e fonte para ser defensável.

#### Arquitetura do BK

- Endpoint: `GET /api/ai/suggestions`.
- Modelo novo: `AiActionSuggestion`.
- Service: `buildActionSuggestions`.
- Fonte principal: `AiInsight`.
- Frontend: lista simples de sugestões abertas.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`
- CRIAR: `apps/api/src/modules/ai/aiSuggestionService.js`
- CRIAR: `apps/api/src/modules/ai/aiSuggestionRoutes.js`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/lib/mf4Api.ts`
- CRIAR: `apps/web/src/pages/AiSuggestionsPage.tsx`
- REVER: BK-MF4-01.

#### Tutorial técnico linear

### Passo 1 - Confirmar que a sugestão não executa ações

1. Objetivo funcional do passo no contexto da app.

Fixar o limite funcional de RF40.

2. Ficheiros envolvidos:
    - REVER: RF40
    - REVER: BK-MF4-01

3. Instruções do que fazer.

Marca como `CANONICO` que RF40 pede sugerir ações. Marca como `DERIVADO` a lista fechada de tipos MVP.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Evidence deve mostrar que não há endpoint de alteração de preços ou stock neste BK.

6. Validação do passo.

Uma sugestão que altera dados deve ser rejeitada no desenho.

7. Cenário negativo/erro esperado.

Se o aluno não conseguir demonstrar este passo com evidence objetiva, o BK não deve ser fechado.

### Passo 2 - Modelar sugestões

1. Objetivo funcional do passo no contexto da app.

Guardar recomendações ligadas a insights.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`

3. Instruções do que fazer.

Adiciona `AiActionSuggestion` com relação real a `AiInsight` por `insightId` e com chave única para não duplicar sugestões quando a consulta é repetida.

4. Código completo, correto e integrado com a app final.

```prisma
// campos a acrescentar em modelos existentes
model Company {
  aiActionSuggestions AiActionSuggestion[]
}

model User {
  aiActionSuggestions AiActionSuggestion[] @relation("UserAiActionSuggestions")
}

model AiInsight {
  actionSuggestions AiActionSuggestion[]
}

/// Sugestão de ação criada a partir de um insight.
/// Representa recomendação humana, não execução automática.
model AiActionSuggestion {
  id            String   @id @default(uuid())
  companyId     String
  insightId     String
  actionType    String
  title         String
  rationale     String
  sourceLabel   String
  status        String   @default("OPEN")
  createdById   String
  createdAt     DateTime @default(now())

  company   Company   @relation(fields: [companyId], references: [id])
  insight   AiInsight @relation(fields: [insightId], references: [id])
  createdBy User      @relation("UserAiActionSuggestions", fields: [createdById], references: [id])

  @@index([companyId, actionType, status])
  @@index([companyId, insightId])
  @@unique([companyId, insightId, actionType])
}
```

5. Explicação do código.

A sugestão guarda a razão e a fonte. Não tem campos para executar preço, compra ou stock. A relação real com `AiInsight` protege a origem e ajuda o aluno a navegar do insight para a recomendação.

6. Validação do passo.

Prisma deve validar o modelo e índices.

7. Cenário negativo/erro esperado.

Se a sugestão não tiver `sourceLabel`, a defesa não consegue provar origem.

### Passo 3 - Criar service de sugestões

1. Objetivo funcional do passo no contexto da app.

Transformar insights abertos em recomendações.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/aiSuggestionService.js`

3. Instruções do que fazer.

Mapeia tipos de insight para ações permitidas.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiSuggestionService.js
const actionByInsight = {
    NEGATIVE_MARGIN: "PRICE_REVIEW",
    LOW_STOCK: "STOCK_REPLENISHMENT",
    STOPPED_ITEM: "SUPPLIER_NEGOTIATION",
};

/**
 * Cria sugestões a partir de insights abertos da empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma.
 * @param {{ companyId: string, userId: string }} input Contexto autenticado.
 * @returns {Promise<object[]>} Sugestões abertas.
 */
export async function buildActionSuggestions(prisma, input) {
    // Só usamos insights abertos da empresa ativa. Um insight fechado já foi tratado
    // ou deixou de ser relevante, por isso não deve gerar nova sugestão.
    const insights = await prisma.aiInsight.findMany({ where: { companyId: input.companyId, status: "OPEN" } });
    const suggestions = [];
    for (const insight of insights) {
        const actionType = actionByInsight[insight.type];
        // Se o tipo não estiver mapeado, o sistema fica silencioso em vez de inventar
        // uma ação. Este é um guardrail simples contra recomendações sem fundamento.
        if (!actionType) continue;
        suggestions.push(
            // A chave única impede duplicar a mesma sugestão para o mesmo insight.
            // O aluno deve reconhecer este padrão sempre que uma consulta materializa dados.
            await prisma.aiActionSuggestion.upsert({
                where: {
                    companyId_insightId_actionType: {
                        companyId: input.companyId,
                        insightId: insight.id,
                        actionType,
                    },
                },
                update: {
                    title: insight.suggestedAction ?? "Rever insight antes de decidir",
                    rationale: insight.explanation,
                    sourceLabel: insight.sourceLabel,
                    status: "OPEN",
                    createdById: input.userId,
                },
                create: {
                    companyId: input.companyId,
                    insightId: insight.id,
                    actionType,
                    title: insight.suggestedAction ?? "Rever insight antes de decidir",
                    rationale: insight.explanation,
                    sourceLabel: insight.sourceLabel,
                    createdById: input.userId,
                },
            }),
        );
    }
    return suggestions;
}
```

5. Explicação do código.

Este service transforma insights em sugestões de ação, mas mantém uma fronteira muito clara: sugerir não é executar. `PRICE_REVIEW`, `STOCK_REPLENISHMENT` e `SUPPLIER_NEGOTIATION` são categorias de recomendação para leitura humana; nenhuma delas atualiza preços, cria compras ou mexe no inventário.

O objeto `actionByInsight` funciona como uma tabela de decisão simples. Para alunos, esta é uma forma segura de começar: cada tipo de insight conhecido tem uma resposta previsível, e qualquer tipo desconhecido é ignorado. Ignorar dados desconhecidos é melhor do que inventar uma recomendação sem fonte.

Tal como no BK anterior, o `upsert` é usado para evitar duplicados. Se o gestor abrir a página várias vezes, a sugestão continua a ser a mesma entidade lógica, atualizada com a explicação e a fonte mais recentes. O `companyId` mantém o isolamento multiempresa e `createdById` mostra quem pediu a geração.

6. Validação do passo.

Com um insight `LOW_STOCK`, espera-se ação `STOCK_REPLENISHMENT`.

7. Cenário negativo/erro esperado.

Insight sem tipo reconhecido não deve criar sugestão inventada.

### Passo 4 - Expor rota de sugestões

1. Objetivo funcional do passo no contexto da app.

Permitir consulta protegida.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/ai/aiSuggestionRoutes.js`
    - EDITAR: `apps/api/src/server.js`

3. Instruções do que fazer.

Monta `/api/ai/suggestions` com os mesmos guards de IA.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ai/aiSuggestionRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { buildActionSuggestions } from "./aiSuggestionService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // Mantém o contrato de erro igual ao BK-MF4-01 para a UI tratar falhas
    // de forma consistente em todos os ecrãs de IA.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de suggestions. */
export function buildAiSuggestionRoutes({ prisma }) {
    const router = Router();
    const guards = [
        // Sugestões são decisões de apoio à gestão, por isso a role é mais restrita
        // do que uma consulta operacional comum.
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REPORTS_READ),
        requireRole("ADMIN", "GESTOR"),
    ];

    router.get("/suggestions", guards, async (req, res) => {
        try {
            // A empresa e o utilizador vêm dos middlewares; a UI não controla ownership.
            const suggestions = await buildActionSuggestions(prisma, { companyId: req.companyId, userId: req.user.id });
            return res.status(200).json({ suggestions });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

```js
// apps/api/src/server.js
import { buildAiSuggestionRoutes } from "./modules/ai/aiSuggestionRoutes.js";

app.use("/api/ai", buildAiSuggestionRoutes({ prisma }));
```

5. Explicação do código.

A rota reutiliza o mesmo desenho do BK-MF4-01 para os alunos perceberem o padrão: middleware primeiro, regra de negócio depois, resposta JSON no fim. Isto evita controllers soltos e facilita testar autorização, porque todas as permissões estão visíveis antes do handler.

O `requireRole("ADMIN", "GESTOR")` limita a leitura de sugestões a perfis que podem tomar decisões de gestão. Um operacional pode executar tarefas no ERP, mas isso não significa que deva ver recomendações estratégicas. Esta separação ajuda a explicar que autorização não é só “estar autenticado”.

Montar o router no mesmo prefixo `/api/ai` mantém a API organizada: insights, sugestões, perguntas e alertas ficam no domínio de IA assistiva, sem misturar com vendas, compras ou inventário.

6. Validação do passo.

GET autenticado deve devolver `{ suggestions: [...] }`.

7. Cenário negativo/erro esperado.

Role não autorizada deve receber `403 ROLE_FORBIDDEN`.

### Passo 5 - Criar consulta no frontend

1. Objetivo funcional do passo no contexto da app.

Mostrar sugestões abertas.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/mf4Api.ts`
    - CRIAR: `apps/web/src/pages/AiSuggestionsPage.tsx`

3. Instruções do que fazer.

Adiciona a função ao `apps/web/src/lib/mf4Api.ts` criado no BK-MF4-01, sem repetir o import e o cliente HTTP inicial.

4. Código completo, correto e integrado com a app final.

```tsx
// adicionar em apps/web/src/lib/mf4Api.ts
export interface AiActionSuggestion {
  id: string;
  insightId: string;
  actionType: string;
  title: string;
  rationale: string;
  sourceLabel: string;
  status: string;
}

/** Consulta sugestões de ação geradas a partir dos insights abertos. */
export function getAiSuggestions() {
  // O endpoint não recebe filtros por empresa. O backend usa a empresa ativa
  // guardada na sessão para escolher os insights e sugestões corretos.
  return client.request<{ suggestions: AiActionSuggestion[] }>("GET", "/ai/suggestions");
}

// apps/web/src/pages/AiSuggestionsPage.tsx
import { useState } from "react";
import { AiActionSuggestion, getAiSuggestions } from "../lib/mf4Api";

/** Página MF4 para Sugestões de ação. */
export function AiSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<AiActionSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const result = await getAiSuggestions();
      // Guardamos apenas o array tipado que a página vai renderizar.
      // Não há JSON bruto porque cada campo tem significado pedagógico.
      setSuggestions(result.suggestions);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro inesperado");
    }
  }

  return (
    <section className="panel">
      <h2>Sugestões de ação</h2>
      <button type="button" onClick={load}>Consultar</button>
      {error ? <p className="error">{error}</p> : null}
      {suggestions.length === 0 ? <p>Sem sugestões abertas.</p> : null}
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <strong>{suggestion.title}</strong>
            <p>{suggestion.rationale}</p>
            <small>{suggestion.actionType} · {suggestion.sourceLabel}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicação do código.

O frontend acrescenta apenas os tipos e a função que faltam ao `mf4Api.ts` já criado no BK anterior. Isto é intencional: o ficheiro é cumulativo, e o aluno deve evitar repetir imports ou criar outro cliente HTTP para cada ecrã.

Na página, `suggestions` guarda objetos `AiActionSuggestion`, não `unknown[]`. Isto obriga a UI a renderizar campos com significado: `title` mostra a recomendação, `rationale` mostra o porquê, `actionType` classifica a ação e `sourceLabel` liga a sugestão ao insight original. Esta leitura ajuda o aluno a defender o fluxo sem depender de JSON bruto.

O botão “Consultar” dispara uma leitura protegida. Se a sessão expirou ou a role não tem acesso, a mensagem de erro vem do backend e aparece no ecrã. Assim o aluno vê que autorização e UX trabalham juntas.

6. Validação do passo.

A página deve mostrar actionType, rationale e sourceLabel.

7. Cenário negativo/erro esperado.

Sem sessão, mostrar erro da API.

### Passo 6 - Validar negativos e handoff

1. Objetivo funcional do passo no contexto da app.

Garantir que RF40 não virou automação.

2. Ficheiros envolvidos:
    - REVER: evidence do BK

3. Instruções do que fazer.

Testa role sem acesso e confirma que nenhum endpoint altera preço, compra ou stock.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Expected: `403` para role sem acesso; sugestões com fonte; nenhuma mutação operacional.

6. Validação do passo.

Se a sugestão criar compra automaticamente, o BK falha.

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

- Entrega para `BK-MF4-03`: endpoint, modelos, campos e riscos indicados neste guia.
- Decisão `CANONICO`: RF40 define o requisito funcional deste BK.
- Decisão `DERIVADO`: os nomes técnicos dos novos módulos seguem a estrutura real `apps/api/src/modules/*` e `apps/web/src/*`.
- Risco restante: se a implementação real já tiver divergido, registar drift no PR antes de adaptar caminhos.

#### Changelog

- `2026-06-16`: explicações do código e comentários didáticos reforçados para clarificar sugestão vs execução, roles, idempotência e cliente frontend cumulativo.
- `2026-06-15`: guia reestruturado e completado para a estrutura final da MF4, com teoria, passos técnicos, código integrado, segurança multiempresa, validações e evidence.
