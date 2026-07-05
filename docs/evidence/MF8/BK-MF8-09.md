# Evidence MF8 / BK-MF8-09

- Projeto: OPSA
- BK: BK-MF8-09
- Tema: documentação técnica mínima
- RF/RNF: RNF30
- Data: YYYY-MM-DD
- Responsável: Pedro
- Apoio: Oleksii

## Artefactos verificados

- Documento técnico: `docs/evidence/MF8/ARQUITETURA-TECNICA-MINIMA.md`
- Gate automático: `apps/api/scripts/check-mf8-technical-docs.mjs`
- Script de package: `test:mf8:technical-docs`

## Comandos executados

| Comando | Critério de sucesso | Evidência a anexar |
| --- | --- | --- |
| `cd apps/api && npm run test:mf8:technical-docs` | Exit code `0`; o documento contém módulos, modelos, fluxos, limites e não promete certificação fiscal ou pagamento real. | Anexar output real do terminal; se falhar, corrigir a secção indicada pelo gate antes de fechar o BK. |
| `cd apps/api && npm run syntax:check` | Exit code `0`; os scripts e ficheiros JavaScript/TypeScript continuam sintaticamente válidos. | Anexar output real do terminal; se falhar, registar o ficheiro e corrigir a sintaxe antes da defesa. |

## Negativos validados

- [ ] Remover `## Limites` falha o gate com erro sobre secção obrigatória.
- [ ] Escrever `certificação fiscal` falha o gate por promessa fora do MVP.

## Handoff para BK-MF8-10

- O documento técnico identifica módulos, modelos e fluxos que os insights devem respeitar.
- A subscrição da MF8 está documentada como simulada e sem pagamento real.
- As limitações contabilísticas estão explícitas antes de avançar para explicabilidade da IA.