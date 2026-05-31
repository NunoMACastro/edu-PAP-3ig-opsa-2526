# ORDEM-DEPENDENCIAS-E-PRS-MF1

## Header

- `doc_id`: `ORDEM-DEPENDENCIAS-E-PRS-MF1`
- `path`: `docs/planificacao/guias-bk/MF1/ORDEM-DEPENDENCIAS-E-PRS-MF1.md`
- `macro`: `MF1`
- `status`: `ativo`
- `last_updated`: `2026-06-01`

## Objetivo

Definir a ordem oficial para os alunos implementarem os BKs da `MF1` e reduzir conflitos de Pull Requests. Esta ordem é documental e pedagógica: assume que o código real existente pode estar incompleto ou divergente e usa apenas os contratos dos BKs.

## Ordem topológica oficial

Antes de abrir PRs da `MF1`, devem estar disponíveis os BKs `MF0` necessários:

1. `BK-MF0-01`
2. `BK-MF0-02`
3. `BK-MF0-03`
4. `BK-MF0-07`
5. `BK-MF0-08`
6. `BK-MF0-09`
7. `BK-MF0-10`
8. `BK-MF0-11`

Ordem oficial dos BKs `MF1`:

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

Esta sequência é uma ordem topológica segura. Alguns BKs poderiam ser tecnicamente paralelizáveis depois das suas dependências diretas, mas a ordem sequencial acima é a recomendada para alunos porque reduz colisões em ficheiros partilhados.

## Regra de PR sequencial

- Abrir cada PR apenas depois de os PRs das suas `dependencias` estarem merged.
- Fazer rebase ou atualizar a branch antes de pedir revisão quando uma dependência foi merged entretanto.
- Evitar PRs concorrentes a tocar no mesmo ficheiro partilhado.
- Quando dois BKs precisarem de alterar o mesmo ficheiro partilhado, o segundo PR deve partir da branch já atualizada com o primeiro PR merged.
- Não copiar blocos acumulados de schema, routes ou server de guias que ainda não sejam dependências do BK em implementação.

## Ficheiros de alto risco

Os ficheiros seguintes concentram maior risco de conflito entre PRs:

- `apps/api/prisma/schema.prisma`
- `apps/api/src/server.js`

Regra prática: deve existir no máximo um PR ativo por vez a alterar qualquer um destes ficheiros. Se for inevitável ter dois PRs em paralelo, os autores devem combinar previamente a ordem de merge e atualizar a segunda branch logo após o primeiro merge.

## Pares que exigem coordenação

| Par | Motivo | Coordenação exigida |
| --- | --- | --- |
| `MF1-02/MF1-06` | Ambos mexem no ciclo de vida de documentos de venda e emissão definitiva. | `MF1-06` deve partir do contrato final de `MF1-02` e não duplicar lógica divergente de emissão. |
| `MF1-04/MF1-09` | Ambos criam contabilização automática e tendem a tocar em modelos/serviços de lançamentos. | Confirmar nomes de `JournalEntry`, `JournalEntryLine`, `source` e helpers transacionais antes do segundo PR. |
| `MF1-07/MF1-10` | `MF1-10` altera o fluxo de criação/aprovação de compras criado por `MF1-07`. | `MF1-10` deve ser implementado depois do merge de `MF1-07` e preservar as validações de compra já entregues. |

## Dependências MF0 assumidas na MF1

- `BK-MF0-03` é baseline explícito da `MF1` porque fornece autenticação aplicada ao contexto multiempresa e roles de forma transitiva.
- `BK-MF0-08` é dependência explícita dos BKs que criam, alteram ou contabilizam documentos financeiros/contabilísticos por causa de `assertOpenFiscalPeriod`.
- `BK-MF0-09`, `BK-MF0-10` e `BK-MF0-11` entram apenas nos BKs que usam diretamente clientes, fornecedores ou artigos/serviços.
- `BK-MF0-12` não é dependência técnica da `MF1`, porque os BKs analisados não usam armazéns/localizações diretamente.

## Critério antes de merge

Antes de fazer merge de um PR `MF1`, confirmar:

- dependências diretas merged;
- matriz, backlog, contrato de campos e header do guia mantêm a mesma lista de `dependencias`;
- conflitos resolvidos em `apps/api/prisma/schema.prisma` e `apps/api/src/server.js`;
- validação documental executada;
- evidence do PR indica que a ordem de dependências foi respeitada.

## Changelog

- `2026-06-01`: Documento criado para consolidar ordem topológica da MF1, regra de PR sequencial e riscos de integração com MF0.
