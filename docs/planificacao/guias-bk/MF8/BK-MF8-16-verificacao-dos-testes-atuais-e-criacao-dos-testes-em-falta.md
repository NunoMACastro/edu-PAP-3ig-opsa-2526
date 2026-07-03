# BK-MF8-16 - Verificação dos testes atuais e criação dos testes em falta.

## Header

- `doc_id`: `GUIA-BK-MF8-16`
- `bk_id`: `BK-MF8-16`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF37`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-17`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-16-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `last_updated`: `2026-07-03`

#### Objetivo

Neste BK vais rever os testes existentes do OPSA, identificar lacunas nos fluxos críticos e criar um gate que impeça a equipa de avançar para a execução final com cobertura insuficiente. O foco é cumprir `RNF37`: antes de correr a bateria final, a equipa tem de saber que testes existem, que camadas estão cobertas e que provas ainda faltam.

#### Importância

A MF8 é a fase de fecho da PAP. Nesta fase, um teste que passa só é útil se a equipa souber que o teste cobre um fluxo importante. Sem inventário, a aplicação pode parecer pronta e continuar sem prova para autenticação, permissões, faturação, compras, inventário, bancos, contabilidade, IA explicável, subscrições simuladas ou formatação PT-PT.

Este BK transforma a revisão de testes numa tarefa objetiva: cada fluxo crítico fica associado a camadas mínimas de prova, cada lacuna fica escrita em evidence e o próximo BK recebe uma bateria final clara para executar.

#### Scope-in

- Criar um script de inventário em `apps/api/scripts/check-mf8-test-inventory.mjs`.
- Criar um teste de contrato para o próprio inventário em `apps/api/tests/contracts/mf8-test-inventory-contracts.test.js`.
- Mapear fluxos críticos de `MF0` a `MF8` por camada: unitário API, contrato API, integração API, gate API, gate frontend, typecheck e build.
- Atualizar scripts de `apps/api/package.json` e `apps/web/package.json` para incluir gates de MF8.
- Criar evidence em `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Preparar o handoff para `BK-MF8-17`, que executa a bateria final.

#### Scope-out

- Criar cobertura perfeita para todo o código.
- Escrever testes para funcionalidades que ainda não existem.
- Trocar stack, framework de testes ou estrutura base da aplicação.
- Alterar requisitos, owner, prioridade, sprint, dependências ou RF/RNF do BK.
- Usar serviços externos para validação.
- Corrigir erros encontrados pela execução final; isso fica para `BK-MF8-18`.

#### Estado antes e depois

- Antes: a aplicação já tem vários testes e gates de macrofases anteriores, mas a equipa ainda não tem uma matriz única que mostre quais fluxos críticos estão cobertos por camada e quais ficam em falta antes do fecho.
- Depois: existe um script repetível que inventaria testes e scripts, gera uma matriz de lacunas, falha quando falta prova mínima e deixa comandos concretos para `BK-MF8-17`.

#### Pre-requisitos

- Ler `RNF37` em `docs/RNF.md`.
- Confirmar `BK-MF8-16` em `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
- Confirmar `BK-MF8-16` em `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Rever `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`.
- Rever `BK-MF8-15`, porque entrega gates de formatação PT-PT que devem entrar no inventário.
- Rever `BK-MF8-17`, porque vai consumir a bateria final definida aqui.
- Confirmar que todos os caminhos usados pelo aluno começam por `apps/api`, `apps/web` ou `docs/evidence`.
- Negativos: mínimo `2`.

#### Glossário

- Inventário de testes: lista organizada de testes e scripts existentes por camada.
- Fluxo crítico: parte da app que, se falhar, compromete segurança, dados financeiros, qualidade, defesa ou continuidade da PAP.
- Camada de prova: tipo de validação usada para demonstrar qualidade, como teste unitário, contrato, integração, gate estático, typecheck ou build.
- Lacuna: fluxo crítico sem prova mínima numa camada obrigatória.
- Gate: comando que passa ou falha de forma objetiva e pode ser executado no terminal.
- Evidence: registo escrito dos comandos, resultados, lacunas e decisões tomadas.
- Cenário negativo: caso em que o sistema deve falhar de forma controlada para provar que a validação existe.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF37` exige rever testes existentes e criar testes em falta para fluxos críticos.
- `CANONICO`: `BK-MF8-16` pertence à `MF8`, sprint `S12`, owner `Oleksii`, apoio `Andre`, prioridade `P1`, esforço `S`, sem dependências formais e com handoff para `BK-MF8-17`.
- `CANONICO`: os caminhos públicos dos alunos são `apps/api`, `apps/web` e `apps/api/prisma/schema.prisma`.
- `DERIVADO`: a matriz mínima deste BK cobre `MF0` a `MF8`, porque `RNF37` fala de fluxos críticos e a MF8 fecha a aplicação completa.

Um teste unitário valida uma unidade pequena de lógica, como um service ou validador. Ele evita que uma regra local seja quebrada sem aviso. No OPSA, unitários são úteis para validações de NIF, datas, valores, cálculo, estados e regras isoladas.

Um teste de contrato valida a fronteira pública de um módulo: pedido, resposta, erro esperado, estado HTTP ou forma de um output. Ele evita que o frontend e o backend deixem de falar a mesma língua. Em fecho de PAP, contratos são importantes porque ajudam a defender que as regras principais estão estáveis.

Um teste de integração valida a ligação entre várias partes, por exemplo service, repositório e persistência. Ele evita falsos positivos de testes isolados que passam, mas falham quando a aplicação junta os módulos.

Um gate estático valida estrutura, ficheiros, scripts, linguagem ou arquitetura sem arrancar a aplicação inteira. Ele é útil quando o objetivo é impedir esquecimento, como não ter script para MF8, não ter teste para uma macrofase ou não registar evidence.

Typecheck e build provam que o frontend compila com os tipos e empacotamento esperados. Mesmo que o BK seja de backend, a bateria final precisa de incluir frontend porque a aplicação OPSA é entregue como produto completo.

Evidence não é decoração. Evidence responde a quatro perguntas: que comando foi executado, qual era o resultado esperado, qual foi o resultado observado e que decisão a equipa tomou. Sem evidence, a defesa fica dependente de memória e não de prova.

Um cenário negativo é obrigatório porque demonstra que o teste falha quando a proteção desaparece. Neste BK, o negativo principal é remover uma prova crítica da fixture do teste e confirmar que o inventário reporta `LACUNA`.

#### Arquitetura do BK

- Requisito: `RNF37`.
- Domínio principal: qualidade, testes e evidence.
- Backend dos alunos: `apps/api`.
- Frontend dos alunos: `apps/web`.
- Script principal: `apps/api/scripts/check-mf8-test-inventory.mjs`.
- Teste do script: `apps/api/tests/contracts/mf8-test-inventory-contracts.test.js`.
- Evidence: `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Handoff: `BK-MF8-17` executa a bateria final definida por este BK.

A arquitetura mantém o inventário no backend porque a maior parte dos testes e scripts de qualidade já vive em `apps/api`. O script também lê `apps/web` para garantir que a revisão não esquece frontend, typecheck, build e gates visuais/funcionais criados nas MFs anteriores.

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/api/scripts/check-mf8-test-inventory.mjs`
- CRIAR: `apps/api/tests/contracts/mf8-test-inventory-contracts.test.js`
- CRIAR: `docs/evidence/MF8/TESTES-EM-FALTA.md`
- EDITAR: `apps/api/package.json`
- EDITAR: `apps/web/package.json`
- REVER: `apps/api/tests/unit`
- REVER: `apps/api/tests/contracts`
- REVER: `apps/api/tests/integration`
- REVER: `apps/api/scripts`
- REVER: `apps/web/scripts`
- REVER: `docs/evidence/MF8`

#### Tutorial técnico linear

### Passo 1 - Confirmar contrato canónico

1. Objetivo funcional do passo no contexto da app.

Confirmar que vais resolver o requisito certo antes de escrever scripts ou testes.

2. Ficheiros envolvidos:
    - REVER: `docs/RNF.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/backlogs/BACKLOG-MVP.md`
    - REVER: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
    - LOCALIZAÇÃO: linhas de `RNF37` e `BK-MF8-16`.

3. Instruções do que fazer.

Confirma que `RNF37` pede revisão de testes existentes e criação de testes em falta para fluxos críticos. Confirma também que o BK continua com owner `Oleksii`, apoio `Andre`, prioridade `P1`, esforço `S`, sprint `S12`, sem dependências formais e próximo BK `BK-MF8-17`.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. Este passo é documental: serve para impedir que a equipa resolva outro problema com o nome de `BK-MF8-16`.

5. Explicação do código.

Não há código porque a decisão importante é de contrato. O script criado nos passos seguintes só é correto se estiver alinhado com `RNF37` e com a matriz canónica.

6. Validação do passo.

O aluno consegue apontar a linha de `RNF37` e a linha de `BK-MF8-16` nos documentos canónicos antes de editar qualquer ficheiro.

7. Cenário negativo/erro esperado.

Se o header do guia não bater certo com matriz, backlog ou contrato de campos, para a execução e regista drift antes de criar testes.

### Passo 2 - Definir a matriz mínima de cobertura

1. Objetivo funcional do passo no contexto da app.

Transformar `RNF37` numa matriz concreta de fluxos críticos e camadas mínimas.

2. Ficheiros envolvidos:
    - REVER: `apps/api/tests`
    - REVER: `apps/api/scripts`
    - REVER: `apps/web/scripts`
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`
    - LOCALIZAÇÃO: inventário de testes e scripts existentes.

3. Instruções do que fazer.

Usa esta matriz como contrato mínimo. O script do passo 3 vai codificar estes fluxos e falhar quando faltar uma camada obrigatória.

| Fluxo crítico | Prioridade | Provas mínimas |
| --- | --- | --- |
| MF0 identidade, sessão, roles e multiempresa | P0 | unitário API e contrato API |
| MF1 vendas, compras, IVA, recebimentos e pagamentos | P0 | unitário API, contrato API e integração API |
| MF2 inventário, FIFO, contabilidade e reporting | P0 | unitário API, contrato API e integração API |
| MF3 bancos, reconciliação, SAF-T previsto e relatórios | P0 | unitário API, contrato API e integração API |
| MF4 IA explicável, recomendações e auditoria | P1 | unitário API e contrato API |
| MF5 interface, formulários, acessibilidade e desempenho | P1 | gate frontend e typecheck |
| MF6 segurança, performance e hardening | P0 | contrato API e gate API |
| MF7 compatibilidade, exportações, importações e modularidade | P1 | contrato API, gate API e gate frontend |
| MF8 subscrições simuladas, localização PT-PT e fecho | P1 | contrato API, gate API, gate frontend, typecheck e build |

4. Código completo, correto e integrado com a app final.

Sem código neste passo. A matriz é a decisão técnica que orienta o código do passo seguinte.

5. Explicação do código.

Não há código porque a equipa está a decidir critérios. A matriz evita inventários vagos: cada fluxo tem prioridade e camadas mínimas mensuráveis.

6. Validação do passo.

Antes de avançar, confirma que a matriz inclui `MF5` e `MF8`. Omissões nestas macrofases deixam o fecho incompleto, porque frontend, localização e subscrições simuladas também são parte da app final.

7. Cenário negativo/erro esperado.

Se a matriz só verificar nomes de pastas ou só contar ficheiros, o gate pode passar sem provar comportamento. Corrige a matriz para exigir camadas por fluxo.

### Passo 3 - Criar o inventário executável de testes

1. Objetivo funcional do passo no contexto da app.

Criar um script que lê testes e scripts, cruza essa informação com a matriz mínima e falha quando encontra lacunas.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/scripts/check-mf8-test-inventory.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro `apps/api/scripts/check-mf8-test-inventory.mjs` com o conteúdo completo abaixo. O script deve ser executado a partir de `apps/api`.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/scripts/check-mf8-test-inventory.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const CRITICAL_FLOWS = [
    {
        id: "MF0-identidade-sessao-roles-multiempresa",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract"],
        keywords: ["mf0", "auth", "session", "role", "membership"],
        description: "Identidade, sessão, papéis e isolamento por empresa ativa."
    },
    {
        id: "MF1-vendas-compras-iva-tesouraria",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract", "api-integration"],
        keywords: ["mf1", "sale", "purchase", "vat", "payment", "receipt"],
        description: "Documentos de venda, compra, IVA, recebimentos e pagamentos."
    },
    {
        id: "MF2-inventario-fifo-contabilidade-reporting",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract", "api-integration"],
        keywords: ["mf2", "inventory", "stock", "fifo", "ledger", "report"],
        description: "Inventário, FIFO, movimentos contabilísticos e reporting."
    },
    {
        id: "MF3-bancos-reconciliacao-exportacao-relatorios",
        priority: "P0",
        requiredLayers: ["api-unit", "api-contract", "api-integration"],
        keywords: ["mf3", "bank", "reconciliation", "saft", "cashflow", "report"],
        description: "Bancos, reconciliação, exportação prevista e relatórios."
    },
    {
        id: "MF4-ia-explicavel-auditoria",
        priority: "P1",
        requiredLayers: ["api-unit", "api-contract"],
        keywords: ["mf4", "ai", "insight", "source", "audit"],
        description: "IA explicável, recomendações com fonte e auditoria."
    },
    {
        id: "MF5-interface-formularios-acessibilidade-desempenho",
        priority: "P1",
        requiredLayers: ["web-script", "web-typecheck"],
        keywords: ["mf5", "form", "accessibility", "responsive", "performance", "feedback"],
        description: "Interface, formulários, acessibilidade, mensagens e desempenho."
    },
    {
        id: "MF6-seguranca-performance-hardening",
        priority: "P0",
        requiredLayers: ["api-contract", "api-script"],
        keywords: ["mf6", "security", "hardening", "https", "bcrypt", "cookie", "audit"],
        description: "Segurança, performance, sessão, hardening e auditoria."
    },
    {
        id: "MF7-compatibilidade-exportacoes-importacoes-modularidade",
        priority: "P1",
        requiredLayers: ["api-contract", "api-script", "web-script"],
        keywords: ["mf7", "export", "import", "compatibility", "module", "retention"],
        description: "Compatibilidade, exportações, importações, retenção e modularidade."
    },
    {
        id: "MF8-subscricoes-localizacao-fecho",
        priority: "P1",
        requiredLayers: ["api-contract", "api-script", "web-script", "web-typecheck", "web-build"],
        keywords: ["mf8", "subscription", "locale", "format", "billing", "inventory"],
        description: "Subscrições simuladas, localização PT-PT e preparação do fecho."
    }
];

export const REQUIRED_API_SCRIPTS = [
    "syntax:check",
    "test:unit",
    "test:contracts",
    "test:integration",
    "test:mf6",
    "test:mf7",
    "test:mf8"
];

export const REQUIRED_WEB_SCRIPTS = [
    "typecheck",
    "build",
    "test:mf1",
    "test:mf2",
    "test:mf3",
    "test:mf5:forms",
    "test:mf5:errors",
    "test:mf5:performance",
    "test:mf7",
    "test:mf8"
];

const FILE_FOLDERS = ["tests/unit", "tests/contracts", "tests/integration", "scripts"];
const WEB_FILE_FOLDERS = ["scripts"];

/**
 * Normaliza texto para comparação simples em nomes de ficheiros e scripts.
 *
 * @param {string} value - Texto original.
 * @returns {string} Texto em minúsculas e sem acentos.
 */
export function normalizeText(value) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

/**
 * Lê ficheiros de forma recursiva a partir de várias pastas.
 *
 * @param {string} rootDir - Diretório base.
 * @param {string[]} folders - Pastas relativas a visitar.
 * @returns {string[]} Caminhos relativos encontrados.
 */
export function collectFiles(rootDir, folders) {
    const collected = [];

    for (const folder of folders) {
        const absoluteFolder = join(rootDir, folder);
        if (!existsSync(absoluteFolder)) {
            continue;
        }

        const visit = (currentDir) => {
            for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
                const absoluteEntry = join(currentDir, entry.name);
                if (entry.isDirectory()) {
                    visit(absoluteEntry);
                    continue;
                }

                if (entry.isFile()) {
                    collected.push(relative(rootDir, absoluteEntry));
                }
            }
        };

        // A leitura recursiva evita que uma suite organizada por subpastas fique invisível.
        visit(absoluteFolder);
    }

    return collected.sort();
}

/**
 * Lê scripts de um package.json.
 *
 * @param {string} packagePath - Caminho absoluto para package.json.
 * @returns {Record<string, string>} Scripts declarados.
 */
export function readPackageScripts(packagePath) {
    if (!existsSync(packagePath)) {
        return {};
    }

    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    return packageJson.scripts ?? {};
}

/**
 * Classifica um ficheiro numa camada de prova.
 *
 * @param {string} source - Caminho relativo do ficheiro.
 * @param {"api" | "web"} area - Área de origem.
 * @returns {string} Camada de prova.
 */
export function classifyFile(source, area) {
    if (area === "web") {
        return "web-script";
    }

    if (source.startsWith("tests/unit/")) {
        return "api-unit";
    }

    if (source.startsWith("tests/contracts/")) {
        return "api-contract";
    }

    if (source.startsWith("tests/integration/")) {
        return "api-integration";
    }

    if (source.startsWith("scripts/")) {
        return "api-script";
    }

    return "unknown";
}

/**
 * Cria o inventário de ficheiros e scripts disponíveis.
 *
 * @param {object} options - Opções de leitura.
 * @param {string} [options.apiRoot=process.cwd()] - Raiz de apps/api.
 * @param {string} [options.webRoot=../web] - Raiz de apps/web.
 * @returns {object} Inventário bruto para avaliação.
 */
export function buildInventory(options = {}) {
    const apiRoot = options.apiRoot ? resolve(options.apiRoot) : process.cwd();
    const webRoot = options.webRoot ? resolve(options.webRoot) : resolve(apiRoot, "../web");

    const apiFiles = collectFiles(apiRoot, FILE_FOLDERS).map((source) => ({
        source,
        layer: classifyFile(source, "api"),
        searchable: normalizeText(source)
    }));

    const webFiles = collectFiles(webRoot, WEB_FILE_FOLDERS).map((source) => ({
        source,
        layer: classifyFile(source, "web"),
        searchable: normalizeText(source)
    }));

    const apiScripts = readPackageScripts(join(apiRoot, "package.json"));
    const webScripts = readPackageScripts(join(webRoot, "package.json"));

    return {
        apiRoot,
        webRoot,
        apiFiles,
        webFiles,
        apiScripts,
        webScripts
    };
}

/**
 * Verifica se uma camada tem prova para um fluxo crítico.
 *
 * @param {object} inventory - Inventário criado por buildInventory.
 * @param {object} flow - Fluxo crítico.
 * @param {string} layer - Camada exigida.
 * @returns {boolean} Verdadeiro quando existe prova para a camada.
 */
export function hasLayerEvidence(inventory, flow, layer) {
    if (layer === "web-typecheck") {
        return Object.hasOwn(inventory.webScripts, "typecheck");
    }

    if (layer === "web-build") {
        return Object.hasOwn(inventory.webScripts, "build");
    }

    const files = layer === "web-script" ? inventory.webFiles : inventory.apiFiles;
    const normalizedKeywords = flow.keywords.map(normalizeText);

    // A prova exige uma palavra do fluxo e a camada certa; contar ficheiros sem ligação ao fluxo seria frágil.
    return files.some((file) => {
        return file.layer === layer && normalizedKeywords.some((keyword) => file.searchable.includes(keyword));
    });
}

/**
 * Avalia o inventário contra a matriz mínima do BK.
 *
 * @param {object} inventory - Inventário criado por buildInventory.
 * @returns {object} Resultado com linhas da matriz, lacunas e scripts em falta.
 */
export function evaluateInventory(inventory) {
    const rows = CRITICAL_FLOWS.map((flow) => {
        const layerResults = flow.requiredLayers.map((layer) => ({
            layer,
            ok: hasLayerEvidence(inventory, flow, layer)
        }));

        return {
            ...flow,
            layerResults,
            ok: layerResults.every((result) => result.ok)
        };
    });

    const missingApiScripts = REQUIRED_API_SCRIPTS.filter((scriptName) => {
        return !Object.hasOwn(inventory.apiScripts, scriptName);
    });

    const missingWebScripts = REQUIRED_WEB_SCRIPTS.filter((scriptName) => {
        return !Object.hasOwn(inventory.webScripts, scriptName);
    });

    const gaps = rows.flatMap((row) => {
        return row.layerResults
            .filter((result) => !result.ok)
            .map((result) => ({
                flowId: row.id,
                priority: row.priority,
                layer: result.layer,
                reason: "LACUNA: falta prova mínima para este fluxo e camada."
            }));
    });

    return {
        rows,
        missingApiScripts,
        missingWebScripts,
        gaps,
        ok: gaps.length === 0 && missingApiScripts.length === 0 && missingWebScripts.length === 0
    };
}

/**
 * Formata o inventário como relatório Markdown para evidence.
 *
 * @param {object} inventory - Inventário criado por buildInventory.
 * @param {object} result - Resultado criado por evaluateInventory.
 * @returns {string} Relatório Markdown.
 */
export function formatMarkdownReport(inventory, result) {
    const lines = [
        "# Inventário de testes MF8",
        "",
        "## Matriz mínima de testes por prioridade",
        "",
        "| Fluxo | Prioridade | Camadas exigidas | Estado |",
        "| --- | --- | --- | --- |"
    ];

    for (const row of result.rows) {
        const layers = row.layerResults.map((layer) => {
            return `${layer.layer}: ${layer.ok ? "OK" : "LACUNA"}`;
        });
        lines.push(`| ${row.id} | ${row.priority} | ${layers.join("<br>")} | ${row.ok ? "OK" : "LACUNA"} |`);
    }

    lines.push(
        "",
        "## Evidência de testes por camada",
        "",
        `- API unitária: ${inventory.apiFiles.filter((file) => file.layer === "api-unit").length}`,
        `- API contratos: ${inventory.apiFiles.filter((file) => file.layer === "api-contract").length}`,
        `- API integração: ${inventory.apiFiles.filter((file) => file.layer === "api-integration").length}`,
        `- API scripts: ${inventory.apiFiles.filter((file) => file.layer === "api-script").length}`,
        `- Frontend scripts: ${inventory.webFiles.length}`,
        "",
        "## Scripts obrigatórios",
        "",
        `- API em falta: ${result.missingApiScripts.length > 0 ? result.missingApiScripts.join(", ") : "nenhum"}`,
        `- Web em falta: ${result.missingWebScripts.length > 0 ? result.missingWebScripts.join(", ") : "nenhum"}`,
        "",
        "## Lacunas",
        ""
    );

    if (result.gaps.length === 0) {
        lines.push("- Nenhuma lacuna crítica encontrada.");
    } else {
        for (const gap of result.gaps) {
            lines.push(`- ${gap.priority} | ${gap.flowId} | ${gap.layer} | ${gap.reason}`);
        }
    }

    lines.push("", `Resultado final: ${result.ok ? "OK" : "LACUNA"}`);
    return `${lines.join("\n")}\n`;
}

/**
 * Executa o inventário no terminal.
 *
 * @returns {void}
 */
export function runCli() {
    const inventory = buildInventory();
    const result = evaluateInventory(inventory);
    const report = formatMarkdownReport(inventory, result);

    console.log(report);

    if (!result.ok) {
        process.exitCode = 1;
    }
}

const executedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === executedPath) {
    runCli();
}
```

5. Explicação do código.

O script começa por declarar a matriz de fluxos críticos. Esta lista é explícita para que a equipa saiba o que está a defender: não basta descobrir ficheiros, é preciso provar camadas mínimas por macrofase.

`collectFiles` lê pastas de forma recursiva, porque os testes podem estar organizados por subpastas. `readPackageScripts` lê scripts de `package.json`, porque uma parte dos gates vive em comandos e não em ficheiros de teste. `classifyFile` transforma cada caminho numa camada de prova.

`buildInventory` junta API e web no mesmo inventário. Esta decisão evita que a revisão ignore frontend, typecheck ou build. `evaluateInventory` cruza inventário com matriz mínima e cria lacunas. `formatMarkdownReport` gera evidence legível para anexar ao PR ou defesa.

O script termina com `process.exitCode = 1` quando encontra `LACUNA`. Isto é importante: um gate que só imprime avisos pode ser ignorado; um gate que falha obriga a equipa a decidir se cria teste em falta, corrige script ou regista uma limitação objetiva.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --check scripts/check-mf8-test-inventory.mjs
node scripts/check-mf8-test-inventory.mjs
```

Expected result:

- O primeiro comando termina sem erro de sintaxe.
- O segundo comando imprime a matriz Markdown.
- Se existirem lacunas, o comando termina com exit code `1` e mostra `LACUNA`.

7. Cenário negativo/erro esperado.

Apaga temporariamente uma prova de fixture no teste do passo 4, ou remove o script `test:mf8` da fixture, e confirma que `evaluateInventory` passa a devolver `ok: false`.

### Passo 4 - Criar teste de contrato para o inventário

1. Objetivo funcional do passo no contexto da app.

Garantir que o inventário falha quando falta uma prova crítica e passa quando a fixture contém a cobertura mínima.

2. Ficheiros envolvidos:
    - CRIAR: `apps/api/tests/contracts/mf8-test-inventory-contracts.test.js`
    - REVER: `apps/api/scripts/check-mf8-test-inventory.mjs`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o teste abaixo. Ele usa uma fixture temporária para não depender do estado real da app durante o teste do script.

4. Código completo, correto e integrado com a app final.

```js
// apps/api/tests/contracts/mf8-test-inventory-contracts.test.js
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
    buildInventory,
    evaluateInventory,
    formatMarkdownReport
} from "../../scripts/check-mf8-test-inventory.mjs";

const API_SCRIPTS = {
    "syntax:check": "find src tests scripts -name '*.js' -print0 | xargs -0 -n 1 node --check",
    "test:unit": "node --test tests/unit/*.test.js",
    "test:contracts": "node --test tests/contracts/*.test.js",
    "test:integration": "node --test tests/integration/*.test.js",
    "test:mf6": "node scripts/check-mf6-hardening.mjs",
    "test:mf7": "node scripts/check-mf7-backend-modules.mjs",
    "test:mf8": "node scripts/check-mf8-test-inventory.mjs"
};

const WEB_SCRIPTS = {
    typecheck: "tsc --noEmit",
    build: "vite build",
    "test:mf1": "node scripts/check-mf1-pages.mjs",
    "test:mf2": "node scripts/check-mf2-pages.mjs",
    "test:mf3": "node scripts/check-mf3-pages.mjs",
    "test:mf5:forms": "node scripts/check-mf5-form-validation.mjs",
    "test:mf5:errors": "node scripts/check-mf5-error-messages.mjs",
    "test:mf5:performance": "node scripts/check-mf5-performance.mjs",
    "test:mf7": "node scripts/check-mf7-browser-compatibility.mjs",
    "test:mf8": "node scripts/check-mf8-formatters.mjs"
};

const REQUIRED_FILES = [
    "tests/unit/mf0-auth-session-membership.test.js",
    "tests/contracts/mf0-auth-role-contracts.test.js",
    "tests/unit/mf1-sale-purchase-vat.test.js",
    "tests/contracts/mf1-payment-receipt-contracts.test.js",
    "tests/integration/mf1-sale-purchase-flow.test.js",
    "tests/unit/mf2-inventory-stock-fifo.test.js",
    "tests/contracts/mf2-ledger-report-contracts.test.js",
    "tests/integration/mf2-inventory-report-flow.test.js",
    "tests/unit/mf3-bank-reconciliation.test.js",
    "tests/contracts/mf3-saft-cashflow-contracts.test.js",
    "tests/integration/mf3-bank-report-flow.test.js",
    "tests/unit/mf4-ai-insight-source.test.js",
    "tests/contracts/mf4-audit-insight-contracts.test.js",
    "tests/contracts/mf6-security-cookie-contracts.test.js",
    "scripts/check-mf6-hardening.mjs",
    "tests/contracts/mf7-export-import-contracts.test.js",
    "scripts/check-mf7-backend-modules.mjs",
    "tests/contracts/mf8-subscription-billing-contracts.test.js",
    "scripts/check-mf8-test-inventory.mjs"
];

const REQUIRED_WEB_FILES = [
    "scripts/check-mf5-form-validation.mjs",
    "scripts/check-mf5-error-messages.mjs",
    "scripts/check-mf5-performance.mjs",
    "scripts/check-mf7-browser-compatibility.mjs",
    "scripts/check-mf8-formatters.mjs"
];

/**
 * Garante que uma pasta existe antes de escrever ficheiros de fixture.
 *
 * @param {string} filePath - Ficheiro que será criado.
 * @returns {void}
 */
function ensureParentDir(filePath) {
    mkdirSync(dirname(filePath), { recursive: true });
}

/**
 * Cria uma app temporária mínima para testar o inventário sem depender do projeto real.
 *
 * @param {object} options - Opções da fixture.
 * @param {boolean} [options.includeMf8=true] - Define se as provas de MF8 são criadas.
 * @returns {{ root: string, apiRoot: string, webRoot: string, cleanup: () => void }} Fixture criada.
 */
function createFixture({ includeMf8 = true } = {}) {
    const root = mkdtempSync(join(tmpdir(), "opsa-mf8-inventory-"));
    const apiRoot = join(root, "apps/api");
    const webRoot = join(root, "apps/web");

    mkdirSync(apiRoot, { recursive: true });
    mkdirSync(webRoot, { recursive: true });

    const apiScripts = includeMf8 ? API_SCRIPTS : { ...API_SCRIPTS, "test:mf8": undefined };
    const webScripts = includeMf8 ? WEB_SCRIPTS : { ...WEB_SCRIPTS, "test:mf8": undefined };

    for (const [scriptName, command] of Object.entries(apiScripts)) {
        if (command === undefined) {
            delete apiScripts[scriptName];
        }
    }

    for (const [scriptName, command] of Object.entries(webScripts)) {
        if (command === undefined) {
            delete webScripts[scriptName];
        }
    }

    writeFileSync(join(apiRoot, "package.json"), JSON.stringify({ scripts: apiScripts }, null, 2));
    writeFileSync(join(webRoot, "package.json"), JSON.stringify({ scripts: webScripts }, null, 2));

    const apiFiles = includeMf8
        ? REQUIRED_FILES
        : REQUIRED_FILES.filter((filePath) => !filePath.includes("mf8"));

    const webFiles = includeMf8
        ? REQUIRED_WEB_FILES
        : REQUIRED_WEB_FILES.filter((filePath) => !filePath.includes("mf8"));

    for (const relativePath of apiFiles) {
        const filePath = join(apiRoot, relativePath);
        ensureParentDir(filePath);
        writeFileSync(filePath, "export const covered = true;\n");
    }

    for (const relativePath of webFiles) {
        const filePath = join(webRoot, relativePath);
        ensureParentDir(filePath);
        writeFileSync(filePath, "export const covered = true;\n");
    }

    return {
        root,
        apiRoot,
        webRoot,
        cleanup: () => rmSync(root, { recursive: true, force: true })
    };
}

test("aprova inventário com camadas mínimas para fluxos críticos", () => {
    const fixture = createFixture();

    try {
        const inventory = buildInventory({ apiRoot: fixture.apiRoot, webRoot: fixture.webRoot });
        const result = evaluateInventory(inventory);
        const report = formatMarkdownReport(inventory, result);

        // O positivo prova que a matriz aceita uma app com camadas mínimas completas.
        assert.equal(result.ok, true);
        assert.equal(result.gaps.length, 0);
        assert.match(report, /Matriz mínima de testes por prioridade/);
        assert.match(report, /Resultado final: OK/);
    } finally {
        fixture.cleanup();
    }
});

test("falha quando MF8 não tem gate e contrato suficientes", () => {
    const fixture = createFixture({ includeMf8: false });

    try {
        const inventory = buildInventory({ apiRoot: fixture.apiRoot, webRoot: fixture.webRoot });
        const result = evaluateInventory(inventory);
        const report = formatMarkdownReport(inventory, result);

        // O negativo confirma que o gate não passa por coincidência de pastas ou nomes genéricos.
        assert.equal(result.ok, false);
        assert.ok(result.gaps.some((gap) => gap.flowId === "MF8-subscricoes-localizacao-fecho"));
        assert.ok(result.missingApiScripts.includes("test:mf8"));
        assert.ok(result.missingWebScripts.includes("test:mf8"));
        assert.match(report, /LACUNA/);
    } finally {
        fixture.cleanup();
    }
});
```

5. Explicação do código.

O teste importa funções reais do script criado no passo 3. Isto evita testar uma cópia do comportamento. A fixture cria uma mini app dentro da pasta temporária do sistema, com `apps/api` e `apps/web`, para simular ficheiros e scripts sem alterar a app real.

O primeiro teste é o positivo: cria provas mínimas para todos os fluxos e confirma `result.ok === true`. O segundo teste é o negativo: remove provas de MF8 e confirma que aparecem lacunas, incluindo falta de `test:mf8` em API e web.

Os comentários dentro do teste explicam a intenção: provar matriz completa e provar falha controlada. Isto cumpre `RNF37`, porque o inventário não fica apenas escrito; fica protegido por teste de contrato.

6. Validação do passo.

Executa:

```bash
cd apps/api
node --test tests/contracts/mf8-test-inventory-contracts.test.js
```

Expected result:

- O teste positivo passa.
- O teste negativo passa porque encontra a falha esperada.
- Se o negativo deixar de encontrar `LACUNA`, o gate não está a proteger MF8.

7. Cenário negativo/erro esperado.

Remove a linha `"test:mf8"` da fixture web e confirma que `missingWebScripts` contém `test:mf8`. Se o teste continuar verde sem reportar lacuna, a avaliação está demasiado permissiva.

### Passo 5 - Ligar o inventário aos scripts do projeto

1. Objetivo funcional do passo no contexto da app.

Garantir que a equipa consegue executar o inventário por `npm run` e que o próximo BK recebe comandos estáveis.

2. Ficheiros envolvidos:
    - EDITAR: `apps/api/package.json`
    - EDITAR: `apps/web/package.json`
    - LOCALIZAÇÃO: bloco completo `scripts`.

3. Instruções do que fazer.

Em `apps/api/package.json`, substitui o bloco `scripts` por este bloco completo, preservando outros campos do ficheiro:

4. Código completo, correto e integrado com a app final.

```json
{
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
    "test:mf6:documents": "node scripts/check-mf6-document-performance.mjs",
    "test:mf6:concurrency": "node scripts/check-mf6-concurrency.mjs",
    "test:mf6:reconciliation": "node scripts/check-mf6-reconciliation-performance.mjs",
    "test:mf6:fifo": "node scripts/check-mf6-fifo-performance.mjs",
    "test:mf6:https": "node scripts/check-mf6-https.mjs",
    "test:mf6:bcrypt": "node scripts/check-mf6-bcrypt.mjs",
    "test:mf6:session-cookie": "node scripts/check-mf6-session-cookie.mjs",
    "test:mf6:hardening": "node scripts/check-mf6-hardening.mjs",
    "test:mf6:env": "node scripts/check-mf6-env.mjs",
    "test:mf6:audit": "node scripts/check-mf6-audit-gate.mjs",
    "test:mf6": "npm run test:mf6:documents && npm run test:mf6:concurrency && npm run test:mf6:reconciliation && npm run test:mf6:fifo && npm run test:mf6:https && npm run test:mf6:bcrypt && npm run test:mf6:session-cookie && npm run test:mf6:hardening && npm run test:mf6:env && npm run test:mf6:audit",
    "mf7:backup": "node scripts/run-daily-backup.mjs",
    "mf7:backup:verify": "node scripts/verify-backup-restore.mjs",
    "test:mf7:retention": "node --test tests/unit/retentionPolicy.test.js",
    "test:mf7:email": "node --test tests/contracts/mf7-email-contracts.test.js",
    "test:mf7:exports": "node --test tests/contracts/mf7-export-contracts.test.js",
    "test:mf7:imports": "node --test tests/contracts/mf7-import-contracts.test.js",
    "test:mf7:saft": "node --test tests/contracts/mf7-saft-contracts.test.js",
    "check:mf7:backend-modules": "node scripts/check-mf7-backend-modules.mjs",
    "test:mf7:critical-modules": "node --test tests/contracts/mf7-critical-modules.test.js",
    "test:mf7": "npm run test:mf7:retention && npm run test:mf7:email && npm run test:mf7:exports && npm run test:mf7:imports && npm run test:mf7:saft && npm run check:mf7:backend-modules && npm run test:mf7:critical-modules",
    "test:mf8:inventory": "node scripts/check-mf8-test-inventory.mjs",
    "test:mf8:inventory-contracts": "node --test tests/contracts/mf8-test-inventory-contracts.test.js",
    "test:mf8": "npm run test:mf8:inventory && npm run test:mf8:inventory-contracts",
    "test:final:prepare": "npm run syntax:check && npm run test:unit && npm run test:contracts && npm run test:integration && npm run test:mf6 && npm run test:mf7 && npm run test:mf8"
  }
}
```

Em `apps/web/package.json`, substitui o bloco `scripts` por este bloco completo, preservando outros campos do ficheiro:

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "test:mf1": "node scripts/check-mf1-pages.mjs",
    "test:mf2": "node scripts/check-mf2-pages.mjs",
    "test:mf3": "node scripts/check-mf3-pages.mjs",
    "test:mf5:feedback": "node scripts/check-mf5-feedback.mjs",
    "test:mf5:responsive": "node scripts/check-mf5-responsive.mjs",
    "test:mf5:a11y": "node scripts/check-mf5-accessibility.mjs",
    "test:mf5:forms": "node scripts/check-mf5-form-validation.mjs",
    "test:mf5:errors": "node scripts/check-mf5-error-messages.mjs",
    "test:mf5:performance": "node scripts/check-mf5-performance.mjs",
    "test:mf7:browser-compatibility": "node scripts/check-mf7-browser-compatibility.mjs",
    "check:mf7:frontend-modules": "node scripts/check-mf7-frontend-modules.mjs",
    "test:mf7": "npm run test:mf7:browser-compatibility && npm run check:mf7:frontend-modules && npm run typecheck && npm run build",
    "test:mf8:formatters": "node scripts/check-mf8-formatters.mjs",
    "test:mf8": "npm run test:mf8:formatters && npm run typecheck && npm run build",
    "test:final:prepare": "npm run test:mf1 && npm run test:mf2 && npm run test:mf3 && npm run test:mf5:feedback && npm run test:mf5:responsive && npm run test:mf5:a11y && npm run test:mf5:forms && npm run test:mf5:errors && npm run test:mf5:performance && npm run test:mf7 && npm run test:mf8"
  }
}
```

5. Explicação do código.

Os scripts de API preservam os comandos das macrofases anteriores e acrescentam três contratos novos: inventário MF8, teste de contrato do inventário e preparação final. A preparação final ainda não substitui `BK-MF8-17`; ela fornece o comando de base que esse BK vai executar e documentar.

Os scripts de web preservam os gates já existentes e acrescentam `test:mf8`, que assume o gate de formatadores PT-PT criado na sequência de MF8. `test:final:prepare` junta páginas, formulários, acessibilidade, erros, desempenho, compatibilidade, typecheck e build.

6. Validação do passo.

Executa:

```bash
cd apps/api
npm run test:mf8:inventory-contracts
npm run test:mf8

cd ../web
npm run test:mf8
```

Expected result:

- API executa o teste do inventário.
- API imprime lacunas se faltarem provas mínimas.
- Web executa gate de MF8, typecheck e build.

7. Cenário negativo/erro esperado.

Se `npm run test:mf8` na API falhar com `LACUNA`, não apagues a falha. Regista a lacuna em `docs/evidence/MF8/TESTES-EM-FALTA.md` e decide se vais criar o teste em falta neste BK ou deixar a correção para um BK posterior justificado.

### Passo 6 - Registar testes em falta e evidence

1. Objetivo funcional do passo no contexto da app.

Guardar uma prova legível da revisão de testes para PR, defesa e handoff.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF8/TESTES-EM-FALTA.md`
    - REVER: output de `npm run test:mf8:inventory`
    - LOCALIZAÇÃO: ficheiro completo.

3. Instruções do que fazer.

Cria o ficheiro abaixo e preenche os campos depois de executar os comandos. Não inventes outputs; copia apenas resultados observados.

4. Código completo, correto e integrado com a app final.

```md
# Testes em falta MF8

## Identificação

- BK: BK-MF8-16
- Requisito: RNF37
- Owner: Oleksii
- Apoio: Andre
- Data:
- Branch/PR:

## Comandos executados

| Comando | Resultado esperado | Resultado observado | Decisão |
| --- | --- | --- | --- |
| `cd apps/api && npm run test:mf8:inventory` | Matriz de cobertura com OK ou LACUNA por fluxo |  |  |
| `cd apps/api && npm run test:mf8:inventory-contracts` | Teste positivo e negativo do inventário passam |  |  |
| `cd apps/api && npm run test:final:prepare` | Bateria API preparada para BK-MF8-17 |  |  |
| `cd apps/web && npm run test:final:prepare` | Bateria web preparada para BK-MF8-17 |  |  |

## Matriz mínima de testes por prioridade

| Fluxo crítico | Prioridade | Camadas mínimas | Estado | Ação |
| --- | --- | --- | --- | --- |
| MF0 identidade, sessão, roles e multiempresa | P0 | unitário API, contrato API |  |  |
| MF1 vendas, compras, IVA, recebimentos e pagamentos | P0 | unitário API, contrato API, integração API |  |  |
| MF2 inventário, FIFO, contabilidade e reporting | P0 | unitário API, contrato API, integração API |  |  |
| MF3 bancos, reconciliação, exportação prevista e relatórios | P0 | unitário API, contrato API, integração API |  |  |
| MF4 IA explicável, recomendações e auditoria | P1 | unitário API, contrato API |  |  |
| MF5 interface, formulários, acessibilidade e desempenho | P1 | gate frontend, typecheck |  |  |
| MF6 segurança, performance e hardening | P0 | contrato API, gate API |  |  |
| MF7 compatibilidade, exportações, importações e modularidade | P1 | contrato API, gate API, gate frontend |  |  |
| MF8 subscrições simuladas, localização PT-PT e fecho | P1 | contrato API, gate API, gate frontend, typecheck, build |  |  |

## Evidência de testes por camada

| Camada | Ficheiros ou scripts encontrados | Lacunas | Decisão |
| --- | --- | --- | --- |
| API unitária |  |  |  |
| API contratos |  |  |  |
| API integração |  |  |  |
| API scripts |  |  |  |
| Web scripts |  |  |  |
| Web typecheck/build |  |  |  |

## Cenários negativos

| Cenário | Resultado esperado | Resultado observado | Decisão |
| --- | --- | --- | --- |
| Falta de prova MF8 no inventário | O script mostra LACUNA e exit code 1 |  |  |
| Falta de script `test:mf8` em API ou web | O teste de contrato acusa script em falta |  |  |

## Handoff para BK-MF8-17

- Comando API recomendado: `cd apps/api && npm run test:final:prepare`
- Comando web recomendado: `cd apps/web && npm run test:final:prepare`
- Lacunas que devem bloquear execução final:
- Lacunas aceites com justificação:
- Decisão final para avançar:
```

5. Explicação do código.

Este ficheiro não é código executável, mas é parte da entrega. Ele liga os comandos do BK a resultados observáveis. A tabela de matriz mínima mostra onde existe prova e onde falta prova; a tabela de evidence por camada ajuda a explicar a decisão na defesa.

Os cenários negativos ficam explícitos para que a equipa não confunda "não falhou" com "foi testado". O handoff final dá ao próximo BK os comandos que devem ser executados sem voltar a discutir a bateria.

6. Validação do passo.

Depois de correr o inventário, copia a matriz gerada pelo script para a secção certa ou resume as linhas com `OK` e `LACUNA`. O ficheiro deve indicar sempre comando, resultado esperado, resultado observado e decisão.

7. Cenário negativo/erro esperado.

Se a evidence ficar com campos vazios no PR final, o BK não está fechado. Campos vazios só são aceitáveis enquanto a equipa ainda está a executar a tarefa localmente.

### Passo 7 - Preparar handoff para execução final

1. Objetivo funcional do passo no contexto da app.

Entregar ao `BK-MF8-17` uma bateria final concreta, com lacunas conhecidas e sem comandos ambíguos.

2. Ficheiros envolvidos:
    - REVER: `docs/evidence/MF8/TESTES-EM-FALTA.md`
    - REVER: `apps/api/package.json`
    - REVER: `apps/web/package.json`
    - REVER: guia `BK-MF8-17`
    - LOCALIZAÇÃO: secções de handoff e validação final.

3. Instruções do que fazer.

Antes de fechar este BK, confirma que a evidence identifica todas as lacunas. Se uma lacuna for P0 e tiver teste possível dentro do escopo deste BK, cria o teste em falta antes de avançar. Se a lacuna exigir implementação fora deste BK, regista a decisão e passa a informação ao BK seguinte.

4. Código completo, correto e integrado com a app final.

Sem código neste passo. O handoff é documental e operacional.

5. Explicação do código.

Não há código porque o objetivo é preparar a próxima entrega. `BK-MF8-17` não deve descobrir a bateria final por tentativa e erro; deve consumir os scripts e a evidence preparados aqui.

6. Validação do passo.

Confirma que a secção `Handoff` deste guia lista:

- `BK-MF8-17` como próximo BK.
- `apps/api/scripts/check-mf8-test-inventory.mjs` como script principal.
- `apps/api/tests/contracts/mf8-test-inventory-contracts.test.js` como teste do gate.
- `docs/evidence/MF8/TESTES-EM-FALTA.md` como evidence.
- `npm run test:final:prepare` em API e web como bateria base.

7. Cenário negativo/erro esperado.

Se o próximo BK precisar de inventar comandos ou decidir sozinho que lacunas bloqueiam a execução final, volta ao passo 6 e completa a evidence.

#### Critérios de aceite

- O guia preserva `BK-MF8-16`, `RNF37`, owner, apoio, prioridade, esforço, sprint, dependências e próximo BK definidos pela matriz.
- O script `apps/api/scripts/check-mf8-test-inventory.mjs` existe, tem JSDoc, comentários didáticos, leitura recursiva, matriz de fluxos críticos e output Markdown.
- O inventário cobre `MF0` a `MF8`, incluindo `MF5` e `MF8`.
- O teste `apps/api/tests/contracts/mf8-test-inventory-contracts.test.js` inclui caso positivo e caso negativo.
- Os scripts `test:mf8` e `test:final:prepare` ficam definidos em API e web.
- `docs/evidence/MF8/TESTES-EM-FALTA.md` regista comandos, resultados esperados, resultados observados, lacunas e decisão.
- O handoff para `BK-MF8-17` inclui bateria final concreta.
- Não há caminhos privados, linguagem interna, funções por implementar, blocos incompletos, casts inseguros ou tipos genéricos que escondam o contrato.
- O texto pedagógico está em português de Portugal com acentuação correta.

#### Validação final

Executa:

```bash
cd apps/api
node --check scripts/check-mf8-test-inventory.mjs
node --test tests/contracts/mf8-test-inventory-contracts.test.js
npm run test:mf8
npm run test:final:prepare
```

Depois executa:

```bash
cd apps/web
npm run test:mf8
npm run test:final:prepare
```

Expected results:

- O script de inventário imprime `# Inventário de testes MF8`.
- O relatório contém `Matriz mínima de testes por prioridade`.
- O teste de contrato passa no positivo e no negativo.
- Se houver lacunas reais, `test:mf8:inventory` falha com `LACUNA` e a equipa regista a decisão em evidence.
- API e web têm comandos finais preparados para `BK-MF8-17`.

#### Evidence para PR/defesa

- Output de `cd apps/api && npm run test:mf8:inventory`.
- Output de `cd apps/api && npm run test:mf8:inventory-contracts`.
- Output de `cd apps/api && npm run test:final:prepare`.
- Output de `cd apps/web && npm run test:final:prepare`.
- Ficheiro `docs/evidence/MF8/TESTES-EM-FALTA.md` preenchido.
- Lista de lacunas P0/P1 resolvidas ou justificadas.
- Decisão final para avançar para `BK-MF8-17`.

#### Handoff

- Próximo BK recomendado: `BK-MF8-17`.
- Contrato entregue: revisão objetiva de testes e criação do gate de inventário ligado a `RNF37`.
- Script principal: `apps/api/scripts/check-mf8-test-inventory.mjs`.
- Teste principal: `apps/api/tests/contracts/mf8-test-inventory-contracts.test.js`.
- Evidence principal: `docs/evidence/MF8/TESTES-EM-FALTA.md`.
- Bateria API para o próximo BK: `cd apps/api && npm run test:final:prepare`.
- Bateria web para o próximo BK: `cd apps/web && npm run test:final:prepare`.
- Risco a vigiar: uma lacuna marcada como `LACUNA` não pode ser tratada como sucesso; deve ser corrigida, justificada ou bloqueada antes da decisão final.

#### Changelog

- `2026-07-03`: guia corrigido para cumprir `RNF37` com inventário executável, teste de contrato, scripts de MF8, evidence estruturada e handoff concreto para `BK-MF8-17`.
- `2026-06-30`: guia reescrito para o contrato tutorial MF8, com caminhos públicos, passos técnicos lineares, código completo, validação e evidence.
