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