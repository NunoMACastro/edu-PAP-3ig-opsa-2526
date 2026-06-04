### Passo 1

* BK: BK-MF1-09
* Macrofase: MF1
* Requisito funcional: RF21
* Dependência: BK-MF0-03, BK-MF0-08, BK-MF1-04, BK-MF1-07
* Sprint: S03-S04
* Próximo BK: BK-MF1-10
* Endpoint previsto: /api/accounting/purchase-postings/:purchaseDocumentId

### Passo 2
Foi necessário garantir que os modelos provenientes das outras BK (`PurchaseDocument`, `PurchaseDocumentLine`, `JournalEntry` e `JournalEntryLine`) estavam presentes na branch, porque o ainda não tinha BK03, BK05-06, BK08 feitos. Se tirar eles da prisma, o código passa.
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

### Passo 3
Objetivo
Disponibilizar a operação de contabilização automática de compras ao utilizador através da camada frontend, mantendo chamadas tipadas e mensagens de erro controladas.

Ficheiros alterados
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/accountingApi.ts`
- `apps/api/src/modules/accounting/purchasePostingService.test.js`
- `apps/web/src/pages/PurchasePostingsPage.tsx`

Implementação realizada
- Foi criada a integração frontend para contabilização automática de compras.
- O ficheiro `apiClient.ts` existente não foi substituído. Foi apenas estendido com o domínio `purchasePostings`, mantendo o cliente HTTP único da aplicação, a autenticação por cookie `HttpOnly` e o tratamento centralizado de erros.
- O ficheiro `accountingApi.ts` existente foi reutilizado e estendido com a função `postPurchaseDocument`.
- Foi criada a página `PurchasePostingsPage.tsx`, com formulário mínimo, estado de carregamento, sucesso e erro.

Nota de integração
A UI não calcula débitos, créditos, contas SNC ou totais contabilísticos. O frontend envia apenas o identificador do documento de compra e o backend gera o lançamento contabilístico automático.

Comandos a executar
```bash
npm --prefix apps/api run test:unit
npm --prefix apps/web run typecheck
npm --prefix apps/web run build

### Passo 4
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (12.8347ms)
✔ BK01: registo mantém política de password forte (2.9886ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.8436ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (1.1088ms)
✔ BK07: importação vazia é rejeitada (0.8289ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (2.9515ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.7155ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.7499ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (1.1699ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1185.8423

### Passo 5
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (14.7541ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (7.7964ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (3.5337ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.9577ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (6.4325ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.4639ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2403.3482

### Passo 7
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff --check - não devolveu nada

### Passo 8
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff -- docs/planificacao/guias-bk/MF1 - também não devolveu nada

Objetivo
Fechar o BK-MF1-09

Evidência preparada
A evidência do BK regista:
- ficheiros alterados;
- comandos executados;
- resultados obtidos

Decisões registadas
- Foi reutilizada a estrutura `JournalEntry` e `JournalEntryLine` criada no BK-MF1-04.
- Foi confirmado o uso de `source: "PURCHASE"` para lançamentos de compras.
- O lançamento usa `sourceId` igual ao identificador do documento de compra.
- Faturas de fornecedor debitam gastos (`62`) e IVA dedutível (`2432`) e creditam fornecedores (`221`).
- Notas de crédito de fornecedor invertem o efeito contabilístico.
- O lançamento é validado como equilibrado antes de ser gravado.
- O `companyId` vem sempre do contexto autenticado.
- O período fiscal aberto é validado antes de criar o lançamento.
- A função `postPurchaseDocumentInTransaction` fica preparada para reutilização no BK-MF1-10.
- Mapas de IVA ficam fora do âmbito deste BK.

Comandos executados
```bash
npm --prefix apps/api run prisma:generate
npm --prefix apps/api run prisma:validate 
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
git diff --check
git diff -- docs/planificacao/guias-bk/MF1

9) BK-MF1-09

Smoke
    Endpoint `POST /api/accounting/purchase-postings/:purchaseDocumentId` implementado.
    Contabilização de documentos de compra registados/aprovados suportada.
    Criação automática de `JournalEntry`.
    Criação automática de `JournalEntryLine`.
    Diário contabilístico equilibrado entre gasto, IVA dedutível e fornecedor.
    Associação do lançamento ao documento através de `source` e `sourceId`.
    Nota de crédito de fornecedor inverte corretamente o efeito contabilístico.
    Idempotência implementada através de restrição única por empresa, origem e documento.
    Integração final da página na navegação da aplicação por validar.

Negativos
    Documento de compra inexistente devolve `404`.
    Documento de outra empresa devolve `404` ou `403`.
    Documento em estado inválido devolve erro controlado.
    Período fiscal fechado bloqueia a contabilização.
    Conta SNC obrigatória inexistente devolve `ACCOUNT_NOT_FOUND`.
    Segunda tentativa de contabilização devolve `PURCHASE_ALREADY_POSTED`.
    Tentativa de duplicação não cria novo gasto nem novo IVA dedutível.

Bloqueios e limites do BK
    Reutilização de `JournalEntry` e `JournalEntryLine` do BK-MF1-04.
    Reutilização de `source` e `sourceId`.
    Reutilização da estratégia de idempotência do BK-MF1-04.
    Disponibilização de helper transacional para reutilização no BK-MF1-10.
    Preservação de auditoria contabilística.
    Mapas de IVA ficam fora do âmbito deste BK.
    Mapas de IVA serão tratados em BK-MF3-01.
    Lançamentos manuais continuam fora do âmbito deste BK.

10) Evidência obrigatória - BK-MF1-09
## pr
PR: ainda não criado.

### proof
Foi implementado o domínio de contabilização automática de compras.
Foi reutilizada a infraestrutura contabilística criada no BK-MF1-04 através dos modelos:
- JournalEntry
- JournalEntryLine
Foi implementado o endpoint:
POST /api/accounting/purchase-postings/:purchaseDocumentId

A contabilização valida:
    documento pertencente à empresa ativa;
    documento em estado contabilizável (APPROVED ou PAID);
    período fiscal aberto;
    existência das contas SNC obrigatórias.

Foi implementada geração automática de lançamentos equilibrados para:

- faturas de fornecedor;
- notas de crédito de fornecedor.

Foi implementada idempotência para impedir contabilização duplicada da mesma compra.
Foi criada integração frontend através de:
- accountingApi.ts
- PurchasePostingsPage.tsx

Foi disponibilizado helper transacional para reutilização futura no BK-MF1-10.

### neg

Cenários negativos previstos/validados:
- Pedido sem sessão devolve 401.
- Pedido sem empresa ativa devolve erro definido pela MF0.
- Documento inexistente devolve 404.
- Documento de outra empresa devolve 404 ou 403.
- Documento em estado inválido devolve erro controlado.
- Período fiscal fechado bloqueia a contabilização.
- Conta SNC obrigatória inexistente devolve ACCOUNT_NOT_FOUND.
- Segunda tentativa de contabilização devolve PURCHASE_ALREADY_POSTED.
- Não é possível duplicar gastos nem IVA dedutível através de múltiplas chamadas ao endpoint.

### files
- apps/api/prisma/schema.prisma
- apps/api/src/modules/accounting/purchasePostingService.js
- apps/api/src/modules/accounting/purchasePostingRoutes.js
- apps/api/src/server.js
- apps/web/src/lib/accountingApi.ts
- apps/web/src/pages/PurchasePostingsPage.tsx
- apps/api/src/modules/accounting/purchasePostingService.test.js

### commands
npm --prefix apps/api run prisma:generate
npm --prefix apps/api run prisma:validate 
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
git diff --check
git diff -- docs/planificacao/guias-bk/MF1

### screenshots
Sem screenshots incluídos nesta revisão.

### notes
- O companyId é obtido exclusivamente da sessão autenticada.
- O frontend não calcula movimentos contabilísticos.
- Débitos e créditos são determinados apenas pelo backend.
- O lançamento contabilístico é associado ao documento através de source e sourceId.
- A contabilização apenas é permitida para documentos em estado contabilizável.
- O período fiscal deve estar aberto.
- A idempotência impede lançamentos duplicados.
- Foram utilizadas as contas SNC pedagógicas previstas no guia (221, 62, 2432).
- Foi reutilizada a estrutura contabilística criada no BK-MF1-04.
- Foi criado helper transacional para reutilização no BK-MF1-10.
- A auditoria contabilística foi preservada.
- Mapas de IVA permanecem fora do âmbito deste BK e serão tratados em BK-MF3-01.
- Lançamentos manuais permanecem fora do âmbito deste BK.