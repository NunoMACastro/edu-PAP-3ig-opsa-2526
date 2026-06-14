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

Passo 3
Ficheiros criados:
- apps/api/src/modules/treasury/statementImportValidators.js
Temporario
- edu-PAP-3ig-opsa-2526> node test-statement-validator.js

Regras implementadas:
- treasuryAccountId é obrigatório;
- fileName é obrigatório;
- format é obrigatório;
- content é obrigatório;
- formatos aceites: CSV e OFX;
- CSV usa data;descricao;referencia;valor;
- OFX simplificado usa DTPOSTED, MEMO e TRNAMT;
- valores em euros são normalizados para cêntimos;
- datas inválidas são rejeitadas antes do service;
- validator devolve rows normalizadas.

Smoke validado:
- CSV `2026-01-02;Pagamento cliente;FT 1;123.45` gera 1 linha;
- amountCents calculado: 12345;
- reference calculada: FT 1.

Negativo validado:
- format=PDF devolve 400 INVALID_STATEMENT_FORMAT.

Comandos executados:
- node test-statement-validator.js
- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-statement-validator.js
{
  treasuryAccountId: 'treasury-1',
  fileName: 'extrato.csv',
  format: 'CSV',
  rows: [
    {
      bookedAt: 2026-01-02T00:00:00.000Z,
      description: 'Pagamento cliente',
      reference: 'FT 1',
      amountCents: 12345
    }
  ]
}
Teste CSV passou: 123.45 EUR convertido para 12345 cêntimos.
{
  status: 400,
  code: 'INVALID_STATEMENT_FORMAT',
  message: 'Formato deve ser CSV ou OFX'
}
Teste negativo passou: PDF devolve INVALID_STATEMENT_FORMAT.

Passo 4