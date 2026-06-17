// apps/api/src/modules/ai/aiQuestionRoutes.js
import { Router } from "express";
import { toHttpError } from "../../lib/httpErrors.js";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requirePermission, requireRole } from "../permissions/permissionMiddleware.js";
import { Permission } from "../permissions/permissions.js";
import { validateAiQuestionBody } from "./aiQuestionValidators.js";
import { answerAiQuestion } from "./aiQuestionService.js";

function sendError(res, error) {
    const response = toHttpError(error);
    // O mesmo formato de erro é usado em todos os routers MF4 para a UI
    // conseguir apresentar mensagens consistentes.
    return res.status(response.status).json({ error: response.code, message: response.message });
}

/** Constrói router de perguntas IA RF41. */
export function buildAiQuestionRoutes({ prisma }) {
    const router = Router();
    const guards = [
        // Perguntas em linguagem natural continuam a ser leitura de dados reais,
        // por isso passam pelas mesmas regras de autenticação e autorização.
        requireAuth(prisma),
        requireCompanyContext(prisma),
        requirePermission(Permission.REPORTS_READ),
        requireRole("ADMIN", "GESTOR", "CONTABILISTA"),
    ];

    router.post("/questions", guards, async (req, res) => {
        try {
            const body = validateAiQuestionBody(req.body);
            // A rota envia ao service uma pergunta já validada e o contexto seguro
            // resolvido pelos middlewares.
            const answer = await answerAiQuestion(prisma, { companyId: req.companyId, userId: req.user.id, question: body.question });
            return res.status(201).json({ answer });
        } catch (error) {
            return sendError(res, error);
        }
    });

    return router;
}