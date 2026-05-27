# Plano de Execução - MF0 OPSA

Snapshot do backlog: `2026-04-19` (`opsa/docs/planificacao/backlogs/BACKLOG-MVP.md`).

Guias MF0 refinados: `2026-05-24` (`opsa/docs/planificacao/guias-bk/MF0/`).

Contrato técnico: `2026-05-25` (`opsa/docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`).

## 1) Contexto principal

A `MF0` da OPSA é uma fase de **fundamentos e governance**, mas já inclui implementação real da aplicação.

Nesta macro entram as bases de:

- registo, login e logout com cookies `HttpOnly`;
- papéis e permissões;
- multiempresa;
- gestão de utilizadores por empresa;
- recuperação de password;
- dados da empresa;
- plano de contas SNC;
- períodos fiscais;
- clientes;
- fornecedores;
- artigos/serviços;
- armazéns e localizações.

Ao contrário de uma MF0 apenas documental, aqui a equipa deve criar contratos técnicos reais para backend, frontend e base de dados. Estes contratos vão ser reutilizados nas macros seguintes, sobretudo vendas, compras, inventário, contabilidade e segurança.

Stack/contrato técnico assumido até existir scaffold real:

- frontend: React + Vite + TypeScript;
- backend/API: Node.js LTS + Express com JavaScript moderno e ES Modules;
- persistência: PostgreSQL;
- ORM/migrations: Prisma ORM ou equivalente justificado;
- sessão web: cookies `HttpOnly`, `Secure` em produção e `SameSite` configurado;
- estrutura indicativa:
    - `apps/api`;
    - `apps/web`;
    - `apps/api/prisma/schema.prisma`;
    - `apps/web/src/lib/apiClient.ts`.

Regra importante:

Se a estrutura real criada pela equipa for diferente da estrutura indicativa, isso não pode alterar requisitos, RF/RNF, owners, dependências ou critérios de aceite. O PR tem de documentar:

- caminho indicado no guia;
- caminho real usado;
- motivo da adaptação;
- confirmação de que o contrato funcional se manteve.

---

## 2) BKs da MF0

Macro: `MF0 - Fundamentos e governance`

Janela planeada: `S01-S02` nos guias dos BKs da MF0.

Owner stream P0 da MF0: `Oleksii`

Equipa envolvida na MF0: `Oleksii`, `Andre`, `Pedro`, `Sofia`

| BK          | Título                                                                  | Owner   | Apoio   | Pri | Esforço | Dependências | RF   | Próximo BK  |
| ----------- | ----------------------------------------------------------------------- | ------- | ------- | --- | ------- | ------------ | ---- | ----------- |
| `BK-MF0-01` | Registo, login e logout com cookies HttpOnly                            | Oleksii | Andre   | P0  | M       | -            | RF01 | `BK-MF0-02` |
| `BK-MF0-02` | Papéis e permissões: Admin, Gestor, Contabilista, Operacional, Auditor  | Oleksii | Andre   | P0  | M       | `BK-MF0-01`  | RF02 | `BK-MF0-03` |
| `BK-MF0-03` | Multiempresa: papéis diferentes por empresa                             | Oleksii | Andre   | P0  | M       | `BK-MF0-02`  | RF03 | `BK-MF0-04` |
| `BK-MF0-04` | Gestão de utilizadores: convite, remoção e definição de papéis          | Oleksii | Andre   | P0  | M       | `BK-MF0-03`  | RF04 | `BK-MF0-05` |
| `BK-MF0-05` | Recuperação de password via email                                       | Oleksii | Pedro   | P0  | M       | -            | RF05 | `BK-MF0-06` |
| `BK-MF0-06` | Registar dados da empresa: NIF, morada, moeda, logótipo, período fiscal | Oleksii | Sofia   | P0  | M       | -            | RF06 | `BK-MF0-07` |
| `BK-MF0-07` | Criar/importar plano de contas SNC                                      | Oleksii | Andre   | P0  | M       | -            | RF07 | `BK-MF0-08` |
| `BK-MF0-08` | Abrir e fechar períodos fiscais, bloqueando lançamentos após fecho      | Oleksii | Pedro   | P0  | M       | `BK-MF0-07`  | RF08 | `BK-MF0-09` |
| `BK-MF0-09` | Criar e gerir clientes                                                  | Andre   | Oleksii | P0  | M       | -            | RF09 | `BK-MF0-10` |
| `BK-MF0-10` | Criar e gerir fornecedores                                              | Pedro   | Oleksii | P0  | M       | -            | RF10 | `BK-MF0-11` |
| `BK-MF0-11` | Criar artigos/serviços: SKU, custo, preço, IVA                          | Andre   | Oleksii | P0  | M       | -            | RF11 | `BK-MF0-12` |
| `BK-MF0-12` | Criar armazéns e localizações                                           | Sofia   | Oleksii | P1  | S       | -            | RF12 | `BK-MF1-01` |

Nota:

- `P0` exige pelo menos `3` cenários negativos.
- `P1` exige pelo menos `2` cenários negativos.
- Nenhum BK pode ficar `DONE` apenas porque o guia está escrito.

---

## 3) Regra principal obrigatória

Antes de começar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `estado`, `esforço`, `dependências`, `rf_rnf`, `sprint`, `core_or_reforco`, `proximo_bk` e `guia_path`.
3. Confirmar se o scaffold real já existe ou se ainda está em modo `sem_codigo`.
4. Perceber o que entra e o que fica fora.
5. Conseguir explicar o plano de implementação em 2-3 frases.
6. Confirmar comigo antes de implementar ou fechar o BK.

Nenhum BK pode ficar `DONE` sem:

- smoke funcional;
- negativos executados;
- validação técnica;
- evidence `pr`, `proof`, `neg`, `files`, `commands`;
- validação de planificação sem drift.

---

## 4) Dados e variáveis de ambiente

Nunca meter segredos no repositório.

Usar apenas `.env` local para:

- `DATABASE_URL`;
- `SESSION_SECRET` ou segredo equivalente;
- credenciais de SMTP/email, quando a recuperação de password ou convites precisarem;
- configuração de storage para logótipo, apenas se ficar definida;
- qualquer chave externa necessária em BK futuro.

Antes de qualquer commit:

```bash
git status
```

Confirmar:

- `.env` não está staged;
- não há passwords, tokens, cookies reais, URIs privadas ou dados pessoais desnecessários;
- evidence está sanitizada;
- logs não expõem stack traces, segredos, hashes, tokens ou dados sensíveis;
- dados de teste respeitam isolamento por empresa.

---

## 5) Ordem de execução

0. Fazer refresh de tabs GitHub/IDE abertas.
1. Ler `opsa/docs/planificacao/README.md`.
2. Confirmar hierarquia de verdade:
    - `MATRIZ-CANONICA-BK`;
    - `BACKLOG-MVP`;
    - `PLANO-SPRINTS`;
    - `SCORECARD-SPRINTS`;
    - `GUIAO-DOCENTE-SEMANAL`;
    - `GATES-S4-S8-S12`;
    - `guias-bk/*`.
3. Ler `opsa/docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
4. Abrir `opsa/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
5. Confirmar `MF0 - Fundamentos e governance`.
6. Abrir `opsa/docs/planificacao/backlogs/MF-VIEWS.md`.
7. Confirmar sequência:
    - `BK-MF0-01`;
    - `BK-MF0-02`;
    - `BK-MF0-03`;
    - `BK-MF0-04`;
    - `BK-MF0-05`;
    - `BK-MF0-06`;
    - `BK-MF0-07`;
    - `BK-MF0-08`;
    - `BK-MF0-09`;
    - `BK-MF0-10`;
    - `BK-MF0-11`;
    - `BK-MF0-12`.
8. Abrir `opsa/docs/planificacao/backlogs/BACKLOG-MVP.md`.
9. Confirmar estado, dependências, owner, apoio, prioridade, esforço, RF e próximo BK.
10. Abrir o guia específico do BK em `opsa/docs/planificacao/guias-bk/MF0/`.
11. Validar o scope-out antes de escrever código.
12. Implementar em ciclos curtos, mantendo PR pequeno.
13. Validar smoke + negativos + evidence.
14. Correr validação documental:

```bash
bash scripts/validate-planificacao.sh
```

---

## 6) SSOT mínimo da MF0

Ler apenas as partes relevantes:

- `opsa/docs/RF.md`
    - `RF01..RF12`.

- `opsa/docs/RNF.md`
    - validação de formulários e mensagens de erro;
    - segurança de sessões e passwords;
    - proteção contra ataques comuns;
    - credenciais apenas em variáveis de ambiente;
    - modularidade backend/frontend;
    - auditoria e logs quando aplicável.

- `opsa/docs/planificacao/README.md`
    - hierarquia canónica;
    - validação oficial;
    - contrato pedagógico por prioridade.

- `opsa/docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
    - stack assumida;
    - estrutura indicativa;
    - regra de adaptação quando existir scaffold real.

- `opsa/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - `MF0`;
    - regras transversais;
    - gates `S4`, `S8`, `S12`.

- `opsa/docs/planificacao/backlogs/BACKLOG-MVP.md`
    - linhas `BK-MF0-01..BK-MF0-12`;
    - contrato de dados canónico;
    - contrato pedagógico comum.

- `opsa/docs/planificacao/backlogs/MF-VIEWS.md`
    - `## MF0 - Fundamentos e governance`.

- `opsa/docs/planificacao/sprints/PLANO-SPRINTS.md`
    - `S01` e `S02`;
    - capacidade semanal;
    - gates e KPIs.

- Guias específicos:
    - `BK-MF0-01-registo-login-e-logout-com-cookies-httponly.md`;
    - `BK-MF0-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md`;
    - `BK-MF0-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empresas.md`;
    - `BK-MF0-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md`;
    - `BK-MF0-05-recuperacao-de-password-via-email.md`;
    - `BK-MF0-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md`;
    - `BK-MF0-07-criar-importar-plano-de-contas-snc.md`;
    - `BK-MF0-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md`;
    - `BK-MF0-09-criar-e-gerir-clientes.md`;
    - `BK-MF0-10-criar-e-gerir-fornecedores.md`;
    - `BK-MF0-11-criar-artigos-servicos-sku-custo-preco-iva.md`;
    - `BK-MF0-12-criar-armazens-e-localizacoes.md`.

---

## 7) Validação por BK

### `BK-MF0-01` - Registo, login e logout com cookies HttpOnly

Smoke:

- `POST /api/auth/register` cria utilizador com email único e password válida;
- login válido cria cookie `sid`;
- `GET /api/auth/me` devolve utilizador autenticado;
- logout revoga/limpa sessão.

Negativos:

- login com email válido e password errada => `401` sem `Set-Cookie`;
- registo com email existente => `409`;
- `/api/auth/me` sem cookie => `401` sem dados pessoais.

Bloqueios:

- confirmar dependência concreta para hash de password (`bcrypt` ou `bcryptjs`) antes de implementar;
- password nunca pode ficar em texto puro;
- frontend não pode guardar sessão em `localStorage`.

### `BK-MF0-02` - Papéis e permissões

Smoke:

- `GET /api/auth/me` devolve o papel autenticado;
- middleware/helper de autorização bloqueia ações não permitidas.

Negativos:

- sem sessão em endpoint protegido => `401`;
- `Operacional` tenta ação de `Admin` => `403`;
- role desconhecida em seed/fixture => validação antes de persistir.

Validação técnica:

- enum canónico: `Admin`, `Gestor`, `Contabilista`, `Operacional`, `Auditor`;
- backend é autoridade de autorização;
- UI pode ocultar ações, mas não substitui validação backend.

### `BK-MF0-03` - Multiempresa

Smoke:

- `GET /api/companies` devolve empresas do utilizador;
- sessão/contexto permite empresa ativa;
- papel devolvido corresponde à empresa ativa.

Negativos:

- selecionar empresa sem membership => `403` e sessão sem alterar;
- pedido a recurso de empresa sem `companyId` ativo => `400` ou `403` controlado;
- mesmo utilizador com papéis diferentes em empresas diferentes devolve o papel da empresa ativa.

Validação técnica:

- `Company`;
- `CompanyMembership`;
- `requireCompanyContext`;
- queries futuras filtradas por `companyId`.

### `BK-MF0-04` - Gestão de utilizadores

Smoke:

- `GET /api/company/users` lista membros da empresa ativa;
- convite permite email, role e empresa;
- alteração de role funciona para papel autorizado.

Negativos:

- `Operacional` tenta convidar utilizador => `403`;
- convite com role não canónica, por exemplo `SuperAdmin`, => `400`;
- remover último `Admin` da empresa => `409`.

Bloqueios:

- confirmar serviço de email ou modo simulação para desenvolvimento;
- convite deve usar token seguro ou token hash;
- remover membership não deve apagar a conta global.

### `BK-MF0-05` - Recuperação de password via email

Smoke:

- `POST /api/auth/password/forgot` responde com mensagem genérica;
- token válido permite definir nova password;
- token usado/expirado não pode voltar a ser aceite.

Negativos:

- email inexistente => `200` genérico, sem user enumeration;
- token expirado => `400` e password inalterada;
- nova password fraca => `400`.

Bloqueios:

- confirmar serviço de email no ambiente real ou modo de simulação;
- guardar apenas hash do token;
- invalidar tokens usados.

### `BK-MF0-06` - Dados da empresa

Smoke:

- `GET /api/company/profile` carrega perfil da empresa;
- `PUT /api/company/profile` atualiza dados válidos;
- moeda `EUR` fica por defeito quando aplicável.

Negativos:

- NIF com 8 ou 10 dígitos => `400`;
- empresa sem nome => `400`;
- upload de logótipo `.exe` ou ficheiro excessivo => `400` ou upload bloqueado.

Validação técnica:

- dados associados a `companyId`;
- preparar logótipo sem inventar storage definitivo se ainda não estiver decidido;
- período fiscal base preparado para `BK-MF0-08`.

### `BK-MF0-07` - Plano de contas SNC

Smoke:

- `GET /api/accounting/accounts` lista contas;
- criação manual de conta válida funciona;
- importação CSV simples valida linha a linha.

Negativos:

- CSV com código `ABC` => linha rejeitada com erro explícito;
- conta duplicada na mesma empresa => `409`;
- ficheiro vazio => `400`.

Bloqueios:

- confirmar fonte oficial ou ficheiro base do plano SNC a importar;
- `Account` deve ter `companyId`;
- código de conta deve ser único por empresa.

### `BK-MF0-08` - Períodos fiscais

Smoke:

- `GET /api/fiscal-periods` lista períodos;
- abrir período sem sobreposição funciona;
- fechar período regista quem fechou e quando.

Negativos:

- criar período com datas sobrepostas => `409`;
- registar lançamento em período fechado => `403` ou `409`;
- `Operacional` tenta fechar período => `403`.

Validação técnica:

- `FiscalPeriod` por empresa;
- helper `assertOpenFiscalPeriod(date, companyId)` reutilizável;
- fecho de período deve bloquear lançamentos futuros abrangidos.

### `BK-MF0-09` - Clientes

Smoke:

- `GET /api/customers` responde com lista filtrada por empresa;
- criação de cliente válido funciona;
- UI/listagem ou modal de novo cliente usa API real ou contrato documentado.

Negativos:

- criar cliente sem nome => `400`;
- criar cliente com NIF duplicado na mesma empresa => `409`;
- listar clientes de outra empresa => não devolve dados externos ou responde `403`.

Validação técnica:

- `Customer` com `companyId`;
- endpoints `GET /api/customers`, `POST /api/customers`, `PATCH /api/customers/:id`, `DELETE /api/customers/:id`;
- validadores backend para NIF/email;
- handoff para `BK-MF1-02` com `customerId` estável.

### `BK-MF0-10` - Fornecedores

Smoke:

- `GET /api/suppliers` responde com lista filtrada por empresa;
- criação de fornecedor válido funciona;
- UI/listagem ou modal de novo fornecedor usa API real ou contrato documentado.

Negativos:

- criar fornecedor sem NIF => `400`;
- criar fornecedor duplicado na mesma empresa => `409`;
- `Auditor` tenta editar fornecedor => `403` se a política não permitir escrita.

Validação técnica:

- `Supplier` com `companyId`;
- endpoints `GET /api/suppliers`, `POST /api/suppliers`, `PATCH /api/suppliers/:id`, `DELETE /api/suppliers/:id`;
- validadores backend para NIF/email;
- handoff para `BK-MF1-07` com `supplierId` estável.

### `BK-MF0-11` - Artigos/serviços

Smoke:

- `GET /api/items` responde com lista filtrada por empresa;
- criação de artigo/serviço válido funciona;
- inventário liga à API real ou contrato documentado.

Negativos:

- criar artigo com SKU duplicado => `409`;
- criar artigo com preço negativo => `400`;
- criar artigo com IVA `999` => `400`.

Validação técnica:

- `Item` com `companyId` e `sku` único por empresa;
- endpoints `GET /api/items`, `POST /api/items`, `PATCH /api/items/:id`, `DELETE /api/items/:id`;
- suportar `PRODUCT`/`SERVICE` se necessário;
- preparar IVA sem inventar tabela fiscal final antes do `BK-MF1-01`;
- handoff para `BK-MF0-12` e `BK-MF1-02`.

### `BK-MF0-12` - Armazéns e localizações

Smoke:

- `GET /api/warehouses` responde com lista filtrada por empresa;
- `POST /api/warehouses` cria armazém válido;
- `POST /api/warehouses/:id/locations` cria localização válida.

Negativos:

- criar armazém sem código => `400`;
- criar localização duplicada no mesmo armazém => `409`.

Validação técnica:

- `Warehouse` com `companyId`;
- `WarehouseLocation` com `warehouseId`;
- endpoints simples de criação/listagem;
- movimentos de stock, transferências e FIFO ficam fora deste BK;
- handoff para `BK-MF1-01` e `MF2` com `warehouseId`/`locationId` estáveis.

---

## 8) Entregáveis mínimos no PR

Cada PR deve incluir:

- implementação completa do BK, sem desvio ao guia;
- `Evidence` preenchida:
    - `pr`;
    - `proof`;
    - `neg`;
    - `files`;
    - `commands`;
    - `screenshots`, se houver UI;
    - `notes`, se houver decisões, assunções ou desvios aprovados.
- validação smoke;
- negativos mínimos por prioridade;
- lint/testes disponíveis ou justificação clara se ainda não existirem scripts;
- `bash scripts/validate-planificacao.sh`;
- sem `.env`;
- sem segredos;
- sem drift de `bk_id`, RF/RNF, owner, apoio, prioridade, dependências ou critérios de aceite.

Comandos esperados, adaptando ao scaffold real:

```bash
npm --prefix apps/api run lint
npm --prefix apps/api run test
npm --prefix apps/web run lint
npm --prefix apps/web run test
bash scripts/validate-planificacao.sh
```

Se os scripts ainda não existirem:

- registar `TODO` na evidence;
- executar smoke manual com `curl` e/ou browser;
- não marcar o BK como `DONE` sem evidence real.

---

## 9) Naming de branch recomendado

Usar o padrão:

```text
feat/bk-mf0-XX-descricao-owner
```

Exemplos:

- `feat/bk-mf0-01-auth-httponly-oleksii`
- `feat/bk-mf0-09-clientes-andre`
- `feat/bk-mf0-10-fornecedores-pedro`
- `feat/bk-mf0-12-armazens-sofia`

Como criar branch:

```bash
git checkout -b feat/bk-mf0-01-auth-httponly-oleksii
```

Isto cria e muda para a branch.
Depois de implementar, criar PR para `main` e preencher evidence.

Para criar um PR:

1. Push da branch local para remoto:

```bash
git push origin feat/bk-mf0-01-auth-httponly-oleksii
```

2. Ir ao GitHub, abrir PR da branch para `main`.
3. Preencher título, descrição e evidence.
4. Criar Pull Request.

---

## 10) Handoff para MF1

A `MF0` termina quando:

- todos os BKs `BK-MF0-01..BK-MF0-12` têm smoke, negativos e evidence;
- autenticação, roles e multiempresa estão reutilizáveis;
- dados mestre principais existem com `companyId`;
- clientes, fornecedores e artigos têm IDs estáveis para vendas/compras;
- armazéns/localizações estão preparados para inventário futuro;
- não há drift entre matriz, backlog, MF views, plano de sprints e guias;
- `bash scripts/validate-planificacao.sh` passa.

Primeiros contratos críticos para a `MF1`:

- `BK-MF1-01` - Configurar tabelas de IVA;
- `BK-MF1-02` - Emitir Fatura, Fatura-Recibo e Nota de Crédito;
- `BK-MF1-07` - Registar Fatura de Fornecedor e Nota de Crédito.

---

## 11) Se bloquearem mais de 45 minutos

Mandar-me:

1. 2-3 frases sobre o problema.
2. erro/log relevante sem dados sensíveis.
3. o que já tentaram.
4. path + heading do SSOT que está a causar dúvida.
5. indicação do BK, branch e ficheiros afetados.

Se o bloqueio envolver stack, scaffold, serviço de email, storage de logótipo, plano SNC ou regras de permissões, não inventar a decisão no PR. Marcar como `TODO/BLOCKER` e pedir validação.
