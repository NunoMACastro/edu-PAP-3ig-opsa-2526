import { toHttpError } from "../../lib/httpErrors.js";
import { validateCustomerPayload } from "./customerValidators.js";
import {
    createCustomer,
    deactivateCustomer,
    listCustomers,
    updateCustomer,
} from "./customerService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildCustomerController({ prisma }) {
    return {
        async list(req, res) {
            try {
                return res
                    .status(200)
                    .json({
                        customers: await listCustomers(prisma, req.companyId),
                    });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async create(req, res) {
            try {
                const input = validateCustomerPayload(req.body);
                const customer = await createCustomer(
                    prisma,
                    req.companyId,
                    input,
                );
                return res.status(201).json({ customer });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async update(req, res) {
            try {
                const input = validateCustomerPayload(req.body);
                const customer = await updateCustomer(
                    prisma,
                    req.companyId,
                    req.params.id,
                    input,
                );
                return res.status(200).json({ customer });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async remove(req, res) {
            try {
                await deactivateCustomer(prisma, req.companyId, req.params.id);
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}