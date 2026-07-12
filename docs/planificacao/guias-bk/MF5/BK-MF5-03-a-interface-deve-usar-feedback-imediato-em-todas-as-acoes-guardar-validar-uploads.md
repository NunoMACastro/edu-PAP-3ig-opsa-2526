# BK-MF5-03 - A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads).

## Header
- `doc_id`: `GUIA-BK-MF5-03`
- `bk_id`: `BK-MF5-03`
- `macro`: `MF5`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF03`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-04`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-03-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-validar-uploads.md`
- `last_updated`: `2026-07-10`

#### Contrato de pedidos e preservação atualizado

O cliente HTTP comum aplica timeout e `AbortSignal`, cancela leituras obsoletas e nunca repete automaticamente mutações. Em `401`, o `AuthProvider` limpa a sessão e encaminha para login com apenas um `returnTo` interno validado. Em `400`, `409` ou `500`, o formulário mantém valores e erros; só é limpo depois de sucesso confirmado. Uploads usam file picker e `FormData`, com progresso/estado acessível, sem serializar ficheiros no JSON.

#### Objetivo

Neste BK vais implementar feedback imediato em todas as ações assíncronas relevantes da interface OPSA: guardar, validar, atualizar listas, pesquisar e importar dados. O resultado final é uma experiência mais previsível, em que o utilizador sabe quando a operação começou, quando terminou com sucesso e quando falhou.

#### Importância

Uma ação sem feedback cria incerteza: o utilizador pode repetir cliques, pensar que a aplicação bloqueou ou não perceber que precisa de corrigir dados. Em contexto financeiro, essa incerteza é especialmente perigosa porque pode levar a submissões duplicadas, perda de confiança e interpretação errada do estado dos documentos. O feedback imediato não substitui a validação final do backend; apenas torna visível o ciclo da operação.

#### Scope-in

- Criar um hook de feedback reutilizável para ações assíncronas.
- Aplicar feedback ao `OperationForm`, que cobre operações genéricas de criação e atualização.
- Aplicar feedback a carregamento, atualização e pesquisa de listagens no `ResourcePanel`.
- Aplicar feedback a páginas dedicadas que ainda usam mensagens locais, incluindo importações.
- Criar um smoke MF5 textual para confirmar o contrato mínimo de RNF03.
- Manter React, Vite, TypeScript e o cliente API existente em `apps/web`.
- Preservar autenticação por cookie HttpOnly e validação final no backend.

#### Scope-out

- Criar endpoints, serviços backend, modelos Prisma ou regras de domínio novas.
- Alterar RF/RNF, matriz, backlog, sprints, ownership ou documentos canónicos.
- Resolver acessibilidade completa, contraste e foco; isso fica para `BK-MF5-04`.
- Resolver validações fiscais, contabilísticas ou legais; isso continua nos módulos de domínio.
- Trocar a stack frontend ou adicionar dependências de UI.
- Guardar credenciais no browser ou decidir permissões no frontend.

#### Estado antes e depois

- Antes: formulários, listagens e importações podem usar estados locais diferentes ou mensagens soltas, deixando o utilizador sem resposta uniforme.
- Depois: ações de guardar, validar, atualizar, pesquisar e importar usam `useActionFeedback` e `StatusMessage`, com estados visíveis de execução, sucesso e erro.

#### Pre-requisitos

- Ler `RNF03` em `docs/RNF.md`.
- Confirmar em `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md` que este BK pertence à `MF5`, tem prioridade `P0`, owner `Pedro`, apoio `Andre` e sprint `S09-S10`.
- `DERIVADO`: ter concluído `BK-MF5-01`, porque este BK reutiliza `StatusMessage` de `apps/web/src/ui/opsaUi.tsx`.
- Confirmar que `apps/web/src/lib/apiClient.ts` continua a usar `credentials: "include"`.
- Confirmar que o backend continua responsável por permissões, empresa ativa, validação final e auditoria de operações sensíveis.

#### Glossário

- `Feedback imediato`: resposta visível da interface quando uma ação começa, termina ou falha.
- `Estado de execução`: momento em que a aplicação está a comunicar com a API ou a processar dados locais.
- `Estado de sucesso`: confirmação visível de que a ação terminou como esperado.
- `Estado de erro`: mensagem visível que explica que a ação falhou e orienta a correção.
- `Ação assíncrona`: operação que demora algum tempo, como chamada HTTP, pesquisa, atualização de lista ou importação.
- `Hook React`: função que concentra estado reutilizável dentro de componentes React.
- `StatusMessage`: componente transversal criado em `BK-MF5-01` para apresentar mensagens de estado.
- `Smoke textual`: script rápido que verifica contratos estruturais sem abrir o browser.
- `Evidence`: prova objetiva para PR ou defesa, como output de comando, screenshot ou descrição de cenário observado.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF03` exige feedback imediato em todas as ações de guardar, validar e uploads.
- `CANONICO`: a stack validada é React, Vite e TypeScript em `apps/web`, com API Express em `apps/api`.
- `CANONICO`: o cliente HTTP existente envia cookies HttpOnly com `credentials: "include"`; o frontend não deve guardar credenciais.
- `DERIVADO`: como `RNF03` é transversal de UI/UX, a solução deve ficar no frontend e não criar tabelas, endpoints ou regras fiscais novas.
- Um feedback consistente reduz cliques duplicados, melhora a confiança do utilizador e prepara o caminho para mensagens acessíveis no BK seguinte.
- Um hook é adequado aqui porque vários componentes precisam do mesmo ciclo: começar, aguardar, confirmar ou falhar.
- `StatusMessage` evita mensagens soltas com classes diferentes em cada página e cria uma base comum para `BK-MF5-04`.
- O frontend pode validar campos obrigatórios e apresentar mensagens rápidas, mas a decisão final de segurança e domínio continua sempre no backend.

#### Arquitetura do BK

- `apps/web/src/ui/useActionFeedback.ts` concentra o ciclo de feedback.
- `apps/web/src/App.tsx` consome o hook em `OperationForm` e `ResourcePanel`.
- `apps/web/src/pages/mf3Pages.tsx` e `apps/web/src/pages/mf4Pages.tsx` passam a usar feedback comum nas páginas dedicadas.
- `apps/web/src/ui/opsaUi.tsx`, criado em `BK-MF5-01`, fornece `StatusMessage`.
- `apps/web/scripts/check-mf5-feedback.mjs` valida que os pontos centrais do contrato existem.
- `apps/web/package.json` ganha um script MF5 para executar o smoke.
- `BK-MF5-04` recebe feedback já organizado para evoluir semântica, contraste e legibilidade.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/ui/useActionFeedback.ts`
- CRIAR: `apps/web/scripts/check-mf5-feedback.mjs`
- EDITAR: `apps/web/src/App.tsx`
- EDITAR: `apps/web/src/pages/mf3Pages.tsx`
- EDITAR: `apps/web/src/pages/mf4Pages.tsx`
- EDITAR: `apps/web/package.json`
- REVER: `apps/web/src/ui/opsaUi.tsx`
- REVER: `apps/web/src/lib/apiClient.ts`

#### Tutorial técnico linear

### Passo 1 - Mapear todas as ações com feedback obrigatório

1. Objetivo funcional do passo no contexto da app.

Identificar os pontos da interface que precisam de feedback antes de escrever código. O objetivo é evitar uma correção parcial centrada apenas num formulário.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/pages/mf3Pages.tsx`
    - REVER: `apps/web/src/pages/mf4Pages.tsx`
    - REVER: `apps/web/src/lib/apiClient.ts`

3. Instruções do que fazer.

Cria uma lista curta das ações assíncronas atuais. Inclui submissões de `OperationForm`, botão `Atualizar`, pesquisa, importação de extratos, importação de dados e ações dedicadas de MF4. Marca cada uma com os três estados esperados: execução, sucesso e erro.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é analítico e prepara a alteração técnica.

5. Explicação do código.

Como não há código neste passo, a explicação é sobre o raciocínio técnico. `RNF03` fala de todas as ações, por isso não chega alterar o botão de guardar. A lista inicial obriga a olhar para os pontos reais da app: operações configuráveis em `App.tsx`, carregamento de tabelas, pesquisa e importações nas páginas dedicadas. Esta separação evita misturar feedback visual com regras de domínio. O frontend passa a responder ao utilizador, mas não decide se uma operação é permitida, válida ou fiscalmente correta.

6. Validação do passo.

A lista deve conter pelo menos `OperationForm`, `ResourcePanel.load`, formulário de pesquisa, `StatementImportPage`, `BusinessImportPage` e ações assíncronas de `mf4Pages.tsx`.

7. Cenário negativo/erro esperado.

Se a lista só mencionar `OperationForm`, o BK continua incompleto porque importações e páginas dedicadas ficam sem cobertura explícita.

### Passo 2 - Criar o hook `useActionFeedback`

1. Objetivo funcional do passo no contexto da app.

Criar um estado reutilizável para representar execução, sucesso e erro em qualquer ação assíncrona da interface.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/ui/useActionFeedback.ts`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o ficheiro abaixo em `apps/web/src/ui/useActionFeedback.ts`. Mantém os nomes exportados porque os passos seguintes dependem deles.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * @file Hook de feedback imediato para ações assíncronas da interface OPSA.
 */

import { useCallback, useState } from "react";

export type FeedbackPhase = "idle" | "running" | "success" | "error";
export type FeedbackTone = "neutral" | "success" | "danger";

export interface ActionFeedbackState {
    phase: FeedbackPhase;
    tone: FeedbackTone;
    title: string;
    message: string | null;
}

export interface ActionFeedbackRunOptions {
    startMessage?: string;
    successMessage?: string;
    errorMessage?: string;
}

const idleFeedback: ActionFeedbackState = {
    phase: "idle",
    tone: "neutral",
    title: "Estado da operação",
    message: null,
};

/**
 * Converte um erro técnico numa mensagem curta para a interface.
 *
 * @param error - Erro lançado por validação local ou chamada à API.
 * @param fallback - Mensagem usada quando o erro não traz texto útil.
 * @returns Mensagem segura para apresentar ao utilizador.
 */
function messageFromError(error: Error, fallback: string) {
    const message = error.message.trim();
    return message || fallback;
}

/**
 * Gere o ciclo visual de uma ação assíncrona.
 *
 * @returns Estado atual, indicador de execução e funções para executar ações com feedback.
 */
export function useActionFeedback() {
    const [feedback, setFeedback] = useState<ActionFeedbackState>(idleFeedback);

    const start = useCallback((message = "A executar operação...") => {
        // O feedback aparece antes da API responder para evitar cliques repetidos.
        setFeedback({
            phase: "running",
            tone: "neutral",
            title: "Operação em curso",
            message,
        });
    }, []);

    const succeed = useCallback((message = "Operação concluída com sucesso.") => {
        setFeedback({
            phase: "success",
            tone: "success",
            title: "Operação concluída",
            message,
        });
    }, []);

    const fail = useCallback(
        (error: Error, fallback = "Não foi possível concluir a operação.") => {
            // O hook recebe o erro já capturado e devolve uma mensagem previsível.
            setFeedback({
                phase: "error",
                tone: "danger",
                title: "Operação não concluída",
                message: messageFromError(error, fallback),
            });
        },
        [],
    );

    const reset = useCallback(() => {
        setFeedback(idleFeedback);
    }, []);

    const run = useCallback(
        async <TResult>(
            action: () => Promise<TResult>,
            options: ActionFeedbackRunOptions = {},
        ) => {
            start(options.startMessage);

            try {
                const result = await action();
                succeed(options.successMessage);
                return result;
            } catch (caught) {
                const error =
                    caught instanceof Error
                        ? caught
                        : new Error(options.errorMessage ?? "Operação interrompida.");

                fail(error, options.errorMessage);
                throw error;
            }
        },
        [fail, start, succeed],
    );

    return {
        feedback,
        busy: feedback.phase === "running",
        start,
        succeed,
        fail,
        reset,
        run,
    };
}
```

5. Explicação do código.

Este ficheiro cria o contrato comum de feedback da MF5. A entrada principal é uma função assíncrona passada a `run`; a saída é o mesmo resultado dessa função, mas com estados visíveis durante o ciclo. `start` apresenta a mensagem de execução, `succeed` confirma sucesso e `fail` normaliza erros. O hook não conhece vendas, compras, inventário, tesouraria ou IA, por isso pode ser reutilizado nesses módulos sem duplicar estado local. A validação de permissões, empresa ativa e regras financeiras continua na API; este hook apenas apresenta o que aconteceu. O `busy` devolvido serve para desativar botões enquanto a operação está em curso, reduzindo submissões repetidas. O contrato prepara `BK-MF5-04`, porque concentra as mensagens num formato que pode depois receber melhorias de acessibilidade.

6. Validação do passo.

Depois de criar o ficheiro, o TypeScript deve aceitar os exports `FeedbackPhase`, `ActionFeedbackState`, `ActionFeedbackRunOptions` e `useActionFeedback`.

7. Cenário negativo/erro esperado.

Se `run` capturar um erro e não o voltar a lançar, o componente chamador pode assumir sucesso e limpar o formulário indevidamente.

### Passo 3 - Aplicar feedback ao `OperationForm`

1. Objetivo funcional do passo no contexto da app.

Garantir feedback imediato em operações de guardar e validar que passam pelo formulário genérico da aplicação.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: imports e função completa `OperationForm`

3. Instruções do que fazer.

Adiciona os imports indicados e substitui a função `OperationForm` existente pela versão completa abaixo. Preserva os tipos e helpers já existentes no ficheiro real, como `OperationConfig`, `normalizeFormValues` e `formatError`.

4. Código completo, correto e integrado com a app final.

```tsx
import { StatusMessage } from "./ui/opsaUi";
import { useActionFeedback } from "./ui/useActionFeedback";

type OperationResult = Awaited<ReturnType<OperationConfig["run"]>>;

/**
 * Renderiza uma operação configurável com feedback imediato de submissão.
 *
 * @param props - Operação e callback executado depois de a API responder.
 * @returns Formulário React com estados visíveis de execução, sucesso e erro.
 */
function OperationForm({
    operation,
    onDone,
}: {
    operation: OperationConfig;
    onDone: (result: OperationResult) => Promise<void>;
}) {
    const action = useActionFeedback();

    /**
     * Submete a operação, atualiza a lista dependente e apresenta feedback em cada estado.
     *
     * @param event - Evento do formulário submetido.
     * @returns Promise resolvida depois de terminar a submissão.
     */
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;

        try {
            await action.run(
                async () => {
                    const values = normalizeFormValues(
                        operation.fields,
                        new FormData(formElement),
                    );
                    const result = await operation.run(values);
                    await operation.afterSuccess?.();
                    await onDone(result);
                    return result;
                },
                {
                    startMessage: "A validar e enviar dados...",
                    successMessage: "Dados guardados e lista atualizada.",
                    errorMessage: "Não foi possível guardar os dados.",
                },
            );

            // O formulário só é limpo depois de a operação terminar com sucesso.
            formElement.reset();
        } catch {
            // A mensagem de erro já foi colocada no estado pelo hook.
        }
    }

    return (
        <form className="operation" onSubmit={handleSubmit}>
            <h3>{operation.title}</h3>
            <div className="fields">
                {operation.fields.map((field) => (
                    <label key={field.name}>
                        <span>{field.label}</span>
                        {field.kind === "textarea" ? (
                            <textarea
                                name={field.name}
                                required={field.required}
                                defaultValue={field.defaultValue}
                                rows={4}
                            />
                        ) : field.kind === "select" ? (
                            <select
                                name={field.name}
                                required={field.required}
                                defaultValue={field.defaultValue ?? ""}
                            >
                                <option value="" disabled={field.required}>
                                    Selecionar
                                </option>
                                {field.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                name={field.name}
                                required={field.required}
                                type={field.kind ?? "text"}
                                defaultValue={field.defaultValue}
                            />
                        )}
                    </label>
                ))}
            </div>
            {action.feedback.message ? (
                <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
                    {action.feedback.message}
                </StatusMessage>
            ) : null}
            <button type="submit" disabled={action.busy}>
                {action.busy ? "A executar..." : operation.submitLabel}
            </button>
        </form>
    );
}
```

5. Explicação do código.

Este passo liga o hook criado no passo anterior ao ponto mais transversal de submissão da app. A entrada do componente continua a ser `operation`, com campos e função `run`, e `onDone`, usado para atualizar o estado externo depois da resposta da API. A saída visível passa a incluir `StatusMessage`, que apresenta execução, sucesso ou erro sem depender de parágrafos soltos. A validação local de campos obrigatórios continua a acontecer através do HTML e de `normalizeFormValues`; a validação final continua no backend. O formulário só é limpo depois de sucesso, evitando perder dados quando há falha. O botão fica desativado durante `action.busy`, o que reduz o risco de submissões duplicadas. O passo consome `StatusMessage` do `BK-MF5-01` e prepara o `BK-MF5-04`, que poderá melhorar semântica e legibilidade sem reescrever cada formulário.

6. Validação do passo.

Ao submeter qualquer operação genérica, deve aparecer `A validar e enviar dados...`; em sucesso deve aparecer `Dados guardados e lista atualizada.`; em erro deve aparecer uma mensagem dentro de `StatusMessage`.

7. Cenário negativo/erro esperado.

Se a API falhar, o formulário não deve ser limpo e o botão deve voltar a ficar disponível depois da mensagem de erro aparecer.

### Passo 4 - Aplicar feedback a atualização e pesquisa de listagens

1. Objetivo funcional do passo no contexto da app.

Dar feedback imediato a ações de leitura, como atualizar listas e pesquisar dados.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: função completa `ResourcePanel`

3. Instruções do que fazer.

Substitui a função `ResourcePanel` existente pela versão abaixo. Mantém `DataTable`, `OperationForm`, `ResourceConfig` e `ApiObject` como já existem no ficheiro.

4. Código completo, correto e integrado com a app final.

```tsx
/**
 * Renderiza um recurso CRUD configurável, incluindo pesquisa, tabela e operações associadas.
 *
 * @param props - Configuração do recurso a apresentar.
 * @returns Elemento React renderizado para um recurso CRUD.
 */
function ResourcePanel({ resource }: { resource: ResourceConfig }) {
    const [rows, setRows] = useState<ApiObject[]>([]);
    const [search, setSearch] = useState("");
    const [result, setResult] = useState<OperationResult | null>(null);
    const loadFeedback = useActionFeedback();

    /**
     * Carrega dados da API e apresenta o estado da ação ao utilizador.
     *
     * @returns Promise resolvida depois de atualizar as linhas visíveis.
     */
    async function load() {
        try {
            await loadFeedback.run(
                async () => {
                    const nextRows = await resource.load(
                        resource.searchable ? search : undefined,
                    );
                    setRows(nextRows);
                    return nextRows;
                },
                {
                    startMessage: "A atualizar dados...",
                    successMessage: "Lista atualizada.",
                    errorMessage: "Não foi possível carregar a lista.",
                },
            );
        } catch {
            // Em erro, a tabela fica vazia para não mostrar dados possivelmente desatualizados.
            setRows([]);
        }
    }

    useEffect(() => {
        void load();
    }, [resource.id]);

    return (
        <section className="panel">
            <div className="sectionHeader">
                <h2>{resource.title}</h2>
                <button type="button" onClick={load} disabled={loadFeedback.busy}>
                    {loadFeedback.busy ? "A carregar..." : "Atualizar"}
                </button>
            </div>
            {resource.searchable ? (
                <form
                    className="search"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void load();
                    }}
                >
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Pesquisar por nome ou NIF"
                    />
                    <button type="submit" disabled={loadFeedback.busy}>
                        Pesquisar
                    </button>
                </form>
            ) : null}
            {loadFeedback.feedback.message ? (
                <StatusMessage
                    tone={loadFeedback.feedback.tone}
                    title={loadFeedback.feedback.title}
                >
                    {loadFeedback.feedback.message}
                </StatusMessage>
            ) : null}
            <DataTable rows={rows} />
            <div className="operationGrid">
                {resource.operations.map((operation) => (
                    <OperationForm
                        key={operation.title}
                        operation={operation}
                        onDone={async (value) => {
                            setResult(value);
                            await load();
                        }}
                    />
                ))}
            </div>
            {result ? <ResultSummary result={result} /> : null}
        </section>
    );
}
```

5. Explicação do código.

Este passo fecha a parte de `RNF03` que não está ligada a guardar dados. Atualizar uma lista e pesquisar também são ações, por isso precisam de feedback imediato. A entrada de `load` continua a ser a configuração do recurso e o texto de pesquisa; a saída é uma tabela atualizada e uma mensagem visível. Se a API falhar, a tabela é limpa para não reforçar dados antigos como se fossem atuais. `StatusMessage` mostra o estado da leitura tal como mostra o estado da escrita no passo anterior. O botão `Atualizar` e o botão `Pesquisar` ficam desativados durante a execução, evitando chamadas repetidas. O `onDone` das operações continua a chamar `load`, por isso guardar e atualizar lista ficam ligados num único fluxo compreensível.

6. Validação do passo.

Ao carregar num botão `Atualizar` ou ao submeter a pesquisa, deve aparecer `A atualizar dados...` antes de `Lista atualizada.` ou de uma mensagem de erro.

7. Cenário negativo/erro esperado.

Se `resource.load` falhar, a tabela deve ficar vazia, a mensagem de erro deve aparecer em `StatusMessage` e os botões devem voltar a ficar disponíveis.

### Passo 5 - Unificar mensagens nas páginas dedicadas

1. Objetivo funcional do passo no contexto da app.

Remover mensagens locais inconsistentes nas páginas dedicadas e usar o mesmo componente visual da MF5.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/mf3Pages.tsx`
    - EDITAR: `apps/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: imports e função local `Feedback`

3. Instruções do que fazer.

Adiciona `StatusMessage` aos imports vindos de `../ui/opsaUi` e substitui a função local `Feedback` nos ficheiros que ainda a usam.

4. Código completo, correto e integrado com a app final.

```tsx
import { PageFrame, StatusMessage } from "../ui/opsaUi";

/**
 * Feedback comum de carregamento, erro e sucesso nas páginas dedicadas.
 *
 * @param props - Estado de execução, erro opcional e mensagem positiva opcional.
 * @returns Fragmento React com mensagens transversais da MF5.
 */
function Feedback({
    busy,
    error,
    message,
}: {
    busy?: boolean;
    error?: string | null;
    message?: string | null;
}) {
    return (
        <>
            {busy ? (
                <StatusMessage tone="neutral" title="Operação em curso">
                    A executar operação...
                </StatusMessage>
            ) : null}
            {error ? (
                <StatusMessage tone="danger" title="Operação não concluída">
                    {error}
                </StatusMessage>
            ) : null}
            {message ? (
                <StatusMessage tone="success" title="Operação concluída">
                    {message}
                </StatusMessage>
            ) : null}
        </>
    );
}
```

5. Explicação do código.

Este passo garante que páginas dedicadas não ficam com um segundo padrão de feedback. A entrada da função continua simples: `busy`, `error` e `message`. A saída deixa de ser texto solto e passa a ser `StatusMessage`, igual ao usado no `OperationForm` e no `ResourcePanel`. Isto reduz diferenças visuais entre MF3 e MF4 e facilita a revisão do BK seguinte. A função não altera chamadas à API, não muda dados de domínio e não transforma erros técnicos em decisões de negócio. O objetivo é apenas apresentar estado de forma consistente e visível. Se uma página já tiver `PageFrame` vindo de `../ui/opsaUi`, o import deve ser alargado para incluir `StatusMessage`.

6. Validação do passo.

A pesquisa `rg -n "StatusMessage" apps/web/src/pages/mf3Pages.tsx apps/web/src/pages/mf4Pages.tsx` deve devolver ocorrências nos dois ficheiros.

7. Cenário negativo/erro esperado.

Se `Feedback` continuar a renderizar `<p className="error">`, a página fica fora do padrão visual da MF5 e deve ser corrigida antes de avançar.

### Passo 6 - Aplicar feedback às importações

1. Objetivo funcional do passo no contexto da app.

Garantir que ações de importação têm feedback imediato antes, durante e depois da submissão.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/mf3Pages.tsx`
    - LOCALIZAÇÃO: imports, `StatementImportPage` e `BusinessImportPage`

3. Instruções do que fazer.

Adiciona `useActionFeedback` aos imports e substitui as funções de importação abaixo. Mantém `requiredText`, `optionalText`, `JsonResult` e `apiClient` como já existem no ficheiro real.

4. Código completo, correto e integrado com a app final.

```tsx
import { useActionFeedback } from "../ui/useActionFeedback";

/**
 * Renderiza o ecrã Statement Import e liga feedback imediato à importação de extratos.
 *
 * @returns Elemento React renderizado para importação de extratos.
 */
export function StatementImportPage() {
    const [result, setResult] = useState<
        Awaited<ReturnType<typeof apiClient.treasury.importStatement>> | null
    >(null);
    const action = useActionFeedback();

    /**
     * Processa a submissão do formulário de extrato.
     *
     * @param event - Evento do formulário submetido.
     * @returns Promise resolvida depois de processar a importação.
     */
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;

        try {
            await action.run(
                async () => {
                    const form = new FormData(formElement);
                    const response = await apiClient.treasury.importStatement({
                        treasuryAccountId: requiredText(
                            form.get("treasuryAccountId"),
                            "Conta",
                        ),
                        format: requiredText(form.get("format"), "Formato"),
                        fileName: optionalText(form.get("fileName")) ?? "extrato.csv",
                        content: requiredText(form.get("content"), "Conteúdo"),
                    });

                    setResult(response);
                    return response;
                },
                {
                    startMessage: "A validar e importar extrato...",
                    successMessage: "Extrato importado com sucesso.",
                    errorMessage: "Não foi possível importar o extrato.",
                },
            );
        } catch {
            // O hook já colocou a mensagem de erro no estado visível.
        }
    }

    return (
        <PageFrame title="Importar extrato">
            {action.feedback.message ? (
                <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
                    {action.feedback.message}
                </StatusMessage>
            ) : null}
            <form className="operation" onSubmit={submit}>
                <div className="fields">
                    <label>
                        <span>Conta de tesouraria ID</span>
                        <input name="treasuryAccountId" required />
                    </label>
                    <label>
                        <span>Formato</span>
                        <select name="format" required defaultValue="CSV">
                            <option value="CSV">CSV</option>
                            <option value="OFX">OFX simplificado</option>
                        </select>
                    </label>
                    <label>
                        <span>Nome do ficheiro</span>
                        <input name="fileName" defaultValue="extrato.csv" />
                    </label>
                    <label>
                        <span>Conteúdo</span>
                        <textarea
                            name="content"
                            required
                            rows={8}
                            defaultValue={
                                "data;descricao;referencia;valor\n2026-06-01;Recebimento cliente;REC-1;125,00"
                            }
                        />
                    </label>
                </div>
                <button type="submit" disabled={action.busy}>
                    {action.busy ? "A importar..." : "Importar"}
                </button>
            </form>
            <JsonResult value={result} />
        </PageFrame>
    );
}

/**
 * Renderiza o ecrã Business Import e liga feedback imediato à importação de dados.
 *
 * @returns Elemento React renderizado para importação de dados.
 */
export function BusinessImportPage() {
    const [result, setResult] = useState<
        Awaited<ReturnType<typeof apiClient.imports.businessData>> | null
    >(null);
    const action = useActionFeedback();

    /**
     * Processa a submissão do formulário de importação geral.
     *
     * @param event - Evento do formulário submetido.
     * @returns Promise resolvida depois de processar a importação.
     */
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formElement = event.currentTarget;

        try {
            await action.run(
                async () => {
                    const form = new FormData(formElement);
                    const response = await apiClient.imports.businessData({
                        type: requiredText(form.get("type"), "Tipo"),
                        fileName: optionalText(form.get("fileName")) ?? "import.csv",
                        treasuryAccountId: optionalText(form.get("treasuryAccountId")),
                        content: requiredText(form.get("content"), "CSV"),
                    });

                    setResult(response);
                    return response;
                },
                {
                    startMessage: "A validar e importar dados...",
                    successMessage: "Dados importados com sucesso.",
                    errorMessage: "Não foi possível importar os dados.",
                },
            );
        } catch {
            // A interface mantém os dados preenchidos para o utilizador corrigir e repetir.
        }
    }

    return (
        <PageFrame title="Importar dados">
            {action.feedback.message ? (
                <StatusMessage tone={action.feedback.tone} title={action.feedback.title}>
                    {action.feedback.message}
                </StatusMessage>
            ) : null}
            <form className="operation" onSubmit={submit}>
                <div className="fields">
                    <label>
                        <span>Tipo</span>
                        <select name="type" required defaultValue="CUSTOMERS">
                            <option value="CUSTOMERS">Clientes</option>
                            <option value="SUPPLIERS">Fornecedores</option>
                            <option value="ITEMS">Artigos</option>
                            <option value="STATEMENTS">Extratos</option>
                        </select>
                    </label>
                    <label>
                        <span>Nome do ficheiro</span>
                        <input name="fileName" defaultValue="import.csv" />
                    </label>
                    <label>
                        <span>Conta ID para extratos</span>
                        <input name="treasuryAccountId" />
                    </label>
                    <label>
                        <span>CSV</span>
                        <textarea
                            name="content"
                            required
                            rows={8}
                            defaultValue={
                                "name;nif;email\nCliente Demo;509442013;cliente@example.test"
                            }
                        />
                    </label>
                </div>
                <button type="submit" disabled={action.busy}>
                    {action.busy ? "A importar..." : "Importar"}
                </button>
            </form>
            <JsonResult value={result} />
        </PageFrame>
    );
}
```

5. Explicação do código.

Este passo cobre explicitamente as importações, que eram a lacuna principal face ao texto de `RNF03`. A entrada continua a ser o formulário existente: conta, formato, nome de ficheiro e conteúdo. A saída continua a ser o resultado apresentado em `JsonResult`, mas agora há feedback antes e depois da chamada à API. `action.run` envolve validações locais e chamada HTTP, por isso erros de campo obrigatório e erros da API aparecem pelo mesmo canal visual. Em erro, o formulário não é limpo, permitindo corrigir sem voltar a preencher tudo. O botão fica bloqueado durante a importação para reduzir duplicações. A regra de negócio da importação continua no backend; o frontend apenas mostra estado e preserva os dados preenchidos.

6. Validação do passo.

Ao submeter uma importação de extrato ou dados, deve aparecer `A validar e importar...`; em sucesso deve aparecer uma mensagem positiva; em erro os campos devem continuar preenchidos.

7. Cenário negativo/erro esperado.

Submete o formulário com `content` vazio. O erro deve aparecer no `StatusMessage`, o botão deve voltar a ficar ativo e o utilizador deve conseguir corrigir o campo.

### Passo 7 - Criar o smoke MF5 de feedback

1. Objetivo funcional do passo no contexto da app.

Criar uma validação repetível para provar que o contrato mínimo de feedback existe no código.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/scripts/check-mf5-feedback.mjs`
    - EDITAR: `apps/web/package.json`

3. Instruções do que fazer.

Cria o script completo abaixo e adiciona `"test:mf5:feedback": "node scripts/check-mf5-feedback.mjs"` à secção `scripts` de `apps/web/package.json`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual da MF5 para confirmar feedback imediato nas ações principais.
 */

import { readFile } from "node:fs/promises";

const files = {
    app: new URL("../src/App.tsx", import.meta.url),
    hook: new URL("../src/ui/useActionFeedback.ts", import.meta.url),
    mf3: new URL("../src/pages/mf3Pages.tsx", import.meta.url),
    mf4: new URL("../src/pages/mf4Pages.tsx", import.meta.url),
    packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Lê um ficheiro de texto do projeto web.
 *
 * @param url - URL local do ficheiro.
 * @returns Conteúdo textual do ficheiro.
 */
async function readText(url) {
    return readFile(url, "utf8");
}

/**
 * Falha o smoke quando um contrato textual obrigatório não existe.
 *
 * @param source - Conteúdo onde procurar.
 * @param expected - Texto obrigatório.
 * @param label - Descrição curta do contrato.
 * @returns void
 */
function assertIncludes(source, expected, label) {
    if (!source.includes(expected)) {
        throw new Error(`MF5 feedback em falta: ${label}`);
    }
}

/**
 * Executa todas as verificações textuais da RNF03.
 *
 * @returns Promise resolvida quando o contrato mínimo existe.
 */
async function main() {
    const [app, hook, mf3, mf4, packageJson] = await Promise.all([
        readText(files.app),
        readText(files.hook),
        readText(files.mf3),
        readText(files.mf4),
        readText(files.packageJson),
    ]);

    assertIncludes(hook, "useActionFeedback", "hook exportado");
    assertIncludes(hook, "phase: \"running\"", "estado de execução");
    assertIncludes(hook, "phase: \"success\"", "estado de sucesso");
    assertIncludes(hook, "phase: \"error\"", "estado de erro");

    assertIncludes(app, "useActionFeedback", "App consome o hook");
    assertIncludes(app, "StatusMessage", "App apresenta mensagens comuns");
    assertIncludes(app, "A validar e enviar dados", "feedback de submissão");
    assertIncludes(app, "A atualizar dados", "feedback de listagem");

    assertIncludes(mf3, "useActionFeedback", "MF3 cobre importações");
    assertIncludes(mf3, "A validar e importar", "mensagem de importação");
    assertIncludes(mf3, "StatusMessage", "MF3 usa mensagem transversal");

    assertIncludes(mf4, "StatusMessage", "MF4 usa mensagem transversal");
    assertIncludes(
        packageJson,
        "test:mf5:feedback",
        "script disponível no package.json",
    );

    // A mensagem final é curta para ser usada diretamente como evidence.
    console.log("MF5 feedback smoke OK");
}

await main();
```

5. Explicação do código.

Este smoke não tenta substituir testes de UI completos. Ele verifica contratos mínimos que podem ser confirmados rapidamente antes da defesa: o hook existe, os três estados existem, `App.tsx` consome feedback em submissões e listagens, MF3 cobre importações, MF4 usa `StatusMessage` e o `package.json` expõe o comando. A entrada do script são ficheiros locais lidos com `readFile`; a saída é uma mensagem curta ou um erro com o contrato em falta. O check é textual porque a MF5 está a normalizar estrutura de interface e porque o projeto já usa smokes textuais para MF1, MF2 e MF3. Se uma refatoração futura mudar nomes, o script deve ser atualizado com o novo contrato real, não removido.

6. Validação do passo.

Executa `cd apps/web && npm run test:mf5:feedback`. O output esperado é `MF5 feedback smoke OK`.

7. Cenário negativo/erro esperado.

Remove temporariamente a palavra `StatusMessage` de uma página dedicada e confirma que o smoke falha com uma mensagem `MF5 feedback em falta`.

### Passo 8 - Validar o fluxo completo e preparar o handoff

1. Objetivo funcional do passo no contexto da app.

Confirmar que a implementação continua estável e deixar evidence clara para PR ou defesa.

2. Ficheiros envolvidos:
    - REVER: `apps/web/package.json`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/pages/mf3Pages.tsx`
    - REVER: `apps/web/src/pages/mf4Pages.tsx`

3. Instruções do que fazer.

Executa os comandos de validação, testa manualmente um cenário positivo e um cenário negativo, e regista a evidence no PR ou no diário de trabalho.

4. Código completo, correto e integrado com a app final.

```bash
cd apps/web
npm run typecheck
npm run test:mf1
npm run test:mf2
npm run test:mf3
npm run test:mf5:feedback
```

5. Explicação do código.

Os comandos confirmam dois níveis de confiança. `typecheck` prova que os imports, tipos e funções continuam coerentes. Os smokes MF1, MF2 e MF3 protegem módulos anteriores contra regressões causadas por componentes transversais. O smoke MF5 confirma o contrato específico deste BK: feedback de submissão, listagem, páginas dedicadas e importações. Esta sequência não prova que todas as regras de negócio estão corretas; essas regras pertencem aos módulos funcionais e ao backend. Aqui o objetivo é provar que `RNF03` ficou observável na interface e que o projeto continua a compilar.

6. Validação do passo.

Todos os comandos devem terminar sem erro. Além disso, testa manualmente: submeter um formulário válido, submeter um formulário inválido, atualizar uma lista, pesquisar e tentar uma importação com campo obrigatório vazio.

7. Cenário negativo/erro esperado.

Se `npm run test:mf5:feedback` falhar, corrige primeiro o contrato indicado pelo erro antes de avançar para `BK-MF5-04`.

#### Critérios de aceite

- `useActionFeedback` existe e expõe estados de execução, sucesso e erro.
- `OperationForm` mostra feedback imediato em submissões genéricas.
- `ResourcePanel` mostra feedback em atualização e pesquisa.
- `StatementImportPage` e `BusinessImportPage` mostram feedback em importações.
- Páginas dedicadas de MF3 e MF4 usam `StatusMessage` em vez de mensagens locais soltas.
- `apps/web/package.json` expõe `test:mf5:feedback`.
- O frontend continua a usar o cliente API existente e cookies HttpOnly.
- Nenhuma regra de domínio, permissão, empresa ativa ou validação final passa a ser decidida apenas no frontend.
- O aluno consegue seguir o BK sem inventar ficheiros, imports ou comandos.
- Negativos: mínimo `3` cenários com resultado controlado.

#### Validação final

- Executar `cd apps/web && npm run typecheck`.
- Executar `cd apps/web && npm run test:mf1`.
- Executar `cd apps/web && npm run test:mf2`.
- Executar `cd apps/web && npm run test:mf3`.
- Executar `cd apps/web && npm run test:mf5:feedback`.
- Executar pesquisa por `StatusMessage` nos ficheiros alterados.
- Testar manualmente sucesso e erro em guardar, atualizar, pesquisar e importar.

#### Evidence para PR/defesa

- Output de `npm run test:mf5:feedback`.
- Output de `npm run typecheck`.
- Screenshot ou gravação curta de uma submissão em execução, sucesso e erro.
- Screenshot ou gravação curta de uma importação com erro de campo obrigatório.
- Lista de ficheiros alterados e ligação explícita a `RNF03`.

#### Handoff

- Próximo BK recomendado: `BK-MF5-04`.
- Próximo BK: `BK-MF5-04`.
- Mantém `StatusMessage` como canal único de mensagens de estado visíveis.
- Mantém `useActionFeedback` pequeno e focado em ciclo de ação, sem regras de domínio.
- Se o próximo BK precisar de melhorar acessibilidade, deve evoluir `StatusMessage` e não criar outro componente paralelo.
- Se uma mensagem de erro precisar de ser mais clara, trata isso em `BK-MF5-06` sem remover o contrato deste BK.

#### Changelog

- `2026-06-19`: corrige o guia para cobrir guardar, validar, atualizar, pesquisar, importações e smoke MF5 de feedback.
- `2026-06-18`: documenta o feedback imediato reutilizável para operações assíncronas.
- `2026-04-17`: guia migrado para naming com slug e estrutura pedagógico-operacional inicial.
