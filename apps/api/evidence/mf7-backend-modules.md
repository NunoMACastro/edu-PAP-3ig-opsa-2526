# Evidence MF7 - Backend modular por dominio

## Contrato

- Data de execucao: `2026-06-30`
- BK: `BK-MF7-08`
- Requisito: `RNF25`
- Fluxo coberto: gate estatico de modularidade backend
- Implementation root: `real_dev/api`

## Entrega

- Script `scripts/check-mf7-backend-modules.mjs`.
- Script npm `check:mf7:backend-modules`.
- Validacao de routes/services por dominio: vendas, compras, inventario, tesouraria, contabilidade, reporting, mapas fiscais, demonstracoes financeiras, compliance SAF-T e IA.
- Validacao de boundary em `src/server.js`: o servidor monta route builders e nao importa services/controllers/validators/middlewares/contextos internos.

## Comandos executados

```bash
npm --prefix real_dev/api run check:mf7:backend-modules
OPSA_MF7_SIMULATE_MISSING=src/modules/ai/aiRoutes.js npm --prefix real_dev/api run check:mf7:backend-modules
OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT=sales/saleDocumentService.js npm --prefix real_dev/api run check:mf7:backend-modules
OPSA_MF7_SIMULATE_MISSING=src/modules/inventory/stockMovementService.js npm --prefix real_dev/api run check:mf7:backend-modules
```

## Resultado observado

- Prova positiva: `PASS`, output `MF7 backend modular: OK`.
- Negativo de route em falta: `PASS_NEGATIVO`, exit code `1`, output `Ficheiro obrigatorio em falta: src/modules/ai/aiRoutes.js`.
- Negativo de import proibido no servidor: `PASS_NEGATIVO`, exit code `1`, output `server.js importa ficheiros internos de dominio: from "./modules/sales/saleDocumentService.js"`.
- Negativo de service em falta: `PASS_NEGATIVO`, exit code `1`, output `Ficheiro obrigatorio em falta: src/modules/inventory/stockMovementService.js`.

## Conclusao

O backend fica acompanhado por um gate repetivel para provar modularidade sem alterar endpoints funcionais, modelos Prisma ou frontend.
