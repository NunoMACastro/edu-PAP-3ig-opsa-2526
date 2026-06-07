### Passo 1

* BK: BK-MF1-02
* Macrofase: MF1
* Requisito funcional: RF14
* Dependencias: BK-MF0-03, BK-MF0-08, BK-MF0-09, BK-MF0-11, BK-MF1-01
* Proximo BK: BK-MF1-03
* Endpoint previsto: `/api/sales/documents`

### Passo 2

Objetivo do BK:
- implementar o dominio de documentos de venda;
- permitir criar, listar e emitir documentos de venda;
- garantir calculo de totais no backend;
- garantir numeracao definitiva apenas na emissao;
- expor uma pagina frontend propria para o fluxo de documentos de venda.

Tipos documentais suportados:
- `INVOICE`;
- `INVOICE_RECEIPT`;
- `CREDIT_NOTE`.

### Passo 3

Ficheiros de backend relevantes:
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/sales/saleDocumentService.js`
- `apps/api/src/modules/sales/saleDocumentRoutes.js`
- `apps/api/src/server.js`
- `apps/api/tests/unit/mf1-services.test.js`
- `apps/api/tests/contracts/mf1-contracts.test.js`

Ficheiros de frontend relevantes:
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/salesApi.ts`
- `apps/web/src/pages/SaleDocumentsPage.tsx`
- `apps/web/src/pages/mf1Pages.tsx`
- `apps/web/src/App.tsx`
- `apps/web/scripts/check-mf1-pages.mjs`
- `apps/web/package.json`

### Passo 4

Implementacao realizada:
- documentos de venda associados sempre a empresa ativa;
- `companyId` obtido a partir do contexto autenticado, nunca recebido pelo body;
- criacao de documentos em estado inicial `DRAFT`;
- persistencia das linhas documentais;
- calculo backend de `subtotalCents`, `vatCents` e `totalCents`;
- armazenamento de valores monetarios em centimos;
- emissao definitiva com atribuicao de numero documental;
- sequencia por empresa, ano e tipo documental atraves de `NumberSequence`;
- integracao frontend atraves de `salesApi.ts`;
- pagina dedicada `SaleDocumentsPage.tsx`, sem formulario JSON generico.

### Passo 5

Decisoes registadas:
- os totais fiscais e contabilisticos nao sao calculados no frontend;
- a numeracao definitiva acontece apenas na emissao;
- a emissao de documento fora do estado permitido devolve erro controlado;
- a aprovacao documental pertence ao BK-MF1-06;
- a contabilizacao automatica pertence ao BK-MF1-04;
- SAF-T fica fora do ambito deste BK.

### Passo 6

Cenarios positivos cobertos:
- `POST /api/sales/documents` cria documento de venda;
- `GET /api/sales/documents` lista documentos de venda;
- `POST /api/sales/documents/:id/issue` emite documento em estado permitido;
- documento criado fica associado a empresa ativa;
- totais sao calculados no backend;
- numero documental e atribuido na emissao.

Cenarios negativos previstos/validados:
- pedido sem sessao devolve `401`;
- pedido sem empresa ativa devolve erro definido pela MF0;
- documento sem linhas devolve `400`;
- tipo documental invalido devolve `400`;
- cliente inexistente ou fora da empresa ativa devolve erro controlado;
- artigo inexistente ou fora da empresa ativa devolve erro controlado;
- taxa de IVA inexistente ou fora da empresa ativa devolve erro controlado;
- documento inexistente devolve `404`;
- documento fora do estado permitido devolve `409`;
- emissao fora de periodo fiscal aberto e bloqueada.

### Passo 7

Validacoes executadas nesta correcao de MF1:

```bash
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
npm --prefix apps/web run test:mf1
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
git diff --check
```

Resultados:
- `apps/web` typecheck: passou;
- `apps/web` build: passou;
- `apps/web` test:mf1: passou com `MF1 frontend pages contract OK`;
- `apps/api` test:unit: passou, 25/25 testes;
- `apps/api` test:contracts: passou, 11/11 testes;
- `git diff --check`: passou.

Nota: a evidence regista apenas scripts existentes e efetivamente executados.

### Passo 8

Validacao por BK:

Smoke:
- endpoint `POST /api/sales/documents` implementado;
- endpoint `GET /api/sales/documents` implementado;
- endpoint `POST /api/sales/documents/:id/issue` implementado;
- pagina `SaleDocumentsPage.tsx` ligada a navegacao MF1;
- cliente frontend dedicado em `salesApi.ts`;
- formularios MF1 sem campo generico de linhas JSON.

Negativos:
- documento sem linhas validas devolve `400`;
- tipo documental invalido devolve `400`;
- cliente de outra empresa devolve erro controlado;
- artigo de outra empresa devolve erro controlado;
- taxa de IVA de outra empresa devolve erro controlado;
- documento inexistente devolve `404`;
- documento fora do estado permitido devolve `409`;
- emissao fora de periodo fiscal aberto e bloqueada.

Bloqueios e limites do BK:
- `NumberSequence` e emissao executam dentro de transacao;
- dinheiro armazenado em centimos;
- `companyId` vem sempre da sessao autenticada;
- aprovacao documental pertence ao BK-MF1-06;
- contabilizacao automatica pertence ao BK-MF1-04;
- SAF-T fica fora do ambito deste BK.

### Passo 9

Evidencia obrigatoria - BK-MF1-02

#### PR

PR: ainda nao criado.

#### Proof

Foi implementado o dominio de documentos de venda para suportar faturas, faturas-recibo e notas de credito.
Foi criada persistencia para documentos, linhas documentais, sequencias numericas e auditoria.
Foi implementado calculo backend de subtotal, IVA e total.
Foi implementada emissao definitiva com numeracao sequencial por empresa, ano e tipo documental.
Foi criada integracao frontend atraves de `salesApi.ts` e `SaleDocumentsPage.tsx`.

#### Neg

Cenarios negativos previstos/validados:
- pedido sem sessao devolve `401`;
- pedido sem empresa ativa devolve erro definido pela MF0;
- documento sem linhas devolve `400`;
- tipo documental invalido devolve `400`;
- cliente de outra empresa devolve erro controlado;
- artigo de outra empresa devolve erro controlado;
- taxa de IVA de outra empresa devolve erro controlado;
- documento inexistente devolve `404`;
- documento fora do estado permitido devolve `409`.

#### Files

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/sales/saleDocumentService.js`
- `apps/api/src/modules/sales/saleDocumentRoutes.js`
- `apps/api/src/server.js`
- `apps/api/tests/unit/mf1-services.test.js`
- `apps/api/tests/contracts/mf1-contracts.test.js`
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/salesApi.ts`
- `apps/web/src/pages/SaleDocumentsPage.tsx`
- `apps/web/src/pages/mf1Pages.tsx`
- `apps/web/src/App.tsx`
- `apps/web/scripts/check-mf1-pages.mjs`
- `docs/evidence/MF1/BK-MF1-02.md`

#### Commands

```bash
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
npm --prefix apps/web run test:mf1
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
git diff --check
```
