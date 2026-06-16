# AUDITORIA-HIDRATACAO-MF3

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF3`
- `macro`: `MF3`
- `modo`: `hidratar_corrigir`
- `data`: `2026-06-15`
- `scope`: `docs/planificacao/guias-bk/MF3/*.md`
- `bk_analisados`: `8`
- `bk_editados_nesta_execucao`: `8`
- `implementation_root`: `real_dev`
- `output_mode`: `relatorio_e_resumo`

## Fontes consultadas

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
- todos os BKs da `MF3`
- BKs anteriores `MF0`, `MF1` e `MF2`, com foco nos contratos consumidos pela MF3
- BKs posteriores vizinhos e dependentes diretos: `BK-MF4-01`, `BK-MF4-03`, `BK-MF4-04`, `BK-MF4-10`, `BK-MF6-03`, `BK-MF7-06`, `BK-MF7-07` e `BK-MF8-04`
- relatórios existentes de auditoria/hidratação/implementação MF3
- implementação real em `real_dev/api`, `real_dev/web` e `real_dev/api/prisma/schema.prisma`

## Resultado executivo

Esta execução auditou e corrigiu os oito guias da `MF3` em modo `hidratar_corrigir`.

Antes da correção, os guias já tinham boa densidade pedagógica, oito passos por BK, JSDoc, validações e cenários negativos. O problema transversal confirmado era documental/técnico: os caminhos dos ficheiros e blocos de código ainda apontavam para `apps/api` e `apps/web`, enquanto a prompt ativa desta execução define `real_dev/api` e `real_dev/web` como raiz de implementação real a usar para a MF3.

Foram corrigidos os caminhos técnicos dos oito BKs, atualizados os `last_updated` para `2026-06-15` e acrescentado changelog em cada guia. Não foram alterados RF/RNF, owners, prioridades, dependências canónicas, endpoints, roles, regras de domínio ou escopo funcional.

## Contagem antes/depois

| Momento | OK | PARCIAL | CRITICO | Observação |
| --- | ---: | ---: | ---: | --- |
| Antes desta execução | 0 | 8 | 0 | Guias pedagogicamente fortes, mas com drift transversal de `IMPLEMENTATION_ROOT`: caminhos `apps/*` em vez de `real_dev/*`. |
| Depois desta execução | 8 | 0 | 0 | Caminhos alinhados com `real_dev`; estrutura, contratos e handoff preservados. |

## Classificação por BK

| BK | Estado final | Correção aplicada | Prioridade |
| --- | --- | --- | --- |
| `BK-MF3-01` | `OK` | Caminhos de backend/frontend/schema alterados para `real_dev/*`; changelog e `last_updated` atualizados. | P0 |
| `BK-MF3-02` | `OK` | Caminhos de tesouraria e frontend alterados para `real_dev/*`; changelog e `last_updated` atualizados. | P0 |
| `BK-MF3-03` | `OK` | Caminhos de importação de extratos alterados para `real_dev/*`; changelog e `last_updated` atualizados. | P0 |
| `BK-MF3-04` | `OK` | Caminhos de previsão de tesouraria alterados para `real_dev/*`; changelog e `last_updated` atualizados. | P1 |
| `BK-MF3-05` | `OK` | Caminhos de importações operacionais alterados para `real_dev/*`; changelog e `last_updated` atualizados. | P1 |
| `BK-MF3-06` | `OK` | Caminhos de compliance/SAF-T alterados para `real_dev/*`; changelog e `last_updated` atualizados. | P0 |
| `BK-MF3-07` | `OK` | Caminhos de relatórios operacionais alterados para `real_dev/*`; changelog e `last_updated` atualizados. | P0 |
| `BK-MF3-08` | `OK` | Caminhos de KPIs executivos alterados para `real_dev/*`; changelog e `last_updated` atualizados. | P1 |

## Findings

### P0

Sem findings P0.

### P1

Sem findings P1.

### P2

#### P2-MF3-DOC-PATH-ROOT

- Estado final: `CORRIGIDO`
- BK/RF/RNF afetado: `BK-MF3-01` a `BK-MF3-08`, `RF31` a `RF38`
- Evidência objetiva: os guias MF3 apontavam para `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma`, `apps/api/src/server.js` e `apps/web/src/App.tsx`.
- Expected: com `IMPLEMENTATION_ROOT=real_dev`, os guias devem apontar para `real_dev/api`, `real_dev/web`, `real_dev/api/prisma/schema.prisma`, `real_dev/api/src/server.js` e `real_dev/web/src/App.tsx`.
- Observed: os caminhos ainda usavam a raiz documental antiga `apps/*`.
- Impacto: um aluno podia criar ou editar ficheiros na raiz errada, desalinhando a MF3 da implementação real validada.
- Causa provável: os BKs foram hidratados antes de a prompt desta execução tornar `real_dev` a raiz ativa.
- Correção aplicada: substituição controlada de caminhos `apps/api` -> `real_dev/api` e `apps/web` -> `real_dev/web` nos oito BKs MF3, incluindo comentários iniciais dos blocos de código.
- Evidência de correção: `rg -n "apps/api|apps/web" docs/planificacao/guias-bk/MF3/*.md` devolveu exit code `1`, sem ocorrências.

#### P2-MF3-PERSISTENCE-NOT-RUN

- Estado final: `BLOQUEADO`
- BK/RF/RNF afetado: `BK-MF3-01` a `BK-MF3-08`, validação de implementação real
- Evidência objetiva: relatórios `AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md` e `CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md` registam que `npm --prefix real_dev/api run test:integration` requer `TEST_DATABASE_URL`.
- Expected: testes de integração persistida MF3 executados contra PostgreSQL efémero seguro.
- Observed: esta execução documental não recebeu `TEST_DATABASE_URL`; a prompt pediu validação documental final, não provisão de base de dados.
- Impacto: não bloqueia a hidratação dos guias, mas mantém risco operacional de validação persistida real.
- Correção recomendada: configurar `TEST_DATABASE_URL` com base cujo nome contenha `test`, `audit` ou `ci` e correr `npm --prefix real_dev/api run test:integration`.

### P3

#### P3-MF3-STATIC-FALSE-POSITIVES

- Estado final: `NAO_APLICAVEL`
- BK/RF/RNF afetado: `BK-MF3-01` a `BK-MF3-08`
- Evidência objetiva: a pesquisa estática obrigatória encontra ocorrências intencionais de `companyId`, `localStorage`, `tokens`, `placeholder`, `OCR` e conceitos semelhantes.
- Expected: ocorrências perigosas devem ser corrigidas; ocorrências didáticas, negativas ou scope-out devem ser justificadas.
- Observed: `companyId` aparece para explicar que vem da sessão/contexto backend; `localStorage` e `tokens` aparecem em frases que proíbem guardar tokens no frontend; `placeholder` aparece como atributo real de inputs/textarea; `OCR` aparece apenas como `Scope-out`.
- Impacto: sem risco técnico confirmado nos BKs, porque as ocorrências reforçam precisamente as regras de segurança/escopo.
- Correção recomendada: manter as ocorrências didáticas e interpretar a pesquisa com contexto.

## Decisões técnicas confirmadas

- A stack ativa desta execução é `real_dev/api` + `real_dev/web`.
- O backend real usa Node.js, Express, ES Modules, Prisma e módulos por domínio em `real_dev/api/src/modules`.
- O frontend real usa React, Vite e TypeScript/TSX em `real_dev/web/src`.
- `apiClient` continua a ser o cliente HTTP comum, com cookie HttpOnly enviado por `credentials: "include"`.
- `companyId` deve vir de `req.companyId` ou contexto autenticado no backend; nenhum BK deve pedir `companyId` ao frontend para decidir ownership.
- Roles e permissões ficam no backend via `requireAuth`, `requireCompanyContext` e `requireRole`.
- A implementação real MF3 já possui módulos em `real_dev/api/src/modules/tax`, `treasury`, `imports`, `compliance` e `reports`.
- Os endpoints MF3 são únicos e coerentes: `/api/tax/vat-maps`, `/api/treasury/accounts`, `/api/treasury/statements/import`, `/api/treasury/forecast`, `/api/imports/business-data`, `/api/compliance/saft`, `/api/reports/operational` e `/api/reports/executive-kpis`.

## Decisões de domínio confirmadas

- Mapas de IVA são leitura/cálculo interno e não submissão oficial.
- Contas bancárias e caixa pertencem à empresa ativa.
- Reconciliação bancária cria sugestões auditáveis; não confirma recebimentos ou pagamentos automaticamente.
- Previsão de tesouraria é analítica e não altera documentos.
- Importações gravam linhas válidas, rejeitam linhas inválidas e guardam erros por linha.
- SAF-T na MF3 é XML MVP rastreável; conformidade legal completa permanece limitada ao que estiver documentado e é aprofundável em MF7.
- Relatórios e KPIs expõem fontes para a MF4/IA explicável.
- IA futura recomenda e explica; não altera dados contabilísticos nem executa ações automaticamente.

## Decisões marcadas como DERIVADO

- Excel em `BK-MF3-05` é tratado como CSV exportado, porque leitura nativa `.xlsx` implicaria contrato técnico adicional.
- SAF-T em `BK-MF3-06` é MVP estruturado e rastreável, sem promessa de certificação legal completa.
- EBITDA, margem, PMR e PMP são indicadores operacionais MVP e não substituem demonstrações financeiras oficiais.
- Horizontes máximos de datas em mapa de IVA e forecast são limites técnicos de desempenho/legibilidade.

## Mapa de integração da MF

| BK | Ficheiros principais após correção | Exports/contratos entregues | Dependências consumidas | Endpoints | Segurança e auditoria | BKs seguintes |
| --- | --- | --- | --- | --- | --- | --- |
| `BK-MF3-01` | `real_dev/api/src/modules/tax/*`, `real_dev/web/src/lib/taxApi.ts`, página de mapa IVA | `VatMapRun`, `buildVatMap`, `buildVatMapRoutes`, `fetchVatMap` | `JournalEntry`, linhas de vendas/compras, `VatRate`, guards MF0 | `GET /api/tax/vat-maps` | `companyId`, `CONTABILISTA`, `AUDITOR`, execução guardada | SAF-T/reporting fiscal |
| `BK-MF3-02` | `real_dev/api/src/modules/treasury/bankAccount*`, `real_dev/web/src/lib/treasuryApi.ts` | `TreasuryAccount`, `TreasuryBalanceSnapshot`, contas por empresa | sessão, empresa ativa, moeda da empresa | `GET/POST /api/treasury/accounts` | validação IBAN, role backend, snapshot inicial | `BK-MF3-03`, `BK-MF3-04`, `BK-MF3-05` |
| `BK-MF3-03` | `real_dev/api/src/modules/treasury/statement*`, `real_dev/web/src/lib/statementApi.ts` | importações, linhas e sugestões de reconciliação | `TreasuryAccount`, `Receipt`, `Payment` | `POST /api/treasury/statements/import` | sugestões `SUGGESTED`, sem confirmação automática | `BK-MF3-04`, `BK-MF4-10`, `BK-MF6-03` |
| `BK-MF3-04` | `real_dev/api/src/modules/treasury/cashflowForecast*`, `real_dev/web/src/lib/forecastApi.ts` | `CashflowForecastRun`, forecast com fontes | saldos, vendas/compras em aberto, recebimentos/pagamentos | `GET /api/treasury/forecast` | role `GESTOR`, sem escrita operacional | `BK-MF4-04` |
| `BK-MF3-05` | `real_dev/api/src/modules/imports/businessImport*`, `real_dev/web/src/lib/importApi.ts` | `BusinessImportRun`, importação CSV com erros por linha | clientes, fornecedores, artigos, extratos | `POST /api/imports/business-data` | `ADMIN`/`CONTABILISTA`, validação por linha | `BK-MF3-06`, `BK-MF7-06` |
| `BK-MF3-06` | `real_dev/api/src/modules/compliance/saft*`, `real_dev/web/src/lib/complianceApi.ts` | `SaftExportRun`, XML SAF-T MVP | perfil fiscal, clientes, fornecedores, documentos, lançamentos | `GET /api/compliance/saft` | `CONTABILISTA`/`AUDITOR`, perfil fiscal obrigatório | `BK-MF3-07`, `BK-MF7-07` |
| `BK-MF3-07` | `real_dev/api/src/modules/reports/operationalReport*`, `real_dev/web/src/lib/reportApi.ts` | `OperationalReportRun`, fontes para IA | vendas, compras, stock | `GET /api/reports/operational` | `GESTOR`/`OPERACIONAL`, filtro multiempresa | `BK-MF3-08`, `BK-MF4-01`, `BK-MF4-03` |
| `BK-MF3-08` | `real_dev/api/src/modules/reports/executiveKpi*`, `real_dev/web/src/lib/kpiApi.ts` | `ExecutiveKpiRun`, KPIs com fontes | vendas, compras, recebimentos, pagamentos | `GET /api/reports/executive-kpis` | role `GESTOR`, PMR/PMP `null` sem dados | `BK-MF4-01`, `BK-MF8-04` |

## Coerência MF anterior -> MF alvo -> MF seguinte

- `MF2 -> MF3`: coerente. A MF3 consome `JournalEntry`, documentos, recebimentos, pagamentos, `StockBalance`, dados mestre e contexto multiempresa sem alterar contratos anteriores.
- `MF3`: coerente depois da correção de caminhos. Os oito BKs mantêm endpoints únicos, nomes de módulos consistentes, validators, services, routes, páginas e clientes API alinhados com a implementação real.
- `MF3 -> MF4`: coerente com risco residual baixo. MF4 pode consumir relatórios operacionais, forecast, KPIs e fontes explicáveis; dependências futuras que ainda não estejam canonizadas devem ser tratadas numa execução própria de sincronização documental.

## Drift documental encontrado

| Área | Estado | Ação |
| --- | --- | --- |
| `IMPLEMENTATION_ROOT` | Corrigido nos BKs MF3. | `apps/api` e `apps/web` substituídos por `real_dev/api` e `real_dev/web`. |
| `CONTRATO-STACK-IMPLEMENTACAO.md` | Mantém referência antiga a `apps/*` enquanto esta execução usa `real_dev/*`. | Registado como drift documental superior; não editado por `STRICT_SCOPE=true`. |
| Dependências futuras | Alguns BKs posteriores podem consumir artefactos MF3 sem dependência canonizada explícita. | Registar numa futura sincronização de matriz/backlog se a equipa quiser fechar esse detalhe. |
| Excel nativo e SAF-T completo | Fora do escopo documentado da MF3. | Mantido como fronteira honesta; não inventar regras ou bibliotecas. |

## Verificações executadas

- Pesquisa de caminhos antigos: `rg -n "apps/api|apps/web" docs/planificacao/guias-bk/MF3/*.md` sem ocorrências.
- Pesquisa estática obrigatória: exit code `0`; ocorrências de `companyId`, `localStorage`, `tokens`, `placeholder` e `OCR` avaliadas como explicativas, negativas, atributos UI legítimos ou scope-out, não como risco ativo.
- Estrutura dos BKs: os oito BKs mantêm `#### Tutorial técnico linear` com oito passos e pontos 1 a 7.
- `git diff --check`: exit code `0`, sem whitespace errors.
- `bash scripts/validate-planificacao.sh`: exit code `0`; `overall_pass=true`, `coverage_pass=true`, `consistency_pass=true`, `guides_pass=true`, `naming_pass=true`, `advisory_pass=false`.
- Notas do validador: os avisos advisory incluem documentos globais outdated e heurísticas de qualidade em guias de várias MFs, incluindo MF3; não bloquearam a validação global e não resultam da alteração de contratos RF/RNF, matriz ou backlog nesta execução.

## Bloqueios ou TODOs restantes

- `TODO (BLOCKER)` nos BKs MF3: nenhum encontrado.
- Bloqueio operacional fora da hidratação documental: falta `TEST_DATABASE_URL` para fechar integração persistida real MF2/MF3.
- Risco residual: o contrato de stack global ainda menciona `apps/*`; não foi alterado por scope estrito.

## Resumo final

- MF processada: `MF3`.
- Número de BKs analisados: `8`.
- Contagem OK/PARCIAL/CRITICO antes: `0/8/0`.
- Contagem OK/PARCIAL/CRITICO depois: `8/0/0`.
- BKs editados: `BK-MF3-01` a `BK-MF3-08`.
- Principais lacunas corrigidas: drift transversal de caminhos técnicos `apps/*` para `real_dev/*`.
- Decisões técnicas confirmadas: stack real `real_dev`, `apiClient`, cookies HttpOnly, roles backend, contexto multiempresa backend e endpoints MF3 únicos.
- Decisões de domínio confirmadas: IVA interno, tesouraria por empresa, reconciliação como sugestão, forecast analítico, importações auditáveis, SAF-T MVP, reporting/KPIs com fontes.
- Decisões marcadas como DERIVADO: Excel via CSV, SAF-T MVP, EBITDA/margem/PMR/PMP operacionais e horizontes de datas.
- Drift documental encontrado: contrato de stack global ainda menciona `apps/*`; dependências futuras potenciais a rever.
- Riscos restantes: integração persistida real sem `TEST_DATABASE_URL`.
- Coerência MF anterior -> MF alvo -> MF seguinte: preservada, com risco residual baixo.
- Verificações textuais executadas: pesquisa de caminhos antigos e pesquisa estática obrigatória.
- Resultado de `git diff --check`: `pass`.
- Resultado de `bash scripts/validate-planificacao.sh`: `overall_pass=true`; `advisory_pass=false` por avisos não bloqueantes já registados.
- Bloqueios ou TODOs restantes: nenhum nos BKs MF3; integração real bloqueada por ambiente.

## Changelog

- `2026-06-15`: execução em `hidratar_corrigir`; oito BKs MF3 editados para alinhar caminhos com `real_dev`, relatório reescrito com findings, mapa de integração e estado antes/depois.
