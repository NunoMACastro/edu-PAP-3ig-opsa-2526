# Estatísticas Do Projeto - OPSA

Data do levantamento: 2026-07-15
Base do levantamento: checkout local `opsa`

## Critérios De Contagem

- Documentação: ficheiros Markdown (`.md`) dentro de `docs/`, incluindo `docs/planificacao/`, `docs/evidence/`, `docs/cabulas/` e este ficheiro.
- Ficheiros da app: ficheiros próprios dentro de `real_dev/api` e `real_dev/web`, incluindo código, configs, `package.json`, `package-lock.json`, `.env.example`, `.env.test.example`, Prisma, scripts, testes e evidências técnicas guardadas dentro de `real_dev`.
- Código estrito: subconjunto dos ficheiros da app com extensões `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.css`, `.html`, `.prisma` e `.sql`.
- Exclusões da app: `node_modules`, `dist`, `coverage`, `playwright-report`, `test-results`, caches, dados gerados em runtime dentro de `real_dev/api/private-storage`, `.DS_Store`, `.env` local e `.env.local`.
- Linha contabilizada: linha física de ficheiro. Linhas em branco e comentários contam, porque representam linhas reais mantidas no projeto.
- Backend: `real_dev/api`.
- Frontend: `real_dev/web`.

## Documentação

| Categoria                            |                                           Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------------------------------ | -----------------------------------------------: | --------: | -----: | -----------------: |
| Total de documentação e planificação |                                   `docs/**/*.md` |       225 | 117982 |             524.36 |
| Documentação geral                   | `docs/**/*.md`, excluindo `docs/planificacao/**` |        68 |  13529 |             198.96 |
| Planificação                         |                      `docs/planificacao/**/*.md` |       157 | 104453 |             665.31 |

A maior parte da documentação textual do projeto está na planificação. A planificação representa `157` dos `225` ficheiros Markdown contabilizados, ou seja, `69.78%` dos ficheiros e `88.53%` das linhas de documentação.

## Código

### Ficheiros Da App

| Área         |                          Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------ | ------------------------------: | --------: | -----: | -----------------: |
| Total da app | `real_dev/api` + `real_dev/web` |       494 | 101967 |             206.41 |
| Backend      |                  `real_dev/api` |       381 |  75101 |             197.12 |
| Frontend     |                  `real_dev/web` |       113 |  26866 |             237.75 |

Esta contagem inclui os ficheiros de suporte que fazem parte do projeto, como `package-lock.json`, `package.json`, `tsconfig.json`, `.env.example`, `.env.test.example`, Prisma, scripts de validação e evidências técnicas dentro de `real_dev`.

Os ficheiros auxiliares próprios representam `19` ficheiros e `8663` linhas: `13` ficheiros / `4681` linhas no backend e `6` ficheiros / `3982` linhas no frontend.

### Código Estrito

| Área                    |                          Âmbito | Ficheiros | Linhas de código | Média por ficheiro |
| ----------------------- | ------------------------------: | --------: | ---------------: | -----------------: |
| Total de código estrito | `real_dev/api` + `real_dev/web` |       475 |            93304 |             196.43 |
| Backend                 |                  `real_dev/api` |       368 |            70420 |             191.36 |
| Frontend                |                  `real_dev/web` |       107 |            22884 |             213.87 |

## Código Por Extensão

| Extensão  |     Área | Ficheiros | Linhas |
| --------- | -------: | --------: | -----: |
| `.js`     |  Backend |       313 |  61375 |
| `.mjs`    |  Backend |        32 |   5208 |
| `.sql`    |  Backend |        22 |   2180 |
| `.prisma` |  Backend |         1 |   1657 |
| `.tsx`    | Frontend |        48 |  13690 |
| `.ts`     | Frontend |        43 |   6096 |
| `.mjs`    | Frontend |        14 |   1443 |
| `.css`    | Frontend |         1 |   1643 |
| `.html`   | Frontend |         1 |     12 |

## Funções E Estrutura Interna

A contagem de funções foi feita por AST com o parser de TypeScript, sobre ficheiros `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` e `.cjs`. A métrica "funções" inclui declarações `function`, function expressions, métodos, construtores e arrow functions. Também inclui callbacks de testes, porque são funções reais mantidas no codebase.

| Métrica                             | Total | Backend | Frontend |
| ----------------------------------- | ----: | ------: | -------: |
| Funções / construções function-like |  6275 |    4669 |     1606 |
| Declarações `function`              |  1732 |    1273 |      459 |
| Function expressions                |    12 |      12 |        0 |
| Arrow functions                     |  4264 |    3118 |     1146 |
| Métodos                             |   259 |     259 |        0 |
| Construtores                        |     8 |       7 |        1 |
| Classes                             |     9 |       8 |        1 |

## Testes E Código Fonte

| Métrica                   | Total | Backend | Frontend |
| ------------------------- | ----: | ------: | -------: |
| Ficheiros dentro de `src` |   284 |     202 |       82 |
| Linhas dentro de `src`    | 54634 |   34055 |    20579 |
| Ficheiros de teste        |   133 |     104 |       29 |
| Linhas de teste           | 28936 |   24663 |     4273 |

As linhas de teste representam `28.38%` das linhas dos ficheiros próprios da app. As linhas dentro de `src` representam `53.58%` das linhas dos ficheiros próprios da app.

## Leitura Rápida

- O projeto tem `225` ficheiros Markdown de documentação e planificação.
- A documentação e planificação somam `117982` linhas.
- A app em `real_dev` tem `494` ficheiros próprios, incluindo código e auxiliares do projeto.
- Esses ficheiros próprios da app somam `101967` linhas.
- Dentro desses ficheiros, o código estrito soma `475` ficheiros e `93304` linhas.
- O codebase tem `6275` funções/construções function-like contabilizadas por AST.
- Existem `133` ficheiros de teste, com `28936` linhas.
- O backend concentra `77.13%` dos ficheiros próprios da app e `73.65%` das linhas da app.
- O frontend concentra `22.87%` dos ficheiros próprios da app e `26.35%` das linhas da app.
