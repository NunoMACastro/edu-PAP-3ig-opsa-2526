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
- `last_updated`: `2026-07-10`

## Objetivo

Criar um bundle de backup que cubra PostgreSQL e os objetos privados S3, com manifesto, hashes, encriptação, retenção e prova de restauro numa base remota descartável. Ver o conteúdo de um dump não prova que ele restaura.

## Limite operacional honesto

O projeto académico fornece o comando, o contrato de agendamento diário e uma demonstração executada. Sem deployment permanente não existe garantia de scheduler 24/7. Não marques “backup automático operacional” apenas porque o script existe.

## Entradas e configuração

- `DATABASE_URL`: base de origem não produtiva durante testes.
- `RESTORE_DATABASE_URL`: base remota descartável e isolada.
- `BACKUP_S3_BUCKET`: bucket privado do bundle.
- `BACKUP_S3_PREFIX`: prefixo dedicado por ambiente.
- `BACKUP_RETENTION_DAYS`: retenção configurada e validada.
- credenciais S3 através do ambiente seguro comum.

Nunca escrevas estas variáveis em logs, manifests ou documentação. Uma URL PostgreSQL com utilizador/password é sempre secreta, mesmo num exemplo sintético.

## Conteúdo do bundle

```text
backup/<run-id>/
├── database.dump.enc
├── objects-manifest.json.enc
└── bundle-manifest.json
```

O manifesto público/redigido pode incluir versões, tamanhos, hashes e timestamps. Não inclui URLs, access keys, cookies, tokens, paths locais com dados pessoais ou a chave de encriptação.

## Ficheiros públicos do aluno

- `apps/api/scripts/create-backup-bundle.mjs`
- `apps/api/scripts/restore-backup-bundle.mjs`
- `apps/api/src/lib/backup/backupManifest.js`
- `apps/api/tests/integration/backup-restore.integration.test.js`
- `apps/api/package.json`
- `docs/planificacao/OPERACAO-DEPLOY-ROLLBACK.md`

## Tutorial técnico linear

### Passo 1 - Fazer preflight

Antes do dump:

1. confirma que `pg_dump`, `pg_restore` e `psql` existem;
2. confirma compatibilidade do cliente PostgreSQL com o servidor remoto;
3. testa ligação à origem, ao destino descartável e ao S3;
4. confirma que origem e destino não são a mesma base;
5. recusa hosts/prefixos classificados como produção no modo académico.

O preflight imprime apenas estado redigido e versões.

### Passo 2 - Criar dump e manifesto S3

Executa `pg_dump --format=custom` usando o ambiente do processo, sem interpolar a URL num comando registado. Em paralelo lógico, lista todos os objetos abrangidos pelo storage da aplicação e cria um manifesto com:

- chave lógica redigida;
- tamanho;
- ETag quando fiável;
- SHA-256 calculado/armazenado pela aplicação;
- provider e versão do manifesto.

O dump sozinho é incompleto porque anexos, SAF-T e outros ficheiros vivem no S3.

### Passo 3 - Encriptar e enviar

Encripta dump e manifesto antes de os guardar no bucket de backup. Calcula hashes dos artefactos cifrados e guarda-os no bundle manifest. Faz upload para prefixo aleatório/imutável e promove o bundle apenas quando todos os objetos existem e os hashes coincidem.

Falha parcial deve remover o prefixo incompleto ou marcá-lo inequivocamente como inválido e não restaurável.

### Passo 4 - Aplicar retenção

Ordena bundles concluídos por timestamp seguro, nunca pelo nome fornecido pelo utilizador. Remove apenas bundles mais antigos que `BACKUP_RETENTION_DAYS` e preserva uma quantidade mínima definida pelo runbook. A eliminação é auditada sem expor chaves secretas.

### Passo 5 - Restaurar numa base descartável

O verificador de restauro deve:

1. criar/limpar apenas a base indicada por `RESTORE_DATABASE_URL` após guards fortes;
2. descarregar e verificar hashes do bundle;
3. desencriptar para diretório temporário com permissões restritas;
4. executar `pg_restore` contra a base descartável;
5. correr migrations/compat checks apenas se o runbook o exigir;
6. comparar entidades e contagens críticas com o manifesto de origem;
7. descarregar uma amostra determinística de objetos S3 e comparar SHA-256;
8. eliminar temporários e a base descartável no final.

Uma inspeção de catálogo pode ser um preflight adicional, mas nunca é o gate final.

### Passo 6 - Comparar invariantes

Compara pelo menos:

- empresas, memberships e utilizadores de teste;
- documentos de venda/compra e estados;
- lançamentos, linhas, débitos e créditos;
- períodos fiscais e retention holds;
- stock balances e camadas FIFO;
- attachments e export runs;
- quantidade total de objetos e hashes amostrados.

Define tolerâncias apenas para timestamps técnicos inevitáveis. Divergência funcional falha o restore.

### Passo 7 - Contrato de agendamento

Documenta um job diário que invoca um único comando idempotente, com lock para impedir execuções concorrentes, timeout, alertas e política de retry. No ambiente académico, regista a execução manual demonstrada e deixa explícita a ausência de supervisão permanente.

### Passo 8 - Testar falhas

- dump truncado/hash incorreto;
- objeto S3 ausente;
- chave de desencriptação errada;
- cliente PostgreSQL incompatível;
- destino igual à origem;
- destino não descartável;
- upload parcial;
- restauro SQL com erro;
- cleanup interrompido;
- duas execuções concorrentes.

Todos devem falhar fechado sem tocar na origem.

## Validação final

```bash
cd apps/api
npm run backup:create
npm run backup:restore:test
npm run test:mf7
```

Regista o comando exato redigido, diretório, exit code, contagens comparadas, hashes e cleanup. Não guardes o valor das variáveis.

## Critérios de aceite

- Bundle inclui dump PostgreSQL e manifesto de objetos S3.
- Artefactos são cifrados e verificados por hash.
- Retenção é configurável e segura.
- O restauro corre numa base remota descartável e compara invariantes reais.
- Objetos S3 restaurados/descarregados coincidem por SHA-256.
- Falhas parciais são compensadas.
- A documentação não confunde script/agendamento com scheduler permanente.

## Evidence para PR/defesa

- versões dos clientes PostgreSQL;
- ID redigido do bundle e hashes;
- contagens de origem/restauro;
- hashes dos objetos amostrados;
- exit codes de criação e restauro;
- prova de cleanup;
- classificação `BLOQUEADO_AMBIENTE` se serviços remotos não estiverem disponíveis.

## Importância

Um backup não restaurado é apenas uma hipótese. A aplicação guarda estado em PostgreSQL e objetos em S3, por isso ambos pertencem à mesma prova de recuperação.

## Scope-in

- Bundle cifrado, manifesto, retenção, agendamento e restore remoto descartável.

## Scope-out

- Scheduler permanente garantido, produção ou prova baseada apenas na inspeção do dump.

## Estado antes e depois

- Antes: dump parcial sem recuperação integral demonstrada.
- Depois: fluxo completo implementado, com estado runtime registado honestamente.

## Pre-requisitos

- Clientes PostgreSQL compatíveis, base de restore e buckets de teste isolados.

## Glossário

- **Bundle:** conjunto coerente de dump, manifesto e hashes.
- **Restore descartável:** base criada só para a prova e eliminada depois.

## Conceitos teóricos essenciais

RPO/RTO só podem ser medidos em execuções reais; cifra protege confidencialidade e SHA-256 deteta corrupção.

## Arquitetura do BK

Preflight → dump+manifesto → cifra/hash → S3 → retenção → download → restore remoto → comparação → cleanup.

## Ficheiros a criar/editar/rever

Revê scripts sob `apps/api`, package scripts e runbook académico, sem colocar configuração sensível nos ficheiros.

## Cenários negativos mínimos

Executa pelo menos 2 cenários negativos: bundle adulterado e destino não descartável, além das falhas parciais descritas.

## Handoff

Entrega a `BK-MF7-02` uma estratégia de preservação técnica; a retenção legal continua a ser aplicada pelo domínio contabilístico.

## Changelog

- `2026-07-10`: backup expandido para PostgreSQL+S3, cifra, retenção e restauro remoto com comparação.
