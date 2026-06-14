Passo 1
* BK: BK-MF3-06
* Macrofase: MF3
* Requisito funcional: RF36
* Dependência: BK-MF0-06, BK-MF0-09, BK-MF0-10, BK-MF1-02, BK-MF1-04, BK-MF1-07, BK-MF1-09, BK-MF2-06
* Sprint: S07-S08
* Próximo BK: BK-MF3-07
* Endpoint previsto: GET /api/compliance/saft

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Modelo criado:
- SaftExportRun

Regras preparadas:
- SaftExportRun guarda companyId, período, fileName, status, exportedById, exportedAt e warnings;
- o modelo permite rastrear quem exportou o SAF-T;
- warnings permite guardar avisos sem bloquear exportações válidas;
- a exportação fica auditável para compliance.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate

> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 3.96s

Passo 3
Ficheiros criados:
- apps/api/src/modules/compliance/saftValidators.js
Temporario 
- D:\PAP\edu-PAP-3ig-opsa-2526\test-saft-validator.js

Regras implementadas:
- from é validado como data obrigatória;
- to é validado como data obrigatória;
- from não pode ser posterior a to;
- erro específico INVALID_SAFT_RANGE para datas inválidas;
- validator devolve apenas fromDate e toDate;
- perfil fiscal fica para validação no service;
- companyId não vem da query.

Smoke previsto/validado:
- from=2026-01-01&to=2026-01-31 devolve fromDate e toDate válidos.

Negativos previstos/validados:
- from=abc devolve 400 INVALID_SAFT_RANGE;
- to=abc devolve 400 INVALID_SAFT_RANGE;
- from=2026-02-01&to=2026-01-01 devolve 400 INVALID_SAFT_RANGE.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-saft-validator.js
{
  status: 400,
  code: 'INVALID_SAFT_RANGE',
  message: 'from deve ser uma data válida'
}
 
- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-saft-validator.js
{
  status: 400,
  code: 'INVALID_SAFT_RANGE',
  message: 'Data inicial posterior a data final'
}

Passo 4
Ficheiros criados:
- apps/api/src/modules/compliance/saftService.js
Temporario 
- D:\PAP\edu-PAP-3ig-opsa-2526\test-saft-service.js

Regras implementadas:
- buildSaftXml gera XML SAF-T MVP;
- XML inclui bloco AuditFile;
- XML inclui Header com CompanyName, TaxRegistrationNumber e CurrencyCode;
- XML inclui MasterFiles com clientes e fornecedores;
- XML inclui SourceDocuments com vendas e compras;
- XML inclui GeneralLedgerEntries com lançamentos contabilísticos;
- dados são filtrados por companyId;
- período é filtrado por fromDate e toDate;
- caracteres especiais são escapados antes de entrar no XML;
- exportação é bloqueada quando o perfil fiscal da empresa está incompleto;
- execução é registada em SaftExportRun;
- service devolve fileName, xml e counts;
- service não submete dados à Autoridade Tributária.

Smoke previsto/validado:
- empresa com CompanyProfile completo gera XML com AuditFile;
- cliente aparece no bloco Customer;
- fornecedor aparece no bloco Supplier;
- fatura de venda aparece em SalesInvoice;
- compra aparece em PurchaseInvoice;
- lançamento contabilístico aparece em GeneralLedgerEntries;
- SaftExportRun é criado com status GENERATED.

Negativos previstos/validados:
- sem companyId devolve 401 COMPANY_CONTEXT_REQUIRED;
- empresa sem NIF devolve 422 COMPANY_PROFILE_INCOMPLETE;
- empresa sem legalName devolve 422 COMPANY_PROFILE_INCOMPLETE;
- empresa sem currency devolve 422 COMPANY_PROFILE_INCOMPLETE;
- dados de outra empresa não entram no XML.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-saft-service.js
saft-company-1-2026-01-01-2026-01-31.xml
{ customers: 1, suppliers: 1, sales: 1, purchases: 1, entries: 1 }
<?xml version="1.0" encoding="UTF-8"?><AuditFile><Header><CompanyName>Empresa Teste Lda</CompanyName><TaxRegistrationNumber>123456789</TaxRegistrationNumber><CurrencyCode>EUR</CurrencyCode></Header><MasterFiles><Customer><CustomerID>customer-1</CustomerID><CompanyName>Cliente Teste</CompanyName><TaxRegistrationNumber>111222333</TaxRegistrationNumber></Customer><Supplier><SupplierID>supplier-1</SupplierID><CompanyName>Fornecedor Teste</CompanyName><TaxRegistrationNumber>444555666</TaxRegistrationNumber></Supplier></MasterFiles><SourceDocuments><SalesInvoice><InvoiceNo>FT 2026/1</InvoiceNo><InvoiceDate>2026-01-10</InvoiceDate></SalesInvoice><PurchaseInvoice><InvoiceNo>FC 2026/1</InvoiceNo><InvoiceDate>2026-01-12</InvoiceDate></PurchaseInvoice></SourceDocuments><GeneralLedgerEntries><Journal><JournalID>journal-1</JournalID></Journal></GeneralLedgerEntries></AuditFile>
Teste positivo passou: XML SAF-T MVP contém AuditFile.
{
  status: 422,
  code: 'COMPANY_PROFILE_INCOMPLETE',
  message: 'Dados fiscais da empresa incompletos'
}
Teste negativo passou: perfil fiscal incompleto bloqueado.

Validação manual do service:
- empresa com CompanyProfile completo, cliente, fornecedor, venda, compra e lançamento gerou XML com AuditFile;
- perfil fiscal incompleto devolveu 422 COMPANY_PROFILE_INCOMPLETE

Passo 5
Passo 5 - Expor route protegida

Ficheiros criados/editados:
- criado apps/api/src/modules/compliance/saftRoutes.js;
- editado apps/api/src/server.js.

Endpoint criado:
- GET /api/compliance/saft

Regras implementadas:
- route protegida com requireAuth;
- route protegida com requireCompanyContext;
- acesso limitado a CONTABILISTA e AUDITOR;
- query validada com validateSaftExportQuery;
- geração delegada para buildSaftXml;
- companyId vem de req.companyId;
- userId vem de req.user.id;
- companyId não é recebido por query string;
- erros são normalizados com toHttpError;
- endpoint devolve fileName, xml e counts.

Smoke previsto:
- AUDITOR autenticado recebe 200;
- CONTABILISTA autenticado recebe 200;
- resposta contém fileName;
- resposta contém xml;
- resposta contém counts;
- XML contém AuditFile.

Negativos previstos:
- pedido sem sessão devolve 401 SESSION_REQUIRED;
- pedido sem empresa ativa devolve 403 COMPANY_CONTEXT_REQUIRED;
- OPERACIONAL devolve 403 ROLE_FORBIDDEN;
- from=abc devolve 400 INVALID_SAFT_RANGE;
- perfil fiscal incompleto devolve 422 COMPANY_PROFILE_INCOMPLETE;
- dados de outra empresa não entram no XML.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (4.0902ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (5.0982ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (3.8231ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.3306ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.2626ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.1636ms)
✔ MF1: permissões backend separam escrita operacional, aprovação e contabilidade (15.0237ms)
✔ MF1: routers principais montam sem dependências inexistentes (27.357ms)
✔ MF1 HTTP: criar venda sem sessão devolve erro de autenticação (13.4053ms)
✔ MF1 HTTP: operacional não pode aprovar venda (4.4516ms)
✔ MF1 HTTP: pagamento em compra rascunho devolve regra de estado (3.9906ms)

Passo 6
Ficheiros criados:
- apps/web/src/lib/complianceApi.ts

Regras implementadas:
- criado tipo SaftExportResult;
- criada função fetchSaftExport;
- chamada GET para /api/compliance/saft;
- from e to enviados por query string;
- resposta tipada com fileName, xml e counts;
- cliente reutiliza apiClient comum;
- sessão é enviada por cookie HttpOnly;
- frontend não guarda tokens;
- frontend não gera XML localmente.

Smoke previsto/validado:
- chamada com período válido devolve fileName;
- fileName termina em .xml;
- resposta inclui xml;
- resposta inclui counts.

Negativos previstos/validados:
- perfil fiscal incompleto mostra mensagem do backend;
- datas inválidas mostram erro controlado;
- utilizador sem role adequada recebe erro controlado.

Comandos executados:
- npm --prefix apps/web run build

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 40 modules transformed.
computing gzip size...
dist/index.html                   0.40 kB │ gzip:  0.28 kB
dist/assets/index-I1u2FZO0.css    2.81 kB │ gzip:  1.06 kB
dist/assets/index-BwsQr51Q.js   246.39 kB │ gzip: 70.15 kB

✓ built in 7.61s

Passo 7