# BK-MF3-02 - Criar contas bancárias/caixa e respetivos saldos.

## Header
- `doc_id`: `GUIA-BK-MF3-02`
- `bk_id`: `BK-MF3-02`
- `macro`: `MF3`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF32`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-03`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-02-criar-contas-bancarias-caixa-e-respetivos-saldos.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar contas bancárias e caixa com saldos iniciais por empresa. Estas contas são a base para importar extratos, reconciliar movimentos e prever tesouraria.

#### Importância

RF32 cria a entidade central da tesouraria. Sem contas reais, BK-MF3-03 não sabe a que conta associar um extrato e BK-MF3-04 não consegue calcular saldos previstos.

#### Scope-in

- Criar conta bancária ou caixa.
- Validar IBAN em contas bancárias.
- Guardar saldo inicial em cêntimos.
- Listar contas ativas por empresa.
- Aplicar roles no backend.

#### Scope-out

- Ligação real a bancos.
- Sincronização bancária automática.
- Transferências entre contas.

#### Estado antes e depois

- Estado antes: não há base de tesouraria documentada para extratos.
- Estado depois: existem `TreasuryAccount` e `TreasuryBalanceSnapshot` por empresa.

#### Pre-requisitos

- Rever RF32 e RNF05.
- Rever contratos MF0 de autenticação, roles e multiempresa.
- Confirmar moeda da empresa em `BK-MF0-06`.

#### Glossário

- **Conta bancária:** conta com IBAN usada para banco.
- **Caixa:** conta interna para dinheiro físico.
- **Saldo inicial:** valor de arranque controlado pelo contabilista.
- **Snapshot:** fotografia do saldo numa data.

#### Conceitos teóricos essenciais

- IBAN identifica uma conta bancária e deve ser validado no backend.
- Valores monetários ficam em cêntimos para evitar erros de casas decimais.
- O frontend pode validar campos, mas a proteção real fica no backend.
- Uma conta pertence sempre a uma empresa.

#### Arquitetura do BK

- Endpoint: `GET /api/treasury/accounts` e `POST /api/treasury/accounts`.
- Roles: leitura `CONTABILISTA`, `OPERACIONAL`, `GESTOR`; escrita `CONTABILISTA`, `OPERACIONAL`.
- Backend: `apps/api/src/modules/treasury`.
- Frontend: `TreasuryAccountsPage`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/treasury/bankAccountValidators.js`
- CRIAR: `apps/api/src/modules/treasury/bankAccountService.js`
- CRIAR: `apps/api/src/modules/treasury/bankAccountRoutes.js`
- CRIAR: `apps/web/src/lib/treasuryApi.ts`
- CRIAR: `apps/web/src/pages/TreasuryAccountsPage.tsx`
- EDITAR: `apps/api/prisma/schema.prisma`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/App.tsx`
- REVER: RF32, RNF05, BK-MF0-03, BK-MF0-06.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e tipos de conta

1. Objetivo funcional do passo no ERP.

Separar conta bancária de caixa antes de criar schema e validações.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: `docs/RF.md`, matriz e backlog.
    - LOCALIZAÇÃO: linhas de RF32 e BK-MF3-02.

3. Instruções do que fazer.

Define que `BANK` exige IBAN e `CASH` não exige IBAN.

- `CANONICO`: RF32 exige contas bancárias/caixa por empresa para suportar tesouraria.
- `DERIVADO`: o MVP guarda o saldo inicial como primeiro `TreasuryBalanceSnapshot`, para o BK-MF3-04 conseguir calcular previsões sem criar outro conceito de saldo.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

A decisão evita misturar dinheiro em caixa com conta bancária.

6. Validação do passo.

Evidence deve indicar os dois tipos aceites: `BANK` e `CASH`.

7. Cenário negativo/erro esperado.

Uma conta bancária sem IBAN deve ser rejeitada.

### Passo 2 - Modelar contas e snapshots

1. Objetivo funcional do passo no ERP.

Guardar contas e saldos por empresa.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: modelo `Company`.
    - LOCALIZAÇÃO: zona de tesouraria.

3. Instruções do que fazer.

Adiciona modelos com unicidade por empresa. No modelo `Company` existente, adiciona também o lado inverso da relação.

4. Código completo, correto e integrado com a app final.

No `model Company` existente, acrescenta este campo:

```prisma
treasuryAccounts TreasuryAccount[] @relation("CompanyTreasuryAccounts")
```

Depois adiciona os modelos de tesouraria:

```prisma
/// Conta de tesouraria da empresa: banco ou caixa.
/// A unicidade por empresa evita que duas contas tenham o mesmo nome no mesmo contexto multiempresa.
model TreasuryAccount {
  id          String   @id @default(uuid())
  companyId   String
  name        String
  type        String
  iban        String?
  currency    String
  isActive    Boolean  @default(true)
  createdById String
  createdAt   DateTime @default(now())

  company   Company @relation("CompanyTreasuryAccounts", fields: [companyId], references: [id])
  snapshots TreasuryBalanceSnapshot[]

  @@unique([companyId, name])
  @@index([companyId, isActive])
}

/// Fotografia de saldo de uma conta num momento específico.
/// O primeiro snapshot nasce com o saldo inicial; snapshots futuros podem vir de reconciliação ou fecho de tesouraria.
model TreasuryBalanceSnapshot {
  id                String   @id @default(uuid())
  companyId         String
  treasuryAccountId String
  balanceCents      Int
  capturedAt        DateTime @default(now())
  capturedById      String

  account TreasuryAccount @relation(fields: [treasuryAccountId], references: [id])

  @@index([companyId, treasuryAccountId, capturedAt])
}
```

5. Explicação do código.

`TreasuryAccount` identifica conta por empresa. `TreasuryBalanceSnapshot` guarda saldo inicial ou posterior. A relação nomeada com `Company` mantém o schema Prisma coerente e a unicidade impede duas contas com o mesmo nome dentro da mesma empresa.

6. Validação do passo.

Migration deve criar as duas tabelas, os índices e validar a relação com `Company`.

7. Cenário negativo/erro esperado.

Sem o campo inverso em `Company`, o Prisma rejeita a relação. Sem `@@unique([companyId, name])`, o aluno pode criar duplicados confusos.

### Passo 3 - Criar validator de payload

1. Objetivo funcional do passo no ERP.

Validar nome, tipo, IBAN, moeda e saldo antes de gravar.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/bankAccountValidators.js`
    - EDITAR: nenhum.
    - REVER: `httpErrors.js`.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Valida tudo no backend. O IBAN fica simplificado para PT50 + 21 algarismos no MVP.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/bankAccountValidators.js
import { httpError } from "../../lib/httpErrors.js";

const accountTypes = new Set(["BANK", "CASH"]);

/**
 * Valida texto obrigatório vindo do payload HTTP.
 *
 * @param {unknown} value Valor recebido no body.
 * @param {string} fieldName Nome do campo para mensagem ao utilizador.
 * @returns {string} Texto limpo.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o campo falta ou e demasiado curto.
 */
function requiredText(value, fieldName) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw httpError(400, "INVALID_TREASURY_ACCOUNT", `${fieldName} é obrigatório`);
    }
    return value.trim();
}

/**
 * Confirma que o saldo chega em cêntimos inteiros.
 *
 * @param {unknown} value Valor enviado pelo frontend.
 * @returns {number} Saldo inicial em cêntimos.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o valor não é inteiro.
 */
function parseInitialBalance(value) {
    if (!Number.isInteger(value)) {
        throw httpError(400, "INVALID_INITIAL_BALANCE", "Saldo inicial deve estar em cêntimos");
    }
    return value;
}

/**
 * Valida o IBAN português para contas bancárias e remove IBAN de contas caixa.
 *
 * @param {string} type Tipo de conta validado.
 * @param {unknown} iban IBAN enviado no payload.
 * @returns {string | null} IBAN normalizado ou null para caixa.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando uma conta bancária não tem IBAN português válido.
 */
function assertIban(type, iban) {
    if (type === "CASH") return null;
    const normalized = requiredText(iban, "IBAN").replace(/\s+/g, "").toUpperCase();
    if (!/^PT50\d{21}$/.test(normalized)) {
        throw httpError(400, "INVALID_IBAN", "IBAN português inválido");
    }
    return normalized;
}

/**
 * Valida o payload de criação de conta de tesouraria.
 *
 * A empresa e o utilizador não entram neste DTO porque vêm da sessão e dos guards da MF0.
 *
 * @param {{ type?: unknown, name?: unknown, iban?: unknown, currency?: unknown, initialBalanceCents?: unknown }} body Body HTTP recebido pela route.
 * @returns {{ name: string, type: "BANK" | "CASH", iban: string | null, currency: string, initialBalanceCents: number }} Payload seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando algum campo funcional é inválido.
 */
export function validateTreasuryAccountPayload(body) {
    const type = requiredText(body.type, "Tipo");
    if (!accountTypes.has(type)) {
        throw httpError(400, "INVALID_TREASURY_ACCOUNT_TYPE", "Tipo deve ser BANK ou CASH");
    }

    return {
        name: requiredText(body.name, "Nome"),
        type,
        iban: assertIban(type, body.iban),
        currency: requiredText(body.currency ?? "EUR", "Moeda").toUpperCase(),
        initialBalanceCents: parseInitialBalance(body.initialBalanceCents ?? 0),
    };
}
```

5. Explicação do código.

O validator impede payload incompleto. `assertIban` exige IBAN para banco e dispensa em caixa. `parseInitialBalance` obriga cêntimos inteiros. O JSDoc mostra ao aluno que o payload não transporta `companyId`: esse dado é sempre resolvido no backend pela sessão.

6. Validação do passo.

Testa conta `BANK` com IBAN válido e conta `CASH` sem IBAN.

7. Cenário negativo/erro esperado.

`BANK` com `iban=""` devolve `400 INVALID_IBAN`.

### Passo 4 - Implementar service transacional

1. Objetivo funcional do passo no ERP.

Criar conta e snapshot do saldo inicial na mesma transação.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/bankAccountService.js`
    - EDITAR: nenhum.
    - REVER: schema criado no passo 2.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Usa `companyId` da sessão e nunca do body.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/bankAccountService.js
import {
    buildCursorPage,
    buildKeysetCondition,
    decodePageCursor,
    parsePageLimit,
} from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";

/**
 * Lista contas de tesouraria ativas da empresa atual.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string }} input Contexto multiempresa vindo da sessão.
 * @returns {Promise<{items: object[], pageInfo: object}>} Página de contas ativas.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando não há empresa ativa.
 */
export async function listTreasuryAccounts(prisma, { companyId, cursor: opaqueCursor, limit: rawLimit }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const pageSize = parsePageLimit(rawLimit);
    const cursor = decodePageCursor(opaqueCursor, "string");
    const keyset = buildKeysetCondition(cursor, {
        sortField: "name",
        direction: "asc",
    });
    const baseWhere = { companyId, isActive: true };
    const rows = await prisma.treasuryAccount.findMany({
        where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: pageSize + 1,
        include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
    });
    return buildCursorPage(rows, {
        limit: pageSize,
        sortField: "name",
        sortType: "string",
    });
}

/**
 * Cria uma conta de tesouraria e o primeiro snapshot de saldo na mesma transação.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, payload: { name: string, type: "BANK" | "CASH", iban: string | null, currency: string, initialBalanceCents: number } }} input Contexto seguro e payload validado.
 * @returns {Promise<object | null>} Conta criada com snapshot mais recente.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa ou 409 quando o nome já existe na empresa.
 */
export async function createTreasuryAccount(prisma, { companyId, userId, payload }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatória");

    const existing = await prisma.treasuryAccount.findUnique({
        where: { companyId_name: { companyId, name: payload.name } },
    });
    if (existing) throw httpError(409, "TREASURY_ACCOUNT_EXISTS", "Já existe uma conta com este nome");

    return prisma.$transaction(async (tx) => {
        // Conta e snapshot ficam na mesma transação para não existir conta sem saldo inicial.
        const account = await tx.treasuryAccount.create({
            data: {
                companyId,
                name: payload.name,
                type: payload.type,
                iban: payload.iban,
                currency: payload.currency,
                createdById: userId,
            },
        });

        await tx.treasuryBalanceSnapshot.create({
            data: {
                companyId,
                treasuryAccountId: account.id,
                balanceCents: payload.initialBalanceCents,
                capturedById: userId,
            },
        });

        return tx.treasuryAccount.findUnique({
            where: { id: account.id },
            include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
        });
    });
}
```

5. Explicação do código.

A transação garante que a conta não fica sem snapshot inicial. A empresa vem da sessão, por isso o browser não consegue criar conta noutra empresa. O JSDoc documenta os efeitos secundários: escrita em `TreasuryAccount` e `TreasuryBalanceSnapshot`.

6. Validação do passo.

Cria uma conta com saldo inicial de `125000` e confirma snapshot com o mesmo valor.

7. Cenário negativo/erro esperado.

Nome duplicado na mesma empresa devolve `409 TREASURY_ACCOUNT_EXISTS`.

### Passo 5 - Expor routes de tesouraria

1. Objetivo funcional do passo no ERP.

Permitir listar e criar contas com roles adequadas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/bankAccountRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares MF0.
    - LOCALIZAÇÃO: ficheiro completo e montagem.

3. Instruções do que fazer.

`GET` permite consulta; `POST` cria conta.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/bankAccountRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateTreasuryAccountPayload } from "./bankAccountValidators.js";
import { createTreasuryAccount, listTreasuryAccounts } from "./bankAccountService.js";

/**
 * Constrói as routes de contas de tesouraria.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependências da route.
 * @returns {import("express").Router} Router montado em `/api/treasury/accounts`.
 */
export function buildTreasuryAccountRoutes({ prisma }) {
    const router = Router();
    const readGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "OPERACIONAL", "GESTOR")];
    const writeGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "OPERACIONAL")];

    router.get("/", readGuards, async (req, res) => {
        try {
            const page = await listTreasuryAccounts(prisma, {
                companyId: req.companyId,
                cursor: req.query.cursor,
                limit: Number(req.query.limit ?? 50),
            });
            return res.status(200).json(page);
        } catch (error) {
            const httpError = toHttpError(error);
            return res.status(httpError.status).json({ error: httpError.code, message: httpError.message });
        }
    });

    router.post("/", writeGuards, async (req, res) => {
        try {
            const payload = validateTreasuryAccountPayload(req.body);
            // companyId e userId vêm dos guards; o frontend nunca controla ownership.
            const account = await createTreasuryAccount(prisma, { companyId: req.companyId, userId: req.user.id, payload });
            return res.status(201).json(account);
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
import { buildTreasuryAccountRoutes } from "./modules/treasury/bankAccountRoutes.js";

app.use("/api/treasury/accounts", buildTreasuryAccountRoutes({ prisma }));
```

5. Explicação do código.

As routes separam leitura e escrita. `GET` e `POST` convertem erros para HTTP controlado. `POST` valida payload antes do service. A role é validada no backend, não apenas escondida no menu, e o comentário reforça que ownership vem da sessão.

6. Validação do passo.

`POST /api/treasury/accounts` com role `CONTABILISTA` devolve `201`.

7. Cenário negativo/erro esperado.

`GESTOR` consegue listar, mas não criar conta.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Dar ao frontend funções tipadas para listar e criar contas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/treasuryApi.ts`
    - EDITAR: nenhum.
    - REVER: cliente API comum.
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Usa tipos específicos de tesouraria.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/treasuryApi.ts
import { apiClient } from "./apiClient";

/**
 * Payload enviado pelo formulario de contas de tesouraria.
 */
export type TreasuryAccountPayload = {
    name: string;
    type: "BANK" | "CASH";
    iban?: string;
    currency: string;
    initialBalanceCents: number;
};

/**
 * Conta devolvida pela API, incluindo o snapshot mais recente para mostrar saldo.
 */
export type TreasuryAccount = TreasuryAccountPayload & {
    id: string;
    isActive: boolean;
    snapshots: Array<{ balanceCents: number; capturedAt: string }>;
};

/**
 * Lista contas de tesouraria usando o cliente HTTP comum da MF1.
 *
 * @returns {Promise<{items: TreasuryAccount[], pageInfo: {nextCursor: string | null, hasNextPage: boolean}}>} Página de contas.
 */
export function listTreasuryAccounts() {
    return apiClient.get<{items: TreasuryAccount[]; pageInfo: {nextCursor: string | null; hasNextPage: boolean}}>("/api/treasury/accounts");
}

/**
 * Cria uma conta bancária ou caixa.
 *
 * @param {TreasuryAccountPayload} payload Dados validados no backend.
 * @returns {Promise<TreasuryAccount>} Conta criada.
 */
export function createTreasuryAccount(payload: TreasuryAccountPayload) {
    return apiClient.post<TreasuryAccount>("/api/treasury/accounts", payload);
}
```

5. Explicação do código.

O cliente usa tipos de payload e resposta e reutiliza `apiClient`, que já envia `credentials: "include"` e transforma erros HTTP em mensagens visíveis. Assim a MF3 não duplica contratos HTTP criados na MF1.

6. Validação do passo.

Chama `listTreasuryAccounts` após criar uma conta.

7. Cenário negativo/erro esperado.

Se o backend devolver `400 INVALID_IBAN`, a página mostra a mensagem sem quebrar.

### Passo 7 - Criar página de contas

1. Objetivo funcional do passo no ERP.

Permitir criar e consultar contas de tesouraria.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/TreasuryAccountsPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `treasuryApi.ts`.
    - LOCALIZAÇÃO: ficheiro completo e menu.

3. Instruções do que fazer.

Mostra formulario e lista com saldo mais recente.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/TreasuryAccountsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createTreasuryAccount, listTreasuryAccounts, type TreasuryAccount } from "../lib/treasuryApi";

/**
 * Formata cêntimos em euros para apresentacao.
 *
 * @param {number} cents Valor em cêntimos.
 * @returns {string} Valor legível em EUR.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Página de gestão de contas bancárias e caixa.
 *
 * Controla estados de lista, erro e loading. A validação final fica no backend para impedir que uma
 * alteração manual no HTML crie contas inválidas.
 *
 * @returns {JSX.Element} Interface de tesouraria.
 */
export function TreasuryAccountsPage() {
    const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function load() {
        setAccounts((await listTreasuryAccounts()).items);
    }

    useEffect(() => { void load().catch((err) => setError(err instanceof Error ? err.message : "Erro inesperado")); }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // O formulario envia euros legiveis; a API recebe cêntimos inteiros.
            await createTreasuryAccount({
                name: String(form.get("name") ?? ""),
                type: String(form.get("type") ?? "BANK") as "BANK" | "CASH",
                iban: String(form.get("iban") ?? ""),
                currency: "EUR",
                initialBalanceCents: Math.round(Number(form.get("initialBalance") ?? 0) * 100),
            });
            await load();
            event.currentTarget.reset();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Contas bancárias e caixa</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Nome da conta" required />
                <select name="type" defaultValue="BANK"><option value="BANK">Banco</option><option value="CASH">Caixa</option></select>
                <input name="iban" placeholder="IBAN se for banco" />
                <input name="initialBalance" type="number" step="0.01" defaultValue="0" />
                <button disabled={loading}>{loading ? "A guardar..." : "Criar conta"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {accounts.length === 0 && !error && <p>Ainda não existem contas de tesouraria.</p>}
            <ul>{accounts.map((account) => <li key={account.id}>{account.name} - {account.type} - {euros(account.snapshots[0]?.balanceCents ?? 0)}</li>)}</ul>
        </main>
    );
}
```

5. Explicação do código.

A página carrega contas ao abrir e volta a carregar após criar. O saldo apresentado vem do snapshot mais recente. A validação final do IBAN fica no backend. O JSDoc documenta os estados de UI e o comentário no submit explica a conversão de euros para cêntimos.

6. Validação do passo.

Cria `Banco Principal` com IBAN válido e confirma listagem.

7. Cenário negativo/erro esperado.

Tentar criar banco sem IBAN mostra erro de validação.

### Passo 8 - Validar entrega e preparar BK seguinte

1. Objetivo funcional do passo no ERP.

Garantir que BK-MF3-03 recebe contas reais para importar extratos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence do BK.
    - REVER: schema, routes, service e página.
    - LOCALIZAÇÃO: checklist da PR.

3. Instruções do que fazer.

Regista caso principal e negativos.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo.

5. Explicação do código.

A evidence demonstra que as contas existem e que o próximo BK pode usar `treasuryAccountId`.

6. Validação do passo.

Confirma `GET /api/treasury/accounts` com pelo menos uma conta.

7. Cenário negativo/erro esperado.

Um utilizador sem empresa ativa recebe `401 COMPANY_CONTEXT_REQUIRED`.

## Expected results

- `POST /api/treasury/accounts` devolve `201`.
- `GET /api/treasury/accounts` devolve contas ativas da empresa.
- Banco sem IBAN devolve `400 INVALID_IBAN`.
- Duplicado devolve `409 TREASURY_ACCOUNT_EXISTS`.
- Role sem permissão de escrita devolve `403`.

## Critérios de aceite

- Conta e snapshot inicial criados na mesma transação.
- Todas as queries usam empresa ativa.
- IBAN validado no backend.
- Frontend usa `apiClient` com cookie HttpOnly.
- Handoff para extratos inclui `treasuryAccountId`.

## Validação final

- Confirmar migration.
- Confirmar route montada.
- Confirmar menu/página.
- Confirmar negativos.

## Evidence para PR/defesa

- JSON da conta criada.
- Screenshot da lista.
- Provas de IBAN inválido, duplicado e role sem permissão.

## Handoff

BK-MF3-03 usa `TreasuryAccount.id` para associar extratos bancários a uma conta real.

## Changelog

- `2026-06-15`: alinhados caminhos técnicos da MF3 com `apps/api` e `apps/web`, preservando contratos RF/RNF, dependências e escopo.
- `2026-06-13`: corrigido para criar contas e snapshots reais, com validator, service transacional, routes com erros controlados, frontend com `apiClient`, JSDoc e comentários didáticos.
