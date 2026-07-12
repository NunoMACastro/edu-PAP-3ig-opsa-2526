# BK-MF7-07 - Geração de SAF-T conforme especificações legais PT

## Header

- `doc_id`: `GUIA-BK-MF7-07`
- `bk_id`: `BK-MF7-07`
- `macro`: `MF7`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF24`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF7-08`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-07-geracao-de-saf-t-conforme-especificacoes-legais-pt.md`
- `last_updated`: `2026-07-10`

## Objetivo

Fechar a camada de conformidade do exportador iniciado em `BK-MF3-06`: schema oficial `1.04_01`, bytes Windows-1252, reconciliação do conteúdo, storage privado e revisão externa. Este BK não autoriza alegar certificação da aplicação nem submissão automática à Autoridade Tributária.

O contrato técnico está centralizado em [CONTRATO-INTERFACES-IMPLEMENTACAO.md](../../CONTRATO-INTERFACES-IMPLEMENTACAO.md). Qualquer diferença deve ser corrigida no guia antes de implementar.

## Contrato imutável

- Criar: `POST /api/compliance/saft/exports` com `{ type, fiscalPeriodId }`.
- Consultar: `GET /api/compliance/saft/exports/:exportId`.
- Descarregar: `GET /api/compliance/saft/exports/:exportId/download`.
- Origem temporal: `FiscalPeriod` da empresa ativa.
- Formato: SAF-T (PT) `1.04_01`, namespace oficial e Windows-1252.
- Persistência: XML no S3; metadata, SHA-256 e validações no `SaftExportRun`.
- Segurança: autenticação, empresa ativa, permissão e role adequada em todas as operações.
- Disponibilidade: `SAFT_EXPORT_ENABLED=false` até todos os gates passarem.

## Scope-in

- Obter e versionar o XSD oficial por processo controlado.
- Validar estrutura, namespace e tipos.
- Reconciliar totais e contagens do XML com a base.
- Provar encoding real e download autorizado.
- Registar revisão externa por contabilista/revisor identificado no processo, sem dados pessoais na evidence pública.

## Scope-out

- Submissão automática à AT.
- Declaração de certificação de software.
- Aceitação de datas arbitrárias fora de períodos fiscais.
- Ativação da feature flag com testes em falta ou ignorados.

## Ficheiros públicos do aluno

- `apps/api/src/modules/compliance/saftXml.js`
- `apps/api/src/modules/compliance/saftValidation.js`
- `apps/api/src/modules/compliance/saftService.js`
- `apps/api/src/modules/compliance/saftRoutes.js`
- `apps/api/tests/fixtures/saft/`
- `apps/api/tests/contracts/saft.contract.test.js`
- `apps/api/tests/integration/saft.integration.test.js`
- `apps/web/src/pages/SaftExportPage.tsx`
- `apps/web/src/lib/api/saft.ts`

## Tutorial técnico linear

### Passo 1 - Fixar a fonte oficial

Regista na evidence:

- versão `1.04_01`;
- URL pública da fonte oficial, sem parâmetros sensíveis;
- SHA-256 do XSD recebido;
- data de obtenção;
- licença/condições relevantes.

`SAFT_XSD_PATH` aponta para o ficheiro validado. A aplicação deve falhar no startup ou no pedido, de forma controlada, quando a feature está ativa e o XSD não existe.

### Passo 2 - Construir um snapshot coerente

Dentro de uma leitura consistente, obtém os dados da empresa e do período:

- perfil fiscal e morada;
- clientes e fornecedores referenciados;
- produtos/serviços e códigos de imposto;
- tabela de impostos;
- documentos de faturação abrangidos;
- movimentos e linhas contabilísticas abrangidos.

Filtra sempre por `companyId`. O `fiscalPeriodId` deve pertencer à empresa ativa e definir os limites inclusivos. Não uses a hora local do servidor para inventar datas fiscais.

### Passo 3 - Gerar e codificar

Usa um builder XML para escapar dados. Gera primeiro a representação estrutural, valida campos obrigatórios e só depois converte os bytes:

```js
const xmlUtf16 = buildSaftXml(snapshot);
const bytes = iconv.encode(xmlUtf16, "windows-1252");
const sha256 = createHash("sha256").update(bytes).digest("hex");
```

Confirma por teste que o prólogo, o namespace e os bytes representam o mesmo encoding. Inclui fixtures com `ç`, `ã`, `€` e caracteres que devem ser rejeitados.

### Passo 4 - Validar XSD

Executa um validador XML real contra o XSD. Guarda no run:

- booleano de validade;
- versão e hash do XSD;
- resumo redigido dos erros;
- instante da validação.

Um erro de schema põe o run em `FAILED`; não cria download utilizável.

### Passo 5 - Reconciliar conteúdo

Compara valores derivados do XML com queries independentes:

| Dimensão | Prova mínima |
|---|---|
| clientes/fornecedores | IDs e contagens referenciados |
| documentos | contagem por tipo/estado |
| bases e impostos | totais por taxa e isenção |
| movimentos | débitos, créditos e equilíbrio |
| período | primeira/última data dentro de `FiscalPeriod` |

Usa valores monetários em minor units/decimal controlado; nunca compares floats binários diretamente. Divergência bloqueia a promoção do ficheiro.

### Passo 6 - Promover e descarregar

O objeto nasce em quarentena com chave aleatória. Depois de XSD e reconciliação, promove-o para prefixo privado da empresa. O endpoint de download:

- volta a autorizar utilizador, empresa e role;
- confirma `COMPLETED`, hash e storage key;
- faz streaming do S3;
- envia `Content-Type: application/xml` e filename seguro;
- envia `Content-Disposition: attachment`, `nosniff` e `no-store`.

Se a promoção ou a transação falhar, elimina o objeto parcial e marca o run como `FAILED`.

### Passo 7 - Rever externamente

Entrega uma fixture representativa e o relatório de reconciliação a um contabilista/revisor competente. Regista apenas a decisão, data e referência interna não sensível. Correções pedidas reabrem o mesmo BK.

A flag só pode ser ativada no ambiente autorizado quando:

1. XSD passa;
2. reconciliação passa;
3. download/hash passam;
4. negativos multiempresa passam;
5. revisão externa é favorável.

### Passo 8 - Criar testes de regressão

Inclui pelo menos:

- happy path de faturação e contabilidade;
- período inexistente e de outra empresa;
- perfil fiscal incompleto;
- taxa isenta a `0` com motivo legal;
- XML adulterado falha XSD/hash;
- totais adulterados falham reconciliação;
- XSD ausente com flag ativa falha fechado;
- run incompleto não descarrega;
- utilizador sem permissão não consulta nem descarrega;
- falha S3 deixa zero órfãos.

## Comandos de validação

```bash
cd apps/api
npm run test:contracts
npm run test:integration
npm run test:mf7

cd ../web
npm run typecheck
npm run test
npm run build
```

Regista comando, diretório, exit code, contagens e resumo. Teste não executado ou serviço indisponível é blocker; nunca PASS.

## Critérios de aceite

- Nenhum endpoint síncrono alternativo contorna o run persistente.
- A versão, namespace, XSD e encoding são coerentes.
- O período vem exclusivamente de `FiscalPeriod`.
- XML e totais reconciliam com a fonte.
- Storage e download são privados, autorizados e verificáveis por hash.
- A revisão externa está registada.
- A feature permanece fail-closed até toda a evidence existir.

## Evidence para PR/defesa

- hashes do XSD e de uma exportação final;
- output do validador XSD;
- matriz de reconciliação;
- positivos/negativos de autorização e multiempresa;
- prova de encoding;
- prova de cleanup S3;
- decisão da revisão externa;
- estado efetivo de `SAFT_EXPORT_ENABLED`, sem expor o resto do ambiente.

## Importância

A conformidade estrutural e a coerência contabilística são gates independentes; ambos precisam de evidence e revisão externa.

## Estado antes e depois

- Antes: exportador parcial sem XSD/reconciliação/revisão completos.
- Depois: pipeline legal fail-closed, ainda sem alegação de certificação.

## Pre-requisitos

- Concluir `BK-MF3-06`, preparar XSD oficial, PostgreSQL e S3 de teste.

## Glossário

- **Master files:** dados mestre referenciados no ficheiro.
- **Windows-1252:** encoding obrigatório dos bytes finais.

## Conceitos teóricos essenciais

Namespace, versão e XSD devem corresponder; totais reconciliados provam conteúdo; revisão externa cobre interpretação fiscal que testes não substituem.

## Arquitetura do BK

Snapshot consistente → builder XML → encoding → XSD → reconciliação → S3 → download → revisão externa.

## Ficheiros a criar/editar/rever

Revê gerador, validator, service, routes, fixtures, página e XSD nos caminhos públicos indicados.

## Cenários negativos mínimos

Executa pelo menos 3 cenários negativos: XSD adulterado, totais divergentes e download de outra empresa.

## Validação final

Executa os comandos da secção anterior e regista exit codes/contagens. XSD, S3 ou revisão não executados ficam bloqueados.

## Handoff

Entrega a `BK-MF7-08` um módulo de compliance com fronteiras claras, sem acoplar o backend modular a um endpoint retirado.

## Changelog

- `2026-07-10`: conformidade elevada para `1.04_01`, XSD, Windows-1252, reconciliação, S3 e revisão externa.
