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