- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node --check scripts/check-mf7-backend-modules.mjs

# Evidence BK-MF7-08 - Backend modular por domínio

## Contexto

- BK: BK-MF7-08
- RNF: RNF25
- Data: 28.06.2026
- Responsável:

## Prova positiva

Comando:

```bash
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run check:mf7:backend-modules
```

Resultado observado:

```txt
MF7 backend modular: OK
```

## Negativo 1 - route obrigatória em falta

Comando:

```bash
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> $env:OPSA_MF7_SIMULATE_MISSING="src/modules/ai/aiRoutes.js"
>> npm run check:mf7:backend-modules
```

Resultado observado:

```txt
Ficheiro obrigatório em falta: src/modules/ai/aiRoutes.js
```

## Negativo 2 - service importado diretamente no servidor

Comando:

```bash
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> $env:OPSA_MF7_SIMULATE_FORBIDDEN_SERVER_IMPORT="sales/saleDocumentService.js"
>> npm run check:mf7:backend-modules
```

Resultado observado:

```txt
server.js importa ficheiros internos de domínio: from "./modules/sales/saleDocumentService.js"
```

## Negativo 3 - service obrigatório em falta

Comando:

```bash
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> $env:OPSA_MF7_SIMULATE_MISSING="src/modules/inventory/stockMovementService.js"
>> npm run check:mf7:backend-modules
```

Resultado observado:

```txt
Ficheiro obrigatório em falta: src/modules/inventory/stockMovementService.js
```

## Conclusão

O backend mantém domínios separados, routes delegam em services e `server.js` continua limitado à montagem de routers.