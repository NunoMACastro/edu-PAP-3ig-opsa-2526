Passo 1:
RF/RNF cobertos:
- RF04 (Gestão de utilizadores: convite, remoção e definição de papéis)

BK seguinte:
- BK-MF0-05 (Recuperação de password via email)

Passo 2:
- schema.prisma atualizado
- Geracao feita

Pendente:
- Prisma migrate, porque PostgreSQL local ainda não está disponível

Cenário negativo:
- Constraint tokenHash @unique preparada para impedir convites com token duplicado.
- Teste 409 ainda não executado porque requer PostgreSQL local e dados persistidos.
- O conflito controlado deverá ser tratado no service/controller quando houver teste com base de dados.

Passo 3:
Testes:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-users/companyUserValidators.js').then(m => console.log(Object.keys(m)))"
[ 'validateInvitationPayload', 'validateRolePayload' ]

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-users/invitationEmailAdapter.js').then(m => console.log(Object.keys(m)))"
[ 'buildInvitationEmailAdapter' ]

Cenário negativo:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-users/companyUserValidators.js').then(m => { try { m.validateInvitationPayload({ email: 'errado', role: 'ADMIN' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_EMAIL Email invalido

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-users/companyUserValidators.js').then(m => { try { m.validateInvitationPayload({ email: 'joao@example.pt', role: 'SUPERADMIN' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_ROLE Papel invalido

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-users/companyUserValidators.js').then(m => { try { m.validateRolePayload(null); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_BODY O corpo do pedido deve ser JSON

Passo 4:
- imports validados com Node
PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-users/companyUserService.js').then(m => console.log(Object.keys(m)))"
[
  'inviteUser',
  'listCompanyUsers',
  'removeCompanyUser',
  'updateCompanyUserRole'
]

Pendente:
- Testes funcionais de listCompanyUsers, inviteUser, updateCompanyUserRole e removeCompanyUser.
- Cenários 409 LAST_ADMIN, 409 CANNOT_REMOVE_SELF e 404 USER_NOT_IN_COMPANY.

Motivo:
- Requer PostgreSQL local, empresas, utilizadores e memberships reais.

Nota:
- O service usa companyId nas queries de memberships, garantindo isolamento por empresa.

Passo 5:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i http://localhost:3000/api/company/users
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sat, 30 May 2026 21:54:47 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> try {
>>   Invoke-RestMethod -Method Post "http://localhost:3000/api/company/invitations" `
>>     -ContentType "application/json" `
>>     -Body '{"email":"joao.contabilista@example.pt","role":"CONTABILISTA"}'
>> } catch {
>>   $_.ErrorDetails.Message
>> }
{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

Passo 6:
Smoke principal:
- Pendente até existir PostgreSQL local, sessão válida, empresa ativa e membership com permissão USERS_MANAGE.

Negativos executados:

1) GET /api/company/users sem sessão
Resultado:
401 SESSION_REQUIRED

2) POST /api/company/invitations sem sessão
Resultado:
401 SESSION_REQUIRED

3) validateInvitationPayload com email inválido
Resultado:
400 INVALID_EMAIL

4) validateInvitationPayload com role inválida
Resultado:
400 INVALID_ROLE

5) validateRolePayload com body inválido
Resultado:
400 INVALID_BODY

Pendentes:
- POST /api/company/invitations com payload válido => 201
- AUDITOR tenta convidar utilizador => 403 PERMISSION_FORBIDDEN
- Alterar último ADMIN para AUDITOR => 409 LAST_ADMIN
- Remover a própria membership => 409 CANNOT_REMOVE_SELF
- Remover utilizador inexistente/fora da empresa => 404 USER_NOT_IN_COMPANY
- USER_ALREADY_IN_COMPANY => 409

Motivo:
- PostgreSQL local ainda não está disponível.
- Cenários dependem de sessão válida, empresa ativa e memberships reais.

Passo 7:

Decisões em falta:
- Falta escolher o fornecedor real de email (SMTP, SendGrid, Mailgun, Resend ou equivalente).
- O invitationEmailAdapter criado neste BK serve apenas para desenvolvimento e evidence.
- A implementação final deve cumprir RNF21 sem alterar o service.
- Falta confirmar se a aceitação de convite pertence a este BK ou ao BK seguinte.
- PostgreSQL local ainda não está disponível para smoke tests completos.

Handoff para BK-MF0-05:
- Reutilizar CompanyInvitation e InvitationStatus criados neste BK.
- Reutilizar companyUserService.js.
- Reutilizar companyUserValidators.js.
- Reutilizar invitationEmailAdapter.js através de interface/adapter sem acoplar o service ao fornecedor real de email.
- Reutilizar requireAuth, requireCompanyContext e permissionMiddleware dos BKs anteriores.
- Manter filtragem por companyId em todas as queries empresariais.
- Manter controlo de permissões baseado em req.role e Permission.USERS_MANAGE.

Validação final:
- InvitationStatus criado.
- CompanyInvitation criado.
- Company atualizado com invitations.
- Prisma generate executado com sucesso.
- companyUserValidators.js criado e validado.
- invitationEmailAdapter.js criado e validado.
- companyUserService.js criado.
- companyUserController.js criado.
- companyUserRoutes.js criado.
- server.js atualizado.
- GET /api/company/users sem sessão => 401 SESSION_REQUIRED.
- POST /api/company/invitations sem sessão => 401 SESSION_REQUIRED.
- INVALID_EMAIL => 400.
- INVALID_ROLE => 400.
- INVALID_BODY => 400.

Correção de findings - 2026-06-01:
- invitationEmailAdapter deixou de registar token bruto, URL secreta ou email completo; regista apenas metadados de envio mock.
- Validação executada: npm --prefix apps/api run test:contracts confirmou que logs do adapter não incluem token nem URL de convite.
