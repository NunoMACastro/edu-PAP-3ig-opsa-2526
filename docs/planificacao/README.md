# PLANIFICACAO-OPSA

## Header

- `doc_id`: `PLANIFICACAO-OPSA`
- `path`: `docs/planificacao/README.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-10`

## Objetivo

Centralizar a planificação executável da OPSA sem misturar o progresso pedagógico dos alunos com o estado técnico da implementação privada de referência.

## Duas vias de verdade

### Verdade funcional e pedagógica

`RF/RNF` → `MATRIZ-CANONICA-BK` → `BACKLOG-MVP` → `PLANO-SPRINTS` → `SCORECARD-SPRINTS`/`GUIAO-DOCENTE-SEMANAL`/`GATES-S4-S8-S12` → `guias-bk/*`.

- A matriz e o backlog são a fonte do progresso dos alunos.
- O campo de progresso é interpretado como `estado_alunos`, mesmo quando um artefacto legado ainda usa o cabeçalho curto `estado`.
- Os valores pedagógicos `TODO`, `IN_PROGRESS`, `BLOCKED` e `DONE` nunca são inferidos a partir de `real_dev`.
- Os 93 guias continuam a ensinar caminhos públicos em `apps/api` e `apps/web`; `real_dev` é apenas referência privada de paridade.

### Verdade da implementação de referência

[`CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md`](auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md) → `auditorias/evidence/current/*` → [`ARQUITETURA-TECNICA-MINIMA.md`](../evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md) → [`OPERACAO-DEPLOY-ROLLBACK.md`](sprints/OPERACAO-DEPLOY-ROLLBACK.md).

- Em qualquer conflito sobre comportamento, testes, blockers ou readiness de `real_dev`, prevalece o relatório canónico de 2026-07-09.
- Evidence corrente prova uma execução concreta; não substitui a decisão finding a finding do relatório.
- Relatórios com `SNAPSHOT_HISTORICO_SUPERSEDED` preservam história e não podem ser usados como estado atual.
- A sincronização documental não fecha findings funcionais nem converte um blocker ambiental em risco aceite.

## Contratos técnicos centrais

- [`CONTRATO-STACK-IMPLEMENTACAO.md`](CONTRATO-STACK-IMPLEMENTACAO.md): toolchain, componentes e limites da stack.
- [`CONTRATO-INTERFACES-IMPLEMENTACAO.md`](CONTRATO-INTERFACES-IMPLEMENTACAO.md): APIs, modelos, migrations, configuração, workers, paginação e contratos removidos.
- [`../ARQUITETURA-IA-OPSA-V2.md`](../ARQUITETURA-IA-OPSA-V2.md): arquitetura canónica, privacidade, APIs, UI e operação da IA reestruturada.
- [`guias-bk/SINCRONIZACAO-IA-V2.md`](guias-bk/SINCRONIZACAO-IA-V2.md): delta da implementação de referência para os BKs MF3, MF4 e MF8 afetados.

Estes contratos evitam que cada guia reinvente interfaces. Quando um guia e o contrato central divergirem, corrige-se o guia sem alterar os respetivos RF/RNF, `bk_id`, owner ou estado pedagógico.

Para o domínio de IA, a sincronização de 2026-07-11 é posterior ao relatório geral de 2026-07-09 e prevalece apenas nesse âmbito. Não altera os restantes findings, blockers ou estados pedagógicos do relatório canónico.

## Contrato canónico comum

- Scorecard fixo: `25/20/25/20/10`.
- Sprint IDs obrigatórios: `S01..S12`.
- Gates aceitam os aliases `S4/S8/S12`, equivalentes a `S04/S08/S12`.
- Meta documental pedagógica oficial: `>=97/100`.
- Com `carga_real_u = -`, são obrigatórios `desvio_u = -` e `risco_semaforo = N/A`.
- Política pedagógica BK: `P0 >= 8 passos e >=3 negativos`; `P1/P2 >= 6 passos e >=2/1 negativos`.
- Cada snippet técnico deve estar ligado a `bk_id` e `rf_rnf`.

## Estrutura obrigatória

1. `PLANO-IMPLEMENTACAO-TOTAL.md`
2. `DISTRIBUICAO-RESPONSABILIDADES.md`
3. `CONTRATO-STACK-IMPLEMENTACAO.md`
4. `CONTRATO-INTERFACES-IMPLEMENTACAO.md`
5. `backlogs/BACKLOG-MVP.md`
6. `backlogs/MATRIZ-CANONICA-BK.md`
7. `sprints/PLANO-SPRINTS.md`
8. `sprints/SCORECARD-SPRINTS.md`
9. `sprints/GUIAO-DOCENTE-SEMANAL.md`
10. `sprints/GATES-S4-S8-S12.md`
11. `sprints/OPERACAO-DEPLOY-ROLLBACK.md`
12. `guias-bk/README.md` e os 93 guias
13. relatório canónico e evidence corrente em `docs/evidence/MF8/`

## Regra de atualização em cadeia

### Alteração funcional ou pedagógica

1. Atualizar RF/RNF, quando autorizado.
2. Atualizar matriz e backlog, preservando `estado_alunos` real.
3. Atualizar sprints e guias impactados.
4. Validar contagens, rastreabilidade e qualidade pedagógica.

### Alteração da implementação de referência

1. Atualizar o relatório canónico na mesma unidade lógica da alteração.
2. Atualizar evidence corrente, arquitetura e runbook.
3. Atualizar contratos centrais e os guias afetados, mantendo caminhos `apps/...`.
4. Executar o gate documental e registar blockers runtime sem os mascarar.

## Resumo de cobertura

- Total RF: **51**
- Total RNF: **39**
- Total BK: **93**
- Total guias BK: **93**
- Cobertura BK ↔ guia: **100% (1:1)**

## Validação e estado atual

- Comando oficial: `bash scripts/validate-planificacao.sh`.
- `documentation_sync_pass` mede a sincronização da documentação com os contratos atuais.
- `overall_pass` inclui blockers runtime e pode continuar `false` quando `documentation_sync_pass=true`.
- O gate da referência em S12 está `NO_GO` enquanto persistirem os blockers registados no relatório canónico; este estado não altera o progresso dos alunos.

## Changelog

- `2026-07-10`: separadas as duas vias de verdade; adicionados precedência, contrato central de interfaces e gate documental independente do estado runtime.
- `2026-06-30`: MF8 expandida para 18 BK com subscrições simuladas; totais atualizados para 51 RF, 39 RNF e 93 BK.
- `2026-06-29`: MF8 reforçada com UI alinhada ao mockup, testes finais e correção de erros; totais atualizados para 39 RNF e 87 BK.
- `2026-05-25`: adicionado contrato de stack de implementação para centralizar assunções técnicas dos guias BK.
- `2026-04-18`: README de planificação normalizado para contrato canónico v2 cross-PAP.
