/**
 * @file Cliente tipado do bootstrap transacional de empresas.
 */

import { createApiClient } from "./apiClient";

export type CompanySetupMode = "initial" | "additional";

export interface CompanySetupInput {
  name: string;
  profile: {
    legalName: string;
    nif: string;
    addressLine1: string;
    addressLine2?: string;
    postalCode: string;
    city: string;
    country: "PT";
    currency: "EUR";
    fiscalYearStartMonth: number;
    fiscalYearStartDay: number;
  };
  prepareDemoData: boolean;
}

export interface CompanySetupResult {
  company: { id: string; name: string; nif: string };
  context: {
    companyId: string;
    companyName: string;
    nif: string;
    role: "ADMIN";
  };
  bootstrap: {
    fiscalPeriod: {
      id: string;
      name: string;
      fiscalYear: number;
      startDate: string;
      endDate: string;
      status: "OPEN";
    };
    accountCodes: string[];
    vatRate: { id: string; code: string; rateBps: number };
    warehouse: { id: string; code: string; name: string };
    demoData: {
      prepared: boolean;
      product?: { id: string; sku: string; name: string };
      openingStock?: { quantity: number; movementId: string };
    };
  };
}

const client = createApiClient();

/**
 * Cria a primeira empresa ou uma empresa adicional através do mesmo contrato.
 * A identidade, role e empresa ativa são sempre derivadas da sessão no backend.
 *
 * @param mode - Fluxo inicial ou criação adicional.
 * @param input - Dados empresariais e opção académica explícita.
 * @returns Resultado sanitizado do bootstrap.
 */
export function createCompanySetup(mode: CompanySetupMode, input: CompanySetupInput) {
  const path = mode === "initial" ? "/onboarding/company" : "/companies";
  return client.request<CompanySetupResult>("POST", path, { body: { ...input } });
}
