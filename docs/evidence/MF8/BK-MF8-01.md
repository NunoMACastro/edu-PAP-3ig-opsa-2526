- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/modules/ops/structuredLogger.js
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check src/server.js

## npm run test:unit
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:unit
   
> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (6.7524ms)
✔ BK01: registo mantém política de password forte (1.8121ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.8251ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.722ms)
✔ BK07: importação vazia é rejeitada (1.2859ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (0.9257ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (0.986ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (0.9408ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (0.8337ms)
✔ BK-MF1-01: IVA isento exige motivo de isenção (8.7338ms)
✔ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (5.1294ms)
✔ BK-MF1-06: emissão definitiva exige venda aprovada (2.1979ms)
✔ BK-MF1-02: emissão definitiva reserva número por upsert atómico (5.1343ms)
✔ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (2.7505ms)
✔ BK-MF1-03: recebimento não pode exceder montante em aberto (2.2844ms)
✔ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (2.018ms)
✔ BK-MF1-04: lançamento de venda fica balanceado (3.13ms)
✔ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados (3.275ms)
✔ BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend (5.3249ms)
✔ BK-MF1-08: pagamento rejeita compra ainda em rascunho (2.3297ms)
✔ BK-MF1-08: pagamento rejeita saldo alterado em concorrência (1.8566ms)
✔ BK-MF1-08: pagamento total não altera estado contabilístico da compra (2.4573ms)
✔ BK-MF1-09: lançamento de compra fica balanceado (3.3816ms)
✔ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (1.9865ms)
✔ BK-MF1-10: aprovação de compra só aceita rascunho (1.1582ms)
✔ BK-MF2-01: reprovação exige justificação mínima (4.5996ms)
✔ BK-MF2-02: transferência para o mesmo armazém é inválida (0.9229ms)
✔ BK-MF2-03: entrada valorizada exige custo unitário positivo (0.5111ms)
✔ BK-MF2-03: FIFO consome múltiplas camadas e regista consumos (5.3528ms)
✔ BK-MF2-05: mínimo maior que máximo é inválido (0.9706ms)
✔ BK-MF2-07: balancete agrega linhas contabilísticas por empresa e período (2.342ms)
✔ BK-MF2-06: lançamento manual tem de estar equilibrado (1.067ms)
✔ BK-MF2-06: anexo de lançamento manual rejeita MIME fora do contrato (0.8169ms)
✔ BK-MF2-06: anexo de lançamento manual exige conteúdo real (1.0329ms)
✔ BK-MF2-06: anexo rejeita conteúdo que não corresponde ao MIME declarado (1.4468ms)
✔ BK-MF2-06: anexo de lançamento manual é guardado em storage privado (152.9252ms)
✔ BK-MF2-06: anexo PNG válido é aceite por assinatura real (1.019ms)
✔ BK-MF2-07: filtros rejeitam período invertido (0.7625ms)
✔ BK-MF2-04: linhas de contagem não aceitam artigo duplicado (0.8809ms)
✔ BK-MF2-04: publicação de contagem regista AuditLog com detalhes (2.5749ms)
✔ BK-MF2-08: balanço separa classe 2 por sinal e devolve checkCents (1.2177ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\src\modules\imports\importFileParser.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\unit\mf3-services.test.js (456.6684ms)
✔ BK-MF4-03: pergunta mutável é bloqueada pela IA read-only (4.7911ms)
✔ BK-MF4-06: lembrete rejeita tipo fora do contrato (0.6985ms)
✔ BK-MF4-06/BK-MF4-07: datas inexistentes são rejeitadas sem normalização (2.1326ms)
✔ BK-MF4-01/BK-MF4-02: insights persistem fonte e sugestões não executam ações (3.0948ms)
✔ BK-MF4-01: insights de stock usam alertas MF2 calculados (2.1107ms)
✔ BK-MF4-04: alertas inteligentes materializam risco de rutura calculado (2.0518ms)
✔ BK-MF4-03: resposta de IA inclui fontes internas (1.8235ms)
✔ BK-MF4-07: tarefa não pode ser atribuída fora da empresa ativa (1.6007ms)
✔ BK-MF4-10: logs de integração redigem mensagens sensíveis (3.5079ms)
✔ BK-MF6-01: medicao de documento preserva resultado e escreve headers (6.3679ms)
✔ BK-MF6-03: reconciliação limita candidatos e nunca confirma movimentos (2.2996ms)
✔ BK-MF6-04: FIFO falha cedo sem stock e mede cálculo válido (1.9304ms)
✔ BK-MF6-05/BK-MF6-08: transporte seguro e origem confiável bloqueiam produção insegura (1.5543ms)
✔ BK-MF6-06/BK-MF6-07/BK-MF6-09: bcrypt, cookies e ambiente seguem contrato (1008.4554ms)
✔ BK-MF6-10: auditoria sensível exige ação declarada e detalhes mínimos (1.9374ms)
✔ BK-MF7-02: calcula a retencao legal de 10 anos (4.1144ms)
✔ BK-MF7-02: rejeita datas invalidas no calculo de retencao (1.2919ms)
✔ BK-MF7-02: valida apenas entidades contabilisticas protegidas (0.6467ms)
✔ BK-MF7-02: indica retencao ativa antes do fim do prazo (0.5088ms)
✔ BK-MF7-02: bloqueia remocao com retencao ativa e erro HTTP 409 (2.8105ms)
✔ BK-MF7-02: autoriza remocao quando nao existe retencao persistida (2.6135ms)
✔ BK-MF7-02: autoriza remocao depois de terminar a retencao (0.6974ms)
✔ BK-MF7-02: gate regista auditoria sensivel quando a remocao e autorizada (1.785ms)
✔ BK-MF7-02: gate nao audita quando a retencao ainda bloqueia (1.1241ms)
✔ aceita todos os níveis contratados em RNF28 (5.831ms)
✔ rejeita nível inválido e campos obrigatórios em falta (1.457ms)
✔ bloqueia chaves sensíveis no contexto (2.5179ms)
✔ encaminha cada nível para o método certo da consola (3.0735ms)
✔ rejeita contexto com objetos aninhados (0.7023ms)
ℹ tests 71
ℹ suites 0
ℹ pass 70
ℹ fail 1
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7333.9058

✖ failing tests:

✖ tests\unit\mf3-services.test.js (456.6684ms)
  'test failed'
PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run syntax:check

> @opsa/api@1.0.0 syntax:check
> find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check

'xargs' is not recognized as an internal or external command,
operable program or batch file.

## npm run test:contracts
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (2.8973ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.7922ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (2.4518ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (2.4706ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (2.6061ms)
✔ BK12: nome de armazém duplicado é rejeitado (0.9737ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (2.6781ms)
✔ MF1: routers principais montam sem dependências inexistentes (11.3685ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (8.3825ms)
✔ MF1 HTTP: operacional não pode aprovar venda (2.5596ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (3.6934ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\src\modules\accounting-reports\accountingReportExporters.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\contracts\mf2-contracts.test.js (464.364ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\src\modules\imports\importFileParser.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\contracts\mf3-contracts.test.js (554.188ms)
✔ MF4: permissões backend cobrem IA, tarefas, notificações, auditoria e integrações (2.6717ms)
✔ MF4: routers principais expõem endpoints canónicos (17.5827ms)
✔ P0-MF4-MIG-01: migration MF4 cria tabelas persistentes da macrofase (75.6357ms)
✔ MF6: router de tesouraria expõe sugestão de reconciliação medida (6.3806ms)
✔ MF6: package expõe todos os gates test:mf6 (1.6298ms)
✔ MF6: servidor monta hardening antes dos routers de domínio (1.2986ms)
✔ MF6: smoke de concorrência suporta modo HTTP autenticado (68.9263ms)
✔ RNF27 mantém contratos críticos de faturação, IVA, balancetes e reconciliação (5.4263ms)
✔ RNF27 mantém contexto multiempresa nos módulos críticos (4.3491ms)
✔ RNF27 rejeita marcadores obsoletos que não existem nos services reais (4.6658ms)
▶ MF7 email transaccional
  ✔ coloca email em fila técnica sem expor endereço completo (3.115ms)
  ✔ rejeita motivo fora do contrato (1.9109ms)
  ✔ rejeita destinatário inválido antes de chamar provider (0.8572ms)
  ✔ mantém sendPasswordReset e não escreve segredo nos logs (1.2011ms)
  ✔ envia alertas e lembretes usando o adapter comum (2.8984ms)
✔ MF7 email transaccional (14.1289ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\src\modules\accounting-reports\accountingReportExporters.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\contracts\mf7-export-contracts.test.js (521.5523ms)
node:internal/modules/package_json_reader:301
  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
        ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'exceljs' imported from D:\PAP\edu-PAP-3ig-opsa-2526\apps\api\tests\contracts\mf7-import-contracts.test.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:859:18)
    at defaultResolve (node:internal/modules/esm/resolve:992:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
    at #resolve (node:internal/modules/esm/loader:673:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}

Node.js v24.16.0
✖ tests\contracts\mf7-import-contracts.test.js (392.7632ms)
✔ aceita readiness SAF-T com perfil, periodo e movimentos (5.8763ms)
✔ rejeita periodo SAF-T invertido (1.7161ms)
✔ rejeita perfil fiscal sem NIF (0.6021ms)
✔ rejeita periodo sem documentos nem lancamentos (0.8203ms)
✔ service SAF-T chama readiness, cria run e regista log de integracao (2.2486ms)
ℹ tests 35
ℹ suites 1
ℹ pass 31
ℹ fail 4
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10439.7429

✖ failing tests:

test at tests\contracts\mf2-contracts.test.js:1:1
✖ tests\contracts\mf2-contracts.test.js (464.364ms)
  'test failed'

test at tests\contracts\mf3-contracts.test.js:1:1
  'test failed'

test at tests\contracts\mf7-export-contracts.test.js:1:1
✖ tests\contracts\mf7-export-contracts.test.js (521.5523ms)
  'test failed'

test at tests\contracts\mf7-import-contracts.test.js:1:1
✖ tests\contracts\mf7-import-contracts.test.js (392.7632ms)
  'test failed'