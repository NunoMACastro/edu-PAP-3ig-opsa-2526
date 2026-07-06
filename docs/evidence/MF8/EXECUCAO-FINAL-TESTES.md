# Execução final de testes MF8

## Identificação

- BK: BK-MF8-17
- Requisito: RNF38
- Data/hora: 2026-07-06T09:41:30.651Z
- Evidence de entrada: `docs/evidence/MF8/TESTES-EM-FALTA.md`
- Decisão final: `BLOQUEADO_ATE_CORRECAO`

## Precondições

| Verificação | Resultado esperado | Resultado observado | Decisão |
| --- | --- | --- | --- |
| Evidence de testes em falta criada no BK-MF8-16 | O ficheiro existe antes da execução final. | Encontrado. | OK |

## Resumo da evidence do BK-MF8-16

```md
# Testes em falta MF8

## Identificação

- BK: BK-MF8-16
- Requisito: RNF37
- Owner: Oleksii
- Apoio: Andre
- Data:
- Branch/PR:

## Comandos executados
```

## Comandos executados

| Área | Diretório | Comando | Resultado esperado | Exit code | Decisão |
| --- | --- | --- | --- | ---: | --- |
| API | `D:\PAP\edu-PAP-3ig-opsa-2526\apps\api` | `npm run test:final:prepare` | syntax, unitários, contratos, integração, MF6, MF7 e MF8 sem falhas. | 1 | BLOQUEANTE |
| WEB | `D:\PAP\edu-PAP-3ig-opsa-2526\apps\web` | `npm run test:final:prepare` | gates frontend, typecheck e build sem falhas. | 1 | BLOQUEANTE |
| PLANIFICACAO | `D:\PAP\edu-PAP-3ig-opsa-2526` | `bash scripts/validate-planificacao.sh` | overall_pass=true no relatório JSON do validador. | 1 | BLOQUEANTE |

## Output observado

### API - npm run test:final:prepare

- Diretório: `D:\PAP\edu-PAP-3ig-opsa-2526\apps\api`
- Exit code: `1`
- Decisão: `BLOQUEANTE`

#### stdout

```text
Sem stdout.
```

#### stderr

```text
spawnSync npm ENOENT
```

### WEB - npm run test:final:prepare

- Diretório: `D:\PAP\edu-PAP-3ig-opsa-2526\apps\web`
- Exit code: `1`
- Decisão: `BLOQUEANTE`

#### stdout

```text
Sem stdout.
```

#### stderr

```text
spawnSync npm ENOENT
```

### PLANIFICACAO - bash scripts/validate-planificacao.sh

- Diretório: `D:\PAP\edu-PAP-3ig-opsa-2526`
- Exit code: `1`
- Decisão: `BLOQUEANTE`

#### stdout

```text
Sem stdout.
```

#### stderr

```text
spawnSync bash ENOENT
```

## Cenários negativos

| Cenário | Resultado esperado | Decisão |
| --- | --- | --- |
| `TESTES-EM-FALTA.md` ausente | Script termina antes da bateria final com decisão `BLOQUEANTE`. | Coberto por precondição. |
| `test:final:prepare` falha na API ou na web | Evidence regista exit code diferente de zero e decisão `BLOQUEANTE`. | Coberto por execução real. |

## Handoff para BK-MF8-18

- Se a decisão final for `PODE_AVANCAR_PARA_BK-MF8-18`, o próximo BK só precisa verificar se não há falhas residuais.
- Se a decisão final for `BLOQUEADO_ATE_CORRECAO`, o próximo BK deve começar pelo primeiro comando com decisão `BLOQUEANTE`.
- Nunca apagar outputs antigos sem guardar a nova execução.

## Decisão

Decisão final: `BLOQUEADO_ATE_CORRECAO`
