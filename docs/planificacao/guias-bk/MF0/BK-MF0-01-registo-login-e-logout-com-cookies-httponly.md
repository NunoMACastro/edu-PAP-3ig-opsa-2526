# BK-MF0-01 - Registo, login e logout com cookies HttpOnly.

## Header
- `doc_id`: `GUIA-BK-MF0-01`
- `bk_id`: `BK-MF0-01`
- `macro`: `MF0`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RF01`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF0-02`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-01-registo-login-e-logout-com-cookies-httponly.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Registo, login e logout com cookies HttpOnly.` com rastreabilidade direta ao requisito `RF01`.
- Foco tecnico da macro: fundacoes de autenticacao, perfis, empresa e dados mestre.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Registo, login e logout com cookies HttpOnly.` com autonomia técnica, garantindo cobertura do requisito `RF01` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF0`: Instalar base segura de identidade e dados mestre para desbloquear todo o ERP..

### Pre-requisitos
- Ler o requisito `RF01` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF0`.
- [ ] Sei mostrar onde esta o requisito `RF01` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF0-01`
- Requisito: `RF01`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF0-01` e o requisito `RF01`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Registo, login e logout com cookies HttpOnly.`.
3. Implementar registo com validacao minima obrigatoria (`email`, `password` forte) e bloqueio de utilizador duplicado.
4. Implementar login com emissao de cookie de sessao com flags `HttpOnly`, `Secure` e `SameSite`.
5. Implementar logout com invalidacao de sessao no servidor e expiracao imediata do cookie.
6. Executar smoke do fluxo completo (registo -> login -> acesso autenticado -> logout -> acesso negado).
7. Executar testes negativos obrigatorios e registar resposta HTTP/mensagem para cada caso.
8. Atualizar evidence (`pr`, `proof`, `neg`) com artefactos concretos e verificaveis.

### Cenarios negativos recomendados
- login com password errada
- acesso autenticado sem cookie de sessao valido
- tentativa de registo com email ja existente

### Validacao
- [ ] Smoke: registo, login e logout concluidos sem erro bloqueante.
- [ ] Sessao: cookie emitido com `HttpOnly` e removido no logout.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais (requests/responses + headers de cookie).

### Handoff
- Proximo BK recomendado: `BK-MF0-02`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Gestao de cookie de sessao**

```ts
const BK_ID = 'BK-MF0-01';
const REQUISITO = 'RF01';

export function criarCookieSessao(sessionId: string) {
  return {
    bk: BK_ID,
    requisito: REQUISITO,
    header: `sid=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/`,
  };
}

export function invalidarCookieSessao() {
  return {
    bk: BK_ID,
    requisito: REQUISITO,
    header: 'sid=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
  };
}
```

Aplicar no login/logout para evidenciar cumprimento de `RF01` com cookies seguros.

## Criterios de aceite
- Fluxo `registo -> login -> logout` funcional e testado.
- Cookie de sessao com `HttpOnly/Secure/SameSite` validado em evidencias.
- Três cenarios negativos executados com respostas controladas.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).
- Evidence pronta para revisao tecnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: requests/responses do fluxo principal com header `Set-Cookie`.
- `proof`: comprovativo de invalidacao de cookie no logout (`Max-Age=0`).
- `neg`: tres cenarios negativos com codigo HTTP e mensagem esperada.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
