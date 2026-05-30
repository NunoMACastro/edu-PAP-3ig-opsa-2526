export function requireCompanyContext() {
    return function companyContextMiddleware(req, res, next) {
        req.companyId = null;
        req.role = req.role ?? null;
        return next();
    };
}