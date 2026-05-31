# CONTRATO-STACK-IMPLEMENTACAO

## Header
- `doc_id`: `CONTRATO-STACK-IMPLEMENTACAO`
- `path`: `docs/planificacao/CONTRATO-STACK-IMPLEMENTACAO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-06-01`

## Objetivo
Centralizar a stack técnica assumida para os guias BK enquanto a aplicação real ainda não tem scaffold definitivo. Este ficheiro evita que cada guia repita decisões de estrutura e reduz o risco de drift entre documentação, implementação futura e defesa PAP.

Este contrato é uma **assunção técnica documental**, não uma alteração de requisitos. Serve para orientar os caminhos sugeridos nos guias e deve ser revisto quando a equipa criar o scaffold real.

## Stack assumida até existir scaffold real
- Frontend: React + Vite + TypeScript.
- Backend: Node.js LTS + Express com JavaScript moderno e ES Modules.
- Persistência: PostgreSQL.
- ORM/migrations: Prisma ORM ou equivalente justificado.
- Sessão web: cookies HttpOnly, `Secure` em produção e `SameSite` configurado.
- Estrutura indicativa:
  - `apps/api` para backend/API;
  - `apps/web` para frontend;
  - `apps/api/prisma/schema.prisma` para schema/migrations quando Prisma for usado;
  - `apps/web/src/lib/apiClient.ts` para cliente HTTP do frontend.

## Natureza da assunção
Enquanto não existir código real da app fora do mockup, os caminhos acima são apenas a estrutura de referência para tornar os guias executáveis. Os BKs podem indicar ficheiros dentro de `apps/api` e `apps/web`, mas esses caminhos devem ser ajustados se a equipa criar outra estrutura.

Se a equipa optar por outra organização, deve manter a mesma separação de responsabilidades:
- backend separado por routes/router, controllers, services, validators, middlewares e modelos/repositorios quando aplicável;
- frontend separado por páginas, componentes, cliente API, estado local e validação de formulários;
- persistência com migrations/schema versionado;
- testes e smoke documentados por BK.

## Regras de adaptação de caminhos
Ao adaptar caminhos, a equipa deve documentar no PR ou evidence do BK:
- caminho indicado no guia;
- caminho real criado no scaffold;
- motivo da adaptação;
- confirmação de que o contrato funcional do BK se manteve.

Exemplo:

```text
Guia: apps/api/src/modules/vendas/services.js
Real: packages/api/src/domains/vendas/services.js
Motivo: scaffold monorepo usa packages/*
Impacto: sem alteração de RF, BK, owner, dependências ou critérios de aceite
```

## Limites de alteração
Alterar stack, pastas ou ferramentas não pode alterar:
- RF/RNF associados ao BK;
- `bk_id`;
- owner e apoio;
- prioridade;
- dependências canónicas;
- critérios de aceite;
- número mínimo de passos/negativos;
- evidence exigida;
- regras de segurança e validação.

Qualquer mudança que afete comportamento funcional, dados canónicos, roles, permissões, endpoints públicos ou critérios de aceite deve ser tratada como drift e revista com o orientador antes de ser aplicada.

## Dependências técnicas bloqueantes
As dependências canónicas dos BKs representam dependências técnicas bloqueantes, não apenas dependências formais dos RF/RNF. Quando um BK usa diretamente modelo, helper, service, middleware ou endpoint criado por outro BK, essa relação deve entrar em `dependencias` na matriz, no backlog, no contrato de campos e no header do guia.

Reutilizações meramente estruturais da stack, como Express, Prisma, cliente HTTP, layout de pastas ou convenções de testes, não criam dependência entre BKs. Já o uso direto de um contrato funcional entregue por outro BK cria dependência canónica.

Na `MF1`, `BK-MF0-03` é baseline explícito porque fornece autenticação aplicada ao contexto multiempresa e roles de forma transitiva. `BK-MF0-08` deve aparecer nos BKs que criam, alteram ou contabilizam documentos financeiros/contabilísticos, porque esses fluxos dependem de `assertOpenFiscalPeriod`.

Quando a implementação real adaptar caminhos ou nomes, a equipa deve preservar a relação técnica. Se o BK continuar a usar o contrato funcional de outro BK, a dependência mantém-se.

## Changelog
- `2026-06-01`: dependências técnicas diretas passam a ser bloqueantes e devem constar em `dependencias`.
- `2026-05-25`: contrato criado para centralizar a stack assumida dos guias MF0 e reduzir drift com a implementação futura.
