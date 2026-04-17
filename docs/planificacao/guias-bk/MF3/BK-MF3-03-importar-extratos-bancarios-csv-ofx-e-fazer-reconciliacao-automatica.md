# BK-MF3-03 - Importar extratos bancários (CSV/OFX) e fazer reconciliação automática.

## Header
- `doc_id`: `GUIA-BK-MF3-03`
- `bk_id`: `BK-MF3-03`
- `macro`: `MF3`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF3-02, BK-MF1-02, BK-MF1-09`
- `rf_rnf`: `RF39`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-04`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Importar extratos bancários (CSV/OFX) e fazer reconciliação automática.` com rastreabilidade direta ao requisito `RF39`.
- Foco tecnico da macro: tesouraria, integracoes e relatorio funcional.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Importar extratos bancários (CSV/OFX) e fazer reconciliação automática.` com autonomia técnica, garantindo cobertura do requisito `RF39` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF3`: Consolidar tesouraria, integracoes e reporting financeiro auditavel..

### Pre-requisitos
- Ler o requisito `RF39` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF3-02, BK-MF1-02, BK-MF1-09`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF3`.
- [ ] Sei mostrar onde esta o requisito `RF39` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF3-03`
- Requisito: `RF39`
- Dependencias: `BK-MF3-02, BK-MF1-02, BK-MF1-09`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF3-03` e o requisito `RF39`.
2. Validar dependencias técnicas (`BK-MF3-02, BK-MF1-02, BK-MF1-09`) e preparar dados de teste mínimos para `Importar extratos bancários (CSV/OFX) e fazer reconciliação automática.`.
3. Implementar integração/importação/exportação com validação estrutural e rastreio de erros.
4. Validar reconciliação/relatório resultante com dados de referência controlados.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).
7. Aplicar reforço técnico (robustez/performance/segurança) no risco principal identificado para este BK.
8. Atualizar evidence (`pr`, `proof`, `neg`) com artefactos concretos e verificaveis.

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF3-04`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Emparelhamento simples de movimentos bancarios**

```ts
type Movimento = { id: string; valor: number; data: string; descricao: string };

export function sugerirCorrespondencias(extrato: Movimento[], pendentes: Movimento[]) {
  return extrato.map((m) => {
    const match = pendentes.find((p) => p.valor === m.valor && p.data === m.data);
    return { bk: 'BK-MF3-03', movimento: m.id, documento: match?.id ?? null };
  });
}
```

Serve como base para reconciliacao automatica, mantendo criterio deterministico (valor+data) antes de regras avancadas.

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
