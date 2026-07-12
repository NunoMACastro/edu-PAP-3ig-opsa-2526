# Seed demonstrativo OPSA

Esta infraestrutura cria dados exclusivamente locais/de teste e está bloqueada em `NODE_ENV=production`.

## Comandos

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

## Perfis e integrações

O perfil `demo` privilegia coerência de domínio e workflows acionáveis. O perfil `load` usa escrita bulk validada e, no tamanho `medium`, cria 1 000 clientes, 300 fornecedores, 2 000 artigos, 8 000 documentos, 20 000 movimentos e 5 000 logs.

O object storage é exercitado de forma real, incluindo escrita, leitura e remoção de um objeto efémero. SAF-T, SMTP e Redis nunca são falsificados: o verificador apresenta `PASS`, `SKIPPED_EXTERNAL_PREREQUISITE` ou `FAIL_EXTERNAL_PREREQUISITE` conforme a evidência disponível. Os probes SMTP e Redis só são executados quando as respetivas variáveis de ambiente foram configuradas explicitamente.
