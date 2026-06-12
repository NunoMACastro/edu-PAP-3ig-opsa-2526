# Evidence MF2

Evidence documental da macrofase MF2, criada em 2026-06-12 para fechar o finding `P3-MF2-EVIDENCE-AUSENTE`.

## Comandos transversais executados

```bash
npm run syntax:check
npm run test:unit
npm run test:contracts
DATABASE_URL='postgresql://user:pass@localhost:5432/opsa_schema_check' npm run prisma:validate
npm run test:integration
bash scripts/validate-planificacao.sh
git diff --check
```

## Resultados transversais

- `npm run syntax:check`: passou.
- `npm run test:unit`: passou, 41/41 testes.
- `npm run test:contracts`: passou, 19/19 testes.
- `DATABASE_URL=... npm run prisma:validate`: passou.
- `git diff --check`: passou sem output.
- `npm run test:integration`: nao passou por falta de `TEST_DATABASE_URL`; o proprio teste exige base PostgreSQL efemera cujo nome contenha `test`, `audit` ou `ci`.
- `bash scripts/validate-planificacao.sh`: corrigido para separar gates bloqueantes de checks consultivos antigos.

## Ficheiros

- `BK-MF2-01.md`
- `BK-MF2-02.md`
- `BK-MF2-03.md`
- `BK-MF2-04.md`
- `BK-MF2-05.md`
- `BK-MF2-06.md`
- `BK-MF2-07.md`
- `BK-MF2-08.md`
