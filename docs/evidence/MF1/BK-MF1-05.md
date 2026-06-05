### Passo 1

* BK: BK-MF1-05
* Macrofase: MF1
* Requisito funcional: RF17
* Dependência: BK-MF0-03, BK-MF1-02, BK-MF1-03
* Próximo BK: BK-MF1-06
* Endpoint previsto: /api/sales/open-items

### Passo 2
Foi necessário adaptar o schema ao estado real da branch. O BK-MF1-05 reutiliza `SaleDocument` para consultar títulos em aberto, mas `Receipt` e `NumberSequence` não são necessários para esta consulta quando os respetivos BKs ainda não estão presentes na branch. Foi mantido o contrato funcional através de `amountPaidCents`.

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

### Passso 3
Objetivo
Disponibilizar a consulta de títulos em aberto ao utilizador através da camada frontend, mantendo chamadas tipadas e mensagens de erro controladas.

Ficheiros alterados
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/salesOpenItemsApi.ts`
- `apps/web/src/pages/SalesOpenItemsPage.tsx`

Implementação realizada
- Foi criada a integração frontend para consulta de títulos em aberto e antiguidade de saldos.
O ficheiro `apiClient.ts` existente não foi substituído. Foi apenas estendido com o domínio `salesOpenItems`, mantendo o cliente HTTP único da aplicação, a autenticação por cookie `HttpOnly` e o tratamento centralizado de erros.
- Foi criado o ficheiro `salesOpenItemsApi.ts`, que expõe uma função tipada para consultar títulos em aberto com filtro por data de referência.
- Foi criada a página `SalesOpenItemsPage.tsx`, com filtro por data, estados de carregamento, erro, empty state e tabela de resultados.

Nota de integração
A UI não calcula saldos, dias de atraso nem buckets de antiguidade. O frontend envia apenas a data de referência e o backend devolve `openAmountCents`, `daysOverdue` e `bucket`.

Comandos a executar
bash
npm --prefix apps/api run test:unit
npm --prefix apps/web run typecheck
npm --prefix apps/web run build

### Passo 4