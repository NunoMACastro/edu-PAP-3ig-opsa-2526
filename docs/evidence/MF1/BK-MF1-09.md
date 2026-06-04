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
