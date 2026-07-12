# Evidence MF7 - Readiness SAF-T

## Contrato atual

- Data da última revalidação: `2026-07-10`.
- BK: `BK-MF7-07`.
- Requisito: `RNF24`.
- Base funcional: `RF36` e `RF48`.
- Implementation root: `real_dev/api`.
- Estado: `BLOQUEADO_AMBIENTE`.
- Criar: `POST /api/compliance/saft/exports` com
  `{ "type": "FULL", "fiscalPeriodId": "..." }`.
- Consultar: `GET /api/compliance/saft/exports/:exportId`.
- Descarregar: `GET /api/compliance/saft/exports/:exportId/download`.
- O antigo `GET /api/compliance/saft?from=...&to=...` foi removido e não existe
  fallback para o XML `1.04_01-MVP`.

## Comportamento fail-closed demonstrado

- `SAFT_EXPORT_ENABLED` não é verdadeiro por omissão.
- O período vem sempre de um `fiscalPeriodId` da empresa ativa e tem de estar
  fechado; intervalos arbitrários enviados pelo browser não são aceites.
- O preflight exige perfil fiscal, ATCUD/hash/hash control dos documentos,
  motivo/código de isenção e hierarquia/taxonomia das contas.
- O XSD carregado em runtime tem de corresponder ao fingerprint oficial
  `1.04_01` fixado no código.
- Sem um pipeline externo explicitamente injetado, a criação devolve erro e não
  grava artefacto nem `SaftExportRun` `READY`.
- Um download só é autorizado para um run da empresa ativa com estados XSD,
  totais e revisão externa aprovados e metadata de storage coerente.
- O XML final, quando existir, fica no object storage privado; PostgreSQL guarda
  apenas metadata, hash, estados e atestação.

## Segurança e limites da evidência

- Empresa e utilizador vêm exclusivamente da sessão resolvida no backend.
- As rotas exigem autenticação, empresa ativa, `COMPLIANCE_READ` e role
  `ADMIN`, `CONTABILISTA` ou `AUDITOR`.
- O download usa `no-store`, `nosniff` e `Content-Disposition` sanitizado.
- Esta evidência não certifica conformidade legal. Faltam XSD runtime no
  ambiente de prova, geração/validação externa real, reconciliação externa e
  revisão por contabilista.

## Comandos e resultados observados em 2026-07-10

Todos os comandos foram executados em `real_dev/api`:

```bash
npm run syntax:check
npm run test:unit
npm run test:contracts
npm run test:mf7
DATABASE_URL=<synthetic-test-url> npx prisma validate
npm run test:integration
```

- `syntax:check`: exit `0`, 248 ficheiros JavaScript abrangidos.
- `test:unit`: exit `0`, `178/178`, zero skips.
- `test:contracts`: exit `0`, `133/133`, zero skips.
- `test:mf7`: exit `0`, 39 testes e check modular verdes.
- `prisma validate`: exit `0`; schema válido, com warning de depreciação da
  configuração Prisma no `package.json`.
- `test:integration`: exit `1`; 2 PASS e 4 falhas, zero skips. As quatro provas
  persistidas/Redis falharam por ausência de `TEST_DATABASE_URL`, `REDIS_URL` e
  `RATE_LIMIT_HMAC_KEY`.

Uma execução não realizada ou bloqueada nunca é contabilizada como PASS.
