# Matriz Canónica BK (Fonte Única)

## Header
- `doc_id`: `MATRIZ-CANONICA-BK`
- `path`: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Matriz
| bk_id | macro | título | owner | apoio | prioridade | estado | esforço | dependências | rf_rnf | slug_alvo | fase_documental | próximo_bk_recomendado |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| BK-MF0-01 | MF0 | Dashboard e listagens devem carregar em ≤ 2 segundos. | André | Oleksii | P0 | TODO | M | - | RNF07 | bk-mf0-01-dashboard-e-listagens-devem-carregar-em-2-segundos | Fase 1 | BK-MF0-02 |
| BK-MF0-02 | MF0 | Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo. | Oleksii | André | P0 | TODO | M | - | RNF08 | bk-mf0-02-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo | Fase 1 | BK-MF0-03 |
| BK-MF0-03 | MF0 | Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação. | Pedro | Sofia | P1 | TODO | S | - | RNF09 | bk-mf0-03-suportar-50-utilizadores-simultaneos-por-empresa-sem-degradacao | Fase 1 | BK-MF0-04 |
| BK-MF0-04 | MF0 | Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos. | Pedro | André | P1 | TODO | L | - | RNF10 | bk-mf0-04-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos | Fase 1 | BK-MF0-05 |
| BK-MF0-05 | MF0 | Cálculo de custo (FIFO) deve ser incremental e não bloquear operações. | Oleksii | Pedro | P1 | TODO | S | - | RNF11 | bk-mf0-05-calculo-de-custo-fifo-deve-ser-incremental-e-nao-bloquear-operacoes | Fase 1 | BK-MF0-06 |
| BK-MF0-06 | MF0 | Arquitetura preparada para escalar horizontalmente. | André | Oleksii | P2 | TODO | L | - | RNF12 | bk-mf0-06-arquitetura-preparada-para-escalar-horizontalmente | Fase 1 | BK-MF0-07 |
| BK-MF0-07 | MF0 | Toda a comunicação deve usar HTTPS (TLS 1.2+). | Oleksii | Pedro | P0 | TODO | M | - | RNF13 | bk-mf0-07-toda-a-comunicacao-deve-usar-https-tls-1-2 | Fase 1 | BK-MF0-08 |
| BK-MF0-08 | MF0 | Passwords devem usar bcrypt com salt seguro. | Oleksii | Sofia | P0 | TODO | M | - | RNF14 | bk-mf0-08-passwords-devem-usar-bcrypt-com-salt-seguro | Fase 1 | BK-MF0-09 |
| BK-MF0-09 | MF0 | Sessões com cookies HttpOnly + Secure + SameSite. | Pedro | André | P0 | TODO | M | - | RNF15 | bk-mf0-09-sessoes-com-cookies-httponly-secure-samesite | Fase 1 | BK-MF0-10 |
| BK-MF0-10 | MF0 | Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force). | André | Oleksii | P0 | TODO | L | - | RNF16 | bk-mf0-10-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force | Fase 1 | BK-MF0-11 |
| BK-MF0-11 | MF0 | Chaves de API e credenciais apenas em variáveis de ambiente. | Oleksii | Pedro | P0 | TODO | M | - | RNF17 | bk-mf0-11-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente | Fase 1 | BK-MF0-12 |
| BK-MF0-12 | MF0 | Auditoria obrigatória em operações sensíveis. | Oleksii | Sofia | P0 | TODO | L | - | RNF18 | bk-mf0-12-auditoria-obrigatoria-em-operacoes-sensiveis | Fase 1 | BK-MF0-13 |
| BK-MF0-13 | MF0 | Backups automáticos diários com restauração possível. | Pedro | André | P1 | TODO | L | - | RNF19 | bk-mf0-13-backups-automaticos-diarios-com-restauracao-possivel | Fase 1 | BK-MF0-14 |
| BK-MF0-14 | MF0 | Cumprir obrigações legais de retenção (10 anos, contabilidade). | André | Oleksii | P0 | TODO | M | - | RNF20 | bk-mf0-14-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade | Fase 1 | BK-MF0-15 |
| BK-MF0-15 | MF0 | Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA). | Oleksii | Pedro | P0 | TODO | M | - | RNF27 | bk-mf0-15-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabili | Fase 1 | BK-MF0-16 |
| BK-MF0-16 | MF0 | Frontend modular com componentes reutilizáveis. | André | Sofia | P0 | TODO | M | - | RNF28 | bk-mf0-16-frontend-modular-com-componentes-reutilizaveis | Fase 1 | BK-MF0-17 |
| BK-MF0-17 | MF0 | Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação). | Pedro | André | P1 | TODO | L | - | RNF29 | bk-mf0-17-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-re | Fase 1 | BK-MF0-18 |
| BK-MF0-18 | MF0 | Logs estruturados (info, warn, error, audit). | Oleksii | Pedro | P0 | TODO | M | - | RNF30 | bk-mf0-18-logs-estruturados-info-warn-error-audit | Fase 1 | BK-MF0-19 |
| BK-MF0-19 | MF0 | Endpoint de health-check. | André | Oleksii | P1 | TODO | S | - | RNF31 | bk-mf0-19-endpoint-de-health-check | Fase 1 | BK-MF0-20 |
| BK-MF0-20 | MF0 | Deploy com rollback. | Oleksii | Sofia | P1 | TODO | L | - | RNF32 | bk-mf0-20-deploy-com-rollback | Fase 1 | BK-MF0-21 |
| BK-MF0-21 | MF0 | Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico). | André | Oleksii | P1 | TODO | S | - | RNF33 | bk-mf0-21-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico | Fase 1 | BK-MF1-01 |
| BK-MF1-01 | MF1 | Registo, login e logout com cookies HttpOnly. | André | Pedro | P0 | TODO | M | - | RF01 | bk-mf1-01-registo-login-e-logout-com-cookies-httponly | Fase 1 | BK-MF1-02 |
| BK-MF1-02 | MF1 | Papéis e permissões (**Admin**, **Gestor**, **Contabilista**, **Operacional**, **Auditor**). | Pedro | André | P0 | TODO | M | BK-MF1-01 | RF02 | bk-mf1-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor | Fase 1 | BK-MF1-03 |
| BK-MF1-03 | MF1 | Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). | Oleksii | Sofia | P0 | TODO | M | BK-MF1-02 | RF03 | bk-mf1-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empre | Fase 1 | BK-MF1-04 |
| BK-MF1-04 | MF1 | Gestão de utilizadores: convite, remoção e definição de papéis. | André | Oleksii | P0 | TODO | M | BK-MF1-03 | RF04 | bk-mf1-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis | Fase 1 | BK-MF1-05 |
| BK-MF1-05 | MF1 | Recuperação de password via email. | Oleksii | André | P0 | TODO | M | - | RF05 | bk-mf1-05-recuperacao-de-password-via-email | Fase 1 | BK-MF1-06 |
| BK-MF1-06 | MF1 | Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal). | Pedro | Sofia | P0 | TODO | M | - | RF06 | bk-mf1-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal | Fase 1 | BK-MF1-07 |
| BK-MF1-07 | MF1 | Criar/importar plano de contas (SNC). | Oleksii | Pedro | P0 | TODO | M | - | RF07 | bk-mf1-07-criar-importar-plano-de-contas-snc | Fase 1 | BK-MF1-08 |
| BK-MF1-08 | MF1 | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho. | André | Oleksii | P0 | TODO | M | BK-MF1-07 | RF08 | bk-mf1-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho | Fase 1 | BK-MF2-01 |
| BK-MF2-01 | MF2 | Criar e gerir **clientes**. | Pedro | André | P0 | TODO | M | - | RF09 | bk-mf2-01-criar-e-gerir-clientes | Fase 1 | BK-MF2-02 |
| BK-MF2-02 | MF2 | Criar e gerir **fornecedores**. | Oleksii | Pedro | P0 | TODO | M | - | RF10 | bk-mf2-02-criar-e-gerir-fornecedores | Fase 1 | BK-MF2-03 |
| BK-MF2-03 | MF2 | Criar **artigos/serviços** (SKU, custo, preço, IVA). | André | Sofia | P0 | TODO | M | - | RF11 | bk-mf2-03-criar-artigos-servicos-sku-custo-preco-iva | Fase 1 | BK-MF2-04 |
| BK-MF2-04 | MF2 | Criar **armazéns e localizações**. | Oleksii | André | P1 | TODO | S | - | RF12 | bk-mf2-04-criar-armazens-e-localizacoes | Fase 1 | BK-MF2-05 |
| BK-MF2-05 | MF2 | Configurar **tabelas de IVA** (taxas, isenções, códigos). | Pedro | Oleksii | P0 | TODO | M | - | RF13 | bk-mf2-05-configurar-tabelas-de-iva-taxas-isencoes-codigos | Fase 1 | BK-MF2-06 |
| BK-MF2-06 | MF2 | Movimentos de stock: entradas, saídas, transferências, devoluções. | Oleksii | Pedro | P0 | TODO | M | BK-MF2-03, BK-MF2-04 | RF27 | bk-mf2-06-movimentos-de-stock-entradas-saidas-transferencias-devolucoes | Fase 1 | BK-MF2-07 |
| BK-MF2-07 | MF2 | Cálculo de custo (FIFO). | André | Sofia | P0 | TODO | M | BK-MF2-06 | RF28 | bk-mf2-07-calculo-de-custo-fifo | Fase 1 | BK-MF2-08 |
| BK-MF2-08 | MF2 | Contagem física e ajustes. | Oleksii | André | P1 | TODO | S | BK-MF2-06 | RF29 | bk-mf2-08-contagem-fisica-e-ajustes | Fase 1 | BK-MF2-09 |
| BK-MF2-09 | MF2 | Alertas de stock (mínimos, máximos, artigos parados). | Pedro | Oleksii | P1 | TODO | S | BK-MF2-06 | RF30 | bk-mf2-09-alertas-de-stock-minimos-maximos-artigos-parados | Fase 1 | BK-MF2-10 |
| BK-MF2-10 | MF2 | Configurar **centros de custo** / segmentos analíticos. | André | Pedro | P1 | TODO | S | BK-MF1-07 | RF31 | bk-mf2-10-configurar-centros-de-custo-segmentos-analiticos | Fase 1 | BK-MF2-11 |
| BK-MF2-11 | MF2 | Associar documentos e lançamentos a centros de custo. | Oleksii | Sofia | P1 | TODO | S | BK-MF2-10 | RF32 | bk-mf2-11-associar-documentos-e-lancamentos-a-centros-de-custo | Fase 1 | BK-MF2-12 |
| BK-MF2-12 | MF2 | Relatórios e filtros por centro de custo/segmento. | Pedro | André | P1 | TODO | S | BK-MF2-11 | RF33 | bk-mf2-12-relatorios-e-filtros-por-centro-de-custo-segmento | Fase 1 | BK-MF3-01 |
| BK-MF3-01 | MF3 | Emitir **Fatura, Fatura-Recibo, Nota de Crédito**, com numeração sequencial. | Oleksii | Pedro | P0 | TODO | M | BK-MF2-01, BK-MF2-03, BK-MF2-05 | RF14 | bk-mf3-01-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial | Fase 2 | BK-MF3-02 |
| BK-MF3-02 | MF3 | Registar **recebimentos** (parciais/totais). | André | Oleksii | P0 | TODO | M | - | RF15 | bk-mf3-02-registar-recebimentos-parciais-totais | Fase 2 | BK-MF3-03 |
| BK-MF3-03 | MF3 | Gerar **lançamentos contabilísticos automáticos** por venda. | Pedro | Sofia | P0 | TODO | M | BK-MF3-01 | RF16 | bk-mf3-03-gerar-lancamentos-contabilisticos-automaticos-por-venda | Fase 2 | BK-MF3-04 |
| BK-MF3-04 | MF3 | Consultar **títulos em aberto** e antiguidade de saldos. | Oleksii | André | P1 | TODO | S | - | RF17 | bk-mf3-04-consultar-titulos-em-aberto-e-antiguidade-de-saldos | Fase 2 | BK-MF3-05 |
| BK-MF3-05 | MF3 | Submeter documentos de venda para **aprovação** antes de emissão definitiva. | André | Oleksii | P1 | TODO | S | BK-MF3-01 | RF18 | bk-mf3-05-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiv | Fase 2 | BK-MF3-06 |
| BK-MF3-06 | MF3 | Definir **fluxos e limites** de aprovação (por papel, valor, cliente). | Oleksii | Pedro | P2 | TODO | S | BK-MF3-05 | RF19 | bk-mf3-06-definir-fluxos-e-limites-de-aprovacao-por-papel-valor-cliente | Fase 2 | BK-MF3-07 |
| BK-MF3-07 | MF3 | Registar histórico de **decisões de aprovação** e comentários. | André | Sofia | P1 | TODO | S | BK-MF3-05 | RF20 | bk-mf3-07-registar-historico-de-decisoes-de-aprovacao-e-comentarios | Fase 2 | BK-MF3-08 |
| BK-MF3-08 | MF3 | Registar **Fatura de Fornecedor** e **Nota de Crédito**. | Oleksii | André | P0 | TODO | M | BK-MF2-02, BK-MF2-03, BK-MF2-05 | RF21 | bk-mf3-08-registar-fatura-de-fornecedor-e-nota-de-credito | Fase 2 | BK-MF3-09 |
| BK-MF3-09 | MF3 | Registar **pagamentos** (parciais/totais). | Pedro | Oleksii | P0 | TODO | M | BK-MF3-08 | RF22 | bk-mf3-09-registar-pagamentos-parciais-totais | Fase 2 | BK-MF3-10 |
| BK-MF3-10 | MF3 | Gerar **lançamentos contabilísticos automáticos** de compras. | André | Pedro | P0 | TODO | M | BK-MF3-08 | RF23 | bk-mf3-10-gerar-lancamentos-contabilisticos-automaticos-de-compras | Fase 2 | BK-MF3-11 |
| BK-MF3-11 | MF3 | Aprovação de compras com estados “Rascunho → Aprovado → Lançado”. | Oleksii | Sofia | P1 | TODO | S | - | RF24 | bk-mf3-11-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado | Fase 2 | BK-MF3-12 |
| BK-MF3-12 | MF3 | Configurar **limites e papéis** para aprovações (por fornecedor/valor). | Oleksii | André | P1 | TODO | S | BK-MF3-11 | RF25 | bk-mf3-12-configurar-limites-e-papeis-para-aprovacoes-por-fornecedor-valor | Fase 2 | BK-MF3-13 |
| BK-MF3-13 | MF3 | Histórico e justificações para aprovações/reprovações. | Pedro | Oleksii | P1 | TODO | S | BK-MF3-11 | RF26 | bk-mf3-13-historico-e-justificacoes-para-aprovacoes-reprovacoes | Fase 2 | BK-MF4-01 |
| BK-MF4-01 | MF4 | Criar e editar **lançamentos manuais** (com anexos). | André | Pedro | P0 | TODO | M | BK-MF1-07 | RF34 | bk-mf4-01-criar-e-editar-lancamentos-manuais-com-anexos | Fase 2 | BK-MF4-02 |
| BK-MF4-02 | MF4 | Consultar **balancete e razão** exportável (PDF/Excel). | Oleksii | Sofia | P0 | TODO | L | BK-MF4-01 | RF35 | bk-mf4-02-consultar-balancete-e-razao-exportavel-pdf-excel | Fase 2 | BK-MF4-03 |
| BK-MF4-03 | MF4 | Gerar **Demonstração de Resultados e Balanço**. | Pedro | André | P0 | TODO | L | BK-MF4-02 | RF36 | bk-mf4-03-gerar-demonstracao-de-resultados-e-balanco | Fase 2 | BK-MF4-04 |
| BK-MF4-04 | MF4 | Gerar **Mapas de IVA** (liquidado/dedutível). | André | Oleksii | P0 | TODO | M | BK-MF3-03, BK-MF3-10 | RF37 | bk-mf4-04-gerar-mapas-de-iva-liquidado-dedutivel | Fase 2 | BK-MF5-01 |
| BK-MF5-01 | MF5 | Criar **contas bancárias/caixa** e respetivos saldos. | Oleksii | Pedro | P0 | TODO | M | - | RF38 | bk-mf5-01-criar-contas-bancarias-caixa-e-respetivos-saldos | Fase 2 | BK-MF5-02 |
| BK-MF5-02 | MF5 | Importar **extratos bancários** (CSV/OFX) e fazer reconciliação automática. | André | Sofia | P0 | TODO | L | BK-MF5-01, BK-MF3-01, BK-MF3-08 | RF39 | bk-mf5-02-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica | Fase 2 | BK-MF5-03 |
| BK-MF5-03 | MF5 | Gerar **previsão de tesouraria** (entradas e saídas futuras). | Oleksii | André | P1 | TODO | S | BK-MF3-02, BK-MF3-09 | RF40 | bk-mf5-03-gerar-previsao-de-tesouraria-entradas-e-saidas-futuras | Fase 2 | BK-MF5-04 |
| BK-MF5-04 | MF5 | Definir **workflows de aprovação** por documento (compra, venda, pagamento). | Pedro | Oleksii | P1 | TODO | L | BK-MF3-08, BK-MF2-09 | RF60 | bk-mf5-04-definir-workflows-de-aprovacao-por-documento-compra-venda-pagamento | Fase 2 | BK-MF5-05 |
| BK-MF5-05 | MF5 | Configurar **níveis de aprovação** com limites financeiros e escalamentos. | Oleksii | Pedro | P1 | TODO | L | BK-MF5-04 | RF61 | bk-mf5-05-configurar-niveis-de-aprovacao-com-limites-financeiros-e-escalamentos | Fase 2 | BK-MF5-06 |
| BK-MF5-06 | MF5 | Painel para monitorizar aprovações pendentes e SLA por tipo de documento. | André | Sofia | P1 | TODO | S | BK-MF5-04 | RF62 | bk-mf5-06-painel-para-monitorizar-aprovacoes-pendentes-e-sla-por-tipo-de-documen | Fase 2 | BK-MF5-07 |
| BK-MF5-07 | MF5 | Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria. | Oleksii | André | P1 | TODO | S | BK-MF5-02 | RF63 | bk-mf5-07-agendar-pagamentos-recebimentos-futuros-com-integracao-as-previsoes-de | Fase 2 | BK-MF5-08 |
| BK-MF5-08 | MF5 | Gerir **linhas de crédito** (limites, utilização, alertas) por banco. | Pedro | Oleksii | P1 | TODO | L | BK-MF5-01 | RF64 | bk-mf5-08-gerir-linhas-de-credito-limites-utilizacao-alertas-por-banco | Fase 2 | BK-MF6-01 |
| BK-MF6-01 | MF6 | Upload de documentos com **OCR** (ler NIF, data, total, IVA). | Oleksii | Pedro | P1 | TODO | L | BK-MF3-08 | RF41 | bk-mf6-01-upload-de-documentos-com-ocr-ler-nif-data-total-iva | Fase 3 | BK-MF6-02 |
| BK-MF6-02 | MF6 | Importar CSV/Excel de clientes, fornecedores, artigos e extratos. | André | Sofia | P1 | TODO | S | - | RF42 | bk-mf6-02-importar-csv-excel-de-clientes-fornecedores-artigos-e-extratos | Fase 3 | BK-MF6-03 |
| BK-MF6-03 | MF6 | Exportar **SAF-T (PT)** de faturação e contabilidade. | André | Oleksii | P0 | TODO | L | - | RF43 | bk-mf6-03-exportar-saf-t-pt-de-faturacao-e-contabilidade | Fase 3 | BK-MF6-04 |
| BK-MF6-04 | MF6 | (Opcional) Integração com **e-Fatura**. | Oleksii | André | P2 | TODO | S | - | RF44 | bk-mf6-04-opcional-integracao-com-e-fatura | Fase 3 | BK-MF6-05 |
| BK-MF6-05 | MF6 | Mapear documentos de integração para **centros de custo**. | Oleksii | Pedro | P1 | TODO | S | BK-MF2-10 | RF45 | bk-mf6-05-mapear-documentos-de-integracao-para-centros-de-custo | Fase 3 | BK-MF6-06 |
| BK-MF6-06 | MF6 | Registar **auditoria**: quem, quando, o quê, em operações sensíveis. | Pedro | Sofia | P0 | TODO | L | - | RF57 | bk-mf6-06-registar-auditoria-quem-quando-o-que-em-operacoes-sensiveis | Fase 3 | BK-MF6-07 |
| BK-MF6-07 | MF6 | Registar **logs de integração** (uploads, SAF-T, reconciliações). | Oleksii | André | P0 | TODO | L | - | RF58 | bk-mf6-07-registar-logs-de-integracao-uploads-saf-t-reconciliacoes | Fase 3 | BK-MF6-08 |
| BK-MF6-08 | MF6 | Permitir **reabertura de períodos** apenas com registo de motivo. | André | Oleksii | P1 | TODO | S | BK-MF1-08 | RF59 | bk-mf6-08-permitir-reabertura-de-periodos-apenas-com-registo-de-motivo | Fase 3 | BK-MF6-09 |
| BK-MF6-09 | MF6 | Compatível com Chrome, Edge, Firefox e Safari. | André | Pedro | P0 | TODO | M | - | RNF21 | bk-mf6-09-compativel-com-chrome-edge-firefox-e-safari | Fase 3 | BK-MF6-10 |
| BK-MF6-10 | MF6 | Integração com serviços de email (recuperação de password, alertas). | Oleksii | Sofia | P0 | TODO | M | - | RNF22 | bk-mf6-10-integracao-com-servicos-de-email-recuperacao-de-password-alertas | Fase 3 | BK-MF6-11 |
| BK-MF6-11 | MF6 | Exportações disponíveis em CSV, Excel e PDF. | Pedro | André | P1 | TODO | S | - | RNF23 | bk-mf6-11-exportacoes-disponiveis-em-csv-excel-e-pdf | Fase 3 | BK-MF6-12 |
| BK-MF6-12 | MF6 | Importações CSV/Excel com validação e logs de erro. | André | Oleksii | P0 | TODO | M | - | RNF24 | bk-mf6-12-importacoes-csv-excel-com-validacao-e-logs-de-erro | Fase 3 | BK-MF6-13 |
| BK-MF6-13 | MF6 | Geração de SAF-T conforme especificações legais (PT). | Oleksii | Pedro | P0 | TODO | L | - | RNF25 | bk-mf6-13-geracao-de-saf-t-conforme-especificacoes-legais-pt | Fase 3 | BK-MF6-14 |
| BK-MF6-14 | MF6 | API interna estável para futuras integrações. | Pedro | Sofia | P1 | TODO | L | - | RNF26 | bk-mf6-14-api-interna-estavel-para-futuras-integracoes | Fase 3 | BK-MF7-01 |
| BK-MF7-01 | MF7 | Relatórios de vendas, compras, margens e stock. | Sofia | André | P0 | TODO | M | BK-MF3-01, BK-MF3-08, BK-MF2-06 | RF46 | bk-mf7-01-relatorios-de-vendas-compras-margens-e-stock | Fase 3 | BK-MF7-02 |
| BK-MF7-02 | MF7 | KPIs executivos (receita, custos, EBITDA, PMR, PMP). | Sofia | Oleksii | P1 | TODO | S | BK-MF7-01 | RF47 | bk-mf7-02-kpis-executivos-receita-custos-ebitda-pmr-pmp | Fase 3 | BK-MF7-03 |
| BK-MF7-03 | MF7 | Personalização de relatórios e exportação (PDF/Excel). | Sofia | Pedro | P1 | TODO | S | BK-MF7-01 | RF48 | bk-mf7-03-personalizacao-de-relatorios-e-exportacao-pdf-excel | Fase 3 | BK-MF7-04 |
| BK-MF7-04 | MF7 | Gerar **insights automáticos** (tendências, riscos, clientes, artigos parados). | André | Sofia | P0 | TODO | L | BK-MF7-01 | RF49 | bk-mf7-04-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados | Fase 3 | BK-MF7-05 |
| BK-MF7-05 | MF7 | Sugerir **ações** (ajustar preços, negociar fornecedor, repor stock). | Oleksii | André | P1 | TODO | S | BK-MF7-04 | RF50 | bk-mf7-05-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock | Fase 3 | BK-MF7-06 |
| BK-MF7-06 | MF7 | Permitir **perguntas em linguagem natural** e responder com dados e fonte. | Oleksii | Pedro | P1 | TODO | L | BK-MF7-01 | RF51 | bk-mf7-06-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte | Fase 3 | BK-MF7-07 |
| BK-MF7-07 | MF7 | Emitir **alertas inteligentes** (cashflow, desvios, ruturas). | Pedro | Oleksii | P1 | TODO | S | BK-MF5-03, BK-MF2-09 | RF52 | bk-mf7-07-emitir-alertas-inteligentes-cashflow-desvios-ruturas | Fase 3 | BK-MF7-08 |
| BK-MF7-08 | MF7 | Mostrar **explicações e fontes** de cada insight. | André | Sofia | P0 | TODO | M | BK-MF7-04 | RF53 | bk-mf7-08-mostrar-explicacoes-e-fontes-de-cada-insight | Fase 3 | BK-MF7-09 |
| BK-MF7-09 | MF7 | Insights devem incluir explicação e origem dos dados usados. | Pedro | André | P0 | TODO | L | - | RNF34 | bk-mf7-09-insights-devem-incluir-explicacao-e-origem-dos-dados-usados | Fase 3 | BK-MF7-10 |
| BK-MF7-10 | MF7 | IA não altera dados contabilísticos; apenas analisa e recomenda. | Oleksii | Pedro | P0 | TODO | M | - | RNF35 | bk-mf7-10-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda | Fase 3 | BK-MF7-11 |
| BK-MF7-11 | MF7 | Alertas configuráveis (ativar/desativar tipos). | Sofia | Oleksii | P1 | TODO | S | - | RNF36 | bk-mf7-11-alertas-configuraveis-ativar-desativar-tipos | Fase 3 | BK-MF7-12 |
| BK-MF7-12 | MF7 | IA deve evitar enviesamentos e sugerir ações baseadas em dados reais. | André | Sofia | P1 | TODO | S | - | RNF37 | bk-mf7-12-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais | Fase 3 | BK-MF8-01 |
| BK-MF8-01 | MF8 | Criar/editar lembretes (prazos, pagamentos, impostos). | Sofia | André | P1 | TODO | S | - | RF54 | bk-mf8-01-criar-editar-lembretes-prazos-pagamentos-impostos | Fase 3 | BK-MF8-02 |
| BK-MF8-02 | MF8 | Criar e atribuir tarefas com estado e prazo. | Sofia | Oleksii | P1 | TODO | S | - | RF55 | bk-mf8-02-criar-e-atribuir-tarefas-com-estado-e-prazo | Fase 3 | BK-MF8-03 |
| BK-MF8-03 | MF8 | Notificações (in-app/email) para lembretes e alertas da IA. | Sofia | Pedro | P1 | TODO | S | BK-MF8-01, BK-MF7-07 | RF56 | bk-mf8-03-notificacoes-in-app-email-para-lembretes-e-alertas-da-ia | Fase 3 | BK-MF8-04 |
| BK-MF8-04 | MF8 | Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade). | Sofia | André | P0 | TODO | M | - | RNF01 | bk-mf8-04-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-i | Fase 3 | BK-MF8-05 |
| BK-MF8-05 | MF8 | Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas. | Sofia | Oleksii | P0 | TODO | M | - | RNF02 | bk-mf8-05-layout-responsivo-desktop-tablet-mobile-com-grelhas-e-tabelas-adaptada | Fase 3 | BK-MF8-06 |
| BK-MF8-06 | MF8 | A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads). | Sofia | Pedro | P0 | TODO | M | - | RNF03 | bk-mf8-06-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-vali | Fase 3 | BK-MF8-07 |
| BK-MF8-07 | MF8 | Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade). | Sofia | André | P1 | TODO | S | - | RNF04 | bk-mf8-07-cumprir-regras-basicas-de-acessibilidade-contraste-headings-legibilida | Fase 3 | BK-MF8-08 |
| BK-MF8-08 | MF8 | Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC). | Sofia | Oleksii | P0 | TODO | M | - | RNF05 | bk-mf8-08-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-i | Fase 3 | BK-MF8-09 |
| BK-MF8-09 | MF8 | As mensagens de erro devem ser claras e indicar como resolver o problema. | Sofia | Pedro | P0 | TODO | M | - | RNF06 | bk-mf8-09-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-proble | Fase 3 | BK-MF8-10 |
| BK-MF8-10 | MF8 | Interface em português de Portugal. | Sofia | André | P0 | TODO | M | - | RNF38 | bk-mf8-10-interface-em-portugues-de-portugal | Fase 3 | BK-MF8-11 |
| BK-MF8-11 | MF8 | Preparado para futura tradução (suporte i18n básico). | Sofia | Oleksii | P2 | TODO | S | - | RNF39 | bk-mf8-11-preparado-para-futura-traducao-suporte-i18n-basico | Fase 3 | BK-MF8-12 |
| BK-MF8-12 | MF8 | Datas, moedas e separadores no padrão europeu. | Sofia | Pedro | P1 | TODO | S | - | RNF40 | bk-mf8-12-datas-moedas-e-separadores-no-padrao-europeu | Fase 3 | - |

## Changelog

- `2026-04-12`: Matriz canónica inicial validada para geração documental.
