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

Neste BK vamos transformar o requisito RF02 num guia de execução para construir a parte da app relacionada com identidade. O foco não é produzir documentação genérica: é deixar claro que modelos, endpoints, validações, UI e evidência devem existir quando a equipa implementar o BK.

A app real ainda está marcada como `sem_codigo`; por isso, os caminhos técnicos propostos seguem o contrato central `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`. Esse contrato define a stack assumida, a estrutura indicativa e a regra de adaptação quando existir scaffold real, sem alterar RF, BK, owners, dependências ou critérios de aceite.

Como a fase alvo é MF0, não existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estáveis para BK-MF0-03 e para os BKs de vendas, compras, inventário, contabilidade e segurança das fases seguintes.

##### Porque é que isto é importante

- Funcionalmente, cobre RF02 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de Role, PermissionPolicy e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligação entre requisito, modelo, endpoint, UI, teste e evidence.
- Em segurança/robustez, obriga a validar dados no backend e a tratar erros previsíveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-03.

##### O que entra (scope)

- Definir enum canónico dos papéis Admin, Gestor, Contabilista, Operacional e Auditor.
- Criar helper ou middleware requireRole para proteger endpoints.
- Criar mapa inicial de permissão por domínio sem inventar ações não previstas.
- Expor ao frontend o papel do utilizador autenticado.
- Preparar mensagens de acesso negado claras.

##### O que não entra (scope-out)

- Multiempresa com papéis diferentes por empresa, porque pertence ao BK-MF0-03.
- Convites e remoção de utilizadores, porque pertencem ao BK-MF0-04.
- Auditoria completa de operações sensíveis, porque será reforçada em MF4/MF6.
- Permissões ultra-granulares não descritas nos RF/RNF.

##### Como saber que isto ficou bem

- O caso principal de Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor) funciona através da UI ou de chamadas API documentadas.
- Os endpoints definidos respondem com códigos HTTP previsíveis e sem expor dados sensíveis.
- Os validadores rejeitam entradas inválidas antes de chegar a persistência.
- A evidence inclui smoke, negativos, ficheiros alterados e comandos executados.
- Não existe ALTERAÇÃO DE CONTRATO face aos documentos canónicos; se surgir, deve ser marcada e justificada.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO; não marcar DONE apenas por o guia estar detalhado)
- Esforço: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Oleksii` (CANONICO)
- Apoio: `Andre` (CANONICO)
- Dependências (BK IDs): `BK-MF0-01` (CANONICO)
- Pré-condições: Depende de BK-MF0-01. App real pode ainda não existir; nesse caso criar a estrutura técnica assumida antes dos ficheiros alvo. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-RBAC` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF02` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descrição: Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor). (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK usa essa stack apenas como assunção técnica até existir scaffold real.
- Mockup usado: `mockup/` existe e foi usado como referência de fluxo, hierarquia e nomes visíveis; não é contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: O BK-MF0-01 já deve disponibilizar utilizador autenticado em req.user.
- Estado esperado depois do BK: A app tem papéis canónicos e uma primeira camada de autorização reutilizável por backend e frontend.
- Ficheiros a criar/editar/rever: schema Prisma, módulo backend `identidade`, cliente API frontend e componentes/páginas referenciados em `mockup/src/app/components/Layout.tsx e mockup/src/app/components/modules/Configuracoes.tsx`.
- Dependências de BK anteriores e uso: Depende de BK-MF0-01.
- Impacto na arquitetura: reforça separação entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicável.
- Impacto backend/dados: cria ou prepara `Role, PermissionPolicy` e endpoints `GET /api/auth/me, GET /api/permissions/me`.
- Impacto segurança: valida inputs no backend, aplica sessão/permissão quando aplicável e evita exposição de dados sensíveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-03 deve reutilizar os contratos aqui criados.

#### Pré-leitura mínima (10-15 min) (DERIVADO):

- `README.md` secções 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptação de caminhos.
- `docs/RF.md` linha do requisito `RF02`.
- `docs/RNF.md` secções RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicável.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/Layout.tsx e mockup/src/app/components/modules/Configuracoes.tsx`.
- BK anterior obrigatório: `BK-MF0-01`, sobretudo os contratos de sessão/role/empresa.

#### Glossário (rápido) (DERIVADO):

- **RBAC:** Role-Based Access Control: autorização baseada no papel do utilizador.
- **Role:** Papel funcional, como Admin ou Contabilista.
- **Permissão:** A capacidade de executar uma ação concreta num recurso.
- **403:** Código HTTP para utilizador autenticado sem autorização.
- **Guard:** Função que bloqueia acesso quando a regra não é cumprida.

#### Conceitos teóricos essenciais (DERIVADO):

- Autenticação responde a pergunta “quem é o utilizador?”. Autorização responde “o que pode fazer?”. Este BK trabalha a segunda pergunta.
- O backend deve aplicar permissões mesmo que o frontend esconda botões. Esconder botões melhora UX, mas não é barreira de segurança.
- Um middleware requireRole permite reutilizar a mesma verificação em vários endpoints sem duplicar código nos controllers.
- As roles canónicas vêm diretamente de RF02; não devem ser renomeadas para evitar drift entre docs, código e defesa.
- **Erros comuns a evitar:** implementar só no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens técnicas cruas ao utilizador ou criar campos que não aparecem nos RF/RNF.
- **Negativos de segurança/robustez:** todos os casos inválidos devem falhar de forma controlada, sem stack traces, sem dados sensíveis e sem escrita parcial na base de dados.

#### Tutorial técnico linear (DERIVADO):

Este tutorial organiza o BK em passos lineares. O aluno deve seguir de cima para baixo: confirmar contratos, modelar dados, validar entradas, implementar regras de negócio, expor HTTP, testar e deixar handoff. Sempre que o scaffold real ainda não existir, usar a estrutura prevista em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e registar a adaptação na evidence.

### Passo 1 - Confirmar contrato, scope e ligação aos BKs vizinhos

1. Objetivo funcional do passo no ERP.

Confirmar a regra de negócio do BK, o RF/RNF associado e o impacto nos BKs seguintes antes de escrever código.

2. Ficheiros envolvidos:
    - CRIAR:
    - Nenhum ficheiro novo neste passo.
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Topo deste guia e documentos canónicos de planeamento.
    - REVER:
    - README.md
    - docs/RF.md
    - docs/RNF.md
    - docs/planificacao/backlogs/BACKLOG-MVP.md
    - docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md
    - docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md
    - docs/planificacao/backlogs/MF-VIEWS.md
    - docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md

3. Instruções do que fazer.

Confirma que não vais alterar RF, RNF, ID do BK, owner, prioridade ou dependências. Se o scaffold real divergir de `apps/api` e `apps/web`, adapta caminhos sem alterar contratos de negócio e regista essa decisão na evidence.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O objetivo é impedir drift antes da implementação.

5. Explicação do código.

Este passo existe para evitar que o aluno comece por copiar código sem perceber o contrato. Num ERP, uma decisão errada no inicio, por exemplo tratar role como global ou ignorar companyId, propaga erros para faturação, compras, stock e contabilidade.

6. Validação do passo.

Antes de avançar, escreve na evidence qual RF/RNF cobre este BK e que BK seguinte depende dele.

7. Cenário negativo/erro esperado.

Se encontrares uma regra que não aparece em RF/RNF/backlog, não a implementes: marca como decisão em falta no Passo 7.

### Passo 2 - Modelar dados e constraints na base de dados

1. Objetivo funcional do passo no ERP.

Criar a estrutura persistente que suporta a regra do BK sem duplicados, estados impossíveis ou fuga entre empresas.

2. Ficheiros envolvidos:
    - CRIAR:
    - Nenhum ficheiro novo neste passo.
    - EDITAR:
    - apps/api/prisma/schema.prisma
    - LOCALIZACAO:
    - Inserir os modelos junto dos modelos do mesmo domínio; quando o BK disser para atualizar um modelo existente, substituir o bloco antigo por uma versão coerente.
    - REVER:
    - docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md
    - BKs anteriores da MF0 que criam modelos reutilizados.

3. Instruções do que fazer.

Aplica primeiro o schema. Se o modelo pertencer a uma empresa, usa `companyId` e indices/constraints por empresa. Se o modelo atualizar `User`, `Company` ou `Session`, faz a substituição completa indicada para evitar campos duplicados ou relações partidas.

4. Código completo, correto e integrado com a app final.

Localização: acrescentar a `apps/api/prisma/schema.prisma`, antes dos modelos que usam roles.

```prisma
enum Role {
  ADMIN
  GESTOR
  CONTABILISTA
  OPERACIONAL
  AUDITOR
}
```

5. Explicação do código.

O schema é a camada mais baixa de integridade. Mesmo que o frontend tenha boas validações, a base de dados deve impedir duplicados e relações impossíveis. Em OPSA isto é crítico porque clientes, fornecedores, artigos, contas SNC, períodos fiscais e armazéns alimentam documentos fiscais e contabilísticos futuros.

6. Validação do passo.

Executa a geração/migração Prisma quando o scaffold existir e confirma que não há nomes de modelos ou relações duplicados.

7. Cenário negativo/erro esperado.

Tentar criar dois registos que violam uma constraint única deve falhar com conflito controlado, normalmente `409` no service/controller.

### Passo 3 - Criar validadores, helpers e adaptadores de infraestrutura

1. Objetivo funcional do passo no ERP.

Validar entradas antes da regra de negócio e isolar detalhes técnicos como cookies, hash, email ou permissão.

2. Ficheiros envolvidos:
    - CRIAR:
    - apps/api/src/modules/permissions/permissions.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar dentro do módulo do domínio em `apps/api/src/modules/...`; helpers partilhados ficam em `apps/api/src/lib` quando usados por vários BKs.
    - REVER:
    - docs/RNF.md: RNF05, RNF06, RNF12-RNF17, RNF21 quando existir email.

3. Instruções do que fazer.

Cria estes ficheiros antes dos services. Os services devem receber dados já normalizados e não devem repetir regex ou parse manual espalhado pelo código.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/permissions/permissions.js`.

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

5. Explicação do código.

Validadores e helpers tornam o código mais fácil de testar e explicar. Um aluno consegue perceber que validar NIF, email, datas ou dinheiro não é detalhe visual: é defesa da integridade da empresa e da contabilidade.

6. Validação do passo.

Testa payloads inválidos diretamente contra as funções ou endpoint e confirma resposta `400` com mensagem clara.

7. Cenário negativo/erro esperado.

Um payload mal formado não pode chegar ao Prisma; deve parar no validator com `400`.

### Passo 4 - Implementar services e middleware de regra de negócio

1. Objetivo funcional do passo no ERP.

Concentrar a regra do ERP em funções testáveis, separadas de HTTP e frontend.

2. Ficheiros envolvidos:
    - CRIAR:
    - apps/api/src/modules/permissions/permissionMiddleware.js
    - EDITAR:
    - Nenhum ficheiro existente neste passo.
    - LOCALIZACAO:
    - Criar no módulo backend do domínio; middlewares reutilizáveis ficam junto do domínio que fornece o contexto.
    - REVER:
    - BKs anteriores que fornecem `requireAuth`, `requireCompanyContext`, permissões, User, Company ou dados mestre.

3. Instruções do que fazer.

Implementa services depois dos validadores. Quando houver dados empresariais, recebe sempre `companyId` vindo da sessão/contexto, nunca do body. Quando houver role/permissão, garante que a rota chama o guard antes do service.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/permissions/permissionMiddleware.js`.

```js
import { httpError, toHttpError } from "../../lib/httpErrors.js";
import { hasPermission } from "./permissions.js";

export function requireRole(...allowedRoles) {
    return function roleMiddleware(req, res, next) {
        try {
            if (!req.user)
                throw httpError(401, "SESSION_REQUIRED", "Sessão obrigatória");
            if (!allowedRoles.includes(req.role)) {
                throw httpError(
                    403,
                    "ROLE_FORBIDDEN",
                    "Papel sem acesso a esta operação",
                );
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
            if (!req.user)
                throw httpError(401, "SESSION_REQUIRED", "Sessão obrigatória");
            if (!req.role || !hasPermission(req.role, permission)) {
                throw httpError(
                    403,
                    "PERMISSION_FORBIDDEN",
                    "Permissão insuficiente",
                );
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

5. Explicação do código.

O service é onde vive a regra de negócio. Isto evita controllers gigantes e impede que a UI seja a única barreira de segurança. Em OPSA, esta separação ajuda a garantir que IA, frontend ou scripts futuros não alteram dados contabilísticos sem passar pelas mesmas regras.

6. Validação do passo.

Testa o service com dados válidos e inválidos. Confirma que queries usam `companyId` quando aplicável e que estados sensíveis devolvem `409` ou `403` conforme o caso.

7. Cenário negativo/erro esperado.

Tentar aceder a dados de outra empresa, ou executar uma ação sem permissão, deve falhar sem expor dados existentes.

### Passo 5 - Expor controllers, rotas e registo no servidor

1. Objetivo funcional do passo no ERP.

Transformar a regra de negócio em API HTTP previsível para o frontend e para testes.

2. Ficheiros envolvidos:
    - CRIAR:
    - apps/api/src/modules/permissions/permissionsController.js
    - apps/api/src/modules/permissions/permissionsRoutes.js
    - EDITAR:
    - apps/api/src/server.js
    - LOCALIZACAO:
    - Controllers e routes ficam no módulo do domínio; o `server.js` apenas monta o router no prefixo `/api/...`.
    - REVER:
    - docs/RNF.md: RNF25 e RNF28
    - Contratos de endpoints indicados no header do BK.

3. Instruções do que fazer.

Cria controllers finos: ler request, chamar validator/service e traduzir erros para HTTP. Regista o router no servidor sem misturar regra de negócio no `server.js`.

4. Código completo, correto e integrado com a app final.

Localização: criar `apps/api/src/modules/permissions/permissionsController.js`.

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

Localização: criar `apps/api/src/modules/permissions/permissionsRoutes.js`.

```js
import { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { buildPermissionsController } from "./permissionsController.js";

export function buildPermissionsRoutes({ prisma }) {
    const router = Router();
    const controller = buildPermissionsController();

    // O BK-MF0-03 exporta uma factory; aqui instanciamos o middleware com prisma.
    router.get(
        "/me",
        requireAuth(prisma),
        requireCompanyContext(prisma),
        controller.me,
    );

    return router;
}
```

Localização: editar `apps/api/src/server.js`, junto das rotas.

```js
import { buildPermissionsRoutes } from "./modules/permissions/permissionsRoutes.js";

app.use("/api/permissions", buildPermissionsRoutes({ prisma }));
```

5. Explicação do código.

A API é o contrato entre backend e frontend. Ao manter controller pequeno, o aluno percebe onde colocar cada responsabilidade: validação no validator, regra no service, transporte HTTP no controller/route.

6. Validação do passo.

Chama o endpoint principal com payload válido e confirma status `200` ou `201` conforme a operação.

7. Cenário negativo/erro esperado.

Sem sessão, sem empresa ativa ou sem permissão, o endpoint deve devolver `401` ou `403` antes de chamar o service.

### Passo 6 - Validar payloads, respostas e cenários negativos

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

3. Instruções do que fazer.

Executa primeiro o smoke principal e depois os negativos. Guarda status HTTP, payload enviado e resposta recebida. Não marques DONE sem evidence.

4. Código completo, correto e integrado com a app final.

Pedido `GET /api/permissions/me`: sem body, com cookie válido e empresa ativa depois do `BK-MF0-03`.

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

- `401 SESSION_REQUIRED`: sem sessão.
- `403 ROLE_FORBIDDEN`: papel fora dos papéis permitidos.
- `403 PERMISSION_FORBIDDEN`: papel existe, mas não tem permissão para a ação.
- `404` não se aplica a este endpoint; nos endpoints de negócio deve aparecer quando o recurso da empresa ativa não existe.

- Chamar `GET /api/permissions/me` sem cookie deve devolver `401`.
- Tentar executar uma rota protegida com `AUDITOR` em operação de escrita deve devolver `403`.
- Tentar chamar permissão sem empresa ativa, depois do `BK-MF0-03`, deve devolver `403`.

- Teste unitário da matriz: `hasPermission("AUDITOR", Permission.CUSTOMERS_WRITE)` deve ser `false`.
- Smoke manual: iniciar sessão, selecionar empresa no BK-MF0-03 e confirmar que `GET /api/permissions/me` devolve o papel esperado.
- Regressão: proteger uma rota temporária de teste com `requirePermission(Permission.USERS_MANAGE)` e validar `403` para papel sem acesso.

#

5. Explicação do código.

Testar negativos ensina que segurança não é só o caminho feliz. Um ERP deve recusar dados fiscais inválidos, acessos sem role, conflitos de unicidade e alterações em períodos fechados de forma previsível.

6. Validação do passo.

A evidence deve mostrar pelo menos o smoke principal, os negativos exigidos pela prioridade e qualquer comando executado.

7. Cenário negativo/erro esperado.

Se um erro devolve stack trace, segredo, dados de outra empresa ou status genérico errado, o BK ainda não está pronto.

### Passo 7 - Registar decisões em falta, evidence e handoff

1. Objetivo funcional do passo no ERP.

Fechar o BK como tutorial técnico que o próximo aluno consegue continuar sem adivinhar contratos.

2. Ficheiros envolvidos:
    - CRIAR:
    - docs/evidence/<BK_ID>.md ou descrição equivalente no PR.
    - EDITAR:
    - Secção Evidence deste guia apenas quando houver PR/defesa real.
    - LOCALIZACAO:
    - Fim do guia: critérios, validação final, evidence, handoff e changelog.
    - REVER:
    - BK seguinte indicado em `proximo_bk` e BKs dependentes futuros.

3. Instruções do que fazer.

Se falta fonte documental ou decisão de arquitetura, não inventes. Regista exatamente o que falta confirmar e qual o impacto. Depois escreve o handoff para o BK seguinte.

4. Código completo, correto e integrado com a app final.

Decisões em falta a manter visíveis durante a implementação:

- O mapeamento acima é o mínimo derivado de RF02 e dos BKs MF0. Se a matriz oficial de permissões for criada noutro documento, este ficheiro deve ser revisto para ficar canónico.

5. Explicação do código.

O handoff protege continuidade. Num projeto PAP com vários alunos, a qualidade não está só no código: está também em deixar claro o que ficou decidido, o que ainda falta decidir e que contratos o próximo BK pode reutilizar.

6. Validação do passo.

Confirma que o final do BK contém apenas critérios de aceite, validação final, evidence, handoff e changelog.

7. Cenário negativo/erro esperado.

Se o handoff diz para usar algo que não foi criado neste BK ou num BK anterior, há contrato partido e deve ser corrigido antes de avançar.

## Critérios de aceite

- O BK-MF0-02 cumpre os critérios mensuráveis definidos acima.
- O contrato canónico do RF02 continua alinhado com backlog, matriz e MF-VIEWS.

## Validação final

- Executar o smoke principal descrito no Passo 6.
- Executar todos os cenários negativos do Passo 6.
- Confirmar que os ficheiros do Passo 2 ao Passo 5 existem nos caminhos reais da app ou que a adaptação ficou documentada na evidence.
- Confirmar que não houve drift em RF/RNF, owner, prioridade, dependências ou escopo.
- Confirmar que o handoff abaixo está compreensível para o próximo BK.

## Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher após validação`
- `neg`: `A preencher após testes negativos`

## Handoff

O próximo BK deve substituir qualquer role global por role por empresa. A partir dai, `req.role` deve vir da membership da empresa ativa, não do utilizador global.

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executável, com continuidade MF0, mockup, negativos, critérios e evidence.
- `2026-04-19`: metadados canónicos preservados da vaga de normalização.
