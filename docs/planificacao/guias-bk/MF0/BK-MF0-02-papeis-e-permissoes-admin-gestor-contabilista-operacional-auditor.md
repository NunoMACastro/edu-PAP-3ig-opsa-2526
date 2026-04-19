# BK-MF0-02 - Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).

## Header
- `doc_id`: `GUIA-BK-MF0-02`
- `bk_id`: `BK-MF0-02`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF0-01`
- `rf_rnf`: `RF02`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-03`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-02-papeis-e-permissoes-admin-gestor-contabilista-operacional-auditor.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).` com rastreabilidade direta ao requisito `RF02`.
- Foco tecnico da macro: fundacoes de autenticacao, perfis, empresa e dados mestre.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).` com autonomia técnica, garantindo cobertura do requisito `RF02` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF0`: Instalar base segura de identidade e dados mestre para desbloquear todo o ERP..

### Pre-requisitos
- Ler o requisito `RF02` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `BK-MF0-01`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF0`.
- [ ] Sei mostrar onde esta o requisito `RF02` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF0-02`
- Requisito: `RF02`
- Dependencias: `BK-MF0-01`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF0-02` e o requisito `RF02`.
2. Validar dependencias técnicas (`BK-MF0-01`) e preparar dados de teste mínimos para `Papéis e permissões (Admin, Gestor, Contabilista, Operacional, Auditor).`.
3. Implementar regras de identidade/perfil com validações de acesso e segregação por empresa.
4. Executar smoke de autenticação/gestão base e comprovar persistência correta dos dados mestre.
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
- Proximo BK recomendado: `BK-MF0-03`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Guard de permissao e sessao**

```ts
const BK_ID = 'BK-MF0-02';

export function validarSessao(user: { id: string; roles: string[] } | null, roleNecessario: string) {
  if (!user) throw new Error('Sessao invalida');
  if (!user.roles.includes(roleNecessario)) throw new Error('Acesso negado');
  return { ok: true, bk: BK_ID };
}

// Exemplo de uso no endpoint associado ao requisito RF02
const sessao = validarSessao(ctx.user, 'ADMIN');
```

Usar este guard no endpoint principal do BK para bloquear acessos sem sessao/permissao e manter comportamento previsivel.

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
