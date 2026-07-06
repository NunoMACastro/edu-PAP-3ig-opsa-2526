# Testes em falta MF8

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