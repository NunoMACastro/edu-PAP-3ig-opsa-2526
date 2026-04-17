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

## 9. Créditos, Licença e Changelog
### Créditos
- Projeto: OPSA
- Tipo: PAP - Curso Profissional de Informática de Gestão
- Ano letivo: 2025/2026
- Equipa: Oleksii, Pedro, Sofia, André
- Orientador: Nuno Castro e Cláudia Marques

### Licença
Projeto académico para fins educativos.

### Changelog
- 2026-04-17: README reescrito integralmente com estrutura canónica e reforço do núcleo IA preditiva + separação clara entre recomendação e execução.
