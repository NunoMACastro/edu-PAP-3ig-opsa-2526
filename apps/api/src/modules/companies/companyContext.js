import { toHttpError } from "../../lib/httpErrors.js";
import { getCompanyContext } from "./companyService.js";

export function requireCompanyContext(prisma) {
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