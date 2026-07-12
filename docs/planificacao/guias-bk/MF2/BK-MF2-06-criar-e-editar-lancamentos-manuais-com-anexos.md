# BK-MF2-06 - Criar e editar lançamentos manuais (com anexos).

## Header

- `doc_id`: `GUIA-BK-MF2-06`
- `bk_id`: `BK-MF2-06`
- `macro`: `MF2`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-03, BK-MF0-07, BK-MF0-08`
- `rf_rnf`: `RF28`
- `fase_documental`: `Fase 1`
- `sprint`: `S05-S06`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-07`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-06-criar-e-editar-lancamentos-manuais-com-anexos.md`
- `last_updated`: `2026-07-10`

## Objetivo

Neste BK vais criar, consultar e editar lançamentos manuais equilibrados com anexos privados, bloqueando alterações em períodos fiscais fechados.

## Importância funcional e pedagógica

RF28 é contabilidade geral crítica. O aluno aprende que diário só é válido com débitos iguais a créditos, contas SNC da empresa e período fiscal aberto.

## Scope-in

- Criar lançamento manual.
- Consultar lançamento manual existente.
- Editar lançamento manual, substituindo data, descrição e linhas.
- Validar linhas em cêntimos.
- Bloquear período fechado.
- Anexar ficheiros controlados.

## Scope-out

- Lançamentos automáticos de MF1.
- SAF-T.
- Reconciliação bancária.

## Estado antes

Há lançamentos automáticos e modelos contabilísticos base, mas não lançamento manual documentado.

## Estado depois

Contabilista cria e edita diário manual reutilizando `JournalEntry`/`JournalEntryLine` existentes, com auditoria, anexos privados e bloqueio de alterações fora do período permitido.

## Pré-requisitos

- Ler RF28.
- Confirmar BK-MF0-03, BK-MF0-07 e BK-MF0-08.
- Confirmar `JournalEntry` e `JournalEntryLine` criados em BK-MF1-04.
- Confirmar o padrão de reutilização contabilística de BK-MF1-09.
- Confirmar `AuditLog` criado em BK-MF1-02.

## Fundamentação documental

- `CANONICO`: RF28 exige lançamentos manuais com anexos.
- `CANONICO`: plano SNC vem de BK-MF0-07.
- `CANONICO`: período fechado bloqueia lançamentos.
- `CANONICO`: `JournalEntry` e `JournalEntryLine` já pertencem ao domínio contabilístico criado em MF1.
- `DERIVADO`: anexos ficam em armazenamento privado.
- `DERIVADO`: `JournalAttachment` é o único modelo contabilístico novo deste BK.

## Glossário

- **Lançamento:** registo contabilístico.
- **Débito/crédito:** lados que têm de equilibrar.
- **Anexo:** comprovativo do lançamento.

## Conceitos teóricos essenciais

- **Lançamento manual no domínio contabilístico:** é um registo criado pelo contabilista quando a origem não vem de vendas, compras ou stock. Vem de uma decisão humana justificada, entra no diário geral através de `JournalEntry` com `source=MANUAL`, alimenta balancete, razão e demonstrações financeiras, serve para ajustes e regularizações documentadas, e evita misturar movimentos automáticos com correções contabilísticas manuais.
- **Dupla entrada e equilíbrio:** cada lançamento tem linhas de débito e crédito que têm de somar o mesmo valor. A informação vem do formulário, é validada no backend antes da transação, segue para `JournalEntryLine`, serve para manter a contabilidade coerente, e evita saldos impossíveis ou relatórios financeiros incorretos.
- **Edição contabilística controlada:** editar não é mudar qualquer diário; só é permitido para lançamentos `MANUAL` da empresa ativa. O pedido vem da UI, passa por autenticação, autorização, contexto de empresa e validação de período, atualiza data, descrição e linhas em transação, serve para corrigir erros operacionais sem tocar em lançamentos automáticos, e evita adulteração de vendas, compras ou documentos já fechados.
- **Período fiscal fechado:** representa uma janela contabilística que já não pode receber alterações. Vem da configuração fiscal da empresa, é consultado por `assertOpenFiscalPeriod`, bloqueia criação e edição quando a data antiga ou nova está fechada, serve para preservar fechos e evidência, e evita reabrir resultados já defendidos.
- **Anexo privado:** é o comprovativo PDF/PNG/JPEG associado ao lançamento. Vem do upload autenticado, é guardado fora de pastas públicas, fica referenciado em `JournalAttachment`, serve para auditoria e defesa do lançamento, e evita exposição de documentos contabilísticos por URL estático.

## Contrato de paridade obrigatório (2026-07-10)

- `entryDate` usa `parseStrictDateOnly`; datas impossíveis devolvem `400 INVALID_ENTRY_DATE`.
- Antes de substituir linhas, a transação cria `JournalEntryRevision` com snapshots `before`/`after`, motivo e ator. O lançamento, revisão e `AuditLog` são atómicos.
- `RetentionHold` e período fechado bloqueiam edição e remoção. Correções históricas usam reversão auditada, nunca destruição silenciosa.
- `POST /api/accounting/manual-journals/:id/attachments` é exclusivamente `multipart/form-data` streaming com `busboy`, limite de 10 MiB, assinatura/MIME/extensão, SHA-256, nome aleatório, quarentena, promoção S3 e cleanup compensatório.
- `GET /api/accounting/manual-journals/:journalId/attachments/:attachmentId/download` revalida empresa/permissão e devolve `Content-Disposition`, `X-Content-Type-Options: nosniff` e `Cache-Control: no-store`.
- O browser usa `FormData`; não usa Base64, `ArrayBuffer` como body cru, nome em header ou JSON.

## Arquitetura do BK

- Endpoints: `POST /api/accounting/manual-journals`, `GET /api/accounting/manual-journals/:id`, `PATCH /api/accounting/manual-journals/:id`, `POST /api/accounting/manual-journals/:id/attachments` e `GET /api/accounting/manual-journals/:journalId/attachments/:attachmentId/download`.
- Reutiliza `JournalEntry`, `JournalEntryLine`, `assertOpenFiscalPeriod` e `AuditLog`.
- Modelos novos: `JournalAttachment` e `JournalEntryRevision`.

## Ficheiros a criar/editar/rever

- EDITAR: `apps/api/prisma/schema.prisma`.
- CRIAR: `apps/api/src/modules/accounting/manualJournalService.js`.
- CRIAR: `apps/api/src/modules/accounting/journalAttachmentStorage.js`.
- CRIAR: `apps/api/src/modules/accounting/manualJournalRoutes.js`.
- EDITAR: `apps/api/src/server.js`.
- CRIAR: `apps/web/src/lib/manualJournalsApi.ts`.
- CRIAR: `apps/web/src/pages/ManualJournalPage.tsx`.
- REVER `JournalEntry`/`JournalEntryLine` de BK-MF1-04 e `AuditLog` de BK-MF1-02.

## Erros comuns

- Aceitar diário desequilibrado.
- Usar conta de outra empresa.
- Ignorar período fechado.
- Guardar anexo público.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403`.
- Recurso de outra empresa deve devolver `404` ou `403`, sem expor dados.
- Lançamento desequilibrado devolve `400`.
- Período fechado devolve `409`.
- MIME inválido devolve `400`.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Confirmar que BK-MF2-06 cobre apenas RF28 e mantém metadados alinhados com matriz, backlog e contrato de campos.

2. Ficheiros envolvidos:
    - CRIAR: nenhum ficheiro neste passo.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `README.md`, `docs/RF.md`, `docs/RNF.md`, `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md`, `PLANO-SPRINTS.md` e `CONTRATO-STACK-IMPLEMENTACAO.md`.
    - LOCALIZAÇÃO: `docs/planificacao/guias-bk/MF2/BK-MF2-06-criar-e-editar-lancamentos-manuais-com-anexos.md`, header deste guia e linha canónica de `BK-MF2-06`.

3. Instruções do que fazer.

Comparar header, dependências e próximo BK. O header mantém as dependências canónicas da matriz, mas a implementação deve reler também os BKs contabilísticos de MF1 que criaram `JournalEntry`, `JournalEntryLine` e `AuditLog`. Se os caminhos reais da app divergirem, preservar o contrato funcional e registar a adaptação na evidence.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF2-06
macro=MF2
rf=RF28
dependencias=BK-MF0-03, BK-MF0-07, BK-MF0-08
proximo=BK-MF2-07
```

5. Explicação do código.

Este contrato impede drift antes da implementação. Num ERP, uma alteração errada em stock ou contabilidade propaga-se para relatórios, auditoria e defesa PAP.

6. Validação do passo.

A evidence deve indicar que `RF28` e `BK-MF0-03, BK-MF0-07, BK-MF0-08` foram confirmados.

Também deve indicar que `JournalEntry`/`JournalEntryLine` foram apenas reutilizados de MF1, não recriados neste BK.

7. Cenário negativo/erro esperado.

Se aparecer regra sem fonte documental, registar dúvida e não a transformar em requisito.

### Passo 2 - Modelar anexos

1. Objetivo funcional do passo no ERP.

Adicionar metadados de anexo ao diário existente.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`.
    - REVER: `JournalEntry` e `JournalEntryLine` criados em BK-MF1-04.
    - REVER: `AuditLog` criado em BK-MF1-02.

3. Instruções do que fazer.

Confirmar que o enum `JournalSource` existente já inclui `MANUAL`, confirmar que `JournalEntry` e `JournalEntryLine` já existem, e criar apenas o modelo de anexo.

4. Código completo, correto e integrado com a app final.

```prisma
model JournalAttachment {
  id             String       @id @default(uuid())
  companyId      String
  company        Company      @relation(fields: [companyId], references: [id])
  journalEntryId String
  journalEntry   JournalEntry @relation(fields: [journalEntryId], references: [id])
  fileName       String
  mimeType       String
  sizeBytes      Int
  storageKey     String
  contentSha256  String
  storageProvider String
  status         String
  storageMetadata Json?
  uploadedById   String
  uploadedBy     User         @relation(fields: [uploadedById], references: [id])
  createdAt      DateTime     @default(now())

  @@index([companyId, journalEntryId])
  @@index([uploadedById])
}

model JournalEntryRevision {
  id             String       @id @default(uuid())
  companyId      String
  journalEntryId String
  changedById    String
  reason         String
  beforeSnapshot Json
  afterSnapshot  Json
  createdAt      DateTime     @default(now())
  company        Company      @relation(fields: [companyId], references: [id], onDelete: Restrict)
  journalEntry   JournalEntry @relation(fields: [journalEntryId], references: [id], onDelete: Restrict)
  changedBy      User         @relation(fields: [changedById], references: [id], onDelete: Restrict)

  @@index([companyId, journalEntryId, createdAt])
}
```

No mesmo ficheiro, acrescentar estas relações aos modelos existentes:

```prisma
model Company {
  journalAttachments JournalAttachment[]
  journalEntryRevisions JournalEntryRevision[]
}

model JournalEntry {
  attachments JournalAttachment[]
  revisions   JournalEntryRevision[]
}

model User {
  journalAttachments JournalAttachment[]
  journalEntryRevisions JournalEntryRevision[]
}
```

5. Explicação do código.

`MANUAL` já foi previsto no enum de lançamentos. `JournalEntry` e `JournalEntryLine` não são recriados aqui: este BK só acrescenta `JournalAttachment` e as relações inversas necessárias. O anexo guarda metadados ligados à empresa, ao lançamento e ao utilizador; o ficheiro fica fora da pasta pública.

6. Validação do passo.

Migration sem duplicar `JournalSource`, `JournalEntry` ou `JournalEntryLine`.

7. Cenário negativo/erro esperado.

Anexo sem lançamento deve falhar por relação.

### Passo 3 - Validar, criar, consultar e editar lançamento

1. Objetivo funcional do passo no ERP.

Criar e editar diário manual equilibrado, garantindo que só lançamentos `MANUAL` da empresa ativa podem ser alterados.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/accounting/manualJournalService.js`.
    - REVER: `apps/api/src/modules/fiscal-periods/fiscalPeriodService.js`.
    - REVER: `apps/api/prisma/schema.prisma`.

3. Instruções do que fazer.

Validar linhas antes da transação, confirmar contas da empresa, bloquear períodos fechados e substituir linhas em edição dentro da mesma transação.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/accounting/manualJournalService.js
import { randomUUID } from "node:crypto";
import {
  buildCursorPage,
  buildKeysetCondition,
  decodePageCursor,
  parsePageLimit,
} from "../../lib/cursorPagination.js";
import { httpError } from "../../lib/httpErrors.js";
import { parseStrictDateOnly } from "../../lib/strictDate.js";
import { assertRetainedRecordDeletionAllowed } from "../compliance/retentionPolicy.js";
import { assertOpenFiscalPeriod } from "../fiscal-periods/fiscalPeriodService.js";

const MANUAL_SOURCE = "MANUAL";

export function parseManualJournal(input) {
  const entryDate = parseStrictDateOnly(input?.entryDate, { code: "INVALID_ENTRY_DATE", field: "entryDate" });
  const description = String(input?.description ?? "").trim() || "Lançamento manual";
  const lines = Array.isArray(input?.lines) ? input.lines : [];
  const parsed = lines.map((line) => {
    const debitCents = Number(line.debitCents ?? 0);
    const creditCents = Number(line.creditCents ?? 0);

    if (!Number.isInteger(debitCents) || !Number.isInteger(creditCents) || debitCents < 0 || creditCents < 0) {
      throw httpError(400, "INVALID_JOURNAL_LINE_AMOUNT", "Os valores da linha têm de ser cêntimos positivos.");
    }

    if ((debitCents === 0 && creditCents === 0) || (debitCents > 0 && creditCents > 0)) {
      throw httpError(400, "INVALID_JOURNAL_LINE_SIDE", "Cada linha tem débito ou crédito, não ambos.");
    }

    return {
      accountId: String(line.accountId ?? "").trim(),
      debitCents,
      creditCents,
      memo: String(line.memo ?? "").trim(),
    };
  });
  const debit = parsed.reduce((sum, line) => sum + line.debitCents, 0);
  const credit = parsed.reduce((sum, line) => sum + line.creditCents, 0);

  if (parsed.some((line) => !line.accountId)) throw httpError(400, "ACCOUNT_REQUIRED", "Todas as linhas precisam de conta SNC.");
  if (parsed.length < 2 || debit !== credit) throw httpError(400, "JOURNAL_NOT_BALANCED", "O lançamento tem de estar equilibrado.");

  return {
    entryDate,
    description,
    lines: parsed,
  };
}

async function assertAccountsBelongToCompany(tx, { companyId, lines }) {
  const accountIds = [...new Set(lines.map((line) => line.accountId))];
  const accounts = await tx.account.findMany({
    where: { id: { in: accountIds }, companyId, isActive: true },
    select: { id: true },
  });
  const foundIds = new Set(accounts.map((account) => account.id));
  const missingId = accountIds.find((accountId) => !foundIds.has(accountId));

  if (missingId) {
    throw httpError(404, "ACCOUNT_NOT_FOUND", "Conta SNC não encontrada.");
  }
}

async function assertManualJournalEditable(tx, { companyId, id }) {
  const entry = await tx.journalEntry.findFirst({
    where: { id, companyId },
    include: {
      lines: { orderBy: { createdAt: "asc" } },
      attachments: {
        select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!entry) {
    throw httpError(404, "JOURNAL_ENTRY_NOT_FOUND", "Lançamento não encontrado.");
  }

  if (entry.source !== MANUAL_SOURCE) {
    throw httpError(409, "JOURNAL_ENTRY_NOT_MANUAL", "Só lançamentos manuais podem ser editados neste ecrã.");
  }

  return entry;
}

export async function getManualJournal(prisma, { companyId, id }) {
  return prisma.$transaction((tx) => assertManualJournalEditable(tx, { companyId, id }));
}

export async function listManualJournals(prisma, companyId, page = {}) {
  const limit = parsePageLimit(page.limit);
  const cursor = decodePageCursor(page.cursor, "date");
  const keyset = buildKeysetCondition(cursor, {
    sortField: "entryDate",
    direction: "desc",
  });
  const baseWhere = { companyId, source: MANUAL_SOURCE };
  const entries = await prisma.journalEntry.findMany({
    where: keyset ? { AND: [baseWhere, keyset] } : baseWhere,
    select: {
      id: true,
      entryDate: true,
      description: true,
      createdAt: true,
      _count: { select: { lines: true, attachments: true } },
    },
    orderBy: [{ entryDate: "desc" }, { id: "desc" }],
    take: limit + 1,
  });
  return buildCursorPage(entries, {
    limit,
    sortField: "entryDate",
    sortType: "date",
  });
}

export async function createManualJournal(prisma, { companyId, userId, input }) {
  const data = parseManualJournal(input);
  return prisma.$transaction(async (tx) => {
    await assertOpenFiscalPeriod(tx, { companyId, documentDate: data.entryDate });
    await assertAccountsBelongToCompany(tx, { companyId, lines: data.lines });

    const entry = await tx.journalEntry.create({
      data: {
        companyId,
        source: MANUAL_SOURCE,
        sourceId: `MANUAL-${randomUUID()}`,
        entryDate: data.entryDate,
        description: data.description,
        createdById: userId,
        lines: { create: data.lines },
      },
      include: { lines: true },
    });

    await tx.auditLog.create({
      data: {
        companyId,
        userId,
        action: "MANUAL_JOURNAL_CREATED",
        entity: "JournalEntry",
        entityId: entry.id,
        details: { lines: data.lines.length, source: MANUAL_SOURCE },
      },
    });

    return entry;
  });
}

export async function updateManualJournal(prisma, { companyId, userId, id, input }) {
  const data = parseManualJournal(input);
  const revisionReason = String(input?.revisionReason ?? "").trim();
  if (revisionReason.length < 3) {
    throw httpError(400, "REVISION_REASON_REQUIRED", "Indica o motivo da correção");
  }

  return prisma.$transaction(async (tx) => {
    const currentEntry = await assertManualJournalEditable(tx, { companyId, id });

    await assertRetainedRecordDeletionAllowed(tx, { companyId, entity: "JournalEntry", entityId: id });
    await assertOpenFiscalPeriod(tx, { companyId, documentDate: currentEntry.entryDate });
    await assertOpenFiscalPeriod(tx, { companyId, documentDate: data.entryDate });
    await assertAccountsBelongToCompany(tx, { companyId, lines: data.lines });

    const afterSnapshot = { entryDate: data.entryDate, description: data.description, lines: data.lines };
    await tx.journalEntryRevision.create({
      data: {
        companyId,
        journalEntryId: id,
        changedById: userId,
        reason: revisionReason,
        beforeSnapshot: currentEntry,
        afterSnapshot,
      },
    });

    const entry = await tx.journalEntry.update({
      where: { id: currentEntry.id },
      data: {
        entryDate: data.entryDate,
        description: data.description,
        lines: {
          deleteMany: {},
          create: data.lines,
        },
      },
      include: {
        lines: { orderBy: { createdAt: "asc" } },
        attachments: {
          select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        companyId,
        userId,
        action: "MANUAL_JOURNAL_UPDATED",
        entity: "JournalEntry",
        entityId: entry.id,
        details: {
          previousLineCount: currentEntry.lines.length,
          newLineCount: data.lines.length,
          source: MANUAL_SOURCE,
        },
      },
    });

    return entry;
  });
}
```

5. Explicação do código.

O backend valida equilíbrio, contas da empresa, origem manual e período aberto. Na edição, confirma o período da data antiga e da nova data para impedir alterações em exercícios já fechados.

6. Validação do passo.

Criar lançamento válido, consultar o mesmo lançamento e editar data, descrição e linhas mantendo o diário equilibrado.

7. Cenário negativo/erro esperado.

Tentar editar um lançamento automático deve devolver `409` e não pode alterar linhas.

### Passo 4 - Criar rotas com consulta, edição e anexos

1. Objetivo funcional do passo no ERP.

Expor criação, consulta, edição, upload multipart streaming e download autorizado para lançamentos manuais.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/accounting/journalAttachmentStorage.js`.
    - CRIAR: `apps/api/src/modules/accounting/manualJournalRoutes.js`.
    - EDITAR: `apps/api/src/server.js`.

3. Instruções do que fazer.

Usar `busboy` para multipart route-scoped, streaming com limite de 10 MiB, validação de assinatura/MIME/extensão, hash SHA-256, quarentena e promoção S3. Reutilizar os guards da app e nunca devolver anexos de outra empresa.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/accounting/journalAttachmentStorage.js
import { randomUUID } from "node:crypto";
import { httpError } from "../../lib/httpErrors.js";

const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function safeFileName(fileName) {
  return String(fileName ?? "anexo").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function signatureMatches({ mimeType, bytes }) {
  const hex = Buffer.from(bytes).toString("hex");
  if (mimeType === "application/pdf") return hex.startsWith("25504446");
  if (mimeType === "image/png") return hex.startsWith("89504e470d0a1a0a");
  if (mimeType === "image/jpeg") return hex.startsWith("ffd8ff");
  return false;
}

export async function quarantineJournalAttachment({ companyId, journalEntryId, fileName, mimeType, stream, objectStorage }) {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw httpError(415, "ATTACHMENT_MIME_NOT_ALLOWED", "Tipo de ficheiro não permitido.");
  }
  const quarantineKey = `quarantine/${companyId}/${journalEntryId}/${randomUUID()}-${safeFileName(fileName)}`;
  const uploaded = await objectStorage.putStream({
    key: quarantineKey,
    stream,
    maxBytes: MAX_ATTACHMENT_BYTES,
    computeSha256: true,
    captureSignatureBytes: 16,
  });
  if (!signatureMatches({ mimeType, bytes: uploaded.signatureBytes })) {
    await objectStorage.deleteObject({ key: quarantineKey });
    throw httpError(415, "ATTACHMENT_SIGNATURE_MISMATCH", "Assinatura do ficheiro inválida");
  }
  return { quarantineKey, ...uploaded };
}

export async function promoteAttachmentTransactionally(input) {
  const finalKey = `journals/${input.companyId}/${input.journalEntryId}/${randomUUID()}`;
  await input.objectStorage.promote({ fromKey: input.stored.quarantineKey, toKey: finalKey });
  try {
    const attachment = await input.prisma.$transaction(async (tx) => {
      const created = await tx.journalAttachment.create({
        data: {
          companyId: input.companyId,
          journalEntryId: input.journalEntryId,
          uploadedById: input.uploadedById,
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes: input.stored.sizeBytes,
          contentSha256: input.stored.sha256,
          storageKey: finalKey,
          storageProvider: "S3",
          status: "READY",
        },
      });
      await tx.auditLog.create({ data: { companyId: input.companyId, userId: input.uploadedById, action: "JOURNAL_ATTACHMENT_CREATED", entity: "JournalAttachment", entityId: created.id } });
      return created;
    });
    await input.objectStorage.deleteObject({ key: input.stored.quarantineKey });
    return attachment;
  } catch (error) {
    await input.objectStorage.deleteObject({ key: finalKey });
    throw error;
  }
}

export function downloadJournalAttachment({ prisma, objectStorage }) {
  return async (req, res) => {
    const attachment = await prisma.journalAttachment.findFirst({ where: { id: req.params.attachmentId, journalEntryId: req.params.journalId, companyId: req.companyId, status: "READY" } });
    if (!attachment) throw httpError(404, "ATTACHMENT_NOT_FOUND", "Anexo não encontrado");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
    res.type(attachment.mimeType);
    return objectStorage.pipeToResponse({ key: attachment.storageKey, res });
  };
}

// apps/api/src/modules/accounting/manualJournalRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { parseMultipartSingleFile } from "../../lib/multipart.js";
import { downloadJournalAttachment, promoteAttachmentTransactionally, quarantineJournalAttachment } from "./journalAttachmentStorage.js";
import { createManualJournal, getManualJournal, listManualJournals, updateManualJournal } from "./manualJournalService.js";

export function createManualJournalRouter({ prisma, objectStorage }) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA")];
  const sendError = (res, error) => {
    const response = toHttpError(error);
    return res.status(response.status).json(response.body);
  };

  router.post("/", guards, async (req, res) => {
    try {
      const entry = await createManualJournal(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        input: req.body,
      });

      return res.status(201).json({ entry });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/", guards, async (req, res) => {
    try {
      const page = await listManualJournals(prisma, req.companyId, req.query);
      return res.status(200).json(page);
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/:id", guards, async (req, res) => {
    try {
      const entry = await getManualJournal(prisma, {
        companyId: req.companyId,
        id: req.params.id,
      });

      return res.json({ entry });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.patch("/:id", guards, async (req, res) => {
    try {
      const entry = await updateManualJournal(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        id: req.params.id,
        input: req.body,
      });

      return res.json({ entry });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post(
    "/:id/attachments",
    guards,
    async (req, res) => {
      try {
        const entry = await prisma.journalEntry.findFirst({
          where: { id: req.params.id, companyId: req.companyId, source: "MANUAL" },
          select: { id: true },
        });

        if (!entry) return res.status(404).json({ code: "JOURNAL_ENTRY_NOT_FOUND", message: "Lançamento não encontrado." });

        const file = await parseMultipartSingleFile(req, {
          fieldName: "file",
          maxBytes: 10 * 1024 * 1024,
          allowedExtensions: [".pdf", ".png", ".jpg", ".jpeg"],
        });
        const stored = await quarantineJournalAttachment({
          companyId: req.companyId,
          journalEntryId: entry.id,
          fileName: file.fileName,
          mimeType: file.mimeType,
          stream: file.stream,
          objectStorage,
        });

        const attachment = await promoteAttachmentTransactionally({
          prisma,
          objectStorage,
          stored,
          companyId: req.companyId,
          journalEntryId: entry.id,
          uploadedById: req.user.id,
          fileName: file.fileName,
          mimeType: file.mimeType,
        });

        return res.status(201).json({ attachment });
      } catch (error) {
        return sendError(res, error);
      }
    }
  );

  router.get("/:journalId/attachments/:attachmentId/download", guards, downloadJournalAttachment({ prisma, objectStorage }));
  return router;
}

// apps/api/src/server.js
import { createManualJournalRouter } from "./modules/accounting/manualJournalRoutes.js";

app.use("/api/accounting/manual-journals", createManualJournalRouter({ prisma, objectStorage }));
```

5. Explicação do código.

A rota valida sessão, empresa, role, multipart, tamanho, extensão, MIME e assinatura antes de promover o objeto da quarentena para S3. Metadata/auditoria e objeto usam cleanup compensatório. `GET`, `PATCH` e download aplicam empresa ativa e regra de origem manual.

6. Validação do passo.

Criar lançamento, consultar por id, editar linhas e anexar PDF.

7. Cenário negativo/erro esperado.

Tentar anexar ficheiro a lançamento automático ou de outra empresa deve devolver `404`.

### Passo 5 - Criar cliente frontend

1. Objetivo funcional do passo no ERP.

Enviar, carregar, editar diário e enviar anexo com cookie de sessão.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/manualJournalsApi.ts`.

3. Instruções do que fazer.

Implementar create, get, update e upload com `credentials: "include"`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/manualJournalsApi.ts
export type ManualJournalLine = {
  accountId: string;
  debitCents: number;
  creditCents: number;
  memo?: string;
};

export type ManualJournalPayload = {
  entryDate: string;
  description: string;
  lines: ManualJournalLine[];
};

export type ManualJournal = {
  id: string;
  entryDate: string;
  description: string;
  lines: ManualJournalLine[];
  attachments?: Array<{ id: string; fileName: string; mimeType: string; sizeBytes: number }>;
};

async function readJsonError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function createManualJournal(data: ManualJournalPayload) {
  const response = await fetch("/api/accounting/manual-journals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response, "Não foi possível criar o lançamento."));
  }

  return response.json() as Promise<{ entry: ManualJournal }>;
}

export async function listManualJournals(cursor?: string) {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const response = await fetch(`/api/accounting/manual-journals${query}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(await readJsonError(response, "Não foi possível listar lançamentos."));
  }
  return response.json() as Promise<{
    items: ManualJournal[];
    pageInfo: { nextCursor: string | null; hasNextPage: boolean };
  }>;
}

export async function getManualJournal(entryId: string) {
  const response = await fetch(`/api/accounting/manual-journals/${entryId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response, "Não foi possível carregar o lançamento."));
  }

  return response.json() as Promise<{ entry: ManualJournal }>;
}

export async function updateManualJournal(entryId: string, data: ManualJournalPayload) {
  const response = await fetch(`/api/accounting/manual-journals/${entryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response, "Não foi possível editar o lançamento."));
  }

  return response.json() as Promise<{ entry: ManualJournal }>;
}

export async function uploadJournalAttachment(entryId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await fetch(`/api/accounting/manual-journals/${entryId}/attachments`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response, "Não foi possível anexar o ficheiro."));
  }

  return response.json();
}

export async function downloadJournalAttachment(journalId: string, attachmentId: string) {
  const response = await fetch(`/api/accounting/manual-journals/${journalId}/attachments/${attachmentId}/download`, { credentials: "include" });
  if (!response.ok) throw new Error(await readJsonError(response, "Não foi possível descarregar o anexo."));
  return response.blob();
}
```

5. Explicação do código.

O cliente mantém sessão por cookie, não guarda tokens no browser e centraliza leitura de erros para mostrar mensagens controladas.

6. Validação do passo.

Smoke de criação, carregamento, edição e upload.

7. Cenário negativo/erro esperado.

Erro de período fechado ou de lançamento automático deve aparecer na UI sem expor detalhes internos.

### Passo 6 - Criar página

1. Objetivo funcional do passo no ERP.

Formulário com linhas, totais, modo de criação, modo de edição e anexo.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/ManualJournalPage.tsx`.
    - REVER: `apps/web/src/lib/manualJournalsApi.ts`.

3. Instruções do que fazer.

Mostrar totais localmente, carregar lançamento existente por id e submeter ao backend correto.

4. Código completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/ManualJournalPage.tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createManualJournal,
  getManualJournal,
  updateManualJournal,
  uploadJournalAttachment,
} from "../lib/manualJournalsApi";
import type { ManualJournalLine } from "../lib/manualJournalsApi";

const emptyLine: ManualJournalLine = { accountId: "", debitCents: 0, creditCents: 0, memo: "" };

type ManualJournalPageProps = {
  initialEntryId?: string;
};

export function ManualJournalPage({ initialEntryId }: ManualJournalPageProps) {
  const [entryDate, setEntryDate] = useState("");
  const [description, setDescription] = useState("");
  const [entryId, setEntryId] = useState<string | null>(initialEntryId ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [lines, setLines] = useState<ManualJournalLine[]>([{ ...emptyLine }, { ...emptyLine }]);
  const [loading, setLoading] = useState(Boolean(initialEntryId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialEntryId) return;

    let active = true;
    setLoading(true);
    setError(null);

    getManualJournal(initialEntryId)
      .then(({ entry }) => {
        if (!active) return;

        setEntryId(entry.id);
        setEntryDate(entry.entryDate.slice(0, 10));
        setDescription(entry.description);
        setLines(entry.lines.length > 0 ? entry.lines : [{ ...emptyLine }, { ...emptyLine }]);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar o lançamento.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialEntryId]);

  const totals = useMemo(
    () => ({
      debitCents: lines.reduce((sum, line) => sum + Number(line.debitCents), 0),
      creditCents: lines.reduce((sum, line) => sum + Number(line.creditCents), 0),
    }),
    [lines]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const payload = { entryDate, description, lines };
      const result = entryId
        ? await updateManualJournal(entryId, payload)
        : await createManualJournal(payload);

      setEntryId(result.entry.id);
      setMessage(entryId ? "Lançamento editado." : "Lançamento criado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível guardar o lançamento.");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload() {
    if (!entryId || !file) return;
    setError(null);
    setMessage(null);
    setUploading(true);

    try {
      await uploadJournalAttachment(entryId, file);
      setMessage("Anexo enviado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o anexo.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <p>A carregar lançamento...</p>;
  }

  return (
    <section>
      <h1>Lançamento manual</h1>

      <form onSubmit={onSubmit}>
        <input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição" />

        <table>
          <thead>
            <tr>
              <th>Conta</th>
              <th>Débito</th>
              <th>Crédito</th>
              <th>Memo</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index}>
                <td>
                  <input
                    value={line.accountId}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, accountId: event.target.value } : item
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={line.debitCents}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, debitCents: Number(event.target.value) } : item
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={line.creditCents}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, creditCents: Number(event.target.value) } : item
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    value={line.memo}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, memo: event.target.value } : item
                        )
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>Débito: {totals.debitCents} cêntimos</p>
        <p>Crédito: {totals.creditCents} cêntimos</p>
        <button type="button" onClick={() => setLines((current) => [...current, { ...emptyLine }])}>
          Adicionar linha
        </button>
        <button type="submit" disabled={saving}>
          {entryId ? "Guardar alterações" : "Criar lançamento"}
        </button>
      </form>

      <input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <button type="button" disabled={!entryId || !file || uploading} onClick={onUpload}>
        {uploading ? "A enviar..." : "Enviar anexo"}
      </button>

      {error ? <p role="alert">{error}</p> : null}
      {message ? <p>{message}</p> : null}
    </section>
  );
}
```

5. Explicação do código.

O cálculo visual ajuda o aluno e o contabilista, mas o backend repete validação. O id carregado ativa o modo de edição e o mesmo ecrã preserva o fluxo de anexo.

6. Validação do passo.

Testar criação sem id, edição com id e upload após guardar.

7. Cenário negativo/erro esperado.

Totais diferentes não podem ser aceites, mesmo que a UI mostre valores aparentemente coerentes.

### Passo 7 - Validar smoke, negativos e segurança

1. Objetivo funcional do passo no ERP.

Provar que BK-MF2-06 funciona no caso principal e falha de forma controlada nos casos negativos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/accounting/manualJournalService.test.js`.
    - CRIAR: `apps/api/src/modules/accounting/manualJournalRoutes.test.js`.
    - REVER: `docs/planificacao/guias-bk/MF2/BK-MF2-06-criar-e-editar-lancamentos-manuais-com-anexos.md` e ficheiros criados nos passos anteriores.
    - LOCALIZAÇÃO: `apps/api/src/modules/accounting/` e smoke manual em `apps/web/src/pages/ManualJournalPage.tsx`.

3. Instruções do que fazer.

Criar teste do fluxo principal de criação, consulta, edição, upload, negativos indicados neste guia e smoke manual com sessão real.

4. Código completo, correto e integrado com a app final.

```bash
npm run test:unit -- manualJournal
npm run test:integration -- manualJournal
```

5. Explicação do código.

Os testes provam comportamento, não apenas execução. O aluno consegue defender o que foi verificado e que risco foi bloqueado.

6. Validação do passo.

Confirmar HTTP status, mensagem controlada, ausência de escrita parcial, bloqueio de lançamento automático e ausência de dados de outra empresa.

7. Cenário negativo/erro esperado.

Se o smoke passa mas um negativo falha, corrigir service ou rota antes de pedir revisão.

### Passo 8 - Preparar evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar BK-MF2-06 com provas objetivas e deixar o próximo BK pronto para reutilizar os contratos criados.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF2/BK-MF2-06.md`.
    - EDITAR: nenhum ficheiro de aplicação neste passo.
    - REVER: outputs de testes, screenshots e resumo do PR.
    - LOCALIZAÇÃO: `docs/evidence/MF2/BK-MF2-06.md`.

3. Instruções do que fazer.

Registar ficheiros alterados, endpoints criados, comandos executados, resultados dos negativos e riscos que ficam para o próximo BK.

4. Código completo, correto e integrado com a app final.

```md
# BK-MF2-06

- Requisito validado: RF28
- Endpoints: POST /api/accounting/manual-journals, GET /api/accounting/manual-journals/:id, PATCH /api/accounting/manual-journals/:id, POST /api/accounting/manual-journals/:id/attachments
- Negativos: lançamento desequilibrado, edição de lançamento automático, período fechado, conta de outra empresa, MIME não permitido
- Resultado: preencher com comandos, resposta HTTP e imagem da página
```

5. Explicação do código.

A evidence liga requisito, código e validação. Sem esta prova, o BK continua fraco para revisão e defesa PAP.

6. Validação do passo.

Confirmar handoff para `BK-MF2-07` com exports, endpoints, modelos reutilizados, modelo novo e limitações.

7. Cenário negativo/erro esperado.

Se existir bloqueio real, marcar no relatório e evidence com erro observado e impacto.

## Expected results

- Débito total igual a crédito total.
- Período aberto validado.
- Edição substitui linhas de lançamento manual em transação.
- Lançamento automático não é editável neste fluxo.
- Anexo tem MIME/tamanho controlado.
- Auditoria criada.

## Critérios de aceite

- Todos os passos seguem a estrutura obrigatória 1 a 7.
- Backend aplica autenticação, autorização e contexto multiempresa.
- Frontend usa `credentials: "include"` e não guarda tokens em `localStorage`.
- `PATCH /api/accounting/manual-journals/:id` só aceita `source=MANUAL`.
- Erros são controlados e em português de Portugal.
- Evidence inclui smoke, negativos e ficheiros alterados.

## Validação final

- Teste equilibrado.
- Teste desequilibrado.
- Teste período fechado.
- Teste edição de lançamento manual.
- Teste bloqueio de lançamento automático.
- Teste anexo inválido.

## Evidence para PR/defesa

- Output de testes.
- Negativo de período fechado.
- Negativo de edição de lançamento automático.
- Registo de anexo.

## Handoff

BK-MF2-07 lê `JournalEntry` e `JournalEntryLine` existentes, criados na MF1, incluindo os lançamentos manuais criados ou editados neste BK com `source=MANUAL`. Este BK entrega `JournalAttachment` e o fluxo de criação, consulta, edição e anexos de lançamentos manuais; não recria os modelos base do diário contabilístico.

## Changelog

- `2026-06-08`: clarificadas dependências técnicas de MF1 e corrigido handoff para evitar duplicação de `JournalEntry`/`JournalEntryLine`.
- `2026-06-08`: adicionados consulta e edição de lançamentos manuais para cobrir RF28 integralmente.
- `2026-06-07`: guia reescrito como tutorial técnico linear, autocontido e alinhado com RF/RNF, MF0, MF1 e contrato de stack.
