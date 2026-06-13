# BK-MF3-03 - Importar extratos bancarios (CSV/OFX) e fazer reconciliacao automatica.

## Header
- `doc_id`: `GUIA-BK-MF3-03`
- `bk_id`: `BK-MF3-03`
- `macro`: `MF3`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF3-02, BK-MF1-02, BK-MF1-03, BK-MF1-07, BK-MF1-08`
- `rf_rnf`: `RF33`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-04`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md`
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais importar extratos bancarios em CSV ou OFX simplificado, guardar linhas por empresa e gerar sugestoes de reconciliacao contra recebimentos e pagamentos.

#### Importancia

RF33 liga bancos ao ciclo operacional. A reconciliacao nao confirma automaticamente movimentos; ela sugere correspondencias para revisao humana.

#### Scope-in

- Validar conta de tesouraria criada em BK-MF3-02.
- Receber conteudo CSV ou OFX textual.
- Parsear linhas com data, descricao, referencia e valor.
- Guardar importacao e linhas.
- Sugerir correspondencias com `Receipt` e `Payment`.

#### Scope-out

- Ligacao direta a API bancaria.
- Confirmacao automatica sem revisao.
- Suporte integral de todos os dialectos OFX.

#### Estado antes e depois

- Estado antes: existem contas de tesouraria mas nao ha extratos.
- Estado depois: extratos ficam importados com sugestoes auditaveis.

#### Pre-requisitos

- Rever RF33 e RNF10.
- Rever BK-MF3-02, BK-MF1-02, BK-MF1-03, BK-MF1-07 e BK-MF1-08.
- Confirmar que recebimentos e pagamentos tem valor, data e empresa.

#### Glossario

- **Extrato:** lista de movimentos bancarios.
- **Linha de extrato:** uma entrada individual do extrato.
- **Reconciliacao:** ligacao entre linha bancaria e documento financeiro.
- **Sugestao:** proposta gerada pelo sistema, ainda nao confirmada.

#### Conceitos teoricos essenciais

- O CSV e uma lista textual separada por ponto e virgula no MVP.
- OFX simplificado e texto com tags conhecidas; nao representa certificacao bancaria.
- A reconciliacao usa tolerancia de datas e igualdade de valores em centimos.
- O backend filtra sempre por empresa e conta ativa.
- Logs de integracao ficam representados por `BankStatementImport` e erros por linha.

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

#### Tutorial tecnico linear

### Passo 1 - Confirmar fluxo e limites

1. Objetivo funcional do passo no ERP.

Definir que este BK importa e sugere, mas nao confirma reconciliacao.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: `docs/RF.md`, `docs/RNF.md`.
    - LOCALIZACAO: RF33 e RNF10.

3. Instrucoes do que fazer.

Regista que a confirmacao manual fica fora deste BK.

- `CANONICO`: RF33 cobre importacao de extratos e reconciliacao automatica como sugestao.
- `DERIVADO`: o MVP aceita CSV separado por `;` e OFX textual simplificado, porque a documentacao nao define integracao bancaria real nem biblioteca OFX completa.

4. Codigo completo, correto e integrado com a app final.

Sem codigo neste passo.

5. Explicacao do codigo.

Nao ha codigo porque o passo fixa o limite de seguranca: sugestao nao e conciliacao definitiva.

6. Validacao do passo.

Evidence deve declarar CSV e OFX simplificado.

7. Cenario negativo/erro esperado.

Uma linha nao deve marcar automaticamente um pagamento como reconciliado.

### Passo 2 - Modelar importacao, linhas e sugestoes

1. Objetivo funcional do passo no ERP.

Guardar importacao, linhas e sugestoes por empresa.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: `TreasuryAccount`, `Receipt`, `Payment`.
    - LOCALIZACAO: modelos de tesouraria.

3. Instrucoes do que fazer.

Adiciona modelos com indices por empresa e conta.

4. Codigo completo, correto e integrado com a app final.

```prisma
/// Registo de uma importacao de extrato bancario.
/// Funciona tambem como log de integracao para evidence e auditoria operacional.
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

/// Linha individual de extrato ja normalizada para centimos e data.
/// A constraint reduz duplicados dentro da mesma importacao e empresa.
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

/// Sugestao de reconciliacao gerada automaticamente.
/// O estado inicial e sempre SUGGESTED para impedir confirmacao contabilistica sem revisao humana.
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

5. Explicacao do codigo.

Os modelos guardam a origem, cada linha e as sugestoes. A constraint reduz duplicados no mesmo ficheiro. `status` permite distinguir importacao parcial de importacao limpa.

6. Validacao do passo.

Migration deve criar os tres modelos.

7. Cenario negativo/erro esperado.

Sem `companyId`, uma sugestao podia ligar linha de uma empresa a pagamento de outra.

### Passo 3 - Validar payload e parsear ficheiro

1. Objetivo funcional do passo no ERP.

Transformar conteudo textual em linhas normalizadas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/statementImportValidators.js`
    - EDITAR: nenhum.
    - REVER: `httpErrors.js`.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

CSV usa `data;descricao;referencia;valor`. OFX simplificado usa linhas `DTPOSTED=`, `MEMO=`, `TRNAMT=`.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/statementImportValidators.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Valida texto obrigatorio do payload de importacao.
 *
 * @param {unknown} value Valor recebido no body.
 * @param {string} fieldName Nome do campo para erro pedagogico.
 * @returns {string} Texto limpo.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando falta texto.
 */
function requiredText(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
        throw httpError(400, "INVALID_STATEMENT_IMPORT", `${fieldName} e obrigatorio`);
    }
    return value.trim();
}

/**
 * Converte euros textuais para centimos inteiros.
 *
 * @param {unknown} value Valor textual como `123.45` ou `123,45`.
 * @returns {number} Valor em centimos, com sinal.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o valor nao e numerico.
 */
function eurosToCents(value) {
    const amount = Number(String(value).replace(",", "."));
    if (!Number.isFinite(amount)) throw httpError(400, "INVALID_STATEMENT_AMOUNT", "Valor invalido no extrato");
    return Math.round(amount * 100);
}

/**
 * Parseia o CSV MVP no formato `data;descricao;referencia;valor`.
 *
 * @param {string} content Conteudo textual enviado pelo frontend.
 * @returns {Array<{ bookedAt: Date, description: string, reference: string | null, amountCents: number }>} Linhas normalizadas.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando data, descricao ou valor sao invalidos.
 */
function parseCsv(content) {
    return content.split(/\r?\n/).filter(Boolean).map((line, index) => {
        const [dateText, description, reference, amount] = line.split(";");
        const bookedAt = new Date(dateText);
        if (Number.isNaN(bookedAt.getTime())) throw httpError(400, "INVALID_STATEMENT_DATE", `Data invalida na linha ${index + 1}`);
        return { bookedAt, description: requiredText(description, "Descricao"), reference: reference?.trim() || null, amountCents: eurosToCents(amount) };
    });
}

/**
 * Parseia OFX simplificado com tags `DTPOSTED=`, `MEMO=` e `TRNAMT=`.
 *
 * @param {string} content Conteudo OFX textual.
 * @returns {Array<{ bookedAt: Date, description: string, reference: null, amountCents: number }>} Linhas normalizadas.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando falta uma tag obrigatoria.
 */
function parseOfx(content) {
    const blocks = content.split("STMTTRN").slice(1);
    return blocks.map((block, index) => {
        const bookedAt = new Date(requiredText(block.match(/DTPOSTED=([^\n]+)/)?.[1], "DTPOSTED"));
        const description = requiredText(block.match(/MEMO=([^\n]+)/)?.[1], "MEMO");
        const amountCents = eurosToCents(requiredText(block.match(/TRNAMT=([^\n]+)/)?.[1], "TRNAMT"));
        if (Number.isNaN(bookedAt.getTime())) throw httpError(400, "INVALID_STATEMENT_DATE", `Data invalida no movimento ${index + 1}`);
        return { bookedAt, description, reference: null, amountCents };
    });
}

/**
 * Valida payload completo da importacao de extrato.
 *
 * @param {{ treasuryAccountId?: unknown, fileName?: unknown, format?: unknown, content?: unknown }} body Body HTTP da route.
 * @returns {{ treasuryAccountId: string, fileName: string, format: "CSV" | "OFX", rows: Array<{ bookedAt: Date, description: string, reference: string | null, amountCents: number }> }} DTO seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 para formato ou conteudo invalido.
 */
export function validateStatementImportPayload(body) {
    const treasuryAccountId = requiredText(body.treasuryAccountId, "Conta");
    const fileName = requiredText(body.fileName, "Nome do ficheiro");
    const format = requiredText(body.format, "Formato").toUpperCase();
    const content = requiredText(body.content, "Conteudo");

    if (!["CSV", "OFX"].includes(format)) throw httpError(400, "INVALID_STATEMENT_FORMAT", "Formato deve ser CSV ou OFX");

    return { treasuryAccountId, fileName, format, rows: format === "CSV" ? parseCsv(content) : parseOfx(content) };
}
```

5. Explicacao do codigo.

O validator nao grava dados; ele normaliza ficheiro em linhas. Datas invalidas e valores invalidos falham antes do service. O JSDoc separa parser CSV, parser OFX e DTO final, para o aluno perceber onde cada responsabilidade fica e porque nao se gravam extratos impossiveis de reconciliar.

6. Validacao do passo.

Testa uma linha CSV `2026-01-02;Pagamento cliente;FT 1;123.45`.

7. Cenario negativo/erro esperado.

Formato `PDF` devolve `400 INVALID_STATEMENT_FORMAT`.

### Passo 4 - Implementar service com sugestoes

1. Objetivo funcional do passo no ERP.

Gravar o extrato e sugerir correspondencias por valor e proximidade de data.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/statementImportService.js`
    - EDITAR: nenhum.
    - REVER: `Receipt`, `Payment`, `TreasuryAccount`.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Usa transacao para criar importacao, linhas e sugestoes.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/statementImportService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Verifica se duas datas estao dentro da tolerancia de reconciliacao do MVP.
 *
 * @param {Date} a Data da linha bancaria.
 * @param {Date} b Data do recebimento ou pagamento.
 * @returns {boolean} True quando a diferenca e ate tres dias.
 */
function withinThreeDays(a, b) {
    return Math.abs(a.getTime() - b.getTime()) <= 3 * 86400000;
}

/**
 * Procura recebimentos e pagamentos candidatos para uma linha de extrato.
 *
 * Valores positivos procuram `Receipt`; valores negativos procuram `Payment`. A funcao devolve apenas
 * sugestoes, nao altera documentos nem marca movimentos como reconciliados.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx Transacao Prisma.
 * @param {string} companyId Empresa ativa.
 * @param {{ bookedAt: Date, amountCents: number }} row Linha normalizada do extrato.
 * @returns {Promise<Array<{ targetType: "RECEIPT" | "PAYMENT", targetId: string, confidence: number, reason: string }>>} Sugestoes candidatas.
 */
async function findMatches(tx, companyId, row) {
    const [receipts, payments] = await Promise.all([
        tx.receipt.findMany({ where: { companyId, amountCents: Math.abs(row.amountCents) }, select: { id: true, receivedAt: true } }),
        tx.payment.findMany({ where: { companyId, amountCents: Math.abs(row.amountCents) }, select: { id: true, paidAt: true } }),
    ]);

    return [
        ...receipts.filter((item) => row.amountCents > 0 && withinThreeDays(row.bookedAt, item.receivedAt)).map((item) => ({ targetType: "RECEIPT", targetId: item.id, confidence: 90, reason: "Valor igual e data proxima de recebimento" })),
        ...payments.filter((item) => row.amountCents < 0 && withinThreeDays(row.bookedAt, item.paidAt)).map((item) => ({ targetType: "PAYMENT", targetId: item.id, confidence: 90, reason: "Valor igual e data proxima de pagamento" })),
    ];
}

/**
 * Importa um extrato bancario textual e cria sugestoes de reconciliacao.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, payload: { treasuryAccountId: string, fileName: string, format: "CSV" | "OFX", rows: Array<{ bookedAt: Date, description: string, reference: string | null, amountCents: number }> } }} input Contexto seguro e payload validado.
 * @returns {Promise<object>} Importacao criada com linhas e sugestoes.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa ou 404 quando a conta nao pertence a empresa.
 */
export async function importBankStatement(prisma, { companyId, userId, payload }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatoria");

    const account = await prisma.treasuryAccount.findFirst({ where: { id: payload.treasuryAccountId, companyId, isActive: true } });
    if (!account) throw httpError(404, "TREASURY_ACCOUNT_NOT_FOUND", "Conta de tesouraria nao encontrada");

    return prisma.$transaction(async (tx) => {
        // A importacao funciona como log de integracao: quem importou, quando, formato e contagem.
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
                // A sugestao fica persistida como SUGGESTED; nenhum pagamento/recebimento e confirmado aqui.
                await tx.bankReconciliationSuggestion.create({ data: { ...match, companyId, statementLineId: line.id } });
            }
            createdLines.push({ ...line, suggestions: matches });
        }

        return { ...statementImport, lines: createdLines };
    });
}
```

5. Explicacao do codigo.

O service valida a conta dentro da empresa, cria a importacao e guarda cada linha. `findMatches` procura recebimentos positivos e pagamentos negativos com valor igual e data proxima. A sugestao fica separada da confirmacao. Os comentarios dentro da transacao tornam explicitos os efeitos secundarios e a fronteira de seguranca: importar nao reconcilia definitivamente.

6. Validacao do passo.

Importa uma linha positiva com valor igual a um recebimento recente e confirma sugestao `RECEIPT`.

7. Cenario negativo/erro esperado.

Conta inativa ou de outra empresa devolve `404 TREASURY_ACCOUNT_NOT_FOUND`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Receber ficheiro textual e devolver linhas importadas com sugestoes.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/statementRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares de seguranca.
    - LOCALIZACAO: ficheiro completo e montagem.

3. Instrucoes do que fazer.

Cria `POST /api/treasury/statements/import`.

4. Codigo completo, correto e integrado com a app final.

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
 * Constroi as routes de importacao de extratos.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependencias da route.
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

5. Explicacao do codigo.

A route protege importacoes, valida payload e chama service. O upload fica textual no MVP para evitar dependencias de ficheiros ate a equipa estabilizar a app. O JSDoc explica o endpoint e o comentario mostra porque `companyId` nao vem do browser.

6. Validacao do passo.

`POST /api/treasury/statements/import` devolve `201` com linhas e sugestoes.

7. Cenario negativo/erro esperado.

Role `GESTOR` sem permissao operacional recebe `403`.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Enviar extrato do frontend para o backend.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/statementApi.ts`
    - EDITAR: nenhum.
    - REVER: `treasuryApi.ts`.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Tipa payload e resposta.

4. Codigo completo, correto e integrado com a app final.

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
 * Resultado resumido da importacao, incluindo sugestoes criadas.
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
 * @param {StatementImportPayload} payload Conta, nome, formato e conteudo textual.
 * @returns {Promise<StatementImportResult>} Importacao criada com linhas e sugestoes.
 * @throws {Error} Quando a API rejeita formato, conta ou sessao.
 */
export async function importStatement(payload: StatementImportPayload): Promise<StatementImportResult> {
    return apiClient.post<StatementImportResult>("/api/treasury/statements/import", payload);
}
```

5. Explicacao do codigo.

O payload e explicito: conta, nome, formato e conteudo. O cliente reutiliza `apiClient`, por isso o cookie HttpOnly segue com `credentials: "include"` sem tokens em `localStorage`. A resposta inclui contagem de linhas para feedback imediato.

6. Validacao do passo.

Confirma que `format` so aceita `CSV` ou `OFX` no componente.

7. Cenario negativo/erro esperado.

Sessao expirada devolve erro controlado.

### Passo 7 - Criar pagina de importacao

1. Objetivo funcional do passo no ERP.

Permitir colar/importar conteudo textual e ver sugestoes geradas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/StatementImportPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `statementApi.ts`.
    - LOCALIZACAO: ficheiro completo e menu.

3. Instrucoes do que fazer.

Cria formulario com conta, formato e conteudo.

4. Codigo completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/StatementImportPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { listTreasuryAccounts, type TreasuryAccount } from "../lib/treasuryApi";
import { importStatement, type StatementImportResult } from "../lib/statementApi";

/**
 * Pagina de importacao textual de extratos bancarios.
 *
 * Carrega contas reais da tesouraria, envia CSV/OFX simplificado e mostra feedback sem confirmar
 * reconciliacao automaticamente.
 *
 * @returns {JSX.Element} Interface de importacao de extratos.
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
            <h1>Importar extrato bancario</h1>
            <form onSubmit={handleSubmit}>
                <select name="treasuryAccountId" required>
                    <option value="">Escolhe a conta</option>
                    {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
                <input name="fileName" placeholder="extrato.csv" required />
                <select name="format" defaultValue="CSV"><option value="CSV">CSV</option><option value="OFX">OFX</option></select>
                <textarea name="content" rows={10} placeholder="data;descricao;referencia;valor" required />
                <button disabled={loading}>{loading ? "A importar..." : "Importar"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {accounts.length === 0 && !error && <p>Cria uma conta de tesouraria antes de importar extratos.</p>}
            {result && <p>Importacao {result.id} criada com {result.totalLines} linhas e {result.lines.reduce((sum, line) => sum + line.suggestions.length, 0)} sugestoes.</p>}
        </main>
    );
}
```

5. Explicacao do codigo.

A pagina recolhe dados minimos para o MVP e usa contas reais carregadas de `BK-MF3-02`, evitando que o aluno copie IDs manualmente. A validacao de seguranca fica no backend. O feedback confirma a importacao e o numero de sugestoes, sem confirmar reconciliacao.

6. Validacao do passo.

Cola uma linha CSV valida e confirma importacao.

7. Cenario negativo/erro esperado.

Conteudo vazio devolve erro de validação.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Confirmar que extratos alimentam a previsao de tesouraria seguinte.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence do BK.
    - REVER: service, route e pagina.
    - LOCALIZACAO: checklist final.

3. Instrucoes do que fazer.

Regista uma importacao com sugestao `RECEIPT` e outra com sugestao `PAYMENT`.

4. Codigo completo, correto e integrado com a app final.

Sem codigo novo neste passo.

5. Explicacao do codigo.

As sugestoes comprovam que a reconciliacao usa dados reais de vendas e compras.

6. Validacao do passo.

Confirmar que linhas importadas pertencem a empresa ativa.

7. Cenario negativo/erro esperado.

Importar para conta de outra empresa devolve `404`.

## Expected results

- `201` com importacao, linhas e sugestoes.
- `400 INVALID_STATEMENT_FORMAT` para formato invalido.
- `404 TREASURY_ACCOUNT_NOT_FOUND` para conta fora da empresa.
- `403` para role sem permissao.

## Critérios de aceite

- CSV e OFX simplificado sao parseados.
- As linhas ficam persistidas.
- Sugestoes nao confirmam reconciliacao.
- Todos os dados usam `companyId`.
- Frontend usa `apiClient` indiretamente via clientes MF3/MF1.

## Validação final

- Confirmar imports.
- Confirmar transacao.
- Confirmar negativos.

## Evidence para PR/defesa

- Payload usado.
- JSON com linhas e sugestoes.
- Provas de formato invalido, role invalida e conta de outra empresa.

## Handoff

BK-MF3-04 usa extratos, saldos, recebimentos e pagamentos para previsao de tesouraria.

## Changelog

- `2026-06-13`: corrigido para parsear CSV/OFX simplificado, guardar linhas, criar sugestoes reais de reconciliacao, carregar contas reais, usar `apiClient`, JSDoc e comentarios didaticos.
