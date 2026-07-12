# BK-MF7-06 - Importações CSV/Excel com validação e logs de erro

## Header

- `doc_id`: `GUIA-BK-MF7-06`
- `bk_id`: `BK-MF7-06`
- `macro`: `MF7`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF23`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-07`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-06-importacoes-csv-excel-com-validacao-e-logs-de-erro.md`
- `last_updated`: `2026-07-10`

## Objetivo

Implementar importações CSV e XLSX reais através de `multipart/form-data`, com streaming, limites antes do parse, validação por linha, isolamento multiempresa e logs de erro recuperáveis. O browser usa um file picker; o ficheiro não é convertido para texto dentro de JSON.

## Contrato público

```http
POST /api/imports/business-data
Content-Type: multipart/form-data; boundary=...

file=<ficheiro .csv ou .xlsx>
type=CUSTOMERS | SUPPLIERS | ITEMS | STATEMENTS
treasuryAccountId=<uuid opcional, conforme o tipo>
```

O endpoint aceita um único ficheiro até `10 MiB` (`10 * 1024 * 1024` bytes). O limite é aplicado durante o streaming, não depois de carregar o body inteiro em memória.

## Ficheiros públicos do aluno

- `apps/api/src/modules/imports/businessImportRoutes.js`
- `apps/api/src/modules/imports/businessImportService.js`
- `apps/api/src/modules/imports/importFileParser.js`
- `apps/api/src/lib/uploads/streamMultipartFile.js`
- `apps/api/tests/contracts/business-import.contract.test.js`
- `apps/api/tests/integration/business-import.integration.test.js`
- `apps/web/src/pages/BusinessImportPage.tsx`
- `apps/web/src/lib/api/imports.ts`

## Conceitos essenciais

- `busboy` lê o stream e permite abortar ao atingir o limite.
- Extensão e `Content-Type` são pistas; a assinatura/magic bytes e o parser determinam o formato real.
- O nome original serve apenas para apresentação redigida. A chave de storage é aleatória e nunca contém paths fornecidos pelo utilizador.
- XLSX é um ZIP e pode expandir muito. Limita tamanho comprimido, tamanho descomprimido, folhas, linhas, colunas, células e tempo de processamento.
- A validação técnica do ficheiro precede a validação de domínio de cada linha.
- Um erro de linha não deve apagar o formulário nem obrigar a escolher novamente o tipo; a UI mostra resumo e ficheiro de erros quando aplicável.

## Tutorial técnico linear

### Passo 1 - Criar o parser multipart route-scoped

Não aumentes o limite global de `express.json()`. Na route de importação, passa `req` ao helper de streaming:

```js
const upload = await streamSingleMultipartFile(req, {
  fieldName: "file",
  maxBytes: 10 * 1024 * 1024,
  allowedExtensions: [".csv", ".xlsx"],
});
```

O helper deve:

1. rejeitar content type não multipart;
2. aceitar exatamente um campo `file`;
3. contar bytes enquanto lê;
4. calcular SHA-256 no stream;
5. gravar numa chave de quarentena aleatória;
6. destruir o stream e limpar a quarentena ao exceder o limite;
7. devolver filename seguro, tamanho, hash e referência temporária.

Não registes conteúdo, headers de autenticação, cookies nem nomes contendo dados pessoais.

### Passo 2 - Detetar o tipo real

Para CSV, rejeita bytes binários inesperados e define explicitamente os encodings aceites. Para XLSX, confirma a assinatura ZIP e abre o workbook com limites defensivos.

Exemplo de política:

```js
const XLSX_LIMITS = Object.freeze({
  maxCompressedBytes: 10 * 1024 * 1024,
  maxUncompressedBytes: 50 * 1024 * 1024,
  maxSheets: 5,
  maxRows: 20_000,
  maxColumns: 100,
  maxCells: 250_000,
  timeoutMs: 15_000,
});
```

Os números devem estar centralizados e testados. Fórmulas, macros e relações externas não são executadas.

### Passo 3 - Normalizar e validar linhas

O parser devolve linhas com `rowNumber` e valores primitivos. Um validator específico por `type` converte datas com o parser calendário estrito `YYYY-MM-DD`, trata montantes sem floats ambíguos e aceita IVA isento exatamente igual a `0` quando acompanhado pelo motivo aplicável.

```js
{
  rowNumber: 12,
  accepted: false,
  errors: [
    { field: "taxNumber", code: "INVALID_TAX_NUMBER" },
    { field: "date", code: "INVALID_CALENDAR_DATE" }
  ]
}
```

Nunca guardes a linha financeira completa dentro do log de erro. Guarda número da linha, campos/códigos redigidos e totais.

### Passo 4 - Aplicar dados transacionalmente

Filtra sempre por `companyId`. Usa chaves idempotentes por empresa, tipo e hash do ficheiro para impedir duplicação acidental. Define e documenta a política:

- `all-or-nothing` quando uma importação parcial deixaria o domínio incoerente; ou
- `partial-with-report` quando linhas independentes podem ser aceites com segurança.

Em ambos os casos, grava `BusinessImportRun`, contagens, auditoria e alterações de domínio na mesma unidade transacional possível. Se a promoção do objeto falhar, compensa a metadata; se a transação falhar, elimina a quarentena.

### Passo 5 - Devolver um resultado recuperável

```json
{
  "id": "<run-id>",
  "status": "COMPLETED_WITH_ERRORS",
  "totalRows": 120,
  "acceptedRows": 117,
  "rejectedRows": 3,
  "sha256": "<64-hex>"
}
```

Listagens de runs usam cursor pagination:

```json
{
  "items": [],
  "pageInfo": {
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

Default `50`, máximo `100`, ordenação estável por data e ID, sempre dentro da empresa ativa.

### Passo 6 - Criar a página React

A página usa `<input type="file">` com `accept=".csv,.xlsx"` e `FormData`:

```ts
const formData = new FormData();
formData.append("file", file);
formData.append("type", type);

await apiRequest("/api/imports/business-data", {
  method: "POST",
  body: formData,
  signal,
});
```

Não definas manualmente o boundary do `Content-Type`. O request partilha timeout/abort central e nunca repete automaticamente esta mutação. Substitui UUID manual por selects/autocomplete. Mantém tipo, conta e mensagens após `400`, `409` ou `500`; limpa apenas após sucesso confirmado.

### Passo 7 - Testar limites e segurança

Casos obrigatórios:

- ficheiro com exatamente 10 MiB chega ao parser;
- 10 MiB + 1 byte é rejeitado e limpo;
- dois ficheiros, zero ficheiros e campo errado falham;
- extensão falsa, assinatura inválida e MIME incompatível falham;
- XLSX excede cada limite defensivo e timeout;
- data impossível e IVA inválido falham por linha;
- hash repetido respeita idempotência;
- empresa B não consulta run da empresa A;
- erro durante parse, DB, promoção e cleanup não deixa órfãos;
- UI aborta ao desmontar e não faz retry da mutação.

## Validação final

```bash
cd apps/api
npm run test:contracts
npm run test:integration
npm run test:mf7

cd ../web
npm run typecheck
npm run test
npm run build
```

Os testes de integração exigem PostgreSQL e storage dedicados de teste. Se faltarem, regista `BLOQUEADO_AMBIENTE`; não uses skip como PASS.

## Critérios de aceite

- CSV e XLSX são selecionados como ficheiros reais no browser.
- Upload usa streaming route-scoped com limite de 10 MiB.
- Assinatura, extensão, MIME, hash e limites XLSX são verificados.
- Quarentena, promoção e cleanup não deixam órfãos.
- Validações e resultados são rastreáveis sem duplicar dados sensíveis.
- UI preserva estado em erro e não repete mutações.
- Runs são isolados por empresa e listados com cursor.

## Evidence para PR/defesa

- fixtures CSV/XLSX e respetivos hashes;
- prova dos limites 10 MiB e 10 MiB + 1;
- resultados dos negativos de assinatura e zip bomb;
- contagens de linhas aceites/rejeitadas;
- negativo multiempresa;
- prova de cleanup após falhas injetadas;
- comandos, exit codes e contagens sem credenciais.

## Importância

Ficheiros não confiáveis podem esgotar memória, esconder conteúdo ou corromper dados em massa; o pipeline precisa de limites antes do parse e validação por linha.

## Scope-in

- Multipart streaming, CSV/XLSX, limites, idempotência, logs e UI recuperável.

## Scope-out

- Ficheiros em JSON, macros/fórmulas executadas e importação sem autorização.

## Estado antes e depois

- Antes: conteúdo serializado e limites insuficientes.
- Depois: ficheiros reais, quarentena, hash, promoção e cleanup.

## Pre-requisitos

- Concluir `BK-MF3-03`/`BK-MF3-05` e preparar storage/PostgreSQL de teste.

## Glossário

- **Magic bytes:** assinatura que ajuda a identificar formato real.
- **Timeout de parse:** budget máximo para processar um ficheiro.

## Conceitos teóricos essenciais

ZIP expansion exige limites adicionais; MIME/extensão não substituem parser; side effects entre DB e S3 exigem compensação.

## Arquitetura do BK

Busboy → quarentena/hash → deteção/parser → validação por tipo → transação → promoção/cleanup → UI.

## Ficheiros a criar/editar/rever

Revê routes, parsers, adapter de uploads, services, página e testes nos caminhos públicos já listados.

## Cenários negativos mínimos

Executa pelo menos 3 cenários negativos: 10 MiB+1, assinatura falsa e expansão XLSX excessiva.

## Handoff

Entrega a `BK-MF7-07` dados importados rastreáveis e storage seguro, necessários para validar exportações fiscais.

## Changelog

- `2026-07-10`: retirado transporte serializado; adicionado multipart streaming, limites XLSX e cleanup compensatório.
