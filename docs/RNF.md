# OPSA - Requisitos Não Funcionais (RNF) e Stack Tecnológica

## Índice

1. [Usabilidade e Acessibilidade](#1-usabilidade-e-acessibilidade)
2. [Performance e Escalabilidade](#2-performance-e-escalabilidade)
3. [Segurança e Proteção de Dados](#3-segurança-e-proteção-de-dados)
4. [Compatibilidade e Integração](#4-compatibilidade-e-integração)
5. [Manutenção, Qualidade e Operação](#5-manutenção-qualidade-e-operação)
6. [Experiência de IA e Ética](#6-experiência-de-ia-e-ética)
7. [Localização e Internacionalização](#7-localização-e-internacionalização)
8. [Resumo das Prioridades](#8-resumo-das-prioridades)
9. [Stack Tecnológica Sugerida](#9-stack-tecnológica-sugerida)
10. [Licença](#licença)
11. [Changelog](#changelog)

-   [Voltar ao início](../README.md)

---

## 1. Usabilidade e Acessibilidade

| Código | Requisito                                                                                            | Tipo           | Prioridade |
| ------ | ---------------------------------------------------------------------------------------------------- | -------------- | ---------- |
| RNF01  | Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade). | Usabilidade    | Must       |
| RNF02  | Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas.                       | Usabilidade    | Must       |
| RNF03  | A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads).               | Usabilidade    | Must       |
| RNF04  | Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade).                        | Acessibilidade | Should     |
| RNF05  | Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC).           | Usabilidade    | Must       |
| RNF06  | As mensagens de erro devem ser claras e indicar como resolver o problema.                            | Usabilidade    | Must       |

---

## 2. Performance e Escalabilidade

| Código | Requisito                                                                 | Tipo           | Prioridade |
| ------ | ------------------------------------------------------------------------- | -------------- | ---------- |
| RNF07  | Dashboard e listagens devem carregar em ≤ 2 segundos.                     | Performance    | Must       |
| RNF08  | Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo. | Performance    | Must       |
| RNF09  | Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação.        | Escalabilidade | Should     |
| RNF10  | Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.     | Performance    | Should     |
| RNF11  | Cálculo de custo (FIFO) deve ser incremental e não bloquear operações.    | Performance    | Should     |
| RNF12  | Arquitetura preparada para escalar horizontalmente.                       | Escalabilidade | Could      |

---

## 3. Segurança e Proteção de Dados

| Código | Requisito                                                       | Tipo        | Prioridade |
| ------ | --------------------------------------------------------------- | ----------- | ---------- |
| RNF13  | Toda a comunicação deve usar HTTPS (TLS 1.2+).                  | Segurança   | Must       |
| RNF14  | Passwords devem usar bcrypt com salt seguro.                    | Segurança   | Must       |
| RNF15  | Sessões com cookies HttpOnly + Secure + SameSite.               | Segurança   | Must       |
| RNF16  | Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force). | Segurança   | Must       |
| RNF17  | Chaves de API e credenciais apenas em variáveis de ambiente.    | Segurança   | Must       |
| RNF18  | Auditoria obrigatória em operações sensíveis.                   | Auditoria   | Must       |
| RNF19  | Backups automáticos diários com restauração possível.           | Fiabilidade | Should     |
| RNF20  | Cumprir obrigações legais de retenção (10 anos, contabilidade). | Legal       | Must       |

---

## 4. Compatibilidade e Integração

| Código | Requisito                                                            | Tipo            | Prioridade |
| ------ | -------------------------------------------------------------------- | --------------- | ---------- |
| RNF21  | Compatível com Chrome, Edge, Firefox e Safari.                       | Compatibilidade | Must       |
| RNF22  | Integração com serviços de email (recuperação de password, alertas). | Integração      | Must       |
| RNF23  | Exportações disponíveis em CSV, Excel e PDF.                         | Compatibilidade | Should     |
| RNF24  | Importações CSV/Excel com validação e logs de erro.                  | Integração      | Must       |
| RNF25  | Geração de SAF-T conforme especificações legais (PT).                | Legal           | Must       |
| RNF26  | API interna estável para futuras integrações.                        | Integração      | Should     |

---

## 5. Manutenção, Qualidade e Operação

| Código | Requisito                                                                               | Tipo       | Prioridade |
| ------ | --------------------------------------------------------------------------------------- | ---------- | ---------- |
| RNF27  | Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).   | Manutenção | Must       |
| RNF28  | Frontend modular com componentes reutilizáveis.                                         | Manutenção | Must       |
| RNF29  | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Qualidade  | Should     |
| RNF30  | Logs estruturados (info, warn, error, audit).                                           | Operação   | Must       |
| RNF31  | Endpoint de health-check.                                                               | Operação   | Should     |
| RNF32  | Deploy com rollback.                                                                    | Manutenção | Should     |
| RNF33  | Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).               | Manutenção | Should     |

---

## 6. Experiência de IA e Ética

| Código | Requisito                                                             | Tipo            | Prioridade |
| ------ | --------------------------------------------------------------------- | --------------- | ---------- |
| RNF34  | Insights devem incluir explicação e origem dos dados usados.          | Explicabilidade | Must       |
| RNF35  | IA não altera dados contabilísticos; apenas analisa e recomenda.      | Ética           | Must       |
| RNF36  | Alertas configuráveis (ativar/desativar tipos).                       | UX              | Should     |
| RNF37  | IA deve evitar enviesamentos e sugerir ações baseadas em dados reais. | Ética           | Should     |

---

## 7. Localização e Internacionalização

| Código | Requisito                                             | Tipo        | Prioridade |
| ------ | ----------------------------------------------------- | ----------- | ---------- |
| RNF38  | Interface em português de Portugal.                   | Localização | Must       |
| RNF39  | Preparado para futura tradução (suporte i18n básico). | Localização | Could      |
| RNF40  | Datas, moedas e separadores no padrão europeu.        | Localização | Should     |

---

## 8. Resumo das Prioridades

| Categoria   | Nº RNF | Must   | Should | Could |
| ----------- | ------ | ------ | ------ | ----- |
| Usabilidade | 6      | 4      | 2      | 0     |
| Performance | 6      | 3      | 3      | 0     |
| Segurança   | 8      | 7      | 1      | 0     |
| Integração  | 6      | 4      | 2      | 0     |
| Manutenção  | 7      | 3      | 4      | 0     |
| IA          | 4      | 2      | 2      | 0     |
| Localização | 3      | 1      | 1      | 1     |
| **Total**   | **40** | **24** | **15** | **1** |

---

## 9. Stack Tecnológica Sugerida

### Frontend

-   React + Vite
-   TypeScript
-   Tailwind CSS

### Backend

-   Node.js LTS com Express
-   Prisma ORM (ou semelhante)
-   Autenticação com cookies HttpOnly

### Base de Dados

-   PostgreSQL
-   Redis para cache e métricas

### IA

-   Serviço interno (Node ou Python FastAPI)
-   Algoritmos de análise financeira e previsões de tesouraria
-   APIs externas opcionais (OpenAI, Hugging Face)

---

## Licença

Projeto académico orientado a fins educativos no âmbito da PAP.

---

## Changelog

-   **2024-06-15** - Versão inicial dos Requisitos Não Funcionais (RNF) e Stack Tecnológica Sugerida.
