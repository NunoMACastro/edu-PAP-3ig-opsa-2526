/**
 * @file Controller de permissões do utilizador atual.
 */

import { getPermissionsForRole } from "./permissions.js";

/**
 * Constrói handlers de permissões.
 *
 * @returns {{ me: Function }} Handlers Express.
 */
export function buildPermissionsController() {
    return {
        /**
         * Devolve role e permissões no contexto da empresa ativa.
         *
         * @param {import("express").Request} req - Pedido Express.
         * @param {import("express").Response} res - Resposta Express.
         * @returns {import("express").Response} Resposta HTTP.
         */
        me(req, res) {
            return res.status(200).json({
                userId: req.user.id,
                companyId: req.companyId ?? null,
                role: req.role ?? null,
                permissions: getPermissionsForRole(req.role),
            });
        },
    };
}
