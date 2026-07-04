# Evidence - BK-MF8-05

## Escopo validado

- Endpoint: `POST /api/subscriptions/current/activate`
- Requisito: `RF50`
- Sem pagamento real: confirmado
- Roles autorizadas: `ADMIN`, `GESTOR`
- Empresa ativa: resolvida no backend

## Comandos executados

| Comando | Resultado | Observações |
| --- | --- | --- |
| `npm run syntax:check` | PASS/FAIL | Registar output relevante. |
| `npm run test:contracts` | PASS/FAIL | Registar output relevante. |

## Cenários verificados

| Cenário | Resultado |
| --- | --- |
| Plano mensal ativa subscrição simulada | PASS/FAIL |
| Plano inexistente devolve erro funcional | PASS/FAIL |
| Body sem `planCode` devolve erro de validação | PASS/FAIL |
| Role não autorizada devolve `403` | PASS/FAIL |
| Falta de empresa ativa devolve `403` | PASS/FAIL |

## Notas

- Registar qualquer falha ambiental com mensagem completa.
- Separar falha de ambiente de falha funcional da app.
- Não inventar outputs.