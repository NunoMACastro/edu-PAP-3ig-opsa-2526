# BK-MF7-02 - Cumprir obrigações legais de retenção (10 anos, contabilidade)

## Header

- `doc_id`: `GUIA-BK-MF7-02`
- `bk_id`: `BK-MF7-02`
- `macro`: `MF7`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF19`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-03`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-02-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais implementar, no backend, uma regra verificável que impede a remoção de registos contabilísticos enquanto ainda estiverem dentro do período legal de retenção de 10 anos. O guia mostra quais são as entidades protegidas, como o prazo é calculado, como a decisão é auditada e onde a validação deve ser chamada antes de qualquer operação destrutiva.

O resultado esperado é uma proteção interna e reutilizável: os endpoints existentes continuam responsáveis por autenticação, autorização e validação de parâmetros, mas passam a chamar um gate comum antes de apagar documentos, lançamentos, mapas de IVA, exportações SAF-T ou registos de auditoria ligados à contabilidade.

#### Importância

Documentos contabilísticos não podem ser tratados como dados descartáveis. Em contexto fiscal, uma empresa precisa de manter prova documental, lançamentos, mapas e histórico de auditoria durante o prazo legal. Se a aplicação permitir remoções livres, a OPSA perde rastreabilidade e abre risco de incumprimento, perda de evidência e impossibilidade de defesa numa revisão técnica ou legal.

Este BK protege a coerência da MF7 porque liga três responsabilidades que têm de trabalhar em conjunto:

- a base de dados sabe quais os registos com retenção ativa;
- os serviços backend bloqueiam a remoção enquanto o prazo não terminar;
- a auditoria regista a autorização quando a remoção passa a ser permitida.

#### Scope-in

- Criar o modelo `RetentionHold` em `apps/api/prisma/schema.prisma`.
- Acrescentar a relação inversa `retentionHolds RetentionHold[]` no modelo `Company`.
- Criar a política de retenção em `apps/api/src/modules/compliance/retentionPolicy.js`.
- Criar o gate de remoção em `apps/api/src/modules/compliance/retentionDeletionGate.js`.
- Declarar a ação sensível `"retention.delete.allowed"` no contrato de auditoria existente em `apps/api/src/modules/audit/auditLogService.js`.
- Integrar funções de domínio para as entidades contabilísticas protegidas.
- Cobrir os cenários negativos e positivos com testes unitários em `apps/api/tests/unit/retentionPolicy.test.js`.
- Acrescentar o script `test:mf7:retention` em `apps/api/package.json`.

#### Scope-out

- Não criar novas funcionalidades de processamento documental avançado, pesquisa inteligente, rotinas fiscais fora da retenção legal ou ligações externas que não pertençam a este BK.
- Não alterar o prazo legal sem requisito explícito validado pela equipa.
- Não criar endpoints públicos novos só para este BK.
- Não substituir guards de autenticação, permissões ou validação já existentes nos endpoints destrutivos.
- Não apagar dados históricos através de scripts manuais.
- Não implementar automações fiscais avançadas nem novas exportações SAF-T.

#### Estado antes e depois

Antes deste BK, a aplicação podia ter entidades contabilísticas persistidas, auditoria e exportações, mas faltava uma regra central que dissesse: "este registo ainda tem retenção legal ativa, logo não pode ser removido". A proteção ficava dependente de cada serviço se lembrar de validar o prazo.

Depois deste BK, cada operação destrutiva relevante passa por uma função de domínio que calcula a data de fim da retenção, confirma se ainda existe bloqueio ativo e só deixa avançar quando a remoção é legalmente permitida. Quando a remoção fica autorizada, o backend regista a decisão como evento sensível de auditoria usando o contrato MF6: `companyId`, `userId`, `action`, `entity`, `entityId` e `details`.

#### Pre-requisitos

- MF0 concluída para estrutura base do projeto e contexto multiempresa.
- MF1 a MF4 concluídas para autenticação, dados nucleares, domínio transacional e auditoria base.
- MF5 concluída para fluxos web já protegidos.
- MF6 concluída para segurança, permissões e `recordSensitiveAudit`.
- BK-MF7-01 concluído para contexto fiscal e operacional da macrofase.
- A API deve ter Prisma funcional em `apps/api/prisma/schema.prisma`.
- Os testes backend devem correr a partir de `apps/api`.

#### Glossário

- `RetentionHold`: registo persistido que indica que uma entidade contabilística está protegida por retenção legal até determinada data.
- `Entidade retida`: entidade contabilística protegida, como documento de venda, documento de compra, lançamento contabilístico, mapa de IVA, exportação SAF-T ou log de auditoria.
- `periodEndAt`: data contabilística de referência usada para iniciar a contagem do prazo de retenção.
- `retainUntil`: data final até à qual o registo não pode ser removido.
- `Gate`: função backend chamada antes de uma operação destrutiva para decidir se a remoção pode continuar.
- `Auditoria sensível`: registo de auditoria para ações de alto impacto legal, fiscal, financeiro ou de segurança.
- `Empresa ativa`: empresa resolvida no backend a partir da sessão/contexto autenticado, nunca escolhida livremente pelo frontend.

#### Conceitos teóricos essenciais

A retenção contabilística é uma regra de conservação de evidência. O objetivo não é apenas impedir que alguém apague uma linha da base de dados; é garantir que a aplicação consegue demonstrar por que motivo manteve ou permitiu remover um registo. O `RNF19` define o requisito de retenção legal de 10 anos para contabilidade.

O prazo de 10 anos deve ser calculado a partir de uma data contabilística estável. Para documentos e lançamentos, essa data é o fim do período fiscal ou contabilístico a que o registo pertence. Guardar apenas a data de criação técnica seria insuficiente, porque um documento pode ser carregado depois do período a que diz respeito.

O `RetentionHold` liga uma empresa, uma entidade e um identificador de entidade a uma data `retainUntil`. Esta combinação evita misturar empresas e impede duplicar a mesma retenção para o mesmo registo. A relação inversa em `Company` ajuda o Prisma a validar que a ligação está completa dos dois lados.

O gate deve ser centralizado. Se cada service tiver a sua própria versão da regra, a aplicação fica vulnerável a diferenças subtis: uma entidade pode bloquear corretamente e outra pode esquecer a validação. Por isso, este BK cria uma política única e funções de domínio específicas que os services destrutivos importam diretamente.

A auditoria também faz parte da regra. Quando o prazo ainda está ativo, a operação falha e o erro informa que a remoção está bloqueada. Quando o prazo terminou, a operação pode continuar, mas o backend regista que a decisão foi avaliada e autorizada. Esse registo dá rastreabilidade à equipa, ao aluno e a uma defesa técnica.

O contexto multiempresa continua a ser obrigatório. O `companyId` usado nas queries deve vir da sessão ou do middleware backend já existente. O frontend pode enviar o identificador da entidade a remover, mas não decide ownership, empresa ativa, role ou permissão final.

#### Arquitetura do BK

Este BK não expõe um endpoint novo. A arquitetura é interna à API:

- endpoint HTTP existente recebe o pedido destrutivo;
- guard de autenticação e permissão existente valida o utilizador;
- service da entidade chama a função de domínio deste BK;
- função de domínio chama o gate comum;
- gate consulta `RetentionHold` e calcula se a retenção está ativa;
- se estiver ativa, lança erro com estado HTTP 409;
- se já tiver terminado, regista auditoria sensível e devolve autorização ao service.

Contrato técnico:

- Método HTTP: os métodos destrutivos existentes, normalmente `DELETE`.
- Payload público: nenhum payload novo definido por este BK.
- Parâmetros de rota: identificador da entidade a remover, por exemplo `saleDocumentId`.
- Contexto backend obrigatório: `companyId`, `userId` e data de referência da operação.
- Autorização: mantida nos guards já existentes; o gate não substitui permissões.
- Resultado de bloqueio: erro `409 Conflict` com código `RETENTION_HOLD_ACTIVE`.
- Resultado autorizado: o service pode continuar a remoção depois do registo de auditoria sensível.

#### Ficheiros a criar/editar/rever

| Ficheiro | Ação | Responsabilidade |
| --- | --- | --- |
| `apps/api/prisma/schema.prisma` | editar | Declarar `RetentionHold`, a relação inversa em `Company` e os índices. |
| `apps/api/src/modules/audit/auditLogService.js` | editar | Declarar `"retention.delete.allowed"` como ação sensível permitida. |
| `apps/api/src/modules/compliance/retentionPolicy.js` | criar | Calcular prazo de retenção e decidir se a entidade ainda está bloqueada. |
| `apps/api/src/modules/compliance/retentionDeletionGate.js` | criar | Expor gate comum e funções de domínio para os services. |
| `apps/api/tests/unit/retentionPolicy.test.js` | criar | Validar cálculo, bloqueio, autorização e auditoria. |
| `apps/api/package.json` | editar | Acrescentar script `test:mf7:retention`. |

#### Tutorial técnico linear

### Passo 1 - Confirmar as entidades contabilísticas protegidas

1. Objetivo funcional do passo no contexto da app.

Confirmar o contrato do `RNF19` antes de escrever código. Este passo garante que a retenção protege entidades contabilísticas reais da OPSA e não conceitos genéricos sem ligação ao domínio.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`
    - LOCALIZAÇÃO: linhas do `RNF19`, linha canónica do `BK-MF7-02` e contrato de `recordSensitiveAudit`.

3. Instruções do que fazer.

Confirma que o requisito fala de retenção contabilística de 10 anos e que o BK pertence à MF7. Depois confirma que a MF6 já entrega auditoria sensível com `recordSensitiveAudit(prisma, input)`. O conjunto inicial de entidades protegidas neste BK é:

- `SaleDocument`
- `PurchaseDocument`
- `JournalEntry`
- `VatMapRun`
- `SaftExportRun`
- `AuditLog`

Estas entidades representam documentos, lançamentos, apuramentos, exportações e histórico de auditoria com relevância contabilística. A retenção deve proteger a evidência de negócio, não apenas anexos ou ficheiros finais.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e preparatório, porque evita implementar uma política de retenção antes de confirmar o requisito, a sequência da macrofase e o contrato de auditoria herdado da MF6.

5. Explicação do código.

Não existe código para explicar neste passo. A decisão importante é de domínio: só entram entidades com relevância contabilística e auditável. Isto evita aplicar a retenção legal a tabelas operacionais sem requisito explícito, ou deixar de fora registos que servem de prova contabilística.

6. Validação do passo.

Confirma que `RNF19` está associado a `BK-MF7-02`, que o próximo BK é `BK-MF7-03` e que a MF6 documenta `recordSensitiveAudit` com os campos `entity`, `entityId` e `details`.

7. Cenário negativo/erro esperado.

Se alguém tentar acrescentar uma entidade como `MarketingLead` ou `TemporaryImportPreview`, a revisão deve rejeitar essa entidade por não estar justificada como prova contabilística no scope deste BK.

### Passo 2 - Declarar a ação sensível de retenção no serviço de auditoria

1. Objetivo funcional do passo no contexto da app.

Permitir que a auditoria sensível aceite a ação usada quando uma remoção contabilística é autorizada depois de terminar o prazo de retenção.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/audit/auditLogService.js`
    - REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`
    - LOCALIZAÇÃO: constante `SENSITIVE_ACTIONS`.

3. Instruções do que fazer.

Edita `apps/api/src/modules/audit/auditLogService.js` e substitui a constante de ações sensíveis por esta versão. Mantém as ações existentes e acrescenta apenas `"retention.delete.allowed"`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/audit/auditLogService.js
// LOCALIZAÇÃO: substituir a constante SENSITIVE_ACTIONS existente.
const SENSITIVE_ACTIONS = new Set([
    "permissions.update",
    "fiscalPeriod.close",
    "document.issue",
    "security.setting.update",
    // Esta ação só é gravada quando o gate confirma que a retenção já terminou.
    "retention.delete.allowed",
]);
```

5. Explicação do código.

Este código mantém o contrato sensível criado em MF6 e acrescenta a ação necessária para este BK. A constante impede que qualquer service invente ações de auditoria em runtime. O gate de retenção vai chamar `recordSensitiveAudit` com `action: "retention.delete.allowed"`, por isso a ação tem de existir antes de o log ser criado. O código prepara o ficheiro `retentionDeletionGate.js`, usa o helper de auditoria de MF6 e evita o erro comum de gravar uma ação sensível não declarada. Para testar, confirma que o ficheiro contém a ação e que `recordSensitiveAudit` continua a validar `entity`, `entityId` e `details`.

6. Validação do passo.

Executa uma pesquisa textual em `apps/api/src/modules/audit/auditLogService.js` e confirma que `"retention.delete.allowed"` aparece dentro de `SENSITIVE_ACTIONS`.

7. Cenário negativo/erro esperado.

Se a ação não for adicionada, `recordSensitiveAudit` deve lançar erro de ação sensível não declarada quando o gate tentar registar a autorização de remoção.

### Passo 3 - Criar o modelo `RetentionHold` no Prisma

1. Objetivo funcional do passo no contexto da app.

Guardar, por empresa e por entidade contabilística, até quando cada registo está protegido pela retenção legal.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/prisma/schema.prisma`
    - LOCALIZAÇÃO: modelo `Company` existente e zona de modelos contabilísticos/auditoria do schema.

3. Instruções do que fazer.

No modelo `Company`, acrescenta a relação inversa `retentionHolds RetentionHold[]` junto das restantes relações de domínio. Depois acrescenta o modelo `RetentionHold`. A relação inversa é importante porque o Prisma valida relações entre modelos e porque o schema já usa este padrão para `auditLogs`, `saftExportRuns` e outras entidades por empresa.

4. Código completo, correto e integrado com a app final.

```prisma
// apps/api/prisma/schema.prisma
// LOCALIZAÇÃO: substituir o model Company pela versão existente com a nova relação retentionHolds.
model Company {
  id                String              @id @default(uuid())
  name              String
  nif               String?             @unique
  memberships       CompanyMembership[]
  invitations       CompanyInvitation[]
  profile           CompanyProfile?
  accounts          Account[]
  fiscalPeriods     FiscalPeriod[]
  customers         Customer[]
  suppliers         Supplier[]
  items             Item[]
  warehouses        Warehouse[]
  vatRates          VatRate[]
  numberSequences   NumberSequence[]
  saleDocuments     SaleDocument[]
  receipts          Receipt[]
  journalEntries    JournalEntry[]
  purchaseDocuments PurchaseDocument[]
  payments          Payment[]
  auditLogs         AuditLog[]
  // A relação inversa deixa o Prisma ligar cada retenção legal à empresa ativa.
  retentionHolds    RetentionHold[]
  purchaseApprovalHistories PurchaseApprovalHistory[]
  stockBalances     StockBalance[]
  stockMovements    StockMovement[]
  stockCostLayers   StockCostLayer[]
  stockCostConsumptions StockCostConsumption[]
  inventoryCounts   InventoryCount[]
  stockAlertSettings StockAlertSetting[]
  journalAttachments JournalAttachment[]
  vatMapRuns        VatMapRun[]            @relation("CompanyVatMapRuns")
  treasuryAccounts  TreasuryAccount[]
  treasuryBalanceSnapshots TreasuryBalanceSnapshot[]
  bankStatementImports BankStatementImport[]
  bankStatementLines BankStatementLine[]
  bankReconciliationSuggestions BankReconciliationSuggestion[]
  businessImportRuns BusinessImportRun[]
  saftExportRuns    SaftExportRun[]
  cashflowForecastRuns CashflowForecastRun[]
  operationalReportRuns OperationalReportRun[]
  executiveKpiRuns  ExecutiveKpiRun[]
  aiInsights       AiInsight[]
  aiActionSuggestions AiActionSuggestion[]
  aiQuestionRuns   AiQuestionRun[]
  smartAlerts      SmartAlert[]
  reminders        Reminder[]
  operationalTasks OperationalTask[]
  notifications    InAppNotification[]
  integrationLogs  IntegrationLog[]
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
}
```

Explicação do código.

Este bloco mostra a alteração exata que fecha a relação inversa no modelo `Company`. Mantém as relações já existentes e acrescenta `retentionHolds RetentionHold[]` junto das relações contabilísticas e de auditoria. A relação liga a empresa ativa aos bloqueios de retenção e evita um schema Prisma incompleto.

```prisma
// apps/api/prisma/schema.prisma
// LOCALIZAÇÃO: acrescentar perto dos modelos de auditoria/compliance.
model RetentionHold {
  id        String   @id @default(cuid())
  companyId String

  /// Nome técnico da entidade protegida pela retenção contabilística.
  entity   String
  entityId String

  /// Data contabilística usada como referência para calcular os 10 anos.
  periodEndAt DateTime
  retainUntil DateTime

  reason    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // onDelete: Restrict impede apagar a empresa enquanto existirem retenções legais associadas.
  company Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  @@unique([companyId, entity, entityId])
  @@index([companyId, entity])
  @@index([companyId, retainUntil])
}
```

Explicação do código.

O modelo `RetentionHold` guarda a empresa, a entidade protegida, o identificador do registo e as datas usadas pela política. A restrição única impede duplicar retenções para o mesmo registo dentro da mesma empresa. Os índices ajudam a procurar por empresa, entidade e data de retenção sem varrer a tabela inteira. O `companyId` deve vir sempre do contexto autenticado no backend; não deve ser escolhido pelo frontend.

Depois de editar o schema, cria a migration conforme o fluxo usado no projeto:

```bash
cd apps/api
npx prisma migrate dev --name add_retention_holds
```

Explicação do código.

O primeiro comando entra na API dos alunos e o segundo gera a migration Prisma com um nome explícito. A migration deve criar a tabela, a relação, a restrição única e os índices. Se a equipa estiver a rever SQL manualmente, confirma no diff da migration que estes elementos existem antes de avançar.

5. Explicação do código.

Os blocos anteriores fecham os dois lados da relação Prisma: `Company` passa a conhecer as suas retenções e `RetentionHold` passa a apontar para a empresa. Esta estrutura cumpre `RNF19`, preserva multiempresa e prepara os services destrutivos para consultarem a retenção por `companyId`, `entity` e `entityId`. O aluno pode adaptar o nome da migration, mas não deve remover a restrição única, os índices nem o filtro por empresa.

6. Validação do passo.

Executa `cd apps/api && npm run prisma:validate`. O resultado esperado é validação Prisma sem erro de relação em falta, modelo inválido ou índice mal formado.

7. Cenário negativo/erro esperado.

Se a relação inversa em `Company` ficar em falta e o schema exigir relação explícita, o Prisma deve falhar a validação do schema antes de qualquer teste de service correr.

### Passo 4 - Criar a política de retenção

1. Objetivo funcional do passo no contexto da app.

Criar uma política isolada que calcula a data final de retenção, valida entidades protegidas e bloqueia remoções enquanto houver retenção ativa.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/compliance/retentionPolicy.js`
    - REVER: `apps/api/prisma/schema.prisma`
    - LOCALIZAÇÃO: ficheiro completo novo.

3. Instruções do que fazer.

Cria a pasta `apps/api/src/modules/compliance` se ainda não existir. Depois cria o ficheiro `retentionPolicy.js` com o conteúdo completo abaixo.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/compliance/retentionPolicy.js
const RETENTION_YEARS = 10;

export const RETAINED_ENTITIES = Object.freeze([
    "SaleDocument",
    "PurchaseDocument",
    "JournalEntry",
    "VatMapRun",
    "SaftExportRun",
    "AuditLog",
]);

const RETAINED_ENTITY_SET = new Set(RETAINED_ENTITIES);

export class RetentionHoldActiveError extends Error {
    /**
     * Erro de domínio usado quando uma entidade ainda está dentro do prazo legal.
     *
     * @param {{ entity: string, entityId: string, retainUntil: Date }} input - Dados da retenção ativa.
     */
    constructor(input) {
        super(`A entidade ${input.entity}:${input.entityId} está protegida por retenção legal até ${input.retainUntil.toISOString()}.`);
        this.name = "RetentionHoldActiveError";
        this.code = "RETENTION_HOLD_ACTIVE";
        this.statusCode = 409;
        this.entity = input.entity;
        this.entityId = input.entityId;
        this.retainUntil = input.retainUntil;
    }
}

/**
 * Valida se o valor recebido é uma data real.
 *
 * @param {Date} value - Valor a validar.
 * @param {string} fieldName - Nome do campo usado na mensagem de erro.
 * @returns {Date} Data validada.
 */
function assertValidDate(value, fieldName) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new TypeError(`${fieldName} tem de ser uma data válida.`);
    }

    return value;
}

/**
 * Valida identificadores recebidos do contexto backend ou da rota.
 *
 * @param {unknown} value - Valor recebido.
 * @param {string} fieldName - Nome do campo usado na mensagem de erro.
 * @returns {string} Texto validado.
 */
function assertRequiredString(value, fieldName) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new TypeError(`${fieldName} é obrigatório.`);
    }

    return value.trim();
}

/**
 * Calcula a data final de retenção contabilística.
 *
 * @param {Date} periodEndAt - Data contabilística de referência.
 * @returns {Date} Data em que a retenção termina.
 */
export function calculateRetainUntil(periodEndAt) {
    const validPeriodEndAt = assertValidDate(periodEndAt, "periodEndAt");
    const retainUntil = new Date(validPeriodEndAt);

    // Usar UTC evita que mudanças de fuso horário alterem o dia final da retenção.
    retainUntil.setUTCFullYear(retainUntil.getUTCFullYear() + RETENTION_YEARS);
    return retainUntil;
}

/**
 * Garante que a entidade pertence ao conjunto contabilístico protegido.
 *
 * @param {string} entity - Nome técnico da entidade.
 * @returns {string} Entidade validada.
 */
export function assertRetainedEntity(entity) {
    const normalizedEntity = assertRequiredString(entity, "entity");

    if (!RETAINED_ENTITY_SET.has(normalizedEntity)) {
        throw new RangeError(`A entidade ${normalizedEntity} não está abrangida pela retenção contabilística MF7.`);
    }

    return normalizedEntity;
}

/**
 * Determina se uma retenção ainda bloqueia a remoção no instante indicado.
 *
 * @param {{ retainUntil: Date, now: Date }} input - Datas da avaliação.
 * @returns {boolean} Verdadeiro se a remoção ainda estiver bloqueada.
 */
export function isRetentionActive(input) {
    const retainUntil = assertValidDate(input.retainUntil, "retainUntil");
    const now = assertValidDate(input.now, "now");

    return retainUntil.getTime() > now.getTime();
}

/**
 * Confirma se uma entidade contabilística pode ser removida.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, entity: string, entityId: string, now?: Date }} input - Contexto da entidade.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export async function assertRetainedRecordDeletionAllowed(prisma, input) {
    const companyId = assertRequiredString(input.companyId, "companyId");
    const entity = assertRetainedEntity(input.entity);
    const entityId = assertRequiredString(input.entityId, "entityId");
    const now = input.now ?? new Date();

    const hold = await prisma.retentionHold.findFirst({
        where: {
            companyId,
            entity,
            entityId,
        },
        select: {
            retainUntil: true,
        },
    });

    // Sem retenção persistida, a política não bloqueia a operação.
    if (!hold) {
        return {
            allowed: true,
            retainUntil: null,
        };
    }

    if (isRetentionActive({ retainUntil: hold.retainUntil, now })) {
        throw new RetentionHoldActiveError({
            entity,
            entityId,
            retainUntil: hold.retainUntil,
        });
    }

    return {
        allowed: true,
        retainUntil: hold.retainUntil,
    };
}
```

5. Explicação do código.

Este ficheiro concentra a regra de retenção. `calculateRetainUntil` soma 10 anos à data contabilística de referência; `assertRetainedEntity` impede que entidades fora do domínio contabilístico usem a política sem revisão; `isRetentionActive` compara `retainUntil` com o instante atual; `assertRetainedRecordDeletionAllowed` consulta `RetentionHold` por `companyId`, `entity` e `entityId`. O ficheiro prepara o gate do passo seguinte e evita duplicar a regra dentro de cada service destrutivo. Os dados de entrada são o cliente Prisma e o contexto backend; os dados de saída são uma autorização explícita ou um erro `RETENTION_HOLD_ACTIVE`. O aluno pode acrescentar novas entidades só quando um BK futuro as justificar e trouxer testes correspondentes.

6. Validação do passo.

Executa os testes unitários depois de criares o ficheiro de testes no passo 6. Antes disso, revê manualmente se não existem entidades fora do scope e se todas as queries usam `companyId`.

7. Cenário negativo/erro esperado.

Chamar `assertRetainedEntity("MarketingLead")` deve lançar erro. Chamar `calculateRetainUntil(new Date("data inválida"))` também deve lançar erro. Estes negativos impedem aceitar domínio errado ou datas inválidas de forma silenciosa.

### Passo 5 - Criar o gate usado pelos services destrutivos

1. Objetivo funcional do passo no contexto da app.

Criar uma camada de integração que chama a política de retenção e regista auditoria sensível quando a remoção passa a ser permitida.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/compliance/retentionDeletionGate.js`
    - REVER: `apps/api/src/modules/audit/auditLogService.js`
    - REVER: services destrutivos de vendas, compras, contabilidade, IVA, SAF-T e auditoria.
    - LOCALIZAÇÃO: ficheiro completo novo e pontos de chamada antes da remoção efetiva.

3. Instruções do que fazer.

Cria `retentionDeletionGate.js` com o conteúdo completo abaixo. Depois, em cada service destrutivo relevante, chama a função de domínio correspondente antes de remover o registo. O gate não substitui autenticação, autorização nem permissões; ele só verifica retenção e auditoria.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/compliance/retentionDeletionGate.js
import { recordSensitiveAudit } from "../audit/auditLogService.js";
import { assertRetainedRecordDeletionAllowed } from "./retentionPolicy.js";

export const RETENTION_AUDIT_ACTION = "retention.delete.allowed";

/**
 * Valida retenção legal e regista auditoria quando a remoção é autorizada.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{
 *   companyId: string,
 *   userId: string,
 *   entity: string,
 *   entityId: string,
 *   now?: Date
 * }} input - Contexto da operação destrutiva.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export async function assertAccountingDeletionGate(prisma, input) {
    const decision = await assertRetainedRecordDeletionAllowed(prisma, {
        companyId: input.companyId,
        entity: input.entity,
        entityId: input.entityId,
        now: input.now,
    });

    // A auditoria só é escrita depois de a política confirmar que a remoção pode avançar.
    await recordSensitiveAudit(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        action: RETENTION_AUDIT_ACTION,
        entity: input.entity,
        entityId: input.entityId,
        details: {
            retainUntil: decision.retainUntil?.toISOString() ?? null,
            retentionStatus: decision.retainUntil ? "expired" : "not_registered",
        },
    });

    return decision;
}

/**
 * Gate específico para documentos de venda.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, saleDocumentId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertSaleDocumentDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "SaleDocument",
        entityId: input.saleDocumentId,
        now: input.now,
    });
}

/**
 * Gate específico para documentos de compra.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, purchaseDocumentId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertPurchaseDocumentDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "PurchaseDocument",
        entityId: input.purchaseDocumentId,
        now: input.now,
    });
}

/**
 * Gate específico para lançamentos contabilísticos.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, journalEntryId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertJournalEntryDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "JournalEntry",
        entityId: input.journalEntryId,
        now: input.now,
    });
}

/**
 * Gate específico para mapas de IVA.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, vatMapRunId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertVatMapRunDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "VatMapRun",
        entityId: input.vatMapRunId,
        now: input.now,
    });
}

/**
 * Gate específico para exportações SAF-T.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, saftExportRunId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertSaftExportRunDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "SaftExportRun",
        entityId: input.saftExportRunId,
        now: input.now,
    });
}

/**
 * Gate específico para registos de auditoria contabilística.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, auditLogId: string, now?: Date }} input - Pedido interno.
 * @returns {Promise<{ allowed: true, retainUntil: Date | null }>} Resultado autorizado.
 */
export function assertAuditLogDeletionAllowed(prisma, input) {
    return assertAccountingDeletionGate(prisma, {
        companyId: input.companyId,
        userId: input.userId,
        entity: "AuditLog",
        entityId: input.auditLogId,
        now: input.now,
    });
}
```

Explicação do código.

Este ficheiro consome `recordSensitiveAudit` da MF6 e usa a shape correta do contrato: `entity`, `entityId` e `details`. Não usa `targetType`, `targetId` nem `metadata`, porque esses campos não pertencem ao modelo `AuditLog` já definido. O gate recebe `companyId` e `userId` do backend autenticado, chama a política e só escreve auditoria depois de a remoção ser autorizada. As funções específicas evitam strings manuais espalhadas nos services e reduzem o risco de escrever `"SaleDocuments"` num sítio e `"SaleDocument"` noutro.

Integração obrigatória nos services:

| Service destrutivo | Função a chamar antes da remoção |
| --- | --- |
| Service de documentos de venda | `assertSaleDocumentDeletionAllowed` |
| Service de documentos de compra | `assertPurchaseDocumentDeletionAllowed` |
| Service de lançamentos contabilísticos | `assertJournalEntryDeletionAllowed` |
| Service de mapas de IVA | `assertVatMapRunDeletionAllowed` |
| Service de exportações SAF-T | `assertSaftExportRunDeletionAllowed` |
| Service de auditoria contabilística | `assertAuditLogDeletionAllowed` |

Exemplo de integração num service de documentos de venda:

```js
// apps/api/src/modules/sales/saleDocumentService.js
import { assertSaleDocumentDeletionAllowed } from "../compliance/retentionDeletionGate.js";

/**
 * Remove um documento de venda depois de validar permissões e retenção legal.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma da API.
 * @param {{ companyId: string, userId: string, saleDocumentId: string }} input - Contexto da remoção.
 * @returns {Promise<void>} Não devolve corpo quando a remoção termina.
 */
export async function deleteSaleDocument(prisma, input) {
    await assertSaleDocumentDeletionAllowed(prisma, input);

    const result = await prisma.saleDocument.deleteMany({
        where: {
            id: input.saleDocumentId,
            // O filtro por empresa preserva multiempresa mesmo quando o id é conhecido.
            companyId: input.companyId,
        },
    });

    if (result.count !== 1) {
        throw new Error("Documento de venda não encontrado para a empresa ativa.");
    }
}
```

Explicação do código.

O service chama o gate antes da remoção efetiva. Se houver retenção ativa, o erro `RETENTION_HOLD_ACTIVE` interrompe o fluxo e nada é apagado. Se a retenção terminou, o gate regista auditoria e o service continua. A remoção usa `id` e `companyId` para manter ownership no backend. Este exemplo prepara os restantes services: cada domínio usa a sua função específica e não chama `assertAccountingDeletionGate` com strings escritas à mão.

5. Explicação do código.

Os blocos deste passo ligam a política de retenção à auditoria sensível e aos services reais. O contrato técnico que fica entregue é: todo service destrutivo contabilístico chama uma função de domínio antes de remover. A entrada é sempre contexto backend (`companyId`, `userId`, identificador da entidade); a saída é autorização ou erro controlado. O aluno pode adaptar o nome do service onde aplica o padrão, mas não deve remover a chamada ao gate nem trocar `entity`/`entityId` por campos inventados.

6. Validação do passo.

Pesquisa no ficheiro novo por `recordSensitiveAudit` e confirma que a chamada contém `entity`, `entityId` e `details`. Confirma também que não existem `targetType`, `targetId` ou `metadata` no gate.

7. Cenário negativo/erro esperado.

Se o gate for chamado com uma entidade não abrangida, deve falhar antes da auditoria. Se a retenção ainda estiver ativa, deve lançar `RETENTION_HOLD_ACTIVE` e não deve escrever audit log de autorização.

### Passo 6 - Criar testes unitários da política e do gate

1. Objetivo funcional do passo no contexto da app.

Provar, com testes unitários, que cálculo, validação de entidade, bloqueio, autorização e auditoria usam o contrato correto.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/unit/retentionPolicy.test.js`
    - REVER: `apps/api/src/modules/compliance/retentionPolicy.js`
    - REVER: `apps/api/src/modules/compliance/retentionDeletionGate.js`
    - LOCALIZAÇÃO: ficheiro completo novo.

3. Instruções do que fazer.

Cria o ficheiro de testes abaixo. O double de Prisma deve registar chamadas a `retentionHold.findFirst` e `auditLog.create`, para confirmar que a auditoria só acontece quando a remoção é autorizada.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/unit/retentionPolicy.test.js
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    RetentionHoldActiveError,
    assertRetainedEntity,
    assertRetainedRecordDeletionAllowed,
    calculateRetainUntil,
    isRetentionActive,
} from "../../src/modules/compliance/retentionPolicy.js";
import {
    RETENTION_AUDIT_ACTION,
    assertSaleDocumentDeletionAllowed,
} from "../../src/modules/compliance/retentionDeletionGate.js";

/**
 * Cria um double mínimo de Prisma para testar a política sem base de dados real.
 *
 * @param {{ retainUntil: Date } | null} hold - Retenção devolvida pela query.
 * @returns {object} Cliente Prisma mínimo com registo de chamadas.
 */
function createPrismaDouble(hold) {
    const calls = {
        retentionQueries: [],
        auditWrites: [],
        saleDocumentDeletes: [],
    };

    return {
        calls,
        retentionHold: {
            async findFirst(query) {
                calls.retentionQueries.push(query);
                return hold;
            },
        },
        auditLog: {
            async create(query) {
                calls.auditWrites.push(query);
                return { id: "audit_1", ...query.data };
            },
        },
        saleDocument: {
            async deleteMany(query) {
                calls.saleDocumentDeletes.push(query);
                return { count: 1 };
            },
        },
    };
}

describe("retentionPolicy", () => {
    it("calcula a retenção legal de 10 anos a partir do fim do período", () => {
        const retainUntil = calculateRetainUntil(new Date("2026-12-31T00:00:00.000Z"));

        assert.equal(retainUntil.toISOString(), "2036-12-31T00:00:00.000Z");
    });

    it("rejeita datas inválidas no cálculo de retenção", () => {
        assert.throws(
            () => calculateRetainUntil(new Date("data inválida")),
            /periodEndAt tem de ser uma data válida/,
        );
    });

    it("valida apenas entidades contabilísticas protegidas", () => {
        assert.equal(assertRetainedEntity("SaleDocument"), "SaleDocument");

        assert.throws(
            () => assertRetainedEntity("MarketingLead"),
            /não está abrangida pela retenção contabilística/,
        );
    });

    it("indica retenção ativa enquanto retainUntil for posterior ao instante atual", () => {
        const active = isRetentionActive({
            retainUntil: new Date("2036-12-31T00:00:00.000Z"),
            now: new Date("2030-01-01T00:00:00.000Z"),
        });

        assert.equal(active, true);
    });

    it("bloqueia a remoção quando existe retenção ativa", async () => {
        const prisma = createPrismaDouble({
            retainUntil: new Date("2036-12-31T00:00:00.000Z"),
        });

        await assert.rejects(
            () => assertRetainedRecordDeletionAllowed(prisma, {
                companyId: "company_1",
                entity: "SaleDocument",
                entityId: "sale_1",
                now: new Date("2030-01-01T00:00:00.000Z"),
            }),
            (error) => {
                assert.equal(error instanceof RetentionHoldActiveError, true);
                assert.equal(error.code, "RETENTION_HOLD_ACTIVE");
                assert.equal(error.statusCode, 409);
                return true;
            },
        );
    });

    it("autoriza a remoção quando não existe retenção persistida", async () => {
        const prisma = createPrismaDouble(null);

        const result = await assertRetainedRecordDeletionAllowed(prisma, {
            companyId: "company_1",
            entity: "SaleDocument",
            entityId: "sale_1",
            now: new Date("2030-01-01T00:00:00.000Z"),
        });

        assert.deepEqual(result, {
            allowed: true,
            retainUntil: null,
        });
    });

    it("autoriza a remoção depois de terminar a retenção", async () => {
        const prisma = createPrismaDouble({
            retainUntil: new Date("2030-01-01T00:00:00.000Z"),
        });

        const result = await assertRetainedRecordDeletionAllowed(prisma, {
            companyId: "company_1",
            entity: "SaleDocument",
            entityId: "sale_1",
            now: new Date("2031-01-01T00:00:00.000Z"),
        });

        assert.equal(result.allowed, true);
        assert.equal(result.retainUntil.toISOString(), "2030-01-01T00:00:00.000Z");
    });
});

describe("retentionDeletionGate", () => {
    it("regista auditoria sensível quando a remoção é autorizada", async () => {
        const prisma = createPrismaDouble({
            retainUntil: new Date("2030-01-01T00:00:00.000Z"),
        });

        await assertSaleDocumentDeletionAllowed(prisma, {
            companyId: "company_1",
            userId: "user_1",
            saleDocumentId: "sale_1",
            now: new Date("2031-01-01T00:00:00.000Z"),
        });

        assert.equal(prisma.calls.auditWrites.length, 1);
        assert.equal(prisma.calls.auditWrites[0].data.action, RETENTION_AUDIT_ACTION);
        assert.equal(prisma.calls.auditWrites[0].data.entity, "SaleDocument");
        assert.equal(prisma.calls.auditWrites[0].data.entityId, "sale_1");
        // Os detalhes guardam apenas metadados mínimos e não payloads completos.
        assert.deepEqual(prisma.calls.auditWrites[0].data.details, {
            retainUntil: "2030-01-01T00:00:00.000Z",
            retentionStatus: "expired",
        });
    });

    it("não regista auditoria quando a retenção ainda bloqueia a remoção", async () => {
        const prisma = createPrismaDouble({
            retainUntil: new Date("2036-12-31T00:00:00.000Z"),
        });

        await assert.rejects(
            () => assertSaleDocumentDeletionAllowed(prisma, {
                companyId: "company_1",
                userId: "user_1",
                saleDocumentId: "sale_1",
                now: new Date("2030-01-01T00:00:00.000Z"),
            }),
            /retenção legal/,
        );

        assert.equal(prisma.calls.auditWrites.length, 0);
    });
});
```

5. Explicação do código.

Os testes cobrem três negativos: data inválida, entidade fora do domínio e remoção bloqueada por retenção ativa. Também cobrem dois positivos: ausência de retenção persistida e retenção terminada com auditoria sensível. O double de Prisma permite testar o comportamento sem depender de base de dados local. A parte mais importante é a asserção sobre `data.entity`, `data.entityId` e `data.details`, porque confirma que o gate respeita o contrato real de `recordSensitiveAudit` e não inventa campos.

6. Validação do passo.

Executa `cd apps/api && npm run test:mf7:retention` depois de acrescentares o script no passo 7. O resultado esperado é a suite unitária a passar sem falhas.

7. Cenário negativo/erro esperado.

Se o gate voltar a usar `targetType`, `targetId` ou `metadata`, este teste deve falhar porque procura `entity`, `entityId` e `details`.

### Passo 7 - Acrescentar o script de validação MF7

1. Objetivo funcional do passo no contexto da app.

Criar um comando curto para validar esta entrega sem obrigar o aluno a decorar o caminho do ficheiro de testes.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `scripts`.

3. Instruções do que fazer.

Acrescenta esta entrada dentro de `scripts`. Confirma a vírgula conforme a posição real dentro do objeto.

4. Código completo, correto e integrado com a app final.

```json
"test:mf7:retention": "node --test tests/unit/retentionPolicy.test.js"
```

5. Explicação do código.

O script executa apenas os testes unitários deste BK. Isto permite recolher evidence rápida para a defesa e evita misturar falhas de integração de outros módulos com a política de retenção. O aluno pode mudar a posição da linha dentro de `scripts`, mas não deve alterar o caminho do teste sem mover o ficheiro correspondente.

6. Validação do passo.

Executa `cd apps/api && npm run test:mf7:retention`. O resultado esperado é a execução dos testes de `retentionPolicy.test.js`.

7. Cenário negativo/erro esperado.

Se o script apontar para um ficheiro inexistente, o Node deve falhar com erro de módulo ou caminho não encontrado.

### Passo 8 - Executar validação final

1. Objetivo funcional do passo no contexto da app.

Confirmar que o schema, a sintaxe, os testes unitários, contratos e integração continuam coerentes depois da alteração.

2. Ficheiros envolvidos:
    - REVER: `apps/api/prisma/schema.prisma`
    - REVER: `apps/api/package.json`
    - REVER: `apps/api/tests/unit/retentionPolicy.test.js`
    - REVER: `docs/planificacao/guias-bk/MF7/BK-MF7-02-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md`
    - LOCALIZAÇÃO: terminal na raiz do repositório.

3. Instruções do que fazer.

Executa os comandos pela ordem indicada. Se algum comando depender de base de dados local ou serviços externos, regista o bloqueio operacional com a mensagem exata e junta a evidence dos comandos que correram.

4. Código completo, correto e integrado com a app final.

```bash
cd apps/api && npm run prisma:validate
cd apps/api && npm run syntax:check
cd apps/api && npm run test:mf7:retention
cd apps/api && npm run test:contracts
cd apps/api && npm run test:integration
bash scripts/validate-planificacao.sh
```

5. Explicação do código.

Os três primeiros comandos validam diretamente o schema, a sintaxe e a suite deste BK. `test:contracts` confirma que contratos partilhados continuam coerentes. `test:integration` dá confiança sobre fluxos com dependências reais, quando o ambiente estiver disponível. `validate-planificacao.sh` valida a documentação de planificação. Estes comandos não alteram dados de produção; servem para produzir evidence técnica.

6. Validação do passo.

Regista o exit code e o resumo de cada comando. O resultado ideal é tudo a passar. Se a integração não correr por falta de infraestrutura, documenta o bloqueio e não declares validação total.

7. Cenário negativo/erro esperado.

Se `npm run prisma:validate` falhar, revê primeiro a relação entre `Company` e `RetentionHold`. Se `test:mf7:retention` falhar, confirma se o gate usa `entity`, `entityId` e `details`.

#### Critérios de aceite

- `RetentionHold` existe no Prisma com restrição única por `companyId`, `entity` e `entityId`.
- `Company` tem a relação inversa `retentionHolds RetentionHold[]`.
- A ação `"retention.delete.allowed"` existe no contrato de auditoria sensível.
- `recordSensitiveAudit` é chamado com `entity`, `entityId` e `details`.
- `calculateRetainUntil` soma 10 anos à data contabilística de referência.
- Entidades fora do domínio contabilístico são rejeitadas.
- Retenção ativa bloqueia remoção com erro `409` e código `RETENTION_HOLD_ACTIVE`.
- Retenção terminada permite a operação e cria auditoria sensível.
- Services destrutivos usam funções de domínio, não strings manuais espalhadas.
- Nenhum endpoint novo é criado sem necessidade.
- Todos os comandos de validação indicados ficam registados no PR ou na defesa técnica.

#### Validação final

Validação obrigatória:

```bash
cd apps/api && npm run prisma:validate
cd apps/api && npm run syntax:check
cd apps/api && npm run test:mf7:retention
cd apps/api && npm run test:contracts
cd apps/api && npm run test:integration
bash scripts/validate-planificacao.sh
```

Explicação do código.

Este bloco repete os comandos que devem ficar como evidence final do BK. A ordem começa pelo schema e pela sintaxe, segue para a suite específica, depois contratos e integração, e termina com validação documental. Se algum comando falhar por ambiente indisponível, regista a limitação com o output observado.

Validação manual:

- tentar remover um documento de venda com `RetentionHold.retainUntil` no futuro e confirmar erro `409`;
- tentar remover o mesmo tipo de entidade com `retainUntil` no passado e confirmar que o service continua;
- confirmar que a tabela de auditoria recebe uma linha com `action = "retention.delete.allowed"`, `entity = "SaleDocument"` e `entityId` igual ao documento;
- confirmar que a resposta de erro não expõe detalhes internos da base de dados;
- confirmar que a regra é chamada antes da remoção efetiva.

#### Evidence para PR/defesa

Incluir no PR ou na defesa técnica:

- diff do modelo `RetentionHold` e da relação `Company.retentionHolds`;
- diff do contrato de auditoria sensível com `"retention.delete.allowed"`;
- diff dos ficheiros `retentionPolicy.js` e `retentionDeletionGate.js`;
- resultado de `npm run prisma:validate`;
- resultado de `npm run syntax:check`;
- resultado de `npm run test:mf7:retention`;
- resultado de `npm run test:contracts`;
- resultado de `npm run test:integration`, ou justificação objetiva se depender de infraestrutura indisponível;
- prova manual de bloqueio `409` para retenção ativa;
- prova manual de auditoria quando a retenção terminou.

#### Handoff

Depois de concluir este BK, a equipa deve rever todos os services destrutivos ligados a entidades contabilísticas e confirmar que cada um chama a função de domínio correspondente antes de executar a remoção. Se existir uma entidade contabilística nova em MF7 ou MF8, ela só deve entrar no fluxo depois de ser acrescentada a `RETAINED_ENTITIES`, ao modelo de retenção e aos testes.

O próximo BK pode reutilizar esta infraestrutura para relatórios de conformidade, mas não deve alargar a regra para automações fiscais avançadas sem novo requisito explícito.

- Próximo BK recomendado: `BK-MF7-03`

#### Changelog

- 2026-06-26: Guia corrigido em modo `corrigir_apenas` para fechar os findings da auditoria MF7.
- 2026-06-26: Gate de retenção alinhado com o contrato MF6 de `recordSensitiveAudit` usando `entity`, `entityId` e `details`.
- 2026-06-26: Schema Prisma completado com relação inversa `Company.retentionHolds`.
- 2026-06-26: Todos os passos técnicos reescritos com os pontos 1 a 7, explicação de código, validação e cenário negativo.
