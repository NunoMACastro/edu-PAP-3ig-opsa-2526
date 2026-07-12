# BK-MF5-02 - Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas.

## Header

- `doc_id`: `GUIA-BK-MF5-02`
- `bk_id`: `BK-MF5-02`
- `macro`: `MF5`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF02`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-03`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-02-layout-responsivo-desktop-tablet-mobile-com-grelhas-e-tabelas-adaptadas.md`
- `last_updated`: `2026-07-10`

#### Contrato responsivo atualizado

Além das tabelas adaptadas, a shell usa navegação mobile em drawer fechado por omissão. Em `375×667`, o conteúdo principal começa até 120 px do topo, não existe overflow horizontal e ações essenciais continuam visíveis por teclado. Validar também `768×1024` e `1440×900` em Chrome, Edge e Firefox; screenshots isolados não substituem browser E2E.

Campos aninhados são renderizados por componentes tipados e labels humanas. Não converter objetos arbitrários em texto JSON na UI de produção.

#### Objetivo

Neste BK vais implementar layout responsivo para as listagens genéricas da OPSA, garantindo que a mesma informação continua legível em desktop, tablet e mobile. O resultado final é uma tabela confortável em ecrãs largos e uma lista de cartões em ecrãs estreitos, sem criar endpoints, sem alterar regras de domínio e sem mudar a autenticação existente.

#### Importância

A OPSA trabalha com dados administrativos e financeiros que aparecem muitas vezes em formato tabular. Uma tabela que obriga a scroll horizontal no telemóvel dificulta tarefas simples como consultar clientes, artigos, compras, vendas ou movimentos. RNF02 exige que a aplicação seja usável em vários tamanhos de ecrã; por isso, o objetivo não é só "encolher" a tabela, mas adaptar a leitura dos dados ao contexto do utilizador.

#### Scope-in

- Criar um componente `ResponsiveDataTable` em `apps/web/src/ui/ResponsiveDataTable.tsx`.
- Atualizar a função `DataTable` em `apps/web/src/App.tsx` para usar o componente novo.
- Acrescentar CSS responsivo em `apps/web/src/styles.css`.
- Preservar a navegação, `ResourcePanel`, loaders existentes e autenticação por cookie HttpOnly.
- Validar desktop, tablet e mobile com critérios observáveis.
- Produzir evidence simples para PR e defesa PAP.

#### Scope-out

- Criar endpoints, modelos Prisma, serviços backend ou regras fiscais novas.
- Alterar RF/RNF, backlog, matriz canónica, ownership ou ordem dos BKs.
- Trocar React, Vite, TypeScript ou o cliente API existente.
- Instalar biblioteca visual externa.
- Reescrever páginas dedicadas de MF1, MF2, MF3 ou MF4.
- Alterar permissões, empresa ativa, validação backend ou regras de auditoria.

#### Estado antes e depois

- Antes: `DataTable` renderiza uma tabela única dentro de `.tableWrap`; em ecrãs estreitos, a tabela tende a ficar dependente de scroll horizontal e a leitura por linha perde clareza.
- Depois: `DataTable` continua a ser chamado pelos mesmos painéis, mas delega em `ResponsiveDataTable`; desktop e tablet largo mostram tabela, mobile mostra cartões com os mesmos campos e valores.

#### Pre-requisitos

- Ler `RNF02` em `docs/RNF.md`.
- Rever `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar que `apps/web/src/App.tsx` ainda contém `ResourcePanel` e `DataTable`.
- Confirmar que `apps/web/src/styles.css` ainda contém `.tableWrap` e a media query principal da shell.
- Confirmar que `apps/web/src/lib/apiClient.ts` usa `credentials: "include"`.
- Confirmar que o BK-MF5-01 deixou preparada a pasta `apps/web/src/ui` para componentes transversais.

#### Glossário

- `Layout responsivo`: layout que se adapta ao tamanho do ecrã sem perder conteúdo importante.
- `Breakpoint`: largura a partir da qual o CSS muda a apresentação.
- `Tabela desktop`: representação tabular com cabeçalhos de coluna e linhas de dados.
- `Cartão mobile`: representação vertical de um registo, com pares campo/valor.
- `Campo`: nome de uma propriedade recebida da API, por exemplo `name`, `status` ou `createdAt`.
- `Valor`: conteúdo de um campo numa linha concreta.
- `Fonte única de dados`: o mesmo array de linhas alimenta tabela e cartões, evitando divergência.
- `Evidence`: prova objetiva para PR ou defesa, como output de comando, screenshot ou comportamento observado.

#### Conceitos teóricos essenciais

- `CANONICO`: RNF02 pede layout responsivo em desktop, tablet e mobile.
- `CANONICO`: a stack validada é React, Vite e TypeScript em `apps/web`.
- `CANONICO`: o cliente HTTP existente usa cookies HttpOnly com `credentials: "include"`; o frontend não guarda credenciais no browser.
- `DERIVADO`: como RNF02 é transversal e visual, a solução deve ficar no frontend e não em novos modelos de dados.
- Uma tabela é boa para comparação horizontal em desktop, mas fica fraca quando a largura disponível deixa de comportar várias colunas.
- Um cartão mobile favorece leitura vertical: primeiro identifica o registo, depois mostra campo e valor.
- O componente responsivo deve usar os mesmos dados para tabela e cartões; se cada formato tiver lógica separada, é fácil esconder campos sem reparar.
- CSS decide apresentação, não segurança. Permissões, empresa ativa e validação de negócio continuam no backend.
- TypeScript ajuda a impedir que objetos complexos sejam renderizados diretamente como filhos React.

#### Arquitetura do BK

- `apps/web/src/App.tsx` continua a compor autenticação, navegação, `ResourcePanel` e chamadas à API.
- `apps/web/src/ui/ResponsiveDataTable.tsx` fica responsável por apresentar a mesma lista como tabela ou cartões.
- `apps/web/src/styles.css` controla a troca visual entre `.responsiveTable` e `.mobileList`.
- `apps/web/src/lib/apiClient.ts` continua a ser o único cliente HTTP base.
- O handoff deste BK prepara o `BK-MF5-03`, que acrescenta feedback imediato às ações.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/web/src/ui/ResponsiveDataTable.tsx`
- EDITAR: `apps/web/src/App.tsx`
- EDITAR: `apps/web/src/styles.css`
- REVER: `apps/web/src/lib/apiClient.ts`
- REVER: `docs/RNF.md`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e limites do RNF02

1. Objetivo funcional do passo no contexto da app.

Garantir que a alteração resolve responsividade sem mudar domínio, API ou permissões.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/styles.css`
    - LOCALIZAÇÃO: `ResourcePanel`, `DataTable`, `.tableWrap`, `@media (max-width: 860px)`

3. Instruções do que fazer.

Confirma que RNF02 trata layout responsivo. Depois identifica a função `DataTable` usada pelas listagens genéricas. A intervenção deve ficar na apresentação dos dados, mantendo loaders e chamadas à API como estão.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura orientada e define os limites técnicos antes da implementação.

5. Explicação do código.

A aplicação já tem separação suficiente para uma alteração pequena: `ResourcePanel` carrega dados e `DataTable` apresenta dados. Como RNF02 é visual, o ponto certo é a renderização da listagem, não a API. Esta decisão reduz risco, porque não toca em autenticação, validação, regras fiscais ou persistência.

6. Validação do passo.

Antes de avançar, confirma estes factos:

- `DataTable` recebe `rows: ApiObject[]`.
- `.tableWrap` existe em `styles.css`.
- A shell já tem uma media query para ecrãs estreitos.
- `apiClient.ts` mantém `credentials: "include"`.

7. Cenário negativo/erro esperado.

Se a proposta exigir endpoint novo ou modelo Prisma novo, está fora do RNF02. Responsividade deve ser resolvida no frontend, com os dados que a app já recebe.

### Passo 2 - Mapear tabela atual e base visual herdada do BK-MF5-01

1. Objetivo funcional do passo no contexto da app.

Perceber que partes da UI já existem para não duplicar estilos ou componentes.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/styles.css`
    - REVER: `apps/web/src/ui/opsaUi.tsx`
    - LOCALIZAÇÃO: imports, `ResourcePanel`, `DataTable`, estilos de painel e tabela

3. Instruções do que fazer.

Verifica se o BK-MF5-01 já criou `apps/web/src/ui/opsaUi.tsx`. Este BK não depende diretamente de `PageFrame`, mas deve seguir a mesma decisão arquitetural: componentes transversais da MF5 ficam em `src/ui`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A implementação começa no passo seguinte.

5. Explicação do código.

O BK-MF5-01 prepara consistência visual geral. Este BK continua esse padrão com um componente dedicado a listagens. Assim, a MF5 evolui por peças pequenas e reutilizáveis, em vez de espalhar regras de responsividade por cada página.

6. Validação do passo.

O resultado esperado é uma decisão clara:

- `ResponsiveDataTable` fica em `apps/web/src/ui/ResponsiveDataTable.tsx`.
- `App.tsx` importa o componente e preserva a assinatura externa de `DataTable`.
- `styles.css` recebe apenas estilos necessários para tabela e cartões.

7. Cenário negativo/erro esperado.

Se cada página receber uma tabela diferente, a manutenção fica pior e RNF02 deixa de ser transversal.

### Passo 3 - Criar `ResponsiveDataTable`

1. Objetivo funcional do passo no contexto da app.

Criar o componente que mostra os mesmos dados como tabela em ecrãs largos e como cartões em ecrãs estreitos.

2. Ficheiros envolvidos:
    - CRIAR: `apps/web/src/ui/ResponsiveDataTable.tsx`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `apps/web/src/ui` se ainda não existir. Depois adiciona o ficheiro completo abaixo. Não removas campos no formato mobile; os cartões devem percorrer as mesmas colunas calculadas para a tabela.

4. Código completo, correto e integrado com a app final.

```tsx
/**
 * @file Tabela responsiva da MF5 para listagens transversais da OPSA.
 */

import type { ReactNode } from "react";

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
 * @param value - Valor simples recebido depois da normalização feita em App.tsx.
 * @returns Texto pronto a apresentar em tabela ou cartão.
 */
function formatCell(value: TableCellValue) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "sim" : "não";
  return String(value);
}

/**
 * Apresenta uma coleção como tabela desktop e como cartões mobile.
 *
 * @param props - Linhas normalizadas, legenda acessível e função para título mobile.
 * @returns Estrutura React com a mesma fonte de dados para os dois formatos.
 */
export function ResponsiveDataTable({ rows, caption, renderMobileTitle }: ResponsiveDataTableProps) {
  if (rows.length === 0) {
    return <p className="empty">Sem registos para apresentar.</p>;
  }

  // Reúne colunas de todas as linhas para cobrir campos opcionais devolvidos pela API.
  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  // A tabela e os cartões partilham rows e columns para manter a mesma fonte de dados.
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
                    {formatCell(row[column])}
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
                <strong>{formatCell(row[column])}</strong>
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

`TableCellValue` limita os valores aceites pelo componente a tipos que React consegue apresentar diretamente. `formatCell` transforma `null`, `undefined` e strings vazias em `-`, para a tabela não ficar com células visualmente quebradas. A lista `columns` é calculada a partir de todas as linhas, não apenas da primeira, porque algumas respostas podem ter campos opcionais. O mesmo array `columns` alimenta tabela e cartões, garantindo que o mobile não perde informação.

6. Validação do passo.

O ficheiro deve compilar sem import de `React` como valor. O componente deve ter:

- Um `caption` para a tabela.
- Uma região com `aria-label`.
- `.responsiveTable` para desktop e tablet largo.
- `.mobileList` para ecrãs estreitos.
- Pelo menos um comentário interno a explicar a regra de não perder dados.

7. Cenário negativo/erro esperado.

Se os cartões mobile usarem uma lista manual de campos, é provável que um campo novo apareça no desktop e desapareça no mobile. Isso viola RNF02 porque a adaptação visual não pode esconder dados relevantes.

### Passo 4 - Normalizar linhas em `App.tsx`

1. Objetivo funcional do passo no contexto da app.

Preparar os dados da API para a tabela responsiva sem passar objetos complexos diretamente para JSX.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: imports do topo, tipos utilitários perto de `ApiObject`, função `DataTable`

3. Instruções do que fazer.

Acrescenta o import do componente novo. Depois adiciona os tipos e helper abaixo perto de `ApiObject`. Por fim, substitui a função `DataTable` existente pela versão completa deste passo.

4. Código completo, correto e integrado com a app final.

```tsx
import { ResponsiveDataTable } from "./ui/ResponsiveDataTable";
import type { TableCellValue, TableRow } from "./ui/ResponsiveDataTable";

type SafeTableRow = TableRow;

/**
 * Converte qualquer valor recebido da API num valor simples para tabela.
 *
 * @param value - Valor bruto vindo de uma linha da API.
 * @returns Valor seguro para a tabela responsiva.
 */
function toSafeCell(value: unknown): TableCellValue {
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "[valor não serializável]";
  }
}

/**
 * Renderiza dados tabulares com adaptação automática para mobile.
 *
 * @param props - Linhas devolvidas pela API para o recurso ativo.
 * @returns Tabela desktop ou cartões mobile com os mesmos dados.
 */
function DataTable({ rows }: { rows: ApiObject[] }) {
  const safeRows: SafeTableRow[] = rows.map((row) => {
    const safeRow: SafeTableRow = {};

    for (const [key, value] of Object.entries(row)) {
      // A normalização fica no wrapper para o componente de UI receber apenas valores simples.
      safeRow[key] = toSafeCell(value);
    }

    return safeRow;
  });

  return (
    <ResponsiveDataTable
      rows={safeRows}
      caption="Registos do módulo ativo"
      renderMobileTitle={(row, index) =>
        String(row.name ?? row.title ?? row.number ?? row.reference ?? `Registo ${index + 1}`)
      }
    />
  );
}
```

5. Explicação do código.

`DataTable` mantém a mesma entrada, `rows: ApiObject[]`, por isso `ResourcePanel` não precisa de mudar. A função `toSafeCell` aceita valores desconhecidos e transforma objetos ou arrays em texto JSON. Este cuidado evita erros de renderização quando a API devolve campos aninhados. O título mobile tenta usar `name`, `title`, `number` ou `reference`; se nenhum existir, mostra `Registo N`.

6. Validação do passo.

Depois da alteração, procura a função `DataTable` antiga e confirma que já não existe uma tabela manual duplicada em `App.tsx`. `ResourcePanel` deve continuar a chamar `<DataTable rows={rows} />`.

7. Cenário negativo/erro esperado.

Se `DataTable` passar objetos diretamente para `ResponsiveDataTable`, o browser pode falhar ao renderizar ou mostrar texto inútil. A correção é manter `toSafeCell` como fronteira entre dados desconhecidos e UI.

### Passo 5 - Acrescentar CSS responsivo

1. Objetivo funcional do passo no contexto da app.

Controlar quando a tabela aparece e quando os cartões mobile substituem a leitura tabular.

2. Ficheiros envolvidos:
    - EDITAR: `apps/web/src/styles.css`
    - LOCALIZAÇÃO: fim do ficheiro, depois dos estilos existentes de tabela e media queries

3. Instruções do que fazer.

Adiciona o bloco completo abaixo. Mantém a regra `.tableWrap` existente; este bloco só acrescenta comportamento para a tabela responsiva.

4. Código completo, correto e integrado com a app final.

```css
/* MF5-02 - listagens responsivas */
.responsiveTable caption {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.mobileList {
  display: none;
}

.mobileList__card {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(30, 41, 59, 0.12);
  border-radius: 0.75rem;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.mobileList__card h3 {
  margin: 0;
  font-size: 1rem;
}

.mobileList__card p {
  display: grid;
  gap: 0.25rem;
  margin: 0;
}

.mobileList__card span {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.mobileList__card strong {
  color: #0f172a;
  font-size: 0.95rem;
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .responsiveTable {
    display: none;
  }

  .mobileList {
    display: grid;
    gap: 0.85rem;
  }
}
```

5. Explicação do código.

Em desktop, `.responsiveTable` continua visível e `.mobileList` fica escondida. Abaixo de `640px`, a tabela é ocultada e os cartões aparecem. A legenda da tabela fica disponível para tecnologias de apoio sem ocupar espaço visual. `overflow-wrap: anywhere` evita que valores longos rebentem o cartão.

6. Validação do passo.

Com viewport `1366x768`, a tabela deve aparecer. Com viewport `390x844`, os cartões devem aparecer e a tabela deve ficar escondida.

7. Cenário negativo/erro esperado.

Se a media query esconder a tabela mas não mostrar `.mobileList`, a listagem fica vazia em mobile. Confirma sempre as duas regras em conjunto.

### Passo 6 - Validar regressão MF1, MF2 e MF3

1. Objetivo funcional do passo no contexto da app.

Garantir que a alteração visual não quebra módulos anteriores.

2. Ficheiros envolvidos:
    - REVER: `apps/web/package.json`
    - EXECUTAR: comandos de validação do frontend
    - LOCALIZAÇÃO: scripts `typecheck`, `test:mf1`, `test:mf2`, `test:mf3`

3. Instruções do que fazer.

Executa os comandos a partir de `apps/web`. Se algum comando falhar, corrige primeiro o erro relacionado com este BK antes de avançar para evidence visual.

4. Código completo, correto e integrado com a app final.

```bash
cd apps/web
npm run typecheck
npm run test:mf1
npm run test:mf2
npm run test:mf3
```

5. Explicação do código.

`typecheck` confirma que os imports, tipos e JSX estão corretos. Os testes MF1, MF2 e MF3 protegem módulos que já existiam antes da MF5. Como `DataTable` é transversal, uma alteração aparentemente visual pode afetar listagens usadas por módulos anteriores.

6. Validação do passo.

O resultado esperado é todos os comandos terminarem com sucesso. Guarda o output relevante para a PR ou defesa.

7. Cenário negativo/erro esperado.

Se `typecheck` indicar que não encontra `./ui/ResponsiveDataTable`, confirma se o ficheiro foi criado no caminho certo e se o import em `App.tsx` está relativo à pasta `src`.

### Passo 7 - Fazer smoke responsivo manual

1. Objetivo funcional do passo no contexto da app.

Confirmar visualmente que a listagem é utilizável em desktop, tablet e mobile.

2. Ficheiros envolvidos:
    - EXECUTAR: app frontend em modo desenvolvimento ou build local
    - REVER: ecrãs com listagens genéricas do menu da OPSA
    - LOCALIZAÇÃO: painéis que usam `ResourcePanel`

3. Instruções do que fazer.

Abre a aplicação autenticada e valida uma listagem genérica com dados. Usa os três tamanhos abaixo:

- Desktop: `1366x768`
- Tablet: `768x1024`
- Mobile: `390x844`

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo. Usa as ferramentas do browser para alterar o viewport e recolher screenshots.

5. Explicação do código.

Este smoke é necessário porque `typecheck` confirma validade técnica, mas não confirma leitura visual. RNF02 só fica demonstrável quando a mesma listagem é observada em larguras diferentes.

6. Validação do passo.

Regista estes resultados:

- Em desktop, `.responsiveTable` está visível e `.mobileList` está escondida.
- Em tablet, a tabela continua legível ou a transição para cartões acontece sem perda de conteúdo.
- Em mobile, `.mobileList` está visível e todos os campos da linha aparecem como pares campo/valor.
- Não existe scroll horizontal obrigatório na listagem mobile.
- Estados empty e erro continuam visíveis.

7. Cenário negativo/erro esperado.

Se um campo aparecer na tabela desktop e não aparecer no cartão mobile, a fonte única de dados foi quebrada. Volta ao componente e confirma que tabela e cartões usam o mesmo array `columns`.

### Passo 8 - Recolher evidence e preparar handoff para BK-MF5-03

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com provas objetivas e deixar o próximo BK com contexto claro.

2. Ficheiros envolvidos:
    - REVER: `apps/web/src/ui/ResponsiveDataTable.tsx`
    - REVER: `apps/web/src/App.tsx`
    - REVER: `apps/web/src/styles.css`
    - REVER: `docs/planificacao/guias-bk/MF5/BK-MF5-03-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-validar-uploads.md`

3. Instruções do que fazer.

Guarda no PR ou na defesa:

- comandos executados e resultado;
- screenshots dos três viewports;
- nota de que `DataTable` preservou a assinatura usada por `ResourcePanel`;
- nota de que o BK-MF5-03 pode assumir listagens legíveis antes de tratar feedback imediato.

4. Código completo, correto e integrado com a app final.

Sem código novo neste passo. Este passo é operacional.

5. Explicação do código.

O handoff evita que o BK seguinte repita trabalho. O BK-MF5-03 deve focar feedback de ações, não voltar a resolver responsividade das listagens.

6. Validação do passo.

A evidence mínima deve incluir:

- `npm run typecheck`: sucesso.
- `npm run test:mf1`: sucesso.
- `npm run test:mf2`: sucesso.
- `npm run test:mf3`: sucesso.
- Screenshot desktop `1366x768`.
- Screenshot tablet `768x1024`.
- Screenshot mobile `390x844`.

7. Cenário negativo/erro esperado.

Se não houver screenshot mobile ou se o mobile ainda depender de scroll horizontal, o BK não deve ser fechado como concluído.

#### Critérios de aceite

- `ResponsiveDataTable.tsx` existe em `apps/web/src/ui`.
- `DataTable` em `App.tsx` delega no novo componente sem alterar a chamada feita por `ResourcePanel`.
- A tabela desktop e os cartões mobile usam a mesma fonte de dados.
- O CSS mostra `.responsiveTable` em ecrãs largos e `.mobileList` em ecrãs até `640px`.
- O frontend continua a usar `credentials: "include"` no cliente API.
- `npm run typecheck`, `npm run test:mf1`, `npm run test:mf2` e `npm run test:mf3` terminam com sucesso.
- A validação manual cobre desktop `1366x768`, tablet `768x1024` e mobile `390x844`.
- A evidence prova que os campos presentes em desktop também aparecem em mobile.

#### Validação final

Executa:

```bash
cd apps/web
npm run typecheck
npm run test:mf1
npm run test:mf2
npm run test:mf3
```

Depois valida manualmente:

- Desktop `1366x768`: tabela visível, cabeçalhos legíveis, sem alteração da navegação.
- Tablet `768x1024`: listagem legível e sem quebra da shell.
- Mobile `390x844`: cartões visíveis, todos os campos preservados, sem scroll horizontal obrigatório.
- Empty state: mensagem `Sem registos para apresentar.` visível quando a lista vem vazia.
- Erro API: mensagem de erro existente continua a aparecer fora da tabela.

Negativos a testar:

- Remover o import de `ResponsiveDataTable` deve fazer `npm run typecheck` falhar.
- Esconder `.mobileList` dentro da media query deve deixar a listagem vazia em mobile.
- Usar campos manuais nos cartões deve permitir perda de dados entre desktop e mobile.
- Passar objetos diretamente para JSX sem `toSafeCell` deve gerar renderização incorreta ou erro.

#### Evidence para PR/defesa

- Output de `npm run typecheck`.
- Output de `npm run test:mf1`.
- Output de `npm run test:mf2`.
- Output de `npm run test:mf3`.
- Screenshot desktop `1366x768` com tabela.
- Screenshot tablet `768x1024` com listagem legível.
- Screenshot mobile `390x844` com cartões.
- Nota curta: "RNF02 validado com tabela desktop e cartões mobile alimentados pela mesma fonte de dados."

#### Handoff

- Próximo BK recomendado: `BK-MF5-03`.
- O BK-MF5-03 deve partir do princípio de que as listagens genéricas já têm leitura responsiva.
- O próximo foco é feedback imediato em ações de guardar, validar e carregar dados.
- Não voltar a mexer em persistência, autenticação ou regras fiscais por causa de RNF02.

#### Changelog

- 2026-06-19: Guia reescrito para corrigir insuficiência pedagógica, ampliar tutorial para 8 passos, acrescentar componente completo, normalização de dados, CSS responsivo, validação concreta e handoff explícito para BK-MF5-03.
