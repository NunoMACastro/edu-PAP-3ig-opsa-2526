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