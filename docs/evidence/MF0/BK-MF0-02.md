Passo 1:
RF/RNF cobertos:
- RF02 (Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor))

BK seguinte:
- BK-MF0-03 (Multi empresa)

Passo 2:
- Enum Role criado em schema.prisma
- Prisma Client gerado com sucesso
- Não existem erros de schema nem nomes duplicados

Pendente:
- Prisma migrate, porque PostgreSQL local ainda não está disponível

Nota:
- Cenário 409 por constraint única não foi aplicável neste passo, porque na BK-MF0-02 eu apenas acrescentei enum Role e não criei nova constraint unique.

Passo 3:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/permissions/permissions.js').then(m => console.log(Object.keys(m)))"                                                             
[ 'Permission', 'getPermissionsForRole', 'hasPermission' ]

Cenario negativo
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/permissions/permissions.js').then(m => console.log(m.hasPermission('AUDITOR', m.Permission.CUSTOMERS_WRITE)))"
false
Nota:
- Cenário de payload 400 não se aplica diretamente neste passo, porque este ficheiro não valida payload HTTP; apenas define matriz/helper de permissões.

Passo 4:
- permissionMiddleware.js criado
- imports validados com Node
- requireRole exportado
- requirePermission exportado
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/permissions/permissionMiddleware.js').then(m => console.log(Object.keys(m)))"
[ 'requirePermission', 'requireRole' ]

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/permissions/permissionMiddleware.js').then(m => { const mw = m.requireRole('ADMIN'); const req = {}; const res = { status(code) { console.log('status', code); return this; }, json(body) { console.log(body); } }; mw(req, res, () => console.log('next')); })"
status 401
{ error: 'SESSION_REQUIRED', message: 'Sessao obrigatoria' }
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/permissions/permissionMiddleware.js').then(m => { const mw = m.requireRole('ADMIN'); const req = { user: { id: 'user-1' }, role: 
'AUDITOR' }; const res = { status(code) { console.log('status', code); return this; }, json(body) { console.log(body); } }; mw(req, res, () => console.log('next')); })"
status 403
{
  error: 'ROLE_FORBIDDEN',
  message: 'Papel sem acesso a esta operacao'
}

Nota:
- Cenário de outra empresa ainda não se aplica neste BK, porque multiempresa e requireCompanyContext pertencem ao BK-MF0-03.

Passo 5:
- permissionsController.js criado
- permissionsRoutes.js criado
- server.js atualizado com /api/permission
- E eu também criei requireCompanyContext temporariamente porque implementação real pertence ao BK-MF0-03.

Cenário negativo:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> try {
>>   Invoke-RestMethod -Method Get http://localhost:3000/api/permissions/me
>> } catch {
>>   $_.ErrorDetails.Message
>> }
{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

Pendente:
- Smoke 200 com cookie válido e empresa ativa, porque depende de PostgreSQL e BK-MF0-03.


Passo 6:
Smoke principal:
- Pendente até BK-MF0-03, porque GET /api/permissions/me com 200 exige cookie válido e empresa ativa.

Negativos executados antes:
- GET /api/permissions/me sem cookie => 401 SESSION_REQUIRED
- hasPermission("AUDITOR", Permission.CUSTOMERS_WRITE) => false

Negativos pendentes:
- AUDITOR em operação de escrita via rota real => 403
- sem empresa ativa => 403 depois de BK-MF0-03

Motivo:
- PostgreSQL local ainda não está disponível
- requireCompanyContext real pertence ao BK-MF0-03

Passo 7:

Decisões em falta:
- A matriz de permissões implementada em permissions.js foi criada com base em RF02 e em docs/RF.md como fonte final dos atores da MF0.
- Se existir uma matriz oficial de permissões noutro documento canónico, este ficheiro deverá ser revisto para garantir alinhamento.
- requireCompanyContext foi implementado temporariamente como stub porque a implementação real pertence ao BK-MF0-03.

Handoff para BK-MF0-03:
- Reutilizar enum Role criado em schema.prisma.
- Reutilizar permissions.js e permissionMiddleware.js.
- Substituir o stub requireCompanyContext pela implementação real multiempresa.
- Integrar companyId e role da empresa ativa na sessão/contexto.
- Validar GET /api/permissions/me com sessão válida e empresa ativa.

Validação final:
- Prisma generate executado com sucesso.
- Enum Role criado.
- permissions.js criado e validado.
- permissionMiddleware.js criado e validado.
- GET /api/permissions/me sem sessão => 401 SESSION_REQUIRED.
- hasPermission("AUDITOR", Permission.CUSTOMERS_WRITE) => false.

Correção de findings - 2026-06-01:
- Matriz de permissões ajustada para remover escrita de suppliers/items/warehouses da role GESTOR, mantendo ADMIN com acesso total.
- CONTABILISTA mantém SUPPLIERS_WRITE; OPERACIONAL mantém CUSTOMERS_WRITE, SUPPLIERS_WRITE, ITEMS_WRITE e WAREHOUSES_WRITE.
- GET /api/auth/me foi enriquecido com role e permissions no contexto da empresa ativa, mantendo /api/permissions/me.
- Validação executada: npm --prefix apps/api run test:unit confirmou a matriz de permissões.

Correção de findings - 2026-06-02:
- Guia BK-MF0-02 alinhado com docs/RF.md: GESTOR não recebe SUPPLIERS_WRITE, ITEMS_WRITE nem WAREHOUSES_WRITE.
- Código de permissions.js preservado, porque já seguia a decisão de least privilege baseada nos atores de RF.md.
- Validação executada: npm run test:unit confirmou que GESTOR continua sem permissões de fornecedores, artigos/serviços e armazéns.
