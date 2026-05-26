# BK-MF0-03 - Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).

## Header
- `doc_id`: `GUIA-BK-MF0-03`
- `bk_id`: `BK-MF0-03`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-02`
- `rf_rnf`: `RF03`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-04`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empresas.md`
- `last_updated`: `2026-05-24`

#### BK-MF0-03 - Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas).

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF03 num guia de execucao para construir a parte da app relacionada com identidade. O foco nao e produzir documentacao generica: e deixar claro que modelos, endpoints, validacoes, UI e evidencia devem existir quando a equipa implementar o BK.

A app real ainda esta marcada como `sem_codigo`; por isso, os caminhos tecnicos propostos seguem o contrato central `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`. Esse contrato define a stack assumida, a estrutura indicativa e a regra de adaptacao quando existir scaffold real, sem alterar RF, BK, owners, dependencias ou criterios de aceite.

Como a fase alvo e MF0, nao existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estaveis para BK-MF0-04 e para os BKs de vendas, compras, inventario, contabilidade e seguranca das fases seguintes.

##### Porque e que isto e importante

- Funcionalmente, cobre RF03 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de Company, CompanyMembership e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligacao entre requisito, modelo, endpoint, UI, teste e evidence.
- Em seguranca/robustez, obriga a validar dados no backend e a tratar erros previsiveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-04.

##### O que entra (scope)

- Criar modelo de empresa minimo para associar utilizadores.
- Criar membership com userId, companyId e role.
- Adicionar contexto de empresa ativo na sessao.
- Garantir que queries futuras filtram por companyId.
- Preparar seletor simples de empresa no frontend quando houver mais de uma empresa.

##### O que nao entra (scope-out)

- Dados completos da empresa, porque pertencem ao BK-MF0-06.
- Convites e administracao de utilizadores, porque pertencem ao BK-MF0-04.
- Consolidacao multiempresa ou reporting agregado, que nao esta no RF03.
- Regras legais entre empresas diferentes nao documentadas.

##### Como saber que isto ficou bem

- O caso principal de Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas) funciona atraves da UI ou de chamadas API documentadas.
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
- Dependencias (BK IDs): `BK-MF0-02` (CANONICO)
- Pre-condicoes: Depende de BK-MF0-02. App real pode ainda nao existir; nesse caso criar a estrutura tecnica assumida antes dos ficheiros alvo. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-MULTI-COMPANY` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF03` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas). (CANONICO)
- Stack decidida: `DERIVADO` e centralizada em `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; este BK usa essa stack apenas como assuncao tecnica ate existir scaffold real.
- Mockup usado: `mockup/` existe e foi usado como referencia de fluxo, hierarquia e nomes visiveis; nao e contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: BK-MF0-02 ja deve ter roles canonicas e middleware de autorizacao.
- Estado esperado depois do BK: A app passa a separar dados por empresa e cada utilizador tem uma role associada ao par utilizador-empresa.
- Ficheiros a criar/editar/rever: schema Prisma, modulo backend `identidade`, cliente API frontend e componentes/paginas referenciados em `mockup/src/app/components/Layout.tsx, onde aparece Empresa Demo S.A. no header`.
- Dependencias de BK anteriores e uso: Depende de BK-MF0-02.
- Impacto na arquitetura: reforca separacao entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicavel.
- Impacto backend/dados: cria ou prepara `Company, CompanyMembership` e endpoints `GET /api/companies, POST /api/session/company, GET /api/session/context`.
- Impacto seguranca: valida inputs no backend, aplica sessao/permissao quando aplicavel e evita exposicao de dados sensiveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-04 deve reutilizar os contratos aqui criados.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `README.md` seccoes 1, 4, 5 e 7.
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` para stack assumida e regras de adaptacao de caminhos.
- `docs/RF.md` linha do requisito `RF03`.
- `docs/RNF.md` seccoes RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicavel.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/Layout.tsx, onde aparece Empresa Demo S.A. no header`.
- BK anterior obrigatorio: `BK-MF0-02`, sobretudo os contratos de sessao/role/empresa.

#### Glossario (rapido) (DERIVADO):

- **Multiempresa:** Capacidade de gerir dados de varias empresas sem os misturar.
- **Membership:** Ligacao entre utilizador e empresa, incluindo o papel nessa empresa.
- **Tenant:** Empresa/contexto isolado dentro da mesma aplicacao.
- **Contexto ativo:** Empresa selecionada na sessao atual.
- **Isolamento de dados:** Garantia de que uma empresa nao consulta dados de outra.

#### Conceitos teoricos essenciais (DERIVADO):

- Multiempresa nao e apenas um campo no frontend. O backend deve filtrar dados por companyId em todos os dominios futuros.
- A role deixa de ser uma propriedade global do utilizador e passa a fazer sentido dentro da empresa ativa.
- O middleware de contexto deve correr depois da sessao e antes dos controllers de negocio.
- Falhas de isolamento multiempresa sao bugs graves de privacidade e seguranca.
- **Erros comuns a evitar:** implementar so no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens tecnicas cruas ao utilizador ou criar campos que nao aparecem nos RF/RNF.
- **Negativos de seguranca/robustez:** todos os casos invalidos devem falhar de forma controlada, sem stack traces, sem dados sensiveis e sem escrita parcial na base de dados.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar contrato e preparar ambiente**
   - Descricao detalhada do objetivo: Rever o requisito RF03, a linha do BK-MF0-03 no backlog/matriz e confirmar que o repositorio ainda esta em modo sem codigo real fora do mockup.
   - Justificacao: Evita implementar campos, endpoints ou papeis que nao existem no contrato canonico.
   - Como fazer (0.1): Abrir docs/RF.md, BACKLOG-MVP.md, MATRIZ-CANONICA-BK.md e este guia.
   - Como fazer (0.2): Consultar `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md` e confirmar se o scaffold real segue a estrutura indicativa; se nao seguir, mapear caminho do guia -> caminho real na evidence do BK.
   - Ficheiro a rever: docs/RF.md; docs/planificacao/backlogs/BACKLOG-MVP.md; docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md
   - Ficheiro alvo: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`; package.json/scaffold real da app
   - Snippet de referencia: `BK-MF0-03 -> RF03 -> GET /api/companies, POST /api/session/company, GET /api/session/context`
   - O que verificar: Metadados preservados e sem drift entre guia, backlog e matriz.

1. **Objetivo (~25 min): Modelar dados e constraints**
   - Descricao detalhada do objetivo: Criar ou ajustar o schema para Company, CompanyMembership, sempre com isolamento por empresa quando o dado pertencer a uma empresa.
   - Justificacao: A integridade da base de dados deve impedir duplicados e estados impossiveis mesmo antes da UI existir.
   - Como fazer (1.1): Adicionar modelos e campos minimos no schema.
   - Como fazer (1.2): Adicionar constraints unicas, relacoes e indices necessarios para o caso principal do BK.
   - Ficheiro a rever: docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md; mockup/src/app/types.ts
   - Ficheiro alvo: apps/api/prisma/schema.prisma
   - Snippet de referencia: `model Company { /* BK-MF0-03 */ }`
   - O que verificar: Migration criada ou schema atualizado sem campos fora do RF.

2. **Objetivo (~25 min): Criar validadores backend**
   - Descricao detalhada do objetivo: Implementar validacao explicita para payloads de identidade.
   - Justificacao: Validar no frontend melhora UX, mas apenas o backend protege a base de dados e a API contra chamadas diretas.
   - Como fazer (2.1): Criar funcoes pequenas em validators com mensagens claras em portugues de Portugal.
   - Como fazer (2.2): Cobrir obrigatorios, formatos, duplicados previsiveis e valores fora de intervalo.
   - Ficheiro a rever: docs/RNF.md (RNF05, RNF06, RNF15)
   - Ficheiro alvo: apps/api/src/modules/identidade/validators.js
   - Snippet de referencia: `validateCompany(req.body)`
   - O que verificar: Payload invalido devolve 400 com mensagem acionavel.

3. **Objetivo (~25 min): Implementar service de negocio**
   - Descricao detalhada do objetivo: Criar o service que executa a regra principal do BK-MF0-03.
   - Justificacao: Controllers devem ser finos; services concentram regras e tornam testes mais simples.
   - Como fazer (3.1): Criar funcoes async com companyId, actor/user e payload validado.
   - Como fazer (3.2): Garantir que o service nao consulta nem altera dados fora da empresa ativa.
   - Ficheiro a rever: docs/RNF.md (RNF25, RNF28)
   - Ficheiro alvo: apps/api/src/modules/identidade/services.js
   - Snippet de referencia: `await identidadeService.execute({ companyId, actor, input })`
   - O que verificar: Service testavel sem HTTP e com erros controlados.

4. **Objetivo (~25 min): Expor rotas e controller**
   - Descricao detalhada do objetivo: Criar endpoints: GET /api/companies, POST /api/session/company, GET /api/session/context.
   - Justificacao: Rotas Express sao o contrato entre frontend e backend; devem ter codigos HTTP previsiveis.
   - Como fazer (4.1): Criar router e controller para chamar validadores, middleware de sessao/permissao e service.
   - Como fazer (4.2): Adicionar tratamento de erro para 400, 401, 403, 409 quando aplicavel.
   - Ficheiro a rever: docs/RNF.md (RNF25, RNF28)
   - Ficheiro alvo: apps/api/src/modules/identidade/routes.js; apps/api/src/modules/identidade/controller.js
   - Snippet de referencia: `router.post('/...', requireAuth, controller.handler)`
   - O que verificar: Endpoint valido devolve codigo esperado e JSON sem dados sensiveis.

5. **Objetivo (~25 min): Ligar frontend ao mockup**
   - Descricao detalhada do objetivo: Transformar a referencia visual do mockup em fluxo real sem exigir pixel-perfect. Referencia UI: mockup/src/app/components/Layout.tsx, onde aparece Empresa Demo S.A. no header.
   - Justificacao: O mockup orienta nomes, hierarquia e fluxo, mas o contrato da app deve ficar extensivel.
   - Como fazer (5.1): Criar cliente API no frontend e substituir dados mock/local por chamadas HTTP.
   - Como fazer (5.2): Implementar loading, error, empty e success quando fizer sentido.
   - Ficheiro a rever: mockup/src/app/components/Layout.tsx, onde aparece Empresa Demo S.A. no header
   - Ficheiro alvo: apps/web/src/modules/identidade/; apps/web/src/lib/apiClient.ts
   - Snippet de referencia: `apiClient.request('GET /api/companies')`
   - O que verificar: A UI mostra dados reais/mockados por API e nao quebra responsividade basica.

6. **Objetivo (~25 min): Executar smoke e negativos**
   - Descricao detalhada do objetivo: Validar o caso principal e os cenarios negativos minimos do BK-MF0-03.
   - Justificacao: Sem evidencia, o BK nao esta pronto para PR nem defesa PAP.
   - Como fazer (6.1): Executar smoke com curl, browser ou teste automatizado conforme o endpoint.
   - Como fazer (6.2): Executar os negativos listados no checklist e guardar resposta/captura.
   - Ficheiro a rever: docs/planificacao/sprints/PLANO-SPRINTS.md
   - Ficheiro alvo: apps/api/tests/BK-MF0-03.test.js; docs/evidence/BK-MF0-03.md
   - Snippet de referencia: `curl -i http://localhost:3000/api/companies`
   - O que verificar: Smoke aprovado e pelo menos 3 negativos registados.

7. **Objetivo (~15 min): Preparar handoff e evidence**
   - Descricao detalhada do objetivo: Registar o que ficou construido, os ficheiros alterados, comandos e riscos para o proximo BK (BK-MF0-04).
   - Justificacao: O proximo aluno deve conseguir continuar sem descobrir contratos por tentativa e erro.
   - Como fazer (7.1): Preencher Evidence com PR, proof, neg, files, commands e screenshots.
   - Como fazer (7.2): Adicionar TODOs reais sem marcar o BK como DONE apenas por existir guia.
   - Ficheiro a rever: Este guia; BACKLOG-MVP.md
   - Ficheiro alvo: docs/evidence/BK-MF0-03.md ou descricao do PR
   - Snippet de referencia: `handoff.next = 'BK-MF0-04'`
   - O que verificar: Handoff referencia contratos reutilizaveis e riscos abertos.

#### Checklist de validacao (DERIVADO):

- Smoke: executar o fluxo principal de `GET /api/companies` e confirmar resultado funcional na UI/API.
- Tecnico: correr lint/testes disponiveis; se ainda nao existirem scripts, registar `TODO` e executar pelo menos smoke manual com `curl`.
- Regressao das fases anteriores: MF0 nao tem fases anteriores, mas nao pode quebrar BKs MF0 ja executados na mesma sprint.
- UI/mockup: comparar nomes e fluxo com `mockup/src/app/components/Layout.tsx, onde aparece Empresa Demo S.A. no header`, sem exigir pixel-perfect.
- Seguranca: confirmar que dados invalidos nao sao persistidos e que respostas nao expoem stack traces nem segredos.
- Negativos: minimo `3` cenarios para prioridade `P0`.

| Negativo | Passo | Input/acao | Resultado esperado | Risco que cobre |
| --- | --- | --- | --- | --- |
| N1 | 6 | Utilizador tenta selecionar empresa onde nao tem membership. | Resposta 403 e sessao sem alterar. | Evita acesso cruzado entre empresas. |
| N2 | 6 | Pedido a clientes sem companyId ativo. | Resposta 400 ou 403 controlada. | Evita queries globais acidentais. |
| N3 | 6 | Mesmo utilizador com roles diferentes em duas empresas. | API devolve role correspondente a empresa ativa. | Evita usar role global errada. |

#### Criterios de aceite:

- Outputs:
- Tabela CompanyMembership com role por empresa.
- Middleware requireCompanyContext reutilizavel.
- Contrato req.companyId disponivel para services.
- Frontend mostra empresa ativa de forma coerente com o mockup.
- Handoff para BK-MF0-04 com base para convidar utilizadores para uma empresa concreta.
- Verificacoes:
- Caso valido de `GET /api/companies` concluido com codigo HTTP adequado.
- Pelo menos 3 negativos executados e documentados.
- Build/lint/testes disponiveis executados ou justificada a impossibilidade.
- Qualidade:
- Sem duplicacao grosseira entre controller/service/validator.
- Mensagens de erro em portugues de Portugal e acionaveis.
- Sem secrets no codigo, logs ou evidence.
- Continuidade:
- O BK seguinte `BK-MF0-04` consegue reutilizar os contratos deste BK.
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
- FOLLOW-UP: todos os BKs de dados mestre devem incluir companyId nas entidades.

## Bloco pedagogico

### Objetivo

Construir Multi-empresa (um utilizador pode ter papéis diferentes em várias empresas) de forma executavel, segura e rastreavel ao RF03.

### Pre-requisitos

- Ler RF03, este guia e os documentos canonicos indicados na pre-leitura.
- Confirmar dependencias: BK-MF0-02.

### Erros comuns

- Implementar apenas a UI sem endpoint real.
- Ignorar validacao backend porque o formulario ja valida.
- Alterar metadados canonicos sem atualizar backlog/matriz.

### Check de compreensao

- [ ] Sei explicar que parte da app fica pronta no BK-MF0-03.
- [ ] Sei indicar que ficheiros devo criar/editar/rever.
- [ ] Sei demonstrar 3 cenarios negativos.

### Tempo estimado

- `Core`: `90-120 min`.
- `Reforco`: `+30-45 min` para hardening, negativos e evidence.

## Bloco operacional

### Entrada

- BK: `BK-MF0-03`
- Requisito: `RF03`
- Dependencias: `BK-MF0-02`
- Endpoint(s): `GET /api/companies, POST /api/session/company, GET /api/session/context`

### Passos

- Seguir o passo-a-passo detalhado na seccao `Guia de execucao` deste ficheiro.

### Validacao

- Smoke principal + Negativos: minimo `3` + regressao dos BKs MF0 ja fechados.

### Handoff

- Proximo BK recomendado: `BK-MF0-04`.
- Registar contratos reutilizaveis, riscos e evidence antes de pedir review.

## Snippet tecnico aplicavel

Contexto de rastreabilidade: `BK-MF0-03` -> `RF03`.
```js
export function requireCompanyContext(req, res, next) {
  const companyId = req.session?.companyId;
  const membership = req.user?.memberships?.find((m) => m.companyId === companyId);
  if (!membership) return res.status(403).json({ error: "Empresa sem acesso" });
  req.companyId = companyId;
  req.role = membership.role;
  next();
}
```

Este snippet e referencia pequena, nao substitui a implementacao completa. Deve ser adaptado ao modulo real mantendo validacao, tratamento de erros e separacao de responsabilidades.

## Criterios de aceite

- O BK-MF0-03 cumpre os criterios mensuraveis definidos acima.
- O contrato canonico do RF03 continua alinhado com backlog, matriz e MF-VIEWS.

## Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executavel, com continuidade MF0, mockup, negativos, criterios e evidence.
- `2026-04-19`: metadados canonicos preservados da vaga de normalizacao.
