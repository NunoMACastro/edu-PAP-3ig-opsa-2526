# BK-MF3-05 - Importar CSV/Excel de clientes, fornecedores, artigos e extratos

## Header

- `doc_id`: `GUIA-BK-MF3-05`
- `bk_id`: `BK-MF3-05`
- `macro`: `MF3`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF0-09, BK-MF0-10, BK-MF0-11, BK-MF3-02, BK-MF3-03`
- `rf_rnf`: `RF35`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-06`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-05-importar-csv-excel-de-clientes-fornecedores-artigos-e-extratos.md`
- `last_updated`: `2026-07-10`

## Objetivo

Importar clientes, fornecedores, artigos e extratos a partir de ficheiros CSV ou XLSX reais, com validação por linha, idempotência, logs redigidos e isolamento multiempresa.

## Contrato

`POST /api/imports/business-data` recebe `multipart/form-data` com `file`, `type` e os campos contextuais necessários. O browser usa file picker e `FormData`; não existe textarea para colar o ficheiro.

O limite é 10 MiB durante streaming. O backend valida extensão, MIME, assinatura, SHA-256 e limites defensivos de XLSX antes de ler linhas. A política detalhada é reforçada em `BK-MF7-06`.

## Ficheiros públicos do aluno

- `apps/api/src/modules/imports/businessImportRoutes.js`
- `apps/api/src/modules/imports/businessImportService.js`
- `apps/api/src/modules/imports/importFileParser.js`
- `apps/api/src/lib/uploads/streamMultipartFile.js`
- `apps/api/tests/contracts/business-import.contract.test.js`
- `apps/api/tests/integration/business-import.integration.test.js`
- `apps/web/src/pages/BusinessImportPage.tsx`
- `apps/web/src/lib/api/imports.ts`

## Tutorial técnico linear

### Passo 1 - Modelar o run

`BusinessImportRun` guarda `companyId`, tipo, nome normalizado, hash, estado, contagens, ator e timestamps. Guarda apenas erros redigidos por número de linha/código. Adiciona índice de cursor por `(companyId, importedAt, id)` e uma constraint/idempotency key adequada.

### Passo 2 - Receber e validar o ficheiro

Usa o helper multipart route-scoped. Um único ficheiro, no máximo 10 MiB, vai para quarentena com chave aleatória. O helper calcula SHA-256 e garante cleanup em erro.

Para XLSX limita também expansão, folhas, linhas, colunas, células e timeout. Não executa fórmulas, macros ou relações externas.

### Passo 3 - Validar linhas por tipo

- `CUSTOMERS`: NIF, nome, contactos permitidos.
- `SUPPLIERS`: NIF, nome e campos de compra permitidos.
- `ITEMS`: SKU, descrição, preço/custo e taxa de IVA; isenção `0` é válida com motivo.
- `STATEMENTS`: delega normalização bancária segura de `BK-MF3-03`.

Datas usam parser estrito `YYYY-MM-DD`. Montantes usam minor units/decimal controlado. Não confies na validação do frontend.

### Passo 4 - Persistir com política explícita

Escolhe e documenta `all-or-nothing` ou `partial-with-report` por tipo. Em qualquer política, valida `companyId`, grava dados/run/auditoria de forma atómica e compensa o storage se a DB falhar. Um hash repetido não pode duplicar dados silenciosamente.

### Passo 5 - Implementar a UI

Usa file picker, `select`/autocomplete de tipo e contexto, feedback por linha e botão de descarregar relatório de erros quando existir. O request usa timeout/abort e nunca retry automático. Preserva formulário em erro; limpa apenas após sucesso.

Não mostra payloads técnicos em `<pre>` nem pede UUIDs ao utilizador.

### Passo 6 - Testar

- CSV e XLSX válidos por tipo;
- 10 MiB e 10 MiB + 1;
- assinatura/MIME/extensão inválidos;
- limites e timeout XLSX;
- NIF/data/IVA/montante inválidos;
- idempotência pelo mesmo ficheiro;
- isolamento multiempresa;
- cleanup em parse/DB/storage;
- formulário preservado em `400`, `409` e `500`.

## Resposta e listagens

O POST devolve resumo do run. Qualquer listagem de runs usa:

```json
{
  "items": [],
  "pageInfo": {
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

Default 50, máximo 100 e ordenação estável.

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

- CSV/XLSX reais via multipart streaming.
- Limites, assinatura e hash aplicados antes da importação.
- Validação de domínio por linha e empresa.
- Operação idempotente, auditada e sem órfãos.
- UI acessível, recuperável e sem entrada técnica manual.
- Testes runtime não são substituídos por skips.

## Evidence para PR/defesa

- hashes e tamanhos das fixtures;
- contagens aceites/rejeitadas;
- negativos de ficheiro, domínio e multiempresa;
- prova de idempotência e cleanup;
- comandos, exit codes e contagens reais.

## Importância

Importações alteram dados mestre e financeiros em volume; limites, idempotência e validação por linha evitam corrupção silenciosa e duplicação.

## Scope-in

- CSV/XLSX real para clientes, fornecedores, artigos e extratos.
- Upload seguro, validação, transação, run e relatório de erros.

## Scope-out

- OCR, macros, fórmulas executáveis e importação sem revisão.
- Aumento do limite JSON global.

## Estado antes e depois

- Antes: fluxo textual/manual e sem XLSX real.
- Depois: file picker e pipeline multipart com limites, hash e cleanup.

## Pre-requisitos

- Concluir dados mestre e `BK-MF3-03`.
- Rever validators de NIF, datas, IVA e montantes.

## Glossário

- **Import run:** execução persistente com contagens e estado.
- **Zip bomb:** ficheiro comprimido pequeno com expansão excessiva.
- **Idempotência:** repetição que não duplica efeitos.

## Conceitos teóricos essenciais

Validação técnica do ficheiro precede validação de domínio; a empresa vem da sessão; falha entre storage e DB exige compensação.

## Arquitetura do BK

File picker → FormData → streaming/quarentena → parser CSV/XLSX → validators por tipo → transação → resultado recuperável.

## Ficheiros a criar/editar/rever

Usa os caminhos públicos `apps/api/...` e `apps/web/...` indicados acima e revê schema, migrations e testes persistidos.

## Cenários negativos mínimos

Executa pelo menos 2 cenários negativos: ficheiro acima do limite e linha de domínio inválida; acrescenta assinatura falsa, zip bomb, multiempresa e falha de cleanup.

## Handoff

Entrega a `BK-MF3-06` dados importados com origem, hash e erros rastreáveis, nunca payloads técnicos colados na UI.

## Changelog

- `2026-07-10`: introduzidos CSV/XLSX reais, multipart, limites defensivos, idempotência e formulários recuperáveis.
