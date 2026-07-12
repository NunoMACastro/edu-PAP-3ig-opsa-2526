# BK-MF5-07 - Dashboard e listagens devem carregar em ≤ 2 segundos.

## Header
- `doc_id`: `GUIA-BK-MF5-07`
- `bk_id`: `BK-MF5-07`
- `macro`: `MF5`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF07`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-01`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-07-dashboard-e-listagens-devem-carregar-em-2-segundos.md`
- `last_updated`: `2026-07-10`

#### Contrato de listagens atualizado

Listagens críticas usam cursor pagination com default 50, máximo 100 e resposta `{ items, pageInfo: { nextCursor, hasNextPage } }`. A UI cancela pesquisas anteriores, deduplica IDs e carrega mais sem repetir mutações. O orçamento de 2 segundos mede browser e API com 25 utilizadores autenticados concorrentes; um smoke textual ou uma lista truncada por `take` não prova performance nem paginação.

#### Objetivo

Neste BK vais transformar o `RNF07` numa regra observável: dashboards e listagens da OPSA devem carregar em até 2 segundos.

No fim, a aplicação fica preparada para medir carregamentos no frontend, avisar quando um ecrã ultrapassa o orçamento de performance e produzir evidence para PR ou defesa PAP. Este BK não cria endpoints, não muda regras financeiras e não decide permissões no browser.

#### Importância

Uma aplicação financeira pode estar funcional e, ao mesmo tempo, ser difícil de usar se cada listagem demorar demasiado. O utilizador precisa de consultar clientes, fornecedores, documentos, relatórios e KPIs sem esperar tempo excessivo.

O `RNF07` obriga a trocar opinião por medição. Em vez de escrever "parece rápido", vais guardar uma medição em milissegundos, mostrar um aviso claro quando o limite é ultrapassado e validar o contrato com um smoke textual.

#### Scope-in

- Medir carregamento de listagens genéricas servidas por `ResourcePanel`.
- Medir dashboards dedicados de relatórios operacionais e KPIs executivos em `apps/web/src/pages/mf3Pages.tsx`.
- Criar um utilitário frontend reutilizável para orçamento de 2 segundos.
- Criar aviso não bloqueante quando a medição ultrapassa 2000 ms.
- Reutilizar o padrão de mensagens claras entregue pelo `BK-MF5-06` para erros reais de API, timeout ou falha de carregamento.
- Criar smoke textual `test:mf5:performance`.
- Manter React, Vite, TypeScript e o cliente API existente.

#### Scope-out

- Criar endpoints backend novos.
- Alterar Prisma, migrations, services, controllers ou regras de domínio financeiro.
- Otimizar queries de base de dados.
- Alterar regras de autenticação, autorização, empresa ativa, ownership, validação backend ou auditoria.
- Adicionar dependências de performance, gráficos ou observabilidade externa.
- Trocar a stack frontend ou criar uma arquitetura paralela.

#### Estado antes e depois

- Antes: o guia media sobretudo listagens genéricas, tinha 4 passos e deixava dashboards dedicados sem instruções concretas.
- Antes: a validação final não indicava expected results específicos para o limite de 2 segundos, o cenário de 2100 ms e os dashboards MF3.
- Depois: o guia tem 8 passos, cobre listagens e dashboards, preserva mensagens claras do `BK-MF5-06` e define comandos/evidence verificáveis.
- Depois: `BK-MF6-01` pode herdar a ideia de orçamento mensurável para fluxos de inserção sem reescrever a base de performance.

#### Pre-requisitos

- Ler `RNF07` em `docs/RNF.md`.
- Rever `BK-MF5-03`, porque ações assíncronas devem mostrar feedback imediato.
- Rever `BK-MF5-04`, porque avisos visuais devem continuar legíveis e acessíveis.
- Rever `BK-MF5-06`, porque erros de carregamento devem continuar a passar por `formatUiError`.
- Confirmar que `apps/web/src/lib/apiClient.ts` usa cookies HttpOnly com `credentials: "include"`.
- Confirmar que `apps/web/src/App.tsx` contém `ResourcePanel`.
- Confirmar que `apps/web/src/pages/mf3Pages.tsx` contém `OperationalReportsPage` e `ExecutiveKpisPage`.
- Confirmar que permissões, empresa ativa, validação final e auditoria continuam no backend.

#### Glossário

- Dashboard: ecrã que resume indicadores relevantes, como relatórios operacionais ou KPIs executivos.
- Listagem: tabela ou coleção de registos carregada a partir da API, como clientes, fornecedores, artigos ou documentos.
- Orçamento de performance: limite máximo aceite para uma operação visível; neste BK é 2000 ms.
- Medição: cálculo da duração real de uma operação assíncrona.
- Amostra de performance: objeto com nome do ecrã, duração em milissegundos e indicação de cumprimento do orçamento.
- Aviso não bloqueante: mensagem que informa que o ecrã foi lento, mas não impede o utilizador de ver dados válidos.
- Smoke textual: script rápido que confirma contratos mínimos lendo ficheiros do projeto.
- Evidence: prova objetiva, como output de comando, screenshot ou descrição do cenário observado.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF07` define que dashboard e listagens devem carregar em até 2 segundos.
- `CANONICO`: `BK-MF5-07` é `P0`, por isso precisa de pelo menos 8 passos e 3 cenários negativos.
- `CANONICO`: a sequência da MF5 termina neste BK e prepara `BK-MF6-01`.
- `DERIVADO`: como o requisito é de performance observável da UI, a solução pode viver no frontend sem criar persistência nova.
- `DERIVADO`: o limite de 2000 ms deve ser uma constante partilhada para evitar números soltos em vários ficheiros.

Uma operação assíncrona é uma tarefa que começa agora e termina mais tarde, como chamar a API. Em React, esse intervalo costuma aparecer como estado de loading. Este BK mede esse intervalo e devolve uma amostra objetiva.

Uma listagem genérica passa por `ResourcePanel`, que carrega linhas para a tabela. Um dashboard dedicado, como relatórios operacionais ou KPIs executivos, não passa por esse componente; por isso também precisa de medição própria em `mf3Pages.tsx`.

Um aviso de performance não é igual a um erro de API. Se a API devolve dados válidos em 2300 ms, o utilizador deve ver os dados e receber aviso. Se a API falha, o erro continua a ser tratado pelo padrão do `BK-MF5-06`, com mensagem clara e próxima ação.

A segurança continua no backend. A medição no browser não decide permissões, empresa ativa, ownership, regras contabilísticas, regras fiscais nem auditoria.

#### Arquitetura do BK

- `apps/web/src/lib/mf5PerformanceBudget.ts` guarda o orçamento de 2 segundos, mede operações assíncronas e formata avisos de performance.
- `apps/web/src/App.tsx` usa `measureListingLoad` no `ResourcePanel`, porque esse componente centraliza listagens genéricas.
- `apps/web/src/pages/mf3Pages.tsx` usa `measureDashboardLoad` nos dashboards de relatórios operacionais e KPIs executivos.
- `apps/web/scripts/check-mf5-performance.mjs` valida que o contrato textual existe e que os ecrãs principais o consomem.
- `apps/web/package.json` expõe `test:mf5:performance`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/lib/mf5PerformanceBudget.ts`
- EDITAR: `apps/web/src/App.tsx`
- EDITAR: `apps/web/src/pages/mf3Pages.tsx`
- CRIAR: `apps/web/scripts/check-mf5-performance.mjs`
- EDITAR: `apps/web/package.json`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `docs/RNF.md`
- REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-06-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md`

#### Tutorial técnico linear

### Passo 1 - Inventariar ecrãs abrangidos pelo RNF07

1. Objetivo funcional do passo no contexto da app.

Confirmar que o requisito cobre listagens e dashboards, não apenas o painel genérico `ResourcePanel`.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/pages/mf3Pages.tsx`
    - LOCALIZAÇÃO: `ResourcePanel`, `OperationalReportsPage` e `ExecutiveKpisPage`.

3. Instruções do que fazer.

Lê o `RNF07` e confirma que o texto fala de dashboard e listagens. Depois localiza:

- `ResourcePanel` em `App.tsx`, porque é o ponto comum das listagens genéricas.
- `OperationalReportsPage` em `mf3Pages.tsx`, porque representa relatórios operacionais.
- `ExecutiveKpisPage` em `mf3Pages.tsx`, porque representa KPIs executivos.

Regista estes três pontos como superfícies mínimas do BK.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é analítico: serve para impedir que o BK resolva só listagens e deixe dashboards fora do requisito.

5. Explicação do código.

Como não há código, a decisão importante é de arquitetura. `ResourcePanel` não cobre todos os ecrãs de performance. Se medires apenas esse componente, ficas sem prova para os dashboards MF3. Esta leitura inicial evita uma implementação incompleta.

6. Validação do passo.

A revisão deve produzir esta lista mínima:

- `ResourcePanel` para listagens genéricas.
- `OperationalReportsPage` para relatórios operacionais.
- `ExecutiveKpisPage` para KPIs executivos.

7. Cenário negativo/erro esperado.

Se o aluno concluir que `ResourcePanel` cobre tudo, o `RNF07` fica incompleto porque dashboards dedicados continuam sem medição.

### Passo 2 - Criar orçamento e medidor de performance MF5

1. Objetivo funcional do passo no contexto da app.

Criar um módulo pequeno que transforma o limite de 2 segundos numa regra reutilizável.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/mf5PerformanceBudget.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo. Ele mede operações assíncronas, distingue dashboard de listagem e formata aviso claro quando o limite é ultrapassado.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * @file Orçamento de performance MF5 para dashboards e listagens da OPSA.
 */

export const MF5_PERFORMANCE_BUDGET_MS = 2000;
export const MF5_LISTING_BUDGET_MS = MF5_PERFORMANCE_BUDGET_MS;
export const MF5_DASHBOARD_BUDGET_MS = MF5_PERFORMANCE_BUDGET_MS;

export type PerformanceSurface = "dashboard" | "listagem";

export interface PerformanceSample {
  label: string;
  surface: PerformanceSurface;
  durationMs: number;
  withinBudget: boolean;
}

/**
 * Mede a duração de uma operação assíncrona da UI e compara com o orçamento MF5.
 *
 * @typeParam TResult - Tipo devolvido pela operação medida.
 * @param surface - Tipo de ecrã medido.
 * @param label - Nome visível do dashboard ou listagem.
 * @param operation - Operação assíncrona que carrega dados.
 * @returns Resultado da operação e amostra de performance.
 */
export async function measureUiLoad<TResult>(
  surface: PerformanceSurface,
  label: string,
  operation: () => Promise<TResult>,
) {
  const startedAt = performance.now();
  const result = await operation();
  const durationMs = Math.round(performance.now() - startedAt);

  const sample: PerformanceSample = {
    label,
    surface,
    durationMs,
    withinBudget: durationMs <= MF5_PERFORMANCE_BUDGET_MS,
  };

  // A medição fica junto da operação para provar o RNF07 sem mudar regras de domínio.
  return { result, sample };
}

/**
 * Mede uma listagem genérica servida pelo ResourcePanel.
 *
 * @typeParam TResult - Tipo devolvido pela operação medida.
 * @param label - Nome visível da listagem.
 * @param operation - Operação que carrega linhas da listagem.
 * @returns Resultado da operação e amostra de performance.
 */
export function measureListingLoad<TResult>(
  label: string,
  operation: () => Promise<TResult>,
) {
  return measureUiLoad("listagem", label, operation);
}

/**
 * Mede um dashboard dedicado, como relatórios operacionais ou KPIs executivos.
 *
 * @typeParam TResult - Tipo devolvido pela operação medida.
 * @param label - Nome visível do dashboard.
 * @param operation - Operação que carrega os dados do dashboard.
 * @returns Resultado da operação e amostra de performance.
 */
export function measureDashboardLoad<TResult>(
  label: string,
  operation: () => Promise<TResult>,
) {
  return measureUiLoad("dashboard", label, operation);
}

/**
 * Formata um aviso claro quando uma amostra ultrapassa o orçamento MF5.
 *
 * @param sample - Amostra de performance calculada no carregamento.
 * @returns Mensagem de aviso ou null quando a operação ficou dentro do orçamento.
 */
export function formatPerformanceWarning(sample: PerformanceSample) {
  if (sample.withinBudget) return null;

  // O aviso é separado de erro de API: dados válidos continuam visíveis ao utilizador.
  return `${sample.label} carregou em ${sample.durationMs} ms, acima do orçamento MF5 de ${MF5_PERFORMANCE_BUDGET_MS} ms. Revê a origem dos dados antes da entrega.`;
}
```

5. Explicação do código.

`MF5_PERFORMANCE_BUDGET_MS` guarda o contrato de 2000 ms num único sítio. `measureUiLoad` recebe uma operação assíncrona, mede quanto tempo demorou e devolve o resultado original com uma amostra de performance. Assim, a medição não altera dados financeiros nem muda a resposta da API.

`measureListingLoad` e `measureDashboardLoad` são funções pequenas para o aluno ler melhor o código nos ecrãs. `formatPerformanceWarning` transforma uma amostra lenta numa mensagem visível. A mensagem é aviso, não erro, porque uma operação lenta pode devolver dados válidos.

6. Validação do passo.

Uma operação simulada que demora `2100` ms deve produzir uma amostra com `withinBudget: false`. Uma operação rápida deve produzir `withinBudget: true`.

7. Cenário negativo/erro esperado.

Se `measureUiLoad` apanhar erros e devolver resultado vazio, a UI pode esconder falhas reais da API. A função deve deixar o erro subir para o `catch` do ecrã.

### Passo 3 - Medir listagens genéricas em `ResourcePanel`

1. Objetivo funcional do passo no contexto da app.

Adicionar medição ao carregamento de listagens sem bloquear dados válidos.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: imports do topo e componente `ResourcePanel`.

3. Instruções do que fazer.

Adiciona o import do medidor MF5. Dentro de `ResourcePanel`, cria estado para aviso de performance, mede `resource.load` com `measureListingLoad` e mostra o aviso abaixo da tabela de ações. Mantém o `catch` com o formatador de erro vindo do `BK-MF5-06`.

4. Código completo, correto e integrado com a app final.

```tsx
import { formatPerformanceWarning, measureListingLoad } from "./lib/mf5PerformanceBudget";
```

```tsx
const [rows, setRows] = useState<ApiObject[]>([]);
const [search, setSearch] = useState("");
const [error, setError] = useState<string | null>(null);
// O aviso fica separado do erro para manter RNF06 e RNF07 com responsabilidades diferentes.
const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);
const [result, setResult] = useState<unknown>(null);
const [busy, setBusy] = useState(false);
```

```tsx
/**
 * Carrega dados da API, mede a duração e atualiza a listagem visível.
 *
 * @returns Promise resolvida depois de atualizar dados, erro ou aviso de performance.
 */
async function load() {
  setBusy(true);
  setError(null);
  setPerformanceWarning(null);
  try {
    const measured = await measureListingLoad(resource.title, () =>
      resource.load(resource.searchable ? search : undefined),
    );

    setRows(measured.result);
    setPerformanceWarning(formatPerformanceWarning(measured.sample));
  } catch (caught) {
    // Erros reais continuam no contrato RNF06; performance lenta é aviso separado.
    setError(formatError(caught));
    setRows([]);
  } finally {
    setBusy(false);
  }
}
```

```tsx
{/* aria-live informa a alteração sem interromper a leitura do ecrã. */}
{performanceWarning ? (
  <p className="warning" aria-live="polite">{performanceWarning}</p>
) : null}
```

5. Explicação do código.

O primeiro bloco adiciona o import. O segundo bloco acrescenta o estado `performanceWarning` junto dos estados já usados por `ResourcePanel`. O terceiro bloco substitui a função `load` completa, mantendo a mesma entrada (`resource.load`) e a mesma saída (`rows`) do componente existente. O quarto bloco deve ser colocado na zona de renderização, antes da mensagem de erro.

`performanceWarning` fica separado de `error` para não confundir lentidão com falha. Se a listagem carregar em 2300 ms, `rows` recebe os dados e o aviso aparece. Se a API falhar, o `catch` usa `formatError`, que deve delegar em `formatUiError` depois do `BK-MF5-06`.

O comentário dentro do `catch` marca a fronteira entre dois contratos: `RNF06` cuida de erros claros; `RNF07` cuida de performance observável.

6. Validação do passo.

Simula rede lenta nas DevTools do browser ou adiciona temporariamente um atraso acima de 2000 ms à operação de carregamento. A listagem deve aparecer quando a API devolve dados, e o aviso deve indicar a duração medida.

7. Cenário negativo/erro esperado.

Se uma falha de API aparecer como aviso de performance, o utilizador recebe uma mensagem errada. Falha de API deve continuar a aparecer como erro claro.

### Passo 4 - Medir dashboards de relatórios e KPIs

1. Objetivo funcional do passo no contexto da app.

Cobrir os dashboards dedicados que não passam por `ResourcePanel`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/pages/mf3Pages.tsx`
    - LOCALIZAÇÃO: imports, `DateRangeForm`, `OperationalReportsPage` e `ExecutiveKpisPage`.

3. Instruções do que fazer.

Adiciona o import de `measureDashboardLoad` e `formatPerformanceWarning`. Depois altera `DateRangeForm` para receber `performanceLabel`. Usa esse rótulo em `OperationalReportsPage` e `ExecutiveKpisPage`.

4. Código completo, correto e integrado com a app final.

```tsx
import { formatPerformanceWarning, measureDashboardLoad } from "../lib/mf5PerformanceBudget";

/**
 * Renderiza um formulário reutilizável de intervalo de datas para relatórios MF3.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com campos de intervalo de datas.
 */
function DateRangeForm({
  label,
  performanceLabel,
  onSubmit,
}: {
  label: string;
  performanceLabel?: string;
  onSubmit: (from: string, to: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // O aviso de performance não substitui a mensagem de erro; são estados diferentes da UI.
  const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);

  /**
   * Processa a submissão do formulário, valida datas locais e mede dashboards MF3.
   *
   * @param event - Evento do formulário submetido.
   * @returns Promise resolvida depois de processar a submissão do formulário.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    setPerformanceWarning(null);
    try {
      const runDashboardQuery = () =>
        onSubmit(
          requiredText(form.get("from"), "Data inicial"),
          requiredText(form.get("to"), "Data final"),
        );

      // performanceLabel limita a medição aos ecrãs que representam dashboards RNF07.
      if (performanceLabel) {
        const measured = await measureDashboardLoad(performanceLabel, runDashboardQuery);
        setPerformanceWarning(formatPerformanceWarning(measured.sample));
      } else {
        await runDashboardQuery();
      }
    } catch (caught) {
      // O BK-MF5-06 continua responsável pela mensagem clara de erros reais.
      setError(formatError(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="operation" onSubmit={submit}>
      <h3>{label}</h3>
      <div className="fields">
        <label>
          <span>Data inicial</span>
          <input name="from" required defaultValue={firstDayOfMonth()} />
        </label>
        <label>
          <span>Data final</span>
          <input name="to" required defaultValue={today()} />
        </label>
      </div>
      {performanceWarning ? (
        <p className="warning" aria-live="polite">{performanceWarning}</p>
      ) : null}
      <Feedback busy={busy} error={error} />
      <button type="submit" disabled={busy}>Consultar</button>
    </form>
  );
}

/**
 * Renderiza o ecrã Operational Reports e mede a duração da consulta.
 *
 * @returns Elemento React renderizado para relatórios operacionais.
 */
export function OperationalReportsPage() {
  const [result, setResult] = useState<unknown>(null);
  return (
    <PageFrame title="Relatórios operacionais">
      <DateRangeForm
        label="Consultar relatório"
        performanceLabel="Relatórios operacionais"
        onSubmit={async (from, to) =>
          setResult(await apiClient.reports.operational(from, to))
        }
      />
      <JsonResult value={result} />
    </PageFrame>
  );
}

/**
 * Renderiza o ecrã Executive KPIs e mede a duração da consulta.
 *
 * @returns Elemento React renderizado para KPIs executivos.
 */
export function ExecutiveKpisPage() {
  const [result, setResult] = useState<unknown>(null);
  return (
    <PageFrame title="KPIs executivos">
      <DateRangeForm
        label="Consultar KPIs"
        performanceLabel="KPIs executivos"
        onSubmit={async (from, to) =>
          setResult(await apiClient.reports.executiveKpis(from, to))
        }
      />
      <JsonResult value={result} />
    </PageFrame>
  );
}
```

5. Explicação do código.

`performanceLabel` indica que aquele uso de `DateRangeForm` representa um dashboard que deve ser medido. O código mede apenas quando o rótulo existe, para não obrigar todos os formulários MF3 a serem tratados como dashboard. `OperationalReportsPage` e `ExecutiveKpisPage` passam rótulos explícitos porque são os dois ecrãs identificados no passo 1.

O `catch` continua a delegar a mensagem de erro no padrão já existente. Se a API falhar, aparece erro. Se a API responder mas demorar acima de 2000 ms, aparece aviso e o resultado continua visível.

6. Validação do passo.

Abre relatórios operacionais e KPIs executivos. Com uma resposta rápida, não deve aparecer aviso. Com atraso acima de 2000 ms, o aviso deve indicar o nome do dashboard e a duração em milissegundos.

7. Cenário negativo/erro esperado.

Se `DateRangeForm` medir todos os formulários sem distinção, podes classificar como dashboard ecrãs que não fazem parte deste BK. Usa `performanceLabel` só nos ecrãs identificados.

### Passo 5 - Criar smoke textual de performance

1. Objetivo funcional do passo no contexto da app.

Criar um comando rápido para provar que o orçamento MF5 existe e que listagens e dashboards o consomem.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/scripts/check-mf5-performance.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o script abaixo. O smoke lê os ficheiros principais e valida contratos textuais mínimos: orçamento de 2000 ms, medição de listagens, medição de dashboards, aviso de performance e cenário lento de 2100 ms.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Verificação textual do contrato de performance MF5 no frontend OPSA.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const budget = readFileSync(new URL("../src/lib/mf5PerformanceBudget.ts", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const mf3 = readFileSync(new URL("../src/pages/mf3Pages.tsx", import.meta.url), "utf8");
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");

function assertIncludes(content, expected, label) {
  // Cada assert descreve o contrato em falta para o aluno corrigir depressa.
  assert.ok(content.includes(expected), `Contrato MF5 em falta: ${label}`);
}

assertIncludes(budget, "MF5_PERFORMANCE_BUDGET_MS = 2000", "orçamento de 2 segundos");
assertIncludes(budget, "measureListingLoad", "medição de listagens");
assertIncludes(budget, "measureDashboardLoad", "medição de dashboards");
assertIncludes(budget, "formatPerformanceWarning", "aviso de performance");
assertIncludes(app, "measureListingLoad", "ResourcePanel mede listagens");
assertIncludes(app, "formatPerformanceWarning", "ResourcePanel mostra aviso");
assertIncludes(mf3, "measureDashboardLoad", "MF3 mede dashboards");
assertIncludes(mf3, "performanceLabel=\"Relatórios operacionais\"", "relatórios operacionais medidos");
assertIncludes(mf3, "performanceLabel=\"KPIs executivos\"", "KPIs executivos medidos");
assertIncludes(packageJson, "\"test:mf5:performance\"", "package expõe comando RNF07");

const slowSample = {
  label: "KPIs executivos",
  surface: "dashboard",
  durationMs: 2100,
  withinBudget: false,
};

// O cenário lento prova que 2100 ms fica fora do orçamento de 2000 ms.
assert.equal(slowSample.durationMs > 2000, true);
assert.equal(slowSample.withinBudget, false);

console.info("MF5 performance budget contract OK");
```

5. Explicação do código.

O script usa `readFileSync` para confirmar que os ficheiros esperados contêm os contratos mínimos. Não executa React nem substitui validação manual em browser. Serve para detetar remoções acidentais: orçamento, medidor de listagens, medidor de dashboards, avisos e comando npm.

O objeto `slowSample` documenta o caso negativo de 2100 ms. Ele não mede a app real; confirma o raciocínio do limite. A evidence real deve incluir browser ou screenshot depois de aplicar o BK.

6. Validação do passo.

Ao executar `npm run test:mf5:performance`, o terminal deve imprimir:

```text
MF5 performance budget contract OK
```

7. Cenário negativo/erro esperado.

Remove temporariamente `measureDashboardLoad` de `mf3Pages.tsx` e volta a executar o smoke. O comando deve falhar com `Contrato MF5 em falta: MF3 mede dashboards`. Reverte a alteração antes de continuar.

### Passo 6 - Registar o comando no `package.json`

1. Objetivo funcional do passo no contexto da app.

Tornar o smoke MF5 executável com o mesmo padrão dos smokes MF1, MF2 e MF3.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/package.json`
    - LOCALIZAÇÃO: objeto `scripts`.

3. Instruções do que fazer.

Adiciona `test:mf5:performance` sem remover comandos existentes. Se os BKs anteriores da MF5 já adicionaram outros comandos `test:mf5:*`, mantém todos.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "test:mf1": "node scripts/check-mf1-pages.mjs",
    "test:mf2": "node scripts/check-mf2-pages.mjs",
    "test:mf3": "node scripts/check-mf3-pages.mjs",
    "test:mf5:feedback": "node scripts/check-mf5-feedback.mjs",
    "test:mf5:a11y": "node scripts/check-mf5-a11y.mjs",
    "test:mf5:forms": "node scripts/check-mf5-form-validation.mjs",
    "test:mf5:errors": "node scripts/check-mf5-error-messages.mjs",
    "test:mf5:performance": "node scripts/check-mf5-performance.mjs",
    "typecheck": "tsc --noEmit"
  }
}
```

5. Explicação do código.

O comando fica junto dos smokes anteriores para a validação da MF5 ser cumulativa. Os comandos `feedback`, `a11y`, `forms` e `errors` vêm dos BKs anteriores da mesma macrofase. Este BK acrescenta apenas `test:mf5:performance`.

Manter os comandos anteriores é importante porque performance não pode quebrar feedback, acessibilidade, validação local nem mensagens claras.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run test:mf5:performance
```

O expected result é `MF5 performance budget contract OK`.

7. Cenário negativo/erro esperado.

Se adicionares `test:mf5:performance` e removeres `test:mf5:errors`, a sequência MF5 perde a validação de mensagens claras. Não removas comandos já entregues por BKs anteriores.

### Passo 7 - Validar cenários positivos e negativos no browser

1. Objetivo funcional do passo no contexto da app.

Confirmar comportamento visível, não apenas contratos textuais.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/pages/mf3Pages.tsx`
    - LOCALIZAÇÃO: listagens genéricas, relatórios operacionais e KPIs executivos.

3. Instruções do que fazer.

Depois de aplicar os passos anteriores, abre a app e testa:

- uma listagem genérica carregada por `ResourcePanel`;
- relatórios operacionais;
- KPIs executivos.

Regista duração observada, aviso apresentado e se os dados continuaram visíveis.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de validação manual, porque o comportamento final precisa de ser observado no browser.

5. Explicação do código.

Não há novo código aqui. O objetivo é confirmar que os passos anteriores funcionam em conjunto: medidor, estado React, aviso, erro claro e dados visíveis. O smoke textual é útil, mas não prova sozinho a experiência do utilizador.

6. Validação do passo.

Expected results:

- Com carregamento até 2000 ms: dados visíveis e sem aviso de performance.
- Com carregamento acima de 2000 ms: dados visíveis e aviso com duração medida.
- Com erro de API: mensagem clara do `BK-MF5-06` e sem dados antigos apresentados como atuais.

7. Cenário negativo/erro esperado.

Se uma resposta lenta limpar dados válidos, a solução piorou a UX. O aviso de performance deve informar sem destruir informação correta.

### Passo 8 - Executar validação final e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com comandos, expected results e evidence para PR ou defesa.

2. Ficheiros envolvidos:
    - REVER: `apps/web/package.json`
    - REVER: `apps/web/scripts/check-mf5-performance.mjs`
    - REVER: `apps/web/src/lib/mf5PerformanceBudget.ts`
    - LOCALIZAÇÃO: comandos npm e evidence final.

3. Instruções do que fazer.

Executa os comandos abaixo depois de aplicar o BK no código:

```bash
cd apps/web
npm run typecheck
npm run test:mf1
npm run test:mf2
npm run test:mf3
npm run test:mf5:feedback
npm run test:mf5:a11y
npm run test:mf5:forms
npm run test:mf5:errors
npm run test:mf5:performance
```

Se algum comando MF5 anterior ainda não existir porque a equipa não aplicou o BK correspondente, regista isso como bloqueio da sequência de implementação antes de avançar.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo fecha validação, evidence e handoff.

5. Explicação do código.

Os comandos protegem a sequência. `typecheck` confirma integração TypeScript. Os smokes MF1 a MF3 protegem módulos anteriores. Os smokes MF5 anteriores confirmam feedback, acessibilidade, formulários e mensagens claras. `test:mf5:performance` confirma o contrato criado neste BK.

6. Validação do passo.

Expected results:

- `npm run typecheck`: termina sem erros TypeScript.
- `npm run test:mf1`: termina com sucesso.
- `npm run test:mf2`: termina com sucesso.
- `npm run test:mf3`: termina com sucesso.
- `npm run test:mf5:performance`: imprime `MF5 performance budget contract OK`.
- Evidence manual: screenshot ou nota com listagem/dashboard medido e duração observada.

7. Cenário negativo/erro esperado.

Se `test:mf5:performance` passar mas `typecheck` falhar, o BK não está pronto. Corrige imports e tipos antes de seguir para `BK-MF6-01`.

#### Critérios de aceite

- `apps/web/src/lib/mf5PerformanceBudget.ts` existe e exporta `MF5_PERFORMANCE_BUDGET_MS`, `measureListingLoad`, `measureDashboardLoad` e `formatPerformanceWarning`.
- `ResourcePanel` mede listagens genéricas e mostra aviso não bloqueante quando o carregamento ultrapassa 2000 ms.
- `OperationalReportsPage` e `ExecutiveKpisPage` medem dashboards dedicados.
- Erros reais continuam a passar pelo padrão de mensagens claras do `BK-MF5-06`.
- Dados válidos continuam visíveis mesmo quando o carregamento é lento.
- `apps/web/scripts/check-mf5-performance.mjs` existe.
- `apps/web/package.json` expõe `test:mf5:performance`.
- O guia tem 8 passos com validação e cenários negativos.
- Nenhuma permissão, empresa ativa, ownership ou regra financeira passa a ser decidida no frontend.

#### Validação final

Executar no frontend:

```bash
cd apps/web
npm run typecheck
npm run test:mf1
npm run test:mf2
npm run test:mf3
npm run test:mf5:performance
```

Expected results:

- `typecheck` sem erros.
- Smokes MF1, MF2 e MF3 sem regressão.
- `test:mf5:performance` imprime `MF5 performance budget contract OK`.
- Teste manual com carregamento acima de 2000 ms mostra aviso e mantém dados válidos visíveis.
- Teste manual com erro de API mostra mensagem clara do `BK-MF5-06`.

#### Evidence para PR/defesa

- Output de `npm run typecheck`.
- Output de `npm run test:mf1`, `npm run test:mf2` e `npm run test:mf3`.
- Output de `npm run test:mf5:performance`.
- Screenshot ou gravação curta de uma listagem carregada dentro do orçamento.
- Screenshot ou gravação curta de dashboard com aviso acima de 2000 ms.
- Nota curta a explicar que a medição é frontend e que segurança, permissões e empresa ativa continuam no backend.

#### Handoff

- Próximo BK: `BK-MF6-01`.
- Mantém `MF5_PERFORMANCE_BUDGET_MS` como fonte única do limite de 2 segundos.
- Mantém `measureListingLoad` para listagens e `measureDashboardLoad` para dashboards.
- Mantém `formatUiError` do `BK-MF5-06` para falhas reais de carregamento.
- Em `BK-MF6-01`, usa a mesma ideia de medição para fluxos de inserção, mas define orçamento próprio de 1 segundo conforme o requisito da MF6.
- Se uma lentidão real vier da API ou base de dados, abre BK técnico próprio; não escondas o problema apenas com aviso na UI.

#### Changelog

- `2026-06-20`: corrige o guia para 8 passos, cobre listagens e dashboards, preserva o handoff do `BK-MF5-06`, adiciona smoke `test:mf5:performance`, expected results e evidence para `RNF07`.
- `2026-06-18`: documenta a medição do orçamento de 2 segundos para dashboards e listagens.
- `2026-04-17`: guia migrado para naming com slug e template pedagógico-operacional inicial.
