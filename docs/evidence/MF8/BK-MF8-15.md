# Evidence MF8 / BK-MF8-15

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-15`
- Tema: datas, moedas e separadores PT-PT
- RF/RNF: `RNF36`
- Data de revalidacao: `2026-07-10`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Formatadores: `real_dev/web/src/lib/formatters.ts`
- Gate: `real_dev/web/scripts/check-mf8-formatters.mjs`
- Script npm: `test:mf8:formatters`

## Comando executado

| Diretorio | Comando | Resultado observado |
| --- | --- | --- |
| `real_dev/web` | `npm run test:mf8:formatters` | `PASS`; `BK-MF8-15 formatters: OK`. |

## Contrato observado

- Montantes em centimos sao apresentados em EUR com locale `pt-PT`.
- Datas civis `YYYY-MM-DD` sao apresentadas sem conversao UTC que altere o dia.
- Taxas em basis points usam percentagem e separador decimal PT-PT.
- Valores nulos ou invalidos seguem o fallback explicito do modulo.

## Limites

- O gate e estatico e nao substitui a verificacao visual em browser.
- O typecheck e o build pertencem ao gate frontend agregado e nao foram inferidos deste comando focado.

## Decisao

`PASS_ESTATICO`; foram removidos placeholders de output e caminhos da implementacao `apps/`.
