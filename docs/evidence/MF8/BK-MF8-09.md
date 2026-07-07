# Evidence MF8 / BK-MF8-09

- Projeto: OPSA
- BK: BK-MF8-09
<<<<<<< HEAD
- Tema: documentação técnica mínima
- RF/RNF: RNF30
- Data: YYYY-MM-DD
- Responsável: Pedro
- Apoio: Oleksii

## Artefactos verificados

- Documento técnico: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- Gate automático: `apps/api/scripts/check-mf8-technical-docs.mjs`
- Script de package: `test:mf8:technical-docs`

## Comandos executados

| Comando | Critério de sucesso | Evidência a anexar |
| --- | --- | --- |
| `cd apps/api && npm run test:mf8:technical-docs` | Exit code `0`; o documento contém módulos, modelos, fluxos, limites e não promete certificação fiscal ou pagamento real. | Anexar output real do terminal; se falhar, corrigir a secção indicada pelo gate antes de fechar o BK. |
| `cd apps/api && npm run syntax:check` | Exit code `0`; os scripts e ficheiros JavaScript/TypeScript continuam sintaticamente válidos. | Anexar output real do terminal; se falhar, registar o ficheiro e corrigir a sintaxe antes da defesa. |

## Negativos validados

- [ ] Remover `## Limites` falha o gate com erro sobre secção obrigatória.
- [ ] Escrever `certificação fiscal` falha o gate por promessa fora do MVP.

## Handoff para BK-MF8-10

- O documento técnico identifica módulos, modelos e fluxos que os insights devem respeitar.
- A subscrição da MF8 está documentada como simulada e sem pagamento real.
- As limitações contabilísticas estão explícitas antes de avançar para explicabilidade da IA.
=======
- Tema: documentacao tecnica minima
- RF/RNF: RNF30
- Data: 2026-07-05
- Responsavel: Pedro
- Apoio: Oleksii
- Implementation root validado: real_dev

## Artefactos verificados

- Documento tecnico: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- Gate automatico: `real_dev/api/scripts/check-mf8-technical-docs.mjs`
- Script de package: `test:mf8:technical-docs`
- Relatorio de implementacao: `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

## Matriz de prova

| RNF | Prova automatica | Criterio de sucesso | Resultado observado |
| --- | --- | --- | --- |
| RNF30 | `test:mf8:technical-docs` valida existencia, secoes obrigatorias e marcadores de arquitetura real. | O documento cobre arquitetura, modelos, fluxos, subscricao simulada, limites e checklist. | PASS; gate positivo executado em 2026-07-05. |
| RNF30 | Negativo `OPSA_MF8_TECH_DOC_MUTATION=remove-limits`. | A ausencia de `## Limites` faz o gate falhar. | PASS; o comando falhou de forma controlada com erro de seccao obrigatoria. |
| RNF30 | Negativo `OPSA_MF8_TECH_DOC_MUTATION=add-fiscal-certification`. | Prometer certificacao fiscal faz o gate falhar. | PASS; o comando falhou de forma controlada por promessa fora do MVP. |

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test:mf8:technical-docs` | PASS; documento tecnico minimo MF8 validado. |
| `OPSA_MF8_TECH_DOC_MUTATION=remove-limits npm --prefix real_dev/api run test:mf8:technical-docs` | PASS_NEGATIVO; falhou como esperado por falta de `## Limites`. |
| `OPSA_MF8_TECH_DOC_MUTATION=add-fiscal-certification npm --prefix real_dev/api run test:mf8:technical-docs` | PASS_NEGATIVO; falhou como esperado por promessa de certificacao fiscal. |
| `npm --prefix real_dev/api run syntax:check` | PASS; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `npm --prefix real_dev/api run test:contracts` | PASS; suites de contrato existentes verdes. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | PASS; contrato frontend MF8 de subscricoes preservado. |
| `npm --prefix real_dev/web run typecheck` | PASS; TypeScript sem erros. |
| `git diff --check` | PASS; sem whitespace errors. |

## Negativos validados

- Remover `## Limites` invalida o documento.
- Declarar `certificacao fiscal` invalida o documento.
- O gate tambem rejeita promessas proibidas sobre gateway de pagamento real, checkout, OCR, RAG, embeddings, automacao contabilistica e IA que altera dados contabilisticos.

## Limites confirmados

- A documentacao descreve a arquitetura real; nao cria endpoints, modelos ou funcionalidades novas.
- A subscricao MF8 continua simulada, sem pagamentos reais, invoices, recibos, checkout, webhooks ou lancamentos contabilisticos automaticos.
- A IA continua limitada a analise, explicacao, origem dos dados e recomendacao; nao executa acoes.
- Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, `apps/` ou `mockup/`.

## Handoff para BK-MF8-10

- Documento tecnico entregue: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`.
- Gate repetivel entregue: `npm --prefix real_dev/api run test:mf8:technical-docs`.
- O proximo BK pode usar as secoes de IA, fontes de dados, limites e subscricao simulada como base para validar explicacao e origem dos insights.

## Decisao

`BK-MF8-09` fica implementado com documento tecnico minimo, evidence de execucao e gate automatico ligado ao package da API real.
>>>>>>> 81619f4 (Update: Mid)
