# GUIAS-BK-README

## Header
- `doc_id`: `GUIAS-BK-README`
- `path`: `docs/planificacao/guias-bk/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-13`

## Estado de cobertura por fase
| Fase | Macros | BK totais | Guias existentes | Cobertura |
| --- | --- | --- | --- | --- |
| Fase 1 | MF0, MF1, MF2 | 36 | 36 | 100% |
| Fase 2 | MF3, MF4, MF5 | 35 | 35 | 100% |
| Fase 3 | MF6, MF7, MF8 | 33 | 33 | 100% |

## Contrato editorial
Todos os guias seguem `_TEMPLATE-BK.md` com secao obrigatoria de checklist e evidence.
Campos de header obrigatorios: `bk_id`, `macro`, `sprint`, `owner`, `rf_rnf`, `dependencias`, `guia_path`, `core_or_reforco`.

## Regra de carga pedagogica (sem reduzir cobertura)
- BK `P0`: modo `Reforco` (>=8 passos e >=3 negativos).
- BK `P1/P2`: modo `Core` (>=6 passos e >=2 negativos).
- Campos pedagogicos obrigatorios por guia: `pre-requisitos`, `objetivo pedagogico`, `tempo estimado`, `erros comuns`, `check de compreensao`.

## Ordem de leitura
1. `../backlogs/MATRIZ-CANONICA-BK.md`
2. `../backlogs/BACKLOG-MVP.md`
3. `../backlogs/MF-VIEWS.md`
4. Guias BK por macro MF0..MF8.

## Indice completo por macro
### MF0
- [BK-MF0-01 - Registo, login e logout com cookies HttpOnly.](MF0/BK-MF0-01.md)
- [BK-MF0-02 - Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).](MF0/BK-MF0-02.md)
- [BK-MF0-03 - Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).](MF0/BK-MF0-03.md)
- [BK-MF0-04 - Gestão de utilizadores: convite, remoção e definição de papéis.](MF0/BK-MF0-04.md)
- [BK-MF0-05 - Recuperação de password via email.](MF0/BK-MF0-05.md)
- [BK-MF0-06 - Registar dados da empresa (NIF, morada, moeda, logótipo, período fiscal).](MF0/BK-MF0-06.md)
- [BK-MF0-07 - Criar/importar plano de contas (SNC).](MF0/BK-MF0-07.md)
- [BK-MF0-08 - Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho.](MF0/BK-MF0-08.md)
- [BK-MF0-09 - Criar e gerir clientes.](MF0/BK-MF0-09.md)
- [BK-MF0-10 - Criar e gerir fornecedores.](MF0/BK-MF0-10.md)
- [BK-MF0-11 - Criar artigos/serviços (SKU, custo, preço, IVA).](MF0/BK-MF0-11.md)
- [BK-MF0-12 - Criar armazéns e localizações.](MF0/BK-MF0-12.md)

### MF1
- [BK-MF1-01 - Configurar tabelas de IVA (taxas, isenções, códigos).](MF1/BK-MF1-01.md)
- [BK-MF1-02 - Emitir Fatura, Fatura-Recibo, Nota de Crédito, com numeração sequencial.](MF1/BK-MF1-02.md)
- [BK-MF1-03 - Registar recebimentos (parciais/totais).](MF1/BK-MF1-03.md)
- [BK-MF1-04 - Gerar lançamentos contabilísticos automáticos por venda.](MF1/BK-MF1-04.md)
- [BK-MF1-05 - Consultar títulos em aberto e antiguidade de saldos.](MF1/BK-MF1-05.md)
- [BK-MF1-06 - Submeter documentos de venda para aprovação antes de emissão definitiva.](MF1/BK-MF1-06.md)
- [BK-MF1-07 - Definir fluxos e limites de aprovação (por papel, valor, cliente).](MF1/BK-MF1-07.md)
- [BK-MF1-08 - Registar histórico de decisões de aprovação e comentários.](MF1/BK-MF1-08.md)
- [BK-MF1-09 - Registar Fatura de Fornecedor e Nota de Crédito.](MF1/BK-MF1-09.md)
- [BK-MF1-10 - Registar pagamentos (parciais/totais).](MF1/BK-MF1-10.md)
- [BK-MF1-11 - Gerar lançamentos contabilísticos automáticos de compras.](MF1/BK-MF1-11.md)
- [BK-MF1-12 - Aprovação de compras com estados “Rascunho → Aprovado → Lançado”.](MF1/BK-MF1-12.md)

### MF2
- [BK-MF2-01 - Configurar limites e papéis para aprovações (por fornecedor/valor).](MF2/BK-MF2-01.md)
- [BK-MF2-02 - Histórico e justificações para aprovações/reprovações.](MF2/BK-MF2-02.md)
- [BK-MF2-03 - Movimentos de stock: entradas, saídas, transferências, devoluções.](MF2/BK-MF2-03.md)
- [BK-MF2-04 - Cálculo de custo (FIFO).](MF2/BK-MF2-04.md)
- [BK-MF2-05 - Contagem física e ajustes.](MF2/BK-MF2-05.md)
- [BK-MF2-06 - Alertas de stock (mínimos, máximos, artigos parados).](MF2/BK-MF2-06.md)
- [BK-MF2-07 - Configurar centros de custo / segmentos analíticos.](MF2/BK-MF2-07.md)
- [BK-MF2-08 - Associar documentos e lançamentos a centros de custo.](MF2/BK-MF2-08.md)
- [BK-MF2-09 - Relatórios e filtros por centro de custo/segmento.](MF2/BK-MF2-09.md)
- [BK-MF2-10 - Criar e editar lançamentos manuais (com anexos).](MF2/BK-MF2-10.md)
- [BK-MF2-11 - Consultar balancete e razão exportável (PDF/Excel).](MF2/BK-MF2-11.md)
- [BK-MF2-12 - Gerar Demonstração de Resultados e Balanço.](MF2/BK-MF2-12.md)

### MF3
- [BK-MF3-01 - Gerar Mapas de IVA (liquidado/dedutível).](MF3/BK-MF3-01.md)
- [BK-MF3-02 - Criar contas bancárias/caixa e respetivos saldos.](MF3/BK-MF3-02.md)
- [BK-MF3-03 - Importar extratos bancários (CSV/OFX) e fazer reconciliação automática.](MF3/BK-MF3-03.md)
- [BK-MF3-04 - Gerar previsão de tesouraria (entradas e saídas futuras).](MF3/BK-MF3-04.md)
- [BK-MF3-05 - Upload de documentos com OCR (ler NIF, data, total, IVA).](MF3/BK-MF3-05.md)
- [BK-MF3-06 - Importar CSV/Excel de clientes, fornecedores, artigos e extratos.](MF3/BK-MF3-06.md)
- [BK-MF3-07 - Exportar SAF-T (PT) de faturação e contabilidade.](MF3/BK-MF3-07.md)
- [BK-MF3-08 - (Opcional) Integração com e-Fatura.](MF3/BK-MF3-08.md)
- [BK-MF3-09 - Mapear documentos de integração para centros de custo.](MF3/BK-MF3-09.md)
- [BK-MF3-10 - Relatórios de vendas, compras, margens e stock.](MF3/BK-MF3-10.md)
- [BK-MF3-11 - KPIs executivos (receita, custos, EBITDA, PMR, PMP).](MF3/BK-MF3-11.md)
- [BK-MF3-12 - Personalização de relatórios e exportação (PDF/Excel).](MF3/BK-MF3-12.md)

### MF4
- [BK-MF4-01 - Gerar insights automáticos (tendências, riscos, clientes, artigos parados).](MF4/BK-MF4-01.md)
- [BK-MF4-02 - Sugerir ações (ajustar preços, negociar fornecedor, repor stock).](MF4/BK-MF4-02.md)
- [BK-MF4-03 - Permitir perguntas em linguagem natural e responder com dados e fonte.](MF4/BK-MF4-03.md)
- [BK-MF4-04 - Emitir alertas inteligentes (cashflow, desvios, ruturas).](MF4/BK-MF4-04.md)
- [BK-MF4-05 - Mostrar explicações e fontes de cada insight.](MF4/BK-MF4-05.md)
- [BK-MF4-06 - Criar/editar lembretes (prazos, pagamentos, impostos).](MF4/BK-MF4-06.md)
- [BK-MF4-07 - Criar e atribuir tarefas com estado e prazo.](MF4/BK-MF4-07.md)
- [BK-MF4-08 - Notificações (in-app/email) para lembretes e alertas da IA.](MF4/BK-MF4-08.md)
- [BK-MF4-09 - Registar auditoria: quem, quando, o quê, em operações sensíveis.](MF4/BK-MF4-09.md)
- [BK-MF4-10 - Registar logs de integração (uploads, SAF-T, reconciliações).](MF4/BK-MF4-10.md)
- [BK-MF4-11 - Permitir reabertura de períodos apenas com registo de motivo.](MF4/BK-MF4-11.md)
- [BK-MF4-12 - Definir workflows de aprovação por documento (compra, venda, pagamento).](MF4/BK-MF4-12.md)

### MF5
- [BK-MF5-01 - Configurar níveis de aprovação com limites financeiros e escalamentos.](MF5/BK-MF5-01.md)
- [BK-MF5-02 - Painel para monitorizar aprovações pendentes e SLA por tipo de documento.](MF5/BK-MF5-02.md)
- [BK-MF5-03 - Agendar pagamentos/recebimentos futuros com integração às previsões de tesouraria.](MF5/BK-MF5-03.md)
- [BK-MF5-04 - Gerir linhas de crédito (limites, utilização, alertas) por banco.](MF5/BK-MF5-04.md)
- [BK-MF5-05 - Interface intuitiva, clara e consistente entre módulos (Vendas, Compras, Inventário, Contabilidade).](MF5/BK-MF5-05.md)
- [BK-MF5-06 - Layout responsivo (desktop > tablet > mobile) com grelhas e tabelas adaptadas.](MF5/BK-MF5-06.md)
- [BK-MF5-07 - A interface deve usar feedback imediato em todas as ações (guardar, validar, uploads).](MF5/BK-MF5-07.md)
- [BK-MF5-08 - Cumprir regras básicas de acessibilidade (contraste, headings, legibilidade).](MF5/BK-MF5-08.md)
- [BK-MF5-09 - Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC).](MF5/BK-MF5-09.md)
- [BK-MF5-10 - As mensagens de erro devem ser claras e indicar como resolver o problema.](MF5/BK-MF5-10.md)
- [BK-MF5-11 - Dashboard e listagens devem carregar em ≤ 2 segundos.](MF5/BK-MF5-11.md)

### MF6
- [BK-MF6-01 - Inserção de documentos (fatura, compra, lançamento) deve ser ≤ 1 segundo.](MF6/BK-MF6-01.md)
- [BK-MF6-02 - Suportar ≥ 50 utilizadores simultâneos por empresa sem degradação.](MF6/BK-MF6-02.md)
- [BK-MF6-03 - Reconciliação bancária deve sugerir correspondências em ≤ 3 segundos.](MF6/BK-MF6-03.md)
- [BK-MF6-04 - Cálculo de custo (FIFO) deve ser incremental e não bloquear operações.](MF6/BK-MF6-04.md)
- [BK-MF6-05 - Arquitetura preparada para escalar horizontalmente.](MF6/BK-MF6-05.md)
- [BK-MF6-06 - Toda a comunicação deve usar HTTPS (TLS 1.2+).](MF6/BK-MF6-06.md)
- [BK-MF6-07 - Passwords devem usar bcrypt com salt seguro.](MF6/BK-MF6-07.md)
- [BK-MF6-08 - Sessões com cookies HttpOnly + Secure + SameSite.](MF6/BK-MF6-08.md)
- [BK-MF6-09 - Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).](MF6/BK-MF6-09.md)
- [BK-MF6-10 - Chaves de API e credenciais apenas em variáveis de ambiente.](MF6/BK-MF6-10.md)
- [BK-MF6-11 - Auditoria obrigatória em operações sensíveis.](MF6/BK-MF6-11.md)

### MF7
- [BK-MF7-01 - Backups automáticos diários com restauração possível.](MF7/BK-MF7-01.md)
- [BK-MF7-02 - Cumprir obrigações legais de retenção (10 anos, contabilidade).](MF7/BK-MF7-02.md)
- [BK-MF7-03 - Compatível com Chrome, Edge, Firefox e Safari.](MF7/BK-MF7-03.md)
- [BK-MF7-04 - Integração com serviços de email (recuperação de password, alertas).](MF7/BK-MF7-04.md)
- [BK-MF7-05 - Exportações disponíveis em CSV, Excel e PDF.](MF7/BK-MF7-05.md)
- [BK-MF7-06 - Importações CSV/Excel com validação e logs de erro.](MF7/BK-MF7-06.md)
- [BK-MF7-07 - Geração de SAF-T conforme especificações legais (PT).](MF7/BK-MF7-07.md)
- [BK-MF7-08 - API interna estável para futuras integrações.](MF7/BK-MF7-08.md)
- [BK-MF7-09 - Backend modular por domínio (vendas, compras, inventário, bancos, contabilidade, IA).](MF7/BK-MF7-09.md)
- [BK-MF7-10 - Frontend modular com componentes reutilizáveis.](MF7/BK-MF7-10.md)
- [BK-MF7-11 - Testes automatizados para módulos críticos (faturação, IVA, balancetes, reconciliação).](MF7/BK-MF7-11.md)

### MF8
- [BK-MF8-01 - Logs estruturados (info, warn, error, audit).](MF8/BK-MF8-01.md)
- [BK-MF8-02 - Endpoint de health-check.](MF8/BK-MF8-02.md)
- [BK-MF8-03 - Deploy com rollback.](MF8/BK-MF8-03.md)
- [BK-MF8-04 - Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).](MF8/BK-MF8-04.md)
- [BK-MF8-05 - Insights devem incluir explicação e origem dos dados usados.](MF8/BK-MF8-05.md)
- [BK-MF8-06 - IA não altera dados contabilísticos; apenas analisa e recomenda.](MF8/BK-MF8-06.md)
- [BK-MF8-07 - Alertas configuráveis (ativar/desativar tipos).](MF8/BK-MF8-07.md)
- [BK-MF8-08 - IA deve evitar enviesamentos e sugerir ações baseadas em dados reais.](MF8/BK-MF8-08.md)
- [BK-MF8-09 - Interface em português de Portugal.](MF8/BK-MF8-09.md)
- [BK-MF8-10 - Preparado para futura tradução (suporte i18n básico).](MF8/BK-MF8-10.md)
- [BK-MF8-11 - Datas, moedas e separadores no padrão europeu.](MF8/BK-MF8-11.md)

## Changelog
- `2026-04-13`: regra `Core/Reforco` adicionada para reduzir carga pedagogica mantendo cobertura integral.
- `2026-04-13`: contrato editorial expandido com campos canónicos e secoes pedagogicas obrigatorias.
