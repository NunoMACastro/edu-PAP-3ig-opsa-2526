# Comunicacao de Tarefas - MF1 OPSA

Documento preenchido a partir de `MODELO-COMUNICACAO-TAREFAS.md` para comunicar a execucao da `MF1` da PAP `OPSA`.

Snapshot usado:

- backlog: `2026-06-01`;
- guias `MF1`: `2026-06-01`;
- contrato tecnico: `2026-06-01`;
- ordem de PRs `MF1`: `2026-06-01`.

---

## 0) Identificacao rapida

PAP: `OPSA`

Repositorio: `opsa`

Base branch: `main`

Modo de trabalho:

- `MF completa`: `MF1 - Nucleo funcional I`
- BKs abrangidos: `BK-MF1-01..BK-MF1-10`

Snapshot dos documentos: `2026-06-01`

Documentos principais:

- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/guias-bk/MF1/`
- `docs/planificacao/guias-bk/MF1/ORDEM-DEPENDENCIAS-E-PRS-MF1.md`
- `docs/RF.md`
- `docs/RNF.md`

---

## 1) Branches a usar

Antes de comecar, criar sempre uma branch nova a partir de `main` atualizada.

Regra desta comunicacao:

```text
feat/bk-mf1-XX-descricao-owner
```

Branches da `MF1`:

| Unidade | Owner | Branch |
| --- | --- | --- |
| `BK-MF1-01` - Configurar tabelas de IVA | `Oleksii` | `feat/bk-mf1-01-iva-oleksii` |
| `BK-MF1-02` - Emitir documentos de venda | `Oleksii` | `feat/bk-mf1-02-documentos-venda-oleksii` |
| `BK-MF1-03` - Registar recebimentos | `Pedro` | `feat/bk-mf1-03-recebimentos-pedro` |
| `BK-MF1-04` - Lancamentos automaticos por venda | `Oleksii` | `feat/bk-mf1-04-lancamentos-venda-oleksii` |
| `BK-MF1-05` - Titulos em aberto e antiguidade | `Oleksii` | `feat/bk-mf1-05-titulos-aberto-oleksii` |
| `BK-MF1-06` - Aprovacao de vendas | `Andre` | `feat/bk-mf1-06-aprovacao-vendas-andre` |
| `BK-MF1-07` - Documentos de compra | `Oleksii` | `feat/bk-mf1-07-documentos-compra-oleksii` |
| `BK-MF1-08` - Registar pagamentos | `Pedro` | `feat/bk-mf1-08-pagamentos-pedro` |
| `BK-MF1-09` - Lancamentos automaticos de compras | `Oleksii` | `feat/bk-mf1-09-lancamentos-compras-oleksii` |
| `BK-MF1-10` - Aprovacao de compras | `Andre` | `feat/bk-mf1-10-aprovacao-compras-andre` |

Para correcoes dentro da `MF1`, usar:

```text
fix/bk-mf1-XX-problema
```

---

## 2) Guia rapido: trabalhar no VS Code

### 2.1 Abrir o projeto

1. Abrir o VS Code.
2. Escolher `File > Open Folder`.
3. Abrir a pasta raiz da PAP/repositorio.
4. Abrir o terminal integrado com `Terminal > New Terminal`.

Confirmar que estas na pasta certa:

```bash
git status
```

### 2.2 Atualizar a branch principal

Antes de criar uma branch nova:

```bash
git checkout main
git pull origin main
```

### 2.3 Criar a branch da tarefa

Exemplo para `BK-MF1-01`:

```bash
git checkout -b feat/bk-mf1-01-iva-oleksii
```

### 2.4 Implementar em ciclos curtos

Durante o trabalho:

```bash
git status
git diff
```

Validar o que vai ser incluido:

```bash
git diff --staged
```

### 2.5 Adicionar ficheiros ao commit

Adicionar apenas ficheiros relacionados com a tarefa:

```bash
git add apps/api/src/modules/vat-rates
git add apps/web/src
git add docs/evidence/BK-MF1-01.md
```

Evitar `git add .` quando houver alteracoes que nao pertencem ao BK.

### 2.6 Criar commit

Usar uma mensagem curta e objetiva:

```bash
git commit -m "feat: implement mf1 vat rates"
```

Tipos recomendados:

- `feat`: nova funcionalidade;
- `fix`: correcao;
- `test`: testes;
- `docs`: documentacao;
- `refactor`: refatoracao sem mudanca de comportamento;
- `chore`: manutencao sem impacto funcional.

### 2.7 Enviar branch para o GitHub

Na primeira vez:

```bash
git push -u origin feat/bk-mf1-01-iva-oleksii
```

Nas vezes seguintes:

```bash
git push
```

### 2.8 Abrir Pull Request

1. Abrir o repositorio no GitHub.
2. Clicar em `Compare & pull request`.
3. Confirmar:
    - base: `main`;
    - compare: a branch do BK.
4. Preencher titulo, descricao, validacao e evidence.
5. Criar o PR.
6. Nunca fazer merge sem validacao/revisao.

---

## 3) Guia rapido: trabalhar em GitHub Codespaces

### 3.1 Criar ou abrir Codespace

1. Abrir o repositorio no GitHub.
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
git checkout -b feat/bk-mf1-01-iva-oleksii
```

### 3.4 Instalar dependencias, se necessario

Usar apenas o comando previsto no projeto:

```bash
npm install
```

Se a equipa definir `npm ci`, usar `npm ci`. Nao instalar dependencias novas sem autorizacao ou sem justificar a necessidade.

### 3.5 Trabalhar, validar e commitar

```bash
git status
git diff
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run syntax:check
npm --prefix apps/api run prisma:validate
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
bash scripts/validate-planificacao.sh
git add <ficheiros-do-bk>
git commit -m "feat: implement mf1 vat rates"
git push -u origin feat/bk-mf1-01-iva-oleksii
```

### 3.6 Abrir PR no Codespaces

Opcoes:

- pelo GitHub no browser;
- pelo painel `Source Control` do VS Code/Codespaces, quando disponivel.

O PR deve apontar sempre para `main`.

---

## 4) Contexto principal

A `MF1` da `OPSA` corresponde ao `Nucleo funcional I`: ciclo comercial minimo com impacto financeiro e contabilistico.

Nesta tarefa entram:

- configuracao de tabelas de IVA;
- emissao de documentos de venda;
- recebimentos de clientes;
- lancamentos contabilisticos automaticos por venda;
- consulta de titulos em aberto e antiguidade de saldos;
- aprovacao simples de documentos de venda;
- registo de documentos de compra;
- pagamentos a fornecedores;
- lancamentos contabilisticos automaticos de compras;
- aprovacao de compras com estados `DRAFT -> APPROVED -> POSTED`.

Fica fora desta tarefa:

- mapas de IVA, que pertencem a `BK-MF3-01`;
- SAF-T, que pertence a `BK-MF3-06` e `BK-MF7-07`;
- reconciliacao bancaria, que pertence a `BK-MF3-03`;
- previsao de tesouraria, que pertence a `BK-MF3-04`;
- lancamentos manuais, que pertencem a `BK-MF2-06`;
- historico detalhado de aprovacoes, que pertence a `BK-MF2-01`;
- notificacoes, que pertencem a `MF4`.

Stack/contrato tecnico previsto:

- frontend: `React + Vite + TypeScript`;
- backend: `Node.js LTS + Express` com JavaScript moderno e ES Modules;
- base de dados: `PostgreSQL`;
- ORM/migrations: `Prisma ORM` ou equivalente justificado;
- autenticacao/autorizacao: sessoes com cookies `HttpOnly`, `Secure` em producao e `SameSite` configurado;
- estrutura esperada:
    - `apps/api`;
    - `apps/web`;
    - `apps/api/prisma/schema.prisma`;
    - `apps/web/src/lib/apiClient.ts`;
- evidence obrigatoria por BK: `sim`.

Regra transversal da `MF1`:

- Nenhum BK da `MF1` deve receber `companyId` pelo corpo do pedido.
- A empresa ativa vem sempre do contexto autenticado.
- Dados financeiros devem ser filtrados por `companyId`.
- Dinheiro deve ser guardado em centimos.
- Taxas de IVA devem usar basis points quando aplicavel.
- Operacoes financeiras/contabilisticas devem respeitar periodo fiscal aberto quando o guia o exigir.

---

## 5) BKs abrangidos

Macro: `MF1 - Nucleo funcional I`

Janela planeada: `S03-S04` nos guias dos BKs da `MF1`.

Equipa envolvida: `Oleksii`, `Andre`, `Pedro`

| BK | Titulo | Owner | Apoio | Prioridade | Esforco | Dependencias | RF/RNF | Sprint | Branch |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | Configurar tabelas de IVA (taxas, isencoes, codigos). | Oleksii | Andre | P0 | M | `BK-MF0-03` | RF13 | S03-S04 | `feat/bk-mf1-01-iva-oleksii` |
| `BK-MF1-02` | Emitir Fatura, Fatura-Recibo, Nota de Credito, com numeracao sequencial. | Oleksii | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF0-09`, `BK-MF0-11`, `BK-MF1-01` | RF14 | S03-S04 | `feat/bk-mf1-02-documentos-venda-oleksii` |
| `BK-MF1-03` | Registar recebimentos (parciais/totais). | Pedro | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-02` | RF15 | S03-S04 | `feat/bk-mf1-03-recebimentos-pedro` |
| `BK-MF1-04` | Gerar lancamentos contabilisticos automaticos por venda. | Oleksii | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-02` | RF16 | S03-S04 | `feat/bk-mf1-04-lancamentos-venda-oleksii` |
| `BK-MF1-05` | Consultar titulos em aberto e antiguidade de saldos. | Oleksii | Pedro | P1 | S | `BK-MF0-03`, `BK-MF1-02`, `BK-MF1-03` | RF17 | S03-S04 | `feat/bk-mf1-05-titulos-aberto-oleksii` |
| `BK-MF1-06` | Submeter documentos de venda para aprovacao antes de emissao definitiva. | Andre | Oleksii | P1 | S | `BK-MF0-03`, `BK-MF1-02` | RF18 | S03-S04 | `feat/bk-mf1-06-aprovacao-vendas-andre` |
| `BK-MF1-07` | Registar Fatura de Fornecedor e Nota de Credito. | Oleksii | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF0-10`, `BK-MF0-11`, `BK-MF1-01` | RF19 | S03-S04 | `feat/bk-mf1-07-documentos-compra-oleksii` |
| `BK-MF1-08` | Registar pagamentos (parciais/totais). | Pedro | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-07` | RF20 | S03-S04 | `feat/bk-mf1-08-pagamentos-pedro` |
| `BK-MF1-09` | Gerar lancamentos contabilisticos automaticos de compras. | Oleksii | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-04`, `BK-MF1-07` | RF21 | S03-S04 | `feat/bk-mf1-09-lancamentos-compras-oleksii` |
| `BK-MF1-10` | Aprovacao de compras com estados `Rascunho -> Aprovado -> Lancado`. | Andre | Oleksii | P1 | S | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-07`, `BK-MF1-09` | RF22 | S03-S04 | `feat/bk-mf1-10-aprovacao-compras-andre` |

Usar sempre os nomes canonicos do backlog e dos guias:

- `BK-MF1-01` a `BK-MF1-10`;
- `MF1 - Nucleo funcional I`;
- `RF13` a `RF22`.

---

## 6) Regra principal obrigatoria

Antes de comecar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `sprint`, `core_or_reforco`, `proximo_bk` e `guia_path`.
3. Confirmar que os BKs das `dependencias` estao implementados, merged ou explicitamente autorizados como baseline.
4. Perceber o que entra e o que fica fora.
5. Confirmar que nao existe outro PR ativo a mexer em `apps/api/prisma/schema.prisma` ou `apps/api/src/server.js`.
6. Conseguir explicar o plano de implementacao em 2-3 frases.
7. Confirmar comigo antes de implementar ou fechar o BK.

Nenhum BK pode ficar `DONE` sem:

- smoke funcional;
- testes negativos;
- validacao tecnica;
- evidence `pr`, `proof`, `neg`, `files`, `commands`;
- screenshots quando houver UI;
- validacao da planificacao sem drift;
- PR criado e revisto.

---

## 7) Estrutura tecnica

Estrutura esperada do projeto:

- `apps/web` para frontend;
- `apps/api` para backend/API;
- `apps/api/prisma/schema.prisma` para schema Prisma;
- `apps/api/tests` para testes da API;
- `docs` para documentacao;
- `docs/evidence` para evidence por BK;
- `scripts` para scripts de validacao documental.

Regras:

1. Reutilizar a estrutura existente.
2. Nao criar pastas paralelas como `server/`, `client/`, `frontend/` ou `backend` se o projeto ja tiver outra organizacao.
3. Nao misturar frameworks sem decisao explicita.
4. Nao alterar contratos publicos sem confirmar impacto nos BKs dependentes.
5. Nao refatorar codigo nao relacionado com a tarefa.
6. Manter responsabilidades separadas por dominio/modulo.
7. Se a estrutura real diferir da estrutura indicativa do guia, documentar no PR:
    - caminho indicado no guia;
    - caminho real usado;
    - motivo da adaptacao;
    - confirmacao de que o contrato funcional se manteve.

---

## 8) Dados, seguranca e variaveis de ambiente

Nunca colocar segredos no repositorio.

Usar apenas `.env` local para:

- `DATABASE_URL`;
- `SESSION_SECRET` ou segredo equivalente;
- configuracao local necessaria a PostgreSQL/Prisma;
- qualquer chave externa futura, se for aprovada.

Antes de commit:

```bash
git status
```

Confirmar:

- `.env` nao esta staged;
- nao ha tokens, API keys, cookies reais ou URIs privadas;
- evidence esta sanitizada;
- logs nao expoem stack traces sensiveis, segredos, hashes, tokens ou dados financeiros reais;
- dados de teste respeitam isolamento por empresa;
- ficheiros de teste nao incluem dados reais sensiveis;
- screenshots nao mostram dados pessoais reais;
- permissoes e ownership foram validados quando ha dados de utilizadores.

---

## 9) Ordem de execucao

0. Fazer refresh de tabs GitHub/IDE abertas.
1. Confirmar a branch base:

```bash
git checkout main
git pull origin main
```

2. Criar a branch da tarefa:

```bash
git checkout -b feat/bk-mf1-01-iva-oleksii
```

3. Ler `docs/planificacao/README.md`.
4. Confirmar hierarquia canonica:
    - `MATRIZ-CANONICA-BK`;
    - `BACKLOG-MVP`;
    - `PLANO-SPRINTS`;
    - `SCORECARD-SPRINTS`;
    - `GUIAO-DOCENTE-SEMANAL`;
    - `GATES-S4-S8-S12`;
    - `guias-bk/*`.
5. Ler `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
6. Ler `docs/planificacao/guias-bk/MF1/ORDEM-DEPENDENCIAS-E-PRS-MF1.md`.
7. Abrir `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
8. Confirmar `MF1 - Nucleo funcional I`.
9. Abrir `docs/planificacao/backlogs/MF-VIEWS.md`.
10. Confirmar sequencia:
    - `BK-MF1-01`;
    - `BK-MF1-02`;
    - `BK-MF1-03`;
    - `BK-MF1-04`;
    - `BK-MF1-05`;
    - `BK-MF1-06`;
    - `BK-MF1-07`;
    - `BK-MF1-08`;
    - `BK-MF1-09`;
    - `BK-MF1-10`.
11. Abrir `docs/planificacao/backlogs/BACKLOG-MVP.md`.
12. Confirmar estado, dependencias, owner, apoio, prioridade, esforco, RF/RNF e sprint.
13. Abrir o guia especifico de cada BK em `docs/planificacao/guias-bk/MF1/`.
14. Validar o scope-out antes de escrever codigo.
15. Implementar em ciclos curtos.
16. Manter o PR pequeno e focado.
17. Validar smoke + negativos + evidence.
18. Correr validacao documental:

```bash
bash scripts/validate-planificacao.sh
```

19. Correr testes e checks relevantes:

```bash
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run syntax:check
npm --prefix apps/api run prisma:validate
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
```

20. Fazer commit e push.
21. Criar PR para `main`.

---

## 10) SSOT minimo

Ler apenas as partes relevantes.

Documentos funcionais:

- `docs/RF.md`
    - `RF13..RF22`;
    - `RF03`, quando houver isolamento multiempresa;
    - `RF08`, quando houver periodo fiscal ou lancamento contabilistico;
    - `RF47`, quando houver auditoria de operacoes sensiveis.

Documentos nao funcionais:

- `docs/RNF.md`
    - validacao de formularios e mensagens de erro;
    - seguranca de sessoes;
    - protecao contra ataques comuns;
    - credenciais apenas em variaveis de ambiente;
    - modularidade backend/frontend;
    - auditoria e logs quando aplicavel.

Planificacao:

- `docs/planificacao/README.md`
    - hierarquia canonica;
    - validacao oficial;
    - contrato pedagogico por prioridade.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
    - stack assumida;
    - estrutura indicativa;
    - regra de adaptacao quando existir scaffold real;
    - dependencias tecnicas bloqueantes.
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - `MF1`;
    - regras transversais;
    - gates `S4`, `S8`, `S12`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - linhas `BK-MF1-01..BK-MF1-10`;
    - contrato de dados canonico;
    - contrato pedagogico comum.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - linhas `BK-MF1-01..BK-MF1-10`;
    - dependencias e proximo BK.
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - linhas `BK-MF1-01..BK-MF1-10`;
    - alinhamento de `dependencias`, `rf_rnf` e `guia_path`.
- `docs/planificacao/backlogs/MF-VIEWS.md`
    - secao `MF1 - Nucleo funcional I`.
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - `S03` e `S04`;
    - capacidade semanal;
    - gates e KPIs.

Guias especificos:

- `docs/planificacao/guias-bk/MF1/BK-MF1-01-configurar-tabelas-de-iva-taxas-isencoes-codigos.md`;
- `docs/planificacao/guias-bk/MF1/BK-MF1-02-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md`;
- `docs/planificacao/guias-bk/MF1/BK-MF1-03-registar-recebimentos-parciais-totais.md`;
- `docs/planificacao/guias-bk/MF1/BK-MF1-04-gerar-lancamentos-contabilisticos-automaticos-por-venda.md`;
- `docs/planificacao/guias-bk/MF1/BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md`;
- `docs/planificacao/guias-bk/MF1/BK-MF1-06-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiva.md`;
- `docs/planificacao/guias-bk/MF1/BK-MF1-07-registar-fatura-de-fornecedor-e-nota-de-credito.md`;
- `docs/planificacao/guias-bk/MF1/BK-MF1-08-registar-pagamentos-parciais-totais.md`;
- `docs/planificacao/guias-bk/MF1/BK-MF1-09-gerar-lancamentos-contabilisticos-automaticos-de-compras.md`;
- `docs/planificacao/guias-bk/MF1/BK-MF1-10-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md`.

---

## 11) Validacao por BK

### `BK-MF1-01` - Configurar tabelas de IVA

Owner: `Oleksii`

Apoio: `Andre`

Prioridade: `P0`

Branch: `feat/bk-mf1-01-iva-oleksii`

Dependencias:

- `BK-MF0-03`.

Scope:

- modelo `VatRate` por empresa;
- taxa em basis points;
- codigo unico por empresa;
- endpoint protegido para listagem e criacao;
- UI administrativa minima para gerir taxas ativas.

Fora de scope:

- submissao fiscal externa;
- mapas de IVA;
- SAF-T.

Smoke:

- `GET /api/vat-rates` lista taxas da empresa ativa;
- `POST /api/vat-rates` cria taxa/codigo valido com `rateBps`;
- UI permite listar, criar e ativar/desativar taxas.

Negativos:

- pedido sem sessao devolve `401`;
- pedido sem empresa ativa devolve `403` ou erro definido na MF0;
- codigo duplicado na mesma empresa devolve `409`;
- taxa isenta sem motivo de isencao devolve erro validado no backend.

Validacao tecnica:

- `VatRate` pertence a `companyId`;
- taxa guardada como inteiro em basis points;
- vendas e compras futuras usam `vatRateId`, nao taxa solta enviada pelo browser.

Bloqueios ou decisoes pendentes:

- confirmar contratos de autenticacao/contexto de empresa da `MF0`;
- confirmar caminho real dos modulos caso o scaffold diverja do guia.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-02` - Emitir Fatura, Fatura-Recibo e Nota de Credito

Owner: `Oleksii`

Apoio: `Andre`

Prioridade: `P0`

Branch: `feat/bk-mf1-02-documentos-venda-oleksii`

Dependencias:

- `BK-MF0-03`;
- `BK-MF0-08`;
- `BK-MF0-09`;
- `BK-MF0-11`;
- `BK-MF1-01`.

Scope:

- fatura, fatura-recibo e nota de credito;
- sequencia por empresa, ano e tipo de documento;
- calculo backend de subtotal, IVA e total;
- ligacao a cliente, artigo e taxa de IVA;
- endpoint protegido para criacao e listagem.

Fora de scope:

- envio por email;
- SAF-T definitivo;
- contabilizacao automatica.

Smoke:

- `POST /api/sales/documents` cria documento em `DRAFT`;
- endpoint de emissao atribui numeracao sequencial por empresa, ano e tipo;
- totais de linhas, IVA e total sao calculados no backend;
- listagem mostra documentos da empresa ativa.

Negativos:

- cliente, artigo ou taxa de IVA de outra empresa devolve `404` ou `403`;
- documento sem linhas validas devolve `400`;
- emitir documento fora de periodo fiscal aberto fica bloqueado;
- tentativa concorrente nao cria numero duplicado.

Validacao tecnica:

- `NumberSequence` e emissao ocorrem em transacao;
- dinheiro guardado em centimos;
- `companyId` vem da sessao;
- contabilizacao automatica fica fora deste BK.

Bloqueios ou decisoes pendentes:

- confirmar dependencia de `assertOpenFiscalPeriod`;
- coordenar com `BK-MF1-06` antes de alterar regras de emissao definitiva.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-03` - Registar recebimentos

Owner: `Pedro`

Apoio: `Andre`

Prioridade: `P0`

Branch: `feat/bk-mf1-03-recebimentos-pedro`

Dependencias:

- `BK-MF0-03`;
- `BK-MF0-08`;
- `BK-MF1-02`.

Scope:

- recebimentos parciais e totais;
- validacao contra excesso de pagamento;
- metodo, data e referencia externa;
- atualizacao transacional do estado do documento.

Fora de scope:

- reconciliacao bancaria;
- previsao de tesouraria.

Smoke:

- `POST /api/sales/documents/:id/receipts` regista recebimento parcial;
- recebimento total muda o estado/saldo do documento para liquidado quando aplicavel;
- saldo em aberto e atualizado de forma transacional.

Negativos:

- receber valor superior ao saldo em aberto devolve erro controlado;
- receber sobre `CREDIT_NOTE` fica bloqueado;
- data em periodo fiscal fechado fica bloqueada por `assertOpenFiscalPeriod`;
- documento de outra empresa devolve `404` ou `403`.

Validacao tecnica:

- `Receipt` fica ligado ao documento de venda;
- metodo, data e referencia ficam registados;
- auditoria e filtros por empresa ficam no backend.

Bloqueios ou decisoes pendentes:

- confirmar estados finais do documento de venda vindos do `BK-MF1-02`;
- confirmar politica de erro para documento de outra empresa.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-04` - Gerar lancamentos contabilisticos automaticos por venda

Owner: `Oleksii`

Apoio: `Andre`

Prioridade: `P0`

Branch: `feat/bk-mf1-04-lancamentos-venda-oleksii`

Dependencias:

- `BK-MF0-03`;
- `BK-MF0-08`;
- `BK-MF1-02`.

Scope:

- diario automatico de venda;
- debito de cliente e creditos de proveitos e IVA liquidado;
- idempotencia por documento;
- validacao de periodo fiscal aberto.

Fora de scope:

- lancamentos manuais;
- mapa de IVA.

Smoke:

- `POST /api/accounting/sale-postings/:saleDocumentId` contabiliza venda emitida;
- diario fica equilibrado entre debito e credito;
- segunda tentativa sobre o mesmo documento respeita idempotencia.

Negativos:

- contabilizar documento nao emitido devolve erro controlado;
- periodo fiscal fechado fica bloqueado;
- documento de outra empresa devolve `404` ou `403`;
- tentativa de duplicar diario nao duplica proveitos nem IVA.

Validacao tecnica:

- usar contas SNC pedagogicas previstas no guia;
- criar `JournalEntry` e linhas com `source`/`sourceId`;
- preservar auditoria e transacao.

Bloqueios ou decisoes pendentes:

- coordenar nomes de `JournalEntry`, `JournalEntryLine`, `source` e helpers com `BK-MF1-09`;
- confirmar contas SNC pedagogicas antes do PR.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-05` - Consultar titulos em aberto e antiguidade de saldos

Owner: `Oleksii`

Apoio: `Pedro`

Prioridade: `P1`

Branch: `feat/bk-mf1-05-titulos-aberto-oleksii`

Dependencias:

- `BK-MF0-03`;
- `BK-MF1-02`;
- `BK-MF1-03`.

Scope:

- consulta de documentos nao liquidados;
- calculo de saldo em aberto;
- buckets de antiguidade;
- filtro por data de referencia.

Fora de scope:

- cobrancas automaticas;
- previsao de tesouraria detalhada.

Smoke:

- `GET /api/sales/open-items` devolve documentos emitidos com saldo por receber;
- filtro por data de referencia recalcula dias de atraso;
- UI mostra loading, empty, erro e tabela de resultados.

Negativos:

- pedido sem sessao devolve `401`;
- documento liquidado nao aparece;
- `CREDIT_NOTE` nao aparece como titulo em aberto;
- documentos de outra empresa nunca aparecem.

Validacao tecnica:

- consulta e leitura pura, sem alterar dados;
- buckets previstos: `NOT_DUE`, `DAYS_1_30`, `DAYS_31_60`, `DAYS_61_90`, `DAYS_90_PLUS`;
- saldos usam `SaleDocument.totalCents` e `amountPaidCents`.

Bloqueios ou decisoes pendentes:

- confirmar nomes reais dos campos de saldo criados nos BKs anteriores;
- confirmar formato final da data de referencia.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-06` - Submeter documentos de venda para aprovacao

Owner: `Andre`

Apoio: `Oleksii`

Prioridade: `P1`

Branch: `feat/bk-mf1-06-aprovacao-vendas-andre`

Dependencias:

- `BK-MF0-03`;
- `BK-MF1-02`.

Scope:

- estados de aprovacao para vendas;
- submissao por operacional;
- aprovacao e rejeicao por gestor/administrador;
- motivo obrigatorio na rejeicao.

Fora de scope:

- historico detalhado de decisoes;
- notificacoes.

Smoke:

- operacional submete documento de venda para aprovacao;
- gestor/administrador aprova documento submetido;
- rejeicao exige motivo;
- emissao definitiva passa a aceitar apenas documento aprovado, conforme guia.

Negativos:

- aprovar documento que nao esta submetido devolve erro de transicao;
- rejeitar sem motivo devolve `400`;
- mesmo utilizador tenta aprovar documento que submeteu, se a segregacao estiver ativa no service, e fica bloqueado;
- recurso de outra empresa devolve `404` ou `403`.

Validacao tecnica:

- fluxo `DRAFT -> SUBMITTED -> APPROVED/REJECTED`;
- auditoria de submissao, aprovacao e rejeicao;
- nao criar historico detalhado alem do previsto para este BK.

Bloqueios ou decisoes pendentes:

- coordenar com `BK-MF1-02` para nao duplicar logica divergente de emissao;
- confirmar roles autorizadas conforme contrato da `MF0`.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-07` - Registar Fatura de Fornecedor e Nota de Credito

Owner: `Oleksii`

Apoio: `Andre`

Prioridade: `P0`

Branch: `feat/bk-mf1-07-documentos-compra-oleksii`

Dependencias:

- `BK-MF0-03`;
- `BK-MF0-08`;
- `BK-MF0-10`;
- `BK-MF0-11`;
- `BK-MF1-01`.

Scope:

- fatura de fornecedor e nota de credito;
- validacao de fornecedor, artigos e IVA;
- numero do fornecedor unico por fornecedor e empresa;
- estado inicial `APPROVED` para permitir pagamentos e contabilizacao antes do workflow formal de `BK-MF1-10`;
- notas de credito guardadas com valores positivos e interpretadas pelo tipo documental.

Fora de scope:

- pagamento;
- contabilizacao.

Smoke:

- `POST /api/purchases/documents` regista fatura de fornecedor;
- nota de credito de fornecedor fica guardada com valores positivos e tipo documental proprio;
- totais sao calculados no backend;
- numero do fornecedor e unico por fornecedor e empresa.

Negativos:

- fornecedor, artigo ou taxa de IVA de outra empresa devolve `404` ou `403`;
- numero de fornecedor duplicado para o mesmo fornecedor/empresa devolve `409`;
- data fora de periodo fiscal aberto fica bloqueada;
- documento sem linhas validas devolve `400`.

Validacao tecnica:

- estado inicial `APPROVED` e temporario ate `BK-MF1-10`;
- compras ficam filtradas por `companyId`;
- pagamento e contabilizacao ficam fora deste BK.

Bloqueios ou decisoes pendentes:

- coordenar com `BK-MF1-10`, que vai alterar o fluxo de aprovacao de compras;
- confirmar reutilizacao de `VatRate`, `Supplier` e `Item`.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-08` - Registar pagamentos

Owner: `Pedro`

Apoio: `Andre`

Prioridade: `P0`

Branch: `feat/bk-mf1-08-pagamentos-pedro`

Dependencias:

- `BK-MF0-03`;
- `BK-MF0-08`;
- `BK-MF1-07`.

Scope:

- pagamentos parciais e totais;
- metodo, data e referencia;
- bloqueio por periodo fiscal fechado;
- atualizacao transacional do documento de compra.

Fora de scope:

- reconciliacao bancaria;
- gestao avancada de bancos e caixa.

Smoke:

- `POST /api/purchases/documents/:id/payments` regista pagamento parcial;
- pagamento total atualiza saldo pago e fecha a compra quando aplicavel;
- metodo, data e referencia ficam registados.

Negativos:

- pagar valor superior ao saldo em aberto devolve erro controlado;
- pagar nota de credito de fornecedor fica bloqueado;
- data em periodo fiscal fechado fica bloqueada;
- documento de outra empresa devolve `404` ou `403`.

Validacao tecnica:

- `Payment` fica ligado ao documento de compra;
- atualizacao de saldo e movimento de pagamento sao transacionais;
- diario contabilistico continua no `BK-MF1-09`.

Bloqueios ou decisoes pendentes:

- confirmar campos finais do documento de compra criado no `BK-MF1-07`;
- confirmar politica de bloqueio para notas de credito de fornecedor.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-09` - Gerar lancamentos contabilisticos automaticos de compras

Owner: `Oleksii`

Apoio: `Andre`

Prioridade: `P0`

Branch: `feat/bk-mf1-09-lancamentos-compras-oleksii`

Dependencias:

- `BK-MF0-03`;
- `BK-MF0-08`;
- `BK-MF1-04`;
- `BK-MF1-07`.

Scope:

- diario automatico de compra;
- debitos de gasto e IVA dedutivel;
- credito de fornecedor;
- idempotencia por documento.

Fora de scope:

- lancamentos manuais;
- mapa de IVA.

Smoke:

- `POST /api/accounting/purchase-postings/:purchaseDocumentId` contabiliza compra registada/aprovada;
- diario fica equilibrado entre gasto, IVA dedutivel e fornecedor;
- nota de credito inverte o efeito contabilistico conforme tipo documental.

Negativos:

- contabilizar compra inexistente ou de outra empresa devolve `404` ou `403`;
- periodo fiscal fechado fica bloqueado;
- contabilizar duas vezes o mesmo documento e idempotente;
- documento em estado invalido devolve erro controlado.

Validacao tecnica:

- reutilizar ou alinhar `JournalEntry`, `JournalEntryLine`, `source` e helpers do `BK-MF1-04`;
- expor helper transacional para `BK-MF1-10`;
- preservar auditoria.

Bloqueios ou decisoes pendentes:

- confirmar nomes finais dos modelos e helpers criados no `BK-MF1-04`;
- confirmar tratamento contabilistico da nota de credito antes do PR.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

### `BK-MF1-10` - Aprovacao de compras

Owner: `Andre`

Apoio: `Oleksii`

Prioridade: `P1`

Branch: `feat/bk-mf1-10-aprovacao-compras-andre`

Dependencias:

- `BK-MF0-03`;
- `BK-MF0-08`;
- `BK-MF1-07`;
- `BK-MF1-09`.

Scope:

- estado rascunho, aprovado e lancado;
- aprovacao por gestor/administrador;
- marcacao de lancado por contabilista/administrador;
- bloqueio de transicoes invalidas.

Fora de scope:

- historico detalhado de aprovacoes;
- notificacoes.

Smoke:

- novas compras passam a nascer `DRAFT`, conforme ajuste indicado no guia;
- `POST /api/purchases/documents/:id/approve` muda compra para `APPROVED`;
- `POST /api/purchases/documents/:id/post-state` contabiliza e muda compra para `POSTED`;
- transicao para lancado cria ou reutiliza diario de compra sem duplicar.

Negativos:

- aprovar compra que nao esta em `DRAFT` devolve erro de transicao;
- lancar compra que nao esta `APPROVED` devolve erro de transicao;
- utilizador sem role adequada tenta aprovar ou lancar e recebe `403`;
- recurso de outra empresa devolve `404` ou `403`.

Validacao tecnica:

- fluxo `DRAFT -> APPROVED -> POSTED`;
- `markPurchaseDocumentPosted` reutiliza `postPurchaseDocumentInTransaction`;
- diario, estado e auditoria ficam na mesma transacao;
- historico detalhado fica para `BK-MF2-01`.

Bloqueios ou decisoes pendentes:

- confirmar contrato final de `BK-MF1-07` antes de alterar estado inicial das compras;
- confirmar helper transacional final do `BK-MF1-09`.

Critério de conclusão:

- implementacao concluida;
- testes minimos concluidos;
- negativos validados;
- evidence preenchida;
- PR criado;
- sem drift documental.

---

## 12) Evidence obrigatoria

Cada BK deve preencher:

- `pr`;
- `proof`;
- `neg`;
- `files`;
- `commands`;
- `screenshots`, quando houver UI;
- `notes`.

Minimo por prioridade:

- `P0`: testes unitarios/contratos + smoke + minimo `3` negativos;
- `P1`: testes unitarios/contratos relevantes + smoke + minimo `2` negativos;
- `P2`: teste focal + minimo `1` negativo, se existir.

Comandos esperados no projeto atual:

```bash
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run syntax:check
npm --prefix apps/api run prisma:validate
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
bash scripts/validate-planificacao.sh
```

Nota: no snapshot atual, `apps/web` nao declara script de E2E nem lint dedicado. Quando houver UI, validar tambem por browser/screenshot e registar essa evidence.

Evidence nunca pode conter:

- passwords reais;
- tokens;
- cookies reais;
- URIs privadas;
- API keys;
- prompts internos sensiveis;
- dados pessoais de alunos;
- documentos escolares reais nao sanitizados;
- screenshots com dados reais sensiveis.

---

## 13) Template de evidence por BK

````md
## Evidence - BK-MF1-XX <titulo>

### PR

- URL: <PR_URL>
- Branch: feat/bk-mf1-XX-descricao-owner
- Base: main

### Proof

- <prova funcional 1>
- <prova funcional 2>
- <prova funcional 3>

### Negativos

- <cenario negativo 1>
- <cenario negativo 2>
- <cenario negativo 3, se P0>

### Ficheiros alterados

- <file_1>
- <file_2>
- <file_3>

### Comandos executados

```bash
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run syntax:check
npm --prefix apps/api run prisma:validate
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
bash scripts/validate-planificacao.sh
```

### Screenshots

- <screenshot_1, se houver UI>
- <screenshot_2, se houver UI>

### Notas

- <nota, assuncao ou desvio aprovado>
````

---

## 14) Template de PR

```md
## Objetivo

Implementa `BK-MF1-XX - <titulo>` no ambito de `MF1 - Nucleo funcional I`.

## Alteracoes

- <alteracao 1>
- <alteracao 2>
- <alteracao 3>

## Validacao

- [ ] Smoke test concluido
- [ ] Testes negativos concluidos
- [ ] Testes unitarios/contratos executados
- [ ] Syntax/type/build checks executados quando aplicavel
- [ ] Evidence preenchida
- [ ] Sem segredos ou dados sensiveis no commit
- [ ] Sem drift documental

## Evidence

- `pr`: <PR_URL>
- `proof`: <resumo>
- `neg`: <resumo>
- `files`: <resumo>
- `commands`: <resumo>
- `screenshots`: <resumo ou N/A>
- `notes`: <resumo ou N/A>

## Dependencias e notas

- Dependencias confirmadas: <lista>
- Bloqueios: <bloqueios ou N/A>
- Fora de scope: <itens confirmados>
```

---

## 15) Ordem de PRs e conflitos

Ordem oficial da `MF1`:

1. `BK-MF1-01`
2. `BK-MF1-02`
3. `BK-MF1-03`
4. `BK-MF1-04`
5. `BK-MF1-05`
6. `BK-MF1-06`
7. `BK-MF1-07`
8. `BK-MF1-08`
9. `BK-MF1-09`
10. `BK-MF1-10`

Regras praticas:

- abrir cada PR apenas depois de os PRs das dependencias estarem merged;
- atualizar a branch antes de pedir revisao quando uma dependencia foi merged entretanto;
- evitar PRs concorrentes a tocar em `apps/api/prisma/schema.prisma` ou `apps/api/src/server.js`;
- nao copiar blocos acumulados de schema, routes ou server de guias que ainda nao sejam dependencias do BK em implementacao;
- quando houver conflito, preservar o contrato funcional ja merged e adaptar apenas o necessario ao BK atual.

Pares que exigem coordenacao:

| Par | Motivo | Coordenacao exigida |
| --- | --- | --- |
| `MF1-02/MF1-06` | Ambos mexem no ciclo de vida de documentos de venda e emissao definitiva. | `MF1-06` deve partir do contrato final de `MF1-02` e nao duplicar logica divergente de emissao. |
| `MF1-04/MF1-09` | Ambos criam contabilizacao automatica e podem tocar em modelos/servicos de lancamentos. | Confirmar nomes de `JournalEntry`, `JournalEntryLine`, `source` e helpers transacionais antes do segundo PR. |
| `MF1-07/MF1-10` | `MF1-10` altera o fluxo de criacao/aprovacao de compras criado por `MF1-07`. | `MF1-10` deve ser implementado depois do merge de `MF1-07` e preservar validacoes de compra ja entregues. |

---

## 16) Handoff para MF2

A `MF1` termina quando:

- todos os BKs `BK-MF1-01..BK-MF1-10` tenham smoke, negativos e evidence;
- vendas conseguem criar, emitir, aprovar, receber, consultar saldos e contabilizar;
- compras conseguem criar, pagar, contabilizar, aprovar e marcar como lancadas;
- `VatRate`, documentos, recebimentos, pagamentos e lancamentos estao filtrados por `companyId`;
- lancamentos automaticos estao equilibrados e idempotentes;
- periodos fiscais fechados bloqueiam operacoes financeiras/contabilisticas quando o guia exige;
- nao ha drift entre matriz, backlog, contrato de campos, MF views, plano de sprints e guias;
- `bash scripts/validate-planificacao.sh` passa.

Primeiro contrato critico para a `MF2`:

- `BK-MF2-01` - Historico e justificacoes para aprovacoes/reprovacoes.

---

## 17) Se bloquearem mais de 45 minutos

Mandar-me:

1. 2-3 frases sobre o problema.
2. Erro/log relevante sem dados sensiveis.
3. O que ja tentaram.
4. Path + heading do SSOT que esta a causar duvida.
5. Indicacao do BK, branch e ficheiros afetados.

Se o bloqueio envolver regras fiscais, periodos fiscais, numeracao sequencial, contas SNC, transicoes de estado, isolamento multiempresa ou autorizacao por role, nao inventar a decisao no PR. Marcar como `TODO/BLOCKER` e pedir validacao.

---

## 18) Checklist final antes de enviar ao grupo

- [x] PAP correta.
- [x] MF correta.
- [x] Branches preenchidas no topo.
- [x] Owners e apoios confirmados.
- [x] Dependencias confirmadas.
- [x] RF/RNF relevantes confirmados.
- [x] Scope e fora de scope claros.
- [x] Guia VS Code incluido.
- [x] Guia Codespaces incluido.
- [x] Validacao por BK incluida.
- [x] Evidence obrigatoria incluida.
- [x] Template de PR incluido.
- [x] Sem requisitos, endpoints ou campos inventados fora dos guias.
- [x] Sem confirmacoes pendentes.
