# Evidence MF8 / BK-MF8-09

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-09`
- Tema: documentacao tecnica minima
- RF/RNF: `RNF30`
- Data de revalidacao: `2026-07-09`
- Implementation root validado: `real_dev`

## Artefactos verificados

- Documento tecnico: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- Gate: `real_dev/api/scripts/check-mf8-technical-docs.mjs`
- Script npm: `test:mf8:technical-docs`

## Matriz de prova

| Cenario | Criterio | Resultado observado |
| --- | --- | --- |
| Documento atual | Inclui contexto, arquitetura, modelos, fluxos, subscricao simulada, limites e checklist. | `PASS`. |
| Mutacao `remove-limits` | A remocao de `## Limites` deve fazer o gate falhar. | `PASS_NEGATIVO`; falhou como esperado. |
| Mutacao `add-fiscal-certification` | Uma promessa de certificacao fiscal deve fazer o gate falhar. | `PASS_NEGATIVO`; falhou como esperado. |

## Comandos executados

| Comando | Resultado observado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:technical-docs` | `PASS`; `Documentacao tecnica minima MF8 validada.` |
| `OPSA_MF8_TECH_DOC_MUTATION=remove-limits npm --prefix real_dev/api run test:mf8:technical-docs` | Exit code `1`, esperado; falta da seccao `## Limites` detetada. |
| `OPSA_MF8_TECH_DOC_MUTATION=add-fiscal-certification npm --prefix real_dev/api run test:mf8:technical-docs` | Exit code `1`, esperado; promessa fora do MVP detetada. |

## Limites

- O gate prova presenca de secoes, marcadores e ausencia de promessas proibidas; nao prova a execucao E2E de cada fluxo descrito.
- O documento nao introduz endpoints, modelos ou capacidades novas.

## Decisao

`PASS_DOCUMENTAL`; o documento atual passa no gate e os dois negativos controlados falham como esperado.
