# GATES-S4-S8-S12

## Header
- `doc_id`: `GATES-S4-S8-S12`
- `path`: `docs/planificacao/sprints/GATES-S4-S8-S12.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-10`

## Objetivo
Estabelecer a baseline oficial dos gates S4, S8 e S12 sem confundir o progresso dos alunos com a readiness da implementação privada de referência.

## Gates pedagógicos dos alunos

| gate | data_planeada | escopo_macro | criterios_minimos | estado_alunos |
| --- | --- | --- | --- | --- |
| S4 | 2026-05-10 | MF0-MF1 | Cobertura RF sem orfaos + 100% guias com header canonico | PENDING |
| S8 | 2026-06-07 | MF0-MF4 | Coerencia matriz/backlog/guias + score >= 97/100 | PENDING |
| S12 | 2026-07-05 | MF0-MF8 | Auditoria automatica PASS + pacote final de defesa | PENDING |

Estes estados são pedagógicos. Só matriz/backlog/scorecard os podem alterar; `real_dev` não fecha BK dos alunos.

## Gate da implementação de referência

| gate | fonte | documentação | estado_referencia | condição para mudar |
| --- | --- | --- | --- | --- |
| S12 | Relatório canónico de 2026-07-09 | `documentation_sync_pass` é calculado separadamente | `NO_GO` | Todos os findings funcionais fechados, zero blockers em fluxos críticos, restore remoto provado e SAF-T validado externamente. |

O estado atual inclui integração persistida incompleta (`2/7`), browser Playwright sem iniciar (`0 iniciado`) e restantes blockers/finding states registados no relatório. Estes valores são blockers, não PASS nem progresso dos alunos. A fonte atual é [`CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md`](../auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md); em qualquer divergência prevalece esse relatório.

`documentation_sync_pass=true` apenas confirma que docs, contratos, guias, arquitetura, evidence e histórico estão sincronizados. `overall_pass` continua `false` enquanto o gate da referência estiver `NO_GO` por blockers runtime.

## Evidencias obrigatorias por gate
- JSON do validador canonico (`scripts/validate-planificacao.sh`).
- Snapshot do scorecard da sprint de gate.
- Lista de desvios e acoes corretivas (quando existir).
- No gate `S12`: evidencia operacional de `deploy` e `rollback` conforme `OPERACAO-DEPLOY-ROLLBACK.md`.
- Para a referência: relatório canónico, `docs/evidence/MF8/`, integração PostgreSQL/Redis/SMTP/S3, browser E2E, backup roundtrip e validação externa SAF-T, todos sem skips.

## Changelog
- `2026-07-10`: separados gates pedagógicos e gate da referência; S12 da referência registado como `NO_GO` sem alterar os estados dos alunos.
- `2026-04-18`: gates unificados no contrato canónico v2 cross-PAP.
