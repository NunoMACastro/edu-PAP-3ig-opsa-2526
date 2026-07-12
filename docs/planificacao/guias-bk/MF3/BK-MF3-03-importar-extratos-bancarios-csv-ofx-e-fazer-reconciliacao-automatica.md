# BK-MF3-03 - Importar extratos bancários CSV/OFX e sugerir reconciliação

## Header

- `doc_id`: `GUIA-BK-MF3-03`
- `bk_id`: `BK-MF3-03`
- `macro`: `MF3`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF3-02, BK-MF1-03, BK-MF1-08`
- `rf_rnf`: `RF33`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-04`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md`
- `last_updated`: `2026-07-10`

## Objetivo

Importar um ficheiro CSV ou OFX real, guardar as linhas dentro da empresa ativa e criar sugestões de reconciliação que exigem confirmação humana. Nunca confirmar automaticamente uma sugestão.

## Contrato público

```text
POST /api/treasury/statements/import          multipart/form-data
GET  /api/treasury/statement-imports          cursor pagination
GET  /api/treasury/statement-imports/:id      detalhe recuperável
```

Campos multipart: `file` e `treasuryAccountId`. O formato é detetado por extensão, MIME e assinatura/conteúdo; não é escolhido cegamente por um campo do utilizador.

Resposta da listagem:

```json
{
  "items": [],
  "pageInfo": {
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

## Ficheiros públicos do aluno

- `apps/api/src/modules/treasury/statementRoutes.js`
- `apps/api/src/modules/treasury/statementImportService.js`
- `apps/api/src/modules/treasury/statementImportParser.js`
- `apps/api/src/lib/uploads/streamMultipartFile.js`
- `apps/api/tests/contracts/statement-import.contract.test.js`
- `apps/api/tests/integration/statement-import.integration.test.js`
- `apps/web/src/pages/StatementImportPage.tsx`
- `apps/web/src/lib/api/statements.ts`

## Tutorial técnico linear

### Passo 1 - Modelar importação e sugestões

Mantém `BankStatementImport`, `BankStatementLine` e `BankReconciliationSuggestion` isolados por `companyId`. Acrescenta índices estáveis para listar por `(companyId, importedAt, id)` e uma chave idempotente baseada no hash do ficheiro e conta.

A sugestão começa em `SUGGESTED`. A confirmação é uma mutação distinta, com autorização e auditoria próprias.

### Passo 2 - Receber o ficheiro por streaming

Na route, usa o parser multipart apenas neste endpoint. Aceita um único ficheiro com máximo de 10 MiB, calcula SHA-256 enquanto lê, usa chave aleatória de quarentena e limpa em qualquer erro.

Valida:

- extensão `.csv` ou `.ofx`;
- MIME permitido;
- assinatura/conteúdo compatível;
- filename normalizado apenas para apresentação;
- conta pertence à empresa ativa.

Não aumentes o limite JSON global e não coloques o conteúdo financeiro nos logs.

### Passo 3 - Parsear e normalizar

O parser CSV trata cabeçalhos e delimitadores explicitamente. O parser OFX rejeita estrutura mal formada e limita quantidade/tamanho das transações. Ambos devolvem:

```js
{
  rowNumber,
  bookedOn: "2026-07-10",
  description,
  reference,
  amountMinor,
}
```

Usa o parser calendário estrito para `YYYY-MM-DD`; datas impossíveis são erro. Converte montantes para minor units/decimal seguro antes da persistência.

### Passo 4 - Gerar sugestões

Dentro de transação:

1. cria o import run;
2. grava linhas válidas;
3. procura receipts/payments candidatos da mesma empresa;
4. calcula uma pontuação explicável por valor, data e referência;
5. grava sugestões e auditoria.

Não altera o estado do receipt/payment. Não devolve candidatos de outra empresa. Um ficheiro já importado deve respeitar a política de idempotência.

### Passo 5 - Criar consulta e fluxo recuperável

A listagem usa cursor, default 50 e máximo 100. O detalhe devolve erros por linha, sugestões e estado suficiente para retomar depois de refresh. A confirmação de uma sugestão deve exigir ação explícita e nunca acontecer ao abrir a página.

### Passo 6 - Criar a página React

Usa file picker, autocomplete de contas e `FormData`. O request partilha timeout/abort central e não tem retry automático por ser uma mutação. Preserva conta, ficheiro selecionado enquanto possível e mensagens em `400`, `409` e `500`.

Mostra sugestões numa tabela/editável acessível, com “Aceitar” e “Rejeitar” explícitos. Em conflito `409 STALE_STATE`, recarrega o detalhe e pede nova decisão; não confirma silenciosamente.

### Passo 7 - Testar

- CSV e OFX válidos;
- 10 MiB aceite e 10 MiB + 1 rejeitado;
- assinatura/extensão/MIME incompatíveis;
- data impossível e montante inválido;
- conta/import de outra empresa invisível;
- import repetido idempotente;
- duas confirmações concorrentes: uma vence, outra recebe `409`;
- falha de parse/DB/storage não deixa metadata ou objeto órfão;
- sugestões nunca são confirmadas automaticamente;
- paginação não duplica nem omite itens.

## Validação final

```bash
cd apps/api
npm run test:contracts
npm run test:integration

cd ../web
npm run typecheck
npm run test
npm run build
```

## Critérios de aceite

- Ficheiro real via multipart streaming, limite 10 MiB e SHA-256.
- CSV/OFX são validados antes de persistir.
- Dados, candidatos e listagens são multiempresa.
- Sugestões exigem confirmação humana recuperável.
- Listagem usa `{ items, pageInfo }`.
- UI não pede UUID nem conteúdo textual manual.
- Falhas não deixam órfãos nem apagam o formulário.

## Evidence para PR/defesa

- hashes das fixtures;
- positivos/negativos de upload;
- negativo multiempresa;
- teste concorrente de confirmação;
- prova de paginação estável;
- comandos, exit codes e contagens reais.

## Importância

A reconciliação liga tesouraria a recebimentos e pagamentos; aceitar ficheiros sem limites ou confirmar sugestões automaticamente pode duplicar movimentos e comprometer a contabilidade.

## Scope-in

- Upload CSV/OFX, normalização, import run, sugestões e consulta recuperável.
- Isolamento multiempresa, idempotência, auditoria e cleanup.

## Scope-out

- Ligação direta a bancos e suporte universal de dialectos OFX.
- Confirmação automática ou alteração contabilística pela sugestão.

## Estado antes e depois

- Antes: existe conta de tesouraria, sem importação segura de ficheiros.
- Depois: runs e sugestões persistem, são pagináveis e exigem decisão humana.

## Pre-requisitos

- Concluir `BK-MF3-02` e rever os ciclos de recebimentos/pagamentos.
- Disponibilizar PostgreSQL e storage dedicados de teste.

## Glossário

- **Quarentena:** chave temporária privada antes da promoção.
- **Sugestão:** candidato explicável, sem efeito contabilístico automático.
- **Cursor:** marcador opaco para continuar uma ordenação estável.

## Conceitos teóricos essenciais

Streaming limita memória; hash suporta idempotência; uma claim de estado torna a confirmação concorrente segura; multiempresa é aplicada antes de procurar candidatos.

## Arquitetura do BK

Route multipart → parser/validação → transação de importação → motor de sugestões → API paginada → página de revisão.

## Ficheiros a criar/editar/rever

Usa exclusivamente os ficheiros públicos `apps/api/...` e `apps/web/...` listados neste guia; revê migrations, guards e cliente HTTP comum.

## Cenários negativos mínimos

Executa pelo menos 3 cenários negativos: excesso de tamanho, ficheiro falso e isolamento multiempresa, além dos conflitos e falhas de cleanup já enumerados.

## Handoff

Entrega a `BK-MF3-04` uma tesouraria com linhas importadas rastreáveis; não entrega movimentos automaticamente reconciliados.

## Changelog

- `2026-07-10`: substituídos payload textual e UI manual por multipart streaming, paginação e reconciliação recuperável.
