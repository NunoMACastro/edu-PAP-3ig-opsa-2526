# OPERACAO-DEPLOY-ROLLBACK

## Header
- `doc_id`: `OPERACAO-DEPLOY-ROLLBACK`
- `path`: `docs/planificacao/sprints/OPERACAO-DEPLOY-ROLLBACK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-19`

## Objetivo
Definir procedimento operacional minimo de deploy e rollback para a fase final da PAP, com evidencias auditaveis no gate `S12`.

## Estrategia de deploy
1. Deploy incremental por ambiente (`dev` -> `staging` -> `producao`).
2. Janela de deploy previamente definida na sprint com owner responsavel.
3. Release bloqueada se o validador documental nao estiver em `overall_pass: true`.
4. Deploy acompanhado por checklist tecnico e checklist funcional.

## Pre-checks obrigatorios
- `bash scripts/validate-planificacao.sh` em `PASS`.
- Smoke funcional dos fluxos criticos (`RF14`, `RF19`, `RF33`, `RF36`, `RF39`).
- Verificacao de saude tecnica minima:
  - endpoint de `health-check` ativo;
  - logs estruturados ativos;
  - variaveis de ambiente criticas validadas.
- Verificacao de risco aberto: sem bloqueio `P0` por resolver.

## Gatilhos de rollback
- Erro bloqueante em fluxo critico apos deploy.
- Quebra de integridade contabilistica detetada em smoke.
- Regressao grave de performance em operacoes criticas.
- Falha persistente de `health-check` apos tentativa de estabilizacao.

## Procedimento de rollback (passo a passo)
1. Declarar incidente e congelar novas alteracoes.
2. Identificar versao estavel anterior (`release_tag` ou `commit` validado).
3. Reverter aplicacao para versao estavel anterior.
4. Reexecutar smoke tecnico e funcional minimo.
5. Confirmar restabelecimento de logs, health-check e fluxos criticos.
6. Registar causa, impacto e acao corretiva no scorecard da sprint.

## Evidencias obrigatorias para defesa (gate S12)
- Registo de deploy com data/hora, owner e versao publicada.
- Resultado dos pre-checks (comandos e outputs relevantes).
- Resultado do smoke pos-deploy.
- Se houver rollback: registo de gatilho, versao revertida e validacao pos-rollback.
- Ligacao cruzada com `GATES-S4-S8-S12.md` e `SCORECARD-SPRINTS.md`.

## Changelog
- `2026-04-19`: artefacto operacional criado para cobertura explicita de deploy/rollback no S12.
