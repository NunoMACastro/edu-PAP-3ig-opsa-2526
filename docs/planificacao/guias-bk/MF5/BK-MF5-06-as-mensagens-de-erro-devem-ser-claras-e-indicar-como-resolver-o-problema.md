# BK-MF5-06 - As mensagens de erro devem ser claras e indicar como resolver o problema.

## Header
- `doc_id`: `GUIA-BK-MF5-06`
- `bk_id`: `BK-MF5-06`
- `macro`: `MF5`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF06`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-07`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-06-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md`
- `last_updated`: `2026-07-10`

#### Contrato de erros atualizado

`401` não é uma mensagem local repetida por cada formulário: o cliente comum limpa a sessão e o Router navega para login com `returnTo` interno validado. `409 STALE_STATE` preserva dados, recarrega a versão atual e pede nova decisão. A mensagem visível referencia campos através de `aria-describedby`, move foco para o erro relevante e nunca apresenta stack, payload bruto ou detalhes internos.

#### Objetivo

Neste BK vais implementar uma camada transversal de mensagens de erro claras para a UI da OPSA. No fim, os erros vindos da API e da validação local passam a mostrar a causa, o detalhe técnico controlado e uma próxima ação em português de Portugal.

O requisito coberto é `RNF06`: as mensagens de erro devem ser claras e indicar como resolver o problema.

#### Importância

Uma aplicação de gestão pode ter validação correta e ainda assim ser difícil de usar se responder apenas com mensagens técnicas. Um erro como `VALIDATION_ERROR` ou `FORBIDDEN` ajuda a equipa técnica, mas não explica ao utilizador que campo deve rever, que permissão falta ou que ação pode tentar de seguida.

Na OPSA isto é especialmente importante porque a app trabalha com dados financeiros, fiscais, comerciais e contabilísticos. A UI deve ajudar o utilizador a corrigir NIF, IBAN, datas, IVA ou contas SNC sem fingir que o frontend decide permissões, empresa ativa, regras de domínio ou auditoria.

#### Scope-in

- Criar `apps/web/src/lib/mf5ErrorMessages.ts`.
- Reutilizar `formatMf5FormErrors` criado no `BK-MF5-05`.
- Substituir o `formatError` técnico de `apps/web/src/App.tsx`.
- Aplicar o mesmo tradutor de erros nas páginas dedicadas de `MF1`, `MF2`, `MF3` e `MF4`.
- Criar smoke textual `test:mf5:errors`.
- Preservar `status`, `code` e `message` quando o erro vem da API.
- Manter cookies HttpOnly através do cliente API existente com `credentials: "include"`.

#### Scope-out

- Criar endpoints novos.
- Criar modelos Prisma, migrations, services ou controllers novos.
- Alterar regras fiscais, contabilísticas, bancárias ou legais.
- Mudar autenticação, autorização, papéis, permissões, empresa ativa ou auditoria.
- Trocar a stack React, Vite e TypeScript.
- Adicionar dependências externas de UI ou validação.
- Editar documentos canónicos, RF/RNF, matriz, backlog ou sprints.

#### Estado antes e depois

- Antes: `App.tsx` transforma `ApiError` em texto técnico como `CODE: message`, e páginas dedicadas podem manter formatadores próprios.
- Depois: a UI usa uma função comum para transformar erros em título, detalhe e ajuda. O erro continua rastreável para a equipa técnica, mas passa a explicar a próxima ação ao utilizador.
- Antes: o handoff do `BK-MF5-05` para `formatMf5FormErrors` não é consumido por este guia.
- Depois: erros de validação local usam o texto de `formatMf5FormErrors` e recebem orientação adicional de `RNF06`.
- Antes: não existe smoke próprio para provar `RNF06`.
- Depois: `npm run test:mf5:errors` confirma exports, integração e comando de validação textual.

#### Pre-requisitos

- Ler `RNF06` em `docs/RNF.md`.
- Rever `BACKLOG-MVP.md` e `MATRIZ-CANONICA-BK.md` para confirmar que `BK-MF5-06` é `P0`, pertence à `MF5` e prepara `BK-MF5-07`.
- Rever `BK-MF5-03`, porque o feedback visual já deve receber erros através de `useActionFeedback`.
- Rever `BK-MF5-04`, porque as mensagens devem continuar legíveis, acessíveis e coerentes com `StatusMessage`.
- Rever `BK-MF5-05`, porque `formatMf5FormErrors` já centraliza mensagens de validação local.
- Rever `apps/web/src/lib/apiClient.ts`, confirmando `ApiError`, `status`, `code`, `message` e `credentials: "include"`.
- Rever `apps/web/src/App.tsx` e páginas `apps/web/src/pages/mf1Pages.tsx` a `mf4Pages.tsx`.

#### Glossário

- `ApiError`: erro lançado pelo cliente API quando a resposta HTTP não é bem-sucedida.
- `status`: código HTTP, por exemplo `400`, `401`, `403`, `404` ou `409`.
- `code`: identificador técnico controlado, por exemplo `VALIDATION_ERROR` ou `FORBIDDEN`.
- `message`: detalhe recebido da API ou de uma validação local.
- `mensagem de UI`: texto apresentado ao utilizador final.
- `próxima ação`: orientação concreta para resolver ou investigar o problema.
- `validação local`: validação feita no browser para evitar submissões claramente inválidas.
- `validação backend`: validação final feita na API, com permissões, empresa ativa e regras de domínio.
- `empresa ativa`: contexto empresarial resolvido no backend a partir da sessão autenticada.
- `smoke textual`: script curto que confirma contratos de ficheiros e exports sem precisar de abrir o browser.
- `handoff`: ponto de ligação entre este BK e o BK seguinte.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF06` exige mensagens de erro claras e com indicação de resolução.
- `CANONICO`: a MF5 melhora usabilidade, acessibilidade, validação e performance sem substituir regras de segurança do backend.
- `CANONICO`: o cliente API existente em `apps/web/src/lib/apiClient.ts` é a fronteira HTTP base da UI.
- `DERIVADO`: como `RNF06` é transversal, a solução vive em `apps/web/src/lib/mf5ErrorMessages.ts` e é reutilizada por `App.tsx` e páginas dedicadas.
- `DERIVADO`: este BK consome `formatMf5FormErrors` do `BK-MF5-05` para preservar a sequência técnica da MF5.
- `DERIVADO`: o smoke `test:mf5:errors` é a evidence mínima para provar que `RNF06` tem contrato textual verificável.

Uma mensagem de erro útil tem três partes. Primeiro, identifica o problema: por exemplo, o pedido falhou com `403` ou uma data não existe. Depois, mostra detalhe suficiente para o utilizador perceber a causa sem expor dados privados. Por fim, indica a próxima ação: rever campos, confirmar permissões, atualizar dados ou contactar a equipa com evidence.

No frontend, o objetivo é ajudar rapidamente. O browser pode validar formato de NIF, IBAN, datas, IVA ou contas SNC quando esses dados aparecem no formulário. No backend, a API continua a decidir permissões, empresa ativa, ownership, persistência, auditoria e regras de domínio. Isto evita que uma pessoa consiga contornar segurança por alterar a UI.

Em React, mensagens de erro aparecem normalmente em estado local ou num hook de feedback. Se cada página formatar erros de forma diferente, a app fica incoerente. Por isso este BK cria uma função comum: qualquer componente pode chamar `formatUiError(error)` e receber uma mensagem curta com causa e próxima ação.

Em testes, um smoke textual não substitui typecheck nem testes funcionais, mas confirma contratos que costumam partir depressa: exports, imports, nomes de scripts e integração com páginas. Para uma PAP, isto dá uma prova objetiva simples para PR e defesa.

#### Arquitetura do BK

- `apps/web/src/lib/apiClient.ts` continua a lançar `ApiError`.
- `apps/web/src/lib/mf5FormValidators.ts`, criado no `BK-MF5-05`, continua a formatar erros locais através de `formatMf5FormErrors`.
- `apps/web/src/lib/mf5ErrorMessages.ts` passa a transformar erros técnicos em mensagens claras de UI.
- `apps/web/src/App.tsx` passa a usar `formatUiError` no `formatError` global e `formatMf5ValidationUiError` nos erros locais.
- `apps/web/src/pages/mf1Pages.tsx` a `mf4Pages.tsx` passam a reutilizar o mesmo tradutor.
- `apps/web/scripts/check-mf5-error-messages.mjs` valida o contrato textual de `RNF06`.
- `apps/web/package.json` expõe `test:mf5:errors`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/lib/mf5ErrorMessages.ts`
- CRIAR: `apps/web/scripts/check-mf5-error-messages.mjs`
- EDITAR: `apps/web/src/App.tsx`
- EDITAR: `apps/web/src/pages/mf1Pages.tsx`
- EDITAR: `apps/web/src/pages/mf2Pages.tsx`
- EDITAR: `apps/web/src/pages/mf3Pages.tsx`
- EDITAR: `apps/web/src/pages/mf4Pages.tsx`
- EDITAR: `apps/web/package.json`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `apps/web/src/lib/mf5FormValidators.ts`

#### Tutorial técnico linear

### Passo 1 - Inventariar fontes de erro existentes

1. Objetivo funcional do passo no contexto da app.

Antes de escrever código, vais confirmar que formatos de erro já existem na UI. Este passo evita criar um segundo contrato incompatível com o cliente API e com o BK anterior.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/lib/apiClient.ts`
    - REVER: `apps/web/src/lib/mf5FormValidators.ts`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/pages/mf1Pages.tsx`
    - REVER: `apps/web/src/pages/mf2Pages.tsx`
    - REVER: `apps/web/src/pages/mf3Pages.tsx`
    - REVER: `apps/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: classe `ApiError`, função `formatMf5FormErrors`, função `formatError` e formatadores locais de erro.

3. Instruções do que fazer.

Confirma estes pontos:

- `ApiError` tem `status`, `code` e `message`.
- O cliente API usa `credentials: "include"`.
- `BK-MF5-05` entregou `formatMf5FormErrors(errors)`.
- `App.tsx` tem uma função `formatError`.
- As páginas dedicadas podem ter mensagens próprias com `error.message` ou `${error.code}: ${error.message}`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é analítico: serve para mapear contratos existentes antes de criar a função transversal.

5. Explicação do código.

Como não há código, a decisão importante é técnica: este BK não altera o contrato HTTP nem a validação final do backend. Ele lê os erros já existentes e melhora apenas a forma como são apresentados na UI.

6. Validação do passo.

Abre os ficheiros indicados e confirma que consegues apontar a origem de cada erro: API, validação local ou erro inesperado.

7. Cenário negativo/erro esperado.

Se começares por criar uma mensagem nova sem verificar `ApiError` e `formatMf5FormErrors`, podes perder `status`, `code` ou mensagens locais já validadas no BK anterior.

### Passo 2 - Criar o tradutor transversal de mensagens

1. Objetivo funcional do passo no contexto da app.

Criar uma única fonte de verdade para transformar erros em mensagens de UI claras, com causa, detalhe e próxima ação.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/mf5ErrorMessages.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro completo abaixo. Mantém as mensagens em português de Portugal e não adicionas dependências.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * @file Mensagens de erro MF5 em português claro para a UI OPSA.
 */

import { ApiError } from "./apiClient";
import type { FieldValidationError } from "./mf5FormValidators";
import { formatMf5FormErrors } from "./mf5FormValidators";

export type UiErrorSource = "api" | "validation" | "runtime";

export interface UiErrorMessage {
  title: string;
  detail: string;
  help: string;
  code?: string;
  status?: number;
  source: UiErrorSource;
}

const HELP_BY_CODE: Record<string, string> = {
  API_ERROR: "Tenta novamente. Se o problema continuar, guarda a evidence e envia à equipa técnica.",
  CONFLICT: "Atualiza os dados e confirma se outro utilizador alterou o mesmo registo.",
  FORBIDDEN: "Confirma se tens permissão para executar esta ação na empresa ativa.",
  INVALID_DATE: "Confirma se a data está no formato AAAA-MM-DD e se existe no calendário.",
  INVALID_IBAN: "Confirma se o IBAN começa por PT50 e se foi copiado sem espaços indevidos.",
  INVALID_NIF: "Confirma se o NIF tem 9 algarismos e pertence à entidade correta.",
  INVALID_SNC_ACCOUNT: "Confirma se a conta SNC tem apenas algarismos e corresponde ao plano de contas usado.",
  INVALID_VAT: "Confirma se a taxa de IVA selecionada é válida para este formulário.",
  NOT_FOUND: "Atualiza a lista e confirma se o registo ainda existe no contexto atual.",
  UNAUTHORIZED: "Inicia sessão novamente e repete a ação.",
  VALIDATION_ERROR: "Revê os campos do formulário antes de voltar a submeter.",
};

/**
 * Garante que um valor capturado em catch é tratado como erro seguro.
 *
 * @param error - Valor capturado durante uma operação da UI.
 * @returns Erro nativo ou erro da API.
 */
function normalizeCaughtError(error: unknown): Error | ApiError {
  if (error instanceof ApiError || error instanceof Error) {
    return error;
  }

  // Valores não-Error podem surgir de bibliotecas ou código legado; aqui passam a ter mensagem controlada.
  return new Error("Erro inesperado na interface.");
}

/**
 * Infere orientação para mensagens locais criadas pelo BK-MF5-05.
 *
 * @param detail - Mensagem agregada de validação local.
 * @returns Próxima ação adequada ao campo provável.
 */
function inferHelpFromValidationDetail(detail: string) {
  const normalized = detail.toLowerCase();

  if (normalized.includes("nif")) {
    return HELP_BY_CODE.INVALID_NIF;
  }

  if (normalized.includes("iban")) {
    return HELP_BY_CODE.INVALID_IBAN;
  }

  if (normalized.includes("data")) {
    return HELP_BY_CODE.INVALID_DATE;
  }

  if (normalized.includes("iva")) {
    return HELP_BY_CODE.INVALID_VAT;
  }

  if (normalized.includes("snc") || normalized.includes("conta")) {
    return HELP_BY_CODE.INVALID_SNC_ACCOUNT;
  }

  return HELP_BY_CODE.VALIDATION_ERROR;
}

/**
 * Formata uma mensagem estruturada para componentes que ainda recebem texto simples.
 *
 * @param message - Mensagem estruturada de UI.
 * @returns Texto curto com causa e próxima ação.
 */
function formatUiMessage(message: UiErrorMessage) {
  const technicalContext = [message.status ? `HTTP ${message.status}` : null, message.code].filter(Boolean).join(" ");
  const prefix = technicalContext ? `${message.title} (${technicalContext})` : message.title;

  // O detalhe vem antes da ajuda para o utilizador saber o que falhou antes de tentar corrigir.
  return `${prefix}: ${message.detail} ${message.help}`;
}

/**
 * Converte erros de validação local do BK-MF5-05 para mensagem clara de UI.
 *
 * @param errors - Erros devolvidos pelos validadores MF5.
 * @returns Mensagem com detalhe e próxima ação.
 */
export function toUiValidationError(errors: FieldValidationError[]): UiErrorMessage {
  const detail = formatMf5FormErrors(errors);

  return {
    title: "Validação do formulário",
    detail,
    help: inferHelpFromValidationDetail(detail),
    code: "VALIDATION_ERROR",
    source: "validation",
  };
}

/**
 * Converte erros técnicos em mensagens úteis para o utilizador.
 *
 * @param error - Erro capturado durante uma chamada de API ou execução local.
 * @returns Mensagem estruturada para apresentação na UI.
 */
export function toUiErrorMessage(error: unknown): UiErrorMessage {
  const normalized = normalizeCaughtError(error);

  if (normalized instanceof ApiError) {
    return {
      title: "Erro da API",
      detail: normalized.message,
      help: HELP_BY_CODE[normalized.code] ?? HELP_BY_CODE.API_ERROR,
      code: normalized.code,
      status: normalized.status,
      source: "api",
    };
  }

  return {
    title: "Erro inesperado",
    detail: normalized.message,
    help: "Recarrega a página e confirma se os dados continuam válidos antes de repetir a ação.",
    source: "runtime",
  };
}

/**
 * Formata erros locais vindos dos validadores MF5.
 *
 * @param errors - Erros devolvidos por validateMf5Form ou validateMf5FormData.
 * @returns Texto pronto a apresentar no feedback do formulário.
 */
export function formatMf5ValidationUiError(errors: FieldValidationError[]) {
  return formatUiMessage(toUiValidationError(errors));
}

/**
 * Formata erros da API ou erros inesperados para componentes que recebem texto.
 *
 * @param error - Erro capturado pela UI.
 * @returns Texto pronto a apresentar no feedback do ecrã.
 */
export function formatUiError(error: unknown) {
  return formatUiMessage(toUiErrorMessage(error));
}
```

5. Explicação do código.

Este ficheiro separa erro técnico de mensagem de UI. `HELP_BY_CODE` mantém orientações para códigos conhecidos. `normalizeCaughtError` evita que valores estranhos capturados num `catch` cheguem ao utilizador sem controlo. `toUiValidationError` consome `formatMf5FormErrors`, preservando o contrato do `BK-MF5-05` em vez de duplicar mensagens locais.

Os dados que entram são erros vindos da API, erros nativos ou listas de `FieldValidationError`. Os dados que saem são mensagens com `title`, `detail`, `help`, `code`, `status` e `source`. A regra de segurança é simples: o frontend melhora feedback, mas não decide permissão, empresa ativa, ownership nem persistência.

6. Validação do passo.

Confirma que o ficheiro exporta `toUiErrorMessage`, `formatUiError`, `toUiValidationError` e `formatMf5ValidationUiError`. Confirma também que o import de `formatMf5FormErrors` aponta para `./mf5FormValidators`.

7. Cenário negativo/erro esperado.

Um erro `FORBIDDEN` deve indicar falta de permissão na empresa ativa. Um erro local de NIF deve indicar que o NIF deve ter 9 algarismos. Um erro com código desconhecido deve continuar a mostrar detalhe e ajuda genérica, nunca texto vazio.

### Passo 3 - Integrar erros locais do BK-MF5-05 no formulário genérico

1. Objetivo funcional do passo no contexto da app.

Garantir que as mensagens de validação local criadas no `BK-MF5-05` passam pelo tradutor de `RNF06`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: imports no topo e função completa `handleSubmit` dentro de `OperationForm`.

3. Instruções do que fazer.

Adiciona o import de `formatMf5ValidationUiError` e substitui a função `handleSubmit` de `OperationForm` pela versão completa abaixo, mantendo o restante componente igual.

4. Código completo, correto e integrado com a app final.

```tsx
import { formatMf5ValidationUiError, formatUiError } from "./lib/mf5ErrorMessages";
import { toPrimitiveValidationValues, validateMf5Form } from "./lib/mf5FormValidators";

/**
 * Submete a operação apenas depois de validar campos críticos no frontend.
 *
 * @param event - Evento do formulário submetido.
 * @returns Promise resolvida depois de processar a submissão.
 */
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const formElement = event.currentTarget;
  action.start("A validar dados do formulário...");

  try {
    const values = normalizeFormValues(operation.fields, new FormData(formElement));
    const validationErrors = validateMf5Form(toPrimitiveValidationValues(values));

    if (validationErrors.length > 0) {
      // O BK-MF5-06 acrescenta próxima ação sem apagar as mensagens criadas no BK-MF5-05.
      action.fail(new Error(formatMf5ValidationUiError(validationErrors)));
      return;
    }

    const result = await operation.run(values);
    await operation.afterSuccess?.();
    await onDone(result);
    formElement.reset();
    action.succeed("Dados guardados e lista atualizada.");
  } catch (caught) {
    // Mesmo quando a API lança ApiError, o texto passa por RNF06 antes de chegar ao feedback visual.
    const error = new Error(formatUiError(caught));
    action.fail(error, "Não foi possível guardar os dados.");
  }
}
```

5. Explicação do código.

`validateMf5Form` continua a vir do `BK-MF5-05`. A diferença deste BK é a chamada a `formatMf5ValidationUiError`, que transforma a lista de erros em mensagem com detalhe e próxima ação. O `catch` cria sempre um novo `Error` com `formatUiError(caught)`, incluindo quando `caught` é `ApiError`. Isto é importante porque `ApiError` também é `Error`; se o código usasse apenas `caught instanceof Error`, a UI podia mostrar só a mensagem técnica da API e perder a ajuda de resolução definida neste BK.

Este código mantém o contrato de `useActionFeedback`: `action.fail` recebe `Error`. A API continua a validar tudo no backend, incluindo permissões, empresa ativa, regras de domínio e auditoria.

6. Validação do passo.

Submete um formulário com NIF inválido e confirma que aparece uma mensagem com causa e orientação. Depois submete dados válidos e confirma que a chamada normal continua a funcionar.

7. Cenário negativo/erro esperado.

Se a mensagem local aparecer apenas como lista de campos sem orientação, `RNF06` ainda não está cumprido. Se `action.fail` receber uma string direta, o contrato do BK-MF5-03 fica enfraquecido.

### Passo 4 - Substituir `formatError` global em `App.tsx`

1. Objetivo funcional do passo no contexto da app.

Aplicar a normalização de erro a todos os fluxos genéricos que chamam `formatError`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: função completa `formatError`.

3. Instruções do que fazer.

Substitui a função `formatError` antiga pela versão abaixo. Se o import de `formatUiError` já foi adicionado no passo anterior, não o dupliques.

4. Código completo, correto e integrado com a app final.

```tsx
/**
 * Converte erros da API ou erros nativos numa mensagem curta para apresentar ao utilizador.
 *
 * @param error - Erro capturado durante a operação.
 * @returns Mensagem de erro pronta a apresentar ao utilizador.
 */
function formatError(error: unknown): string {
  return formatUiError(error);
}
```

5. Explicação do código.

Antes, a UI podia mostrar apenas `code` e `message`. Agora, `formatError` delega no tradutor transversal. Como `OperationForm`, `ResourcePanel` e outros fluxos genéricos já chamam `formatError`, a melhoria propaga-se sem repetir lógica em cada componente.

6. Validação do passo.

Provoca um erro de API com `FORBIDDEN`, `VALIDATION_ERROR` ou `NOT_FOUND` e confirma que a mensagem inclui o detalhe e uma próxima ação.

7. Cenário negativo/erro esperado.

Se a UI continuar a mostrar apenas `${error.code}: ${error.message}`, o utilizador recebe uma mensagem técnica sem orientação suficiente para resolver o problema.

### Passo 5 - Aplicar mensagens claras nas páginas dedicadas MF1 a MF4

1. Objetivo funcional do passo no contexto da app.

Garantir que páginas dedicadas não ficam com formatadores de erro diferentes do resto da app.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/mf1Pages.tsx`
    - EDITAR: `apps/web/src/pages/mf2Pages.tsx`
    - EDITAR: `apps/web/src/pages/mf3Pages.tsx`
    - EDITAR: `apps/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: imports no topo e função local que formata erro em cada ficheiro.

3. Instruções do que fazer.

Em cada uma das páginas dedicadas, importa `formatUiError` e substitui a função local `formatError` pela versão indicada para esse ficheiro. Mantém os restantes imports e componentes existentes.

4. Código completo, correto e integrado com a app final.

Em `apps/web/src/pages/mf1Pages.tsx`, substitui os imports de erro e a função `formatError` por:

```tsx
import { JsonBody } from "../lib/apiClient";
import { formatUiError } from "../lib/mf5ErrorMessages";

/**
 * Converte erros de MF1 numa mensagem clara para o utilizador.
 *
 * @param error - Erro capturado durante listagem, submissão ou atualização.
 * @returns Mensagem de erro com causa e próxima ação.
 */
function formatError(error: unknown): string {
  // MF1 usa o tradutor comum para não voltar a mostrar apenas "CODE: mensagem".
  return formatUiError(error);
}
```

Em `apps/web/src/pages/mf2Pages.tsx`, substitui os imports de erro e a função `formatError` por:

```tsx
import { apiClient, JsonBody } from "../lib/apiClient";
import { formatUiError } from "../lib/mf5ErrorMessages";

/**
 * Converte erros de MF2 numa mensagem clara para o utilizador.
 *
 * @param error - Erro capturado durante operações de inventário, FIFO ou relatórios.
 * @returns Mensagem de erro com causa e próxima ação.
 */
function formatError(error: unknown): string {
  // O detalhe financeiro continua validado no backend; a UI só melhora a orientação do erro.
  return formatUiError(error);
}
```

Em `apps/web/src/pages/mf3Pages.tsx`, substitui os imports de erro e a função `formatError` por:

```tsx
import { apiClient, JsonBody } from "../lib/apiClient";
import { formatUiError } from "../lib/mf5ErrorMessages";

/**
 * Converte erros de MF3 numa mensagem clara para o utilizador.
 *
 * @param error - Erro capturado em tesouraria, importações, SAF-T, relatórios ou KPIs.
 * @returns Mensagem de erro com causa e próxima ação.
 */
function formatError(error: unknown): string {
  // Importações e relatórios precisam de erro claro sem expor dados financeiros desnecessários.
  return formatUiError(error);
}
```

Em `apps/web/src/pages/mf4Pages.tsx`, substitui os imports de erro e a função `formatError` por:

```tsx
import { JsonBody } from "../lib/apiClient";
import { formatUiError } from "../lib/mf5ErrorMessages";

/**
 * Converte erros de MF4 numa mensagem clara para o utilizador.
 *
 * @param error - Erro capturado em IA assistiva, lembretes, tarefas, notificações ou auditoria.
 * @returns Mensagem de erro com causa e próxima ação.
 */
function formatError(error: unknown): string {
  // A IA continua apenas recomendação explicável; a mensagem não transforma erro em ação automática.
  return formatUiError(error);
}
```

5. Explicação do código.

As páginas `MF1` a `MF4` podem ter componentes próprios, mas não devem ter regras próprias para explicar erros. Por isso, cada ficheiro mantém a função local `formatError`, que já é chamada pelos `catch` existentes, mas essa função passa a delegar no tradutor comum `formatUiError`.

Não há nova regra de domínio aqui. A página só melhora a mensagem. O backend continua a rejeitar ações sem permissão, dados inválidos e operações fora do contexto correto. A alteração remove a dependência direta de `ApiError` nos ficheiros de página porque a tradução técnica passa a estar centralizada em `mf5ErrorMessages.ts`.

6. Validação do passo.

Em cada ficheiro, procura formatações antigas baseadas em `error.message` ou `${error.code}: ${error.message}` e confirma que a função local `formatError` devolve `formatUiError(error)`.

7. Cenário negativo/erro esperado.

Se uma página dedicada continuar a mostrar `FORBIDDEN: ...` sem próxima ação, a app fica incoerente: o formulário genérico cumpre `RNF06`, mas esse módulo não.

### Passo 6 - Criar smoke textual para RNF06

1. Objetivo funcional do passo no contexto da app.

Criar um comando rápido que confirme a existência dos contratos principais deste BK.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/scripts/check-mf5-error-messages.mjs`
    - EDITAR: `apps/web/package.json`
    - LOCALIZAÇÃO: ficheiro completo do script e chave `scripts` do `package.json`.

3. Instruções do que fazer.

Cria o script completo e adiciona o comando `test:mf5:errors`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual para contratos de mensagens de erro MF5.
 */

import { readFile } from "node:fs/promises";

const files = {
  app: new URL("../src/App.tsx", import.meta.url),
  mf1: new URL("../src/pages/mf1Pages.tsx", import.meta.url),
  mf2: new URL("../src/pages/mf2Pages.tsx", import.meta.url),
  mf3: new URL("../src/pages/mf3Pages.tsx", import.meta.url),
  mf4: new URL("../src/pages/mf4Pages.tsx", import.meta.url),
  messages: new URL("../src/lib/mf5ErrorMessages.ts", import.meta.url),
  packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Falha o processo quando um contrato textual esperado não existe.
 *
 * @param content - Conteúdo do ficheiro.
 * @param expected - Texto que deve existir.
 * @param label - Descrição do contrato validado.
 */
function assertIncludes(content, expected, label) {
  if (!content.includes(expected)) {
    throw new Error(`Contrato MF5 em falta: ${label}`);
  }
}

const [messages, app, mf1, mf2, mf3, mf4, packageJson] = await Promise.all([
  readFile(files.messages, "utf8"),
  readFile(files.app, "utf8"),
  readFile(files.mf1, "utf8"),
  readFile(files.mf2, "utf8"),
  readFile(files.mf3, "utf8"),
  readFile(files.mf4, "utf8"),
  readFile(files.packageJson, "utf8"),
]);

assertIncludes(messages, "formatMf5FormErrors", "reutiliza mensagens locais do BK-MF5-05");
assertIncludes(messages, "formatMf5ValidationUiError", "exporta formatador de validação local");
assertIncludes(messages, "formatUiError", "exporta formatador transversal");
assertIncludes(messages, "FORBIDDEN", "tem orientação para permissões");
assertIncludes(messages, "INVALID_NIF", "tem orientação para NIF");
assertIncludes(app, "formatMf5ValidationUiError", "OperationForm usa mensagens locais melhoradas");
assertIncludes(app, "formatUiError", "App usa formatador transversal");
assertIncludes(`${mf1}${mf2}${mf3}${mf4}`, "formatUiError", "páginas dedicadas usam RNF06");
assertIncludes(packageJson, "\"test:mf5:errors\"", "package expõe comando RNF06");

// O output é curto para poder ser usado diretamente como evidence de PR.
console.log("MF5 error messages smoke OK");
```

No `package.json`, acrescenta o script:

```json
{
  "scripts": {
    "test:mf5:errors": "node scripts/check-mf5-error-messages.mjs"
  }
}
```

5. Explicação do código.

O script lê os ficheiros que este BK cria ou altera e procura contratos textuais. Ele confirma que `mf5ErrorMessages.ts` reutiliza `formatMf5FormErrors`, que `App.tsx` consome os novos formatadores e que as páginas dedicadas importam `formatUiError`.

Este smoke não substitui `typecheck`, mas apanha regressões simples: export removido, script esquecido ou integração incompleta. A chamada `Promise.all` lê ficheiros em paralelo e falha com mensagem clara quando um contrato está ausente.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run test:mf5:errors
```

O output esperado é:

```text
MF5 error messages smoke OK
```

7. Cenário negativo/erro esperado.

Remove temporariamente o import de `formatUiError` de uma página dedicada e volta a executar o smoke. O comando deve falhar com `Contrato MF5 em falta`.

### Passo 7 - Validar erros conhecidos e erros desconhecidos

1. Objetivo funcional do passo no contexto da app.

Confirmar manualmente que a mensagem é útil tanto para erros previstos como para erros inesperados.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/lib/mf5ErrorMessages.ts`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/pages/mf1Pages.tsx`
    - REVER: `apps/web/src/pages/mf2Pages.tsx`
    - REVER: `apps/web/src/pages/mf3Pages.tsx`
    - REVER: `apps/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: mensagens apresentadas em estados de erro.

3. Instruções do que fazer.

Testa estes casos:

- erro local de NIF inválido;
- erro local de data impossível;
- erro de API com `FORBIDDEN`;
- erro de API com `NOT_FOUND`;
- erro de API com código não mapeado;
- erro nativo lançado por código da UI.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação manual e comportamental, depois dos ficheiros já estarem implementados.

5. Explicação do código.

Como a app tem formulários e páginas diferentes, não basta validar só uma função. Este passo confirma comportamento observável: o utilizador vê causa e próxima ação em todos os fluxos principais. Também confirma que códigos desconhecidos continuam a ter fallback honesto.

6. Validação do passo.

Regista para cada caso: ação executada, mensagem apresentada, se a API foi chamada, e se a próxima ação ficou clara. Guarda um screenshot ou gravação curta para PR/defesa.

7. Cenário negativo/erro esperado.

Se um código desconhecido produzir mensagem vazia, a função de fallback está errada. Se um erro de permissão disser ao utilizador para alterar dados do formulário, a ajuda está enganadora.

### Passo 8 - Executar validação final e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com validação técnica, evidence e ligação segura ao `BK-MF5-07`.

2. Ficheiros envolvidos:
    - REVER: `apps/web/package.json`
    - REVER: `apps/web/src/lib/mf5ErrorMessages.ts`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/pages/mf1Pages.tsx`
    - REVER: `apps/web/src/pages/mf2Pages.tsx`
    - REVER: `apps/web/src/pages/mf3Pages.tsx`
    - REVER: `apps/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: comandos de validação e evidence final.

3. Instruções do que fazer.

Executa os comandos abaixo depois de aplicar o BK no código:

```bash
cd apps/web
npm run typecheck
npm run test:mf1
npm run test:mf2
npm run test:mf3
npm run test:mf5:forms
npm run test:mf5:errors
```

Se algum comando falhar, lê a primeira falha real, corrige imports ou contratos quebrados e repete apenas os comandos afetados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha validação e handoff; o código principal já foi criado nos passos anteriores.

5. Explicação do código.

`typecheck` confirma integração TypeScript. Os testes MF1 a MF3 protegem módulos anteriores. `test:mf5:forms` confirma o contrato de validação local do BK anterior. `test:mf5:errors` confirma o contrato de mensagens claras criado neste BK.

O handoff para `BK-MF5-07` é importante porque performance também precisa de erros claros. Se uma listagem demorar, falhar ou ficar vazia, a UI deve explicar o estado sem esconder a causa técnica controlada.

6. Validação do passo.

Guarda o output dos comandos, screenshot ou gravação de um erro local, screenshot ou gravação de um erro de API e lista de ficheiros alterados.

7. Cenário negativo/erro esperado.

Se `test:mf5:errors` passar mas `typecheck` falhar, o smoke textual não é suficiente. Corrige o erro TypeScript antes de avançar para `BK-MF5-07`.

#### Critérios de aceite

- `apps/web/src/lib/mf5ErrorMessages.ts` existe e exporta `toUiErrorMessage`, `formatUiError`, `toUiValidationError` e `formatMf5ValidationUiError`.
- `formatMf5FormErrors` do `BK-MF5-05` é reutilizado.
- `App.tsx` deixa de formatar erros apenas como texto técnico.
- `OperationForm` mantém `action.fail(new Error(...))`.
- Páginas `MF1` a `MF4` usam `formatUiError` ou uma função local que delega nela.
- O package expõe `test:mf5:errors`.
- O smoke devolve `MF5 error messages smoke OK`.
- Erros conhecidos têm causa e próxima ação.
- Erros desconhecidos têm fallback claro.
- O frontend não passa a decidir permissões, empresa ativa, ownership, persistência ou auditoria.
- Não são criados endpoints, modelos Prisma, migrations, services ou controllers novos.

#### Validação final

Executar depois de aplicar o BK no código:

```bash
cd apps/web
npm run typecheck
npm run test:mf1
npm run test:mf2
npm run test:mf3
npm run test:mf5:forms
npm run test:mf5:errors
```

Expected results:

- `npm run typecheck`: termina sem erros TypeScript.
- `npm run test:mf1`: passa sem regressões nos fluxos de MF1.
- `npm run test:mf2`: passa sem regressões nos fluxos de MF2.
- `npm run test:mf3`: passa sem regressões nos fluxos de MF3.
- `npm run test:mf5:forms`: devolve `MF5 form validation smoke OK`.
- `npm run test:mf5:errors`: devolve `MF5 error messages smoke OK`.

Cenários manuais mínimos:

- NIF inválido: mensagem indica 9 algarismos.
- IBAN inválido: mensagem indica prefixo e formato esperado.
- Data impossível: mensagem indica data inexistente.
- Permissão insuficiente: mensagem indica falta de permissão na empresa ativa.
- Registo removido ou inacessível: mensagem indica atualizar lista e confirmar contexto.
- Erro desconhecido: mensagem mantém detalhe e ajuda genérica.

#### Evidence para PR/defesa

- Output de `npm run typecheck`.
- Output de `npm run test:mf5:forms`.
- Output de `npm run test:mf5:errors`.
- Screenshot ou gravação curta de erro local de formulário.
- Screenshot ou gravação curta de erro de API.
- Lista de ficheiros alterados.
- Nota curta: "`RNF06` foi implementado com mensagens de erro claras, preservando `status`, `code`, validação backend e contexto de empresa ativa."

#### Handoff

- Próximo BK: `BK-MF5-07`.
- Mantém `formatUiError` como função transversal para erros de carregamento e performance.
- Mantém `formatMf5ValidationUiError` ligado a `formatMf5FormErrors`.
- Não removas `status` nem `code`; eles ajudam a depurar regressões.
- Não movas permissões, empresa ativa, ownership, persistência ou auditoria para a UI.
- Se o `BK-MF5-07` criar estados de timeout, lista vazia ou carregamento lento, deve reutilizar o padrão de mensagem clara deste BK.

#### Changelog

- `2026-06-20`: corrige o guia para 8 passos, integração com `formatMf5FormErrors`, cobertura das páginas dedicadas MF1-MF4, smoke `test:mf5:errors`, validação final e handoff para `BK-MF5-07`.
- `2026-06-18`: documenta a normalização de mensagens de erro para causa e próxima ação em português.
- `2026-04-17`: guia migrado para naming com slug e template pedagógico-operacional inicial.
