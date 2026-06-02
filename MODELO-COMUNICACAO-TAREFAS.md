# Modelo Universal de Comunicação de Tarefas - PAPs

## 0) Identificação rápida

PAP: `{{PAP_NOME}}`

Repositório: `{{REPO_URL_OU_NOME}}`

Base branch: `main`

Modo de trabalho:

- `MF completa`: `{{MF_ID}} - {{MF_TITULO}}`
- `Conjunto de BKs`: `{{BK_INICIAL}}..{{BK_FINAL}}` ou `{{LISTA_BKS}}`

Snapshot dos documentos: `{{DATA_SNAPSHOT}}`

Documentos principais:

- `{{PATH_PLANO_IMPLEMENTACAO}}`
- `{{PATH_BACKLOG}}`
- `{{PATH_MF_VIEWS}}`
- `{{PATH_GUIAS_BK}}`
- `{{PATH_RF}}`
- `{{PATH_RNF}}`

---

## 1) Branches a usar

Antes de começar, criar sempre uma branch nova a partir de `main`.

### Regra de nomes

Usar sempre nomes curtos, previsíveis e em minúsculas:

```text
feat/{{pap-slug}}-{{mf-id}}-{{bk-num}}-{{bk-slug}}-{{owner-slug}}
```

Para uma MF completa:

```text
feat/{{pap-slug}}-{{mf-id}}-{{mf-slug}}-{{grupo-ou-owner}}
```

Para um conjunto de BKs:

```text
feat/{{pap-slug}}-{{mf-id}}-{{bk-inicial}}-{{bk-final}}-{{tema}}-{{owner-slug}}
```

Para correções:

```text
fix/{{pap-slug}}-{{mf-id}}-{{bk-num}}-{{problema}}
```

### Branches desta comunicação

Preencher esta tabela antes de enviar a tarefa ao grupo/agente.

| Unidade                           | Owner          | Branch                                                              |
| --------------------------------- | -------------- | ------------------------------------------------------------------- |
| `{{BK_ID_01}}` - {{BK_TITULO_01}} | `{{OWNER_01}}` | `feat/{{pap-slug}}-{{mf-id}}-{{bk-num}}-{{bk-slug}}-{{owner-slug}}` |
| `{{BK_ID_02}}` - {{BK_TITULO_02}} | `{{OWNER_02}}` | `feat/{{pap-slug}}-{{mf-id}}-{{bk-num}}-{{bk-slug}}-{{owner-slug}}` |
| `{{BK_ID_03}}` - {{BK_TITULO_03}} | `{{OWNER_03}}` | `feat/{{pap-slug}}-{{mf-id}}-{{bk-num}}-{{bk-slug}}-{{owner-slug}}` |

Exemplo:

| Unidade                        | Owner       | Branch                                   |
| ------------------------------ | ----------- | ---------------------------------------- |
| `BK-MF0-01` - Registo do aluno | `Natalia`   | `feat/studyflow-mf0-01-registo-natalia`  |
| `BK-MF0-02` - Login seguro     | `Natalia`   | `feat/studyflow-mf0-02-login-natalia`    |
| `BK-MF0-03` - Perfil editável  | `Guilherme` | `feat/studyflow-mf0-03-perfil-guilherme` |

---

## 2) Guia rápido: trabalhar no VS Code

### 2.1 Abrir o projeto

1. Abrir o VS Code.
2. Escolher `File > Open Folder`.
3. Abrir a pasta raiz da PAP/repositório.
4. Abrir o terminal integrado com `Terminal > New Terminal`.

Confirmar que estás na pasta certa:

```bash
git status
```

### 2.2 Atualizar a branch principal

Antes de criar uma branch nova:

```bash
git checkout main
git pull origin main
```

Se o projeto usar outra branch base, substituir `main` por `{{BASE_BRANCH}}`.

### 2.3 Criar a branch da tarefa

```bash
git checkout -b {{BRANCH_DA_TAREFA}}
```

Exemplo:

```bash
git checkout -b feat/studyflow-mf0-01-registo-natalia
```

### 2.4 Implementar em ciclos curtos

Durante o trabalho:

```bash
git status
```

Ver alterações:

```bash
git diff
```

Validar o que vai ser incluído:

```bash
git diff --staged
```

### 2.5 Adicionar ficheiros ao commit

Adicionar apenas ficheiros relacionados com a tarefa:

```bash
git add {{ficheiro_ou_pasta}}
```

Exemplo:

```bash
git add apps/api/src/auth
git add apps/web/src/pages/Login.tsx
```

Evitar `git add .` quando houver alterações que não pertencem à tarefa.

### 2.6 Criar commit

Usar uma mensagem curta e objetiva:

```bash
git commit -m "{{tipo}}: {{resumo_da_tarefa}}"
```

Exemplos:

```bash
git commit -m "feat: add student registration"
git commit -m "fix: validate login cookie session"
git commit -m "test: cover study area ownership checks"
```

Tipos recomendados:

- `feat`: nova funcionalidade;
- `fix`: correção;
- `test`: testes;
- `docs`: documentação;
- `refactor`: refatoração sem mudança de comportamento;
- `chore`: manutenção sem impacto funcional.

### 2.7 Enviar branch para o GitHub

Na primeira vez:

```bash
git push -u origin {{BRANCH_DA_TAREFA}}
```

Nas vezes seguintes:

```bash
git push
```

### 2.8 Abrir Pull Request

1. Abrir o repositório no GitHub.
2. Clicar em `Compare & pull request`.
3. Confirmar:
    - base: `main`;
    - compare: `{{BRANCH_DA_TAREFA}}`.
4. Preencher título, descrição, testes e evidence.
5. Criar o PR.
6. Nunca fazer merge sem validação/revisão.

---

## 3) Guia rápido: trabalhar em GitHub Codespaces

### 3.1 Criar ou abrir Codespace

1. Abrir o repositório no GitHub.
2. Clicar em `Code`.
3. Abrir o separador `Codespaces`.
4. Criar um novo Codespace ou abrir um existente.

### 3.2 Confirmar estado inicial

No terminal do Codespace:

```bash
git status
git branch
```

Atualizar a branch base:

```bash
git checkout main
git pull origin main
```

### 3.3 Criar branch da tarefa

```bash
git checkout -b {{BRANCH_DA_TAREFA}}
```

### 3.4 Instalar dependências, se necessário

Usar apenas o comando previsto no projeto.

Exemplos possíveis:

```bash
npm install
npm ci
```

Não instalar dependências novas sem autorização ou sem justificar a necessidade.

### 3.5 Trabalhar, validar e commitar

Ver alterações:

```bash
git status
git diff
```

Executar validações previstas:

```bash
npm test
npm run lint
```

Adicionar ficheiros:

```bash
git add {{ficheiro_ou_pasta}}
```

Criar commit:

```bash
git commit -m "{{tipo}}: {{resumo_da_tarefa}}"
```

Enviar branch:

```bash
git push -u origin {{BRANCH_DA_TAREFA}}
```

### 3.6 Abrir PR no Codespaces

Opção A: pelo GitHub no browser.

Opção B: pelo painel `Source Control` do VS Code/Codespaces, quando disponível.

O PR deve apontar sempre para `main` ou para a branch base definida pela equipa.

### 3.7 Fechar ou parar Codespace

Depois de terminar:

1. Confirmar que o código foi enviado com `git push`.
2. Confirmar que o PR existe.
3. Parar o Codespace no GitHub se já não for necessário.

---

## 4) Contexto principal

A `{{MF_ID}}` da `{{PAP_NOME}}` corresponde a:

```text
{{DESCRICAO_CURTA_DA_MF_OU_CONJUNTO_DE_BKS}}
```

Nesta tarefa entram:

- `{{ITEM_IN_SCOPE_01}}`;
- `{{ITEM_IN_SCOPE_02}}`;
- `{{ITEM_IN_SCOPE_03}}`.

Fica fora desta tarefa:

- `{{ITEM_OUT_OF_SCOPE_01}}`;
- `{{ITEM_OUT_OF_SCOPE_02}}`;
- `{{ITEM_OUT_OF_SCOPE_03}}`.

Stack/contrato técnico previsto:

- frontend: `{{FRONTEND_STACK}}`;
- backend: `{{BACKEND_STACK}}`;
- base de dados: `{{DATABASE_STACK}}`;
- autenticação/autorização: `{{AUTH_STACK}}`;
- integrações externas: `{{INTEGRACOES}}`;
- estrutura esperada: `{{ESTRUTURA_ESPERADA}}`;
- evidence obrigatória por BK: `sim`.

---

## 5) BKs abrangidos

Se for uma MF completa, listar todos os BKs da MF.

Se for um conjunto de BKs, listar apenas os BKs atribuídos nesta comunicação.

Macro: `{{MF_ID}} - {{MF_TITULO}}`

Janela planeada: `{{SPRINTS_OU_DATAS}}`

| BK             | Título           | Owner        | Apoio        | Prioridade | Esforço        | Dependências        | RF/RNF        | Sprint        | Branch          |
| -------------- | ---------------- | ------------ | ------------ | ---------- | -------------- | ------------------- | ------------- | ------------- | --------------- |
| `{{BK_ID_01}}` | {{BK_TITULO_01}} | {{OWNER_01}} | {{APOIO_01}} | {{PRI_01}} | {{ESFORCO_01}} | {{DEPENDENCIAS_01}} | {{RF_RNF_01}} | {{SPRINT_01}} | `{{BRANCH_01}}` |
| `{{BK_ID_02}}` | {{BK_TITULO_02}} | {{OWNER_02}} | {{APOIO_02}} | {{PRI_02}} | {{ESFORCO_02}} | {{DEPENDENCIAS_02}} | {{RF_RNF_02}} | {{SPRINT_02}} | `{{BRANCH_02}}` |
| `{{BK_ID_03}}` | {{BK_TITULO_03}} | {{OWNER_03}} | {{APOIO_03}} | {{PRI_03}} | {{ESFORCO_03}} | {{DEPENDENCIAS_03}} | {{RF_RNF_03}} | {{SPRINT_03}} | `{{BRANCH_03}}` |

Usar sempre os nomes canónicos do backlog:

- `{{NOME_CANONICO_01}}`;
- `{{NOME_CANONICO_02}}`;
- `{{NOME_CANONICO_03}}`.

---

## 6) Regra principal obrigatória

Antes de começar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `dependências`, `rf_rnf`, `sprint` e `proximo_bk`.
3. Perceber o que entra e o que fica fora.
4. Confirmar se existem dependências ainda não concluídas.
5. Conseguir explicar o plano de implementação em 2-3 frases.
6. Confirmar com o professor/responsável antes de implementar ou fechar o BK, quando isso estiver definido como obrigatório.

Nenhum BK pode ficar `DONE` sem:

- smoke test;
- testes negativos;
- validação técnica;
- evidence `pr`, `proof`, `neg`;
- validação da planificação sem drift;
- PR criado e revisto.

---

## 7) Estrutura técnica

Estrutura esperada do projeto:

- `{{PATH_FRONTEND}}` para frontend;
- `{{PATH_BACKEND}}` para backend;
- `{{PATH_DOCS}}` para documentação;
- `{{PATH_TESTS}}` para testes;
- `{{PATH_SCRIPTS}}` para scripts de validação.

Regras:

1. Reutilizar a estrutura existente.
2. Não criar pastas paralelas como `server/`, `client/`, `frontend/` ou `backend/` se o projeto já tiver outra organização.
3. Não misturar frameworks sem decisão explícita.
4. Não alterar contratos públicos sem confirmar impacto nos BKs dependentes.
5. Não refatorar código não relacionado com a tarefa.
6. Manter responsabilidades separadas por domínio/módulo.

---

## 8) Dados, segurança e variáveis de ambiente

Nunca colocar segredos no repositório.

Usar apenas `.env` local para:

- `{{ENV_VAR_01}}`;
- `{{ENV_VAR_02}}`;
- `{{ENV_VAR_03}}`.

Antes de commit:

```bash
git status
```

Confirmar:

- `.env` não está staged;
- não há tokens, API keys, cookies reais ou URIs privadas;
- evidence está sanitizada;
- logs não expõem prompts internos, chaves ou dados pessoais;
- ficheiros de teste não incluem dados reais sensíveis;
- uploads ou anexos de teste são fictícios/sanitizados;
- permissões e ownership foram validados quando há dados de utilizadores.

---

## 9) Ordem de execução

0. Fazer refresh de tabs GitHub/IDE abertas.
1. Confirmar a branch base:

```bash
git checkout main
git pull origin main
```

2. Criar a branch da tarefa:

```bash
git checkout -b {{BRANCH_DA_TAREFA}}
```

3. Ler `{{PATH_README_PLANIFICACAO}}`.
4. Confirmar hierarquia canónica e regra de precedência.
5. Abrir `{{PATH_PLANO_IMPLEMENTACAO}}`.
6. Confirmar `{{MF_ID}} - {{MF_TITULO}}`.
7. Abrir `{{PATH_MF_VIEWS}}`.
8. Confirmar sequência dos BKs abrangidos.
9. Abrir `{{PATH_BACKLOG}}`.
10. Confirmar estado, dependências, owner, apoio, prioridade, esforço, RF/RNF e sprint.
11. Abrir o guia específico de cada BK em `{{PATH_GUIAS_BK}}`.
12. Validar o scope-out antes de escrever código.
13. Implementar em ciclos curtos.
14. Manter o PR pequeno e focado.
15. Validar smoke + negativos + evidence.
16. Correr validação documental/técnica:

```bash
{{COMANDO_VALIDACAO_DOCUMENTAL}}
```

17. Correr testes:

```bash
{{COMANDO_TESTES}}
{{COMANDO_LINT}}
```

18. Fazer commit e push.
19. Criar PR para `main`.

---

## 10) SSOT mínimo

Ler apenas as partes relevantes.

Documentos funcionais:

- `{{PATH_RF}}`
    - `{{RF_RELEVANTES}}`.

Documentos não funcionais:

- `{{PATH_RNF}}`
    - `{{RNF_RELEVANTES}}`.

Planificação:

- `{{PATH_PLANO_IMPLEMENTACAO}}`
    - calendário macro;
    - gates;
    - dependências entre fases.

- `{{PATH_BACKLOG}}`
    - linhas `{{LISTA_BKS}}`;
    - snapshot por macro;
    - prioridades e owners.

- `{{PATH_MF_VIEWS}}`
    - secção `{{MF_ID}} - {{MF_TITULO}}`.

- `{{PATH_PLANO_SPRINTS}}`
    - sprints `{{SPRINTS_RELEVANTES}}`;
    - matriz mínima de testes por prioridade.

Guias específicos:

- `{{GUIA_BK_01}}`;
- `{{GUIA_BK_02}}`;
- `{{GUIA_BK_03}}`.

---

## 11) Validação por BK

Duplicar este bloco para cada BK da comunicação.

### `{{BK_ID}}` - {{BK_TITULO}}

Owner: `{{OWNER}}`

Apoio: `{{APOIO}}`

Prioridade: `{{PRIORIDADE}}`

Branch: `{{BRANCH}}`

Dependências:

- `{{DEPENDENCIA_01}}`;
- `{{DEPENDENCIA_02}}`.

Scope:

- `{{SCOPE_01}}`;
- `{{SCOPE_02}}`;
- `{{SCOPE_03}}`.

Fora de scope:

- `{{OUT_OF_SCOPE_01}}`;
- `{{OUT_OF_SCOPE_02}}`.

Smoke:

- `{{SMOKE_01}}`;
- `{{SMOKE_02}}`;
- `{{SMOKE_03}}`.

Negativos:

- `{{NEG_01}}`;
- `{{NEG_02}}`;
- `{{NEG_03}}`.

Validação técnica:

- `{{VALIDACAO_TECNICA_01}}`;
- `{{VALIDACAO_TECNICA_02}}`;
- `{{VALIDACAO_TECNICA_03}}`.

Bloqueios ou decisões pendentes:

- `{{BLOQUEIO_OU_DECISAO_01}}`;
- `{{BLOQUEIO_OU_DECISAO_02}}`.

Critério de conclusão:

- implementação concluída;
- testes mínimos concluídos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

---

## 12) Evidence obrigatória

Cada BK deve preencher:

- `pr`;
- `proof`;
- `neg`;
- `files`;
- `commands`;
- `screenshots`, quando houver UI;
- `notes`.

Mínimo por prioridade:

- `P0`: `unit + integration + e2e`, mínimo `3` negativos;
- `P1`: `unit/integration`, mínimo `2` negativos;
- `P2`: teste focal, mínimo `1` negativo.

Comandos esperados:

```bash
{{COMANDO_UNIT_TESTS}}
{{COMANDO_INTEGRATION_TESTS}}
{{COMANDO_E2E_TESTS}}
{{COMANDO_LINT}}
{{COMANDO_VALIDACAO_PLANIFICACAO}}
```

Quando o BK não pedir E2E, manter pelo menos:

```bash
{{COMANDO_UNIT_TESTS}}
{{COMANDO_LINT}}
```

Evidence nunca pode conter:

- passwords reais;
- tokens;
- cookies reais;
- URIs privadas;
- API keys;
- prompts internos sensíveis;
- dados pessoais de alunos;
- documentos escolares reais não sanitizados;
- screenshots com dados reais sensíveis.

---

## 13) Template de evidence por BK

````md
## Evidence - {{BK_ID}} {{BK_TITULO}}

### PR

- URL: {{PR_URL}}
- Branch: {{BRANCH}}
- Base: main

### Proof

- {{PROOF_01}}
- {{PROOF_02}}
- {{PROOF_03}}

### Negativos

- {{NEG_01}}
- {{NEG_02}}
- {{NEG_03}}

### Ficheiros alterados

- {{FILE_01}}
- {{FILE_02}}
- {{FILE_03}}

### Comandos executados

```bash
{{COMMAND_01}}
{{COMMAND_02}}
{{COMMAND_03}}
```

### Screenshots

- {{SCREENSHOT_01}}
- {{SCREENSHOT_02}}

### Notas

- {{NOTA_01}}
- {{NOTA_02}}
````

---

## 14) Template de PR

```md
## Objetivo

Implementa `{{BK_ID}} - {{BK_TITULO}}` no âmbito de `{{MF_ID}} - {{MF_TITULO}}`.

## Alterações

- {{ALTERACAO_01}}
- {{ALTERACAO_02}}
- {{ALTERACAO_03}}

## Validação

- [ ] Smoke test concluído
- [ ] Testes negativos concluídos
- [ ] Testes unitários/integrados executados
- [ ] Lint executado
- [ ] Evidence preenchida
- [ ] Sem segredos ou dados sensíveis no commit
- [ ] Sem drift documental

## Evidence

- `pr`: {{PR_URL}}
- `proof`: {{PROOF_RESUMO}}
- `neg`: {{NEG_RESUMO}}
- `files`: {{FILES_RESUMO}}
- `commands`: {{COMMANDS_RESUMO}}
- `screenshots`: {{SCREENSHOTS_RESUMO}}
- `notes`: {{NOTES_RESUMO}}

## Dependências e notas

- Dependências confirmadas: {{DEPENDENCIAS_CONFIRMADAS}}
- Bloqueios: {{BLOQUEIOS}}
- Fora de scope: {{FORA_DE_SCOPE}}
```

---

## 15) Instruções para agente adaptar este modelo

Quando um agente receber este modelo, deve:

1. Identificar a PAP correta.
2. Identificar se o pedido é para uma MF completa ou para um conjunto de BKs.
3. Ler os documentos SSOT indicados.
4. Preencher os placeholders com dados confirmados.
5. Remover linhas que não se aplicam.
6. Manter a ordem do topo:
    - identificação;
    - branches;
    - VS Code;
    - Codespaces;
    - contexto;
    - BKs;
    - execução;
    - validação;
    - evidence.
7. Não inventar RFs, RNFs, owners, dependências, endpoints, campos, regras de negócio ou estados.
8. Se faltar informação crítica, escrever `TODO_CONFIRMAR` e listar a dúvida.

### Pedido-tipo para adaptação

```text
Adapta o MODELO-COMUNICACAO-TAREFAS-GRUPOS.md para:

- PAP: {{PAP_NOME}}
- MF: {{MF_ID}} - {{MF_TITULO}}
- BKs: {{LISTA_BKS}}
- Grupo/owners: {{GRUPO_OU_OWNERS}}
- Branch base: main

Usa apenas os documentos da planificação da PAP.
Coloca no topo os nomes das branches.
Inclui guia de VS Code, Codespaces, validação, evidence e template de PR.
Quando faltar informação, usa TODO_CONFIRMAR.
```

---

## 16) Checklist final antes de enviar ao grupo

- [ ] PAP correta.
- [ ] MF ou BKs corretos.
- [ ] Branches preenchidas no topo.
- [ ] Owners e apoios confirmados.
- [ ] Dependências confirmadas.
- [ ] RF/RNF relevantes confirmados.
- [ ] Scope e fora de scope claros.
- [ ] Guia VS Code incluído.
- [ ] Guia Codespaces incluído.
- [ ] Validação por BK incluída.
- [ ] Evidence obrigatória incluída.
- [ ] Template de PR incluído.
- [ ] Não há dados inventados.
- [ ] `TODO_CONFIRMAR` usado onde falta informação.
