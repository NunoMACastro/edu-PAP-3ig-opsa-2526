# Checklist UI/mockup MF8 / BK-MF8-14

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-14`
- RF/RNF: `RNF35`
- Data de revalidacao: `2026-07-09`
- Implementation root validado: `real_dev`
- Nivel de prova: `ESTATICO_SEM_BROWSER`

## Fontes verificadas

- `mockup/PALETA-CORES.md`
- `mockup/src/app/components/Layout.tsx`
- `real_dev/web/src/styles.css`
- `real_dev/web/src/ui/opsaUi.tsx`
- `real_dev/web/src/lib/mf4Api.ts`
- `real_dev/web/src/pages/mf4Pages.tsx`
- `real_dev/web/scripts/check-mf8-ui-alignment.mjs`

## Checklist verificavel

| Criterio | Evidencia estatica | Estado |
| --- | --- | --- |
| Tokens OPSA e fundo base | O gate encontra os tokens obrigatorios e as regras de base em `styles.css`. | `PASS_ESTATICO` |
| Sidebar e navegacao | O gate encontra `.appShell`, `.sidebar` e estados de navegacao esperados. | `PASS_ESTATICO` |
| Botoes, forms, tabelas e cards | As regras comuns exigidas pelo gate existem em `styles.css`. | `PASS_ESTATICO` |
| Estados de feedback | `StatusMessage` e classes de estado existem no modulo partilhado e nos estilos. | `PASS_ESTATICO` |
| Componentes partilhados | `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge` e `AiSourceQualityPanel` sao exportados. | `PASS_ESTATICO` |
| Fonte e limites da IA | `sourceQuality` e `AiSourceQualityPanel` sao consumidos pela pagina de sugestoes. | `PASS_ESTATICO` |
| Contrato TypeScript | `npm --prefix real_dev/web run typecheck` terminou com exit code `0`. | `PASS` |
| Gate repetivel | `npm --prefix real_dev/web run test:mf8:ui-alignment` devolveu `MF8 UI alignment OK`. | `PASS` |

## Itens nao validados

- Renderizacao real num browser.
- Comparacao por screenshot ou pixels.
- Responsividade medida em viewports reais.
- Navegacao com sessao e dados reais.
- Acessibilidade por tecnologia assistiva.

## Decisao

A checklist confirma o contrato estatico automatizado e os artefactos referidos. Nao deve ser usada como prova de paridade visual completa; essa conclusao exige uma passagem manual ou E2E em browser.
