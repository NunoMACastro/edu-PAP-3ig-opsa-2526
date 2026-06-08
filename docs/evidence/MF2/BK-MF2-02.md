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