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
- edu-PAP-3ig-opsa-2526/test-statement-validator.js

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
Ficheiros criados:
- apps/api/src/modules/treasury/statementImportService.js
Temporario
- edu-PAP-3ig-opsa-2526/test-statement-service.js

Regras implementadas:
- valida conta de tesouraria por companyId e isActive;
- cria BankStatementImport dentro de transação;
- cria BankStatementLine para cada linha normalizada;
- procura Receipt para valores positivos;
- procura Payment para valores negativos;
- usa igualdade de valor em cêntimos;
- usa tolerância de três dias;
- cria BankReconciliationSuggestion;
- sugestão começa como SUGGESTED;
- não confirma recebimentos nem pagamentos automaticamente.

Smoke validado:
- linha positiva de 12345 cêntimos com data próxima de Receipt gerou sugestão RECEIPT.

Negativo validado:
- conta inativa ou de outra empresa devolve 404 TREASURY_ACCOUNT_NOT_FOUND.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-statement-service.js
{
  "id": "import-1",
  "companyId": "company-1",
  "treasuryAccountId": "treasury-1",
  "fileName": "extrato.csv",
  "format": "CSV",
  "status": "IMPORTED",
  "totalLines": 1,
  "validLines": 1,
  "errorLines": 0,
  "importedById": "user-1",
  "lines": [
    {
      "id": "line-1",
      "bookedAt": "2026-01-02T00:00:00.000Z",
      "description": "Pagamento cliente",
      "reference": "FT 1",
      "amountCents": 12345,
      "companyId": "company-1",
      "importId": "import-1",
      "suggestions": [
        {
          "targetType": "RECEIPT",
          "targetId": "receipt-1",
          "confidence": 90,
          "reason": "Valor igual e data próxima de recebimento"
        }
      ]
    }
  ]
}
[
  {
    "id": "suggestion-1",
    "targetType": "RECEIPT",
    "targetId": "receipt-1",
    "confidence": 90,
    "reason": "Valor igual e data próxima de recebimento",
    "companyId": "company-1",
    "statementLineId": "line-1"
  }
]
Teste positivo passou: linha positiva gerou sugestão RECEIPT.
{
  status: 404,
  code: 'TREASURY_ACCOUNT_NOT_FOUND',
  message: 'Conta de tesouraria não encontrada'
}
Teste negativo passou: conta inativa/outra empresa devolve 404.

Passo 5
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (18.2751ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (2.9536ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (5.2437ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (11.2359ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (4.0567ms)
✔ BK12: nome de armazém duplicado é rejeitado (5.0207ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (2.9386ms)
✔ MF1: routers principais montam sem dependências inexistentes (9.4618ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (6.2109ms)
✔ MF1 HTTP: operacional não pode aprovar venda (2.5815ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (3.0795ms)

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (5.2485ms)
✔ BK01: registo mantém política de password forte (1.9837ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.4031ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.7539ms)
✔ BK07: importação vazia é rejeitada (0.855ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (1.0245ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.2067ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.1696ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (5.5506ms)
✔ BK-MF1-01: IVA isento exige motivo de isenção (101.0382ms)
✔ BK-MF1-02: venda calcula totais no backend e usa companyId do contexto (11.8917ms)
✔ BK-MF1-06: emissão definitiva exige venda aprovada (2.146ms)
✔ BK-MF1-02: emissão definitiva reserva número por upsert atómico (43.4853ms)
✔ BK-MF1-02: emissão concorrente não reserva número sem claim do documento (2.7143ms)
✔ BK-MF1-03: recebimento não pode exceder montante em aberto (2.3383ms)
✔ BK-MF1-03: recebimento rejeita saldo alterado em concorrência (2.2203ms)
✔ BK-MF1-04: lançamento de venda fica balanceado (12.8707ms)
✔ BK-MF1-05: títulos em aberto calculam antiguidade e ignoram liquidados (22.3714ms)
✔ BK-MF1-07/BK-MF1-10: compra nasce em rascunho com totais backend (9.6334ms)
✔ BK-MF1-08: pagamento rejeita compra ainda em rascunho (2.6521ms)
✔ BK-MF1-08: pagamento rejeita saldo alterado em concorrência (7.1149ms)
✔ BK-MF1-08: pagamento total não altera estado contabilístico da compra (2.3643ms)
✔ BK-MF1-09: lançamento de compra fica balanceado (3.7447ms)
✔ BK-MF1-10: compra paga pode ser lançada e termina em POSTED (2.3061ms)
✔ BK-MF1-10: aprovação de compra só aceita rascunho (4.8853ms)
✔ BK-MF2-01: reprovação exige justificação mínima (15.3831ms)
✔ BK-MF2-02: transferência para o mesmo armazém é inválida (1.5829ms)
✔ BK-MF2-03: entrada valorizada exige custo unitário positivo (1.0696ms)
✔ BK-MF2-03: FIFO consome múltiplas camadas e regista consumos (7.5549ms)
✔ BK-MF2-05: mínimo maior que máximo é inválido (0.8932ms)
✔ BK-MF2-07: balancete agrega linhas contabilísticas por empresa e período (2.1344ms)
✔ BK-MF2-06: lançamento manual tem de estar equilibrado (1.1353ms)
✔ BK-MF2-06: anexo de lançamento manual rejeita MIME fora do contrato (0.8477ms)
✔ BK-MF2-06: anexo de lançamento manual exige conteúdo real (1.5285ms)
✔ BK-MF2-06: anexo rejeita conteúdo que não corresponde ao MIME declarado (7.4271ms)
✔ BK-MF2-06: anexo de lançamento manual é guardado em storage privado (276.3467ms)
✔ BK-MF2-06: anexo PNG válido é aceite por assinatura real (2.5158ms)
✔ BK-MF2-07: filtros rejeitam período invertido (1.0393ms)
✔ BK-MF2-04: linhas de contagem não aceitam artigo duplicado (1.135ms)
✔ BK-MF2-04: publicação de contagem regista AuditLog com detalhes (4.2907ms)
✔ BK-MF2-08: balanço separa classe 2 por sinal e devolve checkCents (1.1338ms)

Passo 6