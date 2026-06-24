/**
 * @file Segurança de transporte HTTPS para a API OPSA.
 */

/**
 * Cria middleware que exige HTTPS em produção.
 *
 * @param {{ isProduction: boolean }} options - Opções do ambiente atual.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function enforceHttps({ isProduction }) {
    return (req, res, next) => {
        const forwardedProto = req.headers["x-forwarded-proto"];
        const requestIsHttps = req.secure || forwardedProto === "https";

        if (isProduction && !requestIsHttps) {
            // Em produção, dados financeiros e de sessão nunca devem circular por HTTP.
            res.status(403).json({
                code: "HTTPS_REQUIRED",
                message: "A comunicação com a OPSA deve usar HTTPS.",
            });
            return;
        }

        next();
    };
}

/**
 * Aplica HSTS apenas quando a resposta já está em canal seguro.
 *
 * @param {{ isProduction: boolean }} options - Opções do ambiente atual.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function applyStrictTransportSecurity({ isProduction }) {
    return (_req, res, next) => {
        if (isProduction) {
            res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }

        next();
    };
}