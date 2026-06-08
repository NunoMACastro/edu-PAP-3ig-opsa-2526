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
- editado apps/web/src/App.tsx para expor a página no frontend.

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