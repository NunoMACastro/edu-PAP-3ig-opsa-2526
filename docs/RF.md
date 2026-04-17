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
17. [Licença](#licença)
18. [Changelog](#changelog)

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
| RF44   | Mapear documentos de integração para **centros de custo**. | Contabilista | Should | RF31 |

---

### 10 Relatórios e Dashboards

| Código | Requisito                                              | Atores              | Prioridade | Dependências     |
| :----- | :----------------------------------------------------- | :------------------ | :--------- | :--------------- |
| RF45   | Relatórios de vendas, compras, margens e stock. | Gestor, Operacional | Must | RF14, RF21, RF27 |
| RF46   | KPIs executivos (receita, custos, EBITDA, PMR, PMP). | Gestor | Should | RF45 |
| RF47   | Personalização de relatórios e exportação (PDF/Excel). | Todos | Should | RF45 |

---

### 11 Assistente de IA (Análise e Estratégia)

| Código | Requisito                                                                       | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------------ | :------------------- | :--------- | :----------- |
| RF48   | Gerar **insights automáticos** (tendências, riscos, clientes, artigos parados). | Gestor, Contabilista | Must | RF45 |
| RF49   | Sugerir **ações** (ajustar preços, negociar fornecedor, repor stock). | Gestor | Should | RF48 |
| RF50   | Permitir **perguntas em linguagem natural** e responder com dados e fonte. | Gestor, Contabilista | Should | RF45 |
| RF51   | Emitir **alertas inteligentes** (cashflow, desvios, ruturas). | Gestor | Should | RF40, RF30 |
| RF52   | Mostrar **explicações e fontes** de cada insight. | Todos | Must | RF48 |

---

### 12 Lembretes e Tarefas

| Código | Requisito                                                   | Atores                            | Prioridade | Dependências |
| :----- | :---------------------------------------------------------- | :-------------------------------- | :--------- | :----------- |
| RF53   | Criar/editar lembretes (prazos, pagamentos, impostos). | Todos | Should | - |
| RF54   | Criar e atribuir tarefas com estado e prazo. | Gestor, Contabilista, Operacional | Should | - |
| RF55   | Notificações (in-app/email) para lembretes e alertas da IA. | Todos | Should | RF53, RF51 |

---

### 13 Auditoria e Segurança Operacional

| Código | Requisito                                                            | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------- | :------------------- | :--------- | :----------- |
| RF56   | Registar **auditoria**: quem, quando, o quê, em operações sensíveis. | Admin, Auditor | Must | - |
| RF57   | Registar **logs de integração** (uploads, SAF-T, reconciliações). | Admin | Must | - |
| RF58   | Permitir **reabertura de períodos** apenas com registo de motivo. | Gestor, Contabilista | Should | RF08 |

---

### 14 Aprovações, Centros Analíticos e Tesouraria Avançada

| Código | Requisito                                                                          | Atores             | Prioridade | Dependências |
| :----- | :--------------------------------------------------------------------------------- | :----------------- | :--------- | :----------- |
| RF59   | Definir **workflows de aprovação** por documento (compra, venda, pagamento). | Gestor, Admin | Should | RF18, RF22, RF24 |
| RF60   | Configurar **níveis de aprovação** com limites financeiros e escalamentos. | Gestor | Should | RF59 |
| RF61   | Painel para monitorizar aprovações pendentes e SLA por tipo de documento. | Gestor | Should | RF59 |
| RF62   | Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria. | Tesouraria, Gestor | Should | RF39 |

---

## Critérios de Aceitação

### IA - Insights e Recomendações (RF48-RF52)

-   Ao abrir o painel “Insights”, o sistema apresenta pelo menos **5 cartões** com métrica, variação e período.
-   Cada insight inclui **origem dos dados** e **ação sugerida**.
-   Quando o utilizador clica em “Ver detalhes”, é redirecionado para o relatório correspondente.

### Relatórios e KPIs (RF45-RF47)

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
-   **Fase 3 - Tesouraria e IA:** RF38-RF52 (bancos, relatórios, dashboards e assistente).
-   **Fase 4 - Operação Avançada:** RF41-RF43, RF44 e RF53-RF62 (tarefas, auditoria, aprovações, agendamentos e integrações).

---
## Licença

Projeto académico destinado exclusivamente a fins educativos.

## Changelog

-   **2026-04-17** - Renumeração canónica RF aplicada (RF01..RF62) com atualização integral de dependências e rastreabilidade.
-   **2026-04-17** - Escopo MVP limpo de requisitos funcionais cortados e simplificado nos domínios de lembretes, tarefas, notificações e aprovações.
-   **2024-04-27** - Reorganização do RF.md para o formato padrão com novas secções (MVP, créditos, licença e changelog).

---
