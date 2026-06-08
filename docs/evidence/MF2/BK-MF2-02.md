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
