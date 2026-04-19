# BK-MF4-08 - Notificações in-app para lembretes e alertas críticos da IA.

## Header
- `doc_id`: `GUIA-BK-MF4-08`
- `bk_id`: `BK-MF4-08`
- `macro`: `MF4`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF4-06, BK-MF4-04`
- `rf_rnf`: `RF46`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-09`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-08-notificacoes-in-app-para-lembretes-e-alertas-criticos-da-ia.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Notificações in-app para lembretes e alertas críticos da IA.` com rastreabilidade direta ao requisito `RF46`.
- Foco tecnico da macro: inteligencia operacional, alertas e governanca de operacoes.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Notificações in-app para lembretes e alertas críticos da IA.` com autonomia técnica, garantindo cobertura do requisito `RF46` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF4`: Operacionalizar IA assistiva com explicabilidade e controlo de risco..

### Pre-requisitos
- Ler o requisito `RF46` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF4-06, BK-MF4-04`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF4`.
- [ ] Sei mostrar onde esta o requisito `RF46` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF4-08`
- Requisito: `RF46`
- Dependencias: `BK-MF4-06, BK-MF4-04`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF4-08` e o requisito `RF46`.
2. Validar dependencias técnicas (`BK-MF4-06, BK-MF4-04`) e preparar dados de teste mínimos para `Notificações in-app para lembretes e alertas críticos da IA.`.
3. Implementar fluxo de IA/alerta/tarefa com fonte explícita e critério de decisão audível.
4. Validar que a resposta/alerta é explicável e não executa alterações contabilísticas automáticas.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Cenarios negativos recomendados
- entrada obrigatoria em falta
- estado de negocio invalido

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF4-09`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Regra de alerta com limiar explicito**

Contexto de rastreabilidade: `BK-MF4-08` -> `RF46`.

```ts
type Regra = { nome: string; limite: number };

export function avaliarAlerta(valorAtual: number, regra: Regra) {
  const ativo = valorAtual >= regra.limite;
  return {
    bkId: 'BK-MF4-08',
    regra: regra.nome,
    ativo,
    mensagem: ativo ? `Alerta ativo: ${regra.nome}` : 'Sem alerta',
  };
}
```

Usar para gerar alertas auditaveis com criterio transparente (limiar), evitando decisoes opacas na camada de IA/operacao.

## Criterios de aceite
- BK implementado no scope definido, sem romper dependencias.
- Validacao de smoke e negativos concluida.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).
- Evidence pronta para revisao tecnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
