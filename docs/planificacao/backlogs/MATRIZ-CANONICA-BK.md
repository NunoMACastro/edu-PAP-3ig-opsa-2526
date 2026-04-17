# MATRIZ-CANONICA-BK

## Header
- `doc_id`: `MATRIZ-CANONICA-BK`
- `path`: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-17`

## Objetivo
Matriz unica validada para gerar backlog, MF views, sprints e guias BK sem ambiguidades.

## Contrato documental aplicavel
Os campos obrigatorios por BK estao definidos em `CONTRATO-CAMPOS-BK.md`.
Quando um campo nao estiver explicito nesta tabela, e derivado dos anexos canónicos:
- `ANEXO-BK-SPRINT-OWNER.md` (sprint e guia_path)
- `ANEXO-RF-PARA-BKS.md` e `ANEXO-RNF-PARA-BKS.md` (rastreabilidade reversa)

## Tabela canonica
| bk_id | macro | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | fase_documental | proximo_bk_recomendado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | MF0 | Registo, login e logout com cookies HttpOnly. | Oleksii | Andre | P0 | TODO | M | - | RF01 | Fase 1 | BK-MF0-02 |
| BK-MF0-02 | MF0 | Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor). | Oleksii | Andre | P0 | TODO | M | BK-MF0-01 | RF02 | Fase 1 | BK-MF0-03 |
| BK-MF0-03 | MF0 | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). | Oleksii | Andre | P0 | TODO | M | BK-MF0-02 | RF03 | Fase 1 | BK-MF0-04 |
| BK-MF0-04 | MF0 | Gestão de utilizadores: convite, remoção e definição de papéis. | Oleksii | Andre | P0 | TODO | M | BK-MF0-03 | RF04 | Fase 1 | BK-MF0-05 |
| BK-MF0-05 | MF0 | Recuperação de password via email. | Oleksii | Andre | P0 | TODO | M | - | RF05 | Fase 1 | BK-MF0-06 |
| BK-MF0-06 | MF0 | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). | Oleksii | Andre | P0 | TODO | M | - | RF06 | Fase 1 | BK-MF0-07 |
| BK-MF0-07 | MF0 | Criar/importar plano de contas (SNC). | Oleksii | Andre | P0 | TODO | M | - | RF07 | Fase 1 | BK-MF0-08 |
| BK-MF0-08 | MF0 | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho. | Oleksii | Andre | P0 | TODO | M | BK-MF0-07 | RF08 | Fase 1 | BK-MF0-09 |
| BK-MF0-09 | MF0 | Criar e gerir clientes. | Andre | Oleksii | P0 | TODO | M | - | RF09 | Fase 1 | BK-MF0-10 |
| BK-MF0-10 | MF0 | Criar e gerir fornecedores. | Pedro | Oleksii | P0 | TODO | M | - | RF10 | Fase 1 | BK-MF0-11 |
| BK-MF0-11 | MF0 | Criar artigos/serviços (SKU, custo, preço, IVA). | Andre | Oleksii | P0 | TODO | M | - | RF11 | Fase 1 | BK-MF0-12 |
| BK-MF0-12 | MF0 | Criar armazéns e localizações. | Sofia | Oleksii | P1 | TODO | S | - | RF12 | Fase 1 | BK-MF1-01 |
| BK-MF1-01 | MF1 | Configurar tabelas de IVA (taxas, isenções, códigos). | Oleksii | Andre | P0 | TODO | M | - | RF13 | Fase 1 | BK-MF1-02 |
| BK-MF1-02 | MF1 | Emitir Fatura, Fatura-Recibo, Nota de Crédito, com numeração sequencial. | Andre | Oleksii | P0 | TODO | M | BK-MF0-09, BK-MF0-11, BK-MF1-01 | RF14 | Fase 1 | BK-MF1-03 |
| BK-MF1-03 | MF1 | Registar recebimentos (parciais/totais). | Pedro | Andre | P0 | TODO | M | - | RF15 | Fase 1 | BK-MF1-04 |
| BK-MF1-04 | MF1 | Gerar lançamentos contabilísticos automáticos por venda. | Oleksii | Andre | P0 | TODO | M | BK-MF1-02 | RF16 | Fase 1 | BK-MF1-05 |
| BK-MF1-05 | MF1 | Consultar títulos em aberto e antiguidade de saldos. | Oleksii | Andre | P1 | TODO | S | - | RF17 | Fase 1 | BK-MF1-06 |
| BK-MF1-06 | MF1 | Submeter documentos de venda para aprovação antes de emissão definitiva. | Andre | Oleksii | P1 | TODO | S | BK-MF1-02 | RF18 | Fase 1 | BK-MF1-07 |
| BK-MF1-07 | MF1 | Definir fluxos e limites de aprovação (por papel, valor, cliente). | Oleksii | Andre | P2 | TODO | S | BK-MF1-06 | RF19 | Fase 1 | BK-MF1-08 |
| BK-MF1-08 | MF1 | Registar histórico de decisões de aprovação e comentários. | Oleksii | Andre | P1 | TODO | S | BK-MF1-06 | RF20 | Fase 1 | BK-MF1-09 |
| BK-MF1-09 | MF1 | Registar Fatura de Fornecedor e Nota de Crédito. | Andre | Oleksii | P0 | TODO | M | BK-MF0-10, BK-MF0-11, BK-MF1-01 | RF21 | Fase 1 | BK-MF1-10 |
| BK-MF1-10 | MF1 | Registar pagamentos (parciais/totais). | Pedro | Andre | P0 | TODO | M | BK-MF1-09 | RF22 | Fase 1 | BK-MF1-11 |
| BK-MF1-11 | MF1 | Gerar lançamentos contabilísticos automáticos de compras. | Oleksii | Andre | P0 | TODO | M | BK-MF1-09 | RF23 | Fase 1 | BK-MF1-12 |
| BK-MF1-12 | MF1 | Aprovação de compras com estados “Rascunho → Aprovado → Lançado”. | Andre | Oleksii | P1 | TODO | S | - | RF24 | Fase 1 | BK-MF2-01 |
| BK-MF2-01 | MF2 | Configurar limites e papéis para aprovações (por fornecedor/valor). | Pedro | Andre | P1 | TODO | S | BK-MF1-12 | RF25 | Fase 1 | BK-MF2-02 |
| BK-MF2-02 | MF2 | Histórico e justificações para aprovações/reprovações. | Sofia | Oleksii | P1 | TODO | S | BK-MF1-12 | RF26 | Fase 1 | BK-MF2-03 |
| BK-MF2-03 | MF2 | Movimentos de stock: entradas, saídas, transferências, devoluções. | Andre | Oleksii | P0 | TODO | M | BK-MF0-11, BK-MF0-12 | RF27 | Fase 1 | BK-MF2-04 |
| BK-MF2-04 | MF2 | Cálculo de custo (FIFO). | Pedro | Andre | P0 | TODO | M | BK-MF2-03 | RF28 | Fase 1 | BK-MF2-05 |
| BK-MF2-05 | MF2 | Contagem física e ajustes. | Andre | Oleksii | P1 | TODO | S | BK-MF2-03 | RF29 | Fase 1 | BK-MF2-06 |
| BK-MF2-06 | MF2 | Alertas de stock (mínimos, máximos, artigos parados). | Pedro | Andre | P1 | TODO | S | BK-MF2-03 | RF30 | Fase 1 | BK-MF2-07 |
| BK-MF2-07 | MF2 | Configurar centros de custo / segmentos analíticos. | Sofia | Oleksii | P1 | TODO | S | BK-MF0-07 | RF31 | Fase 1 | BK-MF2-08 |
| BK-MF2-08 | MF2 | Associar documentos e lançamentos a centros de custo. | Andre | Oleksii | P1 | TODO | S | BK-MF2-07 | RF32 | Fase 1 | BK-MF2-09 |
| BK-MF2-09 | MF2 | Relatórios e filtros por centro de custo/segmento. | Pedro | Andre | P1 | TODO | S | BK-MF2-08 | RF33 | Fase 1 | BK-MF2-10 |
| BK-MF2-10 | MF2 | Criar e editar lançamentos manuais (com anexos). | Oleksii | Andre | P0 | TODO | M | BK-MF0-07 | RF34 | Fase 1 | BK-MF2-11 |
| BK-MF2-11 | MF2 | Consultar balancete e razão exportável (PDF/Excel). | Andre | Oleksii | P0 | TODO | M | BK-MF2-10 | RF35 | Fase 1 | BK-MF2-12 |
| BK-MF2-12 | MF2 | Gerar Demonstração de Resultados e Balanço. | Pedro | Andre | P0 | TODO | M | BK-MF2-11 | RF36 | Fase 1 | BK-MF3-01 |
| BK-MF3-01 | MF3 | Gerar Mapas de IVA (liquidado/dedutível). | Oleksii | Andre | P0 | TODO | M | BK-MF1-04, BK-MF1-11 | RF37 | Fase 2 | BK-MF3-02 |
| BK-MF3-02 | MF3 | Criar contas bancárias/caixa e respetivos saldos. | Andre | Oleksii | P0 | TODO | M | - | RF38 | Fase 2 | BK-MF3-03 |
| BK-MF3-03 | MF3 | Importar extratos bancários (CSV/OFX) e fazer reconciliação automática. | Pedro | Andre | P0 | TODO | M | BK-MF3-02, BK-MF1-02, BK-MF1-09 | RF39 | Fase 2 | BK-MF3-04 |
| BK-MF3-04 | MF3 | Gerar previsão de tesouraria (entradas e saídas futuras). | Oleksii | Andre | P1 | TODO | S | BK-MF1-03, BK-MF1-10 | RF40 | Fase 2 | BK-MF3-05 |
| BK-MF3-05 | MF3 | Upload de documentos com OCR (ler NIF, data, total, IVA). | Andre | Oleksii | P1 | TODO | S | BK-MF1-09 | RF41 | Fase 2 | BK-MF3-06 |
| BK-MF3-06 | MF3 | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. | Pedro | Andre | P1 | TODO | S | - | RF42 | Fase 2 | BK-MF3-07 |
| BK-MF3-07 | MF3 | Exportar SAF-T (PT) de faturação e contabilidade. | Oleksii | Andre | P0 | TODO | M | - | RF43 | Fase 2 | BK-MF3-09 |
| BK-MF3-09 | MF3 | Mapear documentos de integração para centros de custo. | Oleksii | Andre | P1 | TODO | S | BK-MF2-07 | RF44 | Fase 2 | BK-MF3-10 |
| BK-MF3-10 | MF3 | Relatórios de vendas, compras, margens e stock. | Andre | Oleksii | P0 | TODO | M | BK-MF1-02, BK-MF1-09, BK-MF2-03 | RF45 | Fase 2 | BK-MF3-11 |
| BK-MF3-11 | MF3 | KPIs executivos (receita, custos, EBITDA, PMR, PMP). | Andre | Oleksii | P1 | TODO | S | BK-MF3-10 | RF46 | Fase 2 | BK-MF3-12 |
| BK-MF3-12 | MF3 | Personalização de relatórios e exportação (PDF/Excel). | Pedro | Andre | P1 | TODO | S | BK-MF3-10 | RF47 | Fase 2 | BK-MF4-01 |
| BK-MF4-01 | MF4 | Gerar insights automáticos (tendências, riscos, clientes, artigos parados). | Pedro | Andre | P0 | TODO | M | BK-MF3-10 | RF48 | Fase 2 | BK-MF4-02 |
| BK-MF4-02 | MF4 | Sugerir ações (ajustar preços, negociar fornecedor, repor stock). | Sofia | Oleksii | P1 | TODO | S | BK-MF4-01 | RF49 | Fase 2 | BK-MF4-03 |
| BK-MF4-03 | MF4 | Permitir perguntas em linguagem natural e responder com dados e fonte. | Andre | Oleksii | P1 | TODO | S | BK-MF3-10 | RF50 | Fase 2 | BK-MF4-04 |
| BK-MF4-04 | MF4 | Emitir alertas inteligentes (cashflow, desvios, ruturas). | Pedro | Andre | P1 | TODO | S | BK-MF3-04, BK-MF2-06 | RF51 | Fase 2 | BK-MF4-05 |
| BK-MF4-05 | MF4 | Mostrar explicações e fontes de cada insight. | Oleksii | Andre | P0 | TODO | M | BK-MF4-01 | RF52 | Fase 2 | BK-MF4-06 |
| BK-MF4-06 | MF4 | Criar/editar lembretes essenciais (prazos, pagamentos e impostos). | Sofia | Oleksii | P1 | TODO | S | - | RF53 | Fase 2 | BK-MF4-07 |
| BK-MF4-07 | MF4 | Criar e atribuir tarefas essenciais com estado e prazo. | Andre | Oleksii | P1 | TODO | S | - | RF54 | Fase 2 | BK-MF4-08 |
| BK-MF4-08 | MF4 | Notificações in-app para lembretes e alertas críticos da IA. | Pedro | Andre | P1 | TODO | S | BK-MF4-06, BK-MF4-04 | RF55 | Fase 2 | BK-MF4-09 |
| BK-MF4-09 | MF4 | Registar auditoria: quem, quando, o quê, em operações sensíveis. | Andre | Oleksii | P0 | TODO | M | - | RF56 | Fase 2 | BK-MF4-10 |
| BK-MF4-10 | MF4 | Registar logs de integração (uploads, SAF-T, reconciliações). | Pedro | Andre | P0 | TODO | M | - | RF57 | Fase 2 | BK-MF4-11 |
| BK-MF4-11 | MF4 | Permitir reabertura de períodos apenas com registo de motivo. | Sofia | Oleksii | P1 | TODO | S | BK-MF0-08 | RF58 | Fase 2 | BK-MF4-12 |
| BK-MF4-12 | MF4 | Definir workflows de aprovação por documento (compra, venda, pagamento). | Andre | Oleksii | P1 | TODO | S | BK-MF1-06, BK-MF1-10, BK-MF1-12 | RF59 | Fase 2 | BK-MF5-01 |
| BK-MF5-01 | MF5 | Configurar níveis de aprovação essenciais com limites financeiros. | Pedro | Andre | P1 | TODO | S | BK-MF4-12 | RF60 | Fase 2 | BK-MF5-02 |
| BK-MF5-02 | MF5 | Painel simples para monitorizar aprovações pendentes por tipo de documento. | Sofia | Pedro | P1 | TODO | S | BK-MF4-12 | RF61 | Fase 2 | BK-MF5-03 |
| BK-MF5-03 | MF5 | Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria. | Sofia | Oleksii | P1 | TODO | S | BK-MF3-03 | RF62 | Fase 2 | BK-MF5-05 |
| BK-MF5-05 | MF5 | Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade). | Oleksii | Andre | P0 | TODO | M | - | RNF01 | Fase 2 | BK-MF5-06 |
| BK-MF5-06 | MF5 | Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas. | Andre | Oleksii | P0 | TODO | M | - | RNF02 | Fase 2 | BK-MF5-07 |
| BK-MF5-07 | MF5 | A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads). | Pedro | Andre | P0 | TODO | M | - | RNF03 | Fase 2 | BK-MF5-08 |
| BK-MF5-08 | MF5 | Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade). | Pedro | Andre | P1 | TODO | S | - | RNF04 | Fase 2 | BK-MF5-09 |
| BK-MF5-09 | MF5 | Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC). | Oleksii | Andre | P0 | TODO | M | - | RNF05 | Fase 2 | BK-MF5-10 |
| BK-MF5-10 | MF5 | As mensagens de erro devem ser claras e indicar como resolver o problema. | Andre | Oleksii | P0 | TODO | M | - | RNF06 | Fase 2 | BK-MF5-11 |
| BK-MF5-11 | MF5 | Dashboard e listagens devem carregar em ≤ 2 segundos. | Pedro | Andre | P0 | TODO | M | - | RNF07 | Fase 2 | BK-MF6-01 |
| BK-MF6-01 | MF6 | Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo. | Oleksii | Andre | P0 | TODO | M | - | RNF08 | Fase 3 | BK-MF6-02 |
| BK-MF6-02 | MF6 | Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação. | Sofia | Pedro | P1 | TODO | S | - | RNF09 | Fase 3 | BK-MF6-03 |
| BK-MF6-03 | MF6 | Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos. | Oleksii | Andre | P1 | TODO | S | - | RNF10 | Fase 3 | BK-MF6-04 |
| BK-MF6-04 | MF6 | Cálculo de custo (FIFO) deve ser incremental e não bloquear operações. | Andre | Oleksii | P1 | TODO | S | - | RNF11 | Fase 3 | BK-MF6-06 |
| BK-MF6-06 | MF6 | Toda a comunicação deve usar HTTPS (TLS 1.2+). | Andre | Oleksii | P0 | TODO | M | - | RNF12 | Fase 3 | BK-MF6-07 |
| BK-MF6-07 | MF6 | Passwords devem usar bcrypt com salt seguro. | Pedro | Andre | P0 | TODO | M | - | RNF13 | Fase 3 | BK-MF6-08 |
| BK-MF6-08 | MF6 | Sessões com cookies HttpOnly + Secure + SameSite. | Oleksii | Andre | P0 | TODO | M | - | RNF14 | Fase 3 | BK-MF6-09 |
| BK-MF6-09 | MF6 | Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force). | Andre | Oleksii | P0 | TODO | M | - | RNF15 | Fase 3 | BK-MF6-10 |
| BK-MF6-10 | MF6 | Chaves de API e credenciais apenas em variáveis de ambiente. | Pedro | Andre | P0 | TODO | M | - | RNF16 | Fase 3 | BK-MF6-11 |
| BK-MF6-11 | MF6 | Auditoria obrigatória em operações sensíveis. | Oleksii | Andre | P0 | TODO | M | - | RNF17 | Fase 3 | BK-MF7-01 |
| BK-MF7-01 | MF7 | Backups automáticos diários com restauração possível. | Pedro | Andre | P1 | TODO | S | - | RNF18 | Fase 3 | BK-MF7-02 |
| BK-MF7-02 | MF7 | Cumprir obrigações legais de retenção (10 anos, contabilidade). | Andre | Oleksii | P0 | TODO | M | - | RNF19 | Fase 3 | BK-MF7-03 |
| BK-MF7-03 | MF7 | Compatível com Chrome, Edge, Firefox e Safari. | Pedro | Andre | P0 | TODO | M | - | RNF20 | Fase 3 | BK-MF7-04 |
| BK-MF7-04 | MF7 | Integração com serviços de email (recuperação de password, alertas). | Sofia | Pedro | P0 | TODO | M | - | RNF21 | Fase 3 | BK-MF7-05 |
| BK-MF7-05 | MF7 | Exportações disponíveis em CSV, Excel e PDF. | Sofia | Pedro | P1 | TODO | S | - | RNF22 | Fase 3 | BK-MF7-06 |
| BK-MF7-06 | MF7 | Importações CSV/Excel com validação e logs de erro. | Oleksii | Andre | P0 | TODO | M | - | RNF23 | Fase 3 | BK-MF7-07 |
| BK-MF7-07 | MF7 | Geração de SAF-T conforme especificações legais (PT). | Andre | Oleksii | P0 | TODO | M | - | RNF24 | Fase 3 | BK-MF7-08 |
| BK-MF7-08 | MF7 | API interna estável para futuras integrações. | Sofia | Oleksii | P1 | TODO | S | - | RNF25 | Fase 3 | BK-MF7-09 |
| BK-MF7-09 | MF7 | Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA). | Pedro | Andre | P0 | TODO | M | - | RNF26 | Fase 3 | BK-MF7-10 |
| BK-MF7-10 | MF7 | Frontend modular com componentes reutilizáveis. | Sofia | Pedro | P0 | TODO | M | - | RNF27 | Fase 3 | BK-MF7-11 |
| BK-MF7-11 | MF7 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Andre | Oleksii | P1 | TODO | S | - | RNF28 | Fase 3 | BK-MF8-01 |
| BK-MF8-01 | MF8 | Logs estruturados (info, warn, error, audit). | Oleksii | Andre | P0 | TODO | M | - | RNF29 | Fase 3 | BK-MF8-02 |
| BK-MF8-02 | MF8 | Endpoint de health-check. | Pedro | Andre | P1 | TODO | S | - | RNF30 | Fase 3 | BK-MF8-03 |
| BK-MF8-03 | MF8 | Deploy com rollback. | Sofia | Pedro | P1 | TODO | S | - | RNF31 | Fase 3 | BK-MF8-04 |
| BK-MF8-04 | MF8 | Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico). | Sofia | Oleksii | P1 | TODO | S | - | RNF32 | Fase 3 | BK-MF8-05 |
| BK-MF8-05 | MF8 | Insights devem incluir explicação e origem dos dados usados. | Andre | Oleksii | P0 | TODO | M | - | RNF33 | Fase 3 | BK-MF8-06 |
| BK-MF8-06 | MF8 | IA não altera dados contabilísticos; apenas analisa e recomenda. | Pedro | Andre | P0 | TODO | M | - | RNF34 | Fase 3 | BK-MF8-07 |
| BK-MF8-07 | MF8 | Alertas configuráveis (ativar/desativar tipos). | Andre | Oleksii | P1 | TODO | S | - | RNF35 | Fase 3 | BK-MF8-08 |
| BK-MF8-08 | MF8 | IA deve evitar enviesamentos e sugerir ações baseadas em dados reais. | Pedro | Andre | P1 | TODO | S | - | RNF36 | Fase 3 | BK-MF8-09 |
| BK-MF8-09 | MF8 | Interface em português de Portugal. | Sofia | Pedro | P0 | TODO | M | - | RNF37 | Fase 3 | BK-MF8-11 |
| BK-MF8-11 | MF8 | Datas, moedas e separadores no padrão europeu. | Sofia | Pedro | P1 | TODO | S | - | RNF38 | Fase 3 | - |
## Validacao inicial
- BK duplicado: nao detetado.
- BK orfao: nao detetado.
- Dependencias invalidas: nao detetadas.

## Changelog
- `2026-04-12`: Redistribuicao de ownership alinhada com perfil tecnico da equipa.
- `2026-04-13`: Matriz ligada ao contrato canónico de campos BK e anexos de rastreabilidade.
- `2026-04-17`: Renumeração RF/RNF aplicada, dependências de aprovação ajustadas e ownership rebalanceado.
