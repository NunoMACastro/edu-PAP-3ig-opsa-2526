# BK-MF4-06 - Criar/editar lembretes essenciais (prazos, pagamentos e impostos).

## Header
- `doc_id`: `GUIA-BK-MF4-06`
- `bk_id`: `BK-MF4-06`
- `macro`: `MF4`
- `owner`: `Sofia`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF44`
- `fase_documental`: `Fase 2`
- `sprint`: `S08-S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-07`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-06-criar-editar-lembretes-essenciais-prazos-pagamentos-e-impostos.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Criar/editar lembretes essenciais (prazos, pagamentos e impostos).` com rastreabilidade direta ao requisito `RF44`.
- Foco tecnico da macro: inteligencia operacional, alertas e governanca de operacoes.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Criar/editar lembretes essenciais (prazos, pagamentos e impostos).` com autonomia técnica, garantindo cobertura do requisito `RF44` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF4`: Operacionalizar IA assistiva com explicabilidade e controlo de risco..

### Pre-requisitos
- Ler o requisito `RF44` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF4`.
- [ ] Sei mostrar onde esta o requisito `RF44` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF4-06`
- Requisito: `RF44`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF4-06` e o requisito `RF44`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Criar/editar lembretes essenciais (prazos, pagamentos e impostos).`.
3. Implementar CRUD de lembretes com campos obrigatorios (`titulo`, `tipo`, `data_limite`, `estado`).
4. Garantir edicao e remarcacao de prazo sem perder historico basico de alteracoes.
5. Implementar listagem filtrada por estado e por proximidade de prazo.
6. Executar smoke cobrindo criacao, edicao e consulta de lembrete.
7. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Cenarios negativos recomendados
- criar lembrete sem `data_limite`
- editar lembrete para data invalida (formato ou data passada)

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF4-07`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validacao de payload para criacao/edicao de lembrete**

Contexto de rastreabilidade: `BK-MF4-06` -> `RF44`.

```ts
type TipoLembrete = 'pagamento' | 'imposto' | 'prazo';
type LembreteInput = {
  titulo: string;
  tipo: TipoLembrete;
  dataLimite: string;
};

export function validarLembrete(input: LembreteInput) {
  if (!input.titulo.trim()) throw new Error('RF44: titulo obrigatorio');
  if (!input.dataLimite) throw new Error('RF44: data limite obrigatoria');
  const data = new Date(input.dataLimite);
  if (Number.isNaN(data.getTime())) throw new Error('RF44: data limite invalida');
  return {
    bkId: 'BK-MF4-06',
    requisito: 'RF44',
    payloadValido: true,
    lembrete: input,
  };
}

export function atualizarEstadoLembrete(
  estadoAtual: 'pendente' | 'concluido',
  novoEstado: 'pendente' | 'concluido'
) {
  if (estadoAtual === novoEstado) {
    throw new Error('RF44: estado sem alteracao');
  }
  return { bkId: 'BK-MF4-06', requisito: 'RF44', estado: novoEstado };
}
```

Aplicar nas operacoes de criacao/edicao para assegurar dados validos e rastreaveis no `RF44`.

## Criterios de aceite
- CRUD de lembretes funcional para prazos, pagamentos e impostos.
- Listagem com filtros por estado e prazo implementada.
- Dois cenarios negativos executados com tratamento controlado.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
