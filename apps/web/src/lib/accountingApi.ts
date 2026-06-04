import { apiClient } from "./apiClient";

export type JournalEntryLine = {
  id: string;
  accountId: string;
  debitCents: number;
  creditCents: number;
  memo: string | null;
};

export type JournalEntry = {
  id: string;
  source: "SALE" | "PURCHASE" | "MANUAL";
  sourceId: string;
  entryDate: string;
  description: string;
  lines: JournalEntryLine[];
};

type JournalEntryResponse = {
  data: JournalEntry;
};

export async function postSaleDocument(
  saleDocumentId: string,
): Promise<JournalEntry> {
  const response = await apiClient.salePostings.create(saleDocumentId) as JournalEntryResponse;
  return response.data;
}