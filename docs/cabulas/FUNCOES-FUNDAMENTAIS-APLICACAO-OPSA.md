# Funções Fundamentais Da Aplicação - OPSA

Data do levantamento: 2026-07-11 (sincronização incremental da IA v2)
Base do levantamento: `real_dev/api/src` e `real_dev/web/src`

## Critérios

- A lista foi extraída por AST a partir do código real em `real_dev`.
- Inclui funções, métodos, componentes React, hooks e helpers nomeados de runtime com JSDoc imediato.
- Inclui helpers privados quando têm JSDoc e suportam validação, autorização, transformação de dados, persistência, integração ou fluxo operacional relevante.
- Exclui testes, scripts fora de `src`, callbacks anónimos inline, artefactos gerados, `node_modules`, `dist`, reports e construtores.
- Cada entrada mostra a assinatura curta, o tipo de símbolo, a descrição principal, as entradas documentadas e o valor devolvido.

## Resumo

- Backend: 629 entradas fundamentais em 164 ficheiros.
- Frontend: 340 entradas fundamentais em 28 ficheiros.
- Total: 969 entradas documentais.

Uma entrada pode agrupar funções relacionadas, como operações CRUD de sessões ou consentimento, quando partilham responsabilidade e contrato. Por isso, este inventário documental não deve ser confundido com a contagem AST integral apresentada em `ESTATISTICAS-PROJETO.md`.

## Backend

### `real_dev/api/src/config/env.js`

- `readEnv(env, key, fallback)` (top-level; função) - Le uma variavel com fallback explicito. Entradas: `env`: Ambiente fonte.; `key`: Nome da variavel.; `fallback`: Valor por omissao. Devolve: Valor normalizado.
- `parsePort(value)` (top-level; função) - Converte porta de texto para inteiro seguro. Entradas: `value`: Valor recebido por ambiente. Devolve: Porta normalizada.
- `loadApiEnv(env)` (exportada; função) - Carrega configuracao operacional da API. Entradas: `env`: Ambiente fonte. Devolve: Configuracao publica segura.

### `real_dev/api/src/config/envFile.js`

- `loadLocalEnvFile(envFilePath)` (exportada; função) - Carrega `.env` local quando o ficheiro existe. Entradas: `envFilePath`: Caminho do ficheiro de ambiente. Devolve: `true` quando o ficheiro foi carregado.

### `real_dev/api/src/lib/httpErrors.js`

- `httpError(status, code, message, details)` (exportada; função) - Constrói um erro HTTP operacional. Entradas: `status`: Código HTTP pretendido.; `code`: Código funcional da falha.; `message`: Mensagem segura para devolver ao cliente.; `details`: Detalhes opcionais e seguros. Devolve: Erro operacional pronto a lançar.
- `mapKnownPrismaError(error)` (top-level; função) - Converte erros Prisma comuns para respostas previsíveis. Entradas: `error`: Erro original lançado pelo Prisma. Devolve: Erro HTTP quando a falha é conhecida; caso contrário `null`.
- `mapKnownDomainError(error)` (top-level; função) - Converte erros de dominio conhecidos para respostas seguras. Entradas: `error`: Erro original lançado por services de dominio. Devolve: Erro HTTP quando a falha é conhecida; caso contrário `null`.
- `toHttpError(error)` (exportada; função) - Normaliza qualquer erro para o formato HTTP seguro usado pela API. Entradas: `error`: Erro capturado num controller ou middleware. Devolve: Erro HTTP seguro para resposta JSON.

### `real_dev/api/src/modules/accounting-reports/accountingReportExporters.js`

- `cents(value)` (top-level; função) - Formata valores em cêntimos no formato monetário usado nos exportadores. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Valor formatado em euros a partir de cêntimos.
- `exportTrialBalanceXlsx(trialBalance)` (exportada; função) - Exporta balancete para XLSX real. Entradas: `trialBalance`: Resultado de `buildTrialBalance`. Devolve: Ficheiro XLSX.
- `exportLedgerPdf(ledger)` (exportada; função) - Exporta razão para PDF real. Entradas: `ledger`: Resultado de `buildLedger`. Devolve: Ficheiro PDF.

### `real_dev/api/src/modules/accounting-reports/accountingReportFilters.js`

- `parseDateRange(query)` (exportada; função) - Valida intervalo de datas. Entradas: `query`: Query string Express. Devolve: Intervalo normalizado.

### `real_dev/api/src/modules/accounting-reports/accountingReportRoutes.js`

- `cents(value)` (top-level; função) - Formata valores guardados em cêntimos para exportações humanas. Entradas: `value`: Valor monetário em cêntimos. Devolve: Valor decimal com duas casas.
- `dateOnly(value)` (top-level; função) - Formata datas persistidas para `YYYY-MM-DD`. Entradas: `value`: Data recebida dos services contabilísticos. Devolve: Data ISO curta.
- `trialBalanceRows(trialBalance)` (top-level; função) - Mapeia o balancete autorizado para linhas tabulares exportáveis. Entradas: `trialBalance`: Resultado de `buildTrialBalance`. Devolve: Linhas prontas para CSV/XLSX/PDF.
- `ledgerRows(ledger)` (top-level; função) - Mapeia a razão autorizada para linhas tabulares exportáveis. Entradas: `ledger`: Resultado de `buildLedger`. Devolve: Linhas prontas para CSV/XLSX/PDF.
- `sendFile(res, file)` (top-level; função) - Envia um ficheiro exportado com headers HTTP seguros para download. Entradas: `res`: Resposta Express.; `file`: Ficheiro gerado. Devolve: Resposta HTTP de download.
- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildAccountingReportRoutes({ prisma })` (exportada; função) - Monta as rotas Express dos relatórios contabilísticos com middlewares e tratamento de erro. Entradas: `deps`: Dependências da API. Devolve: Router Express configurado para relatórios contabilísticos.

### `real_dev/api/src/modules/accounting-reports/accountingReportService.js`

- `buildTrialBalance(prisma, input)` (exportada; função) - Constrói balancete por empresa e período. Entradas: `prisma`: Cliente Prisma.; `input`: Filtros. Devolve: Balancete.
- `buildLedger(prisma, input)` (exportada; função) - Constrói razão de uma conta. Entradas: `prisma`: Cliente Prisma.; `input`: Filtros. Devolve: Razão.

### `real_dev/api/src/modules/accounting/accounts/accountController.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `buildAccountController({ prisma })` (exportada; função) - Constrói handlers de contas. Entradas: `deps`: Dependências. Devolve: Handlers.
- `list(req, res)` (método; método) - Lista contas da empresa ativa. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `create(req, res)` (método; método) - Cria uma conta SNC manual para a empresa ativa. O controller valida o código e a natureza da conta antes de delegar a criação. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `importRows(req, res)` (método; método) - Importa linhas de contas já normalizadas. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/accounting/accounts/accountRoutes.js`

- `buildAccountRoutes({ prisma })` (exportada; função) - Constrói o router do plano de contas em `/api/accounting/accounts`. Liga leitura, criação e importação aos guards de autenticação, empresa e permissão. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/accounting/accounts/accountService.js`

- `serialize(account)` (top-level; função) - Serializa conta para resposta pública. Entradas: `account`: Conta Prisma. Devolve: Conta pública.
- `listAccounts(prisma, companyId)` (exportada; função) - Lista contas da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Contas ordenadas por código.
- `createAccount(prisma, companyId, input)` (exportada; função) - Cria uma conta no plano da empresa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `input`: Conta validada. Devolve: Conta criada.
- `importAccountsFromRows(prisma, companyId, rows)` (exportada; função) - Importa várias contas já normalizadas. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `rows`: Linhas de conta validadas. Devolve: Total importado.

### `real_dev/api/src/modules/accounting/accounts/accountValidators.js`

- `validateCode(code)` (top-level; função) - Valida código SNC numérico simples. Entradas: `code`: Código recebido. Devolve: Código normalizado.
- `validateName(name)` (top-level; função) - Valida nome da conta. Entradas: `name`: Nome recebido. Devolve: Nome normalizado.
- `accountLevelFromCode(code)` (top-level; função) - Deriva nível contabilístico a partir do comprimento do código. Entradas: `code`: Código SNC validado. Devolve: Nível derivado.
- `validateAccountPayload(body)` (exportada; função) - Valida uma conta manual ou uma linha de importação. Entradas: `body`: Payload de conta. Devolve: Conta normalizada.
- `validateImportPayload(body)` (exportada; função) - Valida payload de importação com linhas já normalizadas. Entradas: `body`: Payload da importação. Devolve: Linhas validadas.

### `real_dev/api/src/modules/accounting/journalAttachmentStorage.js`

- `safeFileName(fileName)` (top-level; função) - Sanitiza o nome original do ficheiro para o tornar seguro dentro da storage key. Entradas: `fileName`: Nome original do ficheiro. Devolve: Nome de ficheiro sanitizado.
- `decodeBase64Content(input)` (top-level; função) - Normaliza e valida conteúdo Base64 antes de criar o Buffer do anexo. Entradas: `input`: Dados de entrada recebidos para validação ou normalização. Devolve: Buffer com o conteúdo Base64 validado.
- `hasPdfSignature(fileBuffer)` (top-level; função) - Verifica a assinatura binária mínima de um ficheiro PDF. Entradas: `fileBuffer`: Conteúdo binário do ficheiro. Devolve: Booleano que indica se o ficheiro aparenta ser PDF.
- `hasPngSignature(fileBuffer)` (top-level; função) - Verifica a assinatura binária completa de um ficheiro PNG. Entradas: `fileBuffer`: Conteúdo binário do ficheiro. Devolve: Booleano que indica se o ficheiro aparenta ser PNG.
- `hasJpegSignature(fileBuffer)` (top-level; função) - Verifica a assinatura binária mínima de um ficheiro JPEG. Entradas: `fileBuffer`: Conteúdo binário do ficheiro. Devolve: Booleano que indica se o ficheiro aparenta ser JPEG.
- `validateAttachmentSignature(mimeType, fileBuffer)` (top-level; função) - Compara MIME type declarado com assinatura binária para rejeitar uploads mascarados. Entradas: `mimeType`: Tipo MIME declarado pelo cliente.; `fileBuffer`: Conteúdo binário do ficheiro. Devolve: Não devolve valor; lança erro se a assinatura não corresponder ao MIME type.
- `resolveStoragePath(storageRoot, storageKey)` (top-level; função) - Resolve uma storage key dentro da raiz privada e bloqueia tentativas de path traversal. Entradas: `storageRoot`: Raiz privada onde os anexos são guardados.; `storageKey`: Chave privada do ficheiro no armazenamento. Devolve: Caminho absoluto validado dentro da raiz privada.
- `parseJournalAttachment(input)` (exportada; função) - Valida ficheiro de anexo e gera storage key privada. Entradas: `input`: Payload JSON. Devolve: Anexo normalizado.
- `storeJournalAttachmentFile(storageKey, fileBuffer, storageRoot)` (exportada; função) - Guarda bytes do anexo fora de pastas públicas. Entradas: `storageKey`: Chave privada persistida no modelo.; `fileBuffer`: Conteúdo validado.; `storageRoot`: Raiz privada de armazenamento. Devolve: Caminho absoluto escrito.
- `removeJournalAttachmentFile(storageKey, storageRoot)` (exportada; função) - Remove ficheiro privado quando a persistência dos metadados falha. Entradas: `storageKey`: Chave privada persistida no modelo.; `storageRoot`: Raiz privada de armazenamento. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/accounting/manualJournalRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildManualJournalRoutes({ prisma })` (exportada; função) - Monta as rotas Express de lançamentos manuais, incluindo anexos privados. Entradas: `deps`: Dependências backend usadas para montar guards e services contabilísticos. Devolve: Router Express configurado para lançamentos manuais e anexos privados.

### `real_dev/api/src/modules/accounting/manualJournalService.js`

- `parseManualJournal(input)` (exportada; função) - Valida lançamento manual equilibrado. Entradas: `input`: Payload JSON. Devolve: Lançamento normalizado.
- `assertAccountsBelongToCompany(tx, companyId, lines)` (top-level; função) - Garante que todas as contas usadas num lançamento pertencem à empresa ativa antes de gravar movimentos. Entradas: `tx`: Transação Prisma usada pela operação.; `companyId`: Identificador da empresa ativa.; `lines`: Linhas de negócio a validar ou agregar. Devolve: Promise resolvida quando todas as contas pertencem à empresa.
- `createManualJournal(prisma, companyId, userId, input)` (exportada; função) - Cria um lançamento manual equilibrado dentro da empresa ativa. A função valida período fiscal, contas usadas e anexo antes de gravar movimentos. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `input`: Payload JSON. Devolve: Lançamento criado.
- `getManualJournal(prisma, companyId, id)` (exportada; função) - Consulta lançamento manual da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `id`: Lançamento. Devolve: Lançamento.
- `updateManualJournal(prisma, companyId, userId, id, input)` (exportada; função) - Edita lançamento manual e substitui linhas. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Lançamento.; `input`: Payload JSON. Devolve: Lançamento atualizado.
- `addManualJournalAttachment(prisma, companyId, userId, id, input, options)` (exportada; função) - Regista anexo privado em lançamento manual. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Lançamento.; `input`: Payload JSON.; `options`: Opções internas/testes. Devolve: Anexo criado.

### `real_dev/api/src/modules/accounting/purchasePostingRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildPurchasePostingRoutes({ prisma })` (exportada; função) - Constrói o router de contabilização automática de compras. Expõe a ação protegida que transforma uma compra aprovada em lançamento contabilístico. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/accounting/purchasePostingService.js`

- `assertBalanced(lines)` (top-level; função) - Garante que um lançamento contabilístico tem débitos e créditos iguais. Se a soma não fechar, a função interrompe a contabilização com erro interno de domínio. Entradas: `lines`: Linhas contabilísticas. Devolve: Valor documentado como `void`.
- `accountByCode(tx, companyId, code)` (top-level; função) - Resolve conta ativa pelo código SNC simplificado definido no BK. Entradas: `tx`: Cliente/transação Prisma.; `companyId`: Empresa ativa.; `code`: Código da conta. Devolve: Conta ativa.
- `recordPurchasePostingAudits(tx, companyId, userId, document, entry)` (top-level; função) - Regista a auditoria contabilística e a auditoria de workflow da compra. Entradas: `tx`: Cliente/transação Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `document`: Documento de compra contabilizado.; `entry`: Lançamento contabilístico criado. Devolve: Valor documentado como `void`.
- `postPurchaseDocumentInTransaction(tx, companyId, userId, purchaseDocumentId)` (exportada; função) - Contabiliza compra dentro de uma transação já aberta. Entradas: `tx`: Transação Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `purchaseDocumentId`: Documento de compra. Devolve: Lançamento criado.
- `postPurchaseDocument(prisma, companyId, userId, purchaseDocumentId)` (exportada; função) - Cria lançamento contabilístico automático de compra. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `purchaseDocumentId`: Documento de compra. Devolve: Lançamento criado.

### `real_dev/api/src/modules/accounting/salePostingRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildSalePostingRoutes({ prisma })` (exportada; função) - Constrói o router de contabilização automática de vendas. Expõe a ação protegida que transforma uma venda emitida em lançamento contabilístico. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/accounting/salePostingService.js`

- `assertBalanced(lines)` (top-level; função) - Garante que o lançamento fica debitado e creditado pelo mesmo valor. Entradas: `lines`: Linhas contabilísticas. Devolve: Valor documentado como `void`.
- `accountByCode(tx, companyId, code)` (top-level; função) - Resolve conta ativa pelo código SNC simplificado definido no BK. Entradas: `tx`: Cliente/transação Prisma.; `companyId`: Empresa ativa.; `code`: Código da conta. Devolve: Conta ativa.
- `postSaleDocument(prisma, companyId, userId, saleDocumentId)` (exportada; função) - Cria lançamento contabilístico automático de venda. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `saleDocumentId`: Documento de venda. Devolve: Lançamento criado.

### `real_dev/api/src/modules/ai/aiGovernancePolicy.js`

- `normalizeActionType(actionType)` (top-level; função) - Normaliza tipos de acao internos antes de aplicar a denylist de RNF32. Entradas: `actionType`: Tipo de acao calculado pela IA. Devolve: Tipo normalizado para comparacao e persistencia.
- `assertAiRecommendationOnly(suggestion)` (exportada; função) - Confirma que uma sugestao de IA continua a ser apenas recomendacao humana. Entradas: `suggestion`: Sugestao calculada pela IA. Devolve: `actionType` normalizado e seguro para persistir.

### `real_dev/api/src/modules/ai/aiRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro HTTP normalizado. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `sendSse(res, event, data)` (top-level; função) - Emite um evento SSE sem expor argumentos internos das tools. Entradas: resposta, tipo e payload seguro. Devolve: escrita no stream.
- `buildAiRoutes({ prisma, apiEnv, redisClient, providerOverride })` (exportada; função) - Monta as APIs canónicas de análise, lifecycle, settings, consentimento e chat, além do adapter depreciado `/questions`. Aplica autenticação, empresa ativa, permissões e roles. Entradas: dependências da API. Devolve: Router Express configurado sem chamar providers no arranque.

### `real_dev/api/src/modules/ai/aiAnalysisService.js`

- `AI_RULE_REGISTRY` (exportada; constante) - Registo versionado das regras determinísticas, thresholds seguros, score e prioridade.
- `createAnalysisRun(prisma, input)` (exportada; função) - Cria um run manual ou de sistema em `QUEUED`, sempre limitado à empresa autenticada.
- `getAnalysisRun(prisma, input)` (exportada; função) - Consulta estado e resumo seguro de um run da empresa ativa.
- `claimNextAnalysisRun(prisma, workerId)` (exportada; função) - Reclama atomicamente o próximo run para impedir processamento concorrente duplicado.
- `processAnalysisRun(prisma, run)` (exportada; função) - Executa métricas e regras, atualiza fingerprints e ocorrências, resolve riscos desaparecidos e fecha o run.
- `listAiRecords(prisma, model, input)` (exportada; função) - Lista insights, sugestões ou alertas com paginação e ordenação por score/prioridade.
- `updateAiRecordStatus(prisma, model, input)` (exportada; função) - Atualiza lifecycle, feedback e motivo dentro das transições autorizadas.
- `getAiSettings(prisma, companyId)` (exportada; função) - Devolve opt-in, quotas e regras da empresa.
- `updateAiSettings(prisma, input)` (exportada; função) - Permite ao `ADMIN` alterar opt-in, quotas e thresholds dentro de limites seguros.

### `real_dev/api/src/modules/ai/aiAnalysisWorker.js`

- `enqueueHourlyCompanyRuns(prisma, now)` (exportada; função) - Agenda idempotentemente análises horárias para as empresas.
- `runAiAnalysisWorkerCycle(prisma, aiConfig, options)` (exportada; função) - Agenda, reclama e processa um batch de runs e elimina sessões de chat expiradas.

### `real_dev/api/src/modules/ai/aiChatCrypto.js`

- `parseAiChatEncryptionKey(value)` (exportada; função) - Valida que a chave própria do chat representa 32 bytes e falha fechado quando falta.
- `encryptAiChatPayload(payload, encryptionKey)` (exportada; função) - Cifra conteúdo, fontes, resumo e aliases em envelope AES-256-GCM.
- `decryptAiChatPayload(envelope, encryptionKey)` (exportada; função) - Autentica e decifra um envelope sem aceitar conteúdo adulterado.
- `hashDeletedSessionId(sessionId, encryptionKey)` (exportada; função) - Produz o HMAC minimizado usado na auditoria de hard-delete.
- `createSafetyIdentifier(userId, hmacKey)` (exportada; função) - Deriva o `safety_identifier` sem email ou username.

### `real_dev/api/src/modules/ai/aiChatProvider.js`

- `AI_CHAT_OUTPUT_SCHEMA` (exportada; constante) - JSON Schema estrito apenas para `status`, narrativa qualitativa, limitações e follow-ups.
- `AiChatProvider` (exportada; classe) - Interface mínima comum para providers de chat.
- `FakeProvider` (exportada; classe) - Provider determinístico usado em testes sem rede nem dados reais.
- `OpenAiProvider` (exportada; classe) - Implementa Responses API com `store: false`, streaming, function tools estritas e Structured Output.
- `createAiChatProvider(aiConfig, override)` (exportada; função) - Seleciona provider desativado, OpenAI ou override de testes sem efetuar chamada externa.

### `real_dev/api/src/modules/ai/aiChatService.js`

- `classifyChatIntent(question)` (exportada; função) - Classifica apenas cashflow, recebimentos, stock, margem, KPIs, comparação e explicação de insight; pedidos fora do âmbito são recusados.
- `createChatSession`, `listChatSessions`, `listChatMessages` (exportadas; funções) - Gerem histórico cifrado isolado por empresa e utilizador.
- `deleteChatSession` e `purgeExpiredChatSessions` (exportadas; funções) - Fazem hard-delete manual ou após retenção e guardam só auditoria minimizada.
- `getConsent`, `acceptConsent` e `revokeConsent` (exportadas; funções) - Gerem consentimento individual por empresa e versão de política.
- `validateProviderClaims(response, toolResults, aliasMap)` (exportada; função) - Confirma que valores e referências da resposta existem nos resultados estruturados das tools.
- `sendChatMessage(prisma, aiConfig, provider, input)` (exportada; função) - Orquestra quotas atómicas, lock, classificação/tool local única, factos backend, provider qualitativo, cancelamento, fallback, cifragem e telemetria.
- `setChatMessageFeedback(prisma, input)` (exportada; função) - Regista apenas `USEFUL` ou `NOT_USEFUL`, sem comentário livre.

### `real_dev/api/src/modules/ai/aiMetricCatalog.js`

- `AI_TIMEZONE` e `AI_TOOL_NAMES` (exportadas; constantes) - Definem `Europe/Lisbon` e o catálogo fechado de sete tools read-only.
- `toAiLocalDateKey(date)` e `zonedDateBoundary(dateText, options)` (exportadas; funções) - Normalizam dias e limites no timezone operacional.
- `validateMetricPeriod(args)` (exportada; função) - Exige `from`/`to`, limita a 366 dias e valida `topN <= 10`.
- `weightedAverageDays(events, dateField, documentField)` (exportada; função) - Calcula PMR/PMP ponderado por valores efetivamente recebidos ou pagos, incluindo parciais.
- `calculateAccountingMargin(lines)` (exportada; função) - Calcula receita, gastos, resultado e margem por classes SNC; devolve EBITDA apenas quando há classificação suficiente.
- `executeAiTool(prisma, input)` (exportada; função) - Executa uma tool autorizada na empresa ativa e devolve métricas, fórmula, período, cobertura, qualidade, limitações e `sourceRefs`.
- `AI_FUNCTION_TOOLS` (exportada; constante) - Schemas estritos expostos ao provider; não contêm Prisma, SQL ou IDs reais.

### `real_dev/api/src/modules/ai/aiPrivacy.js`

- `pseudonymizeUserText(prisma, input)` (exportada; função) - Substitui entidades conhecidas por aliases limitados à sessão antes de uma chamada externa.
- `pseudonymizeToolResult(value, aliasMap)` (exportada; função) - Remove labels e IDs reais dos resultados e limita referências enviadas.
- `assertOutboundAiSafe(payload)` (exportada; função) - Bloqueia emails, NIF, IBAN, telefone, morada, credenciais, documentos, anexos, SAF-T e instruções de exfiltração.

### `real_dev/api/src/modules/ai/aiService.js`

Este módulo mantém a geração MF4 anterior e a explicação de insights necessária à compatibilidade. A arquitetura canónica nova usa `aiAnalysisService.js`, `aiMetricCatalog.js` e `aiChatService.js`; `answerAiQuestion` não é o caminho usado pelo chat `/ai/chat`.

- `bps(numerator, denominator)` (top-level; função) - Cria percentagem em pontos base protegida contra divisao por zero. Entradas: `numerator`: Numerador em centimos ou unidades.; `denominator`: Denominador em centimos ou unidades. Devolve: Percentagem em pontos base, ou null sem base.
- `eur(cents)` (top-level; função) - Converte cêntimos em texto EUR simples para mensagens explicáveis. Entradas: `cents`: Valor monetário em cêntimos. Devolve: Valor formatado para leitura humana.
- `quantityText(value)` (top-level; função) - Formata quantidades sem acrescentar casas decimais artificiais. Entradas: `value`: Quantidade calculada. Devolve: Quantidade pronta para mensagens.
- `stockAlertSourceId(alert)` (top-level; função) - Cria um identificador estavel para alertas calculados pela MF2. Entradas: `alert`: Alerta de stock. Devolve: Identificador explicito da fonte.
- `stockAlertToInsight(companyId, alert)` (top-level; função) - Converte alertas reais de stock em candidatos de insight MF4. Entradas: `companyId`: Empresa ativa.; `alert`: Alerta calculado pela MF2. Devolve: Candidato de insight, ou null quando fora do escopo MF4.
- `stockAlertToSmartAlert(companyId, alert)` (top-level; função) - Converte alertas reais de stock em smart alerts MF4. Entradas: `companyId`: Empresa ativa.; `alert`: Alerta calculado pela MF2. Devolve: Candidato de smart alert.
- `suggestionActionType(insight)` (top-level; função) - Escolhe o tipo de sugestao sem executar a acao automaticamente. Entradas: `insight`: Insight persistido. Devolve: Tipo de acao sugerida.
- `sourceKey(insight)` (top-level; função) - Cria uma chave de upsert coerente com a unique constraint do Prisma. Entradas: `insight`: Insight ou alerta com campos de fonte. Devolve: Chave composta Prisma.
- `assertExplainableInsight(insight)` (exportada; função) - Valida o contrato minimo de explicabilidade exigido por RNF31. Entradas: `insight`: Insight candidato ou persistido. Devolve: Valor documentado como `void`.
- `buildInsightCandidates(prisma, input)` (top-level; função) - Gera insights candidatos a partir de relatórios, clientes e stock. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto autenticado. Devolve: Lista de candidatos explicáveis.
- `generateAiInsights(prisma, input)` (exportada; função) - Gera e persiste insights idempotentes por fonte. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto autenticado. Devolve: Insights persistidos.
- `explainAiInsight(prisma, input)` (exportada; função) - Devolve uma explicacao segura de um insight da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto e identificador. Devolve: Explicacao e fontes.
- `generateAiSuggestions(prisma, input)` (exportada; função) - Cria sugestoes de acao a partir de insights persistidos e fontes validadas. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto autenticado. Devolve: Sugestoes abertas com metadados de qualidade da fonte.
- `answerAiQuestion(prisma, input)` (exportada; função legada) - Mantém compatibilidade histórica MF4. O endpoint público depreciado `/api/ai/questions` já encaminha para o serviço canónico de chat.
- `generateSmartAlerts(prisma, input)` (exportada; função) - Gera alertas inteligentes de tesouraria e ruturas sem alterar saldos. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto autenticado. Devolve: Alertas persistidos.

### `real_dev/api/src/modules/ai/aiSourceGuardrails.js`

- `cleanText(value)` (top-level; função) - Normaliza texto tecnico recebido de insights ou sugestoes. Entradas: `value`: Valor a normalizar. Devolve: Texto aparado, ou string vazia quando nao for texto.
- `classifyAiSourceQuality(input)` (exportada; função) - Classifica a qualidade da fonte usada por uma sugestao de IA. Entradas: `input`: Sugestao candidata ja filtrada pelo backend. Devolve: Metadados publicos de qualidade.
- `assertAiSourceQuality(input)` (exportada; função) - Bloqueia sugestoes sem fonte real e devolve metadados para a API/UI. Entradas: `input`: Sugestao candidata. Devolve: Resultado de qualidade.

### `real_dev/api/src/modules/ai/aiValidators.js`

Os validadores deste ficheiro permanecem para compatibilidade MF4. Os períodos e argumentos das ferramentas canónicas são validados por `validateMetricPeriod` e pelo JSON Schema estrito do catálogo.

- `parseIsoDate(value, field)` (top-level; função) - Normaliza datas ISO curtas recebidas por query string. Entradas: `value`: Valor recebido no pedido HTTP.; `field`: Nome do campo usado na mensagem de erro. Devolve: Data validada em UTC.
- `inclusiveDays(fromDate, toDate)` (top-level; função) - Calcula dias inclusivos para alinhar validacao com os relatórios MF3. Entradas: `fromDate`: Data inicial.; `toDate`: Data final. Devolve: Numero inclusivo de dias.
- `validateInsightRange(query)` (exportada; função) - Valida um intervalo de consulta usado por insights e alertas. Entradas: `query`: Query string Express. Devolve: Datas normalizadas.
- `validateQuestionPayload(body)` (exportada; função) - Classifica uma pergunta em linguagem natural num conjunto fechado de intencoes de leitura. Entradas: `body`: Corpo recebido no endpoint de perguntas. Devolve: Pergunta normalizada e intencao.

### `real_dev/api/src/modules/audit/auditLogRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro HTTP normalizado. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta enviada.
- `buildAuditLogRoutes({ prisma })` (exportada; função) - Monta rota de auditoria. Entradas: `deps`: Dependencias. Devolve: Router Express.

### `real_dev/api/src/modules/audit/auditLogService.js`

- `sanitizeDetails(details)` (top-level; função) - Remove campos sensiveis de detalhes antes de expor logs na API. Entradas: `details`: Detalhes persistidos no AuditLog. Devolve: Detalhes minimizados.
- `recordAuditLog(prisma, input)` (exportada; função) - Regista auditoria sensivel de forma centralizada. Entradas: `prisma`: Cliente ou transacao Prisma.; `input`: Dados de auditoria. Devolve: Log criado.
- `assertSensitiveAction(action)` (top-level; função) - Confirma se a acao pertence ao contrato sensivel de MF6. Entradas: `action`: Acao funcional a auditar. Devolve: Valor documentado como `void`.
- `assertSafeDetails(details)` (top-level; função) - Impede guardar payloads completos ou credenciais em detalhes de auditoria. Entradas: `details`: Detalhes minimos da operacao. Devolve: Detalhes aprovados.
- `recordSensitiveAudit(prisma, input)` (exportada; função) - Regista uma operacao sensivel usando o contrato AuditLog da MF4. Entradas: `prisma`: Cliente ou transacao Prisma.; `input`: Dados minimos. Devolve: Log criado.
- `listAuditLogs(prisma, input)` (exportada; função) - Lista logs de auditoria da empresa ativa com detalhes minimizados. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto. Devolve: Logs de auditoria.

### `real_dev/api/src/modules/auth/authController.js`

- `getOptionalCompanyContext(prisma, session)` (top-level; função) - Obtém contexto opcional de empresa ativa para `GET /auth/me`. Entradas: `prisma`: Cliente Prisma.; `session`: Sessão segura. Devolve: Contexto ativo ou `null`.
- `sendError(res, error)` (top-level; função) - Envia uma resposta de erro JSON no formato canónico da API. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON enviada.
- `buildAuthController({ prisma, isProduction })` (exportada; função) - Constrói handlers de autenticação com dependências injetadas. Entradas: `deps`: Dependências backend do controller. Devolve: Handlers Express.
- `register(req, res)` (método; método) - Regista utilizador e cria cookie HttpOnly. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `login(req, res)` (método; método) - Autentica utilizador e cria cookie HttpOnly. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `me(req, res)` (método; método) - Devolve o utilizador autenticado da sessão atual. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `logout(req, res)` (método; método) - Revoga a sessão atual e limpa o cookie. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/auth/authMiddleware.js`

- `requireAuth(prisma)` (exportada; função) - Cria middleware Express que exige sessão válida. Entradas: `prisma`: Cliente Prisma. Devolve: Middleware Express.

### `real_dev/api/src/modules/auth/authRateLimit.js`

- `assertAuthRateLimit(key, { now, isProduction })` (exportada; função) - Bloqueia excesso de pedidos de autenticação para uma chave funcional. Entradas: `key`: Chave composta, por exemplo endpoint + IP + email.; `options`: Opções de execução do rate limit. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/auth/authRoutes.js`

- `buildAuthRoutes({ prisma, isProduction, appBaseUrl })` (exportada; função) - Constrói o router `/api/auth`. Entradas: `deps`: Dependências backend do router. Devolve: Router Express configurado.

### `real_dev/api/src/modules/auth/authService.js`

- `createSessionId()` (top-level; função) - Gera um identificador de sessão opaco e imprevisível. Entradas: sem entradas explícitas Devolve: Identificador hexadecimal com entropia suficiente para sessão.
- `publicUser(user)` (top-level; função) - Remove campos sensíveis do modelo `User`. Entradas: `user`: Utilizador Prisma. Devolve: Utilizador seguro para resposta JSON.
- `publicSession(session)` (top-level; função) - Remove relações e campos que não devem circular fora do service. Entradas: `session`: Sessão Prisma. Devolve: Sessão segura.
- `createSession(prisma, userId, now)` (top-level; função) - Cria uma sessão server-side para o utilizador autenticado. Entradas: `prisma`: Cliente Prisma.; `userId`: Identificador do utilizador.; `now`: Data atual injetável para testes. Devolve: Sessão persistida.
- `registerUser(prisma, input, now)` (exportada; função) - Regista um novo utilizador e cria sessão inicial. Entradas: `prisma`: Cliente Prisma.; `input`: Dados validados.; `now`: Data atual injetável para testes. Devolve: Resultado seguro.
- `loginUser(prisma, input, now)` (exportada; função) - Autentica um utilizador existente e cria nova sessão. Entradas: `prisma`: Cliente Prisma.; `input`: Credenciais validadas.; `now`: Data atual injetável para testes. Devolve: Resultado seguro.
- `resolveSession(prisma, sessionId, now)` (exportada; função) - Resolve e valida uma sessão a partir do identificador do cookie. Entradas: `prisma`: Cliente Prisma.; `sessionId`: Valor do cookie `sid`.; `now`: Data atual injetável para testes. Devolve: Sessão e utilizador seguros.
- `logoutUser(prisma, sessionId, now)` (exportada; função) - Revoga a sessão atual. Entradas: `prisma`: Cliente Prisma.; `sessionId`: Valor do cookie `sid`.; `now`: Data de revogação. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/auth/authValidators.js`

- `asObject(body)` (top-level; função) - Garante que o body recebido é um objeto JSON simples. Entradas: `body`: Corpo recebido pelo Express. Devolve: Objeto validado.
- `normalizeEmail(email)` (top-level; função) - Normaliza e valida um email. Entradas: `email`: Valor recebido no payload. Devolve: Email em minúsculas, pronto para persistência/consulta.
- `validatePassword(password)` (top-level; função) - Valida a política mínima de password definida para a MF0. Entradas: `password`: Password recebida no payload. Devolve: Password validada para hash/comparação.
- `validateLoginPassword(password)` (top-level; função) - Valida apenas a presença da password no login. A política de força aplica-se ao registo e ao reset. No login, uma password curta pode simplesmente estar errada; devolver `WEAK_PASSWORD` revelaria uma validação que o contrato do BK-MF0-01 reserva para criação/alteração. Entradas: `password`: Password recebida no payload. Devolve: Password recebida para comparação segura no service.
- `validateRegisterPayload(body)` (exportada; função) - Valida e normaliza o payload de registo. Entradas: `body`: Corpo JSON do pedido `POST /api/auth/register`. Devolve: Payload normalizado.
- `validateLoginPayload(body)` (exportada; função) - Valida e normaliza o payload de login. Entradas: `body`: Corpo JSON do pedido `POST /api/auth/login`. Devolve: Payload normalizado.

### `real_dev/api/src/modules/auth/password.js`

- `hashPassword(password)` (exportada; função) - Gera um hash bcrypt com salt seguro para a password recebida. Entradas: `password`: Password em texto claro recebida apenas em memória. Devolve: Hash bcrypt persistível na base de dados.
- `verifyPassword(password, passwordHash)` (exportada; função) - Compara uma password em texto claro com o hash guardado. Entradas: `password`: Password fornecida pelo utilizador no login/reset.; `passwordHash`: Hash bcrypt guardado na base de dados. Devolve: `true` quando a password corresponde ao hash.

### `real_dev/api/src/modules/auth/passwordResetController.js`

- `sendError(res, error)` (top-level; função) - Envia uma resposta de erro JSON no formato canónico. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `buildPasswordResetController({ prisma, emailAdapter, isProduction })` (exportada; função) - Constrói handlers de recuperação de password. Entradas: `deps`: Dependências backend do controller. Devolve: Handlers Express.
- `forgot(req, res)` (método; método) - Pede recuperação de password com resposta anti-enumeration. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `reset(req, res)` (método; método) - Define nova password a partir de token válido. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/auth/passwordResetEmailAdapter.js`

- `buildPasswordResetUrl({ appBaseUrl, token })` (top-level; função) - Constrói a URL privada enviada apenas ao destinatário. Entradas: `input`: Base pública e segredo temporário. Devolve: URL de recuperação.
- `buildPasswordResetEmailAdapter({ appBaseUrl, provider, logger })` (exportada; função) - Cria adapter de email para recuperação de password. Entradas: `options`: Configuração backend do adapter. Devolve: Adapter assíncrono.
- `sendPasswordReset({ email, token })` (método; método) - Envia pedido de recuperação mantendo o segredo fora dos logs. Entradas: `payload`: Destino e token bruto. Devolve: Resultado do adapter transaccional.

### `real_dev/api/src/modules/auth/passwordResetRateLimit.js`

- `assertPasswordResetRateLimit(key, { now, isProduction })` (exportada; função) - Bloqueia pedidos excessivos de recuperação para a mesma chave. Entradas: `key`: Chave composta, por exemplo IP + email normalizado.; `options`: Opções de execução do rate limit. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/auth/passwordResetService.js`

- `createToken()` (top-level; função) - Gera token bruto para link de recuperação. Entradas: sem entradas explícitas Devolve: Token secreto em hexadecimal.
- `hashToken(token)` (top-level; função) - Gera hash SHA-256 do token para persistência segura. Entradas: `token`: Token bruto enviado por email. Devolve: Hash do token.
- `requestPasswordReset(prisma, emailAdapter, { email, now })` (exportada; função) - Cria token de recuperação sem revelar se o email existe. Entradas: `prisma`: Cliente Prisma.; `emailAdapter`: Adapter de email.; `input`: Email normalizado e data opcional. Devolve: Resposta genérica anti-enumeration.
- `resetPassword(prisma, { token, password, now })` (exportada; função) - Valida token de recuperação, altera password e revoga sessões antigas. Entradas: `prisma`: Cliente Prisma.; `input`: Token e nova password. Devolve: Resposta genérica de sucesso.

### `real_dev/api/src/modules/auth/passwordResetValidators.js`

- `normalizeEmail(email)` (top-level; função) - Normaliza e valida email para pedido de recuperação. Entradas: `email`: Valor recebido no payload. Devolve: Email normalizado.
- `normalizeToken(token)` (top-level; função) - Normaliza e valida token recebido no link de recuperação. Entradas: `token`: Token recebido no payload. Devolve: Token normalizado.
- `validateNewPassword(password)` (top-level; função) - Valida a nova password antes de gerar hash. Entradas: `password`: Nova password recebida no payload. Devolve: Password validada.
- `validateForgotPasswordPayload(body)` (exportada; função) - Valida payload de pedido de recuperação. Entradas: `body`: Corpo JSON do pedido. Devolve: Payload normalizado.
- `validateResetPasswordPayload(body)` (exportada; função) - Valida payload de reposição de password. Entradas: `body`: Corpo JSON do pedido. Devolve: Payload normalizado.

### `real_dev/api/src/modules/auth/sessionCookie.js`

- `buildSessionCookieOptions(isProduction)` (exportada; função) - Constroi opcoes comuns de cookie para escrita e limpeza. Entradas: `isProduction`: Indica se o atributo `secure` deve estar ativo. Devolve: Opcoes Express.
- `setSessionCookie(res, sessionId, isProduction)` (exportada; função) - Escreve o cookie de sessão na resposta HTTP. Entradas: `res`: Resposta Express.; `sessionId`: Identificador opaco da sessão server-side.; `isProduction`: Indica se o atributo `secure` deve estar ativo. Devolve: Valor documentado como `void`.
- `clearSessionCookie(res, isProduction)` (exportada; função) - Remove o cookie de sessão do browser. Entradas: `res`: Resposta Express.; `isProduction`: Indica se o atributo `secure` deve estar ativo. Devolve: Valor documentado como `void`.
- `readSessionCookie(req)` (exportada; função) - Lê manualmente o cookie `sid` do header HTTP. Entradas: `req`: Pedido Express. Devolve: Valor do cookie quando existe; caso contrário `null`.

### `real_dev/api/src/modules/companies/companyContext.js`

- `requireCompanyContext(prisma)` (exportada; função) - Exige empresa ativa e injeta `companyId`, `role` e `company` no request. Entradas: `prisma`: Cliente Prisma. Devolve: Middleware Express.

### `real_dev/api/src/modules/companies/companyController.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `buildCompanyController({ prisma })` (exportada; função) - Constrói handlers HTTP para contexto multiempresa. Os handlers listam empresas, trocam a empresa ativa e devolvem o contexto atual da sessão. Entradas: `deps`: Dependências. Devolve: Handlers.
- `list(req, res)` (método; método) - Lista empresas acessíveis ao utilizador autenticado. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `switchCompany(req, res)` (método; método) - Troca a empresa ativa da sessão atual. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `context(req, res)` (método; método) - Devolve a empresa ativa atual. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/companies/companyRoutes.js`

- `buildCompanyRoutes({ prisma })` (exportada; função) - Constrói rotas montadas em `/api`. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/companies/companyService.js`

- `publicCompanyMembership(membership)` (top-level; função) - Serializa uma membership para o contrato público do contexto de empresa. Entradas: `membership`: Membership Prisma com empresa incluída. Devolve: Contexto público.
- `listUserCompanies(prisma, userId)` (exportada; função) - Lista empresas onde o utilizador tem membership ativa. Entradas: `prisma`: Cliente Prisma.; `userId`: Utilizador autenticado. Devolve: Empresas acessíveis.
- `switchActiveCompany(prisma, { sessionId, userId, companyId })` (exportada; função) - Define a empresa ativa na sessão atual. Entradas: `prisma`: Cliente Prisma.; `input`: Dados de sessão e empresa. Devolve: Contexto ativo.
- `getCompanyContext(prisma, { userId, companyId })` (exportada; função) - Resolve o contexto de empresa ativa da sessão. Entradas: `prisma`: Cliente Prisma.; `input`: Utilizador e empresa ativa. Devolve: Contexto validado.

### `real_dev/api/src/modules/companies/companyValidators.js`

- `validateSwitchCompanyPayload(body)` (exportada; função) - Valida payload de troca de empresa ativa. Entradas: `body`: Corpo JSON do pedido. Devolve: Payload normalizado.

### `real_dev/api/src/modules/company-profile/companyProfileController.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `serialize(profile)` (top-level; função) - Serializa o perfil para resposta pública. Entradas: `profile`: Perfil Prisma. Devolve: Perfil sem metadados técnicos.
- `buildCompanyProfileController({ prisma })` (exportada; função) - Constrói handlers do perfil da empresa. Entradas: `deps`: Dependências. Devolve: Handlers.
- `get(req, res)` (método; método) - Devolve perfil da empresa ativa. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `update(req, res)` (método; método) - Cria ou atualiza perfil da empresa ativa. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/company-profile/companyProfileRoutes.js`

- `buildCompanyProfileRoutes({ prisma })` (exportada; função) - Constrói o router do perfil fiscal e operacional da empresa. Centraliza leitura e atualização do perfil sob autenticação e contexto multiempresa. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/company-profile/companyProfileService.js`

- `isUniqueFieldError(error, field)` (top-level; função) - Verifica se um erro Prisma P2002 aponta para o campo indicado. Entradas: `error`: Erro capturado.; `field`: Campo esperado no target Prisma. Devolve: `true` quando é conflito de unicidade nesse campo.
- `getCompanyProfile(prisma, companyId)` (exportada; função) - Obtém o perfil da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Perfil encontrado.
- `upsertCompanyProfile(prisma, companyId, input)` (exportada; função) - Cria ou atualiza o perfil da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `input`: Dados validados do perfil. Devolve: Perfil persistido.

### `real_dev/api/src/modules/company-profile/companyProfileValidators.js`

- `requiredString(value, field)` (top-level; função) - Valida uma string obrigatória e devolve o valor sem espaços laterais. Entradas: `value`: Valor recebido.; `field`: Nome do campo para mensagem de erro. Devolve: String normalizada.
- `optionalString(value)` (top-level; função) - Normaliza uma string opcional. Entradas: `value`: Valor recebido. Devolve: String normalizada ou `null`.
- `validateFiscalDate(month, day)` (top-level; função) - Valida a data fiscal base em mês/dia. Entradas: `month`: Mês fiscal.; `day`: Dia fiscal. Devolve: Data fiscal validada.
- `validateCompanyProfilePayload(body)` (exportada; função) - Valida payload completo de perfil da empresa. Entradas: `body`: Corpo JSON do pedido. Devolve: Payload normalizado para persistência.

### `real_dev/api/src/modules/company-profile/nifValidator.js`

- `isValidPortugueseNif(value)` (exportada; função) - Valida um NIF português com checksum. Entradas: `value`: Valor a validar. Devolve: `true` quando o valor tem 9 dígitos e checksum válido.

### `real_dev/api/src/modules/company-users/companyUserController.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `buildCompanyUserController({ prisma, emailAdapter })` (exportada; função) - Constrói handlers de gestão de membros da empresa. Entradas: `deps`: Dependências. Devolve: Handlers.
- `list(req, res)` (método; método) - Lista membros da empresa ativa. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `invite(req, res)` (método; método) - Cria convite para novo membro. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `updateRole(req, res)` (método; método) - Atualiza role de um membro da empresa. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `remove(req, res)` (método; método) - Remove membership ativa de um utilizador. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/company-users/companyUserRoutes.js`

- `buildCompanyUserRoutes({ prisma, appBaseUrl })` (exportada; função) - Constrói router montado em `/api/company`. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/company-users/companyUserService.js`

- `createToken()` (top-level; função) - Gera token bruto para convite. Entradas: sem entradas explícitas Devolve: Token secreto em hexadecimal.
- `hashToken(token)` (top-level; função) - Gera hash SHA-256 para guardar token de convite. Entradas: `token`: Token bruto. Devolve: Hash do token.
- `assertNotLastAdmin(prisma, { companyId, targetUserId })` (top-level; função) - Impede remover ou alterar o último ADMIN ativo. Entradas: `prisma`: Cliente Prisma.; `input`: Empresa e utilizador alvo. Devolve: Valor documentado como `void`.
- `listCompanyUsers(prisma, companyId)` (exportada; função) - Lista utilizadores da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Membros ativos.
- `inviteUser(prisma, emailAdapter, { companyId, actorUserId, email, role, ... })` (exportada; função) - Cria convite para adicionar utilizador a uma empresa. Entradas: `prisma`: Cliente Prisma.; `emailAdapter`: Adapter de email.; `input`: Dados do convite. Devolve: Convite público.
- `updateCompanyUserRole(prisma, { companyId, actorUserId, targetUserId, role })` (exportada; função) - Atualiza a role de um membro da empresa. Entradas: `prisma`: Cliente Prisma.; `input`: Dados da alteração. Devolve: Role atualizada.
- `removeCompanyUser(prisma, { companyId, targetUserId, actorUserId })` (exportada; função) - Remove acesso de um utilizador à empresa sem apagar a conta global. Entradas: `prisma`: Cliente Prisma.; `input`: Dados de remoção. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/company-users/companyUserValidators.js`

- `normalizeEmail(email)` (top-level; função) - Normaliza e valida email de convite. Entradas: `email`: Valor recebido no payload. Devolve: Email normalizado.
- `normalizeRole(role)` (top-level; função) - Valida uma role canónica RF02. Entradas: `role`: Role recebida no payload. Devolve: Role validada.
- `validateInvitationPayload(body)` (exportada; função) - Valida payload de convite. Entradas: `body`: Corpo JSON do pedido. Devolve: Payload normalizado.
- `validateRolePayload(body)` (exportada; função) - Valida payload de alteração de role. Entradas: `body`: Corpo JSON do pedido. Devolve: Payload normalizado.

### `real_dev/api/src/modules/company-users/invitationEmailAdapter.js`

- `buildInvitationEmailAdapter({ appBaseUrl, logger })` (exportada; função) - Constrói adapter de convite por email. Entradas: `options`: Configuração do adapter. Devolve: Adapter.
- `sendInvitation({ email, companyName, token })` (método; método) - Regista envio de convite para desenvolvimento/evidence. Entradas: `payload`: Dados do convite. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/compliance/retentionDeletionGate.js`

- `assertRequiredString(value, fieldName)` (top-level; função) - Valida texto obrigatorio do contexto backend. Entradas: `value`: Valor recebido.; `fieldName`: Nome funcional usado na mensagem. Devolve: Texto validado.
- `assertAccountingDeletionGate(prisma, input)` (exportada; função) - Valida retencao legal e regista auditoria quando a remocao e autorizada. Entradas: `prisma`: Cliente Prisma ou transacao.; `input`: Contexto destrutivo. Devolve: Resultado autorizado.
- `assertSaleDocumentDeletionAllowed(prisma, input)` (exportada; função) - Gate especifico para documentos de venda. Entradas: `prisma`: Cliente Prisma ou transacao.; `input`: Contexto da remocao. Devolve: Resultado autorizado.
- `assertPurchaseDocumentDeletionAllowed(prisma, input)` (exportada; função) - Gate especifico para documentos de compra. Entradas: `prisma`: Cliente Prisma ou transacao.; `input`: Contexto da remocao. Devolve: Resultado autorizado.
- `assertJournalEntryDeletionAllowed(prisma, input)` (exportada; função) - Gate especifico para lancamentos contabilisticos. Entradas: `prisma`: Cliente Prisma ou transacao.; `input`: Contexto da remocao. Devolve: Resultado autorizado.
- `assertVatMapRunDeletionAllowed(prisma, input)` (exportada; função) - Gate especifico para mapas de IVA. Entradas: `prisma`: Cliente Prisma ou transacao.; `input`: Contexto da remocao. Devolve: Resultado autorizado.
- `assertSaftExportRunDeletionAllowed(prisma, input)` (exportada; função) - Gate especifico para exportacoes SAF-T. Entradas: `prisma`: Cliente Prisma ou transacao.; `input`: Contexto da remocao. Devolve: Resultado autorizado.
- `assertAuditLogDeletionAllowed(prisma, input)` (exportada; função) - Gate especifico para registos de auditoria contabilistica. Entradas: `prisma`: Cliente Prisma ou transacao.; `input`: Contexto da remocao. Devolve: Resultado autorizado.

### `real_dev/api/src/modules/compliance/retentionPolicy.js`

- `assertValidDate(value, fieldName)` (top-level; função) - Valida se o valor recebido e uma data real. Entradas: `value`: Valor a validar.; `fieldName`: Nome funcional usado na mensagem. Devolve: Data validada.
- `assertRequiredString(value, fieldName)` (top-level; função) - Valida texto obrigatorio vindo do backend ou de parametro de rota. Entradas: `value`: Valor recebido.; `fieldName`: Nome funcional usado na mensagem. Devolve: Texto validado.
- `calculateRetainUntil(periodEndAt)` (exportada; função) - Calcula a data em que termina a retencao contabilistica de 10 anos. Entradas: `periodEndAt`: Data contabilistica de referencia. Devolve: Data final da retencao legal.
- `assertRetainedEntity(entity)` (exportada; função) - Garante que a entidade pertence ao conjunto contabilistico protegido. Entradas: `entity`: Nome tecnico da entidade. Devolve: Entidade validada.
- `isRetentionActive(input)` (exportada; função) - Determina se a retencao ainda bloqueia a remocao. Entradas: `input`: Datas da avaliacao. Devolve: Verdadeiro quando a remocao ainda deve ficar bloqueada.
- `assertRetainedRecordDeletionAllowed(prisma, input)` (exportada; função) - Confirma se uma entidade contabilistica pode ser removida. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto da entidade. Devolve: Resultado autorizado.

### `real_dev/api/src/modules/compliance/saftComplianceChecklist.js`

- `assertValidDate(value, fieldName)` (top-level; função) - Garante que o valor recebido e uma data valida. Entradas: `value`: Valor que deve ser uma instancia de Date.; `fieldName`: Nome publico usado na mensagem de erro. Devolve: Data validada.
- `assertNonNegativeInteger(value, fieldName)` (top-level; função) - Normaliza uma contagem interna do exportador SAF-T. Entradas: `value`: Contagem calculada pelo service.; `fieldName`: Nome tecnico da contagem. Devolve: Inteiro seguro para somar.
- `countSaftRows(counts)` (exportada; função) - Soma as linhas que vao alimentar o ficheiro SAF-T. Entradas: `counts`: Contagens do service. Devolve: Total de linhas de negocio disponiveis para exportacao.
- `assertSaftPeriod(period)` (exportada; função) - Valida o periodo pedido para a exportacao SAF-T. Entradas: `period`: Intervalo ja convertido pelo validator. Devolve: Periodo validado.
- `assertSaftProfile(profile)` (exportada; função) - Valida os campos fiscais minimos do perfil da empresa ativa. Entradas: `profile`: Perfil fiscal carregado da base de dados. Devolve: Perfil validado.
- `assertSaftHasRows(counts)` (exportada; função) - Impede gerar SAF-T sem qualquer documento ou lancamento no periodo. Entradas: `counts`: Contagens do service. Devolve: Total validado.
- `assertSaftReadiness(input)` (exportada; função) - Executa a checklist completa antes de gerar o ficheiro SAF-T. Entradas: `input`: Dados preparados pelo service. Devolve: Resultado da readiness check.

### `real_dev/api/src/modules/compliance/saftRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildSaftRoutes({ prisma })` (exportada; função) - Constrói o router de compliance fiscal da API. Liga o endpoint SAF-T aos guards de leitura contabilística e ao service de exportação. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/compliance/saftService.js`

- `escapeXml(value)` (top-level; função) - Escapa caracteres especiais para impedir XML inválido no ficheiro SAF-T gerado. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Texto escapado para ser usado em XML.
- `dateOnly(value)` (top-level; função) - Converte datas para o formato ISO curto exigido nos elementos SAF-T. Entradas: `value`: Data a normalizar. Devolve: Data no formato ISO curto.
- `sourceDocumentsXml(saleDocuments, purchaseDocuments)` (top-level; função) - Gera o bloco XML de documentos comerciais do SAF-T a partir das vendas emitidas. Entradas: `saleDocuments`: Documentos de venda a exportar.; `purchaseDocuments`: Documentos de compra a exportar. Devolve: Bloco XML de documentos comerciais do SAF-T.
- `generalLedgerXml(journalEntries)` (top-level; função) - Gera o bloco XML de movimentos contabilísticos do SAF-T a partir dos lançamentos. Entradas: `journalEntries`: Lancamentos contabilisticos a exportar. Devolve: Bloco XML com lancamentos contabilisticos SAF-T.
- `buildSaftReadinessInput({ input, profile, saleDocuments, purchaseDocuments, ... })` (top-level; função) - Constroi o input de readiness a partir dos dados ja lidos pelo service. Entradas: `params`: Dados internos do exportador. Devolve: Input para a checklist.
- `buildSaftExport(prisma, input)` (exportada; função) - Gera XML SAF-T MVP rastreável e regista a execução. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto autenticado. Devolve: Exportação SAF-T MVP.

### `real_dev/api/src/modules/compliance/saftValidators.js`

- `requiredDate(value, fieldName)` (top-level; função) - Valida datas obrigatórias de filtros e devolve objetos Date consistentes. Entradas: `value`: Valor a normalizar ou formatar.; `fieldName`: Nome do campo usado na mensagem de validação. Devolve: Data obrigatória validada.
- `validateSaftExportQuery(query)` (exportada; função) - Valida intervalo de exportação SAF-T. Entradas: `query`: Query Express. Devolve: Intervalo validado.

### `real_dev/api/src/modules/customers/customerController.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `normalizeSearch(value)` (top-level; função) - Normaliza query string opcional de pesquisa. Entradas: `value`: Valor de `req.query.search`. Devolve: Pesquisa normalizada.
- `buildCustomerController({ prisma })` (exportada; função) - Constrói handlers de clientes. Entradas: `deps`: Dependências. Devolve: Handlers.
- `list(req, res)` (método; método) - Lista clientes ativos da empresa atual. Quando existe pesquisa, delega no service a filtragem por texto para não duplicar regras no controller. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `create(req, res)` (método; método) - Cria um cliente depois de validar o corpo do pedido. O controller transforma o payload externo em input seguro antes de chamar o service. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `update(req, res)` (método; método) - Atualiza um cliente pertencente à empresa ativa. A validação reaproveita o mesmo contrato da criação para manter dados comerciais consistentes. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `remove(req, res)` (método; método) - Desativa um cliente sem apagar o histórico associado. O controller usa o identificador da rota e deixa a proteção multiempresa no service. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/customers/customerRoutes.js`

- `buildCustomerRoutes({ prisma })` (exportada; função) - Constrói o router de clientes em `/api/customers`. Aplica autenticação, empresa ativa e permissões diferentes para leitura e escrita. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/customers/customerService.js`

- `serialize(customer)` (top-level; função) - Serializa cliente para resposta pública. Entradas: `customer`: Cliente Prisma. Devolve: Cliente público.
- `assertUniqueNif(prisma, companyId, nif, ignoreId)` (top-level; função) - Garante unicidade de NIF por empresa quando NIF existe. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `nif`: NIF validado.; `ignoreId`: Cliente a ignorar em updates. Devolve: Valor documentado como `void`.
- `listCustomers(prisma, companyId)` (exportada; função) - Lista clientes ativos da empresa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Clientes ativos.
- `searchCustomers(prisma, companyId, search)` (exportada; função) - Lista clientes ativos, com pesquisa opcional por nome ou NIF. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `search`: Texto de pesquisa opcional. Devolve: Clientes ativos.
- `createCustomer(prisma, companyId, input)` (exportada; função) - Cria cliente na empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `input`: Cliente validado. Devolve: Cliente criado.
- `updateCustomer(prisma, companyId, customerId, input)` (exportada; função) - Atualiza cliente da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `customerId`: Cliente alvo.; `input`: Dados validados. Devolve: Cliente atualizado.
- `deactivateCustomer(prisma, companyId, customerId)` (exportada; função) - Desativa cliente sem apagar histórico. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `customerId`: Cliente alvo. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/customers/customerValidators.js`

- `requiredName(value)` (top-level; função) - Valida o nome obrigatório do cliente. Entradas: `value`: Valor recebido. Devolve: Nome normalizado.
- `optionalString(value)` (top-level; função) - Normaliza um campo textual opcional de cliente. Valores vazios passam a `null` para o service distinguir ausência de texto real. Entradas: `value`: Valor recebido. Devolve: String normalizada ou `null`.
- `optionalNif(value)` (top-level; função) - Valida NIF opcional quando preenchido. Entradas: `value`: Valor recebido. Devolve: NIF validado ou `null`.
- `optionalEmail(value)` (top-level; função) - Valida email opcional quando preenchido. Entradas: `value`: Valor recebido. Devolve: Email normalizado ou `null`.
- `validateCustomerPayload(body)` (exportada; função) - Valida payload de cliente. Entradas: `body`: Corpo JSON do pedido. Devolve: Cliente normalizado.

### `real_dev/api/src/modules/exports/exportFormatService.js`

- `normalizeExportFormat(format)` (exportada; função) - Normaliza o formato pedido pelo cliente. Entradas: `format`: Valor recebido na query string. Devolve: Formato validado.
- `safeExportBaseName(baseName)` (exportada; função) - Cria um nome base seguro para usar no header de download. Entradas: `baseName`: Nome funcional do relatório. Devolve: Nome sem caracteres perigosos.
- `neutralizeSpreadsheetCell(value)` (exportada; função) - Neutraliza valores que folhas de cálculo poderiam interpretar como fórmulas. Entradas: `value`: Valor bruto vindo de linhas já autorizadas. Devolve: Valor seguro para CSV/XLSX.
- `csvCell(value)` (top-level; função) - Serializa uma célula CSV com separador português `;`. Entradas: `value`: Valor seguro para exportação. Devolve: Célula CSV escapada.
- `buildCsvBuffer(columns, rows)` (top-level; função) - Gera um ficheiro CSV com cabeçalhos e linhas normalizadas. Entradas: `columns`: Colunas exportadas.; `rows`: Linhas já autorizadas pelo backend. Devolve: Conteúdo CSV.
- `buildXlsxBuffer(sheetName, columns, rows)` (top-level; função) - Gera um ficheiro XLSX real com colunas estáveis. Entradas: `sheetName`: Nome da folha Excel.; `columns`: Colunas exportadas.; `rows`: Linhas já autorizadas pelo backend. Devolve: Conteúdo XLSX.
- `buildPdfBuffer(title, source, columns, rows)` (top-level; função) - Gera um PDF simples para arquivo/leitura sem alterar dados contabilísticos. Entradas: `title`: Título funcional do relatório.; `source`: Origem de dados usada no service contabilístico.; `columns`: Colunas exportadas.; `rows`: Linhas já autorizadas pelo backend. Devolve: Conteúdo PDF.
- `buildTabularExport(input)` (exportada; função) - Gera ficheiro tabular no formato pedido e devolve metadados HTTP. Entradas: `input`: Pedido de exportação. Devolve: Ficheiro e headers associados.

### `real_dev/api/src/modules/financial-statements/financialStatementRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildFinancialStatementRoutes({ prisma })` (exportada; função) - Monta as rotas Express das demonstrações financeiras com middlewares e tratamento de erro. Entradas: `deps`: Dependências da API. Devolve: Router Express configurado para demonstrações financeiras.

### `real_dev/api/src/modules/financial-statements/financialStatementService.js`

- `sum(rows, mapper)` (top-level; função) - Soma valores numéricos de uma coleção para agregações financeiras. Entradas: `rows`: Linhas de dados a processar.; `mapper`: Função que extrai o valor numérico a somar. Devolve: Soma numérica calculada para o campo indicado.
- `buildIncomeStatement(prisma, input)` (exportada; função) - Demonstração de Resultados interna por período. Entradas: `prisma`: Cliente Prisma.; `input`: Filtros. Devolve: DR interna.
- `buildBalanceSheetFromTrialBalance(trialBalance, input)` (exportada; função) - Constrói Balanço interno a partir de um balancete já calculado. Entradas: `trialBalance`: Balancete de origem.; `input`: Filtros originais. Devolve: Balanço interno.
- `buildBalanceSheet(prisma, input)` (exportada; função) - Balanço interno derivado do balancete. Entradas: `prisma`: Cliente Prisma.; `input`: Filtros. Devolve: Balanço interno.

### `real_dev/api/src/modules/fiscal-periods/fiscalPeriodController.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `buildFiscalPeriodController({ prisma })` (exportada; função) - Constrói handlers de períodos fiscais. Entradas: `deps`: Dependências. Devolve: Handlers.
- `list(req, res)` (método; método) - Lista períodos fiscais da empresa ativa. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `create(req, res)` (método; método) - Cria período fiscal aberto. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `close(req, res)` (método; método) - Fecha período fiscal existente. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/fiscal-periods/fiscalPeriodRoutes.js`

- `buildFiscalPeriodRoutes({ prisma })` (exportada; função) - Constrói o router de períodos fiscais. Expõe listagem, criação e fecho com guards de autenticação, empresa e permissão contabilística. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/fiscal-periods/fiscalPeriodService.js`

- `serialize(period)` (top-level; função) - Serializa período fiscal para resposta pública. Entradas: `period`: Período Prisma. Devolve: Período público.
- `assertNoOverlap(prisma, companyId, startDate, endDate)` (top-level; função) - Garante que não existe sobreposição de períodos para a empresa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `startDate`: Início do período.; `endDate`: Fim do período. Devolve: Valor documentado como `void`.
- `listFiscalPeriods(prisma, companyId)` (exportada; função) - Lista períodos fiscais da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Períodos ordenados.
- `createFiscalPeriod(prisma, companyId, input)` (exportada; função) - Cria período fiscal aberto. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `input`: Dados validados. Devolve: Período criado.
- `closeFiscalPeriod(prisma, { companyId, periodId, actorUserId, now })` (exportada; função) - Fecha período fiscal aberto. Entradas: `prisma`: Cliente Prisma.; `input`: Dados de fecho. Devolve: Período fechado.
- `assertOpenFiscalPeriod(prisma, { companyId, documentDate })` (exportada; função) - Guard reutilizável para impedir documentos em período fechado. Entradas: `prisma`: Cliente Prisma.; `input`: Empresa e data do documento. Devolve: Período aberto encontrado.

### `real_dev/api/src/modules/fiscal-periods/fiscalPeriodValidators.js`

- `parseDateOnly(value, field)` (top-level; função) - Valida e converte uma data ISO simples YYYY-MM-DD. Entradas: `value`: Valor recebido.; `field`: Nome do campo. Devolve: Data em UTC.
- `validateFiscalPeriodPayload(body)` (exportada; função) - Valida payload de criação de período fiscal. Entradas: `body`: Corpo JSON do pedido. Devolve: Payload normalizado.

### `real_dev/api/src/modules/imports/businessImportRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildBusinessImportRoutes({ prisma })` (exportada; função) - Constrói o router de importações comerciais em lote. Protege a criação de dados importados com autenticação, empresa ativa e permissão de escrita. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/imports/businessImportService.js`

- `rowError(rowNumber, error)` (top-level; função) - Cria um erro de importação associado à linha original do ficheiro. Entradas: `rowNumber`: Número original da linha no ficheiro importado.; `error`: Erro capturado durante a operação. Devolve: Erro de importação associado a uma linha.
- `upsertCustomer(tx, companyId, row)` (top-level; função) - Cria ou atualiza um cliente durante importações CSV, preservando a empresa ativa. Entradas: `tx`: Transação Prisma usada pela operação.; `companyId`: Identificador da empresa ativa.; `row`: Linha de dados a processar. Devolve: Cliente criado ou atualizado pela importação.
- `upsertSupplier(tx, companyId, row)` (top-level; função) - Cria ou atualiza um fornecedor durante importações CSV, preservando a empresa ativa. Entradas: `tx`: Transação Prisma usada pela operação.; `companyId`: Identificador da empresa ativa.; `row`: Linha de dados a processar. Devolve: Fornecedor criado ou atualizado pela importação.
- `upsertItem(tx, companyId, row)` (top-level; função) - Cria ou atualiza um artigo durante importações CSV, preservando a empresa ativa. Entradas: `tx`: Transação Prisma usada pela operação.; `companyId`: Identificador da empresa ativa.; `row`: Linha de dados a processar. Devolve: Artigo criado ou atualizado pela importação.
- `importStatementRows(tx, context, data)` (top-level; função) - Encaminha linhas de extrato importadas para o serviço de importação bancária MF3. Entradas: `tx`: Transação Prisma usada pela operação.; `context`: Contexto operacional necessário para a validação.; `data`: Dados normalizados usados pela operação. Devolve: Resultado da importação de linhas de extrato.
- `importBusinessData(prisma, context)` (exportada; função) - Importa dados sensíveis CSV/Excel com validação por linha e resumo persistido. Entradas: `prisma`: Cliente Prisma.; `context`: Contexto. Devolve: Resumo da importação.

### `real_dev/api/src/modules/imports/businessImportValidators.js`

- `normalizeText(value)` (top-level; função) - Normaliza texto opcional removendo espaços e devolvendo undefined quando fica vazio. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Texto normalizado, ou valor vazio quando aplicável.
- `parseCsvRows(content)` (exportada; função) - Converte CSV com cabeçalho no contrato legado da MF3, sem metadados internos. Entradas: `content`: Conteúdo textual CSV separado por `;`. Devolve: Linhas normalizadas por cabeçalho.
- `validateBusinessImportPayload(input)` (exportada; função) - Valida payload base de importação. Entradas: `input`: Payload JSON. Devolve: Payload normalizado.

### `real_dev/api/src/modules/imports/importFileParser.js`

- `normalizeText(value)` (top-level; função) - Normaliza texto recebido de payloads ou células de folha de cálculo. Entradas: `value`: Valor recebido. Devolve: Texto sem espaços exteriores.
- `cellToText(value)` (top-level; função) - Converte valores de célula Excel para texto simples sem executar fórmulas. Entradas: `value`: Valor de uma célula Excel. Devolve: Texto seguro para os validators de domínio.
- `extensionOf(fileName)` (exportada; função) - Extrai a extensão final do nome do ficheiro. Entradas: `fileName`: Nome recebido no pedido. Devolve: Extensão normalizada, incluindo o ponto.
- `detectImportSourceFormat(fileName)` (exportada; função) - Deteta o formato de importação a partir do nome do ficheiro. Entradas: `fileName`: Nome do ficheiro recebido. Devolve: Formato suportado pela API.
- `assertImportRowLimit(rowCount)` (top-level; função) - Garante que a importação fica dentro do volume operacional documentado. Entradas: `rowCount`: Número de linhas de dados. Devolve: Valor documentado como `void`.
- `rowsFromHeader(headers, valueRows, firstDataRowNumber)` (top-level; função) - Constrói objetos de linha a partir de cabeçalhos e valores. Entradas: `headers`: Cabeçalhos normalizados.; `valueRows`: Linhas de valores normalizados.; `firstDataRowNumber`: Número real da primeira linha de dados no ficheiro. Devolve: Linhas tabulares.
- `parseCsvRows(content)` (exportada; função) - Converte CSV com cabeçalho em linhas de objetos simples. Entradas: `content`: Conteúdo textual CSV separado por `;`. Devolve: Linhas normalizadas por cabeçalho.
- `parseXlsxRows(fileBuffer, options = {})` (top-level; função) - Converte um buffer XLSX multipart em linhas com cabeçalhos da primeira folha, num worker terminável com limites de tamanho, linhas, colunas, células e tempo. Entradas: `fileBuffer`: bytes recebidos por streaming; `options`: budgets operacionais. Devolve: Linhas normalizadas.
- `parseImportFileRows(input)` (exportada; função) - Parseia o ficheiro multipart para linhas tabulares. Entradas: `input`: buffer, nome, MIME e policy validados pela rota. Devolve: Formato e linhas normalizadas.

### `real_dev/api/src/modules/integrations/integrationLogRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro HTTP normalizado. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta enviada.
- `buildIntegrationLogRoutes({ prisma })` (exportada; função) - Monta rota de consulta de logs de integracao. Entradas: `deps`: Dependencias. Devolve: Router Express.

### `real_dev/api/src/modules/integrations/integrationLogService.js`

- `safeFileName(fileName)` (top-level; função) - Sanitiza nome de ficheiro para guardar apenas nome curto. Entradas: `fileName`: Nome recebido. Devolve: Nome seguro ou null.
- `safeMessage(message)` (top-level; função) - Sanitiza a mensagem operacional antes de a guardar no log. A função corta o texto e redige mensagens que pareçam conter segredos. Entradas: `message`: Mensagem recebida. Devolve: Mensagem truncada ou null.
- `optionalInteger(value)` (top-level; função) - Normaliza inteiro opcional para contagens. Entradas: `value`: Valor recebido. Devolve: Inteiro ou null.
- `recordIntegrationLog(prisma, input)` (exportada; função) - Regista um log de integracao sanitizado. Entradas: `prisma`: Cliente ou transacao Prisma.; `input`: Dados do log. Devolve: Log criado.
- `listIntegrationLogs(prisma, input)` (exportada; função) - Lista logs de integracao da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto. Devolve: Logs de integracao.

### `real_dev/api/src/modules/inventory/fifoCostRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildFifoCostRoutes({ prisma })` (exportada; função) - Constrói router de custo FIFO. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/inventory/fifoCostService.js`

- `consumeFifoLayers(tx, input)` (exportada; função) - Consome camadas FIFO sem permitir custo insuficiente. Entradas: `tx`: Cliente Prisma/transação.; `input`: Pedido FIFO. Devolve: Consumos.
- `createCostLayer(tx, input)` (exportada; função) - Cria uma camada valorizada. Entradas: `tx`: Cliente Prisma/transação.; `input`: Dados da camada. Devolve: Camada criada.
- `previewFifoCost(prisma, input)` (exportada; função) - Simula custo FIFO sem escrever dados. Entradas: `prisma`: Cliente Prisma.; `input`: Pedido de preview. Devolve: Resultado simulado.

### `real_dev/api/src/modules/inventory/fifoPerformance.js`

- `measureFifoCost(operation)` (exportada; função) - Mede um calculo FIFO e mantem o resultado original. Entradas: `operation`: Calculo FIFO real. Devolve: Valor documentado como `Promise<{ result: TResult, durationMs: number, withinBudget: boolean, budgetMs: number }>`.
- `assertEnoughFifoStock(requestedQuantity, availableQuantity)` (exportada; função) - Valida se ha stock suficiente antes de executar calculo pesado. Entradas: `requestedQuantity`: Quantidade pedida pelo movimento.; `availableQuantity`: Quantidade disponivel nas camadas FIFO. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/inventory/inventoryCountRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildInventoryCountRoutes({ prisma })` (exportada; função) - Monta as rotas Express de contagens físicas com autenticação, empresa e permissões. Entradas: `deps`: Dependências da API. Devolve: Router Express configurado para contagens físicas.

### `real_dev/api/src/modules/inventory/inventoryCountService.js`

- `parseCountLine(line)` (top-level; função) - Normaliza uma linha de contagem física recebida pelo service antes de validar regras de negócio. Entradas: `line`: Linha individual a processar. Devolve: Linha de contagem normalizada.
- `parseInventoryCountLines(input)` (exportada; função) - Valida e normaliza todas as linhas de uma contagem física. Entradas: `input`: Dados de entrada recebidos para validação ou normalização. Devolve: Linhas de contagem física validadas.
- `parseInventoryCount(input)` (top-level; função) - Valida o payload de contagem física e aplica defaults controlados pelo backend. Entradas: `input`: Dados de entrada recebidos para validação ou normalização. Devolve: Payload de contagem física validado.
- `listInventoryCounts(prisma, companyId)` (exportada; função) - Lista contagens da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Contagens recentes.
- `createInventoryCount(prisma, companyId, userId, input)` (exportada; função) - Cria contagem física em rascunho. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `input`: Payload JSON. Devolve: Contagem criada.
- `saveInventoryCountLines(prisma, companyId, userId, id, input)` (exportada; função) - Substitui linhas de uma contagem em rascunho. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Contagem.; `input`: Payload JSON com linhas. Devolve: Linhas guardadas.
- `postInventoryCount(prisma, companyId, userId, id)` (exportada; função) - Publica contagem e cria ajustes transacionais. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Contagem. Devolve: Contagem publicada.

### `real_dev/api/src/modules/inventory/stockAlertRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildStockAlertRoutes({ prisma })` (exportada; função) - Monta as rotas Express de alertas de stock com proteção por empresa e permissões. Entradas: `deps`: Dependências da API. Devolve: Router Express configurado para alertas de stock.

### `real_dev/api/src/modules/inventory/stockAlertService.js`

- `parseStockAlertSetting(input)` (exportada; função) - Valida configuração de alerta por artigo/armazém. Entradas: `input`: Payload JSON. Devolve: Configuração normalizada.
- `saveStockAlertSetting(prisma, context)` (exportada; função) - Guarda configuração de alertas. Entradas: `prisma`: Cliente Prisma.; `context`: Contexto. Devolve: Configuração persistida.
- `listStockAlerts(prisma, companyId)` (exportada; função) - Calcula alertas de stock explicáveis a partir das configurações ativas. Cada alerta inclui a razão operacional para apoiar decisão humana no frontend. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Alertas atuais.

### `real_dev/api/src/modules/inventory/stockMovementRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildStockMovementRoutes({ prisma })` (exportada; função) - Constrói router de inventário. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/inventory/stockMovementService.js`

- `assertInventoryRefs(tx, companyId, movement)` (top-level; função) - Confirma que artigo e armazéns pertencem à empresa ativa. Entradas: `tx`: Cliente Prisma/transação.; `companyId`: Empresa ativa.; `movement`: Movimento validado. Devolve: Valor documentado como `void`.
- `getBalanceQuantity(tx, companyId, itemId, warehouseId)` (top-level; função) - Obtém saldo atual para validações. Entradas: `tx`: Cliente Prisma/transação.; `companyId`: Empresa ativa.; `itemId`: Artigo.; `warehouseId`: Armazém. Devolve: Quantidade atual.
- `applyBalanceDelta(tx, companyId, itemId, warehouseId, delta)` (top-level; função) - Aplica delta ao saldo, criando a linha quando necessário. Entradas: `tx`: Cliente Prisma/transação.; `companyId`: Empresa ativa.; `itemId`: Artigo.; `warehouseId`: Armazém.; `delta`: Diferença. Devolve: Valor documentado como `void`.
- `createStockMovementWithCostInTransaction(tx, input)` (exportada; função) - Cria movimento já validado dentro de transação externa. Entradas: `tx`: Cliente Prisma/transação.; `input`: Contexto. Devolve: Movimento criado.
- `createStockMovement(prisma, companyId, userId, input)` (exportada; função) - Cria movimento de stock a partir de payload externo. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `input`: Payload JSON. Devolve: Movimento criado.
- `listStockMovements(prisma, companyId)` (exportada; função) - Lista movimentos de stock da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Movimentos recentes.

### `real_dev/api/src/modules/inventory/stockMovementValidators.js`

- `parseDecimal(value, code, message)` (top-level; função) - Converte valor decimal simples para número finito. Entradas: `value`: Valor recebido.; `code`: Código de erro.; `message`: Mensagem de erro. Devolve: Número validado.
- `parseStockMovement(input)` (exportada; função) - Valida payload de movimento de stock. Entradas: `input`: Payload JSON. Devolve: Movimento normalizado.

### `real_dev/api/src/modules/items/itemController.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `buildItemController({ prisma })` (exportada; função) - Constrói handlers de itens. Entradas: `deps`: Dependências. Devolve: Handlers.
- `list(req, res)` (método; método) - Lista artigos e serviços ativos da empresa atual. A resposta alimenta formulários comerciais e movimentos sem expor itens desativados. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `create(req, res)` (método; método) - Cria um artigo ou serviço depois de validar o payload. O controller delega no service a persistência e a proteção por empresa. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `update(req, res)` (método; método) - Atualiza um artigo ou serviço existente da empresa ativa. A validação mantém preços, tipo e campos fiscais dentro do contrato esperado. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `remove(req, res)` (método; método) - Desativa um artigo ou serviço sem remover documentos antigos. Esta operação preserva histórico e impede novas utilizações por listagens ativas. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/items/itemRoutes.js`

- `buildItemRoutes({ prisma })` (exportada; função) - Constrói o router de artigos e serviços. Separa guards de leitura e escrita para proteger criação, edição e desativação de itens. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/items/itemService.js`

- `serialize(item)` (top-level; função) - Serializa item para resposta pública. Entradas: `item`: Item Prisma. Devolve: Item público.
- `assertUniqueSku(prisma, companyId, sku, ignoreId)` (top-level; função) - Garante unicidade de SKU por empresa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `sku`: SKU normalizado.; `ignoreId`: Item a ignorar em updates. Devolve: Valor documentado como `void`.
- `listItems(prisma, companyId)` (exportada; função) - Lista artigos e serviços ativos. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Itens ativos.
- `createItem(prisma, companyId, input)` (exportada; função) - Cria artigo ou serviço. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `input`: Item validado. Devolve: Item criado.
- `updateItem(prisma, companyId, itemId, input)` (exportada; função) - Atualiza artigo ou serviço. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `itemId`: Item alvo.; `input`: Dados validados. Devolve: Item atualizado.
- `deactivateItem(prisma, companyId, itemId)` (exportada; função) - Desativa item sem apagar histórico. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `itemId`: Item alvo. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/items/itemValidators.js`

- `requiredString(value, field)` (top-level; função) - Valida um campo textual obrigatório de artigo ou serviço. O nome funcional do campo entra na mensagem para o utilizador perceber o erro. Entradas: `value`: Valor recebido.; `field`: Nome do campo. Devolve: Valor normalizado.
- `moneyCents(value, field, { allowZero })` (top-level; função) - Valida dinheiro guardado em cêntimos. Entradas: `value`: Valor recebido.; `field`: Nome do campo.; `options`: Política sobre zero. Devolve: Valor validado em cêntimos.
- `vatRateBps(value)` (top-level; função) - Valida taxa de IVA em basis points. Entradas: `value`: Valor recebido. Devolve: Taxa validada.
- `validateItemPayload(body)` (exportada; função) - Valida payload de artigo/serviço. Entradas: `body`: Corpo JSON do pedido. Devolve: Item normalizado.

### `real_dev/api/src/modules/notifications/alertPreferenceService.js`

- `listSupportedAlertTypes()` (exportada; função) - Devolve a lista pública de tipos suportados sem expor objetos internos. Entradas: sem entradas explícitas Devolve: Cópia defensiva dos tipos configuráveis.
- `parseAlertPreferenceBody(body)` (exportada; função) - Valida o body recebido por `PATCH /notifications/preferences/:type`. Entradas: `body`: Body JSON recebido da route. Devolve: Payload normalizado.
- `getAlertDefinition(type)` (top-level; função) - Resolve a definição de um tipo de alerta. Entradas: `type`: Tipo recebido na rota. Devolve: Definição interna do tipo.
- `assertCompanyUserContext({ companyId, userId })` (top-level; função) - Confirma que a route entregou contexto autenticado suficiente. Entradas: `input`: Contexto vindo dos guards. Devolve: Valor documentado como `void`.
- `assertCanPersistPreference(definition, enabled)` (top-level; função) - Impede a desativação de tipos obrigatórios. Entradas: `definition`: Definição do alerta.; `enabled`: Estado pedido pelo utilizador. Devolve: Valor documentado como `void`.
- `toPreferenceResponse(definition, storedPreference)` (top-level; função) - Converte definição e linha persistida na resposta pública da API. Entradas: `definition`: Definição do tipo de alerta.; `storedPreference`: Preferência guardada, se existir. Devolve: DTO devolvido ao frontend.
- `listAlertPreferences(prisma, input)` (exportada; função) - Lista as preferências efetivas do utilizador autenticado na empresa ativa. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto autenticado. Devolve: Lista de tipos com estado efetivo.
- `setAlertPreference(prisma, input)` (exportada; função) - Cria ou atualiza uma preferência do utilizador autenticado na empresa ativa. Entradas: `prisma`: Cliente Prisma.; `input`: Pedido normalizado. Devolve: Preferência atualizada em formato público.

### `real_dev/api/src/modules/notifications/notificationRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro HTTP normalizado. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta enviada.
- `buildNotificationRoutes({ prisma })` (exportada; função) - Monta endpoints de notificacoes e preferências de alertas. Entradas: `deps`: Dependencias. Devolve: Router Express.

### `real_dev/api/src/modules/notifications/notificationService.js`

- `upsertNotification(tx, data)` (top-level; função) - Cria ou atualiza uma notificacao idempotente para um utilizador. Entradas: `tx`: Cliente ou transacao Prisma.; `data`: Dados da notificacao. Devolve: Notificacao criada ou existente.
- `listNotifications(prisma, input)` (exportada; função) - Lista notificacoes do utilizador autenticado. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto. Devolve: Notificacoes.
- `syncNotifications(prisma, input)` (exportada; função) - Sincroniza notificacoes a partir de lembretes e alertas. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto autenticado. Devolve: Notificacoes criadas/atualizadas para o utilizador atual.
- `markNotificationRead(prisma, input)` (exportada; função) - Marca notificacao como lida garantindo ownership por empresa e utilizador. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto. Devolve: Notificacao atualizada.
- `sendNotificationEmails(emailAdapter, notifications)` (exportada; função) - Envia por email um conjunto de notificações já autorizadas pelo backend. Entradas: `emailAdapter`: Adapter comum de MF7.; `notifications`: Notificações elegíveis. Devolve: Resultados seguros do envio.

### `real_dev/api/src/modules/notifications/transactionalEmailAdapter.js`

- `getEmailDomain(email)` (exportada; função) - Devolve apenas o domínio para evidence técnica sem expor o endereço completo. Entradas: `email`: Endereço de destino. Devolve: Domínio do destinatário ou null.
- `validateTransactionalEmailMessage(message)` (exportada; função) - Valida a mensagem antes de ela sair do domínio OPSA. Entradas: `message`: Mensagem transaccional. Devolve: Mensagem validada.
- `buildTransactionalEmailAdapter({ provider, logger })` (exportada; função) - Cria adapter para provider real ou fila técnica segura. Entradas: `options`: Dependências externas. Devolve: Adapter transaccional.
- `sendTransactionalEmail(message)` (método; método) - Envia ou enfileira uma mensagem transaccional validada. Entradas: `message`: Mensagem transaccional bruta. Devolve: Resultado seguro do envio.

### `real_dev/api/src/modules/open-items/salesOpenItemsRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildSalesOpenItemsRoutes({ prisma })` (exportada; função) - Constrói o router de títulos de venda em aberto. Liga a consulta autorizada ao service que calcula saldos por data de referência. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/open-items/salesOpenItemsService.js`

- `parseAsOfDate(value)` (top-level; função) - Valida data de referência. Entradas: `value`: Valor opcional recebido por query string. Devolve: Data de referência.
- `bucketFor(daysOverdue)` (top-level; função) - Classifica antiguidade do saldo. Entradas: `daysOverdue`: Dias vencidos. Devolve: Bucket funcional.
- `listSalesOpenItems(prisma, companyId, query)` (exportada; função) - Lista documentos de venda emitidos com saldo em aberto. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `query`: Query string. Devolve: Títulos em aberto.

### `real_dev/api/src/modules/ops/healthRoutes.js`

- `readRequiredText(value, fieldName)` (top-level; função) - Normaliza um campo textual obrigatorio do health-check. Entradas: `value`: Valor recebido da configuracao da API.; `fieldName`: Nome usado na mensagem de erro. Devolve: Texto validado e sem espacos exteriores.
- `normalizeHealthOptions(options)` (top-level; função) - Valida a configuracao minima e devolve uma copia segura para o router. Entradas: `options`: Configuracao recebida pelo ponto de entrada da API. Devolve: Configuracao operacional segura.
- `buildHealthPayload(options, now)` (exportada; função) - Cria o payload publico e seguro do endpoint de health-check. Entradas: `options`: Configuracao minima que pode ser exposta.; `now`: Relogio usado para tornar o teste deterministico. Devolve: Payload publico do endpoint.
- `buildHealthRoutes(options)` (exportada; função) - Monta o router publico de health-check da API OPSA. Entradas: `options`: Configuracao segura a expor na resposta. Devolve: Router Express com `GET /`.

### `real_dev/api/src/modules/ops/structuredLogger.js`

- `normalizeContextKey(key)` (top-level; função) - Normaliza uma chave para comparar variantes como `apiKey`, `api_key` e `api-key`. Entradas: `key`: Chave recebida no contexto do log. Devolve: Chave normalizada para a politica de seguranca.
- `assertSafeContextKey(key)` (top-level; função) - Confirma que uma chave de contexto pode ser escrita no log operacional. Entradas: `key`: Chave original recebida. Devolve: Valor documentado como `void`.
- `createStructuredLogEvent(input)` (exportada; função) - Cria um evento de log seguro para a API OPSA. Entradas: `input`: Dados minimos do evento. Devolve: Evento normalizado.
- `writeStructuredLog(event)` (exportada; função) - Escreve um evento validado na consola usando o metodo apropriado para o nivel. Entradas: `event`: Evento ja criado por `createStructuredLogEvent`. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/payments/paymentRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildPaymentRoutes({ prisma })` (exportada; função) - Constrói router montado em `/api/purchases/documents`. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/payments/paymentService.js`

- `parsePaymentInput(input)` (top-level; função) - Valida payload de pagamento. Entradas: `input`: Payload JSON. Devolve: Pagamento validado.
- `registerPayment(prisma, companyId, userId, purchaseDocumentId, input)` (exportada; função) - Regista pagamento parcial ou total de documento de compra. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `purchaseDocumentId`: Documento alvo.; `input`: Payload JSON. Devolve: Pagamento criado.

### `real_dev/api/src/modules/performance/documentPerformance.js`

- `measureDocumentInsertion(operation)` (exportada; função) - Mede uma operacao de insercao de documento e preserva o resultado original. Entradas: `operation`: Operacao real a executar. Devolve: Resultado medido.
- `setDocumentPerformanceHeaders(res, measurement)` (exportada; função) - Acrescenta headers tecnicos para evidence de performance. Entradas: `res`: Resposta Express.; `measurement`: Medicao feita no service. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/permissions/permissionMiddleware.js`

- `requireRole(...allowedRoles)` (exportada; função) - Exige que a role ativa esteja na lista permitida. Entradas: `allowedRoles`: Roles canónicas autorizadas. Devolve: Middleware Express.
- `requirePermission(permission)` (exportada; função) - Exige que a role ativa tenha a permissão indicada. Entradas: `permission`: Permissão funcional necessária. Devolve: Middleware Express.

### `real_dev/api/src/modules/permissions/permissions.js`

- `getPermissionsForRole(role)` (exportada; função) - Devolve as permissões associadas a uma role canónica. Entradas: `role`: Role ativa no contexto da empresa. Devolve: Lista de permissões funcionais.
- `hasPermission(role, permission)` (exportada; função) - Verifica se uma role possui determinada permissão. Entradas: `role`: Role ativa no contexto da empresa.; `permission`: Permissão funcional a verificar. Devolve: `true` quando a role inclui a permissão.

### `real_dev/api/src/modules/permissions/permissionsController.js`

- `buildPermissionsController()` (exportada; função) - Constrói handlers de permissões. Entradas: sem entradas explícitas Devolve: Handlers Express.
- `me(req, res)` (método; método) - Devolve role e permissões no contexto da empresa ativa. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/permissions/permissionsRoutes.js`

- `buildPermissionsRoutes({ prisma })` (exportada; função) - Constrói o router `/api/permissions`. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/purchase-approval/purchaseApprovalHistoryValidators.js`

- `parseApprovalReason(input)` (exportada; função) - Normaliza a justificação opcional de aprovação. Entradas: `input`: Payload JSON. Devolve: Justificação funcional.
- `parseRejectionReason(input)` (exportada; função) - Valida a justificação obrigatória de reprovação. Entradas: `input`: Payload JSON. Devolve: Justificação funcional.

### `real_dev/api/src/modules/purchase-approval/purchaseApprovalRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildPurchaseApprovalRoutes({ prisma })` (exportada; função) - Constrói router montado em `/api/purchases/documents`. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/purchase-approval/purchaseApprovalService.js`

- `findPurchaseDocument(prisma, companyId, id)` (top-level; função) - Procura documento de compra dentro da empresa ativa. Entradas: `prisma`: Cliente Prisma/transação.; `companyId`: Empresa ativa.; `id`: Documento alvo. Devolve: Documento encontrado.
- `recordPurchaseApprovalAudit(tx, companyId, userId, purchaseDocumentId, action, details)` (top-level; função) - Regista auditoria de workflow de compra. Entradas: `tx`: Transação Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `purchaseDocumentId`: Documento alvo.; `action`: Ação auditável.; `details`: Detalhes adicionais registados para auditoria ou erro. Devolve: Valor documentado como `void`.
- `createApprovalHistory(tx, input)` (top-level; função) - Regista histórico funcional de decisão de compra. Entradas: `tx`: Transação Prisma.; `input`: Decisão. Devolve: Histórico criado.
- `approvePurchaseDocument(prisma, companyId, userId, id, input)` (exportada; função) - Aprova compra em rascunho. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Documento alvo.; `input`: Dados de entrada recebidos para validação ou normalização. Devolve: Documento aprovado.
- `rejectPurchaseDocument(prisma, companyId, userId, id, input)` (exportada; função) - Reprova compra em rascunho ou aprovada, preservando histórico. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Documento alvo.; `input`: Payload JSON com justificação. Devolve: Documento reprovado.
- `listPurchaseApprovalHistory(prisma, companyId, id)` (exportada; função) - Lista histórico de decisões de uma compra da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `id`: Documento alvo. Devolve: Histórico cronológico.
- `markPurchaseDocumentPosted(prisma, companyId, userId, id)` (exportada; função) - Lança compra aprovada, criando diário contabilístico no mesmo fluxo. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Documento alvo. Devolve: Lançamento contabilístico criado.

### `real_dev/api/src/modules/purchases/purchaseDocumentRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildPurchaseDocumentRoutes({ prisma })` (exportada; função) - Constrói o router de documentos de compra. Agrupa leitura e criação medidas pelo RNF08 sob autenticação, empresa e permissões. Entradas: `deps`: Dependências backend usadas para montar guards e services de compras. Devolve: Router Express com leitura e criação medida pelo RNF08.

### `real_dev/api/src/modules/purchases/purchaseDocumentService.js`

- `parseLine(line)` (top-level; função) - Valida linha de compra. Entradas: `line`: Linha JSON. Devolve: Linha normalizada.
- `listPurchaseDocuments(prisma, companyId)` (exportada; função) - Lista documentos de compra da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Documentos de compra.
- `createPurchaseDocument(prisma, companyId, userId, input)` (exportada; função) - Cria documento de compra em rascunho. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `input`: Payload JSON. Devolve: Documento criado.

### `real_dev/api/src/modules/receipts/receiptRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildReceiptRoutes({ prisma })` (exportada; função) - Constrói router montado em `/api/sales/documents`. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/receipts/receiptService.js`

- `parseReceiptInput(input)` (top-level; função) - Valida payload de recebimento. Entradas: `input`: Payload JSON. Devolve: Recebimento validado.
- `registerReceipt(prisma, companyId, userId, saleDocumentId, input)` (exportada; função) - Regista recebimento parcial ou total de documento de venda. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `saleDocumentId`: Documento alvo.; `input`: Payload JSON. Devolve: Recebimento criado.

### `real_dev/api/src/modules/reminders/reminderRoutes.js`

- `sendError(res, error)` (top-level; função) - Responde com erro JSON consistente. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta enviada.
- `buildReminderRoutes({ prisma })` (exportada; função) - Monta endpoints de lembretes. Entradas: `deps`: Dependencias. Devolve: Router Express.

### `real_dev/api/src/modules/reminders/reminderService.js`

- `listReminders(prisma, companyId)` (exportada; função) - Lista lembretes da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Lembretes ordenados por prazo.
- `createReminder(prisma, input)` (exportada; função) - Cria lembrete sem aceitar companyId externo. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto e payload. Devolve: Lembrete criado.
- `updateReminderStatus(prisma, input)` (exportada; função) - Atualiza estado de lembrete validando ownership por empresa. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto. Devolve: Lembrete atualizado.

### `real_dev/api/src/modules/reminders/reminderValidators.js`

- `text(value, field)` (top-level; função) - Valida texto obrigatorio com limite. Entradas: `value`: Valor recebido no payload.; `field`: Nome do campo. Devolve: Texto normalizado.
- `dueDate(value)` (top-level; função) - Valida data ISO curta sem permitir normalizacao silenciosa do Date. Entradas: `value`: Valor recebido no payload. Devolve: Data validada.
- `validateReminderPayload(body)` (exportada; função) - Valida payload de criacao de lembrete. Entradas: `body`: Corpo HTTP. Devolve: Payload normalizado.
- `validateReminderStatusPayload(body)` (exportada; função) - Valida payload de atualizacao de estado de lembrete. Entradas: `body`: Corpo HTTP. Devolve: Estado normalizado.

### `real_dev/api/src/modules/reports/executiveKpiFilters.js`

- `requiredDate(value, fieldName)` (top-level; função) - Valida datas obrigatórias de filtros e devolve objetos Date consistentes. Entradas: `value`: Valor a normalizar ou formatar.; `fieldName`: Nome do campo usado na mensagem de validação. Devolve: Data obrigatória validada.
- `validateExecutiveKpiQuery(query)` (exportada; função) - Valida intervalo de KPIs executivos. Entradas: `query`: Query Express. Devolve: Intervalo validado.

### `real_dev/api/src/modules/reports/executiveKpiRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildExecutiveKpiRoutes({ prisma })` (exportada; função) - Constrói o router dos KPIs executivos. Protege a consulta e delega a validação do intervalo antes de calcular indicadores de gestão. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/reports/executiveKpiService.js`

- `signedSaleTotal(document)` (top-level; função) - Aplica o sinal contabilístico correto a vendas e notas de crédito. Em relatórios executivos, notas de crédito reduzem receita em vez de somarem ao total. Entradas: `document`: Documento de negócio a processar. Devolve: Total de venda com sinal contabilístico aplicado.
- `signedPurchaseTotal(document)` (top-level; função) - Aplica sinal contabilístico correto a compras e notas de crédito em relatórios. Entradas: `document`: Documento de negócio a processar. Devolve: Total de compra com sinal contabilístico aplicado.
- `average(values)` (top-level; função) - Calcula uma média protegida contra listas vazias. Entradas: `values`: Valores normalizados do formulário. Devolve: Média calculada, ou zero quando não há valores.
- `daysBetween(from, to)` (top-level; função) - Calcula a diferença inteira de dias entre duas datas. Entradas: `from`: Data inicial do intervalo.; `to`: Data final do intervalo. Devolve: Número inteiro de dias entre as duas datas.
- `buildExecutiveKpis(prisma, input)` (exportada; função) - Calcula receita, custos, EBITDA MVP, PMR e PMP com fontes. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto. Devolve: KPIs calculados.

### `real_dev/api/src/modules/reports/operationalReportFilters.js`

- `requiredDate(value, fieldName)` (top-level; função) - Valida datas obrigatórias de filtros e devolve objetos Date consistentes. Entradas: `value`: Valor a normalizar ou formatar.; `fieldName`: Nome do campo usado na mensagem de validação. Devolve: Data obrigatória validada.
- `validateOperationalReportQuery(query)` (exportada; função) - Valida intervalo de relatório operacional. Entradas: `query`: Query Express. Devolve: Intervalo validado.

### `real_dev/api/src/modules/reports/operationalReportRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildOperationalReportRoutes({ prisma })` (exportada; função) - Constrói o router do relatório operacional. Liga a leitura autorizada ao service que agrega métricas de vendas, compras e tesouraria. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/reports/operationalReportService.js`

- `signedSaleTotal(document)` (top-level; função) - Aplica o sinal contabilístico correto a vendas e notas de crédito. Em relatórios operacionais, notas de crédito reduzem vendas para manter margem e totais coerentes. Entradas: `document`: Documento de negócio a processar. Devolve: Total de venda com sinal contabilístico aplicado.
- `signedPurchaseTotal(document)` (top-level; função) - Aplica sinal contabilístico correto a compras e notas de crédito em relatórios. Entradas: `document`: Documento de negócio a processar. Devolve: Total de compra com sinal contabilístico aplicado.
- `buildOperationalReport(prisma, input)` (exportada; função) - Agrega dados reais para reporting operacional. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto. Devolve: Relatório operacional.

### `real_dev/api/src/modules/sales-approval/saleApprovalRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildSaleApprovalRoutes({ prisma })` (exportada; função) - Constrói router montado em `/api/sales/documents`. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/sales-approval/saleApprovalService.js`

- `findSaleDocument(prisma, companyId, id)` (top-level; função) - Procura documento de venda dentro da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `id`: Documento alvo. Devolve: Documento encontrado.
- `recordSaleApprovalAudit(tx, companyId, userId, saleDocumentId, action, details)` (top-level; função) - Regista auditoria de workflow de venda. Entradas: `tx`: Transação Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `saleDocumentId`: Documento alvo.; `action`: Ação auditável.; `details`: Detalhes seguros. Devolve: Valor documentado como `void`.
- `submitSaleDocument(prisma, companyId, userId, id)` (exportada; função) - Submete documento de venda em rascunho. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Documento alvo. Devolve: Documento atualizado.
- `approveSaleDocument(prisma, companyId, userId, id)` (exportada; função) - Aprova documento de venda submetido. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Documento alvo. Devolve: Documento atualizado.
- `rejectSaleDocument(prisma, companyId, userId, id, input)` (exportada; função) - Rejeita documento de venda submetido. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Documento alvo.; `input`: Payload JSON. Devolve: Documento atualizado.

### `real_dev/api/src/modules/sales/saleDocumentRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildSaleDocumentRoutes({ prisma })` (exportada; função) - Constrói o router de documentos de venda. Expõe listagem, criação e emissão definitiva com medição de performance e permissões adequadas. Entradas: `deps`: Dependências backend usadas para montar guards e services de vendas. Devolve: Router Express com leitura, criação medida pelo RNF08 e emissão definitiva.

### `real_dev/api/src/modules/sales/saleDocumentService.js`

- `toDate(value, field)` (top-level; função) - Converte valor de data para `Date` válida. Entradas: `value`: Valor recebido.; `field`: Nome funcional do campo. Devolve: Data validada.
- `parseLine(line)` (top-level; função) - Valida linha de venda recebida no payload. Entradas: `line`: Linha JSON. Devolve: Linha normalizada.
- `nextSaleNumber(tx, companyId, kind, issuedAt)` (top-level; função) - Gera o próximo número sequencial de venda dentro da transação de emissão. Entradas: `tx`: Transação Prisma.; `companyId`: Empresa ativa.; `kind`: Tipo de documento.; `issuedAt`: Data de emissão. Devolve: Número definitivo.
- `listSaleDocuments(prisma, companyId)` (exportada; função) - Lista documentos de venda da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Documentos de venda.
- `createSaleDocument(prisma, companyId, userId, input)` (exportada; função) - Cria documento de venda em rascunho com totais calculados no backend. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `input`: Payload JSON. Devolve: Documento criado.
- `issueSaleDocument(prisma, companyId, userId, id)` (exportada; função) - Emite definitivamente um documento de venda aprovado. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `userId`: Utilizador autenticado.; `id`: Documento alvo. Devolve: Documento emitido.

### `real_dev/api/src/modules/security/requestHardening.js`

- `requireTrustedOrigin({ appBaseUrl, isProduction })` (exportada; função) - Exige origem esperada em pedidos que alteram dados. Entradas: `options`: Configuracao do ambiente. Devolve: Middleware Express.
- `escapeHtml(value)` (exportada; função) - Escapa texto antes de ser usado em HTML gerado pela API. Entradas: `value`: Texto controlado pelo utilizador. Devolve: Texto com caracteres perigosos escapados.

### `real_dev/api/src/modules/security/transportSecurity.js`

- `isSecureRequest(req)` (exportada; função) - Confirma se o pedido chegou por HTTPS direto ou por proxy confiavel. Entradas: `req`: Pedido Express. Devolve: `true` quando o canal observado e seguro.
- `enforceHttps({ isProduction })` (exportada; função) - Cria middleware que exige HTTPS em producao. Entradas: `options`: Opcoes do ambiente atual. Devolve: Middleware Express.
- `applyStrictTransportSecurity({ isProduction })` (exportada; função) - Aplica HSTS em producao depois de validado o canal seguro. Entradas: `options`: Opcoes do ambiente atual. Devolve: Middleware Express.

### `real_dev/api/src/modules/subscriptions/subscriptionPlans.js`

- `listSimulatedSubscriptionPlans()` (exportada; função) - Devolve uma copia imutavel de todos os planos simulados. Entradas: sem entradas explícitas Devolve: Lista ordenada de planos.
- `getSimulatedSubscriptionPlan(code)` (exportada; função) - Procura um plano pelo codigo publico usado pela API. Entradas: `code`: Codigo do plano. Devolve: Plano encontrado.
- `toSubscriptionPlanErrorResponse(error)` (exportada; função) - Converte erros do catalogo para uma resposta HTTP estavel. Entradas: `error`: Erro capturado pela rota. Devolve: Resposta para Express.

### `real_dev/api/src/modules/subscriptions/subscriptionRoutes.js`

- `sendHttpError(res, error)` (top-level; função) - Envia um erro operacional normalizado sem expor stack traces ou queries. Entradas: `res`: Resposta Express.; `error`: Erro capturado pela rota. Devolve: Resposta JSON segura.
- `readActivationBody(body)` (top-level; função) - Le e valida o body permitido para ativacao simulada. Entradas: `body`: Body JSON recebido pela rota. Devolve: Dados normalizados para o service.
- `readLifecycleActionBody(body)` (top-level; função) - Le e valida o body permitido para renovacao, cancelamento e reativacao. Entradas: `body`: Body JSON recebido pela rota. Devolve: Dados normalizados para o service.
- `buildSubscriptionGuards({ prisma, guards })` (exportada; função) - Constroi os middlewares de seguranca usados pelas rotas de subscricao. Entradas: `options`: Opcoes de configuracao.; `options.prisma`: Cliente Prisma da aplicacao.; `options.guards`: Guards alternativos usados em testes. Devolve: Middlewares de Express.
- `buildSubscriptionRoutes({ prisma, guards })` (exportada; função) - Cria as rotas HTTP do catalogo de subscricoes simuladas. Entradas: `options`: Opcoes da rota.; `options.prisma`: Cliente Prisma da aplicacao.; `options.guards`: Guards alternativos usados em testes. Devolve: Router configurado.

### `real_dev/api/src/modules/subscriptions/subscriptionService.js`

- `requireActiveCompanyId(companyId)` (exportada; função) - Garante que a consulta tem empresa ativa resolvida pelo backend. Entradas: `companyId`: Empresa ativa injetada no pedido. Devolve: Empresa ativa validada.
- `toOptionalIsoString(value)` (top-level; função) - Converte uma data opcional para o contrato JSON da API. Entradas: `value`: Valor devolvido pelo Prisma. Devolve: Data em ISO 8601 ou `null`.
- `requireText(value, code, message)` (top-level; função) - Valida uma string obrigatoria recebida de um contexto ja autenticado. Entradas: `value`: Valor recebido do caller.; `code`: Codigo funcional da falha.; `message`: Mensagem segura para resposta HTTP. Devolve: Texto normalizado.
- `getPlanForStoredSubscription(planCode)` (top-level; função) - Resolve o plano guardado na subscricao contra o catalogo canonico do BK-MF8-03. Entradas: `planCode`: Codigo persistido na subscricao. Devolve: Plano publico.
- `getPlanForActivation(planCode)` (top-level; função) - Resolve um plano escolhido pelo utilizador para ativacao simulada. Entradas: `planCode`: Codigo recebido no body validado pela rota. Devolve: Plano canonico.
- `readSubscriptionLifecycleAction(action)` (top-level; função) - Normaliza a acao de ciclo de vida antes de qualquer escrita. Entradas: `action`: Acao recebida da rota protegida. Devolve: Acao aceite por RF51.
- `readSubscriptionLifecycleInput(input)` (top-level; função) - Valida o input minimo das acoes de ciclo de vida. Entradas: `input`: Dados recebidos da rota. Devolve: Dados normalizados.
- `calculateSubscriptionCycleEnd(startsAt, plan)` (exportada; função) - Calcula a data final da subscricao a partir do contrato do catalogo. Entradas: `startsAt`: Data inicial do ciclo.; `plan`: Plano canonico. Devolve: Data final calculada.
- `formatCurrentSubscription(subscription)` (exportada; função) - Normaliza o registo Prisma para o payload publico da API. Entradas: `subscription`: Registo `CompanySubscription` ou ausencia dele. Devolve: Estado atual da subscricao.
- `getCurrentSubscription(prisma, context)` (exportada; função) - Consulta a subscricao atual da empresa ativa. Entradas: `prisma`: Cliente Prisma da API.; `context`: Contexto multiempresa resolvido pela API. Devolve: Payload publico.
- `assertSubscriptionBelongsToActiveCompany(subscription, companyId)` (exportada; função) - Confirma que uma subscricao reutilizada pertence a empresa ativa. Entradas: `subscription`: Subscricao persistida para reutilizacao.; `companyId`: Empresa ativa resolvida pelo backend. Devolve: A subscricao original quando pertence a empresa ativa.
- `assertSubscriptionLifecycleTransition(subscription, action)` (exportada; função) - Confirma se a transicao de ciclo de vida e valida para o estado persistido. Entradas: `subscription`: Subscricao atual da empresa ativa.; `action`: Acao normalizada. Devolve: Valor documentado como `void`.
- `buildSubscriptionLifecycleUpdate(input)` (top-level; função) - Calcula os campos persistidos para renovar, cancelar ou reativar. Entradas: `input`: Contexto validado da transicao. Devolve: Dados para Prisma e auditoria.
- `readActivationInput(input)` (top-level; função) - Valida o input minimo da ativacao antes de escrever em base de dados. Entradas: `input`: Dados recebidos da rota. Devolve: Dados normalizados.
- `activateSimulatedSubscription(prisma, input)` (exportada; função) - Ativa ou substitui a subscricao simulada da empresa ativa. Entradas: `prisma`: Cliente Prisma da API.; `input`: Pedido de ativacao validado pela rota. Devolve: Subscricao atualizada.
- `runSimulatedSubscriptionAction(prisma, input)` (exportada; função) - Executa renovacao, cancelamento ou reativacao simulada da subscricao atual. Entradas: `prisma`: Cliente Prisma da API.; `input`: Pedido de ciclo de vida validado pela rota. Devolve: Subscricao atualizada.

### `real_dev/api/src/modules/suppliers/supplierController.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `normalizeSearch(value)` (top-level; função) - Normaliza query string opcional de pesquisa. Entradas: `value`: Valor de `req.query.search`. Devolve: Pesquisa normalizada.
- `buildSupplierController({ prisma })` (exportada; função) - Constrói handlers de fornecedores. Entradas: `deps`: Dependências. Devolve: Handlers.
- `list(req, res)` (método; método) - Lista fornecedores ativos da empresa atual. Quando existe pesquisa, o controller escolhe o service próprio para filtrar resultados. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `create(req, res)` (método; método) - Cria um fornecedor depois de validar dados fiscais e comerciais. O payload externo é normalizado antes de chegar à camada de persistência. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `update(req, res)` (método; método) - Atualiza um fornecedor pertencente à empresa ativa. A operação reutiliza a validação de criação para manter o mesmo contrato de dados. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `remove(req, res)` (método; método) - Desativa um fornecedor sem apagar histórico de compras. O service confirma a pertença à empresa antes de aplicar a alteração. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/suppliers/supplierRoutes.js`

- `buildSupplierRoutes({ prisma })` (exportada; função) - Constrói o router de fornecedores em `/api/suppliers`. Aplica autenticação, empresa ativa e permissões diferentes para leitura e escrita. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/suppliers/supplierService.js`

- `serialize(supplier)` (top-level; função) - Serializa fornecedor para resposta pública. Entradas: `supplier`: Fornecedor Prisma. Devolve: Fornecedor público.
- `assertUniqueNif(prisma, companyId, nif, ignoreId)` (top-level; função) - Garante unicidade de NIF por empresa quando NIF existe. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `nif`: NIF validado.; `ignoreId`: Fornecedor a ignorar em updates. Devolve: Valor documentado como `void`.
- `listSuppliers(prisma, companyId)` (exportada; função) - Lista fornecedores ativos da empresa ativa. Esta função reutiliza a pesquisa sem termo para garantir uma ordenação única. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Fornecedores ativos.
- `searchSuppliers(prisma, companyId, search)` (exportada; função) - Lista fornecedores ativos, com pesquisa opcional por nome ou NIF. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `search`: Texto de pesquisa opcional. Devolve: Fornecedores ativos.
- `createSupplier(prisma, companyId, input)` (exportada; função) - Cria um fornecedor depois de confirmar unicidade de NIF. A resposta pública é serializada para não expor campos internos do Prisma. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `input`: Fornecedor validado. Devolve: Fornecedor criado.
- `updateSupplier(prisma, companyId, supplierId, input)` (exportada; função) - Atualiza fornecedor da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `supplierId`: Fornecedor alvo.; `input`: Dados validados. Devolve: Fornecedor atualizado.
- `deactivateSupplier(prisma, companyId, supplierId)` (exportada; função) - Desativa fornecedor sem apagar histórico. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `supplierId`: Fornecedor alvo. Devolve: Valor documentado como `void`.

### `real_dev/api/src/modules/suppliers/supplierValidators.js`

- `requiredName(value)` (top-level; função) - Valida o nome obrigatório do fornecedor. Entradas: `value`: Valor recebido. Devolve: Nome normalizado.
- `optionalString(value)` (top-level; função) - Normaliza um campo textual opcional de fornecedor. Valores vazios são convertidos para `null` para simplificar a persistência. Entradas: `value`: Valor recebido. Devolve: String normalizada ou `null`.
- `optionalNif(value)` (top-level; função) - Valida NIF opcional do fornecedor. Entradas: `value`: Valor recebido. Devolve: NIF validado ou `null`.
- `optionalEmail(value)` (top-level; função) - Valida email opcional quando preenchido. Entradas: `value`: Valor recebido. Devolve: Email normalizado ou `null`.
- `validateSupplierPayload(body)` (exportada; função) - Valida payload de fornecedor. Entradas: `body`: Corpo JSON do pedido. Devolve: Fornecedor normalizado.

### `real_dev/api/src/modules/tasks/taskRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro HTTP normalizado. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta enviada.
- `buildOperationalTaskRoutes({ prisma })` (exportada; função) - Monta rotas de tarefas. Entradas: `deps`: Dependencias. Devolve: Router Express.

### `real_dev/api/src/modules/tasks/taskService.js`

- `assertAssignee(prisma, input)` (top-level; função) - Confirma que o utilizador atribuido pertence a empresa ativa. Entradas: `prisma`: Cliente Prisma.; `input`: Dados de atribuicao. Devolve: Sem valor.
- `listOperationalTasks(prisma, companyId)` (exportada; função) - Lista tarefas da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Tarefas ordenadas por prazo.
- `createOperationalTask(prisma, input)` (exportada; função) - Cria tarefa operacional com atribuicao validada. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto e payload. Devolve: Tarefa criada.
- `updateOperationalTaskStatus(prisma, input)` (exportada; função) - Atualiza estado da tarefa mantendo ownership por empresa. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto. Devolve: Tarefa atualizada.

### `real_dev/api/src/modules/tasks/taskValidators.js`

- `text(value, field)` (top-level; função) - Valida texto de tarefa. Entradas: `value`: Valor recebido.; `field`: Nome do campo. Devolve: Texto normalizado.
- `dueDate(value)` (top-level; função) - Valida data ISO curta sem permitir normalizacao silenciosa do Date. Entradas: `value`: Valor recebido. Devolve: Data validada.
- `validateTaskPayload(body)` (exportada; função) - Valida payload de criacao de tarefa. Entradas: `body`: Corpo HTTP. Devolve: Payload normalizado.
- `validateTaskStatusPayload(body)` (exportada; função) - Valida estado de tarefa. Entradas: `body`: Corpo HTTP. Devolve: Estado normalizado.

### `real_dev/api/src/modules/tax/vatMapFilters.js`

- `requiredDate(value, fieldName)` (top-level; função) - Converte uma query string de data num `Date` seguro. Entradas: `value`: Valor recebido em `req.query`.; `fieldName`: Nome funcional do campo. Devolve: Data validada.
- `inclusiveDaysBetween(fromDate, toDate)` (top-level; função) - Calcula dias incluindo início e fim para relatórios que trabalham por intervalo fechado. Entradas: `fromDate`: Data inicial do intervalo.; `toDate`: Data final do intervalo. Devolve: Número de dias do intervalo incluindo início e fim.
- `validateVatMapQuery(query)` (exportada; função) - Valida o intervalo usado pelo mapa de IVA. Entradas: `query`: Query string Express. Devolve: Intervalo validado.

### `real_dev/api/src/modules/tax/vatMapRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildVatMapRoutes({ prisma })` (exportada; função) - Constrói o router do mapa de IVA. Protege a consulta fiscal e liga a query validada ao cálculo agregado de IVA. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/tax/vatMapService.js`

- `upsertVatBucket(buckets, key, data)` (top-level; função) - Cria ou reutiliza o balde de agregação de IVA para uma taxa. O mapa evita duplicar linhas para a mesma taxa enquanto acumula imposto liquidado e dedutível. Entradas: `buckets`: Mapa de agregação onde o balde é criado ou atualizado.; `key`: Chave a extrair da resposta JSON.; `data`: Dados normalizados usados pela operação. Devolve: Balde de IVA criado ou atualizado no mapa de agregação.
- `addVatLines(buckets, lines, kind, side)` (top-level; função) - Agrupa linhas de IVA por taxa para calcular bases tributáveis e imposto liquidado ou dedutível. Entradas: `buckets`: Mapa de agregação de IVA a atualizar.; `lines`: Linhas de negócio a validar ou agregar.; `kind`: Tipo funcional usado para classificar a linha de IVA.; `side`: Lado fiscal do mapa de IVA a atualizar. Devolve: Não devolve valor; atualiza o mapa de agregação recebido.
- `buildVatMap(prisma, input)` (exportada; função) - Calcula e persiste uma execução do mapa de IVA. O diário contabilístico é a fonte de verdade para saber que documentos estão contabilizados. As linhas de venda/compra só são usadas para decompor o IVA por código e taxa, porque `JournalEntryLine` não guarda `vatRateId`. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto validado. Devolve: Mapa calculado e execução persistida.

### `real_dev/api/src/modules/treasury/bankAccountRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildTreasuryAccountRoutes({ prisma })` (exportada; função) - Constrói o router de contas de tesouraria. Expõe listagem e criação de contas bancárias ou caixa com permissões financeiras. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/treasury/bankAccountService.js`

- `serializeAccount(account)` (top-level; função) - Converte contas de tesouraria para o shape público devolvido pela API. Entradas: `account`: Conta ou registo contabilístico a normalizar. Devolve: Conta de tesouraria no formato público da API.
- `listTreasuryAccounts(prisma, companyId)` (exportada; função) - Lista contas de tesouraria ativas da empresa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Contas de tesouraria.
- `createTreasuryAccount(prisma, context)` (exportada; função) - Cria conta bancária/caixa e primeiro snapshot na mesma transação. Entradas: `prisma`: Cliente Prisma.; `context`: Contexto. Devolve: Conta criada.

### `real_dev/api/src/modules/treasury/bankAccountValidators.js`

- `normalizeText(value)` (top-level; função) - Normaliza texto opcional removendo espaços e devolvendo undefined quando fica vazio. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Texto normalizado, ou valor vazio quando aplicável.
- `moneyCents(value, field)` (top-level; função) - Converte valores monetários de entrada para cêntimos inteiros. Entradas: `value`: Valor a normalizar ou formatar.; `field`: Campo numérico a acumular. Devolve: Valor monetário convertido para cêntimos.
- `ibanToNumberString(iban)` (top-level; função) - Documenta a função ibanToNumberString no contexto deste módulo. Entradas: `iban`: IBAN a validar. Devolve: IBAN reduzido aos dígitos usados na validação.
- `isValidIban(iban)` (exportada; função) - Valida IBAN pelo algoritmo ISO 13616/mod 97. Entradas: `iban`: IBAN sem espaços. Devolve: `true` quando o IBAN é sintaticamente válido.
- `validateTreasuryAccountPayload(input)` (exportada; função) - Valida payload de criação de conta de tesouraria. Entradas: `input`: Payload JSON. Devolve: Conta normalizada.

### `real_dev/api/src/modules/treasury/cashflowForecastFilters.js`

- `addDays(date, days)` (top-level; função) - Documenta a função addDays no contexto deste módulo. Entradas: `date`: Data usada no cálculo.; `days`: Número de dias a somar ou comparar. Devolve: Nova data deslocada pelo número de dias indicado.
- `inclusiveDaysBetween(fromDate, toDate)` (top-level; função) - Calcula dias incluindo início e fim para relatórios que trabalham por intervalo fechado. Entradas: `fromDate`: Data inicial do intervalo.; `toDate`: Data final do intervalo. Devolve: Número de dias do intervalo incluindo início e fim.
- `parseOptionalDate(value, fallback)` (top-level; função) - Valida uma data opcional de filtro sem impor valor quando o campo não foi enviado. Entradas: `value`: Valor a normalizar ou formatar.; `fallback`: Data alternativa usada quando o filtro não foi enviado. Devolve: Data validada, ou undefined quando não foi fornecida.
- `validateForecastQuery(query)` (exportada; função) - Valida a query do forecast com limite MVP de 180 dias. Entradas: `query`: Query Express. Devolve: Intervalo validado.

### `real_dev/api/src/modules/treasury/cashflowForecastRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildCashflowForecastRoutes({ prisma })` (exportada; função) - Constrói o router de previsão de cashflow. Valida o intervalo recebido e delega no service a projeção de entradas e saídas. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/treasury/cashflowForecastService.js`

- `toDateKey(date)` (top-level; função) - Converte uma data para a chave diária usada pela previsão de tesouraria. A chave ISO curta permite agregar entradas e saídas no mesmo balde diário. Entradas: `date`: Data usada no cálculo. Devolve: Chave de data em formato ISO curto.
- `documentDueDate(document, fallbackField)` (top-level; função) - Escolhe a data de vencimento operacional de um documento para a previsão de tesouraria. Entradas: `document`: Documento de negócio a processar.; `fallbackField`: Campo de data alternativo usado quando não existe vencimento. Devolve: Data de vencimento operacional do documento.
- `addDailyBucket(buckets, date, field, amount, source)` (top-level; função) - Acumula movimentos previstos no balde diário correto da previsão de tesouraria. Entradas: `buckets`: Coleção de baldes diários a atualizar.; `date`: Data a que o movimento previsto pertence.; `field`: Campo numérico a acumular.; `amount`: Valor monetário usado no cálculo.; `source`: Conteúdo onde o texto esperado é procurado. Devolve: Não devolve valor; atualiza a coleção de baldes recebida.
- `buildCashflowForecast(prisma, input)` (exportada; função) - Calcula previsão de entradas/saídas futuras sem alterar documentos. Entradas: `prisma`: Cliente Prisma.; `input`: Contexto. Devolve: Forecast explicável.

### `real_dev/api/src/modules/treasury/reconciliationPerformance.js`

- `limitReconciliationCandidates(candidates, limit)` (exportada; função) - Limita candidatos para proteger a API de lotes demasiado grandes. Entradas: `candidates`: Movimentos candidatos a correspondencia.; `limit`: Limite operacional do pedido. Devolve: Valor documentado como `{ selected: T[], partial: boolean }`.
- `measureReconciliation(operation)` (exportada; função) - Mede a geracao de sugestoes de reconciliacao. Entradas: `operation`: Operacao real de sugestao. Devolve: Valor documentado como `Promise<{ result: TResult, durationMs: number, withinBudget: boolean, budgetMs: number }>`.

### `real_dev/api/src/modules/treasury/statementImportService.js`

- `startOfTolerance(date)` (top-level; função) - Calcula o limite inferior da janela de tolerância usada nas sugestões de reconciliação. Entradas: `date`: Data usada no cálculo. Devolve: Data inicial da janela de tolerância.
- `endOfTolerance(date)` (top-level; função) - Calcula o limite superior da janela de tolerância usada nas sugestões de reconciliação. Entradas: `date`: Data usada no cálculo. Devolve: Data final da janela de tolerância.
- `referenceMatches(reference, candidateReference)` (top-level; função) - Compara referências externas de forma case-insensitive para reforçar a confiança da sugestão. Entradas: `reference`: Referência externa a comparar.; `candidateReference`: Referência candidata a comparar. Devolve: Booleano que indica se as referências são equivalentes.
- `normalizeCandidateLimit(value)` (top-level; função) - Normaliza o limite opcional de candidatos indicado pelo cliente. Entradas: `value`: Valor recebido no body. Devolve: Limite normalizado.
- `scoreReceiptCandidate(line, receipt)` (top-level; função) - Calcula a pontuacao de um recebimento candidato. Entradas: `line`: Linha de extrato usada como origem da sugestao.; `receipt`: Recebimento interno candidato. Devolve: Sugestao pronta a devolver pela API.
- `scorePaymentCandidate(line, payment)` (top-level; função) - Calcula a pontuacao de um pagamento candidato. Entradas: `line`: Linha de extrato usada como origem da sugestao.; `payment`: Pagamento interno candidato. Devolve: Sugestao pronta a devolver pela API.
- `findReconciliationCandidates(prisma, input)` (top-level; função) - Procura candidatos financeiros compativeis com uma linha de extrato. Entradas: `prisma`: Cliente Prisma.; `input`: Pedido interno. Devolve: Candidatos ordenaveis por score.
- `statementLineKey(row)` (top-level; função) - Cria uma chave estável para detetar linhas de extrato duplicadas no mesmo ficheiro. Entradas: `row`: Linha de dados a processar. Devolve: Chave estável usada para detetar duplicados.
- `statementImportStatus(rejectedLines)` (top-level; função) - Determina se a importação ficou completa ou parcial conforme as linhas rejeitadas. Entradas: `rejectedLines`: Número de linhas rejeitadas na importação. Devolve: Estado final da importação de extrato.
- `deduplicateStatementRows(rows)` (exportada; função) - Remove linhas duplicadas antes de gravar para preservar o contrato de integridade. A base de dados também tem uma constraint composta; esta validação no service permite devolver um resumo parcial em vez de abortar a importação inteira. Entradas: `rows`: Linhas normalizadas. Devolve: Linhas únicas e erros de duplicado.
- `buildSuggestions(tx, companyId, line)` (top-level; função) - Procura recebimentos ou pagamentos compatíveis com uma linha bancária para propor reconciliação sem a confirmar automaticamente. Entradas: `tx`: Transação Prisma usada para consultar dados consistentes.; `companyId`: Identificador da empresa ativa.; `line`: Linha de extrato bancário a reconciliar por sugestão. Devolve: Lista de sugestões de reconciliação para a linha bancária.
- `suggestReconciliations(prisma, context)` (exportada; função) - Sugere correspondencias para uma linha de extrato sem confirmar reconciliacao. Entradas: `prisma`: Cliente Prisma.; `context`: Contexto autenticado. Devolve: Sugestoes medidas.
- `importBankStatement(prisma, context)` (exportada; função) - Importa extrato e cria sugestões auditáveis, sem confirmar reconciliação. Entradas: `prisma`: Cliente Prisma.; `context`: Contexto. Devolve: Importação, linhas e sugestões.

### `real_dev/api/src/modules/treasury/statementImportValidators.js`

- `normalizeText(value)` (top-level; função) - Normaliza texto opcional removendo espaços e devolvendo undefined quando fica vazio. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Texto normalizado, ou valor vazio quando aplicável.
- `parseStatementDate(value)` (top-level; função) - Interpreta datas de extrato nos formatos aceites e rejeita datas inválidas. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Data de extrato validada.
- `parseMoneyToCents(value)` (top-level; função) - Converte valores monetários portugueses ou simples para cêntimos inteiros. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Valor monetário convertido para cêntimos.
- `parseCsv(content)` (top-level; função) - Converte conteúdo CSV simples de extrato bancário em linhas normalizadas. Entradas: `content`: Conteúdo textual a analisar. Devolve: Linhas de extrato e erros extraídos do CSV.
- `pickRowValue(row, keys)` (top-level; função) - Obtém o primeiro valor existente numa linha tabular importada. Entradas: `row`: Linha normalizada pelo parser comum.; `keys`: Nomes de coluna aceites. Devolve: Valor encontrado ou vazio.
- `parseTabularRows(inputRows)` (top-level; função) - Converte linhas CSV/XLSX já parseadas para o contrato interno de extratos. Entradas: `inputRows`: Linhas tabulares com cabeçalhos. Devolve: Linhas e erros de validação.
- `tagValue(block, tag)` (top-level; função) - Extrai o conteúdo de uma tag simples num documento OFX simplificado. Entradas: `block`: Bloco de texto onde a tag é procurada.; `tag`: Nome da tag XML/OFX a extrair. Devolve: Valor textual extraído da tag indicada.
- `parseOfx(content)` (top-level; função) - Extrai transações de um OFX simplificado para o formato interno de linhas de extrato. Entradas: `content`: Conteúdo textual a analisar. Devolve: Linhas de extrato e erros extraídos do OFX simplificado.
- `validateStatementImportPayload(input)` (exportada; função) - Valida payload de importação de extrato. Entradas: `input`: Payload JSON. Devolve: Importação normalizada.

### `real_dev/api/src/modules/treasury/statementRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erros HTTP num formato JSON consistente com o contrato da API. Entradas: `res`: Resposta Express usada para enviar o erro ao cliente.; `error`: Erro capturado durante a operação. Devolve: Resposta HTTP de erro enviada no formato JSON contratado.
- `buildStatementRoutes({ prisma })` (exportada; função) - Constrói o router de importação de extratos bancários. Protege o envio de extratos e delega validação e reconciliação no service. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/vat-rates/vatRateRoutes.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta HTTP.
- `buildVatRateRoutes({ prisma })` (exportada; função) - Constrói o router de taxas de IVA. Permite listar, criar e ativar ou desativar taxas com controlo de empresa e permissões. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/vat-rates/vatRateService.js`

- `normalizeText(value)` (top-level; função) - Normaliza texto de payload para validação. Entradas: `value`: Valor recebido. Devolve: Texto sem espaços laterais.
- `validateVatRateInput(input)` (exportada; função) - Valida payload de taxa de IVA. Entradas: `input`: Payload JSON. Devolve: Dados normalizados.
- `listVatRates(prisma, companyId)` (exportada; função) - Lista taxas de IVA da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Taxas de IVA.
- `createVatRate(prisma, companyId, input)` (exportada; função) - Cria taxa de IVA por empresa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `input`: Payload JSON. Devolve: Taxa criada.
- `setVatRateActive(prisma, companyId, id, isActive)` (exportada; função) - Ativa ou desativa uma taxa de IVA dentro da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `id`: Taxa alvo.; `isActive`: Estado pretendido. Devolve: Taxa atualizada.

### `real_dev/api/src/modules/warehouses/warehouseController.js`

- `sendError(res, error)` (top-level; função) - Envia erro JSON seguro. Entradas: `res`: Resposta Express.; `error`: Erro capturado. Devolve: Resposta JSON.
- `buildWarehouseController({ prisma })` (exportada; função) - Constrói handlers de armazéns. Entradas: `deps`: Dependências. Devolve: Handlers.
- `list(req, res)` (método; método) - Lista armazéns ativos da empresa atual. A resposta é usada por inventário, movimentos e formulários logísticos. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `create(req, res)` (método; método) - Cria um armazém depois de validar código e nome. O controller mantém a validação de entrada separada da regra de persistência. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `listLocations(req, res)` (método; método) - Lista localizações de um armazém. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.
- `createLocation(req, res)` (método; método) - Cria localização dentro de um armazém. Entradas: `req`: Pedido Express.; `res`: Resposta Express. Devolve: Resposta HTTP.

### `real_dev/api/src/modules/warehouses/warehouseRoutes.js`

- `buildWarehouseRoutes({ prisma })` (exportada; função) - Constrói o router de armazéns e localizações. Aplica guards de inventário para listar, criar armazéns e gerir localizações internas. Entradas: `deps`: Dependências. Devolve: Router Express.

### `real_dev/api/src/modules/warehouses/warehouseService.js`

- `serializeWarehouse(warehouse)` (top-level; função) - Serializa armazém para resposta pública. Entradas: `warehouse`: Armazém Prisma. Devolve: Armazém público.
- `serializeLocation(location)` (top-level; função) - Serializa localização para resposta pública. Entradas: `location`: Localização Prisma. Devolve: Localização pública.
- `listWarehouses(prisma, companyId)` (exportada; função) - Lista armazéns ativos da empresa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa. Devolve: Armazéns ativos.
- `createWarehouse(prisma, companyId, input)` (exportada; função) - Cria um armazém depois de validar unicidade de código e nome. A verificação protege a empresa contra duplicados logísticos difíceis de reconciliar. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `input`: Dados validados. Devolve: Armazém criado.
- `createWarehouseLocation(prisma, companyId, warehouseId, input)` (exportada; função) - Cria localização dentro de um armazém da empresa ativa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `warehouseId`: Armazém alvo.; `input`: Dados validados. Devolve: Localização criada.
- `listWarehouseLocations(prisma, companyId, warehouseId)` (exportada; função) - Lista localizações ativas de um armazém da empresa. Entradas: `prisma`: Cliente Prisma.; `companyId`: Empresa ativa.; `warehouseId`: Armazém alvo. Devolve: Localizações ativas.

### `real_dev/api/src/modules/warehouses/warehouseValidators.js`

- `normalizeCode(value, field)` (top-level; função) - Normaliza o código obrigatório de armazém ou localização. O valor é convertido para maiúsculas para manter identificadores logísticos consistentes. Entradas: `value`: Valor recebido.; `field`: Nome do campo. Devolve: Código normalizado.
- `normalizeName(value, field)` (top-level; função) - Normaliza o nome obrigatório de armazém ou localização. A validação exige texto legível para evitar registos logísticos sem identificação humana. Entradas: `value`: Valor recebido.; `field`: Nome do campo. Devolve: Nome normalizado.
- `validateWarehousePayload(body)` (exportada; função) - Valida payload de armazém. Entradas: `body`: Corpo JSON do pedido. Devolve: Payload normalizado.
- `validateWarehouseLocationPayload(body)` (exportada; função) - Valida payload de localização de armazém. Entradas: `body`: Corpo JSON do pedido. Devolve: Payload normalizado.

### `real_dev/api/src/server.js`

- `startServer()` (top-level; função) - Arranca o servidor HTTP. Entradas: sem entradas explícitas Devolve: Instância HTTP devolvida pelo Express.

## Frontend

### `real_dev/web/src/ai/AiPageContext.tsx`

- `AiPageContextProvider({ value, children })` (exportada; componente React) - Disponibiliza ao assistente apenas módulo, referência técnica, período e filtros. O backend não confia neste contexto sem revalidar ownership e empresa.
- `useAiPageContext()` (exportada; hook) - Lê o contexto mínimo da página atual para perguntas contextuais no chat e drawer.

### `real_dev/web/src/ai/AiChat.tsx`

- `ChatWorkspace({ compact })` (top-level; componente React) - Implementa sessões, histórico, consentimento, streaming SSE, fontes, limitações, follow-ups, feedback e eliminação numa superfície reutilizável.
- `AiChatPage()` (exportada; componente React) - Renderiza a página completa `/ai/chat`.
- `AiAssistantDrawer()` (exportada; componente React) - Renderiza o launcher e drawer global responsivo com gestão de foco, `Escape` e acessibilidade de streaming.
- `AiSettingsPage()` (exportada; componente React) - Permite ao `ADMIN` consultar provider, ativar opt-in e gerir política, quotas, regras e thresholds da empresa.

### `real_dev/web/src/lib/aiChatApi.ts`

- `aiChatApi` (exportada; objeto) - Cliente tipado das APIs canónicas de sessões, mensagens SSE, feedback, consentimento, settings e analysis runs. Centraliza encoding de IDs e nunca expõe secrets, prompts ou aliases internos.

### `real_dev/web/src/App.tsx`

- `asObject(value)` (top-level; função) - Converte um valor desconhecido num objeto indexável, devolvendo objeto vazio quando o formato não é seguro. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Objeto indexável seguro, ou objeto vazio quando o valor não é compatível.
- `pickArray(response, key)` (top-level; função) - Extrai um array de uma resposta JSON e normaliza cada entrada para objeto. Entradas: `response`: Resposta JSON recebida da API.; `key`: Chave a extrair da resposta JSON. Devolve: Lista de objetos extraída da resposta JSON.
- `pickSingle(response, key)` (top-level; função) - Extrai um objeto de uma resposta JSON e coloca-o em array para reutilizar a tabela genérica. Entradas: `response`: Resposta JSON recebida da API.; `key`: Chave a extrair da resposta JSON. Devolve: Lista com um único objeto extraído da resposta JSON, ou lista vazia.
- `normalizeFormValues(fields, form)` (top-level; função) - Transforma os campos configuráveis de um formulário em payload JSON tipado para a API. Entradas: `fields`: Configuração dos campos do formulário.; `form`: Dados submetidos pelo formulário. Devolve: Payload JSON normalizado a partir do formulário.
- `toSafeCell(value)` (top-level; função) - Converte qualquer valor recebido da API num valor simples para tabela. Entradas: `value`: Valor bruto vindo de uma linha da API. Devolve: Valor seguro para a tabela responsiva.
- `DataTable({ rows })` (top-level; componente React) - Renderiza dados tabulares com adaptacao automatica para mobile. Entradas: `props`: Linhas devolvidas pela API para o recurso ativo. Devolve: Tabela desktop ou cartoes mobile com os mesmos dados.
- `OperationForm({ operation, onDone })` (top-level; componente React) - Renderiza uma operacao configuravel com feedback imediato de submissao. Entradas: `props`: Operacao e callback executado depois de a API responder. Devolve: Formulario React com estados visiveis de execucao, sucesso e erro.
- `handleSubmit(event)` (interna; função) - Submete a operacao, atualiza a lista dependente e apresenta feedback em cada estado. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `AuthPanel({ onAuthChange })` (top-level; componente React) - Documenta a função AuthPanel no contexto deste módulo. Entradas: `props`: Propriedades recebidas pelo componente React. Devolve: Elemento React renderizado para autenticação e sessão.
- `refreshMe()` (interna; função) - Documenta a função refreshMe no contexto deste módulo. Entradas: sem entradas explícitas Devolve: Promise resolvida depois de atualizar o snapshot da sessão.
- `ResourcePanel({ resource })` (top-level; componente React) - Renderiza um recurso CRUD configurável com moldura visual consistente entre módulos. Entradas: `props`: Recurso com loader, pesquisa e operações. Devolve: Elemento React com lista, ações e feedback.
- `load()` (interna; função) - Carrega dados do modulo ativo e apresenta o estado da acao ao utilizador. Entradas: sem entradas explícitas Devolve: Promise resolvida quando os dados visíveis são atualizados.
- `App()` (exportada; componente React) - Renderiza a aplicação principal e coordena autenticação, contexto de empresa e navegação entre módulos. Entradas: sem entradas explícitas Devolve: Elemento React renderizado da aplicação principal.
- `personFields(requireNif)` (top-level; função) - Define campos comuns de clientes e fornecedores para evitar duplicação nos formulários MF0. Entradas: `requireNif`: Indica se o NIF é obrigatório no formulário. Devolve: Lista de campos partilhados por clientes e fornecedores.
- `personOperations(label, client, requireNif)` (top-level; função) - Cria as operações CRUD partilhadas por clientes e fornecedores. Entradas: `label`: Nome amigável usado em mensagens de erro ou UI.; `client`: Cliente de API usado pelas operações CRUD.; `requireNif`: Indica se o NIF é obrigatório no formulário. Devolve: Lista de operações CRUD para clientes ou fornecedores.
- `itemFields()` (top-level; função) - Define os campos reutilizáveis dos formulários de artigos e serviços. Entradas: sem entradas explícitas Devolve: Lista de campos reutilizáveis para formulários de artigos.

### `real_dev/web/src/lib/accountingApi.ts`

- `postSaleDocument(saleDocumentId)` (método; método) - Gera o lançamento contabilístico de um documento de venda já elegível. Entradas: `saleDocumentId`: Identificador do documento de venda alvo. Devolve: Resposta da API com o lançamento contabilístico de venda gerado.
- `postPurchaseDocument(purchaseDocumentId)` (método; método) - Gera o lançamento contabilístico de um documento de compra já aprovado. Entradas: `purchaseDocumentId`: Identificador do documento de compra alvo. Devolve: Resposta da API com o lançamento contabilístico de compra gerado.

### `real_dev/web/src/lib/apiClient.ts`

- `queryString(params)` (top-level; função) - Constrói uma query string simples sem aceitar valores vazios. Entradas: `params`: Parâmetros opcionais. Devolve: Query string com `?` inicial ou string vazia.
- `createApiClient(options)` (exportada; função) - Constrói um cliente HTTP simples para a API OPSA. Entradas: `options`: Configuração opcional do cliente. Devolve: Função `request` tipada para chamadas JSON.
- `request(method, path, requestOptions)` (interna; função) - Executa uma chamada HTTP JSON contra a API. Entradas: `method`: Método HTTP.; `path`: Caminho relativo ao `baseUrl`.; `requestOptions`: Body JSON opcional. Devolve: Resposta JSON tipada ou `undefined` em respostas sem conteúdo.
- `register(body)` (método; método) - Regista utilizador e recebe a sessão por cookie HttpOnly. Entradas: `body`: Payload de registo definido no BK-MF0-01. Devolve: Resposta JSON da API de autenticação.
- `login(body)` (método; método) - Autentica utilizador e recebe a sessão por cookie HttpOnly. Entradas: `body`: Payload de login definido no BK-MF0-01. Devolve: Resposta JSON da API de autenticação.
- `me()` (método; método) - Obtém o utilizador autenticado. Entradas: sem entradas explícitas Devolve: Resposta JSON com o utilizador da sessão atual.
- `logout()` (método; método) - Revoga a sessão atual. Entradas: sem entradas explícitas Devolve: Resposta sem conteúdo quando o logout termina com sucesso.
- `forgotPassword(body)` (método; método) - Pede recuperação de password sem revelar se o email existe. Entradas: `body`: Payload com email normalizado pelo backend. Devolve: Resposta genérica `{ ok: true }`.
- `resetPassword(body)` (método; método) - Define nova password a partir de token de recuperação. Entradas: `body`: Payload com token e nova password. Devolve: Resposta genérica `{ ok: true }`.
- `list()` (método; método) - Lista empresas acessíveis ao utilizador autenticado. Entradas: sem entradas explícitas Devolve: Lista de empresas/memberships do utilizador.
- `switchCompany(body)` (método; método) - Seleciona empresa ativa na sessão. Entradas: `body`: Payload `{ companyId }`. Devolve: Contexto ativo da empresa.
- `context()` (método; método) - Obtém empresa ativa da sessão. Entradas: sem entradas explícitas Devolve: Contexto multiempresa atual.
- `permissions()` (método; método) - Obtém role e permissões da empresa ativa. Entradas: sem entradas explícitas Devolve: Permissões calculadas pelo backend.
- `users()` (método; método) - Lista utilizadores da empresa ativa. Entradas: sem entradas explícitas Devolve: Membros ativos da empresa.
- `inviteUser(body)` (método; método) - Cria convite para novo membro da empresa. Entradas: `body`: Payload com email e role. Devolve: Convite criado.
- `updateUserRole(id, body)` (método; método) - Atualiza role de um membro. Entradas: `id`: Identificador do utilizador alvo.; `body`: Payload com nova role. Devolve: Role atualizada.
- `removeUser(id)` (método; método) - Remove membership ativa de um utilizador. Entradas: `id`: Identificador do utilizador alvo. Devolve: Resposta sem conteúdo.
- `getProfile()` (método; método) - Obtém perfil da empresa ativa. Entradas: sem entradas explícitas Devolve: Perfil fiscal e operacional da empresa.
- `updateProfile(body)` (método; método) - Cria ou atualiza perfil da empresa ativa. Entradas: `body`: Payload do BK-MF0-06. Devolve: Perfil persistido.
- `listAccounts()` (método; método) - Lista contas SNC da empresa. Entradas: sem entradas explícitas Devolve: Plano de contas da empresa ativa.
- `createAccount(body)` (método; método) - Cria conta SNC manual. Entradas: `body`: Payload de conta do BK-MF0-07. Devolve: Conta criada.
- `importAccounts(body)` (método; método) - Importa contas já normalizadas. Entradas: `body`: Payload `{ rows: [...] }`. Devolve: Total importado.
- `listFiscalPeriods()` (método; método) - Lista períodos fiscais da empresa. Entradas: sem entradas explícitas Devolve: Períodos fiscais ordenados.
- `createFiscalPeriod(body)` (método; método) - Cria período fiscal aberto. Entradas: `body`: Payload do BK-MF0-08. Devolve: Período fiscal criado.
- `closeFiscalPeriod(id)` (método; método) - Fecha um período fiscal aberto da empresa ativa. Esta ação delega no backend a validação contabilística antes de bloquear novas alterações. Entradas: `id`: Identificador do período fiscal. Devolve: Período fiscal fechado.
- `postSaleDocument(id)` (método; método) - Contabiliza documento de venda emitido. Entradas: `id`: Identificador do documento de venda. Devolve: Lançamento contabilístico criado.
- `postPurchaseDocument(id)` (método; método) - Contabiliza documento de compra aprovado. Entradas: `id`: Identificador do documento de compra. Devolve: Lançamento contabilístico criado.
- `list(search)` (método; método) - Lista clientes ativos e aplica pesquisa opcional no backend. A função mantém a página desacoplada do formato da query string. Entradas: `search`: Texto opcional de pesquisa. Devolve: Clientes da empresa ativa.
- `create(body)` (método; método) - Cria um cliente no contexto da empresa ativa. O payload segue o contrato validado pelo backend para NIF, email e dados comerciais. Entradas: `body`: Payload do BK-MF0-09. Devolve: Cliente criado.
- `update(id, body)` (método; método) - Atualiza os dados principais de um cliente existente. A API valida novamente o payload completo antes de persistir alterações. Entradas: `id`: Identificador do cliente.; `body`: Payload completo do cliente. Devolve: Cliente atualizado.
- `remove(id)` (método; método) - Desativa um cliente sem remover o histórico associado. O backend preserva a rastreabilidade e devolve uma resposta sem conteúdo. Entradas: `id`: Identificador do cliente. Devolve: Resposta sem conteúdo.
- `list(search)` (método; método) - Lista fornecedores ativos e aplica pesquisa opcional no backend. A função reutiliza o mesmo padrão dos clientes para manter a UI consistente. Entradas: `search`: Texto opcional de pesquisa. Devolve: Fornecedores da empresa ativa.
- `create(body)` (método; método) - Cria um fornecedor no contexto da empresa ativa. O payload é enviado ao backend para validação fiscal e comercial. Entradas: `body`: Payload do BK-MF0-10. Devolve: Fornecedor criado.
- `update(id, body)` (método; método) - Atualiza os dados principais de um fornecedor existente. A chamada preserva o contrato de validação centralizado no backend. Entradas: `id`: Identificador do fornecedor.; `body`: Payload completo do fornecedor. Devolve: Fornecedor atualizado.
- `remove(id)` (método; método) - Desativa um fornecedor sem apagar o histórico operacional. O backend mantém a informação necessária para auditoria e documentos antigos. Entradas: `id`: Identificador do fornecedor. Devolve: Resposta sem conteúdo.
- `list()` (método; método) - Lista artigos e serviços ativos. Entradas: sem entradas explícitas Devolve: Itens da empresa ativa.
- `create(body)` (método; método) - Cria artigo ou serviço. Entradas: `body`: Payload do BK-MF0-11. Devolve: Item criado.
- `update(id, body)` (método; método) - Atualiza artigo ou serviço. Entradas: `id`: Identificador do item.; `body`: Payload completo do item. Devolve: Item atualizado.
- `remove(id)` (método; método) - Desativa artigo ou serviço. Entradas: `id`: Identificador do item. Devolve: Resposta sem conteúdo.
- `list()` (método; método) - Lista armazéns ativos disponíveis para movimentos de stock. A função alimenta formulários e páginas que precisam da estrutura logística atual. Entradas: sem entradas explícitas Devolve: Armazéns da empresa ativa.
- `create(body)` (método; método) - Cria um armazém operacional para a empresa ativa. O backend valida código e nome antes de disponibilizar o armazém ao inventário. Entradas: `body`: Payload do BK-MF0-12. Devolve: Armazém criado.
- `listLocations(id)` (método; método) - Lista localizações de um armazém. Entradas: `id`: Identificador do armazém. Devolve: Localizações ativas.
- `createLocation(id, body)` (método; método) - Cria localização num armazém. Entradas: `id`: Identificador do armazém.; `body`: Payload da localização. Devolve: Localização criada.
- `list()` (método; método) - Lista taxas de IVA da empresa ativa. Entradas: sem entradas explícitas Devolve: Taxas de IVA.
- `create(body)` (método; método) - Cria taxa de IVA. Entradas: `body`: Payload da taxa de IVA. Devolve: Taxa criada.
- `setActive(id, body)` (método; método) - Ativa ou desativa taxa de IVA. Entradas: `id`: Identificador da taxa.; `body`: Payload `{ isActive }`. Devolve: Taxa atualizada.
- `listDocuments()` (método; método) - Lista documentos de venda. Entradas: sem entradas explícitas Devolve: Documentos de venda.
- `createDocument(body)` (método; método) - Cria documento de venda em rascunho. Entradas: `body`: Payload do documento. Devolve: Documento criado.
- `submitDocument(id)` (método; método) - Submete documento de venda. Entradas: `id`: Identificador do documento. Devolve: Documento submetido.
- `approveDocument(id)` (método; método) - Aprova documento de venda. Entradas: `id`: Identificador do documento. Devolve: Documento aprovado.
- `rejectDocument(id, body)` (método; método) - Rejeita documento de venda. Entradas: `id`: Identificador do documento.; `body`: Payload `{ reason }`. Devolve: Documento rejeitado.
- `issueDocument(id)` (método; método) - Emite documento de venda aprovado. Entradas: `id`: Identificador do documento. Devolve: Documento emitido.
- `registerReceipt(id, body)` (método; método) - Regista recebimento de documento de venda. Entradas: `id`: Identificador do documento.; `body`: Payload do recebimento. Devolve: Recebimento criado.
- `listOpenItems(asOfDate)` (método; método) - Lista títulos de venda em aberto. Entradas: `asOfDate`: Data de referência opcional. Devolve: Títulos em aberto.
- `listDocuments()` (método; método) - Lista documentos de compra. Entradas: sem entradas explícitas Devolve: Documentos de compra.
- `createDocument(body)` (método; método) - Cria documento de compra em rascunho. Entradas: `body`: Payload do documento. Devolve: Documento criado.
- `approveDocument(id)` (método; método) - Aprova documento de compra. Entradas: `id`: Identificador do documento. Devolve: Documento aprovado.
- `rejectDocument(id, body)` (método; método) - Rejeita documento de compra com justificação. Entradas: `id`: Identificador do documento.; `body`: Payload `{ reason }`. Devolve: Documento rejeitado.
- `approvalHistory(id)` (método; método) - Lista histórico de aprovação/reprovação de uma compra. Entradas: `id`: Identificador do documento. Devolve: Histórico de decisões.
- `postState(id)` (método; método) - Lança estado contabilístico da compra. Entradas: `id`: Identificador do documento. Devolve: Lançamento contabilístico criado.
- `registerPayment(id, body)` (método; método) - Regista pagamento de compra. Entradas: `id`: Identificador do documento.; `body`: Payload do pagamento. Devolve: Pagamento criado.
- `listStockMovements()` (método; método) - Lista movimentos de stock registados para a empresa ativa. A resposta alimenta a página de inventário sem expor detalhes do endpoint. Entradas: sem entradas explícitas Devolve: Movimentos de stock devolvidos pela API.
- `createStockMovement(body)` (método; método) - Cria um movimento de stock manual ou operacional. O backend valida artigo, armazém, quantidade e sentido antes de persistir. Entradas: `body`: Payload JSON do movimento de stock. Devolve: Movimento de stock criado.
- `previewFifoCost(params)` (método; método) - Calcula uma pré-visualização de custo FIFO sem gravar movimento. A query identifica artigo, armazém e quantidade a simular. Entradas: `params`: Parâmetros necessários para a simulação FIFO. Devolve: Resultado de custo previsto para a saída de stock.
- `listCounts()` (método; método) - Lista contagens físicas de inventário da empresa ativa. A função suporta o ecrã de reconciliação entre stock contado e stock registado. Entradas: sem entradas explícitas Devolve: Contagens físicas existentes.
- `createCount(body)` (método; método) - Cria uma nova contagem física em estado inicial. O payload define o contexto logístico que será detalhado por linhas. Entradas: `body`: Payload JSON da contagem física. Devolve: Contagem física criada.
- `saveCountLines(id, body)` (método; método) - Guarda linhas contadas para uma contagem física existente. O backend valida cada linha antes de atualizar as quantidades observadas. Entradas: `id`: Identificador da contagem física.; `body`: Payload JSON com as linhas contadas. Devolve: Linhas guardadas para a contagem.
- `postCount(id)` (método; método) - Lança uma contagem física e aplica os ajustamentos necessários. A operação fecha a contagem e pede ao backend para calcular diferenças. Entradas: `id`: Identificador da contagem física a lançar. Devolve: Contagem lançada com o estado final.
- `listStockAlerts()` (método; método) - Lista alertas de stock calculados para a empresa ativa. A resposta combina níveis mínimos, existências e regras configuradas. Entradas: sem entradas explícitas Devolve: Alertas de stock prontos a apresentar na UI.
- `saveStockAlertSetting(body)` (método; método) - Guarda a configuração usada para gerar alertas de stock. O backend valida limites e contexto antes de recalcular os alertas. Entradas: `body`: Payload JSON com a configuração de alerta. Devolve: Configuração persistida.
- `create(body)` (método; método) - Cria um lançamento manual de contabilidade. O backend valida o equilíbrio entre débitos e créditos antes de persistir. Entradas: `body`: Payload JSON do lançamento manual. Devolve: Lançamento manual criado.
- `get(id)` (método; método) - Consulta um lançamento manual específico. A função devolve o detalhe necessário para revisão ou edição. Entradas: `id`: Identificador do lançamento manual. Devolve: Lançamento manual encontrado.
- `update(id, body)` (método; método) - Atualiza um lançamento manual existente. A API volta a validar linhas, contas e equilíbrio contabilístico. Entradas: `id`: Identificador do lançamento manual.; `body`: Payload JSON com os novos dados contabilísticos. Devolve: Lançamento manual atualizado.
- `addAttachment(id, body)` (método; método) - Associa um anexo a um lançamento manual. O payload contém os metadados ou conteúdo aceites pelo backend. Entradas: `id`: Identificador do lançamento manual.; `body`: Payload JSON do anexo. Devolve: Anexo registado no lançamento.
- `trialBalance(from, to)` (método; método) - Consulta o balancete para um intervalo de datas. A query é montada no client e validada no backend antes do cálculo. Entradas: `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD. Devolve: Balancete calculado para a empresa ativa.
- `ledger(accountId, from, to)` (método; método) - Consulta a razão de uma conta num intervalo temporal. O backend valida a conta e agrega os movimentos autorizados. Entradas: `accountId`: Identificador da conta contabilística.; `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD. Devolve: Razão contabilística da conta selecionada.
- `trialBalanceExportUrl(from, to, format)` (método; método) - Constrói o URL de exportação do balancete. Ao devolver o URL, a UI pode usá-lo diretamente em downloads autenticados. Entradas: `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD.; `format`: Formato de exportação pedido. Devolve: URL absoluto para exportar o balancete.
- `ledgerExportUrl(accountId, from, to, format)` (método; método) - Constrói o URL de exportação da razão de uma conta. A função mantém a montagem da query junto do client contabilístico. Entradas: `accountId`: Identificador da conta contabilística.; `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD.; `format`: Formato de exportação pedido. Devolve: URL absoluto para exportar a razão.
- `incomeStatement(from, to)` (método; método) - Consulta a demonstração de resultados para o período selecionado. O backend calcula rendimentos, gastos e resultado líquido da empresa ativa. Entradas: `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD. Devolve: Demonstração de resultados calculada.
- `balanceSheet(from, to)` (método; método) - Consulta o balanço para o período selecionado. A função delega a agregação de ativos, passivos e capital próprio no backend. Entradas: `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD. Devolve: Balanço calculado para a empresa ativa.
- `vatMap(from, to)` (método; método) - Consulta o mapa de IVA para um intervalo fiscal. A API agrega IVA liquidado e dedutível a partir dos documentos autorizados. Entradas: `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD. Devolve: Mapa de IVA calculado.
- `listAccounts()` (método; método) - Lista contas bancárias registadas na tesouraria. A resposta alimenta reconciliações, importações e previsões de caixa. Entradas: sem entradas explícitas Devolve: Contas bancárias da empresa ativa.
- `createAccount(body)` (método; método) - Cria uma conta bancária de tesouraria. O backend valida identificadores e dados bancários antes de persistir. Entradas: `body`: Payload JSON da conta bancária. Devolve: Conta bancária criada.
- `importStatement(body)` (método; método) - Importa linhas de extrato bancário. A função envia o ficheiro ou linhas normalizadas para processamento no backend. Entradas: `body`: Payload JSON da importação de extrato. Devolve: Resumo da importação realizada.
- `forecast(from, to)` (método; método) - Consulta a previsão de cashflow para um intervalo. O backend cruza recebimentos, pagamentos e documentos em aberto. Entradas: `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD. Devolve: Previsão de cashflow calculada.
- `businessData(body)` (método; método) - Importa dados comerciais em lote. O backend decide a rota de criação ou atualização por tipo de linha recebida. Entradas: `body`: Payload JSON com linhas de clientes, fornecedores, artigos ou extratos. Devolve: Resumo da importação de dados comerciais.
- `saft(from, to)` (método; método) - Gera ou consulta o pacote SAF-T para o período indicado. A função representa o ponto de entrada de compliance usado pela UI. Entradas: `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD. Devolve: Resultado SAF-T devolvido pela API.
- `operational(from, to)` (método; método) - Consulta o relatório operacional para um intervalo de datas. O backend agrega vendas, compras, tesouraria e indicadores de execução. Entradas: `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD. Devolve: Relatório operacional calculado.
- `executiveKpis(from, to)` (método; método) - Consulta KPIs executivos para o dashboard de gestão. A função delega no backend a agregação financeira e operacional. Entradas: `from`: Data inicial no formato YYYY-MM-DD.; `to`: Data final no formato YYYY-MM-DD. Devolve: Indicadores executivos calculados.

### `real_dev/web/src/lib/formatters.ts`

- `groupPortugueseThousands(integerPart)` (top-level; função) - Aplica agrupamento europeu com espaco apenas a parte inteira devolvida pelo Intl. Entradas: `integerPart`: Parte inteira ja separada por `formatToParts`. Devolve: Parte inteira com grupos de tres algarismos.
- `formatWithGroupedInteger(formatter, value)` (top-level; função) - Mantem decimal, moeda e sinais vindos do Intl, substituindo apenas a parte inteira. Entradas: `formatter`: Formatador Intl configurado para `pt-PT`.; `value`: Numero ja validado. Devolve: Texto com separador de milhar europeu tambem para valores de quatro digitos.
- `assertFiniteNumber(value, label)` (top-level; função) - Garante que o valor recebido e um numero finito antes de o apresentar. Entradas: `value`: Valor candidato a numero.; `label`: Nome usado na mensagem de erro. Devolve: Numero validado.
- `assertIntegerCents(cents)` (top-level; função) - Garante que um valor monetario em centimos e inteiro. Entradas: `cents`: Valor monetario tecnico guardado em centimos. Devolve: Centimos validados.
- `parseIsoDate(value)` (top-level; função) - Converte uma data ISO curta ou uma data ISO com hora numa data UTC estavel. Entradas: `value`: Data recebida da API. Devolve: Data pronta para formatacao em PT-PT.
- `formatEuroFromCents(cents)` (exportada; função) - Formata centimos como euros para apresentacao no frontend. Entradas: `cents`: Valor monetario guardado em centimos. Devolve: Valor em EUR no formato portugues.
- `formatDecimalPt(value, fractionDigits)` (exportada; função) - Formata um numero decimal com separador portugues. Entradas: `value`: Numero decimal a apresentar.; `fractionDigits`: Numero de casas decimais. Devolve: Numero formatado em PT-PT.
- `formatIntegerPt(value)` (exportada; função) - Formata um inteiro com separadores de milhar em PT-PT. Entradas: `value`: Numero inteiro a apresentar. Devolve: Inteiro formatado em PT-PT.
- `formatPercentFromBasisPoints(basisPoints)` (exportada; função) - Formata basis points como percentagem para leitura humana. Entradas: `basisPoints`: Percentagem tecnica, por exemplo 2300 para 23,00 %. Devolve: Percentagem formatada em PT-PT.
- `formatPortugueseDate(isoDate)` (exportada; função) - Formata data ISO para leitura em Portugal. Entradas: `isoDate`: Data ISO recebida da API. Devolve: Data curta em portugues de Portugal.
- `formatDisplayValue(columnName, value)` (exportada; função) - Formata um valor de tabela usando o nome da coluna como pista semantica. Entradas: `columnName`: Nome da coluna ou campo vindo da API.; `value`: Valor recebido da API. Devolve: Texto pronto a apresentar ao utilizador.

### `real_dev/web/src/lib/mf1FormUtils.ts`

- `asObject(value)` (exportada; função) - Converte um valor desconhecido num objeto indexável, devolvendo objeto vazio quando o formato não é seguro. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Objeto indexável seguro, ou objeto vazio quando o valor não é compatível.
- `pickArray(response, key)` (exportada; função) - Extrai um array de uma resposta JSON e normaliza cada entrada para objeto. Entradas: `response`: Resposta JSON recebida da API.; `key`: Chave a extrair da resposta JSON. Devolve: Lista de objetos extraída da resposta JSON.
- `formatValue(value, columnName)` (exportada; função) - Converte valores heterogéneos da API numa representação textual PT-PT para tabelas. Entradas: `value`: Valor a normalizar ou formatar.; `columnName`: Nome da coluna que ajuda a escolher moeda, data ou percentagem. Devolve: Representação textual estável do valor recebido.
- `toPositiveInteger(value, label)` (exportada; função) - Converte texto de formulário num inteiro positivo obrigatório. Entradas: `value`: Valor a normalizar ou formatar.; `label`: Nome amigável usado em mensagens de erro ou UI. Devolve: Inteiro positivo validado.
- `requiredText(value, label)` (exportada; função) - Normaliza texto obrigatório e lança erro claro quando o campo está vazio. Entradas: `value`: Valor a normalizar ou formatar.; `label`: Nome amigável usado em mensagens de erro ou UI. Devolve: Texto obrigatório validado.
- `optionalText(value)` (exportada; função) - Normaliza texto opcional, devolvendo undefined para campos vazios. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Texto normalizado, ou undefined quando o campo está vazio.

### `real_dev/web/src/lib/mf4Api.ts`

- `getAiInsights(from, to)` (exportada; função) - Lê insights paginados já persistidos para o período; não gera resultados por efeito lateral.
- `getAiSuggestions()` (exportada; função) - Lê sugestões e respetivo lifecycle para revisão humana.
- `askAiQuestion(question)` (exportada; função legada) - Cliente do adapter depreciado `/api/ai/questions`. A navegação canónica usa `aiChatApi` e `/ai/chat`.
- `getSmartAlerts(from, to)` (exportada; função) - Lê alertas paginados já persistidos para o período.
- `createAiAnalysisRun(from, to)` (exportada; função) - Agenda uma atualização manual e devolve o run em `QUEUED`.
- `getAiAnalysisRun(id)` (exportada; função) - Consulta `QUEUED`, `RUNNING`, `COMPLETED` ou `FAILED` para polling da UI.
- `updateAiInsightStatus(id, status)` (exportada; função) - Reconhece, resolve ou dispensa um insight autorizado.
- `updateAiSuggestionStatus(id, status, feedback)` (exportada; função) - Aceita, dispensa ou conclui uma sugestão e regista feedback controlado.
- `updateSmartAlertStatus(id, status)` (exportada; função) - Atualiza o lifecycle de um alerta autorizado.
- `getInsightExplanation(id)` (exportada; função) - Obtém a explicação pedagógica e auditável de um insight específico. O identificador é codificado no caminho para evitar caracteres inseguros no URL. Entradas: `id`: Identificador do insight cuja explicação deve ser consultada. Devolve: Explicação do insight com fonte e guardrail associado.
- `getReminders()` (exportada; função) - Lista os lembretes operacionais visíveis na empresa ativa. O backend resolve a sessão através dos cookies HttpOnly partilhados pelo client. Entradas: sem entradas explícitas Devolve: Coleção de lembretes ordenada pela API.
- `createReminder(body)` (exportada; função) - Cria um lembrete operacional com os campos normalizados pelo formulário. A validação final continua no backend para proteger o contrato da API. Entradas: `body`: Payload JSON com título, tipo, prazo e descrição opcional. Devolve: Lembrete criado e persistido.
- `updateReminderStatus(id, status)` (exportada; função) - Atualiza o estado funcional de um lembrete existente. É usado pela UI para marcar lembretes como concluídos sem reescrever os restantes campos. Entradas: `id`: Identificador do lembrete a atualizar.; `status`: Novo estado funcional, por exemplo `DONE`. Devolve: Lembrete atualizado devolvido pela API.
- `getTasks()` (exportada; função) - Lista tarefas operacionais da empresa ativa. A função centraliza o endpoint usado pelas páginas MF4 para manter a UI desacoplada do URL. Entradas: sem entradas explícitas Devolve: Lista de tarefas operacionais devolvida pelo backend.
- `createTask(body)` (exportada; função) - Cria uma tarefa operacional a partir dos dados recolhidos no formulário. O payload é mantido genérico para acompanhar o contrato JSON validado pelo backend. Entradas: `body`: Payload JSON com título, prazo, descrição e responsável opcional. Devolve: Tarefa criada e persistida.
- `updateTaskStatus(id, status)` (exportada; função) - Atualiza apenas o estado de uma tarefa operacional. A UI usa esta chamada para concluir tarefas sem alterar título, prazo ou responsável. Entradas: `id`: Identificador da tarefa a atualizar.; `status`: Novo estado funcional, por exemplo `DONE`. Devolve: Tarefa atualizada devolvida pela API.
- `getNotifications()` (exportada; função) - Lista notificações internas disponíveis para o utilizador autenticado. O resultado alimenta a página de notificações sem expor detalhes do transporte HTTP. Entradas: sem entradas explícitas Devolve: Notificações internas devolvidas pela API.
- `syncNotifications()` (exportada; função) - Pede ao backend para sincronizar notificações a partir das fontes operacionais. É uma ação explícita da UI para reconstruir a lista sem duplicar regras no frontend. Entradas: sem entradas explícitas Devolve: Notificações resultantes da sincronização.
- `markNotificationRead(id)` (exportada; função) - Marca uma notificação interna como lida. O identificador é codificado no URL e a API devolve o registo atualizado. Entradas: `id`: Identificador da notificação a marcar como lida. Devolve: Notificação atualizada com `readAt` preenchido quando aplicável.
- `getAuditLogs()` (exportada; função) - Consulta logs de auditoria funcionais da empresa ativa. A função agrega o contrato de leitura usado pela página de auditoria MF4. Entradas: sem entradas explícitas Devolve: Lista de eventos de auditoria devolvidos pelo backend.
- `getIntegrationLogs()` (exportada; função) - Consulta logs de integração técnica e operacional. A chamada alimenta a página MF4 que mostra importações, sincronizações e estados externos. Entradas: sem entradas explícitas Devolve: Lista de logs de integração devolvidos pela API.

### `real_dev/web/src/lib/mf5ErrorMessages.ts`

- `normalizeCaughtError(error)` (top-level; função) - Garante que um valor capturado em catch e tratado como erro seguro. Entradas: `error`: Valor capturado durante uma operacao da UI. Devolve: Erro nativo ou erro da API.
- `inferHelpFromValidationDetail(detail)` (top-level; função) - Infere orientacao para mensagens locais criadas pelo BK-MF5-05. Entradas: `detail`: Mensagem agregada de validacao local. Devolve: Proxima acao adequada ao campo provavel.
- `looksLikeValidationDetail(detail)` (top-level; função) - Reconhece mensagens locais de validacao que ainda chegam como Error generico. Entradas: `detail`: Mensagem de erro nativa ou local. Devolve: Verdadeiro quando a mensagem parece validacao do formulario.
- `helpForApiError(error)` (top-level; função) - Escolhe ajuda para erros API preservando status e code. Entradas: `error`: Erro vindo do cliente HTTP. Devolve: Texto de ajuda associado ao codigo/status.
- `formatUiMessage(message)` (top-level; função) - Formata uma mensagem estruturada para componentes que ainda recebem texto simples. Entradas: `message`: Mensagem estruturada de UI. Devolve: Texto curto com causa e proxima acao.
- `toUiValidationError(errors)` (exportada; função) - Converte erros de validacao local do BK-MF5-05 para mensagem clara de UI. Entradas: `errors`: Erros devolvidos pelos validadores MF5. Devolve: Mensagem com detalhe e proxima acao.
- `toUiErrorMessage(error)` (exportada; função) - Converte erros tecnicos em mensagens uteis para o utilizador. Entradas: `error`: Erro capturado durante uma chamada de API ou execucao local. Devolve: Mensagem estruturada para apresentacao na UI.
- `formatMf5ValidationUiError(errors)` (exportada; função) - Formata erros locais vindos dos validadores MF5. Entradas: `errors`: Erros devolvidos por validateMf5Form ou validateMf5FormData. Devolve: Texto pronto a apresentar no feedback do formulario.
- `formatUiError(error)` (exportada; função) - Formata erros da API ou erros inesperados para componentes que recebem texto. Entradas: `error`: Erro capturado pela UI. Devolve: Texto pronto a apresentar no feedback do ecra.

### `real_dev/web/src/lib/mf5FormValidators.ts`

- `asText(value)` (top-level; função) - Converte valores primitivos para texto aparado. Entradas: `value`: Valor recebido do formulário. Devolve: Texto seguro para validação de formato.
- `hasValidNifChecksum(nif)` (top-level; função) - Calcula o checksum oficial de NIF português usado também no backend. Entradas: `nif`: NIF com 9 algarismos. Devolve: Verdadeiro quando o dígito de controlo é válido.
- `normalizeTarget(target)` (top-level; função) - Normaliza um alvo de validação declarado por string ou objeto. Entradas: `target`: Campo a validar. Devolve: Alvo normalizado com nome real e alias opcional.
- `pushError(errors, error)` (top-level; função) - Acrescenta um erro à lista apenas quando o validador encontrou uma falha. Entradas: `errors`: Lista acumulada de erros.; `error`: Resultado de um validador individual. Devolve: Não devolve valor; altera a lista recebida quando existe erro.
- `validateNif(value, field)` (exportada; função) - Valida NIF português por formato e checksum. Entradas: `value`: Texto introduzido pelo utilizador.; `field`: Campo real validado. Devolve: Erro de validação ou null.
- `validatePortugueseIban(value, field)` (exportada; função) - Valida IBAN português com prefixo, tamanho e resto ISO 7064 mod 97. Entradas: `value`: Texto introduzido pelo utilizador.; `field`: Campo real validado. Devolve: Erro de validação ou null.
- `validateIsoDate(field, value)` (exportada; função) - Valida datas ISO sem permitir normalização silenciosa do JavaScript. Entradas: `field`: Nome do campo validado.; `value`: Valor do input. Devolve: Erro de validação ou null.
- `validateVatBps(value, field)` (exportada; função) - Valida uma taxa de IVA guardada em basis points. Entradas: `value`: Valor técnico, por exemplo 2300 para 23,00%.; `field`: Campo real validado. Devolve: Erro de validação ou null.
- `validateVatPercent(value, field)` (exportada; função) - Valida uma percentagem de IVA apresentada ao utilizador. Entradas: `value`: Percentagem escrita pelo utilizador.; `field`: Campo real validado. Devolve: Erro de validação ou null.
- `validateKnownId(field, value)` (exportada; função) - Valida presença de identificador selecionado numa lista controlada. Entradas: `field`: Campo de identificador validado.; `value`: Valor selecionado no formulário. Devolve: Erro de validação ou null.
- `validateSncAccount(value, field)` (exportada; função) - Valida código de conta SNC usado no MVP. Entradas: `value`: Código introduzido.; `field`: Campo real validado. Devolve: Erro de validação ou null.
- `toPrimitiveValidationValues(values)` (exportada; função) - Mantém apenas valores primitivos que podem ser validados por formato no frontend. Entradas: `values`: Valores recolhidos pelo formulário. Devolve: Valores seguros para validação textual.
- `validateMf5Field(field, value, options)` (exportada; função) - Valida um único campo de formulário por contrato explícito de nome. Entradas: `field`: Nome real do campo no formulário.; `value`: Valor primitivo do campo.; `options`: Alias semântico e obrigatoriedade local. Devolve: Lista de erros encontrados.
- `validateMf5Form(values, targets)` (exportada; função) - Executa validadores antes de submeter o formulário. Entradas: `values`: Valores normalizados pelo formulário.; `targets`: Campos e aliases semânticos a validar; por omissão usa os nomes de `values`. Devolve: Lista de erros encontrados.
- `validateMf5FormData(form, fieldNames)` (exportada; função) - Valida campos selecionados diretamente a partir de FormData. Entradas: `form`: FormData criado no submit.; `fieldNames`: Campos que o formulário deve validar localmente. Devolve: Lista de erros encontrados.
- `assertMf5FormValues(values, targets)` (exportada; função) - Lança erro se valores já normalizados tiverem campos críticos inválidos. Entradas: `values`: Valores primitivos recolhidos do formulário.; `targets`: Campos cobertos pelo RNF05. Devolve: Não devolve valor; lança erro quando existe validação inválida.
- `assertMf5FormData(form, fieldNames)` (exportada; função) - Lança erro se os campos selecionados do FormData tiverem formatos inválidos. Entradas: `form`: Dados submetidos pelo utilizador.; `fieldNames`: Campos cobertos pelo RNF05. Devolve: Não devolve valor; lança erro quando o FormData contém campos inválidos.
- `formatMf5FormErrors(errors)` (exportada; função) - Formata erros de validação para o contrato de feedback imediato. Entradas: `errors`: Lista de erros devolvida pelos validadores. Devolve: Mensagem agregada para mostrar no formulário.

### `real_dev/web/src/lib/mf5PerformanceBudget.ts`

- `measureUiLoad(surface, label, operation)` (exportada; função) - Mede a duração de uma operação assíncrona da UI e compara com o orçamento MF5. Entradas: `surface`: Tipo de ecrã medido.; `label`: Nome visível do dashboard ou listagem.; `operation`: Operação assíncrona que carrega dados. Devolve: Resultado da operação e amostra de performance.
- `measureListingLoad(label, operation)` (exportada; função) - Mede uma listagem genérica servida pelo ResourcePanel. Entradas: `label`: Nome visível da listagem.; `operation`: Operação que carrega linhas da listagem. Devolve: Resultado da operação e amostra de performance.
- `measureDashboardLoad(label, operation)` (exportada; função) - Mede um dashboard dedicado, como relatórios operacionais ou KPIs executivos. Entradas: `label`: Nome visível do dashboard.; `operation`: Operação que carrega os dados do dashboard. Devolve: Resultado da operação e amostra de performance.
- `formatPerformanceWarning(sample)` (exportada; função) - Formata um aviso claro quando uma amostra ultrapassa o orçamento MF5. Entradas: `sample`: Amostra de performance calculada no carregamento. Devolve: Mensagem de aviso ou null quando a operação ficou dentro do orçamento.

### `real_dev/web/src/lib/paymentApi.ts`

- `register(purchaseDocumentId, body)` (método; método) - Regista um pagamento parcial ou total associado a um documento de compra. Entradas: `purchaseDocumentId`: Identificador do documento de compra alvo.; `body`: Corpo JSON enviado para a API. Devolve: Resposta da API com o pagamento registado.

### `real_dev/web/src/lib/purchaseApprovalApi.ts`

- `approveDocument(id)` (método; método) - Aprova um documento de compra submetido. Entradas: `id`: Identificador do registo alvo. Devolve: Resposta da API com o documento de compra aprovado.
- `rejectDocument(id, reason)` (método; método) - Rejeita um documento de compra com motivo auditável. Entradas: `id`: Identificador do registo alvo.; `reason`: Motivo funcional associado à operação. Devolve: Resposta da API com o documento de compra rejeitado.
- `approvalHistory(id)` (método; método) - Obtém o histórico de decisões de aprovação de um documento. Entradas: `id`: Identificador do registo alvo. Devolve: Histórico de aprovação devolvido pela API.
- `postState(id)` (método; método) - Consulta o estado de contabilização de um documento de compra. Entradas: `id`: Identificador do registo alvo. Devolve: Estado de contabilização devolvido pela API.

### `real_dev/web/src/lib/purchasesApi.ts`

- `listDocuments()` (método; método) - Lista documentos de compra da empresa ativa. Entradas: sem entradas explícitas Devolve: Resposta da API com a lista de documentos de compra.
- `createDocument(body)` (método; método) - Cria um documento de compra em rascunho. Entradas: `body`: Corpo JSON enviado para a API. Devolve: Resposta da API com o documento de compra criado.

### `real_dev/web/src/lib/receiptApi.ts`

- `register(saleDocumentId, body)` (método; método) - Regista um recebimento parcial ou total associado a um documento de venda. Entradas: `saleDocumentId`: Identificador do documento de venda alvo.; `body`: Corpo JSON enviado para a API. Devolve: Resposta da API com o recebimento registado.

### `real_dev/web/src/lib/salesApi.ts`

- `listDocuments()` (método; método) - Lista documentos de venda da empresa ativa. Entradas: sem entradas explícitas Devolve: Resposta da API com a lista de documentos de venda.
- `createDocument(body)` (método; método) - Cria um documento de venda em rascunho. Entradas: `body`: Corpo JSON enviado para a API. Devolve: Resposta da API com o documento de venda criado.
- `submitDocument(id)` (método; método) - Submete um documento de venda para aprovação. Entradas: `id`: Identificador do registo alvo. Devolve: Resposta da API com o documento submetido.
- `approveDocument(id)` (método; método) - Aprova um documento de venda submetido. Entradas: `id`: Identificador do registo alvo. Devolve: Resposta da API com o documento aprovado.
- `rejectDocument(id, body)` (método; método) - Rejeita um documento de venda com motivo auditável. Entradas: `id`: Identificador do registo alvo.; `body`: Corpo JSON enviado para a API. Devolve: Resposta da API com o documento rejeitado.
- `issueDocument(id)` (método; método) - Emite o documento de venda aprovado e atribui numeração final. Entradas: `id`: Identificador do registo alvo. Devolve: Resposta da API com o documento emitido.

### `real_dev/web/src/lib/salesOpenItemsApi.ts`

- `list(asOfDate)` (método; método) - Lista títulos em aberto numa data de referência opcional. Entradas: `asOfDate`: Data de referência opcional para a consulta. Devolve: Resposta da API com os títulos em aberto.

### `real_dev/web/src/lib/subscriptionsApi.ts`

- `loadSubscriptionOverview()` (exportada; função) - Carrega os planos simulados e a subscrição atual da empresa ativa. O cliente central acrescenta `/api` e envia cookies HttpOnly. Por isso, este módulo usa caminhos relativos ao domínio de subscrições. Entradas: sem entradas explícitas Devolve: Planos e estado atual necessários para desenhar a página.
- `runSubscriptionAction(request)` (exportada; função) - Executa uma ação simulada de subscrição no backend. `activate` usa o endpoint de ativação do BK-MF8-05. As restantes ações usam o endpoint de ciclo de vida do BK-MF8-06. Entradas: `request`: Ação pedida pela UI e plano quando a ação precisa dele. Devolve: Estado atualizado da subscrição.
- `formatPlanPrice(plan)` (exportada; função) - Formata o preço de um plano para apresentação em português de Portugal. Entradas: `plan`: Plano simulado devolvido pelo backend. Devolve: Preço formatado em euros.
- `formatBillingCycle(plan)` (exportada; função) - Descreve o ciclo de faturação simulado sem transformar a ação em pagamento real. Entradas: `plan`: Plano simulado devolvido pelo backend. Devolve: Texto curto para a UI.
- `formatSubscriptionState(state)` (exportada; função) - Converte o estado técnico da subscrição numa etiqueta curta. Entradas: `state`: Estado público devolvido pela API. Devolve: Etiqueta em português de Portugal.
- `isSubscriptionActionEnabled(current, action)` (exportada; função) - Indica se uma ação deve estar disponível na UI para o estado atual. Esta função melhora a experiência do utilizador, mas não substitui validação backend. O servidor continua a rejeitar transições inválidas. Entradas: `current`: Estado público atual.; `action`: Ação pedida. Devolve: `true` quando a UI deve mostrar a ação como disponível.
- `explainSubscriptionApiError(error)` (exportada; função) - Traduz erros comuns da API para mensagens seguras para a interface. Entradas: `error`: Erro capturado na chamada HTTP. Devolve: Mensagem curta para apresentar ao utilizador.

### `real_dev/web/src/lib/vatRateApi.ts`

- `list()` (método; método) - Lista taxas de IVA configuradas para a empresa ativa. Entradas: sem entradas explícitas Devolve: Resposta da API com a lista de taxas de IVA.
- `create(body)` (método; método) - Cria uma nova taxa de IVA. Entradas: `body`: Corpo JSON enviado para a API. Devolve: Promise resolvida depois de criar o registo pedido pelo formulário.
- `setActive(id, body)` (método; método) - Ativa ou desativa uma taxa de IVA existente. Entradas: `id`: Identificador do registo alvo.; `body`: Corpo JSON enviado para a API. Devolve: Resposta da API com o estado atualizado da taxa de IVA.

### `real_dev/web/src/pages/mf1Pages.tsx`

- `formatError(error)` (top-level; função) - Converte erros da API ou erros nativos numa mensagem curta para apresentar ao utilizador. Entradas: `error`: Erro capturado durante a operação. Devolve: Mensagem de erro pronta a apresentar ao utilizador.
- `today()` (top-level; função) - Devolve a data corrente no formato ISO curto usado pelos inputs de data. Entradas: sem entradas explícitas Devolve: Data corrente em formato ISO curto.
- `DataTable({ rows, actions })` (top-level; componente React) - Renderiza uma tabela simples a partir das chaves presentes nas linhas devolvidas pela API. Entradas: `props`: Propriedades recebidas pelo componente React. Devolve: Elemento React renderizado com a tabela de dados.
- `DocumentSelect({ name, label, documents })` (top-level; componente React) - Renderiza uma lista de documentos usando número de negócio quando existe e ID como fallback. Entradas: `props`: Propriedades recebidas pelo componente React. Devolve: Elemento React renderizado com uma lista de documentos.
- `MethodSelect()` (top-level; componente React) - Renderiza as opções normalizadas de método de pagamento ou recebimento. Entradas: sem entradas explícitas Devolve: Elemento React renderizado com métodos de pagamento ou recebimento.
- `useApiList(load)` (top-level; hook React) - Carrega uma lista da API e expõe estado reutilizável para páginas operacionais. Entradas: `load`: Função que carrega dados a partir da API. Devolve: Estado da lista e função para a recarregar.
- `reload()` (interna; função) - Recarrega a lista principal e guarda estados de carregamento ou erro. Entradas: sem entradas explícitas Devolve: Promise resolvida depois de recarregar a lista.
- `useAction(reload)` (top-level; hook React) - Centraliza o estado de ações assíncronas executadas por formulários e botões. Entradas: `reload`: Função usada para recarregar os dados após a ação. Devolve: Estado da ação e função para a executar.
- `run(action, success)` (interna; função) - Executa uma ação assíncrona atualizando estados de carregamento, erro e mensagem de sucesso. Entradas: `action`: Operação assíncrona a executar.; `success`: Mensagem apresentada quando a ação termina com sucesso. Devolve: Promise com o resultado da ação executada quando existe.
- `Feedback({ busy, error, message })` (top-level; componente React) - Mostra estados de carregamento, erro e sucesso de forma consistente nas páginas operacionais. Entradas: `props`: Propriedades recebidas pelo componente React. Devolve: Fragmento React com estados de carregamento, erro e sucesso.
- `parseSaleDocument(form)` (top-level; função) - Constrói o payload de documento de venda com uma linha normalizada para a API. Entradas: `form`: Dados submetidos pelo formulário. Devolve: Payload normalizado de documento de venda.
- `parsePurchaseDocument(form)` (top-level; função) - Constrói o payload de documento de compra com uma linha normalizada para a API. Entradas: `form`: Dados submetidos pelo formulário. Devolve: Payload normalizado de documento de compra.
- `parseMoneyMovement(form, dateField)` (top-level; função) - Constrói o payload comum de recebimentos e pagamentos a partir de campos do formulário. Entradas: `form`: Dados submetidos pelo formulário.; `dateField`: Nome do campo de data a preencher no payload. Devolve: Payload normalizado de recebimento ou pagamento.
- `DocumentLineFields({ cost })` (top-level; componente React) - Renderiza os campos comuns de uma linha de documento de venda ou compra. Entradas: `props`: Propriedades recebidas pelo componente React. Devolve: Elemento React renderizado com campos de linha de documento.
- `VatRatesPage()` (exportada; componente React) - Renderiza o ecrã Vat Rates e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para taxas de IVA.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `SaleDocumentsPage()` (exportada; componente React) - Renderiza o ecrã Sale Documents e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para documentos de venda.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `ReceiptsPage()` (exportada; componente React) - Renderiza o ecrã Receipts e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para recebimentos.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `SalePostingsPage()` (exportada; componente React) - Renderiza o ecrã Sale Postings e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para lançamentos de vendas.
- `SalesOpenItemsPage()` (exportada; componente React) - Renderiza o ecrã Sales Open Items e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para títulos em aberto.
- `load()` (interna; função) - Carrega dados da API para atualizar o estado visível do ecrã. Entradas: sem entradas explícitas Devolve: Promise resolvida depois de atualizar os dados visíveis.
- `SaleApprovalPage()` (exportada; componente React) - Renderiza o ecrã Sale Approval e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para aprovação de vendas.
- `reject(event)` (interna; função) - Processa a rejeição do documento indicado no formulário com o motivo obrigatório. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de rejeitar o documento indicado.
- `PurchaseDocumentsPage()` (exportada; componente React) - Renderiza o ecrã Purchase Documents e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para documentos de compra.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `PaymentsPage()` (exportada; componente React) - Renderiza o ecrã Payments e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para pagamentos.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `PurchasePostingsPage()` (exportada; componente React) - Renderiza o ecrã Purchase Postings e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para lançamentos de compras.
- `PurchaseApprovalPage()` (exportada; componente React) - Renderiza o ecrã Purchase Approval e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para aprovação de compras.
- `reject(event)` (interna; função) - Processa a rejeição do documento indicado no formulário com o motivo obrigatório. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de rejeitar o documento indicado.
- `loadHistory(id)` (interna; função) - Carrega o histórico de aprovação de compras para o documento indicado. Entradas: `id`: Identificador do registo alvo. Devolve: Promise resolvida depois de carregar o histórico de aprovação.
- `loadHistoryFromForm(event)` (interna; função) - Lê o documento do formulário e delega o carregamento do respetivo histórico. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de carregar o histórico indicado no formulário.

### `real_dev/web/src/pages/mf2Pages.tsx`

- `formatError(error)` (top-level; função) - Converte erros da API ou erros nativos numa mensagem curta para apresentar ao utilizador. Entradas: `error`: Erro capturado durante a operação. Devolve: Mensagem de erro pronta a apresentar ao utilizador.
- `today()` (top-level; função) - Devolve a data corrente no formato ISO curto usado pelos inputs de data. Entradas: sem entradas explícitas Devolve: Data corrente em formato ISO curto.
- `parseNumber(value, label)` (top-level; função) - Converte um campo de formulário num número finito para quantidades de stock. Entradas: `value`: Valor a normalizar ou formatar.; `label`: Nome amigável usado em mensagens de erro ou UI. Devolve: Número finito validado.
- `parseOptionalInteger(value)` (top-level; função) - Converte um campo opcional em inteiro positivo, usado para valores em cêntimos. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Inteiro positivo, ou undefined quando o campo está vazio.
- `parseJsonArray(value, label)` (top-level; função) - Converte textareas JSON em arrays, preservando o contrato que o backend espera receber. Entradas: `value`: Valor a normalizar ou formatar.; `label`: Nome amigável usado em mensagens de erro ou UI. Devolve: Array JSON validado a partir do campo de texto.
- `requiredFile(value, label)` (top-level; função) - Valida que o formulário contém um ficheiro real antes de tentar ler o conteúdo. Entradas: `value`: Valor a normalizar ou formatar.; `label`: Nome amigável usado em mensagens de erro ou UI. Devolve: Ficheiro validado do formulário.
- `fileToBase64(file)` (top-level; função) - Lê um ficheiro local e devolve apenas a carga Base64 necessária para o payload JSON. Entradas: `file`: Ficheiro a validar. Devolve: Promise com o conteúdo do ficheiro codificado em Base64.
- `DataTable({ rows })` (top-level; componente React) - Renderiza uma tabela simples a partir das chaves presentes nas linhas devolvidas pela API. Entradas: `props`: Propriedades recebidas pelo componente React. Devolve: Elemento React renderizado com a tabela de dados.
- `Feedback({ busy, error, message })` (top-level; componente React) - Mostra estados de carregamento, erro e sucesso de forma consistente nas páginas operacionais. Entradas: `props`: Propriedades recebidas pelo componente React. Devolve: Fragmento React com estados de carregamento, erro e sucesso.
- `useApiList(load)` (top-level; hook React) - Carrega uma lista da API e expõe estado reutilizável para páginas operacionais. Entradas: `load`: Função que carrega dados a partir da API. Devolve: Estado da lista e função para a recarregar.
- `reload()` (interna; função) - Recarrega a lista principal e guarda estados de carregamento ou erro. Entradas: sem entradas explícitas Devolve: Promise resolvida depois de recarregar a lista.
- `useAction(reload)` (top-level; hook React) - Centraliza o estado de ações assíncronas executadas por formulários e botões. Entradas: `reload`: Função usada para recarregar os dados após a ação. Devolve: Estado da ação e função para a executar.
- `run(action, success)` (interna; função) - Executa uma ação assíncrona atualizando estados de carregamento, erro e mensagem de sucesso. Entradas: `action`: Operação assíncrona a executar.; `success`: Mensagem apresentada quando a ação termina com sucesso. Devolve: Promise com o resultado da ação executada quando existe.
- `StockMovementsPage()` (exportada; componente React) - Renderiza o ecrã Stock Movements e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para movimentos de stock.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `FifoCostPage()` (exportada; componente React) - Renderiza o ecrã Fifo Cost e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para preview de custo FIFO.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `InventoryCountPage()` (exportada; componente React) - Renderiza o ecrã Inventory Count e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para contagens físicas.
- `create(event)` (interna; função) - Documenta a função create no contexto deste módulo. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de criar o registo pedido pelo formulário.
- `saveLines(event)` (interna; função) - Processa a gravação das linhas editáveis de uma contagem em rascunho. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de guardar as linhas da contagem.
- `post(event)` (interna; função) - Processa a publicação do registo indicado no formulário. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de publicar o registo indicado.
- `StockAlertsPage()` (exportada; componente React) - Renderiza o ecrã Stock Alerts e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para alertas de stock.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `ManualJournalPage()` (exportada; componente React) - Renderiza o ecrã Manual Journal e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para lançamentos manuais.
- `create(event)` (interna; função) - Documenta a função create no contexto deste módulo. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de criar o registo pedido pelo formulário.
- `get(event)` (interna; função) - Documenta a função get no contexto deste módulo. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de carregar o registo pedido.
- `update(event)` (interna; função) - Processa a atualização do registo indicado no formulário. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de atualizar o registo indicado.
- `addAttachment(event)` (interna; função) - Processa a submissão do formulário de anexo, converte o ficheiro para Base64 e envia-o para a API privada. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de registar o anexo.
- `AccountingReportsPage()` (exportada; componente React) - Renderiza o ecrã Accounting Reports e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para balancete e razão.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `FinancialStatementsPage()` (exportada; componente React) - Renderiza o ecrã de demonstrações financeiras e chama os endpoints de balanço ou resultados. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para demonstrações financeiras.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.

### `real_dev/web/src/pages/mf3Pages.tsx`

- `today()` (top-level; função) - Devolve a data corrente no formato ISO curto usado pelos inputs de data. Entradas: sem entradas explícitas Devolve: Data corrente em formato ISO curto.
- `firstDayOfMonth()` (top-level; função) - Devolve o primeiro dia do mês corrente no formato aceite pelos inputs de data. Entradas: sem entradas explícitas Devolve: Primeiro dia do mês corrente em formato ISO curto.
- `requiredText(value, label)` (top-level; função) - Normaliza texto obrigatório e lança erro claro quando o campo está vazio. Entradas: `value`: Valor a normalizar ou formatar.; `label`: Nome amigável usado em mensagens de erro ou UI. Devolve: Texto obrigatório validado.
- `optionalText(value)` (top-level; função) - Normaliza texto opcional, devolvendo undefined para campos vazios. Entradas: `value`: Valor a normalizar ou formatar. Devolve: Texto normalizado, ou undefined quando o campo está vazio.
- `integerValue(value, label)` (top-level; função) - Converte um campo de formulário num inteiro obrigatório, usado para valores em cêntimos. Entradas: `value`: Valor a normalizar ou formatar.; `label`: Nome amigável usado em mensagens de erro ou UI. Devolve: Inteiro validado a partir do campo de formulário.
- `JsonResult({ value })` (top-level; componente React) - Mostra o resultado JSON bruto para facilitar validação funcional dos fluxos MF3. Entradas: `props`: Propriedades recebidas pelo componente React. Devolve: Elemento React renderizado com o JSON formatado.
- `ActionFeedbackMessage({ feedback })` (top-level; componente React) - Apresenta o estado produzido pelo hook comum de feedback da MF5. Entradas: `props`: Estado de feedback a renderizar. Devolve: Mensagem transversal quando existe feedback visivel.
- `DateRangeForm({ label, performanceLabel, onSubmit, startMessage, ... })` (top-level; componente React) - Renderiza um formulário reutilizável de intervalo de datas para relatórios MF3. Entradas: `props`: Propriedades recebidas pelo componente React. Devolve: Elemento React renderizado com campos de intervalo de datas.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `runDashboardQuery()` (interna; função) - Executa a consulta de dashboard com o intervalo validado localmente. A função é medida quando existe `performanceLabel` e chamada diretamente nos restantes casos. Entradas: sem entradas explícitas Devolve: Promise com o resultado devolvido pelo submit da página.
- `VatMapPage()` (exportada; componente React) - Renderiza o ecrã do mapa de IVA e consulta a API por intervalo de datas. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para mapa de IVA.
- `TreasuryAccountsPage()` (exportada; componente React) - Renderiza o ecrã Treasury Accounts e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para contas de tesouraria.
- `load()` (interna; função) - Carrega dados da API para atualizar o estado visível do ecrã. Entradas: sem entradas explícitas Devolve: Promise resolvida depois de atualizar os dados visíveis.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `StatementImportPage()` (exportada; componente React) - Renderiza o ecrã Statement Import e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para importação de extratos.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `CashflowForecastPage()` (exportada; componente React) - Renderiza o ecrã Cashflow Forecast e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para previsão de tesouraria.
- `BusinessImportPage()` (exportada; componente React) - Renderiza o ecrã Business Import e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para importação de dados.
- `submit(event)` (interna; função) - Processa a submissão do formulário, valida campos locais e delega a operação na API. Entradas: `event`: Evento do formulário submetido. Devolve: Promise resolvida depois de processar a submissão do formulário.
- `SaftExportPage()` (exportada; componente React) - Renderiza o ecrã Saft Export e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para exportação SAF-T.
- `OperationalReportsPage()` (exportada; componente React) - Renderiza o ecrã Operational Reports e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para relatórios operacionais.
- `ExecutiveKpisPage()` (exportada; componente React) - Renderiza o ecrã Executive Kpis e liga os controlos visuais aos endpoints correspondentes. Entradas: sem entradas explícitas Devolve: Elemento React renderizado para KPIs executivos.

### `real_dev/web/src/pages/mf4Pages.tsx`

- `today()` (top-level; função) - Data corrente no formato de input date. Entradas: sem entradas explícitas Devolve: Data ISO curta.
- `firstDayOfMonth()` (top-level; função) - Primeiro dia do mês corrente. Entradas: sem entradas explícitas Devolve: Data ISO curta.
- `requiredText(value, label)` (top-level; função) - Extrai texto obrigatório de um formulário. Entradas: `value`: Valor de formulário.; `label`: Nome amigável. Devolve: Texto validado.
- `optionalText(value)` (top-level; função) - Extrai texto opcional de um formulário. Entradas: `value`: Valor de formulário. Devolve: Texto ou undefined.
- `JsonResult({ value })` (top-level; componente React) - Mostra dados estruturados sem recorrer a tipos inseguros na página. Entradas: `props`: Propriedades React. Devolve: Elemento React.
- `ActionFeedbackMessage({ feedback })` (top-level; componente React) - Apresenta o estado produzido pelo hook comum de feedback da MF5. Entradas: `props`: Estado de feedback a renderizar. Devolve: Mensagem transversal quando existe feedback visivel.
- `DateRangeForm({ label, onSubmit, startMessage, successMessage, ... })` (top-level; componente React) - Formulário reutilizável de intervalo de datas. Entradas: `props`: Propriedades React. Devolve: Elemento React.
- `submit(event)` (interna; função) - Valida o intervalo localmente e executa a chamada remota com feedback comum. Entradas: `event`: Evento do formulario submetido. Devolve: Promise resolvida depois do ciclo de feedback terminar.
- `SimpleList({ items, render })` (top-level; componente React) - Lista genérica para cartões de leitura. Entradas: `props`: Propriedades React. Devolve: Elemento React.
- `AiInsightsPage()` (exportada; componente React) - Renderiza a página de insights automáticos da MF4. A página consulta insights por intervalo e permite abrir a explicação auditável de cada resultado. Entradas: sem entradas explícitas Devolve: Elemento React da página de insights com lista, feedback e explicação selecionada.
- `AiSuggestionsPage()` (exportada; componente React) - Renderiza a página de sugestões de ação geradas pela IA. A página mostra recomendações com fonte, limitação e decisão humana obrigatória. Entradas: sem entradas explícitas Devolve: Elemento React da página de sugestões com feedback de atualização.
- `load()` (interna; função) - Recarrega sugestões usando a sessão atual enviada por cookie HttpOnly. Entradas: sem entradas explícitas Devolve: Promise resolvida quando a lista fica atualizada.
- `AiQuestionsPage()` (exportada; componente React legado) - Mantém o formulário MF4 durante a transição, mas não está registado como página canónica; `/ai/questions` redireciona para `AiChatPage` em `/ai/chat`.
- `submit(event)` (interna; função) - Submete a pergunta do formulário e guarda a resposta devolvida pela API. O texto é validado localmente antes de ser enviado ao backend. Entradas: `event`: Evento de submissão do formulário de pergunta. Devolve: Promise resolvida depois de atualizar o feedback e a resposta.
- `SmartAlertsPage()` (exportada; componente React) - Renderiza a página de alertas inteligentes da MF4. A página usa o intervalo de datas comum e apresenta alertas calculados pelo backend. Entradas: sem entradas explícitas Devolve: Elemento React com formulário de consulta e cartões de alerta.
- `RemindersPage()` (exportada; componente React) - Renderiza a página de lembretes operacionais. A página permite listar, criar e concluir lembretes sem duplicar regras de validação do backend. Entradas: sem entradas explícitas Devolve: Elemento React com ações de lembrete e lista atualizada.
- `fetchReminders()` (interna; função) - Recarrega lembretes diretamente da API e substitui o estado local. É usado depois de criar ou concluir lembretes para manter a lista consistente. Entradas: sem entradas explícitas Devolve: Promise resolvida quando o estado local contém a lista mais recente.
- `load()` (interna; função) - Executa a atualização manual de lembretes com feedback visual. Erros ficam registados no hook comum sem apagar os dados já apresentados. Entradas: sem entradas explícitas Devolve: Promise resolvida depois de tentar atualizar a lista.
- `submit(event)` (interna; função) - Cria um lembrete a partir do formulário e recarrega a lista. O prazo é validado antes do envio para evitar payloads incompletos. Entradas: `event`: Evento de submissão do formulário de criação. Devolve: Promise resolvida depois de criar o lembrete ou mostrar feedback de erro.
- `TasksPage()` (exportada; componente React) - Renderiza a página de tarefas operacionais. A página permite criar tarefas, associar responsável opcional e concluir trabalho pendente. Entradas: sem entradas explícitas Devolve: Elemento React com formulário, feedback e lista de tarefas.
- `fetchTasks()` (interna; função) - Recarrega tarefas diretamente da API e substitui o estado local. É reutilizado após criação e conclusão para evitar estados desatualizados. Entradas: sem entradas explícitas Devolve: Promise resolvida quando a lista local de tarefas fica atualizada.
- `load()` (interna; função) - Executa a atualização manual de tarefas com feedback visual. A função encapsula o ciclo comum de início, sucesso e erro. Entradas: sem entradas explícitas Devolve: Promise resolvida depois de tentar carregar tarefas.
- `submit(event)` (interna; função) - Cria uma tarefa operacional a partir do formulário da página. O prazo é validado localmente e os campos opcionais são normalizados antes do envio. Entradas: `event`: Evento de submissão do formulário de tarefa. Devolve: Promise resolvida depois de criar a tarefa ou manter o formulário com erro.
- `NotificationsPage()` (exportada; componente React) - Renderiza a página de notificações internas. A página lista notificações, sincroniza eventos e permite marcar itens como lidos. Entradas: sem entradas explícitas Devolve: Elemento React com ações de sincronização e lista de notificações.
- `fetchNotifications()` (interna; função) - Recarrega notificações da API e atualiza o estado local. É usada após sincronizar ou marcar notificações como lidas. Entradas: sem entradas explícitas Devolve: Promise resolvida quando a lista de notificações fica atualizada.
- `load()` (interna; função) - Executa a atualização manual de notificações com feedback visual. A lista anterior permanece visível quando a chamada falha. Entradas: sem entradas explícitas Devolve: Promise resolvida depois de tentar recarregar notificações.
- `AuditLogsPage()` (exportada; componente React) - Renderiza a página de auditoria funcional. A página carrega eventos de auditoria e mostra a estrutura devolvida pela API. Entradas: sem entradas explícitas Devolve: Elemento React com ação de atualização e resultado JSON.
- `IntegrationLogsPage()` (exportada; componente React) - Renderiza a página de logs de integração. A página ajuda a validar importações e integrações mostrando o detalhe técnico registado. Entradas: sem entradas explícitas Devolve: Elemento React com ação de atualização e logs em JSON.

### `real_dev/web/src/pages/SubscriptionsPage.tsx`

- `formatDate(value)` (top-level; função) - Formata uma data ISO recebida da API para leitura humana em PT-PT. Entradas: `value`: Data ISO opcional. Devolve: Data localizada ou indicação de ausência.
- `firstPlanCode(plans)` (top-level; função) - Escolhe o primeiro plano disponível como seleção inicial segura. Entradas: `plans`: Planos simulados devolvidos pelo backend. Devolve: Código do primeiro plano ou fallback canónico mensal.
- `stateTone(state)` (top-level; função) - Converte estado da subscrição em tom visual conhecido pela UI transversal. Entradas: `state`: Estado público atual. Devolve: Tom visual para o distintivo.
- `actionSuccessMessage(action)` (top-level; função) - Gera mensagem de sucesso específica para cada ação da subscrição. Entradas: `action`: Ação executada pela UI. Devolve: Mensagem curta em português de Portugal.
- `SubscriptionsPage()` (exportada; componente React) - Renderiza a página MF8 de planos e gestão da subscrição simulada. Entradas: sem entradas explícitas Devolve: Página React com planos, estado atual e ações permitidas.
- `handleAction(action)` (interna; função) - Envia a ação escolhida para a API e substitui apenas o estado de subscrição. Entradas: `action`: Ação de ativação ou ciclo de vida pedida pelo utilizador. Devolve: Promise resolvida quando a UI reflete a resposta do backend.

### `real_dev/web/src/ui/opsaUi.tsx`

- `toHeadingId(title)` (top-level; função) - Gera um identificador HTML estavel a partir de um titulo legivel. Entradas: `title`: Titulo visivel da pagina. Devolve: Identificador seguro para ligar `section` e `h2`.
- `PageFrame({ title, eyebrow, description, headingId, ... })` (exportada; componente React) - Cria a moldura comum das paginas de operacao da OPSA. Entradas: `props`: Titulo, identificador opcional, contexto, acoes e conteudo da pagina. Devolve: Seccao React com cabecalho, descricao opcional e conteudo do modulo.
- `StatusMessage({ tone, title, children })` (exportada; componente React) - Apresenta feedback visual consistente para sucesso, aviso, erro ou estado neutro. Entradas: `props`: Tom visual, titulo curto e conteudo explicativo. Devolve: Caixa de estado com role acessivel.
- `ActionToolbar({ children })` (exportada; componente React) - Agrupa comandos primarios e secundarios sem mudar a ordem visual entre modulos. Entradas: `props`: Botoes ou ligacoes de acao. Devolve: Barra de acoes reutilizavel.
- `ModuleBadge({ label, tone })` (exportada; componente React) - Mostra estado ou categoria de modulo sem obrigar cada pagina a criar estilos proprios. Entradas: `props`: Texto do distintivo e tom visual. Devolve: Distintivo textual pequeno.
- `AiSourceQualityPanel({ quality })` (exportada; componente React) - Mostra a fonte e a limitação de uma recomendação de IA sem permitir execução automática. Entradas: `props`: Qualidade da fonte recebida da API. Devolve: Painel textual de governação para recomendações de IA.

### `real_dev/web/src/ui/ResponsiveDataTable.tsx`

- `formatCell(column, value)` (top-level; função) - Converte valores simples para texto PT-PT seguro e consistente na UI. Entradas: `column`: Nome da coluna usada para escolher a formatação correta.; `value`: Valor simples recebido depois da normalizacao feita em App.tsx. Devolve: Texto pronto a apresentar em tabela ou cartao.
- `ResponsiveDataTable({ rows, caption, renderMobileTitle })` (exportada; componente React) - Apresenta uma colecao como tabela desktop e como cartoes mobile. Entradas: `props`: Linhas normalizadas, legenda acessivel e funcao para titulo mobile. Devolve: Estrutura React com a mesma fonte de dados para os dois formatos.

### `real_dev/web/src/ui/useActionFeedback.ts`

- `messageFromError(error, fallback)` (top-level; função) - Converte um erro tecnico numa mensagem curta para a interface. Entradas: `error`: Erro lancado por validacao local ou chamada a API.; `fallback`: Mensagem usada quando o erro nao traz texto util. Devolve: Mensagem segura para apresentar ao utilizador.
- `useActionFeedback()` (exportada; função) - Gere o ciclo visual de uma acao assincrona. Entradas: sem entradas explícitas Devolve: Estado atual, indicador de execucao e funcoes para executar acoes com feedback.
