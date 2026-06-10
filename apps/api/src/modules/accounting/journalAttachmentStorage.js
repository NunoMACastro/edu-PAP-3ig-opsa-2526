// apps/api/src/modules/accounting/journalAttachmentStorage.js
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { httpError } from "../../lib/httpErrors.js";

const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);

function safeFileName(fileName) {
  return String(fileName ?? "anexo").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function writePrivateJournalAttachment({ companyId, journalEntryId, fileName, mimeType, buffer }) {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw httpError(415, "ATTACHMENT_MIME_NOT_ALLOWED", "Tipo de ficheiro não permitido.");
  }
  if (!Buffer.isBuffer(buffer) || buffer.byteLength === 0) {
    throw httpError(400, "ATTACHMENT_EMPTY", "O ficheiro está vazio.");
  }

  const storageKey = path.join(companyId, journalEntryId, `${randomUUID()}-${safeFileName(fileName)}`);
  const targetPath = path.join(process.cwd(), "var", "private-uploads", storageKey);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, buffer, { flag: "wx" });

  return { storageKey, sizeBytes: buffer.byteLength };
}