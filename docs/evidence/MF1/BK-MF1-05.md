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
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (8.7457ms)
✔ BK01: registo mantém política de password forte (2.0468ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.8832ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.9894ms)
✔ BK07: importação vazia é rejeitada (1.5416ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (1.0038ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.0605ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.3716ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (1.424ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 708.3466

### Passo 5
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (3.8741ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.1182ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (5.3004ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.4662ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (2.8324ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.0476ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 809.9895

### Passo 6
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff -- docs/planificacao/guias-bk/MF1 - não devolveu nada
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff -- check - não devolveu nada

