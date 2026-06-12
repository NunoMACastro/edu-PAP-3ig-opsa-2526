# Evidence BK-MF2-05

## Identificacao

- BK: `BK-MF2-05`
- RF: `RF27`
- Sprint: `S05-S06`
- Dependencias: `BK-MF2-02`
- Proximo BK: `BK-MF2-06`
- Objetivo: alertas de stock por minimos, maximos e artigos parados.

## Implementacao observada

- Service de alertas em `real_dev/api/src/modules/inventory/stockAlertService.js`.
- Rotas de alertas em `real_dev/api/src/modules/inventory/stockAlertRoutes.js`.
- Validacao impede configuracoes incoerentes.

## Evidencia automatizada

```bash
npm run test:unit
```

- Unit: `BK-MF2-05: mínimo maior que máximo é inválido` passou.

## Negativos cobertos

- Stock minimo superior ao maximo e rejeitado.

## Limites conhecidos

- A integracao persistida PostgreSQL ficou pendente porque `TEST_DATABASE_URL` nao esta definida neste ambiente.
