# OPSA - ERP Financeiro Integrado

O OPSA é um ERP financeiro integrado desenvolvido para centralizar as operações essenciais de pequenas e médias empresas: faturação, compras, inventário, contabilidade SNC, tesouraria, relatórios e apoio estratégico através de IA. O sistema permite gerir todo o ciclo operacional - desde a compra até à venda, passando pela reconciliação bancária e geração automática de lançamentos - garantindo conformidade legal e eficiência administrativa.

A plataforma suporta multi-empresa e múltiplos papéis (Admin, Gestor, Contabilista, Operacional, Auditor), oferecendo ferramentas completas para gestão de documentos, planos de contas, períodos fiscais, IVA, stock, SAF-T, dashboards e automatizações. Integra ainda um assistente inteligente capaz de gerar insights financeiros, identificar riscos, sugerir ações e responder a perguntas em linguagem natural com base nos dados reais da empresa.

Projetado com foco em robustez, segurança e escalabilidade, o OPSA adota práticas modernas de desenvolvimento e uma arquitetura modular que facilita manutenção, auditoria, integração com serviços externos e evolução futura. É um projeto desenvolvido no âmbito da PAP do Curso Profissional de Informática de Gestão (2025/2026).

---

**Índice**

1. [Contexto do Projeto](#contexto-do-projeto)
2. [Visão e Objetivos](#visão-e-objetivos)
3. [Público-Alvo e Stakeholders](#público-alvo-e-stakeholders)
4. [Funcionalidades Principais](#funcionalidades-principais)
5. [Requisitos Não Funcionais Essenciais](#requisitos-não-funcionais-essenciais)
6. [Stack e Arquitetura Recomendada](#stack-e-arquitetura-recomendada)
7. [Roadmap para o MVP (inclui todos os RF)](#roadmap-para-o-mvp-inclui-todos-os-rf)
8. [Identificação e Créditos](#identificação-e-créditos)
9. [Licença](#licença)
10. [Changelog](#changelog)

---

## Contexto do Projeto

-   Necessidade das PME em consolidar operações operacionais e financeiras num sistema moderno e colaborativo.
-   Adota boas práticas legais portuguesas (SNC, SAF-T, IVA, retenções) e integra recomendações de IA.
-   Foco em multi-empresa, multi-papel e governação auditável para contabilidade e gestão.

---

## Visão e Objetivos

1. Simplificar o ciclo completo compra → stock → venda → contabilidade de forma integrada.
2. Garantir conformidade legal (SAF-T, IVA, relatórios obrigatórios) com mínimo esforço manual.
3. Proporcionar dashboards e insights inteligentes para decisões rápidas.
4. Oferecer um produto modular e escalável, apto para evoluções futuras.

---

## Público-Alvo e Stakeholders

-   **Gestores e administradores** – visão global de resultados e operações.
-   **Contabilistas internos/externos** – controlo do plano de contas e lançamentos.
-   **Operacionais comerciais/logística** – faturação, compras e inventário diário.
-   **Tesouraria/financeiros** – reconciliação bancária, pagamentos e forecasting.
-   **Auditores** – acesso seguro a registos e logs.
-   **Equipa técnica** – manutenção de integrações, IA e segurança.

---

## Funcionalidades Principais

### Identidade, Acesso e Configuração

-   Registo/login seguro, recuperação de password, convites multi-empresa e papéis (Admin, Gestor, Contabilista, Operacional, Auditor) (RF01–RF05).
-   Configuração de empresas: dados legais, planos de contas SNC, períodos fiscais e bloqueios de fecho (RF06–RF08).

### Tabelas-Base e Inventário

-   Gestão de clientes, fornecedores, artigos/serviços, armazéns/localizações e regras de IVA (RF09–RF13).
-   Controlos de stock, movimentos automáticos, ajustes e contagem física com impactos contabilísticos (RF22–RF25).

### Vendas e Compras

-   Emissão de faturas, notas de crédito, recibos, numeração sequencial e impostos automáticos (RF14–RF21).
-   Registo de encomendas de compra, receção, devoluções e ligação ao stock (RF18–RF25).
-   Fluxos de aprovação e anexação de documentos de suporte.

### Contabilidade Geral

-   Lançamentos automáticos por documento, diários manuais, centros de custo e reabertura de períodos com justificação (RF26–RF35, RF50).
-   Balancetes, razão, demonstrações financeiras e exportação SAF-T (RF37–RF39, RF48–RF49).

### Tesouraria e Bancos

-   Gestão de contas bancárias, reconciliação automática com importação de extratos, previsão de cashflow e alertas (RF30–RF33, RF43–RF44).
-   Agendamentos de pagamentos/recebimentos, controlo de linhas de crédito e relatórios de tesouraria.

### Documentos, Integrações e Auditoria

-   Importação/exportação CSV/Excel, logs de integrações (SAF-T, bancos, inventário), anexos e controlo de versões (RF31–RF35, RF48–RF49).
-   Auditoria completa por operação sensível, histórico de alterações e permissões traçadas.

### Relatórios, Dashboards e IA

-   Dashboards de vendas, compras, margens, stock, KPIs executivos (receita, EBITDA, PMR, PMP) (RF37–RF39).
-   Assistente de IA com insights automáticos, perguntas em linguagem natural, ações sugeridas e alertas inteligentes (RF40–RF44).
-   Lembretes, tarefas atribuídas, notificações multicanal e acompanhamento de deadlines (RF45–RF47).

> Detalhes completos encontram-se em [`docs/RF.md`](docs/RF.md#índice).

---

## Requisitos Não Funcionais Essenciais

-   **Usabilidade/Acessibilidade** – UI consistente entre módulos, formulários com validação preventiva, feedback imediato e suporte responsive (RNF01–RNF06).
-   **Performance** – Dashboards/listagens ≤2s, emissão de documentos ≤1s, reconciliação ≤3s, custo de stock incremental (RNF07–RNF12).
-   **Segurança & Compliance** – HTTPS, bcrypt, cookies seguros, mitigação de ataques, retenção legal de 10 anos e auditoria obrigatória (RNF13–RNF20).
-   **Compatibilidade/Integração** – Browsers modernos, exportações PDF/Excel/CSV, importações com logs e API estável (RNF21–RNF26).
-   **Manutenção/Operação** – Arquitetura modular, componentes reutilizáveis, testes em módulos críticos, logs estruturados, health-check, rollback e documentação (RNF27–RNF33).
-   **IA & Ética** – Explicações de insights, IA não altera dados contabilísticos e evita enviesamentos (RNF34–RNF37).
-   **Localização** – Português-PT, formatos europeus e preparação para i18n (RNF38–RNF40).

> Detalhes completos encontram-se em [`docs/RNF.md`](docs/RNF.md#índice).

---

## Stack e Arquitetura Recomendada

```
frontend/   # React + Vite, TypeScript, Tailwind, bibliotecas de componentes
backend/    # Node.js (Express/NestJS modular), Prisma ORM, serviços por domínio
docs/       # RF, RNF, modelos de dados, integrações e fluxos
scripts/    # Automatizações, migrações, geração de SAF-T e utilitários
```

-   **Base de dados:** PostgreSQL (dados transacionais) + Redis (cache/sessões).
-   **IA:** Serviço interno em Node ou FastAPI para análise financeira e previsões.
-   **Integrações:** Gateways de email, bancos (extratos), geração de ficheiros legais.
-   **DevOps:** Railway/Render/Fly.io, GitHub Actions, backups automáticos, observabilidade centralizada.

---

## Roadmap para o MVP (inclui todos os RF)

1. **Fase 1 - Núcleo Operacional:** identidade, multi-empresa, tabelas-base, planos SNC e inventário.
2. **Fase 2 - Operações Comerciais:** vendas, compras, movimentos de stock, lançamentos automáticos e relatórios legais.
3. **Fase 3 - Tesouraria e IA:** reconciliação bancária, dashboards, KPIs, assistente inteligente, lembretes e tarefas.
4. **Fase 4 - Auditoria e Integrações:** logs avançados, SAF-T completo, exportações, automações e otimizações de performance.

---

## Identificação e Créditos

> **Projeto:** OPSA - Plataforma de Gestão e Contabilidade  
> **Tipo:** PAP - Curso Profissional de Informática de Gestão  
> **Áreas:** Programação · Gestão · Base de Dados  
> **Ano letivo:** 2025/2026  
> **Versão:** 1.0  
> **Equipa:** [Oleksii, Pedro, Sofia, André]  
> **Professor Orientador:** Nuno Castro e Cláudia Marques

---

## Licença

Projeto académico. Uso exclusivo para fins educativos no âmbito da PAP.

---

## Changelog

-   **2024-04-27** – README alinhado à nova estrutura com funcionalidades detalhadas, requisitos e roadmap.
