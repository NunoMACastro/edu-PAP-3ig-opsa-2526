### Passo 1

* BK: BK-MF1-07
* Macrofase: MF1
* Requisito funcional: RF19
* Dependência: BK-MF0-03, BK-MF0-08, BK-MF0-10, BK-MF0-11, BK-MF1-01
* Sprint: S03-S04
* Próximo BK: BK-MF1-08
* Endpoint previsto: /api/purchases/documents

### Passo 2
Como aida não tinha BK03-BK06 feitos tive que apagar
"saleDocumentLines SaleDocumentLine[]" do VatRate
"saleDocumentLines SaleDocumentLine[]" do Item

e do Company
"numberSequences   NumberSequence[]
saleDocuments     SaleDocument[]
receipts          Receipt[]
journalEntries    JournalEntry[]
auditLogs         AuditLog[]"
do schema.prisma e depois os comandos funcionaram.
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate
> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 643ms

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

Depopis de testar eu voltei tudo pasa schema.prisma para não criar conflitos.

### Passo 3
Objetivo
Disponibilizar a operação de documentos de compra ao utilizador através da camada frontend, mantendo chamadas tipadas e mensagens de erro controladas.

Ficheiros alterados
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/purchasesApi.ts`
- `apps/web/src/pages/PurchaseDocumentsPage.tsx`

Implementação realizada
Foi criada a integração frontend para documentos de compra.
O ficheiro `apiClient.ts` existente não foi substituído. Foi apenas estendido com o domínio `purchaseDocuments`, mantendo o cliente HTTP único da aplicação, a autenticação por cookie `HttpOnly` e o tratamento centralizado de erros.
Foi criado o ficheiro `purchasesApi.ts`, que expõe funções tipadas para criar e listar documentos de compra.
Foi criada a página `PurchaseDocumentsPage.tsx`, com formulário mínimo, estados de carregamento, sucesso e erro.

Nota de integração
A UI não calcula os totais do documento. O frontend envia fornecedor, número externo, artigo, taxa de IVA, quantidade e custo unitário; o backend calcula `subtotalCents`, `vatCents` e `totalCents`, conforme o contrato do BK-MF1-07.

Comandos a executar
```bash
npm --prefix apps/api run test:unit
npm --prefix apps/web run typecheck
npm --prefix apps/web run build

### Passo 4
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (7.2379ms)
✔ BK01: registo mantém política de password forte (1.7612ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.7924ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.8261ms)
✔ BK07: importação vazia é rejeitada (1.2772ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (0.9862ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.0259ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (0.9066ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (0.8128ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2283.1

### Passo 5
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (3.882ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.0849ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (2.6734ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.4556ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.0416ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.2012ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2467.0455

### Passo 7
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff --check
apps/web/src/lib/apiClient.ts:256: trailing whitespace.
+
docs/evidence/MF1/BK-MF1-07.md:91: trailing whitespace.
+### Passo 5
docs/evidence/MF1/BK-MF1-07.md:112: trailing whitespace.
+### Pass0 7

- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff -- docs/planificacao/guias-bk/MF1 não devolveu nada

### 8
Objetivo
Fechar o BK-MF1-07

Evidência preparada
A evidência do BK regista:
- ficheiros alterados;
- comandos executados;
- resultados obtidos

Decisões registadas
- Os documentos de compra são sempre associados à empresa ativa através de `companyId`.
- O `companyId` nunca é recebido pelo body do pedido.
- O documento de compra nasce em estado `DRAFT`, alinhado com o workflow formal do BK-MF1-10.
- O número do fornecedor é único por empresa, fornecedor e número externo.
- Os totais (`subtotalCents`, `vatCents`, `totalCents`) são calculados exclusivamente no backend.
- As notas de crédito de fornecedor são guardadas com valores positivos.
- O frontend não recalcula valores fiscais nem contabilísticos.
- O dinheiro é armazenado em cêntimos.
- Pagamentos ficam fora do âmbito deste BK.
- Contabilização fica fora do âmbito deste BK.
- O workflow formal de aprovação de compras fica para o BK-MF1-10.

Comandos executados
```bash
git diff -- docs/planificacao/guias-bk/MF1
git status
git diff --stat
git diff --check
npm --prefix apps/api run prisma:validate
npm --prefix apps/api run prisma:generate

9) Validação Final BK-MF1-07

Smoke
    Endpoint `POST /api/purchases/documents` implementado.
    Registo de fatura de fornecedor suportado.
    Registo de nota de crédito de fornecedor suportado.
    Notas de crédito guardadas com valores positivos e tipo documental próprio.
    Cálculo backend de `subtotalCents`, `vatCents` e `totalCents`.
    Associação do documento à empresa ativa através de `companyId`.
    Unicidade de `supplierNumber` por fornecedor e empresa implementada.
    Integração final da página na navegação da aplicação por validar.

Negativos
    Fornecedor de outra empresa devolve erro controlado (`404` ou `403`).
    Artigo de outra empresa devolve erro controlado.
    Taxa de IVA de outra empresa devolve erro controlado.
    Documento sem linhas válidas devolve `400`.
    Número de fornecedor duplicado devolve `409`.
    Data fora de período fiscal aberto é bloqueada.

Bloqueios e limites do BK
    O estado inicial é `DRAFT` para respeitar o workflow formal `DRAFT -> APPROVED -> POSTED`.
    Todas as compras são filtradas por `companyId`.
    O `companyId` é obtido exclusivamente da sessão autenticada.
    Pagamentos pertencem ao BK-MF1-08.
    Contabilização pertence ao BK-MF1-09.
    Workflow formal de aprovação pertence ao BK-MF1-10.

10) Evidência obrigatória - BK-MF1-07

### pr
PR: ainda não criado.

### proof
Foi implementado o domínio de documentos de compra para suportar:
- Fatura de fornecedor (`SUPPLIER_INVOICE`);
- Nota de crédito de fornecedor (`SUPPLIER_CREDIT_NOTE`).
Foi criada persistência para documentos e linhas de compra.
Foi implementada validação de fornecedor, artigo e taxa de IVA da empresa ativa.
Foi implementado cálculo backend de subtotal, IVA e total.
Foi implementada unicidade de `supplierNumber` por fornecedor e empresa.
Foi criada integração frontend através de `purchasesApi.ts` e `PurchaseDocumentsPage.tsx`.

### neg
Cenários negativos previstos/validados:
- Pedido sem sessão devolve `401`.
- Pedido sem empresa ativa devolve erro definido pela MF0.
- Documento sem linhas válidas devolve `400`.
- Tipo documental inválido devolve `400`.
- Fornecedor inexistente ou de outra empresa devolve `SUPPLIER_NOT_FOUND`.
- Artigo de outra empresa devolve erro controlado.
- Taxa de IVA de outra empresa devolve erro controlado.
- Número de fornecedor duplicado devolve `409`.
- Data fora de período fiscal aberto é bloqueada.

### files
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/purchases/purchaseDocumentService.js`
- `apps/api/src/modules/purchases/purchaseDocumentRoutes.js`
- `apps/api/src/server.js`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/purchasesApi.ts`
- `apps/web/src/pages/PurchaseDocumentsPage.tsx`
- `docs/evidence/MF1/BK-MF1-07.md`

### commands
```bash
git diff -- docs/planificacao/guias-bk/MF1
git status
git diff --stat
git diff --check
npm --prefix apps/api run prisma:validate
npm --prefix apps/api run prisma:generate
npm --prefix apps/api run test:contracts
npm --prefix apps/api run test:unit
```

### Correcao de evidence - 2026-06-07

Esta evidence foi atualizada para remover o drift antigo que descrevia compras a nascerem em `APPROVED`.
O contrato correto da MF1, depois do BK-MF1-10, e que novas compras nascem em `DRAFT` e so seguem para `APPROVED` por aprovacao explicita.
Os caminhos de ficheiros permanecem em `apps/`, porque essa e a arvore canonica usada pelos alunos.
