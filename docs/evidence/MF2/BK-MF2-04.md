# Evidence BK-MF2-04

## Identificacao

- BK: `BK-MF2-04`
- RF: `RF26`
- Sprint: `S05-S06`
- Dependencias: `BK-MF2-02, BK-MF2-03`
- Proximo BK: `BK-MF2-05`
- Objetivo: contagem fisica e ajustes.

## Implementacao observada

- Service de contagens em `real_dev/api/src/modules/inventory/inventoryCountService.js`.
- Rotas de contagem em `real_dev/api/src/modules/inventory/inventoryCountRoutes.js`.
- Edicao de linhas em rascunho exposta por contrato de router.

## Evidencia automatizada

```bash
npm run test:unit
npm run test:contracts
```

- Unit: `BK-MF2-04: linhas de contagem não aceitam artigo duplicado` passou.
- Contract: `BK-MF2-04: router de contagens expõe edição de linhas em rascunho` passou.

## Negativos cobertos

- Linhas duplicadas para o mesmo artigo sao rejeitadas.
- Router monta a edicao de linhas sem dependencias inexistentes.

## Limites conhecidos

- A integracao persistida PostgreSQL ficou pendente porque `TEST_DATABASE_URL` nao esta definida neste ambiente.
