# BK-MF6-09 - Chaves de API e credenciais apenas em variáveis de ambiente.

## Header
- `doc_id`: `GUIA-BK-MF6-09`
- `bk_id`: `BK-MF6-09`
- `macro`: `MF6`
- `owner`: `Pedro`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF16`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-10`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-09-chaves-de-api-e-credenciais-apenas-em-variaveis-de-ambiente.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Chaves de API e credenciais apenas em variáveis de ambiente.` com rastreabilidade direta ao requisito `RNF16`.
- Foco tecnico da macro: desempenho, seguranca e robustez tecnica.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Chaves de API e credenciais apenas em variáveis de ambiente.` com autonomia técnica, garantindo cobertura do requisito `RNF16` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF6`: Assegurar robustez tecnica de performance, seguranca e continuidade..

### Pre-requisitos
- Ler o requisito `RNF16` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF6`.
- [ ] Sei mostrar onde esta o requisito `RNF16` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF6-09`
- Requisito: `RNF16`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF6-09` e o requisito `RNF16`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Chaves de API e credenciais apenas em variáveis de ambiente.`.
3. Aplicar hardening/performance no ponto crítico do BK com medição objetiva do limiar definido.
4. Executar teste negativo de segurança/performance e registar evidência comparativa antes/depois.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).
7. Aplicar reforço técnico (robustez/performance/segurança) no risco principal identificado para este BK.
8. Atualizar evidence (`pr`, `proof`, `neg`) com artefactos concretos e verificaveis.

### Cenarios negativos recomendados
- entrada obrigatoria em falta
- estado de negocio invalido
- tentativa sem permissoes/contexto valido

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF6-10`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Hardening basico de seguranca**

Contexto de rastreabilidade: `BK-MF6-09` -> `RNF16`.

```ts
import bcrypt from 'bcryptjs';

export async function hashPasswordSegura(password: string) {
  if (password.length < 12) throw new Error('Password abaixo do minimo');
  const hash = await bcrypt.hash(password, 12);
  return { bk: 'BK-MF6-09', hash };
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
