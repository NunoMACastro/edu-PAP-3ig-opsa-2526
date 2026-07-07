# Testes em falta MF8

<<<<<<< HEAD
## Identificação

- BK: BK-MF8-16
- Requisito: RNF37
- Owner: Oleksii
- Apoio: Andre
- Data:
- Branch/PR:

## Comandos executados

| Comando | Resultado esperado | Resultado observado | Decisão |
| --- | --- | --- | --- |
| `cd apps/api && npm run test:mf8:inventory` | Matriz de cobertura com OK ou LACUNA por fluxo |  |  |
| `cd apps/api && npm run test:mf8:inventory-contracts` | Teste positivo e negativo do inventário passam |  |  |
| `cd apps/api && npm run test:final:prepare` | Bateria API preparada para BK-MF8-17 |  |  |
| `cd apps/web && npm run test:final:prepare` | Bateria web preparada para BK-MF8-17 |  |  |

## Matriz mínima de testes por prioridade

| Fluxo crítico | Prioridade | Camadas mínimas | Estado | Ação |
| --- | --- | --- | --- | --- |
| MF0 identidade, sessão, roles e multiempresa | P0 | unitário API, contrato API |  |  |
| MF1 vendas, compras, IVA, recebimentos e pagamentos | P0 | unitário API, contrato API, integração API |  |  |
| MF2 inventário, FIFO, contabilidade e reporting | P0 | unitário API, contrato API, integração API |  |  |
| MF3 bancos, reconciliação, exportação prevista e relatórios | P0 | unitário API, contrato API, integração API |  |  |
| MF4 IA explicável, recomendações e auditoria | P1 | unitário API, contrato API |  |  |
| MF5 interface, formulários, acessibilidade e desempenho | P1 | gate frontend, typecheck |  |  |
| MF6 segurança, performance e hardening | P0 | contrato API, gate API |  |  |
| MF7 compatibilidade, exportações, importações e modularidade | P1 | contrato API, gate API, gate frontend |  |  |
| MF8 subscrições simuladas, localização PT-PT e fecho | P1 | contrato API, gate API, gate frontend, typecheck, build |  |  |

## Evidência de testes por camada

| Camada | Ficheiros ou scripts encontrados | Lacunas | Decisão |
| --- | --- | --- | --- |
| API unitária |  |  |  |
| API contratos |  |  |  |
| API integração |  |  |  |
| API scripts |  |  |  |
| Web scripts |  |  |  |
| Web typecheck/build |  |  |  |

## Cenários negativos

| Cenário | Resultado esperado | Resultado observado | Decisão |
| --- | --- | --- | --- |
| Falta de prova MF8 no inventário | O script mostra LACUNA e exit code 1 |  |  |
| Falta de script `test:mf8` em API ou web | O teste de contrato acusa script em falta |  |  |

## Handoff para BK-MF8-17

- Comando API recomendado: `cd apps/api && npm run test:final:prepare`
- Comando web recomendado: `cd apps/web && npm run test:final:prepare`
- Lacunas que devem bloquear execução final:
- Lacunas aceites com justificação:
- Decisão final para avançar:
=======
## Identificacao

- BK: `BK-MF8-16`
- Requisito: `RNF37`
- Owner: `Oleksii`
- Apoio: `Andre`
- Data: `2026-07-07`
- Branch/PR: local, sem commit nesta execucao
- Implementation root validado: `real_dev`
- Guia canonico: `docs/planificacao/guias-bk/MF8/BK-MF8-16-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`

## Comandos executados

| Comando publico do guia | Comando real executado nesta checkout | Resultado esperado | Resultado observado | Decisao |
| --- | --- | --- | --- | --- |
| `cd apps/api && npm run test:mf8:inventory` | `npm --prefix real_dev/api run test:mf8:inventory` | Matriz de cobertura com `OK` ou `LACUNA` por fluxo | `PASS`; matriz `MF0..MF8` toda `OK`, sem lacunas criticas. | Fechado para inventario. |
| `cd apps/api && npm run test:mf8:inventory-contracts` | `npm --prefix real_dev/api run test:mf8:inventory-contracts` | Teste positivo e negativo do inventario passam | `PASS`; 2 testes, 2 pass, 0 fail. | Fechado para contrato do inventario. |
| `cd apps/api && npm run test:final:prepare` | `env OPSA_SKIP_PERSISTENCE_TESTS=true npm --prefix real_dev/api run test:final:prepare` | Bateria API preparada para `BK-MF8-17` | `PASS_COM_RISCOS`; unit, contracts, MF6, MF7 e MF8 passaram; integracao MF2/MF3 ficou com 2 skips explicitos por falta de `TEST_DATABASE_URL`. | Aceite com ressalva ambiental; repetir sem skip em `BK-MF8-17` quando existir base PostgreSQL efemera. |
| `cd apps/web && npm run test:final:prepare` | `npm --prefix real_dev/web run test:final:prepare` | Bateria web preparada para `BK-MF8-17` | `PASS`; MF1, MF2, MF3, MF5, MF7, MF8, typecheck e build passaram. | Fechado para frontend. |
| N/A | `npm --prefix real_dev/api run test:integration` | Integracao persistida deve correr quando houver `TEST_DATABASE_URL` | `FAIL_ESPERADO_AMBIENTE`; MF1 passou, MF2/MF3 recusaram correr sem `TEST_DATABASE_URL`. | Lacuna ambiental conhecida para o handoff. |

## Matriz minima de testes por prioridade

| Fluxo critico | Prioridade | Camadas minimas | Estado | Acao |
| --- | --- | --- | --- | --- |
| MF0 identidade, sessao, roles e multiempresa | P0 | unitario API, contrato API | `OK` | Sem acao. |
| MF1 vendas, compras, IVA, recebimentos e pagamentos | P0 | unitario API, contrato API, integracao API | `OK` | Sem acao. |
| MF2 inventario, FIFO, contabilidade e reporting | P0 | unitario API, contrato API, integracao API | `OK_COM_RESSALVA` | Inventario reconhece a camada; execucao persistida real exige `TEST_DATABASE_URL`. |
| MF3 bancos, reconciliacao, exportacao prevista e relatorios | P0 | unitario API, contrato API, integracao API | `OK_COM_RESSALVA` | Inventario reconhece a camada; execucao persistida real exige `TEST_DATABASE_URL`. |
| MF4 IA explicavel, recomendacoes e auditoria | P1 | unitario API, contrato API | `OK` | Sem acao. |
| MF5 interface, formularios, acessibilidade e desempenho | P1 | gate frontend, typecheck | `OK` | Sem acao. |
| MF6 seguranca, performance e hardening | P0 | contrato API, gate API | `OK` | Sem acao. |
| MF7 compatibilidade, exportacoes, importacoes e modularidade | P1 | contrato API, gate API, gate frontend | `OK` | Sem acao. |
| MF8 subscricoes simuladas, localizacao PT-PT e fecho | P1 | contrato API, gate API, gate frontend, typecheck, build | `OK` | Sem acao. |

## Evidencia de testes por camada

| Camada | Ficheiros ou scripts encontrados | Lacunas | Decisao |
| --- | --- | --- | --- |
| API unitaria | Inventario encontrou 8 provas unitarias. | Nenhuma lacuna critica encontrada. | Fechado. |
| API contratos | Inventario encontrou 22 provas de contrato. | Nenhuma lacuna critica encontrada. | Fechado. |
| API integracao | Inventario encontrou 3 provas de integracao; `test:integration` existe. | MF2/MF3 exigem `TEST_DATABASE_URL` para prova persistida real. | Aceite com ressalva ambiental; bloquear fecho final sem BD efemera. |
| API scripts | Inventario encontrou 16 scripts API, incluindo `test:mf8`, `test:mf8:inventory`, `test:mf8:inventory-contracts` e `test:final:prepare`. | Nenhuma lacuna critica encontrada. | Fechado. |
| Web scripts | Inventario encontrou 14 scripts frontend; `test:final:prepare` passou. | Nenhuma lacuna critica encontrada. | Fechado. |
| Web typecheck/build | `npm --prefix real_dev/web run test:final:prepare` executou typecheck e build nas baterias MF7/MF8. | Nenhuma lacuna critica encontrada. | Fechado. |

## Cenarios negativos

| Cenario | Resultado esperado | Resultado observado | Decisao |
| --- | --- | --- | --- |
| Falta de prova MF8 no inventario | O script mostra `LACUNA` e exit code `1`. | Coberto por `npm --prefix real_dev/api run test:mf8:inventory-contracts`; teste negativo passou. | Fechado. |
| Falta de script `test:mf8` em API ou web | O teste de contrato acusa script em falta. | Coberto por `npm --prefix real_dev/api run test:mf8:inventory-contracts`; teste negativo passou. | Fechado. |
| Integracao persistida sem base efemera | Os testes recusam correr e explicam que falta `TEST_DATABASE_URL`. | `npm --prefix real_dev/api run test:integration` falhou em MF2/MF3 com pedido explicito de `TEST_DATABASE_URL`; MF1 passou. | Bloqueio ambiental conhecido para `BK-MF8-17`. |

## Lacunas que devem bloquear execucao final

- `TEST_DATABASE_URL` ausente: a execucao final API sem skip nao deve ser considerada limpa enquanto MF2/MF3 persistidos nao correrem contra uma base PostgreSQL efemera cujo nome contenha `test`, `audit` ou `ci`.

## Lacunas aceites com justificacao

- Nesta execucao local foi aceite `OPSA_SKIP_PERSISTENCE_TESTS=true` apenas para provar que a restante bateria final continua operacional. Esta aceitacao nao substitui a validacao persistida real.

## Handoff para BK-MF8-17

- Comando API recomendado no guia publico: `cd apps/api && npm run test:final:prepare`
- Comando web recomendado no guia publico: `cd apps/web && npm run test:final:prepare`
- Comando API real nesta checkout: `npm --prefix real_dev/api run test:final:prepare`
- Comando web real nesta checkout: `npm --prefix real_dev/web run test:final:prepare`
- Antes de decidir `PODE_AVANCAR`, configurar `TEST_DATABASE_URL` para base PostgreSQL efemera segura e correr a bateria API sem `OPSA_SKIP_PERSISTENCE_TESTS=true`.
- Decisao final para avancar: `PODE_AVANCAR_COM_RESSALVA_AMBIENTAL` apenas para frontend, inventario, contratos e gates; `BLOQUEADO_ATE_BD_EFEMERA` para prova persistida MF2/MF3.
>>>>>>> 81619f4 (Update: Mid)
