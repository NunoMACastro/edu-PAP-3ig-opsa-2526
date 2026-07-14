/**
 * @file Helper do cookie HttpOnly da sessão OPSA.
 *
 * O cookie transporta apenas o identificador da sessão server-side. O browser
 * não consegue lê-lo via JavaScript por causa de `httpOnly`, reduzindo o risco
 * de roubo direto da sessão em caso de XSS.
 */

export const COOKIE_NAME = "sid";
export const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

/**
 * Constroi opcoes comuns de cookie para escrita e limpeza.
 *
 * @param {boolean} isProduction - Indica se o atributo `secure` deve estar ativo.
 * @returns {{ httpOnly: boolean, secure: boolean, sameSite: "lax", path: string, maxAge?: number }} Opcoes Express.
 */
export function buildSessionCookieOptions(isProduction) {
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_MS,
    };
}

/**
 * Escreve o cookie de sessão na resposta HTTP.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {string} sessionId - Identificador opaco da sessão server-side.
 * @param {boolean} isProduction - Indica se o atributo `secure` deve estar ativo.
 * @returns {void}
 */
export function setSessionCookie(res, sessionId, isProduction) {
    res.cookie(COOKIE_NAME, sessionId, buildSessionCookieOptions(isProduction));
}

/**
 * Remove o cookie de sessão do browser.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {boolean} isProduction - Indica se o atributo `secure` deve estar ativo.
 * @returns {void}
 */
export function clearSessionCookie(res, isProduction) {
    const { maxAge: _maxAge, ...clearOptions } =
        buildSessionCookieOptions(isProduction);
    res.clearCookie(COOKIE_NAME, {
        ...clearOptions,
    });
}

/**
 * Lê manualmente o cookie `sid` do header HTTP.
 *
 * @param {import("express").Request} req - Pedido Express.
 * @returns {string | null} Valor do cookie quando existe; caso contrário `null`.
 */
export function readSessionCookie(req) {
    const rawCookie = req.headers.cookie ?? "";
    const cookies = rawCookie.split(";").map((part) => part.trim());
    const sessionCookie = cookies.find((part) =>
        part.startsWith(`${COOKIE_NAME}=`),
    );

    if (!sessionCookie) return null;
    try {
        return decodeURIComponent(sessionCookie.slice(COOKIE_NAME.length + 1));
    } catch {
        // Um cookie malformado é equivalente a não existir sessão. Esta fronteira
        // nunca deve transformar input HTTP não fiável num erro interno 500.
        return null;
    }
}
