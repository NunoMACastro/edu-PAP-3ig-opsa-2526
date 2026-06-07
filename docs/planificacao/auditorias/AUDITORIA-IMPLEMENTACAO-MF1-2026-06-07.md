## Resultado Geral

- Projeto: OPSA
- Alvo auditado: MF1
- Implementacao auditada: `real_dev/` (`real_dev/api` e `real_dev/web`)
- Estado: PASS COM RISCOS
- Resumo: A implementacao backend da MF1 existe, esta montada em rotas reais, reutiliza contratos da MF0 e passou nos testes unitarios e de contrato. Os riscos principais estao no frontend, que existe mas e uma consola generica configurada em `App.tsx`, sem paginas/modulos dedicados conforme os guias, e na evidence da MF1, que declara ficheiros que nao existem e contem um conflito Git por resolver.
- Coerencia entre MFs: COM RISCOS
- Pode avancar para a proxima macrofase?: Sim, com riscos

## Escopo Auditado

- BKs alvo: `BK-MF1-01`, `BK-MF1-02`, `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-05`, `BK-MF1-06`, `BK-MF1-07`, `BK-MF1-08`, `BK-MF1-09`, `BK-MF1-10`
- MFs implementadas consideradas: `MF0`, `MF1`
- Profundidade de coerencia: `vizinhas`
- Documentos consultados: `README.md`; `docs/RF.md`; `docs/RNF.md`; `docs/planificacao/README.md`; `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`; `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`; `docs/planificacao/backlogs/BACKLOG-MVP.md`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`; `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`; `docs/planificacao/backlogs/MF-VIEWS.md`; `docs/planificacao/sprints/PLANO-SPRINTS.md`; `docs/planificacao/guias-bk/README.md`; `docs/planificacao/guias-bk/MF1/*.md`; `docs/planificacao/guias-bk/MF1/ORDEM-DEPENDENCIAS-E-PRS-MF1.md`; `docs/planificacao/guias-bk/MF0/*.md`; `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF1.md`; `docs/evidence/MF1/*.md`
- Pastas de codigo analisadas: `real_dev/api/src`, `real_dev/api/prisma`, `real_dev/api/tests`, `real_dev/web/src`
- Pastas ignoradas: `mockup/` por ser prototipo; `apps/` porque e identico a `real_dev/` por `diff -qr real_dev apps`; `node_modules/` e `dist/` por serem dependencias/artefactos
- Worktree: limpa no preflight (`git status --short` sem output), branch `main`
- Limitacoes da auditoria: `npm --prefix real_dev/api run prisma:validate` falhou por falta de `DATABASE_URL`; nao foram executados `build` nem testes E2E/browser para evitar gerar artefactos fora do relatorio; a validacao documental global reporta problemas transversais antigos de guias

## Validacao por BK

### BK-MF1-01

- Estado: PARCIAL
- Objetivo/scope: configurar tabelas de IVA com taxas, isencoes e codigos (`RF13`)
- Implementacao encontrada: modelo `VatRate` em `real_dev/api/prisma/schema.prisma:310`, service com validacao e ativacao em `real_dev/api/src/modules/vat-rates/vatRateService.js:25`, rotas protegidas em `real_dev/api/src/modules/vat-rates/vatRateRoutes.js:37`, cliente frontend em `real_dev/web/src/lib/apiClient.ts:411` e painel generico em `real_dev/web/src/App.tsx:623`
- Cumpre: isolamento por empresa, CRUD minimo, validacao de isencao, permissao `VAT_RATES_READ/WRITE`, testes unitarios
- Falhas: frontend nao existe como `VatRatesPage.tsx`/modulo dedicado; a UI usa configuracao generica
- Negativos/testes: `BK-MF1-01: IVA isento exige motivo de isencao` passou em `npm --prefix real_dev/api run test:unit`
- Evidencia: `real_dev/api/src/modules/vat-rates/*`; `real_dev/web/src/App.tsx:623`
- Riscos: rastreabilidade e UX abaixo do contrato esperado dos guias
- Fora de scope detetado: nao detetado
- Recomendacao: manter backend e criar/organizar pagina ou modulo frontend especifico, com validacao antes de submissao

### BK-MF1-02

- Estado: PARCIAL
- Objetivo/scope: emitir fatura, fatura-recibo e nota de credito com numeracao sequencial (`RF14`)
- Implementacao encontrada: modelos `SaleDocument`, `SaleDocumentLine` e `NumberSequence` em `real_dev/api/prisma/schema.prisma:330` e `real_dev/api/prisma/schema.prisma:344`; service de criacao/emissao em `real_dev/api/src/modules/sales/saleDocumentService.js:107` e `real_dev/api/src/modules/sales/saleDocumentService.js:229`; rotas em `real_dev/api/src/modules/sales/saleDocumentRoutes.js:37`; frontend generico em `real_dev/web/src/App.tsx:657`
- Cumpre: totais calculados no backend, `companyId` por contexto, periodo fiscal aberto, numeracao por `upsert`, claim concorrente antes da reserva de numero, auditoria de criacao/emissao
- Falhas: frontend usa `Linhas JSON` em `real_dev/web/src/App.tsx:927`, sem formulario dedicado de linhas; evidence contem conflito Git e declara ficheiros inexistentes
- Negativos/testes: testes unitarios cobrem calculo de totais, numeracao atomica, emissao aprovada e concorrencia; teste HTTP cobre ausencia de sessao
- Evidencia: `real_dev/api/src/modules/sales/saleDocumentService.js:127`, `real_dev/api/src/modules/sales/saleDocumentService.js:257`, `real_dev/api/tests/unit/mf1-services.test.js:45`
- Riscos: erro operacional no frontend e evidence nao confiavel para defesa
- Fora de scope detetado: nao detetado
- Recomendacao: substituir textarea JSON por editor de linhas e limpar `docs/evidence/MF1/BK-MF1-02.md`

### BK-MF1-03

- Estado: PARCIAL
- Objetivo/scope: registar recebimentos parciais/totais (`RF15`)
- Implementacao encontrada: modelo `Receipt` em `real_dev/api/prisma/schema.prisma:397`; service em `real_dev/api/src/modules/receipts/receiptService.js:54`; rota protegida em `real_dev/api/src/modules/receipts/receiptRoutes.js:33`; operacao frontend em `real_dev/web/src/App.tsx:697`
- Cumpre: bloqueia notas de credito, valida saldo aberto, evita saldo alterado em concorrencia, atualiza `amountPaidCents`, coloca documento em `SETTLED`, audita recebimento
- Falhas: frontend exige ID manual do documento e nao fornece fluxo dedicado a partir da listagem de vendas
- Negativos/testes: testes unitarios cobrem excesso de valor e saldo stale
- Evidencia: `real_dev/api/src/modules/receipts/receiptService.js:78`, `real_dev/api/src/modules/receipts/receiptService.js:101`, `real_dev/api/src/modules/receipts/receiptService.js:110`
- Riscos: operacao manual propensa a erro apesar de backend estar protegido
- Fora de scope detetado: nao detetado
- Recomendacao: ligar recebimento a documentos emitidos selecionaveis na UI

### BK-MF1-04

- Estado: OK
- Objetivo/scope: gerar lancamentos contabilisticos automaticos por venda (`RF16`)
- Implementacao encontrada: modelo `JournalEntry` em `real_dev/api/prisma/schema.prisma:416`; service em `real_dev/api/src/modules/accounting/salePostingService.js:53`; rota em `real_dev/api/src/modules/accounting/salePostingRoutes.js:33`; cliente em `real_dev/web/src/lib/apiClient.ts:273`
- Cumpre: exige documento emitido/liquidado, valida periodo fiscal, usa contas `211`, `72`, `2433`, balanceia debito/credito, idempotencia por `@@unique([companyId, source, sourceId])`, auditoria
- Falhas: sem falha funcional central detetada
- Negativos/testes: teste unitario confirma lancamento balanceado
- Evidencia: `real_dev/api/src/modules/accounting/salePostingService.js:71`, `real_dev/api/src/modules/accounting/salePostingService.js:78`, `real_dev/api/src/modules/accounting/salePostingService.js:131`
- Riscos: depende de contas SNC pedagogicas existirem na empresa
- Fora de scope detetado: nao detetado
- Recomendacao: manter teste de contrato para conta em falta quando o fluxo contabilistico crescer

### BK-MF1-05

- Estado: PARCIAL
- Objetivo/scope: consultar titulos em aberto e antiguidade de saldos (`RF17`)
- Implementacao encontrada: rota `GET /api/sales/open-items` em `real_dev/api/src/modules/open-items/salesOpenItemsRoutes.js:33`; cliente em `real_dev/web/src/lib/apiClient.ts:498`; painel em `real_dev/web/src/App.tsx:706`
- Cumpre: endpoint protegido por leitura de vendas; testes unitarios cobrem antiguidade e exclusao de liquidados
- Falhas: UI nao expoe filtro `asOfDate` apesar de o cliente aceitar esse parametro; nao ha vista dedicada com filtros/ordenacao de antiguidade
- Negativos/testes: teste unitario cobre calculo basico, mas nao ha teste de UI nem contrato HTTP para query `asOfDate`
- Evidencia: `real_dev/web/src/App.tsx:706`, `real_dev/web/src/lib/apiClient.ts:498`
- Riscos: valor funcional reduzido para gestao de cobrancas
- Fora de scope detetado: nao detetado
- Recomendacao: acrescentar filtro de data de referencia e teste de contrato HTTP

### BK-MF1-06

- Estado: PARCIAL
- Objetivo/scope: submeter documentos de venda para aprovacao antes da emissao definitiva (`RF18`)
- Implementacao encontrada: workflow `submit/approve/reject` em `real_dev/api/src/modules/sales-approval/saleApprovalService.js:69`, `real_dev/api/src/modules/sales-approval/saleApprovalService.js:111` e `real_dev/api/src/modules/sales-approval/saleApprovalService.js:158`; emissao exige `APPROVED` em `real_dev/api/src/modules/sales/saleDocumentService.js:242`; UI generica em `real_dev/web/src/App.tsx:669`
- Cumpre: estados `DRAFT -> SUBMITTED -> APPROVED/REJECTED -> ISSUED/SETTLED`, segregacao entre submitter e aprovador, auditoria, permissao `SALES_APPROVE`
- Falhas: frontend nao torna o estado/acao visualmente controlado por documento; as operacoes aceitam ID manual
- Negativos/testes: unitario cobre emissao nao aprovada; contrato HTTP cobre operacional sem permissao para aprovar
- Evidencia: `real_dev/api/src/modules/sales-approval/saleApprovalService.js:120`, `real_dev/api/src/modules/sales/saleDocumentService.js:242`, `real_dev/api/tests/contracts/mf1-contracts.test.js:143`
- Riscos: UX permite tentativa manual fora do estado esperado, embora backend bloqueie
- Fora de scope detetado: nao detetado
- Recomendacao: apresentar acoes condicionadas por estado na listagem de documentos

### BK-MF1-07

- Estado: PARCIAL
- Objetivo/scope: registar fatura de fornecedor e nota de credito (`RF19`)
- Implementacao encontrada: modelos `PurchaseDocument` e `PurchaseDocumentLine` em `real_dev/api/prisma/schema.prisma:445`; service em `real_dev/api/src/modules/purchases/purchaseDocumentService.js:69`; painel em `real_dev/web/src/App.tsx:727`
- Cumpre: compra nasce em `DRAFT`, valida fornecedor/artigo/IVA por empresa, calcula totais no backend, valida periodo fiscal, audita criacao
- Falhas: frontend usa `Linhas JSON` em `real_dev/web/src/App.tsx:960`, sem formulario de linhas nem selecao assistida de fornecedor/artigo/IVA
- Negativos/testes: unitario cobre criacao em rascunho com totais backend
- Evidencia: `real_dev/api/src/modules/purchases/purchaseDocumentService.js:103`, `real_dev/api/src/modules/purchases/purchaseDocumentService.js:166`, `real_dev/api/tests/unit/mf1-services.test.js`
- Riscos: erros de operacao no frontend e baixa conformidade com RNF05
- Fora de scope detetado: nao detetado
- Recomendacao: criar UI de documento de compra com linhas editaveis e validacao client-side minima

### BK-MF1-08

- Estado: OK
- Objetivo/scope: registar pagamentos parciais/totais (`RF20`)
- Implementacao encontrada: modelo `Payment` em `real_dev/api/prisma/schema.prisma:493`; service em `real_dev/api/src/modules/payments/paymentService.js:54`; rota em `real_dev/api/src/modules/payments/paymentRoutes.js:33`; painel em `real_dev/web/src/App.tsx:752`
- Cumpre: bloqueia compra em `DRAFT`, bloqueia notas de credito, valida periodo fiscal, impede pagamento acima do saldo e saldo stale, audita pagamento
- Falhas: sem falha funcional central detetada
- Negativos/testes: unitarios e contrato HTTP cobrem compra em rascunho, saldo stale e pagamento total sem mudar estado contabilistico
- Evidencia: `real_dev/api/src/modules/payments/paymentService.js:78`, `real_dev/api/src/modules/payments/paymentService.js:85`, `real_dev/api/tests/contracts/mf1-contracts.test.js:157`
- Riscos: operacao frontend ainda e manual por ID
- Fora de scope detetado: nao detetado
- Recomendacao: ligar pagamento a documento selecionado na UI, mas backend esta adequado ao BK

### BK-MF1-09

- Estado: OK
- Objetivo/scope: gerar lancamentos contabilisticos automaticos de compras (`RF21`)
- Implementacao encontrada: service em `real_dev/api/src/modules/accounting/purchasePostingService.js:94`; rota em `real_dev/api/src/modules/accounting/purchasePostingRoutes.js:33`; cliente em `real_dev/web/src/lib/apiClient.ts:281`
- Cumpre: exige compra `APPROVED`/historicamente `PAID`, valida periodo fiscal, usa contas `62`, `2432`, `221`, balanceia diario, atualiza estado para `POSTED`, idempotencia e auditoria
- Falhas: sem falha funcional central detetada
- Negativos/testes: unitarios cobrem balanceamento e estado final `POSTED`
- Evidencia: `real_dev/api/src/modules/accounting/purchasePostingService.js:111`, `real_dev/api/src/modules/accounting/purchasePostingService.js:118`, `real_dev/api/src/modules/accounting/purchasePostingService.js:186`
- Riscos: depende de contas SNC pedagogicas existirem na empresa
- Fora de scope detetado: nao detetado
- Recomendacao: manter cobertura de conta em falta e idempotencia em testes de contrato

### BK-MF1-10

- Estado: OK
- Objetivo/scope: aprovacao de compras com estados `DRAFT -> APPROVED -> POSTED` (`RF22`)
- Implementacao encontrada: service em `real_dev/api/src/modules/purchase-approval/purchaseApprovalService.js:67` e `real_dev/api/src/modules/purchase-approval/purchaseApprovalService.js:106`; rotas montadas em `real_dev/api/src/server.js:66`; painel em `real_dev/web/src/App.tsx:740`
- Cumpre: aprova apenas rascunhos, lanca compras aprovadas/pagas, reutiliza contabilizacao transacional, audita aprovacao/lancamento, permissao separada `PURCHASES_APPROVE`
- Falhas: sem falha funcional central detetada
- Negativos/testes: unitario cobre aprovacao apenas de rascunho; contrato cobre permissao MF1
- Evidencia: `real_dev/api/src/modules/purchase-approval/purchaseApprovalService.js:69`, `real_dev/api/src/modules/purchase-approval/purchaseApprovalService.js:116`, `real_dev/api/tests/contracts/mf1-contracts.test.js:97`
- Riscos: historico detalhado de justificacoes fica corretamente para MF2, mas a evidence deve deixar esse handoff limpo
- Fora de scope detetado: nao detetado
- Recomendacao: MF2 deve consumir estes estados sem renomear `PurchaseDocumentStatus`

## Coerencia Entre MFs

### MF anterior -> MF alvo

- MFs comparadas: `MF0 -> MF1`
- Contratos esperados: sessao por cookie HttpOnly, contexto multiempresa, roles/permissoes, clientes, fornecedores, artigos, contas SNC e periodos fiscais
- Contratos encontrados: `requireAuth`, `requireCompanyContext` e `requirePermission` usados nas rotas MF1; `companyId` vem de `req.companyId` em `real_dev/api/src/modules/sales/saleDocumentRoutes.js:63` e rotas equivalentes; `assertOpenFiscalPeriod` usado em vendas, compras, recebimentos, pagamentos e lancamentos
- Quebras/regressoes: sem quebra backend detetada; UI continua generica e dependente de IDs manuais
- Riscos: formulario generico pode esconder erros operacionais que a MF0/MF1 deveriam guiar melhor
- Estado: COM RISCOS

### MF alvo -> MF seguinte

- MFs comparadas: `MF1 -> MF2`
- Contratos esperados: `BK-MF2-01` depende de `BK-MF1-10` para historico/justificacoes de aprovacoes/reprovacoes
- Contratos encontrados: `PurchaseDocumentStatus` tem `DRAFT`, `APPROVED`, `POSTED`, `PAID`; `PurchaseDocument` regista `approvedAt`, `approvedById`, `postedAt`, `postedById`; `AuditLog` existe
- Quebras/regressoes: MF2 nao esta implementada no codigo real auditado; nao foi possivel validar consumidor real
- Riscos: falta campo de motivo/justificacao na compra para reprovar/aprovar, mas isto parece pertencer ao scope de `BK-MF2-01`
- Estado: NAO APLICAVEL para consumidor real; COM RISCOS como handoff documental

### Cadeia implementada

- Cadeia auditada: `MF0 -> MF1`
- Fluxos cumulativos verificados: autenticacao/contexto/permissoes; IVA -> vendas/compras; vendas -> aprovacao -> emissao -> recebimento -> lancamento -> titulos em aberto; compras -> aprovacao -> pagamento -> lancamento
- Pontos de desconexao: frontend generico e evidence divergente
- Estado: COM RISCOS

## Findings

### P0 - Bloqueante

Sem findings.

### P1 - Alto

- `P1-FE-01`: Frontend MF1 existe, mas nao cumpre a modularidade/validacao esperada pelos BKs e RNFs.
  - Evidencia: `real_dev/web/src` contem apenas `App.tsx`, `apiClient.ts`, `main.tsx`, `styles.css` e `vite-env.d.ts`; os fluxos MF1 estao definidos numa unica lista em `real_dev/web/src/App.tsx:381`; documentos de venda e compra usam textareas `Linhas JSON` em `real_dev/web/src/App.tsx:927` e `real_dev/web/src/App.tsx:960`.
  - Documento/BK violado: guias MF1 esperam paginas dedicadas com estados de loading/erro/sucesso; `RNF01`, `RNF03`, `RNF05`, `RNF26`.
  - Impacto: maior risco de erro operacional e menor rastreabilidade por BK, apesar de o backend bloquear regras criticas.
  - Correcao recomendada: criar modulos/paginas por dominio MF1 ou componentes reutilizaveis equivalentes, com formularios de linhas, seletores e validacao antes de submissao.

### P2 - Medio

- `P2-EVID-01`: Evidence MF1 declara ficheiros frontend inexistentes e contem conflito Git por resolver.
  - Evidencia: `docs/evidence/MF1/BK-MF1-02.md:45`, `docs/evidence/MF1/BK-MF1-02.md:267` e `docs/evidence/MF1/BK-MF1-02.md:268` contem `<<<<<<<`, `=======`, `>>>>>>>`; a evidence refere `apps/web/src/pages/SaleDocumentsPage.tsx`, `ReceiptsPage.tsx`, `PurchaseDocumentsPage.tsx`, etc., mas `find real_dev/web/src -type f` mostra apenas `App.tsx`, `apiClient.ts`, `main.tsx`, `styles.css`, `vite-env.d.ts`.
  - Documento/BK violado: regra de evidence objetiva e rastreavel dos guias MF1.
  - Impacto: a defesa/PR pode alegar entregas que nao existem no codigo real.
  - Correcao recomendada: limpar conflito e alinhar evidence com a implementacao real, ou criar os ficheiros realmente prometidos.

- `P2-TEST-01`: Cobertura automatizada de MF1 e forte no backend, mas nao cobre frontend nem fluxo E2E.
  - Evidencia: `npm --prefix real_dev/api run test:unit` passou 25 testes e `test:contracts` passou 11 testes; `npm --prefix real_dev/web run typecheck` passou, mas nao ha testes frontend/E2E.
  - Documento/BK violado: guias MF1 pedem fluxo integrado e estados de UI; `RNF27` recomenda testes automatizados para modulos criticos.
  - Impacto: regressao de UX ou wiring frontend pode passar despercebida.
  - Correcao recomendada: acrescentar pelo menos smoke tests frontend/E2E para criar venda, aprovar, emitir, receber, contabilizar e fluxo equivalente de compras.

### P3 - Baixo

- `P3-ENV-01`: `prisma:validate` nao corre sem `DATABASE_URL` local.
  - Evidencia: `npm --prefix real_dev/api run prisma:validate` falhou com `Environment variable not found: DATABASE_URL` em `real_dev/api/prisma/schema.prisma:7`.
  - Documento/BK violado: validacao final dos guias MF1 inclui `prisma:validate`.
  - Impacto: auditoria local nao confirmou o schema via Prisma neste ambiente, embora os testes importem services e o schema tenha sido analisado estaticamente.
  - Correcao recomendada: documentar `.env.example`/comando com `DATABASE_URL` de teste ou usar script de validacao local seguro.

- `P3-DOC-01`: Validador de planificacao passa cobertura, mas mantem problemas transversais de guias.
  - Evidencia: `bash scripts/validate-planificacao.sh` devolveu `overall_pass: false`, com `outdated_docs` e `guide_content_issues` incluindo BKs MF1.
  - Documento/BK violado: qualidade documental transversal.
  - Impacto: ruido nos gates documentais; nao altera por si so a implementacao backend.
  - Correcao recomendada: resolver os checks transversais numa tarefa documental separada.

## Scope Creep

- Funcionalidades fora de scope encontradas: nao foi detetado scope creep funcional relevante na implementacao MF1. `PurchaseDocumentStatus.PAID` existe como estado historico/compatibilidade, mas o lancamento formal termina em `POSTED`, conforme testes e evidence.
- BK/MF a que parecem pertencer: nao aplicavel.
- Risco: baixo.
- Recomendacao: manter `PAID` documentado se continuar a existir para historico, para evitar reinterpretacao futura do workflow.

## Seguranca e Privacidade

- Resultado: COM RISCOS BAIXOS
- Problemas encontrados: sem segredos, `localStorage`, `sessionStorage`, `eval`, `dangerouslySetInnerHTML` ou logs de tokens/passwords detetados em `real_dev/api/src` e `real_dev/web/src`; cookies HttpOnly sao usados no cliente via `credentials: "include"`.
- Riscos residuais: `console.info` em `real_dev/api/src/server.js:79` regista apenas evento/porta/ambiente; adapters de email usam `delivery: "mock"` sem tokens brutos. Risco principal permanece na ausencia de E2E de autorizacao por UI, nao no backend.

## Testes e Comandos

- Comandos executados:
  - `git status --short`: sem output.
  - `git branch --show-current`: `main`.
  - `diff -qr real_dev apps`: sem diferencas.
  - `git diff --check`: passou sem output.
  - `bash scripts/validate-planificacao.sh`: exit `0`, mas JSON com `overall_pass: false` por problemas transversais.
  - `npm --prefix real_dev/api run syntax:check`: passou.
  - `npm --prefix real_dev/api run prisma:validate`: falhou por falta de `DATABASE_URL`.
  - `npm --prefix real_dev/web run typecheck`: passou.
  - `npm --prefix real_dev/api run test:unit`: passou, 25/25.
  - `npm --prefix real_dev/api run test:contracts`: passou, 11/11.
  - pesquisas estaticas com `rg` para segredos/storage/escapes/placeholders/conflitos.
- Resultado observado: validacoes de codigo passaram exceto Prisma por ambiente; validacao documental global tem riscos transversais.
- Comandos nao executados: `npm --prefix real_dev/web run build`, testes E2E/browser.
- Motivo: `build` escreve artefactos em `dist/`; nao existem testes E2E definidos.
- Impacto: confianca alta no backend e media no frontend.

## Matriz de Rastreabilidade

| BK | RF/RNF | Entrega esperada | Implementado | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| BK-MF1-01 | RF13, RNF17 | Tabelas IVA por empresa | Backend + painel generico | PARCIAL | `vatRateService.js:25`, `App.tsx:623` |
| BK-MF1-02 | RF14, RF47, RNF17 | Documentos venda e numeracao | Backend robusto + UI generica | PARCIAL | `saleDocumentService.js:107`, `saleDocumentService.js:229` |
| BK-MF1-03 | RF15, RNF17 | Recebimentos parciais/totais | Backend robusto + UI por ID | PARCIAL | `receiptService.js:54` |
| BK-MF1-04 | RF16, RF08, RNF17 | Lancamento automatico venda | Sim | OK | `salePostingService.js:53` |
| BK-MF1-05 | RF17 | Titulos em aberto | Backend + listagem sem filtro UI | PARCIAL | `salesOpenItemsRoutes.js:41`, `App.tsx:706` |
| BK-MF1-06 | RF18, RNF17 | Aprovacao venda antes de emissao | Backend robusto + UI manual | PARCIAL | `saleApprovalService.js:69`, `saleDocumentService.js:242` |
| BK-MF1-07 | RF19, RNF17 | Compra/nota credito fornecedor | Backend robusto + UI JSON | PARCIAL | `purchaseDocumentService.js:69`, `App.tsx:960` |
| BK-MF1-08 | RF20, RNF17 | Pagamentos parciais/totais | Sim | OK | `paymentService.js:54` |
| BK-MF1-09 | RF21, RF08, RNF17 | Lancamento automatico compra | Sim | OK | `purchasePostingService.js:94` |
| BK-MF1-10 | RF22, RNF17 | `DRAFT -> APPROVED -> POSTED` | Sim | OK | `purchaseApprovalService.js:67`, `purchaseApprovalService.js:106` |

## Matriz de Coerencia Entre MFs

| Origem | Contrato entregue | Consumidor | Uso esperado | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| MF0 | Sessao cookie/contexto empresa | MF1 rotas | `requireAuth` + `requireCompanyContext` | OK | `server.js:58-69`, rotas MF1 |
| MF0 | Permissoes por role | MF1 rotas | leitura/escrita/aprovacao/contabilidade separadas | OK | `permissions.js:21-28`, `mf1-contracts.test.js:97` |
| MF0 | Periodos fiscais | MF1 documentos/lancamentos | bloquear periodo fechado | OK | `assertOpenFiscalPeriod` em services MF1 |
| MF0 | Clientes/artigos/fornecedores/IVA | MF1 vendas/compras | validar ownership por empresa | OK | `saleDocumentService.js:130-144`, `purchaseDocumentService.js:106-124` |
| MF1 | Estados de compra | MF2 BK-MF2-01 | historico/justificacoes sobre aprovacoes | COM RISCOS | `schema.prisma:445`, `purchaseApprovalService.js:67` |

## Conclusao

- Decisao: PASS COM RISCOS.
- O que bloqueia o fecho: nada bloqueante `P0`; para fecho formal de produto, o `P1-FE-01` deve ser tratado.
- O que deve ser corrigido antes de avancar: modularidade/validacao frontend MF1 e evidence com conflito/ficheiros inexistentes.
- O que pode ficar como follow-up: `DATABASE_URL` local para `prisma:validate`, checks documentais transversais, E2E/browser.
- Impacto na cadeia de MFs: backend MF0 -> MF1 esta coerente; MF1 entrega contratos suficientes para MF2, mas o handoff documental deve ser limpo.
- Proximo passo recomendado: corrigir frontend/evidence numa tarefa separada e reauditar apenas os findings `P1-FE-01`, `P2-EVID-01` e `P2-TEST-01`.
