# BK-MF6-01 - Upload de documentos com **OCR** (ler NIF, data, total, IVA).

## Header
- `doc_id`: `GUIA-BK-MF6-01`
- `bk_id`: `BK-MF6-01`
- `macro`: `MF6`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforço`: `L`
- `dependências`: `BK-MF3-08`
- `rf_rnf`: `RF41`
- `last_updated`: `2026-04-12`

## O que vamos fazer neste BK
Neste BK vamos entregar `Upload de documentos com **OCR** (ler NIF, data, total, IVA).` com resultado observável e verificável em review, alinhado com `RF41` e com os critérios de aceite definidos neste guia.

A execução decorre em `Fase 3` dentro de `MF6` e respeita as dependências `BK-MF3-08`. Qualquer detalhe técnico não especificado nesta fase fica `a definir no BK dependente`.

## Porque isto é importante
- Impacto funcional: este BK materializa `Upload de documentos com **OCR** (ler NIF, data, total, IVA).` no produto OPSA.
- Impacto técnico/arquitetural: consolida capacidades da macro `MF6` com rastreabilidade para `RF41`.
- Impacto na sequência: desbloqueia a progressão para `BK-MF6-02`.
- Risco de execução incorreta: falhas aqui propagam inconsistências para backlog, validação e defesa.

## O que entra (scope)
- Definir tarefas executáveis para `Upload de documentos com **OCR** (ler NIF, data, total, IVA).` com owner e apoio claros.
- Implementar o incremento mínimo verificável desta entrega.
- Validar critérios funcionais e técnicos com evidência objetiva.
- Documentar resultados no backlog e guia BK sem divergências.

## O que não entra (scope-out)
- Trabalho de BKs seguintes, incluindo `BK-MF6-02`.
- Refactors amplos fora do objetivo imediato deste BK.
- Integrações sem pré-condições concluídas na cadeia de dependências.

## Como saber que isto ficou bem
- Quando a entrega principal é observável em demonstração, então o critério funcional passa.
- Quando os checks de smoke e negativos executam sem divergências, então a validação passa.
- Quando backlog e guia têm metadados idênticos, então a consistência documental passa.

## Pre-leitura mínima (10-15 min)
- [BACKLOG-MVP](../../backlogs/BACKLOG-MVP.md)
- [PLANO-IMPLEMENTACAO-TOTAL](../../PLANO-IMPLEMENTACAO-TOTAL.md)
- [MF-VIEWS](../../backlogs/MF-VIEWS.md)
- [RF relevante](../../../RF.md)

## Glossário rápido
- `integração`: conceito operativo central para este BK.
- `OCR`: restrição técnica a garantir durante execução.
- `importação`: entidade funcional principal deste domínio.
- `SAF-T`: critério de controlo e validação desta entrega.
- `auditoria`: evidência esperada para handoff e defesa.

## Guia de execução (passo-a-passo)
1. Baseline e dependências
- Objetivo (~10 min): confirmar pré-condições e dependências do BK.
- Justificação: evita bloqueios tardios e retrabalho.
- Como fazer: validar o BK no BACKLOG-MVP e confirmar dependências resolvidas.
- O que verificar: dependências existentes e sem referências inválidas.

2. Decomposição de tarefas
- Objetivo (~15 min): dividir o BK em tarefas pequenas e auditáveis.
- Justificação: melhora previsibilidade e handoff.
- Como fazer: criar checklist curta de execução por resultado observável.
- O que verificar: cada tarefa tem saída concreta e validável.

3. Desenho da solução
- Objetivo (~20 min): definir abordagem mínima para cumprir scope.
- Justificação: reduz risco de scope creep e decisões ad-hoc.
- Como fazer: fixar fluxo, pontos críticos e limites do BK.
- O que verificar: decisões não cobertas ficam a definir no BK dependente.

4. Primeiro incremento
- Objetivo (~25 min): entregar versão inicial funcional do BK.
- Justificação: permite validação precoce.
- Como fazer: implementar o núcleo de maior valor primeiro.
- O que verificar: comportamento principal reproduzível em smoke.

5. Fecho de casos principais
- Objetivo (~20 min): cobrir fluxos normais e estados esperados.
- Justificação: garante estabilidade do caso de uso principal.
- Como fazer: testar cenários de sucesso com dados representativos.
- O que verificar: resultados alinhados com RF/RNF do BK.

6. Negativos e estabilidade
- Objetivo (~15 min): validar proteção contra entradas inválidas e falhas.
- Justificação: reduz regressões em integração.
- Como fazer: executar pelo menos um negativo relevante e documentar resultado.
- O que verificar: erros controlados e sem quebrar o fluxo principal.

7. Handoff e evidência
- Objetivo (~10 min): concluir com evidência auditável para PR/defesa.
- Justificação: facilita revisão e avaliação pedagógica.
- Como fazer: preencher `pr`, `proof`, `neg` e sincronizar backlog/guia.
- O que verificar: metadados idênticos entre guia e BACKLOG-MVP.

## Snippets de código (evolução)
Neste momento este BK ainda não tem snippet consolidado; os snippets serão adicionados aqui com a evolução do projeto.

## Checklist de validação
### Smoke
- [ ] Fluxo principal executa sem erro bloqueante.
- [ ] Resultado esperado fica observável no artefacto final.

### Negativos
- [ ] Entrada inválida retorna erro controlado e rastreável.
- [ ] Dependência em falta é sinalizada sem corrupção de estado.

### Técnico
- [ ] Backlog e guia mantêm metadados consistentes.
- [ ] Evidência mínima (`pr`, `proof`, `neg`) está preenchida.

## Critérios de aceite
- Entregável principal do BK está concluído e demonstrável.
- Dependências declaradas estão satisfeitas ou justificadas.
- Evidence para PR/defesa está completa e reprodutível.

## Evidence para PR/defesa
- `pr`: link/identificador do PR ou commit associado.
- `proof`: evidência objetiva (captura, log, output de teste).
- `neg`: teste negativo executado, resultado observado e conclusão.

## Próximo BK recomendado
- `BK-MF6-02`
