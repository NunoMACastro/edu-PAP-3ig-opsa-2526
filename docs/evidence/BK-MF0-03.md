Passo 1:
RF/RNF cobertos:
- RF03 (Multiempresa: um utilizador pode ter papéis diferentes em várias empresas)

BK seguinte:
- BK-MF0-04 (Gestão de utilizadores)

Passo 2:
- Company e CompanyMembership criados no schema.prisma
- User atualizado com memberships
- Session atualizado com activeCompanyId
- Prisma Client gerado com sucesso
- Não existem erros de schema nem nomes duplicados

Pendente:
- Prisma migrate, porque PostgreSQL local ainda não está disponível

Cenário negativo:
- Constraint @@unique([userId, companyId]) preparada para impedir memberships duplicadas.
- Teste 409 ainda não aplicável por endpoint, porque vamos tratar criação/gestão de membership em BK-MF0-04.

Passo 3: 
- companyValidators.js criado
- validateSwitchCompanyPayload exportado
Testes do companyValidators.js 
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/companies/companyValidators.js').then(m => console.log(Object.keys(m)))"
[ 'validateSwitchCompanyPayload' ]

Payloads invalidos
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/companies/companyValidators.js').then(m => { try { m.validateSwitchCompanyPayload({}); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_COMPANY_ID companyId e obrigatorio
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/companies/companyValidators.js').then(m => { try { m.validateSwitchCompanyPayload(null); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_BODY O corpo do pedido deve ser um objeto JSON

Passo 4:
- companyService.js criado
- companyContext.js atualizado já com implementação real

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/companies/companyService.js').then(m => console.log(Object.keys(m)))"                                                            
[ 'getCompanyContext', 'listUserCompanies', 'switchActiveCompany' ]

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/companies/companyContext.js').then(m => console.log(Object.keys(m)))"
[ 'requireCompanyContext' ]

Cenário negativo:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/companies/companyService.js').then(async m => { try { await m.getCompanyContext({}, { userId: 'u1', companyId: null }); } catch (e) { console.log(e.status, e.code, e.message); } })"
403 COMPANY_CONTEXT_REQUIRED Empresa ativa obrigatoria

Nota:
- Testes com membership real ficam pendentes até existir PostgreSQL local e dados seed.

Passo 5:
- companyController.js criado
- companyRoutes.js criado
- server.js atualizado com buildCompanyRoutes
- API iniciou com sucesso

- PS D:\PAP\edu-PAP-3ig-opsa-2526> curl.exe -i http://localhost:3000/api/companies
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sat, 30 May 2026 18:57:14 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526> curl.exe -i http://localhost:3000/api/session/context
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sat, 30 May 2026 19:00:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

Passo 6: 
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/companies/companyValidators.js').then(m => { try { m.validateSwitchCompanyPayload({}); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_COMPANY_ID companyId e obrigatorio

Pendente:
- 403 COMPANY_FORBIDDEN
Motivo:
- Requer sessão válida, empresas e memberships reais em PostgreSQL.
- Não é possível reproduzir o cenário sem dados persistidos.

Nota:
- Via endpoint POST /api/session/company este erro ainda não aparece, porque sem sessão o middleware requireAuth devolve primeiro 401 SESSION_REQUIRED.

Passo 7:

Decisões em falta:
- Confirmar se a primeira empresa e a primeira membership são criadas por seed, onboarding ou convite.
- Este BK apenas define o contrato técnico para utilização de empresas já existentes.
- PostgreSQL local ainda não está disponível, pelo que smoke tests completos ficam pendentes.

Handoff para BK-MF0-04:
- Reutilizar Company, CompanyMembership e Role definidos neste BK.
- Reutilizar companyService.js e companyContext.js.
- Reutilizar validateSwitchCompanyPayload.
- Reutilizar req.companyId, req.role e req.company definidos por requireCompanyContext.
- Todas as rotas empresariais futuras devem filtrar dados por req.companyId.
- Todas as verificações de permissões devem usar o papel obtido através do contexto da empresa ativa.

Validação final:
- Company e CompanyMembership criados no schema Prisma.
- User atualizado com memberships.
- Session atualizado com activeCompanyId.
- Prisma generate executado com sucesso.
- companyValidators.js criado e validado.
- companyService.js criado e validado.
- companyContext.js implementado.
- GET /api/companies sem sessão => 401 SESSION_REQUIRED.
- GET /api/session/context sem sessão => 401 SESSION_REQUIRED.
- validateSwitchCompanyPayload sem companyId => 400 INVALID_COMPANY_ID.
- getCompanyContext sem companyId => 403 COMPANY_CONTEXT_REQUIRED.