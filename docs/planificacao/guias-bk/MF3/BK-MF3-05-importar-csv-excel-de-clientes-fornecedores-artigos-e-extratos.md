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
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais implementar importacoes operacionais de clientes, fornecedores, artigos e extratos em CSV. Para Excel, o MVP aceita ficheiro previamente exportado para CSV, mantendo validação por linha.

#### Importancia

RF35 reduz entrada manual de dados, mas so e seguro se cada linha for validada antes de gravar. Dados importados alimentam faturacao, compras, SAF-T e reporting.

#### Scope-in

- Importar `CUSTOMERS`, `SUPPLIERS`, `ITEMS` e `STATEMENTS`.
- Validar colunas obrigatorias por tipo.
- Fazer `upsert` por empresa em dados mestre.
- Guardar resumo e erros por linha em `BusinessImportRun`.

#### Scope-out

- OCR.
- Ficheiros binarios Excel lidos diretamente.
- Importacao sem revisao de erros.

#### Estado antes e depois

- Estado antes: importacoes eram apenas resumo.
- Estado depois: linhas validas criam ou atualizam dados reais por empresa.

#### Pre-requisitos

- Rever RF35 e RNF23.
- Rever BK-MF0-09, BK-MF0-10, BK-MF0-11, BK-MF3-02 e BK-MF3-03.
- Confirmar validacoes de NIF, SKU, preco, custo, IVA e conta de tesouraria.

#### Glossario

- **Import run:** execucao de importacao com totais e erros.
- **Upsert:** criar se nao existe, atualizar se existe.
- **Linha rejeitada:** linha com erro que nao deve gravar dados.
- **CSV:** formato textual usado no MVP.

#### Conceitos teoricos essenciais

- Importar dados e uma operacao sensivel porque altera dados mestre.
- O backend valida cada linha; o frontend apenas ajuda o utilizador.
- O `companyId` impede que uma linha importada entre noutra empresa.
- Logs de erro por linha ajudam defesa e correcao pelo aluno.

#### Arquitetura do BK

- Endpoint: `POST /api/imports/business-data`.
- Roles: `ADMIN`, `CONTABILISTA`.
- Modelos: `BusinessImportRun`, `Customer`, `Supplier`, `Item`, `BankStatementImport`.
- Frontend: `BusinessImportPage`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/imports/businessImportValidators.js`
- CRIAR: `apps/api/src/modules/imports/businessImportService.js`
- CRIAR: `apps/api/src/modules/imports/businessImportRoutes.js`
- CRIAR: `apps/web/src/lib/importApi.ts`
- CRIAR: `apps/web/src/pages/BusinessImportPage.tsx`
- EDITAR: `apps/api/prisma/schema.prisma`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/App.tsx`
- REVER: BK-MF0-09, BK-MF0-10, BK-MF0-11, BK-MF3-02, BK-MF3-03.

#### Tutorial tecnico linear

### Passo 1 - Confirmar tipos de importacao

1. Objetivo funcional do passo no ERP.

Definir tipos aceites e nao misturar clientes, fornecedores, artigos e extratos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: RF35, RNF23.
    - LOCALIZACAO: documentos canonicos.

3. Instrucoes do que fazer.

Regista os tipos: `CUSTOMERS`, `SUPPLIERS`, `ITEMS`, `STATEMENTS`.

- `CANONICO`: RF35 cobre importacao de clientes, fornecedores, artigos e extratos.
- `DERIVADO`: nesta entrega, Excel e suportado como ficheiro exportado para CSV antes do upload; leitura nativa de `.xlsx` exigiria uma dependencia nao definida no contrato de stack.

4. Codigo completo, correto e integrado com a app final.

Sem codigo neste passo.

5. Explicacao do codigo.

Nao ha codigo porque o primeiro erro comum e tratar todos os ficheiros como iguais.

6. Validacao do passo.

Evidence deve listar colunas por tipo.

7. Cenario negativo/erro esperado.

Tipo desconhecido deve ser rejeitado.

### Passo 2 - Modelar execucao de importacao

1. Objetivo funcional do passo no ERP.

Guardar totais e erros da importacao.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: modelos de dados mestre.
    - LOCALIZACAO: zona de importacoes.

3. Instrucoes do que fazer.

Adiciona `BusinessImportRun`.

4. Codigo completo, correto e integrado com a app final.

```prisma
/// Execucao de importacao operacional por empresa.
/// Guarda totais e erros por linha para auditoria, correcao e defesa do aluno.
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

5. Explicacao do codigo.

O modelo guarda a evidencia da importacao. `errors` contem linhas rejeitadas e motivo.

6. Validacao do passo.

Migration deve criar a tabela.

7. Cenario negativo/erro esperado.

Sem resumo, a equipa nao consegue provar que linhas falharam.

### Passo 3 - Validar payload e CSV

1. Objetivo funcional do passo no ERP.

Transformar CSV em objetos e validar campos obrigatorios.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/imports/businessImportValidators.js`
    - EDITAR: nenhum.
    - REVER: regras de NIF/SKU/IVA dos BKs anteriores.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

CSV usa cabecalho na primeira linha.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/imports/businessImportValidators.js
import { httpError } from "../../lib/httpErrors.js";

const importTypes = new Set(["CUSTOMERS", "SUPPLIERS", "ITEMS", "STATEMENTS"]);

/**
 * Parseia CSV separado por ponto e virgula com cabecalho na primeira linha.
 *
 * @param {string} content Conteudo CSV textual.
 * @returns {Array<{ lineNumber: number, row: Record<string, string>, errors: string[] }>} Linhas com numero original e lista de erros.
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
 * Marca uma coluna obrigatoria como erro da linha quando esta vazia.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validacao.
 * @param {string} column Nome da coluna.
 * @returns {void}
 */
function requireColumn(parsedRow, column) {
    if (!parsedRow.row[column]) parsedRow.errors.push(`${column} e obrigatorio`);
}

/**
 * Valida uma coluna de data.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validacao.
 * @param {string} column Nome da coluna.
 * @returns {void}
 */
function requireDate(parsedRow, column) {
    requireColumn(parsedRow, column);
    if (parsedRow.row[column] && Number.isNaN(new Date(parsedRow.row[column]).getTime())) {
        parsedRow.errors.push(`${column} deve ser uma data valida`);
    }
}

/**
 * Valida uma coluna monetaria textual em euros.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validacao.
 * @param {string} column Nome da coluna.
 * @returns {void}
 */
function requireAmount(parsedRow, column) {
    requireColumn(parsedRow, column);
    const amount = Number(String(parsedRow.row[column]).replace(",", "."));
    if (parsedRow.row[column] && !Number.isFinite(amount)) {
        parsedRow.errors.push(`${column} deve ser um valor numerico`);
    }
}

/**
 * Valida uma coluna numerica inteira.
 *
 * @param {{ row: Record<string, string>, errors: string[] }} parsedRow Linha em validacao.
 * @param {string} column Nome da coluna.
 * @param {{ min?: number, max?: number }} options Limites aceites.
 * @returns {void}
 */
function requireInteger(parsedRow, column, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
    requireColumn(parsedRow, column);
    const value = Number(parsedRow.row[column]);
    if (parsedRow.row[column] && (!Number.isInteger(value) || value < min || value > max)) {
        parsedRow.errors.push(`${column} deve ser um inteiro valido`);
    }
}

/**
 * Valida a importacao completa antes de qualquer escrita em base de dados.
 *
 * @param {{ type?: unknown, fileName?: unknown, content?: unknown }} body Body HTTP da route.
 * @returns {{ type: "CUSTOMERS" | "SUPPLIERS" | "ITEMS" | "STATEMENTS", fileName: string, rows: Array<{ lineNumber: number, row: Record<string, string>, errors: string[] }> }} DTO validado para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 para tipo ou conteudo invalido.
 */
export function validateBusinessImportPayload(body) {
    const type = String(body.type ?? "").toUpperCase();
    if (!importTypes.has(type)) throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importacao invalido");
    if (typeof body.content !== "string" || body.content.trim() === "") throw httpError(400, "INVALID_IMPORT_FILE", "Conteudo CSV obrigatorio");

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

5. Explicacao do codigo.

O validator separa parsing de gravacao. Cada linha recebe lista de erros para que o service grave apenas linhas sem erros. Em artigos, `costCents`, `priceCents` e `vatRateBps` seguem o contrato de `Item` criado no `BK-MF0-11`. Em extratos bancarios, `treasuryAccountId`, `bookedAt`, `description` e `amount` sao obrigatorios porque o `BK-MF3-03` guarda cada movimento com conta, data, descricao e valor. O JSDoc explicita que o input e CSV textual; Excel nativo nao e prometido nesta entrega.

6. Validacao do passo.

CSV de cliente sem NIF gera erro na linha. CSV de artigo sem `costCents` ou `priceCents` fica rejeitado. CSV de extrato sem `bookedAt` ou com `amount` invalido tambem fica rejeitado.

7. Cenario negativo/erro esperado.

Tipo `PRODUCTS` devolve `400 INVALID_IMPORT_TYPE`.

### Passo 4 - Implementar service de upsert

1. Objetivo funcional do passo no ERP.

Gravar linhas validas e rejeitar linhas com erro.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/imports/businessImportService.js`
    - EDITAR: nenhum.
    - REVER: services de dados mestre.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Usa transacao e `companyId` da sessao.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/imports/businessImportService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte valor textual em euros para centimos.
 *
 * @param {unknown} value Valor como `10.50` ou `10,50`.
 * @returns {number} Valor em centimos.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o valor nao e numerico.
 */
function eurosToCents(value) {
    const amount = Number(String(value).replace(",", "."));
    if (!Number.isFinite(amount)) throw httpError(400, "INVALID_IMPORT_AMOUNT", "Valor invalido na importacao");
    return Math.round(amount * 100);
}

/**
 * Valida campo monetario que ja chega em centimos.
 *
 * @param {unknown} value Valor vindo da linha CSV.
 * @param {string} fieldName Campo para mensagem de erro.
 * @param {{ allowZero?: boolean }} options Permite ou bloqueia zero.
 * @returns {number} Centimos validados.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando nao e inteiro valido.
 */
function integerCents(value, fieldName, { allowZero = true } = {}) {
    const cents = Number(value);
    if (!Number.isInteger(cents) || cents < 0 || (!allowZero && cents === 0)) {
        throw httpError(400, "INVALID_IMPORT_AMOUNT", `${fieldName} deve estar em centimos`);
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
 * Faz upsert de uma linha valida de dados mestre.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx Transacao Prisma.
 * @param {string} companyId Empresa ativa.
 * @param {"CUSTOMERS" | "SUPPLIERS" | "ITEMS"} type Tipo de importacao.
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
    throw httpError(400, "INVALID_IMPORT_TYPE", "Tipo de importacao invalido");
}

/**
 * Importa linhas de extrato reaproveitando os modelos do BK-MF3-03.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx Transacao Prisma.
 * @param {string} companyId Empresa ativa.
 * @param {string} userId Utilizador autenticado.
 * @param {string} fileName Nome do ficheiro importado.
 * @param {Array<{ row: Record<string, string> }>} parsedRows Linhas validas de extrato.
 * @returns {Promise<void>}
 * @throws {import("../../lib/httpErrors.js").HttpError} 404 quando uma conta nao pertence a empresa.
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
        throw httpError(404, "TREASURY_ACCOUNT_NOT_FOUND", "Conta de tesouraria nao encontrada nesta empresa");
    }

    for (const accountId of accountIds) {
        const rowsForAccount = parsedRows.filter((item) => item.row.treasuryAccountId === accountId);
        // Cada conta gera um BankStatementImport proprio para manter o log de integracao por conta.
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
 * Importa dados operacionais por empresa e regista resumo da execucao.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, payload: { type: "CUSTOMERS" | "SUPPLIERS" | "ITEMS" | "STATEMENTS", fileName: string, rows: Array<{ lineNumber: number, row: Record<string, string>, errors: string[] }> } }} input Contexto seguro e payload validado.
 * @returns {Promise<object>} `BusinessImportRun` com totais e erros.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa.
 */
export async function importBusinessData(prisma, { companyId, userId, payload }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatoria");

    const validRows = payload.rows.filter((item) => item.errors.length === 0);
    const rejectedRows = payload.rows.filter((item) => item.errors.length > 0);

    return prisma.$transaction(async (tx) => {
        if (payload.type === "STATEMENTS") {
            await importStatementRows(tx, companyId, userId, payload.fileName, validRows);
        } else {
            for (const parsedRow of validRows) {
                // O upsert e sempre filtrado por companyId para impedir mistura entre empresas.
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

5. Explicacao do codigo.

O service faz upsert por empresa e identificador natural. Clientes e fornecedores usam NIF; artigos usam SKU e gravam os campos obrigatorios de `Item`: `costCents`, `priceCents`, `vatRateBps` e `type`. Quando o tipo e `STATEMENTS`, o service confirma que a conta de tesouraria pertence a empresa ativa e cria `BankStatementImport` com `BankStatementLine`, reutilizando os modelos do `BK-MF3-03`. Linhas invalidas nao gravam dados. O JSDoc e os comentarios mostram os efeitos secundarios e a regra multiempresa.

6. Validacao do passo.

Importa cliente novo e repete o CSV com outro nome para confirmar update. Importa artigo com `sku`, `name`, `costCents`, `priceCents` e `vatRateBps`, e confirma que existe `Item` completo. Para extratos, importa uma linha com `treasuryAccountId`, `bookedAt`, `description`, `reference` e `amount`, e confirma que existe `BankStatementLine`.

7. Cenario negativo/erro esperado.

Linha com NIF vazio aumenta `rejectedRows`. Artigo sem `priceCents` aumenta `rejectedRows`. Extrato com conta de outra empresa devolve `404 TREASURY_ACCOUNT_NOT_FOUND`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Permitir importacoes apenas a roles autorizadas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/imports/businessImportRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares.
    - LOCALIZACAO: ficheiro completo e montagem.

3. Instrucoes do que fazer.

Cria `POST /api/imports/business-data`.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/imports/businessImportRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateBusinessImportPayload } from "./businessImportValidators.js";
import { importBusinessData } from "./businessImportService.js";

/**
 * Constroi as routes de importacao operacional.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependencias da route.
 * @returns {import("express").Router} Router montado em `/api/imports/business-data`.
 */
export function buildBusinessImportRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "CONTABILISTA")];
    router.post("/", guards, async (req, res) => {
        try {
            const payload = validateBusinessImportPayload(req.body);
            // A role e o companyId sao verificados no backend antes de qualquer escrita sensivel.
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
// apps/api/src/server.js
import { buildBusinessImportRoutes } from "./modules/imports/businessImportRoutes.js";

app.use("/api/imports/business-data", buildBusinessImportRoutes({ prisma }));
```

5. Explicacao do codigo.

A route valida sessao, empresa e role. Depois valida o ficheiro e grava os dados por empresa. O comentario dentro da route relembra que importacao altera dados mestre e, por isso, nao pode depender de permissao apenas no frontend.

6. Validacao do passo.

`POST` com `CONTABILISTA` devolve `201`.

7. Cenario negativo/erro esperado.

`OPERACIONAL` recebe `403`.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Enviar CSV ao backend com tipo controlado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/importApi.ts`
    - EDITAR: nenhum.
    - REVER: cliente frontend.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Cria payload tipado.

4. Codigo completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/importApi.ts
import { apiClient } from "./apiClient";

/**
 * Tipos de importacao aceites pela API.
 */
export type BusinessImportType = "CUSTOMERS" | "SUPPLIERS" | "ITEMS" | "STATEMENTS";

/**
 * Envia CSV operacional para importacao backend.
 *
 * @param {BusinessImportType} type Tipo de entidade a importar.
 * @param {string} fileName Nome do ficheiro original.
 * @param {string} content Conteudo CSV textual.
 * @returns {Promise<{ id: string, acceptedRows: number, rejectedRows: number }>} Resumo da importacao.
 */
export async function importBusinessData(type: BusinessImportType, fileName: string, content: string) {
    return apiClient.post<{ id: string; acceptedRows: number; rejectedRows: number }>("/api/imports/business-data", { type, fileName, content });
}
```

5. Explicacao do codigo.

O tipo limita opcoes no frontend, mas o backend continua a validar. O cliente reutiliza `apiClient`, portanto o cookie seguro segue com o pedido sem duplicar `fetch`.

6. Validacao do passo.

Confirma payload enviado no separador Network.

7. Cenario negativo/erro esperado.

Erro de role aparece como mensagem.

### Passo 7 - Criar pagina de importacao

1. Objetivo funcional do passo no ERP.

Permitir escolher tipo, colar CSV e ver resultado.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/BusinessImportPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `importApi.ts`.
    - LOCALIZACAO: ficheiro completo e menu.

3. Instrucoes do que fazer.

Usa `textarea` para CSV e feedback de linhas.

4. Codigo completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/BusinessImportPage.tsx
import { FormEvent, useState } from "react";
import { importBusinessData, type BusinessImportType } from "../lib/importApi";

/**
 * Pagina de importacao CSV de dados operacionais.
 *
 * Gere estados de loading, erro e sucesso. A validacao completa e feita no backend, porque o utilizador
 * pode alterar manualmente o HTML ou enviar pedidos fora da UI.
 *
 * @returns {JSX.Element} Interface de importacao.
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
            setMessage(`Importacao concluida: ${result.acceptedRows} aceites, ${result.rejectedRows} rejeitadas.`);
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

5. Explicacao do codigo.

A pagina da feedback imediato. O CSV continua validado no backend, que decide que linhas entram. O JSDoc e o comentario ajudam o aluno a perceber que a UI nao e uma fronteira de seguranca.

6. Validacao do passo.

Importa um CSV com uma linha valida e outra invalida.

7. Cenario negativo/erro esperado.

CSV vazio devolve erro.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Confirmar que dados mestres importados alimentam SAF-T e relatorios.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence.
    - REVER: service e dados criados.
    - LOCALIZACAO: checklist final.

3. Instrucoes do que fazer.

Regista antes/depois de uma importacao.

4. Codigo completo, correto e integrado com a app final.

Sem codigo novo neste passo.

5. Explicacao do codigo.

A prova mostra que importacao nao e apenas resumo: cria dados reais.

6. Validacao do passo.

Confirma cliente/artigo criado na base.

7. Cenario negativo/erro esperado.

Linha invalida aparece em `errors`.

## Expected results

- `201` com `acceptedRows` e `rejectedRows`.
- Dados validos gravados por empresa.
- Extratos validos gravados em `BankStatementImport` e `BankStatementLine`.
- Dados invalidos registados em `errors`.
- `403` para role sem permissao.

## Critérios de aceite

- CSV validado por tipo.
- Upsert por empresa.
- Extratos associados a contas de tesouraria da empresa ativa.
- Erros por linha registados.
- Sem tokens no frontend.
- Excel nativo `.xlsx` fica fora desta entrega; Excel e usado exportando para CSV.

## Validação final

- Confirmar imports.
- Confirmar transacao.
- Confirmar evidence.

## Evidence para PR/defesa

- CSV usado.
- JSON da importacao.
- Prova de linha rejeitada.

## Handoff

BK-MF3-06 usa dados mestres consistentes para exportacao SAF-T.

## Changelog

- `2026-06-13`: corrigido para validar CSV, gravar dados reais por tipo, usar `apiClient`, documentar limite Excel->CSV e registar erros por linha com JSDoc.
- `2026-06-13`: alinhado com `BK-MF3-03`, passando a gravar importacoes de extratos em `BankStatementImport` e `BankStatementLine`.
