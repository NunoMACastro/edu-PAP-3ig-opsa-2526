Passo 1:
RF/RNF cobertos:
- RF07 (Criar/importar plano de contas (SNC).)

BK seguinte:
- BK-MF0-08 (Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho)

Passo 2:

- Schema Prisma atualizado
- Prisma generate executado com sucesso
- Não existem erros de schema nem nomes/modelos duplicados

Nota:
- Removida temporariamente a referência profile CompanyProfile? porque BK-MF0-06 ainda não está merged no main.
- Quando BK-MF0-06 for merged, será necessário sincronizar main antes do PR/merge final do BK-MF0-07.

Cenário negativo:
- Constraints únicas definidas no schema ficam preparadas para impedir duplicados.
- Teste 409 ainda não executado porque requer PostgreSQL local e dados persistidos.
- O conflito controlado deverá ser tratado no service/controller como 409.

Passo 3:
Imports validados com Node
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/accounting/accounts/accountValidators.js').then(m => console.log(Object.keys(m)))"
[ 'validateAccountPayload', 'validateImportPayload' ]

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/accounting/accounts/accountValidators.js').then(m => { try { m.validateImportPayload({ rows: [] }); console.log('ok'); } catch (e) { console.log(e.status, e.code, e.message); } })"
ok

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/accounting/accounts/accountValidators.js').then(m => { try { m.validateAccountPayload(null); } catch (e) { console.log(e.status,
e.code, e.message); } })"
400 INVALID_BODY O corpo do pedido deve ser JSON

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/accounting/accounts/accountValidators.js').then(m => { try { m.validateAccountPayload({ code: 'ABC', name: 'Caixa' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_ACCOUNT_CODE Codigo SNC deve ser numerico e ter entre 1 e 8 digitos

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/accounting/accounts/accountValidators.js').then(m => { try { m.validateAccountPayload({ code: '11', name: 'Cx' }); } catch (e) {
console.log(e.status, e.code, e.message); } })"
400 INVALID_ACCOUNT_NAME Nome da conta deve ter pelo menos 3 caracteres

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/accounting/accounts/accountValidators.js').then(m => { try { m.validateImportPayload({}); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_IMPORT Importacao deve receber rows normalizadas

Nota:
- Payload mal formado é bloqueado no validator antes de chegar ao Prisma.

Passo 4:
Import validado com Node
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/accounting/accounts/accountService.js').then(m => console.log(Object.keys(m)))"
[ 'createAccount', 'importAccountsFromRows', 'listAccounts' ]

Cenário negativo:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/accounting/accounts/accountService.js').then(async m => { try { await m.importAccountsFromRows({}, 'company-1', [{ code: '11', name: 'Caixa', parentCode: null, level: 2, isActive: true }, { code: '11', name: 'Banco', parentCode: null, level: 2, isActive: true }]); } catch (e) { console.log(e.status, e.code, e.message); } })"
409 DUPLICATED_IMPORT_CODE Codigo duplicado no ficheiro: 11

Pendentes:
- listAccounts com dados reais
- createAccount com dados válidos
- createAccount com código já existente => 409 ACCOUNT_CODE_EXISTS
- importAccountsFromRows com código já existente na base => 409 ACCOUNT_CODE_EXISTS

Motivo:
- Requer PostgreSQL local e dados persistidos.

Nota:
- O service recebe companyId do contexto ativo, não do body.

Passo 5:
- accountController.js criado
- accountRoutes.js criado
- server.js atualizado com /api/accounting/accounts
- API iniciou com sucesso

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i http://localhost:3000/api/accounting/accounts
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 12:09:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X POST "http://localhost:3000/api/accounting/accounts" -H "Content-Type: application/json" --data-raw '{}'
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 12:10:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

Nota:
- Validações 400 do payload foram testadas diretamente no validator no Passo 3.
- Duplicados 409 foram testados no service para import com códigos repetidos.

Passo 6:
Smoke principal:
- Pendente até existir PostgreSQL local, sessão válida, empresa ativa e permissão ACCOUNTING_WRITE.

Negativos executados:

1) GET /api/accounting/accounts sem sessão
Resultado:
401 SESSION_REQUIRED

2) POST /api/accounting/accounts sem sessão
Resultado:
401 SESSION_REQUIRED

3) validateAccountPayload com code ABC
Resultado:
400 INVALID_ACCOUNT_CODE

4) validateAccountPayload com nome curto
Resultado:
400 INVALID_ACCOUNT_NAME

5) validateImportPayload sem rows
Resultado:
400 INVALID_IMPORT

6) importAccountsFromRows com dois códigos iguais no ficheiro
Resultado:
409 DUPLICATED_IMPORT_CODE

Pendentes:
- POST /api/accounting/accounts com payload válido => 201
- POST /api/accounting/accounts/import com rows válidas => 201
- Criar conta já existente na mesma empresa => 409 ACCOUNT_CODE_EXISTS
- Criar conta como OPERACIONAL ou AUDITOR => 403 PERMISSION_FORBIDDEN
- Confirmar GET /api/accounting/accounts com dados reais
- Trocar de empresa e confirmar isolamento por companyId

Motivo:
- PostgreSQL local ainda não está disponível.
- Os testes completos dependem de sessão válida, empresa ativa, permissões reais e dados persistidos.


Passo 7:
Decisões em falta:
- Falta fonte documental oficial para o template SNC inicial.
- Até existir documentação canónica, este BK não deve incluir uma lista fixa de contas "oficiais".
- Falta decidir parser de CSV/Excel para RNF23.
- A importação implementada neste BK recebe apenas linhas já normalizadas.
- A leitura direta de ficheiros deve aguardar aprovação do parser e do contrato de upload.
- PostgreSQL local ainda não está disponível para smoke tests completos.

Handoff para BK-MF0-08:
- Reutilizar accountValidators.js.
- Reutilizar accountService.js.
- Reutilizar accountController.js.
- Reutilizar accountRoutes.js.
- Manter isolamento por companyId em todas as queries.
- Manter validação de códigos SNC numéricos entre 1 e 8 dígitos.
- Manter proteção contra códigos duplicados no import.
- Não assumir plano SNC oficial sem documentação canónica.

Validação final:
- Schema Prisma atualizado.
- Prisma generate executado com sucesso.
- accountValidators.js criado e validado.
- accountService.js criado e validado.
- accountController.js criado.
- accountRoutes.js criado.
- server.js atualizado.
- GET /api/accounting/accounts sem sessão => 401 SESSION_REQUIRED.
- POST /api/accounting/accounts sem sessão => 401 SESSION_REQUIRED.
- INVALID_ACCOUNT_CODE => 400.
- INVALID_ACCOUNT_NAME => 400.
- INVALID_IMPORT => 400.
- DUPLICATED_IMPORT_CODE => 409.

Correção de findings - 2026-06-01:
- validateImportPayload passou a rejeitar rows vazio com INVALID_IMPORT.
- Validação executada: npm --prefix apps/api run test:unit.
