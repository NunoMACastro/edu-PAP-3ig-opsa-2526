# BK-MF7-01 - Backups automáticos diários com restauração possível

## Header

- `doc_id`: `GUIA-BK-MF7-01`
- `bk_id`: `BK-MF7-01`
- `macro`: `MF7`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF18`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-02`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-01-backups-automaticos-diarios-com-restauracao-possivel.md`
- `last_updated`: `2026-07-13`

## Objetivo

Demonstrar um backup PostgreSQL real, guardado localmente com permissões
privadas, manifesto e SHA-256, e restaurá-lo numa base inequivocamente
descartável. O percurso S3 continua disponível como capacidade opcional
production-like, mas não bloqueia a apresentação académica local.

O título e o `RNF18` mantêm a rastreabilidade ao requisito de backup diário.
Nesta PAP, porém, existe um comando manual demonstrável; sem deployment e
scheduler permanentes não existe garantia de execução automática 24/7.

## Contratos separados

| Capacidade | Contrato da PAP | Estado esperado |
|---|---|---|
| Backup local | `pg_dump` custom + manifesto + SHA-256 em diretório `0700` | Gate principal |
| Restore local | `pg_restore` numa base descartável + migrations + tabelas/contagens | Gate principal |
| Client tools | serviço Compose `postgres-tools`, sem instalação no host | Gate principal local |
| Backup/restore remoto | Bundle PostgreSQL + objetos num bucket S3 dedicado | Opcional explícito |
| Agendamento diário | Comando documentado, sem scheduler instalado | Documental |
| Retenção | Aplicada apenas ao bundle remoto configurado | Opcional explícito |

Não uses um único `PASS` para representar estas cinco capacidades.

## Entradas e segurança

- `DATABASE_URL`: base de origem; é lida apenas do ambiente.
- `OPSA_BACKUP_DIR`: diretório local privado; por omissão
  `./private-storage/backups`.
- `RESTORE_DATABASE_URL`: outra base, com token delimitado `restore`, `test`,
  `audit`, `ci` ou `demo` no nome.
- `OPSA_BACKUP_MODE=local`: default académico.
- `BACKUP_S3_BUCKET`, `BACKUP_S3_PREFIX` e `BACKUP_RETENTION_DAYS`: apenas no
  modo remoto.

A password PostgreSQL segue em `PGPASSWORD`; a URL completa nunca entra no
`argv`, logs, manifesto ou evidence. O restore recusa a base de origem e nomes
que não cumpram a regra descartável.

## Artefactos locais

Cada execução bem-sucedida produz:

```text
private-storage/backups/
├── opsa-<timestamp>.dump
├── opsa-<timestamp>.dump.json
└── opsa-<timestamp>.dump.json.sha256
```

O manifesto guarda versão, modo, basename, tamanho, data, engine, SHA-256 do
dump e nome da base de origem. Não guarda URL, password ou dados de negócio.

O dump custom não é cifrado pela aplicação. A proteção académica real é o
diretório privado e os modos `0700`/`0600`; não copies estes artefactos para
pastas sincronizadas ou públicas. Elimina-os manualmente depois da evidence.

## Tutorial técnico linear

### Passo 1 - Preparar duas bases distintas

Configura a aplicação com a origem e cria uma segunda base exclusivamente para
restore, por exemplo `opsa_demo_restore`. Nunca apontes ambas as variáveis para
a mesma base.

```dotenv
DATABASE_URL=postgresql://<user>:<password>@127.0.0.1:5433/opsa_dev
RESTORE_DATABASE_URL=postgresql://<user>:<password>@127.0.0.1:5435/opsa_demo_restore
OPSA_BACKUP_MODE=local
OPSA_BACKUP_DIR=./private-storage/backups
```

Não coloques valores reais na documentação ou na evidence.

### Passo 2 - Preparar os serviços locais

```bash
npm --prefix apps/api run db:local:check
npm --prefix apps/api run db:local:start
npm --prefix apps/api run db:restore:start
```

O modo Compose usa `postgres-tools` para executar `pg_dump`, `pg_restore` e
`psql`; os binários não precisam de estar instalados no host. Os scripts fazem
preflight e falham com mensagem acionável. O modo nativo continua disponível
para bases externas autorizadas. Não substituas estas ferramentas por
exportações JSON.

### Passo 3 - Criar o backup local

A partir da raiz do repositório:

```bash
npm --prefix apps/api run mf7:backup
```

O comando cria o dump custom e só publica o manifesto depois de confirmar que
o ficheiro não está vazio e calcular os hashes. Em falha, remove artefactos
parciais em `finally`.

### Passo 4 - Inspecionar evidence segura

Guarda apenas o JSON redigido devolvido pelo comando: `mode`, nomes de
ficheiros, tamanhos, hashes, base identificada e timestamp. Confirma que não
contém `postgresql://`, password, access keys ou caminhos pessoais desnecessários.

### Passo 5 - Restaurar na base descartável

Usa o caminho devolvido pelo backup:

```bash
npm --prefix apps/api run mf7:backup:verify -- \
  --manifest ./private-storage/backups/opsa-<timestamp>.dump.json
```

Também se mantém o alias compatível:

```bash
npm --prefix apps/api run mf7:backup:verify -- \
  --file ./private-storage/backups/opsa-<timestamp>.dump
```

Antes de `pg_restore --clean --if-exists`, o script valida o nome descartável e
confirma que origem e destino não são iguais. Depois verifica migrations,
inventário integral de tabelas e contagens por tabela.

### Passo 6 - Executar o roundtrip local

```bash
npm --prefix apps/api run mf7:backup:roundtrip
```

Este comando cria os artefactos num diretório temporário privado, executa o
restore real e remove os ficheiros temporários no final. Só conta como prova
operacional quando usa ferramentas PostgreSQL e bases reais autorizadas; testes
com doubles validam orchestration, não restaurabilidade.

### Passo 7 - Usar o modo remoto apenas quando necessário

```bash
npm --prefix apps/api run mf7:backup:remote
npm --prefix apps/api run mf7:backup:verify:remote -- \
  --manifest-key backups/<run-id>/manifest.json \
  --manifest-sha256 <sha256>
npm --prefix apps/api run mf7:backup:roundtrip:remote
```

O modo remoto exige configuração S3 completa, bucket operacional e bucket de
backup diferentes, server-side encryption e retenção válida. Configuração
incompleta falha; nunca cai silenciosamente para storage local.

### Passo 8 - Testar falhas

Valida pelo menos:

- indisponibilidade de Docker/`postgres-tools` no modo Compose, ou ausência de
  `pg_dump`, `pg_restore` ou `psql` no modo nativo;
- URL PostgreSQL inválida;
- destino igual à origem ou sem marcador descartável;
- manifesto alterado;
- dump truncado ou com hash divergente;
- falha de dump/upload e cleanup confirmado;
- configuração remota incompleta sem fallback local.

## Comandos de validação

```bash
npm --prefix apps/api run syntax:check
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run test:mf7:retention
npm --prefix apps/api run test:mf7
```

No fim, `npm --prefix apps/api run db:restore:stop` para o serviço descartável e
`npm --prefix apps/api run db:local:stop` para a origem. Ambos preservam volumes;
os resets são destrutivos e não são passos normais do roundtrip. O reset local
exige ainda `--confirm=opsa_dev`.

## Critérios de aceite

- O modo local não depende de S3, scheduler ou supervisor.
- O modo Compose não exige PostgreSQL client tools instaladas no host.
- O dump e o manifesto existem, têm permissões privadas e hashes coerentes.
- O restore só começa depois de validar um destino descartável distinto.
- Migrations, tabelas e contagens coincidem entre origem e restore.
- Passwords e URLs nunca aparecem em argumentos públicos, logs ou evidence.
- Cleanup parcial e temporário é confirmado e idempotente.
- Os três aliases históricos continuam disponíveis.
- O modo remoto é opt-in, isolado e fail-closed.
- A evidence distingue testes unitários de roundtrip PostgreSQL real.

## Evidence para PR/defesa

- versões dos PostgreSQL client tools;
- comandos executados e exit codes;
- nomes dos artefactos, bytes e hashes;
- nome descartável redigido, migrations e tabelas comparadas;
- resultado do cleanup;
- `BLOQUEADO_AMBIENTE` se faltarem ferramentas ou uma base autorizada.

## Scope-in

- Backup/restore PostgreSQL local demonstrável.
- Manifesto, hashes, guards de restore e cleanup.
- Bundle S3/objetos e retenção apenas no modo remoto opcional existente.

## Scope-out

- Scheduler 24/7, supervisão permanente, certificação ou RPO/RTO medidos.
- Cifra aplicacional do dump local.
- Restore sobre produção ou sobre a base de origem.

## Handoff

Entrega a `BK-MF7-02` uma estratégia de preservação técnica. A retenção legal
de entidades contabilísticas continua separada da retenção opcional dos bundles.

## Importância

Um backup só é útil quando o dump é íntegro e pode ser restaurado sem destruir
a origem. A demonstração cobre as duas partes com PostgreSQL real.

## Estado antes e depois

- Antes: o percurso local dependia de client tools e de bases preparadas no
  host.
- Depois: origem, restore e ferramentas ficam isolados por Docker Compose, sem
  transformar a demo num deployment de produção.

## Pré-requisitos

- Docker Compose v2 e portas `5433` e `5435` livres.
- `.env` local, diretório privado e duas ligações PostgreSQL distintas.
- Nunca usar dados ou credenciais de produção.

## Glossário

- **Dump custom:** formato PostgreSQL próprio para `pg_restore`.
- **Manifesto:** metadata e hash usados para verificar o artefacto.
- **Roundtrip:** backup, restore, comparação e cleanup no mesmo percurso.

## Conceitos teóricos essenciais

O hash prova integridade do ficheiro, não restaurabilidade. A prova completa
exige restaurar numa base descartável e comparar migrations, tabelas e
contagens.

## Arquitetura do BK

Script npm → preflight → `postgres-tools` → dump/manifesto →
`postgres-restore` → comparação → cleanup.

## Ficheiros a criar/editar/rever

Revê os scripts de backup/restore, o adapter PostgreSQL Compose, o
`package.json`, o `.env.example` e os testes unitários/contratuais associados.

## Cenários negativos mínimos

Executa pelo menos 4 cenários negativos: manifesto/hash alterado; destino igual
à origem; Docker ou client tools indisponíveis; e falha a meio com cleanup
confirmado.

## Validação final

Regista separadamente os testes com doubles e o roundtrip PostgreSQL real. Sem
Docker, base autorizada ou execução iniciada, o resultado é
`BLOQUEADO_AMBIENTE`, nunca `PASS`.

## Changelog

- `2026-07-13`: o percurso local passou a usar PostgreSQL e client tools
  isolados em Docker Compose, através dos scripts públicos de `apps/api`.
- `2026-07-12`: modo local manual passou a gate principal; S3, retenção e
  restore remoto ficaram opcionais e explícitos, sem alegação de scheduler.
- `2026-07-10`: backup expandido para PostgreSQL+S3, cifra, retenção e restauro
  remoto com comparação.
