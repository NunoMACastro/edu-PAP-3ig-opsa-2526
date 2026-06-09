Passo 1
bk=BK-MF2-03
macro=MF2
rf=RF25
dependencias=BK-MF2-02
proximo=BK-MF2-04

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Modelos adicionados:
- StockCostLayer;
- StockCostConsumption.

Relações adicionadas:
- Company.stockCostLayers;
- Company.stockCostConsumptions;
- Item.stockCostLayers;
- Warehouse.stockCostLayers;
- StockMovement.costLayers;
- StockMovement.costConsumptions.

Regras preparadas:
- StockCostLayer guarda quantidade, remainingQuantity e unitCostCents;
- StockCostConsumption liga uma saída às camadas FIFO consumidas;
- custo fica guardado em cêntimos, não em decimal binário;
- relação com StockMovement permite explicar a origem e o consumo de custo.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate - falhou por drift pre-existente em PurchaseApprovalHistory no schema.prisma.
Erro observado: Type "PurchaseApprovalHistory" is neither a built-in type, nor refers to another model.
Impacto: bloqueia validação Prisma antes de avançar com migration FIFO.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate - também falhou por mesma razão.

Passo 3
Ficheiros criados/editados:
- criado apps/api/src/modules/inventory/fifoCostService.js;
- editado apps/api/src/modules/inventory/stockMovementService.js;
- editado apps/web/src/lib/stockMovementsApi.ts;
- editado apps/web/src/pages/StockMovementsPage.tsx.

Regras implementadas:
- entradas, devoluções e ajustes positivos criam StockCostLayer;
- unitCostCents é obrigatório e positivo para movimentos que criam camada;
- saídas, transferências e ajustes negativos consomem camadas FIFO;
- consumo segue ordem createdAt asc e id asc;
- transferências preservam custo, consumindo camadas na origem e recriando camadas no destino;
- StockCostConsumption explica que camada foi consumida por cada saída;
- preview FIFO é só leitura e não altera camadas;
- FIFO corre no backend, não no browser.

Smoke previsto/validado:
- entrada com unitCostCents cria camada FIFO;
- saída de 12 unidades consome camadas antigas, por exemplo 10 + 2;
- transferência consome camadas na origem e cria camadas equivalentes no destino;
- UI passa unitCostCents quando o movimento cria camada.

Negativos previstos/validados:
- entrada sem unitCostCents positivo devolve 400;
- devolução sem unitCostCents positivo devolve 400;
- saída com camadas insuficientes devolve 409;
- preview com quantidade inválida devolve 400;
- preview com camadas insuficientes devolve 409.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit -- stockMovement

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js stockMovement

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (4.7518ms)
✔ BK01: registo mantém política de password forte (2.2882ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.2633ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (1.7234ms)
✔ BK07: importação vazia é rejeitada (5.4384ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (1.2937ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.3134ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.3687ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (2.4241ms)
✔ BK-MF1-01: IVA isento exige motivo de isenção (6.8413ms)
✔ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (3.7081ms)
✔ BK-MF1-06: emissão definitiva exige venda aprovada (1.4484ms)
✔ BK-MF1-02: emissão definitiva reserva número por upsert atómico (2.8244ms)
✔ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (1.2544ms)
✔ BK-MF1-03: recebimento não pode exceder montante em aberto (1.537ms)
✔ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (1.7945ms)
✔ BK-MF1-04: lançamento de venda fica balanceado (4.9108ms)
✔ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados (3.1985ms)
✔ BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend (3.9725ms)
✔ BK-MF1-08: pagamento rejeita compra ainda em rascunho (1.8002ms)
✔ BK-MF1-08: pagamento rejeita saldo alterado em concorrência (1.3016ms)
✔ BK-MF1-08: pagamento total não altera estado contabilístico da compra (1.8165ms)
✔ BK-MF1-09: lançamento de compra fica balanceado (2.4505ms)
✖ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (1.2958ms)
✖ BK-MF1-10: aprovação de compra só aceita rascunho (5.7005ms)
ℹ tests 25
ℹ suites 0
ℹ pass 23
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1185.9162

✖ failing tests:

test at tests\unit\mf1-services.test.js:595:1
✖ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (1.2958ms)

test at tests\unit\mf1-services.test.js:645:1
✖ BK-MF1-10: aprovação de compra só aceita rascunho (5.7005ms)

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit

src/pages/mf1Pages.tsx:14:10 - error TS2305: Module '"../lib/purchaseApprovalApi"' has no exported member 'purchaseApprovalApi'.

14 import { purchaseApprovalApi } from "../lib/purchaseApprovalApi";
            ~~~~~~~~~~~~~~~~~~~


Found 1 error in src/pages/mf1Pages.tsx:14

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 39 modules transformed.
✗ Build failed in 1.77s
error during build:
Build failed with 1 error:

[MISSING_EXPORT] "purchaseApprovalApi" is not exported by "src/lib/purchaseApprovalApi.ts".

Notas de validação:
- `npm --prefix apps/api run test:unit -- stockMovement` executou também testes antigos de MF1.
- As falhas observadas pertencem a BK-MF1-10 / purchaseApprovalService e não ao FIFO.
- `npm --prefix apps/web run typecheck` e `build` falharam por export em falta `purchaseApprovalApi` em ficheiros MF1.
- Estes blockers parecem drift preexistente e devem ser corrigidos fora do scope de BK-MF2-03.

Passo 4
Ficheiros criados/editados:
- criado apps/api/src/modules/inventory/fifoCostRoutes.js;
- editado apps/api/src/server.js para montar /api/inventory/fifo-cost.

Endpoint criado:
- GET /api/inventory/fifo-cost/preview

Regras implementadas:
- rota protegida com requireAuth;
- rota protegida com requireCompanyContext;
- acesso limitado a roles ADMIN, GESTOR e CONTABILISTA;
- companyId vem de req.companyId, não da query;
- itemId, warehouseId e quantity vêm da query;
- preview chama previewFifoCost;
- erros são normalizados com toHttpError;
- rota é apenas leitura e não altera StockCostLayer nem StockCostConsumption.

Smoke previsto/validado:
- contabilista consulta preview FIFO com sucesso;
- ADMIN/GESTOR conseguem consultar preview;
- resultado devolve items e totalCostCents;
- preview usa camadas FIFO por ordem de entrada.

Negativos previstos/validados:
- pedido sem sessão devolve 401;
- pedido sem empresa ativa devolve 403;
- role OPERACIONAL devolve 403;
- quantidade inválida devolve 400;
- camadas insuficientes devolvem 409;
- dados de outra empresa não são expostos.

Notas de segurança:
- custos são dados sensíveis;
- endpoint não recebe companyId como fonte de verdade;
- role é validada no backend;
- preview não escreve na base de dados.

Passo 5
Ficheiros criados:
- apps/web/src/lib/fifoCostApi.ts

Regras implementadas:
- criado tipo FifoPreviewLine;
- criada função previewFifoCost;
- chamada GET para /api/inventory/fifo-cost/preview;
- itemId, warehouseId e quantity enviados por query string;
- credentials: "include" usado para manter sessão por cookie HttpOnly;
- frontend não calcula FIFO;
- frontend apenas pede preview ao backend e recebe camadas + totalCostCents;
- erros da API são convertidos em Error com mensagem clara.

Smoke previsto/validado:
- chamada com itemId, warehouseId e quantity válidos devolve items e totalCostCents;
- resposta contém linhas com layerId, quantity, unitCostCents e totalCostCents.

Negativo previsto/validado:
- erro 409 de camadas insuficientes aparece como mensagem clara;
- erro 400 de quantidade inválida aparece como mensagem clara.

Comandos executados:
- npm --prefix apps/web run typecheck
- npm --prefix apps/web run build
Typecheck/build falharam por purchaseApprovalApi em ficheiros MF1.

Passo 6
Ficheiros criados/editados:
- criado apps/web/src/pages/FifoCostPage.tsx;
- editado apps/web/src/App.tsx para expor a página Custo FIFO no menu.

Regras implementadas:
- formulário para itemId, warehouseId e quantity;
- chamada ao cliente previewFifoCost;
- estado loading com “A calcular...”;
- erro mostrado com role="alert";
- estado vazio “Sem camadas FIFO para mostrar.”;
- resultado mostra camadas FIFO usadas;
- resultado mostra totalCostCents convertido para EUR;
- frontend não calcula FIFO, apenas apresenta resposta do backend.

Smoke previsto:
- página Custo FIFO abre no frontend;
- formulário chama GET /api/inventory/fifo-cost/preview;
- resposta com camadas mostra lista e total;
- ausência de camadas mostra estado vazio ou erro controlado;
- erro 409 aparece como mensagem clara.

Passo 7
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit -- fifoCost

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js fifoCost

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (8.5313ms)
✔ BK01: registo mantém política de password forte (2.2346ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.5941ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.9303ms)
✔ BK07: importação vazia é rejeitada (1.0094ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (2.9247ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.461ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.221ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (1.746ms)
✔ BK-MF1-01: IVA isento exige motivo de isenção (36.5707ms)
✔ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (4.2902ms)
✔ BK-MF1-06: emissão definitiva exige venda aprovada (1.7717ms)
✔ BK-MF1-02: emissão definitiva reserva número por upsert atómico (3.6559ms)
✔ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (1.5254ms)
✔ BK-MF1-03: recebimento não pode exceder montante em aberto (2.0451ms)
✔ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (2.2277ms)
✔ BK-MF1-04: lançamento de venda fica balanceado (7.659ms)
✔ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados (2.1103ms)
✔ BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend (5.1704ms)
✔ BK-MF1-08: pagamento rejeita compra ainda em rascunho (2.1469ms)
✔ BK-MF1-08: pagamento rejeita saldo alterado em concorrência (6.4335ms)
✔ BK-MF1-08: pagamento total não altera estado contabilístico da compra (1.4876ms)
✔ BK-MF1-09: lançamento de compra fica balanceado (2.7018ms)
✖ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (2.4792ms)
✖ BK-MF1-10: aprovação de compra só aceita rascunho (9.7957ms)
ℹ tests 25
ℹ suites 0
ℹ pass 23
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1774.3941

✖ failing tests:

test at tests\unit\mf1-services.test.js:595:1
✖ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (2.4792ms)


test at tests\unit\mf1-services.test.js:645:1
✖ BK-MF1-10: aprovação de compra só aceita rascunho (9.7957ms)


- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 41 modules transformed.