# Backlog MVP Canónico

## Header
- `doc_id`: `BACKLOG-MVP`
- `path`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Legenda
- Prioridade: `P0` (Must), `P1` (Should), `P2` (Could).
- Estado: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.
- Esforço: `S`, `M`, `L`.

## Snapshot por Macro
| Macro | Total BK | P0 | P1 | P2 |
| :-- | --: | --: | --: | --: |
| MF0 | 21 | 12 | 8 | 1 |
| MF1 | 8 | 8 | 0 | 0 |
| MF2 | 12 | 6 | 6 | 0 |
| MF3 | 13 | 6 | 6 | 1 |
| MF4 | 4 | 4 | 0 | 0 |
| MF5 | 8 | 2 | 6 | 0 |
| MF6 | 14 | 7 | 6 | 1 |
| MF7 | 12 | 5 | 7 | 0 |
| MF8 | 12 | 6 | 5 | 1 |

## Ligação Global BK -> Guia -> Estado Documental
| bk_id | macro | título | owner | prioridade | estado | guia | estado_documental |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF0-01 | MF0 | Dashboard e listagens devem carregar em ≤ 2 segundos. | André | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-01--bk-mf0-01-dashboard-e-listagens-devem-carregar-em-2-segundos.md) | OK |
| BK-MF0-02 | MF0 | Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo. | Oleksii | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-02--bk-mf0-02-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md) | OK |
| BK-MF0-03 | MF0 | Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação. | Pedro | P1 | TODO | [guia](../guias-bk/MF0/BK-MF0-03--bk-mf0-03-suportar-50-utilizadores-simultaneos-por-empresa-sem-degradacao.md) | OK |
| BK-MF0-04 | MF0 | Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos. | Pedro | P1 | TODO | [guia](../guias-bk/MF0/BK-MF0-04--bk-mf0-04-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md) | OK |
| BK-MF0-05 | MF0 | Cálculo de custo (FIFO) deve ser incremental e não bloquear operações. | Oleksii | P1 | TODO | [guia](../guias-bk/MF0/BK-MF0-05--bk-mf0-05-calculo-de-custo-fifo-deve-ser-incremental-e-nao-bloquear-operacoes.md) | OK |
| BK-MF0-06 | MF0 | Arquitetura preparada para escalar horizontalmente. | André | P2 | TODO | [guia](../guias-bk/MF0/BK-MF0-06--bk-mf0-06-arquitetura-preparada-para-escalar-horizontalmente.md) | OK |
| BK-MF0-07 | MF0 | Toda a comunicação deve usar HTTPS (TLS 1.2+). | Oleksii | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-07--bk-mf0-07-toda-a-comunicacao-deve-usar-https-tls-1-2.md) | OK |
| BK-MF0-08 | MF0 | Passwords devem usar bcrypt com salt seguro. | Oleksii | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-08--bk-mf0-08-passwords-devem-usar-bcrypt-com-salt-seguro.md) | OK |
| BK-MF0-09 | MF0 | Sessões com cookies HttpOnly + Secure + SameSite. | Pedro | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-09--bk-mf0-09-sessoes-com-cookies-httponly-secure-samesite.md) | OK |
| BK-MF0-10 | MF0 | Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force). | André | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-10--bk-mf0-10-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md) | OK |
| BK-MF0-11 | MF0 | Chaves de API e credenciais apenas em variáveis de ambiente. | Oleksii | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-11--bk-mf0-11-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md) | OK |
| BK-MF0-12 | MF0 | Auditoria obrigatória em operações sensíveis. | Oleksii | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-12--bk-mf0-12-auditoria-obrigatoria-em-operacoes-sensiveis.md) | OK |
| BK-MF0-13 | MF0 | Backups automáticos diários com restauração possível. | Pedro | P1 | TODO | [guia](../guias-bk/MF0/BK-MF0-13--bk-mf0-13-backups-automaticos-diarios-com-restauracao-possivel.md) | OK |
| BK-MF0-14 | MF0 | Cumprir obrigações legais de retenção (10 anos, contabilidade). | André | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-14--bk-mf0-14-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md) | OK |
| BK-MF0-15 | MF0 | Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA). | Oleksii | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-15--bk-mf0-15-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabili.md) | OK |
| BK-MF0-16 | MF0 | Frontend modular com componentes reutilizáveis. | André | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-16--bk-mf0-16-frontend-modular-com-componentes-reutilizaveis.md) | OK |
| BK-MF0-17 | MF0 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Pedro | P1 | TODO | [guia](../guias-bk/MF0/BK-MF0-17--bk-mf0-17-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-re.md) | OK |
| BK-MF0-18 | MF0 | Logs estruturados (info, warn, error, audit). | Oleksii | P0 | TODO | [guia](../guias-bk/MF0/BK-MF0-18--bk-mf0-18-logs-estruturados-info-warn-error-audit.md) | OK |
| BK-MF0-19 | MF0 | Endpoint de health-check. | André | P1 | TODO | [guia](../guias-bk/MF0/BK-MF0-19--bk-mf0-19-endpoint-de-health-check.md) | OK |
| BK-MF0-20 | MF0 | Deploy com rollback. | Oleksii | P1 | TODO | [guia](../guias-bk/MF0/BK-MF0-20--bk-mf0-20-deploy-com-rollback.md) | OK |
| BK-MF0-21 | MF0 | Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico). | André | P1 | TODO | [guia](../guias-bk/MF0/BK-MF0-21--bk-mf0-21-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md) | OK |
| BK-MF1-01 | MF1 | Registo, login e logout com cookies HttpOnly. | André | P0 | TODO | [guia](../guias-bk/MF1/BK-MF1-01--bk-mf1-01-registo-login-e-logout-com-cookies-httponly.md) | OK |
| BK-MF1-02 | MF1 | Papéis e permissões (**Admin**, **Gestor**, **Contabilista**, **Operacional**, **Auditor**). | Pedro | P0 | TODO | [guia](../guias-bk/MF1/BK-MF1-02--bk-mf1-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md) | OK |
| BK-MF1-03 | MF1 | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). | Oleksii | P0 | TODO | [guia](../guias-bk/MF1/BK-MF1-03--bk-mf1-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empre.md) | OK |
| BK-MF1-04 | MF1 | Gestão de utilizadores: convite, remoção e definição de papéis. | André | P0 | TODO | [guia](../guias-bk/MF1/BK-MF1-04--bk-mf1-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md) | OK |
| BK-MF1-05 | MF1 | Recuperação de password via email. | Oleksii | P0 | TODO | [guia](../guias-bk/MF1/BK-MF1-05--bk-mf1-05-recuperacao-de-password-via-email.md) | OK |
| BK-MF1-06 | MF1 | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). | Pedro | P0 | TODO | [guia](../guias-bk/MF1/BK-MF1-06--bk-mf1-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md) | OK |
| BK-MF1-07 | MF1 | Criar/importar plano de contas (SNC). | Oleksii | P0 | TODO | [guia](../guias-bk/MF1/BK-MF1-07--bk-mf1-07-criar-importar-plano-de-contas-snc.md) | OK |
| BK-MF1-08 | MF1 | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho. | André | P0 | TODO | [guia](../guias-bk/MF1/BK-MF1-08--bk-mf1-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md) | OK |
| BK-MF2-01 | MF2 | Criar e gerir **clientes**. | Pedro | P0 | TODO | [guia](../guias-bk/MF2/BK-MF2-01--bk-mf2-01-criar-e-gerir-clientes.md) | OK |
| BK-MF2-02 | MF2 | Criar e gerir **fornecedores**. | Oleksii | P0 | TODO | [guia](../guias-bk/MF2/BK-MF2-02--bk-mf2-02-criar-e-gerir-fornecedores.md) | OK |
| BK-MF2-03 | MF2 | Criar **artigos/serviços** (SKU, custo, preço, IVA). | André | P0 | TODO | [guia](../guias-bk/MF2/BK-MF2-03--bk-mf2-03-criar-artigos-servicos-sku-custo-preco-iva.md) | OK |
| BK-MF2-04 | MF2 | Criar **armazéns e localizações**. | Oleksii | P1 | TODO | [guia](../guias-bk/MF2/BK-MF2-04--bk-mf2-04-criar-armazens-e-localizacoes.md) | OK |
| BK-MF2-05 | MF2 | Configurar **tabelas de IVA** (taxas, isenções, códigos). | Pedro | P0 | TODO | [guia](../guias-bk/MF2/BK-MF2-05--bk-mf2-05-configurar-tabelas-de-iva-taxas-isencoes-codigos.md) | OK |
| BK-MF2-06 | MF2 | Movimentos de stock: entradas, saídas, transferências, devoluções. | Oleksii | P0 | TODO | [guia](../guias-bk/MF2/BK-MF2-06--bk-mf2-06-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md) | OK |
| BK-MF2-07 | MF2 | Cálculo de custo (FIFO). | André | P0 | TODO | [guia](../guias-bk/MF2/BK-MF2-07--bk-mf2-07-calculo-de-custo-fifo.md) | OK |
| BK-MF2-08 | MF2 | Contagem física e ajustes. | Oleksii | P1 | TODO | [guia](../guias-bk/MF2/BK-MF2-08--bk-mf2-08-contagem-fisica-e-ajustes.md) | OK |
| BK-MF2-09 | MF2 | Alertas de stock (mínimos, máximos, artigos parados). | Pedro | P1 | TODO | [guia](../guias-bk/MF2/BK-MF2-09--bk-mf2-09-alertas-de-stock-minimos-maximos-artigos-parados.md) | OK |
| BK-MF2-10 | MF2 | Configurar **centros de custo** / segmentos analíticos. | André | P1 | TODO | [guia](../guias-bk/MF2/BK-MF2-10--bk-mf2-10-configurar-centros-de-custo-segmentos-analiticos.md) | OK |
| BK-MF2-11 | MF2 | Associar documentos e lançamentos a centros de custo. | Oleksii | P1 | TODO | [guia](../guias-bk/MF2/BK-MF2-11--bk-mf2-11-associar-documentos-e-lancamentos-a-centros-de-custo.md) | OK |
| BK-MF2-12 | MF2 | Relatórios e filtros por centro de custo/segmento. | Pedro | P1 | TODO | [guia](../guias-bk/MF2/BK-MF2-12--bk-mf2-12-relatorios-e-filtros-por-centro-de-custo-segmento.md) | OK |
| BK-MF3-01 | MF3 | Emitir **Fatura, Fatura-Recibo, Nota de Crédito**, com numeração sequencial. | Oleksii | P0 | TODO | [guia](../guias-bk/MF3/BK-MF3-01--bk-mf3-01-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md) | OK |
| BK-MF3-02 | MF3 | Registar **recebimentos** (parciais/totais). | André | P0 | TODO | [guia](../guias-bk/MF3/BK-MF3-02--bk-mf3-02-registar-recebimentos-parciais-totais.md) | OK |
| BK-MF3-03 | MF3 | Gerar **lançamentos contabilísticos automáticos** por venda. | Pedro | P0 | TODO | [guia](../guias-bk/MF3/BK-MF3-03--bk-mf3-03-gerar-lancamentos-contabilisticos-automaticos-por-venda.md) | OK |
| BK-MF3-04 | MF3 | Consultar **títulos em aberto** e antiguidade de saldos. | Oleksii | P1 | TODO | [guia](../guias-bk/MF3/BK-MF3-04--bk-mf3-04-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md) | OK |
| BK-MF3-05 | MF3 | Submeter documentos de venda para **aprovação** antes de emissão definitiva. | André | P1 | TODO | [guia](../guias-bk/MF3/BK-MF3-05--bk-mf3-05-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiv.md) | OK |
| BK-MF3-06 | MF3 | Definir **fluxos e limites** de aprovação (por papel, valor, cliente). | Oleksii | P2 | TODO | [guia](../guias-bk/MF3/BK-MF3-06--bk-mf3-06-definir-fluxos-e-limites-de-aprovacao-por-papel-valor-cliente.md) | OK |
| BK-MF3-07 | MF3 | Registar histórico de **decisões de aprovação** e comentários. | André | P1 | TODO | [guia](../guias-bk/MF3/BK-MF3-07--bk-mf3-07-registar-historico-de-decisoes-de-aprovacao-e-comentarios.md) | OK |
| BK-MF3-08 | MF3 | Registar **Fatura de Fornecedor** e **Nota de Crédito**. | Oleksii | P0 | TODO | [guia](../guias-bk/MF3/BK-MF3-08--bk-mf3-08-registar-fatura-de-fornecedor-e-nota-de-credito.md) | OK |
| BK-MF3-09 | MF3 | Registar **pagamentos** (parciais/totais). | Pedro | P0 | TODO | [guia](../guias-bk/MF3/BK-MF3-09--bk-mf3-09-registar-pagamentos-parciais-totais.md) | OK |
| BK-MF3-10 | MF3 | Gerar **lançamentos contabilísticos automáticos** de compras. | André | P0 | TODO | [guia](../guias-bk/MF3/BK-MF3-10--bk-mf3-10-gerar-lancamentos-contabilisticos-automaticos-de-compras.md) | OK |
| BK-MF3-11 | MF3 | Aprovação de compras com estados “Rascunho → Aprovado → Lançado”. | Oleksii | P1 | TODO | [guia](../guias-bk/MF3/BK-MF3-11--bk-mf3-11-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md) | OK |
| BK-MF3-12 | MF3 | Configurar **limites e papéis** para aprovações (por fornecedor/valor). | Oleksii | P1 | TODO | [guia](../guias-bk/MF3/BK-MF3-12--bk-mf3-12-configurar-limites-e-papeis-para-aprovacoes-por-fornecedor-valor.md) | OK |
| BK-MF3-13 | MF3 | Histórico e justificações para aprovações/reprovações. | Pedro | P1 | TODO | [guia](../guias-bk/MF3/BK-MF3-13--bk-mf3-13-historico-e-justificacoes-para-aprovacoes-reprovacoes.md) | OK |
| BK-MF4-01 | MF4 | Criar e editar **lançamentos manuais** (com anexos). | André | P0 | TODO | [guia](../guias-bk/MF4/BK-MF4-01--bk-mf4-01-criar-e-editar-lancamentos-manuais-com-anexos.md) | OK |
| BK-MF4-02 | MF4 | Consultar **balancete e razão** exportável (PDF/Excel). | Oleksii | P0 | TODO | [guia](../guias-bk/MF4/BK-MF4-02--bk-mf4-02-consultar-balancete-e-razao-exportavel-pdf-excel.md) | OK |
| BK-MF4-03 | MF4 | Gerar **Demonstração de Resultados e Balanço**. | Pedro | P0 | TODO | [guia](../guias-bk/MF4/BK-MF4-03--bk-mf4-03-gerar-demonstracao-de-resultados-e-balanco.md) | OK |
| BK-MF4-04 | MF4 | Gerar **Mapas de IVA** (liquidado/dedutível). | André | P0 | TODO | [guia](../guias-bk/MF4/BK-MF4-04--bk-mf4-04-gerar-mapas-de-iva-liquidado-dedutivel.md) | OK |
| BK-MF5-01 | MF5 | Criar **contas bancárias/caixa** e respetivos saldos. | Oleksii | P0 | TODO | [guia](../guias-bk/MF5/BK-MF5-01--bk-mf5-01-criar-contas-bancarias-caixa-e-respetivos-saldos.md) | OK |
| BK-MF5-02 | MF5 | Importar **extratos bancários** (CSV/OFX) e fazer reconciliação automática. | André | P0 | TODO | [guia](../guias-bk/MF5/BK-MF5-02--bk-mf5-02-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md) | OK |
| BK-MF5-03 | MF5 | Gerar **previsão de tesouraria** (entradas e saídas futuras). | Oleksii | P1 | TODO | [guia](../guias-bk/MF5/BK-MF5-03--bk-mf5-03-gerar-previsao-de-tesouraria-entradas-e-saidas-futuras.md) | OK |
| BK-MF5-04 | MF5 | Definir **workflows de aprovação** por documento (compra, venda, pagamento). | Pedro | P1 | TODO | [guia](../guias-bk/MF5/BK-MF5-04--bk-mf5-04-definir-workflows-de-aprovacao-por-documento-compra-venda-pagamento.md) | OK |
| BK-MF5-05 | MF5 | Configurar **níveis de aprovação** com limites financeiros e escalamentos. | Oleksii | P1 | TODO | [guia](../guias-bk/MF5/BK-MF5-05--bk-mf5-05-configurar-niveis-de-aprovacao-com-limites-financeiros-e-escalamentos.md) | OK |
| BK-MF5-06 | MF5 | Painel para monitorizar aprovações pendentes e SLA por tipo de documento. | André | P1 | TODO | [guia](../guias-bk/MF5/BK-MF5-06--bk-mf5-06-painel-para-monitorizar-aprovacoes-pendentes-e-sla-por-tipo-de-documen.md) | OK |
| BK-MF5-07 | MF5 | Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria. | Oleksii | P1 | TODO | [guia](../guias-bk/MF5/BK-MF5-07--bk-mf5-07-agendar-pagamentos-recebimentos-futuros-com-integracao-as-previsoes-de.md) | OK |
| BK-MF5-08 | MF5 | Gerir **linhas de crédito** (limites, utilização, alertas) por banco. | Pedro | P1 | TODO | [guia](../guias-bk/MF5/BK-MF5-08--bk-mf5-08-gerir-linhas-de-credito-limites-utilizacao-alertas-por-banco.md) | OK |
| BK-MF6-01 | MF6 | Upload de documentos com **OCR** (ler NIF, data, total, IVA). | Oleksii | P1 | TODO | [guia](../guias-bk/MF6/BK-MF6-01--bk-mf6-01-upload-de-documentos-com-ocr-ler-nif-data-total-iva.md) | OK |
| BK-MF6-02 | MF6 | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. | André | P1 | TODO | [guia](../guias-bk/MF6/BK-MF6-02--bk-mf6-02-importar-csv-excel-de-clientes-fornecedores-artigos-e-extratos.md) | OK |
| BK-MF6-03 | MF6 | Exportar **SAF-T (PT)** de faturação e contabilidade. | André | P0 | TODO | [guia](../guias-bk/MF6/BK-MF6-03--bk-mf6-03-exportar-saf-t-pt-de-faturacao-e-contabilidade.md) | OK |
| BK-MF6-04 | MF6 | (Opcional) Integração com **e-Fatura**. | Oleksii | P2 | TODO | [guia](../guias-bk/MF6/BK-MF6-04--bk-mf6-04-opcional-integracao-com-e-fatura.md) | OK |
| BK-MF6-05 | MF6 | Mapear documentos de integração para **centros de custo**. | Oleksii | P1 | TODO | [guia](../guias-bk/MF6/BK-MF6-05--bk-mf6-05-mapear-documentos-de-integracao-para-centros-de-custo.md) | OK |
| BK-MF6-06 | MF6 | Registar **auditoria**: quem, quando, o quê, em operações sensíveis. | Pedro | P0 | TODO | [guia](../guias-bk/MF6/BK-MF6-06--bk-mf6-06-registar-auditoria-quem-quando-o-que-em-operacoes-sensiveis.md) | OK |
| BK-MF6-07 | MF6 | Registar **logs de integração** (uploads, SAF-T, reconciliações). | Oleksii | P0 | TODO | [guia](../guias-bk/MF6/BK-MF6-07--bk-mf6-07-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md) | OK |
| BK-MF6-08 | MF6 | Permitir **reabertura de períodos** apenas com registo de motivo. | André | P1 | TODO | [guia](../guias-bk/MF6/BK-MF6-08--bk-mf6-08-permitir-reabertura-de-periodos-apenas-com-registo-de-motivo.md) | OK |
| BK-MF6-09 | MF6 | Compatível com Chrome, Edge, Firefox e Safari. | André | P0 | TODO | [guia](../guias-bk/MF6/BK-MF6-09--bk-mf6-09-compativel-com-chrome-edge-firefox-e-safari.md) | OK |
| BK-MF6-10 | MF6 | Integração com serviços de email (recuperação de password, alertas). | Oleksii | P0 | TODO | [guia](../guias-bk/MF6/BK-MF6-10--bk-mf6-10-integracao-com-servicos-de-email-recuperacao-de-password-alertas.md) | OK |
| BK-MF6-11 | MF6 | Exportações disponíveis em CSV, Excel e PDF. | Pedro | P1 | TODO | [guia](../guias-bk/MF6/BK-MF6-11--bk-mf6-11-exportacoes-disponiveis-em-csv-excel-e-pdf.md) | OK |
| BK-MF6-12 | MF6 | Importações CSV/Excel com validação e logs de erro. | André | P0 | TODO | [guia](../guias-bk/MF6/BK-MF6-12--bk-mf6-12-importacoes-csv-excel-com-validacao-e-logs-de-erro.md) | OK |
| BK-MF6-13 | MF6 | Geração de SAF-T conforme especificações legais (PT). | Oleksii | P0 | TODO | [guia](../guias-bk/MF6/BK-MF6-13--bk-mf6-13-geracao-de-saf-t-conforme-especificacoes-legais-pt.md) | OK |
| BK-MF6-14 | MF6 | API interna estável para futuras integrações. | Pedro | P1 | TODO | [guia](../guias-bk/MF6/BK-MF6-14--bk-mf6-14-api-interna-estavel-para-futuras-integracoes.md) | OK |
| BK-MF7-01 | MF7 | Relatórios de vendas, compras, margens e stock. | Sofia | P0 | TODO | [guia](../guias-bk/MF7/BK-MF7-01--bk-mf7-01-relatorios-de-vendas-compras-margens-e-stock.md) | OK |
| BK-MF7-02 | MF7 | KPIs executivos (receita, custos, EBITDA, PMR, PMP). | Sofia | P1 | TODO | [guia](../guias-bk/MF7/BK-MF7-02--bk-mf7-02-kpis-executivos-receita-custos-ebitda-pmr-pmp.md) | OK |
| BK-MF7-03 | MF7 | Personalização de relatórios e exportação (PDF/Excel). | Sofia | P1 | TODO | [guia](../guias-bk/MF7/BK-MF7-03--bk-mf7-03-personalizacao-de-relatorios-e-exportacao-pdf-excel.md) | OK |
| BK-MF7-04 | MF7 | Gerar **insights automáticos** (tendências, riscos, clientes, artigos parados). | André | P0 | TODO | [guia](../guias-bk/MF7/BK-MF7-04--bk-mf7-04-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados.md) | OK |
| BK-MF7-05 | MF7 | Sugerir **ações** (ajustar preços, negociar fornecedor, repor stock). | Oleksii | P1 | TODO | [guia](../guias-bk/MF7/BK-MF7-05--bk-mf7-05-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock.md) | OK |
| BK-MF7-06 | MF7 | Permitir **perguntas em linguagem natural** e responder com dados e fonte. | Oleksii | P1 | TODO | [guia](../guias-bk/MF7/BK-MF7-06--bk-mf7-06-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte.md) | OK |
| BK-MF7-07 | MF7 | Emitir **alertas inteligentes** (cashflow, desvios, ruturas). | Pedro | P1 | TODO | [guia](../guias-bk/MF7/BK-MF7-07--bk-mf7-07-emitir-alertas-inteligentes-cashflow-desvios-ruturas.md) | OK |
| BK-MF7-08 | MF7 | Mostrar **explicações e fontes** de cada insight. | André | P0 | TODO | [guia](../guias-bk/MF7/BK-MF7-08--bk-mf7-08-mostrar-explicacoes-e-fontes-de-cada-insight.md) | OK |
| BK-MF7-09 | MF7 | Insights devem incluir explicação e origem dos dados usados. | Pedro | P0 | TODO | [guia](../guias-bk/MF7/BK-MF7-09--bk-mf7-09-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md) | OK |
| BK-MF7-10 | MF7 | IA não altera dados contabilísticos; apenas analisa e recomenda. | Oleksii | P0 | TODO | [guia](../guias-bk/MF7/BK-MF7-10--bk-mf7-10-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md) | OK |
| BK-MF7-11 | MF7 | Alertas configuráveis (ativar/desativar tipos). | Sofia | P1 | TODO | [guia](../guias-bk/MF7/BK-MF7-11--bk-mf7-11-alertas-configuraveis-ativar-desativar-tipos.md) | OK |
| BK-MF7-12 | MF7 | IA deve evitar enviesamentos e sugerir ações baseadas em dados reais. | André | P1 | TODO | [guia](../guias-bk/MF7/BK-MF7-12--bk-mf7-12-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md) | OK |
| BK-MF8-01 | MF8 | Criar/editar lembretes (prazos, pagamentos, impostos). | Sofia | P1 | TODO | [guia](../guias-bk/MF8/BK-MF8-01--bk-mf8-01-criar-editar-lembretes-prazos-pagamentos-impostos.md) | OK |
| BK-MF8-02 | MF8 | Criar e atribuir tarefas com estado e prazo. | Sofia | P1 | TODO | [guia](../guias-bk/MF8/BK-MF8-02--bk-mf8-02-criar-e-atribuir-tarefas-com-estado-e-prazo.md) | OK |
| BK-MF8-03 | MF8 | Notificações (in-app/email) para lembretes e alertas da IA. | Sofia | P1 | TODO | [guia](../guias-bk/MF8/BK-MF8-03--bk-mf8-03-notificacoes-in-app-email-para-lembretes-e-alertas-da-ia.md) | OK |
| BK-MF8-04 | MF8 | Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade). | Sofia | P0 | TODO | [guia](../guias-bk/MF8/BK-MF8-04--bk-mf8-04-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-i.md) | OK |
| BK-MF8-05 | MF8 | Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas. | Sofia | P0 | TODO | [guia](../guias-bk/MF8/BK-MF8-05--bk-mf8-05-layout-responsivo-desktop-tablet-mobile-com-grelhas-e-tabelas-adaptada.md) | OK |
| BK-MF8-06 | MF8 | A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads). | Sofia | P0 | TODO | [guia](../guias-bk/MF8/BK-MF8-06--bk-mf8-06-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-vali.md) | OK |
| BK-MF8-07 | MF8 | Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade). | Sofia | P1 | TODO | [guia](../guias-bk/MF8/BK-MF8-07--bk-mf8-07-cumprir-regras-basicas-de-acessibilidade-contraste-headings-legibilida.md) | OK |
| BK-MF8-08 | MF8 | Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC). | Sofia | P0 | TODO | [guia](../guias-bk/MF8/BK-MF8-08--bk-mf8-08-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-i.md) | OK |
| BK-MF8-09 | MF8 | As mensagens de erro devem ser claras e indicar como resolver o problema. | Sofia | P0 | TODO | [guia](../guias-bk/MF8/BK-MF8-09--bk-mf8-09-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-proble.md) | OK |
| BK-MF8-10 | MF8 | Interface em português de Portugal. | Sofia | P0 | TODO | [guia](../guias-bk/MF8/BK-MF8-10--bk-mf8-10-interface-em-portugues-de-portugal.md) | OK |
| BK-MF8-11 | MF8 | Preparado para futura tradução (suporte i18n básico). | Sofia | P2 | TODO | [guia](../guias-bk/MF8/BK-MF8-11--bk-mf8-11-preparado-para-futura-traducao-suporte-i18n-basico.md) | OK |
| BK-MF8-12 | MF8 | Datas, moedas e separadores no padrão europeu. | Sofia | P1 | TODO | [guia](../guias-bk/MF8/BK-MF8-12--bk-mf8-12-datas-moedas-e-separadores-no-padrao-europeu.md) | OK |

## Macro MF0
| bk_id | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF0-01 | Dashboard e listagens devem carregar em ≤ 2 segundos. | André | Oleksii | P0 | TODO | M | - | RNF07 |
| BK-MF0-02 | Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo. | Oleksii | André | P0 | TODO | M | - | RNF08 |
| BK-MF0-03 | Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação. | Pedro | Sofia | P1 | TODO | S | - | RNF09 |
| BK-MF0-04 | Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos. | Pedro | André | P1 | TODO | L | - | RNF10 |
| BK-MF0-05 | Cálculo de custo (FIFO) deve ser incremental e não bloquear operações. | Oleksii | Pedro | P1 | TODO | S | - | RNF11 |
| BK-MF0-06 | Arquitetura preparada para escalar horizontalmente. | André | Oleksii | P2 | TODO | L | - | RNF12 |
| BK-MF0-07 | Toda a comunicação deve usar HTTPS (TLS 1.2+). | Oleksii | Pedro | P0 | TODO | M | - | RNF13 |
| BK-MF0-08 | Passwords devem usar bcrypt com salt seguro. | Oleksii | Sofia | P0 | TODO | M | - | RNF14 |
| BK-MF0-09 | Sessões com cookies HttpOnly + Secure + SameSite. | Pedro | André | P0 | TODO | M | - | RNF15 |
| BK-MF0-10 | Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force). | André | Oleksii | P0 | TODO | L | - | RNF16 |
| BK-MF0-11 | Chaves de API e credenciais apenas em variáveis de ambiente. | Oleksii | Pedro | P0 | TODO | M | - | RNF17 |
| BK-MF0-12 | Auditoria obrigatória em operações sensíveis. | Oleksii | Sofia | P0 | TODO | L | - | RNF18 |
| BK-MF0-13 | Backups automáticos diários com restauração possível. | Pedro | André | P1 | TODO | L | - | RNF19 |
| BK-MF0-14 | Cumprir obrigações legais de retenção (10 anos, contabilidade). | André | Oleksii | P0 | TODO | M | - | RNF20 |
| BK-MF0-15 | Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA). | Oleksii | Pedro | P0 | TODO | M | - | RNF27 |
| BK-MF0-16 | Frontend modular com componentes reutilizáveis. | André | Sofia | P0 | TODO | M | - | RNF28 |
| BK-MF0-17 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Pedro | André | P1 | TODO | L | - | RNF29 |
| BK-MF0-18 | Logs estruturados (info, warn, error, audit). | Oleksii | Pedro | P0 | TODO | M | - | RNF30 |
| BK-MF0-19 | Endpoint de health-check. | André | Oleksii | P1 | TODO | S | - | RNF31 |
| BK-MF0-20 | Deploy com rollback. | Oleksii | Sofia | P1 | TODO | L | - | RNF32 |
| BK-MF0-21 | Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico). | André | Oleksii | P1 | TODO | S | - | RNF33 |

## Macro MF1
| bk_id | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF1-01 | Registo, login e logout com cookies HttpOnly. | André | Pedro | P0 | TODO | M | - | RF01 |
| BK-MF1-02 | Papéis e permissões (**Admin**, **Gestor**, **Contabilista**, **Operacional**, **Auditor**). | Pedro | André | P0 | TODO | M | BK-MF1-01 | RF02 |
| BK-MF1-03 | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). | Oleksii | Sofia | P0 | TODO | M | BK-MF1-02 | RF03 |
| BK-MF1-04 | Gestão de utilizadores: convite, remoção e definição de papéis. | André | Oleksii | P0 | TODO | M | BK-MF1-03 | RF04 |
| BK-MF1-05 | Recuperação de password via email. | Oleksii | André | P0 | TODO | M | - | RF05 |
| BK-MF1-06 | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). | Pedro | Sofia | P0 | TODO | M | - | RF06 |
| BK-MF1-07 | Criar/importar plano de contas (SNC). | Oleksii | Pedro | P0 | TODO | M | - | RF07 |
| BK-MF1-08 | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho. | André | Oleksii | P0 | TODO | M | BK-MF1-07 | RF08 |

## Macro MF2
| bk_id | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF2-01 | Criar e gerir **clientes**. | Pedro | André | P0 | TODO | M | - | RF09 |
| BK-MF2-02 | Criar e gerir **fornecedores**. | Oleksii | Pedro | P0 | TODO | M | - | RF10 |
| BK-MF2-03 | Criar **artigos/serviços** (SKU, custo, preço, IVA). | André | Sofia | P0 | TODO | M | - | RF11 |
| BK-MF2-04 | Criar **armazéns e localizações**. | Oleksii | André | P1 | TODO | S | - | RF12 |
| BK-MF2-05 | Configurar **tabelas de IVA** (taxas, isenções, códigos). | Pedro | Oleksii | P0 | TODO | M | - | RF13 |
| BK-MF2-06 | Movimentos de stock: entradas, saídas, transferências, devoluções. | Oleksii | Pedro | P0 | TODO | M | BK-MF2-03, BK-MF2-04 | RF27 |
| BK-MF2-07 | Cálculo de custo (FIFO). | André | Sofia | P0 | TODO | M | BK-MF2-06 | RF28 |
| BK-MF2-08 | Contagem física e ajustes. | Oleksii | André | P1 | TODO | S | BK-MF2-06 | RF29 |
| BK-MF2-09 | Alertas de stock (mínimos, máximos, artigos parados). | Pedro | Oleksii | P1 | TODO | S | BK-MF2-06 | RF30 |
| BK-MF2-10 | Configurar **centros de custo** / segmentos analíticos. | André | Pedro | P1 | TODO | S | BK-MF1-07 | RF31 |
| BK-MF2-11 | Associar documentos e lançamentos a centros de custo. | Oleksii | Sofia | P1 | TODO | S | BK-MF2-10 | RF32 |
| BK-MF2-12 | Relatórios e filtros por centro de custo/segmento. | Pedro | André | P1 | TODO | S | BK-MF2-11 | RF33 |

## Macro MF3
| bk_id | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF3-01 | Emitir **Fatura, Fatura-Recibo, Nota de Crédito**, com numeração sequencial. | Oleksii | Pedro | P0 | TODO | M | BK-MF2-01, BK-MF2-03, BK-MF2-05 | RF14 |
| BK-MF3-02 | Registar **recebimentos** (parciais/totais). | André | Oleksii | P0 | TODO | M | - | RF15 |
| BK-MF3-03 | Gerar **lançamentos contabilísticos automáticos** por venda. | Pedro | Sofia | P0 | TODO | M | BK-MF3-01 | RF16 |
| BK-MF3-04 | Consultar **títulos em aberto** e antiguidade de saldos. | Oleksii | André | P1 | TODO | S | - | RF17 |
| BK-MF3-05 | Submeter documentos de venda para **aprovação** antes de emissão definitiva. | André | Oleksii | P1 | TODO | S | BK-MF3-01 | RF18 |
| BK-MF3-06 | Definir **fluxos e limites** de aprovação (por papel, valor, cliente). | Oleksii | Pedro | P2 | TODO | S | BK-MF3-05 | RF19 |
| BK-MF3-07 | Registar histórico de **decisões de aprovação** e comentários. | André | Sofia | P1 | TODO | S | BK-MF3-05 | RF20 |
| BK-MF3-08 | Registar **Fatura de Fornecedor** e **Nota de Crédito**. | Oleksii | André | P0 | TODO | M | BK-MF2-02, BK-MF2-03, BK-MF2-05 | RF21 |
| BK-MF3-09 | Registar **pagamentos** (parciais/totais). | Pedro | Oleksii | P0 | TODO | M | BK-MF3-08 | RF22 |
| BK-MF3-10 | Gerar **lançamentos contabilísticos automáticos** de compras. | André | Pedro | P0 | TODO | M | BK-MF3-08 | RF23 |
| BK-MF3-11 | Aprovação de compras com estados “Rascunho → Aprovado → Lançado”. | Oleksii | Sofia | P1 | TODO | S | - | RF24 |
| BK-MF3-12 | Configurar **limites e papéis** para aprovações (por fornecedor/valor). | Oleksii | André | P1 | TODO | S | BK-MF3-11 | RF25 |
| BK-MF3-13 | Histórico e justificações para aprovações/reprovações. | Pedro | Oleksii | P1 | TODO | S | BK-MF3-11 | RF26 |

## Macro MF4
| bk_id | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF4-01 | Criar e editar **lançamentos manuais** (com anexos). | André | Pedro | P0 | TODO | M | BK-MF1-07 | RF34 |
| BK-MF4-02 | Consultar **balancete e razão** exportável (PDF/Excel). | Oleksii | Sofia | P0 | TODO | L | BK-MF4-01 | RF35 |
| BK-MF4-03 | Gerar **Demonstração de Resultados e Balanço**. | Pedro | André | P0 | TODO | L | BK-MF4-02 | RF36 |
| BK-MF4-04 | Gerar **Mapas de IVA** (liquidado/dedutível). | André | Oleksii | P0 | TODO | M | BK-MF3-03, BK-MF3-10 | RF37 |

## Macro MF5
| bk_id | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF5-01 | Criar **contas bancárias/caixa** e respetivos saldos. | Oleksii | Pedro | P0 | TODO | M | - | RF38 |
| BK-MF5-02 | Importar **extratos bancários** (CSV/OFX) e fazer reconciliação automática. | André | Sofia | P0 | TODO | L | BK-MF5-01, BK-MF3-01, BK-MF3-08 | RF39 |
| BK-MF5-03 | Gerar **previsão de tesouraria** (entradas e saídas futuras). | Oleksii | André | P1 | TODO | S | BK-MF3-02, BK-MF3-09 | RF40 |
| BK-MF5-04 | Definir **workflows de aprovação** por documento (compra, venda, pagamento). | Pedro | Oleksii | P1 | TODO | L | BK-MF3-08, BK-MF2-09 | RF60 |
| BK-MF5-05 | Configurar **níveis de aprovação** com limites financeiros e escalamentos. | Oleksii | Pedro | P1 | TODO | L | BK-MF5-04 | RF61 |
| BK-MF5-06 | Painel para monitorizar aprovações pendentes e SLA por tipo de documento. | André | Sofia | P1 | TODO | S | BK-MF5-04 | RF62 |
| BK-MF5-07 | Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria. | Oleksii | André | P1 | TODO | S | BK-MF5-02 | RF63 |
| BK-MF5-08 | Gerir **linhas de crédito** (limites, utilização, alertas) por banco. | Pedro | Oleksii | P1 | TODO | L | BK-MF5-01 | RF64 |

## Macro MF6
| bk_id | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF6-01 | Upload de documentos com **OCR** (ler NIF, data, total, IVA). | Oleksii | Pedro | P1 | TODO | L | BK-MF3-08 | RF41 |
| BK-MF6-02 | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. | André | Sofia | P1 | TODO | S | - | RF42 |
| BK-MF6-03 | Exportar **SAF-T (PT)** de faturação e contabilidade. | André | Oleksii | P0 | TODO | L | - | RF43 |
| BK-MF6-04 | (Opcional) Integração com **e-Fatura**. | Oleksii | André | P2 | TODO | S | - | RF44 |
| BK-MF6-05 | Mapear documentos de integração para **centros de custo**. | Oleksii | Pedro | P1 | TODO | S | BK-MF2-10 | RF45 |
| BK-MF6-06 | Registar **auditoria**: quem, quando, o quê, em operações sensíveis. | Pedro | Sofia | P0 | TODO | L | - | RF57 |
| BK-MF6-07 | Registar **logs de integração** (uploads, SAF-T, reconciliações). | Oleksii | André | P0 | TODO | L | - | RF58 |
| BK-MF6-08 | Permitir **reabertura de períodos** apenas com registo de motivo. | André | Oleksii | P1 | TODO | S | BK-MF1-08 | RF59 |
| BK-MF6-09 | Compatível com Chrome, Edge, Firefox e Safari. | André | Pedro | P0 | TODO | M | - | RNF21 |
| BK-MF6-10 | Integração com serviços de email (recuperação de password, alertas). | Oleksii | Sofia | P0 | TODO | M | - | RNF22 |
| BK-MF6-11 | Exportações disponíveis em CSV, Excel e PDF. | Pedro | André | P1 | TODO | S | - | RNF23 |
| BK-MF6-12 | Importações CSV/Excel com validação e logs de erro. | André | Oleksii | P0 | TODO | M | - | RNF24 |
| BK-MF6-13 | Geração de SAF-T conforme especificações legais (PT). | Oleksii | Pedro | P0 | TODO | L | - | RNF25 |
| BK-MF6-14 | API interna estável para futuras integrações. | Pedro | Sofia | P1 | TODO | L | - | RNF26 |

## Macro MF7
| bk_id | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF7-01 | Relatórios de vendas, compras, margens e stock. | Sofia | André | P0 | TODO | M | BK-MF3-01, BK-MF3-08, BK-MF2-06 | RF46 |
| BK-MF7-02 | KPIs executivos (receita, custos, EBITDA, PMR, PMP). | Sofia | Oleksii | P1 | TODO | S | BK-MF7-01 | RF47 |
| BK-MF7-03 | Personalização de relatórios e exportação (PDF/Excel). | Sofia | Pedro | P1 | TODO | S | BK-MF7-01 | RF48 |
| BK-MF7-04 | Gerar **insights automáticos** (tendências, riscos, clientes, artigos parados). | André | Sofia | P0 | TODO | L | BK-MF7-01 | RF49 |
| BK-MF7-05 | Sugerir **ações** (ajustar preços, negociar fornecedor, repor stock). | Oleksii | André | P1 | TODO | S | BK-MF7-04 | RF50 |
| BK-MF7-06 | Permitir **perguntas em linguagem natural** e responder com dados e fonte. | Oleksii | Pedro | P1 | TODO | L | BK-MF7-01 | RF51 |
| BK-MF7-07 | Emitir **alertas inteligentes** (cashflow, desvios, ruturas). | Pedro | Oleksii | P1 | TODO | S | BK-MF5-03, BK-MF2-09 | RF52 |
| BK-MF7-08 | Mostrar **explicações e fontes** de cada insight. | André | Sofia | P0 | TODO | M | BK-MF7-04 | RF53 |
| BK-MF7-09 | Insights devem incluir explicação e origem dos dados usados. | Pedro | André | P0 | TODO | L | - | RNF34 |
| BK-MF7-10 | IA não altera dados contabilísticos; apenas analisa e recomenda. | Oleksii | Pedro | P0 | TODO | M | - | RNF35 |
| BK-MF7-11 | Alertas configuráveis (ativar/desativar tipos). | Sofia | Oleksii | P1 | TODO | S | - | RNF36 |
| BK-MF7-12 | IA deve evitar enviesamentos e sugerir ações baseadas em dados reais. | André | Sofia | P1 | TODO | S | - | RNF37 |

## Macro MF8
| bk_id | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF8-01 | Criar/editar lembretes (prazos, pagamentos, impostos). | Sofia | André | P1 | TODO | S | - | RF54 |
| BK-MF8-02 | Criar e atribuir tarefas com estado e prazo. | Sofia | Oleksii | P1 | TODO | S | - | RF55 |
| BK-MF8-03 | Notificações (in-app/email) para lembretes e alertas da IA. | Sofia | Pedro | P1 | TODO | S | BK-MF8-01, BK-MF7-07 | RF56 |
| BK-MF8-04 | Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade). | Sofia | André | P0 | TODO | M | - | RNF01 |
| BK-MF8-05 | Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas. | Sofia | Oleksii | P0 | TODO | M | - | RNF02 |
| BK-MF8-06 | A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads). | Sofia | Pedro | P0 | TODO | M | - | RNF03 |
| BK-MF8-07 | Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade). | Sofia | André | P1 | TODO | S | - | RNF04 |
| BK-MF8-08 | Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC). | Sofia | Oleksii | P0 | TODO | M | - | RNF05 |
| BK-MF8-09 | As mensagens de erro devem ser claras e indicar como resolver o problema. | Sofia | Pedro | P0 | TODO | M | - | RNF06 |
| BK-MF8-10 | Interface em português de Portugal. | Sofia | André | P0 | TODO | M | - | RNF38 |
| BK-MF8-11 | Preparado para futura tradução (suporte i18n básico). | Sofia | Oleksii | P2 | TODO | S | - | RNF39 |
| BK-MF8-12 | Datas, moedas e separadores no padrão europeu. | Sofia | Pedro | P1 | TODO | S | - | RNF40 |

## Changelog

- `2026-04-12`: Backlog canónico inicial criado com cobertura integral BK↔guia.
