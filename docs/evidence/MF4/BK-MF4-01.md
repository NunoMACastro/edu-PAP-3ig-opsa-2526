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
- edu-PAP-3ig-opsa-2526/node test-ai-insight-filter.js

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