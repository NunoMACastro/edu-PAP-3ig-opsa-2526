# BK-MF5-01 - Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade).

## Header

- `doc_id`: `GUIA-BK-MF5-01`
- `bk_id`: `BK-MF5-01`
- `macro`: `MF5`
- `owner`: `Oleksii`
- `apoio`: `Sofia`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF01`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-02`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-01-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-inventario-contabilidade.md`
- `last_updated`: `2026-06-19`

#### Objetivo

Neste BK vais implementar uma interface intuitiva, clara e consistente entre módulos de Vendas, Compras, Inventário e Contabilidade. O resultado final é uma base visual comum na app OPSA, sem criar endpoints novos nem alterar regras de domínio financeiro.

#### Importância

Sem uma linguagem visual comum, cada módulo parece uma aplicação diferente e o utilizador perde confiança em tarefas financeiras repetidas. A MF5 começa por criar essa base partilhada para que os BKs seguintes consigam trabalhar responsividade, feedback, acessibilidade, formulários, mensagens e performance sobre componentes já previsíveis.

#### Scope-in

- Normalizar a moldura visual comum dos ecrãs principais e preparar componentes reutilizáveis para os BKs seguintes da MF5.
- Ligar essa moldura aos painéis genéricos e às páginas dedicadas de MF1, MF2, MF3 e MF4 já existentes em `real_dev/web`.
- Manter React, Vite, TypeScript e o cliente API existente.
- Produzir evidence observável para PR e defesa PAP.
- Preservar autenticação por cookie HttpOnly e validação backend.

#### Scope-out

- Criar novas regras fiscais, contabilísticas ou legais.
- Criar ORM, endpoints backend ou modelos Prisma novos para RNF01-RNF07.
- Trocar a stack frontend ou adicionar dependências de UI.
- Alterar RF/RNF, backlog, matriz ou ownership dos BKs.
- Reescrever fluxos de negócio dos módulos anteriores.

#### Estado antes e depois

- Antes: os ecrãs principais reutilizam classes visuais, mas ainda têm molduras locais e repetidas em páginas de Vendas, Compras, Inventário, Contabilidade e módulos posteriores.
- Depois: `PageFrame`, `StatusMessage`, `ActionToolbar` e `ModuleBadge` ficam definidos em `real_dev/web/src/ui/opsaUi.tsx`; `ResourcePanel` e as páginas dedicadas passam a usar a mesma moldura visual.

#### Pre-requisitos

- Ler `RNF01` em `docs/RNF.md`.
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
- Neste BK, o foco é normalizar a moldura visual comum dos ecrãs principais e preparar componentes reutilizáveis para os BKs seguintes da MF5.
- Um componente React recebe dados por props e devolve UI previsível; isso evita repetir marcação diferente em cada módulo.
- Um componente de moldura só organiza apresentação. Ele não decide permissões, empresa ativa, ownership, impostos, saldos ou regras contabilísticas.
- Segurança continua no backend: permissões, empresa ativa, ownership e dados financeiros não são decididos por CSS nem por componentes React.

#### Arquitetura do BK

- `real_dev/web/src/App.tsx` continua a compor navegação, autenticação e painéis genéricos.
- `real_dev/web/src/lib/apiClient.ts` continua a ser o único cliente HTTP base.
- `real_dev/web/src/ui/opsaUi.tsx` passa a concentrar componentes transversais criados pela MF5.
- `real_dev/web/src/pages/mf1Pages.tsx`, `mf2Pages.tsx`, `mf3Pages.tsx` e `mf4Pages.tsx` passam a consumir `PageFrame` em vez de manter uma moldura local.
- `real_dev/web/src/styles.css` recebe apenas estilos globais de suporte aos componentes novos.
- O handoff deste BK prepara `BK-MF5-02`.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/web/src/ui/opsaUi.tsx`
- EDITAR: `real_dev/web/src/App.tsx`
- EDITAR: `real_dev/web/src/pages/mf1Pages.tsx`
- EDITAR: `real_dev/web/src/pages/mf2Pages.tsx`
- EDITAR: `real_dev/web/src/pages/mf3Pages.tsx`
- EDITAR: `real_dev/web/src/pages/mf4Pages.tsx`
- EDITAR: `real_dev/web/src/styles.css`
- REVER: `real_dev/web/src/lib/apiClient.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato visual transversal

1. Objetivo funcional do passo no contexto da app.

Fixar o que este BK pode alterar antes de tocar na UI.

Confirma que RNF01 pede consistência entre módulos e que a aplicação já tem páginas de Vendas, Compras, Inventário, Contabilidade, Tesouraria, IA, auditoria e notificações que usam `panel`, `sectionHeader`, `operationGrid`, `error`, `success` e `empty`.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `real_dev/web/src/App.tsx`
    - REVER: `real_dev/web/src/styles.css`
    - REVER: `real_dev/web/src/pages/mf1Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf2Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf3Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: cabeçalhos, mensagens e painéis já existentes

3. Instruções do que fazer.

Lista os padrões repetidos e decide manter os nomes CSS existentes. Não cries uma biblioteca visual externa; cria apenas componentes React pequenos com os estilos já usados.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e prepara a alteração técnica seguinte.

5. Explicação do código.

Este passo é analítico. Ele evita que o aluno altere a stack ou duplique estilos com nomes diferentes para a mesma responsabilidade. A decisão técnica importante é reconhecer que `ResourcePanel` não é o único ponto de interface: as páginas dedicadas de `mf1Pages`, `mf2Pages`, `mf3Pages` e `mf4Pages` também precisam da mesma moldura para RNF01 ficar observável entre módulos.

6. Validação do passo.

A lista deve referir pelo menos `panel`, `sectionHeader`, `operationGrid`, `error`, `success`, `empty`, `ResourcePanel` e as funções locais `PageFrame` existentes nos ficheiros de páginas.

7. Cenário negativo/erro esperado.

Se aparecer uma proposta de biblioteca visual externa, rejeita-a porque a stack validada é React/Vite sem dependência nova.

### Passo 2 - Criar componentes de interface OPSA

1. Objetivo funcional do passo no contexto da app.

Criar uma base comum para páginas, mensagens e barras de ações.

Cria um ficheiro de UI transversal que pode ser importado por páginas de vendas, compras, inventário, contabilidade, tesouraria e IA.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/ui/opsaUi.tsx`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `src/ui` se ainda não existir e coloca o ficheiro completo abaixo.

4. Código completo, correto e integrado com a app final.

```tsx
/**
 * @file Componentes de interface transversais da MF5 para manter os módulos OPSA consistentes.
 */

import { ReactNode } from "react";

/**
 * Tons visuais aceites pelos componentes transversais da OPSA.
 */
export type Tone = "neutral" | "success" | "warning" | "danger";

/**
 * Props da moldura comum de página.
 */
export interface PageFrameProps {
    title: string;
    eyebrow?: string;
    description?: string;
    headingId?: string;
    actions?: ReactNode;
    children: ReactNode;
}

/**
 * Gera um identificador HTML estável a partir de um título legível.
 *
 * @param title - Título visível da página.
 * @returns Identificador seguro para ligar `section` e `h2`.
 */
function toHeadingId(title: string) {
    const normalized = title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // O fallback mantém a acessibilidade mesmo quando o título não tem letras ou números.
    return `${normalized || "opsa-page"}-heading`;
}

/**
 * Cria a moldura comum das páginas de operação da OPSA.
 *
 * @param props - Título, identificador opcional, contexto, ações e conteúdo da página.
 * @returns Secção React com cabeçalho, descrição opcional e conteúdo do módulo.
 */
export function PageFrame({
    title,
    eyebrow = "OPSA",
    description,
    headingId,
    actions,
    children,
}: PageFrameProps) {
    const safeHeadingId = headingId ?? toHeadingId(title);

    return (
        <section className="panel pageFrame" aria-labelledby={safeHeadingId}>
            <header className="sectionHeader pageFrame__header">
                <div>
                    <p className="eyebrow">{eyebrow}</p>
                    <h2 id={safeHeadingId}>{title}</h2>
                    {description ? (
                        <p className="pageFrame__description">{description}</p>
                    ) : null}
                </div>
                {actions ? (
                    <div className="pageFrame__actions">{actions}</div>
                ) : null}
            </header>
            {/* O conteúdo continua a vir da página concreta; a moldura só normaliza estrutura visual. */}
            {children}
        </section>
    );
}

/**
 * Props da mensagem de estado reutilizável.
 */
export interface StatusMessageProps {
    tone: Tone;
    title: string;
    children: ReactNode;
}

/**
 * Apresenta feedback visual consistente para sucesso, aviso, erro ou estado neutro.
 *
 * @param props - Tom visual, título curto e conteúdo explicativo.
 * @returns Caixa de estado com role acessível.
 */
export function StatusMessage({ tone, title, children }: StatusMessageProps) {
    // Erros usam alert para serem anunciados com prioridade por tecnologias de apoio.
    const role = tone === "danger" ? "alert" : "status";

    return (
        <div className={`statusMessage statusMessage--${tone}`} role={role}>
            <strong>{title}</strong>
            <div>{children}</div>
        </div>
    );
}

/**
 * Props da barra de ações.
 */
export interface ActionToolbarProps {
    children: ReactNode;
}

/**
 * Agrupa comandos primários e secundários sem mudar a ordem visual entre módulos.
 *
 * @param props - Botões ou ligações de ação.
 * @returns Barra de ações reutilizável.
 */
export function ActionToolbar({ children }: ActionToolbarProps) {
    return <div className="actionToolbar">{children}</div>;
}

/**
 * Props do distintivo de módulo.
 */
export interface ModuleBadgeProps {
    label: string;
    tone?: Tone;
}

/**
 * Mostra estado ou categoria de módulo sem obrigar cada página a criar estilos próprios.
 *
 * @param props - Texto do distintivo e tom visual.
 * @returns Distintivo textual pequeno.
 */
export function ModuleBadge({ label, tone = "neutral" }: ModuleBadgeProps) {
    // O tom fica limitado a valores conhecidos para evitar classes CSS inventadas por engano.
    return <span className={`moduleBadge moduleBadge--${tone}`}>{label}</span>;
}
```

5. Explicação do código.

`PageFrame` resolve a consistência de cabeçalhos e gera um `id` seguro mesmo quando o título tem espaços, acentos ou pontuação. A `eyebrow` e a `description` são opcionais para permitir migrar páginas antigas que só recebiam `title`, sem obrigar a reescrever todo o conteúdo dessas páginas no mesmo BK.

`StatusMessage` concentra feedback e escolhe `role="alert"` apenas para erros, deixando estados neutros, sucesso e aviso como `status`. `ActionToolbar` normaliza comandos sem decidir que ações existem. `ModuleBadge` limita os tons aceites e evita classes improvisadas.

As entradas principais são props React e conteúdo filho. A saída é UI renderizada no browser. O contrato de segurança mantém-se fora destes componentes: autenticação, empresa ativa, ownership e validação final continuam no backend e no cliente API existente. Para testar, importa `PageFrame` numa página real e executa `npm run typecheck`; o teste deve falhar se um import ficar errado ou se uma prop obrigatória estiver em falta.

6. Validação do passo.

`npm run typecheck` deve reconhecer os exports. Uma página pode importar `PageFrame` sem erro de caminho e o `aria-labelledby` deve apontar para um `id` sem espaços.

7. Cenário negativo/erro esperado.

Remover o `aria-labelledby`, usar um título com espaços como `id` bruto ou trocar `StatusMessage` por texto solto deve falhar na revisão de acessibilidade do BK-MF5-04.

### Passo 3 - Ligar a moldura ao painel genérico

1. Objetivo funcional do passo no contexto da app.

Aplicar a interface comum ao painel configurável usado por recursos CRUD.

Atualiza a função `ResourcePanel` para usar `PageFrame`, `ActionToolbar` e `StatusMessage`. Mantém a lógica de `apiClient` e o envio automático de cookies já existente.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/App.tsx`
    - LOCALIZAÇÃO: função completa `ResourcePanel` e imports no topo

3. Instruções do que fazer.

Acrescenta o import indicado e substitui a função `ResourcePanel` pela versão abaixo.

4. Código completo, correto e integrado com a app final.

```tsx
import { ActionToolbar, PageFrame, StatusMessage } from "./ui/opsaUi";

/**
 * Renderiza um recurso CRUD configurável com moldura visual consistente entre módulos.
 *
 * @param props - Recurso com loader, pesquisa e operações.
 * @returns Elemento React com lista, ações e feedback.
 */
function ResourcePanel({ resource }: { resource: ResourceConfig }) {
    const [rows, setRows] = useState<ApiObject[]>([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<unknown>(null);
    const [busy, setBusy] = useState(false);

    /**
     * Carrega dados do módulo ativo e mantém feedback previsível para o utilizador.
     *
     * @returns Promise resolvida quando os dados visíveis são atualizados.
     */
    async function load() {
        setBusy(true);
        setError(null);
        try {
            // A pesquisa é enviada apenas quando o recurso a suporta, evitando parâmetros sem contrato.
            setRows(
                await resource.load(resource.searchable ? search : undefined),
            );
        } catch (caught) {
            setError(formatError(caught));
            setRows([]);
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        // A mudança de recurso obriga a novo carregamento sem depender da posição visual no menu.
        void load();
    }, [resource.id]);

    return (
        <PageFrame
            eyebrow="OPSA"
            title={resource.title}
            description="Consulta e operação do módulo ativo com a mesma estrutura visual usada nos restantes módulos."
            actions={
                <ActionToolbar>
                    <button type="button" onClick={load} disabled={busy}>
                        {busy ? "A carregar..." : "Atualizar"}
                    </button>
                </ActionToolbar>
            }
        >
            {resource.searchable ? (
                <form
                    className="search"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void load();
                    }}
                >
                    <input
                        type="search"
                        value={search}
                        aria-label="Pesquisar por nome ou NIF"
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <button type="submit">Pesquisar</button>
                </form>
            ) : null}
            {error ? (
                <StatusMessage
                    tone="danger"
                    title="Não foi possível carregar os dados"
                >
                    {error}
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
                            // Depois de criar ou alterar dados, a lista volta a ser lida pela API.
                            await load();
                        }}
                    />
                ))}
            </div>
            <pre className="result">{JSON.stringify(result, null, 2)}</pre>
        </PageFrame>
    );
}
```

5. Explicação do código.

A função continua a carregar dados com o loader do recurso ativo, mas a apresentação fica igual em todos os módulos que usam `ResourcePanel`. O input de pesquisa só é enviado quando `resource.searchable` permite, por isso o frontend não acrescenta parâmetros sem contrato ao loader. A saída principal é uma página com cabeçalho comum, pesquisa opcional, tabela, grelha de operações e resultado formatado.

O erro passa por `StatusMessage`, por isso o BK-MF5-06 consegue melhorar mensagens sem procurar várias marcações diferentes. O estado `busy` protege o botão `Atualizar` durante carregamento e evita feedback ambíguo. O `onDone` volta a executar `load()` depois de uma operação para mostrar dados atualizados sem o utilizador ter de mudar de módulo.

Este passo não altera regras de autorização, permissões ou empresa ativa. Esses contratos continuam no backend e no `apiClient`. Para adaptar com segurança, podes mudar o texto da descrição ou a ordem visual dos blocos, mas não removas o reload após operações nem substituas `formatError(caught)` por mensagens genéricas.

6. Validação do passo.

Abrir qualquer recurso ligado a `ResourcePanel` deve mostrar o mesmo padrão de título, descrição, ação `Atualizar`, tabela e operações.

7. Cenário negativo/erro esperado.

Se uma página perder o botão `Atualizar` ou deixar de chamar `load()` após uma operação, o fluxo deixou de estar coerente.

### Passo 4 - Migrar molduras locais de MF1 e MF2

1. Objetivo funcional do passo no contexto da app.

Garantir que RNF01 fica visível nas páginas reais de Vendas, Compras e Inventário sem duplicar molduras visuais.

As páginas dedicadas de MF1 e MF2 já têm uma função local chamada `PageFrame`. Remove essa função local e importa o `PageFrame` transversal criado no passo 2. Mantém todo o restante código funcional sem alterações.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/pages/mf1Pages.tsx`
    - EDITAR: `real_dev/web/src/pages/mf2Pages.tsx`
    - LOCALIZAÇÃO: imports no topo e função local `PageFrame`

3. Instruções do que fazer.

No ficheiro MF1, mantém `ReactNode` porque `DataTable` ainda o usa no tipo de `actions`. No ficheiro MF2, remove `ReactNode` do import de React, porque a função local removida era o único ponto que precisava desse tipo.

Depois dos imports, remove por completo a função local `PageFrame` em cada ficheiro. Não alteres os usos existentes de `<PageFrame title="...">`; eles passam a apontar para o componente importado.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/pages/mf1Pages.tsx - bloco de imports final
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ApiError, JsonBody } from "../lib/apiClient";
import { accountingApi } from "../lib/accountingApi";
import {
    ApiObject,
    asObject,
    formatValue,
    optionalText,
    pickArray,
    requiredText,
    toPositiveInteger,
} from "../lib/mf1FormUtils";
import { paymentApi } from "../lib/paymentApi";
import { purchaseApprovalApi } from "../lib/purchaseApprovalApi";
import { purchasesApi } from "../lib/purchasesApi";
import { receiptApi } from "../lib/receiptApi";
import { salesApi } from "../lib/salesApi";
import { salesOpenItemsApi } from "../lib/salesOpenItemsApi";
import { vatRateApi } from "../lib/vatRateApi";
import { PageFrame } from "../ui/opsaUi";
```

```tsx
// real_dev/web/src/pages/mf2Pages.tsx - bloco de imports final
import { FormEvent, useEffect, useState } from "react";
import { ApiError, apiClient, JsonBody } from "../lib/apiClient";
import {
    ApiObject,
    asObject,
    formatValue,
    optionalText,
    pickArray,
    requiredText,
} from "../lib/mf1FormUtils";
import { PageFrame } from "../ui/opsaUi";
```

Remove esta função local de `mf1Pages.tsx` e de `mf2Pages.tsx`:

```tsx
function PageFrame({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="panel">
            <div className="sectionHeader">
                <h2>{title}</h2>
            </div>
            {children}
        </section>
    );
}
```

5. Explicação do código.

Este passo troca duas molduras locais por um componente transversal. A entrada de cada página continua a ser o mesmo `title` e o mesmo `children`; a saída visual passa a ter as classes e regras de acessibilidade de `opsaUi.tsx`. Assim, Vendas, Compras e Inventário começam a partilhar a mesma estrutura base.

O import de `PageFrame` fica no fim dos imports locais para manter separadas as dependências de API e a dependência visual transversal. O import de `ReactNode` só fica em MF1 porque ainda há tipos de renderização nesse ficheiro. MF2 deixa de precisar dele depois de remover a função local.

O contrato de segurança não muda: as páginas continuam a chamar as mesmas APIs e a receber permissões e dados a partir da sessão resolvida pelo backend. Se o typecheck indicar import não usado, corrige apenas o import do ficheiro indicado.

6. Validação do passo.

Executa:

```bash
rg -n "function PageFrame" real_dev/web/src/pages/mf1Pages.tsx real_dev/web/src/pages/mf2Pages.tsx
```

O comando não deve encontrar funções locais. Depois confirma os imports:

```bash
rg -n "../ui/opsaUi" real_dev/web/src/pages/mf1Pages.tsx real_dev/web/src/pages/mf2Pages.tsx
```

O comando deve encontrar o import nos dois ficheiros.

7. Cenário negativo/erro esperado.

Se `npm run typecheck` indicar que `ReactNode` está em falta em MF1 ou sobra em MF2, corrige apenas o bloco de imports desse ficheiro antes de avançar.

### Passo 5 - Migrar molduras locais de MF3 e MF4

1. Objetivo funcional do passo no contexto da app.

Completar a cobertura transversal de RNF01 nas áreas de Contabilidade, IA assistiva, notificações e auditoria.

MF3 e MF4 também usam uma função local `PageFrame`. A migração deve seguir a mesma regra do passo anterior: importar o componente transversal, remover a função local e preservar o conteúdo funcional das páginas.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/pages/mf3Pages.tsx`
    - EDITAR: `real_dev/web/src/pages/mf4Pages.tsx`
    - LOCALIZAÇÃO: imports no topo e função local `PageFrame`

3. Instruções do que fazer.

No ficheiro MF3, remove `ReactNode` do import de React porque deixa de ser usado depois da remoção da função local. No ficheiro MF4, mantém `ReactNode` porque `ListPanel` usa esse tipo no campo `render`.

Não alteres os componentes exportados de MF3 nem de MF4. O objetivo é mudar apenas a moldura visual comum.

4. Código completo, correto e integrado com a app final.

```tsx
// real_dev/web/src/pages/mf3Pages.tsx - bloco de imports final
import { FormEvent, useState } from "react";
import { ApiError, apiClient, JsonBody } from "../lib/apiClient";
import { PageFrame } from "../ui/opsaUi";
```

```tsx
// real_dev/web/src/pages/mf4Pages.tsx - bloco de imports final
import { FormEvent, ReactNode, useState } from "react";
import { ApiError, JsonBody } from "../lib/apiClient";
import {
    AiActionSuggestion,
    AiInsight,
    AiQuestionAnswer,
    AuditLogItem,
    createReminder,
    createTask,
    getAiInsights,
    getAiSuggestions,
    getAuditLogs,
    getInsightExplanation,
    getIntegrationLogs,
    getNotifications,
    getReminders,
    getSmartAlerts,
    getTasks,
    InAppNotificationItem,
    InsightExplanation,
    IntegrationLogItem,
    markNotificationRead,
    OperationalTaskItem,
    ReminderItem,
    SmartAlert,
    syncNotifications,
    updateReminderStatus,
    updateTaskStatus,
    askAiQuestion,
} from "../lib/mf4Api";
import { PageFrame } from "../ui/opsaUi";
```

Remove esta função local de `mf3Pages.tsx` e de `mf4Pages.tsx`:

```tsx
function PageFrame({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="panel">
            <div className="sectionHeader">
                <h2>{title}</h2>
            </div>
            {children}
        </section>
    );
}
```

5. Explicação do código.

MF3 cobre fluxos contabilísticos, relatórios e KPIs. MF4 cobre IA assistiva, lembretes, tarefas, notificações, auditoria e logs. Como estes módulos já renderizam muitos ecrãs com `<PageFrame title="...">`, importar a moldura comum cria consistência visual sem reescrever cada página.

O ficheiro MF3 deixa de precisar de `ReactNode` quando a função local desaparece. O ficheiro MF4 ainda precisa de `ReactNode` porque `ListPanel` recebe uma função `render` que devolve elementos React. Esta distinção evita erros de typecheck por imports não usados.

Este passo é a ligação principal entre MF4 e MF5: o aluno consegue confirmar que a nova base visual não ficou limitada aos módulos MF1-MF3. As regras de domínio e chamadas HTTP continuam exatamente nos mesmos serviços.

6. Validação do passo.

Executa:

```bash
rg -n "function PageFrame" real_dev/web/src/pages/mf3Pages.tsx real_dev/web/src/pages/mf4Pages.tsx
```

O comando não deve encontrar funções locais. Depois confirma os imports:

```bash
rg -n "../ui/opsaUi" real_dev/web/src/pages/mf3Pages.tsx real_dev/web/src/pages/mf4Pages.tsx
```

O comando deve encontrar o import nos dois ficheiros.

7. Cenário negativo/erro esperado.

Se as páginas MF4 deixarem de renderizar `AiInsightsPage`, `NotificationsPage`, `AuditLogsPage` ou `IntegrationLogsPage`, a alteração ultrapassou a moldura visual e deve ser revertida nessa página concreta.

### Passo 6 - Adicionar estilos transversais

1. Objetivo funcional do passo no contexto da app.

Dar suporte visual aos componentes sem alterar o tema base.

Acrescenta estilos no fim do CSS global para os componentes novos.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/styles.css`
    - LOCALIZAÇÃO: fim do ficheiro

3. Instruções do que fazer.

Copia o bloco para o fim do ficheiro, preservando as regras existentes.

4. Código completo, correto e integrado com a app final.

```css
/* MF5 - base visual transversal */
.pageFrame {
    /* O espaçamento fica no contentor para todas as páginas herdarem a mesma cadência visual. */
    gap: 1rem;
}

.pageFrame__header {
    align-items: flex-start;
}

.pageFrame__description {
    max-width: 72ch;
    margin: 0.35rem 0 0;
    color: #4b5a50;
    line-height: 1.5;
}

.pageFrame__actions,
.actionToolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
}

.statusMessage {
    /* A linha lateral diferencia estados sem depender apenas da cor do texto. */
    border: 1px solid #d8dfd8;
    border-left-width: 4px;
    border-radius: 6px;
    background: #fff;
    padding: 0.75rem;
}

.statusMessage--success {
    border-left-color: #1f7a4d;
}
.statusMessage--warning {
    border-left-color: #9a6b12;
}
.statusMessage--danger {
    border-left-color: #a63131;
}
.statusMessage--neutral {
    border-left-color: #4b5a50;
}

.moduleBadge {
    /* O distintivo é pequeno para apoiar a leitura, não para competir com o título do módulo. */
    display: inline-flex;
    align-items: center;
    border: 1px solid #c9d2ca;
    border-radius: 999px;
    padding: 0.15rem 0.5rem;
    font-size: 0.78rem;
    font-weight: 600;
}

.moduleBadge--success {
    color: #174538;
    background: #edf7f1;
}
.moduleBadge--warning {
    color: #6d4b0b;
    background: #fff8e8;
}
.moduleBadge--danger {
    color: #7c2323;
    background: #fff2f2;
}
.moduleBadge--neutral {
    color: #4b5a50;
    background: #f7f9f7;
}
```

5. Explicação do código.

Os estilos usam a paleta já existente e não mudam a navegação principal. `.pageFrame` e `.pageFrame__header` reforçam a estrutura comum das páginas; `.pageFrame__description` limita a largura da descrição para manter leitura confortável; `.pageFrame__actions` e `.actionToolbar` alinham botões sem depender do módulo concreto.

`StatusMessage` usa uma linha lateral para diferenciar estados e não depender apenas da cor do texto. `ModuleBadge` cria um distintivo pequeno para apoiar leitura de estado ou categoria. As entradas são classes CSS já emitidas pelos componentes do passo 2; a saída é uma interface visual mais previsível. O bloco não altera dados, chamadas HTTP, permissões ou validações de negócio.

Para testar, abre páginas de módulos diferentes e confirma que cabeçalhos, ações, mensagens e distintivos mantêm espaçamento coerente. Nos BKs seguintes podes acrescentar regras responsivas, feedback mais detalhado e validações de acessibilidade, mas não deves mudar aqui a arquitetura de dados.

6. Validação do passo.

A UI deve manter contraste, espaçamento e botões consistentes nos módulos já ligados.

7. Cenário negativo/erro esperado.

Se o CSS quebrar `.sidebar`, `.content` ou `.operationGrid`, a alteração saiu do scope deste BK.

### Passo 7 - Validar typecheck, scripts MF1-MF3 e smoke MF4

1. Objetivo funcional do passo no contexto da app.

Fechar a validação técnica do BK com comandos objetivos e com uma verificação explícita de MF4.

MF4 ainda não tem script dedicado em `real_dev/web/package.json`, por isso a validação combina typecheck, scripts existentes e smoke manual documentado para as páginas MF4.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/package.json`
    - REVER: `real_dev/web/src/pages/mf1Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf2Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf3Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf4Pages.tsx`

3. Instruções do que fazer.

Executa os comandos de validação a partir da raiz do projeto. Regista o output relevante para a defesa. Como não existe `npm run test:mf4`, faz smoke manual de MF4 no browser local depois de o typecheck passar.

4. Código completo, correto e integrado com a app final.

```bash
cd real_dev/web
npm run typecheck
npm run test:mf1
npm run test:mf2
npm run test:mf3
rg -n "function PageFrame" src/pages/mf1Pages.tsx src/pages/mf2Pages.tsx src/pages/mf3Pages.tsx src/pages/mf4Pages.tsx
rg -n "../ui/opsaUi" src/pages/mf1Pages.tsx src/pages/mf2Pages.tsx src/pages/mf3Pages.tsx src/pages/mf4Pages.tsx
```

Para o smoke MF4, abre a app em ambiente de desenvolvimento e navega pelos ecrãs MF4 disponíveis no menu ou nas rotas internas. Confirma pelo menos estes ecrãs:

```text
AiInsightsPage: cabeçalho com a moldura comum e lista/estado de insights.
AiSuggestionsPage: cabeçalho com a moldura comum e ações de sugestão visíveis.
NotificationsPage: cabeçalho com a moldura comum e feedback de notificações.
AuditLogsPage: cabeçalho com a moldura comum e tabela/lista de auditoria.
IntegrationLogsPage: cabeçalho com a moldura comum e logs de integração visíveis ou estado vazio claro.
```

5. Explicação do código.

O typecheck valida imports, exports e tipos React em todos os ficheiros alterados. Os scripts MF1-MF3 confirmam que os fluxos com checks automatizados continuam íntegros. A pesquisa por `function PageFrame` deve terminar sem resultados, porque a moldura local foi substituída pelo componente transversal.

A pesquisa por `../ui/opsaUi` deve devolver quatro ocorrências, uma por ficheiro de páginas MF1-MF4. O smoke MF4 cobre a lacuna do package atual: como não há script `test:mf4`, o aluno deve confirmar visualmente os ecrãs mais importantes de MF4 e registar o resultado.

Esta validação não prova regras de negócio profundas; prova que a alteração de interface não partiu a navegação nem os componentes principais dos módulos afetados.

6. Validação do passo.

O BK só fica completo quando `npm run typecheck`, `npm run test:mf1`, `npm run test:mf2`, `npm run test:mf3` e o smoke MF4 estiverem registados como passados ou com bloqueio ambiental explicado.

7. Cenário negativo/erro esperado.

Se o browser mostrar uma página branca, import inexistente ou erro de componente em MF4, volta ao ficheiro indicado pela stack trace e confirma se o import de `PageFrame` e a remoção da função local ficaram completos.

### Passo 8 - Recolher evidence e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Deixar prova objetiva para PR, defesa e continuação segura para `BK-MF5-02`.

O fim deste BK deve mostrar que a base visual transversal existe, foi aplicada aos módulos reais e pode ser reutilizada pelos BKs seguintes da MF5.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/ui/opsaUi.tsx`
    - REVER: `real_dev/web/src/App.tsx`
    - REVER: `real_dev/web/src/pages/mf1Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf2Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf3Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf4Pages.tsx`
    - REVER: `real_dev/web/src/styles.css`

3. Instruções do que fazer.

Guarda evidence curta e objetiva: comandos executados, resultado do smoke MF4, screenshots antes/depois em pelo menos dois módulos e lista de ficheiros alterados. Não abras novos requisitos neste BK.

4. Código completo, correto e integrado com a app final.

```text
Sem código neste passo.
```

5. Explicação do código.

O handoff importa porque `BK-MF5-02` e os seguintes BKs da MF5 devem reutilizar `PageFrame`, `StatusMessage`, `ActionToolbar` e `ModuleBadge`. Se o aluno não registar estes nomes e exports, pode criar componentes paralelos e quebrar a coerência visual.

A evidence deve separar claramente o que foi validado automaticamente e o que foi validado por smoke manual. Se um comando falhar por ambiente local, regista o erro e não apresentes esse ponto como confirmado.

Este passo também protege o scope: se durante a validação surgir vontade de mudar regras de negócio, endpoints, Prisma ou permissões, isso deve sair para outro BK ou correção própria.

6. Validação do passo.

O handoff deve listar os quatro exports de `opsaUi.tsx`, os quatro ficheiros de páginas migrados e a evidência MF4.

7. Cenário negativo/erro esperado.

Se o handoff disser apenas "interface melhorada" sem nomes de componentes, ficheiros e comandos, a próxima pessoa não tem informação suficiente para continuar a MF5 com segurança.

#### Critérios de aceite

- `RNF01` fica coberto por alteração concreta no frontend e por migração explícita das molduras locais dos módulos reais.
- O guia cria os artefactos base que `BK-MF5-02` e os restantes BKs da MF5 importam.
- O frontend continua a usar o cliente API existente e cookies HttpOnly.
- Erros, loading, sucesso e estado vazio são visíveis e compreensíveis.
- O aluno consegue seguir o BK sem inventar ficheiros, imports ou comandos.
- Nenhuma regra de negócio passa a ser decidida apenas no frontend.

#### Validação final

- Executar `cd real_dev/web && npm run typecheck` depois de aplicar o BK no código.
- Executar `cd real_dev/web && npm run test:mf1`.
- Executar `cd real_dev/web && npm run test:mf2`.
- Executar `cd real_dev/web && npm run test:mf3`.
- Executar smoke MF4 documentado para `AiInsightsPage`, `AiSuggestionsPage`, `NotificationsPage`, `AuditLogsPage` e `IntegrationLogsPage`, porque ainda não existe script `test:mf4`.
- Executar a pesquisa das funções locais `PageFrame` indicada nos passos 4 e 5.
- Executar a pesquisa de imports `../ui/opsaUi` indicada nos passos 4 e 5.
- Testar cenário positivo e cenário negativo descritos nos passos.
- Negativos: mínimo `3`, cobrindo import em falta, função local removida parcialmente e regressão visual MF4.

#### Evidence para PR/defesa

- Screenshot ou gravação curta do ecrã antes/depois em pelo menos dois módulos.
- Output do comando de typecheck ou smoke textual.
- Output da pesquisa que confirma ausência de `PageFrame` local nos ficheiros migrados.
- Resultado do smoke MF4, com páginas testadas e estado observado.
- Descrição do cenário negativo e da mensagem apresentada.
- Lista de ficheiros alterados e ligação ao RNF.

#### Handoff

- Próximo BK recomendado: `BK-MF5-02`.
- Mantém os nomes de ficheiros e exports exatamente como ficaram neste guia.
- `BK-MF5-02` deve partir de `PageFrame`, `StatusMessage`, `ActionToolbar` e `ModuleBadge` em vez de criar uma segunda moldura visual.
- Se o typecheck falhar, corrige imports antes de continuar para o próximo BK.
- Se uma regra de domínio parecer em falta, valida no backend e não resolvas apenas com UI.

#### Changelog

- `2026-06-19`: expande o tutorial para 8 passos, separa a migração MF1/MF2 e MF3/MF4, substitui imports parciais por blocos finais determinísticos e acrescenta smoke MF4 explícito.
- `2026-06-19`: corrige cobertura RNF01 ao incluir páginas dedicadas dos módulos reais, documenta tipos exportados, reforça comentários didáticos e ajusta critérios do primeiro BK da MF5.
- `2026-06-18`: documenta a criação dos componentes transversais de interface usados pelos restantes BKs da MF5.
- `2026-04-17`: guia migrado para naming com slug e template pedagógico-operacional inicial.
