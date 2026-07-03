/**
 * @file Seguranca de transporte HTTPS para a API OPSA.
 */

/**
 * Confirma se o pedido chegou por HTTPS direto ou por proxy confiavel.
 *
 * @param {import("express").Request} req - Pedido Express.
 * @returns {boolean} `true` quando o canal observado e seguro.
 */
export function isSecureRequest(req) {
    const forwardedProto = req.headers["x-forwarded-proto"];
    return req.secure || forwardedProto === "https";
}

/**
 * Cria middleware que exige HTTPS em producao.
 *
 * @param {{ isProduction: boolean }} options - Opcoes do ambiente atual.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function enforceHttps({ isProduction }) {
    return (req, res, next) => {
        if (isProduction && !isSecureRequest(req)) {
            return res.status(403).json({
                error: "HTTPS_REQUIRED",
                message: "A comunicacao com a OPSA deve usar HTTPS.",
            });
        }

        return next();
    };
}

/**
 * Aplica HSTS em producao depois de validado o canal seguro.
 *
 * @param {{ isProduction: boolean }} options - Opcoes do ambiente atual.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function applyStrictTransportSecurity({ isProduction }) {
    return (_req, res, next) => {
        if (isProduction) {
            res.set(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            );
        }

        return next();
    };
}
