export function validateWarehouse(data) {
  if (!data.code) {
    throw new Error("CODE_REQUIRED");
  }
  if (!data.name) {
    throw new Error("NAME_REQUIRED");
  }
}

export function validateLocation(data) {
  if (!data.code) {
    throw new Error("LOCATION_CODE_REQUIRED");
  }
}