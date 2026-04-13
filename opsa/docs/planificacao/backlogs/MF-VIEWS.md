# MF-VIEWS

## Header
- `doc_id`: `MF-VIEWS`
- `path`: `docs/planificacao/backlogs/MF-VIEWS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-13`

## Sequencia macro
MF0 -> MF1 -> MF2 -> MF3 -> MF4 -> MF5 -> MF6 -> MF7 -> MF8


## Regra de execucao para Muito Alto
- Executar cada BK com foco em entrega funcional + robustez tecnica + evidencia de defesa.
- Nao transitar de macro sem checklist `Core` nos BK criticos e `Reforco` nos BK `P0`.
- Manter alinhamento continuo entre guia BK, backlog e matriz comparativa.
- Aplicar gate pedagogico por sprint: sem `Core` concluido na sprint N, o `Reforco` da N+1 nao inicia.

## Gates por macro
- Gate de entrada: dependencias desbloqueadas e contexto tecnico lido.
- Gate de execucao: smoke + negativos aprovados por BK (P0>=3; P1/P2>=2).
- Gate de saida: criterios de aceite mensuraveis, evidence completa e handoff formal para macro seguinte.

## MF0 - Fundamentos e governance
### Sequencia por macro
BK-MF0-01, BK-MF0-02, BK-MF0-03, BK-MF0-04, BK-MF0-05, BK-MF0-06, BK-MF0-07, BK-MF0-08, BK-MF0-09, BK-MF0-10, BK-MF0-11, BK-MF0-12

### Guias disponiveis
- [BK-MF0-01 - Registo, login e logout com cookies HttpOnly.](../guias-bk/MF0/BK-MF0-01.md)
- [BK-MF0-02 - Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).](../guias-bk/MF0/BK-MF0-02.md)
- [BK-MF0-03 - Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).](../guias-bk/MF0/BK-MF0-03.md)
- [BK-MF0-04 - Gestão de utilizadores: convite, remoção e definição de papéis.](../guias-bk/MF0/BK-MF0-04.md)
- [BK-MF0-05 - Recuperação de password via email.](../guias-bk/MF0/BK-MF0-05.md)
- [BK-MF0-06 - Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal).](../guias-bk/MF0/BK-MF0-06.md)
- [BK-MF0-07 - Criar/importar plano de contas (SNC).](../guias-bk/MF0/BK-MF0-07.md)
- [BK-MF0-08 - Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho.](../guias-bk/MF0/BK-MF0-08.md)
- [BK-MF0-09 - Criar e gerir clientes.](../guias-bk/MF0/BK-MF0-09.md)
- [BK-MF0-10 - Criar e gerir fornecedores.](../guias-bk/MF0/BK-MF0-10.md)
- [BK-MF0-11 - Criar artigos/serviços (SKU, custo, preço, IVA).](../guias-bk/MF0/BK-MF0-11.md)
- [BK-MF0-12 - Criar armazéns e localizações.](../guias-bk/MF0/BK-MF0-12.md)

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
BK-MF1-01, BK-MF1-02, BK-MF1-03, BK-MF1-04, BK-MF1-05, BK-MF1-06, BK-MF1-07, BK-MF1-08, BK-MF1-09, BK-MF1-10, BK-MF1-11, BK-MF1-12

### Guias disponiveis
- [BK-MF1-01 - Configurar tabelas de IVA (taxas, isenções, códigos).](../guias-bk/MF1/BK-MF1-01.md)
- [BK-MF1-02 - Emitir Fatura, Fatura-Recibo, Nota de Crédito, com numeração sequencial.](../guias-bk/MF1/BK-MF1-02.md)
- [BK-MF1-03 - Registar recebimentos (parciais/totais).](../guias-bk/MF1/BK-MF1-03.md)
- [BK-MF1-04 - Gerar lançamentos contabilísticos automáticos por venda.](../guias-bk/MF1/BK-MF1-04.md)
- [BK-MF1-05 - Consultar títulos em aberto e antiguidade de saldos.](../guias-bk/MF1/BK-MF1-05.md)
- [BK-MF1-06 - Submeter documentos de venda para aprovação antes de emissão definitiva.](../guias-bk/MF1/BK-MF1-06.md)
- [BK-MF1-07 - Definir fluxos e limites de aprovação (por papel, valor, cliente).](../guias-bk/MF1/BK-MF1-07.md)
- [BK-MF1-08 - Registar histórico de decisões de aprovação e comentários.](../guias-bk/MF1/BK-MF1-08.md)
- [BK-MF1-09 - Registar Fatura de Fornecedor e Nota de Crédito.](../guias-bk/MF1/BK-MF1-09.md)
- [BK-MF1-10 - Registar pagamentos (parciais/totais).](../guias-bk/MF1/BK-MF1-10.md)
- [BK-MF1-11 - Gerar lançamentos contabilísticos automáticos de compras.](../guias-bk/MF1/BK-MF1-11.md)
- [BK-MF1-12 - Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.](../guias-bk/MF1/BK-MF1-12.md)

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
BK-MF2-01, BK-MF2-02, BK-MF2-03, BK-MF2-04, BK-MF2-05, BK-MF2-06, BK-MF2-07, BK-MF2-08, BK-MF2-09, BK-MF2-10, BK-MF2-11, BK-MF2-12

### Guias disponiveis
- [BK-MF2-01 - Configurar limites e papéis para aprovações (por fornecedor/valor).](../guias-bk/MF2/BK-MF2-01.md)
- [BK-MF2-02 - Histórico e justificações para aprovações/reprovações.](../guias-bk/MF2/BK-MF2-02.md)
- [BK-MF2-03 - Movimentos de stock: entradas, saídas, transferências, devoluções.](../guias-bk/MF2/BK-MF2-03.md)
- [BK-MF2-04 - Cálculo de custo (FIFO).](../guias-bk/MF2/BK-MF2-04.md)
- [BK-MF2-05 - Contagem física e ajustes.](../guias-bk/MF2/BK-MF2-05.md)
- [BK-MF2-06 - Alertas de stock (mínimos, máximos, artigos parados).](../guias-bk/MF2/BK-MF2-06.md)
- [BK-MF2-07 - Configurar centros de custo / segmentos analíticos.](../guias-bk/MF2/BK-MF2-07.md)
- [BK-MF2-08 - Associar documentos e lançamentos a centros de custo.](../guias-bk/MF2/BK-MF2-08.md)
- [BK-MF2-09 - Relatórios e filtros por centro de custo/segmento.](../guias-bk/MF2/BK-MF2-09.md)
- [BK-MF2-10 - Criar e editar lançamentos manuais (com anexos).](../guias-bk/MF2/BK-MF2-10.md)
- [BK-MF2-11 - Consultar balancete e razão exportável (PDF/Excel).](../guias-bk/MF2/BK-MF2-11.md)
- [BK-MF2-12 - Gerar Demonstração de Resultados e Balanço.](../guias-bk/MF2/BK-MF2-12.md)

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
BK-MF3-01, BK-MF3-02, BK-MF3-03, BK-MF3-04, BK-MF3-05, BK-MF3-06, BK-MF3-07, BK-MF3-08, BK-MF3-09, BK-MF3-10, BK-MF3-11, BK-MF3-12

### Guias disponiveis
- [BK-MF3-01 - Gerar Mapas de IVA (liquidado/dedutível).](../guias-bk/MF3/BK-MF3-01.md)
- [BK-MF3-02 - Criar contas bancárias/caixa e respetivos saldos.](../guias-bk/MF3/BK-MF3-02.md)
- [BK-MF3-03 - Importar extratos bancários (CSV/OFX) e fazer reconciliação automática.](../guias-bk/MF3/BK-MF3-03.md)
- [BK-MF3-04 - Gerar previsão de tesouraria (entradas e saídas futuras).](../guias-bk/MF3/BK-MF3-04.md)
- [BK-MF3-05 - Upload de documentos com OCR (ler NIF, data, total, IVA).](../guias-bk/MF3/BK-MF3-05.md)
- [BK-MF3-06 - Importar CSV/Excel de clientes, fornecedores, artigos e extratos.](../guias-bk/MF3/BK-MF3-06.md)
- [BK-MF3-07 - Exportar SAF-T (PT) de faturação e contabilidade.](../guias-bk/MF3/BK-MF3-07.md)
- [BK-MF3-08 - (Opcional) Integração com e-Fatura.](../guias-bk/MF3/BK-MF3-08.md)
- [BK-MF3-09 - Mapear documentos de integração para centros de custo.](../guias-bk/MF3/BK-MF3-09.md)
- [BK-MF3-10 - Relatórios de vendas, compras, margens e stock.](../guias-bk/MF3/BK-MF3-10.md)
- [BK-MF3-11 - KPIs executivos (receita, custos, EBITDA, PMR, PMP).](../guias-bk/MF3/BK-MF3-11.md)
- [BK-MF3-12 - Personalização de relatórios e exportação (PDF/Excel).](../guias-bk/MF3/BK-MF3-12.md)

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
BK-MF4-01, BK-MF4-02, BK-MF4-03, BK-MF4-04, BK-MF4-05, BK-MF4-06, BK-MF4-07, BK-MF4-08, BK-MF4-09, BK-MF4-10, BK-MF4-11, BK-MF4-12

### Guias disponiveis
- [BK-MF4-01 - Gerar insights automáticos (tendências, riscos, clientes, artigos parados).](../guias-bk/MF4/BK-MF4-01.md)
- [BK-MF4-02 - Sugerir ações (ajustar preços, negociar fornecedor, repor stock).](../guias-bk/MF4/BK-MF4-02.md)
- [BK-MF4-03 - Permitir perguntas em linguagem natural e responder com dados e fonte.](../guias-bk/MF4/BK-MF4-03.md)
- [BK-MF4-04 - Emitir alertas inteligentes (cashflow, desvios, ruturas).](../guias-bk/MF4/BK-MF4-04.md)
- [BK-MF4-05 - Mostrar explicações e fontes de cada insight.](../guias-bk/MF4/BK-MF4-05.md)
- [BK-MF4-06 - Criar/editar lembretes (prazos, pagamentos, impostos).](../guias-bk/MF4/BK-MF4-06.md)
- [BK-MF4-07 - Criar e atribuir tarefas com estado e prazo.](../guias-bk/MF4/BK-MF4-07.md)
- [BK-MF4-08 - Notificações (in-app/email) para lembretes e alertas da IA.](../guias-bk/MF4/BK-MF4-08.md)
- [BK-MF4-09 - Registar auditoria: quem, quando, o quê, em operações sensíveis.](../guias-bk/MF4/BK-MF4-09.md)
- [BK-MF4-10 - Registar logs de integração (uploads, SAF-T, reconciliações).](../guias-bk/MF4/BK-MF4-10.md)
- [BK-MF4-11 - Permitir reabertura de períodos apenas com registo de motivo.](../guias-bk/MF4/BK-MF4-11.md)
- [BK-MF4-12 - Definir workflows de aprovação por documento (compra, venda, pagamento).](../guias-bk/MF4/BK-MF4-12.md)

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
BK-MF5-01, BK-MF5-02, BK-MF5-03, BK-MF5-04, BK-MF5-05, BK-MF5-06, BK-MF5-07, BK-MF5-08, BK-MF5-09, BK-MF5-10, BK-MF5-11

### Guias disponiveis
- [BK-MF5-01 - Configurar níveis de aprovação com limites financeiros e escalamentos.](../guias-bk/MF5/BK-MF5-01.md)
- [BK-MF5-02 - Painel para monitorizar aprovações pendentes e SLA por tipo de documento.](../guias-bk/MF5/BK-MF5-02.md)
- [BK-MF5-03 - Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria.](../guias-bk/MF5/BK-MF5-03.md)
- [BK-MF5-04 - Gerir linhas de crédito (limites, utilização, alertas) por banco.](../guias-bk/MF5/BK-MF5-04.md)
- [BK-MF5-05 - Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade).](../guias-bk/MF5/BK-MF5-05.md)
- [BK-MF5-06 - Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas.](../guias-bk/MF5/BK-MF5-06.md)
- [BK-MF5-07 - A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads).](../guias-bk/MF5/BK-MF5-07.md)
- [BK-MF5-08 - Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade).](../guias-bk/MF5/BK-MF5-08.md)
- [BK-MF5-09 - Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC).](../guias-bk/MF5/BK-MF5-09.md)
- [BK-MF5-10 - As mensagens de erro devem ser claras e indicar como resolver o problema.](../guias-bk/MF5/BK-MF5-10.md)
- [BK-MF5-11 - Dashboard e listagens devem carregar em ≤ 2 segundos.](../guias-bk/MF5/BK-MF5-11.md)

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
BK-MF6-01, BK-MF6-02, BK-MF6-03, BK-MF6-04, BK-MF6-05, BK-MF6-06, BK-MF6-07, BK-MF6-08, BK-MF6-09, BK-MF6-10, BK-MF6-11

### Guias disponiveis
- [BK-MF6-01 - Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo.](../guias-bk/MF6/BK-MF6-01.md)
- [BK-MF6-02 - Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação.](../guias-bk/MF6/BK-MF6-02.md)
- [BK-MF6-03 - Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.](../guias-bk/MF6/BK-MF6-03.md)
- [BK-MF6-04 - Cálculo de custo (FIFO) deve ser incremental e não bloquear operações.](../guias-bk/MF6/BK-MF6-04.md)
- [BK-MF6-05 - Arquitetura preparada para escalar horizontalmente.](../guias-bk/MF6/BK-MF6-05.md)
- [BK-MF6-06 - Toda a comunicação deve usar HTTPS (TLS 1.2+).](../guias-bk/MF6/BK-MF6-06.md)
- [BK-MF6-07 - Passwords devem usar bcrypt com salt seguro.](../guias-bk/MF6/BK-MF6-07.md)
- [BK-MF6-08 - Sessões com cookies HttpOnly + Secure + SameSite.](../guias-bk/MF6/BK-MF6-08.md)
- [BK-MF6-09 - Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).](../guias-bk/MF6/BK-MF6-09.md)
- [BK-MF6-10 - Chaves de API e credenciais apenas em variáveis de ambiente.](../guias-bk/MF6/BK-MF6-10.md)
- [BK-MF6-11 - Auditoria obrigatória em operações sensíveis.](../guias-bk/MF6/BK-MF6-11.md)

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
BK-MF7-01, BK-MF7-02, BK-MF7-03, BK-MF7-04, BK-MF7-05, BK-MF7-06, BK-MF7-07, BK-MF7-08, BK-MF7-09, BK-MF7-10, BK-MF7-11

### Guias disponiveis
- [BK-MF7-01 - Backups automáticos diários com restauração possível.](../guias-bk/MF7/BK-MF7-01.md)
- [BK-MF7-02 - Cumprir obrigações legais de retenção (10 anos, contabilidade).](../guias-bk/MF7/BK-MF7-02.md)
- [BK-MF7-03 - Compatível com Chrome, Edge, Firefox e Safari.](../guias-bk/MF7/BK-MF7-03.md)
- [BK-MF7-04 - Integração com serviços de email (recuperação de password, alertas).](../guias-bk/MF7/BK-MF7-04.md)
- [BK-MF7-05 - Exportações disponíveis em CSV, Excel e PDF.](../guias-bk/MF7/BK-MF7-05.md)
- [BK-MF7-06 - Importações CSV/Excel com validação e logs de erro.](../guias-bk/MF7/BK-MF7-06.md)
- [BK-MF7-07 - Geração de SAF-T conforme especificações legais (PT).](../guias-bk/MF7/BK-MF7-07.md)
- [BK-MF7-08 - API interna estável para futuras integrações.](../guias-bk/MF7/BK-MF7-08.md)
- [BK-MF7-09 - Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).](../guias-bk/MF7/BK-MF7-09.md)
- [BK-MF7-10 - Frontend modular com componentes reutilizáveis.](../guias-bk/MF7/BK-MF7-10.md)
- [BK-MF7-11 - Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação).](../guias-bk/MF7/BK-MF7-11.md)

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
BK-MF8-01, BK-MF8-02, BK-MF8-03, BK-MF8-04, BK-MF8-05, BK-MF8-06, BK-MF8-07, BK-MF8-08, BK-MF8-09, BK-MF8-10, BK-MF8-11

### Guias disponiveis
- [BK-MF8-01 - Logs estruturados (info, warn, error, audit).](../guias-bk/MF8/BK-MF8-01.md)
- [BK-MF8-02 - Endpoint de health-check.](../guias-bk/MF8/BK-MF8-02.md)
- [BK-MF8-03 - Deploy com rollback.](../guias-bk/MF8/BK-MF8-03.md)
- [BK-MF8-04 - Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).](../guias-bk/MF8/BK-MF8-04.md)
- [BK-MF8-05 - Insights devem incluir explicação e origem dos dados usados.](../guias-bk/MF8/BK-MF8-05.md)
- [BK-MF8-06 - IA não altera dados contabilísticos; apenas analisa e recomenda.](../guias-bk/MF8/BK-MF8-06.md)
- [BK-MF8-07 - Alertas configuráveis (ativar/desativar tipos).](../guias-bk/MF8/BK-MF8-07.md)
- [BK-MF8-08 - IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.](../guias-bk/MF8/BK-MF8-08.md)
- [BK-MF8-09 - Interface em português de Portugal.](../guias-bk/MF8/BK-MF8-09.md)
- [BK-MF8-10 - Preparado para futura tradução (suporte i18n básico).](../guias-bk/MF8/BK-MF8-10.md)
- [BK-MF8-11 - Datas, moedas e separadores no padrão europeu.](../guias-bk/MF8/BK-MF8-11.md)

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
- `2026-04-12`: MF-VIEWS normalizado e alinhado com matriz canonica.
- `2026-04-13`: Gates macro e regra de transicao alinhados com politica Core/Reforco.
