# BK-MF3-06 - Exportar SAF-T (PT) de faturação e contabilidade

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
- `last_updated`: `2026-07-10`

## Objetivo

Implementar uma exportação SAF-T (PT) rastreável, baseada num período fiscal existente e compatível com a versão oficial `1.04_01`. A geração permanece desativada até passarem validação XSD, reconciliação contabilística e revisão externa.

Este guia segue o catálogo central [CONTRATO-INTERFACES-IMPLEMENTACAO.md](../../CONTRATO-INTERFACES-IMPLEMENTACAO.md). O contrato antigo de exportação síncrona foi retirado e não deve ser recriado.

## Conceitos essenciais

- O período não é um intervalo livre: o pedido recebe `fiscalPeriodId` e o backend obtém as datas do `FiscalPeriod` da empresa ativa.
- O XML usa namespace e estrutura SAF-T (PT) `1.04_01`, incluindo `Header`, master files, tabela de impostos, documentos e movimentos contabilísticos aplicáveis.
- O ficheiro final é codificado em Windows-1252. Não basta trocar o texto do encoding no prólogo XML.
- O XML fica em storage S3 compatível. PostgreSQL guarda apenas estado, metadata, hash SHA-256 e resultados de validação.
- `SAFT_EXPORT_ENABLED=false` é fail-closed: responde com indisponibilidade controlada e não gera um ficheiro parcial.
- XSD válido não prova coerência dos dados; os totais do XML têm de reconciliar com as fontes contabilísticas.

## Contrato público

```http
POST /api/compliance/saft/exports
Content-Type: application/json

{
  "type": "FULL",
  "fiscalPeriodId": "<uuid-do-periodo-da-empresa-ativa>"
}
```

Resposta inicial:

```json
{
  "export": {
    "id": "<export-run-id>",
    "status": "READY",
    "type": "FULL",
    "fiscalPeriodId": "<uuid-do-periodo>",
    "fileName": "saft-...xml",
    "sha256": "<hash-sha256>",
    "sizeBytes": 1234,
    "validation": {
      "xsdStatus": "VALID",
      "totalsStatus": "VALID",
      "externalReviewStatus": "APPROVED"
    },
    "downloadAvailable": true
  }
}
```

Consulta e download:

```text
GET /api/compliance/saft/exports/:exportId
GET /api/compliance/saft/exports/:exportId/download
```

O `POST` só persiste e devolve o run depois de concluir gerador interno,
validação externa, reconciliação, revisão, upload e transação; apesar do HTTP
`202`, não cria um `PENDING` para processamento posterior. Qualquer pré-condição
em falta falha antes do run. O download só é permitido quando o run está
`READY`, pertence à empresa ativa e tem `xsdStatus=VALID`,
`totalsStatus=VALID` e `externalReviewStatus=APPROVED`. Deve responder com
`Content-Disposition: attachment`, `X-Content-Type-Options: nosniff` e
`Cache-Control: private, no-store`.

## Ficheiros a criar ou editar

- EDITAR: `apps/api/prisma/schema.prisma`
- CRIAR/EDITAR: `apps/api/src/modules/compliance/saftRoutes.js`
- CRIAR/EDITAR: `apps/api/src/modules/compliance/saftService.js`
- CRIAR/EDITAR: `apps/api/src/modules/compliance/saftXml.js`
- CRIAR/EDITAR: `apps/api/src/modules/compliance/saftValidation.js`
- REUTILIZAR: adapter privado de storage em `apps/api/src/lib/storage/`
- CRIAR/EDITAR: `apps/api/tests/contracts/saft.contract.test.js`
- CRIAR/EDITAR: `apps/api/tests/integration/saft.integration.test.js`
- CRIAR/EDITAR: `apps/web/src/pages/SaftExportPage.tsx`
- CRIAR/EDITAR: `apps/web/src/lib/api/saft.ts`

## Tutorial técnico linear

### Passo 1 - Modelar o run de exportação

O modelo deve permitir provar a origem e o resultado sem guardar XML na base de dados.

```prisma
model SaftExportRun {
  id                    String   @id @default(uuid())
  companyId             String
  fromDate              DateTime
  toDate                DateTime
  fileName              String
  saleDocumentCount     Int
  purchaseDocumentCount Int
  journalEntryCount     Int
  exportedById          String
  exportedAt            DateTime @default(now())
  type                  String   @default("FULL")
  fiscalPeriodId        String?
  storageKey            String?
  sha256                String?
  sizeBytes             Int?
  status                String   @default("LEGACY")
  xsdStatus             String   @default("PENDING")
  totalsStatus          String   @default("PENDING")
  externalReviewStatus  String   @default("PENDING")
  validationDetails     Json?
  completedAt           DateTime?

  @@index([companyId, fromDate, toDate])
  @@index([companyId, fiscalPeriodId, type, exportedAt])
  @@index([status, exportedAt])
}
```

Este é o shape transicional realmente implementado. Não inventes provider ou
booleans paralelos; usa os estados e `validationDetails`. A migration é
expand-only. `FiscalPeriod.fiscalYear` permanece nullable para registos legados
e tem de ser classificado por pessoa autorizada; nunca o infiras nem faças
backfill automático a partir das datas.

### Passo 2 - Validar o pedido e o período

O validator aceita apenas tipos conhecidos e UUIDs. No service, procura o período por `{ id: fiscalPeriodId, companyId }`; um período de outra empresa deve parecer inexistente. Rejeita períodos incompletos e nunca aceita datas substitutas no body ou query.

Erros mínimos:

- `400 INVALID_SAFT_REQUEST` para formato inválido;
- `400 INVALID_SAFT_EXPORT_TYPE` quando `type` não é `FULL`;
- `404 FISCAL_PERIOD_NOT_FOUND` para período fora da empresa ativa;
- `409 SAFT_FISCAL_PERIOD_NOT_CLOSED` para período ainda aberto;
- `422 SAFT_SOURCE_NOT_READY` para dados fiscais obrigatórios em falta;
- `503 SAFT_EXPORT_DISABLED` quando a feature flag está desligada.

### Passo 3 - Construir XML estruturado

Usa um XML builder; não concatena strings com dados do utilizador. O gerador recebe um snapshot normalizado e produz, no mínimo, os blocos exigidos para o tipo pedido.

```js
const xml = buildSaftXml({
  version: "1.04_01",
  namespace: "urn:OECD:StandardAuditFile-Tax:PT_1.04_01",
  company,
  fiscalPeriod,
  masterFiles,
  taxTable,
  sourceDocuments,
  generalLedgerEntries,
});

const encoded = iconv.encode(xml, "windows-1252");
```

Qualquer carácter não representável deve gerar erro explícito ou ser tratado por uma política documentada e testada. Nunca publiques bytes UTF-8 com prólogo Windows-1252.

### Passo 4 - Validar e reconciliar

Antes de qualquer escrita no object storage:

1. valida o XML contra o XSD indicado por `SAFT_XSD_PATH`;
2. recalcula contagens e totais monetários a partir do XML;
3. compara-os com o snapshot da base de dados;
4. regista os resultados no run;
5. só escreve a chave privada final depois de todas as validações internas e
   externas passarem.

Uma revisão externa/contabilística continua obrigatória para fechar a evidence legal. Um teste com fixture não substitui essa revisão.

### Passo 5 - Guardar no S3 e disponibilizar download

Escreve o artefacto validado numa chave privada aleatória e calcula o SHA-256
dos bytes finais. Se a transação PostgreSQL falhar depois do upload, executa
cleanup compensatório. Se o upload falhar ou a transação não confirmar, a
operação falha e não persiste um run enganador `FAILED`/`READY`.

Nunca devolvas o XML dentro de JSON. O browser consulta o run e descarrega o ficheiro através do endpoint autorizado.

### Passo 6 - Implementar a página

A página deve:

- carregar períodos fiscais autorizados num `select`/autocomplete;
- enviar apenas `type` e `fiscalPeriodId`;
- preservar a seleção quando recebe `400`, `409` ou `503`;
- mostrar estado e erros de validação em componentes próprios, sem `<pre>` técnico;
- ativar o botão de download apenas para runs concluídos;
- tratar `401` através do `AuthProvider` comum.

### Passo 7 - Testar positivos e negativos

Testes obrigatórios:

- feature flag desligada bloqueia criação;
- período de outra empresa devolve `404`;
- pedido com intervalo livre é rejeitado;
- XSD inválido impede storage e download;
- encoding final é Windows-1252;
- hash guardado coincide com o objeto descarregado;
- totais de vendas, impostos e movimentos reconciliam;
- download exige sessão, permissão e empresa correta;
- falha S3 não deixa objeto nem metadata órfãos;
- o contrato retirado não volta a ser montado.

## Validação final

```bash
cd apps/api
npm run syntax:check
npm run test:contracts
npm run test:integration

cd ../web
npm run typecheck
npm run test
npm run build
```

Não marques integração, XSD, storage ou revisão externa como PASS se não foram executados. `skip` e ambiente ausente são `BLOQUEADO_AMBIENTE`.

## Critérios de aceite

- O pedido usa `fiscalPeriodId`, nunca datas livres.
- O XML declara e cumpre `1.04_01` e Windows-1252.
- XSD e reconciliação falham em modo fechado.
- O objeto fica privado no S3 e a base guarda metadata/hash.
- O download é autorizado e não expõe o XML em JSON.
- A feature flag permanece desligada até existir toda a evidence obrigatória.
- A revisão externa é registada honestamente.

## Evidence para PR/defesa

- migration e contagens antes/depois;
- comando XSD, exit code e resumo;
- reconciliação de totais;
- SHA-256 local e do objeto descarregado;
- negativo multiempresa e negativo da feature flag;
- estado da revisão externa;
- confirmação de que não foram registados tokens, cookies, credenciais ou URLs com password.

## Importância

SAF-T é um artefacto fiscal sensível: XML bem formado sem XSD e reconciliação pode continuar materialmente errado.

## Scope-in

- Run por período fiscal, geração `1.04_01`, XSD, reconciliação, S3 e download.
- Feature flag fail-closed e revisão externa.

## Scope-out

- Submissão automática à AT, certificação da aplicação ou intervalos livres.

## Estado antes e depois

- Antes: contrato síncrono parcial e sem validações suficientes.
- Depois: exportação persistente, privada, verificável e desativada até os gates passarem.

## Pre-requisitos

- Dados fiscais completos, períodos e lançamentos implementados.
- XSD oficial controlado e storage de teste disponível.

## Glossário

- **XSD:** schema que valida a estrutura XML.
- **Reconciliação:** comparação independente entre XML e fontes.
- **Export run:** estado persistente da geração e validações.

## Conceitos teóricos essenciais

Encoding é uma propriedade dos bytes; XSD não prova coerência; a feature flag impede disponibilizar uma exportação incompleta.

## Arquitetura do BK

POST de run → snapshot do período → XML → Windows-1252 → XSD/reconciliação → S3 → consulta/download autorizado.

## Ficheiros a criar/editar/rever

Implementa apenas em `apps/api/...` e `apps/web/...`; revê schema, migrations, XSD, adapter S3 e testes.

## Cenários negativos mínimos

Executa pelo menos 3 cenários negativos: período de outra empresa, XSD inválido e flag desligada, mais encoding/hash/cleanup.

## Handoff

Entrega a `BK-MF3-07` dados fiscais exportáveis apenas quando os gates forem demonstrados; qualquer blocker mantém a feature desativada.

## Changelog

- `2026-07-10`: removido o exportador parcial e introduzido contrato por run, período fiscal, XSD, encoding, S3 e revisão externa.
