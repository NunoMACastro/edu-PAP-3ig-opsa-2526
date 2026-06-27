# BK-MF7-07 - Geração de SAF-T conforme especificações legais (PT).

## Header

- `doc_id`: `GUIA-BK-MF7-07`
- `bk_id`: `BK-MF7-07`
- `macro`: `MF7`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF24`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-08`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-07-geracao-de-saf-t-conforme-especificacoes-legais-pt.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais reforçar o exportador SAF-T do OPSA com uma checklist de readiness executada no backend antes de gerar o ficheiro.

O objetivo é transformar `RNF24` numa entrega verificável: o backend confirma perfil fiscal, intervalo de datas, existência de documentos ou lançamentos e registo de integração. O guia não promete validação oficial externa nem substitui a especificação legal. Ele fecha uma barreira técnica mínima, pedagógica e auditável para a PAP.

#### Importância

SAF-T é uma exportação fiscal sensível. Se o ERP gerar um ficheiro com perfil incompleto, período invertido ou sem qualquer base documental, o aluno pode achar que o requisito está cumprido quando, na prática, apenas criou uma resposta HTTP.

Este BK protege três coisas importantes:

- qualidade fiscal: não gerar exportações manifestamente vazias ou incompletas;
- rastreabilidade: cada exportação aceite fica ligada a `SaftExportRun` e `IntegrationLog`;
- continuidade técnica: `BK-MF7-08`, `BK-MF7-10` e MF8 recebem um módulo de compliance mais modular e testável.

#### Scope-in

- Criar `apps/api/src/modules/compliance/saftComplianceChecklist.js`.
- Integrar a checklist dentro de `buildSaftExport`.
- Preservar a route `GET /api/compliance/saft` com autenticação, empresa ativa, permissão e role no backend.
- Criar teste contratual para o fluxo SAF-T MF7.
- Acrescentar o script `test:mf7:saft`.
- Documentar três cenários negativos obrigatórios.
- Fechar evidence técnica para PR ou defesa.

#### Scope-out

- Criar novos modelos Prisma.
- Alterar XML para cobrir todos os detalhes da especificação oficial.
- Criar frontend para download do ficheiro.
- Aceitar `companyId` vindo do cliente para escolher empresa ativa.
- Guardar XML completo dentro de logs.
- Substituir validação oficial externa ou certificação fiscal.

#### Estado antes e depois

- Antes: `BK-MF3-06` já entregou um exportador SAF-T MVP, `BK-MF4-10` entregou logs de integração, MF6 reforçou segurança e `BK-MF7-06` consolidou importações com logs de erro.
- Depois: o exportador SAF-T fica bloqueado antes da geração quando falta perfil fiscal, o período está inválido ou o período não tem documentos nem lançamentos. O fluxo aceite continua a criar `SaftExportRun`, continua a registar `IntegrationLog` e passa a ter teste contratual específico de MF7.

#### Pre-requisitos

- Ler `RNF24` em `docs/RNF.md`.
- Rever `RF36` e `RF48` em `docs/RF.md`.
- Rever `BK-MF3-06` para perceber o exportador SAF-T MVP.
- Rever `BK-MF4-10` para perceber `IntegrationLog`.
- Rever `BK-MF6-10` para manter operações sensíveis auditáveis.
- Rever `BK-MF7-06` para manter a disciplina de validação, logs e evidence.
- Confirmar que `apps/api/package.json` usa ES Modules e testes com `node --test`.
- Confirmar que a empresa ativa é resolvida no backend pelo contexto autenticado.

#### Glossário

- SAF-T: ficheiro estruturado usado em contexto fiscal e contabilístico.
- Readiness: validação prévia que confirma se existem condições mínimas para executar uma operação.
- Perfil fiscal: dados da empresa usados no cabeçalho da exportação, como nome legal, NIF, morada, código postal, cidade e moeda.
- Período: intervalo entre `fromDate` e `toDate` pedido para a exportação.
- SaftExportRun: registo da execução da exportação SAF-T.
- IntegrationLog: log operacional de integrações, uploads, exportações e reconciliações.
- Empresa ativa: empresa escolhida pelo contexto autenticado, nunca por um identificador livre enviado pelo cliente.
- Cenário negativo: teste de erro esperado, usado para provar que o sistema bloqueia estados inválidos.

#### Conceitos teóricos essenciais

SAF-T no OPSA nasce do contrato funcional `RF36` e é reforçado por `RNF24`. O ficheiro gerado nesta PAP é um MVP didático e rastreável. O que este BK acrescenta é a barreira de readiness antes da geração, para impedir casos em que o output não deveria sequer nascer.

Route, service e validação têm responsabilidades diferentes. A route recebe o pedido HTTP, aplica guards e chama o service. O validator valida a query `from` e `to`. O service lê a base de dados, aplica regras de domínio e regista a execução. A checklist deste BK fica no service layer porque precisa de dados já carregados da empresa e dos documentos.

Multiempresa é regra de segurança. A route pode receber `from` e `to`, mas a empresa ativa vem de `req.companyId`, preenchido pelo backend após autenticação e contexto de empresa. O cliente não decide a empresa final da exportação.

Logs de integração não são arquivos de dados sensíveis. O `IntegrationLog` guarda estado, contagens, nome curto de ficheiro e mensagem operacional. Não deve guardar XML completo, cookies, headers, tokens, credenciais ou payload bruto.

Erros HTTP de domínio devem ter código previsível. `INVALID_SAFT_RANGE`, `COMPANY_PROFILE_INCOMPLETE` e `EMPTY_SAFT_PERIOD` ajudam o frontend, os testes e a defesa técnica a distinguir falhas de input, falhas de perfil e ausência de base documental.

Testes contratuais verificam comportamento esperado sem depender de navegador. Neste BK, o teste prova que a checklist aceita um caso válido, rejeita três negativos e que o service ficou ligado a `SaftExportRun` e `IntegrationLog`.

#### Arquitetura do BK

Fluxo final:

1. `GET /api/compliance/saft?from=YYYY-MM-DD&to=YYYY-MM-DD`
2. `requireAuth`
3. `requireCompanyContext`
4. `requirePermission(Permission.COMPLIANCE_READ)`
5. `requireRole("ADMIN", "CONTABILISTA", "AUDITOR")`
6. `validateSaftExportQuery`
7. `buildSaftExport`
8. leitura de `CompanyProfile`, `SaleDocument`, `PurchaseDocument` e `JournalEntry`
9. `assertSaftReadiness`
10. criação de XML, `SaftExportRun` e `IntegrationLog`
11. resposta JSON com `runId`, `fileName`, `xml`, `counts` e nota de escopo

Decisões:

- `CANONICO`: `RNF24` define geração SAF-T conforme especificações legais PT.
- `CANONICO`: `RF36` define exportação SAF-T PT de faturação e contabilidade.
- `CANONICO`: `RF48` define logs de integração para SAF-T.
- `DERIVADO`: criar `saftComplianceChecklist.js` é a forma mínima de tornar `RNF24` verificável sem alterar schema.
- `DERIVADO`: bloquear períodos sem documentos nem lançamentos é uma barreira pedagógica para evitar exportações vazias como prova falsa.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/compliance/saftComplianceChecklist.js`
- EDITAR: `apps/api/src/modules/compliance/saftService.js`
- REVER: `apps/api/src/modules/compliance/saftRoutes.js`
- CRIAR: `apps/api/tests/contracts/mf7-saft-contracts.test.js`
- EDITAR: `apps/api/package.json`
- CRIAR: `docs/evidence/MF7/BK-MF7-07.md`
- REVER: `docs/RF.md`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato SAF-T e fronteira legal

1. Objetivo funcional do passo no contexto da app.

Confirmar o que o BK deve entregar antes de escrever código, separando requisito PAP, validação técnica e validação oficial externa.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - LOCALIZAÇÃO: linhas dos contratos `RF36`, `RF48`, `RNF24` e linha canónica de `BK-MF7-07`.

3. Instruções do que fazer.

Confirma que `BK-MF7-07` continua com `owner` Andre, apoio Oleksii, prioridade P0, sprint S11-S12, reforço, `RNF24` e próximo BK `BK-MF7-08`. Não alteres estes campos no header.

Confirma também que o BK consome tecnicamente o exportador SAF-T já criado anteriormente, mas mantém `dependencias: -` porque é o valor canónico atual da matriz e do backlog.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e evita que o BK prometa certificação fiscal ou altere contratos canónicos sem decisão da equipa.

5. Explicação do código.

Não existe código porque a decisão principal aqui é de fronteira: este BK reforça readiness e rastreabilidade, não cria uma certificação legal automática.

6. Validação do passo.

Resultado esperado da revisão:

- `RNF24` está associado a SAF-T PT.
- `RF36` confirma o exportador SAF-T de faturação e contabilidade.
- `RF48` confirma logs de integração para SAF-T.
- `BK-MF7-07` continua P0 e aponta para `BK-MF7-08`.

7. Cenário negativo/erro esperado.

Se alguém tentar acrescentar campos legais não documentados, mudar dependências canónicas ou declarar certificação fiscal, para a alteração e regista a decisão em evidence como fora do scope deste BK.

### Passo 2 - Criar a checklist de readiness SAF-T

1. Objetivo funcional do passo no contexto da app.

Criar a validação de domínio que impede gerar SAF-T quando o período, o perfil fiscal ou a base documental não têm condições mínimas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/compliance/saftComplianceChecklist.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Mantém `httpError` para que Express devolva erros controlados, testáveis e coerentes com o resto da API.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/compliance/saftComplianceChecklist.js
/**
 * @file Checklist de readiness SAF-T executada antes da geração do ficheiro.
 */

import { httpError } from "../../lib/httpErrors.js";

const REQUIRED_PROFILE_FIELDS = [
    ["legalName", "nome legal"],
    ["nif", "NIF"],
    ["addressLine1", "morada"],
    ["postalCode", "código postal"],
    ["city", "cidade"],
    ["currency", "moeda"],
];

/**
 * Garante que o valor recebido é uma data válida.
 *
 * @param {unknown} value - Valor que deve ser uma instância de Date.
 * @param {string} fieldName - Nome público usado na mensagem de erro.
 * @returns {Date} Data validada.
 */
function assertValidDate(value, fieldName) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw httpError(400, "INVALID_SAFT_RANGE", `${fieldName} deve ser uma data válida`);
    }

    return value;
}

/**
 * Normaliza uma contagem interna do exportador SAF-T.
 *
 * @param {unknown} value - Contagem calculada pelo service.
 * @param {string} fieldName - Nome técnico da contagem.
 * @returns {number} Inteiro seguro para somar.
 */
function assertNonNegativeInteger(value, fieldName) {
    if (!Number.isInteger(value) || value < 0) {
        throw httpError(500, "INVALID_SAFT_COUNTER", `Contagem SAF-T inválida em ${fieldName}`);
    }

    return value;
}

/**
 * Soma as linhas que vão alimentar o ficheiro SAF-T.
 *
 * @param {{ saleDocuments: number, purchaseDocuments: number, journalEntries: number }} counts - Contagens do service.
 * @returns {number} Total de linhas de negócio disponíveis para exportação.
 */
export function countSaftRows(counts) {
    const saleDocuments = assertNonNegativeInteger(counts?.saleDocuments, "saleDocuments");
    const purchaseDocuments = assertNonNegativeInteger(counts?.purchaseDocuments, "purchaseDocuments");
    const journalEntries = assertNonNegativeInteger(counts?.journalEntries, "journalEntries");

    return saleDocuments + purchaseDocuments + journalEntries;
}

/**
 * Valida o período pedido para a exportação SAF-T.
 *
 * @param {{ fromDate: Date, toDate: Date }} period - Intervalo já convertido pelo validator.
 * @returns {{ fromDate: Date, toDate: Date }} Período validado.
 */
export function assertSaftPeriod(period) {
    const fromDate = assertValidDate(period?.fromDate, "from");
    const toDate = assertValidDate(period?.toDate, "to");

    if (toDate < fromDate) {
        throw httpError(400, "INVALID_SAFT_RANGE", "Intervalo SAF-T inválido");
    }

    return { fromDate, toDate };
}

/**
 * Valida os campos fiscais mínimos do perfil da empresa ativa.
 *
 * @param {Record<string, unknown> | null} profile - Perfil fiscal carregado da base de dados.
 * @returns {Record<string, unknown>} Perfil validado.
 */
export function assertSaftProfile(profile) {
    const currentProfile = profile ?? {};

    for (const [field, label] of REQUIRED_PROFILE_FIELDS) {
        const value = String(currentProfile[field] ?? "").trim();
        if (!value) {
            throw httpError(422, "COMPANY_PROFILE_INCOMPLETE", `Perfil fiscal incompleto: falta ${label}`);
        }
    }

    return currentProfile;
}

/**
 * Impede gerar SAF-T sem qualquer documento ou lançamento no período.
 *
 * @param {{ saleDocuments: number, purchaseDocuments: number, journalEntries: number }} counts - Contagens do service.
 * @returns {number} Total validado.
 */
export function assertSaftHasRows(counts) {
    const totalRows = countSaftRows(counts);

    if (totalRows === 0) {
        throw httpError(
            422,
            "EMPTY_SAFT_PERIOD",
            "O intervalo SAF-T não tem documentos nem lançamentos para exportar",
        );
    }

    return totalRows;
}

/**
 * Executa a checklist completa antes de gerar o ficheiro SAF-T.
 *
 * @param {{ profile: Record<string, unknown> | null, period: { fromDate: Date, toDate: Date }, counts: { saleDocuments: number, purchaseDocuments: number, journalEntries: number } }} input - Dados preparados pelo service.
 * @returns {{ ready: true, checkedAt: string, totalRows: number, period: { fromDate: Date, toDate: Date } }} Resultado da readiness check.
 */
export function assertSaftReadiness(input) {
    const period = assertSaftPeriod(input?.period);
    assertSaftProfile(input?.profile);
    const totalRows = assertSaftHasRows(input?.counts);

    // A checklist protege contra exportações obviamente inválidas antes de criar SaftExportRun.
    return {
        ready: true,
        checkedAt: new Date().toISOString(),
        totalRows,
        period,
    };
}
```

5. Explicação do código.

O ficheiro cria uma fronteira clara entre validação de query e validação de domínio. A query `from`/`to` continua a ser validada no validator existente. Esta checklist recebe dados já carregados pelo service e confirma se a exportação tem base mínima.

`httpError` é usado para manter respostas previsíveis. Um período inválido devolve `INVALID_SAFT_RANGE`, um perfil incompleto devolve `COMPANY_PROFILE_INCOMPLETE` e um período sem movimentos devolve `EMPTY_SAFT_PERIOD`.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/compliance/saftComplianceChecklist.js
```

Resultado esperado: o comando termina sem erros de sintaxe.

7. Cenário negativo/erro esperado.

Chamar `assertSaftReadiness` com `counts` a zero deve lançar `EMPTY_SAFT_PERIOD` e impedir a criação de `SaftExportRun`.

### Passo 3 - Integrar a checklist no exportador SAF-T

1. Objetivo funcional do passo no contexto da app.

Garantir que `buildSaftExport` só cria XML, `SaftExportRun` e `IntegrationLog` depois de passar na checklist.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/compliance/saftService.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Substitui o ficheiro `saftService.js` pela versão completa abaixo, preservando o comportamento anterior e acrescentando `assertSaftReadiness` antes da criação do run.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/compliance/saftService.js
/**
 * @file Gerador SAF-T (PT) MVP com readiness check de MF7.
 */

import { recordIntegrationLog } from "../integrations/integrationLogService.js";
import { assertSaftReadiness } from "./saftComplianceChecklist.js";

/**
 * Escapa caracteres especiais para impedir XML inválido no ficheiro SAF-T gerado.
 *
 * @param {unknown} value - Valor a normalizar ou formatar.
 * @returns {string} Texto escapado para ser usado em XML.
 */
function escapeXml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

/**
 * Converte datas para o formato ISO curto exigido nos elementos SAF-T.
 *
 * @param {Date} value - Data a normalizar.
 * @returns {string} Data no formato ISO curto.
 */
function dateOnly(value) {
    return value.toISOString().slice(0, 10);
}

/**
 * Gera o bloco XML de documentos comerciais do SAF-T a partir das vendas e compras.
 *
 * @param {object[]} saleDocuments - Documentos de venda a exportar.
 * @param {object[]} purchaseDocuments - Documentos de compra a exportar.
 * @returns {string} Bloco XML de documentos comerciais do SAF-T.
 */
function sourceDocumentsXml(saleDocuments, purchaseDocuments) {
    const salesXml = saleDocuments
        .map(
            (document) => `
      <Invoice>
        <InvoiceNo>${escapeXml(document.number ?? document.id)}</InvoiceNo>
        <InvoiceDate>${dateOnly(document.issuedAt)}</InvoiceDate>
        <CustomerID>${escapeXml(document.customerId)}</CustomerID>
        <DocumentStatus>${escapeXml(document.status)}</DocumentStatus>
        <GrossTotal>${(document.totalCents / 100).toFixed(2)}</GrossTotal>
      </Invoice>`,
        )
        .join("");

    const purchasesXml = purchaseDocuments
        .map(
            (document) => `
      <PurchaseDocument>
        <DocumentNo>${escapeXml(document.supplierNumber)}</DocumentNo>
        <DocumentDate>${dateOnly(document.issuedAt)}</DocumentDate>
        <SupplierID>${escapeXml(document.supplierId)}</SupplierID>
        <DocumentStatus>${escapeXml(document.status)}</DocumentStatus>
        <GrossTotal>${(document.totalCents / 100).toFixed(2)}</GrossTotal>
      </PurchaseDocument>`,
        )
        .join("");

    return `${salesXml}${purchasesXml}`;
}

/**
 * Gera o bloco XML de movimentos contabilísticos do SAF-T a partir dos lançamentos.
 *
 * @param {object[]} journalEntries - Lançamentos contabilísticos a exportar.
 * @returns {string} Bloco XML com lançamentos contabilísticos SAF-T.
 */
function generalLedgerXml(journalEntries) {
    return journalEntries
        .map(
            (entry) => `
      <Journal>
        <JournalID>${escapeXml(entry.id)}</JournalID>
        <Description>${escapeXml(entry.description)}</Description>
        <TransactionDate>${dateOnly(entry.entryDate)}</TransactionDate>
        <Source>${escapeXml(entry.source)}</Source>
      </Journal>`,
        )
        .join("");
}

/**
 * Constrói o input de readiness a partir dos dados já lidos pelo service.
 *
 * @param {{ input: { fromDate: Date, toDate: Date }, profile: object | null, saleDocuments: object[], purchaseDocuments: object[], journalEntries: object[] }} params - Dados internos do exportador.
 * @returns {{ profile: object | null, period: { fromDate: Date, toDate: Date }, counts: { saleDocuments: number, purchaseDocuments: number, journalEntries: number } }} Input para a checklist.
 */
function buildSaftReadinessInput({ input, profile, saleDocuments, purchaseDocuments, journalEntries }) {
    return {
        profile,
        period: {
            fromDate: input.fromDate,
            toDate: input.toDate,
        },
        counts: {
            saleDocuments: saleDocuments.length,
            purchaseDocuments: purchaseDocuments.length,
            journalEntries: journalEntries.length,
        },
    };
}

/**
 * Gera XML SAF-T MVP rastreável e regista a execução.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input - Contexto autenticado.
 * @returns {Promise<object>} Exportação SAF-T MVP.
 */
export async function buildSaftExport(prisma, input) {
    const [profile, saleDocuments, purchaseDocuments, journalEntries] =
        await Promise.all([
            prisma.companyProfile.findUnique({ where: { companyId: input.companyId } }),
            prisma.saleDocument.findMany({
                where: {
                    companyId: input.companyId,
                    issuedAt: { gte: input.fromDate, lte: input.toDate },
                },
                orderBy: { issuedAt: "asc" },
            }),
            prisma.purchaseDocument.findMany({
                where: {
                    companyId: input.companyId,
                    issuedAt: { gte: input.fromDate, lte: input.toDate },
                },
                orderBy: { issuedAt: "asc" },
            }),
            prisma.journalEntry.findMany({
                where: {
                    companyId: input.companyId,
                    entryDate: { gte: input.fromDate, lte: input.toDate },
                },
                orderBy: { entryDate: "asc" },
            }),
        ]);

    const readiness = assertSaftReadiness(
        buildSaftReadinessInput({
            input,
            profile,
            saleDocuments,
            purchaseDocuments,
            journalEntries,
        }),
    );

    // Só depois da readiness check criamos nomes, XML, run e log de sucesso.
    const fileName = `saft-${profile.nif}-${dateOnly(input.fromDate)}-${dateOnly(input.toDate)}.xml`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile>
  <Header>
    <AuditFileVersion>1.04_01-MVP</AuditFileVersion>
    <CompanyID>${escapeXml(profile.nif)}</CompanyID>
    <TaxRegistrationNumber>${escapeXml(profile.nif)}</TaxRegistrationNumber>
    <CompanyName>${escapeXml(profile.legalName)}</CompanyName>
    <FiscalYear>${input.fromDate.getUTCFullYear()}</FiscalYear>
    <StartDate>${dateOnly(input.fromDate)}</StartDate>
    <EndDate>${dateOnly(input.toDate)}</EndDate>
    <CurrencyCode>${escapeXml(profile.currency)}</CurrencyCode>
  </Header>
  <GeneralLedgerEntries>${generalLedgerXml(journalEntries)}
  </GeneralLedgerEntries>
  <SourceDocuments>${sourceDocumentsXml(saleDocuments, purchaseDocuments)}
  </SourceDocuments>
</AuditFile>`;

    const run = await prisma.saftExportRun.create({
        data: {
            companyId: input.companyId,
            fromDate: input.fromDate,
            toDate: input.toDate,
            fileName,
            saleDocumentCount: saleDocuments.length,
            purchaseDocumentCount: purchaseDocuments.length,
            journalEntryCount: journalEntries.length,
            exportedById: input.userId,
        },
    });

    await recordIntegrationLog(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        integrationType: "SAFT",
        operation: "EXPORT",
        status: "EXPORTED",
        sourceId: run.id,
        fileName,
        totalRows: readiness.totalRows,
        successRows: readiness.totalRows,
        errorRows: 0,
        message: "Exportação SAF-T MVP registada sem guardar XML no log.",
    });

    return {
        runId: run.id,
        fileName,
        xml,
        counts: {
            saleDocuments: saleDocuments.length,
            purchaseDocuments: purchaseDocuments.length,
            journalEntries: journalEntries.length,
        },
        readiness: {
            checkedAt: readiness.checkedAt,
            totalRows: readiness.totalRows,
        },
        note: "SAF-T MVP rastreável; não substitui validação legal oficial.",
    };
}
```

5. Explicação do código.

O service continua a fazer a mesma leitura multiempresa, sempre com `companyId` vindo do backend. A diferença é a chamada a `assertSaftReadiness` antes de construir o nome do ficheiro, o XML, o run e o log.

Isto evita registar sucesso para um período sem qualquer dado ou para uma empresa sem perfil fiscal mínimo. Também evita duplicar validações: a query continua no validator, a readiness fica no service.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/compliance/saftService.js
```

Resultado esperado: o comando termina sem erros de sintaxe.

7. Cenário negativo/erro esperado.

Se `prisma.companyProfile.findUnique` devolver `null`, `assertSaftReadiness` deve lançar `COMPANY_PROFILE_INCOMPLETE` antes de `prisma.saftExportRun.create`.

### Passo 4 - Rever route e contrato HTTP

1. Objetivo funcional do passo no contexto da app.

Confirmar que o endpoint público continua protegido e que a empresa ativa não vem do cliente.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/compliance/saftRoutes.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Não cries nova route. Revê se a route existente mantém os guards abaixo. Se algum guard faltar no teu ficheiro local, corrige antes de avançar.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/compliance/saftRoutes.js
/**
 * @file Rotas de compliance fiscal da MF3 reforçadas por MF7.
 */

import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { buildSaftExport } from "./saftService.js";
import { validateSaftExportQuery } from "./saftValidators.js";

/**
 * Envia erros HTTP num formato JSON consistente com o contrato da API.
 *
 * @param {import("express").Response} res - Resposta Express usada para enviar o erro ao cliente.
 * @param {unknown} error - Erro capturado durante a operação.
 * @returns {import("express").Response} Resposta HTTP de erro enviada no formato JSON contratado.
 */
function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/**
 * Constrói router `/api/compliance`.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps - Dependências.
 * @returns {import("express").Router} Router Express.
 */
export function buildSaftRoutes({ prisma }) {
    const router = Router();
    const guards = [
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.COMPLIANCE_READ),
        requireRole("ADMIN", "CONTABILISTA", "AUDITOR"),
    ];

    router.get("/saft", guards, async (req, res) => {
        try {
            const range = validateSaftExportQuery(req.query);
            const exportResult = await buildSaftExport(prisma, {
                companyId: req.companyId,
                userId: req.user.id,
                ...range,
            });

            return res.status(200).json(exportResult);
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}
```

5. Explicação do código.

A route valida autenticação, contexto multiempresa, permissão e role antes de chamar o service. O cliente só envia datas. A empresa ativa vem de `req.companyId`, preenchido pelo backend, e o utilizador vem de `req.user.id`.

`sendError` converte erros de domínio em JSON previsível. Assim, os erros criados no Passo 2 chegam aos testes e ao frontend com `error` e `message`.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/compliance/saftRoutes.js
```

Resultado esperado: o comando termina sem erros de sintaxe e a route continua a expor apenas `GET /saft` dentro de `/api/compliance`.

7. Cenário negativo/erro esperado.

Um pedido sem sessão autenticada deve ser bloqueado pelos guards antes de chegar a `buildSaftExport`.

### Passo 5 - Criar teste contratual MF7 SAF-T

1. Objetivo funcional do passo no contexto da app.

Provar automaticamente que a checklist aceita um caso válido, rejeita os três negativos obrigatórios e que o service ficou ligado a run e log de integração.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf7-saft-contracts.test.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Ele é contratual e rápido: valida a regra de readiness diretamente e faz uma verificação estática da ligação do service a `assertSaftReadiness`, `SaftExportRun` e `IntegrationLog`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/contracts/mf7-saft-contracts.test.js
/**
 * @file Testes contratuais da readiness SAF-T MF7.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assertSaftReadiness } from "../../src/modules/compliance/saftComplianceChecklist.js";

const SERVICE_FILE = new URL("../../src/modules/compliance/saftService.js", import.meta.url);

/**
 * Cria um perfil fiscal completo para o caso positivo.
 *
 * @param {Record<string, unknown>} overrides - Campos a substituir no perfil.
 * @returns {Record<string, unknown>} Perfil fiscal de teste.
 */
function completeProfile(overrides = {}) {
    return {
        legalName: "OPSA Demo, Lda.",
        nif: "509999999",
        addressLine1: "Rua da Escola, 1",
        postalCode: "1000-001",
        city: "Lisboa",
        currency: "EUR",
        ...overrides,
    };
}

/**
 * Cria input de readiness com valores válidos por defeito.
 *
 * @param {Record<string, unknown>} overrides - Campos de topo a substituir.
 * @returns {{ profile: Record<string, unknown> | null, period: { fromDate: Date, toDate: Date }, counts: { saleDocuments: number, purchaseDocuments: number, journalEntries: number } }} Input de readiness.
 */
function readinessInput(overrides = {}) {
    return {
        profile: completeProfile(),
        period: {
            fromDate: new Date("2026-01-01T00:00:00.000Z"),
            toDate: new Date("2026-01-31T23:59:59.999Z"),
        },
        counts: {
            saleDocuments: 1,
            purchaseDocuments: 0,
            journalEntries: 2,
        },
        ...overrides,
    };
}

/**
 * Confirma que uma função lança um erro de domínio esperado.
 *
 * @param {() => void} action - Operação que deve falhar.
 * @param {string} code - Código de erro esperado.
 * @returns {void}
 */
function assertDomainError(action, code) {
    assert.throws(action, (error) => error?.code === code);
}

test("aceita readiness SAF-T com perfil, período e movimentos", () => {
    const readiness = assertSaftReadiness(readinessInput());

    assert.equal(readiness.ready, true);
    assert.equal(readiness.totalRows, 3);
    assert.match(readiness.checkedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("rejeita período SAF-T invertido", () => {
    assertDomainError(
        () =>
            assertSaftReadiness(
                readinessInput({
                    period: {
                        fromDate: new Date("2026-02-01T00:00:00.000Z"),
                        toDate: new Date("2026-01-01T00:00:00.000Z"),
                    },
                }),
            ),
        "INVALID_SAFT_RANGE",
    );
});

test("rejeita perfil fiscal sem NIF", () => {
    assertDomainError(
        () =>
            assertSaftReadiness(
                readinessInput({
                    profile: completeProfile({ nif: "" }),
                }),
            ),
        "COMPANY_PROFILE_INCOMPLETE",
    );
});

test("rejeita período sem documentos nem lançamentos", () => {
    assertDomainError(
        () =>
            assertSaftReadiness(
                readinessInput({
                    counts: {
                        saleDocuments: 0,
                        purchaseDocuments: 0,
                        journalEntries: 0,
                    },
                }),
            ),
        "EMPTY_SAFT_PERIOD",
    );
});

test("service SAF-T chama readiness, cria run e regista log de integração", () => {
    const source = readFileSync(SERVICE_FILE, "utf8");

    // Esta leitura estática protege a ligação entre o contrato MF7 e o fluxo real do service.
    assert.match(source, /assertSaftReadiness/);
    assert.match(source, /saftExportRun\.create/);
    assert.match(source, /recordIntegrationLog/);
});
```

5. Explicação do código.

O teste cobre um caso positivo e três negativos: período invertido, NIF em falta e período vazio. O último teste lê o service para confirmar que a integração não ficou esquecida fora de `buildSaftExport`.

Este teste não precisa de base de dados porque a readiness recebe dados já preparados pelo service. A cobertura de persistência fica para testes de integração quando existir `TEST_DATABASE_URL`.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check tests/contracts/mf7-saft-contracts.test.js
```

Resultado esperado: o comando termina sem erros de sintaxe.

7. Cenário negativo/erro esperado.

Se o service não importar ou não chamar `assertSaftReadiness`, o teste estático deve falhar e impedir o fecho do BK.

### Passo 6 - Adicionar script de validação MF7 SAF-T

1. Objetivo funcional do passo no contexto da app.

Criar um comando direto para correr apenas a validação contratual deste BK.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `scripts` completo.

3. Instruções do que fazer.

Acrescenta `test:mf7:saft` ao objeto `scripts`. Mantém os scripts existentes e não troques o runner de testes.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "dev": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:validate": "prisma validate",
    "migration:precheck-mf0": "node scripts/precheck-mf0-migration.js",
    "syntax:check": "find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check",
    "test": "npm run test:unit && npm run test:contracts",
    "test:unit": "node --test tests/unit/*.test.js",
    "test:contracts": "node --test tests/contracts/*.test.js",
    "test:mf7:saft": "node --test tests/contracts/mf7-saft-contracts.test.js",
    "test:integration": "node --test tests/integration/*.test.js",
    "test:mf6:documents": "node scripts/check-mf6-document-performance.mjs",
    "test:mf6:concurrency": "node scripts/check-mf6-concurrency.mjs",
    "test:mf6:reconciliation": "node scripts/check-mf6-reconciliation-performance.mjs",
    "test:mf6:fifo": "node scripts/check-mf6-fifo-performance.mjs",
    "test:mf6:https": "node scripts/check-mf6-https.mjs",
    "test:mf6:bcrypt": "node scripts/check-mf6-bcrypt.mjs",
    "test:mf6:session-cookie": "node scripts/check-mf6-session-cookie.mjs",
    "test:mf6:hardening": "node scripts/check-mf6-hardening.mjs",
    "test:mf6:env": "node scripts/check-mf6-env.mjs",
    "test:mf6:audit": "node scripts/check-mf6-audit-gate.mjs",
    "test:mf6": "npm run test:mf6:documents && npm run test:mf6:concurrency && npm run test:mf6:reconciliation && npm run test:mf6:fifo && npm run test:mf6:https && npm run test:mf6:bcrypt && npm run test:mf6:session-cookie && npm run test:mf6:hardening && npm run test:mf6:env && npm run test:mf6:audit"
  }
}
```

5. Explicação do código.

O comando novo corre apenas o teste criado no Passo 5. Isto é útil em aula, PR e defesa porque isola a prova de `RNF24` sem obrigar a correr a suite inteira.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run test:mf7:saft
```

Resultado esperado: o runner `node --test` reporta os testes de `mf7-saft-contracts.test.js` como passados.

7. Cenário negativo/erro esperado.

Se o script apontar para um caminho errado, o comando deve falhar com erro de ficheiro não encontrado. Corrige o caminho para `tests/contracts/mf7-saft-contracts.test.js`.

### Passo 7 - Executar validação técnica e negativos

1. Objetivo funcional do passo no contexto da app.

Executar a prova técnica mínima do BK antes de o marcar como defendível.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/compliance/saftComplianceChecklist.js`
    - REVER: `apps/api/src/modules/compliance/saftService.js`
    - REVER: `apps/api/src/modules/compliance/saftRoutes.js`
    - REVER: `apps/api/tests/contracts/mf7-saft-contracts.test.js`
    - LOCALIZAÇÃO: comandos de validação local.

3. Instruções do que fazer.

Corre os comandos pela ordem abaixo. Se o primeiro falhar, corrige sintaxe antes de correr testes.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo executa comandos sobre os ficheiros criados ou revistos nos passos anteriores.

5. Explicação do código.

Não há código novo porque a prova está nos ficheiros já escritos. A ordem dos comandos evita perder tempo com testes quando ainda existe erro de sintaxe.

6. Validação do passo.

```bash
cd apps/api
node --check src/modules/compliance/saftComplianceChecklist.js
node --check src/modules/compliance/saftService.js
node --check src/modules/compliance/saftRoutes.js
node --check tests/contracts/mf7-saft-contracts.test.js
npm run test:mf7:saft
```

Resultados esperados:

- todos os `node --check` terminam sem erros;
- `npm run test:mf7:saft` passa;
- o caso positivo devolve `ready: true`;
- os negativos devolvem `INVALID_SAFT_RANGE`, `COMPANY_PROFILE_INCOMPLETE` e `EMPTY_SAFT_PERIOD`;
- o teste estático confirma `assertSaftReadiness`, `saftExportRun.create` e `recordIntegrationLog`.

7. Cenário negativo/erro esperado.

Se o caso de período vazio passar sem erro, a checklist está incompleta e o BK não deve ser fechado.

### Passo 8 - Fechar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Guardar a prova do BK num artefacto consultável em PR, avaliação ou defesa.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF7/BK-MF7-07.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo depois de correres os comandos do Passo 7. Regista os outputs reais da tua execução nos campos indicados.

4. Código completo, correto e integrado com a app final.

````md
# Evidence BK-MF7-07 - SAF-T readiness

## Identificação

- BK: `BK-MF7-07`
- RNF: `RNF24`
- Data: `2026-06-26`
- Autor da execução: `Andre`

## Contratos confirmados

- `RF36`: exportação SAF-T PT de faturação e contabilidade.
- `RF48`: logs de integração para SAF-T.
- `RNF24`: geração SAF-T conforme especificações legais PT.

## Comandos executados

```bash
cd apps/api
node --check src/modules/compliance/saftComplianceChecklist.js
node --check src/modules/compliance/saftService.js
node --check src/modules/compliance/saftRoutes.js
node --check tests/contracts/mf7-saft-contracts.test.js
npm run test:mf7:saft
```

## Resultado positivo

- `assertSaftReadiness` aceita perfil fiscal completo, período válido e contagens com movimentos.
- `buildSaftExport` chama readiness antes de criar `SaftExportRun`.
- `recordIntegrationLog` continua ligado ao sucesso da exportação.

## Negativos executados

- Período invertido: `INVALID_SAFT_RANGE`.
- Perfil sem NIF: `COMPANY_PROFILE_INCOMPLETE`.
- Período sem documentos nem lançamentos: `EMPTY_SAFT_PERIOD`.

## Segurança e multiempresa

- O endpoint mantém `requireAuth`.
- O endpoint mantém `requireCompanyContext`.
- O endpoint mantém `requirePermission(Permission.COMPLIANCE_READ)`.
- O endpoint mantém roles `ADMIN`, `CONTABILISTA` e `AUDITOR`.
- A empresa ativa vem de `req.companyId`, preenchido pelo backend.

## Handoff

- Próximo BK: `BK-MF7-08`.
- Entrega: módulo de compliance com readiness SAF-T isolada, testada e rastreável.
````

5. Explicação do código.

O ficheiro de evidence não altera a app. Ele documenta o que foi executado, os negativos observados e a fronteira de segurança. Isto ajuda a defender o BK sem misturar conversa oral com prova técnica.

6. Validação do passo.

Confirma que o ficheiro existe e que contém os cinco comandos do Passo 7, os três negativos e a nota de multiempresa.

7. Cenário negativo/erro esperado.

Se a evidence não incluir os negativos, o BK fica sem prova de bloqueio e não deve passar em revisão.

#### Critérios de aceite

- `saftComplianceChecklist.js` existe e usa `httpError`.
- `buildSaftExport` chama `assertSaftReadiness` antes de criar `SaftExportRun`.
- `buildSaftExport` só regista `IntegrationLog` de sucesso depois da readiness check.
- A route mantém autenticação, contexto multiempresa, permissão e roles no backend.
- O cliente não escolhe empresa ativa por body ou query.
- `test:mf7:saft` existe em `apps/api/package.json`.
- O teste contratual cobre caso positivo e três negativos.
- A evidence lista comandos, resultados esperados, negativos e handoff.
- O guia não contém caminhos privados nem linguagem interna.

#### Validação final

Executa:

```bash
git diff --check
bash scripts/validate-planificacao.sh
```

Resultados esperados:

- `git diff --check` sem erros;
- `validate-planificacao.sh` com `overall_pass=true`;
- revisão final sem caminhos privados nem linguagem interna no guia.

#### Evidence para PR/defesa

- Ficheiro: `docs/evidence/MF7/BK-MF7-07.md`.
- Comando principal: `cd apps/api && npm run test:mf7:saft`.
- Positivo: readiness aceite com perfil, período e movimentos.
- Negativos: `INVALID_SAFT_RANGE`, `COMPANY_PROFILE_INCOMPLETE`, `EMPTY_SAFT_PERIOD`.
- Segurança: empresa ativa resolvida no backend por `req.companyId`.
- Rastreabilidade: `SaftExportRun` e `IntegrationLog` mantidos no fluxo de sucesso.

#### Handoff

- Próximo BK recomendado: `BK-MF7-08`.
- Contrato entregue: módulo `compliance` com readiness SAF-T separada do service, route protegida, teste contratual e evidence.
- Risco restante: decisões fiscais externas, certificação oficial e evolução detalhada do XML devem ficar em documento próprio antes de produção real.

#### Changelog

- `2026-06-25`: guia reescrito para tutorial técnico linear, autocontido e alinhado com a MF7 completa.
- `2026-06-26`: guia corrigido com 8 passos P0, checklist com `httpError`, integração completa em `buildSaftExport`, route protegida, teste contratual, script `test:mf7:saft` e evidence.
