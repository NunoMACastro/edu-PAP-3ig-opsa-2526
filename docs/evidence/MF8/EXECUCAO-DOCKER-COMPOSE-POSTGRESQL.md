# Execução Docker Compose PostgreSQL

## Identificação

- Projeto: `OPSA`
- Implementation root: `real_dev`
- Data da execução: `2026-07-13`
- Âmbito: PostgreSQL local, migrations, seed, integração, backup/restore e
  regressão académica local
- Decisão: `PASS_LOCAL_COM_BLOQUEIOS_EXTERNOS_E_TOOLCHAIN`

## Runtime observado

| Componente | Resultado observado |
| --- | --- |
| Docker | `29.6.1` |
| Docker Compose | `v5.2.0` |
| Imagem | `postgres:17.10-alpine3.23` |
| Digest observado | `sha256:8189a1f6e40904781fc9e2612687877791d21679866db58b1de996b31fc312e4` |
| Configuração Compose | `PASS` |
| PostgreSQL demo | healthy em `127.0.0.1:5433` |

As portas PostgreSQL estão limitadas a loopback. A imagem e o digest acima são
os valores observados nesta execução, não uma garantia sobre execuções futuras.

## Setup e persistência

O percurso `db:local:setup` terminou com `PASS` e confirmou:

- ligação autenticada com `SELECT 1`;
- `21` migrations aplicadas;
- geração do Prisma Client;
- seed demo executada e verificada;
- dados da demo preservados no volume persistente;
- serviço `postgres` healthy em `127.0.0.1:5433`.

O reset explícito foi também executado com `--confirm=opsa_dev`: removeu apenas
o serviço e o volume persistente da demo, voltou a aplicar as `21` migrations,
seed e verificação, e terminou em `PASS`. Os serviços de integração e restore
permaneceram separados e não foram removidos pelo reset local.

## Integração PostgreSQL e carga

| Prova | Resultado |
| --- | --- |
| Integração PostgreSQL local | `11/11` PASS, zero skips |
| Seed idempotente e sentinela externa | `1/1` PASS, zero skips |
| Seed de carga `light` | `901 ms` |
| Seed de carga `medium` | `4485 ms` |

Estas provas fecharam o bloqueio local de PostgreSQL para migrations,
persistência, concorrência coberta pelas suites e preservação de dados. Não
substituem Redis distribuído, SMTP sandbox, S3 ou uma base remota dedicada.

## Backup e restore

O modo Compose executou as PostgreSQL client tools através de
`postgres-tools`, sem depender dos binários no host.

| Prova | Resultado observado |
| --- | --- |
| Backup local | `PASS`; dump com `429610` bytes |
| Verificação | `PASS`; manifesto e hash aceites |
| Roundtrip | `PASS` |
| Migrations restauradas | `21` |
| Comparação | todas as `69` entidades/tabelas |
| Cleanup | artefactos temporários removidos |

O roundtrip usou a base descartável de restore. O resultado não prova o bundle
S3 remoto, que continua dependente de infraestrutura externa.

Após a revisão de portabilidade Linux, `postgres-tools` passou a executar com
o UID/GID do processo host. O roundtrip foi repetido com esta configuração:
dump de `429553` bytes, `21` migrations, `69` entidades/tabelas e cleanup em
`PASS`. O valor `429610` da tabela corresponde à primeira execução válida.

## Regressão da aplicação

| Camada | Resultado observado |
| --- | --- |
| API unitários | `407/407` PASS |
| API contratos | `174/174` PASS |
| API MF6 | `PASS` |
| API MF7 | `PASS` |
| API MF8 | `PASS` |
| Web Vitest | `18` ficheiros, `55` testes PASS |
| Web typecheck | `PASS` |
| Web build | `PASS` |
| Playwright normal | `25/25` PASS em três viewports |
| Playwright seeded | `3/3` PASS |
| npm audit API | `0` vulnerabilidades |
| npm audit web | `0` vulnerabilidades |

O Playwright normal usa o Chromium incluído. Chrome, Edge e Firefox do gate
`test:e2e:compat` continuam uma matriz externa/opcional e não foram promovidos
a PASS por esta execução.

## Falhas fechadas e limites

- `test:integration:external` foi executado e falhou fechado porque não estavam
  disponíveis `TEST_DATABASE_URL` remota, Redis e SMTP sandbox.
- `gate:academic` foi executado, mas terminou no preflight: Node `24.11.1` não
  cumpre `>=24.17 <25`. As fases posteriores desse gate não são declaradas como
  executadas.
- S3 remoto e SAF-T externo continuam dependências externas por provar.
- A matriz browser compatível com Chrome/Edge/Firefox continua adicional e não
  foi executada nesta evidência.

Não houve skips na integração PostgreSQL local. Falhas externas não foram
convertidas em PASS nem substituídas por doubles.

## Decisão

O percurso académico local PostgreSQL/Compose, incluindo migrations, seed,
integração, backup/restore, frontend e E2E Chromium, fica `PASS` nesta execução.
O estado global não pode ser declarado verde enquanto persistirem o preflight
Node incompatível e as provas externas de PostgreSQL remoto, Redis, SMTP, S3 e
SAF-T externo.
