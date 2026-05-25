# BK-MF0-11 - Criar artigos/serviços (SKU, custo, preço, IVA).

## Header
- `doc_id`: `GUIA-BK-MF0-11`
- `bk_id`: `BK-MF0-11`
- `macro`: `MF0`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF11`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-12`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-11-criar-artigos-servicos-sku-custo-preco-iva.md`
- `last_updated`: `2026-05-24`

#### BK-MF0-11 - Criar artigos/serviços (SKU, custo, preço, IVA).

##### O que vamos fazer neste BK

Neste BK vamos transformar o requisito RF11 num guia de execucao para construir a parte da app relacionada com inventario. O foco nao e produzir documentacao generica: e deixar claro que modelos, endpoints, validacoes, UI e evidencia devem existir quando a equipa implementar o BK.

A app real ainda esta marcada como `sem_codigo`; por isso, os caminhos tecnicos propostos sao uma **Assuncao tecnica** baseada nos documentos oficiais: backend Node.js + Express em JavaScript ES Modules, frontend React + Vite + TypeScript, Prisma/PostgreSQL para persistencia. Se a equipa ja tiver criado outra estrutura, deve adaptar os caminhos sem alterar responsabilidades nem contratos.

Como a fase alvo e MF0, nao existem BKs de fases anteriores a reutilizar. A continuidade nasce aqui: os outputs deste BK devem ser contratos estaveis para BK-MF0-12 e para os BKs de vendas, compras, inventario, contabilidade e seguranca das fases seguintes.

##### Porque e que isto e importante

- Funcionalmente, cobre RF11 e desbloqueia o fluxo seguinte da MF0.
- Tecnicamente, cria contratos de Item e API que outros BKs podem reutilizar.
- Pedagogicamente, mostra aos alunos a ligacao entre requisito, modelo, endpoint, UI, teste e evidence.
- Em seguranca/robustez, obriga a validar dados no backend e a tratar erros previsiveis.
- Para continuidade, prepara explicitamente o handoff para BK-MF0-12.

##### O que entra (scope)

- Criar modelo Item por empresa.
- Suportar tipo PRODUCT/SERVICE se necessario para distinguir stock.
- Validar SKU unico por empresa.
- Guardar custo, preco e IVA percentual ou referencia preparada para tabela IVA futura.
- Ligar listagem de inventario ao backend.

##### O que nao entra (scope-out)

- Movimentos de stock, porque pertencem ao BK-MF2-02.
- Configuracao canonica de tabelas IVA, porque pertence ao BK-MF1-01.
- Calculo FIFO, porque pertence ao BK-MF2-03.
- Catalogo com variantes complexas ou codigos de barras, nao documentado.

##### Como saber que isto ficou bem

- O caso principal de Criar artigos/serviços (SKU, custo, preço, IVA) funciona atraves da UI ou de chamadas API documentadas.
- Os endpoints definidos respondem com codigos HTTP previsiveis e sem expor dados sensiveis.
- Os validadores rejeitam entradas invalidas antes de chegar a persistencia.
- A evidence inclui smoke, negativos, ficheiros alterados e comandos executados.
- Nao existe ALTERACAO DE CONTRATO face aos documentos canonicos; se surgir, deve ser marcada e justificada.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P0` (CANONICO)
- Estado: `TODO` (CANONICO; nao marcar DONE apenas por o guia estar detalhado)
- Esforco: `M` (CANONICO)
- macro: `MF0` (CANONICO)
- Owner: `Andre` (CANONICO)
- Apoio: `Oleksii` (CANONICO)
- Dependencias (BK IDs): `-` (CANONICO)
- Pre-condicoes: Sem dependencias anteriores declaradas. App real pode ainda nao existir; nesse caso criar a estrutura tecnica assumida antes dos ficheiros alvo. (DERIVADO)
- Ref. Plano: `PLANO-IMPLEMENTACAO-TOTAL.md` MF0; `PLANO-SPRINTS.md` S01-S02. (CANONICO)
- Flow ID: `FLOW-ITEMS` (DERIVADO)
- Fonte de verdade: `docs/RF.md` -> `RF11` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md` (CANONICO)
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` e `docs/planificacao/backlogs/MF-VIEWS.md` (CANONICO)
- Descricao: Criar artigos/serviços (SKU, custo, preço, IVA). (CANONICO)
- Stack decidida: `DERIVADO` de `docs/RNF.md` e mockup: React + Vite + TypeScript no frontend; Node.js + Express no backend; Prisma/PostgreSQL na persistencia. Redis fica fora deste BK por simplicidade pedagogica ate haver necessidade real.
- Mockup usado: `mockup/` existe e foi usado como referencia de fluxo, hierarquia e nomes visiveis; nao e contrato pixel-perfect.

#### O que vamos fazer neste BK (DERIVADO):

- Estado esperado antes do BK: Nao ha catalogo persistente de artigos/servicos para vendas, compras e stock.
- Estado esperado depois do BK: A app tem artigos/servicos com SKU, custo, preco e IVA, prontos para faturacao e movimentos de stock.
- Ficheiros a criar/editar/rever: schema Prisma, modulo backend `inventario`, cliente API frontend e componentes/paginas referenciados em `mockup/src/app/components/modules/Inventario.tsx, tabela Gestao de Inventario e botao Novo Artigo`.
- Dependencias de BK anteriores e uso: Sem dependencias anteriores declaradas.
- Impacto na arquitetura: reforca separacao entre routes, controllers, services, validators e UI.
- Impacto frontend: liga o fluxo visual do mockup a API real com estados loading/error/empty/success quando aplicavel.
- Impacto backend/dados: cria ou prepara `Item` e endpoints `GET /api/items, POST /api/items, PATCH /api/items/:id, DELETE /api/items/:id`.
- Impacto seguranca: valida inputs no backend, aplica sessao/permissao quando aplicavel e evita exposicao de dados sensiveis.
- Impacto testes: exige smoke e 3 negativos concretos.
- Handoff: BK-MF0-12 deve reutilizar os contratos aqui criados.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `README.md` seccoes 1, 4, 5 e 7.
- `docs/RF.md` linha do requisito `RF11`.
- `docs/RNF.md` seccoes RNF05, RNF06, RNF12-RNF17, RNF25-RNF30 quando aplicavel.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` linha deste BK.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` linha deste BK.
- `docs/planificacao/backlogs/MF-VIEWS.md` -> MF0.
- `docs/planificacao/sprints/PLANO-SPRINTS.md` -> S01-S02.
- Mockup: `mockup/src/app/components/modules/Inventario.tsx, tabela Gestao de Inventario e botao Novo Artigo`.
- BKs anteriores: nao existem dependencias formais anteriores para este BK.

#### Glossario (rapido) (DERIVADO):

- **SKU:** Codigo unico interno para identificar artigo ou servico.
- **Custo:** Valor de aquisicao/base para margem e FIFO futuro.
- **Preco:** Valor de venda antes/depois de IVA conforme contrato do formulario.
- **IVA:** Taxa fiscal associada ao artigo; tabela canonica vem no BK-MF1-01.
- **Servico:** Item vendavel que nao movimenta stock fisico.

#### Conceitos teoricos essenciais (DERIVADO):

- Artigos e servicos sao o catalogo base. Vendas e compras futuras devem referenciar itemId para manter consistencia.
- SKU deve ser unico por empresa para evitar escolher o artigo errado.
- Custo e preco devem ser numeros positivos. Guardar moeda em centimos pode evitar erros de arredondamento.
- Como a tabela IVA canonica so chega no BK-MF1-01, este BK deve preparar o campo sem inventar codigos fiscais finais.
- **Erros comuns a evitar:** implementar so no frontend, confiar em dados enviados pelo browser, esquecer `companyId` nos dados por empresa, devolver mensagens tecnicas cruas ao utilizador ou criar campos que nao aparecem nos RF/RNF.
- **Negativos de seguranca/robustez:** todos os casos invalidos devem falhar de forma controlada, sem stack traces, sem dados sensiveis e sem escrita parcial na base de dados.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar contrato e preparar ambiente**
   - Descricao detalhada do objetivo: Rever o requisito RF11, a linha do BK-MF0-11 no backlog/matriz e confirmar que o repositorio ainda esta em modo sem codigo real fora do mockup.
   - Justificacao: Evita implementar campos, endpoints ou papeis que nao existem no contrato canonico.
   - Como fazer (0.1): Abrir docs/RF.md, BACKLOG-MVP.md, MATRIZ-CANONICA-BK.md e este guia.
   - Como fazer (0.2): Criar ou confirmar a estrutura tecnica assumida: apps/api para backend e apps/web para frontend; se a equipa escolher outra estrutura, documentar no PR.
   - Ficheiro a rever: docs/RF.md; docs/planificacao/backlogs/BACKLOG-MVP.md; docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md
   - Ficheiro alvo: README.md; package.json; apps/api/package.json; apps/web/package.json
   - Snippet de referencia: `BK-MF0-11 -> RF11 -> GET /api/items, POST /api/items, PATCH /api/items/:id, DELETE /api/items/:id`
   - O que verificar: Metadados preservados e sem drift entre guia, backlog e matriz.

1. **Objetivo (~25 min): Modelar dados e constraints**
   - Descricao detalhada do objetivo: Criar ou ajustar o schema para Item, sempre com isolamento por empresa quando o dado pertencer a uma empresa.
   - Justificacao: A integridade da base de dados deve impedir duplicados e estados impossiveis mesmo antes da UI existir.
   - Como fazer (1.1): Adicionar modelos e campos minimos no schema.
   - Como fazer (1.2): Adicionar constraints unicas, relacoes e indices necessarios para o caso principal do BK.
   - Ficheiro a rever: docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md; mockup/src/app/types.ts
   - Ficheiro alvo: apps/api/prisma/schema.prisma
   - Snippet de referencia: `model Item { /* BK-MF0-11 */ }`
   - O que verificar: Migration criada ou schema atualizado sem campos fora do RF.

2. **Objetivo (~25 min): Criar validadores backend**
   - Descricao detalhada do objetivo: Implementar validacao explicita para payloads de inventario.
   - Justificacao: Validar no frontend melhora UX, mas apenas o backend protege a base de dados e a API contra chamadas diretas.
   - Como fazer (2.1): Criar funcoes pequenas em validators com mensagens claras em portugues de Portugal.
   - Como fazer (2.2): Cobrir obrigatorios, formatos, duplicados previsiveis e valores fora de intervalo.
   - Ficheiro a rever: docs/RNF.md (RNF05, RNF06, RNF15)
   - Ficheiro alvo: apps/api/src/modules/inventario/validators.js
   - Snippet de referencia: `validateItem(req.body)`
   - O que verificar: Payload invalido devolve 400 com mensagem acionavel.

3. **Objetivo (~25 min): Implementar service de negocio**
   - Descricao detalhada do objetivo: Criar o service que executa a regra principal do BK-MF0-11.
   - Justificacao: Controllers devem ser finos; services concentram regras e tornam testes mais simples.
   - Como fazer (3.1): Criar funcoes async com companyId, actor/user e payload validado.
   - Como fazer (3.2): Garantir que o service nao consulta nem altera dados fora da empresa ativa.
   - Ficheiro a rever: docs/RNF.md (RNF25, RNF28)
   - Ficheiro alvo: apps/api/src/modules/inventario/services.js
   - Snippet de referencia: `await inventarioService.execute({ companyId, actor, input })`
   - O que verificar: Service testavel sem HTTP e com erros controlados.

4. **Objetivo (~25 min): Expor rotas e controller**
   - Descricao detalhada do objetivo: Criar endpoints: GET /api/items, POST /api/items, PATCH /api/items/:id, DELETE /api/items/:id.
   - Justificacao: Rotas Express sao o contrato entre frontend e backend; devem ter codigos HTTP previsiveis.
   - Como fazer (4.1): Criar router e controller para chamar validadores, middleware de sessao/permissao e service.
   - Como fazer (4.2): Adicionar tratamento de erro para 400, 401, 403, 409 quando aplicavel.
   - Ficheiro a rever: docs/RNF.md (RNF25, RNF28)
   - Ficheiro alvo: apps/api/src/modules/inventario/routes.js; apps/api/src/modules/inventario/controller.js
   - Snippet de referencia: `router.post('/...', requireAuth, controller.handler)`
   - O que verificar: Endpoint valido devolve codigo esperado e JSON sem dados sensiveis.

5. **Objetivo (~25 min): Ligar frontend ao mockup**
   - Descricao detalhada do objetivo: Transformar a referencia visual do mockup em fluxo real sem exigir pixel-perfect. Referencia UI: mockup/src/app/components/modules/Inventario.tsx, tabela Gestao de Inventario e botao Novo Artigo.
   - Justificacao: O mockup orienta nomes, hierarquia e fluxo, mas o contrato da app deve ficar extensivel.
   - Como fazer (5.1): Criar cliente API no frontend e substituir dados mock/local por chamadas HTTP.
   - Como fazer (5.2): Implementar loading, error, empty e success quando fizer sentido.
   - Ficheiro a rever: mockup/src/app/components/modules/Inventario.tsx, tabela Gestao de Inventario e botao Novo Artigo
   - Ficheiro alvo: apps/web/src/modules/inventario/; apps/web/src/lib/apiClient.ts
   - Snippet de referencia: `apiClient.request('GET /api/items')`
   - O que verificar: A UI mostra dados reais/mockados por API e nao quebra responsividade basica.

6. **Objetivo (~25 min): Executar smoke e negativos**
   - Descricao detalhada do objetivo: Validar o caso principal e os cenarios negativos minimos do BK-MF0-11.
   - Justificacao: Sem evidencia, o BK nao esta pronto para PR nem defesa PAP.
   - Como fazer (6.1): Executar smoke com curl, browser ou teste automatizado conforme o endpoint.
   - Como fazer (6.2): Executar os negativos listados no checklist e guardar resposta/captura.
   - Ficheiro a rever: docs/planificacao/sprints/PLANO-SPRINTS.md
   - Ficheiro alvo: apps/api/tests/BK-MF0-11.test.js; docs/evidence/BK-MF0-11.md
   - Snippet de referencia: `curl -i http://localhost:3000/api/items`
   - O que verificar: Smoke aprovado e pelo menos 3 negativos registados.

7. **Objetivo (~15 min): Preparar handoff e evidence**
   - Descricao detalhada do objetivo: Registar o que ficou construido, os ficheiros alterados, comandos e riscos para o proximo BK (BK-MF0-12).
   - Justificacao: O proximo aluno deve conseguir continuar sem descobrir contratos por tentativa e erro.
   - Como fazer (7.1): Preencher Evidence com PR, proof, neg, files, commands e screenshots.
   - Como fazer (7.2): Adicionar TODOs reais sem marcar o BK como DONE apenas por existir guia.
   - Ficheiro a rever: Este guia; BACKLOG-MVP.md
   - Ficheiro alvo: docs/evidence/BK-MF0-11.md ou descricao do PR
   - Snippet de referencia: `handoff.next = 'BK-MF0-12'`
   - O que verificar: Handoff referencia contratos reutilizaveis e riscos abertos.

#### Checklist de validacao (DERIVADO):

- Smoke: executar o fluxo principal de `GET /api/items` e confirmar resultado funcional na UI/API.
- Tecnico: correr lint/testes disponiveis; se ainda nao existirem scripts, registar `TODO` e executar pelo menos smoke manual com `curl`.
- Regressao das fases anteriores: MF0 nao tem fases anteriores, mas nao pode quebrar BKs MF0 ja executados na mesma sprint.
- UI/mockup: comparar nomes e fluxo com `mockup/src/app/components/modules/Inventario.tsx, tabela Gestao de Inventario e botao Novo Artigo`, sem exigir pixel-perfect.
- Seguranca: confirmar que dados invalidos nao sao persistidos e que respostas nao expoem stack traces nem segredos.
- Negativos: minimo `3` cenarios para prioridade `P0`.

| Negativo | Passo | Input/acao | Resultado esperado | Risco que cobre |
| --- | --- | --- | --- | --- |
| N1 | 6 | Criar artigo com SKU duplicado. | Resposta 409. | Evita catalogo ambiguo. |
| N2 | 6 | Criar artigo com preco negativo. | Resposta 400. | Evita calculos financeiros errados. |
| N3 | 6 | Criar artigo com IVA 999. | Resposta 400. | Evita taxa fiscal invalida. |

#### Criterios de aceite:

- Outputs:
- Tabela Item com companyId e sku unico.
- Endpoint usado por vendas, compras e inventario.
- Validadores de preco/custo/IVA.
- UI de inventario com estados e pesquisa.
- Handoff para BK-MF0-12 e BK-MF1-02.
- Verificacoes:
- Caso valido de `GET /api/items` concluido com codigo HTTP adequado.
- Pelo menos 3 negativos executados e documentados.
- Build/lint/testes disponiveis executados ou justificada a impossibilidade.
- Qualidade:
- Sem duplicacao grosseira entre controller/service/validator.
- Mensagens de erro em portugues de Portugal e acionaveis.
- Sem secrets no codigo, logs ou evidence.
- Continuidade:
- O BK seguinte `BK-MF0-12` consegue reutilizar os contratos deste BK.
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
- Assuncao a validar com o orientador: estrutura apps/api + apps/web e uso de Prisma/PostgreSQL.
- Decisao dependente de mockup: manter fluxo e nomes principais, mas evoluir design sem obrigacao pixel-perfect.
- Decisao dependente de app/codigo ainda inexistente: adaptar caminhos se a equipa escolher outra estrutura, preservando contratos.
- TODO: confirmar se valores monetarios serao guardados em centimos inteiros ou decimal Prisma.
- FOLLOW-UP: BK-MF1-01 deve substituir/validar IVA contra tabela canonica sem duplicar campos.

## Bloco pedagogico

### Objetivo

Construir Criar artigos/serviços (SKU, custo, preço, IVA) de forma executavel, segura e rastreavel ao RF11.

### Pre-requisitos

- Ler RF11, este guia e os documentos canonicos indicados na pre-leitura.
- Confirmar dependencias: -.

### Erros comuns

- Implementar apenas a UI sem endpoint real.
- Ignorar validacao backend porque o formulario ja valida.
- Alterar metadados canonicos sem atualizar backlog/matriz.

### Check de compreensao

- [ ] Sei explicar que parte da app fica pronta no BK-MF0-11.
- [ ] Sei indicar que ficheiros devo criar/editar/rever.
- [ ] Sei demonstrar 3 cenarios negativos.

### Tempo estimado

- `Core`: `90-120 min`.
- `Reforco`: `+30-45 min` para hardening, negativos e evidence.

## Bloco operacional

### Entrada

- BK: `BK-MF0-11`
- Requisito: `RF11`
- Dependencias: `-`
- Endpoint(s): `GET /api/items, POST /api/items, PATCH /api/items/:id, DELETE /api/items/:id`

### Passos

- Seguir o passo-a-passo detalhado na seccao `Guia de execucao` deste ficheiro.

### Validacao

- Smoke principal + Negativos: minimo `3` + regressao dos BKs MF0 ja fechados.

### Handoff

- Proximo BK recomendado: `BK-MF0-12`.
- Registar contratos reutilizaveis, riscos e evidence antes de pedir review.

## Snippet tecnico aplicavel

Contexto de rastreabilidade: `BK-MF0-11` -> `RF11`.
```js
export function validateItem(input) {
  if (!input.sku?.trim()) throw new Error("SKU e obrigatorio");
  if (Number(input.custo) < 0) throw new Error("Custo nao pode ser negativo");
  if (Number(input.preco) <= 0) throw new Error("Preco deve ser positivo");
  if (Number(input.iva) < 0 || Number(input.iva) > 100) throw new Error("IVA invalido");
  return input;
}
```

Este snippet e referencia pequena, nao substitui a implementacao completa. Deve ser adaptado ao modulo real mantendo validacao, tratamento de erros e separacao de responsabilidades.

## Criterios de aceite

- O BK-MF0-11 cumpre os criterios mensuraveis definidos acima.
- O contrato canonico do RF11 continua alinhado com backlog, matriz e MF-VIEWS.

## Evidence para PR/defesa

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`

## Changelog

- `2026-05-24`: guia refinado para estrutura step-by-step executavel, com continuidade MF0, mockup, negativos, criterios e evidence.
- `2026-04-19`: metadados canonicos preservados da vaga de normalizacao.
