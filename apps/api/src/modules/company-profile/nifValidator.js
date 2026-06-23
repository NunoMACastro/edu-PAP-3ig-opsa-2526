/**
 * @file Validador de NIF português usado nos BKs MF0.
 */

/**
 * Valida um NIF português com checksum.
 *
 * @param {unknown} value - Valor a validar.
 * @returns {boolean} `true` quando o valor tem 9 dígitos e checksum válido.
 */
export function isValidPortugueseNif(value) {
    if (typeof value !== "string" || !/^\d{9}$/.test(value)) return false;

    const digits = value.split("").map(Number);
    const checkDigit = digits[8];
    const sum = digits
        .slice(0, 8)
        .reduce((total, digit, index) => total + digit * (9 - index), 0);

    const remainder = sum % 11;
    const expected = remainder < 2 ? 0 : 11 - remainder;

    return checkDigit === expected;
}
