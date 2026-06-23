/**
 * @file Helper do cookie HttpOnly da sessão OPSA.
 * 
 * O cookie transporta apenas o identificador da sessão server-side. O browser
 * não consegue lê-lo via JavaScript por causa de `httpOnly`, reduzindo o risco
 * de roubo direto da sessão em caso de XSS.
 */

const COOKIE_NAME = "sid";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

/**
 * Escreve o cookie de sessão na resposta HTTP.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {string} sessionId - Identificador opaco da sessão server-side.
 * @param {boolean} isProduction - Indica se o atributo `secure` deve estar ativo.
 * @returns {void}
 */
export function setSessionCookie(res, sessionId, isProduction) {
    res.cookie(COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_MS,
    });
}

/**
 * Remove o cookie de sessão do browser.
 *
 * @param {import("express").Response} res - Resposta Express.
 * @param {boolean} isProduction - Indica se o atributo `secure` deve estar ativo.
 * @returns {void}
 */
export function clearSessionCookie(res, isProduction) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
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
    return decodeURIComponent(sessionCookie.slice(COOKIE_NAME.length + 1));
}
