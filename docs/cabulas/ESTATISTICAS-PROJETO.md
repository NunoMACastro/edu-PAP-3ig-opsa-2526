# Estatísticas Do Projeto - OPSA

Data do levantamento: 2026-07-07
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
| Total de documentação e planificação |                                   `docs/**/*.md` |       203 | 115838 |             570.63 |
| Documentação geral                   | `docs/**/*.md`, excluindo `docs/planificacao/**` |        58 |  11322 |             195.21 |
| Planificação                         |                      `docs/planificacao/**/*.md` |       145 | 104516 |             720.80 |

A maior parte da documentação textual do projeto está na planificação. A planificação representa `145` dos `203` ficheiros Markdown contabilizados, ou seja, `71.43%` dos ficheiros e `90.23%` das linhas de documentação.

## Código

### Ficheiros Da App

| Área         |                          Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------ | ------------------------------: | --------: | -----: | -----------------: |
| Total da app | `real_dev/api` + `real_dev/web` |       288 |  45258 |             157.15 |
| Backend      |                  `real_dev/api` |       229 |  34403 |             150.23 |
| Frontend     |                  `real_dev/web` |        59 |  10855 |             183.98 |

Esta contagem inclui os ficheiros de suporte que fazem parte do projeto, como `package-lock.json`, `package.json`, `tsconfig.json`, `.env.example`, `.env.test.example`, Prisma, scripts de validação e evidências técnicas dentro de `real_dev`.

Os ficheiros auxiliares próprios representam `15` ficheiros e `4936` linhas: `10` ficheiros / `3852` linhas no backend e `5` ficheiros / `1084` linhas no frontend.

### Código Estrito

| Área                    |                          Âmbito | Ficheiros | Linhas de código | Média por ficheiro |
| ----------------------- | ------------------------------: | --------: | ---------------: | -----------------: |
| Total de código estrito | `real_dev/api` + `real_dev/web` |       273 |            40322 |             147.70 |
| Backend                 |                  `real_dev/api` |       219 |            30551 |             139.50 |
| Frontend                |                  `real_dev/web` |        54 |             9771 |             180.94 |

## Código Por Extensão

| Extensão  |     Área | Ficheiros | Linhas |
| --------- | -------: | --------: | -----: |
| `.js`     |  Backend |       191 |  25356 |
| `.mjs`    |  Backend |        17 |   2344 |
| `.sql`    |  Backend |        10 |   1562 |
| `.prisma` |  Backend |         1 |   1289 |
| `.tsx`    | Frontend |        19 |   5104 |
| `.ts`     | Frontend |        19 |   2479 |
| `.mjs`    | Frontend |        14 |   1413 |
| `.css`    | Frontend |         1 |    763 |
| `.html`   | Frontend |         1 |     12 |

## Funções E Estrutura Interna

A contagem de funções foi feita por AST com o parser de TypeScript, sobre ficheiros `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` e `.cjs`. A métrica "funções" inclui declarações `function`, function expressions, métodos, construtores e arrow functions. Também inclui callbacks de testes, porque são funções reais mantidas no codebase.

| Métrica                             | Total | Backend | Frontend |
| ----------------------------------- | ----: | ------: | -------: |
| Funções / construções function-like |  2303 |    1664 |      639 |
| Declarações `function`              |   950 |     692 |      258 |
| Function expressions                |     9 |       9 |        0 |
| Arrow functions                     |  1240 |     860 |      380 |
| Métodos                             |   100 |     100 |        0 |
| Construtores                        |     4 |       3 |        1 |
| Classes                             |     4 |       3 |        1 |

## Testes E Código Fonte

| Métrica                   | Total | Backend | Frontend |
| ------------------------- | ----: | ------: | -------: |
| Ficheiros dentro de `src` |   195 |     157 |       38 |
| Linhas dentro de `src`    | 26195 |   17860 |     8335 |
| Ficheiros de teste        |    33 |      33 |        0 |
| Linhas de teste           |  7415 |    7415 |        0 |

As linhas de teste representam `16.38%` das linhas dos ficheiros próprios da app. As linhas dentro de `src` representam `57.88%` das linhas dos ficheiros próprios da app.

## Leitura Rápida

- O projeto tem `203` ficheiros Markdown de documentação e planificação.
- A documentação e planificação somam `115838` linhas.
- A app em `real_dev` tem `288` ficheiros próprios, incluindo código e auxiliares do projeto.
- Esses ficheiros próprios da app somam `45258` linhas.
- Dentro desses ficheiros, o código estrito soma `273` ficheiros e `40322` linhas.
- O codebase tem `2303` funções/construções function-like contabilizadas por AST.
- Existem `33` ficheiros de teste, com `7415` linhas.
- O backend concentra `79.51%` dos ficheiros próprios da app e `76.02%` das linhas da app.
- O frontend concentra `20.49%` dos ficheiros próprios da app e `23.98%` das linhas da app.
