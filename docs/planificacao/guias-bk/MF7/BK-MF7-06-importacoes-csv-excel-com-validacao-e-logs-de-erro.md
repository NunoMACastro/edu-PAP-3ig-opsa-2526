# BK-MF7-06 - Importações CSV/Excel com validação e logs de erro.

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
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais fechar o requisito `RNF23`: importações CSV/Excel com validação e logs de erro. A entrega fica concentrada no backend, porque uma importação mexe em dados financeiros, dados de clientes, fornecedores, artigos e extratos bancários.

O resultado esperado é concreto: a API passa a aceitar CSV e Excel, converte o ficheiro em linhas normalizadas, valida tipo e volume antes de gravar, reaproveita os validators de domínio existentes, regista `BusinessImportRun`, cria `AuditLog`, cria `IntegrationLog` com a assinatura correta e deixa testes focados para a defesa.

#### Importância

Importar dados é uma fronteira de confiança. Um ficheiro externo pode ter colunas erradas, linhas vazias, fórmulas, valores monetários inválidos, dados de outra empresa ou volume excessivo. Por isso, o backend deve validar o formato antes de aplicar regras de negócio.

Este BK também prepara `BK-MF7-07`, porque a geração fiscal seguinte precisa de evidência operacional fiável: quantas linhas entraram, quantas foram rejeitadas, quem executou a ação e que ficheiro foi processado.

#### Scope-in

- Criar parser comum para CSV e Excel em `apps/api/src/modules/imports/importFileParser.js`.
- Reforçar `apps/api/src/modules/imports/businessImportValidators.js`.
- Reforçar `apps/api/src/modules/imports/businessImportService.js` sem duplicar o fluxo de MF3.
- Acrescentar suporte `XLSX` ao enum de importação de extratos bancários.
- Manter `POST /api/imports/business-data` protegido por sessão, empresa ativa, permissão e role.
- Criar teste contratual em `apps/api/tests/contracts/mf7-import-contracts.test.js`.
- Acrescentar script `test:mf7:imports` em `apps/api/package.json`.
- Criar evidence em `apps/api/evidence/mf7-imports.md`.

#### Scope-out

- Criar novos módulos de vendas, compras, stock ou contabilidade.
- Criar integração direta com bancos externos.
- Criar leitura automática de documentos digitalizados.
- Criar regras fiscais ou contabilísticas que não estejam documentadas.
- Alterar a escolha da empresa no frontend.
- Guardar ficheiros completos, cabeçalhos HTTP, credenciais ou dados sensíveis no log de integração.

#### Estado antes e depois

- Antes: `BK-MF3-05` já criou a rota de importações de negócio, `BusinessImportRun`, validação por linha e logs. `BK-MF6-10` reforçou auditoria obrigatória em operações sensíveis. `BK-MF7-05` deixou a disciplina de formatos, testes e evidence para interoperabilidade.
- Depois: `BK-MF7-06` acrescenta parser CSV/Excel, limite operacional, validação de conteúdo, logs de integração com contagens, testes negativos e evidence própria, sem trocar a arquitetura existente.

#### Pre-requisitos

- Ler `RNF23` em `docs/RNF.md`.
- Rever `BK-MF3-03`, porque extratos bancários já têm parsing, deduplicação e importação por empresa.
- Rever `BK-MF3-05`, porque clientes, fornecedores, artigos e extratos já entram pelo módulo de importações.
- Rever `BK-MF6-10`, porque importações sensíveis exigem auditoria.
- Rever `BK-MF7-05`, porque este BK deve manter a mesma disciplina de formatos, testes e evidence.
- Confirmar que `apps/api/package.json` já usa ES Modules e inclui `exceljs`.
- Confirmar que `apps/api/prisma/schema.prisma` contém `BusinessImportRun`, `BankStatementImport` e `IntegrationLog`.

Nota documental: o header canónico deste BK mantém `dependencias: -`. Mesmo assim, por decisão técnica `DERIVADO`, a implementação segura deve reler os BKs acima para não duplicar services nem quebrar logs existentes.

#### Glossário

- CSV: ficheiro de texto tabular em que a primeira linha contém cabeçalhos e as restantes linhas contêm valores.
- Excel: ficheiro `.xlsx` lido no backend com `exceljs`.
- Importação de negócio: entrada controlada de clientes, fornecedores, artigos ou extratos.
- Linha aceite: linha que passou validação e alterou ou criou dados.
- Linha rejeitada: linha que falhou validação e ficou registada sem impedir a importação das outras linhas válidas.
- `BusinessImportRun`: registo persistente da execução de importação.
- `IntegrationLog`: registo operacional com tipo, estado, ficheiro e contagens.
- Empresa ativa: empresa resolvida no backend a partir da sessão autenticada.

#### Conceitos teóricos essenciais

`CANONICO`: `RNF23` pede importações CSV/Excel com validação e logs de erro.

`CANONICO`: o backend decide autenticação, autorização, role, permissão e empresa ativa. O frontend envia o ficheiro e o tipo de importação, mas nunca escolhe a empresa final.

`CANONICO`: os tipos de importação já existentes são `CUSTOMERS`, `SUPPLIERS`, `ITEMS` e `STATEMENTS`.

`DERIVADO`: para suportar Excel sem mudar a stack, este BK usa `exceljs`, já previsto no backend, e recebe conteúdo `.xlsx` em base64 no JSON do pedido. Isto evita acrescentar middleware de upload nesta macrofase.

`DERIVADO`: o limite de `5000` linhas por importação protege a API contra ficheiros demasiado pesados para uma execução pedagógica e dá um critério simples para testes negativos.

Uma importação correta tem quatro camadas:

1. Contrato do ficheiro: extensão, conteúdo e número de linhas.
2. Contrato de domínio: cliente não é fornecedor, artigo não é extrato, recebimento não é pagamento.
3. Contrato de segurança: a empresa vem de `req.companyId`, a identidade vem de `req.user.id`, e a rota exige permissão.
4. Contrato de auditoria: o log guarda contagens e nome curto do ficheiro, não o conteúdo completo.

#### Arquitetura do BK

- Endpoint existente: `POST /api/imports/business-data`.
- Route: `apps/api/src/modules/imports/businessImportRoutes.js`.
- Parser novo: `apps/api/src/modules/imports/importFileParser.js`.
- Validator editado: `apps/api/src/modules/imports/businessImportValidators.js`.
- Validator de extratos editado: `apps/api/src/modules/treasury/statementImportValidators.js`.
- Service editado: `apps/api/src/modules/imports/businessImportService.js`.
- Schema editado: `apps/api/prisma/schema.prisma`.
- Teste novo: `apps/api/tests/contracts/mf7-import-contracts.test.js`.
- Evidence nova: `apps/api/evidence/mf7-imports.md`.
- Handoff: `BK-MF7-07` pode reutilizar logs de integração e evidence para readiness fiscal.

Payload esperado para CSV:

```json
{
  "type": "CUSTOMERS",
  "fileName": "clientes.csv",
  "content": "name;nif\nCliente A;501234567"
}
```

Payload esperado para Excel:

```json
{
  "type": "ITEMS",
  "fileName": "artigos.xlsx",
  "contentBase64": "UEsDBBQAAAA..."
}
```

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`
- CRIAR: `apps/api/src/modules/imports/importFileParser.js`
- EDITAR: `apps/api/src/modules/imports/businessImportValidators.js`
- EDITAR: `apps/api/src/modules/treasury/statementImportValidators.js`
- EDITAR: `apps/api/src/modules/imports/businessImportService.js`
- REVER: `apps/api/src/modules/imports/businessImportRoutes.js`
- EDITAR: `apps/api/package.json`
- CRIAR: `apps/api/tests/contracts/mf7-import-contracts.test.js`
- CRIAR: `apps/api/evidence/mf7-imports.md`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/guias-bk/MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx.md`
- REVER: `docs/planificacao/guias-bk/MF3/BK-MF3-05-importar-dados-de-clientes-fornecedores-artigos-extratos-csv.md`
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`
- REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-05-exportacoes-disponiveis-em-csv-excel-e-pdf.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato, domínio e risco principal

1. Objetivo funcional do passo no contexto da app.

Confirmar que `RNF23` é uma melhoria de interoperabilidade e segurança, não um módulo novo. O fluxo deve reforçar importações já existentes sem inventar outro endpoint para a mesma ação.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/guias-bk/MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx.md`
    - REVER: `docs/planificacao/guias-bk/MF3/BK-MF3-05-importar-dados-de-clientes-fornecedores-artigos-extratos-csv.md`
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-05-exportacoes-disponiveis-em-csv-excel-e-pdf.md`
    - LOCALIZAÇÃO: secções de objetivo, validação, logs e handoff.

3. Instruções do que fazer.

Confirma que `RNF23` fala de importações CSV/Excel com validação e logs de erro. Depois separa os quatro tipos de importação:

- `CUSTOMERS`: cria ou atualiza clientes.
- `SUPPLIERS`: cria ou atualiza fornecedores.
- `ITEMS`: cria ou atualiza artigos.
- `STATEMENTS`: importa linhas de extrato bancário.

Não mistures estes domínios. Uma linha de fornecedor não deve cair no validator de cliente. Uma linha de extrato não deve criar artigo. A distinção é feita por `type` validado no backend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Sem código neste passo porque a decisão principal é de arquitetura. Antes de programar, tens de garantir que vais reforçar o endpoint existente e preservar autenticação, empresa ativa, permissão, auditoria e logs.

6. Validação do passo.

Resultado esperado:

- O endpoint escolhido é `POST /api/imports/business-data`.
- A empresa ativa continua a vir de `req.companyId`.
- O utilizador continua a vir de `req.user.id`.
- O tipo de importação fica limitado a `CUSTOMERS`, `SUPPLIERS`, `ITEMS` e `STATEMENTS`.
- `BK-MF7-07` recebe logs e evidence aproveitáveis.

7. Cenário negativo/erro esperado.

Se alguém propuser aceitar a empresa no body do pedido, rejeita a decisão. Resultado esperado: a rota mantém a empresa autenticada resolvida no backend e não permite escolher outra empresa a partir do ficheiro.

### Passo 2 - Criar contrato de formato e parser CSV/Excel

1. Objetivo funcional do passo no contexto da app.

Criar a camada que transforma ficheiro externo em linhas normalizadas antes de o service tocar em clientes, fornecedores, artigos ou extratos.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`
    - CRIAR: `apps/api/src/modules/imports/importFileParser.js`
    - LOCALIZAÇÃO: enum `BankStatementFormat` no schema e ficheiro novo no módulo `imports`.

3. Instruções do que fazer.

No schema, acrescenta `XLSX` ao enum de formatos de extrato. Esta alteração permite que uma importação de extrato vinda de Excel fique honesta no histórico em vez de ser gravada como CSV.

```prisma
enum BankStatementFormat {
  CSV
  OFX
  XLSX
}
```

Explicação do código:

O enum representa formatos realmente persistidos em `BankStatementImport`. Sem `XLSX`, o backend teria de gravar uma importação Excel como se fosse CSV, o que criaria uma inconsistência de auditoria. Esta alteração é pequena, mas deve ser acompanhada por `npx prisma validate` e por uma migration quando a equipa estiver a aplicar o BK na app.

Depois cria `apps/api/src/modules/imports/importFileParser.js`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Parser comum para importações CSV e Excel do OPSA.
 */

import ExcelJS from "exceljs";
import { httpError } from "../../lib/httpErrors.js";

export const ImportSourceFormat = Object.freeze({
  CSV: "CSV",
  XLSX: "XLSX",
});

export const MAX_IMPORT_ROWS = 5000;

const FORMAT_BY_EXTENSION = new Map([
  [".csv", ImportSourceFormat.CSV],
  [".xlsx", ImportSourceFormat.XLSX],
]);

/**
 * Normaliza texto recebido de payloads ou células de folha de cálculo.
 *
 * @param {unknown} value - Valor recebido.
 * @returns {string} Texto sem espaços exteriores.
 */
function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Converte valores de célula Excel para texto simples.
 *
 * @param {unknown} value - Valor de uma célula Excel.
 * @returns {string} Texto seguro para os validators de domínio.
 */
function cellToText(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value !== "object") return String(value).trim();

  if ("text" in value) return normalizeText(value.text);
  if ("result" in value) return normalizeText(value.result);
  if ("richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => normalizeText(part.text)).join("").trim();
  }

  return String(value).trim();
}

/**
 * Extrai a extensão final do nome do ficheiro.
 *
 * @param {string} fileName - Nome recebido no pedido.
 * @returns {string} Extensão normalizada, incluindo o ponto.
 */
export function extensionOf(fileName) {
  const safeName = normalizeText(fileName);
  const index = safeName.lastIndexOf(".");
  return index === -1 ? "" : safeName.slice(index).toLowerCase();
}

/**
 * Deteta o formato de importação a partir do nome do ficheiro.
 *
 * @param {string} fileName - Nome do ficheiro recebido.
 * @returns {"CSV" | "XLSX"} Formato suportado pela API.
 */
export function detectImportSourceFormat(fileName) {
  const sourceFormat = FORMAT_BY_EXTENSION.get(extensionOf(fileName));
  if (!sourceFormat) {
    throw httpError(
      400,
      "INVALID_IMPORT_FILE_FORMAT",
      "Formato de importação inválido. Usa csv ou xlsx.",
    );
  }
  return sourceFormat;
}

/**
 * Garante que os cabeçalhos existem antes de processar linhas.
 *
 * @param {string[]} headers - Cabeçalhos lidos do ficheiro.
 * @returns {string[]} Cabeçalhos validados.
 */
function assertHeaders(headers) {
  const cleanHeaders = headers.map((header) => normalizeText(header)).filter(Boolean);
  if (cleanHeaders.length === 0) {
    throw httpError(400, "INVALID_IMPORT_HEADERS", "Importação sem cabeçalhos úteis");
  }
  return cleanHeaders;
}

/**
 * Valida o número de linhas úteis da importação.
 *
 * @param {number} rowCount - Total de linhas de dados.
 * @returns {number} Total aprovado.
 */
export function assertImportRowLimit(rowCount) {
  if (!Number.isInteger(rowCount) || rowCount <= 0) {
    throw httpError(400, "INVALID_IMPORT_ROWS", "Importação sem linhas úteis");
  }
  if (rowCount > MAX_IMPORT_ROWS) {
    throw httpError(413, "IMPORT_TOO_LARGE", "Importação excede o limite de linhas");
  }
  return rowCount;
}

/**
 * Converte CSV com cabeçalho em linhas de objetos simples.
 *
 * @param {string} content - Conteúdo textual CSV separado por ponto e vírgula.
 * @returns {Array<Record<string, string>>} Linhas normalizadas por cabeçalho.
 */
export function parseCsvRows(content) {
  const lines = normalizeText(content)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw httpError(400, "INVALID_IMPORT_CSV", "CSV deve ter cabeçalho e pelo menos uma linha");
  }

  const headers = assertHeaders(lines[0].split(";"));

  // A primeira linha é o cabeçalho; só as linhas seguintes representam dados de negócio.
  const rows = lines.slice(1).map((line) => {
    const values = line.split(";").map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });

  assertImportRowLimit(rows.length);
  return rows;
}

/**
 * Converte uma folha Excel em linhas de objetos simples.
 *
 * @param {string} contentBase64 - Conteúdo `.xlsx` codificado em base64.
 * @returns {Promise<Array<Record<string, string>>>} Linhas normalizadas por cabeçalho.
 */
async function parseXlsxRows(contentBase64) {
  const safeBase64 = normalizeText(contentBase64);
  if (!safeBase64) {
    throw httpError(400, "INVALID_IMPORT_XLSX", "Conteúdo Excel em base64 obrigatório");
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(safeBase64, "base64"));

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw httpError(400, "INVALID_IMPORT_XLSX", "Excel sem folha de dados");
  }

  const headers = [];
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, columnNumber) => {
    headers[columnNumber - 1] = cellToText(cell.value);
  });

  const cleanHeaders = assertHeaders(headers);
  const rows = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const record = {};
    for (const [index, header] of cleanHeaders.entries()) {
      record[header] = cellToText(row.getCell(index + 1).value);
    }

    // Linhas totalmente vazias são ignoradas para não criar rejeições artificiais.
    if (Object.values(record).some(Boolean)) rows.push(record);
  });

  assertImportRowLimit(rows.length);
  return rows;
}

/**
 * Converte um ficheiro CSV ou Excel em linhas normalizadas.
 *
 * @param {{ fileName: string, content?: string, contentBase64?: string }} input - Ficheiro recebido.
 * @returns {Promise<{ sourceFormat: "CSV" | "XLSX", rows: Array<Record<string, string>> }>} Resultado do parser.
 */
export async function parseImportRows(input) {
  const sourceFormat = detectImportSourceFormat(input.fileName);
  const rows =
    sourceFormat === ImportSourceFormat.CSV
      ? parseCsvRows(input.content)
      : await parseXlsxRows(input.contentBase64);

  return { sourceFormat, rows };
}

/**
 * Constrói o input correto para `recordIntegrationLog`.
 *
 * @param {{ context: { companyId: string, userId: string }, data: { type: string, sourceFormat: string }, run: { id: string, fileName: string, totalRows: number }, acceptedRows: number, rejectedRows: number }} input - Dados finais da importação.
 * @returns {{ companyId: string, userId: string, integrationType: string, operation: string, status: string, sourceId: string, fileName: string, totalRows: number, successRows: number, errorRows: number, message: string }} Input sanitizável pelo service de logs.
 */
export function buildImportLogInput({ context, data, run, acceptedRows, rejectedRows }) {
  return {
    companyId: context.companyId,
    userId: context.userId,
    integrationType: data.type,
    operation: "IMPORT",
    status: rejectedRows > 0 ? "PARTIAL" : "IMPORTED",
    sourceId: run.id,
    fileName: run.fileName,
    totalRows: run.totalRows,
    successRows: acceptedRows,
    errorRows: rejectedRows,
    message: `Importacao ${data.sourceFormat} de ${data.type} concluida com validacao por linha.`,
  };
}
```

Explicação do código:

Este ficheiro existe para separar parsing de regras de domínio. O parser só decide se o ficheiro é CSV ou Excel, lê cabeçalhos, converte linhas e aplica o limite operacional. Ele não cria clientes, fornecedores, artigos ou extratos.

O código cumpre `RNF23` porque já não valida apenas a extensão `.xlsx`; lê a folha Excel com `exceljs` e transforma o conteúdo em linhas. Também evita um erro comum: aceitar ficheiros vazios ou demasiado grandes antes de começar a transação.

O `buildImportLogInput` cumpre o contrato real de logs: inclui `companyId`, `userId`, `operation`, `sourceId`, `fileName`, `totalRows`, `successRows`, `errorRows` e `message`. Não cria um campo `details` que não existe no modelo.

O aluno pode adaptar o separador CSV se a equipa documentar outro formato. Não deve remover `assertImportRowLimit`, nem passar conteúdo completo do ficheiro para logs.

5. Explicação do código.

A explicação principal está imediatamente depois do bloco de código. A ideia essencial é manter uma fronteira limpa: parser valida ficheiro, validators validam payload, service aplica regras de negócio, logs guardam resumo.

6. Validação do passo.

Executa:

```bash
cd apps/api
npx prisma validate
node --check src/modules/imports/importFileParser.js
```

Resultado esperado:

- `npx prisma validate` passa depois de acrescentar `XLSX` ao enum.
- `node --check` não encontra erro de sintaxe.
- CSV sem cabeçalho devolve `INVALID_IMPORT_CSV`.
- Excel sem folha devolve `INVALID_IMPORT_XLSX`.
- Mais de `5000` linhas devolve `IMPORT_TOO_LARGE`.

7. Cenário negativo/erro esperado.

Envia `clientes.txt`. Resultado esperado: HTTP `400` com `INVALID_IMPORT_FILE_FORMAT`. A API não deve gravar `BusinessImportRun`, `AuditLog` nem `IntegrationLog`.

### Passo 3 - Reforçar o validator do payload de importação

1. Objetivo funcional do passo no contexto da app.

Validar o body JSON antes do service abrir transação. O validator deve normalizar `type`, `fileName`, `content`, `contentBase64`, `treasuryAccountId`, `sourceFormat` e `rows`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/imports/businessImportValidators.js`
    - LOCALIZAÇÃO: substituir o ficheiro pelo conteúdo abaixo.

3. Instruções do que fazer.

Substitui o ficheiro por este conteúdo. Mantém a exportação de `parseCsvRows` para compatibilidade com testes ou imports anteriores que ainda a usem.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Validadores para importações CSV e Excel de dados de negócio.
 */

import { httpError } from "../../lib/httpErrors.js";
import { parseCsvRows, parseImportRows } from "./importFileParser.js";

export { parseCsvRows };

const IMPORT_TYPES = new Set(["CUSTOMERS", "SUPPLIERS", "ITEMS", "STATEMENTS"]);

/**
 * Normaliza texto opcional removendo espaços exteriores.
 *
 * @param {unknown} value - Valor recebido do body JSON.
 * @returns {string} Texto normalizado.
 */
function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Valida payload base de importação de negócio.
 *
 * @param {unknown} input - Body JSON recebido em `POST /api/imports/business-data`.
 * @returns {Promise<{ type: string, fileName: string, content: string, contentBase64: string, treasuryAccountId: string | null, sourceFormat: string, rows: Array<Record<string, string>> }>} Payload normalizado e linhas parseadas.
 */
export async function validateBusinessImportPayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
  }

  const type = normalizeText(input.type).toUpperCase();
  if (!IMPORT_TYPES.has(type)) {
    throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importação inválido");
  }

  const fileName = normalizeText(input.fileName) || `${type.toLowerCase()}.csv`;
  const content = normalizeText(input.content);
  const contentBase64 = normalizeText(input.contentBase64);
  const treasuryAccountId = normalizeText(input.treasuryAccountId) || null;

  if (type === "STATEMENTS" && !treasuryAccountId) {
    throw httpError(400, "TREASURY_ACCOUNT_REQUIRED", "Conta de tesouraria obrigatória");
  }

  // O parser é chamado no validator para falhar antes da transação e antes de qualquer escrita.
  const parsed = await parseImportRows({ fileName, content, contentBase64 });

  return {
    type,
    fileName,
    content,
    contentBase64,
    treasuryAccountId,
    sourceFormat: parsed.sourceFormat,
    rows: parsed.rows,
  };
}
```

Explicação do código:

O validator protege o service de receber um body ambíguo. Primeiro confirma que o pedido é JSON, depois valida o tipo de importação e só depois chama o parser. Assim, erros de formato ficam como respostas HTTP `400` antes da transação.

O campo `treasuryAccountId` é obrigatório apenas em `STATEMENTS`, porque extratos bancários precisam de conta de tesouraria. Clientes, fornecedores e artigos não devem receber uma conta bancária só para passar validação.

Este ficheiro prepara `businessImportService.js`: o service já recebe `rows` prontas e `sourceFormat`, por isso deixa de chamar `parseCsvRows` diretamente. O aluno pode acrescentar novos cabeçalhos aceites nos validators de cliente/fornecedor/artigo, mas não deve abrir tipos fora de `IMPORT_TYPES` sem atualizar schema, testes e documentação.

5. Explicação do código.

A explicação do bloco está acima. A decisão importante é falhar cedo: ficheiro inválido não chega ao Prisma, não cria logs e não mistura responsabilidades.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/imports/businessImportValidators.js
```

Resultado esperado:

- Body vazio devolve `INVALID_BODY`.
- Tipo desconhecido devolve `INVALID_IMPORT_TYPE`.
- `STATEMENTS` sem `treasuryAccountId` devolve `TREASURY_ACCOUNT_REQUIRED`.
- `.csv` válido produz `rows`.
- `.xlsx` válido produz `rows` e `sourceFormat: "XLSX"`.

7. Cenário negativo/erro esperado.

Envia:

```json
{
  "type": "UNKNOWN",
  "fileName": "clientes.csv",
  "content": "name;nif\nCliente A;501234567"
}
```

Resultado esperado: HTTP `400` com `INVALID_IMPORT_TYPE`. Nenhum dado é criado.

### Passo 4 - Normalizar extratos e integrar o service real

1. Objetivo funcional do passo no contexto da app.

Ligar o parser ao fluxo existente de importação, preservando validação por linha, transação, `BusinessImportRun`, `AuditLog` e `IntegrationLog`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/treasury/statementImportValidators.js`
    - EDITAR: `apps/api/src/modules/imports/businessImportService.js`
    - LOCALIZAÇÃO: acrescentar função exportada ao validator de extratos e substituir o service de importações pelo conteúdo abaixo.

3. Instruções do que fazer.

No fim de `apps/api/src/modules/treasury/statementImportValidators.js`, acrescenta a função seguinte. Ela reutiliza a mesma lógica conceptual de datas e valores do validator de extratos, mas recebe linhas já parseadas pelo parser comum.

4. Código completo, correto e integrado com a app final.

```js
/**
 * Normaliza linhas de extrato vindas do parser comum de importações.
 *
 * @param {Array<Record<string, string>>} rows - Linhas lidas de CSV ou Excel.
 * @returns {{ rows: Array<object>, errors: Array<object>, totalLines: number }} Resultado normalizado.
 */
export function normalizeStatementRowsFromImport(rows) {
  const acceptedRows = [];
  const errors = [];

  for (const [index, row] of rows.entries()) {
    try {
      const date = row.date || row.data || row.entryDate;
      const description = row.description || row.descricao || "Movimento bancário";
      const reference = row.reference || row.referencia || null;
      const amount = row.amount || row.valor || row.amountCents;

      // A conversão mantém a regra de MF3: valores monetários entram como cêntimos inteiros.
      acceptedRows.push({
        lineNumber: index + 2,
        entryDate: parseStatementDate(date),
        description,
        reference,
        amountCents: parseMoneyToCents(amount),
        raw: { rowNumber: index + 2 },
      });
    } catch (error) {
      errors.push({ line: index + 2, message: error.message });
    }
  }

  if (acceptedRows.length === 0) {
    throw httpError(
      400,
      "INVALID_STATEMENT_FORMAT",
      "Extrato sem linhas válidas para importar",
      errors,
    );
  }

  return { rows: acceptedRows, errors, totalLines: rows.length };
}
```

Explicação do código:

Este bloco é uma adição controlada ao ficheiro de extratos. Ele não substitui `validateStatementImportPayload`; apenas acrescenta uma entrada para linhas já parseadas por `importFileParser.js`. A função preserva a regra de datas e valores monetários já usada em MF3, e devolve erros por linha sem guardar a linha completa no histórico.

A decisão de guardar `raw: { rowNumber }` evita persistir dados financeiros completos duas vezes. O dado operacional importante para auditoria é saber que linha falhou, não repetir todo o conteúdo importado.

Agora substitui `apps/api/src/modules/imports/businessImportService.js` por este conteúdo.

```js
/**
 * @file Service de importação CSV e Excel de clientes, fornecedores, artigos e extratos.
 */

import { httpError } from "../../lib/httpErrors.js";
import { validateCustomerPayload } from "../customers/customerValidators.js";
import { recordIntegrationLog } from "../integrations/integrationLogService.js";
import { validateItemPayload } from "../items/itemValidators.js";
import { validateSupplierPayload } from "../suppliers/supplierValidators.js";
import { deduplicateStatementRows } from "../treasury/statementImportService.js";
import { normalizeStatementRowsFromImport } from "../treasury/statementImportValidators.js";
import { buildImportLogInput } from "./importFileParser.js";
import { validateBusinessImportPayload } from "./businessImportValidators.js";

/**
 * Cria um erro de importação associado à linha original do ficheiro.
 *
 * @param {number} rowNumber - Número original da linha no ficheiro importado.
 * @param {Error & { code?: string }} error - Erro capturado durante a operação.
 * @returns {{ rowNumber: number, code: string, message: string }} Erro de importação associado a uma linha.
 */
function rowError(rowNumber, error) {
  return {
    rowNumber,
    code: error.code ?? "IMPORT_ROW_ERROR",
    message: error.message ?? "Linha rejeitada",
  };
}

/**
 * Cria ou atualiza um cliente durante importações, preservando a empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma usada pela operação.
 * @param {string} companyId - Empresa ativa resolvida no backend.
 * @param {Record<string, string>} row - Linha de dados a processar.
 * @returns {Promise<object>} Cliente criado ou atualizado pela importação.
 */
async function upsertCustomer(tx, companyId, row) {
  const data = validateCustomerPayload(row);
  if (!data.nif) {
    return tx.customer.create({ data: { companyId, ...data } });
  }
  return tx.customer.upsert({
    where: { companyId_nif: { companyId, nif: data.nif } },
    create: { companyId, ...data },
    update: data,
  });
}

/**
 * Cria ou atualiza um fornecedor durante importações, preservando a empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma usada pela operação.
 * @param {string} companyId - Empresa ativa resolvida no backend.
 * @param {Record<string, string>} row - Linha de dados a processar.
 * @returns {Promise<object>} Fornecedor criado ou atualizado pela importação.
 */
async function upsertSupplier(tx, companyId, row) {
  const data = validateSupplierPayload(row);
  if (!data.nif) {
    return tx.supplier.create({ data: { companyId, ...data } });
  }
  return tx.supplier.upsert({
    where: { companyId_nif: { companyId, nif: data.nif } },
    create: { companyId, ...data },
    update: data,
  });
}

/**
 * Cria ou atualiza um artigo durante importações, preservando a empresa ativa.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma usada pela operação.
 * @param {string} companyId - Empresa ativa resolvida no backend.
 * @param {Record<string, string>} row - Linha de dados a processar.
 * @returns {Promise<object>} Artigo criado ou atualizado pela importação.
 */
async function upsertItem(tx, companyId, row) {
  const data = validateItemPayload({
    ...row,
    costCents: Number(row.costCents),
    priceCents: Number(row.priceCents),
    vatRateBps: Number(row.vatRateBps),
  });
  return tx.item.upsert({
    where: { companyId_sku: { companyId, sku: data.sku } },
    create: { companyId, ...data },
    update: data,
  });
}

/**
 * Encaminha linhas de extrato importadas para o serviço de importação bancária.
 *
 * @param {import("@prisma/client").PrismaClient} tx - Transação Prisma usada pela operação.
 * @param {{ companyId: string, userId: string }} context - Contexto autenticado.
 * @param {{ treasuryAccountId: string, fileName: string, sourceFormat: string, rows: Array<Record<string, string>> }} data - Dados normalizados.
 * @returns {Promise<{ acceptedRows: number, rejectedRows: number, errors: Array<object> }>} Resultado da importação.
 */
async function importStatementRows(tx, context, data) {
  const account = await tx.treasuryAccount.findFirst({
    where: { id: data.treasuryAccountId, companyId: context.companyId, isActive: true },
  });
  if (!account) {
    throw httpError(404, "TREASURY_ACCOUNT_NOT_FOUND", "Conta de tesouraria não encontrada");
  }

  const statement = normalizeStatementRowsFromImport(data.rows);
  const deduplicated = deduplicateStatementRows(statement.rows);
  const importErrors = [...statement.errors, ...deduplicated.duplicateErrors];

  const imported = await tx.bankStatementImport.create({
    data: {
      companyId: context.companyId,
      treasuryAccountId: account.id,
      format: data.sourceFormat,
      fileName: data.fileName,
      status: importErrors.length > 0 ? "PARTIAL" : "IMPORTED",
      totalLines: statement.totalLines,
      acceptedLines: deduplicated.rows.length,
      rejectedLines: importErrors.length,
      errors: importErrors,
      importedById: context.userId,
    },
  });

  for (const row of deduplicated.rows) {
    // Cada linha herda a empresa da conta validada, evitando mistura entre empresas.
    await tx.bankStatementLine.create({
      data: {
        companyId: context.companyId,
        importId: imported.id,
        treasuryAccountId: account.id,
        entryDate: row.entryDate,
        description: row.description,
        reference: row.reference,
        amountCents: row.amountCents,
        raw: row.raw,
      },
    });
  }

  return {
    acceptedRows: deduplicated.rows.length,
    rejectedRows: importErrors.length,
    errors: importErrors,
  };
}

/**
 * Importa dados sensíveis com validação por linha e resumo persistido.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, input: unknown }} context - Contexto autenticado.
 * @returns {Promise<{ run: object, acceptedRows: number, rejectedRows: number, errors: Array<object> }>} Resumo da importação.
 */
export async function importBusinessData(prisma, context) {
  const data = await validateBusinessImportPayload(context.input);

  return prisma.$transaction(async (tx) => {
    let acceptedRows = 0;
    let rejectedRows = 0;
    let errors = [];

    if (data.type === "STATEMENTS") {
      const result = await importStatementRows(tx, context, data);
      acceptedRows = result.acceptedRows;
      rejectedRows = result.rejectedRows;
      errors = result.errors;
    } else {
      for (const [index, row] of data.rows.entries()) {
        try {
          if (data.type === "CUSTOMERS") {
            await upsertCustomer(tx, context.companyId, row);
          } else if (data.type === "SUPPLIERS") {
            await upsertSupplier(tx, context.companyId, row);
          } else {
            await upsertItem(tx, context.companyId, row);
          }
          acceptedRows += 1;
        } catch (error) {
          rejectedRows += 1;
          errors.push(rowError(index + 2, error));
        }
      }
    }

    const run = await tx.businessImportRun.create({
      data: {
        companyId: context.companyId,
        type: data.type,
        fileName: data.fileName,
        totalRows: acceptedRows + rejectedRows,
        acceptedRows,
        rejectedRows,
        errors,
        importedById: context.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        companyId: context.companyId,
        userId: context.userId,
        action: "BUSINESS_DATA_IMPORTED",
        entity: "BusinessImportRun",
        entityId: run.id,
        details: { type: data.type, sourceFormat: data.sourceFormat, acceptedRows, rejectedRows },
      },
    });

    // O log de integração guarda apenas metadados operacionais e contagens.
    await recordIntegrationLog(
      tx,
      buildImportLogInput({ context, data, run, acceptedRows, rejectedRows }),
    );

    return { run, acceptedRows, rejectedRows, errors };
  });
}
```

Explicação do código:

A função `importBusinessData` continua a ser o ponto de entrada do módulo. Isto evita criar uma rota paralela e mantém o contrato de MF3. A diferença é que agora o validator devolve `rows` e `sourceFormat`; por isso o service trabalha com linhas já parseadas de CSV ou Excel.

Para clientes, fornecedores e artigos, o service reaproveita validators existentes. Isto mantém as regras de NIF, SKU, preços, IVA e nomes dentro dos módulos certos. Para extratos, a conta é pesquisada com `companyId` e `isActive: true`, impedindo importação para conta de outra empresa.

O `recordIntegrationLog` recebe a assinatura correta. O log contém a empresa autenticada, o utilizador, a operação `IMPORT`, o id da execução, o nome do ficheiro e contagens. Não há campo `details` no modelo de logs, por isso o BK não o usa.

O aluno pode adaptar mensagens ou limites se a equipa documentar a decisão. Não deve retirar a transação, nem mover autorização para o frontend, nem gravar conteúdo completo do ficheiro no log.

5. Explicação do código.

As explicações estão colocadas depois de cada bloco. A ligação importante é: parser comum -> validator -> service -> run -> audit log -> integration log. Cada camada tem uma responsabilidade diferente.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/treasury/statementImportValidators.js
node --check src/modules/imports/businessImportService.js
```

Resultado esperado:

- O service compila.
- `recordIntegrationLog` é chamado com `userId`, `operation`, `sourceId`, `fileName`, contagens e `message`.
- `STATEMENTS` sem conta válida devolve `TREASURY_ACCOUNT_NOT_FOUND`.
- Linha inválida incrementa `rejectedRows` e aparece em `errors`.

7. Cenário negativo/erro esperado.

Importa um Excel de extratos com conta de tesouraria inexistente. Resultado esperado: HTTP `404` com `TREASURY_ACCOUNT_NOT_FOUND`. Nenhuma linha de extrato é criada.

### Passo 5 - Confirmar route, permissões e script dedicado

1. Objetivo funcional do passo no contexto da app.

Garantir que o endpoint existente continua protegido e que existe um comando simples para validar este BK.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/imports/businessImportRoutes.js`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: route `/business-data` e objeto `"scripts"`.

3. Instruções do que fazer.

Confirma que a route mantém os guards. Se o ficheiro já estiver igual ao bloco abaixo, não dupliques código; apenas segue para o script.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Rotas de importações de dados da MF3 reforçadas por RNF23.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { importBusinessData } from "./businessImportService.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param {import("express").Response} res - Resposta Express usada para enviar o erro.
 * @param {unknown} error - Erro capturado durante a operação.
 * @returns {import("express").Response} Resposta HTTP de erro.
 */
function sendError(res, error) {
  const response = toHttpError(error);
  return res
    .status(response.status)
    .json({ error: response.code, message: response.message, details: response.details });
}

/**
 * Constrói router `/api/imports`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildBusinessImportRoutes({ prisma }) {
  const router = Router();
  const guards = [
    requireAuth(prisma),
    requireCompanyContext(prisma),
    requirePermission(Permission.IMPORTS_WRITE),
    requireRole("ADMIN", "CONTABILISTA"),
  ];

  router.post("/business-data", guards, async (req, res) => {
    try {
      const result = await importBusinessData(prisma, {
        // A empresa e o utilizador vêm dos middlewares, não do ficheiro importado.
        companyId: req.companyId,
        userId: req.user.id,
        input: req.body,
      });
      return res.status(201).json(result);
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}
```

Explicação do código:

A route mantém o endpoint existente. Isto é importante porque outros BKs e o frontend já podem conhecer `POST /api/imports/business-data`. O reforço deste BK está no parser, validator e service, não numa nova rota concorrente.

Os guards garantem autenticação, empresa ativa, permissão `IMPORTS_WRITE` e role `ADMIN` ou `CONTABILISTA`. A route passa `req.companyId` e `req.user.id` para o service, mantendo a decisão final no backend.

No `apps/api/package.json`, acrescenta o script seguinte dentro de `"scripts"`:

```json
{
  "test:mf7:imports": "node --test tests/contracts/mf7-import-contracts.test.js"
}
```

Explicação do código:

O script dá uma prova focada para `RNF23`. Ele não substitui `npm run test:contracts`; apenas permite validar rapidamente o contrato de importações CSV/Excel durante a implementação deste BK.

5. Explicação do código.

As explicações estão junto dos blocos. A route garante segurança de entrada; o script garante repetibilidade de validação.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/imports/businessImportRoutes.js
npm run test:mf7:imports
```

Resultado esperado:

- A route compila.
- Pedido autenticado válido devolve HTTP `201`.
- Pedido sem permissão não chega ao service.
- O script existe e executa o teste contratual.

7. Cenário negativo/erro esperado.

Faz um pedido sem sessão autenticada. Resultado esperado: a API devolve erro de autenticação antes de validar o ficheiro.

### Passo 6 - Criar testes contratuais de importação

1. Objetivo funcional do passo no contexto da app.

Criar prova automática para os pontos mais arriscados: Excel real, formato inválido, ficheiro vazio, excesso de linhas e formato correto do `IntegrationLog`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf7-import-contracts.test.js`
    - LOCALIZAÇÃO: pasta de testes contratuais da API.

3. Instruções do que fazer.

Cria o ficheiro abaixo. O teste usa `node:test`, `assert` e `exceljs`, que já fazem parte da stack do backend.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Testes contratuais de importações CSV/Excel da MF7.
 */

import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import {
  buildImportLogInput,
  MAX_IMPORT_ROWS,
  parseImportRows,
} from "../../src/modules/imports/importFileParser.js";
import { validateBusinessImportPayload } from "../../src/modules/imports/businessImportValidators.js";

/**
 * Cria um workbook Excel em memória para testar parser `.xlsx`.
 *
 * @param {Array<Array<string | number>>} rows - Linhas a escrever na folha.
 * @returns {Promise<string>} Conteúdo Excel em base64.
 */
async function buildWorkbookBase64(rows) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("dados");

  for (const row of rows) {
    worksheet.addRow(row);
  }

  // O teste usa buffer em memória para não depender de ficheiros temporários.
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer).toString("base64");
}

test("parseImportRows lê Excel real e devolve linhas por cabeçalho", async () => {
  const contentBase64 = await buildWorkbookBase64([
    ["name", "nif"],
    ["Cliente A", "501234567"],
    ["Cliente B", "501234568"],
  ]);

  const result = await parseImportRows({ fileName: "clientes.xlsx", contentBase64 });

  assert.equal(result.sourceFormat, "XLSX");
  assert.deepEqual(result.rows, [
    { name: "Cliente A", nif: "501234567" },
    { name: "Cliente B", nif: "501234568" },
  ]);
});

test("validateBusinessImportPayload rejeita formato não suportado", async () => {
  await assert.rejects(
    validateBusinessImportPayload({
      type: "CUSTOMERS",
      fileName: "clientes.txt",
      content: "name;nif\nCliente A;501234567",
    }),
    /Formato de importação inválido/,
  );
});

test("validateBusinessImportPayload rejeita CSV sem linhas úteis", async () => {
  await assert.rejects(
    validateBusinessImportPayload({
      type: "CUSTOMERS",
      fileName: "clientes.csv",
      content: "name;nif",
    }),
    /CSV deve ter cabeçalho/,
  );
});

test("parseImportRows rejeita importações acima do limite operacional", async () => {
  const lines = ["name;nif"];
  for (let index = 0; index <= MAX_IMPORT_ROWS; index += 1) {
    lines.push(`Cliente ${index};501234567`);
  }

  await assert.rejects(
    parseImportRows({ fileName: "clientes.csv", content: lines.join("\n") }),
    /excede o limite/,
  );
});

test("buildImportLogInput respeita o contrato de recordIntegrationLog", () => {
  const logInput = buildImportLogInput({
    context: { companyId: "comp-1", userId: "user-1" },
    data: { type: "CUSTOMERS", sourceFormat: "XLSX" },
    run: { id: "run-1", fileName: "clientes.xlsx", totalRows: 3 },
    acceptedRows: 2,
    rejectedRows: 1,
  });

  assert.deepEqual(logInput, {
    companyId: "comp-1",
    userId: "user-1",
    integrationType: "CUSTOMERS",
    operation: "IMPORT",
    status: "PARTIAL",
    sourceId: "run-1",
    fileName: "clientes.xlsx",
    totalRows: 3,
    successRows: 2,
    errorRows: 1,
    message: "Importacao XLSX de CUSTOMERS concluida com validacao por linha.",
  });
  assert.equal(Object.hasOwn(logInput, "details"), false);
});
```

Explicação do código:

O primeiro teste prova que `.xlsx` é lido de verdade. Não basta aceitar a extensão; o workbook é criado em memória, lido por `parseImportRows` e comparado com linhas esperadas.

Os testes negativos cobrem formato inválido, CSV vazio e excesso de linhas. Estes casos têm de falhar antes da transação, porque um ficheiro inválido não deve criar `BusinessImportRun` nem logs.

O último teste protege o contrato de `recordIntegrationLog`. Ele confirma que o input tem os campos existentes no modelo e não inventa `details`. Isto evita regressão de integração entre MF4/MF6 e MF7.

5. Explicação do código.

A explicação do bloco está acima. O teste é focado no contrato e não depende de base de dados, por isso corre rápido durante a implementação.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check tests/contracts/mf7-import-contracts.test.js
npm run test:mf7:imports
```

Resultado esperado:

- O teste compila.
- `npm run test:mf7:imports` passa.
- Pelo menos quatro negativos ficam cobertos.
- O input de log não contém campos inexistentes.

7. Cenário negativo/erro esperado.

Altera temporariamente o teste para esperar `details` no log. Resultado esperado: o teste falha, porque esse campo não pertence ao contrato persistido.

### Passo 7 - Fechar evidence e handoff para BK-MF7-07

1. Objetivo funcional do passo no contexto da app.

Guardar prova objetiva para PR/defesa e deixar o próximo BK com contexto suficiente para reutilizar logs de integração.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/evidence/mf7-imports.md`
    - REVER: `apps/api/src/modules/imports/importFileParser.js`
    - REVER: `apps/api/src/modules/imports/businessImportService.js`
    - REVER: `apps/api/tests/contracts/mf7-import-contracts.test.js`
    - LOCALIZAÇÃO: pasta `evidence` da API.

3. Instruções do que fazer.

Cria o ficheiro de evidence e preenche outputs reais quando executares os comandos. Não inventes resultados: se um comando falhar, regista o erro observado.

4. Código completo, correto e integrado com a app final.

````md
# Evidence MF7 - importações CSV e Excel

- BK: BK-MF7-06
- RNF: RNF23
- Responsável: Oleksii
- Apoio: Pedro
- Data:

## Comandos executados

```bash
cd apps/api
npx prisma validate
node --check src/modules/imports/importFileParser.js
node --check src/modules/imports/businessImportValidators.js
node --check src/modules/imports/businessImportService.js
node --check tests/contracts/mf7-import-contracts.test.js
npm run test:mf7:imports
```

## Resultados esperados

- CSV válido: HTTP 201, `acceptedRows > 0`, `rejectedRows = 0`.
- Excel válido: HTTP 201, `sourceFormat = XLSX` no percurso interno e linhas aceites.
- Formato inválido: HTTP 400, `INVALID_IMPORT_FILE_FORMAT`.
- CSV vazio: HTTP 400, `INVALID_IMPORT_CSV`.
- Excesso de linhas: HTTP 413, `IMPORT_TOO_LARGE`.
- Extrato com conta inexistente: HTTP 404, `TREASURY_ACCOUNT_NOT_FOUND`.

## Evidência de log

Registar o id de `BusinessImportRun` e confirmar que existe `IntegrationLog` com:

- `operation = IMPORT`
- `sourceId` igual ao id da importação
- `fileName` com nome curto do ficheiro
- `totalRows`, `successRows` e `errorRows`
- sem conteúdo completo do ficheiro

## Handoff para BK-MF7-07

O próximo BK pode consultar os logs de integração para confirmar que importações críticas deixam rasto operacional antes de avançar para readiness fiscal.
````

Explicação do código:

O ficheiro de evidence não implementa lógica, mas é parte da entrega porque transforma a validação em prova reprodutível. Ele lista comandos, resultados esperados e campos que devem existir no log.

A evidence deve ser preenchida com outputs reais. Se `npx prisma validate` exigir migration, a equipa regista essa etapa no PR. Se a API local não tiver sessão autenticada, o smoke HTTP fica registado como bloqueado por ambiente, mas os testes contratuais continuam a provar o core do BK.

5. Explicação do código.

A explicação do bloco está acima. A evidence fecha o ciclo pedagógico: implementar, testar, observar, registar e entregar.

6. Validação do passo.

Confirma:

- `apps/api/evidence/mf7-imports.md` existe.
- O ficheiro tem comandos executados e resultados.
- Pelo menos um caso positivo e quatro negativos foram registados.
- O handoff menciona `BK-MF7-07`.

7. Cenário negativo/erro esperado.

Se a evidence disser que `npm run test:mf7:imports` passou sem output real, corrige a evidence. Resultado esperado: só ficam declarações que a equipa conseguiu executar ou justificar.

#### Critérios de aceite

- `RNF23` fica coberto por CSV e Excel lidos no backend.
- `POST /api/imports/business-data` continua a ser o endpoint único para importações de negócio.
- A route mantém autenticação, empresa ativa, permissão e role no backend.
- `BusinessImportRun` é criado com totais de linhas aceites e rejeitadas.
- `AuditLog` é criado para a operação sensível.
- `IntegrationLog` usa `userId`, `operation`, `sourceId`, `fileName`, `totalRows`, `successRows`, `errorRows` e `message`.
- O modelo de logs não recebe campos inexistentes.
- Excel é parseado com `exceljs`, não apenas validado por extensão.
- Ficheiros vazios, formato inválido, tipo inválido, falta de conta de tesouraria e excesso de linhas falham de forma controlada.
- Negativos: minimo `5` cenários cobertos por formato inválido, CSV vazio, excesso de linhas, tipo inválido e conta de tesouraria inexistente.
- `npm run test:mf7:imports` existe e passa.
- A evidence contém comandos e resultados observáveis.

#### Validação final

Executa:

```bash
cd apps/api
npx prisma validate
node --check src/modules/imports/importFileParser.js
node --check src/modules/imports/businessImportValidators.js
node --check src/modules/treasury/statementImportValidators.js
node --check src/modules/imports/businessImportService.js
node --check src/modules/imports/businessImportRoutes.js
node --check tests/contracts/mf7-import-contracts.test.js
npm run test:mf7:imports
npm run test:contracts
```

Resultado esperado:

- Todos os ficheiros JavaScript compilam.
- O teste `mf7-import-contracts.test.js` passa.
- A suite de contratos geral continua a passar ou, se falhar por dívida anterior, o erro fica registado na evidence.
- `npx prisma validate` passa depois de atualizar o enum.

#### Evidence para PR/defesa

- `pr`: link ou referência do PR.
- `proof`: outputs de `npx prisma validate`, `node --check`, `npm run test:mf7:imports` e `npm run test:contracts`.
- `positive`: CSV válido e Excel válido com HTTP `201`.
- `negative`: formato inválido, CSV vazio, excesso de linhas, tipo inválido e conta de tesouraria inexistente.
- `log`: id de `BusinessImportRun` e id de `IntegrationLog`.
- `multiempresa`: confirmação de que a empresa vem do contexto autenticado do backend.

#### Handoff

- Proximo BK recomendado: `BK-MF7-07`.
- Este BK entrega ao próximo BK um padrão de logs de integração com contagens, ficheiro, origem e utilizador.
- `BK-MF7-07` deve reutilizar a mesma disciplina: validar antes de gerar ficheiro, registar operação e deixar evidence honesta.
- Risco documental restante: a dependência formal continua `-` no header canónico; a equipa deve reconciliar matriz/backlog numa execução própria se decidir tornar explícitas as dependências de MF3, MF6 e MF7-05.

#### Changelog

- `2026-06-26`: guia corrigido para parser CSV/Excel real, validator, service integrado, logs com contrato correto, testes, script, evidence e handoff para `BK-MF7-07`.
