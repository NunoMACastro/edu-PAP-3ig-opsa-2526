# BK-MF3-03 - Importar extratos bancários (CSV/OFX) e fazer reconciliação automática.

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
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais importar extratos bancários em CSV ou OFX simplificado, guardar linhas por empresa e gerar sugestões de reconciliação contra recebimentos e pagamentos.

#### Importância

RF33 liga bancos ao ciclo operacional. A reconciliação não confirma automaticamente movimentos; ela sugere correspondências para revisão humana.

#### Scope-in

- Validar conta de tesouraria criada em BK-MF3-02.
- Receber conteúdo CSV ou OFX textual.
- Parsear linhas com data, descrição, referência e valor.
- Guardar importação e linhas.
- Sugerir correspondências com `Receipt` e `Payment`.

#### Scope-out

- Ligação direta a API bancária.
- Confirmação automática sem revisão.
- Suporte integral de todos os dialectos OFX.

#### Estado antes e depois

- Estado antes: existem contas de tesouraria mas não há extratos.
- Estado depois: extratos ficam importados com sugestões auditáveis.

#### Pre-requisitos

- Rever RF33 e RNF10.
- Rever BK-MF3-02, BK-MF1-02, BK-MF1-03, BK-MF1-07 e BK-MF1-08.
- Confirmar que recebimentos e pagamentos tem valor, data e empresa.

#### Glossário

- **Extrato:** lista de movimentos bancários.
- **Linha de extrato:** uma entrada individual do extrato.
- **Reconciliação:** ligação entre linha bancária e documento financeiro.
- **Sugestão:** proposta gerada pelo sistema, ainda não confirmada.

#### Conceitos teóricos essenciais

- O CSV é uma lista textual separada por ponto e vírgula no MVP.
- OFX simplificado e texto com tags conhecidas; não representa certificação bancária.
- A reconciliação usa tolerância de datas e igualdade de valores em cêntimos.
- O backend filtra sempre por empresa e conta ativa.
- Logs de integração ficam representados por `BankStatementImport` e erros por linha.

#### Arquitetura do BK

- Endpoint: `POST /api/treasury/statements/import`.
- Roles: `OPERACIONAL`, `CONTABILISTA`.
- Modelos: `BankStatementImport`, `BankStatementLine`, `BankReconciliationSuggestion`.
- Frontend: `StatementImportPage`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/treasury/statementImportValidators.js`
- CRIAR: `apps/api/src/modules/treasury/statementImportService.js`
- CRIAR: `apps/api/src/modules/treasury/statementRoutes.js`
- CRIAR: `apps/web/src/lib/statementApi.ts`
- CRIAR: `apps/web/src/pages/StatementImportPage.tsx`
- EDITAR: `apps/api/prisma/schema.prisma`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/App.tsx`
- REVER: BK-MF3-02, BK-MF1-02, BK-MF1-03, BK-MF1-07, BK-MF1-08.

#### Tutorial técnico linear

### Passo 1 - Confirmar fluxo e limites

1. Objetivo funcional do passo no ERP.

Definir que este BK importa e sugere, mas não confirma reconciliação.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: `docs/RF.md`, `docs/RNF.md`.
    - LOCALIZAÇÃO: RF33 e RNF10.

3. Instruções do que fazer.

Regista que a confirmação manual fica fora deste BK.

- `CANONICO`: RF33 cobre importação de extratos e reconciliação automática como sugestão.
- `DERIVADO`: o MVP aceita CSV separado por `;` e OFX textual simplificado, porque a documentação não define integração bancária real nem biblioteca OFX completa.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Não há código porque o passo fixa o limite de segurança: sugestão não é conciliação definitiva.

6. Validação do passo.

Evidence deve declarar CSV e OFX simplificado.

7. Cenário negativo/erro esperado.

Uma linha não deve marcar automaticamente um pagamento como reconciliado.

### Passo 2 - Modelar importação, linhas e sugestões

1. Objetivo funcional do passo no ERP.

Guardar importação, linhas e sugestões por empresa.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: `TreasuryAccount`, `Receipt`, `Payment`.
    - LOCALIZAÇÃO: modelos de tesouraria.

3. Instruções do que fazer.

Adiciona modelos com índices por empresa e conta.

4. Código completo, correto e integrado com a app final.

```prisma
/// Registo de uma importação de extrato bancário.
/// Funciona também como log de integração para evidence e auditoria operacional.
model BankStatementImport {
  id                String   @id @default(uuid())
  companyId         String
  treasuryAccountId String
  fileName          String
  format            String
  status            String
  totalLines        Int
  validLines        Int
  errorLines        Int
  importedById      String
  importedAt        DateTime @default(now())
  errors            Json?

  lines BankStatementLine[]

  @@index([companyId, treasuryAccountId, importedAt])
}

/// Linha individual de extrato já normalizada para cêntimos e data.
/// A constraint reduz duplicados dentro da mesma importação e empresa.
model BankStatementLine {
  id          String   @id @default(uuid())
  companyId   String
  importId    String
  bookedAt    DateTime
  description String
  reference   String?
  amountCents Int

  import BankStatementImport @relation(fields: [importId], references: [id])
  suggestions BankReconciliationSuggestion[]

  @@unique([companyId, importId, bookedAt, amountCents, description])
  @@index([companyId, bookedAt])
}

/// Sugestão de reconciliação gerada automaticamente.
/// O estado inicial é sempre SUGGESTED para impedir confirmação contabilística sem revisão humana.
model BankReconciliationSuggestion {
  id              String   @id @default(uuid())
  companyId       String
  statementLineId String
  targetType      String
  targetId        String
  confidence      Int
  reason          String
  status          String   @default("SUGGESTED")
  createdAt       DateTime @default(now())

  statementLine BankStatementLine @relation(fields: [statementLineId], references: [id])

  @@index([companyId, statementLineId])
}
```

5. Explicação do código.

Os modelos guardam a origem, cada linha e as sugestões. A constraint reduz duplicados no mesmo ficheiro. `status` permite distinguir importação parcial de importação limpa.

6. Validação do passo.

Migration deve criar os três modelos.

7. Cenário negativo/erro esperado.

Sem `companyId`, uma sugestão podia ligar linha de uma empresa a pagamento de outra.

### Passo 3 - Validar payload e parsear ficheiro

1. Objetivo funcional do passo no ERP.

Transformar conteúdo textual em linhas normalizadas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/statementImportValidators.js`
    - EDITAR: nenhum.
    - REVER: `httpErrors.js`.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

CSV usa `data;descricao;referencia;valor`. OFX simplificado usa linhas `DTPOSTED=`, `MEMO=`, `TRNAMT=`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/statementImportValidators.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida texto obrigatório do payload de importação.
 *
 * @param {unknown} value Valor recebido no body.
 * @param {string} fieldName Nome do campo para erro pedagogico.
 * @returns {string} Texto limpo.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando falta texto.
 */
function requiredText(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw httpError(400, "INVALID_STATEMENT_IMPORT", `${fieldName} é obrigatório`);
    }
    return value.trim();
}

/**
 * Converte euros textuais para cêntimos inteiros.
 *
 * @param {unknown} value Valor textual como `123.45` ou `123,45`.
 * @returns {number} Valor em cêntimos, com sinal.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o valor não é numérico.
 */
function eurosToCents(value) {
    const amount = Number(String(value).replace(",", "."));
    if (!Number.isFinite(amount)) throw httpError(400, "INVALID_STATEMENT_AMOUNT", "Valor inválido no extrato");
    return Math.round(amount * 100);
}

/**
 * Parseia o CSV MVP no formato `data;descrição;referência;valor`.
 *
 * @param {string} content Conteúdo textual enviado pelo frontend.
 * @returns {Array<{ bookedAt: Date, description: string, reference: string | null, amountCents: number }>} Linhas normalizadas.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando data, descrição ou valor são inválidos.
 */
function parseCsv(content) {
    return content.split(/\r?\n/).filter(Boolean).map((line, index) => {
        const [dateText, description, reference, amount] = line.split(";");
        const bookedAt = new Date(dateText);
        if (Number.isNaN(bookedAt.getTime())) throw httpError(400, "INVALID_STATEMENT_DATE", `Data inválida na linha ${index + 1}`);
        return { bookedAt, description: requiredText(description, "Descrição"), reference: reference?.trim() || null, amountCents: eurosToCents(amount) };
    });
}

/**
 * Parseia OFX simplificado com tags `DTPOSTED=`, `MEMO=` e `TRNAMT=`.
 *
 * @param {string} content Conteúdo OFX textual.
 * @returns {Array<{ bookedAt: Date, description: string, reference: null, amountCents: number }>} Linhas normalizadas.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando falta uma tag obrigatória.
 */
function parseOfx(content) {
    const blocks = content.split("STMTTRN").slice(1);
    return blocks.map((block, index) => {
        const bookedAt = new Date(requiredText(block.match(/DTPOSTED=([^\n]+)/)?.[1], "DTPOSTED"));
        const description = requiredText(block.match(/MEMO=([^\n]+)/)?.[1], "MEMO");
        const amountCents = eurosToCents(requiredText(block.match(/TRNAMT=([^\n]+)/)?.[1], "TRNAMT"));
        if (Number.isNaN(bookedAt.getTime())) throw httpError(400, "INVALID_STATEMENT_DATE", `Data inválida no movimento ${index + 1}`);
        return { bookedAt, description, reference: null, amountCents };
    });
}

/**
 * Valida payload completo da importação de extrato.
 *
 * @param {{ treasuryAccountId?: unknown, fileName?: unknown, format?: unknown, content?: unknown }} body Body HTTP da route.
 * @returns {{ treasuryAccountId: string, fileName: string, format: "CSV" | "OFX", rows: Array<{ bookedAt: Date, description: string, reference: string | null, amountCents: number }> }} DTO seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 para formato ou conteúdo inválido.
 */
export function validateStatementImportPayload(body) {
    const treasuryAccountId = requiredText(body.treasuryAccountId, "Conta");
    const fileName = requiredText(body.fileName, "Nome do ficheiro");
    const format = requiredText(body.format, "Formato").toUpperCase();
    const content = requiredText(body.content, "Conteúdo");

    if (!["CSV", "OFX"].includes(format)) throw httpError(400, "INVALID_STATEMENT_FORMAT", "Formato deve ser CSV ou OFX");

    return { treasuryAccountId, fileName, format, rows: format === "CSV" ? parseCsv(content) : parseOfx(content) };
}
```

5. Explicação do código.

O validator não grava dados; ele normaliza ficheiro em linhas. Datas inválidas e valores inválidos falham antes do service. O JSDoc separa parser CSV, parser OFX e DTO final, para o aluno perceber onde cada responsabilidade fica e porque não se gravam extratos impossíveis de reconciliar.

6. Validação do passo.

Testa uma linha CSV `2026-01-02;Pagamento cliente;FT 1;123.45`.

7. Cenário negativo/erro esperado.

Formato `PDF` devolve `400 INVALID_STATEMENT_FORMAT`.

### Passo 4 - Implementar service com sugestões

1. Objetivo funcional do passo no ERP.

Gravar o extrato e sugerir correspondências por valor e proximidade de data.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/statementImportService.js`
    - EDITAR: nenhum.
    - REVER: `Receipt`, `Payment`, `TreasuryAccount`.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Usa transação para criar importação, linhas e sugestões.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/statementImportService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Verifica se duas datas estao dentro da tolerância de reconciliação do MVP.
 *
 * @param {Date} a Data da linha bancária.
 * @param {Date} b Data do recebimento ou pagamento.
 * @returns {boolean} True quando a diferença e até três dias.
 */
function withinThreeDays(a, b) {
    return Math.abs(a.getTime() - b.getTime()) <= 3 * 86400000;
}

/**
 * Procura recebimentos e pagamentos candidatos para uma linha de extrato.
 *
 * Valores positivos procuram `Receipt`; valores negativos procuram `Payment`. A função devolve apenas
 * sugestões, não altera documentos nem marca movimentos como reconciliados.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx Transação Prisma.
 * @param {string} companyId Empresa ativa.
 * @param {{ bookedAt: Date, amountCents: number }} row Linha normalizada do extrato.
 * @returns {Promise<Array<{ targetType: "RECEIPT" | "PAYMENT", targetId: string, confidence: number, reason: string }>>} Sugestões candidatas.
 */
async function findMatches(tx, companyId, row) {
    const [receipts, payments] = await Promise.all([
        tx.receipt.findMany({ where: { companyId, amountCents: Math.abs(row.amountCents) }, select: { id: true, receivedAt: true } }),
        tx.payment.findMany({ where: { companyId, amountCents: Math.abs(row.amountCents) }, select: { id: true, paidAt: true } }),
    ]);

    return [
        ...receipts.filter((item) => row.amountCents > 0 && withinThreeDays(row.bookedAt, item.receivedAt)).map((item) => ({ targetType: "RECEIPT", targetId: item.id, confidence: 90, reason: "Valor igual e data próxima de recebimento" })),
        ...payments.filter((item) => row.amountCents < 0 && withinThreeDays(row.bookedAt, item.paidAt)).map((item) => ({ targetType: "PAYMENT", targetId: item.id, confidence: 90, reason: "Valor igual e data próxima de pagamento" })),
    ];
}

/**
 * Importa um extrato bancário textual e cria sugestões de reconciliação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, payload: { treasuryAccountId: string, fileName: string, format: "CSV" | "OFX", rows: Array<{ bookedAt: Date, description: string, reference: string | null, amountCents: number }> } }} input Contexto seguro e payload validado.
 * @returns {Promise<object>} Importação criada com linhas e sugestões.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa ou 404 quando a conta não pertence a empresa.
 */
export async function importBankStatement(prisma, { companyId, userId, payload }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const account = await prisma.treasuryAccount.findFirst({ where: { id: payload.treasuryAccountId, companyId, isActive: true } });
    if (!account) throw httpError(404, "TREASURY_ACCOUNT_NOT_FOUND", "Conta de tesouraria não encontrada");

    return prisma.$transaction(async (tx) => {
        // A importação funciona como log de integração: quem importou, quando, formato e contagem.
        const statementImport = await tx.bankStatementImport.create({
            data: {
                companyId,
                treasuryAccountId: account.id,
                fileName: payload.fileName,
                format: payload.format,
                status: "IMPORTED",
                totalLines: payload.rows.length,
                validLines: payload.rows.length,
                errorLines: 0,
                importedById: userId,
            },
        });

        const createdLines = [];
        for (const row of payload.rows) {
            const line = await tx.bankStatementLine.create({ data: { ...row, companyId, importId: statementImport.id } });
            const matches = await findMatches(tx, companyId, row);
            for (const match of matches) {
                // A sugestão fica persistida como SUGGESTED; nenhum pagamento/recebimento é confirmado aqui.
                await tx.bankReconciliationSuggestion.create({ data: { ...match, companyId, statementLineId: line.id } });
            }
            createdLines.push({ ...line, suggestions: matches });
        }

        return { ...statementImport, lines: createdLines };
    });
}
```

5. Explicação do código.

O service valida a conta dentro da empresa, cria a importação e guarda cada linha. `findMatches` procura recebimentos positivos e pagamentos negativos com valor igual e data próxima. A sugestão fica separada da confirmação. Os comentários dentro da transação tornam explícitos os efeitos secundários e a fronteira de segurança: importar não reconcilia definitivamente.

6. Validação do passo.

Importa uma linha positiva com valor igual a um recebimento recente e confirma sugestão `RECEIPT`.

7. Cenário negativo/erro esperado.

Conta inativa ou de outra empresa devolve `404 TREASURY_ACCOUNT_NOT_FOUND`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Receber ficheiro textual e devolver linhas importadas com sugestões.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/statementRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares de segurança.
    - LOCALIZAÇÃO: ficheiro completo e montagem.

3. Instruções do que fazer.

Cria `POST /api/treasury/statements/import`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/statementRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateStatementImportPayload } from "./statementImportValidators.js";
import { importBankStatement } from "./statementImportService.js";

/**
 * Constrói as routes de importação de extratos.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/treasury/statements`.
 */
export function buildStatementRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("OPERACIONAL", "CONTABILISTA")];

    router.post("/import", guards, async (req, res) => {
        try {
            const payload = validateStatementImportPayload(req.body);
            // A empresa e o utilizador vêm dos guards; o payload apenas identifica a conta dentro dessa empresa.
            const result = await importBankStatement(prisma, { companyId: req.companyId, userId: req.user.id, payload });
            return res.status(201).json(result);
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
import { buildStatementRoutes } from "./modules/treasury/statementRoutes.js";

app.use("/api/treasury/statements", buildStatementRoutes({ prisma }));
```

5. Explicação do código.

A route protege importações, valida payload e chama service. O upload fica textual no MVP para evitar dependências de ficheiros até a equipa estabilizar a app. O JSDoc explica o endpoint e o comentário mostra porque `companyId` não vem do browser.

6. Validação do passo.

`POST /api/treasury/statements/import` devolve `201` com linhas e sugestões.

7. Cenário negativo/erro esperado.

Role `GESTOR` sem permissão operacional recebe `403`.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Enviar extrato do frontend para o backend.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/statementApi.ts`
    - EDITAR: nenhum.
    - REVER: `treasuryApi.ts`.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Tipa payload e resposta.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/statementApi.ts
import { apiClient } from "./apiClient";

/**
 * Payload enviado para importar um extrato textual.
 */
export type StatementImportPayload = {
    treasuryAccountId: string;
    fileName: string;
    format: "CSV" | "OFX";
    content: string;
};

/**
 * Resultado resumido da importação, incluindo sugestões criadas.
 */
export type StatementImportResult = {
    id: string;
    totalLines: number;
    lines: Array<{
        id: string;
        amountCents: number;
        suggestions: Array<{ targetType: string; targetId: string; confidence: number; reason: string }>;
    }>;
};

/**
 * Envia um extrato textual para o backend.
 *
 * @param {StatementImportPayload} payload Conta, nome, formato e conteúdo textual.
 * @returns {Promise<StatementImportResult>} Importação criada com linhas e sugestões.
 * @throws {Error} Quando a API rejeita formato, conta ou sessão.
 */
export async function importStatement(payload: StatementImportPayload): Promise<StatementImportResult> {
    return apiClient.post<StatementImportResult>("/api/treasury/statements/import", payload);
}
```

5. Explicação do código.

O payload é explícito: conta, nome, formato e conteúdo. O cliente reutiliza `apiClient`, por isso o cookie HttpOnly segue com `credentials: "include"` sem tokens em `localStorage`. A resposta inclui contagem de linhas para feedback imediato.

6. Validação do passo.

Confirma que `format` só aceita `CSV` ou `OFX` no componente.

7. Cenário negativo/erro esperado.

Sessão expirada devolve erro controlado.

### Passo 7 - Criar página de importação

1. Objetivo funcional do passo no ERP.

Permitir colar/importar conteúdo textual e ver sugestões geradas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/StatementImportPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `statementApi.ts`.
    - LOCALIZAÇÃO: ficheiro completo e menu.

3. Instruções do que fazer.

Cria formulario com conta, formato e conteúdo.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/StatementImportPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { listTreasuryAccounts, type TreasuryAccount } from "../lib/treasuryApi";
import { importStatement, type StatementImportResult } from "../lib/statementApi";

/**
 * Página de importação textual de extratos bancários.
 *
 * Carrega contas reais da tesouraria, envia CSV/OFX simplificado e mostra feedback sem confirmar
 * reconciliação automaticamente.
 *
 * @returns {JSX.Element} Interface de importação de extratos.
 */
export function StatementImportPage() {
    const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
    const [result, setResult] = useState<StatementImportResult | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void listTreasuryAccounts()
            .then(setAccounts)
            .catch((err) => setError(err instanceof Error ? err.message : "Erro inesperado"));
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            setResult(await importStatement({
                treasuryAccountId: String(form.get("treasuryAccountId") ?? ""),
                fileName: String(form.get("fileName") ?? "extrato.csv"),
                format: String(form.get("format") ?? "CSV") as "CSV" | "OFX",
                content: String(form.get("content") ?? ""),
            }));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Importar extrato bancário</h1>
            <form onSubmit={handleSubmit}>
                <select name="treasuryAccountId" required>
                    <option value="">Escolhe a conta</option>
                    {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
                <input name="fileName" placeholder="extrato.csv" required />
                <select name="format" defaultValue="CSV"><option value="CSV">CSV</option><option value="OFX">OFX</option></select>
                <textarea name="content" rows={10} placeholder="data;descrição;referência;valor" required />
                <button disabled={loading}>{loading ? "A importar..." : "Importar"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {accounts.length === 0 && !error && <p>Cria uma conta de tesouraria antes de importar extratos.</p>}
            {result && <p>Importação {result.id} criada com {result.totalLines} linhas e {result.lines.reduce((sum, line) => sum + line.suggestions.length, 0)} sugestões.</p>}
        </main>
    );
}
```

5. Explicação do código.

A página recolhe dados mínimos para o MVP e usa contas reais carregadas de `BK-MF3-02`, evitando que o aluno copie IDs manualmente. A validação de segurança fica no backend. O feedback confirma a importação e o número de sugestões, sem confirmar reconciliação.

6. Validação do passo.

Cola uma linha CSV válida e confirma importação.

7. Cenário negativo/erro esperado.

Conteúdo vazio devolve erro de validação.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Confirmar que extratos alimentam a previsão de tesouraria seguinte.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence do BK.
    - REVER: service, route e página.
    - LOCALIZAÇÃO: checklist final.

3. Instruções do que fazer.

Regista uma importação com sugestão `RECEIPT` e outra com sugestão `PAYMENT`.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo.

5. Explicação do código.

As sugestões comprovam que a reconciliação usa dados reais de vendas e compras.

6. Validação do passo.

Confirmar que linhas importadas pertencem a empresa ativa.

7. Cenário negativo/erro esperado.

Importar para conta de outra empresa devolve `404`.

## Expected results

- `201` com importação, linhas e sugestões.
- `400 INVALID_STATEMENT_FORMAT` para formato inválido.
- `404 TREASURY_ACCOUNT_NOT_FOUND` para conta fora da empresa.
- `403` para role sem permissão.

## Critérios de aceite

- CSV e OFX simplificado são parseados.
- As linhas ficam persistidas.
- Sugestões não confirmam reconciliação.
- Todos os dados usam `companyId`.
- Frontend usa `apiClient` indiretamente via clientes MF3/MF1.

## Validação final

- Confirmar imports.
- Confirmar transação.
- Confirmar negativos.

## Evidence para PR/defesa

- Payload usado.
- JSON com linhas e sugestões.
- Provas de formato inválido, role inválida e conta de outra empresa.

## Handoff

BK-MF3-04 usa extratos, saldos, recebimentos e pagamentos para previsão de tesouraria.

## Changelog

- `2026-06-13`: corrigido para parsear CSV/OFX simplificado, guardar linhas, criar sugestões reais de reconciliação, carregar contas reais, usar `apiClient`, JSDoc e comentários didáticos.
