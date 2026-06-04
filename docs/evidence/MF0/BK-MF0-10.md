Passo 1:
RF/RNF cobertos:
- RF10 (Criar e gerir fornecedores)

BK seguinte:
- BK-MF0-11 (Criar artigos/serviços)

Correção de findings - 2026-06-01:
- Supplier.nif tinha sido tornado obrigatório no schema Prisma.
- validateSupplierPayload tinha passado a rejeitar fornecedor sem NIF com INVALID_NIF.
- GET /api/suppliers passou a aceitar search opcional para pesquisa por nome ou NIF.
- apps/web passou a incluir UI mínima de listagem, pesquisa, criação, atualização e remoção lógica de fornecedores.
- Permissões revistas: escrita de fornecedores fica suportada por ADMIN, CONTABILISTA e OPERACIONAL.

Validações executadas:
- npm --prefix apps/api run test:unit => passou.
- npm --prefix apps/api run test:contracts => passou.
- npm --prefix apps/api run syntax:check => passou.
- env DATABASE_URL=postgresql://user:pass@localhost:5432/opsa npm --prefix apps/api run prisma:validate => passou.
- npm --prefix apps/web run typecheck => passou.
- npm --prefix apps/web run build => passou.

Pendentes:
- Smoke HTTP completo com PostgreSQL real, sessão válida, empresa ativa e permissões reais.
- npm --prefix apps/api run migration:precheck-mf0 com base de dados real antes de aplicar migração.
- Tentativa de precheck em 2026-06-01 falhou antes de ligar à BD porque @prisma/client ainda não inicializou; depende de prisma generate.
- prisma generate foi tentado nesta máquina, mas ficou bloqueado por permissões em apps/api/node_modules root-owned.

Notas de scope:
- Não foram adicionados pagamentos, faturas de fornecedor, importação CSV nem scoring, porque pertencem a MFs futuras ou estão fora do BK-MF0-10.

Correção de findings - 2026-06-02:
- Revertido o drift documental: Supplier.nif voltou a ser opcional no schema Prisma, conforme guia BK-MF0-10.
- validateSupplierPayload aceita NIF vazio/null e valida formato apenas quando o NIF é preenchido.
- UI de fornecedores deixou de marcar NIF como obrigatório.
- migration precheck deixou de bloquear fornecedores sem NIF.
- Validações executadas: npm run test:unit, npm run test:contracts, npm run syntax:check, prisma validate com DATABASE_URL sintético e npm run typecheck em apps/web.
- Prisma generate tentou correr, mas está bloqueado por apps/api/node_modules root-owned neste ambiente local.
