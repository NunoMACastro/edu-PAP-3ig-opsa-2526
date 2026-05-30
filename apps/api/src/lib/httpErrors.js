export class HttpError extends Error {
    constructor(status, code, message, details = undefined) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export function httpError(status, code, message, details = undefined) {
    return new HttpError(status, code, message, details);
}

export function toHttpError(error) {
    if (error instanceof HttpError) return error;

    // Evita expor stack traces ou detalhes internos ao aluno/utilizador final.
    return new HttpError(500, "INTERNAL_ERROR", "Erro interno inesperado");
}