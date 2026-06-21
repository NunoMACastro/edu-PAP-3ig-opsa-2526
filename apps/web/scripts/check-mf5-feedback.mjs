/**
 * @file Smoke textual da MF5 para confirmar feedback imediato nas ações principais.
 */

import { readFile } from "node:fs/promises";

const files = {
    app: new URL("../src/App.tsx", import.meta.url),
    hook: new URL("../src/ui/useActionFeedback.ts", import.meta.url),
    mf3: new URL("../src/pages/mf3Pages.tsx", import.meta.url),
    mf4: new URL("../src/pages/mf4Pages.tsx", import.meta.url),
    packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Lê um ficheiro de texto do projeto web.
 *
 * @param url - URL local do ficheiro.
 * @returns Conteúdo textual do ficheiro.
 */
async function readText(url) {
    return readFile(url, "utf8");
}

/**
 * Falha o smoke quando um contrato textual obrigatório não existe.
 *
 * @param source - Conteúdo onde procurar.
 * @param expected - Texto obrigatório.
 * @param label - Descrição curta do contrato.
 */
function assertIncludes(source, expected, label) {
    if (!source.includes(expected)) {
        throw new Error(`MF5 feedback em falta: ${label}`);
    }
}

/**
 * Executa todas as verificações textuais da MF5.
 */
async function main() {
    const [app, hook, mf3, mf4, packageJson] = await Promise.all([
        readText(files.app),
        readText(files.hook),
        readText(files.mf3),
        readText(files.mf4),
        readText(files.packageJson),
    ]);

    // Hook MF5
    assertIncludes(hook, "useActionFeedback", "hook exportado");
    assertIncludes(hook, "phase: \"running\"", "estado de execução");
    assertIncludes(hook, "phase: \"success\"", "estado de sucesso");
    assertIncludes(hook, "phase: \"error\"", "estado de erro");

    // App principal
    assertIncludes(app, "useActionFeedback", "App consome o hook");
    assertIncludes(app, "StatusMessage", "App apresenta mensagens comuns");
    assertIncludes(app, "A validar e enviar dados", "feedback de submissão");
    assertIncludes(app, "A atualizar dados", "feedback de listagem");

    // MF3
    assertIncludes(mf3, "useActionFeedback", "MF3 cobre importações");
    assertIncludes(mf3, "A validar e importar", "mensagem de importação");
    assertIncludes(mf3, "StatusMessage", "MF3 usa mensagem transversal");

    // MF4
    assertIncludes(mf4, "StatusMessage", "MF4 usa mensagem transversal");

    // Package.json script
    assertIncludes(
        packageJson,
        "test:mf5:feedback",
        "script disponível no package.json",
    );

    console.log("MF5 feedback smoke OK");
}

await main();