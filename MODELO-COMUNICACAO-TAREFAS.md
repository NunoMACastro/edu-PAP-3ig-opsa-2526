# Plano de Execucao - MF1 OPSA

Snapshot do backlog: `2026-06-01` (`opsa/docs/planificacao/backlogs/BACKLOG-MVP.md`).

Guias MF1 refinados/reauditados: `2026-06-01` (`opsa/docs/planificacao/guias-bk/MF1/`).

Contrato tecnico: `2026-06-01` (`opsa/docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`).

Ordem de PRs MF1: `2026-06-01` (`opsa/docs/planificacao/guias-bk/MF1/ORDEM-DEPENDENCIAS-E-PRS-MF1.md`).

Data de conclusão: `05-Junho-2026 às 13:00`.

## 1) Contexto principal

A `MF1` da OPSA e a macrofase de nucleo funcional real depois dos fundamentos da `MF0`.

Esta macro junta dois eixos de produto:

- ciclo comercial de vendas, recebimentos, titulos em aberto e aprovacao de documentos de venda;
- ciclo comercial de compras, pagamentos, contabilizacao automatica e aprovacao de compras.

Ao contrario da `MF0`, que cria a base de autenticacao, multiempresa, roles, plano de contas, periodos fiscais, clientes, fornecedores, artigos e armazens, a `MF1` transforma essa base em operacoes financeiras e contabilisticas reais. A regra principal e reutilizar o que ja existe na `MF0`, sem criar estruturas paralelas nem contratos novos de autenticacao, empresa ativa ou autorizacao.

A `MF1` depende diretamente de contratos da `MF0`:

- autenticacao e sessao;
- contexto multiempresa;
- roles/permissoes;
- plano de contas;
- periodos fiscais;
- clientes;
- fornecedores;
- artigos/servicos.

Regra obrigatoria: nenhum BK da `MF1` deve receber `companyId` pelo corpo do pedido. A empresa ativa vem sempre do contexto autenticado.

Stack/contrato tecnico previsto:

- Node.js LTS + Express com ES Modules;
- React + Vite + TypeScript;
- PostgreSQL;
- Prisma ORM ou equivalente justificado;
- sessao por cookie `HttpOnly`, `Secure` em producao e `SameSite` configurado;
- frontend com chamadas autenticadas atraves do cliente HTTP existente;
- separacao por camadas: `routes -> controller -> service -> validator/model`;
- backend em `apps/api`;
- frontend em `apps/web`;
- evidence obrigatoria por BK.

---

## 2) Tutorial Git/GitHub por BK (VS Code ou Codespaces)

Esta e a rotina obrigatoria para cada BK da `MF1`. O objetivo e garantir que cada aluno trabalha sempre sobre codigo atualizado, numa branch isolada, com commits pequenos e PR para `main`.

Podes fazer isto no VS Code local ou no GitHub Codespaces. Em ambos os casos, usa o terminal integrado:

- VS Code: `Terminal > New Terminal`;
- Codespaces: abrir o repositorio da PAP no GitHub, escolher `Code > Codespaces`, entrar no codespace e usar o terminal integrado.

### Passo 1 - Pull antes de trabalhar

Antes de tocar no codigo, confirmar que estas na `main` e que tens a versao mais recente.

```bash
git status
```

Se aparecerem alteracoes tuas por guardar, nao fazer pull ainda. Primeiro confirmar se sao para commit, se sao temporarias ou se pertencem a outro BK.

Depois, ir para a `main` e atualizar:

```bash
git switch main
git pull origin main
```

Regra: a branch do BK deve nascer depois deste pull. Assim evita-se trabalhar em cima de codigo antigo.

### Passo 2 - Escolher o BK e criar a branch

Escolher o BK que vai ser implementado e criar a branch correspondente:

- `BK-MF1-01`: `feat/bk-mf1-01-iva-oleksii`
- `BK-MF1-02`: `feat/bk-mf1-02-documentos-venda-oleksii`
- `BK-MF1-03`: `feat/bk-mf1-03-recebimentos-pedro`
- `BK-MF1-04`: `feat/bk-mf1-04-lancamentos-venda-oleksii`
- `BK-MF1-05`: `feat/bk-mf1-05-titulos-aberto-oleksii`
- `BK-MF1-06`: `feat/bk-mf1-06-aprovacao-vendas-andre`
- `BK-MF1-07`: `feat/bk-mf1-07-documentos-compra-oleksii`
- `BK-MF1-08`: `feat/bk-mf1-08-pagamentos-pedro`
- `BK-MF1-09`: `feat/bk-mf1-09-lancamentos-compras-oleksii`
- `BK-MF1-10`: `feat/bk-mf1-10-aprovacao-compras-andre`

Exemplo para o `BK-MF1-01`:

```bash
git switch -c feat/bk-mf1-01-iva-oleksii
```

Confirmar que a branch ativa e a correta:

```bash
git branch --show-current
```

### Passo 3 - Implementar em ciclos pequenos

Antes de escrever codigo:

1. Ler o guia do BK em `docs/planificacao/guias-bk/MF1/`.
2. Confirmar dependencias e scope-out.
3. Confirmar se ha PR ativo a mexer em `apps/api/prisma/schema.prisma` ou `apps/api/src/server.js`.
4. Adaptar paths dos guias para a estrutura real quando necessario:
    - backend/API: `apps/api/src/...`;
    - frontend: `apps/web/src/...`;
    - Prisma: `apps/api/prisma/schema.prisma`;
    - testes API: `apps/api/tests/...`;
    - evidence: `docs/evidence/...`.
5. Implementar uma parte pequena.
6. Verificar o que mudou.

Comandos uteis:

```bash
git status
git diff
```

Regra: nao misturar varios BKs na mesma branch. Uma branch, um BK.

### Passo 4 - Testar antes de commit

Correr os testes relevantes ao tipo de alteracao.

Para backend/API:

```bash
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run syntax:check
npm --prefix apps/api run prisma:validate
```

Se o BK tiver UI:

```bash
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
```

Se houver interface alterada, validar tambem o fluxo no frontend e guardar evidence sanitizada, sem cookies, passwords, dados financeiros reais ou dados pessoais.

Se um teste falhar, corrigir antes de fazer commit. Se a falha for de infraestrutura externa, registar isso nas notas/evidence.

### Passo 5 - Fazer commits claros

Ver primeiro os ficheiros alterados:

```bash
git status
```

Adicionar apenas ficheiros do BK:

```bash
git add apps/api/src/modules/vat-rates
git add apps/api/tests/unit/mf1-vat-rates.test.js
git add docs/evidence/BK-MF1-XX.md
```

Ou, se todas as alteracoes pertencerem mesmo ao BK:

```bash
git add .
```

Antes do commit, confirmar que nao entrou nada sensivel:

```bash
git diff --cached
```

Criar commit com mensagem curta e ligada ao BK:

```bash
git commit -m "feat(mf1-01): add vat rates"
```

Boas regras para commits:

- um commit deve representar uma unidade logica;
- nao juntar formatter, refactor grande e feature no mesmo commit sem necessidade;
- nao commitar `.env`, cookies, tokens, screenshots sensiveis ou evidence com dados reais;
- se houver mais trabalho no mesmo BK, repetir ciclo: alterar, testar, `git add`, `git commit`.

### Passo 6 - Push da branch

Quando o BK estiver pronto localmente:

```bash
git push -u origin feat/bk-mf1-01-iva-oleksii
```

Nos pushes seguintes da mesma branch, basta:

```bash
git push
```

### Passo 7 - Abrir PR para `main`

No GitHub:

1. Abrir o repositorio.
2. Clicar em `Compare & pull request`, ou ir a `Pull requests > New pull request`.
3. Confirmar:
    - base: `main`;
    - compare: branch do BK.
4. Titulo recomendado:

```text
BK-MF1-01 - Configurar tabelas de IVA
```

5. Na descricao do PR, preencher:
    - BK implementado;
    - RF/RNF;
    - resumo tecnico;
    - ficheiros principais;
    - smoke test;
    - negativos;
    - comandos executados;
    - screenshots, se houver UI;
    - notas de seguranca/privacidade.
6. Criar Pull Request.

Regra: o PR e sempre para `main`, nunca diretamente para outra branch sem combinacao previa.

### Passo 8 - Rever checks e responder a feedback

Depois de abrir o PR:

1. Esperar pelos checks.
2. Se falharem, abrir logs e corrigir na mesma branch.
3. Fazer novo commit.
4. Fazer `git push`.

O PR atualiza automaticamente.

### Passo 9 - Depois do merge

Quando o PR for aprovado e merged:

```bash
git switch main
git pull origin main
```

Se a branch local ja nao for necessaria:

```bash
git branch -d feat/bk-mf1-01-iva-oleksii
```

No proximo BK, repetir o processo desde o Passo 1.

---

## 3) BKs da MF1

Owner stream P0 da MF1: `Oleksii`

Equipa envolvida na MF1: `Oleksii`, `Andre` e `Pedro`

Todos estao planeados para `S03-S04`.

| BK          | Titulo                                                                   | Owner   | Apoio   | Pri | Esforco | Dependencias                                                    | RF   |
| ----------- | ------------------------------------------------------------------------ | ------- | ------- | --- | ------- | --------------------------------------------------------------- | ---- |
| `BK-MF1-01` | Configurar tabelas de IVA (taxas, isencoes, codigos).                    | Oleksii | Andre   | P0  | M       | `BK-MF0-03`                                                     | RF13 |
| `BK-MF1-02` | Emitir Fatura, Fatura-Recibo, Nota de Credito, com numeracao sequencial. | Oleksii | Andre   | P0  | M       | `BK-MF0-03`, `BK-MF0-08`, `BK-MF0-09`, `BK-MF0-11`, `BK-MF1-01` | RF14 |
| `BK-MF1-03` | Registar recebimentos (parciais/totais).                                 | Pedro   | Andre   | P0  | M       | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-02`                           | RF15 |
| `BK-MF1-04` | Gerar lancamentos contabilisticos automaticos por venda.                 | Oleksii | Andre   | P0  | M       | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-02`                           | RF16 |
| `BK-MF1-05` | Consultar titulos em aberto e antiguidade de saldos.                     | Oleksii | Pedro   | P1  | S       | `BK-MF0-03`, `BK-MF1-02`, `BK-MF1-03`                           | RF17 |
| `BK-MF1-06` | Submeter documentos de venda para aprovacao antes de emissao definitiva. | Andre   | Oleksii | P1  | S       | `BK-MF0-03`, `BK-MF1-02`                                        | RF18 |
| `BK-MF1-07` | Registar Fatura de Fornecedor e Nota de Credito.                         | Oleksii | Andre   | P0  | M       | `BK-MF0-03`, `BK-MF0-08`, `BK-MF0-10`, `BK-MF0-11`, `BK-MF1-01` | RF19 |
| `BK-MF1-08` | Registar pagamentos (parciais/totais).                                   | Pedro   | Andre   | P0  | M       | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-07`                           | RF20 |
| `BK-MF1-09` | Gerar lancamentos contabilisticos automaticos de compras.                | Oleksii | Andre   | P0  | M       | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-04`, `BK-MF1-07`              | RF21 |
| `BK-MF1-10` | Aprovacao de compras com estados `Rascunho -> Aprovado -> Lancado`.      | Andre   | Oleksii | P1  | S       | `BK-MF0-03`, `BK-MF0-08`, `BK-MF1-07`, `BK-MF1-09`              | RF22 |

---

## 4) Regra principal obrigatoria

Antes de comecar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `dependencias`, `rf_rnf`, `sprint`, `estado`, `esforco` e `proximo_bk`.
3. Confirmar se o BK pertence ao eixo de vendas/recebimentos ou ao eixo de compras/pagamentos.
4. Perceber o que entra e o que fica fora.
5. Conseguir explicar o plano de implementacao em 2-3 frases.
6. Confirmar comigo antes de implementar ou fechar o BK.

Nenhum BK pode ficar `DONE` sem:

- smoke;
- negativos;
- validacao tecnica;
- evidence `pr`, `proof`, `neg`;
- validacao de seguranca e isolamento por empresa;
- validacao de periodo fiscal quando aplicavel;
- validacao da planificacao sem drift.

---

## 5) Atencao obrigatoria a paths e estrutura

A estrutura real da OPSA e:

- backend/API: `apps/api/src/...`;
- frontend: `apps/web/src/...`;
- schema Prisma: `apps/api/prisma/schema.prisma`;
- testes API: `apps/api/tests/...`;
- evidence: `docs/evidence/...`;
- planificacao: `docs/planificacao/...`.

Regra:

1. A estrutura real da app tem prioridade.
2. Nao criar duas apps paralelas.
3. Nao criar pastas novas como `server/`, `client/`, `backend/` ou `frontend/`.
4. Se um guia mencionar um ficheiro equivalente ja existente, editar o existente.
5. Se for necessario adaptar um path do guia, documentar no PR:
    - path indicado no guia;
    - path real usado;
    - motivo da adaptacao;
    - confirmacao de que o contrato funcional se manteve.
6. Se houver duvida de arquitetura, parar e perguntar.

Isto e blocker de arquitetura. Nao e detalhe cosmetico.

---

## 6) Dados, seguranca e variaveis de ambiente

Nunca meter segredos no repositorio.

Usar apenas `.env` local para:

- `DATABASE_URL`;
- `SESSION_SECRET` ou segredo equivalente da sessao;
- configuracoes locais de PostgreSQL/Prisma;
- chaves externas futuras apenas quando forem explicitamente aprovadas.

Na `MF1`, os riscos principais sao:

- dados financeiros e contabilisticos;
- documentos de venda e compra;
- numeros sequenciais;
- recebimentos e pagamentos;
- saldos em aberto;
- lancamentos contabilisticos;
- autorizacao por role;
- isolamento multiempresa;
- periodos fiscais fechados.

Antes de qualquer commit:

```bash
git status
```

Confirmar:

- `.env` nao esta staged;
- nao ha passwords, tokens, URIs privadas ou cookies reais em commits;
- evidence esta sanitizada;
- screenshots/logs nao expoem dados sensiveis;
- dados financeiros reais nao entram no repositorio;
- `companyId` nunca vem do body/query como fonte de verdade;
- respostas publicas nao expoem campos administrativos, hashes, tokens ou dados internos.

---

## 7) Ordem de execucao

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
10. Confirmar estado, dependencias, owner, apoio, prioridade, esforco e RF.
11. Abrir o guia especifico do BK em `opsa/docs/planificacao/guias-bk/MF1/`.
12. Validar o scope-out antes de escrever codigo.
13. Implementar em ciclos curtos, mantendo PR pequeno.
14. Validar smoke + negativos + evidence.
15. Correr validacao documental:

```bash
bash scripts/validate-planificacao.sh
```

16. Correr testes/checks relevantes:

```bash
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run syntax:check
npm --prefix apps/api run prisma:validate
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
```

Nota operacional: se `bash scripts/validate-planificacao.sh` falhar por issues documentais ja existentes e nao relacionadas com o BK, registar como blocker/risco documental na evidence. Nao marcar o BK como `DONE` sem evidence real.

---

## 8) SSOT minimo da MF1

Ler apenas as partes relevantes:

- `opsa/docs/RF.md`
    - `RF13..RF22`;
    - `RF03`, quando houver isolamento multiempresa;
    - `RF08`, quando houver periodo fiscal ou lancamento contabilistico;
    - `RF47`, quando houver auditoria de operacoes sensiveis.

- `opsa/docs/RNF.md`
    - RNFs de validacao de formularios e mensagens de erro;
    - RNFs de sessao/autenticacao;
    - RNFs de seguranca contra ataques comuns;
    - RNFs de credenciais apenas em variaveis de ambiente;
    - RNFs de modularidade backend/frontend;
    - RNFs de auditoria e logs quando aplicavel.

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
    - `## Tabela MF0..MF8`;
    - `## Regras transversais por macro`;
    - `## Gates S4/S8/S12`.

- `opsa/docs/planificacao/backlogs/BACKLOG-MVP.md`
    - linhas `BK-MF1-01..BK-MF1-10`;
    - contrato pedagogico comum;
    - matriz minima de negativos por prioridade.

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
    - matriz minima de testes por prioridade;
    - gate em `S04`.

- `opsa/docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF1.md`
    - decisoes tecnicas confirmadas;
    - drift documental corrigido;
    - riscos restantes.

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

## 9) Validacao por BK

### `BK-MF1-01` - Configurar tabelas de IVA

Smoke:

- listar taxas em `GET /api/vat-rates`;
- criar taxa/codigo valido em `POST /api/vat-rates`;
- confirmar que a taxa fica associada a empresa ativa;
- UI administrativa permite listar, criar e ativar/desativar taxas.

Negativos:

- pedido sem sessao => `401`;
- pedido sem empresa ativa => `403` ou erro definido na `MF0`;
- codigo duplicado na mesma empresa => `409`;
- taxa isenta sem motivo de isencao => erro validado no backend.

Bloqueios:

- `VatRate` pertence a `companyId`;
- taxa guardada como inteiro em basis points;
- vendas e compras futuras usam `vatRateId`, nao taxa solta enviada pelo browser;
- nao implementar mapas de IVA nem SAF-T neste BK.

### `BK-MF1-02` - Emitir Fatura, Fatura-Recibo e Nota de Credito

Smoke:

- criar documento de venda em `POST /api/sales/documents`;
- emitir documento e atribuir numeracao sequencial por empresa, ano e tipo;
- confirmar totais de linhas, IVA e total calculados no backend;
- listar documentos da empresa ativa.

Negativos:

- cliente, artigo ou taxa de IVA de outra empresa => `404` ou `403`;
- documento sem linhas validas => `400`;
- emitir documento fora de periodo fiscal aberto => bloqueio controlado;
- tentativa concorrente nao pode criar numero duplicado.

Bloqueios:

- `NumberSequence` e emissao ocorrem em transacao;
- dinheiro guardado em centimos;
- `companyId` vem da sessao;
- contabilizacao automatica fica para `BK-MF1-04`.

### `BK-MF1-03` - Registar recebimentos

Smoke:

- registar recebimento parcial em `POST /api/sales/documents/:id/receipts`;
- registar recebimento total e liquidar documento quando aplicavel;
- atualizar saldo em aberto de forma transacional;
- guardar metodo, data e referencia.

Negativos:

- receber valor superior ao saldo em aberto => erro controlado;
- receber sobre `CREDIT_NOTE` => bloqueado;
- data em periodo fiscal fechado => bloqueada por `assertOpenFiscalPeriod`;
- documento de outra empresa => `404` ou `403`.

Bloqueios:

- `Receipt` fica ligado ao documento de venda;
- auditoria e filtros por empresa ficam no backend;
- reconciliacao bancaria fica para `BK-MF3-03`;
- previsao de tesouraria fica para `BK-MF3-04`.

### `BK-MF1-04` - Gerar lancamentos contabilisticos automaticos por venda

Smoke:

- contabilizar venda emitida em `POST /api/accounting/sale-postings/:saleDocumentId`;
- confirmar diario equilibrado entre debito e credito;
- confirmar idempotencia numa segunda tentativa;
- confirmar origem/referencia ao documento de venda.

Negativos:

- contabilizar documento nao emitido => erro controlado;
- periodo fiscal fechado => bloqueado;
- documento de outra empresa => `404` ou `403`;
- tentativa de duplicar diario nao duplica proveitos nem IVA.

Bloqueios:

- usar contas SNC pedagogicas previstas no guia;
- criar/reutilizar `JournalEntry` e linhas com `source`/`sourceId`;
- coordenar nomes de `JournalEntry`, `JournalEntryLine`, `source` e helpers com `BK-MF1-09`;
- lancamentos manuais ficam para `BK-MF2-06`.

### `BK-MF1-05` - Consultar titulos em aberto e antiguidade de saldos

Smoke:

- consultar `GET /api/sales/open-items`;
- devolver documentos emitidos com saldo por receber;
- recalcular dias de atraso com filtro por data de referencia;
- UI mostra estados `loading`, `empty`, `error` e `success`.

Negativos:

- pedido sem sessao => `401`;
- documento liquidado nao aparece;
- `CREDIT_NOTE` nao aparece como titulo em aberto;
- documentos de outra empresa nunca aparecem.

Bloqueios:

- consulta e leitura pura, sem alterar dados;
- buckets previstos: `NOT_DUE`, `DAYS_1_30`, `DAYS_31_60`, `DAYS_61_90`, `DAYS_90_PLUS`;
- saldos usam `SaleDocument.totalCents` e `amountPaidCents`;
- cobrancas automaticas ficam fora deste BK.

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

Bloqueios:

- fluxo `DRAFT -> SUBMITTED -> APPROVED/REJECTED`;
- auditoria de submissao, aprovacao e rejeicao;
- nao criar historico detalhado alem do previsto para este BK;
- coordenar com `BK-MF1-02` para nao duplicar logica divergente de emissao.

### `BK-MF1-07` - Registar Fatura de Fornecedor e Nota de Credito

Smoke:

- registar fatura de fornecedor em `POST /api/purchases/documents`;
- registar nota de credito de fornecedor com valores positivos e tipo documental proprio;
- calcular totais no backend;
- garantir numero do fornecedor unico por fornecedor e empresa.

Negativos:

- fornecedor, artigo ou taxa de IVA de outra empresa => `404` ou `403`;
- numero de fornecedor duplicado para o mesmo fornecedor/empresa => `409`;
- data fora de periodo fiscal aberto => bloqueada;
- documento sem linhas validas => `400`.

Bloqueios:

- estado inicial `APPROVED` e temporario ate `BK-MF1-10`;
- compras ficam filtradas por `companyId`;
- pagamento fica para `BK-MF1-08`;
- contabilizacao fica para `BK-MF1-09`.

### `BK-MF1-08` - Registar pagamentos

Smoke:

- registar pagamento parcial em `POST /api/purchases/documents/:id/payments`;
- registar pagamento total e fechar a compra quando aplicavel;
- guardar metodo, data e referencia;
- atualizar saldo pago de forma transacional.

Negativos:

- pagar valor superior ao saldo em aberto => erro controlado;
- pagar nota de credito de fornecedor => bloqueado;
- data em periodo fiscal fechado => bloqueada;
- documento de outra empresa => `404` ou `403`.

Bloqueios:

- `Payment` fica ligado ao documento de compra;
- atualizacao de saldo e movimento de pagamento sao transacionais;
- diario contabilistico continua no `BK-MF1-09`;
- gestao avancada de bancos e caixa fica fora deste BK.

### `BK-MF1-09` - Gerar lancamentos contabilisticos automaticos de compras

Smoke:

- contabilizar compra registada/aprovada em `POST /api/accounting/purchase-postings/:purchaseDocumentId`;
- confirmar diario equilibrado entre gasto, IVA dedutivel e fornecedor;
- confirmar que nota de credito inverte o efeito contabilistico conforme tipo documental;
- confirmar idempotencia.

Negativos:

- contabilizar compra inexistente ou de outra empresa => `404` ou `403`;
- periodo fiscal fechado => bloqueado;
- contabilizar duas vezes o mesmo documento => idempotente;
- documento em estado invalido => erro controlado.

Bloqueios:

- reutilizar ou alinhar `JournalEntry`, `JournalEntryLine`, `source` e helpers do `BK-MF1-04`;
- expor helper transacional para `BK-MF1-10`;
- preservar auditoria;
- mapa de IVA fica para `BK-MF3-01`.

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

Bloqueios:

- fluxo `DRAFT -> APPROVED -> POSTED`;
- `markPurchaseDocumentPosted` reutiliza `postPurchaseDocumentInTransaction`;
- diario, estado e auditoria ficam na mesma transacao;
- historico detalhado fica para `BK-MF2-01`.

---

## 10) Evidencia obrigatoria

Cada BK deve preencher:

- `pr`;
- `proof`;
- `neg`;
- `files`;
- `commands`;
- `screenshots`, quando houver UI;
- `notes`.

Para prioridades:

- `P0`: `unit + contracts/smoke` e minimo `3` negativos;
- `P1`: `unit/contracts` relevantes e minimo `2` negativos;
- `P2`: teste focal e minimo `1` negativo.

Comandos esperados no projeto atual:

```bash
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
npm --prefix apps/api run syntax:check
npm --prefix apps/api run prisma:validate
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
bash scripts/validate-planificacao.sh
```

Evidence nunca pode conter:

- passwords reais;
- tokens;
- cookies reais;
- URIs privadas;
- dados financeiros reais;
- dados pessoais nao sanitizados;
- screenshots com informacao sensivel;
- outputs completos com stack traces sensiveis;
- `companyId`/IDs reais usados para expor ownership indevido;
- prompts internos sensiveis.

---

## 11) Decisoes tecnicas confirmadas para MF1

- A empresa ativa vem da sessao/contexto autenticado, nao do body.
- Documentos, taxas de IVA, recebimentos, pagamentos e lancamentos sao sempre filtrados por `companyId`.
- Sessao autenticada usa cookie `HttpOnly`; o frontend nao deve depender de `Authorization: Bearer` se o contrato ativo for cookie.
- Dinheiro deve ser guardado em centimos.
- Taxas de IVA devem usar basis points quando aplicavel.
- Numeracao sequencial deve ser por empresa, ano e tipo documental.
- Emissao e numeracao devem ser transacionais.
- Periodos fiscais fechados bloqueiam operacoes financeiras/contabilisticas quando o guia o exige.
- Lancamentos contabilisticos automaticos devem ser equilibrados e idempotentes.
- `BK-MF1-04` e `BK-MF1-09` devem alinhar nomes/modelos de diario contabilistico.
- `BK-MF1-06` deve partir do contrato final de `BK-MF1-02`.
- `BK-MF1-10` deve partir do contrato final de `BK-MF1-07` e reutilizar helper de contabilizacao do `BK-MF1-09`.
- O historico detalhado de aprovacoes fica para `BK-MF2-01`.
- Mapas de IVA ficam para `BK-MF3-01`.
- SAF-T fica para `BK-MF3-06` e `BK-MF7-07`.

---

## 12) Fecho da MF1

A `MF1` so esta pronta quando:

- todos os BKs `BK-MF1-01..10` tem criterios de aceite cumpridos;
- smoke, negativos e evidence estao completos;
- nao ha drift entre matriz, backlog, contrato de campos, guias e sprints;
- validacao documental passa ou o blocker externo fica registado;
- vendas conseguem criar, emitir, aprovar, receber, consultar saldos e contabilizar;
- compras conseguem criar, pagar, contabilizar, aprovar e marcar como lancadas;
- `VatRate`, documentos, recebimentos, pagamentos e lancamentos estao filtrados por `companyId`;
- lancamentos automaticos estao equilibrados e idempotentes;
- periodos fiscais fechados bloqueiam operacoes financeiras/contabilisticas quando o guia exige;
- `BK-MF2-01` fica desbloqueado para historico e justificacoes de aprovacoes/reprovacoes.

Comando obrigatorio:

```bash
bash scripts/validate-planificacao.sh
```

---

## 13) Se bloquearem mais de 45 minutos

Mandar-me:

1. 2-3 frases sobre o problema.
2. BK e path do guia.
3. Heading/seccao que causou duvida.
4. Erro/log relevante sem dados sensiveis.
5. O que ja tentaram.
6. Se o bloqueio e tecnico, documental, de dependencia, fiscal, contabilistico, privacidade ou seguranca.

Se o bloqueio envolver regras fiscais, periodos fiscais, numeracao sequencial, contas SNC, transicoes de estado, isolamento multiempresa ou autorizacao por role, nao inventar a decisao no PR. Marcar como `TODO/BLOCKER` e pedir validacao.
