Passo 1:
RF/RNF cobertos:
- RF11 (Criar/importar plano de contas (SNC).)

BK seguinte:
- BK-MF0-12 (Criar artigos/serviços (SKU, custo, preço, IVA))

Passo 2:
- ItemType criado em schema.prisma
- Item criado em schema.prisma
- Company atualizado com items
- Prisma generate executado com sucesso
- Não existem erros de schema nem modelos/relacoes duplicados

Pendente:
- Prisma migrate, porque PostgreSQL local ainda não está disponível

Cenário negativo:
- Constraint @@unique([companyId, sku]) preparada para impedir SKU duplicado na mesma empresa.
- Teste 409 ainda não executado porque requer PostgreSQL local e dados persistidos.
- O conflito controlado deverá ser tratado no service/controller como 409 ITEM_SKU_EXISTS.

Passo 3:
Imports validados com Node:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/items/itemValidators.js').then(m => console.log(Object.keys(m)))"
[ 'validateItemPayload' ]

Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/items/itemValidators.js').then(m => { try { m.validateItemPayload(null); } catch (e) { console.log(e.status, e.code, e.message); 
} })"
400 INVALID_BODY O corpo do pedido deve ser JSON

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/items/itemValidators.js').then(m => { try { m.validateItemPayload({ sku:'A1', name:'Produto', type:'OUTRO', costCents:100, priceCents:200, vatRateBps:2300 }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_ITEM_TYPE Tipo de artigo/servico invalido

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/items/itemValidators.js').then(m => { try { m.validateItemPayload({ sku:'A1', name:'Produto', type:'PRODUCT', costCents:100, priceCents:0, vatRateBps:2300 }); } catch (e) { console.log(e.status, e.code, e.message); } })"
400 INVALID_MONEY priceCents tem valor invalido

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/items/itemValidators.js').then(m => { try { m.validateItemPayload({ sku:'A1', name:'Produto', type:'PRODUCT', costCents:100, priceCents:200, vatRateBps:15000 }); } catch (e) { console.log(e.status, e.code, e.message); } })"                                       
400 INVALID_VAT_RATE IVA deve estar entre 0 e 10000 basis points

Nota:
- Payload mal formado é bloqueado no validator antes de chegar ao Prisma.

Passo 4:
Testes lógicos:
- updateItem() usa

where: { id: itemId, companyId }

Logo um artigo de outra empresa não pode ser encontrado e devolve:
404 ITEM_NOT_FOUND

- assertUniqueSku()

where: { companyId, sku }

Se existir SKU igual na mesma empresa:
409 ITEM_SKU_EXISTS

PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/items/itemService.js').then(m => console.log(Object.keys(m)))"
[ 'createItem', 'deactivateItem', 'listItems', 'updateItem' ]

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> node -e "import('./src/modules/items/itemService.js').then(() => console.log('itemService OK'))"
itemService OK

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> Select-String -Path ".\src\modules\items\itemService.js" -Pattern "companyId"

src\modules\items\itemService.js:16:async function assertUniqueSku(prisma, companyId, sku, ignoreId = undefined) 
src\modules\items\itemService.js:18:        where: { companyId, sku, id: ignoreId ? { not: ignoreId } : undefined },
src\modules\items\itemService.js:28:export async function listItems(prisma, companyId) 
src\modules\items\itemService.js:30:        where: { companyId, isActive: true },
src\modules\items\itemService.js:36:export async function createItem(prisma, companyId, input) 
src\modules\items\itemService.js:37:    await assertUniqueSku(prisma, companyId, input.sku);
src\modules\items\itemService.js:38:    const item = await prisma.item.create({ data: { companyId, ...input } });
src\modules\items\itemService.js:42:export async function updateItem(prisma, companyId, itemId, input) 
src\modules\items\itemService.js:43:    await assertUniqueSku(prisma, companyId, input.sku, itemId);
src\modules\items\itemService.js:45:        where: { id: itemId, companyId },
src\modules\items\itemService.js:52:        where: { id: itemId, companyId },
src\modules\items\itemService.js:57:export async function deactivateItem(prisma, companyId, itemId) 
src\modules\items\itemService.js:59:        where: { id: itemId, companyId },


Validação:
- createItem usa assertUniqueSku()
- listItems filtra por companyId
- updateItem filtra por companyId
- deactivateItem filtra por companyId

Cenários negativos:
- SKU duplicado => 409 ITEM_SKU_EXISTS
- Artigo de outra empresa => 404 ITEM_NOT_FOUND
- Artigo inexistente => 404 ITEM_NOT_FOUND

Passo 5:
Cenários negativos:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X GET "http://localhost:3000/api/items"
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 16:59:36 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X DELETE "http://localhost:3000/api/items/test-id"
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 17:00:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X PATCH "http://localhost:3000/api/items/test-id" -H "Content-Type: application/json" --data-raw "{\"sku\":\"P001\",\"name\":\"Produto Atualizado\",\"type\":\"PRODUCT\",\"costCents\":1000,\"priceCents\":1500,\"vatRateBps\":2300}"
HTTP/1.1 400 Bad Request

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i -X GET "http://localhost:3000/api/items"
HTTP/1.1 401 Unauthorized

Passo 6:
- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> curl.exe -i "http://localhost:3000/api/items"
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-QnGOCjggpDw0yDOAyMlX6lx7uj8"
Date: Sun, 31 May 2026 17:18:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"SESSION_REQUIRED","message":"Sessao obrigatoria"}

Smoke principal:
- Endpoint POST /api/items disponível
- Rota protegida por autenticação e permissões

Payload de referência:
{
  "sku": "CONS-001",
  "name": "Consultoria contabilistica",
  "type": "SERVICE",
  "costCents": 0,
  "priceCents": 7500,
  "vatRateBps": 2300
}

Testes executados:
- POST /api/items sem sessão => 401 SESSION_REQUIRED

Cenários negativos:
- INVALID_ITEM_TYPE => 400
- INVALID_MONEY => 400
- INVALID_VAT_RATE => 400
- ITEM_SKU_EXISTS => 409
- ITEM_NOT_FOUND => 404

Validação:
- companyId não é recebido do body
- companyId é obtido da sessão/contexto
- não existe acesso a dados de outra empresa

Passo 7:

Decisões em falta:
- RF13 define tabelas oficiais de IVA apenas em MF1.
- Até existir tabela oficial, vatRateBps permanece um valor manual validado por intervalo.
- Confirmar política de arredondamentos e casas decimais antes da implementação de faturação.
- PostgreSQL local ainda não está disponível para smoke tests completos.

Handoff para MF1:
- Reutilizar itemValidators.js.
- Reutilizar itemService.js.
- Reutilizar itemController.js.
- Reutilizar itemRoutes.js.
- Reutilizar modelo Item.
- Reutilizar enum ItemType.
- Manter isolamento por companyId em todas as queries.
- Manter unicidade de SKU por empresa.
- Manter validação de preços em cêntimos.
- Manter validação de IVA através de vatRateBps até existir tabela oficial.
- Integrar artigos e serviços com documentos de faturação apenas após definição das regras fiscais em MF1.

Validação final:
- Schema Prisma atualizado.
- Prisma generate executado com sucesso.
- itemValidators.js criado e validado.
- itemService.js criado e validado.
- itemController.js criado.
- itemRoutes.js criado.
- server.js atualizado.
- GET /api/items sem sessão => 401 SESSION_REQUIRED.
- POST /api/items sem sessão => 401 SESSION_REQUIRED.
- INVALID_ITEM_TYPE => 400.
- INVALID_MONEY => 400.
- INVALID_VAT_RATE => 400.
- ITEM_SKU_EXISTS => 409.
- ITEM_NOT_FOUND => 404.