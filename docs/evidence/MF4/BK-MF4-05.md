Passo 1
* BK: BK-MF4-05
* Macrofase: MF4
* Requisito funcional: RF43
* Dependência: BK-MF3-07 - CANONICO
* Sprint: S08-S09
* Próximo BK: BK-MF4-05
* Endpoint previsto: GET /api/ai/insights/:id/explanation

Passo 2
Ficheiros criados:
- apps/api/src/modules/ai/aiExplanationService.js

Regras implementadas:
- procura AiInsight por id e companyId;
- insight inexistente devolve 404 INSIGHT_NOT_FOUND;
- insight de outra empresa também devolve 404 INSIGHT_NOT_FOUND;
- resposta inclui id, title, summary e explanation;
- resposta inclui source estruturada com type, id e label;
- resposta inclui suggestedAction;
- resposta inclui guardrail;
- service não recalcula insights;
- service não executa ações automáticas.

Passo 3
Ficheiros editados:
- apps/api/src/modules/ai/aiInsightRoutes.js

Endpoint criado:
- GET /api/ai/insights/:id/explanation

Regras implementadas:
- rota adicionada ao router existente de insights;
- não foi criado router paralelo;
- não foi criado novo app.use;
- guards reutilizados do BK-MF4-01;
- acesso protegido por sessão, empresa ativa, permissão e role;
- service getInsightExplanation recebe insightId e companyId;
- procura por id + companyId para evitar fuga multiempresa;
- erros devolvidos por sendError.

Passo 4
Ficheiros criados/editados:
- editado apps/web/src/lib/mf4Api.ts;
- criado apps/web/src/pages/AiInsightExplanationPage.tsx;
- editado apps/web/src/App.tsx para expor a página Explicação do insight no menu.

Regras implementadas:
- criado tipo InsightExplanation;
- criada função getInsightExplanation;
- chamada GET para /api/ai/insights/:id/explanation;
- id é codificado com encodeURIComponent;
- frontend não envia companyId;
- página permite consultar insight por ID;
- página mostra title, summary, explanation, guardrail e source;
- validação de ownership fica no backend;
- UI não recalcula insights;
- UI não executa ações automáticas.

Passo 5
Smoke validado:
- insight de margem devolveu explanation;
- insight de margem devolveu source.type;
- insight de margem devolveu source.label;
- insight de margem devolveu guardrail;
- insight de stock devolveu explanation;
- insight de stock devolveu source.type;
- insight de stock devolveu source.label;
- insight de stock devolveu guardrail.

Critério confirmado:
- nenhum insight visível fica sem fonte;
- explicação genérica sem source não é aceite.

Passo 6
Handoff confirmado:
- RF44 começa fluxo operacional humano independente dos insights;
- BK-MF4-06 pode criar lembretes, mas este BK não cria lembretes automaticamente;
- insights podem inspirar ação humana, mas não executam ações;
- guardrail visível reforça que a decisão e execução pertencem a utilizadores autorizados.

Bloqueio confirmado:
- criar lembrete automático a partir de insight fica fora do scope deste BK.

Passo 7
Negativos validados:
- pedido sem sessão devolve 401 SESSION_REQUIRED;
- utilizador sem role adequada devolve 403 ROLE_FORBIDDEN;
- insight inexistente devolve 404 INSIGHT_NOT_FOUND;
- insight de outra empresa devolve 404 INSIGHT_NOT_FOUND;
- não foi aceite 200 para insight fora da empresa ativa.

Passo 8
Validação de linguagem:
- mensagens em PT-PT;
- erro de sessão orienta o utilizador a iniciar sessão;
- erro de acesso indica falta de permissão;
- erro de insight inexistente indica ID inválido ou fora da empresa ativa;
- página mostra explanation, source e guardrail sem stack trace;
- não há mensagens técnicas cruas na UI.

9) Validacao por BK
Smoke:
- consultar detalhe de insight em GET /api/ai/insights/:id/explanation;
- confirmar title, summary, explanation, source e guardrail;
- confirmar source.type e source.label preenchidos;
- confirmar que a explicação corresponde ao insight gerado;
- confirmar que a UI apresenta origem dos dados de forma clara;
- confirmar que o frontend não envia companyId.

Negativos:
- insight inexistente => 404 INSIGHT_NOT_FOUND;
- insight de outra empresa => 404 INSIGHT_NOT_FOUND;
- utilizador sem sessão => 401 SESSION_REQUIRED;
- utilizador sem role adequada => 403 ROLE_FORBIDDEN;
- insight sem fonte impede fecho do BK.

Bloqueios:
- explicação não pode ser genérica;
- source.type e source.label são obrigatórios;
- não expor dados internos desnecessários;
- não mostrar payloads sensíveis em UI ou evidence;
- não recalcular insights;
- não criar sugestões novas;
- não criar lembretes automáticos;
- RF43 é requisito Must;
- BK-MF4-06 depende deste contrato de explicabilidade.

10) Evidencia obrigatoria
pr:
- ainda não criado

proof:
- GET /api/ai/insights/:id/explanation devolveu 200.
- Resposta incluiu title, summary, explanation, source, suggestedAction e guardrail.
- Fonte apresentada com source.type e source.label.
- UI apresentou explicação e origem dos dados.

neg:
1. Insight inexistente:
   - HTTP 404
   - INSIGHT_NOT_FOUND

2. Insight de outra empresa:
   - HTTP 404
   - INSIGHT_NOT_FOUND

3. Utilizador sem sessão:
   - HTTP 401
   - SESSION_REQUIRED

4. Utilizador sem role adequada:
   - HTTP 403
   - ROLE_FORBIDDEN

files:
- apps/api/src/modules/ai/aiExplanationService.js
- apps/api/src/modules/ai/aiInsightRoutes.js
- apps/web/src/lib/mf4Api.ts
- apps/web/src/pages/AiInsightExplanationPage.tsx
- apps/web/src/App.tsx

commands:
- npm --prefix apps/api run syntax:check
- npm --prefix apps/api run prisma:validate
- npm --prefix apps/web run typecheck
- npm --prefix apps/web run build

fontes:
- AiInsight.sourceType
- AiInsight.sourceId
- AiInsight.sourceLabel
- OperationalReportRun (quando aplicável)
- StockBalance (quando aplicável)
- StockAlertSetting (quando aplicável)

logs:
- Não aplicável neste BK.
- Não existem integrações externas nem auditoria adicional criada.

notes:
- RF43 implementado através de explanation, source e guardrail.
- Ownership validado por companyId.
- Insight de outra empresa devolve 404 para evitar fuga de informação.
- Frontend não envia companyId.
- A IA recomenda e explica; não executa ações automáticas.
- Não são expostos dados sensíveis nem payloads internos na UI.