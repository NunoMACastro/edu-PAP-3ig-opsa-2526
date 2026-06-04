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