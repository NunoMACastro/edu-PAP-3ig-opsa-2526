/**
 * @file Middleware de contexto multiempresa.
 */

import { toHttpError } from "../../lib/httpErrors.js";
import { getCompanyContext } from "./companyService.js";

/**
 * Exige empresa ativa e injeta `companyId`, `role` e `company` no request.
 *
 * @param {import("@prisma/client").PrismaClient} prisma - Cliente Prisma.
 * @returns {import("express").RequestHandler} Middleware Express.
 */
export function requireCompanyContext(prisma) {
    /**
     * Resolve empresa ativa depois da autenticação.
     *
     * @param {import("express").Request} req - Pedido Express.
     * @param {import("express").Response} res - Resposta Express.
     * @param {import("express").NextFunction} next - Próximo middleware.
     * @returns {Promise<void | import("express").Response>} Resultado do middleware.
     */
    return async function companyContextMiddleware(req, res, next) {
        try {
            const context = await getCompanyContext(prisma, {
                userId: req.user.id,
                companyId: req.session.activeCompanyId,
            });

            // Todos os BKs de dados empresariais devem usar estes valores.
            req.companyId = context.companyId;
            req.role = context.role;
            req.company = {
                id: context.companyId,
                name: context.companyName,
                nif: context.nif,
            };

            return next();
        } catch (error) {
            const httpError = toHttpError(error);
            return res
                .status(httpError.status)
                .json({ error: httpError.code, message: httpError.message });
        }
    };
}
