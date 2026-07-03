# BK-MF8-09 - Documentação técnica mínima (arquitetura, modelos, fluxo contabilístico).

## Header

- `doc_id`: `GUIA-BK-MF8-09`
- `bk_id`: `BK-MF8-09`
- `macro`: `MF8`
- `owner`: `Pedro`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-10`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-09-documentacao-tecnica-minima-arquitetura-modelos-fluxo-contabilistico.md`
- `last_updated`: `2026-07-03`

#### Objetivo

Neste BK vais criar documentação técnica mínima que explica arquitetura, modelos, fluxos e limites contabilísticos da app sem transformar documentação em promessa legal.

#### Importância

Na defesa, a equipa precisa de explicar como a app está organizada e o que cada fluxo faz. Documentação mínima reduz ambiguidade, ajuda manutenção e impede confundir subscrição simulada com fluxo contabilístico real.

#### Scope-in

- Criar `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`.
- Criar `docs/evidence/MF8/BK-MF8-09.md` como evidence de PR/defesa.
- Documentar módulos backend e páginas frontend principais.
- Explicar modelos de dados mais relevantes.
- Separar documento operacional, lançamento contabilístico e subscrição simulada.
- Criar checklist de atualização documental.

#### Scope-out

- Criar manual legal completo.
- Declarar certificação fiscal.
- Documentar detalhes internos que não existem no MVP.
- Alterar RF/RNF ou matriz.

#### Estado antes e depois

- Antes: MF0..MF7 já entregaram autenticação com cookies HttpOnly, empresa ativa no backend, permissões, dados mestre, vendas, compras, inventário, tesouraria, contabilidade, IA explicável, auditoria, hardening e gates de qualidade.
- Depois: `BK-MF8-09` deixa dois artefactos distintos e verificáveis: a documentação técnica mínima em `ARQUITETURA-TECNICA-MINIMA.md` e a evidence de PR/defesa em `BK-MF8-09.md`.

#### Pre-requisitos

- Ler `RNF30` em `docs/RF.md` ou `docs/RNF.md`.
- Rever a linha de `BK-MF8-09` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Rever a linha de `BK-MF8-09` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever os BKs declarados em dependências: `-`.
- Confirmar que todos os caminhos do aluno usam `apps/api` ou `apps/web`.
- Negativos: mínimo `2`.

#### Glossário

- Arquitetura técnica: mapa de módulos e responsabilidades.
- Modelo de dados: entidade persistida no Prisma.
- Fluxo contabilístico: ligação controlada entre documento e lançamento.
- Limite documental: fronteira entre o que existe e o que não é prometido.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF30` é o requisito associado a `BK-MF8-09`.
- `CANONICO`: `BK-MF8-09` pertence à MF8, sprint `S12`, owner `Pedro`, apoio `Oleksii`, prioridade `P1` e próximo BK `BK-MF8-10`.
- `CANONICO`: a app dos alunos usa Node.js, Express, ES Modules, Prisma, React, Vite e TypeScript nos caminhos públicos `apps/api` e `apps/web`.
- `DERIVADO`: este guia transforma o requisito em ficheiros e testes pequenos, porque a MF8 é fase de hardening, qualidade final e fecho da PAP.

O domínio de documentação técnica deve respeitar a regra transversal do OPSA: a empresa ativa vem do contexto autenticado no backend; permissões e roles são aplicadas no backend; a UI mostra estado e recolhe intenção, mas não decide ownership nem autorização final.

Quando este BK tocar IA, a IA explica, recomenda e mostra fonte; não altera dados contabilísticos, não aprova documentos e não executa ações automaticamente. Quando tocar contabilidade ou documentos financeiros, o guia distingue documento operacional, pagamento/recebimento e lançamento contabilístico.

#### Arquitetura do BK

- Requisito: `RNF30`.
- Domínio principal: documentação técnica.
- Backend público dos alunos: `apps/api`.
- Frontend público dos alunos: `apps/web`.
- Prisma público dos alunos: `apps/api/prisma/schema.prisma`.
- Documento técnico: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`.
- Evidence PR/defesa: `docs/evidence/MF8/BK-MF8-09.md`.
- Handoff: `BK-MF8-10`.

#### Ficheiros a criar/editar/rever

- CRIAR: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- CRIAR: `docs/evidence/MF8/BK-MF8-09.md`
- CRIAR: `apps/api/scripts/check-mf8-technical-docs.mjs`
- EDITAR: `apps/api/package.json`
- REVER: `apps/api/prisma/schema.prisma`
- REVER: `apps/api/src/server.js`
- REVER: `apps/web/src/App.tsx`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar contrato canónico.

2. Ficheiros envolvidos:
    - REVER: `docs/RF.md`
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`

3. Instruções do que fazer.

Confirma que `BK-MF8-09` continua associado a `RNF30`, prioridade `P1`, owner `Pedro`, dependências `-` e próximo BK `BK-MF8-10`. Não alteres o header se a matriz e o backlog não mudaram.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental e impede que a implementação avance com requisito, owner ou dependência trocados.

5. Explicação do código.

O contrato canónico vem de RF/RNF, matriz e backlog. A leitura inicial protege o aluno de resolver outro problema com o nome de `BK-MF8-09`.

6. Validação do passo.

O aluno consegue apontar a linha de `RNF30` e a linha de `BK-MF8-09` antes de editar qualquer ficheiro.

7. Cenário negativo/erro esperado.

Se o header do guia divergir da matriz ou do backlog, a implementação deve parar até o drift ser resolvido.

### Passo 2 - Mapear integração com a app existente

1. Objetivo funcional do passo no contexto da app.

Mapear integração com a app existente.

2. Ficheiros envolvidos:
    - REVER: `apps/api/src/server.js`
    - REVER: `apps/api/src/modules`
    - REVER: `apps/web/src/App.tsx`
    - LOCALIZAÇÃO: módulos e páginas que o BK consome ou prepara

3. Instruções do que fazer.

Identifica os contratos já entregues pelas MFs anteriores que este BK deve respeitar: sessão por cookie HttpOnly, empresa ativa no backend, permissões, auditoria, módulos financeiros e cliente API central.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é de inventário técnico e evita criar endpoints duplicados ou nomes que não encaixam com a app.

5. Explicação do código.

Não há código porque a decisão principal é reutilizar fronteiras existentes. A MF8 fecha a app; não deve reabrir arquitetura sem necessidade.

6. Validação do passo.

A lista de ficheiros a criar, editar e rever fica coerente com os caminhos públicos `apps/api` e `apps/web`.

7. Cenário negativo/erro esperado.

Se o plano tentar usar caminho privado ou aceitar empresa ativa a partir do browser, corrige a arquitetura antes de avançar.

### Passo 3 - Implementar o contrato principal

1. Objetivo funcional do passo no contexto da app.

Implementar o contrato principal.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `apps/api/scripts/check-mf8-technical-docs.mjs`
    - LOCALIZAÇÃO: ficheiro completo ou função completa indicada no passo

3. Instruções do que fazer.

Cria ou edita o contrato principal de documentação técnica. Mantém JSDoc, comentários didáticos junto das decisões importantes e validação no backend sempre que houver input ou persistência.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/scripts/check-mf8-technical-docs.mjs

import { readFile } from "node:fs/promises";

const technicalDocUrl = new URL(
  "../../../docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md",
  import.meta.url,
);

const requiredSections = [
  "## Arquitetura",
  "## Modelos",
  "## Fluxos",
  "## Subscrição simulada",
  "## Limites",
];

/**
 * Valida a documentação técnica mínima exigida pelo RNF30.
 *
 * @param {string} text - Conteúdo completo de `ARQUITETURA-TECNICA-MINIMA.md`.
 * @returns {string[]} Lista de problemas encontrados na documentação.
 */
export function validateTechnicalDocumentation(text) {
  const errors = [];

  for (const section of requiredSections) {
    // Cada título obrigatório representa uma parte defensável da arquitetura OPSA.
    if (!text.includes(section)) {
      errors.push(`Falta secção obrigatória: ${section}`);
    }
  }

  if (!text.includes("subscrição simulada") && !text.includes("Subscrição simulada")) {
    errors.push("Falta explicar que a subscrição da MF8 é simulada e sem pagamento real.");
  }

  if (text.includes("certificação fiscal")) {
    // O BK documenta limites: não deve transformar o MVP numa promessa legal.
    errors.push("A documentação não pode declarar certificação fiscal.");
  }

  return errors;
}

const text = await readFile(technicalDocUrl, "utf8");
const errors = validateTechnicalDocumentation(text);

if (errors.length > 0) {
  throw new Error(`Documentação técnica mínima inválida:\n- ${errors.join("\n- ")}`);
}

console.log("Documentação técnica mínima MF8 validada.");
```

5. Explicação do código.

Este código entrega o núcleo de `BK-MF8-09`: transforma o requisito `RNF30` em contrato executável, com nomes estáveis para os BKs seguintes. A função `validateTechnicalDocumentation` devolve uma lista de erros para ser testável, enquanto a execução final do ficheiro falha o comando quando a documentação não cobre arquitetura, modelos, fluxos, subscrição simulada e limites.

6. Validação do passo.

Executa `cd apps/api && npm run test:mf8:technical-docs` depois de ligares o script no `package.json`. O resultado esperado é a mensagem `Documentação técnica mínima MF8 validada.`.

7. Cenário negativo/erro esperado.

Remove a secção `## Limites` do documento técnico e volta a executar o comando. O erro esperado é `Falta secção obrigatória: ## Limites`.

### Passo 4 - Criar teste ou gate mínimo

1. Objetivo funcional do passo no contexto da app.

Criar teste ou gate mínimo.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
    - EDITAR: `apps/api/package.json`
    - LOCALIZAÇÃO: campo `scripts` do `package.json`

3. Instruções do que fazer.

Cria a documentação técnica mínima e liga o gate ao `apps/api/package.json`. O documento técnico é o artefacto que explica a app; a evidence de PR/defesa será criada no Passo 6 para guardar comandos e resultados observados.

4. Código completo, correto e integrado com a app final.

```md
# Arquitetura técnica mínima MF8

## Arquitetura

API Express por módulos, frontend React/Vite e Prisma como contrato de persistência.

## Modelos

Documentar apenas modelos existentes ou criados pelos BKs.

## Fluxos

Separar vendas, compras, tesouraria, contabilidade, IA e subscrição simulada.

## Subscrição simulada

Funcionalidade pedagógica sem pagamento real.

## Limites

Não declarar certificação fiscal nem automatismos não implementados.
```

Editar `apps/api/package.json`, preservando os scripts existentes e acrescentando `test:mf8:technical-docs`:

```json
{
  "name": "@opsa/api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "API OPSA para os BKs MF0, seguindo o contrato apps/api definido na planificação.",
  "main": "src/server.js",
  "scripts": {
    "dev": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:validate": "prisma validate",
    "migration:precheck-mf0": "node scripts/precheck-mf0-migration.js",
    "syntax:check": "find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check",
    "test": "npm run test:unit && npm run test:contracts",
    "test:unit": "node --test tests/unit/*.test.js",
    "test:contracts": "node --test tests/contracts/*.test.js",
    "test:integration": "node --test tests/integration/*.test.js",
    "test:mf8:technical-docs": "node scripts/check-mf8-technical-docs.mjs"
  },
  "dependencies": {
    "@prisma/client": "^6.19.3",
    "bcrypt": "^5.1.1",
    "exceljs": "^4.4.0",
    "express": "^5.2.1",
    "pdfkit": "^0.15.2"
  },
  "devDependencies": {
    "prisma": "^6.19.3"
  }
}
```

5. Explicação do código.

O documento `ARQUITETURA-TECNICA-MINIMA.md` é o conteúdo técnico que a equipa consegue defender. O script `test:mf8:technical-docs` é o gate repetível: confirma que o documento existe, tem as secções essenciais de `RNF30` e não declara certificação fiscal. O `package.json` torna esse gate executável por qualquer colega sem memorizar o caminho do ficheiro.

6. Validação do passo.

Comando obrigatório: `cd apps/api && npm run test:mf8:technical-docs`. Negativos: mínimo `2`.

7. Cenário negativo/erro esperado.

Erro esperado: remover `## Subscrição simulada` do documento deve fazer o gate falhar. Isto prova que o comando valida conteúdo mínimo, não apenas existência de ficheiro.

### Passo 5 - Validar segurança, domínio e mensagens

1. Objetivo funcional do passo no contexto da app.

Validar segurança, domínio e mensagens.

2. Ficheiros envolvidos:
    - REVER: ficheiros editados neste BK
    - REVER: `docs/RF.md` e `docs/RNF.md`
    - LOCALIZAÇÃO: regras de validação e mensagens visíveis

3. Instruções do que fazer.

Revê validação backend, autorização, auditoria, textos PT-PT e separação de domínios. Em fluxos de IA, confirma explicação e fonte. Em fluxos financeiros, não confundas documento, pagamento, recebimento e lançamento.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A validação é uma revisão dirigida sobre o código criado nos passos anteriores.

5. Explicação do código.

Este passo evita que uma solução tecnicamente compilável introduza risco de segurança, privacidade ou domínio financeiro.

6. Validação do passo.

O guia deve conseguir explicar que dados entram, que dados saem, quem autoriza, que erro é devolvido e que evidence prova o fluxo.

7. Cenário negativo/erro esperado.

Se houver log com dados sensíveis, ação financeira automática da IA ou promessa de integração externa não documentada, o BK não pode fechar.

### Passo 6 - Registar evidence para PR ou defesa

1. Objetivo funcional do passo no contexto da app.

Registar evidence para PR ou defesa.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `docs/evidence/MF8/BK-MF8-09.md`
    - REVER: output dos comandos executados

3. Instruções do que fazer.

Regista comando, resultado esperado, resultado observado, negativo executado e decisão tomada em `docs/evidence/MF8/BK-MF8-09.md`. Não inventes outputs: escreve apenas o que foi executado ou deixa campo explícito para preencher no PR.

4. Código completo, correto e integrado com a app final.

```md
# Evidence MF8 / BK-MF8-09

- Projeto: OPSA
- BK: BK-MF8-09
- Tema: documentação técnica mínima
- RF/RNF: RNF30
- Data: YYYY-MM-DD
- Responsável: Pedro
- Apoio: Oleksii

## Artefactos verificados

- Documento técnico: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- Gate automático: `apps/api/scripts/check-mf8-technical-docs.mjs`
- Script de package: `test:mf8:technical-docs`

## Comandos executados

| Comando | Critério de sucesso | Evidência a anexar |
| --- | --- | --- |
| `cd apps/api && npm run test:mf8:technical-docs` | Exit code `0`; o documento contém módulos, modelos, fluxos, limites e não promete certificação fiscal ou pagamento real. | Anexar output real do terminal; se falhar, corrigir a secção indicada pelo gate antes de fechar o BK. |
| `cd apps/api && npm run syntax:check` | Exit code `0`; os scripts e ficheiros JavaScript/TypeScript continuam sintaticamente válidos. | Anexar output real do terminal; se falhar, registar o ficheiro e corrigir a sintaxe antes da defesa. |

## Negativos validados

- [ ] Remover `## Limites` falha o gate com erro sobre secção obrigatória.
- [ ] Escrever `certificação fiscal` falha o gate por promessa fora do MVP.

## Handoff para BK-MF8-10

- O documento técnico identifica módulos, modelos e fluxos que os insights devem respeitar.
- A subscrição da MF8 está documentada como simulada e sem pagamento real.
- As limitações contabilísticas estão explícitas antes de avançar para explicabilidade da IA.
```

5. Explicação do código.

A evidence de PR/defesa é separada do documento técnico para não misturar explicação da arquitetura com resultados de execução. O próximo BK usa a documentação técnica como contexto e usa a evidence para confirmar que `RNF30` foi validado.

6. Validação do passo.

A evidence identifica o BK, requisito, documento técnico, comando, resultado positivo, negativos e handoff.

7. Cenário negativo/erro esperado.

Se a evidence disser apenas 'funciona', está incompleta; falta prova objetiva.

### Passo 7 - Preparar handoff para o próximo BK

1. Objetivo funcional do passo no contexto da app.

Preparar handoff para o próximo BK.

2. Ficheiros envolvidos:
    - REVER: secção `Handoff` deste guia
    - REVER: guia do próximo BK
    - LOCALIZAÇÃO: contratos exportados e riscos abertos

3. Instruções do que fazer.

Resume o que ficou entregue, que ficheiros o próximo BK deve consumir e que riscos não foram fechados. O próximo BK declarado é `BK-MF8-10`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O handoff é a ponte entre entregas incrementais da app.

5. Explicação do código.

O OPSA é construído por BKs encadeados. Um bom handoff evita que o aluno seguinte reinvente contratos ou quebre decisões já tomadas.

6. Validação do passo.

A secção final confirma o próximo BK recomendado como `BK-MF8-10`, lista o documento técnico e lista a evidence de PR/defesa.

7. Cenário negativo/erro esperado.

Se o próximo BK depender de ficheiro que este BK prometeu mas não criou, volta ao passo onde esse contrato deveria ter sido entregue.

#### Critérios de aceite

- O guia preserva header, owner, prioridade, dependências, requisito e próximo BK definidos pela matriz e pelo backlog.
- Os caminhos publicados para alunos usam apenas `apps/api`, `apps/web`, `apps/api/prisma/schema.prisma` ou `docs/evidence`.
- O contrato principal de documentação técnica tem JSDoc, comentários didáticos, script de package e validação explícita.
- Existem positivos e pelo menos 2 negativos coerentes com `RNF30`.
- `ARQUITETURA-TECNICA-MINIMA.md` contém a documentação técnica; `BK-MF8-09.md` contém evidence de execução.
- A evidence mostra comando, resultado esperado, resultado observado e decisão tomada.
- Não há pagamentos reais, fornecedores externos não documentados, ações automáticas da IA ou dados de outra empresa.

#### Validação final

Executa os comandos relevantes para este BK:

```bash
cd apps/api
npm run test:mf8:technical-docs
npm run syntax:check
npm run test:contracts
```

Expected results:

- Código sem erro de sintaxe.
- Gate `test:mf8:technical-docs` verde.
- Testes de contrato existentes verdes, quando o ambiente tiver as dependências necessárias.
- Negativos controlados e documentados.
- Sem caminhos privados nos ficheiros entregues aos alunos.

#### Evidence para PR/defesa

- Comando `cd apps/api && npm run test:mf8:technical-docs` executado.
- Output do teste ou gate.
- Negativos executados.
- Ficheiros criados/editados, separando documento técnico e evidence.
- Screenshot ou payload API se existir UI.
- Decisão `CANONICO` ou `DERIVADO` mais importante do BK.

#### Handoff

- Próximo BK recomendado: `BK-MF8-10`
- Contrato entregue: documentação técnica ligada a `RNF30`.
- Ficheiro principal: `apps/api/scripts/check-mf8-technical-docs.mjs`.
- Documento técnico principal: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`.
- Evidence PR/defesa: `docs/evidence/MF8/BK-MF8-09.md`.
- Risco a vigiar: não alargar o BK para requisitos fora da MF8 nem prometer integrações externas não documentadas.

#### Changelog

- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
- `2026-07-02`: corrigidos o gate técnico `test:mf8:technical-docs`, a separação entre documento técnico e evidence, e os acentos PT-PT no handoff e nos negativos.
