import { toHttpError } from "../../lib/httpErrors.js";
import { validateSwitchCompanyPayload } from "./companyValidators.js";
import {
    getCompanyContext,
    listUserCompanies,
    switchActiveCompany,
} from "./companyService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildCompanyController({ prisma }) {
    return {
        async list(req, res) {
            try {
                const companies = await listUserCompanies(prisma, req.user.id);
                return res.status(200).json({ companies });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async switchCompany(req, res) {
            try {
                const input = validateSwitchCompanyPayload(req.body);
                const context = await switchActiveCompany(prisma, {
                    sessionId: req.session.id,
                    userId: req.user.id,
                    companyId: input.companyId,
                });
                return res.status(200).json({ context });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async context(req, res) {
            try {
                const context = await getCompanyContext(prisma, {
                    userId: req.user.id,
                    companyId: req.session.activeCompanyId,
                });
                return res.status(200).json({ context });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}