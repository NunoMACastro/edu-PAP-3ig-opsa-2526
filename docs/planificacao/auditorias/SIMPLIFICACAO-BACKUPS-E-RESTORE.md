# Simplificação de backups e restore — OPSA

## Identificação

- `project`: `OPSA`
- `system_id`: `backups-restore`
- `modo`: `implementar_simplificacao`
- `implementation_root`: `real_dev`
- `backend_root`: `real_dev/api`
- `runtime_target`: `demo_academica_local`
- `data_execucao`: `2026-07-12`
- `veredito`: `IMPLEMENTADO_COM_PROVA_OPERACIONAL_BLOQUEADA_AMBIENTE`

## Resumo executivo

O percurso principal deixou de exigir S3, bundle de objetos e retenção. Os
aliases históricos `mf7:backup`, `mf7:backup:verify` e
`mf7:backup:roundtrip` executam agora um contrato local demonstrável:
`pg_dump` custom, artefactos privados, manifesto e SHA-256, seguido de
`pg_restore` numa base explicitamente descartável, smoke de migrations e
comparação integral de tabelas/contagens.

O percurso remoto existente foi preservado como capacidade production-like
opt-in, através de aliases `:remote`. Configuração remota incompleta falha sem
fallback local. Não foram adicionadas dependências, scheduler, supervisor ou
formato de dump próprio.

Os testes focados passaram. A prova operacional PostgreSQL não foi executada
porque `pg_dump`, `pg_restore` e `psql` não existem no `PATH` desta máquina. O
comando local parou corretamente no preflight, antes de criar artefactos ou
contactar uma base.

## Fluxo antes e depois

### Antes

```text
mf7:backup
  -> validar retenção
  -> abrir storage operacional
  -> abrir bucket de backup dedicado
  -> pg_dump temporário
  -> copiar todos os objetos
  -> upload do dump
  -> upload do manifesto
  -> pruning remoto
  -> apagar dump local

mf7:backup:verify
  -> exigir chave/hash remotos
  -> download S3
  -> restore PostgreSQL descartável
  -> comparar todas as tabelas
  -> restaurar/verificar objetos
  -> cleanup temporário
```

S3, dois storages e retenção eram obrigatórios até para a demo local.

### Depois

```text
Gate local da PAP
  mf7:backup
    -> validar DATABASE_URL
    -> preflight pg_dump
    -> pg_dump custom em diretório privado
    -> validar tamanho
    -> SHA-256 do dump
    -> manifesto + SHA-256 do manifesto

  mf7:backup:verify
    -> validar manifesto e hashes
    -> rejeitar dump truncado/adulterado
    -> validar destino descartável e diferente da origem
    -> preflight pg_restore + psql
    -> pg_restore real
    -> migrations + tabelas + contagens

  mf7:backup:roundtrip
    -> executar ambas as fases em diretório temporário
    -> cleanup confirmado em finally

Capacidade remota opcional
  aliases :remote
    -> reutilizar bundle/manifesto/restore existente
    -> exigir S3 completo, buckets isolados, SSE e retenção
    -> falhar sem fallback local
```

## Contrato local

### Backup local demonstrável

- Default explícito: `OPSA_BACKUP_MODE=local`.
- Diretório por omissão: `./private-storage/backups`, criado com modo `0700`.
- Artefactos: dump custom, manifesto JSON e checksum do manifesto, todos com
  modo `0600`.
- O manifesto identifica a base pelo nome e regista versão, modo, basename,
  timestamp, engine, tamanho e SHA-256.
- A URL e a password não entram no `argv`, manifesto ou output; a password é
  passada exclusivamente por `PGPASSWORD`.
- Falha de `pg_dump` remove dump/manifesto/checksum parciais.

### Restore local descartável

- Aceita `--manifest`, o alias compatível `--file` ou ambiente equivalente.
- Valida primeiro SHA-256 do manifesto, forma do manifesto, tamanho e SHA-256
  do dump.
- Rejeita symlinks nos artefactos locais.
- Exige um token delimitado `restore`, `test`, `audit`, `ci` ou `demo` no nome
  da base de destino.
- Exige que o nome da base de destino seja diferente do nome da origem, mesmo
  quando os hosts declarados são diferentes ou aliases do mesmo servidor.
- Executa `pg_restore --clean --if-exists --exit-on-error` apenas depois dos
  guards.
- Confirma `_prisma_migrations`, inventário integral de tabelas e contagens por
  tabela sem ler colunas de negócio.

## Contrato remoto opcional

O código remoto não foi reescrito. Mantém:

- bucket operacional separado do bucket de backup;
- server-side encryption S3 obrigatória;
- bundle PostgreSQL + objetos e manifesto autenticado por SHA-256;
- compensação de uploads parciais;
- retenção posterior ao commit lógico do novo bundle;
- download, restore PostgreSQL e verificação de objetos;
- cleanup em `finally`.

Manifests remotos legados sem os novos campos `version`/`mode` continuam
aceites quando contêm o contrato inequívoco de bundle remoto. O modo remoto
continua a exigir configuração completa e nunca faz fallback para local.

## Comandos preservados e acrescentados

### Preservados — agora gate local

```bash
npm --prefix real_dev/api run mf7:backup
npm --prefix real_dev/api run mf7:backup:verify -- --manifest <manifesto>
npm --prefix real_dev/api run mf7:backup:roundtrip
```

O consumidor antigo que usa `--file <dump>` continua suportado por
`mf7:backup:verify`.

### Acrescentados — remoto explícito

```bash
npm --prefix real_dev/api run mf7:backup:remote
npm --prefix real_dev/api run mf7:backup:verify:remote -- \
  --manifest-key <chave> --manifest-sha256 <sha256>
npm --prefix real_dev/api run mf7:backup:roundtrip:remote
```

## Garantias de segurança

- Nenhuma password ou URL PostgreSQL é colocada nos argumentos dos processos.
- Erros públicos não incluem `stderr` potencialmente sensível.
- O preflight não recebe ligações nem credenciais.
- Restore para base sem marcador descartável é rejeitado.
- Restore para a origem é rejeitado.
- Dump/manifesto adulterado ou truncado falha antes de `pg_restore`.
- Artefactos locais parciais e temporários têm cleanup confirmado e idempotente.
- Bundle remoto parcial nunca é registado como backup válido.
- Modo remoto incompleto não degrada silenciosamente para local.

## Limites académicos declarados

- O dump local custom não tem cifra aplicacional. É protegido por diretório
  privado e permissões filesystem; deve ser removido após a evidence.
- O checksum local deteta corrupção acidental, mas não substitui assinatura ou
  storage imutável contra um atacante com escrita no mesmo diretório.
- Não existe scheduler 24/7, lock distribuído ou supervisão permanente.
- Não são declarados RPO/RTO, certificação ou operação contínua.
- Retenção automática é capacidade do modo remoto, não do modo local.

## Ficheiros alterados

### Implementação e configuração

- `real_dev/api/scripts/postgres-cli.mjs`
- `real_dev/api/scripts/run-daily-backup.mjs`
- `real_dev/api/scripts/verify-backup-restore.mjs`
- `real_dev/api/scripts/run-backup-roundtrip.mjs`
- `real_dev/api/package.json`
- `real_dev/api/.env.example`
- `real_dev/README.md`

### Testes

- `real_dev/api/tests/unit/backup-local.test.js` — novo.
- `real_dev/api/tests/unit/backup-hardening.test.js` — remoto tornado explícito
  e preflight compatível.

### Documentação/evidence

- `docs/planificacao/guias-bk/MF7/BK-MF7-01-backups-automaticos-diarios-com-restauracao-possivel.md`
- `docs/planificacao/auditorias/SIMPLIFICACAO-BACKUPS-E-RESTORE.md`

As alterações pré-existentes em
`docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e
`docs/planificacao/auditorias/SIMPLIFICACAO-ARRANQUE-LOCAL-E-CONFIGURACAO.md`
foram preservadas e não pertencem a esta execução.

## Testes unitários e de contrato

### Focados no subsistema

```text
node --test tests/unit/backup-local.test.js \
  tests/unit/backup-hardening.test.js \
  tests/unit/backup-bundle.test.js
```

Resultado: `PASS`, 25 testes, 0 falhas, 0 skips.

Cobertura relevante:

- ferramentas ausentes;
- URLs/origens inválidas;
- restore não descartável e origem=destino;
- password/URL ausentes de `argv` e manifesto;
- manifesto/hash e dump truncado/adulterado;
- cleanup em sucesso/falha e idempotência;
- aliases e formato público essencial;
- modo local sem S3;
- remoto incompleto sem fallback;
- doubles unitários distinguidos de restore operacional.

### Matriz pedida

| Comando | Resultado |
|---|---|
| `npm --prefix real_dev/api run syntax:check` | `PASS` |
| `npm --prefix real_dev/api run test:unit` | `BLOQUEADO_SUITE_LEGADA` |
| `npm --prefix real_dev/api run test:contracts` | `PASS` fora do sandbox: 173/173 |
| `npm --prefix real_dev/api run test:mf7:retention` | `PASS`: 11/11 |
| `npm --prefix real_dev/api run test:mf7` | `PASS`: todos os subgates |
| `git diff --check` | `PASS` |

No sandbox, os contratos HTTP falharam por `listen EPERM`; a reexecução fora
do sandbox passou 173/173. A suite unitária completa fora do sandbox executou
352 testes com sucesso, mas ficou pendente em
`tests/unit/multipart-upload.test.js`; após interrupção controlada aos cerca de
188 segundos, o runner classificou esse ficheiro como cancelado com `Promise
resolution is still pending`. Os três testes internos desse ficheiro tinham
passado. Este bloqueio pré-existente não toca no subsistema de backup; a suite
focada de backup passou integralmente.

## Prova operacional

### Preflight executado

Foi executado `mf7:backup` com uma URL sintética de origem académica e um
diretório temporário dedicado. Resultado:

```text
Ferramenta PostgreSQL em falta: pg_dump. Instala os PostgreSQL client tools e confirma o PATH.
exit_code=1
preflight_cleanup=sem_artefactos
```

Disponibilidade confirmada:

```text
pg_dump=ausente
pg_restore=ausente
psql=ausente
```

### Decisão

`BLOQUEADO_AMBIENTE`. Não foi executado backup, restore ou roundtrip real e
nenhum double foi usado como substituto dessa evidence.

## Riscos residuais

1. É necessário instalar PostgreSQL client tools compatíveis para obter prova
   positiva.
2. É necessária uma origem autorizada e uma segunda base descartável para o
   roundtrip.
3. O dump local permanece sem cifra aplicacional durante o período manual de
   evidence.
4. O checksum local não protege contra alteração coordenada por um utilizador
   com acesso de escrita ao diretório.
5. A suite unitária global mantém um bloqueio de lifecycle no teste multipart,
   fora do scope deste sistema.

## Decisão por capacidade

| Capacidade | Decisão | Evidência |
|---|---|---|
| Backup local | `IMPLEMENTADO_SEM_PROVA_OPERACIONAL` | Código + testes focados + preflight fail-closed |
| Restore local descartável | `IMPLEMENTADO_SEM_PROVA_OPERACIONAL` | Guards, integridade e unitários; ferramentas ausentes |
| Backup/restore remoto | `PRESERVADO_OPCIONAL` | Aliases explícitos e contratos remotos existentes |
| Agendamento diário | `APENAS_DOCUMENTAL` | Sem scheduler/supervisor instalado |
| Retenção local | `NAO_SUPORTADA` | Limpeza manual documentada |
| Retenção remota | `PRESERVADA_OPCIONAL` | Aplicada apenas após bundle remoto válido |

## Veredito final

`IMPLEMENTADO_COM_PROVA_OPERACIONAL_BLOQUEADA_AMBIENTE`.

O desenho e os testes satisfazem o contrato de simplificação; a conclusão
operacional de backup/restore continua dependente da instalação de
`pg_dump`/`pg_restore`/`psql` e de duas bases PostgreSQL autorizadas. Não houve
adição de dependências nem commits.
