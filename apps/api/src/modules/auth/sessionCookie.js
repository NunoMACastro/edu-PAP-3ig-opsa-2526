const COOKIE_NAME = "sid";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export function setSessionCookie(res, sessionId, isProduction) {
    res.cookie(COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_MS,
    });
}

export function clearSessionCookie(res, isProduction) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
    });
}

export function readSessionCookie(req) {
    const rawCookie = req.headers.cookie ?? "";
    const cookies = rawCookie.split(";").map((part) => part.trim());
    const sessionCookie = cookies.find((part) =>
        part.startsWith(`${COOKIE_NAME}=`),
    );

    if (!sessionCookie) return null;
    return decodeURIComponent(sessionCookie.slice(COOKIE_NAME.length + 1));
}