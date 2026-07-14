# Seed demonstrativo OPSA

Esta infraestrutura cria dados exclusivamente locais/de teste e está bloqueada em `NODE_ENV=production`.

## Comandos

Na raiz do repositório, o percurso completo recomendado é:

```bash
npm --prefix real_dev/api run db:local:setup
```

O comando arranca o PostgreSQL de desenvolvimento, aplica todas as migrations,
cria a seed demo e executa a verificação. Dentro de `real_dev/api`, os comandos
granulares continuam disponíveis:

```bash
npm run db:seed
npm run db:seed:demo
npm run db:seed:verify
npm run db:seed:load
npm run db:seed:verify:load
```

Configuração opcional:

```dotenv
OPSA_DEMO_ANCHOR_DATE=2026-07-10
OPSA_DEMO_RANDOM_SEED=opsa-demo-v2
OPSA_DEMO_PASSWORD=OpsaDemo2026!
OPSA_LOAD_SCALE=medium
```

Sem `OPSA_DEMO_ANCHOR_DATE`, é usada a data civil corrente de `Europe/Lisbon`.
Cada execução repõe apenas o namespace escolhido. Empresas e utilizadores externos são preservados e a seed aborta se um email demo tiver memberships fora do namespace.

## Credenciais e percurso principal

- Login: `admin@opsa.demo`
- Password por defeito: `OpsaDemo2026!`
- Empresa: `OPSA Demo Comercio, Lda`

Depois de selecionar a empresa:

1. Abrir **Clientes** e usar **Carregar mais**.
2. Em **Documentos de venda**, localizar as linhas com `ACAO`:
   - ação 1 pode ser submetida;
   - ação 2 pode ser aprovada ou rejeitada;
   - ação 3 pode ser emitida;
   - ação 4 pode ser contabilizada;
   - ação 5 aceita recebimento parcial.
3. Em **Documentos de compra**, usar `ACAO-FC-001` para aprovação e `ACAO-FC-002` para contabilização.
4. Consultar movimentos FIFO, contagens `DRAFT`/`POSTED`/`CANCELLED` e alertas de stock baixo, excesso e artigo parado.
5. Consultar o mês corrente nos mapas de IVA, cashflow, relatórios e KPIs.
6. Abrir insights, sugestões, perguntas e alertas de IA.
7. Em lançamentos manuais, descarregar o PDF privado criado e validado pelo seed.
8. Trocar de empresa para demonstrar subscrições ativa mensal/anual, cancelada, expirada e inexistente.

Os recebimentos e pagamentos demonstrativos ficam associados às contas de
tesouraria da respetiva empresa e os saldos são verificados. Esta associação é
apenas da seed: a migration mantém `treasuryAccountId=null` nos movimentos
históricos, porque não existe informação segura para escolher uma conta.

Antes da seed, a migration fiscal sincroniza `Company.nif` a partir de
`CompanyProfile.nif`, a fonte canónica. Se o NIF canónico já pertencer a outra
empresa, a migration aborta sem apagar nem adivinhar dados; a colisão deve ser
resolvida manualmente antes de repetir `db:local:setup`.

## Perfis e integrações

O perfil `demo` privilegia coerência de domínio e workflows acionáveis. O perfil `load` usa escrita bulk validada e, no tamanho `medium`, cria 1 000 clientes, 300 fornecedores, 2 000 artigos, 8 000 documentos, 20 000 movimentos e 5 000 logs.

O adapter de storage ativo é exercitado com escrita, leitura e remoção de um
objeto efémero. Na demo, Redis é substituído explicitamente pelo rate limiter
local e o email é marcado `SIMULATED`; não se declara que houve Redis ou SMTP
real. O verificador apresenta `PASS`, `SKIPPED_EXTERNAL_PREREQUISITE` ou
`FAIL_EXTERNAL_PREREQUISITE` conforme a evidência disponível. Os probes de
providers externos só são executados quando foram configurados explicitamente.

## Ciclo de vida da base local

```bash
npm --prefix real_dev/api run db:local:status
npm --prefix real_dev/api run db:local:logs
npm --prefix real_dev/api run db:local:stop
```

`db:local:stop` preserva o volume. Para voltar deliberadamente a uma base vazia,
usa `npm --prefix real_dev/api run db:local:reset -- --confirm=opsa_dev`; este
comando remove apenas o volume local da OPSA e volta a aplicar migrations,
seed e verificação. Nunca deve ser usado sobre uma base externa.
