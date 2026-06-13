# BK-MF3-02 - Criar contas bancarias/caixa e respetivos saldos.

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
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais implementar contas bancarias e caixa com saldos iniciais por empresa. Estas contas sao a base para importar extratos, reconciliar movimentos e prever tesouraria.

#### Importancia

RF32 cria a entidade central da tesouraria. Sem contas reais, BK-MF3-03 nao sabe a que conta associar um extrato e BK-MF3-04 nao consegue calcular saldos previstos.

#### Scope-in

- Criar conta bancaria ou caixa.
- Validar IBAN em contas bancarias.
- Guardar saldo inicial em centimos.
- Listar contas ativas por empresa.
- Aplicar roles no backend.

#### Scope-out

- Ligacao real a bancos.
- Sincronizacao bancaria automatica.
- Transferencias entre contas.

#### Estado antes e depois

- Estado antes: nao ha base de tesouraria documentada para extratos.
- Estado depois: existem `TreasuryAccount` e `TreasuryBalanceSnapshot` por empresa.

#### Pre-requisitos

- Rever RF32 e RNF05.
- Rever contratos MF0 de autenticação, roles e multiempresa.
- Confirmar moeda da empresa em `BK-MF0-06`.

#### Glossario

- **Conta bancaria:** conta com IBAN usada para banco.
- **Caixa:** conta interna para dinheiro fisico.
- **Saldo inicial:** valor de arranque controlado pelo contabilista.
- **Snapshot:** fotografia do saldo numa data.

#### Conceitos teoricos essenciais

- IBAN identifica uma conta bancaria e deve ser validado no backend.
- Valores monetarios ficam em centimos para evitar erros de casas decimais.
- O frontend pode validar campos, mas a protecao real fica no backend.
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

#### Tutorial tecnico linear

### Passo 1 - Confirmar contrato e tipos de conta

1. Objetivo funcional do passo no ERP.

Separar conta bancaria de caixa antes de criar schema e validações.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: `docs/RF.md`, matriz e backlog.
    - LOCALIZACAO: linhas de RF32 e BK-MF3-02.

3. Instrucoes do que fazer.

Define que `BANK` exige IBAN e `CASH` nao exige IBAN.

- `CANONICO`: RF32 exige contas bancarias/caixa por empresa para suportar tesouraria.
- `DERIVADO`: o MVP guarda o saldo inicial como primeiro `TreasuryBalanceSnapshot`, para o BK-MF3-04 conseguir calcular previsoes sem criar outro conceito de saldo.

4. Codigo completo, correto e integrado com a app final.

Sem codigo neste passo.

5. Explicacao do codigo.

A decisao evita misturar dinheiro em caixa com conta bancaria.

6. Validacao do passo.

Evidence deve indicar os dois tipos aceites: `BANK` e `CASH`.

7. Cenario negativo/erro esperado.

Uma conta bancaria sem IBAN deve ser rejeitada.

### Passo 2 - Modelar contas e snapshots

1. Objetivo funcional do passo no ERP.

Guardar contas e saldos por empresa.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: modelo `Company`.
    - LOCALIZACAO: zona de tesouraria.

3. Instrucoes do que fazer.

Adiciona modelos com unicidade por empresa. No modelo `Company` existente, adiciona tambem o lado inverso da relacao.

4. Codigo completo, correto e integrado com a app final.

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

/// Fotografia de saldo de uma conta num momento especifico.
/// O primeiro snapshot nasce com o saldo inicial; snapshots futuros podem vir de reconciliacao ou fecho de tesouraria.
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

5. Explicacao do codigo.

`TreasuryAccount` identifica conta por empresa. `TreasuryBalanceSnapshot` guarda saldo inicial ou posterior. A relacao nomeada com `Company` mantem o schema Prisma coerente e a unicidade impede duas contas com o mesmo nome dentro da mesma empresa.

6. Validacao do passo.

Migration deve criar as duas tabelas, os indices e validar a relacao com `Company`.

7. Cenario negativo/erro esperado.

Sem o campo inverso em `Company`, o Prisma rejeita a relacao. Sem `@@unique([companyId, name])`, o aluno pode criar duplicados confusos.

### Passo 3 - Criar validator de payload

1. Objetivo funcional do passo no ERP.

Validar nome, tipo, IBAN, moeda e saldo antes de gravar.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/bankAccountValidators.js`
    - EDITAR: nenhum.
    - REVER: `httpErrors.js`.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Valida tudo no backend. O IBAN fica simplificado para PT50 + 21 algarismos no MVP.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/bankAccountValidators.js
import { httpError } from "../../lib/httpErrors.js";

const accountTypes = new Set(["BANK", "CASH"]);

/**
 * Valida texto obrigatorio vindo do payload HTTP.
 *
 * @param {unknown} value Valor recebido no body.
 * @param {string} fieldName Nome do campo para mensagem ao utilizador.
 * @returns {string} Texto limpo.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o campo falta ou e demasiado curto.
 */
function requiredText(value, fieldName) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw httpError(400, "INVALID_TREASURY_ACCOUNT", `${fieldName} e obrigatorio`);
    }
    return value.trim();
}

/**
 * Confirma que o saldo chega em centimos inteiros.
 *
 * @param {unknown} value Valor enviado pelo frontend.
 * @returns {number} Saldo inicial em centimos.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o valor nao e inteiro.
 */
function parseInitialBalance(value) {
    if (!Number.isInteger(value)) {
        throw httpError(400, "INVALID_INITIAL_BALANCE", "Saldo inicial deve estar em centimos");
    }
    return value;
}

/**
 * Valida o IBAN portugues para contas bancarias e remove IBAN de contas caixa.
 *
 * @param {string} type Tipo de conta validado.
 * @param {unknown} iban IBAN enviado no payload.
 * @returns {string | null} IBAN normalizado ou null para caixa.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando uma conta bancaria nao tem IBAN portugues valido.
 */
function assertIban(type, iban) {
    if (type === "CASH") return null;
    const normalized = requiredText(iban, "IBAN").replace(/\s+/g, "").toUpperCase();
    if (!/^PT50\d{21}$/.test(normalized)) {
        throw httpError(400, "INVALID_IBAN", "IBAN portugues invalido");
    }
    return normalized;
}

/**
 * Valida o payload de criacao de conta de tesouraria.
 *
 * A empresa e o utilizador nao entram neste DTO porque vêm da sessao e dos guards da MF0.
 *
 * @param {{ type?: unknown, name?: unknown, iban?: unknown, currency?: unknown, initialBalanceCents?: unknown }} body Body HTTP recebido pela route.
 * @returns {{ name: string, type: "BANK" | "CASH", iban: string | null, currency: string, initialBalanceCents: number }} Payload seguro para o service.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando algum campo funcional e invalido.
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

5. Explicacao do codigo.

O validator impede payload incompleto. `assertIban` exige IBAN para banco e dispensa em caixa. `parseInitialBalance` obriga centimos inteiros. O JSDoc mostra ao aluno que o payload nao transporta `companyId`: esse dado e sempre resolvido no backend pela sessao.

6. Validacao do passo.

Testa conta `BANK` com IBAN valido e conta `CASH` sem IBAN.

7. Cenario negativo/erro esperado.

`BANK` com `iban=""` devolve `400 INVALID_IBAN`.

### Passo 4 - Implementar service transacional

1. Objetivo funcional do passo no ERP.

Criar conta e snapshot do saldo inicial na mesma transacao.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/bankAccountService.js`
    - EDITAR: nenhum.
    - REVER: schema criado no passo 2.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Usa `companyId` da sessao e nunca do body.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/treasury/bankAccountService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Lista contas de tesouraria ativas da empresa atual.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string }} input Contexto multiempresa vindo da sessao.
 * @returns {Promise<Array<object>>} Contas ativas com o snapshot mais recente.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 quando nao ha empresa ativa.
 */
export async function listTreasuryAccounts(prisma, { companyId }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatoria");

    return prisma.treasuryAccount.findMany({
        where: { companyId, isActive: true },
        orderBy: { name: "asc" },
        include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
    });
}

/**
 * Cria uma conta de tesouraria e o primeiro snapshot de saldo na mesma transacao.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, payload: { name: string, type: "BANK" | "CASH", iban: string | null, currency: string, initialBalanceCents: number } }} input Contexto seguro e payload validado.
 * @returns {Promise<object | null>} Conta criada com snapshot mais recente.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa ou 409 quando o nome ja existe na empresa.
 */
export async function createTreasuryAccount(prisma, { companyId, userId, payload }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatoria");

    const existing = await prisma.treasuryAccount.findUnique({
        where: { companyId_name: { companyId, name: payload.name } },
    });
    if (existing) throw httpError(409, "TREASURY_ACCOUNT_EXISTS", "Ja existe uma conta com este nome");

    return prisma.$transaction(async (tx) => {
        // Conta e snapshot ficam na mesma transacao para nao existir conta sem saldo inicial.
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

5. Explicacao do codigo.

A transacao garante que a conta nao fica sem snapshot inicial. A empresa vem da sessao, por isso o browser nao consegue criar conta noutra empresa. O JSDoc documenta os efeitos secundarios: escrita em `TreasuryAccount` e `TreasuryBalanceSnapshot`.

6. Validacao do passo.

Cria uma conta com saldo inicial de `125000` e confirma snapshot com o mesmo valor.

7. Cenario negativo/erro esperado.

Nome duplicado na mesma empresa devolve `409 TREASURY_ACCOUNT_EXISTS`.

### Passo 5 - Expor routes de tesouraria

1. Objetivo funcional do passo no ERP.

Permitir listar e criar contas com roles adequadas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/treasury/bankAccountRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares MF0.
    - LOCALIZACAO: ficheiro completo e montagem.

3. Instrucoes do que fazer.

`GET` permite consulta; `POST` cria conta.

4. Codigo completo, correto e integrado com a app final.

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
 * Constroi as routes de contas de tesouraria.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependencias da route.
 * @returns {import("express").Router} Router montado em `/api/treasury/accounts`.
 */
export function buildTreasuryAccountRoutes({ prisma }) {
    const router = Router();
    const readGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "OPERACIONAL", "GESTOR")];
    const writeGuards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "OPERACIONAL")];

    router.get("/", readGuards, async (req, res) => {
        try {
            const accounts = await listTreasuryAccounts(prisma, { companyId: req.companyId });
            return res.status(200).json(accounts);
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

5. Explicacao do codigo.

As routes separam leitura e escrita. `GET` e `POST` convertem erros para HTTP controlado. `POST` valida payload antes do service. A role e validada no backend, nao apenas escondida no menu, e o comentario reforca que ownership vem da sessao.

6. Validacao do passo.

`POST /api/treasury/accounts` com role `CONTABILISTA` devolve `201`.

7. Cenario negativo/erro esperado.

`GESTOR` consegue listar, mas nao criar conta.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Dar ao frontend funcoes tipadas para listar e criar contas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/treasuryApi.ts`
    - EDITAR: nenhum.
    - REVER: cliente API comum.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Usa tipos especificos de tesouraria.

4. Codigo completo, correto e integrado com a app final.

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
 * @returns {Promise<TreasuryAccount[]>} Contas ativas da empresa atual.
 */
export function listTreasuryAccounts() {
    return apiClient.get<TreasuryAccount[]>("/api/treasury/accounts");
}

/**
 * Cria uma conta bancaria ou caixa.
 *
 * @param {TreasuryAccountPayload} payload Dados validados no backend.
 * @returns {Promise<TreasuryAccount>} Conta criada.
 */
export function createTreasuryAccount(payload: TreasuryAccountPayload) {
    return apiClient.post<TreasuryAccount>("/api/treasury/accounts", payload);
}
```

5. Explicacao do codigo.

O cliente usa tipos de payload e resposta e reutiliza `apiClient`, que ja envia `credentials: "include"` e transforma erros HTTP em mensagens visiveis. Assim a MF3 nao duplica contratos HTTP criados na MF1.

6. Validacao do passo.

Chama `listTreasuryAccounts` após criar uma conta.

7. Cenario negativo/erro esperado.

Se o backend devolver `400 INVALID_IBAN`, a pagina mostra a mensagem sem quebrar.

### Passo 7 - Criar pagina de contas

1. Objetivo funcional do passo no ERP.

Permitir criar e consultar contas de tesouraria.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/TreasuryAccountsPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `treasuryApi.ts`.
    - LOCALIZACAO: ficheiro completo e menu.

3. Instrucoes do que fazer.

Mostra formulario e lista com saldo mais recente.

4. Codigo completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/TreasuryAccountsPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { createTreasuryAccount, listTreasuryAccounts, type TreasuryAccount } from "../lib/treasuryApi";

/**
 * Formata centimos em euros para apresentacao.
 *
 * @param {number} cents Valor em centimos.
 * @returns {string} Valor legivel em EUR.
 */
function euros(cents: number) {
    return `${(cents / 100).toFixed(2)} EUR`;
}

/**
 * Pagina de gestao de contas bancarias e caixa.
 *
 * Controla estados de lista, erro e loading. A validacao final fica no backend para impedir que uma
 * alteracao manual no HTML crie contas invalidas.
 *
 * @returns {JSX.Element} Interface de tesouraria.
 */
export function TreasuryAccountsPage() {
    const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function load() {
        setAccounts(await listTreasuryAccounts());
    }

    useEffect(() => { void load().catch((err) => setError(err instanceof Error ? err.message : "Erro inesperado")); }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // O formulario envia euros legiveis; a API recebe centimos inteiros.
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
            <h1>Contas bancarias e caixa</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Nome da conta" required />
                <select name="type" defaultValue="BANK"><option value="BANK">Banco</option><option value="CASH">Caixa</option></select>
                <input name="iban" placeholder="IBAN se for banco" />
                <input name="initialBalance" type="number" step="0.01" defaultValue="0" />
                <button disabled={loading}>{loading ? "A guardar..." : "Criar conta"}</button>
            </form>
            {error && <p role="alert">{error}</p>}
            {accounts.length === 0 && !error && <p>Ainda nao existem contas de tesouraria.</p>}
            <ul>{accounts.map((account) => <li key={account.id}>{account.name} - {account.type} - {euros(account.snapshots[0]?.balanceCents ?? 0)}</li>)}</ul>
        </main>
    );
}
```

5. Explicacao do codigo.

A pagina carrega contas ao abrir e volta a carregar apos criar. O saldo apresentado vem do snapshot mais recente. A validacao final do IBAN fica no backend. O JSDoc documenta os estados de UI e o comentario no submit explica a conversao de euros para centimos.

6. Validacao do passo.

Cria `Banco Principal` com IBAN valido e confirma listagem.

7. Cenario negativo/erro esperado.

Tentar criar banco sem IBAN mostra erro de validação.

### Passo 8 - Validar entrega e preparar BK seguinte

1. Objetivo funcional do passo no ERP.

Garantir que BK-MF3-03 recebe contas reais para importar extratos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence do BK.
    - REVER: schema, routes, service e pagina.
    - LOCALIZACAO: checklist da PR.

3. Instrucoes do que fazer.

Regista caso principal e negativos.

4. Codigo completo, correto e integrado com a app final.

Sem codigo novo neste passo.

5. Explicacao do codigo.

A evidence demonstra que as contas existem e que o proximo BK pode usar `treasuryAccountId`.

6. Validacao do passo.

Confirma `GET /api/treasury/accounts` com pelo menos uma conta.

7. Cenario negativo/erro esperado.

Um utilizador sem empresa ativa recebe `401 COMPANY_CONTEXT_REQUIRED`.

## Expected results

- `POST /api/treasury/accounts` devolve `201`.
- `GET /api/treasury/accounts` devolve contas ativas da empresa.
- Banco sem IBAN devolve `400 INVALID_IBAN`.
- Duplicado devolve `409 TREASURY_ACCOUNT_EXISTS`.
- Role sem permissao de escrita devolve `403`.

## Critérios de aceite

- Conta e snapshot inicial criados na mesma transacao.
- Todas as queries usam empresa ativa.
- IBAN validado no backend.
- Frontend usa `apiClient` com cookie HttpOnly.
- Handoff para extratos inclui `treasuryAccountId`.

## Validação final

- Confirmar migration.
- Confirmar route montada.
- Confirmar menu/pagina.
- Confirmar negativos.

## Evidence para PR/defesa

- JSON da conta criada.
- Screenshot da lista.
- Provas de IBAN invalido, duplicado e role sem permissao.

## Handoff

BK-MF3-03 usa `TreasuryAccount.id` para associar extratos bancarios a uma conta real.

## Changelog

- `2026-06-13`: corrigido para criar contas e snapshots reais, com validator, service transacional, routes com erros controlados, frontend com `apiClient`, JSDoc e comentarios didaticos.
