# BK-MF8-06 - Alertas configuráveis (ativar/desativar tipos).

## Header
- `doc_id`: `GUIA-BK-MF8-06`
- `bk_id`: `BK-MF8-06`
- `macro`: `MF8`
- `owner`: `Andre`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF33`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-07`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-06-alertas-configuraveis-ativar-desativar-tipos.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Alertas configuráveis (ativar/desativar tipos).` com rastreabilidade direta ao requisito `RNF33`.
- Foco tecnico da macro: operacao final, i18n e fecho para defesa PAP.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Alertas configuráveis (ativar/desativar tipos).` com autonomia técnica, garantindo cobertura do requisito `RNF33` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: Preparar operacao final, observabilidade e fecho para defesa PAP..

### Pre-requisitos
- Ler o requisito `RNF33` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF8`.
- [ ] Sei mostrar onde esta o requisito `RNF33` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-06`
- Requisito: `RNF33`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-06` e o requisito `RNF33`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Alertas configuráveis (ativar/desativar tipos).`.
3. Implementar preferencias por utilizador/empresa para ativar e desativar tipos de alerta.
4. Garantir que alertas desativados deixam de ser emitidos sem afetar alertas ativos.
5. Executar smoke com alteracao de configuracao e validar efeito imediato na emissao de alertas.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Cenarios negativos recomendados
- tentativa de configurar tipo de alerta inexistente
- tentativa de atualizar preferencia sem contexto de empresa

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF8-07`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Aplicacao de preferencias de alertas por tipo**

Contexto de rastreabilidade: `BK-MF8-06` -> `RNF33`.

```ts
type TipoAlerta = 'cashflow' | 'desvio' | 'rutura';
type PreferenciasAlertas = Record<TipoAlerta, boolean>;

export function podeEmitirAlerta(tipo: TipoAlerta, prefs: PreferenciasAlertas) {
  if (!(tipo in prefs)) {
    throw new Error('RNF33: tipo de alerta nao configurado');
  }
  return { bkId: 'BK-MF8-06', requisito: 'RNF33', tipo, ativo: prefs[tipo] };
}
```

Usar antes da publicacao de notificacoes para respeitar as preferencias de configuracao do utilizador.

## Criterios de aceite
- Configuracao de alertas por tipo persistida e aplicada em tempo de execucao.
- Dois cenarios negativos executados com bloqueio controlado.
- Smoke confirma ativacao/desativacao sem efeitos colaterais.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
