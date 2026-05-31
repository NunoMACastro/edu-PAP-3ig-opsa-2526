import { toHttpError } from "../../../lib/httpErrors.js";
import {
    validateAccountPayload,
    validateImportPayload,
} from "./accountValidators.js";
import {
    createAccount,
    importAccountsFromRows,
    listAccounts,
} from "./accountService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildAccountController({ prisma }) {
    return {
        async list(req, res) {
            try {
                const accounts = await listAccounts(prisma, req.companyId);
                return res.status(200).json({ accounts });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async create(req, res) {
            try {
                const input = validateAccountPayload(req.body);
                const account = await createAccount(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ account });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async importRows(req, res) {
            try {
                const rows = validateImportPayload(req.body);
                const result = await importAccountsFromRows(
                    prisma,
                    req.companyId,
                    rows,
                );
                return res.status(201).json(result);
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}