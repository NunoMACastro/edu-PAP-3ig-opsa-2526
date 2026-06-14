Passo 1
* BK: BK-MF3-04
* Macrofase: MF3
* Requisito funcional: RF34
* Dependência: BK-MF3-02, BK-MF1-02, BK-MF1-03, BK-MF1-07, BK-MF1-08
* Sprint: S07-S08
* Próximo BK: BK-MF3-05
* Endpoint previsto: GET /api/treasury/forecast

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Modelo criado:
- CashflowForecastRun

Regras preparadas:
- guarda companyId, fromDate, toDate e generatedById;
- guarda openingBalanceCents;
- guarda expectedInCents;
- guarda expectedOutCents;
- guarda closingBalanceCents;
- guarda generatedAt;
- serve como evidence histórica da previsão;
- não altera documentos, recebimentos, pagamentos ou contabilidade.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate

> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 3.69s

Passo 3
Ficheiros criados:
- apps/api/src/modules/treasury/cashflowForecastFilters.js
Temporario
edu-PAP-3ig-opsa-2526/node test-forecast-filter.js

Regras implementadas:
- from é obrigatório e deve ser data válida;
- to é obrigatório e deve ser data válida;
- from não pode ser posterior a to;
- horizonte máximo permitido é 180 dias;
- intervalo superior a 180 dias devolve FORECAST_RANGE_TOO_LONG;
- validator devolve fromDate e toDate já normalizados;
- companyId não vem da query.

Smoke validado:
- intervalo de 180 dias é aceite.

Negativo validado:
- intervalo de 181 dias devolve 400 FORECAST_RANGE_TOO_LONG.

Comandos executados:
- node test-forecast-filter.js
- npm --prefix apps/api run syntax:check

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-forecast-filter.js
Teste 180 dias passou: {
  fromDate: 2026-01-01T00:00:00.000Z,
  toDate: 2026-06-29T00:00:00.000Z
}
{
  status: 400,
  code: 'FORECAST_RANGE_TOO_LONG',
  message: 'A previsão não deve exceder 180 dias'
}
Teste 181 dias passou: intervalo superior a 180 dias bloqueado.

Passo 4
Ficheiros criados:
- apps/api/src/modules/treasury/cashflowForecastService.js
Temporario
edu-PAP-3ig-opsa-2526/node test-forecast-service.js

Regras implementadas:
- calcula saldo inicial com o snapshot mais recente de cada conta;
- agrega entradas previstas por SaleDocument;
- agrega saídas previstas por PurchaseDocument;
- usa totalCents - amountPaidCents;
- ignora documentos sem valor em aberto;
- agrega linhas por dia;
- calcula saldo projetado diário;
- grava execução em CashflowForecastRun;
- não altera documentos, recebimentos, pagamentos ou contabilidade;
- todas as queries usam companyId.

Smoke validado:
- snapshots de 900 EUR e 1000 EUR usam 1000 EUR como abertura;
- venda em aberto de 300 EUR entra como expectedInCents;
- compra em aberto de 200 EUR entra como expectedOutCents;
- saldo final previsto fica 1100 EUR.

Negativo validado:
- sem empresa ativa devolve 401 COMPANY_CONTEXT_REQUIRED.

Comandos executados:
- node test-forecast-service.js

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-forecast-service.js
{
  "runId": "run-1",
  "from": "2026-01-01",
  "to": "2026-01-31",
  "openingBalanceCents": 100000,
  "expectedInCents": 30000,
  "expectedOutCents": 20000,
  "closingBalanceCents": 110000,
  "rows": [
    {
      "date": "2026-01-10",
      "expectedInCents": 30000,
      "expectedOutCents": 0,
      "sources": [
        "SaleDocument:sale-1"
      ],
      "projectedBalanceCents": 130000
    },
    {
      "date": "2026-01-11",
      "expectedInCents": 0,
      "expectedOutCents": 20000,
      "sources": [
        "PurchaseDocument:purchase-1"
      ],
      "projectedBalanceCents": 110000
    }
  ]
}
Teste positivo passou: saldo final previsto = 1100 EUR.
{
  status: 401,
  code: 'COMPANY_CONTEXT_REQUIRED',
  message: 'Empresa ativa obrigatória'
}
Teste negativo passou: sem empresa ativa devolve 401.

Passo 5
- ✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (3.7162ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.1959ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.6304ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.0346ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (2.7663ms)
✔ MF1: routers principais montam sem dependências inexistentes (9.5998ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (4.0559ms)
✔ MF1 HTTP: operacional não pode aprovar venda (2.8176ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (3.4355ms)

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (5.2424ms)
✔ BK01: registo mantém política de password forte (1.7558ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (2.8643ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.7757ms)
✔ BK07: importação vazia é rejeitada (0.7842ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (0.9961ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.098ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (0.9056ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (0.8145ms)
✔ BK-MF1-01: IVA isento exige motivo de isenção (7.8594ms)
✔ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (2.7109ms)
✔ BK-MF1-06: emissão definitiva exige venda aprovada (1.4625ms)
✔ BK-MF1-02: emissão definitiva reserva número por upsert atómico (5.0783ms)
✔ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (1.2659ms)
✔ BK-MF1-03: recebimento não pode exceder montante em aberto (1.5364ms)
✔ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (1.8062ms)
✔ BK-MF1-04: lançamento de venda fica balanceado (2.5293ms)
✔ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados (1.6637ms)
✔ BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend (4.0016ms)
✔ BK-MF1-08: pagamento rejeita compra ainda em rascunho (1.9719ms)
✔ BK-MF1-08: pagamento rejeita saldo alterado em concorrência (1.3015ms)
✔ BK-MF1-08: pagamento total não altera estado contabilístico da compra (1.2297ms)
✔ BK-MF1-09: lançamento de compra fica balanceado (2.1106ms)
✔ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (1.3041ms)
✔ BK-MF1-10: aprovação de compra só aceita rascunho (0.7684ms)
✔ BK-MF2-01: reprovação exige justificação mínima (4.5962ms)
✔ BK-MF2-02: transferência para o mesmo armazém é inválida (1.9313ms)
✔ BK-MF2-03: entrada valorizada exige custo unitário positivo (1.4826ms)
✔ BK-MF2-03: FIFO consome múltiplas camadas e regista consumos (5.1306ms)
✔ BK-MF2-05: mínimo maior que máximo é inválido (1.3544ms)
✔ BK-MF2-07: balancete agrega linhas contabilísticas por empresa e período (6.1428ms)
✔ BK-MF2-06: lançamento manual tem de estar equilibrado (1.2788ms)
✔ BK-MF2-06: anexo de lançamento manual rejeita MIME fora do contrato (0.9387ms)
✔ BK-MF2-06: anexo de lançamento manual exige conteúdo real (9.0884ms)
✔ BK-MF2-06: anexo rejeita conteúdo que não corresponde ao MIME declarado (5.6715ms)
✔ BK-MF2-06: anexo de lançamento manual é guardado em storage privado (169.094ms)
✔ BK-MF2-06: anexo PNG válido é aceite por assinatura real (1.0083ms)
✔ BK-MF2-07: filtros rejeitam período invertido (0.8922ms)
✔ BK-MF2-04: linhas de contagem não aceitam artigo duplicado (2.4248ms)
✔ BK-MF2-04: publicação de contagem regista AuditLog com detalhes (2.5069ms)
✔ BK-MF2-08: balanço separa classe 2 por sinal e devolve checkCents (1.2668ms)
ℹ tests 41
ℹ suites 0
ℹ pass 41
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2319.7443

Passo 6
Ficheiros criados:
- apps/web/src/lib/forecastApi.ts
Temporario
- edu-PAP-3ig-opsa-2526/node test-forecast-api.js

Funcionalidade implementada:
- tipo CashflowForecast;
- tipo para linhas diárias da previsão;
- fetchCashflowForecast(from, to);
- construção automática da query string;
- reutilização de apiClient;
- utilização de cookie HttpOnly via credentials: include;
- sem tokens em localStorage.

URL validada:
- /api/treasury/forecast?from=2026-01-01&to=2026-01-31

Smoke validado:
- parâmetros from e to são enviados corretamente;
- resposta tipada como CashflowForecast.

Negativo previsto:
- FORECAST_RANGE_TOO_LONG devolvido pelo backend pode ser apresentado pela UI.

Comandos executados:
- node test-forecast-api.js

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-forecast-api.js
/api/treasury/forecast?from=2026-01-01&to=2026-01-31
Teste passou.

Passo 7
Ficheiros criados/editados:
- criado apps/web/src/pages/CashflowForecastPage.tsx;
- editado apps/web/src/App.tsx para expor a página Previsão de tesouraria no menu.

Regras implementadas:
- formulário com data inicial e data final;
- chamada ao cliente fetchCashflowForecast;
- estado loading com “A calcular...”;
- erro mostrado com role="alert";
- resumo com saldo inicial, entradas, saídas e saldo previsto;
- estado vazio quando não há entradas ou saídas previstas;
- valores apresentados em EUR;
- frontend não altera documentos, recebimentos, pagamentos ou contabilidade;
- validação do horizonte fica no backend.

Smoke previsto/validado:
- página Previsão de tesouraria abre no frontend;
- previsão de 30 dias com dados pendentes mostra resumo;
- período sem dados mostra estado vazio;
- pedido usa apiClient e sessão por cookie HttpOnly.

Negativo previsto/validado:
- intervalo superior a 180 dias mostra erro controlado;
- sessão expirada mostra erro controlado;
- role sem permissão mostra erro controlado.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 45 modules transformed.
computing gzip size...
dist/index.html                   0.40 kB │ gzip:  0.28 kB
dist/assets/index-I1u2FZO0.css    2.81 kB │ gzip:  1.06 kB
dist/assets/index-e-HgOJCl.js   249.59 kB │ gzip: 70.86 kB

✓ built in 2.27s