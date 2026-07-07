# Execução final de testes MF8

## Identificação

- BK: BK-MF8-17
- Requisito: RNF38
<<<<<<< HEAD
- Data/hora: 2026-07-06T09:41:30.651Z
=======
- Data/hora: 2026-07-07T01:35:15.749Z
>>>>>>> 81619f4 (Update: Mid)
- Evidence de entrada: `docs/evidence/MF8/TESTES-EM-FALTA.md`
- Decisão final: `BLOQUEADO_ATE_CORRECAO`

## Precondições

| Verificação | Resultado esperado | Resultado observado | Decisão |
| --- | --- | --- | --- |
<<<<<<< HEAD
| Evidence de testes em falta criada no BK-MF8-16 | O ficheiro existe antes da execução final. | Encontrado. | OK |
=======
| Evidence de testes em falta criada no BK-MF8-16 | O ficheiro existe antes da execucao final. | Encontrado. | OK |
>>>>>>> 81619f4 (Update: Mid)

## Resumo da evidence do BK-MF8-16

```md
# Testes em falta MF8

<<<<<<< HEAD
## Identificação

- BK: BK-MF8-16
- Requisito: RNF37
- Owner: Oleksii
- Apoio: Andre
- Data:
- Branch/PR:

## Comandos executados
=======
## Identificacao

- BK: `BK-MF8-16`
- Requisito: `RNF37`
- Owner: `Oleksii`
- Apoio: `Andre`
- Data: `2026-07-07`
- Branch/PR: local, sem commit nesta execucao
- Implementation root validado: `real_dev`
- Guia canonico: `docs/planificacao/guias-bk/MF8/BK-MF8-16-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
>>>>>>> 81619f4 (Update: Mid)
```

## Comandos executados

| Área | Diretório | Comando | Resultado esperado | Exit code | Decisão |
| --- | --- | --- | --- | ---: | --- |
<<<<<<< HEAD
| API | `D:\PAP\edu-PAP-3ig-opsa-2526\apps\api` | `npm run test:final:prepare` | syntax, unitários, contratos, integração, MF6, MF7 e MF8 sem falhas. | 1 | BLOQUEANTE |
| WEB | `D:\PAP\edu-PAP-3ig-opsa-2526\apps\web` | `npm run test:final:prepare` | gates frontend, typecheck e build sem falhas. | 1 | BLOQUEANTE |
| PLANIFICACAO | `D:\PAP\edu-PAP-3ig-opsa-2526` | `bash scripts/validate-planificacao.sh` | overall_pass=true no relatório JSON do validador. | 1 | BLOQUEANTE |
=======
| API | `/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/real_dev/api` | `npm run test:final:prepare` | syntax, unitarios, contratos, integracao, MF6, MF7 e MF8 sem falhas. | 1 | BLOQUEANTE |
| WEB | `/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/real_dev/web` | `npm run test:final:prepare` | gates frontend, typecheck e build sem falhas. | 0 | OK |
| PLANIFICACAO | `/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa` | `bash scripts/validate-planificacao.sh` | overall_pass=true no relatorio JSON do validador. | 0 | OK |
>>>>>>> 81619f4 (Update: Mid)

## Output observado

### API - npm run test:final:prepare

<<<<<<< HEAD
- Diretório: `D:\PAP\edu-PAP-3ig-opsa-2526\apps\api`
=======
- Diretório: `/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/real_dev/api`
>>>>>>> 81619f4 (Update: Mid)
- Exit code: `1`
- Decisão: `BLOQUEANTE`

#### stdout

```text
<<<<<<< HEAD
Sem stdout.
=======
> @opsa/api@1.0.0 test:final:prepare<br>> npm run syntax:check && npm run test:unit && npm run test:contracts && npm run test:integration && npm run test:mf6 && npm run test:mf7 && npm run test:mf8<br><br><br>> @opsa/api@1.0.0 syntax:check<br>> find src tests scripts -name '*.js' -print0 \| xargs -0 -n 1 node --check<br><br><br>> @opsa/api@1.0.0 test:unit<br>> node --test tests/unit/*.test.js<br><br>✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (1.176042ms)<br>✔ BK01: registo mantém política de password forte (0.30175ms)<br>✔ BK06: perfil da empresa assume EUR quando currency é omitida (0.184959ms)<br>✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.098667ms)<br>✔ BK07: importação vazia é rejeitada (0.073292ms)<br>✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (0.116833ms)<br>✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (0.124667ms)<br>✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (0.097791ms)<br>✔ BK02: permissões de escrita seguem os atores documentados na MF0 (0.070708ms)<br>✔ BK-MF1-01: IVA isento exige motivo de isenção (4.571375ms)<br>✔ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (0.481334ms)<br>✔ BK-MF1-06: emissão definitiva exige venda aprovada (0.242292ms)<br>✔ BK-MF1-02: emissão definitiva reserva número por upsert atómico (0.496791ms)<br>✔ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (0.15725ms)<br>✔ BK-MF1-03: recebimento não pode exceder montante em aberto (0.267541ms)<br>✔ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (0.14775ms)<br>✔ BK-MF1-04: lançamento de venda fica balanceado (0.849208ms)<br>✔ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidad...
>>>>>>> 81619f4 (Update: Mid)
```

#### stderr

```text
<<<<<<< HEAD
spawnSync npm ENOENT
=======
Sem stderr.
>>>>>>> 81619f4 (Update: Mid)
```

### WEB - npm run test:final:prepare

<<<<<<< HEAD
- Diretório: `D:\PAP\edu-PAP-3ig-opsa-2526\apps\web`
- Exit code: `1`
- Decisão: `BLOQUEANTE`
=======
- Diretório: `/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/real_dev/web`
- Exit code: `0`
- Decisão: `OK`
>>>>>>> 81619f4 (Update: Mid)

#### stdout

```text
<<<<<<< HEAD
Sem stdout.
=======
> @opsa/web@1.0.0 test:final:prepare<br>> npm run test:mf1 && npm run test:mf2 && npm run test:mf3 && npm run test:mf5:feedback && npm run test:mf5:responsive && npm run test:mf5:a11y && npm run test:mf5:forms && npm run test:mf5:errors && npm run test:mf5:performance && npm run test:mf7 && npm run test:mf8<br><br><br>> @opsa/web@1.0.0 test:mf1<br>> node scripts/check-mf1-pages.mjs<br><br>MF1 frontend pages contract OK<br><br>> @opsa/web@1.0.0 test:mf2<br>> node scripts/check-mf2-pages.mjs<br><br>MF2 frontend pages contract OK<br><br>> @opsa/web@1.0.0 test:mf3<br>> node scripts/check-mf3-pages.mjs<br><br>MF3 pages smoke OK<br><br>> @opsa/web@1.0.0 test:mf5:feedback<br>> node scripts/check-mf5-feedback.mjs<br><br>MF5 feedback smoke OK<br><br>> @opsa/web@1.0.0 test:mf5:responsive<br>> node scripts/check-mf5-responsive.mjs<br><br>MF5 responsive table smoke OK<br><br>> @opsa/web@1.0.0 test:mf5:a11y<br>> node scripts/check-mf5-accessibility.mjs<br><br>MF5 accessibility contract OK<br><br>> @opsa/web@1.0.0 test:mf5:forms<br>> node scripts/check-mf5-form-validation.mjs<br><br>MF5 form validation smoke OK<br><br>> @opsa/web@1.0.0 test:mf5:errors<br>> node scripts/check-mf5-error-messages.mjs<br><br>MF5 error messages smoke OK<br><br>> @opsa/web@1.0.0 test:mf5:performance<br>> node scripts/check-mf5-performance.mjs<br><br>MF5 performance budget contract OK<br><br>> @opsa/web@1.0.0 test:mf7<br>> npm run test:mf7:browser-compatibility && npm run check:mf7:frontend-modules && npm run typecheck && npm run build<br><br><br>> @opsa/web@1.0.0 test:mf7:browser-compatibility<br>> node scripts/check-mf7-browser-compatibility.mjs<br><br>MF7 browser compatibility gate OK<br><br>> @opsa/web@1.0.0 check:mf7:frontend-modules<br>> node scripts/check-mf7-frontend-modules.mjs<br><br>MF7 frontend ...
>>>>>>> 81619f4 (Update: Mid)
```

#### stderr

```text
<<<<<<< HEAD
spawnSync npm ENOENT
=======
Sem stderr.
>>>>>>> 81619f4 (Update: Mid)
```

### PLANIFICACAO - bash scripts/validate-planificacao.sh

<<<<<<< HEAD
- Diretório: `D:\PAP\edu-PAP-3ig-opsa-2526`
- Exit code: `1`
- Decisão: `BLOQUEANTE`
=======
- Diretório: `/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa`
- Exit code: `0`
- Decisão: `OK`
>>>>>>> 81619f4 (Update: Mid)

#### stdout

```text
<<<<<<< HEAD
Sem stdout.
=======
{<br>  "counts": {<br>    "rf_docs": 51,<br>    "rnf_docs": 39,<br>    "matriz_bk": 93,<br>    "backlog_bk": 93,<br>    "guide_bk": 93<br>  },<br>  "coverage": {<br>    "missing_rf_matrix": [],<br>    "missing_rnf_matrix": [],<br>    "missing_rf_backlog": [],<br>    "missing_rnf_backlog": [],<br>    "invalid_refs": []<br>  },<br>  "consistency": {<br>    "matriz_backlog_mismatches": [],<br>    "broken_guia_links": [],<br>    "invalid_dependencies": [],<br>    "cycles": [],<br>    "outdated_docs": [<br>      "/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/docs/planificacao/sprints/SCORECARD-SPRINTS.md",<br>      "/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md",<br>      "/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/opsa/docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md"<br>    ],<br>    "scorecard_contract_issues": [],<br>    "declared_totals_issues": [],<br>    "rnf_index_anchor_issues": []<br>  },<br>  "guides_quality": {<br>    "guide_header_issues": [],<br>    "guide_content_issues": [<br>      {<br>        "bk_id": "BK-MF0-01",<br>        "issue": "missing_handoff_proximo_bk_line"<br>      },<br>      {<br>        "bk_id": "BK-MF0-01",<br>        "issue": "missing_pedagogic_or_operational_blocks"<br>      },<br>      {<br>        "bk_id": "BK-MF0-01",<br>        "issue": "missing_or_placeholder_snippet"<br>      },<br>      {<br>        "bk_id": "BK-MF0-01",<br>        "issue": "P0_minimos(step=49,neg=0)"<br>      },<br>      {<br>        "bk_id": "BK-MF0-02",<br>        "issue": "missing_handoff_proximo_bk_line"<br>      },<br>      {<br>        "bk_id": "BK-MF0-02",<br>        "issue": "missing_pedagogic_or_operational_blocks"<br>      },<br>      {<br>        "bk_id": "BK-MF0-...
>>>>>>> 81619f4 (Update: Mid)
```

#### stderr

```text
<<<<<<< HEAD
spawnSync bash ENOENT
=======
Sem stderr.
>>>>>>> 81619f4 (Update: Mid)
```

## Cenários negativos

| Cenário | Resultado esperado | Decisão |
| --- | --- | --- |
| `TESTES-EM-FALTA.md` ausente | Script termina antes da bateria final com decisão `BLOQUEANTE`. | Coberto por precondição. |
| `test:final:prepare` falha na API ou na web | Evidence regista exit code diferente de zero e decisão `BLOQUEANTE`. | Coberto por execução real. |

## Handoff para BK-MF8-18

- Se a decisão final for `PODE_AVANCAR_PARA_BK-MF8-18`, o próximo BK só precisa verificar se não há falhas residuais.
- Se a decisão final for `BLOQUEADO_ATE_CORRECAO`, o próximo BK deve começar pelo primeiro comando com decisão `BLOQUEANTE`.
- Nunca apagar outputs antigos sem guardar a nova execução.

## Decisão

Decisão final: `BLOQUEADO_ATE_CORRECAO`
