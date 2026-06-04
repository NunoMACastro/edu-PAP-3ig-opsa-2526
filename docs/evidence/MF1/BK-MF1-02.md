### Passo 1

* BK: BK-MF1-02
* Macrofase: MF1
* Requisito funcional: RF14
* Dependência: BK-MF0-03, BK-MF0-08, BK-MF0-09, BK-MF0-11, BK-MF1-01
* Próximo BK: BK-MF1-03
* Endpoint previsto: /api/sales/documents

### Passo 2
- PS D:\PAP\edu-PAP-3ig-opsa-2526> cd apps/api npm run prisma:generate

> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 806ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run prisma:validate

> @opsa/api@1.0.0 prisma:validate
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
┌─────────────────────────────────────────────────────────┐
│  Update available 6.19.3 -> 7.8.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
The schema at prisma\schema.prisma is valid 🚀

### Passo 3
