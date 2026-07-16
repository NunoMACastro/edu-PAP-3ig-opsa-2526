# OPSA

## Metadados
- Nome da app: OPSA
- Ano letivo: 2025/2026
- Turma: 12º IG
- Nome dos alunos: Oleksii, Pedro, Sofia, André
- Orientador: Nuno Castro e Cláudia Marques

## 1. Visão Geral Extensa da Aplicação
O OPSA é um ERP financeiro integrado para PME, desenvolvido como PAP no Curso Profissional de Informática de Gestão. A aplicação cobre o ciclo operacional de compra, stock, venda, bancos e contabilidade, com foco em conformidade legal portuguesa e governação auditável. A plataforma foi modelada para equilibrar exigência técnica com exequibilidade pedagógica, permitindo uma implementação progressiva sem perder rigor funcional.

Um diferencial central do OPSA é a camada de IA preditiva aplicada à análise financeira: o sistema identifica tendências, destaca riscos e sugere ações com explicabilidade e fonte dos dados, mantendo separação estrita entre recomendação e execução contabilística.

## 2. Problema que Resolve e Proposta de Valor
PME e equipas escolares de simulação empresarial enfrentam sistemas fragmentados, baixa visibilidade financeira e processos difíceis de auditar. O OPSA resolve este problema ao concentrar num único sistema:

- operação transacional ponta-a-ponta (compras, vendas, tesouraria, stock, contabilidade);
- conformidade (SNC, IVA e SAF-T) com rastreabilidade;
- inteligência preditiva para apoio à decisão com transparência de cálculo.

A proposta de valor é entregar um ERP consistente, auditável e pedagogicamente robusto, em vez de um conjunto disperso de ferramentas.

## 3. Público-Alvo e Stakeholders
- PME e equipas administrativas/financeiras;
- gestores e contabilistas que precisam de decisão suportada por dados;
- auditores e responsáveis de conformidade;
- alunos e docentes em contexto PAP com foco em gestão e tecnologia;
- equipa técnica responsável por operação, segurança e evolução funcional.

## 4. Funcionalidades Principais por Domínio Funcional
### 4.1 Núcleo transacional ERP
- gestão de utilizadores, papéis e multiempresa;
- dados mestre (clientes, fornecedores, artigos, plano de contas);
- ciclo de vendas e compras com lançamentos contabilísticos associados;
- controlo de stock e movimentos operacionais.

### 4.2 Contabilidade, fiscalidade e reporting legal
- balancete, razão, demonstrações financeiras e mapas fiscais;
- gestão de períodos e regras de fecho/reabertura controlada;
- exportações e artefactos legais necessários ao contexto nacional.

### 4.3 Tesouraria e reconciliação
- contas bancárias/caixa e saldos;
- importação de extratos e reconciliação assistida;
- previsões de tesouraria para apoio ao planeamento.

### 4.4 IA preditiva (núcleo obrigatório)
- insights automáticos sobre tendências, desvios e riscos;
- sugestões de ação operativa/financeira;
- perguntas em linguagem natural com resposta fundamentada;
- explicabilidade e origem de dados em cada insight.

Regra funcional crítica: a IA recomenda, mas não executa alterações contabilísticas automaticamente.

### 4.5 Auditoria, controlo e governação
- logs estruturados e trilho de auditoria em operações sensíveis;
- workflows de aprovação e segregação de funções;
- monitorização operacional para estabilidade e rastreabilidade.

Fontes funcionais canónicas: [docs/RF.md](docs/RF.md), [docs/planificacao/backlogs/BACKLOG-MVP.md](docs/planificacao/backlogs/BACKLOG-MVP.md), [docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md](docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md).

## 5. Arquitetura/Stack Recomendada (Alto Nível)
- frontend modular com foco em workflows financeiros e validação de dados;
- backend por domínios (vendas, compras, inventário, bancos, contabilidade, IA);
- base de dados transacional com integridade e histórico;
- serviços de importação/exportação e processamento assíncrono;
- observabilidade, backups e health-check como padrão operacional.

## 6. Escopo MVP vs Pós-PAP
### MVP (incluído)
- núcleo ERP operacional e contabilístico essencial;
- conformidade legal base (incluindo artefactos obrigatórios);
- IA preditiva no ciclo essencial: insights, sugestão, explicação e fonte;
- auditoria e segurança mínimas para operação confiável.

### Pós-PAP (adiado)
- integrações opcionais/extras de ecossistema;
- automações financeiras avançadas não essenciais ao núcleo;
- cenários de tesouraria e crédito de elevada complexidade;
- personalizações analíticas de nível enterprise.

## 7. Requisitos Não Funcionais Críticos
- segurança forte de autenticação e sessão;
- integridade contabilística e rastreabilidade de alterações;
- conformidade legal e retenção documental;
- desempenho aceitável em operações críticas de lançamento e consulta;
- explicabilidade da camada de IA e controlo de risco operacional.

Fonte canónica RNF: [docs/RNF.md](docs/RNF.md).

## 8. Roadmap Resumido por Fases
1. fundação de identidade, dados mestre e ciclo transacional;
2. consolidação contabilística/fiscal e reporting;
3. ativação progressiva da IA preditiva com explicabilidade;
4. hardening operacional, auditoria e preparação final de entrega.

## 9. Como iniciar a aplicação localmente — passo a passo

Os comandos seguintes devem ser executados a partir da raiz do repositório.
A API está em `apps/api` e o frontend está em `apps/web`.

### Pré-requisitos

- Node.js `>=24.17 <25` e npm `>=11 <12`;
- Docker Desktop, ou Docker Engine, com Docker Compose v2;
- portas `3000`, `5173` e `5433` livres.

Se utilizares `nvm`, a versão recomendada está definida em `apps/.nvmrc`:

```bash
cd apps
nvm install
nvm use
cd ..
```

### Passo 1 — instalar as dependências

```bash
npm --prefix apps/api ci
npm --prefix apps/web ci
```

### Passo 2 — preparar a base de dados e a configuração local

```bash
npm --prefix apps/api run db:local:setup
npm --prefix apps/api run config:check
```

O primeiro comando:

- cria `apps/api/.env` a partir de `.env.example`, caso ainda não exista;
- inicia o PostgreSQL local através de Docker Compose;
- gera o Prisma Client;
- aplica as migrations;
- cria e verifica os dados de demonstração.

### Passo 3 — iniciar o servidor da API

Num primeiro terminal, a partir da raiz do repositório:

```bash
npm --prefix apps/api run dev
```

A API fica disponível em `http://127.0.0.1:3000`. Para confirmar que está a
responder:

```bash
curl -fsS http://127.0.0.1:3000/api/health/live
```

### Passo 4 — iniciar o frontend

Mantém a API em execução e abre um segundo terminal:

```bash
npm --prefix apps/web run dev
```

Abre `http://127.0.0.1:5173` no browser. O Vite encaminha automaticamente os
pedidos `/api` para o servidor em `http://127.0.0.1:3000`.

### Passo 5 — iniciar sessão na demonstração

Utiliza as credenciais locais criadas pela seed:

- email: `admin@opsa.demo`;
- password: `OpsaDemo2026!`.

Depois do login, seleciona **OPSA Demo Comercio, Lda** em **Empresas e
contexto**. Estas credenciais destinam-se apenas ao ambiente académico local.

### Passo 6 — iniciar os workers opcionais

Algumas funcionalidades assíncronas precisam de processos adicionais. Abre um
terminal por worker que pretendas demonstrar:

```bash
# Processamento de IA
npm --prefix apps/api run worker:ai

# Processamento de email simulado
npm --prefix apps/api run worker:email
```

### Parar a aplicação

Usa `Ctrl+C` nos terminais da API, do frontend e dos workers. Para parar também
o PostgreSQL sem eliminar os dados:

```bash
npm --prefix apps/api run db:local:stop
```

O guia operacional detalhado, incluindo testes, diagnóstico, backup e restore,
está disponível em [apps/README.md](apps/README.md).

## 10. Créditos, Licença e Changelog
### Créditos
- Projeto: OPSA
- Tipo: PAP - Curso Profissional de Informática de Gestão
- Ano letivo: 2025/2026
- Equipa: Oleksii, Pedro, Sofia, André
- Orientador: Nuno Castro e Cláudia Marques

### Licença
Projeto académico para fins educativos.

### Changelog
- 2026-07-16: adicionado o guia passo a passo para iniciar a API, o frontend e os workers opcionais a partir de `apps/`.
- 2026-04-17: README reescrito integralmente com estrutura canónica e reforço do núcleo IA preditiva + separação clara entre recomendação e execução.
