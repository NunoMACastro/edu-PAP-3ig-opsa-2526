# BK-MF6-06 - Passwords devem usar bcrypt com salt seguro.

## Header

- `doc_id`: `GUIA-BK-MF6-06`
- `bk_id`: `BK-MF6-06`
- `macro`: `MF6`
- `owner`: `Andre`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF13`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-07`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md`
- `last_updated`: `2026-06-23`

#### Objetivo

Neste BK vais reforçar a política de palavras-passe da OPSA. O `RNF13` exige bcrypt com salt seguro, sem guardar texto claro.

O guia valida o módulo de hashing, cria um smoke de segurança e ensina a testar registo, login e recuperação sem expor dados sensíveis.

#### Importância

Palavras-passe protegem acesso a dados financeiros. Se forem guardadas em texto claro, uma fuga de base de dados compromete todos os utilizadores.

Bcrypt é adequado para este contexto porque inclui salt por hash e torna ataques offline mais caros. O aluno deve perceber que a aplicação compara hashes, não recupera a palavra-passe original.

#### Scope-in

- Confirmar uso de bcrypt.
- Centralizar custo de hashing.
- Validar registo, login e reset.
- Criar smoke textual contra armazenamento inseguro.
- Definir negativos de texto claro, hash inválido e custo insuficiente.

#### Scope-out

- Criar autenticação nova.
- Guardar palavras-passe reversíveis.
- Enviar palavras-passe por email.
- Trocar bcrypt por algoritmo não documentado.
- Implementar MFA.

#### Estado antes e depois

- Antes: MF0 já cria autenticação; MF6 ainda não tem guia de hardening para bcrypt.
- Depois: existe contrato explícito para hashing, verificação e evidence.

#### Pre-requisitos

- Ler `RNF13`.
- Rever `BK-MF0-01` e `BK-MF0-05`.
- Confirmar `apps/api/src/modules/auth/password.js`.
- Confirmar que services de registo e reset chamam o helper central.

#### Glossário

- Palavra-passe: segredo que o utilizador conhece.
- Hash: transformação não reversível usada para comparação.
- Salt: valor aleatório incluído no hash para evitar hashes iguais.
- Cost factor: custo computacional do bcrypt.
- Texto claro: valor original sem proteção.
- Reset: fluxo que permite definir nova palavra-passe.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF13` exige bcrypt com salt seguro.
- `CANONICO`: autenticação base vem de MF0.
- `DERIVADO`: o custo `12` é adequado para PAP local e pode ser ajustado em produção com medição.
- `DERIVADO`: o helper deve ser único para evitar políticas diferentes.

Hash não é encriptação reversível. A aplicação nunca precisa de saber a palavra-passe original depois de a receber; só precisa de comparar a tentativa com o hash guardado.

#### Arquitetura do BK

- Endpoint(s): registo, login e reset existentes.
- Modelo/schema Prisma: campo de hash de utilizador já existente.
- Service(s): `authService` e `passwordResetService`.
- Controller/route: sem alteração estrutural.
- Guard/middleware: autenticação existente.
- Cliente API: não guarda segredo no browser.
- Testes: smoke textual e testes unitários.
- Handoff para o próximo BK: cookies de sessão.

#### Ficheiros a criar/editar/rever

- EDITAR: `apps/api/src/modules/auth/password.js`
- REVER: `apps/api/src/modules/auth/authService.js`
- REVER: `apps/api/src/modules/auth/passwordResetService.js`
- CRIAR: `apps/api/scripts/check-mf6-bcrypt.mjs`
- CRIAR: `apps/api/tests/unit/mf6-password.test.js`
- EDITAR: `apps/api/package.json`

#### Tutorial técnico linear

### Passo 1 - Confirmar helper único

1. Objetivo funcional do passo no contexto da app.

Garantir que toda a aplicação usa a mesma política.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/auth/password.js`
    - REVER: `apps/api/src/modules/auth/authService.js`
    - REVER: `apps/api/src/modules/auth/passwordResetService.js`
    - LOCALIZAÇÃO: hashing e verificação.

3. Instruções do que fazer.

Procura chamadas diretas a bcrypt fora do helper central.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É inventário de segurança.

5. Explicação do código.

Uma política espalhada cria risco de custos diferentes ou armazenamento errado.

6. Validação do passo.

Apenas `password.js` importa bcrypt diretamente.

7. Cenário negativo/erro esperado.

Se outro service chamar bcrypt diretamente, centraliza antes de fechar.

### Passo 2 - Endurecer helper bcrypt

1. Objetivo funcional do passo no contexto da app.

Garantir custo mínimo e documentação didática.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/src/modules/auth/password.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Mantém bcrypt isolado e exporta o custo para validação.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Hash e verificação de palavras-passe com bcrypt.
 */

import bcrypt from "bcrypt";

export const BCRYPT_ROUNDS = 12;

/**
 * Cria um hash bcrypt para uma palavra-passe recebida apenas em memória.
 *
 * @param {string} plainPassword - Palavra-passe recebida no pedido atual.
 * @returns {Promise<string>} Hash seguro para persistência.
 */
export async function hashPassword(plainPassword) {
    if (!plainPassword || plainPassword.length < 10) {
        throw new Error("A palavra-passe deve ter pelo menos 10 caracteres.");
    }

    // O bcrypt gera salt próprio por hash; nunca guardamos o valor original.
    return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

/**
 * Compara uma tentativa de login com o hash guardado.
 *
 * @param {string} plainPassword - Palavra-passe recebida no login.
 * @param {string} passwordHash - Hash guardado na base de dados.
 * @returns {Promise<boolean>} Resultado da comparação bcrypt.
 */
export async function verifyPassword(plainPassword, passwordHash) {
    if (!passwordHash?.startsWith("$2")) {
        return false;
    }

    return bcrypt.compare(plainPassword, passwordHash);
}
```

5. Explicação do código.

O helper rejeita valores demasiado fracos antes do hash e recusa hashes com formato inesperado. Isto reduz erros de implementação e impede comparação com valores que não parecem bcrypt.

6. Validação do passo.

Executa `cd apps/api && node --check src/modules/auth/password.js`.

7. Cenário negativo/erro esperado.

Palavra-passe curta lança erro e não é persistida.

### Passo 3 - Confirmar registo e reset

1. Objetivo funcional do passo no contexto da app.

Garantir que fluxos que criam palavra-passe usam `hashPassword`.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/auth/authService.js`
    - REVER: `apps/api/src/modules/auth/passwordResetService.js`
    - LOCALIZAÇÃO: criação e reset.

3. Instruções do que fazer.

Confirma chamadas a `hashPassword` antes de persistir.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Usa o helper definido no passo 2.

5. Explicação do código.

Registo e reset são entradas diferentes para a mesma responsabilidade: guardar hash e nunca texto claro.

6. Validação do passo.

Testes unitários devem criar hash começado por `$2`.

7. Cenário negativo/erro esperado.

Reset com palavra-passe curta deve falhar.

### Passo 4 - Confirmar login

1. Objetivo funcional do passo no contexto da app.

Garantir comparação correta no login.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/modules/auth/authService.js`
    - LOCALIZAÇÃO: autenticação por credenciais.

3. Instruções do que fazer.

Confirma que o login usa `verifyPassword`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * Autentica um utilizador existente e cria uma nova sessão server-side.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @param {{ email: string, password: string }} input - Credenciais já validadas pelo validator.
 * @param {Date} [now] - Data atual injetável para testes.
 * @returns {Promise<{ user: ReturnType<typeof publicUser>, sessionId: string, expiresAt: Date }>} Dados seguros para o controller.
 * @throws {import("../../lib/httpErrors.js").HttpError} Quando as credenciais não são válidas.
 */
export async function loginUser(prisma, input, now = new Date()) {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (!user || !user.isActive) {
        // A mesma resposta para email inexistente e password errada evita enumeração de contas.
        throw httpError(401, "INVALID_CREDENTIALS", "Credenciais inválidas");
    }

    const passwordMatches = await verifyPassword(
        input.password,
        user.passwordHash,
    );
    if (!passwordMatches) {
        throw httpError(401, "INVALID_CREDENTIALS", "Credenciais inválidas");
    }

    // A sessão fica server-side; o browser recebe apenas o cookie opaco definido no controller.
    const session = await createSession(prisma, user.id, now);
    return {
        user: publicUser(user),
        sessionId: session.id,
        expiresAt: session.expiresAt,
    };
}
```

5. Explicação do código.

A função completa mantém o contrato existente do `authService`: procura o utilizador, rejeita conta inexistente ou inativa com `httpError(401, "INVALID_CREDENTIALS", ...)`, compara a tentativa com `verifyPassword` e só cria sessão depois de a comparação bcrypt passar. O aluno não deve trocar este padrão por `throw new Error(...)`, porque isso quebraria o contrato HTTP da API e podia revelar comportamento diferente entre falhas de email, conta inativa e palavra-passe errada.

6. Validação do passo.

Login com palavra-passe correta cria sessão; login errado falha.

7. Cenário negativo/erro esperado.

Hash inválido deve devolver falha, não erro interno.

### Passo 5 - Criar smoke textual

1. Objetivo funcional do passo no contexto da app.

Detetar regressões básicas de segurança.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf6-bcrypt.mjs`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: script e entrada `test:mf6:bcrypt`.

3. Instruções do que fazer.

Cria o script abaixo.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual do BK-MF6-06.
 */

import { readFileSync } from "node:fs";

const passwordModule = readFileSync("src/modules/auth/password.js", "utf8");
const authService = readFileSync("src/modules/auth/authService.js", "utf8");
const resetService = readFileSync("src/modules/auth/passwordResetService.js", "utf8");

if (!passwordModule.includes("bcrypt.hash")) {
    throw new Error("Falta hash bcrypt.");
}

if (!passwordModule.includes("BCRYPT_ROUNDS = 12")) {
    throw new Error("Custo bcrypt inferior ao contrato do BK.");
}

// Registo e reset têm de reutilizar a mesma política de hash.
for (const [name, content] of [["auth", authService], ["reset", resetService]]) {
    if (!content.includes("hashPassword")) {
        throw new Error(`Fluxo ${name} não usa hashPassword.`);
    }
}
```

5. Explicação do código.

O smoke procura o contrato mínimo: bcrypt, custo e reutilização do helper.

6. Validação do passo.

Executa `cd apps/api && node scripts/check-mf6-bcrypt.mjs`.

7. Cenário negativo/erro esperado.

Se um service persistir valor sem helper, o script falha.

### Passo 6 - Testar unidade de hashing

1. Objetivo funcional do passo no contexto da app.

Provar comportamento do helper.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/unit/mf6-password.test.js`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria a suite abaixo para testar o helper de hashing sem misturar responsabilidades com validators da MF0.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Testes unitários do hardening bcrypt do BK-MF6-06.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    BCRYPT_ROUNDS,
    hashPassword,
    verifyPassword,
} from "../../src/modules/auth/password.js";

test("hashPassword guarda bcrypt e verifyPassword valida a tentativa correta", async () => {
    const plainPassword = "UmaFraseSegura123";
    const passwordHash = await hashPassword(plainPassword);

    // O valor persistido nunca pode ser igual ao segredo recebido no pedido.
    assert.notEqual(passwordHash, plainPassword);
    assert.match(passwordHash, /^\$2[aby]\$/);

    // O custo documentado tem de ficar testado para detetar regressões de configuração.
    assert.equal(BCRYPT_ROUNDS, 12);

    assert.equal(await verifyPassword(plainPassword, passwordHash), true);
    assert.equal(await verifyPassword("Errada12345", passwordHash), false);
});

test("verifyPassword devolve false quando o hash não tem formato bcrypt", async () => {
    // Este negativo impede que texto claro ou valores corrompidos sejam aceites como hash.
    assert.equal(await verifyPassword("UmaFraseSegura123", "texto-claro"), false);
});
```

5. Explicação do código.

Esta suite é completa: importa `test`, `assert` e o helper real criado no BK, confirma que o hash não é igual à palavra-passe original, valida o prefixo bcrypt, fixa o custo esperado e testa tentativa correta, tentativa errada e hash inválido. O teste fica separado dos validators da MF0 para o aluno perceber que está a validar uma política de segurança da MF6, não regras de formulário.

6. Validação do passo.

Executa `cd apps/api && node --test tests/unit/mf6-password.test.js`.

7. Cenário negativo/erro esperado.

Tentativa errada deve devolver `false`.

### Passo 7 - Confirmar ausência de exposição no frontend

1. Objetivo funcional do passo no contexto da app.

Evitar guardar credenciais no browser.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src`
    - LOCALIZAÇÃO: cliente API e formulários de autenticação.

3. Instruções do que fazer.

Confirma que a palavra-passe só é enviada no pedido e não é persistida no browser.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É revisão de segurança frontend.

5. Explicação do código.

O browser não deve guardar segredos de autenticação depois do envio.

6. Validação do passo.

Pesquisa por armazenamento persistente de credenciais deve sair sem ocorrências relevantes.

7. Cenário negativo/erro esperado.

Se o formulário guardar credenciais para reutilizar depois, remove esse comportamento.

### Passo 8 - Registar evidence

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com prova técnica.

2. Ficheiros envolvidos:
    - REVER: outputs dos testes.
    - LOCALIZAÇÃO: PR ou relatório.

3. Instruções do que fazer.

Guarda output do smoke, unit test e exemplo de hash mascarado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. É evidence.

5. Explicação do código.

Evidence nunca deve incluir a palavra-passe real usada por utilizadores.

6. Validação do passo.

Outputs ficam anexados ao PR.

7. Cenário negativo/erro esperado.

Se a evidence mostrar credenciais reais, deve ser removida e substituída por dados fictícios.

#### Critérios de aceite

- Apenas o helper central importa bcrypt.
- Hashes começam por formato bcrypt e não guardam texto claro.
- Registo, login e reset usam helper central.
- Testes provam tentativa correta e tentativa errada.
- Negativos: mínimo `3`: palavra-passe curta, hash inválido e tentativa errada.

#### Validação final

- `cd apps/api && node --check src/modules/auth/password.js`
- `cd apps/api && node scripts/check-mf6-bcrypt.mjs`
- `cd apps/api && node --test tests/unit/mf6-password.test.js`
- `cd apps/api && npm run test:unit`
- Revisão frontend de armazenamento de credenciais.

#### Evidence para PR/defesa

- `pr`: link ou identificador do PR.
- `proof`: output de smoke e unit test.
- `neg`: palavra-passe curta, hash inválido e tentativa errada.
- `fonte`: `RNF13`, `BK-MF0-01`, `BK-MF0-05`.
- `multiempresa`: autenticação continua a criar sessão ligada ao contexto correto.

#### Handoff

- Entrega política de hashing para sessões seguras.
- O próximo BK reforça cookies HttpOnly, Secure e SameSite.
- Próximo BK recomendado: `BK-MF6-07`

#### Changelog

- `2026-06-23`: bloco de login substituído por função completa com `httpError` e suite unitária MF6 criada com imports e negativos.
- `2026-06-22`: guia revisto com helper bcrypt, testes, smoke, negativos e evidence segura.
