# OPSA - Requisitos Não Funcionais (RNF) e Stack Tecnológica

## Índice

1. [Usabilidade e Acessibilidade](#rnf-1-usabilidade-e-acessibilidade)
2. [Performance e Escalabilidade](#rnf-2-performance-e-escalabilidade)
3. [Segurança e Proteção de Dados](#rnf-3-seguranca-e-protecao-de-dados)
4. [Compatibilidade e Integração](#rnf-4-compatibilidade-e-integracao)
5. [Manutenção, Qualidade e Operação](#rnf-5-manutencao-qualidade-e-operacao)
6. [Experiência de IA e Ética](#rnf-6-experiencia-de-ia-e-etica)
7. [Localização e Internacionalização](#rnf-7-localizacao-e-internacionalizacao)
8. [Resumo das Prioridades](#rnf-resumo-das-prioridades)
9. [Stack Tecnológica Sugerida](#rnf-stack-tecnologica-sugerida)
10. [Licença](#rnf-licenca)
11. [Changelog](#rnf-changelog)

- [Voltar ao início](../README.md)

---

<a id="rnf-1-usabilidade-e-acessibilidade"></a>
## 1. Usabilidade e Acessibilidade

| Código | Requisito | Tipo | Prioridade |
| ------ | --------- | ---- | ---------- |
| RNF01 | Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade). | Usabilidade | Must |
| RNF02 | Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas. | Usabilidade | Must |
| RNF03 | A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads). | Usabilidade | Must |
| RNF04 | Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade). | Acessibilidade | Should |
| RNF05 | Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC). | Usabilidade | Must |
| RNF06 | As mensagens de erro devem ser claras e indicar como resolver o problema. | Usabilidade | Must |

---

<a id="rnf-2-performance-e-escalabilidade"></a>
## 2. Performance e Escalabilidade

| Código | Requisito | Tipo | Prioridade |
| ------ | --------- | ---- | ---------- |
| RNF07 | Dashboard e listagens devem carregar em ≤ 2 segundos. | Performance | Must |
| RNF08 | Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo. | Performance | Must |
| RNF09 | Suportar ≥ 25 utilizadores simultâneos por empresa sem degradação relevante. | Escalabilidade | Should |
| RNF10 | Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos. | Performance | Should |
| RNF11 | Cálculo de custo (FIFO) deve manter correção e não bloquear operações críticas. | Performance | Should |

---

<a id="rnf-3-seguranca-e-protecao-de-dados"></a>
## 3. Segurança e Proteção de Dados

| Código | Requisito | Tipo | Prioridade |
| ------ | --------- | ---- | ---------- |
| RNF12 | Toda a comunicação deve usar HTTPS (TLS 1.2+). | Segurança | Must |
| RNF13 | Passwords devem usar bcrypt com salt seguro. | Segurança | Must |
| RNF14 | Sessões com cookies HttpOnly + Secure + SameSite. | Segurança | Must |
| RNF15 | Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force). | Segurança | Must |
| RNF16 | Chaves de API e credenciais apenas em variáveis de ambiente. | Segurança | Must |
| RNF17 | Auditoria obrigatória em operações sensíveis. | Auditoria | Must |
| RNF18 | Backups automáticos diários com restauração possível. | Fiabilidade | Should |
| RNF19 | Cumprir obrigações legais de retenção (10 anos, contabilidade). | Legal | Must |

---

<a id="rnf-4-compatibilidade-e-integracao"></a>
## 4. Compatibilidade e Integração

| Código | Requisito | Tipo | Prioridade |
| ------ | --------- | ---- | ---------- |
| RNF20 | Compatível com Chrome, Edge e Firefox. | Compatibilidade | Must |
| RNF21 | Integração com serviços de email (recuperação de password, alertas). | Integração | Must |
| RNF22 | Exportações essenciais disponíveis em CSV, Excel e PDF. | Compatibilidade | Should |
| RNF23 | Importações CSV/Excel com validação e logs de erro. | Integração | Must |
| RNF24 | Geração de SAF-T conforme especificações legais (PT). | Legal | Must |

---

<a id="rnf-5-manutencao-qualidade-e-operacao"></a>
## 5. Manutenção, Qualidade e Operação

| Código | Requisito | Tipo | Prioridade |
| ------ | --------- | ---- | ---------- |
| RNF25 | Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA). | Manutenção | Must |
| RNF26 | Frontend modular com componentes reutilizáveis. | Manutenção | Must |
| RNF27 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Qualidade | Should |
| RNF28 | Logs estruturados (info, warn, error, audit). | Operação | Must |
| RNF29 | Endpoint de health-check. | Operação | Should |
| RNF30 | Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico). | Manutenção | Should |

---

<a id="rnf-6-experiencia-de-ia-e-etica"></a>
## 6. Experiência de IA e Ética

| Código | Requisito | Tipo | Prioridade |
| ------ | --------- | ---- | ---------- |
| RNF31 | Insights devem incluir explicação e origem dos dados usados. | Explicabilidade | Must |
| RNF32 | IA não altera dados contabilísticos; apenas analisa e recomenda. | Ética | Must |
| RNF33 | Alertas configuráveis (ativar/desativar tipos). | UX | Should |
| RNF34 | IA deve evitar enviesamentos e sugerir ações baseadas em dados reais. | Ética | Should |

---

<a id="rnf-7-localizacao-e-internacionalizacao"></a>
## 7. Localização e Internacionalização

| Código | Requisito | Tipo | Prioridade |
| ------ | --------- | ---- | ---------- |
| RNF35 | Interface em português de Portugal. | Localização | Must |
| RNF36 | Datas, moedas e separadores no padrão europeu. | Localização | Should |

---

<a id="rnf-resumo-das-prioridades"></a>
## Resumo das Prioridades

| Categoria | Nº RNF | Must | Should | Could |
| --------- | ------ | ---- | ------ | ----- |
| Usabilidade e Acessibilidade | 6 | 5 | 1 | 0 |
| Performance e Escalabilidade | 5 | 2 | 3 | 0 |
| Segurança e Proteção de Dados | 8 | 7 | 1 | 0 |
| Compatibilidade e Integração | 5 | 4 | 1 | 0 |
| Manutenção, Qualidade e Operação | 6 | 3 | 3 | 0 |
| Experiência de IA e Ética | 4 | 2 | 2 | 0 |
| Localização e Internacionalização | 2 | 1 | 1 | 0 |
| **Total** | **36** | **24** | **12** | **0** |

---

<a id="rnf-stack-tecnologica-sugerida"></a>
## Stack Tecnológica Sugerida

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS

### Backend
- Node.js LTS com Express
- Prisma ORM (ou semelhante)
- Autenticação com cookies HttpOnly

### Base de Dados
- PostgreSQL
- Redis para cache e métricas

### IA
- Serviço interno (Node ou Python FastAPI)
- Algoritmos de análise financeira e previsões de tesouraria
- APIs externas opcionais (OpenAI, Hugging Face)

---
<a id="rnf-licenca"></a>
## Licença

Projeto académico orientado a fins educativos no âmbito da PAP.

---
<a id="rnf-changelog"></a>
## Changelog

- **2026-04-19** - Redução e simplificação do escopo com renumeração canónica contínua (`RNF01..RNF36`).
