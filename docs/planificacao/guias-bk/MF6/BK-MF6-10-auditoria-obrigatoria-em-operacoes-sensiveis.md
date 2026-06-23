# BK-MF6-10 - Auditoria obrigatória em operações sensíveis.

## Header

- `doc_id`: `GUIA-BK-MF6-10`
- `bk_id`: `BK-MF6-10`
- `macro`: `MF6`
- `owner`: `Oleksii`
- `apoio`: `Sofia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF17`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-01`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`
- `last_updated`: `2026-06-22`

#### Objetivo

Neste BK vais tornar obrigatória a auditoria de operações sensíveis. O `RNF17` exige que ações relevantes fiquem rastreáveis: quem fez, quando fez, em que empresa e que tipo de ação ocorreu.

O aluno vai criar um helper de auditoria de uso transversal, integrá-lo em operações críticas e validar que logs não expõem dados financeiros completos.

#### Importância

Auditoria é essencial num ERP financeiro. Quando alguém altera permissões, emite documentos, fecha períodos, importa extratos ou confirma reconciliação, a empresa precisa de rastreabilidade.

Este BK fecha a MF6 e prepara MF7, onde backups, retenção legal, exportações e importações precisam de evidence operacional.

#### Scope-in

- Definir lista de operações sensíveis.
- Criar helper de registo de auditoria.
- Integrar em pelo menos três fluxos críticos.
- Evitar guardar payload completo.
- Criar smoke textual.
- Definir negativos para operação sem auditoria e dados sensíveis em log.

#### Scope-out

- Criar SIEM externo.
- Guardar conteúdo integral de documentos financeiros.
- Alterar regras de permissões.
- Criar dashboard de auditoria avançado.
- Substituir logs de integração de MF4.

#### Estado antes e depois

- Antes: `BK-MF4-09` introduz auditoria funcional.
- Depois: MF6 reforça a obrigatoriedade em operações sensíveis e fecha a macrofase com mapa de rastreabilidade.

#### Pre-requisitos

- Ler `RNF17`.
- Rever `BK-MF4-09` e `BK-MF4-10`.
- Rever operações de permissões, períodos fiscais, documentos, importações e reconciliações.
- Confirmar `apps/api/src/modules/audit/auditLogService.js`.

#### Glossário

- Auditoria: registo de ação relevante para rastreabilidade.
- Operação sensível: ação com impacto em dados, permissões, contabilidade ou segurança.
- Ator: utilizador autenticado que executa a ação.
- Entidade alvo: recurso afetado pela ação.
- Metadados mínimos: dados necessários para investigar sem expor conteúdo excessivo.
- Log de integração: registo técnico de importações ou comunicação externa.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF17` exige auditoria obrigatória em operações sensíveis.
- `CANONICO`: `RF47` já define registar quem, quando e o quê.
- `DERIVADO`: MF6 deve transformar auditoria em gate transversal de robustez.

Auditoria não é `console.log`. Um registo útil tem ator, empresa, ação, alvo, momento e resultado. Ao mesmo tempo, não deve guardar dados financeiros completos quando bastam identificadores e resumo.

#### Arquitetura do BK

- Endpoint(s): operações sensíveis existentes.
- Modelo/schema Prisma: audit log já previsto por MF4.
- Service(s): `auditLogService`.
- Controller/route: chama helper após sucesso ou falha relevante.
- Guard/middleware: sessão e permissões.
- Cliente API: sem alteração obrigatória.
- Testes: smoke textual e contracts.
- Handoff para o próximo BK: backups e retenção.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/audit/auditLogService.js`
- EDITAR: services de permissões, períodos fiscais e documentos.
- CRIAR: `apps/api/scripts/check-mf6-audit-gate.mjs`
- EDITAR: `apps/api/package.json`
- REVER: `apps/api/src/modules/integrations/integrationLogService.js`

#### Tutorial técnico linear

### Passo 1 - Definir operações sensíveis

1. Objetivo funcional do passo no contexto da app.

Criar lista fechada de ações que exigem auditoria.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/RF.md`
    - REVER: services de domínio.
    - LOCALIZAÇÃO: operações críticas.

3. Instruções do que fazer.

Inclui permissões, períodos fiscais, documentos, importações, reconciliação e alterações de segurança.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É decisão de contrato.

5. Explicação do código.

Auditar tudo gera ruído; auditar pouco deixa lacunas. A lista fechada equilibra.

6. Validação do passo.

Lista final cita fonte RF/RNF ou BK anterior.

7. Cenário negativo/erro esperado.

Operação de permissões fora da lista deve ser adicionada antes de fechar.

### Passo 2 - Reforçar helper de auditoria

1. Objetivo funcional do passo no contexto da app.

Centralizar registo seguro sem quebrar o contrato criado em `BK-MF4-09`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/audit/auditLogService.js`
    - LOCALIZAÇÃO: função de registo.

3. Instruções do que fazer.

Mantém `recordAuditLog(prisma, input)` como função base do ficheiro e acrescenta `recordSensitiveAudit(prisma, input)` como camada de validação para operações sensíveis. Não cries campos novos no modelo Prisma; usa `entity`, `entityId` e `details`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Service de auditoria operacional da OPSA.
 */

const SENSITIVE_ACTIONS = new Set([
    "permissions.update",
    "fiscalPeriod.close",
    "document.issue",
    "security.setting.update",
]);

const FORBIDDEN_DETAIL_KEYS = new Set([
    "password",
    "token",
    "secret",
    "authorization",
    "cookie",
    "rawpayload",
    "documentlines",
]);

/**
 * Confirma se a ação pertence ao contrato sensível de MF6.
 *
 * @param {string} action - Ação funcional a auditar.
 * @returns {void}
 */
function assertSensitiveAction(action) {
    if (!SENSITIVE_ACTIONS.has(action)) {
        throw new Error(`Ação sensível não declarada: ${action}`);
    }
}

/**
 * Impede guardar payloads completos ou credenciais em `details`.
 *
 * @param {Record<string, unknown>} details - Detalhes mínimos da operação.
 * @returns {Record<string, unknown>} Detalhes aprovados para auditoria.
 */
function assertSafeDetails(details) {
    for (const key of Object.keys(details)) {
        // O Set está em minúsculas para bloquear chaves perigosas em qualquer capitalização.
        const normalizedKey = key.toLowerCase();
        if (FORBIDDEN_DETAIL_KEYS.has(normalizedKey)) {
            throw new Error(`Detalhe sensível proibido no audit log: ${key}`);
        }
    }

    return details;
}

/**
 * Regista uma operação sensível usando o contrato `AuditLog` já criado em MF4.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma ou transação.
 * @param {{ companyId: string, userId: string, action: string, entity: string, entityId: string, details?: Record<string, unknown> }} input - Dados mínimos de auditoria.
 * @returns {Promise<object>} Log criado.
 */
export function recordSensitiveAudit(prisma, input) {
    assertSensitiveAction(input.action);
    const details = assertSafeDetails(input.details ?? {});

    // A empresa e o utilizador vêm do backend autenticado; o frontend não decide ownership.
    return recordAuditLog(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        // O resultado fica dentro de details para não inventar colunas Prisma fora do schema.
        details,
    });
}
```

5. Explicação do código.

O helper exige ação declarada e detalhes mínimos, mas continua a usar o contrato de `BK-MF4-09`: `companyId`, `userId`, `action`, `entity`, `entityId` e `details`. Isto evita imports partidos e campos Prisma inexistentes. O resultado da operação, por exemplo `success`, fica em `details.result`, porque o modelo `AuditLog` não tem coluna `result`.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/audit/auditLogService.js`.

7. Cenário negativo/erro esperado.

Ação não declarada lança erro para forçar decisão explícita.

### Passo 3 - Integrar em permissões

1. Objetivo funcional do passo no contexto da app.

Auditar alteração de roles/permissões.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/company-users/companyUserService.js`
    - EDITAR: `apps/api/src/modules/company-users/companyUserController.js`
    - LOCALIZAÇÃO: função `updateCompanyUserRole` e chamada no handler `updateRole`.

3. Instruções do que fazer.

Importa `recordSensitiveAudit`, passa `actorUserId` desde o controller e grava o audit log dentro da mesma transação da alteração de role.

4. Código completo, correto e integrado com a app final.

```js
import { recordSensitiveAudit } from "../audit/auditLogService.js";

/**
 * Atualiza a role de um membro da empresa e audita a alteração sensível.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, actorUserId: string, targetUserId: string, role: string }} input - Dados da alteração.
 * @returns {Promise<{ userId: string, role: string }>} Role atualizada.
 */
export async function updateCompanyUserRole(
    prisma,
    { companyId, actorUserId, targetUserId, role },
) {
    return prisma.$transaction(async (tx) => {
        await assertNotLastAdmin(tx, { companyId, targetUserId });

        const updated = await tx.companyMembership.updateMany({
            where: { companyId, userId: targetUserId, isActive: true },
            data: { role },
        });

        if (updated.count === 0) {
            throw httpError(
                404,
                "USER_NOT_IN_COMPANY",
                "Utilizador não pertence à empresa",
            );
        }

        // A auditoria usa a mesma transação para não ficar sucesso sem alteração real.
        await recordSensitiveAudit(tx, {
            companyId,
            userId: actorUserId,
            action: "permissions.update",
            entity: "CompanyMembership",
            entityId: targetUserId,
            details: { result: "success", newRole: role },
        });

        return { userId: targetUserId, role };
    });
}
```

```js
const result = await updateCompanyUserRole(prisma, {
    companyId: req.companyId,
    actorUserId: req.user.id,
    targetUserId: req.params.id,
    role: input.role,
});
```

5. Explicação do código.

O service recebe `actorUserId` do backend autenticado e nunca do corpo do pedido. A transação junta alteração e auditoria: se a alteração da role falhar, não há audit log de sucesso; se a auditoria falhar, a alteração também não fecha. O controller apenas passa `req.companyId`, `req.user.id` e `req.params.id`, preservando o contexto multiempresa e impedindo que o frontend escolha a empresa ativa.

6. Validação do passo.

Alteração válida de role devolve `200` e cria audit log com `action: "permissions.update"` e `entity: "CompanyMembership"`.

7. Cenário negativo/erro esperado.

Utilizador sem permissão deve devolver `403` antes de chegar ao service. Tentativa de alterar o último `ADMIN` ativo continua a devolver `409`.

### Passo 4 - Integrar em períodos fiscais

1. Objetivo funcional do passo no contexto da app.

Auditar fecho de períodos fiscais.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/fiscal-periods/fiscalPeriodService.js`
    - LOCALIZAÇÃO: função `closeFiscalPeriod`.

3. Instruções do que fazer.

Importa `recordSensitiveAudit` e regista `fiscalPeriod.close` dentro da transação que fecha o período.

4. Código completo, correto e integrado com a app final.

```js
import { recordSensitiveAudit } from "../audit/auditLogService.js";

/**
 * Fecha período fiscal aberto e audita a operação sensível.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, periodId: string, actorUserId: string, now?: Date }} input - Dados de fecho.
 * @returns {Promise<object>} Período fechado.
 */
export async function closeFiscalPeriod(
    prisma,
    { companyId, periodId, actorUserId, now = new Date() },
) {
    return prisma.$transaction(async (tx) => {
        const period = await tx.fiscalPeriod.findFirst({
            where: { id: periodId, companyId },
        });

        if (!period) {
            throw httpError(
                404,
                "FISCAL_PERIOD_NOT_FOUND",
                "Período fiscal não encontrado",
            );
        }
        if (period.status === "CLOSED") {
            throw httpError(
                409,
                "FISCAL_PERIOD_ALREADY_CLOSED",
                "Período fiscal já está fechado",
            );
        }

        const closed = await tx.fiscalPeriod.update({
            where: { id: period.id },
            data: {
                status: "CLOSED",
                closedAt: now,
                closedById: actorUserId,
            },
        });

        // Fechar um período muda bloqueios contabilísticos; por isso fica auditado.
        await recordSensitiveAudit(tx, {
            companyId,
            userId: actorUserId,
            action: "fiscalPeriod.close",
            entity: "FiscalPeriod",
            entityId: closed.id,
            details: {
                result: "success",
                status: closed.status,
                closedAt: closed.closedAt?.toISOString() ?? null,
            },
        });

        return serialize(closed);
    });
}
```

5. Explicação do código.

O fecho do período fiscal passa a ser uma operação atómica: altera o estado e cria audit log na mesma transação. Isto preserva o bloqueio de lançamentos em período fechado e acrescenta rastreabilidade sem guardar documentos financeiros completos.

6. Validação do passo.

Fecho válido gera audit log com `action: "fiscalPeriod.close"`. Segundo pedido sobre o mesmo período devolve `409` e não cria novo log de sucesso.

7. Cenário negativo/erro esperado.

Tentativa de lançamento em período fechado continua a falhar através de `assertOpenFiscalPeriod`.

### Passo 5 - Integrar em documentos e rever reconciliação

1. Objetivo funcional do passo no contexto da app.

Auditar emissão de documento financeiro e manter a reconciliação dentro do contrato real da MF6.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/sales/saleDocumentService.js`
    - REVER: `apps/api/src/modules/treasury/statementImportService.js`
    - LOCALIZAÇÃO: função `issueSaleDocument` e fluxo de sugestões de reconciliação.

3. Instruções do que fazer.

Substitui a escrita direta em `tx.auditLog.create` por `recordSensitiveAudit`. Na reconciliação, confirma que `BK-MF6-03` ainda só cria sugestões e não confirma movimentos automaticamente; não inventes uma ação de confirmação sem BK próprio.

4. Código completo, correto e integrado com a app final.

```js
import { recordSensitiveAudit } from "../audit/auditLogService.js";

/**
 * Emite definitivamente um documento de venda aprovado e audita a emissão.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {string} companyId - Empresa ativa.
 * @param {string} userId - Utilizador autenticado.
 * @param {string} id - Documento alvo.
 * @returns {Promise<object>} Documento emitido.
 */
export async function issueSaleDocument(prisma, companyId, userId, id) {
    return prisma.$transaction(async (tx) => {
        const document = await tx.saleDocument.findFirst({
            where: { id, companyId },
            include: { lines: true },
        });

        if (!document) {
            throw httpError(
                404,
                "SALE_DOCUMENT_NOT_FOUND",
                "Documento de venda não encontrado",
            );
        }
        if (document.status !== "APPROVED") {
            throw httpError(
                409,
                "INVALID_STATUS",
                "Apenas documentos aprovados podem ser emitidos",
            );
        }
        if (document.number) {
            throw httpError(
                409,
                "DOCUMENT_ALREADY_ISSUED",
                "Documento já emitido",
            );
        }

        await assertOpenFiscalPeriod(tx, {
            companyId,
            documentDate: document.issuedAt,
        });

        const settled = document.kind === "INVOICE_RECEIPT";
        const issuedAt = new Date();

        const claimed = await tx.saleDocument.updateMany({
            where: {
                id: document.id,
                companyId,
                status: "APPROVED",
                number: null,
            },
            data: {
                status: settled ? "SETTLED" : "ISSUED",
                amountPaidCents: settled
                    ? document.totalCents
                    : document.amountPaidCents,
                issuedById: userId,
                issuedDefinitiveAt: issuedAt,
            },
        });

        if (claimed.count !== 1) {
            throw httpError(
                409,
                "DOCUMENT_ALREADY_ISSUED",
                "Documento já foi emitido por outra operação",
            );
        }

        const number = await nextSaleNumber(
            tx,
            companyId,
            document.kind,
            document.issuedAt,
        );
        const issued = await tx.saleDocument.update({
            where: { id: document.id },
            data: { number },
            include: { customer: true, lines: true },
        });

        // O audit log guarda identificadores e totais resumidos, não as linhas completas.
        await recordSensitiveAudit(tx, {
            companyId,
            userId,
            action: "document.issue",
            entity: "SaleDocument",
            entityId: issued.id,
            details: {
                result: "success",
                number,
                status: issued.status,
                totalCents: issued.totalCents,
            },
        });

        return issued;
    });
}
```

5. Explicação do código.

`issueSaleDocument` já valida empresa ativa, estado do documento, período fiscal aberto e concorrência. A correção troca a escrita direta em `tx.auditLog.create` por `recordSensitiveAudit`, mantendo a mesma transação e o mesmo modelo `AuditLog`. O log fica suficiente para investigar a emissão, mas não guarda linhas do documento nem payload completo. Para reconciliação, o contrato atual de MF6 é sugestão sem confirmação automática; se uma confirmação real for criada numa MF seguinte, terá de usar esta mesma função de auditoria antes de fechar a operação.

6. Validação do passo.

Emissão válida gera audit log com `action: "document.issue"` e `entity: "SaleDocument"`. A revisão de `statementImportService.js` confirma que sugestões de reconciliação não alteram saldos nem confirmam movimentos automaticamente.

7. Cenário negativo/erro esperado.

Falha de validação, documento não aprovado, período fechado ou emissão concorrente não deve gerar audit log de sucesso.

### Passo 6 - Criar smoke textual

1. Objetivo funcional do passo no contexto da app.

Detetar operações sensíveis sem auditoria.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-audit-gate.mjs`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: script e entrada `test:mf6:audit`.

3. Instruções do que fazer.

Cria o script abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual do BK-MF6-10.
 */

import { readFileSync } from "node:fs";

const auditService = readFileSync("src/modules/audit/auditLogService.js", "utf8");
const companyUserService = readFileSync(
    "src/modules/company-users/companyUserService.js",
    "utf8",
);
const fiscalPeriodService = readFileSync(
    "src/modules/fiscal-periods/fiscalPeriodService.js",
    "utf8",
);
const saleDocumentService = readFileSync(
    "src/modules/sales/saleDocumentService.js",
    "utf8",
);

for (const action of [
    "permissions.update",
    "fiscalPeriod.close",
    "document.issue",
]) {
    if (!auditService.includes(action)) {
        throw new Error(`Falta ação sensível declarada: ${action}`);
    }
}

for (const forbiddenField of ["targetType", "targetId", "metadata:"]) {
    if (auditService.includes(forbiddenField)) {
        throw new Error(`Campo incompatível com AuditLog: ${forbiddenField}`);
    }
}

for (const forbiddenDetailKey of ["rawpayload", "documentlines"]) {
    if (!auditService.includes(`"${forbiddenDetailKey}"`)) {
        throw new Error(`Falta detalhe proibido normalizado: ${forbiddenDetailKey}`);
    }
}

const serviceContracts = [
    ["company-users", companyUserService, "permissions.update"],
    ["fiscal-periods", fiscalPeriodService, "fiscalPeriod.close"],
    ["sales", saleDocumentService, "document.issue"],
];

for (const [name, content, action] of serviceContracts) {
    // O gate prova cobertura mínima: cada fluxo crítico tem chamada real ao helper.
    if (!content.includes("recordSensitiveAudit") || !content.includes(action)) {
        throw new Error(`Falta auditoria sensível no service ${name}`);
    }
}

if (!auditService.includes("recordSensitiveAudit")) {
    throw new Error("Falta helper de auditoria sensível.");
}
```

5. Explicação do código.

O smoke já não valida apenas a existência do helper. Ele confirma quatro coisas: as ações estão declaradas, o helper não inventa campos fora de `AuditLog`, as chaves proibidas estão normalizadas em minúsculas e três services críticos chamam `recordSensitiveAudit`. Isto reduz o risco de fechar a MF6 com uma função central que nunca é usada nos fluxos reais ou que deixa passar payloads completos por diferença de maiúsculas/minúsculas.

6. Validação do passo.

Executa `cd apps/api && node scripts/check-mf6-audit-gate.mjs`.

7. Cenário negativo/erro esperado.

Se um service deixar de chamar `recordSensitiveAudit`, o script falha e impede fechar a evidence.

### Passo 7 - Testar negativos de auditoria

1. Objetivo funcional do passo no contexto da app.

Garantir que logs são úteis e seguros.

2. Ficheiros envolvidos:
    - REVER: testes de services.
    - LOCALIZAÇÃO: audit log.

3. Instruções do que fazer.

Testa ação não declarada, detalhes excessivos e operação sem sessão. Para detalhes excessivos, usa explicitamente `details: { rawPayload: {}, documentLines: [] }` e confirma que ambos são rejeitados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Usa testes do padrão existente.

5. Explicação do código.

A auditoria deve ser obrigatória, mas também deve limitar dados registados.

6. Validação do passo.

Ação não declarada falha; `details` com `rawPayload` ou `documentLines` falha; operação sem sessão devolve `401`.

7. Cenário negativo/erro esperado.

Audit log com documento completo, por exemplo `rawPayload` ou `documentLines`, deve ser rejeitado antes de persistir.

### Passo 8 - Fechar a MF6

1. Objetivo funcional do passo no contexto da app.

Preparar handoff para MF7.

2. Ficheiros envolvidos:
    - REVER: outputs MF6.
    - LOCALIZAÇÃO: PR ou relatório.

3. Instruções do que fazer.

Resume performance, segurança, credenciais e auditoria com evidence.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É fecho de macrofase.

5. Explicação do código.

MF7 vai tratar backups, retenção e exportações. Esses temas dependem de auditoria e configuração segura.

6. Validação do passo.

Relatório da MF6 aponta para todos os smokes executados.

7. Cenário negativo/erro esperado.

Sem audit log em operação sensível, a MF6 não deve fechar.

#### Critérios de aceite

- Operações sensíveis têm ação declarada.
- Audit log guarda ator, empresa, ação, entidade, identificador e detalhes mínimos.
- Logs não incluem documentos financeiros completos.
- `rawPayload` e `documentLines` são bloqueados mesmo quando chegam em camelCase.
- Smoke textual prova helper e chamadas reais em três services críticos.
- Negativos: mínimo `3`: ação não declarada, operação sem sessão e detalhes excessivos.

#### Validação final

- `cd apps/api && node --check src/modules/audit/auditLogService.js`
- `cd apps/api && node scripts/check-mf6-audit-gate.mjs`
- `cd apps/api && npm run test:contracts`
- Teste manual de operação sensível com audit log.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: audit log de operação sensível com dados mascarados.
- `neg`: ação não declarada, operação sem sessão e detalhes excessivos.
- `fonte`: `RNF17`, `RF47`, `BK-MF4-09`.
- `multiempresa`: audit log inclui empresa ativa do backend.

#### Handoff

- Entrega trilho de auditoria para backups, retenção e exportações da MF7.
- Próximo BK recomendado: `BK-MF7-01`

#### Changelog

- `2026-06-23`: corrigido contrato do helper para reutilizar `recordAuditLog`/`AuditLog`, acrescentadas integrações completas em permissões, períodos fiscais e emissão de documentos, e reforçado smoke para provar chamadas reais nos services.
