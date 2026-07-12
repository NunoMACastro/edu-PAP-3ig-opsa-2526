/**
 * @file Helpers seguros para invocar ferramentas PostgreSQL sem credenciais no argv.
 */

/**
 * Valida uma URL PostgreSQL e separa os argumentos públicos da password.
 *
 * @param {string} value - URL PostgreSQL recebida exclusivamente por variável de ambiente.
 * @returns {{ args: string[], env: NodeJS.ProcessEnv, databaseName: string, host: string }} Ligação pronta para `spawnSync`.
 */
export function postgresCliConnection(value) {
    let url;
    try {
        url = new URL(value);
    } catch {
        throw new Error("URL PostgreSQL inválida");
    }

    if (!["postgres:", "postgresql:"].includes(url.protocol)) {
        throw new Error("A ligação deve usar postgres:// ou postgresql://");
    }

    const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
    const username = decodeURIComponent(url.username);
    if (!url.hostname || !databaseName || !username) {
        throw new Error("Ligação PostgreSQL sem host, utilizador ou base de dados");
    }

    const args = [
        "--host",
        url.hostname,
        "--port",
        url.port || "5432",
        "--username",
        username,
        "--dbname",
        databaseName,
    ];
    const env = {
        ...process.env,
        PGPASSWORD: decodeURIComponent(url.password),
        PGSSLMODE: url.searchParams.get("sslmode") ?? process.env.PGSSLMODE,
    };

    return { args, env, databaseName, host: url.hostname };
}

/**
 * Impede que o verificador destrua uma base que não esteja identificada como descartável.
 *
 * @param {string} databaseName - Nome extraído de `RESTORE_DATABASE_URL`.
 * @returns {void}
 */
export function assertDisposableRestoreDatabase(databaseName) {
    if (!/(restore|test|audit|ci)/i.test(databaseName)) {
        throw new Error(
            "RESTORE_DATABASE_URL deve apontar para uma base descartável com restore, test, audit ou ci no nome",
        );
    }
}
