// apps/web/src/pages/ManualJournalPage.tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createManualJournal,
  getManualJournal,
  updateManualJournal,
  uploadJournalAttachment,
} from "../lib/manualJournalsApi";
import type { ManualJournalLine } from "../lib/manualJournalsApi";

const emptyLine: ManualJournalLine = { accountId: "", debitCents: 0, creditCents: 0, memo: "" };

type ManualJournalPageProps = {
  initialEntryId?: string;
};

export function ManualJournalPage({ initialEntryId }: ManualJournalPageProps) {
  const [entryDate, setEntryDate] = useState("");
  const [description, setDescription] = useState("");
  const [entryId, setEntryId] = useState<string | null>(initialEntryId ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [lines, setLines] = useState<ManualJournalLine[]>([{ ...emptyLine }, { ...emptyLine }]);
  const [loading, setLoading] = useState(Boolean(initialEntryId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialEntryId) return;

    let active = true;
    setLoading(true);
    setError(null);

    getManualJournal(initialEntryId)
      .then(({ entry }) => {
        if (!active) return;

        setEntryId(entry.id);
        setEntryDate(entry.entryDate.slice(0, 10));
        setDescription(entry.description);
        setLines(entry.lines.length > 0 ? entry.lines : [{ ...emptyLine }, { ...emptyLine }]);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar o lançamento.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialEntryId]);

  const totals = useMemo(
    () => ({
      debitCents: lines.reduce((sum, line) => sum + Number(line.debitCents), 0),
      creditCents: lines.reduce((sum, line) => sum + Number(line.creditCents), 0),
    }),
    [lines]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const payload = { entryDate, description, lines };
      const result = entryId
        ? await updateManualJournal(entryId, payload)
        : await createManualJournal(payload);

      setEntryId(result.entry.id);
      setMessage(entryId ? "Lançamento editado." : "Lançamento criado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível guardar o lançamento.");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload() {
    if (!entryId || !file) return;
    setError(null);
    setMessage(null);
    setUploading(true);

    try {
      await uploadJournalAttachment(entryId, file);
      setMessage("Anexo enviado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o anexo.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <p>A carregar lançamento...</p>;
  }

  return (
    <section>
      <h1>Lançamento manual</h1>

      <form onSubmit={onSubmit}>
        <input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição" />

        <table>
          <thead>
            <tr>
              <th>Conta</th>
              <th>Débito</th>
              <th>Crédito</th>
              <th>Memo</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index}>
                <td>
                  <input
                    value={line.accountId}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, accountId: event.target.value } : item
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={line.debitCents}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, debitCents: Number(event.target.value) } : item
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={line.creditCents}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, creditCents: Number(event.target.value) } : item
                        )
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    value={line.memo}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, memo: event.target.value } : item
                        )
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>Débito: {totals.debitCents} cêntimos</p>
        <p>Crédito: {totals.creditCents} cêntimos</p>
        <button type="button" onClick={() => setLines((current) => [...current, { ...emptyLine }])}>
          Adicionar linha
        </button>
        <button type="submit" disabled={saving}>
          {entryId ? "Guardar alterações" : "Criar lançamento"}
        </button>
      </form>

      <input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <button type="button" disabled={!entryId || !file || uploading} onClick={onUpload}>
        {uploading ? "A enviar..." : "Enviar anexo"}
      </button>

      {error ? <p role="alert">{error}</p> : null}
      {message ? <p>{message}</p> : null}
    </section>
  );
}