# BK-MF1-01 - Configurar tabelas de IVA (taxas, isenções, códigos).

## Header

- `doc_id`: `GUIA-BK-MF1-01`
- `bk_id`: `BK-MF1-01`
- `macro`: `MF1`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF13`
- `fase_documental`: `Fase 1`
- `sprint`: `S03-S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-02`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-01-configurar-tabelas-de-iva-taxas-isencoes-codigos.md`
- `last_updated`: `2026-05-31`

## Objetivo

Executar RF13 para iva, seguindo os documentos canónicos e a stack contratada: React + Vite + TypeScript no frontend, Node.js + Express em ES Modules no backend, PostgreSQL e Prisma/equivalente na persistência.

## Importância funcional e pedagógica

Este BK transforma o requisito RF13 num caminho de implementação rastreável. Funcionalmente, fecha uma operação essencial da MF1; pedagogicamente, mostra como ligar requisito, modelo de dados, service, rota HTTP, UI, testes e evidência sem inventar regras fora dos documentos canónicos.

## Scope-in

- Modelo `VatRate` por empresa.
- Taxa em basis points para evitar erros de vírgula flutuante.
- Código único por empresa.
- Endpoint protegido para listagem e criação.
- UI administrativa mínima para gerir taxas ativas.

## Scope-out

- Submissão fiscal externa.
- Mapas de IVA, que pertencem a `BK-MF3-01`.
- SAF-T, que pertence a `BK-MF3-06` e `BK-MF7-07`.

## Estado antes

A aplicação tem empresa, clientes, fornecedores e artigos, mas ainda não tem uma tabela de IVA persistente e reutilizável.

## Estado depois

A empresa consegue criar, listar e desativar taxas/códigos de IVA por empresa, com validação backend e isolamento por `companyId`.

## Pré-requisitos

- Ler `docs/RF.md`, `docs/RNF.md`, `docs/planificacao/backlogs/BACKLOG-MVP.md`, `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`, `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md` e `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
- Confirmar que autenticação, contexto de empresa, roles/permissões e erros HTTP da MF0 estão disponíveis.
- Confirmar dependências canónicas: `-`.
- Nunca receber `companyId` do corpo do pedido; usar sempre o contexto autenticado.

## Glossário

- **Documento canónico:** fonte documental que define RF/RNF, BK, owner, dependências e prioridade.
- **Service:** camada backend onde ficam regras de negócio e transações.
- **Validator:** função que rejeita entrada inválida antes de persistir dados.
- **Evidência:** registo objetivo de ficheiros alterados, comandos executados e resultado obtido.

## Conceitos teóricos essenciais

- O backend é a autoridade para regras contabilísticas, valores monetários, datas e estados.
- Valores monetários devem ser guardados em cêntimos para evitar erros de arredondamento.
- Operações por empresa exigem filtro por `companyId` em todas as queries.
- Estados devem bloquear transições inválidas e devolver erros previsíveis.
- Escritas compostas devem usar transação para evitar dados parciais.

## Arquitetura do BK

- Fluxo: `FLOW-MF1-VAT-RATES`
- Endpoint principal: `/api/vat-rates`
- Módulo backend: `apps/api/src/modules/vat-rates/`
- Cliente frontend: `apps/web/src/lib/vatRateApi.ts`
- Rotas protegidas por `requireAuth(prisma)` e `requireCompanyContext(prisma)`.
- Respostas de erro normalizadas por `toHttpError`.

## Ficheiros a criar/editar/rever

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/vat-rates/`
- `apps/api/src/server.js`
- `apps/web/src/lib/vatRateApi.ts`
- `apps/web/src/pages/VatRatesPage.tsx`
- Testes unitários e de contrato do domínio alterado.

## Erros comuns

- Calcular totais no browser e confiar neles no backend.
- Esquecer filtros por `companyId`.
- Guardar dinheiro como decimal binário.
- Permitir estados impossíveis por falta de validação.
- Devolver stack traces ou mensagens técnicas cruas ao utilizador.

## Cenários negativos

- Pedido sem sessão deve devolver `401`.
- Pedido sem empresa ativa deve devolver `403` ou o erro já definido na MF0.
- Entrada mal formada deve devolver `400` sem escrita parcial.
- Recurso de outra empresa deve devolver `404` ou `403`, nunca dados cruzados.

## Passos lineares

### Passo 1 - Confirmar contrato canónico e fronteiras

1. Objetivo funcional do passo no ERP.

Garantir que BK-MF1-01 implementa apenas RF13, com dependências, owner, prioridade e próximo BK iguais aos documentos canónicos.

2. Ficheiros envolvidos:
- CRIAR: nenhum ficheiro neste passo.
- EDITAR: nenhum ficheiro neste passo.
- REVER: documentos canónicos listados nos pré-requisitos.
- LOCALIZAÇÃO: topo deste guia e matriz/backlog.

3. Instruções do que fazer.

Confirmar que o BK é `BK-MF1-01`, requisito `RF13`, dependências `-`, sprint `S03-S04` e próximo BK `BK-MF1-02`. Se o código real tiver caminhos diferentes, manter contratos de negócio e registar a decisão na evidência.

4. Código completo, correto e integrado com a app final.

```text
bk=BK-MF1-01
macro=MF1
rf=RF13
endpoint=/api/vat-rates
deps=-
```

5. Explicação do código.

Este bloco não é executado pela app; é o contrato mínimo que impede drift antes de editar código. A execução real começa no passo seguinte.

6. Validação do passo.

Comparar header do guia com `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`. Qualquer divergência bloqueia a implementação.

7. Cenário negativo/erro esperado.

Se surgir uma regra sem fonte documental, não a transformar em requisito; registar a incerteza na evidência e pedir decisão ao responsável.

### Passo 2 - Implementar dados e backend

1. Objetivo funcional do passo no ERP.

Criar a persistência e as regras backend para iva, com validação, transações e isolamento por empresa.

2. Ficheiros envolvidos:
- CRIAR: `apps/api/src/modules/vat-rates/` com service e routes.
- EDITAR: `apps/api/prisma/schema.prisma` e `apps/api/src/server.js`.
- REVER: BKs dependentes da MF0/MF1 indicados no header.
- LOCALIZAÇÃO: modelos Prisma no domínio correspondente e rota montada em `/api/vat-rates`.

3. Instruções do que fazer.

Aplicar o schema, criar migration, implementar service antes da rota, usar `companyId` do contexto e devolver erros HTTP normalizados. Montar a rota em `server.js` junto das restantes rotas da app.

4. Código completo, correto e integrado com a app final.

Localização: `apps/api/prisma/schema.prisma`.

```prisma
enum VatRateType {
  NORMAL
  INTERMEDIATE
  REDUCED
  EXEMPT
  OTHER
}

model VatRate {
  id              String      @id @default(uuid())
  companyId       String
  code            String
  description     String
  rateBps         Int
  type            VatRateType
  exemptionReason String?
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, code])
  @@index([companyId, isActive])
}
```

Localização: `apps/api/src/modules/vat-rates/vatRateService.js`.

```js
import { httpError } from "../../lib/httpErrors.js";

const vatTypes = new Set(["NORMAL", "INTERMEDIATE", "REDUCED", "EXEMPT", "OTHER"]);

function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

export function validateVatRateInput(input) {
    if (!input || typeof input !== "object") {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const code = normalizeText(input.code).toUpperCase();
    const description = normalizeText(input.description);
    const type = normalizeText(input.type).toUpperCase();
    const exemptionReason = normalizeText(input.exemptionReason) || null;
    const rateBps = Number(input.rateBps);

    if (!code || code.length > 20) throw httpError(400, "INVALID_CODE", "Codigo de IVA invalido");
    if (!description || description.length > 120) throw httpError(400, "INVALID_DESCRIPTION", "Descricao de IVA invalida");
    if (!vatTypes.has(type)) throw httpError(400, "INVALID_TYPE", "Tipo de IVA invalido");
    if (!Number.isInteger(rateBps) || rateBps < 0 || rateBps > 10000) throw httpError(400, "INVALID_RATE", "Taxa de IVA invalida");
    if (type === "EXEMPT" && !exemptionReason) throw httpError(400, "MISSING_EXEMPTION_REASON", "Motivo de isencao obrigatorio");

    return { code, description, type, exemptionReason, rateBps };
}

export async function listVatRates(prisma, companyId) {
    return prisma.vatRate.findMany({ where: { companyId }, orderBy: [{ isActive: "desc" }, { code: "asc" }] });
}

export async function createVatRate(prisma, companyId, input) {
    const data = validateVatRateInput(input);
    try {
        return await prisma.vatRate.create({ data: { ...data, companyId } });
    } catch (error) {
        if (error.code === "P2002") throw httpError(409, "VAT_RATE_EXISTS", "Codigo de IVA ja existe nesta empresa");
        throw error;
    }
}

export async function setVatRateActive(prisma, companyId, id, isActive) {
    const found = await prisma.vatRate.findFirst({ where: { id, companyId } });
    if (!found) throw httpError(404, "VAT_RATE_NOT_FOUND", "Taxa de IVA nao encontrada");
    return prisma.vatRate.update({ where: { id }, data: { isActive: Boolean(isActive) } });
}
```

Localização: `apps/api/src/modules/vat-rates/vatRateRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { createVatRate, listVatRates, setVatRateActive } from "./vatRateService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    return res.status(response.status).json({ error: response.code, message: response.message });
}

export function buildVatRateRoutes({ prisma }) {
    const router = Router();
    const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA")];

    router.get("/", guards, async (req, res) => {
        try { return res.status(200).json({ data: await listVatRates(prisma, req.companyId) }); }
        catch (error) { return sendError(res, error); }
    });

    router.post("/", guards, async (req, res) => {
        try { return res.status(201).json({ data: await createVatRate(prisma, req.companyId, req.body) }); }
        catch (error) { return sendError(res, error); }
    });

    router.patch("/:id/active", guards, async (req, res) => {
        try { return res.status(200).json({ data: await setVatRateActive(prisma, req.companyId, req.params.id, req.body.isActive) }); }
        catch (error) { return sendError(res, error); }
    });

    return router;
}
```

Localização: editar `apps/api/src/server.js`.

```js
import { buildVatRateRoutes } from "./modules/vat-rates/vatRateRoutes.js";

app.use("/api/vat-rates", buildVatRateRoutes({ prisma }));
```

5. Explicação do código.

O schema define as invariantes persistentes. O service concentra validação, cálculo, transações e regras de estado. A route só trata transporte HTTP, autenticação, contexto de empresa e resposta. Esta separação facilita testes e reduz regressões entre MF1 e MF3.

6. Validação do passo.

Executar teste unitário do service, teste de contrato do endpoint `/api/vat-rates` e confirmar que todos os registos criados pertencem a `req.companyId`.

7. Cenário negativo/erro esperado.

Entrada inválida deve falhar antes do Prisma; estado inválido deve devolver `409`; ausência de recurso dentro da empresa ativa deve devolver `404`.

### Passo 3 - Implementar frontend, testes e handoff

1. Objetivo funcional do passo no ERP.

Disponibilizar a operação ao utilizador, com cliente API tipado, estados de carregamento/erro/sucesso e evidência que permita revisão técnica.

2. Ficheiros envolvidos:
- CRIAR: `apps/web/src/lib/vatRateApi.ts` e página/componente do domínio.
- EDITAR: rotas frontend existentes, se a app já tiver router.
- REVER: `apps/web/src/lib/apiClient.ts` e componentes de formulário/listagem já usados na MF0.
- LOCALIZAÇÃO: módulo visual correspondente à operação da MF1.

3. Instruções do que fazer.

Criar funções de API tipadas, consumir erros normalizados do backend e mostrar mensagens claras. Não recalcular no frontend valores que o backend já calcula como fonte de verdade.

4. Código completo, correto e integrado com a app final.

Localização: `apps/web/src/lib/vatRateApi.ts`.

```ts
import { apiClient } from "./apiClient";

export type VatRate = { id: string; code: string; description: string; rateBps: number; type: string; exemptionReason: string | null; isActive: boolean };

export async function fetchVatRates(): Promise<VatRate[]> {
    const response = await apiClient.get<{ data: VatRate[] }>("/api/vat-rates");
    return response.data;
}

export async function createVatRate(input: { code: string; description: string; rateBps: number; type: string; exemptionReason?: string }) {
    return apiClient.post<{ data: VatRate }>("/api/vat-rates", input);
}
```

Localização: teste unitário ou de contrato do service.

```js
it("rejeita taxa isenta sem motivo", async () => {
    await expect(createVatRate(prisma, companyId, { code: "ISE", description: "Isento", rateBps: 0, type: "EXEMPT" }))
        .rejects.toMatchObject({ status: 400, code: "MISSING_EXEMPTION_REASON" });
});
```

5. Explicação do código.

O cliente API mantém o contrato entre UI e backend num ponto único. Os testes focam o comportamento que protege a contabilidade: validação, transação, estado e isolamento por empresa.

6. Validação do passo.

- Correr testes unitários do módulo.
- Fazer smoke via UI ou chamada HTTP autenticada.
- Confirmar que mensagens de erro são compreensíveis e não expõem detalhes internos.

7. Cenário negativo/erro esperado.

Se o backend devolver `400`, `401`, `403`, `404` ou `409`, a UI deve mostrar erro controlado e manter o formulário/listagem num estado recuperável.

## Expected results

- A empresa consegue criar, listar e desativar taxas/códigos de IVA por empresa, com validação backend e isolamento por `companyId`.
- Endpoint `/api/vat-rates` protegido e filtrado por empresa.
- Testes cobrem pelo menos um caso feliz e três cenários negativos relevantes.
- Evidência lista schema, services, rotas, UI e comandos executados.

## Critérios de aceite

- RF13 fica coberto sem alterar o contrato canónico do BK.
- Nenhum dado de outra empresa aparece na resposta.
- Entradas inválidas falham com erro previsível.
- Escritas compostas são transacionais.
- O próximo BK consegue reutilizar os modelos e endpoints aqui definidos.

## Validação final

- `npm run test:unit`
- `npm run test:contracts`
- Smoke autenticado do endpoint principal.
- Revisão manual do diff para confirmar ausência de alteração de RF/RNF.

## Evidence para PR/defesa

- Ficheiros alterados e motivo.
- Prints ou logs do caso feliz.
- Resultado dos testes e dos cenários negativos.
- Nota explícita sobre dependências cumpridas e handoff.

## Handoff

O `BK-MF1-02` deve usar `VatRate` ativo para calcular linhas de venda e guardar `vatRateId` em cada linha.

## Changelog

- `2026-05-31`: Guia corrigido no modo `corrigir_apenas`, com contrato técnico completo, código por camada, validações e handoff MF1.
