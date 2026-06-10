// apps/web/src/lib/manualJournalsApi.ts
export type ManualJournalLine = {
  accountId: string;
  debitCents: number;
  creditCents: number;
  memo?: string;
};

export type ManualJournalPayload = {
  entryDate: string;
  description: string;
  lines: ManualJournalLine[];
};

export type ManualJournal = {
  id: string;
  entryDate: string;
  description: string;
  lines: ManualJournalLine[];
  attachments?: Array<{ id: string; fileName: string; mimeType: string; sizeBytes: number }>;
};

async function readJsonError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function createManualJournal(data: ManualJournalPayload) {
  const response = await fetch("/api/accounting/manual-journals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response, "Não foi possível criar o lançamento."));
  }

  return response.json() as Promise<{ entry: ManualJournal }>;
}

export async function getManualJournal(entryId: string) {
  const response = await fetch(`/api/accounting/manual-journals/${entryId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response, "Não foi possível carregar o lançamento."));
  }

  return response.json() as Promise<{ entry: ManualJournal }>;
}

export async function updateManualJournal(entryId: string, data: ManualJournalPayload) {
  const response = await fetch(`/api/accounting/manual-journals/${entryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response, "Não foi possível editar o lançamento."));
  }

  return response.json() as Promise<{ entry: ManualJournal }>;
}

export async function uploadJournalAttachment(entryId: string, file: File) {
  const response = await fetch(`/api/accounting/manual-journals/${entryId}/attachments`, {
    method: "POST",
    headers: { "content-type": file.type, "x-file-name": file.name },
    credentials: "include",
    body: await file.arrayBuffer(),
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response, "Não foi possível anexar o ficheiro."));
  }

  return response.json();
}