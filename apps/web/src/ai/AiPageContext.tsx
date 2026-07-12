/**
 * @file Contexto mínimo que o frontend pode sugerir ao assistente.
 */

import { createContext, useContext, type ReactNode } from "react";

export interface AiPageContextValue {
  module: string;
  entity?: { type: string; id: string };
  period?: { from: string; to: string };
  filters?: Record<string, string>;
}

const AiPageContext = createContext<AiPageContextValue>({ module: "unknown" });

export function AiPageContextProvider({ value, children }: { value: AiPageContextValue; children: ReactNode }) {
  return <AiPageContext.Provider value={value}>{children}</AiPageContext.Provider>;
}

export function useAiPageContext() {
  return useContext(AiPageContext);
}
