# Evidence - BK-MF8-12

## Contexto

- Macro-fase: MF8
- BK: BK-MF8-12
- Requisito: RNF33 - Alertas configuráveis (ativar/desativar tipos)
- Owner: Andre
- Apoio: Oleksii

## Ficheiros alterados

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/notifications/alertPreferenceService.js`
- `apps/api/src/modules/notifications/notificationRoutes.js`
- `apps/api/tests/contracts/mf8-alert-preferences.contract.test.js`

## Comandos executados

| Comando | Resultado observado | Data |
| --- | --- | --- |
| `cd apps/api && npm run prisma:validate` | Preencher com o resultado real. | Preencher |
| `cd apps/api && npm run syntax:check` | Preencher com o resultado real. | Preencher |
| `cd apps/api && node --test tests/contracts/mf8-alert-preferences.contract.test.js` | Preencher com o resultado real. | Preencher |
| `cd apps/api && npm run test:contracts` | Preencher com o resultado real. | Preencher |

## Prova funcional

- `GET /api/notifications/preferences` devolve todos os tipos suportados.
- `PATCH /api/notifications/preferences/:type` persiste a preferência do utilizador autenticado na empresa ativa.
- O tipo `security` não pode ser desativado.
- O body não aceita `companyId` para decidir contexto de empresa.

## Negativos

- Body com `enabled` não booleano devolve erro controlado.
- Tentativa de desativar `security` devolve erro controlado.
- Pedido sem sessão ou sem empresa ativa é bloqueado pelos guards existentes.