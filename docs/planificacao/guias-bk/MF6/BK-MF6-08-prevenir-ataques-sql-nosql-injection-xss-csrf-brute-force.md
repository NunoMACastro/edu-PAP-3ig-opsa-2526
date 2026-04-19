# BK-MF6-08 - Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).

## Header
- `doc_id`: `GUIA-BK-MF6-08`
- `bk_id`: `BK-MF6-08`
- `macro`: `MF6`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF15`
- `fase_documental`: `Fase 3`
- `sprint`: `S10-S11`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF6-09`
- `guia_path`: `docs/planificacao/guias-bk/MF6/BK-MF6-08-prevenir-ataques-sql-nosql-injection-xss-csrf-brute-force.md`
- `last_updated`: `2026-04-19`

## Contexto do BK
- Entrega alvo: implementar `Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).` com rastreabilidade direta ao requisito `RNF15`.
- Foco tecnico da macro: desempenho, seguranca e robustez tecnica.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).` com autonomia técnica, garantindo cobertura do requisito `RNF15` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF6`: Assegurar robustez tecnica de performance, seguranca e continuidade..

### Pre-requisitos
- Ler o requisito `RNF15` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF6`.
- [ ] Sei mostrar onde esta o requisito `RNF15` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `60-90 min`.
- `Reforco`: `+20-40 min`.

## Bloco operacional
### Entrada
- BK: `BK-MF6-08`
- Requisito: `RNF15`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF6-08` e o requisito `RNF15`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Prevenir ataques (SQL/NoSQL Injection, XSS, CSRF, brute force).`.
3. Aplicar validacao de input por schema e queries parametrizadas em endpoints de escrita/leitura sensiveis.
4. Implementar protecoes de saida para XSS (escaping/sanitizacao) nas respostas e componentes com render de texto.
5. Ativar protecao CSRF nos endpoints mutaveis e validar token em requests de sessao autenticada.
6. Configurar rate limit para brute force (por IP + por utilizador) com bloqueio temporario e log de evento.
7. Executar suite de ataques simulados (SQLi, NoSQLi, XSS, CSRF, brute force) e confirmar resposta controlada.
8. Atualizar evidence (`pr`, `proof`, `neg`) com logs, testes automatizados e tabela de resultados por vetor.

### Cenarios negativos recomendados
- payload SQL injection em campo de autenticacao
- payload XSS em campo de descricao/comentario
- request mutavel sem token CSRF valido

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante apos hardening.
- [ ] Negativos: minimo `3` cenarios com resultado controlado.
- [ ] Seguranca: cada vetor (`SQLi`, `NoSQLi`, `XSS`, `CSRF`, `brute force`) tem teste com resultado esperado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais (log + output de teste + screenshot/relatorio).

### Handoff
- Proximo BK recomendado: `BK-MF6-09`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Middleware de seguranca para RNF15**

Contexto de rastreabilidade: `BK-MF6-08` -> `RNF15`.

```ts
type SecurityResult = { bk: 'BK-MF6-08'; requisito: 'RNF15'; blocked: boolean; reason?: string };

export function validarPayloadSuspeito(payload: string): SecurityResult {
  const lower = payload.toLowerCase();
  const sinais = ['<script', 'select *', 'drop table', '$where', 'union select'];
  const suspeito = sinais.some((sig) => lower.includes(sig));
  if (suspeito) {
    return { bk: 'BK-MF6-08', requisito: 'RNF15', blocked: true, reason: 'payload_suspeito' };
  }
  return { bk: 'BK-MF6-08', requisito: 'RNF15', blocked: false };
}

export function validarCsrfToken(token: string | null): SecurityResult {
  if (!token || token.length < 20) {
    return { bk: 'BK-MF6-08', requisito: 'RNF15', blocked: true, reason: 'csrf_invalido' };
  }
  return { bk: 'BK-MF6-08', requisito: 'RNF15', blocked: false };
}
```

Aplicar antes da camada de dominio para bloquear vetores comuns de ataque e cumprir `RNF15`.

## Criterios de aceite
- Vetores `SQLi`, `NoSQLi`, `XSS`, `CSRF` e `brute force` com protecao implementada e testada.
- Validacao de smoke e negativos concluida com registo por vetor.
- Rate limit ativo e comprovado em tentativa repetida de autenticacao.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).
- Evidence pronta para revisao tecnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: output de testes de seguranca por vetor (`SQLi`, `NoSQLi`, `XSS`, `CSRF`, `brute force`).
- `proof`: log de bloqueio/rate-limit com timestamp e identificador do endpoint.
- `neg`: tres cenarios negativos com payload e resposta controlada.

## Changelog
- `2026-04-17`: guia migrado para naming com slug e template pedagogico-operacional executavel.
