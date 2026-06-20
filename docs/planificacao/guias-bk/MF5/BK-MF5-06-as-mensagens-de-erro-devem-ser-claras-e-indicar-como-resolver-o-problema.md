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
- `last_updated`: `2026-06-18`

#### Objetivo

Neste BK vais implementar as mensagens de erro devem ser claras e indicar como resolver o problema. O resultado final é uma melhoria transversal da app OPSA, sem criar endpoints novos nem alterar regras de domínio financeiro.

#### Importância

Uma mensagem técnica sem orientação transforma um erro corrigível num bloqueio para o utilizador.

#### Scope-in

- normalizar mensagens de erro de API e validação local para explicar causa e próxima ação.
- Manter React, Vite, TypeScript e o cliente API existente.
- Produzir evidence observável para PR e defesa PAP.
- Preservar autenticação por cookie HttpOnly e validação backend.

#### Scope-out

- Criar novas regras fiscais, contabilísticas ou legais.
- Criar ORM, endpoints backend ou modelos Prisma novos para RNF01-RNF07.
- Trocar a stack frontend ou adicionar dependências de UI.
- Alterar RF/RNF, backlog, matriz ou ownership dos BKs.

#### Estado antes e depois

- Antes: erros técnicos podem chegar à UI sem causa e próxima ação suficientemente claras.
- Depois: a UI traduz erros conhecidos para mensagens úteis em português, sem esconder `status`, `code` e regras de segurança.

#### Pre-requisitos

- Ler `RNF06` em `docs/RNF.md`.
- Rever `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar que `real_dev/web/src/lib/apiClient.ts` usa `credentials: "include"`.
- Confirmar que o backend continua responsável por permissões, empresa ativa, validação final e auditoria de operações sensíveis.

#### Glossário

- `UX`: experiência de utilização; mede clareza, previsibilidade e facilidade de completar tarefas.
- `UI`: interface visual com que o utilizador interage.
- `Feedback imediato`: resposta visível da aplicação quando uma ação começa, termina ou falha.
- `Estado de loading`: indicação de que a aplicação está a trabalhar e ainda não há resultado final.
- `Estado empty`: ecrã sem dados, apresentado de forma controlada.
- `Empresa ativa`: contexto empresarial resolvido pela sessão no backend.
- `Validação frontend`: ajuda rápida no browser antes da submissão.
- `Validação backend`: regra final de segurança e domínio aplicada pela API.
- `Evidence`: prova objetiva para PR ou defesa, como output de comando, screenshot ou comportamento observado.

#### Conceitos teóricos essenciais

- `CANONICO`: RNF01 a RNF07 definem a MF5 como camada transversal de usabilidade, acessibilidade e performance.
- `CANONICO`: a stack validada é React, Vite e TypeScript em `real_dev/web`, com API Express em `real_dev/api`.
- `CANONICO`: o cliente HTTP existente usa cookies HttpOnly com `credentials: "include"`; o frontend não guarda credenciais no browser.
- `DERIVADO`: os artefactos MF5 são componentes, utilitários e scripts de verificação porque os requisitos RNF01-RNF07 não exigem novas entidades Prisma.
- Neste BK, o foco é normalizar mensagens de erro de API e validação local para explicar causa e próxima ação.
- Um componente React recebe dados por props e devolve UI previsível; isso evita repetir marcação diferente em cada módulo.
- Um hook React concentra estado reutilizável; isso reduz bugs quando várias páginas precisam do mesmo comportamento.
- Um script textual de smoke confirma contratos simples e rápidos antes da defesa.
- Segurança continua no backend: permissões, empresa ativa, ownership e dados financeiros não são decididos por CSS nem por componentes React.

#### Arquitetura do BK

- `real_dev/web/src/App.tsx` continua a compor navegação, autenticação e painéis genéricos.
- `real_dev/web/src/lib/apiClient.ts` continua a ser o único cliente HTTP base.
- `real_dev/web/src/ui/*` passa a concentrar componentes transversais criados pela MF5.
- `real_dev/web/src/lib/mf5*.ts` concentra utilitários de validação, erro e performance.
- `real_dev/web/scripts/check-mf5-*.mjs` guarda smoke checks textuais para evidence.
- O handoff deste BK prepara `BK-MF5-07`.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/web/src/lib/mf5ErrorMessages.ts`
- EDITAR: `real_dev/web/src/App.tsx`
- REVER: `real_dev/web/src/lib/apiClient.ts`

#### Tutorial técnico linear

### Passo 1 - Inventariar erros existentes

1. Objetivo funcional do passo no contexto da app.

Perceber que formato a API já devolve.

`ApiError` já guarda `status`, `code` e `message`. Este BK não muda a API; apenas melhora a apresentação no frontend.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/lib/apiClient.ts`
    - REVER: `real_dev/web/src/App.tsx`
    - LOCALIZAÇÃO: classe `ApiError` e função `formatError`

3. Instruções do que fazer.

Anota os códigos frequentes observados nos validators e services já criados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e prepara a alteração técnica seguinte.

5. Explicação do código.

Este passo evita duplicar o contrato de erro. A fonte técnica continua a ser `ApiError`; a MF5 acrescenta texto útil para resolver o problema.

6. Validação do passo.

Confirma que `ApiError` tem `status`, `code` e `message`.

7. Cenário negativo/erro esperado.

Se o frontend esconder `code`, a equipa perde evidence para depurar erros reais.

### Passo 2 - Criar tradutor de erros para UI

1. Objetivo funcional do passo no contexto da app.

Dar causa e ação recomendada em português claro.

Cria um módulo que transforma erro técnico em mensagem de UI.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/lib/mf5ErrorMessages.ts`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Copia o ficheiro completo.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * @file Mensagens de erro MF5 em português claro para a UI OPSA.
 */

import { ApiError } from "./apiClient";

const HELP_BY_CODE: Record<string, string> = {
  INVALID_NIF: "Confirma se o NIF tem 9 algarismos e pertence à entidade certa.",
  INVALID_DATE: "Confirma se a data está no formato AAAA-MM-DD e dentro do período permitido.",
  VALIDATION_ERROR: "Revê os campos assinalados antes de voltar a submeter.",
  FORBIDDEN: "A tua função não permite executar esta ação nesta empresa.",
  NOT_FOUND: "Confirma se o registo ainda existe e se pertence ao contexto ativo.",
};

export interface UiErrorMessage {
  title: string;
  detail: string;
  help: string;
}

/**
 * Normaliza valores capturados em `catch` para erro seguro.
 *
 * @param error - Valor capturado durante a operação.
 * @returns Erro nativo ou erro da API.
 */
function normalizeCaughtError(error: unknown): Error | ApiError {
  if (error instanceof ApiError || error instanceof Error) return error;
  return new Error("Erro inesperado");
}

/**
 * Converte erros técnicos em mensagens úteis para o utilizador final.
 *
 * @param error - Erro capturado durante uma chamada de API ou validação local.
 * @returns Mensagem com título, detalhe e ação recomendada.
 */
export function toUiErrorMessage(error: unknown): UiErrorMessage {
  const normalized = normalizeCaughtError(error);

  if (normalized instanceof ApiError) {
    return {
      title: `Erro ${normalized.status}`,
      detail: normalized.message,
      help: HELP_BY_CODE[normalized.code] ?? "Tenta novamente e regista evidence se o problema continuar.",
    };
  }

  return {
    title: "Erro inesperado",
    detail: normalized.message,
    help: "Recarrega a página e confirma se os dados introduzidos continuam válidos.",
  };
}

/**
 * Formata a mensagem para componentes que ainda recebem texto simples.
 *
 * @param error - Erro capturado.
 * @returns Texto curto com causa e próxima ação.
 */
export function formatUiError(error: unknown) {
  const message = toUiErrorMessage(error);
  // A ação recomendada fica junto da causa para o aluno testar o erro negativo sem adivinhar.
  return `${message.title}: ${message.detail} ${message.help}`;
}
```

5. Explicação do código.

O mapa `HELP_BY_CODE` adiciona orientação sem alterar o erro original. O utilizador vê o que aconteceu e como tentar resolver. Códigos não previstos recebem ajuda genérica, mas continuam a mostrar detalhe técnico controlado.

6. Validação do passo.

Um erro `INVALID_NIF` deve mencionar a correção do NIF.

7. Cenário negativo/erro esperado.

Um erro sem código conhecido deve continuar a ter mensagem útil, não texto vazio.

### Passo 3 - Substituir `formatError`

1. Objetivo funcional do passo no contexto da app.

Aplicar a normalização em todos os formulários que usam `OperationForm` e `ResourcePanel`.

Atualiza a função `formatError` em `App.tsx`.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/App.tsx`
    - LOCALIZAÇÃO: import no topo e função completa `formatError`

3. Instruções do que fazer.

Acrescenta o import e substitui a função.

4. Código completo, correto e integrado com a app final.

```tsx
import { formatUiError } from "./lib/mf5ErrorMessages";

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

Como `formatError` é chamado pelos fluxos genéricos, a melhoria propaga-se a vários módulos sem duplicação. O BK-MF5-03 continua a controlar o estado visual; este BK melhora o texto.

6. Validação do passo.

Provoca erro de validação e confirma que a mensagem inclui causa e próxima ação.

7. Cenário negativo/erro esperado.

Se a mensagem disser apenas `Erro inesperado` para todos os casos, RNF06 não está cumprido.

#### Critérios de aceite

- `RNF06` fica coberto por alteração concreta no frontend ou por smoke textual explícito.
- O guia preserva os artefactos criados nos BKs anteriores da MF5.
- O frontend continua a usar o cliente API existente e cookies HttpOnly.
- Erros, loading, sucesso e estado vazio são visíveis e compreensíveis.
- O aluno consegue seguir o BK sem inventar ficheiros, imports ou comandos.
- Nenhuma regra de negócio passa a ser decidida apenas no frontend.

#### Validação final

- Executar `cd real_dev/web && npm run typecheck` depois de aplicar o BK no código.
- Executar os smoke checks MF1/MF2/MF3 já existentes para garantir que a UI transversal não quebrou módulos anteriores.
- Executar o smoke MF5 indicado neste BK ou nos BKs seguintes.
- Testar cenário positivo e cenário negativo descritos nos passos.

#### Evidence para PR/defesa

- Screenshot ou gravação curta do ecrã antes/depois.
- Output do comando de typecheck ou smoke textual.
- Descrição do cenário negativo e da mensagem apresentada.
- Lista de ficheiros alterados e ligação ao RNF.

#### Handoff

- Próximo BK: `BK-MF5-07`.
- Mantém os nomes de ficheiros e exports exatamente como ficaram neste guia.
- Se o typecheck falhar, corrige imports antes de continuar para o próximo BK.
- Se uma regra de domínio parecer em falta, valida no backend e não resolvas apenas com UI.

#### Changelog

- `2026-06-18`: documenta a normalização de mensagens de erro para causa e próxima ação em português.
- `2026-04-17`: guia migrado para naming com slug e template pedagógico-operacional inicial.
