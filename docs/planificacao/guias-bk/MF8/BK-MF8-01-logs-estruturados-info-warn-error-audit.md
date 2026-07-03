# BK-MF8-01 - Logs estruturados (info, warn, error, audit).

## Header

- `doc_id`: `GUIA-BK-MF8-01`
- `bk_id`: `BK-MF8-01`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF28`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF8-02`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`
- `last_updated`: `2026-06-30`

#### Objetivo

Neste BK vais criar uma base de logs estruturados para a API OPSA, com níveis `info`, `warn`, `error` e `audit`, sem guardar dados sensíveis nem payloads financeiros completos.

#### Importância

Logs estruturados transformam mensagens soltas em evidence útil. No fim da PAP, a equipa precisa de perceber se a API arrancou, que fluxo falhou, que operação sensível foi auditada e que pedido deve ser investigado sem expor dados da empresa.

#### Scope-in

- Criar `apps/api/src/modules/ops/structuredLogger.js`.
- Substituir o log de arranque da API por um evento estruturado.
- Definir campos mínimos: data, nível, evento, módulo, requisito e contexto seguro.
- Bloquear chaves sensíveis no contexto.
- Criar teste unitário para níveis válidos, nível inválido e contexto perigoso.

#### Scope-out

- Criar SIEM externo ou observabilidade cloud.
- Guardar payloads completos, headers, cookies ou dados financeiros detalhados.
- Alterar o modelo `AuditLog` de MF4/MF6.
- Trocar Express por outro framework.

#### Estado antes e depois

- Antes: MF0..MF7 já entregaram autenticação com cookies HttpOnly, empresa ativa no backend, permissões, dados mestre, vendas, compras, inventário, tesouraria, contabilidade, IA explicável, auditoria, hardening e gates de qualidade.
- Depois: `BK-MF8-01` deixa um contrato verificável para observabilidade operacional, com evidence e negativos suficientes para continuar a MF8 sem adivinhação técnica.

#### Pre-requisitos

- Ler `RNF28` em `docs/RF.md` ou `docs/RNF.md`.
- Rever a linha de `BK-MF8-01` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-01` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever os BKs declarados em dependências: `-`.
- Confirmar que todos os caminhos do aluno usam `apps/api` ou `apps/web`.
- Negativos: minimo `3`.

#### Glossário

- Log estruturado: objeto com campos previsíveis, em vez de texto livre.
- Nível: gravidade do evento, por exemplo `info`, `warn`, `error` ou `audit`.
- Contexto seguro: metadados mínimos para investigar sem expor dados pessoais ou financeiros.
- Audit trail: rasto de operação sensível, diferente de log técnico comum.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF28` é o requisito associado a `BK-MF8-01`.
- `CANONICO`: `BK-MF8-01` pertence à MF8, sprint `S12`, owner `Oleksii`, apoio `Pedro`, prioridade `P0` e próximo BK `BK-MF8-02`.
- `CANONICO`: a app dos alunos usa Node.js, Express, ES Modules, Prisma, React, Vite e TypeScript nos caminhos públicos `apps/api` e `apps/web`.
- `DERIVADO`: este guia transforma o requisito em ficheiros e testes pequenos, porque a MF8 é fase de hardening, qualidade final e fecho da PAP.

O domínio de observabilidade operacional deve respeitar a regra transversal do OPSA: a empresa ativa vem do contexto autenticado no backend; permissões e roles são aplicadas no backend; a UI mostra estado e recolhe intenção, mas não decide ownership nem autorização final.

Quando este BK tocar IA, a IA explica, recomenda e mostra fonte; não altera dados contabilísticos, não aprova documentos e não executa ações automaticamente. Quando tocar contabilidade ou documentos financeiros, o guia distingue documento operacional, pagamento/recebimento e lançamento contabilístico.

#### Arquitetura do BK

- Requisito: `RNF28`.
- Domínio principal: observabilidade operacional.
- Backend público dos alunos: `apps/api`.
- Frontend público dos alunos: `apps/web`.
- Prisma público dos alunos: `apps/api/prisma/schema.prisma`.
- Evidence: `docs/evidence/MF8/BK-MF8-01.md`.
- Handoff: `BK-MF8-02`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/src/modules/ops/structuredLogger.js`
- CRIAR: `apps/api/tests/unit/structuredLogger.test.js`
- EDITAR: `apps/api/src/server.js`
- REVER: `apps/api/package.json`
- REVER: `apps/api/src/modules/audit/auditLogService.js`
- REVER: `apps/api/src/modules/integrations/integrationLogService.js`

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

Confirma que `BK-MF8-01` continua associado a `RNF28`, prioridade `P0`, owner `Oleksii`, dependências `-` e próximo BK `BK-MF8-02`. Não alteres o header se a matriz e o backlog não mudaram.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e impede que a implementação avance com requisito, owner ou dependência trocados.

5. Explicação do código.

O contrato canónico vem de RF/RNF, matriz e backlog. A leitura inicial protege o aluno de resolver outro problema com o nome de `BK-MF8-01`.

6. Validação do passo.

O aluno consegue apontar a linha de `RNF28` e a linha de `BK-MF8-01` antes de editar qualquer ficheiro.

7. Cenário negativo/erro esperado.

Se o header do guia divergir da matriz ou do backlog, a implementação deve parar até o drift ser resolvido.

### Passo 2 - Mapear integração com a app existente

1. Objetivo funcional do passo no contexto da app.

Mapear integração com a app existente.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - REVER: `apps/api/src/modules`
    - REVER: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: módulos e páginas que o BK consome ou prepara

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
    - CRIAR/EDITAR: `apps/api/src/modules/ops/structuredLogger.js`
    - LOCALIZAÇÃO: ficheiro completo ou função completa indicada no passo

3. Instruções do que fazer.

Cria ou edita o contrato principal de observabilidade operacional. Mantém JSDoc, comentários didáticos junto das decisões importantes e validação no backend sempre que houver input ou persistência.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/modules/ops/structuredLogger.js

const ALLOWED_LEVELS = new Set(["info", "warn", "error", "audit"]);
const BLOCKED_CONTEXT_KEYS = new Set([
    "apikey",
    "authorization",
    "cookie",
    "documentlines",
    "headers",
    "iban",
    "nif",
    "password",
    "rawpayload",
    "secret",
    "token",
]);

/**
 * @typedef {string | number | boolean | null} SafeLogValue
 */

/**
 * @typedef {Record<string, SafeLogValue>} SafeLogContext
 */

/**
 * Cria um evento de log seguro para a API OPSA.
 *
 * @param {{ level: string, event: string, module: string, requirement: string, context?: SafeLogContext }} input - Dados mínimos do evento.
 * @returns {{ timestamp: string, level: string, event: string, module: string, requirement: string, context: SafeLogContext }} Evento normalizado.
 * @throws {Error} Quando o nível, os campos obrigatórios ou o contexto não cumprem a política de logs seguros.
 */
export function createStructuredLogEvent(input) {
    if (!input || typeof input !== "object") {
        throw new Error("Evento de log inválido.");
    }

    const { level, event, module, requirement, context = {} } = input;

    if (!ALLOWED_LEVELS.has(level)) {
        throw new Error("Nível de log inválido.");
    }
    if (
        typeof event !== "string" ||
        typeof module !== "string" ||
        typeof requirement !== "string" ||
        !event.trim() ||
        !module.trim() ||
        !requirement.trim()
    ) {
        throw new Error("Evento, módulo e requisito são obrigatórios.");
    }
    if (typeof context !== "object" || context === null || Array.isArray(context)) {
        throw new Error("Contexto de log inválido.");
    }

    const safeContext = {};
    for (const [key, value] of Object.entries(context)) {
        const normalizedKey = key.toLowerCase();

        // A lista é comparada em minúsculas para bloquear variações como apiKey ou rawPayload.
        if (BLOCKED_CONTEXT_KEYS.has(normalizedKey)) {
            throw new Error(`Campo proibido em contexto de log: ${key}`);
        }
        if (
            value !== null &&
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            throw new Error(`Valor inválido em contexto de log: ${key}`);
        }

        // O logger guarda apenas metadados simples; objetos completos escondem payloads sensíveis.
        safeContext[key] = value;
    }

    return {
        timestamp: new Date().toISOString(),
        level,
        event: event.trim(),
        module: module.trim(),
        requirement: requirement.trim(),
        context: safeContext,
    };
}

/**
 * Escreve o evento na consola usando o método certo para o nível.
 *
 * @param {ReturnType<typeof createStructuredLogEvent>} event - Evento já validado.
 * @returns {void}
 */
export function writeStructuredLog(event) {
    // A consola recebe JSON para manter o output pesquisável em dev, CI e defesa.
    const serialized = JSON.stringify(event);
    if (event.level === "error") console.error(serialized);
    else if (event.level === "warn") console.warn(serialized);
    else console.info(serialized);
}
```

5. Explicação do código.

Este código entrega o núcleo de `BK-MF8-01`: transforma o requisito `RNF28` em contrato executável, com nomes estáveis para os BKs seguintes. A função `createStructuredLogEvent` recebe apenas `level`, `event`, `module`, `requirement` e um contexto simples. O contexto é validado no backend para impedir que dados pessoais, financeiros, headers, cookies, credenciais ou payloads completos entrem nos logs.

A comparação das chaves em minúsculas é importante porque um aluno ou colega pode escrever `apiKey`, `ApiKey` ou `APIKEY`. Todas essas variantes representam o mesmo risco e devem ser bloqueadas. A validação de valores também evita objetos aninhados, porque um objeto pode esconder linhas de documento, detalhes de IVA, cabeçalhos HTTP ou dados de sessão.

O `writeStructuredLog` escreve JSON pesquisável na consola e escolhe `console.error`, `console.warn` ou `console.info` conforme o nível. Isto é suficiente para desenvolvimento, CI e defesa, sem prometer uma ferramenta externa de observabilidade que não está contratada neste BK.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/modules/ops/structuredLogger.js
```

Resultado esperado: o ficheiro passa no parser de Node.js, exporta `createStructuredLogEvent` e `writeStructuredLog`, e não depende de bibliotecas externas.

7. Cenário negativo/erro esperado.

Tenta criar um evento com `context: { password: "123" }`. O resultado esperado é erro `Campo proibido em contexto de log: password`.

### Passo 4 - Ligar o contrato à fronteira certa

1. Objetivo funcional do passo no contexto da app.

Ligar o contrato à fronteira certa.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/server.js`
    - LOCALIZAÇÃO: imports do topo e função `startServer`

3. Instruções do que fazer.

Liga o contrato ao arranque real da API. Adiciona o import do logger em `apps/api/src/server.js` e substitui o `console.info` solto dentro de `startServer` por um evento estruturado.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/src/server.js

import {
    createStructuredLogEvent,
    writeStructuredLog,
} from "./modules/ops/structuredLogger.js";

/**
 * Arranca o servidor HTTP.
 *
 * @returns {import("node:http").Server} Instância HTTP devolvida pelo Express.
 */
function startServer() {
    return app.listen(port, () => {
        // O evento de arranque usa apenas metadados operacionais seguros.
        const startupEvent = createStructuredLogEvent({
            level: "info",
            event: "api.started",
            module: "server",
            requirement: "RNF28",
            context: {
                port,
                environment: apiEnv.nodeEnv,
            },
        });

        // O writer central evita regressar a console.info solto e aplica sempre a mesma política.
        writeStructuredLog(startupEvent);
    });
}
```

5. Explicação do código.

A separação entre contrato principal e ponto de entrada reduz duplicação. `structuredLogger.js` contém a política de logs seguros; `server.js` apenas usa essa política no momento em que a API arranca. Assim, o próximo BK consegue reutilizar o mesmo logger no health-check sem inventar outro formato de log.

O evento `api.started` não inclui headers, cookies, URL de base de dados, variáveis de ambiente completas nem dados financeiros. Inclui apenas `port` e `environment`, que são suficientes para perceber se o processo arrancou no ambiente esperado.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check src/server.js
```

Resultado esperado: `server.js` continua válido e importa `structuredLogger.js` sem erro de caminho.

7. Cenário negativo/erro esperado.

Se o evento de arranque tentar registar `process.env`, headers, cookies, URL de base de dados ou payloads completos, remove esses dados. O logger deve guardar apenas metadados seguros.

### Passo 5 - Criar teste ou gate mínimo

1. Objetivo funcional do passo no contexto da app.

Criar teste ou gate mínimo.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `apps/api/tests/unit/structuredLogger.test.js`
    - REVER: `apps/api/package.json`

3. Instruções do que fazer.

Cria um teste ou gate pequeno, focado no contrato deste BK. Inclui positivo principal e negativos coerentes com prioridade `P0`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/unit/structuredLogger.test.js

import { test } from "node:test";
import assert from "node:assert/strict";
import {
    createStructuredLogEvent,
    writeStructuredLog,
} from "../../src/modules/ops/structuredLogger.js";

test("aceita todos os níveis contratados em RNF28", () => {
    const levels = ["info", "warn", "error", "audit"];

    for (const level of levels) {
        const event = createStructuredLogEvent({
            level,
            event: `ops.${level}`,
            module: "ops",
            requirement: "RNF28",
            context: { safe: true },
        });

        // Este positivo prova que os quatro níveis do RNF28 usam o mesmo contrato seguro.
        assert.equal(event.level, level);
        assert.equal(event.context.safe, true);
        assert.match(event.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    }
});

test("rejeita nível inválido e campos obrigatórios em falta", () => {
    // O logger só aceita os níveis contratados em RNF28.
    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "debug",
                event: "x",
                module: "ops",
                requirement: "RNF28",
            }),
        /Nível de log inválido/,
    );

    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "info",
                event: "",
                module: "ops",
                requirement: "RNF28",
            }),
        /Evento, módulo e requisito são obrigatórios/,
    );
});

test("bloqueia chaves sensíveis no contexto", () => {
    const blockedKeys = ["rawPayload", "password", "token", "secret", "apiKey"];

    for (const key of blockedKeys) {
        assert.throws(
            () =>
                createStructuredLogEvent({
                    level: "info",
                    event: "security.check",
                    module: "ops",
                    requirement: "RNF28",
                    // Este negativo prova que credenciais nunca entram nos logs.
                    context: { [key]: "valor proibido" },
                }),
            /Campo proibido em contexto de log/,
        );
    }
});

test("encaminha cada nível para o método certo da consola", () => {
    const originalConsole = {
        info: console.info,
        warn: console.warn,
        error: console.error,
    };
    const calls = {
        info: [],
        warn: [],
        error: [],
    };

    console.info = (message) => calls.info.push(JSON.parse(message));
    console.warn = (message) => calls.warn.push(JSON.parse(message));
    console.error = (message) => calls.error.push(JSON.parse(message));

    try {
        for (const level of ["info", "audit", "warn", "error"]) {
            writeStructuredLog(
                createStructuredLogEvent({
                    level,
                    event: `writer.${level}`,
                    module: "ops",
                    requirement: "RNF28",
                }),
            );
        }

        // `audit` fica em info porque é operacionalmente pesquisável sem ser erro técnico.
        assert.deepEqual(
            calls.info.map((event) => event.level),
            ["info", "audit"],
        );
        assert.deepEqual(
            calls.warn.map((event) => event.level),
            ["warn"],
        );
        assert.deepEqual(
            calls.error.map((event) => event.level),
            ["error"],
        );
    } finally {
        // Restaurar a consola evita que este teste contamine outros testes unitários.
        console.info = originalConsole.info;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
    }
});

test("rejeita contexto com objetos aninhados", () => {
    assert.throws(
        () =>
            createStructuredLogEvent({
                level: "audit",
                event: "sale.document",
                module: "sales",
                requirement: "RNF28",
                // Payloads financeiros completos devem ficar fora do logger operacional.
                context: { document: { totalCents: 1000 } },
            }),
        /Valor inválido em contexto de log/,
    );
});
```

5. Explicação do código.

O teste não substitui revisão manual, mas dá prova repetível. O primeiro teste confirma que os quatro níveis contratados por `RNF28` (`info`, `warn`, `error` e `audit`) são aceites pelo mesmo contrato seguro. O teste do writer confirma que `error` segue para `console.error`, `warn` segue para `console.warn` e `info`/`audit` seguem para `console.info`, mantendo o output pesquisável sem transformar eventos de auditoria em erros técnicos.

Os negativos confirmam três riscos importantes: nível fora do contrato `RNF28`, campos obrigatórios em falta e tentativa de guardar dados sensíveis ou payloads completos. A restauração da consola no teste do writer evita que uma substituição temporária de `console.info`, `console.warn` ou `console.error` contamine outros testes unitários.

O `apps/api/package.json` já tem `test:unit` configurado para `tests/unit/*.test.js`. Por isso não precisas de criar um script novo neste BK; basta confirmar que o ficheiro fica em `apps/api/tests/unit/structuredLogger.test.js`.

6. Validação do passo.

Comando recomendado:

```bash
cd apps/api
npm run test:unit
```

Resultado esperado: a suite unitária executa `structuredLogger.test.js` e passa os positivos dos quatro níveis, o dispatch de `writeStructuredLog` e os negativos de nível inválido, campo obrigatório em falta, chave sensível e objeto aninhado.

7. Cenário negativo/erro esperado.

Se `npm run test:contracts` passar mas `npm run test:unit` não for executado, a validação deste BK está incompleta. O teste criado neste BK vive em `tests/unit`, não em `tests/contracts`.

### Passo 6 - Validar segurança, domínio e mensagens

1. Objetivo funcional do passo no contexto da app.

Validar segurança, domínio e mensagens.

2. Ficheiros envolvidos:
    - REVER: ficheiros editados neste BK
    - REVER: `docs/RF.md` e `docs/RNF.md`
    - LOCALIZAÇÃO: regras de validação e mensagens visíveis

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

### Passo 7 - Registar evidence para PR ou defesa

1. Objetivo funcional do passo no contexto da app.

Registar evidence para PR ou defesa.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-01.md`
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

### Passo 8 - Preparar handoff para o próximo BK

1. Objetivo funcional do passo no contexto da app.

Preparar handoff para o próximo BK.

2. Ficheiros envolvidos:
    - REVER: secção `Handoff` deste guia
    - REVER: guia do próximo BK
    - LOCALIZAÇÃO: contratos exportados e riscos abertos

3. Instruções do que fazer.

Resume o que ficou entregue, que ficheiros o próximo BK deve consumir e que riscos não foram fechados. O próximo BK declarado é `BK-MF8-02`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O handoff é a ponte entre entregas incrementais da app.

5. Explicação do código.

O OPSA é construído por BKs encadeados. Um bom handoff evita que o aluno seguinte reinvente contratos ou quebre decisões já tomadas.

6. Validação do passo.

A secção final confirma o próximo BK recomendado como `BK-MF8-02` e lista evidence mínima.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de ficheiro que este BK prometeu mas não criou, volta ao passo onde esse contrato deveria ter sido entregue.

#### Critérios de aceite

- O guia preserva header, owner, prioridade, dependências, requisito e próximo BK definidos pela matriz e pelo backlog.
- Os caminhos publicados para alunos usam apenas `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` ou `docs/evidence`.
- O contrato principal de observabilidade operacional tem JSDoc, comentários didáticos e validação explícita.
- Existem positivos e pelo menos 3 negativos coerentes com `RNF28`.
- O arranque da API escreve `api.started` através de `writeStructuredLog`, sem `console.info` solto para esse evento.
- A evidence mostra comando, resultado esperado, resultado observado e decisão tomada.
- Não há pagamentos reais, fornecedores externos não documentados, ações automáticas da IA ou dados de outra empresa.

#### Validação final

Executa os comandos relevantes para este BK:

```bash
cd apps/api
npm run syntax:check
npm run test:unit
npm run test:contracts
```

Se o BK tocar frontend, executa também:

```bash
cd apps/web
npm run typecheck
```

Expected results:

- Código sem erro de sintaxe.
- Testes ou gates do BK verdes.
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

- Proximo BK recomendado: `BK-MF8-02`
- Contrato entregue: observabilidade operacional ligado a `RNF28`.
- Ficheiro principal: `apps/api/src/modules/ops/structuredLogger.js`.
- Teste/evidence principal: `apps/api/tests/unit/structuredLogger.test.js`.
- Risco a vigiar: não alargar o BK para requisitos fora da MF8 nem prometer integrações externas não documentadas.

#### Changelog

- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
