# MF-VIEWS

## Header
- `doc_id`: `MF-VIEWS`
- `path`: `docs/planificacao/backlogs/MF-VIEWS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Sequencia macro
MF0 -> MF1 -> MF2 -> MF3 -> MF4 -> MF5 -> MF6 -> MF7 -> MF8

## Regra de execucao para Muito Alto
- Executar cada BK com foco em entrega funcional + robustez tecnica + evidencia de defesa.
- Nao transitar de macro sem checklist `Core` nos BK criticos e `Reforco` nos BK `P0`.
- Manter alinhamento continuo entre guia BK, backlog e matriz comparativa.
- Aplicar gate pedagogico por sprint: sem `Core` concluido na sprint N, o `Reforco` da N+1 nao inicia.

## Gates por macro
- Gate de entrada: dependencias desbloqueadas e contexto tecnico lido.
- Gate de execucao: smoke + negativos aprovados por BK (P0>=3; P1>=2; P2>=1).
- Gate de saida: criterios de aceite mensuraveis, evidence completa e handoff formal para macro seguinte.

## MF0 - Fundamentos e governance
### Sequencia por macro
BK-MF0-01, BK-MF0-02, BK-MF0-03, BK-MF0-04, BK-MF0-05, BK-MF0-06, BK-MF0-07, BK-MF0-08, BK-MF0-09, BK-MF0-10, BK-MF0-11, BK-MF0-12

### Guias disponiveis
- [BK-MF0-01 - Registo, login e logout com cookies HttpOnly.](../guias-bk/MF0/BK-MF0-01-registo-login-e-logout-com-cookies-httponly.md)
- [BK-MF0-02 - Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).](../guias-bk/MF0/BK-MF0-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md)
- [BK-MF0-03 - Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).](../guias-bk/MF0/BK-MF0-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empresas.md)
- [BK-MF0-04 - Gestão de utilizadores: convite, remoção e definição de papéis.](../guias-bk/MF0/BK-MF0-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md)
- [BK-MF0-05 - Recuperação de password via email.](../guias-bk/MF0/BK-MF0-05-recuperacao-de-password-via-email.md)
- [BK-MF0-06 - Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal).](../guias-bk/MF0/BK-MF0-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md)
- [BK-MF0-07 - Criar/importar plano de contas (SNC).](../guias-bk/MF0/BK-MF0-07-criar-importar-plano-de-contas-snc.md)
- [BK-MF0-08 - Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho.](../guias-bk/MF0/BK-MF0-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md)
- [BK-MF0-09 - Criar e gerir clientes.](../guias-bk/MF0/BK-MF0-09-criar-e-gerir-clientes.md)
- [BK-MF0-10 - Criar e gerir fornecedores.](../guias-bk/MF0/BK-MF0-10-criar-e-gerir-fornecedores.md)
- [BK-MF0-11 - Criar artigos/serviços (SKU, custo, preço, IVA).](../guias-bk/MF0/BK-MF0-11-criar-artigos-servicos-sku-custo-preco-iva.md)
- [BK-MF0-12 - Criar armazéns e localizações.](../guias-bk/MF0/BK-MF0-12-criar-armazens-e-localizacoes.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualizacao documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF1 - Nucleo funcional I
### Sequencia por macro
BK-MF1-01, BK-MF1-02, BK-MF1-03, BK-MF1-04, BK-MF1-05, BK-MF1-06, BK-MF1-07, BK-MF1-08, BK-MF1-09, BK-MF1-10

### Guias disponiveis
- [BK-MF1-01 - Configurar tabelas de IVA (taxas, isenções, códigos).](../guias-bk/MF1/BK-MF1-01-configurar-tabelas-de-iva-taxas-isencoes-codigos.md)
- [BK-MF1-02 - Emitir Fatura, Fatura-Recibo, Nota de Crédito, com numeração sequencial.](../guias-bk/MF1/BK-MF1-02-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md)
- [BK-MF1-03 - Registar recebimentos (parciais/totais).](../guias-bk/MF1/BK-MF1-03-registar-recebimentos-parciais-totais.md)
- [BK-MF1-04 - Gerar lançamentos contabilísticos automáticos por venda.](../guias-bk/MF1/BK-MF1-04-gerar-lancamentos-contabilisticos-automaticos-por-venda.md)
- [BK-MF1-05 - Consultar títulos em aberto e antiguidade de saldos.](../guias-bk/MF1/BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md)
- [BK-MF1-06 - Submeter documentos de venda para aprovação antes de emissão definitiva.](../guias-bk/MF1/BK-MF1-06-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiva.md)
- [BK-MF1-07 - Registar Fatura de Fornecedor e Nota de Crédito.](../guias-bk/MF1/BK-MF1-07-registar-fatura-de-fornecedor-e-nota-de-credito.md)
- [BK-MF1-08 - Registar pagamentos (parciais/totais).](../guias-bk/MF1/BK-MF1-08-registar-pagamentos-parciais-totais.md)
- [BK-MF1-09 - Gerar lançamentos contabilísticos automáticos de compras.](../guias-bk/MF1/BK-MF1-09-gerar-lancamentos-contabilisticos-automaticos-de-compras.md)
- [BK-MF1-10 - Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.](../guias-bk/MF1/BK-MF1-10-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualizacao documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF2 - Nucleo funcional II
### Sequencia por macro
BK-MF2-01, BK-MF2-02, BK-MF2-03, BK-MF2-04, BK-MF2-05, BK-MF2-06, BK-MF2-07, BK-MF2-08

### Guias disponiveis
- [BK-MF2-01 - Histórico e justificações para aprovações/reprovações.](../guias-bk/MF2/BK-MF2-01-historico-e-justificacoes-para-aprovacoes-reprovacoes.md)
- [BK-MF2-02 - Movimentos de stock: entradas, saídas, transferências, devoluções.](../guias-bk/MF2/BK-MF2-02-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md)
- [BK-MF2-03 - Cálculo de custo (FIFO).](../guias-bk/MF2/BK-MF2-03-calculo-de-custo-fifo.md)
- [BK-MF2-04 - Contagem física e ajustes.](../guias-bk/MF2/BK-MF2-04-contagem-fisica-e-ajustes.md)
- [BK-MF2-05 - Alertas de stock (mínimos, máximos, artigos parados).](../guias-bk/MF2/BK-MF2-05-alertas-de-stock-minimos-maximos-artigos-parados.md)
- [BK-MF2-06 - Criar e editar lançamentos manuais (com anexos).](../guias-bk/MF2/BK-MF2-06-criar-e-editar-lancamentos-manuais-com-anexos.md)
- [BK-MF2-07 - Consultar balancete e razão exportável (PDF/Excel).](../guias-bk/MF2/BK-MF2-07-consultar-balancete-e-razao-exportavel-pdf-excel.md)
- [BK-MF2-08 - Gerar Demonstração de Resultados e Balanço.](../guias-bk/MF2/BK-MF2-08-gerar-demonstracao-de-resultados-e-balanco.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualizacao documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF3 - Capacidades de produto I
### Sequencia por macro
BK-MF3-01, BK-MF3-02, BK-MF3-03, BK-MF3-04, BK-MF3-05, BK-MF3-06, BK-MF3-07, BK-MF3-08

### Guias disponiveis
- [BK-MF3-01 - Gerar Mapas de IVA (liquidado/dedutível).](../guias-bk/MF3/BK-MF3-01-gerar-mapas-de-iva-liquidado-dedutivel.md)
- [BK-MF3-02 - Criar contas bancárias/caixa e respetivos saldos.](../guias-bk/MF3/BK-MF3-02-criar-contas-bancarias-caixa-e-respetivos-saldos.md)
- [BK-MF3-03 - Importar extratos bancários (CSV/OFX) e fazer reconciliação automática.](../guias-bk/MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md)
- [BK-MF3-04 - Gerar previsão de tesouraria (entradas e saídas futuras).](../guias-bk/MF3/BK-MF3-04-gerar-previsao-de-tesouraria-entradas-e-saidas-futuras.md)
- [BK-MF3-05 - Importar CSV/Excel de clientes, fornecedores, artigos e extratos.](../guias-bk/MF3/BK-MF3-05-importar-csv-excel-de-clientes-fornecedores-artigos-e-extratos.md)
- [BK-MF3-06 - Exportar SAF-T (PT) de faturação e contabilidade.](../guias-bk/MF3/BK-MF3-06-exportar-saf-t-pt-de-faturacao-e-contabilidade.md)
- [BK-MF3-07 - Relatórios de vendas, compras, margens e stock.](../guias-bk/MF3/BK-MF3-07-relatorios-de-vendas-compras-margens-e-stock.md)
- [BK-MF3-08 - KPIs executivos (receita, custos, EBITDA, PMR, PMP).](../guias-bk/MF3/BK-MF3-08-kpis-executivos-receita-custos-ebitda-pmr-pmp.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualizacao documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF4 - Capacidades de produto II
### Sequencia por macro
BK-MF4-01, BK-MF4-02, BK-MF4-03, BK-MF4-04, BK-MF4-05, BK-MF4-06, BK-MF4-07, BK-MF4-08, BK-MF4-09, BK-MF4-10

### Guias disponiveis
- [BK-MF4-01 - Gerar insights automáticos (tendências, riscos, clientes, artigos parados).](../guias-bk/MF4/BK-MF4-01-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados.md)
- [BK-MF4-02 - Sugerir ações (ajustar preços, negociar fornecedor, repor stock).](../guias-bk/MF4/BK-MF4-02-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock.md)
- [BK-MF4-03 - Permitir perguntas em linguagem natural e responder com dados e fonte.](../guias-bk/MF4/BK-MF4-03-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte.md)
- [BK-MF4-04 - Emitir alertas inteligentes (cashflow, desvios, ruturas).](../guias-bk/MF4/BK-MF4-04-emitir-alertas-inteligentes-cashflow-desvios-ruturas.md)
- [BK-MF4-05 - Mostrar explicações e fontes de cada insight.](../guias-bk/MF4/BK-MF4-05-mostrar-explicacoes-e-fontes-de-cada-insight.md)
- [BK-MF4-06 - Criar/editar lembretes essenciais (prazos, pagamentos e impostos).](../guias-bk/MF4/BK-MF4-06-criar-editar-lembretes-essenciais-prazos-pagamentos-e-impostos.md)
- [BK-MF4-07 - Criar e atribuir tarefas essenciais com estado e prazo.](../guias-bk/MF4/BK-MF4-07-criar-e-atribuir-tarefas-essenciais-com-estado-e-prazo.md)
- [BK-MF4-08 - Notificações in-app para lembretes e alertas críticos da IA.](../guias-bk/MF4/BK-MF4-08-notificacoes-in-app-para-lembretes-e-alertas-criticos-da-ia.md)
- [BK-MF4-09 - Registar auditoria: quem, quando, o quê, em operações sensíveis.](../guias-bk/MF4/BK-MF4-09-registar-auditoria-quem-quando-o-que-em-operacoes-sensiveis.md)
- [BK-MF4-10 - Registar logs de integração (uploads, SAF-T, reconciliações).](../guias-bk/MF4/BK-MF4-10-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualizacao documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF5 - Operacao e fluxos transversais
### Sequencia por macro
BK-MF5-01, BK-MF5-02, BK-MF5-03, BK-MF5-04, BK-MF5-05, BK-MF5-06, BK-MF5-07

### Guias disponiveis
- [BK-MF5-01 - Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade).](../guias-bk/MF5/BK-MF5-01-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-inventario-contabilidade.md)
- [BK-MF5-02 - Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas.](../guias-bk/MF5/BK-MF5-02-layout-responsivo-desktop-tablet-mobile-com-grelhas-e-tabelas-adaptadas.md)
- [BK-MF5-03 - A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads).](../guias-bk/MF5/BK-MF5-03-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-validar-uploads.md)
- [BK-MF5-04 - Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade).](../guias-bk/MF5/BK-MF5-04-cumprir-regras-basicas-de-acessibilidade-contraste-headings-legibilidade.md)
- [BK-MF5-05 - Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC).](../guias-bk/MF5/BK-MF5-05-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-iva-contas-snc.md)
- [BK-MF5-06 - As mensagens de erro devem ser claras e indicar como resolver o problema.](../guias-bk/MF5/BK-MF5-06-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md)
- [BK-MF5-07 - Dashboard e listagens devem carregar em ≤ 2 segundos.](../guias-bk/MF5/BK-MF5-07-dashboard-e-listagens-devem-carregar-em-2-segundos.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualizacao documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF6 - Qualidade e robustez
### Sequencia por macro
BK-MF6-01, BK-MF6-02, BK-MF6-03, BK-MF6-04, BK-MF6-05, BK-MF6-06, BK-MF6-07, BK-MF6-08, BK-MF6-09, BK-MF6-10

### Guias disponiveis
- [BK-MF6-01 - Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo.](../guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md)
- [BK-MF6-02 - Suportar ≥ 25 utilizadores simultâneos por empresa sem degradação relevante.](../guias-bk/MF6/BK-MF6-02-suportar-25-utilizadores-simultaneos-por-empresa-sem-degradacao-relevante.md)
- [BK-MF6-03 - Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.](../guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md)
- [BK-MF6-04 - Cálculo de custo (FIFO) deve manter correção e não bloquear operações críticas.](../guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md)
- [BK-MF6-05 - Toda a comunicação deve usar HTTPS (TLS 1.2+).](../guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md)
- [BK-MF6-06 - Passwords devem usar bcrypt com salt seguro.](../guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md)
- [BK-MF6-07 - Sessões com cookies HttpOnly + Secure + SameSite.](../guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md)
- [BK-MF6-08 - Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).](../guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md)
- [BK-MF6-09 - Chaves de API e credenciais apenas em variáveis de ambiente.](../guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md)
- [BK-MF6-10 - Auditoria obrigatória em operações sensíveis.](../guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualizacao documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF7 - Privacidade, seguranca e controlo
### Sequencia por macro
BK-MF7-01, BK-MF7-02, BK-MF7-03, BK-MF7-04, BK-MF7-05, BK-MF7-06, BK-MF7-07, BK-MF7-08, BK-MF7-09, BK-MF7-10

### Guias disponiveis
- [BK-MF7-01 - Backups automáticos diários com restauração possível.](../guias-bk/MF7/BK-MF7-01-backups-automaticos-diarios-com-restauracao-possivel.md)
- [BK-MF7-02 - Cumprir obrigações legais de retenção (10 anos, contabilidade).](../guias-bk/MF7/BK-MF7-02-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md)
- [BK-MF7-03 - Compatível com Chrome, Edge e Firefox.](../guias-bk/MF7/BK-MF7-03-compativel-com-chrome-edge-e-firefox.md)
- [BK-MF7-04 - Integração com serviços de email (recuperação de password, alertas).](../guias-bk/MF7/BK-MF7-04-integracao-com-servicos-de-email-recuperacao-de-password-alertas.md)
- [BK-MF7-05 - Exportações disponíveis em CSV, Excel e PDF.](../guias-bk/MF7/BK-MF7-05-exportacoes-disponiveis-em-csv-excel-e-pdf.md)
- [BK-MF7-06 - Importações CSV/Excel com validação e logs de erro.](../guias-bk/MF7/BK-MF7-06-importacoes-csv-excel-com-validacao-e-logs-de-erro.md)
- [BK-MF7-07 - Geração de SAF-T conforme especificações legais (PT).](../guias-bk/MF7/BK-MF7-07-geracao-de-saf-t-conforme-especificacoes-legais-pt.md)
- [BK-MF7-08 - Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).](../guias-bk/MF7/BK-MF7-08-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabilidade-ia.md)
- [BK-MF7-09 - Frontend modular com componentes reutilizáveis.](../guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md)
- [BK-MF7-10 - Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação).](../guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualizacao documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## MF8 - Integracoes, compatibilidade e fecho
### Sequencia por macro
BK-MF8-01, BK-MF8-02, BK-MF8-03, BK-MF8-04, BK-MF8-05, BK-MF8-06, BK-MF8-07, BK-MF8-08, BK-MF8-09

### Guias disponiveis
- [BK-MF8-01 - Logs estruturados (info, warn, error, audit).](../guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md)
- [BK-MF8-02 - Endpoint de health-check.](../guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md)
- [BK-MF8-03 - Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).](../guias-bk/MF8/BK-MF8-03-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md)
- [BK-MF8-04 - Insights devem incluir explicação e origem dos dados usados.](../guias-bk/MF8/BK-MF8-04-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md)
- [BK-MF8-05 - IA não altera dados contabilísticos; apenas analisa e recomenda.](../guias-bk/MF8/BK-MF8-05-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md)
- [BK-MF8-06 - Alertas configuráveis (ativar/desativar tipos).](../guias-bk/MF8/BK-MF8-06-alertas-configuraveis-ativar-desativar-tipos.md)
- [BK-MF8-07 - IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.](../guias-bk/MF8/BK-MF8-07-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md)
- [BK-MF8-08 - Interface em português de Portugal.](../guias-bk/MF8/BK-MF8-08-interface-em-portugues-de-portugal.md)
- [BK-MF8-09 - Datas, moedas e separadores no padrão europeu.](../guias-bk/MF8/BK-MF8-09-datas-moedas-e-separadores-no-padrao-europeu.md)

### Step-by-step macro
1. Confirmar dependencias desbloqueadas antes de iniciar BK.
2. Executar BK por ordem de prioridade P0->P1->P2 mantendo sequencia tecnica.
3. Validar smoke e negativos por BK antes do handoff.
4. Garantir evidence (pr/proof/neg) e atualizacao documental.
5. Fechar macro apenas com criterios de pronto cumpridos.

### Pronto da macro
- Todos os BK do macro com guia e evidence minima.
- Sem dependencias invalidas para a macro seguinte.

## Changelog
- `2026-04-19`: MF-VIEWS regenerado após redução de escopo e renumeração total.
