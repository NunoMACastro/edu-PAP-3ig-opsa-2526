# BK-MF7-01 - Backups automáticos diários com restauração possível.

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
- `last_updated`: `2026-06-26`

#### Objetivo

Neste BK vais transformar o requisito `RNF18` numa entrega técnica verificável: ficam disponíveis scripts de backup e verificação de restauro para PostgreSQL, com manifesto e hash.

A MF7 fecha temas de operação, compatibilidade, interoperabilidade e manutenção. O guia usa os contratos entregues até MF6 como baseline e escreve sempre caminhos públicos sob `apps/api` e `apps/web`.

#### Importância

O requisito `RNF18` evita que o ERP funcione apenas em ambiente de demonstração. Num ERP financeiro, operação, exportação, importação, retenção, modularidade e testes são parte da segurança do produto.

Este BK prepara `BK-MF7-02` e mantém continuidade com `BK-MF6-10`, que tornou a auditoria obrigatória em operações sensíveis.

#### Scope-in

- Criar execução diária de backup PostgreSQL com `pg_dump`.
- Guardar manifesto sem expor credenciais.
- Validar que o ficheiro pode ser listado por `pg_restore`.
- Registar evidence de criação e verificação.

#### Scope-out

- Configurar serviço cloud externo.
- Executar restauro sobre dados reais de produção.
- Alterar modelos Prisma.

#### Estado antes e depois

- Antes: MF0..MF6 já entregaram autenticação, empresa ativa, permissões, documentos, relatórios, importações, auditoria e hardening básico.
- Depois: `BK-MF7-01` deixa um contrato técnico validável: ficam disponíveis scripts de backup e verificação de restauro para PostgreSQL, com manifesto e hash.

#### Pre-requisitos

- Ler `RNF18` em `docs/RNF.md`.
- Rever `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`.
- Confirmar scripts reais em `apps/api/package.json` e `apps/web/package.json` antes de acrescentar comandos.
- Confirmar que a empresa ativa continua resolvida no backend a partir da sessão.

#### Glossário

- Backup: cópia técnica da base de dados para recuperação.
- Restauro: validação de que o backup pode ser lido e usado.
- Manifesto: ficheiro pequeno com data, motor e hash do backup.
- Evidence: prova objetiva que mostra o fluxo principal e os negativos.
- Empresa ativa: contexto autenticado usado pelo backend para filtrar dados por empresa.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF18` define o requisito deste BK.
- `CANONICO`: a sequência oficial da MF7 está na matriz e no backlog.
- `DERIVADO`: os nomes dos scripts, variáveis de ambiente e ficheiros de manifesto abaixo são decisões técnicas mínimas para tornar o requisito executável sem trocar a stack.

Um backup só é útil se puder ser verificado antes de uma emergência. Neste BK vais separar três responsabilidades: criar o ficheiro `.dump`, guardar um manifesto sem credenciais e pedir ao PostgreSQL para listar o conteúdo do ficheiro com `pg_restore --list`.

O `pg_dump` cria o backup em formato custom do PostgreSQL. Esse formato é apropriado para validação com `pg_restore`, porque o segundo comando consegue ler o catálogo interno do ficheiro sem repor dados numa base real. Assim, o aluno prova "restauração possível" sem tocar em dados de produção.

O manifesto é uma prova técnica pequena: guarda nome do ficheiro, tamanho, data, motor usado e hash SHA-256. O hash ajuda a detetar corrupção acidental do ficheiro entre o momento do backup e o momento da validação.

O `DATABASE_URL` é lido apenas pelo processo Node e nunca é escrito no manifesto, na evidence ou em mensagens de erro. Esta regra evita expor credenciais de base de dados durante uma defesa, num PR ou num log partilhado.

A regra de segurança transversal mantém-se: o frontend pode pedir uma ação, mas autorização, empresa ativa, permissões, validação e auditoria pertencem ao backend.

#### Arquitetura do BK

- Scripts: `run-daily-backup.mjs` e `verify-backup-restore.mjs`.
- Dados: PostgreSQL usado pelo Prisma.
- Segurança: sem credenciais no manifesto.
- Testes: execução textual dos scripts.
- Handoff para o próximo BK: `BK-MF7-02`.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/scripts/run-daily-backup.mjs`
- CRIAR: `apps/api/scripts/verify-backup-restore.mjs`
- EDITAR: `apps/api/package.json`, apenas para acrescentar os scripts operacionais deste BK.
- REVER: `docs/RNF.md`.
- REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- REVER: `docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md`.

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato e risco principal

1. Objetivo funcional do passo no contexto da app.

Confirmar o contrato canónico antes de escrever código, para não misturar requisitos nem alterar a sequência da macrofase.

2. Ficheiros envolvidos:
    - REVER: documentos e ficheiros indicados na secção de pré-requisitos.
    - LOCALIZAÇÃO: contrato documental e handoff do BK anterior.

3. Instruções do que fazer.

Confirma RNF18, define a pasta de backups, identifica quem guarda o manifesto e regista na evidence o comando de backup e o comando de restauro testado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura, desenho técnico ou validação documental antes da implementação.

5. Explicação do código.

Sem código neste passo porque a decisão de backup deve ficar alinhada com RNF18, com o PostgreSQL da app e com a evidence que será usada no restauro.

6. Validação do passo.

Confirma que a evidence inclui manifesto, tamanho do ficheiro, hash SHA-256 e resultado de uma tentativa de restauro em ambiente local.

7. Cenário negativo/erro esperado.

Se faltar decisão sobre infraestrutura de backups, regista `TODO (BLOCKER)` com impacto em RNF18 e não prometas agendamento automático de produção.

### Passo 2 - Desenhar o contrato técnico mínimo

1. Objetivo funcional do passo no contexto da app.

Definir e validar o contrato de backup diário com manifesto, erro controlado e prova de restauro.

2. Ficheiros envolvidos:
    - REVER: documentos e ficheiros indicados na secção de pré-requisitos.
    - LOCALIZAÇÃO: contrato documental e handoff do BK anterior.

3. Instruções do que fazer.

Confirma RNF18, define a pasta de backups, identifica quem guarda o manifesto e regista na evidence o comando de backup e o comando de restauro testado.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de leitura, desenho técnico ou validação documental antes da implementação.

5. Explicação do código.

Sem código neste passo porque a decisão de backup deve ficar alinhada com RNF18, com o PostgreSQL da app e com a evidence que será usada no restauro.

6. Validação do passo.

Confirma que a evidence inclui manifesto, tamanho do ficheiro, hash SHA-256 e resultado de uma tentativa de restauro em ambiente local.

7. Cenário negativo/erro esperado.

Se faltar decisão sobre infraestrutura de backups, regista `TODO (BLOCKER)` com impacto em RNF18 e não prometas agendamento automático de produção.

### Passo 3 - Criar o ficheiro principal do BK

1. Objetivo funcional do passo no contexto da app.

Definir e validar o contrato de backup diário com manifesto, erro controlado e prova de restauro.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/run-daily-backup.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro `apps/api/scripts/run-daily-backup.mjs` com o conteúdo completo abaixo. Mantém os imports no topo e não movas regras de segurança para o frontend.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/scripts/run-daily-backup.mjs
/**
 * @file Cria um backup diário PostgreSQL com manifesto verificável.
 */

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_BACKUP_DIR = "./backups";

/**
 * Calcula o hash SHA-256 do ficheiro gerado.
 *
 * @param {string} filePath - Caminho do backup físico.
 * @returns {Promise<string>} Hash hexadecimal do ficheiro.
 */
async function sha256(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk);
  }
  return hash.digest("hex");
}

/**
 * Confirma que um comando externo terminou com sucesso.
 *
 * @param {ReturnType<typeof spawnSync>} result - Resultado devolvido pelo Node.
 * @param {string} commandName - Nome do comando executado.
 * @returns {void}
 * @throws {Error} Quando o comando não existe ou termina com erro.
 */
function assertCommandSucceeded(result, commandName) {
  if (result.error) {
    throw new Error(commandName + " não arrancou. Confirma se a ferramenta PostgreSQL está instalada.");
  }

  if (result.status !== 0) {
    throw new Error(commandName + " terminou com erro. Confirma DATABASE_URL, permissões e ligação à base de dados.");
  }
}

/**
 * Executa pg_dump sem passar pela shell para evitar injeção em argumentos.
 *
 * @param {object} options - Configuração opcional usada por testes ou smokes locais.
 * @param {string} [options.backupDir] - Pasta onde o dump e o manifesto serão gravados.
 * @param {string} [options.databaseUrl] - URL PostgreSQL lido do ambiente.
 * @param {Date} [options.now] - Data usada para gerar o nome do ficheiro.
 * @returns {Promise<object>} Manifesto do backup criado.
 * @throws {Error} Quando falta configuração, o dump falha ou o ficheiro fica vazio.
 */
export async function runDailyBackup({
  backupDir = process.env.OPSA_BACKUP_DIR ?? DEFAULT_BACKUP_DIR,
  databaseUrl = process.env.DATABASE_URL,
  now = new Date(),
} = {}) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL em falta para executar backup");
  }

  await mkdir(backupDir, { recursive: true });
  const stamp = now.toISOString().replaceAll(":", "-");
  const backupPath = join(backupDir, "opsa-" + stamp + ".dump");

  // O URL da base de dados fica apenas no processo; nunca é escrito no manifesto nem na evidence.
  const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", backupPath, databaseUrl], {
    encoding: "utf8",
    stdio: "pipe",
  });

  assertCommandSucceeded(result, "pg_dump");

  const backupInfo = await stat(backupPath);
  if (backupInfo.size === 0) {
    throw new Error("Backup falhou: ficheiro gerado sem conteúdo");
  }

  // O hash permite detetar corrupção acidental antes de confiar no ficheiro para retenção ou restauro.
  const manifest = {
    file: basename(backupPath),
    sizeBytes: backupInfo.size,
    createdAt: new Date().toISOString(),
    engine: "postgresql-pg_dump-custom",
    sha256: await sha256(backupPath),
  };
  await writeFile(backupPath + ".json", JSON.stringify(manifest, null, 2));
  return manifest;
}

if (import.meta.url === "file://" + process.argv[1]) {
  runDailyBackup()
    .then((manifest) => console.log(JSON.stringify(manifest, null, 2)))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
```

5. Explicação do código.

Este ficheiro cria o artefacto principal do `RNF18`: um dump PostgreSQL em formato custom, acompanhado por um manifesto JSON. A entrada principal é `DATABASE_URL`, que vem do ambiente do backend. A saída é um ficheiro `.dump` e um ficheiro `.dump.json` com nome, tamanho, data, motor e hash.

O comando usa `spawnSync` com lista de argumentos e não com uma string única. Isto evita passar pela shell e reduz o risco de injeção em comandos externos. O código também não devolve `stderr` ao aluno, porque mensagens de ferramentas de base de dados podem conter detalhes internos que não devem aparecer na evidence.

A função `sha256` percorre o ficheiro por partes, sem carregar o dump inteiro em memória. Isto é importante porque bases de dados reais podem gerar ficheiros grandes. A validação de tamanho evita aceitar um ficheiro vazio como se fosse backup válido.

Este passo prepara o `verify-backup-restore.mjs` do passo seguinte: primeiro cria-se o dump, depois confirma-se que o PostgreSQL consegue ler o seu catálogo com `pg_restore --list`.

6. Validação do passo.

Executa a validação sintática do ficheiro quando estiver criado:

```bash
cd apps/api
node --check scripts/run-daily-backup.mjs
```

Resultado esperado: o comando termina sem output de erro.

7. Cenário negativo/erro esperado.

Executa o script sem `DATABASE_URL`:

```bash
cd apps/api
DATABASE_URL= node scripts/run-daily-backup.mjs
```

Resultado esperado: a execução falha com `DATABASE_URL em falta para executar backup`, sem criar manifesto e sem expor credenciais.

### Passo 4 - Ligar o contrato ao módulo certo

1. Objetivo funcional do passo no contexto da app.

Criar o script de verificação que prova que o dump gerado é legível pelo PostgreSQL.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/verify-backup-restore.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria `apps/api/scripts/verify-backup-restore.mjs` com o conteúdo completo abaixo. Este script não restaura dados numa base real; ele usa `pg_restore --list` para confirmar que o dump é reconhecido e listado pelo PostgreSQL.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/scripts/verify-backup-restore.mjs
/**
 * @file Verifica se um backup PostgreSQL pode ser lido por pg_restore.
 */

import { spawnSync } from "node:child_process";
import { access, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

/**
 * Lê o caminho do backup a partir de --file ou da variável OPSA_BACKUP_FILE.
 *
 * @param {string[]} args - Argumentos recebidos pela linha de comandos.
 * @param {NodeJS.ProcessEnv} env - Variáveis de ambiente disponíveis.
 * @returns {string} Caminho absoluto do ficheiro de backup.
 * @throws {Error} Quando o caminho não foi indicado.
 */
function resolveBackupFile(args = process.argv.slice(2), env = process.env) {
  const fileFlagIndex = args.indexOf("--file");
  const selectedFile = fileFlagIndex >= 0 ? args[fileFlagIndex + 1] : env.OPSA_BACKUP_FILE;

  if (!selectedFile) {
    throw new Error("Indica o backup com --file <ficheiro> ou OPSA_BACKUP_FILE");
  }

  return resolve(selectedFile);
}

/**
 * Confirma que o ficheiro existe e tem conteúdo.
 *
 * @param {string} backupPath - Caminho absoluto do ficheiro de backup.
 * @returns {Promise<number>} Tamanho do ficheiro em bytes.
 * @throws {Error} Quando o ficheiro não existe ou está vazio.
 */
async function assertReadableBackupFile(backupPath) {
  try {
    await access(backupPath);
  } catch {
    throw new Error("Backup não encontrado: indica um ficheiro .dump existente");
  }

  const backupInfo = await stat(backupPath);

  if (backupInfo.size === 0) {
    throw new Error("Backup inválido: ficheiro vazio");
  }

  return backupInfo.size;
}

/**
 * Lista o conteúdo do backup com pg_restore sem repor dados.
 *
 * @param {string} backupPath - Caminho absoluto do ficheiro de backup.
 * @returns {string[]} Entradas do catálogo do dump.
 * @throws {Error} Quando pg_restore não consegue ler o ficheiro.
 */
function listRestoreCatalog(backupPath) {
  // --list valida a estrutura do dump sem escrever numa base de dados real.
  const result = spawnSync("pg_restore", ["--list", backupPath], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.error) {
    throw new Error("pg_restore não arrancou. Confirma se a ferramenta PostgreSQL está instalada.");
  }

  if (result.status !== 0) {
    throw new Error("Backup inválido: pg_restore não conseguiu listar o ficheiro");
  }

  const entries = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith(";"));

  if (entries.length === 0) {
    throw new Error("Backup inválido: catálogo sem entradas restauráveis");
  }

  return entries;
}

/**
 * Verifica um backup já criado e devolve evidence segura para PR ou defesa.
 *
 * @param {object} options - Configuração opcional para execução local ou teste.
 * @param {string[]} [options.args] - Argumentos da linha de comandos.
 * @param {NodeJS.ProcessEnv} [options.env] - Variáveis de ambiente.
 * @returns {Promise<object>} Evidence de leitura do backup.
 * @throws {Error} Quando falta ficheiro, o ficheiro está vazio ou pg_restore falha.
 */
export async function verifyBackupRestore({ args = process.argv.slice(2), env = process.env } = {}) {
  const backupPath = resolveBackupFile(args, env);
  const sizeBytes = await assertReadableBackupFile(backupPath);
  const restoreEntries = listRestoreCatalog(backupPath);

  // A evidence usa basename para não publicar caminhos locais completos do aluno.
  return {
    file: basename(backupPath),
    sizeBytes,
    checkedAt: new Date().toISOString(),
    restorable: true,
    catalogEntries: restoreEntries.length,
    check: "pg_restore --list",
  };
}

if (import.meta.url === "file://" + process.argv[1]) {
  verifyBackupRestore()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
```

5. Explicação do código.

Este ficheiro fecha a parte "restauração possível" do `RNF18`. Ele recebe o caminho do dump por `--file` ou por `OPSA_BACKUP_FILE`, confirma que o ficheiro existe, rejeita ficheiros vazios e pede ao `pg_restore` para listar o catálogo interno do backup.

O script não executa um restauro real sobre uma base de dados. Essa decisão é intencional: numa PAP, a prova mínima segura é demonstrar que o PostgreSQL reconhece o artefacto e encontra entradas restauráveis. Restaurar sobre uma base real exige uma base temporária controlada e política operacional própria, que fica fora deste BK.

A evidence devolvida é segura para PR ou defesa: publica apenas `basename`, tamanho, data, estado `restorable`, número de entradas e comando de verificação. Não publica `DATABASE_URL`, caminhos absolutos completos, dados financeiros ou conteúdo do dump.

6. Validação do passo.

Valida a sintaxe do segundo script:

```bash
cd apps/api
node --check scripts/verify-backup-restore.mjs
```

Resultado esperado: o comando termina sem output de erro.

7. Cenário negativo/erro esperado.

Executa a verificação sem indicar ficheiro:

```bash
cd apps/api
node scripts/verify-backup-restore.mjs
```

Resultado esperado: a execução falha com `Indica o backup com --file <ficheiro> ou OPSA_BACKUP_FILE`.

### Passo 5 - Adicionar comando de validação

1. Objetivo funcional do passo no contexto da app.

Ligar os dois scripts ao `package.json` do backend para que a equipa use comandos estáveis.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: objeto `scripts`.

3. Instruções do que fazer.

Abre `apps/api/package.json`, mantém os scripts existentes e acrescenta apenas as duas entradas abaixo dentro de `scripts`. Não removas comandos de testes, Prisma, lint ou desenvolvimento que já existam.

4. Código completo, correto e integrado com a app final.

```json
{
  "scripts": {
    "mf7:backup": "node scripts/run-daily-backup.mjs",
    "mf7:backup:verify": "node scripts/verify-backup-restore.mjs"
  }
}
```

5. Explicação do código.

As chaves `mf7:backup` e `mf7:backup:verify` dão nomes previsíveis aos dois comandos deste BK. O primeiro cria o dump e o manifesto; o segundo valida que o dump pode ser listado por `pg_restore`.

O prefixo `mf7:` deixa claro que estes comandos pertencem à macrofase de operação e manutenção. Isto ajuda o aluno a separar scripts de desenvolvimento, testes, Prisma e evidência operacional.

6. Validação do passo.

Confirma que o `package.json` continua JSON válido:

```bash
cd apps/api
node -e "JSON.parse(require('node:fs').readFileSync('package.json', 'utf8')); console.log('package.json válido')"
```

Resultado esperado: `package.json válido`.

7. Cenário negativo/erro esperado.

Se apagares uma vírgula ou fechares mal o objeto `scripts`, o comando anterior deve falhar com erro de JSON. Corrige o `package.json` antes de avançar.

### Passo 6 - Executar negativos obrigatórios

1. Objetivo funcional do passo no contexto da app.

Executar o fluxo principal e os negativos mínimos para provar que o BK falha de forma controlada.

2. Ficheiros envolvidos:
    - REVER: `apps/api/scripts/run-daily-backup.mjs`
    - REVER: `apps/api/scripts/verify-backup-restore.mjs`
    - REVER: `apps/api/package.json`
    - LOCALIZAÇÃO: terminal em `apps/api`.

3. Instruções do que fazer.

Executa primeiro o fluxo feliz em ambiente local com PostgreSQL disponível. Depois executa três negativos: sem `DATABASE_URL`, ficheiro inexistente e ficheiro vazio. Guarda apenas mensagens controladas na evidence.

4. Código completo, correto e integrado com a app final.

```bash
cd apps/api
OPSA_BACKUP_DIR=./backups npm run mf7:backup
OPSA_BACKUP_FILE=./backups/opsa-AAAA-MM-DDTHH-MM-SS.sssZ.dump npm run mf7:backup:verify

DATABASE_URL= npm run mf7:backup
OPSA_BACKUP_FILE=./backups/inexistente.dump npm run mf7:backup:verify
mkdir -p ./backups && : > ./backups/vazio.dump && OPSA_BACKUP_FILE=./backups/vazio.dump npm run mf7:backup:verify
```

5. Explicação do código.

Os dois primeiros comandos são o fluxo principal: criar backup e verificar o ficheiro criado. Substitui `opsa-AAAA-MM-DDTHH-MM-SS.sssZ.dump` pelo nome real devolvido pelo manifesto do comando anterior.

Os três negativos confirmam que o BK não aceita configuração ausente, ficheiro inexistente ou ficheiro vazio. Isto é importante porque um sistema de backups que falha silenciosamente cria falsa confiança operacional.

Não coloques `DATABASE_URL` nem conteúdo do dump na evidence. A prova deve mostrar apenas manifesto, estado `restorable`, número de entradas e mensagens de erro controladas.

6. Validação do passo.

Resultados esperados:

- Fluxo feliz: o primeiro comando imprime JSON com `file`, `sizeBytes`, `createdAt`, `engine` e `sha256`.
- Verificação: o segundo comando imprime JSON com `restorable: true`, `catalogEntries` maior que `0` e `check: "pg_restore --list"`.
- Sem `DATABASE_URL`: mensagem `DATABASE_URL em falta para executar backup`.
- Ficheiro inexistente: mensagem `Backup não encontrado: indica um ficheiro .dump existente`.
- Ficheiro vazio: mensagem `Backup inválido: ficheiro vazio`.

7. Cenário negativo/erro esperado.

Se `pg_dump` ou `pg_restore` não existirem na máquina local, o erro esperado deve indicar que a ferramenta PostgreSQL não está instalada. Nesse caso, instala as ferramentas PostgreSQL adequadas ao teu ambiente antes de validar o `RNF18`.

### Passo 7 - Fechar evidence e handoff

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com validação, evidence e handoff mensurável para a próxima entrega.

2. Ficheiros envolvidos:
    - REVER: `apps/api/backups/*.dump`
    - REVER: `apps/api/backups/*.dump.json`
    - REVER: output de `npm run mf7:backup:verify`
    - LOCALIZAÇÃO: evidence técnica do PR ou pacote de defesa.

3. Instruções do que fazer.

Regista no PR ou pacote de defesa o manifesto do backup, a verificação com `pg_restore --list`, os negativos executados e o handoff para `BK-MF7-02`. A evidence deve provar o contrato sem publicar credenciais nem dados financeiros.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de fecho operacional: junta outputs controlados, confirma critérios de aceite e prepara o próximo BK.

5. Explicação do código.

Sem código neste passo porque a implementação já ficou fechada nos dois scripts e no `package.json`. O foco agora é provar que o backup foi criado, que o ficheiro tem hash, que `pg_restore` o consegue listar e que os erros principais são compreensíveis.

6. Validação do passo.

Confirma que a evidence contém:

- manifesto `.dump.json` sem credenciais;
- output de `npm run mf7:backup:verify` com `restorable: true`;
- três negativos com mensagens esperadas;
- indicação de que `BK-MF7-02` vai tratar retenção e obrigações documentais.

7. Cenário negativo/erro esperado.

Se a evidence incluir `DATABASE_URL`, dados financeiros completos ou caminhos locais sensíveis, remove essa informação antes de entregar. A prova deve demonstrar o contrato técnico, não divulgar configuração privada.

#### Critérios de aceite

- O requisito `RNF18` fica demonstrável por ficheiro, script, teste ou output controlado.
- Existem `apps/api/scripts/run-daily-backup.mjs` e `apps/api/scripts/verify-backup-restore.mjs`.
- `apps/api/package.json` tem `mf7:backup` e `mf7:backup:verify`.
- A verificação usa `pg_restore --list` e devolve `restorable: true` para um dump válido.
- O código indicado tem JSDoc nos elementos principais e comentários didáticos junto das decisões de segurança ou domínio.
- O backend mantém autenticação, autorização e empresa ativa como fonte de verdade.
- Negativos: mínimo `3` cenários com resultado esperado documentado.
- Não há caminhos privados nem linguagem interna no guia.

#### Validação final

- `git diff --check` deve sair limpo.
- `bash scripts/validate-planificacao.sh` deve manter `overall_pass=true`; advisory antigo fora da MF7 pode continuar registado.
- `cd apps/api && node --check scripts/run-daily-backup.mjs`
- `cd apps/api && node --check scripts/verify-backup-restore.mjs`
- `cd apps/api && OPSA_BACKUP_DIR=./backups npm run mf7:backup`
- `cd apps/api && OPSA_BACKUP_FILE=./backups/<ficheiro-gerado>.dump npm run mf7:backup:verify`

#### Evidence para PR/defesa

- `pr`: referência do PR ou pacote de entrega.
- `proof`: manifesto do backup e output de `mf7:backup:verify`.
- `neg`: ausência de `DATABASE_URL`, ficheiro inexistente e ficheiro vazio.
- `fonte`: `docs/RNF.md`, matriz, backlog e este guia.
- `multiempresa`: confirmação de que a empresa ativa vem do contexto autenticado no backend.

#### Handoff

- Proximo BK recomendado: `BK-MF7-02`
- Este BK entrega a `BK-MF7-02` um contrato validado: ficam disponíveis scripts de backup e verificação de restauro para PostgreSQL, com manifesto, hash e output de `pg_restore --list`.
- Risco restante: decisões externas de fornecedor, certificação ou infraestrutura devem ficar documentadas antes de produção real.

#### Changelog

- `2026-06-25`: guia reescrito para tutorial técnico linear, autocontido e alinhado com a MF7 completa.
- `2026-06-26`: adicionada verificação de restauro com `pg_restore --list`, scripts de `package.json`, negativos específicos e evidence fechada para `RNF18`.
