# Evidence MF7 - Email transaccional

## Contrato

- Data de execução: `2026-06-29`
- BK: `BK-MF7-04`
- Requisito: `RNF21`
- Fluxos cobertos: recuperação de password, alertas e lembretes
- Implementation root: `real_dev/api`

## Comandos executados

```bash
node --check src/modules/notifications/transactionalEmailAdapter.js
node --check src/modules/auth/passwordResetEmailAdapter.js
npm run test:mf7:email
```

## Resultado observado

- Adapter transaccional: `PASS` via `npm run syntax:check`.
- Adapter de recuperação: `PASS` via `npm run syntax:check`.
- Testes de contrato: `PASS`, 5 testes, 1 suite, 0 falhas.

## Fluxo principal

- Provider ausente devolve `QUEUED_FOR_PROVIDER`.
- Log técnico regista evento, motivo e domínio do destinatário.
- Recuperação de password mantém `sendPasswordReset`.
- Alertas e lembretes usam o adapter comum.

## Negativos

- Motivo `"MARKETING"` é rejeitado.
- Destinatário sem `@` é rejeitado.
- Provider não é chamado quando o destinatário é inválido.
- Logs não incluem endereço completo, segredo temporário nem URL privada.

## Output resumido

```text
> @opsa/api@1.0.0 test:mf7:email
> node --test tests/contracts/mf7-email-contracts.test.js

✔ MF7 email transaccional
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

## Fonte

- `docs/RNF.md` - `RNF21`.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` - `BK-MF7-04`.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` - prioridade e sequência.
