Passo 1:
RF/RNF cobertos:
- RF05 (Recuperação de password via email)

BK seguinte:
- BK-MF0-06 (Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal))

Passo 2:
- PasswordResetToken criado
- User atualizado
- Prisma generate executado com sucesso

Pendente:
- Prisma migrate, porque PostgreSQL local ainda não está disponível

Cenário negativo:
- Constraint tokenHash @unique preparada para impedir tokens duplicados.
- Teste 409 ainda não executado porque requer PostgreSQL local e dados persistidos.
- O conflito controlado deverá ser tratado no service/controller como 409 se ocorrer duplicação de tokenHash.

Passo 3:
- imports validados com Node
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/passwordResetValidators.js').then(m => console.log(Object.keys(m)))"
[ 'validateForgotPasswordPayload', 'validateResetPasswordPayload' ]

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/passwordResetRateLimit.js').then(m => console.log(Object.keys(m)))"
[ 'assertPasswordResetRateLimit' ]

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/passwordResetEmailAdapter.js').then(m => console.log(Object.keys(m)))"
[ 'buildPasswordResetEmailAdapter' ]

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/passwordResetValidators.js').then(m => { try { m.validateForgotPasswordPayload({ email: 'errado' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_EMAIL Email invalido

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/passwordResetValidators.js').then(m => { try { m.validateResetPasswordPayload({ token: 'abc', password: '1234567890' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_TOKEN Token invalido

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/passwordResetValidators.js').then(m => { try { m.validateResetPasswordPayload({ token: 'abcdefghijklmnopqrstuvwxyz123456', password: '123' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 WEAK_PASSWORD A password deve ter pelo menos 10 caracteres

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/passwordResetRateLimit.js').then(m => { try { for (let i = 0; i < 6; i++) m.assertPasswordResetRateLimit('test@example.pt', 1000); } catch (e) { console.log(e.status, e.code, e.message); } })"
429 RATE_LIMITED Demasiados pedidos de recuperacao

Nota:
- Payload mal formado é bloqueado no validator antes de chegar ao Prisma.

Passo 4:
- passwordResetService.js criado
- imports validados com Node
PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/auth/passwordResetService.js').then(m => console.log(Object.keys(m)))"
[ 'requestPasswordReset', 'resetPassword' ]

Pendente:
- Teste de email inexistente => resposta genérica { ok: true }
- Teste de token inválido/expirado/usado => 400 INVALID_RESET_TOKEN
- Teste de atualização de passwordHash
- Teste de revogação de sessões

Motivo:
- Requer PostgreSQL local e dados persistidos.

Nota:
- O service foi implementado para não revelar se o email existe.

Passo 5:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X POST "http://localhost:3000/api/auth/password/forgot" -H "Content-Type: application/json" --data-raw '{\"email\":\"errado\"}'
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 52
Date: Sun, 31 May 2026 09:08:28 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"INVALID_EMAIL","message":"Email invalido"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X POST "http://localhost:3000/api/auth/password/reset" -H "Content-Type: application/json" --data-raw '{\"token\":\"abc\",\"password\":\"1234567890\"}'
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 52
ETag: W/"34-pClHXnPd70NXw/veS65/JWjyM5Q"
Date: Sun, 31 May 2026 09:11:06 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"INVALID_TOKEN","message":"Token invalido"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X POST "http://localhost:3000/api/auth/password/reset" -H "Content-Type: application/json" --data-raw '{\"token\":\"abcdefghijklmnopqrstuvwxyz123456\",\"password\":\"123\"}'
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 82
ETag: W/"52-1Jt1XmHKb0w/Msd8Y99tCCUKz0M"
Date: Sun, 31 May 2026 09:11:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"WEAK_PASSWORD","message":"A password deve ter pelo menos 10 caracteres"}

(Aqui so pedido 6 resposta é RATE_LIMITED Demasiados pedidos de recuperacao)
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> 1..6 | ForEach-Object {
>>   curl.exe -s -X POST "http://localhost:3000/api/auth/password/forgot" `
>>     -H "Content-Type: application/json" `
>>     --data-raw '{\"email\":\"teste@example.pt\"}'
>> }
{"error":"INTERNAL_ERROR","message":"Erro interno inesperado"}{"error":"INTERNAL_ERROR","message":"Erro interno inesperado"}{"error":"INTERNAL_ERROR","message":"Erro interno inesperado"}{"error":"INTERNAL_ERROR","message":"Erro interno inesperado"}{"error":"INTERNAL_ERROR","message":"Erro interno inesperado"}{"error":"RATE_LIMITED","message":"Demasiados pedidos de recuperacao"}

Passo 6:
Smoke principal:
- Pendente até existir PostgreSQL local, utilizador real e token persistido.

Negativos executados:

1) POST /api/auth/password/forgot com email inválido
Resultado:
400 INVALID_EMAIL

2) POST /api/auth/password/reset com token inválido
Resultado:
400 INVALID_TOKEN

3) POST /api/auth/password/reset com password fraca
Resultado:
400 WEAK_PASSWORD

4) RATE_LIMITED
Resultado:
429 RATE_LIMITED

Pendentes:
- POST /api/auth/password/forgot com email inexistente => 200 genérico
- POST /api/auth/password/forgot com email existente => 200 genérico
- Recolher token no adaptador de desenvolvimento
- POST /api/auth/password/reset com token válido => 200
- Token expirado => 400 INVALID_RESET_TOKEN
- Token usado => 400 INVALID_RESET_TOKEN
- Confirmar que password antiga deixa de funcionar
- Confirmar que sessões antigas foram revogadas

Motivo:
- PostgreSQL local ainda não está disponível.
- Os testes completos exigem utilizador real, token persistido e sessões reais.


Passo 7:
Decisões em falta:
- Falta escolher provider real de email e template final conforme RNF21.
- O passwordResetEmailAdapter atual serve apenas para desenvolvimento e evidence.
- O rate limit em memória é aceitável apenas para desenvolvimento.
- Em produção deverá ser substituído por armazenamento partilhado quando a arquitetura de deploy estiver definida.
- PostgreSQL local ainda não está disponível para smoke tests completos.

Handoff para BK-MF0-06:
- Reutilizar PasswordResetToken criado neste BK.
- Reutilizar passwordResetValidators.js.
- Reutilizar passwordResetRateLimit.js.
- Reutilizar passwordResetEmailAdapter.js.
- Reutilizar passwordResetService.js.
- Manter resposta genérica { ok: true } para evitar user enumeration.
- Manter invalidação de sessões após alteração de password.
- Manter tokenHash como único valor persistido; nunca guardar tokens em texto simples.

Validação final:
- PasswordResetToken criado.
- User atualizado com passwordResetTokens.
- Prisma generate executado com sucesso.
- passwordResetValidators.js criado e validado.
- passwordResetRateLimit.js criado e validado.
- passwordResetEmailAdapter.js criado e validado.
- passwordResetService.js criado.
- passwordResetController.js criado.
- authRoutes.js atualizado.
- INVALID_EMAIL => 400.
- INVALID_TOKEN => 400.
- WEAK_PASSWORD => 400.
- RATE_LIMITED => 429.