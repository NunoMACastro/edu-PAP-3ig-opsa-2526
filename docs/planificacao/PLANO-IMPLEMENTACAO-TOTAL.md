# PLANO-IMPLEMENTACAO-TOTAL

## Header
- `doc_id`: `PLANO-IMPLEMENTACAO-TOTAL`
- `path`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-07-10`

## Objetivo
Definir o plano macro executável da OPSA com rastreabilidade RF/RNF → BK → guia, distinguindo o trabalho pedagógico dos alunos da implementação privada de referência.

## Fontes de verdade e estados

- Progresso dos alunos: RF/RNF → matriz → backlog → sprints → guias.
- Estado da referência: relatório canónico → evidence corrente → arquitetura → runbook.
- `TODO`, `IN_PROGRESS`, `BLOCKED` e `DONE` representam `estado_alunos`; não são recalculados a partir de `real_dev`.
- A implementação de referência usa os estados do relatório canónico e o gate académico `NO_GO`/`PRONTO_ACADEMICO_COM_RISCO_ACEITE`.
- Em drift técnico, aplicam-se [`CONTRATO-STACK-IMPLEMENTACAO.md`](CONTRATO-STACK-IMPLEMENTACAO.md) e [`CONTRATO-INTERFACES-IMPLEMENTACAO.md`](CONTRATO-INTERFACES-IMPLEMENTACAO.md), mantendo caminhos públicos `apps/...` nos guias.

## Assuncoes
- IDs RF/RNF/BK sao imutaveis após esta vaga de normalizacao.
- Escopo funcional aprovado desta vaga mantem-se sem reintroduzir itens removidos.
- Fecho documental exige score consolidado `>=97/100`.
- Sincronização documental não fecha findings funcionais nem transforma blockers runtime em PASS.

## Tabela MF0..MF8
| Macro | Janela | Total BK | Owner stream P0 |
| --- | --- | --- | --- |
| MF0 | Janela canónica S01-S12 | 12 | Oleksii |
| MF1 | Janela canónica S01-S12 | 10 | Oleksii |
| MF2 | Janela canónica S01-S12 | 8 | Andre |
| MF3 | Janela canónica S01-S12 | 8 | Oleksii |
| MF4 | Janela canónica S01-S12 | 10 | Pedro |
| MF5 | Janela canónica S01-S12 | 7 | Oleksii |
| MF6 | Janela canónica S01-S12 | 10 | Oleksii |
| MF7 | Janela canónica S01-S12 | 10 | Andre |
| MF8 | Janela canónica S01-S12 | 18 | Oleksii |

## Fases
1. Fase 1 (`S01-S04`): fundacoes + consolidacao do nucleo inicial.
2. Fase 2 (`S05-S08`): capacidades de produto + coerencia cross-artefactos.
3. Fase 3 (`S09-S12`): qualidade final, evidencias e defesa.

## Correção documental da referência

A sincronização de 2026-07-10 é uma via de manutenção transversal, não uma sprint nem um novo BK. Preserva exatamente 51 RF, 39 RNF, 93 BK e 93 guias e executa:

1. reconciliação dos contratos centrais com `real_dev`;
2. atualização dos 93 guias sem expor caminhos privados;
3. separação entre evidence corrente e snapshots históricos superseded;
4. gate anti-drift com `documentation_sync_pass` separado de `overall_pass`;
5. registo append-only no relatório canónico, sem alterar resultados runtime não reexecutados.

## Regras transversais por macro
1. Owner unico por BK com apoio explicito.
2. BK fecha apenas com `Smoke`, `Negativos`, `Tecnico` e `Evidence` completos.
3. BK `P0` em modo `Reforco`; BK `P1/P2` em modo `Core`.
4. Qualquer drift entre matriz/backlog/guias/sprints bloqueia fecho da sprint.

## Gates S4/S8/S12
- Fonte oficial: `docs/planificacao/sprints/GATES-S4-S8-S12.md`.
- Operacao de release: `docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md`.
- `S4`: cobertura inicial + consistencia estrutural.
- `S8`: coerencia documental + score parcial `>=97/100`.
- `S12` pedagógico: fecho integral com validação documental e evidence dos alunos.
- `S12` da referência: permanece `NO_GO` até o relatório canónico fechar blockers runtime, mesmo que a documentação esteja sincronizada.

## Critérios de saída

### Via pedagógica

- Score consolidado no scorecard `>=97/100`.
- Evidence de gate publicada para `S4`, `S8` e `S12`.
- Estado dos BK decidido na matriz/backlog pelos responsáveis, nunca inferido da referência.

### Via da implementação de referência

- `bash scripts/validate-planificacao.sh` com `documentation_sync_pass: true`.
- `overall_pass: true` apenas quando não existirem blockers runtime legítimos.
- Evidence operacional de release/rollback, integração, browser, backup/restore e SAF-T sem skips nem resultados presumidos.
- Decisão final emitida exclusivamente no relatório canónico.

## Changelog
- `2026-07-10`: integrada a correção de drift documental; separados estados dos alunos, gate documental e readiness da referência.
- `2026-06-30`: MF8 recalculada para 18 BKs e baseline global atualizada para 93 BK.
- `2026-06-29`: MF8 recalculada para 12 BKs e baseline global atualizada para 87 BK.
- `2026-04-19`: plano macro recalculado para baseline reduzido (84 BK).
