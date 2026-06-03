### Passo 1

* BK: BK-MF1-01
* Macrofase: MF1
* Requisito funcional: RF13
* Dependência: BK-MF0-03
* Sprint: S03-S04
* Próximo BK: BK-MF1-02
* Endpoint previsto: /api/vat-rates

### Passo 2
Comandos executados:

```bash
npm --prefix apps/api run prisma:validate
npm --prefix apps/api run syntax:check
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run prisma:validate

> prisma validate

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm  run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js
✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (11.8787ms)
✔ BK01: registo mantém política de password forte (2.9058ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (2.851ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (1.0273ms)
✔ BK07: importação vazia é rejeitada (3.4766ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (2.7153ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (2.7011ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.4542ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (3.3211ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1633.5579

- PS D:\PAP\edu-PAP-3ig-opsa-2526\apps\api> npm run test:contracts                  

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (5.3632ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (2.0089ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (3.875ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (1.9963ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (5.3008ms)
✔ BK12: nome de armazém duplicado é rejeitado (1.743ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1506.9319