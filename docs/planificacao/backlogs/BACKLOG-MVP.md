# BACKLOG-MVP

## Header
- `doc_id`: `BACKLOG-MVP`
- `path`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Objetivo
Backlog atomico oficial do MVP com rastreabilidade canónica e contrato pedagógico comum entre as 4 PAPs.

## Meta documental oficial
- Score final alvo: `>=97/100`.
- Fecho exige validacao automatica em `PASS` + evidencias por gate.

## Contrato de dados canónico por BK
Campos obrigatorios: `bk_id`, `owner`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`.

## Contrato pedagogico comum
- `P0`: minimo `8` passos e `3` cenarios negativos.
- `P1`: minimo `6` passos e `2` cenarios negativos.
- `P2`: minimo `6` passos e `1` cenario negativo.
- Snippet tecnico obrigatoriamente ligado a `bk_id` e `rf_rnf`.

## Legenda
- Prioridade: `P0` (critico), `P1` (importante), `P2` (melhoria).
- Estado: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.
- Esforco: `S`, `M`, `L`.

## Snapshot por macro
| Macro | Total BK | P0 | P1 | P2 |
| --- | --- | --- | --- | --- |
| MF0 | 12 | 11 | 1 | 0 |
| MF1 | 10 | 7 | 3 | 0 |
| MF2 | 8 | 5 | 3 | 0 |
| MF3 | 8 | 5 | 3 | 0 |
| MF4 | 10 | 4 | 6 | 0 |
| MF5 | 7 | 6 | 1 | 0 |
| MF6 | 10 | 7 | 3 | 0 |
| MF7 | 10 | 7 | 3 | 0 |
| MF8 | 9 | 4 | 5 | 0 |

## Tabela global de ligacao BK -> guia -> estado documental
| bk_id | macro | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | fase_documental | proximo_bk | guia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | MF0 | Registo, login e logout com cookies HttpOnly. | Oleksii | Andre | P0 | TODO | M | - | RF01 | Fase 1 | BK-MF0-02 | [guia](../guias-bk/MF0/BK-MF0-01-registo-login-e-logout-com-cookies-httponly.md) |
| BK-MF0-02 | MF0 | Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor). | Oleksii | Andre | P0 | TODO | M | BK-MF0-01 | RF02 | Fase 1 | BK-MF0-03 | [guia](../guias-bk/MF0/BK-MF0-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md) |
| BK-MF0-03 | MF0 | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). | Oleksii | Andre | P0 | TODO | M | BK-MF0-02 | RF03 | Fase 1 | BK-MF0-04 | [guia](../guias-bk/MF0/BK-MF0-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empresas.md) |
| BK-MF0-04 | MF0 | Gestão de utilizadores: convite, remoção e definição de papéis. | Oleksii | Andre | P0 | TODO | M | BK-MF0-03 | RF04 | Fase 1 | BK-MF0-05 | [guia](../guias-bk/MF0/BK-MF0-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md) |
| BK-MF0-05 | MF0 | Recuperação de password via email. | Oleksii | Pedro | P0 | TODO | M | - | RF05 | Fase 1 | BK-MF0-06 | [guia](../guias-bk/MF0/BK-MF0-05-recuperacao-de-password-via-email.md) |
| BK-MF0-06 | MF0 | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). | Oleksii | Sofia | P0 | TODO | M | - | RF06 | Fase 1 | BK-MF0-07 | [guia](../guias-bk/MF0/BK-MF0-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md) |
| BK-MF0-07 | MF0 | Criar/importar plano de contas (SNC). | Oleksii | Andre | P0 | TODO | M | - | RF07 | Fase 1 | BK-MF0-08 | [guia](../guias-bk/MF0/BK-MF0-07-criar-importar-plano-de-contas-snc.md) |
| BK-MF0-08 | MF0 | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho. | Oleksii | Pedro | P0 | TODO | M | BK-MF0-07 | RF08 | Fase 1 | BK-MF0-09 | [guia](../guias-bk/MF0/BK-MF0-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md) |
| BK-MF0-09 | MF0 | Criar e gerir clientes. | Andre | Oleksii | P0 | TODO | M | - | RF09 | Fase 1 | BK-MF0-10 | [guia](../guias-bk/MF0/BK-MF0-09-criar-e-gerir-clientes.md) |
| BK-MF0-10 | MF0 | Criar e gerir fornecedores. | Pedro | Oleksii | P0 | TODO | M | - | RF10 | Fase 1 | BK-MF0-11 | [guia](../guias-bk/MF0/BK-MF0-10-criar-e-gerir-fornecedores.md) |
| BK-MF0-11 | MF0 | Criar artigos/serviços (SKU, custo, preço, IVA). | Andre | Oleksii | P0 | TODO | M | - | RF11 | Fase 1 | BK-MF0-12 | [guia](../guias-bk/MF0/BK-MF0-11-criar-artigos-servicos-sku-custo-preco-iva.md) |
| BK-MF0-12 | MF0 | Criar armazéns e localizações. | Sofia | Oleksii | P1 | TODO | S | - | RF12 | Fase 1 | BK-MF1-01 | [guia](../guias-bk/MF0/BK-MF0-12-criar-armazens-e-localizacoes.md) |
| BK-MF1-01 | MF1 | Configurar tabelas de IVA (taxas, isenções, códigos). | Oleksii | Andre | P0 | TODO | M | - | RF13 | Fase 1 | BK-MF1-02 | [guia](../guias-bk/MF1/BK-MF1-01-configurar-tabelas-de-iva-taxas-isencoes-codigos.md) |
| BK-MF1-02 | MF1 | Emitir Fatura, Fatura-Recibo, Nota de Crédito, com numeração sequencial. | Oleksii | Andre | P0 | TODO | M | BK-MF0-09, BK-MF0-11, BK-MF1-01 | RF14 | Fase 1 | BK-MF1-03 | [guia](../guias-bk/MF1/BK-MF1-02-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md) |
| BK-MF1-03 | MF1 | Registar recebimentos (parciais/totais). | Pedro | Andre | P0 | TODO | M | - | RF15 | Fase 1 | BK-MF1-04 | [guia](../guias-bk/MF1/BK-MF1-03-registar-recebimentos-parciais-totais.md) |
| BK-MF1-04 | MF1 | Gerar lançamentos contabilísticos automáticos por venda. | Oleksii | Andre | P0 | TODO | M | BK-MF1-02 | RF16 | Fase 1 | BK-MF1-05 | [guia](../guias-bk/MF1/BK-MF1-04-gerar-lancamentos-contabilisticos-automaticos-por-venda.md) |
| BK-MF1-05 | MF1 | Consultar títulos em aberto e antiguidade de saldos. | Oleksii | Pedro | P1 | TODO | S | - | RF17 | Fase 1 | BK-MF1-06 | [guia](../guias-bk/MF1/BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md) |
| BK-MF1-06 | MF1 | Submeter documentos de venda para aprovação antes de emissão definitiva. | Andre | Oleksii | P1 | TODO | S | BK-MF1-02 | RF18 | Fase 1 | BK-MF1-07 | [guia](../guias-bk/MF1/BK-MF1-06-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiva.md) |
| BK-MF1-07 | MF1 | Registar Fatura de Fornecedor e Nota de Crédito. | Oleksii | Andre | P0 | TODO | M | BK-MF0-10, BK-MF0-11, BK-MF1-01 | RF19 | Fase 1 | BK-MF1-08 | [guia](../guias-bk/MF1/BK-MF1-07-registar-fatura-de-fornecedor-e-nota-de-credito.md) |
| BK-MF1-08 | MF1 | Registar pagamentos (parciais/totais). | Pedro | Andre | P0 | TODO | M | BK-MF1-07 | RF20 | Fase 1 | BK-MF1-09 | [guia](../guias-bk/MF1/BK-MF1-08-registar-pagamentos-parciais-totais.md) |
| BK-MF1-09 | MF1 | Gerar lançamentos contabilísticos automáticos de compras. | Oleksii | Andre | P0 | TODO | M | BK-MF1-07 | RF21 | Fase 1 | BK-MF1-10 | [guia](../guias-bk/MF1/BK-MF1-09-gerar-lancamentos-contabilisticos-automaticos-de-compras.md) |
| BK-MF1-10 | MF1 | Aprovação de compras com estados “Rascunho → Aprovado → Lançado”. | Andre | Oleksii | P1 | TODO | S | - | RF22 | Fase 1 | BK-MF2-01 | [guia](../guias-bk/MF1/BK-MF1-10-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md) |
| BK-MF2-01 | MF2 | Histórico e justificações para aprovações/reprovações. | Sofia | Oleksii | P1 | TODO | S | BK-MF1-10 | RF23 | Fase 1 | BK-MF2-02 | [guia](../guias-bk/MF2/BK-MF2-01-historico-e-justificacoes-para-aprovacoes-reprovacoes.md) |
| BK-MF2-02 | MF2 | Movimentos de stock: entradas, saídas, transferências, devoluções. | Oleksii | Andre | P0 | TODO | M | BK-MF0-11, BK-MF0-12 | RF24 | Fase 1 | BK-MF2-03 | [guia](../guias-bk/MF2/BK-MF2-02-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md) |
| BK-MF2-03 | MF2 | Cálculo de custo (FIFO). | Oleksii | Pedro | P0 | TODO | M | BK-MF2-02 | RF25 | Fase 1 | BK-MF2-04 | [guia](../guias-bk/MF2/BK-MF2-03-calculo-de-custo-fifo.md) |
| BK-MF2-04 | MF2 | Contagem física e ajustes. | Andre | Oleksii | P1 | TODO | S | BK-MF2-02 | RF26 | Fase 1 | BK-MF2-05 | [guia](../guias-bk/MF2/BK-MF2-04-contagem-fisica-e-ajustes.md) |
| BK-MF2-05 | MF2 | Alertas de stock (mínimos, máximos, artigos parados). | Pedro | Andre | P1 | TODO | S | BK-MF2-02 | RF27 | Fase 1 | BK-MF2-06 | [guia](../guias-bk/MF2/BK-MF2-05-alertas-de-stock-minimos-maximos-artigos-parados.md) |
| BK-MF2-06 | MF2 | Criar e editar lançamentos manuais (com anexos). | Oleksii | Pedro | P0 | TODO | M | BK-MF0-07 | RF28 | Fase 1 | BK-MF2-07 | [guia](../guias-bk/MF2/BK-MF2-06-criar-e-editar-lancamentos-manuais-com-anexos.md) |
| BK-MF2-07 | MF2 | Consultar balancete e razão exportável (PDF/Excel). | Andre | Oleksii | P0 | TODO | M | BK-MF2-06 | RF29 | Fase 1 | BK-MF2-08 | [guia](../guias-bk/MF2/BK-MF2-07-consultar-balancete-e-razao-exportavel-pdf-excel.md) |
| BK-MF2-08 | MF2 | Gerar Demonstração de Resultados e Balanço. | Pedro | Andre | P0 | TODO | M | BK-MF2-07 | RF30 | Fase 1 | BK-MF3-01 | [guia](../guias-bk/MF2/BK-MF2-08-gerar-demonstracao-de-resultados-e-balanco.md) |
| BK-MF3-01 | MF3 | Gerar Mapas de IVA (liquidado/dedutível). | Oleksii | Andre | P0 | TODO | M | BK-MF1-04, BK-MF1-09 | RF31 | Fase 2 | BK-MF3-02 | [guia](../guias-bk/MF3/BK-MF3-01-gerar-mapas-de-iva-liquidado-dedutivel.md) |
| BK-MF3-02 | MF3 | Criar contas bancárias/caixa e respetivos saldos. | Andre | Oleksii | P0 | TODO | M | - | RF32 | Fase 2 | BK-MF3-03 | [guia](../guias-bk/MF3/BK-MF3-02-criar-contas-bancarias-caixa-e-respetivos-saldos.md) |
| BK-MF3-03 | MF3 | Importar extratos bancários (CSV/OFX) e fazer reconciliação automática. | Oleksii | Pedro | P0 | TODO | M | BK-MF3-02, BK-MF1-02, BK-MF1-07 | RF33 | Fase 2 | BK-MF3-04 | [guia](../guias-bk/MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md) |
| BK-MF3-04 | MF3 | Gerar previsão de tesouraria (entradas e saídas futuras). | Oleksii | Pedro | P1 | TODO | S | BK-MF1-03, BK-MF1-08 | RF34 | Fase 2 | BK-MF3-05 | [guia](../guias-bk/MF3/BK-MF3-04-gerar-previsao-de-tesouraria-entradas-e-saidas-futuras.md) |
| BK-MF3-05 | MF3 | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. | Pedro | Andre | P1 | TODO | S | - | RF35 | Fase 2 | BK-MF3-06 | [guia](../guias-bk/MF3/BK-MF3-05-importar-csv-excel-de-clientes-fornecedores-artigos-e-extratos.md) |
| BK-MF3-06 | MF3 | Exportar SAF-T (PT) de faturação e contabilidade. | Oleksii | Sofia | P0 | TODO | M | - | RF36 | Fase 2 | BK-MF3-07 | [guia](../guias-bk/MF3/BK-MF3-06-exportar-saf-t-pt-de-faturacao-e-contabilidade.md) |
| BK-MF3-07 | MF3 | Relatórios de vendas, compras, margens e stock. | Andre | Oleksii | P0 | TODO | M | BK-MF1-02, BK-MF1-07, BK-MF2-02 | RF37 | Fase 2 | BK-MF3-08 | [guia](../guias-bk/MF3/BK-MF3-07-relatorios-de-vendas-compras-margens-e-stock.md) |
| BK-MF3-08 | MF3 | KPIs executivos (receita, custos, EBITDA, PMR, PMP). | Andre | Oleksii | P1 | TODO | S | BK-MF3-07 | RF38 | Fase 2 | BK-MF4-01 | [guia](../guias-bk/MF3/BK-MF3-08-kpis-executivos-receita-custos-ebitda-pmr-pmp.md) |
| BK-MF4-01 | MF4 | Gerar insights automáticos (tendências, riscos, clientes, artigos parados). | Oleksii | Pedro | P0 | TODO | M | BK-MF3-07 | RF39 | Fase 2 | BK-MF4-02 | [guia](../guias-bk/MF4/BK-MF4-01-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados.md) |
| BK-MF4-02 | MF4 | Sugerir ações (ajustar preços, negociar fornecedor, repor stock). | Sofia | Oleksii | P1 | TODO | S | BK-MF4-01 | RF40 | Fase 2 | BK-MF4-03 | [guia](../guias-bk/MF4/BK-MF4-02-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock.md) |
| BK-MF4-03 | MF4 | Permitir perguntas em linguagem natural e responder com dados e fonte. | Andre | Oleksii | P1 | TODO | S | BK-MF3-07 | RF41 | Fase 2 | BK-MF4-04 | [guia](../guias-bk/MF4/BK-MF4-03-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte.md) |
| BK-MF4-04 | MF4 | Emitir alertas inteligentes (cashflow, desvios, ruturas). | Pedro | Andre | P1 | TODO | S | BK-MF3-04, BK-MF2-05 | RF42 | Fase 2 | BK-MF4-05 | [guia](../guias-bk/MF4/BK-MF4-04-emitir-alertas-inteligentes-cashflow-desvios-ruturas.md) |
| BK-MF4-05 | MF4 | Mostrar explicações e fontes de cada insight. | Oleksii | Sofia | P0 | TODO | M | BK-MF4-01 | RF43 | Fase 2 | BK-MF4-06 | [guia](../guias-bk/MF4/BK-MF4-05-mostrar-explicacoes-e-fontes-de-cada-insight.md) |
| BK-MF4-06 | MF4 | Criar/editar lembretes essenciais (prazos, pagamentos e impostos). | Sofia | Oleksii | P1 | TODO | S | - | RF44 | Fase 2 | BK-MF4-07 | [guia](../guias-bk/MF4/BK-MF4-06-criar-editar-lembretes-essenciais-prazos-pagamentos-e-impostos.md) |
| BK-MF4-07 | MF4 | Criar e atribuir tarefas essenciais com estado e prazo. | Andre | Oleksii | P1 | TODO | S | - | RF45 | Fase 2 | BK-MF4-08 | [guia](../guias-bk/MF4/BK-MF4-07-criar-e-atribuir-tarefas-essenciais-com-estado-e-prazo.md) |
| BK-MF4-08 | MF4 | Notificações in-app para lembretes e alertas críticos da IA. | Pedro | Andre | P1 | TODO | S | BK-MF4-06, BK-MF4-04 | RF46 | Fase 2 | BK-MF4-09 | [guia](../guias-bk/MF4/BK-MF4-08-notificacoes-in-app-para-lembretes-e-alertas-criticos-da-ia.md) |
| BK-MF4-09 | MF4 | Registar auditoria: quem, quando, o quê, em operações sensíveis. | Andre | Oleksii | P0 | TODO | M | - | RF47 | Fase 2 | BK-MF4-10 | [guia](../guias-bk/MF4/BK-MF4-09-registar-auditoria-quem-quando-o-que-em-operacoes-sensiveis.md) |
| BK-MF4-10 | MF4 | Registar logs de integração (uploads, SAF-T, reconciliações). | Pedro | Andre | P0 | TODO | M | - | RF48 | Fase 2 | BK-MF5-01 | [guia](../guias-bk/MF4/BK-MF4-10-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md) |
| BK-MF5-01 | MF5 | Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade). | Oleksii | Sofia | P0 | TODO | M | - | RNF01 | Fase 2 | BK-MF5-02 | [guia](../guias-bk/MF5/BK-MF5-01-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-inventario-contabilidade.md) |
| BK-MF5-02 | MF5 | Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas. | Andre | Oleksii | P0 | TODO | M | - | RNF02 | Fase 2 | BK-MF5-03 | [guia](../guias-bk/MF5/BK-MF5-02-layout-responsivo-desktop-tablet-mobile-com-grelhas-e-tabelas-adaptadas.md) |
| BK-MF5-03 | MF5 | A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads). | Pedro | Andre | P0 | TODO | M | - | RNF03 | Fase 2 | BK-MF5-04 | [guia](../guias-bk/MF5/BK-MF5-03-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-validar-uploads.md) |
| BK-MF5-04 | MF5 | Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade). | Pedro | Andre | P1 | TODO | S | - | RNF04 | Fase 2 | BK-MF5-05 | [guia](../guias-bk/MF5/BK-MF5-04-cumprir-regras-basicas-de-acessibilidade-contraste-headings-legibilidade.md) |
| BK-MF5-05 | MF5 | Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC). | Oleksii | Pedro | P0 | TODO | M | - | RNF05 | Fase 2 | BK-MF5-06 | [guia](../guias-bk/MF5/BK-MF5-05-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-iva-contas-snc.md) |
| BK-MF5-06 | MF5 | As mensagens de erro devem ser claras e indicar como resolver o problema. | Andre | Oleksii | P0 | TODO | M | - | RNF06 | Fase 2 | BK-MF5-07 | [guia](../guias-bk/MF5/BK-MF5-06-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md) |
| BK-MF5-07 | MF5 | Dashboard e listagens devem carregar em ≤ 2 segundos. | Oleksii | Pedro | P0 | TODO | M | - | RNF07 | Fase 2 | BK-MF6-01 | [guia](../guias-bk/MF5/BK-MF5-07-dashboard-e-listagens-devem-carregar-em-2-segundos.md) |
| BK-MF6-01 | MF6 | Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo. | Oleksii | Andre | P0 | TODO | M | - | RNF08 | Fase 3 | BK-MF6-02 | [guia](../guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md) |
| BK-MF6-02 | MF6 | Suportar ≥ 25 utilizadores simultâneos por empresa sem degradação relevante. | Sofia | Pedro | P1 | TODO | S | - | RNF09 | Fase 3 | BK-MF6-03 | [guia](../guias-bk/MF6/BK-MF6-02-suportar-25-utilizadores-simultaneos-por-empresa-sem-degradacao-relevante.md) |
| BK-MF6-03 | MF6 | Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos. | Oleksii | Pedro | P1 | TODO | S | - | RNF10 | Fase 3 | BK-MF6-04 | [guia](../guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md) |
| BK-MF6-04 | MF6 | Cálculo de custo (FIFO) deve manter correção e não bloquear operações críticas. | Andre | Oleksii | P1 | TODO | S | - | RNF11 | Fase 3 | BK-MF6-05 | [guia](../guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md) |
| BK-MF6-05 | MF6 | Toda a comunicação deve usar HTTPS (TLS 1.2+). | Andre | Oleksii | P0 | TODO | M | - | RNF12 | Fase 3 | BK-MF6-06 | [guia](../guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md) |
| BK-MF6-06 | MF6 | Passwords devem usar bcrypt com salt seguro. | Andre | Pedro | P0 | TODO | M | - | RNF13 | Fase 3 | BK-MF6-07 | [guia](../guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md) |
| BK-MF6-07 | MF6 | Sessões com cookies HttpOnly + Secure + SameSite. | Oleksii | Andre | P0 | TODO | M | - | RNF14 | Fase 3 | BK-MF6-08 | [guia](../guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md) |
| BK-MF6-08 | MF6 | Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force). | Oleksii | Andre | P0 | TODO | M | - | RNF15 | Fase 3 | BK-MF6-09 | [guia](../guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md) |
| BK-MF6-09 | MF6 | Chaves de API e credenciais apenas em variáveis de ambiente. | Pedro | Andre | P0 | TODO | M | - | RNF16 | Fase 3 | BK-MF6-10 | [guia](../guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md) |
| BK-MF6-10 | MF6 | Auditoria obrigatória em operações sensíveis. | Oleksii | Sofia | P0 | TODO | M | - | RNF17 | Fase 3 | BK-MF7-01 | [guia](../guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md) |
| BK-MF7-01 | MF7 | Backups automáticos diários com restauração possível. | Pedro | Andre | P1 | TODO | S | - | RNF18 | Fase 3 | BK-MF7-02 | [guia](../guias-bk/MF7/BK-MF7-01-backups-automaticos-diarios-com-restauracao-possivel.md) |
| BK-MF7-02 | MF7 | Cumprir obrigações legais de retenção (10 anos, contabilidade). | Andre | Oleksii | P0 | TODO | M | - | RNF19 | Fase 3 | BK-MF7-03 | [guia](../guias-bk/MF7/BK-MF7-02-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md) |
| BK-MF7-03 | MF7 | Compatível com Chrome, Edge e Firefox. | Pedro | Andre | P0 | TODO | M | - | RNF20 | Fase 3 | BK-MF7-04 | [guia](../guias-bk/MF7/BK-MF7-03-compativel-com-chrome-edge-e-firefox.md) |
| BK-MF7-04 | MF7 | Integração com serviços de email (recuperação de password, alertas). | Sofia | Pedro | P0 | TODO | M | - | RNF21 | Fase 3 | BK-MF7-05 | [guia](../guias-bk/MF7/BK-MF7-04-integracao-com-servicos-de-email-recuperacao-de-password-alertas.md) |
| BK-MF7-05 | MF7 | Exportações disponíveis em CSV, Excel e PDF. | Sofia | Pedro | P1 | TODO | S | - | RNF22 | Fase 3 | BK-MF7-06 | [guia](../guias-bk/MF7/BK-MF7-05-exportacoes-disponiveis-em-csv-excel-e-pdf.md) |
| BK-MF7-06 | MF7 | Importações CSV/Excel com validação e logs de erro. | Oleksii | Pedro | P0 | TODO | M | - | RNF23 | Fase 3 | BK-MF7-07 | [guia](../guias-bk/MF7/BK-MF7-06-importacoes-csv-excel-com-validacao-e-logs-de-erro.md) |
| BK-MF7-07 | MF7 | Geração de SAF-T conforme especificações legais (PT). | Andre | Oleksii | P0 | TODO | M | - | RNF24 | Fase 3 | BK-MF7-08 | [guia](../guias-bk/MF7/BK-MF7-07-geracao-de-saf-t-conforme-especificacoes-legais-pt.md) |
| BK-MF7-08 | MF7 | Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA). | Oleksii | Pedro | P0 | TODO | M | - | RNF25 | Fase 3 | BK-MF7-09 | [guia](../guias-bk/MF7/BK-MF7-08-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabilidade-ia.md) |
| BK-MF7-09 | MF7 | Frontend modular com componentes reutilizáveis. | Andre | Sofia | P0 | TODO | M | - | RNF26 | Fase 3 | BK-MF7-10 | [guia](../guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md) |
| BK-MF7-10 | MF7 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Oleksii | Andre | P1 | TODO | S | - | RNF27 | Fase 3 | BK-MF8-01 | [guia](../guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md) |
| BK-MF8-01 | MF8 | Logs estruturados (info, warn, error, audit). | Oleksii | Pedro | P0 | TODO | M | - | RNF28 | Fase 3 | BK-MF8-02 | [guia](../guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md) |
| BK-MF8-02 | MF8 | Endpoint de health-check. | Pedro | Andre | P1 | TODO | S | - | RNF29 | Fase 3 | BK-MF8-03 | [guia](../guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md) |
| BK-MF8-03 | MF8 | Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico). | Sofia | Oleksii | P1 | TODO | S | - | RNF30 | Fase 3 | BK-MF8-04 | [guia](../guias-bk/MF8/BK-MF8-03-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md) |
| BK-MF8-04 | MF8 | Insights devem incluir explicação e origem dos dados usados. | Andre | Oleksii | P0 | TODO | M | - | RNF31 | Fase 3 | BK-MF8-05 | [guia](../guias-bk/MF8/BK-MF8-04-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md) |
| BK-MF8-05 | MF8 | IA não altera dados contabilísticos; apenas analisa e recomenda. | Oleksii | Pedro | P0 | TODO | M | - | RNF32 | Fase 3 | BK-MF8-06 | [guia](../guias-bk/MF8/BK-MF8-05-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md) |
| BK-MF8-06 | MF8 | Alertas configuráveis (ativar/desativar tipos). | Andre | Oleksii | P1 | TODO | S | - | RNF33 | Fase 3 | BK-MF8-07 | [guia](../guias-bk/MF8/BK-MF8-06-alertas-configuraveis-ativar-desativar-tipos.md) |
| BK-MF8-07 | MF8 | IA deve evitar enviesamentos e sugerir ações baseadas em dados reais. | Pedro | Andre | P1 | TODO | S | - | RNF34 | Fase 3 | BK-MF8-08 | [guia](../guias-bk/MF8/BK-MF8-07-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md) |
| BK-MF8-08 | MF8 | Interface em português de Portugal. | Sofia | Pedro | P0 | TODO | M | - | RNF35 | Fase 3 | BK-MF8-09 | [guia](../guias-bk/MF8/BK-MF8-08-interface-em-portugues-de-portugal.md) |
| BK-MF8-09 | MF8 | Datas, moedas e separadores no padrão europeu. | Sofia | Pedro | P1 | TODO | S | - | RNF36 | Fase 3 | - | [guia](../guias-bk/MF8/BK-MF8-09-datas-moedas-e-separadores-no-padrao-europeu.md) |

## MF0 - Fundamentos e governance
| bk_id | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | proximo_bk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | Registo, login e logout com cookies HttpOnly. | Oleksii | Andre | P0 | TODO | M | - | RF01 | BK-MF0-02 |
| BK-MF0-02 | Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor). | Oleksii | Andre | P0 | TODO | M | BK-MF0-01 | RF02 | BK-MF0-03 |
| BK-MF0-03 | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). | Oleksii | Andre | P0 | TODO | M | BK-MF0-02 | RF03 | BK-MF0-04 |
| BK-MF0-04 | Gestão de utilizadores: convite, remoção e definição de papéis. | Oleksii | Andre | P0 | TODO | M | BK-MF0-03 | RF04 | BK-MF0-05 |
| BK-MF0-05 | Recuperação de password via email. | Oleksii | Pedro | P0 | TODO | M | - | RF05 | BK-MF0-06 |
| BK-MF0-06 | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). | Oleksii | Sofia | P0 | TODO | M | - | RF06 | BK-MF0-07 |
| BK-MF0-07 | Criar/importar plano de contas (SNC). | Oleksii | Andre | P0 | TODO | M | - | RF07 | BK-MF0-08 |
| BK-MF0-08 | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho. | Oleksii | Pedro | P0 | TODO | M | BK-MF0-07 | RF08 | BK-MF0-09 |
| BK-MF0-09 | Criar e gerir clientes. | Andre | Oleksii | P0 | TODO | M | - | RF09 | BK-MF0-10 |
| BK-MF0-10 | Criar e gerir fornecedores. | Pedro | Oleksii | P0 | TODO | M | - | RF10 | BK-MF0-11 |
| BK-MF0-11 | Criar artigos/serviços (SKU, custo, preço, IVA). | Andre | Oleksii | P0 | TODO | M | - | RF11 | BK-MF0-12 |
| BK-MF0-12 | Criar armazéns e localizações. | Sofia | Oleksii | P1 | TODO | S | - | RF12 | BK-MF1-01 |

## MF1 - Nucleo funcional I
| bk_id | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | proximo_bk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF1-01 | Configurar tabelas de IVA (taxas, isenções, códigos). | Oleksii | Andre | P0 | TODO | M | - | RF13 | BK-MF1-02 |
| BK-MF1-02 | Emitir Fatura, Fatura-Recibo, Nota de Crédito, com numeração sequencial. | Oleksii | Andre | P0 | TODO | M | BK-MF0-09, BK-MF0-11, BK-MF1-01 | RF14 | BK-MF1-03 |
| BK-MF1-03 | Registar recebimentos (parciais/totais). | Pedro | Andre | P0 | TODO | M | - | RF15 | BK-MF1-04 |
| BK-MF1-04 | Gerar lançamentos contabilísticos automáticos por venda. | Oleksii | Andre | P0 | TODO | M | BK-MF1-02 | RF16 | BK-MF1-05 |
| BK-MF1-05 | Consultar títulos em aberto e antiguidade de saldos. | Oleksii | Pedro | P1 | TODO | S | - | RF17 | BK-MF1-06 |
| BK-MF1-06 | Submeter documentos de venda para aprovação antes de emissão definitiva. | Andre | Oleksii | P1 | TODO | S | BK-MF1-02 | RF18 | BK-MF1-07 |
| BK-MF1-07 | Registar Fatura de Fornecedor e Nota de Crédito. | Oleksii | Andre | P0 | TODO | M | BK-MF0-10, BK-MF0-11, BK-MF1-01 | RF19 | BK-MF1-08 |
| BK-MF1-08 | Registar pagamentos (parciais/totais). | Pedro | Andre | P0 | TODO | M | BK-MF1-07 | RF20 | BK-MF1-09 |
| BK-MF1-09 | Gerar lançamentos contabilísticos automáticos de compras. | Oleksii | Andre | P0 | TODO | M | BK-MF1-07 | RF21 | BK-MF1-10 |
| BK-MF1-10 | Aprovação de compras com estados “Rascunho → Aprovado → Lançado”. | Andre | Oleksii | P1 | TODO | S | - | RF22 | BK-MF2-01 |

## MF2 - Nucleo funcional II
| bk_id | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | proximo_bk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF2-01 | Histórico e justificações para aprovações/reprovações. | Sofia | Oleksii | P1 | TODO | S | BK-MF1-10 | RF23 | BK-MF2-02 |
| BK-MF2-02 | Movimentos de stock: entradas, saídas, transferências, devoluções. | Oleksii | Andre | P0 | TODO | M | BK-MF0-11, BK-MF0-12 | RF24 | BK-MF2-03 |
| BK-MF2-03 | Cálculo de custo (FIFO). | Oleksii | Pedro | P0 | TODO | M | BK-MF2-02 | RF25 | BK-MF2-04 |
| BK-MF2-04 | Contagem física e ajustes. | Andre | Oleksii | P1 | TODO | S | BK-MF2-02 | RF26 | BK-MF2-05 |
| BK-MF2-05 | Alertas de stock (mínimos, máximos, artigos parados). | Pedro | Andre | P1 | TODO | S | BK-MF2-02 | RF27 | BK-MF2-06 |
| BK-MF2-06 | Criar e editar lançamentos manuais (com anexos). | Oleksii | Pedro | P0 | TODO | M | BK-MF0-07 | RF28 | BK-MF2-07 |
| BK-MF2-07 | Consultar balancete e razão exportável (PDF/Excel). | Andre | Oleksii | P0 | TODO | M | BK-MF2-06 | RF29 | BK-MF2-08 |
| BK-MF2-08 | Gerar Demonstração de Resultados e Balanço. | Pedro | Andre | P0 | TODO | M | BK-MF2-07 | RF30 | BK-MF3-01 |

## MF3 - Capacidades de produto I
| bk_id | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | proximo_bk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF3-01 | Gerar Mapas de IVA (liquidado/dedutível). | Oleksii | Andre | P0 | TODO | M | BK-MF1-04, BK-MF1-09 | RF31 | BK-MF3-02 |
| BK-MF3-02 | Criar contas bancárias/caixa e respetivos saldos. | Andre | Oleksii | P0 | TODO | M | - | RF32 | BK-MF3-03 |
| BK-MF3-03 | Importar extratos bancários (CSV/OFX) e fazer reconciliação automática. | Oleksii | Pedro | P0 | TODO | M | BK-MF3-02, BK-MF1-02, BK-MF1-07 | RF33 | BK-MF3-04 |
| BK-MF3-04 | Gerar previsão de tesouraria (entradas e saídas futuras). | Oleksii | Pedro | P1 | TODO | S | BK-MF1-03, BK-MF1-08 | RF34 | BK-MF3-05 |
| BK-MF3-05 | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. | Pedro | Andre | P1 | TODO | S | - | RF35 | BK-MF3-06 |
| BK-MF3-06 | Exportar SAF-T (PT) de faturação e contabilidade. | Oleksii | Sofia | P0 | TODO | M | - | RF36 | BK-MF3-07 |
| BK-MF3-07 | Relatórios de vendas, compras, margens e stock. | Andre | Oleksii | P0 | TODO | M | BK-MF1-02, BK-MF1-07, BK-MF2-02 | RF37 | BK-MF3-08 |
| BK-MF3-08 | KPIs executivos (receita, custos, EBITDA, PMR, PMP). | Andre | Oleksii | P1 | TODO | S | BK-MF3-07 | RF38 | BK-MF4-01 |

## MF4 - Capacidades de produto II
| bk_id | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | proximo_bk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF4-01 | Gerar insights automáticos (tendências, riscos, clientes, artigos parados). | Oleksii | Pedro | P0 | TODO | M | BK-MF3-07 | RF39 | BK-MF4-02 |
| BK-MF4-02 | Sugerir ações (ajustar preços, negociar fornecedor, repor stock). | Sofia | Oleksii | P1 | TODO | S | BK-MF4-01 | RF40 | BK-MF4-03 |
| BK-MF4-03 | Permitir perguntas em linguagem natural e responder com dados e fonte. | Andre | Oleksii | P1 | TODO | S | BK-MF3-07 | RF41 | BK-MF4-04 |
| BK-MF4-04 | Emitir alertas inteligentes (cashflow, desvios, ruturas). | Pedro | Andre | P1 | TODO | S | BK-MF3-04, BK-MF2-05 | RF42 | BK-MF4-05 |
| BK-MF4-05 | Mostrar explicações e fontes de cada insight. | Oleksii | Sofia | P0 | TODO | M | BK-MF4-01 | RF43 | BK-MF4-06 |
| BK-MF4-06 | Criar/editar lembretes essenciais (prazos, pagamentos e impostos). | Sofia | Oleksii | P1 | TODO | S | - | RF44 | BK-MF4-07 |
| BK-MF4-07 | Criar e atribuir tarefas essenciais com estado e prazo. | Andre | Oleksii | P1 | TODO | S | - | RF45 | BK-MF4-08 |
| BK-MF4-08 | Notificações in-app para lembretes e alertas críticos da IA. | Pedro | Andre | P1 | TODO | S | BK-MF4-06, BK-MF4-04 | RF46 | BK-MF4-09 |
| BK-MF4-09 | Registar auditoria: quem, quando, o quê, em operações sensíveis. | Andre | Oleksii | P0 | TODO | M | - | RF47 | BK-MF4-10 |
| BK-MF4-10 | Registar logs de integração (uploads, SAF-T, reconciliações). | Pedro | Andre | P0 | TODO | M | - | RF48 | BK-MF5-01 |

## MF5 - Operacao e fluxos transversais
| bk_id | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | proximo_bk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF5-01 | Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade). | Oleksii | Sofia | P0 | TODO | M | - | RNF01 | BK-MF5-02 |
| BK-MF5-02 | Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas. | Andre | Oleksii | P0 | TODO | M | - | RNF02 | BK-MF5-03 |
| BK-MF5-03 | A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads). | Pedro | Andre | P0 | TODO | M | - | RNF03 | BK-MF5-04 |
| BK-MF5-04 | Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade). | Pedro | Andre | P1 | TODO | S | - | RNF04 | BK-MF5-05 |
| BK-MF5-05 | Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC). | Oleksii | Pedro | P0 | TODO | M | - | RNF05 | BK-MF5-06 |
| BK-MF5-06 | As mensagens de erro devem ser claras e indicar como resolver o problema. | Andre | Oleksii | P0 | TODO | M | - | RNF06 | BK-MF5-07 |
| BK-MF5-07 | Dashboard e listagens devem carregar em ≤ 2 segundos. | Oleksii | Pedro | P0 | TODO | M | - | RNF07 | BK-MF6-01 |

## MF6 - Qualidade e robustez
| bk_id | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | proximo_bk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF6-01 | Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo. | Oleksii | Andre | P0 | TODO | M | - | RNF08 | BK-MF6-02 |
| BK-MF6-02 | Suportar ≥ 25 utilizadores simultâneos por empresa sem degradação relevante. | Sofia | Pedro | P1 | TODO | S | - | RNF09 | BK-MF6-03 |
| BK-MF6-03 | Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos. | Oleksii | Pedro | P1 | TODO | S | - | RNF10 | BK-MF6-04 |
| BK-MF6-04 | Cálculo de custo (FIFO) deve manter correção e não bloquear operações críticas. | Andre | Oleksii | P1 | TODO | S | - | RNF11 | BK-MF6-05 |
| BK-MF6-05 | Toda a comunicação deve usar HTTPS (TLS 1.2+). | Andre | Oleksii | P0 | TODO | M | - | RNF12 | BK-MF6-06 |
| BK-MF6-06 | Passwords devem usar bcrypt com salt seguro. | Andre | Pedro | P0 | TODO | M | - | RNF13 | BK-MF6-07 |
| BK-MF6-07 | Sessões com cookies HttpOnly + Secure + SameSite. | Oleksii | Andre | P0 | TODO | M | - | RNF14 | BK-MF6-08 |
| BK-MF6-08 | Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force). | Oleksii | Andre | P0 | TODO | M | - | RNF15 | BK-MF6-09 |
| BK-MF6-09 | Chaves de API e credenciais apenas em variáveis de ambiente. | Pedro | Andre | P0 | TODO | M | - | RNF16 | BK-MF6-10 |
| BK-MF6-10 | Auditoria obrigatória em operações sensíveis. | Oleksii | Sofia | P0 | TODO | M | - | RNF17 | BK-MF7-01 |

## MF7 - Privacidade, seguranca e controlo
| bk_id | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | proximo_bk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF7-01 | Backups automáticos diários com restauração possível. | Pedro | Andre | P1 | TODO | S | - | RNF18 | BK-MF7-02 |
| BK-MF7-02 | Cumprir obrigações legais de retenção (10 anos, contabilidade). | Andre | Oleksii | P0 | TODO | M | - | RNF19 | BK-MF7-03 |
| BK-MF7-03 | Compatível com Chrome, Edge e Firefox. | Pedro | Andre | P0 | TODO | M | - | RNF20 | BK-MF7-04 |
| BK-MF7-04 | Integração com serviços de email (recuperação de password, alertas). | Sofia | Pedro | P0 | TODO | M | - | RNF21 | BK-MF7-05 |
| BK-MF7-05 | Exportações disponíveis em CSV, Excel e PDF. | Sofia | Pedro | P1 | TODO | S | - | RNF22 | BK-MF7-06 |
| BK-MF7-06 | Importações CSV/Excel com validação e logs de erro. | Oleksii | Pedro | P0 | TODO | M | - | RNF23 | BK-MF7-07 |
| BK-MF7-07 | Geração de SAF-T conforme especificações legais (PT). | Andre | Oleksii | P0 | TODO | M | - | RNF24 | BK-MF7-08 |
| BK-MF7-08 | Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA). | Oleksii | Pedro | P0 | TODO | M | - | RNF25 | BK-MF7-09 |
| BK-MF7-09 | Frontend modular com componentes reutilizáveis. | Andre | Sofia | P0 | TODO | M | - | RNF26 | BK-MF7-10 |
| BK-MF7-10 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Oleksii | Andre | P1 | TODO | S | - | RNF27 | BK-MF8-01 |

## MF8 - Integracoes, compatibilidade e fecho
| bk_id | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | proximo_bk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF8-01 | Logs estruturados (info, warn, error, audit). | Oleksii | Pedro | P0 | TODO | M | - | RNF28 | BK-MF8-02 |
| BK-MF8-02 | Endpoint de health-check. | Pedro | Andre | P1 | TODO | S | - | RNF29 | BK-MF8-03 |
| BK-MF8-03 | Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico). | Sofia | Oleksii | P1 | TODO | S | - | RNF30 | BK-MF8-04 |
| BK-MF8-04 | Insights devem incluir explicação e origem dos dados usados. | Andre | Oleksii | P0 | TODO | M | - | RNF31 | BK-MF8-05 |
| BK-MF8-05 | IA não altera dados contabilísticos; apenas analisa e recomenda. | Oleksii | Pedro | P0 | TODO | M | - | RNF32 | BK-MF8-06 |
| BK-MF8-06 | Alertas configuráveis (ativar/desativar tipos). | Andre | Oleksii | P1 | TODO | S | - | RNF33 | BK-MF8-07 |
| BK-MF8-07 | IA deve evitar enviesamentos e sugerir ações baseadas em dados reais. | Pedro | Andre | P1 | TODO | S | - | RNF34 | BK-MF8-08 |
| BK-MF8-08 | Interface em português de Portugal. | Sofia | Pedro | P0 | TODO | M | - | RNF35 | BK-MF8-09 |
| BK-MF8-09 | Datas, moedas e separadores no padrão europeu. | Sofia | Pedro | P1 | TODO | S | - | RNF36 | - |
