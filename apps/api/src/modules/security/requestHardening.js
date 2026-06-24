/**
 * @file Hardening de pedidos HTTP para a API OPSA.
 */

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Exige origem esperada em pedidos que alteram dados.
 *
 * @param {{ appBaseUrl: string, isProduction: boolean }} options - Configuração do ambiente.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function requireTrustedOrigin({ appBaseUrl, isProduction }) {
    const trustedOrigin = new URL(appBaseUrl).origin;

    return (req, res, next) => {
        if (!MUTATING_METHODS.has(req.method)) {
            next();
            return;
        }

        const origin = req.headers.origin;
        if (isProduction && origin !== trustedOrigin) {
            // Pedidos mutáveis com cookie de sessão só são aceites a partir da origem da app.
            res.status(403).json({
                code: "UNTRUSTED_ORIGIN",
                message: "A origem do pedido não é autorizada.",
            });
            return;
        }

        next();
    };
}

/**
 * Escapa texto antes de ser usado em HTML gerado pela API.
 *
 * @param {string} value - Texto controlado pelo utilizador.
 * @returns {string} Texto com caracteres perigosos escapados.
 */
export function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}