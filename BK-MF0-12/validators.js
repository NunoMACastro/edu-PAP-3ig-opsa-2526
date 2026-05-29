/**
 * Valida os dados de um armazém
 */
export function validateWarehouse(data) {

  // Verifica se existe código
  if (!data.code || data.code.trim() === "") {
    throw new Error(
      "Código do armazém é obrigatório"
    );
  }

  // Verifica se existe nome
  if (!data.name || data.name.trim() === "") {
    throw new Error(
      "Nome do armazém é obrigatório"
    );
  }
}

/**
 * Valida os dados de uma localização
 */
export function validateLocation(data) {

  // Verifica se existe código
  if (!data.code || data.code.trim() === "") {
    throw new Error(
      "Código da localização é obrigatório"
    );
  }
}