# AUDITORIA-HIDRATACAO-MF7 - OPSA

## Header

- `project`: `OPSA`
- `mf_alvo`: `MF7`
- `bk_ids`: `[BK-MF7-01, BK-MF7-02, BK-MF7-03, BK-MF7-04, BK-MF7-05, BK-MF7-06, BK-MF7-07, BK-MF7-08, BK-MF7-09, BK-MF7-10]`
- `modo`: `auditar_apenas`
- `tipo_execucao`: `reauditoria_documental_mf7_pos_correcao`
- `output_mode`: `relatorio_e_resumo`
- `strict_scope`: `true`
- `check_mf_coherence`: `true`
- `implementation_root`: `real_dev`
- `reference_implementation_root`: `real_dev`
- `reference_implementation_baseline`: `MF0..MF6`
- `target_mf_implementation_status`: `not_assumed`
- `student_app_root`: `apps`
- `student_backend_root`: `apps/api`
- `student_frontend_root`: `apps/web`
- `student_prisma_schema`: `apps/api/prisma/schema.prisma`
- `permitir_alterar_docs`: `sim`
- `permitir_commits`: `nao`
- `last_updated`: `2026-06-27`

## Escopo desta reauditoria

Esta execução recebeu `MODO=auditar_apenas`, `BK_IDS=[]`, `RUN_COMMANDS=true` e `STRICT_SCOPE=true`. Foram re-auditados os 10 BKs oficiais da `MF7`, mas os guias BK, `apps/`, `real_dev/`, RF/RNF, matriz, backlog, sprints e documentos canónicos ficaram intocados.

- Permitido nesta execução: atualizar apenas este relatório.
- Não permitido nesta execução: editar BKs, código em `apps/`, código em `real_dev/`, RF/RNF, matriz, backlog, sprints ou fazer commits.
- Raiz interna consultada: `real_dev/api` e `real_dev/web`, apenas como referência estrutural e baseline até `MF6`.
- Raiz canónica dos alunos nos BKs: `apps/api`, `apps/web` e `apps/api/prisma/schema.prisma`.
- Nota de preservação: o worktree já tinha alterações locais nos 10 BKs MF7 e relatórios MF6/MF7 não versionados; esta reauditoria não reverteu nem normalizou alterações fora do scope.

## Nota da execução atual

Esta execução revalidou o relatório existente em `2026-06-27` com a prompt ativa (`MODO=auditar_apenas`, `BK_IDS=[]`, `RUN_COMMANDS=true`). Os 10 BKs MF7 foram lidos/auditados, mas não foram editados. A única alteração permitida e aplicada nesta execução foi a atualização deste relatório.

- Parser estrutural local dos BKs MF7: `PASS`; as 16 secções obrigatórias existem em ordem e todos os passos mantêm os pontos 1 a 7.
- Pesquisa de `real_dev`, `real-dev`, `cd real_dev` e `real_dev/` em `docs/planificacao/guias-bk/MF7/*.md`: `PASS`, sem resultados.
- Pesquisa direcionada de blocos antigos proibidos, `localStorage`, `sessionStorage`, `payload: unknown`, `as any`, helpers por criar e pseudo-código: `PASS`, sem resultados.
- Pesquisa agressiva de risco: `PASS_COM_RESSALVAS`; os matches observados são contextuais (`companyId` como contexto backend, `password`/`token` no fluxo de recuperação de password e negativos de segurança).
- `git diff --check`: `PASS`.
- `bash scripts/validate-planificacao.sh`: `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false`.

## Documentos e ficheiros consultados

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Todos os BKs em `docs/planificacao/guias-bk/MF7/`
- BKs de continuidade em `docs/planificacao/guias-bk/MF6/`
- `docs/planificacao/guias-bk/MF8/BK-MF8-01-logs-estruturados-info-warn-error-audit.md`
- Relatórios existentes `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-*.md`
- Inventário estrutural de `apps/api`, `apps/web`, `real_dev/api` e `real_dev/web`

## Resumo executivo

A `MF7` fica em `PASS_COM_RESSALVAS`: 10 BKs estão `OK`, 0 BKs ficam `PARCIAL` e nenhum BK está `CRITICO`.

A ressalva não é de completude dos BKs MF7. É ferramental/documental: `scripts/validate-planificacao.sh` mantém `overall_pass=true`, mas também mantém `advisory_pass=false` por checks globais antigos que ainda procuram blocos pedagógicos/operacionais, snippets e handoffs em várias macrofases. Na MF7, a estrutura ativa da prompt foi revalidada por checks direcionados e não há findings abertos.

Os dois findings que tinham motivado a correção anterior foram revalidados:

- `BK-MF7-05`: mantém JSDoc e comentários didáticos nos blocos frontend de `apiClient.ts` e no exemplo TSX de exportação.
- `BK-MF7-09`: já não contém blocos antigos proibidos; o conteúdo útil está integrado nas secções obrigatórias.

| Métrica | Resultado |
| --- | ---: |
| BKs analisados | 10 |
| BKs editados nesta execução | 0 |
| Relatórios editados nesta execução | 1 |
| Estado antes da reauditoria | 10 `OK` / 0 `PARCIAL` / 0 `CRITICO` |
| Estado depois da reauditoria | 10 `OK` / 0 `PARCIAL` / 0 `CRITICO` |
| Findings abertos | 0 |
| Findings críticos | 0 |
| Commits | 0 |

## Inventário e estado dos BKs alvo

| BK | RNF | Prioridade | Owner | Estado final | Justificação |
| --- | --- | --- | --- | --- | --- |
| `BK-MF7-01` | `RNF18` | `P1` | `Pedro` | `OK` | Guia completo para backups PostgreSQL com manifesto, verificação por `pg_restore --list`, negativos e handoff para retenção. |
| `BK-MF7-02` | `RNF19` | `P0` | `Andre` | `OK` | Guia autocontido para política de retenção, `RetentionHold`, gate destrutivo, auditoria sensível e testes unitários. |
| `BK-MF7-03` | `RNF20` | `P0` | `Pedro` | `OK` | Guia cria gate cross-browser, evidence manual e negativos para Chrome, Edge e Firefox sem branches por browser. |
| `BK-MF7-04` | `RNF21` | `P0` | `Sofia` | `OK` | Guia integra email transaccional para recuperação de password e alertas, mantendo tokens fora de logs/evidence. |
| `BK-MF7-05` | `RNF22` | `P1` | `Sofia` | `OK` | Guia cobre CSV/XLSX/PDF, guards backend, neutralização de fórmulas, cliente API frontend e evidence. |
| `BK-MF7-06` | `RNF23` | `P0` | `Oleksii` | `OK` | Guia cobre importação CSV/Excel, validação por linha, transação, `AuditLog`, `IntegrationLog` e negativos. |
| `BK-MF7-07` | `RNF24` | `P0` | `Andre` | `OK` | Guia evita prometer SAF-T completo/certificado, cria readiness check, preserva multiempresa e logs de integração. |
| `BK-MF7-08` | `RNF25` | `P0` | `Oleksii` | `OK` | Guia cria gate de modularidade backend por domínio e negativos contra módulos em falta ou imports indevidos no servidor. |
| `BK-MF7-09` | `RNF26` | `P0` | `Andre` | `OK` | Guia valida modularidade frontend, UI partilhada, cliente API central e sessão por `credentials: "include"`. |
| `BK-MF7-10` | `RNF27` | `P1` | `Oleksii` | `OK` | Guia valida módulos críticos de faturação, IVA, balancetes e reconciliação, incluindo negativos multiempresa/logs. |

## Fundamentação canónica

- `CANONICO`: `RNF18` a `RNF27` definem a MF7: backups, retenção, compatibilidade browser, email, exportações, importações, SAF-T, modularidade backend, modularidade frontend e testes automatizados.
- `CANONICO`: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md` confirmam os 10 BKs oficiais da MF7, owners, prioridades, sprints `S11-S12`, requisitos e próximo BK.
- `CANONICO`: `MF6` entrega performance, segurança, sessão, hardening, secrets e auditoria obrigatória que a MF7 consome.
- `CANONICO`: `BK-MF8-01` sucede `BK-MF7-10` e recebe a baseline de testes/logs para iniciar logs estruturados.
- `DERIVADO`: os scripts `mf7:*`, `check:mf7:*` e `test:mf7:*` são decisões técnicas mínimas para transformar RNFs em gates locais reproduzíveis.
- `DERIVADO`: a consulta a `real_dev/` serviu apenas para confirmar convenções e baseline até MF6; os caminhos publicados nos BKs continuam sob `apps/...`.

## Findings revalidados

### MF7-BK05-AUD-20260627-F01 - Snippets frontend sem JSDoc/comentários didáticos suficientes

- BK/RF/RNF afetado: `BK-MF7-05` / `RNF22`
- Severidade: `P2`
- Estado nesta reauditoria: `JA_CORRIGIDO`
- Evidência objetiva: `BK-MF7-05` mantém `AccountingReportExportKind`, `AccountingReportExportFormat`, `AccountingReportExportUrlInput` e `exportUrl` documentados; o exemplo TSX continua a explicar que o browser faz download por cookie HttpOnly e que a UI não envia `companyId` nem token.
- Expected: blocos TS/TSX frontend relevantes com JSDoc e comentários didáticos.
- Observed: contrato satisfeito no guia atual.
- Impacto restante: nenhum finding aberto.

### MF7-BK09-AUD-20260627-F02 - Blocos antigos proibidos pela estrutura atual

- BK/RF/RNF afetado: `BK-MF7-09` / `RNF26`
- Severidade: `P2`
- Estado nesta reauditoria: `JA_CORRIGIDO`
- Evidência objetiva: `rg -n "Bloco pedagogico|Bloco pedagógico|Bloco operacional|Snippet tecnico aplicavel|Snippet técnico aplicável" docs/planificacao/guias-bk/MF7/*.md` não devolveu resultados.
- Expected: BK sem blocos pedagógicos/operacionais genéricos nem snippet técnico separado.
- Observed: contrato satisfeito no guia atual.
- Impacto restante: nenhum finding aberto.

## Mapa de integração da MF

| BK | Artefactos que o guia manda criar/editar | Contrato entregue | Handoff |
| --- | --- | --- | --- |
| `BK-MF7-01` | `apps/api/scripts/run-daily-backup.mjs`, `apps/api/scripts/verify-backup-restore.mjs`, `apps/api/package.json` | Backup PostgreSQL verificável, manifesto sem credenciais, prova `pg_restore --list` | Retenção documental em `BK-MF7-02` |
| `BK-MF7-02` | `apps/api/prisma/schema.prisma`, `retentionPolicy.js`, `retentionDeletionGate.js`, testes unitários, `package.json` | Gate de retenção 10 anos com auditoria sensível `entity/entityId/details` | Compatibilidade e operação controlada em `BK-MF7-03` |
| `BK-MF7-03` | `apps/web/scripts/check-mf7-browser-compatibility.mjs`, `apps/web/package.json`, evidence browser | Gate cross-browser e smoke manual Chrome/Edge/Firefox | Email transaccional em `BK-MF7-04` |
| `BK-MF7-04` | Adapter transaccional de email, adapter de password reset, notificações/alertas, testes de contrato | Envio por email sem expor token/password em logs | Exportações em `BK-MF7-05` |
| `BK-MF7-05` | Exporters contabilísticos, routes export, cliente API frontend, testes | CSV/XLSX/PDF para relatórios autorizados | Importações em `BK-MF7-06` |
| `BK-MF7-06` | Parser CSV/Excel, validators, service de importação, route, testes, evidence | Importações com validação por linha, transação, `AuditLog` e `IntegrationLog` | SAF-T em `BK-MF7-07` |
| `BK-MF7-07` | Readiness SAF-T, service/route, teste contratual, script MF7, evidence | Exportação SAF-T com checklist de readiness, sem prometer certificação completa | Modularidade backend em `BK-MF7-08` |
| `BK-MF7-08` | `apps/api/scripts/check-mf7-backend-modules.mjs`, `apps/api/package.json` | Gate de modularidade backend por domínio e boundaries de `server.js` | Modularidade frontend em `BK-MF7-09` |
| `BK-MF7-09` | `apps/web/scripts/check-mf7-frontend-modules.mjs`, `apps/web/package.json`, evidence | Gate de modularidade frontend, UI partilhada, cliente API central e `credentials: "include"` | Testes críticos em `BK-MF7-10` |
| `BK-MF7-10` | `apps/api/tests/contracts/mf7-critical-modules.test.js`, `apps/api/package.json` | Testes de contrato para faturação, IVA, balancetes e reconciliação | Logs estruturados em `BK-MF8-01` |

Confirmações globais:

- Não foram encontrados caminhos `real_dev`, `real-dev`, `cd real_dev` ou `real_dev/` nos BKs MF7.
- Não foram encontrados blocos antigos proibidos nos BKs MF7.
- Não foram encontrados `localStorage`, `sessionStorage`, `payload: unknown` ou `as any` nos BKs MF7.
- As ocorrências de `companyId` aparecem como contexto backend/multiempresa, não como ownership decidido pelo frontend.
- As ocorrências de `req.body.companyId` e `req.query.companyId` em `BK-MF7-10` pertencem a um teste negativo que rejeita essas fontes como empresa ativa.
- As ocorrências de `password`/`token` pertencem ao fluxo de recuperação de password e a negativos de segurança; não foram observadas credenciais reais.
- O frontend continua descrito como consumidor de API; autorização, empresa ativa, permissões e auditoria ficam no backend.

## Resultados de validação

- Inventário estrutural por script local Node: `PASS`; os 10 BKs têm as 16 secções obrigatórias, em ordem, e todos os passos auditados mantêm os pontos 1 a 7.
- Contagem estrutural: `BK-MF7-01` tem 7 passos; `BK-MF7-02`, `03`, `04`, `07` e `08` têm 8 passos; `BK-MF7-05`, `06`, `09` e `10` têm 7 passos.
- Pesquisa de `real_dev`, `real-dev`, `cd real_dev` e `real_dev/` em `docs/planificacao/guias-bk/MF7/*.md`: `PASS`, sem resultados.
- Pesquisa de blocos antigos proibidos em `docs/planificacao/guias-bk/MF7/*.md`: `PASS`, sem resultados.
- Pesquisa textual agressiva de riscos nos BKs MF7: `PASS_COM_RESSALVAS`; os matches restantes são contextuais (`companyId`, `password`, `token`, `unknown`, `localhost` e comandos de evidence).
- Pesquisa direcionada de termos proibidos fortes, excluindo matches contextuais esperados: `PASS`, sem resultados.
- Pesquisa direcionada de `localStorage`, `sessionStorage`, `payload: unknown` e `as any`: `PASS`, sem resultados.
- Análise mecânica de comentários em blocos de código: `PASS_COM_RESSALVAS`; os falsos positivos restantes são blocos `json`/`bash` de `package.json`, comandos ou expected results, onde comentários internos quebrariam o formato ou não são código de aplicação.
- `git diff --check`: `PASS`, sem output.
- `bash scripts/validate-planificacao.sh`: `PASS_COM_RESSALVAS`; `overall_pass=true`, `advisory_pass=false`.
- Nota sobre o validador: o script ainda lista checks legacy como `missing_pedagogic_or_operational_blocks`, `missing_or_placeholder_snippet` e `missing_handoff_proximo_bk_line` em vários BKs de várias macrofases. No contexto da prompt ativa, estes avisos não são automaticamente defeitos da MF7.

## Coerência MF anterior -> MF alvo -> MF seguinte

- `MF6 -> MF7`: `OK`. A MF7 consome segurança, sessão, hardening, secrets, auditoria sensível, performance e contexto multiempresa entregues pela MF6.
- `MF7` interna: `OK`. A sequência dos 10 BKs é coerente: backups -> retenção -> compatibilidade -> email -> exportações -> importações -> SAF-T -> modularidade backend -> modularidade frontend -> testes críticos.
- `BK-MF7-09 -> BK-MF7-10`: `OK`. O gate frontend prepara a disciplina modular que o BK10 valida junto dos módulos críticos.
- `MF7 -> MF8`: `OK_COM_RESSALVAS`. `BK-MF7-10` prepara logs estruturados para `BK-MF8-01`, mas a reauditoria não altera MF8 e não existe relatório `AUDITORIA-HIDRATACAO-MF8.md` neste checkout.

## Drift documental e ferramental

- `scripts/validate-planificacao.sh` ainda reflete critérios editoriais legados que não coincidem totalmente com a estrutura da prompt ativa.
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF6.md` ainda contém histórico antigo que descreve a MF7 como estando em formato anterior. Esse histórico ficou desatualizado depois das correções MF7, mas está fora do scope desta reauditoria.
- Alguns documentos de planificação são sinalizados pelo validador como `outdated_docs`, mas a cobertura, consistência, naming e `overall_pass` continuam verdes.
- `TARGET_MF_IMPLEMENTATION_STATUS=not_assumed` foi respeitado: a existência de ficheiros em `apps/` ou `real_dev/` não foi usada para assumir MF7 implementada.
- A documentação canónica lista várias dependências MF7 como `-`; alguns guias referem dependências técnicas derivadas para continuidade, sem alterar a matriz.

## Ficheiros alterados nesta execução

- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF7.md`

## Ficheiros não alterados por scope

- `docs/planificacao/guias-bk/MF7/*.md`
- `apps/`
- `real_dev/`
- RF/RNF, matriz, backlog, sprints e restantes documentos canónicos.
- Script do validador local.

## Estado final

A reauditoria da `MF7` fica concluída em modo `auditar_apenas`. A macrofase fica em `10 OK / 0 PARCIAL / 0 CRITICO`, sem findings abertos, sem edição dos BKs e sem commits.
