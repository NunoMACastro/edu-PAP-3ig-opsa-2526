# BK-MF*-** - Titulo claro do BK

> Template obrigatorio para guias BK OPSA.
> Modelo estrutural: BK-MF4-01 da OPSA, com tutorial tecnico linear, codigo completo, explicacao didatica, validacao, negativos, evidence e handoff.
> Nao removas secoes. Se uma seccao nao se aplicar, escreve "Nao aplicavel" e justifica.

## Header

- `doc_id`: `GUIA-BK-MF*-**`
- `bk_id`: `BK-MF*-**`
- `macro`: `MF*`
- `owner`: `...`
- `apoio`: `...`
- `prioridade`: `P0|P1|P2`
- `estado`: `TODO|IN_PROGRESS|DONE|BLOCKED`
- `esforco`: `S|M|L`
- `dependencias`: `BK-...|-`
- `rf_rnf`: `RFxx|RNFxx|RFxx,RNFyy`
- `fase_documental`: `Fase 1|Fase 2|Fase 3`
- `sprint`: `Sxx|Sxx-Syy`
- `core_or_reforco`: `Core|Reforco`
- `proximo_bk`: `BK-...|-`
- `guia_path`: `docs/planificacao/guias-bk/MF*/BK-MF*-**-slug-semantico.md`
- `last_updated`: `YYYY-MM-DD`

#### Objetivo

Explica, em 2 a 4 paragrafos, o que o aluno vai construir neste BK e que resultado observavel fica na app.

#### Importancia

Explica porque este BK existe no ERP OPSA, que RF/RNF cumpre, que problema financeiro/operacional resolve e que BKs seguintes ficam desbloqueados.

#### Scope-in

- Lista fechada do que este BK implementa, corrige ou prepara.
- Incluir backend, frontend, Prisma/dados, testes, validacoes e evidence quando aplicavel.

#### Scope-out

- Lista fechada do que este BK nao implementa.
- Nao antecipar SAF-T completo, integracoes bancarias reais, automatizacao contabilistica, RAG, OCR ou IA generativa sem contrato documental.

#### Estado antes e depois

- Estado antes: que contratos, ficheiros ou funcionalidades ja existem.
- Estado depois: que novo contrato fica implementavel e validavel.

#### Pre-requisitos

- RF/RNF aplicaveis.
- BKs anteriores obrigatorios.
- Documentos canonicos a consultar.
- Ficheiros reais em `real_dev/api`, `real_dev/web` e `real_dev/api/prisma/schema.prisma`, se existirem.

#### Glossario

- Termos de dominio OPSA usados no BK.
- Termos tecnicos que o aluno precisa de compreender antes de copiar codigo.

#### Conceitos teoricos essenciais

Explica a teoria minima para o aluno perceber o raciocinio: empresa ativa, multiempresa, cliente/fornecedor, recebimento/pagamento, documento operacional/lancamento contabilistico, periodo fiscal, IVA, SNC, IBAN, relatorios, auditoria ou IA explicavel.

#### Arquitetura do BK

- Endpoint(s):
- Modelo/schema Prisma:
- Service(s):
- Controller/route:
- Guard/middleware:
- Cliente API:
- Pagina/componente:
- Testes:
- Handoff para o proximo BK:

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/api/...`
- EDITAR: `real_dev/api/...`
- EDITAR: `real_dev/api/prisma/schema.prisma`
- CRIAR: `real_dev/web/...`
- EDITAR: `real_dev/web/...`
- REVER: `docs/planificacao/guias-bk/MF*/BK-...md`

#### Tutorial tecnico linear

Cada passo deve ser executavel por ordem. O aluno nao deve precisar de adivinhar imports, helpers, DTOs, services, componentes, rotas, testes ou comandos.

Regra obrigatoria para passos com codigo:

- Todo bloco de codigo deve estar completo para o contexto do BK.
- Depois de cada bloco de codigo deve existir `Explicacao do codigo`.
- Bloco com 8 ou mais linhas nao vazias: pelo menos 1 comentario didatico dentro do codigo.
- Bloco com 20 ou mais linhas nao vazias: pelo menos 2 comentarios didaticos dentro do codigo.
- Mesmo com menos de 8 linhas, e obrigatorio comentario didatico se houver autenticacao, empresa ativa, multiempresa, autorizacao, roles, validacao, async, queries, Prisma, transacoes, estado React, testes, logs, auditoria, dados financeiros ou regra de dominio OPSA.
- Comentario didatico explica intencao, contrato, risco evitado ou invariante. Nao repete a sintaxe.

### Passo 1 - Nome claro

1. Objetivo funcional do passo no contexto da app.

Texto especifico: o que este passo entrega no OPSA.

2. Ficheiros envolvidos.

- CRIAR/EDITAR/REVER: `caminho/exato`
- LOCALIZACAO: modulo, pasta ou bloco onde a alteracao entra.

3. Instrucoes do que fazer.

Explica a ordem de trabalho e as decisoes `CANONICO`, `DERIVADO` ou `TODO (BLOCKER)`.

4. Codigo completo, correto e integrado com a app final.

```ts
// Codigo real ou "Sem codigo neste passo."
```

5. Explicacao do codigo.

Deve cobrir:

- o que o codigo faz;
- porque existe neste BK;
- que contrato tecnico, RF/RNF, criterio de aceite ou handoff cumpre;
- que ficheiros ou BKs anteriores usa;
- que ficheiros ou BKs seguintes prepara;
- que dados entram e saem;
- que validacoes e regras de seguranca/empresa ativa/multiempresa/role/permissao aplica;
- que erro comum, bug, duplicacao, vulnerabilidade ou incoerencia evita;
- como testar;
- que partes o aluno pode adaptar com seguranca e que partes nao deve alterar.

6. Validacao do passo.

- Comando, request/response, screenshot ou verificacao objetiva.
- Resultado esperado.

7. Cenario negativo/erro esperado.

- Erro que deve acontecer.
- Codigo HTTP, mensagem, estado UI ou assert esperado.

### Passo 2 - Nome claro

Repetir exatamente a estrutura do Passo 1.

#### Criterios de aceite

- Criterios mensuraveis, ligados a RF/RNF e aos passos.
- `P0`: unit + integration/contract + smoke + 3 negativos concretos.
- `P1`: unit/contract ou integration + smoke + 2 negativos concretos.
- `P2`: teste focal + 1 negativo concreto.

#### Validacao final

- Executar validadores reais de `real_dev/api/package.json` e `real_dev/web/package.json`.
- Quando houver Prisma, incluir `prisma:validate` ou comando equivalente.
- Executar smoke principal.
- Executar negativos de sessao ausente, empresa errada, role sem acesso e input invalido quando aplicavel.

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit ou pacote de entrega.
- `proof`: request/response, screenshot ou log controlado do fluxo principal.
- `neg`: cenarios negativos executados.
- `fonte`: RF/RNF/BK/documento que prova o contrato.
- `multiempresa`: prova de que `companyId` vem da sessao/contexto autenticado e nao do frontend.

#### Handoff

- O que este BK entrega ao proximo BK.
- Campos, endpoints, modelos, roles, payloads, estados, permissao e riscos restantes.

#### Changelog

- `YYYY-MM-DD`: alteracao feita e motivo.
