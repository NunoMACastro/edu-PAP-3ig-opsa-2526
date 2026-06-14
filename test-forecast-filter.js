import { validateForecastQuery } from "./apps/api/src/modules/treasury/cashflowForecastFilters.js";

const valid = validateForecastQuery({
  from: "2026-01-01",
  to: "2026-06-29",
});

console.log("Teste 180 dias passou:", valid);

try {
  validateForecastQuery({
    from: "2026-01-01",
    to: "2026-06-30",
  });

  throw new Error("Era esperado FORECAST_RANGE_TOO_LONG.");
} catch (error) {
  console.log({
    status: error.status,
    code: error.code,
    message: error.message,
  });

  if (error.status !== 400 || error.code !== "FORECAST_RANGE_TOO_LONG") {
    throw error;
  }

  console.log("Teste 181 dias passou: intervalo superior a 180 dias bloqueado.");
}