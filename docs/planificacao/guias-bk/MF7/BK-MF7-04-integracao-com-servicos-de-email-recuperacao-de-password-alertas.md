# BK-MF7-04 - Integração com serviços de email (recuperação de password, alertas).

## Header

- `doc_id`: `GUIA-BK-MF7-04`
- `bk_id`: `BK-MF7-04`
- `macro`: `MF7`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF21`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-05`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-04-integracao-com-servicos-de-email-recuperacao-de-password-alertas.md`
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais transformar o requisito `RNF21` numa entrega técnica verificável: o OPSA passa a ter um contrato de email transaccional para recuperação de acesso e alertas operacionais, sem ficar preso a um fornecedor comercial específico.

O resultado observável é simples: o backend consegue pedir o envio de uma mensagem transaccional através de um adapter comum, o fluxo de recuperação de password continua compatível com o contrato já existente e os alertas podem reutilizar o mesmo mecanismo sem expor dados sensíveis em logs.

Este guia é escrito para a árvore pública dos alunos. Todos os caminhos de implementação usam `apps/api` e `apps/web`.

#### Importância

Num ERP, email transaccional é parte da operação. Recuperar acesso, avisar sobre alertas e comunicar eventos relevantes são fluxos críticos, mas também são pontos de risco: logs podem expor endereços completos, links de recuperação ou conteúdo financeiro.

O `RNF21` pede integração com serviços de email. Como a planificação não canoniza um fornecedor específico, a decisão correta é criar uma fronteira técnica pequena: a app fala com um adapter interno e o provider real pode ser ligado mais tarde sem alterar services de domínio.

Este BK vem depois de `BK-MF7-03`, que valida a compatibilidade da interface nos browsers alvo. Depois deste BK, `BK-MF7-05` pode avançar para exportações mantendo a disciplina de evidence, scripts e negativos reproduzíveis.

#### Scope-in

- Criar um adapter transaccional comum para email.
- Preservar o contrato existente de recuperação de password.
- Preparar alertas e lembretes para envio por email sem duplicar regras.
- Validar motivo, destinatário e conteúdo mínimo antes de chamar provider externo.
- Garantir logs seguros, com domínio do destinatário e sem endereço completo.
- Criar testes de contrato para provider ausente, motivo inválido, destinatário inválido e segredo de recuperação não exposto.
- Acrescentar scripts npm específicos da MF7.
- Registar evidence técnica do fluxo principal e dos negativos.

#### Scope-out

- Escolher, comprar ou configurar provider comercial de email.
- Criar campanhas de marketing ou newsletters.
- Guardar links de recuperação em logs.
- Expor autorização, permissões, empresa ativa ou regras financeiras no frontend.
- Criar novos modelos Prisma para email.
- Criar endpoints novos sem necessidade comprovada pelo requisito.

#### Estado antes e depois

- Estado antes: a app já tem autenticação, recuperação de password com adapter dedicado, notificações in-app, auditoria e hardening básico vindos das macrofases anteriores.
- Estado depois: o envio por email fica encapsulado num adapter transaccional comum, a recuperação de password continua a chamar `sendPasswordReset`, os alertas podem usar o mesmo contrato e existe validação reproduzível para `RNF21`.

#### Pre-requisitos

- Ler `RNF21` em `docs/RNF.md`.
- Rever a linha de `BK-MF7-04` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF7-04` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Rever `BK-MF7-03`, porque entrega compatibilidade antes dos fluxos de recuperação e alertas.
- Rever `BK-MF7-05`, porque é o próximo BK da sequência MF7.
- Confirmar que `apps/api/package.json` usa ES Modules e `node --test`.
- Confirmar que `apps/api/src/modules/auth/passwordResetService.js` chama um adapter com método `sendPasswordReset`.
- Confirmar que `apps/api/src/modules/notifications/notificationService.js` já concentra lembretes e alertas.

#### Glossário

- Email transaccional: mensagem enviada por causa de uma ação ou evento da aplicação.
- Adapter: fronteira interna que isola a app do provider externo.
- Provider: serviço técnico que entrega email.
- Recuperação de password: fluxo que gera um segredo temporário para o utilizador definir nova credencial.
- Alerta: aviso operacional criado pela app, por exemplo lembrete ou alerta inteligente.
- Evidence: prova objetiva com comando, output, fluxo principal e negativos.
- Log seguro: registo técnico que ajuda a depurar sem expor endereço completo, segredo, cookie ou link privado.

#### Conceitos teóricos essenciais

`CANONICO`: `RNF21` exige integração com serviços de email para recuperação de password e alertas.

`CANONICO`: `BK-MF7-04` é um BK `P0/Reforco`, owner `Sofia`, apoio `Pedro`, sprint `S11-S12` e próximo BK `BK-MF7-05`.

`DERIVADO`: como o provider real não está definido na planificação, o adapter transaccional é a forma mínima e segura de cumprir o requisito sem acoplar services ao fornecedor.

Um service de domínio não deve conhecer detalhes de SMTP, API externa ou credenciais de provider. Ele deve pedir "envia esta mensagem transaccional" e receber um resultado controlado. Isto torna testes mais simples e impede que detalhes externos contaminem autenticação ou notificações.

Recuperação de password é um fluxo sensível. O utilizador pode receber um link por email, mas a app nunca deve escrever o segredo bruto nem a URL completa em logs ou evidence. O backend pode guardar hash, validade e estado de uso; o texto enviado para o destinatário fica fora dos logs.

Alertas por email não substituem notificações in-app. Este BK apenas prepara a entrega externa: os alertas continuam a nascer no backend, com empresa ativa, utilizador e permissões resolvidos pelos services já existentes.

#### Arquitetura do BK

- Adapter comum: `apps/api/src/modules/notifications/transactionalEmailAdapter.js`
- Adapter específico existente: `apps/api/src/modules/auth/passwordResetEmailAdapter.js`
- Service de recuperação: `apps/api/src/modules/auth/passwordResetService.js`
- Service de notificações: `apps/api/src/modules/notifications/notificationService.js`
- Testes de contrato: `apps/api/tests/contracts/mf7-email-contracts.test.js`
- Scripts npm: `test:mf7:email` e `test:mf7`
- Evidence: `apps/api/evidence/mf7-email-integration.md`
- Endpoints novos: não aplicável.
- Prisma/schema: não aplicável.
- Frontend: não aplicável neste BK, porque o contrato de envio pertence ao backend.
- Handoff para o próximo BK: `BK-MF7-05` recebe a mesma disciplina de scripts, evidence e negativos.

#### Ficheiros a criar/editar/rever

| Ficheiro | Ação | Responsabilidade |
| --- | --- | --- |
| `apps/api/src/modules/notifications/transactionalEmailAdapter.js` | criar | Contrato comum de email transaccional. |
| `apps/api/src/modules/auth/passwordResetEmailAdapter.js` | editar | Reutilizar o adapter comum sem quebrar `sendPasswordReset`. |
| `apps/api/src/modules/notifications/notificationService.js` | editar | Preparar envio por email para lembretes e alertas já gerados. |
| `apps/api/tests/contracts/mf7-email-contracts.test.js` | criar | Validar fluxo principal e negativos de `RNF21`. |
| `apps/api/package.json` | editar | Expor scripts `test:mf7:email` e `test:mf7`. |
| `apps/api/evidence/mf7-email-integration.md` | criar | Guardar outputs e prova de logs seguros. |
| `docs/RNF.md` | rever | Confirmar contrato `RNF21`. |
| `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` | rever | Confirmar metadados canónicos do BK. |
| `docs/planificacao/backlogs/BACKLOG-MVP.md` | rever | Confirmar prioridade, esforço e sequência. |

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato RNF21 e fronteiras de segurança

1. Objetivo funcional do passo no contexto da app.

Confirmar o que o requisito pede antes de alterar código: email para recuperação de password e alertas, com regras de segurança no backend.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `apps/api/src/modules/auth/passwordResetService.js`
    - REVER: `apps/api/src/modules/auth/passwordResetEmailAdapter.js`
    - REVER: `apps/api/src/modules/notifications/notificationService.js`
    - LOCALIZAÇÃO: contrato `RNF21`, services de autenticação e notificações.

3. Instruções do que fazer.

Confirma que `RNF21` não exige provider específico. Depois confirma que a recuperação de password já espera um adapter com método `sendPasswordReset` e que as notificações já existem como ponto de integração para lembretes e alertas.

Não movas a decisão de envio para o frontend. O frontend pode iniciar pedidos, mas o envio, validação, logs e auditoria pertencem ao backend.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura e desenho técnico.

5. Explicação do código.

Não há código porque a decisão principal é arquitetural. O BK deve reutilizar contratos existentes em vez de criar um segundo fluxo de recuperação. Isto evita duplicação e mantém a proteção contra enumeração de utilizadores já existente no service de recuperação.

6. Validação do passo.

Confirma por leitura que:

- `BK-MF7-04` aponta para `RNF21`;
- `passwordResetService.js` chama `emailAdapter.sendPasswordReset`;
- `notificationService.js` centraliza lembretes e alertas;
- nenhum destes services exige provider comercial para o BK ficar testável.

7. Cenario negativo/erro esperado.

Se tentares resolver `RNF21` criando chamadas diretas a SMTP dentro do service de recuperação ou dentro do service de notificações, para a implementação. O erro de desenho é acoplamento ao provider e deve ser corrigido antes de avançar.

### Passo 2 - Criar o adapter transaccional comum

1. Objetivo funcional do passo no contexto da app.

Criar a fronteira interna que valida mensagens transaccionais e permite usar provider real ou fila técnica segura.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/src/modules/notifications/transactionalEmailAdapter.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro `apps/api/src/modules/notifications/transactionalEmailAdapter.js` com o conteúdo completo abaixo. Mantém o adapter pequeno: valida motivo, destinatário e conteúdo; chama provider se existir; caso contrário, regista apenas metadados seguros.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Adapter comum para email transaccional da MF7.
 */

export const TransactionalEmailReason = Object.freeze({
  PASSWORD_RESET: "PASSWORD_RESET",
  SMART_ALERT: "SMART_ALERT",
  PAYMENT_REMINDER: "PAYMENT_REMINDER",
});

const allowedReasons = new Set(Object.values(TransactionalEmailReason));

/**
 * Devolve apenas o domínio para evidence técnica sem expor o endereço completo.
 *
 * @param {string} email - Endereço de destino.
 * @returns {string | null} Domínio do destinatário ou null.
 */
export function getEmailDomain(email) {
  if (typeof email !== "string" || !email.includes("@")) return null;
  return email.split("@").at(-1).toLowerCase();
}

/**
 * Valida a mensagem antes de ela sair do domínio OPSA.
 *
 * @param {{ to: string, reason: string, subject: string, text: string }} message - Mensagem transaccional.
 * @returns {{ to: string, reason: string, subject: string, text: string }} Mensagem validada.
 */
export function validateTransactionalEmailMessage(message) {
  if (!message || typeof message !== "object") {
    throw new Error("Email transaccional inválido");
  }

  if (!getEmailDomain(message.to)) {
    throw new Error("Destinatário de email inválido");
  }

  if (!allowedReasons.has(message.reason)) {
    throw new Error("Motivo de email fora do contrato OPSA");
  }

  if (typeof message.subject !== "string" || message.subject.trim().length < 6) {
    throw new Error("Assunto de email insuficiente");
  }

  if (typeof message.text !== "string" || message.text.trim().length < 12) {
    throw new Error("Texto de email insuficiente");
  }

  return {
    to: message.to.trim().toLowerCase(),
    reason: message.reason,
    subject: message.subject.trim(),
    text: message.text.trim(),
  };
}

/**
 * Cria adapter para provider real ou fila técnica segura.
 *
 * @param {{ provider?: { send(message: object): Promise<object> }, logger?: Pick<Console, "info"> }} options - Dependências externas.
 * @returns {{ sendTransactionalEmail(message: object): Promise<object> }} Adapter transaccional.
 */
export function buildTransactionalEmailAdapter({ provider, logger = console } = {}) {
  return {
    async sendTransactionalEmail(message) {
      const safeMessage = validateTransactionalEmailMessage(message);

      if (provider?.send) {
        // O provider recebe a mensagem completa; os logs internos continuam mínimos.
        const result = await provider.send(safeMessage);
        logger.info({
          event: "transactional_email_sent",
          reason: safeMessage.reason,
          emailDomain: getEmailDomain(safeMessage.to),
        });
        return { status: "SENT", reason: safeMessage.reason, providerResult: result };
      }

      // Sem provider configurado, a fila técnica guarda só metadados não sensíveis.
      logger.info({
        event: "transactional_email_queued",
        reason: safeMessage.reason,
        emailDomain: getEmailDomain(safeMessage.to),
      });

      return { status: "QUEUED_FOR_PROVIDER", reason: safeMessage.reason };
    },
  };
}
```

5. Explicação do código.

O ficheiro define os motivos aceites e obriga todos os envios a passarem por validação. A função `getEmailDomain` existe para permitir evidence útil sem escrever o endereço completo.

`buildTransactionalEmailAdapter` aceita provider real, mas não depende dele para o BK ser testável. Sem provider, devolve `QUEUED_FOR_PROVIDER` e escreve apenas evento, motivo e domínio. Isto cumpre `RNF21` como contrato técnico e evita expor dados sensíveis em logs.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/notifications/transactionalEmailAdapter.js
```

Resultado esperado: o comando termina sem erros de sintaxe.

7. Cenario negativo/erro esperado.

Tenta chamar `sendTransactionalEmail` com motivo `"MARKETING"`. O resultado esperado é erro `Motivo de email fora do contrato OPSA` antes de qualquer provider ser chamado.

### Passo 3 - Preservar o contrato de recuperação de password

1. Objetivo funcional do passo no contexto da app.

Ligar a recuperação de password ao adapter comum sem quebrar a assinatura que o service já usa.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/auth/passwordResetEmailAdapter.js`
    - REVER: `apps/api/src/modules/auth/passwordResetService.js`
    - LOCALIZAÇÃO: ficheiro completo do adapter específico.

3. Instruções do que fazer.

Substitui o conteúdo de `apps/api/src/modules/auth/passwordResetEmailAdapter.js` pelo ficheiro completo abaixo. Mantém o método público `sendPasswordReset({ email, token })`, porque `requestPasswordReset` já depende dele.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Adapter de email para recuperação de password.
 */

import {
  TransactionalEmailReason,
  buildTransactionalEmailAdapter,
} from "../notifications/transactionalEmailAdapter.js";

/**
 * Constrói a URL privada enviada apenas ao destinatário.
 *
 * @param {{ appBaseUrl: string, token: string }} input - Base pública e segredo temporário.
 * @returns {string} URL de recuperação.
 */
function buildPasswordResetUrl({ appBaseUrl, token }) {
  const baseUrl = String(appBaseUrl || "").replace(/\/$/, "");
  const encodedToken = encodeURIComponent(token);
  return `${baseUrl}/recuperar-password?token=${encodedToken}`;
}

/**
 * Cria adapter de email para recuperação de password.
 *
 * @param {{ appBaseUrl: string, provider?: { send(message: object): Promise<object> }, logger?: Console }} options - Configuração backend.
 * @returns {{ sendPasswordReset(input: { email: string, token: string }): Promise<object> }} Adapter assíncrono.
 */
export function buildPasswordResetEmailAdapter({
  appBaseUrl,
  provider,
  logger = console,
}) {
  const transactionalEmailAdapter = buildTransactionalEmailAdapter({
    provider,
    logger,
  });

  return {
    async sendPasswordReset({ email, token }) {
      const resetUrl = buildPasswordResetUrl({ appBaseUrl, token });

      // A URL fica apenas no corpo enviado ao destinatário; não entra nos logs.
      return transactionalEmailAdapter.sendTransactionalEmail({
        to: email,
        reason: TransactionalEmailReason.PASSWORD_RESET,
        subject: "Recuperação de acesso OPSA",
        text: [
          "Recebemos um pedido para recuperar o acesso ao OPSA.",
          "Usa esta ligação para definir uma nova password:",
          resetUrl,
          "Se não pediste esta recuperação, ignora esta mensagem.",
        ].join("\n"),
      });
    },
  };
}
```

5. Explicação do código.

O adapter específico continua a expor `sendPasswordReset`, por isso `passwordResetService.js` não precisa de mudar a sua chamada principal. A diferença é interna: o envio passa pelo adapter transaccional comum criado no passo anterior.

A URL de recuperação é construída para o corpo da mensagem, mas o adapter comum só regista metadados. Assim, o utilizador recebe instrução útil e a evidence técnica não guarda URL privada nem segredo bruto.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/auth/passwordResetEmailAdapter.js
```

Resultado esperado: o comando termina sem erros de sintaxe.

7. Cenario negativo/erro esperado.

Se mudares o método público para outro nome e deixares de expor `sendPasswordReset`, o fluxo `requestPasswordReset` deve falhar nos testes. Corrige mantendo a assinatura usada pelo service.

### Passo 4 - Preparar alertas e lembretes para envio por email

1. Objetivo funcional do passo no contexto da app.

Permitir que notificações já criadas pelo backend possam ser enviadas por email sem duplicar a lógica de validação.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/notifications/notificationService.js`
    - LOCALIZAÇÃO: acrescentar imports no topo e a função exportada no final do ficheiro.

3. Instruções do que fazer.

Mantém as funções existentes de notificações in-app. Acrescenta o import abaixo no topo e a função `sendNotificationEmails` no final do ficheiro.

4. Código completo, correto e integrado com a app final.

```js
import { TransactionalEmailReason } from "./transactionalEmailAdapter.js";

/**
 * Envia por email um conjunto de notificações já autorizadas pelo backend.
 *
 * @param {{ sendTransactionalEmail(message: object): Promise<object> }} emailAdapter - Adapter comum de MF7.
 * @param {Array<{ recipientEmail: string, type: string, title: string, message: string }>} notifications - Notificações elegíveis.
 * @returns {Promise<Array<{ status: string, reason: string }>>} Resultados seguros do envio.
 */
export async function sendNotificationEmails(emailAdapter, notifications) {
  const results = [];

  for (const notification of notifications) {
    const reason =
      notification.type === "SMART_ALERT"
        ? TransactionalEmailReason.SMART_ALERT
        : TransactionalEmailReason.PAYMENT_REMINDER;

    // A autorização e a empresa ativa já foram resolvidas antes de chegar aqui.
    const result = await emailAdapter.sendTransactionalEmail({
      to: notification.recipientEmail,
      reason,
      subject: notification.title,
      text: notification.message,
    });

    // O retorno é deliberadamente curto para não devolver conteúdo sensível ao caller.
    results.push({ status: result.status, reason: result.reason });
  }

  return results;
}
```

5. Explicação do código.

Esta função não substitui `syncNotifications`. Ela recebe notificações já selecionadas por services que conhecem empresa, utilizador e estado. O seu trabalho é apenas transformar notificações elegíveis em mensagens transaccionais.

O motivo do email deriva do tipo de notificação. `SMART_ALERT` fica como alerta inteligente; os restantes casos aceites neste BK seguem como lembrete de pagamento. Se no futuro existirem mais tipos, acrescenta-se um motivo novo no adapter comum e nos testes.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/notifications/notificationService.js
```

Resultado esperado: o ficheiro continua válido e as exports existentes não foram removidas.

7. Cenario negativo/erro esperado.

Se uma notificação chegar sem `recipientEmail`, o adapter comum deve falhar com `Destinatário de email inválido`. Não contornes este erro com envio silencioso.

### Passo 5 - Criar testes de contrato MF7 para email

1. Objetivo funcional do passo no contexto da app.

Criar provas automatizadas para o fluxo principal e para os negativos obrigatórios de um BK `P0`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf7-email-contracts.test.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro de testes abaixo. Estes testes não enviam email real; validam o contrato interno, os erros esperados e a ausência de dados sensíveis nos logs.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Testes de contrato MF7 para email transaccional.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPasswordResetEmailAdapter } from "../../src/modules/auth/passwordResetEmailAdapter.js";
import {
  TransactionalEmailReason,
  buildTransactionalEmailAdapter,
} from "../../src/modules/notifications/transactionalEmailAdapter.js";
import { sendNotificationEmails } from "../../src/modules/notifications/notificationService.js";

function captureLogger() {
  const entries = [];
  return {
    entries,
    logger: {
      info(entry) {
        entries.push(entry);
      },
    },
  };
}

describe("MF7 email transaccional", () => {
  it("coloca email em fila técnica sem expor endereço completo", async () => {
    const { entries, logger } = captureLogger();
    const adapter = buildTransactionalEmailAdapter({ logger });

    const result = await adapter.sendTransactionalEmail({
      to: "sofia@example.com",
      reason: TransactionalEmailReason.SMART_ALERT,
      subject: "Alerta OPSA",
      text: "Existe um alerta operacional pendente.",
    });

    assert.equal(result.status, "QUEUED_FOR_PROVIDER");
    assert.equal(entries[0].emailDomain, "example.com");
    assert.equal(JSON.stringify(entries).includes("sofia@example.com"), false);
  });

  it("rejeita motivo fora do contrato", async () => {
    const adapter = buildTransactionalEmailAdapter();

    await assert.rejects(
      () =>
        adapter.sendTransactionalEmail({
          to: "sofia@example.com",
          reason: "MARKETING",
          subject: "Campanha",
          text: "Mensagem fora do contrato RNF21.",
        }),
      /Motivo de email fora do contrato OPSA/,
    );
  });

  it("rejeita destinatário inválido antes de chamar provider", async () => {
    let providerWasCalled = false;
    const adapter = buildTransactionalEmailAdapter({
      provider: {
        async send() {
          providerWasCalled = true;
          return { id: "provider-message-1" };
        },
      },
    });

    await assert.rejects(
      () =>
        adapter.sendTransactionalEmail({
          to: "sem-arroba",
          reason: TransactionalEmailReason.PAYMENT_REMINDER,
          subject: "Lembrete OPSA",
          text: "Existe um lembrete operacional pendente.",
        }),
      /Destinatário de email inválido/,
    );

    assert.equal(providerWasCalled, false);
  });

  it("mantém sendPasswordReset e não escreve segredo nos logs", async () => {
    const { entries, logger } = captureLogger();
    const adapter = buildPasswordResetEmailAdapter({
      appBaseUrl: "https://opsa.example.test",
      logger,
    });

    await adapter.sendPasswordReset({
      email: "pedro@example.com",
      token: "segredo-temporario-de-teste",
    });

    const serializedLogs = JSON.stringify(entries);
    assert.equal(serializedLogs.includes("pedro@example.com"), false);
    assert.equal(serializedLogs.includes("segredo-temporario-de-teste"), false);
    assert.equal(serializedLogs.includes("recuperar-password"), false);
  });

  it("envia alertas e lembretes usando o adapter comum", async () => {
    const sentMessages = [];
    const emailAdapter = {
      async sendTransactionalEmail(message) {
        sentMessages.push(message);
        return { status: "SENT", reason: message.reason };
      },
    };

    const results = await sendNotificationEmails(emailAdapter, [
      {
        recipientEmail: "sofia@example.com",
        type: "SMART_ALERT",
        title: "Alerta de margem",
        message: "Existe uma margem operacional abaixo do esperado.",
      },
      {
        recipientEmail: "pedro@example.com",
        type: "REMINDER",
        title: "Lembrete de pagamento",
        message: "Existe um prazo financeiro por validar.",
      },
    ]);

    assert.deepEqual(
      results.map((result) => result.reason),
      [TransactionalEmailReason.SMART_ALERT, TransactionalEmailReason.PAYMENT_REMINDER],
    );
    assert.equal(sentMessages.length, 2);
  });
});
```

5. Explicação do código.

Os testes usam `node:test`, que já existe na stack Node do backend. O primeiro teste prova o fallback seguro sem provider. O segundo e o terceiro cobrem negativos obrigatórios: motivo fora do contrato e destinatário inválido.

O quarto teste protege o fluxo mais sensível: recuperação de password. Ele confirma que a assinatura `sendPasswordReset` continua disponível e que logs não incluem endereço completo, segredo temporário nem rota privada. O último teste prova que alertas e lembretes conseguem usar o adapter comum.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --test tests/contracts/mf7-email-contracts.test.js
```

Resultado esperado: todos os testes terminam com sucesso.

7. Cenario negativo/erro esperado.

Altera temporariamente o motivo `"MARKETING"` para um motivo permitido no teste negativo. O teste deve deixar de provar o erro esperado; repõe o valor inválido antes de fechar o BK.

### Passo 6 - Acrescentar scripts npm específicos da MF7

1. Objetivo funcional do passo no contexto da app.

Dar ao aluno e ao avaliador um comando curto e reproduzível para validar `RNF21`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `"scripts"`.

3. Instruções do que fazer.

Acrescenta os scripts abaixo ao objeto `"scripts"`, mantendo os scripts existentes. Não removas `test`, `test:contracts`, `test:integration` nem os scripts de MF6.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "test:mf7:email": "node --test tests/contracts/mf7-email-contracts.test.js",
    "test:mf7": "npm run test:mf7:email"
  }
}
```

5. Explicação do código.

`test:mf7:email` isola a prova deste BK. `test:mf7` fica como agregador da macrofase e pode receber outros scripts MF7 nos BKs seguintes.

O bloco acima mostra apenas as entradas novas para facilitar a leitura. No ficheiro real, estas chaves devem entrar dentro de `"scripts"` ao lado das já existentes.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run test:mf7:email
```

Resultado esperado: os testes de contrato MF7 de email passam.

7. Cenario negativo/erro esperado.

Se o script apontar para um caminho errado, o npm deve falhar com ficheiro não encontrado. Corrige o caminho para `tests/contracts/mf7-email-contracts.test.js`.

### Passo 7 - Registar evidence do fluxo principal e dos negativos

1. Objetivo funcional do passo no contexto da app.

Criar uma prova durável para PR, defesa ou auditoria do BK.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/evidence/mf7-email-integration.md`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro de evidence abaixo depois de executar os comandos. Preenche a data, os comandos e o resultado observado com os outputs reais da tua execução.

4. Código completo, correto e integrado com a app final.

````md
# Evidence MF7 - Email transaccional

## Contrato

- Data de execução: AAAA-MM-DD
- BK: BK-MF7-04
- Requisito: RNF21
- Fluxos cobertos: recuperação de password, alertas e lembretes.

## Comandos executados

```bash
cd apps/api
node --check src/modules/notifications/transactionalEmailAdapter.js
node --check src/modules/auth/passwordResetEmailAdapter.js
npm run test:mf7:email
```

## Resultado observado

- Adapter transaccional: sintaxe válida.
- Adapter de recuperação: sintaxe válida.
- Testes de contrato: todos os testes passaram.

## Fluxo principal

- Provider ausente devolveu `QUEUED_FOR_PROVIDER`.
- Log técnico registou evento, motivo e domínio do destinatário.
- Recuperação de password manteve `sendPasswordReset`.
- Alertas e lembretes usaram o adapter comum.

## Negativos

- Motivo `"MARKETING"` foi rejeitado.
- Destinatário sem `@` foi rejeitado.
- Provider não foi chamado quando o destinatário era inválido.
- Logs não incluíram endereço completo, segredo temporário nem URL privada.

## Fonte

- `docs/RNF.md` - RNF21.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` - BK-MF7-04.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` - prioridade e sequência.
````

5. Explicação do código.

Este ficheiro não é código executável; é evidence técnica. Ele liga comando, output e requisito para que a entrega seja verificável sem depender de memória ou conversa.

A secção de negativos é obrigatória porque este BK é P0. Ela prova que o adapter não aceita motivos fora do contrato, não envia para destinatários inválidos e não escreve dados sensíveis em logs.

6. Validação do passo.

Confirma que a evidence contém:

- comandos executados;
- resultado observado;
- fluxo principal;
- pelo menos três negativos;
- fonte documental.

7. Cenario negativo/erro esperado.

Se a evidence disser apenas "funciona" sem output, negativos ou fonte, não está aceite. Reexecuta os comandos e regista o resultado técnico.

### Passo 8 - Executar validação final e fechar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com validação reproduzível e handoff claro para `BK-MF7-05`.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/notifications/transactionalEmailAdapter.js`
    - REVER: `apps/api/src/modules/auth/passwordResetEmailAdapter.js`
    - REVER: `apps/api/src/modules/notifications/notificationService.js`
    - REVER: `apps/api/tests/contracts/mf7-email-contracts.test.js`
    - REVER: `apps/api/package.json`
    - REVER: `apps/api/evidence/mf7-email-integration.md`
    - LOCALIZAÇÃO: fecho técnico do BK.

3. Instruções do que fazer.

Executa a validação final pela ordem abaixo. Corrige qualquer falha antes de marcar o BK como concluído.

4. Código completo, correto e integrado com a app final.

```bash
cd apps/api
npm run test:mf7:email
npm run syntax:check
cd ../..
bash scripts/validate-planificacao.sh
git diff --check
```

5. Explicação do código.

`npm run test:mf7:email` valida o contrato específico deste BK. `npm run syntax:check` confirma que os ficheiros JavaScript continuam sintaticamente válidos. `validate-planificacao.sh` valida a consistência documental da planificação. `git diff --check` evita whitespace problemático antes da entrega.

Esta ordem separa teste funcional, sintaxe, documentação e higiene de diff. Se uma validação falhar, a correção deve ser feita no ficheiro responsável e o comando deve ser repetido.

6. Validação do passo.

Resultado esperado:

- `test:mf7:email` passa;
- `syntax:check` passa;
- `validate-planificacao.sh` termina com `overall_pass=true`;
- `git diff --check` termina sem erros.

7. Cenario negativo/erro esperado.

Se `validate-planificacao.sh` falhar apenas em advisory legado fora do ficheiro deste BK, regista a ocorrência na evidence e no PR. Se falhar em cobertura, naming, consistência ou guias deste BK, corrige antes de fechar.

#### Critérios de aceite

- `RNF21` está ligado a um adapter transaccional comum.
- O contrato público `sendPasswordReset` continua compatível com o service de recuperação.
- Alertas e lembretes conseguem usar o adapter comum sem duplicar validação.
- Provider ausente devolve resultado controlado e auditável.
- Logs não incluem endereço completo, segredo temporário, cookie nem URL privada.
- Existe script `test:mf7:email`.
- Existem testes para fluxo principal, motivo inválido, destinatário inválido e recuperação de password sem dados sensíveis em logs.
- Existe evidence com comandos, resultados, fluxo principal, negativos e fonte.
- Não foram criados endpoints, modelos Prisma ou dependências sem necessidade documental.

#### Validação final

Executar a partir da raiz do projeto:

```bash
cd apps/api
npm run test:mf7:email
npm run syntax:check
cd ../..
bash scripts/validate-planificacao.sh
git diff --check
```

Resultado esperado:

- testes MF7 de email passam;
- sintaxe JavaScript passa;
- validador de planificação passa nos gates obrigatórios;
- diff não tem whitespace inválido.

#### Evidence para PR/defesa

- `pr`: referência do PR, commit ou pacote de entrega.
- `proof`: output de `npm run test:mf7:email` e logs seguros com evento, motivo e domínio.
- `neg`: motivo fora do contrato, destinatário inválido e ausência de dados sensíveis em logs.
- `fonte`: `RNF21`, matriz canónica, backlog e este guia.
- `seguranca`: prova de que logs não incluem endereço completo, segredo temporário, cookie ou URL privada.

#### Handoff

Este BK entrega a `BK-MF7-05` um padrão de validação MF7 com adapter isolado, scripts dedicados, testes de contrato, evidence e negativos reproduzíveis. O próximo BK deve manter a mesma disciplina: exportações devem ter scripts próprios, formatos verificáveis e evidence objetiva.

Risco restante aceitável: o provider comercial de email ainda depende de decisão operacional. O contrato interno já permite ligar esse provider sem reescrever os services de domínio.

#### Changelog

- `2026-06-26`: guia corrigido para 8 passos P0, integração com contratos existentes, scripts, testes, evidence e negativos concretos de `RNF21`.
