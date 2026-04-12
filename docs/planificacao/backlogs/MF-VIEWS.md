# MF Views

## Header
- `doc_id`: `MF-VIEWS`
- `path`: `docs/planificacao/backlogs/MF-VIEWS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Sequência Global
MF0 -> MF1 -> MF2 -> MF3 -> MF4 -> MF5 -> MF6 -> MF7 -> MF8

## MF0 - Vista Operacional
### Guias disponíveis
- [BK-MF0-01 - Dashboard e listagens devem carregar em ≤ 2 segundos.](../guias-bk/MF0/BK-MF0-01--bk-mf0-01-dashboard-e-listagens-devem-carregar-em-2-segundos.md)
- [BK-MF0-02 - Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo.](../guias-bk/MF0/BK-MF0-02--bk-mf0-02-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md)
- [BK-MF0-03 - Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação.](../guias-bk/MF0/BK-MF0-03--bk-mf0-03-suportar-50-utilizadores-simultaneos-por-empresa-sem-degradacao.md)
- [BK-MF0-04 - Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.](../guias-bk/MF0/BK-MF0-04--bk-mf0-04-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md)
- [BK-MF0-05 - Cálculo de custo (FIFO) deve ser incremental e não bloquear operações.](../guias-bk/MF0/BK-MF0-05--bk-mf0-05-calculo-de-custo-fifo-deve-ser-incremental-e-nao-bloquear-operacoes.md)
- [BK-MF0-06 - Arquitetura preparada para escalar horizontalmente.](../guias-bk/MF0/BK-MF0-06--bk-mf0-06-arquitetura-preparada-para-escalar-horizontalmente.md)
- [BK-MF0-07 - Toda a comunicação deve usar HTTPS (TLS 1.2+).](../guias-bk/MF0/BK-MF0-07--bk-mf0-07-toda-a-comunicacao-deve-usar-https-tls-1-2.md)
- [BK-MF0-08 - Passwords devem usar bcrypt com salt seguro.](../guias-bk/MF0/BK-MF0-08--bk-mf0-08-passwords-devem-usar-bcrypt-com-salt-seguro.md)
- [BK-MF0-09 - Sessões com cookies HttpOnly + Secure + SameSite.](../guias-bk/MF0/BK-MF0-09--bk-mf0-09-sessoes-com-cookies-httponly-secure-samesite.md)
- [BK-MF0-10 - Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).](../guias-bk/MF0/BK-MF0-10--bk-mf0-10-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md)
- [BK-MF0-11 - Chaves de API e credenciais apenas em variáveis de ambiente.](../guias-bk/MF0/BK-MF0-11--bk-mf0-11-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md)
- [BK-MF0-12 - Auditoria obrigatória em operações sensíveis.](../guias-bk/MF0/BK-MF0-12--bk-mf0-12-auditoria-obrigatoria-em-operacoes-sensiveis.md)
- [BK-MF0-13 - Backups automáticos diários com restauração possível.](../guias-bk/MF0/BK-MF0-13--bk-mf0-13-backups-automaticos-diarios-com-restauracao-possivel.md)
- [BK-MF0-14 - Cumprir obrigações legais de retenção (10 anos, contabilidade).](../guias-bk/MF0/BK-MF0-14--bk-mf0-14-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md)
- [BK-MF0-15 - Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).](../guias-bk/MF0/BK-MF0-15--bk-mf0-15-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabili.md)
- [BK-MF0-16 - Frontend modular com componentes reutilizáveis.](../guias-bk/MF0/BK-MF0-16--bk-mf0-16-frontend-modular-com-componentes-reutilizaveis.md)
- [BK-MF0-17 - Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação).](../guias-bk/MF0/BK-MF0-17--bk-mf0-17-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-re.md)
- [BK-MF0-18 - Logs estruturados (info, warn, error, audit).](../guias-bk/MF0/BK-MF0-18--bk-mf0-18-logs-estruturados-info-warn-error-audit.md)
- [BK-MF0-19 - Endpoint de health-check.](../guias-bk/MF0/BK-MF0-19--bk-mf0-19-endpoint-de-health-check.md)
- [BK-MF0-20 - Deploy com rollback.](../guias-bk/MF0/BK-MF0-20--bk-mf0-20-deploy-com-rollback.md)
- [BK-MF0-21 - Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).](../guias-bk/MF0/BK-MF0-21--bk-mf0-21-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md)

### Step-by-step macro
1. Validar dependências de entrada e BK desbloqueados.
2. Executar BKs por prioridade e evidência mínima.
3. Fechar checklist Smoke/Negativos/Técnico por BK.
4. Sincronizar backlog, guia e estado documental.

### Pronto da macro
- Todos os BK da macro têm evidência completa (`pr`, `proof`, `neg`).
- Nenhum BK com dependência inválida.
- Crosslinks funcionais com BACKLOG-MVP e guias.

## MF1 - Vista Operacional
### Guias disponíveis
- [BK-MF1-01 - Registo, login e logout com cookies HttpOnly.](../guias-bk/MF1/BK-MF1-01--bk-mf1-01-registo-login-e-logout-com-cookies-httponly.md)
- [BK-MF1-02 - Papéis e permissões (**Admin**, **Gestor**, **Contabilista**, **Operacional**, **Auditor**).](../guias-bk/MF1/BK-MF1-02--bk-mf1-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md)
- [BK-MF1-03 - Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).](../guias-bk/MF1/BK-MF1-03--bk-mf1-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empre.md)
- [BK-MF1-04 - Gestão de utilizadores: convite, remoção e definição de papéis.](../guias-bk/MF1/BK-MF1-04--bk-mf1-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md)
- [BK-MF1-05 - Recuperação de password via email.](../guias-bk/MF1/BK-MF1-05--bk-mf1-05-recuperacao-de-password-via-email.md)
- [BK-MF1-06 - Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal).](../guias-bk/MF1/BK-MF1-06--bk-mf1-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md)
- [BK-MF1-07 - Criar/importar plano de contas (SNC).](../guias-bk/MF1/BK-MF1-07--bk-mf1-07-criar-importar-plano-de-contas-snc.md)
- [BK-MF1-08 - Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho.](../guias-bk/MF1/BK-MF1-08--bk-mf1-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md)

### Step-by-step macro
1. Validar dependências de entrada e BK desbloqueados.
2. Executar BKs por prioridade e evidência mínima.
3. Fechar checklist Smoke/Negativos/Técnico por BK.
4. Sincronizar backlog, guia e estado documental.

### Pronto da macro
- Todos os BK da macro têm evidência completa (`pr`, `proof`, `neg`).
- Nenhum BK com dependência inválida.
- Crosslinks funcionais com BACKLOG-MVP e guias.

## MF2 - Vista Operacional
### Guias disponíveis
- [BK-MF2-01 - Criar e gerir **clientes**.](../guias-bk/MF2/BK-MF2-01--bk-mf2-01-criar-e-gerir-clientes.md)
- [BK-MF2-02 - Criar e gerir **fornecedores**.](../guias-bk/MF2/BK-MF2-02--bk-mf2-02-criar-e-gerir-fornecedores.md)
- [BK-MF2-03 - Criar **artigos/serviços** (SKU, custo, preço, IVA).](../guias-bk/MF2/BK-MF2-03--bk-mf2-03-criar-artigos-servicos-sku-custo-preco-iva.md)
- [BK-MF2-04 - Criar **armazéns e localizações**.](../guias-bk/MF2/BK-MF2-04--bk-mf2-04-criar-armazens-e-localizacoes.md)
- [BK-MF2-05 - Configurar **tabelas de IVA** (taxas, isenções, códigos).](../guias-bk/MF2/BK-MF2-05--bk-mf2-05-configurar-tabelas-de-iva-taxas-isencoes-codigos.md)
- [BK-MF2-06 - Movimentos de stock: entradas, saídas, transferências, devoluções.](../guias-bk/MF2/BK-MF2-06--bk-mf2-06-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md)
- [BK-MF2-07 - Cálculo de custo (FIFO).](../guias-bk/MF2/BK-MF2-07--bk-mf2-07-calculo-de-custo-fifo.md)
- [BK-MF2-08 - Contagem física e ajustes.](../guias-bk/MF2/BK-MF2-08--bk-mf2-08-contagem-fisica-e-ajustes.md)
- [BK-MF2-09 - Alertas de stock (mínimos, máximos, artigos parados).](../guias-bk/MF2/BK-MF2-09--bk-mf2-09-alertas-de-stock-minimos-maximos-artigos-parados.md)
- [BK-MF2-10 - Configurar **centros de custo** / segmentos analíticos.](../guias-bk/MF2/BK-MF2-10--bk-mf2-10-configurar-centros-de-custo-segmentos-analiticos.md)
- [BK-MF2-11 - Associar documentos e lançamentos a centros de custo.](../guias-bk/MF2/BK-MF2-11--bk-mf2-11-associar-documentos-e-lancamentos-a-centros-de-custo.md)
- [BK-MF2-12 - Relatórios e filtros por centro de custo/segmento.](../guias-bk/MF2/BK-MF2-12--bk-mf2-12-relatorios-e-filtros-por-centro-de-custo-segmento.md)

### Step-by-step macro
1. Validar dependências de entrada e BK desbloqueados.
2. Executar BKs por prioridade e evidência mínima.
3. Fechar checklist Smoke/Negativos/Técnico por BK.
4. Sincronizar backlog, guia e estado documental.

### Pronto da macro
- Todos os BK da macro têm evidência completa (`pr`, `proof`, `neg`).
- Nenhum BK com dependência inválida.
- Crosslinks funcionais com BACKLOG-MVP e guias.

## MF3 - Vista Operacional
### Guias disponíveis
- [BK-MF3-01 - Emitir **Fatura, Fatura-Recibo, Nota de Crédito**, com numeração sequencial.](../guias-bk/MF3/BK-MF3-01--bk-mf3-01-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md)
- [BK-MF3-02 - Registar **recebimentos** (parciais/totais).](../guias-bk/MF3/BK-MF3-02--bk-mf3-02-registar-recebimentos-parciais-totais.md)
- [BK-MF3-03 - Gerar **lançamentos contabilísticos automáticos** por venda.](../guias-bk/MF3/BK-MF3-03--bk-mf3-03-gerar-lancamentos-contabilisticos-automaticos-por-venda.md)
- [BK-MF3-04 - Consultar **títulos em aberto** e antiguidade de saldos.](../guias-bk/MF3/BK-MF3-04--bk-mf3-04-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md)
- [BK-MF3-05 - Submeter documentos de venda para **aprovação** antes de emissão definitiva.](../guias-bk/MF3/BK-MF3-05--bk-mf3-05-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiv.md)
- [BK-MF3-06 - Definir **fluxos e limites** de aprovação (por papel, valor, cliente).](../guias-bk/MF3/BK-MF3-06--bk-mf3-06-definir-fluxos-e-limites-de-aprovacao-por-papel-valor-cliente.md)
- [BK-MF3-07 - Registar histórico de **decisões de aprovação** e comentários.](../guias-bk/MF3/BK-MF3-07--bk-mf3-07-registar-historico-de-decisoes-de-aprovacao-e-comentarios.md)
- [BK-MF3-08 - Registar **Fatura de Fornecedor** e **Nota de Crédito**.](../guias-bk/MF3/BK-MF3-08--bk-mf3-08-registar-fatura-de-fornecedor-e-nota-de-credito.md)
- [BK-MF3-09 - Registar **pagamentos** (parciais/totais).](../guias-bk/MF3/BK-MF3-09--bk-mf3-09-registar-pagamentos-parciais-totais.md)
- [BK-MF3-10 - Gerar **lançamentos contabilísticos automáticos** de compras.](../guias-bk/MF3/BK-MF3-10--bk-mf3-10-gerar-lancamentos-contabilisticos-automaticos-de-compras.md)
- [BK-MF3-11 - Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.](../guias-bk/MF3/BK-MF3-11--bk-mf3-11-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md)
- [BK-MF3-12 - Configurar **limites e papéis** para aprovações (por fornecedor/valor).](../guias-bk/MF3/BK-MF3-12--bk-mf3-12-configurar-limites-e-papeis-para-aprovacoes-por-fornecedor-valor.md)
- [BK-MF3-13 - Histórico e justificações para aprovações/reprovações.](../guias-bk/MF3/BK-MF3-13--bk-mf3-13-historico-e-justificacoes-para-aprovacoes-reprovacoes.md)

### Step-by-step macro
1. Validar dependências de entrada e BK desbloqueados.
2. Executar BKs por prioridade e evidência mínima.
3. Fechar checklist Smoke/Negativos/Técnico por BK.
4. Sincronizar backlog, guia e estado documental.

### Pronto da macro
- Todos os BK da macro têm evidência completa (`pr`, `proof`, `neg`).
- Nenhum BK com dependência inválida.
- Crosslinks funcionais com BACKLOG-MVP e guias.

## MF4 - Vista Operacional
### Guias disponíveis
- [BK-MF4-01 - Criar e editar **lançamentos manuais** (com anexos).](../guias-bk/MF4/BK-MF4-01--bk-mf4-01-criar-e-editar-lancamentos-manuais-com-anexos.md)
- [BK-MF4-02 - Consultar **balancete e razão** exportável (PDF/Excel).](../guias-bk/MF4/BK-MF4-02--bk-mf4-02-consultar-balancete-e-razao-exportavel-pdf-excel.md)
- [BK-MF4-03 - Gerar **Demonstração de Resultados e Balanço**.](../guias-bk/MF4/BK-MF4-03--bk-mf4-03-gerar-demonstracao-de-resultados-e-balanco.md)
- [BK-MF4-04 - Gerar **Mapas de IVA** (liquidado/dedutível).](../guias-bk/MF4/BK-MF4-04--bk-mf4-04-gerar-mapas-de-iva-liquidado-dedutivel.md)

### Step-by-step macro
1. Validar dependências de entrada e BK desbloqueados.
2. Executar BKs por prioridade e evidência mínima.
3. Fechar checklist Smoke/Negativos/Técnico por BK.
4. Sincronizar backlog, guia e estado documental.

### Pronto da macro
- Todos os BK da macro têm evidência completa (`pr`, `proof`, `neg`).
- Nenhum BK com dependência inválida.
- Crosslinks funcionais com BACKLOG-MVP e guias.

## MF5 - Vista Operacional
### Guias disponíveis
- [BK-MF5-01 - Criar **contas bancárias/caixa** e respetivos saldos.](../guias-bk/MF5/BK-MF5-01--bk-mf5-01-criar-contas-bancarias-caixa-e-respetivos-saldos.md)
- [BK-MF5-02 - Importar **extratos bancários** (CSV/OFX) e fazer reconciliação automática.](../guias-bk/MF5/BK-MF5-02--bk-mf5-02-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md)
- [BK-MF5-03 - Gerar **previsão de tesouraria** (entradas e saídas futuras).](../guias-bk/MF5/BK-MF5-03--bk-mf5-03-gerar-previsao-de-tesouraria-entradas-e-saidas-futuras.md)
- [BK-MF5-04 - Definir **workflows de aprovação** por documento (compra, venda, pagamento).](../guias-bk/MF5/BK-MF5-04--bk-mf5-04-definir-workflows-de-aprovacao-por-documento-compra-venda-pagamento.md)
- [BK-MF5-05 - Configurar **níveis de aprovação** com limites financeiros e escalamentos.](../guias-bk/MF5/BK-MF5-05--bk-mf5-05-configurar-niveis-de-aprovacao-com-limites-financeiros-e-escalamentos.md)
- [BK-MF5-06 - Painel para monitorizar aprovações pendentes e SLA por tipo de documento.](../guias-bk/MF5/BK-MF5-06--bk-mf5-06-painel-para-monitorizar-aprovacoes-pendentes-e-sla-por-tipo-de-documen.md)
- [BK-MF5-07 - Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria.](../guias-bk/MF5/BK-MF5-07--bk-mf5-07-agendar-pagamentos-recebimentos-futuros-com-integracao-as-previsoes-de.md)
- [BK-MF5-08 - Gerir **linhas de crédito** (limites, utilização, alertas) por banco.](../guias-bk/MF5/BK-MF5-08--bk-mf5-08-gerir-linhas-de-credito-limites-utilizacao-alertas-por-banco.md)

### Step-by-step macro
1. Validar dependências de entrada e BK desbloqueados.
2. Executar BKs por prioridade e evidência mínima.
3. Fechar checklist Smoke/Negativos/Técnico por BK.
4. Sincronizar backlog, guia e estado documental.

### Pronto da macro
- Todos os BK da macro têm evidência completa (`pr`, `proof`, `neg`).
- Nenhum BK com dependência inválida.
- Crosslinks funcionais com BACKLOG-MVP e guias.

## MF6 - Vista Operacional
### Guias disponíveis
- [BK-MF6-01 - Upload de documentos com **OCR** (ler NIF, data, total, IVA).](../guias-bk/MF6/BK-MF6-01--bk-mf6-01-upload-de-documentos-com-ocr-ler-nif-data-total-iva.md)
- [BK-MF6-02 - Importar CSV/Excel de clientes, fornecedores, artigos e extratos.](../guias-bk/MF6/BK-MF6-02--bk-mf6-02-importar-csv-excel-de-clientes-fornecedores-artigos-e-extratos.md)
- [BK-MF6-03 - Exportar **SAF-T (PT)** de faturação e contabilidade.](../guias-bk/MF6/BK-MF6-03--bk-mf6-03-exportar-saf-t-pt-de-faturacao-e-contabilidade.md)
- [BK-MF6-04 - (Opcional) Integração com **e-Fatura**.](../guias-bk/MF6/BK-MF6-04--bk-mf6-04-opcional-integracao-com-e-fatura.md)
- [BK-MF6-05 - Mapear documentos de integração para **centros de custo**.](../guias-bk/MF6/BK-MF6-05--bk-mf6-05-mapear-documentos-de-integracao-para-centros-de-custo.md)
- [BK-MF6-06 - Registar **auditoria**: quem, quando, o quê, em operações sensíveis.](../guias-bk/MF6/BK-MF6-06--bk-mf6-06-registar-auditoria-quem-quando-o-que-em-operacoes-sensiveis.md)
- [BK-MF6-07 - Registar **logs de integração** (uploads, SAF-T, reconciliações).](../guias-bk/MF6/BK-MF6-07--bk-mf6-07-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md)
- [BK-MF6-08 - Permitir **reabertura de períodos** apenas com registo de motivo.](../guias-bk/MF6/BK-MF6-08--bk-mf6-08-permitir-reabertura-de-periodos-apenas-com-registo-de-motivo.md)
- [BK-MF6-09 - Compatível com Chrome, Edge, Firefox e Safari.](../guias-bk/MF6/BK-MF6-09--bk-mf6-09-compativel-com-chrome-edge-firefox-e-safari.md)
- [BK-MF6-10 - Integração com serviços de email (recuperação de password, alertas).](../guias-bk/MF6/BK-MF6-10--bk-mf6-10-integracao-com-servicos-de-email-recuperacao-de-password-alertas.md)
- [BK-MF6-11 - Exportações disponíveis em CSV, Excel e PDF.](../guias-bk/MF6/BK-MF6-11--bk-mf6-11-exportacoes-disponiveis-em-csv-excel-e-pdf.md)
- [BK-MF6-12 - Importações CSV/Excel com validação e logs de erro.](../guias-bk/MF6/BK-MF6-12--bk-mf6-12-importacoes-csv-excel-com-validacao-e-logs-de-erro.md)
- [BK-MF6-13 - Geração de SAF-T conforme especificações legais (PT).](../guias-bk/MF6/BK-MF6-13--bk-mf6-13-geracao-de-saf-t-conforme-especificacoes-legais-pt.md)
- [BK-MF6-14 - API interna estável para futuras integrações.](../guias-bk/MF6/BK-MF6-14--bk-mf6-14-api-interna-estavel-para-futuras-integracoes.md)

### Step-by-step macro
1. Validar dependências de entrada e BK desbloqueados.
2. Executar BKs por prioridade e evidência mínima.
3. Fechar checklist Smoke/Negativos/Técnico por BK.
4. Sincronizar backlog, guia e estado documental.

### Pronto da macro
- Todos os BK da macro têm evidência completa (`pr`, `proof`, `neg`).
- Nenhum BK com dependência inválida.
- Crosslinks funcionais com BACKLOG-MVP e guias.

## MF7 - Vista Operacional
### Guias disponíveis
- [BK-MF7-01 - Relatórios de vendas, compras, margens e stock.](../guias-bk/MF7/BK-MF7-01--bk-mf7-01-relatorios-de-vendas-compras-margens-e-stock.md)
- [BK-MF7-02 - KPIs executivos (receita, custos, EBITDA, PMR, PMP).](../guias-bk/MF7/BK-MF7-02--bk-mf7-02-kpis-executivos-receita-custos-ebitda-pmr-pmp.md)
- [BK-MF7-03 - Personalização de relatórios e exportação (PDF/Excel).](../guias-bk/MF7/BK-MF7-03--bk-mf7-03-personalizacao-de-relatorios-e-exportacao-pdf-excel.md)
- [BK-MF7-04 - Gerar **insights automáticos** (tendências, riscos, clientes, artigos parados).](../guias-bk/MF7/BK-MF7-04--bk-mf7-04-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados.md)
- [BK-MF7-05 - Sugerir **ações** (ajustar preços, negociar fornecedor, repor stock).](../guias-bk/MF7/BK-MF7-05--bk-mf7-05-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock.md)
- [BK-MF7-06 - Permitir **perguntas em linguagem natural** e responder com dados e fonte.](../guias-bk/MF7/BK-MF7-06--bk-mf7-06-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte.md)
- [BK-MF7-07 - Emitir **alertas inteligentes** (cashflow, desvios, ruturas).](../guias-bk/MF7/BK-MF7-07--bk-mf7-07-emitir-alertas-inteligentes-cashflow-desvios-ruturas.md)
- [BK-MF7-08 - Mostrar **explicações e fontes** de cada insight.](../guias-bk/MF7/BK-MF7-08--bk-mf7-08-mostrar-explicacoes-e-fontes-de-cada-insight.md)
- [BK-MF7-09 - Insights devem incluir explicação e origem dos dados usados.](../guias-bk/MF7/BK-MF7-09--bk-mf7-09-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md)
- [BK-MF7-10 - IA não altera dados contabilísticos; apenas analisa e recomenda.](../guias-bk/MF7/BK-MF7-10--bk-mf7-10-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md)
- [BK-MF7-11 - Alertas configuráveis (ativar/desativar tipos).](../guias-bk/MF7/BK-MF7-11--bk-mf7-11-alertas-configuraveis-ativar-desativar-tipos.md)
- [BK-MF7-12 - IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.](../guias-bk/MF7/BK-MF7-12--bk-mf7-12-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md)

### Step-by-step macro
1. Validar dependências de entrada e BK desbloqueados.
2. Executar BKs por prioridade e evidência mínima.
3. Fechar checklist Smoke/Negativos/Técnico por BK.
4. Sincronizar backlog, guia e estado documental.

### Pronto da macro
- Todos os BK da macro têm evidência completa (`pr`, `proof`, `neg`).
- Nenhum BK com dependência inválida.
- Crosslinks funcionais com BACKLOG-MVP e guias.

## MF8 - Vista Operacional
### Guias disponíveis
- [BK-MF8-01 - Criar/editar lembretes (prazos, pagamentos, impostos).](../guias-bk/MF8/BK-MF8-01--bk-mf8-01-criar-editar-lembretes-prazos-pagamentos-impostos.md)
- [BK-MF8-02 - Criar e atribuir tarefas com estado e prazo.](../guias-bk/MF8/BK-MF8-02--bk-mf8-02-criar-e-atribuir-tarefas-com-estado-e-prazo.md)
- [BK-MF8-03 - Notificações (in-app/email) para lembretes e alertas da IA.](../guias-bk/MF8/BK-MF8-03--bk-mf8-03-notificacoes-in-app-email-para-lembretes-e-alertas-da-ia.md)
- [BK-MF8-04 - Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade).](../guias-bk/MF8/BK-MF8-04--bk-mf8-04-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-i.md)
- [BK-MF8-05 - Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas.](../guias-bk/MF8/BK-MF8-05--bk-mf8-05-layout-responsivo-desktop-tablet-mobile-com-grelhas-e-tabelas-adaptada.md)
- [BK-MF8-06 - A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads).](../guias-bk/MF8/BK-MF8-06--bk-mf8-06-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-vali.md)
- [BK-MF8-07 - Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade).](../guias-bk/MF8/BK-MF8-07--bk-mf8-07-cumprir-regras-basicas-de-acessibilidade-contraste-headings-legibilida.md)
- [BK-MF8-08 - Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC).](../guias-bk/MF8/BK-MF8-08--bk-mf8-08-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-i.md)
- [BK-MF8-09 - As mensagens de erro devem ser claras e indicar como resolver o problema.](../guias-bk/MF8/BK-MF8-09--bk-mf8-09-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-proble.md)
- [BK-MF8-10 - Interface em português de Portugal.](../guias-bk/MF8/BK-MF8-10--bk-mf8-10-interface-em-portugues-de-portugal.md)
- [BK-MF8-11 - Preparado para futura tradução (suporte i18n básico).](../guias-bk/MF8/BK-MF8-11--bk-mf8-11-preparado-para-futura-traducao-suporte-i18n-basico.md)
- [BK-MF8-12 - Datas, moedas e separadores no padrão europeu.](../guias-bk/MF8/BK-MF8-12--bk-mf8-12-datas-moedas-e-separadores-no-padrao-europeu.md)

### Step-by-step macro
1. Validar dependências de entrada e BK desbloqueados.
2. Executar BKs por prioridade e evidência mínima.
3. Fechar checklist Smoke/Negativos/Técnico por BK.
4. Sincronizar backlog, guia e estado documental.

### Pronto da macro
- Todos os BK da macro têm evidência completa (`pr`, `proof`, `neg`).
- Nenhum BK com dependência inválida.
- Crosslinks funcionais com BACKLOG-MVP e guias.

## Changelog

- `2026-04-12`: MF views iniciais criadas com links reais para guias BK.
