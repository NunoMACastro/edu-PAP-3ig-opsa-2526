import { httpError } from "../../../lib/httpErrors.js";

const ACCOUNT_CODE_PATTERN = /^\d{1,8}$/;

function validateCode(code) {
    if (typeof code !== "string" || !ACCOUNT_CODE_PATTERN.test(code.trim())) {
        throw httpError(
            400,
            "INVALID_ACCOUNT_CODE",
            "Codigo SNC deve ser numerico e ter entre 1 e 8 digitos",
        );
    }
    return code.trim();
}

function validateName(name) {
    if (typeof name !== "string" || name.trim().length < 3) {
        throw httpError(
            400,
            "INVALID_ACCOUNT_NAME",
            "Nome da conta deve ter pelo menos 3 caracteres",
        );
    }
    return name.trim();
}

function accountLevelFromCode(code) {
    return code.length;
}

export function validateAccountPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "INVALID_BODY", "O corpo do pedido deve ser JSON");
    }

    const code = validateCode(body.code);
    const parentCode = body.parentCode ? validateCode(body.parentCode) : null;

    return {
        code,
        name: validateName(body.name),
        parentCode,
        level: accountLevelFromCode(code),
        isActive: body.isActive !== false,
    };
}

export function validateImportPayload(body) {
    if (!body || typeof body !== "object" || !Array.isArray(body.rows)) {
        throw httpError(
            400,
            "INVALID_IMPORT",
            "Importacao deve receber rows normalizadas",
        );
    }

    return body.rows.map(validateAccountPayload);
}