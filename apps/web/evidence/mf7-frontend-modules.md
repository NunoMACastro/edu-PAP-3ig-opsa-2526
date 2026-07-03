# Evidence BK-MF7-09 - Frontend modular

## Fonte

- RNF26: frontend modular com componentes reutilizaveis.
- Guia: `docs/planificacao/guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md`.
- Implementacao real: `real_dev/web`.

## Proof

- Comando: `node --check real_dev/web/scripts/check-mf7-frontend-modules.mjs`
- Resultado: `PASS`, sem erros de sintaxe.
- Comando: `npm --prefix real_dev/web run check:mf7:frontend-modules`
- Resultado: `PASS`, output `MF7 frontend modular: OK`.
- Comando: `npm --prefix real_dev/web run test:mf7`
- Resultado: `PASS`, browser compatibility, frontend modules, typecheck e build Vite concluidos.

## Negativos

- Comando: `OPSA_MF7_FRONTEND_SIMULATE_NO_CREDENTIALS=true npm --prefix real_dev/web run check:mf7:frontend-modules`
- Resultado esperado: `FAIL`; mensagem `Cliente API deve manter credentials: "include" para enviar o cookie de sessao`.
- Comando: `OPSA_MF7_FRONTEND_SIMULATE_MISSING_APP_DOMAIN=purchases npm --prefix real_dev/web run check:mf7:frontend-modules`
- Resultado esperado: `FAIL`; mensagem `Pagina ou rota frontend em falta para dominio: purchases`.
- Comando: `OPSA_MF7_FRONTEND_SIMULATE_MISSING_API_DOMAIN=purchases npm --prefix real_dev/web run check:mf7:frontend-modules`
- Resultado esperado: `FAIL`; mensagem `Cliente API em falta para dominio: purchases`.

## Multiempresa

- O frontend apenas consome o cliente API central e envia cookies HttpOnly com `credentials: "include"`.
- A empresa ativa continua resolvida no backend a partir da sessao autenticada.
- O frontend nao decide ownership, role, permissao final ou empresa ativa por parametro livre.

## Handoff

- `BK-MF7-10` pode usar este gate como pre-condicao de modularidade frontend.
- O agregador `npm --prefix real_dev/web run test:mf7` inclui este gate antes do typecheck e build.
