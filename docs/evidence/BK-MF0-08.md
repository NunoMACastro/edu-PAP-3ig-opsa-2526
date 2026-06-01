Passo 1:
RF/RNF cobertos:
- RF08 (Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho)

BK seguinte:
- BK-MF0-09 (Criar e gerir clientes)

Passo 2:
- FiscalPeriodStatus criado
- FiscalPeriod criado em schema.prisma
- Company atualizado com fiscalPeriods
- Prisma generate executado com sucesso
- Não existem erros de schema nem modelos duplicados

Pendente:
- Prisma migrate, porque PostgreSQL local ainda não está disponível

Cenário negativo:
- Constraint @@unique([companyId, name]) preparada para impedir períodos fiscais duplicados com o mesmo nome na mesma empresa.
- Teste 409 ainda não executado porque requer PostgreSQL local e dados persistidos.
- O conflito controlado deverá ser tratado no service/controller como 409.

Passo 3:
Import validado com Node
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/fiscal-periods/fiscalPeriodValidators.js').then(m => console.log(Object.keys(m)))"
[ 'validateFiscalPeriodPayload' ]

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/fiscal-periods/fiscalPeriodValidators.js').then(m => { try { m.validateFiscalPeriodPayload(null); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_BODY O corpo do pedido deve ser JSON

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/fiscal-periods/fiscalPeriodValidators.js').then(m => { try { m.validateFiscalPeriodPayload({ name: 'S1', startDate: '2026-01-01', endDate: '2026-12-31' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_PERIOD_NAME Nome do periodo invalido

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/fiscal-periods/fiscalPeriodValidators.js').then(m => { try { m.validateFiscalPeriodPayload({ name: 'Ano 2026', startDate: '01-01-2026', endDate: '2026-12-31' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_DATE startDate deve usar formato YYYY-MM-DD

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/fiscal-periods/fiscalPeriodValidators.js').then(m => { try { m.validateFiscalPeriodPayload({ name: 'Ano 2026', startDate: '2026-12-31', endDate: '2026-01-01' }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_PERIOD_RANGE Data final deve ser posterior a data inicial

Nota:
- Payload mal formado é bloqueado no validator antes de chegar ao Prisma.

Passo 4:
Import validado com Node
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/fiscal-periods/fiscalPeriodService.js').then(m => console.log(Object.keys(m)))"                                                  
[
  'assertOpenFiscalPeriod',
  'closeFiscalPeriod',
  'createFiscalPeriod',
  'listFiscalPeriods'
]

Pendentes:
- createFiscalPeriod com período válido
- createFiscalPeriod com sobreposição => 409 FISCAL_PERIOD_OVERLAP
- closeFiscalPeriod com período inexistente => 404 FISCAL_PERIOD_NOT_FOUND
- closeFiscalPeriod já fechado => 409 FISCAL_PERIOD_ALREADY_CLOSED
- assertOpenFiscalPeriod sem período => 400 FISCAL_PERIOD_MISSING
- assertOpenFiscalPeriod em período fechado => 409 FISCAL_PERIOD_CLOSED

Motivo:
- Requer PostgreSQL local e dados persistidos.

Nota:
- O service recebe companyId vindo do contexto ativo, não do body.

Passo 5:
- API iniciou com sucesso

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i http://localhost:3000/api/fiscal-periods                                                                                                            
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 13:39:52 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X POST "http://localhost:3000/api/fiscal-periods/test-id/close"
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 13:40:54 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X POST "http://localhost:3000/api/fiscal-periods"
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 13:45:29 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

Nota:
- Validações 400 do payload foram testadas diretamente no validator no Passo 3.
- Cenários de 409/404 dependem de PostgreSQL local e dados persistidos.

Passo 6:
Smoke principal:
- Pendente até existir PostgreSQL local, sessão válida, empresa ativa e permissão FISCAL_PERIODS_MANAGE.

Negativos executados:

1) GET /api/fiscal-periods sem sessão
Resultado:
401 SESSION_REQUIRED

2) POST /api/fiscal-periods sem sessão
Resultado:
401 SESSION_REQUIRED

3) POST /api/fiscal-periods/:id/close sem sessão
Resultado:
401 SESSION_REQUIRED

4) validateFiscalPeriodPayload com data inválida
Resultado:
400 INVALID_DATE

5) validateFiscalPeriodPayload com intervalo inválido
Resultado:
400 INVALID_PERIOD_RANGE

6) validateFiscalPeriodPayload com nome curto
Resultado:
400 INVALID_PERIOD_NAME

Pendentes:
- POST /api/fiscal-periods com payload válido => 201
- Criar período sobreposto => 409 FISCAL_PERIOD_OVERLAP
- Fechar período inexistente => 404 FISCAL_PERIOD_NOT_FOUND
- Fechar período já fechado => 409 FISCAL_PERIOD_ALREADY_CLOSED
- assertOpenFiscalPeriod em período fechado => 409 FISCAL_PERIOD_CLOSED
- Teste com OPERACIONAL sem permissão => 403 PERMISSION_FORBIDDEN

Motivo:
- PostgreSQL local ainda não está disponível.
- Cenários completos dependem de sessão válida, empresa ativa, permissões reais e dados persistidos.

Passo 7:
Decisões em falta:
- O guia original refere POST /api/fiscal-periods/:id/reopen.
- RF08 apenas documenta abertura, fecho e bloqueio de lançamentos após fecho.
- A reabertura pode ter impacto legal e de auditoria.
- Esta funcionalidade fica pendente até existir documentação oficial.

- Falta BK de auditoria operacional.
- Atualmente o fecho regista closedAt e closedById.
- Quando existir módulo de auditoria, deverá ser registado um evento de auditoria sem alterar a regra principal de fecho.

Handoff para BK-MF0-09:
- Reutilizar fiscalPeriodValidators.js.
- Reutilizar fiscalPeriodService.js.
- Reutilizar fiscalPeriodController.js.
- Reutilizar fiscalPeriodRoutes.js.
- Manter utilização obrigatória de companyId vindo do contexto ativo.
- Reutilizar assertOpenFiscalPeriod para bloquear operações em períodos fechados.
- Não implementar reabertura de períodos sem documentação oficial.
- Preservar registo de closedAt e closedById em qualquer evolução futura.

Validação final:
- FiscalPeriodStatus criado.
- FiscalPeriod criado em schema.prisma.
- Company atualizado com fiscalPeriods.
- Prisma generate executado com sucesso.
- fiscalPeriodValidators.js criado e validado.
- fiscalPeriodService.js criado e validado.
- fiscalPeriodController.js criado.
- fiscalPeriodRoutes.js criado.
- server.js atualizado.
- GET /api/fiscal-periods sem sessão => 401 SESSION_REQUIRED.
- POST /api/fiscal-periods sem sessão => 401 SESSION_REQUIRED.
- POST /api/fiscal-periods/:id/close sem sessão => 401 SESSION_REQUIRED.
- INVALID_DATE => 400.
- INVALID_PERIOD_NAME => 400.
- INVALID_PERIOD_RANGE => 400.

Correção de findings - 2026-06-01:
- apps/web passou a incluir UI mínima para listar, abrir e fechar períodos fiscais existentes.
- Não foi adicionada reabertura de períodos, mantendo a decisão documental de não implementar reabertura sem regra legal explícita.
- Validações executadas: npm --prefix apps/web run typecheck, npm --prefix apps/web run build.
