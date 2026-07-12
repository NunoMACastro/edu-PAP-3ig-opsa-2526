Passo 1
* BK: BK-MF3-01
* Macrofase: MF3
* Requisito funcional: RF31
* Dependência: BK-MF1-01, BK-MF1-02, BK-MF1-04, BK-MF1-07, BK-MF1-09
* Sprint: S07-S08
* Próximo BK: BK-MF3-02
* Endpoint previsto: GET /api/tax/vat-maps

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate

> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 2.32s

Passo 3
Ficheiros criados:
- apps/api/src/modules/tax/vatMapFilters.js

Regras implementadas:
- from é obrigatório;
- to é obrigatório;
- from tem de ser uma data válida;
- to tem de ser uma data válida;
- from não pode ser posterior a to;
- intervalo máximo permitido é 366 dias;
- validator devolve apenas fromDate e toDate;
- companyId não vem da query nem do frontend.

Smoke previsto/validado:
- from=2026-01-01&to=2026-01-31 devolve fromDate e toDate válidos.

Negativos previstos/validados:
- from em falta devolve 400 INVALID_DATE_RANGE;
- to em falta devolve 400 INVALID_DATE_RANGE;
- from=abc devolve 400 INVALID_DATE_RANGE;
- to=abc devolve 400 INVALID_DATE_RANGE;
- from=2026-02-01&to=2026-01-01 devolve 400 INVALID_DATE_RANGE;
- intervalo superior a 366 dias devolve 400 INVALID_DATE_RANGE.

Validação executada:

✓ from=2026-01-01&to=2026-01-31 devolve período válido.

✓ from=abc devolve 400 INVALID_DATE_RANGE.

✓ from=2026-02-01&to=2026-01-01 devolve 400 INVALID_DATE_RANGE.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node apps/api/tests/temp-vat-test.js
{
  fromDate: 2026-01-01T00:00:00.000Z,
  toDate: 2026-01-31T00:00:00.000Z
}

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node apps/api/tests/temp-vat-test.js
HttpError: from deve ser uma data válida{
  status: 400,
  code: 'INVALID_DATE_RANGE',
  details: undefined
}

Passo 4
Ficheiros criados:
- apps/api/src/modules/tax/vatMapService.js

Regras implementadas:
- service buildVatMap calcula mapa de IVA por empresa ativa;
- JournalEntry com source=SALE é usado como fonte de IVA liquidado;
- JournalEntry com source=PURCHASE é usado como fonte de IVA dedutível;
- apenas documentos contabilizados entram no mapa;
- sourceId dos lançamentos é usado para encontrar linhas operacionais;
- SaleDocumentLine fornece vatRate.code, vatRate.rateBps e vatCents;
- PurchaseDocumentLine fornece vatRate.code, vatRate.rateBps e vatCents;
- IVA é agregado por código e taxa;
- totais são calculados em cêntimos;
- VatMapRun é criado para persistir a execução;
- companyId vem do contexto autenticado, não do frontend.

Smoke previsto/validado:
- venda contabilizada com IVA de 2300 cêntimos entra como IVA liquidado;
- compra contabilizada com IVA de 1000 cêntimos entra como IVA dedutível;
- saldo calculado é 1300 cêntimos;
- rows devolvem vatCode, vatRateBps, liquidatedVatCents, deductibleVatCents e balanceCents;
- resultado devolve runId, período, totals, rows e sources.

Negativos previstos/validados:
- sem empresa ativa devolve 401 COMPANY_CONTEXT_REQUIRED;
- documentos sem JournalEntry não entram no mapa;
- documentos de outra empresa não entram no mapa;
- período sem documentos devolve totais a zero e rows vazias.

Validação manual do service:
- venda com IVA liquidado de 2300 cêntimos;
- compra com IVA dedutível de 1000 cêntimos;
- saldo calculado: 1300 cêntimos;
- resultado esperado confirmado: 13 EUR a entregar.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node apps/api/tests/temp-vat-map-service-test.js
{
  "runId": "run-1",
  "from": "2026-01-01",
  "to": "2026-01-31",
  "totals": {
    "liquidatedVatCents": 2300,
    "deductibleVatCents": 1000,
    "vatBalanceCents": 1300
  },
  "rows": [
    {
      "vatCode": "IVA23",
      "vatRateBps": 2300,
      "liquidatedVatCents": 2300,
      "deductibleVatCents": 1000,
      "balanceCents": 1300
    }
  ],
  "sources": [
    "JournalEntry",
    "SaleDocumentLine",
    "PurchaseDocumentLine"
  ]
}
Teste passou: saldo IVA = 13 EUR

Passo 5
Ficheiros criados/editados:
- criado apps/api/src/modules/tax/vatMapRoutes.js;
- editado apps/api/src/server.js.

Endpoint criado:
- GET /api/tax/vat-maps

Regras implementadas:
- route protegida com requireAuth;
- route protegida com requireCompanyContext;
- acesso limitado a CONTABILISTA e AUDITOR;
- query validada com validateVatMapQuery;
- cálculo delegado para buildVatMap;
- companyId vem de req.companyId;
- userId vem de req.user.id;
- companyId não é recebido por query string;
- erros são normalizados com toHttpError.

Smoke previsto:
- CONTABILISTA autenticado recebe 200;
- AUDITOR autenticado recebe 200;
- resultado devolve totals, rows, sources e runId.

Negativos previstos:
- sem cookie de sessão devolve 401 SESSION_REQUIRED;
- OPERACIONAL devolve 403;
- datas inválidas devolvem 400 INVALID_DATE_RANGE;
- companyId por query string não é usado.

Passo 6
Ficheiros criados:
- apps/web/src/lib/taxApi.ts

Regras implementadas:
- criado tipo VatMapRow;
- criado tipo VatMapResult;
- criada função fetchVatMap;
- chamada GET para /api/tax/vat-maps;
- from e to enviados por query string;
- cliente reutiliza apiClient existente;
- apiClient mantém sessão por cookie HttpOnly;
- resposta usa nomes fiscais explícitos: liquidatedVatCents, deductibleVatCents e vatBalanceCents;
- frontend não calcula IVA;
- frontend apenas pede o mapa ao backend e apresenta o resultado.

Smoke previsto/validado:
- chamada com from=2026-01-01 e to=2026-01-31 chama o endpoint real;
- resposta esperada contém runId, totals, rows e sources;
- pedido mantém cookie de sessão através do apiClient.

Negativos previstos/validados:
- erro 403 da API é propagado como mensagem controlada;
- erro 400 por datas inválidas é propagado para a página;
- frontend não envia companyId.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 38 modules transformed.
computing gzip size...
dist/index.html                   0.40 kB │ gzip:  0.28 kB
dist/assets/index-I1u2FZO0.css    2.81 kB │ gzip:  1.06 kB
dist/assets/index-DrgUAVs_.js   244.32 kB │ gzip: 69.65 kB

✓ built in 7.26s

Passo 7
Ficheiros criados/editados:
- criado apps/web/src/pages/VatMapPage.tsx;
- editado apps/web/src/App.tsx para expor a página Mapa de IVA no menu.

Regras implementadas:
- formulário com data inicial e data final obrigatórias;
- chamada ao cliente fetchVatMap;
- estado loading com “A calcular...”;
- erro mostrado com role="alert";
- estado vazio para período sem movimentos de IVA;
- resumo com IVA liquidado, IVA dedutível e saldo de IVA;
- tabela por código/taxa de IVA;
- valores apresentados em EUR apenas para visualização;
- frontend não calcula IVA;
- frontend não pede companyId ao utilizador.

Smoke previsto/validado:
- página Mapa de IVA abre no frontend;
- gerar mapa com dados mostra resumo e tabela;
- gerar período vazio mostra mensagem “Sem movimentos de IVA no período selecionado.”;
- pedido usa sessão via apiClient/cookie HttpOnly.

Negativo previsto/validado:
- sessão expirada mostra erro controlado;
- erro da API não mostra stack trace;
- datas inválidas são rejeitadas pelo backend.

Passo 8
Passo 8 - Validar entrega e handoff

Smoke validado:
- GET /api/tax/vat-maps?from=2026-01-01&to=2026-01-31 devolve 200;
- resposta inclui liquidatedVatCents, deductibleVatCents e vatBalanceCents;
- resposta inclui linhas por código/taxa de IVA;
- período sem dados devolve totais a zero e rows vazias;
- execução fica registada em VatMapRun.

Negativos validados:
- datas inválidas devolvem 400 INVALID_DATE_RANGE;
- pedido sem sessão devolve 401 SESSION_REQUIRED;
- utilizador sem role financeira devolve 403 ROLE_FORBIDDEN.

Critérios confirmados:
- service consulta JournalEntry real;
- linhas de venda/compra são usadas apenas para decompor código/taxa de IVA;
- todas as queries usam companyId;
- frontend apresenta nomes fiscais corretos;
- mapa de IVA não altera vendas, compras nem contabilidade;
- não há dados cross-company.

Evidence para PR/defesa:
- output JSON do mapa;
- screenshot da página VatMapPage;
- prova de 400 INVALID_DATE_RANGE;
- prova de 401 SESSION_REQUIRED;
- prova de 403 ROLE_FORBIDDEN;
- período usado no teste: 2026-01-01 a 2026-01-31;
- empresa usada: empresa ativa da sessão, sem expor companyId real.

Handoff:
- BK-MF3-02 deve manter a mesma disciplina de multiempresa;
- BK-MF3-02 não precisa reescrever o mapa de IVA;
- BK-MF3-07 e relatórios futuros podem reutilizar a disciplina de filtros, roles e companyId deste BK.

Passo 8
Smoke validado:
- GET /api/tax/vat-maps?from=2026-01-01&to=2026-01-31 devolve 200;
- resposta inclui liquidatedVatCents, deductibleVatCents e vatBalanceCents;
- resposta inclui linhas por código/taxa de IVA;
- período sem dados devolve totais a zero e rows vazias;
- execução fica registada em VatMapRun.

Negativos validados:
- datas inválidas devolvem 400 INVALID_DATE_RANGE;
- pedido sem sessão devolve 401 SESSION_REQUIRED;
- utilizador sem role financeira devolve 403 ROLE_FORBIDDEN.

Critérios confirmados:
- service consulta JournalEntry real;
- linhas de venda/compra são usadas apenas para decompor código/taxa de IVA;
- todas as queries usam companyId;
- frontend apresenta nomes fiscais corretos;
- mapa de IVA não altera vendas, compras nem contabilidade;
- não há dados cross-company.

Handoff:
- BK-MF3-02 deve manter a mesma disciplina de multiempresa;
- BK-MF3-02 não precisa reescrever o mapa de IVA;
- BK-MF3-07 e relatórios futuros podem reutilizar a disciplina de filtros, roles e companyId deste BK.

9) Validacao Final BK-MF3-01

Smoke
* Consultar mapa em `GET /api/tax/vat-maps`.
* Confirmar `liquidatedVatCents`.
* Confirmar `deductibleVatCents`.
* Confirmar `vatBalanceCents`.
* Confirmar linhas por taxa/código de IVA.
* Confirmar que a fonte são documentos já contabilizados.
* Confirmar que vendas contabilizadas entram como IVA liquidado.
* Confirmar que compras contabilizadas entram como IVA dedutível.
* Confirmar que a execução fica registada em `VatMapRun`.

Negativos
* Datas inválidas devolvem `400 INVALID_DATE_RANGE`.
* Utilizador sem sessão devolve `401 SESSION_REQUIRED`.
* Utilizador sem role adequada devolve `403 ROLE_FORBIDDEN`.
* Documentos de outra empresa não entram no mapa.
* Período sem dados devolve totais a zero e lista vazia.
* `companyId` enviado por query string não é usado como fonte de verdade.

Bloqueios e limites do BK
* O mapa não submete dados à Autoridade Tributária.
* O mapa não altera documentos de venda.
* O mapa não altera documentos de compra.
* O mapa não altera lançamentos contabilísticos.
* `JournalEntry` é a fonte contabilística principal.
* Apenas documentos já contabilizados entram no mapa.
* A decomposição por taxa/código usa linhas de venda/compra ligadas ao lançamento.
* O cálculo é interno, fiscal e auditável, mas não substitui submissão oficial.


10) Evidencia obrigatoria - BK-MF3-01
pr
PR: ainda não criado.

proof
- Foi implementado o mapa interno de IVA (RF31), calculando IVA liquidado, IVA dedutível e saldo de IVA a partir de documentos já contabilizados.
- A fonte canónica do cálculo é JournalEntry, garantindo que apenas vendas e compras contabilizadas entram no mapa. A decomposição por código e taxa de IVA é obtida através das linhas dos documentos (SaleDocumentLine e PurchaseDocumentLine) ligadas pelo sourceId do lançamento contabilístico.
- Cada execução fica registada em VatMapRun, incluindo empresa, utilizador, período e totais calculados.

neg
- Cenários negativos previstos/validados:
INVALID_DATE_RANGE
SESSION_REQUIRED
ROLE_FORBIDDEN
exclusão de documentos de outras empresas
período sem movimentos devolve totais a zero
impossibilidade de escolher empresa através de query string

files
apps/api/prisma/schema.prisma
apps/api/src/modules/tax/vatMapFilters.js
apps/api/src/modules/tax/vatMapService.js
apps/api/src/modules/tax/vatMapRoutes.js
apps/api/src/server.js
apps/web/src/lib/taxApi.ts
apps/web/src/pages/VatMapPage.tsx
apps/web/src/App.tsx
docs/evidence/MF3/BK-MF3-01.md
temporarios
node apps/api/tests/temp-vat-test.js
apps/api/tests/temp-vat-map-service-test.js

commands
npm --prefix apps/api run prisma:validate
npm --prefix apps/api run prisma:generate
node apps/api/tests/temp-vat-map-service-test.js
npm --prefix apps/web run build

exports
Não aplicável neste BK.
Não existem exportações SAF-T, CSV, PDF ou Excel.

notes
O cálculo é executado exclusivamente no backend.
O frontend apenas apresenta os resultados.
Todas as queries utilizam companyId proveniente da sessão ativa.
O mapa é apenas um relatório interno e não efetua submissões à Autoridade Tributária.
O BK reutiliza informação contabilística criada nos BK-MF1-04 e BK-MF1-09.
A execução histórica fica auditável através de VatMapRun.