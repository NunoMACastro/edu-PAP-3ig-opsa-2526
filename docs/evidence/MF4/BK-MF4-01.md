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

- schema Prisma validado com sucesso.

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

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (4.7632ms)
✔ BK01: registo mantém política de password forte (1.8186ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (2.9501ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.862ms)
✔ BK07: importação vazia é rejeitada (1.2806ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (0.9853ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.0665ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (0.9068ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (1.105ms)
✔ BK-MF1-01: IVA isento exige motivo de isenção (6.8759ms)
✔ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (3.7521ms)
✔ BK-MF1-06: emissão definitiva exige venda aprovada (1.4404ms)
✔ BK-MF1-02: emissão definitiva reserva número por upsert atómico (2.7958ms)
✔ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (1.2507ms)
✔ BK-MF1-03: recebimento não pode exceder montante em aberto (1.6026ms)
✔ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (1.8815ms)
✔ BK-MF1-04: lançamento de venda fica balanceado (2.4355ms)
✔ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados (2.0653ms)
✔ BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend (3.9565ms)
✔ BK-MF1-08: pagamento rejeita compra ainda em rascunho (1.7334ms)
✔ BK-MF1-08: pagamento rejeita saldo alterado em concorrência (1.3283ms)
✔ BK-MF1-08: pagamento total não altera estado contabilístico da compra (1.189ms)
✔ BK-MF1-09: lançamento de compra fica balanceado (2.1603ms)
✔ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (1.3452ms)
✔ BK-MF1-10: aprovação de compra só aceita rascunho (0.7906ms)
✔ BK-MF2-01: reprovação exige justificação mínima (4.7115ms)
✔ BK-MF2-02: transferência para o mesmo armazém é inválida (0.9319ms)
✔ BK-MF2-03: entrada valorizada exige custo unitário positivo (0.5091ms)
✔ BK-MF2-03: FIFO consome múltiplas camadas e regista consumos (2.7137ms)
✔ BK-MF2-05: mínimo maior que máximo é inválido (0.8385ms)
✔ BK-MF2-07: balancete agrega linhas contabilísticas por empresa e período (2.2456ms)
✔ BK-MF2-06: lançamento manual tem de estar equilibrado (1.0982ms)
✔ BK-MF2-06: anexo de lançamento manual rejeita MIME fora do contrato (0.8338ms)
✔ BK-MF2-06: anexo de lançamento manual exige conteúdo real (1.0563ms)
✔ BK-MF2-06: anexo rejeita conteúdo que não corresponde ao MIME declarado (1.4615ms)
✔ BK-MF2-06: anexo de lançamento manual é guardado em storage privado (117.6514ms)
✔ BK-MF2-06: anexo PNG válido é aceite por assinatura real (0.9939ms)
✔ BK-MF2-07: filtros rejeitam período invertido (0.8251ms)
✔ BK-MF2-04: linhas de contagem não aceitam artigo duplicado (0.8163ms)
✔ BK-MF2-04: publicação de contagem regista AuditLog com detalhes (2.4062ms)
✔ BK-MF2-08: balanço separa classe 2 por sinal e devolve checkCents (1.1799ms)
✔ BK-MF3-02: conta bancária exige IBAN válido (5.3024ms)
✔ BK-MF3-03: CSV de extrato é parseado para cêntimos e linhas (2.097ms)
✔ BK-MF3-03: importação deduplica linhas e mantém sugestões SUGGESTED (4.8208ms)
✔ BK-MF3-04: previsão bloqueia intervalo inclusivo superior a 180 dias (1.3128ms)
✔ BK-MF3-05: importação aceita apenas tipos canónicos e CSV com cabeçalho (2.7235ms)
✔ BK-MF3-01: mapa de IVA usa apenas documentos contabilizados (2.3677ms)
✔ BK-MF3-01: mapa de IVA bloqueia intervalo inclusivo superior a 366 dias (0.9808ms)
✔ BK-MF3-07: relatório operacional calcula margem e stock com fontes (2.1288ms)
✔ BK-MF3-08: KPIs devolvem PMR/PMP null sem dados suficientes (3.9171ms)
ℹ tests 50
ℹ suites 0
ℹ pass 50
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2698.0002

Passo 6
Ficheiros criados/editados:
- criado apps/web/src/lib/mf4Api.ts;
- criado apps/web/src/pages/AiInsightsPage.tsx;
- editado apps/web/src/App.tsx para expor a página Insights automáticos no menu.

Regras implementadas:
- criado tipo AiInsight;
- criada função getAiInsights;
- chamada GET para /api/ai/insights;
- from e to são enviados por query string;
- frontend não envia companyId;
- página com formulário de datas;
- estado busy/loading com “A gerar...”;
- estado de erro;
- estado vazio quando não há insights;
- lista de insights com title, summary, sourceType e sourceLabel;
- UI não calcula insights;
- UI não executa ações automáticas.

Smoke previsto/validado:
- página Insights automáticos abre no browser;
- consulta com período válido chama /api/ai/insights;
- resposta mostra insights;
- cada insight mostra sourceType e sourceLabel;
- explanation existe no contrato tipado.

Negativos previstos/validados:
- sem sessão a página mostra erro devolvido pela API;
- período inválido mostra erro controlado;
- role sem permissão mostra erro controlado.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 41 modules transformed.
computing gzip size...
dist/index.html                   0.40 kB │ gzip:  0.28 kB
dist/assets/index-I1u2FZO0.css    2.81 kB │ gzip:  1.06 kB
dist/assets/index-Bz-8dXHF.js   254.80 kB │ gzip: 71.38 kB

✓ built in 1.83s

Passo 7
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run syntax:check

> @opsa/api@1.0.0 syntax:check
> find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check

'xargs' is not recognized as an internal or external command,
operable program or batch file.

Passo 8
Handoff confirmado para BK-MF4-02:
- AiInsight.type disponível;
- AiInsight.severity disponível;
- AiInsight.sourceType disponível;
- AiInsight.sourceId disponível;
- AiInsight.sourceLabel disponível;
- AiInsight.explanation disponível;
- AiInsight.suggestedAction disponível;
- AiInsight.status disponível.

Contrato entregue:
- BK-MF4-02 pode consumir AiInsight existente;
- BK-MF4-02 não precisa recalcular OperationalReportRun;
- BK-MF4-02 não precisa recalcular StockBalance;
- BK-MF4-02 não precisa recalcular StockAlertSetting;
- BK-MF4-02 pode usar suggestedAction como base inicial da recomendação.

Smoke de handoff:
- insight NEGATIVE_MARGIN contém suggestedAction;
- insight LOW_STOCK contém suggestedAction;
- cada insight contém fonte rastreável;
- cada insight contém explicação.

Risco validado:
- se todos os suggestedAction estiverem vazios, BK-MF4-02 fica sem contrato útil.

Resultado:
- handoff para BK-MF4-02 preparado com endpoint, modelo AiInsight, campos de fonte e ação sugerida.