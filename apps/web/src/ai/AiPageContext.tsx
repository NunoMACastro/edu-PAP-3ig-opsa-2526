/**
 * @file Contexto mínimo que o frontend pode sugerir ao assistente.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AiTransactionContext {
  documentType: "SALE" | "PURCHASE";
  documentId: string;
  label: string;
}

export interface AiPageContextValue {
  module: string;
  entity?: { type: string; id: string };
  period?: { from: string; to: string };
  filters?: Record<string, string>;
}

interface AiPageContextState extends AiPageContextValue {
  transaction: AiTransactionContext | null;
  setTransaction: (transaction: AiTransactionContext) => void;
  clearTransaction: () => void;
}

const AiPageContext = createContext<AiPageContextState>({
  module: "unknown",
  transaction: null,
  setTransaction: () => {},
  clearTransaction: () => {},
});

export function AiPageContextProvider({ value, children }: { value: AiPageContextValue; children: ReactNode }) {
  const [transaction, updateTransaction] = useState<AiTransactionContext | null>(null);
  const setTransaction = useCallback((next: AiTransactionContext) => updateTransaction(next), []);
  const clearTransaction = useCallback(() => updateTransaction(null), []);

  useEffect(() => {
    clearTransaction();
  }, [clearTransaction, value.module]);

  const context = useMemo<AiPageContextState>(() => ({
    ...value,
    transaction,
    setTransaction,
    clearTransaction,
  }), [clearTransaction, setTransaction, transaction, value]);

  return <AiPageContext.Provider value={context}>{children}</AiPageContext.Provider>;
}

export function useAiPageContext() {
  return useContext(AiPageContext);
}

/** Contrato pequeno usado pelas páginas do agente 4 para selecionar/limpar documentos. */
export function useAiTransactionContext() {
  const { transaction, setTransaction, clearTransaction } = useContext(AiPageContext);
  return { transaction, setTransaction, clearTransaction };
}
