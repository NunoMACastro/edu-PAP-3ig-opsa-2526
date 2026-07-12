> [!WARNING]
> `SNAPSHOT_HISTORICO_SUPERSEDED` — estado `SUPERSEDED` em 2026-07-10.
>
> Este relatório preserva um snapshot histórico e não representa o estado corrente.
> Fonte atual: [relatório canónico](./CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md).
> Não reutilizar contagens, comandos, paths ou decisões deste corpo como evidence atual.

## Resultado Geral

- Projeto: OPSA
- Alvo auditado: MF2
- Implementacao auditada: `real_dev/` (`real_dev/api` e `real_dev/web`)
- Estado: FAIL
- Resumo: A MF2 tem implementação real de backend e frontend para os 8 BKs, os testes existentes passam e o schema Prisma é válido quando `DATABASE_URL` é fornecida. Porém, a macrofase não tem migration Prisma da MF2, logo uma base criada por migrations só chega à MF1 e não terá as tabelas usadas pelos endpoints MF2. Além disso, há divergências funcionais relevantes em contagens físicas, Balanço, exports/UI e evidence.
- Coerencia entre MFs: FALHA
- Pode avancar para a proxima macrofase?: Nao

## Escopo Auditado

- BKs alvo: `BK-MF2-01`, `BK-MF2-02`, `BK-MF2-03`, `BK-MF2-04`, `BK-MF2-05`, `BK-MF2-06`, `BK-MF2-07`, `BK-MF2-08`
- MFs implementadas consideradas: `MF0`, `MF1`, `MF2`
- Profundidade de coerencia: `vizinhas`
- Documentos consultados: `README.md`; `docs/RF.md`; `docs/RNF.md`; `docs/planificacao/README.md`; `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`; `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`; `docs/planificacao/backlogs/BACKLOG-MVP.md`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`; `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`; `docs/planificacao/backlogs/MF-VIEWS.md`; `docs/planificacao/sprints/PLANO-SPRINTS.md`; `docs/planificacao/guias-bk/README.md`; `docs/planificacao/guias-bk/MF2/*.md`; `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`; auditoria MF1 em `docs/planificacao/auditorias/AUDITORIA-IMPLEMENTACAO-MF1-2026-06-07.md`
- Pastas de codigo analisadas: `real_dev/api/src`, `real_dev/api/prisma`, `real_dev/api/tests`, `real_dev/web/src`
- Pastas ignoradas: `mockup/` por ser prototipo; `apps/` por pertencer ao trabalho dos alunos e ser apenas referência auxiliar; `node_modules/` e `dist/` por serem dependências/artefactos
- Worktree: limpa no preflight e após validações (`git status --short` sem output), branch `codex/MF2`
- Limitacoes da auditoria: não foi arrancada base de dados real nem servidor browser/E2E; os testes existentes usam sobretudo validators/montagem de routers, não fluxos persistidos completos; `prisma:validate` sem env falha por ausência de `DATABASE_URL`, mas passou com uma URL PostgreSQL fictícia para validação estática

## Validacao por BK

### BK-MF2-01

- Estado: OK
- Objetivo/scope: histórico e justificações para aprovações/reprovações de compras (`RF23`)
- Implementacao encontrada: `PurchaseApprovalHistory` no schema; `approve`, `reject` e `approval-history` em `real_dev/api/src/modules/purchase-approval/`; cliente frontend em `real_dev/web/src/lib/apiClient.ts`
- Cumpre: preserva `/approve` e `/post-state`, adiciona `/reject` e `/approval-history`, exige justificação na reprovação, regista histórico e `AuditLog`, aplica `companyId` por sessão
- Falhas: depende da migration MF2 inexistente
- Negativos/testes: teste unitário cobre justificação curta; falta HTTP negativo para compra de outra empresa e permissões específicas do histórico
- Evidencia: `real_dev/api/src/modules/purchase-approval/purchaseApprovalService.js:71`, `real_dev/api/src/modules/purchase-approval/purchaseApprovalRoutes.js:51`
- Riscos: sem migration, a tabela `PurchaseApprovalHistory` não existe em instalação por migrations
- Fora de scope detetado: não detetado
- Recomendacao: gerar migration MF2 e acrescentar testes HTTP do histórico

### BK-MF2-02

- Estado: PARCIAL
- Objetivo/scope: movimentos de stock, saldos por artigo/armazém, bloqueio de saldo negativo (`RF24`)
- Implementacao encontrada: `StockMovement`, `StockBalance`, validator, service transacional e rotas em `real_dev/api/src/modules/inventory/`; página `StockMovementsPage`
- Cumpre: tipos de movimento, validação de armazéns por empresa, transação, atualização de saldo, auditoria e bloqueio de saldo negativo
- Falhas: depende da migration MF2 inexistente; testes não exercitam persistência/transação real
- Negativos/testes: teste unitário cobre transferência para o mesmo armazém; faltam testes de saída acima do saldo, armazém de outra empresa e fluxo feliz persistido
- Evidencia: `real_dev/api/src/modules/inventory/stockMovementService.js:84`, `real_dev/api/src/modules/inventory/stockMovementRoutes.js:44`
- Riscos: sem teste persistido, problemas de Prisma/DB só aparecem em runtime
- Fora de scope detetado: não detetado
- Recomendacao: criar migration e testes de serviço/HTTP com Prisma testável

### BK-MF2-03

- Estado: PARCIAL
- Objetivo/scope: cálculo de custo FIFO no backend (`RF25`)
- Implementacao encontrada: `StockCostLayer`, `StockCostConsumption`, `fifoCostService`, preview em `/api/inventory/fifo-cost/preview`
- Cumpre: camadas FIFO, consumo por ordem de criação, preview sem escrita (`write: false`) e custo unitário obrigatório em entradas
- Falhas: depende da migration MF2 inexistente; não há teste automatizado para consumo FIFO multi-camada nem para preview sem escrita
- Negativos/testes: teste unitário cobre entrada sem custo; falta teste para camadas insuficientes e para consumo FIFO real
- Evidencia: `real_dev/api/src/modules/inventory/fifoCostService.js:14`, `real_dev/api/src/modules/inventory/fifoCostRoutes.js:34`
- Riscos: erro de custo pode passar sem cobertura
- Fora de scope detetado: não detetado
- Recomendacao: testar FIFO com duas camadas e saída parcial/total

### BK-MF2-04

- Estado: FALHA
- Objetivo/scope: contagem física em rascunho, linhas e publicação única com ajustes (`RF26`)
- Implementacao encontrada: `InventoryCount`, `InventoryCountLine`, criação/listagem/publicação e página de contagens
- Cumpre: cria contagem com linhas, preserva quantidade esperada, publica uma vez e cria ajustes via `StockMovement`
- Falhas: falta o endpoint documentado `PATCH /api/inventory/counts/:id/lines`; a UI só permite criar linhas por textarea JSON no `POST`, sem fluxo de edição de rascunho
- Negativos/testes: não há teste de publicação duplicada, linha vazia, quantidade negativa ou `PATCH /lines`
- Evidencia: guia exige `POST`, `PATCH /lines` e `POST /post` em `docs/planificacao/guias-bk/MF2/BK-MF2-04-contagem-fisica-e-ajustes.md`; rotas reais só têm `GET /counts`, `POST /counts` e `POST /counts/:id/post` em `real_dev/api/src/modules/inventory/inventoryCountRoutes.js:37`, `:46`, `:60`
- Riscos: o fluxo documentado de rascunho editável não existe; a defesa/evidence ficaria desalinhada
- Fora de scope detetado: não detetado
- Recomendacao: implementar `PATCH /counts/:id/lines` e testes negativos antes de fechar MF2

### BK-MF2-05

- Estado: OK
- Objetivo/scope: alertas de mínimos, máximos e artigos parados (`RF27`)
- Implementacao encontrada: `StockAlertSetting`, `stockAlertService`, rotas `GET /stock-alerts` e `PUT /stock-alerts/settings`, página `StockAlertsPage`
- Cumpre: valida mínimo/máximo, usa saldos e último movimento, não altera stock automaticamente, aplica permissões de leitura/escrita
- Falhas: depende da migration MF2 inexistente
- Negativos/testes: teste cobre mínimo maior que máximo; faltam testes para artigo/armazém de outra empresa
- Evidencia: `real_dev/api/src/modules/inventory/stockAlertService.js:47`, `real_dev/api/src/modules/inventory/stockAlertRoutes.js:33`
- Riscos: baixo, após resolver migration
- Fora de scope detetado: não detetado
- Recomendacao: acrescentar teste de ownership multiempresa

### BK-MF2-06

- Estado: PARCIAL
- Objetivo/scope: criar, consultar e editar lançamentos manuais com anexos (`RF28`)
- Implementacao encontrada: backend com `POST`, `GET`, `PATCH` e `/attachments`; frontend com página de criação/consulta
- Cumpre: lançamento equilibrado, contas da empresa, bloqueio de período fechado, `source=MANUAL`, MIME/tamanho de anexos e auditoria
- Falhas: a página `ManualJournalPage` não expõe edição (`PATCH`) nem anexos; usa textarea JSON para linhas em vez do formulário de linhas descrito no guia
- Negativos/testes: teste unitário cobre lançamento desequilibrado; faltam testes para edição de lançamento automático, período fechado, conta de outra empresa e MIME inválido
- Evidencia: backend em `real_dev/api/src/modules/accounting/manualJournalService.js:71`, `:134`, `:175`; UI só cria/consulta em `real_dev/web/src/pages/mf2Pages.tsx:334`
- Riscos: fluxo principal de RF28 não fica completo para utilizador final
- Fora de scope detetado: não detetado
- Recomendacao: expor edição e anexos na UI e cobrir negativos obrigatórios

### BK-MF2-07

- Estado: PARCIAL
- Objetivo/scope: consultar balancete e razão exportável PDF/Excel (`RF29`)
- Implementacao encontrada: endpoints JSON e export `trial-balance.xlsx`/`ledger.pdf`; página `AccountingReportsPage`
- Cumpre: filtros por data, `companyId`, razão por conta, exports backend e permissões de contabilidade
- Falhas: frontend/API client não expõe os endpoints de exportação; só consulta JSON de balancete/razão
- Negativos/testes: teste cobre período invertido; faltam testes de conta inexistente, conta de outra empresa e geração real dos ficheiros
- Evidencia: exports backend em `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js:63` e `:85`; frontend só chama `trialBalance` e `ledger` em `real_dev/web/src/lib/apiClient.ts:590`
- Riscos: requisito “exportável” existe no backend mas não no fluxo de UI
- Fora de scope detetado: não detetado
- Recomendacao: adicionar ações/downloads para XLSX/PDF e smoke tests dos headers/content-type

### BK-MF2-08

- Estado: FALHA
- Objetivo/scope: gerar Demonstração de Resultados e Balanço internos, com origem e verificação (`RF30`)
- Implementacao encontrada: endpoints `/income-statement` e `/balance-sheet`, ambos derivados de `buildTrialBalance`
- Cumpre: DR usa classes 6/7 e não promete mapa legal oficial
- Falhas: `buildBalanceSheet` classifica contas de classe 2 simultaneamente como ativo e passivo e não devolve `checkCents`; o guia exige agrupamento por natureza do saldo e verificação de equilíbrio
- Negativos/testes: não há teste para balanço não equilibrado nem para contas patrimoniais
- Evidencia: implementação em `real_dev/api/src/modules/financial-statements/financialStatementService.js:45`; guia exige `checkCents` e aviso de desequilíbrio em `docs/planificacao/guias-bk/MF2/BK-MF2-08-gerar-demonstracao-de-resultados-e-balanco.md`
- Riscos: Balanço pode apresentar valores tecnicamente errados e esconder desequilíbrio
- Fora de scope detetado: não detetado
- Recomendacao: alinhar cálculo com o guia, excluindo classes 6/7, separando por sinal/natureza e devolvendo `checkCents`

## Coerencia Entre MFs

### MF anterior -> MF alvo

- MFs comparadas: `MF1 -> MF2`
- Contratos esperados: compras aprovadas/postadas, `PurchaseDocumentStatus`, `JournalEntry`, `JournalEntryLine`, `AuditLog`, contas SNC, períodos fiscais, `Item`, `Warehouse`, sessão por cookie e contexto multiempresa
- Contratos encontrados: MF2 reutiliza `PurchaseDocument`, `JournalEntry`, contas, períodos, `AuditLog`, `Item` e `Warehouse`; rotas aplicam `requireAuth`, `requireCompanyContext` e permissões
- Quebras/regressoes: sem regressão direta nos contratos MF1; a falta de migration MF2 quebra a continuidade operacional da app quando criada por migrations
- Riscos: testes não comprovam fluxo cumulativo persistido `MF1 -> MF2`
- Estado: FALHA

### MF alvo -> MF seguinte

- MFs comparadas: `MF2 -> MF3`
- Contratos esperados: `BK-MF3-01` depende de mapas IVA; `BK-MF3-07` depende de stock (`BK-MF2-02`); `BK-MF4-04` depende de alertas de stock (`BK-MF2-05`)
- Contratos encontrados: modelos e services MF2 existem em schema/código, mas sem migration e sem evidence MF2
- Quebras/regressoes: consumidores seguintes teriam dependência frágil enquanto a DB real não tiver tabelas MF2
- Riscos: MF3/MF4 podem assumir contratos ainda não entregues de forma reproduzível
- Estado: COM RISCOS

### Cadeia implementada

- Cadeia auditada: `MF0 -> MF1 -> MF2`
- Fluxos cumulativos verificados: leitura estática de auth/contexto/permissões; compras MF1 para histórico MF2; artigos/armazéns MF0 para inventário MF2; contabilidade MF1 para reports MF2
- Pontos de desconexao: migration MF2 inexistente; endpoints/UI em contagens, exports e balanço desalinhados; evidence MF2 ausente
- Estado: FALHA

## Findings

### P0 - Bloqueante

- `P0-MF2-MIG-01`: MF2 altera o schema Prisma mas não entrega migration da macrofase.
  - Evidencia: `real_dev/api/prisma/schema.prisma:607` a `:775` define modelos MF2 (`PurchaseApprovalHistory`, `StockBalance`, `StockMovement`, `StockCostLayer`, `InventoryCount`, `StockAlertSetting`, `JournalAttachment`), mas `real_dev/api/prisma/migrations/` só contém `20260602120000_mf0_initial` e `20260607120000_mf1_schema`.
  - Documento/BK violado: guias MF2 indicam migration a partir de `schema.prisma`; todos os BKs com modelos persistentes dependem disso.
  - Impacto: instalação por migrations não cria tabelas MF2; endpoints MF2 falham em runtime numa base reproduzível.
  - Correcao recomendada: criar migration MF2 numa tarefa separada, validar `prisma migrate`/`prisma validate` e adicionar teste de bootstrap ou verificação de migration.

### P1 - Alto

- `P1-MF2-04-01`: Endpoint de edição de linhas de contagem não existe.
  - Evidencia: o guia/evidence esperado lista `PATCH /api/inventory/counts/:id/lines`; `real_dev/api/src/modules/inventory/inventoryCountRoutes.js` só define `GET /counts`, `POST /counts` e `POST /counts/:id/post`.
  - Documento/BK violado: `BK-MF2-04`, RF26, contrato de contagem em rascunho.
  - Impacto: não há fluxo documentado para editar linhas antes de publicar.
  - Correcao recomendada: implementar `PATCH /counts/:id/lines`, bloquear contagens publicadas e testar duplicados/linhas vazias.

- `P1-MF2-08-01`: Balanço interno não segue o cálculo documentado.
  - Evidencia: `real_dev/api/src/modules/financial-statements/financialStatementService.js:47` inclui classe 2 em ativo e `:49` inclui a mesma classe 2 em passivo; a resposta não tem `checkCents`.
  - Documento/BK violado: `BK-MF2-08`, passo “Calcular Balanço”, que exige separação por natureza do saldo e verificação.
  - Impacto: mapa financeiro pode ficar errado e sem aviso de desequilíbrio.
  - Correcao recomendada: filtrar contas patrimoniais, separar por sinal/natureza, calcular `checkCents` e testar contas 1/2/5.

- `P1-MF2-06-UI-01`: UI de lançamentos manuais não cobre edição nem anexos.
  - Evidencia: `real_dev/web/src/pages/mf2Pages.tsx:334` a `:381` só cria e consulta; `apiClient` tem `update` e `addAttachment` em `real_dev/web/src/lib/apiClient.ts:585`, mas a página não os usa.
  - Documento/BK violado: `BK-MF2-06`, RF28.
  - Impacto: o backend cobre parte do contrato, mas o fluxo de utilizador final não cumpre “criar e editar lançamentos manuais com anexos”.
  - Correcao recomendada: acrescentar edição de linhas/data/descrição e formulário de anexos com validação de MIME/tamanho.

### P2 - Medio

- `P2-MF2-07-FE-01`: Exportação PDF/Excel não está exposta no frontend.
  - Evidencia: backend expõe `trial-balance.xlsx` e `ledger.pdf` em `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js:63` e `:85`; `real_dev/web/src/lib/apiClient.ts:590` a `:598` só tem chamadas JSON.
  - Documento/BK violado: `BK-MF2-07`, RF29.
  - Impacto: utilizador não consegue exportar pelo fluxo principal da app.
  - Correcao recomendada: adicionar botões/downloads e testar `Content-Type`/`Content-Disposition`.

- `P2-MF2-EVID-01`: Evidence MF2 está ausente.
  - Evidencia: `docs/evidence/` contém `MF0` e `MF1`, mas não existe `docs/evidence/MF2/`.
  - Documento/BK violado: secção “Evidence para PR/defesa” dos guias MF2.
  - Impacto: não há prova organizada de smoke, negativos, outputs e handoff por BK.
  - Correcao recomendada: criar evidence por BK depois das correções, com comandos e resultados reais.

- `P2-MF2-TEST-01`: Testes MF2 cobrem pouco além de validators e montagem de routers.
  - Evidencia: `real_dev/api/tests/unit/mf2-services.test.js:13` a `:79` testa apenas seis negativos; `real_dev/api/tests/contracts/mf2-contracts.test.js:17` a `:40` testa permissões e montagem.
  - Documento/BK violado: negativos obrigatórios dos guias MF2 e RNF27.
  - Impacto: fluxos persistidos de stock, FIFO, contagens, anexos, exports e balanço podem falhar sem serem apanhados.
  - Correcao recomendada: adicionar testes de serviço/contrato com Prisma mockado ou base de teste isolada.

### P3 - Baixo

- `P3-DOC-VALIDATOR-01`: Validador de planificação continua a reportar problemas transversais nos guias.
  - Evidencia: `bash scripts/validate-planificacao.sh` devolveu `overall_pass: false`, incluindo `outdated_docs` e `guide_content_issues` em MF0/MF1/MF2.
  - Documento/BK violado: qualidade documental transversal.
  - Impacto: ruído nos gates documentais; não prova por si só falha funcional MF2.
  - Correcao recomendada: alinhar o validador com o formato linear 1..7 já adotado ou atualizar os guias antigos.

## Scope Creep

- Funcionalidades fora de scope encontradas: não foram detetadas funcionalidades claramente fora de scope da MF2.
- BK/MF a que parecem pertencer: não aplicável.
- Risco: baixo.
- Recomendacao: manter a separação atual; não adicionar IA, SAF-T, workflow avançado ou mapas legais oficiais nesta MF.

## Seguranca e Privacidade

- Resultado: COM RISCOS
- Problemas encontrados: não foram encontrados tokens em `localStorage/sessionStorage`, `dangerouslySetInnerHTML`, `eval` ou segredos óbvios; rotas principais aplicam autenticação, empresa ativa e permissões. O risco real é de cobertura insuficiente para multiempresa/403/404 nos endpoints MF2.
- Riscos residuais: anexos são metadados e não upload binário real; faltam testes de ownership para artigo/armazém/conta de outra empresa; falta evidence de erros seguros em HTTP.

## Testes e Comandos

- Comandos executados:
  - `git status --short`: sem output.
  - `git branch --show-current`: `codex/MF2`.
  - `git diff --check`: passou.
  - `bash scripts/validate-planificacao.sh`: executou, mas `overall_pass: false` por issues documentais transversais.
  - `npm --prefix real_dev/api run syntax:check`: passou.
  - `npm --prefix real_dev/api run prisma:validate`: falhou sem `DATABASE_URL`.
  - `DATABASE_URL='<URL_AUTHENTICATED_REDACTED> npm --prefix real_dev/api run prisma:validate`: passou.
  - `npm --prefix real_dev/api run test:unit`: passou, 31 testes.
  - `npm --prefix real_dev/api run test:contracts`: passou, 13 testes.
  - `npm --prefix real_dev/web run typecheck`: passou.
  - `npm --prefix real_dev/web run build`: passou.
- Resultado observado: validações técnicas passam no estado atual, exceto validação documental transversal e `prisma:validate` sem env.
- Comandos nao executados: migrations contra base real, servidor local, E2E/browser.
- Motivo: a tarefa é auditoria sem alterações; não havia DB de teste configurada nem necessidade de arrancar serviço externo.
- Impacto: confiança forte em sintaxe/build, média em contratos HTTP, baixa em fluxos persistidos reais.

## Matriz de Rastreabilidade

| BK | RF/RNF | Entrega esperada | Implementado | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| BK-MF2-01 | RF23 | Histórico e justificações | Sim, sem migration | OK | `purchaseApprovalService.js`, `purchaseApprovalRoutes.js` |
| BK-MF2-02 | RF24 | Movimentos e saldos de stock | Sim, sem migration/teste persistido | PARCIAL | `stockMovementService.js` |
| BK-MF2-03 | RF25 | FIFO backend e preview | Sim, sem teste FIFO completo | PARCIAL | `fifoCostService.js` |
| BK-MF2-04 | RF26 | Contagens com linhas editáveis e ajustes | Parcial; falta `PATCH /lines` | FALHA | `inventoryCountRoutes.js` |
| BK-MF2-05 | RF27 | Alertas de stock | Sim, sem migration | OK | `stockAlertService.js` |
| BK-MF2-06 | RF28 | Lançamentos manuais editáveis com anexos | Backend sim; UI parcial | PARCIAL | `manualJournalService.js`, `mf2Pages.tsx` |
| BK-MF2-07 | RF29 | Balancete/razão exportável | Backend sim; UI sem exports | PARCIAL | `accountingReportRoutes.js`, `apiClient.ts` |
| BK-MF2-08 | RF30 | DR e Balanço com verificação | DR parcial; Balanço divergente | FALHA | `financialStatementService.js` |

## Matriz de Coerencia Entre MFs

| Origem | Contrato entregue | Consumidor | Uso esperado | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| MF1 | `PurchaseDocument`, aprovação, `AuditLog` | BK-MF2-01 | Histórico de decisões | COM RISCOS | Sem migration MF2 |
| MF0 | `Item`, `Warehouse`, contexto empresa | BK-MF2-02/03/04/05 | Inventário multiempresa | COM RISCOS | Services filtram `companyId`, falta migration |
| MF1 | `JournalEntry`, contas SNC, períodos | BK-MF2-06/07/08 | Lançamentos e reporting | COM RISCOS | Balanço divergente, UI parcial |
| MF2 | Stock e alertas | MF3/MF4 futuras | Relatórios/alertas inteligentes | COM RISCOS | Contratos existem no schema/código, não reproduzíveis por migration |

## Conclusao

- Decisao: FAIL.
- O que bloqueia o fecho: ausência de migration MF2; falha do contrato de contagens; cálculo de Balanço desalinhado.
- O que deve ser corrigido antes de avancar: criar migration MF2, implementar `PATCH /counts/:id/lines`, corrigir `buildBalanceSheet`, completar UI de lançamentos manuais/anexos e expor exports.
- O que pode ficar como follow-up: reforço de UI com seletores em vez de IDs/JSON, testes E2E e alinhamento do validador documental.
- Impacto na cadeia de MFs: MF0/MF1 são reutilizadas, mas MF2 ainda não é entregável de forma reproduzível para MF3/MF4.
- Proximo passo recomendado: abrir tarefa de correção apenas para findings P0/P1, depois reauditar MF2.
