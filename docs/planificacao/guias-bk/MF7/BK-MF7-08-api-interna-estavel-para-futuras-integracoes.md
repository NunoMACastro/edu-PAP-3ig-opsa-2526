# BK-MF7-08 - API interna estável para futuras integrações.

## Header
- `doc_id`: `GUIA-BK-MF7-08`
- `bk_id`: `BK-MF7-08`
- `macro`: `MF7`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF26`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-09`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-08-api-interna-estavel-para-futuras-integracoes.md`
- `last_updated`: `2026-04-13`

## Contexto do BK
- Entrega alvo: implementar `API interna estável para futuras integrações.` com rastreabilidade direta ao requisito `RNF26`.
- Foco tecnico da macro: compliance, interoperabilidade e modularidade.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `API interna estável para futuras integrações.` com rastreabilidade explicita para `RNF26` e demonstracao tecnica no contexto da sprint `S11-S12`.

### Pre-requisitos
- Ler o requisito `RNF26` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF7`.
- [ ] Sei mostrar onde esta o requisito `RNF26` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF7-08`
- Requisito: `RNF26`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do BK-MF7-08 e o requisito `RNF26`.
2. Verificar pre-condicoes tecnicas (-) e validar ambiente local antes de implementar.
3. Definir contrato de entrada/saida do fluxo principal para `API interna estável para futuras integrações.`.
4. Implementar caminho principal com registo de logs/erros relevantes para auditoria.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenarios negativos obrigatorios e registar resultado observado (mensagem/codigo/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF7-09`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Hardening basico de seguranca**

```ts
import bcrypt from 'bcryptjs';

export async function hashPasswordSegura(password: string) {
  if (password.length < 12) throw new Error('Password abaixo do minimo');
  const hash = await bcrypt.hash(password, 12);
  return { bk: 'BK-MF7-08', hash };
}

export function exigirTLS(proto: string) {
  if (proto !== 'https') throw new Error('Canal nao seguro');
}
```

Integrar no fluxo do BK para garantir requisitos minimos de seguranca (hash forte + transporte seguro).

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
- `2026-04-13`: guia migrado para naming com slug e template pedagogico-operacional executavel.
