import { getPermissionsForRole } from "./permissions.js";

export function buildPermissionsController() {
    return {
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