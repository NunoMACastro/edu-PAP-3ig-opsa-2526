<!-- docs/evidence/MF8/BK-MF8-15.md -->

# Evidence BK-MF8-15 - Datas, moedas e separadores PT-PT

## Contrato

- BK: BK-MF8-15
- RNF: RNF36
- Ficheiro central: apps/web/src/lib/formatters.ts
- Gate: apps/web/scripts/check-mf8-formatters.mjs
- Script: npm run test:mf8:formatters

## Comandos executados

```bash
cd apps/web
npm run test:mf8:formatters
npm run typecheck
```

## Resultado observado

- `npm run test:mf8:formatters`: registar output real observado.
- `npm run typecheck`: registar output real observado.

## Positivos

- `123456` em campo `amountCents` é apresentado como euros em PT-PT.
- `2026-12-31` é apresentado como `31/12/2026`.
- `2300` em campo `rateBps` é apresentado como `23,00 %`.

## Negativos

- `formatEuroFromCents(12.5)` falha porque cêntimos devem ser inteiros.
- `formatPortugueseDate("2026-02-31")` falha porque a data não existe.

## Decisão

- Estado: registar `PASS` ou `FAIL`.
- Observações: registar riscos observados ou `sem riscos adicionais`.