# Correcao de erros MF8

## Identificação

- BK: BK-MF8-18
- Requisito: RNF39
- Fonte: docs/evidence/MF8/EXECUCAO-FINAL-TESTES.md
- Data de revalidacao: 2026-07-10

## Erro observado

- Comando original: npm run test:integration
- Resultado observado: FAIL_AMBIENTE; 2/7 PASS e 5/7 FAIL, zero skips, porque TEST_DATABASE_URL e os serviços remotos obrigatórios não estão disponíveis.

O gate local reproduz honestamente o bloqueio de persistência. Não existe uma
base PostgreSQL remota descartável, Redis, SMTP sandbox ou S3 de teste que
permita executar os cinco cenários restantes sem substituir runtime real por
doubles.

## Causa raiz

- Causa raiz resumida: TEST_DATABASE_URL, RESTORE_DATABASE_URL, Redis, SMTP, S3, PostgreSQL client tools e browsers obrigatórios não foram fornecidos por canal seguro; o código não pode criar ou inferir estas credenciais.

O mesmo ambiente não permite demonstrar migrations desde zero, concorrência
PostgreSQL, rate limiting entre duas instâncias, email real, upload/restore S3
ou a matriz Playwright. O Node observado, `24.11.1`, também está abaixo do alvo
académico `>=24.17 <25`.

## Correção aplicada

- Ficheiros corrigidos: real_dev/api, real_dev/web e evidências MF8 inventariadas no relatório canónico; nenhum ficheiro em apps foi alterado.
- Correção aplicada: foram implementadas as correções locais de autenticação, integridade, concorrência, retenção, multipart, paginação, backup, readiness, auditoria e SAF-T fail-closed; o gate continua vermelho porque infraestrutura externa não pode ser fabricada.

Entre as correções revalidadas estão bulk upsert em chunks, auditoria atómica,
cursor pagination, restore a partir de manifesto remoto, probes operacionais,
cleanup com pós-condição e o contrato SAF-T que distingue estrutura `1.04_01`
de processador XSD 1.1. O frontend local termina com 10 ficheiros e 30/30
testes, typecheck e builds verdes.

## Teste afetado reexecutado

- Comando reexecutado: npm run test:integration
- Resultado da reexecução: FAIL_AMBIENTE; 2/7 PASS, 5/7 FAIL e 0 skips por TEST_DATABASE_URL/serviços remotos ausentes.

Não foi usado `OPSA_SKIP_PERSISTENCE_TESTS=true`. Um teste não executável ou
uma dependência ausente não é convertido em PASS.

## Decisão final

- Decisão final: BLOQUEADO_AMBIENTE

O gate `mf8:defect-report` deve reconhecer este relatório como estruturalmente
válido e terminar com exit `1` através de `MF8_DEFECT_REPORT_BLOCKED` enquanto
o bloqueio persistir.

## Risco residual

- Risco residual: migrations/concorrência/restore/SMTP/S3/browser e validação SAF-T externa continuam por provar; a aplicação permanece NO_GO e não é production-ready.

Próxima ação: fornecer o ambiente remoto por canal seguro, instalar os client
tools/browsers autorizados, atualizar Node e reexecutar os mesmos gates sem
skips. Só uma reauditoria posterior pode fechar os findings dependentes.
