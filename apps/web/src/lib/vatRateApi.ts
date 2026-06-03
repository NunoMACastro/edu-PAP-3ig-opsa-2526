import { apiClient } from "./apiClient";

export type VatRate = {
  id: string;
  code: string;
  description: string;
  rateBps: number;
  type: string;
  exemptionReason: string | null;
  isActive: boolean;
};

type VatRateResponse = {
  data: VatRate;
};

type VatRatesResponse = {
  data: VatRate[];
};

export async function fetchVatRates(): Promise<VatRate[]> {
  const response = await apiClient.vatRates.list() as VatRatesResponse;
  return response.data;
}

export async function createVatRate(input: {
  code: string;
  description: string;
  rateBps: number;
  type: string;
  exemptionReason?: string;
}): Promise<VatRate> {
  const response = await apiClient.vatRates.create(input) as VatRateResponse;
  return response.data;
}

export async function setVatRateActive(
  id: string,
  isActive: boolean,
): Promise<VatRate> {
  const response = await apiClient.vatRates.setActive(id, { isActive }) as VatRateResponse;
  return response.data;
}