Passo 1:
RF/RNF cobertos:
- RF06 (Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal))

BK seguinte:
- BK-MF0-07 (Criar/importar plano de contas (SNC))

Passo 2:
- CompanyProfile criado em schema.prisma
- Company atualizado com profile CompanyProfile?
- Prisma generate executado com sucesso
- Não existem erros de schema nem modelos duplicados

Pendente:
- Prisma migrate, porque PostgreSQL local ainda não está disponível

Cenário negativo:
- Constraint companyId @unique preparada para impedir mais do que um perfil por empresa.
- Constraint nif @unique preparada para impedir duplicação de NIF.
- Teste 409 ainda não executado porque requer PostgreSQL local e dados persistidos.
- O conflito controlado deverá ser tratado no service/controller como 409.

Passo 3:
Imports validados com Node
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-profile/nifValidator.js').then(m => console.log(Object.keys(m)))"
[ 'isValidPortugueseNif' ]

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-profile/companyProfileValidators.js').then(m => console.log(Object.keys(m)))"
[ 'validateCompanyProfilePayload' ]

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-profile/companyProfileValidators.js').then(m => { try { m.validateCompanyProfilePayload(null); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_BODY O corpo do pedido deve ser JSON

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-profile/companyProfileValidators.js').then(m => { try { m.validateCompanyProfilePayload({ nif: '12345678' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_NIF NIF portugues invalido

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-profile/companyProfileValidators.js').then(m => { try { m.validateCompanyProfilePayload({ nif: '509442013', currency: 'USD' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_CURRENCY A moeda base documentada para o MVP e EUR

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-profile/companyProfileValidators.js').then(m => { try { m.validateCompanyProfilePayload({ nif: '509442013', currency: 'EUR', fiscalYearStartMonth: 13, fiscalYearStartDay: 1 }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_FISCAL_PERIOD Mes fiscal invalido

Nota:
- Payload mal formado é bloqueado no validator antes de chegar ao Prisma.

Passo 4:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/company-profile/companyProfileService.js').then(m => console.log(Object.keys(m)))"
[ 'getCompanyProfile', 'upsertCompanyProfile' ]

Pendente:
- getCompanyProfile sem perfil => 404 COMPANY_PROFILE_NOT_FOUND
- upsertCompanyProfile com dados válidos
- conflitos unique companyId/nif => 409

Motivo:
- Requer PostgreSQL local e dados persistidos.

Nota:
- O service recebe companyId vindo do contexto ativo, não do body.

Passo 5:
- companyProfileController.js criado
- companyProfileRoutes.js criado
- server.js atualizado com /api/company/profile
- API iniciou com sucesso

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i http://localhost:3000/api/company/profile
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 10:47:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X PUT "http://localhost:3000/api/company/profile" -H "Content-Type: application/json" --data-raw '{\"nif\":\"12345678\"}'
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 10:48:31 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

Nota:
- Validação 400 do payload foi testada diretamente no validator no Passo 3, porque via endpoint sem sessão o requireAuth bloqueia primeiro.

Passo 6:
Smoke principal:
- Pendente até existir PostgreSQL local, sessão válida, empresa ativa e permissão COMPANY_WRITE.

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> $body = @{
>>   legalName = "OPSA Demo Lda"
>>   nif = "509442013"
>>   addressLine1 = "Rua da Contabilidade 10"
>>   city = "Lisboa"
>>   country = "PT"
>>   currency = "EUR"
>>   fiscalYearStartMonth = 1
>>   fiscalYearStartDay = 1
>> } | ConvertTo-Json
>> 
>> try {
>>   Invoke-RestMethod -Method Put "http://localhost:3000/api/company/profile" `
>>     -ContentType "application/json" `
>>     -Body $body
>> } catch {
>>   $_.ErrorDetails.Message
>> }
{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

Pendentes:
- PUT /api/company/profile com payload válido => 200
- GET /api/company/profile depois de criar perfil => 200
- GET antes de existir perfil => 404 COMPANY_PROFILE_NOT_FOUND
- AUDITOR tenta PUT => 403 PERMISSION_FORBIDDEN
- conflito de NIF duplicado => 409 NIF_ALREADY_EXISTS
- troca entre empresas e confirmação de perfis diferentes

Motivo:
- PostgreSQL local ainda não está disponível.
- Cenários completos dependem de sessão válida, empresa ativa, permissões reais e dados persistidos.


Passo 7:
Decisões em falta:
- Confirmar storage final de logótipo.
- Até existir decisão de storage, logoUrl é apenas uma referência externa validada como string.
- Confirmar se OPSA vai suportar multi-moeda.
- Neste BK a moeda fica limitada a EUR, por ser o mínimo seguro para o MVP português.
- PostgreSQL local ainda não está disponível para smoke tests completos.

Handoff para BK-MF0-07:
- Reutilizar CompanyProfile criado neste BK.
- Reutilizar companyProfileValidators.js.
- Reutilizar companyProfileService.js.
- Reutilizar companyId vindo de requireCompanyContext.
- Manter EUR como moeda base até existir decisão canónica sobre multi-moeda.
- Dados da empresa ficam associados a companyId, não a dados enviados no body.

Validação final:
- CompanyProfile criado no schema Prisma.
- Company atualizado com profile.
- Prisma generate executado com sucesso.
- nifValidator.js criado e validado.
- companyProfileValidators.js criado e validado.
- companyProfileService.js criado.
- companyProfileController.js criado.
- companyProfileRoutes.js criado.
- server.js atualizado.
- GET /api/company/profile sem sessão => 401 SESSION_REQUIRED.
- PUT /api/company/profile sem sessão => 401 SESSION_REQUIRED.
- INVALID_NIF => 400.
- INVALID_CURRENCY => 400.
- INVALID_FISCAL_PERIOD => 400.

Correção de findings - 2026-06-01:
- validateCompanyProfilePayload passou a aceitar currency omitida e assumir EUR.
- upsertCompanyProfile passou a mapear conflito único de nif para NIF_ALREADY_EXISTS.
- Validações executadas: npm --prefix apps/api run test:unit e npm --prefix apps/api run test:contracts.
