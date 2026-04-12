# Requisitos Funcionais - Aplicação **OPSA**

## Índice

1. [Identidade, Acesso e Perfis](#1-identidade-acesso-e-perfis)
2. [Configuração da Empresa](#2-configuração-da-empresa)
3. [Tabelas-base](#3-tabelas-base)
4. [Vendas (Faturação)](#4-vendas-faturação)
5. [Compras](#5-compras)
6. [Inventário e Centros Analíticos](#6-inventário-e-centros-analíticos)
7. [Contabilidade Geral](#7-contabilidade-geral)
8. [Tesouraria e Bancos](#8-tesouraria-e-bancos)
9. [Documentos, Importações e Integrações](#9-documentos-importações-e-integrações)
10. [Relatórios e Dashboards](#10-relatórios-e-dashboards)
11. [Assistente de IA (Análise e Estratégia)](#11-assistente-de-ia-análise-e-estratégia)
12. [Lembretes e Tarefas](#12-lembretes-e-tarefas)
13. [Auditoria e Segurança Operacional](#13-auditoria-e-segurança-operacional)
14. [Aprovações, Centros Analíticos e Tesouraria Avançada](#14-aprovações-centros-analíticos-e-tesouraria-avançada)
15. [Critérios de Aceitação](#critérios-de-aceitação)
16. [Sugestão de MVP organizado por fases e RF](#sugestão-de-mvp-organizado-por-fases-e-rf)
17. [Créditos do projeto](#créditos-do-projeto)
18. [Licença](#licença)
19. [Changelog](#changelog)

-   [Voltar ao início](../README.md)

---

## Requisitos Funcionais

### 1 Identidade, Acesso e Perfis

| Código | Requisito                                                                                    | Atores        | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------------------------- | :------------ | :--------- | :----------- |
| RF01   | Registo, login e logout com cookies HttpOnly. | Todos | Must | - |
| RF02   | Papéis e permissões (**Admin**, **Gestor**, **Contabilista**, **Operacional**, **Auditor**). | Admin | Must | RF01 |
| RF03   | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). | Admin, Gestor | Must | RF02 |
| RF04   | Gestão de utilizadores: convite, remoção e definição de papéis. | Admin, Gestor | Must | RF03 |
| RF05   | Recuperação de password via email. | Todos | Must | - |

---

### 2 Configuração da Empresa

| Código | Requisito                                                                 | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------ | :------------------- | :--------- | :----------- |
| RF06   | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). | Gestor, Contabilista | Must | - |
| RF07   | Criar/importar plano de contas (SNC). | Contabilista | Must | - |
| RF08   | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho. | Contabilista, Gestor | Must | RF07 |

---

### 3 Tabelas-base

| Código | Requisito                                                 | Atores                    | Prioridade | Dependências |
| :----- | :-------------------------------------------------------- | :------------------------ | :--------- | :----------- |
| RF09   | Criar e gerir **clientes**. | Operacional, Gestor | Must | - |
| RF10   | Criar e gerir **fornecedores**. | Operacional, Contabilista | Must | - |
| RF11   | Criar **artigos/serviços** (SKU, custo, preço, IVA). | Operacional | Must | - |
| RF12   | Criar **armazéns e localizações**. | Operacional | Should | - |
| RF13   | Configurar **tabelas de IVA** (taxas, isenções, códigos). | Contabilista | Must | - |

---

### 4 Vendas (Faturação)

| Código | Requisito                                                                    | Atores              | Prioridade | Dependências     |
| :----- | :--------------------------------------------------------------------------- | :------------------ | :--------- | :--------------- |
| RF14   | Emitir **Fatura, Fatura-Recibo, Nota de Crédito**, com numeração sequencial. | Operacional | Must | RF09, RF11, RF13 |
| RF15   | Registar **recebimentos** (parciais/totais). | Operacional | Must | - |
| RF16   | Gerar **lançamentos contabilísticos automáticos** por venda. | Contabilista | Must | RF14 |
| RF17   | Consultar **títulos em aberto** e antiguidade de saldos. | Gestor, Operacional | Should | - |
| RF18   | Submeter documentos de venda para **aprovação** antes de emissão definitiva. | Operacional | Should | RF14 |
| RF19   | Definir **fluxos e limites** de aprovação (por papel, valor, cliente). | Gestor | Could | RF18 |
| RF20   | Registar histórico de **decisões de aprovação** e comentários. | Sistema | Should | RF18 |

---

### 5 Compras

| Código | Requisito                                                               | Atores       | Prioridade | Dependências     |
| :----- | :---------------------------------------------------------------------- | :----------- | :--------- | :--------------- |
| RF21   | Registar **Fatura de Fornecedor** e **Nota de Crédito**. | Operacional | Must | RF10, RF11, RF13 |
| RF22   | Registar **pagamentos** (parciais/totais). | Operacional | Must | RF21 |
| RF23   | Gerar **lançamentos contabilísticos automáticos** de compras. | Contabilista | Must | RF21 |
| RF24   | Aprovação de compras com estados “Rascunho → Aprovado → Lançado”. | Gestor | Should | - |
| RF25   | Configurar **limites e papéis** para aprovações (por fornecedor/valor). | Gestor | Should | RF24 |
| RF26   | Histórico e justificações para aprovações/reprovações. | Sistema | Should | RF24 |

---

### 6 Inventário e Centros Analíticos

| Código | Requisito                                                          | Atores               | Prioridade | Dependências |
| :----- | :----------------------------------------------------------------- | :------------------- | :--------- | :----------- |
| RF27   | Movimentos de stock: entradas, saídas, transferências, devoluções. | Operacional | Must | RF11, RF12 |
| RF28   | Cálculo de custo (FIFO). | Contabilista | Must | RF27 |
| RF29   | Contagem física e ajustes. | Operacional | Should | RF27 |
| RF30   | Alertas de stock (mínimos, máximos, artigos parados). | Gestor, Operacional | Should | RF27 |
| RF31   | Configurar **centros de custo** / segmentos analíticos. | Contabilista | Should | RF07 |
| RF32   | Associar documentos e lançamentos a centros de custo. | Sistema | Should | RF31 |
| RF33   | Relatórios e filtros por centro de custo/segmento. | Gestor, Contabilista | Should | RF32 |

---

### 7 Contabilidade Geral

| Código | Requisito                                               | Atores                        | Prioridade | Dependências |
| :----- | :------------------------------------------------------ | :---------------------------- | :--------- | :----------- |
| RF34   | Criar e editar **lançamentos manuais** (com anexos). | Contabilista | Must | RF07 |
| RF35   | Consultar **balancete e razão** exportável (PDF/Excel). | Contabilista, Auditor, Gestor | Must | RF34 |
| RF36   | Gerar **Demonstração de Resultados e Balanço**. | Contabilista, Gestor | Must | RF35 |
| RF37   | Gerar **Mapas de IVA** (liquidado/dedutível). | Contabilista | Must | RF16, RF23 |

---

### 8 Tesouraria e Bancos

| Código | Requisito                                                                   | Atores                    | Prioridade | Dependências     |
| :----- | :-------------------------------------------------------------------------- | :------------------------ | :--------- | :--------------- |
| RF38   | Criar **contas bancárias/caixa** e respetivos saldos. | Contabilista, Operacional | Must | - |
| RF39   | Importar **extratos bancários** (CSV/OFX) e fazer reconciliação automática. | Operacional, Contabilista | Must | RF38, RF14, RF21 |
| RF40   | Gerar **previsão de tesouraria** (entradas e saídas futuras). | Gestor | Should | RF15, RF22 |

---

### 9 Documentos, Importações e Integrações

| Código | Requisito                                                         | Atores                | Prioridade | Dependências |
| :----- | :---------------------------------------------------------------- | :-------------------- | :--------- | :----------- |
| RF41   | Upload de documentos com **OCR** (ler NIF, data, total, IVA). | Operacional | Should | RF21 |
| RF42   | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. | Admin, Contabilista | Should | - |
| RF43   | Exportar **SAF-T (PT)** de faturação e contabilidade. | Contabilista, Auditor | Must | - |
| RF44   | (Opcional) Integração com **e-Fatura**. | Contabilista | Could | - |
| RF45   | Mapear documentos de integração para **centros de custo**. | Contabilista | Should | RF31 |

---

### 10 Relatórios e Dashboards

| Código | Requisito                                              | Atores              | Prioridade | Dependências     |
| :----- | :----------------------------------------------------- | :------------------ | :--------- | :--------------- |
| RF46   | Relatórios de vendas, compras, margens e stock. | Gestor, Operacional | Must | RF14, RF21, RF27 |
| RF47   | KPIs executivos (receita, custos, EBITDA, PMR, PMP). | Gestor | Should | RF46 |
| RF48   | Personalização de relatórios e exportação (PDF/Excel). | Todos | Should | RF46 |

---

### 11 Assistente de IA (Análise e Estratégia)

| Código | Requisito                                                                       | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------------ | :------------------- | :--------- | :----------- |
| RF49   | Gerar **insights automáticos** (tendências, riscos, clientes, artigos parados). | Gestor, Contabilista | Must | RF46 |
| RF50   | Sugerir **ações** (ajustar preços, negociar fornecedor, repor stock). | Gestor | Should | RF49 |
| RF51   | Permitir **perguntas em linguagem natural** e responder com dados e fonte. | Gestor, Contabilista | Should | RF46 |
| RF52   | Emitir **alertas inteligentes** (cashflow, desvios, ruturas). | Gestor | Should | RF40, RF30 |
| RF53   | Mostrar **explicações e fontes** de cada insight. | Todos | Must | RF49 |

---

### 12 Lembretes e Tarefas

| Código | Requisito                                                   | Atores                            | Prioridade | Dependências |
| :----- | :---------------------------------------------------------- | :-------------------------------- | :--------- | :----------- |
| RF54   | Criar/editar lembretes (prazos, pagamentos, impostos). | Todos | Should | - |
| RF55   | Criar e atribuir tarefas com estado e prazo. | Gestor, Contabilista, Operacional | Should | - |
| RF56   | Notificações (in-app/email) para lembretes e alertas da IA. | Todos | Should | RF54, RF52 |

---

### 13 Auditoria e Segurança Operacional

| Código | Requisito                                                            | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------- | :------------------- | :--------- | :----------- |
| RF57   | Registar **auditoria**: quem, quando, o quê, em operações sensíveis. | Admin, Auditor | Must | - |
| RF58   | Registar **logs de integração** (uploads, SAF-T, reconciliações). | Admin | Must | - |
| RF59   | Permitir **reabertura de períodos** apenas com registo de motivo. | Gestor, Contabilista | Should | RF08 |

---

### 14 Aprovações, Centros Analíticos e Tesouraria Avançada

| Código | Requisito                                                                          | Atores             | Prioridade | Dependências |
| :----- | :--------------------------------------------------------------------------------- | :----------------- | :--------- | :----------- |
| RF60   | Definir **workflows de aprovação** por documento (compra, venda, pagamento). | Gestor, Admin | Should | RF21, RF30 |
| RF61   | Configurar **níveis de aprovação** com limites financeiros e escalamentos. | Gestor | Should | RF60 |
| RF62   | Painel para monitorizar aprovações pendentes e SLA por tipo de documento. | Gestor | Should | RF60 |
| RF63   | Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria. | Tesouraria, Gestor | Should | RF39 |
| RF64   | Gerir **linhas de crédito** (limites, utilização, alertas) por banco. | Gestor, Tesouraria | Should | RF38 |

---

## Critérios de Aceitação

### IA - Insights e Recomendações (RF49-RF53)

-   Ao abrir o painel “Insights”, o sistema apresenta pelo menos **5 cartões** com métrica, variação e período.
-   Cada insight inclui **origem dos dados** e **ação sugerida**.
-   Quando o utilizador clica em “Ver detalhes”, é redirecionado para o relatório correspondente.

### Relatórios e KPIs (RF46-RF48)

-   Ao aplicar filtros (período, armazém, família), o dashboard atualiza em ≤2s.
-   Ao exportar, o ficheiro preserva filtros e título do relatório.

### Inventário (RF27-RF30)

-   Ao registar uma compra de 10 unidades, o stock aumenta automaticamente.
-   Ajustes de contagem geram movimento contabilístico, se configurado.

### Vendas/Compras (RF14-RF26)

-   Cada fatura cria lançamento contabilístico automático (Clientes/Vendas/IVA).
-   Faturas de fornecedor geram lançamentos de Compras e IVA dedutível.

### Reconciliação Bancária (RF38-RF40)

-   Importar extrato sugere correspondências automáticas por valor e data.
-   Movimentos por conciliar > X dias geram aviso no painel.

---

## Sugestão de MVP organizado por fases e RF

> **Priorizar**: funcionalidades essenciais para um produto funcional e apresentável.

-   **Fase 1 - Identidade e Configuração:** RF01–RF13.
-   **Fase 2 - Operações Comerciais:** RF14-RF33 (vendas, compras, inventário e centros analíticos).
-   **Fase 3 - Tesouraria e IA:** RF38-RF53 (bancos, relatórios, dashboards e assistente).
-   **Fase 4 - Operação Avançada:** RF41-RF45 e RF54-RF64 (tarefas, auditoria, aprovações, agendamentos, linhas de crédito e integrações).

---


## Tabela de Equivalência de Códigos RF (2026-04-12)

| Código antigo | Contexto | Código novo | Requisito |
| :-- | :-- | :-- | :-- |
| RF01 (ocorrência 1) | Identidade, Acesso e Perfis | RF01 | Registo, login e logout com cookies HttpOnly. |
| RF02 (ocorrência 1) | Identidade, Acesso e Perfis | RF02 | Papéis e permissões (**Admin**, **Gestor**, **Contabilista**, **Operacional**, **Auditor**). |
| RF03 (ocorrência 1) | Identidade, Acesso e Perfis | RF03 | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). |
| RF04 (ocorrência 1) | Identidade, Acesso e Perfis | RF04 | Gestão de utilizadores: convite, remoção e definição de papéis. |
| RF05 (ocorrência 1) | Identidade, Acesso e Perfis | RF05 | Recuperação de password via email. |
| RF06 (ocorrência 1) | Configuração da Empresa | RF06 | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). |
| RF07 (ocorrência 1) | Configuração da Empresa | RF07 | Criar/importar plano de contas (SNC). |
| RF08 (ocorrência 1) | Configuração da Empresa | RF08 | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho. |
| RF09 (ocorrência 1) | Tabelas-base | RF09 | Criar e gerir **clientes**. |
| RF10 (ocorrência 1) | Tabelas-base | RF10 | Criar e gerir **fornecedores**. |
| RF11 (ocorrência 1) | Tabelas-base | RF11 | Criar **artigos/serviços** (SKU, custo, preço, IVA). |
| RF12 (ocorrência 1) | Tabelas-base | RF12 | Criar **armazéns e localizações**. |
| RF13 (ocorrência 1) | Tabelas-base | RF13 | Configurar **tabelas de IVA** (taxas, isenções, códigos). |
| RF14 (ocorrência 1) | Vendas (Faturação) | RF14 | Emitir **Fatura, Fatura-Recibo, Nota de Crédito**, com numeração sequencial. |
| RF15 (ocorrência 1) | Vendas (Faturação) | RF15 | Registar **recebimentos** (parciais/totais). |
| RF16 (ocorrência 1) | Vendas (Faturação) | RF16 | Gerar **lançamentos contabilísticos automáticos** por venda. |
| RF17 (ocorrência 1) | Vendas (Faturação) | RF17 | Consultar **títulos em aberto** e antiguidade de saldos. |
| RF18 (ocorrência 1) | Vendas (Faturação) | RF18 | Submeter documentos de venda para **aprovação** antes de emissão definitiva. |
| RF19 (ocorrência 1) | Vendas (Faturação) | RF19 | Definir **fluxos e limites** de aprovação (por papel, valor, cliente). |
| RF20 (ocorrência 1) | Vendas (Faturação) | RF20 | Registar histórico de **decisões de aprovação** e comentários. |
| RF18 (ocorrência 2) | Compras | RF21 | Registar **Fatura de Fornecedor** e **Nota de Crédito**. |
| RF19 (ocorrência 2) | Compras | RF22 | Registar **pagamentos** (parciais/totais). |
| RF20 (ocorrência 2) | Compras | RF23 | Gerar **lançamentos contabilísticos automáticos** de compras. |
| RF21 (ocorrência 1) | Compras | RF24 | Aprovação de compras com estados “Rascunho → Aprovado → Lançado”. |
| RF22 (ocorrência 1) | Compras | RF25 | Configurar **limites e papéis** para aprovações (por fornecedor/valor). |
| RF23 (ocorrência 1) | Compras | RF26 | Histórico e justificações para aprovações/reprovações. |
| RF22 (ocorrência 2) | Inventário e Centros Analíticos | RF27 | Movimentos de stock: entradas, saídas, transferências, devoluções. |
| RF23 (ocorrência 2) | Inventário e Centros Analíticos | RF28 | Cálculo de custo (FIFO). |
| RF24 (ocorrência 1) | Inventário e Centros Analíticos | RF29 | Contagem física e ajustes. |
| RF25 (ocorrência 1) | Inventário e Centros Analíticos | RF30 | Alertas de stock (mínimos, máximos, artigos parados). |
| RF26 (ocorrência 1) | Inventário e Centros Analíticos | RF31 | Configurar **centros de custo** / segmentos analíticos. |
| RF27 (ocorrência 1) | Inventário e Centros Analíticos | RF32 | Associar documentos e lançamentos a centros de custo. |
| RF28 (ocorrência 1) | Inventário e Centros Analíticos | RF33 | Relatórios e filtros por centro de custo/segmento. |
| RF29 (ocorrência 1) | Contabilidade Geral | RF34 | Criar e editar **lançamentos manuais** (com anexos). |
| RF30 (ocorrência 1) | Contabilidade Geral | RF35 | Consultar **balancete e razão** exportável (PDF/Excel). |
| RF31 (ocorrência 1) | Contabilidade Geral | RF36 | Gerar **Demonstração de Resultados e Balanço**. |
| RF32 (ocorrência 1) | Contabilidade Geral | RF37 | Gerar **Mapas de IVA** (liquidado/dedutível). |
| RF30 (ocorrência 2) | Tesouraria e Bancos | RF38 | Criar **contas bancárias/caixa** e respetivos saldos. |
| RF31 (ocorrência 2) | Tesouraria e Bancos | RF39 | Importar **extratos bancários** (CSV/OFX) e fazer reconciliação automática. |
| RF32 (ocorrência 2) | Tesouraria e Bancos | RF40 | Gerar **previsão de tesouraria** (entradas e saídas futuras). |
| RF33 (ocorrência 1) | Documentos, Importações e Integrações | RF41 | Upload de documentos com **OCR** (ler NIF, data, total, IVA). |
| RF34 (ocorrência 1) | Documentos, Importações e Integrações | RF42 | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. |
| RF35 (ocorrência 1) | Documentos, Importações e Integrações | RF43 | Exportar **SAF-T (PT)** de faturação e contabilidade. |
| RF36 (ocorrência 1) | Documentos, Importações e Integrações | RF44 | (Opcional) Integração com **e-Fatura**. |
| RF37 (ocorrência 1) | Documentos, Importações e Integrações | RF45 | Mapear documentos de integração para **centros de custo**. |
| RF38 (ocorrência 1) | Relatórios e Dashboards | RF46 | Relatórios de vendas, compras, margens e stock. |
| RF39 (ocorrência 1) | Relatórios e Dashboards | RF47 | KPIs executivos (receita, custos, EBITDA, PMR, PMP). |
| RF40 (ocorrência 1) | Relatórios e Dashboards | RF48 | Personalização de relatórios e exportação (PDF/Excel). |
| RF41 (ocorrência 1) | Assistente de IA (Análise e Estratégia) | RF49 | Gerar **insights automáticos** (tendências, riscos, clientes, artigos parados). |
| RF42 (ocorrência 1) | Assistente de IA (Análise e Estratégia) | RF50 | Sugerir **ações** (ajustar preços, negociar fornecedor, repor stock). |
| RF43 (ocorrência 1) | Assistente de IA (Análise e Estratégia) | RF51 | Permitir **perguntas em linguagem natural** e responder com dados e fonte. |
| RF44 (ocorrência 1) | Assistente de IA (Análise e Estratégia) | RF52 | Emitir **alertas inteligentes** (cashflow, desvios, ruturas). |
| RF45 (ocorrência 1) | Assistente de IA (Análise e Estratégia) | RF53 | Mostrar **explicações e fontes** de cada insight. |
| RF46 (ocorrência 1) | Lembretes e Tarefas | RF54 | Criar/editar lembretes (prazos, pagamentos, impostos). |
| RF47 (ocorrência 1) | Lembretes e Tarefas | RF55 | Criar e atribuir tarefas com estado e prazo. |
| RF48 (ocorrência 1) | Lembretes e Tarefas | RF56 | Notificações (in-app/email) para lembretes e alertas da IA. |
| RF49 (ocorrência 1) | Auditoria e Segurança Operacional | RF57 | Registar **auditoria**: quem, quando, o quê, em operações sensíveis. |
| RF50 (ocorrência 1) | Auditoria e Segurança Operacional | RF58 | Registar **logs de integração** (uploads, SAF-T, reconciliações). |
| RF51 (ocorrência 1) | Auditoria e Segurança Operacional | RF59 | Permitir **reabertura de períodos** apenas com registo de motivo. |
| RF52 (ocorrência 1) | Aprovações, Centros Analíticos e Tesouraria Avançada | RF60 | Definir **workflows de aprovação** por documento (compra, venda, pagamento). |
| RF53 (ocorrência 1) | Aprovações, Centros Analíticos e Tesouraria Avançada | RF61 | Configurar **níveis de aprovação** com limites financeiros e escalamentos. |
| RF54 (ocorrência 1) | Aprovações, Centros Analíticos e Tesouraria Avançada | RF62 | Painel para monitorizar aprovações pendentes e SLA por tipo de documento. |
| RF55 (ocorrência 1) | Aprovações, Centros Analíticos e Tesouraria Avançada | RF63 | Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria. |
| RF56 (ocorrência 1) | Aprovações, Centros Analíticos e Tesouraria Avançada | RF64 | Gerir **linhas de crédito** (limites, utilização, alertas) por banco. |
## Licença

Projeto académico destinado exclusivamente a fins educativos.

## Changelog

-   **2026-04-12** - Renumeração dos RF para códigos únicos RF01..RF64 e adição da tabela de equivalências.
-   **2024-04-27** - Reorganização do RF.md para o formato padrão com novas secções (MVP, créditos, licença e changelog).

---
