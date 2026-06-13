# BK-MF3-06 - Exportar SAF-T (PT) de faturacao e contabilidade.

## Header
- `doc_id`: `GUIA-BK-MF3-06`
- `bk_id`: `BK-MF3-06`
- `macro`: `MF3`
- `owner`: `Oleksii`
- `apoio`: `Sofia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-06, BK-MF0-09, BK-MF0-10, BK-MF1-02, BK-MF1-04, BK-MF1-07, BK-MF1-09, BK-MF2-06`
- `rf_rnf`: `RF36`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-07`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-06-exportar-saf-t-pt-de-faturacao-e-contabilidade.md`
- `last_updated`: `2026-06-13`

#### Objetivo

Neste BK vais criar uma exportacao SAF-T (PT) MVP em XML com dados da empresa, clientes, fornecedores, documentos de venda, compras e lancamentos. O guia nao promete certificacao legal completa fora da documentacao.

#### Importancia

RF36 exige exportacao SAF-T. Como e artefacto legal portugues, o BK deve ser rigoroso e honesto: gerar XML estruturado e bloquear quando faltam dados obrigatorios.

#### Scope-in

- Validar perfil fiscal da empresa.
- Gerar XML MVP com blocos documentados.
- Guardar execucao em `SaftExportRun`.
- Aplicar role `CONTABILISTA` ou `AUDITOR`.

#### Scope-out

- Certificacao legal completa.
- Todas as variantes oficiais da especificacao.
- Envio automatico para Autoridade Tributaria.

#### Estado antes e depois

- Estado antes: nao existia XML SAF-T gerado.
- Estado depois: `GET /api/compliance/saft` devolve XML e resumo da exportacao.

#### Pre-requisitos

- Rever RF36 e RNF24.
- Rever RF14, RF16, RF19, RF21 e RF28.
- Rever BK-MF0-06, BK-MF0-09, BK-MF0-10, BK-MF1-02, BK-MF1-04, BK-MF1-07, BK-MF1-09 e BK-MF2-06.
- Rever BK-MF7-07 antes de promessa legal final.

#### Glossario

- **SAF-T (PT):** ficheiro XML portugues usado para auditoria fiscal.
- **Header:** bloco com dados da empresa e periodo.
- **Source document:** documento de venda ou compra exportado.
- **Export run:** registo da exportacao.

#### Conceitos teoricos essenciais

- SAF-T e legalmente sensivel; dados incompletos devem bloquear exportacao.
- XML deve escapar caracteres especiais.
- O sistema gera ficheiro; nao submete oficialmente.
- Logs de integracao sao importantes para rastrear quem exportou.

#### Arquitetura do BK

- Endpoint: `GET /api/compliance/saft`.
- Roles: `CONTABILISTA`, `AUDITOR`.
- Modelos: `SaftExportRun`, `CompanyProfile`, `Customer`, `Supplier`, `SaleDocument`, `PurchaseDocument`, `JournalEntry`.
- Frontend: `SaftExportPage`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/compliance/saftValidators.js`
- CRIAR: `apps/api/src/modules/compliance/saftService.js`
- CRIAR: `apps/api/src/modules/compliance/saftRoutes.js`
- CRIAR: `apps/web/src/lib/complianceApi.ts`
- CRIAR: `apps/web/src/pages/SaftExportPage.tsx`
- EDITAR: `apps/api/prisma/schema.prisma`
- EDITAR: `apps/api/src/server.js`
- EDITAR: `apps/web/src/App.tsx`
- REVER: RF36, RNF24, BK-MF0-06, BK-MF0-09, BK-MF0-10, BK-MF1-02, BK-MF1-04, BK-MF1-07, BK-MF1-09, BK-MF2-06, BK-MF7-07.

#### Tutorial tecnico linear

### Passo 1 - Confirmar limite legal do MVP

1. Objetivo funcional do passo no ERP.

Separar exportacao MVP de conformidade legal total.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: nenhum.
    - REVER: RF36, RNF24.
    - LOCALIZACAO: documentos canonicos.

3. Instrucoes do que fazer.

Regista no PR que BK-MF7-07 reforca conformidade legal.

- `CANONICO`: RF36 exige exportacao SAF-T (PT) de faturacao e contabilidade.
- `DERIVADO`: este BK entrega XML MVP estruturado e rastreavel, mas a conformidade legal completa fica limitada ao que estiver documentado e sera reforcada em `BK-MF7-07`.

4. Codigo completo, correto e integrado com a app final.

Sem codigo neste passo.

5. Explicacao do codigo.

Nao ha codigo porque a decisao principal e nao prometer mais do que o MVP documentado.

6. Validacao do passo.

Evidence deve indicar escopo SAF-T MVP.

7. Cenario negativo/erro esperado.

Nao apresentar XML MVP como certificacao legal final.

### Passo 2 - Modelar execucao SAF-T

1. Objetivo funcional do passo no ERP.

Guardar quem exportou, periodo e estado.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: `apps/api/prisma/schema.prisma`
    - REVER: `Company`.
    - LOCALIZACAO: modelos de compliance.

3. Instrucoes do que fazer.

Adiciona modelo `SaftExportRun`.

4. Codigo completo, correto e integrado com a app final.

```prisma
/// Registo de uma exportacao SAF-T MVP.
/// Mantem periodo, ficheiro e utilizador para auditoria de compliance.
model SaftExportRun {
  id           String   @id @default(uuid())
  companyId    String
  fromDate     DateTime
  toDate       DateTime
  fileName     String
  status       String
  exportedById String
  exportedAt   DateTime @default(now())
  warnings     Json?

  @@index([companyId, fromDate, toDate])
}
```

5. Explicacao do codigo.

O modelo e log de integracao da exportacao. `warnings` guarda avisos sem bloquear.

6. Validacao do passo.

Migration cria a tabela.

7. Cenario negativo/erro esperado.

Sem run, nao ha rastreio de exportacao.

### Passo 3 - Validar query e perfil fiscal

1. Objetivo funcional do passo no ERP.

Bloquear exportacao sem datas validas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/compliance/saftValidators.js`
    - EDITAR: nenhum.
    - REVER: perfil de empresa de BK-MF0-06.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Valida datas e deixa perfil para o service confirmar.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/compliance/saftValidators.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Converte uma data de query string para Date.
 *
 * @param {unknown} value Valor recebido em `req.query`.
 * @param {string} field Nome do campo para mensagem de erro.
 * @returns {Date} Data validada.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando a data e invalida.
 */
function parseDate(value, field) {
    const date = new Date(value);
    if (typeof value !== "string" || Number.isNaN(date.getTime())) throw httpError(400, "INVALID_SAFT_RANGE", `${field} deve ser uma data valida`);
    return date;
}

/**
 * Valida o periodo pedido para exportacao SAF-T.
 *
 * @param {Record<string, unknown>} query Query string Express.
 * @returns {{ fromDate: Date, toDate: Date }} Periodo validado.
 * @throws {import("../../lib/httpErrors.js").HttpError} 400 quando o intervalo e invalido.
 */
export function validateSaftExportQuery(query) {
    const fromDate = parseDate(query.from, "from");
    const toDate = parseDate(query.to, "to");
    if (fromDate > toDate) throw httpError(400, "INVALID_SAFT_RANGE", "Data inicial posterior a data final");
    return { fromDate, toDate };
}
```

5. Explicacao do codigo.

Datas invalidas bloqueiam consulta. O erro tem codigo de SAF-T para a UI explicar o problema. O JSDoc deixa claro que a route entrega datas ja validadas ao service.

6. Validacao do passo.

Testa `from=abc`.

7. Cenario negativo/erro esperado.

Data invalida devolve `400 INVALID_SAFT_RANGE`.

### Passo 4 - Implementar gerador XML MVP

1. Objetivo funcional do passo no ERP.

Gerar XML com dados reais e bloquear perfil incompleto.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/compliance/saftService.js`
    - EDITAR: nenhum.
    - REVER: modelos de empresa, documentos e lancamentos.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Escapa XML e inclui fontes principais.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/compliance/saftService.js
import { httpError } from "../../lib/httpErrors.js";

/**
 * Escapa texto antes de o colocar em XML.
 *
 * @param {unknown} value Valor vindo da base de dados.
 * @returns {string} Texto seguro para XML.
 */
function xml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/**
 * Bloqueia exportacao quando faltam dados fiscais minimos da empresa.
 *
 * @param {{ profile?: { nif?: string | null, legalName?: string | null, currency?: string | null } | null } | null} company Empresa com perfil fiscal.
 * @returns {void}
 * @throws {import("../../lib/httpErrors.js").HttpError} 422 quando NIF, nome legal ou moeda faltam.
 */
function assertCompanyProfile(company) {
    if (!company?.profile?.nif || !company?.profile?.legalName || !company?.profile?.currency) {
        throw httpError(422, "COMPANY_PROFILE_INCOMPLETE", "Dados fiscais da empresa incompletos");
    }
}

/**
 * Gera XML SAF-T MVP para a empresa ativa e regista a exportacao.
 *
 * Este service nao submete ficheiros a Autoridade Tributaria e nao declara conformidade legal completa.
 *
 * @param {import("@prisma/client").PrismaClient} prisma Cliente Prisma da app.
 * @param {{ companyId: string, userId: string, fromDate: Date, toDate: Date }} input Contexto multiempresa e periodo.
 * @returns {Promise<{ fileName: string, xml: string, counts: Record<string, number> }>} XML e contagens para evidence.
 * @throws {import("../../lib/httpErrors.js").HttpError} 401 sem empresa ativa ou 422 com perfil fiscal incompleto.
 */
export async function buildSaftXml(prisma, { companyId, userId, fromDate, toDate }) {
    if (!companyId) throw httpError(401, "COMPANY_CONTEXT_REQUIRED", "Empresa ativa obrigatoria");

    const [company, customers, suppliers, sales, purchases, entries] = await Promise.all([
        prisma.company.findUnique({ where: { id: companyId }, include: { profile: true } }),
        prisma.customer.findMany({ where: { companyId } }),
        prisma.supplier.findMany({ where: { companyId } }),
        prisma.saleDocument.findMany({ where: { companyId, status: { in: ["ISSUED", "SETTLED"] }, issuedAt: { gte: fromDate, lte: toDate } } }),
        prisma.purchaseDocument.findMany({ where: { companyId, issuedAt: { gte: fromDate, lte: toDate } } }),
        prisma.journalEntry.findMany({ where: { companyId, entryDate: { gte: fromDate, lte: toDate } } }),
    ]);

    assertCompanyProfile(company);
    const profile = company.profile;

    // Cada valor de base de dados passa por xml() para evitar XML malformado por caracteres especiais.
    const body = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<AuditFile>`,
        `<Header><CompanyName>${xml(profile.legalName)}</CompanyName><TaxRegistrationNumber>${xml(profile.nif)}</TaxRegistrationNumber><CurrencyCode>${xml(profile.currency)}</CurrencyCode></Header>`,
        `<MasterFiles>`,
        ...customers.map((item) => `<Customer><CustomerID>${xml(item.id)}</CustomerID><CompanyName>${xml(item.name)}</CompanyName><TaxRegistrationNumber>${xml(item.nif)}</TaxRegistrationNumber></Customer>`),
        ...suppliers.map((item) => `<Supplier><SupplierID>${xml(item.id)}</SupplierID><CompanyName>${xml(item.name)}</CompanyName><TaxRegistrationNumber>${xml(item.nif)}</TaxRegistrationNumber></Supplier>`),
        `</MasterFiles>`,
        `<SourceDocuments>`,
        ...sales.map((doc) => `<SalesInvoice><InvoiceNo>${xml(doc.number)}</InvoiceNo><InvoiceDate>${doc.issuedAt.toISOString().slice(0, 10)}</InvoiceDate></SalesInvoice>`),
        ...purchases.map((doc) => `<PurchaseInvoice><InvoiceNo>${xml(doc.supplierNumber)}</InvoiceNo><InvoiceDate>${doc.issuedAt.toISOString().slice(0, 10)}</InvoiceDate></PurchaseInvoice>`),
        `</SourceDocuments>`,
        `<GeneralLedgerEntries>${entries.map((entry) => `<Journal><JournalID>${xml(entry.id)}</JournalID></Journal>`).join("")}</GeneralLedgerEntries>`,
        `</AuditFile>`,
    ].join("");

    const fileName = `saft-${companyId}-${fromDate.toISOString().slice(0, 10)}-${toDate.toISOString().slice(0, 10)}.xml`;
    // O run e o log de integracao que prova quem exportou, quando e para que periodo.
    await prisma.saftExportRun.create({ data: { companyId, fromDate, toDate, fileName, status: "GENERATED", exportedById: userId } });
    return { fileName, xml: body, counts: { customers: customers.length, suppliers: suppliers.length, sales: sales.length, purchases: purchases.length, entries: entries.length } };
}
```

5. Explicacao do codigo.

`xml` evita quebrar o ficheiro com caracteres especiais. `assertCompanyProfile` bloqueia falta de NIF, nome legal ou moeda no `CompanyProfile`, que e o modelo fiscal criado na MF0. O service le dados reais por empresa, usa `supplierNumber` nas compras, gera XML e regista a exportacao. O JSDoc e os comentarios deixam explicito que isto e um SAF-T MVP, nao certificacao legal completa.

6. Validacao do passo.

Empresa com `CompanyProfile`, cliente e fatura deve gerar XML com `AuditFile`.

7. Cenario negativo/erro esperado.

Empresa sem perfil fiscal completo devolve `422 COMPANY_PROFILE_INCOMPLETE`.

### Passo 5 - Expor route protegida

1. Objetivo funcional do passo no ERP.

Disponibilizar XML a contabilista e auditor.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/compliance/saftRoutes.js`
    - EDITAR: `apps/api/src/server.js`
    - REVER: middlewares.
    - LOCALIZACAO: ficheiro completo e montagem.

3. Instrucoes do que fazer.

Cria `GET /api/compliance/saft`.

4. Codigo completo, correto e integrado com a app final.

```js
// apps/api/src/modules/compliance/saftRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { validateSaftExportQuery } from "./saftValidators.js";
import { buildSaftXml } from "./saftService.js";

/**
 * Constroi a route de exportacao SAF-T MVP.
 *
 * @param {{ prisma: import("@prisma/client").PrismaClient }} deps Dependencias da route.
 * @returns {import("express").Router} Router montado em `/api/compliance/saft`.
 */
export function buildSaftRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("CONTABILISTA", "AUDITOR")];
    router.get("/", guards, async (req, res) => {
        try {
            const filters = validateSaftExportQuery(req.query);
            // companyId vem do contexto autenticado para impedir exportacao de outra empresa.
            return res.status(200).json(await buildSaftXml(prisma, { companyId: req.companyId, userId: req.user.id, ...filters }));
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
import { buildSaftRoutes } from "./modules/compliance/saftRoutes.js";

app.use("/api/compliance/saft", buildSaftRoutes({ prisma }));
```

5. Explicacao do codigo.

O endpoint devolve JSON com XML para a pagina mostrar e descarregar. Roles ficam no backend, e o comentario mostra a regra multiempresa aplicada antes da exportacao.

6. Validacao do passo.

Auditor recebe `200`.

7. Cenario negativo/erro esperado.

Operacional recebe `403`.

### Passo 6 - Criar cliente API

1. Objetivo funcional do passo no ERP.

Obter XML SAF-T no frontend.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/complianceApi.ts`
    - EDITAR: nenhum.
    - REVER: cliente comum.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Tipa resposta.

4. Codigo completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/complianceApi.ts
import { apiClient } from "./apiClient";

/**
 * Resultado da exportacao SAF-T MVP.
 */
export type SaftExportResult = { fileName: string; xml: string; counts: Record<string, number> };

/**
 * Consulta a API de exportacao SAF-T.
 *
 * @param {string} from Data inicial `YYYY-MM-DD`.
 * @param {string} to Data final `YYYY-MM-DD`.
 * @returns {Promise<SaftExportResult>} XML, nome de ficheiro e contagens.
 */
export async function fetchSaftExport(from: string, to: string): Promise<SaftExportResult> {
    const params = new URLSearchParams({ from, to });
    return apiClient.get<SaftExportResult>(`/api/compliance/saft?${params.toString()}`);
}
```

5. Explicacao do codigo.

O cliente devolve nome do ficheiro, XML e contagens. O pedido usa `apiClient`, logo o cookie de sessao vai com o pedido sem expor tokens.

6. Validacao do passo.

Confirma que `fileName` termina em `.xml`.

7. Cenario negativo/erro esperado.

Perfil incompleto mostra mensagem do backend.

### Passo 7 - Criar pagina de exportacao

1. Objetivo funcional do passo no ERP.

Permitir gerar e descarregar XML.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/pages/SaftExportPage.tsx`
    - EDITAR: `apps/web/src/App.tsx`
    - REVER: `complianceApi.ts`.
    - LOCALIZACAO: ficheiro completo.

3. Instrucoes do que fazer.

Mostra resumo e conteudo XML.

4. Codigo completo, correto e integrado com a app final.

```tsx
// apps/web/src/pages/SaftExportPage.tsx
import { FormEvent, useState } from "react";
import { fetchSaftExport, type SaftExportResult } from "../lib/complianceApi";

/**
 * Pagina de exportacao SAF-T MVP.
 *
 * Gere datas, loading, erro e resultado. O XML pode ser inspecionado no ecra e descarregado sem
 * fazer submissao automatica a entidades externas.
 *
 * @returns {JSX.Element} Interface de compliance.
 */
export function SaftExportPage() {
    const [result, setResult] = useState<SaftExportResult | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setLoading(true);
        setError("");
        try {
            // A API valida perfil fiscal e roles; a UI apenas recolhe o periodo.
            setResult(await fetchSaftExport(String(form.get("from")), String(form.get("to"))));
        } catch (err) {
            setResult(null);
            setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Exportar SAF-T (PT)</h1>
            <form onSubmit={handleSubmit}><input name="from" type="date" required /><input name="to" type="date" required /><button disabled={loading}>{loading ? "A gerar..." : "Gerar XML"}</button></form>
            {error && <p role="alert">{error}</p>}
            {result && <section><p>Ficheiro: {result.fileName}</p><a download={result.fileName} href={`data:text/xml;charset=utf-8,${encodeURIComponent(result.xml)}`}>Descarregar XML</a><pre>{result.xml}</pre></section>}
        </main>
    );
}
```

5. Explicacao do codigo.

A pagina mostra o XML para defesa e permite confirmar que os blocos foram gerados. `result.xml` e `result.fileName` ficam disponiveis para descarga local, sem submissao automatica. O JSDoc reforca a fronteira legal e operacional.

6. Validacao do passo.

Gerar XML de um periodo com documentos.

7. Cenario negativo/erro esperado.

Sem NIF de empresa, mostrar erro.

### Passo 8 - Validar entrega e handoff

1. Objetivo funcional do passo no ERP.

Confirmar que SAF-T alimenta compliance e reporting seguintes.

2. Ficheiros envolvidos:
    - CRIAR: nenhum.
    - EDITAR: evidence.
    - REVER: XML e run.
    - LOCALIZACAO: checklist final.

3. Instrucoes do que fazer.

Anexa XML de exemplo e negativos.

4. Codigo completo, correto e integrado com a app final.

Sem codigo novo neste passo.

5. Explicacao do codigo.

A evidence prova que a exportacao usa dados reais e bloqueia perfil incompleto.

6. Validacao do passo.

Confirmar `SaftExportRun` criado.

7. Cenario negativo/erro esperado.

Role errada devolve `403`.

## Expected results

- `200` com `fileName`, `xml` e contagens.
- `422 COMPANY_PROFILE_INCOMPLETE` sem dados fiscais.
- `403` para role sem permissao.

## Critérios de aceite

- XML gerado com `AuditFile`.
- Dados por empresa.
- Export run criado.
- Escopo legal limitado ao MVP documentado.
- Cliente frontend usa `apiClient`.

## Validação final

- Confirmar escaping XML.
- Confirmar bloqueio de perfil incompleto.
- Confirmar role.

## Evidence para PR/defesa

- XML gerado.
- JSON de contagens.
- Provas de `422` e `403`.

## Handoff

BK-MF3-07 usa os mesmos documentos e dados mestres para relatorios operacionais.

## Changelog

- `2026-06-13`: corrigido para gerar XML MVP, validar perfil fiscal, usar `apiClient`, documentar limite legal e registar exportacao com JSDoc.
- `2026-06-13`: alinhado com MF0/MF1, lendo `CompanyProfile` para dados fiscais e `supplierNumber` para documentos de compra.
