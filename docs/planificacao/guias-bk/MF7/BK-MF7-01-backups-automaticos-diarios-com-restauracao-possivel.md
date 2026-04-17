# BK-MF7-01 - Backups automáticos diários com restauração possível.

## Header
- `doc_id`: `GUIA-BK-MF7-01`
- `bk_id`: `BK-MF7-01`
- `macro`: `MF7`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF18`
- `fase_documental`: `Fase 3`
- `sprint`: `S11-S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF7-02`
- `guia_path`: `docs/planificacao/guias-bk/MF7/BK-MF7-01-backups-automaticos-diarios-com-restauracao-possivel.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Backups automáticos diários com restauração possível.` com rastreabilidade direta ao requisito `RNF18`.
- Foco tecnico da macro: compliance, interoperabilidade e modularidade.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Backups automáticos diários com restauração possível.` com autonomia técnica, garantindo cobertura do requisito `RNF18` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF7`: Fechar compliance legal, interoperabilidade e arquitetura modular..

### Pre-requisitos
- Ler o requisito `RNF18` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF7`.
- [ ] Sei mostrar onde esta o requisito `RNF18` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF7-01`
- Requisito: `RNF18`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF7-01` e o requisito `RNF18`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Backups automáticos diários com restauração possível.`.
3. Implementar requisito de compliance/interoperabilidade preservando formato e integridade de dados.
4. Validar compatibilidade legal/técnica com output verificável (ficheiro, log ou endpoint).
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF7-02`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Hardening basico de seguranca**

```ts
import bcrypt from 'bcryptjs';

export async function hashPasswordSegura(password: string) {
  if (password.length < 12) throw new Error('Password abaixo do minimo');
  const hash = await bcrypt.hash(password, 12);
  return { bk: 'BK-MF7-01', hash };
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
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
