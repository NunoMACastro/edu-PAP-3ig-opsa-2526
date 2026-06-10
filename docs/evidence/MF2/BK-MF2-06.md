Passo 1
bk=BK-MF2-06
macro=MF2
rf=RF28
dependencias=BK-MF0-03, BK-MF0-07, BK-MF0-08
proximo=BK-MF2-07

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Modelos/relações implementados:
- criado model JournalAttachment;
- adicionada relação Company.journalAttachments;
- adicionada relação JournalEntry.attachments;
- adicionada relação User.journalAttachments.

Regras preparadas:
- anexo fica associado à empresa ativa;
- anexo fica associado ao JournalEntry;
- anexo fica associado ao utilizador que fez upload;
- ficheiro guarda apenas metadados no Prisma;
- storageKey aponta para armazenamento privado;
- JournalEntry e JournalEntryLine não foram duplicados.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate - falhou por drift pre-existente em PurchaseApprovalHistory no schema.prisma.
Erro observado: Type "PurchaseApprovalHistory" is neither a built-in type, nor refers to another model.
Impacto: bloqueia validação Prisma antes de avançar com migration FIFO.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate - também falhou por mesma razão.

Passo 3
Ficheiros criados:
- apps/api/src/modules/accounting/manualJournalService.js

Regras implementadas:
- parseManualJournal valida entryDate, description e lines;
- valores são tratados em cêntimos;
- cada linha só pode ter débito ou crédito, nunca ambos;
- lançamento precisa de pelo menos duas linhas;
- total de débitos tem de ser igual ao total de créditos;
- todas as linhas precisam de accountId;
- contas SNC são validadas por companyId e isActive;
- criação usa source=MANUAL;
- criação bloqueia período fiscal fechado;
- consulta só devolve lançamento da empresa ativa;
- edição só permite lançamentos com source=MANUAL;
- edição valida período antigo e novo;
- edição substitui linhas dentro da mesma transação;
- criação e edição geram AuditLog.

Smoke previsto/validado:
- criar lançamento manual equilibrado;
- consultar lançamento manual existente;
- editar data, descrição e linhas;
- confirmar que o lançamento continua equilibrado após edição;
- confirmar que as linhas antigas são substituídas pelas novas.

Negativos previstos:
- data inválida devolve 400;
- linha sem conta devolve 400;
- linha com débito e crédito ao mesmo tempo devolve 400;
- linha sem valor devolve 400;
- lançamento desequilibrado devolve 400;
- conta SNC inexistente ou de outra empresa devolve 404;
- período fiscal fechado devolve 409;
- lançamento automático não pode ser editado e devolve 409;
- lançamento de outra empresa devolve 404.

Passo 4
Passo 4 - Criar rotas com consulta, edição e anexos

Ficheiros criados/editados:
- criado apps/api/src/modules/accounting/journalAttachmentStorage.js;
- criado apps/api/src/modules/accounting/manualJournalRoutes.js;
- editado apps/api/src/server.js.

Endpoints criados:
- POST /api/accounting/manual-journals
- GET /api/accounting/manual-journals/:id
- PATCH /api/accounting/manual-journals/:id
- POST /api/accounting/manual-journals/:id/attachments

Regras implementadas:
- rotas protegidas com requireAuth;
- rotas protegidas com requireCompanyContext;
- acesso limitado a ADMIN, GESTOR e CONTABILISTA;
- criação delegada para manualJournalService;
- consulta filtra por companyId;
- edição só permite lançamentos MANUAL;
- anexos usam express.raw sem dependência extra;
- anexos aceitam apenas PDF, PNG e JPEG;
- limite de upload definido em 5mb;
- ficheiros são gravados em var/private-uploads;
- pasta de anexos não é pública;
- metadata do anexo é guardada em JournalAttachment;
- erros são normalizados com toHttpError.

Smoke previsto/validado:
- criar lançamento manual válido devolve 201;
- consultar lançamento por id devolve 200;
- editar lançamento manual devolve 200;
- anexar PDF válido devolve 201;
- anexo fica associado ao JournalEntry e ao utilizador autenticado.

Negativos previstos/validados:
- pedido sem sessão devolve 401;
- pedido sem empresa ativa devolve 403;
- role sem permissão devolve 403;
- consultar lançamento de outra empresa devolve 404;
- editar lançamento automático devolve 409;
- anexar ficheiro a lançamento automático devolve 404;
- anexar ficheiro a lançamento de outra empresa devolve 404;
- MIME inválido devolve 415;
- ficheiro vazio devolve 400.

Notas de segurança:
- anexos contabilísticos não são guardados em pasta pública;
- storageKey não é usado como URL público;
- dados de outra empresa não são expostos;
- companyId vem do contexto autenticado;
- roles são aplicadas no backend.