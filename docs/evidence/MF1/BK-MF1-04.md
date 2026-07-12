### Passo 1

* BK: BK-MF1-04
* Macrofase: MF1
* Requisito funcional: RF16
* Dependência: BK-MF0-03, BK-MF0-08, BK-MF1-02
* Próximo BK: BK-MF1-05
* Endpoint previsto: /api/accounting/sale-postings/:saleDocumentId

### Passo 2
Foi necessário garantir que os modelos provenientes do BK-MF1-02 (`SaleDocument`, `SaleDocumentLine`, `NumberSequence` e `AuditLog`) estavam presentes na branch, porque o BK-MF1-04 depende diretamente de documentos de venda emitidos. A relação `Receipt` foi mantida fora do schema enquanto o BK-MF1-03 ainda não estiver integrado.
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
    Disponibilizar a operação de contabilização automática de vendas ao utilizador através da camada frontend, mantendo chamadas tipadas e mensagens de erro controladas.

Ficheiros alterados
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/accountingApi.ts`
- `apps/web/src/pages/SalePostingsPage.tsx`

Implementação realizada
    Foi criada a integração frontend para contabilização automática de vendas.
    O ficheiro `apiClient.ts` existente não foi substituído. Foi apenas estendido com o domínio `salePostings`, mantendo o cliente HTTP único da aplicação, a autenticação por cookie `HttpOnly` e o tratamento centralizado de erros.
    Foi criado o ficheiro `accountingApi.ts`, que expõe função tipada para contabilizar documentos de venda emitidos.
    Foi criada a página `SalePostingsPage.tsx`, com formulário mínimo, estado de carregamento, sucesso e erro.

Comandos a executar
```bash
npm --prefix apps/api run test:unit
npm --prefix apps/web run typecheck
npm --prefix apps/web run build

### Passo 4
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (15.3063ms)
✔ BK01: registo mantém política de password forte (9.644ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (2.7904ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (1.3482ms)
✔ BK07: importação vazia é rejeitada (1.1853ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (6.8659ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (2.0957ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.5844ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (3.4097ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2058.5653

### Passo 5
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (4.9347ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.7374ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (7.2141ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (2.0632ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (4.1593ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.7164ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1669.8463

### Passo 7
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff --check não devolveu nada
- PS D:\PAP\edu-PAP-3ig-opsa-2526>  git diff -- docs/planificacao/guias-bk/MF1 também não devolveu nada

### Passo 8

Objetivo
Fechar o BK-MF1-04

Evidência preparada
A evidência do BK regista:
- ficheiros alterados;
- comandos executados;
- resultados obtidos;

Decisões registadas
- Apenas documentos de venda emitidos (`ISSUED` ou `SETTLED`) podem ser contabilizados.
- O lançamento contabilístico é criado com origem `SALE` e `sourceId` igual ao documento de venda.
- A idempotência é garantida por `companyId`, `source` e `sourceId`.
- Faturas e faturas-recibo debitam clientes (`211`) e creditam proveitos (`72`) e IVA liquidado (`2433`).
- Notas de crédito invertem o efeito contabilístico.
- O lançamento é validado como equilibrado antes de ser gravado.
- O `companyId` vem sempre do contexto autenticado.
- O período fiscal aberto é validado antes de criar o lançamento.
- Mapas de IVA ficam fora do âmbito deste BK.

Comandos executados
```bash
git diff -- docs/planificacao/guias-bk/MF1
git diff --check
npm --prefix apps/api run prisma:generate
npm --prefix apps/api run prisma:validate
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/web run build

9) Validação Final BK-MF1-04

Smoke
    Endpoint `POST /api/accounting/sale-postings/:saleDocumentId` implementado.
    Contabilização de documentos de venda emitidos suportada.
    Criação automática de `JournalEntry`.
    Criação automática de `JournalEntryLine`.
    Diário contabilístico equilibrado entre débito e crédito.
    Associação do lançamento ao documento através de `source` e `sourceId`.
    Idempotência implementada através de restrição única por empresa, origem e documento.
    Integração final da página na navegação da aplicação por validar.

Negativos
    Documento não emitido devolve erro controlado (`DOCUMENT_NOT_ISSUED`).
    Documento inexistente ou de outra empresa devolve `404`.
    Período fiscal fechado bloqueia a contabilização.
    Conta SNC obrigatória inexistente devolve `ACCOUNT_NOT_FOUND`.
    Segunda tentativa de contabilização devolve `SALE_ALREADY_POSTED`.
    Tentativa de duplicação não cria novo proveito nem novo IVA liquidado.

Bloqueios e limites do BK
    Utilização de `JournalEntry` e `JournalEntryLine`.
    Utilização obrigatória de `source` e `sourceId`.
    Coordenação dos modelos contabilísticos com BK-MF1-09.
    Lançamentos manuais ficam fora do âmbito deste BK e pertencem ao BK-MF2-06.
    Mapas de IVA ficam fora do âmbito deste BK.

10) Evidência obrigatória - BK-MF1-04

### pr
PR: ainda não criado.

### proof
Foi implementado o domínio de contabilização automática de vendas.
Foram criados os modelos `JournalEntry` e `JournalEntryLine` para representar lançamentos contabilísticos gerados automaticamente a partir de documentos de venda emitidos.

A contabilização valida:
* documento pertencente à empresa ativa;
* documento emitido (`ISSUED` ou `SETTLED`);
* período fiscal aberto;
* existência das contas SNC obrigatórias.

Foi implementada criação automática de lançamentos equilibrados entre débito e crédito.
Foi implementada idempotência para impedir contabilização duplicada da mesma venda.
Foi criada integração frontend através de:
* `accountingApi.ts`
* `SalePostingsPage.tsx`

### neg
Cenários negativos previstos/validados:
* Pedido sem sessão devolve `401`.
* Pedido sem empresa ativa devolve erro definido pela MF0.
* Documento inexistente devolve `404`.
* Documento de outra empresa devolve `404` ou `403`.
* Documento não emitido devolve `409`.
* Período fiscal fechado bloqueia a contabilização.
* Conta SNC obrigatória inexistente devolve `409`.
* Segunda tentativa de contabilização devolve `SALE_ALREADY_POSTED`.
* Não é possível duplicar proveitos nem IVA através de múltiplas chamadas ao endpoint.

### files
* `apps/api/prisma/schema.prisma`
* `apps/api/src/modules/accounting/salePostingService.js`
* `apps/api/src/modules/accounting/salePostingRoutes.js`
* `apps/api/src/server.js`
* `apps/web/src/lib/accountingApi.ts`
* `apps/web/src/pages/SalePostingsPage.tsx`
* `apps/api/src/modules/accounting/salePostingService.test.js
* `docs/evidence/MF1/BK-MF1-04.md`
* `apps/web/src/lib/apiClient.ts` - alterado com salePostings

### commands
```bash
git diff -- docs/planificacao/guias-bk/MF1
git diff --check
npm --prefix apps/api run prisma:generate
npm --prefix apps/api run prisma:validate
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/web run build
```

### screenshots
Sem screenshots incluídos nesta revisão.

### notes
* O `companyId` é obtido exclusivamente da sessão autenticada.
* O frontend não calcula movimentos contabilísticos.
* Débitos e créditos são determinados apenas pelo backend.
* O lançamento contabilístico é associado ao documento através de `source` e `sourceId`.
* A contabilização apenas é permitida para documentos emitidos.
* O período fiscal deve estar aberto.
* A idempotência impede lançamentos duplicados.
* Os modelos `JournalEntry` e `JournalEntryLine` foram preparados para reutilização no BK-MF1-09.
* Lançamentos manuais permanecem fora do âmbito deste BK e serão tratados em BK-MF2-06.
* Mapas de IVA permanecem fora do âmbito deste BK.

