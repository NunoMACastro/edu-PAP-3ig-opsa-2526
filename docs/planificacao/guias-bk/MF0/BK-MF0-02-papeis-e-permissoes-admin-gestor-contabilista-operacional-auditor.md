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

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar contrato e preparar ambiente**
   - Descricao detalhada do objetivo: Rever o requisito RF02, a linha do BK-MF0-02 no backlog/matriz e confirmar que o repositorio ainda esta em modo sem codigo real fora do mockup.
   - Justificacao: Evita implementar campos, endpoints ou papeis que nao existem no contrato canonico.
   - Como fazer (0.1): Abrir docs/RF.md, BACKLOG-MVP.md, MATRIZ-CANONICA-BK.md e este guia.
   - Como fazer (0.2): Consultar `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e confirmar se o scaffold real segue a estrutura indicativa; se nao seguir, mapear caminho do guia -> caminho real na evidence do BK.
   - Ficheiro a rever: docs/RF.md; docs/planificacao/backlogs/BACKLOG-MVP.md; docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md
   - Ficheiro alvo: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; package.json/scaffold real da app
   - Snippet de referencia: `BK-MF0-02 -> RF02 -> GET /api/auth/me, GET /api/permissions/me`
   - O que verificar: Metadados preservados e sem drift entre guia, backlog e matriz.

1. **Objetivo (~25 min): Modelar dados e constraints**
   - Descricao detalhada do objetivo: Criar ou ajustar o schema para Role, PermissionPolicy, sempre com isolamento por empresa quando o dado pertencer a uma empresa.
   - Justificacao: A integridade da base de dados deve impedir duplicados e estados impossiveis mesmo antes da UI existir.
   - Como fazer (1.1): Adicionar modelos e campos minimos no schema.
   - Como fazer (1.2): Adicionar constraints unicas, relacoes e indices necessarios para o caso principal do BK.
   - Ficheiro a rever: docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md; mockup/src/app/types.ts
   - Ficheiro alvo: apps/api/prisma/schema.prisma
   - Snippet de referencia: `model Role { /* BK-MF0-02 */ }`
   - O que verificar: Migration criada ou schema atualizado sem campos fora do RF.

2. **Objetivo (~25 min): Criar validadores backend**
   - Descricao detalhada do objetivo: Implementar validacao explicita para payloads de identidade.
   - Justificacao: Validar no frontend melhora UX, mas apenas o backend protege a base de dados e a API contra chamadas diretas.
   - Como fazer (2.1): Criar funcoes pequenas em validators com mensagens claras em portugues de Portugal.
   - Como fazer (2.2): Cobrir obrigatorios, formatos, duplicados previsiveis e valores fora de intervalo.
   - Ficheiro a rever: docs/RNF.md (RNF05, RNF06, RNF15)
   - Ficheiro alvo: apps/api/src/modules/identidade/validators.js
   - Snippet de referencia: `validateRole(req.body)`
   - O que verificar: Payload invalido devolve 400 com mensagem acionavel.

3. **Objetivo (~25 min): Implementar service de negocio**
   - Descricao detalhada do objetivo: Criar o service que executa a regra principal do BK-MF0-02.
   - Justificacao: Controllers devem ser finos; services concentram regras e tornam testes mais simples.
   - Como fazer (3.1): Criar funcoes async com companyId, actor/user e payload validado.
   - Como fazer (3.2): Garantir que o service nao consulta nem altera dados fora da empresa ativa.
   - Ficheiro a rever: docs/RNF.md (RNF25, RNF28)
   - Ficheiro alvo: apps/api/src/modules/identidade/services.js
   - Snippet de referencia: `await identidadeService.execute({ companyId, actor, input })`
   - O que verificar: Service testavel sem HTTP e com erros controlados.

4. **Objetivo (~25 min): Expor rotas e controller**
   - Descricao detalhada do objetivo: Criar endpoints: GET /api/auth/me, GET /api/permissions/me.
   - Justificacao: Rotas Express sao o contrato entre frontend e backend; devem ter codigos HTTP previsiveis.
   - Como fazer (4.1): Criar router e controller para chamar validadores, middleware de sessao/permissao e service.
   - Como fazer (4.2): Adicionar tratamento de erro para 400, 401, 403, 409 quando aplicavel.
   - Ficheiro a rever: docs/RNF.md (RNF25, RNF28)
   - Ficheiro alvo: apps/api/src/modules/identidade/routes.js; apps/api/src/modules/identidade/controller.js
   - Snippet de referencia: `router.post('/...', requireAuth, controller.handler)`
   - O que verificar: Endpoint valido devolve codigo esperado e JSON sem dados sensiveis.

5. **Objetivo (~25 min): Ligar frontend ao mockup**
   - Descricao detalhada do objetivo: Transformar a referencia visual do mockup em fluxo real sem exigir pixel-perfect. Referencia UI: mockup/src/app/components/Layout.tsx e mockup/src/app/components/modules/Configuracoes.tsx.
   - Justificacao: O mockup orienta nomes, hierarquia e fluxo, mas o contrato da app deve ficar extensivel.
   - Como fazer (5.1): Criar cliente API no frontend e substituir dados mock/local por chamadas HTTP.
   - Como fazer (5.2): Implementar loading, error, empty e success quando fizer sentido.
   - Ficheiro a rever: mockup/src/app/components/Layout.tsx e mockup/src/app/components/modules/Configuracoes.tsx
   - Ficheiro alvo: apps/web/src/modules/identidade/; apps/web/src/lib/apiClient.ts
   - Snippet de referencia: `apiClient.request('GET /api/auth/me')`
   - O que verificar: A UI mostra dados reais/mockados por API e nao quebra responsividade basica.

6. **Objetivo (~25 min): Executar smoke e negativos**
   - Descricao detalhada do objetivo: Validar o caso principal e os cenarios negativos minimos do BK-MF0-02.
   - Justificacao: Sem evidencia, o BK nao esta pronto para PR nem defesa PAP.
   - Como fazer (6.1): Executar smoke com curl, browser ou teste automatizado conforme o endpoint.
   - Como fazer (6.2): Executar os negativos listados no checklist e guardar resposta/captura.
   - Ficheiro a rever: docs/planificacao/sprints/PLANO-SPRINTS.md
   - Ficheiro alvo: apps/api/tests/BK-MF0-02.test.js; docs/evidence/BK-MF0-02.md
   - Snippet de referencia: `curl -i http://localhost:3000/api/auth/me`
   - O que verificar: Smoke aprovado e pelo menos 3 negativos registados.

7. **Objetivo (~15 min): Preparar handoff e evidence**
   - Descricao detalhada do objetivo: Registar o que ficou construido, os ficheiros alterados, comandos e riscos para o proximo BK (BK-MF0-03).
   - Justificacao: O proximo aluno deve conseguir continuar sem descobrir contratos por tentativa e erro.
   - Como fazer (7.1): Preencher Evidence com PR, proof, neg, files, commands e screenshots.
   - Como fazer (7.2): Adicionar TODOs reais sem marcar o BK como DONE apenas por existir guia.
   - Ficheiro a rever: Este guia; BACKLOG-MVP.md
   - Ficheiro alvo: docs/evidence/BK-MF0-02.md ou descricao do PR
   - Snippet de referencia: `handoff.next = 'BK-MF0-03'`
   - O que verificar: Handoff referencia contratos reutilizaveis e riscos abertos.

#### Checklist de validacao (DERIVADO):

- Smoke: executar o fluxo principal de `GET /api/auth/me` e confirmar resultado funcional na UI/API.
- Tecnico: correr lint/testes disponiveis; se ainda nao existirem scripts, registar `TODO` e executar pelo menos smoke manual com `curl`.
- Regressao das fases anteriores: MF0 nao tem fases anteriores, mas nao pode quebrar BKs MF0 ja executados na mesma sprint.
- UI/mockup: comparar nomes e fluxo com `mockup/src/app/components/Layout.tsx e mockup/src/app/components/modules/Configuracoes.tsx`, sem exigir pixel-perfect.
- Seguranca: confirmar que dados invalidos nao sao persistidos e que respostas nao expoem stack traces nem segredos.
- Negativos: minimo `3` cenarios para prioridade `P0`.

| Negativo | Passo | Input/acao | Resultado esperado | Risco que cobre |
| --- | --- | --- | --- | --- |
| N1 | 6 | Utilizador sem sessao chama endpoint protegido. | Resposta 401. | Distingue falta de login de falta de permissao. |
| N2 | 6 | Utilizador Operacional tenta acao exclusiva de Admin. | Resposta 403. | Evita escalada de privilegios. |
| N3 | 6 | Role desconhecida enviada no seed ou fixture. | Erro de validacao antes de persistir. | Evita roles fora do contrato canonico. |

#### Criterios de aceite:

- Outputs:
- Enum de roles partilhado entre backend e frontend.
- Middleware requireRole testado em endpoint de exemplo.
- Contrato de erro 403 para acesso autenticado sem permissao.
- UI preparada para ocultar acoes indisponiveis, sem usar ocultacao como seguranca principal.
- Handoff para BK-MF0-03 com roles prontas para ficarem por empresa.
- Verificacoes:
- Caso valido de `GET /api/auth/me` concluido com codigo HTTP adequado.
- Pelo menos 3 negativos executados e documentados.
- Build/lint/testes disponiveis executados ou justificada a impossibilidade.
- Qualidade:
- Sem duplicacao grosseira entre controller/service/validator.
- Mensagens de erro em portugues de Portugal e acionaveis.
- Sem secrets no codigo, logs ou evidence.
- Continuidade:
- O BK seguinte `BK-MF0-03` consegue reutilizar os contratos deste BK.
- Sem drift em owner, prioridade, dependencias ou RF/RNF.
- Qualquer decisao nao confirmada fica marcada como TODO/BLOCKER.
- Evidencia:
- PR ou commit identificado.
- Comandos executados registados.
- Screenshots ou outputs do smoke e negativos anexados quando houver UI/API.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `A preencher com ficheiros criados/editados`
- `commands`: `A preencher com npm/prisma/curl/testes executados`
- `screenshots`: `A preencher se houver UI alterada`
- `notes`: `A preencher com decisoes tecnicas, assuncoes e desvios aprovados`

#### TODOs

- TODO normal: confirmar nomes finais das pastas da app real quando a equipa iniciar codigo.
- TODO normal: criar scripts lint, test e dev se ainda nao existirem.
- TODO (BLOCKER): nao fechar o BK como DONE sem evidence real de smoke e negativos.
- Assuncao de stack: consultar `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; qualquer adaptacao de paths deve ficar documentada na evidence do BK.
- Decisao dependente de mockup: manter fluxo e nomes principais, mas evoluir design sem obrigacao pixel-perfect.
- Decisao dependente de app/codigo ainda inexistente: adaptar caminhos se a equipa escolher outra estrutura, preservando contratos.
- FOLLOW-UP: BK-MF0-03 deve mover a role simples para membership por empresa sem quebrar este enum.

## Bloco pedagogico

### Objetivo

Construir Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor) de forma executavel, segura e rastreavel ao RF02.

### Pre-requisitos

- Ler RF02, este guia e os documentos canonicos indicados na pre-leitura.
- Confirmar dependencias: BK-MF0-01.

### Erros comuns

- Implementar apenas a UI sem endpoint real.
- Ignorar validacao backend porque o formulario ja valida.
- Alterar metadados canonicos sem atualizar backlog/matriz.

### Check de compreensao

- [ ] Sei explicar que parte da app fica pronta no BK-MF0-02.
- [ ] Sei indicar que ficheiros devo criar/editar/rever.
- [ ] Sei demonstrar 3 cenarios negativos.

### Tempo estimado

- `Core`: `90-120 min`.
- `Reforco`: `+30-45 min` para hardening, negativos e evidence.

## Bloco operacional

### Entrada

- BK: `BK-MF0-02`
- Requisito: `RF02`
- Dependencias: `BK-MF0-01`
- Endpoint(s): `GET /api/auth/me, GET /api/permissions/me`

### Passos

- Seguir o passo-a-passo detalhado na seccao `Guia de execucao` deste ficheiro.

### Validacao

- Smoke principal + Negativos: minimo `3` + regressao dos BKs MF0 ja fechados.

### Handoff

- Proximo BK recomendado: `BK-MF0-03`.
- Registar contratos reutilizaveis, riscos e evidence antes de pedir review.

## Snippet tecnico aplicavel

Contexto de rastreabilidade: `BK-MF0-02` -> `RF02`.
```js
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Sessao obrigatoria" });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: "Permissao insuficiente" });
    return next();
  };
}
```

Este snippet e referencia pequena, nao substitui a implementacao completa. Deve ser adaptado ao modulo real mantendo validacao, tratamento de erros e separacao de responsabilidades.

## Criterios de aceite

- O BK-MF0-02 cumpre os criterios mensuraveis definidos acima.
- O contrato canonico do RF02 continua alinhado com backlog, matriz e MF-VIEWS.

## Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executavel, com continuidade MF0, mockup, negativos, criterios e evidence.
- `2026-04-19`: metadados canonicos preservados da vaga de normalizacao.
