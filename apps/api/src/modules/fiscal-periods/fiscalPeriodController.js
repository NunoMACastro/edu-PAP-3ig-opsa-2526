import { toHttpError } from "../../lib/httpErrors.js";
import { validateFiscalPeriodPayload } from "./fiscalPeriodValidators.js";
import {
    closeFiscalPeriod,
    createFiscalPeriod,
    listFiscalPeriods,
} from "./fiscalPeriodService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildFiscalPeriodController({ prisma }) {
    return {
        async list(req, res) {
            try {
                const periods = await listFiscalPeriods(prisma, req.companyId);
                return res.status(200).json({ periods });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async create(req, res) {
            try {
                const input = validateFiscalPeriodPayload(req.body);
                const period = await createFiscalPeriod(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ period });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async close(req, res) {
            try {
                const period = await closeFiscalPeriod(prisma, {
                    companyId: req.companyId,
                    periodId: req.params.id,
                    actorUserId: req.user.id,
                });
                return res.status(200).json({ period });
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}