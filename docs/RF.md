# Requisitos Funcionais - Aplicação **OPSA**

## Índice

1. [1 Identidade, Acesso e Perfis](#1-identidade-acesso-e-perfis)
2. [2 Configuração da Empresa](#2-configurao-da-empresa)
3. [3 Tabelas-base](#3-tabelas-base)
4. [4 Vendas (Faturação)](#4-vendas-faturao)
5. [5 Compras](#5-compras)
6. [6 Inventário e Centros Analíticos](#6-inventrio-e-centros-analticos)
7. [7 Contabilidade Geral](#7-contabilidade-geral)
8. [8 Tesouraria e Bancos](#8-tesouraria-e-bancos)
9. [9 Documentos, Importações e Integrações](#9-documentos-importaes-e-integraes)
10. [10 Relatórios e Dashboards](#10-relatrios-e-dashboards)
11. [11 Assistente de IA (Análise e Estratégia)](#11-assistente-de-ia-anlise-e-estratgia)
12. [12 Lembretes e Tarefas](#12-lembretes-e-tarefas)
13. [13 Auditoria e Segurança Operacional](#13-auditoria-e-segurana-operacional)
14. [14 Subscrições Simuladas](#14-subscries-simuladas)
15. [Critérios de Aceitação](#critérios-de-aceitação)
16. [Sugestão de MVP por fases](#sugestão-de-mvp-por-fases)
17. [Licença](#licença)
18. [Changelog](#changelog)

- [Voltar ao início](../README.md)

---

## Requisitos Funcionais

### 1 Identidade, Acesso e Perfis

| Código | Requisito                                                                                    | Atores        | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------------------------- | :------------ | :--------- | :----------- |
| RF01   | Registo, login e logout com cookies HttpOnly.                                                | Todos         | Must       | -            |
| RF02   | Papéis e permissões (**Admin**, **Gestor**, **Contabilista**, **Operacional**, **Auditor**). | Admin         | Must       | RF01         |
| RF03   | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).                 | Admin, Gestor | Must       | RF02         |
| RF04   | Gestão de utilizadores: convite, remoção e definição de papéis.                              | Admin, Gestor | Must       | RF03         |
| RF05   | Recuperação de password via email.                                                           | Todos         | Must       | -            |

---

### 2 Configuração da Empresa

| Código | Requisito                                                                 | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------ | :------------------- | :--------- | :----------- |
| RF06   | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). | Gestor, Contabilista | Must       | -            |
| RF07   | Criar/importar plano de contas (SNC).                                     | Contabilista         | Must       | -            |
| RF08   | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho.       | Contabilista, Gestor | Must       | RF07         |

---

### 3 Tabelas-base

| Código | Requisito                                                                                          | Atores                    | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------------------------------- | :------------------------ | :--------- | :----------- |
| RF09   | Criar e gerir **clientes**.                                                                        | Operacional, Gestor       | Must       | -            |
| RF10   | Criar e gerir **fornecedores**.                                                                    | Operacional, Contabilista | Must       | -            |
| RF11   | Criar **artigos/serviços** (SKU, custo, preço, IVA).                                               | Operacional               | Must       | -            |
| RF12   | Criar armazéns e localizações com modelo operacional simples (sem segmentação analítica avançada). | Operacional               | Should     | -            |
| RF13   | Configurar **tabelas de IVA** (taxas, isenções, códigos).                                          | Contabilista              | Must       | -            |

---

### 4 Vendas (Faturação)

| Código | Requisito                                                                                     | Atores              | Prioridade | Dependências     |
| :----- | :-------------------------------------------------------------------------------------------- | :------------------ | :--------- | :--------------- |
| RF14   | Emitir **Fatura, Fatura-Recibo, Nota de Crédito**, com numeração sequencial.                  | Operacional         | Must       | RF09, RF11, RF13 |
| RF15   | Registar **recebimentos** (parciais/totais).                                                  | Operacional         | Must       | -                |
| RF16   | Gerar **lançamentos contabilísticos automáticos** por venda.                                  | Contabilista        | Must       | RF14             |
| RF17   | Consultar **títulos em aberto** e antiguidade de saldos.                                      | Gestor, Operacional | Should     | -                |
| RF18   | Submeter documentos de venda para aprovação com fluxo simples (submetido/aprovado/rejeitado). | Operacional         | Should     | RF14             |

---

### 5 Compras

| Código | Requisito                                                                          | Atores       | Prioridade | Dependências     |
| :----- | :--------------------------------------------------------------------------------- | :----------- | :--------- | :--------------- |
| RF19   | Registar **Fatura de Fornecedor** e **Nota de Crédito**.                           | Operacional  | Must       | RF10, RF11, RF13 |
| RF20   | Registar **pagamentos** (parciais/totais).                                         | Operacional  | Must       | RF19             |
| RF21   | Gerar **lançamentos contabilísticos automáticos** de compras.                      | Contabilista | Must       | RF19             |
| RF22   | Aprovação de compras com estados base “Rascunho → Aprovado → Lançado”.             | Gestor       | Should     | -                |
| RF23   | Registar histórico e justificações mínimas para aprovações/reprovações de compras. | Sistema      | Should     | RF22             |

---

### 6 Inventário e Centros Analíticos

| Código | Requisito                                                          | Atores              | Prioridade | Dependências |
| :----- | :----------------------------------------------------------------- | :------------------ | :--------- | :----------- |
| RF24   | Movimentos de stock: entradas, saídas, transferências, devoluções. | Operacional         | Must       | RF11, RF12   |
| RF25   | Cálculo de custo (FIFO).                                           | Contabilista        | Must       | RF24         |
| RF26   | Contagem física e ajustes.                                         | Operacional         | Should     | RF24         |
| RF27   | Alertas de stock (mínimos, máximos, artigos parados).              | Gestor, Operacional | Should     | RF24         |

---

### 7 Contabilidade Geral

| Código | Requisito                                               | Atores                        | Prioridade | Dependências |
| :----- | :------------------------------------------------------ | :---------------------------- | :--------- | :----------- |
| RF28   | Criar e editar **lançamentos manuais** (com anexos).    | Contabilista                  | Must       | RF07         |
| RF29   | Consultar **balancete e razão** exportável (PDF/Excel). | Contabilista, Auditor, Gestor | Must       | RF28         |
| RF30   | Gerar **Demonstração de Resultados e Balanço**.         | Contabilista, Gestor          | Must       | RF29         |
| RF31   | Gerar **Mapas de IVA** (liquidado/dedutível).           | Contabilista                  | Must       | RF16, RF21   |

---

### 8 Tesouraria e Bancos

| Código | Requisito                                                                   | Atores                    | Prioridade | Dependências     |
| :----- | :-------------------------------------------------------------------------- | :------------------------ | :--------- | :--------------- |
| RF32   | Criar **contas bancárias/caixa** e respetivos saldos.                       | Contabilista, Operacional | Must       | -                |
| RF33   | Importar **extratos bancários** (CSV/OFX) e fazer reconciliação automática. | Operacional, Contabilista | Must       | RF32, RF14, RF19 |
| RF34   | Gerar **previsão de tesouraria** (entradas e saídas futuras).               | Gestor                    | Should     | RF15, RF20       |

---

### 9 Documentos, Importações e Integrações

| Código | Requisito                                                         | Atores                | Prioridade | Dependências |
| :----- | :---------------------------------------------------------------- | :-------------------- | :--------- | :----------- |
| RF35   | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. | Admin, Contabilista   | Should     | -            |
| RF36   | Exportar **SAF-T (PT)** de faturação e contabilidade.             | Contabilista, Auditor | Must       | -            |

---

### 10 Relatórios e Dashboards

| Código | Requisito                                            | Atores              | Prioridade | Dependências     |
| :----- | :--------------------------------------------------- | :------------------ | :--------- | :--------------- |
| RF37   | Relatórios de vendas, compras, margens e stock.      | Gestor, Operacional | Must       | RF14, RF19, RF24 |
| RF38   | KPIs executivos (receita, custos, EBITDA, PMR, PMP). | Gestor              | Should     | RF37             |

---

### 11 Assistente de IA (Análise e Estratégia)

| Código | Requisito                                                                       | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------------ | :------------------- | :--------- | :----------- |
| RF39   | Gerar **insights automáticos** versionados, explicáveis e atualizáveis manualmente ou por worker. | Admin, Gestor, Contabilista | Must | RF37 |
| RF40   | Sugerir **ações** de apoio à decisão, com estado e feedback, sem as executar automaticamente. | Admin, Gestor | Should | RF39 |
| RF41   | Disponibilizar um **chat contextual em linguagem natural**, persistente e apagável, limitado a dados autorizados da empresa e com fontes. | Admin, Gestor, Contabilista | Should | RF37 |
| RF42   | Emitir **alertas inteligentes** com score, severidade e lifecycle (cashflow, desvios, ruturas). | Admin, Gestor | Should | RF34, RF27 |
| RF43   | Mostrar **explicações, fórmulas, período, qualidade, limitações e fontes** dos resultados de IA. | Admin, Gestor, Contabilista | Must | RF39 |

Contrato atual da IA v2:

- PostgreSQL e o catálogo de métricas OPSA são a fonte de verdade; totais não dependem da paginação.
- O chat classifica e executa uma tool read-only no backend. A OpenAI opcional recebe apenas sinais qualitativos e não recebe pergunta, histórico, IDs ou valores; o backend compõe todos os factos.
- A chamada externa exige configuração global, opt-in da empresa por `ADMIN` e consentimento individual válido.
- O chat existe em `/ai/chat` e num drawer transversal; `/ai/questions` é apenas compatibilidade depreciada.
- Insights e alertas são recalculados por `AiAnalysisRun`, tanto manualmente como por worker periódico.
- A arquitetura, APIs, privacidade e limites estão documentados em `docs/ARQUITETURA-IA-OPSA-V2.md`.

---

### 12 Lembretes e Tarefas

| Código | Requisito                                                   | Atores                            | Prioridade | Dependências |
| :----- | :---------------------------------------------------------- | :-------------------------------- | :--------- | :----------- |
| RF44   | Criar/editar lembretes (prazos, pagamentos, impostos).      | Todos                             | Should     | -            |
| RF45   | Criar e atribuir tarefas com estado e prazo.                | Gestor, Contabilista, Operacional | Should     | -            |
| RF46   | Notificações (in-app/email) para lembretes e alertas da IA. | Todos                             | Should     | RF44, RF42   |

---

### 13 Auditoria e Segurança Operacional

| Código | Requisito                                                            | Atores         | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------- | :------------- | :--------- | :----------- |
| RF47   | Registar **auditoria**: quem, quando, o quê, em operações sensíveis. | Admin, Auditor | Must       | -            |
| RF48   | Registar **logs de integração** (uploads, SAF-T, reconciliações).    | Admin          | Must       | -            |

---

### 14 Subscrições Simuladas

| Código | Requisito                                                                 | Atores        | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------ | :------------ | :--------- | :----------- |
| RF49   | Consultar os três planos de subscrição simulados: mensal, trimestral e anual. | Admin, Gestor | Must       | -            |
| RF50   | Gerir a subscrição simulada da empresa ativa.                             | Admin, Gestor | Must       | RF49         |
| RF51   | Simular renovação, cancelamento e reativação da subscrição.               | Admin, Gestor | Must       | RF50         |

---

## Critérios de Aceitação

- O núcleo transacional (vendas, compras, inventário, contabilidade e tesouraria) deve executar sem erros bloqueantes.
- A reconciliação bancária e os relatórios executivos devem produzir resultados auditáveis com evidência funcional.
- A camada de IA deve gerar insights/sugestões com explicação e fonte, sem alterar dados contabilísticos automaticamente.
- Fluxos de aprovação mantidos no escopo mínimo (vendas e compras) com histórico de decisão.
- A subscrição simulada deve permitir consultar planos, ativar, renovar, cancelar e reativar sem pagamento real.

---

## Sugestão de MVP por fases

- **Fase 1 - Fundação operacional:** identidade, configuração, tabelas-base, vendas/compras e inventário essencial.
- **Fase 2 - Consolidação financeira:** contabilidade, tesouraria, relatórios, IA preditiva e operação transversal.
- **Fase 3 - Hardening técnico:** qualidade, segurança, subscrições simuladas, conformidade e fecho de entrega.

---

## Licença

Projeto académico destinado exclusivamente a fins educativos.

## Changelog

- **2026-06-30** - Adicionados RF49..RF51 para subscrições simuladas no âmbito da MF8.

- **2026-04-19** - Redução e simplificação do escopo com renumeração canónica contínua (`RF01..RF48`).
