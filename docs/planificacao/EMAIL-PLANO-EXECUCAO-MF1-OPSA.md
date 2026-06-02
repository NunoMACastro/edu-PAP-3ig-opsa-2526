# Plano de Execucao - MF1 OPSA

Snapshot do backlog: `2026-06-01` (`opsa/docs/planificacao/backlogs/BACKLOG-MVP.md`).

Guias MF1 refinados: `2026-06-01` (`opsa/docs/planificacao/guias-bk/MF1/`).

Contrato tecnico: `2026-06-01` (`opsa/docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`).

Ordem de PRs MF1: `2026-06-01` (`opsa/docs/planificacao/guias-bk/MF1/ORDEM-DEPENDENCIAS-E-PRS-MF1.md`).

## 0) Identificacao rapida

PAP: `OPSA`

Repositorio: `opsa`

Base branch: `main`

Modo de trabalho:

- `MF completa`: `MF1 - Nucleo funcional I`
- BKs abrangidos: `BK-MF1-01..BK-MF1-10`

Documentos principais:

- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/guias-bk/MF1/`
- `docs/RF.md`
- `docs/RNF.md`

## 1) Contexto principal

A `MF1` da OPSA e a fase de **nucleo funcional I**, centrada no ciclo comercial minimo com impacto financeiro e contabilistico.

Nesta macro entram:

- configuracao de tabelas de IVA;
- emissao de documentos de venda;
- recebimentos de clientes;
- lancamentos contabilisticos automaticos por venda;
- consulta de titulos em aberto e antiguidade de saldos;
- aprovacao simples de documentos de venda;
- registo de documentos de compra;
- pagamentos a fornecedores;
- lancamentos contabilisticos automaticos de compras;
- aprovacao de compras com estados `DRAFT -> APPROVED -> POSTED`.

A `MF1` depende diretamente de contratos da `MF0`: autenticacao, contexto multiempresa, roles/permissoes, plano de contas, periodos fiscais, clientes, fornecedores e artigos/servicos. Nenhum BK da `MF1` deve receber `companyId` pelo corpo do pedido; a empresa ativa vem sempre do contexto autenticado.

Stack/contrato tecnico assumido:

- frontend: React + Vite + TypeScript;
- backend/API: Node.js LTS + Express com JavaScript moderno e ES Modules;
- persistencia: PostgreSQL;
- ORM/migrations: Prisma ORM ou equivalente justificado;
- sessao web: cookies `HttpOnly`, `Secure` em producao e `SameSite` configurado;
- estrutura indicativa:
    - `apps/api`;
    - `apps/web`;
    - `apps/api/prisma/schema.prisma`;
    - `apps/web/src/lib/apiClient.ts`.

Regra importante:

Se a estrutura real criada pela equipa for diferente da estrutura indicativa, isso nao pode alterar requisitos, RF/RNF, owners, dependencias ou criterios de aceite. O PR tem de documentar:

- caminho indicado no guia;
- caminho real usado;
- motivo da adaptacao;
- confirmacao de que o contrato funcional se manteve.

---

## 2) Branches recomendadas

Antes de comecar, criar sempre branch nova a partir de `main` atualizada.

| Unidade | Owner | Branch |
| --- | --- | --- |
| `BK-MF1-01` - Configurar tabelas de IVA | `Oleksii` | `feat/bk-mf1-01-iva-oleksii` |
| `BK-MF1-02` - Emitir documentos de venda | `Oleksii` | `feat/bk-mf1-02-documentos-venda-oleksii` |
| `BK-MF1-03` - Registar recebimentos | `Pedro` | `feat/bk-mf1-03-recebimentos-pedro` |
| `BK-MF1-04` - Lancamentos automaticos por venda | `Oleksii` | `feat/bk-mf1-04-lancamentos-venda-oleksii` |
| `BK-MF1-05` - Titulos em aberto e antiguidade | `Oleksii` | `feat/bk-mf1-05-titulos-aberto-oleksii` |
| `BK-MF1-06` - Aprovacao de vendas | `Andre` | `feat/bk-mf1-06-aprovacao-vendas-andre` |
| `BK-MF1-07` - Documentos de compra | `Oleksii` | `feat/bk-mf1-07-documentos-compra-oleksii` |
| `BK-MF1-08` - Registar pagamentos | `Pedro` | `feat/bk-mf1-08-pagamentos-pedro` |
| `BK-MF1-09` - Lancamentos automaticos de compras | `Oleksii` | `feat/bk-mf1-09-lancamentos-compras-oleksii` |
| `BK-MF1-10` - Aprovacao de compras | `Andre` | `feat/bk-mf1-10-aprovacao-compras-andre` |

Como criar uma branch:

```bash
git checkout main
git pull origin main
git checkout -b feat/bk-mf1-01-iva-oleksii
```

---

## 3) Guia rapido: trabalhar no VS Code

1. Abrir o VS Code.
2. Escolher `File > Open Folder`.
3. Abrir a pasta raiz da PAP/repositorio.
4. Abrir o terminal integrado com `Terminal > New Terminal`.

Confirmar que estas na pasta certa:

```bash
git status
```

Antes de criar a branch:

```bash
git checkout main
git pull origin main
```

Criar a branch da tarefa:

```bash
git checkout -b feat/bk-mf1-01-iva-oleksii
```

Durante o trabalho:

```bash
git status
git diff
```

Adicionar apenas ficheiros relacionados com a tarefa:

```bash
git add apps/api/src/modules/vat-rates
git add apps/web/src/pages/VatRatesPage.tsx
```

Evitar `git add .` quando houver alteracoes que nao pertencem ao BK.

Criar commit:

```bash
git commit -m "feat: implement mf1 vat rates"
```

Enviar branch:

```bash
git push -u origin feat/bk-mf1-01-iva-oleksii
```

---

## 4) Guia rapido: trabalhar em GitHub Codespaces

1. Abrir o repositorio no GitHub.
2. Clicar em `Code`.
3. Abrir o separador `Codespaces`.
4. Criar um novo Codespace ou abrir um existente.

Confirmar estado inicial:

```bash
git status
git branch
```

Atualizar a branch base:

```bash
git checkout main
git pull origin main
```

Criar branch da tarefa:

```bash
git checkout -b feat/bk-mf1-01-iva-oleksii
```

Instalar dependencias apenas com o comando previsto no projeto:

```bash
npm install
```

Se a equipa definir `npm ci`, usar `npm ci`. Nao instalar dependencias novas sem autorizacao ou sem justificar a necessidade.

Trabalhar, validar e commitar:

```bash
git status
git diff
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
bash scripts/validate-planificacao.sh
git add <ficheiros-do-bk>
git commit -m "feat: implement mf1 vat rates"
git push -u origin feat/bk-mf1-01-iva-oleksii
```

Abrir PR para `main`, preencher evidence e nunca fazer merge sem validacao/revisao.

---

## 5) BKs da MF1

Macro: `MF1 - Nucleo funcional I`

Janela planeada: `S03-S04` nos guias dos BKs da MF1.

Equipa envolvida na MF1: `Oleksii`, `Andre`, `Pedro`

| BK | Titulo | Owner | Apoio | Pri | Esforco | Dependencias | RF | Proximo BK |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF1-01` | Configurar tabelas de IVA (taxas, isencoes, codigos). | Oleksii | Andre | P0 | M | `BK-MF0-03` | RF13 | `BK-MF1-02` |
| `BK-MF1-02` | Emitir Fatura, Fatura-Recibo, Nota de Credito, com numeracao sequencial. | Oleksii | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF0-09`, `BK-MF0-11`, `BK-MF1-01` | RF14 | `BK-MF1-03` |
| `BK-MF1-03` | Registar recebimentos (parciais/totais). | Pedro | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-02` | RF15 | `BK-MF1-04` |
| `BK-MF1-04` | Gerar lancamentos contabilisticos automaticos por venda. | Oleksii | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-02` | RF16 | `BK-MF1-05` |
| `BK-MF1-05` | Consultar titulos em aberto e antiguidade de saldos. | Oleksii | Pedro | P1 | S | `BK-MF0-03`, `BK-MF1-02`, `BK-MF1-03` | RF17 | `BK-MF1-06` |
| `BK-MF1-06` | Submeter documentos de venda para aprovacao antes de emissao definitiva. | Andre | Oleksii | P1 | S | `BK-MF0-03`, `BK-MF1-02` | RF18 | `BK-MF1-07` |
| `BK-MF1-07` | Registar Fatura de Fornecedor e Nota de Credito. | Oleksii | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF0-10`, `BK-MF0-11`, `BK-MF1-01` | RF19 | `BK-MF1-08` |
| `BK-MF1-08` | Registar pagamentos (parciais/totais). | Pedro | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-07` | RF20 | `BK-MF1-09` |
| `BK-MF1-09` | Gerar lancamentos contabilisticos automaticos de compras. | Oleksii | Andre | P0 | M | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-04`, `BK-MF1-07` | RF21 | `BK-MF1-10` |
| `BK-MF1-10` | Aprovacao de compras com estados `Rascunho -> Aprovado -> Lancado`. | Andre | Oleksii | P1 | S | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-07`, `BK-MF1-09` | RF22 | `BK-MF2-01` |

Nota:

- `P0` exige pelo menos `3` cenarios negativos.
- `P1` exige pelo menos `2` cenarios negativos.
- Nenhum BK pode ficar `DONE` apenas porque o guia esta escrito.

---

## 6) Regra principal obrigatoria

Antes de comecar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `sprint`, `core_or_reforco`, `proximo_bk` e `guia_path`.
3. Confirmar que os BKs de `dependencias` estao implementados, merged ou explicitamente autorizados como baseline.
4. Perceber o que entra e o que fica fora.
5. Confirmar que nao ha outro PR ativo a mexer em `apps/api/prisma/schema.prisma` ou `apps/api/src/server.js`.
6. Conseguir explicar o plano de implementacao em 2-3 frases.
7. Confirmar comigo antes de implementar ou fechar o BK.

Nenhum BK pode ficar `DONE` sem:

- smoke funcional;
- negativos executados;
- validacao tecnica;
- evidence `pr`, `proof`, `neg`, `files`, `commands`;
- screenshots quando houver UI;
- validacao de planificacao sem drift;
- PR criado e revisto.

---

## 7) Dados, seguranca e variaveis de ambiente

Nunca meter segredos no repositorio.

Usar apenas `.env` local para:

- `DATABASE_URL`;
- `SESSION_SECRET` ou segredo equivalente;
- configuracao de ambiente necessaria a PostgreSQL/Prisma;
- qualquer chave externa futura, se vier a ser aprovada.

Antes de qualquer commit:

```bash
git status
```

Confirmar:

- `.env` nao esta staged;
- nao ha passwords, tokens, cookies reais, URIs privadas ou dados pessoais desnecessarios;
- evidence esta sanitizada;
- logs nao expoem stack traces sensiveis, segredos, hashes, tokens ou dados financeiros reais;
- dados de teste respeitam isolamento por empresa;
- screenshots nao mostram dados pessoais reais.

---

## 8) Ordem de execucao

0. Fazer refresh de tabs GitHub/IDE abertas.
1. Ler `opsa/docs/planificacao/README.md`.
2. Confirmar hierarquia de verdade:
    - `MATRIZ-CANONICA-BK`;
    - `BACKLOG-MVP`;
    - `CONTRATO-CAMPOS-BK`;
    - `MF-VIEWS`;
    - `PLANO-SPRINTS`;
    - `SCORECARD-SPRINTS`;
    - `GUIAO-DOCENTE-SEMANAL`;
    - `GATES-S4-S8-S12`;
    - `guias-bk/*`.
3. Ler `opsa/docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`.
4. Ler `opsa/docs/planificacao/guias-bk/MF1/ORDEM-DEPENDENCIAS-E-PRS-MF1.md`.
5. Abrir `opsa/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
6. Confirmar `MF1 - Nucleo funcional I`.
7. Abrir `opsa/docs/planificacao/backlogs/MF-VIEWS.md`.
8. Confirmar sequencia:
    - `BK-MF1-01`;
    - `BK-MF1-02`;
    - `BK-MF1-03`;
    - `BK-MF1-04`;
    - `BK-MF1-05`;
    - `BK-MF1-06`;
    - `BK-MF1-07`;
    - `BK-MF1-08`;
    - `BK-MF1-09`;
    - `BK-MF1-10`.
9. Abrir `opsa/docs/planificacao/backlogs/BACKLOG-MVP.md`.
10. Confirmar estado, dependencias, owner, apoio, prioridade, esforco, RF e proximo BK.
11. Abrir o guia especifico do BK em `opsa/docs/planificacao/guias-bk/MF1/`.
12. Validar o scope-out antes de escrever codigo.
13. Implementar em ciclos curtos, mantendo PR pequeno.
14. Validar smoke + negativos + evidence.
15. Correr validacao documental:

```bash
bash scripts/validate-planificacao.sh
```

16. Correr testes relevantes, adaptando ao BK:

```bash
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run syntax:check
npm --prefix apps/api run prisma:validate
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
```

---

## 9) SSOT minimo da MF1

Ler apenas as partes relevantes:

- `opsa/docs/RF.md`
    - `RF13..RF22`;
    - `RF03`, quando houver isolamento multiempresa;
    - `RF08`, quando houver periodo fiscal ou lancamento contabilistico;
    - `RF47`, quando houver auditoria de operacoes sensiveis.

- `opsa/docs/RNF.md`
    - validacao de formularios e mensagens de erro;
    - seguranca de sessoes;
    - protecao contra ataques comuns;
    - credenciais apenas em variaveis de ambiente;
    - modularidade backend/frontend;
    - auditoria e logs quando aplicavel.

- `opsa/docs/planificacao/README.md`
    - hierarquia canonica;
    - validacao oficial;
    - contrato pedagogico por prioridade.

- `opsa/docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
    - stack assumida;
    - estrutura indicativa;
    - regra de adaptacao quando existir scaffold real;
    - dependencias tecnicas bloqueantes.

- `opsa/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - `MF1`;
    - regras transversais;
    - gates `S4`, `S8`, `S12`.

- `opsa/docs/planificacao/backlogs/BACKLOG-MVP.md`
    - linhas `BK-MF1-01..BK-MF1-10`;
    - contrato de dados canonico;
    - contrato pedagogico comum.

- `opsa/docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - linhas `BK-MF1-01..BK-MF1-10`;
    - dependencias e proximo BK.

- `opsa/docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - linhas `BK-MF1-01..BK-MF1-10`;
    - alinhamento de `dependencias`, `rf_rnf` e `guia_path`.

- `opsa/docs/planificacao/backlogs/MF-VIEWS.md`
    - `## MF1 - Nucleo funcional I`.

- `opsa/docs/planificacao/sprints/PLANO-SPRINTS.md`
    - `S03` e `S04`;
    - capacidade semanal;
    - gates e KPIs.

- Guias especificos:
    - `BK-MF1-01-configurar-tabelas-de-iva-taxas-isencoes-codigos.md`;
    - `BK-MF1-02-emitir-fatura-fatura-recibo-nota-de-credito-com-numeracao-sequencial.md`;
    - `BK-MF1-03-registar-recebimentos-parciais-totais.md`;
    - `BK-MF1-04-gerar-lancamentos-contabilisticos-automaticos-por-venda.md`;
    - `BK-MF1-05-consultar-titulos-em-aberto-e-antiguidade-de-saldos.md`;
    - `BK-MF1-06-submeter-documentos-de-venda-para-aprovacao-antes-de-emissao-definitiva.md`;
    - `BK-MF1-07-registar-fatura-de-fornecedor-e-nota-de-credito.md`;
    - `BK-MF1-08-registar-pagamentos-parciais-totais.md`;
    - `BK-MF1-09-gerar-lancamentos-contabilisticos-automaticos-de-compras.md`;
    - `BK-MF1-10-aprovacao-de-compras-com-estados-rascunho-aprovado-lancado.md`.

---

## 10) Validacao por BK

### `BK-MF1-01` - Configurar tabelas de IVA

Smoke:

- `GET /api/vat-rates` lista taxas da empresa ativa;
- `POST /api/vat-rates` cria taxa/codigo valido com `rateBps`;
- UI permite listar, criar e ativar/desativar taxas.

Negativos:

- pedido sem sessao => `401`;
- pedido sem empresa ativa => `403` ou erro definido na MF0;
- codigo duplicado na mesma empresa => `409`;
- taxa isenta sem motivo de isencao => erro validado no backend.

Validacao tecnica:

- `VatRate` pertence a `companyId`;
- taxa guardada como inteiro em basis points;
- vendas e compras futuras usam `vatRateId`, nao taxa solta enviada pelo browser.

### `BK-MF1-02` - Emitir Fatura, Fatura-Recibo e Nota de Credito

Smoke:

- `POST /api/sales/documents` cria documento em `DRAFT`;
- endpoint de emissao atribui numeracao sequencial por empresa, ano e tipo;
- totais de linhas, IVA e total sao calculados no backend;
- listagem mostra documentos da empresa ativa.

Negativos:

- cliente, artigo ou taxa de IVA de outra empresa => `404` ou `403`;
- documento sem linhas validas => `400`;
- emitir documento fora de periodo fiscal aberto => bloqueio controlado;
- tentativa concorrente nao pode criar numero duplicado.

Validacao tecnica:

- `NumberSequence` e emissao ocorrem em transacao;
- dinheiro guardado em centimos;
- `companyId` vem da sessao;
- contabilizacao automatica fica fora deste BK.

### `BK-MF1-03` - Registar recebimentos

Smoke:

- `POST /api/sales/documents/:id/receipts` regista recebimento parcial;
- recebimento total muda o estado/saldo do documento para liquidado quando aplicavel;
- saldo em aberto e atualizado de forma transacional.

Negativos:

- receber valor superior ao saldo em aberto => erro controlado;
- receber sobre `CREDIT_NOTE` => bloqueado;
- data em periodo fiscal fechado => bloqueada por `assertOpenFiscalPeriod`;
- documento de outra empresa => `404` ou `403`.

Validacao tecnica:

- `Receipt` fica ligado ao documento de venda;
- metodo, data e referencia ficam registados;
- auditoria e filtros por empresa ficam no backend.

### `BK-MF1-04` - Gerar lancamentos contabilisticos automaticos por venda

Smoke:

- `POST /api/accounting/sale-postings/:saleDocumentId` contabiliza venda emitida;
- diario fica equilibrado entre debito e credito;
- segunda tentativa sobre o mesmo documento respeita idempotencia.

Negativos:

- contabilizar documento nao emitido => erro controlado;
- periodo fiscal fechado => bloqueado;
- documento de outra empresa => `404` ou `403`;
- tentativa de duplicar diario => nao duplica proveitos nem IVA.

Validacao tecnica:

- usar contas SNC pedagogicas previstas no guia;
- criar `JournalEntry` e linhas com `source`/`sourceId`;
- preservar auditoria e transacao.

### `BK-MF1-05` - Consultar titulos em aberto e antiguidade de saldos

Smoke:

- `GET /api/sales/open-items` devolve documentos emitidos com saldo por receber;
- filtro por data de referencia recalcula dias de atraso;
- UI mostra loading, empty, erro e tabela de resultados.

Negativos:

- pedido sem sessao => `401`;
- documento liquidado nao aparece;
- `CREDIT_NOTE` nao aparece como titulo em aberto;
- documentos de outra empresa nunca aparecem.

Validacao tecnica:

- consulta e leitura pura, sem alterar dados;
- buckets previstos: `NOT_DUE`, `DAYS_1_30`, `DAYS_31_60`, `DAYS_61_90`, `DAYS_90_PLUS`;
- saldos usam `SaleDocument.totalCents` e `amountPaidCents`.

### `BK-MF1-06` - Submeter documentos de venda para aprovacao

Smoke:

- operacional submete documento de venda para aprovacao;
- gestor/administrador aprova documento submetido;
- rejeicao exige motivo;
- emissao definitiva passa a aceitar apenas documento aprovado, conforme guia.

Negativos:

- aprovar documento que nao esta submetido => erro de transicao;
- rejeitar sem motivo => `400`;
- mesmo utilizador tenta aprovar documento que submeteu, se a segregacao estiver ativa no service => bloqueio controlado;
- recurso de outra empresa => `404` ou `403`.

Validacao tecnica:

- fluxo `DRAFT -> SUBMITTED -> APPROVED/REJECTED`;
- auditoria de submissao, aprovacao e rejeicao;
- nao criar historico detalhado alem do previsto para este BK.

### `BK-MF1-07` - Registar Fatura de Fornecedor e Nota de Credito

Smoke:

- `POST /api/purchases/documents` regista fatura de fornecedor;
- nota de credito de fornecedor fica guardada com valores positivos e tipo documental proprio;
- totais sao calculados no backend;
- numero do fornecedor e unico por fornecedor e empresa.

Negativos:

- fornecedor, artigo ou taxa de IVA de outra empresa => `404` ou `403`;
- numero de fornecedor duplicado para o mesmo fornecedor/empresa => `409`;
- data fora de periodo fiscal aberto => bloqueada;
- documento sem linhas validas => `400`.

Validacao tecnica:

- estado inicial `APPROVED` e temporario ate `BK-MF1-10`;
- compras ficam filtradas por `companyId`;
- pagamento e contabilizacao ficam fora deste BK.

### `BK-MF1-08` - Registar pagamentos

Smoke:

- `POST /api/purchases/documents/:id/payments` regista pagamento parcial;
- pagamento total atualiza saldo pago e fecha a compra quando aplicavel;
- metodo, data e referencia ficam registados.

Negativos:

- pagar valor superior ao saldo em aberto => erro controlado;
- pagar nota de credito de fornecedor => bloqueado;
- data em periodo fiscal fechado => bloqueada;
- documento de outra empresa => `404` ou `403`.

Validacao tecnica:

- `Payment` fica ligado ao documento de compra;
- atualizacao de saldo e movimento de pagamento sao transacionais;
- diario contabilistico continua no `BK-MF1-09`.

### `BK-MF1-09` - Gerar lancamentos contabilisticos automaticos de compras

Smoke:

- `POST /api/accounting/purchase-postings/:purchaseDocumentId` contabiliza compra registada/aprovada;
- diario fica equilibrado entre gasto, IVA dedutivel e fornecedor;
- nota de credito inverte o efeito contabilistico conforme tipo documental.

Negativos:

- contabilizar compra inexistente ou de outra empresa => `404` ou `403`;
- periodo fiscal fechado => bloqueado;
- contabilizar duas vezes o mesmo documento => idempotente;
- documento em estado invalido => erro controlado.

Validacao tecnica:

- reutilizar ou alinhar `JournalEntry`, `JournalEntryLine`, `source` e helpers do `BK-MF1-04`;
- expor helper transacional para `BK-MF1-10`;
- preservar auditoria.

### `BK-MF1-10` - Aprovacao de compras

Smoke:

- novas compras passam a nascer `DRAFT`, conforme ajuste indicado no guia;
- `POST /api/purchases/documents/:id/approve` muda compra para `APPROVED`;
- `POST /api/purchases/documents/:id/post-state` contabiliza e muda compra para `POSTED`;
- transicao para lancado cria ou reutiliza diario de compra sem duplicar.

Negativos:

- aprovar compra que nao esta em `DRAFT` => erro de transicao;
- lancar compra que nao esta `APPROVED` => erro de transicao;
- utilizador sem role adequada tenta aprovar ou lancar => `403`;
- recurso de outra empresa => `404` ou `403`.

Validacao tecnica:

- fluxo `DRAFT -> APPROVED -> POSTED`;
- `markPurchaseDocumentPosted` reutiliza `postPurchaseDocumentInTransaction`;
- diario, estado e auditoria ficam na mesma transacao;
- historico detalhado fica para `BK-MF2-01`.

---

## 11) Entregaveis minimos no PR

Cada PR deve incluir:

- implementacao completa do BK, sem desvio ao guia;
- `Evidence` preenchida:
    - `pr`;
    - `proof`;
    - `neg`;
    - `files`;
    - `commands`;
    - `screenshots`, se houver UI;
    - `notes`, se houver decisoes, assuncoes ou desvios aprovados.
- validacao smoke;
- negativos minimos por prioridade;
- lint/testes disponiveis ou justificacao clara se ainda nao existirem scripts;
- `bash scripts/validate-planificacao.sh`;
- sem `.env`;
- sem segredos;
- sem drift de `bk_id`, RF/RNF, owner, apoio, prioridade, dependencias ou criterios de aceite.

Comandos esperados, adaptando ao scaffold real:

```bash
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run syntax:check
npm --prefix apps/api run prisma:validate
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
bash scripts/validate-planificacao.sh
```

Se os scripts ainda nao existirem:

- registar `TODO` na evidence;
- executar smoke manual com `curl` e/ou browser;
- nao marcar o BK como `DONE` sem evidence real.

---

## 12) Regras de PR e conflitos

A ordem oficial da MF1 e sequencial:

1. `BK-MF1-01`
2. `BK-MF1-02`
3. `BK-MF1-03`
4. `BK-MF1-04`
5. `BK-MF1-05`
6. `BK-MF1-06`
7. `BK-MF1-07`
8. `BK-MF1-08`
9. `BK-MF1-09`
10. `BK-MF1-10`

Regras praticas:

- abrir cada PR apenas depois de os PRs das suas dependencias estarem merged;
- atualizar a branch antes de pedir revisao quando uma dependencia foi merged entretanto;
- evitar PRs concorrentes a tocar em `apps/api/prisma/schema.prisma` ou `apps/api/src/server.js`;
- nao copiar blocos acumulados de schema, routes ou server de guias que ainda nao sejam dependencias do BK em implementacao;
- quando houver conflito, preservar o contrato funcional ja merged e adaptar apenas o necessario ao BK atual.

Pares que exigem coordenacao:

| Par | Motivo | Coordenacao exigida |
| --- | --- | --- |
| `MF1-02/MF1-06` | Ambos mexem no ciclo de vida de documentos de venda e emissao definitiva. | `MF1-06` deve partir do contrato final de `MF1-02` e nao duplicar logica divergente de emissao. |
| `MF1-04/MF1-09` | Ambos criam contabilizacao automatica e podem tocar em modelos/servicos de lancamentos. | Confirmar nomes de `JournalEntry`, `JournalEntryLine`, `source` e helpers transacionais antes do segundo PR. |
| `MF1-07/MF1-10` | `MF1-10` altera o fluxo de criacao/aprovacao de compras criado por `MF1-07`. | `MF1-10` deve ser implementado depois do merge de `MF1-07` e preservar as validacoes de compra ja entregues. |

---

## 13) Naming de branch recomendado

Usar o padrao:

```text
feat/bk-mf1-XX-descricao-owner
```

Exemplos:

- `feat/bk-mf1-01-iva-oleksii`
- `feat/bk-mf1-03-recebimentos-pedro`
- `feat/bk-mf1-06-aprovacao-vendas-andre`
- `feat/bk-mf1-10-aprovacao-compras-andre`

Para criar um PR:

1. Push da branch local para remoto:

```bash
git push origin feat/bk-mf1-01-iva-oleksii
```

2. Ir ao GitHub, abrir PR da branch para `main`.
3. Preencher titulo, descricao e evidence.
4. Criar Pull Request.

---

## 14) Handoff para MF2

A `MF1` termina quando:

- todos os BKs `BK-MF1-01..BK-MF1-10` tenham smoke, negativos e evidence;
- vendas conseguem criar, emitir, aprovar, receber, consultar saldos e contabilizar;
- compras conseguem criar, pagar, contabilizar, aprovar e marcar como lancadas;
- `VatRate`, documentos, recebimentos, pagamentos e lancamentos estao filtrados por `companyId`;
- os lancamentos automaticos estao equilibrados e idempotentes;
- periodos fiscais fechados bloqueiam operacoes financeiras/contabilisticas quando o guia exige;
- nao ha drift entre matriz, backlog, contrato de campos, MF views, plano de sprints e guias;
- `bash scripts/validate-planificacao.sh` passa.

Primeiro contrato critico para a `MF2`:

- `BK-MF2-01` - Historico e justificacoes para aprovacoes/reprovacoes.

---

## 15) Se bloquearem mais de 45 minutos

Mandar-me:

1. 2-3 frases sobre o problema.
2. erro/log relevante sem dados sensiveis.
3. o que ja tentaram.
4. path + heading do SSOT que esta a causar duvida.
5. indicacao do BK, branch e ficheiros afetados.

Se o bloqueio envolver regras fiscais, periodos fiscais, numeracao sequencial, contas SNC, transicoes de estado, isolamento multiempresa ou autorizacao por role, nao inventar a decisao no PR. Marcar como `TODO/BLOCKER` e pedir validacao.
