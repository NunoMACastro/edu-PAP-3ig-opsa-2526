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