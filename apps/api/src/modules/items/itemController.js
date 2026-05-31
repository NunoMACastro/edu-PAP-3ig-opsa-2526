import { toHttpError } from "../../lib/httpErrors.js";
import { validateItemPayload } from "./itemValidators.js";
import {
    createItem,
    deactivateItem,
    listItems,
    updateItem,
} from "./itemService.js";

function sendError(res, error) {
    const httpError = toHttpError(error);
    return res
        .status(httpError.status)
        .json({ error: httpError.code, message: httpError.message });
}

export function buildItemController({ prisma }) {
    return {
        async list(req, res) {
            try {
                return res
                    .status(200)
                    .json({ items: await listItems(prisma, req.companyId) });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async create(req, res) {
            try {
                const input = validateItemPayload(req.body);
                const item = await createItem(prisma, req.companyId, input);
                return res.status(201).json({ item });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async update(req, res) {
            try {
                const input = validateItemPayload(req.body);
                const item = await updateItem(
                    prisma,
                    req.companyId,
                    req.params.id,
                    input,
                );
                return res.status(200).json({ item });
            } catch (error) {
                return sendError(res, error);
            }
        },

        async remove(req, res) {
            try {
                await deactivateItem(prisma, req.companyId, req.params.id);
                return res.status(204).send();
            } catch (error) {
                return sendError(res, error);
            }
        },
    };
}