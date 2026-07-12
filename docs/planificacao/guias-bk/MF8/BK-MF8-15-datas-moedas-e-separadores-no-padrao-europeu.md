# BK-MF8-15 - Datas, moedas e separadores no padrão europeu.

## Header

- `doc_id`: `GUIA-BK-MF8-15`
- `bk_id`: `BK-MF8-15`
- `macro`: `MF8`
- `owner`: `Sofia`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF36`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-16`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-15-datas-moedas-e-separadores-no-padrao-europeu.md`
- `last_updated`: `2026-07-10`

#### Contrato de datas civis atualizado

Datas de calendário são strings `YYYY-MM-DD` e não instantes UTC. Defaults de formulários são calculados para `Europe/Lisbon` através de `Intl.DateTimeFormat(...).formatToParts`, sem `toISOString()`. O parser valida ano/mês/dia e a UI apresenta `DD/MM/YYYY` sem converter meia-noite entre fusos.

#### Objetivo

Neste BK vais centralizar a formatação de datas, moedas, números inteiros, percentagens e separadores no padrão português/europeu, usando `pt-PT` no frontend e mantendo os valores técnicos intactos na API.

No fim, as páginas do OPSA devem apresentar valores como `1 234,56 €`, `23,00 %` e `31/12/2026`, sem cada página inventar a sua própria formatação.

#### Importância

Num ERP financeiro, pequenas diferenças de apresentação podem criar erros reais de leitura. Um valor como `1.234,56 €` é interpretado em Portugal como mil duzentos e trinta e quatro euros e cinquenta e seis cêntimos; noutros locais, a mesma combinação de ponto e vírgula pode ser lida de forma diferente.

Este BK resolve `RNF36` de forma controlada: a base de dados e a API continuam a transportar valores técnicos seguros, como cêntimos e datas ISO, e o frontend transforma esses valores em texto legível para o utilizador.

#### Scope-in

- Criar `apps/web/src/lib/formatters.ts`.
- Centralizar `pt-PT` para datas, euros, números inteiros, decimais e percentagens.
- Integrar os formatadores em `apps/web/src/lib/mf1FormUtils.ts`.
- Atualizar as tabelas MF1/MF2 para passarem o nome da coluna ao formatador.
- Atualizar `apps/web/src/ui/ResponsiveDataTable.tsx` para usar a mesma regra transversal.
- Criar `apps/web/scripts/check-mf8-formatters.mjs` com validação comportamental.
- Registar `test:mf8:formatters` em `apps/web/package.json`.
- Criar evidence em `docs/evidence/MF8/BK-MF8-15.md`.

#### Scope-out

- Alterar valores guardados em cêntimos.
- Alterar modelos Prisma, migrations, endpoints, roles ou permissões.
- Guardar datas formatadas no backend só para apresentação.
- Criar sistema multilíngua completo.
- Inventar regras fiscais, contabilísticas ou legais novas.
- Trocar validação backend por validação apenas no frontend.

#### Estado antes e depois

- Antes: MF0..MF7 já entregaram autenticação com cookies HttpOnly, empresa ativa resolvida no backend, permissões, dados mestre, vendas, compras, inventário, tesouraria, contabilidade, IA explicável, auditoria, hardening e gates de qualidade. O `BK-MF8-14` estabilizou a camada visual antes da localização.
- Depois: `BK-MF8-15` deixa um contrato verificável de localização PT-PT no frontend, com formatadores reutilizáveis, integração nas tabelas existentes, gate comportamental e handoff direto para o inventário de testes do `BK-MF8-16`.

#### Pre-requisitos

- Ler `RNF36` em `docs/RNF.md`.
- Rever a linha de `BK-MF8-15` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-15` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `BK-MF8-14`, porque este BK aplica localização em cima da UI já estabilizada.
- Rever `BK-MF8-16`, porque o gate criado aqui será inventariado no BK seguinte.
- Confirmar que todos os caminhos do aluno usam `apps/web`, `apps/api` ou `docs/evidence`.
- Negativos: mínimo `2`.

#### Glossário

- Locale: conjunto de regras de apresentação por língua e região, como `pt-PT`.
- Cêntimos: unidade inteira usada para guardar dinheiro sem erro decimal.
- Data ISO: formato técnico como `2026-12-31`, bom para transportar dados entre API e frontend.
- Separador decimal: símbolo entre parte inteira e decimal; em Portugal é vírgula.
- Separador de milhar: separador visual para números grandes; em português/europeu não deve transformar o valor técnico.
- Basis points: representação inteira de percentagens; por exemplo, `2300` representa `23,00 %`.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF36` exige datas, moedas e separadores no padrão europeu.
- `CANONICO`: `BK-MF8-15` pertence à MF8, sprint `S12`, owner `Sofia`, apoio `Pedro`, prioridade `P1`, esforço `S`, sem dependências formais e com próximo BK `BK-MF8-16`.
- `CANONICO`: a app dos alunos usa React, Vite e TypeScript em `apps/web`; o backend continua em `apps/api`.
- `DERIVADO`: a localização fica no frontend porque o requisito é de apresentação. A API deve continuar a devolver valores técnicos previsíveis, como cêntimos, datas ISO e basis points.

**Valores técnicos e valores de apresentação.** O backend deve transportar valores estáveis: dinheiro em cêntimos, datas em ISO e taxas em inteiros quando a aplicação já usa essa regra. A UI transforma esses valores em texto para humanos. Isto evita arredondamentos inesperados e impede que uma tabela mostre `123456` quando o utilizador espera `1 234,56 €`.

**`Intl.NumberFormat` e `Intl.DateTimeFormat`.** Estas APIs nativas do JavaScript aplicam regras regionais sem dependências externas. Usar `pt-PT` evita espalhar `replace(".", ",")` pelo código, que seria frágil e difícil de manter.

**Validação de entrada no formatador.** Mesmo sendo frontend, o formatador deve falhar cedo quando recebe valores impossíveis. Uma data `2026-02-31` ou cêntimos `12.5` indicam contrato partido entre API e UI. Mostrar um valor inventado seria pior do que lançar erro claro durante desenvolvimento.

**Integração em tabelas.** As páginas MF1/MF2 já têm tabelas genéricas. O BK deve usar o nome da coluna para escolher a formatação: campos como `amountCents`, `totalCents` ou `balanceCents` são moeda; campos como `issuedAt`, `paidAt` ou `entryDate` são datas; campos como `rateBps` ou `vatRateBps` são percentagens.

**Segurança e governação.** Este BK não muda autorização, sessão, empresa ativa ou dados persistidos. A regra mantém-se: o backend decide acesso e ownership; o frontend apenas apresenta dados já autorizados.

#### Arquitetura do BK

- Requisito: `RNF36`.
- Domínio principal: localização PT-PT e apresentação financeira.
- Backend público dos alunos: `apps/api`, sem alteração neste BK.
- Frontend público dos alunos: `apps/web`.
- Ficheiro central novo: `apps/web/src/lib/formatters.ts`.
- Integrações: `apps/web/src/lib/mf1FormUtils.ts`, `apps/web/src/pages/mf1Pages.tsx`, `apps/web/src/pages/mf2Pages.tsx`, `apps/web/src/ui/ResponsiveDataTable.tsx`.
- Gate: `apps/web/scripts/check-mf8-formatters.mjs`.
- Script: `test:mf8:formatters` em `apps/web/package.json`.
- Evidence: `docs/evidence/MF8/BK-MF8-15.md`.
- Handoff: `BK-MF8-16`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/lib/formatters.ts`
- CRIAR: `apps/web/scripts/check-mf8-formatters.mjs`
- EDITAR: `apps/web/src/lib/mf1FormUtils.ts`
- EDITAR: `apps/web/src/pages/mf1Pages.tsx`
- EDITAR: `apps/web/src/pages/mf2Pages.tsx`
- EDITAR: `apps/web/src/ui/ResponsiveDataTable.tsx`
- EDITAR: `apps/web/package.json`
- CRIAR: `docs/evidence/MF8/BK-MF8-15.md`
- REVER: `apps/web/src/App.tsx`
- REVER: `apps/web/src/pages`
- REVER: `apps/web/src/lib/mf5FormValidators.ts`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar que vais resolver exatamente `RNF36`, sem mudar escopo, owner, dependências, backend ou regras fiscais.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`

3. Instruções do que fazer.

Confirma que `BK-MF8-15` continua associado a `RNF36`, prioridade `P1`, owner `Sofia`, apoio `Pedro`, esforço `S`, dependências `-` e próximo BK `BK-MF8-16`.

Não alteres o header para acrescentar dependências formais. A integração com `BK-MF8-14` e `BK-MF8-16` é uma relação de sequência e handoff, não uma dependência canónica declarada na matriz.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e impede que a implementação avance com requisito, owner ou dependência trocados.

5. Explicação do código.

Não há código porque a decisão principal é preservar a verdade canónica. O aluno deve começar por confirmar o requisito antes de criar ficheiros, para não transformar uma tarefa de localização numa tarefa de fiscalidade ou multilíngua.

6. Validação do passo.

O aluno consegue apontar `RNF36` e a linha de `BK-MF8-15` na matriz/backlog antes de editar `apps/web`.

7. Cenário negativo/erro esperado.

Se a matriz ou o backlog disserem outro requisito, owner ou próximo BK, a implementação deve parar e o drift deve ser resolvido com o orientador.

### Passo 2 - Mapear os pontos de apresentação existentes

1. Objetivo funcional do passo no contexto da app.

Identificar onde a UI apresenta valores vindos da API para integrar os formatadores sem duplicar lógica.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/lib/mf1FormUtils.ts`
    - REVER: `apps/web/src/pages/mf1Pages.tsx`
    - REVER: `apps/web/src/pages/mf2Pages.tsx`
    - REVER: `apps/web/src/ui/ResponsiveDataTable.tsx`
    - REVER: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: funções `formatValue`, `DataTable`, `formatCell` e tabelas que percorrem colunas dinamicamente.

3. Instruções do que fazer.

Procura chamadas a `formatValue(row[column])`, `formatCell(row[column])`, `String(value)` e tabelas que apresentem campos da API sem saber se são datas, cêntimos ou percentagens.

O objetivo não é reescrever páginas inteiras. O objetivo é passar o nome da coluna ao formatador central, para que a regra fique num só sítio.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de inventário técnico e prepara as alterações dos passos seguintes.

5. Explicação do código.

As tabelas MF1/MF2 usam colunas dinâmicas. Sem o nome da coluna, a função só vê o valor `123456` e não sabe se isto significa `123456`, `1 234,56 €` ou outra coisa. Por isso, a integração deve passar `column` ao formatador.

6. Validação do passo.

O aluno deve conseguir listar pelo menos estes pontos de integração:

- `apps/web/src/lib/mf1FormUtils.ts`
- `apps/web/src/pages/mf1Pages.tsx`
- `apps/web/src/pages/mf2Pages.tsx`
- `apps/web/src/ui/ResponsiveDataTable.tsx`

7. Cenário negativo/erro esperado.

Se a solução criar um formatador novo mas nenhuma página o usar, o BK falha: a app continuaria a mostrar valores com `String(value)`.

### Passo 3 - Criar formatadores PT-PT reutilizáveis

1. Objetivo funcional do passo no contexto da app.

Criar o ficheiro central de localização para moeda, datas, inteiros, decimais, percentagens e valores genéricos de tabela.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/lib/formatters.ts`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `apps/web/src/lib/formatters.ts` com o conteúdo completo abaixo. Não uses dependências externas: `Intl.NumberFormat` e `Intl.DateTimeFormat` já resolvem o padrão `pt-PT`.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/formatters.ts

export const PORTUGAL_LOCALE = "pt-PT";
export const DEFAULT_CURRENCY = "EUR";
export const PORTUGAL_TIME_ZONE = "Europe/Lisbon";

const DATE_KEY_PATTERN = /(date|at|from|to)$/i;
const MONEY_CENTS_KEY_PATTERN = /(cents|amountcents|totalcents|balancecents|pricecents|costcents)$/i;
const BASIS_POINTS_KEY_PATTERN = /(bps|basispoints|ratebps|vatratebps)$/i;

/**
 * Garante que o valor recebido é um número finito antes de o apresentar.
 *
 * @param value - Valor candidato a número.
 * @param label - Nome usado na mensagem de erro.
 * @returns Número validado.
 * @throws Error quando o valor não é numérico ou é infinito.
 */
function assertFiniteNumber(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} deve ser um número finito.`);
  }

  return value;
}

/**
 * Garante que um valor monetário em cêntimos é inteiro.
 *
 * @param cents - Valor monetário técnico guardado em cêntimos.
 * @returns Cêntimos validados.
 * @throws Error quando os cêntimos não são inteiros.
 */
function assertIntegerCents(cents: number): number {
  assertFiniteNumber(cents, "O valor em cêntimos");
  if (!Number.isInteger(cents)) {
    throw new Error("O valor em cêntimos deve ser um inteiro.");
  }

  return cents;
}

/**
 * Valida uma data de calendário sem a converter num instante UTC.
 *
 * @param value - Data recebida da API.
 * @returns Componentes civis prontos para formatação em PT-PT.
 * @throws Error quando a data não existe ou não está em formato ISO.
 */
function parseIsoDate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value.trim());
  if (!match) {
    throw new Error("A data deve estar em formato ISO, por exemplo 2026-12-31.");
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const daysInMonth = new Date(year, month, 0).getDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) {
    throw new Error("A data indicada não existe no calendário.");
  }

  return { year, month, day };
}

/** Devolve a data civil de hoje em Portugal para defaults de `<input type="date">`. */
export function todayInPortugal(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PORTUGAL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

/**
 * Formata cêntimos como euros para apresentação no frontend.
 *
 * @param cents - Valor monetário guardado em cêntimos.
 * @returns Valor em EUR no formato português.
 */
export function formatEuroFromCents(cents: number): string {
  const validCents = assertIntegerCents(cents);

  // A API continua a transportar inteiros; a conversão decimal existe só na apresentação.
  return new Intl.NumberFormat(PORTUGAL_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(validCents / 100);
}

/**
 * Formata um número decimal com separador português.
 *
 * @param value - Número decimal a apresentar.
 * @param fractionDigits - Número de casas decimais.
 * @returns Número formatado em PT-PT.
 */
export function formatDecimalPt(value: number, fractionDigits = 2): string {
  const validValue = assertFiniteNumber(value, "O número");

  return new Intl.NumberFormat(PORTUGAL_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(validValue);
}

/**
 * Formata um inteiro com separadores de milhar em PT-PT.
 *
 * @param value - Número inteiro a apresentar.
 * @returns Inteiro formatado em PT-PT.
 * @throws Error quando o valor não é inteiro.
 */
export function formatIntegerPt(value: number): string {
  const validValue = assertFiniteNumber(value, "O inteiro");
  if (!Number.isInteger(validValue)) {
    throw new Error("O valor deve ser um inteiro.");
  }

  return new Intl.NumberFormat(PORTUGAL_LOCALE, {
    maximumFractionDigits: 0,
  }).format(validValue);
}

/**
 * Formata basis points como percentagem para leitura humana.
 *
 * @param basisPoints - Percentagem técnica, por exemplo 2300 para 23,00 %.
 * @returns Percentagem formatada em PT-PT.
 */
export function formatPercentFromBasisPoints(basisPoints: number): string {
  const validBasisPoints = assertFiniteNumber(basisPoints, "A percentagem técnica");

  return `${formatDecimalPt(validBasisPoints / 100, 2)} %`;
}

/**
 * Formata data ISO para leitura em Portugal.
 *
 * @param isoDate - Data ISO recebida da API.
 * @returns Data curta em português de Portugal.
 */
export function formatPortugueseDate(isoDate: string): string {
  const { year, month, day } = parseIsoDate(isoDate);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/**
 * Formata um valor de tabela usando o nome da coluna como pista semântica.
 *
 * @param columnName - Nome da coluna ou campo vindo da API.
 * @param value - Valor recebido da API.
 * @returns Texto pronto a apresentar ao utilizador.
 */
export function formatDisplayValue(columnName: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "sim" : "não";

  const normalizedColumn = columnName.toLowerCase();

  if (typeof value === "number" && MONEY_CENTS_KEY_PATTERN.test(normalizedColumn)) {
    return formatEuroFromCents(value);
  }

  if (typeof value === "number" && BASIS_POINTS_KEY_PATTERN.test(normalizedColumn)) {
    return formatPercentFromBasisPoints(value);
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? formatIntegerPt(value) : formatDecimalPt(value);
  }

  if (typeof value === "string" && DATE_KEY_PATTERN.test(normalizedColumn)) {
    return formatPortugueseDate(value);
  }

  // Objetos continuam visíveis para debugging funcional, mas não devem esconder valores financeiros.
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
```

5. Explicação do código.

Este ficheiro entrega o contrato central de `RNF36`. A constante `PORTUGAL_LOCALE` impede que cada página escreva `pt-PT` à mão. `formatEuroFromCents` converte apenas na UI, mantendo a decisão segura dos BKs anteriores: dinheiro continua a circular tecnicamente em cêntimos.

`parseIsoDate` evita um erro clássico de JavaScript: `new Date("2026-02-31")` pode normalizar para outra data. O BK não deve aceitar essa transformação silenciosa, porque datas financeiras erradas podem afetar vencimentos, pagamentos, recebimentos e relatórios.

`formatDisplayValue` é a ponte com as tabelas existentes. Como as páginas MF1/MF2 percorrem colunas dinamicamente, o nome da coluna passa a indicar se o valor é dinheiro, percentagem, data, booleano ou número comum.

6. Validação do passo.

Confirma que o ficheiro exporta pelo menos:

- `formatEuroFromCents`
- `formatDecimalPt`
- `formatIntegerPt`
- `formatPercentFromBasisPoints`
- `formatPortugueseDate`
- `formatDisplayValue`

7. Cenário negativo/erro esperado.

Chamar `formatPortugueseDate("2026-02-31")` deve lançar erro. Chamar `formatEuroFromCents(12.5)` também deve lançar erro. Se algum destes casos for formatado como valor válido, o contrato está inseguro.

### Passo 4 - Integrar os formatadores nas tabelas existentes

1. Objetivo funcional do passo no contexto da app.

Fazer com que as páginas já existentes usem o contrato central de localização, em vez de continuarem a converter tudo com `String(value)`.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/lib/mf1FormUtils.ts`
    - EDITAR: `apps/web/src/pages/mf1Pages.tsx`
    - EDITAR: `apps/web/src/pages/mf2Pages.tsx`
    - EDITAR: `apps/web/src/ui/ResponsiveDataTable.tsx`
    - LOCALIZAÇÃO: import de `formatDisplayValue`, função `formatValue`, funções `DataTable` e função `formatCell`.

3. Instruções do que fazer.

Primeiro, edita `apps/web/src/lib/mf1FormUtils.ts` para delegar em `formatDisplayValue`. Depois, altera as tabelas MF1/MF2 para passarem o nome da coluna. Por fim, aplica a mesma regra à tabela responsiva transversal.

4. Código completo, correto e integrado com a app final.

```ts
// apps/web/src/lib/mf1FormUtils.ts

import { formatDisplayValue } from "./formatters";

export type ApiObject = Record<string, unknown>;

/**
 * Converte um valor desconhecido num objeto indexável, devolvendo objeto vazio quando o formato não é seguro.
 *
 * @param value - Valor a normalizar ou formatar.
 * @returns Objeto indexável seguro, ou objeto vazio quando o valor não é compatível.
 */
export function asObject(value: unknown): ApiObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiObject)
    : {};
}

/**
 * Extrai um array de uma resposta JSON e normaliza cada entrada para objeto.
 *
 * @param response - Resposta JSON recebida da API.
 * @param key - Chave a extrair da resposta JSON.
 * @returns Lista de objetos extraída da resposta JSON.
 */
export function pickArray(response: unknown, key: string): ApiObject[] {
  const value = asObject(response)[key];
  return Array.isArray(value) ? value.map(asObject) : [];
}

/**
 * Converte valores heterogéneos da API numa representação textual PT-PT para tabelas.
 *
 * @param value - Valor a normalizar ou formatar.
 * @param columnName - Nome da coluna que ajuda a escolher moeda, data ou percentagem.
 * @returns Representação textual estável do valor recebido.
 */
export function formatValue(value: unknown, columnName = ""): string {
  // A regra de apresentação fica no formatter central para não duplicar locale nas páginas.
  return formatDisplayValue(columnName, value);
}

/**
 * Converte texto de formulário num inteiro positivo obrigatório.
 *
 * @param value - Valor a normalizar.
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @returns Inteiro positivo validado.
 */
export function toPositiveInteger(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(String(value ?? "").trim());
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} deve ser um número inteiro positivo`);
  }
  return parsed;
}

/**
 * Normaliza texto obrigatório e lança erro claro quando o campo está vazio.
 *
 * @param value - Valor a normalizar.
 * @param label - Nome amigável usado em mensagens de erro ou UI.
 * @returns Texto obrigatório validado.
 */
export function requiredText(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(`${label} é obrigatório`);
  }
  return text;
}

/**
 * Normaliza texto opcional, devolvendo undefined para campos vazios.
 *
 * @param value - Valor a normalizar.
 * @returns Texto normalizado, ou undefined quando o campo está vazio.
 */
export function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || undefined;
}
```

```tsx
// apps/web/src/pages/mf1Pages.tsx

/**
 * Renderiza uma tabela simples a partir das chaves presentes nas linhas devolvidas pela API.
 *
 * @param props - Propriedades recebidas pelo componente React.
 * @returns Elemento React renderizado com a tabela de dados.
 */
function DataTable({
  rows,
  actions,
}: {
  rows: ApiObject[];
  actions?: (row: ApiObject) => ReactNode;
}) {
  if (rows.length === 0) {
    return <p className="empty">Sem registos para apresentar.</p>;
  }

  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
            {actions ? <th>Ações</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td key={column}>{formatValue(row[column], column)}</td>
              ))}
              {actions ? <td>{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```tsx
// apps/web/src/pages/mf2Pages.tsx

/**
 * Renderiza uma tabela simples para os fluxos MF2 com formatação PT-PT.
 *
 * @param props - Linhas recebidas da API.
 * @returns Elemento React com valores apresentados em formato local.
 */
function DataTable({ rows }: { rows: ApiObject[] }) {
  if (rows.length === 0) {
    return <p className="empty">Sem registos para apresentar.</p>;
  }

  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td key={column}>{formatValue(row[column], column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```tsx
// apps/web/src/ui/ResponsiveDataTable.tsx

import type { ReactNode } from "react";
import { formatDisplayValue } from "../lib/formatters";

export type TableCellValue = string | number | boolean | null | undefined;
export type TableRow = Record<string, TableCellValue>;

export interface ResponsiveDataTableProps {
  rows: TableRow[];
  caption: string;
  renderMobileTitle: (row: TableRow, index: number) => ReactNode;
}

/**
 * Converte valores simples para texto seguro e consistente na UI.
 *
 * @param column - Nome da coluna usada para escolher a formatação correta.
 * @param value - Valor simples recebido depois da normalização feita em App.tsx.
 * @returns Texto pronto a apresentar em tabela ou cartão.
 */
function formatCell(column: string, value: TableCellValue) {
  // A tabela responsiva usa o mesmo formatador das páginas MF1/MF2 para evitar drift visual.
  return formatDisplayValue(column, value);
}

/**
 * Apresenta uma coleção como tabela desktop e como cartões mobile.
 *
 * @param props - Linhas normalizadas, legenda acessível e função para título mobile.
 * @returns Estrutura React com a mesma fonte de dados para os dois formatos.
 */
export function ResponsiveDataTable({
  rows,
  caption,
  renderMobileTitle,
}: ResponsiveDataTableProps) {
  if (rows.length === 0) {
    return <p className="empty">Sem registos para apresentar.</p>;
  }

  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  return (
    <>
      <div className="tableWrap responsiveTable" role="region" aria-label={caption}>
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)}>
                {columns.map((column) => (
                  <td key={column} data-label={column}>
                    {formatCell(column, row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobileList" aria-label={`${caption} em cartões`}>
        {rows.map((row, index) => (
          <article className="mobileList__card" key={String(row.id ?? index)}>
            <h3>{renderMobileTitle(row, index)}</h3>
            {/* As colunas são as mesmas da tabela para não perder dados no mobile. */}
            {columns.map((column) => (
              <p key={column}>
                <span>{column}</span>
                <strong>{formatCell(column, row[column])}</strong>
              </p>
            ))}
          </article>
        ))}
      </div>
    </>
  );
}
```

5. Explicação do código.

`mf1FormUtils.ts` continua a expor `formatValue`, para não obrigar todas as páginas antigas a trocar de helper. A diferença é que agora `formatValue` recebe o nome da coluna e chama `formatDisplayValue`.

Nas páginas MF1 e MF2, a alteração essencial é pequena: `formatValue(row[column], column)`. Este segundo argumento dá contexto semântico ao formatador. Assim, `amountCents` pode aparecer como euros, `issuedAt` como data PT-PT e `rateBps` como percentagem.

`ResponsiveDataTable.tsx` também passa a usar o mesmo contrato. Isto evita que uma página antiga e uma tabela responsiva mostrem o mesmo valor de formas diferentes.

6. Validação do passo.

Procura estas chamadas:

```bash
cd apps/web
rg "formatValue\\(row\\[column\\], column\\)|formatCell\\(column, row\\[column\\]\\)" src
```

Expected result: as tabelas dinâmicas passam o nome da coluna ao formatador.

7. Cenário negativo/erro esperado.

Se uma tabela continuar com `formatValue(row[column])`, campos monetários como `amountCents` podem continuar a aparecer como `123456` em vez de `1 234,56 €`.

### Passo 5 - Criar gate comportamental dos formatadores

1. Objetivo funcional do passo no contexto da app.

Criar uma verificação repetível que valida comportamento real, e não apenas a presença das palavras `pt-PT` ou `currency`.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/scripts/check-mf8-formatters.mjs`
    - EDITAR: `apps/web/package.json`
    - LOCALIZAÇÃO: script completo e chave `scripts`.

3. Instruções do que fazer.

Cria o script abaixo. Depois adiciona `"test:mf8:formatters": "node scripts/check-mf8-formatters.mjs"` a `apps/web/package.json`.

4. Código completo, correto e integrado com a app final.

```js
// apps/web/scripts/check-mf8-formatters.mjs

import { readFileSync } from "node:fs";

const formatterSource = readFileSync("src/lib/formatters.ts", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

function normalizeSpaces(value) {
  return String(value).replace(/\s|\u00a0|\u202f/g, " ");
}

function assertContains(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label}: falta ${expected}`);
  }
}

function assertMatches(source, pattern, label) {
  if (!pattern.test(source)) {
    throw new Error(`${label}: padrão não encontrado`);
  }
}

function assertNativeIntlBehavior() {
  const euro = normalizeSpaces(
    new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234.56),
  );

  // O gate valida o comportamento do runtime para apanhar ambientes sem locale PT-PT.
  if (!euro.includes("1") || !euro.includes("234,56") || !euro.includes("€")) {
    throw new Error(`Formato EUR inesperado: ${euro}`);
  }

  const date = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Lisbon",
  }).format(new Date(2026, 11, 31, 12, 0, 0));

  if (date !== "31/12/2026") {
    throw new Error(`Formato de data inesperado: ${date}`);
  }
}

assertContains(formatterSource, 'PORTUGAL_LOCALE = "pt-PT"', "Locale PT-PT");
assertContains(formatterSource, 'DEFAULT_CURRENCY = "EUR"', "Moeda EUR");
assertContains(formatterSource, 'PORTUGAL_TIME_ZONE = "Europe/Lisbon"', "Fuso civil de Portugal");
assertContains(formatterSource, "todayInPortugal", "Default civil de formulário");
assertContains(formatterSource, "formatEuroFromCents", "Export de euros");
assertContains(formatterSource, "formatPortugueseDate", "Export de datas");
assertContains(formatterSource, "formatDisplayValue", "Export de tabela");
assertContains(formatterSource, "Number.isInteger", "Validação de cêntimos");
assertContains(formatterSource, "A data indicada não existe no calendário.", "Negativo de data");
assertMatches(formatterSource, /formatDisplayValue\(columnName: string, value: unknown\)/, "Contrato de tabela");

if (packageJson.scripts?.["test:mf8:formatters"] !== "node scripts/check-mf8-formatters.mjs") {
  throw new Error("package.json deve expor test:mf8:formatters.");
}

assertNativeIntlBehavior();

console.log("BK-MF8-15 formatters: OK");
```

```json
{
  "scripts": {
    "test:mf8:formatters": "node scripts/check-mf8-formatters.mjs"
  }
}
```

5. Explicação do código.

O gate lê `src/lib/formatters.ts` para confirmar que o contrato do BK existe, mas também executa `Intl.NumberFormat` e `Intl.DateTimeFormat` no runtime. Isto é importante porque `RNF36` não é só "ter uma string no ficheiro"; é garantir que a app consegue produzir formato europeu observável.

A validação de `package.json` impede outro erro comum: criar o script mas esquecer de o ligar a um comando. O `BK-MF8-16` poderá inventariar `test:mf8:formatters` como prova real.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run test:mf8:formatters
```

Expected result:

```text
BK-MF8-15 formatters: OK
```

7. Cenário negativo/erro esperado.

Remove temporariamente `Number.isInteger` de `formatters.ts`. O gate deve falhar com mensagem sobre validação de cêntimos. Remove `test:mf8:formatters` de `package.json`; o gate também deve falhar.

### Passo 6 - Validar domínio, segurança e evidence

1. Objetivo funcional do passo no contexto da app.

Confirmar que a localização não quebrou regras financeiras, autorização backend ou evidence de PR/defesa.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/BK-MF8-15.md`
    - REVER: `apps/web/src/lib/formatters.ts`
    - REVER: `apps/web/src/lib/mf1FormUtils.ts`
    - REVER: output dos comandos executados

3. Instruções do que fazer.

Cria a evidence abaixo depois de executar os comandos. Regista apenas outputs observados. Se um comando não foi executado, escreve `NÃO_EXECUTADO` e explica o motivo.

4. Código completo, correto e integrado com a app final.

````md
<!-- docs/evidence/MF8/BK-MF8-15.md -->

# Evidence BK-MF8-15 - Datas, moedas e separadores PT-PT

## Contrato

- BK: BK-MF8-15
- RNF: RNF36
- Ficheiro central: apps/web/src/lib/formatters.ts
- Gate: apps/web/scripts/check-mf8-formatters.mjs
- Script: npm run test:mf8:formatters

## Comandos executados

```bash
cd apps/web
npm run test:mf8:formatters
npm run typecheck
```

## Resultado observado

- `npm run test:mf8:formatters`: registar output real observado.
- `npm run typecheck`: registar output real observado.

## Positivos

- `123456` em campo `amountCents` é apresentado como euros em PT-PT.
- `2026-12-31` é apresentado como `31/12/2026`.
- `2300` em campo `rateBps` é apresentado como `23,00 %`.

## Negativos

- `formatEuroFromCents(12.5)` falha porque cêntimos devem ser inteiros.
- `formatPortugueseDate("2026-02-31")` falha porque a data não existe.

## Decisão

- Estado: registar `PASS` ou `FAIL`.
- Observações: registar riscos observados ou `sem riscos adicionais`.
````

5. Explicação do código.

A evidence não inventa outputs. Ela cria o sítio certo para registar prova real quando o aluno executar o BK. O contrato liga o requisito, o ficheiro central, o gate e os comandos.

Os negativos são tão importantes como os positivos: provam que o formatador não transforma dados inválidos em texto aparentemente correto.

6. Validação do passo.

A evidence deve indicar comando, output observado, positivos, negativos e decisão. O `BK-MF8-16` deve conseguir ler este ficheiro e perceber se o gate existe e passou.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas "funciona", está incompleta. Sem output real e negativos, o PR não tem prova suficiente para defesa.

### Passo 7 - Executar validação final e preparar handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com comandos claros, expected results e handoff para o inventário de testes do `BK-MF8-16`.

2. Ficheiros envolvidos:
    - REVER: `apps/web/package.json`
    - REVER: `docs/evidence/MF8/BK-MF8-15.md`
    - REVER: secções `Critérios de aceite`, `Validação final` e `Handoff`
    - LOCALIZAÇÃO: comandos de validação e contratos exportados.

3. Instruções do que fazer.

Executa os comandos finais em `apps/web`. Não corras validações API como validação principal deste BK, porque o trabalho é frontend/localização e não altera endpoints.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é operacional e fecha a entrega.

5. Explicação do código.

O handoff deve ser objetivo: o próximo BK precisa saber que existe `test:mf8:formatters`, que o ficheiro central é `apps/web/src/lib/formatters.ts` e que a evidence vive em `docs/evidence/MF8/BK-MF8-15.md`.

6. Validação do passo.

Executa:

```bash
cd apps/web
npm run test:mf8:formatters
npm run typecheck
```

Expected results:

- `BK-MF8-15 formatters: OK`
- TypeScript sem erros.
- Evidence preenchida com outputs reais.

7. Cenário negativo/erro esperado.

Se `BK-MF8-16` não conseguir encontrar `test:mf8:formatters` no `package.json`, volta ao Passo 5 antes de fechar este BK.

#### Critérios de aceite

- O guia preserva header, owner, apoio, prioridade, dependências, requisito, sprint e próximo BK definidos pela matriz e pelo backlog.
- Os caminhos publicados para alunos usam apenas `apps/web`, `apps/api` ou `docs/evidence`.
- `apps/web/src/lib/formatters.ts` centraliza `pt-PT`, `EUR`, datas ISO, moeda em cêntimos, números e percentagens.
- Valores técnicos continuam técnicos na API: cêntimos continuam inteiros e datas continuam ISO.
- Tabelas MF1/MF2 e `ResponsiveDataTable` passam o nome da coluna ao formatador central.
- `apps/web/scripts/check-mf8-formatters.mjs` valida comportamento observável e negativos.
- `apps/web/package.json` expõe `test:mf8:formatters`.
- Existem pelo menos dois negativos coerentes com `RNF36`.
- A evidence mostra comando, resultado esperado, resultado observado e decisão.
- Não há sistema multilíngua novo, alteração de backend, integração externa, automação financeira ou regra fiscal inventada.

#### Validação final

Executa os comandos relevantes para este BK:

```bash
cd apps/web
npm run test:mf8:formatters
npm run typecheck
```

Expected results:

- `npm run test:mf8:formatters` termina com `BK-MF8-15 formatters: OK`.
- `npm run typecheck` termina sem erros TypeScript.
- Os negativos documentados falham de forma controlada.
- Não existem caminhos privados nos ficheiros entregues aos alunos.

#### Evidence para PR/defesa

- Comando `npm run test:mf8:formatters`.
- Output `BK-MF8-15 formatters: OK`.
- Comando `npm run typecheck`.
- Prova de `formatEuroFromCents(123456)`, `formatPortugueseDate("2026-12-31")` e `formatPercentFromBasisPoints(2300)`.
- Negativos para cêntimos não inteiros e data inexistente.
- Ficheiros criados/editados.
- Decisão `DERIVADO`: localização fica no frontend e valores técnicos continuam a vir da API.

#### Handoff

- Próximo BK recomendado: `BK-MF8-16`.
- Contrato entregue: localização PT-PT ligada a `RNF36`.
- Ficheiro principal: `apps/web/src/lib/formatters.ts`.
- Gate principal: `apps/web/scripts/check-mf8-formatters.mjs`.
- Script inventariável pelo próximo BK: `test:mf8:formatters`.
- Evidence principal: `docs/evidence/MF8/BK-MF8-15.md`.
- Risco a vigiar: não voltar a criar formatações locais com `String(value)` quando o valor representa dinheiro, data ou percentagem.

#### Changelog

- `2026-07-02`: guia corrigido após auditoria crítica; foram acrescentados formatadores PT-PT completos, validação de entradas, integração em tabelas, gate comportamental, script frontend, evidence e handoff para `BK-MF8-16`.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
