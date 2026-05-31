Passo 1:
RF/RNF cobertos:
- RF09 (Criar e gerir clientes)

BK seguinte:
- BK-MF0-10 (Criar e gerir fornecedores)

Passo 2:
- Customer criado em schema.prisma
- Company atualizado com customers
- Prisma generate executado com sucesso
- Não existem erros de schema nem modelos duplicados

Pendente:
- Prisma migrate, porque PostgreSQL local ainda não está disponível

Cenário negativo:
- Constraint @@unique([companyId, nif]) preparada para impedir NIF duplicado na mesma empresa.
- Teste 409 ainda não executado porque requer PostgreSQL local e dados persistidos.
- O conflito controlado deverá ser tratado no service/controller como 409 CUSTOMER_NIF_EXISTS.

Passo 3:
Import validado com Node
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/customers/customerValidators.js').then(m => console.log(Object.keys(m)))"
[ 'validateCustomerPayload' ]

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/customers/customerValidators.js').then(m => { try { m.validateCustomerPayload(null); } catch (e) { console.log(e.status, e.code, 
e.message); } })"
400 INVALID_BODY O corpo do pedido deve ser JSON

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/customers/customerValidators.js').then(m => { try { m.validateCustomerPayload({ name: '' }); } catch (e) { console.log(e.status, 
e.code, e.message); } })"
400 INVALID_CUSTOMER_NAME Nome do cliente e obrigatorio

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/customers/customerValidators.js').then(m => { try { m.validateCustomerPayload({ name: 'Ana', nif: '12345678' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_NIF NIF portugues invalido

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/customers/customerValidators.js').then(m => { try { m.validateCustomerPayload({ name: 'Ana', email: 'emailerrado' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_EMAIL Email invalido

Nota:
- Payload mal formado é bloqueado no validator antes de chegar ao Prisma.

Passo 4:
Import validado com Node
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/customers/customerService.js').then(m => console.log(Object.keys(m)))"
[
  'createCustomer',
  'deactivateCustomer',
  'listCustomers',
  'updateCustomer'
]

Pendentes:
- listCustomers com dados reais
- createCustomer com dados válidos
- createCustomer com NIF duplicado => 409 CUSTOMER_NIF_EXISTS
- updateCustomer com cliente inexistente => 404 CUSTOMER_NOT_FOUND
- deactivateCustomer com cliente inexistente => 404 CUSTOMER_NOT_FOUND

Motivo:
- Requer PostgreSQL local e dados persistidos.

Nota:
- O service usa companyId vindo do contexto ativo, não do body.

Passo 5:
- API iniciou com sucesso
Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i http://localhost:3000/api/customers                                                                                                                 
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 15:21:47 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X POST "http://localhost:3000/api/customers"
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 15:22:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X PATCH "http://localhost:3000/api/customers/test-id"
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 15:22:46 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X DELETE "http://localhost:3000/api/customers/test-id"
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 15:23:33 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

Nota:
- Validações 400 do payload foram testadas diretamente no validator no Passo 3.
- Cenários 404/409 dependem de PostgreSQL local e dados persistidos.

Passo 6:
Smoke principal:
- Pendente até existir PostgreSQL local, sessão válida, empresa ativa e permissão CUSTOMERS_WRITE.

Negativos executados:

1) GET /api/customers sem sessão
Resultado:
401 SESSION_REQUIRED

2) POST /api/customers sem sessão
Resultado:
401 SESSION_REQUIRED

3) PATCH /api/customers/:id sem sessão
Resultado:
401 SESSION_REQUIRED

4) DELETE /api/customers/:id sem sessão
Resultado:
401 SESSION_REQUIRED

5) validateCustomerPayload com name vazio
Resultado:
400 INVALID_CUSTOMER_NAME

6) validateCustomerPayload com NIF inválido
Resultado:
400 INVALID_NIF

7) validateCustomerPayload com email inválido
Resultado:
400 INVALID_EMAIL

Pendentes:
- POST /api/customers com payload válido => 201
- Criar cliente com NIF duplicado na mesma empresa => 409 CUSTOMER_NIF_EXISTS
- Atualizar cliente inexistente/outra empresa => 404 CUSTOMER_NOT_FOUND
- Criar cliente como role sem permissão => 403 PERMISSION_FORBIDDEN
- Listar clientes com dados reais
- Confirmar isolamento por companyId
- DELETE lógico e confirmação de remoção da listagem

Motivo:
- PostgreSQL local ainda não está disponível.
- Cenários completos dependem de sessão válida, empresa ativa, permissões reais e dados persistidos.

Passo 7:
Decisões em falta:
- Confirmar se o MVP deve aceitar clientes sem NIF.
- A implementação atual permite nif = null.
- Esta decisão foi tomada para suportar clientes estrangeiros, particulares ou entidades sem identificação fiscal portuguesa.
- Caso exista documentação fiscal futura mais restritiva, a regra deverá ser revista.

Handoff para BK seguinte:
- Reutilizar customerValidators.js.
- Reutilizar customerService.js.
- Reutilizar customerController.js.
- Reutilizar customerRoutes.js.
- Manter utilização obrigatória de companyId vindo do contexto ativo.
- Preservar filtragem por companyId em todas as queries.
- Preservar soft-delete através de isActive = false.
- Não remover clientes fisicamente da base de dados sem requisito documental explícito.
- Reutilizar validação de NIF portuguesa existente em company-profile/nifValidator.js.

Validação final:
- Customer criado em schema.prisma.
- Company atualizado com customers.
- Prisma generate executado com sucesso.
- customerValidators.js criado e validado.
- customerService.js criado e validado.
- customerController.js criado.
- customerRoutes.js criado.
- server.js atualizado.
- GET /api/customers sem sessão => 401 SESSION_REQUIRED.
- POST /api/customers sem sessão => 401 SESSION_REQUIRED.
- PATCH /api/customers/:id sem sessão => 401 SESSION_REQUIRED.
- DELETE /api/customers/:id sem sessão => 401 SESSION_REQUIRED.
- INVALID_CUSTOMER_NAME => 400.
- INVALID_NIF => 400.
- INVALID_EMAIL => 400.