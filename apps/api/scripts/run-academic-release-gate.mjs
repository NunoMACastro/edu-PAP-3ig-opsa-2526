/**
 * @file Gate académico integral e estrito da aplicação OPSA.
 *
 * O gate coordena API, migrations, serviços remotos de teste, frontend,
 * browser, audits e validadores documentais. Não aceita skips nem converte a
 * ausência de infraestrutura em sucesso. Nenhuma variável de ambiente é
 * impressa; apenas os nomes das configurações ausentes são reportados.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertCanonicalReportReady } from "./academic-report-gate.mjs";

const apiRoot = resolve(fileURLToPath(new URL("../", import.meta.url)));
const realDevRoot = resolve(apiRoot, "..");
const webRoot = resolve(realDevRoot, "web");
const repositoryRoot = resolve(realDevRoot, "..");
const canonicalReportPath = resolve(
    repositoryRoot,
    "docs/planificacao/auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md",
);

const REQUIRED_ENVIRONMENT = Object.freeze([
    "APP_BASE_URL",
    "TEST_DATABASE_URL",
    "RESTORE_DATABASE_URL",
    "REDIS_URL",
    "REDIS_KEY_PREFIX",
    "RATE_LIMIT_HMAC_KEY",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "EMAIL_FROM",
    "EMAIL_OUTBOX_ENCRYPTION_KEY",
    "DEMO_EMAIL_INBOX_ACCESS_KEY",
    "S3_ENDPOINT",
    "S3_REGION",
    "S3_BUCKET",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_FORCE_PATH_STYLE",
    "S3_SSE",
    "BACKUP_S3_BUCKET",
    "BACKUP_RETENTION_DAYS",
    "TRUST_PROXY_HOPS",
    "SAFT_EXPORT_ENABLED",
    "SAFT_VALIDATION_MODE",
    "OPSA_API_BASE_URL",
    "OPSA_SESSION_COOKIES_JSON",
]);

const FORBIDDEN_SKIP_PATTERNS = Object.freeze([
    /#\s*SKIP\b/i,
    /\bskipped\s+[1-9]\d*\b/i,
    /\bskip(?:ped)?\s*[:=]\s*[1-9]\d*\b/i,
    /\bBLOQUEADO_AMBIENTE\b/i,
    /\bOPSA_SKIP_[A-Z0-9_]+\s*=\s*(?:1|true|yes)\b/i,
]);

/**
 * Confirma a toolchain académica fechada pelo plano de correção.
 *
 * @returns {void}
 * @throws {Error} Quando Node ou npm não pertencem às versões suportadas.
 */
function assertToolchain() {
    const [major, minor] = process.versions.node.split(".").map(Number);
    if (major !== 24 || minor < 17) {
        throw new Error(
            `Node ${process.versions.node} fora do contrato >=24.17 <25.`,
        );
    }

    const npmResult = spawnSync("npm", ["--version"], {
        cwd: apiRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    if (npmResult.status !== 0) {
        throw new Error("Não foi possível determinar a versão do npm.");
    }
    const npmMajor = Number(npmResult.stdout.trim().split(".")[0]);
    if (npmMajor !== 11) {
        throw new Error(`npm ${npmResult.stdout.trim()} fora do contrato 11.x.`);
    }
}

/**
 * Interrompe antes dos testes se faltar uma dependência remota obrigatória.
 *
 * @returns {void}
 * @throws {Error} Com nomes, mas nunca valores, das variáveis ausentes.
 */
function assertEnvironment() {
    const missing = REQUIRED_ENVIRONMENT.filter(
        (name) => typeof process.env[name] !== "string" || process.env[name].trim() === "",
    );
    if (missing.length > 0) {
        throw new Error(
            `Gate bloqueado pelo ambiente. Variáveis ausentes: ${missing.join(", ")}.`,
        );
    }
    if (process.env.SAFT_EXPORT_ENABLED !== "true") {
        throw new Error(
            "Gate académico bloqueado: SAFT_EXPORT_ENABLED tem de ser true.",
        );
    }
    const saftMode = process.env.SAFT_VALIDATION_MODE.trim().toLowerCase();
    if (!["academic", "external"].includes(saftMode)) {
        throw new Error(
            "SAFT_VALIDATION_MODE deve ser academic ou external.",
        );
    }
    if (
        saftMode === "external" &&
        (typeof process.env.SAFT_XSD_PATH !== "string" ||
            process.env.SAFT_XSD_PATH.trim() === "")
    ) {
        throw new Error(
            "SAFT_XSD_PATH é obrigatória quando SAFT_VALIDATION_MODE=external.",
        );
    }
}

/**
 * Executa um comando do gate, retransmite output e rejeita skips positivos.
 *
 * @param {{ label: string, command: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv }} step - Passo isolado.
 * @returns {void}
 * @throws {Error} Quando o comando falha ou declara testes ignorados.
 */
function runStep(step) {
    console.info(`[academic-gate] START ${step.label}`);
    const result = spawnSync(step.command, step.args, {
        cwd: step.cwd,
        env: step.env ?? process.env,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);

    if (result.error) {
        throw new Error(`${step.label} não arrancou: ${result.error.message}`);
    }
    if (result.status !== 0) {
        throw new Error(`${step.label} terminou com exit code ${result.status}.`);
    }
    const forbidden = FORBIDDEN_SKIP_PATTERNS.find((pattern) => pattern.test(output));
    if (forbidden) {
        throw new Error(`${step.label} declarou skip ou blocker ambiental.`);
    }
    console.info(`[academic-gate] PASS ${step.label}`);
}

/**
 * Executa o gate completo em ordem fail-fast.
 *
 * @returns {void}
 */
export function runAcademicReleaseGate() {
    assertToolchain();
    assertCanonicalReportReady(readFileSync(canonicalReportPath, "utf8"));
    assertEnvironment();

    const testEnvironment = {
        ...process.env,
        NODE_ENV: "test",
        EMAIL_PROVIDER: "simulated",
        OPSA_SKIP_PERSISTENCE_TESTS: "false",
    };
    const databaseTestEnvironment = {
        ...testEnvironment,
        DATABASE_URL: process.env.TEST_DATABASE_URL,
    };
    const integrationTestEnvironment = { ...testEnvironment };
    delete integrationTestEnvironment.DATABASE_URL;

    const npmStep = (label, cwd, script, extraArgs = [], env = testEnvironment) => ({
        label,
        command: "npm",
        args: ["run", script, ...extraArgs],
        cwd,
        env,
    });
    const steps = [
        npmStep(
            "Base PostgreSQL descartável vazia",
            apiRoot,
            "migration:assert-empty-test-db",
            [],
            databaseTestEnvironment,
        ),
        {
            label: "Migrations desde zero",
            command: "npx",
            args: ["prisma", "migrate", "deploy"],
            cwd: apiRoot,
            env: databaseTestEnvironment,
        },
        npmStep("API syntax", apiRoot, "syntax:check"),
        npmStep("API unit", apiRoot, "test:unit"),
        npmStep("API contracts", apiRoot, "test:contracts"),
        npmStep(
            "API PostgreSQL integration",
            apiRoot,
            "test:integration",
            [],
            integrationTestEnvironment,
        ),
        npmStep(
            "Seed PostgreSQL integration",
            apiRoot,
            "test:seed:integration",
            [],
            integrationTestEnvironment,
        ),
        npmStep("Seed demonstrativa", apiRoot, "db:seed:demo", [], databaseTestEnvironment),
        npmStep("Verificação da seed", apiRoot, "db:seed:verify", [], databaseTestEnvironment),
        npmStep(
            "Materialização de notificações",
            apiRoot,
            "worker:notifications:drain",
            [],
            databaseTestEnvironment,
        ),
        npmStep("SMTP outbox drain", apiRoot, "worker:email:drain", [], databaseTestEnvironment),
        npmStep("API MF6", apiRoot, "test:mf6"),
        npmStep("API MF7", apiRoot, "test:mf7"),
        npmStep(
            "Backup e restauro PostgreSQL/S3",
            apiRoot,
            "mf7:backup:roundtrip",
            [],
            databaseTestEnvironment,
        ),
        npmStep("API MF8", apiRoot, "test:mf8"),
        {
            label: "API npm audit",
            command: "npm",
            args: ["audit", "--omit=dev", "--audit-level=moderate"],
            cwd: apiRoot,
            env: testEnvironment,
        },
        npmStep("Frontend unit/integration", webRoot, "test:unit"),
        npmStep("Frontend typecheck", webRoot, "typecheck"),
        npmStep("Frontend production build", webRoot, "build"),
        npmStep("Browser E2E e axe", webRoot, "test:e2e"),
        npmStep(
            "Browser E2E seeded com API/PostgreSQL",
            webRoot,
            "test:e2e:seeded",
            [],
            databaseTestEnvironment,
        ),
        {
            label: "Frontend npm audit",
            command: "npm",
            args: ["audit", "--omit=dev", "--audit-level=moderate"],
            cwd: webRoot,
            env: testEnvironment,
        },
        npmStep("MF8 defect report", apiRoot, "mf8:defect-report"),
        {
            label: "Validação documental global",
            command: "bash",
            args: ["scripts/validate-planificacao.sh"],
            cwd: repositoryRoot,
            env: testEnvironment,
        },
    ];

    for (const step of steps) runStep(step);
    console.info("[academic-gate] PASS integral sem skips");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    try {
        runAcademicReleaseGate();
    } catch (error) {
        console.error(`[academic-gate] FAIL ${error.message}`);
        process.exitCode = 1;
    }
}
