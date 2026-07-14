# OPERACAO-DEPLOY-ROLLBACK

## Header
- `doc_id`: `OPERACAO-DEPLOY-ROLLBACK`
- `path`: `docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-13`

## Objetivo
Definir o procedimento académico de release e rollback demonstrável para a fase
final da PAP. Este contrato não afirma a existência de infraestrutura de
produção, deployment permanente ou scheduler 24/7.

O fluxo de restore está implementado, mas a prova remota continua pendente. O
estado atual da implementação de referência é `NO_GO`; este runbook define o
procedimento de demonstração e não substitui evidence runtime.

## Estratégia de release académica

1. Executar apenas em ambientes dedicados a desenvolvimento/teste, locais ou
   remotos, sem dados produtivos.
2. Fixar Node `>=24.17 <25`, npm 11 e os hashes dos dois lockfiles.
3. Executar `npm --prefix apps/api run gate:academic` sem skips.
4. Exigir `documentation_sync_pass=true` e bloquear a demonstração se
   `overall_pass=false` ou se existir qualquer P0/P1 aberto. SAF-T académico é
   aceite apenas quando está marcado não certificado; o modo externo continua
   a exigir XSD e pipeline externo.
5. Guardar no relatório canónico comandos, exit codes e hashes; nunca guardar
   credenciais, cookies, URLs com password ou dados pessoais.

## Pre-checks obrigatorios
- Node `>=24.17 <25` e npm 11.
- Migrations aplicadas numa base PostgreSQL vazia e sobre uma cópia com a
  versão anterior do schema.
- `npm --prefix apps/api run gate:academic:report` em `PASS`: todos os
  findings `P0`/`P1` estão `FECHADO` e apenas `OPSA-E2E-RISK-001` permanece
  `RISCO_ACEITE`.
- `bash scripts/validate-planificacao.sh` em `PASS` sem advisories não waived.
- Smoke funcional dos fluxos criticos (`RF14`, `RF19`, `RF33`, `RF36`, `RF39`).
- Verificacao de saude tecnica minima:
  - `/api/health/live` ativo e `/api/health/ready` positivo;
  - o readiness normal usa apenas probes baratos e read-only;
  - `npm --prefix apps/api run health:deep-check` é executado uma vez no gate operacional, não por monitores;
  - logs estruturados ativos;
  - variaveis de ambiente criticas validadas.
- Verificacao de risco aberto: sem bloqueio `P0` por resolver.
- `npm --prefix apps/api run mf7:backup:roundtrip` com manifesto e SHA-256,
  restauro PostgreSQL descartável e comparação de tabelas. A variante S3 é uma
  prova adicional quando o provider remoto está configurado.

## Migração PostgreSQL da demonstração

1. Executar `npm --prefix apps/api run db:local:check` e confirmar as portas
   locais `5433`, `5434` e `5435` livres.
2. Arrancar desenvolvimento com `npm --prefix apps/api run db:local:start` e
   confirmar o serviço através de
   `npm --prefix apps/api run db:local:status`.
3. Antes de qualquer upgrade com dados, criar e verificar um backup. Não usar
   `npm --prefix apps/api run db:local:reset -- --confirm=opsa_dev`, porque esse
   comando elimina deliberadamente o volume da demo.
4. Executar `npm --prefix apps/api run db:local:setup`. O fluxo aplica
   migrations forward-only, cria a seed apenas no namespace demo e verifica o
   resultado.
5. Provar upgrade numa base descartável com
   `npm --prefix apps/api run test:integration:postgres-local`. A sincronização
   de NIF deve abortar em colisão entre empresas; movimentos históricos mantêm
   conta de tesouraria nula.
6. Arrancar `npm --prefix apps/api run db:restore:start` e executar
   `npm --prefix apps/api run mf7:backup:roundtrip` antes da apresentação.
   Parar os serviços com `npm --prefix apps/api run db:restore:stop` e
   `npm --prefix apps/api run db:local:stop`, que preservam os volumes.

Não existe migration down automática. Se uma migration falhar, interrompe o
arranque, preserva logs redigidos e corrige a causa. Depois de uma migration
aplicada com mutação de dados, o rollback seguro é repor a cópia estável da
aplicação e restaurar o backup verificado numa base descartável; nunca editar a
tabela de migrations manualmente.

## Processos de notificações e EmailOutbox

- A API, o worker de notificações e o worker SMTP são três processos separados.
  A API não materializa notificações durante pedidos HTTP.
- O processo contínuo de materialização é
  `npm --prefix apps/api run worker:notifications`; a execução de um ciclo
  finito é `npm --prefix apps/api run worker:notifications:drain`.
- O worker percorre empresas em páginas de 100, usa uma transação por empresa,
  continua após falha isolada e impede ciclos sobrepostos no mesmo processo.
  O resumo expõe apenas contagens estruturadas.
- O intervalo usa `NOTIFICATION_WORKER_INTERVAL_MS`, entre 60 000 e 86 400 000
  ms, com default de 300 000 ms.
- A materialização grava a notificação e o payload cifrado na `EmailOutbox`
  dentro da mesma transação. Só o worker de email consome essa outbox.
- O processo contínuo é `npm --prefix apps/api run worker:email`; a
  drenagem finita para teste é
  `npm --prefix apps/api run worker:email:drain`.
- Antes de consumir, o worker verifica a ligação SMTP. Cada mensagem é reclamada
  por lease atómico; leases expirados são recuperáveis e falhas usam retry
  exponencial limitado por número máximo de tentativas.
- Um supervisor académico deve arrancar os três processos separadamente,
  reiniciar qualquer worker após falha e tratar qualquer exit code não zero como blocker. Não
  existe fallback de log/mock em produção ou configuração equivalente.
- No encerramento, enviar `SIGTERM`, parar novas claims, aguardar a operação em
  curso e fechar Prisma. Evidence regista apenas contagens, duração, estados e
  códigos redigidos; nunca payload, destinatário ou credenciais SMTP.
- A prova de email usa SMTP sandbox e inclui reset, convite, lease/retry e
  drenagem. Sem credenciais remotas, permanece `BLOQUEADO_AMBIENTE`.

## Gatilhos para terminar a demonstração e reverter
- Erro bloqueante em fluxo critico apos deploy.
- Quebra de integridade contabilistica detetada em smoke.
- Regressao grave de performance em operacoes criticas.
- Falha de readiness numa dependência crítica.
- Divergência de hashes, contagens ou objetos no restauro.

## Procedimento de rollback (passo a passo)
1. Declarar incidente e congelar novas alteracoes.
2. Identificar a cópia académica estável anterior pelos hashes registados no
   relatório. Não presumir que um checkout Git reverte dados já migrados.
3. Repor a cópia estável apenas no ambiente descartável de demonstração.
4. Reexecutar smoke tecnico e funcional minimo.
5. Confirmar restabelecimento de logs, health-check e fluxos criticos.
6. Registar causa, impacto e acao corretiva no scorecard da sprint.

## Contrato de agendamento do backup

- O comando diário é `npm --prefix apps/api run mf7:backup`.
- A instalação que venha a alojar a aplicação deverá invocá-lo uma vez por dia
  com exclusão mútua e alertar em qualquer exit code diferente de zero.
- A retenção é definida por `BACKUP_RETENTION_DAYS` e só é aplicada depois de o
  novo bundle estar completo no bucket dedicado `BACKUP_S3_BUCKET`.
- O bucket de backup tem de ser diferente de `S3_BUCKET`; todos os PUT remotos
  exigem `S3_SSE`. O dump e o manifesto plaintext locais são transitórios,
  privados e removidos em `finally`, inclusive quando `pg_dump` ou um upload
  falham.
- O output seguro do backup inclui `manifestBackupKey` e `manifestSha256`. Para
  uma verificação posterior, fornecê-los por canal seguro através de
  `OPSA_BACKUP_MANIFEST_KEY` e `OPSA_BACKUP_MANIFEST_SHA256` e executar
  `npm --prefix apps/api run mf7:backup:verify`; nunca copiar URLs S3
  assinados ou credenciais para a evidence.
- A prova periódica é `npm --prefix apps/api run mf7:backup:roundtrip` numa
  base identificada como descartável por `RESTORE_DATABASE_URL`. O comando
  autentica o manifesto remoto por SHA-256, descarrega o dump, executa
  `pg_restore`, compara as contagens de todas as tabelas públicas e restaura os
  objetos por hash num prefixo efémero antes do cleanup.
- Nesta PAP não existe scheduler permanente; esta ausência é risco aceite e não
  pode ser apresentada como operação de produção.

## Evidências obrigatórias para defesa (gate S12)
- Registo de deploy com data/hora, owner e versao publicada.
- Resultado dos pre-checks (comandos e outputs relevantes).
- Resultado do smoke pos-deploy.
- Se houver rollback: registo de gatilho, versao revertida e validacao pos-rollback.
- Ligacao cruzada com `GATES-S4-S8-S12.md` e `SCORECARD-SPRINTS.md`.

## Changelog
- `2026-07-13`: documentado o rollout PostgreSQL local por Docker Compose,
  migrations forward-only, proteção do volume e restore antes de rollback.
- `2026-07-10`: documentados execução, lease/retry, supervisão e drenagem do
  worker SMTP separado.
- `2026-07-10`: o fluxo de restauro foi expandido para usar manifesto S3
  autenticado, comparar tabelas/objetos e não depender de dumps plaintext
  locais; a prova remota permanece pendente.
- `2026-07-10`: acrescentado pre-check fail-closed do relatório canónico antes
  do gate académico integral.
- `2026-07-09`: removidas alegações de produção; acrescentados gate académico,
  backup PostgreSQL/S3, restauro real e contrato de agendamento sem scheduler.
- `2026-04-19`: artefacto operacional criado para cobertura explicita de deploy/rollback no S12.
