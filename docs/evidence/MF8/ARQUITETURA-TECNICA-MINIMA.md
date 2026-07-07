<<<<<<< HEAD
# Arquitetura técnica mínima MF8

## Arquitetura

API Express por módulos, frontend React/Vite e Prisma como contrato de persistência.

## Modelos

Documentar apenas modelos existentes ou criados pelos BKs.

## Fluxos

Separar vendas, compras, tesouraria, contabilidade, IA e subscrição simulada.

## Subscrição simulada

Funcionalidade pedagógica sem pagamento real.

## Limites

Não declarar certificação fiscal nem automatismos não implementados.
=======
# Arquitetura tecnica minima MF8

## Contexto

Esta nota tecnica responde ao `RNF30` e resume a arquitetura real do OPSA em `real_dev`, para apoio a manutencao, revisao e defesa da PAP. O objetivo e explicar como os modulos principais encaixam, quais os modelos persistidos mais relevantes e que limites existem no MVP.

O documento descreve factos observados no codigo atual. Nao declara certificacao fiscal, nao promete integracoes bancarias reais, nao transforma a subscricao simulada em cobranca real e nao alarga o comportamento da IA.

## Arquitetura

A API em `real_dev/api` usa Node.js, Express e ES Modules. O entrypoint `src/server.js` cria o `PrismaClient`, aplica hardening HTTP basico, monta `GET /api/health` como rota publica e depois regista routers por dominio. A regra de negocio fica nos services e a camada HTTP fica nos routers/controllers.

Dominios backend principais:

- Autenticacao e sessao: `auth`, com cookies HttpOnly e middleware de autenticacao.
- Empresa ativa e utilizadores: `companies`, `company-users`, `permissions` e `company-profile`.
- Dados mestre: `customers`, `suppliers`, `items`, `warehouses`, `vat-rates` e `fiscal-periods`.
- Vendas e recebimentos: `sales`, `sales-approval`, `receipts`, `open-items` e `accounting/sale-postings`.
- Compras e pagamentos: `purchases`, `purchase-approval`, `payments` e `accounting/purchase-postings`.
- Inventario: `inventory`, incluindo movimentos, contagens, FIFO e alertas.
- Tesouraria e reporting: `treasury`, `reports`, `accounting-reports`, `financial-statements` e `tax`.
- Compliance e integracoes: `imports`, `exports`, `compliance`, `integrations`, `audit` e `notifications`.
- IA assistiva: `ai`, `reminders`, `tasks` e notificacoes, sempre como apoio explicavel.
- MF8 operacional: `ops` para health-check e `subscriptions` para subscricoes simuladas.

O frontend em `real_dev/web` usa React, Vite e TypeScript. `src/App.tsx` agrega as paginas por macrofase e reutiliza componentes partilhados como `PageFrame`, `StatusMessage`, `ResponsiveDataTable` e `useActionFeedback`. O cliente HTTP central em `src/lib/apiClient.ts` envia cookies com `credentials: "include"`; a UI nao decide ownership, role ou empresa ativa.

## Modelos

Os modelos Prisma em `real_dev/api/prisma/schema.prisma` estao organizados por empresa. O campo `companyId` aparece nas entidades de negocio para filtragem backend e rastreabilidade, mas nao deve ser aceite do browser para decidir ownership.

Modelos estruturais e de seguranca:

- `User`, `Session`, `PasswordResetToken`, `Company`, `CompanyMembership` e `CompanyInvitation` suportam autenticacao, sessao e multiempresa.
- `CompanyProfile`, `Account`, `FiscalPeriod`, `VatRate` e `NumberSequence` suportam configuracao financeira e fiscal minima.
- `AuditLog`, `IntegrationLog` e `RetentionHold` suportam auditoria, integracoes e retencao.

Modelos operacionais:

- `Customer`, `SaleDocument`, `SaleDocumentLine` e `Receipt` suportam vendas e recebimentos.
- `Supplier`, `PurchaseDocument`, `PurchaseDocumentLine` e `Payment` suportam compras e pagamentos.
- `Item`, `Warehouse`, `WarehouseLocation`, `StockMovement`, `StockBalance`, `StockCostLayer`, `StockCostConsumption`, `InventoryCount`, `InventoryCountLine` e `StockAlertSetting` suportam inventario.
- `JournalEntry`, `JournalEntryLine` e `JournalAttachment` representam lancamentos e suporte documental contabilistico.

Modelos analiticos e de IA:

- `OperationalReportRun`, `ExecutiveKpiRun`, `VatMapRun`, `TreasuryBalanceSnapshot`, `CashflowForecastRun` e `SaftExportRun` representam resultados calculados ou exportacoes controladas.
- `AiInsight`, `AiActionSuggestion` e `AiQuestionRun` guardam explicacao, origem e sugestoes. A IA nao executa automaticamente a acao sugerida.

Modelo MF8:

- `CompanySubscription` guarda uma subscricao simulada por empresa, com `planCode`, `status`, `startsAt`, `endsAt` e `simulated=true`. O modelo nao guarda fornecedor de pagamento, checkout, cartao, invoice, recibo ou gateway externo.

## Fluxos

### Autenticacao e multiempresa

O utilizador autentica-se pela API e a sessao fica em cookie HttpOnly. As rotas protegidas resolvem utilizador, role/permissao e empresa ativa no backend. O frontend recolhe intencao e apresenta estado, mas nao escolhe a empresa final nem decide autorizacao.

### Vendas, recebimentos e contabilidade

O fluxo de vendas cria documentos operacionais em `SaleDocument` e linhas em `SaleDocumentLine`. A emissao definitiva e aprovacao seguem regras dos services de vendas. Recebimentos ficam em `Receipt` e reduzem saldos em aberto. Lancamentos contabilisticos relacionados com vendas usam `JournalEntry` e `JournalEntryLine` atraves do dominio `accounting/sale-postings`.

Documento operacional, recebimento e lancamento contabilistico sao entidades separadas. Esta separacao evita que um recibo ou uma venda sejam confundidos com o registo contabilistico final.

### Compras, pagamentos e contabilidade

O fluxo de compras usa `PurchaseDocument` e `PurchaseDocumentLine`. A aprovacao de compras fica em `PurchaseApprovalHistory`. Pagamentos usam `Payment`. Lancamentos contabilisticos de compras usam `accounting/purchase-postings`.

O fluxo de fornecedor nao deve ser misturado com o fluxo de cliente. Pagamentos a fornecedores e recebimentos de clientes tambem ficam separados por modelo e service.

### Inventario

Movimentos de stock ficam em `StockMovement`, saldos em `StockBalance` e custos em `StockCostLayer` e `StockCostConsumption`. Contagens de inventario usam `InventoryCount` e `InventoryCountLine`. Alertas de stock usam `StockAlertSetting` e sao reutilizados pela IA para insights explicaveis.

### Tesouraria, reporting e fiscalidade

Contas de tesouraria, importacoes de extrato, linhas bancarias e sugestoes de reconciliacao vivem no dominio `treasury`. Relatorios operacionais, KPIs executivos, mapas de IVA e demonstracoes financeiras sao gerados como leituras controladas sobre dados existentes.

O MVP pode gerar evidencias e exportacoes tecnicas, mas nao declara certificacao legal nem SAF-T completo certificado.

### IA assistiva

A IA cria insights com explicacao e origem dos dados. As fontes sao dados reais da empresa ativa, como relatorios, KPIs, documentos em aberto ou alertas de stock. A IA pode sugerir revisao de stock, cobranca, precos ou cashflow, mas nao aprova documentos, nao altera dados contabilisticos, nao cria movimentos, nao envia pagamentos e nao executa a sugestao.

## Subscricao simulada

A MF8 introduz uma subscricao simulada para demonstrar planos e ciclo de vida sem gateway de pagamento. O catalogo de planos vive em `src/modules/subscriptions/subscriptionPlans.js`; o estado por empresa vive em `CompanySubscription`; as rotas em `subscriptionRoutes.js` expõem consulta, ativacao e acoes de ciclo de vida.

Contratos principais:

- `GET /api/subscriptions/plans` devolve planos simulados em EUR.
- `GET /api/subscriptions/current` devolve a subscricao da empresa ativa.
- `POST /api/subscriptions/current/activate` ativa uma subscricao simulada para a empresa ativa.
- `POST /api/subscriptions/current/actions` permite renovar, cancelar e reativar conforme transicoes permitidas.

A subscricao e pedagogica e nao cria cobranca real, fatura, recibo, pagamento, checkout, webhook, invoice ou lancamento contabilistico automatico.

## Limites

- O OPSA MVP nao declara certificacao fiscal.
- O SAF-T e tratado como prontidao/checklist/exportacao controlada, nao como promessa de submissao legal completa.
- Integracoes bancarias reais, OCR, RAG, embeddings e automacoes contabilisticas nao estao prometidos neste BK.
- A IA e recomendacao explicavel; nao executa acoes operacionais nem contabilisticas.
- A subscricao MF8 e simulada; nao existe fornecedor de pagamento real.
- O frontend nao guarda token, role, empresa ativa ou sessao em `localStorage` ou `sessionStorage`.
- Qualquer validacao fiscal, contabilistica ou legal que exija decisao externa deve ficar marcada como limite ou blocker, nao inventada no codigo.

## Checklist de atualizacao documental

- Atualizar este documento quando for criado novo dominio backend, pagina frontend principal ou modelo Prisma relevante.
- Manter a separacao entre documento operacional, pagamento/recebimento e lancamento contabilistico.
- Registar explicitamente se uma funcionalidade e simulada, local, deterministica ou dependente de ambiente externo.
- Confirmar que novos fluxos multiempresa continuam a resolver `companyId` no backend.
- Rever os limites antes de qualquer apresentacao para evitar promessas legais, fiscais, bancarias ou de IA que nao existam no MVP.
>>>>>>> 81619f4 (Update: Mid)
