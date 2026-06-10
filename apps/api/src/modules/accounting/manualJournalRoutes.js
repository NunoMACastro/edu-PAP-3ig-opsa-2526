// apps/api/src/modules/accounting/manualJournalRoutes.js
import express, { Router } from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireCompanyContext } from "../companies/companyContext.js";
import { requireRole } from "../permissions/permissionMiddleware.js";
import { toHttpError } from "../../lib/httpErrors.js";
import { writePrivateJournalAttachment } from "./journalAttachmentStorage.js";
import { createManualJournal, getManualJournal, updateManualJournal } from "./manualJournalService.js";

export function createManualJournalRouter(prisma) {
  const router = Router();
  const guards = [requireAuth(prisma), requireCompanyContext(prisma), requireRole("ADMIN", "GESTOR", "CONTABILISTA")];
  const sendError = (res, error) => {
    const response = toHttpError(error);
    return res.status(response.status).json(response.body);
  };

  router.post("/", guards, async (req, res) => {
    try {
      const entry = await createManualJournal(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        input: req.body,
      });

      return res.status(201).json({ entry });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get("/:id", guards, async (req, res) => {
    try {
      const entry = await getManualJournal(prisma, {
        companyId: req.companyId,
        id: req.params.id,
      });

      return res.json({ entry });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.patch("/:id", guards, async (req, res) => {
    try {
      const entry = await updateManualJournal(prisma, {
        companyId: req.companyId,
        userId: req.user.id,
        id: req.params.id,
        input: req.body,
      });

      return res.json({ entry });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post(
    "/:id/attachments",
    guards,
    express.raw({ limit: "5mb", type: ["application/pdf", "image/png", "image/jpeg"] }),
    async (req, res) => {
      try {
        const entry = await prisma.journalEntry.findFirst({
          where: { id: req.params.id, companyId: req.companyId, source: "MANUAL" },
          select: { id: true },
        });

        if (!entry) return res.status(404).json({ code: "JOURNAL_ENTRY_NOT_FOUND", message: "Lançamento não encontrado." });

        const mimeType = String(req.header("content-type") ?? "").split(";")[0].trim();
        const stored = await writePrivateJournalAttachment({
          companyId: req.companyId,
          journalEntryId: entry.id,
          fileName: req.header("x-file-name"),
          mimeType,
          buffer: req.body,
        });

        const attachment = await prisma.journalAttachment.create({
          data: {
            companyId: req.companyId,
            journalEntryId: entry.id,
            uploadedById: req.user.id,
            fileName: String(req.header("x-file-name") ?? "anexo"),
            mimeType,
            sizeBytes: stored.sizeBytes,
            storageKey: stored.storageKey,
          },
        });

        return res.status(201).json({ attachment });
      } catch (error) {
        return sendError(res, error);
      }
    }
  );

  return router;
}