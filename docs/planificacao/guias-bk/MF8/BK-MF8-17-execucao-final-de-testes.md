# BK-MF8-17 - Execução final de testes.

## Header
- `doc_id`: `GUIA-BK-MF8-17`
- `bk_id`: `BK-MF8-17`
- `macro`: `MF8`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF8-16`
- `rf_rnf`: `RNF38`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-18`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-17-execucao-final-de-testes.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: correr a bateria final de testes antes da entrega e produzir evidence clara para defesa.
- Foco tecnico da macro: operacao final, UI, testes finais e fecho para defesa PAP.
- Regra de governanca: uma execução final só é válida se indicar comandos, resultado, data, ambiente e falhas encontradas.

## Bloco pedagogico
### Objetivo
Executar `Execução final de testes.` com autonomia técnica, garantindo cobertura do requisito `RNF38` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: transformar a defesa final numa demonstração sustentada por provas reproduzíveis.

### Pre-requisitos
- Concluir ou justificar as lacunas de `BK-MF8-16`.
- Confirmar scripts reais antes de executar comandos.
- Preparar ambiente com dados de teste controlados e sem dados pessoais/financeiros reais.

### Erros comuns
- Dizer que a app está testada sem guardar output.
- Misturar falhas de ambiente com falhas de código sem classificação.
- Ignorar um teste falhado porque o fluxo parece funcionar manualmente.

### Check de compreensao
- [ ] Sei listar os comandos de validação final.
- [ ] Sei separar falha de ambiente, falha de teste e falha real de produto.
- [ ] Sei preparar evidence sem dados sensíveis.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-17`
- Requisito: `RNF38`
- Dependencias: `BK-MF8-16`
- Artefactos de referencia: `apps/api/package.json`, `apps/web/package.json`, `docs/evidence/`, relatório de `BK-MF8-16`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-17` e o requisito `RNF38`.
2. Rever a lista de comandos validada em `BK-MF8-16`.
3. Executar validações estáticas, build, testes unitários, contratos, integração e smoke/UI conforme existirem no projeto.
4. Guardar output resumido de cada comando com data, ambiente e resultado.
5. Classificar falhas como ambiente, teste instável, regressão funcional, regressão visual ou lacuna documental.
6. Criar lista objetiva de erros a corrigir em `BK-MF8-18`.
7. Atualizar evidence final com resultados PASS/FAIL e riscos residuais.

### Cenarios negativos recomendados
- comando inexistente deve ser registado como lacuna e não como PASS;
- teste falhado deve gerar entrada de correção;
- credencial/variável ausente deve ser classificada como bloqueio de ambiente.

### Validacao
- [ ] Smoke: bateria final executada ou bloqueio documentado.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: falhas classificadas com evidência.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com outputs sanitizados.

### Handoff
- Proximo BK recomendado: `BK-MF8-18`
- Registar no handoff: comandos executados, resultados, falhas abertas e prioridade de correção.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Registo de execução final**

Contexto de rastreabilidade: `BK-MF8-17` -> `RNF38`.

```ts
type FinalTestRun = {
  bkId: 'BK-MF8-17';
  command: string;
  result: 'PASS' | 'FAIL' | 'BLOCKED';
  evidencePath: string;
  followUp?: string;
};

export const finalTestRuns: FinalTestRun[] = [
  {
    bkId: 'BK-MF8-17',
    command: 'npm run test:contracts',
    result: 'PASS',
    evidencePath: 'docs/evidence/MF8/final-tests/contracts.log',
  },
];
```

Usar o registo para transformar a execução final numa evidência objetiva e auditável.

## Criterios de aceite
- Bateria final executada com comandos e outputs registados.
- Falhas classificadas e encaminhadas para `BK-MF8-18`.
- Dois cenários negativos executados com evidência objetiva.
- Dados sensíveis removidos dos outputs guardados.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com relatório de execução final.
- `proof`: logs ou resumo dos comandos executados.
- `neg`: comandos falhados/bloqueados e classificação objetiva.

## Changelog
- `2026-06-29`: guia genérico criado para a nova etapa de execução final de testes da MF8.
