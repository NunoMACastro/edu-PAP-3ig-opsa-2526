/**
 * @file Testes unitários do hardening bcrypt do BK-MF6-06.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    BCRYPT_ROUNDS,
    hashPassword,
    verifyPassword,
} from "../../src/modules/auth/password.js";

test("hashPassword guarda bcrypt e verifyPassword valida a tentativa correta", async () => {
    const plainPassword = "UmaFraseSegura123";
    const passwordHash = await hashPassword(plainPassword);

    // O valor persistido nunca pode ser igual ao segredo recebido no pedido.
    assert.notEqual(passwordHash, plainPassword);
    assert.match(passwordHash, /^\$2[aby]\$/);

    // O custo documentado tem de ficar testado para detetar regressões de configuração.
    assert.equal(BCRYPT_ROUNDS, 12);

    assert.equal(await verifyPassword(plainPassword, passwordHash), true);
    assert.equal(await verifyPassword("Errada12345", passwordHash), false);
});

test("verifyPassword devolve false quando o hash não tem formato bcrypt", async () => {
    // Este negativo impede que texto claro ou valores corrompidos sejam aceites como hash.
    assert.equal(await verifyPassword("UmaFraseSegura123", "texto-claro"), false);
});