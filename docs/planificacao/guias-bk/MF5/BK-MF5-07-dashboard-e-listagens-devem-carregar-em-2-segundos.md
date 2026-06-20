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
- `last_updated`: `2026-06-18`

#### Objetivo

Neste BK vais implementar dashboard e listagens devem carregar em ≤ 2 segundos. O resultado final é uma melhoria transversal da app OPSA, sem criar endpoints novos nem alterar regras de domínio financeiro.

#### Importância

Performance sem medição vira opinião; este BK transforma o RNF07 em prova observável.

#### Scope-in

- medir carregamento de dashboards e listagens e produzir evidence quando excedem 2 segundos.
- Manter React, Vite, TypeScript e o cliente API existente.
- Produzir evidence observável para PR e defesa PAP.
- Preservar autenticação por cookie HttpOnly e validação backend.

#### Scope-out

- Criar novas regras fiscais, contabilísticas ou legais.
- Criar ORM, endpoints backend ou modelos Prisma novos para RNF01-RNF07.
- Trocar a stack frontend ou adicionar dependências de UI.
- Alterar RF/RNF, backlog, matriz ou ownership dos BKs.

#### Estado antes e depois

- Antes: dashboards e listagens podem parecer lentos sem medição objetiva associada ao RNF07.
- Depois: a UI mede o carregamento de listagens e gera evidence quando o orçamento de 2 segundos é ultrapassado.

#### Pre-requisitos

- Ler `RNF07` em `docs/RNF.md`.
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
- Neste BK, o foco é medir carregamento de dashboards e listagens e produzir evidence quando excedem 2 segundos.
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
- O handoff deste BK prepara `BK-MF6-01`.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/web/src/lib/mf5PerformanceBudget.ts`
- EDITAR: `real_dev/web/src/App.tsx`
- CRIAR: `real_dev/web/scripts/check-mf5-performance.mjs`
- EDITAR: `real_dev/web/package.json`

#### Tutorial técnico linear

### Passo 1 - Definir orçamento mensurável

1. Objetivo funcional do passo no contexto da app.

Transformar `≤ 2 segundos` em constante de código.

O requisito RNF07 define 2 segundos para dashboard e listagens. O frontend deve medir o tempo de carregamento visível, sem alterar queries backend neste BK.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `real_dev/web/src/App.tsx`
    - LOCALIZAÇÃO: `ResourcePanel.load`

3. Instruções do que fazer.

Confirma que as listagens passam por `ResourcePanel.load` e que dashboards específicos podem reutilizar a mesma função.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e prepara a alteração técnica seguinte.

5. Explicação do código.

Este passo mantém o scope em performance observável da UI. Otimizações de base de dados pertencem a BKs de performance posteriores se a medição provar necessidade.

6. Validação do passo.

A análise deve apontar `ResourcePanel.load` como ponto comum.

7. Cenário negativo/erro esperado.

Não declares melhoria de performance sem medição antes/depois.

### Passo 2 - Criar medidor de performance

1. Objetivo funcional do passo no contexto da app.

Medir chamadas assíncronas com orçamento de 2000 ms.

Cria um módulo pequeno e reutilizável.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/lib/mf5PerformanceBudget.ts`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Copia o ficheiro completo.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * @file Orçamento de performance MF5 para dashboard e listagens.
 */

export const MF5_LISTING_BUDGET_MS = 2000;

export interface PerformanceSample {
  label: string;
  durationMs: number;
  withinBudget: boolean;
}

/**
 * Mede a duração de uma operação assíncrona e compara com o orçamento MF5.
 *
 * @typeParam TResult - Tipo devolvido pela operação medida.
 * @param label - Nome do ecrã ou listagem.
 * @param operation - Função assíncrona a medir.
 * @returns Resultado da operação e amostra de performance.
 */
export async function measureListingLoad<TResult>(label: string, operation: () => Promise<TResult>) {
  const startedAt = performance.now();
  const result = await operation();
  const durationMs = Math.round(performance.now() - startedAt);

  const sample: PerformanceSample = {
    label,
    durationMs,
    withinBudget: durationMs <= MF5_LISTING_BUDGET_MS,
  };

  // A medição fica no browser para o aluno provar o RNF07 com evidence objetiva.
  return { result, sample };
}
```

5. Explicação do código.

`measureListingLoad` envolve uma operação assíncrona, calcula duração e devolve amostra. A função não decide negócio; apenas fornece evidence para RNF07.

6. Validação do passo.

Uma operação simulada com atraso de 2100 ms deve devolver `withinBudget: false`.

7. Cenário negativo/erro esperado.

Se a função engolir o erro da operação medida, bugs reais ficam escondidos.

### Passo 3 - Medir carregamento do `ResourcePanel`

1. Objetivo funcional do passo no contexto da app.

Mostrar aviso quando a listagem passa o orçamento.

Atualiza a função `load` dentro de `ResourcePanel`.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/App.tsx`
    - LOCALIZAÇÃO: import no topo e função `load` dentro de `ResourcePanel`

3. Instruções do que fazer.

Acrescenta o import e substitui apenas a função `load` indicada.

4. Código completo, correto e integrado com a app final.

```tsx
import { measureListingLoad } from "./lib/mf5PerformanceBudget";

/**
 * Carrega dados da API e mede se a listagem respeita o orçamento MF5.
 *
 * @returns Promise resolvida quando os dados e a medição ficam atualizados.
 */
async function load() {
  setBusy(true);
  setError(null);
  try {
    const measured = await measureListingLoad(resource.title, () =>
      resource.load(resource.searchable ? search : undefined),
    );
    setRows(measured.result);
    if (!measured.sample.withinBudget) {
      // A UI avisa o operador sem bloquear a listagem, porque performance é evidence e não regra de negócio.
      setError(`${measured.sample.label} demorou ${measured.sample.durationMs} ms, acima do orçamento MF5.`);
    }
  } catch (caught) {
    setError(formatError(caught));
    setRows([]);
  } finally {
    setBusy(false);
  }
}
```

5. Explicação do código.

O painel continua a mostrar dados, mas adiciona aviso se a listagem demorar mais de 2 segundos. Isto cria evidence sem impedir trabalho do utilizador.

6. Validação do passo.

Com rede lenta simulada, a UI deve indicar duração acima do orçamento.

7. Cenário negativo/erro esperado.

Se a medição bloquear a renderização de dados válidos, a solução piorou a experiência.

### Passo 4 - Adicionar smoke textual de performance

1. Objetivo funcional do passo no contexto da app.

Garantir que o orçamento e a medição continuam ligados.

Cria um script simples e adiciona `"test:mf5:performance": "node scripts/check-mf5-performance.mjs"` ao `package.json` do frontend.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/scripts/check-mf5-performance.mjs`
    - EDITAR: `real_dev/web/package.json`
    - LOCALIZAÇÃO: ficheiro completo e secção `scripts`

3. Instruções do que fazer.

Copia o script e regista o comando.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Verificação textual do contrato de performance MF5 no frontend.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const budget = readFileSync(new URL("../src/lib/mf5PerformanceBudget.ts", import.meta.url), "utf8");

// A verificação garante que o orçamento existe e que as listagens o usam.
assert.match(budget, /MF5_LISTING_BUDGET_MS\s*=\s*2000/);
assert.match(budget, /measureListingLoad/);
assert.match(app, /measureListingLoad/);
assert.match(app, /demorou/);

console.info("MF5 performance budget contract OK");
```

5. Explicação do código.

O script valida o contrato textual: orçamento de 2000 ms, função de medição e ligação ao painel. Ele complementa, mas não substitui, evidence real com browser ou screenshot.

6. Validação do passo.

`npm run test:mf5:performance` deve imprimir `MF5 performance budget contract OK`.

7. Cenário negativo/erro esperado.

Remover a chamada a `measureListingLoad` em `App.tsx` deve fazer o smoke falhar.

#### Critérios de aceite

- `RNF07` fica coberto por alteração concreta no frontend ou por smoke textual explícito.
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

- Próximo BK: `BK-MF6-01`.
- Mantém os nomes de ficheiros e exports exatamente como ficaram neste guia.
- Se o typecheck falhar, corrige imports antes de continuar para o próximo BK.
- Se uma regra de domínio parecer em falta, valida no backend e não resolvas apenas com UI.

#### Changelog

- `2026-06-18`: documenta a medição do orçamento de 2 segundos para dashboards e listagens.
- `2026-04-17`: guia migrado para naming com slug e template pedagógico-operacional inicial.
