# BK-MF0-12 - Criar armazéns e localizações.

## Header
- `doc_id`: `GUIA-BK-MF0-12`
- `bk_id`: `BK-MF0-12`
- `macro`: `MF0`
- `owner`: `Sofia`
- `apoio`: `Oleksii`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RF12`
- `fase_documental`: `Fase 1`
- `sprint`: `S01-S02`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-01`
- `guia_path`: `docs/planificacao/guias-bk/MF0/BK-MF0-12-criar-armazens-e-localizacoes.md`
- `last_updated`: `2026-04-17`

## Contexto do BK
- Entrega alvo: implementar `Criar armazéns e localizações.` com rastreabilidade direta ao requisito `RF12`.
- Foco tecnico da macro: fundacoes de autenticacao, perfis, empresa e dados mestre.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `Criar armazéns e localizações.` com autonomia técnica, garantindo cobertura do requisito `RF12` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF0`: Instalar base segura de identidade e dados mestre para desbloquear todo o ERP..

### Pre-requisitos
- Ler o requisito `RF12` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `-`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `MF0`.
- [ ] Sei mostrar onde esta o requisito `RF12` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF0-12`
- Requisito: `RF12`
- Dependencias: `-`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF0-12` e o requisito `RF12`.
2. Validar dependencias técnicas (`-`) e preparar dados de teste mínimos para `Criar armazéns e localizações.`.
3. Implementar regras de identidade/perfil com validações de acesso e segregação por empresa.
4. Executar smoke de autenticação/gestão base e comprovar persistência correta dos dados mestre.
5. Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.
6. Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `BK-MF1-01`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Movimento de stock com bloqueio de saldo negativo**

```sql
-- BK: BK-MF0-12
BEGIN;

UPDATE stock_saldo
SET quantidade = quantidade + :delta,
    updated_at = NOW()
WHERE empresa_id = :empresa_id
  AND artigo_id = :artigo_id;

-- Negativo controlado
DO $$
DECLARE q numeric;
BEGIN
  SELECT quantidade INTO q
  FROM stock_saldo
  WHERE empresa_id = :empresa_id AND artigo_id = :artigo_id;
  IF q < 0 THEN
    RAISE EXCEPTION 'Saldo negativo nao permitido no BK BK-MF0-12';
  END IF;
END $$;

COMMIT;
```

Executar em transacao para preservar integridade do inventario e impedir estados invalidos apos movimento.

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
