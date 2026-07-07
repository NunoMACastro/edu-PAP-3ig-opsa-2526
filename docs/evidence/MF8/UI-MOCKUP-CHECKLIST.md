<<<<<<< HEAD
<!-- docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md -->
# Checklist UI Mockup - MF8

## Contrato

- BK: BK-MF8-14
- RNF: RNF35
- Fonte visual: mockup/PALETA-CORES.md
- App validada: apps/web

## Critérios visuais

| Área | Expected | Observado | Decisão |
| --- | --- | --- | --- |
| Paleta | Royal Green, Royal Green Light, Royal Green Liquid, amarelo, vermelho, verde e dourado existem em CSS. | A preencher | A preencher |
| Sidebar | Fundo Royal Green, texto branco, item ativo Royal Green Light. | A preencher | A preencher |
| Header | Fundo branco, título do módulo em Royal Green, indicação PT visível quando existir no layout. | A preencher | A preencher |
| Botões | Ação principal amarela, hover dourado, foco visível. | A preencher | A preencher |
| Tabelas | Header verde suave, linhas legíveis, hover discreto, scroll horizontal quando necessário. | A preencher | A preencher |
| Cartões | Fundo branco, borda verde suave, título legível. | A preencher | A preencher |
| Estados | Loading, erro, vazio e sucesso têm texto e não dependem só da cor. | A preencher | A preencher |
| IA | Sugestões mostram fonte, limitação e decisão humana. | A preencher | A preencher |
| Mobile | Sidebar e conteúdo não sobrepõem texto em viewport estreita. | A preencher | A preencher |

## Negativos

1. Remover classe `.statusMessage--danger` deve fazer o gate falhar.
2. Remover `AiSourceQualityPanel` de `mf4Pages.tsx` deve fazer o gate falhar.
3. Remover `test:mf8:ui-alignment` de `package.json` deve fazer o comando npm falhar.
=======
# Checklist UI/mockup MF8 / BK-MF8-14

- Projeto: OPSA
- BK: BK-MF8-14
- Tema: aproximacao da UI real a UI do mockup
- RF/RNF: RNF35
- Data: 2026-07-06
- Implementation root validado: real_dev

## Fonte de verdade

- Guia canonico: `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md`
- Paleta do mockup: `mockup/PALETA-CORES.md`
- Layout de referencia: `mockup/src/app/components/Layout.tsx`
- CSS real: `real_dev/web/src/styles.css`
- Componentes reais: `real_dev/web/src/ui/opsaUi.tsx`
- Pagina IA real: `real_dev/web/src/pages/mf4Pages.tsx`
- Gate automatico: `real_dev/web/scripts/check-mf8-ui-alignment.mjs`

## Checklist visual

| Criterio | Fonte | Evidencia real | Estado |
| --- | --- | --- | --- |
| Fundo base preto da app | Mockup define base escura/preta. | `:root`, `html`, `body` e `.appShell` usam `--opsa-bg: #000000`; a decoracao radial foi removida do `body`. | PASS |
| Paleta OPSA centralizada | Mockup define `Royal Green`, amarelo, verde, dourado e vermelho. | `real_dev/web/src/styles.css` define `--opsa-royal-green: #004E53`, `--opsa-yellow: #FAF227`, `--opsa-royal-green-light`, `--opsa-royal-green-liquid`, `--opsa-red`, `--opsa-green` e `--opsa-gold`. | PASS |
| Sidebar verde | Mockup usa sidebar `Royal Green`. | `.sidebar` usa `background: var(--opsa-royal-green)`, texto branco e navegacao vertical. | PASS |
| Navegacao ativa e hover | Mockup distingue item ativo/hover. | `nav button:hover` usa `--opsa-royal-green-liquid`; `nav button.active` usa `--opsa-royal-green-light`. | PASS |
| Botoes primarios amarelos | Mockup usa botoes amarelos para acao primaria. | `button` usa `background: var(--opsa-yellow)`, `border-color: var(--opsa-yellow)` e texto `--opsa-royal-green`. | PASS |
| Foco visivel | RNF35 exige consistencia e acessibilidade. | `:focus-visible` em links, botoes e inputs aplica outline de 3px e sombra de foco. | PASS |
| Forms consistentes | Mockup usa campos claros e contornados. | `input`, `select` e `textarea` usam superficie branca, border verde translucid e hover `--opsa-royal-green-liquid`. | PASS |
| Tabelas responsivas | Mockup exige tabelas/cartoes consistentes. | `.tableWrap` tem overflow, border, radius e sombra; `table` mantem largura minima e cabecalho destacado. | PASS |
| Cards operacionais | Mockup exige cards com estados claros. | `.operation`, `.empty`, `.lineFields` e `.subscriptions*` usam superficies brancas, bordas OPSA, radius e sombra. | PASS |
| Estados de feedback | Guia exige sucesso, erro, aviso e vazio visiveis. | `.error`, `.success`, `.empty` e `.statusMessage--success|warning|danger|neutral` existem com borda lateral/cores por estado. | PASS |
| Componentes partilhados | Guia exige `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge` e `AiSourceQualityPanel`. | `real_dev/web/src/ui/opsaUi.tsx` exporta esses componentes e limita tons visuais conhecidos. | PASS |
| Feedback acessivel | Guia exige estados acessiveis. | `StatusMessage` usa `role="alert"` para erro, `role="status"` para restantes tons e `aria-live`. | PASS |
| IA com fonte e limitacao | BK13 entrega `sourceQuality`; BK14 deve apresentar fonte e limites. | `AiSourceQualityPanel` mostra confianca, fonte, tipo/id, limitacao e texto de decisao humana. | PASS |
| Pagina de sugestoes de IA | UI deve consumir o handoff BK13. | `AiSuggestionsPage` importa `AiSourceQualityPanel`, renderiza `sourceQuality` e mostra `StatusMessage` de decisao humana. | PASS |
| Gate repetivel | Guia exige prova automatica local. | `package.json` expoe `test:mf8:ui-alignment`, que valida estilos, componentes, paginas e consumo de `sourceQuality`. | PASS |

## Itens nao validados por screenshot

- Nao foi capturado screenshot/browser nesta correcao documental.
- A checklist valida a correspondencia por contrato, CSS, componentes e gate automatico.
- Uma revisao visual manual continua recomendada antes de defesa final, mas nao bloqueia a correcao do finding documental `P3-BK-MF8-14-EVIDENCE-001`.

## Decisao

A checklist exigida pelo guia BK-MF8-14 fica criada e preenchida com criterios concretos do mockup. O estado observado e `PASS` para os criterios verificaveis por ficheiros e gate local.
>>>>>>> 81619f4 (Update: Mid)
