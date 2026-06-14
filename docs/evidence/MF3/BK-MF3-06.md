Passo 1
* BK: BK-MF3-06
* Macrofase: MF3
* Requisito funcional: RF36
* Dependência: BK-MF0-06, BK-MF0-09, BK-MF0-10, BK-MF1-02, BK-MF1-04, BK-MF1-07, BK-MF1-09, BK-MF2-06
* Sprint: S07-S08
* Próximo BK: BK-MF3-07
* Endpoint previsto: GET /api/compliance/saft

Passo 2
Ficheiros alterados:
- apps/api/prisma/schema.prisma

Modelo criado:
- SaftExportRun

Regras preparadas:
- SaftExportRun guarda companyId, período, fileName, status, exportedById, exportedAt e warnings;
- o modelo permite rastrear quem exportou o SAF-T;
- warnings permite guardar avisos sem bloquear exportações válidas;
- a exportação fica auditável para compliance.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate

> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 3.96s

Passo 3
Ficheiros criados:
- apps/api/src/modules/compliance/saftValidators.js
Temporario 
- D:\PAP\edu-PAP-3ig-opsa-2526\test-saft-validator.js

Regras implementadas:
- from é validado como data obrigatória;
- to é validado como data obrigatória;
- from não pode ser posterior a to;
- erro específico INVALID_SAFT_RANGE para datas inválidas;
- validator devolve apenas fromDate e toDate;
- perfil fiscal fica para validação no service;
- companyId não vem da query.

Smoke previsto/validado:
- from=2026-01-01&to=2026-01-31 devolve fromDate e toDate válidos.

Negativos previstos/validados:
- from=abc devolve 400 INVALID_SAFT_RANGE;
- to=abc devolve 400 INVALID_SAFT_RANGE;
- from=2026-02-01&to=2026-01-01 devolve 400 INVALID_SAFT_RANGE.

Comandos executados:
- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-saft-validator.js
{
  status: 400,
  code: 'INVALID_SAFT_RANGE',
  message: 'from deve ser uma data válida'
}
 
- PS D:\PAP\edu-PAP-3ig-opsa-2526> node test-saft-validator.js
{
  status: 400,
  code: 'INVALID_SAFT_RANGE',
  message: 'Data inicial posterior a data final'
}