> [!WARNING]
> `SNAPSHOT_HISTORICO_SUPERSEDED` — estado `SUPERSEDED` em 2026-07-10.
>
> Este relatório preserva um snapshot histórico e não representa o estado corrente.
> Fonte atual: [relatório canónico](../auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md).
> Não reutilizar contagens, comandos, paths ou decisões deste corpo como evidence atual.

# Implementacao real_dev - MF8

## Execucao 2026-07-07 - BK-MF8-16

### Resultado geral

Estado geral: `IMPLEMENTADO`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-16`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-16 - Verificacao dos testes atuais e criacao dos testes em falta` ficou implementado na app real. A execucao criou um inventario executavel de testes e gates para `MF0..MF8`, acrescentou contrato positivo/negativo para esse inventario, fechou a lacuna de integracao MF1 e ligou comandos agregados `test:mf8` e `test:final:prepare` em API e web.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` nesta execucao foi este relatorio permitido por `OUTPUT_MODE=relatorio_e_resumo`; a evidence dedicada `docs/evidence/MF8/TESTES-EM-FALTA.md` nao foi criada porque `PERMITIR_ALTERAR_DOCS=nao` bloqueia evidence.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-16` | `IMPLEMENTADO` | `real_dev/api/scripts/check-mf8-test-inventory.mjs`, `real_dev/api/tests/contracts/mf8-test-inventory-contracts.test.js`, `real_dev/api/tests/integration/mf1-sales-purchases-treasury-flow.test.js`, scripts `test:mf8`/`test:final:prepare` em API e web, e validacoes executadas abaixo. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-16` | `RNF37` | `real_dev/api/scripts/check-mf8-test-inventory.mjs`; `real_dev/api/tests/contracts/mf8-test-inventory-contracts.test.js`; `real_dev/api/tests/integration/mf1-sales-purchases-treasury-flow.test.js`; `real_dev/api/package.json`; `real_dev/web/package.json`; `real_dev/web/scripts/check-mf2-pages.mjs`; `real_dev/web/scripts/check-mf5-feedback.mjs`; `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `test:mf8:inventory`; `test:mf8:inventory-contracts`; nova integracao MF1; `test:mf8` API/web; `test:final:prepare` API/web; `prisma:validate`; `validate-planificacao.sh`; pesquisas estaticas; whitespace/diff. |

### Contratos consumidos

- `BK-MF7-10`: baseline de testes automatizados para modulos criticos, incluindo contratos de faturacao, IVA, balancetes e reconciliacao.
- `BK-MF8-08`: contratos e smokes de subscricoes simuladas, incluindo ausencia de gateway de pagamento real.
- `BK-MF8-09`: gate `test:mf8:technical-docs`.
- `BK-MF8-10` e `BK-MF8-11`: contratos de IA explicavel, fontes e recomendacao sem acao automatica.
- `BK-MF8-14` e `BK-MF8-15`: gates frontend `test:mf8:ui-alignment` e `test:mf8:formatters`.
- `RNF37`: rever testes existentes e criar testes em falta para fluxos criticos antes da execucao final.

### Contratos entregues

- Novo gate `real_dev/api/scripts/check-mf8-test-inventory.mjs` com matriz minima para `MF0..MF8`, contagem por camada, scripts obrigatorios e saida Markdown.
- O inventario falha com exit code `1` quando existe `LACUNA`, e passa quando todas as camadas minimas e scripts obrigatorios existem.
- Novo contrato `real_dev/api/tests/contracts/mf8-test-inventory-contracts.test.js` com positivo completo e negativo sem provas MF8.
- Nova integracao `real_dev/api/tests/integration/mf1-sales-purchases-treasury-flow.test.js`, cobrindo recebimentos e pagamentos separados, `companyId` do contexto backend e auditoria.
- `real_dev/api/package.json` expoe `test:mf8:inventory`, `test:mf8:inventory-contracts`, agregador `test:mf8` e `test:final:prepare`.
- `real_dev/web/package.json` expoe agregador `test:mf8` e `test:final:prepare`.
- Smokes textuais antigos de MF2/MF5 foram alinhados com o contrato real atual: exportacoes MF2 via `/export?format=...` e texto PT-PT acentuado em MF4.
- Handoff para `BK-MF8-17`: `npm --prefix real_dev/api run test:final:prepare` e `npm --prefix real_dev/web run test:final:prepare`; se nao houver base efemera para integracao persistida, a API pode ser executada com `OPSA_SKIP_PERSISTENCE_TESTS=true` e a limitacao deve ficar explicita.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | O inventario consome a modularidade/testes MF7 e nao altera contratos de exportacao, importacao, SAF-T, email ou retencao. |
| `BK-MF8-15 -> BK-MF8-16` | `OK` | O gate `test:mf8:formatters` passou a entrar no agregador web e na matriz de inventario. |
| `BK-MF8-16 -> BK-MF8-17` | `OK_COM_RESSALVA` | A bateria final esta preparada. A validacao API persistida continua dependente de `TEST_DATABASE_URL` ou skip explicito, conforme os testes MF2/MF3 ja documentam. |

### Findings por severidade

Nao ha findings `P0` ou `P1` ativos confirmados para `BK-MF8-16`.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 2 | `CORRIGIDO`: drifts textuais nos smokes `test:mf2` e `test:mf5:feedback`, expostos pela preparacao final web. |

### Ficheiros alterados

- `real_dev/api/scripts/check-mf8-test-inventory.mjs`
- `real_dev/api/tests/contracts/mf8-test-inventory-contracts.test.js`
- `real_dev/api/tests/integration/mf1-sales-purchases-treasury-flow.test.js`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/web/scripts/check-mf2-pages.mjs`
- `real_dev/web/scripts/check-mf5-feedback.mjs`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-datas-moedas-e-separadores-no-padrao-europeu.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-17-execucao-final-de-testes.md`
- `real_dev/api/tests/unit`, `real_dev/api/tests/contracts`, `real_dev/api/tests/integration`, `real_dev/api/scripts`, `real_dev/web/scripts`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_RESSALVAS`; ja existiam artefactos MF8 untracked e foram preservados. |
| `git check-ignore -v real_dev real_dev/api/package.json real_dev/web/package.json` | `PASS`; `.gitignore:4:real_dev/` confirma que a implementacao real e ignorada por git neste checkout. |
| `node --check real_dev/api/scripts/check-mf8-test-inventory.mjs` | `PASS`; sintaxe valida. |
| `npm --prefix real_dev/api run test:mf8:inventory` | `PASS`; matriz `MF0..MF8` toda em `OK`, 8 unit API, 22 contratos API, 3 integracoes API, 16 scripts API e 14 scripts frontend. |
| `npm --prefix real_dev/api run test:mf8:inventory-contracts` | `PASS`; 2 testes, positivo e negativo. |
| `node --test real_dev/api/tests/integration/mf1-sales-purchases-treasury-flow.test.js` | `PASS`; 2 testes, incluindo negativo multiempresa. |
| `npm --prefix real_dev/api run test:mf8` | `PASS`; subscricoes, IA explicavel, IA governada, docs tecnicos, inventario e contrato do inventario. |
| `npm --prefix real_dev/web run test:mf8` | `PASS`; subscriptions UI, UI alignment, formatters, typecheck e build. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; todos os ficheiros JS em `src`, `tests` e `scripts` passaram `node --check`. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes MF1 passaram e 2 suites persistidas MF2/MF3 foram saltadas explicitamente por falta de `TEST_DATABASE_URL`. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | `PASS_COM_RESSALVAS`; unit, contracts, integration com skip explicito, MF6, MF7 e MF8 passaram. |
| `npm --prefix real_dev/web run test:mf2` | `PASS`; depois de alinhar o smoke aos exports atuais por `format`. |
| `npm --prefix real_dev/web run test:final:prepare` | `PASS`; MF1, MF2, MF3, MF5, MF7 e MF8, incluindo typecheck/build. |
| Pesquisas estaticas nos ficheiros alterados | `PASS`; sem hits para TODOs, storage sensivel, execucao dinamica, segredos hardcoded, CORS, RAG/OCR/embeddings, casts inseguros ou drift de dominio. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais legados. |

### Validacoes nao executadas

- `docs/evidence/MF8/TESTES-EM-FALTA.md` nao foi criado nem preenchido porque `PERMITIR_ALTERAR_DOCS=nao` bloqueia evidence. A matriz gerada pelo inventario e os resultados de comandos ficam registados neste relatorio permitido.
- Integracao persistida MF2/MF3 com base real nao foi executada porque nao existe `TEST_DATABASE_URL` configurada neste ambiente. Foi usado skip explicito, conforme contrato dos proprios testes.
- Smoke browser manual nao foi executado; a prova ficou nos gates textuais, typecheck, build e contratos automatizados.

### Blockers e TODOs

- Sem blockers de implementacao para `BK-MF8-16`.
- TODO operacional para `BK-MF8-17`: executar `test:final:prepare` API com `TEST_DATABASE_URL` efemera para remover a ressalva de skip persistido, ou registar o skip como limitacao controlada.
- TODO condicionado por permissao documental: quando for permitido editar evidence, criar/preencher `docs/evidence/MF8/TESTES-EM-FALTA.md` com a matriz do inventario e os outputs finais.

### Decisao final

`BK-MF8-16` fica `IMPLEMENTADO`. A proxima acao recomendada e executar `BK-MF8-17 - Execucao final de testes`, usando a bateria agora publicada em API e web e decidindo explicitamente o tratamento dos testes persistidos MF2/MF3.

## Execucao 2026-07-06 - BK-MF8-15

### Resultado geral

Estado geral: `IMPLEMENTADO`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-15`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-15 - Datas, moedas e separadores no padrao europeu` ficou implementado na app real. A execucao centralizou a localizacao PT-PT no frontend, preservando a regra do BK: a API continua a transportar valores tecnicos previsiveis, como centimos, datas ISO e basis points, e a UI converte apenas para apresentacao humana.

Nao foram alterados endpoints, Prisma, roles, permissoes, autenticacao, ownership, regras contabilisticas, BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` nesta execucao foi este relatorio permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-15` | `IMPLEMENTADO` | `real_dev/web/src/lib/formatters.ts`, integracao em MF1/MF2/ResponsiveDataTable/subscricoes, gate `real_dev/web/scripts/check-mf8-formatters.mjs`, script `test:mf8:formatters` e validacoes executadas abaixo. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-15` | `RNF36` | `real_dev/web/src/lib/formatters.ts`; `real_dev/web/src/lib/mf1FormUtils.ts`; `real_dev/web/src/pages/mf1Pages.tsx`; `real_dev/web/src/pages/mf2Pages.tsx`; `real_dev/web/src/ui/ResponsiveDataTable.tsx`; `real_dev/web/src/lib/subscriptionsApi.ts`; `real_dev/web/src/pages/SubscriptionsPage.tsx`; `real_dev/web/scripts/check-mf8-formatters.mjs`; `real_dev/web/package.json`; `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `test:mf8:formatters`; `typecheck`; `build`; `test:mf1`; `test:mf5:responsive`; `test:mf8:subscriptions-ui`; `test:mf8:ui-alignment`; pesquisas estaticas; `git check-ignore`; validacoes finais de whitespace/diff. |

### Contratos consumidos

- `MF1/MF2`: tabelas dinamicas que percorrem colunas e agora passam `column` para a regra transversal de apresentacao.
- `MF5`: `ResponsiveDataTable` continua a servir desktop/mobile com a mesma fonte de dados.
- `BK-MF8-07`: a UI de subscricoes continua a mostrar planos e datas da subscricao simulada, agora usando formatadores centrais.
- `BK-MF8-14`: a camada visual comum ficou estavel antes da localizacao PT-PT.
- `RNF36`: datas, moedas, numeros e separadores devem seguir o padrao europeu sem alterar valores tecnicos persistidos.

### Contratos entregues

- Novo modulo `real_dev/web/src/lib/formatters.ts` com `PORTUGAL_LOCALE`, `DEFAULT_CURRENCY`, `formatEuroFromCents`, `formatDecimalPt`, `formatIntegerPt`, `formatPercentFromBasisPoints`, `formatPortugueseDate` e `formatDisplayValue`.
- `formatEuroFromCents(123456)` apresenta `1 234,56 €` e rejeita centimos fracionarios.
- `formatPortugueseDate("2026-12-31")` apresenta `31/12/2026` e rejeita datas ISO impossiveis como `2026-02-31`.
- `formatDisplayValue(columnName, value)` usa o nome da coluna para distinguir `amountCents`/`priceCents`, `rateBps`/`vatRateBps`, datas e valores simples.
- `mf1FormUtils.formatValue(value, columnName)` preserva a API interna antiga e delega a apresentacao no formatter central.
- Tabelas MF1, MF2 e `ResponsiveDataTable` passam a coluna ao formatador, evitando que valores monetarios continuem a aparecer como inteiros brutos.
- `subscriptionsApi.formatPlanPrice()` e `SubscriptionsPage.formatDate()` deixam de ter `Intl` local e usam o contrato central.
- Novo gate `real_dev/web/scripts/check-mf8-formatters.mjs`, exposto por `test:mf8:formatters`.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | A modularidade frontend e a regra de nao alterar backend/Prisma foram preservadas; `real_dev/` continua ignorado por git conforme contrato local. |
| `BK-MF8-14 -> BK-MF8-15` | `OK` | O BK15 reutiliza a UI comum ja estabilizada e nao reabre a camada visual. |
| `BK-MF8-15 -> BK-MF8-16` | `OK_COM_RESSALVA` | O gate `test:mf8:formatters` fica pronto para inventario no BK16. A evidence dedicada `docs/evidence/MF8/BK-MF8-15.md` nao foi criada porque `PERMITIR_ALTERAR_DOCS=nao` bloqueia evidence; a prova fica neste relatorio permitido. |

### Findings por severidade

Nao ha findings ativos confirmados para `BK-MF8-15`.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 1 | `VALIDACAO_FORA_SCOPE`: `test:mf2` falha num marcador textual legado de exportacao (`Descarregar balancete Excel`) que nao foi alterado por este BK. |

### Ficheiros alterados

- `real_dev/web/src/lib/formatters.ts`
- `real_dev/web/src/lib/mf1FormUtils.ts`
- `real_dev/web/src/pages/mf1Pages.tsx`
- `real_dev/web/src/pages/mf2Pages.tsx`
- `real_dev/web/src/ui/ResponsiveDataTable.tsx`
- `real_dev/web/src/lib/subscriptionsApi.ts`
- `real_dev/web/src/pages/SubscriptionsPage.tsx`
- `real_dev/web/scripts/check-mf8-formatters.mjs`
- `real_dev/web/package.json`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-datas-moedas-e-separadores-no-padrao-europeu.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-16-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `docs/evidence/MF8/BK-MF8-14.md`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/lib/mf5FormValidators.ts`
- `real_dev/web/tsconfig.json`
- `real_dev/web/package.json`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_RESSALVAS`; ja existiam artefactos MF8 untracked e foram preservados. |
| `git check-ignore -v real_dev real_dev/web/src/lib/formatters.ts real_dev/web/scripts/check-mf8-formatters.mjs` | `PASS`; `.gitignore:4:real_dev/` confirma que a implementacao real e ignorada por git neste checkout. |
| `npm --prefix real_dev/web run test:mf8:formatters` | `PASS`; `BK-MF8-15 formatters: OK`. |
| `node --experimental-strip-types --input-type=module -e "...formatters.ts..."` | `PASS`; observou `1 234,56 €`, `31/12/2026`, `23,00 %` e negativos para centimos fracionarios/data impossivel. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 50 modulos transformados. |
| `npm --prefix real_dev/web run test:mf1` | `PASS`; `MF1 frontend pages contract OK`. |
| `npm --prefix real_dev/web run test:mf5:responsive` | `PASS`; `MF5 responsive table smoke OK`. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |
| `npm --prefix real_dev/web run test:mf8:ui-alignment` | `PASS`; `MF8 UI alignment OK`. |
| `npm --prefix real_dev/web run test:mf2` | `FAIL_FORA_SCOPE`; falhou em `Fluxo BK-MF2-07 na UI em falta: Descarregar balancete Excel`. O ficheiro atual tem links `Balancete {format}` e `Razao/ Razão {format}`; a alteracao BK15 neste ficheiro limitou-se a passar `column` para `formatValue`. |
| Pesquisas estaticas de risco nos ficheiros alterados | `PASS`; sem hits para TODOs, storage sensivel, execucao dinamica, segredos, CORS, RAG/OCR/embeddings, casts `as any` ou drift de dominio. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais legados. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \t]+$" ...ficheiros alterados...` | `PASS`; sem trailing whitespace nos ficheiros alterados em `real_dev` e neste relatorio. |

### Validacoes nao executadas

- Validacoes API (`syntax:check`, `test:contracts`, `test:unit`, `prisma:validate`) nao foram executadas nesta ronda porque o BK15 nao alterou API, Prisma, endpoints, auth, roles ou persistencia.
- `docs/evidence/MF8/BK-MF8-15.md` nao foi criado por `PERMITIR_ALTERAR_DOCS=nao`; a evidence tecnica desta execucao fica registada neste relatorio permitido.
- Smoke browser manual nao foi executado; a prova ficou em gate comportamental, typecheck, build e smokes frontend existentes.

### Blockers e TODOs

- Sem blockers de implementacao para `BK-MF8-15`.
- TODO fora do scope atual: alinhar o smoke `test:mf2` com os labels atuais de exportacao ou corrigir a UI MF2 numa tarefa propria, sem misturar essa manutencao com o BK15.
- TODO condicionado por permissao documental: quando for permitido editar evidence, criar `docs/evidence/MF8/BK-MF8-15.md` com outputs reais do gate, typecheck e negativos.

### Decisao final

`BK-MF8-15` fica `IMPLEMENTADO`. A proxima acao recomendada e executar `BK-MF8-16 - Verificacao dos testes atuais e criacao dos testes em falta`, inventariando tambem `test:mf8:formatters` e registando a lacuna conhecida do smoke MF2 se ainda estiver aberta.

## Execucao 2026-07-06 - Correcao posterior BK-MF8-14 evidence/checklist

- Pedido posterior: corrigir finding `P3-BK-MF8-14-EVIDENCE-001`.
- Resultado: `CORRIGIDO`.
- Codigo runtime alterado: `nao`.
- Evidence criada: `docs/evidence/MF8/BK-MF8-14.md`.
- Checklist criada: `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md`.
- Relatorio de auditoria atualizado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`.
- Relatorio de correcao atualizado: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`.

Esta nota corrige a limitacao documental da execucao original, que tinha `PERMITIR_ALTERAR_DOCS=nao`. A implementacao runtime de `BK-MF8-14` permanece a mesma.

## Execucao 2026-07-06 - BK-MF8-14

### Resultado geral

Estado geral: `IMPLEMENTADO`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-14`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-14 - Aproximacao da UI a UI do mockup` ficou implementado na app real. A execucao consolidou o contrato visual `RNF35` no frontend real, sem copiar o mockup como imagem estatica e sem trocar dados reais por dados decorativos. A UI passa a consumir o handoff do `BK-MF8-13`: sugestoes de IA mostram fonte, limitacao e aviso de decisao humana.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` nesta execucao foi este relatorio permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-14` | `IMPLEMENTADO` | `real_dev/web/src/ui/opsaUi.tsx`, `real_dev/web/src/lib/mf4Api.ts`, `real_dev/web/src/pages/mf4Pages.tsx`, `real_dev/web/src/styles.css`, `real_dev/web/scripts/check-mf8-ui-alignment.mjs`, script `test:mf8:ui-alignment` e validacoes executadas abaixo. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-14` | `RNF35` | `real_dev/web/src/styles.css`; `real_dev/web/src/ui/opsaUi.tsx`; `real_dev/web/src/lib/mf4Api.ts`; `real_dev/web/src/pages/mf4Pages.tsx`; `real_dev/web/scripts/check-mf8-ui-alignment.mjs`; `real_dev/web/package.json`; `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `test:mf8:ui-alignment`; `typecheck`; `build`; `test:mf8:subscriptions-ui`; teste dedicado BK13 de handoff; `test:contracts`; `test:unit`; `prisma:validate`; pesquisas estaticas; `validate-planificacao.sh`; `git diff --check`; whitespace direto nos ficheiros ignorados. |

### Contratos consumidos

- `MF5`: `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge`, `ResponsiveDataTable`, feedback acessivel e base de paleta OPSA ja existente.
- `MF7`: modularidade frontend e scripts de qualidade preservados; `real_dev/` continua ignorado por git conforme contrato local.
- `BK-MF8-07`: UI de subscricoes simuladas continua validada pelo smoke `test:mf8:subscriptions-ui`.
- `BK-MF8-13`: API devolve `sourceQuality` e `guardrail` em sugestoes de IA, prontos para consumo visual no BK14.
- `BK-MF8-15`: a UI fica com painel e gate estaveis para o proximo BK aplicar localizacao PT-PT sem reabrir a camada visual.

### Contratos entregues

- `AiSourceQualityPanel` em `real_dev/web/src/ui/opsaUi.tsx`, com fallback acessivel `Fonte por confirmar` quando a resposta antiga nao trouxer metadados.
- Tipo `AiSourceQuality` e campos opcionais `sourceQuality`/`guardrail` em `real_dev/web/src/lib/mf4Api.ts`.
- `AiSuggestionsPage` mostra titulo, racional, `actionType`, fonte, limitacao e mensagem explicita de decisao humana.
- `real_dev/web/src/styles.css` inclui `.aiSourceQuality` e remove a decoracao radial do `body`, alinhando o fundo base ao preto do mockup.
- Novo gate `real_dev/web/scripts/check-mf8-ui-alignment.mjs`, que valida paleta, shell, sidebar, PageFrame, StatusMessage, painel de IA, consumo de `sourceQuality`, wrappers de paginas e script no package.
- `real_dev/web/package.json` expoe `test:mf8:ui-alignment`.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | A modularidade frontend e os scripts existentes foram preservados; o novo gate segue o padrao dos checks MF5/MF7/MF8 ja presentes no package web. |
| `BK-MF8-13 -> BK-MF8-14` | `OK` | `sourceQuality` e `guardrail` sao consumidos pela UI, mantendo fonte, limitacao e decisao humana visiveis. |
| `BK-MF8-14 -> BK-MF8-15` | `OK` | A camada visual comum, estados acessiveis e gate UI ficam estaveis para o proximo BK centralizar datas, moedas e separadores PT-PT. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/web/src/styles.css`
- `real_dev/web/src/ui/opsaUi.tsx`
- `real_dev/web/src/lib/mf4Api.ts`
- `real_dev/web/src/pages/mf4Pages.tsx`
- `real_dev/web/scripts/check-mf8-ui-alignment.mjs`
- `real_dev/web/package.json`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-13-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-14-aproximacao-da-ui-a-ui-do-mockup.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-15-datas-moedas-e-separadores-no-padrao-europeu.md`
- `mockup/PALETA-CORES.md`
- `mockup/src/styles/theme.css`
- `mockup/src/app/components/Layout.tsx`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/styles.css`
- `real_dev/web/src/ui/opsaUi.tsx`
- `real_dev/web/src/lib/mf4Api.ts`
- `real_dev/web/src/pages/mf4Pages.tsx`
- `real_dev/web/package.json`
- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_RESSALVAS`; ja existiam artefactos MF8 untracked e foram preservados. |
| `git check-ignore -v real_dev ...` | `PASS`; `.gitignore:4:real_dev/` confirma que a implementacao real e ignorada por git neste checkout. |
| `npm --prefix real_dev/web run test:mf8:ui-alignment` | `PASS`; `MF8 UI alignment OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 118 testes, 118 pass. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| Pesquisas estaticas de risco nos ficheiros alterados | `PASS`; sem hits para TODOs, storage sensivel, execucao dinamica, segredos, CORS, RAG/OCR/embeddings, casts inseguros ou drift de dominio. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais legados fora do scope. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \t]+$" ...ficheiros alterados em real_dev...` | `PASS`; sem trailing whitespace nos ficheiros ignorados alterados. |

### Validacoes nao executadas

- Screenshot/manual browser smoke nao executado nesta sessao; a prova ficou em gate estatico, typecheck, build e checks de contrato.
- `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` e `docs/evidence/MF8/BK-MF8-14.md` nao foram criados por `PERMITIR_ALTERAR_DOCS=nao`; a evidence tecnica desta execucao fica registada neste relatorio permitido.
- Smoke HTTP autenticado real nao foi executado; nao era necessario para este BK visual, e a integracao API/UI foi coberta por contrato BK13, typecheck e build.

### Blockers e TODOs

- Sem blockers de implementacao para `BK-MF8-14`.
- TODO operacional fora do scope atual: quando for permitido editar evidence, criar `docs/evidence/MF8/UI-MOCKUP-CHECKLIST.md` e `docs/evidence/MF8/BK-MF8-14.md` com screenshots/observed reais da equipa.

### Decisao final

`BK-MF8-14` fica `IMPLEMENTADO`. A proxima acao recomendada e executar `BK-MF8-15 - Datas, moedas e separadores no padrao europeu`, reutilizando a UI comum e o gate `test:mf8:ui-alignment`.

## Atualizacao 2026-07-06 - Correcao posterior de evidence BK-MF8-13

O finding documental `P3-BK-MF8-13-EVIDENCE-001` foi corrigido apos a auditoria de implementacao: `docs/evidence/MF8/BK-MF8-13.md` existe agora e regista artefactos, comandos, negativos, limites e handoff do `BK-MF8-13`.

A execucao de implementacao abaixo mantem valor historico: nesse momento `PERMITIR_ALTERAR_DOCS=nao` impediu criar evidence dedicada. A ressalva documental deixou de estar ativa apos a correcao posterior.

## Execucao 2026-07-06 - BK-MF8-13

### Resultado geral

Estado geral: `IMPLEMENTADO`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-13`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-13 - IA deve evitar enviesamentos e sugerir acoes baseadas em dados reais` ficou `IMPLEMENTADO`. A implementacao acrescentou um guardrail reutilizavel de qualidade das fontes (`RNF34`), aplicado antes de persistir sugestoes de IA, mantendo a fronteira de `BK-MF8-11`: a IA recomenda com fonte e limitacao, mas a decisao continua humana.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/`, `mockup/` nem `docs/evidence`. A unica alteracao fora de `real_dev/` nesta execucao foi este relatorio permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-13` | `IMPLEMENTADO` | `real_dev/api/src/modules/ai/aiSourceGuardrails.js`, integracao em `generateAiSuggestions`, teste `mf8-ai-source-guardrails.contract.test.js` e validacoes executadas abaixo. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-13` | `RNF34` | `real_dev/api/src/modules/ai/aiSourceGuardrails.js`; `real_dev/api/src/modules/ai/aiService.js`; `real_dev/api/src/modules/ai/aiRoutes.js`; `real_dev/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js`; `real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js`; `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | teste dedicado BK13; `syntax:check`; `prisma:validate`; `test:contracts`; `test:unit`; pesquisas estaticas; `typecheck`; `build`; validacoes finais de planificacao/whitespace |

### Contratos consumidos

- `MF0/MF7`: sessao autenticada, cookie HttpOnly, empresa ativa resolvida no backend, roles/permissoes backend e modularidade preservadas.
- `MF4`: `AiInsight`, `AiActionSuggestion`, `generateAiSuggestions()`, rota `/api/ai/suggestions` e dados de origem de relatorios, KPIs, documentos de venda, previsao de tesouraria e alertas de stock.
- `BK-MF8-10`: insights com `sourceType`, `sourceId`, `sourceLabel` e `explanation` antes de qualquer exposicao publica.
- `BK-MF8-11`: `assertAiRecommendationOnly()` continua a bloquear acoes financeiras/contabilisticas antes da persistencia de sugestoes.
- `BK-MF8-12`: preferencias de alertas `ai` continuam a controlar rececao de notificacoes, sem executar acoes automaticas.

### Contratos entregues

- Novo modulo `aiSourceGuardrails.js` com `classifyAiSourceQuality()` e `assertAiSourceQuality()`.
- A validacao de qualidade exige empresa ativa, `sourceType`, `sourceId`, `sourceLabel`, `actionType` e explicacao minima de 40 caracteres.
- As falhas usam `HttpError` com codigos estaveis: `AI_SOURCE_COMPANY_REQUIRED`, `AI_SOURCE_TRACE_REQUIRED`, `AI_SOURCE_ACTION_REQUIRED` e `AI_SOURCE_EXPLANATION_TOO_SHORT`.
- `generateAiSuggestions()` chama `assertAiRecommendationOnly()` e depois `assertAiSourceQuality()` antes de `prisma.aiActionSuggestion.upsert`.
- A resposta publica de cada sugestao passa a incluir `sourceQuality` (`confidence`, `limitation`, `source`) e `guardrail`.
- Teste de contrato BK13 com 5 testes: positivo com fonte rastreavel, negativos sem fonte, sem empresa ativa, explicacao fraca e prova de que sugestoes sem fonte nao sao persistidas.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | Auth, empresa ativa, permissoes backend, modularidade e schema Prisma mantiveram-se validos. |
| `BK-MF8-10 -> BK-MF8-13` | `OK` | O guardrail consome fonte e explicacao ja exigidas por RNF31, sem duplicar endpoints ou criar provider de IA. |
| `BK-MF8-11 -> BK-MF8-13` | `OK` | `assertAiRecommendationOnly()` continua antes da persistencia; `assertAiSourceQuality()` acrescenta a fronteira RNF34 sem permitir execucao automatica. |
| `BK-MF8-13 -> BK-MF8-14` | `OK` | O proximo BK pode consumir `sourceQuality` para mostrar fonte, limitacao e decisao humana na UI. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/src/modules/ai/aiSourceGuardrails.js`
- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js`
- `real_dev/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/*.md`
- `docs/planificacao/guias-bk/MF7/*.md`
- `docs/evidence/MF8/BK-MF8-10.md`
- `docs/evidence/MF8/BK-MF8-11.md`
- `docs/evidence/MF8/BK-MF8-12.md`
- `real_dev/api/package.json`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/ai/aiGovernancePolicy.js`
- `real_dev/api/src/modules/ai/aiRoutes.js`
- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/api/src/modules/ai/aiValidators.js`
- `real_dev/api/src/lib/httpErrors.js`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/web/src/lib/mf4Api.ts`
- `real_dev/web/src/pages/mf4Pages.tsx`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; ja existiam artefactos MF8 untracked e foram preservados. |
| `node --test tests/contracts/mf8-ai-source-guardrails.contract.test.js` em `real_dev/api` | `PASS`; 5 testes, 5 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 118 testes, 118 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| Pesquisa estatica de risco no escopo IA BK13 | `PASS`; sem hits para TODOs, storage sensivel, execucao dinamica, segredos, RAG/OCR/embeddings, casts inseguros ou drift de dominio. |
| Pesquisa de `companyId` no escopo IA BK13 | `PASS_COM_RESSALVAS`; hits esperados em contexto interno/backend e testes; sem `req.body.companyId`, `req.query.companyId`, `body.companyId` ou `query.companyId`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais legados fora do scope. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md real_dev/api/src/modules/ai/aiSourceGuardrails.js real_dev/api/tests/contracts/mf8-ai-source-guardrails.contract.test.js` | `PASS`; sem trailing whitespace no relatorio e ficheiros BK13 novos. |

### Validacoes nao executadas

- Smoke HTTP autenticado real nao foi executado; a prova ficou em service/router/testes de contrato sem abrir servidor.
- Integracao persistida real com base de dados nao foi executada; o schema validou e os testes deterministas usam double Prisma.
- `docs/evidence/MF8/BK-MF8-13.md` nao foi criado por `PERMITIR_ALTERAR_DOCS=nao`; a evidence tecnica desta execucao fica registada neste relatorio permitido.

### Blockers e TODOs

- Sem blockers para `BK-MF8-13`.
- TODO operacional fora do scope atual: se numa execucao futura for permitido editar evidence, criar `docs/evidence/MF8/BK-MF8-13.md` com os resultados acima.

### Decisao final

`BK-MF8-13` fica `IMPLEMENTADO`. A proxima acao recomendada e executar `BK-MF8-14 - Aproximacao da UI a UI do mockup`, consumindo `sourceQuality` nas sugestoes de IA.

## Atualizacao 2026-07-06 - Correcao posterior de evidence BK-MF8-12

O finding documental `P3-BK-MF8-12-EVIDENCE-001` foi corrigido apos a auditoria de implementacao: `docs/evidence/MF8/BK-MF8-12.md` existe agora e regista artefactos, comandos, negativos, limites e handoff do `BK-MF8-12`.

A execucao de implementacao abaixo mantem valor historico: nesse momento `PERMITIR_ALTERAR_DOCS=nao` impediu criar evidence dedicada. A ressalva documental deixou de estar ativa apos a correcao posterior.

## Execucao 2026-07-06 - BK-MF8-12

### Resultado geral

Estado geral: `IMPLEMENTADO`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-12`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-12 - Alertas configuraveis (ativar/desativar tipos)` ficou `IMPLEMENTADO`. A implementacao entregou persistencia `AlertPreference` por empresa ativa, utilizador autenticado e tipo de alerta; endpoints protegidos para listar e alterar preferencias; validacao estrita de `{ enabled: boolean }`; defaults efetivos; e bloqueio da desativacao de `security`.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/`, `mockup/` nem `docs/evidence`. A unica alteracao fora de `real_dev/` nesta execucao foi este relatorio permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-12` | `IMPLEMENTADO` | `real_dev/api/prisma/schema.prisma`, migration `20260706120000_mf8_alert_preferences`, `alertPreferenceService.js`, rotas `/api/notifications/preferences`, teste `mf8-alert-preferences.contract.test.js` e validacoes executadas abaixo. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-12` | `RNF33` | `real_dev/api/prisma/schema.prisma`; `real_dev/api/prisma/migrations/20260706120000_mf8_alert_preferences/migration.sql`; `real_dev/api/src/modules/notifications/alertPreferenceService.js`; `real_dev/api/src/modules/notifications/notificationRoutes.js`; `real_dev/api/tests/contracts/mf8-alert-preferences.contract.test.js`; `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `prisma:validate`; `prisma:generate`; `syntax:check`; teste dedicado; `test:contracts`; `test:unit`; `validate-planificacao.sh`; `git diff --check` |

### Contratos consumidos

- `MF0/MF7`: sessao autenticada, cookie HttpOnly, empresa ativa resolvida no backend e `requireCompanyContext(prisma)`.
- `MF0`: permissao existente `Permission.NOTIFICATIONS_READ` e `requirePermission(...)`.
- `MF4`: modulo de notificacoes in-app, `buildNotificationRoutes`, `InAppNotification`, reminders e smart alerts ja existentes.
- `BK-MF8-11`: a categoria `ai` continua apenas preferencia de rececao de alertas; nao executa acoes financeiras, contabilisticas ou automaticas.

### Contratos entregues

- Modelo Prisma `AlertPreference` com unicidade `@@unique([companyId, userId, type])`, indices por empresa/utilizador e tipo, e relacoes com `Company`/`User`.
- Endpoints protegidos:
  - `GET /api/notifications/preferences`
  - `PATCH /api/notifications/preferences/:type`
- Tipos suportados: `stock`, `deadline`, `cashflow`, `ai` e `security`.
- Body publico aceite no `PATCH`: apenas `{ enabled: boolean }`; `companyId` nao e aceite do frontend para ownership.
- `security` fica visivel, ativo por default e nao pode ser desativado (`ALERT_TYPE_MANDATORY`).
- Teste de contrato com 4 testes: defaults/stored, escrita por upsert sem companyId forjado, negativos de body/tipo/security e exposicao das rotas.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | A implementacao preserva auth, empresa ativa, permissoes backend, modularidade e Prisma validado. |
| `MF4 -> BK-MF8-12` | `OK` | As rotas novas entram no router real de notificacoes e reutilizam os mesmos guards de `GET /`, `POST /sync` e `PATCH /:id/read`. |
| `BK-MF8-11 -> BK-MF8-12` | `OK` | Preferencias de `ai` nao alteram a fronteira RNF32: continuam notificacao/recomendacao, sem execucao automatica. |
| `BK-MF8-12 -> BK-MF8-13` | `OK` | O proximo BK pode consumir a categoria `ai`; nao foi criada UI nem filtro do motor de notificacoes porque isso esta fora do scope do guia BK12. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/prisma/migrations/20260706120000_mf8_alert_preferences/migration.sql`
- `real_dev/api/src/modules/notifications/alertPreferenceService.js`
- `real_dev/api/src/modules/notifications/notificationRoutes.js`
- `real_dev/api/tests/contracts/mf8-alert-preferences.contract.test.js`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/*.md`
- `real_dev/api/package.json`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/auth/authMiddleware.js`
- `real_dev/api/src/modules/companies/companyContext.js`
- `real_dev/api/src/modules/permissions/permissionMiddleware.js`
- `real_dev/api/src/modules/permissions/permissions.js`
- `real_dev/api/src/modules/notifications/notificationService.js`
- `real_dev/api/src/lib/httpErrors.js`
- `real_dev/api/prisma/schema.prisma`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; ja existiam `docs/evidence/MF8/`, `AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md` e `IMPLEMENTACAO-REAL_DEV-MF8.md` untracked; foram preservados. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `npm --prefix real_dev/api run prisma:validate` | `BLOQUEADO`; falhou por falta de `DATABASE_URL`, sem indicar erro no schema. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm run prisma:validate` em `real_dev/api` | `PASS`; schema Prisma valido. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm run prisma:generate` em `real_dev/api` | `PASS`; Prisma Client gerado para o novo modelo. |
| `node --test tests/contracts/mf8-alert-preferences.contract.test.js` em `real_dev/api` | `PASS`; 4 testes, 4 pass. |
| `npm run test:contracts` em `real_dev/api` | `PASS`; 113 testes, 113 pass. |
| `npm run test:unit` em `real_dev/api` | `PASS`; 79 testes, 79 pass. |
| Pesquisa estatica em ficheiros BK12 tocados | `PASS_COM_RESSALVAS`; hits esperados de `companyId` em schema/contexto backend/testes; sem `req.body.companyId`, storage sensivel, `as any`, `payload: unknown`, execucao dinamica ou TODO/FIXME. |
| `git check-ignore -v real_dev real_dev/api/src/modules/notifications/alertPreferenceService.js real_dev/api/prisma/schema.prisma` | `INFO`; `real_dev/` ignorado por `.gitignore`, esperado nesta PAP. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais legados fora do scope. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \\t]+$" docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `PASS`; sem trailing whitespace no relatorio untracked atualizado. |

### Validacoes nao executadas

- UI/frontend/typecheck/build nao foram executados porque `BK-MF8-12` e backend-only e o proprio guia coloca UI frontend em scope-out.
- Smoke HTTP autenticado real nao foi executado; a prova ficou em router/service/testes de contrato sem abrir servidor.
- Integracao persistida real com base de dados nao foi executada; o schema validou e o contrato de dominio usa double Prisma.
- `docs/evidence/MF8/BK-MF8-12.md` nao foi criado por `PERMITIR_ALTERAR_DOCS=nao`; a evidence tecnica desta execucao fica registada neste relatorio permitido.

### Blockers e TODOs

- Sem blockers para `BK-MF8-12`.
- TODO operacional fora do scope atual: se numa execucao futura for permitido editar evidence, criar `docs/evidence/MF8/BK-MF8-12.md` com os resultados acima.

### Decisao final

`BK-MF8-12` fica `IMPLEMENTADO` com ressalva documental: o ficheiro de evidence dedicado nao foi criado por proibicao explicita da prompt. A proxima acao recomendada e executar `BK-MF8-13 - IA deve evitar enviesamentos e sugerir acoes baseadas em dados reais`.

## Execucao 2026-07-06 - BK-MF8-11

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-11`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-11 - IA nao altera dados contabilisticos; apenas analisa e recomenda` ficou `IMPLEMENTADO`. A implementacao tornou explicita a governanca `RNF32` no backend, bloqueando action types financeiros/contabilisticos antes de persistir `AiActionSuggestion`, sem criar provider novo, automacao financeira, pagamentos reais, lancamentos por IA ou endpoints fora do contrato.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. As alteracoes fora de `real_dev/` foram apenas a evidence tecnica deste BK e este relatorio de implementacao, alinhadas com `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-11` | `IMPLEMENTADO` | `real_dev/api/src/modules/ai/aiGovernancePolicy.js`, `real_dev/api/src/modules/ai/aiService.js`, `real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js`, script `test:mf8:ai-governance` e `docs/evidence/MF8/BK-MF8-11.md`. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais/evidence | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-11` | `RNF32` | `real_dev/api/src/modules/ai/aiGovernancePolicy.js`; `real_dev/api/src/modules/ai/aiService.js`; `real_dev/api/src/modules/ai/aiRoutes.js`; `real_dev/api/prisma/schema.prisma`; `real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js`; `real_dev/api/package.json`; `docs/evidence/MF8/BK-MF8-11.md`; `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `npm --prefix real_dev/api run test:mf8:ai-governance`; `syntax:check`; `prisma:validate`; `test:contracts`; `test:unit`; `test:integration` com skip explicito; `typecheck`; `build`; pesquisas estaticas; `git check-ignore`; validacoes finais de planificacao/whitespace |

### Contratos consumidos

- `MF4`: `AiInsight`, `AiActionSuggestion`, `generateAiSuggestions()`, rota `/api/ai/suggestions`, permissoes `AI_READ`/`AI_WRITE` e frontend de insights ja recomendatorio.
- `BK-MF8-09`: documentacao tecnica minima que declara IA explicavel/recomendatoria e exclui OCR/RAG/embeddings, automacao contabilistica e integracoes externas nao documentadas.
- `BK-MF8-10`: `assertExplainableInsight()` e `explainAiInsight()` reforcam fonte, explicacao e guardrail antes do limite RNF32.
- `MF7 -> MF8`: auth por cookie HttpOnly, empresa ativa resolvida no backend, roles/permissoes backend e modularidade preservadas.

### Contratos entregues

- `aiGovernancePolicy.js` com `BLOCKED_AI_ACTION_TYPES` e `assertAiRecommendationOnly()`.
- `assertAiRecommendationOnly()` rejeita sugestoes sem `actionType` e bloqueia aprovacao de documentos, criacao/posting de lancamentos, alteracao contabilistica, pagamentos e recebimentos automaticos.
- `generateAiSuggestions()` passa a chamar a policy antes de `prisma.aiActionSuggestion.upsert`, garantindo falha antes da persistencia.
- Teste de contrato `mf8-ai-governance.contract.test.js` com 5 testes: positivos recomendatorios, denylist financeira/contabilistica, actionType ambiguo, ordem policy-before-upsert e persistencia apenas de sugestoes abertas.
- Script `real_dev/api/package.json` `test:mf8:ai-governance`.
- Evidence `docs/evidence/MF8/BK-MF8-11.md`.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `syntax:check`, `prisma:validate`, `test:contracts`, `test:unit`, `typecheck` e `build` passaram; auth, empresa ativa, permissoes e modularidade nao foram enfraquecidos. |
| `BK-MF8-10 -> BK-MF8-11` | `OK` | O BK11 consome a explicabilidade/fonte do BK10 e acrescenta a fronteira RNF32 antes de gravar sugestoes. |
| `BK-MF8-11 -> BK-MF8-12` | `OK` | O proximo BK pode configurar alertas `ai` sem ganhar execucao automatica; a categoria continua apenas notificacao/recomendacao. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Integracao persistida real com DB e smoke manual autenticado em browser nao foram executados; os contratos backend/frontend compilam e os testes deterministas passaram. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/src/modules/ai/aiGovernancePolicy.js`
- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js`
- `real_dev/api/package.json`
- `docs/evidence/MF8/BK-MF8-11.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/*.md`
- `docs/planificacao/guias-bk/MF7/*.md`
- `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- `docs/evidence/MF8/BK-MF8-10.md`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/ai/aiRoutes.js`
- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/api/src/modules/ai/aiValidators.js`
- `real_dev/api/src/modules/accounting`
- `real_dev/api/src/modules/sales-approval`
- `real_dev/api/src/modules/purchase-approval`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/web/src/lib/mf4Api.ts`
- `real_dev/web/src/pages/mf4Pages.tsx`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; ja existiam artefactos MF8 untracked e foram preservados. |
| `npm --prefix real_dev/api run test:mf8:ai-governance` | `PASS`; 5 testes, 5 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 109 testes, 109 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| Pesquisa estatica de risco no escopo IA BK11 | `PASS`; sem matches para TODOs, storage sensivel, execucao dinamica, segredos, RAG/OCR/embeddings ou casts inseguros. |
| Pesquisa de drift de dominio no escopo IA/evidence MF8 | `PASS`; sem referencias a dominios externos. |
| Pesquisa de `companyId` no escopo IA BK11 | `PASS_COM_RESSALVAS`; hits esperados em `req.companyId`, inputs internos e asserts de teste; sem `req.body.companyId`/`req.query.companyId`. |
| `git check-ignore -v real_dev real_dev/api/src/modules/ai/aiGovernancePolicy.js real_dev/api/tests/contracts/mf8-ai-governance.contract.test.js real_dev/web/dist/index.html` | `INFO`; `real_dev/` ignorado por `.gitignore`, esperado nesta PAP. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories documentais legados fora do scope. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \\t]+$" docs/evidence/MF8/BK-MF8-11.md docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `PASS`; sem trailing whitespace nos artefactos untracked atualizados. |

### Validacoes nao executadas

- Smoke manual em browser real com sessao autenticada viva nao foi executado; a alteracao e backend/policy e a prova ficou em contrato backend, typecheck e build frontend.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL`; `test:integration` foi corrido com `OPSA_SKIP_PERSISTENCE_TESTS=true` e registou 2 skips explicitos.
- Nao foram executados E2E complexos com navegador real, por estarem fora do scope do guia e nao haver nova UI.
- Os advisories de planificacao existentes em guias antigos nao foram corrigidos por estarem fora de `BK_IDS=[BK-MF8-11]` e fora do modo `implementar` deste BK.

### Blockers e TODOs

Nao ha blockers conhecidos para `BK-MF8-11`.

### Decisao final

`BK-MF8-11` fica `IMPLEMENTADO`. A proxima acao recomendada e executar `BK-MF8-12 - Alertas configuraveis (ativar/desativar tipos)`, reutilizando a fronteira RNF32 para garantir que alertas de IA continuam apenas recomendatorios.

## Execucao 2026-07-05 - BK-MF8-10

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-10`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-10 - Insights devem incluir explicacao e origem dos dados usados` ficou `IMPLEMENTADO`. A implementacao reforcou `RNF31` no service real de IA, bloqueando insights sem explicacao/fonte antes de persistir ou devolver payload publico, manteve a rota canonica `GET /api/ai/insights/:id/explanation` e acrescentou teste de contrato dedicado com positivo, rota e negativos.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. As alteracoes fora de `real_dev/` foram apenas a evidence tecnica deste BK e este relatorio de implementacao, alinhadas com `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-10` | `IMPLEMENTADO` | `real_dev/api/src/modules/ai/aiService.js`, `real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js`, script `test:mf8:ai-explainability` e `docs/evidence/MF8/BK-MF8-10.md`. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais/evidence | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-10` | `RNF31` | `real_dev/api/src/modules/ai/aiService.js`; `real_dev/api/src/modules/ai/aiRoutes.js`; `real_dev/api/prisma/schema.prisma`; `real_dev/web/src/lib/mf4Api.ts`; `real_dev/web/src/pages/mf4Pages.tsx`; `real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js`; `real_dev/api/package.json`; `docs/evidence/MF8/BK-MF8-10.md`; `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `npm --prefix real_dev/api run test:mf8:ai-explainability`; `syntax:check`; `prisma:validate`; `test:contracts`; `test:unit`; `test:integration` com skip explicito; `typecheck`; `build`; pesquisas estaticas; `bash scripts/validate-planificacao.sh`; `git diff --check` |

### Contratos consumidos

- `MF4`: `AiInsight`, `AiActionSuggestion`, service de IA, rota `/api/ai/insights/:id/explanation`, frontend `AiInsightsPage` e cliente `getInsightExplanation()`.
- `MF7 -> MF8`: auth por cookie HttpOnly, empresa ativa resolvida no backend, permissao `AI_READ`, roles backend e modularidade preservadas.
- `BK-MF8-09`: documento tecnico minimo declara IA como explicavel/recomendatoria, fontes reais e limites sem OCR/RAG/embeddings ou automacao contabilistica.

### Contratos entregues

- `assertExplainableInsight()` exportado em `aiService.js`, com JSDoc, codigo HTTP estavel e validacao de `title`, `explanation`, `sourceType`, `sourceId` e `sourceLabel`.
- `generateAiInsights()` passa a validar cada candidato antes de persistir, impedindo insight sem fonte.
- `explainAiInsight()` valida o registo persistido antes de devolver payload publico e continua filtrado por `{ id, companyId }`.
- Teste de contrato `mf8-ai-explainability.contract.test.js` com 5 testes: positivo, rota, payload com fonte/guardrail e negativos.
- Script `real_dev/api/package.json` `test:mf8:ai-explainability`.
- Evidence `docs/evidence/MF8/BK-MF8-10.md`.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `syntax:check`, `prisma:validate`, `test:contracts`, `test:unit`, `typecheck` e `build` passaram; guards, permissoes e empresa ativa nao foram enfraquecidos. |
| `BK-MF8-09 -> BK-MF8-10` | `OK` | O BK consome a documentacao tecnica minima e aplica no codigo o limite de IA explicavel/recomendatoria com fontes reais. |
| `BK-MF8-10 -> BK-MF8-11` | `OK` | O proximo BK pode reutilizar o endpoint e a validacao RNF31 para reforcar que a IA recomenda, mas nao executa acoes nem altera contabilidade. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Integracao persistida real com DB e smoke manual autenticado em browser nao foram executados; os contratos backend/frontend compilam e os testes deterministas passaram. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/api/tests/contracts/mf8-ai-explainability.contract.test.js`
- `real_dev/api/package.json`
- `docs/evidence/MF8/BK-MF8-10.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-09-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-10-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-11-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md`
- `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/ai/aiRoutes.js`
- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/web/src/lib/mf4Api.ts`
- `real_dev/web/src/pages/mf4Pages.tsx`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; ja existiam artefactos MF8 untracked e foram preservados. |
| `git check-ignore -v real_dev real_dev/api real_dev/web` | `INFO`; `real_dev/` ignorado por `.gitignore`, esperado nesta PAP. |
| `npm --prefix real_dev/api run test:mf8:ai-explainability` | `PASS`; 5 testes, 5 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 104 testes, 104 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| Pesquisa estatica global de risco em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS_COM_RESSALVAS`; hits em denylist/gates/testes negativos e storage privado, sem finding ligado ao BK10. |
| Pesquisa de drift de dominio em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS`; sem referencias a dominios externos. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories legados fora do scope. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Validacoes nao executadas

- Smoke manual em browser real com sessao autenticada viva nao foi executado; a prova ficou em contrato backend, typecheck e build frontend.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL`; `test:integration` foi corrido com `OPSA_SKIP_PERSISTENCE_TESTS=true` e registou 2 skips explicitos.
- Nao foram executados E2E complexos com navegador real, por estarem fora do scope do guia e nao haver nova UI.

### Blockers e TODOs

Nao ha blockers conhecidos para `BK-MF8-10`.

### Decisao final

`BK-MF8-10` fica `IMPLEMENTADO`. A proxima acao recomendada e executar `BK-MF8-11 - IA nao altera dados contabilisticos; apenas analisa e recomenda`, reutilizando `assertExplainableInsight()`, `explainAiInsight()` e a evidence criada neste BK.

## Execucao 2026-07-05 - BK-MF8-09

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-09`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-09 - Documentacao tecnica minima (arquitetura, modelos, fluxo contabilistico)` ficou `IMPLEMENTADO`. A implementacao criou a documentacao tecnica minima de RNF30, acrescentou o gate automatico `test:mf8:technical-docs`, validou dois negativos controlados e registou evidence de PR/defesa.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. As alteracoes fora de `real_dev/` foram apenas a evidence tecnica deste BK e este relatorio de implementacao, alinhadas com o proprio scope do BK e com `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-09` | `IMPLEMENTADO` | `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`, `docs/evidence/MF8/BK-MF8-09.md`, `real_dev/api/scripts/check-mf8-technical-docs.mjs` e script `test:mf8:technical-docs`. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais/evidence | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-09` | `RNF30` | `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`; `docs/evidence/MF8/BK-MF8-09.md`; `real_dev/api/scripts/check-mf8-technical-docs.mjs`; `real_dev/api/package.json`; `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `npm --prefix real_dev/api run test:mf8:technical-docs`; dois negativos com `OPSA_MF8_TECH_DOC_MUTATION`; `syntax:check`; `prisma:validate`; `test:contracts`; `test:unit`; `test:integration` com skip explicito; `test:mf8:subscriptions-ui`; `typecheck`; `build`; pesquisas estaticas; `bash scripts/validate-planificacao.sh`; `git diff --check` |

### Contratos consumidos

- `MF7 -> MF8`: backend modular por dominio, frontend modular, gates criticos e hardening preservados.
- `BK-MF8-01`: logs estruturados e auditoria permanecem como contrato operacional.
- `BK-MF8-02`: health-check publico continua separado dos routers autenticados.
- `BK-MF8-03` a `BK-MF8-08`: planos, subscricao atual, ativacao, ciclo de vida, UI e evidence agregadora de subscricoes simuladas.
- Contratos transversais: sessao por cookie HttpOnly, empresa ativa resolvida no backend, permissoes backend, separacao cliente/fornecedor, separacao recebimentos/pagamentos e IA apenas analitica.

### Contratos entregues

- Documento `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md` com arquitetura, modelos, fluxos, subscricao simulada, limites e checklist de atualizacao.
- Evidence `docs/evidence/MF8/BK-MF8-09.md` com matriz RNF30, comandos, negativos, limites e handoff.
- Gate `real_dev/api/scripts/check-mf8-technical-docs.mjs` com JSDoc, validacao de secoes obrigatorias, marcadores tecnicos e promessas proibidas.
- Script `real_dev/api/package.json` `test:mf8:technical-docs`.
- Negativos controlados: remover `## Limites` falha o gate; declarar `certificacao fiscal` falha o gate.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `syntax:check`, `test:contracts`, `test:unit`, `typecheck` e `build` passaram; o BK e documental/gate e nao altera guards, roles, routers ou modelos. |
| `BK-MF8-08 -> BK-MF8-09` | `OK` | A documentacao usa a evidence de subscricoes simuladas e deixa claro que nao ha pagamento real nem lancamento contabilistico automatico. |
| `BK-MF8-09 -> BK-MF8-10` | `OK` | O documento tecnico entrega base para o proximo BK validar explicacao, origem dos dados, limites de IA e fontes reais. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | A documentacao explicita limites: sem certificacao fiscal declarada, sem gateway real, sem OCR/RAG/embeddings prometidos e sem IA a executar acoes contabilisticas. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- `docs/evidence/MF8/BK-MF8-09.md`
- `real_dev/api/scripts/check-mf8-technical-docs.mjs`
- `real_dev/api/package.json`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/*.md`
- `docs/planificacao/guias-bk/MF7/*.md`
- `docs/evidence/MF8/BK-MF8-08.md`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/package.json`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/src/modules/ai/aiService.js`
- `real_dev/web/package.json`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/SubscriptionsPage.tsx`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; ja existiam artefactos MF8 untracked e foram preservados. |
| `npm --prefix real_dev/api run test:mf8:technical-docs` | `PASS`; `Documentacao tecnica minima MF8 validada.` |
| `OPSA_MF8_TECH_DOC_MUTATION=remove-limits npm --prefix real_dev/api run test:mf8:technical-docs` | `PASS_NEGATIVO`; exit code `1` esperado com `Falta seccao obrigatoria: ## Limites`. |
| `OPSA_MF8_TECH_DOC_MUTATION=add-fiscal-certification npm --prefix real_dev/api run test:mf8:technical-docs` | `PASS_NEGATIVO`; exit code `1` esperado por promessa fora do MVP. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 99 testes, 99 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| Pesquisa estatica global de risco em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS_COM_RESSALVAS`; hits em gates/denylist/testes negativos e storage privado, sem finding ligado ao BK09. |
| Pesquisa de drift de dominio em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS`; sem referencias a dominios externos. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories legados fora do scope. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Validacoes nao executadas

- Smoke manual em browser real com sessao autenticada e empresa ativa nao foi executado; o BK09 entrega documentacao tecnica e gate automatico, sem fluxo UI novo.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL`; `test:integration` foi corrido com `OPSA_SKIP_PERSISTENCE_TESTS=true` e registou 2 skips explicitos.
- Nao foram executados E2E complexos com navegador real, porque estao fora do scope do guia e nao ha nova interacao de produto.

### Blockers e TODOs

Nao ha blockers conhecidos para `BK-MF8-09`.

### Decisao final

`BK-MF8-09` fica `IMPLEMENTADO`. A proxima acao recomendada e executar `BK-MF8-10 - Insights devem incluir explicacao e origem dos dados usados`, consumindo o documento tecnico e respeitando os limites de IA registados nesta execucao.

## Execucao 2026-07-05 - BK-MF8-08

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-08`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-08 - Testes e evidencia de subscricoes simuladas` ficou `IMPLEMENTADO`. A implementacao acrescentou o teste contratual agregador `test:mf8:subscriptions`, consolidando `RF49`, `RF50` e `RF51` sobre os contratos entregues por `BK-MF8-03` a `BK-MF8-07`, e criou evidence tecnica em `docs/evidence/MF8/BK-MF8-08.md`.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. As alteracoes fora de `real_dev/` foram apenas a evidence tecnica deste BK e este relatorio de implementacao, permitidos pelo escopo do BK e por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-08` | `IMPLEMENTADO` | `real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js`, script `test:mf8:subscriptions` e `docs/evidence/MF8/BK-MF8-08.md`. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais/evidence | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-08` | `RF49`, `RF50`, `RF51` | `real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js`; `real_dev/api/package.json`; `docs/evidence/MF8/BK-MF8-08.md`; `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `npm --prefix real_dev/api run test:mf8:subscriptions`; `npm --prefix real_dev/api run test:contracts`; `npm --prefix real_dev/api run test:unit`; `npm --prefix real_dev/web run test:mf8:subscriptions-ui`; `npm --prefix real_dev/web run typecheck`; `npm --prefix real_dev/web run build`; pesquisas estaticas; `bash scripts/validate-planificacao.sh`; `git diff --check` |

### Contratos consumidos

- `BK-MF8-03`: `listSimulatedSubscriptionPlans()` e catalogo fechado `monthly`, `quarterly`, `yearly`, `EUR`, `billingCycle`, `intervalCount` e `simulated: true`.
- `BK-MF8-04`: `CompanySubscription`, estado publico da subscricao atual e empresa ativa resolvida no backend.
- `BK-MF8-05`: `activateSimulatedSubscription()` com auditoria `subscription.activate`.
- `BK-MF8-06`: `runSimulatedSubscriptionAction()` e `assertSubscriptionLifecycleTransition()` para `renew`, `cancel` e `reactivate`.
- `BK-MF8-07`: gate frontend `test:mf8:subscriptions-ui`, cliente tipado e UI sem `companyId` vindo do browser.
- `MF7 -> MF8`: guards de auth, empresa ativa, roles e modularidade backend/frontend preservados.

### Contratos entregues

- Ficheiro `real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js` com JSDoc, double Prisma em memoria e 4 casos agregados.
- Script `real_dev/api/package.json` `test:mf8:subscriptions`.
- Evidence `docs/evidence/MF8/BK-MF8-08.md` com matriz RF -> prova -> resultado observado, negativos, comandos e limites.
- Negativos confirmados: transicao invalida, reativacao sem plano, ativacao sem empresa ativa e ausencia de campos de pagamento real.
- Handoff para `BK-MF8-09`: usar esta evidence para documentar que a subscricao MF8 e simulada e sem efeitos contabilisticos reais.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:unit`, `test:contracts`, `syntax:check`, `typecheck` e `build` passaram; a implementacao nao alterou guards, roles ou contrato multiempresa. |
| `BK-MF8-03 -> BK-MF8-08` | `OK` | O teste agregador consome o catalogo canonico e confirma tres planos simulados em `EUR`. |
| `BK-MF8-04/BK-MF8-05 -> BK-MF8-08` | `OK` | A ativacao testada usa `companyId` do contexto backend e regista auditoria minima. |
| `BK-MF8-06 -> BK-MF8-08` | `OK` | Renovacao, cancelamento e reativacao sao testadas pelo service canonico de ciclo de vida. |
| `BK-MF8-07 -> BK-MF8-08` | `OK` | O gate frontend `test:mf8:subscriptions-ui` passou e confirma UI sem storage sensivel nem ownership no browser. |
| `BK-MF8-08 -> BK-MF8-09` | `OK` | A evidence entrega base objetiva para a documentacao tecnica minima do proximo BK. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | A subscricao continua explicitamente simulada; pagamentos reais, checkout, faturas, recibos e lancamentos contabilisticos automaticos ficam fora de scope. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/tests/contracts/mf8-subscriptions.contract.test.js`
- `real_dev/api/package.json`
- `docs/evidence/MF8/BK-MF8-08.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/*.md`
- `docs/planificacao/guias-bk/MF7/*.md`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/package.json`
- `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/web/package.json`
- `real_dev/web/scripts/check-mf8-subscriptions-ui.mjs`
- `real_dev/web/src/lib/subscriptionsApi.ts`
- `real_dev/web/src/pages/SubscriptionsPage.tsx`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; ja existiam artefactos MF8 untracked e foram preservados. |
| `npm --prefix real_dev/api run test:mf8:subscriptions` | `PASS`; 4 testes, 4 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 99 testes, 99 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes skipped explicitamente por falta de `TEST_DATABASE_URL`. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| Pesquisa estatica global de risco em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS_COM_RESSALVAS`; hits existentes sao sanitizacao/denylist de segredos, testes negativos, storage privado, gate MF8 a proibir storage e contexto proprio de empresas, sem finding ligado ao BK08. |
| Pesquisa de drift de dominio em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS`; sem referencias a dominios externos. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories legados fora do scope. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Validacoes nao executadas

- Smoke manual em browser real com sessao autenticada e empresa ativa nao foi executado; o BK08 fechou o contrato agregador backend e reutilizou o gate frontend automatico do BK07.
- Integracao persistida real com DB nao foi executada porque nao existe `TEST_DATABASE_URL`; `test:integration` foi corrido com `OPSA_SKIP_PERSISTENCE_TESTS=true` e registou 2 skips explicitos.
- Nao foram executados testes E2E complexos com navegador real, porque estao fora de scope do guia.

### Blockers e TODOs

Nao ha blockers conhecidos para `BK-MF8-08`.

### Decisao final

`BK-MF8-08` fica `IMPLEMENTADO`. A proxima acao recomendada e executar `BK-MF8-09 - Documentacao tecnica minima`, reutilizando a evidence de subscricoes simuladas sem pagamento real criada nesta execucao.

## Execucao 2026-07-04 - BK-MF8-07

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-07`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-07 - UI de planos e gestao da subscricao` ficou `IMPLEMENTADO` no frontend real. A implementacao acrescentou um cliente TypeScript de subscricoes, uma pagina React integrada na navegacao, estados de loading/erro/vazio/sucesso, feedback imediato, formatacao PT-PT de preco/datas, bloqueio visual de acoes por estado e gate textual `test:mf8:subscriptions-ui`.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` feita nesta execucao foi este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-07` | `IMPLEMENTADO` | `SubscriptionsPage`, `subscriptionsApi`, navegacao MF8, estilos responsivos e gate `test:mf8:subscriptions-ui`. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-07` | `RF49`, `RF50`, `RF51` | `real_dev/web/src/lib/subscriptionsApi.ts`; `real_dev/web/src/pages/SubscriptionsPage.tsx`; `real_dev/web/src/App.tsx`; `real_dev/web/src/styles.css`; `real_dev/web/scripts/check-mf8-subscriptions-ui.mjs`; `real_dev/web/package.json` | `npm --prefix real_dev/web run test:mf8:subscriptions-ui`; `npm --prefix real_dev/web run typecheck`; `npm --prefix real_dev/web run build`; `npm --prefix real_dev/api run test:contracts`; pesquisas estaticas; `git diff --check` |

### Contratos consumidos

- `RF49`: consulta dos tres planos simulados `monthly`, `quarterly` e `yearly`.
- `RF50`: consulta e gestao da subscricao simulada da empresa ativa.
- `RF51`: renovacao, cancelamento e reativacao simuladas.
- `BK-MF8-03`: `GET /api/subscriptions/plans`, `code`, `name`, `description`, `priceCents`, `currency`, `billingCycle`, `intervalCount` e `simulated`.
- `BK-MF8-04`: `GET /api/subscriptions/current`, estado publico `none`, `active`, `cancelled` ou `expired`, e empresa ativa resolvida no backend.
- `BK-MF8-05`: `POST /api/subscriptions/current/activate` com `planCode`, sem pagamento real.
- `BK-MF8-06`: `POST /api/subscriptions/current/actions` com `renew`, `cancel` e `reactivate`.
- `MF5/MF7`: `PageFrame`, `StatusMessage`, `ActionToolbar`, `ModuleBadge`, `useActionFeedback`, `createApiClient()` e `credentials: "include"`.

### Contratos entregues

- Cliente `real_dev/web/src/lib/subscriptionsApi.ts` com tipos frontend para planos, estado atual, overview e acoes.
- `loadSubscriptionOverview()` carrega planos e subscricao atual em paralelo, usando o cliente central com cookies HttpOnly.
- `runSubscriptionAction()` separa ativacao (`/current/activate`) de ciclo de vida (`/current/actions`) sem aceitar `companyId`.
- Helpers de apresentacao `formatPlanPrice`, `formatBillingCycle`, `formatSubscriptionState`, `isSubscriptionActionEnabled` e `explainSubscriptionApiError`.
- Pagina `SubscriptionsPage` com loading, erro recuperavel, estado vazio, resumo da subscricao, selecao de plano, acoes e feedback em PT-PT.
- Navegacao principal com pagina `Subscrições` em `mf8Pages`.
- Estilos responsivos para resumo, grelha de planos e acoes sem sobreposicao de texto.
- Gate `test:mf8:subscriptions-ui` que valida contratos frontend, ausencia de `fetch` direto, ausencia de storage sensivel e ausencia de `companyId` na UI de subscricoes.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | O frontend continua a reutilizar o cliente central com `credentials: "include"` e componentes partilhados; nao foram criados tokens em storage nem bypasses de permissao. |
| `BK-MF8-03 -> BK-MF8-07` | `OK` | A UI consome o catalogo canonico de planos e formata `priceCents`, `billingCycle` e `intervalCount` sem criar campos paralelos. |
| `BK-MF8-04 -> BK-MF8-07` | `OK` | A UI mostra o estado atual devolvido pela API, sem escolher empresa ativa no browser. |
| `BK-MF8-05 -> BK-MF8-07` | `OK` | Ativacao usa `POST /api/subscriptions/current/activate` e envia apenas `planCode`. |
| `BK-MF8-06 -> BK-MF8-07` | `OK` | Renovacao, cancelamento e reativacao usam `POST /api/subscriptions/current/actions`; o gating visual nao substitui validacao backend. |
| `BK-MF8-07 -> BK-MF8-08` | `OK` | O proximo BK pode usar `test:mf8:subscriptions-ui`, `SubscriptionsPage` e `subscriptionsApi` como base de evidence/testes finais de subscricoes. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Continua a ser uma subscricao simulada; checkout, cobranca, recibos, faturas e efeitos contabilisticos reais permanecem fora de scope. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/web/src/lib/subscriptionsApi.ts`
- `real_dev/web/src/pages/SubscriptionsPage.tsx`
- `real_dev/web/scripts/check-mf8-subscriptions-ui.mjs`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/styles.css`
- `real_dev/web/package.json`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-05-ativacao-simulada-de-subscricao.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-06-renovacao-cancelamento-e-reativacao-simuladas.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-ui-de-planos-e-gestao-da-subscricao.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md`
- `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/ui/opsaUi.tsx`
- `real_dev/web/src/ui/useActionFeedback.ts`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/styles.css`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; relatorios/evidence MF8 untracked ja presentes no inicio e preservados. |
| `npm --prefix real_dev/web run test:mf8:subscriptions-ui` | `PASS`; smoke textual confirmou cliente tipado, pagina, navegacao, estilos, ausencia de `fetch` direto, ausencia de storage sensivel e ausencia de `companyId` na UI de subscricoes. |
| `npm --prefix real_dev/web run typecheck` | `PASS`; TypeScript sem erros. |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido com 49 modulos transformados. |
| `npm --prefix real_dev/api run syntax:check` | `PASS`; sintaxe JS de `src`, `tests` e `scripts` valida. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 95 testes, 95 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| Pesquisa estatica global de risco em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS_COM_RESSALVAS`; hits existentes sao denylist/sanitizacao de segredos, testes negativos, comentarios de seguranca, private storage root ou o gate novo a proibir `localStorage`/`sessionStorage`. |
| Pesquisa de drift de dominio em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS`; sem referencias a dominios externos. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories legados de guias e documentos de sprint fora deste scope. |
| `git check-ignore -v real_dev/web/src/lib/subscriptionsApi.ts real_dev/web/src/pages/SubscriptionsPage.tsx real_dev/web/scripts/check-mf8-subscriptions-ui.mjs real_dev/web/src/App.tsx real_dev/web/src/styles.css real_dev/web/package.json real_dev/web/dist/index.html` | `INFO`; confirmou que `real_dev/` e ignorado por `.gitignore`, comportamento esperado nesta PAP. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |

### Validacoes nao executadas

- Smoke manual em browser real com sessão autenticada e empresa ativa nao foi executado; a validacao automatica cobriu contratos estaticos da UI, TypeScript, build e contratos backend, mas nao simulou clique real com cookies vivos.
- Testes de integracao com base de dados real nao foram executados nesta passagem porque o BK alterou apenas frontend e cliente API; a coerencia backend foi coberta por `test:contracts`, `test:unit` e `syntax:check`.
- Evidence separada em `docs/evidence/MF8/BK-MF8-07.md` nao foi criada porque esta execucao tem `PERMITIR_ALTERAR_DOCS=nao`; a evidence tecnica fica registada neste relatorio permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Blockers e TODOs

Nao ha blockers conhecidos para `BK-MF8-07`.

### Decisao final

`BK-MF8-07` fica `IMPLEMENTADO`. A proxima acao recomendada e executar `BK-MF8-08 - Testes e evidencia de subscricoes simuladas`, consolidando testes/evidence sobre os contratos agora expostos no frontend.

## Execucao 2026-07-04 - BK-MF8-06

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-06`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-06 - Renovacao, cancelamento e reativacao simuladas` ficou `IMPLEMENTADO` no backend real. A implementacao acrescentou a maquina de estados de `RF51`, o service `runSimulatedSubscriptionAction`, a rota protegida `POST /api/subscriptions/current/actions`, auditoria funcional `subscription.renew`, `subscription.cancel` e `subscription.reactivate`, validacao de body sem ownership vindo do browser, e testes contratuais dedicados.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` feita nesta execucao foi este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-06` | `IMPLEMENTADO` | `runSimulatedSubscriptionAction`, `POST /api/subscriptions/current/actions`, maquina de estados `ACTIVE -> renew/cancel` e `CANCELLED/EXPIRED -> reactivate`, auditoria minima e 11 testes de contrato dedicados. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-06` | `RF51` | `real_dev/api/src/modules/subscriptions/subscriptionService.js`; `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`; `real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js` | `node --test real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js`; `npm --prefix real_dev/api run syntax:check`; `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate`; `npm --prefix real_dev/api run test:contracts`; `npm --prefix real_dev/api run test:unit`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration`; `npm --prefix real_dev/web run typecheck`; `npm --prefix real_dev/web run build`; `bash scripts/validate-planificacao.sh`; pesquisas estaticas; `git diff --check` |

### Contratos consumidos

- `RF51`: simular renovacao, cancelamento e reativacao da subscricao por Admin/Gestor.
- `BK-MF8-03`: catalogo fechado `monthly`, `quarterly`, `yearly`, `billingCycle`, `intervalCount` e `getSimulatedSubscriptionPlan(code)`.
- `BK-MF8-04`: modelo `CompanySubscription`, unicidade por `companyId`, estados `ACTIVE`, `CANCELLED`, `EXPIRED`, `getCurrentSubscription`, `formatCurrentSubscription` e `assertSubscriptionBelongsToActiveCompany`.
- `BK-MF8-05`: `activateSimulatedSubscription`, `calculateSubscriptionCycleEnd`, rota de ativacao e auditoria `subscription.activate`.
- `MF0/MF1`: `requireAuth(prisma)`, `requireCompanyContext(prisma)` e `requireRole("ADMIN", "GESTOR")`.
- `MF4/MF6`: `recordAuditLog` e minimizacao de detalhes sensiveis em auditoria.

### Contratos entregues

- Constante `SUBSCRIPTION_LIFECYCLE_ACTION` com `renew`, `cancel` e `reactivate`.
- Service `runSimulatedSubscriptionAction(prisma, { companyId, userId, action, planCode?, now? })`.
- Validacao de transicoes:
  - `ACTIVE` permite `renew` e `cancel`;
  - `CANCELLED` permite `reactivate`;
  - `EXPIRED` permite `reactivate`;
  - restantes combinacoes devolvem `409 INVALID_SUBSCRIPTION_TRANSITION`.
- Renovacao sobre `ACTIVE` prolonga `endsAt` a partir do fim atual quando este ainda esta no futuro, usando `billingCycle` e `intervalCount`.
- Cancelamento sobre `ACTIVE` muda apenas o estado para `CANCELLED`, mantendo plano e datas.
- Reativacao sobre `CANCELLED` ou `EXPIRED` exige `planCode`, inicia novo ciclo em `now`, persiste `ACTIVE` e recalcula `endsAt`.
- Rota `POST /api/subscriptions/current/actions`, protegida pelos mesmos guards de subscricoes.
- Rejeicao de body com campos inesperados, incluindo tentativa de enviar `companyId` no body.
- Auditoria funcional com `previousStatus`, `nextStatus`, `planCode` e `simulated: true`, sem payload completo nem dados de pagamento.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:unit`, `test:contracts`, `syntax:check`, `typecheck` e `build` continuam verdes; nao houve alteracao de contratos MF7. |
| `BK-MF8-03 -> BK-MF8-06` | `OK` | Renovacao e reativacao usam o catalogo canonico e nao introduzem `intervalMonths` nem outro catalogo paralelo. |
| `BK-MF8-04 -> BK-MF8-06` | `OK` | O service reutiliza `CompanySubscription.companyId @unique`, consulta por empresa ativa e nao aceita ownership vindo do body/query. |
| `BK-MF8-05 -> BK-MF8-06` | `OK` | O ciclo de vida trabalha sobre a subscricao ativada e reutiliza calculo de datas, formato publico e auditoria minima. |
| `BK-MF8-06 -> BK-MF8-07/BK-MF8-08` | `OK` | A UI futura pode consumir `POST /api/subscriptions/current/actions`; os testes/evidence futuros tem contrato estavel para sucesso, role bloqueada, empresa ativa em falta, reativacao sem plano e transicao invalida. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Foi entregue apenas simulacao de ciclo de vida; pagamentos reais, checkout, recibos, faturas, cobranca automatica e efeitos contabilisticos continuam fora de scope. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- inventario dos guias `docs/planificacao/guias-bk/MF8/BK-MF8-*.md`, com leitura aprofundada de `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07` e `BK-MF8-08`
- relatorios MF8 existentes em `docs/planificacao/guias-bk/`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/auth/authMiddleware.js`
- `real_dev/api/src/modules/companies/companyContext.js`
- `real_dev/api/src/modules/permissions/permissionMiddleware.js`
- `real_dev/api/src/modules/audit/auditLogService.js`
- `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- `real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js`
- `real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js`
- `real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; relatorios/evidence MF8 untracked ja presentes no inicio e preservados. |
| `node --check real_dev/api/src/modules/subscriptions/subscriptionService.js` | `PASS` |
| `node --check real_dev/api/src/modules/subscriptions/subscriptionRoutes.js` | `PASS` |
| `node --check real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js` | `PASS` |
| `node --test real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js` | `PASS`; 11 testes, 11 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 95 testes, 95 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes de persistencia skipped explicitamente por variavel de ambiente. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| Pesquisa estatica global de risco em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS_COM_RESSALVAS`; hits existentes sao denylist/sanitizacao de segredos, testes negativos, comentarios de seguranca ou helper de selecao de empresa fora do modulo de subscricoes. |
| Pesquisa de drift de dominio em `real_dev/api real_dev/web` com `node_modules` e `dist` excluidos | `PASS`; sem referencias a dominios externos. |
| Pesquisa focada de `subscription.renew`, `subscription.cancel`, `subscription.reactivate`, `runSimulatedSubscriptionAction` e `/current/actions` | `PASS`; contratos encontrados no service, rota e teste dedicado. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories legados de qualidade dos guias fora deste scope. |
| `git check-ignore -v real_dev/api/src/modules/subscriptions/subscriptionService.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-lifecycle.contract.test.js real_dev/web/dist/index.html` | `INFO`; confirmou que `real_dev/` e ignorado por `.gitignore`, comportamento esperado nesta PAP. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \\t]+$" docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `PASS`; sem whitespace final no relatorio untracked. |

### Validacoes nao executadas

- Smoke HTTP real com servidor local nao foi executado; a suite contratual valida o router diretamente sem abrir porta, evitando falsos negativos de sandbox e cobrindo guards, payload, service, persistencia simulada e auditoria.
- Testes de integracao com base de dados real nao foram executados; `test:integration` foi corrido com `OPSA_SKIP_PERSISTENCE_TESTS=true`, ficando a persistencia real fora desta validacao local.
- `prisma:generate` nao foi executado porque este BK nao alterou `schema.prisma` nem migrations.
- Evidence separada em `docs/evidence/MF8/BK-MF8-06.md` nao foi criada porque esta execucao tem `PERMITIR_ALTERAR_DOCS=nao`; a evidence tecnica fica registada neste relatorio permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Blockers e TODOs

Nao ha blockers para `BK-MF8-06`.

TODO operacional para o proximo BK: `BK-MF8-07` deve consumir `GET /api/subscriptions/plans`, `GET /api/subscriptions/current`, `POST /api/subscriptions/current/activate` e `POST /api/subscriptions/current/actions`, mantendo `credentials: "include"` e sem guardar sessao, role, empresa ativa ou dados sensiveis em storage do browser.

### Decisao final

`BK-MF8-06` fica `IMPLEMENTADO`. A proxima acao recomendada e implementar ou auditar `BK-MF8-07 - UI de planos e gestao da subscricao`, consumindo os contratos backend ja entregues sem alterar ownership, permissoes ou regras de ciclo de vida no frontend.

## Execucao 2026-07-04 - BK-MF8-05

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-05`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-05 - Ativacao simulada de subscricao` ficou `IMPLEMENTADO` no backend real. A implementacao acrescentou `activateSimulatedSubscription`, calculo de ciclo com `billingCycle` e `intervalCount`, `upsert` da subscricao unica por `companyId`, auditoria funcional `subscription.activate`, validacao estrita do body e rota `POST /api/subscriptions/current/activate` protegida por sessao, contexto multiempresa e role.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` foi este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-05` | `IMPLEMENTADO` | `POST /api/subscriptions/current/activate`, service de ativacao, auditoria minima, validacao de body/ownership e 8 testes de contrato dedicados. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-05` | `RF50` | `real_dev/api/src/modules/subscriptions/subscriptionService.js`; `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`; `real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js` | `node --test real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js`; `npm --prefix real_dev/api run syntax:check`; `npm --prefix real_dev/api run test:contracts`; `npm --prefix real_dev/api run test:unit`; `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration`; `npm --prefix real_dev/web run typecheck`; `npm --prefix real_dev/web run build`; `bash scripts/validate-planificacao.sh`; `git diff --check` |

### Contratos consumidos

- `RF50`: gestao da subscricao simulada da empresa ativa por Admin/Gestor.
- `BK-MF8-03`: catalogo fechado `monthly`, `quarterly`, `yearly`, `billingCycle`, `intervalCount` e `getSimulatedSubscriptionPlan(code)`.
- `BK-MF8-04`: modelo `CompanySubscription`, unicidade por `companyId`, `getCurrentSubscription`, `formatCurrentSubscription` e router montado em `/api/subscriptions`.
- `MF0/MF1`: `requireAuth(prisma)`, `requireCompanyContext(prisma)` e `requireRole("ADMIN", "GESTOR")`.
- `MF4/MF6`: `recordAuditLog` e regras de auditoria sem payloads sensiveis.

### Contratos entregues

- Service `activateSimulatedSubscription(prisma, { companyId, userId, planCode, now? })`.
- Helper `calculateSubscriptionCycleEnd(startsAt, plan)` com suporte para ciclos `month` e `year`.
- Validacao de plano inexistente com erro `SUBSCRIPTION_PLAN_NOT_FOUND` e status `404`.
- Persistencia por `companySubscription.upsert({ where: { companyId } })`, sem aceitar `companyId` vindo do body/query.
- Estado persistido `ACTIVE`, resposta publica `state: "active"` e payload `subscription` no formato ja entregue pelo `BK-MF8-04`.
- Auditoria funcional `subscription.activate` com `companyId`, `userId`, entidade `CompanySubscription`, `entityId` e detalhes minimos `{ planCode, simulated: true }`.
- Rota `POST /api/subscriptions/current/activate` protegida pelo mesmo conjunto de guards das subscricoes.
- Rejeicao de body invalido, `planCode` em falta e campos inesperados como tentativa de ownership vinda do cliente.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:unit`, `test:contracts`, `syntax:check`, `typecheck` e `build` continuam verdes; nao houve alteracao de contratos MF7. |
| `BK-MF8-03 -> BK-MF8-05` | `OK` | A ativacao usa apenas `billingCycle` e `intervalCount` do catalogo canonico; nao introduz `intervalMonths` nem outro contrato paralelo. |
| `BK-MF8-04 -> BK-MF8-05` | `OK` | O `upsert` reutiliza `CompanySubscription.companyId @unique`, preservando uma subscricao atual por empresa ativa. |
| `BK-MF8-05 -> BK-MF8-06` | `OK` | O proximo BK pode reutilizar `activateSimulatedSubscription`, `status`, `startsAt`, `endsAt`, `simulated` e auditoria `subscription.activate` para renovacao/cancelamento/reativacao. |
| `BK-MF8-05 -> BK-MF8-07/BK-MF8-08` | `OK` | A UI futura pode chamar `POST /api/subscriptions/current/activate`; os testes finais podem cobrir sucesso, plano inexistente, role bloqueada, body invalido e ausencia de empresa ativa. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Foi entregue apenas ativacao simulada; pagamento real, checkout, recibos, faturas e alteracoes contabilisticas continuam fora de scope. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- inventario dos guias `docs/planificacao/guias-bk/MF8/BK-MF8-*.md`, com leitura aprofundada de `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-06`, `BK-MF8-07` e `BK-MF8-08`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/auth/authMiddleware.js`
- `real_dev/api/src/modules/companies/companyContext.js`
- `real_dev/api/src/modules/permissions/permissionMiddleware.js`
- `real_dev/api/src/modules/audit/auditLogService.js`
- `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- `real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js`
- `real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; relatorios MF8/evidence untracked ja presentes no inicio e preservados. |
| `node --check real_dev/api/src/modules/subscriptions/subscriptionService.js` | `PASS` |
| `node --check real_dev/api/src/modules/subscriptions/subscriptionRoutes.js` | `PASS` |
| `node --check real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js` | `PASS` |
| `node --test real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js` | `PASS`; 8 testes, 8 pass. |
| `node --test real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `PASS`; 6 testes, 6 pass. |
| `node --test real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js` | `PASS`; 10 testes, 10 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 84 testes, 84 pass. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | `PASS_COM_RESSALVAS`; 2 testes de persistencia skipped explicitamente por variavel de ambiente. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| Pesquisa estatica global de risco em `real_dev/api real_dev/web` com `dist` excluido | `PASS_COM_RESSALVAS`; hits existentes sao denylist de segredos, storage privado e testes negativos; os hits `checkoutUrl`/`gateway` confirmam ausencia de pagamento real. |
| Pesquisa de drift de dominio em `real_dev/api real_dev/web` com `dist` excluido | `PASS`; sem referencias a dominios externos. |
| Pesquisa focada de `companyId`/`activeCompanyId` vindo de body/query no modulo de subscricoes | `PASS`; sem matches. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false` por advisories legados dos guias fora deste scope. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `git check-ignore -v real_dev/api/src/modules/subscriptions/subscriptionService.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-activation.contract.test.js real_dev/web/dist/index.html` | `INFO`; confirmou que `real_dev/` e ignorado por `.gitignore`, comportamento esperado nesta PAP. |

### Validacoes nao executadas

- Smoke HTTP real com servidor local nao foi executado; a suite contratual valida o router diretamente sem abrir porta, evitando falsos negativos de sandbox e cobrindo guards, payload, service, persistencia simulada e auditoria.
- Testes de integracao com base de dados real nao foram executados; `test:integration` foi corrido com `OPSA_SKIP_PERSISTENCE_TESTS=true`, ficando a persistencia real fora desta validacao local.
- `prisma:generate` nao foi executado porque este BK nao alterou `schema.prisma` nem migrations.
- Evidence separada em `docs/evidence/MF8/BK-MF8-05.md` nao foi criada porque esta execucao tem `PERMITIR_ALTERAR_DOCS=nao`; a evidence tecnica fica registada neste relatorio permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Blockers e TODOs

Nao ha blockers para `BK-MF8-05`.

TODO operacional para o proximo BK: `BK-MF8-06` deve reutilizar `CompanySubscription`, `status`, `startsAt`, `endsAt`, `simulated`, `getCurrentSubscription`, `activateSimulatedSubscription` e a auditoria `subscription.activate`, sem criar pagamento real nem outro modelo de subscricao.

### Decisao final

`BK-MF8-05` fica `IMPLEMENTADO`. A proxima acao recomendada e implementar ou auditar `BK-MF8-06 - Renovacao, cancelamento e reativacao simuladas`, reutilizando o contrato entregue nesta execucao.

## Execucao 2026-07-04 - BK-MF8-04

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-04`, com `IMPLEMENTATION_ROOT=real_dev`, `STRICT_SCOPE=true`, `RUN_COMMANDS=true`, `CHECK_MF_COHERENCE=true`, `PERMITIR_ALTERAR_DOCS=nao` e `PERMITIR_COMMITS=nao`.

O `BK-MF8-04 - Subscricao por empresa ativa` ficou `IMPLEMENTADO` no backend real. A implementacao criou persistencia Prisma para `CompanySubscription`, migration SQL correspondente, service `getCurrentSubscription`, rota `GET /api/subscriptions/current` protegida por auth/contexto multiempresa/roles, e testes de contrato para sucesso, ausencia de subscricao, role bloqueada, empresa ativa em falta e drift de plano.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` foi este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-04` | `IMPLEMENTADO` | `CompanySubscription`, `GET /api/subscriptions/current`, service multiempresa, migration e 6 testes de contrato dedicados. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-04` | `RF50` | `real_dev/api/prisma/schema.prisma`; `real_dev/api/prisma/migrations/20260704120000_mf8_company_subscriptions/migration.sql`; `real_dev/api/src/modules/subscriptions/subscriptionService.js`; `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`; `real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `node --test real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js`; `npm --prefix real_dev/api run syntax:check`; `npm --prefix real_dev/api run prisma:validate`; `npm --prefix real_dev/api run prisma:generate`; `npm --prefix real_dev/api run test:unit`; `npm --prefix real_dev/api run test:contracts`; `npm --prefix real_dev/web run typecheck`; `npm --prefix real_dev/web run build`; `bash scripts/validate-planificacao.sh` |

### Contratos consumidos

- `RF50`: gestao da subscricao simulada da empresa ativa por Admin/Gestor.
- `BK-MF8-03`: catalogo fechado `monthly`, `quarterly`, `yearly` e helper `getSimulatedSubscriptionPlan(code)`.
- `MF0/MF1`: `requireAuth(prisma)`, `requireCompanyContext(prisma)` e `requireRole("ADMIN", "GESTOR")`.
- Stack real: Express/ES Modules e Prisma em `real_dev/api`, sem novo framework, dependencia externa, pagamento real ou frontend.

### Contratos entregues

- Modelo Prisma `CompanySubscription` com `companyId @unique`, `planCode`, `status`, `startsAt`, `endsAt`, `simulated`, `createdAt` e `updatedAt`.
- Enum `CompanySubscriptionStatus` com `ACTIVE`, `CANCELLED` e `EXPIRED`.
- Migration `20260704120000_mf8_company_subscriptions` para enum, tabela, indices e FK `CompanySubscription.companyId -> Company.id`.
- Service `getCurrentSubscription(prisma, { companyId })`, sempre preso ao `companyId` resolvido no backend.
- `formatCurrentSubscription(subscription)` com `state: "none"` quando nao existe subscricao.
- `assertSubscriptionBelongsToActiveCompany(subscription, companyId)` preparado para os BKs seguintes.
- Rota `GET /api/subscriptions/current` no router ja montado em `/api/subscriptions`.
- Erro controlado `COMPANY_CONTEXT_REQUIRED` quando falta empresa ativa.
- Erro controlado `SUBSCRIPTION_PLAN_DRIFT` quando a subscricao persistida referencia plano fora do catalogo.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:unit`, `test:contracts`, `syntax:check`, `typecheck` e `build` continuam verdes; a migration nova nao altera contratos de MF7. |
| `BK-MF8-03 -> BK-MF8-04` | `OK` | A subscricao atual reutiliza `getSimulatedSubscriptionPlan(code)` e nao duplica o catalogo de planos. |
| `BK-MF8-04 -> BK-MF8-05` | `OK` | O proximo BK pode reutilizar `CompanySubscription`, `companyId`, `planCode`, `status`, `startsAt`, `endsAt`, `getCurrentSubscription` e `assertSubscriptionBelongsToActiveCompany`. |
| `BK-MF8-04 -> BK-MF8-07/BK-MF8-08` | `OK` | O frontend futuro pode consumir `GET /api/subscriptions/current`; os testes/evidence futuros ja tem contrato HTTP estavel. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Foi entregue apenas a leitura persistente de RF50; ativacao, renovacao, cancelamento, reativacao, UI, pagamentos, checkout e faturacao continuam fora de scope. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/prisma/migrations/20260704120000_mf8_company_subscriptions/migration.sql`
- `real_dev/api/src/modules/subscriptions/subscriptionService.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- inventario dos guias `docs/planificacao/guias-bk/MF8/BK-MF8-*.md`, com leitura aprofundada de `BK-MF8-03`, `BK-MF8-04`, `BK-MF8-05`, `BK-MF8-07` e `BK-MF8-08`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/auth/authMiddleware.js`
- `real_dev/api/src/modules/companies/companyContext.js`
- `real_dev/api/src/modules/permissions/permissionMiddleware.js`
- `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; apenas relatorios MF8 untracked ja presentes no inicio. |
| `node --check real_dev/api/src/modules/subscriptions/subscriptionService.js` | `PASS` |
| `node --check real_dev/api/src/modules/subscriptions/subscriptionRoutes.js` | `PASS` |
| `node --check real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `PASS` |
| `node --test real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js` | `PASS`; 6 testes, 6 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:generate` | `PASS`; Prisma Client v6.19.3 gerado. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 76 testes, 76 pass. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| Pesquisa estatica global de risco em `real_dev/api real_dev/web` com `dist` excluido | `PASS_COM_RESSALVAS`; hits existentes sao helpers de redacao/segredo, storage privado e testes negativos; sem evidencia de risco ligado a `BK-MF8-04`. |
| Pesquisa estatica nos ficheiros do BK | `PASS`; sem matches de risco. |
| Pesquisa de drift de dominio em `real_dev/api real_dev/web` com `dist` excluido | `PASS`; sem referencias a dominios externos. |
| Pesquisa focada de `companyId` vindo de body/query no modulo de subscricoes | `PASS_COM_RESSALVAS`; unico match e comentario que declara que `req.companyId` vem do middleware e nao de body/query. |
| `bash scripts/validate-planificacao.sh` | `PASS_COM_RESSALVAS`; exit 0 com `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true` e `advisory_pass=false` por advisories legados fora deste scope. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \t]+$" real_dev/api/src/modules/subscriptions/subscriptionService.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js real_dev/api/prisma/schema.prisma real_dev/api/prisma/migrations/20260704120000_mf8_company_subscriptions/migration.sql docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `PASS`; sem espacos finais nos ficheiros alterados. |
| `git check-ignore -v real_dev/api/prisma/schema.prisma real_dev/api/src/modules/subscriptions/subscriptionService.js real_dev/api/tests/contracts/mf8-current-subscription.contract.test.js real_dev/api/prisma/migrations/20260704120000_mf8_company_subscriptions/migration.sql real_dev/web/dist/index.html` | `INFO`; confirmou que `real_dev/` e ignorado por `.gitignore`, comportamento esperado nesta PAP. |

### Validacoes nao executadas

- Smoke HTTP real com servidor local nao foi executado porque a suite de contrato valida router, guards, payloads e erros sem abrir porta local; isto evita falsos negativos de sandbox e cobre o contrato relevante do BK.
- `npm --prefix real_dev/api run test:integration` nao foi executado porque exigiria ambiente de persistencia real; a cobertura proporcional ficou em schema/migration, Prisma Client, contrato HTTP, unitarios e contratos completos.
- Evidence separada em `docs/evidence/MF8/BK-MF8-04.md` nao foi criada porque esta execucao tinha `PERMITIR_ALTERAR_DOCS=nao`; a evidence tecnica desta execucao fica registada neste relatorio permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Blockers e TODOs

Nao ha blockers para `BK-MF8-04`.

TODO operacional para o proximo BK: `BK-MF8-05` deve implementar ativacao simulada usando a mesma tabela `CompanySubscription`, sem aceitar `companyId` do browser, sem criar checkout/pagamento real e com logs/auditoria proporcionais a operacao sensivel.

### Decisao final

`BK-MF8-04` fica `IMPLEMENTADO`. A proxima acao recomendada e implementar ou auditar `BK-MF8-05 - Ativacao simulada de subscricao`, reutilizando o contrato entregue nesta execucao.

## Execucao 2026-07-04 - BK-MF8-03

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-03`, com `IMPLEMENTATION_ROOT=real_dev`.

O `BK-MF8-03 - Catalogo de planos de subscricao simulados` ficou `IMPLEMENTADO` no backend real. A implementacao criou o catalogo canonico em `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`, criou o router protegido em `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`, montou `GET /api/subscriptions/plans` e `GET /api/subscriptions/plans/:code` em `real_dev/api/src/server.js`, e adicionou testes de contrato em `real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js`.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` foi este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-03` | `IMPLEMENTADO` | Catalogo RF49 com `monthly`, `quarterly`, `yearly`, rotas protegidas, montagem em `/api/subscriptions` e 10 testes de contrato. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-03` | `RF49` | `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`; `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`; `real_dev/api/src/server.js`; `real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js` | `node --test real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js`; `npm --prefix real_dev/api run syntax:check`; `npm --prefix real_dev/api run test:contracts` |

### Contratos consumidos

- `RF49`: consulta dos tres planos de subscricao simulados: mensal, trimestral e anual.
- `BK-MF8-02`: readiness operacional continua separado do dominio de subscricoes.
- `MF0/MF1`: middlewares reais de autenticacao, empresa ativa e roles (`requireAuth`, `requireCompanyContext`, `requireRole`).
- Stack real: Express/ES Modules em `real_dev/api`, sem novo framework, sem Prisma schema novo, sem frontend e sem dependencia externa.

### Contratos entregues

- `SIMULATED_PLAN_CODES`: lista fechada com `monthly`, `quarterly` e `yearly`.
- `listSimulatedSubscriptionPlans()`: devolve copias imutaveis dos tres planos, todos com `currency: "EUR"` e `simulated: true`.
- `getSimulatedSubscriptionPlan(code)`: valida codigos de plano para BKs seguintes.
- `PLAN_NOT_FOUND_CODE`: erro estavel `SUBSCRIPTION_PLAN_NOT_FOUND`.
- `buildSubscriptionRoutes({ prisma })`: router Express protegido por sessao, empresa ativa e roles `ADMIN`/`GESTOR`.
- `GET /api/subscriptions/plans`: lista planos simulados sem aceitar `companyId` do browser.
- `GET /api/subscriptions/plans/:code`: devolve detalhe ou `404` estavel para codigo inexistente.
- O catalogo nao devolve `gateway`, `checkoutUrl`, `paymentProvider` nem `invoiceId`.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:contracts` continua verde com 70 testes e os routers anteriores mantem contratos criticos. |
| `BK-MF8-02 -> BK-MF8-03` | `OK` | Health-check continua separado; o catalogo de planos entra num modulo proprio de subscricoes. |
| `BK-MF8-03 -> BK-MF8-04` | `OK` | `getSimulatedSubscriptionPlan(code)` e os codigos `monthly`/`quarterly`/`yearly` ficam prontos para validar a subscricao da empresa ativa. |
| `BK-MF8-03 -> BK-MF8-07/BK-MF8-08` | `OK` | As rotas e exports entregam base para UI de planos e evidence final de subscricoes simuladas. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Foi entregue apenas RF49; nao foram antecipados pagamentos, checkout, faturas, persistencia de subscricao, UI, IA ou scope de MF futura. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`
- `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`
- `real_dev/api/src/server.js`
- `real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-04-subscricao-por-empresa-ativa.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-07-ui-de-planos-e-gestao-da-subscricao.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/src/server.js`
- `real_dev/api/src/modules/auth/authMiddleware.js`
- `real_dev/api/src/modules/companies/companyContext.js`
- `real_dev/api/src/modules/permissions/permissionMiddleware.js`
- `real_dev/api/prisma/schema.prisma`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; apenas relatorios MF8 untracked ja presentes no inicio. |
| `git check-ignore -v real_dev/api/src/modules/subscriptions/subscriptionPlans.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js real_dev/api/src/server.js real_dev/web/dist/index.html` | `INFO`; confirmou que `real_dev/` e ignorado por `.gitignore`, comportamento esperado nesta PAP. |
| `node --test real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js` | `PASS`; 10 testes, 10 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `npm --prefix real_dev/api run prisma:validate` | `FAIL_ESPERADO`; faltava `DATABASE_URL` no ambiente. |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 70 testes, 70 pass. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| Pesquisa estatica global de risco em `real_dev/api real_dev/web` com `dist` excluido | `PASS_COM_RESSALVAS`; hits existentes sao helpers de redacao/segredo, storage privado e testes negativos; sem evidencia de risco ligado a `BK-MF8-03`. |
| Pesquisa estatica nos ficheiros do BK | `PASS_COM_RESSALVAS`; matches existem apenas na lista de campos proibidos do teste negativo (`gateway`, `checkoutUrl`, `paymentProvider`, `invoiceId`). |
| Pesquisa de drift de dominio em `real_dev/api real_dev/web` com `dist` excluido | `PASS`; sem referencias a dominios externos. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \t]+$" real_dev/api/src/modules/subscriptions/subscriptionPlans.js real_dev/api/src/modules/subscriptions/subscriptionRoutes.js real_dev/api/src/server.js real_dev/api/tests/contracts/mf8-subscription-plans.contract.test.js docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `PASS`; sem espacos finais nos ficheiros alterados. |

### Validacoes nao executadas

- Smoke HTTP real com servidor local nao foi executado porque a suite de contrato valida o router e a montagem sem abrir porta local; isto evita falsos negativos de sandbox e cobre o contrato relevante do BK.
- `npm --prefix real_dev/api run test:integration` nao foi executado porque `BK-MF8-03` nao altera persistencia, schema, repositorios, migrations nem fluxos com base de dados.
- Teste frontend especifico de subscricoes nao foi executado porque o proprio BK declara UI fora de scope; a validacao frontend proporcional foi `typecheck` e `build`.

### Blockers e TODOs

Nao ha blockers para `BK-MF8-03`.

TODO operacional para o proximo BK: `BK-MF8-04` deve reutilizar `getSimulatedSubscriptionPlan(code)` e guardar apenas a subscricao simulada da empresa ativa, sem aceitar `companyId` do browser e sem introduzir pagamentos reais.

### Decisao final

`BK-MF8-03` fica `IMPLEMENTADO`. A proxima acao recomendada e implementar ou auditar `BK-MF8-04 - Subscricao por empresa ativa`, consumindo o catalogo simulado entregue neste BK.

## Execucao 2026-07-03 - BK-MF8-02

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo `BK-MF8-02`, com `IMPLEMENTATION_ROOT=real_dev`.

O `BK-MF8-02 - Endpoint de health-check` ficou `IMPLEMENTADO` no backend real. A implementacao criou o router publico e seguro de readiness em `real_dev/api/src/modules/ops/healthRoutes.js`, montou `GET /api/health` em `real_dev/api/src/server.js` antes dos routers autenticados, e adicionou testes de contrato em `real_dev/api/tests/contracts/mf8-health.contract.test.js`.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` foi este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-02` | `IMPLEMENTADO` | `GET /api/health` montado, payload fechado e testes de contrato com positivos/negativos. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-02` | `RNF29` | `real_dev/api/src/modules/ops/healthRoutes.js`; `real_dev/api/src/server.js`; `real_dev/api/tests/contracts/mf8-health.contract.test.js` | `node --test real_dev/api/tests/contracts/mf8-health.contract.test.js`; `npm --prefix real_dev/api run syntax:check`; `npm --prefix real_dev/api run test:contracts` |

### Contratos consumidos

- `BK-MF8-01`: modulo `ops` ja existente e decisao de nao gerar log por cada pedido de health-check, para evitar ruido operacional.
- `MF6`: hardening transversal continua antes da rota, incluindo HTTPS em producao, HSTS e origem confiavel para metodos mutaveis.
- `MF7`: baseline de modularidade e testes automatizados continua validado por `test:contracts`.
- Stack real: Express/ES Modules em `real_dev/api`, sem novo framework, sem persistencia, sem UI e sem dependencia externa.

### Contratos entregues

- `buildHealthPayload(options, now)` devolve payload publico com lista fechada: `status`, `service`, `version`, `environment` e `checkedAt`.
- `buildHealthRoutes(options)` monta `GET /` e valida a configuracao antes de expor readiness.
- Ambientes aceites: `development`, `test` e `production`.
- O endpoint publico nao le base de dados, nao aceita input de negocio, nao usa `companyId`, nao expõe credenciais e nao mostra detalhes internos.
- `server.js` monta `GET /api/health` antes de `/api/auth`, mantendo middlewares transversais aplicados.
- `BK-MF8-03` pode usar `GET /api/health` como prova simples de readiness antes de subscricoes simuladas.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `test:contracts` continua verde e o endpoint operacional nao altera contratos de dominio, permissao, export/import ou SAF-T. |
| `BK-MF8-01 -> BK-MF8-02` | `OK` | O health-check entra no modulo `ops` e respeita o handoff de nao escrever logs por cada pedido. |
| `BK-MF8-02 -> BK-MF8-03` | `OK` | O proximo BK passa a ter readiness HTTP basica antes de expor o catalogo de planos simulados. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Foi entregue apenas RNF29; nao foram antecipadas subscricoes, IA, UI final ou correcoes de MF futura. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/src/modules/ops/healthRoutes.js`
- `real_dev/api/src/server.js`
- `real_dev/api/tests/contracts/mf8-health.contract.test.js`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-03-catalogo-de-planos-de-subscricao-simulados.md`
- Headers e handoffs de `docs/planificacao/guias-bk/MF0..MF8`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF8.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF8.md`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/src/config/env.js`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/src/modules/ops/structuredLogger.js`
- `real_dev/web/tsconfig.json`
- `real_dev/web/vite.config.ts`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS_COM_RESSALVAS`; apenas relatorios MF8 untracked ja presentes no inicio. |
| `git check-ignore -v real_dev/api/src/modules/ops/healthRoutes.js real_dev/api/src/server.js real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS`; confirmou `real_dev/` ignorado por `.gitignore`. |
| `node --check real_dev/api/src/modules/ops/healthRoutes.js` | `PASS` |
| `node --check real_dev/api/src/server.js` | `PASS` |
| `node --check real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS` |
| `node --test real_dev/api/tests/contracts/mf8-health.contract.test.js` | `PASS`; 7 testes, 7 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 60 testes, 60 pass. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| Pesquisa estatica de risco nos ficheiros alterados | `PASS`; sem matches. |
| Pesquisa de drift de dominio nos ficheiros alterados | `PASS`; sem matches. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \t]+$" real_dev/api/src/modules/ops/healthRoutes.js real_dev/api/src/server.js real_dev/api/tests/contracts/mf8-health.contract.test.js docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `PASS`; sem espacos finais nos ficheiros alterados. |

### Validacoes nao executadas

- Smoke HTTP com `curl http://localhost:3000/api/health` nao foi executado porque exigiria arrancar o servidor e abrir porta local; a prova relevante neste ambiente ficou coberta por teste de router e teste de montagem em `server.js` sem depender de rede local.
- `npm --prefix real_dev/api run test:integration` nao foi executado porque `BK-MF8-02` nao altera persistencia, schema, repositorios nem fluxos com base de dados.

### Blockers e TODOs

Nao ha blockers para `BK-MF8-02`.

TODO operacional para o proximo BK: `BK-MF8-03` deve manter subscricoes simuladas separadas deste endpoint e continuar sem gateway de pagamento real, checkout ou faturas.

### Decisao final

`BK-MF8-02` fica `IMPLEMENTADO`. A proxima acao recomendada e implementar ou auditar `BK-MF8-03 - Catalogo de planos de subscricao simulados`, consumindo `GET /api/health` apenas como readiness operacional e nao como fonte de dados de dominio.

## Execucao 2026-07-03 - BK-MF8-01

### Resultado geral

Estado geral: `PASS`

Modo executado: `implementar`

Escopo: `MF8`, alvo normalizado de `BK-MF8-1` para `BK-MF8-01`, com `IMPLEMENTATION_ROOT=real_dev`.

O `BK-MF8-01 - Logs estruturados (info, warn, error, audit)` ficou `IMPLEMENTADO` no backend real. A implementacao criou um logger operacional estruturado em `real_dev/api/src/modules/ops/structuredLogger.js`, ligou o arranque da API a `api.started` em `real_dev/api/src/server.js` e adicionou testes unitarios de contrato em `real_dev/api/tests/unit/structuredLogger.test.js`.

Nao foram alterados BKs, RF/RNF, backlog, matriz, guias canonicos, prompts, `apps/` nem `mockup/`. A unica alteracao fora de `real_dev/` foi este relatorio tecnico, permitido por `OUTPUT_MODE=relatorio_e_resumo`.

### Estado por BK

| BK | Estado | Evidencia |
| --- | --- | --- |
| `BK-MF8-01` | `IMPLEMENTADO` | Logger RNF28 criado, arranque estruturado e testes unitarios com positivos/negativos. |

### Rastreabilidade

| BK | RF/RNF | Ficheiros reais | Testes/validacoes |
| --- | --- | --- | --- |
| `BK-MF8-01` | `RNF28` | `real_dev/api/src/modules/ops/structuredLogger.js`; `real_dev/api/src/server.js`; `real_dev/api/tests/unit/structuredLogger.test.js` | `node --test real_dev/api/tests/unit/structuredLogger.test.js`; `npm --prefix real_dev/api run test:unit`; `npm --prefix real_dev/api run test:contracts` |

### Contratos consumidos

- `MF0..MF7`: autenticação por cookies HttpOnly, empresa ativa no backend, permissoes, auditoria persistente, logs de integracao, hardening e testes criticos.
- `BK-MF7-10`: baseline de testes automatizados para modulos criticos, confirmado por `test:contracts`.
- `MF4/MF6`: `AuditLog` persistente e `recordSensitiveAudit` continuam separados do logger operacional.
- `MF4/MF7`: `IntegrationLog` continua separado para uploads, SAF-T e importacoes.

### Contratos entregues

- `createStructuredLogEvent(input)` normaliza eventos com `timestamp`, `level`, `event`, `module`, `requirement` e `context`.
- Niveis aceites: `info`, `warn`, `error`, `audit`.
- Contexto seguro: apenas `string`, `number`, `boolean` ou `null`; objetos e arrays sao rejeitados.
- Chaves sensiveis bloqueadas por normalizacao defensiva, incluindo variantes como `apiKey`, `api_key`, `password_hash`, `rawPayload`, `authorization`, `cookie`, `headers`, `iban` e `nif`.
- `writeStructuredLog(event)` encaminha `error` para `console.error`, `warn` para `console.warn` e `info`/`audit` para `console.info`.
- `server.js` escreve `api.started` com metadados seguros (`port`, `environment`) e sem headers, cookies, secrets, `DATABASE_URL`, payloads ou dados financeiros.

### Coerencia entre MFs

| Ligacao | Estado | Observacao |
| --- | --- | --- |
| `MF7 -> MF8` | `OK` | `BK-MF7-10` permanece validado por contratos; `BK-MF8-01` acrescenta observabilidade sem quebrar modulos criticos. |
| `BK-MF8-01 -> BK-MF8-02` | `OK` | `BK-MF8-02` pode reutilizar o modulo `ops` e o logger estruturado para eventos operacionais relevantes. |
| `MF8 -> MF futura` | `OK_COM_RESSALVAS` | Handoff entregue para health-check e fecho operacional; nao foram implementados requisitos fora do BK alvo. |

### Findings por severidade

Nao ha findings ativos confirmados nesta implementacao.

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Nao aplicavel |
| `P1` | 0 | Nao aplicavel |
| `P2` | 0 | Nao aplicavel |
| `P3` | 0 | Nao aplicavel |

### Ficheiros alterados

- `real_dev/api/src/modules/ops/structuredLogger.js`
- `real_dev/api/src/server.js`
- `real_dev/api/tests/unit/structuredLogger.test.js`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md`

### Ficheiros revistos

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`
- `docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md`
- `docs/planificacao/guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md`
- Headers e handoffs de `docs/planificacao/guias-bk/MF0..MF8`
- `real_dev/api/package.json`
- `real_dev/web/package.json`
- `real_dev/api/src/config/env.js`
- `real_dev/api/src/config/envFile.js`
- `real_dev/api/prisma/schema.prisma`
- `real_dev/api/src/modules/audit/auditLogService.js`
- `real_dev/api/src/modules/integrations/integrationLogService.js`
- `real_dev/web/tsconfig.json`
- `real_dev/web/vite.config.ts`

### Comandos executados

| Comando | Resultado |
| --- | --- |
| `git status --short` | `PASS`; sem output. |
| `git check-ignore -v real_dev real_dev/api/src/server.js real_dev/api/tests/unit/mf0-validators.test.js` | `PASS`; confirmou `real_dev/` ignorado por `.gitignore`. |
| `node --check real_dev/api/src/modules/ops/structuredLogger.js` | `PASS` |
| `node --check real_dev/api/src/server.js` | `PASS` |
| `node --test real_dev/api/tests/unit/structuredLogger.test.js` | `PASS`; 5 testes, 5 pass. |
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | `PASS`; schema Prisma valido. |
| `npm --prefix real_dev/api run test:unit` | `PASS`; 79 testes, 79 pass. |
| `npm --prefix real_dev/api run test:contracts` | `PASS`; 53 testes, 53 pass. |
| `npm --prefix real_dev/web run typecheck` | `PASS` |
| `npm --prefix real_dev/web run build` | `PASS`; Vite build concluido. |
| Pesquisa estatica de risco nos ficheiros alterados | `PASS_COM_RESSALVAS`; matches apenas na denylist e nos negativos do logger, sem segredo real nem log sensivel. |
| Pesquisa de drift de dominio nos ficheiros alterados | `PASS`; sem referencias a outros produtos/dominios. |
| `git diff --check` | `PASS`; sem whitespace errors em ficheiros rastreados. |
| `rg -n "[ \t]+$" real_dev/api/src/modules/ops/structuredLogger.js real_dev/api/src/server.js real_dev/api/tests/unit/structuredLogger.test.js docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF8.md` | `PASS`; sem espacos finais nos ficheiros alterados. |

### Validacoes nao executadas

- `npm --prefix real_dev/api run test:integration` nao foi executado porque o BK nao altera persistencia, schema, repositorios nem fluxos HTTP com base de dados. As suites relevantes para RNF28 foram `syntax:check`, `prisma:validate`, `test:unit`, `test:contracts`, `typecheck` e `build`.
- Smoke HTTP/browser nao foi executado porque o BK nao cria endpoint nem UI. O arranque da API ficou validado por sintaxe e suite unit/contract; o primeiro consumo HTTP esperado pertence a `BK-MF8-02`.

### Blockers e TODOs

Nao ha blockers para `BK-MF8-01`.

TODO operacional para o proximo BK: em `BK-MF8-02`, consumir o modulo `ops` sem registar todos os pedidos de health-check, para evitar ruido operacional.

### Decisao final

`BK-MF8-01` fica `IMPLEMENTADO`. A proxima acao recomendada e implementar ou auditar `BK-MF8-02 - Endpoint de health-check`, reutilizando o contrato `ops/structuredLogger.js` quando houver eventos operacionais relevantes.
