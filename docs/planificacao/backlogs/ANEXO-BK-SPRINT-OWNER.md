# ANEXO-BK-SPRINT-OWNER

## Header
- `doc_id`: `ANEXO-BK-SPRINT-OWNER`
- `path`: `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-13`

## Objetivo
Rastreabilidade operacional `BK -> Sprint -> Owner`, com contrato de carga pedagogica `Core/Reforco`.

## Mapeamento canónico BK -> Sprint -> Owner
| bk_id | mf | sprint | owner | apoio | prioridade | core_or_reforco | rf_rnf[] | deps[] | guia_path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF01 | - | docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-login-e-logout-com-cookies-httponly.md |
| BK-MF0-02 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF02 | BK-MF0-01 | docs/planificacao/guias-bk/MF0/BK-MF0-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md |
| BK-MF0-03 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF03 | BK-MF0-02 | docs/planificacao/guias-bk/MF0/BK-MF0-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empresas.md |
| BK-MF0-04 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF04 | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md |
| BK-MF0-05 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF05 | - | docs/planificacao/guias-bk/MF0/BK-MF0-05-recuperacao-de-password-via-email.md |
| BK-MF0-06 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF06 | - | docs/planificacao/guias-bk/MF0/BK-MF0-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md |
| BK-MF0-07 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF07 | - | docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-importar-plano-de-contas-snc.md |
| BK-MF0-08 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF08 | BK-MF0-07 | docs/planificacao/guias-bk/MF0/BK-MF0-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md |
| BK-MF0-09 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF09 | - | docs/planificacao/guias-bk/MF0/BK-MF0-09-criar-e-gerir-clientes.md |
| BK-MF0-10 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF10 | - | docs/planificacao/guias-bk/MF0/BK-MF0-10-criar-e-gerir-fornecedores.md |
| BK-MF0-11 | MF0 | S01-S02 | Oleksii | Andre | P0 | Reforco | RF11 | - | docs/planificacao/guias-bk/MF0/BK-MF0-11-criar-artigos-servicos-sku-custo-preco-iva.md |
| BK-MF0-12 | MF0 | S01-S02 | Oleksii | Andre | P1 | Core | RF12 | - | docs/planificacao/guias-bk/MF0/BK-MF0-12-criar-armazens-e-localizacoes.md |
| BK-MF1-01 | MF1 | S03-S04 | Oleksii | Andre | P0 | Reforco | RF13 | - | docs/planificacao/guias-bk/MF1/BK-MF1-01-configurar-tabelas-de-iva-taxas-isencoes-codigos.md |
| BK-MF1-02 | MF1 | S03-S04 | Andre | Oleksii | P0 | Reforco | RF14 | BK-MF0-09, BK-MF0-11, BK-MF1-01 | docs/planificacao/guias-bk/MF1/BK-MF1-02-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md |
| BK-MF1-03 | MF1 | S03-S04 | Pedro | Andre | P0 | Reforco | RF15 | - | docs/planificacao/guias-bk/MF1/BK-MF1-03-registar-recebimentos-parciais-totais.md |
| BK-MF1-04 | MF1 | S03-S04 | Oleksii | Andre | P0 | Reforco | RF16 | BK-MF1-02 | docs/planificacao/guias-bk/MF1/BK-MF1-04-gerar-lancamentos-contabilisticos-automaticos-por-venda.md |
| BK-MF1-05 | MF1 | S03-S04 | Oleksii | Andre | P1 | Core | RF17 | - | docs/planificacao/guias-bk/MF1/BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md |
| BK-MF1-06 | MF1 | S03-S04 | Andre | Oleksii | P1 | Core | RF18 | BK-MF1-02 | docs/planificacao/guias-bk/MF1/BK-MF1-06-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiva.md |
| BK-MF1-07 | MF1 | S03-S04 | Oleksii | Andre | P2 | Core | RF19 | BK-MF1-06 | docs/planificacao/guias-bk/MF1/BK-MF1-07-definir-fluxos-e-limites-de-aprovacao-por-papel-valor-cliente.md |
| BK-MF1-08 | MF1 | S03-S04 | Oleksii | Andre | P1 | Core | RF20 | BK-MF1-06 | docs/planificacao/guias-bk/MF1/BK-MF1-08-registar-historico-de-decisoes-de-aprovacao-e-comentarios.md |
| BK-MF1-09 | MF1 | S03-S04 | Andre | Oleksii | P0 | Reforco | RF21 | BK-MF0-10, BK-MF0-11, BK-MF1-01 | docs/planificacao/guias-bk/MF1/BK-MF1-09-registar-fatura-de-fornecedor-e-nota-de-credito.md |
| BK-MF1-10 | MF1 | S03-S04 | Pedro | Andre | P0 | Reforco | RF22 | BK-MF1-09 | docs/planificacao/guias-bk/MF1/BK-MF1-10-registar-pagamentos-parciais-totais.md |
| BK-MF1-11 | MF1 | S03-S04 | Oleksii | Andre | P0 | Reforco | RF23 | BK-MF1-09 | docs/planificacao/guias-bk/MF1/BK-MF1-11-gerar-lancamentos-contabilisticos-automaticos-de-compras.md |
| BK-MF1-12 | MF1 | S03-S04 | Andre | Oleksii | P1 | Core | RF24 | - | docs/planificacao/guias-bk/MF1/BK-MF1-12-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md |
| BK-MF2-01 | MF2 | S05-S06 | Pedro | Andre | P1 | Core | RF25 | BK-MF1-12 | docs/planificacao/guias-bk/MF2/BK-MF2-01-configurar-limites-e-papeis-para-aprovacoes-por-fornecedor-valor.md |
| BK-MF2-02 | MF2 | S05-S06 | Oleksii | Andre | P1 | Core | RF26 | BK-MF1-12 | docs/planificacao/guias-bk/MF2/BK-MF2-02-historico-e-justificacoes-para-aprovacoes-reprovacoes.md |
| BK-MF2-03 | MF2 | S05-S06 | Andre | Oleksii | P0 | Reforco | RF27 | BK-MF0-11, BK-MF0-12 | docs/planificacao/guias-bk/MF2/BK-MF2-03-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md |
| BK-MF2-04 | MF2 | S05-S06 | Pedro | Andre | P0 | Reforco | RF28 | BK-MF2-03 | docs/planificacao/guias-bk/MF2/BK-MF2-04-calculo-de-custo-fifo.md |
| BK-MF2-05 | MF2 | S05-S06 | Andre | Oleksii | P1 | Core | RF29 | BK-MF2-03 | docs/planificacao/guias-bk/MF2/BK-MF2-05-contagem-fisica-e-ajustes.md |
| BK-MF2-06 | MF2 | S05-S06 | Pedro | Andre | P1 | Core | RF30 | BK-MF2-03 | docs/planificacao/guias-bk/MF2/BK-MF2-06-alertas-de-stock-minimos-maximos-artigos-parados.md |
| BK-MF2-07 | MF2 | S05-S06 | Oleksii | Andre | P1 | Core | RF31 | BK-MF0-07 | docs/planificacao/guias-bk/MF2/BK-MF2-07-configurar-centros-de-custo-segmentos-analiticos.md |
| BK-MF2-08 | MF2 | S05-S06 | Andre | Oleksii | P1 | Core | RF32 | BK-MF2-07 | docs/planificacao/guias-bk/MF2/BK-MF2-08-associar-documentos-e-lancamentos-a-centros-de-custo.md |
| BK-MF2-09 | MF2 | S05-S06 | Pedro | Andre | P1 | Core | RF33 | BK-MF2-08 | docs/planificacao/guias-bk/MF2/BK-MF2-09-relatorios-e-filtros-por-centro-de-custo-segmento.md |
| BK-MF2-10 | MF2 | S05-S06 | Oleksii | Andre | P0 | Reforco | RF34 | BK-MF0-07 | docs/planificacao/guias-bk/MF2/BK-MF2-10-criar-e-editar-lancamentos-manuais-com-anexos.md |
| BK-MF2-11 | MF2 | S05-S06 | Andre | Oleksii | P0 | Reforco | RF35 | BK-MF2-10 | docs/planificacao/guias-bk/MF2/BK-MF2-11-consultar-balancete-e-razao-exportavel-pdf-excel.md |
| BK-MF2-12 | MF2 | S05-S06 | Pedro | Andre | P0 | Reforco | RF36 | BK-MF2-11 | docs/planificacao/guias-bk/MF2/BK-MF2-12-gerar-demonstracao-de-resultados-e-balanco.md |
| BK-MF3-01 | MF3 | S07-S08 | Oleksii | Andre | P0 | Reforco | RF37 | BK-MF1-04, BK-MF1-11 | docs/planificacao/guias-bk/MF3/BK-MF3-01-gerar-mapas-de-iva-liquidado-dedutivel.md |
| BK-MF3-02 | MF3 | S07-S08 | Andre | Oleksii | P0 | Reforco | RF38 | - | docs/planificacao/guias-bk/MF3/BK-MF3-02-criar-contas-bancarias-caixa-e-respetivos-saldos.md |
| BK-MF3-03 | MF3 | S07-S08 | Pedro | Andre | P0 | Reforco | RF39 | BK-MF3-02, BK-MF1-02, BK-MF1-09 | docs/planificacao/guias-bk/MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md |
| BK-MF3-04 | MF3 | S07-S08 | Oleksii | Andre | P1 | Core | RF40 | BK-MF1-03, BK-MF1-10 | docs/planificacao/guias-bk/MF3/BK-MF3-04-gerar-previsao-de-tesouraria-entradas-e-saidas-futuras.md |
| BK-MF3-05 | MF3 | S07-S08 | Andre | Oleksii | P1 | Core | RF41 | BK-MF1-09 | docs/planificacao/guias-bk/MF3/BK-MF3-05-upload-de-documentos-com-ocr-ler-nif-data-total-iva.md |
| BK-MF3-06 | MF3 | S07-S08 | Pedro | Andre | P1 | Core | RF42 | - | docs/planificacao/guias-bk/MF3/BK-MF3-06-importar-csv-excel-de-clientes-fornecedores-artigos-e-extratos.md |
| BK-MF3-07 | MF3 | S07-S08 | Oleksii | Andre | P0 | Reforco | RF43 | - | docs/planificacao/guias-bk/MF3/BK-MF3-07-exportar-saf-t-pt-de-faturacao-e-contabilidade.md |
| BK-MF3-08 | MF3 | S07-S08 | Andre | Oleksii | P2 | Core | RF44 | - | docs/planificacao/guias-bk/MF3/BK-MF3-08-opcional-integracao-com-e-fatura.md |
| BK-MF3-09 | MF3 | S07-S08 | Oleksii | Andre | P1 | Core | RF45 | BK-MF2-07 | docs/planificacao/guias-bk/MF3/BK-MF3-09-mapear-documentos-de-integracao-para-centros-de-custo.md |
| BK-MF3-10 | MF3 | S07-S08 | Andre | Oleksii | P0 | Reforco | RF46 | BK-MF1-02, BK-MF1-09, BK-MF2-03 | docs/planificacao/guias-bk/MF3/BK-MF3-10-relatorios-de-vendas-compras-margens-e-stock.md |
| BK-MF3-11 | MF3 | S07-S08 | Andre | Oleksii | P1 | Core | RF47 | BK-MF3-10 | docs/planificacao/guias-bk/MF3/BK-MF3-11-kpis-executivos-receita-custos-ebitda-pmr-pmp.md |
| BK-MF3-12 | MF3 | S07-S08 | Pedro | Andre | P1 | Core | RF48 | BK-MF3-10 | docs/planificacao/guias-bk/MF3/BK-MF3-12-personalizacao-de-relatorios-e-exportacao-pdf-excel.md |
| BK-MF4-01 | MF4 | S08-S09 | Pedro | Andre | P0 | Reforco | RF49 | BK-MF3-10 | docs/planificacao/guias-bk/MF4/BK-MF4-01-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados.md |
| BK-MF4-02 | MF4 | S08-S09 | Oleksii | Andre | P1 | Core | RF50 | BK-MF4-01 | docs/planificacao/guias-bk/MF4/BK-MF4-02-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock.md |
| BK-MF4-03 | MF4 | S08-S09 | Andre | Oleksii | P1 | Core | RF51 | BK-MF3-10 | docs/planificacao/guias-bk/MF4/BK-MF4-03-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte.md |
| BK-MF4-04 | MF4 | S08-S09 | Pedro | Andre | P1 | Core | RF52 | BK-MF3-04, BK-MF2-06 | docs/planificacao/guias-bk/MF4/BK-MF4-04-emitir-alertas-inteligentes-cashflow-desvios-ruturas.md |
| BK-MF4-05 | MF4 | S08-S09 | Oleksii | Andre | P0 | Reforco | RF53 | BK-MF4-01 | docs/planificacao/guias-bk/MF4/BK-MF4-05-mostrar-explicacoes-e-fontes-de-cada-insight.md |
| BK-MF4-06 | MF4 | S08-S09 | Oleksii | Andre | P1 | Core | RF54 | - | docs/planificacao/guias-bk/MF4/BK-MF4-06-criar-editar-lembretes-prazos-pagamentos-impostos.md |
| BK-MF4-07 | MF4 | S08-S09 | Andre | Oleksii | P1 | Core | RF55 | - | docs/planificacao/guias-bk/MF4/BK-MF4-07-criar-e-atribuir-tarefas-com-estado-e-prazo.md |
| BK-MF4-08 | MF4 | S08-S09 | Pedro | Andre | P1 | Core | RF56 | BK-MF4-06, BK-MF4-04 | docs/planificacao/guias-bk/MF4/BK-MF4-08-notificacoes-in-app-email-para-lembretes-e-alertas-da-ia.md |
| BK-MF4-09 | MF4 | S08-S09 | Andre | Oleksii | P0 | Reforco | RF57 | - | docs/planificacao/guias-bk/MF4/BK-MF4-09-registar-auditoria-quem-quando-o-que-em-operacoes-sensiveis.md |
| BK-MF4-10 | MF4 | S08-S09 | Pedro | Andre | P0 | Reforco | RF58 | - | docs/planificacao/guias-bk/MF4/BK-MF4-10-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md |
| BK-MF4-11 | MF4 | S08-S09 | Oleksii | Andre | P1 | Core | RF59 | BK-MF0-08 | docs/planificacao/guias-bk/MF4/BK-MF4-11-permitir-reabertura-de-periodos-apenas-com-registo-de-motivo.md |
| BK-MF4-12 | MF4 | S08-S09 | Andre | Oleksii | P1 | Core | RF60 | BK-MF1-09, BK-MF2-06 | docs/planificacao/guias-bk/MF4/BK-MF4-12-definir-workflows-de-aprovacao-por-documento-compra-venda-pagamento.md |
| BK-MF5-01 | MF5 | S09-S10 | Pedro | Andre | P1 | Core | RF61 | BK-MF4-12 | docs/planificacao/guias-bk/MF5/BK-MF5-01-configurar-niveis-de-aprovacao-com-limites-financeiros-e-escalamentos.md |
| BK-MF5-02 | MF5 | S09-S10 | Sofia | Pedro | P1 | Core | RF62 | BK-MF4-12 | docs/planificacao/guias-bk/MF5/BK-MF5-02-painel-para-monitorizar-aprovacoes-pendentes-e-sla-por-tipo-de-documento.md |
| BK-MF5-03 | MF5 | S09-S10 | Oleksii | Andre | P1 | Core | RF63 | BK-MF3-03 | docs/planificacao/guias-bk/MF5/BK-MF5-03-agendar-pagamentos-recebimentos-futuros-com-integracao-as-previsoes-de-tesouraria.md |
| BK-MF5-04 | MF5 | S09-S10 | Andre | Oleksii | P1 | Core | RF64 | BK-MF3-02 | docs/planificacao/guias-bk/MF5/BK-MF5-04-gerir-linhas-de-credito-limites-utilizacao-alertas-por-banco.md |
| BK-MF5-05 | MF5 | S09-S10 | Oleksii | Andre | P0 | Reforco | RNF01 | - | docs/planificacao/guias-bk/MF5/BK-MF5-05-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-inventario-contabilidade.md |
| BK-MF5-06 | MF5 | S09-S10 | Andre | Oleksii | P0 | Reforco | RNF02 | - | docs/planificacao/guias-bk/MF5/BK-MF5-06-layout-responsivo-desktop-tablet-mobile-com-grelhas-e-tabelas-adaptadas.md |
| BK-MF5-07 | MF5 | S09-S10 | Pedro | Andre | P0 | Reforco | RNF03 | - | docs/planificacao/guias-bk/MF5/BK-MF5-07-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-validar-uploads.md |
| BK-MF5-08 | MF5 | S09-S10 | Pedro | Andre | P1 | Core | RNF04 | - | docs/planificacao/guias-bk/MF5/BK-MF5-08-cumprir-regras-basicas-de-acessibilidade-contraste-headings-legibilidade.md |
| BK-MF5-09 | MF5 | S09-S10 | Oleksii | Andre | P0 | Reforco | RNF05 | - | docs/planificacao/guias-bk/MF5/BK-MF5-09-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-iva-contas-snc.md |
| BK-MF5-10 | MF5 | S09-S10 | Andre | Oleksii | P0 | Reforco | RNF06 | - | docs/planificacao/guias-bk/MF5/BK-MF5-10-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md |
| BK-MF5-11 | MF5 | S09-S10 | Pedro | Andre | P0 | Reforco | RNF07 | - | docs/planificacao/guias-bk/MF5/BK-MF5-11-dashboard-e-listagens-devem-carregar-em-2-segundos.md |
| BK-MF6-01 | MF6 | S10-S11 | Oleksii | Andre | P0 | Reforco | RNF08 | - | docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md |
| BK-MF6-02 | MF6 | S10-S11 | Sofia | Pedro | P1 | Core | RNF09 | - | docs/planificacao/guias-bk/MF6/BK-MF6-02-suportar-50-utilizadores-simultaneos-por-empresa-sem-degradacao.md |
| BK-MF6-03 | MF6 | S10-S11 | Oleksii | Andre | P1 | Core | RNF10 | - | docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md |
| BK-MF6-04 | MF6 | S10-S11 | Andre | Oleksii | P1 | Core | RNF11 | - | docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-deve-ser-incremental-e-nao-bloquear-operacoes.md |
| BK-MF6-05 | MF6 | S10-S11 | Pedro | Andre | P2 | Core | RNF12 | - | docs/planificacao/guias-bk/MF6/BK-MF6-05-arquitetura-preparada-para-escalar-horizontalmente.md |
| BK-MF6-06 | MF6 | S10-S11 | Andre | Oleksii | P0 | Reforco | RNF13 | - | docs/planificacao/guias-bk/MF6/BK-MF6-06-toda-a-comunicacao-deve-usar-https-tls-1-2.md |
| BK-MF6-07 | MF6 | S10-S11 | Pedro | Andre | P0 | Reforco | RNF14 | - | docs/planificacao/guias-bk/MF6/BK-MF6-07-passwords-devem-usar-bcrypt-com-salt-seguro.md |
| BK-MF6-08 | MF6 | S10-S11 | Oleksii | Andre | P0 | Reforco | RNF15 | - | docs/planificacao/guias-bk/MF6/BK-MF6-08-sessoes-com-cookies-httponly-secure-samesite.md |
| BK-MF6-09 | MF6 | S10-S11 | Andre | Oleksii | P0 | Reforco | RNF16 | - | docs/planificacao/guias-bk/MF6/BK-MF6-09-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md |
| BK-MF6-10 | MF6 | S10-S11 | Pedro | Andre | P0 | Reforco | RNF17 | - | docs/planificacao/guias-bk/MF6/BK-MF6-10-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md |
| BK-MF6-11 | MF6 | S10-S11 | Oleksii | Andre | P0 | Reforco | RNF18 | - | docs/planificacao/guias-bk/MF6/BK-MF6-11-auditoria-obrigatoria-em-operacoes-sensiveis.md |
| BK-MF7-01 | MF7 | S11-S12 | Pedro | Andre | P1 | Core | RNF19 | - | docs/planificacao/guias-bk/MF7/BK-MF7-01-backups-automaticos-diarios-com-restauracao-possivel.md |
| BK-MF7-02 | MF7 | S11-S12 | Andre | Oleksii | P0 | Reforco | RNF20 | - | docs/planificacao/guias-bk/MF7/BK-MF7-02-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md |
| BK-MF7-03 | MF7 | S11-S12 | Pedro | Andre | P0 | Reforco | RNF21 | - | docs/planificacao/guias-bk/MF7/BK-MF7-03-compativel-com-chrome-edge-firefox-e-safari.md |
| BK-MF7-04 | MF7 | S11-S12 | Sofia | Pedro | P0 | Reforco | RNF22 | - | docs/planificacao/guias-bk/MF7/BK-MF7-04-integracao-com-servicos-de-email-recuperacao-de-password-alertas.md |
| BK-MF7-05 | MF7 | S11-S12 | Sofia | Pedro | P1 | Core | RNF23 | - | docs/planificacao/guias-bk/MF7/BK-MF7-05-exportacoes-disponiveis-em-csv-excel-e-pdf.md |
| BK-MF7-06 | MF7 | S11-S12 | Oleksii | Andre | P0 | Reforco | RNF24 | - | docs/planificacao/guias-bk/MF7/BK-MF7-06-importacoes-csv-excel-com-validacao-e-logs-de-erro.md |
| BK-MF7-07 | MF7 | S11-S12 | Andre | Oleksii | P0 | Reforco | RNF25 | - | docs/planificacao/guias-bk/MF7/BK-MF7-07-geracao-de-saf-t-conforme-especificacoes-legais-pt.md |
| BK-MF7-08 | MF7 | S11-S12 | Oleksii | Andre | P1 | Core | RNF26 | - | docs/planificacao/guias-bk/MF7/BK-MF7-08-api-interna-estavel-para-futuras-integracoes.md |
| BK-MF7-09 | MF7 | S11-S12 | Pedro | Andre | P0 | Reforco | RNF27 | - | docs/planificacao/guias-bk/MF7/BK-MF7-09-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabilidade-ia.md |
| BK-MF7-10 | MF7 | S11-S12 | Sofia | Pedro | P0 | Reforco | RNF28 | - | docs/planificacao/guias-bk/MF7/BK-MF7-10-frontend-modular-com-componentes-reutilizaveis.md |
| BK-MF7-11 | MF7 | S11-S12 | Andre | Oleksii | P1 | Core | RNF29 | - | docs/planificacao/guias-bk/MF7/BK-MF7-11-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md |
| BK-MF8-01 | MF8 | S12 | Oleksii | Andre | P0 | Reforco | RNF30 | - | docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md |
| BK-MF8-02 | MF8 | S12 | Pedro | Andre | P1 | Core | RNF31 | - | docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md |
| BK-MF8-03 | MF8 | S12 | Sofia | Pedro | P1 | Core | RNF32 | - | docs/planificacao/guias-bk/MF8/BK-MF8-03-deploy-com-rollback.md |
| BK-MF8-04 | MF8 | S12 | Oleksii | Andre | P1 | Core | RNF33 | - | docs/planificacao/guias-bk/MF8/BK-MF8-04-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md |
| BK-MF8-05 | MF8 | S12 | Andre | Oleksii | P0 | Reforco | RNF34 | - | docs/planificacao/guias-bk/MF8/BK-MF8-05-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md |
| BK-MF8-06 | MF8 | S12 | Pedro | Andre | P0 | Reforco | RNF35 | - | docs/planificacao/guias-bk/MF8/BK-MF8-06-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md |
| BK-MF8-07 | MF8 | S12 | Andre | Oleksii | P1 | Core | RNF36 | - | docs/planificacao/guias-bk/MF8/BK-MF8-07-alertas-configuraveis-ativar-desativar-tipos.md |
| BK-MF8-08 | MF8 | S12 | Pedro | Andre | P1 | Core | RNF37 | - | docs/planificacao/guias-bk/MF8/BK-MF8-08-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md |
| BK-MF8-09 | MF8 | S12 | Sofia | Pedro | P0 | Reforco | RNF38 | - | docs/planificacao/guias-bk/MF8/BK-MF8-09-interface-em-portugues-de-portugal.md |
| BK-MF8-10 | MF8 | S12 | Sofia | Pedro | P2 | Core | RNF39 | - | docs/planificacao/guias-bk/MF8/BK-MF8-10-preparado-para-futura-traducao-suporte-i18n-basico.md |
| BK-MF8-11 | MF8 | S12 | Sofia | Pedro | P1 | Core | RNF40 | - | docs/planificacao/guias-bk/MF8/BK-MF8-11-datas-moedas-e-separadores-no-padrao-europeu.md |

## Changelog
- `2026-04-13`: Anexo canónico criado por geracao automatica.
