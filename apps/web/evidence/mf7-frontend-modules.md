# Evidence BK-MF7-09 - Frontend modular

## Fonte
- RNF26: frontend modular.
- Guia: docs/planificacao/guias-bk/MF7/BK-MF7-09-frontend-modular-com-componentes-reutilizaveis.md.

## Proof
- Comando: cd apps/web && node --check scripts/check-mf7-frontend-modules.mjs
- Resultado: sem erros de sintaxe.
- Comando: cd apps/web && npm run check:mf7:frontend-modules
- Resultado: MF7 frontend modular: OK

## Negativos
- Sem credentials include nas opções do fetch: falha no contrato de sessão.
- Sem marcadores de página de compras: falha com Página ou rota frontend em falta para domínio: purchases.
- Sem marcadores API de compras: falha com Cliente API em falta para domínio: purchases.

## Multiempresa
- A empresa ativa continua resolvida no backend a partir da sessão autenticada.
- O frontend não escolhe empresa por parâmetro livre.

## Handoff
- BK-MF7-10 pode reutilizar este gate como pré-condição dos testes automatizados.
