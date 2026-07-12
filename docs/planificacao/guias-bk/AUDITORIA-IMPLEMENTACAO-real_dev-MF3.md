> [!WARNING]
> `SNAPSHOT_HISTORICO_SUPERSEDED` — estado `SUPERSEDED` em 2026-07-10.
>
> Este relatório preserva um snapshot histórico e não representa o estado corrente.
> Fonte atual: [relatório canónico](../auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md).
> Não reutilizar contagens, comandos, paths ou decisões deste corpo como evidence atual.

# AUDITORIA-IMPLEMENTACAO-real_dev-MF3

## Resultado geral

- Projeto: OPSA
- Modo executado: `auditar_implementacao`
- MF alvo: `MF3`
- BKs abrangidos: `BK-MF3-01` a `BK-MF3-08`
- Implementation root auditado: `real_dev`
- Pastas auditadas: `real_dev/api` e `real_dev/web`
- Pastas ignoradas como destino: `apps/` e `mockup/`
- Resultado: `PASS_COM_RISCOS`
- Data: `2026-06-15`
- Nota desta execução: auditoria confirmada contra documentação, código real e validações locais; não foram alterados ficheiros de implementação.

A implementação real da MF3 existe em `real_dev/api` e `real_dev/web` e cobre os oito BKs alvo com schema Prisma, migrations, services, routers protegidos, permissões backend, páginas React, cliente API, testes unitários, testes contratuais e smoke estático frontend.

Não foram encontrados findings P0/P1. A integridade de extratos e o limite inclusivo de datas, ambos registados em relatórios anteriores, estão corrigidos no código atual. Mantém-se apenas um risco P2 ativo: a integração persistida real contra PostgreSQL não pôde ser validada porque `TEST_DATABASE_URL` não está definido neste ambiente.

## Escopo auditado

| Área | Evidência |
| --- | --- |
| Backend/API | `real_dev/api/src/server.js`, módulos `tax`, `treasury`, `imports`, `compliance`, `reports` |
| Prisma | `real_dev/api/prisma/schema.prisma`, migrations `20260615120000_mf3_schema` e `20260615130000_mf3_statement_integrity` |
| Frontend | `real_dev/web/src/lib/apiClient.ts`, `real_dev/web/src/pages/mf3Pages.tsx`, `real_dev/web/src/App.tsx` |
| Testes | `real_dev/api/tests/unit/mf3-services.test.js`, `real_dev/api/tests/contracts/mf3-contracts.test.js`, `real_dev/api/tests/integration/mf3-persistence.test.js`, `real_dev/web/scripts/check-mf3-pages.mjs` |
| Documentos | RF/RNF, matriz, backlog, contrato de campos, MF views, guias MF3, guias MF2/MF4 relevantes, relatórios de hidratação/implementação/correção MF3 |

## Estado por BK

| BK | RF/RNF | Estado | Observação |
| --- | --- | --- | --- |
| `BK-MF3-01` | `RF31` | `OK` | Mapa de IVA implementado sobre lançamentos contabilísticos, com limite inclusivo de 366 dias e guards de role/permissão. |
| `BK-MF3-02` | `RF32`, `RNF05` | `OK` | Contas banco/caixa, validação IBAN, snapshot inicial, auditoria e contexto multiempresa confirmados. |
| `BK-MF3-03` | `RF33`, `RNF10` | `OK` | Importa extratos, deduplica linhas, persiste estados `IMPORTED`/`PARTIAL` e sugestões `SUGGESTED`, sem confirmação automática. |
| `BK-MF3-04` | `RF34` | `OK` | Forecast implementado com fontes, limite inclusivo de 180 dias e sem escrita operacional. |
| `BK-MF3-05` | `RF35`, `RNF23` | `OK` | Importações CSV de dados mestre e extratos persistem runs e erros por linha; Excel nativo continua fora do contrato técnico atual. |
| `BK-MF3-06` | `RF36`, `RNF24` | `OK` | SAF-T MVP gera XML rastreável, bloqueia perfil fiscal incompleto e não promete certificação legal completa. |
| `BK-MF3-07` | `RF37` | `OK` | Relatórios operacionais usam dados reais, fontes e `companyId` backend. |
| `BK-MF3-08` | `RF38`, `RNF31` | `OK` | KPIs executivos calculam receita, custos, EBITDA MVP, PMR/PMP e fontes para MF4/MF8. |

## Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Ficheiros auditados | Testes/validações |
| --- | --- | --- |
| `BK-MF3-01` | `tax/vatMapFilters.js`, `tax/vatMapService.js`, `tax/vatMapRoutes.js`, `schema.prisma`, `mf3Pages.tsx` | `mf3-services.test.js`, `mf3-contracts.test.js`, `test:mf3`, validação direta do limite de datas |
| `BK-MF3-02` | `treasury/bankAccountValidators.js`, `treasury/bankAccountService.js`, `treasury/bankAccountRoutes.js`, `schema.prisma` | `mf3-services.test.js`, `mf3-contracts.test.js`, `mf3-persistence.test.js` existente; execução persistida real pendente de DB |
| `BK-MF3-03` | `treasury/statementImportValidators.js`, `treasury/statementImportService.js`, `treasury/statementRoutes.js`, `schema.prisma`, migration de integridade | Unit, contract e suite de integração MF3 criada; execução persistida real pendente |
| `BK-MF3-04` | `treasury/cashflowForecastFilters.js`, `treasury/cashflowForecastService.js`, `treasury/cashflowForecastRoutes.js` | `mf3-services.test.js`, `test:mf3`, validação direta do limite de datas |
| `BK-MF3-05` | `imports/businessImportValidators.js`, `imports/businessImportService.js`, `imports/businessImportRoutes.js` | `mf3-services.test.js`, `test:mf3`, integração MF3 pendente |
| `BK-MF3-06` | `compliance/saftValidators.js`, `compliance/saftService.js`, `compliance/saftRoutes.js` | `mf3-contracts.test.js`, `test:mf3`, integração MF3 pendente |
| `BK-MF3-07` | `reports/operationalReportFilters.js`, `reports/operationalReportService.js`, `reports/operationalReportRoutes.js` | `mf3-services.test.js`, `test:mf3`, integração MF3 pendente |
| `BK-MF3-08` | `reports/executiveKpiFilters.js`, `reports/executiveKpiService.js`, `reports/executiveKpiRoutes.js` | `mf3-services.test.js`, `test:mf3`, integração MF3 pendente |

## Mapa de integração da MF

- Contratos consumidos de MF0: sessão por cookie HttpOnly, `requireAuth`, contexto multiempresa, roles/permissões, clientes, fornecedores, artigos, perfil fiscal e plano SNC.
- Contratos consumidos de MF1: `VatRate`, documentos de venda/compra, recebimentos, pagamentos, `JournalEntry`, `JournalEntryLine` e `AuditLog`.
- Contratos consumidos de MF2: `StockBalance`, `StockMovement`, reporting contabilístico interno e saldos de inventário.
- Contratos entregues por MF3: runs fiscais, tesouraria, importações, SAF-T MVP, relatórios operacionais, KPIs executivos, fontes explicáveis e sugestões de reconciliação sem ação automática.
- Endpoints MF3 confirmados: `/api/tax/vat-maps`, `/api/treasury/accounts`, `/api/treasury/statements/import`, `/api/treasury/forecast`, `/api/imports/business-data`, `/api/compliance/saft`, `/api/reports/operational`, `/api/reports/executive-kpis`.
- Segurança: todos os endpoints MF3 auditados usam `requireAuth`, `requireCompanyContext`, permissões e roles no backend. O frontend usa `apiClient` com `credentials: "include"` e não envia `companyId` para decidir ownership.

## Coerência entre MFs

- `MF2 -> MF3`: coerente com riscos. A MF3 reutiliza lançamentos, vendas, compras, recebimentos, pagamentos, saldos de stock, permissões e contexto multiempresa. A cadeia persistida completa ficou pendente por falta de `TEST_DATABASE_URL`.
- `MF3 -> MF4`: coerente com riscos. `BK-MF4-01` e `BK-MF4-03` podem consumir relatórios operacionais; `BK-MF4-04` pode consumir forecast; `BK-MF4-10` pode aprofundar logs de importações/SAF-T/reconciliação.
- Regressões P0/P1: nenhuma encontrada.
- Incompatibilidades entre MFs: nenhuma bloqueante encontrada.

## Findings

### P0

Sem findings P0.

### P1

Sem findings P1.

### P2

#### P2-MF3-PERSISTENCE-NOT-RUN

- Estado atual: `AUDITADO_COM_FINDINGS`
- BK/RF/RNF: todos os BKs MF3; especialmente `RF31` a `RF38`.
- Evidência objetiva: `real_dev/api/tests/integration/mf3-persistence.test.js` exige `TEST_DATABASE_URL`; `npm --prefix real_dev/api run test:integration` falhou porque `TEST_DATABASE_URL` não está definida.
- Expected: integração persistida MF3 executada contra PostgreSQL efémero seguro, com migrations e constraints reais.
- Observed: a suite existe e está desenhada para falhar sem DB real; nesta máquina só foi possível executar com `OPSA_SKIP_PERSISTENCE_TESTS=true`, resultando em 2 testes skipped.
- Impacto: unit/contract/schema/build dão boa confiança, mas a auditoria não confirma aplicação real das migrations, FKs, constraints e transações MF3 em PostgreSQL.
- Correção recomendada: definir `TEST_DATABASE_URL` para base efémera cujo nome contenha `test`, `audit` ou `ci` e correr `npm --prefix real_dev/api run test:integration`.

#### P2-MF3-STATEMENT-INTEGRITY

- Estado atual: `JA_CORRIGIDO`
- BK/RF/RNF: `BK-MF3-03`, `RF33`, relacionado com `RNF10`.
- Evidência no schema: `real_dev/api/prisma/schema.prisma:877` a `real_dev/api/prisma/schema.prisma:934` incluem `BankStatementImport.status`, `BankReconciliationSuggestion.status` e `@@unique([companyId, importId, entryDate, amountCents, description])`.
- Evidência no service: `real_dev/api/src/modules/treasury/statementImportService.js:43` a `real_dev/api/src/modules/treasury/statementImportService.js:62` deduplicam linhas; `statementImportService.js:127` a `statementImportService.js:139` persistem estado `PARTIAL`/`IMPORTED`; `statementImportService.js:162` a `statementImportService.js:168` persistem sugestões com `status: "SUGGESTED"`.
- Evidência em testes: `npm --prefix real_dev/api run test:unit` passou 50/50 e cobre deduplicação/sugestão; `npm --prefix real_dev/api run test:contracts` passou 23/23 e cobre migration de estados/unicidade.
- Impacto residual: sem P2 funcional confirmado neste ponto; validação persistida real ainda depende do finding anterior.

### P3

#### P3-MF3-DATE-RANGE-OFF-BY-ONE

- Estado atual: `JA_CORRIGIDO`
- BK/RF/RNF: `BK-MF3-01` e `BK-MF3-04`.
- Evidência no código atual: `real_dev/api/src/modules/tax/vatMapFilters.js:31` a `real_dev/api/src/modules/tax/vatMapFilters.js:32` usam cálculo inclusivo com `+ 1`; `real_dev/api/src/modules/tax/vatMapFilters.js:54` bloqueia mais de 366 dias.
- Evidência no forecast: `real_dev/api/src/modules/treasury/cashflowForecastFilters.js:16` a `real_dev/api/src/modules/treasury/cashflowForecastFilters.js:17` usam cálculo inclusivo com `+ 1`; `cashflowForecastFilters.js:44` bloqueia mais de 180 dias.
- Evidência em testes: `npm --prefix real_dev/api run test:unit` passou casos de fronteira `2026-01-01` a `2027-01-01` e rejeição de `2027-01-02`; forecast aceita `2026-06-29` e rejeita `2026-06-30`.
- Verificação direta executada: `node --input-type=module -e ...` devolveu `vat-ok`, `forecast-ok`, `vat-too-long`, `forecast-too-long`.
- Impacto residual: nenhum finding P3 ativo nesta reauditoria.

## Pesquisa estática obrigatória

- Padrões de segredos/storage/eval/raw/destrutivos/drift: sem ocorrências críticas em MF3. As ocorrências encontradas ficam em comentários/testes/adapters MF0 ou storage interno e não indicam segredo exposto.
- Termos de drift de domínio proibidos: sem ocorrências em `real_dev/api` e `real_dev/web`.
- `companyId`: em MF3 é resolvido no backend por `req.companyId`/contexto de empresa; o frontend MF3 não envia `companyId`.
- `localStorage`/`sessionStorage`: sem uso para sessão/token/role nos ficheiros auditados.
- `dangerouslySetInnerHTML`, `eval`, `new Function`: sem ocorrências.

## Validações executadas

| Comando | Resultado |
| --- | --- |
| `git status --short` | Worktree já tinha relatórios MF3 não versionados antes desta auditoria. |
| `npm --prefix real_dev/api run syntax:check` | PASS |
| `DATABASE_URL=<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate` | PASS |
| `npm --prefix real_dev/api run test:unit` | PASS, 50/50 |
| `npm --prefix real_dev/api run test:contracts` | PASS, 23/23 |
| `npm --prefix real_dev/web run test:mf3` | PASS |
| `npm --prefix real_dev/web run typecheck` | PASS |
| `npm --prefix real_dev/web run build` | PASS |
| `npm --prefix real_dev/api run test:integration` | FAIL controlado: falta `TEST_DATABASE_URL`; MF2 e MF3 falham explicitamente |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | PASS com 2 testes skipped explícitos |
| `git diff --check` | PASS |
| Pesquisa estática de riscos com `rg` | Sem risco crítico MF3 |
| Pesquisa de drift de domínio com `rg` | Sem ocorrências |
| Validação direta de fronteira de datas com `node --input-type=module -e ...` | PASS |

## Validações não executadas

- Integração persistida real MF3/MF2 contra PostgreSQL: não executada porque `TEST_DATABASE_URL` não está definido.
- Smoke manual em browser: não executado; cobertura desta auditoria ficou em `test:mf3`, `typecheck` e `build`.

## Ficheiros alterados

- Atualizado: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md`

Não foram alterados ficheiros de implementação em `real_dev`, RF/RNF, matriz, backlog, guias BK canónicos, `apps/` ou `mockup/`.

## Blockers e TODOs

- `TODO (BLOCKER)`: nenhum P0/P1 encontrado.
- Bloqueio de validação: falta configurar `TEST_DATABASE_URL` para integração persistida real.
- TODO técnico ativo: executar a suite persistida real e reauditar `P2-MF3-PERSISTENCE-NOT-RUN`.

## Próxima ação recomendada

1. Executar `npm --prefix real_dev/api run test:integration` com `TEST_DATABASE_URL` apontado para PostgreSQL efémero seguro.
2. Se passar, reclassificar `P2-MF3-PERSISTENCE-NOT-RUN` como `JA_CORRIGIDO`/`FECHADO`.
