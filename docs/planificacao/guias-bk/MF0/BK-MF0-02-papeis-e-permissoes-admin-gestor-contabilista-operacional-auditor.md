# BK-MF0-02 - Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).

## Header
- `doc_id`: `GUIA-BK-MF0-02`
- `bk_id`: `BK-MF0-02`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-01`
- `rf_rnf`: `RF02`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-03`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md`
- `last_updated`: `2026-05-24`

#### BK-MF0-02 - Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF02 num guia de execucao para construir a parte da app relacionada com identidade. O foco nao e produzir documentacao generica: e deixar claro que modelos, endpoints, validacoes, UI e evidencia devem existir quando a equipa implementar o BK.

A app real ainda esta marcada como `sem_codigo`; por isso, os caminhos tecnicos propostos seguem o contrato central `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`. Esse contrato define a stack assumida, a estrutura indicativa e a regra de adaptacao quando existir scaffold real, sem alterar RF, BK, owners, dependencias ou criterios de aceite.

Como a fase alvo e MF0, nao existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estaveis para BK-MF0-03 e para os BKs de vendas, compras, inventario, contabilidade e seguranca das fases seguintes.

##### Porque e que isto e importante

- Funcionalmente, cobre RF02 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de Role, PermissionPolicy e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligacao entre requisito, modelo, endpoint, UI, teste e evidence.
- Em seguranca/robustez, obriga a validar dados no backend e a tratar erros previsiveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-03.

##### O que entra (scope)

- Definir enum canonico dos papeis Admin, Gestor, Contabilista, Operacional e Auditor.
- Criar helper ou middleware requireRole para proteger endpoints.
- Criar mapa inicial de permissao por dominio sem inventar acoes nao previstas.
- Expor ao frontend o papel do utilizador autenticado.
- Preparar mensagens de acesso negado claras.

##### O que nao entra (scope-out)

- Multiempresa com papeis diferentes por empresa, porque pertence ao BK-MF0-03.
- Convites e remocao de utilizadores, porque pertencem ao BK-MF0-04.
- Auditoria completa de operacoes sensiveis, porque sera reforcada em MF4/MF6.
- Permissoes ultra-granulares nao descritas nos RF/RNF.

##### Como saber que isto ficou bem

- O caso principal de Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor) funciona atraves da UI ou de chamadas API documentadas.
- Os endpoints definidos respondem com codigos HTTP previsiveis e sem expor dados sensiveis.
- Os validadores rejeitam entradas invalidas antes de chegar a persistencia.
- A evidence inclui smoke, negativos, ficheiros alterados e comandos executados.
- Nao existe ALTERACAO DE CONTRATO face aos documentos canonicos; se surgir, deve ser marcada e justificada.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO; nao marcar DONE apenas por o guia estar detalhado)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Oleksii` (CANONICO)
- Apoio: `Andre` (CANONICO)
- Dependencias (BK IDs): `BK-MF0-01` (CANONICO)
- Pre-condicoes: Depende de BK-MF0-01. App real pode ainda nao existir; nesse caso criar a estrutura tecnica assumida antes dos ficheiros alvo. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-RBAC` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF02` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor). (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK usa essa stack apenas como assuncao tecnica ate existir scaffold real.
- Mockup usado: `mockup/` existe e foi usado como referencia de fluxo, hierarquia e nomes visiveis; nao e contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: O BK-MF0-01 ja deve disponibilizar utilizador autenticado em req.user.
- Estado esperado depois do BK: A app tem papeis canonicos e uma primeira camada de autorizacao reutilizavel por backend e frontend.
- Ficheiros a criar/editar/rever: schema Prisma, modulo backend `identidade`, cliente API frontend e componentes/paginas referenciados em `mockup/src/app/components/Layout.tsx e mockup/src/app/components/modules/Configuracoes.tsx`.
- Dependencias de BK anteriores e uso: Depende de BK-MF0-01.
- Impacto na arquitetura: reforca separacao entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicavel.
- Impacto backend/dados: cria ou prepara `Role, PermissionPolicy` e endpoints `GET /api/auth/me, GET /api/permissions/me`.
- Impacto seguranca: valida inputs no backend, aplica sessao/permissao quando aplicavel e evita exposicao de dados sensiveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-03 deve reutilizar os contratos aqui criados.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `README.md` seccoes 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptacao de caminhos.
- `docs/RF.md` linha do requisito `RF02`.
- `docs/RNF.md` seccoes RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicavel.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/Layout.tsx e mockup/src/app/components/modules/Configuracoes.tsx`.
- BK anterior obrigatorio: `BK-MF0-01`, sobretudo os contratos de sessao/role/empresa.

#### Glossario (rapido) (DERIVADO):

- **RBAC:** Role-Based Access Control: autorizacao baseada no papel do utilizador.
- **Role:** Papel funcional, como Admin ou Contabilista.
- **Permissao:** A capacidade de executar uma acao concreta num recurso.
- **403:** Codigo HTTP para utilizador autenticado sem autorizacao.
- **Guard:** Funcao que bloqueia acesso quando a regra nao e cumprida.

#### Conceitos teoricos essenciais (DERIVADO):

- Autenticacao responde a pergunta “quem e o utilizador?”. Autorizacao responde “o que pode fazer?”. Este BK trabalha a segunda pergunta.
- O backend deve aplicar permissoes mesmo que o frontend esconda botoes. Esconder botoes melhora UX, mas nao e barreira de seguranca.
- Um middleware requireRole permite reutilizar a mesma verificacao em varios endpoints sem duplicar codigo nos controllers.
- As roles canonicas vêm diretamente de RF02; nao devem ser renomeadas para evitar drift entre docs, codigo e defesa.
- **Erros comuns a evitar:** implementar so no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens tecnicas cruas ao utilizador ou criar campos que nao aparecem nos RF/RNF.
- **Negativos de seguranca/robustez:** todos os casos invalidos devem falhar de forma controlada, sem stack traces, sem dados sensiveis e sem escrita parcial na base de dados.

#### Tutorial tecnico linear (DERIVADO):

Este tutorial organiza o BK em passos lineares. O aluno deve seguir de cima para baixo: confirmar contratos, modelar dados, validar entradas, implementar regras de negocio, expor HTTP, testar e deixar handoff. Sempre que o scaffold real ainda nao existir, usar a estrutura prevista em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e registar a adaptacao na evidence.

### Passo 1 - Confirmar contrato, scope e ligacao aos BKs vizinhos

1. Objetivo funcional do passo no ERP.

Confirmar a regra de negocio do BK, o RF/RNF associado e o impacto nos BKs seguintes antes de escrever codigo.

2. Ficheiros envolvidos:
   - CRIAR:
   - Nenhum ficheiro novo neste passo.
   - EDITAR:
   - Nenhum ficheiro existente neste passo.
   - LOCALIZACAO:
   - Topo deste guia e documentos canonicos de planeamento.
   - REVER:
   - README.md
   - docs/RF.md
   - docs/RNF.md
   - docs/planificacao/backlogs/BACKLOG-MVP.md
   - docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md
   - docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md
   - docs/planificacao/backlogs/MF-VIEWS.md
   - docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md

3. Instrucoes do que fazer.

Confirma que nao vais alterar RF, RNF, ID do BK, owner, prioridade ou dependencias. Se o scaffold real divergir de `apps/api` e `apps/web`, adapta caminhos sem alterar contratos de negocio e regista essa decisao na evidence.

4. Codigo completo, correto e integrado com a app final.

Sem codigo neste passo. O objetivo e impedir drift antes da implementacao.

5. Explicacao didatica e detalhada do codigo.

Este passo existe para evitar que o aluno comece por copiar codigo sem perceber o contrato. Num ERP, uma decisao errada no inicio, por exemplo tratar role como global ou ignorar companyId, propaga erros para faturacao, compras, stock e contabilidade.

6. Validacao do passo.

Antes de avancar, escreve na evidence qual RF/RNF cobre este BK e que BK seguinte depende dele.

7. Cenario negativo/erro esperado.

Se encontrares uma regra que nao aparece em RF/RNF/backlog, nao a implementes: marca como decisao em falta no Passo 7.

### Passo 2 - Modelar dados e constraints na base de dados

1. Objetivo funcional do passo no ERP.

Criar a estrutura persistente que suporta a regra do BK sem duplicados, estados impossiveis ou fuga entre empresas.

2. Ficheiros envolvidos:
   - CRIAR:
   - Nenhum ficheiro novo neste passo.
   - EDITAR:
   - apps/api/prisma/schema.prisma
   - LOCALIZACAO:
   - Inserir os modelos junto dos modelos do mesmo dominio; quando o BK disser para atualizar um modelo existente, substituir o bloco antigo por uma versao coerente.
   - REVER:
   - docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md
   - BKs anteriores da MF0 que criam modelos reutilizados.

3. Instrucoes do que fazer.

Aplica primeiro o schema. Se o modelo pertencer a uma empresa, usa `companyId` e indices/constraints por empresa. Se o modelo atualizar `User`, `Company` ou `Session`, faz a substituicao completa indicada para evitar campos duplicados ou relacoes partidas.

4. Codigo completo, correto e integrado com a app final.

Localizacao: acrescentar a `apps/api/prisma/schema.prisma`, antes dos modelos que usam roles.

```prisma
enum Role {
  ADMIN
  GESTOR
  CONTABILISTA
  OPERACIONAL
  AUDITOR
}
```

5. Explicacao didatica e detalhada do codigo.

O schema e a camada mais baixa de integridade. Mesmo que o frontend tenha boas validacoes, a base de dados deve impedir duplicados e relacoes impossiveis. Em OPSA isto e critico porque clientes, fornecedores, artigos, contas SNC, periodos fiscais e armazens alimentam documentos fiscais e contabilisticos futuros.

6. Validacao do passo.

Executa a geracao/migracao Prisma quando o scaffold existir e confirma que nao ha nomes de modelos ou relacoes duplicados.

7. Cenario negativo/erro esperado.

Tentar criar dois registos que violam uma constraint unica deve falhar com conflito controlado, normalmente `409` no service/controller.

### Passo 3 - Criar validadores, helpers e adaptadores de infraestrutura

1. Objetivo funcional do passo no ERP.

Validar entradas antes da regra de negocio e isolar detalhes tecnicos como cookies, hash, email ou permissao.

2. Ficheiros envolvidos:
   - CRIAR:
   - apps/api/src/modules/permissions/permissions.js
   - EDITAR:
   - Nenhum ficheiro existente neste passo.
   - LOCALIZACAO:
   - Criar dentro do modulo do dominio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por varios BKs.
   - REVER:
   - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instrucoes do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados ja normalizados e nao devem repetir regex ou parse manual espalhado pelo codigo.

4. Codigo completo, correto e integrado com a app final.

Localizacao: criar `apps/api/src/modules/permissions/permissions.js`.

```js
export const Permission = Object.freeze({
  USERS_MANAGE: "users.manage",
  COMPANY_READ: "company.read",
  COMPANY_WRITE: "company.write",
  ACCOUNTING_READ: "accounting.read",
  ACCOUNTING_WRITE: "accounting.write",
  FISCAL_PERIODS_READ: "fiscal-periods.read",
  FISCAL_PERIODS_MANAGE: "fiscal-periods.manage",
  CUSTOMERS_WRITE: "customers.write",
  SUPPLIERS_WRITE: "suppliers.write",
  ITEMS_WRITE: "items.write",
  WAREHOUSES_WRITE: "warehouses.write",
});

const rolePermissions = {
  ADMIN: Object.values(Permission),
  GESTOR: [
    Permission.USERS_MANAGE,
    Permission.COMPANY_READ,
    Permission.COMPANY_WRITE,
    Permission.FISCAL_PERIODS_READ,
    Permission.FISCAL_PERIODS_MANAGE,
    Permission.CUSTOMERS_WRITE,
    Permission.SUPPLIERS_WRITE,
    Permission.ITEMS_WRITE,
    Permission.WAREHOUSES_WRITE,
  ],
  CONTABILISTA: [
    Permission.COMPANY_READ,
    Permission.COMPANY_WRITE,
    Permission.ACCOUNTING_READ,
    Permission.ACCOUNTING_WRITE,
    Permission.FISCAL_PERIODS_READ,
    Permission.FISCAL_PERIODS_MANAGE,
    Permission.SUPPLIERS_WRITE,
  ],
  OPERACIONAL: [
    Permission.COMPANY_READ,
    Permission.CUSTOMERS_WRITE,
    Permission.SUPPLIERS_WRITE,
    Permission.ITEMS_WRITE,
    Permission.WAREHOUSES_WRITE,
  ],
  AUDITOR: [
    Permission.COMPANY_READ,
    Permission.ACCOUNTING_READ,
    Permission.FISCAL_PERIODS_READ,
  ],
};

export function getPermissionsForRole(role) {
  return rolePermissions[role] ?? [];
}

export function hasPermission(role, permission) {
  return getPermissionsForRole(role).includes(permission);
}
```

5. Explicacao didatica e detalhada do codigo.

Validadores e helpers tornam o codigo mais facil de testar e explicar. Um aluno consegue perceber que validar NIF, email, datas ou dinheiro nao e detalhe visual: e defesa da integridade da empresa e da contabilidade.

6. Validacao do passo.

Testa payloads invalidos diretamente contra as funcoes ou endpoint e confirma resposta `400` com mensagem clara.

7. Cenario negativo/erro esperado.

Um payload mal formado nao pode chegar ao Prisma; deve parar no validator com `400`.

### Passo 4 - Implementar services e middleware de regra de negocio

1. Objetivo funcional do passo no ERP.

Concentrar a regra do ERP em funcoes testaveis, separadas de HTTP e frontend.

2. Ficheiros envolvidos:
   - CRIAR:
   - apps/api/src/modules/permissions/permissionMiddleware.js
   - EDITAR:
   - Nenhum ficheiro existente neste passo.
   - LOCALIZACAO:
   - Criar no modulo backend do dominio; middlewares reutilizaveis ficam junto do dominio que fornece o contexto.
   - REVER:
   - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissoes, User, Company ou dados mestre.

3. Instrucoes do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessao/contexto, nunca do body. Quando houver role/permissao, garante que a rota chama o guard antes do service.

4. Codigo completo, correto e integrado com a app final.

Localizacao: criar `apps/api/src/modules/permissions/permissionMiddleware.js`.

```js
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { hasPermission } from "./permissions.js";

export function requireRole(...allowedRoles) {
  return function roleMiddleware(req, res, next) {
    try {
      if (!req.user) throw httpError(401, "SESSION_REQUIRED", "Sessao obrigatoria");
      if (!allowedRoles.includes(req.role)) {
        throw httpError(403, "ROLE_FORBIDDEN", "Papel sem acesso a esta operacao");
      }

      return next();
    } catch (error) {
      const httpErrorResponse = toHttpError(error);
      return res.status(httpErrorResponse.status).json({
        error: httpErrorResponse.code,
        message: httpErrorResponse.message,
      });
    }
  };
}

export function requirePermission(permission) {
  return function permissionMiddleware(req, res, next) {
    try {
      if (!req.user) throw httpError(401, "SESSION_REQUIRED", "Sessao obrigatoria");
      if (!req.role || !hasPermission(req.role, permission)) {
        throw httpError(403, "PERMISSION_FORBIDDEN", "Permissao insuficiente");
      }

      return next();
    } catch (error) {
      const httpErrorResponse = toHttpError(error);
      return res.status(httpErrorResponse.status).json({
        error: httpErrorResponse.code,
        message: httpErrorResponse.message,
      });
    }
  };
}
```

5. Explicacao didatica e detalhada do codigo.

O service e onde vive a regra de negocio. Isto evita controllers gigantes e impede que a UI seja a unica barreira de seguranca. Em OPSA, esta separacao ajuda a garantir que IA, frontend ou scripts futuros nao alteram dados contabilisticos sem passar pelas mesmas regras.

6. Validacao do passo.

Testa o service com dados validos e invalidos. Confirma que queries usam `companyId` quando aplicavel e que estados sensiveis devolvem `409` ou `403` conforme o caso.

7. Cenario negativo/erro esperado.

Tentar aceder a dados de outra empresa, ou executar uma acao sem permissao, deve falhar sem expor dados existentes.

### Passo 5 - Expor controllers, rotas e registo no servidor

1. Objetivo funcional do passo no ERP.

Transformar a regra de negocio em API HTTP previsivel para o frontend e para testes.

2. Ficheiros envolvidos:
   - CRIAR:
   - apps/api/src/modules/permissions/permissionsController.js
   - apps/api/src/modules/permissions/permissionsRoutes.js
   - EDITAR:
   - apps/api/src/server.js
   - LOCALIZACAO:
   - Controllers e routes ficam no modulo do dominio; o `server.js` apenas monta o router no prefixo `/api/...`.
   - REVER:
   - docs/RNF.md: RNF25 e RNF28
   - Contratos de endpoints indicados no header do BK.

3. Instrucoes do que fazer.

Cria controllers finos: ler request, chamar validator/service e traduzir erros para HTTP. Regista o router no servidor sem misturar regra de negocio no `server.js`.

4. Codigo completo, correto e integrado com a app final.

Localizacao: criar `apps/api/src/modules/permissions/permissionsController.js`.

```js
import { getPermissionsForRole } from "./permissions.js";

export function buildPermissionsController() {
  return {
    me(req, res) {
      return res.status(200).json({
        userId: req.user.id,
        companyId: req.companyId ?? null,
        role: req.role ?? null,
        permissions: getPermissionsForRole(req.role),
      });
    },
  };
}
```

Localizacao: criar `apps/api/src/modules/permissions/permissionsRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { buildPermissionsController } from "./permissionsController.js";

export function buildPermissionsRoutes({ prisma }) {
  const router = Router();
  const controller = buildPermissionsController();

  // O BK-MF0-03 exporta uma factory; aqui instanciamos o middleware com prisma.
  router.get("/me", requireAuth(prisma), requireCompanyContext(prisma), controller.me);

  return router;
}
```

Localizacao: editar `apps/api/src/server.js`, junto das rotas.

```js
import { buildPermissionsRoutes } from "./modules/permissions/permissionsRoutes.js";

app.use("/api/permissions", buildPermissionsRoutes({ prisma }));
```

5. Explicacao didatica e detalhada do codigo.

A API e o contrato entre backend e frontend. Ao manter controller pequeno, o aluno percebe onde colocar cada responsabilidade: validacao no validator, regra no service, transporte HTTP no controller/route.

6. Validacao do passo.

Chama o endpoint principal com payload valido e confirma status `200` ou `201` conforme a operacao.

7. Cenario negativo/erro esperado.

Sem sessao, sem empresa ativa ou sem permissao, o endpoint deve devolver `401` ou `403` antes de chamar o service.

### Passo 6 - Validar payloads, respostas e cenarios negativos

1. Objetivo funcional do passo no ERP.

Demonstrar que o BK funciona para o caso principal e falha bem nos casos perigosos.

2. Ficheiros envolvidos:
   - CRIAR:
   - docs/evidence/<BK_ID>.md quando a equipa fechar o BK.
   - EDITAR:
   - Nenhum ficheiro existente neste passo.
   - LOCALIZACAO:
   - Evidence do PR/defesa e testes automatizados quando existirem.
   - REVER:
   - Payloads e negativos abaixo.
   - docs/planificacao/sprints/PLANO-SPRINTS.md quando existir planeamento de sprint.

3. Instrucoes do que fazer.

Executa primeiro o smoke principal e depois os negativos. Guarda status HTTP, payload enviado e resposta recebida. Nao marques DONE sem evidence.

4. Codigo completo, correto e integrado com a app final.

Pedido `GET /api/permissions/me`: sem body, com cookie valido e empresa ativa depois do `BK-MF0-03`.

Resposta `200`:

```json
{
  "userId": "uuid-utilizador",
  "companyId": "uuid-empresa",
  "role": "GESTOR",
  "permissions": [
    "users.manage",
    "company.read",
    "company.write",
    "fiscal-periods.manage"
  ]
}
```

Erros esperados:

- `401 SESSION_REQUIRED`: sem sessao.
- `403 ROLE_FORBIDDEN`: papel fora dos papeis permitidos.
- `403 PERMISSION_FORBIDDEN`: papel existe, mas nao tem permissao para a acao.
- `404` nao se aplica a este endpoint; nos endpoints de negocio deve aparecer quando o recurso da empresa ativa nao existe.

- Chamar `GET /api/permissions/me` sem cookie deve devolver `401`.
- Tentar executar uma rota protegida com `AUDITOR` em operacao de escrita deve devolver `403`.
- Tentar chamar permissao sem empresa ativa, depois do `BK-MF0-03`, deve devolver `403`.

- Teste unitario da matriz: `hasPermission("AUDITOR", Permission.CUSTOMERS_WRITE)` deve ser `false`.
- Smoke manual: iniciar sessao, selecionar empresa no BK-MF0-03 e confirmar que `GET /api/permissions/me` devolve o papel esperado.
- Regressao: proteger uma rota temporaria de teste com `requirePermission(Permission.USERS_MANAGE)` e validar `403` para papel sem acesso.

#

5. Explicacao didatica e detalhada do codigo.

Testar negativos ensina que seguranca nao e so o caminho feliz. Um ERP deve recusar dados fiscais invalidos, acessos sem role, conflitos de unicidade e alteracoes em periodos fechados de forma previsivel.

6. Validacao do passo.

A evidence deve mostrar pelo menos o smoke principal, os negativos exigidos pela prioridade e qualquer comando executado.

7. Cenario negativo/erro esperado.

Se um erro devolve stack trace, segredo, dados de outra empresa ou status generico errado, o BK ainda nao esta pronto.

### Passo 7 - Registar decisoes em falta, evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar o BK como tutorial tecnico que o proximo aluno consegue continuar sem adivinhar contratos.

2. Ficheiros envolvidos:
   - CRIAR:
   - docs/evidence/<BK_ID>.md ou descricao equivalente no PR.
   - EDITAR:
   - Secao Evidence deste guia apenas quando houver PR/defesa real.
   - LOCALIZACAO:
   - Fim do guia: criterios, validacao final, evidence, handoff e changelog.
   - REVER:
   - BK seguinte indicado em `proximo_bk` e BKs dependentes futuros.

3. Instrucoes do que fazer.

Se falta fonte documental ou decisao de arquitetura, nao inventes. Regista exatamente o que falta confirmar e qual o impacto. Depois escreve o handoff para o BK seguinte.

4. Codigo completo, correto e integrado com a app final.

Decisoes em falta a manter visiveis durante a implementacao:

- O mapeamento acima e o minimo derivado de RF02 e dos BKs MF0. Se a matriz oficial de permissoes for criada noutro documento, este ficheiro deve ser revisto para ficar canonico.

5. Explicacao didatica e detalhada do codigo.

O handoff protege continuidade. Num projeto PAP com varios alunos, a qualidade nao esta so no codigo: esta tambem em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o proximo BK pode reutilizar.

6. Validacao do passo.

Confirma que o final do BK contem apenas criterios de aceite, validacao final, evidence, handoff e changelog.

7. Cenario negativo/erro esperado.

Se o handoff diz para usar algo que nao foi criado neste BK ou num BK anterior, ha contrato partido e deve ser corrigido antes de avancar.


## Criterios de aceite

- O BK-MF0-02 cumpre os criterios mensuraveis definidos acima.
- O contrato canonico do RF02 continua alinhado com backlog, matriz e MF-VIEWS.

## Validacao final

- Executar o smoke principal descrito no Passo 6.
- Executar todos os cenarios negativos do Passo 6.
- Confirmar que os ficheiros do Passo 2 ao Passo 5 existem nos caminhos reais da app ou que a adaptacao ficou documentada na evidence.
- Confirmar que nao houve drift em RF/RNF, owner, prioridade, dependencias ou escopo.
- Confirmar que o handoff abaixo esta compreensivel para o proximo BK.

## Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`

## Handoff

O proximo BK deve substituir qualquer role global por role por empresa. A partir dai, `req.role` deve vir da membership da empresa ativa, nao do utilizador global.

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executavel, com continuidade MF0, mockup, negativos, criterios e evidence.
- `2026-04-19`: metadados canonicos preservados da vaga de normalizacao.
