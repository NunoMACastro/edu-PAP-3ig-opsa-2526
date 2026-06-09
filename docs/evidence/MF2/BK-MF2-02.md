Passo 1

* BK: BK-MF2-02
* Macrofase: MF2
* Requisito funcional: RF24
* Dependência: BK-MF0-03, BK-MF0-11, BK-MF0-12
* Sprint: S05-S06
* Próximo BK: BK-MF1-03
* Endpoint previsto: /api/vat-rates

Passo 2
Alterado apps/api/prisma/schema.prisma:
- criado enum StockMovementType;
- criado model StockBalance;
- criado model StockMovement;
- adicionadas relações em Company, Item, Warehouse e User.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate                                                                                                                                                 
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

Passo 3
Ficheiros criados:
- apps/api/src/modules/inventory/stockMovementValidators.js
- apps/api/src/modules/inventory/stockMovementService.js

Arquitetura:
- criado stockMovementValidators.js para centralizar validações de movimentos de stock;
- stockMovementService.js ficou responsável apenas pela lógica transacional, atualização de saldos e auditoria.

Regras implementadas:
- validação de tipo ENTRY, EXIT, TRANSFER, RETURN, ADJUSTMENT;
- quantity obrigatória e maior que zero;
- item obrigatório;
- reason obrigatório;
- ENTRY/RETURN exigem toWarehouseId;
- EXIT exige fromWarehouseId;
- TRANSFER exige fromWarehouseId e toWarehouseId diferentes;
- ADJUSTMENT exige apenas um armazém;
- item e armazéns filtrados por companyId;
- saldo negativo bloqueado com erro 409;
- StockMovement e StockBalance atualizados dentro da mesma transaction;
- AuditLog criado para movimento de stock.

Passo 4
Ficheiros criados/editados:
- criado apps/api/src/modules/inventory/stockMovementRoutes.js;
- editado apps/api/src/server.js para montar o router em /api/inventory/stock-movements.

Regras implementadas:
- rota POST protegida com requireAuth, requireCompanyContext e requireRole;
- rota GET protegida com os mesmos guards;
- companyId vem de req.companyId, não do body;
- userId vem de req.user.id;
- criação delegada para stockMovementService;
- erros normalizados com toHttpError;
- listagem limitada aos movimentos da empresa ativa.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (4.6001ms)
✔ BK01: registo mantém política de password forte (1.7369ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.4727ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.7666ms)
✔ BK07: importação vazia é rejeitada (0.7686ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (0.9332ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.009ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.0567ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (0.8317ms)
✔ BK-MF1-01: IVA isento exige motivo de isenção (4.746ms)
✔ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (4.8106ms)
✔ BK-MF1-06: emissão definitiva exige venda aprovada (1.4239ms)
✔ BK-MF1-02: emissão definitiva reserva número por upsert atómico (2.7748ms)
✔ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (1.2302ms)
✔ BK-MF1-03: recebimento não pode exceder montante em aberto (1.5301ms)
✔ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (1.3737ms)
✔ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados (1.7586ms)
✔ BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend (3.7865ms)
✔ BK-MF1-08: pagamento rejeita compra ainda em rascunho (1.6961ms)
✔ BK-MF1-08: pagamento rejeita saldo alterado em concorrência (1.3477ms)
✔ BK-MF1-08: pagamento total não altera estado contabilístico da compra (1.1193ms)
✔ BK-MF1-09: lançamento de compra fica balanceado (2.1232ms)
✔ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (1.3223ms)
✔ BK-MF1-10: aprovação de compra só aceita rascunho (1.048ms)
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1125.7267

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (20.0346ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.6759ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (3.0782ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.6405ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.6392ms)
✔ BK12: nome de armazém duplicado é rejeitado (2.8643ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (3.4638ms)
✔ MF1: routers principais montam sem dependências inexistentes (12.9777ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (4.8516ms)
✔ MF1 HTTP: operacional não pode aprovar venda (4.2812ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (7.1431ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2206.6245

Passo 5
Ficheiros criados:
- apps/web/src/lib/stockMovementsApi.ts

Regras implementadas:
- criado tipo StockMovementType;
- criado tipo StockMovementInput;
- criada função createStockMovement;
- chamada POST para /api/inventory/stock-movements;
- envio de JSON com Content-Type application/json;
- credentials: "include" usado para manter sessão por cookie HttpOnly;
- companyId não é enviado pelo frontend;
- erros da API são convertidos em Error com mensagem clara.

Cenário negativo validado:
- se response.ok for false, createStockMovement lança Error com a mensagem devolvida pela API.

Validação executada:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 37 modules transformed.
computing gzip size...
dist/index.html                   0.40 kB │ gzip:  0.28 kB
dist/assets/index-I1u2FZO0.css    2.81 kB │ gzip:  1.06 kB
dist/assets/index-C5k3vmep.js   223.70 kB │ gzip: 66.74 kB

✓ built in 2.89s

Passo 6
Ficheiros criados/editados:
- criado apps/web/src/pages/StockMovementsPage.tsx;
- editado apps/web/src/App.tsx para expor StockMovementsPage no menu da aplicação.

Regras implementadas:
- formulário mínimo para criar movimentos de stock;
- suporte aos tipos ENTRY, EXIT, TRANSFER e RETURN;
- campos itemId, fromWarehouseId, toWarehouseId, quantity e reason;
- chamada ao cliente createStockMovement;
- estado loading durante submissão;
- mensagem de sucesso após criação;
- mensagem de erro quando a API rejeita o pedido;
- a UI não envia companyId;
- regras críticas continuam no backend.

Cenários validados:
- formulário visível e funcional;
- submissão válida chama a API;
- sucesso mostra “Movimento criado.”;
- erro da API aparece no elemento com role="alert";
- a página não assume sucesso quando o backend rejeita o pedido.

Passo 7
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:unit -- stockMovement

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js stockMovement

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (4.7356ms)
✔ BK01: registo mantém política de password forte (1.7996ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.331ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.7323ms)
✔ BK07: importação vazia é rejeitada (0.7873ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (0.9761ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.0908ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.0676ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (1.1778ms)
✔ BK-MF1-01: IVA isento exige motivo de isenção (4.7336ms)
✔ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (4.8121ms)
✔ BK-MF1-06: emissão definitiva exige venda aprovada (1.4551ms)
✔ BK-MF1-02: emissão definitiva reserva número por upsert atómico (2.7186ms)
✔ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (1.2473ms)
✔ BK-MF1-03: recebimento não pode exceder montante em aberto (1.5335ms)
✔ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (1.3752ms)
✔ BK-MF1-04: lançamento de venda fica balanceado (2.7252ms)
✔ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados (1.7571ms)
✔ BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend (3.7515ms)
✔ BK-MF1-08: pagamento rejeita compra ainda em rascunho (1.5972ms)
✔ BK-MF1-08: pagamento rejeita saldo alterado em concorrência (1.2729ms)
✔ BK-MF1-08: pagamento total não altera estado contabilístico da compra (1.1766ms)
✔ BK-MF1-09: lançamento de compra fica balanceado (2.0961ms)
✔ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (1.5442ms)
✔ BK-MF1-10: aprovação de compra só aceita rascunho (0.6544ms)
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 969.8747

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck

> @opsa/web@1.0.0 typecheck
> tsc --noEmit

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 37 modules transformed.
computing gzip size...
dist/index.html                   0.40 kB │ gzip:  0.28 kB
dist/assets/index-I1u2FZO0.css    2.81 kB │ gzip:  1.06 kB
dist/assets/index-C5k3vmep.js   223.70 kB │ gzip: 66.74 kB

✓ built in 1.90s

Passo 8
- Requisito validado: RF24
- Endpoints: POST /api/inventory/stock-movements, GET /api/inventory/stock-movements
- Negativos: saldo insuficiente, armazém de outra empresa, transferência para o mesmo armazém, role sem permissão
- Resultado: preencher com comandos, resposta HTTP e imagem da página

9) Validacao por BK

Smoke
- Endpoint POST /api/inventory/stock-movements implementado.
- Endpoint GET /api/inventory/stock-movements implementado.
- Entrada aumenta saldo do artigo no armazém de destino.
- Saída diminui saldo sem permitir stock negativo.
- Transferência diminui saldo na origem e aumenta no destino.
- Devolução aumenta saldo com motivo registado.
- Movimento cria registo em StockMovement.
- Movimento atualiza StockBalance.
- Auditoria criada para movimento de stock.

Negativos
- Pedido sem sessão devolve 401.
- Pedido sem empresa ativa devolve 403.
- Utilizador sem role adequada devolve 403.
- Artigo de outra empresa devolve 404 ou 403.
- Armazém de outra empresa devolve 404 ou 403.
- Quantidade zero ou negativa devolve 400.
- Tipo de movimento inválido devolve 400.
- Transferência para o mesmo armazém devolve 400.
- Saída acima do saldo disponível devolve 409.

Bloqueios e limites do BK
- StockMovement e StockBalance pertencem à empresa ativa.
- Saldo e movimento são atualizados na mesma transação.
- O frontend não altera saldos diretamente.
- O frontend não envia companyId como fonte de verdade.
- FIFO pertence ao BK-MF2-03.
- Contagem física pertence ao BK-MF2-04.
- Alertas automáticos pertencem ao BK-MF2-05.
- Integração automática com documentos fiscais fica fora do scope deste BK.

10) Evidencia obrigatoria
pr
ainda nao criado.

proof
- Foi implementado o registo transacional de movimentos de stock com suporte para ENTRY, EXIT, TRANSFER, RETURN e ADJUSTMENT.
- Os movimentos criam registos em StockMovement, atualizam StockBalance na mesma transação e geram auditoria através de AuditLog.
- A solução aplica isolamento multiempresa através de companyId obtido do contexto autenticado e impede saldo negativo.

neg
Cenarios negativos previstos/validados:
SESSION_REQUIRED
COMPANY_CONTEXT_REQUIRED
PERMISSION_FORBIDDEN
ITEM_NOT_FOUND
WAREHOUSE_NOT_FOUND
INVALID_STOCK_MOVEMENT_TYPE
INVALID_STOCK_QUANTITY
TRANSFER_SAME_WAREHOUSE
INSUFFICIENT_STOCK
ADJUSTMENT_WAREHOUSE_REQUIRED

files
apps/api/prisma/schema.prisma
apps/api/src/modules/inventory/stockMovementService.js
apps/api/src/modules/inventory/stockMovementValidators.js
apps/api/src/modules/inventory/stockMovementRoutes.js
apps/api/src/server.js
apps/web/src/lib/stockMovementsApi.ts
apps/web/src/pages/StockMovementsPage.tsx
apps/web/src/App.tsx
apps/api/src/modules/inventory/stockMovementService.test.js
apps/api/src/modules/inventory/stockMovementRoutes.test.js
docs/evidence/MF2/BK-MF2-02.md

commands
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate      
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit    
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts    
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck   
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:unit -- stockMovement    
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run typecheck    
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build 

notes
- O frontend nao altera saldos diretamente.
- companyId nao e recebido pelo body como fonte de verdade.
- StockMovement e StockBalance sao atualizados na mesma transacao.
- FIFO sera implementado em BK-MF2-03 reutilizando StockMovement e StockBalance.
- Contagem fisica pertence ao BK-MF2-04.
- Alertas de stock pertencem ao BK-MF2-05