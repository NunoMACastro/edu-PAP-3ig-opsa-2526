Passo 1
* BK: BK-MF4-01
* Macrofase: MF4
* Requisito funcional: RF39 que depende de RF37 e os insights usam apenas dados já existentes
* Dependência: BK-MF3-07 - CANONICO
* Sprint: S07-S08
* Próximo BK: BK-MF4-02
* Endpoint previsto: GET /api/ai/insights?from=YYYY-MM-DD&to=YYYY-MM-DD

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Modelo criado:
- AiInsight

Relações adicionadas:
- Company.aiInsights
- User.aiInsights

Campos principais:
- companyId;
- type;
- severity;
- title;
- summary;
- explanation;
- sourceType;
- sourceId;
- sourceLabel;
- suggestedAction;
- status;
- generatedById;
- generatedAt.

Regras preparadas:
- cada insight pertence a uma empresa;
- cada insight tem fonte rastreável;
- cada insight tem explicação obrigatória;
- generatedById permite rastrear quem gerou;
- status começa como OPEN;
- unique constraint evita duplicação para a mesma fonte;
- companyId vem do backend, não do frontend.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

Passo 3
Ficheiros criados:
- apps/api/src/modules/ai/aiInsightFilters.js
Temporaio
- edu-PAP-3ig-opsa-2526/test-ai-insight-filter.js

Regras implementadas:
- from é obrigatório;
- to é obrigatório;
- from deve ser data válida;
- to deve ser data válida;
- from não pode ser posterior a to;
- erro controlado INVALID_INSIGHT_RANGE;
- validator devolve fromDate e toDate;
- query string não é enviada diretamente para Prisma.

Negativo validado:
- from=2026-06-30&to=2026-06-01 devolve 400 INVALID_INSIGHT_RANGE.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-ai-insight-filter.js
{
  status: 400,
  code: 'INVALID_INSIGHT_RANGE',
  message: 'Data inicial posterior à data final'
}
Teste negativo passou: período invertido devolve INVALID_INSIGHT_RANGE.

Passo 4
Ficheiros criados:
- apps/api/src/modules/ai/aiInsightService.js
Temporaio
- edu-PAP-3ig-opsa-2526/test-ai-insight-service.js

Regras implementadas:
- geração determinística de insights;
- leitura de OperationalReportRun;
- leitura de StockBalance;
- leitura de StockAlertSetting;
- todas as queries usam companyId;
- NEGATIVE_MARGIN é gerado quando marginCents < 0;
- LOW_STOCK é gerado quando StockBalance.quantity está abaixo de StockAlertSetting.minQuantity;
- cada insight inclui type, severity, title, summary, explanation, sourceType, sourceId e sourceLabel;
- suggestedAction é apenas recomendação textual;
- upsert evita duplicação de insights para a mesma fonte;
- service não altera preços, stock, documentos ou contabilidade.

Smoke validado:
- margem negativa gerou insight NEGATIVE_MARGIN;
- insight gerado contém sourceType OperationalReportRun;
- insight gerado contém explanation.

Negativo validado:
- sem fontes disponíveis o service devolve lista vazia;
- nenhum insight é inventado sem origem.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-ai-insight-service.js
[
  {
    "id": "insight-1",
    "type": "NEGATIVE_MARGIN",
    "severity": "HIGH",
    "summary": "A margem operacional do período está negativa.",
    "explanation": "O cálculo vem de OperationalReportRun.marginCents e indica que compras superaram vendas no relatório operacional.",
    "sourceType": "OperationalReportRun",
    "sourceId": "report-1",
    "sourceLabel": "Relatório operacional report-1",
    "suggestedAction": "Rever preços, compras e artigos com menor rotação antes de decidir alterações.",
    "title": "Margem operacional negativa",
    "companyId": "company-1",
    "generatedById": "user-1",
    "status": "OPEN",
    "generatedAt": "2026-06-16T17:42:08.320Z",
    "where": {
      "companyId_type_sourceType_sourceId": {
        "companyId": "company-1",
        "type": "NEGATIVE_MARGIN",
        "sourceType": "OperationalReportRun",
        "sourceId": "report-1"
      }
    }
  }
]
Teste positivo passou: margem negativa gerou insight com fonte.
[]
Teste negativo passou: sem fontes devolve lista vazia.

Passo 5
Ficheiros criados/editados:
- criado apps/api/src/modules/ai/aiInsightRoutes.js;
- editado apps/api/src/server.js.

Endpoint criado:
- GET /api/ai/insights

Regras implementadas:
- rota montada em /api/ai;
- endpoint final disponível em /api/ai/insights;
- route protegida com requireAuth;
- route protegida com requireCompanyContext;
- route protegida com requirePermission(Permission.REPORTS_READ);
- acesso limitado a ADMIN, GESTOR e CONTABILISTA;
- query validada com validateInsightQuery;
- geração delegada para generateAiInsights;
- companyId vem de req.companyId;
- userId vem de req.user.id;
- frontend não escolhe companyId;
- erros devolvidos em formato controlado com error e message.

Smoke previsto/validado:
- GESTOR autenticado recebe 200;
- resposta devolve { insights: [...] };
- cada insight contém type, severity, title, summary, explanation e fonte.

Negativos previstos/validados:
- pedido sem sessão devolve 401 SESSION_REQUIRED;
- utilizador sem empresa ativa devolve erro controlado do middleware de contexto;
- role sem permissão devolve 403 ROLE_FORBIDDEN;
- sem Permission.REPORTS_READ devolve 403;
- período inválido devolve 400 INVALID_INSIGHT_RANGE.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (3.5068ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.4329ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (3.2138ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.4166ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.1646ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.2069ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (3.5523ms)
✔ MF1: routers principais montam sem dependências inexistentes (12.8926ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (7.7775ms)
✔ MF1 HTTP: operacional não pode aprovar venda (3.5516ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (3.7276ms)