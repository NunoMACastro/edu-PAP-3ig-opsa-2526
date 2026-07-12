# Auditoria transversal de UI/UX — `real_dev`

> **Atualização após correção — 2026-07-12:** este documento preserva a fotografia original abaixo. A implementação posterior fechou UX-01, UX-02, UX-03, UX-04, UX-07, UX-08 e UX-11; UX-05, UX-06, UX-09, UX-10 e UX-12 ficaram parcialmente migrados. O estado corrente, evidências e limitações estão em `CORRECAO-UI-UX-REAL_DEV-2026-07-12.md`. A decisão atual continua `NAO_PRONTO_PARA_VALIDACAO_UI_UX_DE_RELEASE` porque UX-06 ainda não cobre todos os formulários especializados e a matriz E2E Chrome/Edge/Firefox não pôde arrancar sem Chrome e Edge instalados.

## 1. Identificação

- Projeto: OPSA
- Data: 2026-07-12
- Implementation root: `real_dev`
- Superfície principal: `real_dev/web`
- Referência visual: `mockup/`
- Modo: auditoria e relatório; sem correções à implementação
- Decisão: `NAO_PRONTO_PARA_VALIDACAO_UI_UX_DE_RELEASE`
- Findings: 3 de prioridade alta, 7 de prioridade média e 2 de prioridade baixa

## 2. Conclusão executiva

A implementação já tem uma base visual coerente com a identidade OPSA, componentes reutilizáveis, adaptação mobile, formatação PT-PT, controlo de permissões e vários estados de feedback. O frontend compila, passa os 34 testes unitários e os gates estáticos de responsividade, acessibilidade, formulários, mensagens de erro, performance, alinhamento visual MF8 e formatadores.

Ainda não deve ser considerada pronta para uma validação UI/UX de release. Os principais riscos são:

1. a navegação autenticada coloca 46 rotas de domínio numa estrutura quase plana e não oferece dashboard, pesquisa, favoritos ou agrupamento orientado à tarefa;
2. a empresa ativa, decisiva numa aplicação multiempresa e contabilística, fica no fundo de uma sidebar longa em vez de permanecer visível junto do conteúdo e das ações;
3. várias operações destrutivas ou irreversíveis não pedem confirmação contextual;
4. os formulários apresentam erros globais, mas não ligam o erro ao campo, não marcam `aria-invalid` e não movem o foco para a correção;
5. existe pelo menos uma combinação de texto normal abaixo do contraste WCAG AA e o menu móvel não funciona como modal acessível;
6. as listagens genéricas expõem nomes de campos da API e demasiada informação sem priorização por tarefa.

A aproximação ao mockup está sobretudo nos tokens, cores, sidebar e tratamento de cards. A arquitetura de informação do mockup — dashboard, oito áreas de negócio, header com empresa/utilizador e navegação compacta — ainda não foi transportada para o produto real.

## 3. Âmbito e método

### 3.1 Áreas cobertas

- Públicas: identidade/registo/login, recuperação de password, aceitação de convite, erros de sessão e rota desconhecida.
- Pré-contexto: onboarding e seleção/criação de empresa.
- Autenticadas: configuração, utilizadores, perfil, plano de contas, períodos fiscais, vendas, compras, inventário, contabilidade, fiscalidade, tesouraria, importações, SAF-T, relatórios, IA, lembretes, tarefas, notificações, auditoria, integrações e subscrições.
- Estados transversais: loading, vazio, sucesso, aviso, erro, forbidden, sessão expirada, permissões indisponíveis, paginação e lazy loading.
- Viewports: desktop real a 1280 × 720 e mobile real a 375 × 667 na superfície pública; breakpoints e componentes autenticados por código, testes e gates existentes.
- Perfis: o frontend prevê `ADMIN`, `GESTOR`, `CONTABILISTA`, `OPERACIONAL` e `AUDITOR`; foram verificados os filtros de links, páginas e operações por permission/role.

### 3.2 Evidência utilizada

- Renderização real no browser da aplicação React servida por Vite.
- DOM acessível, métricas de viewport, overflow, dimensões e estilos computados.
- Leitura de `App.tsx`, páginas MF1–MF4/MF8, chat, componentes de UI, CSS, cliente HTTP, permissões, testes E2E e mockup.
- Execução de testes unitários, gates UI, typecheck e build.

### 3.3 Limitação de prova

A passagem visual autenticada com dados OPSA reais não foi concluída. A porta `3000` estava ocupada por uma API de outro projeto (`studyflow_alt`) e o checkout OPSA não disponibilizava `.env`/`DATABASE_URL` para levantar uma instância alternativa. A tentativa da API OPSA terminou apenas com `api.start_failed`/`START_FAILED`.

Por isso:

- os findings públicos e responsivos assinalados como observados foram reproduzidos no browser;
- os findings autenticados resultam de evidência direta no código, nos componentes partilhados e nos contratos/testes do projeto;
- não se afirma paridade visual autenticada pixel a pixel nem qualidade de dados seed em execução;
- o E2E completo não correu porque o gate exige Google Chrome e Microsoft Edge instalados e ambos estavam ausentes.

## 4. Cobertura funcional

| Área | Superfícies principais | Tipo de prova | Resultado resumido |
| --- | --- | --- | --- |
| Identidade pública | `/auth`, registo, login, recuperação, sessão, logout | Browser desktop/mobile + código | Funcionalmente legível; composição e copy precisam de revisão |
| Convites e reset | `/aceitar-convite`, `/recuperar-password` | Código + testes | Bom cuidado com tokens em fragmento; falta passagem visual completa |
| Onboarding/contexto | `/onboarding`, `/companies` | Código + testes | Fluxo existe; contexto ativo não permanece suficientemente visível |
| Configuração | empresa, utilizadores, perfil, contas, períodos | Código + unit/integration DOM | Padrão consistente; ações sensíveis e formulários precisam de melhor proteção |
| Vendas/compras | documentos, aprovações, recebimentos, pagamentos, lançamentos | Código + testes | Cobertura funcional ampla; confirmações e hierarquia de ações insuficientes |
| Inventário | artigos, armazéns, movimentos, FIFO, contagens, alertas | Código + testes | Formulários especializados melhores; ainda há excesso de operações simultâneas |
| Contabilidade/fiscal | contas, lançamentos, mapas, DR/balanço, SAF-T | Código + gates | Formatação e downloads estruturados; risco alto em ações irreversíveis |
| Tesouraria/importação | contas, extratos, reconciliação, previsão, importações | Código + testes | Seletores de referências melhoram UX; estados complexos precisam de validação visual |
| Relatórios | operacionais e KPIs | Código + gates de performance | Estrutura funcional; não existe dashboard agregado de entrada |
| IA | insights, sugestões, chat, alertas, settings | Código + testes | Guardrails e fontes são pontos fortes; linguagem de estados ainda técnica |
| Operações/auditoria | lembretes, tarefas, notificações, audit/integration logs | Código + testes | Funcional; navegação e densidade tornam a descoberta difícil |
| Subscrições | planos e ações simuladas | Código + gates MF8 | Página dedicada e estruturada; cancelamento precisa de confirmação contextual |

## 5. Pontos fortes confirmados

1. **Sistema visual partilhado.** Tokens OPSA, tipografia, focus ring, cards, mensagens, badges, tabelas e drawers são centralizados em `styles.css` e `ui/opsaUi.tsx`.
2. **Responsividade base funcional.** No browser, a página pública a 375 px não apresentou overflow horizontal (`scrollWidth=360`, viewport útil de 375 px). A sidebar transforma-se em drawer e as tabelas passam a cards abaixo de 640 px.
3. **Semântica e feedback.** Existe skip link, hierarquia de headings, labels, `role=status`/`role=alert`, estados busy e preservação dos campos em erro.
4. **Segurança e RBAC refletidos na UI.** Links, páginas e operações são filtrados por permissions; deep links têm deny-by-default.
5. **Dados apresentados com proteção.** `StructuredResult` limita profundidade e remove chaves sensíveis em vez de despejar JSON técnico.
6. **Localização financeira.** Datas, moeda, percentagens e inteiros têm formatadores PT-PT partilhados.
7. **Chat mais maduro.** O drawer de IA implementa `role=dialog`, `aria-modal`, foco inicial, focus trap, Escape e devolução do foco; este padrão pode ser reutilizado no menu móvel e noutras confirmações.
8. **Performance e modularização.** Rotas pesadas usam lazy loading e existe aviso quando uma listagem excede o orçamento definido.

## 6. Findings prioritizados

| ID | Prioridade | Área | Finding | Impacto principal |
| --- | --- | --- | --- | --- |
| UX-01 | Alta | Navegação autenticada | 46 rotas de domínio são apresentadas em apenas dois grandes grupos, sem dashboard ou navegação orientada à tarefa | Descoberta lenta, scroll excessivo e carga cognitiva |
| UX-02 | Alta | Multiempresa | Empresa ativa e role ficam no fundo da sidebar, depois de toda a navegação | Risco de executar operações na empresa errada |
| UX-03 | Alta | Ações sensíveis | Remoções, fechos, rejeições e cancelamentos não têm confirmação contextual consistente | Erro humano com impacto contabilístico ou destrutivo |
| UX-04 | Média | Autenticação pública | Registo, login, recuperação, “Sessao atual” e logout aparecem simultaneamente | Primeiro contacto confuso e página mobile excessivamente longa |
| UX-05 | Média | Listagens | Headers e labels mobile usam diretamente as chaves da API e todas as colunas | Informação técnica, IDs e ruído sobrepõem-se às decisões do utilizador |
| UX-06 | Média | Formulários/acessibilidade | Erros são globais e não ficam associados aos campos | Correção mais lenta; barreira para leitor de ecrã e teclado |
| UX-07 | Média | Menu mobile | Drawer da sidebar não tem semântica modal, focus trap nem `inert` no conteúdo | O foco pode sair do menu e chegar ao conteúdo oculto pelo backdrop |
| UX-08 | Média | Contraste | Labels usam `rgba(0,78,83,.7)` a 15,84 px, medido em cerca de 4,28:1 sobre branco | Falha WCAG AA para texto normal |
| UX-09 | Média | Composição dos módulos | CRUD e ações aparecem simultaneamente em grelhas extensas, incluindo ações perigosas | Falta de foco, páginas longas e maior probabilidade de engano |
| UX-10 | Média | Conteúdo e erros | Copy mistura PT/English, omite acentos e expõe `HTTP`, códigos e “evidence” | Mensagens pouco naturais e demasiado técnicas |
| UX-11 | Baixa | Autenticação | Inputs de login/registo não definem `autocomplete` apropriado | Pior integração com password managers e autofill |
| UX-12 | Baixa | Estados vazios | “Sem registos para apresentar” é igual em todos os módulos | Não explica causa nem oferece próxima ação contextual |

## 7. Detalhe dos findings

### UX-01 — Navegação autenticada demasiado plana

**Evidência**

- `App.tsx` agrega 9 resources e 37 pages e renderiza-os por `map` em apenas “Configuração” e “Módulos” (`real_dev/web/src/App.tsx:1964-1981`, `2049-2076`).
- A rota raiz e o pós-login enviam para `/companies`, não para um dashboard (`real_dev/web/src/App.tsx:1983-1994`, `2150-2166`).
- O mockup prevê Dashboard e oito áreas de negócio de primeiro nível (`mockup/src/app/components/Layout.tsx`).

**Recomendação**

Criar uma arquitetura de informação por domínio: Visão geral, Vendas, Compras, Inventário, Contabilidade, Tesouraria, Relatórios, IA e Administração. Cada grupo deve ser expansível, recordar estado e mostrar apenas os 4–7 destinos mais frequentes. Adicionar dashboard inicial com atalhos, pendências, alertas e empresa ativa.

**Critério de aceitação**

- nenhuma role vê mais de 9 opções de primeiro nível;
- existe pesquisa/command palette ou favoritos para módulos menos frequentes;
- o pós-login abre uma visão geral útil, mantendo deep links quando existirem.

### UX-02 — Contexto multiempresa não persistente

**Evidência**

- A empresa e a role são apresentadas apenas em `sessionSummary`, depois do `nav` (`real_dev/web/src/App.tsx:2077-2084`).
- A sidebar tem scroll próprio e a sessão usa `margin-top:auto`, pelo que, com dezenas de links, o contexto fica no fim da lista (`real_dev/web/src/styles.css`).
- O mockup coloca utilizador/role e empresa no header, sempre junto do conteúdo.

**Recomendação**

Adicionar um header persistente com empresa ativa, role, período fiscal e seletor de empresa. Repetir o nome da empresa nas confirmações das operações sensíveis.

**Critério de aceitação**

Em qualquer módulo e viewport, a pessoa consegue confirmar a empresa ativa sem abrir menu ou fazer scroll.

### UX-03 — Falta de confirmação em ações destrutivas/irreversíveis

**Evidência**

- Remoção de clientes, fornecedores e artigos usa o mesmo `OperationForm` e submete diretamente (`real_dev/web/src/App.tsx:1665-1670`, `2226-2230`).
- Remover membro/revogar convite, fechar período, rejeitar venda, reprovar compra e cancelar subscrição também não partilham uma confirmação contextual.
- Apenas apagar conversa de IA usa `window.confirm`, e o chat já possui um drawer modal acessível que demonstra capacidade de focus management.

**Recomendação**

Criar `ConfirmationDialog` partilhado, com nome da entidade, empresa ativa, consequência, botão danger e confirmação reforçada para fecho de período/contabilização/cancelamento. A ação perigosa não deve partilhar o estilo amarelo primário.

**Critério de aceitação**

Toda a ação destrutiva, financeira ou irreversível exige confirmação específica e devolve recibo de sucesso inequívoco.

### UX-04 — Página pública de identidade mistura cinco intenções

**Evidência observada no browser**

- A página mostra Registo, Login, Recuperar password, Sessao atual e Logout ao mesmo tempo.
- Em mobile, a página atingiu cerca de 1290 px e obrigou a percorrer cinco cards; “Atualizar me” e “Logout” são comandos técnicos sem valor para uma sessão anónima.
- Os inputs estavam corretamente rotulados e não houve overflow horizontal.

**Recomendação**

Usar login como fluxo primário, links secundários para registo e recuperação, e mostrar sessão/logout apenas quando autenticado. Incluir contexto do produto e, se aplicável, conta demo.

### UX-05 — Tabelas expõem o contrato da API

**Evidência**

- `ResponsiveDataTable` cria colunas com `Object.keys(row)` e apresenta o nome cru da chave no desktop e mobile (`real_dev/web/src/ui/ResponsiveDataTable.tsx:44-63`, `81-90`).
- Objetos tornam-se “Detalhes disponíveis” e arrays apenas “N item(ns)”, sem forma genérica de abrir detalhes (`real_dev/web/src/App.tsx:333-381`).
- Em mobile, todas as colunas são repetidas em cada card, incluindo IDs e metadados operacionais.

**Recomendação**

Definir schemas de apresentação por recurso: coluna, label PT-PT, prioridade, largura, formato, visibilidade mobile e ação de detalhe. Esconder IDs técnicos por omissão e preservar apenas 3–5 atributos principais no card mobile.

### UX-06 — Erros não associados aos campos

**Evidência**

- Foram encontrados 48 formulários/submissões na superfície web.
- `OperationForm` agrega `validationErrors` numa única `StatusMessage`; não existe `aria-invalid`, `aria-describedby`, mapa de field errors ou foco automático no primeiro campo inválido (`real_dev/web/src/App.tsx:405-466`).
- A validação HTML nativa cobre apenas parte dos contratos de domínio.

**Recomendação**

Guardar erros por campo, mostrar texto junto ao input, ligar por `aria-describedby`, aplicar `aria-invalid=true`, manter um resumo no topo e focar o primeiro erro após submissão.

### UX-07 — Menu móvel não é um drawer modal acessível

**Evidência observada no browser**

- Após “Abrir menu”, o foco permanece no botão de toggle.
- A sidebar não tem `role=dialog`, `aria-modal` ou `tabIndex`; o `main` não recebe `inert`.
- O DOM acessível continua a expor todos os campos da página por trás do backdrop.
- O código apenas abre/fecha e reage a Escape (`real_dev/web/src/App.tsx:2005-2022`; `real_dev/web/src/styles.css:1020-1058`).

**Recomendação**

Reutilizar o padrão do `AiAssistantDrawer`: foco inicial, focus trap, Escape, devolução do foco e `inert`/`aria-hidden` no conteúdo de fundo.

### UX-08 — Contraste insuficiente em labels

**Evidência observada no browser**

- Estilo computado: `rgba(0, 78, 83, 0.7)`, 15,84 px, peso 700 sobre branco.
- Contraste calculado após composição: aproximadamente `4,28:1`.
- WCAG AA exige `4,5:1` para este tamanho de texto.
- Origem: `--opsa-text-muted` e `label span` (`real_dev/web/src/styles.css:18`, `156-161`).

**Recomendação**

Escurecer `--opsa-text-muted` para um valor que dê margem real, idealmente pelo menos 4,8:1, e acrescentar axe/contrast real no CI.

### UX-09 — Composição pouco orientada à tarefa

**Evidência**

- `ResourcePanel` apresenta tabela, paginação, todas as operações permitidas e resultado na mesma página (`real_dev/web/src/App.tsx:1040-1112`).
- Create, update, remove, import e ações de consulta competem na mesma `operationGrid`.
- Na autenticação, o mesmo padrão produziu cinco cards simultâneos; o problema escala nos módulos.

**Recomendação**

Usar listagem como superfície principal, ações primárias no header e drawer/modal para criar/editar. Ações secundárias devem estar no contexto da linha; perigosas, num menu separado e com confirmação.

### UX-10 — Copy demasiado técnica e inconsistente

**Evidência**

- Mensagens de erro incluem `HTTP`, código da API, “Proxima acao” e “guarda a evidence” (`real_dev/web/src/lib/mf5ErrorMessages.ts:133-140`).
- Exemplos visíveis/estáticos: “Sessao atual”, “Atualizar me”, “Logout”, “Role”, “Periodos”, “Lancamentos”, “servicos” e “Nao”.
- Estados da IA expõem `runId` e enums como `COMPLETED`/`FAILED` em vez de linguagem de produto.

**Recomendação**

Separar mensagem para utilizador de diagnóstico técnico. O UI mostra causa simples + próxima ação; status/code/request ID ficam em detalhe copiável. Normalizar todo o catálogo para português de Portugal e traduzir enums.

### UX-11 — Autofill de autenticação incompleto

`OperationForm` não permite configurar `autocomplete`; login/registo ficam sem `email`, `current-password` e `new-password`. Acrescentar o atributo ao schema de campos e distinguir os dois fluxos.

### UX-12 — Estados vazios sem orientação

O fallback genérico é sempre “Sem registos para apresentar” (`real_dev/web/src/ui/ResponsiveDataTable.tsx:40-42`). Cada módulo deve distinguir primeiro uso, resultado de pesquisa vazio, falta de permissão, filtro sem resultados e erro, oferecendo a ação seguinte apropriada.

## 8. Comparação com o mockup

| Aspeto | Mockup | `real_dev` | Avaliação |
| --- | --- | --- | --- |
| Paleta OPSA | Royal Green, Liquid, Light, amarelo | Tokens equivalentes | Conforme |
| Sidebar | 8 áreas com ícones e collapse | 46 destinos textuais em 2 grupos | Divergência alta |
| Dashboard | Destino principal | Inexistente; raiz vai para empresas | Divergência alta |
| Header | Módulo, utilizador, role, empresa, idioma | Inexistente | Divergência alta |
| Empresa ativa | Sempre no header | Fundo da sidebar | Divergência alta |
| Conteúdo | Módulos orientados ao domínio | Muitas grelhas CRUD genéricas | Divergência média/alta |
| Mobile | Sidebar recolhível | Drawer funcional visualmente | Parcial; falta modal acessível |
| IA/fontes | Área própria | Chat, insights, fontes e guardrails | Real superior no contrato funcional |

## 9. Validação executada

### Passou

- `npm run test:unit`: 10 ficheiros, 34 testes, todos passaram.
- `npm run test:mf5:responsive`: passou.
- `npm run test:mf5:a11y`: passou, mas é um contrato estático e não substitui axe real.
- `npm run test:mf5:forms`: passou.
- `npm run test:mf5:errors`: passou.
- `npm run test:mf5:performance`: passou.
- `npm run test:mf8:ui-alignment`: passou.
- `npm run test:mf8:formatters`: passou.
- `npm run typecheck`: passou.
- `npm run build`: passou; 71 módulos transformados.

### Falhou

- `npm run test:mf5:feedback`: falhou em `MF4 alertas confirmam sucesso`.
  - O gate procura `Alertas gerados com sucesso.`.
  - A UI atual usa o novo fluxo assíncrono `Análise agendada para o worker.`.
  - Classificação: drift entre gate estático e contrato atual; deve ser corrigido com um teste comportamental do estado queued/completed.

### Bloqueado

- `npm run test:e2e`: não iniciou porque faltam Google Chrome e Microsoft Edge. O próprio gate recusa skips e downloads automáticos.
- Não foi executado E2E seeded com API/PostgreSQL OPSA real.

## 10. Plano recomendado

### Fase 1 — Segurança operacional e acessibilidade

1. Tornar empresa/role/período fiscal persistentes no header.
2. Criar confirmation dialog comum para ações sensíveis.
3. Corrigir contraste de labels.
4. Corrigir menu móvel com focus trap e fundo inert.
5. Implementar field errors associados e foco no primeiro erro.

### Fase 2 — Arquitetura de informação

1. Criar dashboard autenticado.
2. Reagrupar navegação por domínio com níveis expansíveis.
3. Colocar create/edit em drawers e ações no contexto da linha.
4. Definir schemas de apresentação de tabelas e cards por recurso.

### Fase 3 — Conteúdo e polimento

1. Rever PT-PT, acentos, enums e nomenclatura.
2. Separar mensagens técnicas de mensagens de produto.
3. Melhorar empty states e autofill.
4. Afinar paridade com o mockup sem copiar limitações funcionais do protótipo.

### Fase 4 — Prova de release

1. Corrigir o gate MF5 de feedback.
2. Disponibilizar ambiente OPSA seed reproduzível.
3. Instalar/provisionar Chrome e Edge exigidos pelo gate.
4. Executar axe e screenshots em 375 × 667, 768 × 1024, 1280 × 720 e 1440 × 900.
5. Repetir os fluxos com as cinco roles e validar teclado, leitor de ecrã, zoom a 200% e dados longos/reais.

## 11. Critério de reavaliação

A decisão pode passar para `PRONTO_COM_RESSALVAS` quando UX-01, UX-02, UX-03, UX-06, UX-07 e UX-08 estiverem corrigidos e existir uma passagem E2E autenticada/seeded sem findings críticos ou altos. UX-04, UX-05, UX-09 e UX-10 devem pelo menos ter correções implementadas nos percursos de maior frequência antes da release.
