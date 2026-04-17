# BK-MF3-12 - Personalização de relatórios e exportação (PDF/Excel).

## Header
- `doc_id`: `GUIA-BK-MF3-12`
- `bk_id`: `BK-MF3-12`
- `macro`: `MF3`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF3-10`
- `rf_rnf`: `RF47`
- `fase_documental`: `Fase 2`
- `sprint`: `S07-S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-01`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-12-personalizacao-de-relatorios-e-exportacao-pdf-excel.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Personalização de relatórios e exportação (PDF/Excel).` com rastreabilidade direta ao requisito `RF47`.
- Foco tecnico da macro: tesouraria, integracoes e relatorio funcional.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Personalização de relatórios e exportação (PDF/Excel).` com autonomia técnica, garantindo cobertura do requisito `RF47` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF3`: Consolidar tesouraria, integracoes e reporting financeiro auditavel..

### Pre-requisitos
- Ler o requisito `RF47` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF3-10`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF3`.
- [ ] Sei mostrar onde esta o requisito `RF47` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF3-12`
- Requisito: `RF47`
- Dependencias: `BK-MF3-10`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF3-12` e o requisito `RF47`.
2. Validar dependencias técnicas (`BK-MF3-10`) e preparar dados de teste mínimos para `Personalização de relatórios e exportação (PDF/Excel).`.
3. Implementar integração/importação/exportação com validação estrutural e rastreio de erros.
4. Validar reconciliação/relatório resultante com dados de referência controlados.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF4-01`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Validacao de cabecalho de importacao**

```ts
const CAMPOS_MINIMOS = ['codigo', 'descricao', 'valor'];

export function validarCabecalhoImportacao(headers: string[]) {
  const faltam = CAMPOS_MINIMOS.filter((c) => !headers.includes(c));
  if (faltam.length) {
    throw new Error(`BK BK-MF3-12: cabecalho invalido, faltam ${faltam.join(', ')}`);
  }
  return { ok: true, bk: 'BK-MF3-12' };
}
```

Aplicar no inicio do fluxo de importacao/exportacao para bloquear ficheiros invalidos antes de tocar nos dados de negocio.

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
