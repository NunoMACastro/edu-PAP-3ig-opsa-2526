# 📘 Requisitos Funcionais — Aplicação **OPSA**

> **PAP — Curso Profissional de Informática de Gestão**  
> **Áreas:** Programação · Gestão e Contabilidade · Bases de Dados  
> **Ano letivo:** 2025/2026  
> **Versão:** 1.0  
> **Elaborado por:** [Nome do Grupo]  
> **Professor Orientador:** Nuno Miguel Almeida Castro

---

## Índice

1. [Identidade, Acesso e Perfis](#1-identidade-acesso-e-perfis)
2. [Configuração da Empresa](#2-configuração-da-empresa)
3. [Tabelas-base](#3-tabelas-base)
4. [Vendas (Faturação)](#4-vendas-faturação)
5. [Compras](#5-compras)
6. [Inventário](#6-inventário)
7. [Contabilidade Geral](#7-contabilidade-geral)
8. [Tesouraria e Bancos](#8-tesouraria-e-bancos)
9. [Documentos, Importações e Integrações](#9-documentos-importações-e-integrações)
10. [Relatórios e Dashboards](#10-relatórios-e-dashboards)
11. [Assistente de IA (Análise e Estratégia)](#11-assistente-de-ia-análise-e-estratégia)
12. [Lembretes e Tarefas](#12-lembretes-e-tarefas)
13. [Auditoria e Segurança Operacional](#13-auditoria-e-segurança-operacional)
14. [Critérios de Aceitação](#14-critérios-de-aceitação)
15. [Sugerido para MVP](#15-sugerido-para-mvp)

---

## 1 Identidade, Acesso e Perfis

| Código | Requisito                                                                                    | Atores        | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------------------------- | :------------ | :--------- | :----------- |
| RF01   | Registo, login e logout com cookies HttpOnly.                                                | Todos         | Must       | —            |
| RF02   | Papéis e permissões (**Admin**, **Gestor**, **Contabilista**, **Operacional**, **Auditor**). | Admin         | Must       | RF01         |
| RF03   | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).                 | Admin, Gestor | Must       | RF02         |
| RF04   | Gestão de utilizadores: convite, remoção e definição de papéis.                              | Admin, Gestor | Must       | RF03         |
| RF05   | Recuperação de password via email.                                                           | Todos         | Must       | —            |

---

## 2 Configuração da Empresa

| Código | Requisito                                                                 | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------ | :------------------- | :--------- | :----------- |
| RF06   | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). | Gestor, Contabilista | Must       | —            |
| RF07   | Criar/importar plano de contas (SNC).                                     | Contabilista         | Must       | —            |
| RF08   | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho.       | Contabilista, Gestor | Must       | RF07         |

---

## 3 Tabelas-base

| Código | Requisito                                                 | Atores                    | Prioridade | Dependências |
| :----- | :-------------------------------------------------------- | :------------------------ | :--------- | :----------- |
| RF09   | Criar e gerir **clientes**.                               | Operacional, Gestor       | Must       | —            |
| RF10   | Criar e gerir **fornecedores**.                           | Operacional, Contabilista | Must       | —            |
| RF11   | Criar **artigos/serviços** (SKU, custo, preço, IVA).      | Operacional               | Must       | —            |
| RF12   | Criar **armazéns e localizações**.                        | Operacional               | Should     | —            |
| RF13   | Configurar **tabelas de IVA** (taxas, isenções, códigos). | Contabilista              | Must       | —            |

---

## 4 Vendas (Faturação)

| Código | Requisito                                                                    | Atores              | Prioridade | Dependências     |
| :----- | :--------------------------------------------------------------------------- | :------------------ | :--------- | :--------------- |
| RF14   | Emitir **Fatura, Fatura-Recibo, Nota de Crédito**, com numeração sequencial. | Operacional         | Must       | RF09, RF11, RF13 |
| RF15   | Registar **recebimentos** (parciais/totais).                                 | Operacional         | Must       | —                |
| RF16   | Gerar **lançamentos contabilísticos automáticos** por venda.                 | Contabilista        | Must       | RF14             |
| RF17   | Consultar **títulos em aberto** e antiguidade de saldos.                     | Gestor, Operacional | Should     | —                |

---

## 5 Compras

| Código | Requisito                                                         | Atores       | Prioridade | Dependências     |
| :----- | :---------------------------------------------------------------- | :----------- | :--------- | :--------------- |
| RF18   | Registar **Fatura de Fornecedor** e **Nota de Crédito**.          | Operacional  | Must       | RF10, RF11, RF13 |
| RF19   | Registar **pagamentos** (parciais/totais).                        | Operacional  | Must       | RF18             |
| RF20   | Gerar **lançamentos contabilísticos automáticos** de compras.     | Contabilista | Must       | RF18             |
| RF21   | Aprovação de compras com estados “Rascunho → Aprovado → Lançado”. | Gestor       | Should     | —                |

---

## 6 Inventário

| Código | Requisito                                                          | Atores              | Prioridade | Dependências |
| :----- | :----------------------------------------------------------------- | :------------------ | :--------- | :----------- |
| RF22   | Movimentos de stock: entradas, saídas, transferências, devoluções. | Operacional         | Must       | RF11, RF12   |
| RF23   | Cálculo de custo (FIFO).                                           | Contabilista        | Must       | RF22         |
| RF24   | Contagem física e ajustes.                                         | Operacional         | Should     | RF22         |
| RF25   | Alertas de stock (mínimos, máximos, artigos parados).              | Gestor, Operacional | Should     | RF22         |

---

## 7 Contabilidade Geral

| Código | Requisito                                               | Atores                        | Prioridade | Dependências |
| :----- | :------------------------------------------------------ | :---------------------------- | :--------- | :----------- |
| RF26   | Criar e editar **lançamentos manuais** (com anexos).    | Contabilista                  | Must       | RF07         |
| RF27   | Consultar **balancete e razão** exportável (PDF/Excel). | Contabilista, Auditor, Gestor | Must       | RF26         |
| RF28   | Gerar **Demonstração de Resultados e Balanço**.         | Contabilista, Gestor          | Must       | RF27         |
| RF29   | Gerar **Mapas de IVA** (liquidado/dedutível).           | Contabilista                  | Must       | RF16, RF20   |

---

## 8 Tesouraria e Bancos

| Código | Requisito                                                                   | Atores                    | Prioridade | Dependências     |
| :----- | :-------------------------------------------------------------------------- | :------------------------ | :--------- | :--------------- |
| RF30   | Criar **contas bancárias/caixa** e respetivos saldos.                       | Contabilista, Operacional | Must       | —                |
| RF31   | Importar **extratos bancários** (CSV/OFX) e fazer reconciliação automática. | Operacional, Contabilista | Must       | RF30, RF14, RF18 |
| RF32   | Gerar **previsão de tesouraria** (entradas e saídas futuras).               | Gestor                    | Should     | RF15, RF19       |

---

## 9 Documentos, Importações e Integrações

| Código | Requisito                                                         | Atores                | Prioridade | Dependências |
| :----- | :---------------------------------------------------------------- | :-------------------- | :--------- | :----------- |
| RF33   | Upload de documentos com **OCR** (ler NIF, data, total, IVA).     | Operacional           | Should     | RF18         |
| RF34   | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. | Admin, Contabilista   | Should     | —            |
| RF35   | Exportar **SAF-T (PT)** de faturação e contabilidade.             | Contabilista, Auditor | Must       | —            |
| RF36   | (Opcional) Integração com **e-Fatura**.                           | Contabilista          | Could      | —            |

---

## 10 Relatórios e Dashboards

| Código | Requisito                                              | Atores              | Prioridade | Dependências     |
| :----- | :----------------------------------------------------- | :------------------ | :--------- | :--------------- |
| RF37   | Relatórios de vendas, compras, margens e stock.        | Gestor, Operacional | Must       | RF14, RF18, RF22 |
| RF38   | KPIs executivos (receita, custos, EBITDA, PMR, PMP).   | Gestor              | Should     | RF37             |
| RF39   | Personalização de relatórios e exportação (PDF/Excel). | Todos               | Should     | RF37             |

---

## 11 Assistente de IA (Análise e Estratégia)

| Código | Requisito                                                                       | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------------------ | :------------------- | :--------- | :----------- |
| RF40   | Gerar **insights automáticos** (tendências, riscos, clientes, artigos parados). | Gestor, Contabilista | Must       | RF37         |
| RF41   | Sugerir **ações** (ajustar preços, negociar fornecedor, repor stock).           | Gestor               | Should     | RF40         |
| RF42   | Permitir **perguntas em linguagem natural** e responder com dados e fonte.      | Gestor, Contabilista | Should     | RF37         |
| RF43   | Emitir **alertas inteligentes** (cashflow, desvios, ruturas).                   | Gestor               | Should     | RF32, RF25   |
| RF44   | Mostrar **explicações e fontes** de cada insight.                               | Todos                | Must       | RF40         |

---

## 12 Lembretes e Tarefas

| Código | Requisito                                                   | Atores                            | Prioridade | Dependências |
| :----- | :---------------------------------------------------------- | :-------------------------------- | :--------- | :----------- |
| RF45   | Criar/editar lembretes (prazos, pagamentos, impostos).      | Todos                             | Should     | —            |
| RF46   | Criar e atribuir tarefas com estado e prazo.                | Gestor, Contabilista, Operacional | Should     | —            |
| RF47   | Notificações (in-app/email) para lembretes e alertas da IA. | Todos                             | Should     | RF45, RF43   |

---

## 13 Auditoria e Segurança Operacional

| Código | Requisito                                                            | Atores               | Prioridade | Dependências |
| :----- | :------------------------------------------------------------------- | :------------------- | :--------- | :----------- |
| RF48   | Registar **auditoria**: quem, quando, o quê, em operações sensíveis. | Admin, Auditor       | Must       | —            |
| RF49   | Registar **logs de integração** (uploads, SAF-T, reconciliações).    | Admin                | Must       | —            |
| RF50   | Permitir **reabertura de períodos** apenas com registo de motivo.    | Gestor, Contabilista | Should     | RF08         |

---

## 14 Critérios de Aceitação

### IA — Insights e Recomendações (RF40–RF44)

-   Ao abrir o painel “Insights”, o sistema apresenta pelo menos **5 cartões** com métrica, variação e período.
-   Cada insight inclui **origem dos dados** e **ação sugerida**.
-   Quando o utilizador clica em “Ver detalhes”, é redirecionado para o relatório correspondente.

### Relatórios e KPIs (RF37–RF39)

-   Ao aplicar filtros (período, armazém, família), o dashboard atualiza em ≤2s.
-   Ao exportar, o ficheiro preserva filtros e título do relatório.

### Inventário (RF22–RF25)

-   Ao registar uma compra de 10 unidades, o stock aumenta automaticamente.
-   Ajustes de contagem geram movimento contabilístico, se configurado.

### Vendas/Compras (RF14–RF21)

-   Cada fatura cria lançamento contabilístico automático (Clientes/Vendas/IVA).
-   Faturas de fornecedor geram lançamentos de Compras e IVA dedutível.

### Reconciliação Bancária (RF30–RF32)

-   Importar extrato sugere correspondências automáticas por valor e data.
-   Movimentos por conciliar > X dias geram aviso no painel.

---

## 15 Sugerido para MVP

> **Priorizar**: funcionalidades essenciais para um produto funcional e apresentável.

-   **Identidade e Perfis:** RF01–RF05
-   **Configuração Base:** RF06–RF08, RF09–RF11, RF13
-   **Operações Principais:** RF14–RF20, RF22–RF23, RF26–RF29
-   **Tesouraria e Relatórios:** RF30–RF31, RF35, RF37, RF40, RF44, RF48–RF49
-   **Fase 2:** restantes requisitos (curadoria IA, tarefas, notificações, painéis avançados)

---
