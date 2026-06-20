# AUDITORIA-HIDRATACAO-MF5

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF5`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- `area`: `planificacao/guias-bk`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-06-20`

## Escopo desta execucao

- Projeto: `OPSA`
- MF processada: `MF5`
- BK alvo: `BK-MF5-05`
- Modo: `corrigir_apenas`
- Implementation root consultado: `real_dev`
- Audit report source: `auto`
- Audit report path: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`
- Findings selecionados: todos os findings confirmados para `BK-MF5-05`.
- Severidades consideradas: `P0`, `P1`, `P2`, `P3`
- Incluir P3: sim.
- Output: `relatorio_e_resumo`
- Strict scope: ativo.
- BKs editados nesta execucao: `docs/planificacao/guias-bk/MF5/BK-MF5-05-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-iva-contas-snc.md`.
- Relatorios editados nesta execucao: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md`.
- Codigo de implementacao editado: nenhum.
- `apps/`, `mockup/`, RF/RNF, matriz, backlog, sprints, outros BKs e restantes documentos canonicos editados: nenhum.
- Commits: nao executados, conforme `PERMITIR_COMMITS=nao`.

## Documentos e fontes consultadas

- Prompt anexada desta execucao.
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
- Todos os BKs de `docs/planificacao/guias-bk/MF5/`, com foco em `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-05` e `BK-MF5-06`.
- `real_dev/web/package.json`
- `real_dev/web/src/App.tsx`
- `real_dev/web/src/lib/apiClient.ts`
- `real_dev/web/src/pages/mf1Pages.tsx`
- `real_dev/web/src/pages/mf2Pages.tsx`
- `real_dev/web/src/pages/mf3Pages.tsx`
- `real_dev/web/src/pages/mf4Pages.tsx`
- `real_dev/api/src/modules/company-profile/companyProfileValidators.js`
- `real_dev/api/src/modules/treasury/bankAccountValidators.js`
- `real_dev/api/src/modules/*/*Validators.js`, por pesquisa estatica direcionada.
- `real_dev/api/prisma/schema.prisma`, apenas para confirmar que este BK nao cria persistencia.

## Resumo executivo

O `BK-MF5-05` foi corrigido dentro do scope autorizado e passa de `PARCIAL` para `OK` enquanto guia documental. A versao atual tem 8 passos, 8 cenarios negativos, validadores frontend completos, datas ISO com roundtrip, distincao entre `vatRateId`, `vatRateBps` e `vatRatePercent`, integracao compativel com `action.fail(error: Error, fallback?)` e smoke proprio `test:mf5:forms`.

Nao foram feitas alteracoes ao `real_dev`, porque esta execucao pediu correcao de guias BK e docs autorizados, nao implementacao. O drift observado entre guias MF5 prescritivos e a implementacao real atual permanece registado como `BLOQUEADO_POR_SCOPE`.

| Escopo corrigido | OK | PARCIAL | CRITICO | DRIFT/OUT_OF_SCOPE |
| --- | ---: | ---: | ---: | ---: |
| `BK-MF5-05` | 1 | 0 | 0 | 0 |
| Coerencia vizinha observada | 0 | 0 | 0 | 1 |

## Inventario do BK alvo

| Campo | Valor |
| --- | --- |
| BK | `BK-MF5-05` |
| Titulo | Os formularios devem validar erros antes de submissao (NIF, IBAN, datas, IVA, contas SNC) |
| RF/RNF | `RNF05` |
| Prioridade | `P0` |
| Owner | `Oleksii` |
| Apoio | `Pedro` |
| Sprint | `S09-S10` |
| Dependencias canonicas | `-` |
| Dependencias tecnicas derivadas no guia | `BK-MF5-03` por `useActionFeedback`; `BK-MF5-04` por feedback acessivel |
| BK anterior na MF | `BK-MF5-04` |
| BK seguinte | `BK-MF5-06` |
| Tipo de entrega | Frontend transversal / validacao previa de formularios |
| Entidades Prisma | Nao aplicavel |
| Endpoints novos | Nenhum |
| DTOs/validators backend novos | Nenhum; backend existente continua autoridade final |
| Utilitarios previstos | `mf5FormValidators.ts`, `validateMf5Form`, `validateMf5FormData`, `formatMf5FormErrors` |
| Scripts previstos | `real_dev/web/scripts/check-mf5-form-validation.mjs`, `test:mf5:forms` |
| Estado documental apos correcao | `OK` |

## Criterios aplicados

- `OK`: o guia permite implementacao autonoma, segura e testavel por alunos, com estrutura completa, codigo integrado, validacao e handoff.
- `PARCIAL`: o guia tem boa orientacao, mas deixa decisoes, imports, ficheiros, passos, validacoes ou explicacoes essenciais por fechar.
- `CRITICO`: a lacuna impede implementacao autonoma ou cria risco relevante de seguranca, integridade, dominio, fiscalidade, contabilistica ou execucao da app.
- `DRIFT/OUT_OF_SCOPE`: incoerencia observada fora do BK alvo ou entre guia prescritivo e implementacao real atual, sem permissao de correcao nesta execucao.

## Classificacao do BK alvo

| BK | Estado anterior | Estado apos correcao | Evidencia |
| --- | --- | --- | --- |
| `BK-MF5-05` | `PARCIAL` | `OK` | Guia expandido para 8 passos e 8 negativos; inclui validadores completos, roundtrip ISO, separacao correta de IVA, contrato `Error` no feedback e smoke `test:mf5:forms`. |

## Findings

### MF5-AUD-20260620-BK05-F01

- BK/RF/RNF afetado: `BK-MF5-05` / `RNF05`
- Severidade: `P1`
- Estado anterior: `PARCIAL`
- Estado apos correcao: `CORRIGIDO`
- Tipo: qualidade pedagogica / contrato P0
- Evidencia anterior: o guia tinha 3 passos para um BK `P0`.
- Correcao aplicada: o tutorial tecnico passou a ter `8` passos (`Passo 1` a `Passo 8`) e `8` cenarios negativos.
- Resultado: o aluno recebe roteiro autonomo para inventario, fronteira backend/frontend, validadores, integracao generica, integracao dedicada, smoke e evidence.

### MF5-AUD-20260620-BK05-F02

- BK/RF/RNF afetado: `BK-MF5-05`, `BK-MF5-03` / `RNF03`, `RNF05`
- Severidade: `P1`
- Estado anterior: `PARCIAL`
- Estado apos correcao: `CORRIGIDO`
- Tipo: integracao entre BKs / executabilidade TypeScript
- Evidencia anterior: o guia passava texto simples para `action.fail`, embora `BK-MF5-03` defina `fail(error: Error, fallback?)`.
- Correcao aplicada: o guia passa a usar `action.fail(new Error(formatMf5FormErrors(validationErrors)))` e fallback tipado no `catch`.
- Resultado: o codigo documentado respeita o contrato do hook de feedback imediato.

### MF5-AUD-20260620-BK05-F03

- BK/RF/RNF afetado: `BK-MF5-05` / `RNF05`
- Severidade: `P1`
- Estado anterior: `PARCIAL`
- Estado apos correcao: `CORRIGIDO`
- Tipo: validacao de datas
- Evidencia anterior: `validateIsoDate` usava apenas `Date.parse(value)`.
- Correcao aplicada: a validacao usa regex `YYYY-MM-DD`, `Date.UTC` e compara `toISOString().slice(0, 10)` com o valor original.
- Resultado: datas impossiveis como `2026-02-30` sao rejeitadas antes da submissao.

### MF5-AUD-20260620-BK05-F04

- BK/RF/RNF afetado: `BK-MF5-05` / `RNF05`
- Severidade: `P1`
- Estado anterior: `PARCIAL`
- Estado apos correcao: `CORRIGIDO`
- Tipo: mapeamento de campos / dominio IVA
- Evidencia anterior: qualquer campo contendo `vatrate` era validado como percentagem `0..100`.
- Correcao aplicada: o guia distingue `vatRateId`, `vatRateBps` e `vatRatePercent`, com validadores separados.
- Resultado: identificadores de taxa deixam de ser confundidos com percentagens e `vatRateBps=2300` passa a ser contrato valido.

### MF5-AUD-20260620-BK05-F05

- BK/RF/RNF afetado: `BK-MF5-05` / `RNF05`
- Severidade: `P2`
- Estado anterior: `PARCIAL`
- Estado apos correcao: `CORRIGIDO`
- Tipo: validacao automatizada / evidence
- Evidencia anterior: o guia mencionava smoke MF5, mas nao criava comando proprio.
- Correcao aplicada: o guia cria `real_dev/web/scripts/check-mf5-form-validation.mjs` e adiciona `"test:mf5:forms": "node scripts/check-mf5-form-validation.mjs"`.
- Resultado: `RNF05` fica com comando de evidence claro.

### MF5-AUD-20260620-BK05-F06

- BK/RF/RNF afetado: coerencia `BK-MF5-01..BK-MF5-05`
- Severidade: `P3`
- Estado anterior: `BLOQUEADO_POR_SCOPE`
- Estado apos correcao: `BLOQUEADO_POR_SCOPE`
- Tipo: guia prescritivo vs implementacao real
- Evidencia objetiva: `real_dev/web` ainda nao contem os artefactos prescritivos da MF5 no checkout atual.
- Correcao aplicada: nenhuma, por scope. A prompt permite corrigir guias/documentos, nao implementar `real_dev`.
- Resultado: o guia fica pronto para implementacao futura, mas a execucao real do codigo continua por fazer noutro modo.

## Decisoes tecnicas e de dominio confirmadas

- `CANONICO`: `RNF05` exige que formularios validem erros antes de submissao, incluindo NIF, IBAN, datas, IVA e contas SNC.
- `CANONICO`: `BK-MF5-05` pertence a `MF5`, tem prioridade `P0`, owner `Oleksii`, apoio `Pedro`, sprint `S09-S10`, esforco `M`, `core_or_reforco=Reforco`, requisito `RNF05` e `proximo_bk=BK-MF5-06`.
- `CANONICO`: `BACKLOG-MVP.md` exige para `P0` pelo menos 8 passos e 3 cenarios negativos.
- `CANONICO`: validacao frontend nao substitui validacao backend, contexto multiempresa, permissoes, ownership, periodos fiscais ou auditoria.
- `DERIVADO`: como `RNF05` e transversal de UX, a solucao pode viver em `real_dev/web` sem criar endpoints, modelos Prisma ou services backend novos.
- `DERIVADO`: `BK-MF5-05` deve consumir `useActionFeedback` dos BKs MF5 anteriores com tipos coerentes.
- `DERIVADO`: validadores frontend devem ser por contrato explicito de campo, nao por substring generica.

## Mapa de integracao da MF

| Item | Resultado |
| --- | --- |
| Ficheiros criados nesta execucao | Nenhum ficheiro de implementacao; apenas relatorio documental novo/atualizado |
| Ficheiros editados nesta execucao | `docs/planificacao/guias-bk/MF5/BK-MF5-05-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-iva-contas-snc.md`; `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF5.md` |
| BKs editados nesta execucao | `BK-MF5-05` |
| Ficheiros previstos pelo BK alvo | `real_dev/web/src/lib/mf5FormValidators.ts`, `real_dev/web/src/App.tsx`, paginas MF1-MF4, smoke MF5 e `package.json` |
| Endpoints criados | Nenhum |
| DTOs/validators backend criados | Nenhum |
| Schemas/modelos criados | Nenhum |
| Services criados | Nenhum |
| Providers de IA criados ou usados | Nenhum |
| Regras de seguranca/autorizacao | Backend continua fonte de autenticacao, autorizacao, empresa ativa, ownership, validacao final e auditoria |
| Testes/checks previstos pelo BK | `typecheck`, `test:mf5:forms` e cenarios manuais positivos/negativos |
| BKs seguintes dependentes | `BK-MF5-06`, por mensagens de erro claras; `BK-MF5-07`, por evitar validacoes locais caras ou falsas |

## Coerencia MF anterior -> MF alvo -> MF seguinte

- `MF4 -> MF5`: coerente ao nivel funcional. `MF4` entrega IA, auditoria, lembretes, tarefas e logs; `MF5` melhora experiencia e validacao de interface sem alterar contratos contabilisticos.
- `BK-MF5-04 -> BK-MF5-05`: coerente apos correcao. O guia consome feedback imediato e mensagens acessiveis sem redefinir o BK anterior.
- `BK-MF5-05 -> BK-MF5-06`: coerente apos correcao. O guia centraliza `formatMf5FormErrors`, que pode ser refinado no BK seguinte.
- `MF5 -> MF6`: coerente no plano documental. A validacao local fica barata e explicita, sem invadir performance/seguranca de MF6.

## Validacao executada

| Comando/check | Resultado |
| --- | --- |
| Leitura estrutural Node do BK alvo | `OK`; `steps=8`, `negatives=8`, `codeBlocks=9`, `hasStrictDate=true`, `hasActionError=true`, `hasVatBps=true`, `hasKnownId=true`, `hasSmoke=true` |
| Pesquisa de termos internos e riscos em `docs/planificacao/guias-bk/MF5/*.md` | `OK`; sem matches para os padroes proibidos da prompt |
| `git diff --check` | `OK`; sem erros |
| Pesquisa de whitespace final no BK alvo e relatorio | `OK`; sem trailing whitespace |
| `bash scripts/validate-planificacao.sh` | `OK` tecnico; `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `overall_pass=true`; `advisory_pass=false` por `outdated_docs` e checks legados de `guides_quality` ainda alinhados com o modelo antigo |
| Advisory residual do BK alvo no validador antigo | Restam apenas `missing_pedagogic_or_operational_blocks` e `missing_or_placeholder_snippet`; nao foram forçados porque a prompt ativa exige a estrutura nova `#### Objetivo` ate `#### Changelog` |

## Bloqueios e TODOs restantes

- `TODO (BLOCKER)`: nenhum no guia BK alvo.
- `BLOQUEADO_POR_SCOPE`: implementar os artefactos em `real_dev` fica fora desta execucao e deve ser tratado num modo de implementacao.
- `TODO (VALIDATOR)`: alinhar `docs/planificacao/scripts/auditar_planificacao.py`, `docs/planificacao/guias-bk/README.md` e `_TEMPLATE-BK.md` com a estrutura nova para remover advisories legados.

## Resumo final para entrega

- `BK-MF5-05`: `OK` apos correcao documental.
- Findings `F01` a `F05`: corrigidos.
- Finding `F06`: mantido como `BLOQUEADO_POR_SCOPE`.
- Commits: nao executados.
- Implementacao real: nao editada.
