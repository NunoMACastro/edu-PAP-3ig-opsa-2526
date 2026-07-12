# Estatísticas Do Projeto - OPSA

Data do levantamento: 2026-07-11
Base do levantamento: checkout local `opsa`

## Critérios De Contagem

- Documentação: ficheiros Markdown (`.md`) dentro de `docs/`, incluindo `docs/planificacao/`, `docs/evidence/`, `docs/cabulas/` e este ficheiro.
- Ficheiros da app: ficheiros próprios dentro de `real_dev/api` e `real_dev/web`, incluindo código, configs, `package.json`, `package-lock.json`, `.env.example`, `.env.test.example`, Prisma, scripts, testes e evidências técnicas guardadas dentro de `real_dev`.
- Código estrito: subconjunto dos ficheiros da app com extensões `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.css`, `.html`, `.prisma` e `.sql`.
- Exclusões da app: `node_modules`, `dist`, `coverage`, `playwright-report`, `test-results`, caches, `.DS_Store`, `.env` local e `.env.local`.
- Linha contabilizada: linha física de ficheiro. Linhas em branco e comentários contam, porque representam linhas reais mantidas no projeto.
- Backend: `real_dev/api`.
- Frontend: `real_dev/web`.

## Documentação

| Categoria                            |                                           Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------------------------------ | -----------------------------------------------: | --------: | -----: | -----------------: |
| Total de documentação e planificação |                                   `docs/**/*.md` |       215 | 115223 |             535.92 |
| Documentação geral                   | `docs/**/*.md`, excluindo `docs/planificacao/**` |        67 |  13342 |             199.13 |
| Planificação                         |                      `docs/planificacao/**/*.md` |       148 | 101881 |             688.39 |

A maior parte da documentação textual do projeto está na planificação. A planificação representa `148` dos `215` ficheiros Markdown contabilizados, ou seja, `68.84%` dos ficheiros e `88.42%` das linhas de documentação.

## Código

### Ficheiros Da App

| Área         |                          Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------ | ------------------------------: | --------: | -----: | -----------------: |
| Total da app | `real_dev/api` + `real_dev/web` |       430 |  83036 |             193.11 |
| Backend      |                  `real_dev/api` |       341 |  62633 |             183.67 |
| Frontend     |                  `real_dev/web` |        89 |  20403 |             229.25 |

Esta contagem inclui os ficheiros de suporte que fazem parte do projeto, como `package-lock.json`, `package.json`, `tsconfig.json`, `.env.example`, `.env.test.example`, Prisma, scripts de validação e evidências técnicas dentro de `real_dev`.

Os ficheiros auxiliares próprios representam `19` ficheiros e `8524` linhas: `13` ficheiros / `4575` linhas no backend e `6` ficheiros / `3949` linhas no frontend.

### Código Estrito

| Área                    |                          Âmbito | Ficheiros | Linhas de código | Média por ficheiro |
| ----------------------- | ------------------------------: | --------: | ---------------: | -----------------: |
| Total de código estrito | `real_dev/api` + `real_dev/web` |       411 |            74512 |             181.29 |
| Backend                 |                  `real_dev/api` |       328 |            58058 |             177.01 |
| Frontend                |                  `real_dev/web` |        83 |            16454 |             198.24 |

## Código Por Extensão

| Extensão  |     Área | Ficheiros | Linhas |
| --------- | -------: | --------: | -----: |
| `.js`     |  Backend |       283 |  50514 |
| `.mjs`    |  Backend |        26 |   3854 |
| `.sql`    |  Backend |        18 |   2061 |
| `.prisma` |  Backend |         1 |   1629 |
| `.tsx`    | Frontend |        31 |   9280 |
| `.ts`     | Frontend |        36 |   4583 |
| `.mjs`    | Frontend |        14 |   1437 |
| `.css`    | Frontend |         1 |   1142 |
| `.html`   | Frontend |         1 |     12 |

## Funções E Estrutura Interna

A contagem de funções foi feita por AST com o parser de TypeScript, sobre ficheiros `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` e `.cjs`. A métrica "funções" inclui declarações `function`, function expressions, métodos, construtores e arrow functions. Também inclui callbacks de testes, porque são funções reais mantidas no codebase.

| Métrica                             | Total | Backend | Frontend |
| ----------------------------------- | ----: | ------: | -------: |
| Funções / construções function-like |  4806 |    3644 |     1162 |
| Declarações `function`              |  1438 |    1081 |      357 |
| Function expressions                |    10 |      10 |        0 |
| Arrow functions                     |  3160 |    2356 |      804 |
| Métodos                             |   190 |     190 |        0 |
| Construtores                        |     8 |       7 |        1 |
| Classes                             |     9 |       8 |        1 |

## Testes E Código Fonte

| Métrica                   | Total | Backend | Frontend |
| ------------------------- | ----: | ------: | -------: |
| Ficheiros dentro de `src` |   254 |     192 |       62 |
| Linhas dentro de `src`    | 44775 |   29600 |    15175 |
| Ficheiros de teste        |    98 |      84 |       14 |
| Linhas de teste           | 20212 |   18425 |     1787 |

As linhas de teste representam `24.34%` das linhas dos ficheiros próprios da app. As linhas dentro de `src` representam `53.92%` das linhas dos ficheiros próprios da app.

## Leitura Rápida

- O projeto tem `215` ficheiros Markdown de documentação e planificação.
- A documentação e planificação somam `115223` linhas.
- A app em `real_dev` tem `430` ficheiros próprios, incluindo código e auxiliares do projeto.
- Esses ficheiros próprios da app somam `83036` linhas.
- Dentro desses ficheiros, o código estrito soma `411` ficheiros e `74512` linhas.
- O codebase tem `4806` funções/construções function-like contabilizadas por AST.
- Existem `98` ficheiros de teste, com `20212` linhas.
- O backend concentra `79.30%` dos ficheiros próprios da app e `75.43%` das linhas da app.
- O frontend concentra `20.70%` dos ficheiros próprios da app e `24.57%` das linhas da app.
