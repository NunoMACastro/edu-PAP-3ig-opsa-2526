/**
 * @file Helpers HTTP partilhados pelos BKs da MF0.
 * 
 * Este ficheiro centraliza o formato de erro usado pelos controllers. O objetivo
 * pedagógico é separar erros previstos do domínio, como validações e conflitos,
 * de falhas internas que nunca devem expor stack traces ao utilizador.
 */

/**
 * Erro operacional convertido diretamente em resposta HTTP.
 */
export class HttpError extends Error {
    /**
     * Cria uma exceção de domínio com status HTTP, código estável e mensagem clara.
     *
     * @param {number} status - Código HTTP que o controller deve devolver.
     * @param {string} code - Código funcional estável para frontend/testes/evidence.
     * @param {string} message - Mensagem legível em português de Portugal.
     * @param {unknown} [details] - Detalhes controlados para validação, quando existirem.
     * @param details - Detalhes adicionais registados para auditoria ou erro.
     * @returns function Object() { [native code] }
     */
    constructor(status, code, message, details = undefined) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

/**
 * Constrói um erro HTTP operacional.
 *
 * @param {number} status - Código HTTP pretendido.
 * @param {string} code - Código funcional da falha.
 * @param {string} message - Mensagem segura para devolver ao cliente.
 * @param {unknown} [details] - Detalhes opcionais e seguros.
 * @param details - Detalhes adicionais registados para auditoria ou erro.
 * @returns {HttpError} Erro operacional pronto a lançar.
 */
export function httpError(status, code, message, details = undefined) {
    return new HttpError(status, code, message, details);
}

/**
 * Converte erros Prisma comuns para respostas previsíveis.
 *
 * @param {unknown} error - Erro original lançado pelo Prisma.
 * @returns {HttpError | null} Erro HTTP quando a falha é conhecida; caso contrário `null`.
 */
function mapKnownPrismaError(error) {
    if (!error || typeof error !== "object" || !("code" in error)) return null;

    if (error.code === "P2002") {
        return httpError(
            409,
            "UNIQUE_CONSTRAINT_CONFLICT",
            "Já existe um registo com estes dados",
        );
    }

    if (error.code === "P2025") {
        return httpError(404, "RECORD_NOT_FOUND", "Registo não encontrado");
    }

    return null;
}

/**
 * Converte erros de dominio conhecidos para respostas seguras.
 *
 * @param {unknown} error - Erro original lançado por services de dominio.
 * @returns {HttpError | null} Erro HTTP quando a falha é conhecida; caso contrário `null`.
 */
function mapKnownDomainError(error) {
    if (!error || typeof error !== "object" || error.code !== "RETENTION_HOLD_ACTIVE") {
        return null;
    }

    return httpError(
        409,
        "RETENTION_HOLD_ACTIVE",
        error.message,
        {
            entity: error.entity,
            entityId: error.entityId,
            retainUntil: error.retainUntil?.toISOString?.(),
        },
    );
}

/**
 * Normaliza qualquer erro para o formato HTTP seguro usado pela API.
 *
 * @param {unknown} error - Erro capturado num controller ou middleware.
 * @returns {HttpError} Erro HTTP seguro para resposta JSON.
 */
export function toHttpError(error) {
    if (error instanceof HttpError) return error;

    const domainError = mapKnownDomainError(error);
    if (domainError) return domainError;

    const prismaError = mapKnownPrismaError(error);
    if (prismaError) return prismaError;

    // Erros desconhecidos não devem revelar stack traces, queries ou secrets.
    return new HttpError(500, "INTERNAL_ERROR", "Erro interno inesperado");
}
