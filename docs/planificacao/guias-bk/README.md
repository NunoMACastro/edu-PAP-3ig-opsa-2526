# GUIAS-BK-README

## Header
- `doc_id`: `GUIAS-BK-README`
- `path`: `docs/planificacao/guias-bk/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-17`

## Padrão de naming dos guias BK
- Formato obrigatório: `BK-MF*-**-slug-semantico.md`.
- Exemplo: `BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md`.
- Regra: manter ID canónico (`BK-MF*-**`) e acrescentar slug PT-PT semântico.

## Contrato editorial
- Todos os guias devem conter `Bloco pedagogico` e `Bloco operacional`.
- Snippet técnico obrigatório e aplicável ao BK real (não placeholder).
- Reutilização técnica orientada por `SNIPPETS-POR-MACRO.md`.
- Campos de header obrigatórios: `bk_id`, `macro`, `sprint`, `owner`, `rf_rnf`, `dependencias`, `guia_path`, `core_or_reforco`.

## Indice completo por macro
### MF0
- [BK-MF0-01 - Registo, login e logout com cookies HttpOnly.](MF0/BK-MF0-01-registo-login-e-logout-com-cookies-httponly.md)
- [BK-MF0-02 - Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).](MF0/BK-MF0-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md)
- [BK-MF0-03 - Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).](MF0/BK-MF0-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empresas.md)
- [BK-MF0-04 - Gestão de utilizadores: convite, remoção e definição de papéis.](MF0/BK-MF0-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md)
- [BK-MF0-05 - Recuperação de password via email.](MF0/BK-MF0-05-recuperacao-de-password-via-email.md)
- [BK-MF0-06 - Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal).](MF0/BK-MF0-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md)
- [BK-MF0-07 - Criar/importar plano de contas (SNC).](MF0/BK-MF0-07-criar-importar-plano-de-contas-snc.md)
- [BK-MF0-08 - Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho.](MF0/BK-MF0-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md)
- [BK-MF0-09 - Criar e gerir clientes.](MF0/BK-MF0-09-criar-e-gerir-clientes.md)
- [BK-MF0-10 - Criar e gerir fornecedores.](MF0/BK-MF0-10-criar-e-gerir-fornecedores.md)
- [BK-MF0-11 - Criar artigos/serviços (SKU, custo, preço, IVA).](MF0/BK-MF0-11-criar-artigos-servicos-sku-custo-preco-iva.md)
- [BK-MF0-12 - Criar armazéns e localizações.](MF0/BK-MF0-12-criar-armazens-e-localizacoes.md)

### MF1
- [BK-MF1-01 - Configurar tabelas de IVA (taxas, isenções, códigos).](MF1/BK-MF1-01-configurar-tabelas-de-iva-taxas-isencoes-codigos.md)
- [BK-MF1-02 - Emitir Fatura, Fatura-Recibo, Nota de Crédito, com numeração sequencial.](MF1/BK-MF1-02-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md)
- [BK-MF1-03 - Registar recebimentos (parciais/totais).](MF1/BK-MF1-03-registar-recebimentos-parciais-totais.md)
- [BK-MF1-04 - Gerar lançamentos contabilísticos automáticos por venda.](MF1/BK-MF1-04-gerar-lancamentos-contabilisticos-automaticos-por-venda.md)
- [BK-MF1-05 - Consultar títulos em aberto e antiguidade de saldos.](MF1/BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md)
- [BK-MF1-06 - Submeter documentos de venda para aprovação antes de emissão definitiva.](MF1/BK-MF1-06-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiva.md)
- [BK-MF1-07 - Definir fluxos e limites de aprovação (por papel, valor, cliente).](MF1/BK-MF1-07-definir-fluxos-e-limites-de-aprovacao-por-papel-valor-cliente.md)
- [BK-MF1-08 - Registar histórico de decisões de aprovação e comentários.](MF1/BK-MF1-08-registar-historico-de-decisoes-de-aprovacao-e-comentarios.md)
- [BK-MF1-09 - Registar Fatura de Fornecedor e Nota de Crédito.](MF1/BK-MF1-09-registar-fatura-de-fornecedor-e-nota-de-credito.md)
- [BK-MF1-10 - Registar pagamentos (parciais/totais).](MF1/BK-MF1-10-registar-pagamentos-parciais-totais.md)
- [BK-MF1-11 - Gerar lançamentos contabilísticos automáticos de compras.](MF1/BK-MF1-11-gerar-lancamentos-contabilisticos-automaticos-de-compras.md)
- [BK-MF1-12 - Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.](MF1/BK-MF1-12-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md)

### MF2
- [BK-MF2-01 - Configurar limites e papéis para aprovações (por fornecedor/valor).](MF2/BK-MF2-01-configurar-limites-e-papeis-para-aprovacoes-por-fornecedor-valor.md)
- [BK-MF2-02 - Histórico e justificações para aprovações/reprovações.](MF2/BK-MF2-02-historico-e-justificacoes-para-aprovacoes-reprovacoes.md)
- [BK-MF2-03 - Movimentos de stock: entradas, saídas, transferências, devoluções.](MF2/BK-MF2-03-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md)
- [BK-MF2-04 - Cálculo de custo (FIFO).](MF2/BK-MF2-04-calculo-de-custo-fifo.md)
- [BK-MF2-05 - Contagem física e ajustes.](MF2/BK-MF2-05-contagem-fisica-e-ajustes.md)
- [BK-MF2-06 - Alertas de stock (mínimos, máximos, artigos parados).](MF2/BK-MF2-06-alertas-de-stock-minimos-maximos-artigos-parados.md)
- [BK-MF2-07 - Configurar centros de custo / segmentos analíticos.](MF2/BK-MF2-07-configurar-centros-de-custo-segmentos-analiticos.md)
- [BK-MF2-08 - Associar documentos e lançamentos a centros de custo.](MF2/BK-MF2-08-associar-documentos-e-lancamentos-a-centros-de-custo.md)
- [BK-MF2-09 - Relatórios e filtros por centro de custo/segmento.](MF2/BK-MF2-09-relatorios-e-filtros-por-centro-de-custo-segmento.md)
- [BK-MF2-10 - Criar e editar lançamentos manuais (com anexos).](MF2/BK-MF2-10-criar-e-editar-lancamentos-manuais-com-anexos.md)
- [BK-MF2-11 - Consultar balancete e razão exportável (PDF/Excel).](MF2/BK-MF2-11-consultar-balancete-e-razao-exportavel-pdf-excel.md)
- [BK-MF2-12 - Gerar Demonstração de Resultados e Balanço.](MF2/BK-MF2-12-gerar-demonstracao-de-resultados-e-balanco.md)

### MF3
- [BK-MF3-01 - Gerar Mapas de IVA (liquidado/dedutível).](MF3/BK-MF3-01-gerar-mapas-de-iva-liquidado-dedutivel.md)
- [BK-MF3-02 - Criar contas bancárias/caixa e respetivos saldos.](MF3/BK-MF3-02-criar-contas-bancarias-caixa-e-respetivos-saldos.md)
- [BK-MF3-03 - Importar extratos bancários (CSV/OFX) e fazer reconciliação automática.](MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md)
- [BK-MF3-04 - Gerar previsão de tesouraria (entradas e saídas futuras).](MF3/BK-MF3-04-gerar-previsao-de-tesouraria-entradas-e-saidas-futuras.md)
- [BK-MF3-05 - Upload de documentos com OCR (ler NIF, data, total, IVA).](MF3/BK-MF3-05-upload-de-documentos-com-ocr-ler-nif-data-total-iva.md)
- [BK-MF3-06 - Importar CSV/Excel de clientes, fornecedores, artigos e extratos.](MF3/BK-MF3-06-importar-csv-excel-de-clientes-fornecedores-artigos-e-extratos.md)
- [BK-MF3-07 - Exportar SAF-T (PT) de faturação e contabilidade.](MF3/BK-MF3-07-exportar-saf-t-pt-de-faturacao-e-contabilidade.md)
- [BK-MF3-09 - Mapear documentos de integração para centros de custo.](MF3/BK-MF3-09-mapear-documentos-de-integracao-para-centros-de-custo.md)
- [BK-MF3-10 - Relatórios de vendas, compras, margens e stock.](MF3/BK-MF3-10-relatorios-de-vendas-compras-margens-e-stock.md)
- [BK-MF3-11 - KPIs executivos (receita, custos, EBITDA, PMR, PMP).](MF3/BK-MF3-11-kpis-executivos-receita-custos-ebitda-pmr-pmp.md)
- [BK-MF3-12 - Personalização de relatórios e exportação (PDF/Excel).](MF3/BK-MF3-12-personalizacao-de-relatorios-e-exportacao-pdf-excel.md)

### MF4
- [BK-MF4-01 - Gerar insights automáticos (tendências, riscos, clientes, artigos parados).](MF4/BK-MF4-01-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados.md)
- [BK-MF4-02 - Sugerir ações (ajustar preços, negociar fornecedor, repor stock).](MF4/BK-MF4-02-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock.md)
- [BK-MF4-03 - Permitir perguntas em linguagem natural e responder com dados e fonte.](MF4/BK-MF4-03-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte.md)
- [BK-MF4-04 - Emitir alertas inteligentes (cashflow, desvios, ruturas).](MF4/BK-MF4-04-emitir-alertas-inteligentes-cashflow-desvios-ruturas.md)
- [BK-MF4-05 - Mostrar explicações e fontes de cada insight.](MF4/BK-MF4-05-mostrar-explicacoes-e-fontes-de-cada-insight.md)
- [BK-MF4-06 - Criar/editar lembretes essenciais (prazos, pagamentos e impostos).](MF4/BK-MF4-06-criar-editar-lembretes-essenciais-prazos-pagamentos-e-impostos.md)
- [BK-MF4-07 - Criar e atribuir tarefas essenciais com estado e prazo.](MF4/BK-MF4-07-criar-e-atribuir-tarefas-essenciais-com-estado-e-prazo.md)
- [BK-MF4-08 - Notificações in-app para lembretes e alertas críticos da IA.](MF4/BK-MF4-08-notificacoes-in-app-para-lembretes-e-alertas-criticos-da-ia.md)
- [BK-MF4-09 - Registar auditoria: quem, quando, o quê, em operações sensíveis.](MF4/BK-MF4-09-registar-auditoria-quem-quando-o-que-em-operacoes-sensiveis.md)
- [BK-MF4-10 - Registar logs de integração (uploads, SAF-T, reconciliações).](MF4/BK-MF4-10-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md)
- [BK-MF4-11 - Permitir reabertura de períodos apenas com registo de motivo.](MF4/BK-MF4-11-permitir-reabertura-de-periodos-apenas-com-registo-de-motivo.md)
- [BK-MF4-12 - Definir workflows de aprovação por documento (compra, venda, pagamento).](MF4/BK-MF4-12-definir-workflows-de-aprovacao-por-documento-compra-venda-pagamento.md)

### MF5
- [BK-MF5-01 - Configurar níveis de aprovação essenciais com limites financeiros.](MF5/BK-MF5-01-configurar-niveis-de-aprovacao-essenciais-com-limites-financeiros.md)
- [BK-MF5-02 - Painel simples para monitorizar aprovações pendentes por tipo de documento.](MF5/BK-MF5-02-painel-simples-para-monitorizar-aprovacoes-pendentes-por-tipo-de-documento.md)
- [BK-MF5-03 - Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria.](MF5/BK-MF5-03-agendar-pagamentos-recebimentos-futuros-com-integracao-as-previsoes-de-tesouraria.md)
- [BK-MF5-05 - Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade).](MF5/BK-MF5-05-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-inventario-contabilidade.md)
- [BK-MF5-06 - Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas.](MF5/BK-MF5-06-layout-responsivo-desktop-tablet-mobile-com-grelhas-e-tabelas-adaptadas.md)
- [BK-MF5-07 - A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads).](MF5/BK-MF5-07-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-validar-uploads.md)
- [BK-MF5-08 - Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade).](MF5/BK-MF5-08-cumprir-regras-basicas-de-acessibilidade-contraste-headings-legibilidade.md)
- [BK-MF5-09 - Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC).](MF5/BK-MF5-09-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-iva-contas-snc.md)
- [BK-MF5-10 - As mensagens de erro devem ser claras e indicar como resolver o problema.](MF5/BK-MF5-10-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md)
- [BK-MF5-11 - Dashboard e listagens devem carregar em ≤ 2 segundos.](MF5/BK-MF5-11-dashboard-e-listagens-devem-carregar-em-2-segundos.md)

### MF6
- [BK-MF6-01 - Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo.](MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md)
- [BK-MF6-02 - Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação.](MF6/BK-MF6-02-suportar-50-utilizadores-simultaneos-por-empresa-sem-degradacao.md)
- [BK-MF6-03 - Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.](MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md)
- [BK-MF6-04 - Cálculo de custo (FIFO) deve ser incremental e não bloquear operações.](MF6/BK-MF6-04-calculo-de-custo-fifo-deve-ser-incremental-e-nao-bloquear-operacoes.md)
- [BK-MF6-06 - Toda a comunicação deve usar HTTPS (TLS 1.2+).](MF6/BK-MF6-06-toda-a-comunicacao-deve-usar-https-tls-1-2.md)
- [BK-MF6-07 - Passwords devem usar bcrypt com salt seguro.](MF6/BK-MF6-07-passwords-devem-usar-bcrypt-com-salt-seguro.md)
- [BK-MF6-08 - Sessões com cookies HttpOnly + Secure + SameSite.](MF6/BK-MF6-08-sessoes-com-cookies-httponly-secure-samesite.md)
- [BK-MF6-09 - Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).](MF6/BK-MF6-09-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md)
- [BK-MF6-10 - Chaves de API e credenciais apenas em variáveis de ambiente.](MF6/BK-MF6-10-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md)
- [BK-MF6-11 - Auditoria obrigatória em operações sensíveis.](MF6/BK-MF6-11-auditoria-obrigatoria-em-operacoes-sensiveis.md)

### MF7
- [BK-MF7-01 - Backups automáticos diários com restauração possível.](MF7/BK-MF7-01-backups-automaticos-diarios-com-restauracao-possivel.md)
- [BK-MF7-02 - Cumprir obrigações legais de retenção (10 anos, contabilidade).](MF7/BK-MF7-02-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md)
- [BK-MF7-03 - Compatível com Chrome, Edge, Firefox e Safari.](MF7/BK-MF7-03-compativel-com-chrome-edge-firefox-e-safari.md)
- [BK-MF7-04 - Integração com serviços de email (recuperação de password, alertas).](MF7/BK-MF7-04-integracao-com-servicos-de-email-recuperacao-de-password-alertas.md)
- [BK-MF7-05 - Exportações disponíveis em CSV, Excel e PDF.](MF7/BK-MF7-05-exportacoes-disponiveis-em-csv-excel-e-pdf.md)
- [BK-MF7-06 - Importações CSV/Excel com validação e logs de erro.](MF7/BK-MF7-06-importacoes-csv-excel-com-validacao-e-logs-de-erro.md)
- [BK-MF7-07 - Geração de SAF-T conforme especificações legais (PT).](MF7/BK-MF7-07-geracao-de-saf-t-conforme-especificacoes-legais-pt.md)
- [BK-MF7-08 - API interna estável para futuras integrações.](MF7/BK-MF7-08-api-interna-estavel-para-futuras-integracoes.md)
- [BK-MF7-09 - Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).](MF7/BK-MF7-09-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabilidade-ia.md)
- [BK-MF7-10 - Frontend modular com componentes reutilizáveis.](MF7/BK-MF7-10-frontend-modular-com-componentes-reutilizaveis.md)
- [BK-MF7-11 - Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação).](MF7/BK-MF7-11-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md)

### MF8
- [BK-MF8-01 - Logs estruturados (info, warn, error, audit).](MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md)
- [BK-MF8-02 - Endpoint de health-check.](MF8/BK-MF8-02-endpoint-de-health-check.md)
- [BK-MF8-03 - Deploy com rollback.](MF8/BK-MF8-03-deploy-com-rollback.md)
- [BK-MF8-04 - Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).](MF8/BK-MF8-04-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md)
- [BK-MF8-05 - Insights devem incluir explicação e origem dos dados usados.](MF8/BK-MF8-05-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md)
- [BK-MF8-06 - IA não altera dados contabilísticos; apenas analisa e recomenda.](MF8/BK-MF8-06-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md)
- [BK-MF8-07 - Alertas configuráveis (ativar/desativar tipos).](MF8/BK-MF8-07-alertas-configuraveis-ativar-desativar-tipos.md)
- [BK-MF8-08 - IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.](MF8/BK-MF8-08-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md)
- [BK-MF8-09 - Interface em português de Portugal.](MF8/BK-MF8-09-interface-em-portugues-de-portugal.md)
- [BK-MF8-11 - Datas, moedas e separadores no padrão europeu.](MF8/BK-MF8-11-datas-moedas-e-separadores-no-padrao-europeu.md)

## Changelog
- `2026-04-17`: índice e naming migrados para padrão com slug semântico.
- `2026-04-17`: contrato editorial reforçado com bloco pedagógico/operacional e snippet obrigatório.
