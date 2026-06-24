/**
 * @file Helper do cookie HttpOnly da sessão OPSA.
 */

const COOKIE_NAME = "sid";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

/**
 * Cria opções consistentes para escrever ou limpar a sessão.
 *
 * @param {boolean} isProduction - Indica se o cookie deve exigir HTTPS.
 * @returns {import("express").CookieOptions} Opções do cookie de sessão.
 */
function buildSessionCookieOptions(isProduction) {
    return {
        httpOnly: true,
        // Em desenvolvimento local podes não ter HTTPS; em produção o cookie exige canal seguro.
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_MS,
    };
}

/**
 * Escreve o cookie de sessão com atributos seguros.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {string} sessionId - Identificador opaco da sessão server-side.
 * @param {boolean} isProduction - Ambiente de produção exige `Secure`.
 * @returns {void}
 */
export function setSessionCookie(res, sessionId, isProduction) {
    // O browser guarda apenas o identificador; dados de empresa e permissões ficam no backend.
    res.cookie(COOKIE_NAME, sessionId, buildSessionCookieOptions(isProduction));
}

/**
 * Remove o cookie de sessão do browser.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {boolean} isProduction - Ambiente de produção exige `Secure`.
 * @returns {void}
 */
export function clearSessionCookie(res, isProduction) {
    const { maxAge: _maxAge, ...options } = buildSessionCookieOptions(isProduction);
    res.clearCookie(COOKIE_NAME, options);
}

/**
 * Lê manualmente o cookie `sid` do header HTTP.
 *
 * @param {import("express").Request} req - Pedido Express.
 * @returns {string | null} Valor do cookie quando existe; caso contrário `null`.
 */
export function readSessionCookie(req) {
    const rawCookie = req.headers.cookie ?? "";
    // A leitura mantém o contrato criado no BK-MF0-01 para controllers e middlewares de auth.
    const cookies = rawCookie.split(";").map((part) => part.trim());
    const sessionCookie = cookies.find((part) =>
        part.startsWith(`${COOKIE_NAME}=`),
    );

    if (!sessionCookie) return null;
    return decodeURIComponent(sessionCookie.slice(COOKIE_NAME.length + 1));
}