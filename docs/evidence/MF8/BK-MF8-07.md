# Evidence MF8 / BK-MF8-07

## Identificacao

- Projeto: `OPSA`
- BK: `BK-MF8-07`
- Tema: UI de planos e gestao da subscricao simulada
- Data de revalidacao: `2026-07-10`
- Implementation root validado: `real_dev`
- Nivel de prova: `ESTATICO_SEM_BROWSER`

## Artefactos verificados

- Cliente: `real_dev/web/src/lib/subscriptionsApi.ts`
- Pagina: `real_dev/web/src/pages/SubscriptionsPage.tsx`
- Rotas e navegacao: `real_dev/web/src/App.tsx`
- Gate: `real_dev/web/scripts/check-mf8-subscriptions-ui.mjs`

## Comando executado

| Diretorio | Comando | Resultado observado |
| --- | --- | --- |
| `real_dev/web` | `npm run test:mf8:subscriptions-ui` | `PASS`; `MF8 subscriptions UI smoke OK`. |

## Contrato estatico observado

- A pagina e o cliente API existem e usam o cliente HTTP central.
- A UI identifica a subscricao como simulada e nao recebe `companyId` como decisao de ownership.
- Acoes de ativacao e ciclo de vida sao encaminhadas para a API.

## Itens ainda nao provados

- Renderizacao e interacao num browser real autenticado.
- Responsividade e acessibilidade nos viewports contratados.
- Fluxo persistido contra PostgreSQL remoto.

## Decisao

`PASS_ESTATICO`; foram removidos a data indefinida, campos por completar e caminhos da implementação dos alunos. O fecho browser permanece pendente.
