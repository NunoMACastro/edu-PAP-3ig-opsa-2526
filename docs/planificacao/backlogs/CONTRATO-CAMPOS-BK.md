# CONTRATO-CAMPOS-BK

## Header
- `doc_id`: `CONTRATO-CAMPOS-BK`
- `path`: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Objetivo
Formalizar os campos obrigatorios por BK para manter coerencia entre `MATRIZ-CANONICA-BK`, `BACKLOG-MVP`, `PLANO-SPRINTS` e `guias-bk`.

## Campos obrigatorios
- `bk_id`: identificador unico do backlog item.
- `mf`: macro funcional (`MF0..MF8`).
- `sprint`: janela de sprints onde o BK deve ser executado.
- `owner`: responsavel principal pelo BK.
- `rf_rnf[]`: requisitos RF/RNF cobertos pelo BK.
- `deps[]`: dependencias tecnicas explicitas.
- `guia_path`: caminho canónico do guia BK.
- `core_or_reforco`: `Reforco` para P0; `Core` para P1/P2.

## Regras de consistencia
1. `bk_id` deve existir simultaneamente na matriz, backlog e guia correspondente.
2. `owner`, `rf_rnf[]` e `deps[]` devem ser iguais entre matriz e backlog.
3. `guia_path` deve apontar para um ficheiro existente.
4. `core_or_reforco` e derivado da prioridade (`P0=Reforco`; `P1/P2=Core`).
5. Alteracoes em RF/RNF ou BK obrigam regeneracao dos anexos no mesmo commit.

## Matriz canónica de campos BK
| bk_id | mf | sprint | owner | rf_rnf[] | deps[] | guia_path | core_or_reforco |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | MF0 | S01-S02 | Oleksii | RF01 | - | docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-login-e-logout-com-cookies-httponly.md | Reforco |
| BK-MF0-02 | MF0 | S01-S02 | Oleksii | RF02 | BK-MF0-01 | docs/planificacao/guias-bk/MF0/BK-MF0-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md | Reforco |
| BK-MF0-03 | MF0 | S01-S02 | Oleksii | RF03 | BK-MF0-02 | docs/planificacao/guias-bk/MF0/BK-MF0-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empresas.md | Reforco |
| BK-MF0-04 | MF0 | S01-S02 | Oleksii | RF04 | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md | Reforco |
| BK-MF0-05 | MF0 | S01-S02 | Oleksii | RF05 | - | docs/planificacao/guias-bk/MF0/BK-MF0-05-recuperacao-de-password-via-email.md | Reforco |
| BK-MF0-06 | MF0 | S01-S02 | Oleksii | RF06 | - | docs/planificacao/guias-bk/MF0/BK-MF0-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md | Reforco |
| BK-MF0-07 | MF0 | S01-S02 | Oleksii | RF07 | - | docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-importar-plano-de-contas-snc.md | Reforco |
| BK-MF0-08 | MF0 | S01-S02 | Oleksii | RF08 | BK-MF0-07 | docs/planificacao/guias-bk/MF0/BK-MF0-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md | Reforco |
| BK-MF0-09 | MF0 | S01-S02 | Andre | RF09 | - | docs/planificacao/guias-bk/MF0/BK-MF0-09-criar-e-gerir-clientes.md | Reforco |
| BK-MF0-10 | MF0 | S01-S02 | Pedro | RF10 | - | docs/planificacao/guias-bk/MF0/BK-MF0-10-criar-e-gerir-fornecedores.md | Reforco |
| BK-MF0-11 | MF0 | S01-S02 | Andre | RF11 | - | docs/planificacao/guias-bk/MF0/BK-MF0-11-criar-artigos-servicos-sku-custo-preco-iva.md | Reforco |
| BK-MF0-12 | MF0 | S01-S02 | Sofia | RF12 | - | docs/planificacao/guias-bk/MF0/BK-MF0-12-criar-armazens-e-localizacoes.md | Core |
| BK-MF1-01 | MF1 | S03-S04 | Oleksii | RF13 | - | docs/planificacao/guias-bk/MF1/BK-MF1-01-configurar-tabelas-de-iva-taxas-isencoes-codigos.md | Reforco |
| BK-MF1-02 | MF1 | S03-S04 | Oleksii | RF14 | BK-MF0-09, BK-MF0-11, BK-MF1-01 | docs/planificacao/guias-bk/MF1/BK-MF1-02-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md | Reforco |
| BK-MF1-03 | MF1 | S03-S04 | Pedro | RF15 | - | docs/planificacao/guias-bk/MF1/BK-MF1-03-registar-recebimentos-parciais-totais.md | Reforco |
| BK-MF1-04 | MF1 | S03-S04 | Oleksii | RF16 | BK-MF1-02 | docs/planificacao/guias-bk/MF1/BK-MF1-04-gerar-lancamentos-contabilisticos-automaticos-por-venda.md | Reforco |
| BK-MF1-05 | MF1 | S03-S04 | Oleksii | RF17 | - | docs/planificacao/guias-bk/MF1/BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md | Core |
| BK-MF1-06 | MF1 | S03-S04 | Andre | RF18 | BK-MF1-02 | docs/planificacao/guias-bk/MF1/BK-MF1-06-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiva.md | Core |
| BK-MF1-07 | MF1 | S03-S04 | Oleksii | RF19 | BK-MF0-10, BK-MF0-11, BK-MF1-01 | docs/planificacao/guias-bk/MF1/BK-MF1-07-registar-fatura-de-fornecedor-e-nota-de-credito.md | Reforco |
| BK-MF1-08 | MF1 | S03-S04 | Pedro | RF20 | BK-MF1-07 | docs/planificacao/guias-bk/MF1/BK-MF1-08-registar-pagamentos-parciais-totais.md | Reforco |
| BK-MF1-09 | MF1 | S03-S04 | Oleksii | RF21 | BK-MF1-07 | docs/planificacao/guias-bk/MF1/BK-MF1-09-gerar-lancamentos-contabilisticos-automaticos-de-compras.md | Reforco |
| BK-MF1-10 | MF1 | S03-S04 | Andre | RF22 | - | docs/planificacao/guias-bk/MF1/BK-MF1-10-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md | Core |
| BK-MF2-01 | MF2 | S05-S06 | Sofia | RF23 | BK-MF1-10 | docs/planificacao/guias-bk/MF2/BK-MF2-01-historico-e-justificacoes-para-aprovacoes-reprovacoes.md | Core |
| BK-MF2-02 | MF2 | S05-S06 | Oleksii | RF24 | BK-MF0-11, BK-MF0-12 | docs/planificacao/guias-bk/MF2/BK-MF2-02-movimentos-de-stock-entradas-saidas-transferencias-devolucoes.md | Reforco |
| BK-MF2-03 | MF2 | S05-S06 | Oleksii | RF25 | BK-MF2-02 | docs/planificacao/guias-bk/MF2/BK-MF2-03-calculo-de-custo-fifo.md | Reforco |
| BK-MF2-04 | MF2 | S05-S06 | Andre | RF26 | BK-MF2-02 | docs/planificacao/guias-bk/MF2/BK-MF2-04-contagem-fisica-e-ajustes.md | Core |
| BK-MF2-05 | MF2 | S05-S06 | Pedro | RF27 | BK-MF2-02 | docs/planificacao/guias-bk/MF2/BK-MF2-05-alertas-de-stock-minimos-maximos-artigos-parados.md | Core |
| BK-MF2-06 | MF2 | S05-S06 | Oleksii | RF28 | BK-MF0-07 | docs/planificacao/guias-bk/MF2/BK-MF2-06-criar-e-editar-lancamentos-manuais-com-anexos.md | Reforco |
| BK-MF2-07 | MF2 | S05-S06 | Andre | RF29 | BK-MF2-06 | docs/planificacao/guias-bk/MF2/BK-MF2-07-consultar-balancete-e-razao-exportavel-pdf-excel.md | Reforco |
| BK-MF2-08 | MF2 | S05-S06 | Pedro | RF30 | BK-MF2-07 | docs/planificacao/guias-bk/MF2/BK-MF2-08-gerar-demonstracao-de-resultados-e-balanco.md | Reforco |
| BK-MF3-01 | MF3 | S07-S08 | Oleksii | RF31 | BK-MF1-04, BK-MF1-09 | docs/planificacao/guias-bk/MF3/BK-MF3-01-gerar-mapas-de-iva-liquidado-dedutivel.md | Reforco |
| BK-MF3-02 | MF3 | S07-S08 | Andre | RF32 | - | docs/planificacao/guias-bk/MF3/BK-MF3-02-criar-contas-bancarias-caixa-e-respetivos-saldos.md | Reforco |
| BK-MF3-03 | MF3 | S07-S08 | Oleksii | RF33 | BK-MF3-02, BK-MF1-02, BK-MF1-07 | docs/planificacao/guias-bk/MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md | Reforco |
| BK-MF3-04 | MF3 | S07-S08 | Oleksii | RF34 | BK-MF1-03, BK-MF1-08 | docs/planificacao/guias-bk/MF3/BK-MF3-04-gerar-previsao-de-tesouraria-entradas-e-saidas-futuras.md | Core |
| BK-MF3-05 | MF3 | S07-S08 | Pedro | RF35 | - | docs/planificacao/guias-bk/MF3/BK-MF3-05-importar-csv-excel-de-clientes-fornecedores-artigos-e-extratos.md | Core |
| BK-MF3-06 | MF3 | S07-S08 | Oleksii | RF36 | - | docs/planificacao/guias-bk/MF3/BK-MF3-06-exportar-saf-t-pt-de-faturacao-e-contabilidade.md | Reforco |
| BK-MF3-07 | MF3 | S07-S08 | Andre | RF37 | BK-MF1-02, BK-MF1-07, BK-MF2-02 | docs/planificacao/guias-bk/MF3/BK-MF3-07-relatorios-de-vendas-compras-margens-e-stock.md | Reforco |
| BK-MF3-08 | MF3 | S07-S08 | Andre | RF38 | BK-MF3-07 | docs/planificacao/guias-bk/MF3/BK-MF3-08-kpis-executivos-receita-custos-ebitda-pmr-pmp.md | Core |
| BK-MF4-01 | MF4 | S08-S09 | Oleksii | RF39 | BK-MF3-07 | docs/planificacao/guias-bk/MF4/BK-MF4-01-gerar-insights-automaticos-tendencias-riscos-clientes-artigos-parados.md | Reforco |
| BK-MF4-02 | MF4 | S08-S09 | Sofia | RF40 | BK-MF4-01 | docs/planificacao/guias-bk/MF4/BK-MF4-02-sugerir-acoes-ajustar-precos-negociar-fornecedor-repor-stock.md | Core |
| BK-MF4-03 | MF4 | S08-S09 | Andre | RF41 | BK-MF3-07 | docs/planificacao/guias-bk/MF4/BK-MF4-03-permitir-perguntas-em-linguagem-natural-e-responder-com-dados-e-fonte.md | Core |
| BK-MF4-04 | MF4 | S08-S09 | Pedro | RF42 | BK-MF3-04, BK-MF2-05 | docs/planificacao/guias-bk/MF4/BK-MF4-04-emitir-alertas-inteligentes-cashflow-desvios-ruturas.md | Core |
| BK-MF4-05 | MF4 | S08-S09 | Oleksii | RF43 | BK-MF4-01 | docs/planificacao/guias-bk/MF4/BK-MF4-05-mostrar-explicacoes-e-fontes-de-cada-insight.md | Reforco |
| BK-MF4-06 | MF4 | S08-S09 | Sofia | RF44 | - | docs/planificacao/guias-bk/MF4/BK-MF4-06-criar-editar-lembretes-essenciais-prazos-pagamentos-e-impostos.md | Core |
| BK-MF4-07 | MF4 | S08-S09 | Andre | RF45 | - | docs/planificacao/guias-bk/MF4/BK-MF4-07-criar-e-atribuir-tarefas-essenciais-com-estado-e-prazo.md | Core |
| BK-MF4-08 | MF4 | S08-S09 | Pedro | RF46 | BK-MF4-06, BK-MF4-04 | docs/planificacao/guias-bk/MF4/BK-MF4-08-notificacoes-in-app-para-lembretes-e-alertas-criticos-da-ia.md | Core |
| BK-MF4-09 | MF4 | S08-S09 | Andre | RF47 | - | docs/planificacao/guias-bk/MF4/BK-MF4-09-registar-auditoria-quem-quando-o-que-em-operacoes-sensiveis.md | Reforco |
| BK-MF4-10 | MF4 | S08-S09 | Pedro | RF48 | - | docs/planificacao/guias-bk/MF4/BK-MF4-10-registar-logs-de-integracao-uploads-saf-t-reconciliacoes.md | Reforco |
| BK-MF5-01 | MF5 | S09-S10 | Oleksii | RNF01 | - | docs/planificacao/guias-bk/MF5/BK-MF5-01-interface-intuitiva-clara-e-consistente-entre-modulos-vendas-compras-inventario-contabilidade.md | Reforco |
| BK-MF5-02 | MF5 | S09-S10 | Andre | RNF02 | - | docs/planificacao/guias-bk/MF5/BK-MF5-02-layout-responsivo-desktop-tablet-mobile-com-grelhas-e-tabelas-adaptadas.md | Reforco |
| BK-MF5-03 | MF5 | S09-S10 | Pedro | RNF03 | - | docs/planificacao/guias-bk/MF5/BK-MF5-03-a-interface-deve-usar-feedback-imediato-em-todas-as-acoes-guardar-validar-uploads.md | Reforco |
| BK-MF5-04 | MF5 | S09-S10 | Pedro | RNF04 | - | docs/planificacao/guias-bk/MF5/BK-MF5-04-cumprir-regras-basicas-de-acessibilidade-contraste-headings-legibilidade.md | Core |
| BK-MF5-05 | MF5 | S09-S10 | Oleksii | RNF05 | - | docs/planificacao/guias-bk/MF5/BK-MF5-05-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-iva-contas-snc.md | Reforco |
| BK-MF5-06 | MF5 | S09-S10 | Andre | RNF06 | - | docs/planificacao/guias-bk/MF5/BK-MF5-06-as-mensagens-de-erro-devem-ser-claras-e-indicar-como-resolver-o-problema.md | Reforco |
| BK-MF5-07 | MF5 | S09-S10 | Oleksii | RNF07 | - | docs/planificacao/guias-bk/MF5/BK-MF5-07-dashboard-e-listagens-devem-carregar-em-2-segundos.md | Reforco |
| BK-MF6-01 | MF6 | S10-S11 | Oleksii | RNF08 | - | docs/planificacao/guias-bk/MF6/BK-MF6-01-insercao-de-documentos-fatura-compra-lancamento-deve-ser-1-segundo.md | Reforco |
| BK-MF6-02 | MF6 | S10-S11 | Sofia | RNF09 | - | docs/planificacao/guias-bk/MF6/BK-MF6-02-suportar-25-utilizadores-simultaneos-por-empresa-sem-degradacao-relevante.md | Core |
| BK-MF6-03 | MF6 | S10-S11 | Oleksii | RNF10 | - | docs/planificacao/guias-bk/MF6/BK-MF6-03-reconciliacao-bancaria-deve-sugerir-correspondencias-em-3-segundos.md | Core |
| BK-MF6-04 | MF6 | S10-S11 | Andre | RNF11 | - | docs/planificacao/guias-bk/MF6/BK-MF6-04-calculo-de-custo-fifo-correto-sem-bloquear-operacoes-criticas.md | Core |
| BK-MF6-05 | MF6 | S10-S11 | Andre | RNF12 | - | docs/planificacao/guias-bk/MF6/BK-MF6-05-toda-a-comunicacao-deve-usar-https-tls-1-2.md | Reforco |
| BK-MF6-06 | MF6 | S10-S11 | Andre | RNF13 | - | docs/planificacao/guias-bk/MF6/BK-MF6-06-passwords-devem-usar-bcrypt-com-salt-seguro.md | Reforco |
| BK-MF6-07 | MF6 | S10-S11 | Oleksii | RNF14 | - | docs/planificacao/guias-bk/MF6/BK-MF6-07-sessoes-com-cookies-httponly-secure-samesite.md | Reforco |
| BK-MF6-08 | MF6 | S10-S11 | Oleksii | RNF15 | - | docs/planificacao/guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md | Reforco |
| BK-MF6-09 | MF6 | S10-S11 | Pedro | RNF16 | - | docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md | Reforco |
| BK-MF6-10 | MF6 | S10-S11 | Oleksii | RNF17 | - | docs/planificacao/guias-bk/MF6/BK-MF6-10-auditoria-obrigatoria-em-operacoes-sensiveis.md | Reforco |
| BK-MF7-01 | MF7 | S11-S12 | Pedro | RNF18 | - | docs/planificacao/guias-bk/MF7/BK-MF7-01-backups-automaticos-diarios-com-restauracao-possivel.md | Core |
| BK-MF7-02 | MF7 | S11-S12 | Andre | RNF19 | - | docs/planificacao/guias-bk/MF7/BK-MF7-02-cumprir-obrigacoes-legais-de-retencao-10-anos-contabilidade.md | Reforco |
| BK-MF7-03 | MF7 | S11-S12 | Pedro | RNF20 | - | docs/planificacao/guias-bk/MF7/BK-MF7-03-compativel-com-chrome-edge-e-firefox.md | Reforco |
| BK-MF7-04 | MF7 | S11-S12 | Sofia | RNF21 | - | docs/planificacao/guias-bk/MF7/BK-MF7-04-integracao-com-servicos-de-email-recuperacao-de-password-alertas.md | Reforco |
| BK-MF7-05 | MF7 | S11-S12 | Sofia | RNF22 | - | docs/planificacao/guias-bk/MF7/BK-MF7-05-exportacoes-disponiveis-em-csv-excel-e-pdf.md | Core |
| BK-MF7-06 | MF7 | S11-S12 | Oleksii | RNF23 | - | docs/planificacao/guias-bk/MF7/BK-MF7-06-importacoes-csv-excel-com-validacao-e-logs-de-erro.md | Reforco |
| BK-MF7-07 | MF7 | S11-S12 | Andre | RNF24 | - | docs/planificacao/guias-bk/MF7/BK-MF7-07-geracao-de-saf-t-conforme-especificacoes-legais-pt.md | Reforco |
| BK-MF7-08 | MF7 | S11-S12 | Oleksii | RNF25 | - | docs/planificacao/guias-bk/MF7/BK-MF7-08-backend-modular-por-dominio-vendas-compras-inventario-bancos-contabilidade-ia.md | Reforco |
| BK-MF7-09 | MF7 | S11-S12 | Andre | RNF26 | - | docs/planificacao/guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md | Reforco |
| BK-MF7-10 | MF7 | S11-S12 | Oleksii | RNF27 | - | docs/planificacao/guias-bk/MF7/BK-MF7-10-testes-automatizados-para-modulos-criticos-faturacao-iva-balancetes-reconciliacao.md | Core |
| BK-MF8-01 | MF8 | S12 | Oleksii | RNF28 | - | docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md | Reforco |
| BK-MF8-02 | MF8 | S12 | Pedro | RNF29 | - | docs/planificacao/guias-bk/MF8/BK-MF8-02-endpoint-de-health-check.md | Core |
| BK-MF8-03 | MF8 | S12 | Sofia | RNF30 | - | docs/planificacao/guias-bk/MF8/BK-MF8-03-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md | Core |
| BK-MF8-04 | MF8 | S12 | Andre | RNF31 | - | docs/planificacao/guias-bk/MF8/BK-MF8-04-insights-devem-incluir-explicacao-e-origem-dos-dados-usados.md | Reforco |
| BK-MF8-05 | MF8 | S12 | Oleksii | RNF32 | - | docs/planificacao/guias-bk/MF8/BK-MF8-05-ia-nao-altera-dados-contabilisticos-apenas-analisa-e-recomenda.md | Reforco |
| BK-MF8-06 | MF8 | S12 | Andre | RNF33 | - | docs/planificacao/guias-bk/MF8/BK-MF8-06-alertas-configuraveis-ativar-desativar-tipos.md | Core |
| BK-MF8-07 | MF8 | S12 | Pedro | RNF34 | - | docs/planificacao/guias-bk/MF8/BK-MF8-07-ia-deve-evitar-enviesamentos-e-sugerir-acoes-baseadas-em-dados-reais.md | Core |
| BK-MF8-08 | MF8 | S12 | Sofia | RNF35 | - | docs/planificacao/guias-bk/MF8/BK-MF8-08-interface-em-portugues-de-portugal.md | Reforco |
| BK-MF8-09 | MF8 | S12 | Sofia | RNF36 | - | docs/planificacao/guias-bk/MF8/BK-MF8-09-datas-moedas-e-separadores-no-padrao-europeu.md | Core |

## Changelog
- `2026-04-13`: Contrato de campos BK formalizado com regra de derivacao Core/Reforco.
