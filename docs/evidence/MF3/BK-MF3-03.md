Passo 1
* BK: BK-MF3-03
* Macrofase: MF3
* Requisito funcional: RF33
* Dependência: BK-MF3-02, BK-MF1-03, BK-MF1-08
* Sprint: S07-S08
* Próximo BK: BK-MF3-04
* Endpoint previsto: POST /api/treasury/statements/import

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Modelos criados:
- BankStatementImport;
- BankStatementLine;
- BankReconciliationSuggestion.

Regras preparadas:
- importação fica associada à empresa e à conta de tesouraria;
- cada linha fica associada à importação;
- linhas guardam bookedAt, description, reference e amountCents;
- sugestões começam com status SUGGESTED;
- sugestões não confirmam recebimentos nem pagamentos;
- índices por companyId evitam mistura entre empresas;
- unique constraint reduz duplicados dentro da mesma importação.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run prisma:generate          

> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 2.09s