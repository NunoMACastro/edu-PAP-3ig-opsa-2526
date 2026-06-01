RF/RNF cobertos:
- RF01 (Registo, login e logout com cookies HttpOnly)

BK seguinte:
- BK-MF0-02 (Papéis e permissões)

Passo 2 validado:
- Prisma schema carregado com sucesso
- Prisma Client gerado com Prisma v6.19.3
- Modelos User e Session criados
- email com constraint @unique
- índices criados em Session.userId e Session.expiresAt

Comando:
npm run prisma:generate

Prisma generate executado com sucesso.

Migração Prisma pendente porque não existe instância PostgreSQL disponível no ambiente local neste momento.

Schema validado e Prisma Client gerado sem erros.

Passo 3:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/authValidators.js').then(m => console.log(Object.keys(m)))"
[ 'validateLoginPayload', 'validateRegisterPayload' ]

Passo 4:
Services e middleware criados.
Imports validados com Node.
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/authService.js').then(m => console.log(Object.keys(m)))"
[ 'loginUser', 'logoutUser', 'registerUser', 'resolveSession' ]
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/authMiddleware.js').then(m => console.log(Object.keys(m)))"
[ 'requireAuth' ]

Passo 5:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> curl http://localhost:3000/api/auth/me
curl : {"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}
At line:1 char:1
+ curl http://localhost:3000/api/auth/me
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (System.Net.HttpWebRequest:HttpWebRequest) [Invoke-WebRequest], WebException
    + FullyQualifiedErrorId : WebCmdletWebResponseException,Microsoft.PowerShell.Commands.InvokeWebRequestCommand

Passo 6:
Email Errada
- PS D:\PAP\edu-PAP-3ig-opsa-2526> Invoke-RestMethod -Method Post http://localhost:3000/api/auth/register `
>>   -ContentType "application/json" `
>>   -Body '{"email":"emailerrado","password":"UmaPasswordForte2026","name":"Ana Silva"}'
Invoke-RestMethod : {"error":"INVALID_EMAIL","message":"O email deve ter formato valido"}
At line:1 char:1
+ Invoke-RestMethod -Method Post http://localhost:3000/api/auth/registe ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (System.Net.HttpWebRequest:HttpWebRequest) [Invoke-RestMethod], WebException
    + FullyQualifiedErrorId : WebCmdletWebResponseException,Microsoft.PowerShell.Commands.InvokeRestMethodCommand

Password fraca
-PS D:\PAP\edu-PAP-3ig-opsa-2526> Invoke-RestMethod -Method Post http://localhost:3000/api/auth/register `
>>   -ContentType "application/json" `
>>   -Body '{"email":"ana.silva@example.pt","password":"123","name":"Ana Silva"}'
Invoke-RestMethod : {"error":"WEAK_PASSWORD","message":"A password deve ter pelo menos 10 caracteres"}
At line:1 char:1
+ Invoke-RestMethod -Method Post http://localhost:3000/api/auth/registe ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (System.Net.HttpWebRequest:HttpWebRequest) [Invoke-RestMethod], WebException
    + FullyQualifiedErrorId : WebCmdletWebResponseException,Microsoft.PowerShell.Commands.InvokeRestMethodCommand

Pendente:
- Smoke completo register/login/logout
- 409 EMAIL_ALREADY_EXISTS
- 401 INVALID_CREDENTIALS
- 401 INVALID_SESSION
- Verificação de passwordHash na base de dados

Motivo: PostgreSQL ainda não está disponível no ambiente local.

Passo 7:
bcrypt instalado e registado em package.json.


Handoff para BK-MF0-02:

Reutilizar:
- User
- Session
- requireAuth
- resolveSession
- GET /api/auth/me

Próximo BK:
- BK-MF0-02 Papéis e permissões

Correção de findings - 2026-06-01:
- validateLoginPayload deixou de aplicar política de password forte ao login; password curta em login é encaminhada para autenticação e falha como credenciais inválidas quando não corresponder.
- resolveSession passou a propagar uma sessão sem relação user/passwordHash.
- GET /api/auth/me passou a incluir activeCompanyId, role e permissions quando existir empresa ativa.
- Validações executadas nesta correção: npm --prefix apps/api run test:unit, npm --prefix apps/api run test:contracts, npm --prefix apps/api run syntax:check.
- Prisma validate executado com DATABASE_URL sintético e passou; prisma generate foi tentado, mas ficou bloqueado por permissões em apps/api/node_modules root-owned.
