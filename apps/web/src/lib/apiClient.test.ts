/**
 * @file Testes do transporte HTTP central, incluindo expiração e timeout.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createApiClient,
  subscribeToUnauthorized,
} from "./apiClient";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("apiClient", () => {
  it("propaga 401 ao estado central da sessão", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ error: "UNAUTHORIZED", message: "Sessão expirada" }, 401),
      ),
    );
    const onUnauthorized = vi.fn();
    const unsubscribe = subscribeToUnauthorized(onUnauthorized);

    await expect(createApiClient().request("GET", "/private"))
      .rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    expect(onUnauthorized).toHaveBeenCalledOnce();

    unsubscribe();
  });

  it("cancela pedidos que ultrapassam o timeout configurado", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
      ),
    );

    const pending = createApiClient().request("GET", "/slow", { timeoutMs: 25 });
    const assertion = expect(pending).rejects.toEqual(
      expect.objectContaining({
        status: 408,
        code: "REQUEST_TIMEOUT",
      }),
    );

    await vi.advanceTimersByTimeAsync(25);
    await assertion;
  });

  it("envia anexos e importações como multipart sem forçar Content-Type JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }, 201));
    vi.stubGlobal("fetch", fetchMock);
    const client = createApiClient({ baseUrl: "http://localhost/api" });
    const file = new File(["conteudo"], "dados.csv", { type: "text/csv" });

    await client.manualJournals.addAttachment("journal-1", file);
    await client.treasury.importStatement("treasury-1", file);
    await client.imports.businessData({ type: "CUSTOMERS", file });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init.body).toBeInstanceOf(FormData);
      expect(init.headers).toBeUndefined();
      expect((init.body as FormData).get("file")).toBeInstanceOf(File);
    }
    expect((fetchMock.mock.calls[1][1].body as FormData).get("treasuryAccountId"))
      .toBe("treasury-1");
    expect((fetchMock.mock.calls[2][1].body as FormData).get("type")).toBe("CUSTOMERS");
  });

  it("descarrega anexos com o nome seguro devolvido pelo backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("pdf", {
          status: 200,
          headers: {
            "content-type": "application/pdf",
            "content-disposition": "attachment; filename*=UTF-8''fatura%20teste.pdf",
          },
        }),
      ),
    );

    const file = await createApiClient({ baseUrl: "http://localhost/api" })
      .manualJournals.downloadAttachment("journal-1", "attachment-1");

    expect(file.fileName).toBe("fatura teste.pdf");
    expect(file.contentType).toBe("application/pdf");
    expect(await file.blob.text()).toBe("pdf");
  });
});
