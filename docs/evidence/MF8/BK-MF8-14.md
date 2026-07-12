# Evidence MF8 / BK-MF8-14

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-14`
- Tema: alinhamento estatico da UI com o mockup
- RF/RNF: `RNF35`
- Data de revalidacao: `2026-07-09`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Referencia de cor: `mockup/PALETA-CORES.md`
- Referencia de layout: `mockup/src/app/components/Layout.tsx`
- Estilos reais: `real_dev/web/src/styles.css`
- Componentes partilhados: `real_dev/web/src/ui/opsaUi.tsx`
- Cliente IA: `real_dev/web/src/lib/mf4Api.ts`
- Paginas IA: `real_dev/web/src/pages/mf4Pages.tsx`
- Gate UI: `real_dev/web/scripts/check-mf8-ui-alignment.mjs`
- Checklist: `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`

## Prova automatizada

| Comando | Resultado observado |
| --- | --- |
| `npm --prefix real_dev/web run test:mf8:ui-alignment` | `PASS`; `MF8 UI alignment OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript terminou sem erros. |
| `node --test real_dev/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js` | `PASS`; 5 testes, 5 pass, 0 fail, 0 skipped. |

## Contrato estatico observado

- Os tokens de cor, sidebar, estados, forms, tabelas e cards exigidos pelo gate existem em `styles.css`.
- `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge` e `AiSourceQualityPanel` existem no modulo partilhado.
- A pagina de sugestoes de IA apresenta qualidade da fonte e a regra de decisao humana.
- O contrato TypeScript atual e aceite pelo compilador em modo `--noEmit`.

## Negativos cobertos pelo gate

- Ausencia de tokens visuais obrigatorios.
- Ausencia dos componentes partilhados exigidos.
- Remocao de `AiSourceQualityPanel` ou `sourceQuality`.
- Remocao do script `test:mf8:ui-alignment` do package.

Os negativos acima sao verificacoes implementadas no gate; nao foram feitas mutacoes destrutivas ao codigo nesta revalidacao.

## Limites

- Nao foi executado browser, screenshot, teste visual por pixels ou teste E2E de interacao.
- O resultado e `PASS_ESTATICO`, nao uma certificacao de paridade visual completa.
- Nao foi executado build para evitar gerar artefactos dentro de `real_dev` durante esta correcao documental.

## Decisao

`PASS_ESTATICO`; gate UI, typecheck e contrato de guardrails de fonte passaram. A revisao visual em browser continua pendente.
