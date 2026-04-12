# Distribuição de Responsabilidades

## Header
- `doc_id`: `DISTRIBUICAO-RESPONSABILIDADES`
- `path`: `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Equipa e Carga Alvo Semanal
| Pessoa | Perfil dominante | Carga alvo (pts/semana) |
| :-- | :-- | --: |
| Oleksii | Backend core, segurança, integração crítica | 9 |
| André | Backend médio-alto, tesouraria, workflows | 7 |
| Pedro | Implementação técnica média e suporte transversal | 6 |
| Sofia | UX, reporting visual, gestão documental e coordenação | 4 |

## Regras Principais
- Cada BK tem owner único e apoio obrigatório (owner != apoio).
- Estados operacionais mantêm-se em `TODO` até pedido explícito de alteração.
- Dependências só podem apontar para BK existentes no backlog canónico.
- Conflitos documentais seguem a precedência definida no README de planificação.

## Matriz por Área
| Área | Owner primário | Backup/Apoio |
| :-- | :-- | :-- |
| Segurança / governance técnica | Oleksii | André |
| Operações comerciais | André | Pedro |
| Contabilidade e compliance crítica | Oleksii | Pedro |
| Tesouraria e fluxos avançados | André | Oleksii |
| Integrações e auditoria operacional | André | Pedro |
| Dashboards e UX de leitura | Sofia | Pedro |
| Documentação e handoff pedagógico | Sofia | André |

## Matriz por Artefacto
| Artefacto | Responsável |
| :-- | :-- |
| PLANO-IMPLEMENTACAO-TOTAL | Nuno + owner stream da macro |
| BACKLOG-MVP / MF-VIEWS | Sofia + owners dos BK |
| Guias BK (conteúdo técnico) | Owner do BK |
| Plano de sprints e KPI | Nuno + Sofia |

## Cerimónias
- Weekly planning: seleção de BK por macro/sprint e revisão de bloqueios.
- Weekly sync técnico: revisão de dependências e riscos de integração.
- Review pedagógica: validação de evidências (`pr`, `proof`, `neg`) por amostragem.

## Fluxo de Atribuição e Fecho de BK
1. Seleção do BK pelo backlog (P0>P1>P2 + desbloqueio).
2. Confirmação owner/apoio e critérios de aceite.
3. Execução com checklist Smoke/Negativos/Técnico.
4. Handoff com evidence para PR/defesa.
5. Fecho documental (backlog, MF-VIEWS e guia consistentes).

## Papel do Orientador
- Nuno valida coerência da planificação, prioridade e rastreabilidade final.
- Nuno aprova exceções de estado, alterações de dependências e replaneamento macro.

## Changelog

- `2026-04-12`: Documento de responsabilidades inicial criado.
