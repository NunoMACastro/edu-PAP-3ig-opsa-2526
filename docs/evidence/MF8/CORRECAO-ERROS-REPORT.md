# Correção de erros MF8

## Identificação

- BK: BK-MF8-18
- Requisito: RNF39
- Fonte: docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md

## Erro observado

- Comando original: npm run mf8:final-validation
- Resultado observado: FAIL
- Impacto: a execução final do MF8 não podia ser fechada.

## Causa raiz

- Causa raiz resumida: o contrato validado pelo comando final não estava alinhado com a implementação corrigida.

## Correção aplicada

- Ficheiros corrigidos: caminhos reais alterados pela equipa
- Correção aplicada: ajuste mínimo que repõe o contrato esperado pelo teste afetado.

## Teste afetado reexecutado

- Comando reexecutado: npm run mf8:final-validation
- Resultado da reexecução: PASS

## Decisão final

- Decisão final: CORRIGIDO_REVALIDADO

## Risco residual

- Risco residual: sem risco residual conhecido depois da reexecução do comando afetado.