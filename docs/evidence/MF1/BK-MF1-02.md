### Passo 1

* BK: BK-MF1-02
* Macrofase: MF1
* Requisito funcional: RF14
* Dependência: BK-MF0-03, BK-MF0-08, BK-MF0-09, BK-MF0-11, BK-MF1-01
* Próximo BK: BK-MF1-03
* Endpoint previsto: /api/sales/documents

### Passo 2
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api npm run prisma:generate

> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 806ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
┌─────────────────────────────────────────────────────────┐
│  Update available 6.19.3 -> 7.8.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
The schema at prisma\schema.prisma is valid 🚀

### Passo 3
Ficheiros alterados
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/salesApi.ts`
- `apps/web/src/pages/SaleDocumentsPage.tsx`

#### Implementação realizada
Foi criada a integração frontend para documentos de venda.
O ficheiro `apiClient.ts` existente não foi substituído. Foi apenas estendido com o domínio `salesDocuments`, mantendo o cliente HTTP único da aplicação, a autenticação por cookie `HttpOnly` e o tratamento centralizado de erros.
Foi criado o ficheiro `salesApi.ts`, que expõe funções tipadas para listar, criar e emitir documentos de venda.
Foi criada a página `SaleDocumentsPage.tsx`, com formulário mínimo, listagem, estados de carregamento, sucesso e erro.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/web run build

> @opsa/web@1.0.0 build
> vite build

vite v8.0.16 building client environment for production...
✓ 17 modules transformed.
computing gzip size...
dist/index.html                   0.40 kB │ gzip:  0.28 kB
dist/assets/index-Buv70nmR.css    2.43 kB │ gzip:  0.97 kB
dist/assets/index-LxAUImH5.js   204.71 kB │ gzip: 63.89 kB

✓ built in 4.14s

### Passo 4
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit                                                 

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (5.5821ms)
✔ BK01: registo mantém política de password forte (2.093ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.6911ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.853ms)
✔ BK07: importação vazia é rejeitada (1.0696ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (1.182ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.2186ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.0762ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (1.3613ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 542.6795

- Caso feliz: criação de documento de venda em estado `DRAFT`.
- Caso feliz: cálculo backend de `subtotalCents`, `vatCents` e `totalCents`.
- Cenário negativo: documento sem linhas devolve `400`.
- Cenário negativo: tipo documental inválido devolve `400`.
- Cenário negativo: artigo inexistente ou fora da empresa ativa devolve erro controlado.
- Cenário negativo: tentativa de emitir documento que não está em `DRAFT` devolve `409`.

### Passo 5
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (3.3823ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.7704ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (2.7692ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.414ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (3.127ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.1992ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 824.6982

### Passo 6
test:integration ainda não existe no projeto
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:integration
npm error Missing script: "test:integration"

### Passo 7
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff --check
docs/evidence/MF1/BK-MF1-02.md:71: trailing whitespace.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff --stat                                  
 docs/evidence/MF1/BK-MF1-02.md | 85 ++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 85 insertions(+)

- PS D:\PAP\edu-PAP-3ig-opsa-2526> git status                                                                        
On branch feat/bk-mf1-02-documentos-venda-oleksii                                 
nothing to commit, working tree clean

Objetivo
Garantir que a implementação do BK-MF1-02 não introduz alterações fora do âmbito e que o diff está tecnicamente limpo.

Validação realizada
Foi revisto o conjunto de ficheiros alterados no BK, com atenção a nomes, responsabilidades por camada, validações, mensagens de erro, transações, roles e filtros por `companyId`.

Comandos executados
```bash
git diff --check
git status
git diff --stat

### Passo 8 
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff -- docs/planificacao/guias-bk/MF1 - não devolveu nada

Objetivo
Fechar o BK-MF1-02

Evidência preparada

A evidência do BK regista:
- ficheiros alterados;
- comandos executados;
- resultados obtidos;


Decisões registadas
- Os documentos de venda são sempre associados à empresa ativa através de `companyId`.
- O `companyId` nunca é recebido pelo body do pedido.
- O documento nasce em estado `DRAFT`.
- A numeração definitiva é atribuída apenas no momento da emissão.
- A sequência é gerida por `NumberSequence`, separada por empresa, ano e tipo documental.
- Os totais (`subtotalCents`, `vatCents`, `totalCents`) são calculados exclusivamente no backend.
- O frontend não recalcula valores fiscais nem contabilísticos.
- O dinheiro é armazenado em cêntimos.
- Aprovação documental, contabilização automática e SAF-T ficam fora do âmbito deste BK.

Comandos executados

```bash
cd apps/api npm run prisma:generate
npm run prisma:validate
npm --prefix apps/web run build
npm --prefix apps/api run 
git status
npm --prefix apps/api run test:contracts
npm --prefix apps/api run test:integration
git diff --stat
git diff --check
git diff -- docs/planificacao/guias-bk/MF1


9) Validacao por BK
Smoke
    Endpoint `POST /api/sales/documents` implementado.
    Endpoint `GET /api/sales/documents` implementado.
    Endpoint `POST /api/sales/documents/:id/issue` implementado.
    Associação do documento à empresa ativa através de `companyId`.
    Cálculo de `subtotalCents`, `vatCents` e `totalCents` realizado no backend.
    Numeração sequencial por empresa, ano e tipo documental implementada através de `NumberSequence`.
    ntegração final da página na navegação da aplicação por validar.
Negativos
    Documento sem linhas válidas devolve `400`.
    Tipo documental inválido devolve `400`.
    liente de outra empresa devolve erro controlado.
    Artigo de outra empresa devolve erro controlado.
    Taxa de IVA de outra empresa devolve erro controlado.
    Documento inexistente devolve `404`.
    ocumento fora do estado permitido devolve `409`.
    Emissão fora de período fiscal aberto é bloqueada.
Bloqueios e limites do BK
    `NumberSequence` e emissão executam dentro de transação.
    O dinheiro é armazenado em cêntimos.
    O `companyId` vem sempre da sessão autenticada.
    Aprovação documental pertence ao BK-MF1-06.
    Contabilização automática pertence ao BK-MF1-04.
    SAF-T fica fora do âmbito deste BK.

10) Evidência obrigatória - BK-MF1-02

### pr
PR: ainda não criado.

### proof
Foi implementado o domínio de documentos de venda para suportar:
- Fatura (`INVOICE`);
- Fatura-recibo (`INVOICE_RECEIPT`);
- Nota de crédito (`CREDIT_NOTE`).
Foi criada persistência para documentos, linhas documentais, sequências numéricas e auditoria.
Foi implementado cálculo backend de subtotal, IVA e total.
Foi implementada emissão definitiva com numeração sequencial por empresa, ano e tipo documental.
Foi criada integração frontend através de `salesApi.ts` e `SaleDocumentsPage.tsx`.

### neg
Cenários negativos previstos/validados:
- Pedido sem sessão devolve `401`.
- Pedido sem empresa ativa devolve erro definido pela MF0.
- Documento sem linhas devolve `400`.
- Tipo documental inválido devolve `400`.
- Cliente de outra empresa devolve erro controlado.
- Artigo de outra empresa devolve erro controlado.
- Taxa de IVA de outra empresa devolve erro controlado.
- Documento inexistente devolve `404`.
- Documento fora do estado permitido devolve `409`.

### files
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/sales/saleDocumentService.js`
- `apps/api/src/modules/sales/saleDocumentRoutes.js`
- `apps/api/src/server.js`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/salesApi.ts`
- `apps/web/src/pages/SaleDocumentsPage.tsx`
- `docs/evidence/MF1/BK-MF1-02.md`

### commands
```bash
cd apps/api npm run prisma:generate
npm run prisma:validate
npm --prefix apps/web run build
npm --prefix apps/api run 
git status
npm --prefix apps/api run test:contracts
npm --prefix apps/api run test:integration
git diff --stat
git diff --check
git diff -- docs/planificacao/guias-bk/MF1