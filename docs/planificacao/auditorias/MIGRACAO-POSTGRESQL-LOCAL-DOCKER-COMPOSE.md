# Migração do PostgreSQL local para Docker Compose

## Header

- `doc_id`: `MIGRACAO-POSTGRESQL-LOCAL-DOCKER-COMPOSE`
- `path`: `docs/planificacao/auditorias/MIGRACAO-POSTGRESQL-LOCAL-DOCKER-COMPOSE.md`
- `area`: `real_dev`
- `owner`: `Nuno`
- `status`: `VALIDADO_LOCAL_COM_BLOQUEIOS_EXTERNOS`
- `last_updated`: `2026-07-13`

## Objetivo

Registar a passagem da demonstração académica de um PostgreSQL instalado ou
fornecido externamente para um PostgreSQL local reproduzível em Docker Compose.
A alteração não containeriza a API, workers ou frontend e não adiciona Redis,
SMTP ou S3 à demo.

Este relatório é interno e pode citar `real_dev`. Os guias dos alunos traduzem
sempre os mesmos contratos para `apps/api` e `apps/web`.

## Decisão mínima

- Um único ficheiro `real_dev/compose.yaml`, com projeto fixo
  `opsa-real-dev`.
- PostgreSQL `17.10-alpine3.23`; na execução de 2026-07-13 foi observado o
  digest `sha256:8189a1f6e40904781fc9e2612687877791d21679866db58b1de996b31fc312e4`.
- Uma base persistente de desenvolvimento e duas bases descartáveis isoladas
  para integração e restore.
- Um serviço sem porta pública para executar `pg_dump`, `pg_restore` e `psql`.
- Portas publicadas apenas em loopback: `5433`, `5434` e `5435`.
- Aplicação com role própria e credenciais distintas das de bootstrap. As
  credenciais fixas são demonstrativas, limitadas a loopback e não podem ser
  reutilizadas noutro ambiente.
- Modo nativo preservado para PostgreSQL externo. Não existe fallback
  silencioso entre ferramentas nativas e Compose.

## Topologia contratada

| Serviço | Host | Persistência | Uso |
|---|---:|---|---|
| `postgres` | `127.0.0.1:5433` | volume `opsa-real-dev-postgres-data` | demo e desenvolvimento |
| `postgres-test` | `127.0.0.1:5434` | descartável | integração persistida |
| `postgres-restore` | `127.0.0.1:5435` | descartável | prova de restore |
| `postgres-tools` | sem porta | sem dados próprios | client tools PostgreSQL |

Os serviços de teste e restore não reutilizam o volume da demo. Parar um
serviço não equivale a apagar dados; o reset local é uma ação separada e exige
`--confirm=opsa_dev`.

## Interface operacional

Os scripts estão em `real_dev/api/package.json`:

```text
db:local:check/start/status/logs/setup/stop/reset
db:test:start/reset/stop
db:restore:start/reset/stop
test:integration:postgres-local
test:integration:external
```

`db:local:setup` agrega apenas o percurso pedagógico necessário: valida
Docker/Compose e configuração local, arranca PostgreSQL, gera Prisma, aplica
migrations, executa a seed demo e verifica-a. Não cria um process manager nem
arranca API, workers ou frontend.

O gate `test:integration:postgres-local` usa a base descartável de `5434`,
executa a integração PostgreSQL sequencialmente e para o serviço no fim. A
suite `test:integration:external` mantém os cenários que exigem providers
externos; a separação impede que um `SKIP` ambiental seja confundido com prova
PostgreSQL.

## Migrations de dados incluídas no upgrade

O setup aplica também duas migrations não destrutivas:

1. `20260713110000_sync_company_nif`: trata `CompanyProfile.nif` como fonte
   canónica e sincroniza `Company.nif`. Se o NIF pertencer a outra empresa,
   aborta toda a migration sem apagar ou escolher dados.
2. `20260713120000_treasury_movements`: adiciona
   `Receipt.treasuryAccountId` e `Payment.treasuryAccountId`, índices e relações
   `RESTRICT`. As colunas são nullable para preservar movimentos históricos.

A seed associa apenas os movimentos demonstrativos a contas reais da mesma
empresa. Não é feito backfill arbitrário de movimentos anteriores.

## Percurso de migração seguro

1. Guardar qualquer base local anterior através do backup existente e verificar
   manifesto e SHA-256.
2. Deixar `db:local:setup` criar `.env` a partir do exemplo quando não existe;
   se já existir, o gestor valida as URLs locais e o modo Compose sem o
   reescrever. Se o objetivo não for a demo local, não usar este Compose:
   selecionar o modo nativo e injetar a ligação externa por ambiente.
3. Executar `npm --prefix real_dev/api run db:local:check`.
4. Executar `npm --prefix real_dev/api run db:local:setup`.
5. Confirmar `db:local:status`, migrations e `db:seed:verify`.
6. Executar `test:integration:postgres-local`, incluindo base vazia, upgrade,
   colisão de NIF e preservação dos movimentos históricos.
7. Arrancar `db:restore:start` e executar `mf7:backup:roundtrip`.
8. Parar com `db:restore:stop` e `db:local:stop`. Estes comandos preservam os
   dados; não usar reset como cleanup habitual.

Não existe importação automática de uma instalação PostgreSQL do host para o
volume Compose. Quando for necessário conservar esses dados, o percurso é
backup verificado e restore explícito numa base descartável antes de promover a
cópia.

## Segurança e limites

- As credenciais presentes no Compose são apenas valores fixos da demo local,
  não segredos. URLs com password não são colocadas em argumentos, logs ou
  neste relatório.
- Os ports não escutam em interfaces externas.
- O init cria a role aplicacional sem dar à API a role administrativa.
- Healthchecks usam `pg_isready`; readiness da aplicação continua read-only.
- O volume da demo é o único persistente. Teste e restore podem ser recriados.
- `db:local:reset` é destrutivo, limitado ao projeto Compose e protegido por
  confirmação explícita.
- O adaptador Compose de client tools aceita apenas endpoints locais conhecidos
  e mounts limitados ao diretório do dump.
- Bases remotas e backup remoto continuam no modo nativo, com a configuração
  production-like já existente.

## Artefactos documentais sincronizados

- `real_dev/README.md`: bootstrap, quatro processos, lifecycle e falhas comuns.
- `real_dev/api/prisma/SEED-DEMO.md`: setup, migrations e movimentos de
  tesouraria da seed.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`: contrato de stack local.
- `docs/planificacao/guias-bk/MF8/ARRANQUE-LOCAL.md`: tutorial público.
- `BK-MF7-01`: backup/restore através de `postgres-tools`.
- `BK-MF8-02`: readiness com PostgreSQL local real.
- `docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md`: rollout e recuperação.

## Estado da evidência

### Validação operacional de 2026-07-13

- Docker `29.6.1` e Compose `v5.2.0`.
- Compose config em `PASS`.
- Imagem e digest observados conforme a secção **Decisão mínima**.
- Setup em `PASS`: `SELECT 1` autenticado, `21` migrations, seed+verify e demo
  persistente healthy em `127.0.0.1:5433`.
- Reset explícito em `PASS`: só o serviço/volume da demo foi removido e o setup
  completo voltou a ser executado; teste e restore mantiveram-se isolados.
- Integração PostgreSQL `11/11` e seed idempotente/sentinela `1/1`, zero skips.
- Carga `light` em `901 ms` e `medium` em `4485 ms`.
- Backup de `429610` bytes, verify/roundtrip em `PASS`, `21` migrations, todas
  as `69` entidades/tabelas comparadas e cleanup temporário.
- Revalidação posterior do tools container com UID/GID do host: roundtrip
  `PASS`, dump de `429553` bytes, as mesmas `21` migrations e `69` entidades.
- Regressão: API `407/407` unitários, `174/174` contratos e MF6/MF7/MF8 PASS;
  web `18` ficheiros/`55` testes, typecheck/build PASS; Playwright normal
  `25/25` em três viewports e seeded `3/3`; npm audit API/web com zero
  vulnerabilidades.

A prova detalhada está em
`docs/evidence/MF8/EXECUCAO-DOCKER-COMPOSE-POSTGRESQL.md`.

O teste externo foi executado e falhou fechado sem `TEST_DATABASE_URL` remota,
Redis e SMTP. O gate académico foi executado, mas parou no preflight com Node
`24.11.1`, abaixo de `>=24.17`; não se alegam as fases seguintes. S3, SAF-T
externo e a matriz browser compat continuam externos.

Conclusão: a migração PostgreSQL Docker Compose está `VALIDADO_LOCAL`; o estado
global permanece condicionado por toolchain e providers externos.
