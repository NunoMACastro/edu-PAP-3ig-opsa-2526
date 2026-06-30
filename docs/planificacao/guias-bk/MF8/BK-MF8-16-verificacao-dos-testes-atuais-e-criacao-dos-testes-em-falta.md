# BK-MF8-16 - Verificação dos testes atuais e criação dos testes em falta.

## Header
- `doc_id`: `GUIA-BK-MF8-16`
- `bk_id`: `BK-MF8-16`
- `macro`: `MF8`
- `owner`: `Oleksii`
- `apoio`: `Andre`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `-`
- `rf_rnf`: `RNF37`
- `fase_documental`: `Fase 3`
- `sprint`: `S12`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF8-17`
- `guia_path`: `docs/planificacao/guias-bk/MF8/BK-MF8-16-verificacao-dos-testes-atuais-e-criacao-dos-testes-em-falta.md`
- `last_updated`: `2026-06-30`

## Contexto do BK
- Entrega alvo: rever a cobertura de testes existente e criar testes em falta para fluxos críticos antes da execução final.
- Foco tecnico da macro: operacao final, UI, testes finais e fecho para defesa PAP.
- Regra de governanca: não criar testes apenas para aumentar contagem; cada teste deve proteger um fluxo, requisito ou regressão real.

## Bloco pedagogico
### Objetivo
Executar `Verificação dos testes atuais e criação dos testes em falta.` com autonomia técnica, garantindo cobertura do requisito `RNF37` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `MF8`: ensinar a equipa a fechar produto com critérios verificáveis, não apenas com perceção visual de que a app funciona.

### Pre-requisitos
- Rever scripts de teste em `apps/api/package.json` e `apps/web/package.json`, se existirem.
- Rever testes criados até MF7, especialmente contratos, unitários, integração e smokes frontend.
- Listar fluxos críticos: autenticação, empresa ativa, faturação, IVA, balancete, reconciliação, IA/insights, importações/exportações e UI principal.

### Erros comuns
- Criar testes duplicados que validam só a existência de ficheiros.
- Ignorar fluxos críticos sem teste negativo.
- Misturar correção funcional ampla neste BK; correções descobertas devem ser registadas para `BK-MF8-18`.

### Check de compreensao
- [ ] Sei distinguir teste unitário, contrato, integração e smoke.
- [ ] Sei identificar uma lacuna de cobertura ligada a um requisito.
- [ ] Sei criar pelo menos 2 negativos úteis para fluxos críticos.

### Tempo estimado
- `Core`: `45-70 min`.
- `Reforco`: `n/a`.

## Bloco operacional
### Entrada
- BK: `BK-MF8-16`
- Requisito: `RNF37`
- Dependencias: `-`
- Artefactos de referencia: `apps/api/package.json`, `apps/web/package.json`, `docs/evidence/`, `BACKLOG-MVP.md`

### Passos
1. Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `BK-MF8-16` e o requisito `RNF37`.
2. Inventariar comandos de teste existentes no backend e no frontend.
3. Mapear fluxos críticos para testes existentes: unitários, contratos, integração e smoke/UI.
4. Identificar lacunas reais de cobertura, separando ausência de teste de simples falta de documentação.
5. Criar testes em falta com nomes claros e dados controlados, sem usar dados reais ou sensíveis.
6. Executar os testes novos isoladamente e registar output ou falha observada.
7. Atualizar evidence com a lista de testes existentes, lacunas resolvidas e lacunas adiadas.

### Cenarios negativos recomendados
- pedido sem sessão deve falhar de forma controlada;
- empresa ativa ausente deve impedir acesso a dados multiempresa;
- input inválido deve devolver erro validável e mensagem útil.

### Validacao
- [ ] Smoke: testes novos executam isoladamente.
- [ ] Negativos: minimo `2` cenarios com resultado controlado.
- [ ] Tecnico: testes criados protegem fluxo ou requisito concreto.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com output sanitizado.

### Handoff
- Proximo BK recomendado: `BK-MF8-17`
- Registar no handoff: comandos encontrados, testes criados, lacunas restantes e riscos para a execução final.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**Inventário mínimo de cobertura**

Contexto de rastreabilidade: `BK-MF8-16` -> `RNF37`.

```ts
type TestCoverageGap = {
  bkId: 'BK-MF8-16';
  area: 'api' | 'web' | 'integration' | 'smoke';
  flow: string;
  existingTest?: string;
  missingTest?: string;
  status: 'covered' | 'created' | 'deferred';
};

export const coverageGaps: TestCoverageGap[] = [
  {
    bkId: 'BK-MF8-16',
    area: 'api',
    flow: 'empresa ativa em endpoints financeiros',
    missingTest: 'contracts/company-context.test.js',
    status: 'created',
  },
];
```

Usar esta lista para justificar as decisões de cobertura antes da execução final.

## Criterios de aceite
- Comandos de teste atuais inventariados.
- Lacunas críticas identificadas e classificadas.
- Testes em falta prioritários criados ou adiados com justificação.
- Dois cenários negativos executados com evidência objetiva.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Evidence para PR/defesa
- `pr`: link do commit/PR com testes criados.
- `proof`: output dos testes novos ou relatório de cobertura por fluxo.
- `neg`: negativos executados e resultado observado.

## Changelog
- `2026-06-29`: guia genérico criado para a nova etapa de verificação/criação de testes da MF8.

