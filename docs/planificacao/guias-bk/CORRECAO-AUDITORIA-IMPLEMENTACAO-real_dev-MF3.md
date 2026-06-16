# Correcao de auditoria de implementacao real_dev - MF3

Data: 2026-06-15

Modo: `corrigir_auditoria`

Relatorio de origem: `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md`

Resultado final: `PASS_COM_RISCOS`

## Ambito

Execucao em ambito estrito para `MF3`, com `FINDING_IDS=[]`, `FIX_SEVERITIES=P0,P1,P2,P3` e `INCLUIR_P3=sim`.

Findings tratados:

- `P2-MF3-STATEMENT-INTEGRITY`
- `P2-MF3-PERSISTENCE-NOT-RUN`
- `P3-MF3-DATE-RANGE-OFF-BY-ONE`

BKs abrangidos: `BK-MF3-01` a `BK-MF3-08`.

## Resultado por finding

### P0

Sem findings P0 no relatorio de origem.

### P1

Sem findings P1 no relatorio de origem.

### P2

#### P2-MF3-STATEMENT-INTEGRITY

Estado final: `JA_CORRIGIDO`

Confirmacao:

- O schema atual ja contem estados de importacao/sugestao e unicidade de linhas de extrato.
- O service de importacao de extratos ja deduplica linhas e marca importacoes parciais.
- `npm --prefix real_dev/api run test:unit` passou com 50/50 testes.
- `npm --prefix real_dev/api run test:contracts` passou com 23/23 testes.

Nao foram feitas alteracoes adicionais para este finding nesta execucao.

#### P2-MF3-PERSISTENCE-NOT-RUN

Estado final: `BLOQUEADO`

Confirmacao:

- `npm --prefix real_dev/api run test:integration` continua a falhar sem `TEST_DATABASE_URL`.
- A falha e explicita e intencional: as suites MF2/MF3 exigem uma base PostgreSQL efemera cujo nome contenha `test`, `audit` ou `ci`.
- `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` passou com 2 testes skipped explicitos.

Motivo do bloqueio: este ambiente nao tem `TEST_DATABASE_URL` configurado. A causa raiz nao e corrigivel apenas por codigo sem disponibilizar uma base PostgreSQL de teste segura.

### P3

#### P3-MF3-DATE-RANGE-OFF-BY-ONE

Estado final: `CORRIGIDO`

BK/RF/RNF: `BK-MF3-01` e `BK-MF3-04`.

Causa raiz:

- `real_dev/api/src/modules/tax/vatMapFilters.js` calculava a diferenca de datas sem contar o dia inicial.
- `real_dev/api/src/modules/treasury/cashflowForecastFilters.js` aplicava o mesmo padrao ao limite de 180 dias.

Alteracoes:

- O mapa de IVA passou a validar o limite de 366 dias com contagem inclusiva.
- A previsao de tesouraria passou a validar o limite de 180 dias com contagem inclusiva.
- Foram adicionados testes unitarios de fronteira:
  - IVA aceita `2026-01-01` a `2027-01-01` e rejeita `2026-01-01` a `2027-01-02`.
  - Forecast aceita `2026-01-01` a `2026-06-29` e rejeita `2026-01-01` a `2026-06-30`.

## Estado por BK

| BK | Estado | Observacao |
| --- | --- | --- |
| `BK-MF3-01` | `OK` | Limite inclusivo do mapa de IVA corrigido e testado. |
| `BK-MF3-02` | `OK` | Sem alteracoes nesta execucao; validacao persistida real continua dependente de DB de teste. |
| `BK-MF3-03` | `OK` | Integridade de extratos ja estava corrigida; integracao real bloqueada por ambiente. |
| `BK-MF3-04` | `OK` | Limite inclusivo do forecast corrigido e testado. |
| `BK-MF3-05` | `OK` | Sem alteracoes nesta execucao; unit/contracts continuam verdes. |
| `BK-MF3-06` | `OK` | Sem alteracoes nesta execucao; unit/contracts continuam verdes. |
| `BK-MF3-07` | `OK` | Sem alteracoes nesta execucao; frontend smoke/build continuam verdes. |
| `BK-MF3-08` | `OK` | Sem alteracoes nesta execucao; frontend smoke/build continuam verdes. |

## Rastreabilidade BK -> RF/RNF -> ficheiros -> testes

| BK | Ficheiros alterados/auditados | Testes/validacoes |
| --- | --- | --- |
| `BK-MF3-01` | `real_dev/api/src/modules/tax/vatMapFilters.js`, `real_dev/api/tests/unit/mf3-services.test.js` | `test:unit`, validacao direta com `node --input-type=module -e ...` |
| `BK-MF3-04` | `real_dev/api/src/modules/treasury/cashflowForecastFilters.js`, `real_dev/api/tests/unit/mf3-services.test.js` | `test:unit`, validacao direta com `node --input-type=module -e ...` |
| `BK-MF3-03` | `schema.prisma`, migrations, `statementImportService.js`, `mf3-contracts.test.js` auditados pelo relatorio de origem | `test:unit`, `test:contracts`; integracao real bloqueada por falta de `TEST_DATABASE_URL` |
| `BK-MF3-02`, `BK-MF3-05`, `BK-MF3-06`, `BK-MF3-07`, `BK-MF3-08` | Sem alteracoes diretas nesta execucao | Cobertura transversal por unit/contracts/frontend build; integracao real bloqueada por ambiente |

## Mapa de integracao da MF

Contratos consumidos:

- MF0: sessao por cookie HttpOnly, `requireAuth`, contexto multiempresa, roles/permissoes, clientes, fornecedores, artigos, perfil fiscal e plano SNC.
- MF1: documentos de venda/compra, recebimentos, pagamentos, `JournalEntry`, `JournalEntryLine` e `AuditLog`.
- MF2: saldos/movimentos de stock e reporting contabilistico interno.

Contratos entregues:

- Runs fiscais, tesouraria, importacoes, SAF-T MVP, relatorios operacionais, KPIs executivos, fontes explicaveis e sugestoes de reconciliacao sem acao automatica.

## Coerencia entre MFs

- `MF2 -> MF3`: coerente com riscos. As validacoes executadas nao indicam regressao em contratos MF2 consumidos pela MF3; a persistencia real continua bloqueada sem `TEST_DATABASE_URL`.
- `MF3 -> MF4`: coerente com riscos. Os contratos de relatorios, forecast e KPIs continuam disponiveis; a correcao de datas nao altera endpoints nem payloads.
- Regressao: nenhuma confirmada nesta execucao.
- Drift: `P3-MF3-DATE-RANGE-OFF-BY-ONE` corrigido.
- Incompatibilidade entre MFs: nenhuma confirmada.

## Ficheiros alterados

- `real_dev/api/src/modules/tax/vatMapFilters.js`
- `real_dev/api/src/modules/treasury/cashflowForecastFilters.js`
- `real_dev/api/tests/unit/mf3-services.test.js`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF3.md`

Nota Git: `real_dev/` esta ignorado por `.gitignore` no repositorio principal, pelo que as alteracoes de implementacao nao aparecem em `git status` do root. O relatorio de correcao aparece como ficheiro nao versionado, tal como ja acontecia antes desta execucao.

## Validacoes executadas

| Comando | Resultado |
| --- | --- |
| `npm --prefix real_dev/api run test:unit` | PASS, 50/50 |
| `npm --prefix real_dev/api run syntax:check` | PASS |
| `DATABASE_URL=postgresql://opsa:opsa@localhost:5432/opsa_audit npm --prefix real_dev/api run prisma:validate` | PASS |
| `npm --prefix real_dev/api run test:contracts` | PASS, 23/23 |
| `node --input-type=module -e ...` com fronteiras inclusivas IVA/forecast | PASS |
| `npm --prefix real_dev/api run test:integration` | FAIL controlado: falta `TEST_DATABASE_URL` |
| `OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:integration` | PASS com 2 skipped explicitos |
| `npm --prefix real_dev/web run test:mf3` | PASS |
| `npm --prefix real_dev/web run typecheck` | PASS |
| `npm --prefix real_dev/web run build` | PASS |
| `git diff --check` | PASS no diff versionado disponivel no root |

## Validacoes nao executadas

- Integracao persistida real MF2/MF3 contra PostgreSQL: nao executada porque `TEST_DATABASE_URL` nao esta definido.
- Smoke manual em browser: nao executado; a alteracao foi backend/API e a cobertura frontend ficou em smoke estatico, typecheck e build.

## Alteracoes fora de `IMPLEMENTATION_ROOT`

Houve uma alteracao fora de `real_dev`: este relatorio de correcao, exigido por `OUTPUT_MODE=relatorio_e_resumo`.

Nao foram alterados RF/RNF, matriz, backlog, guias BK canonicos, `apps/`, `legacy/` ou `mockup/`.

## Blockers e TODOs

- `BLOQUEADO`: `P2-MF3-PERSISTENCE-NOT-RUN` ate existir `TEST_DATABASE_URL` apontado para PostgreSQL efemero seguro.
- TODO operacional: correr `npm --prefix real_dev/api run test:integration` com `TEST_DATABASE_URL` configurado.

## Proxima acao recomendada

Configurar uma base PostgreSQL efemera segura para `TEST_DATABASE_URL` e reexecutar `npm --prefix real_dev/api run test:integration` para fechar o ultimo risco de persistencia real MF2/MF3.
