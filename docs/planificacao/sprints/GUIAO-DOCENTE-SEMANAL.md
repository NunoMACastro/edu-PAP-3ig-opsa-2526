# GUIAO-DOCENTE-SEMANAL

## Header
- `doc_id`: `GUIAO-DOCENTE-SEMANAL`
- `path`: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-17`

## Objetivo
Fornecer guiao pratico de intervencao docente por sprint, com foco em carga realista, risco e qualidade de entrega.

## Ritual semanal obrigatorio
1. Segunda-feira (planeamento): validar BK da semana, carga por aluno e riscos iniciais.
2. Quarta-feira (checkpoint): medir progresso real, desbloquear dependencias e ajustar apoio.
3. Sexta-feira (fecho/retro): validar evidence, consolidar scorecard e registar decisoes.

## Matriz de intervencao por carga
| Estado de carga da sprint | Sinal | Intervencao docente |
| --- | --- | --- |
| Dentro da meta (`desvio_u <= 2`) | Entrega estavel | Manter ritmo e foco em qualidade dos negativos e evidencia. |
| Pressao moderada (`desvio_u = 3..4`) | Acumulo de tarefas ou bloqueios | Reduzir paralelismo, reforcar `Core` e adiar `Reforco` nao critico. |
| Sobrecarga (`desvio_u >= 5`) | Risco de quebra de rastreabilidade | Congelar `Reforco`, priorizar BK `P0`, abrir decisao do orientador. |

## Checkpoints de risco por perfil
| Perfil | Sinais de risco | Intervencao docente |
| --- | --- | --- |
| Aluno forte | Excesso de apoio a varios BK em paralelo | Limitar WIP e manter 1-2 BK ativos com handoff claro. |
| Aluno intermadio | Entrega parcial sem negativos/evidence | Aplicar checklist guiada do bloco operacional e validar o primeiro negativo em conjunto. |
| Aluno em risco | Bloqueios >48h e baixa compreensao | Dividir BK em micro-passos, pairing orientado e objetivo minimo da sprint. |

## Gate pedagogico entre sprints
- Em sprints com `carga_real_u` vazia, marcar `risco_semaforo = N/A` no scorecard.
- Sem `Core` concluido na sprint `N`, o aluno nao inicia `Reforco` na sprint `N+1`.
- Excecoes apenas com justificacao no scorecard e aprovacao do orientador.

## Evidencias minimas por semana
- 1 `proof` funcional por BK ativo.
- 1 `neg` validado por BK ativo.
- 1 registo de risco/acao corretiva por sprint no scorecard.

## Script de revisao rapida (15 min)
1. Confirmar `carga_real_u` vs `carga_planeada_u` no scorecard.
2. Auditar 1 BK P0 e 1 BK P1/P2 com foco em `Bloco pedagogico` + `Bloco operacional`.
3. Verificar se snippet tecnico do BK auditado e concreto e aplicavel.
4. Registar decisao docente e proxima acao.

## Changelog
- `2026-04-13`: guiao alinhado ao rebalanceamento de carga e ao novo contrato dos guias BK.
