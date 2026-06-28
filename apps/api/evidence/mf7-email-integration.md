# Evidence MF7 - Email transaccional

## Contrato

- Data de execução: AAAA-MM-DD
- BK: BK-MF7-04
- Requisito: RNF21
- Fluxos cobertos: recuperação de password, alertas e lembretes.

## Comandos executados

```bash
cd apps/api
node --check src/modules/notifications/transactionalEmailAdapter.js
node --check src/modules/auth/passwordResetEmailAdapter.js
npm run test:mf7:email
```

## Resultado observado

- Adapter transaccional: sintaxe válida.
- Adapter de recuperação: sintaxe válida.
- Testes de contrato: todos os testes passaram.

## Fluxo principal

- Provider ausente devolveu `QUEUED_FOR_PROVIDER`.
- Log técnico registou evento, motivo e domínio do destinatário.
- Recuperação de password manteve `sendPasswordReset`.
- Alertas e lembretes usaram o adapter comum.

## Negativos

- Motivo `"MARKETING"` foi rejeitado.
- Destinatário sem `@` foi rejeitado.
- Provider não foi chamado quando o destinatário era inválido.
- Logs não incluíram endereço completo, segredo temporário nem URL privada.

## Fonte

- `docs/RNF.md` - RNF21.
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md` - BK-MF7-04.
- `docs/planificacao/backlogs/BACKLOG-MVP.md` - prioridade e sequência.