# BK-MF3-05 - Importar CSV/Excel de clientes, fornecedores, artigos e extratos.

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
- `last_updated`: `2026-06-15`

#### Objetivo

Neste BK vais implementar importações operacionais de clientes, fornecedores, artigos e extratos em CSV. Para Excel, o MVP aceita ficheiro previamente exportado para CSV, mantendo validação por linha.

#### Importância

RF35 reduz entrada manual de dados, mas só é seguro se cada linha for validada antes de gravar. Dados importados alimentam faturação, compras, SAF-T e reporting.

#### Scope-in

- Importar `CUSTOMERS`, `SUPPLIERS`, `ITEMS` e `STATEMENTS`.
- Validar colunas obrigatórias por tipo.
- Fazer `upsert` por empresa em dados mestre.
- Guardar resumo e erros por linha em `BusinessImportRun`.

#### Scope-out

- OCR.
- Ficheiros binários Excel lidos diretamente.
- Importação sem revisão de erros.

#### Estado antes e depois

- Estado antes: importações eram apenas resumo.
- Estado depois: linhas válidas criam ou atualizam dados reais por empresa.

#### Pre-requisitos

- Rever RF35 e RNF23.
- Rever BK-MF0-09, BK-MF0-10, BK-MF0-11, BK-MF3-02 e BK-MF3-03.
- Confirmar validações de NIF, SKU, preço, custo, IVA e conta de tesouraria.

#### Glossário

- **Import run:** execução de importação com totais e erros.
- **Upsert:** criar se não existe, atualizar se existe.
- **Linha rejeitada:** linha com erro que não deve gravar dados.
- **CSV:** formato textual usado no MVP.

#### Conceitos teóricos essenciais

- Importar dados é uma operação sensível porque altera dados mestre.
- O backend valida cada linha; o frontend apenas ajuda o utilizador.
- O `companyId` impede que uma linha importada entre noutra empresa.
- Logs de erro por linha ajudam defesa e correção pelo aluno.

#### Arquitetura do BK

- Endpoint: `POST /api/imports/business-data`.
- Roles: `ADMIN`, `CONTABILISTA`.
- Modelos: `BusinessImportRun`, `Customer`, `Supplier`, `Item`, `BankStatementImport`.
- Frontend: `BusinessImportPage`.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/api/src/modules/imports/businessImportValidators.js`
- CRIAR: `real_dev/api/src/modules/imports/businessImportService.js`
- CRIAR: `real_dev/api/src/modules/imports/businessImportRoutes.js`
- CRIAR: `real_dev/web/src/lib/importApi.ts`
- CRIAR: `real_dev/web/src/pages/BusinessImportPage.tsx`
- EDITAR: `real_dev/api/prisma/schema.prisma`
- EDITAR: `real_dev/api/src/server.js`
- EDITAR: `real_dev/web/src/App.tsx`
- REVER: BK-MF0-09, BK-MF0-10, BK-MF0-11, BK-MF3-02, BK-MF3-03.

#### Tutorial técnico linear

### Passo 1 - Confirmar tipos de importação

1. Objetivo funcional do passo no ERP.

Definir tipos aceites e não misturar clientes, fornecedores, artigos e extratos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: RF35, RNF23.
    - LOCALIZAÇÃO: documentos canónicos.

3. Instruções do que fazer.

Regista os tipos: `CUSTOMERS`, `SUPPLIERS`, `ITEMS`, `STATEMENTS`.

- `CANONICO`: RF35 cobre importação de clientes, fornecedores, artigos e extratos.
- `DERIVADO`: nesta entrega, Excel é suportado como ficheiro exportado para CSV antes do upload; leitura nativa de `.xlsx` exigiria uma dependência não definida no contrato de stack.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o primeiro erro comum e tratar todos os ficheiros como iguais.

6. Validação do passo.

Evidence deve listar colunas por tipo.

7. Cenário negativo/erro esperado.

Tipo desconhecido deve ser rejeitado.

### Passo 2 - Modelar execução de importação

1. Objetivo funcional do passo no ERP.

Guardar totais e erros da importação.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `real_dev/api/prisma/schema.prisma`
    - REVER: modelos de dados mestre.
    - LOCALIZAÇÃO: zona de importações.

3. Instruções do que fazer.

Adiciona `BusinessImportRun`.

4. Código completo, correto e integrado com a app final.

```prisma
/// Execução de importação operacional por empresa.
/// Guarda totais e erros por linha para auditoria, correção e defesa do aluno.
model BusinessImportRun {
  id           String   @id @default(uuid())
  companyId    String
  type         String
  fileName     String
  totalRows    Int
  acceptedRows Int
  rejectedRows Int
  errors       Json?
  importedById String
  importedAt   DateTime @default(now())

  @@index([companyId, type, importedAt])
}
```

5. Explicação do código.

O modelo guarda a evidencia da importação. `errors` contem linhas rejeitadas e motivo.

6. Validação do passo.

Migration deve criar a tabela.

7. Cenário negativo/erro esperado.

Sem resumo, a equipa não consegue provar que linhas falharam.

### Passo 3 - Validar payload e CSV

1. Objetivo funcional do passo no ERP.

Transformar CSV em objetos e validar campos obrigatórios.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/imports/businessImportValidators.js`
    - EDITAR: nenhum.
    - REVER: regras de NIF/SKU/IVA dos BKs anteriores.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

CSV usa cabeçalho na primeira linha.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/imports/businessImportValidators.js
import { httpError } from "../../lib/httpErrors.js";

const importTypes = new Set(["CUSTOMERS", "SUPPLIERS", "ITEMS", "STATEMENTS"]);

/**
 * Parseia CSV separado por ponto e vírgula com cabeçalho na primeira linha.
 *
 * @param {string} content Conteúdo CSV textual.
 * @returns {Array<{ lineNumber: number, row: Record<string, string>, errors: string[] }>} Linhas com número original e lista de erros.
 */
function parseCsv(content) {
    const [headerLine, ...lines] = content.split(/\r?\n/).filter(Boolean);
    const headers = headerLine.split(";").map((header) => header.trim());
    return lines.map((line, index) => {
        const values = line.split(";");
        const row = Object.fromEntries(headers.map((header, position) => [header, values[position]?.trim() ?? ""]));
        return { lineNumber: index + 2, row, errors: [] };
    });
}

/**
 * Marca uma coluna obrigatória como erro da linha quando esta vazia.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validação.
 * @param {string} column Nome da coluna.
 * @returns {void}
 */
function requireColumn(parsedRow, column) {
    if (!parsedRow.row[column]) parsedRow.errors.push(`${column} é obrigatório`);
}

/**
 * Valida uma coluna de data.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validação.
 * @param {string} column Nome da coluna.
 * @returns {void}
 */
function requireDate(parsedRow, column) {
    requireColumn(parsedRow, column);
    if (parsedRow.row[column] && Number.isNaN(new Date(parsedRow.row[column]).getTime())) {
        parsedRow.errors.push(`${column} deve ser uma data válida`);
    }
}

/**
 * Valida uma coluna monetária textual em euros.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validação.
 * @param {string} column Nome da coluna.
 * @returns {void}
 */
function requireAmount(parsedRow, column) {
    requireColumn(parsedRow, column);
    const amount = Number(String(parsedRow.row[column]).replace(",", "."));
    if (parsedRow.row[column] && !Number.isFinite(amount)) {
        parsedRow.errors.push(`${column} deve ser um valor numérico`);
    }
}

/**
 * Valida uma coluna numérica inteira.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validação.
 * @param {string} column Nome da coluna.
 * @param {{ min?: number, max?: number }} options Limites aceites.
 * @returns {void}
 */
function requireInteger(parsedRow, column, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
    requireColumn(parsedRow, column);
    const value = Number(parsedRow.row[column]);
    if (parsedRow.row[column] && (!Number.isInteger(value) || value < min || value > max)) {
        parsedRow.errors.push(`${column} deve ser um inteiro válido`);
    }
}

/**
 * Valida a importação completa antes de qualquer escrita em base de dados.
 *
 * @param {{ type?: unknown, fileName?: unknown, content?: unknown }} body Body HTTP da route.
 * @returns {{ type: "CUSTOMERS" | "SUPPLIERS" | "ITEMS" | "STATEMENTS", fileName: string, rows: Array<{ lineNumber: number, row: Record<string, string>, errors: string[] }> }} DTO validado para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 para tipo ou conteúdo inválido.
 */
export function validateBusinessImportPayload(body) {
    const type = String(body.type ?? "").toUpperCase();
    if (!importTypes.has(type)) throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importação inválido");
    if (typeof body.content !== "string" || body.content.trim() === "") throw httpError(400, "INVALID_IMPORT_FILE", "Conteúdo CSV obrigatório");

    const parsedRows = parseCsv(body.content);
    for (const parsedRow of parsedRows) {
        if (type === "CUSTOMERS" || type === "SUPPLIERS") {
            requireColumn(parsedRow, "name");
            requireColumn(parsedRow, "nif");
        }
        if (type === "ITEMS") {
            requireColumn(parsedRow, "sku");
            requireColumn(parsedRow, "name");
            requireInteger(parsedRow, "costCents", { min: 0 });
            requireInteger(parsedRow, "priceCents", { min: 1 });
            requireInteger(parsedRow, "vatRateBps", { min: 0, max: 10000 });
        }
        if (type === "STATEMENTS") {
            requireColumn(parsedRow, "treasuryAccountId");
            requireDate(parsedRow, "bookedAt");
            requireColumn(parsedRow, "description");
            requireAmount(parsedRow, "amount");
        }
    }

    return { type, fileName: String(body.fileName ?? "import.csv"), rows: parsedRows };
}
```

5. Explicação do código.

O validator separa parsing de gravação. Cada linha recebe lista de erros para que o service grave apenas linhas sem erros. Em artigos, `costCents`, `priceCents` e `vatRateBps` seguem o contrato de `Item` criado no `BK-MF0-11`. Em extratos bancários, `treasuryAccountId`, `bookedAt`, `description` e `amount` são obrigatórios porque o `BK-MF3-03` guarda cada movimento com conta, data, descrição e valor. O JSDoc explicita que o input é CSV textual; Excel nativo não é prometido nesta entrega.

6. Validação do passo.

CSV de cliente sem NIF gera erro na linha. CSV de artigo sem `costCents` ou `priceCents` fica rejeitado. CSV de extrato sem `bookedAt` ou com `amount` inválido também fica rejeitado.

7. Cenário negativo/erro esperado.

Tipo `PRODUCTS` devolve `400 INVALID_IMPORT_TYPE`.

### Passo 4 - Implementar service de upsert

1. Objetivo funcional do passo no ERP.

Gravar linhas válidas e rejeitar linhas com erro.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/imports/businessImportService.js`
    - EDITAR: nenhum.
    - REVER: services de dados mestre.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Usa transação e `companyId` da sessão.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/imports/businessImportService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte valor textual em euros para cêntimos.
 *
 * @param {unknown} value Valor como `10.50` ou `10,50`.
 * @returns {number} Valor em cêntimos.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o valor não é numérico.
 */
function eurosToCents(value) {
    const amount = Number(String(value).replace(",", "."));
    if (!Number.isFinite(amount)) throw httpError(400, "INVALID_IMPORT_AMOUNT", "Valor inválido na importação");
    return Math.round(amount * 100);
}

/**
 * Valida campo monetario que já chega em cêntimos.
 *
 * @param {unknown} value Valor vindo da linha CSV.
 * @param {string} fieldName Campo para mensagem de erro.
 * @param {{ allowZero?: boolean }} options Permite ou bloqueia zero.
 * @returns {number} Cêntimos validados.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando não é inteiro válido.
 */
function integerCents(value, fieldName, { allowZero = true } = {}) {
    const cents = Number(value);
    if (!Number.isInteger(cents) || cents < 0 || (!allowZero && cents === 0)) {
        throw httpError(400, "INVALID_IMPORT_AMOUNT", `${fieldName} deve estar em cêntimos`);
    }
    return cents;
}

/**
 * Valida taxa de IVA em basis points.
 *
 * @param {unknown} value Valor CSV.
 * @returns {number} Taxa entre 0 e 10000.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando fora do intervalo.
 */
function vatRateBps(value) {
    const bps = Number(value);
    if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
        throw httpError(400, "INVALID_IMPORT_VAT", "vatRateBps deve estar entre 0 e 10000");
    }
    return bps;
}

/**
 * Faz upsert de uma linha válida de dados mestre.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx Transação Prisma.
 * @param {string} companyId Empresa ativa.
 * @param {"CUSTOMERS" | "SUPPLIERS" | "ITEMS"} type Tipo de importação.
 * @param {Record<string, string>} row Linha CSV validada.
 * @returns {Promise<object>} Registo criado ou atualizado.
 */
async function upsertRow(tx, companyId, type, row) {
    if (type === "CUSTOMERS") return tx.customer.upsert({ where: { companyId_nif: { companyId, nif: row.nif } }, update: { name: row.name }, create: { companyId, name: row.name, nif: row.nif } });
    if (type === "SUPPLIERS") return tx.supplier.upsert({ where: { companyId_nif: { companyId, nif: row.nif } }, update: { name: row.name }, create: { companyId, name: row.name, nif: row.nif } });
    if (type === "ITEMS") {
        const itemData = {
            name: row.name,
            costCents: integerCents(row.costCents, "costCents"),
            priceCents: integerCents(row.priceCents, "priceCents", { allowZero: false }),
            vatRateBps: vatRateBps(row.vatRateBps),
            type: "PRODUCT",
        };
        return tx.item.upsert({
            where: { companyId_sku: { companyId, sku: row.sku } },
            update: itemData,
            create: { companyId, sku: row.sku, ...itemData },
        });
    }
    throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importação inválido");
}

/**
 * Importa linhas de extrato reaproveitando os modelos do BK-MF3-03.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx Transação Prisma.
 * @param {string} companyId Empresa ativa.
 * @param {string} userId Utilizador autenticado.
 * @param {string} fileName Nome do ficheiro importado.
 * @param {Array<{ row: Record<string, string> }>} parsedRows Linhas válidas de extrato.
 * @returns {Promise<void>}
 * @throws {import("../../lib/httpErrors.js").HttpError} 404 quando uma conta não pertence a empresa.
 */
async function importStatementRows(tx, companyId, userId, fileName, parsedRows) {
    if (parsedRows.length === 0) return;

    const accountIds = [...new Set(parsedRows.map((item) => item.row.treasuryAccountId))];
    const accounts = await tx.treasuryAccount.findMany({
        where: { companyId, isActive: true, id: { in: accountIds } },
        select: { id: true },
    });
    const allowedAccountIds = new Set(accounts.map((account) => account.id));
    const missingAccountId = accountIds.find((id) => !allowedAccountIds.has(id));
    if (missingAccountId) {
        throw httpError(404, "TREASURY_ACCOUNT_NOT_FOUND", "Conta de tesouraria não encontrada nesta empresa");
    }

    for (const accountId of accountIds) {
        const rowsForAccount = parsedRows.filter((item) => item.row.treasuryAccountId === accountId);
        // Cada conta gera um BankStatementImport próprio para manter o log de integração por conta.
        const statementImport = await tx.bankStatementImport.create({
            data: {
                companyId,
                treasuryAccountId: accountId,
                fileName,
                format: "CSV",
                status: "IMPORTED",
                totalLines: rowsForAccount.length,
                validLines: rowsForAccount.length,
                errorLines: 0,
                importedById: userId,
            },
        });

        await tx.bankStatementLine.createMany({
            data: rowsForAccount.map((item) => ({
                companyId,
                importId: statementImport.id,
                bookedAt: new Date(item.row.bookedAt),
                description: item.row.description,
                reference: item.row.reference || null,
                amountCents: eurosToCents(item.row.amount),
            })),
            skipDuplicates: true,
        });
    }
}

/**
 * Importa dados operacionais por empresa e regista resumo da execução.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, payload: { type: "CUSTOMERS" | "SUPPLIERS" | "ITEMS" | "STATEMENTS", fileName: string, rows: Array<{ lineNumber: number, row: Record<string, string>, errors: string[] }> } }} input Contexto seguro e payload validado.
 * @returns {Promise<object>} `BusinessImportRun` com totais e erros.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa.
 */
export async function importBusinessData(prisma, { companyId, userId, payload }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const validRows = payload.rows.filter((item) => item.errors.length === 0);
    const rejectedRows = payload.rows.filter((item) => item.errors.length > 0);

    return prisma.$transaction(async (tx) => {
        if (payload.type === "STATEMENTS") {
            await importStatementRows(tx, companyId, userId, payload.fileName, validRows);
        } else {
            for (const parsedRow of validRows) {
                // O upsert é sempre filtrado por companyId para impedir mistura entre empresas.
                await upsertRow(tx, companyId, payload.type, parsedRow.row);
            }
        }

        return tx.businessImportRun.create({
            data: {
                companyId,
                type: payload.type,
                fileName: payload.fileName,
                totalRows: payload.rows.length,
                acceptedRows: validRows.length,
                rejectedRows: rejectedRows.length,
                errors: rejectedRows.length > 0 ? { rows: rejectedRows } : undefined,
                importedById: userId,
            },
        });
    });
}
```

5. Explicação do código.

O service faz upsert por empresa e identificador natural. Clientes e fornecedores usam NIF; artigos usam SKU e gravam os campos obrigatórios de `Item`: `costCents`, `priceCents`, `vatRateBps` e `type`. Quando o tipo é `STATEMENTS`, o service confirma que a conta de tesouraria pertence a empresa ativa e cria `BankStatementImport` com `BankStatementLine`, reutilizando os modelos do `BK-MF3-03`. Linhas inválidas não gravam dados. O JSDoc e os comentários mostram os efeitos secundários e a regra multiempresa.

6. Validação do passo.

Importa cliente novo e repete o CSV com outro nome para confirmar update. Importa artigo com `sku`, `name`, `costCents`, `priceCents` e `vatRateBps`, e confirma que existe `Item` completo. Para extratos, importa uma linha com `treasuryAccountId`, `bookedAt`, `description`, `reference` e `amount`, e confirma que existe `BankStatementLine`.

7. Cenário negativo/erro esperado.

Linha com NIF vazio aumenta `rejectedRows`. Artigo sem `priceCents` aumenta `rejectedRows`. Extrato com conta de outra empresa devolve `404 TREASURY_ACCOUNT_NOT_FOUND`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Permitir importações apenas a roles autorizadas.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/api/src/modules/imports/businessImportRoutes.js`
    - EDITAR: `real_dev/api/src/server.js`
    - REVER: middlewares.
    - LOCALIZAÇÃO: ficheiro completo e montagem.

3. Instruções do que fazer.

Cria `POST /api/imports/business-data`.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/api/src/modules/imports/businessImportRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateBusinessImportPayload } from "./businessImportValidators.js";
import { importBusinessData } from "./businessImportService.js";

/**
 * Constrói as routes de importação operacional.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/imports/business-data`.
 */
export function buildBusinessImportRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "CONTABILISTA")];
    router.post("/", guards, async (req, res) => {
        try {
            const payload = validateBusinessImportPayload(req.body);
            // A role e o companyId são verificados no backend antes de qualquer escrita sensível.
            return res.status(201).json(await importBusinessData(prisma, { companyId: req.companyId, userId: req.user.id, payload }));
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });
    return router;
}
```

```js
// real_dev/api/src/server.js
import { buildBusinessImportRoutes } from "./modules/imports/businessImportRoutes.js";

app.use("/api/imports/business-data", buildBusinessImportRoutes({ prisma }));
```

5. Explicação do código.

A route valida sessão, empresa e role. Depois valida o ficheiro e grava os dados por empresa. O comentário dentro da route relembra que importação altera dados mestre e, por isso, não pode depender de permissão apenas no frontend.

6. Validação do passo.

`POST` com `CONTABILISTA` devolve `201`.

7. Cenário negativo/erro esperado.

`OPERACIONAL` recebe `403`.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Enviar CSV ao backend com tipo controlado.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/lib/importApi.ts`
    - EDITAR: nenhum.
    - REVER: cliente frontend.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria payload tipado.

4. Código completo, correto e integrado com a app final.

```ts
// real_dev/web/src/lib/importApi.ts
import { apiClient } from "./apiClient";

/**
 * Tipos de importação aceites pela API.
 */
export type BusinessImportType = "CUSTOMERS" | "SUPPLIERS" | "ITEMS" | "STATEMENTS";

/**
 * Envia CSV operacional para importação backend.
 *
 * @param {BusinessImportType} type Tipo de entidade a importar.
 * @param {string} fileName Nome do ficheiro original.
 * @param {string} content Conteúdo CSV textual.
 * @returns {Promise<{ id: string, acceptedRows: number, rejectedRows: number }>} Resumo da importação.
 */
export async function importBusinessData(type: BusinessImportType, fileName: string, content: string) {
    return apiClient.post<{ id: string; acceptedRows: number; rejectedRows: number }>("/api/imports/business-data", { type, fileName, content });
}
```

5. Explicação do código.

O tipo limita opções no frontend, mas o backend continua a validar. O cliente reutiliza `apiClient`, portanto o cookie seguro segue com o pedido sem duplicar `fetch`.

6. Validação do passo.

Confirma payload enviado no separador Network.

7. Cenário negativo/erro esperado.

Erro de role aparece como mensagem.

### Passo 7 - Criar página de importação

1. Objetivo funcional do passo no ERP.

Permitir escolher tipo, colar CSV e ver resultado.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/pages/BusinessImportPage.tsx`
    - EDITAR: `real_dev/web/src/App.tsx`
    - REVER: `importApi.ts`.
    - LOCALIZAÇÃO: ficheiro completo e menu.

3. Instruções do que fazer.

Usa `textarea` para CSV e feedback de linhas.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/pages/BusinessImportPage.tsx
import { FormEvent, useState } from "react";
import { importBusinessData, type BusinessImportType } from "../lib/importApi";

/**
 * Página de importação CSV de dados operacionais.
 *
 * Gere estados de loading, erro e sucesso. A validação completa é feita no backend, porque o utilizador
 * pode alterar manualmente o HTML ou enviar pedidos fora da UI.
 *
 * @returns {JSX.Element} Interface de importação.
 */
export function BusinessImportPage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // O frontend recolhe CSV textual; o backend decide linha a linha o que pode ser gravado.
            const result = await importBusinessData(String(form.get("type")) as BusinessImportType, String(form.get("fileName")), String(form.get("content")));
            setMessage(`Importação concluída: ${result.acceptedRows} aceites, ${result.rejectedRows} rejeitadas.`);
        } catch (err) {
            setMessage("");
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Importar dados operacionais</h1>
            <form onSubmit={handleSubmit}>
                <select name="type" defaultValue="CUSTOMERS"><option value="CUSTOMERS">Clientes</option><option value="SUPPLIERS">Fornecedores</option><option value="ITEMS">Artigos</option><option value="STATEMENTS">Extratos</option></select>
                <input name="fileName" defaultValue="import.csv" required />
                <textarea name="content" rows={12} required />
                <button disabled={loading}>{loading ? "A importar..." : "Importar CSV"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {message && <p>{message}</p>}
        </main>
    );
}
```

5. Explicação do código.

A página dá feedback imediato. O CSV continua validado no backend, que decide que linhas entram. O JSDoc e o comentário ajudam o aluno a perceber que a UI não é uma fronteira de segurança.

6. Validação do passo.

Importa um CSV com uma linha válida e outra inválida.

7. Cenário negativo/erro esperado.

CSV vazio devolve erro.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Confirmar que dados mestres importados alimentam SAF-T e relatórios.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence.
    - REVER: service e dados criados.
    - LOCALIZAÇÃO: checklist final.

3. Instruções do que fazer.

Regista antes/depois de uma importação.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo.

5. Explicação do código.

A prova mostra que importação não é apenas resumo: cria dados reais.

6. Validação do passo.

Confirma cliente/artigo criado na base.

7. Cenário negativo/erro esperado.

Linha inválida aparece em `errors`.

## Expected results

- `201` com `acceptedRows` e `rejectedRows`.
- Dados válidos gravados por empresa.
- Extratos válidos gravados em `BankStatementImport` e `BankStatementLine`.
- Dados inválidos registados em `errors`.
- `403` para role sem permissão.

## Critérios de aceite

- CSV validado por tipo.
- Upsert por empresa.
- Extratos associados a contas de tesouraria da empresa ativa.
- Erros por linha registados.
- Sem tokens no frontend.
- Excel nativo `.xlsx` fica fora desta entrega; Excel é usado exportando para CSV.

## Validação final

- Confirmar imports.
- Confirmar transação.
- Confirmar evidence.

## Evidence para PR/defesa

- CSV usado.
- JSON da importação.
- Prova de linha rejeitada.

## Handoff

BK-MF3-06 usa dados mestres consistentes para exportação SAF-T.

## Changelog

- `2026-06-15`: alinhados caminhos técnicos da MF3 com `real_dev/api` e `real_dev/web`, preservando contratos RF/RNF, dependências e escopo.
- `2026-06-13`: corrigido para validar CSV, gravar dados reais por tipo, usar `apiClient`, documentar limite Excel->CSV e registar erros por linha com JSDoc.
- `2026-06-13`: alinhado com `BK-MF3-03`, passando a gravar importações de extratos em `BankStatementImport` e `BankStatementLine`.
