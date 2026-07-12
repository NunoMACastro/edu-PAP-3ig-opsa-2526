Passo 1:
RF/RNF cobertos:
- RF12 (Criar armazéns e localizações com modelo operacional simples)

BK seguinte:
- MF1/MF2 conforme planificação posterior; movimentos de stock continuam fora do scope deste BK.

Correção de findings - 2026-06-01:
- Warehouse passou a ter unicidade por companyId+name além de companyId+code.
- WarehouseLocation passou a ter unicidade por warehouseId+name além de warehouseId+code.
- createWarehouse devolve WAREHOUSE_NAME_EXISTS para nome duplicado.
- createWarehouseLocation devolve WAREHOUSE_LOCATION_NAME_EXISTS para nome duplicado.
- apps/web passou a incluir UI mínima para listar/criar armazéns, listar localizações e criar localizações.
- Permissões revistas: escrita de armazéns/localizações fica suportada por ADMIN e OPERACIONAL.

Validações executadas:
- npm --prefix apps/api run test:unit => passou.
- npm --prefix apps/api run test:contracts => passou.
- npm --prefix apps/api run syntax:check => passou.
- env `DATABASE_URL=<fornecida-por-canal-seguro>` npm --prefix apps/api run prisma:validate => passou.
- npm --prefix apps/web run typecheck => passou.
- npm --prefix apps/web run build => passou.

Pendentes:
- Smoke HTTP completo com PostgreSQL real, sessão válida, empresa ativa e permissões reais.
- npm --prefix apps/api run migration:precheck-mf0 com base de dados real antes de aplicar migração.
- Tentativa de precheck em 2026-06-01 falhou antes de ligar à BD porque @prisma/client ainda não inicializou; depende de prisma generate.
- prisma generate foi tentado nesta máquina, mas ficou bloqueado por permissões em apps/api/node_modules root-owned.

Notas de scope:
- Não foram adicionadas transferências, entradas, saídas, FIFO, picking ou segmentação analítica avançada.
