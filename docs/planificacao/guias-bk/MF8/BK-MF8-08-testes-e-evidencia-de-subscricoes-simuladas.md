# BK-MF8-08 - Testes e evidência de subscrições simuladas.

## Header

- `doc_id`: `GUIA-BK-MF8-08`
- `bk_id`: `BK-MF8-08`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-03, BK-MF8-04, BK-MF8-05, BK-MF8-06, BK-MF8-07`
- `rf_rnf`: `RF49, RF50, RF51`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-09`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-08-testes-e-evidencia-de-subscricoes-simuladas.md`
- `last_updated`: `2026-07-03`

#### Objetivo

Neste BK vais fechar a funcionalidade de subscrições simuladas com testes de contrato, smoke frontend e evidence organizada para PR ou defesa.

#### Importância

Sem evidence, a funcionalidade fica difícil de defender. Este BK junta RF49, RF50 e RF51 num pacote verificável: planos, subscrição por empresa ativa, ativação, transições e UI.

#### Scope-in

- Criar matriz de testes das subscrições simuladas.
- Cobrir positivos e negativos por RF.
- Guardar evidence em `docs/evidence/MF8/BK-MF8-08.md`.
- Criar comando `test:mf8:subscriptions`.
- Confirmar que não há cobrança real.

#### Scope-out

- Criar testes E2E complexos com navegador real.
- Testar gateway externo.
- Reabrir implementação de BK-MF8-03 a BK-MF8-07 sem finding concreto.

#### Estado antes e depois

- Antes: MF0..MF7 já entregaram autenticação com cookies HttpOnly, empresa ativa no backend, permissões, dados mestre, vendas, compras, inventário, tesouraria, contabilidade, IA explicável, auditoria, hardening e gates de qualidade.
- Depois: `BK-MF8-08` deixa um contrato verificável para testes de subscrições, com evidence e negativos suficientes para continuar a MF8 sem adivinhação técnica.

#### Pre-requisitos

- Ler `RF49, RF50, RF51` em `docs/RF.md` ou `docs/RNF.md`.
- Rever a linha de `BK-MF8-08` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-08` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever os BKs declarados em dependências: `BK-MF8-03, BK-MF8-04, BK-MF8-05, BK-MF8-06, BK-MF8-07`.
- Confirmar que todos os caminhos do aluno usam `apps/api` ou `apps/web`.
- Negativos: mínimo `3`.

#### Glossário

- Teste de contrato: verifica payload e regras públicas da API.
- Smoke: teste curto que confirma o fluxo principal.
- Evidence: prova técnica com comando, resultado e negativos.
- Matriz de testes: tabela que liga RF a casos positivos e negativos.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF49, RF50, RF51` é o requisito associado a `BK-MF8-08`.
- `CANONICO`: `BK-MF8-08` pertence à MF8, sprint `S12`, owner `Oleksii`, apoio `Andre`, prioridade `P1` e próximo BK `BK-MF8-09`.
- `CANONICO`: a app dos alunos usa Node.js, Express, ES Modules, Prisma, React, Vite e TypeScript nos caminhos públicos `apps/api` e `apps/web`.
- `DERIVADO`: este guia transforma o requisito em ficheiros e testes pequenos, porque a MF8 é fase de hardening, qualidade final e fecho da PAP.

O domínio de testes de subscrições deve respeitar a regra transversal do OPSA: a empresa ativa vem do contexto autenticado no backend; permissões e roles são aplicadas no backend; a UI mostra estado e recolhe intenção, mas não decide ownership nem autorização final.

Quando este BK tocar IA, a IA explica, recomenda e mostra fonte; não altera dados contabilísticos, não aprova documentos e não executa ações automaticamente. Quando tocar contabilidade ou documentos financeiros, o guia distingue documento operacional, pagamento/recebimento e lançamento contabilístico.

#### Arquitetura do BK

- Requisito: `RF49, RF50, RF51`.
- Domínio principal: testes de subscrições.
- Backend público dos alunos: `apps/api`.
- Frontend público dos alunos: `apps/web`.
- Prisma público dos alunos: `apps/api/prisma/schema.prisma`.
- Evidence: `docs/evidence/MF8/BK-MF8-08.md`.
- Handoff: `BK-MF8-09`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/tests/contracts/mf8-subscriptions.contract.test.js`
- CRIAR: `docs/evidence/MF8/BK-MF8-08.md`
- EDITAR: `apps/api/package.json`
- REVER: `apps/web/package.json`
- REVER: `apps/web/scripts/check-mf8-subscriptions-ui.mjs`
- REVER: `apps/api/src/modules/subscriptions`
- REVER: `apps/web/src/pages/SubscriptionsPage.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar contrato canónico.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

Confirma que `BK-MF8-08` continua associado a `RF49, RF50, RF51`, prioridade `P1`, owner `Oleksii`, dependências `BK-MF8-03, BK-MF8-04, BK-MF8-05, BK-MF8-06, BK-MF8-07` e próximo BK `BK-MF8-09`. Não alteres o header se a matriz e o backlog não mudaram.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e impede que a implementação avance com requisito, owner ou dependência trocados.

5. Explicação do código.

O contrato canónico vem de RF/RNF, matriz e backlog. A leitura inicial protege o aluno de resolver outro problema com o nome de `BK-MF8-08`.

6. Validação do passo.

O aluno consegue apontar a linha de `RF49, RF50, RF51` e a linha de `BK-MF8-08` antes de editar qualquer ficheiro.

7. Cenário negativo/erro esperado.

Se o header do guia divergir da matriz ou do backlog, a implementação deve parar até o drift ser resolvido.

### Passo 2 - Mapear integração com a app existente

1. Objetivo funcional do passo no contexto da app.

Mapear integração com a app existente.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - REVER: `apps/api/src/modules/subscriptions/subscriptionRoutes.js`
    - REVER: `apps/api/src/modules/subscriptions/subscriptionService.js`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/lib/subscriptionsApi.ts`
    - REVER: `apps/web/src/pages/SubscriptionsPage.tsx`
    - REVER: `apps/web/scripts/check-mf8-subscriptions-ui.mjs`

3. Instruções do que fazer.

Identifica os contratos já entregues pelas MFs anteriores que este BK deve respeitar: sessão por cookie HttpOnly, empresa ativa no backend, permissões, auditoria, módulos financeiros e cliente API central.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de inventário técnico e evita criar endpoints duplicados ou nomes que não encaixam com a app.

5. Explicação do código.

Não há código porque a decisão principal é reutilizar fronteiras existentes. A MF8 fecha a app; não deve reabrir arquitetura sem necessidade.

6. Validação do passo.

A lista de ficheiros a criar, editar e rever fica coerente com os caminhos públicos `apps/api` e `apps/web`.

7. Cenário negativo/erro esperado.

Se o plano tentar usar caminho privado ou aceitar empresa ativa a partir do browser, corrige a arquitetura antes de avançar.

### Passo 3 - Implementar o contrato principal

1. Objetivo funcional do passo no contexto da app.

Implementar o contrato principal.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `apps/api/tests/contracts/mf8-subscriptions.contract.test.js`
    - REVER: `apps/api/src/modules/subscriptions/subscriptionPlans.js`
    - REVER: `apps/api/src/modules/subscriptions/subscriptionService.js`

3. Instruções do que fazer.

Cria ou edita o contrato principal de testes de subscrições. O teste deve consumir os exports já entregues pelos BKs anteriores: `listSimulatedSubscriptionPlans`, `activateSimulatedSubscription`, `runSimulatedSubscriptionAction` e `assertSubscriptionLifecycleTransition`. Mantém JSDoc, comentários didáticos junto das decisões importantes e validação no backend sempre que houver input ou persistência.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/contracts/mf8-subscriptions.contract.test.js

import assert from "node:assert/strict";
import test from "node:test";
import { listSimulatedSubscriptionPlans } from "../../src/modules/subscriptions/subscriptionPlans.js";
import {
  activateSimulatedSubscription,
  assertSubscriptionLifecycleTransition,
  runSimulatedSubscriptionAction,
} from "../../src/modules/subscriptions/subscriptionService.js";

const COMPANY_ID = "company-mf8-001";
const USER_ID = "user-mf8-001";
const NOW = new Date("2026-07-01T09:00:00.000Z");

/**
 * Cria uma subscrição persistida em memória para os testes de contrato.
 *
 * @param {object} overrides - Campos a substituir na subscrição base.
 * @returns {object} Subscrição coerente com o modelo CompanySubscription.
 */
function createSubscription(overrides = {}) {
  return {
    id: "subscription-mf8-001",
    companyId: COMPANY_ID,
    planCode: "monthly",
    status: "ACTIVE",
    startsAt: new Date("2026-07-01T09:00:00.000Z"),
    endsAt: new Date("2026-08-01T09:00:00.000Z"),
    simulated: true,
    ...overrides,
  };
}

/**
 * Devolve uma cópia da subscrição para impedir mutação acidental entre asserts.
 *
 * @param {object | null} subscription - Subscrição guardada no double Prisma.
 * @returns {object | null} Cópia segura para o teste.
 */
function copySubscription(subscription) {
  if (!subscription) return null;

  return {
    ...subscription,
    startsAt: new Date(subscription.startsAt),
    endsAt: new Date(subscription.endsAt),
  };
}

/**
 * Cria um Prisma em memória com as operações usadas pelos services da MF8.
 *
 * @param {object | null} initialSubscription - Estado inicial da subscrição.
 * @returns {{ prisma: object, calls: object, readSubscription: () => object | null }} Double Prisma e chamadas capturadas.
 */
function createPrismaDouble(initialSubscription = null) {
  let subscription = copySubscription(initialSubscription);
  const calls = {
    upsert: [],
    findUnique: [],
    update: [],
    audit: [],
  };

  const prisma = {
    companySubscription: {
      async upsert(args) {
        calls.upsert.push(args);

        const data = subscription
          ? { ...subscription, ...args.update }
          : { id: "subscription-mf8-001", ...args.create };

        subscription = copySubscription(data);
        return copySubscription(subscription);
      },
      async findUnique(args) {
        calls.findUnique.push(args);
        return copySubscription(subscription);
      },
      async update(args) {
        calls.update.push(args);
        subscription = copySubscription({
          ...subscription,
          ...args.data,
        });
        return copySubscription(subscription);
      },
    },
    auditLog: {
      async create(args) {
        calls.audit.push(args);
        return { id: `audit-${calls.audit.length}`, ...args.data };
      },
    },
    async $transaction(work) {
      // O teste usa transação em memória para validar a fronteira do service sem abrir base de dados.
      return work(this);
    },
  };

  return {
    prisma,
    calls,
    readSubscription() {
      return copySubscription(subscription);
    },
  };
}

/**
 * Verifica erros de domínio pelo código público.
 *
 * @param {string} code - Código esperado no erro.
 * @returns {(error: Error & { code?: string }) => boolean} Predicado para assert.throws/assert.rejects.
 */
function hasDomainCode(code) {
  return function assertDomainCode(error) {
    assert.equal(error.code, code);
    return true;
  };
}

test("RF49 lista os três planos simulados sem contrato de pagamento real", () => {
  const plans = listSimulatedSubscriptionPlans();

  assert.deepEqual(
    plans.map((plan) => plan.code),
    ["monthly", "quarterly", "yearly"],
  );

  for (const plan of plans) {
    assert.equal(plan.currency, "EUR");
    assert.equal(plan.simulated, true);
    assert.equal(Object.prototype.hasOwnProperty.call(plan, "paymentProvider"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(plan, "checkoutUrl"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(plan, "paymentIntentId"), false);
  }
});

test("RF50 ativa subscrição para a empresa ativa e regista auditoria mínima", async () => {
  const { prisma, calls, readSubscription } = createPrismaDouble();

  const result = await activateSimulatedSubscription(prisma, {
    companyId: COMPANY_ID,
    userId: USER_ID,
    planCode: "monthly",
    now: NOW,
  });

  assert.equal(result.active, true);
  assert.equal(result.state, "active");
  assert.equal(result.subscription.planCode, "monthly");
  assert.equal(result.subscription.simulated, true);

  assert.deepEqual(calls.upsert[0].where, { companyId: COMPANY_ID });
  assert.equal(calls.audit[0].data.companyId, COMPANY_ID);
  assert.equal(calls.audit[0].data.userId, USER_ID);
  assert.equal(calls.audit[0].data.action, "subscription.activate");
  assert.deepEqual(calls.audit[0].data.details, {
    planCode: "monthly",
    simulated: true,
  });

  const stored = readSubscription();
  assert.equal(stored.status, "ACTIVE");
  assert.equal(stored.simulated, true);
});

test("RF51 renova, cancela e reativa a subscrição sem gateway externo", async () => {
  const { prisma, calls, readSubscription } = createPrismaDouble(createSubscription());

  const renewed = await runSimulatedSubscriptionAction(prisma, {
    companyId: COMPANY_ID,
    userId: USER_ID,
    action: "renew",
    now: NOW,
  });

  assert.equal(renewed.active, true);
  assert.equal(renewed.subscription.status, "ACTIVE");
  assert.ok(new Date(renewed.subscription.endsAt) > new Date("2026-08-01T09:00:00.000Z"));

  const cancelled = await runSimulatedSubscriptionAction(prisma, {
    companyId: COMPANY_ID,
    userId: USER_ID,
    action: "cancel",
    now: NOW,
  });

  assert.equal(cancelled.active, false);
  assert.equal(cancelled.state, "cancelled");
  assert.equal(cancelled.subscription.status, "CANCELLED");

  const reactivated = await runSimulatedSubscriptionAction(prisma, {
    companyId: COMPANY_ID,
    userId: USER_ID,
    action: "reactivate",
    planCode: "yearly",
    now: new Date("2026-09-01T09:00:00.000Z"),
  });

  assert.equal(reactivated.active, true);
  assert.equal(reactivated.subscription.planCode, "yearly");
  assert.equal(reactivated.subscription.status, "ACTIVE");

  assert.deepEqual(
    calls.findUnique.map((call) => call.where),
    [{ companyId: COMPANY_ID }, { companyId: COMPANY_ID }, { companyId: COMPANY_ID }],
  );
  assert.deepEqual(
    calls.audit.map((call) => call.data.action),
    ["subscription.renew", "subscription.cancel", "subscription.reactivate"],
  );
  assert.ok(calls.audit.every((call) => call.data.details.simulated === true));
  assert.equal(Object.prototype.hasOwnProperty.call(readSubscription(), "paymentIntentId"), false);
});

test("RF51 rejeita transições inválidas e contexto incompleto", async () => {
  assert.throws(
    () => assertSubscriptionLifecycleTransition(createSubscription({ status: "CANCELLED" }), "cancel"),
    hasDomainCode("INVALID_SUBSCRIPTION_TRANSITION"),
  );

  const { prisma } = createPrismaDouble(createSubscription({ status: "CANCELLED" }));

  await assert.rejects(
    () =>
      runSimulatedSubscriptionAction(prisma, {
        companyId: COMPANY_ID,
        userId: USER_ID,
        action: "reactivate",
        now: NOW,
      }),
    hasDomainCode("SUBSCRIPTION_PLAN_REQUIRED"),
  );

  await assert.rejects(
    () =>
      activateSimulatedSubscription(prisma, {
        companyId: "",
        userId: USER_ID,
        planCode: "monthly",
        now: NOW,
      }),
    hasDomainCode("ACTIVE_COMPANY_REQUIRED"),
  );
});
```

5. Explicação do código.

Este código entrega o núcleo de `BK-MF8-08`: transforma `RF49`, `RF50` e `RF51` em contrato executável, com nomes alinhados com os BKs anteriores.

O primeiro teste prova que o catálogo só expõe planos simulados em `EUR` e não transporta campos de gateway externo. O segundo teste prova a ativação por empresa ativa, com auditoria mínima e sem dados de pagamento. O terceiro teste atravessa renovação, cancelamento e reativação usando `runSimulatedSubscriptionAction`, que é o export entregue em `BK-MF8-06`. O último teste concentra negativos obrigatórios: cancelamento repetido, reativação sem plano e ativação sem empresa ativa.

O double Prisma existe apenas dentro do teste. Ele captura queries, updates e auditoria para que o contrato valide comportamento sem exigir uma base de dados real.

6. Validação do passo.

Executa `cd apps/api && npm run test:mf8:subscriptions`. O resultado esperado é o ficheiro de contrato verde, sem imports inexistentes e com negativos a falhar pelos códigos de domínio esperados.

7. Cenário negativo/erro esperado.

Erro esperado: se o teste importar uma função que não existe em `subscriptionService.js`, o comando deve falhar antes de qualquer assert. Corrige o import para o export real do BK anterior em vez de criar outro nome só para passar o teste.

### Passo 4 - Criar teste ou gate mínimo

1. Objetivo funcional do passo no contexto da app.

Criar teste ou gate mínimo.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-08.md`
    - EDITAR: `apps/api/package.json`
    - REVER: `apps/web/package.json`
    - REVER: `apps/web/scripts/check-mf8-subscriptions-ui.mjs`

3. Instruções do que fazer.

Adiciona o script backend específico ao `apps/api/package.json` e confirma que o gate frontend entregue pelo `BK-MF8-07` continua disponível. A evidence deste BK deve juntar backend, frontend e validação manual mínima, sem inventar outputs.

4. Código completo, correto e integrado com a app final.

Adicionar ao `apps/api/package.json`:

```json
{
  "scripts": {
    "test:mf8:subscriptions": "node --test tests/contracts/mf8-subscriptions.contract.test.js"
  }
}
```

Criar ou editar `docs/evidence/MF8/BK-MF8-08.md`:

```md
# Evidence MF8 / BK-MF8-08

- Projeto: OPSA
- BK: BK-MF8-08
- Tema: testes e evidência de subscrições simuladas
- RF/RNF: RF49, RF50, RF51
- Data: YYYY-MM-DD
- Responsável: Oleksii
- Apoio: Andre

## Ficheiros alterados

- apps/api/tests/contracts/mf8-subscriptions.contract.test.js
- apps/api/package.json
- docs/evidence/MF8/BK-MF8-08.md

## Matriz de prova

| RF | Prova automática | Critério de sucesso | Evidência a anexar |
| --- | --- | --- | --- |
| RF49 | catálogo `monthly`, `quarterly`, `yearly`, `EUR`, `simulated: true` e sem campos de pagamento real | O teste confirma os três planos simulados e não encontra `paymentProvider`, `checkoutUrl` ou `paymentIntentId`. | Anexar output real do teste de contrato e manter o BK aberto se faltar algum plano ou aparecer promessa de pagamento real. |
| RF50 | ativação com `companyId` resolvido no backend e auditoria `subscription.activate` | O teste confirma que a empresa ativa vem do contexto backend e que a ativação gera auditoria. | Anexar output real do teste de contrato e registar a correção se a API aceitar empresa vinda do body/query. |
| RF51 | renovar, cancelar e reativar com auditoria e transições válidas | O teste confirma transições válidas, negativos de transição inválida e auditoria por ação sensível. | Anexar output real do teste de contrato e manter o BK aberto se alguma transição indevida passar. |

## Comandos executados

| Comando | Critério de sucesso | Evidência a anexar |
| --- | --- | --- |
| `cd apps/api && npm run test:mf8:subscriptions` | Exit code `0`; RF49, RF50 e RF51 cobertos por positivos e negativos. | Anexar output real do terminal e não fechar o BK se algum caso falhar. |
| `cd apps/api && npm run test:contracts` | Exit code `0`; contratos existentes continuam compatíveis com os BKs anteriores. | Anexar output real do terminal e registar regressão se um contrato anterior quebrar. |
| `cd apps/web && npm run typecheck` | Exit code `0`; sem erros de TypeScript no cliente e na página de subscrições. | Anexar output real do terminal e corrigir tipos antes de avançar. |
| `cd apps/web && npm run test:mf8:subscriptions-ui` | Exit code `0`; o gate frontend confirma UI simulada e sem decisão de empresa no browser. | Anexar output real do terminal e corrigir o gate se a UI prometer pagamento real. |

## Negativos validados

- [ ] Cancelar uma subscrição já cancelada devolve `INVALID_SUBSCRIPTION_TRANSITION`.
- [ ] Reativar sem plano devolve `SUBSCRIPTION_PLAN_REQUIRED`.
- [ ] Ativar sem empresa ativa devolve `ACTIVE_COMPANY_REQUIRED`.
- [ ] A evidence confirma ausência de `paymentProvider`, `checkoutUrl` e `paymentIntentId`.

## Verificação manual

- [ ] A página `Subscrições` mostra aviso de ações simuladas.
- [ ] A UI não pede identificador de empresa ao utilizador.
- [ ] A UI não promete cobrança real, checkout, recibo automático ou gateway externo.
- [ ] O PR inclui output real dos comandos acima.

## Handoff para BK-MF8-09

- Contrato backend validado quando `test:mf8:subscriptions` e `test:contracts` terminam com exit code `0` e a evidence inclui output real.
- Gate frontend validado quando `typecheck` e `test:mf8:subscriptions-ui` terminam com exit code `0` e a UI continua a avisar que as ações são simuladas.
- Riscos residuais: manter o BK aberto se faltar output real, se algum comando falhar, se a UI sugerir pagamento real ou se a API aceitar empresa ativa vinda do frontend.
```

5. Explicação do código.

O script específico torna o BK simples de validar em PR e defesa. A evidence junta a prova backend, o gate frontend recebido do `BK-MF8-07`, negativos e verificação manual, sem misturar resultados esperados com resultados executados.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run test:mf8:subscriptions
npm run test:contracts
```

Depois executa:

```bash
cd apps/web
npm run typecheck
npm run test:mf8:subscriptions-ui
```

Negativos: mínimo `3`.

7. Cenário negativo/erro esperado.

Erro esperado: se a evidence não incluir output real dos comandos executados no PR final, o BK não pode fechar. O aluno deve anexar resultados observáveis e corrigir qualquer falha antes da defesa.

### Passo 5 - Validar segurança, domínio e mensagens

1. Objetivo funcional do passo no contexto da app.

Validar segurança, domínio e mensagens.

2. Ficheiros envolvidos:
    - REVER: `apps/api/tests/contracts/mf8-subscriptions.contract.test.js`
    - REVER: `apps/api/package.json`
    - REVER: `docs/evidence/MF8/BK-MF8-08.md`
    - REVER: `docs/RF.md` e `docs/RNF.md`
    - REVER: `apps/web/src/pages/SubscriptionsPage.tsx`

3. Instruções do que fazer.

Revê validação backend, autorização, auditoria, textos PT-PT e separação de domínios. Em fluxos de IA, confirma explicação e fonte. Em fluxos financeiros, não confundas documento, pagamento, recebimento e lançamento.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A validação é uma revisão dirigida sobre o código criado nos passos anteriores.

5. Explicação do código.

Este passo evita que uma solução tecnicamente compilável introduza risco de segurança, privacidade ou domínio financeiro.

6. Validação do passo.

O guia deve conseguir explicar que dados entram, que dados saem, quem autoriza, que erro é devolvido e que evidence prova o fluxo.

7. Cenário negativo/erro esperado.

Se houver log com dados sensíveis, ação financeira automática da IA ou promessa de integração externa não documentada, o BK não pode fechar.

### Passo 6 - Registar evidence para PR ou defesa

1. Objetivo funcional do passo no contexto da app.

Registar evidence para PR ou defesa.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-08.md`
    - REVER: output dos comandos executados

3. Instruções do que fazer.

Regista comando, resultado esperado, resultado observado, negativo executado e decisão tomada. Não inventes outputs: escreve apenas o que foi executado ou deixa campo explícito para preencher no PR.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A evidence é documental e deve conter outputs reais quando a equipa executar o BK.

5. Explicação do código.

Evidence liga implementação a avaliação. Também ajuda o próximo BK a perceber que contratos ficaram prontos e que riscos ainda existem.

6. Validação do passo.

A evidence identifica o BK, requisito, comando, resultado positivo, negativo e handoff.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas 'funciona', está incompleta; falta prova objetiva.

### Passo 7 - Preparar handoff para o próximo BK

1. Objetivo funcional do passo no contexto da app.

Preparar handoff para o próximo BK.

2. Ficheiros envolvidos:
    - REVER: secção `Handoff` deste guia
    - REVER: guia do próximo BK
    - REVER: `docs/evidence/MF8/BK-MF8-08.md`
    - REVER: `apps/api/tests/contracts/mf8-subscriptions.contract.test.js`

3. Instruções do que fazer.

Resume o que ficou entregue, que ficheiros o próximo BK deve consumir e que riscos não foram fechados. O próximo BK declarado é `BK-MF8-09`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O handoff é a ponte entre entregas incrementais da app.

5. Explicação do código.

O OPSA é construído por BKs encadeados. Um bom handoff evita que o aluno seguinte reinvente contratos ou quebre decisões já tomadas.

6. Validação do passo.

A secção final confirma o próximo BK recomendado como `BK-MF8-09` e lista evidence mínima.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de ficheiro que este BK prometeu mas não criou, volta ao passo onde esse contrato deveria ter sido entregue.

#### Critérios de aceite

- O guia preserva header, owner, prioridade, dependências, requisito e próximo BK definidos pela matriz e pelo backlog.
- Os caminhos publicados para alunos usam apenas `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` ou `docs/evidence`.
- O contrato principal de testes de subscrições tem JSDoc, comentários didáticos e validação explícita.
- Existem positivos e pelo menos 3 negativos coerentes com `RF49, RF50, RF51`.
- A evidence mostra comando, resultado esperado, resultado observado e decisão tomada.
- Não há pagamentos reais, fornecedores externos não documentados, ações automáticas da IA ou dados de outra empresa.

#### Validação final

Executa os comandos relevantes para este BK:

```bash
cd apps/api
npm run test:mf8:subscriptions
npm run syntax:check
npm run test:contracts
```

Para fechar a integração com a UI entregue no `BK-MF8-07`, executa também:

```bash
cd apps/web
npm run typecheck
npm run test:mf8:subscriptions-ui
```

Resultados esperados:

- Código sem erro de sintaxe.
- Teste backend `test:mf8:subscriptions` verde.
- Gate frontend `test:mf8:subscriptions-ui` verde.
- Negativos controlados e documentados.
- Sem caminhos privados nos ficheiros entregues aos alunos.

#### Evidence para PR/defesa

- Comando positivo executado.
- Output do teste ou gate.
- Negativos executados.
- Ficheiros criados/editados.
- Screenshot ou payload API se existir UI.
- Decisão `CANONICO` ou `DERIVADO` mais importante do BK.

#### Handoff

- Próximo BK recomendado: `BK-MF8-09`
- Contrato entregue: testes de subscrições ligado a `RF49, RF50, RF51`.
- Ficheiro principal: `apps/api/tests/contracts/mf8-subscriptions.contract.test.js`.
- Teste/evidence principal: `docs/evidence/MF8/BK-MF8-08.md`.
- Risco a vigiar: não alargar o BK para requisitos fora da MF8 nem prometer integrações externas não documentadas.

#### Changelog

- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
