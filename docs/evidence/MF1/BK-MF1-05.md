### Passo 1

* BK: BK-MF1-05
* Macrofase: MF1
* Requisito funcional: RF17
* Dependência: BK-MF0-03, BK-MF1-02, BK-MF1-03
* Próximo BK: BK-MF1-06
* Endpoint previsto: /api/sales/open-items

### Passo 2
Foi necessário adaptar o schema ao estado real da branch. O BK-MF1-05 reutiliza `SaleDocument` para consultar títulos em aberto, mas `Receipt` e `NumberSequence` não são necessários para esta consulta quando os respetivos BKs ainda não estão presentes na branch. Foi mantido o contrato funcional através de `amountPaidCents`.

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:generate
> @opsa/api@1.0.0 prisma:generate
> prisma generate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 643ms

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate                                 
   
> @opsa/api@1.0.0 prisma:validate   
> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

Depopis de testar eu voltei tudo pasa schema.prisma para não criar conflitos.

### Passso 3
Objetivo
Disponibilizar a consulta de títulos em aberto ao utilizador através da camada frontend, mantendo chamadas tipadas e mensagens de erro controladas.

Ficheiros alterados
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/salesOpenItemsApi.ts`
- `apps/web/src/pages/SalesOpenItemsPage.tsx`

Implementação realizada
- Foi criada a integração frontend para consulta de títulos em aberto e antiguidade de saldos.
O ficheiro `apiClient.ts` existente não foi substituído. Foi apenas estendido com o domínio `salesOpenItems`, mantendo o cliente HTTP único da aplicação, a autenticação por cookie `HttpOnly` e o tratamento centralizado de erros.
- Foi criado o ficheiro `salesOpenItemsApi.ts`, que expõe uma função tipada para consultar títulos em aberto com filtro por data de referência.
- Foi criada a página `SalesOpenItemsPage.tsx`, com filtro por data, estados de carregamento, erro, empty state e tabela de resultados.

Nota de integração
A UI não calcula saldos, dias de atraso nem buckets de antiguidade. O frontend envia apenas a data de referência e o backend devolve `openAmountCents`, `daysOverdue` e `bucket`.

Comandos a executar
bash
npm --prefix apps/api run test:unit
npm --prefix apps/web run typecheck
npm --prefix apps/web run build

### Passo 4
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (8.7457ms)
✔ BK01: registo mantém política de password forte (2.0468ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.8832ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.9894ms)
✔ BK07: importação vazia é rejeitada (1.5416ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (1.0038ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.0605ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.3716ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (1.424ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 708.3466

### Passo 5
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (3.8741ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (1.1182ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (5.3004ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.4662ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (2.8324ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.0476ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 809.9895

### Passo 6
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff -- docs/planificacao/guias-bk/MF1 - não devolveu nada
- PS D:\PAP\edu-PAP-3ig-opsa-2526> git diff -- check - não devolveu nada

Evidência preparada
A evidência do BK regista:
- ficheiros alterados;
- comandos executados;
- resultados obtidos;
- filtros aplicados.

Filtros e regras registadas
- A consulta usa sempre `companyId` vindo do contexto autenticado.
- O `companyId` não é recebido no body nem na query.
- São considerados apenas documentos de venda da empresa ativa.
- São considerados apenas documentos em estado `ISSUED`.
- Notas de crédito (`CREDIT_NOTE`) ficam fora da consulta.
- Documentos com `openAmountCents <= 0` ficam fora da listagem.
- A data de referência (`asOfDate`) é validada no backend.
- O saldo em aberto é calculado por `totalCents - amountPaidCents`.
- Os buckets de antiguidade são calculados no backend.

Comandos executados
```bash
git diff -- docs/planificacao/guias-bk/MF1
git status
git diff --stat
git diff --check
npm --prefix apps/api run prisma:generate
npm --prefix apps/api run prisma:validate
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts

9) Validação Final BK-MF1-05
Smoke
    Endpoint GET /api/sales/open-items implementado.
    Consulta devolve documentos emitidos com saldo por receber.
    O saldo em aberto é calculado através de totalCents - amountPaidCents.
    O filtro por data de referência recalcula corretamente os dias de atraso.
    Os buckets de antiguidade são calculados corretamente.
    A UI apresenta estados loading, empty, error e success.
    Integração final da página na navegação da aplicação por validar.

Negativos
    Pedido sem sessão devolve 401.
    Pedido sem empresa ativa devolve erro definido pela MF0.
    Documento totalmente liquidado não aparece na listagem.
    CREDIT_NOTE não aparece como título em aberto.
    Documentos de outra empresa nunca aparecem na consulta.
    Data de referência inválida devolve 400.
    Erros do backend são apresentados de forma controlada na UI.

Bloqueios e limites do BK
    Consulta de leitura pura, sem alterar dados.
    Utilização obrigatória do companyId proveniente da sessão autenticada.
    O frontend não calcula saldos nem buckets.
    Buckets suportados:
        NOT_DUE
        DAYS_1_30
        DAYS_31_60
        DAYS_61_90
        DAYS_90_PLUS
    Os saldos utilizam SaleDocument.totalCents e amountPaidCents.
    Apenas documentos emitidos (ISSUED) entram na consulta.
    Notas de crédito ficam excluídas da listagem.
    Cobranças automáticas ficam fora do âmbito deste BK.
    A previsão de tesouraria detalhada será tratada em BK-MF3-04

10) Evidência obrigatória - BK-MF1-05

### pr
PR: ainda não criado.

### proof
Foi implementada a consulta de títulos em aberto e antiguidade de saldos.

Foi implementado o endpoint:
```text
GET /api/sales/open-items
```

Foi criado o módulo `open-items` para consulta de documentos de venda emitidos com saldo por receber.
A consulta utiliza exclusivamente o `companyId` proveniente da sessão autenticada.

Foram implementados:
* cálculo de saldo em aberto (`openAmountCents`);
* cálculo de dias de atraso (`daysOverdue`);
* classificação por bucket de antiguidade.

Os buckets suportados são:
* `NOT_DUE`
* `DAYS_1_30`
* `DAYS_31_60`
* `DAYS_61_90`
* `DAYS_90_PLUS`

Foi criada integração frontend através de:
* `salesOpenItemsApi.ts`
* `SalesOpenItemsPage.tsx`

Foi implementada visualização com estados:
* loading;
* empty;
* error;
* success.

### neg
Cenários negativos previstos/validados:
* Pedido sem sessão devolve `401`.
* Pedido sem empresa ativa devolve erro definido pela MF0.
* Data de referência inválida devolve `400`.
* Documento totalmente liquidado não aparece na consulta.
* `CREDIT_NOTE` não aparece como título em aberto.
* Documentos de outra empresa nunca aparecem na listagem.
* Erros do backend são apresentados de forma controlada.

### files
* `apps/api/src/modules/open-items/salesOpenItemsService.js`
* `apps/api/src/modules/open-items/salesOpenItemsRoutes.js`
* `apps/api/src/server.js`
* `apps/web/src/lib/salesOpenItemsApi.ts`
* `apps/web/src/pages/SalesOpenItemsPage.tsx`
* `apps/api/src/modules/open-items/salesOpenItemsService.test.js`
* `docs/evidence/MF1/BK-MF1-05.md`

### commands
```bash
git diff -- docs/planificacao/guias-bk/MF1
git status
git diff --stat
git diff --check
npm --prefix apps/api run prisma:generate
npm --prefix apps/api run prisma:validate
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts
```

### screenshots
Sem screenshots incluídos nesta revisão.

### notes
* O `companyId` é obtido exclusivamente da sessão autenticada.
* A operação é apenas de leitura.
* Nenhum dado é alterado pela consulta.
* O frontend não calcula saldos nem buckets.
* O backend calcula `openAmountCents`, `daysOverdue` e `bucket`.
* Apenas documentos em estado `ISSUED` são considerados.
* Documentos liquidados são excluídos da listagem.
* Notas de crédito não são consideradas títulos em aberto.
* Os buckets seguem a classificação definida no guia.
* O BK prepara informação para relatórios de ageing e análise de cobranças.
* Cobranças automáticas permanecem fora do âmbito deste BK.
* A previsão de tesouraria detalhada será tratada em BK-MF3-04.
