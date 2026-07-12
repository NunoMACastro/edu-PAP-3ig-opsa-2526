> [!WARNING]
> `SNAPSHOT_HISTORICO_SUPERSEDED` — estado `SUPERSEDED` em 2026-07-10.
>
> Este relatório preserva um snapshot histórico e não representa o estado corrente.
> Fonte atual: [relatório canónico](../auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md).
> Não reutilizar contagens, comandos, paths ou decisões deste corpo como evidence atual.

# Auditoria de Hidratacao dos Guias BK - MF0

## Header
- `doc_id`: `AUDITORIA-HIDRATACAO-MF0`
- `macro`: `MF0`
- `data`: `2026-05-29`
- `estado`: `auditoria_inicial_atualizada_pos_hidratacao`
- `escopo`: `docs/planificacao/guias-bk/MF0/`

## Objetivo

Auditar a hidratacao pedagogica e tecnica dos guias BK da `MF0`, procurando lacunas que dificultem a implementacao por alunos do 12.º ano no contexto OPSA: ERP financeiro/contabilistico para PME, com autenticacao, permissoes, multiempresa, dados mestre, SNC, periodos fiscais, faturacao, stock, contabilidade, auditoria e IA preditiva nas fases seguintes.

Esta auditoria nao altera RF, RNF, IDs BK, owners, prioridades, dependencias nem escopo. O foco e identificar o que falta hidratar antes de editar os guias.

## Fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- Todos os guias em `docs/planificacao/guias-bk/MF0/`

## Criterio usado

- `OK`: o guia permite implementacao autonoma, segura e testavel, com codigo completo, payloads, erros, ficheiros e evidence.
- `PARCIAL`: o guia tem bom enquadramento, scope, endpoints e negativos, mas ainda falta codigo completo, payloads, localizacao exata dentro dos ficheiros reais ou decisoes tecnicas necessarias para fechar o BK.
- `CRITICO`: a lacuna impede implementacao autonoma por alunos ou cria risco elevado de seguranca, fuga multiempresa, erro fiscal/contabilistico, quebra de integridade ou drift funcional.

## Resultado geral

- BKs analisados: `12`
- `OK`: `0`
- `PARCIAL`: `4`
- `CRITICO`: `8`

Observacao transversal: todos os guias MF0 estao melhor do que um esqueleto generico, porque ja indicam requisito, impacto, endpoints, ficheiros-alvo, negativos e handoff. Mesmo assim, nenhum cumpre integralmente o criterio de BK hidratado: todos deixam implementacao em aberto com passos como "criar service", "criar controller", "adicionar modelos" ou "ligar frontend", acompanhados apenas por snippets pequenos que declaram explicitamente nao substituir a implementacao completa.

## Atualizacao pos-hidratacao - 2026-05-29

Foram editados os 12 guias MF0 classificados como `PARCIAL` ou `CRITICO`. Cada guia recebeu a seccao `Hidratacao tecnica executavel (2026-05-29)` antes dos criterios de aceite, com:

- regra funcional simples;
- impacto ERP;
- ficheiros a criar/editar;
- localizacao exata por ficheiro;
- codigo completo de referencia para schema, validators, services, controllers e routes quando aplicavel;
- payloads e respostas;
- validacoes, erros e cenarios negativos;
- evidence para PR/defesa;
- handoff para o BK seguinte;
- `Decisão em falta` quando a documentacao ainda nao fecha a regra.

Decisoes tecnicas usadas:

- Como nao existe scaffold real `apps/`, todos os caminhos seguem `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
- Backend assumido conforme contrato: Node.js/Express em ES Modules, Prisma e PostgreSQL.
- Dados empresariais usam `companyId` no backend e nunca confiam em `companyId` enviado no body.
- Roles/permissoes sao aplicadas no backend atraves de guards.
- Operacoes com historico futuro usam soft delete quando apagar fisicamente criaria risco de integridade.
- Dinheiro em artigos usa centimos; IVA temporario usa basis points ate `BK-MF1-01` fechar a tabela de IVA.
- `BK-MF0-08` nao implementa reabertura de periodo fiscal porque RF08/RNF nao definem essa regra.

Bloqueios/decisoes em falta que continuam documentados nos guias:

- Confirmar dependencia `bcrypt` no setup real.
- Fechar matriz oficial de permissoes se vier a existir documento mais detalhado.
- Definir onboarding/seed da primeira empresa e membership.
- Escolher provider real de email, templates e fluxo de aceitacao de convite.
- Substituir rate limit em memoria por armazenamento partilhado quando houver arquitetura de deploy.
- Confirmar storage/upload de logotipo.
- Confirmar fonte oficial do plano SNC e parser CSV/Excel para importacao real.
- Definir regra legal/auditoria para reabrir periodos fiscais, se essa operacao existir.
- Confirmar politica para NIF opcional em clientes/fornecedores estrangeiros ou particulares.
- Confirmar tabela legal de IVA e politica de arredondamentos em MF1.

Tabela pos-hidratacao:

| BK | Hidratação executada | Decisões em falta principais | Estado pós-hidratação |
| --- | --- | --- | --- |
| BK-MF0-01 | Auth completa com User/Session, hash, cookies, validators, service, controller, routes, payloads e negativos. | Confirmar `bcrypt` no package real. | Hidratado com decisão em falta |
| BK-MF0-02 | Matriz de permissoes, guards backend e endpoint `GET /api/permissions/me`. | Confirmar matriz oficial futura, se existir. | Hidratado com decisão em falta |
| BK-MF0-03 | Company, memberships, empresa ativa, contexto multiempresa e `requireCompanyContext`. | Confirmar onboarding/seed inicial. | Hidratado com decisão em falta |
| BK-MF0-04 | Convites, memberships, token hash, ultimo ADMIN, soft removal e adapter de email. | Provider de email e aceitacao de convite. | Hidratado com decisão em falta |
| BK-MF0-05 | Password reset seguro, token one-use, anti-enumeration, rate limit e revogacao de sessoes. | Provider de email e rate limit distribuido. | Hidratado com decisão em falta |
| BK-MF0-06 | CompanyProfile, validacao NIF, EUR documentado, payloads GET/PUT e permissoes. | Storage de logotipo e eventual multi-moeda. | Hidratado com decisão em falta |
| BK-MF0-07 | Account por empresa, criacao e importacao de rows normalizadas, conflitos e rollback logico. | Fonte SNC oficial e parser CSV/Excel. | Hidratado parcialmente por falta documental |
| BK-MF0-08 | FiscalPeriod, anti-sobreposicao, close, `assertOpenFiscalPeriod` e handoff de auditoria. | Reabertura de periodo e auditoria operacional. | Hidratado com decisão em falta |
| BK-MF0-09 | Customer por empresa, NIF/email, soft delete, CRUD, payloads e negativos. | Politica de NIF opcional. | Hidratado com decisão em falta |
| BK-MF0-10 | Supplier por empresa, NIF/email, soft delete, CRUD, payloads e negativos. | Politica de NIF opcional. | Hidratado com decisão em falta |
| BK-MF0-11 | Item/Product/Service, SKU unico, dinheiro em centimos, IVA bps, CRUD e negativos. | Tabela IVA MF1 e arredondamentos. | Hidratado com decisão em falta |
| BK-MF0-12 | Warehouse/Location por empresa, unicidade, endpoints, payloads e negativos. | Sem bloqueio; manter fora do scope movimentos de stock. | Hidratado |

## Validacao apos hidratacao

Comandos executados:

```bash
bash scripts/validate-planificacao.sh
git diff --check
rg -c "^## Hidratacao tecnica executavel" docs/planificacao/guias-bk/MF0
```

Resultado:

- `bash scripts/validate-planificacao.sh` falhou antes de validar os guias, porque tenta abrir `../scripts/validate_planificacao_canonica.py` e esse ficheiro nao existe a partir do repositorio OPSA.
- `git diff --check` passou sem erros de whitespace.
- A contagem confirmou 1 seccao `Hidratacao tecnica executavel` em cada um dos 12 guias MF0.

Nota: a tabela seguinte permanece como fotografia da auditoria inicial, antes das edicoes.

## Tabela de classificacao inicial

| BK | Estado | Problema | O que falta hidratar | Prioridade |
| --- | --- | --- | --- | --- |
| BK-MF0-01 | CRITICO | Autenticacao e sessao sao fundacao de seguranca, mas o guia nao entrega schema, service, controller, rotas, hashing, CSRF/rate limit nem payloads completos. | Codigo completo para `User`, `Session`, validadores, auth service, cookies, rotas, frontend auth, testes e exemplos request/response com 400/401/409. | Imediata |
| BK-MF0-02 | CRITICO | RBAC fica reduzido a enum/middleware generico; falta matriz concreta de permissoes por role e acao. | Enum partilhado, matriz Admin/Gestor/Contabilista/Operacional/Auditor, guards por endpoint, payloads, 401/403/404/409 e testes de escalada de privilegios. | Imediata |
| BK-MF0-03 | CRITICO | Multiempresa e isolamento por `companyId` sao centrais, mas nao ha codigo completo de membership, contexto ativo ou queries isoladas. | Schema `Company`/`CompanyMembership`, `requireCompanyContext`, selecao de empresa, exemplos de dados cruzados, payloads e testes anti-fuga entre empresas. | Imediata |
| BK-MF0-04 | CRITICO | Convites e gestao de roles mexem em acessos sensiveis; falta fluxo completo de token, email, alteracao/remocao e protecao do ultimo Admin. | Codigo de invitation token/hash/expiracao, service de role update/remocao, email adapter, guards, auditoria minima, payloads e negativos completos. | Imediata |
| BK-MF0-05 | CRITICO | Recuperacao de password exige seguranca forte, mas faltam integracao com hash de password, tokens one-use, rate limit e adapter de email. | Schema `PasswordResetToken`, token hash/expiry/usedAt, service completo, reset seguro, responses anti-enumeration, testes e exemplos de payload. | Imediata |
| BK-MF0-06 | PARCIAL | Dados da empresa estao bem enquadrados, mas NIF, moeda, logotipo e periodo fiscal ficam sem contrato tecnico completo. | Schema `CompanyProfile`, validacao de NIF mais robusta, politica de upload/storage, payloads GET/PUT, permissoes, 404 e testes. | Alta |
| BK-MF0-07 | CRITICO | Plano de contas SNC e base contabilistica; o guia reconhece que falta fonte oficial e nao fornece importador completo. | Schema `Account`, campos contabilisticos minimos, fonte/ficheiro base SNC, parser CSV, erros por linha, transacao/rollback e testes de importacao. | Imediata |
| BK-MF0-08 | CRITICO | Periodos fiscais fechados protegem integridade contabilistica, mas falta enforcement completo e o endpoint de reabertura nao tem regra documentada. | Schema `FiscalPeriod`, constraints anti-sobreposicao, transicoes OPEN/CLOSED, `assertOpenFiscalPeriod` integrado em services futuros, auditoria minima, payloads e 403/409/404. | Imediata |
| BK-MF0-09 | PARCIAL | Clientes tem scope, endpoints e negativos, mas CRUD completo, payloads, 404 e soft delete ficam em aberto. | Schema `Customer`, service/controller/rotas completos, validacao fiscal/email, isolamento por empresa, exemplos request/response, UI e testes. | Alta |
| BK-MF0-10 | PARCIAL | Fornecedores segue o padrao de clientes; falta implementacao completa, politicas de edicao/remocao e payloads. | Schema `Supplier`, service/controller/rotas completos, validacao fiscal/email, permissoes, soft delete, 404/409 e evidence manual/automatizada. | Alta |
| BK-MF0-11 | CRITICO | Artigos/servicos alimentam faturacao e stock; falta decisao sobre dinheiro, IVA temporario vs tabela futura e comportamento PRODUCT/SERVICE. | Schema `Item`, valores monetarios, SKU unico, tipo produto/servico, contrato de IVA ate BK-MF1-01, payloads, erros e testes. | Imediata |
| BK-MF0-12 | PARCIAL | Armazens/localizacoes e P1/Core tem bom scope, mas ainda nao e executavel sem codigo e payloads. | Schema `Warehouse`/`WarehouseLocation`, services/controllers, endpoints de consulta de localizacoes, 401/403/404/409, UI e testes. | Media-alta |

## Lacunas transversais

1. Falta codigo completo.
   Todos os guias pedem implementacao, mas fornecem apenas um snippet parcial. A frase "Este snippet e referencia pequena, nao substitui a implementacao completa" aparece nos guias e confirma que o criterio de hidratacao tecnica ainda nao esta cumprido.

2. Falta localizacao exata dentro dos ficheiros reais.
   Os guias indicam caminhos assumidos como `apps/api/...` e `apps/web/...`, mas a app real ainda esta marcada como `sem_codigo`. Isto e coerente com `CONTRATO-STACK-IMPLEMENTACAO.md`, mas para alunos falta indicar exatamente onde colar/criar cada bloco quando o scaffold existir.

3. Faltam exemplos de payload request/response.
   Os endpoints estao listados, mas quase nenhum guia mostra JSON completo de entrada e saida para sucesso e erro.

4. Tratamento de erros incompleto.
   Os guias citam 400, 401, 403 e 409 "quando aplicavel", mas falta sistematizar 404, conflitos por estado, respostas de validacao por campo e formato uniforme de erro.

5. Testes ainda nao sao implementaveis.
   Ha smoke e negativos, mas faltam testes completos, fixtures, comandos concretos e exemplos de outputs esperados.

6. Evidence esta como placeholder.
   Todos os guias deixam `pr`, `proof`, `neg`, `files`, `commands` e `screenshots` "a preencher". Isto e aceitavel antes da implementacao, mas a hidratacao do guia deve mostrar exemplos de evidence esperada.

7. Seguranca e auditoria precisam de reforco.
   MF0 tem operacoes sensiveis: auth, roles, convites, password reset, fecho de periodos e dados mestre. Falta codigo ou instrucao concreta para rate limiting, CSRF, hashing, token hashing, guards por role, logs/audit minimos e fuga multiempresa.

8. Dominio fiscal/contabilistico ainda esta pouco operacional.
   NIF e validado sobretudo por regex, o SNC nao tem fonte confirmada, periodos fiscais nao mostram constraints reais, IVA em artigos fica temporario ate BK-MF1-01 e valores monetarios ainda nao tem representacao decidida.

## Detalhe por BK problematico

### BK-MF0-01 - Registo, login e logout com cookies HttpOnly

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-login-e-logout-com-cookies-httponly.md`
- Lacuna concreta: falta implementacao completa do fluxo de autenticacao; o snippet so define `setSessionCookie`.
- Codigo/instrucoes em falta: `schema.prisma` com `User`/`Session`, migration, validadores de registo/login, `authService`, controller, routes, middleware de sessao, frontend auth client, testes e payloads.
- Risco tecnico: sessoes inseguras, passwords mal armazenadas, cookie mal configurado, ausencia de rate limit/CSRF e impossibilidade de proteger BKs seguintes.
- Risco pedagogico: alunos ficam sem referencia concreta para construir o primeiro modulo real da app.
- Prioridade de hidratacao: Imediata.

### BK-MF0-02 - Papeis e permissoes

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md`
- Lacuna concreta: roles canonicas estao descritas, mas a politica de permissoes por dominio/acao nao esta materializada.
- Codigo/instrucoes em falta: enum partilhado, matriz de permissoes, middleware por role, exemplos por endpoint, payloads de erro 401/403, testes de permissao.
- Risco tecnico: autorizacao inconsistente e escalada de privilegios.
- Risco pedagogico: alunos podem esconder botoes no frontend e esquecer enforcement no backend.
- Prioridade de hidratacao: Imediata.

### BK-MF0-03 - Multiempresa

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-03-multi-empresa-um-utilizador-pode-ter-papeis-diferentes-em-varias-empresas.md`
- Lacuna concreta: isolamento por empresa e role por membership sao explicados, mas sem implementacao completa.
- Codigo/instrucoes em falta: schema `Company`/`CompanyMembership`, selecao de empresa ativa, middleware de contexto, queries sempre filtradas por `companyId`, exemplos de pedidos e testes anti-fuga.
- Risco tecnico: fuga de dados entre empresas, o erro mais grave para um ERP multiempresa.
- Risco pedagogico: alunos podem tratar `role` como global e propagar uma arquitetura errada para todos os dados mestre.
- Prioridade de hidratacao: Imediata.

### BK-MF0-04 - Gestao de utilizadores

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-04-gestao-de-utilizadores-convite-remocao-e-definicao-de-papeis.md`
- Lacuna concreta: convite, remocao e alteracao de role sao sensiveis, mas falta fluxo completo e auditavel.
- Codigo/instrucoes em falta: token/hash/expiracao de convite, email adapter, service para alterar/remover membership, regra de ultimo Admin, guards e payloads.
- Risco tecnico: contas adicionadas/removidas indevidamente, empresa sem Admin ou convites reutilizaveis.
- Risco pedagogico: alunos nao veem a diferenca entre apagar utilizador global e remover membership da empresa.
- Prioridade de hidratacao: Imediata.

### BK-MF0-05 - Recuperacao de password

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-05-recuperacao-de-password-via-email.md`
- Lacuna concreta: o guia tem bons conceitos anti-enumeration, mas falta a implementacao de seguranca completa.
- Codigo/instrucoes em falta: `PasswordResetToken`, hash de token, expiracao, invalidacao apos uso, integracao com hash de password, rate limit, adapter de email e payloads.
- Risco tecnico: account takeover, user enumeration, tokens reutilizaveis ou reset sem seguranca suficiente.
- Risco pedagogico: alunos podem copiar o snippet e pensar que o fluxo esta completo.
- Prioridade de hidratacao: Imediata.

### BK-MF0-06 - Dados da empresa

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-06-registar-dados-da-empresa-nif-morada-moeda-logotipo-periodo-fiscal.md`
- Lacuna concreta: tem regra de negocio clara, mas falta contrato final para NIF, moeda, logotipo e periodo fiscal.
- Codigo/instrucoes em falta: schema completo, validacao NIF mais robusta, politica de upload/storage, exemplos GET/PUT, permissoes e testes.
- Risco tecnico: dados fiscais invalidos, upload perigoso ou incompatibilidade futura com SAF-T/faturacao.
- Risco pedagogico: alunos conseguem criar formulario basico, mas nao sabem fechar requisitos fiscais e de ficheiros.
- Prioridade de hidratacao: Alta.

### BK-MF0-07 - Plano de contas SNC

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-07-criar-importar-plano-de-contas-snc.md`
- Lacuna concreta: o proprio guia deixa como blocker confirmar fonte oficial/ficheiro base do plano SNC.
- Codigo/instrucoes em falta: schema `Account`, campos contabilisticos minimos, importador CSV completo, validacao por linha, relatorio de erros e transacao/rollback.
- Risco tecnico: plano de contas invalido, lancamentos futuros sem base contabilistica consistente.
- Risco pedagogico: alunos podem inventar contas SNC ou importar dados sem validacao.
- Prioridade de hidratacao: Imediata.

### BK-MF0-08 - Periodos fiscais

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-08-abrir-e-fechar-periodos-fiscais-bloqueando-lancamentos-apos-fecho.md`
- Lacuna concreta: falta enforcement completo do bloqueio e o endpoint de reabertura precisa regra documental clara.
- Codigo/instrucoes em falta: schema com constraints anti-sobreposicao, service de abertura/fecho, `assertOpenFiscalPeriod`, integracao futura em services de documentos/lancamentos, auditoria minima, payloads e testes.
- Risco tecnico: lancamentos em periodos fechados, relatorios inconsistentes e possivel drift se reabertura permitir comportamento nao definido.
- Risco pedagogico: alunos podem implementar apenas o estado visual do periodo sem bloquear escritas reais.
- Prioridade de hidratacao: Imediata.

### BK-MF0-09 - Clientes

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-09-criar-e-gerir-clientes.md`
- Lacuna concreta: bom guia funcional, mas CRUD nao esta materializado.
- Codigo/instrucoes em falta: schema `Customer`, validadores, service, controller, routes, frontend, payloads de create/list/update/delete, 404 e testes.
- Risco tecnico: clientes duplicados por empresa, fuga multiempresa ou faturas futuras sem `customerId` confiavel.
- Risco pedagogico: alunos sabem o que fazer, mas nao tem o "como" completo.
- Prioridade de hidratacao: Alta.

### BK-MF0-10 - Fornecedores

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-10-criar-e-gerir-fornecedores.md`
- Lacuna concreta: repete o padrao de clientes, mas sem codigo completo e sem payloads.
- Codigo/instrucoes em falta: schema `Supplier`, validadores, service, controller, routes, frontend, soft delete, 404/409 e testes.
- Risco tecnico: fornecedores duplicados, compras futuras ligadas a dados inconsistentes ou escrita por role sem permissao.
- Risco pedagogico: alunos podem copiar clientes sem perceber diferencas de dominio de compras.
- Prioridade de hidratacao: Alta.

### BK-MF0-11 - Artigos/servicos

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-11-criar-artigos-servicos-sku-custo-preco-iva.md`
- Lacuna concreta: catalogo, IVA e valores monetarios ficam com decisoes tecnicas abertas.
- Codigo/instrucoes em falta: schema `Item`, representacao de dinheiro, SKU unico por empresa, tipo PRODUCT/SERVICE, estrategia temporaria de IVA ate BK-MF1-01, payloads e testes.
- Risco tecnico: precos/custos incorretos, IVA invalido, stock/faturacao futura com dados ambiguos.
- Risco pedagogico: alunos podem guardar dinheiro como float e criar regras fiscais que depois conflitam com RF13.
- Prioridade de hidratacao: Imediata.

### BK-MF0-12 - Armazens e localizacoes

- Guia: `docs/planificacao/guias-bk/MF0/BK-MF0-12-criar-armazens-e-localizacoes.md`
- Lacuna concreta: sendo P1/Core, o scope e simples, mas ainda falta codigo e contrato completo para MF2.
- Codigo/instrucoes em falta: schema `Warehouse`/`WarehouseLocation`, services/controllers/routes, endpoints de consulta de localizacoes, payloads, 401/403/404/409 e testes.
- Risco tecnico: movimentos de stock futuros sem `warehouseId`/`locationId` estaveis.
- Risco pedagogico: alunos podem confundir criacao de armazens com movimentos de stock, que estao fora do BK.
- Prioridade de hidratacao: Media-alta.

## BKs que impedem alunos de avancar

Impedem avancar de forma autonoma e segura: `BK-MF0-01`, `BK-MF0-02`, `BK-MF0-03`, `BK-MF0-04`, `BK-MF0-05`, `BK-MF0-07`, `BK-MF0-08`, `BK-MF0-11`.

Podem ser iniciados, mas nao devem ser fechados como DONE sem hidratacao adicional: `BK-MF0-06`, `BK-MF0-09`, `BK-MF0-10`, `BK-MF0-12`.

## Drift encontrado

- Drift de metadados canonicos: nao detetado nesta auditoria. Os IDs, owners, prioridades, dependencias e RF dos guias MF0 estao alinhados com `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md` e `MF-VIEWS.md`.
- Drift funcional potencial: `BK-MF0-08` propoe `POST /api/fiscal-periods/:id/reopen`, mas as regras de reabertura nao estao definidas em RF/RNF. Deve ficar como operacao explicitamente condicionada ou ser retirada ate haver evidencia documental.
- Assuncao a confirmar: `BK-MF0-06` assume EUR como moeda base do MVP. E coerente com o dominio portugues, mas deve ser documentado como decisao tecnica/funcional para nao parecer alteracao silenciosa do RF06.
- Dependencia tecnica nao canonica: `BK-MF0-05` tem dependencia canonica `-`, mas na pratica depende do contrato de `User`/hash de `BK-MF0-01`. O guia trata isto como reutilizacao opcional/paralela, nao como alteracao canonica.

## Proxima ordem recomendada de hidratacao

1. `BK-MF0-01` -> `BK-MF0-02` -> `BK-MF0-03`: base de identidade, autorizacao e multiempresa.
2. `BK-MF0-04` -> `BK-MF0-05`: operacoes sensiveis de utilizadores e recuperacao.
3. `BK-MF0-07` -> `BK-MF0-08`: base contabilistica e periodos fechados.
4. `BK-MF0-11`: catalogo com IVA/dinheiro antes de vendas/compras.
5. `BK-MF0-06`, `BK-MF0-09`, `BK-MF0-10`, `BK-MF0-12`: completar payloads/codigo/testes e fechar dados mestre.

## Checklist minimo para proxima hidratacao

Cada guia MF0 deve passar a incluir:

- Modelos Prisma completos ou equivalente.
- Ficheiros exatos a criar/editar, com localizacao dentro do scaffold real.
- Codigo completo para validators, services, controllers/routes e testes.
- Comentarios didaticos no codigo, especialmente em seguranca, multiempresa e contabilidade.
- Payloads request/response de sucesso e erro.
- Mapa de erros por endpoint, incluindo `400`, `401`, `403`, `404` e `409` quando aplicavel.
- Testes negativos alinhados com prioridade.
- Evidence exemplificada para PR/defesa.
- Nota explicita quando uma decisao e derivada e nao diretamente exigida por RF/RNF.
